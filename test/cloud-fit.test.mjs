// test/cloud-fit.test.mjs: the organism fits its container (his P13, Board 16 fit item).
// The episodic record was the grower: capacity doubled past the bound and a restore allocated
// min(n, max) * 2. These tests hold the three changes: the bound is never allocated past, a restore
// allocates at most the bound (and a smaller bound keeps exactly what the eviction rule keeps), the
// whole seed passes BRAIN_EPISODES_MAX to its memory, and serve.mjs reads it. No daemon, no model.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EpisodicStore, EPISODIC_DEFAULTS } from '../memory/episodic.mjs';
import { RNG } from '../core/rng.mjs';
import * as S from '../core/signal.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function hv(rng, d) { const k = new Int8Array(d); for (let j = 0; j < d; j++) k[j] = rng.int(2) ? 1 : -1; return k; }

// The eviction rule, written again as a plain list: at the bound the store drops, in one batch,
// cold before warm, then the oldest t, then the lowest position, until three quarters remain.
function modelAppend(list, row, bound) {
  if (list.length >= bound) {
    const keep = Math.floor(bound * 3 / 4);
    const order = list.map((r, pos) => ({ r, pos })).sort((a, b) => (b.r.cold - a.r.cold) || (a.r.t - b.r.t) || (a.pos - b.pos));
    const gone = new Set(order.slice(0, list.length - keep).map((x) => x.pos));
    const kept = list.filter((_, pos) => !gone.has(pos));
    list.length = 0; list.push(...kept);
  }
  list.push(row);
}

test('a store with maxEpisodes 64 never allocates past 64 over 200 inserts and holds what the eviction rule keeps', () => {
  const d = 64, bound = 64;
  const s = new EpisodicStore({ d, maxEpisodes: bound, seed: 'fit' });
  assert.equal(s.cap, 64, 'the starting capacity is min(capacity 1024, maxEpisodes 64)');
  assert.equal(EPISODIC_DEFAULTS.maxEpisodes, 1 << 16, 'the frozen default is unchanged; the option overrides it per store');
  assert.ok(Object.isFrozen(EPISODIC_DEFAULTS));
  const rng = new RNG('fit-200');
  const keys = [], model = [];
  let maxCap = 0, maxKeyBytes = 0;
  for (let i = 0; i < 200; i++) {
    const k = hv(rng, d); keys.push(k);
    s.append({ key: k, t: i, value: { i } });
    modelAppend(model, { i, t: i, cold: 0 }, bound);
    if (i === 99) {
      // cold before warm: everything before t=90 goes cold, then the oldest one held is warmed again,
      // so the rule (cold first) and plain "oldest first" disagree about it
      const c = s.cool(90);
      for (const r of model) if (r.t < 90) r.cold = 1;
      assert.equal(c, model.filter((r) => r.cold).length);
      const oldest = 0;
      assert.equal(s.warm(oldest), true);
      model[0].cold = 0;
    }
    if (i === 112) {
      // the first compaction after the warm (at i=112): the cold t=49..64 left, the warmed t=48 stayed
      const held = new Set(s.values.map((v) => v.i));
      assert.ok(held.has(48) && !held.has(49) && !held.has(64) && held.has(65), 'cold before warm: t=48 held, t=49..64 gone');
    }
    maxCap = Math.max(maxCap, s.cap); maxKeyBytes = Math.max(maxKeyBytes, s.keys.byteLength);
  }
  assert.equal(maxCap, 64, 'capacity never passed the bound');
  assert.equal(maxKeyBytes, 64 * d, 'the key array was never reallocated past bound x d bytes');
  assert.equal(s.cap, 64);
  assert.deepEqual(s.values.map((v) => v.i), model.map((r) => r.i), 'after 200 inserts the store holds exactly the episodes the rule keeps');
  assert.ok(s.stats.compactions > 0 && s.stats.evicted === 200 - s.size());
  // top up to the bound: the store then holds exactly the 64 the rule keeps
  for (let i = 200; s.size() < bound; i++) { const k = hv(rng, d); keys.push(k); s.append({ key: k, t: i, value: { i } }); modelAppend(model, { i, t: i, cold: 0 }, bound); }
  assert.equal(s.size(), 64);
  assert.equal(s.cap, 64);
  assert.deepEqual(s.values.map((v) => v.i), model.map((r) => r.i), 'the 64 held are the 64 the rule keeps');
  // retrieval through the rebuilt index still finds a survivor
  const last = model[model.length - 1].i;
  assert.equal(s.retrieve(keys[last], { k: 1 })[0].value.i, last);
});

