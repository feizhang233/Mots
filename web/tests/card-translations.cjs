const { context, click, assert, upload } = require('./helpers/app.cjs');

const dictionary = {
  id: 'dict-translations',
  title: '例句翻譯',
  kind: 'grammar',
  language: 'fr',
  words: ['first', 'second'].map((id) => ({
    id,
    term: id,
    meanings: { 'zh-Hant': '釋義', en: 'Meaning' },
    example: 'Un exemple.',
    examples: [
      { text: 'Un exemple.', translations: { 'zh-Hant': '一個例句。', en: '<English & example>', fr: 'Un exemple.' } },
      { text: 'Sans traduction.' },
    ],
  })),
};
const url = `http://localhost/?screen=study&view=card&dict=${dictionary.id}`;
const make = (settings = {}, options = {}) => context({
  url,
  storage: { 'mots.dictionaries.v1': [dictionary], 'mots.settings.v2': settings },
  ...options,
});
const cardSwitch = 'show-example-translations';
const listSwitch = 'show-list-example-translations';
const change = (app, control, enabled) => {
  const target = app.$(control);
  target.checked = enabled;
  assert(target.events.change?.length, `${control} has a change handler`);
  for (const handler of target.events.change) handler({ target });
};
const html = (app) => app.$('study-content').innerHTML;

async function checkListTranslations() {
  const sentenceTranslation = '一個例句。';
  const grammar = make({ showExampleTranslations: false });
  click(grammar, 'list-view');
  assert.equal(grammar.$(listSwitch).checked, false, 'Older settings default list translations to off');
  assert(html(grammar).includes('Un exemple.'));
  assert(!html(grammar).includes(sentenceTranslation));
  change(grammar, listSwitch, true);
  assert(html(grammar).includes(sentenceTranslation));
  assert.equal(grammar.$(cardSwitch).checked, false);
  grammar.run('openEntryDetail("second")');
  assert(!grammar.$('entry-detail-content').innerHTML.includes(sentenceTranslation));
  click(grammar, 'close-entry-detail');

  click(grammar, 'card-view');
  grammar.run('state.revealed = true; render()');
  assert(!html(grammar).includes(sentenceTranslation), 'Enabling list translations preserves the separate card preference');
  const listURL = url.replace('view=card', 'view=list');
  const reopened = context({ url: listURL, storage: Object.fromEntries(grammar.store) });
  assert.equal(reopened.$(listSwitch).checked, true);
  assert(html(reopened).includes(sentenceTranslation), 'List translations persist on reload');
  reopened.run('settings.meaningLanguage = "en"; render()');
  assert(html(reopened).includes('&lt;English &amp; example&gt;'));
  for (const language of ['de', 'fr']) {
    reopened.run(`settings.meaningLanguage = ${JSON.stringify(language)}; render()`);
    assert(!html(reopened).includes('example-translation'), 'No duplicate or missing language placeholders');
  }

  const now = Date.now();
  const vocabulary = context({
    url: listURL,
    storage: {
      'mots.dictionaries.v1': [{ ...dictionary, kind: 'vocabulary' }],
      [`mots.progress.dictionary.${dictionary.id}.v1`]: { first: 2 },
      'mots.memory.v1': { [dictionary.id]: { first: { stage: 0, updatedAt: now - 2000, dueAt: now - 1000 } } },
    },
  });
  assert.equal(vocabulary.$(listSwitch).checked, false, 'New browsers default list translations to off');
  assert(!html(vocabulary).includes(sentenceTranslation));
  change(vocabulary, listSwitch, true);
  assert(html(vocabulary).includes(sentenceTranslation), 'Vocabulary study rows show translations');
  vocabulary.run('showScreen("dictionary", "first")');
  assert(html(vocabulary).includes(sentenceTranslation), 'Dictionary search results follow the list setting');
  change(vocabulary, listSwitch, false);
  assert(!html(vocabulary).includes(sentenceTranslation));
  for (const view of ['lapses']) {
    vocabulary.run(`showMemory(${JSON.stringify(view)})`);
    const memoryHTML = () => vocabulary.$('memory-section').innerHTML;
    assert(memoryHTML().includes('Sans traduction.'), 'The untranslated second sentence remains visible');
    assert(!memoryHTML().includes(sentenceTranslation), 'Memory lists start with translations hidden even when card translations are on');
    change(vocabulary, listSwitch, true);
    assert(memoryHTML().includes(sentenceTranslation), 'The open memory list updates when the setting changes');
    assert.equal((memoryHTML().match(/class="example-translation"/g) || []).length, 1);
    change(vocabulary, listSwitch, false);
  }

  click(grammar, 'export-progress');
  const backup = JSON.parse(await grammar.downloads.at(-1).text());
  assert.equal(backup.settings.showListExampleTranslations, true);
  const restored = context();
  await upload(restored, 'import-progress', backup);
  assert.equal(restored.$(listSwitch).checked, true, restored.$('backup-message').textContent);
  assert.equal(restored.$(cardSwitch).checked, false);
}

