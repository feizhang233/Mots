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
    MotsMemory,
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
    memory: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="9" width="18" height="12" rx="2"/><path d="M5 6h14M7 3h10"/></svg>',
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
    dictionariesKey = 'mots.dictionaries.v1',
    memoryKey = 'mots.memory.v1',
    memoryWorkspaceKey = 'mots.memory.workspace.v1';
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
  let memoryRecords = MotsMemory.sanitize(read(memoryKey, {}));
  function latestMemoryRecords(disk = read(memoryKey, {})) {
    return MotsMemory.merge(memoryRecords, MotsMemory.sanitize(disk));
  }
  let memoryWorkspace = MotsMemory.sanitizeWorkspace(read(memoryWorkspaceKey, {}));
  const memorySelection = {}, memorySessions = {};
  const memoryBookBaselines = new Map();
  let lastMemoryDestination, memoryDestinationPending = false;
  const hydrateMemorySession = (session) => session ? { ...session, ids: [...session.ids], answered: new Set(session.answered) } : null;
  for (const [id, book] of Object.entries(memoryWorkspace.books)) {
    if (book.chapters !== null) memorySelection[id] = [...book.chapters];
    if (book.session) memorySessions[id] = hydrateMemorySession(book.session);
    memoryBookBaselines.set(id, JSON.stringify(book));
  }
  let memorySession = null;
  let memoryTimer;
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
  const builtinDictionaries = [
    ...MotsDictionaries.builtins(),
    ...window.MotsGrammar.builtins(),
  ].map((book) => ({
    ...book,
    title: builtinBookTitles[book.id] || book.title,
  }));
  const builtinIDs = new Set(builtinDictionaries.map((d) => d.id));
  const dictionaryList = () => [...builtinDictionaries, ...dictionaryLibrary];
  const dictionaryKind = (dictionary) =>
    dictionary?.kind === 'grammar' ? 'grammar' : 'vocabulary';
  const isThematicGrammar = (dictionary) =>
    dictionaryKind(dictionary) === 'grammar' && dictionary.grammarMode === 'thematic';
  const dictionaryOf = (id) => dictionaryList().find((d) => d.id === id) || builtinDictionaries[0];
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
      showExampleTranslations: source.showExampleTranslations !== false,
      hideListMeanings: source.hideListMeanings === true,
      appearance: ['light', 'dark'].includes(source.appearance) ? source.appearance : 'system',
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
      details = MotsDictionaries.normalizeDetails(word, 0, language);
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
    for (const dictionary of builtinDictionaries) {
      const lang = dictionary.id;
      if (dictionary.kind === 'grammar')
        banks[lang] = dictionary.words.map((w) => normalizeWord(w, dictionary.language));
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
      : memoryWorkspace.active && dictionaryIDs().includes(memoryWorkspace.dictionaryID)
        ? memoryWorkspace.dictionaryID
        : settings.dictionaryId;
  categories = dictionaryOf(initialDictionary).categories;
  const categoryValid = (id) => id === 'all' || categories.some((c) => c.id === id);
  if (pageSizes.includes(Number(url.searchParams.get('size'))))
    settings.pageSize = Number(url.searchParams.get('size'));
  const requestedPage = Number(url.searchParams.get('page'));
  const requestedScreen = url.searchParams.get('screen');
  const screen = ['home', 'study', 'dictionary', 'review', 'memory'].includes(requestedScreen)
    ? requestedScreen
    : url.searchParams.has('category')
      ? 'study'
      : memoryWorkspace.active ? 'memory' : 'home';
  const state = {
    dictionary: initialDictionary,
    studyKind: dictionaryKind(dictionaryOf(initialDictionary)),
    language: dictionaryOf(initialDictionary).language,
    screen: screen === 'memory' && dictionaryKind(dictionaryOf(initialDictionary)) === 'grammar' ? 'study' : screen,
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
    listRevealedID: null,
    completed: false,
    searchOpen: screen === 'dictionary' || Boolean(url.searchParams.get('q')),
  };
  if (state.screen === 'memory') {
    memorySession = memorySessions[state.dictionary] || null;
    state.revealed = memorySession?.revealed === true && !memorySession.paused;
  }
  lastMemoryDestination = JSON.stringify({ active: state.screen === 'memory', dictionaryID: state.dictionary });
  memoryDestinationPending = ['screen', 'category', 'dict', 'lang'].some((key) => url.searchParams.has(key));
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
    if (state.screen === 'memory') {
      const expectedID = memorySession?.ids.find((id) => !memorySession.answered.has(id));
      const eligible = new Map(MotsMemory.candidates(words(), levelOf,
        memoryRecords[state.dictionary] || {}, categories.map((c) => c.id), Date.now()).map((w) => [w.id, w]));
      if (memorySession) {
        // A restored round can lose stale members, but never captures newly due words.
        memorySession.ids = memorySession.ids.filter((id) => memorySession.answered.has(id) || eligible.has(id));
      }
      deck = memorySession ? memorySession.ids.filter((id) => !memorySession.answered.has(id)).map((id) => eligible.get(id)).filter(Boolean) : [];
      matched = [...deck];
      state.index = 0;
      if (deck[0]?.id !== expectedID) {
        state.revealed = false;
        if (memorySession) memorySession.revealed = false;
      }
    } else if (state.screen === 'review' && reviewSession) {
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
    else if (!['review', 'memory'].includes(state.screen) && state.order === 'random') {
      if (reshuffle || !randomOrder.length) randomOrder = shuffle(sourceWords().map((w) => w.id));
      const rank = new Map(randomOrder.map((id, index) => [id, index]));
      deck.sort((a, b) => rank.get(a.id) - rank.get(b.id));
    }
    if (reset && !['review', 'memory'].includes(state.screen)) {
      state.listRevealedID = null;
      studyCardAnchor = null;
      state.index = 0;
      state.page = 1;
      state.revealed = false;
      state.completed = false;
    }
    state.index = Math.min(state.index, Math.max(0, deck.length - 1));
    state.page = Math.min(state.page, Math.max(1, Math.ceil(deck.length / settings.pageSize)));
    syncURL();
    render({ preserveStudyScroll: !reset });
  }
  function showScreen(screen, query = '') {
    stashMemorySession();
    if (screen === 'memory' && state.screen !== 'memory') restoreLatestMemoryBook(state.dictionary);
    memoryDestinationPending = true;
    stopPlayback();
    homeComposing = false;
    composing = false;
    reviewSession = null;
    memorySession = screen === 'memory' ? memorySessions[state.dictionary] || null : null;
    state.screen = screen;
    state.query = query;
    state.searchOpen = screen === 'dictionary' || Boolean(query);
    state.index = 0;
    state.page = 1;
    state.revealed = memorySession?.revealed === true && !memorySession.paused;
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
    stashMemorySession();
    memoryDestinationPending = true;
    stopPlayback();
    memorySession = null;
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
    stashMemorySession();
    memoryDestinationPending = true;
    reviewSession = null;
    memorySession = null;
    if (['home', 'review', 'memory'].includes(state.screen)) state.screen = 'study';
    state.category = id;
    state.subcategory = sub;
    expandedCategory = id === 'all' ? null : id;
    buildDeck();
  }
  function stashMemorySession() {
    if (state.screen === 'memory' && memorySession) {
      if (!memorySession.paused) memorySession.revealed = state.revealed;
      memorySessions[state.dictionary] = memorySession;
    }
  }
  function memoryBookSnapshot(dictionaryID) {
    const session = memorySessions[dictionaryID];
    return MotsMemory.sanitizeWorkspace({ version: 1, books: { [dictionaryID]: {
      chapters: memorySelection[dictionaryID] ?? null,
      session: session ? { ids: session.ids, answered: [...session.answered], remembered: session.remembered,
        mastered: session.mastered, revealed: session.revealed === true, paused: session.paused === true } : null,
    } } }).books[dictionaryID];
  }
  function memoryBookBaseline(dictionaryID) {
    return memoryBookBaselines.get(dictionaryID) ?? JSON.stringify({ chapters: null, session: null });
  }
  function restoreLatestMemoryBook(dictionaryID) {
    // A failed write retains this tab's live work until it can be saved again.
    if (storageFailures.has(memoryWorkspaceKey) ||
        JSON.stringify(memoryBookSnapshot(dictionaryID)) !== memoryBookBaseline(dictionaryID)) return;
    const latest = MotsMemory.sanitizeWorkspace(read(memoryWorkspaceKey, {}));
    if (storageFailures.has(memoryWorkspaceKey)) return;
    const book = latest.books[dictionaryID] || { chapters: null, session: null };
    if (book.chapters === null) delete memorySelection[dictionaryID];
    else memorySelection[dictionaryID] = [...book.chapters];
    if (book.session) memorySessions[dictionaryID] = hydrateMemorySession(book.session);
    else delete memorySessions[dictionaryID];
    memoryBookBaselines.set(dictionaryID, JSON.stringify(book));
  }
  function persistMemoryWorkspace() {
    stashMemorySession();
    const latest = MotsMemory.sanitizeWorkspace(read(memoryWorkspaceKey, {}));
    const books = { ...latest.books };
    const active = state.screen === 'memory';
    const destination = JSON.stringify({ active, dictionaryID: state.dictionary });
    const localBook = active && state.studyKind === 'vocabulary' ? memoryBookSnapshot(state.dictionary) : null;
    const changedBook = localBook && JSON.stringify(localBook) !== memoryBookBaseline(state.dictionary);
    // An unrelated render must not overwrite a newer round saved in another tab.
    if (changedBook) books[state.dictionary] = localBook;
    const saveDestination = changedBook || memoryDestinationPending || destination !== lastMemoryDestination;
    memoryWorkspace = MotsMemory.sanitizeWorkspace({ version: 1,
      active: saveDestination ? active : latest.active,
      dictionaryID: saveDestination ? state.dictionary : latest.dictionaryID, books });
    const didSave = () => {
      if (changedBook) memoryBookBaselines.set(state.dictionary, JSON.stringify(localBook));
      lastMemoryDestination = destination;
      memoryDestinationPending = false;
      const unsaved = [...new Set([...Object.keys(memorySessions), ...Object.keys(memorySelection)])]
        .some((id) => JSON.stringify(memoryBookSnapshot(id)) !== memoryBookBaseline(id));
      if (unsaved) storageFailures.add(memoryWorkspaceKey);
      else storageFailures.delete(memoryWorkspaceKey);
      updateSaveState();
      return !unsaved;
    };
    try {
      if (localStorage.getItem(memoryWorkspaceKey) === JSON.stringify(memoryWorkspace)) return didSave();
    } catch { /* The shared writer reports persistence failures and recovery. */ }
    return write(memoryWorkspaceKey, memoryWorkspace) ? didSave() : false;
  }
  function pauseMemory() {
    if (!memorySession) return;
    memorySession.revealed = state.revealed;
    memorySession.paused = true;
    state.revealed = false;
    buildDeck(false);
  }
  function resumeMemory() {
    if (!memorySession) return;
    memorySession.paused = false;
    state.revealed = memorySession.revealed === true;
    buildDeck(false);
    $('reveal-button')?.focus({ preventScroll: true });
  }
  function selectedMemoryCategories() {
    const available = categories.filter((c) => words().some((w) => w.category === c.id)).map((c) => c.id);
    memorySelection[state.dictionary] ??= [];
    return memorySelection[state.dictionary].filter((id) => available.includes(id));
  }
  function memorySummary(now = Date.now()) {
    return MotsMemory.summary(words(), levelOf, memoryRecords[state.dictionary] || {}, selectedMemoryCategories(), now);
  }
  function memoryTime(value) {
    return new Intl.DateTimeFormat('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
  }
  function showMemory() {
    if (state.studyKind !== 'vocabulary') return;
    state.category = 'all';
    state.subcategory = 'all';
    expandedCategory = null;
    showScreen('memory');
  }
  function startMemory() {
    if (state.studyKind !== 'vocabulary') return;
    stopPlayback();
    const candidates = MotsMemory.candidates(words(), levelOf, memoryRecords[state.dictionary] || {}, selectedMemoryCategories(), Date.now());
    if (!candidates.length) {
      memorySession = null;
      delete memorySessions[state.dictionary];
      buildDeck(false);
      return;
    }
    state.screen = 'memory';
    state.revealed = false;
    memorySession = { ids: shuffle(candidates).map((w) => w.id), answered: new Set(), remembered: 0, mastered: 0, revealed: false, paused: false };
    memorySessions[state.dictionary] = memorySession;
    buildDeck(false);
    $('reveal-button')?.focus({ preventScroll: true });
  }
  function answerMemory(id, remembered) {
    if (state.screen !== 'memory' || !memorySession || memorySession.paused || deck[0]?.id !== id || memorySession.answered.has(id)) return;
    const word = words().find((w) => w.id === id);
    if (!word || levelOf(id) !== 2 || (remembered && meaning(word).missing)) {
      state.revealed = false;
      buildDeck(false);
      return;
    }
    memoryRecords = latestMemoryRecords();
    const result = MotsMemory.review(memoryRecords[state.dictionary]?.[id], remembered, Date.now());
    if (!result.accepted) {
      state.revealed = false;
      buildDeck(false);
      return;
    }
    stopPlayback();
    memoryRecords[state.dictionary] ??= Object.create(null);
    memoryRecords[state.dictionary][id] = result.record;
    let saved = write(memoryKey, memoryRecords);
    progressSync?.memoryChanged();
    memorySession.answered.add(id);
    if (remembered) memorySession.remembered++;
    if (result.mastered) {
      memorySession.mastered++;
      progress[state.dictionary][id] = 3;
      saved = (progressSync ? progressSync.edit(state.dictionary, id, 3) : write(progressKey(state.dictionary), progress[state.dictionary])) && saved;
    }
    state.revealed = false;
    saved = buildDeckAndSaveMemory() && saved;
    ($('reveal-button') || $('memory-start') || $('main')).focus({ preventScroll: true });
    toast(`${result.mastered ? '已完成全部複習，轉為「已掌握」' : remembered ? `已記住，下次複習：${memoryTime(result.record.dueAt)}` : '已安排 1 天後重新練習'}${saved ? '' : '；尚未儲存，請下載備份'}`);
  }
  function buildDeckAndSaveMemory() {
    buildDeck(false);
    return !storageFailures.has(memoryWorkspaceKey);
  }
  function renderMemory() {
    clearTimeout(memoryTimer);
    const summary = memorySummary(), selected = selectedMemoryCategories();
    const running = Boolean(memorySession && !memorySession.paused && deck.length);
    const done = Boolean(memorySession && !deck.length);
    const resumable = Boolean(memorySession?.paused && deck.length);
    const available = categories.filter((c) => words().some((w) => w.category === c.id));
    const chapterControls = `<fieldset class="memory-chapters"><legend>選擇章節（可多選）</legend><div class="memory-chapter-actions"><button class="text-button" type="button" data-memory-select="all">全選</button><button class="text-button" type="button" data-memory-select="none">清除選擇</button></div><div class="memory-chapter-list">${available.map((c) => {
      const count = words().filter((w) => w.category === c.id && levelOf(w.id) === 2).length;
      return `<label class="memory-chapter"><input type="checkbox" data-memory-category="${esc(c.id)}" ${selected.includes(c.id) ? 'checked' : ''}><span>${esc(c.id)} · ${esc(categoryLabel(c.name))}</span><span class="nav-count">${count}</span></label>`;
    }).join('')}</div></fieldset>`;
    const next = summary.nextDueAt ? `下次複習：${memoryTime(summary.nextDueAt)}` : '';
    const empty = !selected.length ? '請至少選擇一個章節。' : !summary.eligible ? '所選章節還沒有「有印象」的單字。請先在詞彙列表將要背誦的單字標為「有印象」。' : !summary.due ? `目前沒有到期的卡片。${next}` : '';
    const status = `<p class="memory-scope-status" role="status">已選 ${selected.length} 個章節 · 待複習 ${summary.due} 詞 · 等待下次複習 ${summary.waiting} 詞${next && summary.due ? ` · ${next}` : ''}</p>`;
    const header = `<div class="memory-heading"><div><h2 id="memory-title">卡片記憶</h2><p>把「有印象」的單字，透過間隔複習逐步變成「已掌握」。</p></div>${running ? '<button class="button button-outline" type="button" data-memory-config>返回章節選擇</button>' : ''}</div>`;
    let content;
    if (running) {
      const record = memoryRecords[state.dictionary]?.[deck[0].id];
      content = `<p class="memory-round-status" role="status">本輪已完成 ${memorySession.answered.size} / ${memorySession.ids.length} 詞</p>${studyView.card({ memory: { masteryStage: MotsMemory.masteryStage, stage: record?.stage === MotsMemory.masteryStage ? 0 : record?.stage || 0, position: memorySession.answered.size + 1, total: memorySession.ids.length } })}`;
    } else {
      const completion = done ? `<div class="memory-completion" role="status"><h3>本輪卡片記憶已完成</h3><p>已背誦 ${memorySession.answered.size} 詞 · 記住 ${memorySession.remembered} 詞 · 新增已掌握 ${memorySession.mastered} 詞</p></div>` : '';
      const resume = resumable ? `<div class="memory-completion"><p>上次停在第 ${memorySession.answered.size + 1} / ${memorySession.ids.length} 詞，保留原有詞彙與順序。</p><button id="memory-resume" class="button button-primary" type="button">繼續上次</button></div>` : '';
      content = `${completion}${resume}${chapterControls}${status}${empty ? `<p class="memory-empty">${esc(empty)}</p>` : ''}<button id="memory-start" class="button ${resumable ? 'button-outline' : 'button-primary'}" type="button" ${summary.due ? '' : 'disabled'}>${memorySession ? '開始新一輪' : '開始背誦'}${summary.due ? ` · ${summary.due} 詞` : ''}</button><p class="memory-card-help">${memorySession ? '只有「開始新一輪」會重新選詞；' : ''}本輪包含所選章節全部已到期的單字，不限制詞數。逾期後仍只計下一次複習。</p>`;
    }
    $('memory-section').innerHTML = `${header}${content}<details class="memory-method"><summary>複習規則</summary><p>每輪單字以亂序呈現，繼續上次會保留原順序；開始新一輪時重新洗牌。先回想，可直接選擇是否記住，也可顯示答案確認。共 5 次成功回想：第一次立即背誦，之後分別間隔 1 天、2 天、4 天、7 天；通過第 5 次才轉為「已掌握」。沒想起會從頭開始，1 天後再練，中途維持「有印象」。逾期不跳次數，每次間隔從實際作答時計算。</p><p>依艾賓浩斯遺忘曲線的間隔複習概念設計，以上時間是本功能的預設安排。配對後，複習次數與下次複習時間會自動同步，並包含在備份中；章節選擇與本輪位置保存在目前裝置。</p></details>`;
    if (!running && summary.nextDueAt) memoryTimer = setTimeout(() => {
      if (state.screen === 'memory') buildDeck(false);
    }, Math.max(1000, Math.min(2_147_483_647, summary.nextDueAt - Date.now())));
  }

  function renderNavigation() {
    const available = categories.filter((c) => words().some((w) => w.category === c.id));
    for (const target of ['category-nav', 'mobile-category-nav']) {
      const top = $(target).scrollTop;
      $(target).innerHTML =
        `<button class="nav-item all-words" data-category="all" aria-pressed="${!['home', 'memory'].includes(state.screen) && state.category === 'all'}">${icons.book}<span>${state.studyKind === 'grammar' ? '全部語法' : '全部詞彙'}</span><span class="nav-count">${words().length}</span></button>` +
        (state.studyKind === 'vocabulary' ? `<button class="nav-item memory-nav" type="button" data-open-memory aria-pressed="${state.screen === 'memory'}">${icons.memory}<span>卡片記憶</span><span class="nav-count">${MotsMemory.summary(words(), levelOf, memoryRecords[state.dictionary] || {}, categories.map((c) => c.id), Date.now()).due}</span></button>` : '') +
        available
          .map((c) => {
            const selected = !['home', 'memory'].includes(state.screen) && state.category === c.id,
              expanded = expandedCategory === c.id,
              id = `${target}-children-${c.id}`;
            const subs = c.subcategories.filter((s) => words().some((w) => w.subcategory === s.id));
            if (grammarGroupingEnabled() || subs.length < 2)
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
    $('main').classList.toggle(
      'vocabulary-list-layout',
      !grammar &&
        (state.screen === 'dictionary' || (state.screen === 'study' && state.view === 'list')),
    );
    $('home-section').hidden = state.screen !== 'home';
    $('memory-section').hidden = state.screen !== 'memory';
    $('library-panel').hidden = ['home', 'memory'].includes(state.screen);
    $('study-panel').hidden = ['home', 'memory'].includes(state.screen);
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
    document.title = `${state.studyKind === 'grammar' ? '語法背誦' : '詞彙背誦'} · ${{ home: '首頁', dictionary: '總覽', study: grammar && !grammarGroupingEnabled() ? '語法背誦' : '主題背誦', review: '隨機複習', memory: '卡片記憶' }[state.screen]} · ${dictionaryOf(state.dictionary).title} · Mots`;
    renderVisibility();
    updateSaveState();
  }
  function applySyncedRecords(records, reason) {
    const projections = new Map(dictionaryIDs().map((id) => [
      id, { ...cleanProgress(read(progressKey(id), {})), ...progress[id] },
    ]));
    let activeChanged = false;
    for (const { dictionaryID, wordID, level } of records) {
      const values = projections.get(dictionaryID);
      if (!values) continue;
      if (dictionaryID === state.dictionary && (progress[dictionaryID]?.[wordID] ?? 0) !== level)
        activeChanged = true;
      values[wordID] = level;
    }
    // Compatibility keys are projections of the authoritative sync metadata.
    let saved = true;
    for (const [id, values] of projections) {
      progress[id] = values;
      saved = write(progressKey(id), values) && saved;
    }
    if (syncReady && reason !== 'local' && activeChanged) refreshMembership();
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
  function render({ preserveCardPosition = false, preserveStudyScroll = true } = {}) {
    const scroll = preserveStudyScroll
      ? {
          left: window.scrollX || 0,
          top: window.scrollY || 0,
          regions: ['.vocabulary-list-scroll', '#current-list-meaning'].flatMap((selector) => {
            const region = $('study-content').querySelector(selector);
            return region ? [{ selector, left: region.scrollLeft, top: region.scrollTop }] : [];
          }),
        }
      : null;
    clearTimeout(memoryTimer);
    window.MotsTheme?.apply(settings.appearance);
    state.studyKind = dictionaryKind(dictionaryOf(state.dictionary));
    if (state.screen === 'memory' && state.studyKind !== 'vocabulary') {
      state.screen = 'study';
      memorySession = null;
      syncURL();
    }
    if ($('entry-detail-dialog').open) $('entry-detail-dialog').close();
    renderNavigation();
    renderHeader();
    settingsPanel.render();
    if (state.screen === 'memory') {
      $('study-content').innerHTML = '';
      renderMemory();
      persistMemoryWorkspace();
      updateAudioButtons();
      return;
    }
    persistMemoryWorkspace();
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
        ? '<div class="empty-state"><h3>這本主題語法書尚未加入內容</h3><p>請到設定的「辭典匯入與生詞」加入主題語法資料，建立有自己分類與學習進度的語法書。</p></div>'
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
    if (scroll) {
      // Replacing the reading surface recreates its scroll containers. Restore
      // them before paint; focus restoration alone cannot retain their offsets.
      for (const { selector, left, top } of scroll.regions) {
        const region = $('study-content').querySelector(selector);
        if (region) {
          region.scrollLeft = left;
          region.scrollTop = top;
        }
      }
      if (window.scrollX !== scroll.left || window.scrollY !== scroll.top)
        window.scrollTo({ left: scroll.left, top: scroll.top, behavior: 'instant' });
    }
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
    traditional: tc,
    groupWords,
  });
  const settingsPanel = window.MotsSettingsPanel.create({
    getDictionaryTemplate: dictionaryTemplate,
    getPreferences: () => ({
      studyLanguage: state.language,
      meaningLanguage: settings.meaningLanguage,
      audioMode: settings.audioMode,
      pageSize: settings.pageSize,
      defaultHideMastered: settings.defaultHideMastered,
      showExampleTranslations: settings.showExampleTranslations,
      hideListMeanings: settings.hideListMeanings,
      appearance: settings.appearance,
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
    const previousLevel = levelOf(id);
    const next = variant === 'dot' && previousLevel === level ? 0 : level;
    const position = deck.findIndex((w) => w.id === id),
      oldPage = state.page;
    let scheduleSaved = true;
    if (next !== previousLevel) {
      memoryRecords = latestMemoryRecords();
      const previous = memoryRecords[state.dictionary]?.[id];
      if (previous) {
        const now = Math.min(253402300799999, Math.max(Date.now(), previous.updatedAt + 1));
        memoryRecords[state.dictionary][id] = { stage: 0, dueAt: now, updatedAt: now };
        scheduleSaved = write(memoryKey, memoryRecords);
        progressSync?.memoryChanged();
      }
    }
    progress[state.dictionary][id] = next;
    const saved = (progressSync
      ? progressSync.edit(state.dictionary, id, next)
      : write(progressKey(state.dictionary), progress[state.dictionary])) && scheduleSaved;
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
    stashMemorySession();
    if (state.screen === 'memory' && id !== state.dictionary) restoreLatestMemoryBook(id);
    memoryDestinationPending = true;
    stopPlayback();
    const reviewing = state.screen === 'review';
    memorySession = null;
    state.dictionary = id;
    state.studyKind = dictionaryKind(dictionaryOf(id));
    state.language = dictionaryOf(id).language;
    categories = dictionaryOf(id).categories;
    if (state.screen === 'memory' && state.studyKind !== 'vocabulary') state.screen = 'study';
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
    if (state.screen === 'memory') {
      memorySession = memorySessions[state.dictionary] || null;
      state.revealed = memorySession?.revealed === true && !memorySession.paused;
    }
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
    (['home', 'review', 'memory'].includes(state.screen)
      ? $('mobile-menu-button')
      : $('category-picker')
    ).focus({ preventScroll: true });
  }
  for (const navID of ['category-nav', 'mobile-category-nav'])
    $(navID).addEventListener('click', (event) => {
      if (event.target.closest('[data-open-memory]')) {
        showMemory();
        if (navID === 'mobile-category-nav') closeCategories();
        return;
      }
      const parent = event.target.closest('[data-category]'),
        child = event.target.closest('[data-sub]');
      if (parent) {
        const id = parent.dataset.category;
        if (id === 'all' || parent.getAttribute('aria-expanded') === null) {
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
  $('memory-section').addEventListener('change', (event) => {
    const id = event.target.dataset.memoryCategory;
    if (id === undefined) return;
    const selected = new Set(selectedMemoryCategories());
    if (event.target.checked) selected.add(id);
    else selected.delete(id);
    memorySelection[state.dictionary] = [...selected];
    buildDeck(false);
    document.querySelector(`[data-memory-category="${CSS.escape(id)}"]`)?.focus({ preventScroll: true });
  });
  $('memory-section').addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    if (button.id === 'memory-start') startMemory();
    else if (button.id === 'memory-resume') resumeMemory();
    else if (button.hasAttribute('data-memory-config')) {
      pauseMemory();
      ($('memory-resume') || $('memory-start'))?.focus({ preventScroll: true });
    } else if (button.dataset.memorySelect) {
      memorySelection[state.dictionary] = button.dataset.memorySelect === 'all' ? categories.map((c) => c.id) : [];
      buildDeck(false);
      document.querySelector(`[data-memory-select="${button.dataset.memorySelect}"]`)?.focus({ preventScroll: true });
    } else if (button.id === 'reveal-button') {
      stopPlayback();
      state.revealed = !state.revealed;
      render();
      $('reveal-button')?.focus({ preventScroll: true });
    } else if (button.dataset.memoryAnswer) answerMemory(button.dataset.memoryWord, button.dataset.memoryAnswer === 'remembered');
    else if (button.dataset.speak) speak(button.dataset.speak);
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
  $('appearance').addEventListener('change', (event) => {
    settings.appearance = ['light', 'dark'].includes(event.target.value)
      ? event.target.value
      : 'system';
    window.MotsTheme?.apply(settings.appearance);
    saveSettings();
  });
  $('hide-list-meanings').addEventListener('change', (event) => {
    settings.hideListMeanings = event.target.checked;
    state.listRevealedID = null;
    saveSettings();
    render();
  });
  $('page-size').addEventListener('change', (event) => {
    const value = Number(event.target.value);
    if (!pageSizes.includes(value)) return;
    const first = (state.page - 1) * settings.pageSize;
    settings.pageSize = value;
    state.listRevealedID = null;
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
  $('show-example-translations').addEventListener('change', (event) => {
    settings.showExampleTranslations = event.target.checked;
    saveSettings();
    render();
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
      state.listRevealedID = null;
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
      if (settings.hideListMeanings && state.screen === 'study' && state.view === 'list') {
        state.listRevealedID = sound.dataset.speak;
        render();
        const replacement = [...$('study-content').querySelectorAll('[data-speak]')].find(
          (button) =>
            button.dataset.speak === sound.dataset.speak &&
            Boolean(button.dataset.listWord) === Boolean(sound.dataset.listWord),
        );
        replacement?.focus({ preventScroll: true });
      }
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
      state.listRevealedID = null;
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
    if (event.defaultPrevented || event.isComposing || event.keyCode === 229 || composing || $('entry-detail-dialog').open) return;
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
    const memoryCard = state.screen === 'memory' && memorySession && !memorySession.paused;
    if (
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      $('settings-dialog').open ||
      $('category-dialog').open ||
      focused.closest('nav,details,select') ||
      /INPUT|SELECT|TEXTAREA/.test(focused.tagName) ||
      focused.isContentEditable ||
      !(memoryCard || state.screen === 'review' || (state.screen === 'study' && state.view === 'card')) ||
      !deck.length ||
      (state.completed && state.screen === 'review')
    )
      return;
    if (event.key === 'Enter' || event.key === ' ') {
      const control = focused.closest('button,a,summary,[role="button"]');
      if (control && !['reveal-button', 'next-word'].includes(control.id) && control.dataset.memoryAnswer !== 'remembered') return;
      event.preventDefault();
      if (event.repeat) return;
      if (event.key === ' ') {
        if (!state.revealed) {
          stopPlayback();
          state.revealed = true;
          render();
          $('reveal-button')?.focus({ preventScroll: true });
        }
      } else if (memoryCard) {
        if (!meaning(deck[0]).missing) answerMemory(deck[0].id, true);
      } else navigateWord(1);
      return;
    }
    if (memoryCard) return;
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
  function dictionaryTemplate() {
    const entry = words()[0],
      m = entry ? meaning(entry) : { text: '請填入釋義', missing: true };
    const thematic = grammarGroupingEnabled();
    return {
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
    };
  }
  $('download-dictionary-template').addEventListener('click', () => {
    download(`mots-${state.language}-dictionary-template.json`, dictionaryTemplate());
    settingsPanel.notice('dictionary-message', '辭典範本已準備下載；填寫名稱、語言和詞條後匯入。');
  });
  let dictionaryImportBusy = false;
  $('import-dictionary').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file || dictionaryImportBusy) return;
    const input = event.target;
    dictionaryImportBusy = true;
    input.disabled = true;
    input.setAttribute('aria-busy', 'true');
    input.setAttribute('aria-invalid', 'false');
    settingsPanel.notice('dictionary-message', '正在讀取並驗證辭典…');
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
      input.setAttribute('aria-invalid', 'true');
      settingsPanel.notice(
        'dictionary-message',
        error instanceof SyntaxError ? '無法讀取 JSON，請參照下載的辭典範本。' : error.message,
      );
    } finally {
      dictionaryImportBusy = false;
      input.disabled = false;
      input.removeAttribute('aria-busy');
      input.value = '';
    }
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
      if (builtinIDs.has(id)) {
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
      memory: memoryRecords,
    });
    settingsPanel.notice(
      'backup-message',
      '備份已準備下載，包含匯入辭典、各辭典進度、卡片記憶排程、刪除與恢復記錄、設定及擴充詞庫。',
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
      const incomingMemory = data.memory === undefined ? {} : MotsMemory.sanitize(data.memory, { strict: true });
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
        for (const lang of builtinIDs)
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
      for (const id of [...builtinIDs, ...candidateLibrary.map((d) => d.id)]) {
        const values = incoming[id] ?? {};
        if (!isObject(values)) throw new Error('備份進度格式不正確。');
        const records = builtinIDs.has(id)
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
      if (syncEdits.length) progressSync?.validateImport(syncEdits);
      memoryRecords = MotsMemory.merge(latestMemoryRecords(), incomingMemory);
      stashMemorySession();
      memorySession = null;
      write(memoryKey, memoryRecords);
      progressSync?.memoryChanged();
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
      let syncSaved = !syncEdits.length || progressSync?.editMany(syncEdits) !== false;
      if (incomingDeletions?.length)
        syncSaved = progressSync.editDeletions(incomingDeletions, true) && syncSaved;
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
      if (state.screen === 'memory') {
        memorySession = memorySessions[state.dictionary] || null;
        state.revealed = memorySession?.revealed === true && !memorySession.paused;
      }
      saveSettings();
      buildDeck();
      settingsPanel.notice(
        'backup-message',
        `已合併 ${count} 個單字的進度${storageFailures.size || !syncSaved ? '；部分資料僅暫存，請下載備份。' : '。'}`,
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
              : ['progress-limit', 'too-many-records', 'invalid-records'].includes(error.message)
                ? '進度記錄數量或版本已達上限，備份未匯入。'
                : error.message,
      );
    }
    event.target.value = '';
  });
  window.addEventListener('storage', (event) => {
    try {
      if (event.key === memoryKey) {
        const incomingMemory = MotsMemory.sanitize(JSON.parse(event.newValue || '{}'));
        const disk = MotsMemory.sanitize(read(memoryKey, {}));
        memoryRecords = MotsMemory.merge(MotsMemory.merge(memoryRecords, disk), incomingMemory);
        // Preserve different-word updates from concurrent tabs before a reload.
        // Compare records semantically so object insertion order cannot cause a write loop.
        const entries = (records) => Object.entries(records).flatMap(([dictionary, values]) =>
          Object.entries(values).map(([word, record]) => [dictionary, word, record.stage, record.dueAt, record.updatedAt]));
        const signature = (records) => JSON.stringify(entries(records).sort((a, b) =>
          (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0)));
        if (signature(memoryRecords) !== signature(disk)) write(memoryKey, memoryRecords);
        progressSync?.memoryChanged();
        if (state.screen === 'memory') buildDeck(false);
        return;
      }
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
        memorySession = state.screen === 'memory' ? memorySessions[state.dictionary] || null : null;
        if (memorySession) state.revealed = memorySession.revealed === true && !memorySession.paused;
        if (state.screen === 'review') state.screen = 'study';
        state.category = 'all';
        state.subcategory = 'all';
        randomOrder = [];
        buildDeck();
        toast('已更新另一分頁的辭典');
      } else if (event.key === settingsKey) {
        const incoming = sanitizeSettings(JSON.parse(event.newValue || '{}')),
          changed = incoming.dictionaryId !== state.dictionary;
        stashMemorySession();
        if (changed && state.screen === 'memory') restoreLatestMemoryBook(incoming.dictionaryId);
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
        memorySession = state.screen === 'memory' ? memorySessions[state.dictionary] || null : null;
        if (memorySession) state.revealed = memorySession.revealed === true && !memorySession.paused;
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
    memory: {
      get: () => {
        const disk = JSON.parse(localStorage.getItem(memoryKey) || '{}');
        memoryRecords = latestMemoryRecords(disk);
        // A failed earlier write must be retried before claiming synchronization.
        if (!write(memoryKey, memoryRecords)) throw new Error('storage');
        return memoryRecords;
      },
      apply: (incoming) => {
        const disk = JSON.parse(localStorage.getItem(memoryKey) || '{}');
        memoryRecords = MotsMemory.merge(latestMemoryRecords(disk), incoming);
        const saved = write(memoryKey, memoryRecords);
        if (syncReady && state.screen === 'memory') buildDeck(false);
        return saved;
      },
    },
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
