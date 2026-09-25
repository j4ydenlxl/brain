#!/usr/bin/env node
// bench/cloud-host.mjs: THE P13 RULER, READ FROM THE HOST (his 2026-09-23 17:30: "It should live
// 24/7 on the cloud remember Its literally a sandboxed ARTIFICIAL SUPERINTELLIGENCE"; his
// 2026-09-25 about 17:05: "set up the p13 idk how idk"). Writes bench/verdicts/cloud-host.json.
//
//   node bench/cloud-host.mjs [--days 7] [--checkout-trial SECONDS]
//                             [--counterfactual FILE[,FILE] [--repeat N]] [--root DIR] [--out FILE]
//
// FROM THE HOST (GitHub Actions on his account, the orchestrator's ASSUMPTION of 2026-09-25; test:
// his confirmation), read with gh, read only: `gh run list --workflow cloud.yml` (status,
// conclusion, createdAt, startedAt, updatedAt) and `gh run download <id> -n brain-cloud` for every
// completed run of the window into a temp dir that is deleted before the verdict is written.
// Rows: runs and their conclusions, uptime as a fraction of the window (the container's minutes
// from each run's health.json uptimeS, over 10,080 for 7 days), Actions minutes used, and from the
// newest run: health ok, restarts inside the job (serve's plus the container's), ticks per hour
// (recomputed from health.log), checkpoint age and bytes at the end, and the LADDER line from
// ladder.log (the newest run that has one).
//
// ON THIS PC: the workflow parses (tools/cloud-github.mjs parseYaml, no dependency) and passes
// its structural checks, every tree file it names exists, and with --checkout-trial the
// committed tree (git archive HEAD, nothing untracked, no .git, no state) boots natively under
// bin/serve.mjs with the environment compose.yaml declares for SECONDS, with the ladder off and
// the model endpoint pointed at a closed local port (no socket to Ollama is ever opened).
// --counterfactual F runs the same trial N more times (--repeat, 3 by default) on HEAD plus the
// working tree's F: the intervention arm, with its run-to-run band printed; the HEAD trial is its
// control (the intervention off). The counterfactual is recorded apart (pc.counterfactual) and is
// never read as the tree's own trial.
//
// EVERY TRIAL RUNS IN ITS OWN PROCESS (this file with --trial-worker) inside a copy this process
// made and owns (owner.json names its pid). A trial process that dies (a native crash such as
// 0xC0000409 skips every finally) is recorded with its exit code, its serve and daemon are
// killed, its copy is deleted here, and it is tried once more. Copies a dead run left behind
// (owner pid gone, or no owner.json and older than 15 minutes) are swept before a trial starts.
//
// THE BAR (tools/cloud-github.mjs barOf, the same function the control below grades): a
// scheduled or dispatched run concluded success with health ok true, restarts 0 inside the job,
// checkpoint age under 120 s at the end, and the LADDER line present from the host. When gh is
// not logged in, or no origin exists, or no run exists, every host row prints "not measured:
// <cause>" and barMet is false. The bar is never widened to pass.
import { fork, spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync, readdirSync, statfsSync, statSync, lstatSync } from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT as TREE, WORKFLOW_REL, ARTIFACT, BAR, barOf, ghStatus, git, runCmd, workflowReport, parseYaml } from '../tools/cloud-github.mjs';

const SELF = fileURLToPath(import.meta.url);
const HERE = path.dirname(SELF);
const firstLine = (s) => String(s || '').trim().split(/\r?\n/)[0] || '';
const readJson = (f) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const r1 = (x) => Math.round(x * 10) / 10;
const r4 = (x) => Math.round(x * 1e4) / 1e4;
const mb = (b) => Math.round(b / 1048576 * 10) / 10;

export const HOST_ROWS = ['gh', 'repository', 'runs', 'conclusions', 'uptimeFraction', 'actionsMinutes', 'newestRun', 'healthOk', 'restartsInJob', 'ticksPerHour', 'checkpointAgeS', 'checkpointBytes', 'ladderLine'];
const row = (value, extra = {}) => ({ measured: true, value, ...extra });
const notMeasured = (cause) => ({ measured: false, value: null, cause });

/** Ticks per hour from a health.log of JSON lines {epoch, health: {tick}}. */
export function ticksPerHourOf(logText) {
  const t = String(logText || '').split(/\r?\n/).filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } })
    .filter((x) => x && x.health && Number.isFinite(x.health.tick) && Number.isFinite(x.epoch));
  if (t.length < 2 || !(t[t.length - 1].epoch > t[0].epoch)) return null;
  return Math.floor((t[t.length - 1].health.tick - t[0].health.tick) / (t[t.length - 1].epoch - t[0].epoch) * 3600);
}

/** One run's artifact directory read into a reading. */
export function readingOf(run, dir) {
  const ladder = existsSync(path.join(dir, 'ladder.log')) ? readFileSync(path.join(dir, 'ladder.log'), 'utf8') : '';
  const ladderLine = ladder.split(/\r?\n/).find((l) => /^LADDER \d{4}-\d{2}-\d{2}:/.test(l)) || null;
  const log = existsSync(path.join(dir, 'health.log')) ? readFileSync(path.join(dir, 'health.log'), 'utf8') : '';
  return { run, health: readJson(path.join(dir, 'health.json')), container: readJson(path.join(dir, 'container.json')), job: readJson(path.join(dir, 'run.json')), ticksPerHour: ticksPerHourOf(log), ladderLine };
}

