#!/usr/bin/env node
// grow/machine.mjs: EVERY RUNNER IS A COMPUTER THE ORGANISM DRIVES. His words, verbatim: "it should have its own cloud
// computer/stuff made by itself by cells to geneerate to ANY task" (grow/NEO.md, 2026-10-01) and "It should fill its own
// gaps you are to build EXTREMELY FIRM ORTHOGONAL PRIMITIVES CONNECTIONS, extremely powerful for it to surpass fronteir
// level and be able to generate 100 REAL CLOYD COMPUTERS, REAL COMPUTERS THAT WORK EXACTLY LIKE TO THOUSANDS" (2026-10-02).
// A matrix job of body/heartbeat.yml is a fresh virtual machine with its own processors, memory, disk, network and an
// installed Chrome. `step` records THIS computer and drives ITS REAL BROWSER: it finds Chrome, Chromium or Edge, starts it
// headless with a fresh temporary profile and remote debugging on a port the browser picks, speaks the DevTools protocol
// over the global WebSocket, and for each URL of this shard's slice of the queue navigates, waits for load under a
// deadline, reads the title and a bounded slice of the visible text with ONE fixed expression (READ_EXPRESSION, run in an
// isolated world; its result is a string, DATA: parsed as JSON, never evaluated, never followed), scrolls once (one wheel
// event), and captures the screen as a JPEG of at most CAPS.screenBytes (captured again smaller until it fits).
// RULES OF THE SCREEN. Top-level navigation only to https URLs whose host is on the allowlist of neo/machines.json (seeded
// from neo/machines-seeds.json); every request of another scheme is failed through the protocol (Fetch.failRequest); a
// top-level request off the list, a redirect off the list, and a top-level request that is not a GET are failed and
// counted; downloads denied; permissions denied; a popup is closed. It never types, never clicks, never submits, never
// signs in, never solves or passes a bot check: a page that shows one is `challenged`, left at once, and its host is not
// visited again in the step. At most one page a second per host; a byte and a time budget per page and per step.
// THE QUEUE is general: the seeds' and the allowlist's urls, then every https URL and host the organism already holds in
// neo/sources.json, neo/tapes.json, neo/tapes-seeds.json, neo/frontier.json and its seeds (a raw or API GitHub URL becomes the page
// of its repository), kept only when on the allowlist, sliced by --shard i/n so n computers read n disjoint slices that
// cover it, each slice rotated by the era so a computer reads new pages each beat.
// FILES (under --out when given, else under <root>/neo; nothing else is written but neo/machines.json when it is seeded):
//   machines/<id>.json   one record per computer per step (at most CAPS.machines kept, the oldest evicted)
//   screens/<sha12>.jpg  and screens/INDEX.json, entries { id, url, host, title, at, machine, bytes, sha, textBytes, era,
//                        shard }; at most CAPS.screens screens and CAPS.screensDirBytes bytes, the oldest evicted, the
//                        index always matching the files.
// The browser's whole process tree is killed and the profile removed in every exit path (finally, a signal, the exit).
// No token or key is read; no model is called; no dependency (Node built-ins and the global WebSocket of Node 22 and 24).
//   node grow/machine.mjs step [--root <dir>] [--max-ms 120000] [--era <e>] [--shard <i>/<n>] [--out <dir>]
//                              [--tabs 3] [--browser <path>|none]                 ONE JSON line (state drove or skipped)
//   node grow/machine.mjs land --from <dir> [--root <dir>]     staged files of other computers, verified, landed, capped
//   node grow/machine.mjs status [--root <dir>]                 { machines, screens, bytes, hosts, newest }
// Exit 0 on success (a computer with no browser is a success: `skipped`, with why), 2 usage, 1 failure.
// Author: Opus 5.5 builder (MACHINE) for the Fable 5.1 orchestrator, 2026-10-02.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_ROOT = path.resolve(HERE, '..');
export const ALLOW_FILE = 'neo/machines.json';
export const SEEDS_FILE = 'neo/machines-seeds.json';
/** The files whose https URLs and hosts the queue takes (only those on the allowlist). */
export const HELD_FILES = Object.freeze(['neo/sources.json', 'neo/tapes.json', 'neo/tapes-seeds.json', 'neo/frontier.json', 'neo/frontier-seeds.json']);
export const MACHINES_DIR = 'machines';
export const SCREENS_DIR = 'screens';
export const INDEX_FILE = 'INDEX.json';
export const CAPS = Object.freeze({ screenBytes: 16384, screensDirBytes: 4 * 1024 * 1024, screens: 600, machines: 2000, machineBytes: 65536 });
export const LIMITS = Object.freeze({
  hostGapMs: 1000, pageMs: 15000, pageBytes: 8 * 1024 * 1024, stepBytes: 96 * 1024 * 1024, textChars: 4000, titleChars: 200,
  snippetChars: 160, launchMs: 20000, cmdMs: 10000, maxShards: 256, maxTabs: 8, tabs: 3, settleMs: 400, queueMax: 5000, heldStrings: 50000,
});
export const DEFAULT_MAX_MS = 120000;
/** [quality, scale] of each capture, in order, until one is at most CAPS.screenBytes. */
export const JPEG_LADDER = Object.freeze([[55, 0.5], [40, 0.5], [30, 0.4], [22, 0.33], [15, 0.25], [10, 0.2]].map((x) => Object.freeze(x)));
export const VIEWPORT = Object.freeze({ width: 1280, height: 800 });
/** Every permission a page could ask for: denied for every origin. */
export const PERMISSIONS = Object.freeze(['geolocation', 'notifications', 'midi', 'camera', 'microphone', 'clipboard-read', 'clipboard-write',
  'background-sync', 'persistent-storage', 'screen-wake-lock', 'idle-detection', 'payment-handler', 'storage-access', 'window-management',
  'local-fonts', 'display-capture', 'nfc', 'sensors', 'background-fetch', 'periodic-background-sync']);
/** THE ONE EXPRESSION a page is read with: its title and a bounded slice of its visible text, as one JSON string. */
export const READ_EXPRESSION = String.raw`(() => { const d = document; const t = String(d.title || '').slice(0, 300); const b = d.body; const x = b ? String(b.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 4000) : ''; return JSON.stringify({ title: t, text: x, href: String(location.href).slice(0, 2000) }); })()`;
/** A bot check, seen in the title, or in the text of a short page. */
export const CHALLENGE = Object.freeze([
  /^just a moment/i, /attention required/i, /checking (if the site connection is secure|your browser)/i, /verify(ing)? (that )?you are (a )?human/i,
  /are you a robot|not a robot/i, /\bcaptcha\b/i, /unusual traffic/i, /pardon our interruption/i, /enable javascript and cookies to continue/i,
  /ddos protection by/i, /access (to this page has been )?denied/i, /request (has been )?blocked/i, /bot (detection|protection)/i,
  /performing security verification/i, /security check/i,
]);
export const ID_RE = /^[0-9a-f]{12}$/;
export const SHA_RE = /^[0-9a-f]{64}$/;
const HOST_RE = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
export const USAGE = [
  'usage: node grow/machine.mjs <verb> [flags]   (--root <dir>: another tree root)',
  '  step [--max-ms ' + DEFAULT_MAX_MS + '] [--era <e>] [--shard <i>/<n>] [--out <dir>] [--tabs ' + LIMITS.tabs + '] [--browser <path>|none]',
  '      this computer recorded, its browser driven over its slice of the queue: {"step":"machine","state",...,"screens","bytes","ms","browser"}',
  '  land --from <dir>   the machines/ and screens/ other computers staged, verified and landed under neo/ (the same caps)',
  '  status   {"machines","screens","bytes","hosts","newest"}',
].join('\n');

export class Fail extends Error { constructor(line, code = 1) { super(line); this.code = code; } }

