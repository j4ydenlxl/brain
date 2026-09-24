// web/src/kinds.js: the cell kinds, browser side.
//
// TWO THINGS LIVE HERE AND THEY ARE NOT THE SAME THING.
//
//  1. THE PORTS. The in and out ports of every kind the organism is built from, copied
//     from the node registry in cells/. These are structure: the wiring picks a destination
//     by asking which cells have an in port that accepts everything an out port can emit,
//     so one wrong port here is a different organism. test/web.test.mjs asserts this table
//     is character for character what getKind() reports under node, so it cannot drift.
//
//  2. THE UPDATE. A small pure function per kind. The node cell computes on hypervectors,
//     exact rationals and symbol trees; in the tab a cell carries one activation number and
//     the update says what this kind does to it. That is a deliberate reduction and it is
//     declared: the browser runs the ORGANISM's structure and schedule exactly, and a
//     reduced arithmetic inside each cell. Nothing in the picture claims otherwise.
//
// A port spec is "name:kind,kind;name:kind" so the table stays small on the wire.

const PARSED = new Map();

function parsePorts(spec) {
  if (!spec) return [];
  return spec.split(';').map(p => {
    const c = p.indexOf(':');
    return { name: p.slice(0, c), kinds: p.slice(c + 1).split(',') };
  });
}

// ---------------------------------------------------------------- the updates
// x: the weighted sum of what arrived this run. s: this cell's own small state.
// A function returns the number it emits, or null when it ran and emitted nothing.
// A function that returns null RAN AND SAID NOTHING, which is the common case in a real
// cell: a threshold that was not crossed, a query that missed, a state machine that did
// not change state, a summary that is not due yet. Keeping that honest here is what keeps
// the picture sparse, because the engine only sends what a cell actually emitted.
const U = {
  pass: (x) => x,
  sum: (x, s) => { s.a = Math.tanh(s.a * 0.96 + x * 0.3); return s.a; },
  count: (x, s) => { s.n += 1; return s.n % 8 === 0 ? (s.n % 128) / 128 : null; },
  decay: (x, s) => { s.a = s.a * 0.86 + x * 0.2; return s.a; },
  ema: (x, s) => { s.a += (x - s.a) * 0.18; return s.a; },
  bundle: (x, s) => { s.a = Math.tanh(s.a * 0.5 + x * 0.4); return s.a; },
  bind: (x, s) => { s.a = Math.tanh(s.a + x * 0.5) * 0.98; return s.a; },
  permute: (x, s) => { s.a = Math.tanh(x * 0.9 + 0.1 * Math.sin(x * 7 + s.k)); return s.a; },
  compare: (x, s) => { const d = x - s.a; s.a = x; return Math.abs(d) > 0.02 ? d : null; },
  thresh: (x, s) => (Math.abs(x) > s.th ? 1 : null),
  gate: (x, s) => { const v = x > 0 ? 1 : 0; if (v === s.a) return null; s.a = v; return v; },
  fire: (x, s) => { s.a = s.a * 0.9 + x * 0.35; if (s.a > 1) { s.a = 0; return 1; } return null; },
  osc: (x, s, t) => Math.sin(t * s.w) + 0.5 * Math.sin(t * s.w * 4),
  clockTick: (x, s) => { s.n += 1; return (s.n % 64) / 64; },
  predict: (x, s) => { const e = x - s.a; s.a = s.a * 0.7 + x * 0.3; s.e = Math.abs(e); return Math.abs(e) > 0.02 ? s.a : null; },
  zscore: (x, s) => { s.n += 1; const d = x - s.m; s.m += d / s.n; s.v += d * (x - s.m); const sd = Math.sqrt(s.v / Math.max(1, s.n - 1)) || 1; const z = (x - s.m) / sd; return Math.abs(z) > 3 ? z : null; },
  recall: (x, s) => { const k = Math.round(x * 8) & 63; const v = s.mem[k]; s.mem[k] = x; return v === undefined ? null : v; },
  route: (x, s) => { if (Math.abs(x - s.a) < 0.02) return null; s.a = x; return x; },
  solve: (x, s) => { const v = x === 0 ? 0 : -s.b / x; if (Math.abs(v - s.a) < 0.02) return null; s.a = v; return v; },
  sink: () => null,
  // The grid kinds guard on a payload that IS a grid and emit nothing when handed anything
  // else. Nothing in the tab ever injects a grid, so the honest browser reduction of one is
  // a cell that runs and says nothing, exactly as the node cell does in an organism nobody
  // has handed a grid to. It is not a stub: it is what the node cell does here.
  inert: () => null,
};

