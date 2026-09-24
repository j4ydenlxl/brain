// test/fuzz.test.mjs: seeded property tests. Every input comes from core/rng.mjs, so a
// failure here is a failure anyone can reproduce by running this file again: the seed is
// in the test, not in the clock. Nothing is asserted that the run does not also print.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { RNG } from '../core/rng.mjs';
import * as S from '../core/signal.mjs';
import { Connectome } from '../core/connectome.mjs';
import { Brain } from '../core/brain.mjs';
import '../cells/basic.mjs';
import { seedBasic } from '../seeds/basic.mjs';

const WIDTHS = [16, 64, 8192];

// ---------------------------------------------------------------- hv identities
test('hv: bind is self inverse, permute round trips, sim is symmetric, hamming follows sim exactly', () => {
  let checked = 0;
  for (const d of WIDTHS) {
    const rng = new RNG('fuzz:hv:' + d);
    const trials = d === 8192 ? 30 : 120;
    for (let i = 0; i < trials; i++) {
      const a = S.hvRandom(rng, d), b = S.hvRandom(rng, d);
      assert.deepEqual(S.bind(S.bind(a, b), b), a, 'bind self inverse at d=' + d);
      assert.deepEqual(S.bind(a, b), S.bind(b, a), 'bind commutes at d=' + d);
      const k = 1 + rng.int(d - 1);
      assert.deepEqual(S.unpermute(S.permute(a, k), k), a, 'permute round trip at d=' + d + ' k=' + k);
      assert.equal(S.sim(a, b), S.sim(b, a), 'sim symmetric at d=' + d);
      assert.equal(S.sim(a, a), 1);
      // for bipolar lanes hamming and sim are the same number twice; at a power of two
      // width the division is exact, so this is an equality, not an approximation
      assert.equal(S.hamming(a, b), (1 - S.sim(a, b)) * d / 2, 'hamming = (1 - sim) * D / 2 at d=' + d);
      assert.equal(S.hamming(a, b), S.scalar.hamming(a, b));
      assert.equal(S.sim(a, b), S.scalar.sim(a, b));
      checked++;
    }
  }
  // a width that is not a whole number of 16 byte lanes must take the scalar path and agree
  const rng = new RNG('fuzz:hv:40');
  for (let i = 0; i < 40; i++) {
    const a = S.hvRandom(rng, 40), b = S.hvRandom(rng, 40);
    assert.deepEqual(S.bind(a, b), S.scalar.bind(a, b), 'bind at a non-lane width');
    assert.equal(S.sim(a, b), S.scalar.sim(a, b));
    assert.equal(S.hamming(a, b), S.scalar.hamming(a, b));
    assert.deepEqual(S.bind(S.bind(a, b), b), a);
    checked++;
  }
  console.log('hv identities: ' + checked + ' random pairs across widths ' + WIDTHS.join(', ') + ' and 40');
});

test('hv: a bundle keeps every member above the random baseline, with the margin measured', () => {
  const report = [];
  for (const d of WIDTHS) {
    const rng = new RNG('fuzz:bundle:' + d);
    const trials = d === 8192 ? 20 : 60;
    let held = 0, worstMeanMargin = Infinity, memberSum = 0, outsiderSum = 0, memberN = 0, outsiderN = 0;
    for (let i = 0; i < trials; i++) {
      const members = Array.from({ length: 3 }, () => S.hvRandom(rng, d));
      const bun = S.bundle(members);
      let lo = Infinity, hi = -Infinity, mMean = 0, oMean = 0;
      for (const m of members) { const v = S.sim(bun, m); lo = Math.min(lo, v); mMean += v / members.length; memberSum += v; memberN++; }
      for (let o = 0; o < 20; o++) { const v = S.sim(bun, S.hvRandom(rng, d)); hi = Math.max(hi, v); oMean += v / 20; outsiderSum += v; outsiderN++; }
      if (lo > hi) held++;
      worstMeanMargin = Math.min(worstMeanMargin, mMean - oMean);
      // the mean separation is the property that holds at every width, in every single trial
      assert.ok(mMean > oMean, 'd=' + d + ' trial ' + i + ': members ' + mMean + ' did not beat outsiders ' + oMean);
    }
    report.push({ d, trials, held, worstMeanMargin, member: memberSum / memberN, outsider: outsiderSum / outsiderN });
  }
  console.log('bundle margins: ' + report.map(r => 'd=' + r.d + ' every member above every outsider in ' + r.held + '/' + r.trials + ' trials, mean member sim ' + r.member.toFixed(4) + ' vs outsider ' + r.outsider.toFixed(4) + ', worst per-trial mean margin ' + r.worstMeanMargin.toFixed(4)).join(' | '));
  const [w16, w64, w8192] = report;
  // the strict form (the weakest member beats the strongest of 20 outsiders) is a large
  // number law: it is unreliable at d=16, nearly reliable at d=64, and exact at d=8192
  assert.equal(w8192.held, w8192.trials, 'd=8192 must hold in every trial');
  assert.ok(w64.held / w64.trials >= 0.9, 'd=64 held in only ' + w64.held + ' of ' + w64.trials);
  assert.ok(w16.held / w16.trials < w64.held / w64.trials, 'the strict hold rate must rise with the width');
  assert.ok(w16.worstMeanMargin < w64.worstMeanMargin && w64.worstMeanMargin < w8192.worstMeanMargin, 'the mean margin must rise with the width');
  assert.ok(Math.abs(w8192.outsider) < 0.01, 'the d=8192 baseline must sit on zero: ' + w8192.outsider);
});

