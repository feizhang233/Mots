(() => {
  'use strict';

  // Small, side-effect-free helpers shared by validation and view modules.
  const escapeHTML = (value) =>
    String(value ?? '').replace(
      /[&<>"']/g,
      (character) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[character],
    );

  const isObject = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value));

  // Keep the established code-point FNV algorithm: imported word IDs use it.
  function hash(value) {
    let result = 2166136261;
    for (const character of value) {
      result ^= character.codePointAt(0);
      result = Math.imul(result, 16777619);
    }
    return (result >>> 0).toString(36);
  }

  // Kana anchors keep okurigana on the baseline; only consecutive kanji get ruby.
  function furiganaSegments(headword, reading) {
    const note = headword.match(/〔[^〕]*〕$/u)?.[0] || '';
    const base = note ? headword.slice(0, -note.length) : headword;
    const kana = (text) => text.replace(/[ァ-ヶ]/gu, (c) => String.fromCodePoint(c.codePointAt(0) - 0x60));
    const parts = base.match(/[\p{Script=Han}々]+|[^\p{Script=Han}々]+/gu) || [];
    const isKanji = (text) => /^[\p{Script=Han}々]+$/u.test(text);
    if (!parts.some(isKanji) || !reading || base.length > 180 || reading.length > 180)
      return [{ text: headword, reading: '' }];
    const pronunciation = kana(reading);
    const solutions = [];
    const deadEnds = new Set();
    function align(index, offset, segments) {
      if (solutions.length > 1) return;
      if (index === parts.length) {
        if (offset === pronunciation.length) solutions.push(segments);
        return;
      }
      const key = `${index}:${offset}`;
      if (deadEnds.has(key)) return;
      const before = solutions.length;
      const text = parts[index];
      if (!isKanji(text)) {
        const fixed = kana(text);
        if (pronunciation.startsWith(fixed, offset))
          align(index + 1, offset + fixed.length, [...segments, { text, reading: '' }]);
      } else {
        for (let end = offset + 1; end <= pronunciation.length; end++) {
          if (index === parts.length - 1 && end !== pronunciation.length) continue;
          if (index + 1 < parts.length && !pronunciation.startsWith(kana(parts[index + 1]), end)) continue;
          align(index + 1, end, [...segments, { text, reading: reading.slice(offset, end) }]);
        }
      }
      if (solutions.length === before) deadEnds.add(key);
    }
    align(0, 0, []);
    // Ambiguous imported spellings retain an honest whole-word reading.
    const result = solutions.length === 1 ? solutions[0] : [{ text: base, reading }];
    return note ? [...result, { text: note, reading: '' }] : result;
  }

  function formatTerm(word, language = word.language) {
    const term = String(word.term || word.french || '');
    if (language !== 'ja') return escapeHTML(term);
    const legacy = term.match(/^(.+?)[（(]([^（）()]+)[）)]$/u);
    const headword = String(word.headword || legacy?.[1] || term);
    const reading = String(word.reading || legacy?.[2] || '');
    return furiganaSegments(headword, reading)
      .map((part) => part.reading
        ? `<ruby class="japanese-ruby">${escapeHTML(part.text)}<rt>${escapeHTML(part.reading)}</rt></ruby>`
        : escapeHTML(part.text))
      .join('');
  }

  window.MotsCore = Object.freeze({ escapeHTML, isObject, hash, furiganaSegments, formatTerm });
})();
