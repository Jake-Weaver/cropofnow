// Renders the "I Don't Do Almond Butter" print files (transparent PNG, 300 dpi) from designs.html.
// Usage: node merch/almond-butter/render.js [id ...]
'use strict';
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { chromium } = require('C:/Users/jake/.gm-connect/node_modules/playwright-core');

const IDS = ['abt-tee', 'abt-hoodie', 'abt-crop', 'abt-mug', 'abt-sticker', 'abt-cap'];

(async () => {
  const ids = process.argv.slice(2).length ? process.argv.slice(2) : IDS;
  const out = path.join(__dirname, 'print');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge' });
  // Designs are authored in 300-dpi px, so render at scale 1.
  const page = await browser.newPage({ viewport: { width: 3800, height: 3000 } });
  const url = pathToFileURL(path.join(__dirname, 'designs.html')).href;
  for (const id of ids) {
    await page.goto(url + '#' + id);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    await page.locator('#' + id).screenshot({ path: path.join(out, id + '.png'), omitBackground: true });
    console.log('wrote', id);
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
