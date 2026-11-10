const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { webcrypto, createHash } = require('node:crypto');
const { context, read, upload } = require('./helpers/app.cjs');
const root = path.resolve(__dirname, '../..');
const token = `mots-${'A'.repeat(43)}`;
const clone = (value) => JSON.parse(JSON.stringify(value));
const categories = [{ id: '1', name: '單元', subcategories: [{ id: '1.01', name: '詞條' }] }];
const word = (id, term) => ({
  id,
  term,
  language: 'fr',
  category: '1',
  subcategory: '1.01',
  meanings: { 'zh-Hant': term },
  example: '',
  examples: [],
});
const book = (id, title, words = []) => ({
  id,
  title,
  language: 'fr',
  kind: 'vocabulary',
  grammarMode: 'standard',
  categories,
  words,
});
const digest = (api, records) => createHash('sha256').update(api.canonical(records)).digest('hex');
const tick = async () => {
  for (let i = 0; i < 100; i++) await Promise.resolve();
  await new Promise((resolve) => setImmediate(resolve));
};
const eventually = async (condition) => {
  for (let i = 0; i < 100; i++) {
    if (condition()) return;
    await new Promise((resolve) => setTimeout(resolve, 2));
  }
  assert(condition(), 'Expected asynchronous checkpoint');
};