// name, in ports, out ports, depth 1..9 (the algorithmic order of the kind), update,
// plain English function. Depth is the one hand set number and it is printed in the panel.
const TABLE = [
  ['aggregate.mean', 'in:vec', 'out:vec', 2, 'ema', 'averages every vector that reached it this tick'],
  ['anomaly.zscore', 'in:num', 'out:event', 4, 'zscore', 'keeps a running mean and spread and reports a value that is far from both'],
  ['decode.hv', 'in:hv', 'out:event', 4, 'recall', 'names the concept a hypervector is nearest to'],
  ['encode.hv', 'in:event', 'hv:hv', 3, 'bundle', 'turns an event into a hypervector by bundling one vector per token'],
  ['encode.image', 'in:vec', 'out:sdr', 4, 'compare', 'turns a small image into a sparse code by local contrast'],
  ['encode.number', 'in:num', 'hv:hv;num:num', 3, 'pass', 'turns a number into a hypervector by a level code and passes the exact number on'],
  ['encode.time', 'in:num', 'hv:hv', 3, 'osc', 'turns a moment into a hypervector, one circular code per timescale'],
  ['encode.vec', 'in:vec', 'out:hv', 3, 'bundle', 'projects a vector to a hypervector through a fixed random hyperplane code'],
  ['evaluate.threshold', 'in:num', 'out:event', 1, 'thresh', 'fires when the number it watches crosses its threshold'],
  ['event.filter', 'in:event', 'out:event', 1, 'gate', 'passes only the events whose key matches'],
  ['grid.crop', 'in:event', 'out:event', 3, 'inert', 'crops a grid to the tightest rectangle around what is drawn on it, or to a given one'],
  ['grid.flip', 'in:event', 'out:event', 2, 'inert', 'mirrors a grid left to right or top to bottom'],
  ['grid.rotate', 'in:event', 'out:event', 2, 'inert', 'rotates a grid by quarter turns clockwise'],
  ['grid.tile', 'in:event', 'out:event', 2, 'inert', 'repeats a grid a given number of times across and down'],
  ['grid.translate', 'in:event', 'out:event', 2, 'inert', 'shifts a grid, rolling the edges round or filling the gap'],
  ['grid.transpose', 'in:event', 'out:event', 2, 'inert', 'reflects a grid across its main diagonal'],
  ['hopfield.assoc','write:vec;query:vec', 'out:vec', 7, 'recall', 'dense associative memory: converges a query onto the stored pattern nearest it'],
  ['hv.bind', 'in:hv', 'out:hv', 2, 'bind', 'binds hypervectors together, which is how a role is attached to a filler'],
  ['hv.bundle', 'in:hv', 'out:hv', 2, 'bundle', 'bundles hypervectors into one that is similar to all of them'],
  ['hv.cleanup', 'hv:hv;label:event', 'match:event', 4, 'recall', 'snaps a noisy hypervector back to the nearest clean concept it knows'],
  ['hv.compare', 'a:hv;b:hv', 'sim:num', 2, 'compare', 'reports how similar the last two hypervectors were'],
  ['hv.permute', 'in:hv', 'out:hv', 2, 'permute', 'rotates a hypervector, which is how sequence position is carried'],
  ['integrate.ema', 'in:vec', 'out:vec', 2, 'ema', 'holds a moving average over its own time constant'],
  ['integrate.leaky', 'in:num', 'spike:event', 3, 'fire', 'leaks charge away and spikes when it still crosses threshold'],
  ['knn.retrieve', 'write:vec;label:event;query:vec', 'out:event', 5, 'recall', 'stores labelled vectors and returns the nearest ones to a query'],
  ['liquid.cfc', 'x:vec', 'h:vec', 7, 'decay', 'a continuous time hidden state, every unit with its own decay rate'],
  ['logic.gate', 'in:event', 'out:event', 2, 'gate', 'and, or, xor or not over everything that arrived this tick'],
  ['memory.assoc', 'key:hv;value:event;query:hv', 'out:event', 5, 'recall', 'stores key and value pairs and recalls a value by a nearby key'],
  ['num.arith', 'a:num;b:num', 'out:num', 3, 'sum', 'exact rational arithmetic, so it never rounds the way a float does'],
  ['num.compare', 'a:num;b:num', 'out:event', 3, 'compare', 'exact order of two numbers, so 9.11 is below 9.9 every time'],
  ['num.count', 'in:event', 'out:num', 1, 'count', 'counts the items in an event exactly'],
  ['num.register', 'inc:event;dec:event;set:num;read:event', 'out:num;test:event', 3, 'sum', 'a counter register with increment, decrement and a zero test'],
  ['oscillator', '', 'out:vec', 2, 'osc', 'a driver: emits a rhythm, one component per period it carries'],
  ['predict.next', 'observe:vec,hv,num', 'prediction:vec,hv,num;error:num', 6, 'predict', 'predicts its next input and reports how wrong the last prediction was'],
  ['rate.meter', 'in:event', 'out:num', 2, 'decay', 'events per second over a trailing window'],
  ['reservoir.echo', 'x:vec;target:vec', 'state:vec;y:vec;error:num', 8, 'decay', 'an echo state network: a fixed random recurrent pool with a trained readout'],
  ['route.key', 'in:event', 'a:event;b:event;c:event;d:event', 3, 'route', 'sends an event down one of four paths by its key'],
  ['sdr.encode', 'in:vec', 'out:sdr', 2, 'thresh', 'keeps the largest few components and drops the rest'],
  ['seq.fit', 'terms:event', 'next:event', 8, 'predict', 'induces the rule behind a sequence, verifies it exactly at every given term, and says what comes next'],
  ['sink.log','in:hv,sdr,num,sym,vec,event,phv', '', 1, 'sink', 'keeps the last signals it saw, and emits nothing'],
  ['source.counter', '', 'out:num', 1, 'clockTick', 'a driver: emits an exact integer that climbs every run'],
  ['stat.correlate', 'x:num;y:num', 'out:event', 4, 'compare', 'running correlation of two streams'],
  ['stat.histogram', 'in:num', 'out:event', 3, 'count', 'fixed width bins over a range'],
  ['stat.running', 'in:num', 'out:event', 3, 'zscore', 'running mean, variance, minimum and maximum'],
  ['state.machine', 'in:event', 'out:event', 3, 'gate', 'a finite state machine: an event moves it from one named state to another'],
  ['sym.diff', 'in:sym', 'out:sym', 6, 'compare', 'differentiates a symbol tree by the standard rules'],
  ['sym.eval', 'expr:sym;env:event', 'out:num', 5, 'sum', 'evaluates a symbol tree exactly under an environment'],
  ['sym.simplify', 'in:sym', 'out:sym', 6, 'pass', 'folds the constant parts of a symbol tree and cleans up identities'],
  ['sym.solve', 'eq:sym', 'out:event', 7, 'solve', 'solves a linear equation in one variable exactly'],
  ['sym.verify', 'eq:sym;env:event', 'out:event', 5, 'thresh', 'checks an equation exactly and answers yes or no'],
  ['timer', 'trigger:event', 'out:event', 2, 'fire', 'counts down after a trigger and expires once'],
  ['tokenize.text', 'in:event', 'out:event', 2, 'pass', 'splits text into tokens, keeping a decimal number as one token'],
  ['vec.mlp', 'x:vec;target:vec', 'y:vec;error:num', 6, 'predict', 'a one hidden layer network with a local delta rule'],
  ['verify.numeric', 'value:num;expected:num', 'out:event', 3, 'thresh', 'checks a value against an expected one exactly, inside a tolerance'],
];

