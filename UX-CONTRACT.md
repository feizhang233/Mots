# UX Contract

## Scope and locale

Mots is a local Material 3 dictionary and study workspace for a Chinese-speaking learner. The interface and default meanings use Traditional Chinese (`zh-Hant`). Dictionary identity, its study language and the chosen meaning language are separate concepts. Learning languages remain French, German and Japanese; meaning choices are `zh-Hant`, `zh-Hans`, `en`, `fr`, `de`, `ja`.

The current user brief requires a useful homepage behind the Mots brand, random review, named local dictionaries selectable at the upper right, and all vocabulary-download controls consolidated into settings. The user explicitly chose local multi-dictionary switching/import rather than a remote dictionary service. These corrections supersede the prior per-unit navigation/header download icons. Existing compact rows, word-level audio, familiarity, two-level study categories, list/card, page size and Material Select behavior remain.

Japanese is study content, not a Japanese-interface or Japan-market claim. Preserve Japanese spelling and language tags; Chinese conversion applies only to Chinese display fields. Missing meanings are explicit. Built-in French source content remains in `dist/data.js`; runtime counts are authoritative. German and Japanese built-ins are honestly labelled examples, initially 12 entries each. Original-book appendices below preserve source provenance.

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Select/Listbox | Official Material Web `md-outlined-select` | `dist/select.js` locally bundles the component; one option/value bridge | dictionary switcher and settings controls share authored popup, keyboard, width and collision rules; no native select popup | open state, keyboard/focus, geometry and viewport checks |
| Scrollbar | Global application CSS | `dist/styles.css` universal tokens; new workspace styles consume them | standards-based and WebKit fallback, system forced colors | owned navigation/dialog/menu scrolling |
| Toast | Shared `toast()` and inline settings status | `dist/app.js`, `#toast`, relevant settings live regions | latest toast replaces previous; critical recovery stays inline | replacement, dismissal and modal visibility |

`dist/workspace.js` renders home/review views from supplied models; `dist/workspace.css` consumes existing Material tokens. Category navigation remains native disclosure buttons; hidden levels use `details/summary` and checkboxes. Native dialogs own modality. Material Web owns all Select popups above the dialog clipping boundary. No browser alert/confirm/prompt or duplicate local listbox implementation is permitted.

## Home and route destinations

A fresh visit opens a functional homepage: current dictionary identity, local search, progress and entry points to lookup, thematic study and random review. The Mots brand returns to the same document's home destination; a file-URL link must not resolve to a filesystem directory. Legacy links containing category/subcategory continue to open the relevant study view rather than losing their context.

The active dictionary is available from the upper-right switcher in every view. Home also shows the available local dictionary collection, with genuine counts. On mobile, the header may occupy two rows to retain a usable dictionary field at 320px. Desktop sidebar collapse remains persisted and does not suppress the separate mobile category dialog. Mode navigation and brand actions stop current speech, preserve saved progress, and place focus in a logical view destination.

## Dictionary lookup and thematic study

Dictionary lookup searches the current dictionary's terms, displayed meanings and examples. It lists definitions/examples openly, in language-aware alphabetical order, with bounded pagination. It includes mastered entries and ignores study familiarity-hide filters, so a definition cannot disappear solely because it was learned. Chinese meaning script and honest missing-meaning messages remain consistent with study.

Thematic study retains two-level chapter/subchapter navigation. Only categories containing words in the current dictionary appear. Card/list, source-order/random order and reshuffle are study controls. Cards reveal meaning/example together and hide answers when moving to another word. List rows target 52px desktop and 80px mobile minima, growing for long content; the only pronunciation button is to the left of the term.

Switching thematic study from list to card starts at the first visible, not-studied word at or after the current list page's start, wrapping once to earlier words if necessary. It uses the existing filtered/shuffled deck and the active dictionary's progress, without revealing excluded words or changing order. If no visible word is unstudied, retain the current page's first word; empty results retain their empty state. The selected card starts with its answer hidden, and the list page follows the chosen word. Clicking the already active card control does not restart or jump.

Familiarity remains 0 not studied, 1 unfamiliar, 2 partial recall, 3 mastered. Lists use green/orange/red dot buttons with ring/checkmark and `aria-pressed`; pressing the selected mark clears it. Card marks remain labelled. Hidden levels are any combination of 0–3, persisted per dictionary. The global hide-mastered default is off initially; enabling/disabling it applies/removes hidden 3 while preserving other levels. It is applied on relevant dictionary study entry, with explicit URL hide values (including empty hide=) available as a temporary override. Lookup never applies this study default.

