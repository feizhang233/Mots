# Reversible vocabulary deletion — 2026-10-23

## Implementation

- Web rows expose a final 44px delete button. iOS uses a single native List with trailing swipe actions, explicit red destructive action and an accessibility delete action. Source dictionaries and familiarity remain intact.
- Immediate undo and Settings recovery restore the same ID and rating. Deleted words leave list/lookup/card/review/counts/CSV; restoration does not enlarge a captured review.
- The existing pairing owner exchanges an independent version-1 deletion endpoint alongside unchanged familiarity exchange. True and false records retain deterministic revisions. Both channels must validate and persist before success.
- Optional version-3 backup deletion records validate capacity and clock limits before import; old backups preserve deletion state.

## Automated verification

- Web generated build is current; all 7 regression suites pass, including deletion, dual-channel races, cross-tab convergence and atomic backup validation.
- Server: all 30 HTTP tests pass, including existing exchange compatibility, SQLite migration, deletion/restore merge, auth and transaction boundaries.
- Deployment tests: 12 pass. Data consistency tests: 5 pass.
- Native: Store, ProgressSync and WordDeletion suites pass; 3 Xcode project tests pass.
- Xcode simulator build and Run succeed on Mots Test iPhone 17, iOS 27.0. Signed generic iPhone build succeeds; no physical-phone installation performed, honoring the user decision to install later.
- DESIGN.md lint: 0 errors, 16 existing orphan-token warnings. Static UI auditor reports 39 actionless-button heuristics only; source event bindings and actual UI actions are verified. No other rule findings.

## Native interaction evidence

- Left swipe exposes red trash action; selecting it changes 3,846 to 3,845 and removes the word.
- Relaunch preserves deletion. Recovery page lists deleted terms and meanings; restoring both test words returns 3,846 and original yellow/green selections.
- Immediate accessibility delete followed by Undo returns l’âge with its original yellow familiarity selection.
- All manual deletions restored before pairing tests.

## Live verification

- Final release: `/home/fei/Work/Mots/releases/20261023-181843-ec7d8eec`. All 16,155 server files match SHA-256; all 94 public checks pass; existing web, tunnel and progress services are active.
- Actual production browser and iOS simulator paired using one temporary group. Web deletion removed l’âge on iOS and changed count to 3,845; restoring on iOS brought the word back on Web with original familiarity level 2.
- iOS deletion removed the same word from Web. Web Settings recovery restored it on iOS with its yellow selection and 3,846 total.
- Final release rechecked Web deletion followed by iOS recovery: the word returns and stale Web deletion/Undo notice disappears automatically after sync.
- Web immediate Undo retains level 2. Recovery count updates to zero. Browser reload preserves the restored state.
- 320px browser check: document scroll width 320px, viewport 320px; final delete button remains 44px wide and within viewport. Temporary viewport override reset.
- Final browser console contains no errors. Temporary pair disconnected on both ends; code variables cleared. All test deletions restored, no physical iPhone installation.
- Screenshots: `ios-swipe.png`, `web-list.png`, `web-deleted.png`, `web-320.png`.

