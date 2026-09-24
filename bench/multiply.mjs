// bench/multiply.mjs: MULTIPLYING, MEASURED (his P15, 2026-09-23: "multiplying, duplicating, all
// within cloud"). daemon/multiply.mjs says what an instance, a duplicate, the elite exchange and
// the population supervisor ARE. This runs them and prints what a population buys:
//
//   [prebuild]   the suite's nine grid matrices (4 searched draws, 5 fresh draws) built once into
//                <out>/matrices under tools/budget.mjs caps, so neither arm spends wall time on them
//   [single]     ONE instance (s0, seed S) alone for --wall-s wall seconds
//   [population] i0 (seed S) for --wall-s wall seconds. It duplicates itself into i1 (seed S+1)
//                after its 2nd exchange and into i2 (seed S+2) after its 3rd; each runs its own
//                --wall-s from its own first start. i0 is SIGKILLed --kill-at-s seconds into the arm
//                and the supervisor restarts it from its own last checkpoint
//   [health]     every instance's /health, on its own port, read every 5 s
//   [ram]        the whole tree (this process, every instance, every budget sampler) every 2 s
//   [bar]        the population's pick by the SEARCHED objective against the single instance's,
//                both scored on the fresh draw grid/velocity:heldout, and whether i0 came back
//
//   node bench/multiply.mjs [--wall-s 240] [--kill-at-s 120] [--seed 1] [--out state/multiply-bench]
//
// With no flags (or only --out, which moves the files and changes nothing measured) this is the
// bar and writes bench/verdicts/multiply.json with isTheBar true. Any other flag writes
// bench/verdicts/multiply-partial.json with isTheBar false. The bar runs under the budget:
//
//   node tools/budget.mjs --ram-mb 6000 --disk-mb 2000 --dir state/multiply-bench
//        --wait-free-ram-mb 16000 -- node --max-old-space-size=6000 bench/multiply.mjs
//
// Both arms search the same suite (grid/velocity, K = 4 draws, the seeds of bench/velocity.mjs
// --draws 4) and are scored on the same fresh draws (grid/velocity:heldout and :fresh1..4). s0 and
// i0 share seed S, so the population arm is the single arm plus two duplicates and the exchange.
// The population's number is its pick by the searched objective, never its best fresh score (that
// would select on the held-out draw); the best fresh score over its instances is printed beside it.
// No model is called. Timings are wall clock on a shared desk (Board 11 shares the machine).
import { mkdirSync, rmSync, readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { createInstance, instanceDir, Population, budgetLauncher, readJson, writeJsonAtomic, SUITE, DEFAULTS as MD, BRAIN_NAME, MULTIPLY_FILE } from '../daemon/multiply.mjs';
import { populationAlive } from '../daemon/health.mjs';
import { raiseBenchFlag, benchFlag } from '../daemon/run.mjs';
import { budget, makeSampler, ProcessTree } from '../tools/budget.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const MB = 1048576;
const argv = process.argv.slice(2);
const KNOWN = new Set(['wall-s', 'kill-at-s', 'seed', 'out']);
for (let i = 0; i < argv.length; i += 2) {
  const k = argv[i].replace(/^--/, '');
  if (!argv[i].startsWith('--') || !KNOWN.has(k) || argv[i + 1] === undefined) { console.error('usage: node bench/multiply.mjs [--wall-s 240] [--kill-at-s 120] [--seed 1] [--out state/multiply-bench]'); process.exit(2); }
}
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const BAR = Object.freeze({ wallS: 240, killAtS: 120, seed: 1 });
const cfg = {
  wallS: Number(opt('wall-s', BAR.wallS)), killAtS: Number(opt('kill-at-s', BAR.killAtS)), seed: Number(opt('seed', BAR.seed)),
  out: path.resolve(ROOT, opt('out', 'state/multiply-bench')),
};
if (!(cfg.wallS > 0) || !(cfg.killAtS >= 0) || !Number.isInteger(cfg.seed)) { console.error('bench/multiply: --wall-s > 0, --kill-at-s >= 0 and an integer --seed'); process.exit(2); }
const isTheBar = cfg.wallS === BAR.wallS && cfg.killAtS === BAR.killAtS && cfg.seed === BAR.seed;
const CACHE = path.join(cfg.out, 'matrices');
const COMMAND = ['node', ...process.execArgv, 'bench/multiply.mjs', ...argv].join(' ');
const VERDICT = path.join(ROOT, 'bench', 'verdicts', isTheBar ? 'multiply.json' : 'multiply-partial.json');

const say = (l) => console.log(l);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const r1 = (x) => Math.round(x * 10) / 10;
const r3 = (x) => Math.round(x * 1000) / 1000;
const fmtS = (s) => s.toFixed(1).padStart(6) + ' s';
const T0 = Date.now();

// ---------------------------------------------------------------- the whole tree, every 2 s
/** The working set of this process and every descendant, summed (tools/budget.mjs's own metric). */
class TreeMeter {
  constructor() { this.sampler = makeSampler(); this.tree = new ProcessTree(process.pid); this.peak = blank(); this.arm = null; this.samples = 0; this.errors = 0; this.busy = false; this.timer = null; }
  async start(intervalMs = 2000) { await this.sampler.start(); await this.tick(); this.timer = setInterval(() => { this.tick(); }, intervalMs); return this; }
  async tick() {
    if (this.busy) return;
    this.busy = true;
    try {
      const procs = await this.sampler.sample();
      const live = this.tree.update(procs);
      let ws = 0, priv = 0;
      for (const p of live) { ws += p.ws; priv += p.priv; }
      const s = { wsMb: ws / MB, privMb: priv / MB, procs: live.length, atS: (Date.now() - T0) / 1000 };
      this.samples++;
      bump(this.peak, s);
      if (this.arm) bump(this.arm, s);
    } catch { this.errors++; } finally { this.busy = false; }
  }
  armStart() { this.arm = blank(); }
  armEnd() { const a = this.arm; this.arm = null; return a; }
  async stop() { if (this.timer) clearInterval(this.timer); try { await this.sampler.stop(); } catch { /* gone */ } }
}
function blank() { return { wsMb: 0, privMb: 0, procs: 0, atS: null }; }
function bump(p, s) { if (s.wsMb > p.wsMb) { p.wsMb = s.wsMb; p.atS = s.atS; } p.privMb = Math.max(p.privMb, s.privMb); p.procs = Math.max(p.procs, s.procs); }

// ---------------------------------------------------------------- reading an instance
function getHealth(port, timeoutMs = 2000) {
  return new Promise((resolve) => {
    const req = http.get({ host: '127.0.0.1', port, path: '/health', timeout: timeoutMs, agent: false }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (d) => { body += d; if (body.length > 1_000_000) req.destroy(); });
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(body) }); } catch { resolve(null); } });
    });
    req.on('timeout', () => req.destroy());
    req.on('error', () => resolve(null));
  });
}
function heartbeats(popDir) {
  let names = [];
  try { names = readdirSync(path.join(popDir, 'instances')).filter((n) => n.endsWith('.json')).sort(); } catch { return []; }
  return names.map((n) => readJson(path.join(popDir, 'instances', n))).filter(Boolean);
}
function dirBytes(dir) {
  let total = 0;
  const walk = (d) => { let es = []; try { es = readdirSync(d, { withFileTypes: true }); } catch { return; } for (const e of es) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else { try { total += statSync(p).size; } catch { /* gone */ } } } };
  walk(dir);
  return total;
}
function logLines(popDir, id) { try { return readFileSync(path.join(popDir, 'logs', id + '.log'), 'utf8').split(/\r?\n/); } catch { return []; } }

