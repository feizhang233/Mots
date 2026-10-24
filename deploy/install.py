#!/usr/bin/env python3
"""Validate and activate a VPS release, restoring the previous version on failure."""
from __future__ import annotations

import argparse
import hashlib
import os
from pathlib import Path
import stat
import subprocess
import sys
import tempfile
import time
import urllib.request
import uuid

from common import SITE_HOST, load_manifest, verify_release

BASE = Path("/home/fei/Work/Mots")
TUNNEL_ID = "568fa3b6-c349-42d1-9f4f-a0c3da928dc0"
SERVICES = ("mots-web.service", "mots-tunnel.service", "mots-progress.service")


def run(*args: str) -> None:
    subprocess.run(args, check=True)


def service_state(action: str, service: str) -> bool:
    return subprocess.run(["systemctl", "--user", action, "--quiet", service], check=False).returncode == 0


def wait_for_progress() -> None:
    deadline = time.monotonic() + 15
    while True:
        try:
            with urllib.request.urlopen("http://127.0.0.1:8011/api/sync/health", timeout=2) as response:
                if response.status == 200:
                    return
        except OSError:
            pass
        if time.monotonic() >= deadline:
            raise RuntimeError("Progress synchronization service is not ready")
        time.sleep(0.2)


def switch_current(base: Path, target: Path | None) -> None:
    current = base / "current"
    if target is None:
        current.unlink(missing_ok=True)
        return
    pending = base / f".current-{uuid.uuid4().hex}"
    try:
        pending.symlink_to(target, target_is_directory=True)
        pending.replace(current)
    finally:
        pending.unlink(missing_ok=True)


def replace_file(path: Path, content: bytes, mode: int) -> None:
    """Replace a config atomically instead of leaving partially written files."""
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as stream:
        pending = Path(stream.name)
        try:
            stream.write(content)
            stream.flush()
            os.fchmod(stream.fileno(), mode)
            pending.replace(path)
        finally:
            pending.unlink(missing_ok=True)


def activate(release_name: str, *, configure_dns: bool = False) -> None:
    release = (BASE / "releases" / release_name).resolve()
    if release.parent != BASE / "releases":
        raise ValueError("Invalid release path")
    current = BASE / "current"
    if current.exists() and not current.is_symlink():
        raise ValueError("Current release must be a symbolic link")
    previous = current.resolve() if current.is_symlink() else None
    manifest = load_manifest(release)
    verify_release(release, manifest)
    print(f"Verified {len(manifest['files'])} files", flush=True)

    units = Path.home() / ".config/systemd/user"
    tunnel_config = Path.home() / ".cloudflared/config-mots.yml"
    for directory in (BASE / "config", BASE / "run", BASE / "logs", units, tunnel_config.parent):
        directory.mkdir(parents=True, exist_ok=True)
    # Both checks read candidate files before any active file or symlink changes.
    run("/usr/sbin/nginx", "-t", "-p", str(BASE) + "/", "-c", str(release / "deploy/nginx.conf"))
    run("cloudflared", "--config", str(release / "deploy/config-mots.yml"), "tunnel", "ingress", "validate")

    copies = {BASE / "config/nginx.conf": release / "deploy/nginx.conf", tunnel_config: release / "deploy/config-mots.yml"}
    copies.update({units / name: release / "deploy" / name for name in SERVICES})
    backups = {path: (path.read_bytes(), stat.S_IMODE(path.stat().st_mode)) if path.exists() else None for path in copies}
    was_active = {name: service_state("is-active", name) for name in SERVICES}
    was_enabled = {name: service_state("is-enabled", name) for name in SERVICES}
    changed = {path for path, source in copies.items() if backups[path] is None or backups[path][0] != source.read_bytes()}
    try:
        for path in changed:
            source = copies[path]
            replace_file(path, source.read_bytes(), stat.S_IMODE(source.stat().st_mode))
        switch_current(BASE, release)
        run("systemctl", "--user", "daemon-reload")
        run("systemctl", "--user", "enable", "--now", SERVICES[2])
        run("systemctl", "--user", "restart", SERVICES[2])
        # Backend data lives outside releases and survives both upgrades and rollback.
        wait_for_progress()
        run("systemctl", "--user", "enable", "--now", SERVICES[0])
        run("systemctl", "--user", "restart" if units / SERVICES[0] in changed else "reload", SERVICES[0])
        with urllib.request.urlopen("http://127.0.0.1:8010/", timeout=15) as response:
            if response.status != 200 or hashlib.sha256(response.read()).hexdigest() != manifest["files"]["web/dist/index.html"]:
                raise RuntimeError("Origin does not serve the new release")
        print("Origin HTTP 200 and homepage SHA-256 matched", flush=True)
        if configure_dns or previous is None:
            run("cloudflared", "--config", str(tunnel_config), "tunnel", "route", "dns", "--overwrite-dns", TUNNEL_ID, SITE_HOST)
        run("systemctl", "--user", "enable", "--now", SERVICES[1])
        if was_active[SERVICES[1]] and (tunnel_config in changed or units / SERVICES[1] in changed):
            run("systemctl", "--user", "restart", SERVICES[1])
        for service in SERVICES:
            if not service_state("is-active", service):
                raise RuntimeError(f"Service is not active: {service}")
    except BaseException:
        switch_current(BASE, previous)
        for path, backup in backups.items():
            if backup is None:
                path.unlink(missing_ok=True)
            else:
                replace_file(path, *backup)
        recovery_commands = [["systemctl", "--user", "daemon-reload"]]
        for service in SERVICES:
            recovery_commands.append(["systemctl", "--user", "enable" if was_enabled[service] else "disable", service])
            recovery_commands.append(["systemctl", "--user", "restart" if was_active[service] else "stop", service])
        failed = [command for command in recovery_commands if subprocess.run(command, check=False).returncode != 0]
        print(f"Activation failed; restored previous release and configuration: {previous}", file=sys.stderr)
        if failed:
            print(f"Service recovery requires attention: {failed}", file=sys.stderr)
        raise
    print(f"Activated {release.name}", flush=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("release", help="Directory name under /home/fei/Work/Mots/releases")
    parser.add_argument("--configure-dns", action="store_true", help="Reapply the existing tunnel DNS route (automatic for first install)")
    args = parser.parse_args()
    activate(args.release, configure_dns=args.configure_dns)


if __name__ == "__main__":
    main()
