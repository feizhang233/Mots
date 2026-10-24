(() => {
  'use strict';
  const KEY = 'mots.deletions.metadata.v1';
  const { MAX, object, integer, key, deletions } = window.MotsSyncProtocol;
  const { validateRecords, validateSnapshot, merge, compare } = deletions;
  function create(options = {}) {
    const storage = options.storage || window.localStorage;
    const crypto = options.crypto || window.crypto;
    const onApply = options.onApply || (() => true);
    let deviceID = '',
      counter = 0,
      records = [],
      byKey = new Map(),
      failed = false;
    function read() {
      const raw = storage.getItem(KEY);
      if (raw === null) return null;
      const value = JSON.parse(raw);
      if (
        !object(value) ||
        value.version !== 1 ||
        typeof value.deviceID !== 'string' ||
        !/^[0-9a-f]{32}$/.test(value.deviceID) ||
        !integer(value.counter)
      )
        throw new Error('invalid-deletions');
      return { ...value, records: validateRecords(value.records) };
    }
    function absorb(incoming) {
      if (incoming) {
        records = merge(records, incoming.records);
        counter = records.reduce(
          (highest, record) => Math.max(highest, record.clock),
          Math.max(counter, incoming.counter),
        );
        byKey = new Map(records.map((record) => [key(record), record]));
      }
    }
    function fresh() {
      const disk = read();
      if (disk) {
        deviceID = disk.deviceID;
        absorb(disk);
      }
    }
    function save(reason) {
      try {
        fresh();
        storage.setItem(KEY, JSON.stringify({ version: 1, deviceID, counter, records }));
        failed = onApply(records, reason) === false;
      } catch {
        failed = true;
      }
      return !failed;
    }
    function snapshot() {
      if (!save('refresh')) throw new Error('deletion-storage');
      return records.map((record) => ({ ...record }));
    }
    function editMany(edits, observedClock = 0) {
      const valid = validateRecords(
        edits.map((edit) => ({ ...edit, clock: 0, deviceID: '0'.repeat(32) })),
      );
      try {
        fresh();
        const nextCounter = Math.max(counter, observedClock);
        if (!/^[0-9a-f]{32}$/.test(deviceID) || nextCounter + valid.length > MAX)
          throw new Error('deletion-storage');
        counter = nextCounter;
        absorb({
          counter,
          records: valid.map((edit) => ({ ...edit, clock: ++counter, deviceID })),
        });
        return save('local');
      } catch {
        failed = true;
        return false;
      }
    }
    function receive(incoming, reason = 'remote') {
      const valid = validateRecords(incoming);
      fresh();
      absorb({ counter: 0, records: valid });
      return save(reason);
    }
    function validateReceive(incoming) {
      fresh();
      return merge(records, validateRecords(incoming));
    }
    function validateImport(incoming) {
      const valid = merge(validateRecords(incoming));
      fresh();
      merge(records, valid); // Capacity must also validate before a backup commits other state.
      const maximum = valid.reduce((highest, record) => Math.max(highest, record.clock), counter);
      if (maximum + valid.length > MAX) throw new Error('deletion-storage');
      return valid;
    }
    function handleStorage(event) {
      if (event.key !== KEY && event.key !== null) return false;
      try {
        if (event.key === KEY && event.newValue) {
          const value = JSON.parse(event.newValue);
          if (
            !object(value) ||
            value.version !== 1 ||
            !integer(value.counter) ||
            typeof value.deviceID !== 'string' ||
            !/^[0-9a-f]{32}$/.test(value.deviceID)
          )
            throw new Error('invalid-deletions');
          absorb({ ...value, records: validateRecords(value.records) });
        }
        fresh();
        const disk = read();
        if (
          !disk ||
          JSON.stringify(merge(disk.records)) !== JSON.stringify(records) ||
          disk.counter < counter
        )
          save('storage');
        else failed = onApply(records, 'storage') === false;
      } catch {
        failed = true;
      }
      return true;
    }
    try {
      const saved = read();
      if (saved) {
        deviceID = saved.deviceID;
        absorb(saved);
      } else
        deviceID = [...crypto.getRandomValues(new Uint8Array(16))]
          .map((byte) => byte.toString(16).padStart(2, '0'))
          .join('');
      save('startup');
    } catch {
      failed = true;
    }
    return {
      snapshot,
      editMany,
      receive,
      handleStorage,
      validateImport,
      validateReceive,
      failed: () => failed,
      importAsLocal: (incoming) => {
        const valid = validateImport(incoming);
        return editMany(
          valid.map(({ dictionaryID, wordID, deleted }) => ({ dictionaryID, wordID, deleted })),
          valid.reduce((highest, record) => Math.max(highest, record.clock), 0),
        );
      },
      current: () => records.map((record) => ({ ...record })),
      isDeleted: (dictionaryID, wordID) =>
        byKey.get(JSON.stringify([dictionaryID, wordID]))?.deleted === true,
    };
  }
  window.MotsDeletions = Object.freeze({
    KEY,
    create,
    validateRecords,
    validateSnapshot,
    merge,
    compare,
  });
})();
