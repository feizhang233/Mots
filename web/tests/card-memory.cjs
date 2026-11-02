const { context, read, upload, click, assert } = require('./helpers/app.cjs');

const memoryKey = 'mots.memory.v1';
const words = [
  { id: 'same', french: 'zèbre', chinese: '斑馬', category: '1', subcategory: '1.01' },
  { id: 'a', french: 'âge', chinese: '年齡', category: '1', subcategory: '1.01' },
  { id: 'b', french: 'bonjour', chinese: '你好', category: '2', subcategory: '2.01' },
  { id: 'unseen', french: 'demain', chinese: '明天', category: '1', subcategory: '1.01' },
  { id: 'mastered', french: 'hier', chinese: '昨天', category: '2', subcategory: '2.01' },
];
const make = (options = {}) =>
  context({
    source: true,
    random: () => 0.999999999,
    words,
    ...options,
    storage: {
      'mots.progress.v1': { same: 2, a: 1, b: 2, mastered: 3 },
      ...options.storage,
    },
  });
const ids = (app) => read(app, 'memorySession?.ids || []');
const record = (app, id = 'same') => read(app, `memoryRecords.fr?.[${JSON.stringify(id)}] || null`);
const answer = (app, id, remembered) =>
  app.run(`state.revealed = true; answerMemory(${JSON.stringify(id)}, ${remembered})`);
const expire = (app, id = 'same') =>
  app.run(`{
    const previous = memoryRecords.fr[${JSON.stringify(id)}];
    const interval = previous.dueAt - previous.updatedAt;
    previous.dueAt = Date.now() - 1;
    previous.updatedAt = previous.dueAt - interval;
    write(memoryKey, memoryRecords);
  }`);
const fireStorage = (app, key, value) => {
  const newValue = JSON.stringify(value);
  app.store.set(key, newValue);
  for (const handler of app.listeners.storage || []) handler({ key, newValue });
};
const remoteRating = (app, wordID, level) => {
  const metadata = JSON.parse(app.store.get('mots.sync.metadata.v1'));
  metadata.counter++;
  metadata.records = metadata.records.filter(
    (entry) => entry.dictionaryID !== 'fr' || entry.wordID !== wordID,
  );
  metadata.records.push({
    dictionaryID: 'fr', wordID, level,
    clock: metadata.counter, deviceID: metadata.deviceID,
  });
  fireStorage(app, 'mots.sync.metadata.v1', metadata);
};

