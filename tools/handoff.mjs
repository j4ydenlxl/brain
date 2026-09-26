#!/usr/bin/env node
// tools/handoff.mjs: docs/HANDOFF.md, written from measurements, never from memory.
//
// His 2026-09-24 14:29: "Time is approaching until my claude sub is ending self improving is
// extremely important it should be able to finish undone work". Whoever opens this tree with no
// Claude, him included, reads ONE file and sees what runs by itself, how to check it, how to stop
// it, what is undone, how the undone work gets done, how to resume the public chain, how to deploy
// the site and how to push the repository. Every line of that file is read off the machine at the
// moment it is written:
//
//   the two scheduled tasks        schtasks /Query /TN <name> /FO LIST /V (read only), beside the
//                                  exact register line the tool that registered it prints
//                                  (tools/schedule-ladder.mjs, tools/schedule-autopilot.mjs)
//   the undone work                state/self/gaps.jsonl, every line, grouped by kind, each with
//                                  its trial command and minutes (board items grouped by board)
//   what the loop did              bench/verdicts/autopilot/*.jsonl (the decision files),
//                                  state/self/authored.jsonl, state/self/soak-*.json
//   the public chain               bench/verdicts/public/whole-chain.cmd.txt, chain-cut.txt and the
//                                  journal line counts
//   the gate line                  bench/verdicts/gate.json, rebuilt in the gate's own format
//
// EVERY COMMAND THE FILE LISTS IS CHECKED: each script path in it must exist as a file under the
// tree, each executable must be found on PATH, each task name must be a registered task. The run
// prints the count checked and the count missing, and names every missing one; the file carries
// the same list. NO SECRET IS WRITTEN: nothing here reads a credential file (the Vercel CLI login
// file is tested for existence only), and every text carried from a ledger or a log passes
// through scrub(), which replaces the patterns in SECRET_PATTERNS and counts what it replaced.
//
//   node tools/handoff.mjs            write docs/HANDOFF.md, print each section's line count and
//                                     the commands checked and missing
//   node tools/handoff.mjs --stdout   the same, printed, nothing written
//   node tools/handoff.mjs --bar      the bar: write the file, re-read it against the ledger
//                                     (counts by kind), run node web/build.mjs and
//                                     node --test test/handoff.test.mjs, write
//                                     bench/verdicts/handoff.json
//   --root DIR                        another tree (the tests plant one)
//
// It never registers, removes or runs a task (only /Query), never opens a socket, and never asks
// a model.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  TASK_NAME as AUTOPILOT_TASK, AT as AUTOPILOT_AT, createArgv as autopilotCreateArgv, removeArgv as autopilotRemoveArgv,
  runArgv as autopilotRunArgv, asLine, tickArgv, trValue as autopilotTr, STOP_REL, LOG_DIR as AUTOPILOT_LOG_DIR,
} from './schedule-autopilot.mjs';
import {
  TASK_NAME as LADDER_TASK, AT as LADDER_AT, createArgv as ladderCreateArgv, removeArgv as ladderRemoveArgv,
} from './schedule-ladder.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const TREE = path.resolve(HERE, '..');
export const OUT_REL = 'docs/HANDOFF.md';
export const LEDGER_REL = 'state/self/gaps.jsonl';
export const DECISIONS_REL = AUTOPILOT_LOG_DIR;
export const AUTHORED_REL = 'state/self/authored.jsonl';
export const LOCK_REL = 'state/self-code/autopilot.lock';
export const LADDER_LOG_REL = 'bench/verdicts/ladder';
export const PUBLIC_REL = 'bench/verdicts/public';
export const CHAIN_CMD_REL = 'bench/verdicts/public/whole-chain.cmd.txt';
export const CHAIN_CUT_REL = 'bench/verdicts/public/chain-cut.txt';
export const GATE_REL = 'bench/verdicts/gate.json';
export const VERDICT_REL = 'bench/verdicts/handoff.json';
export const AUTHOR = 'board 15 builder';
/** The patterns no generated line may carry (the item's test list: sk_, token, VERCEL_OIDC). */
export const SECRET_PATTERNS = Object.freeze([/sk_/gi, /tokens?/gi, /VERCEL_OIDC/gi]);
export const REDACTED = '[withheld]';
/** The section titles, in the order the file carries them. */
export const SECTIONS = Object.freeze([
  'WHAT RUNS BY ITSELF',
  'HOW TO CHECK',
  'HOW TO STOP AND RESTART',
  'WHAT IS UNDONE',
  'HOW THE UNDONE WORK GETS DONE WITHOUT CLAUDE',
  'HOW TO RESUME THE PUBLIC CHAIN',
  'HOW TO DEPLOY THE SITE',
  'HOW TO PUSH THE REPOSITORY',
  'COMMANDS CHECKED',
]);
/** The order kinds are listed in: board items, partial bars and missed bars first (the item's words). */
export const KIND_ORDER = Object.freeze([
  'board item', 'bar never completed', 'missed', 'unreadable bar', 'ladder', 'gate red', 'gate slow',
  'dead share', 'ns class share', 'promoted from simulation', 'open',
]);
/** The files other Board 15 items land; each is reported as landed or "not landed yet". */
export const OPERATOR_FILES = Object.freeze({ brief: 'self/brief.mjs', boards: 'self/boards.mjs', resume: 'self/resume.mjs', nextboard: 'self/nextboard.mjs' });
/** schtasks Last Result codes this file decodes (the rest print as numbers). */
export const RESULT_CODES = Object.freeze({
  0: 'the last run exited 0',
  267008: '0x41300, ready to run',
  267009: '0x41301, running now',
  267011: '0x41303, has not run yet',
  '-2147020576': '0x800710E0, "the operator or administrator has refused the request": the run did not start',
});
const EM = String.fromCharCode(0x2014);
const EN = String.fromCharCode(0x2013);

// ------------------------------------------------------------------ text hygiene
/**
 * Replace every secret pattern and count the replacements; also fold em and en dashes (the gate
 * scans for em dashes) and backticks (they would break an inline code span).
 * @param {string} s
 * @param {{n: number}} [tally]
 */
