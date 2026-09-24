// viz/layout.mjs - THE MAP. A deterministic 3D layout for the organism, in the shape of
// a brain.
//
// THE VOLUME. Three masses, not one ball:
//
//   cerebrum     an ellipsoid, split into a left and a right hemisphere with an empty
//                midline gap between them. Cells sit in a CORTICAL SHEET near its
//                surface, and that surface is corrugated by a parametric sulcus function
//                so the silhouette has folds instead of being a smooth egg.
//   cerebellum   a smaller, much more finely folded ellipsoid at the back and bottom.
//   brainstem    a tapering capsule descending from under the cerebrum behind the
//                cerebellum's front face.
//
// THE MAP FROM REGIONS TO ANATOMY, which is the point of the whole file: a region is not
// a coloured blob at an arbitrary coordinate, it is a lobe.
//
//   cognitive      frontal lobe, front and high
//   perception     occipital lobe, at the back
//   association    parietal and temporal, the lateral surfaces on both sides
//   motor          the central strip, a band running over the top from the midline out
//                  to the side, plus the cerebellum for the circuits past the first
//                  (movement is cortex AND cerebellum, and the mass has to be populated)
//   memory         hippocampus: a curved arc deep and medial, not a sphere
//   homeostasis    the brainstem
//   anything else  a slot on a golden angle ring around the cortical surface
//
// Two stages, both deterministic (same brain + same seed = same coordinates, byte for
// byte): seed placement as above, then force refinement (springs on edges, short range
// repulsion through a uniform grid, an anchor spring home, and containment BY VOLUME so
// the refinement can never drag a brainstem cell up into the cortex).
//
// Coordinates are computed in normalized brain space and multiplied by `scale` at the
// very end, so the force constants never have to change when the world scale changes.
import { RNG } from '../core/rng.mjs';

// The three masses, in normalized space. y is up, +z is the front of the head.
export const CEREBRUM = Object.freeze({ c: [0, 0.06, 0], r: [0.82, 0.80, 1.14] });
export const CEREBELLUM = Object.freeze({ c: [0, -0.50, -0.78], r: [0.45, 0.25, 0.33] });
export const STEM = Object.freeze({ top: [0, -0.26, -0.30], bot: [0, -0.84, -0.44], rTop: 0.13, rBot: 0.08 });
// Kept as SHAPE for the renderer, which only wants one number for "how big is this".
export const SHAPE = Object.freeze([...CEREBRUM.r]);
// Half width of the empty midline gap between the two hemispheres.
export const MID_GAP = 0.055;
// Which mass a cell belongs to. Containment is per volume, so these are not decoration.
export const VOL = Object.freeze({ CEREBRUM: 0, CEREBELLUM: 1, STEM: 2 });

// Where the cortical sheet sits, as a fraction of the cerebrum radius, and how deep the
// folds cut into it.
const SHELL = 0.90, FOLD = 0.115, CORTEX_PULL = 0.62;

// THE SHEET RADIUS, and the reason it only ever cuts INWARD. A fold that pushes gyri out
// as far as it pushes sulci in eats the silhouette: the outline goes ragged and the brain
// stops being a brain shape. So the crown of a gyrus sits exactly on the profile and a
// sulcus is a groove cut into it, which is also what a real cortex does to a skull.
// Returns the radius as a fraction of the mass radius, and the fold coordinate 0..1.
export function sheetAt(x, y, z, foldAmp = FOLD, freq = 1) {
  const g = 0.5 + 0.5 * sulcus(x, y, z, freq);   // 0 at the bottom of a sulcus, 1 on a crown
  return { r: SHELL - foldAmp * (1 - g), fold: g };
}

export const REGIONS = Object.freeze({
  perception:  { anchor: [0.30,  0.02, -0.82], radius: 0.30, color: '#4ec4e0', where: 'occipital, back',        shape: 'cortex' },
  association: { anchor: [0.74,  0.04, -0.04], radius: 0.42, color: '#9a8cf0', where: 'parietal and temporal',  shape: 'cortex' },
  cognitive:   { anchor: [0.34,  0.30,  0.66], radius: 0.36, color: '#f0b45c', where: 'frontal, front and high', shape: 'cortex' },
  motor:       { anchor: [0.46,  0.56,  0.12], radius: 0.30, color: '#4fd398', where: 'central strip and cerebellum', shape: 'strip' },
  memory:      { anchor: [0.26, -0.22, -0.18], radius: 0.16, color: '#6f9bf2', where: 'hippocampus, deep medial', shape: 'arc' },
  homeostasis: { anchor: [0.00, -0.60, -0.22], radius: 0.14, color: '#f08a5c', where: 'brainstem',              shape: 'stem' },
});
export const REGION_ORDER = Object.freeze(['perception', 'association', 'cognitive', 'motor', 'memory', 'homeostasis']);

// The order signals actually flow in, which is what the pipeline view lays out left to
// right. It is not the same as REGION_ORDER: this one is the path through the organism.
export const PIPELINE_ORDER = Object.freeze([
  'perception', 'association', 'memory', 'cognitive', 'prediction', 'simulation', 'motor', 'homeostasis',
]);

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

