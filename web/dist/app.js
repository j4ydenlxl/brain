// DILATION / BRAIN. Built by web/build.mjs from web/src. The organism is grown in
// this tab from a seed: there is no snapshot to download.
(function () {
"use strict";
function hash32(str) {
let h = 0x811c9dc5 >>> 0;
for (let i = 0; i < str.length; i++) {
h ^= str.charCodeAt(i);
h = Math.imul(h, 0x01000193) >>> 0;
}
return h >>> 0;
}
function splitmix32(a) {
return function () {
a = (a + 0x9e3779b9) | 0;
let t = a ^ (a >>> 16);
t = Math.imul(t, 0x21f0aaad);
t = t ^ (t >>> 15);
t = Math.imul(t, 0x735a2d97);
return ((t ^ (t >>> 15)) >>> 0);
};
}
function rotl(x, k) { return ((x << k) | (x >>> (32 - k))) >>> 0; }
class RNG {
constructor(seed) {
const s = typeof seed === 'number' ? seed >>> 0 : hash32(String(seed === undefined ? 'brain' : seed));
const sm = splitmix32(s);
this.s = new Uint32Array([sm(), sm(), sm(), sm()]);
if ((this.s[0] | this.s[1] | this.s[2] | this.s[3]) === 0) this.s[0] = 1;
}
u32() {
const s = this.s;
const r = Math.imul(rotl(Math.imul(s[1], 5), 7), 9) >>> 0;
const t = s[1] << 9;
s[2] ^= s[0]; s[3] ^= s[1]; s[1] ^= s[2]; s[0] ^= s[3];
s[2] ^= t;
s[3] = rotl(s[3], 11);
return r;
}
next() { return this.u32() / 4294967296; }
int(n) { return Math.floor(this.next() * n); }
pick(arr) { return arr[this.int(arr.length)]; }
}
const PARSED = new Map();
function parsePorts(spec) {
if (!spec) return [];
return spec.split(';').map(p => {
const c = p.indexOf(':');
return { name: p.slice(0, c), kinds: p.slice(c + 1).split(',') };
});
}
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
inert: () => null,
};
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
function capabilityOf(k) {
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
function getKind(name) {
const k = PARSED.get(name);
if (!k) throw new Error('unknown cell kind: ' + name);
return k;
}
function listKinds() { return [...PARSED.keys()]; }
function portTable() { return TABLE.map(r => [r[0], r[1], r[2]]); }
function initState(kindName, params) {
const s = { a: 0, n: 0, m: 0, v: 0, e: 0, b: 1, k: 1, th: 0.5, w: 0.05, mem: [] };
if (params) {
if (typeof params.threshold === 'number') s.th = params.threshold;
if (typeof params.k === 'number') s.k = params.k;
if (Array.isArray(params.periods) && params.periods.length) s.w = (2 * Math.PI) / params.periods[0];
}
return s;
}
const SEC = 1000, MIN = 60000, HOUR = 3600000;
const REGIONS = [
{
name: 'perception', prefix: 'pe', share: 0.18,
doc: 'sensory input and encoding: events, numbers, time and vectors become hypervectors and sparse codes',
flow: [['association', 6], ['memory', 2], ['cognitive', 1]],
roster: ['encode.hv', 'tokenize.text', 'encode.number', 'hv.permute', 'encode.time', 'hv.bundle', 'encode.vec', 'sdr.encode', 'encode.image', 'decode.hv',
'grid.rotate', 'grid.flip', 'grid.transpose', 'grid.crop', 'grid.translate', 'grid.tile'],
},
{
name: 'association', prefix: 'as', share: 0.22,
doc: 'pattern integration: bundling, binding, cleanup, and the prediction that turns observation into surprise',
flow: [['cognitive', 5], ['memory', 3], ['perception', 1], ['motor', 1]],
roster: ['hv.bundle', 'predict.next', 'hv.bind', 'hv.compare', 'hv.cleanup', 'hv.permute', 'integrate.ema', 'memory.assoc', 'aggregate.mean', 'liquid.cfc', 'knn.retrieve', 'reservoir.echo'],
},
{
name: 'cognitive', prefix: 'co', share: 0.20,
doc: 'abstract reasoning: exact arithmetic, symbolic algebra, logic, routing and evaluation',
flow: [['motor', 4], ['memory', 3], ['association', 2], ['homeostasis', 1]],
roster: ['num.arith', 'route.key', 'num.compare', 'logic.gate', 'sym.simplify', 'evaluate.threshold', 'sym.diff', 'num.count', 'sym.solve', 'vec.mlp', 'sym.verify', 'verify.numeric', 'predict.next', 'sym.eval', 'seq.fit'],
},
{
name: 'memory', prefix: 'me', share: 0.15,
doc: 'distributed memory: associative stores, attractor cleanup, nearest neighbour recall and consolidation statistics',
flow: [['association', 5], ['cognitive', 3], ['perception', 1]],
roster: ['memory.assoc', 'hopfield.assoc', 'hv.bundle', 'knn.retrieve', 'hv.permute', 'stat.histogram', 'integrate.ema', 'decode.hv'],
},
{
name: 'motor', prefix: 'mo', share: 0.10,
doc: 'action and interaction: state machines, gating, timers and the action log',
flow: [['homeostasis', 4], ['perception', 3], ['cognitive', 2]],
roster: ['state.machine', 'event.filter', 'route.key', 'timer', 'num.register', 'logic.gate', 'sink.log', 'rate.meter'],
},
{
name: 'homeostasis', prefix: 'ho', share: 0.08,
doc: 'the clock and the internal weather: periodic drivers across the timescale spectrum, rate meters, running statistics and anomaly detection',
flow: [['perception', 2], ['association', 2], ['cognitive', 2], ['memory', 2], ['motor', 2], ['generations', 1]],
roster: ['source.counter', 'stat.running', 'rate.meter', 'anomaly.zscore', 'integrate.leaky', 'oscillator', 'evaluate.threshold', 'stat.correlate'],
},
{
name: 'generations', prefix: 'ge', share: 0.07,
doc: 'the service region that scores the organism: counters, running statistics, correlations and thresholds that a generations engine reads',
flow: [['cognitive', 3], ['homeostasis', 3], ['association', 1]],
roster: ['source.counter', 'stat.running', 'num.compare', 'stat.correlate', 'evaluate.threshold', 'anomaly.zscore', 'event.filter', 'num.register'],
},
];
const CLOCK_ROSTER = [
{ kind: 'source.counter', period: 1 },
{ kind: 'source.counter', period: SEC },
{ kind: 'source.counter', period: MIN },
{ kind: 'source.counter', period: HOUR },
{ kind: 'oscillator', period: 1, params: { periods: [4, 16, 64, 256] } },
{ kind: 'stat.running', period: 'event', params: { every: 8 } },
{ kind: 'rate.meter', period: 'event', params: { windowMs: SEC } },
{ kind: 'anomaly.zscore', period: 'event', params: { threshold: 3, warmup: 5 } },
];
const PERIODS = [['event', 0.68], [1, 0.12], [SEC, 0.10], [MIN, 0.06], [HOUR, 0.04]];
const DRIVER_PERIODS = [[1, 0.45], [SEC, 0.35], [MIN, 0.15], [HOUR, 0.05]];
class Connectome {
constructor(capacity) {
this.n = 0;
this._alloc(capacity || 1024);
this._bySrc = null;
}
_alloc(cap) {
const grow = (Ctor, old) => { const a = new Ctor(cap); if (old) a.set(old.subarray(0, this.n)); return a; };
this.src = grow(Uint32Array, this.src); this.dst = grow(Uint32Array, this.dst);
this.srcPort = grow(Uint8Array, this.srcPort); this.dstPort = grow(Uint8Array, this.dstPort);
this.w = grow(Float32Array, this.w); this.delay = grow(Uint16Array, this.delay);
this.conf = grow(Float32Array, this.conf); this.usage = grow(Uint32Array, this.usage);
this.cap = cap;
}
add(src, dst, srcPort, dstPort, w, delay, conf) {
if (this.n === this.cap) this._alloc(this.cap * 2);
const e = this.n++;
this.src[e] = src; this.dst[e] = dst; this.srcPort[e] = srcPort; this.dstPort[e] = dstPort;
this.w[e] = w; this.delay[e] = delay; this.conf[e] = conf; this.usage[e] = 0;
this._bySrc = null;
return e;
}
arrival(e, t) { return t + 1 + this.delay[e]; }
index(nodes) {
if (this._bySrc) return this._bySrc;
const n = this.n, ptr = new Uint32Array(nodes + 1);
for (let e = 0; e < n; e++) ptr[this.src[e] + 1]++;
for (let i = 0; i < nodes; i++) ptr[i + 1] += ptr[i];
const list = new Uint32Array(n), fill = ptr.slice();
for (let e = 0; e < n; e++) list[fill[this.src[e]]++] = e;
this._bySrc = { ptr, list };
return this._bySrc;
}
}
function portKey(port) { return [...port.kinds].sort().join('|'); }
function accepts(outPort, inPort) { return outPort.kinds.every(k => inPort.kinds.includes(k)); }
function lowerBound(a, v) {
let lo = 0, hi = a.length;
while (lo < hi) { const m = (lo + hi) >> 1; if (a[m] < v) lo = m + 1; else hi = m; }
return lo;
}
function acceptorIndex(cells) {
const keys = new Map();
for (const c of cells) for (const p of c.ports.out) if (!keys.has(portKey(p))) keys.set(portKey(p), p);
const out = new Map();
for (const [key, outPort] of keys) {
const idx = [], port = [];
for (let i = 0; i < cells.length; i++) {
const ins = cells[i].ports.in;
for (let dp = 0; dp < ins.length; dp++) if (accepts(outPort, ins[dp])) { idx.push(i); port.push(dp); break; }
}
out.set(key, { idx: Uint32Array.from(idx), port: Uint8Array.from(port) });
}
return out;
}
function buildOrganism(opts) {
const o = opts || {};
const majors = o.majors === undefined ? 1200 : o.majors;
const subcellsPerMajor = o.subcellsPerMajor === undefined ? 8 : o.subcellsPerMajor;
const edgesPerCell = o.edgesPerCell === undefined ? 12 : o.edgesPerCell;
const seed = o.seed === undefined ? 'organism' : o.seed;
const localWindow = o.localWindow === undefined ? 8 : o.localWindow;
if (!(Number.isInteger(majors) && majors > 0)) throw new Error('buildOrganism: majors must be a positive integer');
if (!(Number.isInteger(subcellsPerMajor) && subcellsPerMajor > 0)) throw new Error('buildOrganism: subcellsPerMajor must be a positive integer');
if (!(Number.isInteger(edgesPerCell) && edgesPerCell >= 0)) throw new Error('buildOrganism: edgesPerCell must be a non negative integer');
const t0 = perfNow();
const rng = new RNG(seed + ':wiring');
const cells = [];
const circuits = new Map();
const quota = shareOut(majors, REGIONS.map(r => r.share));
const plan = REGIONS.map((r, i) => ({ ...r, majors: quota[i] }));
const regionRange = new Map();
const majorRange = [];
const majorRegion = [];
const regionMajors = new Map();
let major = 0;
for (const r of plan) {
const cellLo = cells.length, majorLo = major;
for (let m = 0; m < r.majors; m++, major++) {
const isClock = r.name === 'homeostasis' && m === 0;
const circuit = r.prefix + '.' + pad(major);
const circuitPeriod = isClock ? 1 : pickWeighted(rng, PERIODS);
circuits.set(circuit, { name: circuit, region: r.name, period: circuitPeriod, major });
const lo = cells.length;
for (let s = 0; s < subcellsPerMajor; s++) {
const slot = isClock ? CLOCK_ROSTER[s % CLOCK_ROSTER.length] : { kind: r.roster[(m * subcellsPerMajor + s) % r.roster.length] };
const kindName = slot.kind;
const id = circuit + '.' + s;
const params = { ...(slot.params || paramsFor(kindName, rng, major, s)) };
const period = slot.period !== undefined ? slot.period : periodFor(kindName, rng);
const policy = {
period,
priority: 1 + rng.int(3),
budget: 1,
backend: 'cpu',
learn: rng.next() < 0.25 ? 'hebbian' : null,
};
const kind = getKind(kindName);
cells.push({
id, idx: cells.length, kind: kindName, region: r.name, circuit, major,
ports: kind.ports, params, policy, cap: kind.cap, depth: kind.depth,
update: kind.update, doc: kind.doc,
state: initState(kindName, params),
runs: 0, lastT: -1, out: 0, fired: 0, quiet: 0,
});
}
majorRange.push([lo, cells.length]);
majorRegion.push(r.name);
}
regionRange.set(r.name, [cellLo, cells.length]);
regionMajors.set(r.name, [majorLo, major]);
}
const acceptors = acceptorIndex(cells);
const k = new Connectome(nextPow2(Math.max(1024, cells.length * edgesPerCell)));
const seen = new Set();
const claims = new Map();
const W = { k, cells, seen, added: 0, duplicates: 0, illegal: 0 };
const local = Math.max(1, Math.round(edgesPerCell * 0.34));
const regional = Math.max(1, Math.round(edgesPerCell * 0.42));
const long = Math.max(0, edgesPerCell - local - regional);
for (let m = 0; m < majorRange.length; m++) {
const lo = majorRange[m][0], hi = majorRange[m][1];
const region = majorRegion[m];
const rplan = plan.find(p => p.name === region);
const rr = regionRange.get(region), rLo = rr[0], rHi = rr[1];
const rm = regionMajors.get(region), mLo = rm[0], mHi = rm[1];
const isClock = region === 'homeostasis' && m === mLo;
for (let i = lo; i < hi; i++) {
const cell = cells[i];
const ports = [];
for (let p = 0; p < cell.ports.out.length; p++) ports.push(p);
const nOut = ports.length;
if (nOut === 0) continue;
const keys = cell.ports.out.map(p => portKey(p));
const wLo = Math.max(mLo, m - localWindow), wHi = Math.min(mHi, m + localWindow + 1);
const nbLo = majorRange[wLo][0], nbHi = majorRange[wHi - 1][1];
for (let c = 0; c < local; c++) {
const sp = ports[c % nOut];
const ok = wire(W, acceptors, claims, rng, i, sp, keys[sp], lo, hi, 0.35, 1.4, 0);
if (!ok) wire(W, acceptors, claims, rng, i, sp, keys[sp], nbLo, nbHi, 0.35, 1.4, 1);
}
for (let c = 0; c < regional; c++) {
const sp = ports[(c + 1) % nOut];
const d1 = 1 + rng.int(3);
const ok = wire(W, acceptors, claims, rng, i, sp, keys[sp], nbLo, nbHi, 0.2, 1.1, d1);
if (!ok) wire(W, acceptors, claims, rng, i, sp, keys[sp], rLo, rHi, 0.2, 1.1, 1 + rng.int(3));
}
const longCount = isClock ? Math.max(long, plan.length) : long;
for (let c = 0; c < longCount; c++) {
const sp = ports[(c + 2) % nOut];
const target = isClock ? plan[c % plan.length].name : pickWeighted(rng, rplan.flow);
const tr = regionRange.get(target);
wire(W, acceptors, claims, rng, i, sp, keys[sp], tr[0], tr[1], 0.1, 0.9, 2 + rng.int(30));
}
}
}
k.index(cells.length);
const buildMs = perfNow() - t0;
return {
cells, connectome: k, circuits, buildMs,
genome: {
seed, majors, subcellsPerMajor, edgesPerCell, localWindow,
added: W.added, duplicates: W.duplicates, illegal: W.illegal, claimedPorts: claims.size,
regions: plan.map(p => ({ name: p.name, majors: p.majors, doc: p.doc, flow: p.flow })),
},
};
}
function wire(W, acceptors, claims, rng, srcIdx, sp, key, lo, hi, wMin, wSpan, delay) {
const acc = acceptors.get(key);
if (!acc) return false;
const a = lowerBound(acc.idx, lo), z = lowerBound(acc.idx, hi);
if (z <= a) return false;
for (let attempt = 0; attempt < 8; attempt++) {
const j = a + rng.int(z - a);
const dst = acc.idx[j], dp = acc.port[j];
if (dst === srcIdx) continue;
const claim = dst * 16 + dp;
const mine = key.includes('|') ? key + '#' + srcIdx : key;
const owner = claims.get(claim);
if (owner !== undefined && owner !== mine) continue;
const dedupe = ((srcIdx * 2097152 + dst) * 16 + sp) * 16 + dp;
const w = Math.fround(wMin + rng.next() * wSpan);
if (W.seen.has(dedupe)) { W.duplicates++; continue; }
W.seen.add(dedupe);
W.k.add(srcIdx, dst, sp, dp, w, delay, 0.5);
W.added++;
claims.set(claim, mine);
return true;
}
return false;
}
function shareOut(total, shares) {
const sum = shares.reduce((a, s) => a + s, 0);
const raw = shares.map(s => (s / sum) * total);
const floor = raw.map(Math.floor);
let left = total - floor.reduce((a, v) => a + v, 0);
const order = raw.map((v, i) => [v - floor[i], i]).sort((x, y) => y[0] - x[0] || x[1] - y[1]);
for (let c = 0; left > 0; c++, left--) floor[order[c % order.length][1]]++;
return floor;
}
function pickWeighted(rng, pairs) {
let total = 0;
for (const p of pairs) total += p[1];
let r = rng.next() * total;
for (const p of pairs) { r -= p[1]; if (r <= 0) return p[0]; }
return pairs[pairs.length - 1][0];
}
function periodFor(kindName, rng) {
const driver = getKind(kindName).ports.in.length === 0;
return pickWeighted(rng, driver ? DRIVER_PERIODS : PERIODS);
}
const pad = (n) => String(n).padStart(4, '0');
function nextPow2(n) { let c = 1024; while (c < n) c *= 2; return c; }
function perfNow() { return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now(); }
function paramsFor(kind, rng, major, sub) {
switch (kind) {
case 'encode.hv': return { sequence: sub % 2 === 0 };
case 'encode.number': return { min: 0, max: [10, 100, 1000][major % 3], levels: [16, 32, 48][sub % 3] };
case 'encode.time': return { buckets: [12, 24, 60][major % 3], width: 2 };
case 'encode.vec': return { nin: 8, seed: 'ev.' + major + '.' + sub };
case 'encode.image': return { width: 8, height: 8, k: 8 };
case 'sdr.encode': return { k: [8, 16, 32][sub % 3] };
case 'decode.hv': return { items: [], threshold: 0.05 };
case 'hv.permute': return { k: 1 + (major + sub) % 7 };
case 'hv.cleanup': return { threshold: 0.1 };
case 'predict.next': return { history: 2 + (sub % 6) };
case 'integrate.ema': return { tau: [4, 8, 16, 64][sub % 4] };
case 'liquid.cfc': return { nin: 4, nhid: 8, dt: 1, tauMin: 2, tauMax: 20, seed: 'cfc.' + major + '.' + sub };
case 'reservoir.echo': return { nin: 1, nres: 16, nout: 1, spectralRadius: 0.9, leak: 0.3, lr: 0.05, seed: 'echo.' + major + '.' + sub };
case 'knn.retrieve': return { k: 1 + (sub % 4), capacity: 256 };
case 'memory.assoc': return { threshold: 0.15, capacity: 512 };
case 'hopfield.assoc': return { beta: 8, iters: 3, capacity: 32 };
case 'num.arith': return { op: ['+', '-', '*'][(major + sub) % 3] };
case 'route.key': return { keyField: 'key', table: { a: 0, b: 1, c: 2, d: 3 }, dflt: (major + sub) % 4 };
case 'logic.gate': return { op: ['and', 'or', 'xor', 'not'][(major + sub) % 4] };
case 'evaluate.threshold': return { threshold: Math.fround(0.1 + rng.next() * 0.8), direction: sub % 2 ? 'above' : 'below' };
case 'verify.numeric': return { tolerance: '0' };
case 'sym.solve': return { variable: 'x' };
case 'sym.diff': return { variable: 'x' };
case 'vec.mlp': return { nin: 8, nhid: 16, nout: 4, lr: 0.05, seed: 'mlp.' + major + '.' + sub };
case 'state.machine': return { initial: 'idle', transitions: { idle: { a: 'ready', b: 'idle' }, ready: { c: 'acting', b: 'idle' }, acting: { d: 'idle', a: 'ready' } } };
case 'event.filter': return { field: 'key', values: null, emit: null };
case 'timer': return { ticks: [4, 16, 64, 256][sub % 4] };
case 'num.register': return { initial: 0 };
case 'sink.log': return { keep: 16 };
case 'rate.meter': return { windowMs: SEC };
case 'stat.running': return { every: [4, 8, 16, 32][sub % 4] };
case 'stat.histogram': return { min: 0, max: 1, bins: 10 };
case 'anomaly.zscore': return { threshold: 3, warmup: 5 };
case 'integrate.leaky': return { threshold: 1, decay: 0.9, refractory: 5 };
case 'oscillator': return { periods: [4, 16, 64, 256] };
case 'source.counter': return {};
default: return {};
}
}
class Engine {
constructor(org) {
this.cells = org.cells;
this.k = org.connectome;
this.t = 0;
const n = this.cells.length;
this.inbox = new Float32Array(n);
this.inboxN = new Uint16Array(n);
this.ran = new Uint8Array(n);
this.ranList = new Uint32Array(n);
this.ranCount = 0;
this.lastRunT = new Float64Array(n).fill(-1);
this.wheel = new Map();
this.eventCells = [];
for (let i = 0; i < n; i++) {
const p = this.cells[i].policy.period;
if (p === 'event') { this.eventCells.push(i); continue; }
let s = this.wheel.get(p);
if (!s) { s = []; this.wheel.set(p, s); }
s.push(i);
}
this.periods = [...this.wheel.keys()].sort((a, b) => a - b);
for (const p of this.periods) this.wheel.set(p, Uint32Array.from(this.wheel.get(p)));
this.inflight = new Map();
this.pending = new Uint8Array(n);
this.firedEdges = new Uint32Array(Math.min(this.k.n, 200000));
this.firedEdgeCount = 0;
this.stats = {
ticks: 0, runs: 0, signals: 0, delivered: 0,
usPerRun: 0, usPerTick: 0, usPerSignal: 0, tps: 0, lastTickMs: 0,
};
this._win = { ms: 0, runs: 0, ticks: 0, sig: 0 };
this._wall = tNow();
this.index = this.k.index(n);
this.conduits = buildConduits(this.cells, this.k);
this.seedDrivers();
}
seedDrivers() {
for (let i = 0; i < this.cells.length; i++) {
if (this.cells[i].ports.in.length === 0) this.inbox[i] = 1;
}
}
tick() {
const t0 = tNow();
const t = ++this.t;
const cells = this.cells, k = this.k, idx = this.index;
const bucket = this.inflight.get(t);
let delivered = 0;
if (bucket) {
for (let j = 0; j < bucket.length; j += 2) {
const e = bucket[j], v = bucket[j + 1];
const d = k.dst[e];
this.inbox[d] += v;
this.inboxN[d]++;
this.pending[d] = 1;
k.usage[e]++;
delivered++;
}
this.inflight.delete(t);
}
this.ranCount = 0;
this.ran.fill(0);
for (const p of this.periods) {
if (t % p !== 0) continue;
const list = this.wheel.get(p);
for (let j = 0; j < list.length; j++) {
const i = list[j];
if (this.ran[i]) continue;
this.ran[i] = 1; this.ranList[this.ranCount++] = i;
}
}
for (let j = 0; j < this.eventCells.length; j++) {
const i = this.eventCells[j];
if (this.ran[i] || !this.pending[i]) continue;
this.ran[i] = 1; this.ranList[this.ranCount++] = i;
}
this.firedEdgeCount = 0;
let signals = 0;
const cap = this.firedEdges.length;
for (let j = 0; j < this.ranCount; j++) {
const i = this.ranList[j];
const c = cells[i];
const x = this.inboxN[i] > 0 ? this.inbox[i] : (c.ports.in.length === 0 ? 1 : 0);
this.inbox[i] = 0; this.inboxN[i] = 0; this.pending[i] = 0;
let out;
try { out = c.update(x, c.state, t); } catch (err) { out = null; }
c.runs++;
c.lastT = t;
this.lastRunT[i] = t;
if (out === null || out === undefined || !Number.isFinite(out)) continue;
out = out > 8 ? 8 : out < -8 ? -8 : out;
const changed = c.fired === 0 || Math.abs(out - c.out) > 0.05;
c.out = out;
const nOut = c.ports.out.length;
if (t < c.quiet) continue;
if (!changed && c.ports.in.length > 0) continue;
c.quiet = t + 8 + 6 * c.policy.priority;
c.fired++;
if (nOut === 0) continue;
const port = c.runs % nOut;
const lo = idx.ptr[i], hi = idx.ptr[i + 1];
for (let p = lo; p < hi; p++) {
const e = idx.list[p];
if (k.srcPort[e] !== port) continue;
const at = k.arrival(e, t);
let b = this.inflight.get(at);
if (!b) { b = []; this.inflight.set(at, b); }
b.push(e, out * k.w[e]);
if (this.firedEdgeCount < cap) this.firedEdges[this.firedEdgeCount++] = e;
signals++;
}
}
const ms = tNow() - t0;
const s = this.stats;
s.ticks++; s.runs += this.ranCount; s.signals += signals; s.delivered += delivered;
s.lastTickMs = ms;
const w = this._win;
w.ms += ms; w.runs += this.ranCount; w.ticks++; w.sig += signals + delivered;
if (w.ticks >= 30) {
s.usPerRun = w.runs > 0 ? (w.ms * 1000) / w.runs : 0;
s.usPerTick = (w.ms * 1000) / w.ticks;
s.usPerSignal = w.sig > 0 ? (w.ms * 1000) / w.sig : 0;
const wall = tNow();
s.tps = (w.ticks * 1000) / Math.max(0.001, wall - this._wall);
this._wall = wall;
w.ms = 0; w.runs = 0; w.ticks = 0; w.sig = 0;
}
this.tickConduits();
return this.ranCount;
}
tickConduits() {
const k = this.k, cn = this.conduits;
for (let j = 0; j < this.firedEdgeCount; j++) {
const c = cn.of[this.firedEdges[j]];
if (c >= 0) cn.rows[c].packets++;
}
cn.window++;
if (cn.window >= 60) {
const dt = Math.max(0.001, (tNow() - cn.since) / 1000);
for (const r of cn.rows) {
r.pps = (r.packets - r.mark) / dt;
r.mark = r.packets;
}
cn.since = tNow(); cn.window = 0;
}
const us = this.stats.usPerSignal;
for (const r of cn.rows) { r.hopTicks = 1 + r.meanDelay; r.usPerHop = us; }
}
run(n) {
const t0 = tNow();
for (let i = 0; i < n; i++) this.tick();
return tNow() - t0;
}
}
function buildConduits(cells, k) {
const rows = [], byKey = new Map();
const of = new Int16Array(k.n).fill(-1);
for (let e = 0; e < k.n; e++) {
const a = cells[k.src[e]].region, b = cells[k.dst[e]].region;
if (a === b) continue;
const key = a + '>' + b;
let c = byKey.get(key);
if (c === undefined) {
c = rows.length;
byKey.set(key, c);
rows.push({ key, from: a, to: b, edges: 0, sumDelay: 0, meanDelay: 0, hopTicks: 1, packets: 0, mark: 0, pps: 0, usPerHop: 0 });
}
of[e] = c;
rows[c].edges++;
rows[c].sumDelay += k.delay[e];
}
for (const r of rows) { r.meanDelay = r.edges ? r.sumDelay / r.edges : 0; r.hopTicks = 1 + r.meanDelay; }
rows.sort((a, b) => b.edges - a.edges);
const at = new Map(rows.map((r, i) => [r.key, i]));
for (let e = 0; e < k.n; e++) {
if (of[e] < 0) continue;
const a = cells[k.src[e]].region, b = cells[k.dst[e]].region;
of[e] = at.get(a + '>' + b);
}
return { rows, of, since: tNow(), window: 0 };
}
function tNow() { return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now(); }
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const CEREBRUM = { c: [0, 0.06, 0], r: [0.80, 0.80, 1.22] };
const CEREBELLUM = { c: [0, -0.60, -0.82], r: [0.50, 0.27, 0.34] };
const STEM = { top: [0, -0.16, -0.14], bot: [0, -1.02, -0.30], rTop: 0.16, rBot: 0.09 };
const SHELL = 0.90, FOLD = 0.085;
const MID_GAP = 0.055;
const REGION_SPEC = {
perception: { anchor: [0.30, 0.02, -0.82], color: [0.22, 0.91, 1.00], where: 'occipital, at the back', shape: 'cortex' },
association: { anchor: [0.74, 0.04, -0.04], color: [0.72, 0.49, 1.00], where: 'parietal and temporal', shape: 'cortex' },
cognitive: { anchor: [0.34, 0.30, 0.66], color: [1.00, 0.82, 0.40], where: 'frontal, front and high', shape: 'cortex' },
motor: { anchor: [0.46, 0.56, 0.12], color: [0.31, 0.96, 0.64], where: 'the central strip', shape: 'strip' },
memory: { anchor: [0.26, -0.22, -0.18], color: [0.36, 0.55, 1.00], where: 'hippocampus, deep and medial', shape: 'arc' },
homeostasis: { anchor: [0.00, -0.60, -0.22], color: [1.00, 0.62, 0.35], where: 'the brainstem', shape: 'stem' },
generations: { anchor: [0.00, -0.60, -0.82], color: [1.00, 0.42, 0.56], where: 'the cerebellum', shape: 'cerebellum' },
};
const PIPELINE_ORDER = ['perception', 'association', 'cognitive', 'memory', 'motor', 'homeostasis', 'generations'];
function sulcus(dx, dy, dz, freq) {
const len = Math.hypot(dx, dy, dz) || 1;
const x = dx / len, y = dy / len, z = dz / len;
const u = Math.atan2(z, x);
const v = Math.asin(clamp(y, -1, 1));
const f = freq || 1;
return 0.62 * Math.sin(f * 5.0 * u + 1.7 * Math.sin(f * 3.0 * v)) + 0.38 * Math.cos(f * 7.0 * v + 0.9 * Math.sin(f * 4.0 * u));
}
function cerebralProfile(x, y, z) {
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
function arcPoint(t) {
const a = -0.55 + 2.05 * t;
return [0.20 + 0.13 * Math.sin(2.2 * t), -0.30 + 0.30 * Math.sin(a * 0.75), 0.24 - 0.62 * Math.cos(a * 0.62)];
}
function stripPoint(u) {
const a = u * 1.35;
return [0.06 + 0.86 * Math.sin(a), 0.74 * Math.cos(a * 0.85), 0.12 + 0.10 * Math.sin(a * 1.7)];
}
function stemPoint(t) {
return [STEM.top[0] + (STEM.bot[0] - STEM.top[0]) * t, STEM.top[1] + (STEM.bot[1] - STEM.top[1]) * t, STEM.top[2] + (STEM.bot[2] - STEM.top[2]) * t];
}
function brainLayout(cells, scale) {
const S = scale || 100;
const n = cells.length;
const pos = new Float32Array(n * 3);
const fold = new Float32Array(n);
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
function cerebellumPoint(u, j, m, side) {
const d = fibDir((Math.floor(u * 997) * 31 + j) % 1024, 1024);
const shell = 0.92 + 0.06 * sulcus(d[0], d[1], d[2], 4.2);
return [
CEREBELLUM.c[0] + side * Math.abs(d[0]) * shell * CEREBELLUM.r[0],
CEREBELLUM.c[1] + d[1] * shell * CEREBELLUM.r[1],
CEREBELLUM.c[2] + d[2] * shell * CEREBELLUM.r[2],
];
}
function foldAt(p, shape) {
const x = (p[0] - CEREBRUM.c[0]) / CEREBRUM.r[0], y = (p[1] - CEREBRUM.c[1]) / CEREBRUM.r[1], z = (p[2] - CEREBRUM.c[2]) / CEREBRUM.r[2];
const f = shape === 'stem' || shape === 'arc' ? 0.55 : 0.5 + 0.5 * sulcus(x, y, z, shape === 'cerebellum' ? 4.2 : 1);
return clamp(f, 0, 1);
}
function pipelineLayout(cells, scale) {
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
const CELL_VS = `#version 300 es
precision highp float;
in vec3 aPos;
in vec3 aPipe;
in vec3 aColor;
in float aCap;
in float aFold;
in float aLastRun;
in float aIdx;
uniform mat4 uVP;
uniform float uTime;
uniform float uDecay;
uniform float uPointScale;
uniform float uSelected;
uniform float uMorph;
uniform vec2 uDepth;
out vec3 vColor;
out float vAct;
out float vSel;
out float vDepth;
out float vCap;
out float vFold;
void main() {
vec3 p = mix(aPos, aPipe, uMorph);
vec4 clip = uVP * vec4(p, 1.0);
gl_Position = clip;
vDepth = clamp((uDepth.y - clip.w) / max(0.001, uDepth.y - uDepth.x), 0.40, 1.0);
float age = max(0.0, uTime - aLastRun);
vAct = aLastRun > 0.0 ? exp(-age / uDecay) : 0.0;
vCap = aCap;
vFold = aFold;
vSel = (abs(aIdx - uSelected) < 0.5) ? 1.0 : 0.0;
float w = max(0.15, clip.w);
gl_PointSize = clamp(uPointScale * (1.0 + 0.6 * vSel) / w, 1.0, 22.0);
vColor = aColor;
}`;
const CELL_FS = `#version 300 es
precision highp float;
in vec3 vColor;
in float vAct;
in float vSel;
in float vDepth;
in float vCap;
in float vFold;
uniform float uRim;
out vec4 frag;
void main() {
vec2 d = gl_PointCoord - vec2(0.5);
float r2 = dot(d, d);
if (r2 > 0.25) discard;
float disc = smoothstep(0.25, 0.09, r2);
float rim = exp(-r2 * 15.0) * uRim;
float ring = vSel * smoothstep(0.245, 0.205, r2) * smoothstep(0.125, 0.165, r2) * 2.4;
float a = disc + rim + ring;
float steady = 0.30 + 0.70 * vCap;
float fold = mix(0.34, 1.0, vFold);
vec3 warm = mix(vColor, vec3(1.0, 0.88, 0.66), 0.42 * vCap);
vec3 c = mix(warm, vec3(1.0), vAct * vAct * 0.65);
float lvl = 1.55 * steady * fold * vDepth + 1.05 * vAct * vAct + vSel;
frag = vec4(c * a * lvl, a * clamp(lvl, 0.0, 1.0));
}`;
const LINE_VS = `#version 300 es
precision highp float;
in vec3 aPos;
in vec3 aPipe;
in vec3 aColor;
in float aAlpha;
uniform mat4 uVP;
uniform float uMorph;
uniform float uGain;
out vec3 vColor;
out float vAlpha;
void main() {
vec3 p = mix(aPos, aPipe, uMorph);
vec4 clip = uVP * vec4(p, 1.0);
gl_Position = clip;
vColor = aColor;
vAlpha = aAlpha * uGain;
}`;
const LINE_FS = `#version 300 es
precision highp float;
in vec3 vColor;
in float vAlpha;
out vec4 frag;
void main() { frag = vec4(vColor * vAlpha, vAlpha); }`;
const PACKET_VS = `#version 300 es
precision highp float;
in vec3 aPos;
in vec3 aColor;
in float aSize;
uniform mat4 uVP;
out vec3 vColor;
void main() {
vec4 clip = uVP * vec4(aPos, 1.0);
gl_Position = clip;
gl_PointSize = clamp(aSize * 260.0 / max(0.15, clip.w), 1.5, 9.0);
vColor = aColor;
}`;
const PACKET_FS = `#version 300 es
precision highp float;
in vec3 vColor;
out vec4 frag;
void main() {
vec2 d = gl_PointCoord - vec2(0.5);
float r2 = dot(d, d);
if (r2 > 0.25) discard;
float a = smoothstep(0.25, 0.04, r2);
frag = vec4(mix(vColor, vec3(1.0), 0.55) * a * 1.6, a);
}`;
function compile(gl, vs, fs) {
const p = gl.createProgram();
for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
const s = gl.createShader(type);
gl.shaderSource(s, src);
gl.compileShader(s);
if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('shader: ' + gl.getShaderInfoLog(s));
gl.attachShader(p, s);
}
gl.linkProgram(p);
if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(p));
const loc = {};
const na = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES);
for (let i = 0; i < na; i++) { const a = gl.getActiveAttrib(p, i); loc[a.name] = gl.getAttribLocation(p, a.name); }
const nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
for (let i = 0; i < nu; i++) { const u = gl.getActiveUniform(p, i); loc[u.name] = gl.getUniformLocation(p, u.name); }
return { p, loc };
}
function buf(gl, data, usage) {
const b = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, b);
gl.bufferData(gl.ARRAY_BUFFER, data, usage || gl.STATIC_DRAW);
return b;
}
function attach(gl, prog, name, b, size) {
const l = prog.loc[name];
if (l === undefined || l < 0) return;
gl.bindBuffer(gl.ARRAY_BUFFER, b);
gl.enableVertexAttribArray(l);
gl.vertexAttribPointer(l, size, gl.FLOAT, false, 0, 0);
}
function perspective(fovy, aspect, near, far) {
const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
}
function lookAt(eye, center, up) {
let z0 = eye[0] - center[0], z1 = eye[1] - center[1], z2 = eye[2] - center[2];
let l = Math.hypot(z0, z1, z2) || 1; z0 /= l; z1 /= l; z2 /= l;
let x0 = up[1] * z2 - up[2] * z1, x1 = up[2] * z0 - up[0] * z2, x2 = up[0] * z1 - up[1] * z0;
l = Math.hypot(x0, x1, x2) || 1; x0 /= l; x1 /= l; x2 /= l;
const y0 = z1 * x2 - z2 * x1, y1 = z2 * x0 - z0 * x2, y2 = z0 * x1 - z1 * x0;
return new Float32Array([
x0, y0, z0, 0, x1, y1, z1, 0, x2, y2, z2, 0,
-(x0 * eye[0] + x1 * eye[1] + x2 * eye[2]),
-(y0 * eye[0] + y1 * eye[1] + y2 * eye[2]),
-(z0 * eye[0] + z1 * eye[1] + z2 * eye[2]), 1,
]);
}
function mul(a, b) {
const o = new Float32Array(16);
for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
o[i * 4 + j] = a[j] * b[i * 4] + a[4 + j] * b[i * 4 + 1] + a[8 + j] * b[i * 4 + 2] + a[12 + j] * b[i * 4 + 3];
}
return o;
}
class Scene {
constructor(canvas, org, layout, pipe, engine, regionSpec) {
const gl = canvas.getContext('webgl2', { antialias: true, alpha: false, powerPreference: 'high-performance' });
if (!gl) throw new Error('this browser has no WebGL2');
this.gl = gl; this.canvas = canvas; this.org = org; this.engine = engine;
this.regionSpec = regionSpec || {};
this.cells = org.cells; this.k = org.connectome;
this.anat = layout.pos; this.pipe = pipe; this.fold = layout.fold;
this.morph = 0; this.targetMorph = 0;
this.selected = -1;
this.yaw = 1.42; this.pitch = 0.10; this.dist = 285; this.spin = 0.035;
this.tickSec = 0.05;
this.cellProg = compile(gl, CELL_VS, CELL_FS);
this.lineProg = compile(gl, LINE_VS, LINE_FS);
this.packProg = compile(gl, PACKET_VS, PACKET_FS);
this.buildCells();
this.buildEdges();
this.buildConduits();
gl.enable(gl.BLEND);
gl.blendFunc(gl.ONE, gl.ONE);
gl.disable(gl.DEPTH_TEST);
}
buildCells() {
const gl = this.gl, n = this.cells.length;
const color = new Float32Array(n * 3), cap = new Float32Array(n), idx = new Float32Array(n);
this.lastRun = new Float32Array(n);
for (let i = 0; i < n; i++) {
const c = this.cells[i], col = this.regionColor(c.region);
color[i * 3] = col[0]; color[i * 3 + 1] = col[1]; color[i * 3 + 2] = col[2];
cap[i] = c.cap; idx[i] = i;
}
this.cellBufs = {
pos: buf(gl, this.anat), pipe: buf(gl, this.pipe), color: buf(gl, color),
cap: buf(gl, cap), fold: buf(gl, this.fold), idx: buf(gl, idx),
last: buf(gl, this.lastRun, gl.DYNAMIC_DRAW),
};
}
regionColor(name) {
const s = this.regionSpec && this.regionSpec[name];
return s ? s.color : [0.72, 0.76, 0.86];
}
buildEdges(limit) {
const gl = this.gl, k = this.k, cells = this.cells;
const max = limit || 45000;
const step = Math.max(1, Math.ceil(k.n / max));
const ids = [];
for (let e = 0; e < k.n; e += step) ids.push(e);
const m = ids.length;
const pos = new Float32Array(m * 6), pipe = new Float32Array(m * 6), col = new Float32Array(m * 6), al = new Float32Array(m * 2);
for (let j = 0; j < m; j++) {
const e = ids[j], a = k.src[e], b = k.dst[e];
for (let q = 0; q < 3; q++) {
pos[j * 6 + q] = this.anat[a * 3 + q]; pos[j * 6 + 3 + q] = this.anat[b * 3 + q];
pipe[j * 6 + q] = this.pipe[a * 3 + q]; pipe[j * 6 + 3 + q] = this.pipe[b * 3 + q];
}
const ca = this.regionColor(cells[a].region), cb = this.regionColor(cells[b].region);
for (let q = 0; q < 3; q++) { col[j * 6 + q] = ca[q] * 0.8; col[j * 6 + 3 + q] = cb[q] * 0.8; }
const w = Math.min(0.5, 0.012 + 0.07 * Math.abs(k.w[e]));
al[j * 2] = w; al[j * 2 + 1] = w;
}
this.edgeCount = m * 2;
this.edgeBufs = { pos: buf(gl, pos), pipe: buf(gl, pipe), color: buf(gl, col), alpha: buf(gl, al) };
}
buildConduits() {
const gl = this.gl, rows = this.engine.conduits.rows, cells = this.cells;
const cen = new Map();
for (const c of cells) {
let a = cen.get(c.region);
if (!a) { a = [0, 0, 0, 0, 0, 0, 0]; cen.set(c.region, a); }
a[0] += this.anat[c.idx * 3]; a[1] += this.anat[c.idx * 3 + 1]; a[2] += this.anat[c.idx * 3 + 2];
a[3] += this.pipe[c.idx * 3]; a[4] += this.pipe[c.idx * 3 + 1]; a[5] += this.pipe[c.idx * 3 + 2];
a[6]++;
}
for (const a of cen.values()) for (let q = 0; q < 6; q++) a[q] /= a[6];
this.centroid = cen;
const m = rows.length;
const pos = new Float32Array(m * 6), pipe = new Float32Array(m * 6), col = new Float32Array(m * 6), al = new Float32Array(m * 2);
for (let j = 0; j < m; j++) {
const r = rows[j], A = cen.get(r.from), B = cen.get(r.to);
for (let q = 0; q < 3; q++) {
pos[j * 6 + q] = A[q]; pos[j * 6 + 3 + q] = B[q];
pipe[j * 6 + q] = A[3 + q]; pipe[j * 6 + 3 + q] = B[3 + q];
}
const ca = this.regionColor(r.from), cb = this.regionColor(r.to);
for (let q = 0; q < 3; q++) { col[j * 6 + q] = ca[q]; col[j * 6 + 3 + q] = cb[q]; }
al[j * 2] = 0.20; al[j * 2 + 1] = 0.20;
}
this.conduitCount = m * 2;
this.conduitBufs = { pos: buf(gl, pos), pipe: buf(gl, pipe), color: buf(gl, col), alpha: buf(gl, al) };
const per = 14;
this.packN = m * per;
this.packRow = new Int32Array(this.packN);
this.packT = new Float32Array(this.packN);
this.packPos = new Float32Array(this.packN * 3);
this.packCol = new Float32Array(this.packN * 3);
this.packSize = new Float32Array(this.packN);
for (let j = 0; j < m; j++) for (let q = 0; q < per; q++) {
const i = j * per + q;
this.packRow[i] = j;
this.packT[i] = q / per;
const c = this.regionColor(rows[j].to);
this.packCol[i * 3] = c[0]; this.packCol[i * 3 + 1] = c[1]; this.packCol[i * 3 + 2] = c[2];
}
this.packBufs = {
pos: buf(gl, this.packPos, gl.DYNAMIC_DRAW),
color: buf(gl, this.packCol),
size: buf(gl, this.packSize, gl.DYNAMIC_DRAW),
};
}
stepPackets(dt) {
const rows = this.engine.conduits.rows, cen = this.centroid;
const A = this.anat, P = this.pipe, mo = this.morph;
for (let i = 0; i < this.packN; i++) {
const r = rows[this.packRow[i]];
const speed = 1 / ((1 + r.meanDelay) * this.tickSec);
this.packT[i] += dt * speed;
if (this.packT[i] > 1) this.packT[i] -= 1;
const a = cen.get(r.from), b = cen.get(r.to), t = this.packT[i];
for (let q = 0; q < 3; q++) {
const an = a[q] + (b[q] - a[q]) * t;
const pn = a[3 + q] + (b[3 + q] - a[3 + q]) * t;
this.packPos[i * 3 + q] = an + (pn - an) * mo;
}
this.packSize[i] = r.pps > 0 ? Math.min(1, 0.25 + Math.log10(1 + r.pps) * 0.35) : 0;
}
const gl = this.gl;
gl.bindBuffer(gl.ARRAY_BUFFER, this.packBufs.pos);
gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.packPos);
gl.bindBuffer(gl.ARRAY_BUFFER, this.packBufs.size);
gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.packSize);
void A; void P;
}
syncActivity(nowSec) {
const e = this.engine, n = this.cells.length;
for (let j = 0; j < e.ranCount; j++) this.lastRun[e.ranList[j]] = nowSec;
void n;
const gl = this.gl;
gl.bindBuffer(gl.ARRAY_BUFFER, this.cellBufs.last);
gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.lastRun);
}
viewProjection() {
const c = this.canvas;
const aspect = c.width / Math.max(1, c.height);
const proj = perspective(0.85, aspect, 4, 2400);
const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
const eye = [Math.sin(this.yaw) * cp * this.dist, sp * this.dist + 4, Math.cos(this.yaw) * cp * this.dist];
const view = lookAt(eye, [0, 0, 0], [0, 1, 0]);
this.eye = eye;
return mul(proj, view);
}
draw(nowSec, dt) {
const gl = this.gl, c = this.canvas;
const w = Math.floor(c.clientWidth * Math.min(2, window.devicePixelRatio || 1));
const h = Math.floor(c.clientHeight * Math.min(2, window.devicePixelRatio || 1));
if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
this.morph += (this.targetMorph - this.morph) * Math.min(1, dt * 3.2);
this.yaw += this.spin * dt;
const vp = this.viewProjection();
this.vp = vp;
gl.viewport(0, 0, c.width, c.height);
gl.clearColor(0.010, 0.013, 0.026, 1);
gl.clear(gl.COLOR_BUFFER_BIT);
let P = this.lineProg;
gl.useProgram(P.p);
gl.uniformMatrix4fv(P.loc.uVP, false, vp);
gl.uniform1f(P.loc.uMorph, this.morph);
gl.uniform1f(P.loc.uGain, 0.14);
attach(gl, P, 'aPos', this.edgeBufs.pos, 3);
attach(gl, P, 'aPipe', this.edgeBufs.pipe, 3);
attach(gl, P, 'aColor', this.edgeBufs.color, 3);
attach(gl, P, 'aAlpha', this.edgeBufs.alpha, 1);
gl.drawArrays(gl.LINES, 0, this.edgeCount);
gl.uniform1f(P.loc.uGain, 0.60);
attach(gl, P, 'aPos', this.conduitBufs.pos, 3);
attach(gl, P, 'aPipe', this.conduitBufs.pipe, 3);
attach(gl, P, 'aColor', this.conduitBufs.color, 3);
attach(gl, P, 'aAlpha', this.conduitBufs.alpha, 1);
gl.drawArrays(gl.LINES, 0, this.conduitCount);
this.stepPackets(dt);
P = this.packProg;
gl.useProgram(P.p);
gl.uniformMatrix4fv(P.loc.uVP, false, vp);
attach(gl, P, 'aPos', this.packBufs.pos, 3);
attach(gl, P, 'aColor', this.packBufs.color, 3);
attach(gl, P, 'aSize', this.packBufs.size, 1);
gl.drawArrays(gl.POINTS, 0, this.packN);
this.syncActivity(nowSec);
P = this.cellProg;
gl.useProgram(P.p);
gl.uniformMatrix4fv(P.loc.uVP, false, vp);
gl.uniform1f(P.loc.uTime, nowSec);
gl.uniform1f(P.loc.uDecay, 0.13);
gl.uniform1f(P.loc.uPointScale, 780 * (c.width / Math.max(1, c.clientWidth)));
gl.uniform1f(P.loc.uSelected, this.selected);
gl.uniform1f(P.loc.uMorph, this.morph);
gl.uniform1f(P.loc.uRim, 0.16);
gl.uniform2f(P.loc.uDepth, this.dist * 0.45, this.dist * 1.7);
attach(gl, P, 'aPos', this.cellBufs.pos, 3);
attach(gl, P, 'aPipe', this.cellBufs.pipe, 3);
attach(gl, P, 'aColor', this.cellBufs.color, 3);
attach(gl, P, 'aCap', this.cellBufs.cap, 1);
attach(gl, P, 'aFold', this.cellBufs.fold, 1);
attach(gl, P, 'aLastRun', this.cellBufs.last, 1);
attach(gl, P, 'aIdx', this.cellBufs.idx, 1);
gl.drawArrays(gl.POINTS, 0, this.cells.length);
}
pick(px, py, radius) {
const vp = this.vp;
if (!vp) return -1;
const W = this.canvas.width, H = this.canvas.height;
const sx = px * (W / this.canvas.clientWidth), sy = py * (H / this.canvas.clientHeight);
const lim = (radius || 14) * (W / this.canvas.clientWidth);
let best = -1, bestD = lim * lim;
const A = this.anat, Pp = this.pipe, mo = this.morph;
for (let i = 0; i < this.cells.length; i++) {
const x = A[i * 3] + (Pp[i * 3] - A[i * 3]) * mo;
const y = A[i * 3 + 1] + (Pp[i * 3 + 1] - A[i * 3 + 1]) * mo;
const z = A[i * 3 + 2] + (Pp[i * 3 + 2] - A[i * 3 + 2]) * mo;
const cw = vp[3] * x + vp[7] * y + vp[11] * z + vp[15];
if (cw <= 0) continue;
const cx = (vp[0] * x + vp[4] * y + vp[8] * z + vp[12]) / cw;
const cy = (vp[1] * x + vp[5] * y + vp[9] * z + vp[13]) / cw;
const ex = (cx * 0.5 + 0.5) * W - sx, ey = (1 - (cy * 0.5 + 0.5)) * H - sy;
const d = ex * ex + ey * ey;
if (d < bestD) { bestD = d; best = i; }
}
return best;
}
}
const el = (tag, cls, text) => {
const e = document.createElement(tag);
if (cls) e.className = cls;
if (text !== undefined) e.textContent = text;
return e;
};
const f = (v, d) => (Number.isFinite(v) ? v.toFixed(d === undefined ? 1 : d) : '0');
const grp = (v) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
class Hud {
constructor(root) {
this.root = root;
this.state = el('div', 'panel state');
this.conduits = el('div', 'panel conduits');
this.cell = el('div', 'panel cell');
this.cell.style.display = 'none';
this.help = el('div', 'panel help');
root.appendChild(this.state);
root.appendChild(this.conduits);
root.appendChild(this.cell);
root.appendChild(this.help);
this.help.innerHTML = '<b>drag</b> orbit &middot; <b>wheel</b> zoom &middot; <b>click a node</b> inspect &middot;'
+ ' <b>v</b> pipeline view &middot; <b>space</b> pause &middot; <b>s</b> stop the spin';
this.last = 0;
}
setBuild(org, layoutMs) {
const g = org.genome;
this.build = {
majors: g.majors, cells: org.cells.length, edges: org.connectome.n,
buildMs: org.buildMs, layoutMs, seed: g.seed,
duplicates: g.duplicates, claimed: g.claimedPorts,
regions: g.regions,
};
}
update(engine, scene, force) {
const t = performance.now();
if (!force && t - this.last < 120) return;
this.last = t;
const b = this.build, s = engine.stats;
this.state.innerHTML =
'<div class="ttl">DILATION <span class="dim">/</span> BRAIN</div>'
+ row('majors', grp(b.majors) + ' <span class="dim">circuits</span>')
+ row('cells', grp(b.cells))
+ row('edges', grp(b.edges))
+ row('built in', f(b.buildMs) + ' ms <span class="dim">layout ' + f(b.layoutMs) + ' ms</span>')
+ row('seed', b.seed)
+ '<div class="rule"></div>'
+ row('tick', grp(engine.t))
+ row('ticks / s', f(s.tps))
+ row('cells lit', grp(engine.ranCount) + ' <span class="dim">this tick</span>')
+ row('per cell run', f(s.usPerRun, 2) + ' &micro;s')
+ row('per tick', f(s.usPerTick, 1) + ' &micro;s')
+ row('signals sent', grp(s.signals))
+ row('signals landed', grp(s.delivered))
+ '<div class="rule"></div>'
+ row('view', scene.targetMorph > 0.5 ? 'pipeline' : 'anatomy')
+ (this.daemon || daemonRows(null, 'not asked yet'));
const rows = engine.conduits.rows.slice(0, 11);
let h = '<div class="ttl">CONDUITS <span class="dim">' + engine.conduits.rows.length + ' bundles</span></div>'
+ '<table><tr><th>from</th><th>to</th><th class="n">edges</th><th class="n">pkt/s</th>'
+ '<th class="n">hop</th><th class="n">&micro;s/pkt</th></tr>';
for (const r of rows) {
h += '<tr><td>' + r.from + '</td><td>' + r.to + '</td><td class="n">' + grp(r.edges)
+ '</td><td class="n">' + f(r.pps, 0) + '</td><td class="n">' + f(r.hopTicks, 1)
+ '</td><td class="n">' + f(r.usPerHop, 2) + '</td></tr>';
}
h += '</table><div class="note">two separate numbers: <b>hop</b> is latency in the organism clock, one tick of travel'
+ ' plus the bundle mean delay, and <b>&micro;s/pkt</b> is cost, the measured wall microseconds this engine spends'
+ ' carrying one packet one hop. Waiting in flight is free, so the delay does not enter the cost.</div>';
this.conduits.innerHTML = h;
}
setDaemon(health, why) { this.daemon = daemonRows(health, why); }
select(cell, engine) {
if (!cell) { this.cell.style.display = 'none'; return; }
this.cell.style.display = '';
const ports = (list) => list.length === 0 ? '<span class="dim">none</span>'
: list.map(p => '<span class="port">' + p.name + '<span class="dim">:' + p.kinds.join(',') + '</span></span>').join(' ');
const period = cell.policy.period === 'event' ? 'on arrival'
: cell.policy.period === 1 ? 'every tick'
: cell.policy.period >= 3600000 ? (cell.policy.period / 3600000) + ' h'
: cell.policy.period >= 60000 ? (cell.policy.period / 60000) + ' min'
: cell.policy.period >= 1000 ? (cell.policy.period / 1000) + ' s' : cell.policy.period + ' ms';
this.cell.innerHTML =
'<div class="ttl">' + cell.id + ' <span class="dim">cell ' + cell.idx + '</span></div>'
+ '<div class="kind">' + cell.kind + '</div>'
+ '<div class="doc">' + cell.doc + '</div>'
+ row('region', cell.region)
+ row('circuit', cell.circuit + ' <span class="dim">major ' + cell.major + '</span>')
+ row('in ports', ports(cell.ports.in))
+ row('out ports', ports(cell.ports.out))
+ row('capability', f(cell.cap, 3) + ' <span class="dim">0.55&middot;depth/9 + 0.25&middot;ports/6 + 0.20&middot;kinds/6, depth ' + cell.depth + '</span>')
+ row('schedule', period + ' <span class="dim">priority ' + cell.policy.priority + (cell.policy.learn ? ', ' + cell.policy.learn : '') + '</span>')
+ row('runs', grp(cell.runs) + ' <span class="dim">of ' + grp(engine.t) + ' ticks</span>')
+ row('emitted', grp(cell.fired))
+ row('last ran', cell.lastT < 0 ? '<span class="dim">never</span>' : 'tick ' + grp(cell.lastT))
+ row('last output', cell.fired ? f(cell.out, 4) : '<span class="dim">nothing yet</span>')
+ '<div class="note">press escape to close</div>';
}
}
function row(k, v) { return '<div class="row"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>'; }
const hesc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const hnum = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? (d === undefined ? grp(v) : v.toFixed(d)) : '<span class="dim">not reported</span>');
function hdur(s) {
if (typeof s !== 'number' || !Number.isFinite(s)) return '<span class="dim">not reported</span>';
if (s < 120) return s.toFixed(1) + ' s';
if (s < 7200) return (s / 60).toFixed(1) + ' min';
return (s / 3600).toFixed(1) + ' h';
}
function daemonRows(h, why) {
let out = '<div class="rule"></div>';
if (!h || typeof h !== 'object' || h.ok !== true) {
out += row('daemon', '<span class="off">daemon not running</span>');
let note = why ? hesc(why) : '';
if (h && typeof h === 'object') {
note = 'health answered, ok false' + (typeof h.restarts === 'number' ? ', restarts ' + h.restarts : '')
+ (typeof h.error === 'string' ? ': ' + hesc(h.error) : '');
}
return out + (note ? '<div class="note">' + note + '</div>' : '');
}
const cp = h.checkpoint && typeof h.checkpoint === 'object' ? h.checkpoint : null;
const ns = h.nativeShare && typeof h.nativeShare === 'object' && typeof h.nativeShare.share === 'number' ? h.nativeShare : null;
out += row('daemon', '<span class="on">running</span>' + (h.instance ? ' <span class="dim">' + hesc(h.instance) + '</span>' : ''))
+ row('daemon tick', hnum(h.tick))
+ row('daemon ticks / s', hnum(h.ticksPerSec, 1))
+ row('uptime', hdur(h.uptimeS))
+ row('restarts', hnum(h.restarts) + ' <span class="dim">budget kills ' + hnum(h.budgetKills) + '</span>')
+ row('daemon rss', hnum(h.rssMb, 1) + ' MB')
+ row('checkpoint', cp ? 'tick ' + hnum(cp.tick) + ' <span class="dim">' + hdur(cp.ageS) + ' old</span>' : '<span class="dim">none yet</span>')
+ row('instances alive', hnum(h.instancesAlive))
+ row('native share', ns ? hnum(ns.share * 100, 2) + ' %' : '<span class="dim">' + hesc(h.nativeReason || 'not reported') + '</span>');
return out + '<div class="note">from GET /health at ' + hesc(h.at || 'an unreported time') + '</div>';
}
function readDaemon(url, timeoutMs, fetchImpl) {
const get = fetchImpl || (typeof fetch === 'function' ? fetch : null);
if (!get) return Promise.resolve({ health: null, why: 'this browser has no fetch' });
const ctl = typeof AbortController === 'function' ? new AbortController() : null;
const timer = ctl ? setTimeout(function () { ctl.abort(); }, timeoutMs || 2500) : 0;
return get(url, { cache: 'no-store', signal: ctl ? ctl.signal : undefined })
.then(function (r) {
return r.text().then(function (text) {
let j = null;
try { j = JSON.parse(text); } catch (e) { j = null; }
if (!j || typeof j !== 'object' || typeof j.ok !== 'boolean') return { health: null, why: 'nothing answers /health here (HTTP ' + r.status + ')' };
return { health: j, why: null };
});
})
.catch(function (e) { return { health: null, why: 'no health endpoint answered (' + (e && e.name === 'AbortError' ? 'timed out' : 'unreachable') + ')' }; })
.then(function (x) { if (timer) clearTimeout(timer); return x; });
}
const DEFAULT_MAJORS = 1200;
const MAX_MAJORS = 5000;
const canvas = document.getElementById('gl');
const hudRoot = document.getElementById('hud');
const boot = document.getElementById('boot');
const slider = document.getElementById('majors');
const sliderOut = document.getElementById('majorsOut');
const hud = new Hud(hudRoot);
let org = null, engine = null, scene = null;
let paused = false, selected = -1;
function afterPaint(fn) {
let done = false;
const go = () => { if (done) return; done = true; fn(); };
requestAnimationFrame(() => requestAnimationFrame(go));
setTimeout(go, 120);
}
function build(majors) {
boot.style.display = '';
boot.textContent = 'growing ' + majors + ' majors';
afterPaint(() => {
org = buildOrganism({ majors, seed: 'organism' });
const t0 = performance.now();
const lay = brainLayout(org.cells, 100);
const pipe = pipelineLayout(org.cells, 100);
const layoutMs = performance.now() - t0;
engine = new Engine(org);
scene = new Scene(canvas, org, lay, pipe, engine, REGION_SPEC);
hud.setBuild(org, layoutMs);
hud.update(engine, scene, true);
selected = -1;
hud.select(null);
boot.style.display = 'none';
});
}
window.BRAIN = {
build,
state: () => ({ org, engine, scene, hud, selected, ready: !!scene }),
refresh: () => { if (!scene) return false; hud.update(engine, scene, true); hud.select(selected >= 0 ? org.cells[selected] : null, engine); return true; },
daemon: () => hud.daemon || null,
};
const HEALTH = 'health';
function pollDaemon() {
if (location.protocol === 'file:') { hud.setDaemon(null, 'opened from a file: there is no origin to ask'); return; }
if (document.hidden) { setTimeout(pollDaemon, 5000); return; }
readDaemon(HEALTH, 2500).then(function (r) {
hud.setDaemon(r.health, r.why);
if (scene) hud.update(engine, scene, true);
setTimeout(pollDaemon, r.health && r.health.ok ? 5000 : 30000);
});
}
pollDaemon();
let last = performance.now();
function frame(t) {
requestAnimationFrame(frame);
const dt = Math.min(0.05, (t - last) / 1000);
last = t;
if (!scene) return;
if (!paused) {
const until = performance.now() + 5;
for (let i = 0; i < 4; i++) { engine.tick(); if (performance.now() > until) break; }
}
scene.draw(t / 1000, dt);
hud.update(engine, scene, false);
if (selected >= 0) hud.select(org.cells[selected], engine);
}
requestAnimationFrame(frame);
let dragging = false, lx = 0, ly = 0, moved = 0;
canvas.addEventListener('pointerdown', (e) => { dragging = true; moved = 0; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', (e) => {
if (!dragging || !scene) return;
const dx = e.clientX - lx, dy = e.clientY - ly;
lx = e.clientX; ly = e.clientY;
moved += Math.abs(dx) + Math.abs(dy);
scene.yaw -= dx * 0.006;
scene.pitch = Math.max(-1.2, Math.min(1.2, scene.pitch + dy * 0.005));
});
canvas.addEventListener('pointerup', (e) => {
dragging = false;
if (moved > 6 || !scene) return;
const r = canvas.getBoundingClientRect();
const i = scene.pick(e.clientX - r.left, e.clientY - r.top, 14);
selected = i;
scene.selected = i;
hud.select(i >= 0 ? org.cells[i] : null, engine);
});
canvas.addEventListener('wheel', (e) => {
if (!scene) return;
e.preventDefault();
scene.dist = Math.max(90, Math.min(900, scene.dist * (1 + Math.sign(e.deltaY) * 0.10)));
}, { passive: false });
window.addEventListener('keydown', (e) => {
if (!scene) return;
const k = e.key.toLowerCase();
if (k === 'v') scene.targetMorph = scene.targetMorph > 0.5 ? 0 : 1;
else if (k === ' ') { paused = !paused; e.preventDefault(); }
else if (k === 's') scene.spin = scene.spin === 0 ? 0.035 : 0;
else if (k === 'escape') { selected = -1; scene.selected = -1; hud.select(null); }
else if (k === 'g') { slider.value = String(MAX_MAJORS); sliderOut.textContent = MAX_MAJORS; build(MAX_MAJORS); }
});
slider.addEventListener('input', () => { sliderOut.textContent = slider.value; });
slider.addEventListener('change', () => { build(Number(slider.value)); });
slider.value = String(DEFAULT_MAJORS);
sliderOut.textContent = String(DEFAULT_MAJORS);
build(DEFAULT_MAJORS);
})();
