// daemon/generations-worker.mjs: organism generations in their own thread. The organism
// genome builder patches seeds/organism.mjs rosters in place, so evolution never runs in
// the module instance that hosts the live brain. The daemon posts {op:'step'} and gets the
// generation row, the archive elite and the summary back; every step is checkpointed.
import { parentPort, workerData } from 'node:worker_threads';
import { Epochs } from '../generations/epochs.mjs';

const { dir, seed = 'whole:epochs', popSize = 6, ticks = 96, windows = 2, scale = null } = workerData || {};
let epochs = null;

function boot() {
  epochs = Epochs.resume(dir);
  const resumed = !!epochs;
  if (!epochs) {
    epochs = new Epochs({ seed, dir, popSize, ticks, windows, checkpointEvery: 1, suites: false, emit: false, ...(scale ? { scale } : {}) });
    epochs.init();
  }
  return { resumed, generation: epochs.generation, dir };
}

function elite() {
  const b = epochs.archive.best();
  return b ? { id: b.id, key: b.key, fitness: b.fitness, gen: b.gen, cells: b.cells, edges: b.edges, genome: b.genome } : null;
}

parentPort.on('message', (msg) => {
  const id = msg && msg.id;
  try {
    if (msg.op === 'boot') parentPort.postMessage({ id, ok: true, boot: boot() });
    else if (msg.op === 'step') {
      const row = epochs.step();
      epochs.checkpoint();
      parentPort.postMessage({ id, ok: true, row, best: elite(), summary: epochs.summary() });
    } else if (msg.op === 'summary') parentPort.postMessage({ id, ok: true, summary: epochs ? epochs.summary() : null, best: epochs ? elite() : null });
    else if (msg.op === 'stop') { parentPort.postMessage({ id, ok: true }); parentPort.close(); }
    else parentPort.postMessage({ id, ok: false, error: 'unknown op ' + String(msg && msg.op) });
  } catch (err) {
    parentPort.postMessage({ id, ok: false, error: String((err && err.stack) || err) });
  }
});
