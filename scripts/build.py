#!/usr/bin/env python3
"""Build authored sources into dist, or verify the checked-in build with --check.

Vocabulary, audio, and the pinned Material bundle are retained in dist. The
ordinary build requires Python and Node only; it never downloads dependencies.
"""
import argparse
import json
import re
import subprocess

from assets import DIST, SRC, VENDOR, digest, select_input_digest


def outputs() -> dict[str, bytes]:
    metadata = json.loads((VENDOR / "build.json").read_text())
    if metadata != {
        "inputs_sha256": select_input_digest(),
        "bundle_sha256": digest((DIST / "select.js").read_bytes()),
    }:
        raise ValueError("Material Select changed; rebuild with scripts/build-material-select.py")

    result = {}
    for path in sorted((SRC / "js").glob("*.js")):
        subprocess.run(["node", "--check", str(path)], check=True)
        result[path.name] = path.read_bytes()
    for path in sorted((SRC / "styles").glob("*.css")):
        result[path.name] = path.read_bytes()
    result["icon.svg"] = (SRC / "icon.svg").read_bytes()

    def version_asset(match):
        name = match.group("name")
        path = (DIST / name).resolve()
        if not path.is_relative_to(DIST.resolve()):
            raise ValueError(f"Asset outside dist: {name}")
        data = result[name] if name in result else path.read_bytes()
        return f'{match.group("attr")}{name}?v={digest(data)[:16]}"'

    result["index.html"] = re.sub(
        r'(?P<attr>(?:src|href)=")(?P<name>[^"?#]+\.(?:js|css))(?:\?v=[^"\s]*)?"',
        version_asset,
        (SRC / "index.html").read_text(),
    ).encode()
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Fail when dist differs from source")
    args = parser.parse_args()
    generated = outputs()
    stale = [name for name, data in generated.items()
             if not (DIST / name).is_file() or (DIST / name).read_bytes() != data]
    if args.check:
        if stale:
            raise SystemExit("Run python3 scripts/build.py; stale output: " + ", ".join(stale))
        print(f"Build is current: {len(generated)} generated files.")
        return
    DIST.mkdir(exist_ok=True)
    for name in stale:
        (DIST / name).write_bytes(generated[name])
    print(f"Built {len(generated)} files ({len(stale)} changed); asset versions updated.")


if __name__ == "__main__":
    main()
