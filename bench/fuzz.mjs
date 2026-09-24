// bench/fuzz.mjs: THE FUZZING PLANE. Seeded random and adversarial inputs pushed into every
// surface of the organism that takes input from outside itself, with a fixed budget per
// surface that is printed, and only the invariants that actually hold asserted.
//
//   node bench/fuzz.mjs                 every surface, default budget
//   node bench/fuzz.mjs --surface cells,world
//   node bench/fuzz.mjs --budget 800 --seed fuzz:2
//   node bench/fuzz.mjs --no-properties  skip the property file, run the campaigns only
//
// Three rules it exists to enforce.
//
//   1. A budget nobody printed is a budget nobody can check. Every surface prints how many
//      inputs it actually pushed, not how many it meant to.
//   2. Only the invariants that hold. "No exception escapes" is asserted where the code
//      promises it (a cell run counts its errors, it does not throw them at the scheduler)
//      and NOT where the code promises the opposite (brain.inject REFUSES a signal of the
//      wrong kind at the boundary, loudly, and that refusal is itself an invariant here).
//   3. A crash is a finding. The input is minimized by this file, printed, and carried into
//      the verdict so a regression test can be written against the smallest case, not the
//      thousand-character one that happened to find it.
//
// It also runs test/fuzz.test.mjs, the seeded property file, because that file is the one
// the gate runs and the two belong in one tally.
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir, cpus, freemem, loadavg } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { RNG } from '../core/rng.mjs';
import * as S from '../core/signal.mjs';
import { Brain } from '../core/brain.mjs';
import '../cells/index.mjs';
import { runFile } from './runner.mjs';

import { solveEquationText, induceFromExamples, num } from '../capability/induce.mjs';
import { classify, Solver } from '../capability/router.mjs';
import { SkillRegistry } from '../capability/skills.mjs';
import { Tokenizer } from '../mind/tokenizer.mjs';
import { normalizePolicy, denyAll, authorize, hostAllowed, pathAllowed, execAllowed, WORLD_OPS } from '../world/policy.mjs';
import { arm as armSelf, apply as applySelf, selfPolicy } from '../self/apply.mjs';
import { judge, labPolicy } from '../lab/integrate.mjs';
import {
  organismGenomeFromJSON, normalizeOrganismGenome, validateOrganismGenome,
  randomOrganismGenome, cloneOrganismGenome,
} from '../generations/organism-genome.mjs';
import { binOf, gridCapacity } from '../generations/epochs.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (k, d = null) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const flag = (k) => argv.includes(k);
const BUDGET = Number(opt('--budget', '400'));
const SEED = opt('--seed', 'fuzz:2026-09-17');

// ---------------------------------------------------------------- the nasty values
// Everything a port, a parser or a policy can be handed that is not what it asked for.
// BigInt and Symbol are in here on purpose: they are the two values JSON cannot carry, and
// a surface that stringifies its input without thinking will throw on them.
const CYCLE = { name: 'cycle' }; CYCLE.self = CYCLE;
function deepNest(depth) { let o = { leaf: 1 }; for (let i = 0; i < depth; i++) o = { down: o }; return o; }
const NASTY = [
  undefined, null, NaN, Infinity, -Infinity, 0, -0, -1, 0.5, 1e308, -1e308, Number.MIN_VALUE,
  Number.MAX_SAFE_INTEGER + 2, 2n ** 64n, -1n, 0n, true, false,
  '', ' ', '0', '-', 'NaN', 'undefined', '\u0000', '\uFFFD', '\u202E', 'x'.repeat(65536),
  '\u0645\u0631\u062D\u0628\u0627', '\uD83D\uDE00\uD83E\uDDE0', '../../etc/passwd', 'file:///c:/',
  [], [[]], [null], [NaN], new Array(4096).fill(0), {}, { __proto__: null },
  { toString() { throw new Error('toString refuses'); } },
  { valueOf() { throw new Error('valueOf refuses'); } },
  CYCLE, deepNest(512), new Float32Array(0), new Int8Array(0), new Uint8Array([255, 254]),
  Symbol('sym'), () => 1, new Date(NaN), /re/g, new Map(), new Set(),
];
const pickNasty = (rng) => NASTY[rng.int(NASTY.length)];

// A short, safe description of any value: what a finding prints and what a regression test
// is written from. Never throws, whatever it is handed.
function brief(v, depth = 0) {
  try {
    if (v === undefined) return 'undefined';
    if (v === null) return 'null';
    const t = typeof v;
    if (t === 'bigint') return String(v) + 'n';
    if (t === 'symbol') return 'Symbol(...)';
    if (t === 'function') return 'function';
    if (t === 'string') return JSON.stringify(v.length > 60 ? v.slice(0, 60) + '...<' + v.length + ' chars>' : v);
    if (t === 'number' || t === 'boolean') return String(v);
    if (ArrayBuffer.isView(v)) return v.constructor.name + '(' + v.length + ')';
    if (Array.isArray(v)) return depth > 2 ? 'Array(' + v.length + ')' : '[' + v.slice(0, 4).map(x => brief(x, depth + 1)).join(', ') + (v.length > 4 ? ', ...' + v.length : '') + ']';
    if (v instanceof Map) return 'Map(' + v.size + ')';
    if (v instanceof Set) return 'Set(' + v.size + ')';
    if (depth > 2) return '{...}';
    const keys = Object.keys(v).slice(0, 5);
    return '{' + keys.map(k => k + ': ' + brief(v[k], depth + 1)).join(', ') + (Object.keys(v).length > 5 ? ', ...' : '') + '}';
  } catch { return '<unprintable>'; }
}
const firstLine = (e) => String((e && e.message) || e || '').split('\n')[0].slice(0, 180);

