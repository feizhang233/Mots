'use strict';
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  vm = require('node:vm'),
  path = require('node:path');
const { webcrypto, createHash } = require('node:crypto');
const copy = (value) => JSON.parse(JSON.stringify(value));
class MemoryDB {
  constructor() {
    this.values = new Map();
    this.tail = Promise.resolve();
    this.gate = null;
  }
  async load(key) {
    return copy(this.values.get(key) ?? null);
  }
  update(fn) {
    const task = this.tail
      .catch(() => {})
      .then(async () => {
        if (this.gate) {
          const gate = this.gate;
          this.gate = null;
          gate.enter();
          await gate.wait;
        }
        const next = fn(copy(this.values.get('metadata') ?? null));
        if (next !== null && next !== undefined) this.values.set('metadata', copy(next));
        return copy(next);
      });
    this.tail = task;
    return task;
  }
  async catalog(value) {
    this.values.set('catalog', copy(value));
    return true;
  }
}
function storage() {
  const map = new Map();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
}
const scope = {
  window: { crypto: webcrypto, setTimeout, clearTimeout },
  TextEncoder,
  TextDecoder,
  AbortController,
};
vm.runInNewContext(
  fs.readFileSync(path.join(__dirname, '../src/js/content-state.js'), 'utf8'),
  scope,
);
const C = scope.window.MotsContent;
const categories = [{ id: '1', name: '優先掌握', subcategories: [{ id: '1.01', name: '名詞' }] }];
const word = (id, term = '空', meaning = '空的') => ({
  id,
  term,
  reading: 'から',
  language: 'ja',
  meaning,
  meanings: { 'zh-Hant': meaning },
  category: '1',
  subcategory: '1.01',
  example: '空です。',
  examples: [
    {
      text: '空です。',
      translations: { 'zh-Hant': '是空的。' },
      furigana: [
        { text: '空', reading: 'から' },
        { text: 'です。', reading: '' },
      ],
    },
  ],
});
const base = {
  id: 'ja',
  title: '日語原本',
  language: 'ja',
  kind: 'vocabulary',
  grammarMode: 'standard',
  categories,
  words: [word('base-empty')],
};
const custom = { ...copy(base), id: 'dict-legacy', title: '我的詞典', words: [word('legacy-1')] };
const record = (dictionaryID, kind, wordID, payload, clock = 50) => ({
  dictionaryID,
  kind,
  wordID,
  payload,
  clock,
  deviceID: 'f'.repeat(32),
  deleted: false,
});
function owner(db = new MemoryDB(), extras = {}) {
  return C.create({
    base: [copy(base)],
    storage: storage(),
    crypto: webcrypto,
    persistence: db,
    fetch: null,
    ...extras,
  });
}
function find(o, id) {
  return o.books().find((b) => b.id === id);
}
(async () => {
  const dbA = new MemoryDB();
  let migrations = 0;
  const a = owner(dbA, {
    getLegacy: () => {
      migrations++;
      return { books: [copy(custom)], extensions: { ja: [word('extra-1')] } };
    },
  });
  await a.ready();
  assert.equal(migrations, 1);
  const seeds = await a.snapshot();
  assert.equal(seeds.length, 3);
  assert(seeds.every((r) => r.clock === 0 && r.deviceID === ''));
  assert(
    !seeds.some((r) => r.wordID === 'base-empty'),
    'Published words must not be seeded as private edits',
  );
  assert.equal(find(a, 'ja').words.length, 2);
  assert(dbA.values.get('metadata').migrationDone);
  const restarted = owner(dbA, {
    getLegacy: () => {
      throw new Error('Must not seed projections twice');
    },
  });
  await restarted.ready();
  assert.deepEqual(copy(await restarted.snapshot()), copy(seeds));

  const b = owner();
  await b.ready();
  await b.receive(seeds);
  assert.equal(find(b, 'dict-legacy').words[0].id, 'legacy-1');
  await b.upsertWords('dict-legacy', [
    word('legacy-1', '空', '修正後的釋義'),
    word('new-2', '箱', '箱子'),
  ]);
  await a.receive(await b.snapshot());
  assert.equal(
    find(a, 'dict-legacy').words.find((w) => w.id === 'legacy-1').meanings['zh-Hant'],
    '修正後的釋義',
  );
  assert.equal(find(a, 'dict-legacy').words.length, 2);
  await a.upsertWords('ja', [word('base-empty', '空', '私人修改')]);
  await b.receive(await a.snapshot());
  assert.equal(find(b, 'ja').words.find((w) => w.id === 'base-empty').meaning, '私人修改');
  const unrelated = owner();
  await unrelated.ready();
  assert.equal(find(unrelated, 'ja').words[0].meaning, '空的');
  const minimalOwner = owner();
  await minimalOwner.ready();
  await minimalOwner.receive([
    record('ja', 'word', 'base-empty', {
      id: 'base-empty',
      term: '空',
      language: 'ja',
      category: '1',
      subcategory: '1.01',
      meaning: '整筆修訂的新釋義',
    }),
  ]);
  const minimalWord = find(minimalOwner, 'ja').words[0];
  assert.equal(minimalWord.meanings['zh-Hant'], '整筆修訂的新釋義');
  assert.equal(minimalWord.reading, '');
  assert.equal(minimalWord.examples.length, 0, 'Missing optional word fields use shared defaults, not stale baseline content');

  await b.archiveBook('dict-legacy');
  await a.receive(await b.snapshot());
  assert(!find(a, 'dict-legacy'));
  assert.equal(a.allBooks().find((b) => b.id === 'dict-legacy').words.length, 2);
  await a.archiveBook('dict-legacy', false);
  await b.receive(await a.snapshot());
  assert.equal(
    find(b, 'dict-legacy').words.find((w) => w.id === 'legacy-1').meaning,
    '修正後的釋義',
  );
  const portable = copy(a.portable());
  assert(portable.records.every((r) => !('clock' in r) && !('deviceID' in r)));
  const restored = owner();
  await restored.ready();
  await restored.importPortable(portable);
  assert.equal(find(restored, 'dict-legacy').words.length, 2);
  assert((await restored.snapshot()).every((r) => r.clock > 0 && r.deviceID.length === 32));
  const before = copy(await restored.snapshot());
  await assert.rejects(restored.updateBook('dict-legacy', { language: 'fr' }));
  assert.deepEqual(
    copy(await restored.snapshot()),
    before,
    'Invalid book identity change cannot partially mutate content',
  );

  const shared = new MemoryDB(),
    tab1 = owner(shared),
    tab2 = owner(shared);
  await Promise.all([tab1.ready(), tab2.ready()]);
  await Promise.all([
    tab1.upsertWords('ja', [word('base-empty', '空', '第一個修改')]),
    tab2.upsertWords('ja', [word('parallel-2', '箱', '同時新增')]),
    tab1.upsertWords('ja', [word('base-empty', '空', '最後修改')]),
  ]);
  const fresh = owner(shared);
  await fresh.ready();
  const concurrent = await fresh.snapshot();
  assert.equal(concurrent.length, 2);
  assert.equal(
    shared.values.get('metadata').counter,
    3,
    'Every local edit stamps inside one atomic transaction',
  );
  assert.equal(new Set(concurrent.map((r) => r.clock)).size, 2);
  assert.equal(find(fresh, 'ja').words.find((w) => w.id === 'base-empty').meaning, '最後修改');
  assert(find(fresh, 'ja').words.some((w) => w.id === 'parallel-2'));

  const pending = record('dict-future', 'word', 'future-1', word('future-1'));
  await fresh.receive([pending]);
  assert(!find(fresh, 'dict-future'));
  const futureMeta = { ...C.metaPayload(custom), id: 'dict-future', categories: [] };
  await fresh.receive([record('dict-future', 'dictionary', '*', futureMeta)]);
  assert.equal(find(fresh, 'dict-future').words[0].id, 'future-1');
  assert(
    find(fresh, 'dict-future').categories.some((c) => c.id === '1'),
    'Orphan navigation is derived without dropping the record',
  );
  const staleDB = new MemoryDB(),
    stale = owner(staleDB);
  await stale.ready();
  const prior = copy(staleDB.values.get('metadata'));
  let enter,
    release,
    current = true;
  const entered = new Promise((resolve) => {
    enter = resolve;
  });
  staleDB.gate = {
    enter,
    wait: new Promise((resolve) => {
      release = resolve;
    }),
  };
  const delivery = stale.receive(seeds, () => current),
    rejected = assert.rejects(delivery, /stale-content/);
  await entered;
  current = false;
  release();
  await rejected;
  assert.deepEqual(
    copy(staleDB.values.get('metadata')),
    prior,
    'Disconnect during queued persistence must veto stale content',
  );

  const published = [
    { ...copy(base), words: [word('base-empty', '空', '公開新版')] },
    { ...copy(base), id: 'vocab-ja-n2-hongbao', title: 'N2 紅寶書' },
  ];
  const raw = JSON.stringify(published),
    hash = createHash('sha256').update(raw).digest('hex');
  let badHash = false,
    offline = false,
    catalogDownloads = 0;
  const fetch = async (url) => {
    if (offline) throw new Error('network');
    if (url.endsWith('content-version.json'))
      return {
        ok: true,
        json: async () => ({
          version: 'a'.repeat(64),
          catalogSHA256: badHash ? '0'.repeat(64) : hash,
          catalogPath: '/database/catalog.json',
        }),
      };
    catalogDownloads++;
    return { ok: true, arrayBuffer: async () => Uint8Array.from(Buffer.from(raw)).buffer };
  };
  const publicClient = owner(dbA, { fetch });
  await publicClient.ready();
  const privateBefore = copy(await publicClient.snapshot());
  badHash = true;
  await assert.rejects(publicClient.refreshCatalog(true));
  assert(!find(publicClient, 'vocab-ja-n2-hongbao'));
  badHash = false;
  await publicClient.refreshCatalog(true);
  assert(find(publicClient, 'vocab-ja-n2-hongbao'));
  assert.equal(
    find(publicClient, 'ja').words.find((w) => w.id === 'base-empty').meaning,
    '私人修改',
  );
  assert.deepEqual(
    copy(await publicClient.snapshot()),
    privateBefore,
    'Published updates cannot manufacture private edits',
  );
  const downloads = catalogDownloads;
  await publicClient.refreshCatalog(true);
  assert.equal(catalogDownloads, downloads);
  offline = true;
  await assert.rejects(publicClient.refreshCatalog(true));
  assert(find(publicClient, 'vocab-ja-n2-hongbao'));
  const cached = owner(dbA, { fetch });
  await cached.ready();
  assert(find(cached, 'vocab-ja-n2-hongbao'), 'Verified public cache survives restart offline');
  dbA.values.get('catalog').raw = JSON.stringify([copy(base)]);
  const damaged = owner(dbA, { fetch });
  await damaged.ready();
  assert(!find(damaged, 'vocab-ja-n2-hongbao'));
  assert.equal(
    find(damaged, 'ja').words.find((w) => w.id === 'base-empty').meaning,
    '私人修改',
    'A damaged baseline cache cannot erase private edits',
  );
  console.log(
    'Content state: bidirectional words/books, isolated owners, atomic cross-tab revisions, one-time migration, archive/restore, portable backups, stale-session veto, SHA catalog update and offline/corrupt-cache recovery passed.',
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