// A stable colour for a region nobody named: golden angle around the hue circle,
// kept bright and saturated so it survives additive blending on black.
export function extraColor(i) {
  const h = (0.08 + i * 0.6180339887) % 1;
  return hslHex(h, 0.58, 0.68);
}
function hslHex(h, s, l) {
  const f = (n) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    const v = l - a * Math.max(-1, Math.min(Math.min(k - 3, 9 - k), 1));
    return Math.round(255 * v);
  };
  const hex = (v) => v.toString(16).padStart(2, '0');
  return '#' + hex(f(0)) + hex(f(8)) + hex(f(4));
}

// ---------------------------------------------------------------------- the volume
// Sulci. A sum of two out of phase ripples over the sphere, one coarse and one fine, so
// the shell is corrugated the way a cortex is rather than smooth like an egg. It is a
// pure function of direction, which is what keeps it deterministic and what lets the
// cerebellum reuse it at a higher frequency for its much finer folia.
export function sulcus(dx, dy, dz, freq = 1) {
  const len = Math.hypot(dx, dy, dz) || 1;
  const x = dx / len, y = dy / len, z = dz / len;
  const u = Math.atan2(z, x);            // around the vertical axis
  const v = Math.asin(clamp(y, -1, 1));  // elevation
  const coarse = Math.sin(freq * 6.5 * u + 1.7 * Math.sin(freq * 3.5 * v));
  const fine = Math.cos(freq * 9.0 * v + 0.9 * Math.sin(freq * 5.0 * u));
  return 0.62 * coarse + 0.38 * fine;
}

/**
 * THE PROFILE OF A CEREBRAL HEMISPHERE. An ellipsoid is a balloon; a brain has a
 * frontal pole, a pointed occipital pole, a temporal lobe hanging low and lateral, and a
 * flattened base where it sits on the skull. This returns the radius multiplier for a
 * direction in the cerebrum's own normalised space, and it is used both to place cells
 * and to decide what is inside, so the two can never disagree.
 * @param {number} x lateral (mirrored, so the sign does not matter)
 * @param {number} y up
 * @param {number} z forward (the frontal pole is +z, the occipital pole is -z)
 */
export function cerebralProfile(x, y, z) {
  const len = Math.hypot(x, y, z) || 1;
  const ax = Math.abs(x) / len, uy = y / len, uz = z / len;
  let r = 1;
  // the base is flat: the brain sits on it
  if (uy < 0) r *= 1 - 0.15 * Math.pow(-uy, 2.2);
  // the temporal lobe: a bulge low, lateral and slightly forward, which is the single
  // feature that most says "brain" in a lateral silhouette
  const tl = Math.exp(-(((uz - 0.20) * (uz - 0.20)) / 0.30 + ((uy + 0.66) * (uy + 0.66)) / 0.12 + ((ax - 0.60) * (ax - 0.60)) / 0.80));
  r *= 1 + 0.34 * tl;
  // THE SYLVIAN FISSURE. The one groove a lateral view cannot do without: the deep
  // horizontal cleft that separates the temporal lobe from the frontal and parietal
  // lobes above it. It is cut into the radius, so cells placed on the sheet fall into
  // it and the eye reads a cleft rather than a seam painted on a balloon.
  const syl = Math.exp(-(((uy + 0.34) * (uy + 0.34)) / 0.012 + ((uz - 0.20) * (uz - 0.20)) / 0.55));
  r *= 1 - 0.20 * syl * Math.min(1, Math.max(0, (ax - 0.16) / 0.30));
  // a pointed occipital pole behind, a slightly narrower frontal pole in front, and the
  // brow: the frontal lobe is full at the top and tucks under toward the eyes
  r *= 1 + 0.10 * Math.pow(Math.max(0, -uz), 2) - 0.05 * Math.pow(Math.max(0, uz), 3);
  r *= 1 - 0.14 * Math.exp(-(((uz - 0.72) * (uz - 0.72)) / 0.10 + ((uy + 0.42) * (uy + 0.42)) / 0.20));
  return r;
}

function inEllipsoid(x, y, z, E, margin) {
  const a = (x - E.c[0]) / (E.r[0] * margin);
  const b = (y - E.c[1]) / (E.r[1] * margin);
  const c = (z - E.c[2]) / (E.r[2] * margin);
  return a * a + b * b + c * c <= 1;
}
function inStem(x, y, z, margin) {
  const dx = STEM.bot[0] - STEM.top[0], dy = STEM.bot[1] - STEM.top[1], dz = STEM.bot[2] - STEM.top[2];
  const len2 = dx * dx + dy * dy + dz * dz;
  let t = ((x - STEM.top[0]) * dx + (y - STEM.top[1]) * dy + (z - STEM.top[2]) * dz) / len2;
  t = clamp(t, 0, 1);
  const px = STEM.top[0] + dx * t, py = STEM.top[1] + dy * t, pz = STEM.top[2] + dz * t;
  const r = (STEM.rTop + (STEM.rBot - STEM.rTop) * t) * margin;
  return (x - px) ** 2 + (y - py) ** 2 + (z - pz) ** 2 <= r * r;
}

/**
 * Is this point inside the brain at all: cerebrum, cerebellum or brainstem.
 * The margin is multiplicative and exists because the cortical fold pushes cells a few
 * percent past the nominal shell by design.
 */
