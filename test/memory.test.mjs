// test/memory.test.mjs. The six memory tiers, the cells that carry them, and the two
// numbers this subsystem has to earn: how fast retrieval stays at 100k episodes, and how
// often a sequence comes back from a cue. Both are printed by the tests that measure them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RNG } from '../core/rng.mjs';
import * as S from '../core/signal.mjs';
import * as SIMD from '../core/simd.mjs';
import { Brain } from '../core/brain.mjs';
import { MIN } from '../core/clock.mjs';
import '../cells/basic.mjs';
import '../cells/memory.mjs';
import { WorkingMemory, WorkingSet } from '../memory/working.mjs';
import { EpisodicStore, popcount32 } from '../memory/episodic.mjs';
import { SemanticMemory } from '../memory/semantic.mjs';
import { SkillStore, captureSkill } from '../memory/procedural.mjs';
import { SequenceMemory } from '../memory/sequence.mjs';
import { SelfMemory } from '../memory/self.mjs';
import { MemorySystem, createMemorySystem, attachMemory, getMemorySystem, unregisterMemorySystem } from '../memory/index.mjs';

// 32 bits of randomness per call instead of one, which is what makes a 100k episode
// fixture cheap enough to build inside a test.
function fastHv(rng, d) {
  const v = new Int8Array(d);
  for (let i = 0; i < d;) {
    let r = rng.u32();
    for (let b = 0; b < 32 && i < d; b++, i++) { v[i] = (r & 1) ? 1 : -1; r >>>= 1; }
  }
  return v;
}
function flip(hv, rng, frac) {
  const out = Int8Array.from(hv);
  for (let i = 0; i < out.length; i++) if (rng.next() < frac) out[i] = -out[i];
  return out;
}
const roundTrip = (o) => JSON.parse(JSON.stringify(o));

// ---------------------------------------------------------------- working
test('working memory: a bounded ring per circuit, salience decays, sweeping removes the stale', () => {
  const w = new WorkingMemory({ key: 'perception/text', capacity: 4, tau: 100, floor: 0.2 });
  for (let i = 0; i < 6; i++) w.push({ t: i, kind: 'event', data: { i }, salience: 1 });
  assert.equal(w.size(), 4, 'capacity holds');
  assert.equal(w.entries[0].data.i, 2, 'the oldest two were evicted');
  assert.equal(w.stats.evicted, 2);

  // decay: at one tau the salience is 1/e, at three tau it is under the 0.2 floor
  const e = w.entries[3];
  assert.ok(Math.abs(w.salienceAt(e, e.t + 100) - Math.exp(-1)) < 1e-9);
  assert.equal(w.sweep(5), 0, 'nothing is stale yet');
  assert.equal(w.sweep(5 + 300), 4, 'everything has decayed under the floor');
  assert.equal(w.size(), 0);

  // most salient first, and a fresher low salience entry can outrank an old strong one
  const w2 = new WorkingMemory({ capacity: 8, tau: 50, floor: 0 });
  w2.push({ t: 0, kind: 'event', data: { name: 'old' }, salience: 4 });
  w2.push({ t: 190, kind: 'event', data: { name: 'new' }, salience: 1 });
  const top = w2.top(200, 2);
  assert.equal(top[0].data.name, 'new');
  assert.ok(top[0].salience > top[1].salience);

  // weakest first eviction keeps the strong entry instead of the old one
  const w3 = new WorkingMemory({ capacity: 2, tau: 1e9, floor: 0, evict: 'weakest' });
  w3.push({ t: 0, kind: 'event', data: { name: 'strong' }, salience: 9 });
  w3.push({ t: 1, kind: 'event', data: { name: 'weak' }, salience: 0.1 });
  w3.push({ t: 2, kind: 'event', data: { name: 'mid' }, salience: 1 });
  assert.deepEqual(w3.all(2).map(x => x.data.name), ['strong', 'mid']);

  // a set of rings, one per circuit, serialized together
  const set = new WorkingSet({ capacity: 3, tau: 200, floor: 0.01 });
  set.of('a/x').push({ t: 1, kind: 'hv', data: S.hvFromSeed('cat'), salience: 1 });
  set.of('b/y').push({ t: 1, kind: 'event', data: { k: 1 }, salience: 0.5 });
  assert.deepEqual(set.keys().sort(), ['a/x', 'b/y']);
  assert.equal(set.size(), 2);
  const back = WorkingSet.from(roundTrip(set.serialize()));
  assert.deepEqual(back.keys().sort(), ['a/x', 'b/y']);
  assert.equal(S.sim(back.of('a/x').last().data, S.hvFromSeed('cat')), 1, 'the hv survived JSON');
  assert.equal(back.of('b/y').last().data.k, 1);
  assert.equal(back.of('a/x').capacity, 3);
});

// ---------------------------------------------------------------- episodic
test('episodic memory: append only, retrieval by similarity and by time range, cold episodes leave retrieval', () => {
  const rng = new RNG('episodic-test');
  const d = 1024;
  const ep = new EpisodicStore({ d, seed: 'ep-test' });
  const keys = [];
  for (let i = 0; i < 400; i++) {
    const k = fastHv(rng, d);
    keys.push(k);
    ep.append({ key: k, value: { i }, items: ['item' + (i % 7)], t: i * 10, gen: i });
  }
  assert.equal(ep.size(), 400);

  // a noisy version of a stored key comes back first, through the index and through the scan
  const q = flip(keys[321], rng, 0.12);
  const viaIndex = ep.retrieve(q, { k: 3 });
  const viaScan = ep.retrieve(q, { k: 3, scan: true });
  assert.equal(viaIndex[0].value.i, 321);
  assert.equal(viaScan[0].value.i, 321);
  assert.equal(viaIndex[0].t, 3210);
  assert.equal(viaIndex[0].gen, 321);
  assert.ok(viaIndex[0].sim > 0.7, 'sim to the stored key is ' + viaIndex[0].sim.toFixed(3));
  assert.equal(viaIndex.length, 3);
  assert.ok(viaIndex[0].sim > viaIndex[1].sim, 'best first');

  // an unrelated query finds nothing above a real threshold
  assert.equal(ep.retrieve(fastHv(rng, d), { k: 1, minSim: 0.3 }).length, 0);

  // time range: two binary searches while the times arrive in order
  assert.equal(ep.timesSorted, true);
  const win = ep.between(1000, 1090);
  assert.deepEqual(win.map(r => r.id), [100, 101, 102, 103, 104, 105, 106, 107, 108, 109]);
  assert.equal(ep.between(0, 5, { limit: 1 }).length, 1);
  assert.deepEqual(ep.idsInRange(3990, 4010), [399]);

  // a query restricted to a time window only sees that window
  const inWindow = ep.retrieve(q, { k: 1, from: 0, to: 1000 });
  assert.notEqual(inWindow[0].value.i, 321, 'episode 321 is outside the window');
  assert.ok(inWindow[0].t <= 1000);

  // an out of order append flips the flag and the range query falls back to a scan
  ep.append({ key: fastHv(rng, d), value: { i: 'late' }, items: [], t: 5 });
  assert.equal(ep.timesSorted, false);
  assert.equal(ep.between(0, 5).length, 2);

  // item index: items cycle with period 7 over 400 episodes, so item3 lands on 57 of them
  assert.equal(ep.byItem('item3').length, 57);
  assert.ok(ep.byItem('item3').every(id => ep.itemsOf(id).includes('item3')));
  assert.equal(ep.byItem('never-stored').length, 0);

  // forgetting without deleting: cold episodes stay on the record but leave retrieval
  const cooled = ep.cool(3210);
  assert.equal(cooled, 322, 'episodes before t=3210 went cold, ' + cooled + ' of them');
  assert.equal(ep.size(), 401, 'nothing was deleted');
  assert.equal(ep.retrieve(flip(keys[100], rng, 0.05), { k: 1, minSim: 0.3 }).length, 0, 'a cold episode is not retrieved');
  assert.equal(ep.retrieve(flip(keys[100], rng, 0.05), { k: 1, minSim: 0.3, includeCold: true })[0].value.i, 100);
  assert.equal(ep.warm(100), true);
  assert.equal(ep.retrieve(flip(keys[100], rng, 0.05), { k: 1, minSim: 0.3 })[0].value.i, 100);

  // serialize and restore, index rebuilt from the seed
  const back = EpisodicStore.from(roundTrip(ep.serialize()));
  assert.equal(back.size(), ep.size());
  assert.equal(back.retrieve(q, { k: 1 })[0].value.i, 321);
  assert.equal(S.sim(back.keyAt(321), keys[321]), 1);
  assert.equal(back.describe().cold, ep.describe().cold);
  assert.equal(back.episode(7).items[0], 'item0');

  assert.equal(popcount32(0), 0);
  assert.equal(popcount32(0xffffffff), 32);
  assert.equal(popcount32(0b1011), 3);
});