/** Every host row, read only. env carries PATH (a planted gh in the tests). */
export function measureHost({ root = TREE, env = process.env, days = 7, now = Date.now(), log = () => {} } = {}) {
  const rows = {};
  const all = (cause) => { for (const k of HOST_ROWS) rows[k] = notMeasured(cause); return { rows, readings: [], cause }; };
  const st = ghStatus(env);
  if (!st.gh) return all('gh is not on PATH');
  if (!st.loggedIn) return all('gh not logged in');
  const origin = git(root, ['remote', 'get-url', 'origin']);
  if (origin.code !== 0) return all('no origin remote: the repository was never created (node tools/cloud-github.mjs)');
  // from here gh and the repository are read; the rows after them wait on a run
  const rest = (cause) => { for (const k of HOST_ROWS) if (!rows[k]) rows[k] = notMeasured(cause); return { rows, readings: [], cause }; };
  rows.gh = row('logged in', { path: st.gh, version: st.version });
  const view = runCmd(st.gh, ['repo', 'view', '--json', 'nameWithOwner,visibility,defaultBranchRef'], { cwd: root, env, timeoutMs: 60_000 });
  let repo = null;
  try { repo = JSON.parse(view.stdout); } catch { /* read below as null */ }
  rows.repository = row(origin.stdout.trim(), repo ? { nameWithOwner: repo.nameWithOwner, visibility: repo.visibility, defaultBranch: repo.defaultBranchRef ? repo.defaultBranchRef.name : null } : { view: firstLine(view.stderr) || null });
  const list = runCmd(st.gh, ['run', 'list', '--workflow', 'cloud.yml', '--limit', '100', '--json', 'databaseId,number,event,status,conclusion,createdAt,startedAt,updatedAt,url'], { cwd: root, env, timeoutMs: 120_000 });
  if (list.code !== 0) {
    const err = firstLine(list.stderr || list.error);
    if (/HTTP 404/.test(err) && /not found on the default branch/.test(err)) return rest('cloud.yml is not on the default branch' + (rows.repository.defaultBranch ? ' (' + rows.repository.defaultBranch + ')' : '') + ' of ' + (rows.repository.nameWithOwner || rows.repository.value) + ' yet');
    return rest('gh run list failed: ' + err);
  }
  let runs;
  try { runs = JSON.parse(list.stdout); } catch { return rest('gh run list printed no JSON'); }
  if (!Array.isArray(runs)) return rest('gh run list printed no list');
  const since = now - days * 86_400_000;
  const win = runs.filter((r) => Date.parse(r.createdAt) >= since).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  if (!runs.length) return rest('no run of cloud.yml yet');
  if (!win.length) return rest('no run of cloud.yml in the last ' + days + ' days (' + runs.length + ' older)');
  rows.runs = row(win.length, { window: days + ' days', ids: win.map((r) => r.databaseId) });
  const tally = {};
  for (const r of win) { const k = r.status === 'completed' ? String(r.conclusion) : String(r.status); tally[k] = (tally[k] || 0) + 1; }
  rows.conclusions = row(tally);
  let minutes = 0;
  for (const r of win) if (r.status === 'completed') minutes += Math.max(0, (Date.parse(r.updatedAt) - Date.parse(r.startedAt || r.createdAt)) / 60000);
  rows.actionsMinutes = row(r1(minutes), { how: 'updatedAt minus startedAt over the completed runs of the window; GitHub bills each job rounded up to the minute' });

  const tmp = mkdtempSync(path.join(os.tmpdir(), 'brain-cloud-host-'));
  const readings = [], missing = [];
  try {
    for (const r of win.filter((x) => x.status === 'completed').slice(0, 40)) {
      const dir = path.join(tmp, String(r.databaseId));
      const d = runCmd(st.gh, ['run', 'download', String(r.databaseId), '-n', ARTIFACT, '-D', dir], { cwd: root, env, timeoutMs: 300_000 });
      if (d.code !== 0) { missing.push({ id: r.databaseId, cause: firstLine(d.stderr || d.error) || 'exit ' + d.code }); continue; }
      readings.push(readingOf(r, dir));
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true, maxRetries: 5 });
  }
  log('downloaded ' + readings.length + ' artifact(s), ' + missing.length + ' missing; temp dir deleted: ' + !existsSync(tmp));
  const upS = readings.reduce((s, x) => s + (x.health && Number.isFinite(x.health.uptimeS) ? x.health.uptimeS : 0), 0);
  rows.uptimeFraction = row(r4(upS / 60 / (days * 1440)), { containerMinutes: r1(upS / 60), windowMinutes: days * 1440, artifactsMissing: missing });
  const newest = readings[0];
  if (!newest) {
    for (const k of ['newestRun', 'healthOk', 'restartsInJob', 'ticksPerHour', 'checkpointAgeS', 'checkpointBytes']) rows[k] = notMeasured('no artifact could be downloaded (' + (missing[0] ? missing[0].cause : 'none completed') + ')');
  } else {
    const h = newest.health || {};
    rows.newestRun = row({ id: newest.run.databaseId, number: newest.run.number, event: newest.run.event, conclusion: newest.run.conclusion, createdAt: newest.run.createdAt, url: newest.run.url });
    rows.healthOk = row(h.ok === true);
    const cr = newest.container && Number.isFinite(newest.container.restartCount) ? newest.container.restartCount : 0;
    rows.restartsInJob = Number.isFinite(h.restarts) ? row(h.restarts + cr, { serve: h.restarts, container: cr, budgetKills: h.budgetKills ?? null }) : notMeasured('health.json has no restarts field');
    rows.ticksPerHour = newest.ticksPerHour === null ? notMeasured('health.log has fewer than two ticks') : row(newest.ticksPerHour);
    rows.checkpointAgeS = h.checkpoint && Number.isFinite(h.checkpoint.ageS) ? row(h.checkpoint.ageS) : notMeasured('no checkpoint in the last health read');
    rows.checkpointBytes = h.checkpoint && Number.isFinite(h.checkpoint.bytes) ? row(h.checkpoint.bytes) : notMeasured('no checkpoint in the last health read');
  }
  const lad = readings.find((x) => x.ladderLine);
  rows.ladderLine = lad ? row(lad.ladderLine, { run: lad.run.databaseId, event: lad.run.event }) : notMeasured('no LADDER line in any ladder.log of the window (a scheduled run, or a dispatch with ladder=true, runs it)');
  return { rows, readings, cause: null };
}

