(() => {
  'use strict';
  // Extensions and old backups intentionally have different normalization rules
  // from a new dictionary. Keep this validator separate from dictionaries.js.
  const { isObject, hash } = window.MotsCore;

  function validate(
    entries,
    {
      language: lang,
      meaningLanguage,
      meaningCodes,
      categories: categoryList,
      preserveIDs = false,
      prefix = lang,
    },
  ) {
    if (!Array.isArray(entries) || entries.length > 5000)
      throw new Error('詞庫須為單字陣列，最多 5,000 詞。');
    const seen = new Set();
    return entries.map((entry, index) => {
      if (!isObject(entry)) throw new Error(`第 ${index + 1} 詞的格式不正確。`);
      const term = String(
        entry.term || entry.word || (lang === 'fr' ? entry.french : '') || '',
      ).trim();
      if (!term || term.length > 180)
        throw new Error(`第 ${index + 1} 詞須包含 180 字以內的 term 單字欄位。`);
      const meanings = {};
      if (isObject(entry.meanings))
        for (const [code, text] of Object.entries(entry.meanings))
          if (meaningCodes.has(code) && typeof text === 'string' && text.trim()) {
            if (text.length > 1600) throw new Error(`第 ${index + 1} 詞的釋義過長。`);
            meanings[code] = text.trim();
          }
      if (typeof entry.chinese === 'string' && entry.chinese.trim()) {
        if (entry.chinese.length > 1600) throw new Error(`第 ${index + 1} 詞的釋義過長。`);
        meanings['zh-Hans'] = entry.chinese.trim();
      }
      if (typeof entry.meaning === 'string' && entry.meaning.trim()) {
        if (entry.meaning.length > 1600) throw new Error(`第 ${index + 1} 詞的釋義過長。`);
        meanings[meaningLanguage] = entry.meaning.trim();
      }
      if (!Object.keys(meanings).length)
        throw new Error(`第 ${index + 1} 詞缺少 meanings 釋義。請參照下載的詞庫範本。`);
      const example = typeof entry.example === 'string' ? entry.example : '';
      if (example.length > 2000) throw new Error(`第 ${index + 1} 詞的例句過長。`);
      const category = categoryList.some((c) => c.id === String(entry.category))
        ? String(entry.category)
        : categoryList[0].id;
      const group = categoryList.find((c) => c.id === category);
      const subcategory = group.subcategories.some((s) => s.id === entry.subcategory)
        ? entry.subcategory
        : group.subcategories[0].id;
      const rawID = String(entry.id || hash(term)).replace(/[^\p{L}\p{N}_.-]/gu, '-');
      const id = (
        preserveIDs && rawID.startsWith(`custom-${prefix}-`) ? rawID : `custom-${prefix}-${rawID}`
      ).slice(0, 110);
      if (seen.has(id)) throw new Error(`第 ${index + 1} 詞與其他詞條的 ID 重複。`);
      seen.add(id);
      return { id, category, subcategory, term, meanings, example };
    });
  }

  window.MotsEntries = Object.freeze({ validate });
})();
