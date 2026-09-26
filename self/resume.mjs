// self/resume.mjs: THE RESUME SOURCE. A bar that never completed is undone work, and nothing
// finished it without a human until this file. Author: board 15 builder (item resume).
//
// His order of 2026-09-24 14:29: "Time is approaching until my claude sub is ending self improving
// is extremely important it should be able to finish undone work". The biggest undone work on disk
// was the whole-set public chain (bench/verdicts/public/whole-chain.cmd.txt: GSM8K 1319 on
// qwen3:1.7b, then HumanEval 161, then GSM8K on 30b), paused at 1111 journal lines with an ETA of
// 8h 05m, which no process would ever continue. This file continues it, a bounded slice at a time.
//
// WHAT IT READS: state/self/gaps.jsonl (self/gaps.mjs), every gap of kind "bar never completed".
// A gap is RESUMABLE when the bench its command names documents both --resume (the run continues
// from its journal) and --wall-minutes (the run can be cut cleanly between records). Every other
// gap is listed as NOT resumable with the reason, by name. A resumable gap is served by the chain
// step whose bar file would close it (the step writing bench/verdicts/<stem>.json where <stem> is
// the gap's partial name or a dash prefix of it, the rule self/gaps.mjs closes gaps by), else by the
// gap's own command when that command already carried --resume.
//
// WHEN IT RUNS: inside a soak (self/autopilot.mjs, source "resume") when the loop is idle, the
// Ollama queue is idle (no other consumer's journal modified in the last 3 minutes and no other
// model bench process alive), Ollama answers /api/tags, and at least 16 GB of RAM is free. At most
// --resume-minutes per soak (default 45). By hand: node self/resume.mjs --minutes N.
//
// HOW IT CUTS: the bench gets --wall-minutes M and stops before the next record once M minutes
// have passed, so the record it is on finishes every arm and is journaled whole. A torn last line
// left by a kill (a line the process was writing when it died) is DROPPED before the next resume
// and the bench writes that arm result again. The STOP switch (state/self/STOP) and a hard wall
// (M plus 10 minutes) kill the tree; the next resume repairs what a kill tore.
//
// WHAT IT WRITES: one decision line kind "resumed" (lines before and after, records completed,
// records per minute, model calls counted from the journal lines it added, the ISO cut time) to
// state/self/resume.jsonl and to the caller (the soak appends it to its own decision file); a
// fresh bench/verdicts/public/chain-cut.txt for a chain step, keeping the note it replaces under
// HISTORY. When a resumed bench writes its bar file, the gap closes on the next ledger refresh.
//
// THE MODEL: only the bench's own model cell, qwen through Ollama at localhost:11434. A step whose
// model is named claude-anything is refused before any socket opens.
import {
  readFileSync, writeFileSync, existsSync, statSync, readdirSync, appendFileSync, mkdirSync,
  openSync, closeSync, writeSync, truncateSync, rmSync,
} from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');
export const AUTHOR = 'organism (resume)';
export const NEVER_KIND = 'bar never completed';
export const RESUME_SOURCE = 'resume';
export const RESUME_MINUTES = 45;
export const IDLE_MS = 3 * 60_000;
export const HARD_GRACE_MS = 10 * 60_000;
export const FREE_RAM_MB = 16384;
export const OLLAMA_BASE = 'http://localhost:11434';
export const DEFAULT_MODEL = 'qwen3:1.7b';
export const DEFAULT_SEED = 'public/1';
export const GAPS_REL = 'state/self/gaps.jsonl';
export const LEDGER_REL = 'state/self/resume.jsonl';
export const LOCK_REL = 'state/self/resume.lock';
export const STOP_REL = 'state/self/STOP';
export const CHAIN_REL = 'bench/verdicts/public/whole-chain.cmd.txt';
export const CUT_REL = 'bench/verdicts/public/chain-cut.txt';
export const CUT_HISTORY_MAX = 8000;
/** The arms a journal record needs to be whole, per set (bench/public.mjs BAR_ARMS). */
export const BAR_ARMS = Object.freeze({ gsm8k: ['organism', 'alone', 'null'], humaneval: ['organism', 'alone', 'null'], arc: ['organism'] });
/**
 * Where the model consumers of this tree journal. A file here modified in the last IDLE_MS means
 * the one Ollama queue has another consumer. bench/verdicts/autopilot is the soak's own decision
 * file: a soak calling this passes it in `exclude`.
 */
export const CONSUMERS = Object.freeze([
  { dir: 'bench/verdicts/public', re: /\.(jsonl|log)$/ },
  { dir: 'bench/verdicts', re: /^math-journal-.*\.jsonl$/ },
  { dir: 'bench/verdicts/synth', re: /\.jsonl$/ },
  { dir: 'state/self/brief', re: /\.jsonl$/ },
  { dir: 'state/self/operators', re: /\.jsonl$/ },
  { dir: 'bench/verdicts/autopilot', re: /\.jsonl$/ },
]);
/** A live process whose command line matches is a model consumer (or a chain already running). */
export const CONSUMER_PROC_RE = /bench[\\/](public|math|synth|brief|ladder)\.mjs|self[\\/]brief\.mjs/;

