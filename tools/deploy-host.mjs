#!/usr/bin/env node
// tools/deploy-host.mjs: ONE COMMAND HE RUNS FROM HIS PC to put the organism on a host he owns
// (his P13: "It should live 24/7 on the cloud"). The host is his account: I cannot create
// accounts or pay, so this tool assumes a Linux box he can already `ssh user@host` into, with
// docker and the compose plugin installed.
//
//   node tools/deploy-host.mjs <user@host> [--dir brain] [--port 8080] [--timeout-s 600] [--dry]
//
// What it does, in order:
//   1. lists the build context the way docker would (.dockerignore applied), and scans every
//      text file in it for secret patterns; ANY hit stops the deploy (exit 2), no override
//   2. packs that list with tar and streams it over ssh into ~/<dir>.new on the host, swaps it
//      into ~/<dir> (the previous tree is kept once as ~/<dir>.old), and runs
//      `docker compose up -d --build` there; the state volume survives a redeploy
//   3. polls http://127.0.0.1:<port>/health ON THE HOST (the port is bound to its loopback)
//      until it answers ok, and prints the health JSON
// No key handling of ours: ssh authenticates with his agent or his keys, exactly as his own
// `ssh user@host` would. --dry prints the plan and the scan and runs nothing remote.
import { spawn, spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, existsSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');

// ---------------------------------------------------------------- .dockerignore
export function readIgnore(root = ROOT, file = path.join(root, '.dockerignore')) {
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
}

function globToRegex(glob) {
  let g = glob.replace(/^\/+/, '').replace(/\/+$/, '');
  let re = '';
  for (let i = 0; i < g.length; i++) {
    const c = g[i];
    if (c === '*' && g[i + 1] === '*') {
      if (g[i + 2] === '/') { re += '(?:.*/)?'; i += 2; } else { re += '.*'; i += 1; }
    } else if (c === '*') re += '[^/]*';
    else if (c === '?') re += '[^/]';
    else re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp('^' + re + '$');
}

/**
 * A matcher with docker's reading of .dockerignore: patterns are relative to the context root,
 * `*` stays inside one path segment, `**` crosses segments, a pattern that matches a directory
 * excludes everything under it, and a later `!pattern` re-includes (the last match wins).
 */
export function compileIgnore(patterns) {
  const rules = patterns.map((p) => { const neg = p.startsWith('!'); return { neg, re: globToRegex(neg ? p.slice(1) : p) }; });
  return (rel) => {
    const parts = rel.split('/');
    let out = false;
    for (const r of rules) {
      for (let k = 1; k <= parts.length; k++) { if (r.re.test(parts.slice(0, k).join('/'))) { out = !r.neg; break; } }
    }
    return out;
  };
}

/** The build context: every file docker would send, with its bytes. Excluded dirs are never walked. */
export function contextFiles(root = ROOT, { patterns = readIgnore(root) } = {}) {
  const ignored = compileIgnore(patterns);
  const files = [], skipped = [];
  let bytes = 0;
  const walk = (dir, rel) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const r = rel ? rel + '/' + e.name : e.name;
      if (ignored(r)) { skipped.push(r + (e.isDirectory() ? '/' : '')); continue; }
      const f = path.join(dir, e.name);
      if (e.isDirectory()) walk(f, r);
      else if (e.isFile()) { const n = statSync(f).size; files.push({ rel: r, bytes: n }); bytes += n; }
    }
  };
  walk(root, '');
  return { files, bytes, skipped };
}