test('from() with n 100 and maxEpisodes 64 restores capacity 64 and n 64; a restore never allocates past its bound', () => {
  const d = 64;
  const src = new EpisodicStore({ d, maxEpisodes: 128, seed: 'fit-from' });
  const rng = new RNG('fit-from');
  const keys = [];
  for (let i = 0; i < 100; i++) { const k = hv(rng, d); keys.push(k); src.append({ key: k, t: i, value: { i }, items: ['e' + i] }); }
  assert.equal(src.cool(40), 40);
  assert.equal(src.warm(5), true);
  const j = JSON.parse(JSON.stringify(src.serialize()));
  assert.equal(j.n, 100);

  const r = EpisodicStore.from(j, { maxEpisodes: 64 });
  assert.equal(r.cap, 64);
  assert.equal(r.size(), 64);
  assert.equal(r.maxEpisodes, 64);
  // 36 leave: the 36 oldest cold (t=0..4 and 6..36); t=5 was warmed, so it stays although it is old
  const kept = r.values.map((v) => v.i);
  assert.deepEqual(kept, [5, 37, 38, 39, ...Array.from({ length: 60 }, (_, x) => 40 + x)]);
  for (let id = 0; id < r.size(); id++) assert.equal(S.sim(r.keyAt(id), keys[kept[id]]), 1, 'key of episode ' + kept[id]);
  assert.equal(r.stats.evicted, 36);
  assert.equal(r.describe().cold, 3, 't=37..39 are still cold');
  assert.equal(r.retrieve(keys[70], { k: 1 })[0].value.i, 70);
  assert.equal(r.byItem('e4').length, 0); assert.equal(r.byItem('e5').length, 1);

  // the recorded bound: capacity min(bound, 2n), never min(n, max) * 2 (which was 200 for a bound of 128)
  const same = EpisodicStore.from(j);
  assert.equal(same.maxEpisodes, 128); assert.equal(same.size(), 100);
  assert.ok(same.cap <= 128, 'capacity ' + same.cap + ' at most the bound 128');
  const full = new EpisodicStore({ d, maxEpisodes: 64, seed: 'fit-full' });
  for (let i = 0; i < 64; i++) full.append({ key: hv(rng, d), t: i });
  assert.equal(EpisodicStore.from(full.serialize()).cap, 64, 'a store full at its bound restores at the bound, not twice it');

  // snapshots before 2026-09-17 hold every key in one string: the bound applies to them too
  const legacy = { ...j, keys: S.dataToJSON('hv', src.keys.subarray(0, 100 * d)) };
  const rl = EpisodicStore.from(legacy, { maxEpisodes: 64 });
  assert.equal(rl.size(), 64); assert.equal(rl.cap, 64);
  for (let id = 0; id < rl.size(); id++) assert.equal(S.sim(rl.keyAt(id), keys[kept[id]]), 1);
  assert.throws(() => EpisodicStore.from(j, { maxEpisodes: 'lots' }), /positive number/);
});