const r2 = (x) => Math.round(x * 100) / 100;
const r4 = (x) => Math.round(x * 1e4) / 1e4;
const posix = (p) => String(p).replaceAll('\\', '/');
const firstLine = (e) => String((e && e.message) || e).split('\n')[0];
const safeName = (s) => String(s).replace(/[^A-Za-z0-9._-]+/g, '_');

// ---------------------------------------------------------------- reading the gaps
/** The script a bench command names (a copy of self/gaps.mjs scriptOf; test/resume.test.mjs checks they agree). */
export function scriptOf(command) {
  if (typeof command !== 'string') return null;
  for (const tok of command.trim().split(/\s+/)) {
    if (tok.startsWith('-')) continue;
    if (/\.m?js$/.test(tok)) return tok.replaceAll('\\', '/').replace(/^\.\//, '');
  }
  return null;
}

/** Whether a bench documents --resume and --wall-minutes, read from its own source text. */
export function benchDocs(root, script) {
  let text = null;
  try { text = readFileSync(path.join(root, script), 'utf8'); } catch { return { found: false, resume: false, wallMinutes: false }; }
  return { found: true, resume: /--resume\b/.test(text), wallMinutes: /--wall-minutes\b/.test(text) };
}

/** Split a command line into tokens (double quotes group). */
export function tokens(cmd) {
  const out = [];
  const re = /"([^"]*)"|(\S+)/g;
  let m;
  while ((m = re.exec(String(cmd || '')))) out.push(m[1] !== undefined ? m[1] : m[2]);
  return out;
}

const flagOf = (args, name) => { const i = args.indexOf('--' + name); return i >= 0 && i + 1 < args.length && !String(args[i + 1]).startsWith('--') ? String(args[i + 1]) : null; };

/**
 * A bench/public.mjs step out of its arguments: the set, the tag, the seed, the model, and the
 * files it writes (bench/public.mjs VERDICT_NAME and journalPath; the test checks they agree).
 */
export function publicStep(args, extra = {}) {
  const set = flagOf(args, 'set');
  const tag = flagOf(args, 'tag');
  const seed = flagOf(args, 'seed') || DEFAULT_SEED;
  const model = flagOf(args, 'model') || DEFAULT_MODEL;
  const armsFlag = flagOf(args, 'arms');
  const stem = 'public-' + set + (tag ? '-' + safeName(tag) : '');
  return {
    script: 'bench/public.mjs', args, set, tag, seed, model, stem,
    arms: armsFlag ? armsFlag.split(',').map((s) => s.trim()).filter(Boolean) : (BAR_ARMS[set] || ['organism']),
    barRel: 'bench/verdicts/' + stem + '.json',
    partialRel: 'bench/verdicts/' + stem + '-partial.json',
    journalRel: 'bench/verdicts/public/' + set + (tag ? '-' + safeName(tag) : '') + '-' + safeName(seed) + '.jsonl',
    ...extra,
  };
}

/** The steps of the chain file: each `bench\public.mjs <args> > <log>` segment, in order, with its --record. */
export function parseChain(text) {
  const steps = [];
  for (const seg of String(text || '').replace(/^﻿/, '').split(/\s&\s/)) {
    const m = /bench[\\/]public\.mjs\s+([^>&)]*?)\s*>\s*(\S+)/.exec(seg);
    if (!m) continue;
    const rec = /--record\s+(\S+)/.exec(seg);
    steps.push(publicStep(tokens(m[1]), { index: steps.length, log: posix(m[2]), record: rec ? posix(rec[1]) : null, from: CHAIN_REL }));
  }
  return steps;
}

/** The gap ledger's lines (state/self/gaps.jsonl), or [] with the reason. */
export function readGaps(root = ROOT) {
  let text;
  try { text = readFileSync(path.join(root, GAPS_REL), 'utf8'); } catch { return { lines: [], found: false }; }
  const lines = [];
  for (const l of text.split(/\r?\n/)) { if (!l.trim()) continue; try { lines.push(JSON.parse(l)); } catch { /* a torn line is no gap */ } }
  return { lines, found: true };
}

/**
 * Every "bar never completed" gap, sorted into resumable groups (one per step, chain order) and
 * the ones that are not resumable, each with its reason.
 */
