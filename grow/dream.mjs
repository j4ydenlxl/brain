#!/usr/bin/env node
// grow/dream.mjs: THE DREAM (GROW.md step 7; his NEXT-WEEK.md: "a proposer arm writes tasks just past what the cells
// answer; a solver arm attempts them; the pairs feed step 2"). When the open misses run dry the organism still grows:
// propose writes one DREAM BRIEF per class that has a locked held-out set, the whole prompt of one Claude arm; that arm
// proposes k tasks in the class's shape the organism refuses today and solves each one (its own answer, meeting the
// task's expect); check grades the arm's file offline; collect asks the organism every task once more, drops what it
// answers and what was dreamed before, and appends the rest to grow/dreams.jsonl as misses with route "dream", status
// open, so step 1 reads them like any other miss. It never opens judge/heldout/ (existence by name only),
// judge/control.jsonl or state/grow/baseline/. Success prints ONE JSON line; a failure one stderr line and a non-zero
// exit (2: usage). check that finds errors prints its JSON line and exits 1.
//   node grow/dream.mjs propose [--gen <n>] [--per-class <k>] [--classes a,b] [--root <dir>]
//   node grow/dream.mjs check <file.jsonl> [--root <dir>]
//   node grow/dream.mjs collect [--gen <n>] [--root <dir>] [--knowledge <dir>|none] [--commit [--no-push]]
//       --commit: when rows were kept, git add grow/dreams.jsonl and commit it as jayden with the Opus trailer, then push
//       (a cloud checkout dies with its session: an unpushed dream is lost); the line gains committed and pushed
// Author: Opus 5.5 builder for the Fable 5.1 orchestrator, Day 2 (2026-10-01), his NEXT-WEEK.md step 7.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { REFUSAL_RE, parseJsonl } from './contract.mjs';
import { nextGeneration, conciseDirective, CLASS_RE, CLASS_RULES, DEFAULT_ROOT, redact, TRAILER } from './generation.mjs';
import { expectErrors, expectFailures, qKey } from '../judge/judge.mjs';

export const MAX_ROWS = 12;
export const PER_CLASS = Object.freeze({ dflt: 4, min: 1, max: 12 });
export const DREAMS = 'grow/dreams.jsonl';
export const FILE_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/; // grow/misses.mjs FILE_ID_RE: a dream is marked like a seed miss
export const USAGE = [
  'usage: node grow/dream.mjs <verb> [flags]   (--root <dir>: another tree root)',
  '  propose [--gen <n>] [--per-class <k>] [--classes a,b]   one DREAM BRIEF per class with a held-out set',
  '  check <file.jsonl>                                      grade a dream file offline (the class is its name)',
  '  collect [--gen <n>] [--knowledge <dir>|none]            ask the organism, append the kept rows to ' + DREAMS,
  '          [--commit [--no-push]]                          then commit ' + DREAMS + ' as jayden and push it',
].join('\n');

class Fail extends Error { constructor(line, code = 1) { super(line); this.code = code; } }

// ---- helpers
const posix = (p) => p.split(path.sep).join('/');
const relOf = (root, p) => posix(path.relative(root, p));
const first = (e) => String((e && e.message) || e).split('\n')[0];
const writeJson = (f, o) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, 2) + '\n'); };
const dreamDirOf = (root, n) => path.join(root, 'state', 'grow', 'gen-' + n, 'dream');
/** The non-blank lines of a JSONL text, each [lineNumber, trimmedText]. */
const linesOf = (text) => String(text ?? '').split(/\r?\n/).map((s, i) => [i + 1, s.trim()]).filter(([, s]) => s);
const resolveIn = (root, f) => (path.isAbsolute(f) ? f : fs.existsSync(path.resolve(f)) ? path.resolve(f) : path.resolve(root, f));

