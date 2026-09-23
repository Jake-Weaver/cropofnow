// Builds the Crop of Now logo suite: outlined-text SVGs (no font needed to open them) + transparent PNGs.
// Usage: node brand/build/logos.js   -> writes brand/logo/{svg,png}/*
'use strict';
const fs = require('fs');
const path = require('path');
const opentype = require('C:/Users/jake/.cropofnow-brand-build/node_modules/opentype.js');
const { chromium } = require('C:/Users/jake/.gm-connect/node_modules/playwright-core');

const ROOT = path.join(__dirname, '..');
const load = p => { const b = fs.readFileSync(p); return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.length)); };
const F = n => load(path.join(ROOT, 'fonts', 'static', n + '.ttf'));
const plexPath = path.join(ROOT, 'fonts', 'IBMPlexMono-SemiBold.ttf');
const font = {
  black: F('Archivo-ExpandedBlack'),
  italic: F('Fraunces-SemiBoldItalic'),
  mono: load(plexPath),
};

const COLOR = { gold: '#D9973F', navy: '#1C2733', cream: '#F6F0E4', white: '#FFFFFF', black: '#000000' };

// Text -> outlined path. tracking is in em.
function text(f, str, size, x, y, tracking = 0) {
  let d = '', cx = x;
  const glyphs = [...str].map(ch => f.charToGlyph(ch));
  glyphs.forEach((g, i) => {
    d += g.getPath(cx, y, size).toPathData(2);
    cx += g.advanceWidth / f.unitsPerEm * size;
    if (i < glyphs.length - 1) cx += (f.getKerningValue(g, glyphs[i + 1]) / f.unitsPerEm) * size + tracking * size;
  });
  return { d, width: cx - x };
}
const width = (f, s, size, tr = 0) => text(f, s, size, 0, 0, tr).width;
const capH = (f, size) => (f.tables.os2.sCapHeight || f.unitsPerEm * 0.7) / f.unitsPerEm * size;

// --- The mark: the site-favicon peanut (assets/favicon.svg), tipped 24°: shaded shell, a highlight, shell dimples.
// Drawn in the favicon's 64-unit space, then centred in a 100x100 box.
const FAV_SHELL = 'M32 4C41 4 47 10.5 47 19c0 6-4.2 9-4.2 13s5.2 7 5.2 13.5C48 54.5 41 61 32 61s-16-6.5-16-15.5C16 39 21.2 36 21.2 32S17 25 17 19C17 10.5 23 4 32 4Z';
const DOTS = [[31, 11, 1.7], [38, 16, 1.7], [30, 21, 1.7], [37, 25, 1.5], [27, 40, 1.7], [34, 37, 1.7], [40, 44, 1.7], [24, 49, 1.7], [32, 47, 1.7], [38, 53, 1.5], [29, 55, 1.7]]
  ;
const dots = (skip = () => false) => DOTS.filter(d => !skip(d)).map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('');
const FAV_DOTS = dots();
const SHADE = { base: '#B7762B', face: '#D9973F', hi: '#F2C27A', dot: '#A8661F' };  // tints of Peanut Gold, used only inside the mark
const place = (x, y, s, inner) => `<g transform="translate(${x} ${y}) scale(${s})"><g transform="translate(50 50) rotate(-24) scale(1.45) translate(-32 -32.5)">${inner}</g></g>`;
const uid = p => p + Math.random().toString(36).slice(2, 7);
function mark(x = 0, y = 0, s = 1, extra = '', dotSet = FAV_DOTS) {
  const c = uid('c');
  return place(x, y, s, `<defs><clipPath id="${c}"><path d="${FAV_SHELL}"/></clipPath></defs><path d="${FAV_SHELL}" fill="${SHADE.base}"/>
    <g clip-path="url(#${c})"><path d="${FAV_SHELL}" fill="${SHADE.face}" transform="translate(-3.5 -1)"/>
    <ellipse cx="24" cy="15" rx="2.8" ry="5.5" fill="${SHADE.hi}" transform="rotate(14 24 15)"/><g fill="${SHADE.dot}">${dotSet}</g>${extra}</g>`);
}
// One-colour mark: the dimples are knocked out (real holes), so it prints in a single ink on any ground.
function markKnockout(fill, x = 0, y = 0, s = 1) {
  const m = uid('k');
  return place(x, y, s, `<defs><mask id="${m}" maskUnits="userSpaceOnUse" x="-20" y="-20" width="104" height="104"><rect x="-20" y="-20" width="104" height="104" fill="#fff"/><g fill="#000">${FAV_DOTS}</g></mask></defs>
    <path d="${FAV_SHELL}" fill="${fill}" mask="url(#${m})"/>`);
}
// Special mark for the "peanut o'clock" tee only: the same peanut with clock hands on the lower lobe.
const oclock = hands => mark(0, 0, 1, `<g stroke="${hands}" stroke-width="2.6" stroke-linecap="round"><line x1="32" y1="45" x2="32" y2="37"/><line x1="32" y1="45" x2="37.5" y2="48"/></g><circle cx="32" cy="45" r="2" fill="${hands}"/>`,
  dots(([x, y]) => Math.hypot(x - 32, y - 45) < 9));