export function planResume({ root = ROOT, lines = null } = {}) {
  const all = Array.isArray(lines) ? lines : readGaps(root).lines;
  const never = all.filter((g) => g && g.kind === NEVER_KIND);
  let chain = [];
  try { chain = parseChain(readFileSync(path.join(root, CHAIN_REL), 'utf8')); } catch { chain = []; }
  const groups = new Map();
  const notResumable = [];
  for (const g of never) {
    const script = scriptOf(g.benchCommand);
    const base = path.basename(String(g.verdictFile || g.id || '')).replace(/-partial\.json$/, '').replace(/\.json$/, '');
    if (!script) { notResumable.push({ id: g.id, script: null, reason: 'the partial names no bench command, so there is nothing to continue' }); continue; }
    const docs = benchDocs(root, script);
    if (!docs.found) { notResumable.push({ id: g.id, script, reason: script + ' is not on disk' }); continue; }
    if (!docs.resume) { notResumable.push({ id: g.id, script, reason: script + ' documents no --resume, so a cut run of it cannot continue: its bar is run whole' }); continue; }
    if (!docs.wallMinutes) { notResumable.push({ id: g.id, script, reason: script + ' documents --resume but no --wall-minutes, so a bounded resume could not cut it cleanly between records' }); continue; }
    const covering = chain.filter((s) => s.script === script && (base === s.stem || base.startsWith(s.stem + '-'))).sort((a, b) => b.stem.length - a.stem.length);
    let step = covering[0] || null;
    if (!step) {
      const tk = tokens(g.benchCommand);
      const args = tk.slice(tk.findIndex((t) => /\.m?js$/.test(t)) + 1);
      if (!args.includes('--resume')) { notResumable.push({ id: g.id, script, reason: 'no step of ' + CHAIN_REL + ' writes ' + base + '.json, and the command that wrote the partial (' + g.benchCommand + ') carried no --resume' }); continue; }
      step = script === 'bench/public.mjs'
        ? publicStep(args, { index: chain.length + groups.size, log: 'bench/verdicts/public/resume-' + safeName(base) + '.log', record: null, from: g.id })
        : { script, args, stem: base, barRel: 'bench/verdicts/' + base + '.json', journalRel: null, log: 'state/self/resume-' + safeName(base) + '.log', record: null, model: flagOf(args, 'model'), arms: null, index: chain.length + groups.size, from: g.id };
    }
    const key = step.script + ' ' + step.stem;
    if (!groups.has(key)) groups.set(key, { step, gaps: [] });
    groups.get(key).gaps.push(g.id);
  }
  const resumable = [...groups.values()].sort((a, b) => a.step.index - b.step.index).map((x) => ({ ...x, barOnDisk: existsSync(path.join(root, x.step.barRel)) }));
  return { never: never.length, resumable, notResumable, chainSteps: chain.length };
}

// ---------------------------------------------------------------- the journal
/**
 * A journal read back line by line: how many lines, whether the last one parses and ends with a
 * newline, the arm keys, duplicated keys, and the records that hold every arm (whole).
 */
export function inspectJournal(file, arms = BAR_ARMS.gsm8k) {
  const out = { file, exists: false, bytes: 0, lines: 0, header: null, armLines: 0, torn: 0, lastLineParses: null, endsWithNewline: null, keys: new Set(), dupKeys: 0, ids: new Map(), whole: 0, incomplete: 0, incompleteIds: [], lastId: null };
  if (!file || !existsSync(file)) return out;
  const text = readFileSync(file, 'utf8');
  out.exists = true;
  out.bytes = Buffer.byteLength(text);
  out.endsWithNewline = text.length === 0 || text.endsWith('\n');
  const ls = text.split('\n').filter((l) => l.trim());
  out.lines = ls.length;
  ls.forEach((l, i) => {
    let j = null;
    try { j = JSON.parse(l); } catch { out.torn++; if (i === ls.length - 1) out.lastLineParses = false; return; }
    if (i === ls.length - 1) out.lastLineParses = true;
    if (j && j.type === 'header' && !out.header) { out.header = j; return; }
    if (!j || j.type !== 'arm' || typeof j.id !== 'string' || typeof j.arm !== 'string') { out.torn++; return; }
    out.armLines++;
    const k = j.id + '\u0000' + j.arm;
    if (out.keys.has(k)) out.dupKeys++;
    out.keys.add(k);
    if (!out.ids.has(j.id)) out.ids.set(j.id, new Set());
    out.ids.get(j.id).add(j.arm);
    out.lastId = j.id;
  });
  for (const [id, set] of out.ids) {
    if (arms.every((a) => set.has(a))) out.whole++;
    else { out.incomplete++; out.incompleteIds.push(id); }
  }
  return out;
}

/** The plain summary of an inspection (no Sets), for a decision line or a verdict. */
export function journalFacts(j) {
  return { lines: j.lines, armLines: j.armLines, records: j.whole, incomplete: j.incomplete, torn: j.torn, dupKeys: j.dupKeys, lastLineParses: j.lastLineParses, endsWithNewline: j.endsWithNewline, bytes: j.bytes, lastId: j.lastId };
}

/**
 * Drop a torn tail. A last line with no newline that parses is closed with one; a last line that
 * does not parse (a kill inside a write) is cut off, and so is every unparseable line under it, so
 * the next resume writes those arm results again. Lines above the tail are never touched.
 */
