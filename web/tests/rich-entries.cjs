const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = process.env.MOTS_TEST_SOURCE === '1' ? '../src/js' : '../dist';
const context = {
  CATEGORIES: [{ id: '1', name: '一般', subcategories: [{ id: '1.01', name: '詞條' }] }],
};
context.window = context;
vm.createContext(context);
for (const script of ['core', 'dictionaries', 'entries'])
  vm.runInContext(
    fs.readFileSync(path.resolve(__dirname, source, `${script}.js`), 'utf8'),
    context,
  );
const dictionaries = context.MotsDictionaries;
const plain = (value) => JSON.parse(JSON.stringify(value));
const entry = {
  id: 'negation',
  term: 'ne … pas',
  meanings: { 'zh-Hant': '不；沒有' },
  example: 'Je ne parle pas.',
  examples: [
    { text: 'Je ne parle pas.', translations: { 'zh-Hant': '我不說話。' } },
    'Il ne vient pas.',
    { text: 'Il ne vient pas.', translations: { en: 'He is not coming.' } },
    { text: 'Nous ne savons pas.', translations: { 'zh-Hant': '我們不知道。' } },
  ],
  pattern: 'ne + verbe + pas',
  explanation: '將動詞放在 ne 與 pas 之間。',
};
const fixture = {
  id: 'dict-grammar-test',
  title: '法語語法',
  language: 'fr',
  kind: 'grammar',
  words: [entry],
};
const result = dictionaries.validateImport(fixture);
assert.equal(result.kind, 'grammar');
assert.equal(result.words[0].examples.length, 3);
assert.equal(result.words[0].examples[0].translations['zh-Hant'], '我不說話。');
assert.equal(result.words[0].examples[1].translations.en, 'He is not coming.');
assert.equal(result.words[0].pattern, entry.pattern);
assert.equal(result.words[0].explanation, entry.explanation);
assert.deepEqual(
  plain(dictionaries.validateLibrary([result])),
  plain([result]),
  'Backup round-trip retains rich details and study kind',
);
assert.equal(dictionaries.validateImport({ ...fixture, kind: 'vocabulary' }).kind, 'vocabulary');
const legacy = { ...fixture };
delete legacy.kind;
assert.equal(dictionaries.validateImport(legacy).kind, 'vocabulary');
assert.equal(dictionaries.validateImport(legacy, { kind: 'grammar' }).kind, 'grammar');
assert.equal(
  dictionaries.validateImport({ ...fixture, kind: 'vocabulary' }, { kind: 'grammar' }).kind,
  'vocabulary',
);
assert.throws(() => dictionaries.validateImport(legacy, { kind: 'unknown' }));
assert(
  dictionaries.builtins().every((dictionary) => (dictionary.kind || 'vocabulary') === 'vocabulary'),
);
assert.equal(dictionaries.normalizeDetails({ examples: ['Une phrase.'] }).example, 'Une phrase.');
assert.deepEqual(plain(dictionaries.normalizeDetails({})), {
  example: '',
  examples: [],
  pattern: '',
  explanation: '',
});
assert.equal(
  dictionaries.normalizeDetails({ example: ' Un mot. ', examples: ['Un mot.'] }).examples.length,
  1,
);

const extensionOptions = {
  language: 'fr',
  meaningLanguage: 'zh-Hant',
  meaningCodes: new Set(['zh-Hant', 'en']),
  categories: context.CATEGORIES,
};
const extension = context.MotsEntries.validate([entry], extensionOptions);
assert.equal(extension[0].id, 'custom-fr-negation');
assert.deepEqual(plain(extension[0].examples), plain(result.words[0].examples));
assert.equal(extension[0].explanation, entry.explanation);
assert.deepEqual(
  plain(context.MotsEntries.validate(extension, { ...extensionOptions, preserveIDs: true })),
  plain(extension),
  'Vocabulary extension backup retains IDs and rich details',
);

for (const invalid of [
  { examples: null },
  { examples: {} },
  { examples: [''] },
  { examples: [42] },
  { examples: [{ text: 'Valid', translations: 'wrong' }] },
  { examples: [{ text: 'Valid', translations: { 'zh-Hant': 2 } }] },
  { examples: [{ text: 'x'.repeat(2001) }] },
  { examples: Array.from({ length: 21 }, (_, index) => `例句 ${index}`) },
  { example: 'Legacy', examples: Array.from({ length: 20 }, (_, index) => `例句 ${index}`) },
  { pattern: 42 },
  { pattern: 'x'.repeat(2001) },
  { explanation: ['wrong'] },
  { explanation: 'x'.repeat(6001) },
  JSON.parse('{"examples":[{"text":"Valid","translations":{"__proto__":"bad"}}]}'),
]) {
  const badEntry = { ...entry, ...invalid, id: 'invalid' };
  assert.throws(() => dictionaries.validateImport({ ...fixture, words: [entry, badEntry] }));
  assert.throws(() => context.MotsEntries.validate([entry, badEntry], extensionOptions));
}
assert.throws(() => dictionaries.validateImport({ ...fixture, kind: 'unknown' }));
assert.throws(() => dictionaries.validateImport({ ...fixture, id: 'grammar-fr' }));
assert.equal(fixture.words[0].examples.length, 4, 'Validation does not mutate source data');
console.log('Rich entry import and backup regressions passed.');