Page size remains 10/20/50/100, default 20, locally saved and included in backups. Changing size keeps the old first word in its containing new page and clamps the result; filter changes restart page 1. Search is accent-insensitive, local and IME-safe, with an explicit clear action. Study search may remain collapsed behind its icon; lookup/home search is directly usable. URL state restores committed dictionary, view/mode, query, category/subcategory, page size/page and applicable study filters. Concrete shuffle order, revealed answer and review round are session-only unless an explicit implementation contract says otherwise.

## Random review

Each round captures at most 20 unique, non-mastered entries from the current dictionary. Shuffle unfamiliar and partial-recall entries first, then fill any remaining slots from shuffled not-studied entries. Do not include mastered words. The round is independent of the current search, chapter, hidden-level setting, page and normal random-order deck.

Keep the captured round stable while ratings change; marking a card mastered must not unexpectedly re-filter or duplicate the remaining queue. Save familiarity to the active dictionary's progress store, then advance to the next card. Marking the last card, or manually moving forward from it, opens completion. Report the actual number rated versus round size, including rounds with skipped cards, and offer another round, dictionary lookup or home. An all-mastered or empty dictionary has an honest no-review state with a lookup route. A direct review URL starts a fresh round rather than rendering a normal study deck. This feature does not claim spaced repetition, due dates or a learning schedule.

## Local dictionary identity and import

Built-in dictionary IDs `fr`, `de`, `ja` retain the old bank/progress identities: the French thematic handbook and honestly named German/Japanese example dictionaries. New local dictionaries have independent `dict-...` identities, titles, language, categories, entries and progress. Two French dictionaries may share a term or source entry ID without sharing ratings or built-in audio. Switching dictionaries updates categories, counts, progress and content together.

The registry format is owned by `dist/dictionaries.js`. New dictionary imports accept JSON up to 2 MB and 5,000 nonempty entries, with at most 20 custom dictionaries. The language is French, German or Japanese. Title, term, meaning and example limits are validated; optional category definitions must have unique safe IDs and valid entry references. When categories are omitted, derive matching known labels or safe generic groups. Preserve Japanese terms/examples. Duplicate IDs or invalid data fail before replacing current content. Existing vocabulary-extension import remains compatible and targets the intended current dictionary.

Meaning language stays independent from the dictionary's language. Choosing a study-language option keeps the current dictionary if it already matches, otherwise selects an available matching dictionary. Missing meanings do not trigger fake translations. Imported dictionaries have no pre-rendered built-in word clips; use matching device speech or an explicitly selected Google mode.

## Vocabulary export in settings

Settings contains the single unfamiliar-vocabulary export workflow: select all entries, a first-level unit or a second-level unit of the active dictionary, then download. Navigation and main-content headers contain no export icons. Scope selection does not change the study page.

Unfamiliar vocabulary is levels 0/1/2; level 3 is excluded. A first-level scope includes every subcategory, while a second-level scope includes only that subcategory. Search, hidden levels, review session, pagination and random ordering do not restrict the selected scope. Retain source-bank order and current meaning language; missing meanings use the same honest message. CSV fields include term, meaning, example, familiarity, unit and language information, with the active dictionary identity reflected in the output name.

CSV uses UTF-8 BOM, CRLF separators, quoted/escaped fields and formula-like cell text protection. Zero unfamiliar entries produce an inline explanation rather than an empty download. Preparation failure offers localized retry guidance. Export does not change progress, settings, dictionary entries or the active study selection. All downloads, including templates and progress backup, remain inside settings.

## Persistence and backups

Built-in French progress keeps `mots.progress.v1`; German/Japanese keep `mots.progress.de.v1` and `mots.progress.ja.v1`. Custom dictionary progress uses `mots.progress.dictionary.<dictionary-id>.v1`. The dictionary library uses `mots.dictionaries.v1`; settings use `mots.settings.v2`, retaining the older language and display preferences for compatibility. Existing legacy extensions use `mots.banks.v1`.

