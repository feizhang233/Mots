---
version: alpha
name: 'Mots'
description: 'A compact Liquid Glass vocabulary workspace with a Traditional Chinese interface.'
colors:
  primary: '#176B53'
  on-primary: '#FFFFFF'
  primary-container: '#DCEFE7'
  surface: '#F2F5F8'
  surface-container: '#E9EEF2'
  surface-high: '#DFE8ED'
  card: '#FBFDFD'
  ink: '#1B2B32'
  muted: '#5B6C75'
  outline: '#CDD9DF'
  success: '#386A48'
  warning: '#805B17'
  danger: '#AD3E36'
  scrollbar-thumb: '#AEBDC5'
  scrollbar-hover: '#7C929E'
  scrollbar-track: '#E9EEF2'
  learning: '#A8C9B3'
  difficult: '#D3B18B'
  brand-accent: '#D5E9A8'
  rating-green: '#2E7D4B'
  rating-orange: '#B46D10'
  rating-red: '#BD4B43'
typography:
  sans:
    fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text, PingFang TC, Microsoft JhengHei, sans-serif'
  display:
    fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display, PingFang TC, sans-serif'
  japanese:
    fontFamily: 'Hiragino Kaku Gothic ProN, Yu Gothic, Noto Sans CJK JP, sans-serif'
rounded:
  DEFAULT: '14px'
  card: '28px'
  control: '14px'
  pill: '999px'
  chip: '8px'
  dialog: '30px'
  drawer: '24px'
spacing:
  section-gap: '15px'
  page-max: '1270px'
  navigation-width: '254px'
  desktop-page-padding: '28px'
  mobile-page-padding: '16px'
components:
  button: {}
  icon-button: {}
  card: {}
  navigation: {}
  search: {}
  select: {}
  visibility-checkboxes: {}
  settings: {}
  word-deletion: {}
  rating-dots: {}
  chapter-disclosure: {}
  audio-button: {}
  list: {}
  progress: {}
  dialog: {}
  toast: {}
  scrollbar: {}
---

# Mots Design System

## Overview

A compact Apple-inspired Liquid Glass study workspace for a Chinese-speaking learner. A fresh visit opens a functional vocabulary-memorization homepage with local search, learning progress, and clear entry points to lookup, thematic study and a short random review. The Mots brand returns to that homepage within the same file; it must never navigate to a filesystem directory. This is a study workspace, with no marketing hero.

The interface and default meanings use Traditional Chinese (`zh-Hant`). Japanese is learning content only: preserve Japanese spelling and language tags, with JP-capable fonts. This is not a Japanese-interface or Japan-market product claim. French source content may grow; source files and runtime statistics own counts.

Authored styles are copied to `web/dist/` by `web/scripts/build.py`. Model B: `web/src/styles/styles.css` is the canonical runtime token source; `web/src/styles/select.css` consumes those tokens for the shared native Select, and `web/src/styles/workspace.css` uses them for home, review and dictionary navigation. This file mirrors its values; it does not generate a second theme. Typography maps to `--font-body`/`--font-display`, color names to their matching CSS variables, and card/control/pill to `--radius-*`. Component geometry is mirrored from the final compact-workspace CSS rules.

## Colors

