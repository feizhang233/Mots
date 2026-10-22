---
version: alpha
name: "Mots"
description: "A compact Material 3 vocabulary workspace with a Traditional Chinese interface."
colors:
  primary: "#245B48"
  on-primary: "#FFFFFF"
  primary-container: "#D7EBDF"
  surface: "#F6F8F5"
  surface-container: "#EDF1EB"
  surface-high: "#E4EBE2"
  card: "#FFFFFF"
  ink: "#202A25"
  muted: "#606D65"
  outline: "#D4DCD3"
  success: "#386A48"
  warning: "#805B17"
  danger: "#994D42"
  scrollbar-thumb: "#B2BEB1"
  scrollbar-hover: "#819580"
  scrollbar-track: "#EDF1EB"
  learning: "#A8C9B3"
  difficult: "#D3B18B"
  brand-accent: "#D5E9A8"
  rating-green: "#2E7D4B"
  rating-orange: "#CB8519"
  rating-red: "#C4544B"
typography:
  sans:
    fontFamily: "Arial, PingFang TC, Microsoft JhengHei, Noto Sans CJK TC, sans-serif"
  display:
    fontFamily: "Avenir Next, Arial, PingFang TC, Microsoft JhengHei, sans-serif"
  japanese:
    fontFamily: "Hiragino Kaku Gothic ProN, Yu Gothic, Noto Sans CJK JP, sans-serif"
rounded:
  DEFAULT: "12px"
  card: "24px"
  control: "12px"
  pill: "999px"
  chip: "8px"
  dialog: "22px"
  drawer: "24px"
spacing:
  section-gap: "15px"
  page-max: "1270px"
  navigation-width: "254px"
  desktop-page-padding: "28px"
  mobile-page-padding: "16px"
components:
  button: {}
  icon-button: {}
  card: {}
  navigation: {}
  search: {}
  select: {}
  visibility-checkboxes: {}
  settings: {}
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

A compact Material 3 study workspace for a Chinese-speaking learner. A fresh visit opens a functional dictionary homepage with local search, learning progress, and clear entry points to lookup, thematic study and a short random review. The Mots brand returns to that homepage within the same file; it must never navigate to a filesystem directory. This is a study workspace, with no marketing hero.

The interface and default meanings use Traditional Chinese (`zh-Hant`). Japanese is learning content only: preserve Japanese spelling and language tags, with JP-capable fonts. This is not a Japanese-interface or Japan-market product claim. French source content may grow; source files and runtime statistics own counts.

Model B: `dist/styles.css` is the canonical runtime token source; `dist/select.css` consumes those tokens for the shared authored Select, and `dist/workspace.css` uses them for home, review and dictionary navigation. This file mirrors its values; it does not generate a second theme. Typography maps to `--font-body`/`--font-display`, color names to their matching CSS variables, and card/control/pill to `--radius-*`. Component geometry is mirrored from the final compact-workspace CSS rules.

## Colors

Keep botanical `primary`, pale `primary-container` and layered neutral surfaces. Ink/muted/outline define hierarchy without decorative shadows. Familiarity remains green=mastered, orange=partial recall and red=unfamiliar; selected dots also have a ring/checkmark, accessible name and visible legend. Hidden-level checkboxes include the neutral not-studied state. Loading/playing states never rely on color alone.

## Typography

Body text uses Arial with PingFang TC, Microsoft JhengHei and Noto Sans CJK TC fallbacks; display text uses Avenir Next with the TC-capable fallback stack. Japanese study terms/examples use Hiragino Kaku Gothic ProN, Yu Gothic or Noto Sans CJK JP and are not converted through Chinese script rules. Compact list words are 16px; meanings/examples are 12px desktop and 11px mobile. Long content wraps. At widths up to 480px, Latin card terms longer than 24 characters use a responsive 22–28px display size so paired forms fit at normal word boundaries; Japanese typography retains its existing sizing.

## Layout

Desktop navigation retains the existing 254px base width and responsive variants. A persistent header toggle collapses the entire sidebar and restores the space to study content; the same control remains reachable to reopen it. The preference is saved locally. Mobile keeps the category dialog rather than using the desktop collapsed layout. Main content caps at 1270px, with 28px desktop and 16px mobile padding (12px on the narrowest breakpoint). The top bar contains the active language, a right-side dictionary switcher and settings. On mobile it may wrap to a second row so the dictionary control remains readable and reachable at 320px.

