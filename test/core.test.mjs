import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { RNG } from '../core/rng.mjs';
import * as S from '../core/signal.mjs';
import * as P from '../core/primitives.mjs';
import { Connectome, CoActivation, ACTIVE, PRUNED } from '../core/connectome.mjs';
import { Clock, SEC, MIN } from '../core/clock.mjs';
import { Ledger } from '../core/ledger.mjs';
import { Gate, PROPOSAL_KINDS, makePolicy, registerProposalKind, registerPolicy, policyFor, knownKind, registeredKinds } from '../core/gate.mjs';
import { Scheduler } from '../core/scheduler.mjs';
import { Brain } from '../core/brain.mjs';
import '../cells/basic.mjs';
import { seedBasic } from '../seeds/basic.mjs';

test('rng is deterministic and forkable', () => {
  const a = new RNG('x'), b = new RNG('x');
  assert.equal(a.u32(), b.u32());
  assert.notEqual(new RNG('x').fork('l').u32(), new RNG('x').fork('m').u32());
  const r = RNG.from(a.serialize()); assert.equal(r.u32(), b.u32());
});

test('hypervectors: random are quasi-orthogonal, bind is self-inverse, bundle keeps members, sequence is ordered', () => {
  const rng = new RNG('hv');
  const a = S.hvRandom(rng), b = S.hvRandom(rng), c = S.hvRandom(rng);
  assert.ok(Math.abs(S.sim(a, b)) < 0.05, 'random sim ' + S.sim(a, b));
  assert.equal(S.sim(S.bind(S.bind(a, b), b), a), 1);
  const bun = S.bundle([a, b, c]);
  assert.ok(S.sim(bun, a) > 0.3 && S.sim(bun, b) > 0.3 && S.sim(bun, c) > 0.3);
  const d = S.hvRandom(rng);
  assert.ok(S.sim(bun, d) < 0.1);
  const s1 = S.hvSequence([a, b]), s2 = S.hvSequence([b, a]);
  assert.ok(S.sim(s1, s2) < 0.2, 'order matters: ' + S.sim(s1, s2));
  assert.equal(S.sim(S.permute(S.permute(a, 3), -3), a), 1);
  assert.equal(S.hvFromSeed('cat')[7], S.hvFromSeed('cat')[7]);
});

test('item memory cleanup recovers a bundled member', () => {
  const m = new S.ItemMemory();
  const v = S.bundle([m.get('cat'), m.get('dog'), m.get('fish')]);
  assert.equal(m.nearest(v, 3).map(x => x[0]).sort().join(), 'cat,dog,fish');
  const j = m.serialize(); const m2 = S.ItemMemory.from(j);
  assert.equal(S.sim(m2.get('cat'), m.get('cat')), 1);
});

test('exact numbers: 9.11 < 9.9, 0.1 + 0.2 = 0.3, and JSON round trip', () => {
  assert.equal(S.ratCmp(S.ratFromDecimal('9.11'), S.ratFromDecimal('9.9')), -1);
  assert.ok(S.ratEq(S.ratAdd(S.ratFromDecimal('0.1'), S.ratFromDecimal('0.2')), S.ratFromDecimal('0.3')));
  assert.equal(S.ratToString(S.ratDiv(S.int(1), S.int(3))), '1/3');
  assert.equal(S.ratToString(S.ratMul(S.ratFromDecimal('1e3'), S.ratFromDecimal('2.5'))), '2500');
  const x = S.ratFromDecimal('-12.345');
  assert.ok(S.ratEq(S.numFromJSON(S.numToJSON(x)), x));
  assert.equal(S.ratToString(S.ratPow(S.ratFromDecimal('1/2'), 10)), '1/1024');
});

test('algebra: evaluate and solve linear equations exactly', () => {
  const { S: Y } = S;
  const eq = Y.eq(Y.add(Y.mul(Y.num(3), Y.v('x')), Y.num(7)), Y.sub(Y.mul(Y.num(1), Y.v('x')), Y.num(5)));
  const x = P.solveLinear(eq, 'x');
  assert.equal(S.ratToString(x), '-6');
  assert.deepEqual(P.verify('sym', eq, null, { x: '-6' }).ok, true);
  assert.deepEqual(P.verify('sym', eq, null, { x: '6' }).ok, false);
  const eq2 = Y.eq(Y.div(Y.add(Y.v('x'), Y.num(1)), Y.num(2)), Y.num('0.75'));
  assert.equal(S.ratToString(P.solveLinear(eq2, 'x')), '1/2');
  assert.equal(P.solveLinear(Y.eq(Y.mul(Y.v('x'), Y.v('x')), Y.num(4)), 'x'), null);
  assert.equal(S.symToString(eq2), '((x + 1) / 2) = 3/4');
});