// --- Wordmark: CROP of NOW  (Archivo Expanded Black + Fraunces italic "of")
function wordmark(ink, accent, x, y, size) {
  const sp = size * 0.22;
  const a = text(font.black, 'CROP', size, x, y, 0.01);
  const b = text(font.italic, 'of', size * 1.08, x + a.width + sp, y, 0);
  const c = text(font.black, 'NOW', size, x + a.width + sp + b.width + sp, y, 0.01);
  return { svg: `<path d="${a.d}" fill="${ink}"/><path d="${b.d}" fill="${accent}"/><path d="${c.d}" fill="${ink}"/>`, width: a.width + b.width + c.width + 2 * sp };
}

const svg = (w, h, body, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(1)} ${h.toFixed(1)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}">${bg ? `<rect width="100%" height="100%" fill="${bg}"/>` : ''}${body}</svg>`;

// Colourways: [name, peanut, hands, wordmark ink, "of" accent, tagline, preview bg]
const WAYS = {
  'full-color': [COLOR.gold, COLOR.navy, COLOR.navy, COLOR.gold, COLOR.navy, COLOR.cream],
  'reverse': [COLOR.gold, COLOR.navy, COLOR.cream, COLOR.gold, COLOR.cream, COLOR.navy],
  'navy': [COLOR.navy, null, COLOR.navy, COLOR.navy, COLOR.navy, COLOR.cream],
  'white': [COLOR.white, null, COLOR.white, COLOR.white, COLOR.white, COLOR.navy],
  'black': [COLOR.black, null, COLOR.black, COLOR.black, COLOR.black, COLOR.white],
  'gold': [COLOR.gold, null, COLOR.gold, COLOR.gold, COLOR.gold, COLOR.navy],
};
const M = (way, x, y, s) => { const [p, h] = WAYS[way]; return h ? mark(x, y, s) : markKnockout(p, x, y, s); };

