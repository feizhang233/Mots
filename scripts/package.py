#!/usr/bin/env python3
"""Build the self-contained Mots HTML and the portable project ZIP.

Run with ``python3 scripts/package.py`` from any directory. Only Python's
standard library and Node.js (for JavaScript syntax checks) are required.
"""

from __future__ import annotations

import base64
import copy
import html
import json
import mimetypes
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit
import zipfile


ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "web/dist"
HTML_NAME = "Mots法语词库.html"
ZIP_NAME = "Mots法语词库.zip"
MIME_TYPES = {
    ".m4a": "audio/mp4",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".svg": "image/svg+xml",
}
AUDIO_MANIFESTS = {
    "audio-manifest.js": "MOTS_AUDIO",
    "extra-audio.js": "MOTS_EXTRA_AUDIO",
}


class PackagingError(RuntimeError):
    """An input cannot be safely represented in the standalone output."""


def local_asset(reference: str, base: Path = DIST) -> Path:
    url = urlsplit(reference)
    # Online HTML uses content fingerprints to invalidate CDN/browser caches.
    # Standalone packaging resolves that same local file and embeds its bytes.
    if url.scheme or url.netloc or url.fragment or (url.query and not re.fullmatch(r"v=[a-f0-9]{16}", url.query)):
        raise PackagingError(f"Expected a local asset with an optional content version: {reference}")
    target = (base / unquote(url.path)).resolve()
    if not target.is_relative_to(DIST.resolve()) or not target.is_file():
        raise PackagingError(f"Missing or out-of-tree asset: {reference}")
    return target


def audio_signature(data: bytes, suffix: str) -> None:
    valid = {
        ".m4a": len(data) >= 32 and data[4:8] == b"ftyp",
        ".mp3": len(data) >= 32
        and (data.startswith(b"ID3") or data[0] == 0xFF and data[1] & 0xE0 == 0xE0),
        ".wav": len(data) >= 44 and data[:4] == b"RIFF" and data[8:12] == b"WAVE",
    }
    if suffix in valid and not valid[suffix]:
        raise PackagingError(f"Audio has an invalid {suffix} file signature")


def data_uri(asset: Path, *, check_audio: bool = False) -> str:
    raw = asset.read_bytes()
    suffix = asset.suffix.lower()
    if check_audio:
        audio_signature(raw, suffix)
    mime = MIME_TYPES.get(suffix) or mimetypes.guess_type(asset.name)[0]
    if not mime:
        raise PackagingError(f"No MIME type for asset: {asset.name}")
    encoded = base64.b64encode(raw).decode("ascii")
    if base64.b64decode(encoded, validate=True) != raw:
        raise PackagingError(f"Base64 integrity check failed: {asset.name}")
    return f"data:{mime};base64,{encoded}"


def parse_audio_manifest(source: str, global_name: str = "MOTS_AUDIO") -> dict:
    match = re.search(r"\bwindow\." + re.escape(global_name) + r"\s*=\s*", source)
    if not match:
        raise PackagingError(f"Audio manifest must assign strict JSON to window.{global_name}")
    try:
        manifest, end = json.JSONDecoder().raw_decode(source, match.end())
    except json.JSONDecodeError as exc:
        raise PackagingError(f"Invalid audio manifest JSON: {exc}") from exc
    if not isinstance(manifest, dict):
        raise PackagingError("Audio manifest must be an object")
    trailing = source[end:].strip()
    if trailing not in ("", ";"):
        raise PackagingError("Audio manifest has code after its JSON assignment")
    return manifest


def audio_entry_maps(manifest: dict, global_name: str = "MOTS_AUDIO"):
    groups = manifest.items() if global_name == "MOTS_EXTRA_AUDIO" else [("main", manifest)]
    for group_name, group in groups:
        if not isinstance(group, dict):
            raise PackagingError(f"Audio language group must be an object: {group_name}")
        for section in ("words", "examples"):
            entries = group.get(section, {})
            if not isinstance(entries, dict):
                raise PackagingError(f"Audio manifest {group_name}/{section} must be an object")
            yield f"{group_name}/{section}", entries


def inline_audio_manifest(source: str, global_name: str = "MOTS_AUDIO") -> tuple[str, int]:
    embedded = copy.deepcopy(parse_audio_manifest(source, global_name))
    count = 0
    for section, entries in audio_entry_maps(embedded, global_name):
        for word_id, reference in entries.items():
            if not isinstance(reference, str):
                raise PackagingError(f"Audio path must be a string: {section}/{word_id}")
            asset = local_asset(reference)
            if asset.suffix.lower() not in (".m4a", ".mp3", ".wav"):
                raise PackagingError(f"Unsupported audio format: {reference}")
            entries[word_id] = data_uri(asset, check_audio=True)
            count += 1
    return f"window.{global_name} = " + json.dumps(embedded, ensure_ascii=False, separators=(",", ":")) + ";", count


