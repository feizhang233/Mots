const { context, read, assert } = require('./helpers/app.cjs');

const words = ['a', 'b', 'c', 'd', 'e', 'f', 'waiting', 'unseen', 'deleted'].map((id, index) => ({
  id, french: id, chinese: `釋義 ${id}`, category: index % 2 ? '2' : '1',
  subcategory: index % 2 ? '2.01' : '1.01',
}));
const expected = ['a', 'b', 'c', 'd', 'e', 'f'];
const workspaceKey = 'mots.memory.workspace.v1';
const now = Date.now();
let randomCalls = 0;
let draw = 0;
const random = () => { randomCalls++; return draw; };
const options = {
  source: true, words, random,
  storage: {
    'mots.progress.v1': Object.fromEntries(words.map((word) => [word.id, word.id === 'unseen' ? 0 : 2])),
    'mots.memory.v1': { fr: {
      waiting: { stage: 1, updatedAt: now, dueAt: now + 86400000 },
      a: { stage: 1, updatedAt: now - 86400000, dueAt: now - 1000 },
    } },
    'mots.settings.v2': { order: 'ordered' },
  },
};
const app = context(options);
app.run("changeDeletion('fr','deleted',true); showMemory(); memorySelection.fr = ['1','2']; startMemory()");
const order = read(app, 'memorySession.ids');
assert.deepEqual([...order].sort(), expected, 'Shuffle includes every eligible due word exactly once');
assert.notDeepEqual(order, expected, 'Card memory shuffles even while thematic order is ordered');
assert(randomCalls > 0, 'Starting the round uses the shared shuffle utility');
const capturedCalls = randomCalls;
const first = order[0];
app.run('state.revealed = true; render(); render(); pauseMemory(); resumeMemory()');
assert.deepEqual(read(app, 'memorySession.ids'), order);
assert.equal(randomCalls, capturedCalls, 'Rendering, revealing and continuation never reshuffle');
app.run(`answerMemory(${JSON.stringify(first)}, true)`);
assert.deepEqual(read(app, 'memorySession.ids'), order);
assert.equal(app.run('deck[0].id'), order[1]);
assert.equal(randomCalls, capturedCalls, 'Answering does not redraw the remaining order');

const reopened = context({ source: true, words, random: () => assert.fail('Reopening must not shuffle'), storage: Object.fromEntries(app.store) });
assert.deepEqual(read(reopened, 'memorySession.ids'), order);
assert.equal(reopened.run('deck[0].id'), order[1]);
assert.equal(reopened.run('memorySession.answered.size'), 1);
reopened.run("showScreen('dictionary'); showMemory(); pauseMemory(); resumeMemory()");
assert.deepEqual(read(reopened, 'memorySession.ids'), order);

// A new explicit round uses the current RNG, while excluding the answered word
// whose next due date is now in the future.
draw = 0.999999999;
app.run('startMemory()');
assert(randomCalls > capturedCalls);
assert.deepEqual(read(app, 'memorySession.ids'), expected.filter((id) => id !== first));
assert.equal(app.run('memorySession.answered.size'), 0);
assert.equal(app.run('state.revealed'), false);
assert.deepEqual(read(app, 'words().map(word => word.id)'), words.filter((word) => word.id !== 'deleted').map((word) => word.id), 'Shuffling never mutates source vocabulary');

// Old captured rounds remain in their saved order after the feature update.
const storage = Object.fromEntries(app.store);
const snapshot = JSON.parse(storage[workspaceKey]);
snapshot.books.fr.session.ids = [...snapshot.books.fr.session.ids].reverse();
const legacyOrder = snapshot.books.fr.session.ids;
storage[workspaceKey] = JSON.stringify(snapshot);
const legacy = context({ source: true, words, random: () => assert.fail('Saved rounds must retain their order'), storage });
assert.deepEqual(read(legacy, 'memorySession.ids'), legacyOrder);
assert.equal(legacy.run('deck[0].id'), legacyOrder[0]);
console.log('Memory shuffle: full due membership, new-round randomization, stable answers/resume/reopen and legacy order passed.');