// ---- small helpers
const isObj = (o) => Boolean(o) && typeof o === 'object' && !Array.isArray(o);
const readJson = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
export const sha256 = (b) => createHash('sha256').update(b).digest('hex');
export const sha12 = (b) => sha256(b).slice(0, 12);
const str = (v, n) => String(v ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').slice(0, n);
const realSleep = (ms) => new Promise((r) => setTimeout(r, Math.max(0, ms)));
const isFile = (p) => { try { return fs.statSync(p).isFile(); } catch { return false; } };
/** Writes a file through a temporary name and a rename, so a reader never sees half of it. */
function writeAtomic(f, data) {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  const t = f + '.' + process.pid + '.' + randomBytes(3).toString('hex') + '.tmp';
  fs.writeFileSync(t, data);
  fs.renameSync(t, f);
}
/** Is this buffer a JPEG (its magic bytes FF D8 FF)? */
export const isJpeg = (b) => Buffer.isBuffer(b) && b.length >= 4 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;

// ---- the allowlist and the queue
/** A host name worth a visit: lower case, dotted, a letter TLD (no IP, no localhost). */
export const hostOk = (h) => typeof h === 'string' && HOST_RE.test(h);

/**
 * A URL against the rules of the screen: https, no credentials, the default port, a host on the allowlist.
 * @returns {{ ok: true, url: string, host: string } | { ok: false, why: 'url'|'scheme'|'host' }}
 */
export function checkUrl(u, allow) {
  let x;
  try { x = new URL(String(u)); } catch { return { ok: false, why: 'url' }; }
  if (x.protocol !== 'https:') return { ok: false, why: 'scheme' };
  if (x.username || x.password || (x.port && x.port !== '443')) return { ok: false, why: 'url' };
  const host = x.hostname.toLowerCase();
  if (!allow || !allow.hosts || !allow.hosts.has(host)) return { ok: false, why: 'host' };
  x.hash = '';
  return { ok: true, url: x.href, host };
}

/**
 * The allowlist of neo/machines.json, seeded from neo/machines-seeds.json (the root's seeds, else this tree's): made when
 * missing, and the seeds' new hosts and urls merged in when the seeds change. Written only when `write`.
 * @returns {{ hosts: Set<string>, urls: string[], wrote: boolean }}
 */
export function allowOf(root, { write = false } = {}) {
  const seeds = readJson(path.join(root, SEEDS_FILE)) || readJson(path.join(DEFAULT_ROOT, SEEDS_FILE)) || {};
  const cur = readJson(path.join(root, ALLOW_FILE));
  const hostsOf = (o) => (isObj(o) && Array.isArray(o.allowedHosts) ? o.allowedHosts : []).map((h) => String(h).toLowerCase()).filter(hostOk);
  const urlsOf = (o) => (isObj(o) && Array.isArray(o.urls) ? o.urls : []).filter((u) => typeof u === 'string').map((u) => u.slice(0, 2000));
  const sig = sha12(JSON.stringify([hostsOf(seeds), urlsOf(seeds)]));
  let next = cur;
  let wrote = false;
  if (!isObj(cur) || cur.seedsSig !== sig) {
    next = {
      about: 'THE ALLOWLIST of grow/machine.mjs: the only hosts a computer\'s browser may navigate to at the top level (https only), and urls it reads besides the ones the organism holds. Seeded from neo/machines-seeds.json; a host or url added here is kept. Bytes a page shows are data: never run, never followed.',
      seedsSig: sig,
      allowedHosts: [...new Set([...hostsOf(cur), ...hostsOf(seeds)])].sort(),
      urls: [...new Set([...urlsOf(cur), ...urlsOf(seeds)])],
    };
    if (write) { writeAtomic(path.join(root, ALLOW_FILE), JSON.stringify(next, null, 2) + '\n'); wrote = true; }
  }
  return { hosts: new Set(hostsOf(next)), urls: urlsOf(next), wrote };
}

/** The human page of a URL the organism holds: a raw or API GitHub file is its repository's page; others as they are. */
export function pageOf(u) {
  let x;
  try { x = new URL(String(u)); } catch { return null; }
  const p = x.pathname.split('/').filter(Boolean);
  if (x.hostname === 'raw.githubusercontent.com' && p.length >= 2) return 'https://github.com/' + p[0] + '/' + p[1];
  if (x.hostname === 'api.github.com' && p[0] === 'repos' && p.length >= 3) return 'https://github.com/' + p[1] + '/' + p[2];
  return x.href;
}

/** Every https URL string and every host of a hosts list in a JSON value, in order, bounded. */
export function heldOf(v, cap = LIMITS.heldStrings) {
  const urls = [], hosts = [];
  let seen = 0;
  const walk = (o, key) => {
    if (seen >= cap) return;
    if (typeof o === 'string') {
      seen++;
      if (/^https?:\/\//i.test(o) || /^file:/i.test(o)) urls.push(o.slice(0, 2000));
      else if (/hosts$/i.test(String(key || '')) && hostOk(o.toLowerCase())) hosts.push(o.toLowerCase());
      return;
    }
    if (Array.isArray(o)) { for (const x of o) walk(x, key); return; }
    if (isObj(o)) for (const [k, x] of Object.entries(o)) walk(x, k);
  };
  walk(v, '');
  return { urls, hosts };
}

/**
 * THE QUEUE, general: the allowlist's urls (the seeds among them), then the URLs and hosts held in HELD_FILES (each URL
 * as its page, each host as its root page), each kept once and only when it passes checkUrl. What is not kept is counted.
 * @returns {{ urls: string[], refused: { url: number, scheme: number, host: number }, held: number }}
 */
export function queueOf(root, allow) {
  const out = [], seen = new Set(), refused = { url: 0, scheme: 0, host: 0 };
  let held = 0;
  const add = (u) => {
    const c = checkUrl(u, allow);
    if (!c.ok) { refused[c.why]++; return; }
    if (seen.has(c.url) || out.length >= LIMITS.queueMax) return;
    seen.add(c.url);
    out.push(c.url);
  };
  for (const u of allow.urls) add(u);
  for (const f of HELD_FILES) {
    const j = readJson(path.join(root, f));
    if (j === null) continue;
    const h = heldOf(j);
    held += h.urls.length + h.hosts.length;
    for (const u of h.urls) { const p = pageOf(u); if (p === null) refused.url++; else add(p); }
    for (const host of h.hosts) add('https://' + host + '/');
  }
  return { urls: out, refused, held };
}

/** The slice of computer i of n: every n-th URL from i, disjoint across the n and covering the queue, rotated by `rot`. */
export function sliceOf(queue, i, n, rot = 0) {
  const mine = queue.filter((_, p) => p % n === i);
  if (!mine.length) return mine;
  const k = ((Math.floor(rot) % mine.length) + mine.length) % mine.length;
  return [...mine.slice(k), ...mine.slice(0, k)];
}

/** 'i/n' -> { i, n } with 0 <= i < n <= LIMITS.maxShards; null when it is not one. */
export function parseShard(s) {
  const m = /^(\d{1,4})\/(\d{1,4})$/.exec(String(s ?? ''));
  if (!m) return null;
  const i = Number(m[1]), n = Number(m[2]);
  return n >= 1 && n <= LIMITS.maxShards && i < n ? { i, n } : null;
}

// ---- this computer
/** The record of this computer: what it is, hashed where it names a person or a machine. */
export function machineInfo({ env = process.env, at, era = null, shard = null }) {
  const cpus = os.cpus() || [];
  const run = env.GITHUB_RUN_ID ? { id: str(env.GITHUB_RUN_ID, 40), attempt: Number(env.GITHUB_RUN_ATTEMPT) || 1 } : null;
  const runner = env.RUNNER_NAME ? sha12('runner:' + env.RUNNER_NAME) : null;
  const host = sha12('host:' + os.hostname());
  const id = sha12([runner, host, run && run.id, run && run.attempt, shard && shard.i + '/' + shard.n, at, process.pid, randomBytes(6).toString('hex')].join('|'));
  return {
    id, at, era, shard: shard ? shard.i + '/' + shard.n : null, run, runner, host,
    cloud: env.GITHUB_ACTIONS === 'true' ? 'github-actions' : env.CLAUDE_CODE_REMOTE ? 'cloud-session' : env.CI ? 'ci' : null,
    os: { platform: process.platform, type: os.type(), release: str(os.release(), 60) }, arch: process.arch,
    cpus: cpus.length, cpuModel: str(cpus[0] && cpus[0].model, 80).trim(), memoryBytes: os.totalmem(), freeBytes: os.freemem(), node: process.version,
  };
}

// ---- the browser on this computer
/** Where Chrome, Chromium or Edge may be: CHROME_PATH, CHROME_BIN, then the usual paths of the platform. */
export function browserPaths({ env = process.env, platform = process.platform } = {}) {
  const list = [];
  for (const k of ['CHROME_PATH', 'CHROME_BIN']) if (env[k]) list.push(String(env[k]));
  if (platform === 'win32') {
    const bases = [env.PROGRAMFILES, env['PROGRAMFILES(X86)'], env.ProgramFiles, env['ProgramFiles(x86)'], env.LOCALAPPDATA, 'C:\\Program Files', 'C:\\Program Files (x86)'].filter(Boolean);
    for (const b of bases) list.push(path.win32.join(b, 'Google', 'Chrome', 'Application', 'chrome.exe'), path.win32.join(b, 'Chromium', 'Application', 'chrome.exe'), path.win32.join(b, 'Microsoft', 'Edge', 'Application', 'msedge.exe'));
  } else if (platform === 'darwin') {
    for (const b of ['/Applications', env.HOME ? path.posix.join(env.HOME, 'Applications') : null].filter(Boolean)) {
      list.push(b + '/Google Chrome.app/Contents/MacOS/Google Chrome', b + '/Chromium.app/Contents/MacOS/Chromium', b + '/Microsoft Edge.app/Contents/MacOS/Microsoft Edge');
    }
  } else {
    list.push('/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/opt/google/chrome/chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/snap/bin/chromium', '/usr/bin/microsoft-edge', '/usr/bin/microsoft-edge-stable', '/opt/microsoft/msedge/msedge');
  }
  return [...new Set(list)];
}

/** The first browser on disk: { path, pre: [] }, or null. */
export function findBrowser({ env = process.env, platform = process.platform, exists = isFile } = {}) {
  for (const p of browserPaths({ env, platform })) if (exists(p)) return { path: p, pre: [] };
  return null;
}

/** The flags a browser starts with: headless, a port it picks, the fresh profile, nothing it would do by itself. */
export function browserArgs(profile, { noSandbox = false } = {}) {
  return [
    '--headless=new', '--remote-debugging-port=0', '--user-data-dir=' + profile, '--no-first-run', '--no-default-browser-check',
    '--disable-extensions', '--disable-component-extensions-with-background-pages', '--disable-background-networking', '--disable-sync',
    '--disable-default-apps', '--mute-audio', '--hide-scrollbars', '--deny-permission-prompts', '--password-store=basic', '--use-mock-keychain',
    '--disable-features=Translate,MediaRouter,OptimizationHints,AutofillServerCommunication', '--window-size=' + VIEWPORT.width + ',' + VIEWPORT.height,
    ...(noSandbox ? ['--no-sandbox'] : []), 'about:blank',
  ];
}

/** The pids under `pid` (POSIX, through ps): children first found, then theirs. */
function descendantsOf(pid) {
  const r = spawnSync('ps', ['-A', '-o', 'pid=', '-o', 'ppid='], { encoding: 'utf8', timeout: 5000 });
  const kids = new Map();
  for (const l of String(r.stdout || '').split('\n')) {
    const m = /^\s*(\d+)\s+(\d+)/.exec(l);
    if (m) { const a = kids.get(Number(m[2])) || []; a.push(Number(m[1])); kids.set(Number(m[2]), a); }
  }
  const out = [], todo = [pid];
  while (todo.length && out.length < 4096) { for (const k of kids.get(todo.shift()) || []) { out.push(k); todo.push(k); } }
  return out;
}

/** Kills a process and every process under it, synchronously (taskkill /T on Windows; the group and each descendant elsewhere). */
export function killTree(pid, { platform = process.platform } = {}) {
  if (!Number.isInteger(pid) || pid <= 0) return;
  if (platform === 'win32') { spawnSync('taskkill', ['/pid', String(pid), '/T', '/F'], { windowsHide: true, timeout: 15000, stdio: 'ignore' }); return; }
  const kids = descendantsOf(pid);
  try { process.kill(-pid, 'SIGKILL'); } catch { /* not a group leader, or gone */ }
  for (const k of [pid, ...kids]) { try { process.kill(k, 'SIGKILL'); } catch { /* gone */ } }
}

/** Removes a profile directory, retrying while the dead browser's files are released. */
export function removeProfile(dir) {
  if (!dir) return true;
  try { fs.rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 150 }); } catch { /* reported below */ }
  return !fs.existsSync(dir);
}