export function insideBrain(x, y, z, margin = 1.06) {
  return inCerebrum(x, y, z, margin) || inEllipsoid(x, y, z, CEREBELLUM, margin) || inStem(x, y, z, margin);
}
function inCerebrum(x, y, z, margin) {
  const a = (x - CEREBRUM.c[0]) / CEREBRUM.r[0];
  const b = (y - CEREBRUM.c[1]) / CEREBRUM.r[1];
  const c = (z - CEREBRUM.c[2]) / CEREBRUM.r[2];
  const d = Math.hypot(a, b, c);
  return d <= cerebralProfile(a, b, c) * margin;
}

// Push a point back inside ITS OWN mass. A cell of the brainstem that wanders is pulled
// back into the brainstem, not into the nearest cortex: the anatomy is a constraint the
// refinement is not allowed to negotiate with.
function contain(pos, i, vol, margin = 0.995, onSheet = false) {
  const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
  if (vol === VOL.STEM) {
    if (inStem(x, y, z, margin)) return;
    const dx = STEM.bot[0] - STEM.top[0], dy = STEM.bot[1] - STEM.top[1], dz = STEM.bot[2] - STEM.top[2];
    const len2 = dx * dx + dy * dy + dz * dz;
    const t = clamp(((x - STEM.top[0]) * dx + (y - STEM.top[1]) * dy + (z - STEM.top[2]) * dz) / len2, 0, 1);
    const px = STEM.top[0] + dx * t, py = STEM.top[1] + dy * t, pz = STEM.top[2] + dz * t;
    const r = (STEM.rTop + (STEM.rBot - STEM.rTop) * t) * margin;
    const ox = x - px, oy = y - py, oz = z - pz;
    const d = Math.hypot(ox, oy, oz) || 1e-6;
    const k = r / d;
    pos[i * 3] = px + ox * k; pos[i * 3 + 1] = py + oy * k; pos[i * 3 + 2] = pz + oz * k;
    return;
  }
  const E = vol === VOL.CEREBELLUM ? CEREBELLUM : CEREBRUM;
  const a = (x - E.c[0]) / E.r[0], b = (y - E.c[1]) / E.r[1], c = (z - E.c[2]) / E.r[2];
  const d = Math.sqrt(a * a + b * b + c * c);
  const lim = (vol === VOL.CEREBELLUM ? 1 : cerebralProfile(a, b, c)) * margin;
  // A CELL BODY THAT WAS PLACED ON THE SHEET STAYS ON THE SHEET. Containment that only
  // says "inside the volume" lets the springs drag the cortex into the middle, and a
  // filled volume is a ball of fog: the folds go, the profile goes, and what is left
  // reads as a cloud and not as a brain. The sheet cells are held in a thin band around
  // the folded surface and are free to move only along it.
  if (onSheet && d > 0) {
    const foldAmp = vol === VOL.CEREBELLUM ? 0.055 : FOLD;
    const freq = vol === VOL.CEREBELLUM ? 3.2 : 1;
    const prof = vol === VOL.CEREBELLUM ? 1 : cerebralProfile(a, b, c);
    const shell = sheetAt(a, b, c, foldAmp, freq).r * prof;
    const band = foldAmp * 0.40;
    const want = clamp(d, shell - band, shell + band);
    if (Math.abs(want - d) > 1e-9) {
      const q = want / d;
      pos[i * 3] = E.c[0] + (x - E.c[0]) * q;
      pos[i * 3 + 1] = E.c[1] + (y - E.c[1]) * q;
      pos[i * 3 + 2] = E.c[2] + (z - E.c[2]) * q;
    }
    return;
  }
  if (d <= lim || d === 0) return;
  const k = lim / d;
  pos[i * 3] = E.c[0] + (x - E.c[0]) * k;
  pos[i * 3 + 1] = E.c[1] + (y - E.c[1]) * k;
  pos[i * 3 + 2] = E.c[2] + (z - E.c[2]) * k;
}

// Pull a cell out onto the folded cortical sheet of its mass. In a real brain the cell
// bodies crowd a sheet near the surface and the interior is mostly wiring, and the folds
// are what make a brain look like a brain rather than like a balloon.
function toCortex(pos, i, E, amount, foldFreq, foldAmp) {
  const x = (pos[i * 3] - E.c[0]) / E.r[0];
  const y = (pos[i * 3 + 1] - E.c[1]) / E.r[1];
  const z = (pos[i * 3 + 2] - E.c[2]) / E.r[2];
  const d = Math.hypot(x, y, z);
  if (d < 1e-6) return;
  const shell = sheetAt(x, y, z, foldAmp, foldFreq).r * (E === CEREBRUM ? cerebralProfile(x, y, z) : 1);
  const target = d + (shell - d) * amount;
  const k = target / d;
  pos[i * 3] = E.c[0] + x * k * E.r[0];
  pos[i * 3 + 1] = E.c[1] + y * k * E.r[1];
  pos[i * 3 + 2] = E.c[2] + z * k * E.r[2];
}