// ---------------------------------------------------------------- exact rationals
// An independent BigInt implementation: binary gcd (not the Euclid loop in signal.mjs) and
// Horner digit accumulation for decimals (not a regex over the string).
function bgcd(a, b) {
  a = a < 0n ? -a : a; b = b < 0n ? -b : b;
  if (a === 0n) return b;
  if (b === 0n) return a;
  let shift = 0n;
  while (((a | b) & 1n) === 0n) { a >>= 1n; b >>= 1n; shift++; }
  while ((a & 1n) === 0n) a >>= 1n;
  do {
    while ((b & 1n) === 0n) b >>= 1n;
    if (a > b) { const t = a; a = b; b = t; }
    b -= a;
  } while (b !== 0n);
  return a << shift;
}
const R = {
  make(n, d) {
    if (d === 0n) throw new Error('reference: division by zero');
    if (d < 0n) { n = -n; d = -d; }
    const g = bgcd(n, d) || 1n;
    return { n: n / g, d: d / g };
  },
  add: (a, b) => R.make(a.n * b.d + b.n * a.d, a.d * b.d),
  sub: (a, b) => R.make(a.n * b.d - b.n * a.d, a.d * b.d),
  mul: (a, b) => R.make(a.n * b.n, a.d * b.d),
  div: (a, b) => R.make(a.n * b.d, a.d * b.n),
  pow: (a, k) => (k < 0 ? R.make(a.d ** BigInt(-k), a.n ** BigInt(-k)) : R.make(a.n ** BigInt(k), a.d ** BigInt(k))),
  cmp: (a, b) => { const s = R.sub(a, b).n; return s < 0n ? -1 : s > 0n ? 1 : 0; },
  str: (a) => (a.d === 1n ? a.n.toString() : a.n.toString() + '/' + a.d.toString()),
};
// build a decimal string and its exact value by accumulating digits, independently
function decimal(rng) {
  const neg = rng.u32() & 1;
  const ipLen = rng.int(4), fpLen = rng.int(5), e = rng.int(7) - 3;
  let ip = '', fp = '';
  for (let i = 0; i < ipLen; i++) ip += String(rng.int(10));
  for (let i = 0; i < fpLen; i++) fp += String(rng.int(10));
  if (ip === '' && fp === '') ip = String(1 + rng.int(9));
  let n = 0n, d = 1n;
  for (const ch of ip) n = n * 10n + BigInt(ch);
  for (const ch of fp) { n = n * 10n + BigInt(ch); d *= 10n; }
  if (e >= 0) n *= 10n ** BigInt(e); else d *= 10n ** BigInt(-e);
  let s = (neg ? '-' : '') + (ip === '' ? '' : ip) + (fp === '' ? '' : '.' + fp);
  if (ip === '' && fp !== '') s = (neg ? '-' : '') + '.' + fp;
  if (e !== 0) s += 'e' + e;
  return { text: s, ref: R.make(neg ? -n : n, d) };
}