test('a tiny brain built through seeds/whole.mjs with BRAIN_EPISODES_MAX 32 never passes capacity 32 over 100 episodes, and a restore takes the bound', async () => {
  const { buildWhole, restoreWhole, episodicBound } = await import('../seeds/whole.mjs');
  const { closeWorld } = await import('../world/index.mjs');
  const shutdown = (b) => {
    try { closeWorld(b); } catch { /* nothing open */ }
    const l = b.whole && b.whole.services && b.whole.services.learning;
    if (l && typeof l.detach === 'function') { try { l.detach(); } catch { /* detached */ } }
  };
  assert.equal(episodicBound({}, {}), null);
  assert.equal(episodicBound({}, { BRAIN_EPISODES_MAX: '32' }), 32);
  assert.equal(episodicBound({ episodic: { maxEpisodes: 40 } }, { BRAIN_EPISODES_MAX: '32' }), 40, 'the option wins over the environment');
  assert.throws(() => episodicBound({}, { BRAIN_EPISODES_MAX: 'many' }), /positive integer/);

  const dir = mkdtempSync(path.join(tmpdir(), 'cloud-fit-'));
  const saved = process.env.BRAIN_EPISODES_MAX;
  let brain = null, b2 = null, b3 = null;
  try {
    process.env.BRAIN_EPISODES_MAX = '32';
    ({ brain } = buildWhole({ majors: 4, substrateUnits: 64, ledger: 'summary', dir, name: 'cloud-fit-tiny', seed: 'cloud-fit', mindText: 'a tiny organism for the fit test. '.repeat(20) }));
    const ep = brain.memory.episodic;
    assert.equal(ep.maxEpisodes, 32);
    assert.ok(ep.cap <= 32);
    const rng = new RNG('cloud-fit-tiny');
    let maxCap = ep.cap;
    brain.tick(20);
    for (let i = 0; i < 100; i++) {
      brain.memory.episodic.append({ key: hv(rng, ep.d), t: brain.clock.t, value: { i } });
      if (i % 10 === 0) brain.tick(1);
      maxCap = Math.max(maxCap, brain.memory.episodic.cap);
    }
    assert.ok(maxCap <= 32, 'capacity peaked at ' + maxCap);
    assert.ok(brain.memory.episodic.size() <= 32 && brain.memory.episodic.size() >= 24);
    brain.snapshot(dir);

    process.env.BRAIN_EPISODES_MAX = '16';
    b2 = restoreWhole(dir, { ledger: 'off' }).brain;
    assert.equal(b2.memory.episodic.maxEpisodes, 16, 'a restore takes the bound named for this run');
    assert.equal(b2.memory.episodic.size(), 16);
    assert.ok(b2.memory.episodic.cap <= 16);
    b3 = restoreWhole(dir, { ledger: 'off', episodic: { maxEpisodes: 32 } }).brain;
    assert.equal(b3.memory.episodic.maxEpisodes, 32);
    assert.equal(b3.memory.episodic.size(), brain.memory.episodic.size(), 'under its own bound nothing leaves on restore');
  } finally {
    if (saved === undefined) delete process.env.BRAIN_EPISODES_MAX; else process.env.BRAIN_EPISODES_MAX = saved;
    for (const b of [brain, b2, b3]) if (b) shutdown(b);
    rmSync(dir, { recursive: true, force: true });
  }
});

test('serve.mjs reads BRAIN_EPISODES_MAX; compose.yaml and the Dockerfile declare a bound whose keys stay under 128 MB', async () => {
  const { episodicOptions, config, DEFAULT_EPISODES_MAX } = await import('../bin/serve.mjs');
  assert.deepEqual(episodicOptions({}), { maxEpisodes: DEFAULT_EPISODES_MAX, from: 'default' });
  assert.deepEqual(episodicOptions({ BRAIN_EPISODES_MAX: '4096' }), { maxEpisodes: 4096, from: 'BRAIN_EPISODES_MAX' });
  assert.deepEqual(episodicOptions({ BRAIN_EPISODES_MAX: ' ' }), { maxEpisodes: DEFAULT_EPISODES_MAX, from: 'default' });
  assert.throws(() => episodicOptions({ BRAIN_EPISODES_MAX: 'lots' }), /BRAIN_EPISODES_MAX must be an integer/);
  assert.throws(() => episodicOptions({ BRAIN_EPISODES_MAX: '8' }), /at least 16/);
  assert.equal(config({ BRAIN_STATE_DIR: '/state', BRAIN_EPISODES_MAX: '2048' }).episodesMax, 2048);
  assert.equal(config({ BRAIN_STATE_DIR: '/state' }).episodesMax, DEFAULT_EPISODES_MAX);

  const compose = readFileSync(path.join(ROOT, 'compose.yaml'), 'utf8');
  const docker = readFileSync(path.join(ROOT, 'Dockerfile'), 'utf8');
  const c = Number((/^\s+BRAIN_EPISODES_MAX:\s*"(\d+)"\s*$/m.exec(compose) || [])[1]);
  const dk = Number((/^\s+BRAIN_EPISODES_MAX=(\d+)\s*\\?\s*$/m.exec(docker) || [])[1]);
  assert.equal(c, DEFAULT_EPISODES_MAX, 'compose.yaml names the same bound serve.mjs defaults to');
  assert.equal(dk, DEFAULT_EPISODES_MAX, 'so does the Dockerfile');
  const { composeEnv } = await import('../bench/cloud.mjs');
  assert.equal(composeEnv().BRAIN_EPISODES_MAX, String(c), 'the bench reads the same value from compose.yaml');
  const keyBytes = c * 8192; // Int8 lanes of core/signal.mjs D
  assert.equal(S.D, 8192);
  assert.ok(keyBytes < 128 * 1048576, c + ' keys x 8192 lanes = ' + keyBytes + ' bytes, under 128 MB');
});

