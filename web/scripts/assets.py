"""Paths and content fingerprints shared by the local build scripts."""
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "web/src"
DIST = ROOT / "web/dist"
CONTENT = ROOT / "database/runtime"


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()
