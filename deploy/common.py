"""Shared paths and integrity checks for Mots releases."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parent.parent
SITE_HOST = "mots.feizhang233.com"
SITE_URL = f"https://{SITE_HOST}/"
RELEASE_MANIFEST = Path("deploy/release-manifest.json")


def file_digest(path: Path) -> str:
    with path.open("rb") as source:
        return hashlib.file_digest(source, "sha256").hexdigest()


def load_manifest(root: Path = ROOT) -> dict:
    manifest = json.loads((root / RELEASE_MANIFEST).read_text(encoding="utf-8"))
    files = manifest.get("files")
    if not isinstance(files, dict) or not files:
        raise ValueError("Release manifest has no files")
    for filename, digest in files.items():
        path = PurePosixPath(filename)
        if not path.parts or path.is_absolute() or ".." in path.parts or path.parts[0] not in {"dist", "database"}:
            raise ValueError(f"Invalid release path: {filename}")
        if not isinstance(digest, str) or len(digest) != 64 or any(c not in "0123456789abcdef" for c in digest):
            raise ValueError(f"Invalid SHA-256: {filename}")
    if "dist/index.html" not in files:
        raise ValueError("Release manifest has no website entry point")
    return manifest


def verify_release(root: Path, manifest: dict) -> None:
    for filename, expected in manifest["files"].items():
        path = (root / filename).resolve()
        if not path.is_relative_to(root.resolve()) or not path.is_file() or file_digest(path) != expected:
            raise ValueError(f"Checksum mismatch: {filename}")
