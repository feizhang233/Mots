const { context, click, assert } = require('./helpers/app.cjs');

const words = Array.from({ length: 40 }, (_, i) => ({
  id: `w${i}`,
  french: `${i % 2 ? 'beta' : 'alpha'}-${i}`,
  chinese: `詞${i}`,
  example: 'Exemple',
  category: i < 30 ? '1' : '2',
  subcategory: i < 30 ? '1.01' : '2.01',
}));
const ratings = (unseen) =>
  Object.fromEntries(words.map((word, i) => [word.id, unseen.includes(i) ? 0 : (i % 3) + 1]));
const url = 'http://localhost/Mots.html?screen=study&category=all&view=list&size=10&page=2';
const make = (unseen = [], options = {}) =>
  context({
    words,
    url,
    storage: { 'mots.progress.v1': ratings(unseen) },
    ...options,
  });
const check = (app, expectedWord, page) => {
  assert.equal(app.run('state.view'), 'card');
  assert.equal(app.run('deck[state.index]?.id'), expectedWord);
  assert.equal(app.run('state.page'), page);
  assert.equal(app.run('state.revealed'), false);
  assert.equal(app.run('state.completed'), false);
};

// Resume from the current list page, without changing the deck or saved ratings.
const forward = make([13, 25]);
forward.run('state.index = 2; state.revealed = true; state.completed = true');
const originalIDs = forward.run('JSON.stringify(deck.map(word => word.id))');
const savedRatings = forward.store.get('mots.progress.v1');
click(forward, 'card-view');
check(forward, 'w13', 2);
assert.equal(forward.run('JSON.stringify(deck.map(word => word.id))'), originalIDs);
assert.equal(forward.store.get('mots.progress.v1'), savedRatings);

const later = make([25]);
click(later, 'card-view');
check(later, 'w25', 3);
click(later, 'list-view');
assert.equal(later.run('state.page'), 3);
assert(later.$('study-content').innerHTML.includes('alpha-20'));

const wrapped = make([3]);
click(wrapped, 'card-view');
check(wrapped, 'w3', 1);

const completed = make();
completed.run('state.index = 3; state.revealed = true');
click(completed, 'card-view');
check(completed, 'w10', 2);

const empty = make([13], { url: `${url}&q=does-not-exist` });
empty.run('state.revealed = true');
click(empty, 'card-view');
assert.equal(empty.run('state.index'), 0);
assert.equal(empty.run('deck.length'), 0);
assert.equal(empty.run('state.page'), 1);
assert.equal(empty.run('state.revealed'), false);
assert(empty.$('study-content').innerHTML.includes('沒有符合條件'));

const hidden = make([13, 14], {
  storage: {
    'mots.progress.v1': ratings([13, 14]),
    'mots.settings.v2': { visibility: { fr: [0] } },
  },
});
const anchor = hidden.run('deck[10].id');
const filteredIDs = hidden.run('JSON.stringify(deck.map(word => word.id))');
click(hidden, 'card-view');
check(hidden, anchor, 2);
assert.equal(hidden.run('JSON.stringify(deck.map(word => word.id))'), filteredIDs);
assert(hidden.run('deck.every(word => levelOf(word.id) !== 0)'));

const filtered = make([24, 35], {
  url: 'http://localhost/Mots.html?screen=study&category=1&sub=1.01&view=list&size=10&page=2&q=alpha',
});
assert.equal(filtered.run('deck.length'), 15);
click(filtered, 'card-view');
check(filtered, 'w24', 2);
assert.equal(filtered.run('state.category'), '1');
assert.equal(filtered.run('state.subcategory'), '1.01');
assert.equal(filtered.run('state.query'), 'alpha');

const random = make([26, 35], { url: `${url}&order=random` });
random.run(
  `randomOrder = ${JSON.stringify([...words].reverse().map((word) => word.id))}; buildDeck(false)`,
);
const shuffledIDs = random.run('JSON.stringify(deck.map(word => word.id))');
const order = random.run('JSON.stringify(randomOrder)');
click(random, 'card-view');
check(random, 'w26', 2);
assert.equal(random.run('JSON.stringify(deck.map(word => word.id))'), shuffledIDs);
assert.equal(random.run('JSON.stringify(randomOrder)'), order);
assert.equal(random.run('state.order'), 'random');

const library = [
  {
    id: 'dict-resume',
    title: 'Resume',
    language: 'fr',
    categories: [{ id: 'x', name: '自訂', subcategories: [{ id: 'x.1', name: '自訂詞' }] }],
    words: words.map((word) => ({
      id: word.id,
      term: word.french,
      meanings: { 'zh-Hant': word.chinese },
      example: word.example,
      category: 'x',
      subcategory: 'x.1',
    })),
  },
];
const imported = make([], {
  url: 'http://localhost/Mots.html?screen=study&dict=dict-resume&category=all&view=list&size=10&page=2',
  storage: {
    'mots.dictionaries.v1': library,
    'mots.progress.v1': ratings([]),
    'mots.progress.dictionary.dict-resume.v1': ratings([13]),
  },
});
click(imported, 'card-view');
check(imported, 'w13', 2);
assert.equal(imported.run('progress.fr.w13'), 2);
assert.equal(imported.run('progress["dict-resume"].w13'), 0);

const reclick = make([13]);
click(reclick, 'card-view');
reclick.run('state.index = 16; state.revealed = true; state.completed = true');
click(reclick, 'card-view');
assert.equal(reclick.run('state.index'), 16);
assert.equal(reclick.run('state.revealed'), true);
assert.equal(reclick.run('state.completed'), true);

const lookup = make([13], {
  url: 'http://localhost/Mots.html?screen=dictionary&dict=fr&view=list&size=10&page=2',
});
lookup.run('state.index = 4');
const lookupIDs = lookup.run('JSON.stringify(deck.map(word => word.id))');
click(lookup, 'card-view');
assert.equal(lookup.run('state.index'), 4);
assert.equal(lookup.run('JSON.stringify(deck.map(word => word.id))'), lookupIDs);
assert.equal(lookup.run('state.screen'), 'dictionary');

const review = make([13]);
review.run('startReview(); state.index = 2');
const queue = review.run('JSON.stringify(reviewSession.ids)');
click(review, 'card-view');
assert.equal(review.run('state.index'), 2);
assert.equal(review.run('JSON.stringify(reviewSession.ids)'), queue);
console.log(
  'Card resume, paging, wraparound, filters, shuffled order, and dictionary isolation passed.',
);
