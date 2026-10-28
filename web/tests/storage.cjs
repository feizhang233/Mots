const { context, read, upload, click, assert } = require('./helpers/app.cjs');
const fs = require('node:fs');
const path = require('node:path');

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
  const sourceHTML = fs.readFileSync(path.join(__dirname, '../src/index.html'), 'utf8');
  const settingsStart = sourceHTML.indexOf('id="settings-dialog"');
  const settingsEnd = sourceHTML.indexOf('</dialog>', settingsStart);
  for (const id of [
    'import-dictionary',
    'download-dictionary-template',
    'dictionary-template-preview',
  ]) {
    const position = sourceHTML.indexOf(`id="${id}"`);
    assert(position > settingsStart && position < settingsEnd, `${id} belongs only to settings`);
    assert.equal(sourceHTML.split(`id="${id}"`).length, 2, `${id} has one canonical location`);
  }

  // The visible example and the downloaded file must stay identical and importable
  // for vocabulary, ordinary grammar and empty thematic books in every language.
  for (const bookID of [
    'fr',
    'de',
    'ja',
    'grammar-fr',
    'grammar-de',
    'grammar-ja',
    'grammar-theme-fr',
    'grammar-theme-de',
    'grammar-theme-ja',
  ]) {
    const example = context({ source: true });
    example.run(
      `applyDictionary(${JSON.stringify(bookID)}); settingsPanel.open('settings-library')`,
    );
    const preview = JSON.parse(example.$('dictionary-template-preview').textContent);
    const originalBook = read(example, 'dictionaryOf(state.dictionary)');
    assert.equal(preview.language, originalBook.language);
    assert.equal(preview.kind, originalBook.kind || 'vocabulary');
    assert.equal(preview.grammarMode, originalBook.grammarMode || 'standard');
    assert.equal(preview.words.length, 1);
    click(example, 'download-dictionary-template');
    const downloaded = JSON.parse(await example.downloads.at(-1).text());
    assert.deepEqual(downloaded, preview, `${bookID} preview matches the actual download`);
    assert.equal(example.$('settings-library').open, true);
    assert(
      example.$('dictionary-message').textContent,
      'Template download keeps feedback in settings',
    );
    const beforeImport = read(example, `progress[${JSON.stringify(bookID)}]`);
    await upload(example, 'import-dictionary', downloaded);
    const importedBook = read(example, 'dictionaryOf(state.dictionary)');
    assert.notEqual(importedBook.id, bookID);
    assert.equal(importedBook.language, originalBook.language);
    assert.equal(importedBook.kind, originalBook.kind || 'vocabulary');
    assert.equal(importedBook.grammarMode, originalBook.grammarMode || 'standard');
    assert.equal(importedBook.words[0].term, preview.words[0].term);
    assert.deepEqual(read(example, `progress[${JSON.stringify(bookID)}]`), beforeImport);
    assert.equal(example.run('dictionaryLibrary.length'), 1);
    assert.equal(example.$('settings-library').open, true);
    assert(example.$('dictionary-message').textContent.includes('已建立'));
  }

  const pending = context({ source: true });
  pending.run("settingsPanel.open('settings-library')");
  const pendingInput = pending.$('import-dictionary');
  let finishRead;
  const delayedText = new Promise((resolve) => {
    finishRead = resolve;
  });
  pendingInput.value = 'pending.json';
  pendingInput.files = [{ size: 200, name: 'pending.json', text: () => delayedText }];
  const importHandler = pendingInput.events.change[0];
  const reading = importHandler({ target: pendingInput });
  assert.equal(pendingInput.disabled, true, 'Pending import disables repeated selection');
  assert.equal(pendingInput.getAttribute('aria-busy'), 'true');
  assert.equal(pending.run('dictionaryLibrary.length'), 0, 'Validation precedes mutation');
  await importHandler({ target: pendingInput });
  finishRead(
    JSON.stringify({
      title: '讀取中測試',
      language: 'fr',
      words: [{ term: 'essai', meanings: { 'zh-Hant': '測試' } }],
    }),
  );
  await reading;
  assert.equal(pending.run('dictionaryLibrary.length'), 1, 'Repeated events cannot import twice');
  assert.equal(pendingInput.disabled, false);
  assert.equal(pendingInput.getAttribute('aria-busy'), null);
  assert.equal(pendingInput.getAttribute('aria-invalid'), 'false');
  assert.equal(pendingInput.value, '');

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
  const fire = (key, value) => {
    const newValue = JSON.stringify(value);
    // A real storage event is delivered after the shared localStorage value changes.
    synced.store.set(key, newValue);
    synced.listeners.storage[0]({ key, newValue });
  };
  const fireRating = (dictionaryID, wordID, level) => {
    const metadata = JSON.parse(synced.store.get('mots.sync.metadata.v1'));
    metadata.counter++;
    metadata.records = metadata.records.filter(
      (record) => record.dictionaryID !== dictionaryID || record.wordID !== wordID,
    );
    metadata.records.push({
      dictionaryID,
      wordID,
      level,
      clock: metadata.counter,
      deviceID: metadata.deviceID,
    });
    fire('mots.sync.metadata.v1', metadata);
  };
  // Current clients publish their versioned edit before its legacy progress projection.
  fireRating('dict-old', 'same', 3);
  fire('mots.progress.dictionary.dict-old.v1', { same: 1 });
  assert.equal(synced.run('progress["dict-old"].same'), 3);
  assert.equal(synced.run('progress.fr.same'), 2);
  fireRating('fr', 'same', 1);
  fire('mots.progress.v1', { same: 2 });
  assert.equal(synced.run('progress.fr.same'), 1);
  assert.equal(synced.run('progress["dict-old"].same'), 3);
  fire('mots.dictionaries.v1', [...library, { ...library[0], id: 'dict-other', title: '另一部' }]);
  assert(synced.run('dictionaryIDs().includes("dict-other")'));
  fire('mots.settings.v2', { dictionaryId: 'dict-other', view: 'list' });
  assert.equal(synced.run('state.dictionary'), 'dict-other');
  assert.equal(synced.run('categories[0].id'), 'x');
  fireRating('dict-other', 'same', 2);
  fire('mots.progress.dictionary.dict-other.v1', { same: 3 });
  assert.equal(synced.run("levelOf('same')"), 2);

  // Disclosure state must preserve entry points, feedback visibility, and private-code hiding.
  const grouped = context({ source: true });
  grouped.run('settingsPanel.open()');
  assert(
    grouped.run('MotsSettingsPanel.groupIDs.every(id => !$(id).open)'),
    'Ordinary settings entry starts with a short collapsed index',
  );
  grouped.run(
    "settingsPanel.openGroup('settings-sync'); $('sync-private-code').type = 'text'; $('sync-join-code').value = 'private-input'",
  );
  grouped.$('settings-learning').open = true;
  for (const handler of grouped.$('settings-learning').events.toggle) handler();
  assert.equal(
    grouped.$('settings-sync').open,
    false,
    'Opening another disclosure closes the prior group without native name support',
  );
  assert.equal(grouped.$('sync-private-code').type, 'password');
  assert.equal(
    grouped.$('sync-join-code').value,
    '',
    'Collapsing sync clears a pasted private code',
  );
  grouped.run(
    "settingsPanel.openGroup('settings-library'); settingsPanel.render(); settingsPanel.renderSync({phase:'offline', connected:false, available:true, busy:false, persistenceError:false})",
  );
  assert.equal(
    grouped.$('settings-library').open,
    true,
    'Ordinary render and background sync never move the current disclosure',
  );
  assert.equal(grouped.$('settings-sync').open, false);
  assert.equal(grouped.$('settings-sync-summary').textContent, '離線，稍後重試');
  grouped.run("settingsPanel.openGroup('settings-backup')");
  const beforeInvalidDictionary = snapshot(grouped);
  await upload(grouped, 'import-dictionary', {}, { raw: '{' });
  assert.equal(
    snapshot(grouped),
    beforeInvalidDictionary,
    'Malformed JSON preserves all dictionary data',
  );
  assert.equal(
    grouped.$('settings-library').open,
    true,
    'An asynchronous import failure reveals its feedback group',
  );
  assert.equal(grouped.$('settings-backup').open, false);
  assert(grouped.$('dictionary-message').textContent.includes('JSON'));
  assert.equal(grouped.$('import-dictionary').getAttribute('aria-invalid'), 'true');
  assert.equal(grouped.$('import-dictionary').disabled, false, 'A failed read can be retried');
  for (const [invalidDictionary, options] of [
    [
      { language: 'fr', words: [{ term: 'essai', meanings: { 'zh-Hant': '測試' } }] },
      { size: 2 * 1024 * 1024 + 1 },
    ],
    [
      {
        title: '無效辭典',
        language: 'invalid',
        words: [{ term: 'essai', meanings: { 'zh-Hant': '測試' } }],
      },
      {},
    ],
    [
      {
        title: '重複詞條',
        language: 'fr',
        words: [
          { id: 'same', term: 'un', meanings: { 'zh-Hant': '一' } },
          { id: 'same', term: 'deux', meanings: { 'zh-Hant': '二' } },
        ],
      },
      {},
    ],
  ]) {
    const beforeInvalid = snapshot(grouped);
    await upload(grouped, 'import-dictionary', invalidDictionary, options);
    assert.equal(
      snapshot(grouped),
      beforeInvalid,
      'Invalid dictionary selection cannot partially change data',
    );
    assert.equal(grouped.$('settings-library').open, true);
    assert(
      grouped.$('dictionary-message').textContent,
      'Invalid selection has recoverable inline feedback',
    );
  }
  await upload(grouped, 'import-progress', {}, { raw: '{' });
  assert.equal(grouped.$('settings-backup').open, true, 'Restore errors reveal the backup group');
  assert(grouped.$('backup-message').textContent.includes('JSON'));
  grouped.run("settingsPanel.openGroup('settings-library')");
  click(grouped, 'export-progress');
  assert.equal(
    grouped.$('settings-backup').open,
    true,
    'Export success stays visible in its owning group',
  );
  grouped.$('settings-dialog').close();
  for (const handler of grouped.$('settings-dialog').events.close) handler();
  grouped.run('settingsPanel.open()');
  assert(
    grouped.run('MotsSettingsPanel.groupIDs.every(id => !$(id).open)'),
    'Reopening settings restores the collapsed index',
  );

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