List rows have a 52px desktop and 80px mobile minimum, growing for long content. Place the sole word speaker to the left of the word; no IPA/part second line, row Google link or sentence speaker. Mobile rows stack meaning/example while keeping familiarity reachable. Lists paginate at a configurable 10, 20, 50 or 100 words, defaulting to 20. Page size is a saved setting, and page/range feedback always reflects the selected value. Changing size keeps the old first visible word on the new page; filtering restarts at page 1. URL size/page can restore the list with valid bounds. Study search starts as an icon and expands when requested; home and dictionary search remain directly usable. Nonempty search always has an explicit clear control. Category navigation moves to a native modal drawer below 761px.

## Elevation & Depth

Tonal surfaces and thin borders define cards and tables. Elevation is reserved for settings/category overlays, the hidden-level panel and toast. Document scrolling owns study content; category navigation and dialogs may scroll internally. Controls and audio feedback retain stable dimensions.

## Shapes

Cards use 24px, settings dialog 22px, category drawer outer edge 24px, compact table/filter panels 13–15px and chapter buttons 12px corners. Settings selects use Google’s official `@material/web` `md-outlined-select`: 56px outlined field, floating label, one trailing chevron, primary focus outline and the component-owned option menu. The production component is bundled locally for standalone/offline use. Popup width follows the trigger, with bounded height and viewport-aware placement. Actions retain pill or circular variants; list familiarity dots are circular and gain an outer selected ring.

## Components

- Chapter/child navigation is one shared renderer with `aria-expanded` and labelled child groups; there is no content-area subcategory chip row. Navigation and content headers have no download icons. Settings owns a single unfamiliar-vocabulary export area with first-/second-level scope selection and inline status.
- Home, dictionary lookup, thematic study and random review use shared application rendering. Home exposes local dictionary search, current-dictionary progress, the dictionary collection and clear next actions. A desktop/mobile mode strip and the brand provide consistent destinations.
- The right-side dictionary switcher uses the same locally bundled official Material Web Select as settings. Built-in French-book, German-example and Japanese-example dictionaries are honestly named; imported dictionaries have their own names, categories, words and progress. Same-language dictionaries must not share familiarity or accidentally reuse built-in word audio by ID.
- Dictionary lookup shows visible definitions and examples in a paginated alphabetical list. It includes mastered entries and does not apply study familiarity-hide preferences. Thematic study retains its card/list, order and familiarity controls.
- A random review captures at most 20 unique non-mastered entries from the current dictionary. It prioritizes unfamiliar/partial-recall entries, then fills from not-studied entries. Rating saves and advances one card while retaining the captured queue. The last rating or forward action opens completion, which reports the actual number rated and offers another round, lookup or home. This is a bounded local practice round, not a spaced-repetition schedule.
- The shared locally bundled `@material/web` `md-outlined-select` owns dictionary, study language, meaning language, audio, page size and export scope controls. `dist/select.js` exposes one option-configuration bridge, with explicit option display/typeahead labels and latest-value synchronization after option updates. Dynamically imported dictionaries must show their selected title immediately. The official component owns popup semantics and keyboard interaction; no native `<select>` or duplicated screen-local listbox is presented.
- Hidden familiarity levels use native `details/summary` and checkboxes, independently stored by dictionary. Settings adds an off-by-default global switch to hide mastered words. It does not suppress dictionary lookup results. Explicit URL filters, including empty `hide=`, allow a temporary show-all study choice. Immediate study removal after marking is explained by counts/toast and reversible show-all actions.
- Audio has one word-level button and a shared player. Stable loading, playing, stopped and error feedback is shared across card/list.
- Search is local, accent-insensitive and IME-aware. Empty, missing-meaning, invalid-import and storage-failure states use direct Traditional Chinese copy.
- Native dialogs own modality and focus behavior. One polite `toast()` region replaces older messages after 2600ms; inline settings errors and persistent save status hold recovery details.
- Inline SVG icons retain the existing outlined family. Every icon-only control has a localized accessible name.
- Motion communicates state only. Respect reduced motion; global scrollbars stay visible/usable, and forced-colors retain system-operable states.

## Do's and Don'ts

- Do keep the study language and meaning language independent, and label missing meanings honestly.
- Do preserve built-in vocabulary, source IDs and the existing French progress key when importing extra banks or dictionaries.
- Do keep dictionary identity separate from language; imported dictionaries of the same language retain independent progress and source content.
- Do keep Japanese terms/examples untouched by Chinese display conversion.
- Don't reintroduce a hero, duplicate row audio tools or an IPA/part-of-speech second line.
- Don't imply full German/Japanese translations, cross-device synchronization, human recordings or unperformed device tests.