// every browser alive in this process: killed and its profile removed on any exit, a signal included
const LIVE = new Set();
let hooked = false;
function hookExit() {
  if (hooked) return;
  hooked = true;
  const all = () => { for (const b of LIVE) { killTree(b.pid); removeProfile(b.profile); } LIVE.clear(); };
  process.once('exit', all);
  for (const s of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    try { process.once(s, () => { all(); process.exit(s === 'SIGINT' ? 130 : 143); }); } catch { /* a signal this platform lacks */ }
  }
}

/**
 * Starts the browser and waits for its DevTools endpoint (the stderr line, or DevToolsActivePort in the profile).
 * @returns {Promise<{ ok: boolean, ws?: string, why?: string, proc?: object, kill: () => Promise<void> }>}
 */
export async function launch(b, { profile, ms, env = process.env, platform = process.platform, noSandbox = false }) {
  const args = [...(b.pre || []), ...browserArgs(profile, { noSandbox })];
  let proc;
  try { proc = spawn(b.path, args, { stdio: ['ignore', 'ignore', 'pipe'], detached: platform !== 'win32', windowsHide: true, env }); } catch (e) { return { ok: false, why: 'the browser did not start: ' + str(e && e.message, 160), kill: async () => {} }; }
  const live = { pid: proc.pid, profile };
  LIVE.add(live);
  hookExit();
  let exited = false;
  const gone = new Promise((r) => proc.once('exit', () => { exited = true; r(); }));
  proc.once('error', () => { exited = true; });
  const kill = async () => {
    if (!exited) {
      killTree(proc.pid, { platform });
      let t = null;
      await Promise.race([gone, new Promise((r) => { t = setTimeout(r, 5000); })]);
      clearTimeout(t);
    }
    LIVE.delete(live);
  };
  let err = '';
  const ws = await new Promise((resolve) => {
    let done = false;
    const finish = (v) => { if (!done) { done = true; clearTimeout(t); clearInterval(poll); resolve(v); } };
    const t = setTimeout(() => finish(null), Math.max(1, ms));
    proc.stderr.on('data', (d) => {
      if (err.length < 65536) err += d.toString();
      const m = /DevTools listening on (ws:\/\/\S+)/.exec(err);
      if (m) finish(m[1]);
    });
    const poll = setInterval(() => {
      try {
        const [port, p] = fs.readFileSync(path.join(profile, 'DevToolsActivePort'), 'utf8').split(/\r?\n/);
        if (/^\d+$/.test(port) && p) finish('ws://127.0.0.1:' + port + p);
      } catch { /* not yet */ }
    }, 100);
    proc.once('exit', () => setTimeout(() => finish(null), 50));
  });
  if (ws) return { ok: true, ws, proc, kill, stderr: () => err };
  const died = exited; // read before the kill below, which ends it either way
  await kill();
  const tail = err.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).slice(-2).join(' | ');
  return { ok: false, why: (died ? 'the browser exited before its DevTools endpoint' : 'no DevTools endpoint in ' + ms + ' ms') + (tail ? ': ' + str(tail, 200) : ''), sandbox: /sandbox/i.test(err), kill: async () => {} };
}