export function scrub(s, tally = null) {
  let out = String(s ?? '');
  for (const re of SECRET_PATTERNS) {
    out = out.replace(re, () => { if (tally) tally.n++; return REDACTED; });
  }
  return out.split(EM).join(', ').split(EN).join('-').replace(/`/g, "'").replace(/\r?\n/g, ' ');
}

/** The first hit of any secret pattern in a text, or null. */
export function secretHit(text) {
  for (const re of SECRET_PATTERNS) {
    const r = new RegExp(re.source, 'i');
    const m = r.exec(String(text));
    if (m) return m[0];
  }
  return null;
}

const clip = (s, n) => (s.length > n ? s.slice(0, n - 3) + '...' : s);
const readJson = (f) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; } };
function readJsonl(f) {
  let text;
  try { text = readFileSync(f, 'utf8'); } catch { return { exists: false, rows: [], bad: 0, lines: 0 }; }
  const rows = [];
  let bad = 0, lines = 0;
  for (const l of text.split('\n')) {
    if (!l.trim()) continue;
    lines++;
    try { rows.push(JSON.parse(l)); } catch { bad++; }
  }
  return { exists: true, rows, bad, lines, sha256: createHash('sha256').update(text).digest('hex'), bytes: Buffer.byteLength(text) };
}
function lineCount(f) {
  try {
    const buf = readFileSync(f);
    let n = 0;
    for (const b of buf) if (b === 10) n++;
    if (buf.length && buf[buf.length - 1] !== 10) n++;
    return n;
  } catch { return null; }
}
const mtimeIso = (f) => { try { return statSync(f).mtime.toISOString(); } catch { return null; } };
const ageHours = (iso, now) => (iso ? Math.round((now - Date.parse(iso)) / 36e5 * 10) / 10 : null);

// ------------------------------------------------------------------ the machine, read only
/** schtasks /Query /TN name /FO LIST /V; {status, out, err}. Read only: this file never writes a task. */
export function realTaskQuery(name) {
  const r = spawnSync('schtasks', ['/query', '/tn', name, '/fo', 'LIST', '/v'], { encoding: 'utf8', windowsHide: true });
  if (r.error) return { status: -1, out: '', err: String(r.error.message) };
  return { status: r.status, out: String(r.stdout || ''), err: String(r.stderr || '').trim() };
}

/** Is this executable on PATH? where.exe on Windows, which elsewhere. Cached per run. */
export function realWhich(exe) {
  const r = spawnSync(process.platform === 'win32' ? 'where.exe' : 'which', [exe], { encoding: 'utf8', windowsHide: true });
  const first = String(r.stdout || '').split(/\r?\n/).find((l) => l.trim());
  return r.status === 0 && first ? first.trim() : null;
}

/** git remote -v and the branch, read only. */
export function realGit(root) {
  const run = (args) => spawnSync('git', ['-C', root, ...args], { encoding: 'utf8', windowsHide: true });
  const rem = run(['remote', '-v']);
  const br = run(['branch', '--show-current']);
  const top = run(['rev-parse', '--show-toplevel']);
  return {
    isRepo: top.status === 0,
    remotes: String(rem.stdout || '').split(/\r?\n/).filter((l) => l.trim()),
    branch: String(br.stdout || '').trim() || null,
  };
}

/** The fields of schtasks /FO LIST output, keyed by their label. */
export function parseTaskList(out) {
  const f = {};
  for (const line of String(out || '').split(/\r?\n/)) {
    const m = /^([A-Za-z][A-Za-z :/()]*?):\s+(.*)$/.exec(line);
    if (m && !(m[1] in f)) f[m[1].trim()] = m[2].trim();
  }
  return f;
}

export function readTask(name, taskQuery) {
  const r = taskQuery(name);
  if (!r || r.status !== 0) return { name, registered: false, why: 'schtasks exited ' + (r ? r.status : 'null') + (r && r.err ? ': ' + r.err.split('\n')[0] : '') };
  const f = parseTaskList(r.out);
  const code = f['Last Result'];
  return {
    name, registered: true, status: f.Status || null, nextRun: f['Next Run Time'] || null, lastRun: f['Last Run Time'] || null,
    lastResult: code ?? null, lastResultMeaning: code != null && RESULT_CODES[code] ? RESULT_CODES[code] : null,
    taskToRun: f['Task To Run'] || null, schedule: [f['Schedule Type'], f['Start Time']].filter(Boolean).join(' at ') || null,
    runAs: f['Run As User'] || null, logonMode: f['Logon Mode'] || null,
  };
}

// ------------------------------------------------------------------ command checks
const SCRIPT_RE = /\.(mjs|cjs|js|exe|cmd)$/i;
const EXES = new Set(['node', 'npx', 'git', 'gh', 'schtasks', 'powershell', 'cmd', 'cmd.exe']);

/** The things one command line needs to exist: script paths, executables, task names. */
export function checksOf(line) {
  const checks = [];
  const seen = new Set();
  const add = (c) => { const k = c.kind + ':' + c.name; if (!seen.has(k)) { seen.add(k); checks.push(c); } };
  const toks = String(line).split(/\s+/).map((t) => t.replace(/^[("']+|[)"';,]+$/g, '')).filter(Boolean);
  toks.forEach((t, i) => {
    if (i === 0 && EXES.has(t.toLowerCase())) add({ kind: 'exe', name: t.toLowerCase().replace(/\.exe$/, '') });
    else if (t.toLowerCase() === 'node' || t.toLowerCase() === 'git' || t.toLowerCase() === 'gh' || t.toLowerCase() === 'npx') add({ kind: 'exe', name: t.toLowerCase() });
    else if (SCRIPT_RE.test(t) && !t.startsWith('<') && !t.startsWith('--')) {
      if (/^cmd(\.exe)?$/i.test(t)) add({ kind: 'exe', name: 'cmd' });
      else add({ kind: 'file', name: t });
    }
  });
  // schtasks ... /TN <name>: the task must be registered, unless the line registers it
  const tn = toks.findIndex((t) => /^\/tn$/i.test(t));
  if (/^schtasks$/i.test(toks[0] || '') && tn >= 0 && toks[tn + 1] && !toks.some((t) => /^\/create$/i.test(t))) add({ kind: 'task', name: toks[tn + 1] });
  return checks;
}

export function makeChecker({ root, which, tasks }) {
  const commands = [];
  const whichCache = new Map();
  const has = (exe) => {
    if (exe === 'node') return true; // this process is node
    if (!whichCache.has(exe)) whichCache.set(exe, !!which(exe));
    return whichCache.get(exe);
  };
  const fileOk = (p) => {
    const abs = path.isAbsolute(p) || /^[A-Za-z]:[\\/]/.test(p) ? p : path.join(root, ...p.split(/[\\/]/));
    return existsSync(abs);
  };
  /**
   * Register one command line; extra checks (a dir, a task) may be added. toBuild names files the
   * command's own gap is about to build (an undone board item's bar bench): absent, they are
   * reported as "to be built by the item", not as missing. Returns the line.
   */
  function cmd(line, extra = [], { toBuild = [] } = {}) {
    const norm = (x) => String(x).replace(/\\/g, '/').replace(/^\.\//, '').toLowerCase();
    const building = new Set(toBuild.map(norm));
    const checks = [...checksOf(line), ...extra].map((c) => {
      let ok;
      if (c.kind === 'exe') ok = has(c.name);
      else if (c.kind === 'file' || c.kind === 'dir') ok = fileOk(c.name);
      else if (c.kind === 'task') ok = !!(tasks[c.name] && tasks[c.name].registered);
      else ok = false;
      const pending = !ok && c.kind === 'file' && building.has(norm(c.name));
      return { ...c, ok, pending };
    });
    const missing = checks.filter((c) => !c.ok && !c.pending).map((c) => c.kind + ' ' + c.name);
    const pending = checks.filter((c) => c.pending).map((c) => c.name);
    commands.push({ line, checks, missing, pending });
    return line;
  }
  return { cmd, commands };
}

// ------------------------------------------------------------------ the gate line
/** The gate's own summary line, rebuilt from gate.json in bench/gate.mjs's format. */
export function gateLine(g) {
  if (!g || !g.verdict) return null;
  const L = g.lines || {};
  const rows = g.rows || {};
  const gr = (r) => (r && r.ok ? 'GREEN' : 'RED');
  const named = [['budget', 'budget'], ['compress', 'compress'], ['hisData', 'his data'], ['loadBearing', 'load-bearing'], ['boundary', 'boundary']];
  const extra = Object.keys(rows).filter((k) => !named.some(([n]) => n === k)).map((k) => [k, k.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()]);
  const tail = [...named, ...extra].filter(([k]) => k in rows).map(([k, label]) => label + ' ' + gr(rows[k])).join(', ');
  return 'GATE ' + g.verdict + ': test files ' + g.testsPassed + '/' + g.testsTotal + ', assertions ' + g.assertionsPassed + ' pass / '
    + g.assertionsFailed + ' fail, authored code lines ' + L.code + ' in ' + L.codeFiles + ' files, prose lines ' + L.prose
    + ', generated organism lines ' + L.generated + ' in ' + L.generatedFiles + ' files, em-dash files ' + (Array.isArray(g.emDash) ? g.emDash.length : g.emDash)
    + ', bad imports ' + (Array.isArray(g.badImports) ? g.badImports.length : g.badImports) + (tail ? ', ' + tail : '');
}

// ------------------------------------------------------------------ the ledger
export function kindsInOrder(byKind) {
  const known = KIND_ORDER.filter((k) => byKind[k]);
  const other = Object.keys(byKind).filter((k) => !KIND_ORDER.includes(k)).sort();
  return [...known, ...other];
}
export function countByKind(rows) {
  const by = {};
  for (const g of rows) { const k = String(g.kind || 'unknown'); by[k] = (by[k] || 0) + 1; }
  return by;
}
/** A gap's trial as {command, minutes, needsModel}, or null; a board item may carry it as a string. */
export function trialOf(g) {
  if (!g || !g.trial) return null;
  if (typeof g.trial === 'string') return g.trial.trim() ? { command: g.trial.trim(), minutes: Number.isFinite(g.minutes) ? g.minutes : null, needsModel: !!g.needsModel } : null;
  return g.trial.command ? { command: String(g.trial.command), minutes: g.trial.minutes ?? g.minutes ?? null, needsModel: !!(g.trial.needsModel ?? g.needsModel) } : null;
}
const ownedOf = (g) => {
  const o = Array.isArray(g.files) ? g.files : [];
  const w = Array.isArray(g.owns) ? g.owns : typeof g.owns === 'string' ? g.owns.split(',').map((x) => x.replace(/\(.*?\)/g, '').trim()) : [];
  return [...o, ...w].filter(Boolean);
};
const boardOf = (g) => {
  if (g.board !== undefined && g.board !== null) return String(g.board);
  const m = /^board-(\d+)/.exec(String(g.id || ''));
  return m ? m[1] : '?';
};

// ------------------------------------------------------------------ the decision files
export function readDecisions(root) {
  const dir = path.join(root, ...DECISIONS_REL.split('/'));
  let files = [];
  try { files = readdirSync(dir).filter((f) => /^\d{4}-\d{2}-\d{2}\.jsonl$/.test(f)).sort(); } catch { /* none */ }
  const all = [];
  const perFile = [];
  for (const f of files) {
    const j = readJsonl(path.join(dir, f));
    perFile.push({ file: DECISIONS_REL + '/' + f, lines: j.lines, bad: j.bad, mtime: mtimeIso(path.join(dir, f)) });
    all.push(...j.rows);
  }
  return { files: perFile, rows: all };
}

/** Attempts and outcomes per (source, evidence), and refusals per wall, from decision lines. */
export function decisionStats(rows) {
  const by = new Map();
  const walls = {};
  let brief = { attempts: 0, kept: 0 }, resumed = { lines: 0, ok: 0 };
  for (const d of rows) {
    if (d.kind === 'resumed' || d.source === 'resume' || d.event === 'resumed') { resumed.lines++; if (d.decision === 'kept' || d.ok === true || d.completed === true) resumed.ok++; }
    if (!d.decision || d.candidate === false) continue;
    if (d.evidence === 'brief' || d.source === 'boards') { brief.attempts++; if (d.decision === 'kept') brief.kept++; }
    const k = (d.source || 'unknown') + '|' + (d.evidence || 'none');
    if (!by.has(k)) by.set(k, { source: d.source || 'unknown', evidence: d.evidence || 'none', attempts: 0, kept: 0, reverted: 0, refused: 0, other: 0 });
    const s = by.get(k);
    s.attempts++;
    if (d.decision === 'kept') s.kept++;
    else if (d.decision === 'reverted') s.reverted++;
    else if (d.decision === 'refused') { s.refused++; const w = d.wall || 'unnamed'; walls[w] = (walls[w] || 0) + 1; }
    else s.other++;
  }
  const list = [...by.values()].sort((a, b) => b.attempts - a.attempts || a.source.localeCompare(b.source));
  const total = list.reduce((a, s) => ({ attempts: a.attempts + s.attempts, kept: a.kept + s.kept, reverted: a.reverted + s.reverted, refused: a.refused + s.refused }), { attempts: 0, kept: 0, reverted: 0, refused: 0 });
  return { list, walls, total, brief, resumed };
}

/** The sources and evidence modes self/autopilot.mjs declares, read from its text (never run). */
export function declaredLoop(root) {
  let src = '';
  try { src = readFileSync(path.join(root, 'self', 'autopilot.mjs'), 'utf8'); } catch { return { exists: false, sources: [], evidence: [] }; }
  const m = /SOURCE_ORDER\s*=\s*Object\.freeze\(\[([^\]]*)\]/.exec(src);
  const sources = m ? [...m[1].matchAll(/'([a-z]+)'/g)].map((x) => x[1]) : [];
  for (const m2 of src.matchAll(/export const ([A-Z]+)_SOURCE\s*=\s*'([a-z]+)'/g)) if (!sources.includes(m2[2])) sources.push(m2[2]);
  if (/source:\s*'boards'/.test(src) && !sources.includes('boards')) sources.push('boards');
  const evidence = [...new Set([...src.matchAll(/evidence:\s*'([a-z]+)'/g)].map((x) => x[1]))];
  return { exists: true, sources, evidence };
}

// ------------------------------------------------------------------ generate
/**
 * Build the document. Nothing is written here.
 * @returns {{md: string, sections: Array<{title: string, lines: number}>, commands: Array, missing: Array, redactions: number, ledger: object, generatedAt: string, gate: string|null}}
 */
export function generate({
  root = TREE, now = new Date(), taskQuery = realTaskQuery, which = realWhich, git = realGit,
  appData = process.env.APPDATA || null,
} = {}) {
  const tally = { n: 0 };
  const S = (s) => scrub(s, tally);
  const rel = (...p) => path.join(root, ...p.join('/').split('/'));
  const nowMs = now.getTime();

  // the machine
  const tasks = { [LADDER_TASK]: readTask(LADDER_TASK, taskQuery), [AUTOPILOT_TASK]: readTask(AUTOPILOT_TASK, taskQuery) };
  const { cmd, commands } = makeChecker({ root, which, tasks });

  const out = [];
  const sections = [];
  let cur = null;
  const section = (title) => { cur = { title, start: out.length }; sections.push(cur); out.push('## ' + title, ''); };
  const p = (s) => { out.push(s, ''); };
  const li = (s) => out.push('- ' + s);
  const endList = () => out.push('');
  const code = (lines) => { out.push('```', ...lines, '```', ''); };

  // ---------------------------------------------------------------- header
  out.push('# HANDOFF', '');
  p('Generated by `node tools/handoff.mjs` from what is on this machine at ' + now.toISOString() + '. Nothing below is typed from memory: each count is read from the file named beside it, each command was checked to exist (the last section says how many, and names any that do not). Regenerate it any time with the same command; `node web/build.mjs` renders it at /handoff on the site.');

  // ---------------------------------------------------------------- 1. what runs by itself
  section(SECTIONS[0]);
  p('Two Windows scheduled tasks run this tree every day with nobody at the keyboard. Their state below is `schtasks /Query /TN <name> /FO LIST /V`, read at generation; the register line is the one the tool that registered the task prints.');
  const taskBlock = (name, at, registerLine, tool, logRel, logRe) => {
    const t = tasks[name];
    out.push('### ' + name + ' (daily ' + at + ')', '');
    if (t.registered) {
      li('registered: yes, status ' + S(t.status) + ', next run ' + S(t.nextRun) + ', schedule ' + S(t.schedule || 'n/a') + ', logon mode ' + S(t.logonMode || 'n/a') + (/interactive only/i.test(t.logonMode || '') ? ' (it runs only while his user is logged on)' : ''));
      li('last run ' + S(t.lastRun || 'n/a') + ', last result ' + S(t.lastResult ?? 'n/a') + (t.lastResultMeaning ? ' (' + S(t.lastResultMeaning) + ')' : ''));
      li('the task runs: `' + S(t.taskToRun || 'n/a') + '`');
    } else {
      li('registered: NO (' + S(t.why) + '); register it with the line below');
    }
    let logs = [];
    try { logs = readdirSync(rel(logRel)).filter((f) => logRe.test(f)).sort(); } catch { /* none */ }
    const newest = logs[logs.length - 1];
    li('newest log: ' + (newest ? logRel + '/' + newest + ' (' + lineCount(rel(logRel, newest)) + ' lines, written ' + mtimeIso(rel(logRel, newest)) + ')' : 'none under ' + logRel));
    endList();
    p('Register, remove, query (the tool prints each schtasks line before it runs it):');
    code([cmd('node ' + tool + ' --register'), cmd('node ' + tool + ' --remove'), cmd('node ' + tool + ' --status'), cmd(registerLine)]);
  };
  taskBlock(LADDER_TASK, LADDER_AT, asLine(ladderCreateArgv()), 'tools/schedule-ladder.mjs', LADDER_LOG_REL, /\.log$/);
  const ladderTaskMatch = tasks[LADDER_TASK].registered ? tasks[LADDER_TASK].taskToRun === ladderCreateArgv()[4] : null;
  taskBlock(AUTOPILOT_TASK, AUTOPILOT_AT, asLine(autopilotCreateArgv({ tree: root })), 'tools/schedule-autopilot.mjs', DECISIONS_REL, /\.log$/);
  const autopilotTaskMatch = tasks[AUTOPILOT_TASK].registered ? tasks[AUTOPILOT_TASK].taskToRun === autopilotTr(root) : null;
  p('The registered command matches the tool\'s own line: ' + LADDER_TASK + ' ' + (ladderTaskMatch === null ? 'not registered' : ladderTaskMatch ? 'yes' : 'NO') + ', ' + AUTOPILOT_TASK + ' ' + (autopilotTaskMatch === null ? 'not registered' : autopilotTaskMatch ? 'yes' : 'NO') + '. The autopilot task runs a guarded tick that then runs exactly this (tools/schedule-autopilot.mjs tickArgv), its transcript appended to bench/verdicts/autopilot/<date>.log:');
  code([cmd('node ' + tickArgv().join(' '))]);

  // ---------------------------------------------------------------- 2. how to check
  section(SECTIONS[1]);
  code([
    cmd('node daemon/health.mjs --gaps'),
    cmd('node daemon/health.mjs'),
    cmd('node bench/ladder.mjs'),
    cmd('node tools/schedule-autopilot.mjs --status'),
    cmd('node tools/schedule-ladder.mjs --status'),
    cmd('node bin/brain.mjs self-code --auto --dry --json'),
  ]);
  p('`node daemon/health.mjs --gaps` prints the gap counters in one line with no server; with no flag it serves GET /health on 127.0.0.1:8080 (HEALTH_PORT overrides). `node bench/ladder.mjs` with no flag prints the board from the verdicts on disk. The dry self-code run lists every candidate the loop would try, writes nothing and asks no model.');
  const dec = readDecisions(root);
  const newestDec = dec.files[dec.files.length - 1];
  if (newestDec) {
    const rows = readJsonl(rel(newestDec.file)).rows;
    const last = [...rows].reverse().find((d) => d.decision) || rows[rows.length - 1] || null;
    li('newest decision file: ' + newestDec.file + ', ' + newestDec.lines + ' lines, written ' + newestDec.mtime + ' (' + ageHours(newestDec.mtime, nowMs) + ' h before this file)');
    if (last) li('its last decision: ' + S(last.decision || last.event || 'none') + (last.wall ? ' at the ' + S(last.wall) + ' wall' : '') + ', key `' + S(last.key || 'n/a') + '`, at ' + S(last.at || 'n/a') + (last.reason ? ': ' + S(clip(String(last.reason), 220)) : ''));
  } else li('newest decision file: none under ' + DECISIONS_REL);
  const ledgerFile = rel(LEDGER_REL);
  const ledger = readJsonl(ledgerFile);
  const byKind = countByKind(ledger.rows);
  const kinds = kindsInOrder(byKind);
  const withTrial = ledger.rows.filter((g) => trialOf(g)).length;
  const ledgerInfo = { file: LEDGER_REL, exists: ledger.exists, lines: ledger.lines, parsed: ledger.rows.length, bad: ledger.bad, sha256: ledger.sha256 || null, mtime: mtimeIso(ledgerFile), byKind, withTrial };
  li('newest gap ledger: ' + LEDGER_REL + (ledger.exists ? ', ' + ledger.rows.length + ' gaps (' + ledger.bad + ' unparseable lines), ' + withTrial + ' with a trial, written ' + ledgerInfo.mtime + '; by kind: ' + kinds.map((k) => k + ' ' + byKind[k]).join(', ') : ': ABSENT (run node self/gaps.mjs to build it)'));
  endList();
  code([cmd('node self/gaps.mjs')]);
  p('`node self/gaps.mjs` rebuilds the ledger from the verdicts, the gate, the ladder and the notes; the loop also rebuilds it at the start of a soak when it is older than 24 h and after every kept patch.');

  // ---------------------------------------------------------------- 3. stop and restart
  section(SECTIONS[2]);
  const stopPresent = existsSync(rel(STOP_REL));
  li('the switch: `' + STOP_REL + '`; present now: ' + (stopPresent ? 'YES, the loop is stopped by hand' : 'no, the loop runs at its next tick') + '. While it exists the tick refuses to start (exit 0, one line in the day\'s log) and a running soak ends between rounds.');
  const lock = readJson(rel(LOCK_REL));
  li('the pid lock: `' + LOCK_REL + '` (one autopilot per tree); present now: ' + (lock ? 'yes, pid ' + S(lock.pid) + ' since ' + S(lock.at) : 'no') + '. A lock whose process is gone is taken over by the next run and the takeover is printed, so a crash never needs a hand to clear it.');
  endList();
  p('Stop the loop, then start it again:');
  code([
    cmd('node -e "require(\'fs\').writeFileSync(\'state/self/STOP\', \'stopped by hand\')"', [{ kind: 'dir', name: 'state/self' }]),
    cmd('node -e "require(\'fs\').rmSync(\'state/self/STOP\', {force: true})"', [{ kind: 'dir', name: 'state/self' }]),
  ]);
  p('Take the tasks off the machine, or put them back (the same lines as above), or run the autopilot task once now:');
  code([
    cmd('node tools/schedule-autopilot.mjs --remove'),
    cmd('node tools/schedule-autopilot.mjs --register'),
    cmd('node tools/schedule-autopilot.mjs --run-now'),
    cmd('node tools/schedule-ladder.mjs --remove'),
    cmd('node tools/schedule-ladder.mjs --register'),
    cmd(asLine(autopilotRemoveArgv())),
    cmd(asLine(ladderRemoveArgv())),
    cmd(asLine(autopilotRunArgv())),
  ]);
  p('A soak that was killed continues from its checkpoint (state/self/soak-<runId>.json) with:');
  code([cmd('node bin/brain.mjs self-code --auto --resume')]);

  // ---------------------------------------------------------------- 4. what is undone
  section(SECTIONS[3]);
  if (!ledger.exists) {
    p('The gap ledger ' + LEDGER_REL + ' is absent, so nothing below is counted. Build it with `node self/gaps.mjs`.');
  } else {
    p('Every line of ' + LEDGER_REL + ' (' + ledger.rows.length + ' gaps, sha256 ' + String(ledger.sha256).slice(0, 16) + ', written ' + ledgerInfo.mtime + '), grouped by kind, each with its trial command and its minutes. A gap with no trial has no bounded form yet; its reason is printed instead. Board items are unfinished items of docs/boards/board-N.js; partial bars are kind "bar never completed"; missed bars are kind "missed".');
    const boardRows = ledger.rows.filter((g) => g.kind === 'board item');
    if (boardRows.length) {
      const byBoard = {};
      for (const g of boardRows) (byBoard[boardOf(g)] ||= []).push(g);
      li('board items by board: ' + Object.keys(byBoard).sort((a, b) => Number(a) - Number(b)).map((b) => 'Board ' + b + ' ' + byBoard[b].length + ' (' + byBoard[b].map((g) => S(g.key || String(g.id).split(':').pop())).join(', ') + ')').join('; '));
      endList();
    } else {
      li('board items by board: 0 in the ledger (the boards source, ' + OPERATOR_FILES.boards + ', is ' + (existsSync(rel(OPERATOR_FILES.boards)) ? 'landed; it wrote no board item line yet' : 'not landed yet') + ')');
      endList();
    }
    for (const k of kinds) {
      let rows = ledger.rows.filter((g) => String(g.kind || 'unknown') === k);
      if (k === 'board item') rows = rows.sort((a, b) => Number(boardOf(a)) - Number(boardOf(b)) || String(a.id).localeCompare(String(b.id)));
      out.push('### ' + k + ' (' + rows.length + ')', '');
      for (const g of rows) {
        const head = '`' + S(g.id) + '`';
        const where = k === 'board item' ? ' Board ' + boardOf(g) + (g.verdictFile ? ', verdict ' + S(g.verdictFile) : '') : (g.verdictFile ? ' ' + S(g.verdictFile) : '');
        const meas = g.measured !== null && g.measured !== undefined ? ', measured ' + S(g.measured) + (g.bar !== null && g.bar !== undefined ? ' against bar ' + S(g.bar) : '') + (g.unit ? ' ' + S(g.unit) : '') : '';
        const t = trialOf(g);
        const minutes = t ? t.minutes : (Number.isFinite(g.minutes) ? g.minutes : null);
        const trialText = t
          ? '; trial ' + (minutes ?? '?') + ' min' + (t.needsModel ? ', needs the model' : '') + ': `' + cmd(S(t.command), [], { toBuild: k === 'board item' ? ownedOf(g) : [] }) + '`'
          : '; no trial command' + (minutes !== null ? ' (' + minutes + ' min)' : '') + ': ' + S(clip(String(g.why || 'no reason given'), k === 'open' ? 170 : 200));
        li(head + where + meas + trialText);
      }
      endList();
    }
  }

  // ---------------------------------------------------------------- 5. how it gets done without Claude
  section(SECTIONS[4]);
  const loop = declaredLoop(root);
  const st = decisionStats(dec.rows);
  p('The loop is `self/autopilot.mjs` (run by the 05:00 task through `bin/brain.mjs self-code --auto --soak 90`). Each candidate passes five walls in order, ceiling, patch, evidence, gate, record, and stops at the first it fails; a kept patch is written to the real tree only after the whole gate is GREEN, and a red gate reverts it byte for byte. The model cell, when one is asked, is qwen3 on Ollama at localhost:11434; a model name or base naming Claude or Anthropic is refused before any socket opens.');
  li('sources declared in self/autopilot.mjs: ' + (loop.exists ? loop.sources.join(', ') || 'none found' : 'self/autopilot.mjs ABSENT') + '; sources seen in the decision files: ' + ([...new Set(st.list.map((x) => x.source))].join(', ') || 'none'));
  li('evidence modes declared: ' + (loop.evidence.join(', ') || 'none found'));
  li('decision files read: ' + dec.files.length + ' (' + dec.files.map((f) => f.file.split('/').pop() + ' ' + f.lines + ' lines').join(', ') + '); decisions ' + st.total.attempts + ': kept ' + st.total.kept + ', reverted ' + st.total.reverted + ', refused ' + st.total.refused);
  endList();
  p('Measured per source and evidence mode (attempts, kept, reverted, refused), from the decision files:');
  for (const s of st.list) li('source ' + S(s.source) + ', evidence ' + S(s.evidence) + ': ' + s.attempts + ' attempts, ' + s.kept + ' kept, ' + s.reverted + ' reverted, ' + s.refused + ' refused' + (s.other ? ', ' + s.other + ' other' : ''));
  if (!st.list.length) li('no decision lines yet');
  endList();
  const wallList = Object.entries(st.walls).sort((a, b) => b[1] - a[1]);
  p('Where the refusals stopped (wall: count): ' + (wallList.length ? wallList.map(([w, n]) => S(w) + ' ' + n).join(', ') : 'none') + '.');
  const authored = readJsonl(rel(AUTHORED_REL));
  p('Kept patches, from ' + AUTHORED_REL + ' (' + authored.rows.length + ' line' + (authored.rows.length === 1 ? '' : 's') + '):');
  for (const a of authored.rows) li(S(a.at) + ' ' + S(a.author || 'author not recorded') + ' on ' + S((a.files || []).join(', ') || a.file || 'n/a') + (a.gap ? ', gap `' + S(a.gap) + '`' : '') + (a.before !== undefined ? ', ' + S(a.before) + ' to ' + S(a.after) + (a.unit ? ' ' + S(a.unit) : '') + (a.noise !== undefined ? ' (noise ' + S(a.noise) + ')' : '') : ''));
  if (!authored.rows.length) li('none yet');
  endList();
  let soaks = [];
  try { soaks = readdirSync(rel('state/self')).filter((f) => /^soak-.*\.json$/.test(f)).sort(); } catch { /* none */ }
  p('Soaks run (state/self/soak-*.json):');
  for (const f of soaks) {
    const j = readJson(rel('state/self', f));
    if (!j) { li(f + ': unreadable'); continue; }
    const n = (x) => (Array.isArray(x) ? x.length : Number(x) || 0);
    const g = j.gateAfter && j.gateAfter.summary ? String(j.gateAfter.summary).split(',')[0] : 'no gate after';
    const b10 = j.board10 && j.board10.counts ? j.board10.counts : null;
    const attempts = n(j.decisions) + (b10 ? Number(b10.candidates) || 0 : 0);
    const kept = n(j.kept) + (b10 ? Number(b10.kept) || 0 : 0);
    li(S(j.runId) + ': ' + S(j.status) + ', ' + (Math.round((j.elapsedMs || 0) / 600) / 100) + ' of ' + S(j.cfg && j.cfg.soakMinutes) + ' min, attempts ' + attempts + ' (' + n(j.decisions) + ' gap rounds, ' + (b10 ? b10.candidates : 0) + ' from the Board 10 sources), kept ' + kept + ', model calls ' + n(j.modelCalls) + ', ' + S(g));
  }
  if (!soaks.length) li('none yet');
  endList();
  const briefLanded = existsSync(rel(OPERATOR_FILES.brief));
  const boardsLanded = existsSync(rel(OPERATOR_FILES.boards));
  const resumeLanded = existsSync(rel(OPERATOR_FILES.resume));
  const nextLanded = existsSync(rel(OPERATOR_FILES.nextboard));
  li('the brief operator (' + OPERATOR_FILES.brief + ', executes a board item\'s brief on a copy through the organism\'s own answer chain, model cell last): ' + (briefLanded ? 'landed' : 'not landed yet') + '; decisions with evidence brief or source boards: ' + st.brief.attempts + ' attempts, ' + st.brief.kept + ' kept');
  li('the boards source (' + OPERATOR_FILES.boards + ', turns every unfinished board item into a gap line of kind "board item"): ' + (boardsLanded ? 'landed' : 'not landed yet') + '; board item lines in the ledger: ' + (byKind['board item'] || 0));
  li('resume (' + OPERATOR_FILES.resume + ', continues a bar that never completed when the model queue is idle): ' + (resumeLanded ? 'landed' : 'not landed yet') + '; decision lines of kind resumed: ' + st.resumed.lines + ', completed ' + st.resumed.ok);
  li('the next board (' + OPERATOR_FILES.nextboard + ', writes docs/boards/proposed/board-N.md from the ledger): ' + (nextLanded ? 'landed' : 'not landed yet'));
  endList();
  p('Run one bounded soak by hand (the author off asks no model; the task itself runs 90 minutes with the author on):');
  code([cmd('node bin/brain.mjs self-code --auto --soak 1 --author off --json'), cmd('node bin/brain.mjs self-code --auto --soak 60 --author on --json')]);

  // ---------------------------------------------------------------- 6. the public chain
  section(SECTIONS[5]);
  let chainCmd = null;
  try { chainCmd = readFileSync(rel(CHAIN_CMD_REL), 'utf8').replace(/^﻿/, '').trim(); } catch { /* absent */ }
  let cut = null;
  try { cut = readFileSync(rel(CHAIN_CUT_REL), 'utf8').replace(/^﻿/, '').split(/\r?\n/).find((l) => l.trim()) || null; } catch { /* absent */ }
  p('The whole-set public chain (GSM8K on qwen3:1.7b, then HumanEval, then GSM8K on qwen3:30b-a3b) is paused. ' + (cut ? 'The cut, first line of ' + CHAIN_CUT_REL + ': "' + S(clip(cut, 260)) + '"' : CHAIN_CUT_REL + ' is absent.'));
  let journals = [];
  try { journals = readdirSync(rel(PUBLIC_REL)).filter((f) => /-public_\d+\.jsonl$/.test(f)).sort(); } catch { /* none */ }
  const chain = { command: chainCmd ? true : false, journals: [] };
  for (const f of journals) {
    const j = readJsonl(rel(PUBLIC_REL, f));
    const records = new Set(j.rows.filter((r) => r.type === 'arm' && r.id !== undefined).map((r) => r.id)).size;
    chain.journals.push({ file: PUBLIC_REL + '/' + f, lines: j.lines, records });
    li(PUBLIC_REL + '/' + f + ': ' + j.lines + ' journal lines, ' + records + ' records');
  }
  if (!journals.length) li('no journal under ' + PUBLIC_REL);
  endList();
  if (chainCmd) {
    p('Resume it only when nothing else is using Ollama (one Ollama is one queue). `--resume` continues each set from its journal. The exact command, from ' + CHAIN_CMD_REL + ', run from any cmd window:');
    code([cmd(S(chainCmd))]);
  } else p(CHAIN_CMD_REL + ' is absent: there is no recorded resume command.');

  // ---------------------------------------------------------------- 7. deploy
  section(SECTIONS[6]);
  code([cmd('node web/build.mjs'), cmd('node tools/deploy.mjs web/dist')]);
  const loginFile = appData ? path.join(appData, 'com.vercel.cli', 'Data', 'auth.json') : null;
  const loginPresent = loginFile ? existsSync(loginFile) : false;
  p('`node web/build.mjs` writes web/dist (the organism page, findings, portfolio, ladder and this file at /handoff). `node tools/deploy.mjs web/dist` runs the Vercel CLI through npx (`npx vercel@latest`), links the project "dilation" and deploys to production, aliased to dilation.dev; it prints every command before it runs it. The CLI login made once on this machine by device login lives in the CLI\'s own data folder under %APPDATA% (com.vercel.cli); present now: ' + (loginPresent ? 'yes' : 'NO') + '. This file never reads it and carries no credential. If the deploy prints that the CLI is not logged in, he runs the login himself:');
  code([cmd('npx vercel@latest login')]);

  // ---------------------------------------------------------------- 8. push
  section(SECTIONS[7]);
  const g = git(root);
  li('git repository at this tree: ' + (g.isRepo ? 'yes' : 'NO') + ', branch ' + S(g.branch || 'n/a'));
  li('remotes: ' + (g.remotes.length ? g.remotes.map((r) => '`' + S(r) + '`').join(', ') : 'none configured (`git remote -v` printed nothing)'));
  endList();
  p('Pushing is his to do: the GitHub login and the remote are his, and no credential is written anywhere in this tree. With the GitHub CLI (it opens a browser for his login), or with a remote URL he already has:');
  code([
    cmd('git remote -v'),
    cmd('gh auth login'),
    cmd('gh repo create <name> --private --source . --remote origin --push'),
    cmd('git remote add origin <url>'),
    cmd('git push -u origin ' + (g.branch || 'master')),
  ]);

  // ---------------------------------------------------------------- 9. commands checked
  section(SECTIONS[8]);
  const missing = commands.filter((c) => c.missing.length);
  const pendingCmds = commands.filter((c) => c.pending.length);
  const checkCount = commands.reduce((a, c) => a + c.checks.length, 0);
  p('Commands listed in this file: ' + commands.length + ' (' + checkCount + ' checks: script files under the tree, executables on PATH, registered tasks). Missing: ' + missing.length + (missing.length ? '.' : ', none.') + ' Bar commands whose bench an undone board item is still to build: ' + pendingCmds.length + '.');
  for (const c of missing) li('`' + clip(c.line, 160) + '` needs ' + c.missing.join(', '));
  for (const c of pendingCmds) li('`' + clip(c.line, 160) + '` runs ' + c.pending.join(', ') + ', to be built by its board item');
  if (missing.length || pendingCmds.length) endList();

  // ---------------------------------------------------------------- footer
  const gate = readJson(rel(GATE_REL));
  const gl = gateLine(gate);
  const redactionsLine = 'Secret filter: ' + tally.n + ' replacement(s) by ' + REDACTED + ' in text carried from the ledger and the logs (the patterns are SECRET_PATTERNS in tools/handoff.mjs).';
  out.push(redactionsLine, '');
  const footer = 'Generated ' + now.toISOString() + ' under: ' + (gl ? gl + ' (' + GATE_REL + ', at ' + gate.at + ')' : 'no gate verdict on disk (' + GATE_REL + ' absent)');
  out.push(footer);

  // section line counts
  for (let i = 0; i < sections.length; i++) {
    const end = i + 1 < sections.length ? sections[i + 1].start : out.length - 3;
    sections[i].lines = out.slice(sections[i].start, end).filter((l) => l !== '').length;
  }
  let md = out.join('\n') + '\n';
  md = md.split(EM).join(', ');
  return {
    md, sections: sections.map((s) => ({ title: s.title, lines: s.lines })), commands, missing, redactions: tally.n,
    ledger: ledgerInfo, tasks, decisions: { files: dec.files, ...st }, chain, gateLine: gl, gateAt: gate ? gate.at : null,
    generatedAt: now.toISOString(), stop: stopPresent, lock: lock || null, taskMatch: { [LADDER_TASK]: ladderTaskMatch, [AUTOPILOT_TASK]: autopilotTaskMatch },
    vercelLogin: loginPresent, git: g,
  };
}

// ------------------------------------------------------------------ read the file back
/** Counts by kind as the written file names them: "### kind (n)" and its "- `id`" bullets. */
export function countsInDoc(md) {
  const lines = String(md).split('\n');
  const start = lines.indexOf('## ' + SECTIONS[3]);
  const out = {};
  if (start < 0) return { headings: out, bullets: {} };
  const bullets = {};
  let kind = null;
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith('## ')) break;
    const h = /^### (.+) \((\d+)\)$/.exec(l);
    if (h) { kind = h[1]; out[kind] = Number(h[2]); bullets[kind] = 0; continue; }
    if (kind && l.startsWith('- `')) bullets[kind]++;
  }
  return { headings: out, bullets };
}

