// bench/cloud.mjs: THE CLOUD BAR (his P13: "It should live 24/7 on the cloud remember Its
// literally a sandboxed ARTIFICIAL SUPERINTELLIGENCE"; his P15: "multiplying, duplicating, all
// within cloud with zero data on my part").
//
//   node bench/cloud.mjs [--seconds 300] [--out file.json] [--native] [--episodes-max N]
//
// One timeline, two drivers. With docker on this machine it builds the image and runs the
// container under compose.yaml's caps; without docker it runs bin/serve.mjs natively with the
// same environment. NATIVE MODE IS THE DOCUMENTED FALLBACK (Board 16 fit item, 2026-09-25): a
// completed 300 s native run is the bar (bench/verdicts/cloud.json, isTheBar true), the verdict
// names mode native and the missing docker field, and barMet is computed from the bar rows (see
// BAR ROWS in main). --episodes-max N replaces compose.yaml's BRAIN_EPISODES_MAX for a CONTROL
// run (the intervention off), which always writes cloud-partial. Model off: the model endpoint
// the organism and the egress probe are given is a local stub (modelStub), never Ollama. The
// timeline, over --seconds of wall time (300 is the bar):
//   1. start instance A (brain "cloud"), wait for its first checkpoint
//   2. read /health (BEFORE), kill the daemon process inside once with SIGKILL, wait for the
//      supervisor to restart it, and check it resumed from the checkpoint it had
//   3. GET /duplicate?seed=1, start instance B from the copy (brain "dup-1"), read instances alive
//   4. egress: a guarded process fetches the model endpoint (allowed: succeeds, or fails for the
//      reason printed) and example.com (refused by the guard before a socket opens); the
//      control is the same fetch to a closed local port with and without the guard
//   5. at the end, /health (AFTER), checkpoint age and bytes, RSS peaks, then both stopped
//      cleanly and every pid checked gone
// It also lists the build context (.dockerignore applied) and scans it for secrets, with a
// control scan that drops the secret lines of .dockerignore and must find the files they hide.
//
// BUDGETS: waits while free RAM is under 16 GB; each process declares its heap; state lives in
// a temp dir that is deleted at the end (the ledger rotates at 64 MB, so it stays small).
import { fork, spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync, rmSync, mkdirSync, statSync, readdirSync, createWriteStream } from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { contextFiles, scanSecrets, readIgnore } from '../tools/deploy-host.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SERVE = path.join(ROOT, 'bin', 'serve.mjs');
const VERDICTS = path.join(HERE, 'verdicts');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const now = () => Date.now();
const firstLine = (e) => String((e && e.message) || e).split('\n')[0];
const log = (s) => console.log(s);

// ---------------------------------------------------------------- the machine
export function freeRamGb() {
  if (process.platform === 'win32') {
    const r = spawnSync('powershell.exe', ['-NoProfile', '-Command', '(Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory'], { encoding: 'utf8', timeout: 30_000 });
    const kb = Number(String(r.stdout || '').trim());
    if (Number.isFinite(kb) && kb > 0) return { gb: Math.round(kb / 1048576 * 10) / 10, via: 'PowerShell Win32_OperatingSystem.FreePhysicalMemory' };
  }
  return { gb: Math.round(os.freemem() / 1073741824 * 10) / 10, via: 'os.freemem()' };
}

export function dockerProbe() {
  const r = spawnSync('docker', ['version', '--format', '{{.Server.Version}}'], { encoding: 'utf8', timeout: 30_000 });
  if (r.error) {
    const wsl = process.platform === 'win32' ? spawnSync('wsl.exe', ['--status'], { encoding: 'utf16le', timeout: 15_000 }) : null;
    const wslText = wsl ? String(wsl.stdout || '').replace(/\0/g, '').trim().split(/\r?\n/)[0] : null;
    return { present: false, why: 'docker is not on PATH (' + (r.error.code || firstLine(r.error)) + ')' + (process.platform === 'win32' ? '; C:\\Program Files\\Docker ' + (existsSync('C:\\Program Files\\Docker') ? 'exists' : 'absent') + '; wsl: ' + (wslText || 'no answer') : '') };
  }
  if (r.status !== 0) return { present: false, why: 'docker is installed but its daemon did not answer: ' + String(r.stderr || '').trim().split('\n')[0] };
  return { present: true, server: String(r.stdout).trim() };
}

/** The organism's environment as compose.yaml declares it (x-organism-env), defaults resolved. */
export function composeEnv(file = path.join(ROOT, 'compose.yaml')) {
  const text = readFileSync(file, 'utf8');
  const m = /^x-organism-env:[^\n]*\n((?:[ \t]+[^\n]*\n)+)/m.exec(text);
  const env = {};
  if (!m) return env;
  for (const line of m[1].split('\n')) {
    const kv = /^\s+([A-Z0-9_]+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    let v = kv[2].trim().replace(/^"(.*)"$/, '$1');
    const d = /^\$\{[A-Z0-9_]+:-(.*)\}$/.exec(v);
    if (d) v = d[1];
    env[kv[1]] = v;
  }
  return env;
}

function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.once('error', reject);
    s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); });
  });
}

async function getJson(url, timeoutMs = 5000) {
  const r = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  const text = await r.text();
  let body = null;
  try { body = JSON.parse(text); } catch { body = { raw: text.slice(0, 200) }; }
  return { status: r.status, body };
}

async function waitFor(what, fn, timeoutMs, everyMs = 500) {
  const t0 = now();
  let last;
  while (now() - t0 < timeoutMs) {
    try { last = await fn(); if (last) return { value: last, ms: now() - t0 }; } catch (e) { last = e; }
    await sleep(everyMs);
  }
  throw new Error('timed out after ' + timeoutMs + ' ms waiting for ' + what + (last instanceof Error ? ': ' + firstLine(last) : ''));
}