// ---- the DevTools protocol over the global WebSocket
export class Cdp {
  constructor(ws, { cmdMs = LIMITS.cmdMs } = {}) {
    this.ws = ws; this.cmdMs = cmdMs; this.id = 0; this.pending = new Map(); this.listeners = new Set(); this.closed = false;
    ws.binaryType = 'arraybuffer';
    ws.addEventListener('message', (ev) => this.onMessage(ev.data));
    ws.addEventListener('close', () => this.fail('the DevTools socket closed'));
    ws.addEventListener('error', () => this.fail('the DevTools socket failed'));
  }
  /** Opens a socket to `url` within `ms`. */
  static open(url, { ms = LIMITS.cmdMs, cmdMs } = {}) {
    if (typeof globalThis.WebSocket !== 'function') return Promise.reject(new Error('no global WebSocket (Node 22 or later)'));
    return new Promise((resolve, reject) => {
      const ws = new globalThis.WebSocket(url);
      const t = setTimeout(() => { try { ws.close(); } catch { /* closing */ } reject(new Error('the DevTools socket did not open in ' + ms + ' ms')); }, Math.max(1, ms));
      ws.addEventListener('open', () => { clearTimeout(t); resolve(new Cdp(ws, { cmdMs })); }, { once: true });
      ws.addEventListener('error', () => { clearTimeout(t); reject(new Error('the DevTools socket did not open')); }, { once: true });
    });
  }
  onMessage(data) {
    let m;
    try { m = JSON.parse(typeof data === 'string' ? data : Buffer.from(data).toString('utf8')); } catch { return; }
    if (!isObj(m)) return;
    if (Number.isInteger(m.id) && this.pending.has(m.id)) {
      const p = this.pending.get(m.id);
      this.pending.delete(m.id);
      clearTimeout(p.t);
      if (m.error) p.reject(new Error(p.method + ': ' + str(m.error.message || 'error', 160)));
      else p.resolve(isObj(m.result) ? m.result : {});
      return;
    }
    if (typeof m.method === 'string') for (const f of this.listeners) { try { f(m.method, isObj(m.params) ? m.params : {}, m.sessionId); } catch { /* a listener's failure is its own */ } }
  }
  fail(why) {
    this.closed = true;
    for (const [, p] of this.pending) { clearTimeout(p.t); p.reject(new Error(p.method + ': ' + why)); }
    this.pending.clear();
  }
  on(f) { this.listeners.add(f); return () => this.listeners.delete(f); }
  send(method, params = {}, sessionId, ms) {
    if (this.closed) return Promise.reject(new Error(method + ': the DevTools socket is closed'));
    const id = ++this.id;
    const wait = Math.max(1, Math.floor(ms ?? this.cmdMs));
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => { this.pending.delete(id); reject(new Error(method + ': no answer in ' + wait + ' ms')); }, wait);
      this.pending.set(id, { resolve, reject, t, method });
      try { this.ws.send(JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params })); } catch (e) { clearTimeout(t); this.pending.delete(id); reject(new Error(method + ': ' + str(e && e.message, 120))); }
    });
  }
  close() { this.fail('closed'); try { this.ws.close(); } catch { /* closing */ } }
}

/**
 * What a paused request gets (the rules of the screen), pure: a request of a scheme that is not https fails; a top-level
 * Document request fails when its host is off the list (a redirect off the list is named so) or it is not a GET; any request
 * of a page over its byte budget fails.
 * @returns {{ action: 'continue'|'fail', why?: 'scheme'|'host'|'redirect'|'method'|'budget' }}
 */
export function decide(params, { mainFrameIds, allow, over = false }) {
  const req = isObj(params) && isObj(params.request) ? params.request : {};
  let x;
  try { x = new URL(String(req.url)); } catch { return { action: 'fail', why: 'scheme' }; }
  if (x.protocol !== 'https:') return { action: 'fail', why: 'scheme' };
  const top = params.resourceType === 'Document' && mainFrameIds.has(params.frameId);
  if (top) {
    if (!checkUrl(x.href, allow).ok) return { action: 'fail', why: params.redirectedRequestId ? 'redirect' : 'host' };
    if (String(req.method || 'GET').toUpperCase() !== 'GET') return { action: 'fail', why: 'method' };
  }
  if (over) return { action: 'fail', why: 'budget' };
  return { action: 'continue' };
}

/** Is this page a bot check? The reason (a pattern or a header), or null. Never solved, never waited out. */
export function challengeOf({ title = '', text = '', status = null, headers = {} } = {}) {
  const h = isObj(headers) ? headers : {};
  if (String(h['cf-mitigated'] || '').toLowerCase() === 'challenge') return 'cf-mitigated';
  const t = String(title || ''), x = String(text || '');
  for (const re of CHALLENGE) if (re.test(t) || (x.length < 3000 && re.test(x.slice(0, 1500)))) return re.source;
  if (h['x-datadome'] || /captcha|challenge/i.test(String(h['x-amzn-waf-action'] || ''))) return 'bot wall header';
  if ([401, 403, 429, 503].includes(status) && x.length < 3000 && /cloudflare|akamai|perimeterx|datadome|incapsula|sucuri|captcha/i.test(t + ' ' + x + ' ' + String(h.server || ''))) return 'blocked ' + status;
  if ([401, 403, 429].includes(status) && x.length < 400) return 'refused ' + status;
  return null;
}

/** The read string -> { title, text, href }, bounded; anything else is empty. */
export function parseRead(raw) {
  let o = null;
  try { o = JSON.parse(String(raw ?? '').slice(0, 65536)); } catch { o = null; }
  if (!isObj(o)) return { title: '', text: '', href: '' };
  return { title: str(o.title, LIMITS.titleChars), text: str(o.text, LIMITS.textChars), href: str(o.href, 2000) };
}

// ---- the files: screens and machine records, capped
/** screens/INDEX.json entries (an array; anything else is empty). */
export function readIndex(dir) {
  const j = readJson(path.join(dir, INDEX_FILE));
  const a = isObj(j) && Array.isArray(j.screens) ? j.screens : [];
  return a.filter((e) => isObj(e) && ID_RE.test(String(e.id)));
}
const indexText = (entries) => '{"about":"the screens grow/machine.mjs computers captured: one entry per JPEG of this directory, the oldest evicted first","screens":[\n' + entries.map((e) => JSON.stringify(e)).join(',\n') + '\n]}\n';

/** One index entry, every field of its shape and bounded. */
export function entryOf(e) {
  return {
    id: String(e.id), url: str(e.url, 2000), host: str(e.host, 253), title: str(e.title, LIMITS.titleChars), at: str(e.at, 40), machine: str(e.machine, 12),
    bytes: Number.isInteger(e.bytes) ? e.bytes : 0, sha: str(e.sha, 64), textBytes: Number.isInteger(e.textBytes) ? e.textBytes : 0,
    era: Number.isInteger(e.era) ? e.era : null, shard: e.shard == null ? null : str(e.shard, 12),
  };
}

/**
 * The screens directory brought to its caps: entries without a file dropped, files without an entry removed, one entry an
 * id, then the oldest evicted until at most CAPS.screens remain and the JPEGs and the index fit CAPS.screensDirBytes.
 * `add` entries (their files already written) join first. The index always matches the files.
 */
