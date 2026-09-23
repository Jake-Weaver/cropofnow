// Renders an HTML file in brand/ to PDF (+ optional page PNGs for checking). Usage: node pdf.js <file.html> <out.pdf> [pngPrefix]
const path = require('path'), { pathToFileURL } = require('url');
const { chromium } = require('C:/Users/jake/.gm-connect/node_modules/playwright-core');
(async () => {
  const [src, out, pngs] = process.argv.slice(2);
  const b = await chromium.launch({ channel: 'msedge' });
  const p = await b.newPage({ viewport: { width: 816, height: 1056 } });
  await p.goto(pathToFileURL(path.resolve(src)).href, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: out, width: '8.5in', height: '11in', printBackground: true, preferCSSPageSize: true });
  if (pngs) { await p.emulateMedia({ media: 'print' });
    const n = await p.locator('.page').count();
    for (let i = 0; i < n; i++) await p.locator('.page').nth(i).screenshot({ path: `${pngs}-${String(i + 1).padStart(2, '0')}.png` }); }
  await b.close(); console.log('ok');
})().catch(e => { console.error(e); process.exit(1); });
