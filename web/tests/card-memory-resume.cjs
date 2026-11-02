const { context, read, assert } = require('./helpers/app.cjs');

const workspaceKey = 'mots.memory.workspace.v1';
const scheduleKey = 'mots.memory.v1';
const words = [
  { id: 'first', french: 'un', chinese: '一', category: '1', subcategory: '1.01' },
  { id: 'second', french: 'deux', chinese: '二', category: '1', subcategory: '1.01' },
  { id: 'third', french: 'trois', chinese: '三', category: '2', subcategory: '2.01' },
  { id: 'waiting', french: 'quatre', chinese: '四', category: '2', subcategory: '2.01' },
  { id: 'new', french: 'cinq', chinese: '五', category: '2', subcategory: '2.01' },
];
const make = (options = {}) => context({
  source: true,
  random: () => 0.999999999,
  words,
  ...options,
  storage: {
    'mots.progress.v1': { first: 2, second: 2, third: 2, waiting: 2 },
    ...options.storage,
  },
});
const storage = (app) => Object.fromEntries(app.store);
const reopen = (app, options = {}) => make({ storage: storage(app), ...options });
const session = (app) => read(app, `memorySession && ({
  ids: memorySession.ids,
  answered: [...memorySession.answered],
  remembered: memorySession.remembered,
  mastered: memorySession.mastered
})`);
const current = (app) => app.run('deck[0]?.id || null');
const memoryClick = (app, { id = '', dataset = {}, attributes = [] } = {}) => {
  const button = { id, dataset, disabled: false, hasAttribute: (name) => attributes.includes(name) };
  const target = { closest: (selector) => selector === 'button' ? button : null };
  for (const handler of app.$('memory-section').events.click || []) handler({ target });
};
const reveal = (app) => memoryClick(app, { id: 'reveal-button' });
const selectChapter = (app, id, checked) => {
  const target = { dataset: { memoryCategory: id }, checked };
  for (const handler of app.$('memory-section').events.change || []) handler({ target });
};
const answer = (app, remembered) => {
  if (!app.run('state.revealed')) reveal(app);
  const id = current(app);
  app.run(`answerMemory(${JSON.stringify(id)}, ${remembered})`);
};