// ---- arguments
const VALUE = new Set(['gen', 'per-class', 'classes', 'root', 'knowledge']);
const BOOL = new Set(['commit', 'no-push']);
export function parseArgs(argv) {
  const pos = [], flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') { flags.help = true; continue; }
    if (!a.startsWith('--')) { pos.push(a); continue; }
    const eq = a.indexOf('=');
    const name = eq > 0 ? a.slice(2, eq) : a.slice(2);
    if (BOOL.has(name)) { if (eq > 0) throw new Fail('--' + name + ' takes no value', 2); flags[name] = true; continue; }
    if (!VALUE.has(name)) throw new Fail('unknown flag --' + name + ' (see --help)', 2);
    const v = eq > 0 ? a.slice(eq + 1) : argv[++i];
    if (v === undefined || v === '') throw new Fail('--' + name + ' needs a value', 2);
    flags[name] = v;
  }
  return { verb: pos[0], pos: pos.slice(1), flags };
}
function genOf(flags, root) {
  if (flags.gen === undefined) return nextGeneration(root);
  const n = Number(flags.gen);
  if (!Number.isInteger(n) || n < 1) throw new Fail('--gen is an integer from 1, not ' + flags.gen, 2);
  return n;
}
function perClassOf(flags) {
  if (flags['per-class'] === undefined) return PER_CLASS.dflt;
  const k = Number(flags['per-class']);
  if (!Number.isInteger(k) || k < PER_CLASS.min || k > PER_CLASS.max) throw new Fail('--per-class is an integer from ' + PER_CLASS.min + ' to ' + PER_CLASS.max + ', not ' + flags['per-class'], 2);
  return k;
}
function classListOf(spec) {
  const cs = String(spec).split(',').map((s) => s.trim()).filter(Boolean);
  if (!cs.length || new Set(cs).size !== cs.length || !cs.every((c) => CLASS_RE.test(c))) throw new Fail('--classes is a comma list of distinct class names (a-z, 0-9, -), not ' + spec, 2);
  return cs;
}

// ---- the dev rows (never the held-out ones)
function devOf(root, cls) {
  const f = path.join(root, 'judge', 'dev', cls + '.jsonl');
  if (!fs.existsSync(f)) return null;
  const text = fs.readFileSync(f, 'utf8');
  return { lines: linesOf(text).map(([, s]) => s), rows: parseJsonl(text) };
}

// ---- the brief
export const CLAUSE_LINES = Object.freeze([
  '`equals`: the whole answer is this text.',
  '`contains`: every listed string appears in the answer.',
  '`containsAny`: at least one listed string appears.',
  '`notContains`: no listed string appears.',
  '`minWords`: at least this many words (runs of non-space characters).',
  '`maxWords`: at most this many words.',
  '`notRefusal`: `true`; the answer is not null and does not start with "nothing in memory matches", "I do not carry that yet" or "I am growing a cell".',
]);

export function dreamBrief({ n, cls, k, devLines, directive }) {
  const out = 'state/grow/gen-' + n + '/dream/' + cls + '.jsonl';
  return [
    '# Generation ' + n + ', DREAM arm, class ' + cls + ': propose and solve ' + k + ' tasks', '',
    'You are the DREAM arm of generation ' + n + ' for class `' + cls + '` (GROW.md step 7: a proposer arm writes tasks just past what the cells answer, a solver arm attempts them, and the pairs feed step 2). You are both halves: propose ' + k + ' tasks, then solve each one. Write exactly ONE file, `' + out + '` (create the directory `state/grow/gen-' + n + '/dream/`), and nowhere else. Run every command from the tree root.', '',
    directive, '',
    '## The class', '',
    ...(CLASS_RULES[cls] ? [CLASS_RULES[cls], ''] : []),
    'The dev rows of `judge/dev/' + cls + '.jsonl`, verbatim:', '',
    '```jsonl', ...devLines, '```', '',
    'The class\'s shape is what those rows share; every task you propose shares it.', '',
    '## What a dreamed task is', '',
    k + ' rows in `' + out + '`, one JSON object a line, each `{ "q": <the task prompt>, "expect": <an expect of the judge\'s clauses only>, "answer": <your own full answer meeting expect> }`:', '',
    '- `q` (the proposer half): in the class\'s shape and JUST PAST what the organism answers today: `node grow/generation.mjs ask "<q>"` must print a `text` that is null or starts with "nothing in memory matches", "I do not carry that yet" or "I am growing a cell". A q the organism answers is dropped at collect. A q never equals a dev row above (trimmed, case-insensitive), and the ' + k + ' rows never repeat a q.',
    '- `expect`: what any right answer to q must hold (a future cell is graded on it), using only these clauses (judge/judge.mjs; text trimmed, compared case-insensitively):',
    ...CLAUSE_LINES.map((l) => '  - ' + l),
    '- `answer` (the solver half): your own best answer to q, in full, for a person; `expectOk(answer, expect)` (judge/judge.mjs) must hold.', '',
    '## Files you may not open', '',
    'Never open, read, list or grep judge/heldout/, judge/control.jsonl or state/grow/baseline/, and do not open the other arms\' directories under state/grow/gen-' + n + '/: a survivor is real only because no arm saw the rows it is graded on.', '',
    '## How you validate', '',
    'Run `node grow/dream.mjs check ' + out + '` until it prints `"ok":true`; fix the file and re-run.', '',
    '## Your answer', '',
    'One line: the JSON line check printed.', '',
  ].join('\n');
}