async function run() {
  const scoped = make({
    storage: {
      'mots.settings.v2': { visibility: { fr: [0, 1, 2, 3] }, view: 'list' },
    },
  });
  scoped.run('showMemory()');
  assert.deepEqual(read(scoped, 'selectedMemoryCategories()'), [], 'New users choose chapters explicitly');
  assert(scoped.$('memory-section').innerHTML.includes('請至少選擇一個章節'));
  assert(scoped.$('memory-section').innerHTML.includes('id="memory-start"'));
  scoped.run('startMemory()');
  assert.deepEqual(ids(scoped), [], 'Starting without a chapter cannot capture a queue');
  const nav = scoped.$('category-nav').innerHTML;
  assert(nav.indexOf('卡片記憶') > nav.indexOf('全部詞彙'));
  assert(nav.indexOf('卡片記憶') < nav.indexOf('chapter-button'));
  assert(scoped.$('mobile-category-nav').innerHTML.includes('卡片記憶'));
  scoped.run("showMemory(); memorySelection.fr = ['1']; startMemory()");
  assert.equal(scoped.run('state.screen'), 'memory');
  assert.deepEqual(ids(scoped), ['same'], 'One chapter captures only its impression words');
  assert.equal(scoped.run('state.revealed'), false, 'Each memory card starts concealed');
  scoped.run("showMemory(); memorySelection.fr = ['1', '2']; startMemory()");
  assert.deepEqual(ids(scoped), ['same', 'b'], 'Multiple chapters combine without duplicates');
  scoped.run("showMemory(); memorySelection.fr = []; startMemory()");
  assert.deepEqual(ids(scoped), [], 'No selected chapter never silently means all chapters');

  const concealed = make();
  concealed.run("showMemory(); memorySelection.fr = ['1', '2']; startMemory()");
  const concealedCard = concealed.$('memory-section').innerHTML;
  for (const action of ['forgot', 'remembered']) {
    const button = concealedCard.match(new RegExp(`<button[^>]*data-memory-answer="${action}"[^>]*>`));
    assert(button && !button[0].includes('disabled'), `The ${action} action is enabled before revealing`);
  }
  concealed.run("answerMemory('b',true)");
  assert.equal(record(concealed, 'b'), null, 'A non-current answer is still rejected while concealed');
  concealed.run("answerMemory('same',true)");
  assert.equal(record(concealed).stage, 1);
  assert.equal(concealed.run('state.revealed'), false, 'The next card stays concealed after a direct answer');
  assert.equal(concealed.run('deck[0].id'), 'b');
  assert.equal(concealed.run("levelOf('same')"), 2, 'An early success stays 有印象');
  const firstRecord = record(concealed);
  concealed.run("answerMemory('same',true)");
  assert.deepEqual(record(concealed), firstRecord, 'Repeated answer callbacks do not advance twice');
  concealed.run("state.revealed = false; answerMemory('b',false)");
  assert.equal(record(concealed, 'b').stage, 0, 'A concealed forgot answer schedules a retry');
  assert.equal(concealed.run('memorySession.answered.size'), 2, 'Direct answers each count exactly once');
  assert(firstRecord.dueAt >= firstRecord.updatedAt + 24 * 60 * 60 * 1000);
  concealed.run('showMemory(); startMemory()');
  assert.deepEqual(ids(concealed), [], 'Waiting words cannot be reviewed ahead of schedule');

  const forgotten = make();
  forgotten.run("showMemory(); memorySelection.fr = ['1']; startMemory()");
  answer(forgotten, 'same', false);
  assert.equal(record(forgotten).stage, 0);
  assert.equal(forgotten.run("levelOf('same')"), 2, 'Failure preserves impression familiarity');
  assert(record(forgotten).dueAt >= record(forgotten).updatedAt + 24 * 60 * 60 * 1000);
  forgotten.run('showMemory(); startMemory()');
  assert.deepEqual(ids(forgotten), [], 'A failed card waits before retrying');
  expire(forgotten);
  forgotten.run('startMemory()');
  assert.deepEqual(ids(forgotten), ['same']);
  answer(forgotten, 'same', true);
  assert.equal(record(forgotten).stage, 1);

  const progression = make();
  progression.run("showMemory(); memorySelection.fr = ['1']; startMemory()");
  const intervals = [86400000, 172800000, 345600000, 604800000];
  for (let stage = 1; stage <= 5; stage++) {
    answer(progression, 'same', true);
    const current = record(progression);
    assert.equal(current.stage, stage);
    assert.equal(progression.run("levelOf('same')"), stage === 5 ? 3 : 2);
    if (stage < 5) {
      assert.equal(current.dueAt - current.updatedAt, intervals[stage - 1]);
      expire(progression);
      progression.run('startMemory()');
      assert.deepEqual(ids(progression), ['same']);
    }
  }
  assert.equal(record(progression).dueAt, 0);
  assert.equal(JSON.parse(progression.store.get('mots.progress.v1')).same, 3);
  const syncedMastery = JSON.parse(progression.store.get('mots.sync.metadata.v1')).records.find(
    (entry) => entry.dictionaryID === 'fr' && entry.wordID === 'same',
  );
  assert.equal(syncedMastery.level, 3, 'Mastery joins the existing familiarity sync channel');
  progression.run('showMemory(); startMemory()');
  assert.deepEqual(ids(progression), [], 'Mastered words leave the impression queue');

  const saved = make();
  saved.run("showMemory(); memorySelection.fr = ['1']; startMemory()");
  answer(saved, 'same', true);
  assert(saved.store.has(memoryKey), 'Memory schedule is persisted independently');
  const reloaded = make({ storage: Object.fromEntries(saved.store) });
  assert.deepEqual(record(reloaded), record(saved));
  reloaded.run("showMemory(); memorySelection.fr = ['1']; startMemory()");
  assert.deepEqual(ids(reloaded), [], 'Reload does not make a scheduled card due early');

  const quota = make();
  quota.run("showMemory(); memorySelection.fr = ['1']; startMemory()");
  const originalWrite = quota.ctx.localStorage.setItem;
  quota.ctx.localStorage.setItem = (key, value) => {
    if (key === memoryKey) throw new Error('quota');
    originalWrite(key, value);
  };
  answer(quota, 'same', true);
  assert.equal(record(quota).stage, 1, 'A storage failure retains the answer in memory');
  assert.equal(quota.run("levelOf('same')"), 2, 'An unsaved early recall does not become mastered');
  assert.equal(quota.run('storageFailures.has(memoryKey)'), true);
  assert(quota.$('save-state').innerHTML.includes('請備份'));
  assert(quota.$('toast').textContent.includes('尚未儲存'));
  click(quota, 'export-progress');
  const quotaBackup = JSON.parse(await quota.downloads.at(-1).text());
  assert.deepEqual(quotaBackup.memory.fr.same, record(quota), 'Backup recovers the unsaved schedule');
  quota.ctx.localStorage.setItem = originalWrite;

  const missingMeaning = make();
  missingMeaning.run("settings.meaningLanguage = 'de'; showMemory(); memorySelection.fr = ['1']; startMemory()");
  const missingCard = missingMeaning.$('memory-section').innerHTML;
  assert(/data-memory-answer="remembered"[^>]*disabled/.test(missingCard), 'Missing meaning disables recall even before revealing');
  assert(!/data-memory-answer="forgot"[^>]*disabled/.test(missingCard), 'Missing meaning leaves the concealed forgot action enabled');
  missingMeaning.run("answerMemory('same',true)");
  assert.equal(record(missingMeaning), null, 'Missing selected-language meanings cannot pass recall');
  assert.equal(missingMeaning.run("levelOf('same')"), 2);
  missingMeaning.run("answerMemory('same',false)");
  assert.equal(record(missingMeaning).stage, 0, 'The forgot action still schedules a retry');

  click(saved, 'export-progress');
  const backup = JSON.parse(await saved.downloads.at(-1).text());
  assert.deepEqual(backup.memory.fr.same, record(saved));
  const restored = make();
  await upload(restored, 'import-progress', backup);
  assert.deepEqual(record(restored), record(saved), 'Backup transfers the exact schedule');
  const legacyTime = Date.now() - 2 * 86400000;
  const legacyPending = { stage: 6, dueAt: legacyTime + 7 * 86400000, updatedAt: legacyTime };
  const legacyRestored = make();
  await upload(legacyRestored, 'import-progress', {
    app: 'mots', version: 3, progress: { fr: { same: 2 } },
    memory: { fr: { same: legacyPending } },
  });
  assert.deepEqual(record(legacyRestored), { ...legacyPending, stage: 4 }, 'Legacy backup import preserves the pending final recall and due time');
  assert.equal(legacyRestored.run("levelOf('same')"), 2, 'Migration cannot award mastery');
  const lateReview = make({ storage: {
    [memoryKey]: { fr: { same: { stage: 1, updatedAt: legacyTime, dueAt: legacyTime + 86400000 } } },
  } });
  lateReview.run("showMemory(); memorySelection.fr = ['1']; startMemory()");
  answer(lateReview, 'same', true);
  assert.equal(record(lateReview).stage, 2, 'Returning on day three still completes only recall two');
  assert.equal(record(lateReview).dueAt - record(lateReview).updatedAt, 2 * 86400000);
  const beforeInvalid = JSON.stringify({ store: [...restored.store], progress: read(restored, 'progress'), memory: read(restored, 'memoryRecords') });
  await upload(restored, 'import-progress', {
    app: 'mots', version: 3,
    progress: { fr: { b: 3 } },
    memory: { fr: { same: { stage: 99, dueAt: 1, updatedAt: 1 } } },
  });
  assert.equal(
    JSON.stringify({ store: [...restored.store], progress: read(restored, 'progress'), memory: read(restored, 'memoryRecords') }),
    beforeInvalid,
    'Invalid schedule rejects the entire backup before ratings or storage change',
  );
  await upload(restored, 'import-progress', { app: 'mots', version: 1, ratings: { b: 1 } });
  assert.deepEqual(record(restored), record(saved), 'Legacy backups retain existing schedules');

  const stale = make();
  stale.run('showMemory(); memorySelection[state.dictionary] = categories.map(c => c.id); startMemory()');
  remoteRating(stale, 'same', 3);
  answer(stale, 'same', false);
  assert.equal(stale.run("levelOf('same')"), 3, 'Stale answers cannot lower remotely mastered words');
  assert.equal(record(stale), null);
  const relearn = make();
  relearn.run("showMemory(); memorySelection.fr = ['1']; startMemory()");
  answer(relearn, 'same', true);
  remoteRating(relearn, 'same', 3);
  assert.equal(record(relearn).stage, 1, 'Receiving familiarity must not manufacture a newer schedule');
  relearn.run("memoryRecords.fr.same = { stage: 0, dueAt: Date.now(), updatedAt: Date.now() }; write(memoryKey, memoryRecords)");
  remoteRating(relearn, 'same', 2);
  relearn.run('showMemory(); startMemory()');
  assert.deepEqual(ids(relearn), ['same'], 'Returning a word to 有印象 begins a fresh cycle');

  const anotherTab = make();
  anotherTab.run('showMemory(); memorySelection[state.dictionary] = categories.map(c => c.id); startMemory(); state.revealed = true');
  const answeredElsewhere = anotherTab.run('MotsMemory.review(undefined,true,Date.now()).record');
  fireStorage(anotherTab, memoryKey, { fr: { same: answeredElsewhere } });
  assert.equal(anotherTab.run('deck[0]?.id'), 'b');
  assert.equal(
    anotherTab.run('state.revealed'), false,
    'A schedule update that removes the current card must conceal the next answer',
  );
  const concurrent = make();
  concurrent.run("showMemory(); memorySelection.fr = ['1']; startMemory()");
  answer(concurrent, 'same', true);
  const localRecord = record(concurrent);
  fireStorage(concurrent, memoryKey, { fr: { b: answeredElsewhere } });
  assert.deepEqual(record(concurrent), localRecord, 'Another tab retains different-word schedule edits');
  assert.deepEqual(record(concurrent, 'b'), JSON.parse(JSON.stringify(answeredElsewhere)));
  const concurrentReload = make({ storage: Object.fromEntries(concurrent.store) });
  assert.deepEqual(record(concurrentReload), localRecord, 'The merged schedule survives a reload');
  assert.deepEqual(record(concurrentReload, 'b'), JSON.parse(JSON.stringify(answeredElsewhere)));

  const newestDisk = { fr: { a: localRecord } };
  concurrent.store.set(memoryKey, JSON.stringify(newestDisk));
  for (const handler of concurrent.listeners.storage)
    handler({ key: memoryKey, newValue: JSON.stringify({ fr: { b: answeredElsewhere } }) });
  assert.deepEqual(JSON.parse(concurrent.store.get(memoryKey)).fr.a, localRecord,
    'Repairing a delayed schedule event preserves edits already on disk');

  const manual = make();
  manual.store.set(memoryKey, JSON.stringify({ fr: { same: localRecord, a: localRecord } }));
  manual.run("rate('same', 3)");
  const manualDisk = JSON.parse(manual.store.get(memoryKey)).fr;
  assert.equal(manualDisk.same.stage, 0, 'Manual ratings reset a schedule written before its storage event');
  assert(manualDisk.same.updatedAt > localRecord.updatedAt);
  assert.deepEqual(manualDisk.a, localRecord);

  const oldTime = Date.now() - 1000;
  const oldSchedule = { stage: 8, dueAt: oldTime + 15 * 86400000, updatedAt: oldTime };
  for (const variant of ['local', 'remote']) {
    const reset = make({ storage: { [memoryKey]: { fr: { same: oldSchedule } } } });
    if (variant === 'local') reset.run("rate('same',3); rate('same',2)");
    else {
      remoteRating(reset, 'same', 3);
      remoteRating(reset, 'same', 2);
      fireStorage(reset, memoryKey, { fr: { same: { stage: 0, dueAt: Date.now(), updatedAt: Date.now() } } });
    }
    const resetRecord = record(reset);
    assert.equal(resetRecord.stage, 0, `${variant} changes reset the learning cycle`);
    assert(resetRecord.updatedAt > oldTime);
    fireStorage(reset, memoryKey, { fr: { same: oldSchedule } });
    assert.deepEqual(record(reset), resetRecord, 'A stale tab cannot resurrect a reset stage');
    const resetReload = make({ storage: Object.fromEntries(reset.store) });
    assert.deepEqual(record(resetReload), resetRecord, 'The repaired reset survives a reload');
    resetReload.run("showMemory(); memorySelection.fr = ['1']; startMemory()");
    assert.deepEqual(ids(resetReload), ['same'], 'Reset cards are immediately available for a fresh cycle');
  }
  const deleted = make();
  deleted.run("changeDeletion('fr','same',true); showMemory(); memorySelection[state.dictionary] = categories.map(c => c.id); startMemory()");
  assert.deepEqual(ids(deleted), ['b'], 'Deleted impression words are excluded');
  deleted.run("changeDeletion('fr','b',true)");
  answer(deleted, 'b', true);
  assert.equal(record(deleted, 'b'), null, 'Deleted captured cards reject stale callbacks');

  const manyWords = Array.from({ length: 45 }, (_, index) => ({
    id: `w${index}`, french: `mot${index}`, chinese: `詞${index}`,
    category: '1', subcategory: '1.01',
  }));
  const unbounded = make({ words: manyWords, storage: {
    'mots.progress.v1': Object.fromEntries(manyWords.map((word) => [word.id, 2])),
  } });
  unbounded.run('showMemory(); memorySelection[state.dictionary] = categories.map(c => c.id); startMemory()');
  assert.equal(ids(unbounded).length, 45, 'A round includes every due word without a twenty-card cap');
  assert.equal(new Set(ids(unbounded)).size, 45);
  answer(unbounded, 'w0', true);
  const largeReload = context({ source: true, words: manyWords, storage: Object.fromEntries(unbounded.store) });
  assert.deepEqual(ids(largeReload), ids(unbounded), 'All forty-five captured IDs survive reopening');
  assert.equal(largeReload.run('deck[0]?.id'), 'w1');
  assert.equal(largeReload.run('memorySession.answered.size'), 1);

  const grammar = make();
  grammar.run("showMemory(); applyDictionary('grammar-fr')");
  assert.notEqual(grammar.run('state.screen'), 'memory', 'Grammar selection exits vocabulary memory');
  assert(!grammar.$('category-nav').innerHTML.includes('卡片記憶'));
  grammar.run('showMemory()');
  assert.notEqual(grammar.run('state.screen'), 'memory');
  const direct = make({ url: 'http://localhost/Mots.html?screen=memory&dict=fr' });
  assert.equal(direct.run('state.screen'), 'memory');
  assert.equal(direct.$('memory-section').hidden, false);
  console.log('Card memory chapter scopes, due dates, mastery, persistence, backups and stale answers passed.');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