test('episodic memory: the index stays fast at 100k episodes', () => {
  const d = 512, N = 100_000, QUERIES = 200, SCANS = 20, NOISE = 0.10;
  const rng = new RNG('episodic-scale');
  const ep = new EpisodicStore({ d, seed: 'scale', maxEpisodes: N * 2 });
  const t0 = performance.now();
  for (let i = 0; i < N; i++) ep.append({ key: fastHv(rng, d), value: { i }, t: i });
  const buildMs = performance.now() - t0;
  assert.equal(ep.size(), N);

  const qrng = new RNG('episodic-scale-q');
  const targets = [], queries = [];
  for (let i = 0; i < QUERIES; i++) {
    const id = qrng.int(N);
    targets.push(id);
    queries.push(flip(ep.keyAt(id), qrng, NOISE));
  }

  let hits = 0;
  const t1 = performance.now();
  for (let i = 0; i < QUERIES; i++) {
    const r = ep.retrieve(queries[i], { k: 1 });
    if (r.length && r[0].id === targets[i]) hits++;
  }
  const indexMs = (performance.now() - t1) / QUERIES;

  let scanHits = 0;
  const t2 = performance.now();
  for (let i = 0; i < SCANS; i++) {
    const r = ep.retrieve(queries[i], { k: 1, scan: true });
    if (r.length && r[0].id === targets[i]) scanHits++;
  }
  const scanMs = (performance.now() - t2) / SCANS;

  const t3 = performance.now();
  const window = ep.between(50_000, 50_099);
  const rangeMs = performance.now() - t3;

  const info = ep.describe();
  console.log('  episodic at ' + N + ' episodes, d=' + d);
  console.log('    build            ' + buildMs.toFixed(1) + ' ms (' + (N / buildMs).toFixed(0) + ' episodes/ms)');
  console.log('    index query      ' + indexMs.toFixed(3) + ' ms mean over ' + QUERIES + ' queries, top1 ' + hits + '/' + QUERIES);
  console.log('    exact full scan  ' + scanMs.toFixed(3) + ' ms mean over ' + SCANS + ' queries, top1 ' + scanHits + '/' + SCANS);
  console.log('    speedup          ' + (scanMs / indexMs).toFixed(1) + 'x');
  console.log('    time range       ' + rangeMs.toFixed(3) + ' ms for ' + window.length + ' rows');
  console.log('    candidates/query ' + (info.stats.candidates / info.stats.queries).toFixed(0) + ', rescored ' + (info.stats.rescored / info.stats.queries).toFixed(0));
  console.log('    buckets          ' + info.buckets + ' over ' + info.bands + ' bands of ' + info.bandBits + ' bits');

  assert.equal(scanHits, SCANS, 'the exact scan is the ground truth');
  assert.ok(hits >= QUERIES * 0.95, 'index top1 was ' + hits + '/' + QUERIES);
  assert.ok(indexMs * 5 < scanMs, 'index ' + indexMs.toFixed(3) + ' ms vs scan ' + scanMs.toFixed(3) + ' ms');
  assert.equal(window.length, 100);
  assert.ok(rangeMs < 5, 'time range took ' + rangeMs.toFixed(3) + ' ms');
});

// ---------------------------------------------------------------- semantic
test('semantic memory: iterative cleanup pulls a noisy cue onto the stored concept', () => {
  const d = 2048;
  const sem = new SemanticMemory({ d, beta: 12, maxIters: 8 });
  const names = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew'];
  for (const n of names) sem.learn(n, sem.items.get(n), { strength: 1 });
  assert.equal(sem.size(), 8);
  assert.equal(sem.has('fig'), true);
  assert.equal(sem.strengthOf('fig'), 1);

  const rng = new RNG('semantic-cleanup');
  const rows = [];
  for (const noise of [0.05, 0.15, 0.25, 0.35]) {
    let ok = 0, iters = 0, cue = 0;
    for (let trial = 0; trial < 20; trial++) {
      const name = names[trial % names.length];
      const q = flip(sem.concept(name), rng, noise);
      cue += S.sim(q, sem.concept(name));
      const r = sem.recognize(q);
      iters += r.iterations;
      if (r.name === name) ok++;
    }
    rows.push({ noise, ok, iters: iters / 20, cue: cue / 20 });
  }
  console.log('  semantic cleanup, d=' + d + ', 8 concepts, 20 trials per row');
  for (const r of rows) {
    console.log('    ' + (r.noise * 100).toFixed(0).padStart(2) + '% flipped, cue sim ' + r.cue.toFixed(3) + ' -> correct ' + r.ok + '/20, mean iterations ' + r.iters.toFixed(2));
  }
  assert.equal(rows[0].ok, 20, 'a lightly corrupted cue always cleans up');
  assert.equal(rows[1].ok, 20);
  assert.ok(rows[2].ok >= 18, 'at 25% flipped it recovered ' + rows[2].ok + '/20');
  assert.ok(rows.some(r => r.iters > 1), 'cleanup really iterates, it is not a single lookup');

  // the converged state is the stored pattern itself, not a mixture
  const q = flip(sem.concept('cherry'), rng, 0.2);
  const r = sem.recognize(q);
  assert.equal(r.converged, true);
  assert.equal(S.sim(r.hv, sem.concept('cherry')), 1, 'it landed exactly on the attractor');
  assert.ok(r.cueSim < 1 && r.cueSim > 0.3, 'the cue itself was corrupted, sim ' + r.cueSim.toFixed(3));

  // one step is a soft lookup, the iteration is what makes it hard
  const oneStep = sem.cleanup(q, { maxIters: 1 });
  assert.equal(oneStep.iterations, 1);

  // merging a named concept sharpens it rather than adding a second entry
  const before = sem.size();
  sem.learn('apple', flip(sem.concept('apple'), rng, 0.3), { strength: 3 });
  assert.equal(sem.size(), before, 'no new slot');
  assert.equal(sem.strengthOf('apple'), 4);
  assert.equal(sem.recognize(sem.items.get('apple')).name, 'apple');

  const back = SemanticMemory.from(roundTrip(sem.serialize()));
  assert.equal(back.size(), sem.size());
  assert.equal(back.recognize(flip(back.concept('date'), rng, 0.2)).name, 'date');
  assert.equal(back.strengthOf('apple'), 4);
});