test('primitives: count, compare, integrate, predict', () => {
  assert.equal(S.ratToString(P.count('event', ['r', 'r', 's'], (c) => c === 'r')), '2');
  assert.equal(P.compare('num', S.int(2), S.int(2)), 0);
  const ema = P.integrate('vec', null, Float32Array.from([1, 1]), 4);
  const ema2 = P.integrate('vec', ema, Float32Array.from([3, 3]), 4);
  assert.ok(Math.abs(ema2[0] - 1.5) < 1e-6);
  const pr = P.predict('vec', [Float32Array.from([1]), Float32Array.from([2])], Float32Array.from([3]));
  assert.equal(pr.prediction[0], 3); assert.equal(pr.error, 0);
});

test('connectome: add, index, hebbian, prune candidates, serialize', () => {
  const c = new Connectome(2);
  const e0 = c.add(0, 1, { w: 0.5 }), e1 = c.add(0, 2, { w: 0.01 }), e2 = c.add(3, 1);
  assert.equal(c.size(), 3); assert.ok(c.capacity >= 3);
  assert.deepEqual([...c.outOf(0)], [e0, e1]); assert.deepEqual([...c.into(1)].sort(), [e0, e2].sort());
  const before = c.w[e0]; c.strengthen(e0, 1, 1, 0.1, 0); assert.ok(c.w[e0] > before);
  c.touch(e0, 5000);
  const cand = c.pruneCandidates(5000, { floor: 0.05, staleTicks: 1000 });
  assert.deepEqual(cand, [e1]);
  c.prune(e1); assert.equal(c.flags[e1], PRUNED); assert.equal(c.live(), 2);
  const j = JSON.parse(JSON.stringify(c.serialize())); const c2 = Connectome.from(j);
  assert.equal(c2.size(), 3); assert.equal(c2.w[e0], c.w[e0]); assert.equal(c2.flags[e1], PRUNED);
  assert.equal(c2.find(0, 1), e0); assert.equal(c2.find(0, 2), -1);
});

test('co-activation crosses a threshold into a grow candidate', () => {
  const c = new Connectome(); const co = new CoActivation({ threshold: 3 });
  let out = [];
  for (let i = 0; i < 3; i++) out = co.observe([4, 9], c);
  assert.deepEqual(out, [[4, 9, 3]]);
  c.add(4, 9); assert.deepEqual(co.observe([4, 9], c), []);
});

test('clock: tick wheel returns exactly the due cells', () => {
  const clk = new Clock();
  clk.register({ idx: 0, policy: { period: 1 } }); clk.register({ idx: 1, policy: { period: 10 } }); clk.register({ idx: 2, policy: { period: SEC } }); clk.register({ idx: 3, policy: { period: 'event' } });
  assert.deepEqual(clk.due(0), [0, 1, 2]); assert.deepEqual(clk.due(5), [0]); assert.deepEqual(clk.due(10), [0, 1]); assert.deepEqual(clk.due(1000), [0, 1, 2]);
  assert.equal(Clock.label(MIN), '1min'); assert.equal(Clock.label(250), '250ms');
});

test('ledger: seq, ring, trace upstream', () => {
  const l = new Ledger({ ring: 8 });
  const a = l.append({ type: 'signal', from: null }); const r = l.append({ type: 'cell.run', consumed: [a] }); const s = l.append({ type: 'signal', from: r }); const r2 = l.append({ type: 'cell.run', consumed: [s] });
  const tr = l.trace(r2);
  assert.deepEqual(tr.nodes.map(n => n.seq), [r2, s, r, a]);
  assert.equal(l.recent(2).length, 2);
});

test('gate: policy approves with evidence, holds human-required kinds, logs decisions', () => {
  const l = new Ledger({ ring: 64 }); const g = new Gate({ ledger: l });
  const ok = g.propose({ kind: 'edge.grow', what: {}, evidence: { coActivations: 9 } }); assert.equal(ok.status, 'approved');
  const no = g.propose({ kind: 'edge.grow', what: {}, evidence: { coActivations: 1 } }); assert.equal(no.status, 'rejected');
  const held = g.propose({ kind: 'external.action', what: { do: 'x' } }); assert.equal(held.status, 'pending'); assert.equal(g.listPending().length, 1);
  g.decide(held.id, true, 'human'); assert.equal(g.stats.approved, 2); assert.equal(g.listPending().length, 0);
  assert.equal(l.summary().decision, 3);
});

