#!/usr/bin/env python3
"""Exercise deployment integrity and rollback without SSH or local services."""
from contextlib import ExitStack, redirect_stderr, redirect_stdout
import hashlib
import io
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
import urllib.error
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "deploy"))
import common
import install


class OriginResponse(io.BytesIO):
    status = 200


class DeploymentTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name).resolve()
        self.base = self.root / "Mots"
        self.previous = self.base / "releases/previous"
        self.candidate = self.base / "releases/candidate"
        self.home = self.root / "home"
        self.content = b"Mots candidate homepage"
        self.configs = {
            self.base / "config/nginx.conf": "nginx.conf",
            self.home / ".cloudflared/config-mots.yml": "config-mots.yml",
            **{self.home / ".config/systemd/user" / name: name for name in install.SERVICES},
        }
        for directory in (self.previous, self.candidate / "web/dist", self.candidate / "deploy"):
            directory.mkdir(parents=True)
        (self.base / "current").symlink_to(self.previous)
        (self.candidate / "web/dist/index.html").write_bytes(self.content)
        self.manifest = {"files": {"web/dist/index.html": hashlib.sha256(self.content).hexdigest()}}
        self.manifest_file = self.candidate / common.RELEASE_MANIFEST
        self.manifest_file.write_text(json.dumps(self.manifest), encoding="utf-8")
        for destination, filename in self.configs.items():
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(b"previous " + filename.encode())
            destination.chmod(0o640)
            (self.candidate / "deploy" / filename).write_bytes(b"candidate " + filename.encode())
        (self.candidate / "sync").mkdir()
        (self.candidate / "sync/server.py").write_bytes(b"checked sync backend")
        for filename in common.SYNC_RELEASE_FILES:
            path = self.candidate / filename
            if not path.exists():
                path.write_bytes(b"checked sync dependency")
            self.manifest["files"][filename] = common.file_digest(path)
        self.manifest_file.write_text(json.dumps(self.manifest))
        self.active = {name: True for name in install.SERVICES}
        self.enabled = {name: True for name in install.SERVICES}
        self.commands = []
        self.recovery_commands = []

    def assert_previous_intact(self):
        self.assertEqual((self.base / "current").resolve(), self.previous)
        for path, filename in self.configs.items():
            self.assertEqual(path.read_bytes(), b"previous " + filename.encode())
            self.assertEqual(path.stat().st_mode & 0o777, 0o640)

    def activate(self, *, origin=None, invalid_config=None, progress_available=True):
        def command(*args):
            self.commands.append(args)
            if args[0] == "/usr/sbin/nginx" or args[0] == "cloudflared" and "validate" in args:
                self.assert_previous_intact()
                if args[0] == invalid_config:
                    raise subprocess.CalledProcessError(1, args)

        def recover(args, **kwargs):
            self.recovery_commands.append(args)
            return subprocess.CompletedProcess(args, 0)

        def service_state(action, service):
            return (self.active if action == "is-active" else self.enabled)[service]

        with ExitStack() as stack:
            stack.enter_context(patch.object(install, "BASE", self.base))
            stack.enter_context(patch.object(install.Path, "home", return_value=self.home))
            stack.enter_context(patch.object(install, "run", side_effect=command))
            stack.enter_context(patch.object(install, "service_state", side_effect=service_state))
            stack.enter_context(patch.object(install.subprocess, "run", side_effect=recover))
            stack.enter_context(patch.object(install.urllib.request, "urlopen", side_effect=lambda *args, **kwargs: OriginResponse(self.content if origin is None else origin)))
            if not progress_available:
                stack.enter_context(patch.object(install, "wait_for_progress", side_effect=RuntimeError("Progress synchronization service is not ready")))
            stack.enter_context(redirect_stdout(io.StringIO()))
            stack.enter_context(redirect_stderr(io.StringIO()))
            install.activate("candidate")

    def test_valid_release_activates_without_rewriting_dns(self):
        self.activate()
        self.assertEqual((self.base / "current").resolve(), self.candidate)
        for path, filename in self.configs.items():
            self.assertEqual(path.read_bytes(), b"candidate " + filename.encode())
        self.assertFalse(any("dns" in command for command in self.commands))
        self.assertEqual(self.recovery_commands, [])

    def test_wrong_origin_content_restores_release_config_and_permissions(self):
        with self.assertRaisesRegex(RuntimeError, "Origin does not serve"):
            self.activate(origin=b"stale or unexpected homepage")
        self.assert_previous_intact()
        for service in install.SERVICES:
            self.assertIn(["systemctl", "--user", "enable", service], self.recovery_commands)
            self.assertIn(["systemctl", "--user", "restart", service], self.recovery_commands)

    def test_rollback_preserves_disabled_stopped_service(self):
        tunnel = install.SERVICES[1]
        self.active[tunnel] = False
        self.enabled[tunnel] = False
        with self.assertRaises(RuntimeError):
            self.activate(origin=b"wrong homepage")
        self.assert_previous_intact()
        self.assertIn(["systemctl", "--user", "disable", tunnel], self.recovery_commands)
        self.assertIn(["systemctl", "--user", "stop", tunnel], self.recovery_commands)
        self.assertNotIn(["systemctl", "--user", "restart", tunnel], self.recovery_commands)

    def test_nginx_preflight_failure_leaves_active_release_untouched(self):
        with self.assertRaises(subprocess.CalledProcessError):
            self.activate(invalid_config="/usr/sbin/nginx")
        self.assert_previous_intact()
        self.assertEqual(self.recovery_commands, [])
        self.assertFalse(any(command[0] == "systemctl" for command in self.commands))

    def test_tunnel_preflight_failure_leaves_active_release_untouched(self):
        with self.assertRaises(subprocess.CalledProcessError):
            self.activate(invalid_config="cloudflared")
        self.assert_previous_intact()
        self.assertEqual(self.recovery_commands, [])
        self.assertFalse(any(command[0] == "systemctl" for command in self.commands))

    def test_corrupt_upload_is_rejected_before_service_commands(self):
        (self.candidate / "web/dist/index.html").write_bytes(b"corrupt upload")
        with self.assertRaisesRegex(ValueError, "Checksum mismatch"):
            self.activate()
        self.assert_previous_intact()
        self.assertEqual(self.commands, [])
        self.assertEqual(self.recovery_commands, [])

    def test_manifest_rejects_paths_outside_public_release_directories(self):
        for filename in ("../secret", "/secret", "", "scripts/install.py", "web/src/app.js", "web/scripts/build.py"):
            with self.subTest(path=filename):
                manifest = {"files": {**self.manifest["files"], filename: "0" * 64}}
                self.manifest_file.write_text(json.dumps(manifest), encoding="utf-8")
                with self.assertRaisesRegex(ValueError, "Invalid release path"):
                    common.load_manifest(self.candidate)

    def test_manifest_cannot_hide_outside_file_behind_symlink(self):
        outside = self.root / "outside.txt"
        outside.write_bytes(b"outside content")
        (self.candidate / "web/dist/outside.txt").symlink_to(outside)
        self.manifest["files"]["web/dist/outside.txt"] = common.file_digest(outside)
        with self.assertRaisesRegex(ValueError, "Checksum mismatch"):
            common.verify_release(self.candidate, self.manifest)

    def test_progress_failure_restores_stopped_service_and_keeps_private_data(self):
        private = self.base / "private/progress.sqlite3"
        private.parent.mkdir()
        private.write_bytes(b"existing private progress")
        progress = install.SERVICES[2]
        self.active[progress] = False
        self.enabled[progress] = False
        with self.assertRaisesRegex(RuntimeError, "Progress synchronization"):
            self.activate(progress_available=False)
        self.assert_previous_intact()
        self.assertEqual(private.read_bytes(), b"existing private progress")
        self.assertIn(["systemctl", "--user", "stop", progress], self.recovery_commands)
        self.assertIn(["systemctl", "--user", "disable", progress], self.recovery_commands)

    def test_sync_backend_upload_is_verified(self):
        backend = self.candidate / "sync/server.py"
        backend.parent.mkdir(exist_ok=True)
        backend.write_bytes(b"checked backend")
        self.manifest["files"]["sync/server.py"] = common.file_digest(backend)
        self.manifest_file.write_text(json.dumps(self.manifest))
        common.load_manifest(self.candidate)
        backend.write_bytes(b"unexpected backend")
        with self.assertRaisesRegex(ValueError, "Checksum mismatch"):
            self.activate()
        self.assert_previous_intact()
        self.assertEqual(self.commands, [])

    def test_existing_backend_cannot_be_omitted_from_manifest(self):
        for filename in common.SYNC_RELEASE_FILES:
            with self.subTest(path=filename):
                manifest = {"files": {key: value for key, value in self.manifest["files"].items() if key != filename}}
                self.manifest_file.write_text(json.dumps(manifest))
                with self.assertRaisesRegex(ValueError, "Synchronization backend must include checked"):
                    self.activate()
        self.assertEqual(self.commands, [])

    def test_sync_module_corruption_is_rejected_before_activation(self):
        module = self.candidate / "sync/protocol.py"
        module.write_bytes(b"unexpected schema implementation")
        with self.assertRaisesRegex(ValueError, "Checksum mismatch"):
            self.activate()
        self.assert_previous_intact()
        self.assertEqual(self.commands, [])

    def test_missing_backend_and_manifest_entry_fail_before_activation(self):
        (self.candidate / "sync/server.py").unlink()
        self.manifest["files"].pop("sync/server.py")
        self.manifest_file.write_text(json.dumps(self.manifest))
        with self.assertRaisesRegex(ValueError, "Synchronization backend must include checked"):
            self.activate()
        self.assert_previous_intact()
        self.assertEqual(self.commands, [])

    def test_progress_readiness_retries_startup(self):
        with patch.object(install.urllib.request, "urlopen", side_effect=[urllib.error.URLError("starting"), OriginResponse(b"ok")]) as opened:
            with patch.object(install.time, "sleep"):
                install.wait_for_progress()
        self.assertEqual(opened.call_count, 2)


if __name__ == "__main__":
    unittest.main(verbosity=2)
