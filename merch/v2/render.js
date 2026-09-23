// Renders merch v2 print files (transparent PNG, 300 dpi) from merch/v2/designs.html.
// Usage: node merch/v2/render.js [id ...]   -> writes merch/v2/print/<id>.png
'use strict';
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { chromium } = require('C:/Users/jake/.gm-connect/node_modules/playwright-core');

const IDS = ['logo-tee-chest', 'logo-tee-back', 'oclock-tee', 'hoodie-chest', 'hoodie-back', 'quarterly-crew',
  'hat-mark', 'hat-mark-gold', 'beanie-wordmark', 'values-poster', 'bottle-wrap', 'apron'];

(async () => {
  const ids = process.argv.slice(2).length ? process.argv.slice(2) : IDS;
  const out = path.join(__dirname, 'print');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge' });
  // CSS inches are 96 px; scale 300/96 gives true 300 dpi pixels.
  const page = await browser.newPage({ viewport: { width: 1800, height: 2400 }, deviceScaleFactor: 300 / 96 });
  const url = pathToFileURL(path.join(__dirname, 'designs.html')).href;
  for (const id of ids) {
    await page.goto(url + '#' + id);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    const el = page.locator('#' + id);
    await el.screenshot({ path: path.join(out, id + '.png'), omitBackground: true });
    const box = await el.boundingBox();
    console.log('wrote', id, Math.round(box.width * 300 / 96) + 'x' + Math.round(box.height * 300 / 96));
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
