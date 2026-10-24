# Mots native iOS and Liquid Glass verification

Date: 2026-10-23. Local workspace build; no remote deployment or publication.

This records the initial native-app verification. The web/database snapshot was subsequently deployed and verified on the same date; see [`../data-vps-sync.md`](../data-vps-sync.md) for that later operation. The iOS binary remains unsigned and was not distributed.

The project was later moved to [`../../mobile/ios/`](../../mobile/ios/README.md). Current layout and rebuild verification: [`../repository-layout.md`](../repository-layout.md). Paths in the original evidence below are historical.

## Build and automated checks

- Xcode 27.0 (27A266a), iOS SDK 27.0; deployment target iOS 26.0.
- Final iOS Release build: **BUILD SUCCEEDED**, signing disabled. See `device-build.log`.
- Final same-source Mac Catalyst Debug build: **BUILD SUCCEEDED**, then ad-hoc signed for local preview. See `catalyst-build.log`.
- Both final builds include immediate hide-mastered filtering, preservation of imported part-of-speech metadata, corrupt-state recovery copies, and the opaque RGB App Store icon. No Swift compiler warnings; Xcode only reports skipped AppIntents metadata extraction because this app has no AppIntents dependency.
- `make ios-check`: passed. Checked 3,846 French, 12 German and 12 Japanese entries and SHA-256 equality of all 3,870 bundled word clips. Native Swift tests cover lookup/filtering, selected-card restoration, stable random order and review queue, rating navigation, dictionary identity, atomic backup merge, v1/v2/v3 compatibility, imported extensions, part-of-speech preservation, scoped formula-safe CSV, array import, storage failure and byte-preserving corrupt-state recovery. See `data-tests.log`.
- `make test`: passed all five web application regression suites and eight deployment regression tests, including source/build consistency. See `web-tests.log`.
- Prettier `--check src tests`: passed. See `format-check.log`.
- Design lint: zero errors, 16 orphan-token warnings. CSS consumes these tokens; design frontmatter does not map every token to components. See `design-lint.log`.
- Strict premium audit: **not passing**; 26 actionless-button heuristic findings, zero unresolved ownership findings. Event listeners/delegated actions are covered by regression tests. Details and bindings: `../glass-verification.md` and `../glass-static-audit.json`.
- `git diff --check`: passed. Active source and build tooling contain no Material imports, `md-outlined` elements or `--md-` tokens.

## Live native interaction

The same SwiftUI sources were exercised in Mac Catalyst at 1024 × 768. This is a native preview, not an iPhone or Duo simulator.

- French dictionary count, search with no results and clearing search.
- Reveal answer, save familiarity, advance to the next card with its answer hidden.
- Switch to list and back to cards; resume at the next unstudied word.
- Native Settings, dictionary change to Japanese, and state restoration after quit/relaunch.
- Export a v3 backup through the system save dialog. Reopened `native-ui-test-backup.json` and verified the dictionary and test familiarity value.
- Start Japanese review, rate and advance to card 2/12; quit/relaunch retains the review card.
- Collapse/restore the sidebar without changing the current word. Final toolbar contains one sidebar toggle.
- Glass controls use readable forest text, including reveal/replay controls. Final visual evidence: `native-liquid-glass.png`. `native-first.png` records an earlier iteration and is not the final interface.

The final source build was repeated after the last data-layer fixes and RGB-icon change. A further launch attempt then encountered the Mac lock screen. The live checks above were completed before that lock; the final data changes were covered by automated tests and compilation. Do not infer a fresh post-lock UI run.

## Live web interaction

- Narrow phone viewport 320 × 740: card/settings/dictionary operations; document width equals viewport width, no horizontal overflow; seven native selects and no Material custom elements.
- 390 × 844: dark home layout and narrow review continuation.
- Wide viewport 1114 × 834: sidebar and review; rating advances; resize to narrow retains card 2/12.
- Japanese text is preserved; search no-results and clear actions work. Browser console showed no warnings/errors during the tested workflows.
- Evidence: `web-phone-320.jpg` and `web-wide-1114.jpg`. Temporary viewport overrides were reset.

## Device and delivery boundaries

`NavigationSplitView` and size classes implement compact/wide adaptation. A shared observable store preserves learning state when layout changes. Native controls use system Liquid Glass; web chrome uses a corresponding translucent treatment. Reading cards have opaque backgrounds. Dynamic Type, dark mode, reduced motion and reduced transparency are implemented; native VoiceOver, all accessibility settings and physical audio output were not exhaustively tested.

No simulator runtime or connected iPhone was available. Physical iPhone/Duo touch behavior, folding transitions, all Duo postures and iOS 27.1 edge/vertical controls remain unverified. Native narrow-window testing was not completed; web narrow-width results are not evidence of native device behavior. Apple recommends Xcode 27.1 for full Duo posture validation; this machine has 27.0.

The iOS `.app` is unsigned and cannot be installed directly. Installation requires the user's signing Team and device selection in Xcode; distribution requires a signed Archive. No TestFlight/App Store submission, GitHub push, VPS update or cloud synchronization occurred. Follow `../../ios/README.md` to generate assets and run the app.

## Official design references

- [Applying Liquid Glass to custom views](https://developer.apple.com/documentation/SwiftUI/Applying-Liquid-Glass-to-custom-views)
- [Designing for iPhone Duo](https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo)
- [Prepare your app for iPhone Duo](https://developer.apple.com/videos/play/tech-talks/111461/)