// Unit vector i of n on a fibonacci sphere. Even coverage, no clumping at the poles.
function fibDir(i, n) {
  const y = n === 1 ? 0 : 1 - (2 * i + 1) / n;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const a = i * GOLDEN_ANGLE;
  return [r * Math.cos(a), y, r * Math.sin(a)];
}

// THE CORTEX, PARTITIONED. Every direction on the cerebral surface is given to the region
// whose anchor is nearest, so the cortical regions together cover the whole sheet instead
// of each huddling in a ball around its own anchor. That coverage is what makes five
// thousand points read as a brain at a glance rather than as a handful of blobs, and it is
// still a pure function of the anchors, so it stays deterministic.
function cortexTerritories(anchors, samples) {
  const buckets = anchors.map(() => []);
  for (let i = 0; i < samples; i++) {
    const d = fibDir(i, samples);
    const x = Math.abs(d[0]), y = d[1], z = d[2];   // one hemisphere, mirrored on placement
    let best = 0, bestD = Infinity;
    for (let r = 0; r < anchors.length; r++) {
      const a = anchors[r];
      const dd = (x - a[0]) ** 2 + (y - a[1]) ** 2 + (z - a[2]) ** 2;
      if (dd < bestD) { bestD = dd; best = r; }
    }
    buckets[best].push(x, y, z);
  }
  // inside a territory, order by the angle around the anchor so that consecutive slices
  // of the list are contiguous patches: one circuit, one patch of cortex
  return buckets.map((b, r) => {
    const a = anchors[r];
    const up = Math.abs(a[1]) < 0.9 ? [0, 1, 0] : [0, 0, 1];
    const t1 = norm(cross(up, a)), t2 = norm(cross(a, t1));
    const items = [];
    for (let i = 0; i < b.length; i += 3) {
      const v = [b[i], b[i + 1], b[i + 2]];
      items.push({ v, ang: Math.atan2(dot(v, t2), dot(v, t1)) });
    }
    items.sort((p1, p2) => p1.ang - p2.ang);
    return items.map(it => it.v);
  });
}
function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function norm(a) { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }

// Where an unnamed region sits: a ring over the cortical surface, alternating high and low.
function ringAnchor(i, total) {
  const a = i * GOLDEN_ANGLE + 0.7;
  const y = 0.10 + 0.34 * Math.sin(i * 1.7);
  const r = 0.70;
  return { anchor: [Math.abs(r * Math.cos(a)) + 0.18, y, r * Math.sin(a)], radius: 0.24, color: extraColor(i + total), shape: 'cortex', where: 'cortical surface' };
}

// The hippocampal arc: a curved tube, medial and deep, sweeping from the front of the
// temporal lobe back and up. A sphere of dots here would be a lie about what memory is
// shaped like, and it is the one structure his reference image draws as a curve.
function arcPoint(t) {
  const a = -0.55 + 2.05 * t;
  return [
    0.20 + 0.13 * Math.sin(2.2 * t),
    -0.30 + 0.30 * Math.sin(a * 0.75),
    0.24 - 0.62 * Math.cos(a * 0.62),
  ];
}

// The central strip: a band arching over the top from the midline out to the side, the
// way the precentral gyrus does. Parameterised by u from midline (0) to lateral (1).
function stripPoint(u) {
  const a = u * 1.35;
  return [0.06 + 0.86 * Math.sin(a), 0.74 * Math.cos(a * 0.85), 0.12 + 0.10 * Math.sin(a * 1.7)];
}

/**
 * Deterministic layout from a plain description of a graph.
 * @param {object} o
 * @param {Array<{idx:number, region:string, circuit:string}>} o.cells
 * @param {{src:ArrayLike<number>, dst:ArrayLike<number>, w?:ArrayLike<number>}|null} o.edges
 * @param {string|number} o.seed
 * @param {number} o.iterations force refinement iterations (0 = seed placement only)
 * @param {number} o.scale world units per normalized unit
 */
