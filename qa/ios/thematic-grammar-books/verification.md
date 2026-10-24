# Independent thematic grammar books — 2026-10-24

This correction supersedes the optional-grouping behavior documented in `../grammar-grouping/verification.md`.

Ordinary `grammar-fr`, `grammar-de` and `grammar-ja` retain their source data, IDs, progress, independent rows and two-level navigation. Obsolete `grammarGrouping` settings are ignored. The separate `grammar-theme-fr`, `grammar-theme-de` and `grammar-theme-ja` books are thematic metadata identities with empty source data and categories. The grouping view is selected only by `kind: grammar` plus `grammarMode: thematic`, not by a preference.

Native model tests cover missing-mode compatibility, metadata validation and persistence, nine builtin identities, zero copied thematic entries, independent progress even for identical word IDs, ordinary subcategory preservation despite obsolete grouping fields, implicit import defaults, metadata backup round trips and atomic rejection of attempts to change an existing book's type. Existing card/list disclosure, search and review tests remain scoped to a thematic fixture.

Validation completed:

- All five suites in `bash mobile/ios/scripts/test.sh` passed.
- All six project tests in `python3 mobile/ios/Tests/project_test.py` passed.
- Xcode simulator build succeeded for `generic/platform=iOS Simulator`, with signing disabled.
- Changed native sources and tests pass `git diff --check`.
- Installed only on the existing Mots Test iPhone 17 simulator (iOS 27.0).

Device Hub UI checks confirmed ordinary flat rows; original expandable second-level navigation; nine separate picker entries; a thematic selection labelled 主題背誦; an honest empty-state import route; and read-only book type in settings with no 有／無 mode toggle. Compact header titles have a bounded width and middle truncation so their suffix remains distinguishable; the picker and accessibility name retain the full title.

Current screenshots: `ordinary-list.png`, `ordinary-two-level-navigation.png`, `independent-book-picker.png`, `read-only-book-type.png`, `empty-thematic-book.png`.

The existing test simulator still reports an unrelated pairing-keychain issue in settings. No physical-device install, VoiceOver test or new Dynamic Type pass is claimed. Thematic source data was intentionally left empty; grouped rendering was covered by model fixtures and the previous disclosure implementation checks, not by adding production samples.
