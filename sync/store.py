"""Private SQLite storage and atomic per-group synchronization transactions."""

from contextlib import contextmanager
import hashlib
import json
import os
from pathlib import Path
import secrets
import sqlite3
import stat
import time

from .protocol import (
    CODE, MAX_GROUPS, MAX_RECORDS, SyncError, deletion_rank, rank,
    validated_deletions, validated_records, validated_memory, memory_rank,
)
from .content_protocol import (
    MAX_CONTENT_BYTES, canonical_json, content_rank, encoded_bytes, validated_content,
)


class SyncStore:
    def __init__(self, database, *, max_records=MAX_RECORDS, max_groups=MAX_GROUPS,
                 max_deletions=MAX_RECORDS, max_content_records=MAX_RECORDS,
                 max_content_bytes=MAX_CONTENT_BYTES):
        self.path = Path(database).absolute()
        self.max_records = max_records
        self.max_groups = max_groups
        self.max_deletions = max_deletions
        self.max_content_records = max_content_records
        self.max_content_bytes = max_content_bytes
        self.path.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
        # Never chmod an arbitrary shared parent (for example /tmp) behind the caller's back.
        parent = self.path.parent.stat()
        if not stat.S_ISDIR(parent.st_mode) or stat.S_IMODE(parent.st_mode) != 0o700:
            raise ValueError("Database directory must already be private (mode 0700)")
        descriptor = os.open(self.path, os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
        try:
            if not stat.S_ISREG(os.fstat(descriptor).st_mode):
                raise ValueError("Database must be a regular file")
            os.fchmod(descriptor, 0o600)
        finally:
            os.close(descriptor)
        with self.connect() as connection:
            connection.executescript("""
                CREATE TABLE IF NOT EXISTS groups (
                    code_hash TEXT PRIMARY KEY,
                    created_at INTEGER NOT NULL
                );
                CREATE TABLE IF NOT EXISTS records (
                    group_hash TEXT NOT NULL REFERENCES groups(code_hash),
                    dictionary_id TEXT NOT NULL,
                    word_id TEXT NOT NULL,
                    level INTEGER NOT NULL CHECK(level BETWEEN 0 AND 3),
                    clock INTEGER NOT NULL CHECK(clock BETWEEN 0 AND 9007199254740991),
                    device_id TEXT NOT NULL,
                    PRIMARY KEY (group_hash, dictionary_id, word_id)
                );
                CREATE TABLE IF NOT EXISTS deletions (
                    group_hash TEXT NOT NULL REFERENCES groups(code_hash),
                    dictionary_id TEXT NOT NULL,
                    word_id TEXT NOT NULL,
                    deleted INTEGER NOT NULL CHECK(deleted IN (0,1)),
                    clock INTEGER NOT NULL CHECK(clock BETWEEN 0 AND 9007199254740991),
                    device_id TEXT NOT NULL,
                    PRIMARY KEY (group_hash, dictionary_id, word_id)
                );
                CREATE TABLE IF NOT EXISTS memory (
                    group_hash TEXT NOT NULL REFERENCES groups(code_hash),
                    dictionary_id TEXT NOT NULL, word_id TEXT NOT NULL,
                    stage INTEGER NOT NULL, due_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
                    PRIMARY KEY (group_hash, dictionary_id, word_id)
                );
                CREATE TABLE IF NOT EXISTS content (
                    group_hash TEXT NOT NULL REFERENCES groups(code_hash),
                    dictionary_id TEXT NOT NULL,
                    kind TEXT NOT NULL CHECK(kind IN ('dictionary','word')),
                    word_id TEXT NOT NULL,
                    clock INTEGER NOT NULL CHECK(clock BETWEEN 0 AND 9007199254740991),
                    device_id TEXT NOT NULL,
                    deleted INTEGER NOT NULL CHECK(deleted IN (0,1)),
                    payload TEXT NOT NULL,
                    PRIMARY KEY (group_hash, dictionary_id, kind, word_id)
                );
                PRAGMA user_version = 1;
            """)

    @contextmanager
    def connect(self):
        connection = sqlite3.connect(self.path, timeout=15)
        try:
            connection.execute("PRAGMA foreign_keys = ON")
            with connection:
                yield connection
        finally:
            connection.close()

    @staticmethod
    def code_hash(code):
        if not isinstance(code, str) or CODE.fullmatch(code) is None:
            return None
        return hashlib.sha256(code.encode("ascii")).hexdigest()

    def authenticate(self, code):
        digest = self.code_hash(code)
        if digest is None:
            return None
        with self.connect() as connection:
            return digest if connection.execute(
                "SELECT 1 FROM groups WHERE code_hash = ?", (digest,)
            ).fetchone() else None

    def create(self):
        code = "mots-" + secrets.token_urlsafe(32)
        with self.connect() as connection:
            connection.execute("BEGIN IMMEDIATE")
            if connection.execute("SELECT COUNT(*) FROM groups").fetchone()[0] >= self.max_groups:
                raise SyncError(503, "Pairing capacity reached")
            connection.execute("INSERT INTO groups(code_hash, created_at) VALUES (?, ?)",
                               (self.code_hash(code), int(time.time())))
        return {"version": 1, "code": code}

    @staticmethod
    def _require_group(connection, digest):
        if connection.execute("SELECT 1 FROM groups WHERE code_hash = ?", (digest,)).fetchone() is None:
            raise SyncError(401, "Invalid pairing code")

    def exchange(self, digest, envelope):
        return self._exchange(
            digest, validated_records(envelope, self.max_records), table="records",
            columns={"level": "level", "clock": "clock", "deviceID": "device_id"},
            ordering=rank, maximum=self.max_records, capacity_error="Group record limit reached",
        )

    def exchange_deletions(self, digest, envelope):
        return self._exchange(
            digest, validated_deletions(envelope, self.max_deletions), table="deletions",
            columns={"deleted": "deleted", "clock": "clock", "deviceID": "device_id"},
            ordering=deletion_rank, maximum=self.max_deletions, capacity_error="Group deletion limit reached",
        )

    def exchange_memory(self, digest, envelope):
        return self._exchange(
            digest, validated_memory(envelope, self.max_records), table="memory",
            columns={"stage": "stage", "dueAt": "due_at", "updatedAt": "updated_at"},
            ordering=memory_rank, maximum=self.max_records, capacity_error="Group memory limit reached",
        )

    def exchange_content(self, digest, envelope):
        incoming = validated_content(envelope, self.max_content_records)
        with self.connect() as connection:
            connection.execute("BEGIN IMMEDIATE" if incoming else "BEGIN")
            self._require_group(connection, digest)
            rows = connection.execute(
                "SELECT dictionary_id, kind, word_id, clock, device_id, deleted, payload "
                "FROM content WHERE group_hash = ?", (digest,))
            canonical = {}
            for dictionary, kind, word, clock, device, deleted, payload in rows:
                canonical[dictionary, kind, word] = {
                    "dictionaryID": dictionary, "kind": kind, "wordID": word,
                    "clock": clock, "deviceID": device, "deleted": bool(deleted),
                    "payload": json.loads(payload),
                }
            updates = []
            for key, record in incoming.items():
                if key not in canonical or content_rank(record) > content_rank(canonical[key]):
                    canonical[key] = record
                    updates.append((digest, *key, record["clock"], record["deviceID"],
                                    int(record["deleted"]), canonical_json(record["payload"])))
            if len(canonical) > self.max_content_records:
                raise SyncError(413, "Group content record limit reached")
            snapshot = {"version": 1, "records": [canonical[key] for key in sorted(canonical)]}
            if encoded_bytes(snapshot) > self.max_content_bytes:
                raise SyncError(413, "Group content size limit reached")
            if updates:
                connection.executemany(
                    "INSERT INTO content (group_hash,dictionary_id,kind,word_id,clock,device_id,deleted,payload) "
                    "VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(group_hash,dictionary_id,kind,word_id) "
                    "DO UPDATE SET clock=excluded.clock, device_id=excluded.device_id, "
                    "deleted=excluded.deleted,payload=excluded.payload", updates)
        if "knownDigest" in envelope:
            digest_value = hashlib.sha256(canonical_json(snapshot["records"]).encode("utf-8")).hexdigest()
            unchanged = envelope["knownDigest"] == digest_value
            return {"version": 1, "records": [] if unchanged else snapshot["records"],
                    "digest": digest_value, "unchanged": unchanged}
        return snapshot

    def _exchange(self, digest, incoming, *, table, columns, ordering, maximum, capacity_error):
        # Table/column names come only from the fixed channel definitions above.
        column_list = ", ".join(columns.values())
        with self.connect() as connection:
            # A pull needs a consistent snapshot, but can share the database with a writer.
            connection.execute("BEGIN IMMEDIATE" if incoming else "BEGIN")
            self._require_group(connection, digest)
            rows = connection.execute(
                f"SELECT dictionary_id, word_id, {column_list} FROM {table} WHERE group_hash = ?",
                (digest,),
            )
            canonical = {}
            for dictionary, word, *values in rows:
                record = dict(zip(columns, values))
                if table == "deletions":
                    record["deleted"] = bool(record["deleted"])
                canonical[dictionary, word] = {"dictionaryID": dictionary, "wordID": word, **record}

            updates = []
            for key, record in incoming.items():
                if key not in canonical or ordering(record) > ordering(canonical[key]):
                    canonical[key] = record
                    updates.append((digest, *key, *(record[field] for field in columns)))
            if len(canonical) > maximum:
                raise SyncError(413, capacity_error)
            if updates:
                assignments = ", ".join(f"{column}=excluded.{column}" for column in columns.values())
                placeholders = ", ".join("?" for _ in updates[0])
                connection.executemany(
                    f"INSERT INTO {table} (group_hash, dictionary_id, word_id, {column_list}) "
                    f"VALUES ({placeholders}) ON CONFLICT(group_hash, dictionary_id, word_id) "
                    f"DO UPDATE SET {assignments}",
                    updates,
                )
        # The in-memory snapshot is fixed by the transaction. Sort after releasing the lock.
        return {"version": 1, "records": [canonical[key] for key in sorted(canonical)]}
