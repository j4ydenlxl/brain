#!/usr/bin/env node
// grow/misses.mjs: THE MISS-LOG READER (grow/CONTRACT.md "The miss log"; his loop in NEXT-WEEK.md, step 1 SENSE
// and step 8 SHIP: "the miss is logged for step 1. Every miss becomes a cell.").
// Author: board 37 builder, item misses, 2026-09-30.
//
// The site (act/ask-http.mjs) INSERTS a miss into Supabase public.misses with the publishable key; this
// CLI READS and UPDATES them with SUPABASE_SERVICE_KEY (his hand: never in chat, never in the repository,
// read by NAME from the environment and never printed). With no service key it says so and exits 0, so a
// generation run without the key goes on from a local JSONL (--file), the seed misses the driver writes.
//
//   node grow/misses.mjs read [--status open|growing|grown|skipped|any] [--limit 200] [--since <iso>] [--file <jsonl>]
//       the rows as JSONL, one {id, at, prompt, reply, route, status} a line, then one summary line
//       {rows, source: "supabase"|"file", reason}
//   node grow/misses.mjs mark <id,...> --status growing|grown|skipped [--cell <id>] [--generation <n>] [--file <jsonl>]
//       PATCH /rest/v1/misses?id=in.(..) (the log's ids are integers), or rewrite the named rows of the local file
//       (its own ids: grow/seed-misses.jsonl uses seed-1 to seed-4); one summary line {marked, ...}
//   node grow/misses.mjs classes [--file <jsonl>]      (rows from the file, else stdin: `read | classes` works)
//       one {id, prompt, class} a row, then {byClass, rows}; the rules below, deterministic, in order
//   --api-base <url> replaces SUPABASE_URL (tests point it at a stub on 127.0.0.1); --help prints this.
//
// THE CLASSES (the failure class a cell grows for; CONTRACT.md meta.class), first rule that holds wins:
//   fragment          1 to 3 letters and nothing else, and not a turn the conversation region answers
//                     (act/converse.mjs: "hi" and "yo" are greetings it answers, "h" is not)
//   mash              6 or more letters, no space, not a COMMON word (nor one plus s, es, ed, er, ers, ing, ly or
//                     ies for y), and one keyboard shape no English word has:
//                       a run of 5 letters with no vowel (y counts as one), each of th, sh, ch, ph, gh, wh, ck and
//                         ng one letter (a 4 letter window flagged "strengthened", "nightlife" and "twelfths");
//                       every letter on the home row (asdfghjkl) or every letter on the bottom row (zxcvbnm), the
//                         two rows with at most one vowel (the top row spells "equity", "pewter" and "property");
//                       5 neighbouring keys of one row in order ("qwert", "lkjhg");
//                       a letter pair of STRANGE_PAIRS ("jg", "qw", "zx"), pairs no common word of the store has
//   capital-of        /\b(?:the\s+)?capital\s+of\s+\w/i, unless it opens with what, which or where (the question
//                     shape the knowledge tier already answers: "What is the capital of France?")
//   essay-ocean-salt  /essay/i and /ocean|sea(?:water)?/i and /salt/i
//   essay             /\bessay\b/i
//   build             a build request: make/build/create/write/code/generate/develop/design (me) a <1 to 5 words> <app
//                     noun> ("make me a todo app", "create a pomodoro timer"); the BUILDER ARM, not a cell (Day 2)
//   math              whole-number theory: factorial, gcd, lcm, "is N prime", prime factors, fibonacci, divisors,
//                     "sum of 1 to N", "N choose K"; never plain arithmetic or an equation (the exact tier answers those)
//   data              a statistic or transform on a list in the prompt: mean, median, mode, range, sum, largest, sort,
//                     "count the words in:", "to json"
//   tools             a git, curl or "in bash" command question
//   code              a regex, sql, script, css, html, python or javascript fragment to write or explain
//   planning          a plan or schedule with a count of days or weeks ("plan a 3-day trip to Rome", "plan my week")
//   writing           a poem, haiku, limerick, story, note, slogan, message or toast to write
//   conversation      an advice or recommendation turn (recommend, suggest, what should i, any tips, a quote, i cannot
//                     sleep) the conversation region does not carry
//   science           a why, how or what-causes question ("why is the sky blue")
//   (a turn act/converse.mjs answers is never one of the Day 2 classes: it is answered already)
//   other             everything else
// A row that carries its own `class` (a curriculum row of grow/curriculum.jsonl, a dream of grow/dreams.jsonl) keeps it
// when it is a class name (a-z, 0-9, -); classify() is for a row without one (a person's miss).
// COMMON is the 200 most frequent words of 6+ letters in the ingested Simple English Wikipedia text that the
// shape above still flags by their own letters ("alaska", "dallas", "armstrong", "offspring", "downstream",
// "corkscrew", then names), an inflection counted with its stem (isCommon strips the ending) and five template
// joins ("districtq") left out; the test asserts the shape flags every one, so no word in it is dead weight.
// Measured on that text (notes/grow-misses.md): the shape flags 20 of the 28,377 words seen 20 or more times and
// 271 of the 77,671 seen 5 or more times, the class is mash for 0 and 69 of them; the first cut (a 4 letter
// window, any one row) flagged 706 and 2,196. The class is a routing label for the arms; a cell's own can()
// and the locked judge decide what it answers.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseJsonl, ID_RE } from './contract.mjs';
import { converse } from '../act/converse.mjs';