// ---------------------------------------------------------------- small process helpers
/** Wait for p or ms, whichever is first; the timer is cleared either way, so no handle outlives the wait. */
export async function within(p, ms) {
  let t;
  const timeout = new Promise((r) => { t = setTimeout(() => r('timeout'), ms); });
  try { return await Promise.race([Promise.resolve(p).then(() => 'done'), timeout]); } finally { clearTimeout(t); }
}

/** True when a process of that pid exists (EPERM: it exists and is not ours). */
export function pidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; }
}

function duBytes(d) {
  let n = 0;
  const walk = (p) => {
    let st;
    try { st = lstatSync(p); } catch { return; }
    if (st.isDirectory()) { let names = []; try { names = readdirSync(p); } catch { return; } for (const e of names) walk(path.join(p, e)); } else n += st.size;
  };
  walk(d);
  return n;
}

// ---------------------------------------------------------------- stale copies
export const TRIAL_PREFIX = 'brain-checkout-';
const OWNER_FILE = 'owner.json';

/**
 * Trial copies a dead run left behind (a native crash skips every finally). A copy whose
 * owner.json names a live pid belongs to a run in progress and is kept; a copy with no owner.json
 * (written before this sweep existed) is swept only when older than minAgeMs.
 */
export function sweepStale({ dir = os.tmpdir(), minAgeMs = 15 * 60_000, now = Date.now(), alive = pidAlive } = {}) {
  const out = { found: 0, swept: 0, bytes: 0, kept: 0, failed: [] };
  let names = [];
  try { names = readdirSync(dir).filter((n) => n.startsWith(TRIAL_PREFIX)); } catch { return out; }
  for (const n of names) {
    const d = path.join(dir, n);
    let st;
    try { st = statSync(d); } catch { continue; }
    if (!st.isDirectory()) continue;
    out.found++;
    const owner = readJson(path.join(d, OWNER_FILE));
    const stale = owner && Number.isInteger(owner.pid) ? !alive(owner.pid) : now - st.mtimeMs > minAgeMs;
    if (!stale) { out.kept++; continue; }
    const b = duBytes(d);
    try { rmSync(d, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* read back below */ }
    if (existsSync(d)) out.failed.push(n); else { out.swept++; out.bytes += b; }
  }
  return out;
}

// ---------------------------------------------------------------- the checkout trial (this PC)
const freePort = () => new Promise((res, rej) => { const s = net.createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); s.on('error', rej); });

/** GET a JSON body with node:http, no agent pool (no socket outlives the call); null on any failure. */
function getJson(url, ms) {
  return new Promise((resolve) => {
    let settled = false;
    const done = (v) => { if (!settled) { settled = true; resolve(v); } };
    const req = http.get(url, { agent: false, timeout: ms }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { body += c; });
      res.on('end', () => { try { done(JSON.parse(body)); } catch { done(null); } });
      res.on('error', () => done(null));
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', () => done(null));
  });
}

/** Extract a tar held in a Buffer (ustar and pax path records, as git archive writes them). */
export function untar(buf, dest) {
  let off = 0, files = 0, bytes = 0, skipped = 0, paxPath = null;
  const str = (b) => b.toString('utf8').replace(/\0.*$/s, '');
  while (off + 512 <= buf.length) {
    const h = buf.subarray(off, off + 512);
    if (h.every((x) => x === 0)) break;
    const size = parseInt(str(h.subarray(124, 136)).trim() || '0', 8);
    const type = String.fromCharCode(h[156] || 48);
    const prefix = str(h.subarray(345, 500));
    let name = paxPath || (prefix ? prefix + '/' : '') + str(h.subarray(0, 100));
    paxPath = null;
    const body = buf.subarray(off + 512, off + 512 + size);
    off += 512 + Math.ceil(size / 512) * 512;
    if (type === 'x') { const m = /\d+ path=([^\n]*)\n/.exec(body.toString('utf8')); if (m) paxPath = m[1]; continue; }
    if (type === 'g') continue;
    const out = path.join(dest, name);
    if (path.relative(dest, out).startsWith('..')) throw new Error('tar entry escapes the destination: ' + name);
    if (type === '5') { mkdirSync(out, { recursive: true }); continue; }
    if (type === '0' || type === '\0' || type === '7') { mkdirSync(path.dirname(out), { recursive: true }); writeFileSync(out, body); files++; bytes += size; continue; }
    skipped++; // a symlink or a special file: the runner's checkout would hold it, this trial does not
  }
  return { files, bytes, skipped };
}

