#!/usr/bin/env node
// grow/generation.mjs: the generation driver (GROW.md steps 0, 1, 3, 4, 5, 8): status, prepare and finish for the cortex,
// validate <dir> and ask "<q>" for the arms. Children are spawnSync(argv), cwd the root, the environment passed through
// (a token reaches the runner by NAME, never printed). It never opens judge/heldout/, judge/control.jsonl or
// state/grow/baseline/. Success prints ONE JSON line; a failure one stderr line and a non-zero exit.
// Author: board 38 builder, item driver, 2026-09-30.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { validateCell, validateTest, parseJsonl, importsOf, FORBIDDEN, REFUSAL_RE } from './contract.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_ROOT = path.resolve(HERE, '..');
export const CLASS_SRC_RE = /class\s*:\s*['"]([a-z0-9-]+)['"]/;
export const CLASS_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
export const LANE_RE = /^[a-z0-9][a-z0-9_-]{0,31}$/;
export const TOKEN_NAMES = Object.freeze(['VERCEL_TOKEN', 'VERCEL_OIDC_TOKEN', 'GITHUB_TOKEN', 'SUPABASE_SERVICE_KEY', 'SUPABASE_URL']);
export const CLOUD_ENV = Object.freeze(['CLAUDE_CODE_REMOTE', 'GITHUB_ACTIONS', 'VERCEL', 'CI']);
export const DEFAULT_LANES = Object.freeze(['direct', 'baked']);
export const SEED = 'grow/seed-misses.jsonl';
export const SUITES = Object.freeze(['test/grow-sandbox.test.mjs', 'test/grow-store.test.mjs', 'test/judge.test.mjs', 'test/grow-misses.test.mjs', 'test/ask-http.test.mjs']);
export const TRAILER = 'Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>';
const CLI_MARKS = ['growing', 'grown', 'skipped']; // grow/misses.mjs MARKS
const FILE_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/, NUMERIC_ID = /^\d{1,19}$/;
const MIN = 60000;

export const USAGE = [
  'usage: node grow/generation.mjs <verb> [flags]   (--root <dir>: another tree root)',
  '  status [--gen <n>] [--gh none]',
  '  prepare [--gen <n>] [--misses <jsonl>] [--lanes direct,baked] [--parent <lane>]',
  '  validate <candidateDir>',
  '  ask "<q>" [--knowledge <dir>|none]',
  '  finish [--gen <n>] [--lanes a,b] [--dry] [--no-store|promote|build|tests|commit|push] [--sandbox-args "<args>"]',
].join('\n');

class Fail extends Error { constructor(line, code = 1) { super(line); this.code = code; } }

// ---- helpers
const posix = (p) => p.split(path.sep).join('/');
const relOf = (root, p) => posix(path.relative(root, p));
export const redact = (s) => String(s ?? '').replace(/eyJ[A-Za-z0-9_.-]+/g, '<token>');
export const lastLine = (s) => String(s || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean).pop() || '';
const objs = (s) => String(s || '').split(/\r?\n/).flatMap((l) => { try { const j = l.trim().startsWith('{') && JSON.parse(l); return j && typeof j === 'object' ? [j] : []; } catch { return []; } });
export const lastJson = (s) => objs(s).pop() || null;
const readJson = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const writeJson = (f, o) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, 2) + '\n'); };
const jsonl = (rows) => rows.map((r) => JSON.stringify(r)).join('\n') + (rows.length ? '\n' : '');
const genDirOf = (root, n) => path.join(root, 'state', 'grow', 'gen-' + n);
// the one line that says why a child failed: never a stack frame, the Node banner or a bare brace; the first line that
// names an error, a refusal, an expiry or a failure, else the last meaningful one; stderr before stdout
const NOISE = /^(node:internal\/|at |\^|throw err;|Node\.js v|code: '|[{}()\[\];]*$)/;
const said = (s) => String(s || '').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !NOISE.test(l));
const pick = (ls) => ls.find((l) => /\b\w*Error\b:|\bFail\b:|refused|expired|failed|^usage:/i.test(l)) || ls[ls.length - 1] || '';
export const why1 = (r) => redact(pick(said(r.stderr)) || pick(said(r.stdout)) || (r.error ? String(r.error.code || r.error.message) : 'no output'));

function runBin(root, bin, args, { env = process.env, timeout = 10 * MIN } = {}) {
  const r = spawnSync(bin, args, { cwd: root, env, encoding: 'utf8', timeout, windowsHide: true, maxBuffer: 256 * 1024 * 1024 });
  return { code: typeof r.status === 'number' ? r.status : 1, stdout: r.stdout || '', stderr: r.stderr || '', error: r.error || null };
}
export const runNode = (root, script, args = [], o = {}) => runBin(root, process.execPath, [path.join(root, script), ...args], o);

// ---- arguments
const VALUE = new Set(['gen', 'misses', 'lanes', 'parent', 'root', 'knowledge', 'sandbox-args', 'gh']);
const BOOL = new Set(['no-store', 'no-promote', 'no-build', 'no-tests', 'no-commit', 'no-push', 'dry']);
export function parseArgs(argv) {
  const pos = [], flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') { flags.help = true; continue; }
    if (!a.startsWith('--')) { pos.push(a); continue; }
    const eq = a.indexOf('=');
    const name = eq > 0 ? a.slice(2, eq) : a.slice(2);
    if (BOOL.has(name) && eq < 0) { flags[name] = true; continue; }
    if (!VALUE.has(name)) throw new Fail('unknown flag --' + name + ' (see --help)', 2);
    const v = eq > 0 ? a.slice(eq + 1) : argv[++i];
    if (v === undefined || v === '') throw new Fail('--' + name + ' needs a value', 2);
    flags[name] = v;
  }
  return { verb: pos[0], pos: pos.slice(1), flags };
}
export function lanesOf(spec) {
  const lanes = String(spec).split(',').map((s) => s.trim()).filter(Boolean);
  if (!lanes.length || new Set(lanes).size !== lanes.length || !lanes.every((l) => LANE_RE.test(l))) throw new Fail('--lanes is a comma list of distinct lane words, not ' + spec, 2);
  return lanes;
}

