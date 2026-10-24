#!/usr/bin/env python3
"""Reject vocabulary drift before a database or website release can be activated."""
import copy
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("sync_data", ROOT / "scripts/sync-data.py")
sync_data = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync_data)


class DataSyncTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.words = []
        for path in sorted((ROOT / "database").glob("unit*/*.json")):
            cls.words.extend(json.loads(path.read_text())["words"])

    def test_all_database_sources_match_web_fields(self):
        result = sync_data.validate_database(ROOT, self.words)
        self.assertEqual(result, {"unitCount": 16, "entryCount": 3846, "sourceFiles": 32})

    def test_changed_meaning_is_rejected_even_when_id_is_preserved(self):
        changed = copy.deepcopy(self.words)
        changed[0]["chinese"] = "unexpected change"
        with self.assertRaisesRegex(ValueError, "Web/database vocabulary differs"):
            sync_data.validate_database(ROOT, changed)

    def test_duplicate_word_identity_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "Duplicate vocabulary IDs"):
            sync_data.validate_database(ROOT, self.words + [self.words[0]])

    def test_changed_xlsx_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            shutil.copytree(ROOT / "database", root / "database", ignore=shutil.ignore_patterns("runtime", "catalog.json", "content-version.json"))
            path = next((root / "database").glob("unit*/*.xlsx"))
            path.write_bytes(path.read_bytes() + b"drift")
            with self.assertRaisesRegex(ValueError, "Database manifest mismatch"):
                sync_data.validate_database(root, self.words)

    def test_unlisted_source_cannot_be_published_silently(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            shutil.copytree(ROOT / "database", root / "database", ignore=shutil.ignore_patterns("runtime", "catalog.json", "content-version.json"))
            (root / "database/unit1/unlisted.json").write_text("{}")
            with self.assertRaisesRegex(ValueError, "does not cover every unit"):
                sync_data.validate_database(root, self.words)

    def test_grammar_books_match_web_and_native_without_vocabulary_audio(self):
        native = json.loads((ROOT / "mobile/ios/Mots/Resources/catalog.json").read_text())
        shared = json.loads((ROOT / "database/catalog.json").read_text())
        self.assertEqual(native, shared)
        javascript = "const fs=require('node:fs'),vm=require('node:vm');const c=vm.createContext({window:{}});vm.runInContext(fs.readFileSync(process.argv[1],'utf8'),c);process.stdout.write(JSON.stringify(c.window.MotsGrammar.builtins()));"
        source = json.loads(subprocess.check_output(["node", "-e", javascript, str(ROOT / "web/src/js/grammar.js")]))
        books = {dictionary["id"]: dictionary for dictionary in native}
        self.assertEqual({dictionary["id"] for dictionary in source}, {
            f"grammar-{prefix}{language}"
            for prefix in ("", "theme-") for language in ("fr", "de", "ja")
        })
        self.assertEqual(len(books), 9)
        self.assertEqual(len(books), len(native), "Dictionary identities must remain unique")
        for dictionary in source:
            generated = books[dictionary["id"]]
            with self.subTest(dictionary=dictionary["id"]):
                self.assertEqual(generated["kind"], "grammar")
                self.assertEqual(generated.get("grammarMode", "standard"), dictionary.get("grammarMode", "standard"))
                self.assertEqual(generated["language"], dictionary["language"])
                self.assertEqual(generated["categories"], dictionary["categories"])
                self.assertEqual([word["id"] for word in generated["words"]], [word["id"] for word in dictionary["words"]])
                for expected, actual in zip(dictionary["words"], generated["words"]):
                    for field in ("term", "example", "examples", "pattern", "explanation", "category", "subcategory"):
                        self.assertEqual(actual[field], expected[field], f"{dictionary['id']}/{expected['id']}: {field}")
                    self.assertEqual(actual["meaning"], expected["meanings"]["zh-Hant"])
                    self.assertIsNone(actual["audio"], "A grammar entry must use device speech, not another book's clip")

        for language in ("fr", "de", "ja"):
            standard, thematic = books[f"grammar-{language}"], books[f"grammar-theme-{language}"]
            self.assertEqual(standard.get("grammarMode", "standard"), "standard")
            self.assertGreater(len(standard["words"]), 0, "Existing standard grammar content must remain intact")
            self.assertEqual(thematic["grammarMode"], "thematic")
            self.assertEqual(thematic["words"], [], "The new thematic book awaits its own import, not a copy of standard content")
            self.assertEqual(thematic["categories"], [])

    def test_content_version_tracks_grammar_source_and_book_kind(self):
        snapshot = sync_data.snapshot(ROOT)
        manifest = json.loads(snapshot[ROOT / "database/content-version.json"])
        self.assertEqual(manifest["files"]["web/src/js/grammar.js"], sync_data.sha((ROOT / "web/src/js/grammar.js").read_bytes()))
        books = {dictionary["id"]: dictionary for dictionary in manifest["dictionaries"]}
        for language in ("fr", "de", "ja"):
            self.assertEqual(books[language]["kind"], "vocabulary")
            self.assertNotIn("grammarMode", books[language])
            self.assertEqual(books[f"grammar-{language}"]["kind"], "grammar")
            self.assertEqual(books[f"grammar-{language}"]["grammarMode"], "standard")
            self.assertGreater(books[f"grammar-{language}"]["entryCount"], 0)
            self.assertEqual(books[f"grammar-theme-{language}"]["kind"], "grammar")
            self.assertEqual(books[f"grammar-theme-{language}"]["grammarMode"], "thematic")
            self.assertEqual(books[f"grammar-theme-{language}"]["entryCount"], 0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
