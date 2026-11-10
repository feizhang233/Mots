"""Bounded, canonical vocabulary content records, separate from learning progress."""

import json
import re
import unicodedata

from .protocol import DEVICE, MAX_CLOCK, MAX_RECORDS, RESERVED, SyncError, identifier

MAX_CONTENT_BYTES = 24 * 1024 * 1024
MAX_CONTENT_RECORD_BYTES = 256 * 1024
CONTENT_FIELDS = {"dictionaryID", "kind", "wordID", "clock", "deviceID", "deleted", "payload"}
LANGUAGES = {"fr", "de", "ja"}
MEANING_LANGUAGES = {"zh-Hant", "zh-Hans", "en", "fr", "de", "ja"}
META_FIELDS = {"id", "title", "language", "kind", "grammarMode", "categories",
               "audioMode", "description", "sourceInfo", "entryCount", "archived"}
WORD_FIELDS = {"id", "term", "meaning", "meanings", "example", "examples", "category",
               "subcategory", "language", "audio", "part", "pattern", "explanation",
               "reading", "headword", "order"}


def canonical_json(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False)


def encoded_bytes(value):
    # Match the actual UTF-8 HTTP representation, including the whole envelope.
    return len(json.dumps(value, ensure_ascii=False, separators=(",", ":"), allow_nan=False).encode("utf-8"))


def content_rank(record):
    return record["clock"], record["deviceID"], int(record["deleted"]), canonical_json(record["payload"])


def _fail(message="Invalid content record"):
    raise SyncError(400, message)


def _object(value, allowed=None):
    if not isinstance(value, dict) or any(key in RESERVED for key in value):
        _fail("Invalid content object")
    if allowed is not None and set(value) - allowed:
        _fail("Unsupported content field")
    return value


def _text(value, maximum, *, required=False, single_line=False):
    if not isinstance(value, str) or len(value) > maximum or (required and not value.strip()):
        _fail("Invalid content text")
    if any(unicodedata.category(char) == "Cs" or
           (unicodedata.category(char) == "Cc" and (single_line or char not in "\n\r\t"))
           for char in value):
        _fail("Invalid content text")
    return value


def _id(value, maximum=256):
    if not identifier(value, maximum):
        _fail("Invalid content identity")
    return value


def _enum(value, choices):
    if not isinstance(value, str) or value not in choices:
        _fail("Invalid content type")
    return value


def _categories(value):
    if not isinstance(value, list) or len(value) > 100:
        _fail("Invalid content categories")
    parents, children, result = set(), set(), []
    for item in value:
        item = _object(item, {"id", "name", "subcategories"})
        parent = _id(item.get("id"), 128)
        if parent in parents:
            _fail("Duplicate category identity")
        parents.add(parent)
        subs = item.get("subcategories")
        if not isinstance(subs, list) or not subs:
            _fail("Invalid content subcategories")
        normalized = []
        for sub in subs:
            sub = _object(sub, {"id", "name"})
            child = _id(sub.get("id"))
            if child in children or len(children) >= 300:
                _fail("Duplicate or excessive subcategory identity")
            children.add(child)
            normalized.append({"id": child, "name": _text(sub.get("name"), 80, required=True)})
        result.append({"id": parent, "name": _text(item.get("name"), 80, required=True),
                       "subcategories": normalized})
    return result


def normalized_metadata(payload, dictionary):
    value = _object(payload, META_FIELDS)
    if _id(value.get("id"), 128) != dictionary:
        _fail("Dictionary payload identity differs")
    kind = _enum(value.get("kind", "vocabulary"), {"vocabulary", "grammar"})
    mode = _enum(value.get("grammarMode", "standard"), {"standard", "thematic"})
    if kind != "grammar" and mode != "standard":
        _fail("Vocabulary cannot use thematic grammar mode")
    result = {"id": dictionary, "title": _text(value.get("title"), 80, required=True),
              "language": _enum(value.get("language"), LANGUAGES), "kind": kind,
              "grammarMode": mode, "categories": _categories(value.get("categories"))}
    if "audioMode" in value:
        result["audioMode"] = _enum(value["audioMode"], {"speech"})
    if "description" in value:
        result["description"] = _text(value["description"], 2000)
    if "sourceInfo" in value:
        source = _text(value["sourceInfo"], 256, single_line=True)
        if (not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._/-]*", source, flags=re.ASCII)
                or ".." in source.split("/")):
            _fail("Invalid content source link")
        result["sourceInfo"] = source
    if "entryCount" in value:
        if type(value["entryCount"]) is not int or not 0 <= value["entryCount"] <= MAX_RECORDS:
            _fail("Invalid content entry count")
        result["entryCount"] = value["entryCount"]
    if "archived" in value:
        if type(value["archived"]) is not bool:
            _fail("Invalid dictionary archive state")
        result["archived"] = value["archived"]
    return result