// ---- propose
function propose(root, flags) {
  const n = genOf(flags, root);
  const k = perClassOf(flags);
  const want = flags.classes !== undefined ? classListOf(flags.classes) : null;
  const directive = conciseDirective(root); // a brief without it is not his order: no brief at all
  const has = (d, c) => fs.existsSync(path.join(root, 'judge', d, c + '.jsonl')); // by name: judge/heldout/ is never opened
  let devClasses = [];
  try { devClasses = fs.readdirSync(path.join(root, 'judge', 'dev')).filter((f) => f.endsWith('.jsonl')).map((f) => f.slice(0, -6)).filter((c) => CLASS_RE.test(c)).sort(); } catch { devClasses = []; }
  const at = new Date().toISOString();
  const classes = [], briefs = [], blocked = [];
  for (const cls of want || devClasses) {
    if (!has('heldout', cls)) { blocked.push('no held-out set: ' + cls + ': a human session adds truth'); continue; }
    if (!has('dev', cls)) { blocked.push('no dev set: ' + cls + ': a human session adds truth'); continue; }
    let dev;
    try { dev = devOf(root, cls); } catch (e) { blocked.push('dev set unreadable: ' + cls + ': ' + first(e)); continue; }
    if (!dev.rows.length) { blocked.push('no dev rows: ' + cls + ': a human session adds truth'); continue; }
    const file = path.join(dreamDirOf(root, n), 'brief-' + cls + '.md');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, dreamBrief({ n, cls, k, devLines: dev.lines, directive }));
    classes.push(cls);
    briefs.push(relOf(root, file));
  }
  return { generation: n, perClass: k, classes, briefs, blocked, at };
}

// ---- check
/**
 * Grade one dream file's text for class cls, offline (no organism).
 * @returns {{ ok: boolean, class: string, rows: number, errors: string[], tasks: { q, expect, answer }[] }}
 */
export function checkText(root, cls, text) {
  const errors = [], tasks = [];
  const lines = linesOf(text);
  let devKeys = null;
  if (!CLASS_RE.test(cls)) errors.push('the class ' + JSON.stringify(cls) + ' (the file name) is not a class name: a-z, 0-9, -');
  else {
    try {
      const dev = devOf(root, cls);
      if (!dev) errors.push('no dev set for class ' + cls + ': judge/dev/' + cls + '.jsonl');
      else devKeys = new Set(dev.rows.map((r) => qKey(r && r.q)));
    } catch (e) { errors.push('judge/dev/' + cls + '.jsonl: ' + first(e)); }
  }
  if (!lines.length) errors.push('no rows: a dream file holds 1 to ' + MAX_ROWS + ' rows');
  if (lines.length > MAX_ROWS) errors.push(lines.length + ' rows, over ' + MAX_ROWS);
  const seen = new Set();
  lines.forEach(([ln, s], i) => {
    const at = 'row ' + (i + 1) + ': ';
    let r;
    try { r = JSON.parse(s); } catch { r = undefined; }
    if (!r || typeof r !== 'object' || Array.isArray(r)) { errors.push(at + 'line ' + ln + ' is not a JSON object'); return; }
    const bad = [];
    if (typeof r.q !== 'string' || !r.q.trim()) bad.push('no q (a non-empty string)');
    else {
      const key = qKey(r.q);
      if (devKeys && devKeys.has(key)) bad.push('q equals a dev row of ' + cls + ': ' + JSON.stringify(r.q));
      if (seen.has(key)) bad.push('q repeats an earlier row: ' + JSON.stringify(r.q));
      seen.add(key);
    }
    const ee = expectErrors(r.expect);
    for (const e of ee) bad.push('expect: ' + e);
    if (typeof r.answer !== 'string' || !r.answer.trim()) bad.push('answer is not a non-empty string');
    else if (!ee.length) {
      const f = expectFailures(r.answer, r.expect);
      if (f.length) bad.push('the answer fails its expect: ' + f.join('; '));
    }
    for (const b of bad) errors.push(at + b);
    if (!bad.length) tasks.push({ q: r.q, expect: r.expect, answer: r.answer });
  });
  return { ok: errors.length === 0, class: cls, rows: lines.length, errors, tasks };
}

