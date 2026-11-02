const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const sandbox = { window: {} };
vm.runInNewContext(
  fs.readFileSync(path.join(__dirname, '../src/js/memory.js'), 'utf8'),
  sandbox,
);
const memory = sandbox.window.MotsMemory;
const plain = (value) => JSON.parse(JSON.stringify(value));
const start = Date.UTC(2026, 9, 29, 12);
const minute = 60000;
const hour = 60 * minute;
const day = 24 * hour;
assert.deepEqual(plain(memory.intervals), [day, 2 * day, 4 * day, 7 * day]);
assert.equal(memory.masteryStage, 5);

let now = start;
let record;
for (let stage = 1; stage <= 5; stage++) {
  assert(memory.due(record, now));
  const result = memory.review(record, true, now);
  assert.equal(result.accepted, true);
  assert.equal(result.mastered, stage === 5, 'Only the fifth successful due recall earns mastery');
  assert.equal(result.record.stage, stage);
  assert.equal(result.record.updatedAt, now);
  if (stage !== 5) {
    assert.equal(result.record.dueAt, now + memory.intervals[stage - 1]);
    const tooSoon = memory.review(result.record, true, now);
    assert.equal(tooSoon.accepted, false, 'Repeated clicks cannot bypass an interval');
    assert.deepEqual(plain(tooSoon.record), plain(result.record));
    assert.equal(memory.due(result.record, result.record.dueAt - 1), false);
    now = result.record.dueAt;
  } else {
    assert.equal(result.record.dueAt, 0);
    assert.equal(memory.due(result.record, now + day), false);
  }
  record = result.record;
}
const masteredRecord = record;
const forgotten = memory.review({ stage: 4, dueAt: now, updatedAt: now - day }, false, now);
assert.deepEqual(plain(forgotten), {
  record: { stage: 0, dueAt: now + day, updatedAt: now },
  mastered: false,
  accepted: true,
});
const relearned = memory.review(forgotten.record, true, forgotten.record.dueAt);
assert.equal(relearned.record.stage, 1, 'A lapse restarts the full expanding schedule');
assert.equal(memory.review(masteredRecord, true, now).record.stage, 1, 'A manual downgrade can start again');

const words = [
  { id: 'fresh', category: '1' },
  { id: 'late', category: '1' },
  { id: 'soon', category: '1' },
  { id: 'other', category: '2' },
  { id: 'new', category: '1' },
  { id: 'known', category: '1' },
  { id: 'weak', category: '1' },
  { id: 'again', category: '1' },
  { id: 'fresh', category: '1' },
];
const levels = { fresh: 2, late: 2, soon: 2, other: 2, new: 0, known: 3, weak: 1, again: 2 };
const records = {
  late: { stage: 3, dueAt: start - minute, updatedAt: start - day },
  soon: { stage: 1, dueAt: start + minute, updatedAt: start - minute },
  again: masteredRecord,
};
assert.deepEqual(plain(memory.candidates(words, levels, records, ['1'], start)).map((word) => word.id), ['late', 'fresh', 'again']);
assert.deepEqual(plain(memory.candidates(words, (id) => levels[id], records, ['1', '2'], start)).map((word) => word.id), ['late', 'fresh', 'other', 'again']);
assert.equal(memory.candidates(words, levels, records, [], start).length, 0);
assert.deepEqual(plain(memory.summary(words, levels, records, ['1'], start)), {
  eligible: 4,
  due: 3,
  waiting: 1,
  nextDueAt: start + minute,
});
assert.equal(memory.summary(words, levels, records, ['1'], start + minute).waiting, 0);
assert.equal(memory.summary(words, levels, records, ['1'], start + minute).nextDueAt, null);
assert.equal(memory.candidates(words.filter((word) => word.id !== 'late'), levels, records, ['1'], start).some((word) => word.id === 'late'), false, 'Deleted words omitted by the caller remain absent');