/** compose.yaml's x-organism-env with ${VAR:-default} read as its default. */
export function composeEnv(text) {
  const doc = parseYaml(text);
  const env = {};
  for (const [k, v] of Object.entries((doc && doc['x-organism-env']) || {})) {
    const m = /^\$\{[A-Z0-9_]+:-(.*)\}$/.exec(String(v));
    env[k] = m ? m[1] : String(v);
  }
  return env;
}

/** Files the tree lacked, from ENOENT lines a failing child printed, relative to the tree. */
export function missingFrom(lines, tree) {
  const out = new Set();
  for (const l of lines) {
    const m = /ENOENT: no such file or directory, (?:open|stat|scandir|lstat) '([^']+)'/.exec(l);
    if (!m) continue;
    const rel = path.relative(tree, m[1]);
    if (rel && !rel.startsWith('..') && !path.isAbsolute(rel)) out.add(rel.split(path.sep).join('/'));
  }
  return [...out].sort();
}

const sourceOf = (overlay) => 'git archive HEAD' + (overlay.length ? ' plus ' + overlay.length + ' file(s) from the working tree' : '');

/**
 * The trial itself, in its own process (--trial-worker PARAMS): extract HEAD into the copy the
 * supervisor made, lay the overlay on top, boot bin/serve.mjs, poll /health, stop, and write
 * result.json into the copy. It never deletes the copy: the supervisor does, whatever happens here.
 */
async function trialWorker(paramsFile) {
  const p = JSON.parse(readFileSync(paramsFile, 'utf8'));
  const out = { seconds: p.seconds, source: sourceOf(p.overlay || []) };
  try {
    return await trialBody(p, out);
  } catch (e) {
    // a thrown error is a reading, not a crash: it is written, and the supervisor kills what is left
    out.error = 'the trial threw: ' + firstLine(e && e.stack ? e.stack : e);
    writeFileSync(path.join(p.tmp, 'result.json'), JSON.stringify(out));
    return 1;
  }
}