test('semantic memory: consolidation forms a concept from repeated episodes', () => {
  const d = 2048;
  const sys = new MemorySystem({ name: 'consolidation-test', d, semantic: { beta: 12 } });
  const im = sys.semantic.items;
  const encode = (items) => S.bundle(items.map(i => im.get(i)));

  let t = 0;
  const REPEATS = 12;
  for (let i = 0; i < REPEATS; i++) sys.episodic.append({ key: encode(['thunder', 'lightning']), value: { storm: i }, items: ['thunder', 'lightning'], t: t++ });
  for (let i = 0; i < REPEATS; i++) sys.episodic.append({ key: encode(['coffee', 'morning']), value: { wake: i }, items: ['coffee', 'morning'], t: t++ });
  for (let i = 0; i < 10; i++) sys.episodic.append({ key: encode(['oneoff' + i]), value: { noise: i }, items: ['oneoff' + i], t: t++ });
  assert.equal(sys.semantic.size(), 0, 'nothing is a concept before consolidation');

  const r = sys.consolidate({ minCount: 5 });
  console.log('  consolidation: scanned ' + r.scanned + ' episodes, formed ' + r.formed.length + ' co-occurrence concepts, ' + r.solo.length + ' item concepts');
  for (const f of r.formed) console.log('    ' + f.name + ' from ' + f.count + ' episodes');

  assert.equal(r.scanned, REPEATS * 2 + 10);
  assert.deepEqual(r.formed.map(f => f.name).sort(), ['coffee+morning', 'lightning+thunder']);
  assert.equal(r.formed.find(f => f.name === 'lightning+thunder').count, REPEATS);
  assert.equal(sys.semantic.strengthOf('lightning+thunder'), REPEATS);

  // the concept is what a fresh co-occurrence of the two items now cleans up to
  const rec = sys.semantic.recognize(encode(['thunder', 'lightning']));
  assert.equal(rec.name, 'lightning+thunder');
  assert.equal(rec.converged, true);
  // and either item on its own still cleans up to itself
  assert.equal(sys.semantic.recognize(im.get('coffee')).name, 'coffee');
  // a pair that never repeated enough did not become a concept
  assert.equal(sys.semantic.has('coffee+thunder'), false);

  // a second pass over the same episodes reinforces rather than duplicating
  const size = sys.semantic.size();
  sys.consolidate({ minCount: 5 });
  assert.equal(sys.semantic.size(), size, 'no duplicate concepts');
  assert.equal(sys.semantic.strengthOf('lightning+thunder'), REPEATS * 2);
  assert.equal(sys.stats.consolidations, 2);
});

test('semantic memory: weak items decay and are forgotten, strong concepts survive', () => {
  const d = 1024;
  const sys = new MemorySystem({ name: 'forgetting-test', d });
  const im = sys.semantic.items;
  const encode = (items) => S.bundle(items.map(i => im.get(i)));
  let t = 0;
  for (let i = 0; i < 12; i++) sys.episodic.append({ key: encode(['salt', 'pepper']), value: null, items: ['salt', 'pepper'], t: t++ });
  for (let i = 0; i < 10; i++) sys.episodic.append({ key: encode(['seen-once-' + i]), value: null, items: ['seen-once-' + i], t: t++ });
  sys.consolidate({ minCount: 5 });
  const before = sys.semantic.size();
  assert.equal(before, 13, 'one pair concept, two strong items, ten one off items');

  const r = sys.forget({ now: t, rate: 0.5, floor: 1, horizon: 5 });
  console.log('  forgetting: ' + r.forgotten.length + ' of ' + before + ' concepts fell under the floor, ' + r.cooled + ' episodes went cold');
  assert.equal(r.forgotten.length, 10, 'exactly the ten items seen once');
  assert.ok(r.forgotten.every(n => n.startsWith('seen-once-')));
  assert.equal(sys.semantic.size(), 3);
  assert.equal(sys.semantic.strengthOf('pepper+salt'), 6, 'strength halved but well above the floor');
  assert.equal(sys.semantic.recognize(encode(['salt', 'pepper'])).name, 'pepper+salt');
  assert.ok(r.cooled > 0, 'episodes past the horizon went cold');
  assert.equal(sys.episodic.size(), 22, 'episodic is append only, nothing was deleted');

  // an unused skill is only dropped when the pass is told to
  sys.procedural.define('unused', { cells: [{ id: 'c', kind: 'source.counter' }], edges: [] });
  assert.deepEqual(sys.forget({ now: t, rate: 1, floor: 0 }).skills, []);
  assert.deepEqual(sys.forget({ now: t, rate: 1, floor: 0, dropSkills: true }).skills, ['unused']);
  assert.equal(sys.procedural.size(), 0);
});

// ---------------------------------------------------------------- procedural
test('procedural memory: a captured sub circuit survives JSON and runs when instantiated twice', () => {
  // build the skill once, inside a brain, then take it out
  const source = new Brain({ name: 'skill-source', ledger: 'off' });
  source.addCell({ id: 'sq.mul', kind: 'num.arith', region: 'cognitive', circuit: 'skill', params: { op: '*' }, policy: { period: 'event' } });
  source.addCell({ id: 'sq.gate', kind: 'evaluate.threshold', region: 'cognitive', circuit: 'skill', params: { threshold: 50, direction: 'above' }, policy: { period: 'event' } });
  source.addCell({ id: 'outside', kind: 'sink.log', region: 'motor', circuit: 'act', policy: { period: 'event' } });
  source.connect('sq.mul', 'out', 'sq.gate', 'in');
  source.connect('sq.gate', 'out', 'outside', 'in');

  const skill = captureSkill(source, ['sq.mul', 'sq.gate'], { name: 'square-over-50', doc: 'multiply, then ask whether the product clears 50' });
  assert.equal(skill.cells.length, 2);
  assert.equal(skill.edges.length, 1, 'the edge leaving the selection was not captured');
  assert.deepEqual(skill.edges[0], { src: 'sq.mul', dst: 'sq.gate', srcPort: 0, dstPort: 0, w: 1, delay: 0, conf: 0.5 });
  assert.equal(skill.cells[0].params.op, '*');

  // through the store and through JSON
  const store = new SkillStore();
  store.define(skill.name, skill);
  assert.deepEqual(store.list(), ['square-over-50']);
  const restored = SkillStore.from(roundTrip(store.serialize()));
  assert.deepEqual(restored.list(), ['square-over-50']);

  // instantiate twice into a brain that has never seen these cells
  const target = new Brain({ name: 'skill-target', ledger: 'off' });
  const a = restored.instantiate('square-over-50', target, { prefix: 'k1.' });
  const b = restored.instantiate('square-over-50', target, { prefix: 'k2.' });
  assert.deepEqual(a.cells, ['k1.sq.mul', 'k1.sq.gate']);
  assert.deepEqual(b.cells, ['k2.sq.mul', 'k2.sq.gate']);
  assert.equal(target.cells.length, 4);
  assert.equal(target.connectome.live(), 2);
  assert.equal(restored.get('square-over-50').meta.uses, 2);
  assert.equal(restored.stats.instantiated, 2);

  target.inject('k1.sq.mul', 'a', { kind: 'num', data: S.int(9) });
  target.inject('k1.sq.mul', 'b', { kind: 'num', data: S.int(9) });
  target.inject('k2.sq.mul', 'a', { kind: 'num', data: S.int(2) });
  target.inject('k2.sq.mul', 'b', { kind: 'num', data: S.int(3) });
  target.tick(4);
  const out = target.takeOutbox().map(s => ({ cell: target.cells[s.src].id, ...s.data }));
  const k1 = out.find(o => o.cell === 'k1.sq.gate');
  const k2 = out.find(o => o.cell === 'k2.sq.gate');
  assert.deepEqual({ value: k1.value, pass: k1.pass }, { value: 81, pass: true });
  assert.deepEqual({ value: k2.value, pass: k2.pass }, { value: 6, pass: false });

  // outcomes are filed against the skill and rank it
  restored.record('square-over-50', { score: 1 });
  restored.record('square-over-50', { score: 0 });
  assert.equal(restored.get('square-over-50').meta.runs, 2);
  assert.equal(restored.get('square-over-50').meta.score, 0.5);
  restored.define('never-run', { cells: [{ id: 'c', kind: 'source.counter' }], edges: [] });
  assert.deepEqual(restored.ranked().map(r => r.name), ['square-over-50', 'never-run']);

  // a skill that cannot survive JSON is refused at definition time, not at use
  assert.throws(
    () => store.define('bad', { cells: [{ id: 'c', kind: 'source.const', params: { fn: () => 1 } }], edges: [] }),
    /not JSON safe/,
  );
  assert.throws(() => store.define('dangling', { cells: [{ id: 'c', kind: 'source.counter' }], edges: [{ src: 'c', dst: 'nope' }] }), /unknown dst/);
  assert.throws(() => restored.instantiate('missing', target), /no skill named missing/);
});

