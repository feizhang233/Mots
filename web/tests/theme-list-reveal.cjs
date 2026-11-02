const { context, click, upload, assert } = require('./helpers/app.cjs');

const words = Array.from({ length: 22 }, (_, index) => ({
  id: `meaning-${index}`,
  french: `mot-${index}`,
  chinese: `釋義${index}`,
  example: `Exemple ${index}.`,
  category: index < 20 ? '1' : '2',
  subcategory: index < 20 ? '1.01' : '2.01',
}));
const settingsKey = 'mots.settings.v2';
const url = 'http://localhost/?screen=study&view=list&size=10';
const make = (settings = {}, options = {}) => context({
  words,
  url,
  storage: { [settingsKey]: settings },
  ...options,
});
const change = (app, id, value) => {
  const target = app.$(id);
  if (typeof value === 'boolean') target.checked = value;
  else target.value = value;
  for (const handler of target.events.change || []) handler({ target });
};
const effectiveTheme = (app) => app.ctx.document.documentElement.dataset.theme ||
  app.ctx.document.documentElement.getAttribute('data-theme');
const rowHTML = (app, id) => {
  const html = app.$('study-content').innerHTML;
  const row = [...html.matchAll(/<article\b[^>]*data-row-word="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)]
    .find((entry) => entry[1] === id);
  assert(row, `Expected rendered list row ${id}`);
  return row[2];
};
const meaningHidden = (app, id) => {
  const tag = rowHTML(app, id).match(/<[^>]+class="list-meaning\b[^>]*>/)?.[0];
  assert(tag, `Expected a meaning surface for ${id}`);
  return /\bhidden(?:\s|=|>)/.test(tag);
};
function activate(app, data, id = '') {
  const row = { dataset: { rowWord: data.speak || data.listWord || data.word } };
  const target = {
    id,
    dataset: data,
    isConnected: true,
    focus() {},
    closest(selector) {
      if (selector === '[data-row-word]' || selector === '.word-row') return row;
      if (selector === 'button') return this;
      const matches = {
        '[data-speak]': 'speak',
        '[data-list-word]': 'listWord',
        '[data-rate]': 'rate',
        '[data-detail]': 'detail',
        '[data-delete]': 'delete',
      };
      return Object.hasOwn(data, matches[selector]) ? this : null;
    },
  };
  for (const handler of app.$('study-content').events.click || []) handler({ target });
  // Render from the same state after any optimized live DOM update.
  app.run('render()');
}
async function tick() {
  await Promise.resolve();
  await Promise.resolve();
}

async function run() {
  const old = make();
  assert.equal(old.run('settings.appearance'), 'system', 'Old settings preserve system appearance');
  assert.equal(old.run('settings.hideListMeanings'), false);
  assert.equal(effectiveTheme(old), 'light');
  assert.equal(old.$('appearance').value, 'system');
  assert.equal(meaningHidden(old, 'meaning-0'), false);

  const app = make({ appearance: 'dark', hideListMeanings: true, audioMode: 'device' });
  assert.equal(effectiveTheme(app), 'dark', 'An explicit dark preference overrides a light OS');
  assert.equal(app.$('appearance').value, 'dark');
  assert.equal(app.$('hide-list-meanings').checked, true);
  assert.equal(meaningHidden(app, 'meaning-0'), true);
  assert.equal(meaningHidden(app, 'meaning-1'), true);
  assert.match(rowHTML(app, 'meaning-0'), /<button\b[^>]*data-list-word="meaning-0"/,
    'The word is a keyboard-operable native button');

  const spoken = [];
  app.ctx.speechSynthesis.getVoices = () => [{ lang: 'fr-FR', localService: true }];
  app.ctx.speechSynthesis.speak = (utterance) => spoken.push(utterance.text);
  const ratings = app.store.get('mots.progress.v1');
  activate(app, { speak: 'meaning-0', listWord: 'meaning-0' });
  await tick();
  assert.deepEqual(spoken, ['mot-0'], 'A word tap starts pronunciation');
  assert.equal(meaningHidden(app, 'meaning-0'), false);
  assert.equal(meaningHidden(app, 'meaning-1'), true);
  assert.equal(app.store.get('mots.progress.v1'), ratings, 'Pronunciation never rates a word');

  activate(app, { speak: 'meaning-1' });
  await tick();
  assert.deepEqual(spoken, ['mot-0', 'mot-1'], 'The speaker shares word-tap reveal behavior');
  assert.equal(meaningHidden(app, 'meaning-0'), true, 'Only the current tapped word is revealed');
  assert.equal(meaningHidden(app, 'meaning-1'), false);
  activate(app, { speak: 'meaning-1', listWord: 'meaning-1' });
  assert.equal(meaningHidden(app, 'meaning-1'), false, 'Stopping repeated audio retains the meaning');
  activate(app, { word: 'meaning-2', rate: '2', ratingVariant: 'list' });
  assert.equal(meaningHidden(app, 'meaning-2'), true, 'A familiarity mark does not reveal its answer');

  activate(app, {}, 'next-page');
  assert.equal(meaningHidden(app, 'meaning-10'), true);
  activate(app, {}, 'previous-page');
  assert.equal(meaningHidden(app, 'meaning-1'), true, 'Page navigation clears the transient answer');
  activate(app, { speak: 'meaning-0', listWord: 'meaning-0' });
  app.$('search-input').value = 'mot';
  for (const handler of app.$('search-input').events.input || [])
    handler({ target: app.$('search-input') });
  assert.equal(meaningHidden(app, 'meaning-0'), true, 'A changed query starts with answers hidden');
  activate(app, { speak: 'meaning-0', listWord: 'meaning-0' });
  click(app, 'card-view');
  click(app, 'list-view');
  assert.equal(meaningHidden(app, 'meaning-0'), true, 'Changing layout clears the transient answer');
  activate(app, { speak: 'meaning-0', listWord: 'meaning-0' });
  app.run('applyDictionary("de"); applyDictionary("fr")');
  assert.equal(meaningHidden(app, 'meaning-0'), true, 'Changing dictionaries clears the transient answer');

  change(app, 'hide-list-meanings', false);
  assert.equal(meaningHidden(app, 'meaning-0'), false);
  assert.equal(meaningHidden(app, 'meaning-1'), false);
  change(app, 'hide-list-meanings', true);
  change(app, 'appearance', 'light');
  assert.equal(effectiveTheme(app), 'light');
  const saved = JSON.parse(app.store.get(settingsKey));
  assert.equal(saved.appearance, 'light');
  assert.equal(saved.hideListMeanings, true);
  assert(!Object.keys(saved).some((key) => /revealed/i.test(key)), 'Revealed rows are never persisted');
  const reopened = context({ words, url, dark: true, storage: Object.fromEntries(app.store) });
  assert.equal(effectiveTheme(reopened), 'light', 'An explicit light preference overrides a dark OS');
  assert.equal(meaningHidden(reopened, 'meaning-0'), true, 'A reload hides the previous answer');
  change(reopened, 'appearance', 'system');
  assert.equal(effectiveTheme(reopened), 'dark');
  reopened.ctx.matchMedia('(prefers-color-scheme: dark)').change(false);
  assert.equal(effectiveTheme(reopened), 'light', 'System appearance follows a live OS change');
  change(reopened, 'appearance', 'dark');
  reopened.ctx.matchMedia('(prefers-color-scheme: dark)').change(false);
  assert.equal(effectiveTheme(reopened), 'dark', 'OS changes cannot override an explicit choice');
  const incoming = { ...JSON.parse(reopened.store.get(settingsKey)), appearance: 'light' };
  for (const handler of reopened.listeners.storage || [])
    handler({ key: settingsKey, newValue: JSON.stringify(incoming) });
  assert.equal(effectiveTheme(reopened), 'light', 'Another tab’s appearance applies immediately');

  const lookup = make({ hideListMeanings: true }, { url: 'http://localhost/?screen=dictionary' });
  assert.equal(meaningHidden(lookup, 'meaning-0'), false, 'Dictionary lookup always shows definitions');
  const invalid = make({ appearance: 'invalid', hideListMeanings: 'true' });
  assert.equal(invalid.run('settings.appearance'), 'system');
  assert.equal(invalid.run('settings.hideListMeanings'), false);

  click(app, 'export-progress');
  const backup = JSON.parse(await app.downloads.at(-1).text());
  assert.equal(backup.settings.appearance, 'light');
  assert.equal(backup.settings.hideListMeanings, true);
  await upload(app, 'import-progress', {
    ...backup,
    settings: { ...backup.settings, appearance: 'dark', hideListMeanings: false },
  });
  assert.equal(effectiveTheme(app), 'dark', 'Restored appearance applies immediately');
  assert.equal(app.$('appearance').value, 'dark');
  assert.equal(meaningHidden(app, 'meaning-0'), false);
  console.log('Appearance overrides, system changes, backup persistence and single-word list reveal passed.');
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
