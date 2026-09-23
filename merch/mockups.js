// Rebuilds the shop-page mockups (assets/mock/*.svg): a flat garment outline with a small copy of the real print file
// embedded (data URI, since an SVG shown via <img> can't load external images). Usage: node merch/mockups.js
'use strict';
const fs = require('fs'), path = require('path');
const { chromium } = require('C:/Users/jake/.gm-connect/node_modules/playwright-core');
const ROOT = path.join(__dirname, '..');
const TEE = 'M130 40 L88 56 L28 112 L70 162 L104 138 L104 372 L296 372 L296 138 L330 162 L372 112 L312 56 L270 40 C255 64 230 76 200 76 C170 76 145 64 130 40 Z';
// name, print file, crop [x,y,w,h] in file px (null = whole), placement [x,y,w] in the 400 box, output px width, garment
const M = [
  ['tee-pro-peanut', 'tee-pro-peanut-b2.png', null, [110, 140, 180], 600, `<path d="${TEE}" fill="#1C2733"/>`],
  ['tee-legume', 'tee-legume-b2.png', null, [110, 150, 180], 600, `<path d="${TEE}" fill="#F6F0E4" stroke="#C9B89A" stroke-width="2"/>`],
  ['mug-gallons', 'mug-gallons-b2.png', [0, 0, 1350, 1050], [112, 132, 166], 500,
    `<path d="M290 150 h30 a45 45 0 0 1 0 110 h-30" fill="none" stroke="#FFFBF3" stroke-width="22"/><rect x="90" y="100" width="210" height="220" rx="14" fill="#FFFBF3"/><ellipse cx="195" cy="100" rx="105" ry="12" fill="#E9E0D0"/>`],
  ['sticker-crop', 'sticker-crop-b2.png', null, [50, 50, 300], 420, ''],
  ['cap-crop', 'cap-crop-b2.png', null, [128, 172, 144], 500,
    `<path d="M80 250 C80 140 140 95 200 95 C260 95 320 140 320 250 Z" fill="#1C2733"/><path d="M60 250 H340 C360 250 370 275 340 282 H120 C80 282 55 265 60 250 Z" fill="#141C26"/><circle cx="200" cy="97" r="8" fill="#141C26"/>`],
  ['tote-almond', 'tote-almond-b2.png', [300, 900, 3000, 2500], [104, 150, 192], 600,
    `<path d="M150 130 C150 60 250 60 250 130" fill="none" stroke="#C9B89A" stroke-width="12"/><rect x="90" y="125" width="220" height="250" fill="#F2E6CF" stroke="#C9B89A" stroke-width="2"/>`],
];
(async () => {
  const b = await chromium.launch({ channel: 'msedge' }); const p = await b.newPage();
  for (const [name, file, crop, [x, y, w], outW, garment] of M) {
    const src = fs.readFileSync(path.join(ROOT, 'merch', 'print', file)).toString('base64');
    const { uri, ratio } = await p.evaluate(async ({ src, crop, outW }) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + src; await img.decode();
      const [cx, cy, cw, ch] = crop || [0, 0, img.naturalWidth, img.naturalHeight];
      const c = document.createElement('canvas'); c.width = outW; c.height = Math.round(outW * ch / cw);
      const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(img, cx, cy, cw, ch, 0, 0, c.width, c.height);
      return { uri: c.toDataURL('image/png'), ratio: ch / cw };
    }, { src, crop, outW });
    const h = +(w * ratio).toFixed(1);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">${garment}<image x="${x}" y="${y}" width="${w}" height="${h}" href="${uri}"/></svg>\n`;
    fs.writeFileSync(path.join(ROOT, 'assets', 'mock', name + '.svg'), svg);
    console.log(name, Math.round(svg.length / 1024) + ' KB');
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