test('exact rationals: 10000 random operations agree with an independent BigInt implementation', () => {
  const rng = new RNG('fuzz:rat');
  const pool = [];
  for (let i = 0; i < 200; i++) {
    if (i % 3 === 0) { const k = BigInt(rng.int(2001) - 1000); pool.push({ got: S.int(k), ref: R.make(k, 1n) }); }
    else if (i % 3 === 1) { const dec = decimal(rng); const got = S.ratFromDecimal(dec.text); assert.equal(S.ratToString(got), R.str(dec.ref), 'parsed ' + dec.text); pool.push({ got, ref: dec.ref }); }
    else { const n = BigInt(rng.int(401) - 200), d = BigInt(rng.int(400) - 200) || 7n; pool.push({ got: S.rat(n, d), ref: R.make(n, d) }); }
  }
  const same = (got, ref, what) => {
    const g = S.toRat(got);
    assert.equal(g.n, ref.n, what + ' numerator');
    assert.equal(g.d, ref.d, what + ' denominator');
    assert.equal(S.ratToString(g), R.str(ref), what + ' string');
    assert.ok(g.d > 0n, what + ' denominator is positive');
    assert.equal(bgcd(g.n, g.d) || 1n, 1n, what + ' is in lowest terms');
  };
  const counts = { add: 0, sub: 0, mul: 0, div: 0, cmp: 0, pow: 0, neg: 0, roundtrip: 0 };
  let ops = 0;
  while (ops < 10000) {
    const a = pool[rng.int(pool.length)], b = pool[rng.int(pool.length)];
    switch (rng.int(8)) {
      case 0: same(S.ratAdd(a.got, b.got), R.add(a.ref, b.ref), 'add'); counts.add++; break;
      case 1: same(S.ratSub(a.got, b.got), R.sub(a.ref, b.ref), 'sub'); counts.sub++; break;
      case 2: same(S.ratMul(a.got, b.got), R.mul(a.ref, b.ref), 'mul'); counts.mul++; break;
      case 3:
        if (b.ref.n === 0n) { assert.throws(() => S.ratDiv(a.got, b.got), /division by zero/); }
        else same(S.ratDiv(a.got, b.got), R.div(a.ref, b.ref), 'div');
        counts.div++; break;
      case 4: {
        const want = R.cmp(a.ref, b.ref);
        assert.equal(S.ratCmp(a.got, b.got), want, 'cmp ' + R.str(a.ref) + ' vs ' + R.str(b.ref));
        assert.equal(S.ratEq(a.got, b.got), want === 0);
        assert.equal(S.ratCmp(b.got, a.got) + want, 0, 'cmp is antisymmetric');
        counts.cmp++; break;
      }
      case 5: {
        const k = rng.int(5) - 2;
        if (k < 0 && a.ref.n === 0n) break;
        same(S.ratPow(a.got, k), R.pow(a.ref, k), 'pow ' + k); counts.pow++; break;
      }
      case 6: same(S.ratSub(S.int(0), a.got), R.sub(R.make(0n, 1n), a.ref), 'neg'); counts.neg++; break;
      default: {
        const j = S.numFromJSON(JSON.parse(JSON.stringify(S.numToJSON(S.toRat(a.got)))));
        same(j, a.ref, 'json round trip'); counts.roundtrip++; break;
      }
    }
    ops++;
  }
  console.log('rationals: ' + ops + ' operations graded, ' + JSON.stringify(counts));
  assert.equal(ops, 10000);
  for (const k of Object.keys(counts)) assert.ok(counts[k] > 0, k + ' never ran');
});

