// web/src/layout.js: WHERE A CELL SITS.
//
// A lateral view of a brain, in the viewer's own machine. Three masses: a cerebrum with a
// frontal pole, a pointed occipital pole and a temporal lobe hanging low and lateral; a
// cerebellum tucked under and behind it; a brainstem running down out of the middle. Most
// cells live on the cortical SHEET near the surface, because that is where cell bodies
// crowd, and the sheet is corrugated, so the grooves between the bright ridges are sulci
// and the ridges are gyri. The fold value each cell gets is what the shader uses to darken
// a cell that is down inside a groove, and that is the only reason the silhouette reads as
// a brain rather than as a cloud.
//
// Regions are not blobs around an anchor. The cortical surface is PARTITIONED: every
// direction belongs to the region whose anchor is nearest, so the regions together tile
// the whole sheet. Inside a territory the directions are sorted by angle, so one circuit
// gets one contiguous patch of cortex.
//
// A second layout lives here too: the pipeline. Press v and the same cells walk out into
// left to right stages, perception through generations, so the flow through the organism
// is a picture instead of a claim.

const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

export const CEREBRUM = { c: [0, 0.06, 0], r: [0.80, 0.80, 1.22] };
export const CEREBELLUM = { c: [0, -0.60, -0.82], r: [0.50, 0.27, 0.34] };
export const STEM = { top: [0, -0.16, -0.14], bot: [0, -1.02, -0.30], rTop: 0.16, rBot: 0.09 };
const SHELL = 0.90, FOLD = 0.085;
const MID_GAP = 0.055;

export const REGION_SPEC = {
  perception: { anchor: [0.30, 0.02, -0.82], color: [0.22, 0.91, 1.00], where: 'occipital, at the back', shape: 'cortex' },
  association: { anchor: [0.74, 0.04, -0.04], color: [0.72, 0.49, 1.00], where: 'parietal and temporal', shape: 'cortex' },
  cognitive: { anchor: [0.34, 0.30, 0.66], color: [1.00, 0.82, 0.40], where: 'frontal, front and high', shape: 'cortex' },
  motor: { anchor: [0.46, 0.56, 0.12], color: [0.31, 0.96, 0.64], where: 'the central strip', shape: 'strip' },
  memory: { anchor: [0.26, -0.22, -0.18], color: [0.36, 0.55, 1.00], where: 'hippocampus, deep and medial', shape: 'arc' },
  homeostasis: { anchor: [0.00, -0.60, -0.22], color: [1.00, 0.62, 0.35], where: 'the brainstem', shape: 'stem' },
  generations: { anchor: [0.00, -0.60, -0.82], color: [1.00, 0.42, 0.56], where: 'the cerebellum', shape: 'cerebellum' },
};
export const PIPELINE_ORDER = ['perception', 'association', 'cognitive', 'memory', 'motor', 'homeostasis', 'generations'];

// Sulci: two out of phase ripples over the sphere, one coarse and one fine, so the shell
// is corrugated the way a cortex is rather than smooth like an egg.
export function sulcus(dx, dy, dz, freq) {
  const len = Math.hypot(dx, dy, dz) || 1;
  const x = dx / len, y = dy / len, z = dz / len;
  const u = Math.atan2(z, x);
  const v = Math.asin(clamp(y, -1, 1));
  const f = freq || 1;
  return 0.62 * Math.sin(f * 5.0 * u + 1.7 * Math.sin(f * 3.0 * v)) + 0.38 * Math.cos(f * 7.0 * v + 0.9 * Math.sin(f * 4.0 * u));
}

