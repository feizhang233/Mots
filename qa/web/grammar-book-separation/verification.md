# Independent grammar books — 2026-10-24

This correction supersedes the earlier optional grouping switch recorded in `../grammar-grouping/verification.md`.

Ordinary grammar-fr/de/ja retain their six original entries per book, stable IDs, independent rows, two-level navigation and original study operations. Old grammarGrouping preferences are ignored. Three separate grammar-theme-fr/de/ja books have their own identities and empty source content, as requested. Immutable grammarMode metadata selects the book behavior; only thematic books use large disclosure cards and first-level-only navigation. The former 有／無 selector is removed.

New-book import inherits thematic mode only from a selected grammar theme book unless the file explicitly declares its type. Legacy dictionaries default to standard. Same-ID retyping through backup restore and conflicting extension imports are rejected atomically. Themes do not clone ordinary entries. The empty screen offers full book import, which creates an independent local book with its own categories and progress.

## Completed verification

- Build/source consistency, all 12 Web regression suites, changed Web source/test formatting and diff whitespace checks pass.
- New separation regressions cover original standard behavior despite stale settings, empty themed sources, book switching, same-word-ID ratings/deletions isolation, metadata import/reload/backup, atomic type conflicts, grouped pagination, search, individual cards and captured review.
- Real Chrome at 1440px and 320px: ordinary UI restored, nine initial books, empty-theme import route, grouped custom import with inherited mode, independent ratings, detail Escape/focus restoration, card/list expansion preservation, reload, search/no-results/clear, dark/reduced-motion narrow layout, ordinary mobile subcategories and unchanged vocabulary. Zero page errors. Synthetic import fixture exists only inside an isolated QA browser context, not production catalogs or the user's browser.
- The user's existing local preview was reloaded on the same ordinary Japanese grammar route and visibly shows independent entries and original categories. Screenshot: restored-preview.png.
- Shared checks pass: 31 sync HTTP tests (including distinct standard/theme ratings and deletions), 14 deployment tests, seven data integrity tests, shared snapshot and full native catalog/audio consistency. Nine-book snapshot: 07740f3e3bedc53d.
- Official DESIGN.md lint has zero errors and existing token-reference warnings. No new visual token is introduced.
- Native tests/build/simulator evidence is recorded in ../../ios/thematic-grammar-books/verification.md.

This is a local build and simulator update; no website deployment or physical-device installation was performed. Empty thematic books await supplied content. No new screen-reader or physical-device verification is claimed.

## Static-audit limitation

The generic premium strict audit was rerun against the full project with a 90-second bound and did not complete within that limit (`premium-audit-status.json`). No clean strict-audit result is claimed. The prior audit documented the app's delegated-handler heuristic findings; current changed controls were verified through their real event handlers, the 12 regression suites and browser workflows above. The source search found no new native alert/confirm/prompt calls or non-semantic click targets in this correction.
