// generations/evaluate.mjs: FITNESS, in parallel. A population is hundreds of independent
// episodes with no shared state, which is the one shape that parallelises without a lock.
// The pool is sized to os.availableParallelism() and hands out small chunks, so a genome
// that grew twenty cells does not stall a thread while the others sit idle.
//
// The contract that matters: evaluateGenome is pure. The same genome JSON and the same
// seeds produce the same fitness in a worker and on the main thread, bit for bit, because
// every source of randomness in an episode comes from core/rng.mjs seeded by those inputs.
import os from 'node:os';
import { Worker } from 'node:worker_threads';
import { getTask } from './tasks/index.mjs';
import { genomeFromJSON, genomeToJSON } from './genome.mjs';

export function workerCount() { return os.availableParallelism ? os.availableParallelism() : (os.cpus().length || 1); }

// The single unit of work: one genome, one list of episode seeds, one fitness.
export function evaluateGenome(genomeJSON, { task, seeds, cfg = null }) {
  const t = getTask(task);
  const g = genomeFromJSON(genomeJSON);
  const r = t.evaluate(g, { seeds, cfg: cfg || t.config });
  return { fitness: r.fitness, descriptors: r.descriptors, extras: r.extras };
}

// Serial reference path. The determinism test runs a population through this and through
// the pool and asserts the two arrays are equal.
export function evaluateSerial(genomes, { task, seeds, cfg = null }) {
  return genomes.map((g) => ({ i: 0, ok: true, ...evaluateGenome(genomeToJSON(g), { task, seeds, cfg }) }))
    .map((r, i) => ({ ...r, i }));
}

export class Pool {
  constructor({ task, cfg = null, size = workerCount(), chunk = 6 } = {}) {
    if (!task) throw new Error('pool: needs a task name');
    this.task = task;
    this.cfg = cfg || getTask(task).config;
    this.size = Math.max(1, size);
    this.chunk = Math.max(1, chunk);
    this.workers = [];
    this.idle = [];
    this.closed = false;
    this.batch = 0;
    this.stats = { genomes: 0, episodes: 0, batches: 0, errors: 0 };
    this._start();
  }

  _start() {
    const url = new URL('./worker.mjs', import.meta.url);
    for (let i = 0; i < this.size; i++) {
      const w = new Worker(url, { workerData: { task: this.task, cfg: this.cfg } });
      w.on('error', (err) => { this._fail(err); });
      this.workers.push(w);
    }
  }
  _fail(err) {
    this.stats.errors++;
    if (this._reject) this._reject(err);
  }

  // Evaluate every genome. Returns results in the SAME order as the input array.
  evaluate(genomes, { seeds }) {
    if (this.closed) throw new Error('pool: closed');
    if (!genomes.length) return Promise.resolve([]);
    const jobs = genomes.map((g, i) => ({ i, genome: genomeToJSON(g), seeds }));
    const results = new Array(genomes.length);
    let next = 0, outstanding = 0, done = 0;
    this.batch++;
    this.stats.batches++;
    this.stats.genomes += genomes.length;
    this.stats.episodes += genomes.length * seeds.length;

    return new Promise((resolve, reject) => {
      this._reject = reject;
      const listeners = new Map();
      const finish = () => {
        for (const [w, fn] of listeners) w.off('message', fn);
        this._reject = null;
        resolve(results);
      };
      // Jobs and results cross the thread boundary as one JSON string per chunk. A genome
      // is a graph of many small objects and structured cloning it object by object costs
      // more than the episode it pays for; one string is one copy.
      const feed = (w) => {
        if (next >= jobs.length) return false;
        const slice = jobs.slice(next, next + this.chunk);
        next += slice.length;
        outstanding++;
        w.postMessage({ type: 'jobs', batch: this.batch, jobs: JSON.stringify(slice) });
        return true;
      };
      for (const w of this.workers) {
        const fn = (msg) => {
          if (msg.type !== 'results' || msg.batch !== this.batch) return;
          outstanding--;
          for (const r of JSON.parse(msg.results)) { results[r.i] = r; done++; if (!r.ok) this.stats.errors++; }
          if (!feed(w) && outstanding === 0 && done === jobs.length) finish();
        };
        listeners.set(w, fn);
        w.on('message', fn);
      }
      // prime every worker, deepest first so a short population still uses several threads
      for (const w of this.workers) { if (!feed(w)) break; }
      if (next === 0) finish();
    });
  }

  async close() {
    this.closed = true;
    await Promise.all(this.workers.map((w) => w.terminate()));
    this.workers = [];
  }
}
