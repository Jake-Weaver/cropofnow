// Logo concept round (v2): five alternative marks for Jake to pick from.
// Usage: node brand/build/concepts.js  -> brand/concepts/{concepts.html, Crop-of-Now-Logo-Concepts.pdf, png/*.png}
'use strict';
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('C:/Users/jake/.gm-connect/node_modules/playwright-core');
const { peanutPath } = require('./geom');
const opentype = require('C:/Users/jake/.cropofnow-brand-build/node_modules/opentype.js');
const ROUND = +(process.argv[2] || 1);

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'concepts');
const C = { gold: '#D9973F', goldDk: '#A96E24', navy: '#1C2733', navyLt: '#2A3A4C', cream: '#F6F0E4', green: '#2F6B3A' };
const NUT = peanutPath({ c1: [50, 30], r1: 21, c2: [50, 69], r2: 23, rf: 22 }); // same peanut as brand v1, 100x100 box
const f = n => +n.toFixed(2);
let uid = 0; const id = p => `${p}${++uid}`;

// Peanut placed with its centre at (x, y), height h, rotated deg.
const nut = (x, y, h, fill, deg = 0, extra = '') =>
  `<path d="${NUT}" fill="${fill}" ${extra} transform="translate(${f(x)} ${f(y)}) rotate(${deg}) scale(${f(h / 83)}) translate(-50 -50.5)"/>`;
const star = (x, y, r, fill) => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.4 : r;
    d += (i ? 'L' : 'M') + f(x + rr * Math.cos(a)) + ' ' + f(y + rr * Math.sin(a));
  }
  return `<path d="${d}Z" fill="${fill}"/>`;
};
// Text on a circle: top reads over the arc, bottom reads upright along the underside.
function ringText(cx, cy, r, top, bottom, ink, size, spacing, family = 'Plex', weight = 600) {
  const t = id('t'), b = id('b');
  return `<defs><path id="${t}" d="M${cx - r} ${cy}A${r} ${r} 0 0 1 ${cx + r} ${cy}"/><path id="${b}" d="M${cx - r} ${cy}A${r} ${r} 0 0 0 ${cx + r} ${cy}"/></defs>
  <g fill="${ink}" font-family="${family}" font-weight="${weight}" font-size="${size}" letter-spacing="${spacing}" dominant-baseline="central" text-anchor="middle">
    <text><textPath href="#${t}" startOffset="50%">${top}</textPath></text>
    <text><textPath href="#${b}" startOffset="50%">${bottom}</textPath></text></g>`;
}

// 1 — THE AGENCY (covert): 16-point compass star behind a peanut roundel, field-ops ring text.
function agency(bg, ink, accent, mono = false) {
  const cx = 200, cy = 200;
  let rose = '';
  const pts = [[0, 128], [45, 82], [22.5, 58]];
  for (let k = 0; k < 16; k++) {
    const deg = k * 22.5, L = k % 4 === 0 ? 128 : k % 2 === 0 ? 82 : 58, w = L * 0.16;
    const g = `rotate(${deg} ${cx} ${cy})`;
    rose += `<g transform="${g}"><path d="M${cx} ${cy}L${cx - w} ${cy - w * 1.2}L${cx} ${cy - L}Z" fill="${accent}"/><path d="M${cx} ${cy}L${cx + w} ${cy - w * 1.2}L${cx} ${cy - L}Z" fill="${mono ? accent : C.goldDk}"/></g>`;
  }
  void pts;
  return `<svg viewBox="0 0 400 400"><circle cx="200" cy="200" r="197" fill="${bg}"/>
  <circle cx="200" cy="200" r="189" fill="none" stroke="${ink}" stroke-width="4"/>
  <circle cx="200" cy="200" r="143" fill="none" stroke="${ink}" stroke-width="2.5"/>
  ${ringText(cx, cy, 166, 'CROP OF NOW', 'FIELD OPERATIONS', ink, 25, 5)}
  ${star(34, 200, 8, accent)}${star(366, 200, 8, accent)}
  ${rose}
  <circle cx="200" cy="200" r="40" fill="${bg}" stroke="${ink}" stroke-width="3.5"/>
  ${nut(200, 200, 56, accent, -24)}</svg>`;
}

