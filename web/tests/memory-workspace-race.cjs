const { context, read, assert } = require('./helpers/app.cjs');

const workspaceKey = 'mots.memory.workspace.v1';
const words = [
  { id: 'first', french: 'un', chinese: '一', category: '1', subcategory: '1.01' },
  { id: 'second', french: 'deux', chinese: '二', category: '1', subcategory: '1.01' },
];
const make = (options = {}) => context({
  source: true, random: () => 0.999999999, words, ...options,
  storage: { 'mots.progress.v1': { first: 2, second: 2 }, ...options.storage },
});
const saved = (app) => JSON.parse(app.store.get(workspaceKey));
const mirror = (source, target) => {
  for (const [key, value] of source.store) target.store.set(key, value);
};
const captured = (app) => read(app, `memorySession && ({
  ids: memorySession.ids, answered: [...memorySession.answered], remembered: memorySession.remembered,
  mastered: memorySession.mastered, revealed: memorySession.revealed, paused: memorySession.paused
})`);

// An idle tab predates the other tab's first round, so its local cache is empty.
const idle = make();
const active = make();
active.run('showMemory(); memorySelection[state.dictionary] = categories.map(c => c.id); startMemory(); state.revealed = true; render()');
const started = saved(active);
mirror(active, idle);
idle.run('render()');
assert.deepEqual(saved(idle), started, 'An unrelated home render preserves the latest round and active destination');
idle.run("showScreen('dictionary')");
assert.equal(saved(idle).active, false, 'Explicit navigation records a non-memory destination even from another non-memory screen');
assert.deepEqual(saved(idle).books.fr, started.books.fr, 'Destination navigation never rewrites another tab\'s captured round');
idle.run('showMemory()');
assert.deepEqual(captured(idle), started.books.fr.session, 'Entering memory hydrates the latest round instead of the stale empty cache');
assert.equal(idle.run('state.revealed'), true);
assert.equal(idle.run('deck[0].id'), 'first');

// A background render must not write an unchanged local snapshot over a newer one.
active.run('pauseMemory()');
const paused = saved(active);
mirror(active, idle);
idle.run('render()');
assert.deepEqual(saved(idle).books.fr, paused.books.fr, 'An unchanged active view preserves a newer saved pause');
assert.equal(idle.run('memorySession.paused'), false, 'Another tab never replaces the already-running local round');
assert.equal(idle.run('state.revealed'), true);
idle.run('pauseMemory(); resumeMemory(); state.revealed = false; render()');
assert.equal(saved(idle).books.fr.session.revealed, false, 'An explicit local interaction can commit its own changed snapshot');

// A stale non-null cache is refreshed on re-entry, including counters and reveal state.
const older = make();
older.run('showMemory(); memorySelection[state.dictionary] = categories.map(c => c.id); startMemory(); showScreen("dictionary")');
const newer = make({ storage: Object.fromEntries(older.store), url: 'http://localhost/Mots.html?screen=memory' });
newer.run('state.revealed = true; answerMemory("first", true); state.revealed = true; render()');
const latest = saved(newer).books.fr.session;
mirror(newer, older);
older.run('showMemory()');
assert.deepEqual(captured(older), latest, 'Re-entry loads the newest answered subset and counters');
assert.equal(older.run('deck[0].id'), 'second');
assert.equal(older.run('state.revealed'), true);

// Explicit startup routes keep their documented priority without resetting saved books.
const home = make({ storage: Object.fromEntries(newer.store), url: 'http://localhost/Mots.html?screen=home' });
assert.equal(home.run('state.screen'), 'home');
assert.equal(saved(home).active, false);
assert.deepEqual(saved(home).books.fr.session, latest);

// Keep unsaved local work when storage recovers; hydration must not replace it.
const unsaved = make();
unsaved.run('showMemory(); memorySelection[state.dictionary] = categories.map(c => c.id); startMemory()');
const setItem = unsaved.ctx.localStorage.setItem;
unsaved.ctx.localStorage.setItem = (key, value) => {
  if (key === workspaceKey) throw new Error('quota');
  setItem(key, value);
};
unsaved.run('state.revealed = true; answerMemory("first", true)');
const live = captured(unsaved);
assert.equal(unsaved.run('storageFailures.has(memoryWorkspaceKey)'), true);
unsaved.ctx.localStorage.setItem = setItem;
unsaved.run('showScreen("dictionary")');
assert.equal(unsaved.run('storageFailures.has(memoryWorkspaceKey)'), true, 'Saving a destination cannot hide an unsaved round');
unsaved.run('showMemory()');
assert.deepEqual(captured(unsaved), live, 'A retry keeps the unsaved local round instead of hydrating the older saved one');
assert.deepEqual(saved(unsaved).books.fr.session, live);
assert.equal(unsaved.run('storageFailures.has(memoryWorkspaceKey)'), false);

// A settings event can enter another book without reusing that tab's older cache.
const book = {
  id: 'dict-other', title: '第二本', language: 'fr',
  categories: [{ id: 'x', name: '章節', subcategories: [{ id: 'x.1', name: '詞條' }] }],
  words: [{ id: 'other', term: 'autre', meanings: { 'zh-Hant': '其他' }, category: 'x', subcategory: 'x.1' }],
};
const settingsBase = {
  'mots.dictionaries.v1': [book],
  'mots.progress.dictionary.dict-other.v1': { other: 2 },
};
const follower = make({ storage: settingsBase });
const owner = make({ storage: settingsBase });
follower.run('showMemory(); memorySelection[state.dictionary] = categories.map(c => c.id); startMemory()');
owner.run('applyDictionary("dict-other"); showMemory(); memorySelection[state.dictionary] = categories.map(c => c.id); startMemory(); state.revealed = true; render()');
mirror(owner, follower);
const settingsValue = owner.store.get('mots.settings.v2');
for (const handler of follower.listeners.storage || []) handler({ key: 'mots.settings.v2', newValue: settingsValue });
assert.equal(follower.run('state.dictionary'), 'dict-other');
assert.deepEqual(captured(follower), saved(owner).books['dict-other'].session);
assert.equal(follower.run('state.revealed'), true);

// The last destination belongs to the latest interaction, not a background tab.
const background = make({ storage: settingsBase });
background.run('showMemory(); memorySelection[state.dictionary] = categories.map(c => c.id); startMemory()');
const backgroundRound = captured(background);
const otherDestination = {
  ...saved(background),
  active: true,
  dictionaryID: 'dict-other',
  books: { ...saved(background).books, 'dict-other': saved(owner).books['dict-other'] },
};
background.store.set(workspaceKey, JSON.stringify(otherDestination));
background.run('render()');
assert.deepEqual(saved(background), otherDestination, 'An unchanged memory render preserves another book\'s newer last destination');
assert.equal(background.run('state.dictionary'), 'fr');
assert.deepEqual(captured(background), backgroundRound, 'The existing local French round stays untouched');
background.run('state.revealed = true; render()');
assert.equal(saved(background).dictionaryID, 'fr', 'An explicit answer reveal commits the local book as the newest destination');
assert.equal(saved(background).active, true);
assert.equal(saved(background).books.fr.session.revealed, true);
assert.deepEqual(saved(background).books['dict-other'], otherDestination.books['dict-other'], 'Committing the local book retains the other book\'s round');

console.log('Memory workspace idle-tab races, current-round ownership, latest re-entry, routes, settings and unsaved recovery passed.');
