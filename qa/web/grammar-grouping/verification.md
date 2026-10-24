# Grammar grouping verification — 2026-10-24

This behavior is superseded by the independent-book correction in `../grammar-book-separation/verification.md`; the old 有／無 switch is no longer active.

The optional per-book grammar grouping preference defaults to 有. Large disclosure cards use the second-level category name and contain individual grammar entries. Both category menus become first-level only while grouping is enabled. 無 restores the existing independent list and second-level navigation. Flashcards and captured reviews stay flat, with existing IDs and ratings.

## Passed

- Generated Web build and JavaScript syntax checks (`make check`). Shared source data, content version and native catalog remain consistent.
- All 12 Web regression suites, including the new grammar-grouping suite. Coverage includes default and per-book settings, reload, old subcategory URLs, cross-tab changes, backup/restore, page boundaries, filtering, deletion/restoration, card resumption and independent review entries.
- Real Chrome workflow in `browser-check.cjs`: keyboard expansion, retained disclosure after rating and card/list round-trip, details Escape/focus restoration, 有／無 persistence, separate book preferences, search auto-expansion, no results/clear, mobile category selection, vocabulary isolation, focus after hiding/deleting a group's last child, and undo.
- Desktop 1440px, narrow 390px and 320px, dark and reduced-motion. Separate 320px touch emulation verifies no horizontal overflow and at least 44 × 44px rating targets. Screenshots are stored beside this report. Browser page errors: zero.
- All 30 sync server tests, 14 deployment tests and 7 shared-data tests. Sync tests required permission to open localhost test sockets; the allowed rerun passed.
- Prettier check on the changed Web source and regression files.
- Official DESIGN.md lint: zero errors, 16 existing token-to-component-reference warnings. Runtime token ownership remains CSS; no color/type token changes.

## Static audit reconciliation

The premium strict audit completed with 39 `affordance.actionless-button` findings and no other rule findings. This known heuristic does not follow this application's `addEventListener` or delegated `data-*` actions (documented in UX-CONTRACT.md). The new disclosure is native details/summary; the settings selector uses the existing native Select owner. Reviewed affected actions against their event bindings, regression tests and browser interaction checks. The raw audit is retained as `premium-audit.json`; it is not described as a clean strict pass.

## Limits and delivery

This is a local Web build. The production website was not deployed. Touch emulation does not substitute for a physical phone browser or screen-reader review. Native iOS changes and simulator evidence are recorded separately under `qa/ios/grammar-grouping/`.