// ---------------------------------------------------------------- the connectome index
test('connectome: the CSR index equals a naive scan on 200 random graphs', () => {
  let graphs = 0, edges = 0, scans = 0;
  for (let g = 0; g < 200; g++) {
    const rng = new RNG('fuzz:csr:' + g);
    const c = new Connectome(4);
    const naive = [];
    const nodes = 3 + rng.int(10);
    const ops = 5 + rng.int(30);
    const wantOut = (n) => naive.filter(r => r.s === n).map(r => r.e);
    const wantIn = (n) => naive.filter(r => r.d === n).map(r => r.e);
    const sorted = (a) => [...a].sort((x, y) => x - y);
    for (let o = 0; o < ops; o++) {
      const pick = rng.next();
      if (pick < 0.6 || naive.length === 0) {
        const s = rng.int(nodes), d = rng.int(nodes), sp = rng.int(2), dp = rng.int(2);
        const e = c.add(s, d, { srcPort: sp, dstPort: dp, w: rng.next() });
        naive.push({ e, s, d, sp, dp, state: 'active' });
        edges++;
      } else if (pick < 0.8) {
        const r = naive[rng.int(naive.length)];
        c.dormant(r.e); if (r.state === 'active') r.state = 'dormant'; // flags only: the index must not care
      } else {
        const r = naive[rng.int(naive.length)];
        c.prune(r.e); r.state = 'pruned';
      }
      const n = rng.int(nodes + 2);
      assert.deepEqual(sorted(c.outOf(n)), sorted(wantOut(n)), 'graph ' + g + ' op ' + o + ' outOf(' + n + ')');
      assert.deepEqual(sorted(c.into(n)), sorted(wantIn(n)), 'graph ' + g + ' op ' + o + ' into(' + n + ')');
      scans += 2;
    }
    for (let n = 0; n < nodes + 3; n++) {
      assert.deepEqual(sorted(c.outOf(n)), sorted(wantOut(n)), 'graph ' + g + ' final outOf(' + n + ')');
      assert.deepEqual(sorted(c.into(n)), sorted(wantIn(n)), 'graph ' + g + ' final into(' + n + ')');
      assert.deepEqual(c.degree(n), { out: wantOut(n).length, in: wantIn(n).length });
      scans += 3;
    }
    // find is keyed, not scanned: it answers with the LAST edge added on that key, and with
    // -1 when that last edge has been pruned, even if an older twin on the same key is live
    for (const r of naive) {
      const twins = naive.filter(x => x.s === r.s && x.d === r.d && x.sp === r.sp && x.dp === r.dp);
      const last = twins[twins.length - 1];
      const want = last.state === 'pruned' ? -1 : last.e;
      assert.equal(c.find(r.s, r.d, r.sp, r.dp), want, 'graph ' + g + ' find(' + r.s + ',' + r.d + ',' + r.sp + ',' + r.dp + ')');
      scans++;
    }
    for (let n = 0; n < nodes; n++) {
      assert.equal(c.find(n, n, 7, 7), -1, 'find on a key that was never added');
      scans++;
    }
    assert.equal(c.size(), naive.length);
    assert.equal(c.live(), naive.filter(x => x.state === 'active').length, 'graph ' + g + ' live count');
    graphs++;
  }
  console.log('connectome index: ' + graphs + ' graphs, ' + edges + ' edges grown, ' + scans + ' index reads graded against a naive scan');
  assert.equal(graphs, 200);
});

// ---------------------------------------------------------------- the ledger
test('ledger: trace terminates on every seq of a random run and only ever points backwards', () => {
  const b = seedBasic({ ledger: 'full', seed: 'fuzz:trace' });
  const rng = new RNG('fuzz:trace');
  const words = ['hello', 'brain', 'stop', 'ask', 'again', 'now'];
  for (let t = 0; t < 120; t++) {
    if (rng.next() < 0.25) b.inject('p.encode', 'in', { kind: 'event', data: { text: words[rng.int(words.length)] + ' ' + words[rng.int(words.length)] } });
    b.tick(1);
  }
  let traced = 0, deepest = 0;
  for (let s = 0; s < b.ledger.seq; s++) {
    const tr = b.ledger.trace(s, 64);
    assert.equal(tr.root, s);
    assert.ok(tr.nodes.length >= 1, 'seq ' + s + ' traced to nothing');
    assert.equal(new Set(tr.nodes.map(n => n.seq)).size, tr.nodes.length, 'seq ' + s + ' visited an event twice');
    for (const [from, to] of tr.edges) assert.ok(from < to, 'seq ' + s + ' has provenance pointing forward: ' + from + ' -> ' + to);
    deepest = Math.max(deepest, tr.nodes.length);
    traced++;
  }
  console.log('ledger: ' + traced + ' seqs traced, deepest walk ' + deepest + ' events');
  assert.equal(traced, b.ledger.seq);
  assert.ok(traced > 100, 'graded ' + traced + ' events');
});

// ---------------------------------------------------------------- random brains
// Kinds that cannot throw on any well typed input. A port only ever accepts one kind of
// signal here (the wiring rule below), which is what keeps a cell like predict.next from
// being handed an hv one tick and a num the next.
const KINDS = [
  'source.counter', 'sink.log', 'encode.hv', 'hv.cleanup', 'hv.bind', 'hv.bundle', 'hv.permute',
  'hv.compare', 'sdr.encode', 'num.arith', 'num.compare', 'num.count', 'integrate.ema',
  'aggregate.mean', 'predict.next', 'route.key', 'state.machine', 'memory.assoc', 'evaluate.threshold',
];
const PARAMS = { 'num.arith': { op: '+' }, 'hv.permute': { k: 3 } };

