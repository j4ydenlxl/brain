// bench/converse.mjs: THE NATIVE CONVERSATION REGION (act/converse.mjs), graded on prompts it was
// not written against.
//
// His order, 2026-09-26 20:20 EDT: "it cant even respond to 'hi.' what a shame"; 2026-09-27 09:28
// EDT: "Yeah but i said hey to it and it said it couldnt respond". Item converse-cover (board 25,
// docs/VISION.md order 1).
//
// What it measures, model off, no network, no memory read (converse() is a pure function of the
// text; act/prompt.mjs ask() calls it before every other route, which test/converse.test.mjs proves):
//   development   the turns and non-turns the grammar was written against (in this file, below);
//   negatives     prompts that are NOT conversational turns and must return null, every one:
//                   spoken-arithmetic        100 prompts from the generator of bench/spoken.mjs
//                                            (seed spoken/1, the same nine templates, the same draws)
//                   spoken-arithmetic-words  the same 100 draws with every operand written in words
//                   knowledge-questions      "what is", "who is" and "tell me about" each of the 200
//                                            titles the knowledge bar graded (bench/verdicts/knowledge.json)
//                   gsm8k-questions          the first 100 questions of bench/fixtures/public/gsm8k/test.jsonl
//                                            (a local fixture, gitignored: skipped and SAID when absent)
//                   answer-questions         the 40 questions of bench/fixtures/answer-questions.json
//                                            (a local fixture, gitignored: skipped and SAID when absent)
//                   development-non-turns    the non-turns the grammar was written against
//                   held-out non-turns       the lines of the held-out file whose turn is false
//   held out      --heldout <file>: one JSON object per line, {prompt, turn}; turn true (or a kind
//                 name) is a turn that must be carried, turn false is a non-turn that must be null.
//                 The builder of the grammar never read this file; a fix pass may generalise the
//                 grammar but never add a held-out prompt form by form (the next verify writes a
//                 second held-out file, and split.heldOut.file names which file decided).
//   control       every carried turn with the out-of-vocabulary word "apples" put after its first
//                 word; the grammar must refuse it (null). A region that keyword-matched would carry
//                 it. Printed and recorded; not part of the bar the task defined.
//
// BAR (isTheBar true only with --heldout): held-out turns carried >= 90% AND false positives 0 on
// every negative set that ran AND every held-out line readable. Without --heldout the bench writes
// bench/verdicts/converse-partial.json with isTheBar false.
// Run: node bench/converse.mjs [--heldout FILE] [--out FILE]
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { converse, examples, CONVERSE_KINDS, MAX_WORDS, MAX_CHARS } from '../act/converse.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const HELD = arg('--heldout');
const OUT = arg('--out') ? path.resolve(arg('--out')) : path.join(HERE, 'verdicts', HELD ? 'converse.json' : 'converse-partial.json');
const CARRY_BAR = 0.9;
const T0 = performance.now();

const printed = [];
const say = (s) => { printed.push(s); console.log(s); };
const rel = (p) => path.relative(ROOT, path.resolve(p)).split(path.sep).join('/');
say('converse bar: node bench/converse.mjs' + (HELD ? ' --heldout ' + rel(HELD) : '') + ' (model off, no network, no memory)');

// ---------------------------------------------------------------- development (what the grammar was written against)
const DEV_TURNS = [
  ...examples().map((e) => [e.prompt, e.kind]),
  ['hey', 'greeting'], ['Hey', 'greeting'], ['hey there', 'greeting'], ['yo', 'greeting'], ["what's up", 'wellbeing'],
  ['hey, how are you', 'greeting+wellbeing'], ['hi who are you', 'greeting+identity'], ['hello, what can you do?', 'greeting+ability'],
  ['thanks, bye', 'thanks+farewell'], ['hi, how are you, what can you do', 'greeting+wellbeing+ability'], ["i'm good, and you?", 'ack+wellbeing'],
  ['heyyy', 'greeting'], ['how r u', 'wellbeing'], ['thx', 'thanks'], ['wassup', 'wellbeing'], ['u there?', 'presence'], ['wut is ur name', 'name'],
  ['are you there', 'presence'], ['are you alive', 'nature'], ['who made you', 'origin'], ['how old are you', 'age'], ['where do you run', 'place'],
  ['what is your purpose', 'purpose'], ['tell me a joke', 'uncarried'], ['write a poem', 'uncarried'], ['tell me about yourself', 'self'],
  ['are you conscious?', 'nature'], ['can you hear me', 'presence'], ['good morning', 'greeting'], ['good night', 'farewell'],
];
const DEV_NON_TURNS = [
  'what is 2 plus 2', 'what is two plus two', 'seventeen times twenty three', 'what is five minus three', '17 * 23', 'x + 3 = 7',
  'hi, what is 17 times 23', 'what is the capital of france', 'how many legs does a spider have', 'who wrote hamlet', 'what is photosynthesis',
  'what time is it', 'what is the weather today', 'where is paris', 'what is love', 'what is the meaning of life', 'define entropy',
  'hey, what is the weather', 'tell me about the moon', 'write a poem about the sea', 'what is good morning', 'france', 'apple', 'banana',
  'https://dilation.dev', 'www.google.com', 'hello@example.com', "console.log('hi')", 'def hello(): pass', 'print("hello world")',
  'SELECT * FROM users', 'hello world program in python', 'hi there my friend how are you doing today on this fine morning',
];

