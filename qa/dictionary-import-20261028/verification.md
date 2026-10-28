# Dictionary import in settings — 2026-10-28

Settings → 辭典匯入與生詞 → 匯入新辭典 owns JSON file selection, format guidance, a bounded JSON preview and 下載範例模板 on Web and native iOS. Home and study empty states have no import action. Preview and download share a generator on each platform and preserve the existing dictionary schema and independent progress identities.

## Verification

- Web build/check and all 13 regression suites passed. Added nine-book preview/download/import round trips, single-settings-location checks, malformed/oversize/invalid-language/duplicate-ID atomic rejection and pending-read duplicate prevention.
- All 14 deployment-tool tests and the manifest's data/audio/extra-audio/select syntax checks passed.
- Changed Web source/test files pass the repository's Prettier settings; `git diff --check` passes.
- `browser-check.cjs` passed in an isolated Chrome profile against the local build. It exercised a real template download/import, invalid JSON and retry, persistence after reload, book/language changes, keyboard expansion/preview focus/Escape restoration, desktop and 320/390px layouts, light/dark themes and reduced motion. `browser-result.json` records measurements; screenshots show the rendered settings and homepage.
- All seven native test suites, six native project checks and the unsigned Release iOS build passed. Native run logs: `/private/tmp/mots-dictionary-import-native-tests.log`, `/private/tmp/mots-dictionary-import-build.log`. No native device installation or simulator UI verification was performed.

## Static tooling limits

The premium strict audit completed with 39 `affordance.actionless-button` findings and no unresolved ownership findings. These are the existing documented heuristic limitation: the auditor does not resolve Mots' `addEventListener` or delegated handlers. The template button's handler is exercised by both regression and browser tests. No unrelated inline handlers were introduced to appease the heuristic.

The official DESIGN.md lint command could not run because `@google/design.md` is absent from the offline npm cache. Only prose was added to DESIGN.md; its frontmatter/token definitions were unchanged. Runtime colors and geometry reuse existing shared tokens.

## Production release

Deployed to `https://mots.feizhang233.com/` as `20261028-144546-7c9aa5de`. Full release SHA-256 verification passed for 17,000 files; all three services are active. All 89 public resource checks passed, including audio range responses and progress API health/cache policy. The release reuses identical files from the prior immutable server release through rsync `--link-dest`, without `--inplace`; candidate files were verified before activation. `qa/data-vps-sync.json` records the released content version and public checks.

The same browser workflow passed against production with zero page errors, including a real template download/import and malformed-file retry in an isolated browser context. Desktop, 320/390px, light/dark and reduced-motion screenshots/results are in `production/`. Native sources are included in the repository update; no device app was installed.