export function computeLayout({ cells, edges = null, seed = 'brain', iterations = 240, scale = 100 } = {}) {
  const n = cells.length;
  const pos = new Float32Array(n * 3);
  const vols = new Uint8Array(n);
  // Where in the fold each cell sits, 0 at the bottom of a sulcus and 1 on the crown of a
  // gyrus. The renderer darkens the grooves with it, which is what turns a smooth shell
  // into a folded cortex on screen.
  const folds = new Float32Array(n).fill(0.5);
  // 1 = this cell body belongs to a cortical sheet and may not leave it
  const sheets = new Uint8Array(n);
  // group: region -> circuit -> [cell idx], in a deterministic order
  const byRegion = new Map();
  for (const c of cells) {
    const rn = c.region || 'default';
    let r = byRegion.get(rn);
    if (!r) { r = new Map(); byRegion.set(rn, r); }
    const cn = c.circuit || 'default';
    let l = r.get(cn);
    if (!l) { l = []; r.set(cn, l); }
    l.push(c.idx);
  }
  const named = REGION_ORDER.filter(r => byRegion.has(r));
  const extra = [...byRegion.keys()].filter(r => !REGIONS[r]).sort();
  const regionNames = [...named, ...extra];

  const rng = new RNG('layout:' + seed);
  // which regions live on the cortical sheet, and the slice of it each one owns
  const specOf = (name, i) => REGIONS[name] || ringAnchor(extra.indexOf(name), REGION_ORDER.length);
  const cortexNames = regionNames.filter(nm => (specOf(nm) .shape || 'cortex') === 'cortex');
  const cortexAnchors = cortexNames.map(nm => {
    const a = specOf(nm).anchor;
    return norm([Math.abs(a[0]), a[1], a[2]]);
  });
  const territories = cortexTerritories(cortexAnchors, Math.max(4000, Math.min(60000, n * 6)));
  const territoryOf = new Map(cortexNames.map((nm, i) => [nm, territories[i]]));
  const regionsOut = [];
  for (let ri = 0; ri < regionNames.length; ri++) {
    const name = regionNames[ri];
    const spec = REGIONS[name] || ringAnchor(extra.indexOf(name), REGION_ORDER.length);
    const circuits = [...byRegion.get(name).keys()].sort();
    const k = circuits.length;
    let count = 0;
    for (let ci = 0; ci < k; ci++) {
      const members = byRegion.get(name).get(circuits[ci]);
      const m = members.length;
      // Motor is cortex AND cerebellum: the first half of its circuits run the strip,
      // the rest populate the cerebellar mass. One region, two anatomical homes.
      const toCerebellum = spec.shape === 'strip' && k > 1 && ci % 2 === 1;
      const shape = toCerebellum ? 'cerebellum' : spec.shape;
      const vol = shape === 'stem' ? VOL.STEM : shape === 'cerebellum' ? VOL.CEREBELLUM : VOL.CEREBRUM;
      for (let j = 0; j < m; j++) {
        const idx = members[j];
        const u = m === 1 ? 0.5 : j / (m - 1);
        const d = fibDir(j, m);
        let x, y, z, jit;
        if (shape === 'stem') {
          // down the capsule, a little off axis
          const t = (ci + u) / Math.max(1, k);
          const dxs = STEM.bot[0] - STEM.top[0], dys = STEM.bot[1] - STEM.top[1], dzs = STEM.bot[2] - STEM.top[2];
          const rr = (STEM.rTop + (STEM.rBot - STEM.rTop) * t) * 0.78;
          x = STEM.top[0] + dxs * t + d[0] * rr;
          y = STEM.top[1] + dys * t + d[1] * rr * 0.35;
          z = STEM.top[2] + dzs * t + d[2] * rr;
          jit = rr * 0.16;
        } else if (shape === 'cerebellum') {
          const cdir = fibDir(ci, k);
          const rad = 0.78 * Math.cbrt((j + 0.5) / m);
          x = CEREBELLUM.c[0] + (cdir[0] * 0.35 + d[0] * rad) * CEREBELLUM.r[0];
          y = CEREBELLUM.c[1] + (cdir[1] * 0.35 + d[1] * rad) * CEREBELLUM.r[1];
          z = CEREBELLUM.c[2] + (cdir[2] * 0.35 + d[2] * rad) * CEREBELLUM.r[2];
          jit = 0.012;
        } else if (shape === 'arc') {
          const t = (ci + u) / Math.max(1, k);
          const p = arcPoint(t);
          const rr = spec.radius * 0.55;
          x = p[0] + d[0] * rr; y = p[1] + d[1] * rr * 0.7; z = p[2] + d[2] * rr;
          jit = rr * 0.18;
        } else if (shape === 'strip') {
          const t = (ci / Math.max(1, k)) * 0.22 + u * 0.78;
          const p = stripPoint(t);
          const rr = spec.radius * 0.30;
          x = p[0] + d[0] * rr; y = p[1] + d[1] * rr; z = p[2] + d[2] * rr * 1.6;
          jit = rr * 0.22;
        } else {
          // A patch of the cortical sheet. The circuit takes a contiguous arc of the
          // region's territory and its cells spread along that arc, so a circuit is a
          // local cluster on the surface and the region covers its whole lobe.
          const terr = territoryOf.get(name) || [];
          const L = terr.length;
          const arcLen = Math.max(1, Math.floor(L / k));
          const arc0 = Math.min(L - 1, ci * arcLen);
          const pick = L ? terr[(arc0 + Math.floor(((j + 0.5) * arcLen) / m)) % L] : fibDir(j, m);
          // most cell bodies crowd the folded sheet, the rest sit deeper in the white
          // matter, which is what gives the cloud thickness instead of a hollow shell
          // Almost every cell body sits ON the sheet. A shell that is also filled reads
          // as a ball of fog and the folds vanish; the handful that go deeper are the
          // ones that give the mass any thickness at all.
          const layer = (j * 7 + ci * 3) % 20;
          const depth = layer < 17 ? 1.0 : layer < 19 ? 0.86 : 0.70;
          const sheet = sheetAt(pick[0], pick[1], pick[2]);
          folds[idx] = sheet.fold;
          const rr = sheet.r * depth * cerebralProfile(pick[0], pick[1], pick[2]);
          x = CEREBRUM.c[0] + pick[0] * rr * CEREBRUM.r[0];
          y = CEREBRUM.c[1] + pick[1] * rr * CEREBRUM.r[1];
          z = CEREBRUM.c[2] + pick[2] * rr * CEREBRUM.r[2];
          jit = depth === 1.0 ? 0.004 : 0.012;
          sheets[idx] = depth === 1.0 ? 1 : 0;
        }
        x += rng.gauss() * jit; y += rng.gauss() * jit; z += rng.gauss() * jit;

        // Hemispheres. Every structure except the brainstem, which is a midline organ,
        // is thrown to a left or a right lobe with an empty gap down the middle. The
        // circuit picks the side, so a circuit is never sliced in half by the midline.
        if (vol !== VOL.STEM) {
          const hemi = (k === 1 ? (j & 1) : (ci & 1)) ? -1 : 1;
          const gap = vol === VOL.CEREBELLUM ? MID_GAP * 0.55 : MID_GAP;
          x = hemi * (gap + Math.abs(x));
        }
        pos[idx * 3] = x; pos[idx * 3 + 1] = y; pos[idx * 3 + 2] = z;
        vols[idx] = vol;
        if (vol === VOL.CEREBRUM && shape !== 'arc' && shape !== 'cortex') toCortex(pos, idx, CEREBRUM, CORTEX_PULL, 1, FOLD);
        // the cerebellum's folia are much finer than the cortex's gyri, and at a glance
        // that difference in texture is most of what says "cerebellum"
        if (vol === VOL.CEREBELLUM) {
          toCortex(pos, idx, CEREBELLUM, 0.72, 3.2, 0.055);
          const fx = (pos[idx * 3] - CEREBELLUM.c[0]) / CEREBELLUM.r[0];
          const fy = (pos[idx * 3 + 1] - CEREBELLUM.c[1]) / CEREBELLUM.r[1];
          const fz = (pos[idx * 3 + 2] - CEREBELLUM.c[2]) / CEREBELLUM.r[2];
          folds[idx] = sheetAt(fx, fy, fz, 0.055, 3.2).fold;
          sheets[idx] = 1;
        }
        contain(pos, idx, vol, 0.995, sheets[idx] === 1);
        count++;
      }
    }
    regionsOut.push({
      name, color: spec.color, where: spec.where || '',
      center: spec.anchor.map(v => v * scale), radius: spec.radius * scale,
      cells: count, circuits: k,
    });
  }

  const seedPos = pos.slice();
  let stats = { iterations: 0, meanEdgeBefore: 0, meanEdgeAfter: 0, minDistBefore: 0, minDistAfter: 0, ms: 0 };
  if (iterations > 0 && n > 1) stats = refine(pos, edges, { iterations, anchor: seedPos, volumes: vols, sheets });

  for (let i = 0; i < pos.length; i++) pos[i] *= scale;
  return { n, pos, seedPos, vols, folds, sheets, regions: regionsOut, iterations, stats, scale, shape: [...SHAPE] };
}