function randomBrain(seed, ledger = 'runs') {
  const rng = new RNG(seed);
  const b = new Brain({ name: seed, seed, ledger, pruneEvery: 0 });
  const n = 6 + rng.int(7);
  for (let i = 0; i < n; i++) {
    const kind = KINDS[rng.int(KINDS.length)];
    b.addCell({
      id: 'c' + i, kind, region: 'r' + rng.int(2), circuit: 'k' + rng.int(2),
      params: PARAMS[kind] || {},
      policy: { period: rng.next() < 0.5 ? 'event' : 1 + rng.int(3) },
    });
  }
  const taken = new Map(); // "cell.port" -> the kinds already delivered there
  let wired = 0;
  for (let i = 0; i < n * 8; i++) {
    const a = b.cells[rng.int(n)], d = b.cells[rng.int(n)];
    if (a.idx === d.idx) continue;
    const pp = b.compatiblePorts(a, d);
    if (!pp) continue;
    const kinds = a.ports.out[pp[0]].kinds;
    // a port that can emit more than one kind is left unwired: a cell like predict.next
    // holds state per kind, and a port whose kind changes under it is not a fuzz finding
    if (kinds.length !== 1) continue;
    const key = d.id + '.' + pp[1];
    if (taken.has(key) && taken.get(key) !== kinds.join('|')) continue;
    taken.set(key, kinds[0]);
    b.connect(a.id, pp[0], d.id, pp[1], { delay: rng.int(3), w: 0.5 + rng.next() });
    wired++;
  }
  return { b, wired, rng, taken };
}
// an injection obeys the same rule as an edge: whatever kind a port saw first is the only
// kind it ever sees, so a cell that keeps state per kind is never handed a second one
function feed(b, rng, ticks, taken) {
  const words = ['one', 'two', 'three', 'four'];
  const body = {
    event: () => ({ kind: 'event', data: { text: words[rng.int(4)], key: words[rng.int(4)], items: [1, 2, 3], name: words[rng.int(4)] } }),
    num: () => ({ kind: 'num', data: S.rat(BigInt(rng.int(100)), 7n) }),
    vec: () => ({ kind: 'vec', data: Float32Array.from([rng.next(), rng.next(), rng.next(), rng.next()]) }),
    hv: () => ({ kind: 'hv', data: S.hvFromSeed('feed:' + rng.int(8)) }),
  };
  for (let t = 0; t < ticks; t++) {
    if (rng.next() < 0.3) {
      const c = b.cells[rng.int(b.cells.length)];
      for (let p = 0; p < c.ports.in.length; p++) {
        const key = c.id + '.' + p;
        const kind = taken.get(key) ?? ['event', 'num', 'vec', 'hv'].find(k => c.ports.in[p].kinds.includes(k));
        if (!kind) continue;
        taken.set(key, kind);
        b.inject(c.id, p, body[kind]());
        break;
      }
    }
    b.tick(1);
  }
}
const brainDigest = (b) => ({
  t: b.clock.t,
  cells: b.cells.map(c => [c.id, c.stats.runs, c.stats.fired, c.stats.errors, c.mailbox.map(m => m.length).join('/')].join(':')),
  connectome: b.connectome.serialize(),
  stats: b.stats,
});

test('random brains: random compatible wiring ticks 200 times with no cell error and restores identically', () => {
  let brains = 0, cells = 0, wires = 0, runs = 0;
  for (let i = 0; i < 8; i++) {
    const { b, wired, rng, taken } = randomBrain('fuzz:brain:' + i);
    feed(b, rng, 200, taken);
    const errs = b.ledger.recent(100000, 'cell.error');
    assert.deepEqual(errs.map(e => e.cell + ' (' + b.cell(e.cell).kind + '): ' + e.error), [], 'brain ' + i + ' logged cell errors');
    for (const c of b.cells) assert.equal(c.stats.errors, 0, 'brain ' + i + ' cell ' + c.id + ' (' + c.kind + ') errored');
    assert.equal(b.clock.t, 200);
    const dir = mkdtempSync(path.join(tmpdir(), 'brain-fuzz-'));
    try {
      b.snapshot(dir);
      const c = Brain.restore(dir, { ledger: 'off' });
      assert.deepEqual(brainDigest(c), brainDigest(b), 'brain ' + i + ' did not restore identically');
      const rngA = new RNG('fuzz:after:' + i), rngB = new RNG('fuzz:after:' + i);
      feed(b, rngA, 25, new Map(taken)); feed(c, rngB, 25, new Map(taken));
      assert.deepEqual(brainDigest(c), brainDigest(b), 'brain ' + i + ' diverged after 25 more ticks');
    } finally { rmSync(dir, { recursive: true, force: true }); }
    brains++; cells += b.cells.length; wires += wired; runs += b.stats.runs;
  }
  console.log('random brains: ' + brains + ' brains, ' + cells + ' cells, ' + wires + ' edges, ' + runs + ' cell runs, 0 errors');
  assert.equal(brains, 8);
});