// ---------------------------------------------------------------- sequence
test('sequence memory: 100 sequences recalled from a three item cue', () => {
  const SEQUENCES = 100, LENGTH = 6, CUE = 3, VOCAB = 60;
  const sm = new SequenceMemory({ d: S.D });
  const vocab = [];
  for (let i = 0; i < VOCAB; i++) vocab.push('w' + i);
  const rng = new RNG('sequence-recall');

  const stored = [];
  for (let i = 0; i < SEQUENCES; i++) {
    const pool = rng.shuffle([...vocab]);
    const items = pool.slice(0, LENGTH);
    stored.push(items);
    sm.store('seq' + i, items);
  }
  assert.equal(sm.size(), SEQUENCES);

  let recalled = 0, exact = 0, predicted = 0;
  const t0 = performance.now();
  for (let i = 0; i < SEQUENCES; i++) {
    const cue = stored[i].slice(0, CUE);
    const r = sm.recall(cue);
    if (r.name === 'seq' + i) recalled++;
    if (r.exact) exact++;
    const p = sm.predictNext(cue);
    if (p.name === stored[i][CUE]) predicted++;
  }
  const ms = performance.now() - t0;

  console.log('  sequence memory, d=' + S.D + ', ' + SEQUENCES + ' sequences of ' + LENGTH + ' items over a ' + VOCAB + ' item vocabulary');
  console.log('    recall rate       ' + recalled + '/' + SEQUENCES + ' (' + (100 * recalled / SEQUENCES).toFixed(1) + '%) from a ' + CUE + ' item cue');
  console.log('    exact decode rate ' + exact + '/' + SEQUENCES + ' (all ' + LENGTH + ' positions read back out of the hypervector)');
  console.log('    next item rate    ' + predicted + '/' + SEQUENCES);
  console.log('    ' + (ms / SEQUENCES).toFixed(3) + ' ms per recall and prediction pair');

  assert.ok(recalled >= SEQUENCES * 0.95, 'recall was ' + recalled + '/' + SEQUENCES);
  assert.ok(exact >= SEQUENCES * 0.95, 'exact decode was ' + exact + '/' + SEQUENCES);
  assert.ok(predicted >= SEQUENCES * 0.95, 'next item was ' + predicted + '/' + SEQUENCES);

  // a cue made of items that were never stored together matches nothing
  const nonsense = sm.recall(['w0', 'w1', 'w2'].map(n => S.hvFromSeed('unrelated:' + n)));
  assert.equal(nonsense.name, null);

  const back = SequenceMemory.from(roundTrip(sm.serialize()));
  assert.equal(back.size(), SEQUENCES);
  const r = back.recall(stored[42].slice(0, CUE));
  assert.equal(r.name, 'seq42');
  assert.deepEqual(r.items, stored[42]);
});

test('sequence memory: order is carried by the permutation, and prediction falls back to the transitions', () => {
  const sm = new SequenceMemory({ d: S.D });
  sm.store('alphabet', ['a', 'b', 'c', 'd']);

  // position is readable straight out of the chain
  assert.deepEqual(sm.decodeAll(sm.get('alphabet').hv, 4).map(x => x.name), ['a', 'b', 'c', 'd']);
  assert.equal(sm.decodeAt(sm.get('alphabet').hv, 2).name, 'c');

  // the same items in another order are a different hypervector
  sm.store('reversed', ['d', 'c', 'b', 'a']);
  assert.ok(S.sim(sm.get('alphabet').hv, sm.get('reversed').hv) < 0.2, 'order changes the vector');
  assert.equal(sm.recall(['d', 'c']).name, 'reversed');
  assert.equal(sm.recall(['a', 'b']).name, 'alphabet');

  // prediction through recall names the next position
  const p = sm.predictNext(['a', 'b']);
  assert.equal(p.name, 'c');
  assert.equal(p.via, 'recall');
  assert.equal(p.sequence, 'alphabet');

  // with recall held to an impossible threshold, the transition memory still answers
  const chains = new SequenceMemory({ d: S.D });
  chains.store('s1', ['red', 'orange', 'yellow']);
  chains.store('s2', ['dog', 'cat', 'mouse']);
  chains.store('s3', ['one', 'two', 'three']);
  const t = chains.predictNext(['red'], { threshold: 0.99 });
  assert.equal(t.via, 'transition');
  assert.equal(t.name, 'orange');
  const t2 = chains.predictNext(['cat'], { threshold: 0.99 });
  assert.equal(t2.name, 'mouse');

  // forgetting a sequence removes its transitions too
  assert.equal(chains.forget('s2'), true);
  assert.equal(chains.size(), 2);
  assert.equal(chains.transitions.length, 4, 'four transitions left, two per surviving sequence');
  assert.notEqual(chains.predictNext(['cat'], { threshold: 0.99 }).name, 'mouse', 'the forgotten transition no longer answers');
  assert.equal(chains.predictNext(['red'], { threshold: 0.99 }).name, 'orange', 'the surviving transitions still do');
  assert.equal(chains.forget('s2'), false);
  assert.throws(() => chains.store('s1', ['x']), /already stored/);
});

// ---------------------------------------------------------------- self
test('self memory: what ran, how often, and how surprised it was, per cell and per region', () => {
  const b = new Brain({ name: 'watched', ledger: 'off' });
  b.addCell({ id: 'tick', kind: 'source.counter', region: 'cognitive', circuit: 'clock' });
  b.addCell({ id: 'log', kind: 'sink.log', region: 'motor', circuit: 'act', policy: { period: 'event' } });
  b.addCell({ id: 'idle', kind: 'sink.log', region: 'motor', circuit: 'act', policy: { period: 'event' } });
  b.connect('tick', 'out', 'log', 'in');

  const self = new SelfMemory({ window: 100, keep: 8 });
  const WINDOWS = 5;
  for (let w = 0; w < WINDOWS; w++) { b.tick(100); self.observeBrain(b); }

  const series = self.cellSeries('tick');
  assert.equal(series.length, WINDOWS, 'one row per window');
  assert.ok(series.every(r => r.runs === 100), 'the counter ran every tick: ' + series.map(r => r.runs).join(','));
  assert.equal(series[0].t0, 100);
  assert.equal(series[0].t1, 199);
  assert.equal(series[0].fireRate, 1);

  const logSeries = self.cellSeries('log');
  assert.equal(logSeries.length, WINDOWS);
  assert.ok(logSeries.every(r => r.runs >= 95), 'the sink ran on almost every tick: ' + logSeries.map(r => r.runs).join(','));

  assert.equal(self.cellSeries('idle').length, 0, 'a cell that never ran has no rows');

  const totals = self.totals();
  assert.equal(totals.windows, WINDOWS);
  assert.equal(totals.cells.find(c => c.name === 'tick').runs, 500);
  assert.equal(totals.regions.find(r => r.name === 'cognitive').runs, 500);
  assert.ok(totals.regions.find(r => r.name === 'motor').runs >= 495);

  const top = self.top('runs', 2);
  assert.deepEqual(top.map(r => r.name).sort(), ['log', 'tick']);
  assert.equal(self.top('runs', 1, { scope: 'region' })[0].name, 'cognitive');

  // a range picks out windows
  const late = self.totals({ from: 400, to: 600 });
  assert.equal(late.windows, 2);
  assert.equal(late.cells.find(c => c.name === 'tick').runs, 200);

  // surprise is averaged, not summed
  self.record(450, { cell: 'predictor', region: 'association', runs: 1, surprise: 0.2 });
  self.record(460, { cell: 'predictor', region: 'association', runs: 1, surprise: 0.6 });
  assert.ok(Math.abs(self.surpriseOf('predictor') - 0.4) < 1e-9);

  // windows are bounded
  const small = new SelfMemory({ window: 10, keep: 3 });
  for (let t = 0; t < 100; t += 10) small.record(t, { cell: 'x', region: 'r', runs: 1 });
  assert.equal(small.windows.size, 3);
  assert.equal(small.stats.dropped, 7);

  const back = SelfMemory.from(roundTrip(self.serialize()));
  assert.equal(back.totals().cells.find(c => c.name === 'tick').runs, 500);
  assert.equal(back.cellSeries('tick').length, WINDOWS);
  assert.ok(Math.abs(back.surpriseOf('predictor') - 0.4) < 1e-9);
});

