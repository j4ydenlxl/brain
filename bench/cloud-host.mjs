#!/usr/bin/env node
// bench/cloud-host.mjs: THE P13 RULER, READ FROM THE HOST (his 2026-09-23 17:30: "It should live
// 24/7 on the cloud remember Its literally a sandboxed ARTIFICIAL SUPERINTELLIGENCE"; his
// 2026-09-25 about 17:05: "set up the p13 idk how idk"). Writes bench/verdicts/cloud-host.json.
//
//   node bench/cloud-host.mjs [--days 7] [--checkout-trial SECONDS] [--repo OWNER/NAME]
//                             [--counterfactual FILE[,FILE] [--repeat N]] [--root DIR] [--out FILE]
//
// THE REST PATH (board 20 builder, 2026-09-26): when gh is absent or not logged in and a token
// variable is set (the NAME in BRAIN_GITHUB_TOKEN_VAR, default GH_TOKEN, then GITHUB_TOKEN; the
// value is read at request time and never printed, logged or written), the same rows are read
// from the GitHub REST API: the workflow's runs, each completed run's jobs and artifacts, and the
// brain-cloud zip through its signed redirect, followed WITHOUT the token and read by readZip
// (node:zlib inflateRaw, no dependency). A zip that cannot be fetched leaves the health rows
// "not measured: <cause>" and barMet false; X-RateLimit-Remaining 0 stops with "not measured:
// rate limit". The uptime fraction on this path is the runs' wall minutes over 10,080.
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
import https from 'node:https';
import tls from 'node:tls';
import zlib from 'node:zlib';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT as TREE, WORKFLOW_REL, ARTIFACT, BAR, barOf, ghStatus, git, runCmd, workflowReport, parseYaml, PRIVATE_MINUTES, WEEK_MINUTES } from '../tools/cloud-github.mjs';

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
  return readingFromFiles(run, (name) => (existsSync(path.join(dir, name)) ? readFileSync(path.join(dir, name), 'utf8') : null));
}

/** One run's artifact files read into a reading; read(name) answers the file's text or null (a directory or an in-memory zip). */
export function readingFromFiles(run, read) {
  const json = (n) => { const t = read(n); if (t == null) return null; try { return JSON.parse(t); } catch { return null; } };
  const ladderLine = String(read('ladder.log') || '').split(/\r?\n/).find((l) => /^LADDER \d{4}-\d{2}-\d{2}:/.test(l)) || null;
  const log = String(read('health.log') || '');
  const lines = log.split(/\r?\n/).filter(Boolean);
  let lastHealthLine = null;
  if (lines.length) { try { lastHealthLine = JSON.parse(lines[lines.length - 1]); } catch { lastHealthLine = { unparsed: lines[lines.length - 1].slice(0, 200) }; } }
  return { run, health: json('health.json'), container: json('container.json'), job: json('run.json'), ticksPerHour: ticksPerHourOf(log), ladderLine, lastHealthLine, healthLogLines: lines.length };
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

// ---------------------------------------------------------------- the REST path (board 20 builder)
// board 20 builder, host item (P13, the ruler read FROM the host): when gh is absent or not logged
// in, the host is read through the GitHub REST API. The token is read at request time from the
// environment variable whose NAME is BRAIN_GITHUB_TOKEN_VAR (default GH_TOKEN, then GITHUB_TOKEN);
// its value goes only into the Authorization header of a request to the API origin and is never
// printed, logged or written, and never sent to the host a redirect names (the signed artifact
// URL, whose query string is never printed either). Endpoints, read only: the repository, the
// workflow's runs, each completed run's jobs (step conclusions and times), its artifacts, and the
// brain-cloud zip (a redirect followed without the token). The zip is read in memory by readZip
// (the central directory is the reference for sizes; stored and deflated entries; CRC-32
// checked; no dependency). X-RateLimit-Remaining 0 (or a 429) stops the path with
// "not measured: rate limit" and no further request. Sockets: 127.0.0.1 (a planted API, or the
// egress proxy named by HTTPS_PROXY, tunnelled with CONNECT) and api.github.com.
export const API_DEFAULT = 'https://api.github.com';
export const HOST_EXTRA_ROWS = ['artifacts', 'jobSteps', 'lastHealthLine', 'cost'];
export const STORE_BYTES = 500 * 1048576; // the artifact storage a free account holds (cloud.yml's own comment)
const UA = 'brain-cloud-host (bench/cloud-host.mjs)';
const RETENTION_DAYS = 90; // cloud.yml uploads brain-cloud with retention-days 90

/** Which variable holds the token: {name} or {name: null, cause}. Only NAMES leave this function. */
export function tokenVarOf(env = process.env) {
  const named = env.BRAIN_GITHUB_TOKEN_VAR;
  if (named) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(named)) return { name: null, explicit: true, cause: 'BRAIN_GITHUB_TOKEN_VAR is not a variable name' };
    return env[named] ? { name: named, explicit: true } : { name: null, explicit: true, cause: 'the variable ' + named + ' named by BRAIN_GITHUB_TOKEN_VAR is empty' };
  }
  if (env.GH_TOKEN) return { name: 'GH_TOKEN' };
  if (env.GITHUB_TOKEN) return { name: 'GITHUB_TOKEN' };
  return { name: null, cause: 'no token in GH_TOKEN or GITHUB_TOKEN (or the variable BRAIN_GITHUB_TOKEN_VAR names)' };
}