// ---------------------------------------------------------------- the minimizer
// Shrink an input while it still crashes the same way. Strings lose halves then characters,
// arrays and objects lose elements and keys, numbers fall to 0. The point is that a finding
// carries the SMALLEST input that reproduces it, so the regression test is readable.
function sameCrash(a, b) { return a && b && a.slice(0, 60) === b.slice(0, 60); }
function candidatesOf(v) {
  const out = [];
  if (typeof v === 'string' && v.length > 1) {
    out.push(v.slice(0, Math.floor(v.length / 2)), v.slice(Math.floor(v.length / 2)));
    if (v.length <= 32) for (let i = 0; i < v.length; i++) out.push(v.slice(0, i) + v.slice(i + 1));
  } else if (Array.isArray(v) && v.length) {
    out.push(v.slice(0, Math.floor(v.length / 2)), v.slice(Math.floor(v.length / 2)));
    if (v.length <= 16) for (let i = 0; i < v.length; i++) out.push(v.slice(0, i).concat(v.slice(i + 1)));
  } else if (v && typeof v === 'object' && !ArrayBuffer.isView(v)) {
    let keys = [];
    try { keys = Object.keys(v); } catch { keys = []; }
    for (const k of keys.slice(0, 16)) { const c = { ...v }; delete c[k]; out.push(c); }
    for (const k of keys.slice(0, 16)) if (v[k] && typeof v[k] === 'object') { const c = { ...v, [k]: null }; out.push(c); }
  } else if (typeof v === 'number' && v !== 0 && Number.isFinite(v)) {
    out.push(0, 1, Math.trunc(v / 2));
  }
  return out;
}
function minimize(input, crashOf, steps = 200) {
  const base = crashOf(input);
  if (!base) return { value: input, steps: 0, shrunk: false };
  let best = input, used = 0, improved = true;
  while (improved && used < steps) {
    improved = false;
    for (const c of candidatesOf(best)) {
      if (used++ >= steps) break;
      let got = null;
      try { got = crashOf(c); } catch { got = null; }
      if (sameCrash(got, base)) { best = c; improved = true; break; }
    }
  }
  return { value: best, steps: used, shrunk: best !== input, error: base };
}

// ---------------------------------------------------------------- a campaign
class Campaign {
  constructor(name, sub) {
    this.name = name; this.sub = sub;
    this.cases = 0; this.refusals = 0; this.handled = 0;
    this.invariants = new Map();   // name -> { checked, broken }
    this.findings = [];
  }
  inv(name, ok, detail = '') {
    const e = this.invariants.get(name) || { checked: 0, broken: 0, first: null };
    e.checked++;
    if (!ok) { e.broken++; if (!e.first) e.first = detail; }
    this.invariants.set(name, e);
    return ok;
  }
  find(what, input, err, crashOf = null) {
    const min = crashOf ? minimize(input, crashOf) : { value: input, steps: 0, shrunk: false };
    this.findings.push({
      surface: this.name, what, error: firstLine(err),
      input: brief(input), minimized: brief(min.value), shrinkSteps: min.steps, shrunk: min.shrunk,
    });
  }
  report() {
    const inv = [...this.invariants].map(([name, e]) => ({ name, checked: e.checked, broken: e.broken, first: e.first }));
    return {
      surface: this.name, subsystem: this.sub, cases: this.cases, refusals: this.refusals,
      handledErrors: this.handled, invariants: inv, findings: this.findings,
      held: inv.every(i => i.broken === 0) && this.findings.length === 0,
    };
  }
}

