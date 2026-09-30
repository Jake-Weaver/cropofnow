// Renders the Crop Tops print files (transparent PNG, 300 dpi) from merch/croptops/designs.html,
// then garment mockups (mockups/<id>.png) from mockup.html.
// Usage: node merch/croptops/render.js [id ...]
'use strict';
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { chromium } = require('C:/Users/jake/.gm-connect/node_modules/playwright-core');

const IDS = ['top-crop', 'cream-of-the-crop', 'high-yield', 'shell-company', 'deep-cover', 'extra-crunchy'];

(async () => {
  const ids = process.argv.slice(2).length ? process.argv.slice(2) : IDS;
  const out = path.join(__dirname, 'print');
  const mock = path.join(__dirname, 'mockups');
  fs.mkdirSync(out, { recursive: true });
  fs.mkdirSync(mock, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge' });
  // CSS inches are 96 px; scale 300/96 gives true 300 dpi pixels.
  const page = await browser.newPage({ viewport: { width: 1200, height: 1000 }, deviceScaleFactor: 300 / 96 });
  const url = pathToFileURL(path.join(__dirname, 'designs.html')).href;
  for (const id of ids) {
    await page.goto(url + '#' + id);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    const el = page.locator('#' + id);
    await el.screenshot({ path: path.join(out, id + '.png'), omitBackground: true });
    const box = await el.boundingBox();
    console.log('wrote print', id, Math.round(box.width * 300 / 96) + 'x' + Math.round(box.height * 300 / 96));
  }
  const mp = await browser.newPage({ viewport: { width: 1000, height: 760 }, deviceScaleFactor: 1.2 });
  const murl = pathToFileURL(path.join(__dirname, 'mockup.html')).href;
  for (const id of ids) {
    await mp.goto(murl + '?' + id);
    await mp.waitForFunction(() => document.body.dataset.ready === '1');
    await mp.locator('#stage').screenshot({ path: path.join(mock, id + '.png') });
    console.log('wrote mockup', id);
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