/**
 * THE PIPELINE VIEW. The same cells, laid out as stages left to right in the order
 * signals actually move through them, so the transmission reads as a production line:
 * perception on the left, motor on the right, every edge crossing the gaps between.
 *
 * Deterministic and cheap (no refinement): it is a re-reading of the same cells, and it
 * has to line up frame for frame with the anatomical layout it is toggled against.
 */
export function pipelineLayout({ cells, seed = 'brain', scale = 100, span = 2.6, height = 1.5 } = {}) {
  const n = cells.length;
  const pos = new Float32Array(n * 3);
  const byRegion = new Map();
  for (const c of cells) {
    const rn = c.region || 'default';
    if (!byRegion.has(rn)) byRegion.set(rn, []);
    byRegion.get(rn).push(c);
  }
  const present = [...byRegion.keys()];
  const ordered = [
    ...PIPELINE_ORDER.filter(r => byRegion.has(r)),
    ...present.filter(r => !PIPELINE_ORDER.includes(r)).sort(),
  ];
  const S = ordered.length;
  const rng = new RNG('pipeline:' + seed);
  const stages = [];
  for (let si = 0; si < S; si++) {
    const name = ordered[si];
    const members = byRegion.get(name).slice().sort((a, b) => a.idx - b.idx);
    const x = S === 1 ? 0 : -span + (2 * span * si) / (S - 1);
    // inside a stage: circuits become rows, cells fill a disc, so a stage reads as a
    // slab of the pipeline with its own internal structure
    const circuits = [...new Set(members.map(c => c.circuit || 'default'))].sort();
    const ci = new Map(circuits.map((c, i) => [c, i]));
    const m = members.length;
    for (let j = 0; j < m; j++) {
      const c = members[j];
      const k = ci.get(c.circuit || 'default');
      const ang = (j / Math.max(1, m)) * Math.PI * 2 * 7.3 + k * 1.1;
      const rad = height * 0.52 * Math.sqrt((j + 0.5) / m);
      pos[c.idx * 3] = x + rng.gauss() * 0.02;
      pos[c.idx * 3 + 1] = Math.cos(ang) * rad + rng.gauss() * 0.01;
      pos[c.idx * 3 + 2] = Math.sin(ang) * rad * 0.62 + rng.gauss() * 0.01;
    }
    stages.push({ name, index: si, x: x * scale, cells: m, circuits: circuits.length });
  }
  for (let i = 0; i < pos.length; i++) pos[i] *= scale;
  return { n, pos, stages, order: ordered, scale };
}
export function refine(pos, edges, {
  iterations = 240,
  anchor = null,
  cutoff = 0.085,       // repulsion radius
  repulsion = 0.0055,   // repulsion gain
  spring = 0.030,       // edge spring gain, divided per cell by its degree
  rest = 0.055,         // spring rest length
  anchorPull = 0.25,    // pull back to the seeded position
  maxStep = 0.012,      // per iteration displacement cap before cooling
  maxDrift = 0.12,      // hard cap on how far a cell may leave its seeded position
  maxPerCell = 64,      // grid occupancy cap: bounds the worst case
  volumes = null,       // per cell mass id, so containment keeps the anatomy apart
  sheets = null,        // per cell: 1 = a cortical cell body, held on its folded sheet
} = {}) {
  const t0 = Date.now();
  const n = pos.length / 3;
  const src = edges && edges.src ? edges.src : [];
  const dst = edges && edges.dst ? edges.dst : [];
  const ew = edges && edges.w ? edges.w : null;
  const m = Math.min(src.length, dst.length);
  const fx = new Float32Array(n), fy = new Float32Array(n), fz = new Float32Array(n);
  const before = measure(pos, src, dst, m);

  // A cell with eighty edges must not be dragged eighty times harder than a cell with
  // one, or a dense graph folds into a ball and the regions stop existing. The spring
  // gain is divided by the degree, and on top of that no cell may drift further than
  // maxDrift from where the seed placement put it: the lobes are a constraint, not a hope.
  const deg = new Float32Array(n);
  for (let e = 0; e < m; e++) { if (src[e] < n) deg[src[e]]++; if (dst[e] < n) deg[dst[e]]++; }
  for (let i = 0; i < n; i++) deg[i] = 1 / (1 + deg[i] / 6);

  const counts = [], list = new Uint32Array(n);
  for (let it = 0; it < iterations; it++) {
    fx.fill(0); fy.fill(0); fz.fill(0);
    // ---- uniform grid over the current positions
    let minX = Infinity, minY = Infinity, minZ = Infinity, maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (let i = 0; i < n; i++) {
      const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
      if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
    }
    const gx = Math.max(1, Math.min(96, Math.ceil((maxX - minX) / cutoff) || 1));
    const gy = Math.max(1, Math.min(96, Math.ceil((maxY - minY) / cutoff) || 1));
    const gz = Math.max(1, Math.min(96, Math.ceil((maxZ - minZ) / cutoff) || 1));
    const G = gx * gy * gz;
    if (counts.length !== G + 1) { counts.length = 0; for (let i = 0; i <= G; i++) counts.push(0); }
    else counts.fill(0);
    const cellOf = (i) => {
      const a = Math.min(gx - 1, Math.max(0, Math.floor((pos[i * 3] - minX) / cutoff)));
      const b = Math.min(gy - 1, Math.max(0, Math.floor((pos[i * 3 + 1] - minY) / cutoff)));
      const c = Math.min(gz - 1, Math.max(0, Math.floor((pos[i * 3 + 2] - minZ) / cutoff)));
      return (c * gy + b) * gx + a;
    };
    for (let i = 0; i < n; i++) counts[cellOf(i) + 1]++;
    for (let i = 0; i < G; i++) counts[i + 1] += counts[i];
    const fill = counts.slice();
    for (let i = 0; i < n; i++) list[fill[cellOf(i)]++] = i;

    // ---- repulsion: only pairs inside the cutoff, only inside the 27 neighbour cells
    const cut2 = cutoff * cutoff;
    for (let a = 0; a < gx; a++) for (let b = 0; b < gy; b++) for (let c = 0; c < gz; c++) {
      const gi = (c * gy + b) * gx + a;
      const s0 = counts[gi], e0 = Math.min(counts[gi + 1], counts[gi] + maxPerCell);
      if (e0 <= s0) continue;
      for (let da = -1; da <= 1; da++) for (let db = -1; db <= 1; db++) for (let dc = -1; dc <= 1; dc++) {
        const na = a + da, nb = b + db, nc = c + dc;
        if (na < 0 || nb < 0 || nc < 0 || na >= gx || nb >= gy || nc >= gz) continue;
        const gj = (nc * gy + nb) * gx + na;
        if (gj < gi) continue; // each unordered pair of cells once
        const s1 = counts[gj], e1 = Math.min(counts[gj + 1], counts[gj] + maxPerCell);
        for (let p = s0; p < e0; p++) {
          const i = list[p];
          const q0 = gj === gi ? p + 1 : s1;
          for (let q = q0; q < e1; q++) {
            const j = list[q];
            let dx = pos[i * 3] - pos[j * 3], dy = pos[i * 3 + 1] - pos[j * 3 + 1], dz = pos[i * 3 + 2] - pos[j * 3 + 2];
            let d2 = dx * dx + dy * dy + dz * dz;
            if (d2 >= cut2) continue;
            if (d2 < 1e-12) { dx = (i - j) * 1e-4; dy = 1e-4; dz = (j - i) * 1e-4; d2 = dx * dx + dy * dy + dz * dz; }
            const d = Math.sqrt(d2);
            const f = repulsion * (1 - d / cutoff) / d;
            fx[i] += dx * f; fy[i] += dy * f; fz[i] += dz * f;
            fx[j] -= dx * f; fy[j] -= dy * f; fz[j] -= dz * f;
          }
        }
      }
    }

    // ---- springs on the edges
    for (let e = 0; e < m; e++) {
      const i = src[e], j = dst[e];
      if (i === j || i >= n || j >= n) continue;
      const dx = pos[j * 3] - pos[i * 3], dy = pos[j * 3 + 1] - pos[i * 3 + 1], dz = pos[j * 3 + 2] - pos[i * 3 + 2];
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
      const wgt = ew ? Math.min(1, Math.abs(ew[e])) : 1;
      const f = spring * wgt * (d - rest) / d;
      fx[i] += dx * f * deg[i]; fy[i] += dy * f * deg[i]; fz[i] += dz * f * deg[i];
      fx[j] -= dx * f * deg[j]; fy[j] -= dy * f * deg[j]; fz[j] -= dz * f * deg[j];
    }

    // ---- anchor spring, integration, containment
    const cooling = 1 - 0.9 * (it / Math.max(1, iterations - 1));
    const step = maxStep * cooling;
    for (let i = 0; i < n; i++) {
      if (anchor) {
        fx[i] += (anchor[i * 3] - pos[i * 3]) * anchorPull;
        fy[i] += (anchor[i * 3 + 1] - pos[i * 3 + 1]) * anchorPull;
        fz[i] += (anchor[i * 3 + 2] - pos[i * 3 + 2]) * anchorPull;
      }
      const len = Math.sqrt(fx[i] * fx[i] + fy[i] * fy[i] + fz[i] * fz[i]);
      const k = len > step ? step / len : 1;
      pos[i * 3] += fx[i] * k; pos[i * 3 + 1] += fy[i] * k; pos[i * 3 + 2] += fz[i] * k;
      if (anchor) {
        const ax = pos[i * 3] - anchor[i * 3], ay = pos[i * 3 + 1] - anchor[i * 3 + 1], az = pos[i * 3 + 2] - anchor[i * 3 + 2];
        const drift = Math.sqrt(ax * ax + ay * ay + az * az);
        if (drift > maxDrift) {
          const s = maxDrift / drift;
          pos[i * 3] = anchor[i * 3] + ax * s;
          pos[i * 3 + 1] = anchor[i * 3 + 1] + ay * s;
          pos[i * 3 + 2] = anchor[i * 3 + 2] + az * s;
        }
      }
      contain(pos, i, volumes ? volumes[i] : VOL.CEREBRUM, 0.995, sheets ? sheets[i] === 1 : false);
    }
  }
  const after = measure(pos, src, dst, m);
  return {
    iterations,
    meanEdgeBefore: before.meanEdge, meanEdgeAfter: after.meanEdge,
    minDistBefore: before.minDist, minDistAfter: after.minDist,
    ms: Date.now() - t0,
  };
}

