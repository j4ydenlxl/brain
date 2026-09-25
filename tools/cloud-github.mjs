#!/usr/bin/env node
// tools/cloud-github.mjs: THE ONE DEPLOY COMMAND for P13 on GitHub Actions (his 2026-09-23 17:30
// "It should live 24/7 on the cloud remember Its literally a sandboxed ARTIFICIAL SUPERINTELLIGENCE";
// his 2026-09-25 about 17:05 "set up the p13 idk how idk"). Run from brain/:
//
//   node tools/cloud-github.mjs --dry                       the whole plan and the secret scan; writes nothing
//   node tools/cloud-github.mjs                             push (a PRIVATE repository named brain if there is
//                                                           no origin yet), enable and dispatch cloud.yml
//   node tools/cloud-github.mjs --public --yes              a public repository instead (his 09-17 line is printed)
//   node tools/cloud-github.mjs --relay [--yes]             24/7 as a relay of jobs; also sets the repository
//                                                           variables BRAIN_RELAY and BRAIN_WALL_MINUTES
//   options: --name brain  --wall-minutes 55  --ladder  --root <dir>
//
// THE HOST IS AN ASSUMPTION, the orchestrator's (2026-09-25; test: his confirmation): GitHub Actions
// on his account, private by default. His steps are two: `gh auth login`, and private or public.
// This file never reads, stores or asks for a credential: gh holds his login, and every write here
// is a gh or git command he could type himself. Not logged in: it prints "run: gh auth login" and
// exits 2 before any other probe (with --dry it still prints the whole plan, then exits 2).
//
// Refusals, each exit 2, all printed together so one --dry shows every one of them: gh missing or
// not logged in; the root is not the top of its own git repository; no commit; the workflow is not
// committed at HEAD (GitHub reads it from the pushed branch); a tracked file under state/ or
// state-cloud/; a secret pattern in a tracked file (tools/deploy-host.mjs scanSecrets, imported);
// a secret-looking file name anywhere in the history; a blob over GitHub's 100 MB limit; --public
// or a relay on a private repository without --yes; the checkout trial at this HEAD read built
// false; a file the checkout trial (at any HEAD) saw the daemon open and the commit lack is still
// not committed (the refusal names `git add -f <file>`, which works whatever .gitignore says).
//
// The helpers below (resolveGh, runCmd, parseYaml, checkWorkflow, namedFiles, barOf) are shared
// with bench/cloud-host.mjs, the ruler, and test/cloud-host.test.mjs.
import { spawnSync } from 'node:child_process';
import { existsSync, statSync, readFileSync, accessSync, constants as FS } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSecrets } from './deploy-host.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');
export const WORKFLOW_REL = '.github/workflows/cloud.yml';
export const ARTIFACT = 'brain-cloud';
export const HIS_0917 = 'Make sure nobody can copy our ideas';
export const PRIVATE_MINUTES = 2000; // GitHub Free, private repositories, per month
export const DAY_MINUTES = 1440;
export const WEEK_MINUTES = 10080;
export const MAX_BLOB = 100 * 1048576; // GitHub refuses a push holding a larger file
export const NAME_RE = /^[A-Za-z0-9._-]{1,100}$/;
const SECRET_NAME_RE = /(^|\/)(\.env(\..*)?|[^/]*\.(pem|key|p12|pfx)|id_(rsa|ed25519|ecdsa)[^/]*|\.npmrc|\.netrc)$/i;

// ---------------------------------------------------------------- processes
/** gh as the PATH resolves it (PATHEXT on Windows), or null. A planted gh first on PATH wins, which is how the test mocks it. */
export function resolveGh(env = process.env) {
  const dirs = String(env.PATH ?? env.Path ?? '').split(path.delimiter).filter(Boolean);
  const exts = process.platform === 'win32' ? String(env.PATHEXT || '.COM;.EXE;.BAT;.CMD').split(';').filter(Boolean) : [''];
  for (const d of dirs) {
    for (const x of exts) {
      const f = path.join(d, 'gh' + x);
      try {
        if (!statSync(f).isFile()) continue;
        if (process.platform !== 'win32') accessSync(f, FS.X_OK);
        return f;
      } catch { /* not here */ }
    }
  }
  return null;
}