// 2 — THE OFFICE (presidential): arc of 13 stars, upright peanut, laurel of peanut leaves, motto ribbon.
function office(bg, ink, accent, mono = false) {
  const cx = 200, cy = 200;
  let stars = '';
  for (let i = 0; i < 13; i++) {
    const a = (-162 + i * (144 / 12)) * Math.PI / 180;
    stars += star(cx + 104 * Math.cos(a), 206 + 104 * Math.sin(a), 6.2, accent);
  }
  let laurel = '';
  for (const s of [-1, 1]) {
    const P0 = [cx + s * 14, 292], P1 = [cx + s * 104, 288], P2 = [cx + s * 86, 172];
    const Q = t => [0, 1].map(i => (1 - t) ** 2 * P0[i] + 2 * (1 - t) * t * P1[i] + t * t * P2[i]);
    const D = t => [0, 1].map(i => 2 * (1 - t) * (P1[i] - P0[i]) + 2 * t * (P2[i] - P1[i]));
    laurel += `<path d="M${P0}Q${P1} ${P2}" fill="none" stroke="${accent}" stroke-width="3" stroke-linecap="round"/>`;
    for (let t = 0.2; t <= 1.001; t += 0.1) {
      const [x, y] = Q(t), [dx, dy] = D(t), ang = Math.atan2(dy, dx) * 180 / Math.PI;
      for (const side of [-1, 1]) laurel += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="10.5" ry="4.4" fill="${accent}" transform="rotate(${f(ang + side * 38)} ${f(x)} ${f(y)}) translate(9 0)"/>`;
    }
    const [ex, ey] = Q(1), [dx, dy] = D(1);
    laurel += `<ellipse cx="${f(ex)}" cy="${f(ey)}" rx="10" ry="4.4" fill="${accent}" transform="rotate(${f(Math.atan2(dy, dx) * 180 / Math.PI)} ${f(ex)} ${f(ey)}) translate(9 0)"/>`;
  }
  const rib = mono ? bg : C.cream, ribInk = mono ? accent : C.navy;
  return `<svg viewBox="0 0 400 400"><circle cx="200" cy="200" r="197" fill="${bg}"/>
  <circle cx="200" cy="200" r="190" fill="none" stroke="${ink}" stroke-width="2.5" stroke-dasharray="0.1 7.2" stroke-linecap="round" style="stroke-width:5"/>
  <circle cx="200" cy="200" r="182" fill="none" stroke="${ink}" stroke-width="2.5"/>
  <circle cx="200" cy="200" r="142" fill="none" stroke="${ink}" stroke-width="2.5"/>
  ${ringText(cx, cy, 162, 'OFFICE OF THE CHAIRMAN', 'CROP OF NOW', ink, 21, 3.4)}
  ${star(38, 200, 7, accent)}${star(362, 200, 7, accent)}
  ${stars}${laurel}
  ${nut(200, 214, 98, accent)}
  <path d="M128 268 L272 268 L262 280 L272 292 L128 292 L138 280Z" fill="${rib}" stroke="${accent}" stroke-width="2"/>
  <text x="200" y="281" fill="${ribInk}" font-family="Fraunces" font-style="italic" font-weight="600" font-size="15" text-anchor="middle" dominant-baseline="central">Semper Legumen</text></svg>`;
}

// 3 — BOARDROOM (1970s conglomerate): peanut cut into horizontal bars + expanded wordmark.
function boardroom(ink, accent, stacked = false) {
  const m = id('m');
  let bars = '';
  for (let i = 0; i < 9; i++) bars += `<rect x="0" y="${f(8 + i * 9.4)}" width="100" height="6" fill="#fff"/>`;
  const mark = `<defs><mask id="${m}" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">${bars}</mask></defs>
    <g mask="url(#${m})">${nut(50, 50, 84, accent, -18)}</g>`;
  if (stacked) return `<svg viewBox="0 0 100 100">${mark}</svg>`;
  return `<svg data-fit viewBox="0 0 560 120"><g transform="translate(0 10)">${mark}</g>
    <text x="118" y="70" fill="${ink}" font-family="ArchivoX" font-size="52" letter-spacing="1">CROP OF NOW</text>
    <text x="120" y="100" fill="${accent}" font-family="Plex" font-weight="600" font-size="14.5" letter-spacing="6.2">INCORPORATED · EST. 2026</text></svg>`;
}

// 4 — GLOBAL HOLDINGS: the peanut as a globe (latitudes + meridians), multinational lockup.
function globe(ink, accent, bg, markOnly = false) {
  const cp = id('c');
  let grid = '';
  for (let y = 16; y < 94; y += 11) grid += `<line x1="0" y1="${y}" x2="100" y2="${y}"/>`;
  for (const rx of [8, 19, 30]) grid += `<ellipse cx="50" cy="50.5" rx="${rx}" ry="46"/>`;
  grid += `<line x1="50" y1="0" x2="50" y2="100"/>`;
  const mark = `<defs><clipPath id="${cp}"><path d="${NUT}"/></clipPath></defs>
    <g transform="rotate(-18 50 50)"><path d="${NUT}" fill="${bg}"/>
    <g clip-path="url(#${cp})" fill="none" stroke="${accent}" stroke-width="2.4">${grid}</g>
    <path d="${NUT}" fill="none" stroke="${accent}" stroke-width="4.5"/></g>`;
  if (markOnly) return `<svg viewBox="-4 -4 108 108">${mark}</svg>`;
  return `<svg data-fit viewBox="0 0 330 250"><g transform="translate(115 0) scale(1.05)">${mark}</g>
    <text x="165" y="170" fill="${ink}" font-family="ArchivoX" font-size="38" text-anchor="middle" letter-spacing="1">CROP OF NOW</text>
    <text x="165" y="200" fill="${accent}" font-family="Plex" font-weight="600" font-size="13" text-anchor="middle" letter-spacing="5.5">GLOBAL PEANUT HOLDINGS</text></svg>`;
}

// 5 — FIELD GRADE (ag supply / seed-sack stamp): the farm side of the conglomerate.
function grade(ink, accent, bg, mono = false) {
  const g = mono ? ink : C.green;
  return `<svg viewBox="0 0 360 250"><rect x="4" y="4" width="352" height="242" rx="10" fill="${bg}" stroke="${ink}" stroke-width="6"/>
    <rect x="15" y="15" width="330" height="220" rx="5" fill="none" stroke="${ink}" stroke-width="2"/>
    <text x="180" y="56" fill="${ink}" font-family="Plex" font-weight="600" font-size="13" text-anchor="middle" letter-spacing="5">NO. 1 PREMIUM · LOT 2026</text>
    <line x1="40" y1="70" x2="320" y2="70" stroke="${ink}" stroke-width="2"/>
    ${nut(80, 146, 104, accent, -24)}
    <text x="128" y="140" fill="${ink}" font-family="ArchivoX" font-size="37">CROP</text>
    <text x="128" y="182" fill="${ink}" font-family="ArchivoX" font-size="37">OF NOW</text>
    <line x1="40" y1="204" x2="320" y2="204" stroke="${ink}" stroke-width="2"/>
    <text x="180" y="222" fill="${g}" font-family="Plex" font-weight="600" font-size="12.5" text-anchor="middle" letter-spacing="4">NET WT. SUBSTANTIAL</text></svg>`;
}

// Favicon-size versions of the seals: drop the ring text, keep the core symbol.
function agencyTiny() {
  let rose = '';
  for (let k = 0; k < 8; k++) {
    const L = k % 2 ? 60 : 92, w = L * 0.2;
    rose += `<path transform="rotate(${k * 45} 100 100)" d="M100 100L${100 - w} ${100 - w}L100 ${100 - L}L${100 + w} ${100 - w}Z" fill="${C.gold}"/>`;
  }
  return `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="98" fill="${C.navy}"/>${rose}<circle cx="100" cy="100" r="34" fill="${C.navy}" stroke="${C.gold}" stroke-width="6"/>${nut(100, 100, 48, C.gold, -24)}</svg>`;
}
function officeTiny() {
  let st = '';
  for (let i = 0; i < 5; i++) { const a = (-150 + i * 30) * Math.PI / 180; st += star(100 + 70 * Math.cos(a), 112 + 70 * Math.sin(a), 11, C.gold); }
  return `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="98" fill="${C.navy}"/><circle cx="100" cy="100" r="88" fill="none" stroke="${C.gold}" stroke-width="6"/>${st}${nut(100, 118, 100, C.gold)}</svg>`;
}

const CONCEPTS = [
  {
    key: 'agency', n: 1, name: 'The Agency', tag: 'Covert',
    why: 'A field-operations seal: a 16-point compass star behind a peanut roundel, with "Crop of Now / Field Operations" around the ring. It reads like the badge on a jacket you\'re not supposed to ask about.',
    use: 'Hats, hoodie chest, patches, the "Authorized Personnel" merch line, the site footer.',
    hero: agency(C.navy, C.gold, C.gold), alt: agency(C.cream, C.navy, C.navy, true), small: agency(C.navy, C.gold, C.gold), tiny: agencyTiny(),
  },
  {
    key: 'office', n: 2, name: 'The Office', tag: 'Presidential',
    why: 'An executive seal: an arc of 13 stars over an upright peanut, a laurel of peanut leaves, and a ribbon reading SEMPER LEGUMEN ("always a legume"). "Office of the Chairman" sits on the ring.',
    use: 'The seal on packaging, the tester-set box, certificates, memos from the Chairman.',
    hero: office(C.navy, C.gold, C.gold), alt: office(C.cream, C.navy, C.navy, true), small: office(C.navy, C.gold, C.gold), tiny: officeTiny(),
  },
  {
    key: 'boardroom', n: 3, name: 'Boardroom', tag: '1970s conglomerate',
    why: 'The peanut cut into horizontal bars, next to a wide, flat wordmark and "Incorporated". It looks like a company that owns a lot of silos and a stadium.',
    use: 'Site header, letterhead, the annual-report jokes, a clean one-ink tee.',
    hero: boardroom(C.navy, C.gold), heroBg: C.cream, alt: boardroom(C.cream, C.gold), altBg: C.navy, small: boardroom(C.navy, C.gold, true), smallBg: C.cream, wide: true,
  },
  {
    key: 'globe', n: 4, name: 'Global Holdings', tag: 'Multinational',
    why: 'The peanut drawn as a globe, with latitude and longitude lines. "Global Peanut Holdings" does the rest. It\'s world domination by legume, stated calmly.',
    use: 'Home page hero, investor-relations bits, stickers, a big back print.',
    hero: globe(C.navy, C.gold, C.navy), heroBg: C.cream, alt: globe(C.cream, C.gold, C.navy), altBg: C.navy, small: globe(C.navy, C.gold, C.navy, true), smallBg: C.cream,
  },
  {
    key: 'grade', n: 5, name: 'Field Grade', tag: 'Ag supply',
    why: 'A seed-sack stamp: No. 1 Premium, Lot 2026, Net Wt. Substantial. It\'s the farm side of the conglomerate, and it fits the craft-peanut product line.',
    use: 'Peanut packaging and labels, shipping boxes, the Reserve page.',
    hero: grade(C.navy, C.gold, C.cream), heroBg: C.cream, alt: grade(C.cream, C.gold, C.navy, true), altBg: C.navy, small: grade(C.navy, C.gold, C.cream), smallBg: C.cream, wide: true,
  },
];

// ---------- Round 2 ----------
const otf = n => { const b = fs.readFileSync(path.join(ROOT, 'fonts', 'static', n + '.ttf')); return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.length)); };
const FX = otf('Archivo-ExpandedBlack'), FI = otf('Fraunces-SemiBoldItalic');
// Serialise glyph commands ourselves: opentype.js 2.0's toPathData rounding emits NaN for some float inputs.
const pathD = p => p.commands.map(c => c.type === 'Z' ? 'Z' : c.type === 'Q' ? `Q${f(c.x1)} ${f(c.y1)} ${f(c.x)} ${f(c.y)}`
  : c.type === 'C' ? `C${f(c.x1)} ${f(c.y1)} ${f(c.x2)} ${f(c.y2)} ${f(c.x)} ${f(c.y)}` : `${c.type}${f(c.x)} ${f(c.y)}`).join('');
// Glyph-by-glyph layout with kerning (opentype.js can't run Fraunces' GSUB tables, same as logos.js).
function glyphs(font, str, size, x, y, fill) {
  let d = '', cx = x;
  const gl = [...str].map(ch => font.charToGlyph(ch));
  gl.forEach((g, i) => {
    d += pathD(g.getPath(cx, y, size));
    cx += g.advanceWidth / font.unitsPerEm * size;
    if (i < gl.length - 1) cx += font.getKerningValue(g, gl[i + 1]) / font.unitsPerEm * size;
  });
  return { svg: `<path d="${d}" fill="${fill}"/>`, w: cx - x };
}
const CAP = size => FX.tables.os2.sCapHeight / FX.unitsPerEm * size;

// 6 — THE CHAIRMAN: a deadpan peanut in a necktie. Flat mouth, flat brows. Management.
function chairman(face, tie, collar) {
  return `<g>${nut(50, 50, 84, face)}
    <g stroke="${tie}" stroke-width="2.4" stroke-linecap="round"><line x1="40.5" y1="23" x2="46.5" y2="23"/><line x1="53.5" y1="23" x2="59.5" y2="23"/><line x1="45.5" y1="37" x2="54.5" y2="37"/></g>
    <circle cx="43.5" cy="29" r="2.5" fill="${tie}"/><circle cx="56.5" cy="29" r="2.5" fill="${tie}"/>
    <path d="M40.5 45L59.5 45L50 64Z" fill="${collar}"/>
    <path d="M47.2 48.2H52.8L52 52.2H48Z M48 52.2H52L55 75L50 81L45 75Z" fill="${tie}"/></g>`;
}
function chairmanLockup(ink, face, tie, collar, markOnly = false) {
  if (markOnly) return `<svg viewBox="0 0 100 100">${chairman(face, tie, collar)}</svg>`;
  return `<svg data-fit viewBox="0 0 600 110"><g transform="translate(0 2)">${chairman(face, tie, collar)}</g>${glyphs(FX, 'CROP OF NOW', 44, 118, 58, ink).svg}
    <text x="120" y="86" fill="${face}" font-family="Plex" font-weight="600" font-size="14" letter-spacing="7.4">OFFICE OF MANAGEMENT</text></svg>`;
}

// 7 — PEANUT O's: no separate symbol; both O's are peanuts lying on their side.
function peanutOs(ink, nutFill, accent, stacked = false) {
  const size = 100, ch = CAP(size), L = ch / 0.554 * 0.98, ow = L + 8, sp = size * 0.2;
  let x = 0, out = '';
  const word = (str, y) => { for (const k of str) {
    if (k === 'O') { out += nut(x + ow / 2, y - ch / 2, L, nutFill, 80); x += ow + 4; }
    else { const g = glyphs(FX, k, size, x, y, ink); out += g.svg; x += g.w + 2; } } };
  if (stacked) {
    word('CROP', ch); const w1 = x, rowY = ch * 2 + 34;
    const w2 = glyphs(FX, 'NW', size, 0, 0, ink).w + 4 + ow + 4;
    x = (w1 - w2) / 2; word('NOW', rowY);
    return `<svg viewBox="-8 -10 ${f(w1 + 16)} ${f(rowY + 20)}">${out}</svg>`;
  }
  word('CROP', ch); x += sp;
  const of = glyphs(FI, 'of', size * 1.05, x, ch, accent); out += of.svg; x += of.w + sp;
  word('NOW', ch);
  return `<svg viewBox="-6 -10 ${f(x + 12)} ${f(ch + 20)}">${out}</svg>`;
}

// 8 — UP AND TO THE RIGHT: a growth chart that ends in a peanut.
function growth(ink, line, nutFill, markOnly = false) {
  const mark = `<path d="M12 8V88H114" fill="none" stroke="${ink}" stroke-width="6" stroke-linecap="square"/>
    <polyline points="20,78 38,62 52,69 70,46 82,53 94,34" fill="none" stroke="${line}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>
    ${nut(101, 23, 34, nutFill, 42)}`;
  if (markOnly) return `<svg viewBox="4 0 118 96">${mark}</svg>`;
  return `<svg data-fit viewBox="0 0 600 100">${mark}${glyphs(FX, 'CROP OF NOW', 42, 136, 52, ink).svg}
    <text x="138" y="80" fill="${line}" font-family="Plex" font-weight="600" font-size="14" letter-spacing="7.2">UP AND TO THE RIGHT</text></svg>`;
}

// 9 — GROWN UNDERGROUND: the plant flowers above the soil line; pegs carry the peanuts below it.
function underground(ring, ringInk, sky, soil, leaf, nutFill, mono = false) {
  const cp = id('u');
  let leaves = '';
  for (const [y, len] of [[112, 26], [140, 32], [168, 36]]) for (const s of [-1, 1]) {
    const cx = 200 + s * len * 0.62;
    leaves += `<ellipse cx="${f(cx)}" cy="${y}" rx="${f(len * 0.55)}" ry="${f(len * 0.26)}" fill="${leaf}" transform="rotate(${s * -22} ${f(cx)} ${y})"/>`;
  }
  const pegs = [[150, 272, -35], [200, 296, 0], [252, 268, 32]].map(([x, y, r]) =>
    `<path d="M200 202Q${(200 + x) / 2} ${y - 50} ${x} ${y - 16}" fill="none" stroke="${mono ? nutFill : C.goldDk}" stroke-width="3.2" stroke-linecap="round"/>${nut(x, y, 46, nutFill, r)}`).join('');
  return `<svg viewBox="0 0 400 400"><circle cx="200" cy="200" r="197" fill="${ring}"/>
    ${ringText(200, 200, 172, 'CROP OF NOW', 'GROWN UNDERGROUND', ringInk, 27, 4.5, 'FrauncesR', 700)}
    ${star(28, 200, 7, ringInk)}${star(372, 200, 7, ringInk)}
    <defs><clipPath id="${cp}"><circle cx="200" cy="200" r="146"/></clipPath></defs>
    <g clip-path="url(#${cp})"><rect width="400" height="202" fill="${sky}"/><rect y="202" width="400" height="200" fill="${soil}"/>
    <line x1="0" y1="202" x2="400" y2="202" stroke="${leaf}" stroke-width="4"/>
    <path d="M200 202V88" stroke="${leaf}" stroke-width="6" stroke-linecap="round"/>${leaves}
    <circle cx="200" cy="84" r="8" fill="${nutFill}"/>${pegs}</g>
    <circle cx="200" cy="200" r="146" fill="none" stroke="${ringInk}" stroke-width="3"/></svg>`;
}
function undergroundTiny() {
  const cp = id('ut');
  return `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="98" fill="${C.navy}"/><defs><clipPath id="${cp}"><circle cx="100" cy="100" r="86"/></clipPath></defs>
    <g clip-path="url(#${cp})"><rect width="200" height="96" fill="${C.cream}"/><path d="M100 96V38" stroke="${C.green}" stroke-width="10" stroke-linecap="round"/>
    <ellipse cx="80" cy="62" rx="18" ry="9" fill="${C.green}" transform="rotate(22 80 62)"/><ellipse cx="120" cy="62" rx="18" ry="9" fill="${C.green}" transform="rotate(-22 120 62)"/>${nut(100, 140, 62, C.gold)}</g></svg>`;
}

// 10 — BALLPARK: a felt pennant with stitched edges.
function pennant(felt, ink, nutFill, stitch, pole) {
  const t = glyphs(FX, 'CROP OF NOW', 28, 112, 80, ink), tip = f(112 + t.w + 230);
  return `<svg viewBox="0 0 ${tip + 8} 150"><rect x="4" y="2" width="9" height="146" rx="4.5" fill="${pole}"/>
    <path d="M13 8L${tip} 70L13 132Z" fill="${felt}"/>
    <path d="M22 17L${tip - 26} 70L22 123Z" fill="none" stroke="${stitch}" stroke-width="1.6" stroke-dasharray="5 4"/>
    ${nut(66, 70, 70, nutFill, -32)}${t.svg}
    <text x="114" y="100" fill="${nutFill}" font-family="Plex" font-weight="600" font-size="11" letter-spacing="5">EST. 2026</text></svg>`;
}
const pennantTiny = () => `<svg viewBox="0 0 100 100"><rect x="8" y="4" width="8" height="92" rx="4" fill="${C.gold}"/><path d="M16 10L96 50L16 90Z" fill="${C.navy}"/>${nut(44, 50, 46, C.gold, -32)}</svg>`;

const CONCEPTS2 = [
  {
    key: 'chairman', n: 6, name: 'The Chairman', tag: 'Mascot',
    why: 'A peanut in a collar and tie, with flat brows and a flat mouth. He is not amused, and he has a 9 a.m. It gives the brand a face for the "memo from management" jokes without borrowing anyone else\'s mascot (no monocle, no top hat).',
    use: 'Social avatar, stickers, the Leadership page, a tee that\'s just him.',
    hero: chairmanLockup(C.navy, C.gold, C.navy, C.cream), alt: chairmanLockup(C.cream, C.gold, C.navy, C.cream), altBg: C.navy,
    small: chairmanLockup(C.navy, C.gold, C.navy, C.cream, true), thumb: chairmanLockup(C.navy, C.gold, C.navy, C.cream, true),
  },
  {
    key: 'peanut-os', n: 7, name: 'Peanut O\'s', tag: 'Wordmark',
    why: 'No separate symbol. Both O\'s in CROP and NOW are peanuts lying on their side, and the italic "of" carries over from v1. It\'s the simplest idea here, and it reads instantly on a sign, a box or a sleeve.',
    use: 'Site header, packaging front, storefront banner. The stacked CROP/NOW version is the square icon.',
    hero: peanutOs(C.navy, C.gold, C.goldDk), alt: peanutOs(C.cream, C.gold, C.gold), altBg: C.navy,
    onNavy: peanutOs(C.cream, C.gold, C.gold, true), small: peanutOs(C.navy, C.gold, C.goldDk, true), smallBg: C.cream, thumb: peanutOs(C.navy, C.gold, C.goldDk, true),
  },
  {
    key: 'growth', n: 8, name: 'Up and to the Right', tag: 'Growth chart',
    why: 'A quarterly-results line in Field Green that climbs and ends in a peanut. It\'s the corporate joke in one picture: peanut performance only goes one way.',
    use: 'Investor-relations bits, the Quarterly Results crewneck, the site header, slides.',
    hero: growth(C.navy, C.green, C.gold), alt: growth(C.cream, C.gold, C.gold), altBg: C.navy,
    onNavy: growth(C.cream, C.green, C.gold, true), small: growth(C.navy, C.green, C.gold, true), smallBg: C.cream, thumb: growth(C.navy, C.green, C.gold, true),
  },
  {
    key: 'underground', n: 9, name: 'Grown Underground', tag: 'Botanical',
    why: 'The real peanut story as a badge. The plant flowers above the soil line, then sends down "pegs", and the peanuts grow underground. It\'s warm, crafted and food-first, which suits the peanut products more than the merch.',
    use: 'Peanut and peanut-butter labels, the tester-set box, the Reserve page, farmers-market signage.',
    hero: underground(C.navy, C.gold, C.cream, C.navy, C.green, C.gold), alt: underground(C.cream, C.navy, C.cream, C.navy, C.navy, C.navy, true),
    small: underground(C.navy, C.gold, C.cream, C.navy, C.green, C.gold), tiny: undergroundTiny(),
  },
  {
    key: 'pennant', n: 10, name: 'Ballpark', tag: 'Americana',
    why: 'A felt pennant with stitched edges, the kind you bring home from a game. Peanuts are the original ballpark food ("Buy me some peanuts…"), so the brand gets decades of built-in nostalgia.',
    use: 'Merch (a real felt pennant is a cheap, fun product), stickers, the Shop page, summer campaigns.',
    hero: pennant(C.navy, C.cream, C.gold, C.gold, C.gold), alt: pennant(C.gold, C.navy, C.navy, C.navy, C.navy), altBg: C.cream,
    small: pennant(C.gold, C.navy, C.navy, C.navy, C.gold), tiny: pennantTiny(), thumb: pennantTiny(),
  },
];
// ---------- Round 3: five takes on The Agency ----------
// The site favicon's peanut (assets/favicon.svg): shaded shell, highlight, dimples. Gold fill = full colour;
// any other fill = one-ink version with the dimples knocked out in the background colour.
const FAV_SHELL = 'M32 4C41 4 47 10.5 47 19c0 6-4.2 9-4.2 13s5.2 7 5.2 13.5C48 54.5 41 61 32 61s-16-6.5-16-15.5C16 39 21.2 36 21.2 32S17 25 17 19C17 10.5 23 4 32 4Z';
const FAV_DOTS = [[31, 11, 1.7], [38, 16, 1.7], [30, 21, 1.7], [37, 25, 1.5], [27, 40, 1.7], [34, 37, 1.7], [40, 44, 1.7], [24, 49, 1.7], [32, 47, 1.7], [38, 53, 1.5], [29, 55, 1.7]]
  .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('');
function fnut(x, y, h, fill, deg = -24, bg = C.navy) {
  const g = `<g transform="translate(${f(x)} ${f(y)}) rotate(${deg}) scale(${f(h / 57)}) translate(-32 -32.5)">`;
  if (fill !== C.gold) return `${g}<path d="${FAV_SHELL}" fill="${fill}"/><g fill="${bg}">${FAV_DOTS}</g></g>`;
  const cp = id('fv');
  return `${g}<defs><clipPath id="${cp}"><path d="${FAV_SHELL}"/></clipPath></defs><path d="${FAV_SHELL}" fill="#B7762B"/>
    <g clip-path="url(#${cp})"><path d="${FAV_SHELL}" fill="#D9973F" transform="translate(-3.5 -1)"/>
    <ellipse cx="24" cy="15" rx="2.8" ry="5.5" fill="#F2C27A" transform="rotate(14 24 15)"/><g fill="#A8661F">${FAV_DOTS}</g></g></g>`;
}
function agencyTinyFav() {
  let r = '';
  for (let k = 0; k < 8; k++) { const L = k % 2 ? 60 : 92, w = L * 0.2; r += `<path transform="rotate(${k * 45} 100 100)" d="M100 100L${100 - w} ${100 - w}L100 ${100 - L}L${100 + w} ${100 - w}Z" fill="${C.gold}"/>`; }
  return `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="98" fill="${C.navy}"/>${r}<circle cx="100" cy="100" r="40" fill="${C.navy}" stroke="${C.gold}" stroke-width="6"/>${fnut(100, 100, 60, C.gold)}</svg>`;
}
function rose(cx, cy, L, accent, shade, outline = 0) {
  let o = '';
  for (let k = 0; k < 16; k++) {
    const len = k % 4 === 0 ? L : k % 2 === 0 ? L * 0.64 : L * 0.45, w = len * 0.16, g = `rotate(${k * 22.5} ${cx} ${cy})`;
    o += outline
      ? `<path transform="${g}" d="M${cx} ${cy}L${f(cx - w)} ${f(cy - w * 1.2)}L${cx} ${f(cy - len)}L${f(cx + w)} ${f(cy - w * 1.2)}Z M${cx} ${cy}L${cx} ${f(cy - len)}" fill="none" stroke="${accent}" stroke-width="${outline}" stroke-linejoin="round"/>`
      : `<g transform="${g}"><path d="M${cx} ${cy}L${f(cx - w)} ${f(cy - w * 1.2)}L${cx} ${f(cy - len)}Z" fill="${accent}"/><path d="M${cx} ${cy}L${f(cx + w)} ${f(cy - w * 1.2)}L${cx} ${f(cy - len)}Z" fill="${shade}"/></g>`;
  }
  return o;
}
const roundel = (cx, cy, r, bg, ink, nutFill, sw = 3.5) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${bg}" stroke="${ink}" stroke-width="${sw}"/>${fnut(cx, cy, r * 1.4, nutFill, -24, bg)}`;
const frame = (bg, ink, accent, top, bottom, size = 25, sp = 5) => `<circle cx="200" cy="200" r="197" fill="${bg}"/>
  <circle cx="200" cy="200" r="189" fill="none" stroke="${ink}" stroke-width="4"/><circle cx="200" cy="200" r="143" fill="none" stroke="${ink}" stroke-width="2.5"/>
  ${ringText(200, 200, 166, top, bottom, ink, size, sp)}${star(34, 200, 8, accent)}${star(366, 200, 8, accent)}`;
const shade = (mono, accent) => mono ? accent : C.goldDk;

// 1A — Crest: a heraldic shield inside the ring; the chief carries three peanuts.
function agencyCrest(bg, ink, accent, mono = false) {
  const sh = 'M128 92H272V200Q272 280 200 322Q128 280 128 200Z', cp = id('cr');
  return `<svg viewBox="0 0 400 400">${frame(bg, ink, accent, 'CROP OF NOW', 'FIELD OPERATIONS')}
    <defs><clipPath id="${cp}"><path d="${sh}"/></clipPath></defs>
    <path d="${sh}" fill="${mono ? bg : C.navyLt}"/>
    <g clip-path="url(#${cp})"><rect x="120" y="86" width="160" height="42" fill="${accent}"/>
    ${[166, 200, 234].map(x => fnut(x, 107, 26, bg, -24, accent)).join('')}
    ${rose(200, 212, 70, accent, shade(mono, accent))}${roundel(200, 212, 22, mono ? bg : C.navyLt, accent, accent, 3)}</g>
    <path d="${sh}" fill="none" stroke="${accent}" stroke-width="4"/></svg>`;
}

// 1B — Stars & Motto: a ring of 16 stars around the rose and a ribbon: SEMPER SUBTERRA ("always underground").
function agencyMotto(bg, ink, accent, mono = false) {
  let st = '';
  for (let k = 0; k < 16; k++) { const a = (k * 22.5 + 11.25) * Math.PI / 180; st += star(200 + 118 * Math.cos(a), 196 + 118 * Math.sin(a), 5.2, accent); }
  const rib = mono ? bg : C.cream, ribInk = mono ? accent : C.navy;
  return `<svg viewBox="0 0 400 400">${frame(bg, ink, accent, 'CROP OF NOW', 'PEANUT DIVISION')}
    ${st}${rose(200, 196, 100, accent, shade(mono, accent))}${roundel(200, 196, 34, bg, ink, accent)}
    <path d="M96 268H304L292 281L304 294H96L108 281Z" fill="${rib}" stroke="${accent}" stroke-width="2"/>
    <text x="200" y="282" fill="${ribInk}" font-family="Plex" font-weight="600" font-size="12.5" letter-spacing="2.2" text-anchor="middle" dominant-baseline="central">SEMPER SUBTERRA</text></svg>`;
}

// 1C — Tactical Patch: olive field, merrowed edge, a reticle on the peanut.
function agencyPatch(field, ink, accent, edge, bare = false) {
  let ticks = '';
  for (let k = 0; k < 16; k++) { const L = k % 4 === 0 ? 18 : 9; ticks += `<line transform="rotate(${k * 22.5} 200 200)" x1="200" y1="${88}" x2="200" y2="${88 + L}"/>`; }
  const R = bare ? 168 : 132;
  return `<svg viewBox="0 0 400 400"><circle cx="200" cy="200" r="194" fill="${field}" stroke="${edge}" stroke-width="10"/>
    <circle cx="200" cy="200" r="184" fill="none" stroke="${edge}" stroke-width="4" stroke-dasharray="2 3"/>
    ${bare ? '' : ringText(200, 200, 160, 'FIELD OPS', 'PEANUT DIV.', ink, 30, 7) + `<circle cx="200" cy="200" r="${R}" fill="none" stroke="${ink}" stroke-width="3"/>` + star(40, 200, 8, accent) + star(360, 200, 8, accent)}
    <g transform="translate(200 200) scale(${bare ? 1.3 : 1}) translate(-200 -200)">
    <g stroke="${ink}" stroke-width="3.5" stroke-linecap="round" fill="none"><circle cx="200" cy="200" r="88"/>${ticks}
    <line x1="112" y1="200" x2="160" y2="200"/><line x1="240" y1="200" x2="288" y2="200"/><line x1="200" y1="112" x2="200" y2="152"/><line x1="200" y1="248" x2="200" y2="288"/></g>
    ${fnut(200, 200, 76, accent, -24, field)}</g></svg>`;
}

// 1D — Monoline: the same seal redrawn in single-weight line, like a modern agency rebrand. Gold only on the peanut.
function agencyMono(bg, ink, accent, bare = false) {
  return `<svg viewBox="0 0 400 400"><circle cx="200" cy="200" r="197" fill="${bg}"/>
    <circle cx="200" cy="200" r="190" fill="none" stroke="${ink}" stroke-width="2.5"/>
    ${bare ? '' : `<circle cx="200" cy="200" r="148" fill="none" stroke="${ink}" stroke-width="1.6"/>${ringText(200, 200, 169, 'CROP OF NOW · FIELD OPERATIONS', 'EST. 2026', ink, 16, 3.6)}`}
    <g transform="translate(200 200) scale(${bare ? 1.35 : 1}) translate(-200 -200)">${rose(200, 200, 120, ink, ink, 2.2)}
    <circle cx="200" cy="200" r="38" fill="${bg}" stroke="${ink}" stroke-width="2.2"/>${fnut(200, 200, 50, accent, -24, bg)}</g></svg>`;
}

// 1E — Credentials: a gold field-agent badge carrying a small version of the seal.
function agencyBadge(metal, metalDk, ink, bannerInk, bare = false) {
  const sh = 'M200 30Q252 64 322 50Q338 126 326 206Q304 300 200 368Q96 300 74 206Q62 126 78 50Q148 64 200 30Z';
  const cy = bare ? 196 : 206, r = bare ? 96 : 70;
  return `<svg viewBox="0 0 400 400"><path d="${sh}" fill="${metal}" stroke="${metalDk}" stroke-width="7"/>
    <path d="${sh}" fill="none" stroke="${metalDk}" stroke-width="2.5" transform="translate(200 200) scale(0.9) translate(-200 -200)"/>
    ${bare ? '' : `<path d="M104 88H296L288 104L296 120H104L112 104Z" fill="${ink}"/>
    <text x="200" y="105" fill="${bannerInk}" font-family="ArchivoX" font-size="17" letter-spacing="1.5" text-anchor="middle" dominant-baseline="central">CROP OF NOW</text>
    <path d="M120 294H280L270 308L280 322H120L130 308Z" fill="${ink}"/>
    <text x="200" y="309" fill="${bannerInk}" font-family="Plex" font-weight="600" font-size="12" letter-spacing="2.6" text-anchor="middle" dominant-baseline="central">FIELD AGENT</text>`}
    <circle cx="200" cy="${cy}" r="${r}" fill="${ink}" stroke="${metalDk}" stroke-width="4"/>
    ${rose(200, cy, r * 0.86, metal, metalDk)}${roundel(200, cy, r * 0.3, ink, metal, metal, 2.5)}</svg>`;
}

const CONCEPTS3 = [
  {
    key: 'crest', n: '1A', name: 'Crest', tag: 'Heraldic',
    why: 'The Agency seal with a heraldic shield inside the ring. The shield\'s top band carries three peanuts, and the compass star and peanut roundel sit below. It\'s the most "official" of the five, like a coat of arms for a department that shouldn\'t exist.',
    use: 'Hoodie back, embroidered patches, certificates, the About page.',
    hero: agencyCrest(C.navy, C.gold, C.gold), alt: agencyCrest(C.cream, C.navy, C.navy, true), small: agencyCrest(C.navy, C.gold, C.gold), tiny: agencyTinyFav(),
  },
  {
    key: 'motto', n: '1B', name: 'Stars & Motto', tag: 'Ceremonial',
    why: 'A ring of 16 stars around the compass star, and a ribbon reading SEMPER SUBTERRA ("always underground"). That\'s where peanuts grow and where good operatives stay. "Peanut Division" moves onto the ring.',
    use: 'Main seal on packaging, merch chest prints, the tester-set box.',
    hero: agencyMotto(C.navy, C.gold, C.gold), alt: agencyMotto(C.cream, C.navy, C.navy, true), small: agencyMotto(C.navy, C.gold, C.gold), tiny: agencyTinyFav(),
  },
  {
    key: 'patch', n: '1C', name: 'Tactical Patch', tag: 'Field issue',
    why: 'A subdued olive patch with a stitched edge and crosshairs locked on a peanut. "Field Ops / Peanut Div." It looks like it came off a jacket sleeve. It\'s the most merch-ready of the five: it would make a great real embroidered patch or hat.',
    use: 'Hats, velcro patches, a jacket or hoodie sleeve, stickers.',
    hero: agencyPatch(C.green, C.cream, C.gold, C.navy), alt: agencyPatch(C.cream, C.navy, C.navy, C.navy), small: agencyPatch(C.green, C.cream, C.gold, C.navy),
    tiny: agencyPatch(C.green, C.cream, C.gold, C.navy, true),
  },
  {
    key: 'monoline', n: '1D', name: 'Monoline', tag: 'Modern agency',
    why: 'The same seal redrawn with thin single-weight lines, and gold only on the peanut. It\'s how a government agency looks after a pricey rebrand: calm, precise, a little too clean. It holds up best on the website and in print.',
    use: 'Site header and footer, letterhead, business cards, the brand guide cover.',
    hero: agencyMono(C.cream, C.navy, C.gold), alt: agencyMono(C.navy, C.cream, C.gold), small: agencyMono(C.cream, C.navy, C.gold), onNavy: agencyMono(C.navy, C.cream, C.gold),
    tiny: agencyMono(C.cream, C.navy, C.gold, true),
  },
  {
    key: 'badge', n: '1E', name: 'Credentials', tag: 'Field agent',
    why: 'A gold field-agent badge, the kind that gets flashed at a door, with CROP OF NOW on the top banner and FIELD AGENT on the bottom. The compass seal sits in the middle. It\'s the funniest in person, and it could be a real enamel pin.',
    use: 'Enamel pins, keychains, the "Authorized Personnel" merch line, social avatar.',
    hero: agencyBadge(C.gold, C.goldDk, C.navy, C.cream), alt: agencyBadge(C.cream, C.navy, C.navy, C.cream), small: agencyBadge(C.gold, C.goldDk, C.navy, C.cream),
    tiny: agencyBadge(C.gold, C.goldDk, C.navy, C.cream, true),
  },
];
const SET = ROUND === 3 ? CONCEPTS3 : ROUND === 2 ? CONCEPTS2 : CONCEPTS;

const fontDir = path.join(ROOT, 'fonts').replace(/\\/g, '/');
const css = `
@font-face{font-family:ArchivoX;src:url(file:///${fontDir}/static/Archivo-ExpandedBlack.ttf)}
@font-face{font-family:Plex;font-weight:600;src:url(file:///${fontDir}/IBMPlexMono-SemiBold.ttf)}
@font-face{font-family:Fraunces;font-style:italic;font-weight:600;src:url(file:///${fontDir}/static/Fraunces-SemiBoldItalic.ttf)}
@font-face{font-family:FrauncesR;font-weight:700;src:url(file:///${fontDir}/static/Fraunces-Bold.ttf)}
@font-face{font-family:Archivo;src:url(file:///${fontDir}/static/Archivo-Regular.ttf)}
@page{size:11in 8.5in;margin:0}
*{box-sizing:border-box}body{margin:0;background:${C.cream};color:${C.navy};font:14px/1.5 Archivo,sans-serif}
.page{width:11in;height:8.5in;padding:.55in .6in;page-break-after:always;display:flex;flex-direction:column;overflow:hidden}
.kick{font:600 11px Plex;letter-spacing:.2em;text-transform:uppercase;color:${C.goldDk}}
h1{font:48px ArchivoX;margin:.1in 0 .05in;letter-spacing:.01em}h2{font:34px ArchivoX;margin:.04in 0 .12in}
.tag{display:inline-block;font:600 10.5px Plex;letter-spacing:.18em;text-transform:uppercase;background:${C.navy};color:${C.gold};padding:4px 9px;border-radius:3px}
.tag.pick{background:${C.gold};color:${C.navy}}
.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:.18in;margin-top:.35in}
.cell{background:#fff8;border:1px solid #1C273322;border-radius:8px;padding:.14in;display:flex;flex-direction:column;align-items:center;gap:.1in}
.cell .box{width:100%;aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:6px}
.cell .box svg{width:92%;height:92%}.cell b{font:600 11px Plex;letter-spacing:.12em;text-transform:uppercase}
.row{display:grid;grid-template-columns:4.3in 1fr;gap:.4in;flex:1;margin-top:.1in}
.hero{border-radius:10px;display:flex;align-items:center;justify-content:center;padding:.3in}.hero svg{width:100%;max-height:100%}
.side{display:flex;flex-direction:column;gap:.16in}.side p{margin:0;font-size:14.5px}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:.16in}
.tile{border-radius:8px;height:1.9in;display:flex;align-items:center;justify-content:center;padding:.18in}.tile svg{width:100%;height:100%}
.sizes{display:flex;align-items:flex-end;gap:.3in;padding:.14in .2in;border-radius:8px;border:1px solid #1C273322}
.sizes div{display:flex;flex-direction:column;align-items:center;gap:4px;font:600 9.5px Plex;letter-spacing:.12em;color:#1C2733aa}
.lbl{font:600 10px Plex;letter-spacing:.16em;text-transform:uppercase;color:#1C2733aa}
.foot{margin-top:auto;font:600 9.5px Plex;letter-spacing:.16em;color:#1C273399;text-transform:uppercase;display:flex;justify-content:space-between}
`;
const bgOf = (c, k) => c[k + 'Bg'] || (k === 'hero' ? C.cream : C.cream);
const sizedSmall = (c, px) => `<div><span style="display:block;width:${px}px;height:${px}px;background:${c.smallBg || 'transparent'}">${(px <= 32 && c.tiny ? c.tiny : c.small).replace('<svg ', `<svg width="${px}" height="${px}" `)}</span>${px}px</div>`;

const overview = `<section class="page">
  <div class="kick">Crop of Now · Brand v2 · Logo concepts${ROUND > 1 ? ' · Round ' + ROUND : ''} · For review</div>
  <h1>${ROUND === 3 ? 'The Agency, five ways.' : ROUND === 2 ? 'Five more marks.' : 'Five marks. Pick one.'}</h1>
  <p style="max-width:7.6in;margin:0">${ROUND === 3 ? 'Five versions of concept 1, The Agency, now carrying the peanut from the site favicon. Every one keeps the compass star, the peanut and the field-operations voice. They differ in how official, how tactical or how modern they feel. Colors and fonts are unchanged from brand guide v1. Each version is shown full size on the pages that follow, along with a one-color version and a favicon-size test.' : ROUND === 2
    ? 'The colors, fonts and voice from brand guide v1 stay the same. These five go in new directions: a mascot, a wordmark with no separate symbol, a growth chart, a botanical badge made for the peanut products, and a ballpark pennant. Each concept is shown full size on the pages that follow, along with a one-color version and a favicon-size test.'
    : 'The colors, fonts and voice from brand guide v1 stay the same. Only the mark changes. Concepts 1 and 2 follow the "Field Operations" direction: a covert agency and an executive seal. Concepts 3–5 are different takes on the conglomerate joke. Each concept is shown full size on the pages that follow, along with a one-color version and a favicon-size test.'}</p>
  <div class="grid">${SET.map(c => `<div class="cell"><div class="box" style="background:${C.cream}">${c.thumb || (c.key === 'boardroom' || c.key === 'globe' ? c.small : c.hero)}</div><b>${c.n} · ${c.name}</b><span class="tag ${c.n <= 2 ? 'pick' : ''}">${c.tag}</span></div>`).join('')}</div>
  <div class="foot"><span>Original artwork. Not based on any government seal.</span><span>cropofnow.com</span></div></section>`;

const pages = SET.map((c, i) => `<section class="page">
  <div class="kick">Concept ${c.n}${ROUND > 1 ? " · Round " + ROUND : " of 5"}</div><h2>${c.name} <span class="tag ${c.n <= 2 ? 'pick' : ''}" style="vertical-align:middle">${c.tag}</span></h2>
  <div class="row">
    <div class="hero" style="background:${c.heroBg || C.cream};border:1px solid #1C273322">${c.hero}</div>
    <div class="side">
      <p>${c.why}</p><p><span class="lbl">Where it lives:</span> ${c.use}</p>
      <div class="pair"><div><div class="tile" style="background:${c.altBg || C.cream};border:1px solid #1C273322">${c.alt}</div><div class="lbl" style="margin-top:5px">One-color / reverse</div></div>
      <div><div class="tile" style="background:${C.navy}">${c.onNavy || c.small}</div><div class="lbl" style="margin-top:5px">On navy merch</div></div></div>
      <div class="lbl">Small-size test</div>
      <div class="sizes">${[128, 64, 32, 16].map(px => sizedSmall(c, px)).join('')}</div>
    </div></div>
  <div class="foot"><span>Crop of Now · Logo concepts</span><span>${i + 1} / 5</span></div></section>`).join('');

const html = `<!doctype html><html><head><meta charset="utf-8"><title>Crop of Now Logo Concepts${ROUND > 1 ? ' Round ' + ROUND : ''}</title><style>${css}</style></head><body>${overview}${pages}</body></html>`;

const NAME = ROUND > 1 ? 'concepts-round' + ROUND : 'concepts';
const PDF = ROUND === 3 ? 'Crop-of-Now-Agency-Variations.pdf' : ROUND === 2 ? 'Crop-of-Now-Logo-Concepts-Round-2.pdf' : 'Crop-of-Now-Logo-Concepts.pdf';
(async () => {
  fs.mkdirSync(path.join(OUT, 'png'), { recursive: true });
  fs.writeFileSync(path.join(OUT, NAME + '.html'), html);
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1056, height: 816 } });
  await page.goto('file:///' + path.join(OUT, NAME + '.html').replace(/\\/g, '/'));
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (const svg of document.querySelectorAll('svg[data-fit]')) {
      const b = svg.getBBox(), p = 6;
      svg.setAttribute('viewBox', `${b.x - p} ${b.y - p} ${b.width + 2 * p} ${b.height + 2 * p}`);
    }
  });
  await page.pdf({ path: path.join(OUT, PDF), width: '11in', height: '8.5in', printBackground: true });
  const secs = await page.$$('section.page');
  for (let i = 0; i < secs.length; i++) await secs[i].screenshot({ path: path.join(OUT, 'png', `${NAME}-page-${i}.png`) });
  if (ROUND === 3) {  // Field Operations special editions: transparent 2400px PNGs of each hero
    const dir = path.join(ROOT, 'special', 'field-ops');
    fs.mkdirSync(dir, { recursive: true });
    const one = await browser.newPage({ viewport: { width: 2400, height: 2400 } });
    for (const c of SET) {
      const tmp = path.join(OUT, '_export.html');  // loaded from disk so the file:// fonts are allowed
      fs.writeFileSync(tmp, `<html><head><style>${css.replace(/@page[^}]*}/, '')} body{background:transparent}</style></head><body style="margin:0">${c.hero.replace('<svg ', '<svg width="2400" height="2400" ')}</body></html>`);
      await one.goto(pathToFileURL(tmp).href);
      await one.evaluate(() => document.fonts.ready);
      await one.locator('svg').first().screenshot({ path: path.join(dir, `${c.n}-${c.key}.png`), omitBackground: true });
    }
  }
  fs.rmSync(path.join(OUT, '_export.html'), { force: true });
  await browser.close();
  console.log('wrote concepts.html, PDF and', secs.length, 'page PNGs');
})().catch(e => { console.error(e); process.exit(1); });