export function repairJournal(file) {
  const out = { file, closed: false, dropped: [] };
  if (!file || !existsSync(file)) return out;
  for (let guard = 0; guard < 1000; guard++) {
    const buf = readFileSync(file);
    if (!buf.length) return out;
    const endsNl = buf[buf.length - 1] === 0x0a;
    const body = endsNl ? buf.subarray(0, buf.length - 1) : buf;
    const cut = body.lastIndexOf(0x0a) + 1;
    const last = body.subarray(cut).toString('utf8');
    if (!last.trim()) { truncateSync(file, cut); out.dropped.push({ bytes: buf.length - cut, head: '' }); continue; }
    let ok = true;
    try { JSON.parse(last); } catch { ok = false; }
    if (ok) {
      if (!endsNl) { appendFileSync(file, '\n'); out.closed = true; }
      return out;
    }
    truncateSync(file, cut);
    out.dropped.push({ bytes: buf.length - cut, head: last.slice(0, 80) });
  }
  return out;
}

/** Model calls an arm result spent, read from its journal line: region calls, one alone call, none for null or a native answer. */
export function modelCallsOf(line) {
  if (!line || typeof line !== 'object') return 0;
  if (line.arm === 'null') return 0;
  if (line.arm === 'alone') return 1;
  if (line.arm === 'plan') return Number(line.calls) || 1;
  if (line.arm === 'repair') return Number(line.rounds) || 1;
  if (line.region && Number.isFinite(Number(line.region.calls))) return Number(line.region.calls);
  if (line.native === true || ['exact', 'direct', 'memory'].includes(line.provenance)) return 0;
  return String(line.provenance || '').startsWith('model') ? 1 : 0;
}

/** The arm lines a journal gained between two inspections (by key), parsed. */
export function newArmLines(file, beforeKeys) {
  if (!file || !existsSync(file)) return [];
  const out = [];
  for (const l of readFileSync(file, 'utf8').split('\n')) {
    if (!l.trim()) continue;
    let j; try { j = JSON.parse(l); } catch { continue; }
    if (j && j.type === 'arm' && !beforeKeys.has(j.id + '\u0000' + j.arm)) out.push(j);
  }
  return out;
}

// ---------------------------------------------------------------- the queue
/** Node processes alive on this machine with their command lines (Windows: one CIM query; Linux: /proc). */
export function nodeProcesses() {
  if (process.platform === 'win32') {
    const r = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
      "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ForEach-Object { '' + $_.ProcessId + ' ' + $_.ParentProcessId + ' ' + $_.CommandLine }"],
    { encoding: 'utf8', timeout: 30_000, windowsHide: true });
    if (r.status !== 0 && !r.stdout) return { ok: false, list: [], reason: 'the process query failed: ' + String(r.stderr || r.error || r.status).slice(0, 200) };
    const list = [];
    for (const l of String(r.stdout || '').split(/\r?\n/)) { const m = /^(\d+) (\d+) (.*)$/.exec(l.trim()); if (m) list.push({ pid: Number(m[1]), ppid: Number(m[2]), cmd: m[3] }); }
    return { ok: true, list };
  }
  const list = [];
  try {
    for (const d of readdirSync('/proc')) {
      if (!/^\d+$/.test(d)) continue;
      try { const cmd = readFileSync('/proc/' + d + '/cmdline', 'utf8').split('\0').join(' ').trim(); if (/node/.test(cmd)) list.push({ pid: Number(d), ppid: null, cmd }); } catch { /* gone */ }
    }
  } catch (e) { return { ok: false, list: [], reason: firstLine(e) }; }
  return { ok: true, list };
}

/** The last resume line of this tree (state/self/resume.jsonl), or null. */
export function lastResume(root = ROOT) {
  let text; try { text = readFileSync(path.join(root, LEDGER_REL), 'utf8'); } catch { return null; }
  const ls = text.split('\n').filter((l) => l.trim());
  for (let i = ls.length - 1; i >= 0; i--) { try { const j = JSON.parse(ls[i]); if (j && j.kind === 'resumed') return j; } catch { /* torn */ } }
  return null;
}

/**
 * Is the one Ollama queue idle? No consumer file modified in the last idleMs (a file whose last
 * write is explained by this tree's own last resume, which has ended, does not count), and no
 * other model bench process alive. exclude: tree-relative dirs or files the caller owns.
 */
export function queueState({ root = ROOT, idleMs = IDLE_MS, exclude = [], now = Date.now(), procs = null, selfPids = null } = {}) {
  const ex = exclude.map((e) => posix(e).replace(/\/$/, ''));
  const excluded = (rel) => ex.some((e) => rel === e || rel.startsWith(e + '/'));
  const prev = lastResume(root);
  const ownUntil = prev && prev.endedAt ? Date.parse(prev.endedAt) + 5000 : null;
  const own = new Set(prev ? [prev.step && prev.step.journalRel, prev.step && prev.step.log, prev.step && prev.step.partialRel].filter(Boolean).map(posix) : []);
  const busy = [];
  let newest = null, checked = 0;
  for (const c of CONSUMERS) {
    let names = [];
    try { names = readdirSync(path.join(root, c.dir)); } catch { continue; }
    for (const n of names) {
      if (!c.re.test(n)) continue;
      const rel = c.dir + '/' + n;
      if (excluded(rel)) continue;
      let st; try { st = statSync(path.join(root, rel)); } catch { continue; }
      if (!st.isFile()) continue;
      checked++;
      const age = now - st.mtimeMs;
      if (own.has(rel) && ownUntil !== null && st.mtimeMs <= ownUntil) continue;
      if (newest === null || age < newest.ageMs) newest = { file: rel, ageMs: age };
      if (age < idleMs) busy.push({ what: 'file', file: rel, ageS: r2(age / 1000) });
    }
  }
  const mine = new Set([process.pid, process.ppid, ...(Array.isArray(selfPids) ? selfPids : [])]);
  const p = procs ? { ok: true, list: procs } : nodeProcesses();
  if (!p.ok) busy.push({ what: 'process query', reason: p.reason });
  for (const x of p.list || []) {
    if (mine.has(x.pid)) continue;
    if (CONSUMER_PROC_RE.test(String(x.cmd || ''))) busy.push({ what: 'process', pid: x.pid, cmd: String(x.cmd).slice(0, 160) });
  }
  return { idle: busy.length === 0, busy, checked, newest: newest ? { file: newest.file, ageS: r2(newest.ageMs / 1000) } : null, idleMs, processes: (p.list || []).length };
}