async function trialBody({ root, tmp, seconds, overlay = [] }, out) {
  const log = (l) => console.log('PC ' + l);
  const tree = path.join(tmp, 'tree');
  const head = git(root, ['rev-parse', '--short', 'HEAD']);
  out.head = head.code === 0 ? head.stdout.trim() : null;
  const a = spawnSync('git', ['-C', root, 'archive', '--format=tar', 'HEAD'], { maxBuffer: 1024 * 1048576 });
  if (a.status !== 0) { out.error = 'git archive failed: ' + firstLine(String(a.stderr)); writeFileSync(path.join(tmp, 'result.json'), JSON.stringify(out)); return 0; }
  mkdirSync(tree, { recursive: true });
  const x = untar(a.stdout, tree);
  out.files = x.files; out.bytes = x.bytes; out.skippedEntries = x.skipped;
  log('checkout trial: HEAD ' + out.head + ' extracted, ' + x.files + ' files, ' + x.bytes + ' bytes (no .git, no state, nothing untracked)');
  out.overlay = [];
  for (const rel of overlay) {
    const src = path.resolve(root, rel), dst = path.resolve(tree, rel);
    if (path.relative(root, src).startsWith('..') || path.relative(tree, dst).startsWith('..')) throw new Error('overlay path outside the tree: ' + rel);
    mkdirSync(path.dirname(dst), { recursive: true });
    writeFileSync(dst, readFileSync(src));
    out.overlay.push({ rel, bytes: statSync(dst).size });
  }
  if (out.overlay.length) log('checkout trial: COUNTERFACTUAL overlay from the working tree: ' + out.overlay.map((o) => o.rel + ' (' + o.bytes + ' bytes)').join(', '));
  const cenv = existsSync(path.join(tree, 'compose.yaml')) ? composeEnv(readFileSync(path.join(tree, 'compose.yaml'), 'utf8')) : {};
  const port = await freePort(), dead = await freePort();
  const stateDir = path.join(tmp, 'state');
  const env = { ...process.env, ...cenv, BRAIN_STATE_DIR: stateDir, BRAIN_NAME: 'cloud', BRAIN_INSTANCE: 'checkout-trial', HEALTH_HOST: '127.0.0.1', HEALTH_PORT: String(port), BRAIN_LADDER: 'off', BRAIN_MODEL_URL: 'http://127.0.0.1:' + dead, BRAIN_CHECKPOINT_URL: '', BRAIN_EGRESS_ALLOW: '', TZ: cenv.TZ || 'UTC' };
  delete env.NODE_OPTIONS;
  out.env = Object.fromEntries(Object.entries(cenv).map(([k, v]) => [k, env[k] ?? v]));
  out.env.BRAIN_LADDER = 'off'; out.env.BRAIN_MODEL_URL = 'http://127.0.0.1:' + dead + ' (a closed port: no model, no socket to 11434)';
  const lines = [];
  const child = fork(path.join(tree, 'bin', 'serve.mjs'), [], { cwd: tree, env, execArgv: ['--max-old-space-size=96'], stdio: ['ignore', 'pipe', 'pipe', 'ipc'] });
  writeFileSync(path.join(tmp, 'pids.json'), JSON.stringify({ worker: process.pid, serve: child.pid }));
  const take = (d) => { for (const l of String(d).split(/\r?\n/)) if (l.trim()) { lines.push(l); if (lines.length > 400) lines.shift(); } };
  child.stdout.on('data', take); child.stderr.on('data', take);
  let exitCode;
  const exited = new Promise((r) => child.on('exit', (c, s) => { exitCode = c === null ? 'signal ' + s : c; r(); }));
  const t1 = Date.now();
  out.firstOkS = null; out.firstCheckpointS = null;
  let last = null;
  while (Date.now() - t1 < seconds * 1000 && exitCode === undefined) {
    const j = await getJson('http://127.0.0.1:' + port + '/health', 3000);
    if (j) {
      last = j;
      const s = r1((Date.now() - t1) / 1000);
      if (last.ok && out.firstOkS === null) out.firstOkS = s;
      if (last.checkpoint && out.firstCheckpointS === null) out.firstCheckpointS = s;
    }
    await sleep(2000);
  }
  out.lastHealth = last ? { ok: last.ok, uptimeS: last.uptimeS, restarts: last.restarts, budgetKills: last.budgetKills, tick: last.tick, ticksPerSec: last.ticksPerSec, rssMb: last.rssMb ?? null, checkpoint: last.checkpoint } : null;
  try { child.send({ op: 'stop' }); } catch { /* gone */ }
  if (exitCode === undefined) await within(exited, 60_000);
  if (exitCode === undefined) { out.stopTimedOut = true; try { child.kill('SIGKILL'); } catch { /* gone */ } await within(exited, 5000); }
  out.stopCode = exitCode ?? null;
  const serve = readJson(path.join(stateDir, 'cloud', 'serve.json'));
  const meta = readJson(path.join(stateDir, 'cloud', 'meta.json'));
  out.checkpointTickAtStop = meta && Number.isFinite(meta.t) ? meta.t : null;
  out.peak = serve ? serve.peak : null;
  out.restarts = serve ? serve.restarts : null;
  out.budgetKills = serve ? serve.budgetKills : null;
  const dpid = serve && serve.child ? serve.child.pid : null;
  let orphan = false;
  if (dpid && pidAlive(dpid)) { orphan = true; try { process.kill(dpid, 'SIGKILL'); } catch { /* gone */ } }
  out.daemonLeftBehind = orphan;
  out.built = lines.some((l) => /daemon built/.test(l));
  out.budgetKilledLines = lines.filter((l) => /BUDGET KILLED/.test(l)).length;
  out.missingFiles = missingFrom(lines, tree);
  out.missingIgnored = out.missingFiles.filter((rel) => git(root, ['check-ignore', '-q', rel]).code === 0);
  out.lastLines = lines.slice(-6);
  try { child.disconnect(); } catch { /* gone */ }
  writeFileSync(path.join(tmp, 'result.json'), JSON.stringify(out));
  return 0;
}

/** One attempt: this process makes and owns the copy, a trial process runs inside it, and the copy is deleted here whatever the trial process did. */
async function oneTrial({ root, seconds, overlay, worker, watchdogS }) {
  const t0 = Date.now();
  const tmp = mkdtempSync(path.join(os.tmpdir(), TRIAL_PREFIX));
  writeFileSync(path.join(tmp, OWNER_FILE), JSON.stringify({ pid: process.pid, at: new Date().toISOString(), by: 'bench/cloud-host.mjs' }));
  const paramsFile = path.join(tmp, 'params.json');
  writeFileSync(paramsFile, JSON.stringify({ root, tmp, seconds, overlay }));
  let out = { seconds, source: sourceOf(overlay) };
  const killed = [];
  try {
    const child = spawn(process.execPath, [worker, '--trial-worker', paramsFile], { stdio: ['ignore', 'inherit', 'inherit'], env: process.env });
    let watchdog = null;
    const code = await new Promise((resolve) => {
      watchdog = setTimeout(() => { try { child.kill('SIGKILL'); } catch { /* gone */ } }, watchdogS * 1000);
      child.on('exit', (c, s) => resolve(c === null ? 'signal ' + s : c));
      child.on('error', (e) => resolve('spawn error ' + e.message));
    });
    clearTimeout(watchdog);
    const res = readJson(path.join(tmp, 'result.json'));
    if (res) out = { ...out, ...res };
    out.workerExit = code;
    out.crashed = !res;
  } finally {
    // whatever the trial process left running, dead or not: serve (pids.json) and the daemon (serve.json)
    const pids = readJson(path.join(tmp, 'pids.json')) || {};
    const serve = readJson(path.join(tmp, 'state', 'cloud', 'serve.json'));
    for (const pid of [pids.serve, serve && serve.child ? serve.child.pid : null]) {
      if (pid !== process.pid && pidAlive(pid)) { try { process.kill(pid, 'SIGKILL'); killed.push(pid); } catch { /* gone */ } }
    }
    await sleep(500);
    rmSync(tmp, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 });
    out.deleted = !existsSync(tmp);
    out.killedAfter = killed;
    try { const f = statfsSync(os.tmpdir()); out.freeMbAfter = Math.round(f.bavail * f.bsize / 1048576); } catch { out.freeMbAfter = null; }
    out.attemptWallS = r1((Date.now() - t0) / 1000);
  }
  return out;
}