def safe_script(source: str) -> str:
    # Prevent the HTML parser from ending a script while retaining JS string values.
    return re.sub(r"</script", lambda _: r"<\/script", source, flags=re.IGNORECASE)


def attrs_html(attrs: list[tuple[str, str | None]]) -> str:
    return "".join(
        f" {key}" if value is None else f' {key}="{html.escape(value, quote=True)}"'
        for key, value in attrs
    )


class StandaloneBuilder(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=False)
        self.output: list[str] = []
        self.skip_external_script = False
        self.script_count = 0
        self.audio_count = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag == "script" and values.get("src"):
            if "async" in values or values.get("type", "").lower() == "module":
                raise PackagingError("Async or module scripts require a dedicated bundler")
            asset = local_asset(str(values["src"]))
            source = asset.read_text(encoding="utf-8")
            if asset.name in AUDIO_MANIFESTS:
                source, audio_count = inline_audio_manifest(source, AUDIO_MANIFESTS[asset.name])
                self.audio_count += audio_count
            source = safe_script(source)
            if "defer" in values:
                # Registration order is source order, matching this buildless app's
                # classic deferred scripts. Their globals remain on window.
                source = 'document.addEventListener("DOMContentLoaded", function () {\n' + source + '\n}, {once:true});'
            kept = [(key, value) for key, value in attrs if key not in {"src", "defer", "integrity", "crossorigin"}]
            self.output.append(f"<script{attrs_html(kept)}>\n{source}\n</script>")
            self.skip_external_script = True
            self.script_count += 1
            return
        if tag == "link" and values.get("href"):
            rel = str(values.get("rel", "")).lower().split()
            if "stylesheet" in rel:
                css = local_asset(str(values["href"])).read_text(encoding="utf-8")
                # Current stylesheet is asset-free. Fail instead of quietly
                # producing a file with external font/image dependencies.
                if re.search(r"@import\s|url\s*\(", css, flags=re.IGNORECASE):
                    raise PackagingError("Stylesheet resource URLs must be inlined before packaging")
                if re.search(r"</style", css, flags=re.IGNORECASE):
                    raise PackagingError("Stylesheet contains an HTML closing style token")
                self.output.append("<style>\n" + css + "\n</style>")
                return
            if "icon" in rel:
                uri = data_uri(local_asset(str(values["href"])))
                attrs = [(key, uri if key == "href" else value) for key, value in attrs]
        if tag == "a" and values.get("href") == "./":
            attrs = [(key, HTML_NAME if key == "href" else value) for key, value in attrs]
        if tag in {"img", "audio", "video", "source"} and values.get("src"):
            reference = str(values["src"])
            if not reference.startswith("data:"):
                uri = data_uri(local_asset(reference), check_audio=tag in {"audio", "source"})
                attrs = [(key, uri if key == "src" else value) for key, value in attrs]
        if tag == "script":
            self.script_count += 1
        self.output.append(f"<{tag}{attrs_html(attrs)}>")

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)
        if tag not in {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}:
            self.handle_endtag(tag)

    def handle_endtag(self, tag: str) -> None:
        if tag == "script" and self.skip_external_script:
            self.skip_external_script = False
            return
        self.output.append(f"</{tag}>")

    def handle_data(self, data: str) -> None:
        if not self.skip_external_script:
            self.output.append(data)

    def handle_entityref(self, name: str) -> None:
        self.output.append(f"&{name};")

    def handle_charref(self, name: str) -> None:
        self.output.append(f"&#{name};")

    def handle_comment(self, data: str) -> None:
        if not self.skip_external_script:
            self.output.append(f"<!--{data}-->")

    def handle_decl(self, decl: str) -> None:
        self.output.append(f"<!{decl}>")


class OutputValidator(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=False)
        self.scripts: list[str] = []
        self.active: list[str] | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag == "script":
            if values.get("src"):
                raise PackagingError("Standalone output still has an external script")
            self.active = []
        if tag == "link" and "stylesheet" in str(values.get("rel", "")).split():
            raise PackagingError("Standalone output still has an external stylesheet")
        if tag in {"img", "audio", "video", "source"} and values.get("src"):
            if not str(values["src"]).startswith("data:"):
                raise PackagingError("Standalone output still has an external media asset")

    def handle_endtag(self, tag: str) -> None:
        if tag == "script" and self.active is not None:
            self.scripts.append("".join(self.active))
            self.active = None

    def handle_data(self, data: str) -> None:
        if self.active is not None:
            self.active.append(data)