test('brain: wiring refuses kind mismatch, runs a seed, exact compare through cells, snapshot/restore replays identically', () => {
  const b = seedBasic({ ledger: 'full' });
  assert.throws(() => b.connect('p.encode', 'hv', 'c.cmp', 'a'), /kinds hv not accepted/);
  b.inject('p.encode', 'in', { kind: 'event', data: { text: 'hello brain' } });
  b.inject('c.cmp', 'a', { kind: 'num', data: S.ratFromDecimal('9.11') });
  b.inject('c.cmp', 'b', { kind: 'num', data: S.ratFromDecimal('9.9') });
  b.tick(5);
  const cmp = b.takeOutbox().find(s => s.src === b.cell('c.cmp').idx);
  assert.equal(cmp.data.cmp, -1);
  assert.ok(b.cell('p.encode').stats.runs === 1 && b.cell('a.bundle').stats.runs === 1 && b.cell('a.predict').stats.runs === 1);
  // provenance: the a.predict run consumed a signal that came from a.bundle's run
  const runs = b.ledger.recent(200, 'cell.run');
  const pr = runs.find(r => r.cell === 'a.predict');
  const tr = b.ledger.trace(pr.seq);
  assert.ok(tr.nodes.some(n => n.type === 'cell.run' && n.cell === 'a.bundle'), 'trace reaches a.bundle');
  assert.ok(tr.nodes.some(n => n.type === 'cell.run' && n.cell === 'p.encode'), 'trace reaches p.encode');
  // snapshot, restore, and the two brains agree after the same further input
  const dir = mkdtempSync(path.join(tmpdir(), 'brain-'));
  try {
    b.inject('p.encode', 'in', { kind: 'event', data: { text: 'hello again' } }, { delay: 2 });
    b.snapshot(dir);
    const c = Brain.restore(dir, { ledger: 'off' });
    b.tick(10); c.tick(10);
    assert.equal(c.cell('a.bundle').stats.runs, b.cell('a.bundle').stats.runs);
    assert.equal(c.clock.t, b.clock.t);
    assert.equal(S.sim(c.cell('a.predict').state.lastPrediction, b.cell('a.predict').state.lastPrediction), 1);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('brain: periodic cells fire on their period, event cells only with mail, scheduler budget skips', () => {
  const b = seedBasic({ ledger: 'runs' });
  b.tick(SEC * 2 + 1);
  assert.equal(b.cell('h.tick').stats.runs, 3);
  assert.equal(b.cell('h.log').stats.runs, 2, 'a signal takes one tick to travel, so the third delivery lands at t = 2001');
  b.tick(1);
  assert.equal(b.cell('h.log').stats.runs, 3);
  assert.equal(b.cell('mo.fsm').stats.runs, 0);
  const s = b.summary(); assert.equal(s.t, SEC * 2 + 2);
  const b2 = new Brain({ ledger: 'off' });
  b2.addRegion('r', { budget: 1 });
  b2.addCell({ id: 'x', kind: 'source.counter', region: 'r', policy: { priority: 2 } });
  b2.addCell({ id: 'y', kind: 'source.counter', region: 'r', policy: { priority: 1 } });
  b2.tick(4);
  assert.equal(b2.cell('x').stats.runs, 4); assert.equal(b2.cell('y').stats.runs, 0); assert.equal(b2.cell('y').stats.skips, 4);
});

test('brain: growth proposals pass the gate and create edges; hebbian strengthens used edges', () => {
  const b = new Brain({ ledger: 'runs', growth: { threshold: 3 }, gate: { growThreshold: 3 } }); // the gate bar is set on its own, not derived from the tracker
  b.addCell({ id: 'a', kind: 'source.counter', region: 'r' });
  b.addCell({ id: 'c', kind: 'source.counter', region: 'r' });
  b.addCell({ id: 'p', kind: 'predict.next', region: 'r', policy: { period: 'event' } });
  b.addCell({ id: 's', kind: 'sink.log', region: 'r', policy: { period: 'event', learn: 'hebbian' } });
  b.connect('c', 'out', 'p', 'observe');
  const e = b.connect('a', 'out', 's', 'in', { w: 0.5 });
  b.tick(8);
  // a and p fire together every tick from t = 2 and are unconnected; a.out (num) fits p.observe
  assert.ok(b.gate.stats.approved >= 1, 'gate approved a growth proposal: ' + JSON.stringify(b.gate.stats));
  assert.ok(b.connectome.find(b.cell('a').idx, b.cell('p').idx) >= 0, 'grew the edge a -> p');
  assert.equal(b.ledger.recent(50, 'decision').filter(d => d.kind === 'edge.grow' && d.status === 'approved').length >= 1, true);
  // sink.log never fires (no out ports) so post = 0 and the weight only decays under alpha
  assert.ok(b.connectome.w[e] < 0.5 && b.connectome.w[e] > 0.49);
});

test('vec.mlp learns a mapping with the local delta rule', () => {
  const b = new Brain({ ledger: 'off' });
  b.addCell({ id: 'n', kind: 'vec.mlp', region: 'r', params: { nin: 2, nhid: 8, nout: 1, lr: 0.1 }, policy: { period: 'event' } });
  const xor = [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]];
  let err = 1;
  for (let epoch = 0; epoch < 400; epoch++) for (const [x0, x1, y] of xor) {
    b.inject('n', 'x', { kind: 'vec', data: Float32Array.from([x0, x1]) });
    b.tick(1);
    b.inject('n', 'target', { kind: 'vec', data: Float32Array.from([y]) });
    b.tick(1);
    err = b.cell('n').state.err;
  }
  let correct = 0;
  for (const [x0, x1, y] of xor) { b.inject('n', 'x', { kind: 'vec', data: Float32Array.from([x0, x1]) }); b.tick(1); const out = b.takeOutbox().pop(); if ((out.data[0] > 0.5) === (y === 1)) correct++; }
  assert.equal(correct, 4, 'xor solved, last err ' + err);
});

test("brain: the outbox is a ring, unrouted signals beyond outboxRing are dropped and counted (soak 2026-09-17 grew it 47 per tick)", () => {
  const b = new Brain({ ledger: "off", outboxRing: 8 });
  b.addCell({ id: "src", kind: "source.counter", region: "r" });
  for (let i = 0; i < 20; i++) b.tick();
  assert.equal(b.stats.signals, 20, "one unrouted signal per tick");
  assert.equal(b.outbox.length, 8, "the ring holds outboxRing items");
  assert.equal(b.stats.outboxDropped, 12, "every drop is counted");
  const taken = b.takeOutbox();
  assert.equal(taken.length, 8);
  assert.equal(b.outbox.length, 0);
  assert.equal(b.stats.outboxDropped, 12, "taking does not count as dropping");
  const big = new Brain({ ledger: "off" });
  assert.equal(big.outboxRing, 4096, "default ring");
});


import { writeJSONStreamed } from '../core/persist.mjs';
import { readFileSync, existsSync } from 'node:fs';
test('persist: the streamed snapshot writer is byte-identical to JSON.stringify and atomic when a write fails', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'persist-'));
  const file = path.join(dir, 's.json');
  const obj = {
    a: 1,
    b: [1, 'x', null, { c: [1, 2, { d: undefined, e: NaN, f: Infinity }] }, undefined, () => 1],
    s: 'q"\n \t',
    n: { m: new Int8Array([1, -2]), u: undefined, t: new Date(0), g: () => 0 },
    big: Array.from({ length: 5000 }, (_, i) => ({ i, v: i / 7, w: [i, null] })),
    empty: {},
    none: [],
  };
  writeJSONStreamed(file, obj);
  assert.equal(readFileSync(file, 'utf8'), JSON.stringify(obj));
  const bad = { a: 1, get b() { throw new Error('boom'); } };
  assert.throws(() => writeJSONStreamed(file, bad), /boom/);
  assert.equal(readFileSync(file, 'utf8'), JSON.stringify(obj), 'the last good file is untouched');
  assert.ok(!existsSync(file + '.tmp'), 'no temp file left behind');
  rmSync(dir, { recursive: true, force: true });
});

