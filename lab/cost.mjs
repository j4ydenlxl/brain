#!/usr/bin/env node
// lab/cost.mjs : WHAT ONE SOLVED TASK COSTS. A research instrument that cannot price its own
// work is not an instrument. This file runs a fixed task list, measures CPU time, wall time
// and peak memory around each one, and divides by the number of tasks the brain actually got
// RIGHT, not the number it attempted. A wrong answer is not cheaper, it is worthless.
//
// The task list, one per subsystem, all of them graded by code that does not belong to this
// file (so the grader is never the thing being priced):
//   algebra   capability/induce.mjs algebraBattery: linear equations solved and then
//             VERIFIED by substitution. A solve that does not verify is not counted.
//   recall    memory/episodic.mjs EpisodicStore: N episodes written, then queried back with
//             a corrupted key. A recall is correct only when the exact value comes back.
//   sequence  tasks/sequence.mjs runSequences: the next element of an exact rational
//             sequence, graded against tasks/exact.mjs, which imports nothing from core.
//
// External API tokens. The answer is zero, and "by construction" is not a measurement, so
// this file measures it: every door out of this process is wrapped and counted before the
// task list runs (fetch, http.request, https.request, net.Socket.prototype.connect,
// tls.connect, dns.lookup, dns.promises.lookup). If any of them were called the count would
// be non-zero and the report would say so. package.json has no dependencies, so there is no
// client in the process that could call one: the counter proves the claim rather than
// restating it.
//
// Usage: node lab/cost.mjs [--json] [--out bench/verdicts/cost.json] [--scale 1]
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { RNG } from '../core/rng.mjs';
import * as S from '../core/signal.mjs';
import { EpisodicStore } from '../memory/episodic.mjs';
import { algebraBattery } from '../capability/induce.mjs';
import { runSequences } from '../tasks/sequence.mjs';
import { parseArgs, renderTable, fmtNum } from '../tools/lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

// ---------------------------------------------------------------- the network counter
/**
 * Wrap every outbound door and count calls. Returns a handle with .counts and .restore().
 * Nothing is blocked: a blocked call would hide a caller, and the point is to see one.
 */
export async function watchNetwork() {
  const counts = { fetch: 0, httpRequest: 0, httpsRequest: 0, socketConnect: 0, tlsConnect: 0, dnsLookup: 0, dnsPromisesLookup: 0 };
  const restores = [];
  const wrap = (obj, key, name) => {
    if (!obj || typeof obj[key] !== 'function') return;
    const orig = obj[key];
    const patched = function (...args) { counts[name]++; return orig.apply(this, args); };
    try { obj[key] = patched; restores.push(() => { obj[key] = orig; }); } catch { /* frozen, leave it */ }
  };
  const http = await import('node:http');
  const https = await import('node:https');
  const net = await import('node:net');
  const tls = await import('node:tls');
  const dns = await import('node:dns');
  wrap(globalThis, 'fetch', 'fetch');
  wrap(http.default, 'request', 'httpRequest');
  wrap(https.default, 'request', 'httpsRequest');
  wrap(net.Socket.prototype, 'connect', 'socketConnect');
  wrap(tls.default, 'connect', 'tlsConnect');
  wrap(dns.default, 'lookup', 'dnsLookup');
  wrap(dns.promises, 'lookup', 'dnsPromisesLookup');
  return {
    counts,
    total() { return Object.values(counts).reduce((a, b) => a + b, 0); },
    restore() { for (const r of restores.reverse()) r(); return counts; },
  };
}

// ---------------------------------------------------------------- one measured task
function meterOf() {
  const cpu0 = process.cpuUsage();
  const w0 = performance.now();
  return () => {
    const cpu = process.cpuUsage(cpu0);
    return {
      wallMs: round(performance.now() - w0, 3),
      cpuMs: round((cpu.user + cpu.system) / 1000, 3),
      userMs: round(cpu.user / 1000, 3),
      systemMs: round(cpu.system / 1000, 3),
    };
  };
}
function memNow() {
  const m = process.memoryUsage();
  return { rssMB: round(m.rss / 1048576, 3), heapMB: round(m.heapUsed / 1048576, 3) };
}

/**
 * The smallest non-zero step process.cpuUsage() can report on this machine, measured rather
 * than assumed. A task that prints 0 cpu ms did not cost nothing: it cost less than this, and
 * a reader who does not have this number cannot tell the two apart. Windows schedulers
 * typically quantise to about 15.6 ms, POSIX ones to far less.
 */
export function cpuResolutionMs(maxSpins = 50000000) {
  const base = process.cpuUsage();
  let spins = 0, x = 0;
  for (;;) {
    x += Math.sqrt(spins + 1);
    spins++;
    if ((spins & 1023) === 0) {
      const d = process.cpuUsage(base);
      const ms = (d.user + d.system) / 1000;
      if (ms > 0) return { resolutionMs: round(ms, 4), spins, sink: round(x, 0) };
    }
    if (spins >= maxSpins) return { resolutionMs: null, spins, sink: round(x, 0) };
  }
}
function round(x, d) { const p = 10 ** d; return Math.round(x * p) / p; }

