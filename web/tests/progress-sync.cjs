const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const { context, read, upload, assert } = require('./helpers/app.cjs');

const source = fs.readFileSync(path.join(__dirname, '../src/js/progress-sync.js'), 'utf8');
const protocolSource = fs.readFileSync(path.join(__dirname, '../src/js/sync-protocol.js'), 'utf8');
const deletionSource = fs.readFileSync(path.join(__dirname, '../src/js/deletion-state.js'), 'utf8');
const token = `mots-${'A'.repeat(43)}`; // Transient fixture only; no live pairing.
const deviceA = '1'.repeat(32),
  deviceB = '2'.repeat(32);
const record = (wordID, level, clock = 1, deviceID = deviceA, dictionaryID = 'fr') => ({
  dictionaryID,
  wordID,
  level,
  clock,
  deviceID,
});
const snapshot = (records) => ({ version: 1, records });
const tick = async () => {
  for (let i = 0; i < 30; i++) await Promise.resolve();
};

function harness(options = {}) {
  const store = options.store || new Map();
  const timers = new Map(),
    statuses = [],
    applied = [],
    requests = [];
  let timerID = 0,
    writes = 0;
  const storage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      if (options.failWrite?.()) throw new Error('quota');
      writes++;
      store.set(key, value);
    },
  };
  const ctx = {
    window: null,
    document: { visibilityState: 'visible' },
    AbortController,
    Uint8Array,
    console,
    setTimeout,
    clearTimeout,
  };
  ctx.window = ctx;
  ctx.location = { protocol: 'https:' };
  vm.createContext(ctx);
  vm.runInContext(protocolSource, ctx);
  vm.runInContext(deletionSource, ctx);
  vm.runInContext(source, ctx);
  const api = ctx.MotsProgressSync;
  const engine = api.create({
    storage,
    crypto: webcrypto,
    available: options.available ?? true,
    getLegacy: options.getLegacy || (() => ({})),
    setTimeout: (callback, delay) => {
      const id = ++timerID;
      timers.set(id, { callback, delay });
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
    onStatus: (state) => statuses.push({ ...state }),
    onApply: (records, reason) => {
      applied.push({ records: JSON.parse(JSON.stringify(records)), reason });
      return options.onApply?.(records, reason) ?? true;
    },
    transport: async (...args) => {
      requests.push(args);
      return options.transport ? options.transport(...args) : snapshot([]);
    },
    ...(options.fetch ? { transport: undefined, fetch: options.fetch } : {}),
  });
  return {
    engine,
    api,
    deletionsAPI: ctx.MotsDeletions,
    store,
    timers,
    statuses,
    applied,
    requests,
    metadata: () => JSON.parse(store.get(api.META_KEY)),
    fire(delay) {
      const entry = [...timers].find(([, timer]) => timer.delay === delay);
      assert(entry, `Expected ${delay}ms timer`);
      timers.delete(entry[0]);
      entry[1].callback();
    },
    writes: () => writes,
  };
}