function pidAlive(pid) {
  if (!pid) return false;
  try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; }
}

function dirBytes(dir) {
  let n = 0, entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return 0; }
  for (const e of entries) { const f = path.join(dir, e.name); try { n += e.isDirectory() ? dirBytes(f) : statSync(f).size; } catch { /* raced */ } }
  return n;
}

// ---------------------------------------------------------------- the egress probe (runs guarded)
const EGRESS_SCRIPT = `
const out = {};
const model = process.env.PROBE_MODEL_URL + '/api/tags';
try { const r = await fetch(model, { signal: AbortSignal.timeout(8000) }); const j = await r.json().catch(() => ({})); out.allowed = { url: model, ok: r.ok, status: r.status, models: Array.isArray(j.models) ? j.models.length : null }; }
catch (e) { out.allowed = { url: model, ok: false, code: e.code || (e.cause && e.cause.code) || null, error: String(e.message).slice(0, 160) }; }
try { await fetch('https://example.com/', { signal: AbortSignal.timeout(8000) }); out.example = { url: 'https://example.com/', refused: false }; }
catch (e) { out.example = { url: 'https://example.com/', refused: e.code === 'EGRESS_REFUSED', code: e.code || (e.cause && e.cause.code) || null, error: String(e.message).slice(0, 200) }; }
const http = await import('node:http');
out.exampleHttp = await new Promise((res) => { const q = http.get('http://example.com/', (r) => { r.resume(); res({ refused: false }); }); q.on('error', (e) => res({ refused: e.code === 'EGRESS_REFUSED', code: e.code || null })); });
try { await fetch('http://127.0.0.1:' + process.env.PROBE_CLOSED_PORT + '/', { signal: AbortSignal.timeout(4000) }); out.closedPort = { reached: true }; }
catch (e) { out.closedPort = { code: e.code || (e.cause && e.cause.code) || null }; }
out.guard = Boolean(globalThis.__brainEgressGuard);
console.log('EGRESS ' + JSON.stringify(out));
process.exit(0);
`;

function parseEgress(stdout) {
  const line = String(stdout || '').split('\n').find((l) => l.startsWith('EGRESS '));
  return line ? JSON.parse(line.slice(7)) : { error: 'no EGRESS line: ' + String(stdout || '').slice(0, 200) };
}

// ---------------------------------------------------------------- the model endpoint stub
// Board 16 fit item (model off): the bench never opens Ollama's socket. BRAIN_MODEL_URL, for both
// instances and for the egress probe, names this stub on a free loopback port: /api/tags answers
// 200 with no models, anything else 503, and every request is counted. The guard routes the
// built-in 127.0.0.1:11434 to BRAIN_MODEL_URL, so a model call from the organism lands here too.
export async function modelStub() {
  const hits = {};
  const server = http.createServer((q, r) => {
    const k = q.method + ' ' + String(q.url || '').split('?')[0];
    hits[k] = (hits[k] || 0) + 1;
    const tags = String(q.url || '').startsWith('/api/tags');
    r.writeHead(tags ? 200 : 503, { 'content-type': 'application/json' });
    r.end(tags ? '{"models":[]}' : '{"error":"model off: bench/cloud.mjs model stub"}');
  });
  await new Promise((res) => server.listen(0, '127.0.0.1', res));
  return { url: 'http://127.0.0.1:' + server.address().port, hits, close: () => new Promise((res) => server.close(() => res())) };
}