const CMD_SAFE = /^[A-Za-z0-9._=:/\\@,+-]+$/;
function cmdArg(a) {
  const s = String(a);
  if (CMD_SAFE.test(s)) return s;
  if (/^[^"%^&|<>!\r\n]*$/.test(s)) return '"' + s + '"';
  throw new Error('refused an argument cmd.exe cannot carry safely: ' + JSON.stringify(s));
}

/** Run a command and return {code, stdout, stderr, error}. A .cmd or .bat goes through cmd.exe with checked arguments. */
export function runCmd(file, args, { cwd, env = process.env, timeoutMs = 120_000, input } = {}) {
  const ext = path.extname(file).toLowerCase();
  let r;
  if (process.platform === 'win32' && (ext === '.cmd' || ext === '.bat')) {
    const line = ['"' + file + '"', ...args.map(cmdArg)].join(' ');
    r = spawnSync(env.ComSpec || process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', '"' + line + '"'], { cwd, env, encoding: 'utf8', timeout: timeoutMs, windowsVerbatimArguments: true, input, maxBuffer: 256 * 1048576 });
  } else {
    r = spawnSync(file, args, { cwd, env, encoding: 'utf8', timeout: timeoutMs, input, maxBuffer: 256 * 1048576 });
  }
  return { code: r.status, stdout: r.stdout || '', stderr: r.stderr || '', error: r.error ? r.error.message : null };
}

export const git = (root, args, opts = {}) => runCmd('git', ['-C', root, ...args], opts);
const firstLine = (s) => String(s || '').trim().split(/\r?\n/)[0] || '';

/** gh auth status, read only. Never prints its output: only whether he is logged in. */
export function ghStatus(env = process.env) {
  const gh = resolveGh(env);
  if (!gh) return { gh: null, loggedIn: false, cause: 'gh is not on PATH' };
  const v = runCmd(gh, ['--version'], { env, timeoutMs: 30_000 });
  const a = runCmd(gh, ['auth', 'status'], { env, timeoutMs: 30_000 });
  const text = a.stdout + '\n' + a.stderr;
  const loggedIn = a.code === 0 && !/not logged in/i.test(text);
  return { gh, version: firstLine(v.stdout) || null, loggedIn, cause: loggedIn ? null : 'gh not logged in' };
}

// ---------------------------------------------------------------- a YAML subset (no dependency)
// Enough YAML for a workflow and for compose.yaml: block mappings and sequences, inline mappings
// in sequence items, literal and folded block scalars with chomping, quoted and plain scalars,
// simple flow sequences and mappings, comments, anchors, aliases and the << merge key. Tags and
// multi-document files are not read. A tab in indentation, a duplicate key, a bad indent, an
// unknown alias or an unterminated quote throws with its line number.
export function parseYaml(text) {
  const lines = String(text).replace(/^﻿/, '').split(/\r?\n/).map((s, k) => ({ n: k + 1, s }));
  let i = 0;
  const anchors = Object.create(null);
  const fail = (n, msg) => { const e = new Error('yaml line ' + n + ': ' + msg); e.line = n; throw e; };
  const indentOf = (s) => s.length - s.replace(/^ +/, '').length;
  const strip = (s) => {
    let q = null;
    for (let k = 0; k < s.length; k++) {
      const c = s[k];
      if (q) {
        if (q === '"' && c === '\\') { k++; continue; }
        if (c === q) { if (q === "'" && s[k + 1] === "'") { k++; continue; } q = null; }
        continue;
      }
      if ((c === '"' || c === "'") && (k === 0 || /[\s:[{,-]/.test(s[k - 1]))) { q = c; continue; }
      if (c === '#' && (k === 0 || /\s/.test(s[k - 1]))) return s.slice(0, k).trimEnd();
    }
    return s.trimEnd();
  };
  const blank = (k) => strip(lines[k].s).trim() === '' || (k === 0 && lines[k].s.trim() === '---');
  const skip = () => { while (i < lines.length && blank(i)) i++; };
  const isItem = (t) => t === '-' || t.startsWith('- ');
  const checkTabs = (L) => { if (/^ *\t/.test(L.s)) fail(L.n, 'a tab in indentation'); };

  function splitKey(t) {
    let q = null;
    for (let k = 0; k < t.length; k++) {
      const c = t[k];
      if (q) { if (c === q) q = null; continue; }
      if (k === 0 && (c === '"' || c === "'")) { q = c; continue; }
      if (k === 0 && (c === '[' || c === '{')) return null;
      if (c === ':' && (k + 1 === t.length || t[k + 1] === ' ')) {
        let key = t.slice(0, k).trim();
        if (!key) return null;
        if (/^"[^"]*"$|^'[^']*'$/.test(key)) key = key.slice(1, -1);
        return [key, t.slice(k + 1).trim()];
      }
    }
    return null;
  }
  function splitFlow(inner) {
    const out = []; let q = null, depth = 0, cur = '';
    for (const c of inner) {
      if (q) { cur += c; if (c === q) q = null; continue; }
      if (c === '"' || c === "'") { q = c; cur += c; continue; }
      if (c === '[' || c === '{') depth++;
      if (c === ']' || c === '}') depth--;
      if (c === ',' && depth === 0) { out.push(cur.trim()); cur = ''; continue; }
      cur += c;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  }
  function scalar(v, n) {
    if (v.startsWith('"')) {
      if (v.length < 2 || !v.endsWith('"')) fail(n, 'unterminated double quote');
      try { return JSON.parse(v); } catch { return v.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\'); }
    }
    if (v.startsWith("'")) {
      if (v.length < 2 || !v.endsWith("'")) fail(n, 'unterminated single quote');
      return v.slice(1, -1).replace(/''/g, "'");
    }
    if (v.startsWith('[')) {
      if (!v.endsWith(']')) fail(n, 'unterminated flow sequence');
      return splitFlow(v.slice(1, -1)).map((x) => scalar(x, n));
    }
    if (v.startsWith('{')) {
      if (!v.endsWith('}')) fail(n, 'unterminated flow mapping');
      const o = {};
      for (const part of splitFlow(v.slice(1, -1))) {
        const kv = splitKey(part);
        if (!kv) fail(n, 'bad flow mapping entry ' + JSON.stringify(part));
        o[kv[0]] = scalar(kv[1], n);
      }
      return o;
    }
    if (v === 'true') return true;
    if (v === 'false') return false;
    if (v === 'null' || v === '~') return null;
    if (/^-?\d+$/.test(v)) return Number(v);
    return v;
  }
  function blockScalar(head, ind) {
    const style = head[0], chomp = head[1] || '';
    const buf = []; let ci = null;
    while (i < lines.length) {
      const s = lines[i].s;
      if (s.trim() === '') { buf.push(''); i++; continue; }
      const li = indentOf(s);
      if (li <= ind) break;
      if (ci === null) ci = li;
      if (li < ci) fail(lines[i].n, 'a block scalar line less indented than its first line');
      buf.push(s.slice(ci)); i++;
    }
    let end = buf.length;
    while (end > 0 && buf[end - 1] === '') end--;
    const body = buf.slice(0, end);
    const text = style === '|' ? body.join('\n') : body.reduce((acc, l) => (acc === '' ? l : l === '' ? acc + '\n' : acc.endsWith('\n') ? acc + l : acc + ' ' + l), '');
    if (chomp === '-') return text;
    if (chomp === '+') return text + '\n'.repeat(buf.length - end + 1);
    return body.length ? text + '\n' : '';
  }
  function value(rest, ind, n) {
    const anchor = /^&([A-Za-z0-9_-]+)(?:\s+(.*))?$/.exec(rest);
    if (anchor) { const v = value(anchor[2] || '', ind, n); anchors[anchor[1]] = v; return v; }
    const alias = /^\*([A-Za-z0-9_-]+)$/.exec(rest);
    if (alias) { if (!(alias[1] in anchors)) fail(n, 'unknown alias *' + alias[1]); return anchors[alias[1]]; }
    if (rest === '') {
      skip();
      if (i < lines.length) {
        const li = indentOf(lines[i].s), t = strip(lines[i].s).trim();
        if (li > ind) return node();
        if (li === ind && isItem(t)) return seq(li);
      }
      return null;
    }
    if (/^[|>][+-]?$/.test(rest)) return blockScalar(rest, ind);
    return scalar(rest, n);
  }
  function map(ind) {
    const out = {}, explicit = new Set();
    for (;;) {
      skip();
      if (i >= lines.length) break;
      const L = lines[i]; checkTabs(L);
      const li = indentOf(L.s);
      if (li < ind) break;
      if (li > ind) fail(L.n, 'unexpected indent');
      const t = strip(L.s).trim();
      if (isItem(t)) break;
      const kv = splitKey(t);
      if (!kv) fail(L.n, 'expected "key: value", got ' + JSON.stringify(t));
      if (explicit.has(kv[0])) fail(L.n, 'duplicate key ' + kv[0]);
      i++;
      const v = value(kv[1], ind, L.n);
      if (kv[0] === '<<' && v && typeof v === 'object' && !Array.isArray(v)) {
        // a merge key: explicit keys win over merged ones, whatever their order
        for (const [k, x] of Object.entries(v)) if (!explicit.has(k)) out[k] = x;
        continue;
      }
      explicit.add(kv[0]);
      out[kv[0]] = v;
    }
    return out;
  }
  function seq(ind) {
    const out = [];
    for (;;) {
      skip();
      if (i >= lines.length) break;
      const L = lines[i]; checkTabs(L);
      const li = indentOf(L.s);
      if (li < ind) break;
      if (li > ind) fail(L.n, 'unexpected indent in a sequence');
      const t = strip(L.s).trim();
      if (!isItem(t)) break;
      const after = L.s.slice(li + 1);
      const col = li + 1 + (after.length - after.replace(/^ +/, '').length);
      const body = strip(L.s.slice(col)).trim();
      if (body === '') { i++; out.push(value('', ind, L.n)); continue; }
      if (splitKey(body) && !/^["']/.test(body)) {
        lines[i] = { n: L.n, s: ' '.repeat(col) + L.s.slice(col) };
        out.push(map(col));
      } else { i++; out.push(scalar(body, L.n)); }
    }
    return out;
  }
  function node() {
    skip();
    if (i >= lines.length) return null;
    const L = lines[i]; checkTabs(L);
    const li = indentOf(L.s), t = strip(L.s).trim();
    return isItem(t) ? seq(li) : map(li);
  }
  const doc = node();
  skip();
  if (i < lines.length) fail(lines[i].n, 'content after the document ended (a bad indent?)');
  return doc;
}

// ---------------------------------------------------------------- the workflow's own checks
const stepIndex = (steps, re) => steps.findIndex((s) => s && re.test(String(s.name || '') + ' ' + String(s.uses || '') + ' ' + String(s.run || '')));

/** Every structural claim docs/CLOUD.md makes about cloud.yml, as rows {check, ok, detail}. */
export function checkWorkflow(doc, text) {
  const rows = [];
  const add = (check, ok, detail = '') => rows.push({ check, ok: Boolean(ok), detail });
  const on = (doc && doc.on) || {};
  const inputs = (on.workflow_dispatch && on.workflow_dispatch.inputs) || {};
  const job = doc && doc.jobs && doc.jobs.organism;
  const steps = (job && Array.isArray(job.steps)) ? job.steps : [];
  add('name is "brain cloud"', doc && doc.name === 'brain cloud', doc && doc.name);
  const cron = Array.isArray(on.schedule) && on.schedule[0] ? on.schedule[0].cron : null;
  add('schedule cron 0 8 * * * (04:00 America/New_York in EDT)', cron === '0 8 * * *', cron);
  add('the cron comment names the DST drift', /drifts one hour/.test(text));
  add('workflow_dispatch input wallMinutes defaults to "55"', inputs.wallMinutes && inputs.wallMinutes.default === '55', inputs.wallMinutes && inputs.wallMinutes.default);
  add('workflow_dispatch input relay defaults to "false"', inputs.relay && inputs.relay.default === 'false', inputs.relay && inputs.relay.default);
  add('permissions contents read, actions write', doc && doc.permissions && doc.permissions.contents === 'read' && doc.permissions.actions === 'write', JSON.stringify(doc && doc.permissions));
  add('concurrency group brain-cloud, cancel-in-progress false', doc && doc.concurrency && doc.concurrency.group === 'brain-cloud' && doc.concurrency['cancel-in-progress'] === false, JSON.stringify(doc && doc.concurrency));
  add('job timeout-minutes 350', job && job['timeout-minutes'] === 350, job && job['timeout-minutes']);
  const iCheckout = stepIndex(steps, /actions\/checkout@/);
  const iStop = stepIndex(steps, /state-cloud\/STOP/);
  const iBuild = stepIndex(steps, /docker build/);
  const iRestore = stepIndex(steps, /actions\/cache\/restore@/);
  add('checkout is the first step', iCheckout === 0, 'index ' + iCheckout);
  add('the STOP check comes right after checkout, before the restore and the build', iStop === 1 && iStop < iRestore && iStop < iBuild, 'stop ' + iStop + ', restore ' + iRestore + ', build ' + iBuild);
  const stop = steps[iStop] || {};
  add('the STOP check prints "stopped by state-cloud/STOP" and exits 0', /stopped by state-cloud\/STOP/.test(stop.run || '') && /exit 0/.test(stop.run || ''));
  const gated = steps.slice(iStop + 1).filter((s) => !/BRAIN_STOP != '1'/.test(String(s.if || '')));
  add('every step after the STOP check is gated on BRAIN_STOP', iStop >= 0 && gated.length === 0, gated.map((s) => s.name).join(', '));
  const restore = steps[iRestore] || {};
  const w = restore.with || {};
  add('cache restore: path state-cloud/, key brain-state-${{ github.run_number }}, restore-keys brain-state-', w.path === 'state-cloud/' && w.key === 'brain-state-${{ github.run_number }}' && w['restore-keys'] === 'brain-state-', JSON.stringify(w));
  const iSave = stepIndex(steps, /actions\/cache\/save@/);
  add('cache save uses the same key and waits for a checkpoint', iSave > iBuild && steps[iSave].with && steps[iSave].with.key === w.key && /steps\.ck\.outputs\.has == 'true'/.test(String(steps[iSave].if || '')), 'save ' + iSave);
  const run = steps.find((s) => /docker run -d --name brain /.test(String(s.run || ''))) || {};
  const capsText = text;
  add('docker run with compose.yaml caps', /--memory 512m --memory-swap 512m/.test(capsText) && /--cpus 1/.test(capsText) && /--read-only/.test(capsText) && /--tmpfs \/tmp/.test(capsText) && /-p 127\.0\.0\.1:8080:8080/.test(run.run || '') && /state-cloud:\/state/.test(capsText));
  add('BRAIN_EPISODES_MAX read from the Dockerfile', /grep -oE 'BRAIN_EPISODES_MAX[^\n]*Dockerfile/.test(text));
  const iPoll = stepIndex(steps, /\/health/);
  add('a poll loop GETs /health every 60 s into health.log', iPoll > iBuild && /sleep/.test(steps[iPoll].run || '') && /health\.log/.test(steps[iPoll].run || '') && /60/.test(steps[iPoll].run || ''));
  const iFail = stepIndex(steps, /CRASH_LOOP/);
  const failStep = steps.find((s) => /CRASH_LOOP == '1'/.test(String(s.if || ''))) || {};
  add('a crash loop ends the poll early and fails the run, and is never relayed', iPoll >= 0 && /CRASH_LOOP=1/.test(steps[iPoll].run || '') && /restarts/.test(steps[iPoll].run || '') && /exit 1/.test(failStep.run || '') && /CRASH_LOOP != '1'/.test(String((steps[steps.length - 1] || {}).if || '')), 'first CRASH_LOOP step ' + iFail);
  const iLad = stepIndex(steps, /--name brain-ladder/);
  add('the ladder step probes the model endpoint on the runner and prints what it found', iLad > 0 && /11434\/api\/tags/.test(steps[iLad].run || '') && /MODEL_ENDPOINT=/.test(steps[iLad].run || ''));
  const iStopC = stepIndex(steps, /docker stop --time 60 brain/);
  add('stopped with SIGINT (docker stop --time 60, --stop-signal SIGINT)', iStopC > iPoll && /--stop-signal SIGINT/.test(text), 'stop step ' + iStopC);
  const iLadder = stepIndex(steps, /--name brain-ladder/);
  add('the ladder runs through tools/budget.mjs on a scheduled run, into ladder.log', iLadder > 0 && /tools\/budget\.mjs/.test(steps[iLadder].run || '') && /ladder\.log/.test(steps[iLadder].run || '') && /GITHUB_EVENT_NAME" = "schedule"/.test(text));
  add('the job summary carries the table', /GITHUB_STEP_SUMMARY/.test(text) && /uptime s \| restarts \| tick \| checkpoint age s \| checkpoint bytes \| ticks per hour/.test(text));
  const up = steps.find((s) => /actions\/upload-artifact@/.test(String(s.uses || ''))) || {};
  add('artifacts uploaded with retention 90 days', up.with && up.with['retention-days'] === 90 && up.with.name === ARTIFACT, JSON.stringify(up.with || null));
  const store = steps.find((s) => /no store configured/.test(String(s.run || ''))) || {};
  add('the store upload is optional and never fails the job', store['continue-on-error'] === true && /x-upsert: true/.test(store.run || '') && /brain-cloud\/health\/latest\.json/.test(store.run || ''));
  const last = steps[steps.length - 1] || {};
  add('the relay is the last step and runs only with relay true', /gh workflow run cloud\.yml/.test(last.run || '') && /RELAY == 'true'/.test(String(last.if || '')) && last.env && last.env.GH_TOKEN === '${{ github.token }}');
  // prose in a comment may name a secret; the YAML itself must hold nothing but references
  const code = text.split(/\r?\n/).filter((l) => !/^\s*#/.test(l)).join('\n');
  const secretRefs = code.match(/secrets\.[A-Z_]+/g) || [];
  const outside = (code.match(/[^{ ]\s*secrets\.[A-Z_]+/g) || []).filter((m) => !/\$\{\{\s*secrets\./.test(m));
  add('secrets appear only as ${{ secrets.NAME }} references', outside.length === 0 && secretRefs.every((r) => code.includes('${{ ' + r + ' }}')), secretRefs.join(', '));
  add('no em-dash', !text.includes(String.fromCharCode(0x2014)));
  return rows;
}

/** Tree paths the workflow names (scripts, the Dockerfile, compose.yaml, the manual). */
export function namedFiles(text) {
  const out = new Set();
  const re = /(?:^|[\s"'=(])((?:bin|bench|tools|daemon|docs|notes|test|seeds|memory|core)\/[A-Za-z0-9_./-]+\.(?:mjs|md|json|yaml))\b/g;
  let m;
  while ((m = re.exec(text))) out.add(m[1]);
  for (const f of ['Dockerfile', 'compose.yaml', '.dockerignore']) if (new RegExp('(^|[^A-Za-z0-9_./-])' + f.replace('.', '\\.') + '([^A-Za-z0-9_]|$)', 'm').test(text)) out.add(f);
  // bench/verdicts/... are written at run time on the host, not files the tree must hold
  return [...out].filter((f) => !f.startsWith('bench/verdicts/')).sort();
}

/** The workflow on disk: parsed, checked, and every named file looked up. */
export function workflowReport(root = ROOT) {
  const file = path.join(root, WORKFLOW_REL);
  if (!existsSync(file)) return { exists: false, parses: false, error: WORKFLOW_REL + ' is absent', checks: [], named: [], missing: [] };
  const text = readFileSync(file, 'utf8');
  let doc = null, error = null;
  try { doc = parseYaml(text); } catch (e) { error = e.message; }
  const checks = doc ? checkWorkflow(doc, text) : [];
  const named = namedFiles(text);
  const missing = named.filter((f) => !existsSync(path.join(root, f)));
  return { exists: true, parses: Boolean(doc), error, bytes: Buffer.byteLength(text), checks, named, missing };
}

// ---------------------------------------------------------------- the bar, one function for the ruler and its control
export const BAR = 'a scheduled or dispatched run concluded success with health ok true, restarts 0 inside the job (serve restarts plus container restarts), checkpoint age under 120 s at the end, and the LADDER line present in a ladder.log from the host';
/**
 * readings: [{ run: {conclusion, event}, health, container, ladderLine }]. The bar: one run meets
 * the four health conditions, and a LADDER line came off the host in the window.
 */
export function barOf(readings) {
  const good = readings.filter((r) => r && r.run && r.run.conclusion === 'success' && ['schedule', 'workflow_dispatch'].includes(r.run.event)
    && r.health && r.health.ok === true
    && Number(r.health.restarts) === 0 && (r.container == null || r.container.restartCount == null || Number(r.container.restartCount) === 0)
    && r.health.checkpoint && Number.isFinite(r.health.checkpoint.ageS) && r.health.checkpoint.ageS < 120);
  const ladder = readings.find((r) => r && typeof r.ladderLine === 'string' && /^LADDER \d{4}-\d{2}-\d{2}:/.test(r.ladderLine));
  const why = [];
  if (!readings.length) why.push('no run read from the host');
  else if (!good.length) why.push('no run met success, health ok, restarts 0 and checkpoint age under 120 s');
  if (!ladder) why.push('no LADDER line from the host');
  return { met: good.length > 0 && Boolean(ladder), goodRuns: good.map((r) => r.run.databaseId ?? null), ladderFrom: ladder ? ladder.run.databaseId ?? null : null, why: why.join('; ') || 'met' };
}

// ---------------------------------------------------------------- the plan
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

/** Read-only probes of the tree and of gh. Returns {lines, refusals, writes, facts}; runs nothing that writes. */
export function plan(opts = {}, env = process.env) {
  const root = path.resolve(opts.root || ROOT);
  const name = opts.name || 'brain';
  const lines = [], refusals = [], writes = [];
  const say = (l) => lines.push(l);
  const refuse = (l) => { refusals.push(l); say('REFUSED: ' + l); };
  const facts = { root, name };
  if (!NAME_RE.test(name)) refuse('--name must match ' + NAME_RE.source + ', got ' + JSON.stringify(name));
  const wall = opts.wallMinutes;
  if (!(Number.isInteger(wall) && wall >= 2 && wall <= 330)) refuse('--wall-minutes must be a whole number from 2 to 330, got ' + JSON.stringify(opts.wallMinutesRaw ?? wall));

  // 0. gh
  const st = ghStatus(env);
  facts.gh = st;
  say('0. gh: ' + (st.gh ? st.gh + (st.version ? ' (' + st.version + ')' : '') : 'not found on PATH'));
  if (!st.gh) refuse('gh is not installed: install GitHub CLI, then run: gh auth login');
  else if (!st.loggedIn) { say('   gh auth status: NOT LOGGED IN'); refuse('run: gh auth login'); }
  if (opts.stopAtLogin && !st.loggedIn) return { lines, refusals, writes, facts };
  if (st.loggedIn) say('   gh auth status: logged in');

  // 1. the tree
  const top = git(root, ['rev-parse', '--show-toplevel']);
  const topDir = top.code === 0 ? path.resolve(top.stdout.trim()) : null;
  facts.gitTop = topDir;
  if (!topDir) { refuse('not a git repository: ' + root); return { lines, refusals, writes, facts }; }
  if (path.relative(topDir, root) !== '') refuse('the root ' + root + ' is inside the repository ' + topDir + ', not its top: pushing would send the outer repository');
  const head = git(root, ['rev-parse', '--short', 'HEAD']);
  const branch = firstLine(git(root, ['branch', '--show-current']).stdout) || '(detached)';
  facts.head = head.code === 0 ? head.stdout.trim() : null; facts.branch = branch;
  if (!facts.head) refuse('no commit yet: nothing to push');
  const tracked = git(root, ['ls-files', '-z']).stdout.split('\0').filter(Boolean);
  let trackedBytes = 0; const onDisk = [];
  for (const rel of tracked) { try { const n = statSync(path.join(root, rel)).size; trackedBytes += n; onDisk.push({ rel, bytes: n }); } catch { /* deleted in the working tree */ } }
  const inState = tracked.filter((f) => /^state(-cloud)?\//.test(f) && f !== 'state-cloud/STOP');
  const ignoredTracked = git(root, ['ls-files', '-ci', '--exclude-standard', '-z']).stdout.split('\0').filter(Boolean);
  const porcelain = git(root, ['status', '--porcelain', '-z']).stdout.split('\0').filter(Boolean);
  facts.tracked = tracked.length; facts.trackedBytes = trackedBytes; facts.trackedInState = inState.length; facts.trackedIgnored = ignoredTracked.length; facts.uncommitted = porcelain.length;
  say('1. tree ' + root + ': branch ' + branch + ' at ' + (facts.head || 'no commit') + ', ' + tracked.length + ' tracked files (' + trackedBytes + ' bytes in the working tree)');
  say('   tracked under state/ or state-cloud/: ' + inState.length + '; tracked although ignored: ' + ignoredTracked.length + '; uncommitted or untracked paths that stay on this PC (a push sends commits only): ' + porcelain.length);
  if (inState.length) refuse(inState.length + ' tracked files under state/ or state-cloud/ would leave this PC, first ' + inState[0]);
  const wf = git(root, ['cat-file', '-e', 'HEAD:' + WORKFLOW_REL]);
  facts.workflowCommitted = wf.code === 0;
  say('   ' + WORKFLOW_REL + ' committed at HEAD: ' + facts.workflowCommitted);
  if (!facts.workflowCommitted) refuse('commit ' + WORKFLOW_REL + ' first: GitHub reads the workflow from the pushed branch');
  // the checkout trial (bench/cloud-host.mjs --checkout-trial S) boots exactly what a push sends
  let hv = null;
  try { hv = JSON.parse(readFileSync(path.join(root, 'bench', 'verdicts', 'cloud-host.json'), 'utf8')); } catch { /* none yet */ }
  const trial = hv && hv.pc && hv.pc.checkoutTrial;
  const ownTrial = Boolean(trial && !/ plus /.test(String(trial.source || '')));
  if (ownTrial && facts.head && trial.head === facts.head) {
    const miss = Array.isArray(trial.missingFiles) ? trial.missingFiles : [];
    facts.checkoutTrial = { head: trial.head, built: trial.built, restarts: trial.restarts, missing: miss, at: hv.at };
    say('   checkout trial at HEAD ' + trial.head + ' (bench/verdicts/cloud-host.json, ' + hv.at + '): built ' + trial.built + ', restarts ' + trial.restarts + ', first checkpoint at ' + trial.firstCheckpointS + ' s');
    if (!trial.built) refuse('the committed tree did not boot in the checkout trial at HEAD ' + trial.head + (miss.length ? ': the daemon opened ' + miss.join(', ') + ', which the commit lacks' : '') + '; on the runner the daemon would restart until the wall ends');
  } else {
    say('   checkout trial at HEAD ' + (facts.head || '?') + ': not run (node bench/cloud-host.mjs --checkout-trial 90 boots what a push sends, about 2 minutes)');
  }
  // a file a checkout trial at ANY commit saw the daemon open and the commit lack must be in this
  // one: git add -f commits it whatever .gitignore says (bench/fixtures/ is ignored as a whole there)
  const bootFiles = ownTrial && Array.isArray(trial.missingFiles) ? trial.missingFiles : [];
  facts.bootFiles = [];
  for (const rel of bootFiles) {
    const inHead = facts.head ? git(root, ['cat-file', '-e', 'HEAD:' + rel]).code === 0 : false;
    facts.bootFiles.push({ rel, committed: inHead });
    say('   boot file ' + rel + ' (the checkout trial at HEAD ' + trial.head + ' saw the daemon open it and the commit lack it): committed at HEAD ' + inHead);
    if (!inHead) refuse('commit ' + rel + ' first (git add -f ' + rel + ', then git commit): the daemon opens it at boot and a clean checkout lacks it');
  }
  const scan = scanSecrets(onDisk, root);
  facts.scan = { scanned: scan.scanned, bytes: scan.bytesScanned, hits: scan.hits.length, planted: scan.planted.length, binary: scan.binarySkipped };
  say('   secret scan (tools/deploy-host.mjs scanSecrets, imported): ' + scan.scanned + ' tracked text files, ' + scan.bytesScanned + ' bytes, ' + scan.hits.length + ' hits, ' + scan.planted.length + ' planted test fixtures allowed by exact value, ' + scan.binarySkipped + ' binary files not scanned');
  for (const h of scan.hits) refuse('secret ' + h.kind + ' at ' + h.rel + ':' + h.line + ' (' + h.length + ' chars)');
  const names = git(root, ['log', '--all', '--name-only', '--format=']).stdout.split(/\r?\n/).filter(Boolean);
  const secretNames = [...new Set(names.filter((f) => SECRET_NAME_RE.test(f)))];
  facts.historySecretNames = secretNames.length;
  say('   secret-looking file names anywhere in the history: ' + secretNames.length);
  for (const f of secretNames) refuse('the history holds ' + f + ': a push sends every commit');
  const objs = git(root, ['rev-list', '--objects', '--all']);
  const sizes = objs.code === 0 ? git(root, ['cat-file', '--batch-check=%(objecttype) %(objectsize) %(rest)'], { input: objs.stdout }) : { stdout: '' };
  let maxBlob = { bytes: 0, path: null }, blobs = 0;
  for (const l of sizes.stdout.split(/\r?\n/)) {
    const m = /^blob (\d+) ?(.*)$/.exec(l);
    if (!m) continue;
    blobs++;
    if (Number(m[1]) > maxBlob.bytes) maxBlob = { bytes: Number(m[1]), path: m[2] || null };
  }
  facts.blobs = blobs; facts.maxBlob = maxBlob;
  say('   history: ' + blobs + ' blobs, the largest ' + maxBlob.bytes + ' bytes (' + (maxBlob.path || 'unnamed') + '), GitHub limit ' + MAX_BLOB);
  if (maxBlob.bytes > MAX_BLOB) refuse('a blob of ' + maxBlob.bytes + ' bytes is over GitHub\'s 100 MB limit: ' + maxBlob.path);

  // 2. the repository
  const origin = git(root, ['remote', 'get-url', 'origin']);
  facts.origin = origin.code === 0 ? origin.stdout.trim() : null;
  const vis = opts.public ? '--public' : '--private';
  if (opts.public) {
    say('   WARNING, his words of 2026-09-17: "' + HIS_0917 + '". A public repository shows the whole tree to anyone.');
    if (!opts.yes) refuse('--public needs --yes');
  }
  if (!facts.origin) {
    say('2. no origin remote: create ' + (opts.public ? 'a PUBLIC' : 'a PRIVATE') + ' repository and push ' + branch);
    writes.push(['gh', 'repo', 'create', name, vis, '--source', '.', '--push']);
  } else {
    say('2. origin ' + facts.origin + ': push ' + branch);
    if (st.loggedIn) {
      const rv = runCmd(st.gh, ['repo', 'view', '--json', 'nameWithOwner,visibility'], { cwd: root, env, timeoutMs: 60_000 });
      try { const j = JSON.parse(rv.stdout); facts.visibility = j.visibility; say('   ' + j.nameWithOwner + ' is ' + j.visibility); } catch { say('   gh repo view: ' + (firstLine(rv.stderr) || 'no answer')); }
    }
    writes.push(['git', 'push', 'origin', 'HEAD']);
  }

  // 3. the workflow
  const relay = Boolean(opts.relay);
  const isPrivate = facts.origin ? String(facts.visibility || 'PRIVATE').toUpperCase() !== 'PUBLIC' : !opts.public;
  const perMonth = Math.round((wall + 5) * 30);
  say('3. cloud.yml: enable it and dispatch one run of ' + wall + ' minutes' + (relay ? ' that relays the next' : '') + (opts.ladder ? ', with the ladder' : ''));
  if (!relay) say('   cost: a daily run of ' + wall + ' minutes plus about 5 of build and upload is ' + perMonth + ' minutes a month against ' + PRIVATE_MINUTES + ' free on a private repository (' + (perMonth <= PRIVATE_MINUTES ? 'fits' : 'DOES NOT FIT') + '; the estimate is an assumption until a run prints its minutes)');
  if (relay && isPrivate) {
    say('   WARNING: a relay runs 24 hours a day, ' + DAY_MINUTES + ' minutes a day; ' + PRIVATE_MINUTES + ' free private minutes last ' + (PRIVATE_MINUTES / DAY_MINUTES).toFixed(2) + ' days');
    if (!opts.yes) refuse('a relay on a private repository needs --yes');
  }
  writes.push(['gh', 'workflow', 'enable', 'cloud.yml']);
  if (relay) {
    writes.push(['gh', 'variable', 'set', 'BRAIN_RELAY', '--body', 'true']);
    writes.push(['gh', 'variable', 'set', 'BRAIN_WALL_MINUTES', '--body', String(wall)]);
  }
  const dispatch = ['gh', 'workflow', 'run', 'cloud.yml', '-f', 'wallMinutes=' + wall, '-f', 'relay=' + relay];
  if (opts.ladder) dispatch.push('-f', 'ladder=true');
  writes.push(dispatch);
  say('4. then: gh run list --workflow cloud.yml --limit 1, print the run URL and "gh run watch <id>"');
  say('   his steps: gh auth login (once); private or public (private unless he passes --public --yes)');
  return { lines, refusals, writes, facts };
}

async function main(argv) {
  const a = args(argv);
  const wallRaw = a['wall-minutes'];
  const wall = wallRaw === undefined || wallRaw === true ? (a.relay ? 330 : 55) : Number(wallRaw);
  const opts = { root: a.root && a.root !== true ? a.root : ROOT, name: a.name && a.name !== true ? String(a.name) : 'brain', public: Boolean(a.public), yes: Boolean(a.yes), relay: Boolean(a.relay), ladder: Boolean(a.ladder), wallMinutes: wall, wallMinutesRaw: wallRaw };
  const t0 = Date.now();
  const p = plan({ ...opts, stopAtLogin: !a.dry });
  for (const l of p.lines) console.log('[cloud-github] ' + l);
  console.log('[cloud-github] the writes, in order' + (a.dry ? ' (--dry: none is run)' : '') + ':');
  for (const w of p.writes) console.log('[cloud-github]   ' + w.join(' '));
  if (p.refusals.length) {
    console.log('[cloud-github] ' + p.refusals.length + ' refusal(s); nothing written (' + (Date.now() - t0) + ' ms)');
    if (p.refusals.includes('run: gh auth login')) console.log('run: gh auth login');
    return 2;
  }
  if (a.dry) { console.log('[cloud-github] --dry: the plan holds; nothing written (' + (Date.now() - t0) + ' ms)'); return 0; }

  const gh = p.facts.gh.gh;
  const root = p.facts.root;
  for (const w of p.writes) {
    const [tool, ...rest] = w;
    const isWorkflowCall = tool === 'gh' && rest[0] === 'workflow';
    let r = null;
    for (let attempt = 1; attempt <= (isWorkflowCall ? 12 : 1); attempt++) {
      r = tool === 'git' ? runCmd('git', ['-C', root, ...rest], { timeoutMs: 600_000 }) : runCmd(gh, rest, { cwd: root, timeoutMs: 600_000 });
      if (r.code === 0) break;
      // a workflow is readable a few seconds after its first push
      if (isWorkflowCall) await new Promise((res) => setTimeout(res, 5000));
    }
    console.log('[cloud-github] ' + w.join(' ') + ': exit ' + r.code + (r.code ? ' ' + firstLine(r.stderr || r.error) : ''));
    if (r.code !== 0) return 1;
  }
  const since = Date.now() - 120_000;
  for (let attempt = 1; attempt <= 12; attempt++) {
    const l = runCmd(gh, ['run', 'list', '--workflow', 'cloud.yml', '--limit', '1', '--json', 'databaseId,url,status,createdAt'], { cwd: root, timeoutMs: 60_000 });
    try {
      const [run] = JSON.parse(l.stdout);
      if (run && Date.parse(run.createdAt) >= since) {
        console.log('[cloud-github] run ' + run.databaseId + ' ' + run.status + ': ' + run.url);
        console.log('gh run watch ' + run.databaseId);
        console.log('[cloud-github] then: node bench/cloud-host.mjs (' + Math.round((Date.now() - t0) / 1000) + ' s)');
        return 0;
      }
    } catch { /* not listed yet */ }
    await new Promise((res) => setTimeout(res, 5000));
  }
  console.log('[cloud-github] dispatched, but no run was listed within 60 s: gh run list --workflow cloud.yml');
  return 0;
}

const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) process.exitCode = await main(process.argv.slice(2));
