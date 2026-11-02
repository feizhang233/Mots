const { context, read, assert } = require('./helpers/app.cjs');

const words = ['a', 'b', 'c', 'd'].map((id) => ({
  id, french: `mot-${id}`, chinese: `釋義 ${id}`, category: '1', subcategory: '1.01',
}));
const make = (options = {}) => context({ source: true, random: () => 0.999999999, words, ...options });
function focus(app, id = 'main', tagName = 'MAIN', { editable = false, parent = false, answer } = {}) {
  const element = app.$(id);
  element.tagName = tagName;
  element.isContentEditable = editable;
  element.dataset.memoryAnswer = answer;
  element.closest = (selector) => {
    if (selector === 'nav,details,select') return parent ? {} : null;
    return ['BUTTON', 'A', 'SUMMARY'].includes(tagName) ? element : null;
  };
  element.focus();
}
function press(app, key, extra = {}) {
  let prevented = false;
  for (const handler of app.listeners['document:keydown'] || []) handler({
    key, altKey: false, ctrlKey: false, metaKey: false, shiftKey: false, repeat: false,
    preventDefault() { prevented = true; }, ...extra,
  });
  return prevented;
}
function memory() {
  const app = make({ storage: { 'mots.progress.v1': { a: 2, b: 2, c: 2, d: 2 } } });
  app.run("showMemory(); memorySelection.fr = ['1']; startMemory()");
  focus(app, 'reveal-button', 'BUTTON');
  return app;
}
const current = (app) => app.run('deck[state.index]?.id');

const recall = memory();
assert(press(recall, ' '), 'Space overrides the reveal button default');
assert.equal(recall.run('state.revealed'), true);
press(recall, ' ');
assert.equal(recall.run('state.revealed'), true, 'Space never hides a visible answer');
const saved = JSON.parse(recall.store.get('mots.memory.workspace.v1'));
assert.equal(saved.books.fr.session.revealed, true, 'A keyboard reveal persists normally');
assert(press(recall, 'Enter'));
assert.equal(recall.run('memoryRecords.fr.a.stage'), 1);
assert.equal(current(recall), 'b');
assert.equal(recall.run('state.revealed'), false);
assert(press(recall, 'Enter', { repeat: true }));
assert.equal(current(recall), 'b', 'Holding Enter cannot rate the following card');
press(recall, ' ', { repeat: true });
assert.equal(recall.run('state.revealed'), false);
press(recall, 'Enter');
assert.equal(recall.run('memoryRecords.fr.b.stage'), 1, 'Enter accepts a concealed answer');
assert.equal(current(recall), 'c');
for (const key of ['ArrowRight', 'ArrowLeft', '1', '2', '3']) press(recall, key);
assert.equal(current(recall), 'c', 'Memory does not acquire ordinary navigation/rating shortcuts');
assert.equal(recall.run("levelOf('c')"), 2);
focus(recall, 'memory-forgot', 'BUTTON', { answer: 'forgot' });
assert.equal(press(recall, 'Enter'), false, 'A focused secondary action retains native Enter');
assert.equal(current(recall), 'c');
focus(recall, 'remembered', 'BUTTON', { answer: 'remembered' });
press(recall, ' ');
assert.equal(recall.run('state.revealed'), true, 'Space on the primary action reveals instead of answering');
press(recall, 'Enter');
press(recall, 'Enter');
assert.equal(recall.run('memorySession.answered.size'), 4);
assert.equal(recall.run('memorySession.remembered'), 4);
assert.equal(press(recall, 'Enter'), false, 'Completed rounds have no global answer shortcut');

const guarded = memory();
for (const flag of ['altKey', 'ctrlKey', 'metaKey', 'shiftKey', 'isComposing', 'defaultPrevented']) {
  for (const key of ['Enter', ' ']) assert.equal(press(guarded, key, { [flag]: true }), false);
}
press(guarded, 'Enter', { keyCode: 229 });
guarded.run('composing = true');
press(guarded, ' ');
guarded.run('composing = false');
for (const dialog of ['settings-dialog', 'category-dialog', 'entry-detail-dialog']) {
  guarded.$(dialog).open = true;
  for (const key of ['Enter', ' ']) assert.equal(press(guarded, key), false);
  guarded.$(dialog).open = false;
}
for (const tag of ['INPUT', 'TEXTAREA', 'SELECT', 'A', 'SUMMARY', 'BUTTON']) {
  focus(guarded, 'other-control', tag);
  for (const key of ['Enter', ' ']) assert.equal(press(guarded, key), false, `Preserve native ${tag} keys`);
}
for (const options of [{ editable: true }, { parent: true }]) {
  focus(guarded, 'editing-or-navigation', 'DIV', options);
  for (const key of ['Enter', ' ']) assert.equal(press(guarded, key), false);
}
assert.equal(current(guarded), 'a');
assert.equal(guarded.run('state.revealed'), false);
assert.deepEqual(read(guarded, 'memoryRecords'), {});
focus(guarded);
guarded.run("settings.meaningLanguage = 'de'");
press(guarded, 'Enter');
assert.deepEqual(read(guarded, 'memoryRecords'), {}, 'Missing meanings cannot pass with Enter');
guarded.run("settings.meaningLanguage = 'zh-Hant'; pauseMemory()");
for (const key of ['Enter', ' ']) assert.equal(press(guarded, key), false, 'Paused memory has no card shortcuts');

const study = make({ url: 'http://localhost/?screen=study&view=card' });
focus(study, 'reveal-button', 'BUTTON');
press(study, 'Enter');
assert.equal(study.run('state.index'), 1, 'Enter advances ordinary cards without rating');
assert.equal(study.run("levelOf('a')"), 0);
focus(study, 'next-word', 'BUTTON');
press(study, ' ');
press(study, ' ');
assert.equal(study.run('state.revealed'), true);
press(study, 'Enter');
assert.equal(study.run('state.index'), 2);
assert.equal(study.run('state.revealed'), false);

const review = make();
review.run('startReview()');
focus(review);
const queue = read(review, 'reviewSession.ids');
for (let index = 0; index < queue.length; index++) press(review, 'Enter');
assert.equal(review.run('state.completed'), true, 'Enter completes a review round');
assert.equal(review.run('reviewSession.rated.size'), 0, 'Review advancement does not award familiarity');
assert.equal(press(review, 'Enter'), false);
assert.deepEqual(read(review, 'reviewSession.ids'), queue);
for (const url of ['?screen=home', '?screen=dictionary', '?screen=study&view=list']) {
  const app = make({ url: `http://localhost/${url}` });
  focus(app);
  for (const key of ['Enter', ' ']) assert.equal(press(app, key), false);
}
const empty = make({ words: [], url: 'http://localhost/?screen=study&view=card' });
focus(empty);
assert.equal(press(empty, 'Enter'), false);
assert.equal(press(empty, ' '), false);
console.log('Card keyboard: recall/next, reveal-only Space, focus, IME, modifiers, repeat, persistence and boundaries passed.');
