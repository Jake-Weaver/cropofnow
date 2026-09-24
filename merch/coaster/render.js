// Renders the coaster print files: node merch/coaster/render.js
//  -> print/coaster-front.png, print/coaster-back.png (1238 px round incl. 1/16" bleed, 300 dpi, transparent outside the circle)
//  -> Crop-of-Now-Coaster-Proof.pdf (both sides at actual size with trim/safe guides, for Jake and the printer)
'use strict';
const fs = require('fs'), path = require('path'), { pathToFileURL } = require('url');
const { chromium } = require('C:/Users/jake/.gm-connect/node_modules/playwright-core');
const QR = require('C:/Users/jake/.cropofnow-brand-build/node_modules/qrcode-svg');

const URL_ = 'https://cropofnow.com/what';
const dir = __dirname, out = path.join(dir, 'print');
fs.mkdirSync(out, { recursive: true });

// Inline the QR (navy modules on the cream tile) into a working copy of the page.
const qr = new QR({ content: URL_, padding: 0, width: 246, height: 246, color: '#1C2733', background: '#F6F0E4', ecl: 'M', join: true })
  .svg().replace(/<\?xml[^>]*>/, '').replace(/width="246" height="246"/, 'viewBox="0 0 246 246"');
const src = fs.readFileSync(path.join(dir, 'coaster.html'), 'utf8').replace('<!--QR-->', qr);
const tmp = path.join(dir, '_build.html'); fs.writeFileSync(tmp, src);

(async () => {
  const b = await chromium.launch({ channel: 'msedge' });
  const p = await b.newPage({ viewport: { width: 1238, height: 1238 } });
  for (const side of ['front', 'back']) {
    await p.goto(pathToFileURL(tmp).href + '#' + side); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
    // clip to the circle so the file is a true round die-cut shape
    await p.evaluate(s => { document.getElementById(s).style.clipPath = 'circle(50%)'; }, side);
    await p.locator('#' + side).screenshot({ path: path.join(out, `coaster-${side}.png`), omitBackground: true });
    console.log('wrote', side);
  }
  // Proof PDF: both sides at actual size on letter paper, trim (solid) and safe (dashed) lines.
  const img = s => 'data:image/png;base64,' + fs.readFileSync(path.join(out, `coaster-${s}.png`)).toString('base64');
  const proof = `<html><head><link rel="stylesheet" href="${pathToFileURL(path.join(dir, '../../brand/brand-tokens.css')).href}"><style>
    @page { size: 8.5in 11in; margin: 0 } body { margin: 0; font-family: var(--con-mono); color: #1C2733; background: #FFFBF3 }
    .pg { width: 8.5in; height: 11in; padding: .6in; box-sizing: border-box; position: relative }
    h1 { font: 900 26px var(--con-display); font-stretch: 125%; text-transform: uppercase; margin: 0 0 4px }
    p { font: 11px/1.5 var(--con-mono); margin: 0 0 4px; letter-spacing: .04em }
    .c { position: absolute; width: 4.125in; height: 4.125in; left: 2.1875in } .c img { width: 100%; height: 100% }
    .c::before, .c::after { content: ''; position: absolute; border-radius: 50%; }
    .c::before { inset: .0625in; border: 1px solid #000 } .c::after { inset: .25in; border: 1px dashed #d0008a }
    .lab { position: absolute; left: .6in; font: 600 11px var(--con-mono); letter-spacing: .16em; text-transform: uppercase }
  </style></head><body><div class="pg">
    <h1>Crop of Now coaster · proof</h1>
    <p>4 in round · 300 dpi · CMYK-safe brand colors · 1/16 in bleed. Solid line = trim. Dashed = keep text inside.</p>
    <p>QR code goes to ${URL_} (tested before print).</p>
    <div class="lab" style="top:2.2in">Front</div><div class="c" style="top:1.9in"><img src="${img('front')}"></div>
    <div class="lab" style="top:6.55in">Back</div><div class="c" style="top:6.25in"><img src="${img('back')}"></div>
  </div></body></html>`;
  const pt = path.join(dir, '_proof.html'); fs.writeFileSync(pt, proof);
  await p.goto(pathToFileURL(pt).href); await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: path.join(dir, 'Crop-of-Now-Coaster-Proof.pdf'), width: '8.5in', height: '11in', printBackground: true });
  await b.close();
  fs.rmSync(tmp); fs.rmSync(pt);
  console.log('wrote proof PDF');
})().catch(e => { console.error(e); process.exit(1); });