// ---------------------------------------------------------------- one arm
async function runArm({ name, popDir, first, seed, plan, killAtS, meter }) {
  rmSync(popDir, { recursive: true, force: true });
  mkdirSync(popDir, { recursive: true });
  createInstance({ popDir, id: first, seed: String(seed), wallS: cfg.wallS, spawnPlan: plan, cacheDir: CACHE });
  const t0 = Date.now();
  const armS = () => (Date.now() - t0) / 1000;
  const sup = [];
  const pop = new Population({
    popDir, launch: budgetLauncher({ ramMb: MD.instanceRamMb, diskMb: MD.instanceDiskMb, heapMb: MD.instanceHeapMb }),
    log: (l) => { const s = armS(); sup.push({ s: r1(s), line: l }); say('[' + name + ' ' + fmtS(s) + '] ' + l); },
  }).start();
  meter.armStart();
  pop.add(first);
  const health = new Map();
  const alive = [];
  let kill = null, lastHealth = 0, timedOut = false;
  const hardStop = t0 + (cfg.wallS + 240) * 1000;
  try {
    for (;;) {
      await sleep(1000);
      const s = armS();
      const pa = populationAlive(popDir, { atMs: Date.now() });
      alive.push({ s: r1(s), alive: pa.alive, ids: pa.ids });
      if (Date.now() - lastHealth >= 5000) {
        lastHealth = Date.now();
        for (const hb of heartbeats(popDir)) {
          if (!hb.port || hb.ended) continue;
          const h = await getHealth(hb.port);
          const rec = health.get(hb.id) || { reads: 0, fails: 0, last: null, lastS: null, maxAlive: 0, port: hb.port };
          if (h && h.status === 200 && h.body) { rec.reads++; rec.last = h.body; rec.lastS = r1(armS()); rec.port = hb.port; rec.maxAlive = Math.max(rec.maxAlive, h.body.instancesAlive || 0); } else rec.fails++;
          health.set(hb.id, rec);
        }
      }
      if (killAtS && !kill && s >= killAtS) {
        const m = pop.members.get(first);
        if (m && m.pid) {
          const bd = path.join(instanceDir(popDir, first), BRAIN_NAME);
          const meta = readJson(path.join(bd, 'meta.json'));
          const plane = readJson(path.join(bd, 'plane.json'));
          const hb = readJson(path.join(popDir, 'instances', first + '.json'));
          const pid = pop.kill(first);
          if (pid) {
            kill = { id: first, pid, atS: r1(s), checkpointT: meta ? meta.t ?? null : null, planeT: plane ? plane.t ?? null : null, planeRows: plane && plane.store ? plane.store.rows.length : null, planeIndex: plane ? plane.planeIndex ?? null : null, tickAtKill: hb ? hb.tick ?? null : null };
            say('[' + name + ' ' + fmtS(s) + '] [kill] SIGKILL ' + first + ' pid ' + pid + ' at tick ' + kill.tickAtKill + '; its last checkpoint on disk is t=' + kill.checkpointT + ' (meta.json), its plane.json t=' + kill.planeT + ' with ' + kill.planeRows + ' stored elites at plane ' + kill.planeIndex);
          }
        }
      }
      let pending = 0;
      try { pending = readdirSync(path.join(popDir, 'requests')).filter((n) => n.endsWith('.json')).length; } catch { /* none */ }
      if (pop.settled() && pending === 0) break;
      if (Date.now() > hardStop) { timedOut = true; say('[' + name + '] hard stop at ' + r1(s) + ' s: instances still running are killed'); break; }
    }
  } finally {
    await pop.stop();
  }
  const ram = meter.armEnd();
  const wallArmS = armS();

  const instances = [];
  for (const [id, m] of pop.members) {
    const dir = instanceDir(popDir, id);
    const inst = readJson(path.join(dir, 'instance.json')) || {};
    const done = readJson(path.join(dir, BRAIN_NAME, 'done.json'));
    let budgets = [];
    try { budgets = readdirSync(path.join(popDir, 'budget')).filter((n) => n.startsWith(id + '-') && n.endsWith('.json')).map((n) => readJson(path.join(popDir, 'budget', n))).filter(Boolean); } catch { /* none */ }
    const peakRssMb = budgets.reduce((a, b) => Math.max(a, b.peakRssMb || 0), 0);
    const rep = done ? done.report : null;
    instances.push({
      id, seed: inst.seed ?? null, parent: inst.parent ?? null, firstStartOffsetS: inst.firstStartMs ? r1((inst.firstStartMs - t0) / 1000) : null,
      attempts: m.attempt, restarts: m.restarts, gaveUp: m.gaveUp, exits: m.exits, ended: !!done,
      t: done ? done.t : null, starts: done ? done.starts : inst.starts ?? null, resumedAt: done ? done.resumedAt : null, wallS: done ? done.wallS : null,
      checkpoints: done ? done.checkpoints : null, exchangeCalls: done ? done.exchangeCalls : null,
      duplications: done ? done.duplications : (inst.spawned || []).length, spawned: (inst.spawned || []).map((x) => ({ id: x.id, seed: x.seed, fromTick: x.fromTick, planeRows: x.planeRows })),
      duplicatedFrom: inst.duplicatedFrom ? { id: inst.duplicatedFrom.id, tick: inst.duplicatedFrom.tick, planeRows: inst.duplicatedFrom.planeRows, bytes: inst.duplicatedFrom.bytes } : null,
      evals: rep ? rep.evals : null, planesRun: rep ? rep.planesRun : null, exchanges: rep ? rep.exchanges : null, storeRows: rep ? rep.storeRows : null,
      elitesImported: rep ? rep.elitesImported : null, elitesExported: rep ? rep.elitesExported : null, imported: rep ? rep.imported : null,
      best: rep && rep.best ? { fitness: rep.best.fitness, count: rep.best.count, len: rep.best.len, source: rep.best.source, searchedMeanCount: rep.best.searchedMeanCount, tasksPerDraw: rep.best.tasksPerDraw, fresh: rep.best.fresh, freshT: rep.best.freshT, freshMore: rep.best.freshMore, freshMoreMean: rep.best.freshMoreMean } : null,
      peakRssMb: r1(peakRssMb), heartbeatMaxRssMb: done ? done.maxRssMb : null, budgetOutcomes: budgets.map((b) => b.outcome),
      health: health.get(id) ? { reads: health.get(id).reads, fails: health.get(id).fails, lastS: health.get(id).lastS, maxAlive: health.get(id).maxAlive, last: pickHealth(health.get(id).last) } : null,
    });
  }
  instances.sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
  const firstOff = instances[0] && instances[0].firstStartOffsetS !== null ? instances[0].firstStartOffsetS : 0;
  const endMark = firstOff + cfg.wallS - 2;
  const atEnd = alive.filter((a) => a.s <= endMark).pop() || null;
  return { name, popDir, instances, kill, sup, alive, atEnd, maxAlive: alive.reduce((a, x) => Math.max(a, x.alive), 0), ram, wallArmS: r1(wallArmS), timedOut };
}
function pickHealth(h) {
  if (!h) return null;
  return { ok: h.ok, instance: h.instance, instancesAlive: h.instancesAlive, instances: h.instances, tick: h.tick, rssMb: h.rssMb, multiply: h.multiply ? { duplications: h.multiply.duplications, elitesImported: h.multiply.elitesImported, elitesExported: h.multiply.elitesExported, storeRows: h.multiply.storeRows, evals: h.multiply.evals, exchanges: h.multiply.exchanges, resumed: h.multiply.resumed, resumedAt: h.multiply.resumedAt } : null };
}

