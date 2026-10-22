const { context, read, upload, click, assert } = require('./helpers/app.cjs');

const library = [
  {
    id: 'dict-old',
    title: '原有辭典',
    language: 'fr',
    categories: [{ id: 'x', name: '自訂', subcategories: [{ id: 'x.1', name: '詞條' }] }],
    words: [
      {
        id: 'same',
        term: 'ancien',
        meanings: { 'zh-Hant': '舊詞' },
        example: 'Un mot.',
        category: 'x',
        subcategory: 'x.1',
      },
    ],
  },
];
const baseStorage = {
  'mots.dictionaries.v1': library,
  'mots.progress.v1': { same: 2, a: 1 },
  'mots.progress.de.v1': { unknown: 2 },
  'mots.progress.dictionary.dict-old.v1': { same: 1 },
  'mots.settings.v2': {
    dictionaryId: 'dict-old',
    view: 'card',
    meaningLanguage: 'en',
    pageSize: 50,
    visibility: { fr: [3], 'dict-old': [1] },
  },
};
const snapshot = (app) =>
  JSON.stringify({
    store: [...app.store],
    runtime: read(app, '({ dictionaryLibrary, customBanks, progress, settings, state })'),
  });

async function run() {
  const imported = context({
    storage: baseStorage,
    url: 'http://localhost/Mots.html?screen=study&dict=dict-old',
  });
  await upload(imported, 'import-dictionary', {
    id: 'dict-old',
    title: '另一部法語',
    language: 'fr',
    words: [{ id: 'same', term: 'nouveau', meanings: { 'zh-Hant': '新詞' } }],
  });
  const newID = imported.run('state.dictionary');
  assert.match(newID, /^dict-/);
  assert.notEqual(newID, 'dict-old', 'Import must create a separate dictionary identity');
  assert.equal(imported.run('state.screen'), 'study', 'Import retains the current view');
  assert.equal(imported.run('dictionaryLibrary.length'), 2);
  assert.equal(imported.run("levelOf('same')"), 0);
  imported.run("rate('same', 3)");
  assert.equal(JSON.parse(imported.store.get(`mots.progress.dictionary.${newID}.v1`)).same, 3);
  assert.equal(JSON.parse(imported.store.get('mots.progress.dictionary.dict-old.v1')).same, 1);
  assert.equal(JSON.parse(imported.store.get('mots.progress.v1')).same, 2);

  const v1 = context({ storage: baseStorage });
  await upload(v1, 'import-progress', {
    app: 'mots',
    version: 1,
    ratings: { same: 3, a: 0, unrecognized: 2 },
  });
  assert.equal(v1.run('progress.fr.same'), 3);
  assert.equal(v1.run('progress.fr.a'), 0);
  assert.equal(v1.run('progress["dict-old"].same'), 1);
  assert.equal(v1.run('dictionaryLibrary.length'), 1);
  assert.equal(v1.run('settings.dictionaryId'), 'dict-old');
  assert.equal(v1.run('settings.meaningLanguage'), 'en');

  const v2 = context({ storage: baseStorage });
  await upload(v2, 'import-progress', {
    app: 'mots',
    version: 2,
    progress: { fr: { same: 3, 'custom-fr-extra': 2 } },
    customBanks: {
      fr: [
        {
          id: 'custom-fr-extra',
          term: 'maison',
          category: '2',
          subcategory: '2.01',
          meanings: { 'zh-Hant': '房屋' },
        },
      ],
    },
    settings: { studyLanguage: 'fr', view: 'list', meaningLanguage: 'zh-Hant', pageSize: 20 },
  });
  assert.equal(v2.run('progress.fr.same'), 3);
  assert.equal(v2.run('progress.fr.a'), 1);
  assert.equal(v2.run('progress.fr["custom-fr-extra"]'), 2);
  assert.equal(v2.run('customBanks.fr[0].category'), '2');
  assert.equal(v2.run('customBanks.fr[0].subcategory'), '2.01');
  assert.equal(v2.run('progress["dict-old"].same'), 1);
  assert.equal(v2.run('dictionaryLibrary.length'), 1);
  assert.equal(v2.run('state.dictionary'), 'fr');

  // Capture an actual export, then import it into a distinct existing library.
  click(imported, 'export-progress');
  assert.equal(imported.downloads.length, 1);
  const backup = JSON.parse(await imported.downloads[0].text());
  assert.equal(backup.version, 3);
  assert.equal(backup.dictionaries.length, 2);
  const restored = context({ storage: { 'mots.progress.v1': { b: 1 } } });
  await upload(restored, 'import-progress', backup);
  assert.equal(restored.run('dictionaryLibrary.length'), 2);
  assert.equal(restored.run('state.dictionary'), newID);
  assert.equal(restored.run('progress.fr.b'), 1);
  assert.equal(restored.run(`progress[${JSON.stringify(newID)}].same`), 3);
  assert.equal(restored.run('progress["dict-old"].same'), 1);

  const corrupt = context({ storage: baseStorage });
  const invalidBackups = [
    {
      app: 'mots',
      version: 3,
      dictionaries: [{ ...library[0], title: 'Changed' }],
      progress: { 'dict-old': [] },
    },
    {
      app: 'mots',
      version: 3,
      dictionaries: [{ ...library[0], words: [{ ...library[0].words[0], category: 'missing' }] }],
      progress: {},
    },
    {
      app: 'mots',
      version: 2,
      customBanks: { fr: [{ term: 'bad' }] },
      progress: { fr: { same: 3 } },
    },
  ];
  for (const backup of invalidBackups) {
    const before = snapshot(corrupt);
    await upload(corrupt, 'import-progress', backup);
    assert.equal(snapshot(corrupt), before, 'An invalid backup must not partially mutate data');
    assert(corrupt.$('backup-message').textContent);
  }
  const beforeLarge = snapshot(corrupt);
  await upload(corrupt, 'import-progress', {}, { size: 50 * 1024 * 1024 + 1 });
  assert.equal(snapshot(corrupt), beforeLarge);
  assert(corrupt.$('backup-message').textContent.includes('50 MB'));

  const synced = context({ storage: baseStorage });
  const fire = (key, value) =>
    synced.listeners.storage[0]({ key, newValue: JSON.stringify(value) });
  fire('mots.progress.dictionary.dict-old.v1', { same: 3 });
  assert.equal(synced.run('progress["dict-old"].same'), 3);
  assert.equal(synced.run('progress.fr.same'), 2);
  fire('mots.progress.v1', { same: 1 });
  assert.equal(synced.run('progress.fr.same'), 1);
  assert.equal(synced.run('progress["dict-old"].same'), 3);
  fire('mots.dictionaries.v1', [...library, { ...library[0], id: 'dict-other', title: '另一部' }]);
  assert(synced.run('dictionaryIDs().includes("dict-other")'));
  fire('mots.settings.v2', { dictionaryId: 'dict-other', view: 'list' });
  assert.equal(synced.run('state.dictionary'), 'dict-other');
  assert.equal(synced.run('categories[0].id'), 'x');
  fire('mots.progress.dictionary.dict-other.v1', { same: 2 });
  assert.equal(synced.run("levelOf('same')"), 2);

  const quota = context();
  quota.ctx.localStorage.setItem = () => {
    throw new Error('quota');
  };
  await upload(quota, 'import-dictionary', {
    title: '容量測試',
    language: 'fr',
    words: [{ term: 'essai', meanings: { 'zh-Hant': '測試' } }],
  });
  assert.equal(quota.run('dictionaryLibrary.length'), 1);
  assert.equal(quota.run('state.screen'), 'home');
  assert(quota.run('storageFailures.size') > 0);
  assert(quota.$('save-state').innerHTML.includes('請備份'));
  assert(quota.$('dictionary-message').textContent.includes('僅暫存'));
  console.log(
    'Dictionary imports, v1/v2/v3 backups, atomic validation, storage events, and quota feedback passed.',
  );
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
