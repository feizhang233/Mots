#!/usr/bin/env python3
"""Exercise the real HTTP transport and durable pairing/merge boundary."""

from concurrent.futures import ThreadPoolExecutor
from contextlib import redirect_stderr
import hashlib
import http.client
import importlib.util
import io
import json
from pathlib import Path
import socket
import sqlite3
import stat
import tempfile
import threading
import unittest

spec = importlib.util.spec_from_file_location("mots_sync_server", Path(__file__).with_name("server.py"))
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)
ORIGIN = "https://mots.feizhang233.com"
DEVICE_A = "1" * 32
DEVICE_B = "f" * 32


def record(word="a", level=1, clock=1, device=DEVICE_A, dictionary="fr"):
    return {"dictionaryID": dictionary, "wordID": word, "level": level,
            "clock": clock, "deviceID": device}


def deletion(word="a", deleted=True, clock=1, device=DEVICE_A, dictionary="fr"):
    return {"dictionaryID": dictionary, "wordID": word, "deleted": deleted,
            "clock": clock, "deviceID": device}


class SyncTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.database = Path(self.temporary.name) / "private" / "progress.sqlite3"
        self.store = sync.SyncStore(self.database)
        self.server = sync.SyncHTTPServer(("127.0.0.1", 0), self.store, create_limit=100,
                                          create_global_limit=100)
        self.thread = threading.Thread(target=self.server.serve_forever,
                                       kwargs={"poll_interval": 0.02}, daemon=True)
        self.thread.start()
        self.addCleanup(self.stop_server)

    def stop_server(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=3)

    def request(self, path, payload=None, code=None, *, method="POST", origin=ORIGIN,
                headers=None, raw=None):
        supplied = {"Content-Type": "application/json"}
        if origin is not None:
            supplied["Origin"] = origin
        if code is not None:
            supplied["Authorization"] = "Bearer " + code
        supplied.update(headers or {})
        body = raw if raw is not None else json.dumps(payload if payload is not None else {}).encode()
        connection = http.client.HTTPConnection("127.0.0.1", self.server.server_port, timeout=4)
        try:
            connection.request(method, sync.BASE + path, body=body, headers=supplied)
            response = connection.getresponse()
            raw_response = response.read()
            return response.status, dict(response.getheaders()), json.loads(raw_response)
        finally:
            connection.close()

    def create(self):
        status, headers, result = self.request("/create", {})
        self.assertEqual(status, 200)
        self.assertEqual(result["version"], 1)
        self.assertRegex(result["code"], r"^mots-[A-Za-z0-9_-]{43}$")
        self.assertEqual(headers["Cache-Control"], "no-store")
        return result["code"]

    def exchange(self, code, records=()):
        status, _, result = self.request("/exchange", {"version": 1, "records": list(records)}, code)
        self.assertEqual(status, 200)
        self.assertEqual(result["version"], 1)
        return result["records"]

    def deletions(self, code, records=()):
        status, _, result = self.request("/deletions", {"version": 1, "records": list(records)}, code)
        self.assertEqual(status, 200)
        self.assertEqual(set(result), {"version", "records"})
        self.assertEqual(result["version"], 1)
        return result["records"]

    def test_secure_creation_stores_only_hash_and_is_durable(self):
        code = self.create()
        self.exchange(code, [record()])
        self.assertEqual(stat.S_IMODE(self.database.stat().st_mode), 0o600)
        self.assertEqual(stat.S_IMODE(self.database.parent.stat().st_mode), 0o700)
        with sqlite3.connect(self.database) as connection:
            saved = connection.execute("SELECT code_hash FROM groups").fetchone()[0]
        self.assertEqual(saved, hashlib.sha256(code.encode()).hexdigest())
        self.assertNotIn(code.encode(), self.database.read_bytes())
        reopened = sync.SyncStore(self.database)
        self.assertIsNotNone(reopened.authenticate(code))
        self.assertEqual(reopened.exchange(saved, {"version": 1, "records": []})["records"], [record()])

    def test_group_and_dictionary_identity_isolation(self):
        first, second = self.create(), self.create()
        self.assertNotEqual(first, second)
        self.exchange(first, [record(), record(level=3, dictionary="dict-same-word")])
        self.assertEqual(self.exchange(second), [])
        self.assertEqual(len(self.exchange(first)), 2)

    def test_standard_and_thematic_grammar_keep_both_channels_independent(self):
        code = self.create()
        standard, thematic = "grammar-fr", "grammar-theme-fr"
        expected = [record("shared-entry", level=3, dictionary=standard),
                    record("shared-entry", level=1, dictionary=thematic)]
        self.assertEqual(self.exchange(code, expected), expected)
        deleted = deletion("shared-entry", dictionary=thematic)
        self.assertEqual(self.deletions(code, [deleted]), [deleted])
        self.assertEqual(self.exchange(code), expected, "Deleting in one book must not change either book's ratings")
        restored = deletion("shared-entry", deleted=False, clock=2, dictionary=thematic)
        other = deletion("shared-entry", dictionary=standard)
        self.assertEqual(self.deletions(code, [restored, other]), [other, restored])
        self.assertEqual(self.exchange(code), expected)

    def test_offline_union_duplicate_keys_stale_and_idempotent(self):
        code = self.create()
        self.exchange(code, [record("z", 1, 3), record("a", 2, 4)])
        expected = [record("a", 2, 4), record("b", 1, 1), record("z", 3, 8)]
        incoming = [record("b"), record("z", 1, 2), record("z", 3, 8), record("z", 2, 7)]
        self.assertEqual(self.exchange(code, incoming), expected)
        self.assertEqual(self.exchange(code, incoming), expected)
        self.assertEqual(self.exchange(code), expected)

    def test_clear_tombstone_downgrade_and_clock_device_level_order(self):
        code = self.create()
        self.exchange(code, [record(level=3, clock=0, device="")])
        self.exchange(code, [record(level=1, clock=0, device="")])
        self.assertEqual(self.exchange(code)[0]["level"], 3, "Legacy ties choose max familiarity")
        cleared = record(level=0, clock=1)
        self.assertEqual(self.exchange(code, [cleared]), [cleared])
        self.assertEqual(self.exchange(code, [record(level=3, clock=0, device="")]), [cleared])
        winner = record(level=1, clock=1, device=DEVICE_B)
        self.assertEqual(self.exchange(code, [winner]), [winner], "Device ID breaks equal-clock ties")
        same_version = record(level=2, clock=1, device=DEVICE_B)
        self.assertEqual(self.exchange(code, [same_version]), [same_version])
        downgrade = record(level=0, clock=2)
        self.assertEqual(self.exchange(code, [downgrade]), [downgrade], "Newer clock permits downgrade/clear")

    def test_concurrent_merges_are_atomic_and_converge(self):
        code = self.create()
        def send(number):
            device = f"{number:032x}"
            return self.exchange(code, [record(f"word-{number}", device=device),
                                        record("shared", number % 4, 8, device)])
        with ThreadPoolExecutor(max_workers=6) as pool:
            list(pool.map(send, range(1, 7)))
        result = self.exchange(code)
        self.assertEqual(len(result), 7)
        self.assertEqual(next(item for item in result if item["wordID"] == "shared"),
                         record("shared", 2, 8, f"{6:032x}"))

    def test_unknown_content_retained_and_keys_sorted(self):
        code = self.create()
        records = [record("陌生詞", dictionary="dict-unknown"), record("z"), record("a")]
        result = self.exchange(code, records)
        self.assertEqual(result, sorted(records, key=lambda value: (value["dictionaryID"], value["wordID"])))

    def test_invalid_records_reject_entire_request(self):
        code = self.create()
        self.exchange(code, [record("existing")])
        invalid = [None, [], {}, {**record(), "unexpected": 1}]
        for field, values in {
            "level": [True, False, -1, 4, 1.0, "1", None],
            "clock": [True, -1, sync.MAX_CLOCK + 1, 1.0, "1", None],
            "deviceID": ["", "A" * 32, "1" * 31, None],
            "dictionaryID": ["", "x" * 129, "__proto__", "constructor", "prototype", "bad\n", 3],
            "wordID": ["", "x" * 257, "__proto__", "bad\x00", "\ud800", None],
        }.items():
            invalid += [{**record(), field: value} for value in values]
        for bad in invalid:
            with self.subTest(record=bad):
                status, _, _ = self.request("/exchange", {"version": 1, "records": [record("must-not-commit"), bad]}, code)
                self.assertEqual(status, 400)
                self.assertEqual(self.exchange(code), [record("existing")])

    def test_invalid_envelope_and_json_are_400(self):
        code = self.create()
        values = [None, [], {}, {"version": True, "records": []}, {"version": 1.0, "records": []},
                  {"version": 2, "records": []}, {"version": 1, "records": {}},
                  {"version": 1, "records": [], "extra": 1}]
        for value in values:
            status, _, _ = self.request("/exchange", code=code, raw=json.dumps(value).encode())
            self.assertEqual(status, 400)
        for raw in [b"", b"{", b"\xff", b'{"version":1,"records":[],"version":1}',
                    b'{"version":NaN,"records":[]}', b'{"version":Infinity,"records":[]}']:
            status, _, _ = self.request("/exchange", code=code, raw=raw)
            self.assertEqual(status, 400)

    def test_wrong_code_cannot_create_group_and_auth_precedes_body(self):
        wrong = "mots-" + "x" * 43
        status, _, _ = self.request("/exchange", code=wrong, raw=b"", headers={"Content-Length": str(sync.MAX_BODY + 1)})
        self.assertEqual(status, 401, "Do not read/validate oversized unauthenticated body")
        for code in [None, "", "mots-bad", wrong]:
            self.assertEqual(self.request("/exchange", {}, code)[0], 401)
        with sqlite3.connect(self.database) as connection:
            self.assertEqual(connection.execute("SELECT COUNT(*) FROM groups").fetchone()[0], 0)

    def test_expect_continue_does_not_bypass_authentication(self):
        with socket.create_connection(("127.0.0.1", self.server.server_port), timeout=3) as connection:
            connection.sendall(b"POST /api/sync/exchange HTTP/1.1\r\nHost: localhost\r\nContent-Length: 100000\r\nExpect: 100-continue\r\nContent-Type: application/json\r\n\r\n")
            response = connection.recv(4096)
        self.assertTrue(response.startswith(b"HTTP/1.1 401"))
        self.assertNotIn(b"100 Continue", response)

    def test_body_and_record_capacity_limits_rollback(self):
        code = self.create()
        status, _, _ = self.request("/exchange", code=code, raw=b"", headers={"Content-Length": str(sync.MAX_BODY + 1)})
        self.assertEqual(status, 413)
        self.store.max_records = 2
        self.exchange(code, [record("a"), record("b")])
        self.assertEqual(self.request("/exchange", {"version": 1, "records": [record("a", 3, 3), record("c")]}, code)[0], 413)
        self.assertEqual(self.exchange(code), [record("a"), record("b")], "Capacity failure commits no partial update")
        self.assertEqual(self.request("/exchange", {"version": 1, "records": [record("a")] * 3}, code)[0], 413)

    def test_creation_is_rate_limited_and_total_groups_capped(self):
        self.server.limiter.limit = 2
        self.create(); self.create()
        self.assertEqual(self.request("/create", {})[0], 429)
        self.server.limiter = sync.CreationLimiter(limit=100, global_limit=100)
        self.store.max_groups = 2
        self.assertEqual(self.request("/create", {})[0], 503)

    def test_exact_origins_and_no_wildcard_cors(self):
        for origin in [ORIGIN, "https://mots.feizhang233.com:443", "http://localhost:5173",
                       "http://127.0.0.1:8899", "http://[::1]:8080"]:
            status, headers, _ = self.request("/health", method="GET", origin=origin)
            self.assertEqual(status, 200)
            self.assertEqual(headers.get("Access-Control-Allow-Origin"), origin)
            self.assertEqual(headers["Vary"], "Origin")
        for origin in ["null", "https://evil.test", "http://mots.feizhang233.com", ORIGIN + ".evil",
                       ORIGIN + "/", "https://mots.feizhang233.com@evil.test", "http://localhost.evil", "https://127.0.0.1:0"]:
            status, headers, _ = self.request("/create", {}, origin=origin)
            self.assertEqual(status, 403)
            self.assertNotIn("Access-Control-Allow-Origin", headers)
        status, headers, body = self.request("/health", method="GET", origin=None)
        self.assertEqual((status, body), (200, {"version": 1, "status": "ok"}))
        self.assertNotIn("Access-Control-Allow-Origin", headers)

    def test_preflight_allows_authorization_without_exposing_data(self):
        status, headers, body = self.request("/exchange", method="OPTIONS", headers={
            "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "authorization,content-type"})
        self.assertEqual(status, 200)
        self.assertEqual(body, {"version": 1})
        self.assertEqual(headers["Access-Control-Allow-Origin"], ORIGIN)
        self.assertEqual(self.request("/exchange", method="OPTIONS", headers={"Access-Control-Request-Headers": "x-untrusted"})[0], 403)

    def test_create_body_paths_and_content_type_are_strict(self):
        for body in [[], None, "", {"version": 1}]:
            self.assertEqual(self.request("/create", raw=json.dumps(body).encode())[0], 400)
        self.assertEqual(self.request("/missing", {})[0], 404)
        self.assertEqual(self.request("/exchange?code=do-not-accept", {})[0], 404)
        self.assertEqual(self.request("/create", {}, headers={"Content-Type": "text/plain"})[0], 400)
        self.assertEqual(self.request("/create", raw=b"{}", headers={"Transfer-Encoding": "chunked"})[0], 400)

    def test_requests_do_not_log_credentials_or_identifiers(self):
        captured = io.StringIO()
        with redirect_stderr(captured):
            code = self.create()
            self.exchange(code, [record("private-word")])
            self.request("/missing?private-query=never-log", code=code)
        self.assertEqual(captured.getvalue(), "")

    def test_database_refuses_shared_directory_and_symlink(self):
        shared = Path(self.temporary.name) / "shared"
        shared.mkdir(mode=0o755)
        shared.chmod(0o755)
        with self.assertRaises(ValueError):
            sync.SyncStore(shared / "unsafe.sqlite3")
        self.assertEqual(stat.S_IMODE(shared.stat().st_mode), 0o755)
        linked = self.database.parent / "linked.sqlite3"
        linked.symlink_to(self.database)
        with self.assertRaises(OSError):
            sync.SyncStore(linked)

    def test_maximum_clock_and_migration_boundary(self):
        code = self.create()
        values = [record("legacy", 2, 0, ""), record("maximum", 3, sync.MAX_CLOCK)]
        self.assertEqual(self.exchange(code, values), values)
        self.assertEqual(self.request("/exchange", {"version": 1, "records": [record(clock=1, device="")]}, code)[0], 400)

    def test_deletion_register_does_not_change_v1_familiarity_contract(self):
        code = self.create()
        original = record(level=3, clock=0, device="")
        self.assertEqual(self.exchange(code, [original]), [original])
        removed = deletion()
        self.assertEqual(self.deletions(code, [removed]), [removed])
        self.assertEqual(self.exchange(code), [original], "Old clients receive only original familiarity fields")
        newer_rating = record(level=1, clock=99, device=DEVICE_B)
        self.assertEqual(self.exchange(code, [newer_rating]), [newer_rating])
        self.assertEqual(self.deletions(code), [removed], "Old iPhone rating updates never restore deletions")
        self.assertEqual(self.request("/exchange", {"version": 1, "records": [{**original, "deleted": True}]}, code)[0], 400)
        self.assertEqual(self.request("/exchange", {"version": 1, "records": [removed]}, code)[0], 400)

    def test_deletion_restore_false_tombstone_survives_retry_and_reopen(self):
        code = self.create()
        removed, restored = deletion(), deletion(deleted=False, clock=2)
        self.assertEqual(self.deletions(code, [removed]), [removed])
        self.assertEqual(self.deletions(code, [restored]), [restored])
        self.assertEqual(self.deletions(code, [removed, removed]), [restored], "Old delete cannot resurrect after undo")
        self.assertEqual(self.deletions(code), [restored], "Empty exchange never discards a false restore register")
        reopened = sync.SyncStore(self.database)
        digest = reopened.authenticate(code)
        self.assertEqual(reopened.exchange_deletions(digest, {"version": 1, "records": []})["records"], [restored])
        self.assertEqual(stat.S_IMODE(self.database.stat().st_mode), 0o600)
        self.assertEqual(stat.S_IMODE(self.database.parent.stat().st_mode), 0o700)

    def test_deletion_ties_follow_clock_then_device_then_boolean(self):
        code = self.create()
        low_device = deletion(clock=0)
        self.deletions(code, [low_device])
        high_device_restore = deletion(deleted=False, clock=0, device=DEVICE_B)
        self.assertEqual(self.deletions(code, [high_device_restore]), [high_device_restore])
        exact_tie_delete = deletion(clock=0, device=DEVICE_B)
        self.assertEqual(self.deletions(code, [exact_tie_delete, high_device_restore]), [exact_tie_delete])
        newer_restore = deletion(deleted=False, clock=1)
        self.assertEqual(self.deletions(code, [newer_restore]), [newer_restore])
        maximum = deletion(deleted=False, clock=sync.MAX_CLOCK)
        self.assertEqual(self.deletions(code, [maximum]), [maximum])

    def test_deletion_offline_union_unknown_content_and_groups_are_isolated(self):
        code, other = self.create(), self.create()
        records = [deletion("z"), deletion("陌生詞", dictionary="dict-unknown"),
                   deletion("z", deleted=False, dictionary="dict-same-word"), deletion("a", deleted=False)]
        self.deletions(code, records[:2])
        expected = sorted(records, key=lambda item: (item["dictionaryID"], item["wordID"]))
        self.assertEqual(self.deletions(code, records[2:]), expected)
        self.assertEqual(self.deletions(code, records), expected, "Duplicate and retried registers are idempotent")
        self.assertEqual(self.deletions(other), [])
        self.assertEqual(self.exchange(code), [], "Deleting words does not manufacture familiarity entries")

    def test_deletion_bad_types_extra_fields_and_ids_fail_atomically(self):
        code = self.create()
        existing = deletion("existing", deleted=False)
        self.deletions(code, [existing])
        invalid = [None, [], {}, record(), {**deletion(), "extra": True}]
        for field, values in {
            "deleted": [None, 0, 1, -1, 1.0, "true", "false", [], {}],
            "clock": [True, False, -1, sync.MAX_CLOCK + 1, 1.0, "1", None],
            "deviceID": ["", "A" * 32, "1" * 31, None],
            "dictionaryID": ["", "x" * 129, "__proto__", "constructor", "prototype", "bad\n", 3],
            "wordID": ["", "x" * 257, "__proto__", "bad\x00", "\ud800", None],
        }.items():
            invalid += [{**deletion(), field: value} for value in values]
        invalid.append(deletion(clock=0, device=""))
        for bad in invalid:
            with self.subTest(record=bad):
                status, _, _ = self.request("/deletions", {"version": 1, "records": [deletion("must-not-commit"), bad]}, code)
                self.assertEqual(status, 400)
                self.assertEqual(self.deletions(code), [existing])

    def test_deletion_bad_envelopes_and_json_fail_atomically(self):
        code = self.create()
        values = [None, [], {}, {"version": True, "records": []}, {"version": 1.0, "records": []},
                  {"version": 2, "records": []}, {"version": 1, "records": {}},
                  {"version": 1, "records": [], "deletions": []}]
        for value in values:
            self.assertEqual(self.request("/deletions", code=code, raw=json.dumps(value).encode())[0], 400)
        for raw in [b"", b"{", b"\xff", b'{"version":1,"records":[],"version":1}',
                    b'{"version":NaN,"records":[]}']:
            self.assertEqual(self.request("/deletions", code=code, raw=raw)[0], 400)
        self.assertEqual(self.deletions(code), [])

    def test_deletion_cap_is_separate_and_capacity_failure_rolls_back(self):
        code = self.create()
        self.assertEqual(self.store.max_deletions, 100_000)
        self.store.max_records = self.store.max_deletions = 2
        self.exchange(code, [record("rating-a"), record("rating-b")])
        entries = [deletion("a"), deletion("b", deleted=False)]
        self.assertEqual(self.deletions(code, entries), entries, "Familiarity entries do not consume deletion capacity")
        self.assertEqual(self.request("/deletions", {"version": 1, "records": [deletion("a", False, 5), deletion("c")]}, code)[0], 413)
        self.assertEqual(self.deletions(code), entries, "Restore is not partially applied when another key exceeds capacity")
        self.assertEqual(self.request("/deletions", {"version": 1, "records": [deletion("a")] * 3}, code)[0], 413)
        self.assertEqual(self.exchange(code), [record("rating-a"), record("rating-b")])

    def test_deletion_concurrent_merges_converge(self):
        code = self.create()
        def send(number):
            device = f"{number:032x}"
            return self.deletions(code, [deletion(f"word-{number}", device=device),
                                         deletion("shared", number % 2 == 1, 8, device)])
        with ThreadPoolExecutor(max_workers=6) as pool:
            list(pool.map(send, range(1, 7)))
        result = self.deletions(code)
        self.assertEqual(len(result), 7)
        self.assertEqual(next(item for item in result if item["wordID"] == "shared"),
                         deletion("shared", False, 8, f"{6:032x}"))

    def test_deletion_concurrent_capacity_is_enforced_transactionally(self):
        code = self.create()
        self.store.max_deletions = 3
        def send(number):
            return self.request("/deletions", {"version": 1, "records": [deletion(f"word-{number}")]}, code)[0]
        with ThreadPoolExecutor(max_workers=4) as pool:
            statuses = list(pool.map(send, range(4)))
        self.assertEqual(sorted(statuses), [200, 200, 200, 413])
        self.assertEqual(len(self.deletions(code)), 3)

    def test_deletion_auth_preflight_limits_headers_and_no_logs(self):
        wrong = "mots-" + "x" * 43
        self.assertEqual(self.request("/deletions", code=wrong, raw=b"", headers={"Content-Length": str(sync.MAX_BODY + 1)})[0], 401)
        for code in [None, "", "mots-bad", wrong]:
            self.assertEqual(self.request("/deletions", {}, code)[0], 401)
        with sqlite3.connect(self.database) as connection:
            self.assertEqual(connection.execute("SELECT COUNT(*) FROM groups").fetchone()[0], 0)
        captured = io.StringIO()
        with redirect_stderr(captured):
            code = self.create()
            self.assertEqual(self.request("/deletions", code=code, raw=b"", headers={"Content-Length": str(sync.MAX_BODY + 1)})[0], 413)
            self.assertEqual(self.request("/deletions", {"version": 1, "records": []}, code, origin="https://evil.test")[0], 403)
            status, headers, body = self.request("/deletions", {"version": 1, "records": []}, code)
            self.assertEqual((status, body), (200, {"version": 1, "records": []}))
            self.assertEqual(headers["Cache-Control"], "no-store")
            self.assertEqual(headers["X-Content-Type-Options"], "nosniff")
            self.assertEqual(headers["Access-Control-Allow-Origin"], ORIGIN)
            self.deletions(code, [deletion("private-deleted-word")])
        self.assertEqual(captured.getvalue(), "")
        status, headers, body = self.request("/deletions", method="OPTIONS", headers={
            "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "authorization,content-type"})
        self.assertEqual((status, body), (200, {"version": 1}))
        self.assertEqual(headers["Access-Control-Allow-Origin"], ORIGIN)
        self.assertEqual(self.request("/deletions", method="GET", code=code)[0], 404)

    def test_deletion_expect_continue_requires_authentication(self):
        with socket.create_connection(("127.0.0.1", self.server.server_port), timeout=3) as connection:
            connection.sendall(b"POST /api/sync/deletions HTTP/1.1\r\nHost: localhost\r\nContent-Length: 100000\r\nExpect: 100-continue\r\nContent-Type: application/json\r\n\r\n")
            response = connection.recv(4096)
        self.assertTrue(response.startswith(b"HTTP/1.1 401"))
        self.assertNotIn(b"100 Continue", response)

    def test_deletion_table_adds_to_existing_v1_database_without_changing_progress(self):
        code = self.create()
        familiar = record("retained", 2, 7)
        self.exchange(code, [familiar])
        with sqlite3.connect(self.database) as connection:
            connection.execute("DROP TABLE deletions")
        reopened = sync.SyncStore(self.database)
        digest = reopened.authenticate(code)
        self.assertEqual(reopened.exchange(digest, {"version": 1, "records": []})["records"], [familiar])
        self.assertEqual(reopened.exchange_deletions(digest, {"version": 1, "records": [deletion()]})["records"], [deletion()])
        self.assertEqual(self.exchange(code), [familiar])


if __name__ == "__main__":
    unittest.main(verbosity=2)