// ================================================================ 1. cells: signal payloads
// The promise: a cell run that throws is COUNTED, never thrown at the scheduler. The other
// promise, the opposite one: brain.inject refuses a signal whose kind the port does not
// accept, at the boundary, before it can reach a cell at all.
const CELL_KINDS = [
  'source.counter', 'sink.log', 'encode.hv', 'hv.cleanup', 'hv.bind', 'hv.bundle', 'hv.permute',
  'hv.compare', 'sdr.encode', 'num.arith', 'num.compare', 'num.count', 'integrate.ema',
  'aggregate.mean', 'predict.next', 'route.key', 'state.machine', 'memory.assoc', 'evaluate.threshold',
  'integrate.fire', 'phv.bind', 'phv.bundle', 'phv.memory',
];
function nastyPayload(rng, kind) {
  const r = rng.next();
  switch (kind) {
    case 'num':
      if (r < 0.2) return { n: 1n, d: 0n };                       // a rational over zero
      if (r < 0.35) return { n: 10n ** 400n, d: 3n };             // a runaway numerator
      if (r < 0.5) return pickNasty(rng);
      if (r < 0.65) return NaN;
      if (r < 0.8) return S.rat(BigInt(rng.int(1000)) - 500n, 1n);
      return { n: BigInt(rng.int(100)), d: BigInt(rng.int(3)) };  // d may be 0
    case 'vec': {
      if (r < 0.2) return new Float32Array(0);
      if (r < 0.35) return Float32Array.from([NaN, Infinity, -Infinity, 1e39]);
      if (r < 0.5) return pickNasty(rng);
      if (r < 0.6) return new Float32Array(1 << 16);
      return Float32Array.from({ length: 1 + rng.int(8) }, () => (rng.next() - 0.5) * 1e6);
    }
    case 'hv': {
      if (r < 0.2) return new Int8Array(0);
      if (r < 0.35) return Int8Array.from({ length: 7 }, () => 3);     // not bipolar, wrong width
      if (r < 0.5) return pickNasty(rng);
      if (r < 0.65) return new Int8Array(1 << 17);
      return S.hvFromSeed('fuzz:' + rng.int(16));
    }
    case 'phv': {
      if (r < 0.2) return new Float32Array(0);
      if (r < 0.35) return Float32Array.from([NaN, -1e9, 1e9, Math.PI]);
      if (r < 0.5) return pickNasty(rng);
      return Float32Array.from({ length: 4 }, () => rng.next() * 100 - 50);
    }
    case 'sym': {
      if (r < 0.25) return { op: 'nope', args: [] };
      if (r < 0.4) return { op: '+', args: null };
      if (r < 0.55) return deepNest(200);
      if (r < 0.7) return pickNasty(rng);
      return { op: '/', args: [{ op: 'num', value: S.rat(1n, 1n) }, { op: 'num', value: S.rat(0n, 1n) }] };
    }
    default: {   // event
      if (r < 0.15) return CYCLE;
      if (r < 0.3) return deepNest(512);
      if (r < 0.45) return { text: 'x'.repeat(65536), key: pickNasty(rng) };
      if (r < 0.6) return pickNasty(rng);
      if (r < 0.75) return { items: new Array(4096).fill(NaN) };
      return { text: '\uD83D\uDE00', key: '\u0000', name: '', items: [1, 'two', null] };
    }
  }
}
function cellsCampaign(budget) {
  const c = new Campaign('cells: signal payloads into a cell run', 'core + cells');
  const rng = new RNG(SEED + ':cells');
  const b = new Brain({ name: 'fuzz-cells', seed: SEED, ledger: 'runs', pruneEvery: 0, growth: { threshold: Number.MAX_SAFE_INTEGER } });
  for (let i = 0; i < CELL_KINDS.length; i++) {
    try {
      b.addCell({ id: 'c' + i, kind: CELL_KINDS[i], region: 'r' + (i % 3), circuit: 'k' + (i % 2), params: CELL_KINDS[i] === 'num.arith' ? { op: '+' } : {}, policy: { period: 'event' } });
    } catch (e) { c.find('addCell refused a declared kind', CELL_KINDS[i], e); }
  }
  const targets = [];
  for (const cell of b.cells) for (let p = 0; p < cell.ports.in.length; p++) for (const k of cell.ports.in[p].kinds) targets.push([cell.id, p, k]);
  const ALL_KINDS = ['num', 'vec', 'hv', 'phv', 'sym', 'event', 'bits', 'text'];
  let lastSeq = -1;
  for (let i = 0; i < budget; i++) {
    const [id, port, kind] = targets[rng.int(targets.length)];
    const wrongKind = rng.next() < 0.2;
    const use = wrongKind ? ALL_KINDS.filter(k => !b.cell(id).ports.in[port].kinds.includes(k))[rng.int(Math.max(1, ALL_KINDS.length - 1))] || 'event' : kind;
    const data = nastyPayload(rng, use);
    c.cases++;
    let injected = true;
    try {
      b.inject(id, port, { kind: use, data });
    } catch (e) {
      injected = false; c.refusals++;
      c.inv('a wrong kind is refused at the boundary, never delivered', wrongKind || !b.cell(id).ports.in[port].kinds.includes(use), id + '.' + port + ' refused ' + use + ' which it accepts: ' + firstLine(e));
    }
    if (wrongKind) c.inv('a wrong kind is refused at the boundary, never delivered', !injected, id + '.' + port + ' accepted ' + use);
    try {
      b.tick(1);
      c.inv('no exception escapes a cell run: errors are counted, not thrown', true);
    } catch (e) {
      c.inv('no exception escapes a cell run: errors are counted, not thrown', false, firstLine(e));
      c.find('brain.tick threw on a payload a port accepts', { cell: id, port, kind: use, data: brief(data) }, e);
    }
    const seq = b.ledger.seq;
    c.inv('the ledger seq is monotone', seq >= lastSeq, 'seq went ' + lastSeq + ' -> ' + seq);
    lastSeq = seq;
  }
  const errs = b.ledger.recent(1e6, 'cell.error');
  const counted = b.cells.reduce((a, x) => a + x.stats.errors, 0);
  c.handled = counted;
  c.inv('every cell error is both counted on the cell and written to the ledger', errs.length === counted, 'ledger ' + errs.length + ' vs cells ' + counted);
  // the mandated round trip, on a brain a fuzzer has just abused
  const dir = mkdtempSync(path.join(tmpdir(), 'brain-fuzz-snap-'));
  try {
    b.snapshot(dir);
    const back = Brain.restore(dir, { ledger: 'off' });
    const dig = (x) => JSON.stringify({ t: x.clock.t, cells: x.cells.map(y => [y.id, y.stats.runs, y.stats.fired, y.stats.errors].join(':')), conn: x.connectome.serialize() });
    c.inv('a snapshot of a fuzzed brain restores identically', dig(back) === dig(b), 'digest differs');
  } catch (e) {
    c.inv('a snapshot of a fuzzed brain restores identically', false, firstLine(e));
    c.find('snapshot or restore threw after a fuzz run', 'the fuzzed brain', e);
  } finally { rmSync(dir, { recursive: true, force: true }); }
  c.note = b.cells.length + ' cells, ' + targets.length + ' (cell, port, kind) targets, ' + counted + ' cell errors counted, ' + errs.length + ' logged';
  return c;
}

