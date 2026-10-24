# Web vocabulary / grammar memorization verification

Date: 2026-10-24. Scope: Web only.

## Delivered

- Vocabulary / grammar content-mode switch; existing vocabulary IDs and ratings preserved.
- Separate French, German and Japanese grammar starter collections, six entries each, three distinct original examples per entry.
- Two-band lists, larger cards with up to two distinct examples, accessible native entry-detail dialog with all examples and usage notes.
- Rich JSON imports, extensions, backups and search preserve pattern, explanation, examples and translations.
- Grammar and vocabulary familiarity/deletions/visibility remain isolated by dictionary ID.
- Damaged persisted optional rich fields leave the entry readable and expose existing storage-recovery status.

## Passed

- `python3 web/scripts/build.py` and `--check`.
- `node web/tests/run.cjs`: all 10 regression suites, including new rich-entry and grammar-study coverage.
- `python3 -m unittest discover -s sync -p 'test_*.py'`: all 30 tests; required local networking permission.
- `python3 tests/deploy_test.py`: 14 tests.
- `python3 tests/data_sync_test.py`: 5 source-integrity tests.
- Generated data, audio manifests and select JavaScript syntax checks.
- Prettier validation of changed authored UI and tests.
- Real Chrome browser flow at 1440, 390 and 320px: mode switching, list/card, exactly two card examples, details with all examples, Escape and focus restoration, search/no-results/clear, dark mode, reduced motion, no horizontal overflow and no page errors. See browser-result.json and PNG captures.
- Changed markup reviewed for native semantics, accessible names and real action bindings. No browser alert/confirm/prompt or nonsemantic click targets introduced.

## Verification limits

- The strict premium UI auditor reports 42 actionless-button findings. Its detector only recognizes inline click syntax or form submission, not this application's external addEventListener/delegated data attributes. Manual owner review and the runtime tests verify actual actions. Raw findings are retained in ui-audit.json; no inline handlers were added to satisfy the detector. The other static audit categories have no findings. A separate designmd executable is unavailable; the maintained design contract and runtime-token ownership were reviewed directly.
- Full `make test` stops at the cross-platform generated catalog check: concurrent Japanese vocabulary work updated Web/shared sources to 414 entries while the native iOS catalog still has 12. French (3,846) and German (12) metadata/entries match their native snapshots exactly. This change leaves native iOS source/catalog untouched; Web regressions and data-source integrity tests above pass independently.
- Existing vocabulary often contains one example and no expanded explanation. These remain honestly represented; this feature does not manufacture a second sentence. Grammar examples are starter content, not a complete curriculum.
- No live server deployment or native iOS build/installation was performed. Local preview: http://127.0.0.1:4174/.

## Browser-comment follow-up: independent books

The follow-up supersedes the content-mode toggle and translation display described above. Vocabulary/grammar are now independent books in the shared native top-bar and settings selectors, using language-native titles. The home library shows every book; imported book names remain intact. The old toggle and its saved last-per-kind preference were removed. Example translations no longer render in list, card or detail, but remain preserved in stored content/search/backups.

Current validation: all 11 Web suites passed (including concurrent Japanese ruby coverage); production Web build/currentness and formatting passed. The existing in-app browser was refreshed and directly exercised: six visible book options, Français Mots selection updates URL/categories/counts, return to Français Grammaire, two original-language card examples, three detail examples, then return to list and reload. No ratings were changed during live verification. `books-followup.png` records the final 1251px-wide view. Earlier narrow/dark screenshots describe the preceding iteration, not this header refinement. The maintained browser-check.cjs was adapted for future independent reruns but was not rerun as part of this follow-up.

## Header count/status and mode-trigger follow-up

Removed the top-bar count and routine local-save badge. Storage failure messages are error-only in settings. Restyled the existing native mode select with a tonal trigger, destination icon and decorative chevron. The OS still owns its popup. Removed superseded capsule CSS rather than adding a parallel menu implementation.

Validation: all 11 source Web regression suites, formatting, build and generated-currentness passed. The active in-app browser visibly omits the two removed header labels. Clicking the new select, pressing Up/Return changed study to overview and updated the URL; selecting study restored the view and its destination icon. `header-controls-followup.png` captures the final refreshed preview. No progress ratings or source content were edited during live verification.

## Compact list and select rollback

Restored the mode selector’s prior white native pill, removing its custom icon/chevron wrapper. Kept the preceding header-label removals. Reduced list vertical padding and the gap between the two logical bands; coarse-pointer controls remain 44px and full flashcards keep their layout.

Validation: Select and navigation/review source suites passed; formatting and Web production build passed. In the active in-app browser, the first grammar list row measured 120px before and 85px after, with its second-band margin reduced from 5px to 0px. The select’s computed appearance is native auto. `compact-list-followup.png` records the refreshed final view.

## Settings header adaptation and toolbar-count removal

Removed the card/list/order toolbar result count and its renderer update. Corrected settings’ sticky top from -20px to0, removed the inset rectangular background, shared header/body insets and enlarged close from34px to44px.

Validation: storage/settings and navigation source suites passed; formatting and production build passed. Live in-app browser at1251×1224: dialog520px wide, header518px wide (within its borders), close44×44px, toolbar text exactly “卡片 列表 正序”. Expanding dictionaries/vocabulary produced a1190px client-height dialog with1246px content; after End scroll, dialog top16px, header top17px, close top33px/bottom77px, confirming both remain inside the scrollport. Captures: settings-header-followup.png and toolbar-clean-followup.png.
