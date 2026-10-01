// grow/sandbox.mjs: THE CLOUD SANDBOX RUNNER (NEXT-WEEK.md step 3, "Never on his PC"; grow/CONTRACT.md).
// Every candidate cell runs in a Vercel Sandbox: create a session (node24, deny-all network), write one
// gzipped ustar tarball (the candidate, grow/contract.mjs, grow/probe.mjs, the held-out and control rows
// stripped to {q}, a one-run nonce), run `node grow/probe.mjs cand --heldout heldout.jsonl --control control.jsonl
// --nonce-file nonce.txt`, read the probe's last stdout JSON line that carries the nonce, stop the session in a
// finally block, write result.json. The probe's fields are TRUSTED only when that line exists AND the probe
// exited 0: any other end (a non-zero exit, a kill, a timeout, no line with the nonce) gives validate.ok false,
// every row unrun (can null, got null) and the reason in error; nothing the probe reported is kept.
//   node --env-file=.env.local grow/sandbox.mjs run <candidateDir> [--heldout f.jsonl] [--control f.jsonl]
//        [--out result.json] [--backend vercel|here] [--timeout-ms 90000] [--api-base https://api.vercel.com]
//        [--fixture] [--verbose]
// Tokens are read by NAME (VERCEL_TOKEN, else VERCEL_OIDC_TOKEN) and are sent to api.vercel.com only; they
// are never printed. Exit: 0 result written, 2 usage or input, 3 token, 4 refused, 5 the sandbox API failed.
// --app (his NEXT-WEEK.md Day 2 builder arm): <candidateDir> is an APP directory (index.html, app.mjs, test.mjs);
// the tarball carries its top-level files under run/app/, grow/probe-app.mjs, grow/probe.mjs, grow/contract.mjs
// and the nonce, the command is `node grow/probe-app.mjs app --nonce-file nonce.txt`, and result.json is the app
// shape (buildAppResult) under the same distrust rule. --heldout and --control are refused with --app (exit 2);
// the here backend is refused outside grow/fixtures/ on his PC exactly as for a cell.
// Author: board 37 sandbox builder, 2026-09-30; --app by the Opus 5.5 builder for the Fable 5.1 orchestrator,
// Day 2 (2026-10-01), his NEXT-WEEK.md builder arm.
import fs from 'node:fs';
import os from 'node:os';
import crypto from 'node:crypto';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseJsonl } from './contract.mjs';
import { targz, untargz, withDirs } from './tar.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DEFAULT_TEAM = 'team_rpkst3dLcE7Nc9xFoEqNi9pp';
export const DEFAULT_PROJECT = 'prj_hr13jzKuf5bUVFyimrbQHAdyfZ4P';
export const VERCEL_API = 'https://api.vercel.com';
export const HERE_REFUSAL = 'candidates never run on his PC (NEXT-WEEK.md step 3); --backend here needs --fixture';
export const CLOUD_ENV = ['CLAUDE_CODE_REMOTE', 'GITHUB_ACTIONS', 'VERCEL', 'CI'];
const RUN_DIR = 'run';
const USAGE = [
  'usage: node grow/sandbox.mjs run <candidateDir> [--heldout <file.jsonl>] [--control <file.jsonl>] [--out <result.json>]',
  '         [--backend vercel|here] [--timeout-ms 90000] [--api-base https://api.vercel.com] [--fixture] [--verbose]',
  '  vercel (default): the candidate runs in a Vercel Sandbox (node24, network deny-all); token by NAME:',
  '    VERCEL_TOKEN, else VERCEL_OIDC_TOKEN (node --env-file=.env.local passes it without printing it).',
  '  here: the same probe as a child process on this machine; refused unless --fixture (a directory under',
  '    grow/fixtures/) or the environment is a cloud VM (' + CLOUD_ENV.join(', ') + ').',
  '  prints the result.json line; exit 0 written, 2 usage, 3 token, 4 refused, 5 sandbox API failure.',
  '       node grow/sandbox.mjs run <appDir> --app [--out <result.json>] [--backend vercel|here] [--fixture] [--timeout-ms]',
  '         [--api-base] [--verbose]   an app (index.html, app.mjs, test.mjs) through grow/probe-app.mjs; no --heldout/--control.',
].join('\n');

