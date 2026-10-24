(() => {
  'use strict';
  // Classic-script dependencies are loaded before this application entry point.
  const {
    MotsCore,
    MotsAudio,
    MotsDownloads,
    MotsEntries,
    MotsDictionaries,
    MotsWorkspace,
    MotsSelect,
    MotsProgressSync,
    MotsDeletions,
  } = window;
  const { escapeHTML: esc, isObject } = MotsCore;
  const { downloadFile, downloadJSON: download } = MotsDownloads;
  const $ = (id) => document.getElementById(id);
  const tc = (value) =>
    window.motsTraditional ? window.motsTraditional(String(value ?? '')) : String(value ?? '');
  const sc = (value) =>
    window.motsSimplified ? window.motsSimplified(String(value ?? '')) : String(value ?? '');
  const languages = window.MOTS_LANGUAGES;
  const meaningLanguages = window.MOTS_MEANING_LANGUAGES;
  const languageOf = (code) => languages.find((l) => l.code === code) || languages[0];
  const meaningOf = (code) => meaningLanguages.find((l) => l.code === code) || meaningLanguages[0];
  const languageCodes = new Set(languages.map((l) => l.code));
  const meaningCodes = new Set(meaningLanguages.map((l) => l.code));
  const pageSizes = [10, 20, 50, 100];
  let categories = window.CATEGORIES || [];
  const labels = ['未學習', '不熟悉', '有印象', '已掌握'];
  const icons = {
    sound:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m11 5-6 4H2v6h3l6 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 10 4 4 4-4"/></svg>',
    book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c-3-2-7-2-10-1v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Zm0 0v15"/></svg>',
    right: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>',
    left: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m5-5-5 5 5 5"/></svg>',
    eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
    random:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h3c5 0 7 12 12 12h3m-4-4 4 4-4 4M3 18h3c2 0 4-3 6-6s4-6 6-6h3m-4-4 4 4-4 4"/></svg>',
    ordered:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4v16m-4-4 4 4 4-4M16 4h4m-4 5h4m-4 5h4"/></svg>',
  };
  const settingsKey = 'mots.settings.v2',
    banksKey = 'mots.banks.v1',
    dictionariesKey = 'mots.dictionaries.v1';
  const progressKey = (id) =>
    id === 'fr'
      ? 'mots.progress.v1'
      : ['de', 'ja'].includes(id)
        ? `mots.progress.${id}.v1`
        : `mots.progress.dictionary.${id}.v1`;
  const storageFailures = new Set();
  const read = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch {
      storageFailures.add(key);
      return fallback;
    }
  };
  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      storageFailures.delete(key);
      updateSaveState();
      return true;
    } catch {
      storageFailures.add(key);
      updateSaveState();
      return false;
    }
  }
  let dictionaryLibrary = [];
  try {
    dictionaryLibrary = MotsDictionaries.validateLibrary(read(dictionariesKey, []));
  } catch {
    storageFailures.add(dictionariesKey);
  }
  // Web book titles are presentation metadata; stable IDs retain existing progress.
  const builtinBookTitles = Object.freeze({
    fr: 'Français Mots',
    de: 'Deutsch Wörter',
    ja: '日本語 語彙',
    'grammar-fr': 'Français Grammaire',
    'grammar-de': 'Deutsch Grammatik',
    'grammar-ja': '日本語 文法',
    'grammar-theme-fr': 'Français Grammaire · 主題',
    'grammar-theme-de': 'Deutsch Grammatik · 主題',
    'grammar-theme-ja': '日本語 文法 · 主題',
  });
  const builtinDictionaries = () =>
    [...MotsDictionaries.builtins(), ...window.MotsGrammar.builtins()].map((book) => ({
      ...book,
      title: builtinBookTitles[book.id] || book.title,
    }));
  const builtinIDs = () => builtinDictionaries().map((d) => d.id);
  const dictionaryList = () => [...builtinDictionaries(), ...dictionaryLibrary];
  const dictionaryKind = (dictionary) =>
    dictionary?.kind === 'grammar' ? 'grammar' : 'vocabulary';
  const isThematicGrammar = (dictionary) =>
    dictionaryKind(dictionary) === 'grammar' && dictionary.grammarMode === 'thematic';
  const dictionaryOf = (id) => dictionaryList().find((d) => d.id === id) || dictionaryList()[0];
  const dictionaryIDs = () => dictionaryList().map((d) => d.id);
  function sanitizeSettings(value = {}) {
    const source = isObject(value) ? value : {};
    const visibility = {};
    for (const id of dictionaryIDs())
      visibility[id] = Array.isArray(source.visibility?.[id])
        ? [...new Set(source.visibility[id].filter((l) => [0, 1, 2, 3].includes(l)))]
        : [];
    const dictionaryId = dictionaryIDs().includes(source.dictionaryId)
      ? source.dictionaryId
      : languageCodes.has(source.studyLanguage)
        ? source.studyLanguage
        : 'fr';
    return {
      dictionaryId,
      studyLanguage: dictionaryOf(dictionaryId).language,
      meaningLanguage: meaningCodes.has(source.meaningLanguage)
        ? source.meaningLanguage
        : 'zh-Hant',
      audioMode: ['auto', 'device', 'google'].includes(source.audioMode)
        ? source.audioMode
        : 'auto',
      view: source.view === 'card' ? 'card' : 'list',
      order: source.order === 'random' ? 'random' : 'ordered',
      pageSize: pageSizes.includes(Number(source.pageSize)) ? Number(source.pageSize) : 20,
      defaultHideMastered: source.defaultHideMastered === true,
      sidebarCollapsed: source.sidebarCollapsed === true,
      visibility,
    };
  }
  let settings = sanitizeSettings(read(settingsKey, {}));
  function applyDefaultVisibility(lang) {
    if (settings.defaultHideMastered)
      settings.visibility[lang] = [...new Set([...settings.visibility[lang], 3])];
  }
  for (const id of dictionaryIDs()) applyDefaultVisibility(id);
  let customBanks = read(banksKey, {});
  if (!isObject(customBanks)) customBanks = {};
  const progress = {};
  let progressSync = null;
  let deletionState = null;
  let deletionKeys = new Set();
  let deletionUndo = null;
  let syncReady = false;
  const cleanProgress = (values) =>
    Object.fromEntries(
      Object.entries(isObject(values) ? values : {}).filter(
        ([id, l]) =>
          !['__proto__', 'constructor', 'prototype'].includes(id) && [0, 1, 2, 3].includes(l),
      ),
    );
  for (const id of dictionaryIDs()) {
    progress[id] = cleanProgress(read(progressKey(id), {}));
  }
  function normalizeWord(word, language) {
    const meanings = isObject(word.meanings) ? { ...word.meanings } : {};
    if (language === 'fr' && word.chinese && !meanings['zh-Hans'])
      meanings['zh-Hans'] = word.chinese;
    if (meanings['zh-Hans'] && !meanings['zh-Hant']) meanings['zh-Hant'] = tc(meanings['zh-Hans']);
    if (meanings['zh-Hant'] && !meanings['zh-Hans']) meanings['zh-Hans'] = sc(meanings['zh-Hant']);
    let details;
    try {
      details = MotsDictionaries.normalizeDetails(word);
    } catch {
      // Keep damaged local extensions readable without overwriting the stored record.
      // New imports are still validated before any state is changed.
      storageFailures.add(banksKey);
      const example = typeof word.example === 'string' ? word.example : '';
      details = {
        example,
        examples: example ? [{ text: example, translations: {} }] : [],
        pattern: '',
        explanation: '',
      };
    }
    return {
      ...word,
      language,
      term: String(word.term || word.french || ''),
      meanings,
      ...details,
    };
  }
  let banks;
  function refreshBanks() {
    banks = { fr: (window.WORDS || []).map((w) => normalizeWord(w, 'fr')) };
    for (const lang of ['de', 'ja'])
      banks[lang] = (window.MOTS_EXTRA_BANKS?.[lang] || []).map((w) => normalizeWord(w, lang));
    for (const dictionary of window.MotsGrammar.builtins())
      banks[dictionary.id] = dictionary.words.map((w) => normalizeWord(w, dictionary.language));
    for (const dictionary of builtinDictionaries()) {
      const lang = dictionary.id;
      const extras = Array.isArray(customBanks[lang]) ? customBanks[lang] : [];
      for (const word of extras)
        if (
          isObject(word) &&
          typeof word.id === 'string' &&
          word.id.startsWith(`custom-${lang}-`) &&
          typeof word.term === 'string'
        )
          banks[lang].push(normalizeWord(word, dictionary.language));
    }
    for (const dictionary of dictionaryLibrary)
      banks[dictionary.id] = dictionary.words.map((w) => normalizeWord(w, dictionary.language));
  }
  refreshBanks();
  const url = new URL(location.href);
  const initialDictionary = dictionaryIDs().includes(url.searchParams.get('dict'))
    ? url.searchParams.get('dict')
    : languageCodes.has(url.searchParams.get('lang'))
      ? url.searchParams.get('lang')
      : settings.dictionaryId;
  categories = dictionaryOf(initialDictionary).categories;
  const categoryValid = (id) => id === 'all' || categories.some((c) => c.id === id);
  if (pageSizes.includes(Number(url.searchParams.get('size'))))
    settings.pageSize = Number(url.searchParams.get('size'));
  const requestedPage = Number(url.searchParams.get('page'));
  const requestedScreen = url.searchParams.get('screen');
  const screen = ['home', 'study', 'dictionary', 'review'].includes(requestedScreen)
    ? requestedScreen
    : url.searchParams.has('category')
      ? 'study'
      : 'home';
  const state = {
    dictionary: initialDictionary,
    studyKind: dictionaryKind(dictionaryOf(initialDictionary)),
    language: dictionaryOf(initialDictionary).language,
    screen,
    category: categoryValid(url.searchParams.get('category'))
      ? url.searchParams.get('category')
      : 'all',
    subcategory: url.searchParams.get('sub') || 'all',
    query: url.searchParams.get('q') || '',
    view: ['list', 'card'].includes(url.searchParams.get('view'))
      ? url.searchParams.get('view')
      : settings.view,
    order: url.searchParams.get('order') === 'random' ? 'random' : settings.order,
    index: 0,
    page: Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1,
    revealed: false,
    completed: false,
    searchOpen: screen === 'dictionary' || Boolean(url.searchParams.get('q')),
  };
  if (url.searchParams.has('hide'))
    settings.visibility[state.dictionary] = [
      ...new Set(
        url.searchParams
          .get('hide')
          .split(',')
          .filter((v) => /^[0-3]$/.test(v))
          .map(Number),
      ),
    ];
  else if (/^[0-3]$/.test(url.searchParams.get('level') || ''))
    settings.visibility[state.dictionary] = [0, 1, 2, 3].filter(
      (l) => l !== Number(url.searchParams.get('level')),
    );
  let deck = [],
    matched = [],
    randomOrder = [],
    expandedCategory = state.category === 'all' ? null : state.category,
    composing = false,
    homeComposing = false,
    toastTimer,
    reviewSession = null,
    studyCardAnchor = null,
    exportScopeValue = 'all';
  const categoryOf = (id) => categories.find((c) => c.id === id);
  const grammarGroupingEnabled = () => isThematicGrammar(dictionaryOf(state.dictionary));
  // Disclosure is local presentation state, separate from saved study preferences.
  const grammarDisclosures = new Map();
  const grammarGroupKey = (id) => `${state.dictionary}:${id}`;
  const subcategoryOf = (id) => categories.flatMap((c) => c.subcategories).find((s) => s.id === id);
  const categoryLabel = (value) =>
    ['fr', 'de', 'ja'].includes(state.dictionary) ? tc(value) : String(value ?? '');
  const sourceWords = (dictionaryID = state.dictionary) => banks[dictionaryID] || [];
  const words = () =>
    sourceWords().filter((word) => !deletionState?.isDeleted(state.dictionary, word.id));
  const hiddenLevels = () => settings.visibility[state.dictionary] || [];
  const levelOf = (id) =>
    [1, 2, 3].includes(progress[state.dictionary]?.[id]) ? progress[state.dictionary][id] : 0;
  const normalize = (value) =>
    String(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase()
      .trim();
  function meaning(word) {
    const lang = settings.meaningLanguage;
    if (lang === state.language) return { text: word.term, missing: false };
    const text = word.meanings?.[lang];
    return text
      ? { text: lang === 'zh-Hant' ? tc(text) : String(text), missing: false }
      : {
          text: `尚無${{ 'zh-Hant': '繁體中文', 'zh-Hans': '簡體中文', en: '英語', fr: '法語', de: '德語', ja: '日語' }[lang]}釋義`,
          missing: true,
        };
  }
  function toast(message) {
    clearTimeout(toastTimer);
    $('toast').textContent = message;
    $('toast').classList.add('visible');
    toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 2600);
  }
  function updateSaveState() {
    if (!$('save-state')) return;
    $('save-state').hidden = !storageFailures.size;
    $('save-state').innerHTML = storageFailures.size ? '部分資料僅暫存，請備份。' : '';
    if ($('settings-save-note'))
      $('settings-save-note').textContent = storageFailures.size
        ? '部分資料僅暫存於此頁，請下載備份。'
        : '設定會自動儲存於此瀏覽器。';
  }
  function saveSettings() {
    settings.dictionaryId = state.dictionary;
    settings.studyLanguage = state.language;
    settings.view = state.view;
    settings.order = state.order;
    return write(settingsKey, settings);
  }
  function syncURL() {
    const u = new URL(location.href);
    u.search = '';
    u.hash = '';
    u.searchParams.set('dict', state.dictionary);
    u.searchParams.set('screen', state.screen);
    u.searchParams.set('lang', state.language);
    u.searchParams.set('category', state.category);
    if (state.subcategory !== 'all') u.searchParams.set('sub', state.subcategory);
    if (state.query) u.searchParams.set('q', state.query);
    if (hiddenLevels().length || settings.defaultHideMastered)
      u.searchParams.set('hide', [...hiddenLevels()].sort().join(','));
    if (state.view === 'list') u.searchParams.set('view', 'list');
    u.searchParams.set('size', settings.pageSize);
    if ((state.screen === 'dictionary' || state.view === 'list') && state.page > 1)
      u.searchParams.set('page', state.page);
    if (state.order === 'random') u.searchParams.set('order', 'random');
    try {
      history.replaceState(null, '', u);
    } catch {
      /* A browser may restrict file-URL history changes. */
    }
  }
  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function groupWords() {
    return words().filter(
      (w) =>
        (state.category === 'all' || w.category === state.category) &&
        (state.subcategory === 'all' || w.subcategory === state.subcategory),
    );
  }
  function vocabularyForExport(category, subcategory = 'all') {
    return words().filter(
      (w) =>
        (category === 'all' || w.category === category) &&
        (subcategory === 'all' || w.subcategory === subcategory) &&
        levelOf(w.id) !== 3,
    );
  }
  function exportScopeName(category, subcategory = 'all') {
    if (subcategory !== 'all') {
      const sub = subcategoryOf(subcategory);
      return `${subcategory} ${categoryLabel(sub?.name || '')}`.trim();
    }
    return category === 'all'
      ? '全部單字'
      : `${category} ${categoryLabel(categoryOf(category)?.name || '')}`.trim();
  }
  function buildDeck(reset = true, reshuffle = false) {
    stopPlayback();
    if (grammarGroupingEnabled()) state.subcategory = 'all';
    if (state.screen === 'review' && reviewSession) {
      const lookup = new Map(words().map((w) => [w.id, w]));
      deck = reviewSession.ids.map((id) => lookup.get(id)).filter(Boolean);
      matched = [...deck];
    } else {
      matched = groupWords().filter(
        (w) =>
          !state.query ||
          normalize(
            `${w.term} ${Object.values(w.meanings || {}).join(' ')} ${w.chinese || ''} ${w.example} ${w.pattern || ''} ${w.explanation || ''} ${(w.examples || []).map((example) => `${example.text} ${Object.values(example.translations || {}).join(' ')}`).join(' ')}`,
          ).includes(normalize(state.query)),
      );
      deck =
        state.screen === 'dictionary'
          ? [...matched]
          : matched.filter((w) => !hiddenLevels().includes(levelOf(w.id)));
    }
    if (state.screen === 'dictionary')
      deck.sort((a, b) =>
        a.term.localeCompare(b.term, state.language, { sensitivity: 'base', numeric: true }),
      );
    else if (state.screen !== 'review' && state.order === 'random') {
      if (reshuffle || !randomOrder.length) randomOrder = shuffle(sourceWords().map((w) => w.id));
      const rank = new Map(randomOrder.map((id, index) => [id, index]));
      deck.sort((a, b) => rank.get(a.id) - rank.get(b.id));
    }
    if (reset && state.screen !== 'review') {
      studyCardAnchor = null;
      state.index = 0;
      state.page = 1;
      state.revealed = false;
      state.completed = false;
    }
    state.index = Math.min(state.index, Math.max(0, deck.length - 1));
    state.page = Math.min(state.page, Math.max(1, Math.ceil(deck.length / settings.pageSize)));
    syncURL();
    render();
  }
  function showScreen(screen, query = '') {
    stopPlayback();
    homeComposing = false;
    composing = false;
    reviewSession = null;
    state.screen = screen;
    state.query = query;
    state.searchOpen = screen === 'dictionary' || Boolean(query);
    state.index = 0;
    state.page = 1;
    state.revealed = false;
    state.completed = false;
    if (screen === 'home' || screen === 'dictionary') {
      state.category = 'all';
      state.subcategory = 'all';
      expandedCategory = null;
    }
    buildDeck();
    $('main').focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (screen === 'dictionary') $('search-input').focus({ preventScroll: true });
  }
  function startReview() {
    stopPlayback();
    const priority = shuffle(words().filter((w) => [1, 2].includes(levelOf(w.id)))),
      unseen = shuffle(words().filter((w) => levelOf(w.id) === 0));
    reviewSession = {
      ids: [...priority, ...unseen].slice(0, 20).map((w) => w.id),
      rated: new Set(),
    };
    state.screen = 'review';
    state.category = 'all';
    state.subcategory = 'all';
    state.query = '';
    state.searchOpen = false;
    state.index = 0;
    state.page = 1;
    state.revealed = false;
    state.completed = false;
    expandedCategory = null;
    buildDeck(false);
    $('main').focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
  function chooseCategory(id, sub = 'all') {
    reviewSession = null;
    if (['home', 'review'].includes(state.screen)) state.screen = 'study';
    state.category = id;
    state.subcategory = sub;
    expandedCategory = id === 'all' ? null : id;
    buildDeck();
  }
  function renderNavigation() {
    const available = categories.filter((c) => words().some((w) => w.category === c.id));
    for (const target of ['category-nav', 'mobile-category-nav']) {
      const top = $(target).scrollTop;
      $(target).innerHTML =
        `<button class="nav-item all-words" data-category="all" aria-pressed="${state.screen !== 'home' && state.category === 'all'}">${icons.book}<span>${state.studyKind === 'grammar' ? '全部語法' : '全部詞彙'}</span><span class="nav-count">${words().length}</span></button>` +
        available
          .map((c) => {
            const selected = state.screen !== 'home' && state.category === c.id,
              expanded = expandedCategory === c.id,
              id = `${target}-children-${c.id}`;
            const subs = c.subcategories.filter((s) => words().some((w) => w.subcategory === s.id));
            if (grammarGroupingEnabled())
              return `<div class="nav-group"><button class="nav-item chapter-button" data-category="${esc(c.id)}" aria-pressed="${selected}"><span class="chapter-num">${esc(/^\d+$/.test(c.id) ? c.id.padStart(2, '0') : c.id)}</span><span class="chapter-name">${esc(categoryLabel(c.name))}</span><span class="nav-count">${words().filter((w) => w.category === c.id).length}</span></button></div>`;
            return `<div class="nav-group"><button class="nav-item chapter-button" data-category="${c.id}" aria-pressed="${selected}" aria-expanded="${expanded}" aria-controls="${id}"><span class="chapter-num">${/^\d+$/.test(c.id) ? c.id.padStart(2, '0') : c.id}</span><span class="chapter-name">${esc(categoryLabel(c.name))}</span><span class="nav-count">${words().filter((w) => w.category === c.id).length}</span><span class="nav-chevron">${icons.chevron}</span></button><div class="nav-children" id="${id}" role="group" aria-label="${esc(categoryLabel(c.name))}的子類" ${expanded ? '' : 'hidden'}><button class="nav-child" data-parent="${c.id}" data-sub="all" aria-pressed="${selected && state.subcategory === 'all'}">全部子類</button>${subs.map((s) => `<button class="nav-child" data-parent="${c.id}" data-sub="${s.id}" aria-pressed="${selected && state.subcategory === s.id}"><span class="sub-code">${s.id}</span><span>${esc(categoryLabel(s.name))}</span></button>`).join('')}</div></div>`;
          })
          .join('');
      $(target).scrollTop = top;
    }
  }
  function renderVisibility() {
    const counts = [0, 0, 0, 0];
    matched.forEach((w) => counts[levelOf(w.id)]++);
    $('visibility-options').innerHTML = [3, 2, 1, 0]
      .map(
        (l) =>
          `<label class="visibility-option" for="hide-level-${l}"><input id="hide-level-${l}" type="checkbox" data-hide-level="${l}" ${hiddenLevels().includes(l) ? 'checked' : ''}><span class="legend-status ${['neutral', 'red', 'orange', 'green'][l]}" aria-hidden="true"></span><span>${labels[l]}</span><span class="visibility-count">${counts[l]}</span></label>`,
      )
      .join('');
    $('hidden-count-badge').hidden = !hiddenLevels().length;
    $('hidden-count-badge').textContent = hiddenLevels().length;
    $('visibility-button').setAttribute(
      'aria-label',
      hiddenLevels().length ? `依熟悉程度隱藏，已選 ${hiddenLevels().length} 種` : '依熟悉程度隱藏',
    );
  }
  function renderHeader() {
    state.studyKind = dictionaryKind(dictionaryOf(state.dictionary));
    const grammar = state.studyKind === 'grammar';
    const unit = grammar ? '項' : '詞';
    $('entry-detail-kind').textContent = grammar ? '語法詳情' : '詞彙詳情';
    $('search-input').placeholder = grammar ? '搜尋語法、接續或例句' : '搜尋詞彙、釋義或例句';
    MotsSelect.setOptions(
      'page-size',
      pageSizes.map((value) => ({ value: String(value), label: `${value} ${unit}` })),
    );
    MotsSelect.setOptions('mode-switcher', [
      { value: 'dictionary', label: grammar ? '語法總覽' : '詞彙總覽' },
      { value: 'study', label: grammar && !grammarGroupingEnabled() ? '語法背誦' : '主題背誦' },
      { value: 'review', label: '隨機複習' },
    ]);
    const lang = languageOf(state.language),
      category = categoryOf(state.category),
      sub = state.subcategory === 'all' ? null : subcategoryOf(state.subcategory);
    $('language-title').textContent = dictionaryOf(state.dictionary).title;
    $('book-switcher').lang = state.language;
    $('book-switcher').title = dictionaryOf(state.dictionary).title;
    $('language-title').lang = state.language;
    $('brand-language').textContent = lang.label;
    $('brand-language').lang = state.language;
    document.body.classList.toggle('sidebar-collapsed', settings.sidebarCollapsed);
    $('sidebar-toggle').setAttribute('aria-expanded', String(!settings.sidebarCollapsed));
    const sidebarLabel = settings.sidebarCollapsed ? '展開左側目錄' : '收合左側目錄';
    $('sidebar-toggle').setAttribute('aria-label', sidebarLabel);
    $('sidebar-toggle').title = sidebarLabel;
    $('sidebar-toggle')
      .querySelector('path')
      .setAttribute(
        'd',
        settings.sidebarCollapsed ? 'M9 4v16m3-11 3 3-3 3' : 'M9 4v16m6-11-3 3 3 3',
      );
    $('category-title').textContent =
      state.screen === 'review'
        ? '隨機複習'
        : sub
          ? `${sub.id} · ${categoryLabel(sub.name)}`
          : category
            ? categoryLabel(category.name)
            : grammar
              ? '全部語法'
              : '全部詞彙';
    $('category-count').textContent =
      `${state.screen === 'review' ? deck.length : groupWords().length} ${unit}`;
    const books = dictionaryList().map((book) => ({
      value: book.id,
      label: book.title,
      lang: book.language,
    }));
    for (const control of ['book-switcher', 'dictionary-switcher']) {
      MotsSelect.setOptions(control, books);
      MotsSelect.setValue(control, state.dictionary);
    }
    const homeURL = new URL(location.href);
    homeURL.search = '';
    homeURL.hash = '';
    homeURL.searchParams.set('screen', 'home');
    homeURL.searchParams.set('dict', state.dictionary);
    $('home-link').href = homeURL.href;
    $('mobile-home-link').href = homeURL.href;
    for (const route of ['home', 'dictionary', 'review'])
      document.body.classList.toggle(`${route}-mode`, state.screen === route);
    $('home-section').hidden = state.screen !== 'home';
    $('library-panel').hidden = state.screen === 'home';
    $('study-panel').hidden = state.screen === 'home';
    $('study-toolbar').hidden = state.screen === 'review';
    $('review-session-bar').hidden = state.screen !== 'review';
    $('review-session-label').textContent = state.completed
      ? '本輪複習摘要'
      : `隨機複習 · ${deck.length ? state.index + 1 : 0} / ${deck.length}`;
    $('visibility-menu').hidden = state.screen !== 'study';
    $('search-toggle').hidden = state.screen === 'review';
    $('category-picker').hidden = state.screen === 'review';
    document.querySelector('.segmented').hidden = state.screen === 'dictionary';
    document.querySelector('.order-controls').hidden = state.screen === 'dictionary';
    MotsSelect.setValue('mode-switcher', state.screen === 'home' ? 'study' : state.screen);
    $('category-picker-label').textContent = sub
      ? `${categoryLabel(category.name)} / ${categoryLabel(sub.name)}`
      : category
        ? categoryLabel(category.name)
        : grammar
          ? '全部語法'
          : '全部詞彙';
    $('search-panel').hidden = !state.searchOpen;
    $('search-input').value = state.query;
    $('clear-search').hidden = !state.query;
    $('search-toggle').setAttribute('aria-expanded', state.searchOpen);
    $('search-toggle').classList.toggle('has-query', Boolean(state.query));
    $('search-toggle').setAttribute(
      'aria-label',
      state.screen === 'dictionary'
        ? '搜尋辭典'
        : state.searchOpen
          ? '收合搜尋'
          : state.query
            ? `展開搜尋：${state.query}`
            : '展開搜尋',
    );
    $('card-view').setAttribute('aria-pressed', state.view === 'card');
    $('list-view').setAttribute('aria-pressed', state.view === 'list');
    $('order-button').innerHTML =
      `${icons[state.order === 'random' ? 'random' : 'ordered']}<span>${state.order === 'random' ? '亂序' : '正序'}</span>`;
    $('order-button').setAttribute(
      'aria-label',
      state.order === 'random' ? '切換為正序' : '切換為亂序',
    );
    $('reshuffle-button').hidden = state.order !== 'random';
    document.title = `${state.studyKind === 'grammar' ? '語法背誦' : '詞彙背誦'} · ${{ home: '首頁', dictionary: '總覽', study: grammar && !grammarGroupingEnabled() ? '語法背誦' : '主題背誦', review: '隨機複習' }[state.screen]} · ${dictionaryOf(state.dictionary).title} · Mots`;
    renderVisibility();
    updateSaveState();
  }
  function applySyncedRecords(records, reason) {
    const known = new Set(dictionaryIDs()),
      changed = new Set();
    let saved = true;
    for (const id of known) {
      // Keep compatibility keys, but never let their stale whole-map writes replace metadata.
      const values = { ...cleanProgress(read(progressKey(id), {})), ...(progress[id] || {}) };
      for (const record of records)
        if (record.dictionaryID === id) {
          if ((progress[id]?.[record.wordID] ?? 0) !== record.level) changed.add(id);
          values[record.wordID] = record.level;
        }
      progress[id] = values;
      saved = write(progressKey(id), values) && saved;
    }
    if (syncReady && reason !== 'local' && changed.has(state.dictionary)) {
      const selectedID = deck[state.index]?.id,
        oldIndex = state.index;
      const revealed = state.revealed,
        completed = state.completed;
      buildDeck(false);
      const selected = deck.findIndex((word) => word.id === selectedID);
      state.index = selected >= 0 ? selected : Math.min(oldIndex, Math.max(0, deck.length - 1));
      state.revealed = selected >= 0 && revealed;
      state.completed = completed;
      if (state.view === 'list' && state.screen !== 'review')
        state.page = Math.floor(state.index / settings.pageSize) + 1;
      render();
    }
    return saved;
  }
  function exportTarget() {
    if (exportScopeValue.startsWith('c:'))
      return { category: exportScopeValue.slice(2), sub: 'all' };
    if (exportScopeValue.startsWith('s:')) {
      const sub = exportScopeValue.slice(2);
      return {
        category: categories.find((c) => c.subcategories.some((s) => s.id === sub))?.id || 'all',
        sub,
      };
    }
    return { category: 'all', sub: 'all' };
  }
  function exportSettingsModel() {
    const options = [{ value: 'all', label: '整部辭典' }];
    for (const c of categories) {
      if (!words().some((w) => w.category === c.id)) continue;
      options.push({ value: `c:${c.id}`, label: `${c.id} · ${categoryLabel(c.name)}` });
      for (const sub of c.subcategories)
        if (words().some((w) => w.subcategory === sub.id))
          options.push({ value: `s:${sub.id}`, label: `${sub.id} · ${categoryLabel(sub.name)}` });
    }
    if (!options.some((o) => o.value === exportScopeValue)) exportScopeValue = 'all';
    const target = exportTarget(),
      count = vocabularyForExport(target.category, target.sub).length;
    return {
      options,
      scope: exportScopeValue,
      count,
      scopeName: exportScopeName(target.category, target.sub),
    };
  }
  function familiarityCounts() {
    const counts = [0, 0, 0, 0];
    words().forEach((w) => counts[levelOf(w.id)]++);
    return counts;
  }
  function selectionAnchor() {
    const list =
      state.screen === 'dictionary' || (state.screen === 'study' && state.view === 'list');
    const oldIndex = list
      ? Math.min((state.page - 1) * settings.pageSize, Math.max(0, deck.length - 1))
      : state.index;
    return {
      selectedID: deck[oldIndex]?.id,
      oldIndex,
      revealed: state.revealed,
      completed: state.completed,
    };
  }
  function refreshMembership(anchor = selectionAnchor()) {
    if (reviewSession) {
      // Deletion removes only its captured member. Restoring never adds a new member.
      reviewSession.ids = reviewSession.ids.filter(
        (id) => !deletionState.isDeleted(state.dictionary, id),
      );
      const remaining = new Set(reviewSession.ids);
      reviewSession.rated = new Set([...reviewSession.rated].filter((id) => remaining.has(id)));
      if (!remaining.size) state.completed = false;
    }
    buildDeck(false);
    const selected = deck.findIndex((word) => word.id === anchor.selectedID);
    state.index =
      selected >= 0 ? selected : Math.min(anchor.oldIndex, Math.max(0, deck.length - 1));
    state.revealed = selected >= 0 && anchor.revealed;
    state.completed = selected >= 0 && anchor.completed;
    if (state.screen !== 'review') state.page = Math.floor(state.index / settings.pageSize) + 1;
    syncURL();
    render();
  }
  function applyDeletionRecords(records, reason) {
    const keys = new Set(
      records
        .filter((record) => record.deleted)
        .map((record) => JSON.stringify([record.dictionaryID, record.wordID])),
    );
    if (deletionUndo && !keys.has(JSON.stringify([deletionUndo.dictionaryID, deletionUndo.wordID])))
      dismissDeletionNotice();
    const changed = [...new Set([...keys, ...deletionKeys])].some((key) => {
      const [dictionaryID] = JSON.parse(key);
      return dictionaryID === state.dictionary && keys.has(key) !== deletionKeys.has(key);
    });
    deletionKeys = keys;
    if (syncReady && changed && reason !== 'local') refreshMembership();
    else if (syncReady) settingsPanel.renderDeleted();
    return true;
  }
  function changeDeletion(dictionaryID, wordID, deleted) {
    const word = sourceWords(dictionaryID).find((entry) => entry.id === wordID);
    if (!word) return;
    const oldIndex = deck.findIndex((entry) => entry.id === wordID);
    const anchor =
      deleted && dictionaryID === state.dictionary
        ? { selectedID: wordID, oldIndex: Math.max(0, oldIndex), revealed: false, completed: false }
        : selectionAnchor();
    const saved = progressSync.editDeletions([{ dictionaryID, wordID, deleted }]);
    if (dictionaryID === state.dictionary) refreshMembership(anchor);
    const outcome = deletionState.isDeleted(dictionaryID, wordID) === deleted;
    if (!outcome) {
      toast('操作未完成，本機資料已保留。請釋放儲存空間後重試。');
      return;
    }
    if (deleted) {
      deletionUndo = { dictionaryID, wordID };
      $('deletion-notice-text').textContent =
        `已刪除「${word.term}」${saved ? '' : '；尚未儲存，請備份後重試'}`;
      $('deletion-notice').hidden = false;
      const next = deck[state.index];
      if (next) focusStudyControl(document.querySelector(`[data-delete="${CSS.escape(next.id)}"]`));
      else $('undo-deletion').focus({ preventScroll: true });
    } else {
      deletionUndo = null;
      $('deletion-notice').hidden = true;
      const message = `已恢復「${word.term}」${saved ? '' : '；尚未儲存，請備份後重試'}`;
      toast(message);
      if ($('settings-dialog').open) {
        settingsPanel.notice('deleted-word-message', message);
        const next = document.querySelector('#deleted-word-list [data-restore]');
        (next || $('settings-library').querySelector('summary'))?.focus({ preventScroll: true });
      }
    }
  }
  function dismissDeletionNotice() {
    deletionUndo = null;
    $('deletion-notice').hidden = true;
  }
  function render({ preserveCardPosition = false } = {}) {
    state.studyKind = dictionaryKind(dictionaryOf(state.dictionary));
    if ($('entry-detail-dialog').open) $('entry-detail-dialog').close();
    renderNavigation();
    renderHeader();
    settingsPanel.render();
    if (state.screen === 'home') {
      const counts = familiarityCounts();
      $('home-section').innerHTML = MotsWorkspace.home({
        studyKind: state.studyKind,
        grammarMode: grammarGroupingEnabled() ? 'thematic' : 'standard',
        title: dictionaryOf(state.dictionary).title,
        languageLabel: languageOf(state.language).label,
        total: words().length,
        mastered: counts[3],
        learning: counts[2],
        unfamiliar: counts[1],
        unseen: counts[0],
        reviewable: counts[0] + counts[1] + counts[2],
        dictionaries: dictionaryList().map((d) => ({
          kind: dictionaryKind(d),
          id: d.id,
          title: d.title,
          languageLabel: languageOf(d.language).label,
          total: sourceWords(d.id).filter((word) => !deletionState?.isDeleted(d.id, word.id))
            .length,
          active: d.id === state.dictionary,
        })),
      });
      $('study-content').innerHTML = '';
      updateAudioButtons();
      return;
    }
    if (state.screen === 'review' && state.completed) {
      const counts = [0, 0, 0, 0];
      reviewSession.ids.forEach((id) => counts[levelOf(id)]++);
      $('study-content').innerHTML = MotsWorkspace.reviewSummary({
        studyKind: state.studyKind,
        total: reviewSession.ids.length,
        rated: reviewSession.rated.size,
        mastered: counts[3],
        learning: counts[2],
        unfamiliar: counts[1],
      });
      updateAudioButtons();
      return;
    }
    const hidden = matched.length - deck.length;
    const deletedScope =
      !groupWords().length &&
      sourceWords().some(
        (word) =>
          (state.category === 'all' || word.category === state.category) &&
          (state.subcategory === 'all' || word.subcategory === state.subcategory) &&
          deletionState?.isDeleted(state.dictionary, word.id),
      );
    const item = state.studyKind === 'grammar' ? '語法' : '單字';
    const content = deck.length
      ? state.screen === 'dictionary' || (state.screen === 'study' && state.view === 'list')
        ? studyView.list()
        : studyView.card()
      : grammarGroupingEnabled() && !sourceWords().length
        ? '<div class="empty-state"><h3>這本主題語法書尚未加入內容</h3><p>主題語法與普通語法分開保存。匯入主題語法資料後，會建立有自己分類與學習進度的語法書。</p><button class="button button-tonal" data-action="import-dictionary">匯入主題語法書</button></div>'
        : deletedScope
          ? `<div class="empty-state"><h3>這裡的${item}已刪除</h3><p>可在設定中恢復，原有熟悉程度會保留。</p><button class="button button-tonal" data-action="restore-deleted">恢復已刪除內容</button></div>`
          : state.screen === 'review'
            ? '<div class="empty-state"><h3>目前沒有待複習的生詞</h3><p>可開始新一輪，或到辭典查閱詞條。</p><button class="button button-tonal" data-action="open-dictionary">查閱辭典</button></div>'
            : `<div class="empty-state"><h3>${hidden ? `符合條件的${item}已隱藏` : `沒有符合條件的${item}`}</h3><p>${hidden ? `有 ${hidden} 個${item}被熟悉程度設定隱藏。` : '試試其他分類或關鍵字。'}</p>${hidden ? '<button class="button button-tonal" id="reveal-hidden">顯示所有熟悉程度</button>' : '<button class="button button-tonal" id="reset-filters">清除搜尋與隱藏設定</button>'}</div>`;
    let updated = false;
    if (preserveCardPosition) {
      const template = document.createElement('template');
      template.innerHTML = content;
      const selectors = [
        '.flashcard-top',
        '.word-face',
        '#answer-area',
        '.rating-section',
        '.card-navigation',
      ];
      const replacements = selectors.map((selector) => [
        $('study-content').querySelector(selector),
        template.content?.querySelector(selector),
      ]);
      if (replacements.every(([current, next]) => current && next)) {
        // Keep the range and its ancestors connected so continuous dragging and
        // native keyboard focus survive updates to the selected card.
        for (const [current, next] of replacements) current.replaceWith(next);
        $('study-content').querySelector('.session-end')?.remove();
        $('card-position').value = String(state.index + 1);
        $('card-position').setAttribute(
          'aria-valuetext',
          `第 ${state.index + 1} ${state.studyKind === 'grammar' ? '項' : '詞'}，共 ${deck.length} ${state.studyKind === 'grammar' ? '項' : '詞'}`,
        );
        $('card-position-value').textContent = `${state.index + 1} / ${deck.length}`;
        updated = true;
      }
    }
    if (!updated) $('study-content').innerHTML = content;
    updateAudioButtons();
  }
  const {
    stop: stopPlayback,
    speak,
    refreshButtons: updateAudioButtons,
  } = MotsAudio.create({
    player: $('pronunciation-player'),
    status: $('audio-status'),
    getContext: () => ({
      language: state.language,
      languageName: languageOf(state.language).name,
      voiceLocale: languageOf(state.language).voiceLocale,
      audioMode: settings.audioMode,
      meaningLanguage: settings.meaningLanguage,
    }),
    getWord: (id) => words().find((word) => word.id === id),
    getSource: (id) =>
      state.dictionary === 'fr'
        ? window.MOTS_AUDIO?.words?.[id]
        : ['de', 'ja'].includes(state.dictionary)
          ? window.MOTS_EXTRA_AUDIO?.[state.dictionary]?.words?.[id]
          : undefined,
    getButtons: () => document.querySelectorAll('[data-speak]'),
    onNotice: toast,
  });
  const studyView = MotsWorkspace.createStudyView({
    getModel: () => ({ state, settings, deck, grammarGrouping: grammarGroupingEnabled() }),
    isGrammarGroupOpen: (id) =>
      Boolean(state.query) || grammarDisclosures.get(grammarGroupKey(id)) === true,
    icons,
    labels,
    languageOf,
    meaning,
    levelOf,
    subcategoryOf,
    categoryLabel,
    groupWords,
  });
  const settingsPanel = window.MotsSettingsPanel.create({
    getPreferences: () => ({
      studyLanguage: state.language,
      meaningLanguage: settings.meaningLanguage,
      audioMode: settings.audioMode,
      pageSize: settings.pageSize,
      defaultHideMastered: settings.defaultHideMastered,
      studyKind: state.studyKind,
      grammarGrouping: grammarGroupingEnabled(),
      canExtend: categories.length > 0,
      dictionaryTitle: dictionaryOf(state.dictionary).title,
      wordCount: words().length,
      customCount: (customBanks[state.dictionary] || []).filter(
        (word) => !deletionState?.isDeleted(state.dictionary, word.id),
      ).length,
      studyLanguageName: languageOf(state.language).name,
      meaningLanguageName: meaningOf(settings.meaningLanguage).label,
      frenchSourceCount: banks.fr.length,
      sourcedCount: banks.fr.filter((word) => word.bookPage).length,
    }),
    getExport: exportSettingsModel,
    getDeleted: () => ({
      entries: sourceWords().filter((word) => deletionState?.isDeleted(state.dictionary, word.id)),
      language: state.language,
      meaningLanguage: settings.meaningLanguage,
    }),
    getMeaning: (word) => meaning(word).text,
    getSync: () => progressSync,
    beforeOpen: () => {
      dismissDeletionNotice();
      stopPlayback();
      $('visibility-menu').open = false;
      exportScopeValue =
        state.subcategory !== 'all'
          ? `s:${state.subcategory}`
          : state.category !== 'all'
            ? `c:${state.category}`
            : 'all';
    },
    onRestore: (wordID) => changeDeletion(state.dictionary, wordID, false),
    onSyncStatus: (snapshot) => {
      if (snapshot.persistenceError) storageFailures.add(MotsProgressSync.META_KEY);
      else storageFailures.delete(MotsProgressSync.META_KEY);
      if (deletionState?.failed()) storageFailures.add(MotsDeletions.KEY);
      else storageFailures.delete(MotsDeletions.KEY);
      updateSaveState();
    },
  });
  function focusStudyControl(control) {
    const group = control?.closest('details[data-grammar-group]');
    const target = group && !group.open ? group.querySelector('summary') : control;
    (target || $('main')).focus({ preventScroll: true });
  }
  function focusRating(id, level) {
    focusStudyControl(
      document.querySelector(`[data-word="${CSS.escape(id)}"][data-rate="${level}"]`),
    );
  }
  function rate(id, level, variant = 'card') {
    dismissDeletionNotice();
    const next = variant === 'dot' && levelOf(id) === level ? 0 : level;
    const position = deck.findIndex((w) => w.id === id),
      oldPage = state.page;
    progress[state.dictionary][id] = next;
    const saved = progressSync
      ? progressSync.edit(state.dictionary, id, next)
      : write(progressKey(state.dictionary), progress[state.dictionary]);
    if (state.screen === 'review') {
      stopPlayback();
      reviewSession.rated.add(id);
      state.revealed = false;
      if (state.index === deck.length - 1) state.completed = true;
      else state.index++;
      render();
      ($('reveal-button') || $('main')).focus({ preventScroll: true });
      toast(`已標記為「${labels[next]}」${saved ? '' : '；尚未儲存，請下載備份'}`);
      return;
    }
    const leaves = state.screen !== 'dictionary' && hiddenLevels().includes(next);
    if (leaves) {
      state.revealed = false;
      buildDeck(false);
      const nextWord = deck[Math.min(Math.max(position, 0), deck.length - 1)];
      if (state.view === 'list' && nextWord && state.page === oldPage)
        focusRating(nextWord.id, level);
      else $('visibility-button').focus({ preventScroll: true });
    } else {
      render();
      focusRating(id, level);
    }
    toast(
      `${next ? '已標記為「' + labels[next] + '」' : '已取消標記'}${leaves ? '，已依設定隱藏' : ''}${saved ? '' : '；尚未儲存，請下載備份'}`,
    );
  }
  function navigateWord(direction) {
    dismissDeletionNotice();
    stopPlayback();
    if (direction > 0 && state.index === deck.length - 1) {
      state.completed = true;
      render();
      $('restart-session')?.focus({ preventScroll: true });
      return;
    }
    setCardPosition(state.index + direction);
    $(direction > 0 ? 'next-word' : 'previous-word')?.focus({ preventScroll: true });
  }
  function setCardPosition(index, preserveCardPosition = false) {
    dismissDeletionNotice();
    stopPlayback();
    state.index = Math.max(0, Math.min(deck.length - 1, index));
    state.page = Math.floor(state.index / settings.pageSize) + 1;
    state.revealed = false;
    state.completed = false;
    syncURL();
    render({ preserveCardPosition });
  }
  function clearHidden() {
    settings.visibility[state.dictionary] = [];
    saveSettings();
    buildDeck();
    $('visibility-button').focus({ preventScroll: true });
  }
  function applyDictionary(id) {
    if (!dictionaryIDs().includes(id)) return;
    stopPlayback();
    const reviewing = state.screen === 'review';
    state.dictionary = id;
    state.studyKind = dictionaryKind(dictionaryOf(id));
    state.language = dictionaryOf(id).language;
    categories = dictionaryOf(id).categories;
    settings.visibility[id] ??= [];
    progress[id] ??= cleanProgress(read(progressKey(id), {}));
    applyDefaultVisibility(id);
    state.category = 'all';
    state.subcategory = 'all';
    state.query = '';
    state.searchOpen = state.screen === 'dictionary';
    state.index = 0;
    state.page = 1;
    state.revealed = false;
    state.completed = false;
    randomOrder = [];
    expandedCategory = null;
    reviewSession = null;
    exportScopeValue = 'all';
    saveSettings();
    if (reviewing) startReview();
    else buildDeck();
  }
  function applyLanguage(lang) {
    if (state.language === lang) return;
    const target = dictionaryList().find(
      (d) =>
        d.language === lang &&
        dictionaryKind(d) === state.studyKind &&
        isThematicGrammar(d) === grammarGroupingEnabled(),
    );
    if (target) applyDictionary(target.id);
  }
  function closeCategories() {
    $('category-dialog').close();
    (state.screen === 'home' || state.screen === 'review'
      ? $('mobile-menu-button')
      : $('category-picker')
    ).focus({ preventScroll: true });
  }
  for (const navID of ['category-nav', 'mobile-category-nav'])
    $(navID).addEventListener('click', (event) => {
      const parent = event.target.closest('[data-category]'),
        child = event.target.closest('[data-sub]');
      if (parent) {
        const id = parent.dataset.category;
        if (id === 'all' || grammarGroupingEnabled()) {
          chooseCategory(id);
          if (navID === 'mobile-category-nav') closeCategories();
        } else if (state.category === id) {
          expandedCategory = expandedCategory === id ? null : id;
          renderNavigation();
        } else chooseCategory(id);
        if (navID === 'category-nav' || $('category-dialog').open) {
          const current = document.querySelector(`#${navID} [data-category="${id}"]`);
          current?.focus({ preventScroll: true });
          current?.scrollIntoView({ block: 'nearest' });
        }
      }
      if (child) {
        chooseCategory(child.dataset.parent, child.dataset.sub);
        if (navID === 'mobile-category-nav') closeCategories();
        else
          document
            .querySelector(
              `#${navID} [data-parent="${state.category}"][data-sub="${state.subcategory}"]`,
            )
            ?.focus({ preventScroll: true });
      }
    });
  for (const id of ['mobile-menu-button', 'category-picker'])
    $(id).addEventListener('click', () => {
      stopPlayback();
      $('visibility-menu').open = false;
      if (!expandedCategory && state.category !== 'all') expandedCategory = state.category;
      renderNavigation();
      $('category-dialog').showModal();
    });
  $('close-categories').addEventListener('click', closeCategories);
  for (const id of ['home-link', 'mobile-home-link'])
    $(id).addEventListener('click', (event) => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      showScreen('home');
    });
  $('main').addEventListener('click', (event) => {
    const dictionary = event.target.closest('[data-dictionary]');
    if (dictionary) {
      applyDictionary(dictionary.dataset.dictionary);
      return;
    }
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'open-dictionary') showScreen('dictionary');
    if (action === 'open-study') showScreen('study');
    if (action === 'start-review') startReview();
    if (action === 'import-dictionary') settingsPanel.open('settings-library');
    if (action === 'restore-deleted') {
      settingsPanel.resetDeletedPage();
      settingsPanel.open('settings-library');
      $('deleted-word-list').scrollIntoView({ block: 'nearest' });
    }
    if (event.target.closest('#home-clear-search')) {
      const input = $('home-search');
      input.value = '';
      $('home-clear-search').hidden = true;
      input.focus();
    }
  });
  $('home-section').addEventListener('input', (event) => {
    if (event.target.id === 'home-search') $('home-clear-search').hidden = !event.target.value;
  });
  $('home-section').addEventListener('compositionstart', () => {
    homeComposing = true;
  });
  $('home-section').addEventListener('compositionend', () => {
    homeComposing = false;
  });
  $('home-section').addEventListener('submit', (event) => {
    if (event.target.id !== 'home-search-form') return;
    event.preventDefault();
    if (homeComposing) return;
    showScreen('dictionary', $('home-search').value.trim());
  });
  $('sidebar-toggle').addEventListener('click', () => {
    settings.sidebarCollapsed = !settings.sidebarCollapsed;
    saveSettings();
    renderHeader();
  });
  for (const id of ['category-dialog', 'settings-dialog'])
    $(id).addEventListener('click', (event) => {
      if (event.target !== $(id)) return;
      const r = event.target.getBoundingClientRect();
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      )
        $(id).close();
    });
  matchMedia('(min-width:761px)').addEventListener('change', (event) => {
    if (event.matches && $('category-dialog').open) {
      $('category-dialog').close();
      (settings.sidebarCollapsed
        ? $('sidebar-toggle')
        : document.querySelector(`#category-nav [data-category="${state.category}"]`)
      )?.focus({ preventScroll: true });
    }
  });
  MotsSelect.setOptions(
    'study-language',
    languages.map((l) => ({ value: l.code, label: `${l.label} · ${l.name}` })),
  );
  MotsSelect.setOptions(
    'meaning-language',
    meaningLanguages.map((l) => ({ value: l.code, label: l.label })),
  );
  MotsSelect.setOptions('audio-mode', [
    { value: 'auto', label: '內建音訊優先' },
    { value: 'device', label: '裝置語音' },
    { value: 'google', label: 'Google 翻譯（另開視窗）' },
  ]);
  MotsSelect.setOptions(
    'page-size',
    pageSizes.map((value) => ({ value: String(value), label: `${value} 詞` })),
  );
  $('mode-switcher').addEventListener('change', (event) => {
    const mode = event.target.value;
    if (mode === state.screen) return;
    if (mode === 'review') startReview();
    else if (['dictionary', 'study'].includes(mode)) showScreen(mode);
  });
  $('study-language').addEventListener('change', (event) => applyLanguage(event.target.value));
  for (const control of ['book-switcher', 'dictionary-switcher'])
    $(control).addEventListener('change', (event) => applyDictionary(event.target.value));
  $('meaning-language').addEventListener('change', (event) => {
    settings.meaningLanguage = event.target.value;
    saveSettings();
    buildDeck();
  });
  $('audio-mode').addEventListener('change', (event) => {
    stopPlayback();
    settings.audioMode = event.target.value;
    saveSettings();
  });
  $('page-size').addEventListener('change', (event) => {
    const value = Number(event.target.value);
    if (!pageSizes.includes(value)) return;
    const first = (state.page - 1) * settings.pageSize;
    settings.pageSize = value;
    state.page = Math.floor(first / value) + 1;
    saveSettings();
    buildDeck(false);
  });
  $('study-content').addEventListener(
    'toggle',
    (event) => {
      const group = event.target;
      if (!group.matches('[data-grammar-group]') || !group.isConnected || state.query) return;
      grammarDisclosures.set(grammarGroupKey(group.dataset.grammarGroup), group.open);
    },
    true,
  );
  $('default-hide-mastered').addEventListener('change', (event) => {
    settings.defaultHideMastered = event.target.checked;
    for (const id of dictionaryIDs())
      settings.visibility[id] = settings.defaultHideMastered
        ? [...new Set([...(settings.visibility[id] || []), 3])]
        : (settings.visibility[id] || []).filter((level) => level !== 3);
    saveSettings();
    buildDeck();
  });
  $('visibility-options').addEventListener('change', (event) => {
    if (!event.target.matches('[data-hide-level]')) return;
    const level = Number(event.target.dataset.hideLevel);
    settings.visibility[state.dictionary] = event.target.checked
      ? [...new Set([...hiddenLevels(), level])]
      : hiddenLevels().filter((l) => l !== level);
    saveSettings();
    buildDeck();
    $(`hide-level-${level}`).focus({ preventScroll: true });
  });
  $('show-all-levels').addEventListener('click', clearHidden);
  $('export-unit').addEventListener('change', (event) => {
    exportScopeValue = event.target.value;
    settingsPanel.renderExport();
    $('export-message').textContent = '';
  });
  $('export-vocabulary').addEventListener('click', () => {
    const target = exportTarget();
    exportVocabulary(target.category, target.sub);
  });
  $('search-toggle').addEventListener('click', () => {
    state.searchOpen = state.screen === 'dictionary' || !state.searchOpen;
    renderHeader();
    if (state.searchOpen) $('search-input').focus();
  });
  $('search-input').addEventListener('compositionstart', () => {
    composing = true;
  });
  $('search-input').addEventListener('compositionend', (event) => {
    composing = false;
    state.query = event.target.value;
    buildDeck();
  });
  $('search-input').addEventListener('input', (event) => {
    if (!composing && !event.isComposing) {
      state.query = event.target.value;
      buildDeck();
    }
  });
  $('clear-search').addEventListener('click', () => {
    state.query = '';
    buildDeck();
    $('search-input').focus();
  });
  document.addEventListener('click', (event) => {
    if (!event.composedPath().includes($('visibility-menu'))) $('visibility-menu').open = false;
  });
  for (const view of ['card', 'list'])
    $(`${view}-view`).addEventListener('click', () => {
      if (state.view === view) return;
      stopPlayback();
      if (state.screen === 'study' && state.view === 'card' && view === 'list') {
        studyCardAnchor = { id: deck[state.index]?.id, index: state.index };
        state.page = Math.floor(state.index / settings.pageSize) + 1;
      }
      if (state.screen === 'study' && state.view === 'list' && view === 'card') {
        const start = Math.min((state.page - 1) * settings.pageSize, Math.max(0, deck.length - 1));
        if (studyCardAnchor) {
          const previous = deck.findIndex((word) => word.id === studyCardAnchor.id);
          state.index =
            previous >= 0
              ? previous
              : Math.min(studyCardAnchor.index, Math.max(0, deck.length - 1));
        } else {
          let next = deck.findIndex((word, index) => index >= start && levelOf(word.id) === 0);
          if (next < 0) next = deck.findIndex((word) => levelOf(word.id) === 0);
          state.index = next < 0 ? start : next;
        }
        state.page = Math.floor(state.index / settings.pageSize) + 1;
        state.revealed = false;
      }
      state.view = view;
      state.completed = false;
      saveSettings();
      syncURL();
      render();
    });
  $('order-button').addEventListener('click', () => {
    state.order = state.order === 'random' ? 'ordered' : 'random';
    saveSettings();
    buildDeck(true, true);
  });
  $('reshuffle-button').addEventListener('click', () => {
    buildDeck(true, true);
    toast('已重新打亂順序');
  });
  $('study-content').addEventListener('input', (event) => {
    if (
      event.target.id !== 'card-position' ||
      event.isComposing ||
      !deck.length ||
      !(
        (state.screen === 'study' && state.view === 'card') ||
        (state.screen === 'review' && !state.completed)
      )
    )
      return;
    const position = Number(event.target.value);
    if (!Number.isInteger(position)) return;
    setCardPosition(position - 1, true);
  });
  let detailOpener = null;
  function openEntryDetail(id, opener = null) {
    const word = words().find((entry) => entry.id === id);
    if (!word) return;
    stopPlayback();
    detailOpener = opener;
    $('entry-detail-content').innerHTML = studyView.detail(word);
    $('entry-detail-dialog').showModal();
    $('close-entry-detail').focus();
  }
  $('close-entry-detail').addEventListener('click', () => $('entry-detail-dialog').close());
  $('entry-detail-dialog').addEventListener('close', () => {
    stopPlayback();
    if (detailOpener?.isConnected) detailOpener.focus({ preventScroll: true });
    detailOpener = null;
  });
  $('entry-detail-content').addEventListener('click', (event) => {
    const sound = event.target.closest('[data-speak]');
    if (sound) speak(sound.dataset.speak);
  });
  $('study-content').addEventListener('click', (event) => {
    const detail = event.target.closest('[data-detail]');
    if (detail) {
      openEntryDetail(detail.dataset.detail, detail);
      return;
    }
    const deletion = event.target.closest('[data-delete]');
    if (deletion) {
      changeDeletion(state.dictionary, deletion.dataset.delete, true);
      return;
    }
    const sound = event.target.closest('[data-speak]');
    if (sound) {
      dismissDeletionNotice();
      speak(sound.dataset.speak);
      return;
    }
    const rating = event.target.closest('[data-rate]');
    if (rating) {
      rate(
        rating.dataset.word,
        Number(rating.dataset.rate),
        rating.dataset.ratingVariant || 'card',
      );
      return;
    }
    const button = event.target.closest('button');
    if (!button) return;
    if (button.id === 'reveal-button') {
      stopPlayback();
      state.revealed = !state.revealed;
      render();
      $('reveal-button').focus({ preventScroll: true });
    }
    if (button.id === 'previous-word') navigateWord(-1);
    if (button.id === 'next-word') navigateWord(1);
    if (button.id === 'restart-session') {
      state.index = 0;
      state.completed = false;
      state.revealed = false;
      render();
      $('reveal-button').focus({ preventScroll: true });
    }
    if (['previous-page', 'next-page'].includes(button.id)) {
      stopPlayback();
      state.page += button.id === 'next-page' ? 1 : -1;
      syncURL();
      render();
      $(button.id)?.focus({ preventScroll: true });
    }
    if (button.id === 'reveal-hidden') clearHidden();
    if (button.id === 'reset-filters') {
      state.query = '';
      if (state.screen !== 'dictionary') settings.visibility[state.dictionary] = [];
      saveSettings();
      buildDeck();
      (state.screen === 'dictionary' ? $('search-input') : $('search-toggle')).focus({
        preventScroll: true,
      });
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.isComposing || composing || $('entry-detail-dialog').open) return;
    if (event.key === 'Escape' && !$('settings-dialog').open && !$('category-dialog').open) {
      if ($('visibility-menu').open) {
        event.preventDefault();
        $('visibility-menu').open = false;
        $('visibility-button').focus();
        return;
      }
      if (state.searchOpen && state.screen !== 'dictionary') {
        event.preventDefault();
        state.searchOpen = false;
        renderHeader();
        $('search-toggle').focus();
        return;
      }
    }
    const focused = document.activeElement;
    if (
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      $('settings-dialog').open ||
      $('category-dialog').open ||
      focused.closest('nav,details,select') ||
      /INPUT|SELECT|TEXTAREA/.test(focused.tagName) ||
      focused.isContentEditable ||
      !(state.screen === 'review' || (state.screen === 'study' && state.view === 'card')) ||
      !deck.length ||
      (state.completed && state.screen === 'review')
    )
      return;
    if (event.key === ' ' && !/BUTTON|A|SUMMARY/.test(focused.tagName)) {
      event.preventDefault();
      stopPlayback();
      state.revealed = !state.revealed;
      render();
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      navigateWord(1);
      document.activeElement.blur();
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      navigateWord(-1);
      document.activeElement.blur();
    }
    if (['1', '2', '3'].includes(event.key)) rate(deck[state.index].id, Number(event.key));
  });
  function vocabularyCSV(records) {
    const rows = [
      ['單字', '釋義', '例句', '熟悉程度', '一級單元', '二級單元', '背誦語言', '釋義語言'],
    ];
    for (const word of records)
      rows.push([
        word.term,
        meaning(word).text,
        word.example,
        labels[levelOf(word.id)],
        exportScopeName(word.category),
        exportScopeName(word.category, word.subcategory),
        languageOf(state.language).label,
        meaningOf(settings.meaningLanguage).label,
      ]);
    return MotsDownloads.csv(rows);
  }
  function exportNotice(message) {
    toast(message);
    settingsPanel.notice('export-message', message);
  }
  function exportVocabulary(category, subcategory = 'all') {
    const records = vocabularyForExport(category, subcategory);
    if (!records.length) {
      exportNotice('此單元沒有尚未掌握的生詞。');
      return;
    }
    const scope = exportScopeName(category, subcategory)
      .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-')
      .slice(0, 100);
    try {
      const title = dictionaryOf(state.dictionary)
        .title.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-')
        .slice(0, 60);
      downloadFile(
        `Mots-${state.language}-${title}-${scope}-生詞.csv`,
        vocabularyCSV(records),
        'text/csv;charset=utf-8',
      );
      exportNotice(`已準備匯出 ${records.length} 個生詞（未掌握），請查看下載。`);
    } catch {
      exportNotice('無法匯出生詞，請再試一次。');
    }
  }
  function validateEntries(
    entries,
    lang,
    preserveIDs = false,
    categoryList = window.CATEGORIES,
    prefix = lang,
  ) {
    return MotsEntries.validate(entries, {
      language: lang,
      meaningLanguage: settings.meaningLanguage,
      meaningCodes,
      categories: categoryList,
      preserveIDs,
      prefix,
    });
  }
  $('download-template').addEventListener('click', () => {
    const example = words()[0];
    if (!example) return;
    const m = meaning(example);
    download(`mots-${state.language}-vocabulary-template.json`, {
      app: 'mots-vocabulary',
      version: 1,
      language: state.language,
      words: [
        {
          id: 'my-word-1',
          category: example.category,
          subcategory: example.subcategory,
          term: example.term,
          meanings: { [settings.meaningLanguage]: m.missing ? '請填入釋義' : m.text },
          example: example.example || '',
          examples: example.examples || [],
          pattern: example.pattern || '',
          explanation: example.explanation || '',
        },
      ],
    });
    settingsPanel.notice('vocabulary-message', '詞庫範本已準備下載；填寫後可擴充目前辭典。');
  });
  $('download-dictionary-template').addEventListener('click', () => {
    const entry = words()[0],
      m = entry ? meaning(entry) : { text: '請填入釋義', missing: true };
    const thematic = grammarGroupingEnabled();
    download(`mots-${state.language}-dictionary-template.json`, {
      app: 'mots-dictionary',
      version: 1,
      title: thematic
        ? '我的主題語法書'
        : state.studyKind === 'grammar'
          ? '我的語法筆記'
          : '我的詞彙本',
      kind: state.studyKind,
      grammarMode: thematic ? 'thematic' : 'standard',
      language: state.language,
      ...(thematic
        ? {
            categories: [
              {
                id: 't1',
                name: '主題名稱',
                subcategories: [{ id: 't1.01', name: '語法歸納名稱' }],
              },
            ],
          }
        : {}),
      words: [
        {
          id: 'word-1',
          ...(thematic ? { category: 't1', subcategory: 't1.01' } : {}),
          term: entry?.term || (state.studyKind === 'grammar' ? '請填入語法句型' : '請填入單字'),
          meanings: { [settings.meaningLanguage]: m.missing ? '請填入釋義' : m.text },
          example: entry?.example || '',
          examples: entry?.examples || [],
          pattern: entry?.pattern || '',
          explanation: entry?.explanation || '',
        },
      ],
    });
    settingsPanel.notice('dictionary-message', '辭典範本已準備下載；填寫名稱、語言和詞條後匯入。');
  });
  $('import-dictionary').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const fallbackLanguage = state.language;
    const fallbackKind = state.studyKind;
    const fallbackGrammarMode = grammarGroupingEnabled() ? 'thematic' : 'standard';
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error('請選擇 2 MB 以內的 JSON 辭典。');
      const data = JSON.parse(await file.text()),
        id = MotsDictionaries.createID();
      const dictionary = MotsDictionaries.validateImport(data, {
        id,
        title: file.name.replace(/\.json$/i, ''),
        language: fallbackLanguage,
        kind: fallbackKind,
        grammarMode: fallbackGrammarMode,
        meaningLanguage: settings.meaningLanguage,
      });
      if (dictionaryLibrary.length >= 20) throw new Error('最多可匯入 20 部辭典。');
      dictionaryLibrary = [...dictionaryLibrary, dictionary];
      settings.visibility[id] = [];
      progress[id] = {};
      refreshBanks();
      const saved = write(dictionariesKey, dictionaryLibrary);
      write(progressKey(id), progress[id]);
      progressSync?.refresh();
      applyDictionary(id);
      settingsPanel.notice(
        'dictionary-message',
        `已建立「${dictionary.title}」，共 ${dictionary.words.length} 詞${saved ? '。' : '；目前僅暫存於此頁，請下載備份。'}`,
      );
    } catch (error) {
      settingsPanel.notice(
        'dictionary-message',
        error instanceof SyntaxError ? '無法讀取 JSON，請參照下載的辭典範本。' : error.message,
      );
    }
    event.target.value = '';
  });
  $('import-vocabulary').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const id = state.dictionary,
      language = state.language,
      metadata = dictionaryOf(id);
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error('請選擇 2 MB 以內的 JSON 詞庫。');
      const data = JSON.parse(await file.text());
      if (isObject(data) && data.language && data.language !== language)
        throw new Error('檔案語言與目前辭典不同，請先切換辭典。');
      if (isObject(data) && data.kind !== undefined && data.kind !== dictionaryKind(metadata))
        throw new Error('檔案類型與目前書籍不同，請使用「匯入新辭典」建立獨立書籍。');
      if (
        isObject(data) &&
        data.grammarMode !== undefined &&
        data.grammarMode !== (isThematicGrammar(metadata) ? 'thematic' : 'standard')
      )
        throw new Error('普通語法與主題語法須分開匯入，請使用「匯入新辭典」。');
      const imported = validateEntries(
        Array.isArray(data) ? data : data.words,
        language,
        false,
        metadata.categories,
        id,
      );
      if (!imported.length) throw new Error('檔案中沒有單字。');
      let saved;
      if (builtinIDs().includes(id)) {
        const merged = new Map((customBanks[id] || []).map((w) => [w.id, w]));
        imported.forEach((w) => merged.set(w.id, w));
        if (merged.size > 5000) throw new Error('每部內建辭典最多可擴充 5,000 個自訂單字。');
        customBanks[id] = [...merged.values()];
        saved = write(banksKey, customBanks);
      } else {
        const merged = new Map(metadata.words.map((w) => [w.id, w]));
        imported.forEach((w) => merged.set(w.id, w));
        if (merged.size > 5000) throw new Error('每部匯入辭典最多 5,000 詞。');
        const candidate = MotsDictionaries.validateImport(
          { ...metadata, words: [...merged.values()] },
          { id },
        );
        dictionaryLibrary = dictionaryLibrary.map((d) => (d.id === id ? candidate : d));
        saved = write(dictionariesKey, dictionaryLibrary);
      }
      refreshBanks();
      categories = dictionaryOf(state.dictionary).categories;
      reviewSession = null;
      state.screen = 'study';
      randomOrder = [];
      state.category = 'all';
      state.subcategory = 'all';
      expandedCategory = null;
      state.query = '';
      state.searchOpen = false;
      buildDeck();
      settingsPanel.notice(
        'vocabulary-message',
        `已加入 ${imported.length} 詞至「${metadata.title}」${saved ? '。' : '；目前僅暫存於此頁，請下載備份。'}`,
      );
    } catch (error) {
      settingsPanel.notice(
        'vocabulary-message',
        error instanceof SyntaxError ? '無法讀取 JSON，請使用下載的詞庫範本。' : error.message,
      );
    }
    event.target.value = '';
  });
  $('export-progress').addEventListener('click', () => {
    download('mots-backup.json', {
      app: 'mots',
      version: 3,
      exportedAt: new Date().toISOString(),
      ratings: progress.fr,
      progress,
      settings,
      customBanks,
      dictionaries: dictionaryLibrary,
      deletions: deletionState.current(),
    });
    settingsPanel.notice(
      'backup-message',
      '備份已準備下載，包含匯入辭典、各辭典進度、刪除與恢復記錄、設定及擴充詞庫。',
    );
  });
  $('import-progress').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      if (file.size > 50 * 1024 * 1024) throw new Error('請選擇 50 MB 以內的備份。');
      const data = JSON.parse(await file.text());
      if (data.app !== 'mots' || ![1, 2, 3].includes(data.version))
        throw new Error('請選擇 Mots 下載的備份檔案。');
      const incomingDeletions =
        data.deletions === undefined ? null : deletionState.validateImport(data.deletions);
      let candidateLibrary = dictionaryLibrary;
      if (data.version === 3 && data.dictionaries !== undefined) {
        const imported = MotsDictionaries.validateLibrary(data.dictionaries),
          merged = new Map(dictionaryLibrary.map((d) => [d.id, d]));
        imported.forEach((d) => {
          const existing = merged.get(d.id);
          if (
            existing &&
            (dictionaryKind(existing) !== dictionaryKind(d) ||
              isThematicGrammar(existing) !== isThematicGrammar(d))
          )
            throw new Error('備份不可變更現有書籍類型，請使用「匯入新辭典」建立獨立書籍。');
          merged.set(d.id, d);
        });
        candidateLibrary = MotsDictionaries.validateLibrary([...merged.values()]);
      }
      const candidateBanks = { ...customBanks };
      if (data.version >= 2 && data.customBanks !== undefined) {
        if (!isObject(data.customBanks)) throw new Error('備份詞庫格式不正確。');
        for (const lang of builtinIDs())
          if (data.customBanks[lang] !== undefined) {
            const records = validateEntries(
                data.customBanks[lang],
                dictionaryOf(lang).language,
                true,
                dictionaryOf(lang).categories,
                lang,
              ),
              merged = new Map((candidateBanks[lang] || []).map((w) => [w.id, w]));
            records.forEach((w) => merged.set(w.id, w));
            if (merged.size > 5000) throw new Error('合併後的擴充詞庫超過每部 5,000 詞的上限。');
            candidateBanks[lang] = [...merged.values()];
          }
      }
      const incoming = data.version === 1 ? { fr: data.ratings } : data.progress;
      if (!isObject(incoming)) throw new Error('備份進度格式不正確。');
      const candidateProgress = {};
      const syncEdits = [];
      let count = 0;
      for (const id of [...builtinIDs(), ...candidateLibrary.map((d) => d.id)]) {
        const values = incoming[id] ?? {};
        if (!isObject(values)) throw new Error('備份進度格式不正確。');
        const records = builtinIDs().includes(id)
          ? [...banks[id], ...(candidateBanks[id] || [])]
          : candidateLibrary.find((d) => d.id === id).words;
        const known = new Set(records.map((w) => w.id));
        candidateProgress[id] = { ...(progress[id] || {}) };
        for (const [wordID, level] of Object.entries(values))
          if (known.has(wordID) && [0, 1, 2, 3].includes(level)) {
            candidateProgress[id][wordID] = level;
            syncEdits.push({ dictionaryID: id, wordID, level });
            count++;
          }
      }
      dictionaryLibrary = candidateLibrary;
      customBanks = candidateBanks;
      refreshBanks();
      randomOrder = [];
      reviewSession = null;
      write(dictionariesKey, dictionaryLibrary);
      write(banksKey, customBanks);
      for (const id of dictionaryIDs()) {
        progress[id] = candidateProgress[id];
        write(progressKey(id), progress[id]);
      }
      if (progressSync && syncEdits.length) progressSync.editMany(syncEdits);
      if (incomingDeletions?.length) progressSync.editDeletions(incomingDeletions, true);
      if (data.version >= 2 && data.settings) settings = sanitizeSettings(data.settings);
      else settings = sanitizeSettings(settings);
      for (const id of dictionaryIDs()) applyDefaultVisibility(id);
      state.dictionary = settings.dictionaryId;
      state.language = dictionaryOf(state.dictionary).language;
      state.studyKind = dictionaryKind(dictionaryOf(state.dictionary));
      categories = dictionaryOf(state.dictionary).categories;
      state.view = settings.view;
      state.order = settings.order;
      if (state.screen === 'review') state.screen = 'study';
      state.category = 'all';
      state.subcategory = 'all';
      state.query = '';
      state.searchOpen = state.screen === 'dictionary';
      expandedCategory = null;
      exportScopeValue = 'all';
      saveSettings();
      buildDeck();
      settingsPanel.notice(
        'backup-message',
        `已合併 ${count} 個單字的進度${storageFailures.size ? '；部分資料僅暫存，請下載備份。' : '。'}`,
      );
    } catch (error) {
      settingsPanel.notice(
        'backup-message',
        error instanceof SyntaxError
          ? '無法讀取備份，請選擇 Mots 下載的 JSON 檔案。'
          : error.message === 'invalid-deletions'
            ? '備份中的刪除記錄格式不正確，資料未變更。'
            : error.message === 'deletion-storage'
              ? '刪除記錄尚未安全儲存，或版本已達上限。請先下載備份。'
              : error.message,
      );
    }
    event.target.value = '';
  });
  window.addEventListener('storage', (event) => {
    try {
      if (progressSync?.handleStorage(event)) return;
      if (event.key === dictionariesKey) {
        dictionaryLibrary = MotsDictionaries.validateLibrary(JSON.parse(event.newValue || '[]'));
        refreshBanks();
        for (const id of dictionaryIDs()) {
          settings.visibility[id] ??= [];
          progress[id] ??= cleanProgress(read(progressKey(id), {}));
        }
        progressSync?.refresh();
        if (!dictionaryIDs().includes(state.dictionary)) state.dictionary = 'fr';
        state.language = dictionaryOf(state.dictionary).language;
        state.studyKind = dictionaryKind(dictionaryOf(state.dictionary));
        categories = dictionaryOf(state.dictionary).categories;
        reviewSession = null;
        if (state.screen === 'review') state.screen = 'study';
        state.category = 'all';
        state.subcategory = 'all';
        randomOrder = [];
        buildDeck();
        toast('已更新另一分頁的辭典');
      } else if (event.key === settingsKey) {
        const incoming = sanitizeSettings(JSON.parse(event.newValue || '{}')),
          changed = incoming.dictionaryId !== state.dictionary;
        settings = incoming;
        state.dictionary = settings.dictionaryId;
        state.language = dictionaryOf(state.dictionary).language;
        state.studyKind = dictionaryKind(dictionaryOf(state.dictionary));
        categories = dictionaryOf(state.dictionary).categories;
        state.view = settings.view;
        state.order = settings.order;
        if (
          changed ||
          !sourceWords().some(
            (word) =>
              (state.category === 'all' || word.category === state.category) &&
              (state.subcategory === 'all' || word.subcategory === state.subcategory),
          )
        ) {
          state.category = 'all';
          state.subcategory = 'all';
        }
        reviewSession = null;
        if (state.screen === 'review') state.screen = 'study';
        randomOrder = [];
        expandedCategory = state.category === 'all' ? null : state.category;
        buildDeck();
        toast('已更新另一分頁的設定');
      } else if (event.key === banksKey) {
        const value = JSON.parse(event.newValue || '{}');
        if (!isObject(value)) return;
        customBanks = value;
        refreshBanks();
        randomOrder = [];
        buildDeck();
        toast('已更新另一分頁的詞庫');
      } else
        for (const id of dictionaryIDs())
          if (event.key === progressKey(id)) {
            if (progressSync) {
              progressSync.refresh();
              return;
            }
            progress[id] = cleanProgress(JSON.parse(event.newValue || '{}'));
            if (id === state.dictionary) {
              buildDeck(false);
              toast('已更新另一分頁的進度');
            }
          }
    } catch {
      toast('另一分頁的資料無法讀取，請重新開啟此頁。');
    }
  });
  $('undo-deletion').addEventListener('click', () => {
    if (deletionUndo) changeDeletion(deletionUndo.dictionaryID, deletionUndo.wordID, false);
  });
  $('dismiss-deletion').addEventListener('click', dismissDeletionNotice);
  deletionState = MotsDeletions.create({ onApply: applyDeletionRecords });
  progressSync = MotsProgressSync.create({
    deletions: deletionState,
    getLegacy: () => progress,
    onApply: applySyncedRecords,
    onStatus: settingsPanel.renderSync,
  });
  for (const event of ['online', 'focus'])
    window.addEventListener(event, () => progressSync.wake());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'hidden') progressSync.wake();
  });
  if (
    state.category === 'all' ||
    !categoryOf(state.category)?.subcategories.some((s) => s.id === state.subcategory)
  )
    state.subcategory = 'all';
  if (
    !sourceWords().some(
      (word) =>
        (state.category === 'all' || word.category === state.category) &&
        (state.subcategory === 'all' || word.subcategory === state.subcategory),
    )
  ) {
    state.category = 'all';
    state.subcategory = 'all';
    expandedCategory = null;
  }
  if (state.screen === 'review') startReview();
  else buildDeck(false);
  syncReady = true;
})();
