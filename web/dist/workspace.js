(() => {
  'use strict';

  const { escapeHTML: escape, formatTerm } = window.MotsCore;
  const count = (value) =>
    Number.isFinite(Number(value)) ? Math.max(0, Math.floor(Number(value))) : 0;
  const number = (value) => new Intl.NumberFormat('zh-Hant').format(count(value));
  const icons = {
    search:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
    book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5C9 3 5 3 2 4v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Zm0 0v15"/></svg>',
    shuffle:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h3c5 0 7 12 12 12h3m-4-4 4 4-4 4M3 18h3c2 0 4-3 6-6s4-6 6-6h3m-4-4 4 4-4 4"/></svg>',
    list: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h12M9 12h12M9 18h12M3 6h1m-1 6h1m-1 6h1"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
  };

  function home(model = {}) {
    const grammar = model.studyKind === 'grammar';
    const unit = grammar ? '項' : '詞';
    const total = count(model.total);
    const reviewable = count(model.reviewable);
    const dictionaries = Array.isArray(model.dictionaries) ? model.dictionaries : [];
    const stats = [
      { label: '已掌握', value: model.mastered, className: 'mastered' },
      { label: '有印象', value: model.learning, className: 'learning' },
      { label: '不熟悉', value: model.unfamiliar, className: 'unfamiliar' },
      { label: '未學習', value: model.unseen, className: 'unseen' },
    ];

    return `<div class="workspace-home">
      <div class="home-heading"><h2>學習首頁</h2><span>${escape(model.languageLabel)} · ${number(total)} ${unit}</span></div>
      <section class="home-current" aria-labelledby="home-dictionary-title">
        <div class="home-current-heading"><span class="home-book-symbol" aria-hidden="true">${icons.book}</span><div><p class="home-overline">目前書籍</p><h3 id="home-dictionary-title">${escape(model.title)}</h3></div></div>
        <form id="home-search-form" class="home-search-form" novalidate>
          <div class="home-searchbox">${icons.search}<label for="home-search" class="visually-hidden">搜尋目前書籍</label><input id="home-search" type="search" aria-label="搜尋目前書籍" placeholder="搜尋${grammar ? '語法' : '單字'}、釋義或例句" autocomplete="off"><button id="home-clear-search" class="icon-button" type="button" aria-label="清除搜尋" hidden>${icons.close}</button></div>
          <button class="button button-primary" type="submit">搜尋</button>
        </form>
        <div class="home-primary-actions">
          <button class="button button-tonal" type="button" data-action="start-review" aria-describedby="home-review-help" ${reviewable ? '' : 'disabled'}>${icons.shuffle}隨機複習${reviewable ? `<span class="home-action-count">${number(Math.min(20, reviewable))} ${unit}</span>` : ''}</button>
          <button class="button button-outline" type="button" data-action="open-dictionary">${icons.book}瀏覽全部</button>
          <button class="button button-outline" type="button" data-action="open-study">${icons.list}${grammar && model.grammarMode !== 'thematic' ? '語法背誦' : '按主題學習'}</button>
        </div>
        <p id="home-review-help" class="home-help">${reviewable ? `每輪最多 20 ${unit}，優先複習不熟悉與有印象的${grammar ? '語法' : '詞彙'}，不足時補入未學習；不含已掌握。` : '目前沒有尚未掌握的內容，可瀏覽全部學習條目。'}</p>
      </section>
      <section class="home-progress" aria-labelledby="home-progress-title">
        <h3 id="home-progress-title">熟悉程度</h3>
        <dl class="home-stats">${stats.map((stat) => `<div class="home-stat ${stat.className}"><dt><span class="home-stat-dot" aria-hidden="true"></span>${stat.label}</dt><dd>${number(stat.value)}</dd></div>`).join('')}</dl>
      </section>
      <section class="home-library" aria-labelledby="home-library-title">
        <div class="home-library-heading"><h3 id="home-library-title">我的書籍</h3><button class="text-button" type="button" data-action="import-dictionary">${icons.plus}匯入書籍</button></div>
        <div class="dictionary-grid">${dictionaries.map((dictionary) => `<button class="dictionary-card ${dictionary.active ? 'is-active' : ''}" type="button" data-dictionary="${escape(dictionary.id)}" aria-pressed="${Boolean(dictionary.active)}"><span class="dictionary-card-icon" aria-hidden="true">${icons.book}</span><span class="dictionary-card-copy"><strong>${escape(dictionary.title)}</strong><span>${escape(dictionary.languageLabel)} · ${number(dictionary.total)} ${dictionary.kind === 'grammar' ? '項' : '詞'}</span></span>${dictionary.active ? '<span class="dictionary-active">使用中</span>' : ''}</button>`).join('')}</div>
        ${dictionaries.length ? '' : '<p class="home-help">尚無可用內容，請先匯入書籍。</p>'}
      </section>
    </div>`;
  }

  function reviewSummary(model = {}) {
    const grammar = model.studyKind === 'grammar';
    const unit = grammar ? '項' : '詞';
    const total = count(model.total);
    const rated = Math.min(total, count(model.rated));
    const allRated = total > 0 && rated === total;
    return `<section class="review-summary" aria-labelledby="review-summary-title">
      <span class="review-summary-symbol" aria-hidden="true">${icons.check}</span>
      <h2 id="review-summary-title">${allRated ? '本輪複習完成' : '本輪已結束'}</h2>
      <p class="review-summary-count">已標記 <strong>${number(rated)}</strong> / ${number(total)} ${unit}</p>
      <dl class="review-summary-stats"><div><dt>已掌握</dt><dd>${number(model.mastered)}</dd></div><div><dt>有印象</dt><dd>${number(model.learning)}</dd></div><div><dt>不熟悉</dt><dd>${number(model.unfamiliar)}</dd></div></dl>
      <p class="home-help">可換一組繼續複習，或瀏覽全部學習條目。</p>
      <div class="review-summary-actions"><button class="button button-primary" type="button" data-action="start-review">${icons.shuffle}換一組</button><button class="button button-outline" type="button" data-action="open-dictionary">瀏覽全部</button></div>
    </section>`;
  }

  // Render from the current study model; navigation and mutations stay in app.js.
  function createStudyView({
    getModel,
    isGrammarGroupOpen = () => false,
    icons,
    labels,
    languageOf,
    meaning,
    levelOf,
    subcategoryOf,
    categoryLabel,
    groupWords,
  }) {
    const esc = escape;
    const speaker = (word) =>
      `<button class="icon-button sound-button" data-speak="${esc(word.id)}" aria-label="朗讀 ${esc(word.term)}" aria-pressed="false" title="播放／停止讀音">${icons.sound}</button>`;
    function ratingDots(word) {
      const level = levelOf(word.id);
      return `<div class="rating-dots" role="group" aria-label="${esc(word.term)}的熟悉程度，目前${labels[level]}">${[3, 2, 1].map((l) => `<button class="rating-dot-button" data-rate="${l}" data-word="${esc(word.id)}" data-level="${l}" data-rating-variant="dot" aria-label="${esc(word.term)}：${labels[l]}" aria-pressed="${level === l}" title="${labels[l]}${level === l ? '；再次點選可取消' : ''}"><span class="status-circle" aria-hidden="true">${level === l ? '✓' : ''}</span></button>`).join('')}</div>`;
    }
    const isGrammar = () => {
      const model = getModel();
      return (model.studyKind || model.state.studyKind) === 'grammar';
    };
    const itemLabel = () => (isGrammar() ? '語法' : '單字');
    const itemUnit = () => (isGrammar() ? '項' : '詞');
    function examplesOf(word) {
      const supplied = Array.isArray(word.examples) ? word.examples : [];
      const result = [],
        seen = new Set();
      for (const value of [word.example, ...supplied]) {
        const entry = typeof value === 'string' ? { text: value } : value;
        if (!entry || typeof entry.text !== 'string' || !entry.text.trim()) continue;
        const text = entry.text.trim();
        if (seen.has(text)) {
          const previous = result.find((example) => example.text === text);
          if (entry.translations) previous.translations = entry.translations;
          continue;
        }
        seen.add(text);
        result.push({ ...entry, text });
      }
      return result;
    }
    function exampleHTML(example, variant = 'card') {
      const { state } = getModel();
      return `<div class="entry-example ${variant}-example"><p class="example-sentence" lang="${state.language}">${esc(example.text)}</p></div>`;
    }
    const detailButton = (word) =>
      `<button class="text-button entry-detail-button" type="button" data-detail="${esc(word.id)}" aria-label="查看「${esc(word.term)}」的詳情">詳情${icons.right}</button>`;
    function renderSmallCard(w) {
      const { state, settings } = getModel();
      const m = meaning(w),
        examples = examplesOf(w);
      return `<article class="word-row study-entry" role="listitem" data-row-word="${esc(w.id)}"><div class="entry-primary"><div class="list-term">${speaker(w)}<span class="list-word" lang="${state.language}">${formatTerm(w, state.language)}</span></div><div class="list-meaning ${m.missing ? 'missing-meaning' : ''}" lang="${m.missing ? 'zh-Hant' : settings.meaningLanguage}">${esc(m.text)}</div><div class="list-delete"><button class="icon-button delete-word" data-delete="${esc(w.id)}" type="button" title="刪除「${esc(w.term)}」（可恢復）" aria-label="刪除「${esc(w.term)}」（可恢復）"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7m4-7v7" /></svg></button></div></div><div class="entry-secondary"><div class="list-example">${examples.length ? exampleHTML(examples[0], 'list') : '<span class="entry-empty-copy">尚未收錄例句</span>'}</div><div class="entry-secondary-actions">${detailButton(w)}<div class="list-status">${ratingDots(w)}</div></div></div></article>`;
    }
    function renderList() {
      const { state, settings, deck, grammarGrouping } = getModel();
      const start = (state.page - 1) * settings.pageSize,
        pages = Math.ceil(deck.length / settings.pageSize),
        unit = itemUnit(),
        pageWords = deck.slice(start, start + settings.pageSize);
      let content;
      if (isGrammar() && grammarGrouping) {
        const groups = new Map();
        const totals = new Map();
        for (const word of deck)
          totals.set(word.subcategory, (totals.get(word.subcategory) || 0) + 1);
        for (const word of pageWords) {
          if (!groups.has(word.subcategory)) groups.set(word.subcategory, []);
          groups.get(word.subcategory).push(word);
        }
        content = `<div class="grammar-groups" aria-label="語法歸納">${[...groups]
          .map(([id, entries]) => {
            const title = categoryLabel(subcategoryOf(id)?.name || id);
            const total = totals.get(id);
            const countLabel =
              entries.length === total
                ? `${total} 項語法`
                : `本頁 ${entries.length} / ${total} 項語法`;
            return `<details class="grammar-group" data-grammar-group="${esc(id)}" ${isGrammarGroupOpen(id) ? 'open' : ''}><summary class="grammar-group-heading"><span class="grammar-group-copy"><span class="grammar-group-code">${esc(id)}</span><strong>${esc(title)}</strong><span class="grammar-group-count">${countLabel}</span></span><span class="grammar-group-chevron" aria-hidden="true">${icons.chevron}</span></summary><div class="word-table study-entry-list grammar-small-cards" role="list" aria-label="${esc(title)}">${entries.map(renderSmallCard).join('')}</div></details>`;
          })
          .join('')}</div>`;
      } else {
        content = `<div class="word-table study-entry-list" role="list" aria-label="${languageOf(state.language).name}${itemLabel()}列表">${pageWords.map(renderSmallCard).join('')}</div>`;
      }
      return `<div class="rating-legend" aria-label="熟悉程度圖例"><span><i class="legend-status green" aria-hidden="true"></i>已掌握</span><span><i class="legend-status orange" aria-hidden="true"></i>有印象</span><span><i class="legend-status red" aria-hidden="true"></i>不熟悉</span></div>${content}<div class="pagination"><span>第 ${start + 1}–${Math.min(start + settings.pageSize, deck.length)} ${unit}，共 ${deck.length} ${unit} · 每頁 ${settings.pageSize} ${unit}</span><div class="pagination-actions"><button id="previous-page" class="icon-button" aria-label="上一頁" ${state.page === 1 ? 'disabled' : ''}>${icons.left}</button><span>${state.page} / ${pages}</span><button id="next-page" class="icon-button" aria-label="下一頁" ${state.page === pages ? 'disabled' : ''}>${icons.right}</button></div></div>`;
    }
    function progressPanel() {
      const { state, deck } = getModel();
      const group = groupWords(),
        counts = [0, 0, 0, 0];
      group.forEach((w) => counts[levelOf(w.id)]++);
      return `<aside class="study-aside" aria-label="學習進度"><section class="progress-panel"><h3 class="aside-title">熟悉程度</h3><div class="progress-number">${counts[3]}<span>/ ${group.length}</span></div><p class="progress-description">個${itemLabel()}已掌握</p><div class="progress-track" aria-label="已掌握 ${counts[3]} ${itemUnit()}"><span class="mastered" style="width:${group.length ? (counts[3] / group.length) * 100 : 0}%"></span><span class="learning" style="width:${group.length ? (counts[2] / group.length) * 100 : 0}%"></span></div>${[3, 2, 1, 0].map((l) => `<div class="progress-legend"><span class="legend-label"><span class="legend-dot ${['', 'difficult', 'learning', 'mastered'][l]}"></span>${labels[l]}</span><strong>${counts[l]}</strong></div>`).join('')}</section>${cardPosition(state, deck)}</aside>`;
    }
    function cardPosition(state, deck) {
      const position = state.index + 1;
      return `<div class="card-position-control"><div class="card-position-heading"><label for="card-position">學習進度</label><output id="card-position-value" for="card-position">${position} / ${deck.length}</output></div><input id="card-position" type="range" min="1" max="${deck.length}" step="1" value="${position}" aria-valuetext="第 ${position} ${itemUnit()}，共 ${deck.length} ${itemUnit()}" ${deck.length === 1 ? 'disabled' : ''}></div>`;
    }
    function renderCard() {
      const { state, settings, deck } = getModel();
      const w = deck[state.index],
        level = levelOf(w.id),
        m = meaning(w),
        examples = examplesOf(w).slice(0, 2);
      return `<div class="study-grid study-card-grid"><div><article class="flashcard study-flashcard" aria-label="${itemLabel()}卡片"><div class="flashcard-top"><span class="word-category">${esc(w.subcategory)} · ${esc(categoryLabel(subcategoryOf(w.subcategory)?.name || ''))}</span><span class="word-position">${state.index + 1} / ${deck.length}</span></div><div class="word-face"><div class="word-main">${speaker(w)}<h3 class="french-word${w.term.length > 24 ? ' long-term' : ''}" lang="${state.language}">${formatTerm(w, state.language)}</h3></div></div><div class="answer-area" id="answer-area">${state.revealed ? `<p class="chinese-meaning ${m.missing ? 'missing-meaning' : ''}" lang="${m.missing ? 'zh-Hant' : settings.meaningLanguage}">${esc(m.text)}</p>${w.pattern ? `<p class="card-pattern" lang="${state.language}">${esc(w.pattern)}</p>` : ''}<div class="card-examples">${examples.length ? examples.map((example) => exampleHTML(example)).join('') : '<p class="entry-empty-copy">尚未收錄例句</p>'}</div><div class="card-answer-actions"><button id="reveal-button" class="text-button hide-answer" aria-expanded="true" aria-controls="answer-area">隱藏釋義 ↑</button>${detailButton(w)}</div>` : `<p class="answer-placeholder">${isGrammar() ? '先回想這個語法的意思與接續方式' : '先回想這個單字的意思'}</p><button id="reveal-button" class="button button-tonal" aria-expanded="false" aria-controls="answer-area">${icons.eye}顯示釋義與例句</button>${detailButton(w)}`}</div><div class="rating-section"><div class="rating-heading"><span>熟悉程度</span><span class="current-rating">${labels[level]}</span></div><div class="rating-buttons">${[1, 2, 3].map((l) => `<button class="rating-button" data-rate="${l}" data-word="${esc(w.id)}" data-level="${l}" aria-pressed="${level === l}"><span class="rating-dot" aria-hidden="true"></span>${labels[l]}${level === l ? ' ✓' : ''}</button>`).join('')}</div></div></article><div class="card-navigation"><button id="previous-word" class="button button-outline" ${state.index === 0 ? 'disabled' : ''}>${icons.left}上一個</button><button id="next-word" class="button button-primary">${state.index === deck.length - 1 ? '完成這組' : '下一個'}${icons.right}</button></div>${state.completed ? `<div class="session-end" role="status"><span>已看完這組 ${deck.length} 個${itemLabel()}。</span><button id="restart-session" class="text-button">再學一次 ↻</button></div>` : ''}</div>${progressPanel()}</div>`;
    }
    function renderDetail(word) {
      const { state, settings } = getModel();
      const m = meaning(word),
        examples = examplesOf(word);
      return `<div class="entry-detail-header"><p class="entry-detail-category">${isGrammar() ? '語法背誦' : '詞彙背誦'} · ${esc(categoryLabel(subcategoryOf(word.subcategory)?.name || ''))}</p><div class="entry-detail-term">${speaker(word)}<h2 id="entry-detail-title" lang="${state.language}">${formatTerm(word, state.language)}</h2></div><p class="entry-detail-meaning ${m.missing ? 'missing-meaning' : ''}" lang="${m.missing ? 'zh-Hant' : settings.meaningLanguage}">${esc(m.text)}</p></div>${word.pattern ? `<section class="entry-detail-section"><h3>${isGrammar() ? '接續方式' : '搭配與句型'}</h3><p class="entry-pattern" lang="${state.language}">${esc(word.pattern)}</p></section>` : ''}<section class="entry-detail-section"><h3>用法說明</h3><p class="entry-explanation" lang="zh-Hant">${word.explanation ? esc(word.explanation) : '尚未補充用法說明。'}</p></section><section class="entry-detail-section"><div class="entry-detail-section-heading"><h3>例句</h3><span>${examples.length} 個例句</span></div><div class="detail-examples">${examples.length ? examples.map((example) => exampleHTML(example, 'detail')).join('') : '<p class="entry-empty-copy">尚未收錄例句。</p>'}</div></section>`;
    }
    return Object.freeze({ list: renderList, card: renderCard, detail: renderDetail });
  }

  window.MotsWorkspace = Object.freeze({ home, reviewSummary, createStudyView });
})();