export const SERVICE_NAME = 'SUPABASE_SERVICE_KEY';
export const URL_NAME = 'SUPABASE_URL';
/** The project's REST origin (public: the site's function holds it as SUPABASE_URL); SUPABASE_URL or --api-base replaces it. */
export const DEFAULT_SUPABASE_URL = 'https://iiaxowfsdzcpteajphmx.supabase.co';
export const NO_KEY = SERVICE_NAME + ' absent (his hand)';
export const STATUSES = Object.freeze(['open', 'growing', 'grown', 'skipped']);
export const MARKS = Object.freeze(['growing', 'grown', 'skipped']);
export const CLASSES = Object.freeze(['fragment', 'mash', 'capital-of', 'essay-ocean-salt', 'essay', 'build', 'math', 'data', 'tools', 'code', 'planning', 'writing', 'conversation', 'science', 'other']);
/** A class name a row may carry (grow/generation.mjs CLASS_RE). */
export const CLASS_NAME_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
// ---- the Day 2 shapes (the octopus: one arm per domain of "everything"), in the order classify() tries them
const APP_NOUN = '(?:app|application|website|site|web ?page|page|tool|game|widget|calculator|timer|stopwatch|clock|counter|todo|to-do|notes|notepad|checklist|tracker|converter|dashboard|editor|planner|journal|quiz|calendar|player|generator|picker|board)';
export const BUILD_RE = new RegExp('\\b(?:make|build|create|write|code|generate|develop|design)\\b(?:\\s+(?:me|us))?\\s+(?:a|an|the|my|our)?\\s*(?:[a-z0-9-]+\\s+){0,5}?' + APP_NOUN + '\\b', 'i');
export const MATH_RE = /\b(?:factorial|gcd|lcm|greatest common divisor|least common multiple|highest common factor|prime factors?|prime factori[sz]ation|fibonacci|divisors?|choose|sum of (?:the )?(?:integers |numbers )?(?:from )?\d+ to \d+)\b|\bis \d+ (?:a )?prime\b|\b\d+\s*!\s*$/i;
export const DATA_RE = /\b(?:mean|median|mode|average|range|standard deviation|variance|largest|smallest|biggest|minimum|maximum|sum|total|sort|order)\b[^\n]*\d+(?:\.\d+)?\s*,\s*\d+|\bsort(?:ed)?\b[^\n]*\d|\b(?:to|into|as) json\b|\bcsv to json\b|\bcount the words\b|\bword count\b/i;
export const TOOLS_RE = /\b(?:git|curl|npm|pip|docker|ssh)\b|\bcommand\b|\b(?:in|with|using|on) (?:bash|the terminal|a terminal|the shell|the command line|zsh|linux)\b|\bone-liner\b/i;
export const CODE_RE = /\b(?:regex|regular expression|sql|script|css|html|python|javascript|typescript|java|c\+\+|rust|code|snippet|algorithm|json)\b/i;
export const PLAN_RE = /\b(?:plan|schedule|itinerary|timetable|routine|roadmap)\b/i;
export const PLAN_SPAN_RE = /\b\d+[- ]?(?:day|days|week|weeks|month|months)\b|\bplan my\b|\bfor \d+ days?\b|\bitinerary\b|\bmeal plan\b|\bstudy plan\b|\bworkout plan\b/i;
export const WRITING_RE = /\b(?:poem|haiku|limerick|sonnet|story|tale|letter|note|slogan|tagline|toast|speech|message|caption|paragraph|lyrics|song|jingle|motto|rhyme|verse)\b/i;
export const WRITING_VERB_RE = /\b(?:write|compose|draft|make up|pen|create|give me|generate)\b|^(?:a|an) (?:poem|haiku|limerick|sonnet|story|tale|slogan|tagline|toast|rhyme|verse)\b/i;
export const CONVO_RE = /\b(?:recommend|suggest|suggestion|any tips|tips for|advice|what should i|should i|say something|cheer me up|motivat|inspir|encourag|quote|i (?:cannot|can't|cant|can not) (?:sleep|focus|stop)|i am (?:bored|sad|nervous|anxious|stressed|tired|lonely)|i'm (?:bored|sad|nervous|anxious|stressed|tired|lonely)|how do i (?:make friends|deal with|cope|get over|stop|start)|what (?:hobby|sport|game|book|movie|film|show|podcast))\b/i;
export const SCIENCE_RE = /^(?:why|how)\b|\bwhat (?:causes|makes|happens)\b|\bexplain\b/i;
export const LIMIT = Object.freeze({ dflt: 200, max: 1000, fetchMs: 10_000 });
/** A log id (public.misses id is a bigint identity). */
export const LOG_ID_RE = /^\d{1,19}$/;
/** A local file's id: the seed file's "seed-1", or any short word of letters, digits, dot, colon, underscore, dash. */
export const FILE_ID_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/;
export const COMMON = Object.freeze([
  'abbeyquaye', 'afzelii', 'agdash', 'ahlquist', 'akalla', 'akasaka', 'alaska', 'alfalfa', 'alicja', 'alqosh',
  'arcfox', 'armstrong', 'baxxter', 'betzdorf', 'blomquist', 'bojnice', 'boqvist', 'boudewijn', 'boxgrove', 'bozdar',
  'breaststroke', 'brecqhou', 'bundesverdienstkreuz', 'champvent', 'chicxulub', 'chivhe', 'coldstream', 'colquitt',
  'corkscrew', 'covfefe', 'creutzfeldt', 'cruijff', 'cwmbran', 'dakhla', 'dallas', 'daugavpils', 'dijkstra',
  'downstream', 'ecgfrith', 'ernstthal', 'erzgebirgskreis', 'fawwaz', 'fawzia', 'firouzja', 'flasks', 'forcalquier',
  'gadjah', 'galahad', 'gallaga', 'gallas', 'gasalla', 'gevherhan', 'goldschmidt', 'gqeberha', 'guadalquivir',
  'hadash', 'hadassah', 'haddad', 'hajjaj', 'halakha', 'hamzah', 'hamzat', 'hasakah', 'hassall', 'hellqvist',
  'hertzsprung', 'holtzbrinck', 'hovhannes', 'hrazdan', 'hultsfred', 'hurstbridge', 'husqvarna', 'innsbruck',
  'istiqlal', 'izquierda', 'izquierdo', 'jadallah', 'jadavpur', 'jadgal', 'jalajala', 'jalsha', 'jhalak', 'jiszda',
  'jnanpith', 'jowzjan', 'jyotirao', 'jyutping', 'kafala', 'kalash', 'kalasha', 'kalfas', 'kalkaska', 'kallada',
  'kallas', 'karamzin', 'karlskrona', 'khadka', 'khalaf', 'khalsa', 'khudojnazarov', 'khuzdar', 'kladas',
  'knightsbridge', 'koffka', 'kricfalusi', 'ladakh', 'lakselvbukt', 'landskrona', 'lefkada', 'lindqvist',
  'lindstrom', 'lippspringe', 'looksmaxxing', 'lucjan', 'lufkin', 'lundqvist', 'luqman', 'macfadyen', 'macfarlane',
  'maqdis', 'marijnissen', 'marktbreit', 'mejzlikova', 'meritxell', 'midtjylland', 'mkrtchyan', 'mojgan', 'mtskheta',
  'mulqueen', 'mxyzptlk', 'naqshbandi', 'nemzeti', 'newquay', 'nimzovich', 'nordstrom', 'nuiqsut', 'nyquist',
  'nyqvist', 'offspring', 'ozzfest', 'panjnad', 'pijnacker', 'podorojniy', 'postscript', 'pwllheli', 'qawwali',
  'qeqqata', 'qikiqtaaluk', 'rafkin', 'rajneesh', 'rifkin', 'rijndael', 'rijnders', 'romijn', 'sahgal', 'sajjad',
  'salads', 'salhad', 'samajwadi', 'samizdat', 'saqqez', 'savvina', 'scottsbluff', 'screwjob', 'shaggs', 'shahada',
  'shahjalal', 'shahla', 'shawwal', 'sirajganj', 'skaggs', 'slottsskogsvallen', 'soccsksargen', 'sportswriter',
  'srpska', 'stormzy', 'suzdal', 'taqlid', 'taufkirchen', 'telewizja', 'tsawwassen', 'umpqua', 'uppvidinge',
  'uruqhart', 'varazdat', 'vazquez', 'velazquez', 'vijfheerenlanden', 'vjekoslav', 'volzhsky', 'wijnberg', 'xzibit',
  'yellowjacket', 'yevhen', 'yousafzai', 'yusufzai', 'zdravko', 'zijlstra', 'zvezda', 'zwijndrecht',
]);
const COMMON_SET = new Set(COMMON);
/** The endings a COMMON word may carry and still be that word ("sportswriters", "yellowjackets"). */
const ENDINGS = Object.freeze([['ies', 'y'], ['ing', ''], ['ers', ''], ['es', ''], ['ed', ''], ['er', ''], ['ly', ''], ['s', '']]);
/** w, or w less one ending, is a COMMON word. */
export function isCommon(w) {
  const s = String(w ?? '').toLowerCase();
  if (COMMON_SET.has(s)) return true;
  return ENDINGS.some(([e, add]) => s.length - e.length >= 4 && s.endsWith(e) && COMMON_SET.has(s.slice(0, -e.length) + add));
}
const VOWELS = 'aeiouy';
const ROWS = Object.freeze(['qwertyuiop', 'asdfghjkl', 'zxcvbnm']);
/** The two rows with at most one vowel: a word spelled on one of them is nearly always a mash. */
const LOW_ROWS = Object.freeze(['asdfghjkl', 'zxcvbnm']);
/** English letter pairs that sound as one consonant: a run counts each as one letter. */
const DIGRAPHS = /th|sh|ch|ph|gh|wh|ck|ng/g;
/**
 * The 83 letter pairs that none of the 28,377 words of 6+ letters seen 20 or more times in the ingested Simple
 * English Wikipedia text (bench/fixtures/wiki/store/records.bin) contains; measured once on 2026-09-30.
 */
export const STRANGE_PAIRS = Object.freeze(('bq bx cf cg cj cv cx dx fk fq fv fx fz hx jf jg jn jq jw jx jy jz kq lq lx mq mx mz pq pv px qb qc qd qe ' +
  'qf qg qh qj qk ql qm qn qp qr qs qt qv qw qx qy qz sx tq tx vb vf vh vj vm vp vq vv vw vx wj wq ww wx wz xd xg ' +
  'xj xk xr xx xz yq zd zf zj zq zx').split(' '));
const STRANGE = new Set(STRANGE_PAIRS);

// ---------------------------------------------------------------- the classes
/** A run of 5 letters with no vowel (y counts as one), each of th, sh, ch, ph, gh, wh, ck and ng one letter. */
export function consonantRun(w) {
  const s = String(w).toLowerCase().replace(DIGRAPHS, '#');
  let run = 0;
  for (const c of s) { run = VOWELS.includes(c) ? 0 : run + 1; if (run >= 5) return true; }
  return false;
}
/** Every letter of w on the home row, or every letter on the bottom row. */
export function oneRow(w) {
  const s = String(w).toLowerCase();
  return s.length > 0 && LOW_ROWS.some((r) => [...s].every((c) => r.includes(c)));
}
/** 5 neighbouring keys of one row in order, either way ("qwert", "lkjhg"). */
export function rowWalk(w) {
  const s = String(w).toLowerCase();
  const ways = ROWS.flatMap((r) => [r, [...r].reverse().join('')]);
  for (let i = 0; i + 5 <= s.length; i++) { const k = s.slice(i, i + 5); if (ways.some((r) => r.includes(k))) return true; }
  return false;
}
/** A letter pair of STRANGE_PAIRS anywhere in w. */
export function strangePair(w) {
  const s = String(w).toLowerCase();
  for (let i = 0; i + 2 <= s.length; i++) if (STRANGE.has(s.slice(i, i + 2))) return true;
  return false;
}
/** The mash rule before the COMMON list: 6+ letters, no space, and one of the four keyboard shapes. */
export function mashShape(p) {
  const s = String(p ?? '').trim();
  return /^[a-z]{6,}$/i.test(s) && (consonantRun(s) || oneRow(s) || rowWalk(s) || strangePair(s));
}

/**
 * The failure class of one prompt, by the rules in the header, in order.
 * @param {string} prompt
 * @returns {'fragment'|'mash'|'capital-of'|'essay-ocean-salt'|'essay'|'other'}
 */
export function classify(prompt) {
  const s = String(prompt ?? '').trim();
  if (/^[a-z]{1,3}$/i.test(s) && !converse(s)) return 'fragment';
  if (mashShape(s) && !isCommon(s)) return 'mash';
  if (/\b(?:the\s+)?capital\s+of\s+\w/i.test(s) && !/^\s*(?:what|which|where)\b/i.test(s)) return 'capital-of';
  if (/essay/i.test(s) && /ocean|sea(?:water)?/i.test(s) && /salt/i.test(s)) return 'essay-ocean-salt';
  if (/\bessay\b/i.test(s)) return 'essay';
  if (BUILD_RE.test(s)) return 'build';
  if (converse(s)) return 'other'; // a turn the conversation region answers is not one of the Day 2 classes
  if (MATH_RE.test(s)) return 'math';
  if (DATA_RE.test(s)) return 'data';
  if (TOOLS_RE.test(s)) return 'tools';
  if (CODE_RE.test(s)) return 'code';
  if (PLAN_RE.test(s) && PLAN_SPAN_RE.test(s)) return 'planning';
  if (WRITING_RE.test(s) && WRITING_VERB_RE.test(s)) return 'writing';
  if (CONVO_RE.test(s)) return 'conversation';
  if (SCIENCE_RE.test(s)) return 'science';
  return 'other';
}

export const USAGE = [
  'usage: node grow/misses.mjs read [--status open|growing|grown|skipped|any] [--limit 200] [--since <iso>] [--file <jsonl>] [--api-base <url>]',
  '       node grow/misses.mjs mark <id,...> --status growing|grown|skipped [--cell <id>] [--generation <n>] [--file <jsonl>] [--api-base <url>]',
  '       (the log ids are integers; with --file the ids are those of the file, such as seed-1)',
  '       node grow/misses.mjs classes [--file <jsonl>]   (rows from the file, else stdin)',
  'reads ' + SERVICE_NAME + ' and ' + URL_NAME + ' by name (default ' + DEFAULT_SUPABASE_URL + '); without the key, read and mark print the reason and exit 0',
].join('\n');

class Fail extends Error { constructor(msg, code = 1) { super(msg); this.exit = code; } }

/** One line a row for every row with a string prompt, then the summary. Rows without one (a summary line) are skipped.
 *  A row carrying its own class name keeps it (a curriculum row, a dream); byClass gains a key for a class not in CLASSES. */
export function classesOf(rows) {
  const byClass = Object.fromEntries(CLASSES.map((c) => [c, 0]));
  const lines = [];
  for (const r of rows) {
    if (!r || typeof r.prompt !== 'string') continue;
    const c = typeof r.class === 'string' && CLASS_NAME_RE.test(r.class) ? r.class : classify(r.prompt);
    byClass[c] = (byClass[c] || 0) + 1;
    lines.push({ id: r.id ?? null, prompt: r.prompt, class: c });
  }
  return { lines, summary: { byClass, rows: lines.length } };
}

// ---------------------------------------------------------------- rows
/** The row shape this CLI prints; a row with no status is open (a seed the driver wrote). */
export function rowOf(r) {
  const row = { id: r.id ?? null, at: r.at ?? null, prompt: r.prompt, reply: r.reply ?? null, route: r.route ?? null, status: r.status ?? 'open' };
  if (Number.isInteger(r.generation)) row.generation = r.generation; // the mark's generation, so a driver can tell its own mark from an earlier run's
  if (typeof r.cell === 'string' && r.cell) row.cell = r.cell;
  if (typeof r.class === 'string' && CLASS_NAME_RE.test(r.class)) row.class = r.class; // a curriculum row or a dream names its class
  if (r.expect && typeof r.expect === 'object' && !Array.isArray(r.expect)) row.expect = r.expect; // a dream carries the proposer's expect
  return row;
}

function readFileRows(file) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch (e) { throw new Fail('cannot read ' + file + ': ' + String(e.code || e.message)); }
  try { return parseJsonl(text); } catch (e) { throw new Fail(file + ': ' + e.message); }
}

