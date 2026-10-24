const { chromium } = require('/Users/zhangfei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

// Read-only production smoke check in a fresh, temporary browser context.
// No account, pairing, import, rating, deletion or real browser profile is used.
const origin = 'https://mots.feizhang233.com/';
const output = path.join(__dirname, 'production-verification');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const result = {
    success: false,
    origin,
    checkedAt: new Date().toISOString(),
    timezone: 'Europe/Belgrade',
    isolatedContext: true,
    pageErrors: [],
    consoleErrors: [],
    failedResponses: [],
    blockedRequests: [],
    checks: [],
  };
  fs.mkdirSync(output, { recursive: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.route('**/*', async (route) => {
      const request = route.request();
      if (!['GET', 'HEAD'].includes(request.method()) || request.url().includes('/api/sync/')) {
        result.blockedRequests.push({ method: request.method(), url: request.url() });
        return route.abort();
      }
      await route.continue();
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => result.pageErrors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') result.consoleErrors.push(message.text());
    });
    page.on('response', (response) => {
      if (response.status() >= 400)
        result.failedResponses.push({ status: response.status(), url: response.url() });
    });

    const response = await page.goto(`${origin}?dict=grammar-ja&screen=study&view=list`, {
      waitUntil: 'networkidle',
    });
    assert.equal(response.status(), 200);
    await page.waitForSelector('.word-row');
    assert.equal(await page.locator('#book-switcher option').count(), 9);
    assert.equal(await page.locator('.word-row').count(), 6);
    assert.equal(await page.locator('[data-grammar-group]').count(), 0);
    assert.equal(await page.locator('#grammar-grouping').count(), 0);
    assert.ok(await page.locator('#category-nav [data-sub]').count() > 0);
    await page.locator('#category-nav [data-category="g1"]').click();
    assert.equal(await page.locator('#category-nav [data-sub="g1.01"]').isVisible(), true);
    assert.equal(await page.locator('.word-row').count(), 2);
    await page.screenshot({ path: path.join(output, 'ordinary-japanese-list.png') });
    result.checks.push('Ordinary Japanese grammar retains six entries, independent rows and two-level navigation');
    await page.click('#card-view');
    assert.equal(await page.locator('.flashcard').count(), 1);
    assert.equal(await page.locator('[data-grammar-group]').count(), 0);
    result.checks.push('Ordinary card mode presents one individual entry');
    await page.click('#list-view');

    for (const language of ['fr', 'de', 'ja']) {
      const id = `grammar-theme-${language}`;
      await page.selectOption('#book-switcher', id);
      assert.equal(await page.inputValue('#book-switcher'), id);
      assert.equal(await page.inputValue('#dictionary-switcher'), id);
      assert.equal(await page.locator('.word-row').count(), 0);
      assert.equal(await page.locator('[data-grammar-group]').count(), 0);
      assert.equal(await page.locator('#category-nav [data-sub]').count(), 0);
      assert.ok((await page.locator('.empty-state').textContent()).includes('尚未加入內容'));
      assert.equal(await page.locator('#study-content [data-action="import-dictionary"]').isVisible(), true);
      await page.screenshot({ path: path.join(output, `empty-thematic-${language}.png`) });
      result.checks.push(`${id} is independently selectable, empty and offers the import entry point`);
    }
    assert.deepEqual(result.blockedRequests, []);
    assert.deepEqual(result.pageErrors, []);
    assert.deepEqual(result.consoleErrors, []);
    assert.deepEqual(result.failedResponses, []);
    result.success = true;
    console.log('Production read-only grammar book verification passed.');
  } catch (error) {
    result.failure = error.stack || String(error);
    throw error;
  } finally {
    fs.writeFileSync(path.join(output, 'result.json'), JSON.stringify(result, null, 2));
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