// ---------------------------------------------------------------------------------------------
// Board 13 fit (his P13): the organism lives in a 448 MB rss budget. Three changes, each held
// here. (a) memory/knowledge.mjs holds at most its resident cap (BRAIN_KNOWLEDGE_RESIDENT_MB,
// default 64) and residentGuard() counts the buffers a store reaches, so a store that ignores its
// cap is caught. (b) daemon/run.mjs guards each self round (run, prune or defer against
// BRAIN_SELF_FLOOR_MB) and holds the tick only for the synchronous part of a round, sized to a
// budget. (c) the self-code step starts only when rss plus its measured need stays under the
// floor, in a child under tools/budget.mjs; a refused start is printed and counted.
const FIT_TMP = mkdtempSync(path.join(tmpdir(), 'cloud-fit-b13-'));
process.on('exit', () => { try { rmSync(FIT_TMP, { recursive: true, force: true }); } catch { /* the OS cleans tmp */ } });
let wiki50 = null;
async function wiki50Store() {
  if (!wiki50) {
    const W = await import('../tools/ingest-wiki.mjs');
    wiki50 = await W.ingest({ dump: path.join(ROOT, 'test', 'fixtures', 'knowledge', 'wiki50.xml.bz2'), store: path.join(FIT_TMP, 'wiki50'), workers: 2, heldout: { seed: 'cloud-fit', every: 3 } });
  }
  return wiki50;
}