class Fail extends Error { constructor(code, line) { super(line); this.code = code; } }

// ------------------------------------------------------------------ arguments and identity
export function parseArgs(argv) {
  const o = { verb: argv[0], dir: null, heldout: null, control: null, out: null, backend: 'vercel', timeoutMs: 90000, apiBase: VERCEL_API, fixture: false, verbose: false, help: false, app: false };
  const rest = argv.slice(1);
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i], v = () => { if (i + 1 >= rest.length) throw new Fail(2, a + ' needs a value'); return rest[++i]; };
    if (a === '--help' || a === '-h') o.help = true;
    else if (a === '--heldout') o.heldout = v();
    else if (a === '--control') o.control = v();
    else if (a === '--out') o.out = v();
    else if (a === '--backend') o.backend = v();
    else if (a === '--timeout-ms') o.timeoutMs = Number(v());
    else if (a === '--api-base') o.apiBase = v().replace(/\/+$/, '');
    else if (a === '--fixture') o.fixture = true;
    else if (a === '--verbose') o.verbose = true;
    else if (a === '--app') o.app = true;
    else if (a.startsWith('--')) throw new Fail(2, 'unknown option ' + a);
    else if (!o.dir) o.dir = a;
    else throw new Fail(2, 'one candidate directory only, got a second: ' + a);
  }
  if (!['vercel', 'here'].includes(o.backend)) throw new Fail(2, '--backend is vercel or here, not ' + o.backend);
  if (!Number.isInteger(o.timeoutMs) || o.timeoutMs < 5000 || o.timeoutMs > 45 * 60000) throw new Fail(2, '--timeout-ms is an integer from 5000 to 2700000');
  if (o.app && (o.heldout || o.control)) throw new Fail(2, '--app takes no --heldout or --control: an app is judged by its own tests');
  return o;
}

