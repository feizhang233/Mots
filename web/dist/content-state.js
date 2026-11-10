(() => {
  'use strict';
  // Public editions and private revisions have separate ownership. A downloaded
  // edition is never converted into a local edit or sent to another pairing.
  const MAX = Number.MAX_SAFE_INTEGER,
    MAX_RECORDS = 100000;
  const META_KEY = 'mots.content.metadata.v1',
    BEACON_KEY = 'mots.content.changed.v1';
  const LANGUAGES = new Set(['fr', 'de', 'ja']);
  const MEANINGS = new Set(['zh-Hant', 'zh-Hans', 'en', 'fr', 'de', 'ja']);
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const object = (o) => o !== null && typeof o === 'object' && !Array.isArray(o);
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const integer = (n, max = MAX) => Number.isSafeInteger(n) && n >= 0 && n <= max;
  function fail() {
    throw new Error('invalid-content');
  }
  function safeObject(o) {
    if (
      !object(o) ||
      Object.keys(o).some((k) => ['__proto__', 'constructor', 'prototype'].includes(k))
    )
      fail();
    return o;
  }
  function fields(o, allowed) {
    safeObject(o);
    if (Object.keys(o).some((k) => !allowed.includes(k))) fail();
  }
  function string(s, limit, required = true) {
    if (
      typeof s !== 'string' ||
      [...s].length > limit ||
      (required && !s.trim()) ||
      [...s].some(
        (c) => /\p{Cs}/u.test(c) || (/\p{Cc}/u.test(c) && !['\n', '\r', '\t'].includes(c)),
      )
    )
      fail();
    return s;
  }
  function identifier(s, limit) {
    string(s, limit, false);
    if (!s.length) fail();
    if (/[\p{Cc}\p{Cs}]/u.test(s) || ['__proto__', 'constructor', 'prototype'].includes(s)) fail();
    return s;
  }
  function utf8Compare(a, b) {
    const aa = Array.from(a),
      bb = Array.from(b);
    for (let i = 0; i < Math.min(aa.length, bb.length); i++) {
      const d = aa[i].codePointAt(0) - bb[i].codePointAt(0);
      if (d) return d < 0 ? -1 : 1;
    }
    return Math.sign(aa.length - bb.length);
  }
  function canonical(value) {
    if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
    if (object(value))
      return (
        '{' +
        Object.keys(value)
          .sort(utf8Compare)
          .map((k) => JSON.stringify(k) + ':' + canonical(value[k]))
          .join(',') +
        '}'
      );
    return JSON.stringify(value);
  }
  function categories(value) {
    if (!Array.isArray(value) || value.length > 100) fail();
    const parents = new Set(),
      children = new Set();
    for (const c of value) {
      fields(c, ['id', 'name', 'subcategories']);
      identifier(c.id, 128);
      string(c.name, 80);
      if (parents.has(c.id) || !Array.isArray(c.subcategories) || !c.subcategories.length) fail();
      parents.add(c.id);
      for (const s of c.subcategories) {
        fields(s, ['id', 'name']);
        identifier(s.id, 256);
        string(s.name, 80);
        if (children.has(s.id)) fail();
        children.add(s.id);
      }
    }
    if (children.size > 300) fail();
    return value;
  }
  function metadata(value, id) {
    fields(value, [
      'id',
      'title',
      'language',
      'kind',
      'grammarMode',
      'categories',
      'audioMode',
      'description',
      'sourceInfo',
      'entryCount',
      'archived',
    ]);
    const kind = own(value, 'kind') ? value.kind : 'vocabulary',
      mode = own(value, 'grammarMode') ? value.grammarMode : 'standard';
    if (
      value.id !== id ||
      !LANGUAGES.has(value.language) ||
      !['vocabulary', 'grammar'].includes(kind) ||
      !['standard', 'thematic'].includes(mode) ||
      (kind !== 'grammar' && mode !== 'standard')
    )
      fail();
    string(value.title, 80);
    categories(value.categories);
    if (own(value, 'archived') && typeof value.archived !== 'boolean') fail();
    if (own(value, 'description')) string(value.description, 2000, false);
    if (
      own(value, 'sourceInfo') &&
      (typeof value.sourceInfo !== 'string' ||
        value.sourceInfo.length > 256 ||
        !/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(value.sourceInfo) ||
        value.sourceInfo.split('/').includes('..'))
    )
      fail();
    if (own(value, 'audioMode') && value.audioMode !== 'speech') fail();
    if (own(value, 'entryCount') && !integer(value.entryCount, 100000)) fail();
    return value;
  }
  function word(value, id) {
    fields(value, [
      'id',
      'term',
      'meaning',
      'meanings',
      'example',
      'examples',
      'category',
      'subcategory',
      'language',
      'audio',
      'part',
      'pattern',
      'explanation',
      'reading',
      'headword',
      'order',
    ]);
    if (value.id !== id) fail();
    string(value.term, 180);
    identifier(value.category, 128);
    identifier(value.subcategory, 256);
    if (!LANGUAGES.has(value.language)) fail();
    const meanings = own(value, 'meanings') ? value.meanings : {};
    safeObject(meanings);
    if (
      !Object.values(meanings).some((v) => typeof v === 'string' && v.trim()) &&
      !(typeof value.meaning === 'string' && value.meaning.trim())
    )
      fail();
    for (const [code, text] of Object.entries(meanings)) {
      if (!MEANINGS.has(code)) fail();
      string(text, 1600, false);
    }
    for (const [name, limit] of [
      ['meaning', 1600],
      ['example', 2000],
      ['pattern', 2000],
      ['explanation', 6000],
      ['headword', 180],
    ])
      if (own(value, name)) string(value[name], limit, false);
    if (own(value, 'headword')) string(value.headword, 180);
    if (own(value, 'part') && value.part !== null) string(value.part, 100, false);
    if (
      own(value, 'reading') &&
      (typeof value.reading !== 'string' ||
        [...value.reading].length > 180 ||
        !/^[ぁ-ゖァ-ヶー～〜・/]*$/u.test(value.reading))
    )
      fail();
    if (
      own(value, 'audio') &&
      value.audio !== null &&
      (typeof value.audio !== 'string' || !/^audio\/[A-Za-z0-9_.-]+\.m4a$/u.test(value.audio))
    )
      fail();
    if (own(value, 'order') && !integer(value.order, 100000000)) fail();
    if (own(value, 'examples')) {
      if (!Array.isArray(value.examples) || value.examples.length > 20) fail();
      const examples = new Set(value.example ? [value.example] : []);
      for (const supplied of value.examples) {
        const e = typeof supplied === 'string' ? { text: supplied } : supplied;
        fields(e, ['text', 'translations', 'furigana']);
        string(e.text, 2000);
        examples.add(e.text);
        if (own(e, 'translations')) {
          safeObject(e.translations);
          for (const [code, text] of Object.entries(e.translations)) {
            if (!MEANINGS.has(code)) fail();
            string(text, 2000, false);
          }
        }
        if (own(e, 'furigana')) {
          if (
            !Array.isArray(e.furigana) ||
            e.furigana.length > 2000 ||
            (e.furigana.length && e.furigana.map((s) => s.text).join('') !== e.text)
          )
            fail();
          for (const s of e.furigana) {
            fields(s, ['text', 'reading']);
            string(s.text, 2000, false);
            if (!s.text.length) fail();
            if (
              typeof s.reading !== 'string' ||
              [...s.reading].length > 2000 ||
              !/^[ぁ-ゖァ-ヶー]*$/u.test(s.reading) ||
              (s.reading && !/^[一-龯々]+$/u.test(s.text))
            )
              fail();
          }
        }
      }
      if (examples.size > 20) fail();
    }
    return value;
  }
  const key = (r) => JSON.stringify([r.dictionaryID, r.kind, r.wordID]);
  function compare(a, b) {
    return (
      Math.sign(a.clock - b.clock) ||
      utf8Compare(a.deviceID, b.deviceID) ||
      Number(a.deleted) - Number(b.deleted) ||
      utf8Compare(canonical(a.payload), canonical(b.payload))
    );
  }
  function validateRecords(records) {
    if (!Array.isArray(records) || records.length > MAX_RECORDS) fail();
    let bytes = 0;
    for (const r of records) {
      safeObject(r);
      if (
        Object.keys(r).sort().join(',') !==
        'clock,deleted,deviceID,dictionaryID,kind,payload,wordID'
      )
        fail();
      identifier(r.dictionaryID, 128);
      identifier(r.wordID, 256);
      if (
        !integer(r.clock) ||
        typeof r.deviceID !== 'string' ||
        !(r.clock === 0 ? r.deviceID === '' : /^[0-9a-f]{32}$/.test(r.deviceID)) ||
        typeof r.deleted !== 'boolean' ||
        !['dictionary', 'word'].includes(r.kind) ||
        (r.kind === 'dictionary') !== (r.wordID === '*')
      )
        fail();
      if (r.deleted) {
        if (r.payload !== null) fail();
      } else if (r.kind === 'dictionary') metadata(r.payload, r.dictionaryID);
      else word(r.payload, r.wordID);
      const size = unescape(encodeURIComponent(JSON.stringify(r))).length;
      if (size > 256 * 1024) fail();
      bytes += size;
    }
    if (bytes + Math.max(0, records.length - 1) + 26 > 24 * 1024 * 1024) fail();
    return records;
  }
  function merge(...sets) {
    const values = new Map();
    for (const records of sets)
      for (const r of validateRecords(records)) {
        const old = values.get(key(r));
        if (!old || compare(r, old) > 0) values.set(key(r), r);
      }
    const result = [...values.values()].sort(
      (a, b) =>
        utf8Compare(a.dictionaryID, b.dictionaryID) ||
        utf8Compare(a.kind, b.kind) ||
        utf8Compare(a.wordID, b.wordID),
    );
    validateRecords(result);
    return result;
  }
  function validateSnapshot(value) {
    if (
      !object(value) ||
      Object.keys(value).sort().join(',') !== 'records,version' ||
      value.version !== 1
    )
      fail();
    return merge(value.records);
  }
  function metaPayload(book) {
    const m = {
      id: book.id,
      title: book.title,
      language: book.language,
      kind: book.kind || 'vocabulary',
      grammarMode: book.grammarMode || 'standard',
      categories: clone(book.categories || []),
    };
    for (const k of ['audioMode', 'description', 'sourceInfo', 'entryCount', 'archived'])
      if (own(book, k)) m[k] = book[k];
    return metadata(m, book.id);
  }
  function wordPayload(entry, language, order) {
    const p = {
      id: entry.id,
      term: entry.term || entry.french,
      meanings: clone(entry.meanings || {}),
      category: String(entry.category),
      subcategory: String(entry.subcategory),
      language,
      example: entry.example || '',
      examples: clone(entry.examples || []),
      pattern: entry.pattern || '',
      explanation: entry.explanation || '',
    };
    if (entry.chinese && !p.meanings['zh-Hans']) p.meanings['zh-Hans'] = entry.chinese;
    for (const k of ['meaning', 'reading', 'headword', 'part', 'audio'])
      if (own(entry, k)) p[k] = entry[k];
    if (order !== undefined) p.order = order;
    return word(p, p.id);
  }
  function validateCatalog(value) {
    if (!Array.isArray(value) || !value.length || value.length > 100) fail();
    const ids = new Set();
    let total = 0;
    for (const b of value) {
      identifier(b.id, 128);
      if (ids.has(b.id)) fail();
      ids.add(b.id);
      metaPayload(b);
      if (!Array.isArray(b.words) || b.words.length > 100000) fail();
      const words = new Set();
      for (const w of b.words) {
        if (words.has(w.id)) fail();
        words.add(w.id);
        wordPayload(w, b.language);
      }
      total += b.words.length;
    }
    if (total > MAX_RECORDS) fail();
    return value;
  }
  function repairCategories(book) {
    const parents = new Map(
      book.categories.map((c) => [
        c.id,
        { ...c, subcategories: c.subcategories.map((s) => ({ ...s })) },
      ]),
    );
    for (const w of book.words) {
      if (!parents.has(w.category))
        parents.set(w.category, { id: w.category, name: `單元 ${w.category}`, subcategories: [] });
      const parent = parents.get(w.category);
      if (!parent.subcategories.some((s) => s.id === w.subcategory))
        parent.subcategories.push({ id: w.subcategory, name: `子單元 ${w.subcategory}` });
    }
    return { ...book, categories: [...parents.values()] };
  }
  function mergedCategories(base, privateCategories) {
    const values = new Map(
      (base || []).map((c) => [c.id, { ...c, subcategories: [...c.subcategories] }]),
    );
    for (const c of privateCategories || []) {
      const prior = values.get(c.id),
        subs = new Map((prior?.subcategories || []).map((s) => [s.id, s]));
      for (const s of c.subcategories) subs.set(s.id, s);
      values.set(c.id, { ...prior, ...c, subcategories: [...subs.values()] });
    }
    return [...values.values()];
  }
  function materializedWord(value) {
    const meanings = clone(value.meanings || {});
    if (!Object.keys(meanings).length && value.meaning) meanings['zh-Hant'] = value.meaning;
    const examples = new Map();
    for (const supplied of [
      ...(value.example ? [{ text: value.example }] : []),
      ...(value.examples || []),
    ]) {
      const e = typeof supplied === 'string' ? { text: supplied } : supplied,
        old = examples.get(e.text);
      examples.set(e.text, {
        text: e.text,
        translations: { ...(e.translations || {}), ...(old?.translations || {}) },
        ...((old?.furigana || e.furigana)?.length
          ? { furigana: clone(old?.furigana || e.furigana) }
          : {}),
      });
    }
    const list = [...examples.values()];
    return {
      ...value,
      meanings,
      meaning:
        value.meaning ??
        meanings['zh-Hant'] ??
        meanings['zh-Hans'] ??
        Object.values(meanings)[0] ??
        '',
      example: list[0]?.text || '',
      examples: list,
      reading: value.reading || '',
      audio: value.audio ?? null,
      part: value.part ?? null,
      pattern: value.pattern || '',
      explanation: value.explanation || '',
      headword: value.headword || value.term,
    };
  }
  function project(base, records, includeArchived = false) {
    const books = new Map(base.map((b) => [b.id, { ...b, words: b.words.map((w) => ({ ...w })) }]));
    for (const r of records.filter((r) => r.kind === 'dictionary')) {
      if (r.deleted) books.delete(r.dictionaryID);
      else {
        const prior = books.get(r.dictionaryID) || { words: [] };
        if (
          prior.id &&
          (r.payload.language !== prior.language ||
            (own(r.payload, 'kind') && r.payload.kind !== (prior.kind || 'vocabulary')) ||
            (own(r.payload, 'grammarMode') &&
              r.payload.grammarMode !== (prior.grammarMode || 'standard')))
        )
          throw new Error('現有書籍的語言與類型不可變更；請使用新的書籍 ID。');
        books.set(r.dictionaryID, {
          ...prior,
          ...r.payload,
          contentOverridden: true,
          categories: mergedCategories(prior.categories, r.payload.categories),
        });
      }
    }
    for (const [id, b] of books) {
      const entries = new Map(
        b.words.map((w, index) => [
          w.id,
          { word: w, order: integer(w.order, 100000000) ? w.order : index },
        ]),
      );
      for (const r of records.filter((r) => r.kind === 'word' && r.dictionaryID === id)) {
        if (r.deleted) entries.delete(r.wordID);
        else {
          if (r.payload.language !== b.language)
            throw new Error('詞條語言與書籍不同，已保留原有資料。');
          const prior = entries.get(r.wordID);
          entries.set(r.wordID, {
            word: materializedWord(r.payload),
            order: r.payload.order ?? prior?.order ?? 100000000,
          });
        }
      }
      const words = [...entries.values()]
        .sort((a, b) => a.order - b.order || utf8Compare(a.word.id, b.word.id))
        .map((x) => x.word);
      books.set(
        id,
        repairCategories({
          ...b,
          kind: b.kind || 'vocabulary',
          grammarMode: b.grammarMode || 'standard',
          words,
        }),
      );
    }
    return [...books.values()].filter((b) => includeArchived || !b.archived);
  }
  function persistence(storage) {
    if (!window.indexedDB)
      return {
        load: async (k) =>
          JSON.parse(
            storage.getItem(k === 'metadata' ? META_KEY : 'mots.content.catalog.v1') || 'null',
          ),
        update: async (fn) => {
          const next = fn(JSON.parse(storage.getItem(META_KEY) || 'null'));
          storage.setItem(META_KEY, JSON.stringify(next));
          return next;
        },
        catalog: async (v) => {
          storage.setItem('mots.content.catalog.v1', JSON.stringify(v));
        },
      };
    let opening;
    const open = () =>
      (opening ??= new Promise((resolve, reject) => {
        const req = window.indexedDB.open('mots-content-v1', 1);
        req.onupgradeneeded = () => req.result.createObjectStore('state');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error || new Error('storage'));
      }));
    const transaction = async (mode, action) =>
      new Promise(async (resolve, reject) => {
        try {
          const db = await open(),
            tx = db.transaction('state', mode),
            store = tx.objectStore('state');
          let result, failure;
          tx.oncomplete = () => resolve(result);
          tx.onerror = () => reject(failure || tx.error || new Error('storage'));
          tx.onabort = () => reject(failure || tx.error || new Error('storage'));
          action(
            store,
            (v) => {
              result = v;
            },
            (error) => {
              failure = error;
              tx.abort();
            },
          );
        } catch (e) {
          reject(e);
        }
      });
    return {
      load: (k) =>
        transaction('readonly', (s, done) => {
          const r = s.get(k);
          r.onsuccess = () => done(r.result ?? null);
        }),
      update: (fn) =>
        transaction('readwrite', (s, done, abort) => {
          const r = s.get('metadata');
          r.onsuccess = () => {
            try {
              const v = fn(r.result ?? null);
              s.put(v, 'metadata');
              done(v);
            } catch (error) {
              abort(error);
            }
          };
        }),
      catalog: (v) =>
        transaction('readwrite', (s, done) => {
          s.put(v, 'catalog');
          done(true);
        }),
    };
  }
  function create(options = {}) {
    const storage = options.storage || window.localStorage,
      db = options.persistence || persistence(storage);
    const crypto = options.crypto || window.crypto,
      onApply = options.onApply || (() => true);
    const getLegacy = options.getLegacy || (() => ({ books: [], extensions: {} }));
    const fetcher = options.fetch || window.fetch?.bind(window);
    let base = validateCatalog(options.base || []),
      records = [],
      counter = 0,
      deviceID = '',
      failed = false,
      applied = '',
      migrationDone = false;
    let cachedVersion = '',
      lastCheck = 0,
      refreshing = null,
      pending = Promise.resolve(),
      closed = false;
    function checkedState(value) {
      if (value === null) return null;
      if (
        !object(value) ||
        value.version !== 1 ||
        !/^[0-9a-f]{32}$/.test(value.deviceID) ||
        !integer(value.counter)
      )
        fail();
      return { ...value, records: merge(value.records) };
    }
    const maxClock = (rs) => rs.reduce((n, r) => Math.max(n, r.clock), 0);
    function absorb(state) {
      if (state) {
        records = merge(records, state.records);
        counter = Math.max(counter, state.counter, maxClock(records));
        deviceID = state.deviceID;
      }
    }
    function beacon() {
      try {
        storage.setItem(BEACON_KEY, `${Date.now()}-${Math.random()}`);
      } catch {
        /* IndexedDB remains durable even if the small optional wake beacon fails. */
      }
    }
    function apply() {
      const signature = cachedVersion + '|' + canonical(records);
      if (signature === applied) return true;
      if (
        onApply(project(base, records), project(base, records, true), {
          unchangedBundled: !cachedVersion && !records.length,
        }) === false
      )
        throw new Error('storage');
      applied = signature;
      return true;
    }
    async function commit(incoming = [], announce = true, current = () => true) {
      const saved = await db.update((disk) => {
        if (!current()) throw new Error('stale-content');
        const old = checkedState(disk);
        const merged = merge(old?.records || [], records, incoming);
        return {
          version: 1,
          deviceID: old?.deviceID || deviceID,
          counter: Math.max(counter, old?.counter || 0, maxClock(merged)),
          records: merged,
          migrationDone: migrationDone || old?.migrationDone === true,
        };
      });
      absorb(saved);
      failed = false;
      apply();
      if (announce) beacon();
      return true;
    }
    function enqueue(work) {
      const task = pending
        .catch(() => {})
        .then(work)
        .catch((e) => {
          if (
            !['stale-content', 'invalid-content', 'content-limit'].includes(e.message) &&
            !e.message.startsWith('現有書籍') &&
            !e.message.startsWith('詞條語言')
          )
            failed = true;
          throw e;
        });
      pending = task;
      return task;
    }
    const ready = (async () => {
      const bytes = crypto.getRandomValues(new Uint8Array(16));
      deviceID = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
      const existing = checkedState(await db.load('metadata'));
      absorb(existing);
      migrationDone = existing?.migrationDone === true;
      try {
        const cache = await db.load('catalog');
        if (
          cache &&
          typeof cache.version === 'string' &&
          typeof cache.raw === 'string' &&
          crypto.subtle
        ) {
          const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(cache.raw));
          if (
            [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('') !==
            cache.sha256
          )
            fail();
          base = validateCatalog(JSON.parse(cache.raw));
          cachedVersion = cache.version;
        }
      } catch {
        /* A damaged public cache never hides the bundled offline edition. */
      }
      const legacy = migrationDone ? {} : getLegacy(),
        seeds = [];
      for (const b of legacy.books || []) {
        seeds.push({
          dictionaryID: b.id,
          kind: 'dictionary',
          wordID: '*',
          clock: 0,
          deviceID: '',
          deleted: false,
          payload: metaPayload(b),
        });
        (b.words || []).forEach((w, index) =>
          seeds.push({
            dictionaryID: b.id,
            kind: 'word',
            wordID: w.id,
            clock: 0,
            deviceID: '',
            deleted: false,
            payload: wordPayload(w, b.language, index),
          }),
        );
      }
      for (const [id, ws] of Object.entries(legacy.extensions || {})) {
        const b = base.find((b) => b.id === id);
        if (!b || !Array.isArray(ws)) continue;
        ws.forEach((w, index) =>
          seeds.push({
            dictionaryID: id,
            kind: 'word',
            wordID: w.id,
            clock: 0,
            deviceID: '',
            deleted: false,
            payload: wordPayload(w, b.language, b.words.length + index),
          }),
        );
      }
      const known = new Set(records.map(key));
      migrationDone = true;
      await commit(
        seeds.filter((r) => !known.has(key(r))),
        false,
      );
      return true;
    })().catch((e) => {
      failed = true;
      throw e;
    });
    // Avoid an unhandled rejection while the application initializes its status owner.
    ready.catch(() => {});
    async function snapshot() {
      await ready;
      await pending.catch(() => {});
      await commit([], false);
      return clone(records);
    }
    async function validateReceive(incoming) {
      await ready;
      await pending.catch(() => {});
      project(base, merge(records, validateRecords(incoming)), true);
      return true;
    }
    async function receive(incoming, current = () => true) {
      validateRecords(incoming);
      await ready;
      return enqueue(() => commit(incoming, true, current));
    }
    async function edits(changes) {
      await ready;
      return enqueue(async () => {
        const saved = await db.update((disk) => {
          const old = checkedState(disk),
            current = merge(old?.records || [], records);
          let clock = Math.max(counter, old?.counter || 0, maxClock(current));
          if (clock + changes.length > MAX) throw new Error('content-limit');
          const stamped = changes.map((change) => ({
            ...change,
            clock: ++clock,
            deviceID: old?.deviceID || deviceID,
          }));
          const next = merge(current, stamped);
          project(base, next, true);
          return {
            version: 1,
            deviceID: old?.deviceID || deviceID,
            counter: clock,
            records: next,
            migrationDone: true,
          };
        });
        absorb(saved);
        failed = false;
        apply();
        beacon();
        return true;
      });
    }
    async function upsertBook(book) {
      await ready;
      metadata(metaPayload(book), book.id);
      const prior = project(base, records, true).find((b) => b.id === book.id);
      const meta = metaPayload({
        ...book,
        categories: mergedCategories(prior?.categories, book.categories),
      });
      const positions = new Map((prior?.words || []).map((w, index) => [w.id, w.order ?? index]));
      let next = prior?.words.length || 0;
      const changes = [
        { dictionaryID: book.id, kind: 'dictionary', wordID: '*', deleted: false, payload: meta },
      ];
      book.words.forEach((w) =>
        changes.push({
          dictionaryID: book.id,
          kind: 'word',
          wordID: w.id,
          deleted: false,
          payload: wordPayload(w, book.language, positions.get(w.id) ?? next++),
        }),
      );
      return edits(changes);
    }
    async function upsertWords(id, words) {
      await ready;
      const b = project(base, records, true).find((b) => b.id === id);
      if (!b) fail();
      const positions = new Map(b.words.map((w, index) => [w.id, w.order ?? index]));
      let index = b.words.length;
      return edits(
        words.map((w) => ({
          dictionaryID: id,
          kind: 'word',
          wordID: w.id,
          deleted: false,
          payload: wordPayload(w, b.language, positions.get(w.id) ?? index++),
        })),
      );
    }
    async function updateBook(id, fields) {
      await ready;
      const b = project(base, records, true).find((b) => b.id === id);
      if (!b) fail();
      return edits([
        {
          dictionaryID: id,
          kind: 'dictionary',
          wordID: '*',
          deleted: false,
          payload: metaPayload({ ...b, ...fields }),
        },
      ]);
    }
    async function refreshCatalog(force = false) {
      await ready;
      if (closed || !fetcher || (!force && Date.now() - lastCheck < 300000)) return true;
      if (refreshing) return refreshing;
      const get = async (path, read) => {
        const controller = new AbortController(),
          timer = window.setTimeout(() => controller.abort(), 15000);
        try {
          const response = await fetcher(path, {
            credentials: 'omit',
            redirect: 'error',
            cache: 'no-cache',
            signal: controller.signal,
          });
          if (!response.ok) throw new Error('network');
          return await read(response);
        } finally {
          window.clearTimeout(timer);
        }
      };
      refreshing = (async () => {
        const info = await get('/database/content-version.json', (r) => r.json());
        if (
          !object(info) ||
          info.catalogPath !== '/database/catalog.json' ||
          typeof info.version !== 'string' ||
          !/^[0-9a-f]{64}$/.test(info.version) ||
          !/^[0-9a-f]{64}$/.test(info.catalogSHA256)
        )
          fail();
        if (info.version !== cachedVersion) {
          const bytes = await get('/database/catalog.json', (r) => r.arrayBuffer());
          if (bytes.byteLength > 32 * 1024 * 1024) fail();
          if (!crypto.subtle) fail();
          const digest = await crypto.subtle.digest('SHA-256', bytes),
            hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
          if (hex !== info.catalogSHA256) fail();
          const raw = new TextDecoder().decode(bytes),
            books = validateCatalog(JSON.parse(raw));
          for (const b of books) {
            const prior = base.find((old) => old.id === b.id);
            if (
              prior &&
              (prior.language !== b.language ||
                (prior.kind || 'vocabulary') !== (b.kind || 'vocabulary') ||
                (prior.grammarMode || 'standard') !== (b.grammarMode || 'standard'))
            )
              fail();
          }
          await db.catalog({ version: info.version, sha256: info.catalogSHA256, raw });
          base = books;
          cachedVersion = info.version;
          apply();
        }
        lastCheck = Date.now();
        return true;
      })();
      try {
        return await refreshing;
      } finally {
        refreshing = null;
      }
    }
    function portable() {
      return { version: 1, records: records.map(({ clock, deviceID, ...r }) => clone(r)) };
    }
    function validatePortable(value) {
      if (!object(value) || value.version !== 1 || !Array.isArray(value.records)) fail();
      for (const r of value.records)
        if (
          !object(r) ||
          Object.keys(r).sort().join(',') !== 'deleted,dictionaryID,kind,payload,wordID'
        )
          fail();
      const checked = validateRecords(value.records.map((r) => ({ ...r, clock: 0, deviceID: '' })));
      project(
        base,
        merge(
          records,
          checked.map((r, index) => ({ ...r, clock: counter + index + 1, deviceID })),
        ),
        true,
      );
      return checked.map(({ clock, deviceID, ...r }) => r);
    }
    return {
      ready: () => ready,
      snapshot,
      validateReceive,
      receive,
      upsertBook,
      upsertWords,
      updateBook,
      archiveBook: (id, archived = true) => updateBook(id, { archived }),
      refreshCatalog,
      portable,
      validatePortable,
      importPortable: async (value) => edits(validatePortable(value)),
      previewPortable: (value) => {
        const checked = validatePortable(value);
        return project(
          base,
          merge(
            records,
            checked.map((r, index) => ({ ...r, clock: counter + index + 1, deviceID })),
          ),
          true,
        );
      },
      books: () => project(base, records),
      allBooks: () => project(base, records, true),
      failed: () => failed,
      extensions: () => {
        const ids = new Map(base.map((b) => [b.id, new Set(b.words.map((w) => w.id))])),
          result = {};
        for (const b of project(base, records, true))
          if (ids.has(b.id)) {
            const extras = b.words.filter((w) => !ids.get(b.id).has(w.id));
            if (extras.length) result[b.id] = extras;
          }
        return result;
      },
      unresolved: () => {
        const known = new Set([
          ...base.map((b) => b.id),
          ...records.filter((r) => r.kind === 'dictionary').map((r) => r.dictionaryID),
        ]);
        return records.filter((r) => !r.deleted && r.kind === 'word' && !known.has(r.dictionaryID))
          .length;
      },
      handleStorage: async (event) => {
        if (event.key !== BEACON_KEY && event.key !== META_KEY && event.key !== null) return false;
        await ready;
        return enqueue(async () => {
          await commit([], false);
          return true;
        });
      },
      stop: () => {
        closed = true;
      },
    };
  }
  window.MotsContent = Object.freeze({
    create,
    validateRecords,
    validateSnapshot,
    merge,
    compare,
    canonical,
    metaPayload,
    wordPayload,
    validateCatalog,
    project,
    META_KEY,
    BEACON_KEY,
  });
})();
