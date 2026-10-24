const { chromium } = require('/Users/zhangfei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const fixture = {
  title: '主題語法測試書', language: 'ja', kind: 'grammar',
  categories: [{ id:'t1', name:'表達', subcategories:[{id:'t1.01',name:'陳述歸納'},{id:'t1.02',name:'請求歸納'}]}],
  words: [
    {id:'grammar-ja-desu',term:'名詞＋です',meaning:'主題書的獨立陳述練習',category:'t1',subcategory:'t1.01',example:'私は学生です。'},
    {id:'theme-masu',term:'〜ます',meaning:'主題書的禮貌表達練習',category:'t1',subcategory:'t1.01',example:'毎日勉強します。'},
    {id:'theme-request',term:'〜てください',meaning:'主題書的請求練習',category:'t1',subcategory:'t1.02',example:'ここに書いてください。'}
  ]
};
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try {
    const context=await browser.newContext({viewport:{width:1440,height:1000}});
    await context.addInitScript(()=>{if(!localStorage.getItem('separation-test-seeded')){localStorage.setItem('mots.settings.v2',JSON.stringify({dictionaryId:'grammar-ja',grammarGrouping:{'grammar-ja':true}}));localStorage.setItem('separation-test-seeded','1')}});
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    const origin='http://127.0.0.1:4181/';
    await page.goto(origin+'?dict=grammar-ja&screen=study&view=list');
    await page.waitForSelector('.word-row').catch(e=>{throw new Error(errors.join('\n') || e.message)});
    assert.equal(await page.locator('#book-switcher option').count(),9);
    assert.equal(await page.locator('[data-grammar-group]').count(),0);
    assert.equal(await page.locator('.word-row').count(),6);
    assert.ok(await page.locator('#category-nav [data-sub]').count()>0);
    assert.equal(await page.locator('#mode-switcher option[value=study]').textContent(),'語法背誦');
    await page.locator('[data-word="grammar-ja-desu"][data-rate="1"]').click();
    await page.screenshot({path:path.join(__dirname,'ordinary-grammar.png')});
    await page.click('#settings-button');await page.locator('#settings-learning>summary').click();
    assert.equal(await page.locator('#grammar-grouping').count(),0);
    assert.ok((await page.locator('#grammar-book-type').textContent()).includes('普通語法書'));
    await page.click('#close-settings');
    await page.selectOption('#book-switcher','grammar-theme-ja');
    assert.equal(await page.locator('.word-row').count(),0);
    assert.equal(await page.locator('#category-nav [data-sub]').count(),0);
    assert.equal(await page.locator('#mode-switcher option[value=study]').textContent(),'主題背誦');
    assert.ok((await page.locator('.empty-state').textContent()).includes('尚未加入內容'));
    await page.screenshot({path:path.join(__dirname,'empty-thematic-book.png')});
    await page.locator('#study-content [data-action=import-dictionary]').click();
    assert.equal(await page.locator('#vocabulary-extension-section').isVisible(),false);
    await page.locator('#import-dictionary').setInputFiles({name:'theme-fixture.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture))});
    await page.waitForFunction(()=>document.querySelector('#dictionary-message').textContent.includes('已建立'));
    const importedID=await page.inputValue('#book-switcher');assert.ok(importedID.startsWith('dict-'));
    await page.click('#close-settings');
    assert.equal(await page.locator('[data-grammar-group]').count(),2);
    assert.equal(await page.locator('.word-row').count(),3);
    await page.locator('[data-grammar-group="t1.01"] > summary').focus();await page.keyboard.press('Enter');
    assert.equal(await page.locator('[data-word="grammar-ja-desu"][data-rate="1"]').getAttribute('aria-pressed'),'false');
    await page.locator('[data-word="grammar-ja-desu"][data-rate="3"]').click();
    assert.equal(await page.locator('[data-grammar-group="t1.01"]').evaluate(el=>el.open),true);
    await page.locator('[data-detail="grammar-ja-desu"]').click();await page.keyboard.press('Escape');
    assert.equal(await page.locator('[data-detail="grammar-ja-desu"]').evaluate(el=>el===document.activeElement),true);
    await page.screenshot({path:path.join(__dirname,'imported-thematic-book.png')});
    await page.click('#card-view');assert.equal(await page.locator('.flashcard').count(),1);assert.equal(await page.locator('[data-grammar-group]').count(),0);
    await page.click('#list-view');assert.equal(await page.locator('[data-grammar-group="t1.01"]').evaluate(el=>el.open),true);
    await page.reload();assert.equal(await page.locator('[data-grammar-group]').count(),2);
    assert.equal(await page.evaluate(id=>JSON.parse(localStorage.getItem('mots.dictionaries.v1')).find(d=>d.id===id).grammarMode,importedID),'thematic');
    await page.selectOption('#book-switcher','grammar-ja');
    assert.equal(await page.locator('[data-grammar-group]').count(),0);
    assert.equal(await page.locator('[data-word="grammar-ja-desu"][data-rate="1"]').getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('[data-word="grammar-ja-desu"][data-rate="3"]').getAttribute('aria-pressed'),'false');
    await page.selectOption('#book-switcher',importedID);
    await page.click('#search-toggle');await page.fill('#search-input','主題書');assert.equal(await page.locator('[data-grammar-group][open]').count(),2);
    await page.fill('#search-input','zzzz-no-match');await page.waitForSelector('.empty-state');await page.click('#clear-search');
    await page.locator('[data-grammar-group="t1.01"] > summary').click();
    await page.setViewportSize({width:320,height:740});await page.emulateMedia({colorScheme:'dark',reducedMotion:'reduce'});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.screenshot({path:path.join(__dirname,'thematic-mobile-dark.png'),fullPage:true});
    await page.selectOption('#book-switcher','grammar-theme-de');
    assert.equal(await page.locator('.word-row').count(),0);
    await page.screenshot({path:path.join(__dirname,'empty-thematic-mobile.png'),fullPage:true});
    await page.selectOption('#book-switcher','grammar-ja');assert.equal(await page.locator('.word-row').count(),6);
    await page.screenshot({path:path.join(__dirname,'ordinary-mobile.png'),fullPage:true});
    await page.click('#category-picker');assert.ok(await page.locator('#mobile-category-nav [data-sub]').count()>0);await page.click('#close-categories');
    await page.selectOption('#book-switcher','fr');assert.equal(await page.locator('[data-grammar-group]').count(),0);
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(__dirname,'browser-result.json'),JSON.stringify({success:true,errors,viewports:[1440,320],checks:['ordinary UI restored despite stale setting','nine separate books','empty theme import entry','thematic import inherits type','same-ID ratings isolated','individual card and group resume','details keyboard/focus','reload preserves metadata','search auto-expansion and empty recovery','narrow dark layout','ordinary mobile subcategories','vocabulary unchanged']},null,2));
    console.log('Grammar book separation browser checks passed.');
  } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