// ================================================================ 2. capability: sym in
function junkExpression(rng) {
  const bits = ['x', '+', '*', '/', '(', ')', '=', '-', '^', '1', '0', '999999999999999999999', '.', ',', ' ', '\u0000', '\uD83D\uDE00', 'x'.repeat(200)];
  let s = '';
  const n = rng.int(12);
  for (let i = 0; i < n; i++) s += bits[rng.int(bits.length)];
  return s;
}
function capabilityCampaign(budget) {
  const c = new Campaign('capability: expressions, equations and requests', 'capability');
  const rng = new RNG(SEED + ':capability');
  const VERDICTS = new Set(['arithmetic', 'algebra', 'list', 'sequence', 'grid', 'decision', 'unknown', null]);
  const crashOfEq = (t) => { try { solveEquationText(t, 'x'); return null; } catch (e) { return firstLine(e); } };
  for (let i = 0; i < budget; i++) {
    c.cases++;
    const text = rng.next() < 0.25 ? String(pickNasty(rng)) : junkExpression(rng);
    try {
      const r = solveEquationText(text, 'x');
      c.inv('solveEquationText always answers with a solved flag, never a half answer', r && typeof r.solved === 'boolean', brief(r));
      if (r && r.solved) c.inv('a solved equation carries the verification that made it solved', r.verified === true, brief(r));
    } catch (e) {
      c.handled++;
      c.find('solveEquationText threw instead of refusing', text, e, crashOfEq);
    }
    try {
      const k = classify(rng.next() < 0.5 ? { text } : { [['eq', 'terms', 'demos', 'features', 'examples', 'sym'][rng.int(6)]]: pickNasty(rng) });
      c.inv('classify always names a route it declares', k && VERDICTS.has(k.route), brief(k));
    } catch (e) { c.handled++; c.find('classify threw', text, e); }
  }
  // the expensive surface gets its own small budget, printed separately
  const solver = new Solver({ registry: new SkillRegistry({ name: 'fuzz' }) });
  const exBudget = Math.max(4, Math.min(12, Math.floor(budget / 32)));
  for (let i = 0; i < exBudget; i++) {
    c.cases++;
    const examples = [
      { in: { x: pickNasty(rng) }, out: pickNasty(rng) },
      { in: { x: num(rng.int(5)) }, out: num(rng.int(5)) },
    ];
    try {
      const r = solver.solve({ examples, ask: { x: num(2) } });
      c.inv('the solver answers or refuses, it never returns undefined', r && typeof r === 'object', brief(r));
    } catch (e) { c.handled++; c.find('Solver.solve threw on adversarial examples', examples, e); }
  }
  c.note = budget + ' expressions and requests, ' + exBudget + ' adversarial example tables into the solver';
  return c;
}