import { readJSONStreamed } from '../core/persist.mjs';
import { writeFileSync } from 'node:fs';
test('persist: the streamed reader walks containers element by element and matches JSON.parse exactly', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'persist-read-'));
  const file = path.join(dir, 'big.json');
  const bs = String.fromCharCode(92), q = String.fromCharCode(34);
  // quotes, a backslash, every structural character and non-ASCII text inside strings
  const tricky = 'a' + q + 'b' + bs + 'c ]}{[ , : ' + String.fromCharCode(233, 8364) + String.fromCodePoint(128512) + ' ' + bs + q;
  const obj = {
    version: 1, name: tricky, n: -1.5e-7, t: true, f: false, z: null,
    cells: Array.from({ length: 300 }, (_, i) => ({ id: 'c' + i, s: tricky + i, m: [i, [i, [i]]], o: { k: { j: [] } }, e: {} })),
    mailboxes: Array.from({ length: 50 }, (_, i) => Array.from({ length: 20 }, (_, j) => ({ sig: { seq: i * 20 + j, data: [1, 2, 3], s: tricky } }))),
    empty: {}, none: [], deep: [[[[[{ a: [{ b: {} }] }]]]]],
  };
  writeJSONStreamed(file, obj);
  const expected = JSON.parse(readFileSync(file, 'utf8'));
  assert.deepEqual(readJSONStreamed(file, { limit: 8 }), expected, 'every container walked');
  assert.deepEqual(readJSONStreamed(file, { limit: 400 }), expected, 'small containers sliced, large ones walked');
  assert.deepEqual(readJSONStreamed(file, { limit: 400, chunk: 7 }), expected, 'a file read in 7 byte chunks parses the same (the reader has no 2 GiB limit)');
  assert.deepEqual(readJSONStreamed(file, { chunk: 1 }), expected, 'one byte at a time too');
  assert.deepEqual(readJSONStreamed(file), expected, 'the whole-file fast path');
  // a __proto__ key stays an own property, as it does under JSON.parse
  writeFileSync(file, '{"__proto__":{"p":1},"x":[1,2,3],"y":"' + 'a'.repeat(50) + '"}');
  const r = readJSONStreamed(file, { limit: 8 });
  assert.equal(Object.getPrototypeOf(r), Object.prototype);
  assert.deepEqual(Object.keys(r), ['__proto__', 'x', 'y']);
  assert.equal(r.x[2], 3);
  // trailing bytes after the document are an error, as under JSON.parse
  writeFileSync(file, '[1,2,3,[4,5,6,7,8,9,10,11,12]] x');
  assert.throws(() => readJSONStreamed(file, { limit: 4 }), SyntaxError);
  rmSync(dir, { recursive: true, force: true });
});