export function capScreens(dir, add = []) {
  fs.mkdirSync(dir, { recursive: true });
  const byId = new Map();
  for (const e of [...readIndex(dir), ...add.filter((x) => isObj(x) && ID_RE.test(String(x.id)))]) {
    const f = path.join(dir, e.id + '.jpg');
    let st = null;
    try { st = fs.lstatSync(f); } catch { st = null; }
    if (!st || !st.isFile()) continue;
    const prev = byId.get(e.id);
    if (!prev || String(e.at) >= String(prev.at)) byId.set(e.id, entryOf({ ...e, bytes: st.size }));
  }
  let removed = 0;
  for (const name of fs.readdirSync(dir)) {
    if (name === INDEX_FILE) continue;
    const m = /^([0-9a-f]{12})\.jpg$/.exec(name);
    if (m && byId.has(m[1])) continue;
    if (name.endsWith('.tmp') || m || /\.jpg$/i.test(name)) { fs.rmSync(path.join(dir, name), { force: true, recursive: true }); removed++; }
  }
  const all = [...byId.values()].sort((a, b) => (String(a.at) < String(b.at) ? -1 : String(a.at) > String(b.at) ? 1 : a.id < b.id ? -1 : 1));
  let bytes = all.reduce((s, e) => s + e.bytes, 0);
  let evicted = 0;
  while (all.length && (all.length > CAPS.screens || bytes + Buffer.byteLength(indexText(all)) > CAPS.screensDirBytes)) {
    const e = all.shift();
    bytes -= e.bytes;
    fs.rmSync(path.join(dir, e.id + '.jpg'), { force: true });
    evicted++;
  }
  writeAtomic(path.join(dir, INDEX_FILE), indexText(all));
  return { screens: all.length, bytes, evicted, removed };
}

/** The machine records directory brought to its cap: unreadable records removed, then the oldest beyond CAPS.machines. */
export function capMachines(dir) {
  fs.mkdirSync(dir, { recursive: true });
  const rows = [];
  let removed = 0;
  for (const name of fs.readdirSync(dir)) {
    const m = /^([0-9a-f]{12})\.json$/.exec(name);
    const f = path.join(dir, name);
    const r = m ? readJson(f) : null;
    if (!m || !isObj(r) || r.id !== m[1]) { fs.rmSync(f, { force: true, recursive: true }); removed++; continue; }
    rows.push({ id: m[1], at: String(r.at || '') });
  }
  rows.sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : a.id < b.id ? -1 : 1));
  let evicted = 0;
  while (rows.length > CAPS.machines) { fs.rmSync(path.join(dir, rows.shift().id + '.json'), { force: true }); evicted++; }
  return { machines: rows.length, evicted, removed };
}

/** Writes one JPEG under screens/ by its content id; the entry for the index. */
export function writeScreen(dir, jpeg, meta) {
  const sha = sha256(jpeg), id = sha.slice(0, 12);
  const f = path.join(dir, id + '.jpg');
  if (!isFile(f)) writeAtomic(f, jpeg);
  return entryOf({ ...meta, id, sha, bytes: jpeg.length });
}

// ---- driving the browser
const lower = (h) => Object.fromEntries(Object.entries(isObj(h) ? h : {}).map(([k, v]) => [String(k).toLowerCase(), String(v).slice(0, 200)]));

/**
 * Drives one launched browser over `urls`: tabs at once, each page under the rules, every screen written under `dir`.
 * Never throws for a page: a page that fails is a row. Returns { version, pages, entries, counts, why }.
 */
