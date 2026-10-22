"""Paths and content fingerprints shared by the local build scripts."""
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
DIST = ROOT / "dist"
VENDOR = ROOT / "scripts/vendor/material-select"


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def select_input_digest() -> str:
    paths = [SRC / "components/material-select.js", VENDOR / "dependencies.json"]
    paths.extend(sorted(path for path in VENDOR.iterdir() if "LICENSE" in path.name))
    return digest(b"\0".join(path.read_bytes() for path in paths))
