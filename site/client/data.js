// client/data.js - everything that is not pixels: the API, the event stream, and the
// synthetic graph used by ?synthetic=N to measure frames per second at a size the seed
// brain has not reached yet.
import { hexToRgb } from './gl.js';

export async function getJSON(path) {
  const r = await fetch(path, { headers: { accept: 'application/json' } });
  if (!r.ok) throw new Error(path + ' -> ' + r.status);
  return r.json();
}
export async function postJSON(path, body) {
  const r = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body || {}) });
  if (!r.ok) throw new Error(path + ' -> ' + r.status);
  return r.json();
}

// Turn /api/graph into the flat typed arrays the renderer wants.
export function buildRenderGraph(raw) {
  const cells = raw.cells, n = cells.length, m = raw.edges.n;
  const colorOf = new Map();
  for (const r of raw.regions) colorOf.set(r.name, hexToRgb(r.color));
  const pos = Float32Array.from(raw.pos);
  const color = new Float32Array(n * 3), size = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const c = cells[i], idx = c.idx;
    const rgb = colorOf.get(c.region) || [1, 1, 1];
    color[idx * 3] = rgb[0]; color[idx * 3 + 1] = rgb[1]; color[idx * 3 + 2] = rgb[2];
    const deg = (c.degree ? c.degree.in + c.degree.out : 0);
    size[idx] = Math.min(9, 0.9 + 1.5 * Math.sqrt(deg));
  }
  return {
    n, pos, color, size,
    edges: {
      n: m,
      src: Uint32Array.from(raw.edges.src), dst: Uint32Array.from(raw.edges.dst),
      w: Float32Array.from(raw.edges.w), srcPort: Uint8Array.from(raw.edges.srcPort || []),
      flags: Uint8Array.from(raw.edges.flags || []),
      // the delay is what makes the pulse honest: flight time is 1 + delay ticks
      delay: Float32Array.from(raw.edges.delay || []),
    },
    meta: cells, regions: raw.regions, scale: raw.scale || 100, name: raw.name,
    // the same cells laid out as pipeline stages, travelling with the anatomical layout
    pipeline: raw.pipeline ? { pos: Float32Array.from(raw.pipeline.pos), stages: raw.pipeline.stages, order: raw.pipeline.order } : null,
  };
}

// Server Sent Events. One connection, batched frames, automatic reconnect by the browser.
export function connectEvents({ onBatch, onSummary, onOpen, onError }) {
  const es = new EventSource('/api/events');
  es.addEventListener('batch', (e) => { try { onBatch(JSON.parse(e.data)); } catch (err) { onError && onError(err); } });
  es.addEventListener('summary', (e) => { try { onSummary(JSON.parse(e.data)); } catch (err) { onError && onError(err); } });
  es.onopen = () => onOpen && onOpen();
  es.onerror = (e) => onError && onError(e);
  return es;
}

// ----------------------------------------------------------------- snapshot mode
// A snapshot is one JSON file holding the graph, a summary and a recording of real
// batch frames (see captureSnapshot in ../server.mjs). Replaying it needs no server at
// all, which is what lets this page be published as plain static hosting: the brain in
// the file really ran, and the frames really are what its ledger emitted.
export async function loadSnapshot(url) {
  const r = await fetch(url, { headers: { accept: 'application/json' } });
  if (!r.ok) throw new Error(url + ' -> ' + r.status);
  const snap = await r.json();
  if (!snap || snap.kind !== 'brain.snapshot') throw new Error(url + ' is not a brain snapshot');
  if (!Array.isArray(snap.frames) || !snap.frames.length) throw new Error(url + ' has no frames');
  return snap;
}