Keep botanical `primary` (#176B53), a cool porcelain page (#F2F5F8), pale green selection (#DCEFE7), near-white reading cards (#FBFDFD), blue-grey ink (#1B2B32) and restrained silver outlines (#CDD9DF). The signature is a floating, translucent navigation rail above calm vocabulary surfaces. Blur never sits behind long reading text. Familiarity remains green=mastered, orange=partial recall and red=unfamiliar; selected dots also have a ring/checkmark, accessible name and visible legend. Hidden-level checkboxes include the neutral not-studied state. Loading/playing states never rely on color alone.

## Typography

Body and display text use the platform system stack: SF Pro on Apple platforms, with PingFang TC and Microsoft JhengHei fallbacks for Traditional Chinese. Display headings use stronger weight and tighter tracking rather than a decorative face. Japanese study terms/examples use Hiragino Kaku Gothic ProN, Yu Gothic or Noto Sans CJK JP and are not converted through Chinese script rules. Compact list words are 16px; meanings/examples are 12px desktop and 11px mobile. Long content wraps. At widths up to 480px, Latin card terms longer than 24 characters use a responsive 22–28px display size so paired forms fit at normal word boundaries; Japanese typography retains its existing sizing.

## Layout

Desktop navigation retains the existing 254px base width and responsive variants. A persistent header toggle collapses the entire sidebar and restores the space to study content; the same control remains reachable to reopen it. The preference is saved locally. Mobile keeps the category dialog rather than using the desktop collapsed layout. Safe-area insets and dynamic viewport height keep content clear of phone cutouts and the home indicator. On browsers exposing two horizontal viewport segments, navigation occupies the first screen and study content the second; the hinge contains no controls. Without that capability, the regular responsive layout remains available. The native app uses compact iPhone and regular-width split navigation. Main content caps at 1270px, with 28px desktop and 16px mobile padding (12px on the narrowest breakpoint). The top bar contains the active book selector and settings. It omits the book-entry count and routine local-save label; storage failures remain available in settings. The native Select lists all vocabulary and grammar books; its selected title replaces the former language heading. Settings opens as four collapsed rows: learning preferences, progress sync, dictionaries/vocabulary and backup/restore. Dictionary selection is the first field inside learning preferences. The main filter header places a compact 44px native mode selector immediately before search; its choices are content overview, thematic memorization and random review. Vocabulary and grammar are separate books in the top-bar selector; there is no separate content-mode toggle. Mobile puts the category heading above the controls, retaining room for every action at 320px. A Mots home link stays visible in the top bar when the sidebar is hidden or collapsed.

Web list rows use two compact logical bands, about 85px for a single-line desktop entry and growing for long content: term and meaning above, example and familiarity below. Native list geometry remains unchanged. Place the sole word speaker to the left of the word; no IPA/part second line, row Google link or sentence speaker. Mobile preserves the term/meaning band and the example/familiarity band; long text wraps, and details remain accessible without hover. Lists paginate at a configurable 10, 20, 50 or 100 words, defaulting to 20. Page size is a saved setting, and page/range feedback always reflects the selected value. Changing size keeps the old first visible word on the new page; filtering restarts at page 1. URL size/page can restore the list with valid bounds. Study search starts as an icon and expands when requested; home and dictionary search remain directly usable. Nonempty search always has an explicit clear control. Category navigation moves to a native modal drawer below 761px.

## Elevation & Depth

Translucent navigation, sidebar and modal chrome use `--glass`, `--glass-edge`, `--glass-shadow` and `--glass-blur` (24px). Near-white reading cards remain substantially opaque. A thin light edge and soft 9% shadow suggest glass without gradient blobs or decorative shimmer. The web implementation is a CSS interpretation; the native iOS app owns actual system Liquid Glass. Document scrolling owns study content; category navigation and dialogs may scroll internally. Controls and audio feedback retain stable dimensions. Dark mode follows the system and remaps all shared colors. Reduced transparency replaces glass with opaque cards; reduced motion removes transitions; forced colors retain system-operable borders and focus.

## Shapes

Reading cards use 28px corners, settings dialogs 30px (28px on phones), navigation/control groups 13–24px and pill actions. Native single-select controls are at least 44px high and show a real associated label in settings. The operating system owns popup placement, width, keyboard interaction and assistive technology; those popup details intentionally follow each platform. The switch uses a stable 27px light thumb and 31px pill track. Touch controls in mobile chrome use 44px targets.

## Components

- Chapter/child navigation is one shared renderer with `aria-expanded` and labelled child groups; there is no content-area subcategory chip row. Thematic grammar books use first-level navigation only and show second-level titles on expandable reading cards. Navigation and content headers have no download icons. Settings owns a single unfamiliar-vocabulary export area with first-/second-level scope selection and inline status.
- Home, dictionary lookup, thematic study and random review use shared application rendering. Home exposes local dictionary search, current-dictionary progress, the dictionary collection and clear next actions. A shared mode dropdown switches between lookup, thematic study and random review; only the Mots brand returns to home.
- Settings uses four compact disclosure groups, all collapsed on ordinary entry, with one expanded at a time. Each row has one outlined icon, a clear title, a short current-value/status summary and a directional chevron. Expanded content uses the existing field rhythm without nested cards or accordions. Detailed help appears only within the relevant group; version information stays a quiet footer. Sync status and persistent save/import/export failures remain discoverable when groups are collapsed. Web uses native details/summary; iOS uses the system Form and DisclosureGroup.
- The book switcher in the top bar and the first field inside settings’ learning preferences share one native Select adapter and list every book. Web titles use Français Mots / Français Grammaire, Deutsch Wörter / Deutsch Grammatik, and 日本語 語彙 / 日本語 文法; imported dictionaries have their own names, categories, words and progress. Same-language dictionaries must not share familiarity or accidentally reuse built-in word audio by ID.
- Dictionary lookup shows visible definitions and examples in a paginated alphabetical list. It includes mastered entries and does not apply study familiarity-hide preferences. Thematic study retains its card/list, order and familiarity controls.
- A random review captures at most 20 unique non-mastered entries from the current dictionary. It prioritizes unfamiliar/partial-recall entries, then fills from not-studied entries. Rating saves and advances one card while retaining the captured queue. The last rating or forward action opens completion, which reports the actual number rated and offers another round or lookup. This is a bounded local practice round, not a spaced-repetition schedule.
- One native `<select>` primitive owns mode, dictionary, study language, meaning language, audio, page size and export scope controls. `web/src/components/select.js` exposes the shared `MotsSelect` option/value bridge; `web/dist/select.js` is its generated classic-script copy. Labels use safe text nodes. Options and selected values update synchronously, including freshly imported dictionaries. There is no custom-element upgrade, external component package or duplicated local listbox.
- Hidden familiarity levels use native `details/summary` and checkboxes, independently stored by dictionary. Settings adds an off-by-default global switch to hide mastered words. It does not suppress dictionary lookup results. Explicit URL filters, including empty `hide=`, allow a temporary show-all study choice. Immediate study removal after marking is explained by counts/toast and reversible show-all actions.
- Web card position uses a native range in the right sidebar below the familiarity statistics, replacing the shortcut-hint text. At narrow widths, retain the range below the card navigation while hiding the statistics. It shares the primary accent, muted label and tabular current/total count. Keep its 44px input target and visible keyboard focus; the card updates continuously without replacing the active slider.
- Audio has one word-level button and a shared player. Stable loading, playing, stopped and error feedback is shared across card/list.
- Search is local, accent-insensitive and IME-aware. Empty, missing-meaning, invalid-import and storage-failure states use direct Traditional Chinese copy.
- Native dialogs own modality and focus behavior. One polite `toast()` region replaces older messages after 2600ms; inline settings errors and persistent save status hold recovery details.
- List deletion uses a dedicated 44px trailing trash action on Web and native trailing swipe actions on iOS. A visible undo action follows deletion; settings’ dictionaries/vocabulary group owns the long-term deleted-word recovery view. Native rows remain a single List scroller with word/meaning speech and separate rating controls. Familiarity and source content survive deletion; restored words return to the active catalog.
- Inline SVG icons retain the existing outlined family. Every icon-only control has a localized accessible name.
- Motion communicates state only. Respect reduced motion; global scrollbars stay visible/usable, and forced-colors retain system-operable states.

## Do's and Don'ts

- Do keep the study language and meaning language independent, and label missing meanings honestly.
- Do preserve built-in vocabulary, source IDs and the existing French progress key when importing extra banks or dictionaries.
- Do keep dictionary identity separate from language; imported dictionaries of the same language retain independent progress and source content.
- Do keep Japanese terms/examples untouched by Chinese display conversion.
- Don't reintroduce a hero, duplicate row audio tools or an IPA/part-of-speech second line.
- Don't imply full German/Japanese translations, synchronization before pairing, human recordings or unperformed device tests.
- Progress sync lives inside settings with create/join, masked code, explicit reveal/copy, connection status, manual retry and disconnect. Keep unfamiliarity controls immediate and preserve current selection/review queue when remote changes arrive. No account UI is required.

## Approved migration

The October 23 brief replaces Material 3 throughout active UI with Apple Liquid Glass. Native SwiftUI screens use system components; the web fallback shares the porcelain/green palette and restrained glass chrome. Existing web workflows and storage formats remain unchanged. Older QA captures document historical states and are not evidence for this migration.

### Native adapter

`mobile/ios/Mots/Shared/Theme.swift` owns native semantic colors and maps them through dynamic `UIColor` providers into SwiftUI. It does not duplicate web layout values or implement glass using a blur approximation. Native navigation, menus and buttons use the system material; `MotsGlassChrome` is the shared custom glass treatment, with an opaque reduced-transparency variant. `MotsCardSurface` owns readable content surfaces. The native body font is the Dynamic Type system font, with rounded system display typography for vocabulary.

| Semantic role   | Native light / dark   | Consumers                                     |
| --------------- | --------------------- | --------------------------------------------- |
| Accent          | `#245B48` / `#A7DCC3` | Navigation, prominent glass actions, progress |
| Page            | `#F3F6F7` / `#111817` | Sidebar and learning canvas                   |
| Reading surface | `#FFFFFF` / `#1C2523` | Word cards and lists                          |
| Ink             | `#202A25` / `#EDF4EF` | Reading content                               |
| Secondary text  | `#5D7066` / `#A9BDB0` | Captions and context                          |

The native palette keeps Mots' original forest accent and uses a platform-tuned contrast mapping; the web palette above remains owned by CSS. Native card corners are 28 pt; interactive content targets at least 44 pt. The native app opens the last study destination rather than reproducing the web homepage. Navigation uses `NavigationSplitView` with model state outside the changing column layout. System safe areas, size classes and natural wrapping own resizing; there is no fixed Duo screen size.

Native previous/next controls use `MotsGlassIconControl` in `Shared/Theme.swift`. Its 44 pt circular frame sizes the styled system glass control, so internal label padding cannot inflate it into a capsule. The inline study filter uses a borderless native Menu beside the segmented layout picker: one stable line icon, a small active-state dot and a 44 pt rectangular label touch target. It has no nested circular symbol or standalone glass ring; its opened menu retains the system presentation. List scope headings align with the word text, wrap naturally and expose heading semantics; the list owns its explicit top content margin. Pagination uses equal circular controls on both sides of a centered range, including its disabled boundary states.

Native screenshot follow-up: focused cards use a system page-curl pager without a recall hint. The latest footer correction keeps green/yellow/red color-only rating buttons between previous/next arrows, with accessible names and 44pt touch targets; list rows place small red/yellow/green color-only rating buttons on the right, with accessible names and selection checkmarks. The left term/meaning area plays pronunciation on tap; list rows omit examples and separate speaker/card-opening icons. The list dictionary-summary header is removed. The app icon uses an opaque full-bleed forest-green book/M silhouette with ivory/sage pages and a muted gold bookmark; `mobile/ios/scripts/create-icon.swift` is the editable native source, and the existing AppIcon catalog owns bundling.

### Web vocabulary and grammar memorization — October 24

The latest follow-up organizes vocabulary and grammar as separate books. One 44px native book Select in the top bar replaces the former language title and the removed content-mode toggle. It lists all books and shares selection with settings. The selected book’s kind determines vocabulary/grammar wording. Existing vocabulary IDs and progress remain unchanged. This initial Web pass is extended to native iOS by the mobile grammar follow-up below.

`workspace.js` owns both modes’ list, card and detail rendering. Lists have term/meaning in their first band and one original-language example, details and familiarity in the second. Cards expand their reading surface and reveal meaning plus up to two distinct examples. The native `#entry-detail-dialog` displays all available examples, pattern and explanation, restores focus on close, and suspends study shortcuts while open. It shares the existing card, outline, ink and radius tokens; no additional theme is introduced.

`grammar.js` owns three honestly named starter collections (French, German and Japanese), six grammar points and three original examples per language entry. This is demonstration learning content, not a complete curriculum or a textbook transcription. Existing vocabulary frequently has only one example; display it once and label absent explanations honestly. Rich JSON imports preserve examples/translations/pattern/explanation. Do not fabricate a second example through duplication or automatic sentence templates.

## Japanese furigana — October 24

Japanese vocabulary uses semantic ruby/rt annotations above consecutive kanji groups in the shared card, list and detail renderer. Fixed kana and okurigana stay on the baseline; kana-only terms appear once. MotsCore.formatTerm owns the escaped markup and reading alignment; styles.css owns ruby typography. Preserve source terms, reading fields, IDs, audio references and progress. The interface remains Traditional Chinese; this is Japanese learning-content typography, not a Japanese locale or Japan-market flow.

The October 24 browser follow-up removes example translations from lists, cards and details, while retaining meanings and usage explanations. Stored example translations remain preserved by imports/backups and searchable. Native popup semantics and a 44px trigger are retained for the top-bar book selector, including keyboard focus and a full-title tooltip for long imported names. Web display titles do not re-identify books or modify native catalog metadata. Imported book titles remain user-defined.

The top bar omits the entry count and normal local-save badge. The study-method selector uses the original shared native Select: a near-white pill, 44px target and visible focus. The operating system owns popup presentation and keyboard interaction. Lists use compact vertical padding and a small gap between their term/meaning and example/familiarity bands; long content remains free to wrap, and coarse-pointer controls retain 44px targets.

The settings title bar spans the dialog’s full inner width and stays at scroll offset zero. It shares the content’s 25px desktop / 20px mobile inset, uses the glass material, and keeps a 44px close button. Its 76px desktop / 68px mobile minimum height and dialog scroll padding keep expanded sections and focused controls clear of the header. The card/list/order toolbar omits the redundant result count; scope and pagination counts remain in their owning locations.

### Native grammar books — October 24

The mobile follow-up extends the same independent grammar books to iOS. `StudyDictionary.kind` owns vocabulary/grammar behavior; the top navigation book Menu, sidebar and settings all use its `displayTitle`. The compact navigation has one category control so long book names retain space. Built-in vocabulary IDs and existing progress remain unchanged.

`GrammarRow` is the explicit native list variant: term/meaning above, original-language example, details and familiarity below, with natural wrapping and 44pt controls. Accessibility text sizes stack its reading columns. The accepted compact vocabulary row remains unchanged. `StudyCard` reveals meaning, available pattern and at most two distinct examples; `EntryDetailView` is the shared native large sheet for all examples, pattern and explanation. Example translations remain in data and backup only. Native page-curl, list pagination and card rating/advance remain shared.

Native grammar uses the existing `MotsTheme` semantic colors, opaque reading surfaces, Dynamic Type and system navigation/sheets. No new theme or independent mode switch is introduced.

### Independent grammar books — October 24

The corrected brief separates ordinary grammar and thematic grammar into independent books and sources. Ordinary books (`grammar-fr`, `grammar-de`, `grammar-ja`) retain their original independent rows, two-level navigation, details and individual flashcards. Their study action is labelled 語法背誦. Thematic books use 主題背誦, large disclosure cards headed by second-level categories and existing individual grammar rows as small reading cards; their navigation shows first-level categories only. The three `grammar-theme-*` books start empty pending thematic source material, with an explicit import route. They do not reuse ordinary entries or progress.

Book metadata `grammarMode` owns the immutable standard/thematic distinction. The prior 有／無 display setting is removed. Settings explains the current book type without offering to convert it. Web uses native details/summary with existing card/surface/outline/radius tokens; iOS uses DisclosureGroup and existing reading surfaces. No new theme is introduced. Card mode and random review always show individual entries. List pagination counts those entries, and a group split across pages reports its page-local count and filtered total. Transient expansion survives ratings and returning from cards; search exposes matching children. Web focus stays visible when a group empties.
