const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const sandbox = { window: {} };
vm.runInNewContext(
  fs.readFileSync(path.join(__dirname, '../src/js/memory.js'), 'utf8'),
  sandbox,
);
const clean = (value) => JSON.parse(JSON.stringify(sandbox.window.MotsMemory.sanitizeWorkspace(value)));
const empty = { version: 1, active: false, dictionaryID: null, books: {} };
const session = {
  ids: ['word-3', 'word-1', 'word-2'],
  answered: ['word-3'],
  remembered: 1,
  mastered: 0,
  revealed: true,
  paused: false,
};
const workspace = {
  version: 1,
  active: true,
  dictionaryID: 'fr',
  books: {
    fr: { chapters: ['2', '1'], session },
    de: { chapters: [], session: null },
    ja: { chapters: null, session: { ...session, paused: true } },
  },
};

for (const invalid of [undefined, null, [], 'memory', {}, { ...workspace, version: 2 }])
  assert.deepEqual(clean(invalid), empty, 'Legacy or unsupported workspace state cannot invent a new round');
assert.deepEqual(clean(workspace), workspace, 'The round order, answered subset, reveal and pause states round-trip exactly');
assert.deepEqual(clean(clean(workspace)), workspace, 'Workspace sanitation is idempotent');
const isolated = clean(workspace);
isolated.books.fr.session.ids.shift();
isolated.books.fr.session.answered.push('word-1');
isolated.books.fr.chapters.push('3');
assert.deepEqual(workspace.books.fr.session.ids, ['word-3', 'word-1', 'word-2']);
assert.deepEqual(workspace.books.fr.session.answered, ['word-3']);
assert.deepEqual(workspace.books.fr.chapters, ['2', '1'], 'Returned arrays never alias the saved snapshot');
assert.equal(clean({ ...workspace, active: false }).active, false, 'Leaving memory preserves the saved round without reopening its route');
assert.equal(clean({ ...workspace, active: 'true' }).active, false);
assert.equal(clean({ ...workspace, dictionaryID: '__proto__' }).dictionaryID, null);
assert.equal(clean({ ...workspace, dictionaryID: 'bad\nID' }).dictionaryID, null);
assert.deepEqual(clean({ version: 1, active: true, dictionaryID: 'fr', books: null }), {
  ...empty, active: true, dictionaryID: 'fr',
});

const book = (partial) => ({
  version: 1, active: true, dictionaryID: 'fr',
  books: { fr: { chapters: ['1'], session: { ...session, ...partial } }, de: workspace.books.de },
});
for (const invalidSession of [
  { ids: 'word-1' },
  { ids: Array.from({ length: 100001 }, (_, i) => `word-${i}`) },
  { ids: ['word-1', 'word-1'] },
  { ids: ['constructor'] },
  { ids: ['bad\u0000word'] },
  { answered: ['outside-the-round'] },
  { answered: ['word-3', 'word-3'] },
  { answered: 'word-3' },
  { remembered: -1 },
  { remembered: 2 },
  { remembered: 0.5 },
  { remembered: true },
  { remembered: NaN },
  { mastered: -1 },
  { mastered: 2 },
  { mastered: 0.5 },
  { revealed: 'true' },
  { revealed: undefined },
  { paused: 1 },
  { paused: undefined },
]) {
  const actual = clean(book(invalidSession));
  assert.deepEqual(actual.books.fr, { chapters: ['1'], session: null }, 'A damaged session is discarded atomically while its chapter choice remains');
  assert.deepEqual(actual.books.de, workspace.books.de, 'Damage in one book never drops another book');
}
assert.deepEqual(clean(book({ ids: [], answered: [], remembered: 0, mastered: 0 })).books.fr.session, {
  ids: [], answered: [], remembered: 0, mastered: 0, revealed: true, paused: false,
});
assert.deepEqual(clean(book({
  answered: ['word-3', 'word-1', 'word-2'], remembered: 2, mastered: 1, revealed: false,
})).books.fr.session, {
  ...session, answered: ['word-3', 'word-1', 'word-2'], remembered: 2, mastered: 1, revealed: false,
}, 'A finished round retains its actual completion counters');

for (const invalidBook of [null, [], { chapters: 'all' }, { chapters: ['__proto__'] }, { chapters: [true] }, { chapters: ['x'.repeat(501)] }]) {
  const actual = clean({ ...workspace, books: { fr: invalidBook, de: workspace.books.de } });
  assert.equal(actual.books.fr, undefined);
  assert.deepEqual(actual.books.de, workspace.books.de);
}
assert.deepEqual(clean({ version: 1, books: { fr: {} } }).books.fr, { chapters: null, session: null }, 'Missing state remains unconfigured instead of selecting a new queue');
assert.deepEqual(clean({ version: 1, books: { fr: { chapters: ['2', '1', '2'] } } }).books.fr.chapters, ['2', '1']);
assert.deepEqual(clean(workspace).books.de.chapters, [], 'An explicit empty chapter selection remains empty');
const unsafe = JSON.parse('{"version":1,"books":{"__proto__":{"chapters":[]},"constructor":{"chapters":[]},"de":{"chapters":[]}}}');
assert.deepEqual(clean(unsafe).books, { de: { chapters: [], session: null } });
const many = Object.fromEntries(Array.from({ length: 60 }, (_, i) => [`book-${i}`, { chapters: [], session: null }]));
assert.equal(Object.keys(clean({ version: 1, books: many }).books).length, 50, 'Corrupted local state has a bounded book count');
console.log('Memory workspace round order, reveal/pause state, chapter choices, counters, isolation and damaged-state recovery passed.');

const largeIDs = Array.from({ length: 1500 }, (_, i) => `large-${i}`);
const largeSession = { ids: largeIDs, answered: largeIDs.slice(0, 1200), remembered: 900, mastered: 100, revealed: false, paused: true };
assert.deepEqual(clean({ version: 1, books: { fr: { chapters: [], session: largeSession } } }).books.fr.session, largeSession,
  'Large captured rounds and answered subsets survive sanitation without a twenty-word cap');
