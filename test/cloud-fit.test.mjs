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