test('the knowledge store holds at most its cap: paged answers what whole answers under a cap a quarter of the index, the census prints the cap, trim releases, and a store that ignores its cap is caught', async () => {
  const K = await import('../memory/knowledge.mjs');
  const { wiki50Articles } = await import('./fixtures/knowledge/wiki50.mjs');
  // the cap: the option, else BRAIN_KNOWLEDGE_RESIDENT_MB, else 64 MB
  assert.deepEqual(K.residentCap({}, {}), { bytes: 64 * 1048576, mb: 64, from: 'default' });
  assert.equal(K.residentCap({}, { BRAIN_KNOWLEDGE_RESIDENT_MB: '8' }).bytes, 8 * 1048576);
  assert.equal(K.residentCap({}, { BRAIN_KNOWLEDGE_RESIDENT_MB: '8' }).from, 'BRAIN_KNOWLEDGE_RESIDENT_MB');
  assert.equal(K.residentCap({ residentMb: 2 }, { BRAIN_KNOWLEDGE_RESIDENT_MB: '8' }).bytes, 2 * 1048576, 'the option wins over the environment');
  assert.throws(() => K.residentCap({}, { BRAIN_KNOWLEDGE_RESIDENT_MB: 'lots' }), /positive number of MB/);
  assert.equal(K.RESIDENT_DEFAULT_MB, 64);

  const r = await wiki50Store();
  const whole = K.KnowledgeStore.open(r.store, { residentMb: 256 });
  const capMb = Math.max(0.1, whole.indexBytes / 4 / 1048576);
  const paged = K.KnowledgeStore.open(r.store, { residentMb: capMb });
  const leaky = K.KnowledgeStore.open(r.store, { residentMb: capMb });
  try {
    assert.equal(whole.mode, 'whole');
    assert.equal(paged.mode, 'paged');
    assert.ok(paged.capBytes < whole.indexBytes / 3, 'the cap ' + paged.capBytes + ' is a fraction of the index ' + whole.indexBytes);
    assert.equal(K.knowledgeCensus().length, 3, 'the census lists every open store');
    const arts = wiki50Articles();
    const ask = (s, a) => {
      const q = 'What is ' + a.title + '?';
      return JSON.stringify([s.recall(q).facts.map((f) => [f.item, f.text, f.sim]), s.answer(q).answers.map((x) => [x.np, x.kind, x.score]), s.locate(a.title, 'where').answers.map((x) => [x.np, x.item, x.score])]);
    };
    let same = 0, maxResident = 0, guardOk = 0;
    for (const a of arts) {
      if (ask(paged, a) === ask(whole, a)) same++;
      maxResident = Math.max(maxResident, paged.residentBytes());
      if (K.residentGuard(paged).ok) guardOk++;
    }
    const c = paged.census();
    console.log('[fit] knowledge: ' + same + ' of ' + arts.length + ' queries answered identically, paged under cap ' + c.capBytes + ' bytes (' + c.capMb + ' MB) of an index of ' + c.indexBytes + ' bytes; resident peak ' + maxResident + ', census peak ' + c.peakBytes + ', reads ' + c.reads + ', evictions ' + c.evictions + '; guard ok ' + guardOk + ' of ' + arts.length);
    assert.equal(same, arts.length, 'recall, answer and locate are equal, query for query');
    assert.ok(maxResident <= paged.capBytes && c.peakBytes <= paged.capBytes, 'resident peak ' + maxResident + ' and census peak ' + c.peakBytes + ' stay under the cap ' + paged.capBytes);
    assert.equal(guardOk, arts.length, 'the guard, counting buffers, agrees after every query');
    assert.ok(c.evictions > 0 && c.reads > 0, 'the cap bound: segments were evicted (' + c.evictions + ')');
    for (const k of ['mode', 'residentBytes', 'capBytes', 'capMb', 'evictions', 'reads', 'peakBytes', 'trims']) assert.ok(k in c, 'the census carries ' + k);

    // trim: what the daemon's guard prunes with; the store reads back what it needs after
    const rel = paged.releasableBytes();
    assert.ok(rel > 0);
    assert.equal(paged.trim(), rel);
    assert.equal(paged.residentBytes(), paged.stampBytes, 'after a trim only the stamps are resident');
    assert.equal(paged.census().trims, 1);
    assert.equal(whole.trim(), 0, 'a whole store has nothing to trim');
    assert.equal(ask(paged, arts[5]), ask(whole, arts[5]), 'a trimmed store still answers the same');

    // planted: a store that ignores its cap (its cache never evicts) and whose own counter lies
    leaky._cache.cap = Number.MAX_SAFE_INTEGER;
    leaky.residentBytes = () => 0;
    for (const a of arts) ask(leaky, a);
    const g1 = K.residentGuard(leaky);
    assert.equal(g1.ok, false, 'the ignored cap alone is caught: ' + g1.why);
    // and a whole file copy stashed on a property of its own is counted on top
    leaky.sidecar = { copy: { sigs: new Uint32Array(readFileSync(path.join(r.store, 'sigs.bin')).buffer.slice(0)) } };
    const g = K.residentGuard(leaky);
    assert.equal(g.heldBytes, g1.heldBytes + leaky.sidecar.copy.sigs.buffer.byteLength);
    console.log('[fit] planted store: census says residentBytes ' + leaky.census().residentBytes + ', the guard counted ' + g.heldBytes + ' bytes against the cap ' + g.capBytes + ': ' + g.why);
    assert.equal(leaky.census().residentBytes, 0, 'the planted store reports nothing held');
    assert.equal(g.ok, false, 'the guard does not read the store counters: ' + g.why);
    assert.ok(g.heldBytes > g.capBytes);
    assert.match(g.why, /OVER the cap/);
  } finally {
    whole.close(); paged.close(); leaky.close();
  }
  assert.equal(K.knowledgeCensus().length, 0, 'a closed store leaves the census');
});