test('persist: a container too long for one string is walked at any depth, and the bytes still equal JSON.stringify', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'persist-walk-'));
  const file = path.join(dir, 'w.json');
  // the marker stands in for a 512 MB mailbox: any value that contains it throws the RangeError
  // V8 throws at the string cap, so the writer must walk down to it and stringify its members
  const marker = { boom: true, list: [1, 2, { x: 'y' }], s: 'q"', deeper: { more: [null, true] } };
  const obj = { top: 1, cells: [{ id: 'a', mailbox: [[marker, 2], [3]] }], mailboxes: [[[marker]]] };
  const orig = JSON.stringify;
  const expected = orig(obj);
  let thrown = 0;
  JSON.stringify = function (v, ...rest) {
    const s = orig.call(JSON, v, ...rest);
    if (typeof s === 'string' && s.includes('"boom":true')) { thrown++; throw new RangeError('Invalid string length'); }
    return s;
  };
  try {
    writeJSONStreamed(file, obj);
  } finally { JSON.stringify = orig; }
  assert.equal(readFileSync(file, 'utf8'), expected);
  // cells[0], its mailbox, [marker, 2], marker; then [[marker]], [marker], marker
  assert.equal(thrown, 7, 'every container holding the marker was refused whole and walked');
  // any other error from JSON.stringify still propagates and leaves no file behind
  const bad = { a: [[{ get b() { throw new TypeError('not a size problem'); } }]] };
  assert.throws(() => writeJSONStreamed(path.join(dir, 'x.json'), bad), TypeError);
  assert.ok(!existsSync(path.join(dir, 'x.json')) && !existsSync(path.join(dir, 'x.json.tmp')));
  rmSync(dir, { recursive: true, force: true });
});

import { statSync } from 'node:fs';
test('ledger: seq resumes from the last line, read off the file tail, however large the file', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'ledger-tail-'));
  const pad = JSON.stringify({ seq: 0, type: 'pad', text: 'x'.repeat(200) });
  const body = Array.from({ length: 2000 }, (_, i) => pad.replace('"seq":0', '"seq":' + i)).join('\n');
  const file = path.join(dir, 'ledger.jsonl');
  writeFileSync(file, body + '\n' + JSON.stringify({ seq: 2000, type: 'last' }) + '\n');
  assert.ok(statSync(file).size > (1 << 18), 'the file is larger than the tail window: ' + statSync(file).size);
  assert.equal(new Ledger({ dir }).seq, 2001);
  writeFileSync(file, body + '\n' + JSON.stringify({ seq: 7, type: 'last' })); // no newline at the end
  assert.equal(new Ledger({ dir }).seq, 8);
  writeFileSync(file, '');
  assert.equal(new Ledger({ dir }).seq, 0);
  rmSync(dir, { recursive: true, force: true });
});

