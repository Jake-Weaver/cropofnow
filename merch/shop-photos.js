// Shop-page product photos from Printful mockup packs (Printful: My products -> ⋮ -> Download mockups -> Download all).
// Usage: node merch/shop-photos.js <map.json>   map: { "out-name": "path/to/mockup.png", ... }
//  -> assets/img/products/<out-name>.jpg (800 px square, JPEG q0.84)
'use strict';
const fs = require('fs'), path = require('path');
const { chromium } = require('C:/Users/jake/.gm-connect/node_modules/playwright-core');
const map = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const out = path.join(__dirname, '..', 'assets', 'img', 'products');
fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch({ channel: 'msedge' }); const p = await b.newPage();
  for (const [name, src] of Object.entries(map)) {
    const b64 = fs.readFileSync(src).toString('base64');
    const mime = /\.jpe?g$/i.test(src) ? 'image/jpeg' : 'image/png';
    const jpg = await p.evaluate(async ([b64, mime]) => {
      const img = new Image(); img.src = 'data:' + mime + ';base64,' + b64; await img.decode();
      const s = Math.min(img.naturalWidth, img.naturalHeight), c = document.createElement('canvas'); c.width = c.height = 800;
      const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 800, 800); g.imageSmoothingQuality = 'high';
      g.drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, 800, 800);
      return c.toDataURL('image/jpeg', 0.84).split(',')[1];
    }, [b64, mime]);
    fs.writeFileSync(path.join(out, name + '.jpg'), Buffer.from(jpg, 'base64'));
    console.log(name, Math.round(Buffer.from(jpg, 'base64').length / 1024) + ' KB');
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