// ---------------------------------------------------------------- printing an arm
function sum(xs, k) { return xs.reduce((a, x) => a + (Number(x[k]) || 0), 0); }
function printArm(a) {
  say('');
  for (const x of a.instances) {
    const b = x.best;
    say('[' + a.name + '] ' + x.id + ' seed ' + x.seed + (x.parent ? ' (duplicate of ' + x.parent + ' from its checkpoint t=' + (x.duplicatedFrom && x.duplicatedFrom.tick) + ' with ' + (x.duplicatedFrom && x.duplicatedFrom.planeRows) + ' plane elites)' : '') + ': started at arm ' + x.firstStartOffsetS + ' s, ' + x.starts + ' start(s), ended ' + x.ended + ' at t=' + x.t + ' after ' + x.wallS + ' s; ' + x.checkpoints + ' checkpoints, ' + x.exchanges + ' exchanges');
    say('[' + a.name + ']    evals ' + x.evals + ', planes ' + x.planesRun + ', store ' + x.storeRows + ' cells, elites imported ' + x.elitesImported + ' exported ' + x.elitesExported + ', duplications ' + x.duplications + ', peak rss ' + x.peakRssMb + ' MB (its budget tree), ' + x.heartbeatMaxRssMb + ' MB (its own maxRSS)');
    if (b) say('[' + a.name + ']    best by the searched objective: ' + b.count + '/' + (b.tasksPerDraw * SUITE.draws) + ' searched (' + b.searchedMeanCount + '/' + b.tasksPerDraw + ' per draw), length ' + b.len + ', found by ' + b.source + '; FRESH ' + b.fresh + '/' + b.freshT + ' on grid/velocity:heldout, ' + b.freshMore.join(' ') + ' on :fresh1..4 (mean ' + r3(b.freshMoreMean) + ')');
    const h = x.health;
    if (h && h.last) say('[' + a.name + ']    /health (' + h.reads + ' reads, ' + h.fails + ' failed; last at arm ' + h.lastS + ' s): instance ' + h.last.instance + ', instancesAlive ' + h.last.instancesAlive + ' [' + (h.last.instances || []).join(' ') + '], duplications ' + (h.last.multiply && h.last.multiply.duplications) + ', elitesImported ' + (h.last.multiply && h.last.multiply.elitesImported) + ', elitesExported ' + (h.last.multiply && h.last.multiply.elitesExported) + ', tick ' + h.last.tick + ', rss ' + h.last.rssMb + ' MB; most alive seen ' + h.maxAlive);
  }
}
function armLine(a, pick) {
  const b = pick ? pick.best : null;
  return '[' + a.name + '] best fresh ' + (b ? b.fresh + '/' + b.freshT : 'none') + (pick ? ' (the pick by the searched objective: ' + pick.id + ', ' + b.count + ' searched)' : '') + '; evals ' + sum(a.instances, 'evals') + '; elites imported ' + sum(a.instances, 'elitesImported') + ' exported ' + sum(a.instances, 'elitesExported') + '; duplications ' + sum(a.instances, 'duplications') + '; instances alive at the end ' + (a.atEnd ? a.atEnd.alive + ' [' + a.atEnd.ids.join(' ') + '] at arm ' + a.atEnd.s + ' s' : 'unknown') + ' (most alive ' + a.maxAlive + '); peak tree ram ' + r1(a.ram.wsMb) + ' MB working set (' + r1(a.ram.privMb) + ' MB private, ' + a.ram.procs + ' processes); per instance peak ' + a.instances.map((x) => x.id + ' ' + x.peakRssMb + ' MB').join(', ');
}
function pickOf(a) {
  const withBest = a.instances.filter((x) => x.best);
  withBest.sort((p, q) => q.best.fitness - p.best.fitness || p.id.localeCompare(q.id, 'en', { numeric: true }));
  return withBest[0] || null;
}