function baseOf(env, apiBase) {
  const raw = apiBase || (env && env[URL_NAME]) || DEFAULT_SUPABASE_URL;
  try { return new URL(String(raw)).origin; } catch { throw new Fail((apiBase ? '--api-base' : URL_NAME) + ' is not a url'); }
}

const headersFor = (key, extra = {}) => ({ apikey: key, authorization: 'Bearer ' + key, accept: 'application/json', ...extra });

/** One REST call with a deadline; the key never appears in what it throws. */
async function rest(url, init, { key, fetch: f = globalThis.fetch, timeoutMs = LIMIT.fetchMs, what }) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    let res;
    try { res = await f(url, { ...init, signal: ac.signal }); } catch (e) {
      const code = String((e && e.cause && e.cause.code) || (e && e.code) || (e && e.name) || 'error');
      throw new Fail(ac.signal.aborted ? what + ': the miss log did not answer in ' + timeoutMs + ' ms' : what + ': the miss log could not be reached (' + code + ')');
    }
    const text = await res.text();
    if (!res.ok) {
      let msg = '';
      try { const j = JSON.parse(text); msg = String(j.message || j.error || j.hint || '').slice(0, 160); } catch { msg = ''; }
      if (key) msg = msg.split(key).join('<key>');
      throw new Fail(what + ' answered ' + res.status + (msg ? ': ' + msg : ''));
    }
    try { return { status: res.status, body: text ? JSON.parse(text) : null }; } catch { throw new Fail(what + ' answered ' + res.status + ' with a body that is not JSON'); }
  } finally { clearTimeout(timer); }
}