Version 3 backups include imported dictionaries, all dictionary progress, settings and extensions. Built-in source data/audio remain packaged rather than duplicated in the backup. Version 1 French and version 2 three-language backups remain importable. Restoration accepts JSON up to 50 MB. Validate complete candidate dictionaries, category references and progress before merging. Known matching IDs take incoming values; unrelated existing dictionaries/progress remain. Invalid data must not partially mutate runtime content or persisted stores. A new-dictionary import always creates a fresh identity, even when the source JSON contains an existing dictionary ID.

Storage is browser-local; there is no account, remote sync, billing or service-worker install flow. Storage errors retain in-memory work, show persistent unsaved status and recommend backup. Other-tab updates must select a valid existing dictionary and refresh its content/progress consistently. Clearing browser data clears imported dictionaries, preferences and progress.

## Accessibility and verification

Owned labels and statuses use Traditional Chinese; learning content carries actual language tags. Keep native modal focus containment, Escape/close controls, visible focus, long-content wrapping, Select popup accessibility, busy/pressed audio feedback, reduced motion and forced colors. Shortcuts must not intercept home/lookup inputs, Material Select keyboard focus, IME, navigation or modals. On a mobile-to-desktop category-dialog transition with a collapsed sidebar, return focus to the visible header sidebar control.

Eight configured syntax commands pass, including the dictionary registry and workspace views. The strict auditor returns zero findings, with its established `dist` path coverage limitation; this is not a full runtime scan. Current v6 integration checks evaluate the actual application and registry in a JavaScript VM with DOM stubs: same-file home and legacy URLs; lookup ordering, accent search and inclusion of mastered words; dictionary progress/audio isolation; bounded review priority, stable queue and completion; actual import/backup callbacks with v1/v2/v3 migration; invalid-restore atomicity; dictionary-aware storage events; and persistent unsaved feedback on quota failure. The current real source bank also passes unique-ID, full-lookup and bounded-review checks.

Fresh desktop-browser checks on the owned local origin verify the brand's same-file home route; Simplified/Traditional Chinese search returning the same age entries; mastered entries remaining in lookup after hide-mastered is enabled; settings-only export counts excluding mastered entries; a 20-card unique review with rating auto-advance and a 20/20 completion summary; and an invalid-language import leaving the book unchanged. A three-entry French fixture imports with its own category and fresh progress; marking an ID that also exists in the original book persists after reload without changing the book's rating.

Fresh-origin browser checks at 320px confirm the imported dictionary's selected title appears immediately after the shared Select bridge update; custom first-level category A displays as A. At 390px the open dictionary popup and trigger both measure 356px at x=17, within the viewport. At 320px settings fit in a 296px dialog without document overflow; selecting second-level scope 1.02 and exporting produces the expected 39-entry status and a real download event. The mobile category drawer exposes all current source units without export controls. German and Japanese dictionaries switch correctly to their 12-entry example banks, preserving the Japanese 名前 term and example. The final desktop-home capture was refreshed on the new origin with no console errors, warnings or other logs. Captures include `qa/home-desktop-v6.png`, `qa/settings-export-mobile-v6.png` and `qa/dictionary-switch-mobile-v6.png`; `qa/verification-v6.md` records the evidence and limits. The final application, storage-callback and Select-adapter VM checks and all eight syntax commands pass again after the Select/category-label changes. Prior v3–v5 browser evidence is not substituted for these v6 checks. No real-phone, native-screen-reader or human pronunciation review is claimed. The official design.md lint previously could not run because DNS access was unavailable and is not claimed passed.

## Unit 1 source update

Unit 1 uses original-book order and 321 entries, with masculine/feminine pairs kept in one entry. Levels, original printed pages, PDF page numbers, and editorial notes are retained in data. Source labels distinguish Unit 1 from starter examples. Exact matching original French entries retain 13 old IDs; new entries use distinct book- IDs so old progress and audio cannot attach to unrelated words. At that update, Units 2–11 remained unchanged. The subsequent Unit 2 update is recorded below. New source words and examples receive matching pre-rendered French audio.

## Unit 2 source update

Unit 2 contains 196 source entries from printed pp. 16–23 (PDF pp. 23–30), with 84 basic and 112 advanced entries. Its four subcategory counts are 47/68/45/36. Eight exact matches retain prior IDs, and other source records use distinct book-2.* IDs. Unit 1 and Units 3–11 data and audio mappings are preserved. Source labels derive the actual printed-page range of the selected group. Source corrections and clarifications are stored in data and the companion workbook. All 392 new word/example clips are generated from the current text. Container duration checks cover all 1298 active audio references; they do not establish waveform silence detection or pronunciation quality.

