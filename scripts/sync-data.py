#!/usr/bin/env python3
"""Bind exchange files, web data and the native catalog to one checked snapshot."""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parent.parent


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def validate_database(root: Path, runtime: list[dict]) -> dict:
    database = root / "database"
    manifest = json.loads((database / "manifest.json").read_text())
    words = []
    listed = set()
    total_bytes = 0
    counts = {"json": 0, "xlsx": 0}
    for unit in manifest["units"]:
        unit_words = None
        for item in unit["files"]:
            path = (database / item["path"]).resolve()
            if not path.is_relative_to(database.resolve()) or not path.is_file():
                raise ValueError(f"Invalid database path: {item['path']}")
            if item["path"] in listed:
                raise ValueError(f"Duplicate database path: {item['path']}")
            listed.add(item["path"])
            data = path.read_bytes()
            if len(data) != item["bytes"] or sha(data) != item["sha256"]:
                raise ValueError(f"Database manifest mismatch: {item['path']}")
            total_bytes += len(data)
            counts[item["format"]] += 1
            if item["format"] == "json":
                if unit_words is not None:
                    raise ValueError("A unit must have exactly one JSON source")
                source = json.loads(data)
                unit_words = source["words"]
                if source["entryCount"] != len(unit_words):
                    raise ValueError(f"Database entry count mismatch: {item['path']}")
        if unit_words is None or len(unit_words) != unit["entryCount"]:
            raise ValueError(f"Database unit count mismatch: {unit['unit']}")
        if any(str(word["category"]) != str(unit["unit"]) for word in unit_words):
            raise ValueError(f"Database unit identity mismatch: {unit['unit']}")
        words.extend(unit_words)
    actual = {p.relative_to(database).as_posix() for p in database.glob("unit*/*") if p.suffix in {".json", ".xlsx"}}
    if listed != actual or len(manifest["units"]) != manifest["unitCount"]:
        raise ValueError("Database manifest does not cover every unit source")
    if counts != {"json": manifest["jsonFileCount"], "xlsx": manifest["xlsxFileCount"]} or total_bytes != manifest["totalFileBytes"]:
        raise ValueError("Database file totals mismatch")
    by_id = {word["id"]: word for word in words}
    web_by_id = {word["id"]: word for word in runtime}
    if len(by_id) != len(words) or len(web_by_id) != len(runtime):
        raise ValueError("Duplicate vocabulary IDs")
    if len(words) != manifest["entryCount"] or by_id != web_by_id:
        differences = sorted(key for key in by_id.keys() | web_by_id.keys() if by_id.get(key) != web_by_id.get(key))
        raise ValueError(f"Web/database vocabulary differs: {differences[:5]}")
    return {"unitCount": len(manifest["units"]), "entryCount": len(words), "sourceFiles": len(listed)}


def snapshot(root: Path) -> dict[Path, bytes]:
    javascript = "const fs=require('node:fs'),vm=require('node:vm');const c=vm.createContext({window:{}});vm.runInContext(fs.readFileSync(process.argv[1],'utf8'),c);process.stdout.write(JSON.stringify(c.window.WORDS));"
    runtime = json.loads(subprocess.check_output(["node", "-e", javascript, str(root / "database/runtime/data.js")]))
    totals = validate_database(root, runtime)
    catalog = (root / "mobile/ios/Mots/Resources/catalog.json").read_bytes()
    hashes = {name: sha((root / name).read_bytes()) for name in ["database/runtime/data.js", "database/runtime/extra-audio.js", "database/runtime/audio-manifest.js", "database/manifest.json", "database/japanese/source.md", "database/japanese/vocabulary.json", "database/japanese/examples.json", "web/src/js/languages.js", "web/src/js/dictionaries.js", "web/src/js/grammar.js"]}
    hashes["database/catalog.json"] = sha(catalog)
    version = sha(json.dumps(hashes, sort_keys=True, separators=(",", ":")).encode())
    dictionaries = []
    for dictionary in json.loads(catalog):
        kind = dictionary.get("kind", "vocabulary")
        metadata = {"id": dictionary["id"], "kind": kind,
                    "language": dictionary["language"], "entryCount": len(dictionary["words"])}
        if kind == "grammar":
            mode = dictionary.get("grammarMode", "standard")
            if mode not in {"standard", "thematic"}:
                raise ValueError(f"Invalid grammar book mode: {dictionary['id']}")
            metadata["grammarMode"] = mode
        dictionaries.append(metadata)
    manifest = {"schemaVersion": 1, "version": version, "catalogPath": "/database/catalog.json", "catalogSHA256": sha(catalog), "dictionaries": dictionaries, "database": totals, "files": hashes}
    return {root / "database/catalog.json": catalog, root / "database/content-version.json": (json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode()}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    subprocess.run(["python3", str(ROOT / "scripts/import-japanese.py"), "--check"], check=True)
    command = ["node", str(ROOT / "mobile/ios/scripts/export-content.cjs")]
    if args.check:
        command += ["--check", "--catalog-only"]
    subprocess.run(command, check=True)
    outputs = snapshot(ROOT)
    for path, data in outputs.items():
        if args.check:
            if not path.is_file() or path.read_bytes() != data:
                raise ValueError(f"Run make build; stale data snapshot: {path.relative_to(ROOT)}")
        else:
            path.write_bytes(data)
    manifest = json.loads(outputs[ROOT / "database/content-version.json"])
    print(f"Data synchronized: {manifest['version'][:16]}; {manifest['database']['entryCount']} French entries, {manifest['database']['sourceFiles']} source files; native/web catalog matches.")


if __name__ == "__main__":
    main()
