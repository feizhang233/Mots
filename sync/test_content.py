"""Real transport tests for isolated, durable and backward-compatible content sync."""

import copy
import hashlib
import http.client
import json
from pathlib import Path
import sqlite3
import tempfile
import threading
import unittest

from sync.content_protocol import (
    MAX_CONTENT_RECORD_BYTES, canonical_json, content_rank, encoded_bytes, validated_content,
)
from sync.server import SyncHTTPServer, SyncStore

ORIGIN = "https://mots.feizhang233.com"
DEVICE_A, DEVICE_B = "1" * 32, "f" * 32


def metadata(dictionary="dict-test", **changes):
    return {"id": dictionary, "title": "我的日語詞典", "language": "ja",
            "categories": [{"id": "1", "name": "優先掌握", "subcategories": [
                {"id": "1.01", "name": "名詞"}]}], **changes}


def word(identifier="word-1", **changes):
    return {"id": identifier, "term": "空", "meaning": "空的", "language": "ja",
            "category": "1", "subcategory": "1.01", "reading": "から", **changes}


def record(*, dictionary="dict-test", kind="word", identifier="word-1", payload=None,
           clock=1, device=DEVICE_A, deleted=False):
    if kind == "dictionary":
        identifier = "*"
    if payload is None and not deleted:
        payload = metadata(dictionary) if kind == "dictionary" else word(identifier)
    return {"dictionaryID": dictionary, "kind": kind, "wordID": identifier,
            "clock": clock, "deviceID": device, "deleted": deleted, "payload": payload}


class ContentTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.database = Path(self.temporary.name) / "private/progress.sqlite3"
        self.store = SyncStore(self.database)
        self.server = SyncHTTPServer(("127.0.0.1", 0), self.store, create_limit=100,
                                     create_global_limit=100)
        self.thread = threading.Thread(target=self.server.serve_forever,
                                       kwargs={"poll_interval": 0.02}, daemon=True)
        self.thread.start()
        self.addCleanup(self.stop)
        self.code = self.request("/create", {})[2]["code"]

    def stop(self):
        self.server.shutdown(); self.server.server_close(); self.thread.join(timeout=3)

    def request(self, path, payload=None, code=None, *, method="POST", origin=ORIGIN, raw=None):
        headers = {"Content-Type": "application/json"}
        if origin is not None:
            headers["Origin"] = origin
        if code is not None:
            headers["Authorization"] = "Bearer " + code
        connection = http.client.HTTPConnection("127.0.0.1", self.server.server_port, timeout=4)
        try:
            body = raw if raw is not None else json.dumps(payload if payload is not None else {}).encode()
            connection.request(method, "/api/sync" + path, body=body, headers=headers)
            response = connection.getresponse()
            return response.status, dict(response.getheaders()), json.loads(response.read())
        finally:
            connection.close()

    def exchange(self, rows=(), code=None):
        status, headers, response = self.request("/content", {"version": 1, "records": list(rows)}, code or self.code)
        self.assertEqual(status, 200, response)
        self.assertEqual(headers["Cache-Control"], "no-store")
        self.assertEqual(set(response), {"version", "records"})
        self.assertEqual(response["version"], 1)
        return response["records"]

    def test_bidirectional_union_durable_and_group_private(self):
        first, second = record(kind="dictionary"), record()
        third = record(identifier="added-offline", payload=word("added-offline", term="審判", reading="しんぱん"))
        self.assertEqual(self.exchange([first, second]), [first, second])
        self.assertEqual(self.exchange([third]), [first, third, second])
        other = self.request("/create", {})[2]["code"]
        self.assertEqual(self.exchange(code=other), [])
        reopened = SyncStore(self.database)
        self.assertEqual(reopened.exchange_content(reopened.authenticate(self.code), {"version": 1, "records": []})["records"],
                         [first, third, second])
        with sqlite3.connect(self.database) as connection:
            self.assertEqual(connection.execute("SELECT count(*) FROM content").fetchone()[0], 3)
        self.assertNotIn(self.code.encode(), self.database.read_bytes())

    def test_source_updates_and_user_overrides_keep_learning_progress(self):
        dictionary = "vocab-ja-n2-hongbao"
        identifier = "hb-n2-0dada549a204"
        rating = {"dictionaryID": dictionary, "wordID": identifier, "level": 2,
                  "clock": 12, "deviceID": DEVICE_A}
        schedule = {"dictionaryID": dictionary, "wordID": identifier, "stage": 2,
                    "updatedAt": 1000, "dueAt": 259201000}
        self.assertEqual(self.request("/exchange", {"version": 1, "records": [rating]}, self.code)[0], 200)
        self.assertEqual(self.request("/memory", {"version": 1, "records": [schedule]}, self.code)[0], 200)
        patched = record(dictionary=dictionary, identifier=identifier,
                         payload=word(identifier, meaning="空的，沒有內容", audio=None))
        self.assertEqual(self.exchange([patched]), [patched])
        self.exchange([record(dictionary=dictionary, identifier=identifier, clock=2, deleted=True)])
        self.assertEqual(self.request("/exchange", {"version": 1, "records": []}, self.code)[2]["records"], [rating])
        self.assertEqual(self.request("/memory", {"version": 1, "records": []}, self.code)[2]["records"], [schedule])
        self.assertEqual(self.request("/deletions", {"version": 1, "records": []}, self.code)[2]["records"], [])

    def test_conflicts_tombstones_archives_and_stale_resurrection(self):
        a = record()
        b = record(clock=2, device=DEVICE_B, payload=word(meaning="空的；空白的"))
        self.assertEqual(self.exchange([a, b]), [b])
        self.assertEqual(self.exchange([a]), [b])
        same_clock_a = record(clock=2, device=DEVICE_A)
        self.assertEqual(self.exchange([same_clock_a]), [b])
        deleted = record(clock=2, device=DEVICE_B, deleted=True)
        self.assertEqual(self.exchange([deleted]), [deleted])
        self.assertEqual(self.exchange([b]), [deleted])
        restored = record(clock=3)
        self.assertEqual(self.exchange([restored]), [restored])
        archived = record(kind="dictionary", clock=4, payload=metadata(archived=True))
        self.assertEqual(self.exchange([archived]), [archived, restored])
        self.assertEqual(self.exchange([record(kind="dictionary")]), [archived, restored])

    def test_same_revision_unicode_payload_tie_is_deterministic(self):
        # UTF-8 byte order differs from UTF-16 order for these scalar values.
        a = record(payload=word(meaning="\ue000"))
        b = record(payload=word(meaning="\U00010000"))
        self.assertLess(canonical_json(a["payload"]).encode(), canonical_json(b["payload"]).encode())
        self.assertGreater(content_rank(b), content_rank(a))
        self.assertEqual(self.exchange([a, b]), [b])
        self.assertEqual(self.exchange([a]), [b])
        other = self.request("/create", {})[2]["code"]
        self.assertEqual(self.exchange([b, a], code=other), [b])

    def test_payload_round_trips_without_adding_defaults(self):
        raw = record(kind="dictionary", payload=metadata())
        simple = record(payload=word(examples=["箱の中は空でした。"], part=None))
        expected = copy.deepcopy([raw, simple])
        self.assertEqual(self.exchange(expected), expected)
        self.assertNotIn("kind", self.exchange()[0]["payload"])
        self.assertNotIn("grammarMode", self.exchange()[0]["payload"])
        self.assertEqual(self.exchange()[1]["payload"]["examples"], ["箱の中は空でした。"])

    def test_initial_seeds_and_orphan_words_are_retained(self):
        seed = record(clock=0, device="")
        self.assertEqual(self.exchange([seed]), [seed])
        # No corresponding metadata exists yet; do not discard an offline word.
        orphan = record(dictionary="dict-later", identifier="orphan", payload=word("orphan", category="future"))
        self.assertEqual(self.exchange([orphan]), [orphan, seed])
        self.assertEqual(self.exchange([record(clock=1)]), [orphan, record(clock=1)])

    def test_bad_record_rejects_whole_batch_before_any_mutation(self):
        existing = record()
        self.exchange([existing])
        bad = [
            dict(existing, extra=True), dict(existing, clock=True), dict(existing, clock=-1),
            dict(existing, clock=0), dict(existing, deviceID=""), dict(existing, deleted=1),
            dict(existing, dictionaryID="__proto__"), dict(existing, wordID="*"),
            dict(existing, payload=None), dict(existing, deleted=True),
            dict(existing, payload=word(id="different")),
            dict(existing, payload=word(meaning="", meanings={})),
            dict(existing, payload=word(extra="unknown")),
            dict(existing, payload=word(audio="https://evil.invalid/audio.m4a")),
            dict(existing, payload=word(reading="sora")), dict(existing, payload=word(order=True)),
            dict(existing, payload=word(term="\ud800")),
            dict(existing, payload=word(meanings={"__proto__": "unsafe"})),
            dict(existing, payload=word(examples=[{"text": "空", "furigana": [{"text": "別", "reading": "べつ"}]}])),
            dict(existing, payload=word(examples=[{"text": "空", "furigana": [{"text": "空", "reading": "sora"}]}])),
            record(kind="dictionary", payload=metadata(archived="yes")),
            record(kind="dictionary", payload=metadata(sourceInfo="javascript:alert(1)")),
        ]
        new = record(identifier="must-not-appear")
        for invalid in bad:
            with self.subTest(invalid=invalid):
                status = self.request("/content", {"version": 1, "records": [new, invalid]}, self.code)[0]
                self.assertEqual(status, 400)
                self.assertEqual(self.exchange(), [existing])

    def test_envelope_auth_origin_and_preflight_are_bounded(self):
        for invalid in [{}, {"version": True, "records": []}, {"version": 2, "records": []},
                        {"version": 1, "records": None}, {"version": 1, "records": [], "extra": 1}]:
            self.assertEqual(self.request("/content", invalid, self.code)[0], 400)
        self.assertEqual(self.request("/content", {}, raw=b"not-json")[0], 401)
        self.assertEqual(self.request("/content", {}, self.code, origin="https://evil.invalid")[0], 403)
        self.assertEqual(self.request("/content", {}, method="OPTIONS")[0], 200)
        self.assertEqual(self.request("/content", {"version": 1, "records": []}, self.code, origin=None)[0], 200)

    def test_capacity_rejection_rolls_back_and_wire_bytes_are_utf8(self):
        first, second = record(), record(identifier="two")
        self.exchange([first])
        self.store.max_content_records = 1
        self.assertEqual(self.request("/content", {"version": 1, "records": [second]}, self.code)[0], 413)
        self.assertEqual(self.exchange(), [first])
        self.store.max_content_records = 100000
        snapshot_size = encoded_bytes({"version": 1, "records": [first]})
        self.store.max_content_bytes = snapshot_size
        self.assertEqual(self.exchange(), [first])
        self.assertEqual(self.request("/content", {"version": 1, "records": [second]}, self.code)[0], 413)
        self.assertEqual(self.exchange(), [first])
        self.assertEqual(snapshot_size, len(json.dumps({"version": 1, "records": [first]}, ensure_ascii=False,
                                                    separators=(",", ":")).encode("utf-8")))

    def test_record_size_schema_and_complete_catalog_compatibility(self):
        # Real currently published fields must pass without any transformation.
        root = Path(__file__).resolve().parent.parent
        catalog = json.loads((root / "database/catalog.json").read_text())
        for book in catalog:
            payload = {key: value for key, value in book.items() if key != "words"}
            raw = record(dictionary=book["id"], kind="dictionary", payload=payload)
            self.assertEqual(validated_content({"version": 1, "records": [raw]})[(book["id"], "dictionary", "*")], raw)
            for item in book["words"]:
                raw = record(dictionary=book["id"], identifier=item["id"], payload=item)
                self.assertEqual(validated_content({"version": 1, "records": [raw]})[(book["id"], "word", item["id"])], raw)
        large = record(payload=word(explanation="字" * 6000, examples=[
            {"text": str(index) + "字" * 1990, "translations": {"zh-Hant": "字" * 2000, "en": "x" * 2000}}
            for index in range(20)]))
        self.assertGreater(encoded_bytes(large), MAX_CONTENT_RECORD_BYTES)
        self.assertEqual(self.request("/content", {"version": 1, "records": [large]}, self.code)[0], 413)

    def test_conditional_snapshot_digest_saves_unchanged_downloads(self):
        a = record()
        first = self.request("/content", {"version": 1, "records": [a], "knownDigest": None}, self.code)
        self.assertEqual(first[0], 200)
        result = first[2]
        digest = hashlib.sha256(canonical_json([a]).encode("utf-8")).hexdigest()
        self.assertEqual(result, {"version": 1, "records": [a], "digest": digest, "unchanged": False})
        unchanged = self.request("/content", {"version": 1, "records": [], "knownDigest": digest}, self.code)
        self.assertEqual(unchanged[2], {"version": 1, "records": [], "digest": digest, "unchanged": True})
        # An idempotent outgoing upload can also be acknowledged without echoing the library.
        self.assertEqual(self.request("/content", {"version": 1, "records": [a], "knownDigest": digest}, self.code)[2], unchanged[2])
        b = record(identifier="new")
        changed = self.request("/content", {"version": 1, "records": [b], "knownDigest": digest}, self.code)[2]
        self.assertFalse(changed["unchanged"])
        self.assertEqual(changed["records"], [b, a])
        self.assertNotEqual(changed["digest"], digest)
        for bad in [True, 1, "A" * 64, "f" * 63, [], {}]:
            self.assertEqual(self.request("/content", {"version": 1, "records": [], "knownDigest": bad}, self.code)[0], 400)

    def test_shared_cross_language_canonicalization_fixture(self):
        fixture = json.loads(Path(__file__).with_name("content_fixtures.json").read_text())
        self.assertEqual(canonical_json(fixture["records"]), fixture["canonicalRecordsJSON"])
        self.assertEqual(hashlib.sha256(fixture["canonicalRecordsJSON"].encode("utf-8")).hexdigest(), fixture["digest"])
        self.assertEqual(hashlib.sha256(b"[]").hexdigest(), fixture["emptyDigest"])
        # Preserve canonically equivalent but byte-distinct word identifiers.
        self.assertEqual(len(validated_content({"version": 1, "records": fixture["records"]})), 3)
        for pair in fixture["ties"]:
            self.assertLess(content_rank(pair["less"]), content_rank(pair["greater"]))

    def test_additive_upgrade_never_replaces_old_learning_tables(self):
        rating = {"dictionaryID": "fr", "wordID": "legacy", "level": 3,
                  "clock": 91, "deviceID": DEVICE_A}
        memory = {"dictionaryID": "fr", "wordID": "legacy", "stage": 5,
                  "dueAt": 0, "updatedAt": 1000}
        self.request("/exchange", {"version": 1, "records": [rating]}, self.code)
        self.request("/memory", {"version": 1, "records": [memory]}, self.code)
        with sqlite3.connect(self.database) as connection:
            # Reproduce the old deployed schema, which had no content table.
            connection.execute("DROP TABLE content")
            before = {table: connection.execute("SELECT * FROM " + table).fetchall()
                      for table in ("groups", "records", "memory", "deletions")}
        upgraded = SyncStore(self.database)
        upgraded.exchange_content(upgraded.authenticate(self.code), {"version": 1, "records": [record()]})
        with sqlite3.connect(self.database) as connection:
            after = {table: connection.execute("SELECT * FROM " + table).fetchall()
                     for table in ("groups", "records", "memory", "deletions")}
        self.assertEqual(before, after)
        self.assertEqual(upgraded.exchange(upgraded.authenticate(self.code), {"version": 1, "records": []})["records"], [rating])
        self.assertEqual(upgraded.exchange_memory(upgraded.authenticate(self.code), {"version": 1, "records": []})["records"], [memory])


if __name__ == "__main__":
    unittest.main()
