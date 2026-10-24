#!/usr/bin/env python3
"""Build authored sources into dist, or verify the checked-in build with --check.

Vocabulary and audio are copied from database/runtime. The ordinary build requires Python
and Node only; all interface scripts are authored locally without dependencies.
"""
import argparse
import re
import subprocess
import shutil

from assets import CONTENT, DIST, SRC, digest


def outputs() -> dict[str, bytes]:
    result = {}
    scripts = sorted((SRC / "js").glob("*.js")) + sorted((SRC / "components").glob("*.js"))
    for path in scripts:
        if path.name in result:
            raise ValueError(f"Duplicate interface asset name: {path.name}")
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
    content = [path for path in CONTENT.rglob("*") if path.is_file()]
    stale_content = []
    for source in content:
        destination = DIST / source.relative_to(CONTENT)
        if not destination.is_file() or digest(source.read_bytes()) != digest(destination.read_bytes()):
            stale_content.append((source, destination))
    if args.check and stale_content:
        raise SystemExit("Run make build; generated Web data/audio differs from database/runtime.")
    for source, destination in stale_content:
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
    generated = outputs()
    stale = [name for name, data in generated.items()
             if not (DIST / name).is_file() or (DIST / name).read_bytes() != data]
    if args.check:
        if stale:
            raise SystemExit("Run make build; stale output: " + ", ".join(stale))
        print(f"Build is current: {len(generated)} generated files.")
        return
    DIST.mkdir(exist_ok=True)
    for name in stale:
        (DIST / name).write_bytes(generated[name])
    print(f"Built {len(generated)} interface files ({len(stale)} changed), {len(content)} database assets ({len(stale_content)} copied); asset versions updated.")


if __name__ == "__main__":
    main()
