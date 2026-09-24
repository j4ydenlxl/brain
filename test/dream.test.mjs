// test/dream.test.mjs: the imagination region (mind/dream.mjs) on a brain small enough to read.
// One predict.next cell fed a counter, a memory system, and the region built with every 0 so
// the test calls observe(), dream() and flush() itself and knows exactly which tick did what.
// No model, no network, no server: node --test test/dream.test.mjs exits on its own.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import '../cells/index.mjs';
import { Brain } from '../core/brain.mjs';
import * as S from '../core/signal.mjs';
import { attachMemory } from '../memory/index.mjs';
import { encodePrompt } from '../act/prompt.mjs';
import { DreamRegion, attachDream, dreamPolicy, encodeWords, askActive, DREAM_KIND, DREAM_PROVENANCE } from '../mind/dream.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
let seq = 0;

// A brain whose predict cell 'p' has consumed 3, 6, 9, 12, and a region that has read them.
function counter(opts = {}) {
  const brain = new Brain({ name: 'dream-test-' + (++seq), ledger: 'full', pruneEvery: 0 });
  attachMemory(brain, { name: 'dream-test-mem-' + seq + '-' + Math.random().toString(36).slice(2) });
  brain.addCell({ id: 'p', kind: 'predict.next', region: 'cognitive', circuit: 'c', policy: { period: 'event' } });
  const region = new DreamRegion(brain, { every: 0, suite: false, mind: null, ...opts });
  for (const n of [3, 6, 9, 12]) { brain.inject('p', 0, { kind: 'num', data: S.int(n) }); brain.tick(1); }
  region.observe();
  return { brain, region };
}
const lastExternal = (brain) => brain.ledger.recent(50, 'signal').filter((e) => e.cell === 'external').sort((a, b) => b.seq - a.seq)[0];

test('a dream is a signal with provenance dream and grounded false, in the signal and in the ledger', () => {
  const { brain, region } = counter();
  const made = region.dream();
  assert.ok(made.length >= 3, 'the counter gives at least repeat, arithmetic and geometric: made ' + made.length);
  for (const d of made) {
    assert.equal(d.signal.kind, 'event');
    assert.equal(d.signal.data.provenance, DREAM_PROVENANCE);
    assert.equal(d.signal.data.grounded, false);
    assert.equal(d.signal.data.claim.observer, 'p');
    const ev = brain.ledger.get(d.seq);
    assert.equal(ev.type, 'dream');
    assert.equal(ev.provenance, 'dream');
    assert.equal(ev.grounded, false);
    assert.equal(typeof ev.novelty, 'number');
  }
  assert.equal(brain.ledger.counts.get('dream'), made.length, 'every dream is one ledger event');
  const rules = made.flatMap((d) => d.rules);
  for (const r of ['repeat', 'arithmetic', 'geometric']) assert.ok(rules.includes(r), 'competing hypothesis ' + r + ' present: ' + rules.join(','));
  console.log('dreams: ' + made.map((d) => d.text).join(' | '));
});

test('a planted future observation grounds the dream that claimed it, names the ledger event, and falsifies its competitors', () => {
  const { brain, region } = counter();
  const made = region.dream();
  const arith = made.find((d) => d.rules.includes('arithmetic'));
  const geo = made.find((d) => d.rules.includes('geometric'));
  assert.ok(arith && geo);
  assert.equal(region.horizon, 2, 'the default claim is two runs ahead');
  assert.equal(arith.value.type, 'int');
  assert.equal(arith.value.n, '18', '3, 6, 9, 12, then 15, then 18');
  assert.equal(arith.signal.data.claim.horizon, 2);
  // nothing is observed until the cell runs again
  assert.deepEqual(region.observe(), { resolved: 0, grounded: 0, runs: 0 });
  assert.equal(arith.status, 'pending');
  // the first run after birth is not the claimed one
  brain.inject('p', 0, { kind: 'num', data: S.int(15) }); brain.tick(1);
  assert.equal(region.observe().resolved, 0);
  assert.equal(arith.status, 'pending');
  brain.inject('p', 0, { kind: 'num', data: S.int(18) });
  const planted = lastExternal(brain);
  brain.tick(1);
  const r = region.observe();
  assert.equal(r.runs, 1);
  assert.equal(arith.status, 'grounded');
  assert.equal(arith.matchSeq, planted.seq, 'the dream names the signal that grounded it');
  assert.ok(arith.matchSeq > arith.seq, 'the grounding signal was emitted after the dream was born');
  assert.equal(region.stats.groundedInFlight, 0);
  assert.equal(geo.status, 'falsified');
  const score = brain.ledger.recent(20, 'dream.score').find((e) => e.id === arith.id);
  assert.equal(score.confirmed, true);
  assert.equal(score.grounded, false, 'a confirmed dream is still a dream, never relabelled grounded');
  assert.equal(score.matchSeq, planted.seq);
  assert.equal(region.stats.control.resolved, made.length, 'every dream had a matched control scored on the same run');
  // horizon 1 claims the very next run
  const h1 = counter({ horizon: 1 });
  const a1 = h1.region.dream().find((d) => d.rules.includes('arithmetic'));
  assert.equal(a1.value.n, '15');
  h1.brain.inject('p', 0, { kind: 'num', data: S.int(15) }); h1.brain.tick(1);
  h1.region.observe();
  assert.equal(a1.status, 'grounded');
  // the wrong value grounds nothing
  const b2 = counter();
  const made2 = b2.region.dream();
  for (const n of [1000, 1001]) { b2.brain.inject('p', 0, { kind: 'num', data: S.int(n) }); b2.brain.tick(1); }
  b2.region.observe();
  assert.ok(made2.every((d) => d.status === 'falsified'), made2.map((d) => d.id + ':' + d.status).join(','));
  // a run that consumed nothing resolves nothing
  const b3 = counter();
  b3.region.dream();
  b3.brain.addCell({ id: 'q', kind: 'predict.next', region: 'cognitive', circuit: 'c' });
  b3.brain.tick(3);
  assert.equal(b3.region.observe().resolved, 0);
});