/** Ollama answers /api/tags, and which models it serves. */
export async function probeOllama(base = OLLAMA_BASE, ms = 3000) {
  try {
    const r = await fetch(base.replace(/\/$/, '') + '/api/tags', { signal: AbortSignal.timeout(ms) });
    if (!r.ok) return { up: false, reason: 'HTTP ' + r.status };
    const j = await r.json();
    return { up: true, models: (j.models || []).map((m) => m.name) };
  } catch (e) { return { up: false, reason: 'no answer from ' + base + '/api/tags within ' + ms + ' ms (' + firstLine(e) + ')' }; }
}

// ---------------------------------------------------------------- the run
function pidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; }
}

function killTree(pid) {
  if (!Number.isInteger(pid)) return;
  if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
  else { try { process.kill(-pid, 'SIGKILL'); } catch { try { process.kill(pid, 'SIGKILL'); } catch { /* gone */ } } }
}

/** The bench command of one bounded resume: the step's args with --resume and --wall-minutes M. */
export function resumeArgs(step, minutes) {
  const a = [...step.args];
  const w = a.indexOf('--wall-minutes');
  if (w >= 0) a.splice(w, 2);
  if (!a.includes('--resume')) a.push('--resume');
  a.push('--wall-minutes', String(minutes));
  return a;
}

/** The whole command line under the budget wrapper (BUDGETS rule: 6000 MB, the output dir watched, 16 GB free first). */
export function launchArgv(step, minutes) {
  const dir = step.journalRel ? posix(path.dirname(step.journalRel)) : 'state/self';
  const record = 'bench/verdicts/public/budget-resume-' + safeName(step.stem) + '.json';
  return [
    'tools/budget.mjs', '--ram-mb', '6000', '--disk-mb', '200', '--dir', dir, '--wait-free-ram-mb', String(FREE_RAM_MB), '--wait-max-s', '600',
    '--record', step.journalRel ? record : 'state/self/budget-resume-' + safeName(step.stem) + '.json', '--',
    process.execPath, '--max-old-space-size=6000', step.script, ...resumeArgs(step, minutes),
  ];
}

/**
 * What a bench/public.mjs pass printed: the ISO time of its CUT line (the whole stamp; an ISO time
 * holds colons, so the match is the ISO shape followed by ": --wall-minutes"), its RATE, and a
 * BUDGET KILLED line of the wrapper. (A lazy match to the first colon kept only "2026-09-26T04" in
 * the two bar resumes; the bench's own CUT lines in the chain log hold the whole stamps.)
 */
export function parseBenchTail(tail) {
  const t = String(tail || '');
  const cutM = /^CUT \S+ at (\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z): --wall-minutes/m.exec(t);
  const rateM = /^RATE \S+: ([\d.]+) tasks per minute/m.exec(t);
  const budgetKill = /BUDGET KILLED[^\n]*/.exec(t);
  return { cutAt: cutM ? cutM[1] : null, benchRate: rateM ? Number(rateM[1]) : null, budgetKill: budgetKill ? budgetKill[0] : null };
}

/**
 * Launch one bounded resume and wait for it. Its output is appended to the step's log (the chain's
 * own log) and its tail kept for the CUT line. STOP and the hard wall kill the tree.
 */
