const { context, read, upload, click, assert } = require('./helpers/app.cjs');
const { harness, record, snapshot, tick, token, deviceA, deviceB } = require('./progress-sync.cjs');
const deletion = (wordID, deleted, clock = 1, deviceID = deviceA, dictionaryID = 'fr') => ({
  dictionaryID,
  wordID,
  deleted,
  clock,
  deviceID,
});
const key = 'mots.deletions.metadata.v1';
const metadata = (fixture) => JSON.parse(fixture.store.get(key));

async function run() {
  const pure = harness(),
    api = pure.deletionsAPI;
  const tied = api.merge([deletion('a', false, 10, deviceA)], [deletion('a', true, 10, deviceB)]);
  assert.equal(tied[0].deleted, true);
  assert.equal(
    api.merge([deletion('a', false)], [deletion('a', true)])[0].deleted,
    true,
    'Equal clock/device ties deterministically prefer deletion',
  );
  for (const invalid of [
    { ...deletion('a', true), deleted: 1 },
    { ...deletion('a', true), deleted: 'true' },
    { ...deletion('a', true), deviceID: '' },
    { ...deletion('a', true), clock: true },
    { ...deletion('a', true), clock: -1 },
    { ...deletion('a', true), clock: Number.MAX_SAFE_INTEGER + 1 },
    { ...deletion('a', true), extra: true },
    { ...deletion('__proto__', true) },
    { ...deletion('a', true), wordID: '\ud800' },
  ])
    assert.throws(() => api.validateSnapshot(snapshot([deletion('valid', false), invalid])));
  assert.throws(() => api.validateSnapshot({ version: 1, records: [], extra: true }));
  assert.equal(
    api.merge([deletion('é', true), deletion('e\u0301', false)]).length,
    2,
    'Unicode IDs preserve their exact identity',
  );
  const fullStore = new Map([
    [
      key,
      JSON.stringify({
        version: 1,
        deviceID: deviceA,
        counter: 0,
        records: Array.from({ length: 100000 }, (_, index) =>
          deletion(`existing-${index}`, true, 0),
        ),
      }),
    ],
  ]);
  const full = api.create({
    storage: {
      getItem: (name) => fullStore.get(name) ?? null,
      setItem: (name, value) => fullStore.set(name, value),
    },
  });
  const fullBefore = fullStore.get(key);
  assert.throws(
    () => full.validateImport([deletion('one-extra', false)]),
    'Backup preflight rejects union capacity before changing progress or content',
  );
  assert.equal(fullStore.get(key), fullBefore);

  let progressRemote = [],
    deletionRemote = [],
    pendingDeletion = null,
    failDeletion = false;
  const paired = harness({
    transport: async (route, _token, body) => {
      if (route === 'create') return { version: 1, code: token };
      if (route === 'exchange') {
        progressRemote = paired.api.merge(progressRemote, paired.api.validateSnapshot(body));
        return snapshot(progressRemote);
      }
      assert.equal(route, 'deletions');
      if (failDeletion) throw new Error('unsupported-deletions');
      deletionRemote = api.merge(deletionRemote, api.validateSnapshot(body));
      if (pendingDeletion)
        return new Promise((resolve) => {
          pendingDeletion = resolve;
        });
      return snapshot(deletionRemote);
    },
  });
  assert(await paired.engine.createPairing());
  assert.deepEqual(
    paired.requests.slice(0, 3).map((request) => request[0]),
    ['create', 'exchange', 'deletions'],
  );
  paired.engine.edit('fr', 'a', 2);
  paired.engine.editDeletions([{ dictionaryID: 'fr', wordID: 'a', deleted: true }]);
  pendingDeletion = true;
  const inFlight = paired.engine.syncNow();
  await tick();
  assert.equal(typeof pendingDeletion, 'function');
  paired.engine.editDeletions([{ dictionaryID: 'fr', wordID: 'a', deleted: false }]);
  pendingDeletion(snapshot(deletionRemote));
  pendingDeletion = null;
  await inFlight;
  assert.equal(
    metadata(paired).records[0].deleted,
    false,
    'A restore during request survives the older deletion response',
  );
  assert.equal(paired.engine.state().phase, 'pending');
  await paired.engine.syncNow();
  assert.equal(paired.engine.state().phase, 'synced');
  assert.equal(deletionRemote[0].deleted, false);
  assert.equal(
    paired.metadata().records.find((entry) => entry.wordID === 'a').level,
    2,
    'Delete/restore never changes familiarity',
  );
  failDeletion = true;
  assert.equal(await paired.engine.syncNow(), false);
  assert.equal(
    paired.engine.state().phase,
    'unsupported',
    'Missing deletion endpoint cannot claim synchronized progress',
  );
  failDeletion = false;
  pendingDeletion = true;
  const disconnecting = paired.engine.syncNow();
  await tick();
  paired.engine.disconnect();
  pendingDeletion(snapshot([deletion('must-not-apply', true, 999)]));
  pendingDeletion = null;
  await disconnecting;
  assert(
    !metadata(paired).records.some((entry) => entry.wordID === 'must-not-apply'),
    'Disconnect invalidates the second channel response too',
  );

  const badJoin = harness({
    transport: async (route) =>
      route === 'exchange'
        ? snapshot([record('a', 3, 100)])
        : snapshot([{ ...deletion('b', true), deleted: 1 }]),
  });
  badJoin.engine.edit('fr', 'a', 1);
  const progressBefore = JSON.stringify(badJoin.metadata()),
    deletionsBefore = JSON.stringify(metadata(badJoin));
  assert.equal(await badJoin.engine.join(token), false);
  assert.equal(
    badJoin.engine.state().connected,
    false,
    'Pairing commits only after both channels validate',
  );
  assert.equal(
    JSON.stringify(badJoin.metadata()),
    progressBefore,
    'Invalid deletion snapshot cannot partly apply the progress snapshot',
  );
  assert.equal(JSON.stringify(metadata(badJoin)), deletionsBefore);

  const shared = new Map(),
    tabA = harness({ store: shared }),
    tabB = harness({ store: shared });
  const baseline = shared.get(key);
  tabA.engine.editDeletions([{ dictionaryID: 'fr', wordID: 'a', deleted: true }]);
  const valueA = shared.get(key);
  shared.set(key, baseline);
  tabB.engine.editDeletions([{ dictionaryID: 'de', wordID: 'b', deleted: false }]);
  const valueB = shared.get(key);
  tabA.engine.handleStorage({ key, newValue: valueB });
  tabB.engine.handleStorage({ key, newValue: valueA });
  assert.equal(
    metadata(tabA).records.length,
    2,
    'Cross-tab racing writes retain different-word and false records',
  );
  const repaired = shared.get(key),
    writes = tabA.writes();
  tabA.engine.handleStorage({ key, newValue: repaired });
  assert.equal(tabA.writes(), writes, 'Deletion storage repair is idempotent');
  const oldDevice = metadata(tabA).deviceID;
  assert.equal(
    metadata(harness({ store: shared })).deviceID,
    oldDevice,
    'Deletion installation identity persists',
  );
  tabA.engine.editDeletions([deletion('a', false, 500, deviceB)], true);
  const importedRecord = metadata(tabA).records.find((entry) => entry.wordID === 'a');
  assert(
    importedRecord.clock > 500 && importedRecord.deviceID === oldDevice && !importedRecord.deleted,
    'Backup import restamps above all observed incoming clocks using local identity',
  );
  assert(metadata(tabA).records.some((entry) => entry.dictionaryID === 'de' && !entry.deleted));

  let fail = false;
  const quota = harness({ failWrite: () => fail });
  assert(await quota.engine.join(token));
  fail = true;
  assert.equal(
    quota.engine.editDeletions([{ dictionaryID: 'fr', wordID: 'unsaved', deleted: true }]),
    false,
  );
  const beforeRequests = quota.requests.length;
  assert.equal(await quota.engine.syncNow(), false);
  assert.equal(
    quota.requests.length,
    beforeRequests,
    'Unsaved deletion metadata prevents any upload',
  );

  const app = context({
    source: true,
    url: 'file:///tmp/Mots.html?screen=dictionary',
    storage: { 'mots.progress.v1': { a: 2 } },
  });
  const originalSources = app.run('JSON.stringify(banks)');
  assert(app.$('study-content').innerHTML.includes('data-delete="a"'));
  app.run("changeDeletion('fr', 'a', true)");
  assert.equal(app.run('sourceWords().length'), 3);
  assert.equal(app.run('words().length'), 2);
  assert.equal(app.run("levelOf('a')"), 2);
  assert.equal(
    app.run('JSON.stringify(banks)'),
    originalSources,
    'Deleting leaves source content and IDs byte-for-byte unchanged',
  );
  assert.equal(
    app.$('deletion-notice').hidden,
    false,
    'Undo remains available without a short timeout',
  );
  assert(!app.$('study-content').innerHTML.includes('data-row-word="a"'));
  assert.equal(app.run("vocabularyForExport('all').some(word => word.id === 'a')"), false);
  click(app, 'undo-deletion');
  assert.equal(app.run('words().length'), 3);
  assert.equal(app.run("levelOf('a')"), 2);
  assert.equal(app.run('JSON.stringify(banks)'), originalSources);
  app.run("speak('same')");
  assert.equal(app.$('pronunciation-player').src, 'audio/old-book.m4a');
  app.run("changeDeletion('fr','same',true)");
  assert.equal(
    app.$('pronunciation-player').src,
    undefined,
    'Deleting a word stops and unloads its audio',
  );
  app.run(
    "changeDeletion('fr','same',true); changeDeletion('fr','a',true); changeDeletion('fr','b',true)",
  );
  assert(
    app.$('study-content').innerHTML.includes('restore-deleted'),
    'An all-deleted dictionary points to permanent recovery',
  );
  app.run("settingsPanel.open('settings-library')");
  assert(app.$('deleted-word-list').innerHTML.includes('年齡'));
  app.run("changeDeletion('fr', 'a', false)");
  assert.equal(app.run('words().length'), 1);
  click(app, 'export-progress');
  const backup = JSON.parse(await app.downloads.at(-1).text());
  assert.equal(backup.version, 3);
  assert.equal(backup.deletions.length, 3);
  assert(backup.deletions.some((entry) => entry.deleted === false));
  assert(!JSON.stringify(backup).includes(token));
  const beforeInvalid = JSON.stringify({
    store: [...app.store],
    banks: app.run('JSON.stringify(banks)'),
  });
  await upload(app, 'import-progress', {
    app: 'mots',
    version: 3,
    progress: { fr: { a: 3 } },
    deletions: [{ ...deletion('a', true), deleted: 'true' }],
  });
  assert.equal(
    JSON.stringify({ store: [...app.store], banks: app.run('JSON.stringify(banks)') }),
    beforeInvalid,
    'Invalid deletion backup is all-or-nothing, including unrelated ratings',
  );
  await upload(app, 'import-progress', {
    app: 'mots',
    version: 3,
    progress: { fr: { a: 3 } },
    deletions: [deletion('a', true, Number.MAX_SAFE_INTEGER)],
  });
  assert.equal(
    JSON.stringify({ store: [...app.store], banks: app.run('JSON.stringify(banks)') }),
    beforeInvalid,
    'An unstampable maximum clock fails before any backup field commits',
  );
  await upload(app, 'import-progress', { app: 'mots', version: 1, ratings: { same: 3 } });
  assert.equal(
    app.run("deletionState.isDeleted('fr','same')"),
    true,
    'Old backups without deletions never resurrect removed words',
  );
  await upload(app, 'import-progress', {
    app: 'mots',
    version: 3,
    progress: {},
    deletions: [
      deletion('same', false, 800, deviceB),
      deletion('unknown', true, 801, deviceB, 'future'),
    ],
  });
  assert.equal(app.run("deletionState.isDeleted('fr','same')"), false);
  assert(
    metadata(app).records.every(
      (entry) => !['same', 'unknown'].includes(entry.wordID) || entry.clock > 801,
    ),
  );
  assert(
    metadata(app).records.some((entry) => entry.dictionaryID === 'future'),
    'Unknown deletion identities survive backup restore',
  );
  app.run("changeDeletion('fr','same',true)");
  await upload(app, 'import-dictionary', {
    language: 'fr',
    title: '獨立詞庫',
    words: [{ id: 'same', term: 'autre', meanings: { 'zh-Hant': '其他' } }],
  });
  assert.equal(
    app.run('words().length'),
    1,
    'A fresh dictionary identity does not inherit deletion of the same source word ID',
  );
  assert.equal(app.run("deletionState.isDeleted('fr','same')"), true);

  const review = context({ source: true, url: 'file:///tmp/Mots.html?screen=review' });
  const captured = read(review, 'reviewSession.ids');
  const removed = captured[1];
  review.ctx.__removed = removed;
  review.run("changeDeletion('fr', __removed, true)");
  assert.deepEqual(
    read(review, 'reviewSession.ids'),
    captured.filter((id) => id !== removed),
    'Deletion removes only its captured member',
  );
  review.run("changeDeletion('fr', __removed, false)");
  assert.deepEqual(
    read(review, 'reviewSession.ids'),
    captured.filter((id) => id !== removed),
    'Restore never inserts a word into the active review',
  );

  const pendingNotice = context({
    source: true,
    url: 'file:///tmp/Mots.html?screen=study&view=list',
  });
  const publishDeletion = (entry) => {
    const current = metadata(pendingNotice);
    current.counter = Math.max(current.counter, entry.clock);
    current.records.push(entry);
    const newValue = JSON.stringify(current);
    pendingNotice.store.set(key, newValue);
    for (const handler of pendingNotice.listeners.storage) handler({ key, newValue });
  };
  pendingNotice.run("changeDeletion('fr','a',true)");
  publishDeletion(deletion('a', false, 100, deviceB));
  assert.equal(
    pendingNotice.$('deletion-notice').hidden,
    true,
    'A remote restore clears the obsolete deleted-word notice',
  );
  assert.equal(
    pendingNotice.run('deletionUndo'),
    null,
    'Remote restore also removes the obsolete undo action',
  );
  pendingNotice.run("changeDeletion('fr','same',true)");
  publishDeletion(deletion('same', false, 101, deviceB, 'de'));
  assert.equal(
    pendingNotice.$('deletion-notice').hidden,
    false,
    'A same-word restore in another dictionary does not clear the pending undo',
  );
  pendingNotice.run("applyDictionary('de')");
  assert.equal(pendingNotice.$('deletion-notice').hidden, false);
  publishDeletion(deletion('same', false, 102, deviceB));
  assert.equal(
    pendingNotice.$('deletion-notice').hidden,
    true,
    'The pending dictionary restore clears its notice even while another dictionary is selected',
  );
  assert.equal(pendingNotice.run('deletionUndo'), null);

  const many = Array.from({ length: 21 }, (_, index) => ({
    id: `w${index}`,
    french: `mot${index}`,
    chinese: `詞${index}`,
    category: '1',
    subcategory: '1.01',
    example: '',
  }));
  const paged = context({
    source: true,
    words: many,
    url: 'file:///tmp/Mots.html?screen=study&view=list&size=20&page=2',
  });
  paged.run("changeDeletion('fr','w20',true)");
  assert.equal(paged.run('state.page'), 1, 'Deleting the sole final-page word clamps pagination');
  assert.equal(
    paged.run('deck[state.index].id'),
    'w19',
    'Deleting the final word selects its preceding boundary',
  );
  paged.run("state.order='random'; buildDeck(true, true)");
  const shuffled = paged.run('JSON.stringify(randomOrder)');
  paged.run("changeDeletion('fr','w1',true); changeDeletion('fr','w1',false)");
  assert.equal(
    paged.run('JSON.stringify(randomOrder)'),
    shuffled,
    'Delete and restore do not reshuffle a deck',
  );
  for (const word of many) {
    paged.ctx.__id = word.id;
    paged.run("changeDeletion('fr',__id,true)");
  }
  assert.equal(
    (paged.$('deleted-word-list').innerHTML.match(/data-restore=/g) || []).length,
    20,
    'Recovery is bounded to 20 entries per page',
  );
  assert(paged.$('deleted-word-list').innerHTML.includes('data-deleted-page="1"'));
  console.log(
    'Reversible deletion, persistent undo, source/rating preservation, recovery, bounded paging, review/random state, backup validation/restamping, dual-channel sync races and cross-tab convergence passed.',
  );
}
run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