const exitName = (c) => (Number.isInteger(c) && c > 0xffff ? c + ' (0x' + c.toString(16).toUpperCase() + ')' : String(c));

/**
 * The committed tree booted natively, in a trial process, with one more attempt when the trial
 * process dies. overlay: tree paths copied from the working tree on top of the archive, the
 * COUNTERFACTUAL "HEAD plus these files".
 */
export async function checkoutTrial({ root = TREE, seconds = 90, overlay = [], log = () => {}, attempts = 2, worker = SELF, watchdogS = seconds + 240, sweepDir = os.tmpdir() } = {}) {
  const t0 = Date.now();
  const sweep = sweepStale({ dir: sweepDir });
  if (sweep.found) log('checkout trial: ' + sweep.found + ' copies under the temp dir: ' + sweep.swept + ' left by a dead run swept (' + mb(sweep.bytes) + ' MB), ' + sweep.kept + ' kept (a live run owns them)' + (sweep.failed.length ? ', NOT deleted: ' + sweep.failed.join(', ') : ''));
  const tries = [];
  let out = null;
  for (let k = 1; k <= attempts; k++) {
    out = await oneTrial({ root, seconds, overlay, worker, watchdogS });
    tries.push({ attempt: k, workerExit: out.workerExit, crashed: out.crashed, wallS: out.attemptWallS, deleted: out.deleted, killedAfter: out.killedAfter });
    if (!out.crashed) break;
    log('checkout trial attempt ' + k + ': the trial process died with exit ' + exitName(out.workerExit) + ' at ' + out.attemptWallS + ' s before writing its result; killed after it: ' + (out.killedAfter.join(', ') || 'nothing alive') + '; its copy deleted ' + out.deleted + (k < attempts ? '; attempt ' + (k + 1) : '; no attempt left'));
  }
  return { ...out, attempts: tries, sweep, wallS: r1((Date.now() - t0) / 1000) };
}

/** min and max of a field over trials, null when no trial carried it. */
function band(trials, pick) {
  const v = trials.map(pick).filter((x) => Number.isFinite(x));
  return v.length ? { min: Math.min(...v), max: Math.max(...v), n: v.length } : null;
}
const fmtBand = (b, unit = '') => (b ? (b.min === b.max ? String(b.min) : b.min + '..' + b.max) + unit : 'null');