/**
 * Read misses from the log (the service key) or from a local JSONL.
 * @returns {Promise<{rows: object[], summary: {rows: number, source: string, reason: string}}>}
 */
export async function readMisses({ env = process.env, status = 'open', limit = LIMIT.dflt, since = null, file = null, apiBase = null, fetch, timeoutMs, retired } = {}) {
  const sinceMs = since == null ? null : Date.parse(since);
  // a prompt the locked judge named as held-out (grow/retired.jsonl, grow/retire.mjs) is never read as a miss again:
  // a cell grown from it dies on the leak rule, whatever it answers (generation 3: 0 of 36)
  // (a tree that carries this file without grow/retire.mjs, a test root, retires nothing)
  let isRetired = () => false;
  try { const m = await import('./retire.mjs'); isRetired = m.isRetired; if (retired === undefined) retired = m.readRetired(); } catch (e) { if (!e || e.code !== 'ERR_MODULE_NOT_FOUND') throw e; }
  let gone = 0;
  const live = (row) => { if (!isRetired(retired, row.prompt)) return true; gone++; return false; };
  if (file) {
    const all = readFileRows(file);
    let skipped = 0;
    const rows = [];
    for (const r of all) {
      if (!r || typeof r.prompt !== 'string' || !r.prompt.length) { skipped++; continue; }
      const row = rowOf(r);
      if (status !== 'any' && row.status !== status) continue;
      if (sinceMs !== null && !(Date.parse(row.at) >= sinceMs)) continue; // a row with no time is not "since"
      if (!live(row)) continue;
      rows.push(row);
    }
    // newest first, as the log answers; a row with no time keeps its file order after the timed ones
    const t = (r) => { const v = Date.parse(r.at); return Number.isFinite(v) ? v : -Infinity; };
    const order = rows.map((r, i) => [r, i]).sort((a, b) => (t(b[0]) - t(a[0])) || (a[1] - b[1])).map((x) => x[0]);
    const out = order.slice(0, limit);
    return { rows: out, summary: { rows: out.length, source: 'file', reason: 'read ' + path.basename(file) + ' (' + all.length + ' lines, ' + skipped + ' without a prompt' + (gone ? ', ' + gone + ' retired' : '') + ')' } };
  }
  const key = env && env[SERVICE_NAME];
  if (!key) return { rows: [], summary: { rows: 0, source: 'supabase', reason: NO_KEY } };
  const q = new URLSearchParams({ select: 'id,at,prompt,reply,route,status', order: 'at.desc', limit: String(limit) });
  if (status !== 'any') q.set('status', 'eq.' + status);
  if (sinceMs !== null) q.set('at', 'gte.' + new Date(sinceMs).toISOString());
  const r = await rest(baseOf(env, apiBase) + '/rest/v1/misses?' + q.toString(), { method: 'GET', headers: headersFor(key) }, { key, fetch, timeoutMs, what: 'GET /rest/v1/misses' });
  if (!Array.isArray(r.body)) throw new Fail('GET /rest/v1/misses answered ' + r.status + ' with a body that is not a list');
  const rows = r.body.filter((x) => x && typeof x.prompt === 'string').map(rowOf).filter(live);
  return { rows, summary: { rows: rows.length, source: 'supabase', reason: 'GET /rest/v1/misses answered ' + r.status + (gone ? ' (' + gone + ' retired)' : '') } };
}