export function launchStep({ root = ROOT, step, minutes, stopCheck = null, graceMs = HARD_GRACE_MS, log = () => {} }) {
  return new Promise((resolve) => {
    const argv = launchArgv(step, minutes);
    const logFile = path.join(root, step.log || ('state/self/resume-' + safeName(step.stem) + '.log'));
    mkdirSync(path.dirname(logFile), { recursive: true });
    const fd = openSync(logFile, 'a');
    const startedAt = new Date().toISOString();
    try { writeSync(fd, '\n# RESUME ' + startedAt + ' by self/resume.mjs (' + AUTHOR + '): node ' + argv.map((x) => (x === process.execPath ? 'node' : x)).join(' ') + '\n'); } catch { /* the log is a courtesy */ }
    const t0 = Date.now();
    const child = spawn(process.execPath, argv, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true, detached: process.platform !== 'win32' });
    let tail = '';
    const sink = (b) => { try { writeSync(fd, b); } catch { /* disk */ } tail = (tail + b.toString('utf8')).slice(-65536); };
    child.stdout.on('data', sink);
    child.stderr.on('data', sink);
    let killed = null;
    const hard = setTimeout(() => { killed = 'hard wall ' + r2((minutes * 60_000 + graceMs) / 60_000) + ' min'; log('RESUME hard wall reached: killing the tree'); killTree(child.pid); }, minutes * 60_000 + graceMs);
    const poll = setInterval(() => { if (stopCheck && stopCheck()) { killed = 'stopped by ' + STOP_REL; log('RESUME stopped by ' + STOP_REL + ': killing the tree'); killTree(child.pid); } }, 5000);
    const done = (code, err) => {
      clearTimeout(hard); clearInterval(poll);
      try { closeSync(fd); } catch { /* closed */ }
      const parsed = parseBenchTail(tail);
      resolve({
        exit: code, error: err ? firstLine(err) : null, ms: Date.now() - t0, startedAt, endedAt: new Date().toISOString(), killed: killed || parsed.budgetKill,
        cutAt: parsed.cutAt, benchRate: parsed.benchRate, tail: tail.slice(-4000), argv: argv.map((x) => (x === process.execPath ? 'node' : x)),
      });
    };
    child.on('error', (e) => done(null, e));
    child.on('close', (code) => done(code, null));
  });
}

function acquire(root) {
  const f = path.join(root, LOCK_REL);
  mkdirSync(path.dirname(f), { recursive: true });
  for (let i = 0; i < 2; i++) {
    try { const fd = openSync(f, 'wx'); writeSync(fd, JSON.stringify({ pid: process.pid, at: new Date().toISOString() })); closeSync(fd); return { ok: true, file: f }; } catch (e) {
      if (e.code !== 'EEXIST') return { ok: false, reason: 'the resume lock could not be created: ' + e.code };
      let prior = null; try { prior = JSON.parse(readFileSync(f, 'utf8')); } catch { prior = {}; }
      if (pidAlive(prior.pid) && prior.pid !== process.pid) return { ok: false, reason: 'another resume (pid ' + prior.pid + ', since ' + prior.at + ') holds ' + LOCK_REL };
      try { rmSync(f, { force: true }); } catch { /* next attempt says */ }
    }
  }
  return { ok: false, reason: 'the resume lock could not be taken over' };
}
const release = (lock) => { if (lock && lock.ok) { try { rmSync(lock.file, { force: true }); } catch { /* gone */ } } };

/** A fresh chain-cut.txt for a chain step, the note it replaces kept under HISTORY (capped). */
export function writeCutNote(root, line, plan = null) {
  const f = path.join(root, CUT_REL);
  let prev = '';
  try { prev = readFileSync(f, 'utf8'); } catch { prev = ''; }
  const s = line.step || {};
  const a = line.after || {};
  const later = plan && Array.isArray(plan.later) && plan.later.length ? ' Then: ' + plan.later.join(', ') + '.' : '';
  const head = [
    'PAUSED ' + (line.cutAt || line.endedAt) + ' by self/resume.mjs (' + AUTHOR + ') after a bounded resume of ' + line.minutes + ' min (exit ' + line.exit + (line.killed ? ', ' + line.killed : '') + '): ' + s.stem + ', step ' + ((s.index ?? 0) + 1) + ' of the chain in ' + CHAIN_REL + '.',
    'journal ' + s.journalRel + ' holds ' + a.lines + ' lines (header included; ' + a.records + ' whole records of ' + (s.arms || []).length + ' arm rows each, ' + a.incomplete + ' incomplete; last line parses: ' + (a.lastLineParses ? 'yes' : 'NO') + '); this pass added ' + line.linesAdded + ' lines, ' + line.recordsCompleted + ' records at ' + line.recordsPerMinute + ' records/min with ' + line.modelCalls + ' model calls; bar file ' + s.barRel + (line.barLanded ? ' WRITTEN' : ' not yet written') + '.' + later,
    'RESUME: the organism continues it on its own, inside a soak (self/autopilot.mjs source resume, --resume-minutes, default ' + RESUME_MINUTES + ') when the Ollama queue is idle; by hand: node self/resume.mjs --minutes N; or the whole chain: the command in ' + CHAIN_REL + ' (--resume continues from the journal).',
    'HISTORY (the note this one replaced, verbatim' + (prev.length > CUT_HISTORY_MAX ? ', its first ' + CUT_HISTORY_MAX + ' characters' : '') + '):',
  ].join('\n');
  writeFileSync(f, head + '\n' + prev.slice(0, CUT_HISTORY_MAX));
  return { file: CUT_REL, bytes: Buffer.byteLength(head) + Math.min(prev.length, CUT_HISTORY_MAX) };
}