// ---------------------------------------------------------------- the generator of bench/spoken.mjs (seed spoken/1)
function rng(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = h >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const int = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
// the nine templates, prompts only; each draws its operands in the same order as bench/spoken.mjs
const TEMPLATES = [
  (r, w) => { const a = int(r, 2, 999), b = int(r, 2, 999); return `what is ${w(a)} times ${w(b)}`; },
  (r, w) => { const a = int(r, 0, 99999), b = int(r, 0, 99999); return `what is ${w(a)} plus ${w(b)}?`; },
  (r, w) => { const a = int(r, 0, 9999), b = int(r, 0, 9999); return `how much is ${w(a)} minus ${w(b)}`; },
  (r, w) => { const a = int(r, 1, 999), b = int(r, 1, 99); return `what is ${w(a)} divided by ${w(b)}`; },
  (r, w) => { const a = int(r, 2, 12), k = int(r, 2, 9); return `what is ${w(a)} to the power of ${w(k)}`; },
  (r, w) => { const p = int(r, 1, 99), a = int(r, 1, 9999); return `what is ${w(p)} percent of ${w(a)}`; },
  (r, w) => { const s = int(r, 1, 999); return `what is the square root of ${w(s * s)}`; },
  (r, w) => { const a = int(r, 0, 9999999), b = int(r, 0, 9999999); return `what's the sum of ${w(a)} and ${w(b)}`; },
  (r, w) => { const a = int(r, 0, 999), b = int(r, 0, 999); return `subtract ${w(a)} from ${w(b)}`; },
];
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
function words(n) {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '');
  if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + words(n % 100) : '');
  for (const [v, name] of [[1e9, 'billion'], [1e6, 'million'], [1e3, 'thousand']]) {
    if (n >= v) return words(Math.floor(n / v)) + ' ' + name + (n % v ? ' ' + words(n % v) : '');
  }
  return String(n);
}
function spoken(n, w) { const r = rng('spoken/1'); const out = []; for (let i = 0; i < n; i++) out.push(TEMPLATES[i % TEMPLATES.length](r, w)); return out; }

// ---------------------------------------------------------------- the negative sets
const sets = [];
const skipped = [];
sets.push({ name: 'spoken-arithmetic', source: 'the generator of bench/spoken.mjs, seed spoken/1, first 100 draws', prompts: spoken(100, String) });
sets.push({ name: 'spoken-arithmetic-words', source: 'the same 100 draws, every operand written in words', prompts: spoken(100, words) });
{
  const rows = JSON.parse(readFileSync(path.join(HERE, 'verdicts', 'knowledge.json'), 'utf8')).rows || [];
  const prompts = [];
  for (const r of rows) prompts.push('what is ' + r.title, 'who is ' + r.title, 'tell me about ' + r.title);
  sets.push({ name: 'knowledge-questions', source: 'what is / who is / tell me about each of the ' + rows.length + ' titles in bench/verdicts/knowledge.json rows', prompts });
}
{
  const f = path.join(HERE, 'fixtures', 'public', 'gsm8k', 'test.jsonl');
  if (existsSync(f)) {
    const prompts = readFileSync(f, 'utf8').split('\n').filter((l) => l.trim()).slice(0, 100).map((l) => JSON.parse(l).question).filter((q) => typeof q === 'string');
    sets.push({ name: 'gsm8k-questions', source: 'the first ' + prompts.length + ' questions of bench/fixtures/public/gsm8k/test.jsonl', prompts });
  } else skipped.push({ name: 'gsm8k-questions', reason: 'bench/fixtures/public/gsm8k/test.jsonl is absent on this host (a gitignored fixture)' });
}
{
  const f = path.join(HERE, 'fixtures', 'answer-questions.json');
  if (existsSync(f)) {
    const prompts = (JSON.parse(readFileSync(f, 'utf8')).items || []).map((it) => it.q).filter((q) => typeof q === 'string');
    sets.push({ name: 'answer-questions', source: 'the ' + prompts.length + ' questions of bench/fixtures/answer-questions.json', prompts });
  } else skipped.push({ name: 'answer-questions', reason: 'bench/fixtures/answer-questions.json is absent on this host (a gitignored fixture)' });
}
sets.push({ name: 'development-non-turns', source: 'the non-turns in this file (written with the grammar)', prompts: DEV_NON_TURNS });

