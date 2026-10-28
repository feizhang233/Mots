#!/usr/bin/env python3
"""Reject vocabulary drift before a database or website release can be activated."""
import copy
import importlib.util
import json
from pathlib import Path
import re
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
            if language == "ja":
                self.assertEqual(len(standard["words"]), 141)
                self.assertEqual([category["id"] for category in standard["categories"]],
                                 [f"gj{number:02}" for number in range(1, 27)])
                self.assertTrue(all(int(word["category"][2:]) <= 26 for word in standard["words"]))
                self.assertEqual(len(thematic["words"]), 229)
                self.assertEqual([category["id"] for category in thematic["categories"]],
                                 [f"gt{number:02}" for number in range(27, 44)])
                self.assertTrue(all(int(word["category"][2:]) >= 27 for word in thematic["words"]))
                self.assertTrue({int(category["id"][2:]) for category in standard["categories"]}.isdisjoint(
                    int(category["id"][2:]) for category in thematic["categories"]))
                self.assertTrue(set(word["id"] for word in standard["words"]).isdisjoint(word["id"] for word in thematic["words"]))
            else:
                self.assertEqual(thematic["words"], [], "French/German thematic books still await their own sources")
                self.assertEqual(thematic["categories"], [])

    def test_japanese_grammar_preserves_published_source_examples_and_comparisons(self):
        folder = ROOT / "database/japanese/grammar"
        data = json.loads((folder / "books.json").read_text())
        ordinary, thematic = data["dictionaries"]
        self.assertEqual(data["sourceStandardEntryCount"], 186)
        self.assertEqual(data["standardMaxType"], 26)
        self.assertEqual(data["thematicOnlyStandardEntryCount"], 45)
        self.assertEqual(data["sourceThematicTypeCount"], 43)
        self.assertEqual(data["thematicMinType"], 27)
        self.assertEqual(data["thematicTypeCount"], 17)
        plain = lambda text: text.replace("**", "").strip()
        for filename, dictionary in [("01 普通語法背誦.md", ordinary), ("02 語法類型整理.md", thematic)]:
            text = (folder / filename).read_text()
            if dictionary is thematic:
                text = "### 類型 27 " + text.split("### 類型 27 ", 1)[1]
            examples = [plain(match[1]) for match in re.finditer(r"^\d+\. (.+)$", text, re.M)]
            # The ordinary source stays intact; lessons 27+ are now studied in
            # the thematic book, which already contains their original examples.
            preserved = dictionary["words"] + (thematic["words"] if dictionary is ordinary else [])
            imported = [example["text"] for word in preserved for example in word["examples"]]
            self.assertTrue(all(any(value == sentence or value.startswith(sentence + "\n") for value in imported) for sentence in examples), filename)
            if dictionary is ordinary:
                self.assertEqual(len(examples), 378)
                self.assertEqual(sum(len(word["examples"]) for word in ordinary["words"]), 288)
                translations = [plain(line) for line in text.splitlines() if line.startswith("    ") and line.strip() and not re.search(r"[ぁ-ゖァ-ヺ]", line)]
                imported_translations = {line for word in preserved for example in word["examples"]
                                         if example["translations"]
                                         for line in example["translations"]["zh-Hant"].splitlines()}
                self.assertTrue(set(translations) <= imported_translations)
        notes = [word for word in thematic["words"] if word["id"].endswith("-notes")]
        self.assertEqual(len(notes), 17)
        raw_notes = re.findall(r"^> \*\*備註｜區分方法\*\*(.*?)(?=^### |\Z)", (folder / "02 語法類型整理.md").read_text(), re.M | re.S)
        self.assertEqual(len(raw_notes), 43, "Original Markdown remains intact")
        for word, raw in zip(notes, raw_notes[26:]):
            expected = "\n".join(re.sub(r"^> ?", "", line).rstrip() for line in raw.replace("**", "").splitlines()).strip()
            self.assertEqual(word["explanation"], expected)
        by_number = {word["sourceNumber"]: word for word in ordinary["words"]}
        for number in (24, 59, 68):
            self.assertEqual(len(by_number[number]["examples"]), 4, "Supplementary examples must survive import")
            self.assertIn("補充接續", by_number[number]["pattern"])
        self.assertIn("較正式、偏書面語", by_number[51]["explanation"])
        self.assertIn("B：旅行といえば、パスポート", by_number[65]["examples"][1]["text"])
        self.assertNotIn("パスポート", by_number[65]["examples"][1]["translations"]["zh-Hant"])

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
            self.assertEqual(books[f"grammar-theme-{language}"]["entryCount"], 229 if language == "ja" else 0)
        for name in ("01 普通語法背誦.md", "02 語法類型整理.md", "books.json"):
            path = "database/japanese/grammar/" + name
            self.assertEqual(manifest["files"][path], sync_data.sha((ROOT / path).read_bytes()))


if __name__ == "__main__":
    unittest.main(verbosity=2)
