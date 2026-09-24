// cli/bench.mjs: MEASURED, NEVER ASSUMED. Every number this prints came out of a run that
// just happened on this machine. The arms are chosen to separate the costs a researcher has to
// trade against each other: the bare tick loop, the substrate under load, what structural
// growth costs per tick, what observability costs per tick, and what persistence costs.
import { mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import os from 'node:os';
import path from 'node:path';
import '../cells/basic.mjs';
import { Brain } from '../core/brain.mjs';
import { seedBasic } from '../seeds/basic.mjs';

// The brain calls coact.observe(fired, connectome) on every tick and that is O(k^2) in the
// number of cells that fired. Arms that are not measuring growth swap in this null tracker so
// the number they report is about the thing they name. Arm "growth" measures the difference.
const NULL_COACT = { observe: () => [], decay: () => {} };

function buildChain({ width, depth, ledger = 'off', dir = null, growth = false }) {
  const b = new Brain({ name: 'bench-chain', seed: 'bench', ledger, dir, pruneEvery: 0 });
  if (!growth) b.coact = NULL_COACT;
  b.addRegion('bench', { doc: 'synthetic propagation chains' });
  for (let c = 0; c < width; c++) {
    const src = 'src' + c, thr = 'thr' + c;
    b.addCell({ id: src, kind: 'source.counter', region: 'bench', circuit: 'chain' + c, policy: { period: 1 } });
    b.addCell({ id: thr, kind: 'evaluate.threshold', region: 'bench', circuit: 'chain' + c, params: { threshold: -1, direction: 'above' }, policy: { period: 'event' } });
    b.connect(src, 'out', thr, 'in', { delay: 1 });
    let prev = thr;
    for (let d = 0; d < depth; d++) {
      const id = 'r' + c + '.' + d;
      b.addCell({ id, kind: 'route.key', region: 'bench', circuit: 'chain' + c, params: { keyField: 'key', table: {}, dflt: 0 }, policy: { period: 'event' } });
      b.connect(prev, prev === thr ? 'out' : 'a', id, 'in', { delay: 1 });
      prev = id;
    }
    const sink = 'sink' + c;
    b.addCell({ id: sink, kind: 'sink.log', region: 'bench', circuit: 'chain' + c, policy: { period: 'event' } });
    b.connect(prev, 'a', sink, 'in', { delay: 1 });
  }
  return b;
}

function timeTicks(brain, ticks, chunk = 500) {
  const before = { runs: brain.stats.runs, signals: brain.stats.signals, delivered: brain.stats.delivered };
  const t0 = performance.now();
  let left = ticks;
  while (left > 0) { const n = Math.min(chunk, left); brain.tick(n); left -= n; }
  const wall = performance.now() - t0;
  return {
    ticks, wallMs: r(wall),
    ticksPerSec: Math.round(ticks / (wall / 1000)),
    cellRuns: brain.stats.runs - before.runs,
    runsPerSec: Math.round((brain.stats.runs - before.runs) / (wall / 1000)),
    signals: brain.stats.signals - before.signals,
    delivered: brain.stats.delivered - before.delivered,
    deliveriesPerSec: Math.round((brain.stats.delivered - before.delivered) / (wall / 1000)),
  };
}
const r = (x, n = 2) => Number(x.toFixed(n));

export async function runBench({ ticks = 5000, width = 8, depth = 12, seedTicks = 20_000 } = {}) {
  const arms = [];
  const dir = mkdtempSync(path.join(tmpdir(), 'brain-bench-'));
  try {
    // 1. the real seed brain, bare tick loop with periodic sensory input
    {
      const b = seedBasic({ name: 'bench-seed', ledger: 'off' });
      b.coact = NULL_COACT;
      b.tick(200); // warm up the tick wheel and the JIT
      const before = { runs: b.stats.runs, delivered: b.stats.delivered };
      const t0 = performance.now();
      let done = 0;
      while (done < seedTicks) {
        b.inject('p.encode', 'in', { kind: 'event', data: { text: 'the quick brown fox jumps' } });
        const n = Math.min(64, seedTicks - done);
        b.tick(n); done += n;
        b.takeOutbox();
      }
      const wall = performance.now() - t0;
      arms.push({
        arm: 'seed', detail: b.cells.length + ' cells, ' + b.connectome.size() + ' edges, ledger off, one text event every 64 ticks',
        ticks: seedTicks, wallMs: r(wall), ticksPerSec: Math.round(seedTicks / (wall / 1000)),
        cellRuns: b.stats.runs - before.runs, runsPerSec: Math.round((b.stats.runs - before.runs) / (wall / 1000)),
        delivered: b.stats.delivered - before.delivered,
      });
    }
    // 2. the substrate under load: width x depth propagation chains, ledger off, growth off
    let chainBrain = null;
    {
      const b = buildChain({ width, depth });
      b.tick(200);
      const m = timeTicks(b, ticks);
      arms.push({ arm: 'propagate', detail: b.cells.length + ' cells, ' + b.connectome.size() + ' edges, ledger off, growth off', ...m });
      chainBrain = b;
    }
    // 3. what structural growth costs: the same shape with co-activation tracking live
    {
      const n = Math.max(100, Math.round(ticks / 20));
      const off = buildChain({ width, depth });
      off.tick(100);
      const a = timeTicks(off, n);
      const on = buildChain({ width, depth, growth: true });
      on.tick(100);
      const bm = timeTicks(on, n);
      arms.push({
        arm: 'growth', detail: 'co-activation on vs off, same shape, ' + n + ' ticks each; grew ' + on.stats.grown + ' edges',
        ticks: n, wallMs: bm.wallMs, ticksPerSec: bm.ticksPerSec, cellRuns: bm.cellRuns, runsPerSec: bm.runsPerSec,
        baselineTicksPerSec: a.ticksPerSec,
        slowdown: a.ticksPerSec > 0 ? r(a.ticksPerSec / Math.max(1, bm.ticksPerSec)) : null,
      });
    }
    // 4. what observability costs: ledger in memory, and ledger written to disk
    {
      const n = Math.max(100, Math.round(ticks / 25));
      const mem = buildChain({ width, depth, ledger: 'full' });
      mem.tick(50);
      const m1 = timeTicks(mem, n);
      arms.push({ arm: 'ledger-ring', detail: 'ledger full, in memory ring only, ' + mem.ledger.seq + ' events', ...m1, eventsPerTick: r(mem.ledger.seq / (n + 50)) });
      const ldir = path.join(dir, 'ledger-arm');
      const disk = buildChain({ width, depth, ledger: 'full', dir: ldir });
      disk.tick(50);
      const m2 = timeTicks(disk, n);
      disk.ledger.flush();
      let bytes = 0;
      try { bytes = statSync(path.join(ldir, 'ledger', 'ledger.jsonl')).size; } catch { bytes = 0; }
      arms.push({ arm: 'ledger-disk', detail: 'ledger full, JSONL to disk, ' + disk.ledger.seq + ' events, ' + (bytes / 1e6).toFixed(2) + ' MB', ...m2, bytes });
    }
    // 5. persistence: snapshot and restore the loaded chain brain
    {
      const b = chainBrain;
      b.takeOutbox();
      const sdir = path.join(dir, 'snap');
      const t0 = performance.now();
      const file = b.snapshot(sdir);
      const snapMs = performance.now() - t0;
      const bytes = statSync(file).size;
      const t1 = performance.now();
      const c = Brain.restore(sdir, { ledger: 'off' });
      const restoreMs = performance.now() - t1;
      arms.push({
        arm: 'persist', detail: b.cells.length + ' cells, ' + b.connectome.size() + ' edges, t=' + b.clock.t,
        snapshotMs: r(snapMs), restoreMs: r(restoreMs), bytes,
        bytesPerCell: Math.round(bytes / b.cells.length),
        identical: c.clock.t === b.clock.t && c.cells.length === b.cells.length && c.connectome.size() === b.connectome.size(),
      });
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  return {
    node: process.version,
    platform: process.platform + ' ' + process.arch,
    cpus: os.cpus().length,
    cpu: os.cpus()[0]?.model || 'unknown',
    memGB: r(os.totalmem() / 1e9, 1),
    config: { ticks, width, depth, seedTicks },
    arms,
  };
}