function checkVerb(root, fileArg) {
  if (!fileArg) throw new Fail('check needs a file: check <file.jsonl>', 2);
  if (!fileArg.endsWith('.jsonl')) throw new Fail('check reads a .jsonl file (its name is the class), not ' + fileArg, 2);
  const file = resolveIn(root, fileArg);
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch (e) { throw new Fail('check: cannot read ' + posix(file) + ': ' + String(e.code || e.message), 1); }
  const r = checkText(root, path.basename(file, '.jsonl'), text);
  const out = { ok: r.ok, class: r.class, rows: r.rows, errors: r.errors };
  if (!out.ok) { const e = new Fail('check: ' + r.errors.length + ' errors', 1); e.json = out; throw e; }
  return out;
}

// ---- collect
/** The id prefix of a class's dreams in generation n; the class is cut so an id stays inside FILE_ID. */
export function idPrefix(n, cls) {
  const head = 'dream-' + n + '-';
  return head + cls.slice(0, Math.max(1, 64 - head.length - 1 - 6)).replace(/-+$/, '') + '-';
}

function readDreams(file, blocked) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { return { rows: [], text: '' }; }
  const rows = [];
  for (const [ln, s] of linesOf(text)) {
    try { const r = JSON.parse(s); if (r && typeof r === 'object' && !Array.isArray(r)) { rows.push(r); continue; } } catch { /* below */ }
    blocked.push(DREAMS + ' line ' + ln + ' is not a JSON object: left as it is, not read');
  }
  return { rows, text };
}

async function collect(root, flags) {
  const n = genOf(flags, root);
  const dir = dreamDirOf(root, n);
  const at = new Date().toISOString();
  let files = [];
  try { files = fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isFile() && d.name.endsWith('.jsonl')).map((d) => d.name).sort(); } catch { files = []; }
  const blocked = [], dropped = [], byClass = {}, pending = [];
  let proposed = 0;
  for (const name of files) {
    const cls = name.slice(0, -6);
    let text;
    try { text = fs.readFileSync(path.join(dir, name), 'utf8'); } catch (e) {
      byClass[cls] = { proposed: 0, kept: 0 };
      dropped.push({ class: cls, q: null, why: 'cannot read ' + name + ': ' + String(e.code || e.message) });
      continue;
    }
    const r = checkText(root, cls, text);
    proposed += r.rows;
    byClass[cls] = { proposed: r.rows, kept: 0 };
    if (!r.ok) { dropped.push({ class: cls, q: null, why: 'the file fails check (' + r.errors.length + ' errors): ' + r.errors.join('; ') }); continue; }
    for (const t of r.tasks) pending.push({ cls, ...t });
  }
  const dreamsFile = path.join(root, DREAMS);
  const prior = readDreams(dreamsFile, blocked);
  const seen = new Set(prior.rows.filter((r) => typeof r.prompt === 'string').map((r) => qKey(r.prompt)));
  const fresh = [];
  for (const t of pending) {
    const key = qKey(t.q);
    if (seen.has(key)) { dropped.push({ class: t.cls, q: t.q, why: 'already dreamed' }); continue; }
    seen.add(key);
    fresh.push(t);
  }
  // the organism the judge grades, with the baseline's knowledge rule: a task it answers is not past it
  const gotBy = new Map();
  if (fresh.length) {
    try {
      const { runOrganism, PACK } = await import(pathToFileURL(path.join(root, 'judge', 'baseline.mjs')).href);
      const kn = flags.knowledge;
      const knowledge = kn === 'none' ? false : kn ? path.resolve(kn) : (PACK && fs.existsSync(PACK) ? PACK : undefined);
      const run = await runOrganism(fresh.map((t) => ({ q: t.q })), { knowledge });
      const rows = Array.isArray(run) ? run : run && Array.isArray(run.rows) ? run.rows : null;
      if (!rows) throw new Error('runOrganism returned no rows');
      for (const o of rows) if (o && typeof o.q === 'string' && !gotBy.has(qKey(o.q))) gotBy.set(qKey(o.q), o.got);
    } catch (e) { blocked.push('dream: the organism could not be asked: ' + redact(first(e))); }
  }
  const counts = new Map();
  const nextId = (cls) => {
    const pre = idPrefix(n, cls);
    if (!counts.has(pre)) counts.set(pre, prior.rows.filter((r) => typeof r.id === 'string' && r.id.startsWith(pre)).length);
    const i = counts.get(pre) + 1;
    counts.set(pre, i);
    return pre + i;
  };
  const kept = [];
  for (const t of fresh) {
    const got = gotBy.get(qKey(t.q));
    if (typeof got === 'string' && got.trim() && !REFUSAL_RE.test(got.trim())) { dropped.push({ class: t.cls, q: t.q, why: 'the organism answers it' }); continue; }
    kept.push({ id: nextId(t.cls), at: new Date().toISOString(), prompt: t.q, reply: t.answer, route: 'dream', class: t.cls, expect: t.expect, status: 'open', generation: n });
    byClass[t.cls].kept++;
  }
  if (kept.length) {
    fs.mkdirSync(path.dirname(dreamsFile), { recursive: true });
    const lead = prior.text.length && !prior.text.endsWith('\n') ? '\n' : '';
    fs.appendFileSync(dreamsFile, lead + kept.map((r) => JSON.stringify(r)).join('\n') + '\n'); // other rows are never rewritten
  }
  const out = { generation: n, at, proposed, kept: kept.length, byClass, dropped, blocked, file: DREAMS };
  if (flags.commit) Object.assign(out, ship(root, n, kept, blocked, Boolean(flags['no-push'])));
  writeJson(path.join(dir, 'collect.json'), out);
  return out;
}