function client(server, options = {}) {
  const storageMap = options.storage || new Map(),
    storage = {
      getItem: (k) => storageMap.get(k) ?? null,
      setItem: (k, v) => storageMap.set(k, String(v)),
    };
  const database = options.database || new Map(),
    timers = new Map();
  let timerID = 0;
  const ctx = {
    window: null,
    document: { visibilityState: 'visible' },
    location: { protocol: 'https:' },
    Uint8Array,
    AbortController,
    TextEncoder,
    TextDecoder,
    console,
    crypto: webcrypto,
    localStorage: storage,
    setTimeout: (f, ms) => {
      const n = ++timerID;
      timers.set(n, { f, ms });
      return n;
    },
    clearTimeout: (n) => timers.delete(n),
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  for (const name of [
    'sync-protocol',
    'deletion-state',
    'memory',
    'content-state',
    'progress-sync',
  ])
    vm.runInContext(fs.readFileSync(path.join(root, 'web/src/js', name + '.js'), 'utf8'), ctx, {
      filename: name + '.js',
    });
  let projection = [];
  const content = ctx.MotsContent.create({
    base: [book('fr', 'French', [word('a', 'ancien')])],
    storage,
    crypto: webcrypto,
    getLegacy: options.getLegacy || (() => ({})),
    persistence: {
      load: async (k) => clone(database.get(k) ?? null),
      update: async (fn) => {
        const next = fn(clone(database.get('metadata') ?? null));
        database.set('metadata', clone(next));
        return clone(next);
      },
      catalog: async (v) => database.set('catalog', clone(v)),
    },
    onApply: (books) => {
      projection = clone(books);
      return true;
    },
  });
  const originalReceive = content.receive;
  content.receive = async (...args) => {
    if (options.beforeReceive) await options.beforeReceive(...args);
    return originalReceive(...args);
  };
  const requests = [];
  const engine = ctx.MotsProgressSync.create({
    storage,
    crypto: webcrypto,
    available: true,
    content,
    setTimeout: ctx.setTimeout,
    clearTimeout: ctx.clearTimeout,
    transport: async (route, code, body) => {
      requests.push({ route, code, body: clone(body) });
      return server(route, code, clone(body), ctx.MotsContent);
    },
  });
  return { ctx, engine, content, requests, database, storage: storageMap, books: () => projection };
}

async function run() {
  let records = [],
    fail = false,
    held = null,
    corruptDigest = false;
  const transport = async (route, _code, body, api) => {
    if (route !== 'content') return { version: 1, records: body.records || [] };
    if (fail) throw new Error('network');
    records = clone(api.merge(records, body.records));
    const hash = digest(api, records),
      unchanged = body.knownDigest === hash;
    const result = {
      version: 1,
      records: unchanged ? [] : clone(records),
      digest: corruptDigest ? '0'.repeat(64) : hash,
      unchanged,
    };
    if (held) {
      const wait = held;
      held = null;
      return wait(result);
    }
    return result;
  };
  const a = client(transport),
    b = client(transport);
  await Promise.all([a.content.ready(), b.content.ready()]);
  assert(await a.engine.join(token));
  assert(await b.engine.join(token));
  await a.content.upsertBook(book('dict-private', '私有詞典', [word('custom', 'premier')]));
  a.engine.contentChanged();
  assert(await a.engine.syncNow());
  assert(await b.engine.syncNow());
  assert.equal(b.books().find((d) => d.id === 'dict-private').words[0].term, 'premier');
  await b.content.upsertWords('dict-private', [word('custom', 'deuxième')]);
  b.engine.contentChanged();
  fail = true;
  assert.equal(await b.engine.syncNow(), false);
  assert.notEqual(b.engine.state().phase, 'synced');
  assert.equal(b.books().find((d) => d.id === 'dict-private').words[0].term, 'deuxième');
  fail = false;
  assert(await b.engine.syncNow());
  assert(await a.engine.syncNow());
  assert.equal(a.books().find((d) => d.id === 'dict-private').words[0].term, 'deuxième');
  // A progress-only change never reuploads the multi-record private library.
  a.engine.edit('fr', 'a', 2);
  assert(await a.engine.syncNow());
  assert.equal(a.requests.filter((r) => r.route === 'content').at(-1).body.records.length, 0);
  assert.match(
    a.requests.filter((r) => r.route === 'content').at(-1).body.knownDigest,
    /^[0-9a-f]{64}$/,
  );
  assert.equal(
    a.books().find((d) => d.id === 'dict-private').words.length,
    1,
    'unchanged+empty means reuse the acknowledged snapshot',
  );

  let release, entered;
  held = (result) => {
    entered = result;
    return new Promise((resolve) => {
      release = resolve;
    });
  };
  const stale = a.engine.syncNow();
  await tick();
  assert(release);
  await a.content.upsertWords('dict-private', [word('custom', 'troisième')]);
  a.engine.contentChanged();
  release(entered);
  await stale;
  assert.equal(
    a.books().find((d) => d.id === 'dict-private').words[0].term,
    'troisième',
    'An in-flight edit survives a stale content response',
  );
  assert.equal(a.engine.state().phase, 'pending');
  assert(await a.engine.syncNow());
  assert(await b.engine.syncNow());
  assert.equal(b.books().find((d) => d.id === 'dict-private').words[0].term, 'troisième');

  await a.content.archiveBook('dict-private');
  a.engine.contentChanged();
  assert(await a.engine.syncNow());
  assert(await b.engine.syncNow());
  assert(!b.books().some((d) => d.id === 'dict-private'));
  await b.content.archiveBook('dict-private', false);
  b.engine.contentChanged();
  assert(await b.engine.syncNow());
  assert(await a.engine.syncNow());
  assert(a.books().some((d) => d.id === 'dict-private'));
  const before = clone(await a.content.snapshot());
  corruptDigest = true;
  await b.content.upsertWords('dict-private', [word('custom', 'quatrième')]);
  b.engine.contentChanged();
  assert.equal(await b.engine.syncNow(), false);
  assert.notEqual(b.engine.state().phase, 'synced');
  assert.equal(await a.engine.syncNow(), false);
  assert.deepEqual(
    clone(await a.content.snapshot()),
    before,
    'A bad digest cannot poison the acknowledged local library',
  );
  corruptDigest = false;
  assert(await b.engine.syncNow());
  assert(await a.engine.syncNow());

  // Disconnect while a persistence task is queued invalidates the old response.
  let delayed = false,
    releaseReceive,
    receiveStarted;
  const c = client(transport, {
    beforeReceive: async () => {
      if (delayed) {
        receiveStarted = true;
        await new Promise((resolve) => {
          releaseReceive = resolve;
        });
      }
    },
  });
  await c.content.ready();
  assert(await c.engine.join(token));
  const savedBefore = clone(await c.content.snapshot());
  await a.content.upsertWords('dict-private', [word('custom', 'cinquième')]);
  a.engine.contentChanged();
  assert(await a.engine.syncNow());
  delayed = true;
  const oldResponse = c.engine.syncNow();
  await eventually(() => receiveStarted);
  c.engine.disconnect();
  releaseReceive();
  assert.equal(await oldResponse, false);
  assert.deepEqual(clone(await c.content.snapshot()), savedBefore);
  assert.equal(c.engine.state().connected, false);
  [a, b, c].forEach((c) => c.engine.stop());

  // Real application imports edit source IDs rather than manufacturing new words.
  const app = context({ source: true });
  await app.run('contentState.ready()');
  app.run('progress.fr.same=2; progressSync.refresh()');
  await upload(app, 'import-vocabulary', {
    language: 'fr',
    words: [
      {
        id: 'same',
        term: 'zèbre corrigé',
        meanings: { 'zh-Hant': '校正斑馬' },
        category: '1',
        subcategory: '1.01',
      },
    ],
  });
  assert.equal(app.run("sourceWords('fr').filter(w=>w.id==='same').length"), 1);
  assert.equal(app.run("sourceWords('fr').find(w=>w.id==='same').term"), 'zèbre corrigé');
  assert.equal(app.run('progress.fr.same'), 2);
  await upload(app, 'import-dictionary', book('unused', '第一本', [word('private', 'mot')]));
  const id = app.run('state.dictionary');
  app.run("rate('private',2)");
  await upload(app, 'import-dictionary', book(id, '更新書名', [word('private', 'mot corrigé')]));
  assert.equal(app.run('state.dictionary'), id);
  assert.equal(app.run("levelOf('private')"), 2);
  app.$('rename-dictionary-title').value = '跨裝置書名';
  await app.$('rename-dictionary').events.click[0]();
  assert.equal(app.run('dictionaryOf(state.dictionary).title'), '跨裝置書名');
  const restarted = context({ source: true, storage: Object.fromEntries(app.store) });
  await restarted.run('contentState.ready()');
  assert.equal(
    restarted.run('state.dictionary'),
    id,
    'An IndexedDB/journal-only book keeps its saved navigation after async hydration',
  );
  assert.equal(restarted.run('dictionaryOf(state.dictionary).title'), '跨裝置書名');
  const beforeInvalid = read(app, '({progress,memoryRecords,dictionaryLibrary})');
  await upload(app, 'import-progress', {
    app: 'mots',
    version: 3,
    progress: { fr: { same: 3 } },
    content: {
      version: 1,
      records: [
        {
          dictionaryID: 'fr',
          kind: 'word',
          wordID: 'same',
          deleted: false,
          payload: { id: 'same', term: 'bad' },
        },
      ],
    },
  });
  assert.deepEqual(
    read(app, '({progress,memoryRecords,dictionaryLibrary})'),
    beforeInvalid,
    'Bad portable content rejects before any progress mutation',
  );
  const fixture = JSON.parse(fs.readFileSync(path.join(root, 'sync/content_fixtures.json')));
  assert.equal(
    a.ctx.MotsContent.canonical(a.ctx.MotsContent.merge(fixture.records)),
    fixture.canonicalRecordsJSON,
  );
  assert.equal(digest(a.ctx.MotsContent, a.ctx.MotsContent.merge(fixture.records)), fixture.digest);
  console.log(
    'Full content sync: bidirectional books/words, offline retry, digest deltas, in-flight edits, archive/restore, stale pairing, source-ID edits and atomic backup rejection passed.',
  );
}
run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
