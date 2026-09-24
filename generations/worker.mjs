// generations/worker.mjs: one worker thread of the evaluation pool. It holds nothing
// between jobs except the task module: every job builds its own Brain from the genome it
// was sent and throws it away, which is why a worker result and a serial result are the
// same number rather than nearly the same number.
import { parentPort, workerData } from 'node:worker_threads';
import { evaluateGenome } from './evaluate.mjs';

const { task, cfg } = workerData;

parentPort.on('message', (msg) => {
  if (msg.type === 'stop') { parentPort.close(); return; }
  if (msg.type !== 'jobs') return;
  const out = [];
  for (const job of JSON.parse(msg.jobs)) {
    try {
      const r = evaluateGenome(job.genome, { task, seeds: job.seeds, cfg });
      out.push({ i: job.i, ok: true, ...r });
    } catch (err) {
      out.push({ i: job.i, ok: false, fitness: 0, descriptors: [0, 1], extras: {}, error: String((err && err.message) || err) });
    }
  }
  parentPort.postMessage({ type: 'results', batch: msg.batch, results: JSON.stringify(out) });
});

parentPort.postMessage({ type: 'ready' });