// ---- ship (--commit): the dreams file alone, as jayden with the Opus trailer, like finish ships grown/
function ship(root, n, kept, blocked, noPush) {
  if (!kept.length) return { committed: 'nothing to commit', pushed: 'skipped: nothing committed' };
  const git = (args) => spawnSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true, timeout: 120000 });
  const line = (r) => redact(String((r.stderr || r.stdout || '')).split(/\r?\n/).map((l) => l.trim()).filter(Boolean).pop() || (r.error ? String(r.error.code || r.error.message) : 'exit ' + r.status));
  const add = git(['add', '--', DREAMS]);
  if (add.status !== 0) { blocked.push('commit: git add exited ' + add.status + ': ' + line(add)); return { committed: false, pushed: 'skipped: nothing committed' }; }
  if (git(['diff', '--cached', '--quiet', '--', DREAMS]).status === 0) return { committed: 'nothing to commit', pushed: 'skipped: nothing committed' };
  const cfg = git(['config', 'user.email']);
  const email = String(cfg.stdout || '').trim() || 'j4ydenlxl@users.noreply.github.com';
  const classes = [...new Set(kept.map((r) => r.class))].sort().join(', ');
  const cm = git(['-c', 'user.name=jayden', '-c', 'user.email=' + email, 'commit', '-m', 'gen ' + n + ': dreamed ' + kept.length + ' tasks (' + classes + ')', '-m', TRAILER, '--', DREAMS]);
  if (cm.status !== 0) { blocked.push('commit: git commit exited ' + cm.status + ': ' + line(cm)); return { committed: false, pushed: 'skipped: nothing committed' }; }
  if (noPush) return { committed: true, pushed: 'skipped (--no-push)' };
  const ps = git(['push']);
  if (ps.status !== 0) blocked.push('push: git push exited ' + ps.status + ': ' + line(ps) + ' (the commit stays)');
  return { committed: true, pushed: ps.status === 0 };
}

// ---- main
export async function main(argv) {
  const { verb, pos, flags } = parseArgs(argv);
  if (flags.help || !verb || verb === 'help') return { usage: true };
  const root = flags.root ? path.resolve(flags.root) : DEFAULT_ROOT;
  if (verb === 'propose') return propose(root, flags);
  if (verb === 'check') return checkVerb(root, pos[0]);
  if (verb === 'collect') return await collect(root, flags);
  throw new Fail('unknown verb ' + verb + ': propose, check or collect (--help)', 2);
}

const same = (x, y) => (process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y);
if (process.argv[1] && same(path.resolve(process.argv[1]), fileURLToPath(import.meta.url))) {
  const done = (code) => process.stdout.write('', () => process.exit(code));
  main(process.argv.slice(2)).then((r) => { process.stdout.write((r.usage ? USAGE : JSON.stringify(r)) + '\n'); done(0); }, (e) => {
    if (e && e.json) { process.stdout.write(JSON.stringify(e.json) + '\n'); done(e.code); return; }
    const coded = e instanceof Error && Number.isInteger(e.code);
    process.stderr.write(redact(coded ? e.message : 'dream failed: ' + ((e && e.stack) || e)).split('\n')[0] + '\n');
    done(coded ? e.code : 1);
  });
}
