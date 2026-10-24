#!/usr/bin/env python3
"""Generate the dependency-free Xcode project; no external project generator needed."""
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parent.parent
SOURCE_MANIFEST = Path(__file__).with_name("sources.json")


def source_manifest():
    manifest = json.loads(SOURCE_MANIFEST.read_text())
    if set(manifest) != {"model", "app"} or not all(isinstance(value, list) for value in manifest.values()):
        raise ValueError("Source manifest must contain model and app source lists")
    paths = manifest["model"] + manifest["app"]
    if len(paths) != len(set(paths)) or any(not isinstance(path, str) or not path.endswith(".swift") or ".." in Path(path).parts or Path(path).is_absolute() for path in paths):
        raise ValueError("Source manifest contains invalid or duplicate paths")
    return manifest


def identifier(name):
    return hashlib.sha256(name.encode()).hexdigest()[:24].upper()


def quoted(value):
    return json.dumps(str(value), ensure_ascii=False)


def existing_target_settings(project):
    if not project.is_file():
        return {}
    data = json.loads(subprocess.check_output(["plutil", "-convert", "json", "-o", "-", str(project)]))
    objects = data["objects"]
    target = next((obj for obj in objects.values() if obj.get("isa") == "PBXNativeTarget" and obj.get("name") == "Mots"), None)
    if target is None:
        raise ValueError("Existing project has no Mots target; refusing to overwrite signing configuration")
    configurations = objects[target["buildConfigurationList"]]["buildConfigurations"]
    preserved = ("DEVELOPMENT_TEAM", "PRODUCT_BUNDLE_IDENTIFIER", "MARKETING_VERSION", "CURRENT_PROJECT_VERSION")
    return {objects[key]["name"]: {name: objects[key]["buildSettings"][name] for name in preserved if name in objects[key]["buildSettings"]} for key in configurations}


