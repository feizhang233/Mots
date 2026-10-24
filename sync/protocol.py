"""Exact wire schemas and deterministic conflict rules for both sync channels."""

import re
import unicodedata

MAX_BODY = 32 * 1024 * 1024
MAX_RECORDS = 100_000
MAX_GROUPS = 10_000
MAX_CLOCK = 9_007_199_254_740_991
BASE = "/api/sync"
FIELDS = {"dictionaryID", "wordID", "level", "clock", "deviceID"}
DELETION_FIELDS = {"dictionaryID", "wordID", "deleted", "clock", "deviceID"}
CODE = re.compile(r"mots-[A-Za-z0-9_-]{43}\Z", re.ASCII)
DEVICE = re.compile(r"[0-9a-f]{32}\Z", re.ASCII)
RESERVED = {"__proto__", "constructor", "prototype"}


class SyncError(Exception):
    def __init__(self, status, message):
        self.status = status
        self.message = message
        super().__init__(message)


def identifier(value, maximum):
    if not isinstance(value, str) or not 1 <= len(value) <= maximum or value in RESERVED:
        return False
    return all(unicodedata.category(char) not in {"Cc", "Cs"} for char in value)


def _validated_channel(envelope, maximum, *, deletions):
    """Share envelope/identity checks while keeping each channel's value type exact."""
    if (not isinstance(envelope, dict) or set(envelope) != {"version", "records"}
            or type(envelope["version"]) is not int or envelope["version"] != 1
            or not isinstance(envelope["records"], list)):
        raise SyncError(400, "Invalid deletion envelope" if deletions else "Invalid exchange envelope")
    if len(envelope["records"]) > maximum:
        raise SyncError(413, "Too many deletion records" if deletions else "Too many records")
    fields = DELETION_FIELDS if deletions else FIELDS
    ordering = deletion_rank if deletions else rank
    winners = {}
    for record in envelope["records"]:
        if (not isinstance(record, dict) or set(record) != fields
                or not identifier(record["dictionaryID"], 128)
                or not identifier(record["wordID"], 256)
                or type(record["clock"]) is not int or not 0 <= record["clock"] <= MAX_CLOCK
                or not isinstance(record["deviceID"], str)):
            raise SyncError(400, "Invalid deletion record" if deletions else "Invalid progress record")
        if deletions:
            valid_value = type(record["deleted"]) is bool
            valid_device = DEVICE.fullmatch(record["deviceID"]) is not None
        else:
            valid_value = type(record["level"]) is int and 0 <= record["level"] <= 3
            valid_device = (DEVICE.fullmatch(record["deviceID"]) is not None
                            or (record["clock"] == 0 and record["deviceID"] == ""))
        if not valid_value or not valid_device:
            raise SyncError(400, "Invalid deletion record" if deletions else "Invalid progress record")
        key = record["dictionaryID"], record["wordID"]
        if key not in winners or ordering(record) > ordering(winners[key]):
            winners[key] = record
    return winners


def validated_records(envelope, maximum=MAX_RECORDS):
    return _validated_channel(envelope, maximum, deletions=False)


def rank(record):
    return record["clock"], record["deviceID"], record["level"]


def deletion_rank(record):
    return record["clock"], record["deviceID"], int(record["deleted"])


def validated_deletions(envelope, maximum=MAX_RECORDS):
    return _validated_channel(envelope, maximum, deletions=True)


def reject_json_constant(value):
    raise ValueError("Non-finite JSON number")


def unique_json_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("Duplicate JSON field")
        result[key] = value
    return result
