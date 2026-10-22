// Exercise our adapter's async races. Material's browser behavior is its own
// responsibility and is covered separately by interactive browser verification.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const source = fs
  .readFileSync(path.join(__dirname, '../src/components/material-select.js'), 'utf8')
  .replace(/^import .*;\n/gm, '');

class Element {
  constructor(tag) {
    this.tag = tag;
    this.children = [];
    this.listeners = {};
  }
  append(child) {
    this.children.push(child);
  }
  addEventListener(type, handler) {
    (this.listeners[type] ??= []).push(handler);
  }
  fire(type) {
    for (const handler of this.listeners[type] || []) handler();
  }
}

let settleInitial;
class Select extends Element {
  constructor() {
    super('md-outlined-select');
    this.id = 'study-language';
    this.isConnected = true;
    this.ready = false;
    this.replacements = 0;
    this.updateComplete = new Promise((resolve) => {
      settleInitial = resolve;
    });
  }
  get value() {
    return this._value;
  }
  set value(value) {
    if (this.ready && this.children.some((option) => option.value === value)) {
      this._value = value;
      for (const option of this.children) option.selected = option.value === value;
    }
  }
  replaceChildren(fragment) {
    this.children = fragment.children;
    this.replacements++;
  }
}

const select = new Select();
const document = {
  getElementById: () => select,
  querySelectorAll: (selector) => (selector === 'md-outlined-select' ? [select] : []),
  createDocumentFragment: () => new Element('fragment'),
  createElement: (tag) => new Element(tag),
};
const listeners = {};
const window = {
  addEventListener(type, handler) {
    listeners[type] = handler;
  },
  matchMedia: () => ({ matches: false, addEventListener() {} }),
};
vm.runInNewContext(source, {
  document,
  window,
  WeakMap,
  WeakSet,
  Promise,
  Object,
  String,
  Boolean,
});
const api = window.MotsSelect;
const entries = [
  { value: 'fr', label: 'Français' },
  { value: 'de', label: '<b>Deutsch</b>' },
  { value: 'ja', label: '日本語', lang: 'ja' },
];

async function run() {
  api.setOptions('study-language', entries);
  assert.equal(select.children.length, 3);
  assert.equal(select.children[1].children[0].textContent, '<b>Deutsch</b>');
  assert.equal(select.children[2].children[0].lang, 'ja');
  assert.equal(select.children[1].children[0].slot, 'headline');
  api.setValue('study-language', 'fr');
  api.setValue('study-language', 'de');
  select.ready = true;
  settleInitial();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(select.value, 'de', 'Latest requested value wins after the first render');

  const replacements = select.replacements;
  api.setOptions('study-language', entries);
  assert.equal(select.replacements, replacements, 'Equivalent options do not rebuild the control');

  let settleNext;
  select.updateComplete = new Promise((resolve) => {
    settleNext = resolve;
  });
  select.ready = false;
  api.setValue('study-language', 'fr');
  select._value = 'ja';
  select.fire('change');
  select.ready = true;
  settleNext();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(select.value, 'ja', 'A user choice supersedes a pending programmatic value');
  assert.equal(select.menuPositioning, 'popover');
  assert.equal(select.clampMenuWidth, true);

  const menu = {
    open: true,
    close() {
      this.open = false;
    },
  };
  select.shadowRoot = { querySelector: () => menu };
  listeners.resize();
  assert.equal(menu.open, false, 'Resize closes the old measured menu before it can reopen');
  console.log('Select value races, labels, stable options, and resize closing passed.');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
