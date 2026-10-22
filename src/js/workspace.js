(() => {
  'use strict';

  const { escapeHTML: escape } = window.MotsCore;
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
      <div class="home-heading"><h2>辭典首頁</h2><span>${escape(model.languageLabel)} · ${number(total)} 詞</span></div>
      <section class="home-current" aria-labelledby="home-dictionary-title">
        <div class="home-current-heading"><span class="home-book-symbol" aria-hidden="true">${icons.book}</span><div><p class="home-overline">目前辭典</p><h3 id="home-dictionary-title">${escape(model.title)}</h3></div></div>
        <form id="home-search-form" class="home-search-form" novalidate>
          <div class="home-searchbox">${icons.search}<label for="home-search" class="visually-hidden">搜尋目前辭典</label><input id="home-search" type="search" aria-label="搜尋目前辭典" placeholder="搜尋單字、釋義或例句" autocomplete="off"><button id="home-clear-search" class="icon-button" type="button" aria-label="清除搜尋" hidden>${icons.close}</button></div>
          <button class="button button-primary" type="submit">查詞</button>
        </form>
        <div class="home-primary-actions">
          <button class="button button-tonal" type="button" data-action="start-review" aria-describedby="home-review-help" ${reviewable ? '' : 'disabled'}>${icons.shuffle}隨機複習${reviewable ? `<span class="home-action-count">${number(Math.min(20, reviewable))} 詞</span>` : ''}</button>
          <button class="button button-outline" type="button" data-action="open-dictionary">${icons.book}查詞典</button>
          <button class="button button-outline" type="button" data-action="open-study">${icons.list}按主題學習</button>
        </div>
        <p id="home-review-help" class="home-help">${reviewable ? '每輪最多 20 詞，優先複習不熟悉與有印象的詞，不足時補入未學習；不含已掌握。' : '目前沒有尚未掌握的詞，可到辭典查閱全部詞條。'}</p>
      </section>
      <section class="home-progress" aria-labelledby="home-progress-title">
        <h3 id="home-progress-title">熟悉程度</h3>
        <dl class="home-stats">${stats.map((stat) => `<div class="home-stat ${stat.className}"><dt><span class="home-stat-dot" aria-hidden="true"></span>${stat.label}</dt><dd>${number(stat.value)}</dd></div>`).join('')}</dl>
      </section>
      <section class="home-library" aria-labelledby="home-library-title">
        <div class="home-library-heading"><h3 id="home-library-title">我的辭典</h3><button class="text-button" type="button" data-action="import-dictionary">${icons.plus}匯入辭典</button></div>
        <div class="dictionary-grid">${dictionaries.map((dictionary) => `<button class="dictionary-card ${dictionary.active ? 'is-active' : ''}" type="button" data-dictionary="${escape(dictionary.id)}" aria-pressed="${Boolean(dictionary.active)}"><span class="dictionary-card-icon" aria-hidden="true">${icons.book}</span><span class="dictionary-card-copy"><strong>${escape(dictionary.title)}</strong><span>${escape(dictionary.languageLabel)} · ${number(dictionary.total)} 詞</span></span>${dictionary.active ? '<span class="dictionary-active">使用中</span>' : ''}</button>`).join('')}</div>
        ${dictionaries.length ? '' : '<p class="home-help">尚無可用辭典，請先匯入辭典。</p>'}
      </section>
    </div>`;
  }

  function reviewSummary(model = {}) {
    const total = count(model.total);
    const rated = Math.min(total, count(model.rated));
    const allRated = total > 0 && rated === total;
    return `<section class="review-summary" aria-labelledby="review-summary-title">
      <span class="review-summary-symbol" aria-hidden="true">${icons.check}</span>
      <h2 id="review-summary-title">${allRated ? '本輪複習完成' : '本輪已結束'}</h2>
      <p class="review-summary-count">已標記 <strong>${number(rated)}</strong> / ${number(total)} 詞</p>
      <dl class="review-summary-stats"><div><dt>已掌握</dt><dd>${number(model.mastered)}</dd></div><div><dt>有印象</dt><dd>${number(model.learning)}</dd></div><div><dt>不熟悉</dt><dd>${number(model.unfamiliar)}</dd></div></dl>
      <p class="home-help">可換一組繼續複習，或回到辭典查閱。</p>
      <div class="review-summary-actions"><button class="button button-primary" type="button" data-action="start-review">${icons.shuffle}換一組</button><button class="button button-outline" type="button" data-action="open-dictionary">查閱辭典</button></div>
    </section>`;
  }

  window.MotsWorkspace = Object.freeze({ home, reviewSummary });
})();