// ---------------------------------------------------------------- the secret scan
// The patterns are assembled from parts so this file never matches itself.
const P = (...xs) => xs.join('');
export const SECRET_PATTERNS = Object.freeze([
  { kind: 'openai-or-anthropic key', re: new RegExp(P('s', 'k-', '[A-Za-z0-9_-]{20,}'), 'g') },
  { kind: 'stripe key', re: new RegExp(P('(?:s|r)', 'k_', '(?:live|test)_[A-Za-z0-9]{10,}'), 'g') },
  { kind: 'aws access key', re: new RegExp(P('AK', 'IA', '[0-9A-Z]{16}'), 'g') },
  { kind: 'github token', re: new RegExp(P('gh', '[pousr]_', '[A-Za-z0-9]{36}'), 'g') },
  { kind: 'github fine-grained token', re: new RegExp(P('github', '_pat_', '[A-Za-z0-9_]{22,}'), 'g') },
  { kind: 'slack token', re: new RegExp(P('xo', 'x[baprs]-', '[A-Za-z0-9-]{10,}'), 'g') },
  { kind: 'google api key', re: new RegExp(P('AI', 'za', '[0-9A-Za-z_-]{35}'), 'g') },
  { kind: 'private key block', re: new RegExp(P('-----BEGIN ', '[A-Z ]*', 'PRIVATE', ' KEY-----'), 'g') },
  { kind: 'jwt', re: new RegExp(P('ey', 'J[A-Za-z0-9_-]{10,}', '\\.', 'ey', 'J[A-Za-z0-9_-]{10,}', '\\.[A-Za-z0-9_-]{10,}'), 'g') },
  { kind: 'env secret assignment', re: new RegExp(P('(?:^|\\n)[ \\t]*(?:export[ \\t]+)?[A-Z0-9_]*(?:TO', 'KEN|SEC', 'RET|API_', 'KEY|PASS', 'WORD)[ \\t]*=[ \\t]*["\']?[^\\s"\']{16,}'), 'g') },
]);
// Values the repo's own tests plant on purpose to prove a secret never leaves (bench/act.mjs,
// test/act-*.test.mjs). Allowed by EXACT value only, and counted.
export const PLANTED = Object.freeze([
  P('s', 'k-live-', 'A'.repeat(16)),
  P('s', 'k_live_', 'ABCDEF1234567890'), // test/handoff.test.mjs: the redaction fixture (Board 15 handoff)
  P('s', 'k-fixture-', '0123456789-never-leaves'),
  P('s', 'k-test-', 'value-that-must-never-be-logged'),
]);
export const BINARY_EXT = new Set(['.bin', '.bz2', '.gz', '.zip', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.wav', '.mp3', '.mp4', '.wasm', '.woff', '.woff2', '.pdf', '.ttf', '.otf']);
export const SCAN_MAX_BYTES = 64 * 1048576;

/** Scan text files for secret patterns. Reports kind, file and line, never the value. */
export function scanSecrets(files, root = ROOT) {
  const hits = [], planted = [], binary = [];
  let scanned = 0, bytesScanned = 0;
  for (const f of files) {
    const ext = path.extname(f.rel).toLowerCase();
    if (BINARY_EXT.has(ext) || f.bytes > SCAN_MAX_BYTES) { binary.push(f.rel); continue; }
    const text = readFileSync(path.join(root, f.rel), 'latin1');
    scanned++; bytesScanned += text.length;
    for (const p of SECRET_PATTERNS) {
      p.re.lastIndex = 0;
      let m;
      while ((m = p.re.exec(text))) {
        const value = m[0].trim();
        const line = text.slice(0, m.index).split('\n').length + (m[0].startsWith('\n') ? 1 : 0);
        if (PLANTED.some((x) => value.includes(x))) planted.push({ rel: f.rel, kind: p.kind, line });
        else hits.push({ rel: f.rel, kind: p.kind, line, length: value.length });
        if (m[0].length === 0) p.re.lastIndex++;
      }
    }
  }
  return { scanned, bytesScanned, binarySkipped: binary.length, hits, planted };
}

// ---------------------------------------------------------------- the deploy
export const TARGET_RE = /^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+$|^[A-Za-z0-9][A-Za-z0-9.-]*$/;
export const DIR_RE = /^[A-Za-z0-9._-]{1,64}$/;
/** One argument for a remote POSIX sh, whatever his login shell is. */
export const shq = (x) => "'" + String(x).replace(/'/g, "'\\''") + "'";

export function remoteScript(dir) {
  if (!DIR_RE.test(dir)) throw new Error('--dir must match ' + DIR_RE.source);
  return [
    'set -e',
    'D="$HOME/' + dir + '"',
    'rm -rf "$D.new" && mkdir -p "$D.new"',
    'tar -xf - -C "$D.new"',
    'if [ -d "$D" ]; then rm -rf "$D.old"; mv "$D" "$D.old"; fi',
    'mv "$D.new" "$D"',
    'cd "$D"',
    'docker compose up -d --build',
  ].join(' && ').replace(/set -e && /, 'set -e; ');
}

export function healthScript(dir, port) {
  const url = 'http://127.0.0.1:' + Number(port) + '/health';
  const viaNode = 'cd "$HOME/' + dir + '" && docker compose exec -T brain node -e "fetch(\'' + url + '\').then(r=>r.text()).then(t=>console.log(t))"';
  return 'curl -fsS --max-time 5 ' + url + ' 2>/dev/null || wget -qO- -T 5 ' + url + ' 2>/dev/null || (' + viaNode + ')';
}

function args(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { out._.push(a); continue; }
    const k = a.slice(2), v = argv[i + 1];
    if (v === undefined || v.startsWith('--')) out[k] = true; else { out[k] = v; i++; }
  }
  return out;
}

async function main(argv) {
  const a = args(argv);
  const target = a._[0];
  const dir = a.dir && a.dir !== true ? String(a.dir) : 'brain';
  const port = a.port && a.port !== true ? Number(a.port) : 8080;
  const timeoutS = a['timeout-s'] && a['timeout-s'] !== true ? Number(a['timeout-s']) : 600;
  if (!target || !TARGET_RE.test(target)) {
    console.error('usage: node tools/deploy-host.mjs <user@host> [--dir brain] [--port 8080] [--timeout-s 600] [--dry]');
    console.error(target ? 'refused target ' + JSON.stringify(target) + ': it must match ' + TARGET_RE.source : 'no target given');
    return 2;
  }
  const t0 = Date.now();
  const ctx = contextFiles(ROOT);
  console.log('[deploy] context: ' + ctx.files.length + ' files, ' + ctx.bytes + ' bytes (.dockerignore applied; skipped ' + ctx.skipped.length + ' paths: ' + ctx.skipped.slice(0, 8).join(', ') + (ctx.skipped.length > 8 ? ', ...' : '') + ')');
  const scan = scanSecrets(ctx.files, ROOT);
  console.log('[deploy] secret scan: ' + scan.scanned + ' text files, ' + scan.bytesScanned + ' bytes, ' + scan.hits.length + ' hits, ' + scan.planted.length + ' planted test fixtures allowed by exact value, ' + scan.binarySkipped + ' binary files not scanned');
  if (scan.hits.length) {
    for (const h of scan.hits) console.error('[deploy] SECRET ' + h.kind + ' at ' + h.rel + ':' + h.line + ' (' + h.length + ' chars): add it to .dockerignore or remove it');
    return 2;
  }
  const script = remoteScript(dir);
  console.log('[deploy] ssh ' + target + ' \'' + script + '\'');
  if (a.dry) { console.log('[deploy] --dry: nothing sent (' + (Date.now() - t0) + ' ms)'); return 0; }

  const tmp = mkdtempSync(path.join(os.tmpdir(), 'brain-deploy-'));
  const list = path.join(tmp, 'files.txt');
  writeFileSync(list, ctx.files.map((f) => f.rel).join('\n') + '\n');
  try {
    const code = await new Promise((resolve) => {
      const tar = spawn('tar', ['-cf', '-', '-C', ROOT, '-T', list], { stdio: ['ignore', 'pipe', 'inherit'] });
      const ssh = spawn('ssh', [target, 'sh -c ' + shq(script)], { stdio: ['pipe', 'inherit', 'inherit'] });
      tar.stdout.pipe(ssh.stdin);
      let tarCode = null;
      tar.on('exit', (c) => { tarCode = c; });
      tar.on('error', (e) => { console.error('[deploy] tar: ' + e.message); resolve(3); });
      ssh.on('error', (e) => { console.error('[deploy] ssh: ' + e.message); resolve(3); });
      ssh.on('exit', (c) => resolve(tarCode ? 3 : c));
    });
    if (code !== 0) { console.error('[deploy] upload or compose failed with code ' + code); return code || 1; }
  } finally { rmSync(tmp, { recursive: true, force: true }); }
  console.log('[deploy] uploaded and started in ' + Math.round((Date.now() - t0) / 1000) + ' s; waiting for /health');

  const deadline = Date.now() + timeoutS * 1000;
  let last = '';
  while (Date.now() < deadline) {
    const r = spawnSync('ssh', [target, 'sh -c ' + shq(healthScript(dir, port))], { encoding: 'utf8', timeout: 30_000 });
    last = (r.stdout || '').trim();
    try {
      const j = JSON.parse(last);
      if (j.ok) { console.log(JSON.stringify(j, null, 2)); console.log('[deploy] healthy after ' + Math.round((Date.now() - t0) / 1000) + ' s'); return 0; }
    } catch { /* not up yet */ }
    await new Promise((res) => setTimeout(res, 5000));
  }
  console.error('[deploy] /health did not answer ok within ' + timeoutS + ' s; last answer: ' + (last.slice(0, 400) || 'none'));
  return 4;
}

const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) process.exitCode = await main(process.argv.slice(2));
