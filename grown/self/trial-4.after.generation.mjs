#!/usr/bin/env node
// grow/generation.mjs: the generation driver (GROW.md steps 0, 1, 3, 4, 5, 8): status, prepare and finish for the cortex,
// validate <dir> and ask "<q>" for the arms. Children are spawnSync(argv), cwd the root, the environment passed through
// (a token reaches the runner by NAME, never printed). It never opens judge/heldout/, judge/control.jsonl or
// state/grow/baseline/. Success prints ONE JSON line; a failure one stderr line and a non-zero exit.
// Author: board 38 builder, item driver, 2026-09-30.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { validateCell, validateTest, parseJsonl, importsOf, FORBIDDEN, REFUSAL_RE } from './contract.mjs';
import { buildRequest } from './app-slug.mjs'; // Day 2, the builder arm: a build request names the app the organism writes
import { NAME_RE, APP_EXTS, MAX_FILE_BYTES, MAX_APP_BYTES, MIN_TESTS, APP_TEST_IMPORTS } from './probe-app.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_ROOT = path.resolve(HERE, '..');
export const CLASS_SRC_RE = /class\s*:\s*['"]([a-z0-9-]+)['"]/;
export const CLASS_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
export const LANE_RE = /^[a-z0-9][a-z0-9_-]{0,31}$/;
export const TOKEN_NAMES = Object.freeze(['VERCEL_TOKEN', 'VERCEL_OIDC_TOKEN', 'GITHUB_TOKEN', 'SUPABASE_SERVICE_KEY', 'SUPABASE_URL']);
export const CLOUD_ENV = Object.freeze(['CLAUDE_CODE_REMOTE', 'GITHUB_ACTIONS', 'VERCEL', 'CI']);
export const DEFAULT_LANES = Object.freeze(['direct', 'baked']);
export const SEED = 'grow/seed-misses.jsonl';
/** The curriculum (Day 2, the octopus: one seed set per domain, written by a human session) and the dreams (grow/dream.mjs
 *  collect): both are read as open misses on top of the primary source, every generation, until the organism answers them. */
export const CURRICULUM = 'grow/curriculum.jsonl';
export const DREAMS = 'grow/dreams.jsonl';
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
  '  finish [--gen <n>] [--lanes a,b] [--dry] [--rejudge] [--no-store|promote|build|tests|commit|push] [--sandbox-args "<args>"]',
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
const genDirOf = (root, n) => path.join(root, 'work', 'grow', 'gen-' + n);
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

/**
 * The push, for a checkout that may have no upstream (the heartbeat's: a bare git push exits 128 there) and a remote that
 * may have moved (another run landed first): git push, else origin HEAD:<branch>, else ONE rebase of this run's commits
 * onto the remote and the push again. A branch that tracks some other upstream is only ever pushed there. The commit
 * stays either way. Returns { ok: true, how } or { ok: false, why }.
 */
export function pushHead(root, { env = process.env, branch = env.GROW_BRANCH || 'master' } = {}) {
  const git = (args) => runBin(root, 'git', args, { env, timeout: 5 * MIN });
  const said1 = (what, r) => what + ' exited ' + r.code + ': ' + why1(r);
  const up = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  const upstream = up.code === 0 ? lastLine(up.stdout) : null;
  const ref = 'HEAD:refs/heads/' + branch, tries = [];
  if (upstream) {
    const r = git(['push']);
    if (r.code === 0) return { ok: true, how: 'git push' };
    tries.push(said1('git push', r));
    if (upstream !== 'origin/' + branch) return { ok: false, why: tries.join('; ') };
  } else {
    const r = git(['push', 'origin', ref]);
    if (r.code === 0) return { ok: true, how: 'git push origin ' + ref };
    tries.push(said1('git push origin ' + ref, r));
  }
  const pl = git(['pull', '--rebase', '--autostash', 'origin', branch]);
  if (pl.code !== 0) { git(['rebase', '--abort']); tries.push(said1('git pull --rebase origin ' + branch, pl)); return { ok: false, why: tries.join('; ') }; }
  const r = git(['push', 'origin', ref]);
  if (r.code === 0) return { ok: true, how: 'git push origin ' + ref + ' after a rebase onto origin/' + branch };
  tries.push(said1('git push origin ' + ref + ' after the rebase', r));
  return { ok: false, why: tries.join('; ') };
}

// ---- arguments
const VALUE = new Set(['gen', 'misses', 'lanes', 'parent', 'root', 'knowledge', 'sandbox-args', 'gh']);
const BOOL = new Set(['no-store', 'no-promote', 'no-build', 'no-tests', 'no-commit', 'no-push', 'dry', 'rejudge']);
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
/** The builder arm's brief (GROW.md step 2b): the CONCISE directive, the requests, the four files, the rules grow/probe-app.mjs enforces. */
export function buildBrief({ root, n, slug, name, dir, prompts, ids }) {
  const d = dir.replace(/\/$/, '') + '/';
  const lines = [
    conciseDirective(root), '',
    '# Build brief: ' + name + ' (slug ' + slug + ', generation ' + n + ', the builder arm)', '',
    'Requests (misses ' + ids.join(', ') + '):', ...prompts.map((p) => '- ' + JSON.stringify(p)), '',
    'You are the builder arm of the organism (GROW.md step 2b). Write the whole app, native and complete, under `' + d + '`:',
    '- `index.html`: the page, self contained (its own CSS inline), loading `./app.mjs` with one `<script type="module" src="./app.mjs"></script>`;',
    '  no other origin, no http(s):// address, no code of the forbidden list inline. Phone width works (16px gutter, no horizontal scroll).',
    '- `app.mjs`: the logic as exported pure functions plus `mount(doc)` wiring the page, called only when a document exists',
    '  (`if (typeof document !== \'undefined\') mount(document);`). A pure ES module: imports only `./x.mjs` files of the app directory.',
    '  Never: fetch(), XMLHttpRequest, WebSocket, EventSource, sendBeacon, import(), require(), eval(), new Function, process, a node:',
    '  module, child_process, worker_threads, an http(s):// address, document.cookie, indexedDB. localStorage is fine (the viewer\'s browser keeps the data).',
    '- `test.mjs`: at least ' + MIN_TESTS + ' `test(...)` over the exported functions; imports only `./app.mjs` (or another ./x.mjs) and ' + APP_TEST_IMPORTS.join(', ') + '.',
    '  It runs under node 24 inside the sandbox: `node --test test.mjs` must pass with 0 failures.',
    '- `brief.md`: one paragraph: what the app does and how to use it.',
    'Files: top level only, names matching ' + String(NAME_RE) + ', extensions ' + APP_EXTS.join(' ') + ', each under ' + MAX_FILE_BYTES + ' bytes, the app under ' + MAX_APP_BYTES + ' bytes.',
    'The driver already wrote `' + d + 'app.json`: leave it. Never a network call, a key, a token, a file outside `' + d + '`, or an edit to any other file of the repository.',
    'Validate until it passes: `node grow/build.mjs validate ' + d.slice(0, -1) + '` must print {"ok":true}; then `node --test ' + d + 'test.mjs`.',
    'The app must do what the request says, in full. A survivor is served at /apps/' + slug + '/ of the site and the organism answers the request with that URL.',
    'Report: the exact printed line of the validate command and the `# pass` and `# fail` lines of the test run. Nothing else.',
  ];
  return lines.join('\n') + '\n';
}
export const CLASS_RULES = Object.freeze({
  fragment: 'One to three letters and nothing else ("h", "xz"), never a greeting the organism answers ("hi", "yo"). The answer quotes the input in double quotes, says it is not a word and asks for a whole word or a question, in at least 6 words.',
  mash: 'A keyboard mash or row walk of 6 or more letters, no space ("jgkafsjka", "asdfgh"): 5 letters running with no vowel (y counts as one), every letter on the home or the bottom row, 5 neighbouring keys of one row in order, or a pair no word has ("jg", "qw", "zx"), as grow/misses.mjs classes reads it; real words ("strengthened", "property") are not. The answer quotes the input in double quotes and asks for a real word or a question, in at least 6 words.',
  'capital-of': 'The bare shape "the capital of X", "capital of X" or "X capital"; can is false for a prompt opening with what, which or where (the knowledge tier answers those). The answer names the capital in plain letters ("Brasilia").',
  'essay-ocean-salt': 'An essay on why the ocean or the sea is salty, in any phrasing. The answer is an essay of at least 150 words that contains "salt" and at least one of river, rock, mineral or evaporat(ion).',
  // Day 2, the octopus: one arm per domain of "everything", each seeded with a curriculum (judge/dev + judge/heldout)
  math: 'Whole-number theory in words or symbols: n factorial ("what is 6 factorial", "factorial of 5", "7!"), the gcd and the lcm of two numbers (also "greatest common divisor", "least common multiple"), a primality question ("is 97 a prime number", "is 221 prime"), the prime factors of n, the nth fibonacci number (1, 1, 2, 3, 5, 8: the 10th is 55), how many divisors n has, the sum of 1 to n, n choose k. can is false for plain arithmetic ("what is 17 times 23", "2+2", "15% of 80", "square root of 144") and for equations ("solve 3x+2=11"): the exact tier answers those. The answer COMPUTES the number (never a table of typed answers: the held-out rows use other numbers) and states it in at most 60 words with the number in plain digits; a primality answer says "is prime" or "is not prime".',
  data: 'A small list of numbers or fields in the prompt and one statistic or transform on it: the mean or average, the median, the mode, the range, the sum, the largest or smallest, a sort ascending or descending ("sort these numbers descending: 5, 2, 9, 1" answers "9, 5, 2, 1"), the word count of the text after a colon ("count the words in: the cat sat on the mat"), key=value pairs to JSON ("convert to json: name=Ann, age=30" answers {"name":"Ann","age":30}, strings quoted, numbers bare). can is false for arithmetic with no list ("2+2", "what is 17 times 23") and for equations. The answer computes from the numbers in the prompt (the held-out rows use other lists), in at most 60 words, the result in plain digits, one decimal place only when it is not whole ("12.5").',
  science: 'A why, how or what-causes question about the everyday natural world, on these topics and no other: why the sky is blue (scattering), how vaccines work (the immune system, antibodies), what causes the tides (the moon, gravity), why leaves change colour in autumn (chlorophyll), how airplanes fly (wings, lift, pressure), what causes earthquakes (plates, faults), how the heart pumps blood (chambers, contraction), what causes a rainbow (light refracted), why there are seasons (the tilt of the axis), what causes thunder (lightning heats air), why ice floats (density), why stars twinkle (the atmosphere). The held-out rows ask the same topics in other words. can is false for "what is X" and "define X" (the knowledge tier answers those) and for every greeting or question about the organism. The answer is a plain explanation of at least 40 words naming the mechanism in those words.',
  tools: 'A one-line command question for git, bash or curl, in these tasks and no other. git: undo the last commit but keep the changes (git reset --soft HEAD~1), throw away the changes to one file (git checkout -- or git restore), create a branch and switch to it (git checkout -b, git switch -c), the log one line per commit (--oneline), change the last commit message (--amend), stash the changes. bash: list files sorted by size (ls -lS), count the files in a folder (ls | wc -l), find a file by name (find), the size of a folder (du -sh), search a word in all files of a folder (grep -r), show running processes (ps aux). curl: download a file (-O or -o), a JSON POST (-X POST -d with a content-type header), only the response headers (-I), follow redirects (-L). The held-out rows ask the same tasks in other words. can is false when the organism\'s command reader already answers (count the lines of a named file, head or tail of a named file, mkdir, rm, cp, mv: ask it). The answer gives the command on its own line or in a code span, then one sentence on what it does.',
  code: 'A program fragment to write or explain, beyond the native spec reader (which answers "write a javascript function that ..." and "write a python function that ...": not this class). The tasks: a regex (an email address, a US phone number, a URL), a SQL query (select rows by a condition, count per group, the N most recent with order by and limit), a bash script that counts lines (wc -l), a JavaScript or Python class (a stack with push and pop, a queue with enqueue and dequeue, a bank account with deposit and withdraw), a JavaScript function that debounces (setTimeout and clearTimeout) or returns the fibonacci sequence, a CSS rule (centre a div, centre text), the HTML for a button that shows an alert or for a text input and a button, reading a CSV file in Python (import csv), reversing a string in Python ([::-1]), what map or filter does to a JavaScript array. The held-out rows ask the same tasks in other words. can is false for a "write a function that ..." prompt the spec reader answers, for greetings and for arithmetic. The answer is the code in a fenced block, then one or two sentences.',
  planning: 'A day-by-day or week-by-week plan: "plan a N-day trip to <place>", "make a N-day study plan for a <subject> exam", "a N-week plan to run a 5k" (or to learn an instrument, a language, a skill), "give me a N day meal plan", "a study schedule for N days", "a N day workout plan". The number N and the subject come from the prompt (the held-out rows use other N and other subjects); can is true only when the prompt names a count of days or weeks. The answer has a heading per unit, "Day 1" to "Day N" or "Week 1" to "Week N" in exactly those words, each with concrete items naming the place, subject or activity, at least 60 words in all (40 for 2 or 3 days); a meal plan names breakfast, lunch and dinner.',
  writing: 'A short creative piece on a subject from the prompt: a short poem about X (20 to 200 words), a haiku about X (three lines, 5 to 30 words), a limerick about X (five lines, 20 to 80 words), a short story about X (at least 100 words), a thank you note to my Y (at least 30 words, says thank), a slogan for a Z (at most 25 words), a birthday message for my mom or dad (at least 15 words, says birthday and the person). The subject X, Y or Z is any noun phrase (the held-out rows use other subjects) and the piece names it in its own words. can is false for an essay (another class answers essays), for code and for questions. The answer is the piece itself, nothing before it.',
  conversation: 'An advice or recommendation turn the conversation region does not carry: recommend a book, a movie, a podcast; what should I cook, eat, do this weekend; suggest a name for my cat or dog, a hobby, a sport; say something encouraging or nice; a motivational or inspiring quote; I cannot sleep, I am nervous about my exam, a job interview or a first date tomorrow, any tips; making friends somewhere new. can is false for greetings, thanks, goodbyes, "who are you", "what can you do" and every turn act/converse.mjs answers (ask the organism: those are answered today), for facts, arithmetic and definitions. The answer is warm, concrete and specific to the subject in the prompt (it names the thing it recommends): 8 to 80 words for a quote, at least 15 to 30 words otherwise, as the dev rows show.',
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

export function brief({ root, n, lane, cls, id, dir, prompts, devRel, devLines, devRows, baseline, sibling, dreams = [] }) {
  const used = [...new Set(devRows.flatMap((r) => Object.keys((r && r.expect) || {})))].filter((k) => CLAUSES[k]);
  // grownFrom names only the misses that are dev rows: a miss can be a held-out row (the curriculum seeds both), and a cell
  // whose meta quotes one is killed by judge/select.mjs quotedHeldout whatever the arm does (generation 4: code, writing, mash)
  const devKeys = new Set(devRows.map((r) => String((r && r.q) ?? '').trim().toLowerCase()));
  const grownFrom = prompts.filter((p) => devKeys.has(String(p ?? '').trim().toLowerCase()));
  const meta = '{ id: \'' + id + '\', class: \'' + cls + '\', generation: ' + n + ', lane: \'' + lane + '\', grownFrom: ' + JSON.stringify(grownFrom) + ', version: 1 }';
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
    ...(prompts.length > grownFrom.length ? [
      '## The misses this cell grows for', '',
      'Prompts the organism missed, NOT dev rows; one can be a held-out row, so never write one into any file (meta.grownFrom above holds only the dev rows among them, and validate fails on a quoted one): ' + prompts.filter((p) => !grownFrom.includes(p)).join(' | '), '',
    ] : []),
    '## The dev rows (' + devRel + ', verbatim: `examples` and examples.jsonl hold exactly these)', '',
    '```jsonl', ...devLines, '```', '',
    'What each expect clause means (judge/judge.mjs; text trimmed, compared case-insensitively):', ...used.map((k) => '- ' + CLAUSES[k]), '',
    ...(dreams.length ? [
      '## Dreamed tasks (route dream, GROW.md step 7)', '',
      'The dream arm proposed these tasks of the class and solved them; they are misses this cell grows for, NOT dev rows: never add them to `examples` or examples.jsonl (those hold exactly the dev rows). Each line is { q, expect, answer } with the solver\'s own answer:', '',
      '```jsonl', ...dreams.map((d) => JSON.stringify({ q: d.prompt, expect: d.expect ?? null, answer: d.reply ?? null })), '```', '',
    ] : []),
    '## The lane: ' + lane, '', STRATEGY[lane] || STRATEGY.direct, '',
    '## Files you may not open', '',
    'Never open, read, list or grep judge/heldout/, judge/control.jsonl or state/grow/baseline/: a survivor is real only because no arm saw the rows it is graded on. Do not open the other arms\' directories under work/grow/gen-' + n + '/.', '',
    '## What you write in `' + dir + '/`', '',
    '1. `cell.mjs` as above.',
    '2. `test.mjs`: node:test and node:assert/strict, importing only `./cell.mjs`, at least three tests: every example right by its expect; can false on greetings, questions and arithmetic; the same q twice, the same answer.',
    '3. `examples.jsonl`: the dev rows above, one a line, verbatim.',
    '4. `brief.md`: a section "What I did" (the shape can accepts, where each answer came from), in prose; NOT a copy of this brief.', '',
    '## Never quote a prompt you invented', '',
    'The judge kills a cell whose files (cell.mjs, test.mjs, brief.md, every file but examples.jsonl) hold a held-out prompt whole between quotes, whatever the reason; the example prompts in the class text above can be held-out rows. So never copy the class text or this brief into a file. In test.mjs, cell.mjs and brief.md, a prompt between quotes is a dev row verbatim or nothing: build every prompt you invent from parts (\'limerick about \' + subject, \'gcd of \' + a + \' and \' + b, a loop over subjects), never one whole prompt in one pair of quotes, and key a table by topic words, never by a whole question. validate enforces it: it fails on every quoted text the cell\'s can() accepts that is not a dev row.', '',
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
  // Day 2: the curriculum and the dreams are open misses too, read every generation until the organism answers them
  // (SENSE below marks the answered ones grown); their files are never written by the driver
  const extra = { curriculum: 0, dreams: 0 };
  for (const [key, rel] of [['curriculum', CURRICULUM], ['dreams', DREAMS]]) {
    if (!fs.existsSync(path.join(root, rel))) continue;
    const x = runNode(root, 'grow/misses.mjs', ['read', '--status', 'open', '--file', rel], { env });
    if (x.code !== 0) { blocked.push(key + ': node grow/misses.mjs read --file ' + rel + ' exited ' + x.code + ': ' + why1(x)); continue; }
    for (const m of rowsOf(x.stdout)) if (m && m.id !== null && m.id !== undefined && !rows.some((o) => o.id === m.id)) { rows.push(m); extra[key]++; }
  }
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
  // Day 2, the builder arm (GROW.md step 2b): a build request ("make me a todo app") is not a cell class. One build
  // brief per app (slug): the arm writes the app, finish runs it in the sandbox, judges it and serves a survivor. An
  // app grown/apps.json already serves grows its misses here without an arm (the site answers them with its URL).
  const buildRows = byClass.get('build') || [];
  byClass.delete('build');
  const builds = [];
  let buildGrowing = 0;
  if (buildRows.length) {
    const served = new Set((() => { const a = readJson(path.join(root, 'grown', 'apps.json')); return a && Array.isArray(a.apps) ? a.apps.map((x) => x && x.slug) : []; })());
    const bySlug = new Map();
    for (const l of buildRows) {
      const req = buildRequest(l.prompt);
      if (!req) { blocked.push('build: ' + l.id + ': not a build request grow/app-slug.mjs reads: ' + JSON.stringify(String(l.prompt).slice(0, 80))); skipped++; continue; }
      if (!bySlug.has(req.slug)) bySlug.set(req.slug, { ...req, ls: [] });
      bySlug.get(req.slug).ls.push(l);
    }
    for (const [slug, b] of bySlug) {
      const ids = b.ls.map((l) => l.id).filter((x) => x !== null && x !== undefined);
      if (served.has(slug)) { markMisses(root, env, { file: genMisses, ids, status: 'grown', cell: 'app:' + slug, generation: n, supabase: source === 'supabase' }, blocked); continue; }
      const dir = 'work/grow/gen-' + n + '/build/' + slug;
      const file = path.join(genDir, 'build', 'brief-' + slug + '.md');
      const prompts = b.ls.map((l) => l.prompt);
      writeJson(path.join(root, dir, 'app.json'), { slug, name: b.name, prompt: prompts[0], generation: n, misses: ids });
      fs.writeFileSync(file, buildBrief({ root, n, slug, name: b.name, dir, prompts, ids }));
      buildGrowing += markMisses(root, env, { file: genMisses, ids, status: 'growing', generation: n, supabase: source === 'supabase' }, blocked);
      builds.push({ slug, name: b.name, prompt: prompts[0], prompts, misses: ids, dir, brief: relOf(root, file) });
    }
  }
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
  const growing = markMisses(root, env, { file: genMisses, ids, status: 'growing', generation: n, supabase: source === 'supabase' }, blocked) + buildGrowing;
  let parent = flags.parent ?? null; // else the last tournament's winner
  if (parent === null) {
    const gs = readJson(path.join(root, 'grown', 'generations.json'));
    const last = gs && Array.isArray(gs.generations) ? gs.generations[gs.generations.length - 1] : null;
    if (last && lanes.includes(last.parent)) parent = last.parent;
  }
  const classes = [], briefs = [];
  const rowById = new Map(rows.filter((m) => m && m.id !== null && m.id !== undefined).map((m) => [m.id, m]));
  for (const k of kept) {
    const prompts = k.ls.map((l) => l.prompt);
    const dreams = k.ls.map((l) => rowById.get(l.id)).filter((m) => m && m.route === 'dream');
    const arms = [];
    for (const lane of lanes) for (let i = 1; i <= (lane === parent ? 2 : 1); i++) {
      const id = armId(k.cls, lane, n, i);
      const dir = 'work/grow/gen-' + n + '/' + lane + '/' + id;
      const file = path.join(genDir, lane, 'brief-' + k.cls + (i > 1 ? '-' + i : '') + '.md');
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, brief({ root, n, lane, cls: k.cls, id, dir, prompts, devRel: k.devRel, devLines: k.devLines, devRows: k.devRows, baseline: k.baseline, sibling: i > 1 ? armId(k.cls, lane, n, 1) : null, dreams }));
      arms.push({ lane, dir, id, brief: relOf(root, file) });
      briefs.push(relOf(root, file));
    }
    classes.push({ class: k.cls, misses: k.ls.map((l) => l.id), prompts, dreams: dreams.length, dev: k.devRel, devRows: k.devRows.length, baseline: k.baseline, arms });
  }
  writeJson(path.join(genDir, 'plan.json'), { generation: n, at, lanes, parent, missSource: source, classes, builds, blocked });
  fs.writeFileSync(path.join(genDir, 'blocked.txt'), blocked.map((l) => l + '\n').join(''));
  return {
    generation: n, classes: classes.length, briefs: briefs.length, builds: builds.length, misses: { read: rows.length, answered: answered.size, growing, skipped, source, curriculum: extra.curriculum, dreams: extra.dreams },
    baseline: Object.fromEntries(kept.map((k) => [k.cls, k.baseline.score])), parent, plan: relOf(root, path.join(genDir, 'plan.json')), blocked, at,
  };
}

// ---- validate
export const classOfSource = (src) => { const m = CLASS_SRC_RE.exec(String(src ?? '')); return m ? m[1] : null; };
const readText = (f) => { try { return fs.readFileSync(f, 'utf8'); } catch { return null; } };

/**
 * The prompts of the class an arm's own files quote whole: every text between two equal quotes ('', "" or ``), 4 to 300
 * characters, trimmed, one line, that the cell's own can() accepts and that is not a dev row. The judge (judge/select.mjs
 * quotedHeldout) kills a cell whose files (all but examples.jsonl, result.json, verdict.json) quote a held-out prompt the
 * same way; a held-out prompt is a prompt of the class, so a quoted prompt can() accepts is the only place one can sit.
 * The dev rows and a piece of one are exempt. The arm never sees the held-out rows: it builds an invented prompt from parts instead ('limerick about ' + subject).
 */
export function quotedAccepted(dir, can, devQs) {
  const dev = new Set([...devQs].map((q) => String(q ?? '').trim().toLowerCase()));
  const files = [];
  const walk = (d, rel) => {
    let ents = [];
    try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch { ents = []; }
    for (const e of ents) {
      const r = rel ? rel + '/' + e.name : e.name;
      if (e.isDirectory()) { if (e.name !== 'node_modules') walk(path.join(d, e.name), r); }
      else if (e.isFile() && !['result.json', 'verdict.json', 'examples.jsonl'].includes(r)) files.push(r);
    }
  };
  walk(dir, '');
  const devList = [...dev];
  const out = [], seen = new Set();
  for (const rel of files.sort()) {
    const text = readText(path.join(dir, rel));
    if (text === null) continue;
    for (const c of ["'", '"', '`']) {
      const parts = (c === "'" ? text.replace(/(\w)'(\w)/g, '$1\u2019$2') : text).split(c); // an apostrophe inside a word is no quote
      for (let i = 1; i < parts.length - 1; i++) {
        const t = parts[i];
        if (t.length < 4 || t.length > 300 || t !== t.trim() || /[\n\\"`{}[\]]|\$\{/.test(t)) continue; // code, a template, an escape or a span across quotes is no prompt
        const k = t.toLowerCase();
        if (seen.has(k) || devList.some((d) => d.includes(k))) continue; // a dev row or a piece of one: the arm was shown it
        seen.add(k);
        let yes = false;
        try { yes = can(t) === true || can(k) === true; } catch { yes = false; }
        if (yes) out.push({ file: rel, q: t });
      }
    }
  }
  return out;
}

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
  // inside work/grow/gen-<n>/<lane>/<id>/
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
  // the leak the judge kills (19 of 36 in generation 3, 17 of 36 in generation 4): an invented prompt of the class quoted whole
  if (mod && typeof mod.can === 'function') {
    const devQs = new Set(fileQs);
    if (Array.isArray(mod.examples)) for (const r of mod.examples) if (r && typeof r.q === 'string') devQs.add(r.q);
    const quoted = quotedAccepted(dir, mod.can, devQs);
    if (quoted.length) errors.push(quoted.length + ' quoted prompts can() accepts that are not dev rows (the judge kills a cell whose files quote a held-out prompt whole; build each invented prompt from parts, \'limerick about \' + subject, or use a dev row): ' + JSON.stringify(quoted.slice(0, 8).map((x) => x.file + ': ' + x.q)));
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
/** The builder arm's candidates: work/grow/gen-<n>/build/<slug>/ with the driver's app.json (an arm may not invent an app); written says the arm left an index.html. */
export function appCandidates(root, n, plan) {
  const base = path.join(genDirOf(root, n), 'build');
  const fromPlan = plan && Array.isArray(plan.builds) ? plan.builds : [];
  let slugs = [];
  try { slugs = fs.readdirSync(base, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort(); } catch { slugs = []; }
  const out = [];
  for (const slug of slugs) {
    const dir = path.join(base, slug);
    const app = readJson(path.join(dir, 'app.json'));
    if (!app || app.slug !== slug) continue;
    const pb = fromPlan.find((x) => x && x.slug === slug);
    out.push({ slug, name: typeof app.name === 'string' ? app.name : slug, dir, rel: relOf(root, dir), misses: Array.isArray(app.misses) ? app.misses : pb && Array.isArray(pb.misses) ? pb.misses : [], written: fs.existsSync(path.join(dir, 'index.html')) });
  }
  return out;
}
/** The tournament: survivors, then candidates, then name; the first is the parent. */
export const rankLanes = (stats) => Object.entries(stats).sort((a, b) => (b[1].survivors - a[1].survivors) || (b[1].candidates - a[1].candidates) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)).map((e) => e[0]);
/** What SHIP commits: the store, the built site, and the dreams file when it exists (collect writes it after a finish, so the next finish ships it). */
export const shipPaths = (root) => ['grown/', 'web/dist/', ...(fs.existsSync(path.join(root, DREAMS)) ? [DREAMS] : [])];
export const commitMessage = (n, survivors, total, parent, apps = 0, self = null, cortex = null) => 'gen ' + n + ': ' + survivors + ' of ' + total + ' survived, parent ' + parent + (apps ? ', ' + apps + (apps === 1 ? ' app' : ' apps') + ' built' : '') + (self && self.verdict && self.target ? ', self ' + self.verdict + ' ' + self.target : '') + (cortex && cortex.verdict === 'moved' ? ', cortex moved to ' + cortex.pointer : '');

/** GROW.md step 6: the pending self-modification trial judged by this generation's tournament (`node grow/self.mjs judge
 *  --gen n`, a child: self.mjs imports this module, so the import stays one way). Without the file: 'not wired'. `ship`
 *  holds the paths the commit carries beside grown/ (a target that was written back). */
/** The cortex-pointer rule (grow/cortex.mjs): a pending challenger model is judged by the paired arms of this generation's
 *  tournament (`node grow/cortex.mjs judge --gen n`, a child like the self judge). Without the file: 'not wired'. The
 *  ledger is grown/cortex.json, so the commit carries it with grown/. */
export function cortexJudge(root, n, env, blocked) {
  if (!fs.existsSync(path.join(root, 'grow', 'cortex.mjs'))) return 'not wired';
  const r = runNode(root, 'grow/cortex.mjs', ['judge', '--gen', String(n), '--root', root], { env, timeout: 5 * MIN });
  const j = lastJson(r.stdout);
  if (r.code !== 0 || !j || typeof j.verdict !== 'string') { blocked.push('cortex: grow/cortex.mjs judge exited ' + r.code + ': ' + why1(r)); return 'failed'; }
  if (j.verdict === 'none') return 'none';
  return { verdict: j.verdict, pointer: j.pointer, challenger: j.challenger ?? null, pairs: j.pairs ?? null, reason: j.reason };
}

export function selfJudge(root, n, env, blocked) {
  if (!fs.existsSync(path.join(root, 'grow', 'self.mjs'))) return { self: 'not wired', ship: [] };
  const r = runNode(root, 'grow/self.mjs', ['judge', '--gen', String(n), '--root', root], { env, timeout: 5 * MIN });
  const j = lastJson(r.stdout);
  if (r.code !== 0 || !j || typeof j.verdict !== 'string') { blocked.push('self: grow/self.mjs judge exited ' + r.code + ': ' + why1(r)); return { self: 'failed', ship: [] }; }
  const ship = Array.isArray(j.ship) ? j.ship.map(String) : [];
  if (j.verdict === 'none') return { self: 'none', ship };
  return { self: { verdict: j.verdict, target: j.target, baseline: j.baseline ? j.baseline.rate : null, rate: j.judged ? j.judged.rate : null, reason: j.reason }, ship };
}

function finish(root, flags, env) {
  const n = genOf(flags, root);
  const genDir = genDirOf(root, n);
  const plan = readJson(path.join(genDir, 'plan.json'));
  const lanes = flags.lanes ? lanesOf(flags.lanes) : plan && Array.isArray(plan.lanes) && plan.lanes.length ? plan.lanes : [...DEFAULT_LANES];
  const cands = candidates(root, n, lanes, plan);
  const apps = appCandidates(root, n, plan);
  const b = backendOf(env);
  const extra = flags['sandbox-args'] ? String(flags['sandbox-args']).split(/\s+/).filter(Boolean) : [];
  const sbArgs = (c) => ['run', c.rel, '--heldout', 'judge/heldout/' + c.class + '.jsonl', '--control', 'judge/control.jsonl', '--out', c.rel + '/result.json', ...(b.backend === 'here' ? ['--backend', 'here'] : []), ...extra];
  const laneArgs = (verb, lane) => [verb, String(n), lane, '--dir', 'work/grow/gen-' + n + '/' + lane];
  const appArgs = (a) => ['run', a.rel, '--app', '--out', a.rel + '/result.json', ...(b.backend === 'here' ? ['--backend', 'here'] : []), ...extra];
  const promoteArgs = (a) => ['promote', String(n), a.slug, '--dir', 'work/grow/gen-' + n + '/build'];
  const withC = lanes.filter((l) => cands.some((c) => c.lane === l));
  const clsList = [...new Set(cands.map((c) => c.class).filter(Boolean))];
  if (flags.dry) {
    const would = [...clsList.map((k) => 'node judge/baseline.mjs ' + k), ...cands.filter((c) => c.class).flatMap((c) => ['node grow/sandbox.mjs ' + sbArgs(c).join(' '), 'node judge/select.mjs ' + c.rel])];
    for (const a of apps) would.push('node grow/sandbox.mjs ' + appArgs(a).join(' '), 'node grow/build.mjs judge ' + a.rel, ...(flags['no-promote'] ? [] : ['node grow/build.mjs ' + promoteArgs(a).join(' ')]));
    for (const l of withC) for (const v of ['shard', 'promote']) if (!flags['no-' + (v === 'shard' ? 'store' : v)]) would.push('node grow/store.mjs ' + laneArgs(v, l).join(' '));
    if (!flags['no-build']) would.push('node web/build.mjs');
    if (fs.existsSync(path.join(root, 'grow', 'self.mjs'))) would.push('node grow/self.mjs judge --gen ' + n);
    if (fs.existsSync(path.join(root, 'grow', 'cortex.mjs'))) would.push('node grow/cortex.mjs judge --gen ' + n);
    if (!flags['no-tests']) would.push('node --test --test-reporter=tap ' + SUITES.join(' '));
    if (!flags['no-commit']) would.push('git add -- ' + shipPaths(root).join(' '), 'git commit -m "' + commitMessage(n, '<survivors>', '<candidates>', '<parent>') + '" -m "' + TRAILER + '" -- ' + shipPaths(root).join(' '), ...(flags['no-push'] ? [] : ['git push']));
    return { dry: true, generation: n, backend: b.backend, why: b.why, candidates: cands.map(({ dir, rel, ...c }) => ({ dir: rel, ...c })), apps: apps.map(({ dir, rel, ...a }) => ({ dir: rel, ...a })), would, at: new Date().toISOString() };
  }
  const lock = lockOf(root, env);
  if (!lock.ok) throw new Fail(lock.line, 1);
  const blockedFile = path.join(genDir, 'blocked.txt');
  // prepare's lines carry forward (plan.json); a previous finish attempt's lines never do (they would report a run that is not this one)
  const before = plan && Array.isArray(plan.blocked) ? plan.blocked.map(String) : (readText(blockedFile) || '').split(/\r?\n/).filter(Boolean);
  const blocked = [];
  const stats = Object.fromEntries(lanes.map((l) => [l, { candidates: cands.filter((c) => c.lane === l).length, survivors: 0 }]));
  const total = cands.length, live = b.backend !== 'none' && !b.expired;
  if (!total && !apps.length) blocked.push('no candidate: no arm wrote a cell.mjs under work/grow/gen-' + n + '/<lane>/<id>/');
  else if (!live) blocked.push('sandbox: ' + b.why);
  // A finish that selected and promoted, then stopped before its commit (a red suite, a failed build), left grown/ holding
  // THIS generation's survivors: the baseline measured again would be the organism WITH them, and every candidate would
  // lose to itself (generations 1 and 2 were both recorded 0 that way). So a landed selection (selection.json, written
  // below) is reused when grown/ holds one of its survivors and the candidates are byte-equal; when they are not, the
  // selection cannot be run again in this checkout (--rejudge runs it anyway, for a tree whose grown/ was put back).
  const selFile = path.join(genDir, 'selection.json');
  const sigOf = (c) => { try { return createHash('sha256').update(fs.readFileSync(path.join(c.dir, 'cell.mjs'))).digest('hex'); } catch { return null; } };
  const prior = flags.rejudge ? null : readJson(selFile);
  const priorRows = prior && prior.generation === n && Array.isArray(prior.candidates) ? prior.candidates : null;
  const holds = (() => { const ix = readJson(path.join(root, 'grown', 'index.json')); return new Set(ix && Array.isArray(ix.cells) ? ix.cells.filter((c) => c && c.generation === n).map((c) => String(c.id)) : []); })();
  const landed = Boolean(priorRows) && priorRows.some((p) => p.survived && holds.has(String(p.id)));
  const sameCands = landed && priorRows.length === cands.length && cands.every((c) => priorRows.some((p) => p.id === c.id && p.lane === c.lane && p.sha256 && p.sha256 === sigOf(c)));
  const reuse = landed && sameCands;
  let selection = 'fresh';
  if (landed && !sameCands) blocked.push('void: grown/ already holds generation ' + n + ' survivors and the candidates changed since they were selected: the baseline would be measured with them in it (finish --rejudge after grown/ is put back, or a fresh checkout)');
  const ran = total > 0 && live && !(landed && !sameCands);
  // the baseline again NOW (grown/ untouched until promote): select refuses one of other organism code
  const baseline = reuse && prior.baseline && typeof prior.baseline === 'object' ? { ...prior.baseline } : {};
  for (const k of ran && !reuse ? clsList : []) {
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
    if (reuse) {
      const p = priorRows.find((x) => x.id === c.id && x.lane === c.lane);
      c.judged = p.judged === true; c.survived = p.survived === true;
      if (c.survived) stats[c.lane].survivors++;
      continue;
    }
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
  if (reuse) selection = 'reused: selected at ' + prior.at + ', grown/ holds its survivors';
  else if (ran && judged && !unrun) writeJson(selFile, { generation: n, at: new Date().toISOString(), baseline, candidates: cands.map((c) => ({ id: c.id, lane: c.lane, class: c.class || null, sha256: sigOf(c), judged: c.judged, survived: c.survived })) });
  // Day 2, the builder arm (GROW.md step 2b): every app through the sandbox (--app), the app judge, then promote (served
  // at /apps/<slug>/, listed in grown/apps.json). An app that fails is a loser (its misses reopen), never a void: the cell
  // tournament and the apps are separate; a generation with no cell candidate still ships a built app.
  const appStats = { candidates: apps.length, built: 0, promoted: 0, slugs: [] };
  for (const a of apps) {
    a.survived = a.promoted = false;
    if (!live) { blocked.push('sandbox: app ' + a.slug + ': ' + b.why); continue; }
    if (!a.written) { blocked.push('build: app ' + a.slug + ': the arm wrote no index.html under ' + a.rel + ': its misses reopen'); continue; }
    const s = runNode(root, 'grow/sandbox.mjs', appArgs(a), { env, timeout: 20 * MIN });
    if (s.code !== 0) { blocked.push('sandbox: app ' + a.slug + ': exit ' + s.code + ': ' + why1(s)); continue; }
    const j = runNode(root, 'grow/build.mjs', ['judge', a.rel], { env, timeout: 5 * MIN });
    const verdict = j.code === 0 ? readJson(path.join(a.dir, 'verdict.json')) : null;
    if (!verdict) { blocked.push('judge: app ' + a.slug + ': exit ' + j.code + ': ' + why1(j)); continue; }
    a.survived = verdict.survived === true;
    if (!a.survived) { blocked.push('app ' + a.slug + ' did not survive: ' + (Array.isArray(verdict.why) && verdict.why.length ? verdict.why.join('; ') : 'no why')); continue; }
    appStats.built++;
    if (flags['no-promote']) continue;
    const p = runNode(root, 'grow/build.mjs', promoteArgs(a), { env, timeout: 5 * MIN });
    const pj = lastJson(p.stdout);
    if (p.code !== 0 || !pj) { blocked.push('promote: app ' + a.slug + ': exit ' + p.code + ': ' + why1(p)); continue; }
    a.promoted = (Array.isArray(pj.promoted) && pj.promoted.includes(a.slug)) || (Array.isArray(pj.skipped) && pj.skipped.includes(a.slug));
    if (a.promoted) { appStats.promoted++; appStats.slugs.push(a.slug); }
  }
  const tournament = total > 0;
  // no verdict at all, or a candidate that did not run, is a broken run, not a tournament: nothing recorded, the generation runs again
  let block = !total ? (appStats.promoted ? null : apps.length ? 'no app survived' : 'no candidate') : !live ? (b.expired ? 'the sandbox token expired' : 'no sandbox backend') : landed && !sameCands ? 'the candidates changed after their survivors were promoted' : !judged ? 'no candidate was judged' : unrun ? unrun + ' of ' + total + ' candidates did not run' : null;
  if (ran && unrun) blocked.push('void: ' + unrun + ' of ' + total + ' candidates did not run (a sandbox or select exit that is not 0 is infrastructure, not a loss): generation ' + n + ' is not recorded and runs again');
  else if (ran && !judged) blocked.push('void: no candidate was judged: generation ' + n + ' is not recorded and runs again');
  const parent = block || !tournament ? null : rankLanes(stats)[0] ?? null;
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
  const record = !block && !promoteFailed && tournament; // an app alone is no tournament: generations.json keeps the tournaments
  if (promoteFailed) block = 'the promote failed';
  // the tournament, in grown/generations.json (prepare reads the parent from it)
  const planBuilds = plan && Array.isArray(plan.builds) ? plan.builds : [];
  const planMisses = [...(plan && Array.isArray(plan.classes) ? plan.classes.flatMap((c) => c.misses || []) : []), ...planBuilds.flatMap((x) => (x && Array.isArray(x.misses) ? x.misses : []))];
  if (record) {
    const gFile = path.join(root, 'grown', 'generations.json');
    const gs = readJson(gFile);
    const list = (gs && Array.isArray(gs.generations) ? gs.generations : []).filter((e) => !(e && e.generation === n));
    writeJson(gFile, { generations: [...list, { generation: n, at: new Date().toISOString(), lanes: stats, parent, misses: planMisses }] });
  }
  // step 6: the pending self-modification trial, judged by the tournament just recorded (kept when the survival rate
  // is above the trial's baseline, else its file is written back); before the suites, so they test the tree the commit ships
  const selfR = selfJudge(root, n, env, blocked);
  const cortexR = record ? cortexJudge(root, n, env, blocked) : (fs.existsSync(path.join(root, 'grow', 'cortex.mjs')) ? 'none' : 'not wired'); // a void tournament is no trial
  // the site, built now: the tournament is recorded and both judges ran, so /alive and the tab layer show THIS generation
  let built = block ? 'skipped: ' + block : 'skipped (--no-build)';
  if (!block && !flags['no-build']) {
    const r = runNode(root, 'web/build.mjs', [], { env, timeout: 20 * MIN });
    built = r.code === 0;
    if (!built) { block = 'the build failed'; blocked.push('build: node web/build.mjs exited ' + r.code + ': ' + why1(r)); }
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
    const ship = [...shipPaths(root), ...selfR.ship];
    const add = git(['add', '--', ...ship]);
    pushed = 'skipped: nothing committed';
    if (add.code !== 0) { committed = false; blocked.push('commit: git add exited ' + add.code + ': ' + why1(add)); }
    else if (git(['diff', '--cached', '--quiet', '--', ...ship]).code === 0) committed = 'nothing to commit';
    else {
      const email = lastLine(git(['config', 'user.email']).stdout) || 'j4ydenlxl@users.noreply.github.com';
      const cm = git(['-c', 'user.name=jayden', '-c', 'user.email=' + email, 'commit', '-m', commitMessage(n, survivors, total, parent, appStats.promoted, typeof selfR.self === 'object' && selfR.self.verdict !== 'pending' ? selfR.self : null, typeof cortexR === 'object' ? cortexR : null), '-m', TRAILER, '--', ...ship]);
      committed = cm.code === 0;
      if (!committed) blocked.push('commit: git commit exited ' + cm.code + ': ' + why1(cm));
    }
    if (committed === true && flags['no-push']) pushed = 'skipped (--no-push)';
    else if (committed === true) {
      const ps = pushHead(root, { env });
      pushed = ps.ok;
      if (!pushed) blocked.push('push: ' + ps.why + ' (the commit stays)');
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
  // a promoted app's misses are grown with the cell app:<slug> (the site answers them with the URL); an uncommitted
  // promote converges next generation: prepare reads grown/apps.json and grows the misses without an arm
  for (const pb of planBuilds) {
    const a = block || !pb ? null : apps.find((x) => x.slug === pb.slug && x.promoted);
    if (!a) continue;
    grown += markMisses(root, env, { file: genMisses, ids: Array.isArray(pb.misses) ? pb.misses : [], status: 'grown', cell: 'app:' + pb.slug, generation: n, supabase }, blocked);
    for (const id of Array.isArray(pb.misses) ? pb.misses : []) grownIds.add(id);
  }
  const reopened = markMisses(root, env, { file: genMisses, ids: planMisses.filter((id) => !grownIds.has(id)), status: 'open', generation: n, supabase }, blocked);
  const all = [...new Set([...before, ...blocked])];
  fs.mkdirSync(genDir, { recursive: true });
  fs.writeFileSync(blockedFile, all.map((l) => l + '\n').join(''));
  return {
    generation: n, lanes: stats, candidates: total, survivors, parent, baseline, selection, store, promoted, archived, retired, built, tests, committed, pushed,
    apps: appStats, misses: { growing: planMisses.length, grown, reopened }, self: selfR.self, cortex: cortexR, dream: dreamOf(root, n), blocked: all, at: new Date().toISOString(),
  };
}

/** The dream of this generation as collect wrote it (work/grow/gen-n/dream/collect.json), else 'none' (propose and collect run after finish: GROW.md step 7). */
export function dreamOf(root, n) {
  const c = readJson(path.join(genDirOf(root, n), 'dream', 'collect.json'));
  if (!c || typeof c !== 'object') return 'none';
  return { proposed: Number.isInteger(c.proposed) ? c.proposed : 0, kept: Number.isInteger(c.kept) ? c.kept : 0, classes: c.byClass && typeof c.byClass === 'object' ? Object.keys(c.byClass).length : 0 };
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
