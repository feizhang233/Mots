# UX Contract

## Scope and locale

Mots is a local Material 3 dictionary and study workspace for a Chinese-speaking learner. The interface and default meanings use Traditional Chinese (`zh-Hant`). Dictionary identity, its study language and the chosen meaning language are separate concepts. Learning languages remain French, German and Japanese; meaning choices are `zh-Hant`, `zh-Hans`, `en`, `fr`, `de`, `ja`.

The current user brief requires a useful homepage behind the Mots brand, random review, named local dictionaries selectable at the top of settings, and all vocabulary-download controls consolidated into settings. The user explicitly chose local multi-dictionary switching/import rather than a remote dictionary service. These corrections supersede the prior per-unit navigation/header download icons. Existing compact rows, word-level audio, familiarity, two-level study categories, list/card, page size and Material Select behavior remain.

Japanese is study content, not a Japanese-interface or Japan-market claim. Preserve Japanese spelling and language tags; Chinese conversion applies only to Chinese display fields. Missing meanings are explicit. Built-in French source content remains in `dist/data.js`; runtime counts are authoritative. German and Japanese built-ins are honestly labelled examples, initially 12 entries each. Original-book appendices below preserve source provenance.

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Select/Listbox | Official Material Web `md-outlined-select` | `src/components/material-select.js` is the option/value bridge; `dist/select.js` bundles the component | mode dropdown, dictionary switcher and settings controls share authored popup, keyboard, width and collision rules; no native select popup | open state, keyboard/focus, geometry and viewport checks |
| Scrollbar | Global application CSS | `src/styles/styles.css` universal tokens; new workspace styles consume them | standards-based and WebKit fallback, system forced colors | owned navigation/dialog/menu scrolling |
| Toast | Shared `toast()` and inline settings status | `src/js/app.js`, `#toast`, relevant settings live regions | latest toast replaces previous; critical recovery stays inline | replacement, dismissal and modal visibility |

`src/js/workspace.js` renders home/review views from supplied models; `src/styles/workspace.css` consumes existing Material tokens. Category navigation remains native disclosure buttons; hidden levels use `details/summary` and checkboxes. Native dialogs own modality. Material Web owns all Select popups above the dialog clipping boundary. Viewport changes close open Select menus through the shared adapter, so reopening measures the current trigger width instead of retaining desktop popup geometry. No browser alert/confirm/prompt or duplicate local listbox implementation is permitted.

## Home and route destinations

A fresh visit opens a functional homepage: current dictionary identity, local search, progress and entry points to lookup, thematic study and random review. The Mots brand returns to the same document's home destination; a file-URL link must not resolve to a filesystem directory. Legacy links containing category/subcategory continue to open the relevant study view rather than losing their context.

The active dictionary is selectable from the first field in settings in every view. Home also shows the available local dictionary collection, with genuine counts. Lookup, thematic study and random review share one compact Material dropdown before search in the filter header. Home is not a dropdown option and there is no separate home button, including in review completion. Only the Mots brand provides an explicit return-home action; a top-bar Mots link remains visible on mobile and when the sidebar is collapsed. Mobile stacks the category heading above the controls, keeping the menu and actions within 320px. Dictionary imports/restores and cross-tab updates retain the current view, or fall back from a cancelled review to study, rather than forcing a home navigation. Desktop sidebar collapse remains persisted and does not suppress the separate mobile category dialog. Mode navigation and brand actions stop current speech, preserve saved progress, and place focus in a logical view destination.

## Dictionary lookup and thematic study

Dictionary lookup searches the current dictionary's terms, displayed meanings and examples. It lists definitions/examples openly, in language-aware alphabetical order, with bounded pagination. It includes mastered entries and ignores study familiarity-hide filters, so a definition cannot disappear solely because it was learned. Chinese meaning script and honest missing-meaning messages remain consistent with study.

Thematic study retains two-level chapter/subchapter navigation. Only categories containing words in the current dictionary appear. Card/list, source-order/random order and reshuffle are study controls. Cards reveal meaning/example together and hide answers when moving to another word. List rows target 52px desktop and 80px mobile minima, growing for long content; the only pronunciation button is to the left of the term.

Switching thematic study from list to card starts at the first visible, not-studied word at or after the current list page's start, wrapping once to earlier words if necessary. It uses the existing filtered/shuffled deck and the active dictionary's progress, without revealing excluded words or changing order. If no visible word is unstudied, retain the current page's first word; empty results retain their empty state. The selected card starts with its answer hidden, and the list page follows the chosen word. Clicking the already active card control does not restart or jump.

Familiarity remains 0 not studied, 1 unfamiliar, 2 partial recall, 3 mastered. Lists use green/orange/red dot buttons with ring/checkmark and `aria-pressed`; pressing the selected mark clears it. Card marks remain labelled. Hidden levels are any combination of 0–3, persisted per dictionary. The global hide-mastered default is off initially; enabling/disabling it applies/removes hidden 3 while preserving other levels. It is applied on relevant dictionary study entry, with explicit URL hide values (including empty hide=) available as a temporary override. Lookup never applies this study default.