// Plays the recording back on the wall clock at the cadence it was recorded at, and
// loops. The loop is seamless because a frame carries no absolute time the renderer
// depends on: activity is stamped with the viewer's own clock as it arrives.
export class SnapshotPlayer {
  constructor(snap, { loop = true, speed = 1 } = {}) {
    this.snap = snap; this.loop = loop; this.speed = speed;
    this.frames = snap.frames; this.i = 0; this.laps = 0;
    this.frameMs = snap.frameMs || 50;
    this.acc = 0; this.last = performance.now(); this.skipped = 0;
  }
  static MAX_CATCHUP = 2;
  get length() { return this.frames.length; }
  // Returns the frames that are due since the previous call, newest last.
  //
  // The backlog is HARD CAPPED at MAX_CATCHUP, and this is not a detail. A frame can
  // carry thousands of signal entries, so replaying a backlog costs time proportional to
  // the backlog, which makes the next frame later still: a slow frame becomes ten due
  // frames becomes a hundred, and the page falls to a couple of frames a second while
  // the GPU sits idle. Measured: uncapped, this page ran at 2 fps with the renderer
  // itself benching 2.37 ms/frame. Playback is a picture of activity, not an audit, so
  // when it is behind it skips ahead and counts what it skipped.
  due(now) {
    const out = [];
    this.acc += Math.min(500, (now - this.last)) * this.speed;
    this.last = now;
    let want = Math.floor(this.acc / this.frameMs);
    if (want <= 0) return out;
    this.acc -= want * this.frameMs;
    if (want > SnapshotPlayer.MAX_CATCHUP) {
      this.skipped += want - SnapshotPlayer.MAX_CATCHUP;
      this.advance(want - SnapshotPlayer.MAX_CATCHUP);
      want = SnapshotPlayer.MAX_CATCHUP;
    }
    for (let k = 0; k < want; k++) {
      if (this.i >= this.frames.length) {
        if (!this.loop) return out;
        this.i = 0; this.laps++;
      }
      out.push(this.frames[this.i++]);
    }
    return out;
  }
  advance(n) {
    for (let k = 0; k < n; k++) {
      if (this.i >= this.frames.length) { if (!this.loop) { this.i = this.frames.length; return; } this.i = 0; this.laps++; }
      this.i++;
    }
  }
  summary() {
    const s = this.snap.summary || {};
    const f = this.frames[Math.max(0, Math.min(this.frames.length - 1, this.i - 1))] || {};
    return { ...s, t: f.t ?? s.t, gen: f.gen ?? s.gen, viewers: 0 };
  }
}

// ---------------------------------------------------------------- synthetic mode
// A deterministic graph of N cells and about 10N edges, laid out with the same lobe
// scheme the server uses (a small independent copy: this data never meets the server).
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SYN_REGIONS = [
  { name: 'perception', color: '#38e8ff', c: [0, -0.30, 0.60], r: 0.30 },
  { name: 'association', color: '#b77cff', c: [0, 0.02, 0.00], r: 0.46 },
  { name: 'cognitive', color: '#ffd166', c: [0, 0.52, 0.02], r: 0.36 },
  { name: 'motor', color: '#4ef5a3', c: [0, -0.30, -0.60], r: 0.30 },
  { name: 'memory', color: '#5b8cff', c: [0, -0.08, -0.02], r: 0.15 },
  { name: 'prediction', color: '#ff7ab8', c: [0.55, 0.20, 0.30], r: 0.22 },
  { name: 'simulation', color: '#ff9f5a', c: [-0.55, 0.20, -0.30], r: 0.22 },
  { name: 'generations', color: '#7dffcf', c: [0.10, -0.55, 0.05], r: 0.20 },
];
const SHAPE = [0.92, 0.80, 1.18], MID_GAP = 0.055, GA = Math.PI * (3 - Math.sqrt(5));