async function run() {
  const pure = harness();
  const canonical = pure.api.merge(
    [record('a', 3, 0, ''), record('b', 3, 5, deviceA)],
    [record('a', 1, 0, ''), record('b', 0, 5, deviceB)],
  );
  assert.equal(canonical[0].level, 3, 'Legacy ties prefer higher familiarity');
  assert.equal(canonical[1].level, 0, 'Device tie-break preserves a winning clear tombstone');
  assert.deepEqual(
    JSON.parse(JSON.stringify(pure.api.merge(canonical, canonical))),
    JSON.parse(JSON.stringify(canonical)),
  );
  for (const invalid of [
    { ...record('bad', 1), level: true },
    { ...record('bad', 1), clock: true },
    { ...record('bad', 1), clock: Number.MAX_SAFE_INTEGER + 1 },
    { ...record('bad', 1), deviceID: '' },
    { ...record('__proto__', 1) },
    { ...record('bad', 1), dictionaryID: 'bad\u0000id' },
    { ...record('bad', 1), wordID: '\ud800' },
  ])
    assert.throws(() => pure.api.validateSnapshot(snapshot([record('good', 2), invalid])));
  assert.throws(() => pure.api.validateSnapshot({ version: true, records: [] }));
  assert.throws(() => pure.api.validateSnapshot({ version: 1, records: [], extra: true }));
  assert.throws(() =>
    pure.api.validateSnapshot(snapshot([{ ...record('extra', 2), extra: true }])),
  );
  assert.equal(
    pure.api.merge([record('\u{10000}', 1), record('\ue000', 1)])[0].wordID,
    '\ue000',
    'Canonical order compares Unicode scalars consistently with the server',
  );

  const migrated = harness({ getLegacy: () => ({ fr: { a: 2, b: 0 }, unknown: { hidden: 3 } }) });
  assert.equal(migrated.metadata().records.length, 2);
  assert(migrated.metadata().records.every((r) => r.clock === 0 && r.deviceID === ''));
  migrated.engine.edit('fr', 'a', 0);
  assert.equal(migrated.metadata().records.find((r) => r.wordID === 'a').level, 0);
  const restarted = harness({ store: migrated.store, getLegacy: () => ({ fr: { a: 3 } }) });
  assert.equal(
    restarted.metadata().records.find((r) => r.wordID === 'a').level,
    0,
    'Legacy seeds cannot revive a tombstone',
  );
  assert.equal(restarted.metadata().deviceID, migrated.metadata().deviceID);

  let deferred,
    offline = false;
  const network = harness({
    transport: async (route, _code, body) => {
      if (offline) throw new Error('network');
      if (deferred)
        return new Promise((resolve) => {
          deferred = resolve;
        });
      return snapshot(body.records);
    },
  });
  assert(await network.engine.join(token));
  network.engine.edit('fr', 'a', 1);
  deferred = true;
  const firstRequest = network.engine.syncNow();
  await tick();
  network.engine.edit('fr', 'a', 0);
  const newerClock = network.metadata().counter;
  deferred(snapshot([record('a', 1)]));
  deferred = null;
  await firstRequest;
  assert.equal(
    network.metadata().records.find((r) => r.wordID === 'a').level,
    0,
    'In-flight stale response cannot overwrite a current local clear',
  );
  assert.equal(network.metadata().counter, newerClock);
  assert.equal(network.engine.state().phase, 'pending');
  assert(await network.engine.syncNow());
  assert.equal(network.engine.state().phase, 'synced');
  offline = true;
  network.engine.edit('fr', 'b', 2);
  assert.equal(await network.engine.syncNow(), false);
  assert.equal(network.engine.state().phase, 'offline');
  assert(network.timers.size > 0, 'Offline sync schedules a bounded retry');
  offline = false;
  network.fire(1000);
  await tick();
  assert.equal(network.engine.state().phase, 'synced');

  deferred = true;
  const interrupted = network.engine.syncNow();
  await tick();
  network.engine.disconnect();
  deferred(snapshot([record('foreign', 3, 99)]));
  deferred = null;
  await interrupted;
  assert(
    !network.metadata().records.some((r) => r.wordID === 'foreign'),
    'Disconnect ignores in-flight response',
  );
  assert.equal(network.engine.getCode(), '');
  assert.equal(network.metadata().records.find((r) => r.wordID === 'b').level, 2);

  const invalid = harness({
    transport: async () => snapshot([record('good', 3), { ...record('bad', 1), level: false }]),
  });
  invalid.engine.edit('fr', 'keep', 2);
  const beforeBad = JSON.stringify(invalid.metadata());
  assert.equal(await invalid.engine.join(token), false);
  assert.equal(
    JSON.stringify(invalid.metadata()),
    beforeBad,
    'Invalid remote snapshot fails atomically',
  );
  assert.equal(invalid.engine.state().connected, false, 'Invalid join never persists credentials');

  let fail = false;
  const persistence = harness({ failWrite: () => fail });
  assert(await persistence.engine.join(token));
  fail = true;
  assert.equal(persistence.engine.edit('fr', 'unsaved', 2), false);
  const requestsBefore = persistence.requests.length;
  assert.equal(await persistence.engine.syncNow(), false);
  assert.equal(
    persistence.requests.length,
    requestsBefore,
    'No network send when local metadata cannot persist',
  );
  assert.equal(persistence.engine.state().persistenceError, true);

  // Two tabs race from the same persisted baseline; storage events repair the union.
  const shared = new Map(),
    tabA = harness({ store: shared }),
    tabB = harness({ store: shared });
  const baseline = shared.get(tabA.api.META_KEY);
  tabA.engine.edit('fr', 'a', 1);
  const writeA = shared.get(tabA.api.META_KEY);
  shared.set(tabA.api.META_KEY, baseline); // Force an interleaved stale read/write.
  tabB.engine.edit('de', 'b', 2);
  const writeB = shared.get(tabB.api.META_KEY);
  tabA.engine.handleStorage({ key: tabA.api.META_KEY, newValue: writeB });
  tabB.engine.handleStorage({ key: tabB.api.META_KEY, newValue: writeA });
  assert.equal(tabA.metadata().records.length, 2, 'Different-word concurrent edits are retained');
  const repaired = shared.get(tabA.api.META_KEY);
  const writes = tabA.writes();
  tabA.engine.handleStorage({ key: tabA.api.META_KEY, newValue: repaired });
  assert.equal(
    tabA.writes(),
    writes,
    'Storage repair is idempotent rather than a write feedback loop',
  );
  tabA.engine.edit('fr', 'a', 3);
  const sameBase = shared.get(tabA.api.META_KEY);
  tabA.engine.edit('fr', 'a', 0);
  const clearA = shared.get(tabA.api.META_KEY);
  shared.set(tabA.api.META_KEY, sameBase);
  tabB.engine.handleStorage({ key: tabB.api.META_KEY, newValue: sameBase });
  tabB.engine.edit('fr', 'a', 2);
  const editB = shared.get(tabB.api.META_KEY);
  tabA.engine.handleStorage({ key: tabA.api.META_KEY, newValue: editB });
  tabB.engine.handleStorage({ key: tabB.api.META_KEY, newValue: clearA });
  assert.equal(
    tabA.metadata().records.find((r) => r.wordID === 'a').level,
    2,
    'Equal-device concurrent clocks use deterministic level tie-break',
  );

  const requests = [];
  const transport = harness({
    fetch: async (url, init) => {
      requests.push({ url, init });
      return { ok: true, json: async () => snapshot([]) };
    },
  });
  await transport.engine.join(token);
  assert.equal(requests[0].url, '/api/sync/exchange');
  assert.equal(requests[0].init.headers.Authorization, `Bearer ${token}`);
  assert.equal(requests[0].init.redirect, 'error');
  assert(!requests[0].url.includes(token));
  const unavailable = harness({ available: false });
  assert.equal(await unavailable.engine.join(token), false);
  assert.equal(
    unavailable.requests.length,
    0,
    'Offline-file UI cannot send credentials to an unrelated endpoint',
  );

  // Exercise real app integration without generating dist while other clients edit.
  const app = context({
    source: true,
    url: 'file:///tmp/Mots.html?screen=study&view=card',
    storage: { 'mots.progress.v1': { same: 1 } },
  });
  assert.equal(app.run('progressSync.state().available'), false);
  app.run("rate('same', 3)");
  app.run("rate('same', 3, 'dot')");
  assert.equal(app.run("levelOf('same')"), 0);
  const meta = JSON.parse(app.store.get('mots.sync.metadata.v1'));
  assert.equal(
    meta.records.find((r) => r.wordID === 'same').level,
    0,
    'Real rating toggle records explicit zero',
  );
  app.run('startReview(); state.index = 1; state.revealed = true');
  const queue = app.run('JSON.stringify(reviewSession.ids)'),
    selected = app.run('deck[state.index].id');
  app.ctx.__remote = snapshot([
    record(selected, 3, 900, deviceB),
    record('not-installed', 2, 901, deviceB, 'future-dictionary'),
  ]);
  const disk = JSON.parse(app.store.get('mots.sync.metadata.v1'));
  disk.records.push(...app.ctx.__remote.records);
  disk.counter = 901;
  app.store.set('mots.sync.metadata.v1', JSON.stringify(disk));
  for (const handler of app.listeners.storage)
    handler({ key: 'mots.sync.metadata.v1', newValue: JSON.stringify(disk) });
  assert.equal(
    app.run('JSON.stringify(reviewSession.ids)'),
    queue,
    'Remote mastery retains captured review membership',
  );
  assert.equal(app.run('deck[state.index].id'), selected, 'Remote merge retains current selection');
  assert.equal(app.run('state.revealed'), true);
  assert.equal(
    app.run('reviewSession.rated.size'),
    0,
    'Remote merge never calls review rate/advance',
  );
  assert(
    JSON.parse(app.store.get('mots.sync.metadata.v1')).records.some(
      (r) => r.dictionaryID === 'future-dictionary',
    ),
  );
  const clock = JSON.parse(app.store.get('mots.sync.metadata.v1')).counter;
  await upload(app, 'import-progress', { app: 'mots', version: 1, ratings: { same: 0, a: 2 } });
  const imported = JSON.parse(app.store.get('mots.sync.metadata.v1'));
  assert(
    imported.records.find((r) => r.wordID === 'same').clock > clock,
    'Backup import is a new versioned edit, including clear',
  );
  assert.equal(imported.records.find((r) => r.wordID === 'a').level, 2);
  for (const handler of app.$('export-progress').events.click) handler();
  const backup = await app.downloads.at(-1).text();
  assert(
    !backup.includes('mots.sync.') && !backup.includes(token),
    'Backups exclude sync metadata and pairing credentials',
  );
  assert.equal(read(app, '({ index: state.index, screen: state.screen })').screen, 'study');
  const filtered = context({
    source: true,
    url: 'file:///tmp/Mots.html?screen=study&view=card&hide=3',
  });
  filtered.run('state.index = 1; state.revealed = true');
  const selectedBefore = filtered.run('deck[state.index].id');
  const filteredMeta = JSON.parse(filtered.store.get('mots.sync.metadata.v1'));
  filteredMeta.records.push(record('same', 3, 50));
  filteredMeta.counter = 50;
  filtered.store.set('mots.sync.metadata.v1', JSON.stringify(filteredMeta));
  for (const handler of filtered.listeners.storage)
    handler({ key: 'mots.sync.metadata.v1', newValue: JSON.stringify(filteredMeta) });
  assert.equal(
    filtered.run('deck[state.index].id'),
    selectedBefore,
    'Remote removal of an earlier mastered card preserves the selected word',
  );
  assert.equal(filtered.run('state.index'), 0);
  assert.equal(filtered.run('state.revealed'), true);
  // A delayed compatibility-key event cannot revive a value already cleared in metadata.
  const staleProgress = JSON.stringify({ same: 1, a: 0 });
  filtered.store.set('mots.progress.v1', staleProgress);
  for (const handler of filtered.listeners.storage)
    handler({ key: 'mots.progress.v1', newValue: staleProgress });
  assert.equal(
    filtered.run("levelOf('same')"),
    3,
    'Delayed whole-map progress events cannot override current metadata',
  );
  console.log(
    'Progress sync protocol, tombstones, offline retry, stale/disconnected responses, atomic validation, cross-tab repair, fixed transport, and app integration passed.',
  );
}
if (require.main === module)
  run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
module.exports = { harness, record, snapshot, tick, token, deviceA, deviceB };