test('item memory: the packed arena names what the scalar scan names, through sets, overwrites, deletes, a reload and a zero lane', () => {
  const rng = new RNG('itemmem');
  const flipSome = (v, rng, p) => { const o = Int8Array.from(v); for (let i = 0; i < o.length; i++) if ((rng.u32() % 1000) < p * 1000) o[i] = -o[i]; return o; };
  const m = new S.ItemMemory();
  const ref = new Map();
  const nearestRef = (v, k) => { const s = [...ref].map(([n, u]) => [n, S.scalar.sim(u, v)]); s.sort((a, b) => b[1] - a[1]); return k === 1 ? s[0] : s.slice(0, k); };
  // the same similarities in the same order; names compared where the similarity is unambiguous
  const same = (a, b) => {
    assert.deepEqual(a.map((x) => x[1]), b.map((x) => x[1]));
    const cut = a[a.length - 1][1];
    assert.deepEqual(a.filter((x) => x[1] > cut).map((x) => x[0]).sort(), b.filter((x) => x[1] > cut).map((x) => x[0]).sort());
  };
  for (let i = 0; i < 200; i++) { const v = S.hvRandom(rng, S.D); m.set('i' + i, v); ref.set('i' + i, v); }
  assert.ok(m.arena && m.arena.count === 200, 'the arena holds every item');
  for (let r = 0; r < 20; r++) {
    const target = 'i' + (rng.u32() % 200);
    const q = flipSome(ref.get(target), rng, 0.3);
    assert.deepEqual(m.nearest(q), nearestRef(q, 1));
    same(m.nearest(q, 3), nearestRef(q, 3));
  }
  // overwrite one, delete two (the last slot moves into the hole), then ask again
  const v2 = S.hvRandom(rng, S.D); m.set('i5', v2); ref.set('i5', v2);
  m.delete('i10'); ref.delete('i10');
  m.delete('i199'); ref.delete('i199');
  assert.equal(m.size, 198); assert.equal(m.arena.count, 198);
  assert.equal(m.has('i10'), false);
  for (const name of ['i5', 'i11', 'i198', 'i0']) assert.deepEqual(m.nearest(ref.get(name)), [name, 1]);
  const q2 = flipSome(ref.get('i42'), rng, 0.25);
  same(m.nearest(q2, 4), nearestRef(q2, 4));
  // serialize and reload: the arena is rebuilt and answers the same
  const m2 = S.ItemMemory.from(m.serialize());
  assert.equal(m2.arena.count, 198);
  assert.deepEqual(m2.nearest(q2), nearestRef(q2, 1));
  same(m2.nearest(q2, 4), nearestRef(q2, 4));
  // get() of an unknown name seeds it and adds it to the arena
  m2.get('fresh'); assert.equal(m2.arena.count, 199); assert.deepEqual(m2.nearest(S.hvFromSeed('fresh')), ['fresh', 1]);
  // an item with a zero lane cannot pack: the arena turns off and the answers do not change
  const z = S.hvRandom(rng, S.D); z[3] = 0; m.set('zero', z); ref.set('zero', z);
  assert.equal(m.packed, false); assert.equal(m.arena, null);
  same(m.nearest(q2, 3), nearestRef(q2, 3));
  assert.deepEqual(m.nearest(z), ['zero', S.scalar.sim(z, z)]);
  assert.deepEqual(m.nearest(ref.get('i11')), ['i11', 1]);
  // an empty memory answers null, or an empty list
  const e = new S.ItemMemory(); assert.equal(e.nearest(q2), null); assert.deepEqual(e.nearest(q2, 2), []);
});

test('signal: a bipolar hv goes on the wire as one bit per lane, a zero lane keeps the Int8 form, old strings still read', () => {
  const v = new Int8Array(8192);
  for (let i = 0; i < 8192; i++) v[i] = (Math.imul(i + 1, 2654435761) >>> 13) & 1 ? 1 : -1;
  const s = S.dataToJSON('hv', v);
  assert.ok(s.startsWith('b8192:'), 'marked as packed');
  assert.equal(s.length, 1374, 'packed: 6 marker characters plus 1368 of base64, where Int8 was 10924');
  assert.deepEqual(S.dataFromJSON('hv', s), v);
  const z = v.slice(); z[7] = 0;
  const s2 = S.dataToJSON('hv', z);
  assert.equal(s2.length, 10924, 'a zero lane cannot pack, so the Int8 form stays');
  assert.deepEqual(S.dataFromJSON('hv', s2), z);
  const old = Buffer.from(v.buffer, v.byteOffset, v.byteLength).toString('base64');
  assert.deepEqual(S.dataFromJSON('hv', old), v, 'a snapshot written before the packed form reads unchanged');
  const odd = new Int8Array(13).fill(1); odd[3] = -1; odd[12] = -1;
  assert.deepEqual(S.dataFromJSON('hv', S.dataToJSON('hv', odd)), odd, 'a lane count that is not a multiple of 8');
  assert.throws(() => S.unpackHV('b16:AA=='), /packed hv/, 'a byte count that does not match the lane count is refused');
});

