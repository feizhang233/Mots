#!/usr/bin/env python3
"""Validate static assets, version resources, and write the release manifest."""
import importlib.util
import json
import subprocess
import sys

from common import ROOT, RELEASE_MANIFEST, SYNC_RELEASE_FILES, file_digest


def main() -> None:
    subprocess.run([sys.executable, str(ROOT / "web/scripts/build.py")], check=True)
    subprocess.run([sys.executable, str(ROOT / "scripts/sync-data.py")], check=True)
    spec = importlib.util.spec_from_file_location("mots_package", ROOT / "scripts/package.py")
    package = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(package)
    count = 0
    for filename, global_name in package.AUDIO_MANIFESTS.items():
        manifest = package.parse_audio_manifest((ROOT / "web/dist" / filename).read_text(), global_name)
        for _section, entries in package.audio_entry_maps(manifest, global_name):
            for reference in entries.values():
                asset = package.local_asset(reference)
                package.audio_signature(asset.read_bytes(), asset.suffix)
                count += 1
    for path in (ROOT / "web/dist").rglob("*.js"):
        subprocess.run(["node", "--check", str(path)], check=True)

    files = {
        str(path.relative_to(ROOT)): file_digest(path)
        for folder in ("web/dist", "database")
        for path in sorted((ROOT / folder).rglob("*")) if path.is_file()
    }
    for filename in SYNC_RELEASE_FILES:
        files[filename] = file_digest(ROOT / filename)
    (ROOT / RELEASE_MANIFEST).write_text(json.dumps({"audio_references": count, "files": files}, ensure_ascii=False, indent=2) + "\n")
    print(f"Validated {count} audio references and {len(files)} files.")


if __name__ == "__main__":
    main()