def validate_output(output: str, expected_scripts: int) -> None:
    parser = OutputValidator()
    parser.feed(output)
    parser.close()
    if len(parser.scripts) != expected_scripts:
        raise PackagingError("Script count changed while generating standalone HTML")
    node = shutil.which("node")
    if not node:
        raise PackagingError("Node.js is required for the JavaScript syntax checks")
    for script in parser.scripts:
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", suffix=".js") as temp:
            temp.write(script)
            temp.flush()
            result = subprocess.run([node, "--check", temp.name], capture_output=True, text=True)
            if result.returncode:
                raise PackagingError("Bundled JavaScript syntax check failed:\n" + result.stderr)


def archive_files() -> list[Path]:
    active_audio: set[Path] = set()
    for filename, global_name in AUDIO_MANIFESTS.items():
        manifest_path = DIST / filename
        if not manifest_path.is_file():
            continue
        manifest = parse_audio_manifest(manifest_path.read_text(encoding="utf-8"), global_name)
        for section, entries in audio_entry_maps(manifest, global_name):
            for reference in entries.values():
                if not isinstance(reference, str):
                    raise PackagingError("Audio manifest paths must be strings")
                active_audio.add((ROOT / "database/runtime" / reference).resolve())
    candidates = [ROOT / HTML_NAME]
    # Native sources travel with the portable project; Xcode build products do not.
    # Client audio copies are excluded below; canonical database audio travels once.
    for directory in ("web", "tests", "docs", "deploy", "sync", "qa", "scripts", "database",
                      "mobile/ios/Mots", "mobile/ios/Mots.xcodeproj", "mobile/ios/scripts", "mobile/ios/Tests"):
        candidates.extend(path for path in (ROOT / directory).rglob("*") if path.is_file())
    candidates.append(ROOT / "mobile/ios/README.md")
    candidates.append(ROOT / "mobile/README.md")
    candidates.extend(ROOT.glob("*.md"))
    candidates.extend(ROOT.glob("premium-*.json"))
    candidates.extend(ROOT / name for name in ("Makefile", ".prettierrc.json", ".prettierignore"))
    return sorted({
        path for path in candidates
        if path.is_file()
        and (path.name in {".prettierrc.json", ".prettierignore"} or not any(
            part.startswith(".") or part in {"__pycache__", "xcuserdata"} for part in path.relative_to(ROOT).parts
        ))
        and path.suffix.lower() not in {".tmp", ".pyc", ".aiff", ".aif", ".sqlite", ".sqlite3", ".db", ".sqlite-wal", ".sqlite-shm", ".sqlite3-wal", ".sqlite3-shm", ".db-wal", ".db-shm"}
        and (path.suffix.lower() not in {".m4a", ".mp3", ".wav"} or path.resolve() in active_audio)
    })


def main() -> None:
    subprocess.run([sys.executable, str(ROOT / "web/scripts/build.py")], check=True, stdout=sys.stderr)
    subprocess.run([sys.executable, str(ROOT / "scripts/sync-data.py")], check=True, stdout=sys.stderr)
    builder = StandaloneBuilder()
    builder.feed((DIST / "index.html").read_text(encoding="utf-8"))
    builder.close()
    output = "".join(builder.output)
    validate_output(output, builder.script_count)
    standalone = ROOT / HTML_NAME
    with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=ROOT, prefix=".mots-html-", delete=False) as temp:
        temp_path = Path(temp.name)
        temp.write(output)
    temp_path.replace(standalone)
    destination = ROOT.parent / ZIP_NAME
    files = archive_files()
    with tempfile.NamedTemporaryFile(dir=ROOT.parent, prefix=".mots-zip-", delete=False) as temp:
        archive_path = Path(temp.name)
    try:
        with zipfile.ZipFile(archive_path, "w", zipfile.ZIP_DEFLATED) as archive:
            for path in files:
                archive.write(path, Path("Mots法语词库") / path.relative_to(ROOT))
        with zipfile.ZipFile(archive_path) as archive:
            if archive.testzip() is not None:
                raise PackagingError("ZIP integrity check failed")
        archive_path.replace(destination)
    finally:
        archive_path.unlink(missing_ok=True)
    print(json.dumps({
        "standalone": str(standalone), "html_bytes": standalone.stat().st_size,
        "zip": str(destination), "zip_bytes": destination.stat().st_size,
        "archive_files": len(files), "inline_scripts": builder.script_count,
        "embedded_audio_files": builder.audio_count, "javascript_syntax": "passed",
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (PackagingError, OSError) as exc:
        raise SystemExit(f"Packaging failed: {exc}") from exc