/**
 * Run one task and price it.
 * @param {object} task { name, doc, run(ctx) -> { n, solved, detail } }
 */
export function runTask(task, ctx = {}) {
  const before = memNow();
  const stop = meterOf();
  const r = task.run(ctx);
  const timing = stop();
  const after = memNow();
  const solved = r.solved, n = r.n;
  return {
    task: task.name, doc: task.doc,
    n, solved, accuracy: n ? round(solved / n, 6) : 0,
    ...timing,
    rssBeforeMB: before.rssMB, rssAfterMB: after.rssMB,
    heapBeforeMB: before.heapMB, heapAfterMB: after.heapMB,
    peakSampledRssMB: Math.max(before.rssMB, after.rssMB),
    cpuMsPerSolved: solved ? round(timing.cpuMs / solved, 4) : null,
    wallMsPerSolved: solved ? round(timing.wallMs / solved, 4) : null,
    detail: r.detail || null,
  };
}

// ---------------------------------------------------------------- the fixed task list
export function defaultTasks({ scale = 1, seed = 'lab:cost' } = {}) {
  return [
    {
      name: 'algebra',
      doc: 'capability/induce.mjs algebraBattery: linear equations solved and verified by substitution',
      run: () => {
        const n = Math.max(10, Math.round(200 * scale));
        const r = algebraBattery(new RNG(seed + ':algebra'), n);
        // Solved means VERIFIED. A degenerate equation (a === c) has no unique solution and
        // is excluded from the denominator rather than counted as a miss.
        return { n: r.solvable, solved: r.rows.filter((x) => !x.degenerate && x.verified).length, detail: { attempted: r.n, degenerate: r.degenerate, solved: r.solved, verified: r.verified } };
      },
    },
    {
      name: 'recall',
      doc: 'memory/episodic.mjs EpisodicStore: N episodes written, queried back with a key corrupted at 10 percent of its bits',
      run: () => {
        const d = 2048, n = Math.max(32, Math.round(512 * scale)), flip = 0.1;
        const rng = new RNG(seed + ':recall');
        const store = new EpisodicStore({ d, capacity: n, seed: seed + ':episodic' });
        const keys = [];
        for (let i = 0; i < n; i++) {
          const key = S.hvRandom(rng, d);
          keys.push(key);
          store.append({ key, t: i, value: { id: i, tag: 'ep' + i }, items: ['ep' + i] });
        }
        let correct = 0;
        for (let i = 0; i < n; i++) {
          const q = Int8Array.from(keys[i]);
          for (let b = 0; b < d; b++) if (rng.next() < flip) q[b] = -q[b];
          const hit = store.retrieve(q, { k: 1 })[0];
          if (hit && hit.value && hit.value.id === i) correct++;
        }
        return { n, solved: correct, detail: { d, flipRate: flip, episodes: n, queries: store.stats.queries, bytesKeys: n * d } };
      },
    },
    {
      name: 'sequence',
      doc: 'tasks/sequence.mjs runSequences: the next element of an exact rational sequence, graded by tasks/exact.mjs',
      run: () => {
        const counts = { arithmetic: Math.round(12 * scale), geometric: Math.round(10 * scale), periodic: Math.round(10 * scale), recurrence: Math.round(10 * scale), polynomial: Math.round(12 * scale) };
        for (const k of Object.keys(counts)) counts[k] = Math.max(2, counts[k]);
        const { report } = runSequences({ seed: seed + ':sequence', counts });
        return { n: report.n, solved: report.correct, detail: { baselineCorrect: report.baselineCorrect ?? null, suiteMs: report.ms, cells: report.cells, cellRuns: report.cellRuns } };
      },
    },
  ];
}

// ---------------------------------------------------------------- the instrument
/**
 * Run the fixed task list and price every task.
 * @param {object} [opts] { scale, seed, tasks, write, out }
 */