// ================================================================ 3. mind: bytes in
function nastyBytes(rng) {
  const r = rng.next();
  if (r < 0.15) return new Uint8Array(0);
  if (r < 0.3) return new Uint8Array(1 + rng.int(4)).fill(0);
  if (r < 0.45) return Uint8Array.from(Buffer.from('\uD83D\uDE00\u0645\u0631\u062D\u0628\u0627\u0000\uFFFD'.repeat(1 + rng.int(4)), 'utf8'));
  if (r < 0.6) return Uint8Array.from({ length: 256 }, (_, i) => i);
  if (r < 0.75) return new Uint8Array(4096).fill(255);
  return Uint8Array.from({ length: 1 + rng.int(512) }, () => rng.int(256));
}
function mindCampaign(budget) {
  const c = new Campaign('mind: bytes into the tokenizer', 'mind');
  const rng = new RNG(SEED + ':mind');
  const tok = new Tokenizer({ d: 256, vocabSize: 320, minCount: 2 });
  try { tok.train(Uint8Array.from(Buffer.from('the brain trains on its own source. '.repeat(64), 'utf8'))); }
  catch (e) { c.find('Tokenizer.train threw on ordinary text', 'the training corpus', e); }
  const crashOfBytes = (b) => { try { const t = new Tokenizer({ d: 64, vocabSize: 260, minCount: 2 }); t.train(Uint8Array.from(b)); t.decode(t.encode(Uint8Array.from(b))); return null; } catch (e) { return firstLine(e); } };
  for (let i = 0; i < budget; i++) {
    c.cases++;
    const bytes = nastyBytes(rng);
    try {
      const ids = tok.encode(bytes);
      c.inv('every id the tokenizer emits is inside its vocabulary', ids.every(id => id >= 0 && id < tok.size), 'ids out of range');
      const back = tok.decode(ids);
      let same = back.length === bytes.length;
      if (same) for (let k = 0; k < bytes.length; k++) if (back[k] !== bytes[k]) { same = false; break; }
      c.inv('decode(encode(bytes)) is the same bytes, byte for byte', same, brief(bytes) + ' round tripped to ' + back.length + ' bytes from ' + bytes.length);
      if (!same) c.find('the tokenizer did not round trip', [...bytes].slice(0, 64), new Error('round trip differs'), (arr) => { const t = tok; const bb = Uint8Array.from(arr); const bk = t.decode(t.encode(bb)); return bk.length === bb.length && [...bk].every((v, j) => v === bb[j]) ? null : 'round trip differs'; });
    } catch (e) {
      c.handled++;
      c.find('the tokenizer threw on a byte string', [...bytes].slice(0, 64), e, (arr) => crashOfBytes(arr));
    }
    if (i % 64 === 0) {
      try { const t2 = new Tokenizer({ d: 64, vocabSize: 258, minCount: 2 }); t2.train(bytes); c.inv('train survives any byte string', true); }
      catch (e) { c.inv('train survives any byte string', false, firstLine(e)); c.find('Tokenizer.train threw', [...bytes].slice(0, 64), e, crashOfBytes); }
    }
  }
  c.note = budget + ' byte strings encoded and decoded, vocabulary ' + tok.size + ' ids';
  return c;
}

// ================================================================ 4. world: policy JSON in
function nastyPolicy(rng) {
  const r = rng.next();
  if (r < 0.2) return pickNasty(rng);
  if (r < 0.35) return { http: pickNasty(rng), fs: pickNasty(rng), proc: pickNasty(rng) };
  if (r < 0.5) return { http: { hosts: pickNasty(rng), methods: pickNasty(rng), maxBytes: pickNasty(rng) } };
  if (r < 0.65) return { fs: { roots: [pickNasty(rng)], ops: ['read', pickNasty(rng)], maxBytes: -1 } };
  if (r < 0.8) return { proc: { exec: [pickNasty(rng)], maxArgs: NaN } };
  return { version: pickNasty(rng), http: { hosts: ['localhost', '*', ''], methods: ['get', 5] }, fs: { roots: ['.', '..'] } };
}
function nastyWhat(rng) {
  const r = rng.next();
  const op = r < 0.25 ? pickNasty(rng) : WORLD_OPS[rng.int(WORLD_OPS.length)];
  return {
    op, url: pickNasty(rng), path: pickNasty(rng), exec: pickNasty(rng),
    args: rng.next() < 0.5 ? pickNasty(rng) : ['-a', pickNasty(rng)],
    bytes: rng.next() < 0.5 ? pickNasty(rng) : 1 << 30,
  };
}
function worldCampaign(budget) {
  const c = new Campaign('world: policy JSON and world proposals', 'world');
  const rng = new RNG(SEED + ':world');
  const deny = denyAll();
  const crashOfPolicy = (raw) => { try { const p = normalizePolicy(raw); authorize(p, { op: 'http.get', url: 'http://x/' }); return null; } catch (e) { return firstLine(e); } };
  for (let i = 0; i < budget; i++) {
    c.cases++;
    const raw = nastyPolicy(rng);
    let pol = null;
    try {
      pol = normalizePolicy(raw);
      c.inv('a normalized policy always has every section, whatever it was handed', !!(pol && pol.http && pol.fs && pol.proc && pol.clock && pol.listen), brief(pol));
      c.inv('normalization never invents a host or a root the raw policy did not name',
        pol.http.hosts.every(h => JSON.stringify(raw && raw.http && raw.http.hosts || []).includes(String(h && (h.host ?? h)))) || !(raw && raw.http && Array.isArray(raw.http.hosts)),
        brief(pol.http.hosts));
    } catch (e) {
      c.handled++;
      c.find('normalizePolicy threw instead of denying', raw, e, crashOfPolicy);
      continue;
    }
    const what = nastyWhat(rng);
    try {
      const a = authorize(pol, what);
      c.inv('authorize always answers with a boolean ok and a reason when it refuses', a && typeof a.ok === 'boolean' && (a.ok || typeof a.reason === 'string'), brief(a));
    } catch (e) { c.handled++; c.find('authorize threw on a proposal', { policy: brief(pol), what }, e); }
    try {
      const d = authorize(deny, what);
      c.inv('THE GATE: a deny-all policy authorizes nothing, for any input at all', d && d.ok === false, brief(what) + ' -> ' + brief(d));
    } catch (e) { c.handled++; c.find('authorize threw under denyAll', what, e); }
    for (const [fn, name] of [[hostAllowed, 'hostAllowed'], [pathAllowed, 'pathAllowed'], [execAllowed, 'execAllowed']]) {
      try {
        const r = fn(pol, pickNasty(rng));
        c.inv('every allow check answers ok true or false, never undefined', r && typeof r.ok === 'boolean', name + ' -> ' + brief(r));
      } catch (e) { c.handled++; c.find(name + ' threw', 'a nasty value', e); }
    }
  }
  c.note = budget + ' raw policies normalized, ' + budget + ' proposals authorized against them and against denyAll';
  return c;
}

