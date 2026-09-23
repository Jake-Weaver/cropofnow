// Geometry for the Crop of Now peanut mark: two circles joined by fillet arcs (a smooth waist).
'use strict';
function peanutPath({ c1 = [50, 32], r1 = 19, c2 = [50, 69], r2 = 24, rf = 9 } = {}) {
  // Fillet circle tangent (externally) to both lobes, one on each side.
  const [x1, y1] = c1, [x2, y2] = c2;
  const a = r1 + rf, b = r2 + rf, d = Math.hypot(x2 - x1, y2 - y1);
  const t = (a * a - b * b + d * d) / (2 * d), h = Math.sqrt(a * a - t * t);
  const ux = (x2 - x1) / d, uy = (y2 - y1) / d;
  const mx = x1 + ux * t, my = y1 + uy * t;
  const P = s => [mx - uy * h * s, my + ux * h * s];
  const tan = (c, r, p, R) => [c[0] + (p[0] - c[0]) * r / R, c[1] + (p[1] - c[1]) * r / R];
  const pr = P(1), pl = P(-1);
  const t1r = tan(c1, r1, pr, a), t1l = tan(c1, r1, pl, a), t2r = tan(c2, r2, pr, b), t2l = tan(c2, r2, pl, b);
  const f = n => +n.toFixed(3);
  const pt = p => `${f(p[0])} ${f(p[1])}`;
  return `M${pt(t1r)}A${r1} ${r1} 0 1 1 ${pt(t1l)}A${rf} ${rf} 0 0 0 ${pt(t2l)}A${r2} ${r2} 0 1 1 ${pt(t2r)}A${rf} ${rf} 0 0 0 ${pt(t1r)}Z`;
}
module.exports = { peanutPath };
if (require.main === module) console.log(peanutPath());