const out = {};
for (const way of Object.keys(WAYS)) {
  const [, , ink, acc, tag] = WAYS[way];
  // Mark alone (square)
  out[`mark-${way}`] = svg(100, 100, M(way, 0, 0, 1));

  // Horizontal lockup: mark left, wordmark right
  {
    const size = 100, wm = wordmark(ink, acc, 0, 0, size);
    const mh = 230, gap = 20, ch = capH(font.black, size);
    const W = mh + gap + wm.width, H = mh;
    const body = M(way, 0, 0, mh / 100) + `<g transform="translate(${mh + gap} ${(H + ch) / 2})">${wordmark(ink, acc, 0, 0, size).svg}</g>`;
    out[`lockup-horizontal-${way}`] = svg(W, H, body);
  }
  // Stacked lockup: mark over wordmark over tagline
  {
    const size = 100, wmW = wordmark(ink, acc, 0, 0, size).width;
    const tagSize = 30, tagStr = 'PEANUTS ARE THE CROP OF NOW', tagTr = 0.16;
    const tagW = width(font.mono, tagStr, tagSize, tagTr);
    const W = Math.max(wmW, tagW), mh = 240;
    const wmY = mh + 40 + capH(font.black, size), tagY = wmY + 70;
    const body = M(way, (W - mh) / 2, 0, mh / 100) +
      `<g transform="translate(${(W - wmW) / 2} ${wmY})">${wordmark(ink, acc, 0, 0, size).svg}</g>` +
      `<path d="${text(font.mono, tagStr, tagSize, (W - tagW) / 2, tagY, tagTr).d}" fill="${tag}"/>`;
    out[`lockup-stacked-${way}`] = svg(W, tagY + 8, body);
  }
  // Seal: mark in a ring; name arched over the top, division + year reading upright along the bottom
  {
    const R = 500, band = R - 110;
    const G = ch => font.mono.charToGlyph(ch);
    const arc = (str, bottom, tsize, tr) => {
      const gl = [...str].map(G), adv = gl.map(g => g.advanceWidth / font.mono.unitsPerEm * tsize + tr * tsize);
      const span = (adv.reduce((a, b) => a + b, 0) - tr * tsize) / band * 180 / Math.PI;
      const ch = capH(font.mono, tsize);
      let a = bottom ? 90 + span / 2 : -90 - span / 2, o = '';
      gl.forEach((g, i) => {
        const gw = g.advanceWidth / font.mono.unitsPerEm * tsize, step = adv[i] / band * 180 / Math.PI;
        const mid = bottom ? a - (gw / 2) / band * 180 / Math.PI : a + (gw / 2) / band * 180 / Math.PI;
        const t = bottom
          ? `rotate(${(mid - 90).toFixed(3)} ${R} ${R}) translate(${R - gw / 2} ${R + band + ch / 2})`
          : `rotate(${(mid + 90).toFixed(3)} ${R} ${R}) translate(${R - gw / 2} ${R - band + ch / 2})`;
        o += `<path transform="${t}" d="${g.getPath(0, 0, tsize).toPathData(2)}"/>`;
        a += bottom ? -step : step;
      });
      return o;
    };
    const ringColor = way === 'full-color' ? COLOR.navy : ink;
    const dot = way === 'full-color' || way === 'reverse' ? COLOR.gold : ink;  // one-ink seals keep a single color
    const body = `<circle cx="${R}" cy="${R}" r="${R - 10}" fill="none" stroke="${ringColor}" stroke-width="16"/>` +
      `<circle cx="${R}" cy="${R}" r="${R - 210}" fill="none" stroke="${ringColor}" stroke-width="7"/>` +
      `<g fill="${ringColor}">${arc('CROP OF NOW', false, 80, 0.3)}${arc('EST. 2026', true, 80, 0.3)}</g>` +
      `<circle cx="${R - band}" cy="${R}" r="13" fill="${dot}"/><circle cx="${R + band}" cy="${R}" r="13" fill="${dot}"/>` +
      M(way, R - 262, R - 262, 5.24);
    out[`seal-${way}`] = svg(2 * R, 2 * R, body);
  }
  // Wordmark alone
  {
    const size = 100, wm = wordmark(ink, acc, 0, 0, size), ch = capH(font.black, size);
    out[`wordmark-${way}`] = svg(wm.width, ch + 2, `<g transform="translate(0 ${ch + 1})">${wm.svg}</g>`);
  }
}

out['special-oclock-full-color'] = svg(100, 100, oclock(COLOR.navy));

(async () => {
  const dirSvg = path.join(ROOT, 'logo', 'svg'), dirPng = path.join(ROOT, 'logo', 'png');
  fs.mkdirSync(dirSvg, { recursive: true }); fs.mkdirSync(dirPng, { recursive: true });
  for (const [n, s] of Object.entries(out)) fs.writeFileSync(path.join(dirSvg, n + '.svg'), s);
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage();
  for (const [n, s] of Object.entries(out)) {
    const [, w, h] = s.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).map(Number);
    const target = n.startsWith('wordmark') || n.includes('horizontal') ? 3000 : 2400;  // px on the long side
    const k = target / Math.max(w, h), W = Math.ceil(w * k), H = Math.ceil(h * k);
    await page.setViewportSize({ width: W, height: H });
    await page.setContent(`<html><body style="margin:0;background:transparent">${s.replace(/width="\d+" height="\d+"/, `width="${W}" height="${H}"`)}</body></html>`);
    await page.locator('svg').screenshot({ path: path.join(dirPng, n + '.png'), omitBackground: true });
  }
  await browser.close();
  console.log('wrote', Object.keys(out).length, 'logos');
})().catch(e => { console.error(e); process.exit(1); });
