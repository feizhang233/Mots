(() => {
  'use strict';
  // Dictionary metadata and import validation. Persistence and progress belong to app.js.
  const LANGUAGES = new Set(['fr', 'de', 'ja']);
  const MEANINGS = new Set(['zh-Hant', 'zh-Hans', 'en', 'fr', 'de', 'ja']);
  const RESERVED = new Set(['__proto__', 'constructor', 'prototype', 'all']);
  const LIMITS = Object.freeze({
    dictionaries: 20,
    words: 5000,
    categories: 100,
    subcategories: 300,
    title: 80,
    term: 180,
    meaning: 1600,
    example: 2000,
    examples: 20,
    pattern: 2000,
    explanation: 6000,
  });
  const { isObject: object, hash } = window.MotsCore;
  const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
  const tc = (text) => (window.motsTraditional ? window.motsTraditional(text) : text);
  const label = (value, language) => (language === 'ja' ? value : tc(value));
  const defaultSubcode = (category) =>
    category.length <= 61 ? `${category}.01` : `group-${hash(category)}.01`;

  function checkObject(value, label) {
    if (!object(value)) throw new Error(`${label}格式不正確。`);
    if (Object.keys(value).some((key) => ['__proto__', 'constructor', 'prototype'].includes(key)))
      throw new Error(`${label}包含不支援的欄位。`);
    return value;
  }

  function text(value, label, maximum, required = true) {
    if (typeof value !== 'string') {
      if (!required && (value === undefined || value === null)) return '';
      throw new Error(`${label}須為文字。`);
    }
    const result = value.trim();
    if (required && !result) throw new Error(`${label}不可留白。`);
    if (result.length > maximum)
      throw new Error(`${label}最多 ${maximum.toLocaleString('zh-Hant')} 字。`);
    return result;
  }

  function code(value, label) {
    if (typeof value !== 'string' && !(typeof value === 'number' && Number.isSafeInteger(value)))
      throw new Error(`${label}須為文字或整數代碼。`);
    const result = String(value).trim();
    if (!result || result.length > 64 || !/^[A-Za-z0-9_.-]+$/.test(result) || RESERVED.has(result))
      throw new Error(`${label}代碼不正確。`);
    return result;
  }

  // Keep rich entries identical across dictionary, extension and backup imports.
  function normalizeDetails(entry, index = 0, language = '') {
    checkObject(entry, `第 ${index + 1} 詞`);
    const prefix = `第 ${index + 1} 詞`;
    const legacy = text(entry.example, `${prefix}的例句`, LIMITS.example, false);
    const supplied = own(entry, 'examples') ? entry.examples : [];
    if (!Array.isArray(supplied) || supplied.length > LIMITS.examples)
      throw new Error(`${prefix}的 examples 須為陣列，最多 ${LIMITS.examples} 個例句。`);
    const examples = new Map();
    if (legacy) examples.set(legacy, { text: legacy, translations: {} });
    supplied.forEach((value, exampleIndex) => {
      const name = `${prefix}的第 ${exampleIndex + 1} 個例句`;
      const source = typeof value === 'string' ? { text: value } : checkObject(value, name);
      const sentence = text(source.text, name, LIMITS.example);
      const translations = {};
      if (own(source, 'translations')) {
        checkObject(source.translations, `${name}翻譯`);
        for (const [language, value] of Object.entries(source.translations)) {
          if (!MEANINGS.has(language)) continue;
          const translated = text(value, `${name}翻譯`, LIMITS.example, false);
          if (translated) translations[language] = translated;
        }
      }
      const previous = examples.get(sentence);
      examples.set(sentence, {
        text: sentence,
        translations: { ...translations, ...previous?.translations },
      });
    });
    if (examples.size > LIMITS.examples)
      throw new Error(`${prefix}最多 ${LIMITS.examples} 個不同例句（包含 example 欄位）。`);
    const result = [...examples.values()];
    return {
      example: legacy || result[0]?.text || '',
      examples: result,
      pattern: text(entry.pattern, `${prefix}的接續方式`, LIMITS.pattern, false),
      explanation: label(text(entry.explanation, `${prefix}的解釋`, LIMITS.explanation, false), language),
    };
  }

  function isDictionaryID(id) {
    return typeof id === 'string' && /^dict-[a-z0-9][a-z0-9-]{0,79}$/.test(id);
  }

  function createID() {
    if (window.crypto?.randomUUID) return `dict-${window.crypto.randomUUID()}`;
    return `dict-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function sourceCategories() {
    return (Array.isArray(window.CATEGORIES) ? window.CATEGORIES : []).map((category) => ({
      id: String(category.id),
      name: tc(String(category.name)),
      subcategories: (category.subcategories || []).map((sub) => ({
        id: String(sub.id),
        name: tc(String(sub.name)),
      })),
    }));
  }

  function builtins() {
    return [
      {
        id: 'fr',
        title: '法語基礎詞彙分類學習手冊',
        language: 'fr',
        categories: sourceCategories(),
      },
      {
        id: 'de',
        title: '德語入門示例',
        language: 'de',
        categories: sourceCategories(),
      },
      {
        id: 'ja',
        title: '日語詞彙總表',
        language: 'ja',
        categories: window.MOTS_JAPANESE_CATEGORIES,
      },
    ];
  }

  function parseCategories(value, language) {
    if (!Array.isArray(value) || !value.length || value.length > LIMITS.categories)
      throw new Error('分類須為非空陣列，最多 100 個一級單元。');
    const parents = new Set(),
      children = new Set();
    const result = value.map((entry, index) => {
      checkObject(entry, `第 ${index + 1} 個分類`);
      const id = code(entry.id, '一級單元');
      if (parents.has(id)) throw new Error('一級單元代碼重複。');
      parents.add(id);
      const name = label(
        text(own(entry, 'name') ? entry.name : `單元 ${id}`, '一級單元名稱', LIMITS.title),
        language,
      );
      const supplied = own(entry, 'subcategories')
        ? entry.subcategories
        : [{ id: defaultSubcode(id), name: '一般詞彙' }];
      if (!Array.isArray(supplied) || !supplied.length)
        throw new Error('每個一級單元至少須包含一個二級單元。');
      const subcategories = supplied.map((sub) => {
        checkObject(sub, '二級單元');
        const subID = code(sub.id, '二級單元');
        if (children.has(subID)) throw new Error('二級單元代碼重複。');
        children.add(subID);
        if (children.size > LIMITS.subcategories) throw new Error('二級單元總數最多 300 個。');
        return {
          id: subID,
          name: label(
            text(own(sub, 'name') ? sub.name : `子單元 ${subID}`, '二級單元名稱', LIMITS.title),
            language,
          ),
        };
      });
      return { id, name, subcategories };
    });
    return result;
  }

  function validateImport(data, options = {}) {
    checkObject(options, '匯入選項');
    const source = Array.isArray(data) ? { words: data } : checkObject(data, '辭典');
    const language = own(source, 'language') ? source.language : options.language;
    if (!LANGUAGES.has(language))
      throw new Error('辭典語言須為 fr（法語）、de（德語）或 ja（日語）。');
    if (own(options, 'kind') && !['vocabulary', 'grammar'].includes(options.kind))
      throw new Error('背誦類型須為 vocabulary（詞彙）或 grammar（語法）。');
    const kind = own(source, 'kind') ? source.kind : options.kind || 'vocabulary';
    if (!['vocabulary', 'grammar'].includes(kind))
      throw new Error('背誦類型須為 vocabulary（詞彙）或 grammar（語法）。');
    if (own(options, 'grammarMode') && !['standard', 'thematic'].includes(options.grammarMode))
      throw new Error('語法書類型須為 standard（普通）或 thematic（主題）。');
    const grammarMode = own(source, 'grammarMode')
      ? source.grammarMode
      : kind === 'grammar' && options.kind === 'grammar'
        ? options.grammarMode || 'standard'
        : 'standard';
    if (!['standard', 'thematic'].includes(grammarMode))
      throw new Error('語法書類型須為 standard（普通）或 thematic（主題）。');
    if (kind !== 'grammar' && grammarMode !== 'standard')
      throw new Error('主題語法書須使用 grammar 語法類型。');
    const requestedID = own(options, 'id')
      ? options.id
      : own(source, 'id')
        ? source.id
        : createID();
    if (!isDictionaryID(requestedID))
      throw new Error('辭典 ID 格式不正確，且不可使用內建辭典 ID。');
    const title = text(
      own(source, 'title')
        ? source.title
        : own(source, 'name')
          ? source.name
          : options.title || '匯入辭典',
      '辭典名稱',
      LIMITS.title,
    );
    if (!Array.isArray(source.words) || !source.words.length || source.words.length > LIMITS.words)
      throw new Error('辭典須包含 1–5,000 個單字。');
    const meaningLanguage = options.meaningLanguage || 'zh-Hant';
    if (!MEANINGS.has(meaningLanguage)) throw new Error('釋義語言不受支援。');
    const declared = own(source, 'categories');
    const catalog = declared ? parseCategories(source.categories, language) : sourceCategories();
    const parentMap = new Map(catalog.map((category) => [category.id, category]));
    const childMap = new Map(
      catalog.flatMap((category) =>
        category.subcategories.map((sub) => [sub.id, { ...sub, parent: category.id }]),
      ),
    );
    const used = new Map(),
      childOwners = new Map(),
      wordIDs = new Set();

    const words = source.words.map((entry, index) => {
      checkObject(entry, `第 ${index + 1} 詞`);
      const term = text(
        entry.term || entry.word || (language === 'fr' ? entry.french : ''),
        `第 ${index + 1} 詞`,
        LIMITS.term,
      );
      let id;
      if (own(entry, 'id') && entry.id !== '' && entry.id !== null) {
        if (
          typeof entry.id !== 'string' &&
          !(typeof entry.id === 'number' && Number.isSafeInteger(entry.id))
        )
          throw new Error(`第 ${index + 1} 詞的 ID 格式不正確。`);
        id = String(entry.id).trim();
        if (!id || id.length > 110 || !/^[\p{L}\p{N}_.-]+$/u.test(id) || RESERVED.has(id))
          throw new Error(`第 ${index + 1} 詞的 ID 格式不正確。`);
      } else id = `word-${index + 1}-${hash(term)}`;
      if (wordIDs.has(id)) throw new Error(`第 ${index + 1} 詞的 ID 與其他詞條重複。`);
      wordIDs.add(id);
      const meanings = {};
      if (own(entry, 'meanings')) {
        checkObject(entry.meanings, `第 ${index + 1} 詞的釋義`);
        for (const [key, value] of Object.entries(entry.meanings)) {
          if (!MEANINGS.has(key)) continue;
          const meaning = text(value, `第 ${index + 1} 詞的釋義`, LIMITS.meaning, false);
          if (meaning) meanings[key] = meaning;
        }
      }
      if (own(entry, 'chinese')) {
        const chinese = text(entry.chinese, `第 ${index + 1} 詞的中文釋義`, LIMITS.meaning, false);
        if (chinese && !meanings['zh-Hans']) meanings['zh-Hans'] = chinese;
      }
      if (own(entry, 'meaning')) {
        const meaning = text(entry.meaning, `第 ${index + 1} 詞的釋義`, LIMITS.meaning, false);
        if (meaning && !meanings[meaningLanguage]) meanings[meaningLanguage] = meaning;
      }
      if (!Object.keys(meanings).length) throw new Error(`第 ${index + 1} 詞缺少釋義。`);
      const details = normalizeDetails(entry, index, language);
      const explicitCategory =
        own(entry, 'category') && entry.category !== '' && entry.category !== null;
      const explicitSub =
        own(entry, 'subcategory') && entry.subcategory !== '' && entry.subcategory !== null;
      const suppliedCategory = explicitCategory ? code(entry.category, '一級單元') : '';
      const suppliedSub = explicitSub ? code(entry.subcategory, '二級單元') : '';
      let category, subcategory;
      if (declared) {
        category = suppliedCategory || childMap.get(suppliedSub)?.parent || catalog[0].id;
        const parent = parentMap.get(category);
        if (!parent) throw new Error(`第 ${index + 1} 詞的一級單元未在 categories 中定義。`);
        subcategory = suppliedSub || parent.subcategories[0].id;
        if (childMap.get(subcategory)?.parent !== category)
          throw new Error(`第 ${index + 1} 詞的二級單元未屬於指定一級單元。`);
      } else {
        category =
          suppliedCategory ||
          childMap.get(suppliedSub)?.parent ||
          (suppliedSub.includes('.') ? suppliedSub.split('.')[0] : '1');
        const implicit = !explicitCategory && !explicitSub;
        subcategory =
          suppliedSub ||
          (implicit
            ? '1.01'
            : parentMap.get(category)?.subcategories[0]?.id || defaultSubcode(category));
        if (
          suppliedCategory &&
          childMap.has(subcategory) &&
          childMap.get(subcategory).parent !== category
        )
          throw new Error(`第 ${index + 1} 詞的一級與二級單元不一致。`);
      }
      if (childOwners.has(subcategory) && childOwners.get(subcategory) !== category)
        throw new Error('同一二級單元不可同時屬於不同一級單元。');
      childOwners.set(subcategory, category);
      const implicit = !explicitCategory && !explicitSub && !declared;
      const knownParent = parentMap.get(category),
        knownChild = childMap.get(subcategory);
      const inheritParent =
        declared ||
        (!implicit &&
          (Boolean(suppliedCategory && knownParent) || knownChild?.parent === category));
      const parentName =
        inheritParent && knownParent
          ? knownParent.name
          : implicit || (category === '1' && !suppliedCategory)
            ? '一般詞彙'
            : `單元 ${category}`;
      if (!used.has(category))
        used.set(category, { id: category, name: parentName, subcategories: [] });
      const parent = used.get(category);
      if (inheritParent && knownParent) parent.name = knownParent.name;
      if (!parent.subcategories.some((sub) => sub.id === subcategory))
        parent.subcategories.push({
          id: subcategory,
          name: implicit
            ? '一般詞彙'
            : knownChild?.parent === category
              ? knownChild.name
              : subcategory === defaultSubcode(category)
                ? '一般詞彙'
                : `子單元 ${subcategory}`,
        });
      if (used.size > LIMITS.categories || childOwners.size > LIMITS.subcategories)
        throw new Error('分類最多 100 個一級、300 個二級單元。');
      return { id, category, subcategory, term, meanings, ...details };
    });
    return {
      id: requestedID,
      title: label(title, language),
      language,
      kind,
      grammarMode,
      categories: [...used.values()],
      words,
    };
  }

  function validateLibrary(value) {
    if (!Array.isArray(value) || value.length > LIMITS.dictionaries)
      throw new Error('最多可匯入 20 部辭典。');
    const seen = new Set();
    return value.map((entry) => {
      checkObject(entry, '辭典');
      if (!own(entry, 'id')) throw new Error('備份辭典缺少 ID。');
      const dictionary = validateImport(entry, { id: entry.id });
      if (seen.has(dictionary.id)) throw new Error('辭典 ID 重複。');
      seen.add(dictionary.id);
      return dictionary;
    });
  }

  window.MotsDictionaries = Object.freeze({
    builtins,
    validateImport,
    validateLibrary,
    normalizeDetails,
    isDictionaryID,
    createID,
    limits: LIMITS,
  });
})();