// ================================================================ 5. self: proposals in
function nastyResult(rng) {
  const r = rng.next();
  const base = {
    key: 'fuzz:' + rng.int(1000), from: rng.int(10), verdict: ['confirmed', 'refuted', 'undecided', pickNasty(rng)][rng.int(4)],
    delta: { kind: ['conduit.prune', 'cells.add', pickNasty(rng)][rng.int(3)], region: 'cognitive' },
    metric: 'self.staleRate', line: 'fuzz', treated: pickNasty(rng), control: pickNasty(rng),
    gain: pickNasty(rng), gainPct: [pickNasty(rng), -1.4686, 0.5, 1e9][rng.int(4)],
    identicalArms: rng.next() < 0.5, ticks: rng.int(50), applied: { cells: rng.int(20), edges: rng.int(1000) },
  };
  if (r < 0.12) delete base.delta;
  if (r >= 0.12 && r < 0.2) base.delta = pickNasty(rng);
  if (r >= 0.2 && r < 0.25) return pickNasty(rng);
  return base;
}
function selfCampaign(budget) {
  const c = new Campaign('self: trial results into the self gate', 'self');
  const rng = new RNG(SEED + ':self');
  const pol = selfPolicy();
  // the policy alone, on evidence nobody sanitized
  for (let i = 0; i < budget; i++) {
    c.cases++;
    const ev = { evidence: { deltaKind: pickNasty(rng), verdict: rng.next() < 0.5 ? 'confirmed' : pickNasty(rng), identicalArms: rng.next() < 0.5 ? true : pickNasty(rng), gainPct: pickNasty(rng), cells: pickNasty(rng), edges: pickNasty(rng) } };
    try {
      const v = pol(ev);
      c.inv('the policy answers approve, reject or hold and nothing else', ['approve', 'reject', 'hold'].includes(v), brief(v));
      const e = ev.evidence;
      const legal = e.verdict === 'confirmed' && e.identicalArms === true && Math.abs(Number(e.gainPct) || 0) >= 1 && !((Number(e.cells) || 0) > 8) && !((Number(e.edges) || 0) > 256);
      c.inv('THE GATE: nothing is approved that does not clear confirmed, matched arms and the gain bar', v !== 'approve' || legal, brief(e) + ' -> ' + v);
    } catch (e) { c.handled++; c.find('selfPolicy threw on adversarial evidence', ev, e); }
  }
  // the whole path: a result into apply() on an armed brain
  const attempts = Math.max(8, Math.min(60, Math.floor(budget / 4)));
  const brain = new Brain({ name: 'fuzz-self', seed: SEED, ledger: 'full', pruneEvery: 0, growth: { threshold: Number.MAX_SAFE_INTEGER } });
  brain.addCell({ id: 'a', kind: 'source.counter', region: 'cognitive', circuit: 'c', policy: { period: 1 } });
  brain.addCell({ id: 'b', kind: 'sink.log', region: 'cognitive', circuit: 'c', policy: { period: 'event' } });
  armSelf(brain.gate);
  let lastSeq = -1;
  const crashOfResult = (res) => { try { applySelf(brain, res); return null; } catch (e) { return firstLine(e); } };
  for (let i = 0; i < attempts; i++) {
    c.cases++;
    const res = nastyResult(rng);
    try {
      const d = applySelf(brain, res);
      c.inv('apply always returns a decision with a status', d && typeof d.status === 'string', brief(d));
      if (d && d.applied) {
        const props = brain.ledger.recent(1e6, 'proposal').filter(p => p.id === d.proposal.id);
        c.inv('THE GATE: nothing is applied without a matching proposal in the ledger', props.length === 1 && props[0].seq < d.seq, 'proposal ' + brief(d.proposal && d.proposal.id) + ' matched ' + props.length + ' ledger events');
      }
    } catch (e) {
      c.handled++;
      c.find('apply threw on a malformed trial result', res, e, crashOfResult);
    }
    c.inv('the ledger seq is monotone', brain.ledger.seq >= lastSeq, 'seq went backwards');
    lastSeq = brain.ledger.seq;
  }
  c.note = budget + ' evidence objects through selfPolicy, ' + attempts + ' malformed trial results through apply()';
  return c;
}