// ---------------------------------------------------------------- the cells
test('memory cells: the tiers run inside a brain and the slow cells fire on their period', () => {
  const brain = new Brain({ name: 'memory-cells', ledger: 'off' });
  const sys = attachMemory(brain, new MemorySystem({ name: 'memory-cells' }));
  assert.equal(getMemorySystem('memory-cells'), sys);

  brain.addRegion('perception');
  brain.addRegion('memory');
  brain.addCell({ id: 'p.enc', kind: 'encode.hv', region: 'perception', circuit: 'text', policy: { period: 'event' } });
  brain.addCell({ id: 'm.work', kind: 'memory.working', region: 'memory', circuit: 'working', params: { system: 'memory-cells', capacity: 4, tau: 200, k: 2 }, policy: { period: 'event' } });
  brain.addCell({ id: 'm.epi', kind: 'memory.episodic', region: 'memory', circuit: 'episodic', params: { system: 'memory-cells', k: 2, minSim: 0.1 }, policy: { period: 'event' } });
  brain.addCell({ id: 'm.sem', kind: 'memory.semantic', region: 'memory', circuit: 'concepts', params: { system: 'memory-cells', beta: 10 }, policy: { period: 'event' } });
  brain.addCell({ id: 'm.seq', kind: 'memory.sequence', region: 'memory', circuit: 'order', params: { system: 'memory-cells' }, policy: { period: 'event' } });
  brain.addCell({ id: 'm.skill', kind: 'memory.procedural', region: 'memory', circuit: 'skills', params: { system: 'memory-cells' }, policy: { period: 'event' } });
  brain.addCell({ id: 'm.self', kind: 'memory.self', region: 'memory', circuit: 'self', params: { system: 'memory-cells', k: 3 }, policy: { period: 100 } });
  brain.addCell({ id: 'm.consolidate', kind: 'memory.consolidate', region: 'memory', circuit: 'slow', params: { system: 'memory-cells', window: 10 * MIN, minCount: 3 }, policy: { period: MIN } });
  brain.addCell({ id: 'm.forget', kind: 'memory.forget', region: 'memory', circuit: 'slow', params: { system: 'memory-cells', rate: 0.5, floor: 1, horizon: MIN / 2 }, policy: { period: MIN } });
  brain.addCell({ id: 'm.log', kind: 'sink.log', region: 'memory', circuit: 'out', policy: { period: 'event' } });

  brain.connect('p.enc', 'hv', 'm.epi', 'key');
  brain.connect('p.enc', 'hv', 'm.work', 'item');
  brain.connect('p.enc', 'hv', 'm.sem', 'pattern');
  brain.connect('m.epi', 'recall', 'm.log', 'in');
  brain.connect('m.consolidate', 'concept', 'm.log', 'in');
  assert.throws(() => brain.connect('m.sem', 'clean', 'm.skill', 'define'), /not accepted/);

  // six rounds of the same two words, each one an episode with its items
  const phrases = [['red', 'apple'], ['red', 'apple'], ['red', 'apple'], ['green', 'pear'], ['green', 'pear'], ['green', 'pear']];
  for (const items of phrases) {
    brain.inject('p.enc', 'in', { kind: 'event', data: { text: items.join(' ') } });
    brain.tick(1);
    brain.inject('m.epi', 'value', { kind: 'event', data: { items } });
    brain.inject('m.sem', 'label', { kind: 'event', data: { name: items.join('-') } });
    brain.tick(2);
  }
  assert.equal(sys.episodic.size(), 6, 'the episodic cell appended one episode per key');
  assert.equal(sys.working.of('memory/working').size(), 4, 'the working ring is bounded at its capacity');
  assert.equal(sys.semantic.has('red-apple'), true);
  assert.equal(brain.cell('m.epi').stats.errors, 0);

  // a query into the episodic cell comes back out of it as a recall event
  brain.inject('m.epi', 'query', { kind: 'hv', data: sys.episodic.keyAt(0).slice() });
  brain.tick(2);
  const recalls = brain.cell('m.log').memory.working;
  assert.ok(recalls.length > 0, 'the recall reached the sink');
  assert.equal(brain.cell('m.epi').state.queries, 1);

  // the semantic cell cleans a noisy cue up to the concept it was taught
  const rng = new RNG('cells');
  brain.inject('m.sem', 'query', { kind: 'hv', data: flip(sys.semantic.concept('green-pear'), rng, 0.2) });
  brain.tick(2);
  const named = brain.takeOutbox().map(s => s.data).filter(d => d && d.name !== undefined);
  assert.ok(named.some(d => d.name === 'green-pear'), 'the semantic cell named the concept: ' + JSON.stringify(named));

  // the sequence cell watches items go past and stores the run when it is marked
  for (const w of ['one', 'two', 'three']) {
    brain.inject('m.seq', 'item', { kind: 'hv', data: sys.sequence.item(w) });
    brain.inject('m.seq', 'mark', { kind: 'event', data: { name: w } });
    brain.tick(2);
  }
  brain.inject('m.seq', 'mark', { kind: 'event', data: { store: 'counting' } });
  brain.tick(2);
  assert.equal(sys.sequence.has('counting'), true);
  assert.deepEqual(sys.sequence.get('counting').itemNames, ['one', 'two', 'three']);
  brain.inject('m.seq', 'cue', { kind: 'hv', data: sys.sequence.encode(['one', 'two']) });
  brain.tick(2);
  const seqOut = brain.takeOutbox().map(s => s.data).find(d => d && d.cue);
  assert.deepEqual(seqOut.cue, ['one', 'two']);
  assert.equal(seqOut.name, 'counting');
  assert.equal(seqOut.next, 'three');

  // the procedural cell hands a stored skill back on request
  brain.inject('m.skill', 'define', { kind: 'event', data: { name: 'counter', cells: [{ id: 'c', kind: 'source.counter' }], edges: [] } });
  brain.tick(2);
  brain.inject('m.skill', 'request', { kind: 'event', data: { name: 'counter' } });
  brain.tick(2);
  const skillOut = brain.takeOutbox().map(s => s.data).find(d => d && d.found !== undefined);
  assert.equal(skillOut.found, true);
  assert.equal(skillOut.skill.cells[0].kind, 'source.counter');

  // the slow cells: nothing has fired them since t=0 yet
  const consolidateRunsBefore = brain.cell('m.consolidate').stats.runs;
  const forgetRunsBefore = brain.cell('m.forget').stats.runs;
  assert.equal(consolidateRunsBefore, 1, 'both slow cells were due once, at t=0');
  assert.equal(forgetRunsBefore, 1);
  assert.equal(sys.semantic.has('apple+red'), false, 'no concept has been consolidated out of the episodes yet');

  const t0 = performance.now();
  brain.tick(MIN + 1 - brain.clock.t);
  const ms = performance.now() - t0;
  assert.equal(brain.clock.t, MIN + 1);
  assert.equal(brain.cell('m.consolidate').stats.runs, 2, 'the consolidation cell fired again one minute later');
  assert.equal(brain.cell('m.forget').stats.runs, 2);
  assert.ok(brain.cell('m.self').stats.runs > 500, 'the self cell sampled on its own faster period');

  console.log('  memory cells: ticked to ' + brain.clock.t + ' in ' + ms.toFixed(0) + ' ms');
  console.log('    consolidate (period ' + MIN + ') runs ' + brain.cell('m.consolidate').stats.runs + ', formed ' + brain.cell('m.consolidate').state.formed + ' concepts');
  console.log('    forget      (period ' + MIN + ') runs ' + brain.cell('m.forget').stats.runs + ', swept ' + brain.cell('m.forget').state.swept + ', cooled ' + brain.cell('m.forget').state.cooled);
  console.log('    concepts now ' + sys.semantic.concepts().map(c => c.name + ':' + c.strength).join(' '));

  assert.equal(sys.semantic.has('apple+red'), true, 'the slow cell consolidated the repeated pair');
  assert.equal(sys.semantic.has('green+pear'), true);
  assert.ok(brain.cell('m.forget').state.swept > 0, 'the forget cell swept the stale working entries');
  assert.ok(brain.cell('m.forget').state.cooled > 0, 'and cooled the episodes past its horizon');
  assert.equal(sys.episodic.size(), 6, 'cooling deleted nothing');

  unregisterMemorySystem('memory-cells');
});