// The radius multiplier of a cerebral hemisphere in a direction: flat base, temporal
// bulge, pointed occipital pole, slightly narrower frontal pole.
export function cerebralProfile(x, y, z) {
  const len = Math.hypot(x, y, z) || 1;
  const ax = Math.abs(x) / len, uy = y / len, uz = z / len;
  let r = 1;
  if (uy < 0) r *= 1 - 0.26 * Math.pow(-uy, 1.6);
  const tl = Math.exp(-(((uz - 0.12) * (uz - 0.12)) / 0.34 + ((uy + 0.58) * (uy + 0.58)) / 0.12 + ((ax - 0.62) * (ax - 0.62)) / 0.75));
  r *= 1 + 0.34 * tl;
  r *= 1 + 0.08 * Math.pow(Math.max(0, -uz), 2) - 0.05 * Math.pow(Math.max(0, uz), 3);
  return r;
}

function fibDir(i, n) {
  const y = n === 1 ? 0 : 1 - (2 * i + 1) / n;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const a = i * GOLDEN;
  return [r * Math.cos(a), y, r * Math.sin(a)];
}
function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function dot3(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function norm(a) { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }

// Every direction on the sheet goes to the nearest anchor, then each territory is sorted
// by angle around its own anchor so consecutive slices are contiguous patches.
function territories(anchors, samples) {
  const buckets = anchors.map(() => []);
  for (let i = 0; i < samples; i++) {
    const d = fibDir(i, samples);
    const x = Math.abs(d[0]), y = d[1], z = d[2];
    let best = 0, bestD = Infinity;
    for (let r = 0; r < anchors.length; r++) {
      const a = anchors[r];
      const dd = (x - a[0]) * (x - a[0]) + (y - a[1]) * (y - a[1]) + (z - a[2]) * (z - a[2]);
      if (dd < bestD) { bestD = dd; best = r; }
    }
    buckets[best].push([x, y, z]);
  }
  return buckets.map((b, r) => {
    const a = anchors[r];
    const up = Math.abs(a[1]) < 0.9 ? [0, 1, 0] : [0, 0, 1];
    const t1 = norm(cross(up, a)), t2 = norm(cross(a, t1));
    return b.map(v => ({ v, ang: Math.atan2(dot3(v, t2), dot3(v, t1)) })).sort((p, q) => p.ang - q.ang).map(it => it.v);
  });
}

// The hippocampal arc: a curved tube, medial and deep, sweeping from the front of the
// temporal lobe back and up. Memory is not a ball.
function arcPoint(t) {
  const a = -0.55 + 2.05 * t;
  return [0.20 + 0.13 * Math.sin(2.2 * t), -0.30 + 0.30 * Math.sin(a * 0.75), 0.24 - 0.62 * Math.cos(a * 0.62)];
}
// The central strip: a band arching over the top from the midline out to the side.
function stripPoint(u) {
  const a = u * 1.35;
  return [0.06 + 0.86 * Math.sin(a), 0.74 * Math.cos(a * 0.85), 0.12 + 0.10 * Math.sin(a * 1.7)];
}
function stemPoint(t) {
  return [STEM.top[0] + (STEM.bot[0] - STEM.top[0]) * t, STEM.top[1] + (STEM.bot[1] - STEM.top[1]) * t, STEM.top[2] + (STEM.bot[2] - STEM.top[2]) * t];
}

/**
 * Anatomy layout.
 * @param {Array} cells cells in build order, each with region and circuit
 * @param {number} scale world units per normalised unit
 * @returns {{pos: Float32Array, fold: Float32Array, regionOf: Array<string>}}
 */
export function brainLayout(cells, scale) {
  const S = scale || 100;
  const n = cells.length;
  const pos = new Float32Array(n * 3);
  const fold = new Float32Array(n);

  // group: region -> circuit -> members, in build order
  const byRegion = new Map();
  for (const c of cells) {
    let r = byRegion.get(c.region);
    if (!r) { r = new Map(); byRegion.set(c.region, r); }
    let l = r.get(c.circuit);
    if (!l) { l = []; r.set(c.circuit, l); }
    l.push(c.idx);
  }
  const names = [...byRegion.keys()];
  const cortexNames = names.filter(nm => (REGION_SPEC[nm] || {}).shape === 'cortex');
  const anchors = cortexNames.map(nm => norm([Math.abs(REGION_SPEC[nm].anchor[0]), REGION_SPEC[nm].anchor[1], REGION_SPEC[nm].anchor[2]]));
  const terr = territories(anchors, Math.max(4000, Math.min(48000, n * 5)));

  for (const name of names) {
    const spec = REGION_SPEC[name] || { shape: 'cortex', anchor: [0.7, 0, 0] };
    const circuits = [...byRegion.get(name).keys()];
    const k = circuits.length;
    const ti = cortexNames.indexOf(name);
    const sheet = ti >= 0 ? terr[ti] : null;
    // How many cells this region has in total, which is what decides the STRIDE across its
    // territory below. Without it a region with 2112 cells took the first 2112 of its 16000
    // sheet directions, and since the directions are sorted by angle around the anchor that
    // prefix is a WEDGE: the organism came out as three fans with the top of the cerebrum
    // bare. Striding covers the whole territory and still keeps each circuit contiguous.
    let regionTotal = 0;
    for (const ci2 of circuits) regionTotal += byRegion.get(name).get(ci2).length;
    let taken = 0;
    for (let ci = 0; ci < k; ci++) {
      const members = byRegion.get(name).get(circuits[ci]);
      const side = ci % 2 === 0 ? 1 : -1;
      for (let j = 0; j < members.length; j++) {
        const i = members[j];
        const u = (ci + (j + 0.5) / members.length) / k;
        let p;
        if (sheet && sheet.length) {
          const at = Math.min(sheet.length - 1, Math.floor(((taken + j) * sheet.length) / Math.max(1, regionTotal)));
          p = cortexPoint(sheet[at], side, j, members.length);
        } else if (spec.shape === 'strip') {
          // motor: the first half of the circuits run the strip, the rest tuck into the
          // cerebellum, which is where motor coordination actually lives
          if (ci * 2 < k) {
            const b = stripPoint((ci * 2 / k) * 0.92 + (j / members.length) * 0.08);
            p = [side * b[0] * 0.78, b[1], b[2]];
            p = toShell(p, CEREBRUM, 0.52, 1, FOLD);
          } else {
            p = cerebellumPoint(u, j, members.length, side);
          }
        } else if (spec.shape === 'arc') {
          const b = arcPoint(clamp(u, 0, 1));
          const r = 0.045 + 0.02 * ((j % 3) / 3);
          const a = (j / members.length) * Math.PI * 2;
          p = [side * (b[0] + r * Math.cos(a)), b[1] + r * Math.sin(a), b[2] + r * 0.6 * Math.cos(a * 1.3)];
        } else if (spec.shape === 'stem') {
          const b = stemPoint(clamp(u, 0, 1));
          const rr = (STEM.rTop + (STEM.rBot - STEM.rTop) * u) * 0.78;
          const a = (j / members.length) * Math.PI * 2 + ci;
          p = [b[0] + rr * Math.cos(a) * side, b[1], b[2] + rr * Math.sin(a)];
        } else {
          p = cerebellumPoint(u, j, members.length, side);
        }
        if (Math.abs(p[0]) < MID_GAP) p[0] = (p[0] < 0 ? -1 : 1) * MID_GAP;
        pos[i * 3] = p[0] * S; pos[i * 3 + 1] = p[1] * S; pos[i * 3 + 2] = p[2] * S;
        fold[i] = foldAt(p, spec.shape);
      }
      taken += members.length;
    }
  }
  return { pos, fold };
}

// Put a direction on the folded cortical sheet, on one side, with a little depth so the
// sheet has thickness instead of being an infinitely thin skin.
function cortexPoint(d, side, j, m) {
  const depth = 1 - 0.055 * ((j * 7919) % 5) / 5;
  const prof = cerebralProfile(d[0], d[1], d[2]);
  const shell = (SHELL + FOLD * sulcus(d[0], d[1], d[2], 1)) * prof * depth;
  return [
    CEREBRUM.c[0] + side * d[0] * shell * CEREBRUM.r[0],
    CEREBRUM.c[1] + d[1] * shell * CEREBRUM.r[1],
    CEREBRUM.c[2] + d[2] * shell * CEREBRUM.r[2],
  ];
}
function toShell(p, E, amount, freq, amp) {
  const x = (p[0] - E.c[0]) / E.r[0], y = (p[1] - E.c[1]) / E.r[1], z = (p[2] - E.c[2]) / E.r[2];
  const d = Math.hypot(x, y, z) || 1e-6;
  const shell = (SHELL + amp * sulcus(x, y, z, freq)) * cerebralProfile(x, y, z);
  const kk = (d + (shell - d) * amount) / d;
  return [E.c[0] + x * kk * E.r[0], E.c[1] + y * kk * E.r[1], E.c[2] + z * kk * E.r[2]];
}
// The cerebellum: much finer folia than the cortex, which is exactly how it reads on a
// lateral view, a densely lined little mass tucked under the back of the cerebrum.
function cerebellumPoint(u, j, m, side) {
  const d = fibDir((Math.floor(u * 997) * 31 + j) % 1024, 1024);
  const shell = 0.92 + 0.06 * sulcus(d[0], d[1], d[2], 4.2);
  return [
    CEREBELLUM.c[0] + side * Math.abs(d[0]) * shell * CEREBELLUM.r[0],
    CEREBELLUM.c[1] + d[1] * shell * CEREBELLUM.r[1],
    CEREBELLUM.c[2] + d[2] * shell * CEREBELLUM.r[2],
  ];
}
// 0 at the bottom of a sulcus, 1 on the crown of a gyrus.
function foldAt(p, shape) {
  const x = (p[0] - CEREBRUM.c[0]) / CEREBRUM.r[0], y = (p[1] - CEREBRUM.c[1]) / CEREBRUM.r[1], z = (p[2] - CEREBRUM.c[2]) / CEREBRUM.r[2];
  const f = shape === 'stem' || shape === 'arc' ? 0.55 : 0.5 + 0.5 * sulcus(x, y, z, shape === 'cerebellum' ? 4.2 : 1);
  return clamp(f, 0, 1);
}

/**
 * The pipeline view: the same cells, in left to right stages along the flow.
 * @returns {Float32Array} positions
 */
export function pipelineLayout(cells, scale) {
  const S = scale || 100;
  const n = cells.length;
  const pos = new Float32Array(n * 3);
  const byRegion = new Map();
  for (const c of cells) {
    let l = byRegion.get(c.region);
    if (!l) { l = []; byRegion.set(c.region, l); }
    l.push(c.idx);
  }
  const order = PIPELINE_ORDER.filter(r => byRegion.has(r)).concat([...byRegion.keys()].filter(r => PIPELINE_ORDER.indexOf(r) < 0));
  const span = 2.9, x0 = -span / 2;
  for (let si = 0; si < order.length; si++) {
    const members = byRegion.get(order[si]);
    const m = members.length;
    const cols = Math.max(1, Math.round(Math.sqrt(m / 3)));
    const rows = Math.ceil(m / cols);
    const x = x0 + (order.length === 1 ? 0.5 : si / (order.length - 1)) * span;
    for (let j = 0; j < m; j++) {
      const i = members[j];
      const cx = j % cols, cy = Math.floor(j / cols);
      pos[i * 3] = (x + (cx / Math.max(1, cols - 1) - 0.5) * 0.20) * S;
      pos[i * 3 + 1] = ((cy / Math.max(1, rows - 1) - 0.5) * 1.55) * S;
      pos[i * 3 + 2] = ((cx / Math.max(1, cols - 1) - 0.5) * 0.44) * S;
    }
  }
  return pos;
}