## Unit 3 source update

Unit 3 contains 210 original-book entries from printed pp. 24–32 (PDF pp. 31–39), including 93 basic and 117 advanced entries. Its four subcategory counts are 42/63/35/70. Thirteen exact matches retain prior IDs; new records use distinct book-3.* IDs. Other units and audio mappings are preserved. Corrections, historical-statistic notes and sense distinctions are retained in data and the workbook. All 420 Unit 3 word/example clips match the current text. Container duration checks cover all 1686 active references without implying waveform or human pronunciation review.

## Unit 4 source update

Unit 4 contains 167 original-book entries from printed pp. 33–40 (PDF pp. 40–47): 85 basic and 82 advanced, with subcategory counts 30/31/58/48. Eight exact matches retain prior IDs; new records use distinct book-4.* IDs. Other units and audio mappings are preserved. Source corrections and context notes remain in the JSON and companion workbook. All 334 Unit 4 word/example clips are generated from current text. Container duration checks cover all 1988 active French references without implying waveform or human pronunciation review. The French bank now has 894 source entries and 100 starter entries.

## Unit 5 source update

Unit 5 contains 104 original-book entries from printed pp. 41–45 (PDF pp. 48–52): 58 basic and 46 advanced, with subcategory counts 39/65. Five exact matches retain prior IDs; new records use distinct book-5.* IDs. Other units and audio mappings are preserved. Source corrections and context notes remain in the JSON and companion workbook. All 208 Unit 5 word/example clips are generated from current text. Container duration checks cover all 2180 active French references without implying waveform or human pronunciation review. The French bank now has 998 source entries and 92 starter entries.

## Unit 6 source update

Unit 6 contains 162 original-book entries from printed pp. 46–52 (PDF pp. 53–59): 80 basic and 82 advanced, with subcategory counts 38/62/62. Eight exact matches retain prior IDs; new records use distinct book-6.* IDs. Other units and audio mappings are preserved. Source corrections and context notes remain in the JSON and companion workbook. All 324 Unit 6 word/example clips are generated from current text. Container duration checks cover all 2480 active French references without implying waveform or human pronunciation review. The French bank now has 1160 source entries and 80 starter entries.

Long Latin card terms (more than 24 characters) use the shared responsive 22–28px display variant at widths up to 480px. Other card controls, list typography, source text and Japanese sizing remain governed by the existing shared styles.

## Unit 7 source update

Unit 7 contains 131 original-book entries from printed pp. 53–58 (PDF pp. 60–65): 54 basic and 77 advanced, with subcategory counts 30/30/33/38. Three exact matches retain prior IDs; new records use distinct book-7.* IDs. Other units and audio mappings are preserved. Source corrections and context notes remain in the JSON and companion workbook. All 262 Unit 7 word/example clips are generated from current text. Container duration checks cover all 2710 active French references without implying waveform or human pronunciation review. The French bank now has 1291 source entries and 64 starter entries.

## Unit 8 source update

Unit 8 contains 207 original-book entries from printed pp. 59–66 (PDF pp. 66–73): 110 basic and 97 advanced, with subcategory counts 71/56/38/42. The repeated basic heading for the second 8.03 group on printed p. 64 is preserved and noted. Eleven exact matches retain prior IDs; new records use distinct book-8.* IDs. Other units and audio mappings are preserved. Source corrections and context notes remain in JSON and the companion workbook. All 414 Unit 8 word/example clips are generated from current text. Container duration checks cover all 3092 active French references without implying waveform or human pronunciation review. The French bank now has 1498 source entries and 48 starter entries.

## Unit 9 source update

Unit 9 contains 248 original-book entries from printed pp. 67–76 (PDF pp. 74–83): 109 basic and 139 advanced, with subcategory counts 40/49/63/63/33. Nine exact matches retain prior IDs; new records use distinct book-9.* IDs. Same-spelled tendre remains separate in 9.04 (verb) and 9.05 (adjective). Other units and audio mappings are preserved. Source corrections and context notes remain in JSON and the companion workbook. All 496 Unit 9 word/example clips are generated from current text. Container duration checks cover all 3548 active French references without implying waveform or human pronunciation review. The French bank now has 1746 source entries and 28 starter entries.

## Unit 10 source update

