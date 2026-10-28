const { context, read, upload, click, assert } = require('./helpers/app.cjs');
const fs = require('node:fs');
const path = require('node:path');

const entry = {
  id: 'same',
  term: 'ne … plus',
  meanings: { 'zh-Hant': '不再' },
  example: 'Je ne travaille plus ici.',
  examples: [
    { text: 'Je ne travaille plus ici.', translations: { 'zh-Hant': '我不再在這裡工作。' } },
    { text: 'Il ne pleut plus.', translations: { 'zh-Hant': '雨已經停了。' } },
    { text: 'Nous ne prenons plus le bus.', translations: { 'zh-Hant': '我們不再搭公車。' } },
  ],
  pattern: 'ne + verbe conjugué + plus',
  explanation: '強調先前的狀態或習慣已經停止。',
};
const grammarDictionary = {
  id: 'dict-grammar-regression',
  kind: 'grammar',
  title: '語法回歸資料',
  language: 'fr',
  words: [entry],
};
const bookLabels = {
  fr: 'Français Mots',
  de: 'Deutsch Wörter',
  ja: '日本語 語彙',
  'grammar-fr': 'Français Grammaire',
  'grammar-de': 'Deutsch Grammatik',
  'grammar-ja': '日本語 文法',
  'grammar-theme-fr': 'Français Grammaire · 主題',
  'grammar-theme-de': 'Deutsch Grammatik · 主題',
  'grammar-theme-ja': '日本語 文法 · 主題',
};
const selectBook = (app, id, control = 'book-switcher') => {
  const target = app.$(control);
  target.value = id;
  assert(target.events.change?.length, `${control} has a real change handler`);
  for (const handler of target.events.change) handler({ target });
  assert.equal(app.run('state.dictionary'), id);
  assert.equal(app.$('book-switcher').value, id);
  assert.equal(app.$('dictionary-switcher').value, id);
  assert.equal(app.ctx.location.searchParams.get('dict'), id);
};
const assertBookOptions = (app) => {
  for (const control of ['book-switcher', 'dictionary-switcher']) {
    const options = app.$(control).options;
    for (const [value, label] of Object.entries(bookLabels))
      assert(options.some((option) => option.value === value && option.label === label));
  }
  assert.deepEqual(app.$('book-switcher').options, app.$('dictionary-switcher').options);
};
const assertOriginalExamples = (html) => {
  assert(!html.includes('example-translation'), 'Examples render only their original language');
  for (const example of entry.examples) assert(!html.includes(example.translations['zh-Hant']));
};
const plainStore = (app) => Object.fromEntries(app.store);
const fireStorage = (app, key, value) => {
  const newValue = JSON.stringify(value);
  app.store.set(key, newValue);
  for (const handler of app.listeners.storage || []) handler({ key, newValue });
};
const pressKey = (app, key) => {
  for (const handler of app.listeners['document:keydown'] || [])
    handler({
      key,
      isComposing: false,
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      preventDefault() {},
    });
};
const exampleCount = (html, variant) =>
  (html.match(new RegExp(`class="entry-example ${variant}-example"`, 'g')) || []).length;

