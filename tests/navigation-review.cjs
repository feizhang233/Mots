const { context, assert } = require('./helpers/app.cjs');

const home = context();
assert.equal(home.run('state.screen'), 'home');
assert(home.$('home-link').href.includes('/Mots.html?'));
assert(home.$('home-link').href.includes('screen=home'));

const legacy = context({ url: 'http://localhost/Mots.html?lang=fr&category=2&sub=2.01&view=list' });
assert.equal(legacy.run('state.screen'), 'study');
assert.equal(legacy.run('state.category'), '2');
assert.equal(legacy.run('state.subcategory'), '2.01');

const lookup = context({
  storage: {
    'mots.progress.v1': { same: 3 },
    'mots.settings.v2': { visibility: { fr: [3] }, view: 'card' },
  },
  url: 'http://localhost/Mots.html?screen=dictionary&dict=fr',
});
assert.equal(lookup.run('deck.length'), 3, 'Dictionary search includes mastered words');
assert.equal(lookup.run('deck[0].id'), 'a', 'Dictionary is alphabetical');
lookup.run("state.query = 'age'; buildDeck()");
assert.equal(lookup.run('deck.length'), 1);
assert.equal(lookup.run('deck[0].id'), 'a', 'Search ignores accents');
lookup.ctx.document.activeElement = lookup.$('search-input');
lookup.$('search-input').tagName = 'INPUT';
for (const handler of lookup.listeners['document:keydown'] || []) {
  handler({
    key: 'Escape',
    isComposing: false,
    preventDefault() {},
    altKey: false,
    ctrlKey: false,
    metaKey: false,
  });
}
assert.equal(
  lookup.run('state.searchOpen'),
  true,
  'Dictionary search stays accessible after Escape',
);

const library = [
  {
    id: 'dict-test',
    title: '我的法語',
    language: 'fr',
    categories: [{ id: 'x', name: '自訂', subcategories: [{ id: 'x.1', name: '自訂詞' }] }],
    words: [
      {
        id: 'same',
        term: 'nouveau',
        meanings: { 'zh-Hant': '新詞' },
        example: 'Un nouveau mot.',
        category: 'x',
        subcategory: 'x.1',
      },
    ],
  },
];
const isolated = context({
  storage: {
    'mots.dictionaries.v1': library,
    'mots.progress.v1': { same: 3 },
    'mots.progress.dictionary.dict-test.v1': { same: 1 },
  },
});
isolated.run("applyDictionary('dict-test')");
assert.equal(isolated.run('state.language'), 'fr');
assert.equal(isolated.run("levelOf('same')"), 1);
assert.equal(isolated.run("categoryOf('x').name"), '自訂');
isolated.run("rate('same', 2)");
assert.equal(JSON.parse(isolated.store.get('mots.progress.dictionary.dict-test.v1')).same, 2);
assert.equal(JSON.parse(isolated.store.get('mots.progress.v1')).same, 3);
isolated.run("speak('same')");
assert.equal(
  isolated.$('pronunciation-player').src,
  undefined,
  'Imported IDs must not reuse built-in audio',
);
isolated.run("applyDictionary('fr'); speak('same')");
assert.equal(isolated.run("levelOf('same')"), 3);
assert.equal(isolated.$('pronunciation-player').src, 'audio/old-book.m4a');

const words = Array.from({ length: 45 }, (_, i) => ({
  id: `w${i}`,
  french: `mot${i}`,
  chinese: `詞${i}`,
  example: 'Exemple',
  category: '1',
  subcategory: '1.01',
}));
const ratings = Object.fromEntries(
  words.map((word, i) => [word.id, i < 12 ? (i % 2 ? 1 : 2) : i === 44 ? 3 : 0]),
);
const pagedLookup = context({
  words,
  url: 'http://localhost/Mots.html?screen=dictionary&view=card&size=10&page=2',
});
assert.equal(pagedLookup.run('state.page'), 2);
assert.equal(pagedLookup.ctx.location.searchParams.get('page'), '2');

const review = context({
  words,
  storage: {
    'mots.progress.v1': ratings,
    'mots.settings.v2': { visibility: { fr: [0, 1, 2, 3] } },
  },
});
review.run('startReview()');
assert.equal(review.run('deck.length'), 20);
assert.equal(review.run('new Set(reviewSession.ids).size'), 20);
assert.equal(review.run('deck.filter(word => [1, 2].includes(levelOf(word.id))).length'), 12);
assert.equal(review.run('deck.some(word => levelOf(word.id) === 3)'), false);
const initialQueue = review.run('JSON.stringify(reviewSession.ids)');
review.run('rate(deck[state.index].id, 3)');
assert.equal(review.run('deck.length'), 20);
assert.equal(
  review.run('JSON.stringify(reviewSession.ids)'),
  initialQueue,
  'Rating must not mutate the captured review queue',
);
assert.equal(review.run('reviewSession.rated.size'), 1);
assert.equal(review.run('state.index'), 1);
for (let remaining = 20; !review.run('state.completed') && remaining > 0; remaining--) {
  review.run('rate(deck[state.index].id, 3)');
}
assert.equal(review.run('state.completed'), true);
assert.equal(review.run('reviewSession.rated.size'), 20);

const priority = context({
  words,
  storage: {
    'mots.progress.v1': Object.fromEntries(words.map((word, i) => [word.id, i < 25 ? 1 : 0])),
  },
});
priority.run('startReview()');
assert.equal(priority.run('deck.length'), 20);
assert.equal(priority.run('deck.every(word => levelOf(word.id) === 1)'), true);

const mastered = context({
  words,
  storage: {
    'mots.progress.v1': Object.fromEntries(words.map((word) => [word.id, 3])),
  },
});
mastered.run('startReview()');
assert.equal(mastered.run('deck.length'), 0);
assert(mastered.$('study-content').innerHTML.includes('目前沒有待複習'));

const directReview = context({ url: 'http://localhost/Mots.html?screen=review' });
assert.equal(directReview.run('state.screen'), 'review');
assert.equal(directReview.run('reviewSession.ids.length'), 3);
console.log('Navigation, isolated dictionaries, search, and captured review queues passed.');
