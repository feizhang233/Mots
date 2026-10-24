// Native popup behavior belongs to the OS. This suite covers our option/value
// bridge, safe labels, identity retention and first-render synchronization.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../src/components/select.js'), 'utf8');

class Element {
  constructor(tag) {
    this.tag = tag;
    this.children = [];
    this.value = '';
    this.replacements = 0;
  }
  append(child) {
    this.children.push(child);
  }
  replaceChildren(fragment) {
    this.children = fragment.children;
    this.replacements++;
  }
}
const select = new Element('select');
const document = {
  getElementById: (id) => (id === 'study-language' ? select : null),
  createDocumentFragment: () => new Element('fragment'),
  createElement: (tag) => new Element(tag),
};
const window = {};
vm.runInNewContext(source, { document, window, WeakMap, Object, String, Boolean });
const api = window.MotsSelect;
const entries = [
  { value: 'fr', label: 'Français' },
  { value: 'de', label: '<b>Deutsch</b>' },
  { value: 'ja', label: '日本語', lang: 'ja' },
];
api.setOptions('study-language', entries);
assert.equal(select.children.length, 3);
assert.equal(select.children[1].tag, 'option');
assert.equal(
  select.children[1].textContent,
  '<b>Deutsch</b>',
  'Option labels use text, never HTML',
);
assert.equal(select.children[2].lang, 'ja');
assert.equal(select.value, 'fr', 'First usable option is immediately selected');
api.setValue('study-language', 'de');
assert.equal(
  select.value,
  'de',
  'Requested value is visible synchronously without custom-element upgrade',
);
const replacements = select.replacements;
api.setOptions('study-language', entries);
assert.equal(
  select.replacements,
  replacements,
  'Equivalent options preserve focus and native selection',
);
assert.equal(select.value, 'de');
api.setOptions(select, [...entries, { value: 'imported', label: '我的辭典' }]);
assert.equal(select.value, 'de', 'Refreshing dictionaries preserves the selected identity');
api.setValue(select, 'imported');
assert.equal(select.value, 'imported', 'New dictionary is selectable immediately');
api.setOptions(select, [
  { value: 'no', disabled: true },
  { value: 'yes', label: 'Available' },
]);
assert.equal(select.value, 'yes', 'Removed values fall back to the first enabled option');
assert.equal(select.children[0].disabled, true);
api.setOptions(select, []);
assert.equal(select.value, '', 'Empty options reset the value');
api.setOptions('missing', entries);
api.setValue('missing', 'fr');
api.syncAll();
api.closeAll();
assert.equal(Object.isFrozen(api), true);
const html = fs.readFileSync(path.join(__dirname, '../src/index.html'), 'utf8');
assert.equal((html.match(/<select\b/g) || []).length, 8, 'All eight shared selectors are native');
assert(!/<md-|@material/.test(html), 'The interface has no retired custom elements');
for (const id of [
  'dictionary-switcher',
  'study-language',
  'meaning-language',
  'page-size',
  'audio-mode',
  'export-unit',
]) {
  assert(html.includes(`<label for="${id}">`), `${id} has an associated visible label`);
}
assert(/<select[^>]*id="mode-switcher"[^>]*aria-label="使用方式"/.test(html));
assert(/<select[^>]*id="book-switcher"[^>]*aria-label="[^"]+"/.test(html));
assert(!html.includes('id="grammar-grouping"'), 'Grammar type belongs to a separate book');
assert(!/data-study-kind|id="(?:grammar|vocabulary)-mode"/.test(html));
console.log(
  'Native select values, safe labels, stable options, disabled/empty fallbacks and accessible markup passed.',
);