/** The file against the ledger: every kind's heading count and bullet count equal the ledger's. */
export function compareToLedger(md, rows) {
  const want = countByKind(rows);
  const { headings, bullets } = countsInDoc(md);
  const kinds = [...new Set([...Object.keys(want), ...Object.keys(headings)])];
  const diffs = kinds.filter((k) => want[k] !== headings[k] || want[k] !== bullets[k]).map((k) => k + ': ledger ' + (want[k] ?? 0) + ', heading ' + (headings[k] ?? 'none') + ', bullets ' + (bullets[k] ?? 0));
  return { match: diffs.length === 0, diffs, want, headings, bullets };
}

export function writeHandoff(opts = {}) {
  const root = opts.root || TREE;
  const r = generate(opts);
  const hit = secretHit(r.md);
  if (hit) throw new Error('handoff: a secret pattern survived the filter: ' + hit);
  const file = path.join(root, ...OUT_REL.split('/'));
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, r.md);
  return { ...r, file, bytes: Buffer.byteLength(r.md) };
}

export function printSummary(r, say = console.log) {
  for (const s of r.sections) say('section ' + s.title + ': ' + s.lines + ' lines');
  const checks = r.commands.reduce((a, c) => a + c.checks.length, 0);
  say('commands checked ' + r.commands.length + ' (' + checks + ' checks), missing ' + r.missing.length + (r.missing.length ? ': ' + r.missing.map((c) => c.missing.join(' + ') + ' in `' + clip(c.line, 90) + '`').join('; ') : ''));
  say('ledger ' + r.ledger.file + ': ' + r.ledger.parsed + ' gaps, by kind ' + kindsInOrder(r.ledger.byKind).map((k) => k + ' ' + r.ledger.byKind[k]).join(', '));
  say('tasks: ' + Object.values(r.tasks).map((t) => t.name + ' ' + (t.registered ? t.status + ', next ' + t.nextRun : 'NOT registered')).join('; '));
  say('secret filter replacements ' + r.redactions);
  say('gate line: ' + (r.gateLine || 'none'));
}