test('the self round guard, the hold sizing and the self-code floor decide from the numbers they are given', async () => {
  const R = await import('../daemon/run.mjs');
  assert.equal(R.FIT_DEFAULTS.selfFloorMb, 380);
  assert.equal(R.FIT_DEFAULTS.selfHoldMs, 1000);
  assert.deepEqual(R.selfFloorMb({}, {}), { mb: 380, from: 'default' });
  assert.deepEqual(R.selfFloorMb({}, { BRAIN_SELF_FLOOR_MB: '300' }), { mb: 300, from: 'BRAIN_SELF_FLOOR_MB' });
  assert.equal(R.selfFloorMb({ selfFloorMb: 200 }, { BRAIN_SELF_FLOOR_MB: '300' }).mb, 200);
  assert.throws(() => R.selfFloorMb({}, { BRAIN_SELF_FLOOR_MB: 'x' }), /positive number/);
  assert.equal(R.selfHoldMs({}, {}), 1000);
  assert.equal(R.selfHoldMs({}, { BRAIN_SELF_HOLD_MS: '200' }), 200);
  assert.equal(R.selfCodeNeedMb({}, {}).mb, 0, 'unmeasured, the need is unknown and the start is bounded by its cap');

  assert.equal(R.selfRoundGuard({ rssMb: 300, floorMb: 380, releasableMb: 50 }).decision, 'run');
  const pr = R.selfRoundGuard({ rssMb: 400, floorMb: 380, releasableMb: 30 });
  assert.equal(pr.decision, 'prune'); assert.match(pr.why, /rss 400 MB is over the floor 380 MB/);
  assert.equal(R.selfRoundGuard({ rssMb: 450, floorMb: 380, releasableMb: 30 }).decision, 'defer');
  assert.equal(R.selfRoundGuard({ rssMb: 381, floorMb: 380, releasableMb: 0 }).decision, 'defer', 'nothing to prune: defer');

  assert.equal(R.holdCandidates({ max: 4 }), 1, 'no hold measured yet: one candidate');
  assert.equal(R.holdCandidates({ holdMs: 484, trials: 1, budgetMs: 1000, max: 4 }), 2, '242 ms an arm: 3 arms fit 900 ms, one is the control');
  assert.equal(R.holdCandidates({ holdMs: 100, trials: 1, budgetMs: 1000, max: 4 }), 4, 'capped at max');
  assert.equal(R.holdCandidates({ holdMs: 3000, trials: 3, budgetMs: 1000, max: 4 }), 1, 'over budget: never below one');
  assert.equal(R.holdCandidates({ holdMs: 484, trials: 1, budgetMs: 200, max: 4 }), 1);

  // the hold plan sizes a round by the live tick cost measured just before it
  const p0 = R.holdPlan({ msPerTick: null, window: 48, max: 4 });
  assert.equal(p0.decision, 'run'); assert.equal(p0.candidates, 1); assert.equal(p0.window, 48);
  const p1 = R.holdPlan({ msPerTick: 1, window: 48, k: 1, budgetMs: 1000, max: 4 });
  assert.equal(p1.decision, 'run'); assert.equal(p1.candidates, 4, '48 ms an arm: 18 arms fit 900 ms, capped at 4'); assert.equal(p1.predictMs, 240);
  const p2 = R.holdPlan({ msPerTick: 1.2, window: 48, k: 2, budgetMs: 200, max: 4 });
  assert.equal(p2.decision, 'run'); assert.equal(p2.candidates, 1); assert.equal(p2.window, 37, 'the window shrinks to fit 180 ms at 2 arms');
  assert.ok(p2.predictMs <= 180, 'planned ' + p2.predictMs + ' ms');
  const p3 = R.holdPlan({ msPerTick: 35.5, window: 48, k: 1.2, budgetMs: 200, max: 4 });
  assert.equal(p3.decision, 'defer'); assert.equal(p3.candidates, 0); assert.match(p3.why, /shortest window, 12 ticks, would hold 1022 ms, over 200 ms/);
  assert.equal(R.holdPlan({ msPerTick: 1, window: 48, k: 1, budgetMs: 1000, max: 1 }).candidates, 1, 'the guard ceiling (a prune) holds');
  assert.equal(R.medianOf([]), null); assert.equal(R.medianOf([3, 1, 600]), 3, 'one checkpoint step does not set the tick cost'); assert.equal(R.medianOf([1, 2, 3, 4]), 2.5);

  const ok = R.selfCodeFloor({ rssMb: 300, needMb: 50, floorMb: 380, needFrom: 'measured' });
  assert.equal(ok.ok, true); assert.equal(ok.capMb, 80);
  const no = R.selfCodeFloor({ rssMb: 340, needMb: 329, floorMb: 380, needFrom: 'measured at t=1 (exit)' });
  assert.equal(no.ok, false); assert.match(no.why, /rss 340 MB \+ need 329 MB \(measured at t=1 \(exit\)\) = 669 MB, over the floor 380 MB/);

  assert.equal(R.selfCodeResult('noise\nmore noise'), null);
  const line = R.SELF_CODE_MARK + JSON.stringify({ ok: true, result: { ok: true, dry: true }, maxRssMb: 82 });
  assert.deepEqual(R.selfCodeResult('x\n' + R.SELF_CODE_MARK + '{"ok":false}\n' + line + '\n'), { ok: true, result: { ok: true, dry: true }, maxRssMb: 82 }, 'the last marked line wins');
  assert.equal(R.selfCodeResult(R.SELF_CODE_MARK + '{broken'), null);
});

