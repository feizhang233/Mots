(() => {
  'use strict';

  // Shared wire rules only. Persistence, credentials and scheduling stay with their owners.
  const MAX = Number.MAX_SAFE_INTEGER;
  const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  const exactKeys = (value, fields) =>
    object(value) &&
    Object.keys(value).length === fields.length &&
    fields.every((field) => Object.hasOwn(value, field));
  const integer = (value, maximum = MAX) =>
    Number.isSafeInteger(value) && value >= 0 && value <= maximum;
  const identifier = (value, maximum) =>
    typeof value === 'string' &&
    value.length > 0 &&
    [...value].length <= maximum &&
    !['__proto__', 'constructor', 'prototype'].includes(value) &&
    !/[\u0000-\u001f\u007f-\u009f]/u.test(value) &&
    [...value].every(
      (character) => character.codePointAt(0) < 0xd800 || character.codePointAt(0) > 0xdfff,
    );
  const validCode = (value) => typeof value === 'string' && /^mots-[A-Za-z0-9_-]{43}$/.test(value);
  const key = (record) => JSON.stringify([record.dictionaryID, record.wordID]);
  const maxClock = (records) =>
    records.reduce((highest, record) => Math.max(highest, record.clock), 0);
  function lexical(a, b) {
    const left = [...a],
      right = [...b];
    for (let index = 0; index < Math.min(left.length, right.length); index++) {
      const difference = left[index].codePointAt(0) - right[index].codePointAt(0);
      if (difference) return difference;
    }
    return left.length - right.length;
  }
  const sort = (a, b) => lexical(a.dictionaryID, b.dictionaryID) || lexical(a.wordID, b.wordID);

  function recordSet(
    valueField,
    { validValue, legacySeed = false, arrayError, recordError, snapshotError, capacityError },
  ) {
    const fields = ['dictionaryID', 'wordID', valueField, 'clock', 'deviceID'];
    const compare = (a, b) =>
      a.clock - b.clock ||
      lexical(a.deviceID, b.deviceID) ||
      Number(a[valueField]) - Number(b[valueField]);
    function validateRecords(records) {
      if (!Array.isArray(records) || records.length > 100000) throw new Error(arrayError);
      return records.map((record) => {
        if (
          !exactKeys(record, fields) ||
          !identifier(record.dictionaryID, 128) ||
          !identifier(record.wordID, 256) ||
          !validValue(record[valueField]) ||
          !integer(record.clock) ||
          typeof record.deviceID !== 'string' ||
          !(
            /^[0-9a-f]{32}$/.test(record.deviceID) ||
            (legacySeed && record.clock === 0 && record.deviceID === '')
          )
        )
          throw new Error(recordError);
        return {
          dictionaryID: record.dictionaryID,
          wordID: record.wordID,
          [valueField]: record[valueField],
          clock: record.clock,
          deviceID: record.deviceID,
        };
      });
    }
    function validateSnapshot(value) {
      if (!exactKeys(value, ['version', 'records']) || value.version !== 1)
        throw new Error(snapshotError);
      return validateRecords(value.records);
    }
    function merge(...snapshots) {
      const winners = new Map();
      for (const records of snapshots)
        for (const record of records) {
          const id = key(record),
            previous = winners.get(id);
          if (!previous || compare(record, previous) > 0) winners.set(id, record);
        }
      if (winners.size > 100000) throw new Error(capacityError);
      return [...winners.values()].sort(sort);
    }
    return Object.freeze({ validateRecords, validateSnapshot, merge, compare });
  }

  const progress = recordSet('level', {
    validValue: (value) => integer(value, 3),
    legacySeed: true,
    arrayError: 'invalid-records',
    recordError: 'invalid-record',
    snapshotError: 'invalid-snapshot',
    capacityError: 'too-many-records',
  });
  const deletions = recordSet('deleted', {
    validValue: (value) => typeof value === 'boolean',
    arrayError: 'invalid-deletions',
    recordError: 'invalid-deletions',
    snapshotError: 'invalid-deletions',
    capacityError: 'invalid-deletions',
  });
  window.MotsSyncProtocol = Object.freeze({
    MAX,
    object,
    exactKeys,
    integer,
    identifier,
    validCode,
    key,
    maxClock,
    progress,
    deletions,
  });
})();
