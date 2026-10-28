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
      { text: 'Un exemple.', translations: { 'zh-Hant': '一個例句。', en: '<English & example>' } },
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
const change = (app, enabled) => {
  const target = app.$('show-example-translations');
  target.checked = enabled;
  for (const handler of target.events.change || []) handler({ target });
};
const html = (app) => app.$('study-content').innerHTML;

async function run() {
  const app = make();
  assert.equal(app.run('settings.showExampleTranslations'), true, 'Old settings default to on');
  assert.equal(app.$('show-example-translations').checked, true);
  assert(!html(app).includes('一個例句。'), 'Hidden answers never leak example translations');
  app.run('navigateWord(1); state.revealed = true; render()');
  assert(html(app).includes('一個例句。'));
  assert.equal((html(app).match(/class="example-translation"/g) || []).length, 1);
  const state = app.run('JSON.stringify({ index: state.index, revealed: state.revealed, page: state.page, progress, ids: deck.map(w => w.id) })');
  change(app, false);
  assert(!html(app).includes('example-translation'));
  assert.equal(app.run('JSON.stringify({ index: state.index, revealed: state.revealed, page: state.page, progress, ids: deck.map(w => w.id) })'), state);
  assert.equal(JSON.parse(app.store.get('mots.settings.v2')).showExampleTranslations, false);
  const reopened = context({ url, storage: Object.fromEntries(app.store) });
  assert.equal(reopened.$('show-example-translations').checked, false);
  reopened.run('state.revealed = true; render()');
  assert(!html(reopened).includes('example-translation'));

  change(app, true);
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
  change(vocabulary, false);
  const restored = { ...backup, settings: { ...backup.settings, showExampleTranslations: false } };
  await upload(vocabulary, 'import-progress', restored);
  assert.equal(vocabulary.run('settings.showExampleTranslations'), false);
  assert.equal(vocabulary.$('show-example-translations').checked, false);
  console.log('Card example translation defaults, visibility, persistence, backup, language and isolation passed.');
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
