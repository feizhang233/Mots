(() => {
  'use strict';
  const META_KEY = 'mots.sync.metadata.v1';
  const CONNECTION_KEY = 'mots.sync.connection.v1';
  const { MAX, object, exactKeys, integer, identifier, validCode, key, maxClock, progress } =
    window.MotsSyncProtocol;
  const { validateRecords, validateSnapshot, merge, compare } = progress;
  function create(options = {}) {
    const storage = options.storage || window.localStorage;
    const crypto = options.crypto || window.crypto;
    const later = options.setTimeout || window.setTimeout.bind(window);
    const cancel = options.clearTimeout || window.clearTimeout.bind(window);
    const visible = options.isVisible || (() => document.visibilityState !== 'hidden');
    const available = options.available ?? window.location.protocol === 'https:';
    const onApply = options.onApply || (() => true);
    const onStatus = options.onStatus || (() => {});
    const memory = options.memory;
    const memorySnapshot = () => memory ? window.MotsMemory.snapshot(memory.get()) : [];
    const legacy = options.getLegacy || (() => ({}));
    const deletions = options.deletions || window.MotsDeletions.create({ storage, crypto });
    const fetcher = options.fetch || window.fetch?.bind(window);
    const transport =
      options.transport ||
      (async (path, code, body, signal) => {
        if (!available || !fetcher) throw new Error('unavailable');
        const response = await fetcher(`/api/sync/${path}`, {
          method: 'POST',
          credentials: 'omit',
          redirect: 'error',
          cache: 'no-store',
          signal,
          headers: {
            'Content-Type': 'application/json',
            ...(code ? { Authorization: `Bearer ${code}` } : {}),
          },
          body: JSON.stringify(body),
        });
        if (!response.ok)
          throw new Error(
            response.status === 401
              ? 'unauthorized'
              : response.status === 404 && ['deletions', 'memory'].includes(path)
                ? 'unsupported-deletions'
                : response.status === 413
                  ? 'too-large'
                  : 'network',
          );
        return response.json();
      });
    let records = [],
      counter = 0,
      deviceID = '',
      code = null,
      generation = 0;
    let timer,
      flight = null,
      controller,
      pairing = false,
      rerun = false,
      retry = 1000;
    let phase = available ? 'disconnected' : 'unavailable',
      persistenceError = false,
      stopped = false;
    let networkTail = Promise.resolve();
    function state() {
      return {
        phase,
        connected: !!code,
        busy: pairing || !!flight || phase === 'syncing',
        available,
        persistenceError: persistenceError || deletions.failed(),
      };
    }
    function report(value) {
      phase = value;
      onStatus(state());
    }
    function metadata() {
      return { version: 1, deviceID, counter, records };
    }
    function readMetadata(raw = storage.getItem(META_KEY)) {
      if (raw === null) return null;
      const value = JSON.parse(raw);
      if (!object(value) || typeof value.deviceID !== 'string' ||
          !/^[0-9a-f]{32}$/.test(value.deviceID) || !integer(value.counter, MAX))
        throw new Error('invalid-metadata');
      if (value.version !== 1) throw new Error('invalid-metadata');
      return { ...value, records: validateRecords(value.records) };
    }
    function absorb(snapshot) {
      if (snapshot) {
        records = merge(records, snapshot.records);
        counter = Math.max(counter, snapshot.counter, maxClock(snapshot.records));
      }
    }
    function fresh() {
      const disk = readMetadata();
      if (disk) {
        deviceID = disk.deviceID;
        absorb(disk);
      }
      return disk;
    }
    function save(reason) {
      try {
        // Metadata is the atomic source of truth; legacy progress keys are projections.
        // Re-read before every mutation/response so another tab's newer edits survive.
        fresh();
        storage.setItem(META_KEY, JSON.stringify(metadata()));
        persistenceError = onApply(records, reason) === false;
      } catch {
        persistenceError = true;
      }
      if (persistenceError) report('error');
      return !persistenceError;
    }
    function applyRemote(combined, incomingDeletions, incomingMemory) {
      records = combined;
      counter = Math.max(counter, maxClock(records));
      if (!save('remote')) return false;
      if (deletions.receive(incomingDeletions) && (!memory || memory.apply(incomingMemory) !== false))
        return true;
      persistenceError = true;
      report('error');
      return false;
    }
    function seed() {
      fresh();
      const known = new Set(records.map(key));
      const seeds = [];
      for (const [dictionaryID, values] of Object.entries(legacy())) {
        if (!identifier(dictionaryID, 128) || !object(values)) continue;
        for (const [wordID, level] of Object.entries(values)) {
          const record = { dictionaryID, wordID, level, clock: 0, deviceID: '' };
          if (identifier(wordID, 256) && integer(level, 3) && level > 0 && !known.has(key(record)))
            seeds.push(record);
        }
      }
      records = merge(records, seeds);
    }
    function schedule(delay = 400) {
      cancel(timer);
      if (!code || stopped || !available || pairing) return;
      timer = later(() => {
        if (visible()) syncNow();
        else schedule(5000);
      }, delay);
    }
    function statusError(error) {
      report(
        persistenceError || deletions.failed() || error?.message === 'storage'
          ? 'error'
          : error?.message === 'unauthorized'
            ? 'unauthorized'
            : error?.message === 'unsupported-deletions'
              ? 'unsupported'
              : [
                    'invalid-record',
                    'invalid-records',
                    'invalid-snapshot',
                    'invalid-deletions',
                  ].includes(error?.message)
                ? 'invalid'
                : 'offline',
      );
    }
    async function request(path, token, body) {
      const session = generation;
      // Create/join and ordinary exchanges share one transport queue.
      const task = networkTail
        .catch(() => {})
        .then(async () => {
          if (!currentSession(session)) throw new Error('cancelled');
          controller = typeof AbortController === 'function' ? new AbortController() : null;
          const timeout = later(() => controller?.abort(), 15000);
          try {
            return await transport(path, token, body, controller?.signal);
          } finally {
            cancel(timeout);
            controller = null;
          }
        });
      networkTail = task;
      return task;
    }
    async function syncNow() {
      try {
        reconcileConnection();
      } catch {
        persistenceError = true;
        report('error');
        return false;
      }
      if (!code || !available || stopped || pairing) return false;
      if (flight) {
        rerun = true;
        return flight;
      }
      cancel(timer);
      const session = generation,
        token = code;
      rerun = false;
      flight = (async () => {
        try {
          if (!save('refresh')) return false;
          deletions.snapshot(); // Local revision channels are durable before any upload.
          report('syncing');
          const response = await request('exchange', token, {
            version: 1,
            records: records.map((r) => ({ ...r })),
          });
          if (!currentSession(session)) return false;
          const incoming = validateSnapshot(response); // Validate all before applying any.
          const incomingDeletions = window.MotsDeletions.validateSnapshot(
            await request('deletions', token, { version: 1, records: deletions.snapshot() }),
          );
          if (!currentSession(session)) return false;
          const incomingMemory = memory ? window.MotsMemory.decodeSnapshot(
            await request('memory', token, { version: 1, records: memorySnapshot() }),
          ) : null;
          if (!currentSession(session)) return false;
          deletions.validateReceive(incomingDeletions);
          fresh();
          if (!applyRemote(merge(records, incoming), incomingDeletions, incomingMemory)) return false;
          if (memory) rerun ||= JSON.stringify(window.MotsMemory.snapshot(incomingMemory)) !== JSON.stringify(memorySnapshot());
          // A local edit during the request may be newer than its response.
          const canonical = JSON.stringify(merge(incoming));
          rerun ||= canonical !== JSON.stringify(records);
          rerun ||=
            JSON.stringify(window.MotsDeletions.merge(incomingDeletions)) !==
            JSON.stringify(deletions.current());
          retry = 1000;
          report(rerun ? 'pending' : 'synced');
          return true;
        } catch (error) {
          if (session === generation) statusError(error);
          return false;
        }
      })();
      const current = flight;
      try {
        return await current;
      } finally {
        if (flight === current) flight = null;
        if (session === generation && code) {
          const failed = ['offline', 'invalid', 'unauthorized', 'error', 'unsupported'].includes(
            phase,
          );
          const delay = failed ? retry : rerun ? 400 : 5000;
          if (failed) retry = Math.min(60000, retry * 2);
          onStatus(state());
          schedule(delay);
        }
      }
    }
    function prepareEdits(edits) {
      const valid = validateRecords(edits.map((edit) => ({ ...edit, clock: 0, deviceID: '' })));
      fresh();
      if (!/^[0-9a-f]{32}$/.test(deviceID)) throw new Error('invalid-metadata');
      if (counter + valid.length > MAX) throw new Error('progress-limit');
      let nextCounter = counter;
      const stamped = valid.map((edit) => ({ ...edit, clock: ++nextCounter, deviceID }));
      return { records: merge(records, stamped), counter: nextCounter };
    }
    function editMany(edits) {
      try {
        ({ records, counter } = prepareEdits(edits));
      } catch {
        persistenceError = true;
        report('error');
        return false;
      }
      const saved = save('local');
      if (saved) report(code ? 'pending' : available ? 'disconnected' : 'unavailable');
      rerun = true;
      schedule();
      return saved;
    }
    function editDeletions(edits, imported = false) {
      const saved = imported ? deletions.importAsLocal(edits) : deletions.editMany(edits);
      if (saved) {
        persistenceError = false;
        report(code ? 'pending' : available ? 'disconnected' : 'unavailable');
      } else {
        persistenceError = true;
        report('error');
      }
      rerun = true;
      schedule();
      return saved;
    }
    function invalidate() {
      generation++;
      controller?.abort();
      cancel(timer);
      flight = null;
      pairing = false;
      rerun = false;
    }
    function connectionFromDisk() {
      const value = JSON.parse(storage.getItem(CONNECTION_KEY) || 'null');
      if (value !== null && (!object(value) || (value.code !== null && !validCode(value.code))))
        throw new Error('invalid-connection');
      return value?.code || null;
    }
    function reconcileConnection() {
      const persistedCode = connectionFromDisk();
      if (persistedCode === code) return;
      invalidate();
      code = persistedCode;
      report(code ? 'pending' : available ? 'disconnected' : 'unavailable');
      schedule(0);
    }
    function currentSession(session) {
      if (session !== generation) return false;
      // A storage event for a new pairing can lag behind a queued request or its response.
      reconcileConnection();
      return session === generation;
    }
    function finishPairing(session) {
      if (session !== generation) return;
      pairing = false;
      onStatus(state());
      schedule(0);
    }
    async function join(value) {
      const candidate = typeof value === 'string' ? value.trim() : '';
      if (!validCode(candidate) || !available || pairing) {
        report(!available ? 'unavailable' : 'invalid-code');
        return false;
      }
      invalidate();
      pairing = true;
      report('connecting');
      const session = generation;
      try {
        seed();
        if (!save('refresh')) return false;
        deletions.snapshot();
        const incoming = validateSnapshot(
          await request('exchange', candidate, { version: 1, records: [] }),
        );
        if (!currentSession(session)) return false;
        const incomingDeletions = window.MotsDeletions.validateSnapshot(
          await request('deletions', candidate, { version: 1, records: [] }),
        );
        if (!currentSession(session)) return false;
        const incomingMemory = memory ? window.MotsMemory.decodeSnapshot(
          await request('memory', candidate, { version: 1, records: [] }),
        ) : null;
        if (!currentSession(session)) return false;
        seed();
        // Preflight the local unions before committing new credentials or either channel.
        if (memory) window.MotsMemory.merge(memory.get(), incomingMemory);
        const combined = merge(records, incoming);
        deletions.validateReceive(incomingDeletions);
        // A validated pairing is committed only after credentials persist.
        storage.setItem(CONNECTION_KEY, JSON.stringify({ code: candidate }));
        code = candidate;
        if (!applyRemote(combined, incomingDeletions, incomingMemory)) return false;
        report('pending');
        return true;
      } catch (error) {
        if (session === generation) statusError(error);
        return false;
      } finally {
        finishPairing(session);
      }
    }
    async function createPairing() {
      if (!available || pairing) {
        report('unavailable');
        return false;
      }
      invalidate();
      pairing = true;
      report('connecting');
      const session = generation;
      try {
        const response = await request('create', null, {});
        if (!currentSession(session)) return false;
        if (
          !exactKeys(response, ['version', 'code']) ||
          response.version !== 1 ||
          !validCode(response.code)
        )
          throw new Error('invalid-snapshot');
        pairing = false;
        return await join(response.code);
      } catch (error) {
        if (session === generation) statusError(error);
        return false;
      } finally {
        finishPairing(session);
      }
    }
    function disconnect() {
      invalidate();
      try {
        storage.setItem(CONNECTION_KEY, JSON.stringify({ code: null }));
        code = null;
        report(available ? 'disconnected' : 'unavailable');
        return true;
      } catch {
        persistenceError = true;
        code = null;
        report('error');
        return false;
      }
    }
    function handleStorage(event) {
      const deletionEvent = deletions.handleStorage(event);
      if (deletionEvent && event.key !== null) {
        if (deletions.failed()) {
          persistenceError = true;
          report('error');
        } else if (code) report('pending');
        rerun = true;
        schedule();
        return true;
      }
      if (event.key !== META_KEY && event.key !== CONNECTION_KEY && event.key !== null)
        return false;
      try {
        if (event.key === CONNECTION_KEY || event.key === null) reconcileConnection();
        if (event.key === META_KEY && event.newValue) absorb(readMetadata(event.newValue));
        const disk = fresh();
        // Repair racing whole-key writes from different tabs by republishing their union.
        if (
          !disk ||
          JSON.stringify(merge(disk.records)) !== JSON.stringify(records) ||
          disk.counter < counter
        )
          save('storage');
        else persistenceError = onApply(records, 'storage') === false;
        if (persistenceError) report('error');
        schedule();
      } catch {
        persistenceError = true;
        report('error');
      }
      return true;
    }
    function refresh() {
      try {
        seed();
        deletions.snapshot();
        return save('storage');
      } catch {
        persistenceError = true;
        report('error');
        return false;
      }
    }
    try {
      const saved = readMetadata();
      if (saved) {
        deviceID = saved.deviceID;
        absorb(saved);
      } else {
        const bytes = crypto.getRandomValues(new Uint8Array(16));
        deviceID = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
      }
      code = connectionFromDisk();
      seed();
      if (save('startup') && !deletions.failed())
        report(code ? 'pending' : available ? 'disconnected' : 'unavailable');
      else report('error');
      schedule(0);
    } catch {
      persistenceError = true;
      report('error');
    }
    return {
      state,
      syncNow,
      join,
      createPairing,
      disconnect,
      handleStorage,
      refresh,
      validateImport(edits) {
        prepareEdits(edits);
      },
      editMany,
      editDeletions,
      edit: (dictionaryID, wordID, level) => editMany([{ dictionaryID, wordID, level }]),
      getCode: () => code || '',
      memoryChanged: () => {
        rerun = true;
        report(code ? 'pending' : available ? 'disconnected' : 'unavailable');
        schedule();
      },
      wake: () => schedule(0),
      stop: () => {
        stopped = true;
        invalidate();
      },
    };
  }
  window.MotsProgressSync = Object.freeze({
    create,
    validateSnapshot,
    validateRecords,
    merge,
    compare,
    validCode,
    META_KEY,
    CONNECTION_KEY,
  });
})();