async function driveBrowser(cdp, o) {
  const { urls, allow, clock, sleep, deadline, limits, dir, counts } = o;
  const res = { version: null, pages: [], entries: [], why: null };
  const left = () => deadline - clock();
  const cmd = (ms = limits.cmdMs) => Math.max(1, Math.min(ms, left()));
  const v = await cdp.send('Browser.getVersion', {}, undefined, cmd());
  res.version = str(v.product, 60) || 'unknown';
  await cdp.send('Browser.setDownloadBehavior', { behavior: 'deny' }, undefined, cmd());
  for (const name of PERMISSIONS) { try { await cdp.send('Browser.setPermission', { permission: { name }, setting: 'denied' }, undefined, cmd(2000)); } catch { /* a name this browser does not know */ } }
  try { await cdp.send('Target.setDiscoverTargets', { discover: true }, undefined, cmd()); } catch { /* popups are still blocked by the browser */ }
  const tabs = new Map(); // sessionId -> tab
  const ours = new Set();
  let stepOver = false;
  const wake = (tab) => { for (const w of [...tab.waiters]) w(); };
  cdp.on((method, p, sessionId) => {
    if (method === 'Target.targetCreated') {
      const t = isObj(p.targetInfo) ? p.targetInfo : {};
      if (t.type === 'page' && t.openerId && !ours.has(t.targetId)) { counts.refused.popup++; cdp.send('Target.closeTarget', { targetId: t.targetId }).catch(() => {}); }
      return;
    }
    const tab = tabs.get(sessionId);
    if (!tab) return;
    const pg = tab.page;
    if (method === 'Fetch.requestPaused') {
      let d;
      try { d = decide(p, { mainFrameIds: tab.mainFrameIds, allow, over: Boolean(pg && pg.over) || stepOver }); } catch { d = { action: 'fail', why: 'scheme' }; }
      if (d.action === 'continue') { tab.send('Fetch.continueRequest', { requestId: p.requestId }).catch(() => {}); return; }
      counts.refused[d.why] = (counts.refused[d.why] || 0) + 1;
      if (pg && (d.why === 'host' || d.why === 'redirect' || d.why === 'method') && !pg.blocked) pg.blocked = d.why;
      tab.send('Fetch.failRequest', { requestId: p.requestId, errorReason: 'BlockedByClient' }).catch(() => {});
      return;
    }
    if (!pg) return;
    if (method === 'Network.responseReceived' && p.type === 'Document' && tab.mainFrameIds.has(p.frameId) && isObj(p.response)) {
      pg.status = Number.isInteger(p.response.status) ? p.response.status : null;
      pg.headers = lower(p.response.headers);
    } else if (method === 'Network.dataReceived' || method === 'Network.loadingFinished') {
      const r = pg.req.get(p.requestId) || { got: 0 };
      const n = Number(p.encodedDataLength) || 0;
      const delta = method === 'Network.dataReceived' ? n : Math.max(0, n - r.got);
      r.got += delta;
      pg.req.set(p.requestId, r);
      pg.bytes += delta;
      counts.netBytes += delta;
      if (pg.bytes > limits.pageBytes && !pg.over) { pg.over = true; tab.send('Page.stopLoading').catch(() => {}); }
      if (counts.netBytes > limits.stepBytes) stepOver = true;
    } else if (method === 'Page.loadEventFired') { pg.loaded = true; wake(tab); }
    else if (method === 'Page.frameNavigated' && isObj(p.frame) && !p.frame.parentId) tab.mainFrameIds.add(p.frame.id);
    else if (method === 'Page.javascriptDialogOpening') tab.send('Page.handleJavaScriptDialog', { accept: false }).catch(() => {});
  });
  const openTab = async () => {
    const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' }, undefined, cmd());
    ours.add(targetId);
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true }, undefined, cmd());
    const tab = { targetId, sessionId, mainFrameIds: new Set([targetId]), page: null, waiters: new Set() };
    tab.send = (m, prm = {}, ms) => cdp.send(m, prm, sessionId, ms ?? cmd());
    tabs.set(sessionId, tab);
    await tab.send('Page.enable');
    await tab.send('Network.enable', {});
    await tab.send('Fetch.enable', { patterns: [{ urlPattern: '*', requestStage: 'Request' }] });
    try { await tab.send('Network.setBypassServiceWorker', { bypass: true }); } catch { /* older browsers */ }
    // a socket is not a request the Fetch domain pauses: its schemes are blocked by the browser itself
    try { await tab.send('Network.setBlockedURLs', { urls: ['ws://*', 'wss://*'] }); } catch { /* a browser without it */ }
    await tab.send('Emulation.setDeviceMetricsOverride', { width: VIEWPORT.width, height: VIEWPORT.height, deviceScaleFactor: 1, mobile: false });
    try { const ft = await tab.send('Page.getFrameTree'); if (isObj(ft.frameTree) && isObj(ft.frameTree.frame)) tab.mainFrameIds.add(ft.frameTree.frame.id); } catch { /* the target id is the main frame */ }
    return tab;
  };
  const waitFor = (tab, pred, ms) => new Promise((resolve) => {
    if (pred()) { resolve(true); return; }
    let t = null;
    const done = (v) => { clearTimeout(t); tab.waiters.delete(w); resolve(v); };
    const w = () => { if (pred()) done(true); };
    t = setTimeout(() => done(false), Math.max(0, ms));
    tab.waiters.add(w);
  });
  const nextAt = new Map(), challengedHosts = new Set();
  const visit = async (tab, url) => {
    const c = checkUrl(url, allow);
    if (!c.ok) { counts.refused[c.why]++; res.pages.push({ url: str(url, 300), state: 'refused', why: c.why }); return; }
    if (challengedHosts.has(c.host)) { res.pages.push({ url: c.url, host: c.host, state: 'left', why: 'its host showed a bot check in this step' }); return; }
    const now = clock();
    const slot = Math.max(now, nextAt.get(c.host) ?? -Infinity);
    nextAt.set(c.host, slot + limits.hostGapMs);
    if (slot > now) await sleep(slot - now);
    if (left() <= limits.minPageMs) { res.pages.push({ url: c.url, host: c.host, state: 'unread', why: 'the step deadline' }); return; }
    const t0 = clock();
    const pageEnd = Math.min(t0 + limits.pageMs, deadline - limits.reserveMs);
    const pleft = () => Math.max(1, pageEnd - clock());
    const pg = tab.page = { url: c.url, host: c.host, at: t0, bytes: 0, req: new Map(), status: null, headers: {}, loaded: false, over: false, blocked: null };
    const row = { url: c.url, host: c.host, state: 'read', navAt: t0, status: null, title: '', ms: 0, bytes: 0, textBytes: 0, screen: null };
    res.pages.push(row);
    const end = (state, why) => { row.state = state; if (why) row.why = str(why, 160); row.ms = Math.max(0, clock() - t0); row.bytes = pg.bytes; row.status = pg.status; tab.page = null; };
    let nav;
    try { nav = await tab.send('Page.navigate', { url: c.url }, pleft()); } catch (e) {
      tab.send('Page.stopLoading').catch(() => {});
      counts.timeout++;
      return end('timeout', e && e.message);
    }
    if (nav && nav.errorText) {
      if (pg.blocked) return end('blocked', pg.blocked);
      counts.failed++;
      return end('failed', nav.errorText);
    }
    const loaded = await waitFor(tab, () => pg.loaded, pleft());
    if (!loaded) { row.late = true; tab.send('Page.stopLoading').catch(() => {}); }
    if (limits.settleMs > 0) await realSleep(Math.min(limits.settleMs, pleft()));
    let read = { title: '', text: '', href: '' };
    try {
      let contextId = null;
      try { const w = await tab.send('Page.createIsolatedWorld', { frameId: [...tab.mainFrameIds].pop(), worldName: 'machine-read' }, Math.min(3000, pleft())); contextId = Number.isInteger(w.executionContextId) ? w.executionContextId : null; } catch { contextId = null; }
      const r = await tab.send('Runtime.evaluate', { expression: READ_EXPRESSION, returnByValue: true, ...(contextId ? { contextId } : {}) }, Math.min(5000, pleft()));
      read = parseRead(isObj(r.result) && typeof r.result.value === 'string' ? r.result.value : '');
    } catch (e) { row.readWhy = str(e && e.message, 120); }
    row.title = read.title;
    row.textBytes = Buffer.byteLength(read.text);
    row.snippet = str(read.text, LIMITS.snippetChars);
    // the screen shows what the tab holds now: a page off the list (or the browser's error page for a refused navigation) is not read
    if (pg.blocked || (read.href && !checkUrl(read.href, allow).ok)) {
      tab.send('Page.navigate', { url: 'about:blank' }).catch(() => {});
      return end('blocked', pg.blocked || 'the tab left the allowlist');
    }
    const ch = challengeOf({ title: read.title, text: read.text, status: pg.status, headers: pg.headers });
    if (ch) {
      counts.challenged++;
      challengedHosts.add(c.host);
      tab.send('Page.navigate', { url: 'about:blank' }).catch(() => {});
      return end('challenged', ch);
    }
    try { await tab.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: Math.floor(VIEWPORT.width / 2), y: Math.floor(VIEWPORT.height / 2), deltaX: 0, deltaY: Math.floor(VIEWPORT.height * 0.75) }, Math.min(3000, pleft())); } catch { /* the screen is still captured */ }
    if (limits.settleMs > 0) await realSleep(Math.min(Math.floor(limits.settleMs / 2), pleft()));
    let jpeg = null, why = 'oversize';
    try {
      let vv = { pageX: 0, pageY: 0, clientWidth: VIEWPORT.width, clientHeight: VIEWPORT.height };
      try { const m = await tab.send('Page.getLayoutMetrics', {}, Math.min(3000, pleft())); const x = isObj(m.cssVisualViewport) ? m.cssVisualViewport : isObj(m.visualViewport) ? m.visualViewport : null; if (x) vv = x; } catch { /* the top of the page */ }
      const w = Math.max(1, Math.min(VIEWPORT.width * 2, Math.floor(Number(vv.clientWidth) || VIEWPORT.width)));
      const h = Math.max(1, Math.min(VIEWPORT.height * 2, Math.floor(Number(vv.clientHeight) || VIEWPORT.height)));
      for (const [quality, scale] of JPEG_LADDER) {
        const r = await tab.send('Page.captureScreenshot', { format: 'jpeg', quality, clip: { x: Math.max(0, Number(vv.pageX) || 0), y: Math.max(0, Number(vv.pageY) || 0), width: w, height: h, scale }, captureBeyondViewport: false }, Math.min(10000, Math.max(1, deadline - clock())));
        const b = Buffer.from(String(r.data || ''), 'base64');
        if (!isJpeg(b)) { why = 'not a jpeg'; break; }
        if (b.length <= CAPS.screenBytes) { jpeg = b; row.quality = quality; row.scale = scale; break; }
      }
    } catch (e) { why = e && e.message; }
    if (!jpeg) { counts.failed++; return end('failed', 'no screen: ' + why); }
    const e = writeScreen(dir, jpeg, { url: c.url, host: c.host, title: read.title, at: new Date(t0).toISOString(), machine: o.machine, textBytes: row.textBytes, era: o.era, shard: o.shardText });
    res.entries.push(e);
    row.screen = e.id;
    row.jpegBytes = e.bytes;
    if (pg.over) row.over = true;
    if (pg.blocked) row.blockedAfter = pg.blocked;
    return end('read');
  };
  const k = Math.max(1, Math.min(limits.tabs, urls.length || 1));
  const list = [];
  for (let n = 0; n < k; n++) list.push(await openTab());
  let next = 0;
  const work = async (tab) => {
    while (next < urls.length) {
      if (stepOver) { res.why = 'the step byte budget is spent'; return; }
      if (left() <= limits.reserveMs + limits.minPageMs) { res.why = 'the step deadline'; return; }
      await visit(tab, urls[next++]);
    }
  };
  await Promise.all(list.map(work));
  return res;
}

/**
 * ONE STEP of this computer (contract of grow/era.mjs: one JSON line last, exit 0): its record, its browser driven over its
 * slice of the queue, its screens written, everything under `out` (else <root>/neo) and capped; the browser killed whole and
 * its profile removed whatever happens.
 * @param {object} o { root, out, maxMs, era, shard: {i,n}, env, browser: {path, pre}|'none'|null, tabs, clock, sleep, limits }
 */
