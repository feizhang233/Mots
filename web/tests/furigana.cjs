'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const scope = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'web/src/js/core.js'), 'utf8'), scope);
const { furiganaSegments, formatTerm } = scope.window.MotsCore;
const segments = (term, reading) => JSON.parse(JSON.stringify(furiganaSegments(term, reading)));
const ruby = (term, reading) => `<ruby class="japanese-ruby">${term}<rt>${reading}</rt></ruby>`;
const kana = (text) => text.replace(/[ァ-ヶ]/gu, (letter) => String.fromCodePoint(letter.codePointAt(0) - 0x60));

assert.deepEqual(segments('診察する', 'しんさつする'), [
  { text: '診察', reading: 'しんさつ' }, { text: 'する', reading: '' },
]);
assert.deepEqual(segments('取り組む', 'とりくむ'), [
  { text: '取', reading: 'と' }, { text: 'り', reading: '' },
  { text: '組', reading: 'く' }, { text: 'む', reading: '' },
]);
assert.deepEqual(segments('頭に来る', 'あたまにくる'), [
  { text: '頭', reading: 'あたま' }, { text: 'に', reading: '' },
  { text: '来', reading: 'く' }, { text: 'る', reading: '' },
]);
assert.deepEqual(segments('お詫びする', 'おわびする'), [
  { text: 'お', reading: '' }, { text: '詫', reading: 'わ' }, { text: 'びする', reading: '' },
]);
assert.deepEqual(segments('腰掛ける', 'こしかける'), [
  { text: '腰掛', reading: 'こしか' }, { text: 'ける', reading: '' },
]);
for (const [term, reading] of [['各々', 'おのおの'], ['度々', 'たびたび']])
  assert.deepEqual(segments(term, reading), [{ text: term, reading }]);
assert.deepEqual(segments('徐々に', 'じょじょに'), [
  { text: '徐々', reading: 'じょじょ' }, { text: 'に', reading: '' },
]);
assert.deepEqual(segments('溶く〔待確認〕', 'とく'), [
  { text: '溶', reading: 'と' }, { text: 'く', reading: '' }, { text: '〔待確認〕', reading: '' },
]);
assert.deepEqual(segments('漢カ字', 'かんかじ'), [
  { text: '漢', reading: 'かん' }, { text: 'カ', reading: '' }, { text: '字', reading: 'じ' },
]);

for (const [term, reading] of [['しゃがむ', 'しゃがむ'], ['ブラシ', 'ぶらし'], ['よほど・よっぽど', 'よほど・よっぽど']]) {
  assert.deepEqual(segments(term, reading), [{ text: term, reading: '' }]);
  assert.equal(formatTerm({ term: `${term}（${reading}）` }, 'ja'), term);
}
assert.equal(formatTerm({ term: '名前（なまえ）' }, 'ja'), ruby('名前', 'なまえ'));
assert.equal(formatTerm({ term: '名前(なまえ)' }, 'ja'), ruby('名前', 'なまえ'));
assert.equal(formatTerm({ term: '診察する（しんさつする）', headword: '診察する', reading: 'しんさつする' }, 'ja'), ruby('診察', 'しんさつ') + 'する');
assert.equal(formatTerm({ term: '漢字' }, 'ja'), '漢字');
assert.equal(formatTerm({ french: "l’école & l'étude" }, 'fr'), 'l’école &amp; l&#39;étude');
assert.equal(formatTerm({ term: 'der Name (Name)', reading: 'なまえ' }, 'de'), 'der Name (Name)');

// Several valid kana-anchor splits must not invent a pronunciation per kanji.
assert.deepEqual(segments('漢あ字', 'かああじ'), [{ text: '漢あ字', reading: 'かああじ' }]);
assert.equal(formatTerm({ term: '漢あ字', reading: 'かああじ' }, 'ja'), ruby('漢あ字', 'かああじ'));
assert.deepEqual(segments('食べる', 'たべます'), [{ text: '食べる', reading: 'たべます' }]);

const unsafe = formatTerm({ term: '<img src=x onerror="alert(1)">漢', reading: '<svg onload="alert(1)">かん' }, 'ja');
assert(!unsafe.includes('<img') && !unsafe.includes('<svg'), 'Imported text cannot introduce elements');
assert(unsafe.includes('&lt;img') && unsafe.includes('&lt;svg') && unsafe.includes('&quot;'));
assert.equal((unsafe.match(/<ruby\b/g) || []).length, 1);
assert.equal((unsafe.match(/<rt>/g) || []).length, 1);
assert.equal(formatTerm({ term: '<script>alert(1)</script>' }, 'fr'), '&lt;script&gt;alert(1)&lt;/script&gt;');

const words = JSON.parse(fs.readFileSync(path.join(root, 'database/japanese/vocabulary.json'), 'utf8')).words;
let annotated = 0;
let plain = 0;
for (const word of words) {
  const parts = segments(word.headword, word.reading);
  assert.equal(parts.map((part) => part.text).join(''), word.headword, `Headword retained: ${word.id}`);
  const hasKanji = /[\p{Script=Han}々]/u.test(word.headword.replace(/〔[^〕]*〕$/u, ''));
  if (hasKanji) {
    annotated++;
    assert(parts.some((part) => part.reading), `Kanji reading retained: ${word.id}`);
    for (const part of parts.filter((part) => part.reading))
      assert(/^[\p{Script=Han}々]+$/u.test(part.text), `Only kanji annotated: ${word.id}`);
    const reading = parts.filter((part) => !/^〔[^〕]*〕$/u.test(part.text))
      .map((part) => part.reading || kana(part.text)).join('');
    assert.equal(reading, word.reading, `Complete reading retained: ${word.id}`);
  } else {
    plain++;
    assert.equal(parts.length, 1);
    assert.equal(parts[0].reading, '');
  }
  const markup = formatTerm(word, 'ja');
  assert(!/[（）()]/u.test(markup), `Parenthetical reading removed: ${word.id}`);
}
assert.equal(words.length, 414);
assert.equal(annotated, 363);
assert.equal(plain, 51);
console.log('Furigana: okurigana, legacy imports, safe HTML, fallback and all 414 source words passed (363 annotated, 51 plain).');
