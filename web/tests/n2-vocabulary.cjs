'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const scope = { window: {} };
for (const file of ['database/runtime/data.js', 'web/src/js/core.js', 'web/src/js/languages.js', 'web/src/js/n2-vocabulary.js', 'web/src/js/dictionaries.js'])
  vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), scope, { filename: file });
const w = scope.window;
const book = w.MotsDictionaries.builtins().find(book => book.id === 'vocab-ja-n2-hongbao');
assert(book && book.language === 'ja' && book.kind === 'vocabulary');
assert.equal(book.words.length, 3136);
assert.deepEqual(Array.from(book.categories, c => c.id), ['1', '2', '3']);
assert.equal(new Set(book.words.map(word => word.id)).size, 3136);
const source = JSON.parse(fs.readFileSync(path.join(root, 'database/japanese/hongbao-n2/vocabulary.json')));
assert.deepEqual(JSON.parse(JSON.stringify(book)), source);
for (const word of book.words) {
  const category = book.categories.find(category => category.id === word.category);
  assert(category.subcategories.some(sub => sub.id === word.subcategory));
  const details = w.MotsDictionaries.normalizeDetails(word, 0, 'ja');
  assert.equal(details.examples.length, 1);
  assert.equal(details.examples[0].furigana.map(segment => segment.text).join(''), word.example);
  const html = w.MotsCore.formatExample(details.examples[0], 'ja');
  assert.equal((html.match(/class="japanese-reading"/g) || []).length, details.examples[0].furigana.filter(segment => segment.reading).length);
  assert(!html.includes('<ruby') && !html.includes('<rt>'));
  if (/[一-龯々]/u.test(word.term)) assert(w.MotsCore.formatTerm(word, 'ja').includes(`（${word.reading}）`));
}
const empty = book.words.find(word => word.id === 'hb-n2-0dada549a204');
assert.equal(empty.term,'空');
assert.equal(empty.reading,'から');
assert.equal(empty.example,'箱の中は空でした。');
assert(w.MotsCore.formatExample(empty.examples[0],'ja').includes('（から）'));
assert(!w.MotsCore.formatExample(empty.examples[0],'ja').includes('そら'));
assert.equal(book.words.find(word=>word.term==='空模様').reading,'そらもよう');
const identities = JSON.parse(fs.readFileSync(path.join(root, 'database/japanese/hongbao-n2/identity.json')));
assert.equal(identities.dictionaryId, book.id);
assert.deepEqual(JSON.parse(JSON.stringify(book.words.map(word => ({sourceOrder:word.sourceOrder,id:word.id})))),identities.entries);
for (const [order, term, reading, meaning] of [
  [106,'幾～','いく～','多少'], [318,'雄','おす','雄'],
  [375,'カーブ','カーブ','曲線'], [826,'憲法','けんぽう','憲法'],
  [1379,'審判','しんぱん','裁判'], [1412,'隙','すき','空隙'],
  [1718,'妥当','だとう','妥當'], [2360,'美','び','美'],
  [2531,'不平','ふへい','牢騷'], [2559,'文科','ぶんか','文科'], [2683,'ぼろ','ぼろ','破布']
]) {
  const word=book.words.find(word=>word.sourceOrder===order);
  assert.equal(word.term,term); assert.equal(word.reading,reading);
  assert(word.meanings['zh-Hant'].includes(meaning));
}
for (const [order,text,reading] of [[106,'幾日','いくにち'],[148,'一年中','いちねんじゅう'],
  [328,'脅','おど'],[518,'上','かみ'],[2048,'腕時計','うでどけい'],[2062,'止','とど'],[3128,'私事','わたくしごと']]) {
  assert(book.words.find(word=>word.sourceOrder===order).examples[0].furigana.some(segment=>segment.text===text&&segment.reading===reading));
}
// Book identity keeps the original Japanese words and progress namespace intact.
assert.equal(w.MOTS_EXTRA_BANKS.ja.length, 414);
assert.equal(w.MotsDictionaries.builtins().find(book => book.id === 'ja').title, '日語詞彙總表');
const annotated = { example: '漢字。', examples: [{ text: '漢字。', furigana: [{ text: '漢字', reading: 'かんじ' }, { text: '。', reading: '' }] }] };
const normalized = w.MotsDictionaries.normalizeDetails(annotated, 0, 'ja');
assert(normalized.examples[0].furigana);
assert.throws(() => w.MotsDictionaries.normalizeDetails({ examples: [{ text: '漢字。', furigana: [{ text: '別', reading: 'べつ' }] }] }, 0, 'ja'), /不一致/);
assert.throws(() => w.MotsDictionaries.normalizeDetails({ examples: [{ text: '漢字。', furigana: [{ text: '漢字。', reading: '<svg>' }] }] }, 0, 'ja'), /不一致/);
const unsafe = w.MotsCore.formatExample({ text: '<img>', furigana: [{ text: '<img>', reading: 'かんじ' }] }, 'ja');
assert(!unsafe.includes('<img>') && unsafe.includes('&lt;img&gt;'));
assert.equal(w.MotsCore.formatExample({ text: 'abc', furigana: [{ text: 'wrong', reading: 'あ' }] }, 'ja'), 'abc');
console.log('N2: complete source agreement, priority/POS membership, all 3136 readings/examples, original book preservation and safe annotated import passed.');