export async function step(o = {}) {
  const clock = o.clock || Date.now, sleep = o.sleep || realSleep;
  const t0 = clock();
  const maxMs = Number.isInteger(o.maxMs) ? o.maxMs : DEFAULT_MAX_MS;
  const deadline = t0 + maxMs;
  const env = o.env || process.env;
  const platform = o.platform || process.platform;
  const root = path.resolve(o.root || DEFAULT_ROOT);
  const outDir = o.out ? path.resolve(o.out) : path.join(root, 'neo');
  const limits = { ...LIMITS, reserveMs: Math.min(5000, Math.floor(maxMs * 0.1)), minPageMs: 1500, ...(o.limits || {}) };
  if (Number.isInteger(o.tabs)) limits.tabs = Math.max(1, Math.min(LIMITS.maxTabs, o.tabs));
  const shard = o.shard || parseShard(env.SHARD != null && env.SHARDS != null ? env.SHARD + '/' + env.SHARDS : '') || { i: 0, n: 1 };
  const era = Number.isInteger(o.era) ? o.era : null;
  const allow = allowOf(root, { write: !o.out });
  const q = queueOf(root, allow);
  const urls = sliceOf(q.urls, shard.i, shard.n, era ?? Math.floor(t0 / (3 * 3600000)));
  const at = new Date(t0).toISOString();
  const rec = machineInfo({ env, at, era, shard });
  const counts = { refused: { url: q.refused.url, scheme: q.refused.scheme, host: q.refused.host, redirect: 0, method: 0, budget: 0, popup: 0 }, challenged: 0, failed: 0, timeout: 0, netBytes: 0 };
  const screensDir = path.join(outDir, SCREENS_DIR), machinesDir = path.join(outDir, MACHINES_DIR);
  let state = 'drove', why = null, version = null, browserName = null, sandbox = null, driven = { pages: [], entries: [] };
  const b = o.browser === 'none' ? null : (o.browser || findBrowser({ env, platform }));
  if (!b) {
    state = 'skipped';
    why = o.browser === 'none' ? '--browser none: this computer records itself only' : 'no Chrome, Chromium or Edge on this computer (CHROME_PATH, CHROME_BIN and the usual paths)';
  } else {
    browserName = str(path.basename(b.path).replace(/\.exe$/i, ''), 40);
    const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'machine-profile-'));
    let br = null, cdp = null;
    try {
      br = await launch(b, { profile, ms: Math.max(1, Math.min(limits.launchMs, deadline - clock())), env, platform });
      sandbox = true;
      if (!br.ok && br.sandbox && platform === 'linux' && (env.CI || env.GITHUB_ACTIONS)) {
        // a disposable CI computer whose kernel refuses the browser's sandbox: once more without it
        br = await launch(b, { profile, ms: Math.max(1, Math.min(limits.launchMs, deadline - clock())), env, platform, noSandbox: true });
        sandbox = false;
      }
      if (!br.ok) { state = 'skipped'; why = br.why; }
      else {
        fs.mkdirSync(screensDir, { recursive: true });
        cdp = await Cdp.open(br.ws, { ms: Math.max(1, Math.min(limits.cmdMs, deadline - clock())), cmdMs: limits.cmdMs });
        try {
          driven = await driveBrowser(cdp, { urls, allow, clock, sleep, deadline, limits, dir: screensDir, counts, machine: rec.id, era, shardText: shard.i + '/' + shard.n });
          version = driven.version;
          if (driven.why) why = driven.why;
        } catch (e) {
          if (!driven.version) { state = 'skipped'; why = 'the browser did not answer the protocol: ' + str(e && e.message, 160); } else why = str(e && e.message, 160);
        }
      }
    } catch (e) {
      state = 'skipped';
      why = 'the browser could not be driven: ' + str(e && e.message, 160);
    } finally {
      try { if (cdp) cdp.close(); } catch { /* closed */ }
      if (br && br.kill) await br.kill();
      if (!removeProfile(profile)) why = (why ? why + '; ' : '') + 'the profile could not be removed';
    }
  }
  const capS = fs.existsSync(screensDir) || driven.entries.length ? capScreens(screensDir, driven.entries) : { screens: 0, bytes: 0, evicted: 0 };
  const pages = driven.pages.map((p) => { const { navAt, ...r } = p; return r; });
  const byState = {};
  for (const p of pages) byState[p.state] = (byState[p.state] || 0) + 1;
  const record = {
    ...rec, state, why, browser: version ? { product: version, name: browserName, sandbox } : null,
    queue: q.urls.length, slice: urls.length, pages: pages.slice(0, 200), byState, refused: counts.refused, challenged: counts.challenged,
    screens: driven.entries.map((e) => e.id), screenBytes: driven.entries.reduce((s, e) => s + e.bytes, 0), netBytes: counts.netBytes, ms: Math.max(0, clock() - t0),
  };
  let text = JSON.stringify(record);
  if (Buffer.byteLength(text) > CAPS.machineBytes) { record.pages = record.pages.map(({ snippet, ...r }) => r).slice(0, 60); text = JSON.stringify(record); }
  writeAtomic(path.join(machinesDir, rec.id + '.json'), text + '\n');
  const capM = capMachines(machinesDir);
  const refusedTotal = Object.values(counts.refused).reduce((s, n) => s + n, 0);
  return {
    step: 'machine', state, why, machine: rec.id, era, shard: shard.i + '/' + shard.n, queue: q.urls.length, slice: urls.length,
    visited: pages.filter((p) => p.state !== 'refused' && p.state !== 'left' && p.state !== 'unread').length, screens: driven.entries.length,
    bytes: record.screenBytes, challenged: counts.challenged, refused: refusedTotal, refusedBy: counts.refused, byState,
    netBytes: counts.netBytes, ms: record.ms, browser: version, cpus: rec.cpus, memoryBytes: rec.memoryBytes, os: rec.os.platform,
    out: o.out ? outDir : path.relative(root, outDir).split(path.sep).join('/'), kept: { screens: capS.screens, machines: capM.machines }, evicted: { screens: capS.evicted, machines: capM.evicted },
  };
}

// ---- landing what other computers staged
/**
 * LAND: the machines/ and screens/ of another computer's stage (`from`, or each directory directly under it, one artifact
 * each), verified, written under <root>/neo, capped. A machine record must be a regular file named by its 12 hex id, JSON,
 * under CAPS.machineBytes, its id its name. A screen must have an index entry whose id is 12 hex (never a path), a regular
 * file (never a link) under CAPS.screenBytes that starts with the JPEG magic bytes, whose sha256 is the entry's sha and
 * starts with its id, and whose url is on the allowlist.
 */
