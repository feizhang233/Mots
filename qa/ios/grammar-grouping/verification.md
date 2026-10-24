# Native grammar grouping verification — 2026-10-24

The simulator build completed successfully with Xcode for `generic/platform=iOS Simulator`, with signing disabled. Installed only on the existing Mots Test iPhone 17 (iOS 27.0) simulator. No physical-device installation was performed.

Passed all five Foundation test suites through `bash mobile/ios/scripts/test.sh`, including new grammar preference default, per-book independence, legacy-state migration, backup round trip, captured-review membership and transient disclosure-state tests. All six project structure tests passed through `python3 mobile/ios/Tests/project_test.py`. Relevant source changes pass `git diff --check`.

Device Hub interactions verified:

- Grouping defaults to collapsed, second-level headings on large cards; opening a group reveals distinct rounded small grammar cards.
- Settings → 學習偏好 → 語法歸納 exposes native 有／無 choices. 無 restores independent rows; 有 restores grouped cards.
- Grouped category navigation lists first-level topics without second-level child controls.
- Individual child rating selection and clearing retain the expanded group.
- List → card → list shows an individual grammar entry with 1/6 progress and restores the prior group expansion.
- Searching `ne` automatically opens matching groups; closing search restores the previous ordinary expansion state.
- Child details opens the shared rich details sheet and closes back to the list.

Screenshots: `collapsed-list.png`, `grouped-list.png`, `first-level-navigation.png`, `individual-card.png`, `search-expanded.png`.

An existing simulator pairing/keychain error is visible inside settings. Pairing was not changed or tested as part of this feature; the full sync model suite passes. Physical-device, Dynamic Type and native VoiceOver interaction were not newly verified for this change.
