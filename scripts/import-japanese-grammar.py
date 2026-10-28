#!/usr/bin/env python3
"""Rebuild the two Japanese grammar books from the user's preserved Markdown."""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
FOLDER = ROOT / "database/japanese/grammar"
STANDARD = FOLDER / "01 普通語法背誦.md"
THEMATIC = FOLDER / "02 語法類型整理.md"
DATA = FOLDER / "books.json"
RUNTIME = ROOT / "web/src/js/grammar.js"
STANDARD_MAX_TYPE = 26
BEGIN = "  // BEGIN GENERATED JAPANESE GRAMMAR — scripts/import-japanese-grammar.py\n"
END = "  // END GENERATED JAPANESE GRAMMAR\n"


def plain(value: str) -> str:
    value = re.sub(r"\[([^\]]+)\]\([^\n)]+\)", r"\1", value)
    value = value.replace("**", "")
    return "\n".join(re.sub(r"^> ?", "", line).rstrip() for line in value.splitlines()).strip()


def identity(prefix: str, term: str) -> str:
    # A revised meaning or source position must not reassign another entry's progress.
    return prefix + hashlib.sha256(term.encode()).hexdigest()[:16]


def category(number: int, title: str, prefix: str) -> dict:
    code = f"{prefix}{number:02}"
    return {"id": code, "name": f"類型 {number:02} {title}",
            "subcategories": [{"id": code + ".01", "name": f"類型 {number:02} {title}"}]}


def rich_entry(term: str, body: str, code: str, prefix: str) -> dict:
    sections = body.split("**補充用法與例句**")
    if len(sections) > 1:
        word = rich_entry(term, sections[0], code, prefix)
        for section in sections[1:]:
            supplement = rich_entry(term, section, code, prefix)
            word["explanation"] += "\n\n補充用法：\n" + supplement["explanation"]
            word["pattern"] += "\n\n補充接續：\n" + supplement["pattern"]
            word["examples"].extend(supplement["examples"])
        return word
    notes = "\n".join(line for line in body.splitlines() if line.startswith(">"))
    body = "\n".join(line for line in body.splitlines() if not line.startswith(">"))
    match = re.fullmatch(
        r"\s*\*\*釋義：\*\*(.*?)\n\n\*\*(接續[^*]*?)：\*\*(.*?)\n\n(?=1\. )(.*)",
        body.strip(), re.S,
    )
    if not match:
        raise ValueError(f"Unrecognized grammar fields: {term}")
    meaning, pattern_label, pattern, sentences = match.groups()
    chunks = re.split(r"^(\d+)\. (.+)$", sentences, flags=re.M)
    if chunks[0].strip():
        raise ValueError(f"Unrecognized example introduction: {term}")
    examples = []
    for index in range(1, len(chunks), 3):
        number, sentence, continuation = chunks[index:index + 3]
        if int(number) != len(examples) + 1:
            raise ValueError(f"Nonsequential examples: {term}")
        lines = [plain(line) for line in continuation.splitlines() if line.strip()]
        sentence = plain(sentence)
        # A source example may be an A/B exchange, followed by its Chinese exchange.
        if re.match(r"[A-ZＡ-Ｚ]：", sentence):
            while lines and re.match(r"[A-ZＡ-Ｚ]：", lines[0]) and re.search(r"[ぁ-ゖァ-ヺ]", lines[0]):
                sentence += "\n" + lines.pop(0)
        translation = "\n".join(lines)
        if translation and not all(not line.strip() or line.startswith("    ") for line in continuation.splitlines()):
            raise ValueError(f"Unexpected text after example: {term}")
        examples.append({"text": sentence,
                         "translations": {"zh-Hant": translation} if translation else {}})
    if not examples:
        raise ValueError(f"Missing examples: {term}")
    meaning, pattern = plain(meaning), plain(pattern)
    if pattern_label != "接續":
        pattern = pattern_label + "：\n" + pattern
    return {"id": identity(prefix, term), "category": code, "subcategory": code + ".01",
            "term": plain(term), "meanings": {"zh-Hant": meaning}, "pattern": pattern,
            "explanation": meaning + ("\n\n" + plain(notes) if notes else ""),
            "example": examples[0]["text"], "examples": examples}