// Capability, printed in the panel with this formula so it is never a mood.
//   cap = 0.55 * depth/9 + 0.25 * (nIn + nOut)/6 + 0.20 * span/6
// depth is the algorithmic order of the kind, nIn and nOut are its port counts, and span
// is how many distinct signal kinds the cell speaks across all of its ports.
export function capabilityOf(k) {
  const span = new Set();
  for (const p of k.ports.in) for (const s of p.kinds) span.add(s);
  for (const p of k.ports.out) for (const s of p.kinds) span.add(s);
  const n = k.ports.in.length + k.ports.out.length;
  const c = 0.55 * (k.depth / 9) + 0.25 * Math.min(1, n / 6) + 0.20 * Math.min(1, span.size / 6);
  return Math.max(0, Math.min(1, c));
}

for (const row of TABLE) {
  const k = {
    name: row[0],
    ports: { in: parsePorts(row[1]), out: parsePorts(row[2]) },
    depth: row[3],
    update: U[row[4]] || U.pass,
    doc: row[5],
    cap: 0,
  };
  k.cap = capabilityOf(k);
  PARSED.set(k.name, k);
}

export function getKind(name) {
  const k = PARSED.get(name);
  if (!k) throw new Error('unknown cell kind: ' + name);
  return k;
}
export function listKinds() { return [...PARSED.keys()]; }
/** The raw table, so the parity test can compare it with the node registry. */
export function portTable() { return TABLE.map(r => [r[0], r[1], r[2]]); }
/** Fresh state for one cell of this kind. Small, numeric, no allocation beyond this. */
export function initState(kindName, params) {
  const s = { a: 0, n: 0, m: 0, v: 0, e: 0, b: 1, k: 1, th: 0.5, w: 0.05, mem: [] };
  if (params) {
    if (typeof params.threshold === 'number') s.th = params.threshold;
    if (typeof params.k === 'number') s.k = params.k;
    if (Array.isArray(params.periods) && params.periods.length) s.w = (2 * Math.PI) / params.periods[0];
  }
  return s;
}
