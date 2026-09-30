// Writes the shop-page preview images (assets/img/products/abt-*.jpg, 800x800) from mockup.html.
// Swap these for Printful mockups once the products exist in the store.
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('C:/Users/jake/.gm-connect/node_modules/playwright-core');
const IDS = ['abt-tee', 'abt-hoodie', 'abt-crop', 'abt-mug', 'abt-sticker', 'abt-cap'];
(async () => {
  const b = await chromium.launch({ channel: 'msedge' }); const p = await b.newPage({ viewport: { width: 900, height: 900 } });
  for (const id of IDS) {
    await p.goto(pathToFileURL(path.join(__dirname, 'mockup.html')).href + '?' + id); await p.waitForTimeout(800);
    await p.evaluate(() => document.querySelectorAll('.t span').forEach(s => s.remove()));
    await p.locator('.t').first().screenshot({ path: path.join(__dirname, '../../assets/img/products', id + '.jpg'), type: 'jpeg', quality: 85 });
    console.log('tile', id);
  }
  await b.close();
})();