Unit 10 contains 153 original-book entries from printed pp. 77–84 (PDF pp. 84–91): 81 basic and 72 advanced, with subcategory counts 39/39/32/43. Six exact matches retain prior IDs; new records use distinct book-10.* IDs. Other units and audio mappings are preserved. Source corrections, education-example scope notes and context notes remain in JSON and the companion workbook. All 306 Unit 10 word/example clips are generated from current text. Container duration checks cover all 3822 active French references without implying waveform or human pronunciation review. The French bank now has 1899 source entries and 12 starter entries.

## Unit 11 source update

Unit 11 contains 157 original-book entries from printed pp. 85–93 (PDF pp. 92–100): 68 basic and 89 advanced, with subcategory counts 51/67/39. Six exact matches retain prior IDs; new records use distinct book-11.* IDs. Other units and audio mappings are preserved. Source corrections and context notes remain in JSON and the companion workbook. All 314 Unit 11 word/example clips are generated from current text. Container duration checks cover all 4112 active French references without implying waveform or human pronunciation review. The French bank now has 2056 source entries from Units 1–11 and no starter placeholders. Later book units remain outside the current bank.

## Unit 12 source update

The new Language category contains 309 entries from printed pp. 94–108 (PDF pp. 101–115): 181 basic and 128 advanced, with six subcategory counts 35/47/59/68/60/40. New records use book-12.* IDs. All first-eleven-unit categories, records and audio mappings are preserved. The supplied scan clips the right edge of printed p. 102: ne keeps only its complete first sentence; five other entries have explicitly annotated character restorations. Corrections and source limitations remain in JSON and the companion workbook. All 618 Unit 12 word/example clips use current prepared text. Container duration checks cover all 4730 active French references without implying waveform or human pronunciation review. The French bank now has 2365 entries from Units 1–12; later book units remain outside the current bank.

## Unit 13 source update

The new Leisure and Entertainment category contains 304 entries from printed pp. 109–121 (PDF pp. 116–128): 131 basic and 173 advanced, with seven subcategory counts 45/34/47/54/55/33/36. New records use book-13.* IDs. All first-twelve-unit categories, records and audio mappings are preserved. Contextual corrections and source spelling corrections are documented in JSON and the workbook. All 608 Unit 13 word/example clips use current prepared text. Container duration checks cover all 5338 active French references without implying waveform or human pronunciation review. The French bank now has 2669 entries from Units 1–13; later book units remain outside the current bank.

## Unit 14 source update

The new Personal Relations and Contacts category contains 166 entries from printed pp. 122–129 (PDF pp. 129–136): 78 basic and 88 advanced, with four subcategory counts 56/42/32/36. New records use book-14.* IDs. All first-thirteen-unit categories, records and audio mappings are preserved. Contextual corrections, normalized reflexive forms and source spelling corrections are documented in JSON and the workbook. All 332 Unit 14 word/example clips use current prepared text. Container duration checks cover all 5670 active French references without implying waveform or human pronunciation review. The French bank now has 2835 entries from Units 1–14; later book units remain outside the current bank.

## Unit 15 source update

The new Politics and Society category contains 334 entries from printed pp. 130–146 (PDF pp. 137–153): 156 basic and 178 advanced, with seven subcategory counts 39/45/46/44/47/50/63. New records use book-15.* IDs. All first-fourteen-unit categories, records and audio mappings are preserved. Contextual corrections, normalized reflexive forms and source spelling corrections are documented in JSON and the workbook. Population figures, historical summaries, terms of office and legal examples retain textbook context rather than claiming current data or law. All 668 Unit 15 word/example clips use current prepared text. Container duration checks cover all 6338 active French references without implying waveform or human pronunciation review. The French bank now has 3169 entries from Units 1–15; later book units remain outside the current bank.

## Unit 16 source update

The General Notions category contains 677 entries from printed pp. 147–177 (PDF pp. 154–184): 375 basic and 302 advanced, with thirteen subcategory counts 35/57/53/54/54/53/67/60/55/47/48/36/58. New records use book-16.* IDs. All first-fifteen-unit categories, records and audio mappings are preserved. Source example fields for 23 numbers remain empty with notes, without invented example text or audio. Contextual corrections and spelling normalization are documented per record. Time figures, population and geographical data, health and historical examples retain textbook context. All 1331 Unit 16 word/nonempty-example clips use current prepared text. Container duration checks cover all 7669 active French references without implying waveform or human pronunciation review. The French bank now has 3846 entries from Units 1–16; Unit 17 remains outside the current bank.