/** The API origin: https://api.github.com, or an http listener on 127.0.0.1 (a planted API in the tests). */
export function apiBaseOf(env = process.env) {
  const raw = env.BRAIN_GITHUB_API || API_DEFAULT;
  let u;
  try { u = new URL(raw); } catch { return { error: 'BRAIN_GITHUB_API is not a URL' }; }
  const local = ['127.0.0.1', 'localhost'].includes(u.hostname);
  if (!(u.protocol === 'https:' && u.hostname === 'api.github.com' && !u.port) && !(local && u.protocol === 'http:')) return { error: 'BRAIN_GITHUB_API must be https://api.github.com or an http listener on 127.0.0.1' };
  return { base: u.origin };
}

/** owner/repo from a github.com remote URL (https or ssh), or null. */
export function repoOf(remote) {
  const m = /github\.com[:/]+([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/.exec(String(remote || '').trim());
  return m ? m[1] + '/' + m[2] : null;
}

function bypassProxy(host, env) {
  const h = host.toLowerCase();
  return String(env.NO_PROXY || env.no_proxy || '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean)
    .some((n) => n === '*' || h === n || (n.startsWith('*.') ? h.endsWith(n.slice(1)) : n.startsWith('.') ? h.endsWith(n) : h.endsWith('.' + n)));
}

/** The egress proxy an https request goes through (HTTPS_PROXY, NO_PROXY honoured), or null. */
export function proxyFor(url, env = process.env) {
  if (url.protocol !== 'https:') return null;
  const p = env.HTTPS_PROXY || env.https_proxy;
  if (!p || bypassProxy(url.hostname, env)) return null;
  try { return new URL(p); } catch { return null; }
}

function tunnel(proxy, host, port, ms) {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: proxy.hostname, port: Number(proxy.port) || 80, method: 'CONNECT', path: host + ':' + port, headers: { host: host + ':' + port }, agent: false });
    const timer = setTimeout(() => req.destroy(new Error('the egress proxy gave no answer to CONNECT ' + host + ':' + port + ' in ' + ms + ' ms')), ms);
    req.on('connect', (res, socket) => {
      clearTimeout(timer);
      if (res.statusCode === 200) { resolve(socket); return; }
      socket.destroy();
      reject(Object.assign(new Error('the egress proxy answered ' + res.statusCode + ' to CONNECT ' + host + ':' + port), { refused: true }));
    });
    req.on('error', (e) => { clearTimeout(timer); reject(e); });
    req.end();
  });
}

/** One GET: {status, headers, body}. https goes through the egress proxy when one is set; nothing is retried. */
export async function httpGet(u, { headers = {}, env = process.env, timeoutMs = 60_000, maxBytes = 16 * 1048576 } = {}) {
  const url = new URL(u);
  const secure = url.protocol === 'https:';
  if (!secure && url.protocol !== 'http:') throw new Error('refused: ' + url.protocol + ' is not http or https');
  const port = Number(url.port) || (secure ? 443 : 80);
  const proxy = proxyFor(url, env);
  const opts = { method: 'GET', hostname: url.hostname, port, path: url.pathname + url.search, headers: { host: url.host, ...headers } };
  let mod = secure ? https : http;
  if (proxy) {
    const raw = await tunnel(proxy, url.hostname, port, timeoutMs);
    const sock = await new Promise((resolve, reject) => { const s = tls.connect({ socket: raw, servername: url.hostname }, () => resolve(s)); s.once('error', reject); });
    opts.createConnection = () => sock;
    mod = http;
  } else opts.agent = false;
  return new Promise((resolve, reject) => {
    const req = mod.request(opts, (res) => {
      const chunks = [];
      let n = 0;
      res.on('data', (c) => { n += c.length; if (n > maxBytes) { req.destroy(new Error('the answer passed ' + maxBytes + ' bytes')); return; } chunks.push(c); });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
      res.on('error', reject);
    });
    req.setTimeout(timeoutMs, () => req.destroy(new Error('no answer from ' + url.host + ' in ' + timeoutMs + ' ms')));
    req.on('error', reject);
    req.end();
  });
}

// ---------------------------------------------------------------- the zip reader (and its writer, for the tests)
const CRC_TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
export function crc32(buf) { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }

/** A zip archive read in memory: Map name -> Buffer. The central directory is the reference for sizes (a local header may carry zeros and a data descriptor). */
export function readZip(buf, { maxBytes = 256 * 1048576 } = {}) {
  if (!Buffer.isBuffer(buf) || buf.length < 22) throw new Error('not a zip: ' + (buf ? buf.length : 0) + ' bytes');
  let e = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 22 - 65535); i--) if (buf.readUInt32LE(i) === 0x06054b50) { e = i; break; }
  if (e < 0) throw new Error('not a zip: no end of central directory record');
  const count = buf.readUInt16LE(e + 10), cdSize = buf.readUInt32LE(e + 12), cdOff = buf.readUInt32LE(e + 16);
  if (count === 0xffff || cdSize === 0xffffffff || cdOff === 0xffffffff) throw new Error('a zip64 archive is not read here');
  if (cdOff + cdSize > e) throw new Error('the central directory runs past its end record');
  const out = new Map();
  let p = cdOff, total = 0;
  for (let k = 0; k < count; k++) {
    if (p + 46 > e || buf.readUInt32LE(p) !== 0x02014b50) throw new Error('central directory entry ' + k + ' has no signature');
    const flags = buf.readUInt16LE(p + 8), method = buf.readUInt16LE(p + 10), crc = buf.readUInt32LE(p + 16);
    const csize = buf.readUInt32LE(p + 20), usize = buf.readUInt32LE(p + 24);
    const nlen = buf.readUInt16LE(p + 28), xlen = buf.readUInt16LE(p + 30), clen = buf.readUInt16LE(p + 32), lho = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nlen);
    p += 46 + nlen + xlen + clen;
    if (csize === 0xffffffff || usize === 0xffffffff || lho === 0xffffffff) throw new Error(name + ': zip64 sizes are not read here');
    if (flags & 1) throw new Error(name + ': encrypted');
    if (name.endsWith('/')) continue;
    if (lho + 30 > buf.length || buf.readUInt32LE(lho) !== 0x04034b50) throw new Error(name + ': no local file header at ' + lho);
    const start = lho + 30 + buf.readUInt16LE(lho + 26) + buf.readUInt16LE(lho + 28);
    if (start + csize > buf.length) throw new Error(name + ': the data runs past the archive');
    total += usize;
    if (total > maxBytes) throw new Error('the archive holds more than ' + maxBytes + ' bytes');
    const raw = buf.subarray(start, start + csize);
    let data;
    if (method === 0) data = Buffer.from(raw);
    else if (method === 8) data = usize === 0 ? Buffer.alloc(0) : zlib.inflateRawSync(raw, { maxOutputLength: usize });
    else throw new Error(name + ': compression method ' + method + ' is not read here');
    if (data.length !== usize) throw new Error(name + ': ' + data.length + ' bytes, the central directory says ' + usize);
    if (crc32(data) !== crc) throw new Error(name + ': CRC-32 differs from the central directory');
    out.set(name, data);
  }
  return out;
}

/** The reverse of readZip: files {name: text|Buffer} into a zip. method 0 stores, 8 deflates (or a function of the name); descriptor puts zeros in the local headers and a data descriptor after each entry. */
export function zipOf(files, { method = 8, descriptor = false } = {}) {
  const locals = [], centrals = [];
  let off = 0, n = 0;
  for (const [name, content] of Object.entries(files)) {
    const data = Buffer.isBuffer(content) ? content : Buffer.from(String(content));
    const m = typeof method === 'function' ? method(name) : method;
    const comp = m === 8 ? zlib.deflateRawSync(data) : data;
    const crc = crc32(data), nb = Buffer.from(name, 'utf8'), flags = 0x0800 | (descriptor ? 0x0008 : 0);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(flags, 6); lh.writeUInt16LE(m, 8);
    lh.writeUInt32LE(descriptor ? 0 : crc, 14); lh.writeUInt32LE(descriptor ? 0 : comp.length, 18); lh.writeUInt32LE(descriptor ? 0 : data.length, 22); lh.writeUInt16LE(nb.length, 26);
    const dd = descriptor ? Buffer.alloc(16) : Buffer.alloc(0);
    if (descriptor) { dd.writeUInt32LE(0x08074b50, 0); dd.writeUInt32LE(crc, 4); dd.writeUInt32LE(comp.length, 8); dd.writeUInt32LE(data.length, 12); }
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(flags, 8); ch.writeUInt16LE(m, 10);
    ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(comp.length, 20); ch.writeUInt32LE(data.length, 24); ch.writeUInt16LE(nb.length, 28); ch.writeUInt32LE(off, 42);
    locals.push(lh, nb, comp, dd); centrals.push(ch, nb);
    off += 30 + nb.length + comp.length + dd.length; n++;
  }
  const cd = Buffer.concat(centrals), eo = Buffer.alloc(22);
  eo.writeUInt32LE(0x06054b50, 0); eo.writeUInt16LE(n, 8); eo.writeUInt16LE(n, 10); eo.writeUInt32LE(cd.length, 12); eo.writeUInt32LE(off, 16);
  return Buffer.concat([...locals, cd, eo]);
}

// ---------------------------------------------------------------- the host through the REST API
const runOfApi = (r) => ({ databaseId: r.id, number: r.run_number, event: r.event, status: r.status, conclusion: r.conclusion, createdAt: r.created_at, startedAt: r.run_started_at || r.created_at, updatedAt: r.updated_at, url: r.html_url, headSha: r.head_sha ? String(r.head_sha).slice(0, 7) : null });
const secondsOf = (a, b) => (a && b ? Math.round((Date.parse(b) - Date.parse(a)) / 1000) : null);
const msgOf = (r) => { try { const j = JSON.parse(r.body.toString('utf8')); return j && j.message ? String(j.message).slice(0, 200) : ''; } catch { return ''; } };
class RateLimited extends Error {}