test('novelty is measured against memory: a planted memory of the same claim makes it not novel', () => {
  const { brain, region } = counter();
  const made = region.dream();
  const arith = made.find((d) => d.rules.includes('arithmetic'));
  const repeat = made.find((d) => d.rules.includes('repeat'));
  assert.equal(arith.novelty.novel, true, 'an empty memory holds nothing near the claim: ' + JSON.stringify(arith.novelty));
  assert.equal(repeat.novelty.distance, 0, 'repeating what the observer already consumed is not novel');
  assert.equal(repeat.novelty.novel, false);
  // an unrelated memory leaves it novel
  const other = encodeWords(['unrelated', 'weather', 'report']);
  brain.memory.episodic.append({ key: other, value: { text: 'weather' }, items: ['weather'], t: 0 });
  S.release(other);
  assert.equal(region.novelty(arith.words).novel, true);
  // the same claim planted as a memory is found at distance 0
  const same = encodeWords(arith.words);
  brain.memory.episodic.append({ key: same, value: { text: 'planted' }, items: arith.words, t: 0 });
  S.release(same);
  const n2 = region.novelty(arith.words);
  assert.equal(n2.novel, false, JSON.stringify(n2));
  assert.equal(n2.distance, 0);
  assert.match(n2.nearest, /episodic#1/);
  // the content vector is the ask path's encoding, lane for lane
  const words = ['p', 'num', 'int', '18'];
  const a = encodeWords(words), b = encodePrompt(words);
  assert.equal(S.sim(a, b), 1);
  S.release(a); S.release(b);
});

test('no proposal is applied without the gate: held until a human approves, refused when forged', () => {
  const { brain, region } = counter();
  brain.gate.humanRequired.add(DREAM_KIND);
  const made = region.dream();
  const arith = made.find((d) => d.rules.includes('arithmetic'));
  for (const n of [15, 18]) { brain.inject('p', 0, { kind: 'num', data: S.int(n) }); brain.tick(1); }
  const before = brain.memory.episodic.size();
  const r = region.flush();
  assert.equal(r.proposed, 1, 'only the grounded, novel dream is proposed');
  const p = arith.proposal;
  assert.equal(p.kind, DREAM_KIND);
  assert.equal(p.status, 'pending');
  assert.equal(p.evidence.provenance, 'dream');
  assert.equal(p.evidence.grounded, false);
  assert.equal(p.evidence.confirmed, true);
  assert.equal(brain.memory.episodic.size(), before, 'a held proposal changes no memory');
  assert.throws(() => region.apply(arith, p), /nothing is applied without an approved/);
  assert.throws(() => region.apply(arith, { ...p, status: 'approved' }), /nothing is applied/, 'a copy marked approved is not the gate verdict');
  assert.throws(() => region.apply(arith, { ...p, status: 'approved', kind: 'plasticity.hebbian' }), /nothing is applied/);
  assert.throws(() => region.apply(arith, { ...p, status: 'approved', what: { id: 'd999' } }), /nothing is applied/);
  assert.equal(brain.memory.episodic.size(), before);
  // decay does not drop a dream a human still owes a verdict on
  region.cycle(); region.cycle();
  assert.equal(region.pool.has(arith.id), true);
  brain.gate.decide(p.id, true, 'test');
  region.cycle();
  assert.equal(brain.memory.episodic.size(), before + 1, 'approved by the gate, then applied');
  const kept = brain.memory.episodic.values[before];
  assert.equal(kept.provenance, 'dream');
  assert.equal(kept.grounded, false);
  assert.equal(kept.dream, arith.id);
  assert.equal(kept.proposal, p.id);
  assert.equal(kept.confirmedBy, arith.matchSeq);
  assert.equal(brain.ledger.counts.get('dream.apply'), 1);
  // the policy itself: novel and (confirmed or a suite gain), and still a dream
  assert.equal(dreamPolicy({ evidence: { provenance: 'dream', grounded: false, novel: true, confirmed: true } }), 'approve');
  assert.equal(dreamPolicy({ evidence: { provenance: 'dream', grounded: false, novel: true, confirmed: false, suiteGain: 2 } }), 'approve');
  assert.equal(dreamPolicy({ evidence: { provenance: 'dream', grounded: false, novel: false, confirmed: true } }), 'reject');
  assert.equal(dreamPolicy({ evidence: { provenance: 'dream', grounded: false, novel: true, confirmed: false, suiteGain: 0 } }), 'reject');
  assert.equal(dreamPolicy({ evidence: { provenance: 'observed', grounded: true, novel: true, confirmed: true } }), 'reject');
});

test('without a human hold the gate approves a useful dream at once, and the rest decay', () => {
  const { brain, region } = counter();
  const made = region.dream();
  for (const n of [15, 18]) { brain.inject('p', 0, { kind: 'num', data: S.int(n) }); brain.tick(1); }
  region.flush();
  assert.equal(region.stats.applied, 1);
  assert.equal(region.stats.proposed, 1);
  for (let i = 0; i < 8; i++) region.cycle();
  for (const d of made) assert.equal(region.pool.has(d.id), false, d.id + ' left the pool');
  assert.ok(brain.ledger.counts.get('dream.decay') >= 1);
});

test('the region waits while an ask is active and runs on its period', () => {
  const { brain, region } = counter();
  brain.ctx.asking = 1;
  assert.equal(askActive(brain), 'ctx.asking');
  const row = region.cycle();
  assert.equal(row.skipped, 'ctx.asking');
  assert.equal(row.made, 0);
  assert.equal(region.stats.skippedForAsk, 1);
  brain.ctx.asking = 0;
  assert.ok(region.cycle().made > 0);
  // an act.ask event since the last cycle also skips one cycle
  brain.log({ type: 'act.ask', prompt: 'x' });
  assert.match(region.cycle().skipped, /act\.ask/);
  // mail waiting in the ask region skips too
  brain.addCell({ id: 'asker', kind: 'predict.next', region: 'ask', circuit: 'door', policy: { period: 'event' } });
  brain.inject('asker', 0, { kind: 'num', data: S.int(1) });
  assert.match(String(askActive(brain)), /ask/);
  // the hook: every 4 ticks, detached on demand; every 0 attaches nothing
  const b = new Brain({ name: 'dream-hook-' + (++seq), ledger: 'full', pruneEvery: 0 });
  attachMemory(b, { name: 'dream-hook-mem-' + seq + '-' + Math.random().toString(36).slice(2) });
  b.addCell({ id: 'p', kind: 'predict.next', region: 'cognitive', circuit: 'c', policy: { period: 'event' } });
  assert.equal(attachDream(b, { every: 0 }), null);
  const live = attachDream(b, { every: 4, suite: false, mind: null });
  assert.equal(b.dream, live);
  // the hook sees the tick it just ran, 0 first, so nine ticks are t 0 to 8: cycles at 4 and 8
  for (let i = 1; i <= 9; i++) { b.inject('p', 0, { kind: 'num', data: S.int(i) }); b.tick(1); }
  assert.equal(live.stats.cycles, 2);
  assert.ok(live.stats.dreams > 0);
  assert.ok(live.stats.grounded > 0, 'the counter keeps counting, so some dream is grounded: ' + live.summaryLine());
  live.detach();
  b.tick(8);
  assert.equal(live.stats.cycles, 2);
  assert.equal(live.stats.errors, 0, String(live.stats.lastError));
});

test('the daemon holds exactly one import of the region and one call site', () => {
  const src = readFileSync(path.join(HERE, '..', 'daemon', 'run.mjs'), 'utf8');
  assert.equal(src.split("import { attachDream } from '../mind/dream.mjs';").length - 1, 1);
  assert.equal(src.split('attachDream(').length - 1, 1);
  for (const f of ['mind/dream.mjs', 'bench/dream.mjs', 'test/dream.test.mjs']) {
    assert.equal(readFileSync(path.join(HERE, '..', f), 'utf8').includes(String.fromCharCode(0x2014)), false, f + ' holds no em dash');
  }
});
