# Physical iPhone update — 2026-10-24

The user explicitly authorized updating the website and their physical iPhone. This record covers iPhone delivery only.

- Target discovered from current connected-device inventory: Fei-iPhone, physical iPhone 16 Pro Max, iOS 27.0.
- Existing app confirmed before update: `com.feizhang.mots`, version 1.0, build 1.
- Preserved the configured development team and bundle identifier. Incremented both Xcode configurations to build 2.
- Signed Debug device build succeeded using the existing provisioning configuration.
- Signature validation passed with `codesign --verify --deep --strict` when run with access to the system verification service. An initial restricted invocation could not evaluate trust; no trust or security setting was changed.
- The packaged catalog exactly matches the maintained native catalog (SHA-256 recorded in `device-release-artifact.json`): nine books; original vocabulary counts 3,846 / 12 / 414; ordinary grammar counts 6 / 6 / 6; separate thematic grammar counts 0 / 0 / 0.
- In-place installation succeeded. No uninstall, erase, learning-data export or app-data read was performed.
- A subsequent installed-app query confirmed version 1.0, build 2 on the phone.
- Application launch separately succeeded. A later targeted process query confirmed the same Mots process remained running (PID 78376).

Evidence: `device-release-build.log`, `device-release-artifact.json`, `device-release-install.json`, `device-release-launch.json`, `device-release-installed-app.json`, `device-release-process.json`, and the associated install/launch logs.

Physical installation, version and launch are verified. Device Hub's physical display preview appeared stale, so no live physical-screen rendering or pronunciation check is claimed. The previous simulator and model verification remains the UI/content-behavior evidence. No physical-device screenshot was saved.