/** Every host row through the REST API, read only. Returns {rows, extra, readings, cause, artifactCause, via}. */
export async function measureHostRest({ root = TREE, env = process.env, days = 7, now = Date.now(), log = () => {}, repo = null, why = 'gh is not on PATH', maxRuns = 10, timeoutMs = 60_000 } = {}) {
  const rows = {}, extra = {}, readings = [], missing = [];
  const tv = tokenVarOf(env), api = apiBaseOf(env);
  const via = { path: 'REST', api: api.base || null, tokenVar: tv.name, gh: why, calls: 0, rateRemaining: null };
  const fill = (cause) => { for (const k of HOST_ROWS) if (!rows[k]) rows[k] = notMeasured(cause); for (const k of HOST_EXTRA_ROWS) if (!extra[k]) extra[k] = notMeasured(cause); };
  const all = (cause) => { fill(cause); return { rows, extra, readings: [], cause, artifactCause: null, via }; };
  if (!tv.name) return all(why + ' and ' + tv.cause);
  if (api.error) return all(api.error);
  let slug = repo, origin = null;
  if (!slug) {
    const o = git(root, ['remote', 'get-url', 'origin']);
    if (o.code !== 0) return all('no origin remote: the repository was never created (node tools/cloud-github.mjs)');
    origin = o.stdout.trim();
    slug = repoOf(origin);
    if (!slug) return all('the origin remote is not a github.com repository (pass --repo owner/name)');
  }
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(slug)) return all('--repo must be owner/name');
  const state = { remaining: null, reset: null };
  const rateCause = () => 'rate limit: X-RateLimit-Remaining ' + state.remaining + (state.reset ? ', resets at ' + new Date(Number(state.reset) * 1000).toISOString() : '');
  const call = async (p, { accept = 'application/vnd.github+json', maxBytes = 16 * 1048576 } = {}) => {
    if (state.remaining === 0) throw new RateLimited(rateCause());
    // the token is read here, at request time, from the variable tv.name; it goes into this header and nowhere else
    const r = await httpGet(api.base + p, { headers: { accept, 'user-agent': UA, 'x-github-api-version': '2022-11-28', authorization: 'Bearer ' + String(env[tv.name] || '') }, env, timeoutMs, maxBytes });
    via.calls++;
    const rem = Number(r.headers['x-ratelimit-remaining']);
    if (r.headers['x-ratelimit-remaining'] !== undefined && Number.isFinite(rem)) { state.remaining = rem; state.reset = r.headers['x-ratelimit-reset'] || null; via.rateRemaining = rem; }
    if (r.status === 429 || (r.status === 403 && state.remaining === 0)) { if (state.remaining === null) state.remaining = 0; throw new RateLimited(rateCause()); }
    return r;
  };
  const json = (r) => { try { return JSON.parse(r.body.toString('utf8')); } catch { return null; } };
  try {
    const rv = await call('/repos/' + slug);
    const rj = rv.status === 200 ? json(rv) : null;
    if (rv.status === 404) return all('the repository ' + slug + ' answered 404 (the token named ' + tv.name + ' cannot read it, or it does not exist)');
    if (rv.status === 401) return all('the API answered 401 to the token named ' + tv.name);
    rows.gh = row('REST path (' + why + ')', { api: api.base, tokenVar: tv.name });
    rows.repository = row(origin || slug, rj ? { nameWithOwner: rj.full_name, visibility: rj.visibility, defaultBranch: rj.default_branch } : { view: rv.status + ' ' + msgOf(rv) });
    const wf = path.basename(WORKFLOW_REL);
    const stop = (c) => { fill(c); return { rows, extra, readings, cause: c, artifactCause: null, via }; };
    const lr = await call('/repos/' + slug + '/actions/workflows/' + wf + '/runs?per_page=20');
    if (lr.status === 404) return stop(wf + ' is not on the default branch' + (rj ? ' (' + rj.default_branch + ')' : '') + ' of ' + slug + ' yet');
    if (lr.status !== 200) return stop('the runs list answered ' + lr.status + (msgOf(lr) ? ': ' + msgOf(lr) : ''));
    const lj = json(lr);
    if (!lj || !Array.isArray(lj.workflow_runs)) return stop('the runs list is not JSON');
    const runs = lj.workflow_runs.map(runOfApi);
    const since = now - days * 86_400_000;
    const win = runs.filter((r) => Date.parse(r.createdAt) >= since).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    if (!runs.length) return stop('no run of ' + wf + ' yet');
    if (!win.length) return stop('no run of ' + wf + ' in the last ' + days + ' days (' + runs.length + ' older)');
    rows.runs = row(win.length, { window: days + ' days', ids: win.map((r) => r.databaseId), totalCount: lj.total_count ?? null });
    const tally = {};
    for (const r of win) { const k = r.status === 'completed' ? String(r.conclusion) : String(r.status); tally[k] = (tally[k] || 0) + 1; }
    rows.conclusions = row(tally, { byRun: win.map((r) => ({ id: r.databaseId, event: r.event, conclusion: r.status === 'completed' ? r.conclusion : r.status, createdAt: r.createdAt, updatedAt: r.updatedAt, head: r.headSha })) });
    const done = win.filter((x) => x.status === 'completed');
    let wall = 0;
    for (const r of done) wall += Math.max(0, (Date.parse(r.updatedAt) - Date.parse(r.startedAt)) / 60000);
    rows.actionsMinutes = row(r1(wall), { how: 'updated_at minus run_started_at over the completed runs of the window; GitHub bills each job rounded up to the minute' });
    const nr = done[0];
    rows.newestRun = nr ? row({ id: nr.databaseId, number: nr.number, event: nr.event, conclusion: nr.conclusion, createdAt: nr.createdAt, updatedAt: nr.updatedAt, url: nr.url }) : notMeasured('no completed run in the window');

    // each completed run: its jobs (steps), its artifacts, and the brain-cloud zip
    const steps = [], arts = [];
    let stopped = null;
    for (const r of done.slice(0, maxRuns)) {
      const jr = await call('/repos/' + slug + '/actions/runs/' + r.databaseId + '/jobs?per_page=10');
      const jj = jr.status === 200 ? json(jr) : null;
      if (jj && Array.isArray(jj.jobs)) {
        for (const j of jj.jobs) {
          steps.push({ run: r.databaseId, event: r.event, job: j.name, conclusion: j.conclusion, seconds: secondsOf(j.started_at, j.completed_at),
            billedMinutes: j.started_at && j.completed_at ? Math.max(1, Math.ceil((Date.parse(j.completed_at) - Date.parse(j.started_at)) / 60000)) : null,
            steps: (j.steps || []).map((s) => ({ n: s.number, name: s.name, conclusion: s.conclusion, seconds: secondsOf(s.started_at, s.completed_at) })) });
        }
      } else steps.push({ run: r.databaseId, event: r.event, error: 'the jobs list answered ' + jr.status + (msgOf(jr) ? ': ' + msgOf(jr) : '') });
      const ar = await call('/repos/' + slug + '/actions/runs/' + r.databaseId + '/artifacts?per_page=30');
      const aj = ar.status === 200 ? json(ar) : null;
      const art = aj && Array.isArray(aj.artifacts) ? aj.artifacts.find((x) => x.name === ARTIFACT) : null;
      if (!aj) { missing.push({ id: r.databaseId, cause: 'the artifacts list answered ' + ar.status + (msgOf(ar) ? ': ' + msgOf(ar) : '') }); continue; }
      if (!art) { missing.push({ id: r.databaseId, cause: 'no ' + ARTIFACT + ' artifact in the run' }); continue; }
      arts.push({ run: r.databaseId, id: art.id, name: art.name, bytes: art.size_in_bytes, expired: art.expired, createdAt: art.created_at, expiresAt: art.expires_at });
      if (art.expired) { missing.push({ id: r.databaseId, cause: 'the ' + ARTIFACT + ' artifact expired' }); continue; }
      if (stopped) { missing.push({ id: r.databaseId, cause: 'not attempted: ' + stopped }); continue; }
      const zr = await call('/repos/' + slug + '/actions/artifacts/' + art.id + '/zip', { maxBytes: 256 * 1048576 });
      let zip = null, where = new URL(api.base).host;
      if (zr.status === 200) zip = zr.body;
      else if ([301, 302, 303, 307, 308].includes(zr.status) && zr.headers.location) {
        let loc;
        try { loc = new URL(zr.headers.location, api.base); } catch { missing.push({ id: r.databaseId, cause: 'the zip redirect named no URL' }); continue; }
        where = loc.host;
        const local = ['127.0.0.1', 'localhost'].includes(loc.hostname);
        if (!(loc.protocol === 'https:' || (loc.protocol === 'http:' && local))) { missing.push({ id: r.databaseId, cause: 'refused: the zip redirect is not https (' + loc.protocol + ')' }); continue; }
        try {
          // the signed URL carries its own grant: the token is NOT sent to this second host
          const z = await httpGet(loc.href, { headers: { 'user-agent': UA }, env, timeoutMs, maxBytes: 256 * 1048576 });
          if (z.status === 200) zip = z.body;
          else { const c = 'the signed artifact host ' + loc.host + ' answered ' + z.status; missing.push({ id: r.databaseId, cause: c }); stopped = c; continue; }
        } catch (err) {
          const c = 'the signed artifact host ' + loc.host + ' was not reached: ' + firstLine(err.message);
          missing.push({ id: r.databaseId, cause: c });
          stopped = c; // a refusal (an egress policy, a closed host) is not retried on the next run's artifact
          continue;
        }
      } else { missing.push({ id: r.databaseId, cause: 'the zip endpoint answered ' + zr.status + (msgOf(zr) ? ': ' + msgOf(zr) : '') }); continue; }
      let files;
      try { files = readZip(zip); } catch (err) { missing.push({ id: r.databaseId, cause: 'the zip from ' + where + ' did not read: ' + firstLine(err.message) }); continue; }
      const reading = readingFromFiles(r, (n) => (files.has(n) ? files.get(n).toString('utf8') : null));
      reading.zip = { bytes: zip.length, files: files.size, from: where };
      readings.push(reading);
    }
    log('REST: ' + via.calls + ' API calls, X-RateLimit-Remaining ' + via.rateRemaining + '; ' + readings.length + ' artifact(s) read, ' + missing.length + ' not');
    extra.artifacts = arts.length ? row(arts, { read: readings.map((x) => ({ run: x.run.databaseId, zipBytes: x.zip.bytes, files: x.zip.files })), missing }) : notMeasured('no ' + ARTIFACT + ' artifact listed' + (missing[0] ? ' (' + missing[0].cause + ')' : ''));
    extra.jobSteps = steps.length ? row(steps) : notMeasured('no completed run');
    const artifactCause = readings.length ? null : 'the ' + ARTIFACT + ' artifact could not be read (' + (missing[0] ? missing[0].cause : 'none listed') + ')';

    const pollS = steps.reduce((s, j) => s + (j.steps || []).filter((x) => /health poll/.test(x.name)).reduce((t, x) => t + (x.seconds || 0), 0), 0);
    const upS = readings.reduce((s, x) => s + (x.health && Number.isFinite(x.health.uptimeS) ? x.health.uptimeS : 0), 0);
    rows.uptimeFraction = row(r4(wall / (days * 1440)), { how: 'the completed runs\' wall minutes (updated_at minus run_started_at) over ' + (days * 1440), runWallMinutes: r1(wall), windowMinutes: days * 1440,
      containerMinutesFromHealth: readings.length ? r1(upS / 60) : null, healthPollMinutesFromSteps: r1(pollS / 60), artifactsMissing: missing });

    const newest = readings[0];
    if (!newest) {
      for (const k of ['healthOk', 'restartsInJob', 'ticksPerHour', 'checkpointAgeS', 'checkpointBytes', 'ladderLine']) rows[k] = notMeasured(artifactCause);
      extra.lastHealthLine = notMeasured(artifactCause);
    } else {
      const h = newest.health || {};
      const at = { run: newest.run.databaseId };
      if (!newest.health) for (const k of ['healthOk', 'restartsInJob', 'checkpointAgeS', 'checkpointBytes']) rows[k] = notMeasured('health.json absent in the artifact of run ' + newest.run.databaseId);
      else {
        rows.healthOk = h.ok === undefined ? notMeasured('ok absent in health.json') : row(h.ok === true, at);
        const cr = newest.container && Number.isFinite(newest.container.restartCount) ? newest.container.restartCount : 0;
        rows.restartsInJob = Number.isFinite(h.restarts) ? row(h.restarts + cr, { ...at, serve: h.restarts, container: cr, budgetKills: h.budgetKills ?? null }) : notMeasured('restarts absent in health.json');
        rows.checkpointAgeS = h.checkpoint && Number.isFinite(h.checkpoint.ageS) ? row(h.checkpoint.ageS, { ...at, atStopS: newest.job ? newest.job.checkpointAgeAtStopS ?? null : null }) : notMeasured('checkpoint.ageS absent in health.json');
        rows.checkpointBytes = h.checkpoint && Number.isFinite(h.checkpoint.bytes) ? row(h.checkpoint.bytes, { ...at, atStop: newest.job ? newest.job.checkpointBytesAtStop ?? null : null }) : notMeasured('checkpoint.bytes absent in health.json');
      }
      if (newest.ticksPerHour !== null) rows.ticksPerHour = row(newest.ticksPerHour, { ...at, from: 'health.log' });
      else if (Number.isFinite(h.ticksPerSec)) rows.ticksPerHour = row(Math.floor(h.ticksPerSec * 3600), { ...at, from: 'health.json ticksPerSec' });
      else rows.ticksPerHour = notMeasured('ticksPerSec absent in health.json and health.log has fewer than two ticks');
      extra.lastHealthLine = newest.lastHealthLine ? row(newest.lastHealthLine.health ? { at: newest.lastHealthLine.at ?? null, epoch: newest.lastHealthLine.epoch ?? null, ok: newest.lastHealthLine.health.ok ?? null, tick: newest.lastHealthLine.health.tick ?? null } : newest.lastHealthLine, { ...at, lines: newest.healthLogLines }) : notMeasured('health.log absent or empty in the artifact of run ' + newest.run.databaseId);
      const lad = readings.find((x) => x.ladderLine);
      rows.ladderLine = lad ? row(lad.ladderLine, { run: lad.run.databaseId, event: lad.run.event }) : notMeasured('no LADDER line in any ladder.log of the window (a scheduled run, or a dispatch with ladder=true, runs it)');
    }
    // the cost arithmetic of the daily job, from the jobs' own times (each job billed rounded up to the minute)
    const billed = steps.reduce((s, j) => s + (j.billedMinutes || 0), 0);
    const sched = steps.find((j) => j.event === 'schedule' && j.billedMinutes);
    const daily = sched ? sched.billedMinutes : null;
    const newestArt = arts[0] || null;
    extra.cost = steps.length ? row({ billedMinutesInWindow: billed, dailyJobBilledMinutes: daily, dailyJobFrom: sched ? sched.run : null, perMonth30: daily === null ? null : daily * 30, freePrivateMinutes: PRIVATE_MINUTES,
      fits: daily === null ? null : daily * 30 <= PRIVATE_MINUTES, artifactBytesNewest: newestArt ? newestArt.bytes : null, retainedBytes90Days: newestArt ? newestArt.bytes * RETENTION_DAYS : null, freeStoreBytes: STORE_BYTES }, { weekMinutes: WEEK_MINUTES }) : notMeasured('no job read');
    fill('not read');
    return { rows, extra, readings, cause: null, artifactCause, via };
  } catch (err) {
    const c = err instanceof RateLimited ? err.message : 'the API was not reached: ' + firstLine(err.message);
    fill(c);
    return { rows, extra, readings: [], cause: c, artifactCause: null, via };
  }
}