// ---------------------------------------------------------------- the control: the bar function graded both ways
export function control() {
  const pass = { run: { databaseId: 1, conclusion: 'success', event: 'schedule' }, health: { ok: true, restarts: 0, checkpoint: { ageS: 3.2, bytes: 1 } }, container: { restartCount: 0 }, ladderLine: 'LADDER 2026-09-26: composite 0.500000, planted' };
  const arms = {
    pass: [pass],
    restarts1: [{ ...pass, health: { ...pass.health, restarts: 1 } }],
    containerRestart1: [{ ...pass, container: { restartCount: 1 } }],
    age200: [{ ...pass, health: { ...pass.health, checkpoint: { ageS: 200, bytes: 1 } } }],
    noLadder: [{ ...pass, ladderLine: null }],
    failure: [{ ...pass, run: { ...pass.run, conclusion: 'failure' } }],
    healthNotOk: [{ ...pass, health: { ...pass.health, ok: false } }],
    pushEvent: [{ ...pass, run: { ...pass.run, event: 'push' } }],
    empty: [],
  };
  const out = {};
  for (const [k, v] of Object.entries(arms)) out[k] = barOf(v).met;
  out.holds = out.pass === true && Object.entries(out).every(([k, v]) => k === 'pass' || k === 'holds' || v === false);
  return out;
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

const trialLine = (t, label) => 'PC ' + label + ': HEAD ' + t.head + ', ' + t.files + ' files, ' + t.bytes + ' bytes; built ' + t.built + '; first ok at ' + t.firstOkS + ' s, first checkpoint at ' + t.firstCheckpointS + ' s; last health ok ' + (t.lastHealth || {}).ok + ', tick ' + (t.lastHealth || {}).tick + ', ' + (t.lastHealth || {}).ticksPerSec + ' ticks/s, restarts ' + t.restarts + ', budget kills ' + t.budgetKills + ', daemon peak rss ' + (t.peak ? t.peak.daemonRssMb : null) + ' MB; stop code ' + t.stopCode + ', checkpoint t=' + t.checkpointTickAtStop + ' at the stop; trial process exit ' + exitName(t.workerExit) + ' after ' + t.attempts.length + ' attempt(s); copy deleted ' + t.deleted + ', ' + t.freeMbAfter + ' MB free on the temp drive' + (t.error ? '; ERROR ' + t.error : '');

async function main(argv) {
  const a = args(argv);
  const root = path.resolve(a.root && a.root !== true ? a.root : TREE);
  const outFile = path.resolve(a.out && a.out !== true ? a.out : path.join(HERE, 'verdicts', 'cloud-host.json'));
  const days = a.days && a.days !== true ? Number(a.days) : 7;
  const trialS = a['checkout-trial'] && a['checkout-trial'] !== true ? Number(a['checkout-trial']) : 0;
  const cf = a.counterfactual && a.counterfactual !== true ? String(a.counterfactual).split(',').map((s) => s.trim()).filter(Boolean) : [];
  const repeat = a.repeat && a.repeat !== true ? Math.max(1, Math.floor(Number(a.repeat))) : 3;
  if (a.overlay) { console.log('refused: --overlay became --counterfactual FILE [--repeat N]: it runs beside the HEAD trial, its control, and is recorded apart'); return 2; }
  if (cf.length && !trialS) { console.log('refused: --counterfactual needs --checkout-trial S (the HEAD trial is its control, the intervention off)'); return 2; }
  const t0 = Date.now();
  const say = (l) => console.log(l);
  const previous = readJson(outFile);

  const host = measureHost({ root, days, log: (l) => say('HOST ' + l) });
  for (const k of HOST_ROWS) {
    const r = host.rows[k];
    say('HOST ' + k + ': ' + (r.measured ? JSON.stringify(r.value) : 'not measured: ' + r.cause));
  }
  const wf = workflowReport(root);
  const passed = wf.checks.filter((c) => c.ok).length;
  say('PC workflow ' + WORKFLOW_REL + ': exists ' + wf.exists + ', parses ' + wf.parses + (wf.error ? ' (' + wf.error + ')' : '') + ', ' + (wf.bytes ?? 0) + ' bytes, ' + passed + ' of ' + wf.checks.length + ' structural checks');
  for (const c of wf.checks) if (!c.ok) say('PC   FAILED: ' + c.check + (c.detail ? ' (' + c.detail + ')' : ''));
  say('PC files the workflow names: ' + (wf.named.length - wf.missing.length) + ' of ' + wf.named.length + ' exist' + (wf.missing.length ? '; missing ' + wf.missing.join(', ') : ''));
  let trial = null, counterfactual = null;
  if (trialS > 0) {
    trial = await checkoutTrial({ root, seconds: trialS, log: say });
    say(trialLine(trial, 'checkout trial (CONTROL, the committed tree alone)'));
    if (trial.missingFiles && trial.missingFiles.length) say('PC checkout trial: the daemon opened files the committed tree lacks: ' + trial.missingFiles.join(', ') + ' (gitignored here: ' + (trial.missingIgnored.join(', ') || 'none') + ')');
    if (cf.length) {
      const trials = [];
      for (let k = 1; k <= repeat; k++) {
        const t = await checkoutTrial({ root, seconds: trialS, overlay: cf, log: say });
        trials.push(t);
        say(trialLine(t, 'counterfactual ' + k + ' of ' + repeat + ' (HEAD plus ' + cf.join(', ') + ')'));
      }
      const b = {
        built: trials.filter((t) => t.built).length,
        restarts: band(trials, (t) => t.restarts),
        firstCheckpointS: band(trials, (t) => t.firstCheckpointS),
        ticksPerSec: band(trials, (t) => (t.lastHealth || {}).ticksPerSec),
        daemonPeakRssMb: band(trials, (t) => (t.peak ? t.peak.daemonRssMb : null)),
        budgetKills: band(trials, (t) => t.budgetKills),
        crashedAttempts: trials.reduce((s, t) => s + t.attempts.filter((x) => x.crashed).length, 0),
        copiesDeleted: trials.filter((t) => t.deleted).length,
      };
      counterfactual = { overlay: cf, repeat, band: b, trials };
      say('PC counterfactual band over ' + repeat + ' trials: built ' + b.built + ' of ' + repeat + '; restarts ' + fmtBand(b.restarts) + '; first checkpoint ' + fmtBand(b.firstCheckpointS, ' s') + '; ' + fmtBand(b.ticksPerSec) + ' ticks/s; daemon peak rss ' + fmtBand(b.daemonPeakRssMb, ' MB') + ' (the container allows 512 MB, serve kills at 448); budget kills ' + fmtBand(b.budgetKills) + '; trial processes that died ' + b.crashedAttempts + '; copies deleted ' + b.copiesDeleted + ' of ' + repeat);
    }
  }
  const trialBroken = Boolean(trial && !trial.built);
  const ctl = control();
  say('CONTROL barOf on planted readings: pass ' + ctl.pass + '; restarts 1 ' + ctl.restarts1 + '; container restart 1 ' + ctl.containerRestart1 + '; checkpoint age 200 s ' + ctl.age200 + '; no ladder line ' + ctl.noLadder + '; conclusion failure ' + ctl.failure + '; health not ok ' + ctl.healthNotOk + '; a push event ' + ctl.pushEvent + '; no run ' + ctl.empty + ' (holds ' + ctl.holds + ')');

  const bar = host.cause ? { met: false, why: 'not measured: ' + host.cause } : barOf(host.readings);
  const barMet = Boolean(bar.met && wf.parses && wf.missing.length === 0 && ctl.holds);
  const lacks = trialBroken ? (trial.missingFiles && trial.missingFiles.length ? trial.missingFiles.join(', ') : 'whatever the daemon needs (the trial named no file; read its lastLines)') : '';
  const addCmd = trialBroken && trial.missingFiles && trial.missingFiles.length ? ' (git add -f ' + trial.missingFiles.join(' ') + ')' : '';
  const fixFirst = trialBroken ? 'commit ' + lacks + addCmd + ' (the checkout trial at HEAD ' + trial.head + ' read built false without it), then ' : '';
  const hisStep = host.cause === 'gh not logged in' ? fixFirst + 'gh auth login, then node tools/cloud-github.mjs (a private repository named brain unless he passes --public --yes)'
    : host.cause && /no origin/.test(host.cause) ? fixFirst + 'node tools/cloud-github.mjs (it creates the private repository and dispatches the first run)'
      : host.cause && /not on the default branch|no run of cloud\.yml/.test(host.cause) ? 'commit .github/workflows/cloud.yml' + (trialBroken ? ' with ' + lacks + addCmd + ' (the checkout trial at HEAD ' + trial.head + ' read built false without it)' : '') + ', then node tools/cloud-github.mjs (it pushes, enables the workflow and dispatches the first run)'
        : host.cause ? fixFirst + 'none that a command can name yet: ' + host.cause : 'none';
  const verdict = {
    at: new Date().toISOString(),
    replaces: previous && previous.at ? { at: previous.at, command: previous.command || null, why: 'a re-measure: this run\'s file replaces the one written at that time' } : null,
    command: 'node bench/cloud-host.mjs' + (argv.length ? ' ' + argv.join(' ') : ''),
    node: process.version,
    isTheBar: true,
    barMet,
    item: 'host', board: 16, objective: 'P13',
    host: 'GitHub Actions on his account, private by default (the orchestrator\'s ASSUMPTION of 2026-09-25, not his words; test: his confirmation)',
    bar: { rule: BAR, met: barMet, why: bar.why },
    hisStep,
    split: {
      measuredFromHost: HOST_ROWS,
      measuredOnThisPc: ['the workflow parses and passes its structural checks', 'every tree file the workflow names exists', ...(trial ? ['the committed tree (git archive HEAD) run under bin/serve.mjs natively: the CONTROL arm'] : []), ...(counterfactual ? ['COUNTERFACTUAL: the committed tree plus ' + cf.join(', ') + ', ' + repeat + ' trials: the intervention arm and its run-to-run band'] : [])],
      development: 'the tests plant git repositories, a gh on PATH that answers logged in or not, artifact directories, stale copies and a trial process that dies; the control grades barOf on planted readings',
      heldOut: 'the host itself: runs of .github/workflows/cloud.yml on GitHub Actions under his account, which no test and no development step has read',
    },
    host_rows: host.rows,
    pc: { workflow: { exists: wf.exists, parses: wf.parses, error: wf.error, bytes: wf.bytes ?? null, checks: wf.checks, named: wf.named, missing: wf.missing }, checkoutTrial: trial, counterfactual },
    control: ctl,
    ms: Date.now() - t0,
  };
  const hostPart = host.cause
    ? 'No run was read from the host: ' + host.cause + ', so the rows that need a run (runs, uptime fraction, ticks per hour, restarts, checkpoint age and bytes, the ladder line) are not measured and barMet is false. His step: ' + hisStep + '. '
    : 'From the host: ' + host.rows.runs.value + ' run(s) in ' + days + ' days, conclusions ' + JSON.stringify(host.rows.conclusions.value) + ', uptime fraction ' + host.rows.uptimeFraction.value + ' of ' + (days * 1440) + ' minutes; the bar reads ' + bar.why + '. ';
  const cb = counterfactual && counterfactual.band;
  verdict.statement = hostPart
    + 'On this PC, ' + WORKFLOW_REL + ' parses ' + wf.parses + ' and passes ' + passed + ' of ' + wf.checks.length + ' structural checks, and ' + (wf.named.length - wf.missing.length) + ' of ' + wf.named.length + ' tree files it names exist. '
    + (trial ? 'The committed tree alone (HEAD ' + trial.head + ', ' + trial.files + ' files, the control) ran natively for ' + trial.seconds + ' s: built ' + trial.built + ', first checkpoint at ' + trial.firstCheckpointS + ' s, restarts ' + trial.restarts + ', budget kills ' + trial.budgetKills + ', stop code ' + trial.stopCode + ', the copy deleted ' + trial.deleted + (trial.missingFiles && trial.missingFiles.length ? '; the daemon opened files the tree lacks: ' + trial.missingFiles.join(', ') : '') + '. ' : '')
    + (cb ? 'The same HEAD plus ' + cf.join(', ') + ' from the working tree (the counterfactual, ' + repeat + ' trials) built ' + cb.built + ' of ' + repeat + ' times, restarts ' + fmtBand(cb.restarts) + ', first checkpoint ' + fmtBand(cb.firstCheckpointS, ' s') + ', ' + fmtBand(cb.ticksPerSec) + ' ticks/s, daemon peak rss ' + fmtBand(cb.daemonPeakRssMb, ' MB') + '. ' : '')
    + 'The bar function said ' + ctl.pass + ' on a planted passing reading and false on each of its ' + (Object.keys(ctl).length - 2) + ' planted failures (holds ' + ctl.holds + ').';
  mkdirSync(path.dirname(outFile), { recursive: true });
  writeFileSync(outFile, JSON.stringify(verdict, null, 2) + '\n');
  say('CLOUD-HOST barMet ' + barMet + ': ' + bar.why + '; his step: ' + hisStep);
  say('wrote ' + outFile + ' (' + statSync(outFile).size + ' bytes, ' + Math.round((Date.now() - t0) / 1000) + ' s)');
  return barMet ? 0 : 1;
}

const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === SELF;
if (isMain) {
  const argv = process.argv.slice(2);
  process.exitCode = argv[0] === '--trial-worker' ? await trialWorker(argv[1]) : await main(argv);
}