def books() -> dict:
    standard_text, thematic_text = STANDARD.read_text(), THEMATIC.read_text()
    theme_chunks = re.split(r"^### 類型 (\d+) (.+)\n", thematic_text, flags=re.M)
    themes = [(int(theme_chunks[i]), theme_chunks[i + 1], theme_chunks[i + 2])
              for i in range(1, len(theme_chunks), 3)]
    declared = re.search(r"共 (\d+) 個類型", thematic_text)
    if not declared or [n for n, _, _ in themes] != list(range(1, int(declared[1]) + 1)):
        raise ValueError("Thematic type count/order differs from the source declaration")
    titles = {n: title for n, title, _ in themes}
    standard_words, by_number = [], {}
    chunks = re.split(r"^### (\d{3}) (.+)\n", standard_text, flags=re.M)
    for i in range(1, len(chunks), 3):
        number, term, body = chunks[i:i + 3]
        if int(number) != len(standard_words) + 1:
            raise ValueError("Standard grammar numbers must be consecutive")
        body, link = body.split("**按類型複習：**", 1)
        type_number = int(re.search(r"\[類型 (\d+)", link)[1])
        word = rich_entry(term, body, f"gj{type_number:02}", "grammar-ja-")
        word["sourceNumber"] = int(number)
        standard_words.append(word)
        by_number[int(number)] = word
    declared = re.search(r"共 (\d+) 個背誦條目", standard_text)
    if not declared or len(standard_words) != int(declared[1]):
        raise ValueError("Standard grammar count differs from the source declaration")

    thematic_words = []
    for number, title, body in themes:
        code = f"gt{number:02}"
        content, notes = body.split("> **備註｜區分方法**", 1)
        notes = plain(notes)
        if not notes:
            raise ValueError(f"Missing comparison notes for type {number}")
        members = []
        introduction = ""
        if number <= 26:
            for line in content.splitlines():
                if not line.startswith("| ["):
                    continue
                match = re.fullmatch(r"\| (.+) \| (.+) \|", line)
                if not match:
                    raise ValueError(f"Malformed reference table: {line}")
                references, hint = match.groups()
                links = re.findall(r"\[([^\]]+)\]\([^\n)]+#(\d{3})-[^)]*\)", references)
                if not links:
                    raise ValueError(f"Missing referenced grammar: {line}")
                for term, source_number in links:
                    word = copy.deepcopy(by_number[int(source_number)])
                    word.update(id=identity(f"grammar-theme-ja-{number:02}-", term), term=term,
                                category=code, subcategory=code + ".01", meanings={"zh-Hant": plain(hint)})
                    members.append(word)
            # Type 26 additionally supplies its own contrast and original examples.
            tail = re.sub(r"^\|.*\n?", "", content, flags=re.M).strip()
            if tail:
                match = re.fullmatch(r"\*\*([^*]+)\*\*\s*\n(.*)", tail, re.S)
                if not match:
                    raise ValueError(f"Unrecognized supplementary section: {number}")
                members.append(rich_entry(match[1], match[2], code, f"grammar-theme-ja-{number:02}-"))
        else:
            sections = re.split(r"^\*\*(\d+)\. (.+)\*\*\s*$", content, flags=re.M)
            introduction = plain(sections[0])
            for i in range(1, len(sections), 3):
                index, term, entry_body = sections[i:i + 3]
                if int(index) != len(members) + 1:
                    raise ValueError(f"Nonsequential thematic entries: {number}")
                members.append(rich_entry(term, entry_body, code, f"grammar-theme-ja-{number:02}-"))
        if not members:
            raise ValueError(f"Empty thematic type: {number}")
        # Keep the supplied group-level comparison once, as a readable study note.
        thematic_words.append({
            "id": f"grammar-theme-ja-{number:02}-notes", "category": code, "subcategory": code + ".01",
            "term": f"類型 {number:02}｜區分方法", "meanings": {"zh-Hant": title},
            "pattern": introduction or "本類語法：" + "、".join(word["term"] for word in members),
            "explanation": notes, "example": "", "examples": [],
        })
        thematic_words.extend(members)

    # Publish disjoint lesson ranges; the full original Markdown stays archived.
    published_themes = [(number, title, body) for number, title, body in themes
                        if number > STANDARD_MAX_TYPE]
    thematic_words = [word for word in thematic_words
                      if int(word["category"][2:]) > STANDARD_MAX_TYPE]
    # Check the later lessons against the full ordinary source before routing.
    source_standard_count = len(standard_words)
    thematic_only = [word for word in standard_words
                     if int(word["category"][2:]) > STANDARD_MAX_TYPE]
    for word in thematic_only:
        target_category = "gt" + word["category"][2:]
        if not any(target["category"] == target_category
                   and all(example in target["examples"] for example in word["examples"])
                   for target in thematic_words):
            raise ValueError(f"Thematic lesson is missing source examples/translations: {word['term']}")
    standard_words = [word for word in standard_words
                      if int(word["category"][2:]) <= STANDARD_MAX_TYPE]
    used = {word["category"] for word in standard_words}
    dictionaries = [
        {"id": "grammar-ja", "kind": "grammar", "grammarMode": "standard", "language": "ja",
         "title": "日語普通語法背誦", "categories": [category(n, title, "gj") for n, title, _ in themes if f"gj{n:02}" in used],
         "words": standard_words},
        {"id": "grammar-theme-ja", "kind": "grammar", "grammarMode": "thematic", "language": "ja",
         "title": "日語語法類型整理", "categories": [category(n, title, "gt") for n, title, _ in published_themes],
         "words": thematic_words},
    ]
    for dictionary in dictionaries:
        words = dictionary["words"]
        if len({word["id"] for word in words}) != len(words):
            raise ValueError(f"Duplicate grammar identity: {dictionary['id']}")
        for word in words:
            for field, limit in [("term", 180), ("pattern", 2000), ("explanation", 6000)]:
                if len(word[field]) > limit:
                    raise ValueError(f"Grammar field exceeds client limits: {word['id']}/{field}")
            if len(word["meanings"]["zh-Hant"]) > 1600 or len(word["examples"]) > 20:
                raise ValueError(f"Grammar detail exceeds client limits: {word['id']}")
    return {"schemaVersion": 1,
            "sources": [{"path": path.name, "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}
                        for path in (STANDARD, THEMATIC)],
            "sourceStandardEntryCount": source_standard_count,
            "standardMaxType": STANDARD_MAX_TYPE,
            "sourceThematicTypeCount": len(themes),
            "thematicMinType": STANDARD_MAX_TYPE + 1,
            "thematicOnlyStandardEntryCount": len(thematic_only),
            "standardEntryCount": len(standard_words), "thematicTypeCount": len(published_themes),
            "thematicStudyEntryCount": len(thematic_words),
            "thematicComparisonNoteCount": len(published_themes), "dictionaries": dictionaries}


def outputs() -> dict[Path, bytes]:
    data = books()
    text = RUNTIME.read_text()
    start = text.index(BEGIN) + len(BEGIN)
    end = text.index(END, start)
    generated = "  const japaneseCatalog = " + json.dumps(data["dictionaries"], ensure_ascii=False, indent=2).replace("\n", "\n  ") + ";\n"
    return {DATA: (json.dumps(data, ensure_ascii=False, indent=2) + "\n").encode(),
            RUNTIME: (text[:start] + generated + text[end:]).encode()}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    for path, content in outputs().items():
        if args.check:
            if not path.is_file() or path.read_bytes() != content:
                raise ValueError(f"Stale Japanese grammar: {path.relative_to(ROOT)}; run scripts/import-japanese-grammar.py")
        else:
            path.write_bytes(content)
    data = books()
    print(f"{'Verified' if args.check else 'Imported'} Japanese grammar: {data['standardEntryCount']} ordinary entries; "
          f"{data['thematicTypeCount']} thematic types, {data['thematicStudyEntryCount']} study entries including comparison notes.")


if __name__ == "__main__":
    main()