// Mean edge length and the closest pair among a deterministic sample. Cheap enough to
// report on every layout, which is how the refinement gets graded instead of assumed.
function measure(pos, src, dst, m) {
  let sum = 0;
  for (let e = 0; e < m; e++) {
    const i = src[e], j = dst[e];
    const dx = pos[j * 3] - pos[i * 3], dy = pos[j * 3 + 1] - pos[i * 3 + 1], dz = pos[j * 3 + 2] - pos[i * 3 + 2];
    sum += Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  const n = pos.length / 3;
  const stride = Math.max(1, Math.floor(n / 256));
  let minD = Infinity;
  for (let i = 0; i < n; i += stride) for (let j = i + stride; j < n; j += stride) {
    const dx = pos[j * 3] - pos[i * 3], dy = pos[j * 3 + 1] - pos[i * 3 + 1], dz = pos[j * 3 + 2] - pos[i * 3 + 2];
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (d < minD) minD = d;
  }
  return { meanEdge: m ? sum / m : 0, minDist: Number.isFinite(minD) ? minD : 0 };
}

/** Layout straight from a live Brain. Reads it, never touches it. */
export function layoutBrain(brain, { seed = brain.name, iterations = 240, scale = 100 } = {}) {
  const cells = brain.cells.map(c => ({ idx: c.idx, region: c.region, circuit: c.circuit }));
  const c = brain.connectome, n = c.size();
  const edges = { src: c.src.subarray(0, n), dst: c.dst.subarray(0, n), w: c.w.subarray(0, n) };
  const out = computeLayout({ cells, edges, seed, iterations, scale });
  // The second view is computed here and travels with the first, so both views are the
  // same object: a client never has to ask twice, and a snapshot carries both.
  out.pipeline = pipelineLayout({ cells, seed, scale });
  return out;
}

/** Region colour table for a set of region names, in the same order the layout uses. */
export function regionColors(names) {
  const named = REGION_ORDER.filter(r => names.includes(r));
  const extra = names.filter(r => !REGIONS[r]).sort();
  const out = {};
  for (const n of named) out[n] = REGIONS[n].color;
  extra.forEach((n, i) => { out[n] = extraColor(i + REGION_ORDER.length); });
  return out;
}
