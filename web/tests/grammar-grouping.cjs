const { context, read, upload, click, assert } = require('./helpers/app.cjs');
const fs = require('node:fs');
const path = require('node:path');

const dictionary = {
  id: 'dict-grammar-grouping',
  kind: 'grammar',
  grammarMode: 'thematic',
  title: '語法歸納測試',
  language: 'fr',
  categories: [
    {
      id: 'x',
      name: '句型',
      subcategories: [
        { id: 'x.1', name: '陳述歸納' },
        { id: 'x.2', name: '否定歸納' },
      ],
    },
    { id: 'y', name: '時態', subcategories: [{ id: 'y.1', name: '時間歸納' }] },
  ],
  words: Array.from({ length: 24 }, (_, index) => ({
    id: `g${index}`,
    category: index < 16 ? 'x' : 'y',
    subcategory: index < 8 ? 'x.1' : index < 16 ? 'x.2' : 'y.1',
    term: `phrase-${String(index).padStart(2, '0')}`,
    meanings: { 'zh-Hant': `語法 ${index}` },
    example: `Exemple ${index}.`,
    pattern: index === 13 ? 'search-only-pattern' : 'Sujet + verbe',
    explanation: '歸納中的獨立語法內容。',
  })),
};
const standard = { ...dictionary, id: 'dict-grammar-standard', title: '普通語法測試' };
delete standard.grammarMode;
const settingsKey = 'mots.settings.v2';
const url = `http://localhost/Mots.html?screen=study&dict=${dictionary.id}&view=list`;
const make = (options = {}) =>
  context({
    url,
    ...options,
    storage: {
      'mots.dictionaries.v1': [dictionary, standard],
      ...options.storage,
    },
  });
const htmlOf = (app) => app.$('study-content').innerHTML;
const groups = (app) => (htmlOf(app).match(/<details\b[^>]*\bdata-grammar-group\b/g) || []).length;
const rows = (app) => [...htmlOf(app).matchAll(/data-row-word="([^"]+)"/g)].map((m) => m[1]);
const stored = (app) => Object.fromEntries(app.store);
const snapshot = (app) =>
  JSON.stringify({
    store: [...app.store],
    runtime: read(app, '({ dictionaryLibrary, customBanks, progress, settings, state })'),
  });
const change = (app, id, value) => {
  const target = app.$(id);
  target.value = value;
  assert(target.events.change?.length, `${id} has a change handler`);
  for (const handler of target.events.change) handler({ target });
};
const fireStorage = (app, key, value) => {
  const newValue = JSON.stringify(value);
  app.store.set(key, newValue);
  for (const handler of app.listeners.storage || []) handler({ key, newValue });
};
const assertFirstLevelNavigation = (app) => {
  for (const id of ['category-nav', 'mobile-category-nav']) {
    const navigation = app.$(id).innerHTML;
    assert(navigation.includes('data-category="x"'));
    assert(navigation.includes('data-category="y"'));
    assert(!navigation.includes('data-sub='), `${id} omits second-level grammar navigation`);
    assert(!navigation.includes('aria-expanded='), `${id} does not promise hidden children`);
  }
};

