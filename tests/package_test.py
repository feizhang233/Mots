"""Check the portable archive against a small, isolated project."""
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import package


class PackageTests(unittest.TestCase):
    def test_archive_keeps_canonical_audio_and_excludes_local_artifacts(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory).resolve()
            dist = root / "web/dist"
            keep = {"docs/check.md", "database/runtime/audio/clip one.m4a", "web/dist/audio-manifest.js"}
            skip = {
                "web/dist/audio/clip one.m4a", "database/runtime/audio/unused.m4a",
                "qa/progress-sync/phone-install.json", "qa/signing/device-details.json",
                "mobile/ios/Tests/Mots.app/Mots", "web/profile.mobileprovision", "web/device.ipa",
                "sync/private/backup.json", "sync/progress.sqlite3-journal", ".private.md",
            }
            for name in keep | skip:
                path = root / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(b"fixture")
            (root / "web/linked-backup.json").symlink_to(root / "sync/private/backup.json")
            manifest = {"words": {"test": "audio/clip%20one.m4a?v=0123456789abcdef"}}
            (dist / "audio-manifest.js").write_text("window.MOTS_AUDIO = " + json.dumps(manifest))
            with patch.object(package, "ROOT", root), patch.object(package, "DIST", dist):
                files = package.archive_files()
                (root / "database/runtime/audio/clip one.m4a").unlink()
                with self.assertRaisesRegex(package.PackagingError, "Missing canonical audio in archive"):
                    package.archive_files()
            self.assertEqual({path.relative_to(root).as_posix() for path in files}, keep)

    def test_audio_reference_must_point_to_a_supported_recording(self):
        with tempfile.TemporaryDirectory() as directory:
            dist = Path(directory).resolve()
            (dist / "unrelated.json").write_text("{}")
            with patch.object(package, "DIST", dist):
                with self.assertRaisesRegex(package.PackagingError, "Unsupported audio format"):
                    package.audio_asset("unrelated.json")

    def test_failed_zip_validation_preserves_previous_outputs(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory).resolve() / "project"
            dist = root / "web/dist"
            dist.mkdir(parents=True)
            (dist / "index.html").write_text("<p>New entry</p>")
            standalone = root / package.HTML_NAME
            archive = root.parent / package.ZIP_NAME
            for path in (standalone, archive):
                path.write_bytes(b"previous output")
            with patch.object(package, "ROOT", root), patch.object(package, "DIST", dist), \
                 patch.object(package.subprocess, "run"), patch.object(package.zipfile.ZipFile, "testzip", return_value="bad"):
                with self.assertRaisesRegex(package.PackagingError, "ZIP integrity check failed"):
                    package.main()
            for path in (standalone, archive):
                self.assertEqual(path.read_bytes(), b"previous output")


if __name__ == "__main__":
    unittest.main()