export function syntheticGraph(n, edgesPerCell = 10, scale = 100, seed = 0x5eed) {
  const rnd = mulberry32(seed);
  const R = SYN_REGIONS.length;
  const pos = new Float32Array(n * 3), color = new Float32Array(n * 3), size = new Float32Array(n);
  const meta = new Array(n);
  const perRegion = Math.ceil(n / R);
  for (let i = 0; i < n; i++) {
    const ri = Math.min(R - 1, Math.floor(i / perRegion));
    const reg = SYN_REGIONS[ri];
    const j = i - ri * perRegion, m = Math.min(perRegion, n - ri * perRegion);
    const circuits = 12, ci = j % circuits;
    const cd = fib(ci, circuits), spread = reg.r * 0.55;
    const clusterR = Math.max(reg.r * 0.10, reg.r * 0.42 / Math.cbrt(circuits));
    const d = fib(j, m), rad = clusterR * Math.cbrt((j + 0.5) / m);
    let x = reg.c[0] + cd[0] * spread + d[0] * rad + (rnd() - 0.5) * clusterR * 0.3;
    let y = reg.c[1] + cd[1] * spread + d[1] * rad + (rnd() - 0.5) * clusterR * 0.3;
    let z = reg.c[2] + cd[2] * spread + d[2] * rad + (rnd() - 0.5) * clusterR * 0.3;
    if (reg.name !== 'memory') x = ((ci & 1) ? -1 : 1) * (MID_GAP + Math.abs(x));
    let e = Math.sqrt((x / SHAPE[0]) ** 2 + (y / SHAPE[1]) ** 2 + (z / SHAPE[2]) ** 2);
    if (reg.name !== 'memory' && e > 1e-6) {
      const k = (e + (0.90 - e) * 0.45) / e; // the same cortical bias the server layout uses
      x *= k; y *= k; z *= k; e *= k;
    }
    if (e > 1) { x /= e; y /= e; z /= e; }
    pos[i * 3] = x * scale; pos[i * 3 + 1] = y * scale; pos[i * 3 + 2] = z * scale;
    const rgb = hexToRgb(reg.color);
    color[i * 3] = rgb[0]; color[i * 3 + 1] = rgb[1]; color[i * 3 + 2] = rgb[2];
    size[i] = 0.9 + 1.5 * Math.sqrt(2 + Math.floor(rnd() * edgesPerCell));
    meta[i] = { id: 'syn.' + i, idx: i, kind: 'synthetic', region: reg.name, circuit: 'c' + ci, period: 'event', stats: { runs: 0, fired: 0, surprise: 0 }, degree: { in: 0, out: edgesPerCell } };
  }
  const m = n * edgesPerCell;
  const src = new Uint32Array(m), dst = new Uint32Array(m), w = new Float32Array(m), srcPort = new Uint8Array(m), flags = new Uint8Array(m);
  for (let e = 0; e < m; e++) {
    const a = e % n;
    // mostly local wiring with a few long range projections, which is what a connectome
    // looks like and is also the honest worst case for the line renderer
    const far = rnd() < 0.12;
    const b = far ? Math.floor(rnd() * n) : (a + 1 + Math.floor(rnd() * 96)) % n;
    src[e] = a; dst[e] = b; w[e] = 0.2 + rnd() * 1.6; srcPort[e] = 0; flags[e] = 1;
  }
  return {
    n, pos, color, size,
    edges: { n: m, src, dst, w, srcPort, flags },
    meta, regions: SYN_REGIONS.map(r => ({ name: r.name, color: r.color, cells: perRegion, circuits: 12 })),
    scale, name: 'synthetic',
  };
}
function fib(i, n) {
  const y = n === 1 ? 0 : 1 - (2 * i + 1) / n;
  const r = Math.sqrt(Math.max(0, 1 - y * y)), a = i * GA;
  return [r * Math.cos(a), y, r * Math.sin(a)];
}

// Fake traffic for synthetic mode: the same batch shape the server sends, so the render
// path under test is exactly the render path that runs against a real brain.
export class SyntheticDriver {
  constructor(n, { runsPerSec = 20000, signalsPerSec = 6000 } = {}) {
    this.n = n; this.runsPerSec = runsPerSec; this.signalsPerSec = signalsPerSec;
    this.rnd = mulberry32(0xbeef); this.last = performance.now(); this.t = 0; this.seq = 0;
  }
  frame(now) {
    const dt = Math.min(0.25, (now - this.last) / 1000);
    this.last = now;
    const runs = [], sigs = [];
    const nr = Math.min(4096, Math.round(this.runsPerSec * dt));
    const ns = Math.min(4096, Math.round(this.signalsPerSec * dt));
    const uniq = new Map();
    for (let i = 0; i < nr; i++) {
      const idx = Math.floor(this.rnd() * this.n);
      uniq.set(idx, (uniq.get(idx) || 0) + 1);
    }
    for (const [idx, c] of uniq) runs.push(idx, c);
    for (let i = 0; i < ns; i++) sigs.push(Math.floor(this.rnd() * this.n), 0, 1);
    this.t += Math.round(dt * 1000);
    return { seq: this.seq++, t: this.t, gen: 0, ms: Date.now(), types: { 'cell.run': nr, signal: ns }, runs, sigs, edges: [], prunes: [], proposals: [], decisions: [], dropped: 0 };
  }
}
