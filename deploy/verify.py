#!/usr/bin/env python3
"""Check public HTTPS resources against the local release manifest."""
from concurrent.futures import ThreadPoolExecutor
import argparse
import hashlib
import ipaddress
import json
from pathlib import Path
import re
import subprocess
import tempfile
from urllib.parse import quote

from common import ROOT, SITE_HOST, SITE_URL, load_manifest


def audio_samples() -> list[str]:
    source = (ROOT / "web/dist/audio-manifest.js").read_text(encoding="utf-8")
    audio = json.loads(re.sub(r"^window\.MOTS_AUDIO\s*=\s*", "", source).rstrip(";\n "))
    samples = []
    for section in ("words", "examples"):
        entries = list(audio[section].values())
        samples.extend(entries[::max(1, len(entries) // 16)])
    return samples


def verify(resolve_ip: str | None = None) -> dict:
    manifest = load_manifest()
    curl = ["curl", "--ipv4", "--fail", "--silent", "--show-error", "--max-time", "30"]
    if resolve_ip:
        ipaddress.IPv4Address(resolve_ip)
        curl += ["--resolve", f"{SITE_HOST}:443:{resolve_ip}"]
    # Include nested code assets if the build layout grows beyond flat web/dist/.
    paths = [path for path in manifest["files"] if
             path.startswith("database/") and Path(path).suffix not in {".m4a", ".mp3", ".wav"}
             or path.startswith("web/dist/") and ("/" not in path.removeprefix("web/dist/") or Path(path).suffix in {".js", ".css"})]
    samples = audio_samples()
    paths.extend("web/dist/" + path for path in samples)

    def check(path: str) -> dict:
        public = path.removeprefix("web/dist/") if path.startswith("web/dist/") else path
        version = "?v=" + manifest["files"][path][:16] if path.startswith("web/dist/") and Path(path).suffix in {".js", ".css"} else ""
        data = subprocess.check_output(curl + [SITE_URL + quote(public) + version])
        if hashlib.sha256(data).hexdigest() != manifest["files"][path]:
            raise RuntimeError(f"Public resource differs from release: {public}")
        return {"path": public + version, "status": 200}

    with ThreadPoolExecutor(max_workers=6) as pool:
        results = list(pool.map(check, dict.fromkeys(paths)))
    if not samples:
        raise RuntimeError("No audio available for the range check")
    with tempfile.TemporaryDirectory() as directory:
        header_path = Path(directory) / "headers"
        data = subprocess.check_output(curl + ["--range", "0-31", "--dump-header", str(header_path), SITE_URL + quote(samples[0])])
        headers = header_path.read_text()
        content_range = re.search(r"^content-range: (.+)", headers, re.I | re.M)
        if not re.search(r"^HTTP/\S+ 206", headers, re.M) or not re.search(r"^content-type: audio/(mp4|x-m4a)", headers, re.I | re.M) or len(data) != 32 or content_range is None:
            raise RuntimeError(f"Invalid audio range response: {headers}")
        sync_header_path = Path(directory) / "sync-headers"
        health = json.loads(subprocess.check_output(curl + ["--dump-header", str(sync_header_path), SITE_URL + "api/sync/health"]))
        if health != {"version": 1, "status": "ok"} or not re.search(r"^cache-control:.*no-store", sync_header_path.read_text(), re.I | re.M):
            raise RuntimeError("Public progress synchronization health or cache policy is incorrect")
    return {"url": SITE_URL, "public_ipv4_override": resolve_ip, "checked": len(results), "sha256_match": True, "audio_range_status": 206, "content_range": content_range.group(1).strip(), "sync_health": health, "checks": results}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--resolve-ip", help="Public IPv4 from DNS; bypass a stale local DNS cache while retaining TLS verification")
    args = parser.parse_args()
    print(json.dumps(verify(args.resolve_ip), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