/**
 * Mark misses growing, grown or skipped: PATCH the log (the service key) or rewrite a local JSONL.
 * @returns {Promise<{marked: number, ids: string[], status: string, source: string, reason: string}>}
 */
export async function markMisses(ids, { env = process.env, status, cell = null, generation = null, file = null, apiBase = null, fetch, timeoutMs, now = Date.now() } = {}) {
  const patch = { status };
  if (cell !== null) patch.cell = cell;
  if (generation !== null) patch.generation = generation;
  if (status === 'grown') patch.grown_at = new Date(now).toISOString();
  if (file) {
    const all = readFileRows(file);
    const want = new Set(ids.map(String));
    let marked = 0;
    for (const r of all) if (r && want.has(String(r.id))) { Object.assign(r, patch); marked++; }
    const tmp = file + '.' + process.pid + '.tmp';
    fs.writeFileSync(tmp, all.map((r) => JSON.stringify(r)).join('\n') + (all.length ? '\n' : ''));
    fs.renameSync(tmp, file);
    return { marked, ids, status, source: 'file', reason: 'rewrote ' + path.basename(file) };
  }
  if (!ids.length || !ids.every((x) => LOG_ID_RE.test(String(x)))) throw new Fail('the log ids are integers: ' + ids.slice(0, 3).join(','), 2);
  const key = env && env[SERVICE_NAME];
  if (!key) return { marked: 0, ids, status, source: 'supabase', reason: NO_KEY };
  const url = baseOf(env, apiBase) + '/rest/v1/misses?id=in.(' + ids.join(',') + ')&select=id';
  const headers = headersFor(key, { 'content-type': 'application/json', prefer: 'return=representation' });
  const r = await rest(url, { method: 'PATCH', headers, body: JSON.stringify(patch) }, { key, fetch, timeoutMs, what: 'PATCH /rest/v1/misses' });
  const marked = Array.isArray(r.body) ? r.body.length : 0;
  return { marked, ids, status, source: 'supabase', reason: 'PATCH /rest/v1/misses answered ' + r.status };
}

