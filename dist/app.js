(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const tc = value => window.motsTraditional ? window.motsTraditional(String(value ?? '')) : String(value ?? '');
  const sc = value => window.motsSimplified ? window.motsSimplified(String(value ?? '')) : String(value ?? '');
  const languages = window.MOTS_LANGUAGES;
  const meaningLanguages = window.MOTS_MEANING_LANGUAGES;
  const languageOf = code => languages.find(l=>l.code===code) || languages[0];
  const meaningOf = code => meaningLanguages.find(l=>l.code===code) || meaningLanguages[0];
  const languageCodes = new Set(languages.map(l=>l.code));
  const meaningCodes = new Set(meaningLanguages.map(l=>l.code));
  const pageSizes = [10,20,50,100];
  let categories = window.CATEGORIES || [];
  const labels = ['未學習','不熟悉','有印象','已掌握'];
  const icons = {
    sound:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m11 5-6 4H2v6h3l6 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg>',
    chevron:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 10 4 4 4-4"/></svg>',
    book:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c-3-2-7-2-10-1v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Zm0 0v15"/></svg>',
    right:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>',
    left:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m5-5-5 5 5 5"/></svg>',
    eye:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
    random:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h3c5 0 7 12 12 12h3m-4-4 4 4-4 4M3 18h3c2 0 4-3 6-6s4-6 6-6h3m-4-4 4 4-4 4"/></svg>',
    ordered:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4v16m-4-4 4 4 4-4M16 4h4m-4 5h4m-4 5h4"/></svg>',
    download:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4"/></svg>'
  };
  const settingsKey = 'mots.settings.v2', banksKey = 'mots.banks.v1', dictionariesKey='mots.dictionaries.v1';
  const progressKey = id => id==='fr'?'mots.progress.v1':['de','ja'].includes(id)?`mots.progress.${id}.v1`:`mots.progress.dictionary.${id}.v1`;
  const storageFailures = new Set();
  const isObject = value => Boolean(value && typeof value==='object' && !Array.isArray(value));
  const read = (key,fallback) => {
    try { const value=localStorage.getItem(key); return value===null?fallback:JSON.parse(value); }
    catch { storageFailures.add(key); return fallback; }
  };
  function write(key,value) {
    try { localStorage.setItem(key,JSON.stringify(value)); storageFailures.delete(key); updateSaveState(); return true; }
    catch { storageFailures.add(key); updateSaveState(); return false; }
  }
  let dictionaryLibrary=[];
  try{dictionaryLibrary=window.MotsDictionaries.validateLibrary(read(dictionariesKey,[]));}
  catch{storageFailures.add(dictionariesKey);}
  const dictionaryList=()=>[...window.MotsDictionaries.builtins(),...dictionaryLibrary];
  const dictionaryOf=id=>dictionaryList().find(d=>d.id===id)||dictionaryList()[0];
  const dictionaryIDs=()=>dictionaryList().map(d=>d.id);
  function sanitizeSettings(value={}) {
    const source=isObject(value)?value:{};
    const visibility={};
    for(const id of dictionaryIDs()) visibility[id]=Array.isArray(source.visibility?.[id])?[...new Set(source.visibility[id].filter(l=>[0,1,2,3].includes(l)))]:[];
    const dictionaryId=dictionaryIDs().includes(source.dictionaryId)?source.dictionaryId:languageCodes.has(source.studyLanguage)?source.studyLanguage:'fr';
    return {dictionaryId,studyLanguage:dictionaryOf(dictionaryId).language,meaningLanguage:meaningCodes.has(source.meaningLanguage)?source.meaningLanguage:'zh-Hant',audioMode:['auto','device','google'].includes(source.audioMode)?source.audioMode:'auto',view:source.view==='card'?'card':'list',order:source.order==='random'?'random':'ordered',pageSize:pageSizes.includes(Number(source.pageSize))?Number(source.pageSize):20,defaultHideMastered:source.defaultHideMastered===true,sidebarCollapsed:source.sidebarCollapsed===true,visibility};
  }
  let settings=sanitizeSettings(read(settingsKey,{}));
  function applyDefaultVisibility(lang) {
    if(settings.defaultHideMastered)settings.visibility[lang]=[...new Set([...settings.visibility[lang],3])];
  }
  for(const id of dictionaryIDs())applyDefaultVisibility(id);
  let customBanks=read(banksKey,{});
  if(!isObject(customBanks))customBanks={};
  const progress={};
  const cleanProgress=values=>Object.fromEntries(Object.entries(isObject(values)?values:{}).filter(([id,l])=>!['__proto__','constructor','prototype'].includes(id)&&[0,1,2,3].includes(l)));
  for(const id of dictionaryIDs()) {
    progress[id]=cleanProgress(read(progressKey(id),{}));
  }
  function normalizeWord(word,language) {
    const meanings=isObject(word.meanings)?{...word.meanings}:{};
    if(language==='fr'&&word.chinese&&!meanings['zh-Hans'])meanings['zh-Hans']=word.chinese;
    if(meanings['zh-Hans']&&!meanings['zh-Hant'])meanings['zh-Hant']=tc(meanings['zh-Hans']);
    if(meanings['zh-Hant']&&!meanings['zh-Hans'])meanings['zh-Hans']=sc(meanings['zh-Hant']);
    return {...word,language,term:String(word.term||word.french||''),meanings,example:String(word.example||'')};
  }
  let banks;
  function refreshBanks() {
    banks={fr:(window.WORDS||[]).map(w=>normalizeWord(w,'fr'))};
    for(const lang of ['de','ja'])banks[lang]=(window.MOTS_EXTRA_BANKS?.[lang]||[]).map(w=>normalizeWord(w,lang));
    for(const lang of languageCodes) {
      const extras=Array.isArray(customBanks[lang])?customBanks[lang]:[];
      for(const word of extras)if(isObject(word)&&typeof word.id==='string'&&word.id.startsWith(`custom-${lang}-`)&&typeof word.term==='string')banks[lang].push(normalizeWord(word,lang));
    }
    for(const dictionary of dictionaryLibrary)banks[dictionary.id]=dictionary.words.map(w=>normalizeWord(w,dictionary.language));
  }
  refreshBanks();
  const url=new URL(location.href);
  const initialDictionary=dictionaryIDs().includes(url.searchParams.get('dict'))?url.searchParams.get('dict'):languageCodes.has(url.searchParams.get('lang'))?url.searchParams.get('lang'):settings.dictionaryId;
  categories=dictionaryOf(initialDictionary).categories;
  const categoryValid=id=>id==='all'||categories.some(c=>c.id===id);
  if(pageSizes.includes(Number(url.searchParams.get('size'))))settings.pageSize=Number(url.searchParams.get('size'));
  const requestedPage=Number(url.searchParams.get('page'));
  const requestedScreen=url.searchParams.get('screen');
  const screen=['home','study','dictionary','review'].includes(requestedScreen)?requestedScreen:url.searchParams.has('category')?'study':'home';
  const state={dictionary:initialDictionary,language:dictionaryOf(initialDictionary).language,screen,category:categoryValid(url.searchParams.get('category'))?url.searchParams.get('category'):'all',subcategory:url.searchParams.get('sub')||'all',query:url.searchParams.get('q')||'',view:['list','card'].includes(url.searchParams.get('view'))?url.searchParams.get('view'):settings.view,order:url.searchParams.get('order')==='random'?'random':settings.order,index:0,page:Number.isInteger(requestedPage)&&requestedPage>0?requestedPage:1,revealed:false,completed:false,searchOpen:screen==='dictionary'||Boolean(url.searchParams.get('q'))};
  if(url.searchParams.has('hide'))settings.visibility[state.dictionary]=[...new Set(url.searchParams.get('hide').split(',').filter(v=>/^[0-3]$/.test(v)).map(Number))];
  else if(/^[0-3]$/.test(url.searchParams.get('level')||''))settings.visibility[state.dictionary]=[0,1,2,3].filter(l=>l!==Number(url.searchParams.get('level')));
  let deck=[],matched=[],randomOrder=[],expandedCategory=state.category==='all'?null:state.category,composing=false,homeComposing=false,toastTimer,reviewSession=null,exportScopeValue='all';
  const categoryOf=id=>categories.find(c=>c.id===id);
  const subcategoryOf=id=>categories.flatMap(c=>c.subcategories).find(s=>s.id===id);
  const categoryLabel=value=>['fr','de','ja'].includes(state.dictionary)?tc(value):String(value??'');
  const words=()=>banks[state.dictionary]||[];
  const hiddenLevels=()=>settings.visibility[state.dictionary]||[];
  const levelOf=id=>[1,2,3].includes(progress[state.dictionary]?.[id])?progress[state.dictionary][id]:0;
  const normalize=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().trim();
  function meaning(word) {
    const lang=settings.meaningLanguage;
    if(lang===state.language)return {text:word.term,missing:false};
    const text=word.meanings?.[lang];
    return text?{text:lang==='zh-Hant'?tc(text):String(text),missing:false}:{text:`尚無${({'zh-Hant':'繁體中文','zh-Hans':'簡體中文',en:'英語',fr:'法語',de:'德語',ja:'日語'})[lang]}釋義`,missing:true};
  }
  function toast(message) {
    clearTimeout(toastTimer);$('toast').textContent=message;$('toast').classList.add('visible');
    toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),2600);
  }
  function updateSaveState() {
    if(!$('save-state'))return;
    $('save-state').innerHTML=`<span class="status-dot"></span>${storageFailures.size?'暫存中，請備份':'本機儲存'}`;
    $('save-state').title=storageFailures.size?'瀏覽器無法儲存部分資料，請下載備份':'學習進度與設定儲存於此瀏覽器';
    if($('settings-save-note'))$('settings-save-note').textContent=storageFailures.size?'部分資料僅暫存於此頁，請下載備份。':'設定會自動儲存於此瀏覽器。';
  }
  function saveSettings() {
    settings.dictionaryId=state.dictionary;settings.studyLanguage=state.language;settings.view=state.view;settings.order=state.order;
    return write(settingsKey,settings);
  }
  function syncURL() {
    const u=new URL(location.href);u.search='';u.hash='';u.searchParams.set('dict',state.dictionary);u.searchParams.set('screen',state.screen);u.searchParams.set('lang',state.language);u.searchParams.set('category',state.category);
    if(state.subcategory!=='all')u.searchParams.set('sub',state.subcategory);
    if(state.query)u.searchParams.set('q',state.query);
    if(hiddenLevels().length||settings.defaultHideMastered)u.searchParams.set('hide',[...hiddenLevels()].sort().join(','));
    if(state.view==='list')u.searchParams.set('view','list');
    u.searchParams.set('size',settings.pageSize);
    if((state.screen==='dictionary'||state.view==='list')&&state.page>1)u.searchParams.set('page',state.page);
    if(state.order==='random')u.searchParams.set('order','random');
    try{history.replaceState(null,'',u);}catch{/* A browser may restrict file-URL history changes. */}
  }
  function shuffle(items) {
    const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;
  }
  function groupWords() {
    return words().filter(w=>(state.category==='all'||w.category===state.category)&&(state.subcategory==='all'||w.subcategory===state.subcategory));
  }
  function vocabularyForExport(category,subcategory='all') {
    return words().filter(w=>(category==='all'||w.category===category)&&(subcategory==='all'||w.subcategory===subcategory)&&levelOf(w.id)!==3);
  }
  function exportScopeName(category,subcategory='all') {
    if(subcategory!=='all'){const sub=subcategoryOf(subcategory);return `${subcategory} ${categoryLabel(sub?.name||'')}`.trim();}
    return category==='all'?'全部單字':`${category} ${categoryLabel(categoryOf(category)?.name||'')}`.trim();
  }
  function buildDeck(reset=true,reshuffle=false) {
    stopPlayback();
    if(state.screen==='review'&&reviewSession){
      const lookup=new Map(words().map(w=>[w.id,w]));deck=reviewSession.ids.map(id=>lookup.get(id)).filter(Boolean);matched=[...deck];
    }else{
      matched=groupWords().filter(w=>!state.query||normalize(`${w.term} ${Object.values(w.meanings||{}).join(' ')} ${w.chinese||''} ${w.example}`).includes(normalize(state.query)));
      deck=state.screen==='dictionary'?[...matched]:matched.filter(w=>!hiddenLevels().includes(levelOf(w.id)));
    }
    if(state.screen==='dictionary')deck.sort((a,b)=>a.term.localeCompare(b.term,state.language,{sensitivity:'base',numeric:true}));
    else if(state.screen!=='review'&&state.order==='random') {
      if(reshuffle||!randomOrder.length)randomOrder=shuffle(words().map(w=>w.id));
      const rank=new Map(randomOrder.map((id,index)=>[id,index]));deck.sort((a,b)=>rank.get(a.id)-rank.get(b.id));
    }
    if(reset&&state.screen!=='review'){state.index=0;state.page=1;state.revealed=false;state.completed=false;}
    state.index=Math.min(state.index,Math.max(0,deck.length-1));state.page=Math.min(state.page,Math.max(1,Math.ceil(deck.length/settings.pageSize)));
    syncURL();render();
  }
  function showScreen(screen,query='') {
    stopPlayback();homeComposing=false;composing=false;reviewSession=null;state.screen=screen;state.query=query;state.searchOpen=screen==='dictionary'||Boolean(query);state.index=0;state.page=1;state.revealed=false;state.completed=false;
    if(screen==='home'||screen==='dictionary'){state.category='all';state.subcategory='all';expandedCategory=null;}
    buildDeck();$('main').focus({preventScroll:true});window.scrollTo({top:0,behavior:'auto'});
    if(screen==='dictionary')$('search-input').focus({preventScroll:true});
  }
  function startReview() {
    stopPlayback();
    const priority=shuffle(words().filter(w=>[1,2].includes(levelOf(w.id)))),unseen=shuffle(words().filter(w=>levelOf(w.id)===0));
    reviewSession={ids:[...priority,...unseen].slice(0,20).map(w=>w.id),rated:new Set()};
    state.screen='review';state.category='all';state.subcategory='all';state.query='';state.searchOpen=false;state.index=0;state.page=1;state.revealed=false;state.completed=false;expandedCategory=null;
    buildDeck(false);$('main').focus({preventScroll:true});window.scrollTo({top:0,behavior:'auto'});
  }
  function chooseCategory(id,sub='all') {reviewSession=null;if(['home','review'].includes(state.screen))state.screen='study';state.category=id;state.subcategory=sub;expandedCategory=id==='all'?null:id;buildDeck();}
  function renderNavigation() {
    const available=categories.filter(c=>words().some(w=>w.category===c.id));
    for(const target of ['category-nav','mobile-category-nav']) {
      const top=$(target).scrollTop;
      $(target).innerHTML=`<button class="nav-item all-words" data-category="all" aria-pressed="${state.screen!=='home'&&state.category==='all'}">${icons.book}<span>全部單字</span><span class="nav-count">${words().length}</span></button>`+available.map(c=>{
        const selected=state.screen!=='home'&&state.category===c.id,expanded=expandedCategory===c.id,id=`${target}-children-${c.id}`;
        const subs=c.subcategories.filter(s=>words().some(w=>w.subcategory===s.id));
        return `<div class="nav-group"><button class="nav-item chapter-button" data-category="${c.id}" aria-pressed="${selected}" aria-expanded="${expanded}" aria-controls="${id}"><span class="chapter-num">${/^\d+$/.test(c.id)?c.id.padStart(2,'0'):c.id}</span><span class="chapter-name">${esc(categoryLabel(c.name))}</span><span class="nav-count">${words().filter(w=>w.category===c.id).length}</span><span class="nav-chevron">${icons.chevron}</span></button><div class="nav-children" id="${id}" role="group" aria-label="${esc(categoryLabel(c.name))}的子類" ${expanded?'':'hidden'}><button class="nav-child" data-parent="${c.id}" data-sub="all" aria-pressed="${selected&&state.subcategory==='all'}">全部子類</button>${subs.map(s=>`<button class="nav-child" data-parent="${c.id}" data-sub="${s.id}" aria-pressed="${selected&&state.subcategory===s.id}"><span class="sub-code">${s.id}</span><span>${esc(categoryLabel(s.name))}</span></button>`).join('')}</div></div>`;
      }).join('');$(target).scrollTop=top;
    }
  }
  function renderVisibility() {
    const counts=[0,0,0,0];matched.forEach(w=>counts[levelOf(w.id)]++);
    $('visibility-options').innerHTML=[3,2,1,0].map(l=>`<label class="visibility-option" for="hide-level-${l}"><input id="hide-level-${l}" type="checkbox" data-hide-level="${l}" ${hiddenLevels().includes(l)?'checked':''}><span class="legend-status ${['neutral','red','orange','green'][l]}" aria-hidden="true"></span><span>${labels[l]}</span><span class="visibility-count">${counts[l]}</span></label>`).join('');
    $('hidden-count-badge').hidden=!hiddenLevels().length;$('hidden-count-badge').textContent=hiddenLevels().length;
    $('visibility-button').setAttribute('aria-label',hiddenLevels().length?`依熟悉程度隱藏，已選 ${hiddenLevels().length} 種`:'依熟悉程度隱藏');
  }
  function renderHeader() {
    const lang=languageOf(state.language),category=categoryOf(state.category),sub=state.subcategory==='all'?null:subcategoryOf(state.subcategory);
    $('language-title').textContent=lang.label;$('language-title').lang=state.language;
    $('brand-language').textContent=lang.label;$('brand-language').lang=state.language;
    document.body.classList.toggle('sidebar-collapsed',settings.sidebarCollapsed);
    $('sidebar-toggle').setAttribute('aria-expanded',String(!settings.sidebarCollapsed));
    const sidebarLabel=settings.sidebarCollapsed?'展開左側目錄':'收合左側目錄';
    $('sidebar-toggle').setAttribute('aria-label',sidebarLabel);$('sidebar-toggle').title=sidebarLabel;
    $('sidebar-toggle').querySelector('path').setAttribute('d',settings.sidebarCollapsed?'M9 4v16m3-11 3 3-3 3':'M9 4v16m6-11-3 3 3 3');
    $('total-count').textContent=words().length;
    $('category-title').textContent=sub?`${sub.id} · ${categoryLabel(sub.name)}`:category?categoryLabel(category.name):'全部單字';
    $('category-count').textContent=`${groupWords().length} 詞`;
    window.MotsSelect.setOptions('dictionary-switcher',dictionaryList().map(d=>({value:d.id,label:d.title})));
    window.MotsSelect.setValue('dictionary-switcher',state.dictionary);
    const homeURL=new URL(location.href);homeURL.search='';homeURL.hash='';homeURL.searchParams.set('screen','home');homeURL.searchParams.set('dict',state.dictionary);$('home-link').href=homeURL.href;
    for(const route of ['home','dictionary','review'])document.body.classList.toggle(`${route}-mode`,state.screen===route);
    $('home-section').hidden=state.screen!=='home';$('library-panel').hidden=['home','review'].includes(state.screen);$('study-panel').hidden=state.screen==='home';
    $('study-toolbar').hidden=state.screen==='review';$('review-session-bar').hidden=state.screen!=='review';
    $('review-session-label').textContent=state.completed?'本輪複習摘要':`隨機複習 · ${deck.length?state.index+1:0} / ${deck.length}`;
    $('visibility-menu').hidden=state.screen==='dictionary';$('search-toggle').hidden=state.screen==='dictionary';
    document.querySelector('.segmented').hidden=state.screen==='dictionary';document.querySelector('.order-controls').hidden=state.screen==='dictionary';
    for(const button of document.querySelectorAll('.mode-strip button')){
      const active=({'go-home':'home','open-dictionary':'dictionary','open-study':'study','start-review':'review'})[button.dataset.action]===state.screen;
      if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
    }
    $('category-picker-label').textContent=sub?`${categoryLabel(category.name)} / ${categoryLabel(sub.name)}`:category?categoryLabel(category.name):'全部單字';
    $('search-panel').hidden=!state.searchOpen;$('search-input').value=state.query;$('clear-search').hidden=!state.query;
    $('search-toggle').setAttribute('aria-expanded',state.searchOpen);$('search-toggle').classList.toggle('has-query',Boolean(state.query));
    $('search-toggle').setAttribute('aria-label',state.searchOpen?'收合搜尋':state.query?`展開搜尋：${state.query}`:'展開搜尋');
    $('card-view').setAttribute('aria-pressed',state.view==='card');$('list-view').setAttribute('aria-pressed',state.view==='list');
    $('order-button').innerHTML=`${icons[state.order==='random'?'random':'ordered']}<span>${state.order==='random'?'亂序':'正序'}</span>`;
    $('order-button').setAttribute('aria-label',state.order==='random'?'切換為正序':'切換為亂序');$('reshuffle-button').hidden=state.order!=='random';
    const hidden=matched.length-deck.length;
    $('result-count').textContent=hidden?`${deck.length} / ${matched.length} 詞 · 已隱藏 ${hidden}`:`${deck.length} 詞`;
    document.title=`${({home:'首頁',dictionary:'查詞典',study:'主題學習',review:'隨機複習'})[state.screen]} · ${dictionaryOf(state.dictionary).title} · Mots`;
    renderVisibility();updateSaveState();
  }
  const speaker=word=>`<button class="icon-button sound-button" data-speak="${esc(word.id)}" aria-label="朗讀 ${esc(word.term)}" aria-pressed="false" title="播放／停止讀音">${icons.sound}</button>`;
  function ratingDots(word) {
    const level=levelOf(word.id);
    return `<div class="rating-dots" role="group" aria-label="${esc(word.term)}的熟悉程度，目前${labels[level]}">${[3,2,1].map(l=>`<button class="rating-dot-button" data-rate="${l}" data-word="${esc(word.id)}" data-level="${l}" data-rating-variant="dot" aria-label="${esc(word.term)}：${labels[l]}" aria-pressed="${level===l}" title="${labels[l]}${level===l?'；再次點選可取消':''}"><span class="status-circle" aria-hidden="true">${level===l?'✓':''}</span></button>`).join('')}</div>`;
  }
  function renderList() {
    const start=(state.page-1)*settings.pageSize,pages=Math.ceil(deck.length/settings.pageSize);
    return `<div class="rating-legend" aria-label="熟悉程度圖例"><span><i class="legend-status green" aria-hidden="true"></i>已掌握</span><span><i class="legend-status orange" aria-hidden="true"></i>有印象</span><span><i class="legend-status red" aria-hidden="true"></i>不熟悉</span></div><div class="word-table" role="table" aria-label="${languageOf(state.language).name}單字列表"><div class="list-heading" role="row"><span role="columnheader">單字</span><span role="columnheader">釋義</span><span role="columnheader" class="example-column">例句</span><span role="columnheader">熟悉程度</span></div>${deck.slice(start,start+settings.pageSize).map(w=>{const m=meaning(w);return `<div class="word-row" role="row" data-row-word="${esc(w.id)}"><div role="cell" class="list-term">${speaker(w)}<span class="list-word" lang="${state.language}">${esc(w.term)}</span></div><div role="cell" class="list-meaning ${m.missing?'missing-meaning':''}" lang="${m.missing?'zh-Hant':settings.meaningLanguage}">${esc(m.text)}</div><div role="cell" class="list-example" lang="${state.language}">${esc(w.example)||'—'}</div><div role="cell" class="list-status">${ratingDots(w)}</div></div>`;}).join('')}</div><div class="pagination"><span>第 ${start+1}–${Math.min(start+settings.pageSize,deck.length)} 詞，共 ${deck.length} 詞 · 每頁 ${settings.pageSize} 詞</span><div class="pagination-actions"><button id="previous-page" class="icon-button" aria-label="上一頁" ${state.page===1?'disabled':''}>${icons.left}</button><span>${state.page} / ${pages}</span><button id="next-page" class="icon-button" aria-label="下一頁" ${state.page===pages?'disabled':''}>${icons.right}</button></div></div>`;
  }
  function progressPanel() {
    const group=groupWords(),counts=[0,0,0,0];group.forEach(w=>counts[levelOf(w.id)]++);
    return `<aside class="study-aside" aria-label="學習進度"><section class="progress-panel"><h3 class="aside-title">熟悉程度</h3><div class="progress-number">${counts[3]}<span>/ ${group.length}</span></div><p class="progress-description">個單字已掌握</p><div class="progress-track" aria-label="已掌握 ${counts[3]} 詞"><span class="mastered" style="width:${group.length?counts[3]/group.length*100:0}%"></span><span class="learning" style="width:${group.length?counts[2]/group.length*100:0}%"></span></div>${[3,2,1,0].map(l=>`<div class="progress-legend"><span class="legend-label"><span class="legend-dot ${['','difficult','learning','mastered'][l]}"></span>${labels[l]}</span><strong>${counts[l]}</strong></div>`).join('')}</section><div class="tip-panel"><div class="shortcuts"><div class="shortcut-row"><span>顯示／隱藏釋義</span><kbd>Space</kbd></div><div class="shortcut-row"><span>切換單字</span><span><kbd>←</kbd> <kbd>→</kbd></span></div><div class="shortcut-row"><span>標記熟悉程度</span><span><kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd></span></div></div></div></aside>`;
  }
  function renderCard() {
    const w=deck[state.index],level=levelOf(w.id),m=meaning(w);
    return `<div class="study-grid"><div><article class="flashcard" aria-label="單字卡片"><div class="flashcard-top"><span class="word-category">${w.subcategory} · ${esc(categoryLabel(subcategoryOf(w.subcategory)?.name||''))}</span><span class="word-position">${state.index+1} / ${deck.length}</span></div><div class="word-face"><div class="word-main">${speaker(w)}<h3 class="french-word${w.term.length>24?' long-term':''}" lang="${state.language}">${esc(w.term)}</h3></div></div><div class="answer-area" id="answer-area">${state.revealed?`<p class="chinese-meaning ${m.missing?'missing-meaning':''}" lang="${m.missing?'zh-Hant':settings.meaningLanguage}">${esc(m.text)}</p><p class="example-sentence" lang="${state.language}">${esc(w.example)}</p><button id="reveal-button" class="text-button hide-answer" aria-expanded="true" aria-controls="answer-area">隱藏釋義 ↑</button>`:`<p class="answer-placeholder">先回想這個單字的意思</p><button id="reveal-button" class="button button-tonal" aria-expanded="false" aria-controls="answer-area">${icons.eye}顯示釋義與例句</button>`}</div><div class="rating-section"><div class="rating-heading"><span>熟悉程度</span><span class="current-rating">${labels[level]}</span></div><div class="rating-buttons">${[1,2,3].map(l=>`<button class="rating-button" data-rate="${l}" data-word="${esc(w.id)}" data-level="${l}" aria-pressed="${level===l}"><span class="rating-dot" aria-hidden="true"></span>${labels[l]}${level===l?' ✓':''}</button>`).join('')}</div></div></article><div class="card-navigation"><button id="previous-word" class="button button-outline" ${state.index===0?'disabled':''}>${icons.left}上一個</button><div class="card-progress" role="progressbar" aria-label="目前瀏覽位置" aria-valuemin="0" aria-valuemax="${deck.length}" aria-valuenow="${state.index+1}"><span style="width:${(state.index+1)/deck.length*100}%"></span></div><button id="next-word" class="button button-primary">${state.index===deck.length-1?'完成這組':'下一個'}${icons.right}</button></div>${state.completed?`<div class="session-end" role="status"><span>已看完這組 ${deck.length} 個單字。</span><button id="restart-session" class="text-button">再學一次 ↻</button></div>`:''}</div>${progressPanel()}</div>`;
  }
  function renderSettings() {
    for(const [id,value]of Object.entries({'study-language':state.language,'meaning-language':settings.meaningLanguage,'audio-mode':settings.audioMode,'page-size':String(settings.pageSize)}))window.MotsSelect.setValue(id,value);
    $('default-hide-mastered').checked=settings.defaultHideMastered;
    const custom=(customBanks[state.dictionary]||[]).length;
    $('settings-bank-note').textContent=`目前辭典：${dictionaryOf(state.dictionary).title} · ${words().length} 詞${custom?`，含 ${custom} 個擴充單字`:''}`;
    const sourced=banks.fr.filter(w=>w.bookPage).length;
    $('settings-source-note').textContent=`法語手冊 ${banks.fr.length} 詞，其中 ${sourced} 詞含原書頁碼。德語與日語初始各提供 12 個示例。每部辭典有獨立進度，可在右上方切換；繁體中文釋義僅在顯示時轉換。`;
    renderExportSettings();
  }
  function exportTarget() {
    if(exportScopeValue.startsWith('c:'))return {category:exportScopeValue.slice(2),sub:'all'};
    if(exportScopeValue.startsWith('s:')){const sub=exportScopeValue.slice(2);return {category:categories.find(c=>c.subcategories.some(s=>s.id===sub))?.id||'all',sub};}
    return {category:'all',sub:'all'};
  }
  function renderExportSettings() {
    const options=[{value:'all',label:'整部辭典'}];
    for(const c of categories){if(!words().some(w=>w.category===c.id))continue;options.push({value:`c:${c.id}`,label:`${c.id} · ${categoryLabel(c.name)}`});for(const sub of c.subcategories)if(words().some(w=>w.subcategory===sub.id))options.push({value:`s:${sub.id}`,label:`${sub.id} · ${categoryLabel(sub.name)}`});}
    if(!options.some(o=>o.value===exportScopeValue))exportScopeValue='all';
    window.MotsSelect.setOptions('export-unit',options);window.MotsSelect.setValue('export-unit',exportScopeValue);
    const target=exportTarget(),count=vocabularyForExport(target.category,target.sub).length;
    $('export-vocabulary-count').textContent=`(${count} 詞)`;
    $('export-vocabulary').setAttribute('aria-label',`匯出 ${exportScopeName(target.category,target.sub)} 的生詞（${count} 詞，未掌握）`);
  }
  function familiarityCounts() {
    const counts=[0,0,0,0];words().forEach(w=>counts[levelOf(w.id)]++);return counts;
  }
  function render() {
    renderNavigation();renderHeader();renderSettings();
    if(state.screen==='home'){
      const counts=familiarityCounts();
      $('home-section').innerHTML=window.MotsWorkspace.home({title:dictionaryOf(state.dictionary).title,languageLabel:languageOf(state.language).label,total:words().length,mastered:counts[3],learning:counts[2],unfamiliar:counts[1],unseen:counts[0],reviewable:counts[0]+counts[1]+counts[2],dictionaries:dictionaryList().map(d=>({id:d.id,title:d.title,languageLabel:languageOf(d.language).label,total:banks[d.id]?.length||0,active:d.id===state.dictionary}))});
      $('study-content').innerHTML='';updateAudioButtons();return;
    }
    if(state.screen==='review'&&state.completed){
      const counts=[0,0,0,0];reviewSession.ids.forEach(id=>counts[levelOf(id)]++);
      $('study-content').innerHTML=window.MotsWorkspace.reviewSummary({total:reviewSession.ids.length,rated:reviewSession.rated.size,mastered:counts[3],learning:counts[2],unfamiliar:counts[1]});updateAudioButtons();return;
    }
    const hidden=matched.length-deck.length;
    $('study-content').innerHTML=deck.length?((state.screen==='dictionary'||(state.screen==='study'&&state.view==='list'))?renderList():renderCard()):state.screen==='review'?'<div class="empty-state"><h3>目前沒有待複習的生詞</h3><p>本辭典的單字均已掌握。可到辭典查閱所有詞條。</p><button class="button button-tonal" data-action="open-dictionary">查閱辭典</button></div>':`<div class="empty-state"><h3>${hidden?'符合條件的單字已隱藏':'沒有符合條件的單字'}</h3><p>${hidden?`有 ${hidden} 個單字被熟悉程度設定隱藏。`:'試試其他分類或關鍵字。'}</p>${hidden?'<button class="button button-tonal" id="reveal-hidden">顯示所有熟悉程度</button>':'<button class="button button-tonal" id="reset-filters">清除搜尋與隱藏設定</button>'}</div>`;
    updateAudioButtons();
  }
  const audioPlayer=$('pronunciation-player');
  let playback=null,playbackToken=0,playbackTimer,speechRef=null;
  function updateAudioButtons() {
    document.querySelectorAll('[data-speak]').forEach(button=>{
      const active=playback?.id===button.dataset.speak;
      button.classList.toggle('is-playing',Boolean(active&&playback.state==='playing'));
      button.classList.toggle('is-loading',Boolean(active&&playback.state==='loading'));
      button.setAttribute('aria-pressed',String(Boolean(active)));
      if(active&&playback.state==='loading')button.setAttribute('aria-busy','true');else button.removeAttribute('aria-busy');
    });
  }
  function stopPlayback(message='') {
    playbackToken++;clearTimeout(playbackTimer);audioPlayer.onplaying=audioPlayer.onended=audioPlayer.onerror=null;
    audioPlayer.pause();audioPlayer.removeAttribute('src');audioPlayer.load();
    if('speechSynthesis'in window)speechSynthesis.cancel();speechRef=null;playback=null;updateAudioButtons();
    if(message)$('audio-status').textContent=message;
  }
  function getVoice() {
    const locale=languageOf(state.language).voiceLocale.toLowerCase(),prefix=state.language;
    const pick=()=>speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith(prefix)).sort((a,b)=>Number(b.lang.toLowerCase()===locale)-Number(a.lang.toLowerCase()===locale)||Number(b.localService)-Number(a.localService))[0];
    const available=pick();if(available)return Promise.resolve(available);
    return new Promise(resolve=>{let timer;const finish=()=>{clearTimeout(timer);speechSynthesis.removeEventListener('voiceschanged',finish);resolve(pick());};speechSynthesis.addEventListener('voiceschanged',finish,{once:true});timer=setTimeout(finish,700);});
  }
  async function deviceSpeak(word,token) {
    if(token!==playbackToken)return;
    const unavailable=()=>{stopPlayback('讀音無法播放');toast(`沒有可用的${languageOf(state.language).name}語音，可在設定切換為 Google 翻譯。`);};
    if(!('speechSynthesis'in window)){unavailable();return;}
    const voice=await getVoice();if(token!==playbackToken)return;if(!voice){unavailable();return;}
    const utterance=new SpeechSynthesisUtterance(word.term);speechRef=utterance;
    utterance.lang=languageOf(state.language).voiceLocale;utterance.voice=voice;utterance.rate=.85;
    utterance.onstart=()=>{if(token!==playbackToken)return;clearTimeout(playbackTimer);playback.state='playing';updateAudioButtons();$('audio-status').textContent=`正在朗讀：${word.term}`;};
    utterance.onend=()=>{if(token===playbackToken)stopPlayback('播放完成');};
    utterance.onerror=()=>{if(token===playbackToken)unavailable();};
    playbackTimer=setTimeout(()=>{if(token===playbackToken)unavailable();},8000);speechSynthesis.speak(utterance);
  }
  function speak(id) {
    const word=words().find(w=>w.id===id);if(!word)return;
    if(playback?.id===id){stopPlayback('播放已停止');return;}
    stopPlayback();
    if(settings.audioMode==='google') {
      const target={'zh-Hant':'zh-TW','zh-Hans':'zh-CN'}[settings.meaningLanguage]||settings.meaningLanguage;
      window.open(`https://translate.google.com/?sl=${state.language}&tl=${target}&text=${encodeURIComponent(word.term)}&op=translate`,'_blank','noopener,noreferrer');return;
    }
    const token=playbackToken;playback={id,state:'loading'};updateAudioButtons();
    const source=state.dictionary==='fr'?window.MOTS_AUDIO?.words?.[id]:['de','ja'].includes(state.dictionary)?window.MOTS_EXTRA_AUDIO?.[state.dictionary]?.words?.[id]:undefined;
    if(settings.audioMode==='device'||!source){deviceSpeak(word,token);return;}
    let fallbackStarted=false;
    const fallback=()=>{if(token!==playbackToken||fallbackStarted)return;fallbackStarted=true;clearTimeout(playbackTimer);audioPlayer.onplaying=audioPlayer.onended=audioPlayer.onerror=null;audioPlayer.pause();deviceSpeak(word,token);};
    audioPlayer.src=source;
    audioPlayer.onplaying=()=>{if(token!==playbackToken)return;clearTimeout(playbackTimer);playback.state='playing';updateAudioButtons();$('audio-status').textContent=`正在播放：${word.term}`;};
    audioPlayer.onended=()=>{if(token===playbackToken)stopPlayback('播放完成');};audioPlayer.onerror=fallback;
    playbackTimer=setTimeout(fallback,8000);
    // Start directly in the click handler so mobile playback has a user gesture.
    audioPlayer.play().catch(error=>{if(token!==playbackToken)return;if(error.name==='NotAllowedError'){stopPlayback();toast('請再點一次揚聲器播放讀音。');}else fallback();});
  }
  function focusRating(id,level) {document.querySelector(`[data-word="${CSS.escape(id)}"][data-rate="${level}"]`)?.focus({preventScroll:true});}
  function rate(id,level,variant='card') {
    const next=variant==='dot'&&levelOf(id)===level?0:level;
    const position=deck.findIndex(w=>w.id===id),oldPage=state.page;
    progress[state.dictionary][id]=next;
    const saved=write(progressKey(state.dictionary),progress[state.dictionary]);
    if(state.screen==='review'){
      stopPlayback();reviewSession.rated.add(id);state.revealed=false;
      if(state.index===deck.length-1)state.completed=true;else state.index++;
      render();($('reveal-button')||$('main')).focus({preventScroll:true});
      toast(`已標記為「${labels[next]}」${saved?'':'；尚未儲存，請下載備份'}`);return;
    }
    const leaves=state.screen!=='dictionary'&&hiddenLevels().includes(next);
    if(leaves){state.revealed=false;buildDeck(false);const nextWord=deck[Math.min(Math.max(position,0),deck.length-1)];if(state.view==='list'&&nextWord&&state.page===oldPage)focusRating(nextWord.id,level);else $('visibility-button').focus({preventScroll:true});}
    else {render();focusRating(id,level);}
    toast(`${next?'已標記為「'+labels[next]+'」':'已取消標記'}${leaves?'，已依設定隱藏':''}${saved?'':'；尚未儲存，請下載備份'}`);
  }
  function navigateWord(direction) {
    stopPlayback();if(direction>0&&state.index===deck.length-1){state.completed=true;render();$('restart-session')?.focus({preventScroll:true});return;}
    state.index=Math.max(0,Math.min(deck.length-1,state.index+direction));state.revealed=false;state.completed=false;render();
    $(direction>0?'next-word':'previous-word')?.focus({preventScroll:true});
  }
  function clearHidden() {settings.visibility[state.dictionary]=[];saveSettings();buildDeck();$('visibility-button').focus({preventScroll:true});}
  function applyDictionary(id) {
    if(!dictionaryIDs().includes(id))return;
    stopPlayback();const reviewing=state.screen==='review';state.dictionary=id;state.language=dictionaryOf(id).language;categories=dictionaryOf(id).categories;
    settings.visibility[id]??=[];progress[id]??=cleanProgress(read(progressKey(id),{}));applyDefaultVisibility(id);
    state.category='all';state.subcategory='all';state.query='';state.searchOpen=state.screen==='dictionary';state.index=0;state.page=1;state.revealed=false;state.completed=false;randomOrder=[];expandedCategory=null;reviewSession=null;exportScopeValue='all';
    saveSettings();if(reviewing)startReview();else buildDeck();
  }
  function applyLanguage(lang) {
    if(state.language===lang)return;
    const target=dictionaryList().find(d=>d.language===lang);if(target)applyDictionary(target.id);
  }
  function closeCategories() {$('category-dialog').close();(state.screen==='home'||state.screen==='review'?$('mobile-menu-button'):$('category-picker')).focus({preventScroll:true});}
  for(const navID of ['category-nav','mobile-category-nav'])$(navID).addEventListener('click',event=>{
    const parent=event.target.closest('[data-category]'),child=event.target.closest('[data-sub]');
    if(parent) {
      const id=parent.dataset.category;
      if(id==='all'){chooseCategory(id);if(navID==='mobile-category-nav')closeCategories();}
      else if(state.category===id){expandedCategory=expandedCategory===id?null:id;renderNavigation();}
      else chooseCategory(id);
      if(navID==='category-nav'||$('category-dialog').open){const current=document.querySelector(`#${navID} [data-category="${id}"]`);current?.focus({preventScroll:true});current?.scrollIntoView({block:'nearest'});}
    }
    if(child){chooseCategory(child.dataset.parent,child.dataset.sub);if(navID==='mobile-category-nav')closeCategories();else document.querySelector(`#${navID} [data-parent="${state.category}"][data-sub="${state.subcategory}"]`)?.focus({preventScroll:true});}
  });
  for(const id of ['mobile-menu-button','category-picker'])$(id).addEventListener('click',()=>{stopPlayback();$('visibility-menu').open=false;if(!expandedCategory&&state.category!=='all')expandedCategory=state.category;renderNavigation();$('category-dialog').showModal();});
  $('close-categories').addEventListener('click',closeCategories);
  function openSettings(){stopPlayback();$('visibility-menu').open=false;exportScopeValue=state.subcategory!=='all'?`s:${state.subcategory}`:state.category!=='all'?`c:${state.category}`:'all';renderSettings();for(const id of ['backup-message','vocabulary-message','dictionary-message','export-message'])$(id).textContent='';$('settings-dialog').showModal();$('settings-dialog').scrollTop=0;}
  $('settings-button').addEventListener('click',openSettings);
  $('home-link').addEventListener('click',event=>{if(event.button||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();showScreen('home');});
  $('main').addEventListener('click',event=>{
    const dictionary=event.target.closest('[data-dictionary]');if(dictionary){applyDictionary(dictionary.dataset.dictionary);return;}
    const action=event.target.closest('[data-action]')?.dataset.action;
    if(action==='go-home')showScreen('home');
    if(action==='open-dictionary')showScreen('dictionary');
    if(action==='open-study')showScreen('study');
    if(action==='start-review')startReview();
    if(action==='import-dictionary')openSettings();
    if(event.target.closest('#home-clear-search')){const input=$('home-search');input.value='';$('home-clear-search').hidden=true;input.focus();}
  });
  $('home-section').addEventListener('input',event=>{if(event.target.id==='home-search')$('home-clear-search').hidden=!event.target.value;});
  $('home-section').addEventListener('compositionstart',()=>{homeComposing=true;});
  $('home-section').addEventListener('compositionend',()=>{homeComposing=false;});
  $('home-section').addEventListener('submit',event=>{if(event.target.id!=='home-search-form')return;event.preventDefault();if(homeComposing)return;showScreen('dictionary',$('home-search').value.trim());});
  $('close-settings').addEventListener('click',()=>$('settings-dialog').close());
  $('sidebar-toggle').addEventListener('click',()=>{settings.sidebarCollapsed=!settings.sidebarCollapsed;saveSettings();renderHeader();});
  for(const id of ['category-dialog','settings-dialog'])$(id).addEventListener('click',event=>{if(event.target!==$(id))return;const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)$(id).close();});
  matchMedia('(min-width:761px)').addEventListener('change',event=>{if(event.matches&&$('category-dialog').open){$('category-dialog').close();(settings.sidebarCollapsed?$('sidebar-toggle'):document.querySelector(`#category-nav [data-category="${state.category}"]`))?.focus({preventScroll:true});}});
  window.MotsSelect.setOptions('study-language',languages.map(l=>({value:l.code,label:`${l.label} · ${l.name}`})));
  window.MotsSelect.setOptions('meaning-language',meaningLanguages.map(l=>({value:l.code,label:l.label})));
  window.MotsSelect.setOptions('audio-mode',[{value:'auto',label:'內建音訊優先'},{value:'device',label:'裝置語音'},{value:'google',label:'Google 翻譯（另開視窗）'}]);
  window.MotsSelect.setOptions('page-size',pageSizes.map(value=>({value:String(value),label:`${value} 詞`})));
  $('study-language').addEventListener('change',event=>applyLanguage(event.target.value));
  $('dictionary-switcher').addEventListener('change',event=>applyDictionary(event.target.value));
  $('meaning-language').addEventListener('change',event=>{settings.meaningLanguage=event.target.value;saveSettings();buildDeck();});
  $('audio-mode').addEventListener('change',event=>{stopPlayback();settings.audioMode=event.target.value;saveSettings();});
  $('page-size').addEventListener('change',event=>{
    const value=Number(event.target.value);if(!pageSizes.includes(value))return;
    const first=(state.page-1)*settings.pageSize;settings.pageSize=value;state.page=Math.floor(first/value)+1;saveSettings();buildDeck(false);
  });
  $('default-hide-mastered').addEventListener('change',event=>{
    settings.defaultHideMastered=event.target.checked;
    for(const id of dictionaryIDs())settings.visibility[id]=settings.defaultHideMastered?[...new Set([...(settings.visibility[id]||[]),3])]:(settings.visibility[id]||[]).filter(level=>level!==3);
    saveSettings();buildDeck();
  });
  $('visibility-options').addEventListener('change',event=>{
    if(!event.target.matches('[data-hide-level]'))return;
    const level=Number(event.target.dataset.hideLevel);
    settings.visibility[state.dictionary]=event.target.checked?[...new Set([...hiddenLevels(),level])]:hiddenLevels().filter(l=>l!==level);
    saveSettings();buildDeck();$(`hide-level-${level}`).focus({preventScroll:true});
  });
  $('show-all-levels').addEventListener('click',clearHidden);
  $('export-unit').addEventListener('change',event=>{exportScopeValue=event.target.value;renderExportSettings();$('export-message').textContent='';});
  $('export-vocabulary').addEventListener('click',()=>{const target=exportTarget();exportVocabulary(target.category,target.sub);});
  $('search-toggle').addEventListener('click',()=>{state.searchOpen=!state.searchOpen;renderHeader();if(state.searchOpen)$('search-input').focus();});
  $('search-input').addEventListener('compositionstart',()=>{composing=true;});
  $('search-input').addEventListener('compositionend',event=>{composing=false;state.query=event.target.value;buildDeck();});
  $('search-input').addEventListener('input',event=>{if(!composing&&!event.isComposing){state.query=event.target.value;buildDeck();}});
  $('clear-search').addEventListener('click',()=>{state.query='';buildDeck();$('search-input').focus();});
  document.addEventListener('click',event=>{if(!event.composedPath().includes($('visibility-menu')))$('visibility-menu').open=false;});
  for(const view of ['card','list'])$(`${view}-view`).addEventListener('click',()=>{
    if(state.view===view)return;
    stopPlayback();
    if(state.screen==='study'&&state.view==='list'&&view==='card'){
      const start=Math.min((state.page-1)*settings.pageSize,Math.max(0,deck.length-1));
      let next=deck.findIndex((word,index)=>index>=start&&levelOf(word.id)===0);
      if(next<0)next=deck.findIndex(word=>levelOf(word.id)===0);
      state.index=next<0?start:next;
      state.page=Math.floor(state.index/settings.pageSize)+1;
      state.revealed=false;
    }
    state.view=view;state.completed=false;saveSettings();syncURL();render();
  });
  $('order-button').addEventListener('click',()=>{state.order=state.order==='random'?'ordered':'random';saveSettings();buildDeck(true,true);});
  $('reshuffle-button').addEventListener('click',()=>{buildDeck(true,true);toast('已重新打亂順序');});
  $('study-content').addEventListener('click',event=>{
    const sound=event.target.closest('[data-speak]');if(sound){speak(sound.dataset.speak);return;}
    const rating=event.target.closest('[data-rate]');if(rating){rate(rating.dataset.word,Number(rating.dataset.rate),rating.dataset.ratingVariant||'card');return;}
    const button=event.target.closest('button');if(!button)return;
    if(button.id==='reveal-button'){stopPlayback();state.revealed=!state.revealed;render();$('reveal-button').focus({preventScroll:true});}
    if(button.id==='previous-word')navigateWord(-1);if(button.id==='next-word')navigateWord(1);
    if(button.id==='restart-session'){state.index=0;state.completed=false;state.revealed=false;render();$('reveal-button').focus({preventScroll:true});}
    if(['previous-page','next-page'].includes(button.id)){stopPlayback();state.page+=button.id==='next-page'?1:-1;syncURL();render();$(button.id)?.focus({preventScroll:true});}
    if(button.id==='reveal-hidden')clearHidden();
    if(button.id==='reset-filters'){state.query='';if(state.screen!=='dictionary')settings.visibility[state.dictionary]=[];saveSettings();buildDeck();(state.screen==='dictionary'?$('search-input'):$('search-toggle')).focus({preventScroll:true});}
  });
  document.addEventListener('keydown',event=>{
    if(event.isComposing||composing)return;
    if(event.key==='Escape'&&!$('settings-dialog').open&&!$('category-dialog').open){
      if($('visibility-menu').open){event.preventDefault();$('visibility-menu').open=false;$('visibility-button').focus();return;}
      if(state.searchOpen&&state.screen!=='dictionary'){event.preventDefault();state.searchOpen=false;renderHeader();$('search-toggle').focus();return;}
    }
    const focused=document.activeElement;
    if(event.altKey||event.ctrlKey||event.metaKey||$('settings-dialog').open||$('category-dialog').open||focused.closest('nav,details,md-outlined-select')||/INPUT|SELECT|TEXTAREA/.test(focused.tagName)||focused.isContentEditable||!(state.screen==='review'||(state.screen==='study'&&state.view==='card'))||!deck.length||state.completed&&state.screen==='review')return;
    if(event.key===' '&&!/BUTTON|A|SUMMARY/.test(focused.tagName)){event.preventDefault();stopPlayback();state.revealed=!state.revealed;render();}
    if(event.key==='ArrowRight'){event.preventDefault();navigateWord(1);document.activeElement.blur();}
    if(event.key==='ArrowLeft'){event.preventDefault();navigateWord(-1);document.activeElement.blur();}
    if(['1','2','3'].includes(event.key))rate(deck[state.index].id,Number(event.key));
  });
  function downloadFile(name,content,type) {
    const blob=new Blob([content],{type}),href=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=href;a.download=name;a.hidden=true;document.body.append(a);
    try{a.click();}finally{a.remove();setTimeout(()=>URL.revokeObjectURL(href),30000);}
  }
  function download(name,data) {
    downloadFile(name,JSON.stringify(data,null,2),'application/json');
  }
  function csvCell(value) {
    let text=String(value??'');
    if(/^[\s\u0000-\u001f]*[=+@-]/u.test(text))text="'"+text;
    return `"${text.replace(/"/g,'""')}"`;
  }
  function vocabularyCSV(records) {
    const rows=[['單字','釋義','例句','熟悉程度','一級單元','二級單元','背誦語言','釋義語言']];
    for(const word of records)rows.push([word.term,meaning(word).text,word.example,labels[levelOf(word.id)],exportScopeName(word.category),exportScopeName(word.category,word.subcategory),languageOf(state.language).label,meaningOf(settings.meaningLanguage).label]);
    return '\uFEFF'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n')+'\r\n';
  }
  function exportNotice(message) {
    toast(message);
    $('export-message').textContent=message;
  }
  function exportVocabulary(category,subcategory='all') {
    const records=vocabularyForExport(category,subcategory);
    if(!records.length){exportNotice('此單元沒有尚未掌握的生詞。');return;}
    const scope=exportScopeName(category,subcategory).replace(/[\\/:*?"<>|\u0000-\u001f]/g,'-').slice(0,100);
    try {
      const title=dictionaryOf(state.dictionary).title.replace(/[\\/:*?"<>|\u0000-\u001f]/g,'-').slice(0,60);
      downloadFile(`Mots-${state.language}-${title}-${scope}-生詞.csv`,vocabularyCSV(records),'text/csv;charset=utf-8');
      exportNotice(`已準備匯出 ${records.length} 個生詞（未掌握），請查看下載。`);
    } catch {exportNotice('無法匯出生詞，請再試一次。');}
  }
  function hash(text) {let value=2166136261;for(const c of text){value^=c.codePointAt(0);value=Math.imul(value,16777619);}return (value>>>0).toString(36);}
  function validateEntries(entries,lang,preserveIDs=false,categoryList=window.CATEGORIES,prefix=lang) {
    if(!Array.isArray(entries)||entries.length>5000)throw new Error('詞庫須為單字陣列，最多 5,000 詞。');
    const seen=new Set();
    return entries.map((entry,index)=>{
      if(!isObject(entry))throw new Error(`第 ${index+1} 詞的格式不正確。`);
      const term=String(entry.term||entry.word||(lang==='fr'?entry.french:'')||'').trim();
      if(!term||term.length>180)throw new Error(`第 ${index+1} 詞須包含 180 字以內的 term 單字欄位。`);
      const meanings={};
      if(isObject(entry.meanings))for(const [code,text]of Object.entries(entry.meanings))if(meaningCodes.has(code)&&typeof text==='string'&&text.trim()){
        if(text.length>1600)throw new Error(`第 ${index+1} 詞的釋義過長。`);meanings[code]=text.trim();
      }
      if(typeof entry.chinese==='string'&&entry.chinese.trim()){
        if(entry.chinese.length>1600)throw new Error(`第 ${index+1} 詞的釋義過長。`);meanings['zh-Hans']=entry.chinese.trim();
      }
      if(typeof entry.meaning==='string'&&entry.meaning.trim()){
        if(entry.meaning.length>1600)throw new Error(`第 ${index+1} 詞的釋義過長。`);meanings[settings.meaningLanguage]=entry.meaning.trim();
      }
      if(!Object.keys(meanings).length)throw new Error(`第 ${index+1} 詞缺少 meanings 釋義。請參照下載的詞庫範本。`);
      const example=typeof entry.example==='string'?entry.example:'';
      if(example.length>2000)throw new Error(`第 ${index+1} 詞的例句過長。`);
      const category=categoryList.some(c=>c.id===String(entry.category))?String(entry.category):categoryList[0].id;
      const group=categoryList.find(c=>c.id===category);
      const subcategory=group.subcategories.some(s=>s.id===entry.subcategory)?entry.subcategory:group.subcategories[0].id;
      const rawID=String(entry.id||hash(term)).replace(/[^\p{L}\p{N}_.-]/gu,'-');
      const id=(preserveIDs&&rawID.startsWith(`custom-${prefix}-`)?rawID:`custom-${prefix}-${rawID}`).slice(0,110);
      if(seen.has(id))throw new Error(`第 ${index+1} 詞與其他詞條的 ID 重複。`);seen.add(id);
      return {id,category,subcategory,term,meanings,example};
    });
  }
  $('download-template').addEventListener('click',()=>{
    const example=words()[0];if(!example)return;
    const m=meaning(example);
    download(`mots-${state.language}-vocabulary-template.json`,{app:'mots-vocabulary',version:1,language:state.language,words:[{id:'my-word-1',category:example.category,subcategory:example.subcategory,term:example.term,meanings:{[settings.meaningLanguage]:m.missing?'請填入釋義':m.text},example:example.example||''}]});
    $('vocabulary-message').textContent='詞庫範本已準備下載；填寫後可擴充目前辭典。';
  });
  $('download-dictionary-template').addEventListener('click',()=>{
    const entry=words()[0],m=entry?meaning(entry):{text:'請填入釋義',missing:true};
    download(`mots-${state.language}-dictionary-template.json`,{app:'mots-dictionary',version:1,title:'我的辭典',language:state.language,words:[{id:'word-1',term:entry?.term||'bonjour',meanings:{[settings.meaningLanguage]:m.missing?'請填入釋義':m.text},example:entry?.example||''}]});
    $('dictionary-message').textContent='辭典範本已準備下載；填寫名稱、語言和詞條後匯入。';
  });
  $('import-dictionary').addEventListener('change',async event=>{
    const file=event.target.files[0];if(!file)return;
    const fallbackLanguage=state.language;
    try{
      if(file.size>2*1024*1024)throw new Error('請選擇 2 MB 以內的 JSON 辭典。');
      const data=JSON.parse(await file.text()),id=`dict-${crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)}`;
      const dictionary=window.MotsDictionaries.validateImport(data,{id,title:file.name.replace(/\.json$/i,''),language:fallbackLanguage,meaningLanguage:settings.meaningLanguage});
      if(dictionaryLibrary.length>=20)throw new Error('最多可匯入 20 部辭典。');
      dictionaryLibrary=[...dictionaryLibrary,dictionary];settings.visibility[id]=[];progress[id]={};refreshBanks();
      const saved=write(dictionariesKey,dictionaryLibrary);write(progressKey(id),progress[id]);
      state.screen='home';applyDictionary(id);
      $('dictionary-message').textContent=`已建立「${dictionary.title}」，共 ${dictionary.words.length} 詞${saved?'。':'；目前僅暫存於此頁，請下載備份。'}`;
    }catch(error){$('dictionary-message').textContent=error instanceof SyntaxError?'無法讀取 JSON，請參照下載的辭典範本。':error.message;}
    event.target.value='';
  });
  $('import-vocabulary').addEventListener('change',async event=>{
    const file=event.target.files[0];if(!file)return;
    const id=state.dictionary,language=state.language,metadata=dictionaryOf(id);
    try {
      if(file.size>2*1024*1024)throw new Error('請選擇 2 MB 以內的 JSON 詞庫。');
      const data=JSON.parse(await file.text());
      if(isObject(data)&&data.language&&data.language!==language)throw new Error('檔案語言與目前辭典不同，請先切換辭典。');
      const imported=validateEntries(Array.isArray(data)?data:data.words,language,false,metadata.categories,id);
      if(!imported.length)throw new Error('檔案中沒有單字。');
      let saved;
      if(languageCodes.has(id)){
        const merged=new Map((customBanks[id]||[]).map(w=>[w.id,w]));imported.forEach(w=>merged.set(w.id,w));
        if(merged.size>5000)throw new Error('每部內建辭典最多可擴充 5,000 個自訂單字。');
        customBanks[id]=[...merged.values()];saved=write(banksKey,customBanks);
      }else{
        const merged=new Map(metadata.words.map(w=>[w.id,w]));imported.forEach(w=>merged.set(w.id,w));
        if(merged.size>5000)throw new Error('每部匯入辭典最多 5,000 詞。');
        const candidate=window.MotsDictionaries.validateImport({...metadata,words:[...merged.values()]},{id});
        dictionaryLibrary=dictionaryLibrary.map(d=>d.id===id?candidate:d);saved=write(dictionariesKey,dictionaryLibrary);
      }
      refreshBanks();categories=dictionaryOf(state.dictionary).categories;reviewSession=null;state.screen='study';randomOrder=[];state.category='all';state.subcategory='all';expandedCategory=null;state.query='';state.searchOpen=false;buildDeck();
      $('vocabulary-message').textContent=`已加入 ${imported.length} 詞至「${metadata.title}」${saved?'。':'；目前僅暫存於此頁，請下載備份。'}`;
    } catch(error) {$('vocabulary-message').textContent=error instanceof SyntaxError?'無法讀取 JSON，請使用下載的詞庫範本。':error.message;}
    event.target.value='';
  });
  $('export-progress').addEventListener('click',()=>{
    download('mots-backup.json',{app:'mots',version:3,exportedAt:new Date().toISOString(),ratings:progress.fr,progress,settings,customBanks,dictionaries:dictionaryLibrary});
    $('backup-message').textContent='備份已準備下載，包含匯入辭典、各辭典進度、設定及擴充詞庫。';
  });
  $('import-progress').addEventListener('change',async event=>{
    const file=event.target.files[0];if(!file)return;
    try {
      if(file.size>50*1024*1024)throw new Error('請選擇 50 MB 以內的備份。');
      const data=JSON.parse(await file.text());
      if(data.app!=='mots'||![1,2,3].includes(data.version))throw new Error('請選擇 Mots 下載的備份檔案。');
      let candidateLibrary=dictionaryLibrary;
      if(data.version===3&&data.dictionaries!==undefined){
        const imported=window.MotsDictionaries.validateLibrary(data.dictionaries),merged=new Map(dictionaryLibrary.map(d=>[d.id,d]));imported.forEach(d=>merged.set(d.id,d));
        candidateLibrary=window.MotsDictionaries.validateLibrary([...merged.values()]);
      }
      const candidateBanks={...customBanks};
      if(data.version>=2&&data.customBanks!==undefined){
        if(!isObject(data.customBanks))throw new Error('備份詞庫格式不正確。');
        for(const lang of languageCodes)if(data.customBanks[lang]!==undefined){const records=validateEntries(data.customBanks[lang],lang,true,window.CATEGORIES,lang),merged=new Map((candidateBanks[lang]||[]).map(w=>[w.id,w]));records.forEach(w=>merged.set(w.id,w));if(merged.size>5000)throw new Error('合併後的擴充詞庫超過每部 5,000 詞的上限。');candidateBanks[lang]=[...merged.values()];}
      }
      const incoming=data.version===1?{fr:data.ratings}:data.progress;
      if(!isObject(incoming))throw new Error('備份進度格式不正確。');
      const candidateProgress={};let count=0;
      for(const id of [...languageCodes,...candidateLibrary.map(d=>d.id)]){
        const values=incoming[id]??{};if(!isObject(values))throw new Error('備份進度格式不正確。');
        const records=languageCodes.has(id)?[...banks[id],...(candidateBanks[id]||[])]:candidateLibrary.find(d=>d.id===id).words;
        const known=new Set(records.map(w=>w.id));candidateProgress[id]={...(progress[id]||{})};
        for(const [wordID,level]of Object.entries(values))if(known.has(wordID)&&[0,1,2,3].includes(level)){candidateProgress[id][wordID]=level;count++;}
      }
      dictionaryLibrary=candidateLibrary;customBanks=candidateBanks;refreshBanks();randomOrder=[];reviewSession=null;
      write(dictionariesKey,dictionaryLibrary);write(banksKey,customBanks);
      for(const id of dictionaryIDs()){progress[id]=candidateProgress[id];write(progressKey(id),progress[id]);}
      if(data.version>=2&&data.settings)settings=sanitizeSettings(data.settings);else settings=sanitizeSettings(settings);
      for(const id of dictionaryIDs())applyDefaultVisibility(id);
      state.dictionary=settings.dictionaryId;state.language=dictionaryOf(state.dictionary).language;categories=dictionaryOf(state.dictionary).categories;state.view=settings.view;state.order=settings.order;state.screen='home';state.category='all';state.subcategory='all';state.query='';state.searchOpen=false;expandedCategory=null;exportScopeValue='all';saveSettings();
      buildDeck();$('backup-message').textContent=`已合併 ${count} 個單字的進度${storageFailures.size?'；部分資料僅暫存，請下載備份。':'。'}`;
    } catch(error) {$('backup-message').textContent=error instanceof SyntaxError?'無法讀取備份，請選擇 Mots 下載的 JSON 檔案。':error.message;}
    event.target.value='';
  });
  window.addEventListener('storage',event=>{
    try {
      if(event.key===dictionariesKey){
        dictionaryLibrary=window.MotsDictionaries.validateLibrary(JSON.parse(event.newValue||'[]'));refreshBanks();
        for(const id of dictionaryIDs()){settings.visibility[id]??=[];progress[id]??=cleanProgress(read(progressKey(id),{}));}
        if(!dictionaryIDs().includes(state.dictionary))state.dictionary='fr';state.language=dictionaryOf(state.dictionary).language;categories=dictionaryOf(state.dictionary).categories;
        reviewSession=null;if(state.screen==='review')state.screen='home';state.category='all';state.subcategory='all';randomOrder=[];buildDeck();toast('已更新另一分頁的辭典');
      }else if(event.key===settingsKey){
        const incoming=sanitizeSettings(JSON.parse(event.newValue||'{}')),changed=incoming.dictionaryId!==state.dictionary;settings=incoming;
        state.dictionary=settings.dictionaryId;state.language=dictionaryOf(state.dictionary).language;categories=dictionaryOf(state.dictionary).categories;state.view=settings.view;state.order=settings.order;
        if(changed||!groupWords().length){state.category='all';state.subcategory='all';}reviewSession=null;if(state.screen==='review')state.screen='home';randomOrder=[];expandedCategory=state.category==='all'?null:state.category;buildDeck();toast('已更新另一分頁的設定');
      }else if(event.key===banksKey){const value=JSON.parse(event.newValue||'{}');if(!isObject(value))return;customBanks=value;refreshBanks();randomOrder=[];buildDeck();toast('已更新另一分頁的詞庫');}
      else for(const id of dictionaryIDs())if(event.key===progressKey(id)){progress[id]=cleanProgress(JSON.parse(event.newValue||'{}'));if(id===state.dictionary){buildDeck(false);toast('已更新另一分頁的進度');}}
    }catch{toast('另一分頁的資料無法讀取，請重新開啟此頁。');}
  });
  if(state.category==='all'||!categoryOf(state.category)?.subcategories.some(s=>s.id===state.subcategory))state.subcategory='all';
  if(!groupWords().length){state.category='all';state.subcategory='all';expandedCategory=null;}
  if(state.screen==='review')startReview();else buildDeck(false);
})();