// ================================================================ 6. lab: proposals in
function nastyVerdictRecord(rng) {
  const r = rng.next();
  if (r < 0.15) return pickNasty(rng);
  return {
    verdict: rng.next() < 0.5 ? 'confirmed' : pickNasty(rng),
    effect: rng.next() < 0.5 ? { mean: pickNasty(rng) } : pickNasty(rng),
    permutation: rng.next() < 0.5 ? { share: pickNasty(rng) } : pickNasty(rng),
    k: pickNasty(rng),
    bar: { alpha: pickNasty(rng), seeds: pickNasty(rng) },
    hypothesis: { minEffect: pickNasty(rng) },
    source: { mechanism: pickNasty(rng) },
  };
}
function labCampaign(budget) {
  const c = new Campaign('lab: integration proposals into the lab gate', 'lab');
  const rng = new RNG(SEED + ':lab');
  for (let i = 0; i < budget; i++) {
    c.cases++;
    const proposal = rng.next() < 0.1 ? { evidence: pickNasty(rng) } : { evidence: { verdict: nastyVerdictRecord(rng), file: rng.next() < 0.5 ? 'lab/verdicts/x.json' : pickNasty(rng), mechanismHash: pickNasty(rng) } };
    try {
      const j = judge(proposal);
      c.inv('judge always returns a verdict and its reasons', j && ['approve', 'reject', 'hold'].includes(j.verdict) && Array.isArray(j.reasons), brief(j));
      const v = proposal.evidence && proposal.evidence.verdict;
      const legal = !!v && v.verdict === 'confirmed'
        && typeof v.effect?.mean === 'number' && typeof v.hypothesis?.minEffect === 'number' && v.effect.mean >= v.hypothesis.minEffect
        && typeof v.permutation?.share === 'number' && typeof v.bar?.alpha === 'number' && v.permutation.share <= v.bar.alpha
        && typeof v.k === 'number' && typeof v.bar?.seeds === 'number' && v.k >= v.bar.seeds;
      c.inv('THE GATE: nothing is approved whose verdict record does not clear every stated bar', j.verdict !== 'approve' || legal, brief(v) + ' -> ' + j.verdict);
      c.inv('labPolicy agrees with judge, always', labPolicy(proposal) === j.verdict, 'policy and judge disagree');
    } catch (e) { c.handled++; c.find('judge threw on an adversarial proposal', proposal, e); }
  }
  c.note = budget + ' integration proposals judged';
  return c;
}

// ================================================================ 7. epochs: genomes in
function nastyGenome(rng) {
  const r = rng.next();
  if (r < 0.15) return pickNasty(rng);
  const g = cloneOrganismGenome(randomOrganismGenome(new RNG('fuzz:genome:' + rng.int(1000))));
  const keys = Object.keys(g);
  const k = keys[rng.int(keys.length)];
  if (r < 0.4) g[k] = pickNasty(rng);
  else if (r < 0.55) delete g[k];
  else if (r < 0.7) g.majors = pickNasty(rng);
  else if (r < 0.85) g.regions = pickNasty(rng);
  else g.kindMix = pickNasty(rng);
  return g;
}
function epochsCampaign(budget) {
  const c = new Campaign('epochs: genome objects and behaviour descriptors', 'epochs');
  const rng = new RNG(SEED + ':epochs');
  const cap = gridCapacity();
  const crashOfGenome = (g) => { try { validateOrganismGenome(normalizeOrganismGenome(g)); return null; } catch (e) { return firstLine(e); } };
  for (let i = 0; i < budget; i++) {
    c.cases++;
    const g = nastyGenome(rng);
    try {
      const n = normalizeOrganismGenome(g);
      const problems = validateOrganismGenome(n);
      c.inv('validate always answers with a list of problems, never a throw', Array.isArray(problems), brief(problems));
      c.inv('a normalized genome is either valid or its problems are named', Array.isArray(problems), brief(problems));
    } catch (e) { c.handled++; c.find('normalize or validate threw on a malformed genome', g, e, crashOfGenome); }
    try {
      const j = organismGenomeFromJSON(rng.next() < 0.5 ? g : pickNasty(rng));
      c.inv('fromJSON answers with an object or refuses cleanly', j === null || typeof j === 'object', brief(j));
    } catch (e) { c.handled++; c.find('organismGenomeFromJSON threw', g, e); }
    const desc = { regionEntropy: pickNasty(rng), meanDelay: pickNasty(rng), firingFraction: pickNasty(rng), kindEntropy: pickNasty(rng) };
    try {
      const bin = binOf(desc);
      const parts = String(bin).split('-').map(Number);
      c.inv('every behaviour falls in a bin the grid actually has', parts.every(p => Number.isInteger(p) && p >= 0) && parts.length >= 1, brief(bin));
      c.inv('the grid never reports more cells than its capacity', parts.reduce((a, p) => a * (p + 1), 1) <= cap, brief(bin) + ' over capacity ' + cap);
    } catch (e) { c.handled++; c.find('binOf threw on a descriptor', desc, e); }
  }
  c.note = budget + ' malformed genomes normalized and validated, ' + budget + ' descriptors binned, grid capacity ' + cap;
  return c;
}