export function land({ from, root = DEFAULT_ROOT } = {}) {
  const src = path.resolve(String(from || ''));
  let st = null;
  try { st = fs.lstatSync(src); } catch { st = null; }
  if (!st || !st.isDirectory()) throw new Fail('land: no directory at ' + src);
  const dest = path.join(path.resolve(root), 'neo');
  const allow = allowOf(path.resolve(root), { write: true });
  const refused = { json: 0, size: 0, magic: 0, sha: 0, path: 0, host: 0, missing: 0, orphan: 0 };
  const dirs = [src];
  for (const n of fs.readdirSync(src)) { const p = path.join(src, n); try { if (fs.lstatSync(p).isDirectory() && n !== MACHINES_DIR && n !== SCREENS_DIR) dirs.push(p); } catch { /* gone */ } }
  const regular = (f) => { try { const s = fs.lstatSync(f); return s.isFile() && !s.isSymbolicLink() ? s : null; } catch { return null; } };
  let machines = 0, screens = 0, stages = 0;
  const entries = [];
  const sDest = path.join(dest, SCREENS_DIR), mDest = path.join(dest, MACHINES_DIR);
  for (const d of dirs) {
    const md = path.join(d, MACHINES_DIR), sd = path.join(d, SCREENS_DIR);
    const mdOk = regularDir(md), sdOk = regularDir(sd);
    if (!mdOk && !sdOk) continue;
    stages++;
    if (mdOk) for (const name of fs.readdirSync(md)) {
      const m = /^([0-9a-f]{12})\.json$/.exec(name);
      const f = path.join(md, name);
      const s = regular(f);
      if (!m || !s) { refused.path++; continue; }
      if (s.size > CAPS.machineBytes) { refused.size++; continue; }
      const r = readJson(f);
      if (!isObj(r)) { refused.json++; continue; }
      if (r.id !== m[1]) { refused.sha++; continue; }
      writeAtomic(path.join(mDest, name), JSON.stringify(r) + '\n');
      machines++;
    }
    if (!sdOk) continue;
    const idx = readJson(path.join(sd, INDEX_FILE));
    const list = isObj(idx) && Array.isArray(idx.screens) ? idx.screens : [];
    const named = new Set();
    for (const e of list) {
      if (!isObj(e)) { refused.json++; continue; }
      const id = String(e.id);
      if (!ID_RE.test(id)) { refused.path++; continue; }
      named.add(id);
      const f = path.join(sd, id + '.jpg');
      let ls = null;
      try { ls = fs.lstatSync(f); } catch { ls = null; }
      if (!ls) { refused.missing++; continue; }
      if (!ls.isFile() || ls.isSymbolicLink()) { refused.path++; continue; }
      if (ls.size > CAPS.screenBytes) { refused.size++; continue; }
      const b = fs.readFileSync(f);
      if (!isJpeg(b)) { refused.magic++; continue; }
      const sha = sha256(b);
      if (!SHA_RE.test(String(e.sha)) || e.sha !== sha || sha.slice(0, 12) !== id) { refused.sha++; continue; }
      if (!checkUrl(e.url, allow).ok) { refused.host++; continue; }
      writeAtomic(path.join(sDest, id + '.jpg'), b);
      entries.push(entryOf({ ...e, id, sha, bytes: b.length, host: new URL(e.url).hostname }));
      screens++;
    }
    for (const name of fs.readdirSync(sd)) if (name !== INDEX_FILE && !named.has(name.replace(/\.jpg$/, ''))) refused.orphan++;
  }
  const capS = capScreens(sDest, entries);
  const capM = capMachines(mDest);
  return { land: 'machine', from: src, stages, machines, screens, refused: Object.values(refused).reduce((s, n) => s + n, 0), refusedBy: refused, kept: { screens: capS.screens, machines: capM.machines, bytes: capS.bytes }, evicted: { screens: capS.evicted, machines: capM.evicted } };
}
function regularDir(p) { try { const s = fs.lstatSync(p); return s.isDirectory() && !s.isSymbolicLink(); } catch { return false; } }

/** What <root>/neo holds: { machines, screens, bytes, hosts, newest }. Reads only. */
export function status(root = DEFAULT_ROOT) {
  const dir = path.join(path.resolve(root), 'neo');
  const entries = readIndex(path.join(dir, SCREENS_DIR)).filter((e) => isFile(path.join(dir, SCREENS_DIR, e.id + '.jpg')));
  let machines = 0, newest = null;
  try {
    for (const n of fs.readdirSync(path.join(dir, MACHINES_DIR))) {
      if (!/^[0-9a-f]{12}\.json$/.test(n)) continue;
      machines++;
      const r = readJson(path.join(dir, MACHINES_DIR, n));
      if (isObj(r) && typeof r.at === 'string' && (!newest || r.at > newest)) newest = r.at;
    }
  } catch { /* none yet */ }
  for (const e of entries) if (!newest || e.at > newest) newest = e.at;
  return { machines, screens: entries.length, bytes: entries.reduce((s, e) => s + (Number(e.bytes) || 0), 0), hosts: new Set(entries.map((e) => e.host)).size, newest };
}

// ---- the CLI
const VALUE = new Set(['root', 'max-ms', 'era', 'shard', 'out', 'from', 'tabs', 'browser']);
export function parseArgs(argv) {
  const flags = {}, pos = [];
  for (let k = 0; k < argv.length; k++) {
    const a = argv[k];
    if (a === '-h' || a === '--help') { flags.help = true; continue; }
    if (!a.startsWith('--')) { pos.push(a); continue; }
    const eq = a.indexOf('=');
    const name = a.slice(2, eq < 0 ? undefined : eq);
    if (!VALUE.has(name)) throw new Fail('unknown flag --' + name + ' (see --help)', 2);
    const v = eq < 0 ? argv[++k] : a.slice(eq + 1);
    if (v === undefined) throw new Fail('--' + name + ' needs a value', 2);
    flags[name] = v;
  }
  return { verb: pos[0], pos: pos.slice(1), flags };
}
const intOf = (v) => (/^\d+$/.test(String(v)) ? Number(v) : null);

/** Runs one verb; returns { lines, code } or { usage: true }. */
export async function main(argv, opts = {}) {
  const { verb, pos, flags } = parseArgs(argv);
  if (flags.help || !verb || verb === 'help') return { usage: true };
  if (pos.length) throw new Fail('unexpected argument ' + pos[0] + ' (see --help)', 2);
  const root = path.resolve(flags.root || DEFAULT_ROOT);
  const only = (allowed) => { for (const k of Object.keys(flags)) if (!allowed.includes(k)) throw new Fail(verb + ' takes no --' + k, 2); };
  if (verb === 'step') {
    only(['root', 'max-ms', 'era', 'shard', 'out', 'tabs', 'browser']);
    const maxMs = flags['max-ms'] === undefined ? DEFAULT_MAX_MS : intOf(flags['max-ms']);
    if (maxMs === null || maxMs < 1000) throw new Fail('--max-ms is an integer from 1000, not ' + flags['max-ms'], 2);
    const era = flags.era === undefined ? null : intOf(flags.era);
    if (flags.era !== undefined && era === null) throw new Fail('--era is an integer from 0, not ' + flags.era, 2);
    const shard = flags.shard === undefined ? null : parseShard(flags.shard);
    if (flags.shard !== undefined && !shard) throw new Fail('--shard is i/n with 0 <= i < n <= ' + LIMITS.maxShards + ', not ' + flags.shard, 2);
    const tabs = flags.tabs === undefined ? null : intOf(flags.tabs);
    if (flags.tabs !== undefined && (tabs === null || tabs < 1 || tabs > LIMITS.maxTabs)) throw new Fail('--tabs is an integer from 1 to ' + LIMITS.maxTabs + ', not ' + flags.tabs, 2);
    if (flags.out !== undefined && !flags.out) throw new Fail('--out needs a directory', 2);
    let browser = null;
    if (flags.browser === 'none') browser = 'none';
    else if (flags.browser !== undefined) { if (!isFile(flags.browser)) throw new Fail('--browser: no file at ' + flags.browser, 2); browser = { path: path.resolve(flags.browser), pre: [] }; }
    const line = await step({ root, out: flags.out || null, maxMs, era, shard, tabs: tabs ?? undefined, browser, env: opts.env, clock: opts.clock, sleep: opts.sleep });
    return { lines: [JSON.stringify(line)] };
  }
  if (verb === 'land') {
    only(['root', 'from']);
    if (!flags.from) throw new Fail('land needs --from <dir>', 2);
    return { lines: [JSON.stringify(land({ from: flags.from, root }))] };
  }
  if (verb === 'status') {
    only(['root']);
    return { lines: [JSON.stringify(status(root))] };
  }
  throw new Fail('unknown verb ' + verb + ': step, land or status (--help)', 2);
}

const isMain = (() => { try { return fileURLToPath(import.meta.url) === path.resolve(process.argv[1] || ''); } catch { return false; } })();
if (isMain) {
  main(process.argv.slice(2)).then((r) => {
    if (r.usage) { process.stdout.write(USAGE + '\n'); process.exit(0); }
    process.stdout.write(r.lines.join('\n') + '\n');
    process.exitCode = r.code || 0;
  }, (e) => {
    const code = e instanceof Fail ? e.code : 1;
    process.stderr.write('machine: ' + str((e && e.message) || e, 300) + '\n');
    if (code === 2) process.stderr.write(USAGE + '\n');
    process.exit(code);
  });
}