// ---------------------------------------------------------------- the CLI
const VALUE_FLAGS = new Set(['--status', '--limit', '--since', '--file', '--api-base', '--cell', '--generation']);
function parseArgs(argv) {
  const pos = [], flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') { flags.help = true; continue; }
    if (VALUE_FLAGS.has(a)) {
      if (i + 1 >= argv.length) throw new Fail(a + ' needs a value', 2);
      flags[a.slice(2)] = argv[++i];
      continue;
    }
    if (a.startsWith('--')) throw new Fail('unknown flag ' + a, 2);
    pos.push(a);
  }
  return { pos, flags };
}

/**
 * Run the CLI. io: { env, out(line), err(line), stdin() => text, stdinIsTTY, fetch }.
 * @returns {Promise<number>} the exit code
 */
export async function main(argv, io = {}) {
  const env = io.env || process.env;
  const out = io.out || ((s) => process.stdout.write(s + '\n'));
  const err = io.err || ((s) => process.stderr.write(s + '\n'));
  try {
    const { pos, flags } = parseArgs(argv);
    const cmd = pos[0];
    if (flags.help) { out(USAGE); return 0; }
    if (!cmd) throw new Fail('no command: read, mark or classes (--help)', 2);
    const common = { env, apiBase: flags['api-base'] || null, fetch: io.fetch, file: flags.file || null };
    if (cmd === 'read') {
      const status = flags.status || 'open';
      if (status !== 'any' && !STATUSES.includes(status)) throw new Fail('--status is one of ' + STATUSES.join(', ') + ', any', 2);
      const limit = flags.limit === undefined ? LIMIT.dflt : Number(flags.limit);
      if (!Number.isInteger(limit) || limit < 1 || limit > LIMIT.max) throw new Fail('--limit is an integer from 1 to ' + LIMIT.max, 2);
      if (flags.since !== undefined && !Number.isFinite(Date.parse(flags.since))) throw new Fail('--since is not a date: ' + flags.since, 2);
      const r = await readMisses({ ...common, status, limit, since: flags.since ?? null });
      for (const row of r.rows) out(JSON.stringify(row));
      out(JSON.stringify(r.summary));
      return 0;
    }
    if (cmd === 'mark') {
      const ids = String(pos[1] || '').split(',').map((s) => s.trim()).filter(Boolean);
      const idRe = flags.file ? FILE_ID_RE : LOG_ID_RE;
      if (!ids.length || !ids.every((s) => idRe.test(s))) throw new Fail(flags.file ? 'mark needs ids: mark seed-1,seed-2 --status growing --file <jsonl>' : 'mark needs ids: mark 1,2,3 --status grown (the log ids are integers)', 2);
      if (!MARKS.includes(flags.status)) throw new Fail('--status is one of ' + MARKS.join(', '), 2);
      if (flags.cell !== undefined && !ID_RE.test(flags.cell)) throw new Fail('--cell does not match ' + ID_RE, 2);
      const generation = flags.generation === undefined ? null : Number(flags.generation);
      if (generation !== null && !(Number.isInteger(generation) && generation >= 0)) throw new Fail('--generation is an integer from 0', 2);
      out(JSON.stringify(await markMisses(ids, { ...common, status: flags.status, cell: flags.cell ?? null, generation })));
      return 0;
    }
    if (cmd === 'classes') {
      let rows;
      if (flags.file) rows = readFileRows(flags.file);
      else {
        const tty = io.stdinIsTTY ?? process.stdin.isTTY;
        if (tty) throw new Fail('classes reads JSONL rows from --file <jsonl> or from stdin', 2);
        const text = io.stdin ? io.stdin() : fs.readFileSync(0, 'utf8');
        try { rows = parseJsonl(text); } catch (e) { throw new Fail('stdin: ' + e.message); }
      }
      const c = classesOf(rows);
      for (const l of c.lines) out(JSON.stringify(l));
      out(JSON.stringify(c.summary));
      return 0;
    }
    throw new Fail('unknown command ' + cmd + ': read, mark or classes (--help)', 2);
  } catch (e) {
    err('misses: ' + String((e && e.message) || e).split('\n')[0]);
    return e instanceof Fail ? e.exit : 1;
  }
}

const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main(process.argv.slice(2)).then((code) => { process.exitCode = code; });