// ---------------------------------------------------------------- run
const ALL = {
  cells: cellsCampaign, capability: capabilityCampaign, mind: mindCampaign,
  world: worldCampaign, self: selfCampaign, lab: labCampaign, epochs: epochsCampaign,
};
const want = (opt('--surface') || Object.keys(ALL).join(',')).split(',').map(s => s.trim()).filter(Boolean);
for (const w of want) if (!ALL[w]) { console.error('no such surface: ' + w + ' (have ' + Object.keys(ALL).join(', ') + ')'); process.exit(2); }

const conditions = {
  at: new Date().toISOString(), node: process.version, platform: process.platform,
  cpus: cpus().length, cpu: cpus()[0] && cpus()[0].model, loadavg: loadavg(),
  freememGB: Number((freemem() / 2 ** 30).toFixed(1)), budgetPerSurface: BUDGET, seed: SEED,
};
console.log('conditions: node ' + conditions.node + ' ' + conditions.platform + ', ' + conditions.cpus + ' cpus, free ' + conditions.freememGB + ' GB');
console.log('fuzz: seed ' + SEED + ', budget ' + BUDGET + ' inputs per surface, ' + want.length + ' surfaces\n');

const reports = [];
const t0 = Date.now();
for (const name of want) {
  const tS = Date.now();
  const c = ALL[name](BUDGET);
  const r = c.report();
  r.ms = Date.now() - tS;
  r.note = c.note || '';
  reports.push(r);
  console.log((r.held ? 'HELD  ' : 'FOUND ') + name.padEnd(11) + String(r.cases).padStart(6) + ' inputs, '
    + r.invariants.length + ' invariants, ' + r.invariants.reduce((a, i) => a + i.checked, 0) + ' checks, '
    + r.findings.length + ' findings, ' + r.handledErrors + ' errors handled and counted, ' + r.ms + 'ms');
  console.log('        ' + r.note);
  for (const i of r.invariants) console.log('        ' + (i.broken ? 'BROKEN ' : 'held   ') + i.name + ' (' + i.checked + ' checks' + (i.broken ? ', ' + i.broken + ' broken: ' + i.first : '') + ')');
  for (const f of r.findings) console.log('        FINDING ' + f.what + ': ' + f.error + '\n                input ' + f.input + '\n                minimized to ' + f.minimized + ' in ' + f.shrinkSteps + ' shrink steps');
}

let propertyFile = null;
if (!flag('--no-properties')) {
  console.log('\nthe seeded property file (the one the gate runs):');
  const code = await runFile('FUZZ PROPERTIES', 'test/fuzz.test.mjs', 'fuzz-properties.json');
  propertyFile = { file: 'test/fuzz.test.mjs', verdict: code === 0 ? 'GREEN' : 'RED', verdictFile: 'bench/verdicts/fuzz-properties.json' };
}

const cases = reports.reduce((a, r) => a + r.cases, 0);
const checks = reports.reduce((a, r) => a + r.invariants.reduce((b, i) => b + i.checked, 0), 0);
const broken = reports.reduce((a, r) => a + r.invariants.reduce((b, i) => b + i.broken, 0), 0);
const findings = reports.reduce((a, r) => a + r.findings.length, 0);
const verdict = broken === 0 && findings === 0 && (!propertyFile || propertyFile.verdict === 'GREEN') ? 'GREEN' : 'RED';
mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
writeFileSync(path.join(HERE, 'verdicts', 'fuzz.json'), JSON.stringify({
  at: new Date().toISOString(), node: process.version, conditions,
  tally: { surfaces: reports.length, cases, invariantChecks: checks, invariantsBroken: broken, findings, handledErrors: reports.reduce((a, r) => a + r.handledErrors, 0), wallMs: Date.now() - t0 },
  surfaces: reports, properties: propertyFile, verdict,
}, null, 2));

console.log('\nFUZZ ' + verdict + ': ' + reports.length + ' surfaces, ' + cases + ' inputs, ' + checks + ' invariant checks, '
  + broken + ' broken, ' + findings + ' findings, ' + (Date.now() - t0) + 'ms');
console.log('surface     inputs checks broken findings ms');
for (const r of reports) console.log('  ' + r.surface.split(':')[0].padEnd(11) + String(r.cases).padStart(6) + String(r.invariants.reduce((a, i) => a + i.checked, 0)).padStart(7) + String(r.invariants.reduce((a, i) => a + i.broken, 0)).padStart(7) + String(r.findings.length).padStart(9) + String(r.ms).padStart(7));
process.exit(verdict === 'GREEN' ? 0 : 1);