/** The exp claim of a JWT as epoch seconds, or null; the token itself is never returned or printed. */
export function jwtExp(token) {
  const part = String(token || '').split('.')[1];
  if (!part) return null;
  try {
    const p = JSON.parse(Buffer.from(part.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
    return Number.isFinite(p.exp) ? p.exp : null;
  } catch { return null; }
}

/** Which token by NAME, and a refusal when the OIDC one is expired. */
export function readToken(env = process.env, now = Date.now()) {
  if (env.VERCEL_TOKEN) return { name: 'VERCEL_TOKEN', value: env.VERCEL_TOKEN };
  if (env.VERCEL_OIDC_TOKEN) {
    const exp = jwtExp(env.VERCEL_OIDC_TOKEN);
    if (exp !== null && exp * 1000 <= now) {
      throw new Fail(3, 'the OIDC token expired at ' + new Date(exp * 1000).toISOString() + '; run: npx -y vercel@latest env pull .env.local --yes');
    }
    return { name: 'VERCEL_OIDC_TOKEN', value: env.VERCEL_OIDC_TOKEN };
  }
  return null;
}

export function readIds(env = process.env) {
  let pj = {};
  try { pj = JSON.parse(fs.readFileSync(path.join(ROOT, '.vercel', 'project.json'), 'utf8')); } catch { /* the defaults */ }
  return { team: env.VERCEL_TEAM_ID || pj.orgId || DEFAULT_TEAM, project: env.VERCEL_PROJECT_ID || pj.projectId || DEFAULT_PROJECT };
}

export const isVercelApi = (base) => { try { return new URL(base).hostname === 'api.vercel.com'; } catch { return false; } };
const inside = (child, parent) => { const r = path.relative(parent, child); return !!r && !r.startsWith('..') && !path.isAbsolute(r); };
const posix = (p) => p.split(path.sep).join('/');

// ------------------------------------------------------------------ the tarball
function rowsOf(file, what) {
  if (!file) return [];
  let rows;
  try { rows = parseJsonl(fs.readFileSync(file, 'utf8')); } catch (e) { throw new Fail(2, what + ' ' + file + ': ' + String((e && e.message) || e)); }
  for (const [i, r] of rows.entries()) if (!r || typeof r.q !== 'string' || !r.q.length) throw new Fail(2, what + ' row ' + (i + 1) + ' has no q string');
  return rows.map((r) => ({ q: r.q })); // STRIPPED: the expect never enters the sandbox
}

/** The files the sandbox receives, under run/: grow/probe.mjs, grow/contract.mjs, cand/*, the rows, the nonce. */
export function packEntries(candDir, heldRows, ctlRows, nonce = null) {
  const files = [];
  const names = fs.readdirSync(candDir, { withFileTypes: true }).filter((d) => d.isFile()).map((d) => d.name);
  if (!names.includes('cell.mjs')) throw new Fail(2, 'no cell.mjs in ' + candDir);
  for (const n of names.sort()) {
    if (n === 'test.mjs' || n === 'examples.jsonl' || n.endsWith('.mjs')) files.push({ name: RUN_DIR + '/cand/' + n, data: fs.readFileSync(path.join(candDir, n)) });
  }
  files.push({ name: RUN_DIR + '/grow/contract.mjs', data: fs.readFileSync(path.join(ROOT, 'grow', 'contract.mjs')) });
  files.push({ name: RUN_DIR + '/grow/probe.mjs', data: fs.readFileSync(path.join(ROOT, 'grow', 'probe.mjs')) });
  files.push({ name: RUN_DIR + '/heldout.jsonl', data: heldRows.map((r) => JSON.stringify(r)).join('\n') + (heldRows.length ? '\n' : '') });
  files.push({ name: RUN_DIR + '/control.jsonl', data: ctlRows.map((r) => JSON.stringify(r)).join('\n') + (ctlRows.length ? '\n' : '') });
  if (nonce) files.push({ name: RUN_DIR + '/' + NONCE_FILE, data: nonce + '\n' }); // the probe reads it and deletes it before any candidate code runs
  return withDirs(files);
}

export const NONCE_FILE = 'nonce.txt';
export const PROBE_ARGS = ['grow/probe.mjs', 'cand', '--heldout', 'heldout.jsonl', '--control', 'control.jsonl', '--nonce-file', NONCE_FILE];
export const PROBE_APP_ARGS = ['grow/probe-app.mjs', 'app', '--nonce-file', NONCE_FILE];
export const newNonce = () => crypto.randomBytes(16).toString('hex');

/**
 * The files an APP run receives, under run/: every top-level regular file of appDir as app/<name>, the app probe
 * with the two modules it imports, and the nonce. An app is top-level files only: a subdirectory or a link in
 * appDir is refused here (exit 2), never silently left behind.
 */
export function packAppEntries(appDir, nonce = null) {
  const files = [];
  for (const d of fs.readdirSync(appDir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
    if (!d.isFile()) throw new Fail(2, 'the app directory holds ' + d.name + ', which is not a regular file: an app is top-level files only');
    files.push({ name: RUN_DIR + '/app/' + d.name, data: fs.readFileSync(path.join(appDir, d.name)) });
  }
  for (const m of ['probe-app.mjs', 'probe.mjs', 'contract.mjs']) files.push({ name: RUN_DIR + '/grow/' + m, data: fs.readFileSync(path.join(ROOT, 'grow', m)) });
  if (nonce) files.push({ name: RUN_DIR + '/' + NONCE_FILE, data: nonce + '\n' }); // the app probe reads it and deletes it first
  return withDirs(files);
}

/**
 * The probe's last stdout line that parses as a JSON object, or null. With a nonce, only a line whose
 * nonce field equals it counts: a line a candidate wrote to the same stdout cannot pass for the probe's.
 */
export function lastJson(stdout, nonce = null) {
  const lines = String(stdout || '').split(/\r?\n/);
  for (let i = lines.length - 1; i >= 0; i--) {
    const l = lines[i].trim();
    if (!l.startsWith('{')) continue;
    let j = null;
    try { j = JSON.parse(l); } catch { /* keep looking */ }
    if (j && typeof j === 'object' && !Array.isArray(j) && (nonce === null || j.nonce === nonce)) return j;
  }
  return null;
}

/** ND-JSON from POST .../cmd: stdout, stderr and the final exitCode. */
export function parseCmdStream(text) {
  let stdout = '', stderr = '', exitCode = null, durationMs = null, error = null;
  for (const line of String(text || '').split(/\r?\n/)) {
    if (!line.trim()) continue;
    let j; try { j = JSON.parse(line); } catch { continue; }
    if (j.command && typeof j.command === 'object') {
      if (j.command.exitCode !== null && j.command.exitCode !== undefined) exitCode = j.command.exitCode;
      if (Number.isFinite(j.command.durationMs)) durationMs = j.command.durationMs;
    } else if (typeof j.data === 'string') {
      if (j.stream === 'stderr') stderr += j.data; else stdout += j.data;
    } else if (j.error) error = typeof j.error === 'string' ? j.error : JSON.stringify(j.error).slice(0, 300);
  }
  return { stdout, stderr, exitCode, durationMs, error };
}

// ------------------------------------------------------------------ the result
const tail = (s, n = 2000) => String(s || '').split(/\r?\n/).filter((l) => l.trim()).slice(-20).join('\n').slice(-n);

/**
 * Why the probe's line may not be believed, or null when it may: the line carries the run's nonce (lastJson)
 * AND the probe process exited 0 AND the run itself reported no error (a kill, a timeout, a stream error).
 */
export function distrust(probe, exitCode, error) {
  if (error) return String(error);
  if (!probe) return 'the probe printed no JSON line carrying this run\'s nonce (exit ' + exitCode + ')';
  if (exitCode !== 0) return 'the probe exited ' + exitCode + ' after printing its line, so nothing it reported is trusted';
  return null;
}

export function buildResult({ candidate, backend, session, startedAt, wallMs, cpuMs, probe, exitCode, error, held, ctl, fallbackId, stderr, nodeVersion }) {
  const unrunHeld = held.map((r) => ({ q: r.q, can: null, got: null, ms: null }));
  const unrunCtl = ctl.map((r) => ({ q: r.q, can: null }));
  const why = distrust(probe, exitCode, error);
  if (why) { // not one field of the probe's line survives: an untrusted line is not a partial result
    return {
      candidate, id: fallbackId, class: null, backend, session, node: nodeVersion ?? null, startedAt, wallMs, cpuMs,
      validate: { ok: false, errors: [why] },
      tests: { exitCode: null, passed: null, failed: null, tail: tail(stderr) },
      examples: [], heldout: unrunHeld, control: unrunCtl,
      exitCode: exitCode ?? null, error: why,
    };
  }
  const v = probe.validate && typeof probe.validate === 'object' ? probe.validate : { ok: false, errors: ['the probe printed no validate'] };
  const t = probe.tests && typeof probe.tests === 'object' ? probe.tests : {};
  return {
    candidate, id: probe.id ?? fallbackId, class: probe.class ?? null, backend, session, node: probe.node ?? nodeVersion ?? null,
    startedAt, wallMs, cpuMs,
    validate: { ok: v.ok === true, errors: Array.isArray(v.errors) ? v.errors : [] },
    tests: { exitCode: t.exitCode ?? null, passed: t.passed ?? null, failed: t.failed ?? null, tail: typeof t.tail === 'string' ? t.tail : '' },
    examples: Array.isArray(probe.examples) ? probe.examples.map((r) => ({ q: r.q, can: r.can ?? null, got: r.got ?? null })) : [],
    heldout: Array.isArray(probe.heldout) ? probe.heldout.map((r) => ({ q: r.q, can: r.can ?? null, got: r.got ?? null, ms: r.ms ?? null })) : unrunHeld,
    control: Array.isArray(probe.control) ? probe.control.map((r) => ({ q: r.q, can: r.can ?? null })) : unrunCtl,
    exitCode, error: null,
  };
}

/**
 * The app result.json under the same distrust rule as buildResult: the probe's line counts only when it carries the
 * run's nonce AND the probe exited 0 AND the run reported no error; otherwise validate.ok false with the reason as
 * error, tests null and no file of the probe's listing kept. The slug is the runner's (the app directory's name):
 * inside the sandbox the directory is always app/, so the probe's own slug is never the app's.
 */
export function buildAppResult({ candidate, backend, session, startedAt, wallMs, cpuMs, probe, exitCode, error, fallbackId, stderr, nodeVersion }) {
  const why = distrust(probe, exitCode, error) ?? (probe.kind !== 'app' ? 'the probe line is not an app probe\'s (kind ' + JSON.stringify(probe.kind ?? null) + ')' : null);
  const head = { candidate, kind: 'app', slug: fallbackId, backend, session };
  if (why) {
    return {
      ...head, node: nodeVersion ?? null, startedAt, wallMs, cpuMs,
      validate: { ok: false, errors: [why] },
      tests: { exitCode: null, passed: null, failed: null, tail: tail(stderr) },
      files: {}, exitCode: exitCode ?? null, error: why,
    };
  }
  const v = probe.validate && typeof probe.validate === 'object' ? probe.validate : { ok: false, errors: ['the probe printed no validate'] };
  const t = probe.tests && typeof probe.tests === 'object' ? probe.tests : {};
  const files = {};
  if (probe.files && typeof probe.files === 'object' && !Array.isArray(probe.files)) for (const [k, b] of Object.entries(probe.files)) if (Number.isFinite(b)) files[k] = b;
  return {
    ...head, node: probe.node ?? nodeVersion ?? null, startedAt, wallMs, cpuMs,
    validate: { ok: v.ok === true, errors: Array.isArray(v.errors) ? v.errors.map((e) => String(e)) : [] },
    tests: { exitCode: t.exitCode ?? null, passed: t.passed ?? null, failed: t.failed ?? null, tail: typeof t.tail === 'string' ? t.tail : '' },
    files, exitCode, error: null,
  };
}

// ------------------------------------------------------------------ the vercel backend
async function runVercel(o, ctx) {
  const { tgz, log, nonce } = ctx;
  const vercel = isVercelApi(o.apiBase);
  const tok = readToken(process.env);
  if (vercel && !tok) throw new Fail(3, 'no VERCEL_TOKEN or VERCEL_OIDC_TOKEN in the environment; run: npx -y vercel@latest env pull .env.local --yes, then node --env-file=.env.local grow/sandbox.mjs ...');
  const { team, project } = readIds(process.env);
  const H = { 'content-type': 'application/json' };
  if (vercel && tok) H.authorization = 'Bearer ' + tok.value; // the token goes to api.vercel.com and nowhere else
  const url = (p) => o.apiBase + p + (p.includes('?') ? '&' : '?') + 'teamId=' + encodeURIComponent(team);
  const call = async (what, p, init, ms = 60000) => {
    const t = Date.now();
    let r;
    try { r = await fetch(url(p), { ...init, signal: AbortSignal.timeout(ms) }); } catch (e) {
      const err = new Fail(5, what + ' did not answer: ' + String((e && e.cause && e.cause.code) || (e && e.name) || e));
      err.abort = e && (e.name === 'TimeoutError' || e.name === 'AbortError');
      throw err;
    }
    const text = await r.text();
    log(what + ' ' + r.status + ' in ' + (Date.now() - t) + ' ms');
    if (!r.ok) throw new Fail(5, what + ' answered ' + r.status + ': ' + text.replace(/eyJ[A-Za-z0-9_.-]+/g, '<token>').replace(/\s+/g, ' ').slice(0, 300));
    return text;
  };
  const t0 = Date.now();
  const startedAt = new Date(t0).toISOString();
  const name = ('grow-' + String(ctx.fallbackId).replace(/[^a-z0-9-]/gi, '').toLowerCase().slice(0, 24) + '-' + t0.toString(36) + Math.random().toString(36).slice(2, 6)).replace(/--+/g, '-');
  const createdText = await call('create', '/v2/sandboxes', { method: 'POST', headers: H, body: JSON.stringify({
    name, projectId: project, runtime: 'node24', timeout: o.timeoutMs + 60000, persistent: false,
    resources: { vcpus: 1, memory: 2048 }, networkPolicy: { mode: 'deny-all' },
  }) });
  let created;
  try { created = JSON.parse(createdText); } catch { throw new Fail(5, 'create answered a body that is not JSON'); }
  const sid = (created.session && created.session.id) || (created.sandbox && created.sandbox.currentSessionId);
  if (!sid) throw new Fail(5, 'create answered no session id');
  const cwd = (created.sandbox && created.sandbox.cwd) || (created.session && created.session.cwd) || '/vercel/sandbox';
  log('session ' + sid + ', cwd ' + cwd);
  let probeOut = null, exitCode = null, error = null, stderr = '', cpuMs = null, stopErr = null, infra = null;
  try {
    await call('fs/write', '/v2/sandboxes/sessions/' + sid + '/fs/write', { method: 'POST', headers: { ...H, 'content-type': 'application/gzip', 'x-cwd': cwd }, body: tgz });
    let text = null;
    try {
      text = await call('cmd', '/v2/sandboxes/sessions/' + sid + '/cmd', { method: 'POST', headers: H, body: JSON.stringify({
        command: 'node', args: ctx.probeArgs || PROBE_ARGS, cwd: cwd.replace(/\/+$/, '') + '/' + RUN_DIR, wait: true, logs: true, timeout: o.timeoutMs,
      }) }, o.timeoutMs + 20000);
    } catch (e) {
      if (!e.abort) throw e;
      error = 'the probe command did not return within ' + (o.timeoutMs + 20000) + ' ms';
    }
    if (text !== null) {
      const c = parseCmdStream(text);
      stderr = c.stderr; exitCode = c.exitCode;
      probeOut = lastJson(c.stdout, nonce);
      if (c.error) error = c.error;
    }
  } catch (e) { infra = e; }
  finally {
    try {
      const s = JSON.parse(await call('stop', '/v2/sandboxes/sessions/' + sid + '/stop', { method: 'POST', headers: H, body: '{}' }, 30000) || '{}');
      const a = s.session && s.session.activeCpuDurationMs;
      cpuMs = Number.isFinite(a) ? Math.round(a) : null;
      if (cpuMs === null) stopErr = 'stop answered no activeCpuDurationMs';
    } catch (e) { stopErr = String(e.message || e); }
  }
  if (infra) throw new Fail(infra.code || 5, String(infra.message || infra) + (stopErr ? '; and ' + stopErr : '; the session was stopped'));
  const res = (ctx.build || buildResult)({ candidate: ctx.candidate, backend: 'vercel', session: sid, startedAt, wallMs: Date.now() - t0, cpuMs, probe: probeOut,
    exitCode, error, held: ctx.held, ctl: ctx.ctl, fallbackId: ctx.fallbackId, stderr });
  if (stopErr) res.error = (res.error ? res.error + '; ' : '') + stopErr; // after the probe: no row is untrusted by it, the run still fails
  return res;
}

// ------------------------------------------------------------------ the here backend (fixtures and cloud VMs only)
function hereAllowed(o, candAbs, env = process.env) {
  if (CLOUD_ENV.some((k) => env[k])) return;
  if (!o.fixture) throw new Fail(4, HERE_REFUSAL);
  if (!inside(candAbs, path.join(ROOT, 'grow', 'fixtures'))) throw new Fail(4, '--fixture runs only a directory under grow/fixtures/; ' + posix(candAbs) + ' is not one');
}

async function runHere(o, ctx) {
  const t0 = Date.now();
  const startedAt = new Date(t0).toISOString();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'grow-here-'));
  try {
    for (const e of untargz(ctx.tgz)) { // the same bytes the sandbox receives
      const dest = path.join(tmp, ...e.name.split('/').filter(Boolean));
      if (e.type === 'dir') fs.mkdirSync(dest, { recursive: true }); else { fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, e.data); }
    }
    const keep = ['PATH', 'Path', 'HOME', 'USERPROFILE', 'SystemRoot', 'SYSTEMROOT', 'TEMP', 'TMP', 'TMPDIR'];
    const env = {}; for (const k of keep) if (process.env[k] !== undefined) env[k] = process.env[k]; // no token reaches the probe
    const r = await new Promise((ok) => {
      const c = spawn(process.execPath, ctx.probeArgs || PROBE_ARGS, { cwd: path.join(tmp, RUN_DIR), env, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
      let out = '', err = '', killed = false;
      c.stdout.on('data', (d) => { out += d; });
      c.stderr.on('data', (d) => { err += d; });
      const t = setTimeout(() => { killed = true; c.kill(); }, o.timeoutMs);
      c.on('close', (code) => { clearTimeout(t); ok({ code, out, err, killed }); });
    });
    const probe = lastJson(r.out, ctx.nonce);
    const error = r.killed ? 'the probe was killed after ' + o.timeoutMs + ' ms' : null;
    const cpuMs = probe && !distrust(probe, r.code, error) && Number.isFinite(probe.probeCpuMs) ? Math.round(probe.probeCpuMs) : null;
    return (ctx.build || buildResult)({ candidate: ctx.candidate, backend: 'here', session: null, startedAt, wallMs: Date.now() - t0, cpuMs, probe, exitCode: r.code,
      error, held: ctx.held, ctl: ctx.ctl, fallbackId: ctx.fallbackId, stderr: r.err, nodeVersion: process.version });
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
}

// ------------------------------------------------------------------ main
export async function main(argv) {
  const o = parseArgs(argv);
  if (o.help || o.verb === '--help' || o.verb === '-h') return { usage: true };
  if (o.verb !== 'run' || !o.dir) throw new Fail(2, USAGE.split('\n')[0]);
  const candAbs = path.resolve(o.dir);
  if (!fs.existsSync(candAbs) || !fs.statSync(candAbs).isDirectory()) throw new Fail(2, 'no candidate directory ' + o.dir);
  if (o.backend === 'here') hereAllowed(o, candAbs);
  const log = o.verbose ? (s) => process.stderr.write('[sandbox] ' + s + '\n') : () => {};
  if (o.app) { // the builder arm: an app directory through the app probe, the same backends and the same distrust rule
    const nonce = newNonce();
    const tgz = targz(packAppEntries(candAbs, nonce));
    log('app tarball ' + tgz.length + ' bytes');
    const ctx = { tgz, log, nonce, held: [], ctl: [], fallbackId: path.basename(candAbs), probeArgs: PROBE_APP_ARGS, build: buildAppResult,
      candidate: inside(candAbs, ROOT) ? posix(path.relative(ROOT, candAbs)) : posix(candAbs) };
    const result = o.backend === 'here' ? await runHere(o, ctx) : await runVercel(o, ctx);
    const out = path.resolve(o.out || path.join(candAbs, 'result.json'));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(result, null, 2) + '\n');
    log('wrote ' + out);
    return { result };
  }
  const held = rowsOf(o.heldout, '--heldout'), ctl = rowsOf(o.control, '--control');
  const nonce = newNonce();
  const tgz = targz(packEntries(candAbs, held, ctl, nonce));
  log('tarball ' + tgz.length + ' bytes, ' + held.length + ' held-out rows, ' + ctl.length + ' control rows');
  const ctx = { tgz, log, nonce, held, ctl, fallbackId: path.basename(candAbs), candidate: inside(candAbs, ROOT) ? posix(path.relative(ROOT, candAbs)) : posix(candAbs) };
  const result = o.backend === 'here' ? await runHere(o, ctx) : await runVercel(o, ctx);
  const out = path.resolve(o.out || path.join(candAbs, 'result.json'));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(result, null, 2) + '\n');
  log('wrote ' + out);
  return { result };
}

const same = (x, y) => (process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y);
if (process.argv[1] && same(path.resolve(process.argv[1]), fileURLToPath(import.meta.url))) {
  const redact = (s) => String(s).replace(/eyJ[A-Za-z0-9_.-]+/g, '<token>');
  main(process.argv.slice(2)).then((r) => {
    if (r.usage) { process.stdout.write(USAGE + '\n'); return; }
    process.stdout.write(JSON.stringify(r.result) + '\n');
  }, (e) => {
    process.stderr.write(redact(e instanceof Fail ? e.message : 'sandbox runner failed: ' + ((e && e.stack) || e)).split('\n')[0] + '\n');
    process.exitCode = e instanceof Fail ? e.code : 1;
  });
}