// ---------------------------------------------------------------- the five lab requests
// notes/lab.md requests 1 to 5, answered in core and tested here: a registrable proposal
// kind with its own policy, the co-activation counters and the ledger seq in the snapshot,
// and a scheduler tie-break that is the cell id instead of the registration order.
test('gate: a kind can be registered with its own policy, and the nine built in kinds stay frozen', () => {
  const l = new Ledger({ ring: 256 });
  const g = new Gate({ ledger: l, policy: makePolicy() });
  assert.equal(PROPOSAL_KINDS.length, 9);
  assert.throws(() => PROPOSAL_KINDS.push('test.sneak'), TypeError, 'the built in list is frozen');
  assert.throws(() => g.propose({ kind: 'test.unknown', what: {} }), /unknown proposal kind/);

  // a registered kind with no policy holds: a kind nobody judges waits for a human
  registerProposalKind('test.held');
  assert.equal(policyFor('test.held'), null);
  const held = g.propose({ kind: 'test.held', what: {} });
  assert.equal(held.status, 'pending');
  assert.equal(g.listPending().length, 1);

  // a registered policy decides, and it is handed the whole proposal
  let sawEvidence = null, sawKind = null;
  registerPolicy('test.judged', (p) => { sawEvidence = p.evidence.n; sawKind = p.kind; return p.evidence.n > 2 ? 'approve' : 'reject'; });
  assert.equal(g.propose({ kind: 'test.judged', what: {}, evidence: { n: 3 } }).status, 'approved');
  assert.equal(sawEvidence, 3);
  assert.equal(sawKind, 'test.judged');
  assert.equal(g.propose({ kind: 'test.judged', what: {}, evidence: { n: 1 } }).status, 'rejected');

  // the ledger line carries the kind's slim view; the proposal itself keeps all the evidence
  registerProposalKind('test.slim', { policy: () => 'approve', slim: (ev) => ({ n: ev.n }) });
  const big = g.propose({ kind: 'test.slim', what: {}, evidence: { n: 7, whole: 'x'.repeat(64) } });
  assert.equal(big.evidence.whole.length, 64);
  assert.deepEqual(l.recent(256, 'proposal').find((e) => e.kind === 'test.slim').evidence, { n: 7 });

  // one id space, one statistics block, the same two events per decision
  assert.deepEqual([held.id, big.id], [1, 4]);
  assert.equal(g.stats.proposed, 4);
  assert.equal(g.stats.held, 1);
  assert.equal(l.recent(256, 'decision').length, 3);

  // the nine cannot be re-registered, re-judged, or changed
  assert.throws(() => registerProposalKind('edge.grow'), /built in kind/);
  assert.throws(() => registerPolicy('edge.grow', () => 'approve'), /built in kind/);
  assert.throws(() => registerProposalKind(''), /non empty string/);
  assert.throws(() => registerProposalKind('test.bad', { policy: 'yes' }), /must be a function/);
  assert.equal(knownKind('edge.grow'), true);
  assert.equal(knownKind('test.judged'), true);
  assert.equal(knownKind('test.never'), false);
  assert.ok(registeredKinds().includes('test.judged') && !registeredKinds().includes('edge.grow'));
  assert.equal(g.propose({ kind: 'edge.grow', what: {}, evidence: { coActivations: 9 } }).status, 'approved');
  assert.equal(g.propose({ kind: 'edge.grow', what: {}, evidence: { coActivations: 1 } }).status, 'rejected');
  assert.equal(g.propose({ kind: 'external.action', what: {} }).status, 'pending');
  assert.equal(g.propose({ kind: 'cell.add', what: {}, evidence: {} }).status, 'pending');
});