/** The host through gh when gh is logged in; through the REST API when gh is absent or logged out and a token variable is set. */
export async function measureHostAny(opts = {}) {
  const env = opts.env || process.env;
  const st = ghStatus(env);
  if (st.gh && st.loggedIn) return { ...measureHost(opts), via: { path: 'gh', gh: st.gh } };
  const tv = tokenVarOf(env);
  if (!tv.name && !tv.explicit) return { ...measureHost(opts), via: { path: 'gh', gh: st.cause } };
  return measureHostRest({ ...opts, why: st.cause || 'gh not logged in' });
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
  try { process.kill(pid, 0); } catch (e) { return e.code === 'EPERM'; }
  // board 20 builder: a zombie (exited, not yet reaped, as in a container whose pid 1 never reaps)
  // answers signal 0 but runs nothing; /proc names its state Z (or X), and it reads as dead
  if (process.platform === 'linux') {
    try { const st = readFileSync('/proc/' + pid + '/stat', 'utf8'); const state = st.slice(st.lastIndexOf(')') + 2, st.lastIndexOf(')') + 3); if (state === 'Z' || state === 'X') return false; } catch { /* no /proc entry: the signal's answer stands */ }
  }
  return true;
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

  const host = await measureHostAny({ root, days, repo: a.repo && a.repo !== true ? String(a.repo) : null, log: (l) => say('HOST ' + l) });
  const via = host.via || { path: 'gh' };
  for (const k of HOST_ROWS) {
    const r = host.rows[k];
    say('HOST ' + k + ': ' + (r.measured ? JSON.stringify(r.value) : 'not measured: ' + r.cause) + (r.measured && r.runWallMinutes !== undefined ? ' (the runs\' wall minutes ' + r.runWallMinutes + ' over ' + r.windowMinutes + '; health poll minutes from the job steps ' + r.healthPollMinutesFromSteps + '; container minutes from health.json ' + (r.containerMinutesFromHealth ?? 'not read') + ')' : ''));
  }
  if (host.extra) for (const k of HOST_EXTRA_ROWS) {
    const r = host.extra[k];
    if (!r.measured) { say('HOST ' + k + ': not measured: ' + r.cause); continue; }
    if (k === 'artifacts') for (const x of r.value) say('HOST artifacts: run ' + x.run + ' ' + x.name + ' id ' + x.id + ', ' + x.bytes + ' bytes, expired ' + x.expired + ', expires ' + x.expiresAt);
    else if (k === 'jobSteps') for (const j of r.value) say('HOST jobSteps: run ' + j.run + ' (' + j.event + ') ' + (j.error ? j.error : 'job ' + j.job + ' ' + j.conclusion + ' in ' + j.seconds + ' s; ' + j.steps.filter((x) => !/^(Set up job|Post |Complete job|checkout$)/.test(x.name)).map((x) => x.name + ' ' + x.conclusion + (x.seconds ? ' ' + x.seconds + ' s' : '')).join('; ')));
    else if (k === 'cost') { const c = r.value; say('HOST cost: the completed jobs of the window bill ' + c.billedMinutesInWindow + ' minutes (each rounded up); the daily scheduled job ' + (c.dailyJobFrom ? '(run ' + c.dailyJobFrom + ') bills ' + c.dailyJobBilledMinutes + ' minutes, 30 of them ' + c.perMonth30 + ' of the ' + c.freePrivateMinutes + ' free private minutes a month (fits ' + c.fits + ')' : 'has not run yet') + '; the newest artifact is ' + c.artifactBytesNewest + ' bytes, 90 days of daily ones ' + c.retainedBytes90Days + ' of the ' + c.freeStoreBytes + ' bytes a free account stores'); }
    else say('HOST ' + k + ': ' + JSON.stringify(r.value));
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

  const bar = host.cause ? { met: false, why: 'not measured: ' + host.cause } : !host.readings.length && host.artifactCause ? { met: false, why: 'not measured: ' + host.artifactCause } : barOf(host.readings);
  const barMet = Boolean(bar.met && wf.parses && wf.missing.length === 0 && ctl.holds);
  const lacks = trialBroken ? (trial.missingFiles && trial.missingFiles.length ? trial.missingFiles.join(', ') : 'whatever the daemon needs (the trial named no file; read its lastLines)') : '';
  const addCmd = trialBroken && trial.missingFiles && trial.missingFiles.length ? ' (git add -f ' + trial.missingFiles.join(' ') + ')' : '';
  const fixFirst = trialBroken ? 'commit ' + lacks + addCmd + ' (the checkout trial at HEAD ' + trial.head + ' read built false without it), then ' : '';
  const hisStep = host.cause === 'gh not logged in' ? fixFirst + 'gh auth login, then node tools/cloud-github.mjs (a private repository named brain unless he passes --public --yes)'
    : host.cause && /no origin/.test(host.cause) ? fixFirst + 'node tools/cloud-github.mjs (it creates the private repository and dispatches the first run)'
      : host.cause && /not on the default branch|no run of cloud\.yml/.test(host.cause) ? 'commit .github/workflows/cloud.yml' + (trialBroken ? ' with ' + lacks + addCmd + ' (the checkout trial at HEAD ' + trial.head + ' read built false without it)' : '') + ', then node tools/cloud-github.mjs (it pushes, enables the workflow and dispatches the first run)'
        : host.cause ? fixFirst + 'none that a command can name yet: ' + host.cause
          : host.artifactCause ? 'none on his side: from this host ' + host.artifactCause + '; the health rows are read where the artifact host is reachable (node bench/cloud-host.mjs on his PC with gh logged in)' : 'none';
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
      via: via.path === 'REST' ? 'the GitHub REST API at ' + via.api + ' (token read from the variable named ' + via.tokenVar + ', value never written; ' + via.calls + ' calls, X-RateLimit-Remaining ' + via.rateRemaining + ' after the last)' : 'gh (' + (via.gh || 'the gh CLI') + ')',
      measuredFromHost: [...HOST_ROWS.filter((k) => host.rows[k].measured), ...HOST_EXTRA_ROWS.filter((k) => host.extra && host.extra[k] && host.extra[k].measured)],
      notMeasuredFromHost: Object.fromEntries([...HOST_ROWS.filter((k) => !host.rows[k].measured).map((k) => [k, host.rows[k].cause]), ...HOST_EXTRA_ROWS.filter((k) => host.extra && host.extra[k] && !host.extra[k].measured).map((k) => [k, host.extra[k].cause])]),
      runsRead: host.rows.runs && host.rows.runs.measured ? host.rows.runs.ids : [],
      artifactsRead: host.readings.map((x) => x.run.databaseId),
      measuredOnThisPc: ['the workflow parses and passes its structural checks', 'every tree file the workflow names exists', ...(trial ? ['the committed tree (git archive HEAD) run under bin/serve.mjs natively: the CONTROL arm'] : []), ...(counterfactual ? ['COUNTERFACTUAL: the committed tree plus ' + cf.join(', ') + ', ' + repeat + ' trials: the intervention arm and its run-to-run band'] : [])],
      development: 'the tests plant git repositories, a gh on PATH that answers logged in or not, artifact directories, stale copies and a trial process that dies; the control grades barOf on planted readings',
      heldOut: 'the host itself: runs of .github/workflows/cloud.yml on GitHub Actions under his account, which no test and no development step has read',
      contaminated: false,
    },
    host_rows: host.rows,
    host_extra: host.extra || null,
    via,
    pc: { workflow: { exists: wf.exists, parses: wf.parses, error: wf.error, bytes: wf.bytes ?? null, checks: wf.checks, named: wf.named, missing: wf.missing }, checkoutTrial: trial, counterfactual },
    control: ctl,
    ms: Date.now() - t0,
  };
  const restPart = () => {
    const c = host.rows.conclusions.byRun.map((x) => x.id + ' (' + x.event + ', ' + x.conclusion + ')').join(', ');
    const ar = host.extra && host.extra.artifacts && host.extra.artifacts.measured ? host.extra.artifacts.value.map((x) => x.id + ' of ' + x.bytes + ' bytes from run ' + x.run).join(', ') : 'none';
    const ex = host.extra && host.extra.cost && host.extra.cost.measured ? host.extra.cost.value : null;
    return 'From the host through ' + verdict.split.via + ': runs ' + c + ' in ' + days + ' days; their wall minutes ' + host.rows.uptimeFraction.runWallMinutes + ' over ' + (days * 1440) + ' give the uptime fraction ' + host.rows.uptimeFraction.value + '; ' + ARTIFACT + ' artifacts listed: ' + ar + '; artifacts read: ' + (host.readings.length ? host.readings.map((x) => x.run.databaseId).join(', ') : 'none') + (host.artifactCause ? ' (' + host.artifactCause + ')' : '') + (ex ? '; the jobs bill ' + ex.billedMinutesInWindow + ' minutes in the window' + (ex.dailyJobFrom ? ', the daily scheduled job ' + ex.dailyJobBilledMinutes + ' (' + ex.perMonth30 + ' a month of ' + ex.freePrivateMinutes + ' free)' : '') : '') + '; the bar reads ' + bar.why + '. ';
  };
  const hostPart = host.cause
    ? 'No run was read from the host: ' + host.cause + ', so the rows that need a run (runs, uptime fraction, ticks per hour, restarts, checkpoint age and bytes, the ladder line) are not measured and barMet is false. His step: ' + hisStep + '. '
    : via.path === 'REST' ? restPart()
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