// ---------------------------------------------------------------- the whole system
test('memory system: every tier serializes to JSON safe objects and restores', () => {
  const d = 1024;
  const sys = createMemorySystem({ name: 'roundtrip', d, working: { capacity: 8, tau: 300 }, self: { window: 50 } });
  const rng = new RNG('roundtrip');

  // working
  sys.working.of('perception/text').push({ t: 4, kind: 'hv', data: S.hvFromSeed('cue', d), salience: 1, cell: 'p.enc' });
  sys.working.of('motor/act').push({ t: 4, kind: 'event', data: { action: 'wave' }, salience: 0.5, cell: 'mo.fsm' });
  // episodic and semantic
  const encode = (items) => S.bundle(items.map(i => sys.semantic.items.get(i)));
  for (let i = 0; i < 9; i++) sys.episodic.append({ key: encode(['sun', 'warm']), value: { i }, items: ['sun', 'warm'], t: i });
  sys.consolidate({ minCount: 4 });
  // procedural
  sys.procedural.define('counter', { doc: 'a counter', cells: [{ id: 'c', kind: 'source.counter', region: 'cognitive', circuit: 'clock' }], edges: [] });
  // sequence
  sys.sequence.store('numbers', ['one', 'two', 'three', 'four']);
  // self
  sys.self.record(10, { cell: 'p.enc', region: 'perception', runs: 3, fired: 2, surprise: 0.25 });

  const json = roundTrip(sys.serialize());
  assert.equal(typeof json, 'object');
  const back = MemorySystem.from(json);

  assert.deepEqual(back.working.keys().sort(), ['motor/act', 'perception/text']);
  assert.equal(S.sim(back.working.of('perception/text').last().data, S.hvFromSeed('cue', d)), 1);
  assert.equal(back.working.of('motor/act').last().data.action, 'wave');
  assert.equal(back.working.of('perception/text').capacity, 8);

  assert.equal(back.episodic.size(), 9);
  assert.equal(back.episodic.retrieve(encode(['sun', 'warm']), { k: 1 })[0].value.i, sys.episodic.retrieve(encode(['sun', 'warm']), { k: 1 })[0].value.i);
  assert.deepEqual(back.episodic.episode(3).items, ['sun', 'warm']);
  // the keys go out one short string per episode (one string for all of them passed the
  // string cap at 49k episodes), and the older one-string form still restores the same keys
  assert.ok(Array.isArray(json.episodic.keys) && json.episodic.keys.length === 9 && json.episodic.keys.every((k) => typeof k === 'string'));
  const legacy = { ...json.episodic, keys: S.dataToJSON('hv', sys.episodic.keys.subarray(0, 9 * d)) };
  const old = EpisodicStore.from(legacy);
  assert.equal(old.size(), 9);
  for (let id = 0; id < 9; id++) assert.equal(S.sim(old.keyAt(id), back.episodic.keyAt(id)), 1);
  assert.equal(old.retrieve(encode(['sun', 'warm']), { k: 1 })[0].value.i, sys.episodic.retrieve(encode(['sun', 'warm']), { k: 1 })[0].value.i);

  assert.equal(back.semantic.has('sun+warm'), true);
  assert.equal(back.semantic.strengthOf('sun+warm'), 9);
  assert.equal(back.semantic.recognize(flip(encode(['sun', 'warm']), rng, 0.15)).name, 'sun+warm');

  assert.deepEqual(back.procedural.list(), ['counter']);
  assert.equal(back.procedural.get('counter').cells[0].kind, 'source.counter');

  assert.equal(back.sequence.size(), 1);
  assert.deepEqual(back.sequence.recall(['one', 'two']).items, ['one', 'two', 'three', 'four']);
  assert.equal(back.sequence.predictNext(['one', 'two']).name, 'three');

  assert.equal(back.self.totals().cells.find(c => c.name === 'p.enc').runs, 3);
  assert.ok(Math.abs(back.self.surpriseOf('p.enc') - 0.25) < 1e-9);

  const d2 = back.describe();
  assert.equal(d2.episodic.n, 9);
  assert.equal(d2.sequence.sequences, 1);
  assert.equal(d2.procedural.skills, 1);
  assert.equal(d2.working.rings, 2);

  unregisterMemorySystem('roundtrip');
  assert.throws(() => getMemorySystem('roundtrip'), /no system registered/);
});