def _examples(value, legacy):
    if not isinstance(value, list) or len(value) > 20:
        _fail("Invalid content examples")
    result, positions = [], {}
    for item in ([{"text": legacy}] if legacy else []) + value:
        item = {"text": item} if isinstance(item, str) else _object(item, {"text", "translations", "furigana"})
        sentence = _text(item.get("text"), 2000, required=True)
        translations = _object(item.get("translations", {}), MEANING_LANGUAGES)
        translations = {key: _text(text, 2000) for key, text in translations.items() if text != ""}
        normalized = {"text": sentence, "translations": translations}
        if "furigana" in item:
            segments = item["furigana"]
            if not isinstance(segments, list) or len(segments) > 2000:
                _fail("Invalid example reading alignment")
            checked = []
            for segment in segments:
                segment = _object(segment, {"text", "reading"})
                text = _text(segment.get("text"), 2000)
                if not text:
                    _fail("Invalid example reading alignment")
                reading = _text(segment.get("reading"), 2000)
                if reading and (not re.fullmatch(r"[ぁ-ゖァ-ヶー]+", reading)
                                or not re.fullmatch(r"[一-龯々]+", text)):
                    _fail("Invalid example reading alignment")
                checked.append({"text": text, "reading": reading})
            if checked and "".join(segment["text"] for segment in checked) != sentence:
                _fail("Invalid example reading alignment")
            if checked:
                normalized["furigana"] = checked
        if sentence in positions:
            old = result[positions[sentence]]
            old["translations"] = {**normalized["translations"], **old["translations"]}
            if "furigana" not in old and "furigana" in normalized:
                old["furigana"] = normalized["furigana"]
        else:
            positions[sentence] = len(result)
            result.append(normalized)
        if len(result) > 20:
            _fail("Excessive content examples")
    return result


def normalized_word(payload, word):
    value = _object(payload, WORD_FIELDS)
    if _id(value.get("id")) != word:
        _fail("Word payload identity differs")
    meanings = _object(value.get("meanings", {}), MEANING_LANGUAGES)
    meanings = {key: _text(text, 1600) for key, text in meanings.items() if text != ""}
    meaning = value.get("meaning", meanings.get("zh-Hant", meanings.get("zh-Hans", next(
        (meanings[key] for key in sorted(meanings)), ""))))
    meaning = _text(meaning, 1600)
    if not meaning.strip() and not any(text.strip() for text in meanings.values()):
        _fail("Word content requires a meaning")
    if not meanings and meaning:
        meanings = {"zh-Hant": meaning}
    legacy = _text(value.get("example", ""), 2000)
    examples = _examples(value.get("examples", []), legacy)
    reading = _text(value.get("reading", ""), 180)
    if reading and not re.fullmatch(r"[ぁ-ゖァ-ヶー～〜・/]+", reading):
        _fail("Invalid Japanese reading")
    audio = value.get("audio")
    if audio is not None and (not isinstance(audio, str) or not re.fullmatch(
            r"audio/[A-Za-z0-9_.-]+\.m4a", audio, flags=re.ASCII)):
        _fail("Invalid audio reference")
    part = value.get("part")
    if part is not None:
        part = _text(part, 100)
    result = {"id": word, "term": _text(value.get("term"), 180, required=True),
              "meaning": meaning, "meanings": meanings, "example": examples[0]["text"] if examples else "",
              "examples": examples, "category": _id(value.get("category"), 128),
              "subcategory": _id(value.get("subcategory")), "language": _enum(value.get("language"), LANGUAGES),
              "audio": audio, "part": part, "pattern": _text(value.get("pattern", ""), 2000),
              "explanation": _text(value.get("explanation", ""), 6000), "reading": reading}
    if "headword" in value:
        result["headword"] = _text(value["headword"], 180, required=True)
    if "order" in value:
        if type(value["order"]) is not int or not 0 <= value["order"] <= 100_000_000:
            _fail("Invalid word source order")
        result["order"] = value["order"]
    return result


def validated_content(envelope, maximum=MAX_RECORDS):
    if (not isinstance(envelope, dict) or set(envelope) not in (
            {"version", "records"}, {"version", "records", "knownDigest"})
            or type(envelope["version"]) is not int or envelope["version"] != 1
            or not isinstance(envelope["records"], list)):
        _fail("Invalid content envelope")
    if "knownDigest" in envelope and envelope["knownDigest"] is not None and (
            not isinstance(envelope["knownDigest"], str)
            or not re.fullmatch(r"[a-f0-9]{64}", envelope["knownDigest"], flags=re.ASCII)):
        _fail("Invalid content digest")
    if len(envelope["records"]) > maximum:
        raise SyncError(413, "Too many content records")
    winners = {}
    for source in envelope["records"]:
        if not isinstance(source, dict) or set(source) != CONTENT_FIELDS:
            _fail()
        dictionary = _id(source["dictionaryID"], 128)
        kind = _enum(source["kind"], {"dictionary", "word"})
        word = source["wordID"]
        if kind == "dictionary":
            if word != "*":
                _fail("Invalid dictionary metadata key")
        elif _id(word) == "*":
            _fail("Reserved word content key")
        if (type(source["clock"]) is not int or not 0 <= source["clock"] <= MAX_CLOCK
                or not isinstance(source["deviceID"], str)
                or not (DEVICE.fullmatch(source["deviceID"]) or
                        (source["clock"] == 0 and source["deviceID"] == ""))
                or type(source["deleted"]) is not bool):
            _fail()
        if source["deviceID"] and source["clock"] == 0:
            _fail("Content edits require positive revision")
        if source["deleted"]:
            if source["payload"] is not None:
                _fail("Content tombstone payload must be null")
            payload = None
        else:
            # Validate without rewriting a winning payload. Defaults belong only to
            # a client's materialized UI model, not to the same wire revision.
            if kind == "dictionary":
                normalized_metadata(source["payload"], dictionary)
            else:
                normalized_word(source["payload"], word)
            payload = source["payload"]
        record = {**source, "payload": payload}
        if encoded_bytes(record) > MAX_CONTENT_RECORD_BYTES:
            raise SyncError(413, "Content record too large")
        key = dictionary, kind, word
        if key not in winners or content_rank(record) > content_rank(winners[key]):
            winners[key] = record
    return winners