// ---------------------------------------------------------------- the run
let meter = null, flag = null;
let verdictWritten = false;
try {
  say('[multiply] ' + (isTheBar ? 'THE BAR' : 'a partial run (flags differ from the bar)') + ': one instance alone for ' + cfg.wallS + ' s, then a population of 3 for ' + cfg.wallS + ' s each, i0 killed at ' + cfg.killAtS + ' s; seed ' + cfg.seed + '; out ' + path.relative(ROOT, cfg.out));
  say('[multiply] node ' + process.version + ', ' + os.cpus().length + ' threads, ' + r1(os.totalmem() / 1073741824) + ' GB RAM, ' + r1(os.freemem() / 1073741824) + ' GB free at start; heap cap ' + (process.execArgv.find((x) => x.startsWith('--max-old-space-size')) || 'default') + '; suite ' + SUITE.seed + ' K=' + SUITE.draws + ' depth ' + SUITE.maxDepth + ', fresh ' + SUITE.fresh + ' and ' + SUITE.freshMore + ' more; no model calls');
  say('[multiply] per instance: organism ' + MD.majors + ' majors x ' + MD.units + ' units, checkpoint every ' + MD.checkpointEvery + ' ticks (an exchange at each), ledger summary ' + MD.ledgerBudgetMb + ' MB; one plane worker thread (heap ' + MD.planeHeapMb + ' MB); tools/budget.mjs caps ' + MD.instanceRamMb + ' MB ram and ' + MD.instanceDiskMb + ' MB disk; node heap ' + MD.instanceHeapMb + ' MB');
  const other = benchFlag({ selfPid: process.pid });
  say('[multiply] ' + (other ? 'another live bench flag is up: pid ' + other.pid + ' (' + other.command + ')' : 'no other live bench flag'));
  flag = raiseBenchFlag({ command: COMMAND });
  say('[multiply] bench flag raised: ' + path.relative(ROOT, flag.file));
  mkdirSync(cfg.out, { recursive: true });
  meter = await new TreeMeter().start(2000);

  // ---- prebuild, outside both arms
  const pre = await budget('node', ['--max-old-space-size=1024', MULTIPLY_FILE, 'prebuild', '--cache', CACHE], { ramMb: 1500, diskMb: 50, dir: cfg.out, cwd: ROOT, stdio: ['ignore', 'inherit', 'inherit'], statusMs: 3_600_000, record: path.join(cfg.out, 'prebuild-budget.json') });
  say('[prebuild] exit ' + pre.exitCode + ', peak ' + pre.peakRssMb + ' MB, ' + readdirSync(CACHE).filter((n) => n.endsWith('.bin')).length + ' matrices in ' + path.relative(ROOT, CACHE));
  if (pre.exitCode !== 0) throw new Error('prebuild failed: exit ' + pre.exitCode);

  const S = cfg.seed;
  say('');
  say('[single] s0 seed ' + S + ' alone for ' + cfg.wallS + ' s');
  const single = await runArm({ name: 'single', popDir: path.join(cfg.out, 'single'), first: 's0', seed: S, plan: [], killAtS: 0, meter });
  printArm(single);
  const sPick = pickOf(single);
  say(armLine(single, sPick));

  say('');
  say('[population] i0 seed ' + S + ', duplicating into i1 (seed ' + (S + 1) + ') after its 2nd exchange and i2 (seed ' + (S + 2) + ') after its 3rd; ' + cfg.wallS + ' s each; i0 SIGKILLed at ' + cfg.killAtS + ' s');
  const popArm = await runArm({ name: 'population', popDir: path.join(cfg.out, 'population'), first: 'i0', seed: S, plan: [{ id: 'i1', seed: String(S + 1), afterExchange: 2 }, { id: 'i2', seed: String(S + 2), afterExchange: 3 }], killAtS: cfg.killAtS, meter });
  printArm(popArm);
  const pPick = pickOf(popArm);
  say(armLine(popArm, pPick));

  // ---- the kill: did i0 come back from its own checkpoint?
  say('');
  const k = popArm.kill;
  const i0 = popArm.instances.find((x) => x.id === 'i0') || null;
  const restartLine = popArm.sup.find((x) => /^\[population\] i0 exited .* restart 1 from its checkpoint t=/.test(x.line)) || null;
  const supT = restartLine ? Number((/from its checkpoint t=(\d+)/.exec(restartLine.line) || [])[1]) : null;
  const lines = logLines(popArm.popDir, 'i0');
  const resumedLines = lines.filter((l) => /^\[live\] resumed \S+ in \d+ ms at t=\d+/.test(l));
  const planeResumed = lines.filter((l) => /^\[multiply i0\] plane resumed from plane\.json/.test(l));
  const cameBack = Boolean(k && i0 && i0.restarts >= 1 && i0.ended && i0.starts >= 2 && Number.isFinite(supT) && supT > 0 && i0.resumedAt === supT && resumedLines.length >= 1 && planeResumed.length >= 1);
  if (k) {
    say('[kill] i0 pid ' + k.pid + ' SIGKILLed at arm ' + k.atS + ' s (tick ' + k.tickAtKill + ', checkpoint on disk t=' + k.checkpointT + ', plane.json t=' + k.planeT + ')');
    say('[kill] supervisor: ' + (restartLine ? restartLine.line + ' (at arm ' + restartLine.s + ' s)' : 'NO restart line'));
    say('[kill] i0 log: ' + (resumedLines[0] || 'NO "[live] resumed" line'));
    say('[kill] i0 log: ' + (planeResumed[0] || 'NO "plane resumed" line'));
    say('[kill] i0 ended ' + (i0 && i0.ended) + ' after ' + (i0 && i0.starts) + ' starts at t=' + (i0 && i0.t) + ', resumedAt ' + (i0 && i0.resumedAt) + ' against the supervisor\'s checkpoint t=' + supT + ': ' + (cameBack ? 'CAME BACK from its checkpoint' : 'DID NOT come back from its checkpoint'));
  } else say('[kill] no kill was made' + (cfg.killAtS ? ' (i0 had no live pid at ' + cfg.killAtS + ' s)' : ' (--kill-at-s 0)'));

  // ---- the bar
  say('');
  const sBest = sPick ? sPick.best : null, pBest = pPick ? pPick.best : null;
  const maxFresh = popArm.instances.filter((x) => x.best).reduce((a, x) => Math.max(a, x.best.fresh), -1);
  const i0Best = i0 && i0.best ? i0.best : null;
  const atOrAbove = Boolean(sBest && pBest && pBest.fresh >= sBest.fresh);
  const barMet = atOrAbove && cameBack;
  say('[bar] single: ' + (sBest ? sBest.fresh + '/' + sBest.freshT + ' fresh (s0, ' + sBest.count + ' searched)' : 'none'));
  say('[bar] population pick by the searched objective: ' + (pBest ? pBest.fresh + '/' + pBest.freshT + ' fresh (' + pPick.id + ', ' + pBest.count + ' searched, found by ' + pBest.source + ')' : 'none') + '; i0 at the arm\'s ' + cfg.wallS + ' s mark: ' + (i0Best ? i0Best.fresh + '/' + i0Best.freshT : 'none') + '; best fresh over the 3 instances (selects on the held-out draw, not the bar): ' + maxFresh);
  say('[bar] population ' + (atOrAbove ? (pBest.fresh > sBest.fresh ? 'ABOVE' : 'EQUAL TO') : 'BELOW') + ' the single instance on the fresh draw' + (atOrAbove && pBest.fresh === sBest.fresh ? ': the population did no better' : '') + '; killed instance ' + (cameBack ? 'came back' : 'did NOT come back') + ' => bar ' + (barMet ? 'MET' : 'MISSED'));

  // ---- ram and disk
  const peakWs = r1(meter.peak.wsMb), peakPriv = r1(meter.peak.privMb);
  const outBytes = dirBytes(cfg.out);
  say('[ram] peak tree working set ' + peakWs + ' MB (private ' + peakPriv + ' MB, up to ' + meter.peak.procs + ' processes) over ' + meter.samples + ' samples; under 6000 MB: ' + (peakWs < 6000));
  say('[disk] ' + path.relative(ROOT, cfg.out) + ' holds ' + r1(outBytes / MB) + ' MB' + (outBytes > 200 * MB ? ' (OVER 200 MB)' : ''));
  const wallMs = Date.now() - T0;
  say('[multiply] wall ' + r1(wallMs / 1000) + ' s');

  const statement = 'One instance (s0, seed ' + S + ') ran alone for ' + cfg.wallS + ' wall seconds and its best library by the searched objective scored ' + (sBest ? sBest.fresh + '/' + sBest.freshT : 'nothing') + ' on the fresh draw grid/velocity:heldout after ' + sum(single.instances, 'evals') + ' evaluations. A population of 3 (i0 seed ' + S + ', duplicated from its own checkpoints into i1 seed ' + (S + 1) + ' and i2 seed ' + (S + 2) + ', each for ' + cfg.wallS + ' wall seconds, exchanging elites through a shared store at every checkpoint) made ' + sum(popArm.instances, 'evals') + ' evaluations, imported ' + sum(popArm.instances, 'elitesImported') + ' and exported ' + sum(popArm.instances, 'elitesExported') + ' elites, and its pick by the searched objective scored ' + (pBest ? pBest.fresh + '/' + pBest.freshT : 'nothing') + ' on the same fresh draw' + (atOrAbove && sBest && pBest.fresh === sBest.fresh ? ', equal to the single instance: the population did no better' : atOrAbove ? ', above the single instance' : ', below the single instance') + '. i0 was killed at ' + cfg.killAtS + ' s and ' + (cameBack ? 'came back from its own checkpoint t=' + supT : 'did not come back from its checkpoint') + '. The whole tree peaked at ' + peakWs + ' MB working set. The bar (population at or above single on the fresh draw, and the killed instance back) is ' + (barMet ? 'met' : 'missed') + '. No model was called; timings are wall clock on a desk shared with Board 11.';

  const armJson = (a, pick) => ({
    wallArmS: a.wallArmS, timedOut: a.timedOut, pick: pick ? { id: pick.id, ...pick.best } : null,
    evals: sum(a.instances, 'evals'), elitesImported: sum(a.instances, 'elitesImported'), elitesExported: sum(a.instances, 'elitesExported'), duplications: sum(a.instances, 'duplications'),
    aliveAtEnd: a.atEnd, maxAlive: a.maxAlive, peakTreeWsMb: r1(a.ram.wsMb), peakTreePrivateMb: r1(a.ram.privMb), peakTreeProcs: a.ram.procs,
    instances: a.instances, supervisor: a.sup,
  });
  writeJsonAtomic(VERDICT, {
    at: new Date().toISOString(), command: COMMAND, node: process.version, isTheBar, statement,
    bar: { met: barMet, rule: 'population pick by the searched objective at or above the single instance on grid/velocity:heldout, AND the killed instance came back from its checkpoint', singleFresh: sBest ? sBest.fresh : null, populationFresh: pBest ? pBest.fresh : null, freshT: sBest ? sBest.freshT : null, atOrAbove, cameBack, populationBestFreshOverInstances: maxFresh, i0FreshAtWall: i0Best ? i0Best.fresh : null },
    config: { ...cfg, out: path.relative(ROOT, cfg.out), suite: SUITE, organism: { majors: MD.majors, units: MD.units, checkpointEvery: MD.checkpointEvery, chunk: MD.chunk, ledger: 'summary', ledgerBudgetMb: MD.ledgerBudgetMb }, instanceCaps: { ramMb: MD.instanceRamMb, diskMb: MD.instanceDiskMb, heapMb: MD.instanceHeapMb, planeHeapMb: MD.planeHeapMb }, spawnPlan: 'i0 duplicates into i1 after its 2nd exchange and into i2 after its 3rd' },
    prebuild: { exitCode: pre.exitCode, peakRssMb: pre.peakRssMb, wallS: pre.wallS ?? null },
    arms: { single: armJson(single, sPick), population: armJson(popArm, pPick) },
    kill: k ? { ...k, supervisorLine: restartLine ? restartLine.line : null, supervisorCheckpointT: supT, resumedLine: resumedLines[0] || null, planeResumedLine: planeResumed[0] || null, cameBack } : null,
    ram: { peakTreeWsMb: peakWs, peakTreePrivateMb: peakPriv, peakProcs: meter.peak.procs, samples: meter.samples, samplerErrors: meter.errors, under6000: peakWs < 6000 },
    disk: { outMb: r1(outBytes / MB), over200: outBytes > 200 * MB },
    machine: { cpus: os.cpus().length, totalMemGb: r1(os.totalmem() / 1073741824), platform: process.platform },
    modelCalls: 0, wallMs,
  }, { pretty: true });
  verdictWritten = true;
  say('[multiply] wrote ' + path.relative(ROOT, VERDICT) + ' (isTheBar ' + isTheBar + ')');
} catch (e) {
  console.error('[multiply] FAILED: ' + (e && e.stack || e));
  process.exitCode = 1;
} finally {
  if (meter) await meter.stop();
  if (flag) flag.lower();
  if (!verdictWritten) say('[multiply] no verdict written');
}
