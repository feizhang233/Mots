"""Private SQLite storage and atomic per-group synchronization transactions."""

from contextlib import contextmanager
import hashlib
import os
from pathlib import Path
import secrets
import sqlite3
import stat
import time

from .protocol import (
    CODE, MAX_GROUPS, MAX_RECORDS, SyncError, deletion_rank, rank,
    validated_deletions, validated_records,
)


class SyncStore:
    def __init__(self, database, *, max_records=MAX_RECORDS, max_groups=MAX_GROUPS,
                 max_deletions=MAX_RECORDS):
        self.path = Path(database).absolute()
        self.max_records = max_records
        self.max_groups = max_groups
        self.max_deletions = max_deletions
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
        incoming = validated_records(envelope, self.max_records)
        with self.connect() as connection:
            connection.execute("BEGIN IMMEDIATE")
            self._require_group(connection, digest)
            rows = connection.execute(
                "SELECT dictionary_id, word_id, level, clock, device_id FROM records WHERE group_hash = ?",
                (digest,)).fetchall()
            canonical = {(dictionary, word): {"dictionaryID": dictionary, "wordID": word,
                "level": level, "clock": clock, "deviceID": device}
                for dictionary, word, level, clock, device in rows}
            if len(canonical.keys() | incoming.keys()) > self.max_records:
                raise SyncError(413, "Group record limit reached")
            for key, record in incoming.items():
                if key not in canonical or rank(record) > rank(canonical[key]):
                    canonical[key] = record
                    connection.execute("""
                        INSERT INTO records(group_hash,dictionary_id,word_id,level,clock,device_id)
                        VALUES (?,?,?,?,?,?) ON CONFLICT(group_hash,dictionary_id,word_id)
                        DO UPDATE SET level=excluded.level,clock=excluded.clock,device_id=excluded.device_id
                    """, (digest, record["dictionaryID"], record["wordID"], record["level"],
                          record["clock"], record["deviceID"]))
            # Build the response inside the same transaction as the merge.
            snapshot = [canonical[key] for key in sorted(canonical)]
        return {"version": 1, "records": snapshot}

    def exchange_deletions(self, digest, envelope):
        incoming = validated_deletions(envelope, self.max_deletions)
        with self.connect() as connection:
            connection.execute("BEGIN IMMEDIATE")
            self._require_group(connection, digest)
            rows = connection.execute(
                "SELECT dictionary_id, word_id, deleted, clock, device_id FROM deletions WHERE group_hash = ?",
                (digest,)).fetchall()
            canonical = {(dictionary, word): {"dictionaryID": dictionary, "wordID": word,
                "deleted": bool(deleted), "clock": clock, "deviceID": device}
                for dictionary, word, deleted, clock, device in rows}
            if len(canonical.keys() | incoming.keys()) > self.max_deletions:
                raise SyncError(413, "Group deletion limit reached")
            for key, record in incoming.items():
                if key not in canonical or deletion_rank(record) > deletion_rank(canonical[key]):
                    canonical[key] = record
                    connection.execute("""
                        INSERT INTO deletions(group_hash,dictionary_id,word_id,deleted,clock,device_id)
                        VALUES (?,?,?,?,?,?) ON CONFLICT(group_hash,dictionary_id,word_id)
                        DO UPDATE SET deleted=excluded.deleted,clock=excluded.clock,device_id=excluded.device_id
                    """, (digest, record["dictionaryID"], record["wordID"], int(record["deleted"]),
                          record["clock"], record["deviceID"]))
            # Both true and false registers survive; absence never means a restore.
            snapshot = [canonical[key] for key in sorted(canonical)]
        return {"version": 1, "records": snapshot}