def main():
    saved_settings = existing_target_settings(ROOT / "Mots.xcodeproj/project.pbxproj")
    objects = []

    def add(name, text):
        objects.append(f"\t\t{identifier(name)} = {{ {text} }};")
        return identifier(name)

    manifest = source_manifest()
    sources = manifest["model"] + manifest["app"]
    # Copy resources into the normal flat iOS bundle. A top-level Resources
    # directory makes codesign misclassify sibling data as nested code.
    resources = [("Resources/catalog.json", "text.json"), ("Resources/audio", "folder"), ("Assets.xcassets", "folder.assetcatalog"), ("PrivacyInfo.xcprivacy", "text.xml")]
    source_builds, resource_builds, children = [], [], []
    groups = {"": []}
    for name in sources:
        path = Path(name)
        parent = ""
        for part in path.parts[:-1]:
            directory = str(Path(parent) / part)
            if directory not in groups:
                groups[directory] = []
                groups[parent].append(identifier("source-group:" + directory))
            parent = directory
        ref = add(name, f"isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = {quoted(path.name)}; sourceTree = \"<group>\";")
        groups[parent].append(ref)
        source_builds.append(add("build:" + name, f"isa = PBXBuildFile; fileRef = {ref};"))
    for directory, contents in groups.items():
        if directory:
            add("source-group:" + directory, f'isa = PBXGroup; children = ({",".join(contents)}); path = {quoted(Path(directory).name)}; sourceTree = "<group>";')
    children.extend(groups[""])
    for name, kind in resources + [("Info.plist", "text.plist.xml")]:
        ref = add(name, f"isa = PBXFileReference; lastKnownFileType = {kind}; path = {quoted(name)}; sourceTree = \"<group>\";")
        children.append(ref)
        if name != "Info.plist":
            resource_builds.append(add("build:" + name, f"isa = PBXBuildFile; fileRef = {ref};"))
    app = add("product", 'isa = PBXFileReference; explicitFileType = wrapper.application; path = Mots.app; sourceTree = BUILT_PRODUCTS_DIR;')
    group = add("app-group", f'isa = PBXGroup; children = ({",".join(children)}); path = Mots; sourceTree = "<group>";')
    products = add("products", f'isa = PBXGroup; children = ({app}); name = Products; sourceTree = "<group>";')
    main_group = add("main-group", f'isa = PBXGroup; children = ({group},{products}); sourceTree = "<group>";')
    src_phase = add("sources", f'isa = PBXSourcesBuildPhase; buildActionMask = 2147483647; files = ({",".join(source_builds)}); runOnlyForDeploymentPostprocessing = 0;')
    res_phase = add("resources", f'isa = PBXResourcesBuildPhase; buildActionMask = 2147483647; files = ({",".join(resource_builds)}); runOnlyForDeploymentPostprocessing = 0;')
    frameworks = add("frameworks", 'isa = PBXFrameworksBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0;')
    project_configs, target_configs = [], []
    for config in ["Debug", "Release"]:
        project_settings = {
            "CLANG_ENABLE_MODULES": "YES", "SDKROOT": "iphoneos", "IPHONEOS_DEPLOYMENT_TARGET": "26.0",
            "SWIFT_VERSION": "5.0", "SWIFT_STRICT_CONCURRENCY": "complete", "ENABLE_USER_SCRIPT_SANDBOXING": "YES",
            "DEBUG_INFORMATION_FORMAT": "dwarf" if config == "Debug" else "dwarf-with-dsym",
            "SWIFT_OPTIMIZATION_LEVEL": "-Onone" if config == "Debug" else "-O",
        }
        if config == "Debug":
            project_settings["SWIFT_ACTIVE_COMPILATION_CONDITIONS"] = "DEBUG"
            project_settings["ENABLE_TESTABILITY"] = "YES"
        target_settings = {
            "PRODUCT_NAME": "$(TARGET_NAME)", "PRODUCT_BUNDLE_IDENTIFIER": "com.feizhang.mots",
            "MARKETING_VERSION": "1.0", "CURRENT_PROJECT_VERSION": "1", "INFOPLIST_FILE": "Mots/Info.plist",
            "ASSETCATALOG_COMPILER_APPICON_NAME": "AppIcon", "ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME": "AccentColor",
            "TARGETED_DEVICE_FAMILY": "1,2", "SUPPORTS_MACCATALYST": "YES",
            "CODE_SIGN_STYLE": "Automatic", "SWIFT_EMIT_LOC_STRINGS": "YES",
            "LD_RUNPATH_SEARCH_PATHS": "$(inherited) @executable_path/Frameworks",
            "ENABLE_APP_SANDBOX": "YES", "ENABLE_HARDENED_RUNTIME": "YES", "GENERATE_INFOPLIST_FILE": "NO",
        }
        target_settings.update(saved_settings.get(config, {}))
        for name, settings, output in [("project", project_settings, project_configs), ("target", target_settings, target_configs)]:
            rendered = " ".join(f"{key} = {quoted(value)};" for key, value in settings.items())
            output.append(add(name + config, f"isa = XCBuildConfiguration; buildSettings = {{ {rendered} }}; name = {config};"))
    project_list = add("project-configs", f'isa = XCConfigurationList; buildConfigurations = ({",".join(project_configs)}); defaultConfigurationIsVisible = 0; defaultConfigurationName = Release;')
    target_list = add("target-configs", f'isa = XCConfigurationList; buildConfigurations = ({",".join(target_configs)}); defaultConfigurationIsVisible = 0; defaultConfigurationName = Release;')
    target = add("target", f'isa = PBXNativeTarget; buildConfigurationList = {target_list}; buildPhases = ({src_phase},{frameworks},{res_phase}); buildRules = (); dependencies = (); name = Mots; productName = Mots; productReference = {app}; productType = "com.apple.product-type.application";')
    project = add("project", f'isa = PBXProject; attributes = {{ LastUpgradeCheck = 2700; }}; buildConfigurationList = {project_list}; compatibilityVersion = "Xcode 14.0"; developmentRegion = "zh-Hant"; knownRegions = ("zh-Hant",en,Base); mainGroup = {main_group}; productRefGroup = {products}; projectDirPath = ""; projectRoot = ""; targets = ({target});')
    destination = ROOT / "Mots.xcodeproj"
    destination.mkdir(exist_ok=True)
    (destination / "project.pbxproj").write_text("// !$*UTF8*$!\n{\n\tarchiveVersion = 1;\n\tclasses = {};\n\tobjectVersion = 56;\n\tobjects = {\n" + "\n".join(objects) + f"\n\t}};\n\trootObject = {project};\n}}\n")
    scheme = destination / "xcshareddata/xcschemes/Mots.xcscheme"
    scheme.parent.mkdir(parents=True, exist_ok=True)
    reference = f'<BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="{target}" BuildableName="Mots.app" BlueprintName="Mots" ReferencedContainer="container:Mots.xcodeproj"/>'
    scheme.write_text(f'''<?xml version="1.0" encoding="UTF-8"?>
<Scheme LastUpgradeVersion="2700" version="1.3">
  <BuildAction parallelizeBuildables="YES" buildImplicitDependencies="YES"><BuildActionEntries><BuildActionEntry buildForTesting="YES" buildForRunning="YES" buildForProfiling="YES" buildForArchiving="YES" buildForAnalyzing="YES">{reference}</BuildActionEntry></BuildActionEntries></BuildAction>
  <TestAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.LLDB" shouldUseLaunchSchemeArgsEnv="YES"/>
  <LaunchAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.LLDB" launchStyle="0" useCustomWorkingDirectory="NO" ignoresPersistentStateOnLaunch="NO" debugDocumentVersioning="YES" debugServiceExtension="internal" allowLocationSimulation="YES"><BuildableProductRunnable runnableDebuggingMode="0">{reference}</BuildableProductRunnable></LaunchAction>
  <ProfileAction buildConfiguration="Release" shouldUseLaunchSchemeArgsEnv="YES" savedToolIdentifier="" useCustomWorkingDirectory="NO" debugDocumentVersioning="YES"><BuildableProductRunnable runnableDebuggingMode="0">{reference}</BuildableProductRunnable></ProfileAction>
  <AnalyzeAction buildConfiguration="Debug"/>
  <ArchiveAction buildConfiguration="Release" revealArchiveInOrganizer="YES"/>
</Scheme>
''')
    print("Generated mobile/ios/Mots.xcodeproj")


if __name__ == "__main__":
    main()
