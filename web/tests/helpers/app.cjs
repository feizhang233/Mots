// A small browser substitute for deterministic application-state regressions.
// Real popup geometry, focus, and rendering still require browser verification.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { webcrypto } = require('node:crypto');

const root = path.resolve(__dirname, '../..');
const readAsset = (name) => fs.readFileSync(path.join(root, 'dist', name), 'utf8');

function context(options = {}) {
  const asset =
    options.source || process.env.MOTS_TEST_SOURCE === '1'
      ? (name) => {
          const authored =
            name === 'index.html' ? path.join(root, 'src', name) : path.join(root, 'src/js', name);
          return fs.readFileSync(authored, 'utf8');
        }
      : readAsset;
  const elements = new Map();
  const store = new Map(
    Object.entries(options.storage || {}).map(([key, value]) => [
      key,
      typeof value === 'string' ? value : JSON.stringify(value),
    ]),
  );
  const listeners = {};
  const downloads = [];
  let document;
  class BrowserURL extends URL {
    static createObjectURL(blob) {
      downloads.push(blob);
      return `blob:test-download-${downloads.length}`;
    }
    static revokeObjectURL() {}
  }

  class Element {
    constructor(id = '') {
      Object.assign(this, {
        id,
        value: '',
        textContent: '',
        innerHTML: '',
        hidden: false,
        open: false,
        dataset: {},
        attrs: {},
        events: {},
        files: [],
        checked: false,
        scrollTop: 0,
        tagName: 'DIV',
        isConnected: true,
        classList: {
          toggle() {},
          add() {},
          remove() {},
          contains() {
            return false;
          },
        },
      });
    }
    setAttribute(key, value) {
      this.attrs[key] = String(value);
    }
    getAttribute(key) {
      return this.attrs[key] ?? null;
    }
    removeAttribute(key) {
      delete this.attrs[key];
      if (key === 'src') delete this.src;
    }
    addEventListener(type, fn) {
      (this.events[type] ??= []).push(fn);
    }
    removeEventListener() {}
    append() {}
    replaceChildren() {}
    remove() {}
    querySelector() {
      return new Element();
    }
    querySelectorAll() {
      return [];
    }
    closest() {
      return null;
    }
    matches() {
      return false;
    }
    focus() {
      document.activeElement = this;
    }
    blur() {}
    scrollIntoView() {}
    showModal() {
      this.open = true;
    }
    close() {
      this.open = false;
    }
    getBoundingClientRect() {
      return { left: 0, right: 1280, top: 0, bottom: 720, width: 1280, height: 720 };
    }
    pause() {
      this.paused = true;
    }
    load() {}
    play() {
      return Promise.resolve();
    }
    click() {}
  }

  const $ = (id) => {
    if (!elements.has(id)) elements.set(id, new Element(id));
    return elements.get(id);
  };
  document = {
    getElementById: $,
    querySelector: $,
    querySelectorAll: () => [],
    createElement(tag) {
      const element = new Element();
      element.tagName = tag.toUpperCase();
      return element;
    },
    createDocumentFragment: () => new Element(),
    body: new Element('body'),
    activeElement: new Element('active'),
    addEventListener(type, fn) {
      (listeners[`document:${type}`] ??= []).push(fn);
    },
  };
  const ctx = {
    document,
    location: new URL(options.url || 'http://localhost/Mots.html'),
    URL: BrowserURL,
    Blob,
    Intl,
    Map,
    Set,
    WeakMap,
    WeakSet,
    JSON,
    Math,
    Date,
    Promise,
    crypto: webcrypto,
    console,
    localStorage: {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => store.set(key, String(value)),
    },
    history: {
      replaceState(_state, _title, url) {
        ctx.location = new URL(url);
      },
    },
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    setTimeout: () => 0,
    clearTimeout() {},
    requestAnimationFrame(fn) {
      fn();
    },
    CSS: { escape: (value) => value },
    speechSynthesis: {
      cancel() {},
      getVoices() {
        return [];
      },
      addEventListener() {},
      removeEventListener() {},
      speak() {},
    },
    SpeechSynthesisUtterance: function (term) {
      this.text = term;
    },
    scrollTo() {},
    addEventListener(type, fn) {
      (listeners[type] ??= []).push(fn);
    },
    open() {},
    MotsSelect: {
      setValue(id, value) {
        $(id).value = value;
      },
      setOptions(id, entries) {
        $(id).options = entries;
      },
      syncAll() {},
      closeAll() {},
    },
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  ctx.CATEGORIES = options.categories || [
    {
      id: '1',
      name: '個人',
      subcategories: [
        { id: '1.01', name: '名稱' },
        { id: '1.02', name: '國籍' },
      ],
    },
    { id: '2', name: '居住', subcategories: [{ id: '2.01', name: '房屋' }] },
  ];
  ctx.WORDS = options.words || [
    {
      id: 'same',
      french: 'zèbre',
      chinese: '斑馬',
      example: 'Un zèbre.',
      category: '1',
      subcategory: '1.01',
    },
    {
      id: 'a',
      french: 'âge',
      chinese: '年齡',
      example: 'Quel âge ?',
      category: '1',
      subcategory: '1.01',
    },
    {
      id: 'b',
      french: 'bonjour',
      chinese: '你好',
      example: 'Bonjour !',
      category: '2',
      subcategory: '2.01',
    },
  ];
  ctx.MOTS_AUDIO = { words: { same: 'audio/old-book.m4a' } };
  ctx.MOTS_EXTRA_AUDIO = { de: { words: {} }, ja: { words: {} } };

  // Follow the public entrypoint's dependency order while substituting only the
  // large vocabulary/audio fixtures and the separately tested native Select adapter.
  const substituted = new Set(['data.js', 'audio-manifest.js', 'extra-audio.js', 'select.js']);
  const scripts = [
    ...asset('index.html').matchAll(/<script\b[^>]*\bsrc="([^"?]+)(?:\?[^"]*)?"[^>]*>/g),
  ];
  for (const [, filename] of scripts) {
    if (substituted.has(filename)) continue;
    let source = asset(filename);
    if (filename === 'app.js') {
      // Observe the real closure without shipping a test API to users.
      const end = source.lastIndexOf('})();');
      assert(end >= 0, 'Application bundle must expose its final classic IIFE boundary');
      source = `${source.slice(0, end)}window.__audit = { run: code => eval(code) };\n${source.slice(end)}`;
    }
    vm.runInContext(source, ctx, { timeout: 10000, filename });
  }
  assert(ctx.__audit, 'The HTML entrypoint must load app.js');
  return { ctx, $, store, listeners, downloads, run: (code) => ctx.__audit.run(code) };
}

const read = (app, code) => JSON.parse(app.run(`JSON.stringify(${code})`));
const click = (app, id) => {
  for (const handler of app.$(id).events.click || []) handler();
};
async function upload(app, id, data, { size, name = 'fixture.json', raw } = {}) {
  const text = raw === undefined ? JSON.stringify(data) : raw;
  const target = app.$(id);
  target.value = 'fixture';
  target.files = [{ size: size ?? Buffer.byteLength(text), name, text: async () => text }];
  await target.events.change[0]({ target });
  assert.equal(target.value, '', 'File input must reset after an import attempt');
}

module.exports = { context, read, click, upload, assert, root };