const valid = { fr: { a: { stage: 1, dueAt: start + minute, updatedAt: start } } };
const sanitized = memory.sanitize(valid, { strict: true });
sanitized.fr.a.stage = 2;
assert.equal(valid.fr.a.stage, 1, 'Sanitizing never aliases caller-owned records');
for (const invalid of [
  null,
  [],
  { fr: [] },
  { fr: { a: { stage: 10, dueAt: start, updatedAt: start } } },
  { fr: { a: { stage: -1, dueAt: start, updatedAt: start } } },
  { fr: { a: { stage: 1.5, dueAt: start, updatedAt: start } } },
  { fr: { a: { stage: 1, dueAt: '1', updatedAt: start } } },
  { fr: { a: { stage: 1, dueAt: NaN, updatedAt: start } } },
  { fr: { a: { stage: 1, dueAt: Infinity, updatedAt: start } } },
  { fr: { a: { stage: 1, dueAt: start - 1, updatedAt: start } } },
  { fr: { a: { stage: 9, dueAt: start, updatedAt: start } } },
  { fr: { a: { stage: 1, dueAt: 253402300800000, updatedAt: start } } },
  { fr: { a: { stage: 1, dueAt: start + minute, updatedAt: start, extra: true } } },
  JSON.parse('{"__proto__":{"a":{"stage":1,"dueAt":1,"updatedAt":0}}}'),
  JSON.parse('{"fr":{"constructor":{"stage":1,"dueAt":1,"updatedAt":0}}}'),
]) {
  assert.throws(() => memory.sanitize(invalid, { strict: true }));
  assert.doesNotThrow(() => memory.sanitize(invalid));
}
assert.deepEqual(plain(memory.sanitize({ fr: { valid: valid.fr.a, bad: { stage: 50 } } })), { fr: { valid: valid.fr.a } });
assert.throws(() => memory.review(null, 'true', start));
assert.throws(() => memory.review(null, true, -1));
assert.throws(() => memory.review(null, true, 253402300799999));

const older = { fr: { a: { stage: 3, dueAt: start + day, updatedAt: start } } };
const newer = { fr: { a: { stage: 0, dueAt: start + 2 * day, updatedAt: start + day } }, de: { a: valid.fr.a } };
assert.deepEqual(plain(memory.merge(older, newer)), newer, 'Restore preserves the newest schedule and dictionary identity');
assert.deepEqual(plain(memory.merge(newer, older)), newer, 'Old backups never roll a newer cycle back');
const tie = { fr: { a: { stage: 0, dueAt: start + minute, updatedAt: start } } };
assert.deepEqual(plain(memory.merge(older, tie)), tie, 'A timestamp tie conservatively keeps the lapse');
assert.deepEqual(plain(memory.merge(tie, older)), tie, 'Tie resolution is independent of restore direction');
assert.equal(older.fr.a.stage, 3, 'Merge does not mutate the current state');
assert.throws(() => memory.merge(valid, { fr: { broken: {} } }));
console.log('Memory intervals, due gating, mastery, lapses, multi-chapter scope, levels, deduplication, validation and backup merge passed.');

// Missing one or many due dates never substitutes for a successful recall.
const first = memory.review(undefined, true, start).record;
for (const lateBy of [day, 30 * day]) {
  const answeredAt = first.dueAt + lateBy;
  const late = memory.review(first, true, answeredAt);
  assert.equal(late.record.stage, 2, 'A delayed second answer is still only the second recall');
  assert.equal(late.mastered, false);
  assert.equal(late.record.dueAt, answeredAt + 2 * day, 'The next wait starts at the actual late answer');
}
for (let legacyStage = 5; legacyStage <= 8; legacyStage++) {
  const old = { stage: legacyStage, dueAt: start + day, updatedAt: start };
  const migrated = memory.sanitize({ fr: { old } }, { strict: true }).fr.old;
  assert.deepEqual(plain(migrated), { ...old, stage: 4 }, 'Legacy incomplete records remain due before mastery');
  assert.equal(memory.review(migrated, true, start).accepted, false);
  assert.equal(memory.review(migrated, true, old.dueAt).mastered, true);
  assert.deepEqual(plain(memory.sanitize({ fr: { old: migrated } }, { strict: true }).fr.old), plain(migrated));
}
assert.deepEqual(plain(memory.sanitize({ fr: { old: { stage: 9, dueAt: 0, updatedAt: start } } }, { strict: true })),
  { fr: { old: { stage: 5, dueAt: 0, updatedAt: start } } }, 'Legacy completed records remain completed');
assert.deepEqual(plain(memory.sanitize({ fr: { old: { stage: 5, dueAt: 0, updatedAt: start } } }, { strict: true })),
  { fr: { old: { stage: 5, dueAt: 0, updatedAt: start } } }, 'New completed records are not reinterpreted as incomplete legacy progress');
