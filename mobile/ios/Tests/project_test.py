#!/usr/bin/env python3
"""Check signed-bundle resource layout and preservation of Xcode account choices."""
import importlib.util
import json
from pathlib import Path
import plistlib
import subprocess
import struct
import tempfile
import unittest

spec = importlib.util.spec_from_file_location("mots_project", Path(__file__).resolve().parents[1] / "scripts/generate-project.py")
project = importlib.util.module_from_spec(spec)
spec.loader.exec_module(project)
SOURCE_ROOT = project.ROOT


def read_project(path):
    return json.loads(subprocess.check_output(["plutil", "-convert", "json", "-o", "-", str(path)]))


class ProjectTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.previous_root = project.ROOT
        self.addCleanup(setattr, project, "ROOT", self.previous_root)
        project.ROOT = Path(temporary.name)
        project.main()
        self.path = project.ROOT / "Mots.xcodeproj/project.pbxproj"

    def test_resources_do_not_create_reserved_top_level_directory(self):
        objects = read_project(self.path)["objects"]
        paths = {obj.get("path") for obj in objects.values() if obj.get("isa") == "PBXFileReference"}
        self.assertNotIn("Resources", paths)
        self.assertIn("Resources/catalog.json", paths)
        self.assertIn("Resources/audio", paths)

    def test_regeneration_preserves_team_and_bundle_identity(self):
        data = read_project(self.path)
        objects = data["objects"]
        target = next(obj for obj in objects.values() if obj.get("isa") == "PBXNativeTarget")
        for key in objects[target["buildConfigurationList"]]["buildConfigurations"]:
            settings = objects[key]["buildSettings"]
            settings["DEVELOPMENT_TEAM"] = "TESTTEAM01"
            settings["PRODUCT_BUNDLE_IDENTIFIER"] = "example.owner.mots"
            settings["MARKETING_VERSION"] = "2.4"
            settings["CURRENT_PROJECT_VERSION"] = "55"
        self.path.write_bytes(plistlib.dumps(data))
        project.main()
        saved = project.existing_target_settings(self.path)
        self.assertEqual(set(saved), {"Debug", "Release"})
        for settings in saved.values():
            self.assertEqual(settings["DEVELOPMENT_TEAM"], "TESTTEAM01")
            self.assertEqual(settings["PRODUCT_BUNDLE_IDENTIFIER"], "example.owner.mots")
            self.assertEqual(settings["MARKETING_VERSION"], "2.4")
            self.assertEqual(settings["CURRENT_PROJECT_VERSION"], "55")

    def test_manifest_sources_exist_once_and_match_project_groups(self):
        manifest = project.source_manifest()
        expected = manifest["model"] + manifest["app"]
        actual = {path.relative_to(SOURCE_ROOT / "Mots").as_posix() for path in (SOURCE_ROOT / "Mots").rglob("*.swift")}
        self.assertEqual(set(expected), actual, "Every native source must have exactly one declared compilation scope")
        self.assertEqual(len(expected), len(set(expected)))
        data = read_project(self.path)
        objects = data["objects"]
        root = objects[data["rootObject"]]["mainGroup"]
        paths = {}

        def visit(key, parent=Path()):
            item = objects[key]
            location = parent / item.get("path", "")
            if item.get("isa") == "PBXGroup":
                for child in item["children"]:
                    visit(child, location)
            elif item.get("lastKnownFileType") == "sourcecode.swift":
                paths[key] = location.relative_to("Mots").as_posix()

        visit(root)
        target = next(item for item in objects.values() if item.get("isa") == "PBXNativeTarget")
        phase = next(objects[key] for key in target["buildPhases"] if objects[key]["isa"] == "PBXSourcesBuildPhase")
        compiled = [paths[objects[key]["fileRef"]] for key in phase["files"]]
        self.assertCountEqual(compiled, expected, "Nested Xcode groups must resolve to the manifest files without omissions or duplicates")

    def test_model_harness_scope_excludes_application_ui(self):
        manifest = project.source_manifest()
        for relative in manifest["model"]:
            with self.subTest(source=relative):
                self.assertIn(Path(relative).parts[0], {"Domain", "Data", "Sync"})
                text = (SOURCE_ROOT / "Mots" / relative).read_text()
                self.assertNotIn("import SwiftUI", text)
                self.assertNotIn("import UIKit", text)

    def test_mode_presentation_typechecks_against_existing_domain_members(self):
        # This app-scoped extension is Foundation-only, so check it with its domain type here.
        # Syntax parsing alone cannot detect duplicate members across files.
        with tempfile.TemporaryDirectory() as module_cache:
            subprocess.run(["xcrun", "swiftc", "-typecheck", "-module-cache-path", module_cache,
                            str(SOURCE_ROOT / "Mots/Domain/Models.swift"),
                            str(SOURCE_ROOT / "Mots/App/StudyModePresentation.swift")],
                           check=True, capture_output=True, text=True)

    def test_native_app_icon_is_an_opaque_full_size_asset(self):
        objects = read_project(self.path)["objects"]
        target = next(obj for obj in objects.values() if obj.get("isa") == "PBXNativeTarget")
        for key in objects[target["buildConfigurationList"]]["buildConfigurations"]:
            settings = objects[key]["buildSettings"]
            self.assertEqual(settings["ASSETCATALOG_COMPILER_APPICON_NAME"], "AppIcon")
        icon = SOURCE_ROOT / "Mots/Assets.xcassets/AppIcon.appiconset"
        catalog = json.loads((icon / "Contents.json").read_text())
        self.assertEqual(catalog["images"], [{"filename": "AppIcon.png", "idiom": "universal", "platform": "ios", "size": "1024x1024"}])
        png = (icon / catalog["images"][0]["filename"]).read_bytes()
        self.assertEqual(png[:8], b"\x89PNG\r\n\x1a\n")
        self.assertEqual(png[12:16], b"IHDR")
        width, height, depth, color_type = struct.unpack(">IIBB", png[16:26])
        self.assertEqual((width, height, depth, color_type), (1024, 1024, 8, 2), "App icon must be opaque RGB, without an alpha channel")


if __name__ == "__main__":
    unittest.main(verbosity=2)
