#!/usr/bin/env python3
"""Check, stage, activate and verify one website/database snapshot on the VPS."""
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import shlex
import subprocess
import sys

from common import ROOT

HOST = "vultr-tokyo-fei"
BASE = "/home/fei/Work/Mots"


def remote(*arguments: str) -> bytes:
    return subprocess.check_output(["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=15", HOST, shlex.join(arguments)])


def main() -> None:
    subprocess.run(["make", "test"], cwd=ROOT, check=True)
    subprocess.run([sys.executable, str(ROOT / "deploy/prepare.py")], check=True)
    manifest = (ROOT / "deploy/release-manifest.json").read_bytes()
    release = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S") + "-" + hashlib.sha256(manifest).hexdigest()[:8]
    candidate = f"{BASE}/releases/{release}"
    previous = remote("readlink", "-f", f"{BASE}/current").decode().strip()
    remote("mkdir", "-p", candidate)
    sources = ["web", "database", "deploy", "sync", "scripts", "README.md", "AUDIO.md", "DESIGN.md", "UX-CONTRACT.md"]
    subprocess.run(["rsync", "-az", "--checksum", "--exclude=__pycache__", *sources, f"{HOST}:{candidate}/"], cwd=ROOT, check=True)
    if remote("cat", f"{candidate}/deploy/release-manifest.json") != manifest:
        raise RuntimeError("Uploaded release manifest differs from the checked local snapshot")
    print(remote("python3", f"{candidate}/deploy/install.py", release).decode(), end="")
    verification = (
        "import pathlib,sys,json,subprocess; "
        f"p=pathlib.Path({BASE!r})/'current'; expected=pathlib.Path({candidate!r}); "
        "assert p.resolve()==expected, 'Current release changed'; "
        "sys.path.insert(0,str(p/'deploy')); import common; m=common.load_manifest(p); common.verify_release(p,m); "
        "states={s:subprocess.check_output(['systemctl','--user','is-active',s],text=True).strip() for s in ['mots-web','mots-tunnel','mots-progress']}; "
        "assert set(states.values())=={'active'}; "
        "print(json.dumps({'release':str(p.resolve()),'files':len(m['files']),'sha256_match':True,'services':states}))"
    )
    server = json.loads(remote("python3", "-c", verification))
    result = subprocess.check_output([sys.executable, str(ROOT / "deploy/verify.py")], text=True)
    public = json.loads(result)
    content = json.loads((ROOT / "database/content-version.json").read_text())
    report = {"checkedAt": datetime.now(timezone.utc).isoformat(), "previousRelease": previous, "contentVersion": content["version"], "database": content["database"], "dictionaries": content["dictionaries"], "server": server, "public": public}
    destination = ROOT / "qa/data-vps-sync.json"
    destination.parent.mkdir(exist_ok=True)
    destination.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(f"Synchronized {content['version'][:16]}: {server['files']} server files, {public['checked']} public checks. Report: {destination}")


if __name__ == "__main__":
    main()