// the live organism's clock, sampled every 25 ms through its control /health (the same event loop:
// a blocked loop delays the sample, a paused runner freezes t; either shows as a stall)
async function sampleClock(url, into, stop) {
  while (!stop.done) {
    try { const j = await (await fetch(url + '/health')).json(); into.push([performance.now(), j.result.t]); } catch { /* not up yet or closing */ }
    await new Promise((res) => setTimeout(res, 25));
  }
}
function longestStall(samples) {
  let last = null, lastAt = null, worst = 0;
  for (const [w, t] of samples) {
    if (last === null || t !== last) { if (lastAt !== null) worst = Math.max(worst, w - lastAt); last = t; lastAt = w; }
  }
  return Math.round(worst);
}

test('two self rounds under a 200 ms hold budget: the tick advances at least once a second through both', async () => {
  const { live } = await import('../daemon/run.mjs');
  const { layout } = await import('../cli/state.mjs');
  const saved = process.env.BRAIN_STATE_DIR;
  process.env.BRAIN_STATE_DIR = path.join(FIT_TMP, 'state-rounds');
  const name = 'fit-rounds', lines = [], samples = [], stop = { done: false };
  let sampler = null, stopAsked = false, stoppedAt = null;
  const askStop = async () => {
    if (stopAsked) return; stopAsked = true; stoppedAt = performance.now();
    const ctl = JSON.parse(readFileSync(path.join(layout(name).dir, 'control.json'), 'utf8'));
    await fetch(ctl.url + '/rpc', { method: 'POST', headers: { 'content-type': 'application/json', 'x-brain-token': ctl.token }, body: JSON.stringify({ op: 'stop', args: { reason: 'two rounds' } }) });
  };
  try {
    const p = await live({
      name, seed: 'cloud-fit', majors: 4, substrateUnits: 64, checkpointEvery: 400, loopEvery: 0, genEvery: 0, selfCodeEvery: 0,
      selfEvery: 400, selfHoldMs: 200, selfFloorMb: 1e6, selfCandidates: 4, wallMs: 100_000, benchFlagDir: path.join(FIT_TMP, 'flags-none'),
      out: (l) => {
        const s = String(l); lines.push(s);
        const m = /^\[live\] control (http:\/\/\S+)/.exec(s);
        if (m && !sampler) sampler = sampleClock(m[1], samples, stop);
        // the stop is asked 1.5 s after the second hold, so the samples that follow it are in the window
        if (/^\[self\] round 2 held the tick/.test(s)) setTimeout(() => askStop().catch(() => {}), 1500);
      },
    });
    stop.done = true; await sampler;
    const holds = lines.filter((s) => /^\[self\] round \d+ held the tick/.test(s));
    for (const h of holds) console.log(h);
    // the window: from the first sample to the stop request, 1.5 s after the second round (after
    // it the organism winds down)
    const win = samples.filter(([w]) => stoppedAt === null || w <= stoppedAt);
    const stall = longestStall(win);
    const span = win.length ? Math.round(win[win.length - 1][0] - win[0][0]) : 0;
    console.log('[fit] tick sampled ' + win.length + ' times over ' + span + ' ms through ' + holds.length + ' rounds: the longest the tick stood still was ' + stall + ' ms (bar: under 1000); holds ' + JSON.stringify(p.fit.holds));
    assert.ok(holds.length >= 2, 'two rounds ran: ' + holds.length);
    assert.ok(p.fit.guard.run >= 2 && p.fit.guard.defer === 0, 'the memory guard let every round run under a floor of 1e6 MB');
    // a round the hold plan defers (the tick grew too costly for the budget) holds nothing and prints why
    const planDefers = lines.filter((s) => /^[self] round deferred at t=d+: a tick costs/.test(s)).length;
    assert.equal(planDefers, p.fit.plan.defers, 'every plan defer printed');
    assert.equal(p.fit.holdBudgetMs, 200);
    assert.ok(win.length >= 20, 'sampled the clock ' + win.length + ' times');
    assert.ok(stall < 1000, 'the tick stood still ' + stall + ' ms at most');
    assert.ok(p.fit.holds.maxMs < 1000, 'no round held the tick a second: ' + p.fit.holds.maxMs + ' ms');
  } finally {
    stop.done = true;
    if (saved === undefined) delete process.env.BRAIN_STATE_DIR; else process.env.BRAIN_STATE_DIR = saved;
  }
});