// ------------------------------------------------------------------ the bar
function runChild(args, { root, timeoutMs }) {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', windowsHide: true, timeout: timeoutMs, maxBuffer: 64 * 1024 * 1024 });
  return { exit: r.status, signal: r.signal || null, ms: Date.now() - t0, out: String(r.stdout || ''), err: String(r.stderr || ''), error: r.error ? r.error.message : null };
}

export async function bar({ root = TREE, write = true, say = console.log } = {}) {
  const at0 = new Date();
  say('free RAM ' + Math.round(os.freemem() / 1048576) + ' MB at the start');
  // 1. the file, regenerated if the ledger moved under it (other builders write the ledger)
  let r = null, cmp = null, ledgerNow = null, attempts = 0;
  for (; attempts < 3; attempts++) {
    r = writeHandoff({ root });
    ledgerNow = readJsonl(path.join(root, ...LEDGER_REL.split('/')));
    cmp = compareToLedger(readFileSync(r.file, 'utf8'), ledgerNow.rows);
    if (cmp.match || (ledgerNow.sha256 || null) === r.ledger.sha256) break;
    say('the ledger changed while the file was written; regenerating');
  }
  printSummary(r, say);
  say('wrote ' + OUT_REL + ' (' + r.bytes + ' bytes, ' + r.md.split('\n').length + ' lines)');
  say('ledger counts in the file: ' + (cmp.match ? 'match' : 'DIFFER: ' + cmp.diffs.join('; ')) + ' (' + Object.keys(cmp.want).length + ' kinds, ' + ledgerNow.rows.length + ' gaps)');
  const secret = secretHit(readFileSync(r.file, 'utf8'));
  say('secret patterns in the file: ' + (secret ? 'FOUND ' + secret : 'none'));
  // 2. the page
  const b = runChild(['--max-old-space-size=6000', 'web/build.mjs'], { root, timeoutMs: 600_000 });
  const pageLine = b.out.split(/\r?\n/).find((l) => l.startsWith('dist handoff/index.html')) || null;
  const pageFile = path.join(root, 'web', 'dist', 'handoff', 'index.html');
  const pageBytes = existsSync(pageFile) ? statSync(pageFile).size : null;
  const pageFresh = existsSync(pageFile) && statSync(pageFile).mtimeMs >= at0.getTime() - 1000;
  say('node web/build.mjs exit ' + b.exit + ' in ' + b.ms + ' ms; ' + (pageLine || 'no handoff line printed'));
  if (b.exit !== 0) say(b.err.split('\n').slice(0, 20).join('\n'));
  // 3. the tests
  const t = runChild(['--max-old-space-size=6000', '--test', 'test/handoff.test.mjs'], { root, timeoutMs: 300_000 });
  const num = (re) => { const m = re.exec(t.out); return m ? Number(m[1]) : null; };
  // the spec reporter prints "ℹ tests N", the tap reporter "# tests N"
  const tests = { exit: t.exit, ms: t.ms, tests: num(/^(?:# |ℹ )tests (\d+)/m), pass: num(/^(?:# |ℹ )pass (\d+)/m), fail: num(/^(?:# |ℹ )fail (\d+)/m) };
  say('node --test test/handoff.test.mjs exit ' + t.exit + ': tests ' + tests.tests + ', pass ' + tests.pass + ', fail ' + tests.fail + ' in ' + t.ms + ' ms');
  if (t.exit !== 0) say(t.out.split('\n').filter((l) => /not ok|Error|assert/i.test(l)).slice(0, 20).join('\n'));

  const barMet = r.missing.length === 0 && b.exit === 0 && pageFresh && pageBytes > 0 && tests.exit === 0 && tests.fail === 0 && cmp.match && !secret;
  const checks = r.commands.reduce((a, c) => a + c.checks.length, 0);
  const v = {
    at: new Date().toISOString(), startedAt: at0.toISOString(), command: 'node tools/handoff.mjs --bar', node: process.version, author: AUTHOR,
    isTheBar: true, barMet,
    bar: 'missing commands 0, the /handoff page builds (node web/build.mjs exit 0 and dist/handoff/index.html written by this run), node --test test/handoff.test.mjs passes, and the file names the undone work with the same counts by kind as state/self/gaps.jsonl',
    split: { development: 'test/handoff.test.mjs plants a ledger, task query output and a tree under a temp directory', heldOut: 'the real tree: the real ledger, the real schtasks /Query output, the real decision files, read once at generation', note: 'no model, no network; nothing is fitted, so the split names what the tests saw against what the bar run read' },
    file: OUT_REL, fileBytes: r.bytes, generatedAt: r.generatedAt, sections: r.sections,
    commands: { listed: r.commands.length, checks, missing: r.missing.length, missingNames: r.missing.map((c) => ({ line: c.line.slice(0, 200), needs: c.missing })) },
    ledger: { file: r.ledger.file, gaps: r.ledger.parsed, sha256: r.ledger.sha256, byKind: r.ledger.byKind, withTrial: r.ledger.withTrial, countsMatch: cmp.match, diffs: cmp.diffs, regenerations: attempts },
    tasks: Object.fromEntries(Object.values(r.tasks).map((x) => [x.name, { registered: x.registered, status: x.status ?? null, nextRun: x.nextRun ?? null, lastRun: x.lastRun ?? null, lastResult: x.lastResult ?? null, taskToRun: x.taskToRun ?? null }])),
    taskMatchesTool: r.taskMatch, stopPresent: r.stop,
    decisions: { files: r.decisions.files, total: r.decisions.total, bySourceEvidence: r.decisions.list, walls: r.decisions.walls, brief: r.decisions.brief, resumed: r.decisions.resumed },
    chain: r.chain, secretReplacements: r.redactions, secretInFile: secret,
    page: { buildExit: b.exit, buildMs: b.ms, line: pageLine, path: 'web/dist/handoff/index.html', bytes: pageBytes, writtenByThisRun: pageFresh },
    tests, gateLine: r.gateLine, gateAt: r.gateAt,
  };
  v.statement = 'node tools/handoff.mjs wrote ' + OUT_REL + ' (' + r.bytes + ' bytes) at ' + r.generatedAt + ' with ' + r.sections.length + ' sections; it lists '
    + r.commands.length + ' commands carrying ' + checks + ' existence checks and ' + r.missing.length + ' are missing' + (r.missing.length ? ' (' + r.missing.map((c) => c.missing.join(' + ')).join('; ') + ')' : '')
    + '. The undone-work section names ' + ledgerNow.rows.length + ' gaps and its counts by kind ' + (cmp.match ? 'match' : 'do not match') + ' the ledger (' + kindsInOrder(r.ledger.byKind).map((k) => k + ' ' + r.ledger.byKind[k]).join(', ') + '). '
    + 'The tasks read: ' + Object.values(r.tasks).map((x) => x.name + ' ' + (x.registered ? x.status + ', next run ' + x.nextRun : 'not registered')).join('; ') + '. '
    + 'node web/build.mjs exited ' + b.exit + ' and ' + (pageFresh ? 'wrote' : 'did NOT write') + ' web/dist/handoff/index.html (' + pageBytes + ' bytes); node --test test/handoff.test.mjs exited ' + t.exit + ' with ' + tests.pass + ' pass and ' + tests.fail + ' fail. '
    + 'The secret filter replaced ' + r.redactions + ' pattern hit(s) in carried text and the written file holds ' + (secret ? 'a secret pattern' : 'none') + '. Bar ' + (barMet ? 'met' : 'missed') + '.';
  if (write) {
    const vf = path.join(root, ...VERDICT_REL.split('/'));
    mkdirSync(path.dirname(vf), { recursive: true });
    writeFileSync(vf, JSON.stringify(v, null, 2) + '\n');
    say('wrote ' + VERDICT_REL + ': isTheBar true, barMet ' + barMet);
  }
  say('HANDOFF BAR ' + (barMet ? 'MET' : 'MISSED') + ': missing commands ' + r.missing.length + ', page ' + pageBytes + ' bytes (build exit ' + b.exit + '), tests exit ' + t.exit + ', ledger counts ' + (cmp.match ? 'match' : 'differ'));
  return v;
}

// ------------------------------------------------------------------ cli
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const ri = argv.indexOf('--root');
  const root = ri >= 0 && argv[ri + 1] ? path.resolve(argv[ri + 1]) : TREE;
  try {
    if (argv.includes('--bar')) {
      const v = await bar({ root });
      process.exitCode = v.barMet ? 0 : 1;
    } else if (argv.includes('--stdout')) {
      const r = generate({ root });
      process.stdout.write(r.md);
      printSummary(r);
    } else {
      const r = writeHandoff({ root });
      printSummary(r);
      console.log('wrote ' + OUT_REL + ' (' + r.bytes + ' bytes, ' + r.md.split('\n').length + ' lines)');
      process.exitCode = r.missing.length ? 1 : 0;
    }
  } catch (e) {
    console.error('handoff: ' + String(e && e.stack || e));
    process.exitCode = 2;
  }
}