test('brain: the snapshot carries the co-activation counters and the ledger seq, and a version 1 snapshot still restores', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'brain-snap-'));
  try {
    const dir = path.join(root, 'live');
    const opts = { growth: { threshold: 8 }, gate: { growThreshold: 8 }, pruneEvery: 0 };
    const b = new Brain({ name: 'grow', seed: 'grow', dir, ledger: 'full', ...opts });
    b.addCell({ id: 'a', kind: 'source.counter', region: 'r' });
    b.addCell({ id: 'c', kind: 'source.counter', region: 'r' });
    b.addCell({ id: 'p', kind: 'predict.next', region: 'r', policy: { period: 'event' } });
    b.connect('c', 'out', 'p', 'observe');
    b.tick(5);
    const pending = [...b.coact.counts.entries()].sort((x, y) => x[0] - y[0]);
    assert.ok(pending.length > 0 && pending.every(([, n]) => n > 0 && n < 8), 'part way to the threshold: ' + JSON.stringify(pending));
    const seqAt = b.ledger.seq, tAt = b.clock.t, grownAt = b.stats.grown;
    const file = b.snapshot(dir);

    const j = JSON.parse(readFileSync(file, 'utf8'));
    // format 3 (the blob table in core/persist.mjs) has been the writer default since 2026-09-18; the
    // sections below are read off the raw document, so this also checks they are not blob references
    assert.equal(j.version, 3);
    assert.equal(j.coact.n, pending.length);
    assert.equal(j.ledger.seq, seqAt);

    // the counters come back pair for pair, and the ledger continues where it left off:
    // the restore event takes the seq the snapshot event took, so no seq is spent twice
    const r = Brain.restore(dir, { dir: null, ledger: 'full', ...opts });
    assert.deepEqual([...r.coact.counts.entries()].sort((x, y) => x[0] - y[0]), pending);
    assert.equal(r.ledger.seq, seqAt + 1);
    assert.equal(r.clock.t, tAt);
    // and the restored brain therefore crosses the growth threshold where the original did
    r.tick(20); b.tick(20);
    assert.equal(b.stats.grown > grownAt, true, 'the original grew an edge inside the window');
    assert.equal(r.stats.grown, b.stats.grown);
    assert.equal(r.connectome.size(), b.connectome.size());
    assert.equal(r.coact.counts.size, b.coact.counts.size);

    // a snapshot written before these two sections existed restores exactly as it always did
    const old = path.join(root, 'old');
    mkdirSync(old, { recursive: true });
    const j1 = JSON.parse(readFileSync(file, 'utf8'));
    delete j1.coact; delete j1.ledger; j1.version = 1;
    writeFileSync(path.join(old, 'snapshot.json'), JSON.stringify(j1));
    const o = Brain.restore(old, { dir: null, ledger: 'off', ...opts });
    assert.equal(o.coact.counts.size, 0, 'no counters in the file, so none are invented');
    assert.equal(o.ledger.seq, 0, 'no seq in the file, so the ledger starts where a new one does');
    assert.equal(o.cells.length, b.cells.length);
    assert.equal(o.clock.t, tAt);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('scheduler: equal bids are funded by cell id, whatever order the cells were registered in', () => {
  const ids = Array.from({ length: 8 }, (_, i) => 'c' + i);
  const fundedIn = (order, ticks = 12) => {
    const b = new Brain({ ledger: 'off', growth: { enabled: false }, pruneEvery: 0 });
    b.addRegion('r', { budget: 1 });
    for (const id of order) b.addCell({ id, kind: 'source.counter', region: 'r' });
    const seen = [];
    for (let t = 0; t < ticks; t++) { b.tick(1); seen.push(b.lastFired.map((i) => b.cells[i].id)); }
    return seen;
  };
  const base = fundedIn(ids);
  assert.deepEqual(base[0], ['c0'], 'one cell per tick, and it is the lowest id');
  assert.deepEqual([...new Set(base.flat())], ['c0'], 'equal bids: the same cell every tick');
  for (const order of [[...ids].reverse(), new RNG('shuffle:1').shuffle([...ids]), new RNG('shuffle:2').shuffle([...ids])]) {
    assert.notDeepEqual(order, ids, 'a different registration order');
    assert.deepEqual(fundedIn(order), base, 'registered as ' + order.join(',') + ' and funded identically');
  }
  // the tie-break never outranks the bid: a later id with a higher priority still wins
  const b = new Brain({ ledger: 'off', growth: { enabled: false }, pruneEvery: 0 });
  b.addRegion('r', { budget: 1 });
  b.addCell({ id: 'a.low', kind: 'source.counter', region: 'r', policy: { priority: 1 } });
  b.addCell({ id: 'z.high', kind: 'source.counter', region: 'r', policy: { priority: 4 } });
  b.tick(4);
  assert.equal(b.cell('z.high').stats.runs, 4);
  assert.equal(b.cell('a.low').stats.runs, 0);
  assert.equal(Scheduler.byId(b.cell('a.low'), b.cell('z.high')), -1);
  assert.equal(Scheduler.byId(b.cell('z.high'), b.cell('a.low')), 1);
  assert.equal(Scheduler.byId(b.cell('a.low'), b.cell('a.low')), 0);
});

test('vec width boundary: integrate holds unobserved dimensions, vecMean averages per dimension, predict extrapolates only shared dimensions, and none of them makes a NaN', () => {
  const fin = (v) => Array.from(v).every(Number.isFinite);
  // a 4 wide accumulator meets a 1 wide sample: dimension 0 moves, the rest hold
  const acc = P.integrate('vec', Float32Array.from([2, 4, 6, 8]), Float32Array.from([10]), 2);
  assert.equal(acc.length, 4); assert.ok(fin(acc));
  assert.equal(acc[0], 6); assert.equal(acc[1], 4); assert.equal(acc[3], 8);
  // a 1 wide accumulator meets a 3 wide sample: the new dimensions take the sample as their first value
  const grown = P.integrate('vec', Float32Array.from([1]), Float32Array.from([5, 7, 9]), 2);
  assert.deepEqual(Array.from(grown), [3, 7, 9]);
  // a mean over widths 1, 2 and 3: each dimension over the vectors that carry it
  const m = S.vecMean([Float32Array.from([1]), Float32Array.from([3, 5]), Float32Array.from([5, 7, 9])]);
  assert.deepEqual(Array.from(m), [3, 6, 9]); assert.ok(fin(m));
  // prev narrower than last, observed narrower than the prediction
  const pr = P.predict('vec', [Float32Array.from([1]), Float32Array.from([2, 4])], Float32Array.from([3]));
  assert.deepEqual(Array.from(pr.prediction), [3, 4]);
  assert.ok(Number.isFinite(pr.error)); assert.equal(pr.error, 0);
});