test('memory.sequence: an open run is bounded at maxRun and the codebook releases what nothing refers to', () => {
  const brain = new Brain({ name: 'seq-bound', ledger: 'off' });
  const sys = attachMemory(brain, new MemorySystem({ name: 'seq-bound' }));
  brain.addRegion('memory');
  brain.addCell({ id: 'm.seq', kind: 'memory.sequence', region: 'memory', circuit: 'order', params: { system: 'seq-bound', maxRun: 8 }, policy: { period: 'event' } });
  const rng = new RNG('seq-bound');
  const feed = (k) => { for (let i = 0; i < k; i++) { brain.inject('m.seq', 'item', { kind: 'hv', data: S.hvRandom(rng, S.D) }); brain.tick(1); } };
  feed(30);
  const st = brain.cell('m.seq').state;
  assert.equal(st.unnamed, 30, 'every novel item was auto-named');
  assert.equal(st.buffer.length, 8, 'the open run keeps the last maxRun names');
  assert.deepEqual(st.buffer, Array.from({ length: 8 }, (_, i) => 'seq:item:' + (22 + i)));
  assert.equal(sys.sequence.items.size, 8, 'the codebook holds only the open run');
  // a mark stores the run: its items are referenced and survive every later run
  brain.inject('m.seq', 'mark', { kind: 'event', data: { store: true } });
  brain.tick(1);
  assert.equal(sys.sequence.size(), 1);
  const rec = sys.sequence.get('seq:0');
  assert.equal(rec.n, 8);
  feed(40);
  assert.equal(sys.sequence.items.size, 16, 'the stored items plus the open run, nothing else');
  for (const nm of rec.itemNames) assert.ok(sys.sequence.items.has(nm), nm + ' is still in the codebook');
  const r = sys.sequence.recall(rec.itemNames.slice(0, 3));
  assert.equal(r.name, 'seq:0'); assert.equal(r.exact, true);
  // release() never touches a referenced name or a kept one
  assert.equal(sys.sequence.release(rec.itemNames), 0);
  assert.equal(sys.sequence.release(['seq:item:69'], new Set(['seq:item:69'])), 0);
  assert.equal(sys.sequence.release(['seq:item:69']), 1);
  // forgetting the record frees its items
  sys.sequence.forget('seq:0');
  assert.equal(sys.sequence.release(rec.itemNames), 8);
  // the reference counts survive a reload
  const back = SequenceMemory.from(sys.sequence.serialize());
  assert.equal(back.refs.size, 0);
  sys.sequence.store('kept', ['a', 'b', 'c']);
  assert.deepEqual([...SequenceMemory.from(sys.sequence.serialize()).refs.keys()], ['a', 'b', 'c']);
  unregisterMemorySystem('seq-bound');
});

test('episodic: the record is bounded, the oldest cold episodes leave first, ids renumber and the index is rebuilt', () => {
  const s = new EpisodicStore({ d: 64, maxEpisodes: 64, seed: 'bound' });
  const rng = new RNG('bound');
  const keys = [];
  for (let i = 0; i < 64; i++) {
    const k = new Int8Array(64); for (let j = 0; j < 64; j++) k[j] = rng.int(2) ? 1 : -1;
    keys.push(k); s.append({ key: k, t: i, items: ['e' + i] });
  }
  assert.equal(s.size(), 64);
  assert.equal(s.cool(10), 10, 'episodes at t=0..9 go cold');
  s.append({ key: keys[0], t: 64, items: ['e64'] });
  assert.equal(s.size(), 49, 'the 65th append compacts to three quarters of the bound (48) and then lands');
  const d = s.describe();
  assert.equal(d.stats.evicted, 16); assert.equal(d.stats.compactions, 1); assert.equal(d.maxEpisodes, 64);
  assert.equal(s.times[0], 16, 'the ten cold ones and the six oldest warm ones (t=10..15) left, t=16 is id 0');
  assert.equal(s.byItem('e15').length, 0); assert.equal(s.byItem('e16').length, 1); assert.equal(s.byItem('e64').length, 1);
  assert.equal(s.retrieve(keys[40], { k: 1 })[0].t, 40, 'retrieval through the rebuilt index finds the episode at its new id');
  assert.equal(s.retrieve(keys[40], { k: 1, scan: true })[0].t, 40);
  assert.equal(s.between(30, 32).length, 3);
  const r = EpisodicStore.from(s.serialize());
  assert.equal(r.size(), 49); assert.equal(r.maxEpisodes, 64); assert.equal(r.times[0], 16);
  assert.equal(r.retrieve(keys[40], { k: 1 })[0].t, 40);
  assert.deepEqual(Array.from(r.cold.subarray(0, r.n)), Array.from(s.cold.subarray(0, s.n)), 'cold flags survive the round trip after a compaction');
  const j = s.serialize(); j.maxEpisodes = 32;
  const small = EpisodicStore.from(j);
  assert.equal(small.size(), 25, 'a snapshot larger than the bound compacts on restore (24 kept, then the last append)');
});

test('semantic memory: the resident arena step equals the JS step lane for lane, across adds, merges, drops, decay and a restore', () => {
  if (!SIMD.available) return;
  const rng = new RNG('arena-step');
  const d = 8192;
  const a = new SemanticMemory({ d, capacity: 40 });
  const b = new SemanticMemory({ d, capacity: 40 }); b.arena = null; b.slotOf = [];
  assert.ok(a.arena, 'the arena is resident when wasm simd is available');
  const pats = [];
  // 60 adds: 40 unnamed slots plus 20 named adds over 7 names (merges), 47 slots, so 7 drops
  for (let i = 0; i < 60; i++) {
    const p = S.hvRandom(rng, d); pats.push(p);
    const opts = { name: i % 3 === 0 ? 'c' + (i % 7) : null, strength: 1 + (i % 4) };
    a.add(p, opts); b.add(p, opts);
  }
  assert.equal(a.size(), 40); assert.equal(b.size(), 40);
  assert.equal(a.stats.dropped, 7); assert.equal(b.stats.dropped, 7); assert.equal(a.stats.merged, 13);
  assert.equal(a.arena.count, 40, 'drops past capacity leave the arena at the pattern count');
  assert.deepEqual(a.names, b.names);
  for (let q = 0; q < 6; q++) {
    const cue = S.bundle([pats[rng.int(60)], S.hvRandom(rng, d)]);
    assert.deepEqual(a.step(cue), b.step(cue), 'step ' + q);
    const ra = a.recognize(cue), rb = b.recognize(cue);
    assert.equal(ra.name, rb.name); assert.equal(ra.sim, rb.sim); assert.equal(ra.iterations, rb.iterations); assert.equal(ra.converged, rb.converged);
  }
  a.decay({ rate: 0.5, floor: 1.5 }); b.decay({ rate: 0.5, floor: 1.5 });
  assert.equal(a.size(), b.size()); assert.equal(a.arena.count, a.size());
  assert.ok(a.size() < 40, 'decay removed some');
  const cue = S.bundle([pats[5], S.hvRandom(rng, d)]);
  assert.deepEqual(a.step(cue), b.step(cue), 'after decay');
  const r = SemanticMemory.from(a.serialize());
  assert.equal(r.arena.count, a.size());
  assert.deepEqual(r.step(cue), a.step(cue), 'after a restore');
  assert.deepEqual(r.slotOf, r.patterns.map((_, i) => i));
});

test('semantic memory: the dominant weight shortcut answers exactly what the full scan answers, at 64, 256 and 1024 patterns', () => {
  if (!SIMD.available) return;
  const d = 8192, CUES = 200;
  for (const n of [64, 256, 1024]) {
    const rng = new RNG('semantic-exact-' + n);
    const pats = [];
    const fast = new SemanticMemory({ d, capacity: 8192 });
    const slow = new SemanticMemory({ d, capacity: 8192 });
    slow.fast = false; // the control: the scan on every step, and a second scan in recognize
    for (let i = 0; i < n; i++) {
      const p = fastHv(rng, d); pats.push(p);
      const opts = { name: 'p' + i, strength: 1 + (i % 4) };
      fast.add(p, opts); slow.add(p, opts);
    }
    assert.equal(fast._nonBip, 0, 'every seeded pattern is bipolar');
    assert.equal(fast.arena.count, n, 'the arena holds every pattern past its initial 256 slots');
    let converged = 0;
    for (let c = 0; c < CUES; c++) {
      const cue = flip(pats[rng.int(n)], rng, 0.10 + (c % 4) * 0.07);
      const a = fast.recognize(cue), b = slow.recognize(cue);
      if (a.converged) converged++;
      assert.deepEqual(a.hv, b.hv, 'hv lane for lane at n=' + n + ', cue ' + c);
      assert.equal(a.name, b.name, 'name at n=' + n + ', cue ' + c);
      assert.equal(a.sim, b.sim, 'sim at n=' + n + ', cue ' + c);
      assert.equal(a.slot, b.slot); assert.equal(a.cueSim, b.cueSim);
      assert.equal(a.iterations, b.iterations); assert.equal(a.converged, b.converged);
    }
    assert.equal(slow.stats.dominated, 0, 'the control never takes the shortcut');
    assert.equal(slow.stats.reusedSims, 0, 'the control always scans again in recognize');
    assert.equal(slow.stats.steps, fast.stats.steps, 'both arms ran the same number of steps');
    assert.ok(fast.stats.dominated > 0, 'the shortcut fired at n=' + n + ': ' + fast.stats.dominated + ' of ' + fast.stats.steps + ' steps');
    assert.equal(fast.stats.reusedSims, converged, 'a converged cleanup is exactly when recognize can reuse the sims');
    assert.ok(converged > 0, 'cleanups converged at n=' + n + ': ' + converged + ' of ' + CUES);
    console.log('  exactness n=' + n + ', ' + CUES + ' cues: steps ' + fast.stats.steps
      + ', accumulations skipped ' + fast.stats.dominated + ', converged ' + converged + ', sims reused ' + fast.stats.reusedSims
      + ', mean nonzero weights ' + (fast.stats.nonzero / fast.stats.steps).toFixed(1) + ' of ' + n);
  }
});

