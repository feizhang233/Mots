const { context, click, assert } = require('./helpers/app.cjs');

const words = Array.from({ length: 142 }, (_, index) => ({
  id: `w${index}`,
  french: `mot-${index}`,
  chinese: `詞${index}`,
  example: 'Exemple',
  category: '1',
  subcategory: '1.01',
}));
const make = (options = {}) =>
  context({ words, url: 'http://localhost/?screen=study&view=card&size=20', ...options });
const slide = (app, value, extra = {}) => {
  const target = app.$('card-position');
  target.value = String(value);
  for (const handler of app.$('study-content').events.input || []) handler({ target, ...extra });
};

const app = make({ storage: { 'mots.progress.v1': { w41: 2 } } });
const ratings = app.store.get('mots.progress.v1');
const deckIDs = app.run('JSON.stringify(deck.map(word => word.id))');
app.run('state.revealed = true; state.completed = true');
slide(app, 42);
assert.equal(app.run('deck[state.index].id'), 'w41');
assert.equal(app.run('state.page'), 3);
assert.equal(app.run('state.revealed'), false);
assert.equal(app.run('state.completed'), false);
assert(app.$('study-content').innerHTML.includes('42 / 142'));
assert(app.$('study-content').innerHTML.includes('aria-valuetext="第 42 詞，共 142 詞"'));
assert.equal(app.store.get('mots.progress.v1'), ratings);
assert.equal(app.run('JSON.stringify(deck.map(word => word.id))'), deckIDs);
click(app, 'list-view');
assert.equal(app.run('state.page'), 3);
click(app, 'card-view');
assert.equal(app.run('deck[state.index].id'), 'w41');

slide(app, 142);
assert.equal(app.run('state.index'), 141);
slide(app, 1);
assert.equal(app.run('state.index'), 0);
slide(app, 999);
assert.equal(app.run('state.index'), 141);
slide(app, -5);
assert.equal(app.run('state.index'), 0);
for (const value of ['NaN', '1.5']) {
  slide(app, value);
  assert.equal(app.run('state.index'), 0);
}
slide(app, 42, { isComposing: true });
assert.equal(app.run('state.index'), 0);

// Range keyboard input must remain native; application shortcuts cannot also
// advance cards, reveal answers, or rate the word while the range has focus.
app.$('card-position').tagName = 'INPUT';
app.$('card-position').focus();
for (const key of ['ArrowLeft', 'ArrowRight', 'Home', 'End', ' ', '1', '2', '3']) {
  for (const handler of app.listeners['document:keydown'] || [])
    handler({ key, preventDefault: () => assert.fail(`Application intercepted range key ${key}`) });
}
assert.equal(app.run('state.index'), 0);
assert.equal(app.store.get('mots.progress.v1'), ratings);

const random = make({ url: 'http://localhost/?screen=study&view=card&order=random' });
const randomIDs = random.run('JSON.stringify(deck.map(word => word.id))');
const order = random.run('JSON.stringify(randomOrder)');
slide(random, 42);
assert.equal(random.run('state.index'), 41);
assert.equal(random.run('JSON.stringify(deck.map(word => word.id))'), randomIDs);
assert.equal(random.run('JSON.stringify(randomOrder)'), order);

const empty = make({ words: [] });
assert(!empty.$('study-content').innerHTML.includes('id="card-position"'));
slide(empty, 42);
assert.equal(empty.run('state.index'), 0);
const single = make({ words: words.slice(0, 1) });
assert.match(single.$('study-content').innerHTML, /id="card-position"[^>]*max="1"[^>]*disabled/);
assert(single.$('study-content').innerHTML.includes('1 / 1'));

// List/dictionary/completed-review views ignore stale range events, and a live
// review jump preserves the captured queue and its rating bookkeeping.
click(app, 'list-view');
slide(app, 42);
assert.equal(app.run('state.index'), 0);
const lookup = make({ url: 'http://localhost/?screen=dictionary' });
slide(lookup, 42);
assert.equal(lookup.run('state.index'), 0);
const review = make();
review.run('startReview()');
const queue = review.run('JSON.stringify(reviewSession.ids)');
slide(review, 10);
assert.equal(review.run('state.index'), 9);
assert.equal(review.run('reviewSession.rated.size'), 0);
assert.equal(review.run('JSON.stringify(reviewSession.ids)'), queue);
review.run('state.completed = true; render()');
slide(review, 1);
assert.equal(review.run('state.index'), 9);
assert(!review.$('study-content').innerHTML.includes('id="card-position"'));

console.log(
  'Card position input, boundaries, keyboard, round-trip, shuffle, and review invariants passed.',
);