// ---------------------------------------------------------------- the held-out file (read only when named)
let held = null;
if (HELD) {
  const file = path.resolve(HELD);
  const text = readFileSync(file, 'utf8');
  const turns = [], nonTurns = [], unreadable = [], meta = [];
  text.split(/\r?\n/).forEach((line, i) => {
    if (!line.trim()) return;
    let o;
    try { o = JSON.parse(line); } catch { unreadable.push({ line: i + 1, why: 'not JSON' }); return; }
    if (!o || typeof o !== 'object') { unreadable.push({ line: i + 1, why: 'not an object' }); return; }
    if (typeof o.prompt !== 'string') {
      if ('author' in o || 'by' in o || 'writtenBy' in o || 'at' in o || 'meta' in o) { meta.push(o); return; }
      unreadable.push({ line: i + 1, why: 'no prompt string' }); return;
    }
    const t = o.turn;
    if (t === true || (typeof t === 'string' && t.trim() && t !== 'false')) turns.push({ line: i + 1, prompt: o.prompt, kind: typeof t === 'string' ? t : (typeof o.kind === 'string' ? o.kind : null) });
    else if (t === false || t === null || t === 'false' || t === 0) nonTurns.push({ line: i + 1, prompt: o.prompt });
    else unreadable.push({ line: i + 1, why: 'turn is neither true, a kind name, nor false' });
  });
  let author = null, writtenAt = null, how = null;
  try {
    const log = execFileSync('git', ['log', '--diff-filter=A', '--format=%an|%aI', '--', file], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim().split('\n').filter(Boolean);
    if (log.length) { [author, writtenAt] = log[log.length - 1].split('|'); how = 'git log of the commit that added the file'; }
  } catch { /* not a git checkout */ }
  const m = meta[0] || {};
  if (!author && (m.author || m.by || m.writtenBy)) { author = m.author || m.by || m.writtenBy; how = 'the header line of the file'; }
  if (!writtenAt && m.at) writtenAt = m.at;
  if (!author) { author = 'not recorded (the file is not committed and carries no header line)'; how = 'none'; }
  if (!writtenAt) { writtenAt = statSync(file).mtime.toISOString(); how = (how && how !== 'none' ? how + '; ' : '') + 'time from the file modification stamp'; }
  held = { file: rel(file), turns, nonTurns, unreadable, author, writtenAt, how };
  sets.push({ name: 'held-out-non-turns', source: 'the lines of ' + rel(file) + ' whose turn is false', prompts: nonTurns.map((x) => x.prompt) });
}

// ---------------------------------------------------------------- grading
const control = (p) => { const w = p.trim().split(/\s+/); return [w[0], 'apples', ...w.slice(1)].join(' '); };

const dev = DEV_TURNS.map(([prompt, kind]) => { const c = converse(prompt); return { prompt, expect: kind, got: c ? c.kind : null, ok: !!c && c.kind === kind }; });
const devOk = dev.filter((d) => d.ok).length;
say(`development turns: carried with the expected kind ${devOk} of ${dev.length}` + (devOk < dev.length ? '; wrong: ' + dev.filter((d) => !d.ok).map((d) => JSON.stringify(d.prompt) + ' -> ' + d.got).join(', ') : ''));

const negatives = [];
for (const s of sets) {
  const fp = [];
  for (const p of s.prompts) { const c = converse(p); if (c) fp.push({ prompt: p, kind: c.kind }); }
  negatives.push({ name: s.name, source: s.source, n: s.prompts.length, falsePositives: fp.length, rows: fp });
  say(`negative ${s.name}: false positives ${fp.length} of ${s.prompts.length}` + (fp.length ? ' -> ' + fp.slice(0, 10).map((x) => JSON.stringify(x.prompt) + ' as ' + x.kind).join(', ') : ''));
}
for (const s of skipped) say(`negative ${s.name}: SKIPPED, ${s.reason}`);

let heldGrade = null;
if (held) {
  const rows = held.turns.map((t) => { const c = converse(t.prompt); return { line: t.line, prompt: t.prompt, kind: t.kind, got: c ? c.kind : null, carried: !!c }; });
  const carried = rows.filter((r) => r.carried).length;
  const misses = rows.filter((r) => !r.carried);
  const kindNamed = rows.filter((r) => r.kind && r.carried);
  const kindAgree = kindNamed.filter((r) => r.got === r.kind || r.got.split('+').includes(r.kind)).length;
  heldGrade = { n: rows.length, carried, rate: rows.length ? carried / rows.length : 0, misses, kindNamed: kindNamed.length, kindAgree, rows };
  say(`held-out turns (${held.file}): carried ${carried} of ${rows.length}` + (rows.length ? ` (${(100 * carried / rows.length).toFixed(1)}%, bar >= ${CARRY_BAR * 100}%)` : ''));
  if (misses.length) say('held-out misses: ' + misses.map((m) => JSON.stringify(m.prompt)).join(', '));
  if (kindNamed.length) say(`held-out kind named by the file and carried: the region read the same kind on ${kindAgree} of ${kindNamed.length} (recorded, not graded)`);
  say(`held-out lines unreadable ${held.unreadable.length}` + (held.unreadable.length ? ': ' + held.unreadable.map((u) => 'line ' + u.line + ' ' + u.why).join(', ') : ''));
  say(`held-out written by ${held.author} at ${held.writtenAt} (${held.how})`);
}

const ctlSource = [...dev.filter((d) => d.got).map((d) => d.prompt), ...(heldGrade ? heldGrade.rows.filter((r) => r.carried).map((r) => r.prompt) : [])];
const ctlCarried = ctlSource.map((p) => ({ prompt: control(p), c: converse(control(p)) })).filter((x) => x.c).map((x) => ({ prompt: x.prompt, kind: x.c.kind }));
say(`control ("apples" after the first word of every carried turn): carried ${ctlCarried.length} of ${ctlSource.length} (a grammar that refuses unknown words carries 0)` + (ctlCarried.length ? ' -> ' + ctlCarried.slice(0, 10).map((x) => JSON.stringify(x.prompt) + ' as ' + x.kind).join(', ') : ''));

// ---------------------------------------------------------------- timing (converse() stamps its own ns with performance.now)
const ns = [];
for (let rep = 0; rep < 200; rep++) for (const [p] of DEV_TURNS) ns.push(converse(p).ns);
const nsNull = [];
for (let rep = 0; rep < 20; rep++) for (const p of DEV_NON_TURNS) { const a = performance.now(); converse(p); nsNull.push(Math.max(1, Math.round((performance.now() - a) * 1e6))); }
ns.sort((a, b) => a - b); nsNull.sort((a, b) => a - b);
const q = (arr, f) => arr[Math.min(arr.length - 1, Math.floor(arr.length * f))];
const timing = { turns: { n: ns.length, medianNs: q(ns, 0.5), p95Ns: q(ns, 0.95), maxNs: ns[ns.length - 1] }, nonTurns: { n: nsNull.length, medianNs: q(nsNull, 0.5), p95Ns: q(nsNull, 0.95) } };
say(`timing: turn median ${timing.turns.medianNs} ns, p95 ${timing.turns.p95Ns} ns over ${ns.length}; non-turn median ${timing.nonTurns.medianNs} ns, p95 ${timing.nonTurns.p95Ns} ns over ${nsNull.length}`);

// ---------------------------------------------------------------- the verdict
const fpTotal = negatives.reduce((s, n) => s + n.falsePositives, 0);
const met = {
  heldOutCarried: heldGrade ? heldGrade.n > 0 && heldGrade.rate >= CARRY_BAR : null,
  falsePositivesZero: negatives.every((n) => n.falsePositives === 0),
  heldOutReadable: held ? held.unreadable.length === 0 : null,
};
const isTheBar = !!held;
const barMet = isTheBar && met.heldOutCarried === true && met.falsePositivesZero && met.heldOutReadable === true;
const wallMs = Math.round(performance.now() - T0);
say(isTheBar
  ? `BAR ${barMet ? 'MET' : 'MISSED'}: held-out turns carried ${heldGrade.carried} of ${heldGrade.n} (bar >= ${CARRY_BAR * 100}%), false positives ${fpTotal} across ${negatives.length} negative sets (bar 0 on every set), unreadable held-out lines ${held.unreadable.length} (bar 0), ${wallMs} ms`
  : `PARTIAL (no --heldout, isTheBar false): development ${devOk} of ${dev.length}, false positives ${fpTotal} across ${negatives.length} negative sets, ${wallMs} ms`);

const statement = isTheBar
  ? `The native conversation region was graded on ${heldGrade.n} held-out turns from ${held.file}, a file its builder never read, and carried ${heldGrade.carried} of them against a bar of ${CARRY_BAR * 100} percent; on ${negatives.length} negative sets (${negatives.map((n) => n.name + ' ' + n.falsePositives + ' of ' + n.n).join(', ')}) it answered ${fpTotal} prompt${fpTotal === 1 ? '' : 's'} that were not conversational turns, against a bar of zero on every set${skipped.length ? ', and ' + skipped.map((s) => s.name).join(' and ') + ' did not run on this host' : ''}. The control put the unknown word "apples" into every carried turn and the region carried ${ctlCarried.length} of ${ctlSource.length} of those, which is what a grammar that refuses unknown words rather than matching keywords should do. The model was off and no network or memory was read; the median turn took ${timing.turns.medianNs} ns inside converse(), measured by performance.now. The bar is ${barMet ? 'met' : 'missed'}.`
  : `This is a partial run with no held-out file, so it is not the bar: the region carried ${devOk} of its ${dev.length} development turns with the expected kind and answered ${fpTotal} of the prompts in ${negatives.length} negative sets (${negatives.map((n) => n.name + ' ' + n.falsePositives + ' of ' + n.n).join(', ')})${skipped.length ? '; ' + skipped.map((s) => s.name).join(' and ') + ' did not run on this host' : ''}. The control put the unknown word "apples" into every carried development turn and the region carried ${ctlCarried.length} of ${ctlSource.length}. The model was off and no network or memory was read; the median turn took ${timing.turns.medianNs} ns inside converse(). The bar is run by the verify plane with --heldout on a file the builder never read.`;

const verdict = {
  at: new Date().toISOString(),
  command: 'node bench/converse.mjs' + (HELD ? ' --heldout ' + rel(HELD) : ''),
  node: process.version,
  isTheBar,
  barMet,
  met,
  bar: { heldOutCarriedAtLeast: CARRY_BAR, falsePositivesPerNegativeSet: 0, heldOutUnreadableLines: 0, rule: 'held-out turns carried >= 90 percent AND false positives 0 on every negative set that ran AND every held-out line readable' },
  statement,
  split: {
    development: { turns: dev.length, nonTurns: DEV_NON_TURNS.length, what: 'the prompts in this file and in test/converse.test.mjs, on the screen while the grammar was written' },
    heldOut: held
      ? { file: held.file, decidedBy: held.file, turns: held.turns.length, nonTurns: held.nonTurns.length, unreadable: held.unreadable.length, writtenBy: held.author, writtenAt: held.writtenAt, provenance: held.how, contaminated: false, reason: 'the builder never read it' }
      : { file: null, what: 'no --heldout given: this run is partial and decides nothing' },
    rule: 'a fix pass may generalise the grammar but never add a held-out prompt form by form; the next verify writes a second held-out file, and split.heldOut.file names which file decided',
  },
  control: { what: 'every carried turn with the out-of-vocabulary word "apples" put after its first word; a grammar that refuses unknown words carries none', n: ctlSource.length, carried: ctlCarried.length, rows: ctlCarried, inBar: false },
  heldOut: heldGrade ? { n: heldGrade.n, carried: heldGrade.carried, rate: heldGrade.rate, misses: heldGrade.misses, kindNamed: heldGrade.kindNamed, kindAgree: heldGrade.kindAgree, unreadable: held.unreadable, rows: heldGrade.rows } : null,
  negatives,
  skipped,
  development: dev,
  region: { kinds: [...CONVERSE_KINDS], maxWords: MAX_WORDS, maxChars: MAX_CHARS, model: 'off', network: 'none', memory: 'not read' },
  timing,
  wallMs,
  bytesWritten: 'one verdict file, under 1 MB',
  printed,
};
mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(verdict, null, 2) + '\n');
say('verdict: ' + rel(OUT));