function run() {
  const now = Date.now();
  const app = make({ storage: {
    [scheduleKey]: { fr: { waiting: { stage: 1, dueAt: now + 300000, updatedAt: now } } },
    'mots.settings.v2': { visibility: { fr: [0, 1, 2, 3] }, view: 'list' },
  } });
  app.run("showMemory(); memorySelection.fr = ['1', '2']; startMemory()");
  assert.deepEqual(session(app).ids, ['first', 'second', 'third']);
  answer(app, true);
  assert.equal(current(app), 'second');
  reveal(app);
  const captured = session(app);
  assert.equal(app.run('state.revealed'), true);
  assert(app.store.has(workspaceKey), 'The captured round is saved locally');

  const resumed = reopen(app);
  assert.equal(resumed.run('state.screen'), 'memory', 'A plain reopen returns to the saved memory screen');
  assert.equal(resumed.run('state.dictionary'), 'fr');
  assert.deepEqual(session(resumed), captured, 'Round identity, order and answer counts survive closing');
  assert.equal(current(resumed), 'second', 'The next unanswered card is restored');
  assert.equal(resumed.run('state.revealed'), true, 'The answer reveal state is restored');
  assert.deepEqual(read(resumed, 'selectedMemoryCategories()'), ['1', '2']);
  assert.equal(resumed.$('memory-section').hidden, false);

  resumed.run("showScreen('dictionary'); showMemory()");
  assert.deepEqual(session(resumed), captured, 'Leaving and returning never starts a fresh round');
  assert.equal(current(resumed), 'second');
  assert.equal(resumed.run('state.revealed'), true);

  // New words and newly due cards belong to the next explicit round only.
  resumed.run(`{
    const waiting = memoryRecords.fr.waiting;
    waiting.updatedAt = Date.now() - 300001;
    waiting.dueAt = Date.now() - 1;
    write(memoryKey, memoryRecords);
    rate('new', 2);
    showMemory();
  }`);
  const newer = reopen(resumed);
  assert.deepEqual(session(newer), captured);
  assert.deepEqual(read(newer, 'deck.map(word => word.id)'), ['second', 'third']);
  answer(newer, false);
  assert.equal(current(newer), 'third');
  const afterFailure = reopen(newer);
  assert.equal(current(afterFailure), 'third');
  assert.deepEqual(session(afterFailure).answered, ['first', 'second']);
  assert.equal(session(afterFailure).remembered, 1);
  answer(afterFailure, true);
  const completed = session(afterFailure);
  assert.equal(current(afterFailure), null);
  const completedReload = reopen(afterFailure);
  assert.deepEqual(session(completedReload), completed, 'A completed round remains completed after reopen');
  assert.equal(current(completedReload), null);
  assert(completedReload.$('memory-section').innerHTML.includes('本輪卡片記憶已完成'));
  completedReload.run('showMemory()');
  assert.deepEqual(session(completedReload), completed);
  completedReload.run('startMemory()');
  assert.deepEqual(session(completedReload).ids, ['waiting', 'new'], 'Only explicit start captures the next due round');
  assert.deepEqual(session(completedReload).answered, []);

  const explicitHome = reopen(app, { url: 'http://localhost/Mots.html?screen=home' });
  assert.equal(explicitHome.run('state.screen'), 'home', 'Explicit URL destinations win over saved memory');
  explicitHome.run('showMemory()');
  assert.deepEqual(session(explicitHome), captured);

  const choosing = make();
  choosing.run('showMemory()');
  assert.deepEqual(read(choosing, 'selectedMemoryCategories()'), [], 'Fresh chapter selection is empty');
  selectChapter(choosing, '1', true);
  const chapterReload = reopen(choosing);
  assert.deepEqual(read(chapterReload, 'selectedMemoryCategories()'), ['1'], 'Chapter choices survive before starting');
  selectChapter(chapterReload, '1', false);
  const noneReload = reopen(chapterReload);
  assert.deepEqual(read(noneReload, 'selectedMemoryCategories()'), [], 'An empty chapter choice never defaults back to all');

  const paused = make({ storage: {
    [scheduleKey]: { fr: { waiting: { stage: 1, dueAt: now + 300000, updatedAt: now } } },
  } });
  paused.run('showMemory(); memorySelection[state.dictionary] = categories.map(c => c.id); startMemory()');
  answer(paused, true);
  reveal(paused);
  const beforePause = session(paused);
  paused.run('pauseMemory()');
  const pausedReload = reopen(paused);
  assert.equal(pausedReload.run('memorySession.paused'), true);
  assert.deepEqual(session(pausedReload), beforePause, 'Returning to chapter selection retains the captured round');
  assert(pausedReload.$('memory-section').innerHTML.includes('id="memory-resume"'));
  assert(!pausedReload.$('memory-section').innerHTML.includes('study-flashcard'));
  pausedReload.run('resumeMemory()');
  assert.equal(current(pausedReload), 'second');
  assert.equal(pausedReload.run('state.revealed'), true, 'Continue restores the paused card and its answer');
  pausedReload.run('pauseMemory()');
  selectChapter(pausedReload, '2', false);
  assert.deepEqual(session(pausedReload), beforePause, 'Editing next-round scope does not replace the saved round');
  const changedScopeReload = reopen(pausedReload);
  assert.equal(changedScopeReload.run('memorySession.paused'), true);
  assert.deepEqual(session(changedScopeReload), beforePause);
  assert.deepEqual(read(changedScopeReload, 'selectedMemoryCategories()'), ['1']);
  changedScopeReload.run('startMemory()');
  assert.deepEqual(session(changedScopeReload).ids, ['second'], 'An explicit new round uses the changed chapter scope');
  assert.deepEqual(session(changedScopeReload).answered, []);
  assert.equal(changedScopeReload.run('state.revealed'), false);

  const secondBook = {
    id: 'dict-memory-other', title: '另一個記憶詞庫', language: 'fr',
    categories: [{ id: 'x', name: '第二本章節', subcategories: [{ id: 'x.1', name: '詞條' }] }],
    words: [
      { id: 'first', term: 'autre', meanings: { 'zh-Hant': '其他' }, category: 'x', subcategory: 'x.1' },
      { id: 'new', term: 'nouveau', meanings: { 'zh-Hant': '新的' }, category: 'x', subcategory: 'x.1' },
    ],
  };
  const isolated = make({ storage: {
    [scheduleKey]: { fr: { waiting: { stage: 1, dueAt: now + 300000, updatedAt: now } } },
    'mots.dictionaries.v1': [secondBook],
    'mots.progress.dictionary.dict-memory-other.v1': { first: 2, new: 2 },
  } });
  isolated.run('showMemory(); memorySelection[state.dictionary] = categories.map(c => c.id); startMemory()');
  answer(isolated, true);
  const firstBookRound = session(isolated);
  isolated.run("applyDictionary('dict-memory-other'); showMemory(); memorySelection[state.dictionary] = categories.map(c => c.id); startMemory()");
  answer(isolated, true);
  reveal(isolated);
  const otherBookRound = session(isolated);
  assert.deepEqual(otherBookRound.ids, ['first', 'new']);
  assert.equal(current(isolated), 'new');
  isolated.run("applyDictionary('fr'); showMemory()");
  assert.deepEqual(session(isolated), firstBookRound, 'Book switches retain independent captured rounds');
  assert.equal(current(isolated), 'second');
  isolated.run("applyDictionary('dict-memory-other'); showMemory()");
  assert.deepEqual(session(isolated), otherBookRound);
  assert.equal(isolated.run('state.revealed'), true);
  const bookReload = reopen(isolated);
  assert.equal(bookReload.run('state.dictionary'), 'dict-memory-other');
  assert.equal(bookReload.run('state.screen'), 'memory');
  assert.deepEqual(session(bookReload), otherBookRound);
  assert.equal(current(bookReload), 'new');
  const explicitBook = reopen(isolated, { url: 'http://localhost/Mots.html?dict=fr' });
  assert.equal(explicitBook.run('state.dictionary'), 'fr', 'Explicit dictionary URLs override the remembered book');
  explicitBook.run('showMemory()');
  assert.deepEqual(session(explicitBook), firstBookRound);

  const removed = make({ storage: {
    [scheduleKey]: { fr: { waiting: { stage: 1, dueAt: now + 300000, updatedAt: now } } },
  } });
  removed.run('showMemory(); memorySelection[state.dictionary] = categories.map(c => c.id); startMemory()');
  answer(removed, true);
  reveal(removed);
  removed.run("changeDeletion('fr','second',true)");
  const deletionReload = reopen(removed);
  assert.equal(current(deletionReload), 'third');
  assert.equal(deletionReload.run('state.revealed'), false, 'Pruning a deleted current card conceals the following card');
  assert.deepEqual(session(deletionReload).ids, ['first', 'third']);
  assert.deepEqual(session(deletionReload).answered, ['first']);
  deletionReload.run("changeDeletion('fr','second',false); showMemory()");
  assert.deepEqual(session(deletionReload).ids, ['first', 'third'], 'Restoring a removed word does not inject it back');

  const quota = make({ storage: {
    [scheduleKey]: { fr: { waiting: { stage: 1, dueAt: now + 300000, updatedAt: now } } },
  } });
  quota.run('showMemory(); memorySelection[state.dictionary] = categories.map(c => c.id); startMemory()');
  const setItem = quota.ctx.localStorage.setItem;
  quota.ctx.localStorage.setItem = (key, value) => {
    if (key === workspaceKey) throw new Error('quota');
    setItem(key, value);
  };
  answer(quota, true);
  assert.equal(current(quota), 'second', 'A snapshot write failure retains the live round');
  assert.equal(quota.run("storageFailures.has('mots.memory.workspace.v1')"), true);
  assert(quota.$('save-state').innerHTML.includes('請備份'));
  quota.ctx.localStorage.setItem = setItem;
  quota.run('persistMemoryWorkspace()');
  assert.equal(quota.run("storageFailures.has('mots.memory.workspace.v1')"), false);
  const quotaReload = reopen(quota);
  assert.equal(current(quotaReload), 'second');
  assert.deepEqual(session(quotaReload).answered, ['first']);

  for (const invalid of [null, [], 'bad', { version: 99 }, { version: 1, books: { fr: { session: { ids: 'bad' } } } }]) {
    const corrupt = make({ storage: { [workspaceKey]: invalid } });
    corrupt.run('showMemory()');
    assert.equal(corrupt.run('state.screen'), 'memory');
    assert.equal(session(corrupt), null, 'Malformed workspace state falls back to chapter selection');
    assert.equal(current(corrupt), null);
  }

  console.log('Card memory closes and resumes exact captured rounds, reveals, counts and completion.');
}

run();