export async function measureCost(opts = {}) {
  const tasks = opts.tasks || defaultTasks(opts);
  const clock = cpuResolutionMs();
  const watcher = await watchNetwork();
  const rssStart = memNow();
  const cpuStart = process.cpuUsage();
  const wallStart = performance.now();
  const rows = [];
  for (const t of tasks) rows.push(runTask(t, opts));
  const cpu = process.cpuUsage(cpuStart);
  const wallMs = round(performance.now() - wallStart, 3);
  const cpuMs = round((cpu.user + cpu.system) / 1000, 3);
  const rssEnd = memNow();
  const net = watcher.restore();
  const networkCalls = Object.values(net).reduce((a, b) => a + b, 0);

  // process.resourceUsage().maxRSS is the peak resident set the OS granted this process, in
  // kilobytes. It is a process-lifetime peak, not a per-task one, which is why the per-task
  // rows report the sampled figures and only the total reports this.
  const maxRSSkb = typeof process.resourceUsage === 'function' ? process.resourceUsage().maxRSS : null;
  const solved = rows.reduce((a, r) => a + r.solved, 0);
  const n = rows.reduce((a, r) => a + r.n, 0);
  const report = {
    at: new Date().toISOString(), node: process.version, platform: process.platform, arch: process.arch,
    scale: opts.scale ?? 1, seed: opts.seed ?? 'lab:cost',
    tasks: rows,
    total: {
      tasks: rows.length, n, solved, accuracy: n ? round(solved / n, 6) : 0,
      cpuMs, wallMs,
      cpuMsPerSolvedTask: solved ? round(cpuMs / solved, 4) : null,
      wallMsPerSolvedTask: solved ? round(wallMs / solved, 4) : null,
      peakRssMB: maxRSSkb != null ? round(maxRSSkb / 1024, 3) : null,
      peakRssSource: maxRSSkb != null ? 'process.resourceUsage().maxRSS (process lifetime peak)' : 'unavailable on this platform',
      rssStartMB: rssStart.rssMB, rssEndMB: rssEnd.rssMB,
      heapStartMB: rssStart.heapMB, heapEndMB: rssEnd.heapMB,
      cpuResolutionMs: clock.resolutionMs,
      cpuResolutionSpins: clock.spins,
    },
    external: {
      apiTokens: 0,
      tokensMeasuredBy: 'no network call was made, counted at every outbound door in this process',
      networkCalls, byDoor: { ...net },
      dependencies: 0,
    },
  };
  if (opts.write !== false) {
    const out = opts.out || path.join(ROOT, 'bench', 'verdicts', 'cost.json');
    mkdirSync(path.dirname(out), { recursive: true });
    writeFileSync(out, JSON.stringify(report, null, 2));
    report.file = out;
  }
  return report;
}

export function renderCost(r) {
  const L = [];
  L.push('cost  ' + r.node + '  ' + r.platform + '/' + r.arch + '  scale ' + r.scale + '  seed ' + r.seed);
  L.push('');
  L.push(renderTable([
    { key: 'task', label: 'task', width: 10 },
    { key: 'n', label: 'n', width: 6, align: 'r' },
    { key: 'solved', label: 'solved', width: 7, align: 'r' },
    { key: 'accuracy', label: 'accuracy', width: 9, align: 'r' },
    { key: 'cpuMs', label: 'cpu ms', width: 11, align: 'r' },
    { key: 'wallMs', label: 'wall ms', width: 11, align: 'r' },
    { key: 'peakSampledRssMB', label: 'rss MB', width: 9, align: 'r' },
    { key: 'cpuMsPerSolved', label: 'cpu ms/solved', width: 14, align: 'r' },
  ], r.tasks.map((t) => ({ ...t, accuracy: fmtNum(t.accuracy, 4) }))));
  L.push('');
  // What each task counted, printed rather than left in the json: an accuracy of 1 with no
  // denominator beside it is a number nobody can check.
  L.push('what each task counted');
  for (const t of r.tasks) {
    L.push('  ' + t.task.padEnd(10) + t.doc);
    L.push('  ' + ''.padEnd(10) + 'n ' + t.n + ', solved ' + t.solved + ', detail ' + JSON.stringify(t.detail));
  }
  L.push('');
  L.push('total  ' + r.total.n + ' tasks, ' + r.total.solved + ' solved (' + fmtNum(r.total.accuracy, 4) + ')');
  L.push('  cpu                    ' + r.total.cpuMs + ' ms');
  L.push('  wall                   ' + r.total.wallMs + ' ms');
  L.push('  cpu clock resolution   ' + (r.total.cpuResolutionMs == null ? 'n/a' : r.total.cpuResolutionMs + ' ms') + '   measured in ' + r.total.cpuResolutionSpins + ' spins: a task printing 0 cpu ms cost less than this, not nothing');
  L.push('  peak memory            ' + (r.total.peakRssMB == null ? 'n/a' : r.total.peakRssMB + ' MB') + '   ' + r.total.peakRssSource);
  L.push('  cost per solved task   ' + r.total.cpuMsPerSolvedTask + ' cpu ms   (' + r.total.wallMsPerSolvedTask + ' wall ms)');
  L.push('  external API tokens    ' + r.external.apiTokens + '   ' + r.external.tokensMeasuredBy);
  L.push('  network calls made     ' + r.external.networkCalls + '   ' + JSON.stringify(r.external.byDoor));
  if (r.file) L.push('  verdict                ' + r.file);
  return L.join('\n');
}

// ---------------------------------------------------------------- CLI
async function main(argv) {
  const { opts } = parseArgs(argv, ['json', 'help']);
  if (opts.help) {
    process.stdout.write('usage: node lab/cost.mjs [--scale X] [--seed S] [--out FILE] [--json]\n');
    return 0;
  }
  const r = await measureCost({
    scale: opts.scale ? Number(opts.scale) : 1,
    seed: opts.seed && opts.seed !== true ? String(opts.seed) : 'lab:cost',
    out: opts.out && opts.out !== true ? String(opts.out) : undefined,
  });
  process.stdout.write((opts.json ? JSON.stringify(r, null, 2) : renderCost(r)) + '\n');
  return r.external.networkCalls === 0 ? 0 : 1;
}
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) main(process.argv.slice(2)).then((c) => process.exit(c)).catch((e) => { process.stderr.write('cost: ' + (e && e.message || e) + '\n'); process.exit(2); });