async function run() {
  const html = fs.readFileSync(path.join(__dirname, '../src/index.html'), 'utf8');
  assert(!/data-study-kind|id="(?:grammar|vocabulary)-mode"/.test(html));
  const mode = context({
    storage: { 'mots.progress.v1': { same: 3 } },
    url: 'http://localhost/Mots.html?screen=study',
  });
  assertBookOptions(mode);
  selectBook(mode, 'grammar-fr');
  assert.equal(mode.run('state.studyKind'), 'grammar');
  assert.equal(mode.run('dictionaryOf(state.dictionary).grammarMode'), 'standard');
  assert.equal(mode.run('state.dictionary'), 'grammar-fr');
  assert.equal(mode.run('state.screen'), 'study');
  assert.equal(mode.ctx.location.searchParams.get('dict'), 'grammar-fr');
  assertBookOptions(mode);
  const grammarID = mode.run('deck[0].id');
  mode.run(`rate(${JSON.stringify(grammarID)}, 2, "dot")`);
  const resumed = context({ storage: plainStore(mode) });
  assert.equal(resumed.run('state.studyKind'), 'grammar');
  assert.equal(resumed.run('state.dictionary'), 'grammar-fr');
  assert.equal(resumed.run(`levelOf(${JSON.stringify(grammarID)})`), 2);
  assert.equal(resumed.$('book-switcher').value, 'grammar-fr');
  assert.equal(resumed.$('dictionary-switcher').value, 'grammar-fr');
  assertBookOptions(resumed);
  selectBook(resumed, 'fr', 'dictionary-switcher');
  assert.equal(resumed.run('levelOf("same")'), 3);
  selectBook(resumed, 'grammar-de');
  assert.equal(resumed.run('state.studyKind'), 'grammar');
  assert.equal(resumed.run('state.language'), 'de');
  selectBook(resumed, 'de', 'dictionary-switcher');
  assert.equal(resumed.run('state.studyKind'), 'vocabulary');
  selectBook(resumed, 'grammar-ja');
  assert.equal(resumed.run('state.language'), 'ja');
  assertBookOptions(resumed);

  // A custom grammar dictionary can reuse a vocabulary ID without sharing its rating.
  const rich = context({
    storage: {
      'mots.dictionaries.v1': [grammarDictionary],
      'mots.progress.v1': { same: 3 },
    },
    url: 'http://localhost/Mots.html?screen=study&dict=dict-grammar-regression&view=card',
  });
  assert.equal(rich.run('state.studyKind'), 'grammar');
  assertBookOptions(rich);
  assert(
    rich
      .$('book-switcher')
      .options.some(
        (option) =>
          option.value === grammarDictionary.id && option.label === grammarDictionary.title,
      ),
  );
  assert.equal(rich.run('levelOf("same")'), 0);
  rich.run('rate("same", 1, "dot")');
  assert.equal(rich.run('progress.fr.same'), 3);
  assert.equal(rich.run('progress["dict-grammar-regression"].same'), 1);
  for (const query of ['pleut', 'verbe conjugue', '先前的狀態', '雨已經停了']) {
    rich.run(`state.query = ${JSON.stringify(query)}; buildDeck()`);
    assert.equal(rich.run('deck.length'), 1, `Search includes rich field: ${query}`);
    assert.equal(rich.run('deck[0].id'), 'same');
  }
  rich.run('state.query = "no matching grammar"; buildDeck()');
  assert.equal(rich.run('deck.length'), 0);
  rich.run('state.query = ""; buildDeck(); state.revealed = true; render()');
  const cardHTML = rich.$('study-content').innerHTML;
  assert.equal(exampleCount(cardHTML, 'card'), 2, 'Cards show two distinct examples');
  assert(!cardHTML.includes('Nous ne prenons plus le bus.'));
  assert(cardHTML.includes('不再'));
  assert(cardHTML.includes('ne + verbe conjugué + plus'));
  assert(cardHTML.includes('我不再在這裡工作。'));
  assert(cardHTML.includes('雨已經停了。'));
  click(rich, 'list-view');
  assertOriginalExamples(rich.$('study-content').innerHTML);
  assert(rich.$('study-content').innerHTML.includes('Je ne travaille plus ici.'));
  assert(rich.$('study-content').innerHTML.includes('不再'));
  click(rich, 'card-view');

  // Mobile summaries keep every meaning; full text remains available in details/cards.
  const longMeaning = '在……的時候；趁……之際。語氣較正式，常見於通知、說明或服務場合。';
  const numberedMeaning = '① 有可能……。表示客觀上的可能性。\n② 不可能……。表示沒有發生的可能性。';
  const compact = context({
    storage: {
      'mots.dictionaries.v1': [{
        ...grammarDictionary,
        words: [
          { ...entry, meanings: { 'zh-Hant': longMeaning, 'zh-Hans': '在……的时候。语气正式。' } },
          { ...entry, id: 'numbered', meanings: { 'zh-Hant': numberedMeaning } },
          { ...entry, id: 'plain', meanings: { 'zh-Hant': '不再；不復；已經不' } },
        ],
      }],
    },
    url: `http://localhost/Mots.html?screen=study&dict=${grammarDictionary.id}&view=list`,
  });
  const compactHTML = compact.$('study-content').innerHTML;
  assert(compactHTML.includes(`<span class="list-meaning-full">${longMeaning}</span>`));
  assert(compactHTML.includes('<span class="list-meaning-summary">在……的時候；趁……之際</span>'));
  assert(compactHTML.includes('<span class="list-meaning-summary">① 有可能……\n② 不可能……</span>'));
  assert(compactHTML.includes('不再；不復；已經不'));
  compact.run('openEntryDetail("same")');
  assert(compact.$('entry-detail-content').innerHTML.includes(longMeaning));
  click(compact, 'close-entry-detail');
  click(compact, 'card-view');
  compact.run('state.revealed = true; render()');
  assert(compact.$('study-content').innerHTML.includes(longMeaning));
  compact.run('settings.meaningLanguage = "zh-Hans"; state.view = "list"; render()');
  assert(compact.$('study-content').innerHTML.includes('<span class="list-meaning-summary">在……的时候</span>'));
  compact.run('settings.meaningLanguage = "en"; render()');
  assert(compact.$('study-content').innerHTML.includes('尚無英語釋義'));
  assert(!compact.$('study-content').innerHTML.includes('list-meaning-summary'));

  // Exercise the delegated detail action, its modal shortcut guard and focus return.
  const opener = rich.$('test-detail-opener');
  opener.dataset.detail = 'same';
  opener.closest = (selector) => (selector === '[data-detail]' ? opener : null);
  for (const handler of rich.$('study-content').events.click || []) handler({ target: opener });
  assert(rich.$('entry-detail-dialog').open);
  assert.equal(rich.ctx.document.activeElement, rich.$('close-entry-detail'));
  assert.equal(exampleCount(rich.$('entry-detail-content').innerHTML, 'detail'), 3);
  assert(rich.$('entry-detail-content').innerHTML.includes(entry.explanation));
  assertOriginalExamples(rich.$('entry-detail-content').innerHTML);
  assert.equal(rich.run('deck[0].examples[0].translations["zh-Hant"]'), '我不再在這裡工作。');
  const beforeKeys = read(rich, '({ index: state.index, revealed: state.revealed, progress })');
  for (const key of ['3', 'ArrowRight', 'ArrowLeft', ' ', 'Escape']) pressKey(rich, key);
  assert.deepEqual(
    read(rich, '({ index: state.index, revealed: state.revealed, progress })'),
    beforeKeys,
    'The open detail dialog isolates learning keyboard shortcuts',
  );
  click(rich, 'close-entry-detail');
  assert.equal(rich.$('entry-detail-dialog').open, false);
  // The test browser does not dispatch the native close event automatically.
  for (const handler of rich.$('entry-detail-dialog').events.close || []) handler();
  assert.equal(rich.ctx.document.activeElement, opener);
  rich.run('openEntryDetail("missing-entry")');
  assert.equal(rich.$('entry-detail-dialog').open, false);

  const legacy = context({
    url: 'http://localhost/Mots.html?screen=study&dict=fr&view=card',
  });
  legacy.run('state.revealed = true; render()');
  assert.equal(exampleCount(legacy.$('study-content').innerHTML, 'card'), 1);
  legacy.run('openEntryDetail(deck[state.index].id)');
  assert.equal(exampleCount(legacy.$('entry-detail-content').innerHTML, 'detail'), 1);

  // In the grammar workspace, a file without kind becomes a separate grammar collection.
  await upload(rich, 'import-dictionary', {
    title: '我的語法筆記',
    language: 'fr',
    words: [entry],
  });
  const importedID = rich.run('state.dictionary');
  assert.notEqual(importedID, grammarDictionary.id);
  assert.equal(rich.run('dictionaryOf(state.dictionary).kind'), 'grammar');
  assert.equal(rich.run('dictionaryOf(state.dictionary).grammarMode'), 'standard');
  assert.equal(rich.run('state.studyKind'), 'grammar');
  assert.equal(rich.run('levelOf("same")'), 0);
  assert(
    rich
      .$('book-switcher')
      .options.some((option) => option.value === importedID && option.label === '我的語法筆記'),
  );
  assertBookOptions(rich);
  assert.equal(rich.run('progress["dict-grammar-regression"].same'), 1);
  assert.equal(rich.run('progress.fr.same'), 3);

  const extensions = context({ storage: { 'mots.progress.v1': { same: 3 } } });
  selectBook(extensions, 'grammar-fr');
  await upload(extensions, 'import-vocabulary', { language: 'fr', words: [entry] });
  const extensionID = extensions.run('customBanks["grammar-fr"][0].id');
  assert(extensionID.startsWith('custom-grammar-fr-'));
  extensions.run(`rate(${JSON.stringify(extensionID)}, 2, "dot")`);
  click(extensions, 'export-progress');
  const backup = JSON.parse(await extensions.downloads[0].text());
  const restored = context({ storage: { 'mots.progress.v1': { b: 1 } } });
  await upload(restored, 'import-progress', backup);
  assert.equal(restored.run('state.dictionary'), 'grammar-fr');
  assert.equal(restored.run('state.studyKind'), 'grammar');
  assert.equal(restored.run('customBanks["grammar-fr"][0].examples.length'), 3);
  assert.equal(restored.run('customBanks["grammar-fr"][0].explanation'), entry.explanation);
  assert.equal(restored.run(`progress["grammar-fr"][${JSON.stringify(extensionID)}]`), 2);
  assert.equal(restored.run('progress.fr.same'), 3);
  assert.equal(restored.run('progress.fr.b'), 1, 'Restoring grammar data retains existing ratings');

  // Cross-tab collection and settings updates must not move data between the modes.
  const savedBanks = read(restored, 'customBanks');
  const savedProgress = read(restored, 'progress');
  fireStorage(restored, 'mots.dictionaries.v1', [grammarDictionary]);
  assert.equal(restored.run('state.studyKind'), 'grammar');
  assertBookOptions(restored);
  assert.deepEqual(read(restored, 'customBanks'), savedBanks);
  for (const id of Object.keys(savedProgress))
    assert.deepEqual(read(restored, `progress[${JSON.stringify(id)}]`), savedProgress[id]);
  const settings = read(restored, 'settings');
  fireStorage(restored, 'mots.settings.v2', { ...settings, dictionaryId: 'fr' });
  assert.equal(restored.run('state.studyKind'), 'vocabulary');
  assert.equal(restored.run('levelOf("same")'), 3);
  assert.equal(restored.$('book-switcher').value, 'fr');
  assert.equal(restored.$('dictionary-switcher').value, 'fr');
  fireStorage(restored, 'mots.settings.v2', { ...settings, dictionaryId: 'grammar-fr' });
  assert.equal(restored.run('state.studyKind'), 'grammar');
  assert.equal(restored.run(`levelOf(${JSON.stringify(extensionID)})`), 2);
  assert.equal(restored.$('book-switcher').value, 'grammar-fr');
  assert.equal(restored.$('dictionary-switcher').value, 'grammar-fr');
  assert.deepEqual(read(restored, 'customBanks'), savedBanks);

  console.log('Grammar study, detail, search and backup regressions passed.');
}
run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// Corrupted optional local details must not prevent the rest of the app from opening.
const damaged = context({
  storage: {
    'mots.banks.v1': {
      fr: [
        {
          id: 'custom-fr-damaged',
          term: 'mot',
          meanings: { 'zh-Hant': '詞' },
          example: 'Un mot.',
          examples: 'malformed',
          category: '1',
          subcategory: '1.01',
        },
      ],
    },
  },
});
assert.equal(
  damaged.run("sourceWords().find(w => w.id === 'custom-fr-damaged').example"),
  'Un mot.',
);
assert.equal(damaged.run('storageFailures.has(banksKey)'), true);