test('a self-code start the floor refuses is printed with its numbers and counted in the census', async () => {
  const { live, fitCensus } = await import('../daemon/run.mjs');
  const saved = process.env.BRAIN_STATE_DIR;
  process.env.BRAIN_STATE_DIR = path.join(FIT_TMP, 'state-floor');
  const lines = [];
  try {
    const p = await live({
      name: 'fit-floor', seed: 'cloud-fit', majors: 4, substrateUnits: 64, checkpointEvery: 100, loopEvery: 10, selfEvery: 0, genEvery: 0,
      selfCodeEvery: 50, selfCodeDry: true, selfCodeSources: ['mutants'], selfCodeNeedMb: 1e6, ticks: 220, benchFlagDir: path.join(FIT_TMP, 'flags-none'),
      out: (l) => lines.push(String(l)),
    });
    const refused = lines.filter((s) => /^\[self-code\] refused at t=\d+: rss \d+ MB \+ need 1000000 MB/.test(s));
    console.log(refused[0]);
    assert.ok(refused.length >= 1, 'a refusal is printed with rss, the need and the floor');
    assert.ok(p.fit.selfCode.refusals >= 1 && p.fit.selfCode.starts === 0, JSON.stringify(p.fit.selfCode));
    assert.match(p.fit.selfCode.lastRefusal.why, /over the floor 380 MB/);
    const c = fitCensus();
    assert.equal(c.selfCode.refusals, p.fit.selfCode.refusals, 'the census bin/serve.mjs sends carries the same count');
    assert.equal(c.floorMb, 380);
  } finally {
    if (saved === undefined) delete process.env.BRAIN_STATE_DIR; else process.env.BRAIN_STATE_DIR = saved;
  }
});