test('semantic memory: walk() ends where cleanup() ends, and reports an orbit as a cycle of its length', () => {
  if (!SIMD.available) return;
  const d = 8192, n = 64;
  const rng = new RNG('semantic-walk');
  const m = new SemanticMemory({ d, capacity: 8192 });
  const pats = [];
  for (let i = 0; i < n; i++) { const p = fastHv(rng, d); pats.push(p); m.add(p, { name: 'w' + i, strength: 1 + (i % 4) }); }
  // a walk that reaches a fixed point reports it, and it is the one cleanup() stops on
  let walked = 0, converged = 0;
  for (let c = 0; c < 20; c++) {
    const cue = flip(pats[rng.int(n)], rng, 0.10 + (c % 3) * 0.1);
    const w = m.walk(cue), r = m.cleanup(cue);
    assert.equal(w.cycleLength, 0, 'no orbit on a converging cue ' + c);
    assert.equal(w.converged, r.converged, 'walk and cleanup agree on convergence, cue ' + c);
    assert.equal(w.iterations, r.iterations, 'walk and cleanup take the same number of steps, cue ' + c);
    assert.deepEqual(w.hv, r.hv, 'walk and cleanup end on the same vector, cue ' + c);
    walked += w.iterations;
    if (w.converged) converged++;
  }
  assert.ok(converged > 0, 'cues converged: ' + converged + ' of 20');
  // a walk that never repeats a state runs out of iterations and says so
  const short = m.walk(fastHv(rng, d), { maxIters: 1 });
  assert.equal(short.iterations, 1);
  assert.equal(short.converged, false);
  assert.equal(short.cycleLength, 0);
  // an orbit: a scripted step that alternates between two vectors after the cue
  const a = fastHv(rng, 64), b = fastHv(rng, 64);
  const orbit = new SemanticMemory({ d: 64, capacity: 8 });
  orbit.add(fastHv(rng, 64));
  let k = 0;
  orbit.step = () => Int8Array.from((k++ % 2 === 0) ? a : b);
  const o = orbit.walk(fastHv(rng, 64), { maxIters: 8 });
  assert.equal(o.converged, false, 'an orbit is not a fixed point');
  assert.equal(o.cycleLength, 2, 'the two step orbit is reported as a cycle of length 2');
  assert.equal(o.cycleAt, 1, 'the repeat is of the state one iteration in');
  assert.equal(o.iterations, 3, 'the walk stops on the repeat, not at maxIters');
  console.log('  walk n=' + n + ', 20 cues: converged ' + converged + '/20, cycles 0/20, iterations walked ' + walked
    + ' (mean ' + (walked / 20).toFixed(2) + '), scripted orbit cycleLength ' + o.cycleLength);
});

test('semantic memory: BRAIN_SEMANTIC_FAST=0 pins a whole process to the old paths, and an explicit option beats it', () => {
  const before = process.env.BRAIN_SEMANTIC_FAST;
  try {
    delete process.env.BRAIN_SEMANTIC_FAST;
    assert.equal(new SemanticMemory({ d: 64 }).fast, true, 'the organism runs the new paths by default');
    process.env.BRAIN_SEMANTIC_FAST = '0';
    assert.equal(new SemanticMemory({ d: 64 }).fast, false, 'the environment pins the control arm');
    assert.equal(new SemanticMemory({ d: 64, fast: true }).fast, true, 'an explicit option wins over the environment');
    process.env.BRAIN_SEMANTIC_FAST = '1';
    assert.equal(new SemanticMemory({ d: 64 }).fast, true, 'only the exact string 0 turns it off');
  } finally {
    if (before === undefined) delete process.env.BRAIN_SEMANTIC_FAST; else process.env.BRAIN_SEMANTIC_FAST = before;
  }
});

test('semantic memory: one lane that is not +1 or -1 turns the shortcut off, and a merge, a forget and a restore turn it back on', () => {
  if (!SIMD.available) return;
  const d = 2048;
  const rng = new RNG('semantic-nonbipolar');
  const fast = new SemanticMemory({ d, capacity: 64 });
  const slow = new SemanticMemory({ d, capacity: 64 }); slow.fast = false;
  const pats = [];
  for (let i = 0; i < 8; i++) { const p = fastHv(rng, d); pats.push(p); fast.learn('q' + i, p); slow.learn('q' + i, p); }
  const agree = (label) => {
    for (let c = 0; c < 20; c++) {
      const cue = flip(pats[c % 8], rng, 0.15);
      const a = fast.recognize(cue), b = slow.recognize(cue);
      assert.deepEqual(a.hv, b.hv, 'hv ' + label + ' cue ' + c);
      assert.equal(a.name, b.name, 'name ' + label + ' cue ' + c);
      assert.equal(a.sim, b.sim, 'sim ' + label + ' cue ' + c);
    }
  };
  agree('all bipolar');
  assert.ok(fast.stats.dominated > 0, 'the shortcut fires while every pattern is bipolar');

  const zero = fastHv(rng, d); zero[3] = 0;
  fast.learn('zero', zero, { strength: 0.05 }); slow.learn('zero', zero, { strength: 0.05 });
  assert.equal(fast._nonBip, 1, 'the zero lane was seen on the way in');
  const fired = fast.stats.dominated;
  agree('one zero lane');
  assert.equal(fast.stats.dominated, fired, 'no lane of any accumulation is decided by a bound that no longer holds');

  fast.learn('zero', fastHv(rng, d), { strength: 4 }); slow.learn('zero', fastHv(rng, d), { strength: 4 });
  assert.equal(fast._nonBip, 0, 'the merge made that slot bipolar again');
  agree('after the merge');
  assert.ok(fast.stats.dominated > fired, 'the shortcut is back');

  const zero2 = fastHv(rng, d); zero2[7] = 0;
  fast.add(zero2, { name: 'zero2', strength: 0.05 }); slow.add(zero2, { name: 'zero2', strength: 0.05 });
  assert.equal(fast._nonBip, 1);
  fast.decay({ rate: 0.5, floor: 0.1 }); slow.decay({ rate: 0.5, floor: 0.1 });
  assert.equal(fast.has('zero2'), false, 'the weak one was forgotten');
  assert.equal(fast._nonBip, 0, 'forgetting it cleared the flag');
  agree('after the forget');

  const back = SemanticMemory.from(roundTrip(fast.serialize()));
  assert.equal(back._nonBip, 0);
  assert.equal(back.bip.length, back.patterns.length, 'a restore rebuilds one flag per pattern');
  const cue = flip(pats[2], rng, 0.15);
  assert.deepEqual(back.recognize(cue).hv, slow.recognize(cue).hv, 'a restored memory answers what the control answers');
});