// ---- step 0: orient
function jwtExp(t) {
  try { const p = JSON.parse(Buffer.from(String(t).split('.')[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')); return Number.isFinite(p.exp) ? p.exp : null; } catch { return null; }
}
/** Where candidates run and why (grow/sandbox.mjs token order). */
export function backendOf(env = process.env, now = Date.now()) {
  const sb = ': every candidate runs in a Vercel Sandbox (network deny-all)';
  if (env.VERCEL_TOKEN) return { backend: 'vercel', why: 'VERCEL_TOKEN is set' + sb };
  if (env.VERCEL_OIDC_TOKEN) {
    const exp = jwtExp(env.VERCEL_OIDC_TOKEN), iso = exp === null ? null : new Date(exp * 1000).toISOString(), expired = iso !== null && exp * 1000 <= now;
    const when = iso === null ? sb : expired ? ', but it expired at ' + iso + ': the runner exits 3, finish runs no candidate' : ' (valid until ' + iso + ')' + sb;
    return { backend: 'vercel', why: 'VERCEL_OIDC_TOKEN is set' + when, ...(expired ? { expired } : {}) };
  }
  const c = CLOUD_ENV.find((k) => env[k]);
  if (c) return { backend: 'here', why: c + ' is set: this VM runs the candidates (grow/sandbox.mjs --backend here)' };
  return { backend: 'none', why: 'no VERCEL_TOKEN, VERCEL_OIDC_TOKEN, ' + CLOUD_ENV.join(', ') + ': the sandbox refuses on a PC, the generation stops at step 3' };
}
export const tokensOf = (env = process.env) => Object.fromEntries(TOKEN_NAMES.map((k) => [k, Boolean(env[k])]));

/** One past the max of grown/index.json and grown/generations.json. */
export function nextGeneration(root) {
  const ix = readJson(path.join(root, 'grown', 'index.json'));
  let g = ix && Number.isInteger(ix.generation) ? ix.generation : 0;
  const gs = readJson(path.join(root, 'grown', 'generations.json'));
  for (const e of (gs && Array.isArray(gs.generations) ? gs.generations : [])) if (e && Number.isInteger(e.generation) && e.generation > g) g = e.generation;
  return g + 1;
}
function genOf(flags, root) {
  if (flags.gen === undefined) return nextGeneration(root);
  const n = Number(flags.gen);
  if (!Number.isInteger(n) || n < 1) throw new Fail('--gen is an integer from 1, not ' + flags.gen, 2);
  return n;
}
function lockOf(root, env) {
  const r = runNode(root, 'judge/verify.mjs', [], { env, timeout: 2 * MIN });
  const line = redact(lastLine(r.stdout) || lastLine(r.stderr)) || 'judge/verify.mjs printed nothing (exit ' + r.code + ')';
  return { ok: r.code === 0 && /^LOCK OK \d+ files$/.test(line), line };
}

function status(root, flags, env) {
  const ix = readJson(path.join(root, 'grown', 'index.json'));
  const gh = flags.gh === 'none' ? false : runBin(root, flags.gh || 'gh', ['auth', 'status'], { env, timeout: 30000 }).code === 0;
  const lock = lockOf(root, env);
  const pack = runNode(root, 'tools/fetch-pack.mjs', ['--check', '--quiet'], { env }).code === 0 ? 'present' : 'missing';
  const b = backendOf(env);
  return {
    generation: genOf(flags, root), backend: b.backend, why: b.why, tokens: tokensOf(env), gh,
    misses: env.SUPABASE_SERVICE_KEY ? 'supabase' : 'seed', lock: lock.line, lockOk: lock.ok,
    grown: ix && Array.isArray(ix.cells) ? ix.cells.length : 0, pack, at: new Date().toISOString(),
  };
}

// ---- misses
const rowsOf = (s) => objs(s).filter((j) => typeof j.prompt === 'string');
function rewriteLocal(file, ids, status, cell, generation) {
  let rows;
  try { rows = parseJsonl(fs.readFileSync(file, 'utf8')); } catch { return 0; }
  const want = new Set(ids.map(String));
  let n = 0;
  for (const r of rows) if (r && want.has(String(r.id))) {
    Object.assign(r, { status }, cell ? { cell } : {}, generation !== null ? { generation } : {}, status === 'grown' ? { grown_at: new Date().toISOString() } : {});
    n++;
  }
  fs.writeFileSync(file, jsonl(rows));
  return n;
}
/** The gen copy via the misses CLI where it takes the status, else by hand; Supabase via the CLI. */
function markMisses(root, env, { file, ids, status, cell = null, generation = null, supabase = false }, blocked) {
  if (!ids.length) return 0;
  const extra = [...(cell ? ['--cell', cell] : []), ...(generation !== null ? ['--generation', String(generation)] : [])];
  const cliIds = CLI_MARKS.includes(status) ? ids.filter((i) => FILE_ID.test(String(i))) : [];
  let marked = rewriteLocal(file, ids.filter((i) => !cliIds.includes(i)), status, cell, generation);
  if (cliIds.length) {
    const r = runNode(root, 'grow/misses.mjs', ['mark', cliIds.join(','), '--status', status, ...extra, '--file', file], { env });
    const j = lastJson(r.stdout);
    if (r.code === 0 && j && Number.isInteger(j.marked)) marked += j.marked;
    else { blocked.push('misses: mark ' + status + ' in the gen copy: ' + why1(r)); marked += rewriteLocal(file, cliIds, status, cell, generation); }
  }
  const logIds = ids.filter((i) => NUMERIC_ID.test(String(i)));
  if (supabase && env.SUPABASE_SERVICE_KEY && logIds.length) {
    const r = runNode(root, 'grow/misses.mjs', ['mark', logIds.join(','), '--status', status, ...extra], { env });
    if (r.code !== 0) blocked.push('misses: mark ' + status + ' in Supabase (' + logIds.join(',') + '): ' + why1(r));
  }
  return marked;
}

// ---- the brief
export function conciseDirective(root) {
  for (const f of [path.join(root, 'CLAUDE.md'), path.join(DEFAULT_ROOT, 'CLAUDE.md')]) {
    let t;
    try { t = fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n'); } catch { continue; }
    const i = t.indexOf('[SYSTEM DIRECTIVE: CONCISE MODE ENFORCED]');
    if (i < 0) continue;
    const j = t.indexOf('\n\nIF YOU ARE THE ORCHESTRATOR', i);
    return t.slice(i, j > i ? j : undefined).trim();
  }
  throw new Fail('no CONCISE directive in CLAUDE.md: a brief without it is not his order');
}
export const CLASS_RULES = Object.freeze({
  fragment: 'One to three letters and nothing else ("h", "xz"), never a greeting the organism answers ("hi", "yo"). The answer quotes the input in double quotes, says it is not a word and asks for a whole word or a question, in at least 6 words.',
  mash: 'A keyboard mash or row walk of 6 or more letters, no space ("jgkafsjka", "asdfgh"): 5 letters running with no vowel (y counts as one), every letter on the home or the bottom row, 5 neighbouring keys of one row in order, or a pair no word has ("jg", "qw", "zx"), as grow/misses.mjs classes reads it; real words ("strengthened", "property") are not. The answer quotes the input in double quotes and asks for a real word or a question, in at least 6 words.',
  'capital-of': 'The bare shape "the capital of X", "capital of X" or "X capital"; can is false for a prompt opening with what, which or where (the knowledge tier answers those). The answer names the capital in plain letters ("Brasilia").',
  'essay-ocean-salt': 'An essay on why the ocean or the sea is salty, in any phrasing. The answer is an essay of at least 150 words that contains "salt" and at least one of river, rock, mineral or evaporat(ion).',
});
const CLAUSES = {
  equals: '`equals`: the whole answer is this text.',
  contains: '`contains`: every listed string appears in the answer.',
  containsAny: '`containsAny`: at least one listed string appears.',
  notContains: '`notContains`: no listed string appears.',
  minWords: '`minWords`: at least this many words (runs of non-space characters).',
  maxWords: '`maxWords`: at most this many words.',
  notRefusal: '`notRefusal`: not null, and not starting with "nothing in memory matches", "I do not carry that yet" or "I am growing a cell".',
};
const STRATEGY = {
  baked: 'Lane baked: first ask the knowledge tier of the organism, `node grow/generation.mjs ask "<q>"` (prints `{ q, text, route, via, knowledge }`; the organism the judge grades, no model). Ask every dev prompt and the question forms of the class (for a fact class, the "What is ...?" form of each case). Bake what it returns into cell.mjs as data (a lookup table), so the cell carries what the organism already knew; where it knows nothing, use your own knowledge. In brief.md say which answers came from ask.',
  direct: 'Lane direct: write the cell from the dev rows and your own knowledge. `node grow/generation.mjs ask "<q>"` shows what the organism answers today (keep can(q) false there).',
};

export function brief({ root, n, lane, cls, id, dir, prompts, devRel, devLines, devRows, baseline, sibling }) {
  const used = [...new Set(devRows.flatMap((r) => Object.keys((r && r.expect) || {})))].filter((k) => CLAUSES[k]);
  const meta = '{ id: \'' + id + '\', class: \'' + cls + '\', generation: ' + n + ', lane: \'' + lane + '\', grownFrom: ' + JSON.stringify(prompts) + ', version: 1 }';
  const forbid = FORBIDDEN.map(([re, what]) => what + ' `' + re.source + '`').join('; ');
  return [
    '# Generation ' + n + ', lane ' + lane + ', class ' + cls + ': grow one cell', '',
    'You are one ARM of generation ' + n + ' (GROW.md step 2): write ONE candidate cell in `' + dir + '/` (create it; write nowhere else), id `' + id + '`. Run every command from the tree root.',
    ...(sibling ? ['', 'You are the parent lane\'s second arm: a sibling arm writes `' + sibling + '` from this brief; do not open its directory.'] : []), '',
    conciseDirective(root), '',
    '## The cell (grow/CONTRACT.md, in short)', '',
    '`cell.mjs` is one ES module exporting exactly these four names:', '',
    '- `meta`, exactly: `' + meta + '`',
    '- `can(q)`: `true` only for the class\'s shape (below), else `false`; `false` for every prompt the organism already answers (greetings, arithmetic, equations, questions about itself, facts its knowledge tier answers): the judge kills a cell whose can(q) is true on a control prompt.',
    '- `answer(q)`: the text for a person, or `null` (a miss, never a guess); never a refusal (see notRefusal below).',
    '- `examples`: the dev rows below, verbatim, as an array of `{ q, expect }`.', '',
    'Pure, synchronous, self contained, under 512 KB; no import but a relative `./x.mjs` beside it. validateCell refuses the source when a pattern matches ANYWHERE in cell.mjs, comments and strings included: ' + forbid + '. So "process" and "globalThis" may not appear even in an answer text (write "the cycle"). The judge runs can and answer in a cloud sandbox, 2000 ms per row.', '',
    '## The class: ' + cls, '',
    CLASS_RULES[cls] || 'The class grow/misses.mjs classes named; its shape is what the dev rows share.', '',
    'The organism before any cell scored ' + baseline.score + ' on ' + baseline.n + ' held-out rows of this class. Your cell survives only above ' + baseline.score + ' on those rows, other prompts of the class you never see: generalize the shape, not the strings.', '',
    '## The dev rows (' + devRel + ', verbatim: `examples` and examples.jsonl hold exactly these)', '',
    '```jsonl', ...devLines, '```', '',
    'What each expect clause means (judge/judge.mjs; text trimmed, compared case-insensitively):', ...used.map((k) => '- ' + CLAUSES[k]), '',
    '## The lane: ' + lane, '', STRATEGY[lane] || STRATEGY.direct, '',
    '## Files you may not open', '',
    'Never open, read, list or grep judge/heldout/, judge/control.jsonl or state/grow/baseline/: a survivor is real only because no arm saw the rows it is graded on. Do not open the other arms\' directories under state/grow/gen-' + n + '/.', '',
    '## What you write in `' + dir + '/`', '',
    '1. `cell.mjs` as above.',
    '2. `test.mjs`: node:test and node:assert/strict, importing only `./cell.mjs`, at least three tests: every example right by its expect; can false on greetings, questions and arithmetic; the same q twice, the same answer.',
    '3. `examples.jsonl`: the dev rows above, one a line, verbatim.',
    '4. `brief.md`: a copy of this brief, then a section "What I did" (the shape can accepts, where each answer came from).', '',
    '## How you validate', '',
    'Run `node grow/generation.mjs validate ' + dir + '` until it prints `"ok":true`, then `node --test --test-reporter=tap ' + dir + '/test.mjs` until it prints `# fail 0`; fix and re-run both.', '',
    '## Your answer', '',
    'One line: the JSON line validate printed, then ` | `, then the `# pass N` and `# fail N` lines of the test run.', '',
  ].join('\n');
}

export function armId(cls, lane, n, k = 1) {
  const tail = '-' + lane + '-g' + n + (k > 1 ? '-' + k : '');
  return cls.slice(0, Math.max(3, 64 - tail.length)).replace(/-+$/, '') + tail;
}

// ---- step 1: prepare
async function prepare(root, flags, env) {
  const n = genOf(flags, root);
  const lanes = flags.lanes ? lanesOf(flags.lanes) : [...DEFAULT_LANES];
  if (flags.parent !== undefined && !lanes.includes(flags.parent)) throw new Fail('--parent ' + flags.parent + ' is not one of the lanes ' + lanes.join(','), 2);
  const lock = lockOf(root, env);
  if (!lock.ok) throw new Fail(lock.line, 1);
  const genDir = genDirOf(root, n);
  fs.mkdirSync(genDir, { recursive: true });
  const blocked = [];
  const at = new Date().toISOString();
  const p = runNode(root, 'tools/fetch-pack.mjs', ['--quiet'], { env, timeout: 30 * MIN });
  if (p.code !== 0) blocked.push('pack: node tools/fetch-pack.mjs --quiet exited ' + p.code + ': ' + why1(p));
  let source = flags.misses ? 'file' : env.SUPABASE_SERVICE_KEY ? 'supabase' : 'seed';
  const read = (file) => runNode(root, 'grow/misses.mjs', ['read', '--status', 'open', ...(file ? ['--file', file] : [])], { env });
  let r = read(source === 'supabase' ? null : flags.misses || SEED);
  if (r.code !== 0 && source === 'supabase') { blocked.push('misses: the Supabase read failed, the seed stands in: ' + why1(r)); source = 'seed'; r = read(SEED); }
  if (r.code !== 0) throw new Fail('misses: node grow/misses.mjs read exited ' + r.code + ': ' + why1(r));
  const rows = rowsOf(r.stdout);
  // a miss left 'growing' by a run that died before its finish (marked for an earlier generation) is open again here
  const g = runNode(root, 'grow/misses.mjs', ['read', '--status', 'growing', ...(source === 'supabase' ? [] : ['--file', flags.misses || SEED])], { env });
  if (g.code !== 0) blocked.push('misses: the growing read failed, a miss stuck at growing stays there: ' + why1(g));
  else for (const m of rowsOf(g.stdout)) if (m && m.generation !== n && !rows.some((o) => o.id === m.id)) rows.push(m);
  const genMisses = path.join(genDir, 'misses.jsonl');
  fs.writeFileSync(genMisses, jsonl(rows)); // the seed file is never written
  // SENSE proper: a miss the organism answers today (a cell grown since it was logged, or a tier that answers it) is
  // grown, not planned: without this a class whose champion already answers its misses spends arms every hour and
  // its misses reopen forever (generation 1 for real, 2026-10-01 02:00Z: the champions scored 1 and nothing could pass them)
  const answered = new Map(); // miss id -> the cell that answers it, or null when a tier does
  if (rows.length) {
    try {
      const { runOrganism, PACK } = await import(pathToFileURL(path.join(root, 'judge', 'baseline.mjs')).href);
      const k = PACK && fs.existsSync(PACK) ? PACK : undefined;
      const run = await runOrganism(rows.map((m) => ({ q: m.prompt })), { knowledge: k });
      (run && Array.isArray(run.rows) ? run.rows : []).forEach((o, i) => {
        const got = o && typeof o.got === 'string' ? o.got.trim() : '';
        if (got && !REFUSAL_RE.test(got) && rows[i].id !== null && rows[i].id !== undefined) answered.set(rows[i].id, typeof o.via === 'string' && o.via.startsWith('grown:') ? o.via.slice(6) : null);
      });
    } catch (e) { blocked.push('misses: the organism could not be asked, every miss is planned: ' + String((e && e.message) || e).split('\n')[0]); }
  }
  const byCell = new Map();
  for (const [id, cell] of answered) { const key = cell ?? ''; if (!byCell.has(key)) byCell.set(key, []); byCell.get(key).push(id); }
  for (const [key, ids] of byCell) markMisses(root, env, { file: genMisses, ids, status: 'grown', cell: key || null, generation: n, supabase: source === 'supabase' }, blocked);
  const c = runNode(root, 'grow/misses.mjs', ['classes', '--file', genMisses], { env });
  if (c.code !== 0) throw new Fail('misses: node grow/misses.mjs classes exited ' + c.code + ': ' + why1(c));
  const byClass = new Map();
  for (const l of rowsOf(c.stdout)) if (l.class && !answered.has(l.id)) { if (!byClass.has(l.class)) byClass.set(l.class, []); byClass.get(l.class).push(l); }
  const kept = [];
  let skipped = 0;
  for (const [cls, ls] of byClass) {
    const has = (d) => CLASS_RE.test(cls) && fs.existsSync(path.join(root, 'judge', d, cls + '.jsonl')); // by name: never opened
    const b = has('heldout') && has('dev') ? runNode(root, 'judge/baseline.mjs', [cls], { env, timeout: 20 * MIN }) : null;
    const j = b && lastJson(b.stdout);
    if (!has('heldout')) blocked.push('no held-out set: ' + cls + ': a human session adds truth');
    else if (!has('dev')) blocked.push('no dev set: ' + cls + ': a human session adds truth');
    else if (b.code !== 0 || !j || typeof j.score !== 'number' || !Number.isInteger(j.n)) blocked.push('baseline: ' + cls + ': exit ' + b.code + ': ' + why1(b));
    else {
      const devRel = 'judge/dev/' + cls + '.jsonl';
      const devLines = fs.readFileSync(path.join(root, devRel), 'utf8').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
      kept.push({ cls, ls, devRel, devLines, devRows: parseJsonl(devLines.join('\n')), baseline: { score: j.score, n: j.n } });
      continue;
    }
    skipped += ls.length;
  }
  const ids = kept.flatMap((k) => k.ls.map((l) => l.id)).filter((x) => x !== null && x !== undefined);
  const growing = markMisses(root, env, { file: genMisses, ids, status: 'growing', generation: n, supabase: source === 'supabase' }, blocked);
  let parent = flags.parent ?? null; // else the last tournament's winner
  if (parent === null) {
    const gs = readJson(path.join(root, 'grown', 'generations.json'));
    const last = gs && Array.isArray(gs.generations) ? gs.generations[gs.generations.length - 1] : null;
    if (last && lanes.includes(last.parent)) parent = last.parent;
  }
  const classes = [], briefs = [];
  for (const k of kept) {
    const prompts = k.ls.map((l) => l.prompt);
    const arms = [];
    for (const lane of lanes) for (let i = 1; i <= (lane === parent ? 2 : 1); i++) {
      const id = armId(k.cls, lane, n, i);
      const dir = 'state/grow/gen-' + n + '/' + lane + '/' + id;
      const file = path.join(genDir, lane, 'brief-' + k.cls + (i > 1 ? '-' + i : '') + '.md');
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, brief({ root, n, lane, cls: k.cls, id, dir, prompts, devRel: k.devRel, devLines: k.devLines, devRows: k.devRows, baseline: k.baseline, sibling: i > 1 ? armId(k.cls, lane, n, 1) : null }));
      arms.push({ lane, dir, id, brief: relOf(root, file) });
      briefs.push(relOf(root, file));
    }
    classes.push({ class: k.cls, misses: k.ls.map((l) => l.id), prompts, dev: k.devRel, devRows: k.devRows.length, baseline: k.baseline, arms });
  }
  writeJson(path.join(genDir, 'plan.json'), { generation: n, at, lanes, parent, missSource: source, classes, blocked });
  fs.writeFileSync(path.join(genDir, 'blocked.txt'), blocked.map((l) => l + '\n').join(''));
  return {
    generation: n, classes: classes.length, briefs: briefs.length, misses: { read: rows.length, answered: answered.size, growing, skipped, source },
    baseline: Object.fromEntries(kept.map((k) => [k.cls, k.baseline.score])), parent, plan: relOf(root, path.join(genDir, 'plan.json')), blocked, at,
  };
}

// ---- validate
export const classOfSource = (src) => { const m = CLASS_SRC_RE.exec(String(src ?? '')); return m ? m[1] : null; };
const readText = (f) => { try { return fs.readFileSync(f, 'utf8'); } catch { return null; } };

async function validate(root, dirArg) {
  if (!dirArg) throw new Fail('validate needs a candidate directory', 2);
  const dir = path.resolve(dirArg);
  const errors = [];
  const source = readText(path.join(dir, 'cell.mjs'));
  let mod = null;
  if (source === null) errors.push('no cell.mjs in ' + posix(dir));
  else {
    const first = validateCell(source, null); // a source that fails is never imported
    if (!first.ok) errors.push(...first.errors, 'cell.mjs not imported: the source fails');
    else {
      try { mod = await import(pathToFileURL(path.join(dir, 'cell.mjs')).href + '?v=' + Date.now()); } catch (e) { errors.push('importing cell.mjs failed: ' + String((e && e.message) || e).split('\n')[0]); }
      if (mod) errors.push(...validateCell(source, mod).errors);
    }
  }
  const testSrc = readText(path.join(dir, 'test.mjs'));
  if (testSrc === null) errors.push('no test.mjs');
  else errors.push(...validateTest(testSrc).errors); // the contract's own rule: the probe applies the same one in the sandbox
  let ex = [];
  try { ex = parseJsonl(fs.readFileSync(path.join(dir, 'examples.jsonl'), 'utf8')); } catch (e) { errors.push('examples.jsonl: ' + (e.code === 'ENOENT' ? 'missing' : e.message)); }
  ex.forEach((r, i) => { if (!r || typeof r.q !== 'string' || !r.q.length || !r.expect || typeof r.expect !== 'object') errors.push('examples.jsonl row ' + (i + 1) + ' has no q and expect'); });
  const fileQs = new Set(ex.map((r) => r && r.q));
  if (mod && Array.isArray(mod.examples)) {
    const modQs = new Set(mod.examples.map((r) => r && r.q));
    const a = [...fileQs].filter((q) => !modQs.has(q)), b = [...modQs].filter((q) => !fileQs.has(q));
    if (a.length) errors.push('only in examples.jsonl: ' + JSON.stringify(a.slice(0, 5)));
    if (b.length) errors.push('only in examples: ' + JSON.stringify(b.slice(0, 5)));
  }
  const meta = mod && mod.meta && typeof mod.meta === 'object' ? mod.meta : {};
  const cls = typeof meta.class === 'string' ? meta.class : classOfSource(source);
  // inside state/grow/gen-<n>/<lane>/<id>/
  const g = /^gen-(\d+)$/.exec(path.basename(path.dirname(path.dirname(dir))));
  if (g && mod) {
    const lane = path.basename(path.dirname(dir));
    if (meta.id !== path.basename(dir)) errors.push('meta.id ' + JSON.stringify(meta.id) + ' is not ' + path.basename(dir));
    if (meta.generation !== Number(g[1])) errors.push('meta.generation ' + JSON.stringify(meta.generation) + ' is not ' + g[1]);
    if (meta.lane !== lane) errors.push('meta.lane ' + JSON.stringify(meta.lane) + ' is not ' + lane);
    const nTests = testSrc === null ? 0 : (testSrc.match(/\b(?:test|it)\s*\(/g) || []).length;
    if (nTests < 3) errors.push('test.mjs declares ' + nTests + ' tests, not 3');
    const dev = readText(path.join(root, 'judge', 'dev', String(cls) + '.jsonl'));
    const missing = dev === null || !CLASS_RE.test(String(cls)) ? [] : parseJsonl(dev).map((r) => r.q).filter((q) => !fileQs.has(q));
    if (missing.length) errors.push('dev rows missing: ' + JSON.stringify(missing.slice(0, 5)));
  }
  const out = { ok: errors.length === 0, errors, id: meta.id ?? null, class: cls ?? null, generation: meta.generation ?? null, lane: meta.lane ?? null, examples: ex.length };
  if (!out.ok) { const e = new Fail('validate: ' + errors.length + ' errors', 1); e.json = out; throw e; }
  return out;
}

// ---- ask
async function askVerb(root, flags, q) {
  if (!q) throw new Fail('ask needs a prompt: ask "<q>"', 2);
  // the organism the baseline grades, with its knowledge rule
  const { runOrganism, PACK } = await import(pathToFileURL(path.join(root, 'judge', 'baseline.mjs')).href);
  const kn = flags.knowledge;
  const k = kn === 'none' ? false : kn ? path.resolve(kn) : (PACK && fs.existsSync(PACK) ? PACK : undefined);
  const run = await runOrganism([{ q }], { knowledge: k });
  const row = run.rows[0] || {};
  return { q, text: row.got ?? null, route: row.route ?? null, via: row.via ?? null, knowledge: k === false ? 'none' : k ? relOf(root, k) : 'act/prompt.mjs KNOWLEDGE_DIR (default)' };
}

// ---- steps 3 to 8: finish
/** Dirs holding a cell.mjs; the class off the source, then brief.md, then the plan. */
export function candidates(root, n, lanes, plan = null) {
  const byId = new Map();
  for (const c of (plan && Array.isArray(plan.classes) ? plan.classes : [])) for (const a of c.arms || []) byId.set(a.id, c.class);
  const out = [];
  for (const lane of lanes) {
    const laneDir = path.join(genDirOf(root, n), lane);
    let ids = [];
    try { ids = fs.readdirSync(laneDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort(); } catch { ids = []; }
    for (const id of ids) {
      const dir = path.join(laneDir, id);
      const src = readText(path.join(dir, 'cell.mjs'));
      if (src === null) continue;
      let cls = classOfSource(src), from = 'cell.mjs';
      if (!cls) { cls = classOfSource(readText(path.join(dir, 'brief.md'))); from = 'brief.md'; }
      if (!cls && byId.has(id)) { cls = byId.get(id); from = 'plan.json'; }
      out.push({ lane, id, dir, rel: relOf(root, dir), class: cls, classFrom: cls ? from : null });
    }
  }
  return out;
}
/** The tournament: survivors, then candidates, then name; the first is the parent. */
export const rankLanes = (stats) => Object.entries(stats).sort((a, b) => (b[1].survivors - a[1].survivors) || (b[1].candidates - a[1].candidates) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)).map((e) => e[0]);
export const commitMessage = (n, survivors, total, parent) => 'gen ' + n + ': ' + survivors + ' of ' + total + ' survived, parent ' + parent;

function finish(root, flags, env) {
  const n = genOf(flags, root);
  const genDir = genDirOf(root, n);
  const plan = readJson(path.join(genDir, 'plan.json'));
  const lanes = flags.lanes ? lanesOf(flags.lanes) : plan && Array.isArray(plan.lanes) && plan.lanes.length ? plan.lanes : [...DEFAULT_LANES];
  const cands = candidates(root, n, lanes, plan);
  const b = backendOf(env);
  const extra = flags['sandbox-args'] ? String(flags['sandbox-args']).split(/\s+/).filter(Boolean) : [];
  const sbArgs = (c) => ['run', c.rel, '--heldout', 'judge/heldout/' + c.class + '.jsonl', '--control', 'judge/control.jsonl', '--out', c.rel + '/result.json', ...(b.backend === 'here' ? ['--backend', 'here'] : []), ...extra];
  const laneArgs = (verb, lane) => [verb, String(n), lane, '--dir', 'state/grow/gen-' + n + '/' + lane];
  const withC = lanes.filter((l) => cands.some((c) => c.lane === l));
  const clsList = [...new Set(cands.map((c) => c.class).filter(Boolean))];
  if (flags.dry) {
    const would = [...clsList.map((k) => 'node judge/baseline.mjs ' + k), ...cands.filter((c) => c.class).flatMap((c) => ['node grow/sandbox.mjs ' + sbArgs(c).join(' '), 'node judge/select.mjs ' + c.rel])];
    for (const l of withC) for (const v of ['shard', 'promote']) if (!flags['no-' + (v === 'shard' ? 'store' : v)]) would.push('node grow/store.mjs ' + laneArgs(v, l).join(' '));
    if (!flags['no-build']) would.push('node web/build.mjs');
    if (!flags['no-tests']) would.push('node --test --test-reporter=tap ' + SUITES.join(' '));
    if (!flags['no-commit']) would.push('git add -- grown/ web/dist/', 'git commit -m "' + commitMessage(n, '<survivors>', '<candidates>', '<parent>') + '" -m "' + TRAILER + '" -- grown/ web/dist/', ...(flags['no-push'] ? [] : ['git push']));
    return { dry: true, generation: n, backend: b.backend, why: b.why, candidates: cands.map(({ dir, rel, ...c }) => ({ dir: rel, ...c })), would, at: new Date().toISOString() };
  }
  const lock = lockOf(root, env);
  if (!lock.ok) throw new Fail(lock.line, 1);
  const blockedFile = path.join(genDir, 'blocked.txt');
  // prepare's lines carry forward (plan.json); a previous finish attempt's lines never do (they would report a run that is not this one)
  const before = plan && Array.isArray(plan.blocked) ? plan.blocked.map(String) : (readText(blockedFile) || '').split(/\r?\n/).filter(Boolean);
  const blocked = [];
  const stats = Object.fromEntries(lanes.map((l) => [l, { candidates: cands.filter((c) => c.lane === l).length, survivors: 0 }]));
  const total = cands.length, live = b.backend !== 'none' && !b.expired;
  if (!total) blocked.push('no candidate: no arm wrote a cell.mjs under state/grow/gen-' + n + '/<lane>/<id>/');
  else if (!live) blocked.push('sandbox: ' + b.why);
  const ran = total > 0 && live;
  // the baseline again NOW (grown/ untouched until promote): select refuses one of other organism code
  const baseline = {};
  for (const k of ran ? clsList : []) {
    const r = runNode(root, 'judge/baseline.mjs', [k], { env, timeout: 20 * MIN }), j = lastJson(r.stdout);
    if (r.code === 0 && j && typeof j.score === 'number') baseline[k] = j.score;
    else blocked.push('baseline: ' + k + ': exit ' + r.code + ': ' + why1(r) + ': its candidates are not judged');
  }
  // steps 3 and 4, every candidate before anything touches grown/. A runner or select exit that is not 0 (a token
  // gone 3, a PC 4, the sandbox API 5, a crash) is INFRASTRUCTURE: that candidate is unrun, not a loser, and a
  // tournament with an unrun candidate is void (nothing recorded, the generation runs again); the other candidates
  // still run so their verdicts are on disk. A class whose baseline failed is withdrawn (its candidates neither run
  // nor count; its misses reopen); a candidate without a class is the arm's fault and is not in the tournament.
  for (const c of cands) {
    c.survived = c.judged = c.unrun = false;
    if (!ran || (c.class && !(c.class in baseline))) continue;
    if (!c.class) { blocked.push('sandbox: ' + c.rel + ': no class in cell.mjs, brief.md or plan.json'); continue; }
    const s = runNode(root, 'grow/sandbox.mjs', sbArgs(c), { env, timeout: 20 * MIN });
    if (s.code !== 0) { blocked.push('sandbox: ' + c.id + ': exit ' + s.code + ': ' + why1(s)); c.unrun = true; continue; }
    const v = runNode(root, 'judge/select.mjs', [c.rel], { env, timeout: 5 * MIN });
    const verdict = v.code === 0 ? readJson(path.join(c.dir, 'verdict.json')) : null; // exit 0: select wrote it just now
    if (!verdict) { blocked.push('select: ' + c.id + ': exit ' + v.code + ': ' + why1(v)); c.unrun = true; continue; }
    c.judged = true;
    c.survived = verdict.survived === true;
    if (c.survived) stats[c.lane].survivors++;
  }
  const survivors = cands.filter((c) => c.survived).length, judged = cands.filter((c) => c.judged).length, unrun = cands.filter((c) => c.unrun).length;
  // no verdict at all, or a candidate that did not run, is a broken run, not a tournament: nothing recorded, the generation runs again
  let block = !total ? 'no candidate' : !live ? (b.expired ? 'the sandbox token expired' : 'no sandbox backend') : !judged ? 'no candidate was judged' : unrun ? unrun + ' of ' + total + ' candidates did not run' : null;
  if (ran && unrun) blocked.push('void: ' + unrun + ' of ' + total + ' candidates did not run (a sandbox or select exit that is not 0 is infrastructure, not a loss): generation ' + n + ' is not recorded and runs again');
  else if (ran && !judged) blocked.push('void: no candidate was judged: generation ' + n + ' is not recorded and runs again');
  const parent = block ? null : rankLanes(stats)[0] ?? null;
  // step 5: per lane, shard (the archive) then promote (survivors into grown/, one cell per class: the champion);
  // the parent lane goes first, so it wins a tie for a class (grow/store.mjs promote)
  const store = block ? { all: 'skipped: ' + block } : {};
  const promotedIds = [], archived = [], retired = [];
  let promoted = flags['no-promote'] ? 'skipped (--no-promote)' : 0, promoteFailed = false;
  for (const lane of block ? [] : rankLanes(stats).filter((l) => withC.includes(l))) {
    if (flags['no-store']) store[lane] = 'skipped (--no-store)';
    else {
      const r = runNode(root, 'grow/store.mjs', laneArgs('shard', lane), { env, timeout: 20 * MIN });
      store[lane] = r.code === 0 ? (lastJson(r.stdout) || lastLine(r.stdout)) : 'failed: exit ' + r.code + ': ' + why1(r);
      if (r.code !== 0) blocked.push('store: shard ' + lane + ': exit ' + r.code + ': ' + why1(r));
    }
    if (flags['no-promote'] || promoteFailed) continue;
    const r = runNode(root, 'grow/store.mjs', laneArgs('promote', lane), { env });
    const j = lastJson(r.stdout);
    if (r.code !== 0 || !j) { promoteFailed = true; promoted = false; blocked.push('promote: ' + lane + ': exit ' + r.code + ': ' + why1(r)); continue; }
    for (const id of Array.isArray(j.promoted) ? j.promoted : []) promotedIds.push(String(id));
    for (const a of Array.isArray(j.archived) ? j.archived : []) archived.push({ lane, ...a });
    for (const id of Array.isArray(j.retired) ? j.retired : []) retired.push(String(id));
    promoted = promotedIds.length;
  }
  // the ids grown/ holds after step 5: a survivor among them is grown for its misses whether this run or an earlier, half-landed one promoted it
  const heldIds = new Set((() => { const ix = readJson(path.join(root, 'grown', 'index.json')); return ix && Array.isArray(ix.cells) ? ix.cells.map((c) => String(c.id)) : []; })());
  const record = !block && !promoteFailed;
  if (promoteFailed) block = 'the promote failed';
  let built = block ? 'skipped: ' + block : 'skipped (--no-build)';
  if (!block && !flags['no-build']) {
    const r = runNode(root, 'web/build.mjs', [], { env, timeout: 20 * MIN });
    built = r.code === 0;
    if (!built) { block = 'the build failed'; blocked.push('build: node web/build.mjs exited ' + r.code + ': ' + why1(r)); }
  }
  // the tournament, in grown/generations.json (prepare reads the parent from it)
  const planMisses = plan && Array.isArray(plan.classes) ? plan.classes.flatMap((c) => c.misses || []) : [];
  if (record) {
    const gFile = path.join(root, 'grown', 'generations.json');
    const gs = readJson(gFile);
    const list = (gs && Array.isArray(gs.generations) ? gs.generations : []).filter((e) => !(e && e.generation === n));
    writeJson(gFile, { generations: [...list, { generation: n, at: new Date().toISOString(), lanes: stats, parent, misses: planMisses }] });
  }
  // step 8: the suites, the commit, the push
  let tests = block ? 'skipped: ' + block : 'skipped (--no-tests)';
  if (!block && !flags['no-tests']) {
    const r = runBin(root, process.execPath, ['--test', '--test-reporter=tap', ...SUITES], { env, timeout: 30 * MIN });
    const num = (re) => { const m = re.exec(r.stdout); return m ? Number(m[1]) : null; };
    tests = { exitCode: r.code, pass: num(/^# pass (\d+)/m), fail: num(/^# fail (\d+)/m) };
    if (r.code !== 0) { block = 'the suites failed'; blocked.push('tests: exit ' + r.code + ', # pass ' + tests.pass + ', # fail ' + tests.fail + ': the commit waits'); }
  }
  let committed = block ? 'blocked: ' + block : 'skipped (--no-commit)';
  let pushed = block ? 'skipped: nothing committed' : 'skipped (--no-commit)';
  if (!block && !flags['no-commit']) {
    const git = (args, o) => runBin(root, 'git', args, { env, ...o });
    const add = git(['add', '--', 'grown/', 'web/dist/']);
    pushed = 'skipped: nothing committed';
    if (add.code !== 0) { committed = false; blocked.push('commit: git add exited ' + add.code + ': ' + why1(add)); }
    else if (git(['diff', '--cached', '--quiet', '--', 'grown/', 'web/dist/']).code === 0) committed = 'nothing to commit';
    else {
      const email = lastLine(git(['config', 'user.email']).stdout) || 'j4ydenlxl@users.noreply.github.com';
      const cm = git(['-c', 'user.name=jayden', '-c', 'user.email=' + email, 'commit', '-m', commitMessage(n, survivors, total, parent), '-m', TRAILER, '--', 'grown/', 'web/dist/']);
      committed = cm.code === 0;
      if (!committed) blocked.push('commit: git commit exited ' + cm.code + ': ' + why1(cm));
    }
    if (committed === true && flags['no-push']) pushed = 'skipped (--no-push)';
    else if (committed === true) {
      const ps = git(['push']);
      pushed = ps.code === 0;
      if (!pushed) blocked.push('push: git push exited ' + ps.code + ': ' + why1(ps) + ' (the commit stays)');
    }
  }
  // a promoted survivor's misses are grown (unless blocked), the rest open again
  const genMisses = path.join(genDir, 'misses.jsonl');
  const supabase = Boolean(plan && plan.missSource === 'supabase');
  let grown = 0;
  const grownIds = new Set();
  for (const pc of (plan && Array.isArray(plan.classes) ? plan.classes : [])) {
    const cell = block ? null : cands.find((c) => c.survived && c.class === pc.class && (promotedIds.includes(c.id) || heldIds.has(c.id)));
    if (!cell) continue;
    grown += markMisses(root, env, { file: genMisses, ids: pc.misses || [], status: 'grown', cell: cell.id, generation: n, supabase }, blocked);
    for (const id of pc.misses || []) grownIds.add(id);
  }
  const reopened = markMisses(root, env, { file: genMisses, ids: planMisses.filter((id) => !grownIds.has(id)), status: 'open', generation: n, supabase }, blocked);
  const all = [...new Set([...before, ...blocked])];
  fs.mkdirSync(genDir, { recursive: true });
  fs.writeFileSync(blockedFile, all.map((l) => l + '\n').join(''));
  return {
    generation: n, lanes: stats, candidates: total, survivors, parent, baseline, store, promoted, archived, retired, built, tests, committed, pushed,
    misses: { growing: planMisses.length, grown, reopened }, self: 'not wired', dream: 'not wired', blocked: all, at: new Date().toISOString(),
  };
}

// ---- main
export async function main(argv, env = process.env) {
  const { verb, pos, flags } = parseArgs(argv);
  if (flags.help || !verb || verb === 'help') return { usage: true };
  const root = flags.root ? path.resolve(flags.root) : DEFAULT_ROOT;
  if (verb === 'status') return status(root, flags, env);
  if (verb === 'prepare') return await prepare(root, flags, env);
  if (verb === 'validate') return validate(root, pos[0]);
  if (verb === 'ask') return askVerb(root, flags, pos.join(' '));
  if (verb === 'finish') return finish(root, flags, env);
  throw new Fail('unknown verb ' + verb + ': status, prepare, validate, ask or finish (--help)', 2);
}

const same = (x, y) => (process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y);
if (process.argv[1] && same(path.resolve(process.argv[1]), fileURLToPath(import.meta.url))) {
  const done = (code) => process.stdout.write('', () => process.exit(code));
  main(process.argv.slice(2)).then((r) => { process.stdout.write((r.usage ? USAGE : JSON.stringify(r)) + '\n'); done(0); }, (e) => {
    if (e && e.json) { process.stdout.write(JSON.stringify(e.json) + '\n'); done(e.code); return; }
    process.stderr.write(redact(e instanceof Fail ? e.message : 'generation failed: ' + ((e && e.stack) || e)).split('\n')[0] + '\n');
    done(e instanceof Fail ? e.code : 1);
  });
}