/**
 * ONE bounded resume. Returns a decision: resumed (a line kind "resumed"), failed, waiting (the
 * queue, Ollama or RAM is not ready; try again later), nothing (no resumable gap without its bar
 * file), refused (STOP, another resume, a claude model), would-resume (dry).
 * Seams for tests: lines, runner, procs, probe, freeMb, stopCheck.
 */
export async function resumeOnce(o = {}) {
  const root = typeof o.root === 'string' ? path.resolve(o.root) : ROOT;
  const say = typeof o.log === 'function' ? o.log : (l) => process.stderr.write(l + '\n');
  const minutes = Number.isFinite(Number(o.minutes)) && Number(o.minutes) > 0 ? r4(Number(o.minutes)) : RESUME_MINUTES;
  const at = new Date().toISOString();
  const base = { kind: 'resume', source: RESUME_SOURCE, author: AUTHOR, at };
  const stopped = () => existsSync(path.join(root, STOP_REL));
  if (stopped()) return { ...base, decision: 'refused', wall: 'stop', reason: 'stopped by ' + STOP_REL };
  const plan = planResume({ root, lines: o.lines || null });
  for (const n of plan.notResumable) say('not resumable: ' + n.id + ': ' + n.reason);
  const open = plan.resumable.filter((g) => !g.barOnDisk);
  for (const g of plan.resumable.filter((x) => x.barOnDisk)) say('bar landed: ' + g.step.barRel + ' is on disk, so ' + g.gaps.join(', ') + ' close on the next ledger refresh');
  if (!open.length) {
    return { ...base, decision: 'nothing', reason: plan.never ? 'no resumable gap without its bar file (' + plan.never + ' bar-never-completed gap(s): ' + plan.resumable.length + ' resumable group(s) all with their bar on disk, ' + plan.notResumable.length + ' not resumable)' : 'no gap of kind "' + NEVER_KIND + '" in ' + GAPS_REL, notResumable: plan.notResumable };
  }
  const g = open[0];
  const step = g.step;
  const later = open.slice(1).map((x) => x.step.stem);
  const info = { ...base, gaps: g.gaps, step: { stem: step.stem, set: step.set ?? null, tag: step.tag ?? null, model: step.model ?? null, index: step.index, script: step.script, journalRel: step.journalRel, log: step.log, partialRel: step.partialRel ?? null, barRel: step.barRel, arms: step.arms, from: step.from }, minutes, notResumable: plan.notResumable.map((n) => n.id) };
  if (/claude/i.test(String(step.model || ''))) return { ...info, decision: 'refused', wall: 'model', reason: 'the step names the model ' + step.model + ': a claude model is refused before any socket opens' };
  const lock = acquire(root);
  if (!lock.ok) return { ...info, decision: 'refused', wall: 'lock', reason: lock.reason };
  try {
    const q = queueState({ root, idleMs: Number.isFinite(o.idleMs) ? o.idleMs : IDLE_MS, exclude: Array.isArray(o.exclude) ? o.exclude : [], procs: o.procs || null, selfPids: o.selfPids || null });
    if (!q.idle) return { ...info, decision: 'waiting', wall: 'queue', reason: 'the Ollama queue is not idle: ' + q.busy.slice(0, 3).map((b) => b.what === 'file' ? b.file + ' written ' + b.ageS + ' s ago' : b.what === 'process' ? 'pid ' + b.pid + ' ' + b.cmd.slice(0, 80) : b.reason).join('; '), queue: q };
    const probe = o.probe ? await o.probe() : await probeOllama(OLLAMA_BASE, 3000);
    if (!probe.up) return { ...info, decision: 'waiting', wall: 'ollama', reason: 'Ollama is down: ' + probe.reason };
    if (step.model && Array.isArray(probe.models) && !probe.models.includes(step.model)) return { ...info, decision: 'refused', wall: 'model', reason: 'Ollama does not serve ' + step.model + ' (it serves ' + probe.models.join(', ') + ')' };
    const freeMb = Number.isFinite(o.freeMb) ? o.freeMb : Math.round(os.freemem() / 1048576);
    if (freeMb < FREE_RAM_MB) return { ...info, decision: 'waiting', wall: 'ram', reason: freeMb + ' MB free, under the ' + FREE_RAM_MB + ' MB the BUDGETS rule waits for' };
    if (o.dry) return { ...info, decision: 'would-resume', reason: 'a live run would continue ' + step.stem + ' for ' + minutes + ' min: node ' + launchArgv(step, minutes).map((x) => (x === process.execPath ? 'node' : x)).join(' '), queue: q };
    const journal = step.journalRel ? path.join(root, step.journalRel) : null;
    const repaired = repairJournal(journal);
    if (repaired.dropped.length) say('journal repaired: dropped ' + repaired.dropped.length + ' torn line(s) at its tail (' + repaired.dropped.map((d) => d.bytes + ' bytes').join(', ') + '); the bench writes those arm results again');
    const before = inspectJournal(journal, step.arms || BAR_ARMS.gsm8k);
    say('RESUME ' + step.stem + ' for ' + minutes + ' min: journal ' + (step.journalRel || '(none)') + ' ' + before.lines + ' lines, ' + before.whole + ' whole records; queue idle (' + q.checked + ' consumer files, newest ' + (q.newest ? q.newest.file + ' ' + q.newest.ageS + ' s ago' : 'none') + '); ' + freeMb + ' MB free');
    const run = await (o.runner || launchStep)({ root, step, minutes, stopCheck: o.stopCheck || stopped, graceMs: Number.isFinite(o.graceMs) ? o.graceMs : HARD_GRACE_MS, log: say });
    const after = inspectJournal(journal, step.arms || BAR_ARMS.gsm8k);
    const added = newArmLines(journal, before.keys);
    const calls = added.reduce((s, l) => s + modelCallsOf(l), 0);
    const wallMin = run.ms / 60_000;
    const completed = after.whole - before.whole;
    const barLanded = existsSync(path.join(root, step.barRel));
    const cleanCut = after.exists ? !!(after.lastLineParses && after.endsWithNewline && after.incomplete <= before.incomplete) : null;
    const repeated = after.dupKeys - before.dupKeys;
    const ok = run.exit === 0 && !run.killed;
    const line = {
      ...info, kind: 'resumed', decision: ok ? 'resumed' : 'failed', at: new Date().toISOString(),
      startedAt: run.startedAt, endedAt: run.endedAt, cutAt: run.cutAt || (barLanded ? null : run.endedAt), cutPrinted: !!run.cutAt, exit: run.exit, killed: run.killed || null,
      wallMinutes: r4(wallMin), linesBefore: before.lines, linesAfter: after.lines, linesAdded: after.lines - before.lines,
      recordsBefore: before.whole, recordsAfter: after.whole, recordsCompleted: completed, recordsPerMinute: wallMin > 0 ? r4(completed / wallMin) : null,
      benchRate: run.benchRate ?? null, modelCalls: calls, armLinesAdded: added.length, repeated, cleanCut, barLanded,
      before: journalFacts(before), after: journalFacts(after), repaired: { closed: repaired.closed, dropped: repaired.dropped.length, droppedBytes: repaired.dropped.reduce((s, d) => s + d.bytes, 0) },
      command: run.argv ? 'node ' + run.argv.join(' ') : null,
      reason: ok ? null : 'the bench ' + (run.killed ? 'was killed (' + run.killed + ')' : 'exited ' + run.exit + (run.error ? ' (' + run.error + ')' : '')) + '; the next resume repairs the journal tail and continues',
      tail: ok ? null : String(run.tail || '').slice(-600),
    };
    if (o.record !== false) { mkdirSync(path.dirname(path.join(root, LEDGER_REL)), { recursive: true }); appendFileSync(path.join(root, LEDGER_REL), JSON.stringify(line) + '\n'); }
    if (o.writeCut !== false && step.from === CHAIN_REL) { try { line.cutNote = writeCutNote(root, line, { later }).file; } catch (e) { say('the cut note was not written: ' + firstLine(e)); } }
    say('RESUMED ' + step.stem + ': lines ' + line.linesBefore + ' -> ' + line.linesAfter + ', records ' + line.recordsBefore + ' -> ' + line.recordsAfter + ' (' + completed + ' completed, ' + line.recordsPerMinute + ' per min over ' + r2(wallMin) + ' min), ' + calls + ' model calls, cut ' + (line.cutAt || 'none') + ', clean ' + cleanCut + ', repeated ' + repeated + (barLanded ? ', BAR FILE WRITTEN' : '') + (ok ? '' : '; ' + line.reason));
    return line;
  } finally { release(lock); }
}

