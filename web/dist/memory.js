(() => {
  'use strict';

  // An expanding-interval product policy inspired by the spacing effect.
  // These intervals are not a universal equation for Ebbinghaus' forgetting curve.
  const intervals = Object.freeze([
    24 * 60 * 60 * 1000,
    2 * 24 * 60 * 60 * 1000,
    4 * 24 * 60 * 60 * 1000,
    7 * 24 * 60 * 60 * 1000,
  ]);
  const masteryStage = intervals.length + 1;
  const maxTimestamp = 253402300799999; // Last millisecond in Gregorian year 9999.
  const maxRecords = 100000;
  const unsafeKeys = new Set(['__proto__', 'constructor', 'prototype']);
  const object = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value));
  const validID = (value) =>
    typeof value === 'string' &&
    value.length > 0 &&
    (value.length <= 500 || (value.length <= 1000 && [...value].length <= 500)) &&
    !/\p{Cc}/u.test(value) &&
    !unsafeKeys.has(value);
  const timestamp = (value) => Number.isSafeInteger(value) && value >= 0 && value <= maxTimestamp;

  function validRecord(value, completedStage = masteryStage) {
    return (
      object(value) &&
      Object.keys(value).length === 3 &&
      ['stage', 'dueAt', 'updatedAt'].every((key) => Object.prototype.hasOwnProperty.call(value, key)) &&
      Number.isInteger(value.stage) &&
      value.stage >= 0 &&
      value.stage <= completedStage &&
      timestamp(value.dueAt) &&
      timestamp(value.updatedAt) &&
      (value.stage === completedStage ? value.dueAt === 0 : value.dueAt >= value.updatedAt)
    );
  }

  const copyRecord = ({ stage, dueAt, updatedAt }) => ({ stage, dueAt, updatedAt });

  function normalizeRecord(value) {
    if (validRecord(value)) return copyRecord(value);
    // Legacy nine-recall backups used the same fields. A completed record is
    // unambiguous (stage 9, dueAt 0); incomplete stages 5–8 must still be answered.
    if (validRecord(value, 9))
      return { ...copyRecord(value), stage: value.stage === 9 ? masteryStage : Math.min(value.stage, masteryStage - 1) };
    return null;
  }

  // Local loading tolerates damaged entries; backup preflight must be all-or-nothing.
  function sanitize(value, { strict = false } = {}) {
    const result = Object.create(null);
    let count = 0;
    const invalid = () => {
      if (strict) throw new Error('卡片記憶資料格式不正確，請使用有效的備份。');
    };
    if (!object(value)) {
      invalid();
      return result;
    }
    for (const [dictionaryID, words] of Object.entries(value)) {
      if (!validID(dictionaryID) || !object(words)) {
        invalid();
        continue;
      }
      const records = Object.create(null);
      for (const [wordID, record] of Object.entries(words)) {
        const normalized = normalizeRecord(record);
        if (!validID(wordID) || !normalized || count >= maxRecords) {
          invalid();
          continue;
        }
        records[wordID] = normalized;
        count++;
      }
      result[dictionaryID] = records;
    }
    return result;
  }

  function due(record, now = Date.now()) {
    const current = normalizeRecord(record);
    return !current || (current.stage !== masteryStage && current.dueAt <= now);
  }

  // A manual reset also sets stage zero, but does not schedule a waiting interval.
  function hasPendingLapse(record) {
    return record?.stage === 0 && record.dueAt > record.updatedAt;
  }

  function review(previous, remembered, now = Date.now()) {
    if (typeof remembered !== 'boolean' || !timestamp(now))
      throw new Error('卡片記憶的回答或時間不正確。');
    // A level-2 word with a completed record has been explicitly returned to learning.
    const normalized = normalizeRecord(previous);
    const current = normalized && normalized.stage !== masteryStage ? normalized : null;
    if (current && !due(current, now))
      return { record: copyRecord(current), mastered: false, unfamiliar: false, accepted: false };
    const unfamiliar = !remembered && hasPendingLapse(current);
    const stage = remembered ? (current?.stage || 0) + 1 : 0;
    const mastered = stage === masteryStage;
    const delay = mastered ? 0 : remembered ? intervals[stage - 1] : intervals[0];
    if (!mastered && now > maxTimestamp - delay)
      throw new Error('卡片記憶的時間超出支援範圍。');
    return {
      record: { stage, dueAt: mastered ? 0 : now + delay, updatedAt: now },
      mastered,
      unfamiliar,
      accepted: true,
    };
  }

  function scoped(words, levels, selectedCategories) {
    const selected = new Set(selectedCategories || []);
    const level = typeof levels === 'function' ? levels : (id) => levels?.[id] || 0;
    // Duplicate source IDs must not create two rating opportunities in one round.
    const seen = new Set();
    return words.filter((word) => {
      if (!selected.has(word.category) || level(word.id) !== 2 || seen.has(word.id)) return false;
      seen.add(word.id);
      return true;
    });
  }

  function activeRecord(records, id) {
    const record = normalizeRecord(records?.[id]);
    // Treat manual downgrades to 有印象 as a fresh learning cycle.
    return record && record.stage !== masteryStage ? record : undefined;
  }

  function candidates(words, levels, records, selectedCategories, now = Date.now()) {
    return scoped(words, levels, selectedCategories)
      .map((word, index) => ({ word, index, record: activeRecord(records, word.id) }))
      .filter(({ record }) => due(record, now))
      .sort((a, b) =>
        (a.record?.dueAt ?? Infinity) - (b.record?.dueAt ?? Infinity) || a.index - b.index,
      )
      .map(({ word }) => word);
  }

  function summary(words, levels, records, selectedCategories, now = Date.now()) {
    const eligibleWords = scoped(words, levels, selectedCategories);
    let dueCount = 0;
    let nextDueAt = null;
    for (const word of eligibleWords) {
      const record = activeRecord(records, word.id);
      if (due(record, now)) dueCount++;
      else nextDueAt = nextDueAt === null ? record.dueAt : Math.min(nextDueAt, record.dueAt);
    }
    return {
      eligible: eligibleWords.length,
      due: dueCount,
      waiting: eligibleWords.length - dueCount,
      nextDueAt,
    };
  }

  function mergeWord(words, wordID, record) {
    const current = words[wordID];
    if (
      !current ||
      record.updatedAt > current.updatedAt ||
      (record.updatedAt === current.updatedAt &&
        (record.stage < current.stage ||
          (record.stage === current.stage && record.dueAt > current.dueAt)))
    )
      words[wordID] = record;
  }

  function merge(base, incoming) {
    const result = sanitize(base);
    const additions = sanitize(incoming, { strict: true });
    for (const [dictionaryID, records] of Object.entries(additions)) {
      const target = result[dictionaryID] ??= Object.create(null);
      for (const [wordID, record] of Object.entries(records)) mergeWord(target, wordID, record);
    }
    // Both inputs are already normalized. Only the size of their union can exceed the limit.
    const count = Object.values(result).reduce((total, words) => total + Object.keys(words).length, 0);
    if (count > maxRecords) throw new Error('合併後的卡片記憶記錄超過上限。');
    return result;
  }

  function snapshot(value) {
    const result = [];
    for (const [dictionaryID, words] of Object.entries(sanitize(value, { strict: true })))
      for (const [wordID, record] of Object.entries(words)) {
        if (!window.MotsSyncProtocol.identifier(dictionaryID, 128) ||
            !window.MotsSyncProtocol.identifier(wordID, 256)) throw new Error('invalid-snapshot');
        result.push({ dictionaryID, wordID, ...record });
      }
    return result.sort(window.MotsSyncProtocol.sort);
  }

  function decodeSnapshot(value) {
    const protocol = window.MotsSyncProtocol;
    if (!protocol.exactKeys(value, ['version', 'records']) || value.version !== 1 ||
        !Array.isArray(value.records) || value.records.length > maxRecords) throw new Error('invalid-snapshot');
    const result = Object.create(null);
    for (const item of value.records) {
      if (!protocol.exactKeys(item, ['dictionaryID', 'wordID', 'stage', 'dueAt', 'updatedAt']) ||
          !protocol.identifier(item.dictionaryID, 128) || !protocol.identifier(item.wordID, 256)) throw new Error('invalid-snapshot');
      const { dictionaryID, wordID, stage, dueAt, updatedAt } = item;
      const record = { stage, dueAt, updatedAt };
      if (!validRecord(record)) throw new Error('invalid-snapshot');
      const target = result[dictionaryID] ??= Object.create(null);
      mergeWord(target, wordID, record);
    }
    return result;
  }

  // Learning position belongs to this browser's workspace, separately from the
  // cross-tab schedule. Restoring it must never replace a captured queue with a
  // new selection or reinterpret an explicitly empty chapter selection as all.
  function sanitizeWorkspace(value) {
    const result = { version: 1, active: false, dictionaryID: null, books: {} };
    if (!object(value) || value.version !== 1) return result;
    result.active = value.active === true;
    result.dictionaryID = validID(value.dictionaryID) ? value.dictionaryID : null;
    if (!object(value.books)) return result;
    let count = 0;
    for (const [dictionaryID, book] of Object.entries(value.books)) {
      if (!validID(dictionaryID) || !object(book) || count >= 50) continue;
      const chapters = book.chapters ?? null;
      if (
        chapters !== null &&
        (!Array.isArray(chapters) || chapters.length > 5000 || !chapters.every(validID))
      )
        continue;
      const cleaned = { chapters: chapters === null ? null : [...new Set(chapters)], session: null };
      const session = book.session;
      if (object(session)) {
        const { ids, answered, remembered, mastered, revealed, paused } = session;
        const roundIDs = new Set(Array.isArray(ids) ? ids : []);
        if (
          Array.isArray(ids) &&
          ids.length <= maxRecords &&
          ids.every(validID) &&
          roundIDs.size === ids.length &&
          Array.isArray(answered) &&
          answered.length <= ids.length &&
          new Set(answered).size === answered.length &&
          answered.every((id) => validID(id) && roundIDs.has(id)) &&
          Number.isInteger(remembered) &&
          remembered >= 0 &&
          remembered <= answered.length &&
          Number.isInteger(mastered) &&
          mastered >= 0 &&
          mastered <= remembered &&
          typeof revealed === 'boolean' &&
          typeof paused === 'boolean'
        )
          cleaned.session = {
            ids: [...ids],
            answered: [...answered],
            remembered,
            mastered,
            revealed,
            paused,
          };
      }
      result.books[dictionaryID] = cleaned;
      count++;
    }
    return result;
  }

  window.MotsMemory = Object.freeze({
    snapshot,
    decodeSnapshot,
    intervals,
    masteryStage,
    sanitize,
    due,
    hasPendingLapse,
    review,
    candidates,
    summary,
    merge,
    sanitizeWorkspace,
  });
})();