Page size remains 10/20/50/100, default 20, locally saved and included in backups. Changing size keeps the old first word in its containing new page and clamps the result; filter changes restart page 1. Search is accent-insensitive, local and IME-safe, with an explicit clear action. Study search may remain collapsed behind its icon; lookup/home search is directly usable. URL state restores committed dictionary, view/mode, query, category/subcategory, page size/page and applicable study filters. Concrete shuffle order, revealed answer and review round are session-only unless an explicit implementation contract says otherwise.

## Random review

Each round captures at most 20 unique, non-mastered entries from the current dictionary. Shuffle unfamiliar and partial-recall entries first, then fill any remaining slots from shuffled not-studied entries. Do not include mastered words. The round is independent of the current search, chapter, hidden-level setting, page and normal random-order deck.

Keep the captured round stable while ratings change; marking a card mastered must not unexpectedly re-filter or duplicate the remaining queue. Save familiarity to the active dictionary's progress store, then advance to the next card. Marking the last card, or manually moving forward from it, opens completion. Report the actual number rated versus round size, including rounds with skipped cards, and offer another round or dictionary lookup. An all-mastered or empty dictionary has an honest no-review state with a lookup route. A direct review URL starts a fresh round rather than rendering a normal study deck. This feature does not claim spaced repetition, due dates or a learning schedule.

## Local dictionary identity and import

Built-in dictionary IDs `fr`, `de`, `ja` retain the old bank/progress identities: the French thematic handbook and honestly named German/Japanese example dictionaries. New local dictionaries have independent `dict-...` identities, titles, language, categories, entries and progress. Two French dictionaries may share a term or source entry ID without sharing ratings or built-in audio. Switching dictionaries updates categories, counts, progress and content together.

The registry format is owned by `src/js/dictionaries.js`. New dictionary imports accept JSON up to 2 MB and 5,000 nonempty entries, with at most 20 custom dictionaries. The language is French, German or Japanese. Title, term, meaning and example limits are validated; optional category definitions must have unique safe IDs and valid entry references. When categories are omitted, derive matching known labels or safe generic groups. Preserve Japanese terms/examples. Duplicate IDs or invalid data fail before replacing current content. Existing vocabulary-extension import remains compatible and targets the intended current dictionary.

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

Current source ownership and module boundaries are documented in `docs/architecture.md`. Run `make test` for generated-source consistency, syntax checks, five application regression suites and eight deployment checks. The generic premium auditor now scans `src/`; its `affordance.actionless-button` rule only detects inline handlers and does not resolve this app's `addEventListener` bindings or delegated actions. These findings must be reviewed against actual event bindings and runtime tests, rather than adding inline handlers to satisfy that heuristic. The report and browser evidence are recorded in `qa/refactor-verification.md`.

The following v6 evidence is historical; it documents previously verified user-facing behavior and is supplemented by the current refactor checks.

Fresh desktop-browser checks on the owned local origin verify the brand's same-file home route; Simplified/Traditional Chinese search returning the same age entries; mastered entries remaining in lookup after hide-mastered is enabled; settings-only export counts excluding mastered entries; a 20-card unique review with rating auto-advance and a 20/20 completion summary; and an invalid-language import leaving the book unchanged. A three-entry French fixture imports with its own category and fresh progress; marking an ID that also exists in the original book persists after reload without changing the book's rating.

Fresh-origin browser checks at 320px confirm the imported dictionary's selected title appears immediately after the shared Select bridge update; custom first-level category A displays as A. At 390px the open dictionary popup and trigger both measure 356px at x=17, within the viewport. At 320px settings fit in a 296px dialog without document overflow; selecting second-level scope 1.02 and exporting produces the expected 39-entry status and a real download event. The mobile category drawer exposes all current source units without export controls. German and Japanese dictionaries switch correctly to their 12-entry example banks, preserving the Japanese 名前 term and example. The final desktop-home capture was refreshed on the new origin with no console errors, warnings or other logs. Captures include `qa/home-desktop-v6.png`, `qa/settings-export-mobile-v6.png` and `qa/dictionary-switch-mobile-v6.png`; `qa/verification-v6.md` records the evidence and limits. The final application, storage-callback and Select-adapter VM checks and all eight syntax commands pass again after the Select/category-label changes. Prior v3–v5 browser evidence is not substituted for these v6 checks. No real-phone, native-screen-reader or human pronunciation review is claimed. The official design.md lint previously could not run because DNS access was unavailable and is not claimed passed.

Source import checkpoints are preserved in [docs/vocabulary-history.md](docs/vocabulary-history.md).
