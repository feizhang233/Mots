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

// Returning from a list keeps the exact card, even when it is already rated and
// an earlier word on the same page is still unstudied.
const roundTrip = make([0, 20], {
  url: 'http://localhost/Mots.html?screen=study&category=all&view=card&size=10',
});
roundTrip.run('for (let i = 0; i < 23; i++) navigateWord(1); state.revealed = true');
const roundTripIDs = roundTrip.run('JSON.stringify(deck.map(word => word.id))');
const roundTripRatings = roundTrip.store.get('mots.progress.v1');
click(roundTrip, 'list-view');
assert.equal(roundTrip.run('state.page'), 3, 'List opens the current card’s containing page');
assert(roundTrip.$('study-content').innerHTML.includes('beta-23'));
click(roundTrip, 'card-view');
check(roundTrip, 'w23', 3);
assert.equal(roundTrip.run('JSON.stringify(deck.map(word => word.id))'), roundTripIDs);
assert.equal(roundTrip.store.get('mots.progress.v1'), roundTripRatings);

// Browsing the list and changing its page size must not overwrite the card anchor.
click(roundTrip, 'list-view');
roundTrip.run('state.page = 1; settings.pageSize = 20; buildDeck(false)');
click(roundTrip, 'card-view');
check(roundTrip, 'w23', 2);
roundTrip.run('navigateWord(1)');
click(roundTrip, 'list-view');
click(roundTrip, 'card-view');
check(roundTrip, 'w24', 2);

// Rebuilding membership while browsing the list restores by word identity, not
// by the old index. A removed card falls back to its nearest remaining neighbor.
const membership = make([0], {
  url: 'http://localhost/Mots.html?screen=study&category=all&view=card&size=10',
});
membership.run('state.index = 23');
click(membership, 'list-view');
membership.run('changeDeletion(state.dictionary, "w2", true)');
click(membership, 'card-view');
check(membership, 'w23', 3);
click(membership, 'list-view');
membership.run('changeDeletion(state.dictionary, "w23", true)');
click(membership, 'card-view');
check(membership, 'w24', 3);

// A changed study scope starts fresh; its initial list-to-card behavior is still
// the first visible unstudied word from the list page.
const changedScope = make([0, 35], {
  url: 'http://localhost/Mots.html?screen=study&category=all&view=card&size=10',
});
changedScope.run('state.index = 23');
click(changedScope, 'list-view');
changedScope.run('state.category = "2"; buildDeck()');
click(changedScope, 'card-view');
check(changedScope, 'w35', 1);

const randomRoundTrip = make([0, 20], {
  url: 'http://localhost/Mots.html?screen=study&category=all&view=card&size=10&order=random',
});
randomRoundTrip.run(
  `randomOrder = ${JSON.stringify([...words].reverse().map((word) => word.id))}; buildDeck(false); state.index = 23`,
);
const randomAnchor = randomRoundTrip.run('deck[state.index].id');
const randomRoundTripIDs = randomRoundTrip.run('JSON.stringify(deck.map(word => word.id))');
click(randomRoundTrip, 'list-view');
click(randomRoundTrip, 'card-view');
check(randomRoundTrip, randomAnchor, 3);
assert.equal(randomRoundTrip.run('JSON.stringify(deck.map(word => word.id))'), randomRoundTripIDs);

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
  'Card round-trip resume, membership changes, paging, filters, shuffled order, and dictionary isolation passed.',
);