// spawnSync with the event loop left free: the model stub answers from THIS process, so a
// blocking spawnSync held the stub's answer until the probe had timed out (the first bar run of
// 2026-09-25 read "not reached: 23 The operation was aborted due to timeout" while the stub
// counted GET /api/tags 1). Board 16 fit item.
function spawnAsync(cmd, args, opts = {}) {
  return new Promise((res) => {
    const p = spawn(cmd, args, { ...opts, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '', done = false;
    const t = setTimeout(() => { try { p.kill('SIGKILL'); } catch { /* gone */ } }, opts.timeout || 60_000);
    p.stdout.on('data', (d) => { stdout += d; });
    p.stderr.on('data', (d) => { stderr += d; });
    const end = (status, error) => { if (done) return; done = true; clearTimeout(t); res({ stdout, stderr, status, error: error || null }); };
    p.on('error', (e) => end(null, e));
    p.on('close', (code) => end(code));
  });
}

// ---------------------------------------------------------------- native driver
function nativeDriver({ stateDir, env0, modelUrl }) {
  const procs = [];
  return {
    mode: 'native',
    imageBytes: null,
    async start({ name, instance }) {
      const port = await freePort();
      const env = { ...process.env, ...env0, BRAIN_STATE_DIR: stateDir, BRAIN_NAME: name, BRAIN_INSTANCE: instance, HEALTH_PORT: String(port), HEALTH_HOST: '127.0.0.1', BRAIN_LADDER: 'off' };
      env.BRAIN_MODEL_URL = modelUrl; // the stub (model off); the guard routes 127.0.0.1:11434 to it
      const logFile = path.join(stateDir, instance + '.log');
      const out = createWriteStream(logFile);
      const p = fork(SERVE, [], { cwd: ROOT, env, execArgv: ['--max-old-space-size=96'], stdio: ['ignore', 'pipe', 'pipe', 'ipc'] });
      let buf = '';
      const onData = (d) => { out.write(d); buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { const l = buf.slice(0, i); buf = buf.slice(i + 1); if (l.startsWith('[serve]')) log('  ' + instance + ' ' + l); } };
      p.stdout.on('data', onData); p.stderr.on('data', onData);
      const exited = new Promise((r) => p.on('exit', (code, signal) => r({ code, signal })));
      const inst = { name, instance, port, url: 'http://127.0.0.1:' + port, proc: p, exited, logFile, statusFile: path.join(stateDir, name, 'serve.json') };
      procs.push(inst);
      return inst;
    },
    async killDaemon(inst, pid) { process.kill(pid, 'SIGKILL'); return { how: 'process.kill(' + pid + ', SIGKILL) from the bench (Windows: TerminateProcess)' }; },
    async stop(inst) {
      try { inst.proc.send({ op: 'stop' }); } catch { /* gone */ }
      const r = await Promise.race([inst.exited, new Promise((res) => setTimeout(res, 45_000, null).unref())]);
      if (!r) { try { inst.proc.kill('SIGKILL'); } catch { /* gone */ } }
      return r || { code: null, signal: 'SIGKILL after 45 s' };
    },
    async egress() {
      const closed = await freePort(); // a port nobody listens on; not 1, which fetch refuses as a bad port
      const r = await spawnAsync(process.execPath, ['--max-old-space-size=64', '--import', pathToFileURL(SERVE).href, '--input-type=module', '-e', EGRESS_SCRIPT], { cwd: ROOT, timeout: 60_000, env: { ...process.env, BRAIN_EGRESS_GUARD: '1', BRAIN_STATE_DIR: stateDir, BRAIN_MODEL_URL: modelUrl, PROBE_MODEL_URL: modelUrl, PROBE_CLOSED_PORT: String(closed), BRAIN_EGRESS_ALLOW: '127.0.0.1:' + closed } });
      const guarded = parseEgress(r.stdout);
      // the control: the same closed-port fetch with no guard (no network beyond this machine)
      const c = spawnSync(process.execPath, ['--max-old-space-size=64', '--input-type=module', '-e', "try { await fetch('http://127.0.0.1:' + process.env.PROBE_CLOSED_PORT + '/', { signal: AbortSignal.timeout(4000) }); console.log('CONTROL reached'); } catch (e) { console.log('CONTROL ' + (e.code || (e.cause && e.cause.code) || 'error')); }"], { cwd: ROOT, encoding: 'utf8', timeout: 30_000, env: { ...process.env, BRAIN_EGRESS_GUARD: '', PROBE_CLOSED_PORT: String(closed) } });
      const control = (String(c.stdout).split('\n').find((l) => l.startsWith('CONTROL ')) || 'CONTROL none').slice(8).trim();
      return { guarded, controlClosedPortUnguarded: control, where: 'a separate node process with --import bin/serve.mjs (the same guard the daemon installs)' };
    },
    async rssSample() { return null; },
    async cleanup() { for (const p of procs) { try { p.proc.kill('SIGKILL'); } catch { /* gone */ } } },
  };
}

// ---------------------------------------------------------------- docker driver
function dockerDriver({ env0, tag = 'brain-organism:bench' }) {
  const vol = 'brain-bench-' + process.pid;
  const names = [];
  const docker = (args, opts = {}) => spawnSync('docker', args, { encoding: 'utf8', timeout: opts.timeout || 120_000, cwd: ROOT, stdio: opts.inherit ? 'inherit' : 'pipe' });
  const common = () => ['--read-only', '--memory', '512m', '--memory-swap', '512m', '--cpus', '1', '--pids-limit', '256', '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges:true', '--tmpfs', '/tmp:size=64m,mode=1777', '--user', '1000:1000', '--init', '-v', vol + ':/state', '--add-host', 'host.docker.internal:host-gateway', '-e', 'BRAIN_LADDER=off', '-e', 'BRAIN_MODEL_URL=http://host.docker.internal:11434', ...Object.entries(env0).filter(([k]) => /^BRAIN_(MAJORS|UNITS|CHECKPOINT_EVERY|LEDGER|LEDGER_BUDGET_MB|HEAP_MB|EPISODES_MAX|RSS_CAP_MB|DISK_CAP_MB)$/.test(k)).flatMap(([k, v]) => ['-e', k + '=' + v])];
  const d = {
    mode: 'docker',
    imageBytes: null,
    async build() {
      const t0 = now();
      const b = docker(['build', '-t', tag, '.'], { inherit: true, timeout: 3_600_000 });
      if (b.status !== 0) throw new Error('docker build failed with ' + b.status);
      const s = docker(['image', 'inspect', '-f', '{{.Size}}', tag]);
      d.imageBytes = Number(String(s.stdout).trim()) || null;
      docker(['volume', 'create', vol]);
      return { ms: now() - t0, imageBytes: d.imageBytes };
    },
    async start({ name, instance }) {
      const cname = 'brain-bench-' + instance + '-' + process.pid;
      const r = docker(['run', '-d', '--name', cname, ...common(), '-p', '127.0.0.1::8080', '-e', 'BRAIN_NAME=' + name, '-e', 'BRAIN_INSTANCE=' + instance, tag]);
      if (r.status !== 0) throw new Error('docker run failed: ' + String(r.stderr).trim());
      names.push(cname);
      const p = docker(['port', cname, '8080']);
      const port = Number((/:(\d+)\s*$/m.exec(String(p.stdout)) || [])[1]);
      return { name, instance, cname, port, url: 'http://127.0.0.1:' + port };
    },
    async killDaemon(inst, pid) {
      const r = docker(['exec', inst.cname, 'node', '-e', 'process.kill(' + Number(pid) + ', "SIGKILL")']);
      return { how: 'docker exec ' + inst.cname + ' node -e process.kill(' + pid + ', SIGKILL)', code: r.status };
    },
    async stop(inst) { const r = docker(['stop', '-t', '40', inst.cname], { timeout: 90_000 }); return { code: r.status }; },
    async egress() {
      const r = docker(['exec', '-e', 'BRAIN_EGRESS_GUARD=1', '-e', 'PROBE_MODEL_URL=http://127.0.0.1:11434', names[0], 'node', '--import', '/app/bin/serve.mjs', '--input-type=module', '-e', EGRESS_SCRIPT], { timeout: 90_000 });
      return { guarded: parseEgress(r.stdout), where: 'docker exec in container A with --import /app/bin/serve.mjs (the model url is routed to BRAIN_MODEL_URL)' };
    },
    async rssSample(inst) {
      const r = docker(['stats', '--no-stream', '--format', '{{.MemUsage}}', inst.cname]);
      const m = /([\d.]+)\s*([KMG]i?B)/.exec(String(r.stdout));
      if (!m) return null;
      const mult = { KiB: 1 / 1024, KB: 1 / 1000, MiB: 1, MB: 1, GiB: 1024, GB: 1000 }[m[2]] || 1;
      return Math.round(Number(m[1]) * mult);
    },
    async cleanup() { for (const n of names) docker(['rm', '-f', n]); docker(['volume', 'rm', '-f', vol]); },
  };
  return d;
}

// ---------------------------------------------------------------- the timeline
async function timeline(drv, { seconds, env0, stateDir }) {
  const T0 = now();
  const at = (frac) => T0 + Math.round(seconds * 1000 * frac);
  const until = async (ms) => { const w = ms - now(); if (w > 0) await sleep(w); };
  const rows = { mode: drv.mode };
  const everyCk = Number(env0.BRAIN_CHECKPOINT_EVERY || 1000);
  let rssDocker = 0;
  const A = await drv.start({ name: 'cloud', instance: 'bench-a' });
  const health = async (inst) => (await getJson(inst.url + '/health')).body;
  const sampler = setInterval(async () => { const v = await drv.rssSample(A).catch(() => null); if (v && v > rssDocker) rssDocker = v; }, 10_000);
  try {
    const first = await waitFor('the first checkpoint of A', async () => { const h = await health(A); return h.ok && h.checkpoint && h.checkpoint.tick >= everyCk && h.tick > 0 ? h : null; }, 180_000);
    log('A up: first checkpoint t=' + first.value.checkpoint.tick + ' after ' + Math.round((now() - T0) / 1000) + ' s');

    await until(at(0.2));
    rows.healthBefore = await health(A);
    log('health before: ' + JSON.stringify(rows.healthBefore));

    await until(at(0.25));
    // the kill: a running daemon, read fresh (a budget kill may have replaced it a moment ago)
    let pre = null, pid = null, how = null, killAt = null;
    for (let i = 0; i < 20 && !how; i++) {
      pre = await health(A);
      if (pre.ok && pre.daemonPid && pre.resumedAt !== null) {
        pid = pre.daemonPid; killAt = now();
        try { how = await drv.killDaemon(A, pid); } catch (e) { log('kill of pid ' + pid + ' missed (' + (e.code || firstLine(e)) + '), reading again'); }
      }
      if (!how) await sleep(1000);
    }
    if (!how) throw new Error('no running daemon to kill in 20 s');
    const ckBefore = pre.checkpoint.tick, restartsBefore = pre.restarts, budgetBefore = pre.budgetKills;
    const back = await waitFor('the restart of A', async () => { const h = await health(A); return h.restarts > restartsBefore && h.daemonPid && h.daemonPid !== pid && h.resumedAt !== null ? h : null; }, 120_000, 250);
    rows.kill = { pid, how: how.how, checkpointTickAtKill: ckBefore, tickAtKill: pre.tick, restartsBefore, restartsAfter: back.value.restarts, budgetKillsBefore: budgetBefore, budgetKillsAfter: back.value.budgetKills, newPid: back.value.daemonPid, resumedAt: back.value.resumedAt, resumedFromCheckpoint: back.value.resumedAt >= ckBefore, msToRestart: now() - killAt, lastExit: back.value.lastExit, oldPidGone: !pidAlive(pid) || drv.mode === 'docker' };
    log('kill: daemon pid ' + pid + ' killed at t=' + pre.tick + ' (checkpoint t=' + ckBefore + '); restart count ' + back.value.restarts + ' after ' + rows.kill.msToRestart + ' ms, new pid ' + back.value.daemonPid + ', resumed at t=' + back.value.resumedAt + ' (from checkpoint: ' + rows.kill.resumedFromCheckpoint + ')');

    await until(at(0.45));
    const dup = await getJson(A.url + '/duplicate?seed=1', 30_000);
    rows.duplicate = { status: dup.status, ...dup.body };
    log('duplicate: GET /duplicate?seed=1 -> ' + dup.status + ' ' + (dup.body.name || '') + ', ' + dup.body.bytes + ' bytes, sha256 ' + String(dup.body.sha256 || '').slice(0, 16) + ', from checkpoint t=' + dup.body.fromTick);
    const dupAgain = await getJson(A.url + '/duplicate?seed=1');
    rows.duplicateAgain = { status: dupAgain.status, error: dupAgain.body.error || null };
    const B = await drv.start({ name: 'dup-1', instance: 'bench-b' });
    const bUp = await waitFor('instance B from the copy', async () => { const h = await health(B); return h.ok && h.resumedAt !== null && h.tick > 0 ? h : null; }, 180_000);
    const aNow = await health(A);
    rows.second = { name: 'dup-1', resumedAt: bUp.value.resumedAt, fromTick: dup.body.fromTick, resumedFromCopy: bUp.value.resumedAt === dup.body.fromTick, msToUp: bUp.ms, instancesAliveSeenByA: aNow.instancesAlive, instancesSeenByA: aNow.instances, instancesAliveSeenByB: bUp.value.instancesAlive };
    rows.instancesAlive = aNow.instancesAlive;
    log('second instance: dup-1 resumed at t=' + bUp.value.resumedAt + ' (copy was t=' + dup.body.fromTick + ') after ' + bUp.ms + ' ms; instances alive ' + aNow.instancesAlive + ' ' + JSON.stringify(aNow.instances));

    await until(at(0.6));
    rows.egress = await drv.egress();
    const g = rows.egress.guarded || {};
    log('egress: allowed ' + (g.allowed ? g.allowed.url + ' -> ' + (g.allowed.ok ? 'status ' + g.allowed.status + ', ' + g.allowed.models + ' models' : 'not reached: ' + g.allowed.code + ' ' + g.allowed.error) : 'n/a') + '; example.com fetch -> ' + (g.example ? (g.example.refused ? 'REFUSED ' + g.example.code : 'NOT refused ' + g.example.code) : 'n/a') + '; example.com http.get -> ' + (g.exampleHttp ? (g.exampleHttp.refused ? 'REFUSED' : 'NOT refused') + ' ' + g.exampleHttp.code : 'n/a') + '; closed local port guarded -> ' + (g.closedPort && g.closedPort.code) + ', unguarded control -> ' + rows.egress.controlClosedPortUnguarded);

    await until(at(1));
    rows.healthAfter = await health(A);
    rows.healthAfterB = await health(B);
    log('health after: ' + JSON.stringify(rows.healthAfter));
    rows.restartsBreakdown = { total: rows.healthAfter.restarts, budgetKills: rows.healthAfter.budgetKills, fromTheBenchKill: 1, other: rows.healthAfter.restarts - rows.healthAfter.budgetKills - 1 };
    log('restart count ' + rows.healthAfter.restarts + ' (1 from the bench kill, ' + rows.healthAfter.budgetKills + ' budget kills at the rss cap, ' + rows.restartsBreakdown.other + ' other); B: restarts ' + rows.healthAfterB.restarts + ', budget kills ' + rows.healthAfterB.budgetKills);
    const ep = rows.healthAfter.memory && rows.healthAfter.memory.episodic && rows.healthAfter.memory.episodic[0];
    if (ep) log('daemon memory at the end: heap used ' + rows.healthAfter.memory.heapUsedMb + ' MB, array buffers ' + rows.healthAfter.memory.arrayBuffersMb + ' MB; episodic record n=' + ep.n + ' cap=' + ep.cap + ' keys ' + ep.keyMb + ' MB, bound ' + ep.max + ' x ' + ep.d + ' lanes = ' + ep.boundMb + ' MB');
    rows.checkpoint = { ageS: rows.healthAfter.checkpoint.ageS, bytes: rows.healthAfter.checkpoint.bytes, tick: rows.healthAfter.checkpoint.tick, bytesAtBefore: rows.healthBefore.checkpoint.bytes, tickAtBefore: rows.healthBefore.checkpoint.tick };
    log('checkpoint age ' + rows.checkpoint.ageS + ' s, ' + rows.checkpoint.bytes + ' bytes at t=' + rows.checkpoint.tick + ' (at the before reading: ' + rows.checkpoint.bytesAtBefore + ' bytes at t=' + rows.checkpoint.tickAtBefore + ')');
    if (stateDir) {
      const ledgerDir = path.join(stateDir, 'cloud', 'ledger');
      rows.ledger = { diskBytes: dirBytes(ledgerDir), policy: rows.healthAfter.ledger && rows.healthAfter.ledger.policy, backstopRotations: rows.healthAfter.ledger && rows.healthAfter.ledger.backstopRotations };
      rows.egressLogLines = existsSync(path.join(stateDir, 'egress.log')) ? readFileSync(path.join(stateDir, 'egress.log'), 'utf8').trim().split('\n').filter(Boolean).length : 0;
    }

    const stopA = await drv.stop(A), stopB = await drv.stop(B);
    rows.stop = { a: stopA, b: stopB };
    if (stateDir) {
      const sa = JSON.parse(readFileSync(A.statusFile, 'utf8')), sb = JSON.parse(readFileSync(B.statusFile, 'utf8'));
      rows.rssPeakMb = { daemonA: sa.peak.daemonRssMb, serveA: sa.peak.serveRssMb, daemonB: sb.peak.daemonRssMb, serveB: sb.peak.serveRssMb, instanceA: sa.peak.daemonRssMb + sa.peak.serveRssMb, instanceB: sb.peak.daemonRssMb + sb.peak.serveRssMb };
      const pids = [sa.pid, sb.pid, sa.child && sa.child.pid, sb.child && sb.child.pid, pid].filter(Boolean);
      await sleep(1500);
      rows.orphans = pids.filter((p) => pidAlive(p));
      rows.stateBytesAtEnd = dirBytes(stateDir);
      rows.finalTicks = { a: sa.child && sa.child.lastT, b: sb.child && sb.child.lastT };
    } else {
      rows.rssPeakMb = { container: rssDocker };
      rows.orphans = [];
    }
    log('rss peak: ' + JSON.stringify(rows.rssPeakMb) + '; stopped A ' + JSON.stringify(stopA) + ', B ' + JSON.stringify(stopB) + '; pids still alive ' + JSON.stringify(rows.orphans));
  } finally { clearInterval(sampler); }
  rows.wallMs = now() - T0;
  return rows;
}

// ---------------------------------------------------------------- main
function args(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const k = a.slice(2), v = argv[i + 1];
    if (v === undefined || v.startsWith('--')) out[k] = true; else { out[k] = v; i++; }
  }
  return out;
}

function writeOnce(base) {
  mkdirSync(VERDICTS, { recursive: true });
  let f = path.join(VERDICTS, base + '.json');
  for (let n = 2; existsSync(f); n++) f = path.join(VERDICTS, base + '-' + n + '.json');
  return f;
}

async function main() {
  const a = args(process.argv.slice(2));
  const seconds = a.seconds && a.seconds !== true ? Number(a.seconds) : 300;
  const command = 'node bench/cloud.mjs' + (process.argv.length > 2 ? ' ' + process.argv.slice(2).join(' ') : '');
  const t0 = now();

  for (let i = 0; ; i++) {
    const r = freeRamGb();
    log('free RAM ' + r.gb + ' GB (' + r.via + ')');
    if (r.gb >= 16) break;
    if (i >= 60) { log('free RAM stayed under 16 GB for 30 minutes: not running'); process.exitCode = 3; return; }
    await sleep(30_000);
  }

  const probe = a.native ? { present: false, why: '--native asked for' } : dockerProbe();
  log('docker: ' + (probe.present ? 'server ' + probe.server : 'ABSENT, ' + probe.why));
  const env0 = composeEnv();
  const override = a['episodes-max'] !== undefined && a['episodes-max'] !== true ? String(a['episodes-max']) : null;
  const composeEpisodesMax = env0.BRAIN_EPISODES_MAX ?? null;
  if (override !== null) { env0.BRAIN_EPISODES_MAX = override; log('CONTROL: BRAIN_EPISODES_MAX ' + override + ' replaces compose.yaml ' + composeEpisodesMax + ' (this run writes cloud-partial)'); }
  log('caps from compose.yaml: ' + ['BRAIN_MAJORS', 'BRAIN_UNITS', 'BRAIN_CHECKPOINT_EVERY', 'BRAIN_LEDGER', 'BRAIN_LEDGER_BUDGET_MB', 'BRAIN_HEAP_MB', 'BRAIN_EPISODES_MAX', 'BRAIN_RSS_CAP_MB', 'BRAIN_DISK_CAP_MB'].map((k) => k + '=' + env0[k]).join(' ') + '; container mem_limit 512m, cpus 1.0');

  // the build context and its secret scan, with the control that proves the scan can see
  const ctx = contextFiles(ROOT);
  const scan = scanSecrets(ctx.files, ROOT);
  const noSecretLines = readIgnore(ROOT).filter((p) => !/env|pem|key|p12|pfx|id_|npmrc|netrc|ssh|aws|vercel/.test(p));
  const ctxControl = contextFiles(ROOT, { patterns: noSecretLines });
  const extra = ctxControl.files.filter((f) => !ctx.files.some((g) => g.rel === f.rel));
  const control = scanSecrets(extra, ROOT);
  const context = { files: ctx.files.length, bytes: ctx.bytes, skipped: ctx.skipped, secretHits: scan.hits.length, planted: scan.planted.length, textFilesScanned: scan.scanned, textBytesScanned: scan.bytesScanned, binaryNotScanned: scan.binarySkipped, control: { patternsDropped: readIgnore(ROOT).length - noSecretLines.length, extraFiles: extra.length, hitsInThem: control.hits.length, kinds: [...new Set(control.hits.map((h) => h.kind))], files: [...new Set(control.hits.map((h) => h.rel))] } };
  log('build context: ' + ctx.files.length + ' files, ' + ctx.bytes + ' bytes; secret hits ' + scan.hits.length + ' (planted fixtures allowed ' + scan.planted.length + '); control without the secret lines of .dockerignore: ' + control.hits.length + ' hits in ' + context.control.files.length + ' files ' + JSON.stringify(context.control.files));

  let stateDir = null, drv, rows, error = null, build = null, stub = null, flag = null;
  try {
    if (probe.present) {
      drv = dockerDriver({ env0 });
      build = await drv.build();
      log('image bytes ' + build.imageBytes + ' (built in ' + build.ms + ' ms)');
    } else {
      stateDir = mkdtempSync(path.join(os.tmpdir(), 'brain-cloud-bench-'));
      // natively the daemons run THIS tree: while this bench's flag is up (the bench flag protocol of
      // daemon/run.mjs, state/bench-flags/<pid>.json) they refuse the self-code step, which would
      // otherwise run the real tree's self/autopilot.mjs in a worker (board 16 fit item, 2026-09-25)
      const { raiseBenchFlag } = await import('../daemon/run.mjs');
      flag = raiseBenchFlag({ command });
      log('bench flag raised: ' + path.relative(ROOT, flag.file) + ' (the daemons refuse their self-code step while it is up)');
      stub = await modelStub();
      log('model endpoint: stub ' + stub.url + ' (model off: Ollama is never contacted)');
      drv = nativeDriver({ stateDir, env0, modelUrl: stub.url });
      log('image bytes: n/a (docker absent); running bin/serve.mjs natively, state ' + stateDir);
    }
    rows = await timeline(drv, { seconds, env0, stateDir });
  } catch (e) {
    error = firstLine(e);
    log('RUN FAILED: ' + error);
  } finally {
    if (drv) await drv.cleanup().catch(() => {});
    if (stub) await stub.close().catch(() => {});
    if (flag) flag.lower();
    if (stateDir && !a.keep) { await sleep(500); rmSync(stateDir, { recursive: true, force: true }); }
  }

  const r = rows || {};
  const g = (r.egress && r.egress.guarded) || {};
  const allowedOk = Boolean(g.allowed && (g.allowed.ok || (g.allowed.code && g.allowed.code !== 'EGRESS_REFUSED')));
  const pass = {
    restartCountIs1: Boolean(r.kill && r.kill.restartsAfter === 1 && r.healthAfter && r.healthAfter.restarts === 1),
    resumedFromCheckpoint: Boolean(r.kill && r.kill.resumedFromCheckpoint),
    duplicateCopied: Boolean(r.duplicate && r.duplicate.status === 200 && r.duplicate.bytes > 0),
    secondFromCopy: Boolean(r.second && r.second.resumedFromCopy),
    instancesAlive2: r.instancesAlive === 2,
    exampleRefused: Boolean(g.example && g.example.refused && g.exampleHttp && g.exampleHttp.refused),
    allowedHostReachedOrDocumented: allowedOk,
    healthOkBeforeAndAfter: Boolean(r.healthBefore && r.healthBefore.ok && r.healthAfter && r.healthAfter.ok),
    noSecretInContext: context.secretHits === 0,
    secretControlSees: context.control.hitsInThem > 0,
    noOrphans: Array.isArray(r.orphans) && r.orphans.length === 0,
  };
  const capMb = 512;
  const peakInstance = r.rssPeakMb ? (r.rssPeakMb.instanceA ?? r.rssPeakMb.container ?? null) : null;
  const fitsCap = peakInstance !== null ? peakInstance <= capMb : null;
  const allPass = !error && Object.values(pass).every(Boolean);
  // BAR ROWS (Board 16 fit item, 2026-09-25). Before this, isTheBar needed docker and there was no
  // barMet: a native run was always partial. Now a completed 300 s run is the bar in either mode,
  // a control run (--episodes-max) never is, and barMet is every one of these rows:
  const rssCap = Number(env0.BRAIN_RSS_CAP_MB || 448);
  const h1a = r.healthAfter || {};
  const bar = {
    restartCount1NoBudgetKill: Boolean(r.kill && r.kill.restartsAfter === 1 && h1a.restarts === 1 && h1a.budgetKills === 0),
    resumedFromCheckpoint: Boolean(r.kill && r.kill.resumedFromCheckpoint),
    duplicate200Then409SecondFromCopy: Boolean(r.duplicate && r.duplicate.status === 200 && r.duplicateAgain && r.duplicateAgain.status === 409 && r.second && r.second.resumedFromCopy),
    egressModelEndpointAllowed: allowedOk,
    egressExampleRefused: pass.exampleRefused,
    healthOkAfter: h1a.ok === true,
    daemonPeakRssUnderCap: Boolean(r.rssPeakMb && Number.isFinite(r.rssPeakMb.daemonA) && Number.isFinite(r.rssPeakMb.daemonB) && r.rssPeakMb.daemonA < rssCap && r.rssPeakMb.daemonB < rssCap),
    checkpointAgeUnder60s: Boolean(r.checkpoint && Number.isFinite(r.checkpoint.ageS) && r.checkpoint.ageS < 60),
  };
  const barRowsMet = Object.values(bar).every(Boolean);
  const completed = !error && seconds >= 300 && Boolean(r.healthAfter);
  const isTheBar = Boolean(completed && override === null);
  const barMet = Boolean(isTheBar && barRowsMet);
  const verdict = {
    at: new Date().toISOString(), command, node: process.version, isTheBar, barMet,
    bar, barRowsMet, rssCapMb: rssCap,
    episodesMax: { run: env0.BRAIN_EPISODES_MAX ?? null, composeYaml: composeEpisodesMax, control: override !== null, keyMbAtBound: env0.BRAIN_EPISODES_MAX ? Math.round(Number(env0.BRAIN_EPISODES_MAX) * 8192 / 1048576) : null },
    modelEndpoint: stub ? { url: stub.url, stub: true, requests: stub.hits, why: 'model off (Board 16 fit item): BRAIN_MODEL_URL and PROBE_MODEL_URL name this stub; the guard routes 127.0.0.1:11434 to it' } : { url: 'http://host.docker.internal:11434', stub: false },
    benchFlag: flag ? { file: path.relative(ROOT, flag.file), lowered: !existsSync(flag.file), why: 'natively the daemons run this tree; with the flag up they refuse the self-code step (self/autopilot.mjs in a worker), which in a container runs on the image copy' } : null,
    split: { development: 'the fit item memory probes (bin/serve.mjs natively, census every 5 s, notes/cloud.md Measured) chose BRAIN_EPISODES_MAX before this run', heldOut: 'this run: none of its rows fed the choice of the bound', control: override !== null ? 'this run IS the control (BRAIN_EPISODES_MAX ' + override + ')' : 'the same command with --episodes-max 65536 (the old default bound) is the intervention off' },
    mode: probe.present ? 'docker' : 'native',
    docker: probe.present ? { present: true, server: probe.server } : { present: false, field: 'docker', why: probe.why, consequence: 'no image was built, so imageBytes is null and the container caps (mem_limit 512m, cpus 1.0, read_only) were not exercised; bin/serve.mjs ran natively with the same environment and its own rss cap' },
    seconds, error,
    imageBytes: build ? build.imageBytes : null,
    caps: { composeEnv: env0, containerMemLimitMb: capMb, cpus: 1.0, enforcedHere: probe.present ? 'docker: memory 512m, cpus 1, read-only root, non-root user' : 'native: daemon heap BRAIN_HEAP_MB and the supervisor rss cap BRAIN_RSS_CAP_MB; no cpu cap, no read-only root' },
    context,
    restartCount: r.healthAfter ? r.healthAfter.restarts : null,
    instancesAlive: r.instancesAlive ?? null,
    checkpointAgeS: r.checkpoint ? r.checkpoint.ageS : null,
    rssPeakMb: r.rssPeakMb || null,
    fitsContainerCap: fitsCap,
    pass, allPass,
    rows: r,
    wallMs: now() - t0,
  };
  const h1 = r.healthAfter || {};
  const epEnd = h1.memory && Array.isArray(h1.memory.episodic) ? h1.memory.episodic[0] : null;
  verdict.memoryAtEnd = h1.memory || null;
  verdict.restartsBreakdown = r.restartsBreakdown || null;
  verdict.statement = (probe.present ? 'Docker ' + probe.server + ' was present: the image was built (' + verdict.imageBytes + ' bytes) and run under compose.yaml caps. ' : 'Docker is absent on this machine (' + probe.why + '), so no image was built and the verdict is partial: bin/serve.mjs ran natively for ' + seconds + ' s with the environment compose.yaml declares. ')
    + (error ? 'The run failed: ' + error + '. ' : '')
    + (r.kill ? 'The daemon (pid ' + r.kill.pid + ') was killed with SIGKILL at t=' + r.kill.tickAtKill + ' with its checkpoint at t=' + r.kill.checkpointTickAtKill + '; the supervisor restarted it in ' + r.kill.msToRestart + ' ms, resumed at t=' + r.kill.resumedAt + ', and /health reported restarts ' + h1.restarts + ' at the end. ' : '')
    + (r.duplicate ? 'GET /duplicate?seed=1 copied ' + r.duplicate.bytes + ' bytes (checkpoint t=' + r.duplicate.fromTick + ') to dup-1; a second instance resumed from it at t=' + (r.second && r.second.resumedAt) + ' and instances alive read ' + r.instancesAlive + '. ' : '')
    + (g.example ? 'Egress: example.com was ' + (g.example.refused ? 'refused by the guard (' + g.example.code + ')' : 'NOT refused') + ', the model endpoint ' + (g.allowed && g.allowed.ok ? 'answered ' + g.allowed.status + ' with ' + g.allowed.models + ' models' : 'was allowed but not reached (' + (g.allowed && g.allowed.code) + ')') + '. ' : '')
    + (r.checkpoint ? 'At the end the checkpoint was ' + r.checkpoint.ageS + ' s old and ' + r.checkpoint.bytes + ' bytes at t=' + r.checkpoint.tick + ' (it was ' + r.checkpoint.bytesAtBefore + ' bytes at t=' + r.checkpoint.tickAtBefore + '). ' : '')
    + (r.restartsBreakdown ? 'Restart count at the end: ' + r.restartsBreakdown.total + ' (1 from the bench kill, ' + r.restartsBreakdown.budgetKills + ' budget kills when the daemon passed the ' + env0.BRAIN_RSS_CAP_MB + ' MB rss cap, ' + r.restartsBreakdown.other + ' other). ' : '')
    + (r.rssPeakMb ? 'Peak RSS: ' + JSON.stringify(r.rssPeakMb) + ' MB against the 512 MB container cap (fits: ' + fitsCap + '). ' : '')
    + (epEnd ? 'The episodic record at the end: n=' + epEnd.n + ' episodes in a capacity of ' + epEnd.cap + ' (' + epEnd.keyMb + ' MB of keys), bounded at ' + epEnd.max + ' keys of ' + epEnd.d + ' lanes = ' + epEnd.boundMb + ' MB, evicted ' + epEnd.evicted + '. ' : '')
    + 'Bar rows (' + (override !== null ? 'CONTROL run, BRAIN_EPISODES_MAX ' + override + ', never the bar' : 'mode ' + (probe.present ? 'docker' : 'native, the documented fallback') + ', isTheBar ' + isTheBar) + '): ' + Object.entries(bar).map(([k, v]) => k + ' ' + v).join(', ') + '; barMet ' + barMet + '. The model endpoint was ' + (stub ? 'a local stub (' + JSON.stringify(stub.hits) + ' requests), never Ollama' : 'host.docker.internal:11434') + '. '
    + 'The build context is ' + context.files + ' files and ' + context.bytes + ' bytes with ' + context.secretHits + ' secret hits; the control scan without the secret lines of .dockerignore found ' + context.control.hitsInThem + ' hits in ' + context.control.files.length + ' files.';

  const file = writeOnce(isTheBar ? 'cloud' : 'cloud-partial');
  const outFile = a.out && a.out !== true ? path.resolve(a.out) : file;
  writeFileSync(outFile, JSON.stringify(verdict, null, 2) + '\n');
  log('pass ' + JSON.stringify(pass));
  log('bar ' + JSON.stringify(bar) + ' barMet ' + barMet + ' (isTheBar ' + isTheBar + ', episodes max ' + env0.BRAIN_EPISODES_MAX + (override !== null ? ', CONTROL' : '') + ', model stub requests ' + JSON.stringify(stub ? stub.hits : null) + ')');
  log('CLOUD ' + verdict.mode + ': restarts ' + verdict.restartCount + ', instances alive ' + verdict.instancesAlive + ', checkpoint age ' + verdict.checkpointAgeS + ' s, rss peak ' + JSON.stringify(verdict.rssPeakMb) + ', fits 512 MB ' + fitsCap + ', all pass ' + allPass + ', isTheBar ' + isTheBar);
  log('verdict ' + path.relative(ROOT, outFile).replace(/\\/g, '/') + ' (' + Math.round((now() - t0) / 1000) + ' s)');
  process.exitCode = allPass && barRowsMet ? 0 : 1;
}

const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) await main();
