# iOS grammar memorization — 2026-10-24

Implemented the user's mobile grammar request using independent books, matching the accepted Web behavior. Native iOS keeps the existing compact vocabulary list; grammar has its own compact two-band list, up to two original-language card examples, and a shared full detail sheet.

## Content and compatibility

- Built-in IDs: fr, de, ja, grammar-fr, grammar-de, grammar-ja. Vocabulary counts: 3846 / 12 / 414. Grammar: 6 original starter points per language, 3 examples per point. These are starter collections, not a complete textbook.
- Shared and bundled catalogs include kind, examples/translations, pattern and explanation. Grammar audio is null and follows the existing device-voice fallback, never a vocabulary clip with a colliding ID.
- Old dictionary data without kind defaults to vocabulary. New custom imports inherit the current book's kind when omitted. Explicit imported titles are preserved.
- Rich custom dictionary and Web grammar customBanks content survive import, persistence, backup and restoration. Grammar extension validation uses the actual book's categories and ID prefix.
- Exact dictionary/entry IDs preserve independent ratings and deletions and use the existing pairing protocol. Search includes later examples and explanations.

## Automated checks

- All five native suites passed: StudyModelsTests, StudyStoreTests, GrammarStudyStoreTests, ProgressSyncTests, WordDeletionTests. See native-tests.log.
- Six project tests passed, including source-manifest completeness and preservation of signing configuration. See project-tests.log.
- Simulator Debug and generic-device Release builds succeeded using Xcode 27.0. See simulator-build.log and device-build.log. The device build uses CODE_SIGNING_ALLOWED=NO; no signed install or physical-device test is claimed.
- All configured Web/shared checks passed: 11 Web suites, 14 deployment tests, generated-output check, four JS syntax checks and shared data snapshot check. See web-shared-checks.log.
- Exporter full audio checksum check and seven shared-data tests passed during catalog integration.
- Markdown/JSON formatting and source whitespace checks passed.
- Premium strict static audit saved in ui-audit.json. It reports 40 existing Web actionless-button heuristic findings (external/delegated event handlers are not recognized), with no unresolved ownership findings. This Web-only auditor does not verify SwiftUI. Native interactions were checked separately below; no blanket audit compliance is claimed.

## Runtime checks

Device: Mots Test iPhone 17 simulator / iOS 27.0, controlled through Device Hub.

- Updated the existing simulator installation without uninstalling or clearing data. Existing French vocabulary progress remained visible.
- Top book menu listed all six named books. French, German and Japanese grammar selections each displayed the correct six entries and original-language examples. Category sidebar also reflected the selected book and returned successfully to its grammar list.
- Fixed duplicated compact navigation back/category controls that squeezed the book title. Final French grammar title fits beside its single category control.
- Vocabulary list retained its compact word/meaning and independent rating controls.
- Grammar list has a tappable example/details region beside the 44pt rating controls, with no empty action line under the ratings. Long examples wrap naturally.
- Opened details from both list and card. Meaning, pattern, explanation and all three examples are readable; no translated example lines are rendered. Closing returns to the same card with its revealed state intact.
- Card reveal displays the meaning, pattern and exactly two examples. Marking partial recall advances from card 1/6 to 2/6 and hides the next answer. Reinstallation/relaunch retained the selected grammar book and card 2/6. Switching to list showed the stored selected rating; clicking it cleared the test mark.
- Japanese grammar was checked in dark appearance and accessibility text size (Device Hub Text Size 7). Reading columns stack, controls remain available, and the list scrolls. Restored Light and Text Size 3 afterward.
- Final simulator remains on the French grammar list. No live server deployment, TestFlight publication or physical phone installation was performed.

## Evidence and limits

- grammar-list.png: final compact French grammar list.
- grammar-card.png: French grammar card with meaning, pattern and two examples.
- grammar-detail.png: full native detail sheet.
- japanese-dark-large.png: dark appearance and accessibility-size reflow.

Pairing transport uses unchanged production code and passed model tests; a live two-device pairing session was not repeated. Physical phone, folding posture, spoken pronunciation quality and full VoiceOver navigation were not tested. The existing grammar content remains the shared Web starter source.