async function run() {
  const app = make();
  assert.equal(app.run('settings.showExampleTranslations'), true, 'Old settings default to on');
  assert.equal(app.$('show-example-translations').checked, true);
  assert(!html(app).includes('一個例句。'), 'Hidden answers never leak example translations');
  app.run('navigateWord(1); state.revealed = true; render()');
  assert(html(app).includes('一個例句。'));
  assert.equal((html(app).match(/class="example-translation"/g) || []).length, 1);
  const state = app.run('JSON.stringify({ index: state.index, revealed: state.revealed, page: state.page, progress, ids: deck.map(w => w.id) })');
  change(app, cardSwitch, false);
  assert(!html(app).includes('example-translation'));
  assert.equal(app.run('JSON.stringify({ index: state.index, revealed: state.revealed, page: state.page, progress, ids: deck.map(w => w.id) })'), state);
  assert.equal(JSON.parse(app.store.get('mots.settings.v2')).showExampleTranslations, false);
  const reopened = context({ url, storage: Object.fromEntries(app.store) });
  assert.equal(reopened.$('show-example-translations').checked, false);
  reopened.run('state.revealed = true; render()');
  assert(!html(reopened).includes('example-translation'));

  change(app, cardSwitch, true);
  assert(html(app).includes('一個例句。'));
  click(app, 'list-view');
  assert(!html(app).includes('example-translation'));
  app.run('openEntryDetail("second")');
  assert(!app.$('entry-detail-content').innerHTML.includes('example-translation'));
  click(app, 'close-entry-detail');
  click(app, 'card-view');
  app.run('settings.meaningLanguage = "en"; state.revealed = true; render()');
  assert(html(app).includes('&lt;English &amp; example&gt;'));
  assert(!html(app).includes('一個例句。'));
  app.run('settings.meaningLanguage = "de"; render()');
  assert(!html(app).includes('example-translation'), 'Missing translations have no empty block');
  app.run('settings.meaningLanguage = "fr"; render()');
  assert(!html(app).includes('example-translation'), 'The original sentence is never duplicated');

  const vocabulary = make({}, { storage: { 'mots.dictionaries.v1': [{ ...dictionary, kind: 'vocabulary' }] } });
  vocabulary.run('state.revealed = true; render()');
  assert(html(vocabulary).includes('一個例句。'), 'The setting also applies to vocabulary cards');
  click(vocabulary, 'export-progress');
  const backup = JSON.parse(await vocabulary.downloads.at(-1).text());
  assert.equal(backup.settings.showExampleTranslations, true);
  change(vocabulary, cardSwitch, false);
  const restored = { ...backup, settings: { ...backup.settings, showExampleTranslations: false } };
  await upload(vocabulary, 'import-progress', restored);
  assert.equal(vocabulary.run('settings.showExampleTranslations'), false);
  assert.equal(vocabulary.$('show-example-translations').checked, false);
  await checkListTranslations();
  console.log('List and card example translation defaults, visibility, persistence, backup, language and isolation passed.');
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
