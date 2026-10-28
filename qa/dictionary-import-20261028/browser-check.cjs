const { chromium } = require('/Users/zhangfei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const output = process.env.MOTS_QA_OUTPUT || __dirname;
const origin = process.env.MOTS_QA_ORIGIN || 'http://127.0.0.1:4188/';
const result = { success: false, origin, checkedAt: new Date().toISOString(), errors: [], checks: [], layouts: [] };
fs.mkdirSync(output, { recursive: true });
let browser;
async function openSettings(page) {
  await page.locator('#settings-button').click();
  await page.locator('#settings-library > summary').focus();
  await page.keyboard.press('Enter');
  await page.locator('#dictionary-template-preview').waitFor({ state: 'visible' });
}
async function closeSettings(page) {
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#settings-dialog').evaluate(el => el.open), false);
  assert.equal(await page.locator('#settings-button').evaluate(el => document.activeElement === el), true);
}
async function screenshot(page, name) {
  await page.screenshot({ path: path.join(output, name), fullPage: true });
}
async function fits(page, label) {
  const layout = await page.evaluate(() => {
    const dialog = document.querySelector('#settings-dialog');
    const preview = document.querySelector('.dictionary-template');
    const rect = dialog.getBoundingClientRect();
    return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
      left: rect.left, right: rect.right, dialogWidth: dialog.clientWidth,
      dialogScrollWidth: dialog.scrollWidth, previewHeight: preview.getBoundingClientRect().height };
  });
  result.layouts.push({ label, ...layout });
  assert(layout.scrollWidth <= layout.width, `${label}: document overflow`);
  assert(layout.left >= 0 && layout.right <= layout.width, `${label}: clipped dialog`);
  assert(layout.dialogScrollWidth <= layout.dialogWidth, `${label}: dialog overflow`);
  assert(layout.previewHeight <= 270, `${label}: unbounded preview`);
}
(async () => {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.on('pageerror', error => result.errors.push(error.message));
  await page.goto(origin, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('#home-section [data-action="import-dictionary"]').count(), 0);
  assert.equal(await page.locator('#home-section').getByRole('button', { name: /匯入|模板/ }).count(), 0);
  await screenshot(page, 'home-desktop.png');
  await openSettings(page);
  const preview = JSON.parse(await page.locator('#dictionary-template-preview').textContent());
  const downloadEvent = page.waitForEvent('download');
  await page.locator('#download-dictionary-template').click();
  const download = await downloadEvent;
  const downloaded = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
  assert.deepEqual(downloaded, preview);
  assert.equal(await page.locator('#import-dictionary').getAttribute('aria-describedby'), 'dictionary-import-help dictionary-message');
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('.dictionary-template').evaluate(el => el === document.activeElement), true);
  assert.equal(await page.locator('.dictionary-template').evaluate(el => getComputedStyle(el).outlineStyle), 'solid');
  await fits(page, 'desktop');
  await page.locator('#dictionary-message').scrollIntoViewIfNeeded();
  await screenshot(page, 'settings-desktop.png');
  result.checks.push('Settings owns picker/template/preview; keyboard expansion and focus ring; download matches preview; Escape restores opener focus.');

  const beforeInvalid = await page.evaluate(() => localStorage.getItem('mots.dictionaries.v1'));
  await page.locator('#import-dictionary').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{') });
  await page.waitForFunction(() => document.querySelector('#dictionary-message').textContent.includes('無法讀取 JSON'));
  assert.equal(await page.evaluate(() => localStorage.getItem('mots.dictionaries.v1')), beforeInvalid);
  assert.equal(await page.locator('#import-dictionary').getAttribute('aria-invalid'), 'true');
  assert.equal(await page.locator('#import-dictionary').isEnabled(), true);
  await screenshot(page, 'invalid-file-desktop.png');
  downloaded.title = '我的範例辭典';
  await page.locator('#import-dictionary').setInputFiles({ name: 'my-dictionary.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(downloaded)) });
  await page.waitForFunction(() => document.querySelector('#dictionary-message').textContent.includes('已建立「我的範例辭典」'));
  const importedID = await page.locator('#book-switcher').inputValue();
  await closeSettings(page);
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('#book-switcher').inputValue(), importedID);
  result.checks.push('Malformed file preserves library; retry imports real downloaded template; new book selection/content persist after reload.');

  for (const bookID of ['de', 'ja', 'grammar-fr', 'grammar-theme-fr', 'grammar-theme-ja']) {
    await page.selectOption('#book-switcher', bookID);
    await openSettings(page);
    const sample = JSON.parse(await page.locator('#dictionary-template-preview').textContent());
    assert.equal(sample.language, bookID.split('-').at(-1));
    assert.equal(sample.kind, bookID.startsWith('grammar') ? 'grammar' : 'vocabulary');
    assert.equal(sample.grammarMode, bookID.startsWith('grammar-theme') ? 'thematic' : 'standard');
    if (sample.grammarMode === 'thematic') assert.equal(sample.words[0].subcategory, sample.categories[0].subcategories[0].id);
    await closeSettings(page);
  }
  result.checks.push('Switching languages and ordinary/thematic grammar refreshes valid JSON example, including empty thematic books.');

  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.selectOption('#book-switcher', 'fr');
    await openSettings(page);
    await page.locator('#dictionary-template-label').scrollIntoViewIfNeeded();
    await fits(page, `${width}px light`);
    await screenshot(page, `settings-${width}.png`);
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await fits(page, `${width}px dark reduced motion`);
    await screenshot(page, `settings-${width}-dark.png`);
    await closeSettings(page);
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'no-preference' });
  }
  result.checks.push('320px/390px light/dark and reduced motion preserve readable bounded preview, dialog bounds, scroll access and actions.');
  assert.deepEqual(result.errors, []);
  result.success = true;
})().catch(error => { result.errors.push(error.stack); process.exitCode = 1; }).finally(async () => {
  if (browser) await browser.close();
  fs.writeFileSync(path.join(output, 'browser-result.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
});
