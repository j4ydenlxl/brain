// bench/parallel.mjs : the same synthetic relay brain as bench/throughput.mjs, run on the
// parallel runtime. One brain of N cells over 4 regions with K = 8 random out-edges each,
// sharded 1, 2, 4, 8 and 16 ways over worker threads, 50 ticks. Every number printed here
// comes from this run. The machine has 32 threads.
//
// Importing this module registers the bench.relay cell kind and nothing else, which is why
// the spec it produces can name it as the module every shard imports. It only runs the
// bench when it is the program.
// Usage: node bench/parallel.mjs [--sizes 1000,5000] [--ticks 50] [--shards 1,2,4,8,16]
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { availableParallelism } from 'node:os';
import { isMainThread } from 'node:worker_threads';
import { RNG } from '../core/rng.mjs';
import { defineKind, hasKind } from '../core/cell.mjs';
import * as S from '../core/signal.mjs';
import { Cluster, buildBrain } from '../runtime/cluster.mjs';

export const RELAY_MODULE = import.meta.url;
const HERE = path.dirname(fileURLToPath(import.meta.url));

// Identical to the relay in bench/throughput.mjs: bundle what arrived, re-emit it.
if (!hasKind('bench.relay')) defineKind('bench.relay', {
  ports: { in: [{ name: 'in', kinds: ['hv'] }], out: [{ name: 'out', kinds: ['hv'] }] },
  compute: (ins) => { const m = ins[0]; if (!m.length) return [null]; if (m.length === 1) return [{ kind: 'hv', data: m[0].sig.data }]; return [{ kind: 'hv', data: S.bundle(m.map(it => it.sig.data)) }]; },
});

export const REGIONS = ['perception', 'association', 'cognitive', 'motor'];

// The wiring of bench/throughput.mjs build(), expressed as a spec. The RNG is drawn in the
// same order (no draw when the random target is the source itself), so the connectome that
// comes out of this spec is edge for edge the one that bench builds by hand.
export function relaySpec({ cells = 1000, k = 8, seed = 'bench', name = null, ledger = 'off', pruneEvery = 0 } = {}) {
  const n = cells;
  const rng = new RNG('bench:' + n);
  const cellList = new Array(n);
  for (let i = 0; i < n; i++) {
    cellList[i] = { id: 'c' + i, kind: 'bench.relay', region: REGIONS[i % 4], circuit: 'k' + (i % 16), policy: { period: 'event', learn: i % 2 ? 'hebbian' : null } };
  }
  const edges = [];
  for (let i = 0; i < n; i++) for (let e = 0; e < k; e++) {
    const j = rng.int(n);
    if (j === i) continue;
    edges.push({ src: i, srcPort: 0, dst: j, dstPort: 0, w: 0.5 + rng.next(), delay: rng.int(3) });
  }
  return { name: name || 'parallel' + n, seed, ledger, pruneEvery, maxPayloadBytes: S.D, modules: [RELAY_MODULE], cells: cellList, edges };
}

export function relayInjections(n, seedLabel = 'seed') {
  const hv = S.hvFromSeed(seedLabel);
  const list = [];
  for (let i = 0; i < Math.min(n, 64); i++) list.push({ cell: 'c' + i, port: 0, kind: 'hv', data: hv });
  return list;
}

// ---------------------------------------------------------------- the bench
function row(o) { console.log(Object.entries(o).map(([k, v]) => k + '=' + v).join(' ')); }

async function baseline(n, ticks) {
  const spec = relaySpec({ cells: n });
  const b = buildBrain(spec);
  for (const inj of relayInjections(n)) b.inject(inj.cell, inj.port, { kind: inj.kind, data: inj.data });
  const t0 = process.hrtime.bigint();
  b.tick(ticks);
  const seconds = Number(process.hrtime.bigint() - t0) / 1e9;
  return {
    cells: n, shards: 0, ticks, seconds: +seconds.toFixed(3),
    runs: b.stats.runs, signals: b.stats.signals, delivered: b.stats.delivered,
    runsPerSec: Math.round(b.stats.runs / seconds),
    deliveriesPerSec: Math.round(b.stats.delivered / seconds),
    ticksPerSec: +(ticks / seconds).toFixed(2),
    crossMessages: 0, speedup: 1,
  };
}

async function sharded(n, ticks, shards, payload, base) {
  const spec = relaySpec({ cells: n });
  const c = new Cluster(spec, { shards, payload });
  await c.start();
  await c.injectMany(relayInjections(n));
  const t0 = process.hrtime.bigint();
  await c.tick(ticks);
  const seconds = Number(process.hrtime.bigint() - t0) / 1e9;
  const st = await c.stats();
  await c.stop();
  return {
    cells: n, shards, ticks, payload, seconds: +seconds.toFixed(3),
    runs: st.runs, signals: st.signals, delivered: st.delivered,
    runsPerSec: Math.round(st.runs / seconds),
    deliveriesPerSec: Math.round(st.delivered / seconds),
    ticksPerSec: +(ticks / seconds).toFixed(2),
    crossEdges: st.crossEdges, crossMessages: st.crossMessages,
    cloned: st.cloned, sharedMB: +(st.sharedBytes / 1048576).toFixed(1),
    speedup: +(base.seconds / seconds).toFixed(2),
  };
}

async function main() {
  const argv = process.argv.slice(2);
  const arg = (name, dflt) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : dflt; };
  const sizes = String(arg('sizes', '1000,5000')).split(',').map(Number);
  const ticks = Number(arg('ticks', 50));
  const shardCounts = String(arg('shards', '1,2,4,8,16')).split(',').map(Number);

  const results = [];
  console.log('threads=' + availableParallelism() + ' node=' + process.version + ' ticks=' + ticks);
  for (const n of sizes) {
    const base = await baseline(n, ticks);
    row(base); results.push(base);
    for (const s of shardCounts) {
      const r = await sharded(n, ticks, s, 'shared', base);
      row(r); results.push(r);
      if (r.runs !== base.runs || r.signals !== base.signals || r.delivered !== base.delivered) {
        console.log('MISMATCH cells=' + n + ' shards=' + s + ' runs=' + r.runs + '/' + base.runs + ' signals=' + r.signals + '/' + base.signals + ' delivered=' + r.delivered + '/' + base.delivered);
      }
    }
  }
  // What the shared arena buys: the same brain with every payload structured-cloned
  // through the coordinator instead of written to shared memory.
  const cmpSize = sizes[sizes.length - 1], cmpShards = 4;
  const cmpBase = await baseline(cmpSize, ticks);
  for (const payload of ['shared', 'clone']) {
    const r = await sharded(cmpSize, ticks, cmpShards, payload, cmpBase);
    row({ ...r, arm: 'payload' }); results.push({ ...r, arm: 'payload' });
  }

  mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
  writeFileSync(path.join(HERE, 'verdicts', 'parallel.json'), JSON.stringify({
    at: new Date().toISOString(), node: process.version, threads: availableParallelism(),
    ticks, sizes, shardCounts, results,
  }, null, 2));
  console.log('wrote bench/verdicts/parallel.json');
}

// main() is called, never awaited at the top level. This module is the module the spec
// names, so Cluster.start() dynamically imports it; if this file were still evaluating
// (a pending top level await) that import would wait for main() while main() waited for
// the import, and node would exit 13 with an unsettled top level await. Calling without
// awaiting lets module evaluation finish first.
const invoked = isMainThread && process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) main().catch((e) => { console.error(e); process.exitCode = 1; });