async function run() {
  const sourceHTML = fs.readFileSync(path.join(__dirname, '../src/index.html'), 'utf8');
  assert(!sourceHTML.includes('id="grammar-grouping"'), 'Book type is not a display setting');

  // Ordinary grammar keeps its existing independent cards and two-level navigation,
  // even for clients that previously saved the abandoned presentation preference.
  const ordinary = make({
    url: `http://localhost/Mots.html?screen=study&dict=${standard.id}&view=list&category=x&sub=x.1`,
    storage: {
      [settingsKey]: {
        grammarGrouping: { [standard.id]: true, 'grammar-fr': true, 'grammar-de': true },
      },
    },
  });
  assert.equal(groups(ordinary), 0);
  assert.equal(ordinary.run('state.subcategory'), 'x.1');
  assert.equal(ordinary.run('deck.length'), 8);
  assert(ordinary.$('category-nav').innerHTML.includes('data-sub="x.1"'));
  assert.equal(ordinary.run('dictionaryOf(state.dictionary).grammarMode'), 'standard');
  for (const navID of ['category-nav', 'mobile-category-nav']) {
    const navigation = ordinary.$(navID).innerHTML;
    assert(navigation.includes('data-sub="x.2"'), 'Multiple children retain their menu');
    assert(!navigation.includes('data-sub="y.1"'), 'A single child has no redundant menu');
    assert(!navigation.includes(`${navID}-children-y`));
    const parent = ordinary.$('single-child-category');
    parent.dataset.category = 'y';
    ordinary.$('category-dialog').showModal();
    for (let repeat = 0; repeat < 2; repeat++) {
      for (const handler of ordinary.$(navID).events.click)
        handler({
          target: { closest: (selector) => (selector === '[data-category]' ? parent : null) },
        });
      assert.equal(ordinary.run('state.category'), 'y');
      assert.equal(ordinary.run('state.subcategory'), 'all');
      assert.equal(ordinary.run('deck.length'), 8);
      if (navID === 'mobile-category-nav') assert.equal(ordinary.$('category-dialog').open, false);
    }
  }
  for (const language of ['fr', 'de', 'ja']) {
    change(ordinary, 'book-switcher', `grammar-${language}`);
    assert.equal(groups(ordinary), 0);
    assert.equal(ordinary.run('deck.length'), language === 'ja' ? 141 : 6);
    assert.equal(ordinary.run('dictionaryOf(state.dictionary).grammarMode'), 'standard');
    for (const navID of ['category-nav', 'mobile-category-nav']) {
      const navigation = ordinary.$(navID).innerHTML;
      assert(navigation.includes('data-category='));
      assert(!navigation.includes('data-sub='), 'Single-child grammar categories select directly');
      assert(!navigation.includes('aria-expanded='));
      assert(!navigation.includes('nav-chevron'));
    }
  }
  fireStorage(ordinary, settingsKey, {
    ...read(ordinary, 'settings'),
    dictionaryId: 'grammar-fr',
    grammarGrouping: { 'grammar-fr': true },
  });
  assert.equal(groups(ordinary), 0, 'Old cross-tab settings cannot convert a grammar book');

  // French/German thematic entry points still await their own source material.
  const empty = context({ url: 'http://localhost/Mots.html?screen=study&view=list' });
  for (const language of ['fr', 'de']) {
    const id = `grammar-theme-${language}`;
    change(empty, 'book-switcher', id);
    const book = read(empty, 'dictionaryOf(state.dictionary)');
    assert.equal(book.id, id);
    assert.equal(book.kind, 'grammar');
    assert.equal(book.grammarMode, 'thematic');
    assert.equal(book.language, language);
    assert.deepEqual(book.words, []);
    assert.deepEqual(book.categories, []);
    assert.equal(empty.run('deck.length'), 0);
    assert.equal(groups(empty), 0);
    assert(empty.$('dictionary-switcher').options.some((option) => option.value === id));
    assert(!htmlOf(empty).includes('data-action="import-dictionary"'));
    assert(
      htmlOf(empty).includes('設定'),
      'Empty books explain where to import without a main-screen action',
    );
    assert.equal(empty.$('vocabulary-extension-section').hidden, true);
  }
  click(empty, 'download-dictionary-template');
  const template = JSON.parse(await empty.downloads.at(-1).text());
  assert.equal(template.kind, 'grammar');
  assert.equal(template.grammarMode, 'thematic');
  assert.equal(template.words[0].category, template.categories[0].id);
  assert.equal(template.words[0].subcategory, template.categories[0].subcategories[0].id);

  // The supplied Japanese notes populate the existing independent grammar books.
  const japanese = context({
    url: 'http://localhost/Mots.html?screen=study&dict=grammar-theme-ja&view=list&category=gt27',
  });
  assert.equal(japanese.run('dictionaryOf(state.dictionary).categories.length'), 17);
  assert.equal(japanese.run('sourceWords().length'), 229);
  assert(
    japanese.run(
      'dictionaryOf(state.dictionary).categories.every(category => Number(category.id.slice(2)) >= 27)',
    ),
  );
  assert.equal(japanese.run('deck.length'), 20);
  assert.equal(groups(japanese), 1);
  assert(htmlOf(japanese).includes('從原動詞理解語法'));
  assert(htmlOf(japanese).includes('區分方法'));
  const japaneseID = japanese.run('deck[1].id');
  japanese.run(`rate(${JSON.stringify(japaneseID)}, 2, "dot")`);
  change(japanese, 'book-switcher', 'grammar-ja');
  assert.equal(japanese.run('deck.length'), 141);
  assert(
    japanese.run(
      'dictionaryOf(state.dictionary).categories.every(category => Number(category.id.slice(2)) <= 26)',
    ),
  );
  assert.equal(groups(japanese), 0);
  assert.equal(japanese.run(`levelOf(${JSON.stringify(japaneseID)})`), 0);
  change(japanese, 'book-switcher', 'grammar-theme-ja');
  japanese.run('state.category = "gt27"; state.subcategory = "all"; buildDeck()');
  assert.equal(japanese.run('deck.length'), 20);
  assert(htmlOf(japanese).includes('從原動詞理解語法'));
  japanese.run(
    'state.dictionary = "grammar-theme-ja"; state.category = "gt42"; state.subcategory = "all"; buildDeck()',
  );
  assert(
    japanese.run(
      'deck.find(word => word.id.endsWith("-notes")).explanation.includes("学生は先生に")',
    ),
  );
  assert(
    !japanese.run(
      'deck.find(word => word.id.endsWith("-notes")).explanation.includes("學生は先生に")',
    ),
  );

  // Old links to removed thematic lessons recover to the remaining lesson list.
  const oldJapaneseTopic = context({
    url: 'http://localhost/Mots.html?screen=study&dict=grammar-theme-ja&view=list&category=gt01',
  });
  assert.equal(oldJapaneseTopic.run('state.category'), 'all');
  assert.equal(oldJapaneseTopic.run('deck.length'), 229);
  assert(oldJapaneseTopic.run('deck.every(word => Number(word.category.slice(2)) >= 27)'));

  // Explicit thematic metadata renders group cards while retaining individual entry IDs.
  const app = make();
  assert.equal(groups(app), 3);
  for (const title of ['陳述歸納', '否定歸納', '時間歸納']) assert(htmlOf(app).includes(title));
  assert.deepEqual(
    rows(app),
    dictionary.words.slice(0, 20).map((word) => word.id),
  );
  assert.equal(app.run('deck.length'), 24);
  assertFirstLevelNavigation(app);

  // Same IDs in ordinary and thematic books never share progress or deletion state.
  change(app, 'book-switcher', standard.id);
  app.run('rate("g13", 3, "dot")');
  change(app, 'book-switcher', dictionary.id);
  assert.equal(app.run('levelOf("g13")'), 0);
  app.run('rate("g13", 2, "dot")');
  assert.equal(app.run(`progress[${JSON.stringify(standard.id)}].g13`), 3);
  assert.equal(app.run(`progress[${JSON.stringify(dictionary.id)}].g13`), 2);
  app.run('changeDeletion(state.dictionary, "g13", true)');
  assert(app.run('deletionState.isDeleted(state.dictionary, "g13")'));
  change(app, 'book-switcher', standard.id);
  assert(!app.run('deletionState.isDeleted(state.dictionary, "g13")'));
  assert.equal(app.run('deck.length'), 24);
  change(app, 'book-switcher', dictionary.id);
  app.run('changeDeletion(state.dictionary, "g13", false)');
  change(app, 'book-switcher', 'fr');
  assert.equal(groups(app), 0, 'Vocabulary does not acquire grammar group cards');
  assert(
    !app.$('category-nav').innerHTML.includes('data-sub='),
    'Empty child categories do not create a menu',
  );
  change(app, 'book-switcher', dictionary.id);
  const resumed = context({ storage: stored(app), url });
  assert.equal(groups(resumed), 3);
  assert.equal(resumed.run('dictionaryOf(state.dictionary).grammarMode'), 'thematic');
  assert.equal(resumed.run('levelOf("g13")'), 2);
  click(resumed, 'export-progress');
  const backup = JSON.parse(await resumed.downloads.at(-1).text());
  assert.equal(
    backup.dictionaries.find((book) => book.id === dictionary.id).grammarMode,
    'thematic',
  );
  assert.equal(backup.dictionaries.find((book) => book.id === standard.id).grammarMode, 'standard');
  assert(!Object.hasOwn(backup.settings, 'grammarGrouping'));
  const restored = context({ url: 'http://localhost/Mots.html?screen=study&view=list' });
  await upload(restored, 'import-progress', backup);
  assert.equal(groups(restored), 3);
  assert.equal(restored.run('dictionaryOf(state.dictionary).grammarMode'), 'thematic');
  assert.equal(restored.run('levelOf("g13")'), 2);
  change(restored, 'book-switcher', standard.id);
  assert.equal(groups(restored), 0);
  assert.equal(restored.run('levelOf("g13")'), 3);

  // New imports inherit thematic mode only from a currently selected grammar book
  // of that mode. Stored legacy books are standard regardless of the active book.
  const importData = { ...dictionary };
  delete importData.id;
  delete importData.kind;
  delete importData.grammarMode;
  const importing = context({
    url: 'http://localhost/Mots.html?screen=study&dict=grammar-theme-fr&view=list',
  });
  await upload(importing, 'import-dictionary', importData);
  const importedID = importing.run('state.dictionary');
  assert.match(importedID, /^dict-/);
  assert.notEqual(importedID, dictionary.id);
  assert.equal(importing.run('dictionaryOf(state.dictionary).kind'), 'grammar');
  assert.equal(importing.run('dictionaryOf(state.dictionary).grammarMode'), 'thematic');
  assert.equal(groups(importing), 3);
  assert.equal(importing.run('dictionaryOf("grammar-theme-fr").words.length'), 0);
  change(importing, 'book-switcher', 'grammar-theme-fr');
  await upload(importing, 'import-dictionary', { ...importData, kind: 'grammar' });
  assert.equal(importing.run('dictionaryOf(state.dictionary).grammarMode'), 'thematic');
  assert.equal(groups(importing), 3, 'Explicit grammar kind can inherit thematic mode');
  change(importing, 'book-switcher', 'grammar-theme-fr');
  await upload(importing, 'import-dictionary', { ...importData, kind: 'vocabulary' });
  assert.equal(importing.run('dictionaryOf(state.dictionary).kind'), 'vocabulary');
  assert.equal(importing.run('dictionaryOf(state.dictionary).grammarMode'), 'standard');
  assert.equal(
    groups(importing),
    0,
    'An explicit vocabulary override does not inherit thematic mode',
  );
  await upload(importing, 'import-dictionary', { ...importData, kind: 'grammar' });
  assert.equal(importing.run('dictionaryOf(state.dictionary).grammarMode'), 'standard');
  assert.equal(groups(importing), 0);
  change(importing, 'book-switcher', 'grammar-theme-fr');
  await upload(importing, 'import-dictionary', {
    ...importData,
    kind: 'grammar',
    grammarMode: 'standard',
  });
  assert.equal(importing.run('dictionaryOf(state.dictionary).grammarMode'), 'standard');
  assert.equal(groups(importing), 0, 'Explicit metadata controls the newly imported book');
  fireStorage(importing, 'mots.dictionaries.v1', [dictionary, standard]);
  change(importing, 'book-switcher', standard.id);
  assert.equal(importing.run('dictionaryOf(state.dictionary).grammarMode'), 'standard');
  assert.equal(groups(importing), 0);

  // Invalid mode metadata is rejected before mutating active book, progress or storage.
  for (const invalid of [
    { ...importData, kind: 'grammar', grammarMode: 'unknown' },
    { ...importData, kind: 'grammar', grammarMode: true },
    { ...importData, kind: 'vocabulary', grammarMode: 'thematic' },
  ]) {
    const before = snapshot(importing);
    await upload(importing, 'import-dictionary', invalid);
    assert.equal(snapshot(importing), before);
    assert(importing.$('dictionary-message').textContent);
  }
  const beforeInvalidBackup = snapshot(importing);
  await upload(importing, 'import-progress', {
    app: 'mots',
    version: 3,
    dictionaries: [{ ...dictionary, grammarMode: 'unknown' }],
    progress: { [dictionary.id]: { g13: 3 } },
  });
  assert.equal(snapshot(importing), beforeInvalidBackup);
  assert(importing.$('backup-message').textContent);

  // Restoring content may update an existing book, but cannot retype its identity.
  for (const converted of [
    { ...standard, grammarMode: 'thematic' },
    { ...dictionary, grammarMode: 'standard' },
    { ...standard, kind: 'vocabulary', grammarMode: 'standard' },
  ]) {
    const before = snapshot(importing);
    await upload(importing, 'import-progress', {
      app: 'mots',
      version: 3,
      dictionaries: [converted],
      progress: { [converted.id]: { g13: 3 } },
    });
    assert.equal(snapshot(importing), before, 'Book-type rejection is atomic');
    assert(importing.$('backup-message').textContent.includes('不可變更現有書籍類型'));
  }
  const beforePartialBackup = snapshot(importing);
  await upload(importing, 'import-progress', {
    app: 'mots',
    version: 3,
    dictionaries: [
      { ...standard, title: '不得提前寫入的名稱' },
      { ...dictionary, grammarMode: 'standard' },
    ],
    progress: { [standard.id]: { g13: 3 } },
  });
  assert.equal(
    snapshot(importing),
    beforePartialBackup,
    'A later mismatch rolls back the full restore',
  );

  // Extension imports are scoped to the active book and cannot move typed corpora
  // between ordinary grammar, thematic grammar or vocabulary.
  const extraWord = { ...dictionary.words[0], id: 'extra-point', term: 'nouvelle-phrase' };
  for (const [target, kind, grammarMode] of [
    [standard.id, 'grammar', 'thematic'],
    [dictionary.id, 'grammar', 'standard'],
    [standard.id, 'vocabulary', 'standard'],
  ]) {
    change(importing, 'book-switcher', target);
    const before = snapshot(importing);
    await upload(importing, 'import-vocabulary', {
      language: 'fr',
      kind,
      grammarMode,
      words: [extraWord],
    });
    assert.equal(
      snapshot(importing),
      before,
      'A mismatched extension cannot mutate content or progress',
    );
    assert(importing.$('vocabulary-message').textContent.includes('匯入新辭典'));
  }
  change(importing, 'book-switcher', dictionary.id);
  await upload(importing, 'import-vocabulary', {
    language: 'fr',
    kind: 'grammar',
    grammarMode: 'thematic',
    words: [extraWord],
  });
  assert.equal(importing.run('words().length'), 25);
  assert.equal(importing.run('dictionaryOf(state.dictionary).grammarMode'), 'thematic');
  assert.equal(importing.run(`dictionaryOf(${JSON.stringify(standard.id)}).words.length`), 24);
  change(importing, 'book-switcher', standard.id);
  await upload(importing, 'import-vocabulary', { language: 'fr', words: [extraWord] });
  assert.equal(importing.run('words().length'), 25, 'Legacy untyped extension imports still work');
  assert.equal(importing.run('dictionaryOf(state.dictionary).grammarMode'), 'standard');

  // Thematic books expose parent scope; ordinary second-level URLs remain exact.
  const oldURL = `${url}&category=x&sub=x.1`;
  const linked = make({ url: oldURL });
  assert.equal(linked.run('state.category'), 'x');
  assert.equal(linked.run('state.subcategory'), 'all');
  assert.equal(linked.run('deck.length'), 16);
  assert.equal(groups(linked), 2);
  assert.notEqual(linked.ctx.location.searchParams.get('sub'), 'x.1');
  const legacy = make({
    url: oldURL.replace(dictionary.id, standard.id),
    storage: { [settingsKey]: { grammarGrouping: { [standard.id]: true } } },
  });
  assert.equal(legacy.run('state.subcategory'), 'x.1');
  assert.equal(legacy.run('deck.length'), 8);

  const crossTab = make({
    url: oldURL,
    storage: { [settingsKey]: { grammarGrouping: { [dictionary.id]: false } } },
  });
  fireStorage(crossTab, settingsKey, {
    ...read(crossTab, 'settings'),
    dictionaryId: dictionary.id,
    grammarGrouping: { [dictionary.id]: false },
  });
  assert.equal(crossTab.run('state.subcategory'), 'all');
  assert.equal(crossTab.run('deck.length'), 16);
  assert.equal(groups(crossTab), 2);

  // Pagination still counts individual grammar points, including a split group.
  const paged = make({ url: `${url}&size=10&page=2` });
  assert.equal(paged.run('state.page'), 2);
  assert.equal(groups(paged), 2);
  assert.deepEqual(
    rows(paged),
    dictionary.words.slice(10, 20).map((word) => word.id),
  );
  assert.equal(new Set(rows(paged)).size, 10);
  assert(htmlOf(paged).includes('第 11–20 項，共 24 項'));
  const idsBefore = read(paged, 'deck.map(word => word.id)');
  click(paged, 'card-view');
  assert.equal(groups(paged), 0, 'Flashcard mode studies individual points');
  assert(htmlOf(paged).includes('aria-label="語法卡片"'));
  assert.equal(paged.run('deck[state.index].id'), 'g10');
  assert.deepEqual(read(paged, 'deck.map(word => word.id)'), idsBefore);
  assertFirstLevelNavigation(paged);
  paged.run('navigateWord(1)');
  click(paged, 'list-view');
  assert.equal(groups(paged), 2);
  click(paged, 'card-view');
  assert.equal(paged.run('deck[state.index].id'), 'g11', 'Grouping preserves the card anchor');
  paged.run('startReview()');
  assert.equal(groups(paged), 0, 'Random review is a flat captured queue');
  assert.equal(paged.run('deck.length'), 20);
  assert.equal(paged.run('new Set(deck.map(word => word.id)).size'), 20);
  assertFirstLevelNavigation(paged);

  // Search, hide and delete change group membership, never source data or ratings.
  const filtered = make();
  filtered.run('state.query = "search-only-pattern"; buildDeck()');
  assert.equal(groups(filtered), 1);
  assert.deepEqual(rows(filtered), ['g13']);
  assert(htmlOf(filtered).includes('否定歸納'));
  assert(!htmlOf(filtered).includes('陳述歸納'));
  assert(/<details\b[^>]*\bopen(?:\s|>)/.test(htmlOf(filtered)), 'Search exposes its match');
  filtered.run('rate("g13", 2, "dot")');
  assert.equal(filtered.run('levelOf("g13")'), 2);
  filtered.run('settings.visibility[state.dictionary] = [2]; buildDeck()');
  assert.equal(groups(filtered), 0);
  assert(htmlOf(filtered).includes('符合條件的語法已隱藏'));
  filtered.run('clearHidden(); changeDeletion(state.dictionary, "g13", true)');
  assert.equal(groups(filtered), 0);
  assert.equal(filtered.run('sourceWords().length'), 24);
  assert.equal(filtered.run('levelOf("g13")'), 2);
  filtered.run('changeDeletion(state.dictionary, "g13", false)');
  assert.equal(groups(filtered), 1);
  assert.deepEqual(rows(filtered), ['g13']);
  filtered.run('state.query = "no-matching-grammar-point"; buildDeck()');
  assert.equal(groups(filtered), 0);
  assert(htmlOf(filtered).includes('沒有符合條件的語法'));

  console.log(
    'Separate ordinary/thematic grammar books, safe imports, persistence and flat-card regressions passed.',
  );
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
