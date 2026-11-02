const { context, read, assert } = require('./helpers/app.cjs');
const { record, deviceB } = require('./progress-sync.cjs');

const words = Array.from({ length: 45 }, (_, index) => ({
  id: `w${index}`,
  french: `mot${String(index).padStart(2, '0')}`,
  chinese: `詞${index}`,
  example: 'Exemple.',
  category: '1',
  subcategory: '1.01',
}));
const metadataKey = 'mots.sync.metadata.v1';

function receiveRating(app, wordID, level) {
  const metadata = JSON.parse(app.store.get(metadataKey));
  const clock = metadata.counter + 100;
  metadata.records.push(record(wordID, level, clock, deviceB));
  metadata.counter = clock;
  const newValue = JSON.stringify(metadata);
  app.store.set(metadataKey, newValue);
  for (const handler of app.listeners.storage) handler({ key: metadataKey, newValue });
}

function visibleIDs(app) {
  return [...app.$('study-content').innerHTML.matchAll(/data-row-word="([^"]+)"/g)].map(
    (match) => match[1],
  );
}

for (const screen of ['study', 'dictionary']) {
  const app = context({
    source: true,
    words,
    url: `file:///tmp/Mots.html?screen=${screen}&view=list&size=10&page=3`,
  });
  const originalIDs = visibleIDs(app);
  const originalDeck = read(app, 'deck.map(word => word.id)');
  assert.equal(app.run('state.page'), 3);
  assert.equal(originalIDs[0], 'w20');
  assert.equal(originalIDs.length, 10);

  // A normal list rating is not navigation, including toggling the same dot off.
  app.run("rate('w24', 2, 'dot')");
  assert.equal(app.run("levelOf('w24')"), 2);
  assert.equal(app.run('state.page'), 3, `${screen}: a local rating retains page 3`);
  assert.deepEqual(visibleIDs(app), originalIDs);
  app.run("rate('w24', 2, 'dot')");
  assert.equal(app.run("levelOf('w24')"), 0);
  assert.equal(app.run('state.page'), 3, `${screen}: clearing a rating retains page 3`);

  // Exercise the actual cross-tab metadata path rather than invoking the render
  // callback directly. Card selection may still be on page 1 while browsing page 3.
  assert.equal(app.run('state.index'), 0);
  receiveRating(app, 'w24', 3);
  assert.equal(app.run("levelOf('w24')"), 3, 'The remote edit must actually be applied');
  assert.equal(app.run('state.page'), 3, `${screen}: a remote rating retains the visible page`);
  assert.deepEqual(visibleIDs(app), originalIDs, `${screen}: the visible first-word anchor survives`);
  assert.deepEqual(read(app, 'deck.map(word => word.id)'), originalDeck);
  assert.equal(app.ctx.location.searchParams.get('page'), '3');
}

console.log('Local and cross-tab familiarity updates retain list pagination and visible anchors.');
