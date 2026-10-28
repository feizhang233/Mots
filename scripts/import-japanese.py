#!/usr/bin/env python3
"""Reproduce the Japanese dictionary from its preserved two-column Markdown source."""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "database/japanese/source.md"
VOCABULARY = ROOT / "database/japanese/vocabulary.json"
EXAMPLES = ROOT / "database/japanese/examples.json"
SCENARIOS = ROOT / "database/japanese/scenarios.json"
LANGUAGES = ROOT / "web/src/js/languages.js"


def dictionary() -> dict:
    source = SOURCE.read_text(encoding="utf-8")
    rows = []
    for line in source.splitlines():
        if not line.startswith("|"):
            continue
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if cells[0] == "詞彙（讀音）" or re.fullmatch(r"[-: ]+", cells[0]):
            continue
        if len(cells) != 4 or not all(cells):
            raise ValueError("Expected four nonempty cells per vocabulary row")
        rows.append(cells)
    words = []
    for column in (0, 2):
        for row in rows:
            display, meaning = row[column:column + 2]
            match = re.fullmatch(r"(.+)（([^（）]+)）", display)
            if not match:
                raise ValueError(f"Missing Japanese reading: {display}")
            headword, reading = match.groups()
            identity = headword.replace("〔待確認〕", "") + "\0" + reading
            words.append({
                "id": "ja-vocab-" + hashlib.sha256(identity.encode()).hexdigest()[:12],
                "category": "1", "subcategory": "1.01",
                "term": display, "headword": headword, "reading": reading,
                "meanings": {"zh-Hant": meaning}, "example": "",
            })
    declared = re.search(r"共\s*(\d+)\s*個詞條", source)
    if not declared or len(words) != int(declared.group(1)):
        raise ValueError("Japanese entry count differs from Markdown declaration")
    if len({word["id"] for word in words}) != len(words):
        raise ValueError("Duplicate Japanese vocabulary identity")
    scenarios = json.loads(SCENARIOS.read_text(encoding="utf-8"))
    if scenarios.get("schemaVersion") != 1 or scenarios.get("dictionaryId") != "ja":
        raise ValueError("Invalid Japanese scenario source")
    categories = []
    assignments = {}
    for index, scenario in enumerate(scenarios["categories"], 1):
        identifier = str(index)
        if scenario["id"] != identifier or not scenario["name"].strip() or not scenario["wordIds"]:
            raise ValueError("Japanese scenarios must have ordered IDs, names and words")
        subcategory = identifier + ".01"
        categories.append({"id": identifier, "name": scenario["name"],
                           "subcategories": [{"id": subcategory, "name": "全部詞彙"}]})
        for word_id in scenario["wordIds"]:
            if word_id in assignments:
                raise ValueError(f"Japanese word assigned more than once: {word_id}")
            assignments[word_id] = (identifier, subcategory)
    if len(categories) != 10 or set(assignments) != {word["id"] for word in words}:
        raise ValueError("Ten Japanese scenarios must cover every source word exactly once")
    for word in words:
        word["category"], word["subcategory"] = assignments[word["id"]]
    supplement = json.loads(EXAMPLES.read_text(encoding="utf-8"))
    examples = supplement["entries"]
    by_id = {entry["id"]: entry for entry in examples}
    if (len(examples) != len(words) or len(by_id) != len(examples)
            or set(by_id) != {word["id"] for word in words}):
        raise ValueError("Japanese examples must cover every source word exactly once")
    if len({entry["example"] for entry in examples}) != len(examples):
        raise ValueError("Duplicate Japanese example sentences")
    for word in words:
        entry = by_id[word["id"]]
        if entry["headword"] != word["headword"]:
            raise ValueError(f"Example headword differs: {word['id']}")
        for key in ("example", "translation"):
            value = entry[key]
            if not isinstance(value, str) or not value.strip() or value != value.strip() or len(value) > 500:
                raise ValueError(f"Invalid Japanese example {key}: {word['id']}")
        word["example"] = entry["example"]
        word["examples"] = [{"text": entry["example"], "translations": {"zh-Hant": entry["translation"]}}]
    return {
        "id": "ja", "title": "日語詞彙總表", "language": "ja",
        "entryCount": len(words), "sourceFile": "source.md",
        "sourceSHA256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
        "readingOrder": "left-column-top-to-bottom-then-right-column",
        "notes": "保留原表讀音、釋義及待確認標記；原表未提供詞性。例句及繁體中文翻譯為另行編寫的學習補充，非原表內容。",
        "examplesFile": "examples.json",
        "examplesSHA256": hashlib.sha256(EXAMPLES.read_bytes()).hexdigest(),
        "scenariosFile": "scenarios.json",
        "scenariosSHA256": hashlib.sha256(SCENARIOS.read_bytes()).hexdigest(),
        "categories": categories,
        "words": words,
    }


def outputs() -> dict[Path, bytes]:
    data = dictionary()
    languages = LANGUAGES.read_text(encoding="utf-8")
    marker = "  window.MOTS_JAPANESE_CATEGORIES = "
    start = languages.find(marker)
    end = languages.index("  window.MOTS_EXTRA_BANKS = {")
    if start == -1:
        start = end
    metadata = json.dumps(data["categories"], ensure_ascii=False, indent=2)
    metadata = "\n".join("  " + line for line in metadata.splitlines())
    languages = languages[:start] + marker + metadata.strip() + ";\n" + languages[end:]
    start = languages.index("    ja: [")
    end = languages.index("\n  };\n  const conversion", start)
    bank = json.dumps(data["words"], ensure_ascii=False, indent=2)
    bank = "\n".join("    " + line for line in bank.splitlines())
    languages = languages[:start] + "    ja: " + bank.strip() + "," + languages[end:]
    return {
        VOCABULARY: (json.dumps(data, ensure_ascii=False, indent=2) + "\n").encode(),
        LANGUAGES: languages.encode(),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    for path, content in outputs().items():
        if args.check:
            if not path.is_file() or path.read_bytes() != content:
                raise ValueError(f"Japanese source differs: {path.relative_to(ROOT)}; run scripts/import-japanese.py")
        else:
            path.write_bytes(content)
    print(f"{'Verified' if args.check else 'Imported'} {len(dictionary()['words'])} Japanese entries in source column order.")


if __name__ == "__main__":
    main()