// ---------------------------------------------------------------- CLI
const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const val = (k) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : undefined; };
  if (argv.includes('--help')) {
    console.log('node self/resume.mjs [--list] [--minutes N] [--dry] [--root DIR]\n  --list     the bar-never-completed gaps, resumable or not, with the reason\n  --minutes  the wall of one bounded resume (default ' + RESUME_MINUTES + ')\n  --dry      every check, no launch');
  } else {
    const root = val('root') ? path.resolve(val('root')) : ROOT;
    if (argv.includes('--list')) {
      const p = planResume({ root });
      console.log('RESUME PLAN: ' + p.never + ' gap(s) of kind "' + NEVER_KIND + '", ' + p.resumable.length + ' resumable group(s), ' + p.notResumable.length + ' not resumable');
      for (const g of p.resumable) console.log('  resumable ' + g.step.stem + ' (' + g.step.script + ' ' + g.step.args.join(' ') + ')' + (g.barOnDisk ? ' BAR ON DISK' : '') + ': ' + g.gaps.join(', '));
      for (const n of p.notResumable) console.log('  NOT resumable ' + n.id + ': ' + n.reason);
    } else {
      const r = await resumeOnce({ root, minutes: val('minutes') !== undefined ? Number(val('minutes')) : RESUME_MINUTES, dry: argv.includes('--dry'), log: (l) => console.log(l) });
      console.log('RESUME DECISION ' + r.decision + (r.reason ? ': ' + r.reason : ''));
      process.exitCode = r.decision === 'failed' ? 1 : 0;
    }
  }
}
