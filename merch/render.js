// Renders print-ready PNGs (transparent background) for Printful from merch/designs.html.
// Usage: node merch/render.js   -> writes merch/print/*.png
'use strict';
const path = require('path');
const fs = require('fs');
const { chromium } = require('C:/Users/jake/.gm-connect/node_modules/playwright-core');

// id, width, height (px at 300 dpi)
const FILES = [
  ['tee-pro-peanut', 3600, 2400],   // 12" x 8" on a dark tee
  ['tee-legume', 3600, 2400],       // 12" x 8" on a light tee
  ['mug-gallons', 2700, 1050],      // 11 oz mug full wrap (9" x 3.5")
  ['sticker-crop', 1200, 1200],     // 4" round sticker
  ['cap-crop', 1590, 600],          // embroidery front (5.3" x 2")
  ['tote-almond', 3600, 3600],      // 12" x 12"
  ['peanut-mark', 3000, 3000],      // brand mark for Printful branding/packing slips
];

(async () => {
  const out = path.join(__dirname, 'print');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage();
  const html = 'file:///' + path.join(__dirname, 'designs.html').replace(/\\/g, '/');
  for (const [id, w, h] of FILES) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(html + '#' + id);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(800);
    const el = page.locator('#' + id);
    await el.screenshot({ path: path.join(out, id + '.png'), omitBackground: true });
    console.log('wrote', id, w + 'x' + h);
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
