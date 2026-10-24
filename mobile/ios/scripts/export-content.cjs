#!/usr/bin/env node
'use strict';
// Reuses the checked web content and conversion rules; never re-identifies words.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../../..');
const resources = path.resolve(__dirname, '../Mots/Resources');
const context = vm.createContext({ window: {} });
for (const file of ['database/runtime/data.js', 'web/src/js/core.js', 'web/src/js/languages.js', 'web/src/js/dictionaries.js', 'web/src/js/grammar.js', 'database/runtime/audio-manifest.js', 'database/runtime/extra-audio.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
}
const w = context.window;
const copied = new Set();
const audioFiles = [];
const check = process.argv.includes('--check');
const catalogOnly = check && process.argv.includes('--catalog-only');
const grammar = w.MotsGrammar.builtins();
const dictionaries = [...w.MotsDictionaries.builtins(), ...grammar].map(metadata => {
  const source = metadata.words || (metadata.id === 'fr' ? w.WORDS : w.MOTS_EXTRA_BANKS[metadata.id]);
  // Audio belongs to a dictionary identity, never merely to its language or word ID.
  // Grammar books have no recording manifest; nil audio uses the native device voice.
  const audio = metadata.id === 'fr' ? w.MOTS_AUDIO.words : w.MOTS_EXTRA_AUDIO[metadata.id]?.words;
  const words = source.map(word => {
    const meanings = { ...(word.meanings || {}) };
    if (word.chinese && !meanings['zh-Hans']) meanings['zh-Hans'] = word.chinese;
    if (meanings['zh-Hans'] && !meanings['zh-Hant']) meanings['zh-Hant'] = w.motsTraditional(meanings['zh-Hans']);
    if (meanings['zh-Hant'] && !meanings['zh-Hans']) meanings['zh-Hans'] = w.motsSimplified(meanings['zh-Hant']);
    let target = null;
    if (audio) {
      const relative = audio[word.id];
      assert(relative && /^(audio|extra-audio)\/[\w.-]+\.m4a$/.test(relative), `Missing or unsafe audio: ${metadata.id}/${word.id}`);
      target = `audio/${path.basename(relative)}`;
      assert(!copied.has(target), `Audio filename collision: ${target}`);
      copied.add(target);
      const sourceFile = path.join(root, 'database/runtime', relative);
      assert(fs.existsSync(sourceFile), `Missing source clip: ${relative}`);
      audioFiles.push({ sourceFile, target });
    } else assert.equal(metadata.kind, 'grammar', `Missing vocabulary audio manifest: ${metadata.id}`);
    const details = w.MotsDictionaries.normalizeDetails(word);
    return {
      id: String(word.id), term: word.term || word.french, meaning: meanings['zh-Hant'] || Object.values(meanings)[0], meanings,
      ...details, category: String(word.category), subcategory: String(word.subcategory),
      language: metadata.language, audio: target, part: word.part || null,
    };
  });
  assert.equal(new Set(words.map(word => word.id)).size, words.length, `${metadata.id} IDs are unique`);
  const used = new Set(words.map(word => word.subcategory));
  const categories = metadata.categories.map(category => ({ ...category, subcategories: category.subcategories.filter(sub => used.has(sub.id)) })).filter(category => category.subcategories.length);
  return { ...metadata, categories, words };
});
const japanese = JSON.parse(fs.readFileSync(path.join(root, 'database/japanese/vocabulary.json'), 'utf8'));
assert.deepEqual(JSON.parse(JSON.stringify(w.MOTS_EXTRA_BANKS.ja)), japanese.words, 'Japanese runtime must match its source dictionary');
assert.deepEqual(Array.from(dictionaries, dictionary => dictionary.words.length), [3846, 12, japanese.entryCount, ...grammar.map(dictionary => dictionary.words.length)]);
assert.equal(new Set(dictionaries.map(dictionary => dictionary.id)).size, dictionaries.length, 'Dictionary identities are unique');
for (const source of grammar) {
  const generated = dictionaries.find(dictionary => dictionary.id === source.id);
  assert.equal(generated.kind, 'grammar');
  assert(['standard', 'thematic'].includes(source.grammarMode || 'standard'), `Invalid grammar mode: ${source.id}`);
  assert.equal(generated.grammarMode || 'standard', source.grammarMode || 'standard', `Grammar mode changed: ${source.id}`);
  assert.deepEqual(Array.from(generated.words, word => word.id), Array.from(source.words, word => word.id), `Grammar IDs changed: ${source.id}`);
  for (const word of generated.words) {
    const original = source.words.find(entry => entry.id === word.id);
    assert.deepEqual(word.examples, original.examples, `Grammar examples changed: ${source.id}/${word.id}`);
    assert.equal(word.pattern, original.pattern);
    assert.equal(word.explanation, original.explanation);
    assert.equal(word.audio, null, 'Grammar entries must use device speech without a dictionary-specific recording');
  }
}
const catalogText = JSON.stringify(dictionaries, null, 2) + '\n';
const catalogPath = path.join(resources, 'catalog.json');
const audioDirectory = path.join(resources, 'audio');
const staleClips = fs.existsSync(audioDirectory) ? fs.readdirSync(audioDirectory).filter(name => name.endsWith('.m4a') && !copied.has(`audio/${name}`)) : [];
if (check) {
  assert.equal(fs.readFileSync(catalogPath, 'utf8'), catalogText, 'Generated catalog differs from current web source; run make ios-assets.');
  if (!catalogOnly) assert.equal(staleClips.length, 0, 'Stale generated audio; run make ios-assets.');
  const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  for (const { sourceFile, target } of catalogOnly ? [] : audioFiles) {
    assert.equal(hash(path.join(resources, target)), hash(sourceFile), `Bundled clip differs: ${target}`);
  }
} else {
  fs.mkdirSync(audioDirectory, { recursive: true });
  for (const { sourceFile, target } of audioFiles) fs.copyFileSync(sourceFile, path.join(resources, target));
  // Only this generator's dedicated audio directory is cleaned; source audio is read-only.
  for (const name of staleClips) fs.unlinkSync(path.join(audioDirectory, name));
  fs.writeFileSync(catalogPath, catalogText);
}
console.log(`${check ? 'Verified' : 'Exported'} ${dictionaries.map(d => `${d.id}: ${d.words.length}`).join(', ')}; ${copied.size} bundled word clips.`);
