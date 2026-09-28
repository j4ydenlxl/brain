// bench/grok-bot.mjs: the assembler for bench/verdicts/grok-bot.json and docs/research/grok-bot.md.
// VISION order 43 ("Look at Grok bot. And make ours 10000x better and cheaper"), board 29 item
// grok-bot, rebuilt on board 31 item grok-bot-fix because the first assembler lived in a scratch
// directory that was deleted after its run, so the verdict named a command nobody could re-run.
//
// What it HOLDS (typed here, each with where it came from):
//   SOURCES   every page read for this item: URL, HTTP status, readAt (the ISO instant the fetch
//             returned, read off the reading builder's own transcript clock; null for a page that
//             did not load, whose attempt instant is triedAt), one quote under 15 words, and the
//             strings the page printed that a number below is taken from.
//   THEIRS    every number on the Grok side, each naming its source and the printed string.
//   MEASURES  every row: a THEIRS key or none, and on our side only a verdict file and a path.
// What it READS: our numbers, only from verdict files under bench/verdicts at run time, each with
//   that file's own "at" stamp. No number on our side is typed in this file.
// What it WRITES: bench/verdicts/grok-bot.json and docs/research/grok-bot.md, and the lines of report():
//   one per measure, pin, pair and derived number (every number the prose quotes is one of them;
//   build() records each value the prose interpolates and a check fails when one is not printed), and
//   the bar. It reads no file and probes no path whose stamp the verdict does not record (build()
//   returns `inputs`, the files it read and the paths it probed). No network, no model, no clock but the "at" stamp, no randomness: two runs over the
//   same verdict files print the same measure lines.
//
//   node bench/grok-bot.mjs
//
// A LIVE verdict file (complete false, a bench still running) only APPENDS rows, so the value it gave
// at a stamp is the recount over the rows it held then. For every live file read, the verdict keeps a
// pin {at, rows, digest}: the stamp, how many rows it held and a sha256 of those rows. build(root, at,
// pins) reads each pinned file as its first "rows" rows (refusing when their digest moved), which is
// how the test re-runs the command at the verdict's stamps while the bench keeps appending.
//
// The path grammar on our side: dotted keys; arr[key=value] picks an array element; a trailing
// " (regex R)" reads the first capture of R from the string found; a leading
// paired(a,b[,split]) recounts the file's rows on the records where BOTH arms a and b were graded
// (not absent, ok a boolean), optionally only rows of one split, and yields {a:{n,correct,accuracy},
// b:{...}}: that is how two arms are compared on one population, never on two.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');
export const VERDICT_REL = 'bench/verdicts/grok-bot.json';
export const MD_REL = 'docs/research/grok-bot.md';
export const COMMAND = 'node bench/grok-bot.mjs';

// ---------------------------------------------------------------------------------------------
// SOURCES. readAt: the instant the WebFetch result returned in the reading builder's transcript
// (board 29 builder for the first 22, board 31 builder for the last 2). status 200 means WebFetch
// returned the page body; a non-2xx code is printed by WebFetch itself and is recorded as printed.
// quote: at most one quote, under 15 words, as the fetch returned it; null when nothing was taken.
// printed: the strings a THEIRS number below is taken from, as the fetch returned them.
export const SOURCES = [
  { url: 'https://x.ai/news/introducing-grok-bot', status: 200, official: true, readAt: '2026-09-27T19:12:53.541Z', triedAt: null,
    quote: 'AI teammates you can give real work to',
    claim: 'the launch page (Aug 11 2026): Bots with their own computer that sign into the tools a user already uses and work across apps and websites, with usage separate from Grok and Cursor plans; no price, no speed and no benchmark number on the page',
    printed: ['August 11, 2026'] },
  { url: 'https://x.ai/bot', status: 403, official: true, readAt: null, triedAt: '2026-09-27T19:12:50.547Z',
    quote: null, claim: 'did not load (HTTP 403 Forbidden to WebFetch); nothing taken from it', printed: [] },
  { url: 'https://docs.x.ai/grok-bot/overview', status: 200, official: true, readAt: '2026-09-27T19:12:56.094Z', triedAt: null,
    quote: 'a persistent cloud computer with a browser, filesystem, and terminal',
    claim: 'Bots run in parallel and message each other; a site can still block automation or require a human step; one computer-use task per Bot screen at a time; usage resets weekly; no latency and no benchmark number',
    printed: [] },
  { url: 'https://docs.x.ai/grok-bot/teams-and-enterprises', status: 200, official: true, readAt: '2026-09-27T19:12:59.646Z', triedAt: null,
    quote: "Each user's work runs in a dedicated Firecracker microVM",
    claim: "all of one user's Bots share one computer (they isolate personalities and workspaces, not compute); a Bot uses only the accounts and plugins it is granted; it runs in Cursor's cloud and cannot reach other users' computers or data",
    printed: [] },
  { url: 'https://docs.x.ai/grok-bot/computer-and-apps', status: 200, official: true, readAt: '2026-09-27T19:13:10.136Z', triedAt: null,
    quote: 'a password or passkey, two-factor authentication, a CAPTCHA, a payment or identity check',
    claim: 'the steps above, and a site that requires a human, are ones it cannot complete; the user local machine only when enabled and approved; the Bot screens are work surfaces, not security boundaries; no timing number',
    printed: [] },
  { url: 'https://docs.x.ai/grok-bot/faq', status: 200, official: true, readAt: '2026-09-27T19:14:24.925Z', triedAt: null,
    quote: 'One Bot can run one computer-use task on its screen at a time.',
    claim: 'weekly usage is included and on-demand usage is billed from model and token cost; separate Bots are not a security boundary; Legacy Privacy Mode is not supported; no dollar amount, no model named, no latency',
    printed: ['One Bot can run one computer-use task on its screen at a time.'] },
  { url: 'https://cursor.com/help/grok-bot/plans', status: 200, official: true, readAt: '2026-09-27T19:13:06.467Z', triedAt: null,
    quote: 'Grok Bot usage is metered on your Cursor account',
    claim: 'weekly usage and on-demand usage are named; no dollar number on the page', printed: [] },
  { url: 'https://cursor.com/help/grok-bot/security', status: 404, official: true, readAt: null, triedAt: '2026-09-27T19:13:04.951Z',
    quote: null, claim: 'did not load (HTTP 404 Not Found); nothing taken from it', printed: [] },
  { url: 'https://cursor.com/pricing', status: 200, official: true, readAt: '2026-09-27T19:13:25.062Z', triedAt: null,
    quote: '$20 / mo.',
    claim: 'the Individual plan at $20 a month and Teams at $40 per user a month, each listing Grok Bot access; Enterprise custom',
    printed: ['Individual (Pro/Pro+/Ultra): "$20 / mo."', 'Teams (Standard/Premium): "$40 / user / mo."'] },
  { url: 'https://cursor.com/docs/account/pricing', status: 200, official: true, readAt: '2026-09-27T19:13:31.952Z', triedAt: null,
    quote: 'Pro: "$20/mo"',
    claim: 'Pro, Pro Plus, Ultra, Teams Standard and Teams Premium prices; no Grok Bot allowance in dollars',
    printed: ['Pro: "$20/mo"', 'Pro Plus: "$60/mo"', 'Ultra: "$200/mo"', 'Teams Standard: "$40/user/mo"', 'Teams Premium: "$120/user/mo"'] },
  { url: 'https://x.ai/grok', status: 403, official: true, readAt: null, triedAt: '2026-09-27T19:13:23.539Z',
    quote: null, claim: 'did not load (HTTP 403 Forbidden); SuperGrok prices were not read from an xAI page', printed: [] },
  { url: 'https://grok.com/plans', status: 200, official: true, readAt: '2026-09-27T19:13:25.761Z', triedAt: null,
    quote: 'Plans - Grok',
    claim: 'loaded, but the served page held only its header (a script-rendered page): no plan and no price; nothing taken from it', printed: [] },
  { url: 'https://grok.com/supergrok', status: 200, official: true, readAt: '2026-09-27T19:14:14.399Z', triedAt: null,
    quote: null, claim: 'loaded, but the served page held only a navigation header: no pricing text; nothing taken from it', printed: [] },
  { url: 'https://docs.x.ai/grok/faq', status: 200, official: true, readAt: '2026-09-27T19:14:24.171Z', triedAt: null,
    quote: null, claim: 'names the tiers SuperGrok, SuperGrok Plus, SuperGrok Heavy, Lite and X Premium and prints no price', printed: [] },
  { url: 'https://docs.x.ai/docs/models', status: 200, official: true, readAt: '2026-09-27T19:13:36.510Z', triedAt: null,
    quote: 'grok-4.7 (<200k tokens) | 500k | $2.00 | $6.00',
    claim: 'grok-4.7 at $2.00 input and $6.00 output per million tokens under 200k prompt tokens ($4.00 and $12.00 at or above); no tokens per second, no latency, and no word on which model powers Grok Bot',
    printed: ['grok-4.7 (<200k tokens) | 500k | $2.00 | $6.00', 'grok-4.7 (≥200k tokens) | 500k | $4.00 | $12.00'] },
  { url: 'https://x.ai/news/grok-4-7', status: 200, official: true, readAt: '2026-09-27T19:13:51.846Z', triedAt: null,
    quote: 'trained to natively understand the Grok Bot harness',
    claim: 'Grok 4.7, Sep 21 2026: ten benchmark numbers, $2 and $6 per million tokens, and a fast variant at twice the output speed and twice the price, with no tokens per second',
    printed: ['"CursorBench 4.0" - 46.3%', '"DeepSWE v1.1" - 71.0%', '"EEBench" - 64.0%', '"AA Briefcase v1.1" - 1,657', '"Terminal-Bench 4.0" - 37.6%',
      '"Harvey Legal Agent Benchmark" - 19.6%', '"HealthBench Professional" - 56.7%', '"GDPval" - 1695 Elo score', `"LatchBio's biosafety benchmark" - 62.4%`,
      '"HackerBench v0.3" - 3.3% risky dual-use prompts allowed'] },
  { url: 'https://x.ai/news/grok-4-6', status: 200, official: true, readAt: '2026-09-27T19:14:04.003Z', triedAt: null,
    quote: 'Pricing starts at $2 per million input tokens',
    claim: 'Grok 4.6, Aug 12 2026: ten benchmark numbers; no speed claim',
    printed: ['AA Intelligence Index: 61', 'GDPVal-AA v2: 1753', 'CursorBench v3.2: 69.9%', 'DeepSWE v1.1: 65.9%', 'FrontierCode v1.1 (Extended): 61.3%',
      'APEX-Agents: 57.5%', 'Terminal-Bench v3.0: 26%', 'APEX-SWE: 56.4%', 'AA-Briefcase: 1577', 'Harvey LAB (Vals): 15.8%'] },
  { url: 'https://artificialanalysis.ai/models/grok-4-7', status: 200, official: false, readAt: '2026-09-27T19:13:52.931Z', triedAt: null,
    quote: 'Time to first token: "51.22s"',
    claim: 'third party, not xAI, Grok 4.7 (xhigh): a live measurement, so it is dated by this read; a second read at 2026-09-27T19:14:02.487Z printed the same 82.1 and 51.22s',
    printed: ['Output speed: "82.1" tokens per second', 'Time to first token: "51.22s"', 'a score of "46" on the Artificial Analysis Intelligence Index', 'Cost per Intelligence Index task: "$3.74"'] },
  { url: 'https://www.layer3labs.io/guides/what-is-grok-bot', status: 200, official: false, readAt: '2026-09-27T19:14:08.286Z', triedAt: null,
    quote: 'The @grok bot on X answers when you tag it',
    claim: 'third party: "Grok Bot" has two meanings, the xAI computer-use agent and the @grok reply account on X; the agent meaning now dominates', printed: [] },
  { url: 'https://en.wikipedia.org/wiki/Grok_(chatbot)', status: 200, official: false, readAt: '2026-09-27T19:14:48.110Z', triedAt: null,
    quote: 'Grok Bot was released in beta on August 11, 2026.',
    claim: 'third party: Grok Build is a terminal coding agent for SuperGrok subscribers; the @grok account replies to posts on X; the page holds no 2026 AGI claim', printed: [] },
  { url: 'https://cellcog.ai/blog/what-is-grok-bot/', status: 200, official: false, readAt: '2026-09-27T19:14:31.671Z', triedAt: null,
    quote: '"SuperGrok (base)" – "$30/mo"',
    claim: 'third party table dated Aug 22 2026 of the plans that include Grok Bot; no weekly allowance and no per-task cost',
    printed: ['"SuperGrok (base)" – "$30/mo"', '"SuperGrok Plus" – "$100/mo"', '"SuperGrok Heavy" – "~$300/mo"', '"Cursor Pro" – "$20/mo"'] },
  { url: 'https://cybernews.com/ai-news/grok-5-artificial-general-intelligence/', status: 403, official: false, readAt: null, triedAt: '2026-09-27T19:14:44.336Z',
    quote: null, claim: 'did not load (HTTP 403 Forbidden); the AGI claim he heard is not quoted from any loaded page', printed: [] },
  // board 31: the only Grok pages found that print GSM8K or HumanEval (no Grok 4.x page read does)
  { url: 'https://x.ai/news/grok-1.5', status: 200, official: true, readAt: '2026-09-27T23:26:54.837Z', triedAt: null,
    quote: 'GSM8K: "90% 8-shot"',
    claim: 'Grok-1.5, Mar 28 2024: GSM8K 90% 8-shot and HumanEval 74.1% 0-shot; an older Grok model than any Grok Bot runs on',
    printed: ['GSM8K: "90% 8-shot"', 'HumanEval: "74.1% 0-shot"', 'Release Date: "Mar 28, 2024"'] },
  { url: 'https://x.ai/news/grok-2', status: 200, official: true, readAt: '2026-09-27T23:26:54.613Z', triedAt: null,
    quote: 'Grok-2‡ 88.4%',
    claim: 'Grok-2, Aug 13 2024: HumanEval 88.4% (Grok-2 mini 85.7%), the newest xAI page read that prints HumanEval; no GSM8K on the page',
    printed: ['Grok-2‡ 88.4%', 'Grok-2 mini‡ 85.7%', '"Aug 13, 2024"'] },
];

// ---------------------------------------------------------------------------------------------
// THEIRS: every Grok-side number. printed must be one of the source's printed strings.
export const THEIRS = {
  cursorPro: { value: 20, url: 'https://cursor.com/docs/account/pricing', printed: 'Pro: "$20/mo"', note: 'official' },
  superGrok: { value: 30, url: 'https://cellcog.ai/blog/what-is-grok-bot/', printed: '"SuperGrok (base)" – "$30/mo"', note: 'third party table dated Aug 22 2026; x.ai/grok returned 403 and grok.com/plans served no price text' },
  outTok: { value: 6, url: 'https://docs.x.ai/docs/models', printed: 'grok-4.7 (<200k tokens) | 500k | $2.00 | $6.00', note: 'official' },
  inTok: { value: 2, url: 'https://docs.x.ai/docs/models', printed: 'grok-4.7 (<200k tokens) | 500k | $2.00 | $6.00', note: 'official' },
  aaTask: { value: 3.74, url: 'https://artificialanalysis.ai/models/grok-4-7', printed: 'Cost per Intelligence Index task: "$3.74"', note: 'third party measurement, not xAI' },
  ttft: { value: 51.22, url: 'https://artificialanalysis.ai/models/grok-4-7', printed: 'Time to first token: "51.22s"', note: 'third party; xAI publishes no latency for Grok Bot or Grok 4.7' },
  outSpeed: { value: 82.1, url: 'https://artificialanalysis.ai/models/grok-4-7', printed: 'Output speed: "82.1" tokens per second', note: 'third party, Grok 4.7 xhigh' },
  termBench: { value: 37.6, url: 'https://x.ai/news/grok-4-7', printed: '"Terminal-Bench 4.0" - 37.6%', note: 'official' },
  deepSwe: { value: 71, url: 'https://x.ai/news/grok-4-7', printed: '"DeepSWE v1.1" - 71.0%', note: 'official' },
  cursorBench: { value: 46.3, url: 'https://x.ai/news/grok-4-7', printed: '"CursorBench 4.0" - 46.3%', note: 'official' },
  eeBench: { value: 64, url: 'https://x.ai/news/grok-4-7', printed: '"EEBench" - 64.0%', note: 'official' },
  health: { value: 56.7, url: 'https://x.ai/news/grok-4-7', printed: '"HealthBench Professional" - 56.7%', note: 'official' },
  harvey: { value: 19.6, url: 'https://x.ai/news/grok-4-7', printed: '"Harvey Legal Agent Benchmark" - 19.6%', note: 'official' },
  latch: { value: 62.4, url: 'https://x.ai/news/grok-4-7', printed: `"LatchBio's biosafety benchmark" - 62.4%`, note: 'official' },
  hacker: { value: 3.3, url: 'https://x.ai/news/grok-4-7', printed: '"HackerBench v0.3" - 3.3% risky dual-use prompts allowed', note: 'official' },
  gdpval: { value: 1695, url: 'https://x.ai/news/grok-4-7', printed: '"GDPval" - 1695 Elo score', note: 'official' },
  briefcase: { value: 1657, url: 'https://x.ai/news/grok-4-7', printed: '"AA Briefcase v1.1" - 1,657', note: 'official' },
  aaIdx46: { value: 61, url: 'https://x.ai/news/grok-4-6', printed: 'AA Intelligence Index: 61', note: 'official' },
  aaIdx47: { value: 46, url: 'https://artificialanalysis.ai/models/grok-4-7', printed: 'a score of "46" on the Artificial Analysis Intelligence Index', note: 'third party; a different index version from the Grok 4.6 row is likely, the two pages do not say' },
  apexAgents: { value: 57.5, url: 'https://x.ai/news/grok-4-6', printed: 'APEX-Agents: 57.5%', note: 'official' },
  frontierCode: { value: 61.3, url: 'https://x.ai/news/grok-4-6', printed: 'FrontierCode v1.1 (Extended): 61.3%', note: 'official' },
  apexSwe: { value: 56.4, url: 'https://x.ai/news/grok-4-6', printed: 'APEX-SWE: 56.4%', note: 'official' },
  oneTask: { value: 1, url: 'https://docs.x.ai/grok-bot/faq', printed: 'One Bot can run one computer-use task on its screen at a time.', note: 'official; the page writes the number as a word' },
  gsm8k15: { value: 90, url: 'https://x.ai/news/grok-1.5', printed: 'GSM8K: "90% 8-shot"', note: 'official, Grok-1.5 (Mar 28 2024), 8-shot; the page prints no record count; no Grok 4.x page read prints GSM8K' },
  humaneval2: { value: 88.4, url: 'https://x.ai/news/grok-2', printed: 'Grok-2‡ 88.4%', note: 'official, Grok-2 (Aug 13 2024), the Python HumanEval; no Grok 4.x page read prints HumanEval' },
};

// section 4 of the markdown: the benchmark rows, as each page labels the set and the model
export const BENCH = {
  termBench: ['Terminal-Bench 4.0', 'Grok 4.7'], deepSwe: ['DeepSWE v1.1', 'Grok 4.7'], cursorBench: ['CursorBench 4.0', 'Grok 4.7'],
  eeBench: ['EEBench', 'Grok 4.7'], health: ['HealthBench Professional', 'Grok 4.7'], harvey: ['Harvey Legal Agent Benchmark', 'Grok 4.7'],
  latch: ['LatchBio biosafety benchmark', 'Grok 4.7'], hacker: ['HackerBench v0.3, risky dual-use prompts allowed', 'Grok 4.7'],
  gdpval: ['GDPval', 'Grok 4.7'], briefcase: ['AA Briefcase v1.1', 'Grok 4.7'], aaIdx46: ['AA Intelligence Index', 'Grok 4.6'],
  aaIdx47: ['AA Intelligence Index (Artificial Analysis)', 'Grok 4.7 xhigh'], apexAgents: ['APEX-Agents', 'Grok 4.6'],
  frontierCode: ['FrontierCode v1.1 Extended', 'Grok 4.6'], apexSwe: ['APEX-SWE', 'Grok 4.6'],
  gsm8k15: ['GSM8K, 8-shot', 'Grok-1.5'], humaneval2: ['HumanEval (Python)', 'Grok-2'],
};

const WORD_NUMBERS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
// numbers a printed string carries, digits first, then number words
export function numbersIn(s) {
  const out = (String(s).match(/\d[\d,]*(?:\.\d+)?/g) ?? []).map((x) => Number(x.replace(/,/g, '')));
  for (const w of String(s).toLowerCase().match(/[a-z]+/g) ?? []) if (w in WORD_NUMBERS) out.push(WORD_NUMBERS[w]);
  return out;
}

// ---------------------------------------------------------------------------------------------
// OUR verdict files. HumanEval: the finished whole set when it exists, else the running partial.
// Every file build() reads, and every existence probe it makes, is recorded in `inputs` (returned by
// build()), so the test can hold the verdict and the markdown to inputs whose stamps the verdict records.
let inputs = new Set();
export function humanevalFile(root = ROOT) {
  inputs.add('exists:bench/verdicts/public-humaneval.json');
  return existsSync(path.join(root, 'bench/verdicts/public-humaneval.json'))
    ? 'bench/verdicts/public-humaneval.json' : 'bench/verdicts/public-humaneval-partial.json';
}
const GSM = 'bench/verdicts/public-gsm8k.json';
const SITE = 'bench/verdicts/site-ask.json';
const CONCEIVE = 'bench/verdicts/conceive.json';

// kind: lower (theirs / ours), higher (a percent: their error / our error), higher-rate (ours / theirs),
// scale (no ratio). ours: { file, path, scale } or null with oursNote saying "no number".
export function measureSpecs(root = ROOT, HE = humanevalFile(root)) {
  const pct = 'percent';
  const noOurs = (why) => ({ ours: null, oursNote: `no number: ${why}` });
  return [
    { name: 'Agent task success on a published computer-use benchmark (OSWorld or WebArena class)', unit: pct, kind: 'higher', theirs: null,
      theirsUrl: 'https://x.ai/news/introducing-grok-bot', theirsNote: 'no number: neither the launch page nor docs.x.ai/grok-bot/overview publishes one',
      ...noOurs('no verdict under bench/verdicts measures computer-use task success') },
    { name: 'Entry price per month that includes Grok Bot (Cursor Pro)', unit: 'USD per month', kind: 'lower', theirs: 'cursorPro',
      ...noOurs('no verdict prints a price in dollars; cost.json prints external API tokens and network calls, which are not a price') },
    { name: 'SuperGrok (base) price per month', unit: 'USD per month', kind: 'lower', theirs: 'superGrok', ...noOurs('no verdict prints a price in dollars') },
    { name: 'grok-4.7 price per million output tokens (prompt under 200k)', unit: 'USD per million tokens', kind: 'lower', theirs: 'outTok',
      ...noOurs('the native path bills no tokens, and no verdict prints a dollar cost per token or per ask; a zero token count is not a zero price') },
    { name: 'grok-4.7 price per million input tokens (prompt under 200k)', unit: 'USD per million tokens', kind: 'lower', theirs: 'inTok', ...noOurs('as above') },
    { name: 'Cost per Artificial Analysis Intelligence Index task (Grok 4.7 xhigh)', unit: 'USD per task', kind: 'lower', theirs: 'aaTask', ...noOurs('no verdict prints dollars per task') },
    { name: 'Time to first token (theirs, Grok 4.7 xhigh, third party) against the hosted round trip of one answered prompt (ours)', unit: 'seconds', kind: 'lower', theirs: 'ttft',
      ours: { file: SITE, path: 'serverRows.exact.rttMs', scale: 0.001 },
      oursNote: 'POST to the hosted /api/ask of "what is 17 times 23", round trip from the bench host; NOT the same prompts: theirs is an Intelligence Index task, ours one arithmetic prompt, so the ratio is printed and is not a like-for-like claim' },
    { name: 'Server compute per response, one answered prompt', unit: 'seconds', kind: 'lower', theirs: null,
      theirsUrl: 'https://docs.x.ai/grok-bot/overview', theirsNote: 'no number: no page read publishes server time per response',
      ours: { file: SITE, path: 'serverRows.exact.json.serverUs', scale: 0.000001 }, oursNote: 'serverUs of the exact answer on the hosted server, model cell not configured there' },
    { name: 'Output speed', unit: 'tokens per second', kind: 'higher-rate', theirs: 'outSpeed', ...noOurs('no verdict prints tokens per second; the native path answers without generating tokens') },
    { name: 'Answer computed in the browser tab, "hey"', unit: 'ns per ask', kind: 'lower', theirs: null,
      theirsUrl: 'https://x.ai/news/introducing-grok-bot', theirsNote: 'no number: no nanosecond or microsecond claim on any page read',
      ours: { file: SITE, path: 'rows[prompt=hey].nsPerAsk', scale: 1 }, oursNote: 'conversation region, provenance native, no request' },
    { name: 'Answer computed in the browser tab, "what is 17 times 23"', unit: 'ns per ask', kind: 'lower', theirs: null,
      theirsUrl: 'https://x.ai/news/introducing-grok-bot', theirsNote: 'no number on any page read',
      ours: { file: SITE, path: 'rows[prompt=what is 17 times 23].nsPerAsk', scale: 1 }, oursNote: 'exact route, no request' },
    { name: 'Direct table lookup, median per hit', unit: 'ns', kind: 'lower', theirs: null,
      theirsUrl: 'https://x.ai/news/introducing-grok-bot', theirsNote: 'no number on any page read',
      ours: { file: 'bench/verdicts/native.json', path: 'timing.hitNsMedian', scale: 1 }, oursNote: 'model off' },
    { name: 'Whole ask() median, exact route, model off', unit: 'microseconds', kind: 'lower', theirs: null,
      theirsUrl: 'https://x.ai/news/introducing-grok-bot', theirsNote: 'no number on any page read',
      ours: { file: 'bench/verdicts/speed.json', path: 'askLine (regex exact ([0-9.]+))', scale: 1 }, oursNote: 'the askLine string of speed.json' },
    { name: 'GSM8K exact accuracy, organism, all 1319 test records', unit: pct, kind: 'higher', theirs: 'gsm8k15',
      ours: { file: GSM, path: 'arms.organism.accuracy', scale: 100 },
      oursNote: 'the whole test set, the population their GSM8K number is on; 203 of the 1319 are development records (public-gsm8k.json split.contaminated), the held-out row below is the clean one; model cell qwen3:1.7b inside the loop; theirs is 8-shot on Grok-1.5, so the method differs' },
    { name: 'GSM8K exact accuracy, organism, 1116 held-out records', unit: pct, kind: 'higher', theirs: null,
      theirsUrl: 'https://x.ai/news/grok-1.5', theirsNote: 'no number: the page prints the whole set only, not a held-out split',
      ours: { file: GSM, path: 'arms.organism.splits.heldOut.accuracy', scale: 100 }, oursNote: 'held out; its control is the next held-out row, on the same 1116 records' },
    { name: 'GSM8K control: the same model alone, all 1319 test records', unit: pct, kind: 'higher', theirs: null,
      theirsUrl: 'https://x.ai/news/grok-1.5', theirsNote: 'no number: a control of ours',
      ours: { file: GSM, path: 'arms.alone.accuracy', scale: 100 }, oursNote: 'control arm, qwen3:1.7b alone, the same 1319 records as the organism row' },
    { name: 'GSM8K control: the same model alone, 1116 held-out records', unit: pct, kind: 'higher', theirs: null,
      theirsUrl: 'https://x.ai/news/grok-1.5', theirsNote: 'no number: a control of ours',
      ours: { file: GSM, path: 'arms.alone.splits.heldOut.accuracy', scale: 100 }, oursNote: 'control arm on the same 1116 held-out records as the organism held-out row' },
    { name: 'GSM8K control: null arm, all 1319 test records', unit: pct, kind: 'higher', theirs: null,
      theirsUrl: 'https://x.ai/news/grok-1.5', theirsNote: 'no number: a control of ours',
      ours: { file: GSM, path: 'arms.null.accuracy', scale: 100 }, oursNote: 'control arm, no model' },
    { name: 'GSM8K control: null arm, 1116 held-out records', unit: pct, kind: 'higher', theirs: null,
      theirsUrl: 'https://x.ai/news/grok-1.5', theirsNote: 'no number: a control of ours',
      ours: { file: GSM, path: 'arms.null.splits.heldOut.accuracy', scale: 100 }, oursNote: 'control arm, no model, held out' },
    { name: 'GSM8K share answered with no model call (native), organism', unit: pct, kind: 'higher', theirs: null,
      theirsUrl: 'https://x.ai/news/grok-1.5', theirsNote: 'no number published',
      ours: { file: GSM, path: 'arms.organism.native.share', scale: 100 }, oursNote: 'exact, memory or direct provenance, all 1319 records' },
    { name: 'GSM8K mean time per task, organism', unit: 'ms', kind: 'lower', theirs: null,
      theirsUrl: 'https://artificialanalysis.ai/models/grok-4-7', theirsNote: 'no number: the page prints time to first token, not time per GSM8K task',
      ours: { file: GSM, path: 'arms.organism.meanMs', scale: 1 }, oursNote: 'one shared Ollama queue other builders were using at the same time' },
    { name: 'GSM8K mean time per task, the same model alone', unit: 'ms', kind: 'lower', theirs: null,
      theirsUrl: 'https://artificialanalysis.ai/models/grok-4-7', theirsNote: 'no number: a control of ours',
      ours: { file: GSM, path: 'arms.alone.meanMs', scale: 1 }, oursNote: 'control arm on the same queue' },
    { name: 'Held-out GSM8K answered sub-token (nanosecond classes)', unit: pct, kind: 'higher', theirs: null,
      theirsUrl: 'https://x.ai/news/grok-4-7', theirsNote: 'no number published',
      ours: { file: 'bench/verdicts/ns.json', path: 'heldOut.share', scale: 100 }, oursNote: '200 held-out records, model off; the bar is 100' },
    { name: 'HumanEval pass@1, organism, records both arms graded (ours MultiPL-E JavaScript)', unit: pct, kind: 'higher', theirs: 'humaneval2',
      ours: { file: HE, path: 'paired(organism,alone).organism.accuracy', scale: 100 },
      oursNote: 'recounted from the file rows on the records where the organism and the model alone were both graded; theirs is the Python HumanEval on Grok-2, ours the JavaScript translation, so the sets differ by language' },
    { name: 'HumanEval control: the same model alone, records both arms graded', unit: pct, kind: 'higher', theirs: null,
      theirsUrl: 'https://x.ai/news/grok-2', theirsNote: 'no number: a control of ours',
      ours: { file: HE, path: 'paired(organism,alone).alone.accuracy', scale: 100 }, oursNote: 'control arm on the same records as the organism row' },
    { name: 'HumanEval pass@1, organism, held-out records both arms graded', unit: pct, kind: 'higher', theirs: null,
      theirsUrl: 'https://x.ai/news/grok-2', theirsNote: 'no number: the page prints the whole set only',
      ours: { file: HE, path: 'paired(organism,alone,heldOut).organism.accuracy', scale: 100 }, oursNote: 'records 40 to 160 are held out' },
    { name: 'HumanEval control: the same model alone, held-out records both arms graded', unit: pct, kind: 'higher', theirs: null,
      theirsUrl: 'https://x.ai/news/grok-2', theirsNote: 'no number: a control of ours',
      ours: { file: HE, path: 'paired(organism,alone,heldOut).alone.accuracy', scale: 100 }, oursNote: 'control arm on the same held-out records' },
    { name: 'ARC-AGI-1 evaluation, organism, one attempt', unit: pct, kind: 'higher', theirs: null,
      theirsUrl: 'https://x.ai/news/grok-4-7', theirsNote: 'no number published on the pages read',
      ours: { file: 'bench/verdicts/public-arc.json', path: 'arms.organism.accuracy', scale: 100 }, oursNote: '400 tasks, model null' },
    { name: 'Own code tasks fully solved, organism (self-code bench)', unit: pct, kind: 'higher', theirs: null,
      theirsUrl: 'https://x.ai/news/grok-4-7', theirsNote: 'no number published',
      ours: { file: 'bench/verdicts/code.json', path: 'arms.organism.accuracy', scale: 100 }, oursNote: 'tasks of this tree' },
    { name: 'Knowledge tier, held-out first sentences, recall@1', unit: pct, kind: 'higher', theirs: null,
      theirsUrl: 'https://x.ai/news/grok-4-7', theirsNote: 'no number published',
      ours: { file: 'bench/verdicts/knowledge.json', path: 'grade.recall1', scale: 100 }, oursNote: 'held out' },
    { name: 'Held-out facts answered by ask() with the model off, recall@1', unit: 'count of 200', kind: 'higher-rate', theirs: null,
      theirsUrl: 'https://x.ai/news/grok-4-7', theirsNote: 'no number published',
      ours: { file: 'bench/verdicts/native.json', path: 'split.heldOut.tableRecallAt1', scale: 1 }, oursNote: 'out of 200 held out' },
    // the population a person conceives (VISION order 42, bench/conceive.mjs): the prompts Grok is asked, not a benchmark's
    { name: 'Conceived prompts, every kind: share answered natively, organism, model off', unit: pct, kind: 'higher', theirs: null,
      theirsUrl: 'https://artificialanalysis.ai/models/grok-4-7', theirsNote: 'no number: no page read measures Grok on these prompts',
      ours: { file: CONCEIVE, path: 'arms.organism.nativeShare', scale: 100 }, oursNote: 'the rest it refused (said it does not carry them); bench/conceive-prompts.json, model arm not run' },
    { name: 'Conceived prompts, every kind: share of the gradeable passing their rubric, organism, model off', unit: pct, kind: 'higher', theirs: null,
      theirsUrl: 'https://artificialanalysis.ai/models/grok-4-7', theirsNote: 'no number: no page read measures Grok on these prompts',
      ours: { file: CONCEIVE, path: 'arms.organism.correctShare', scale: 100 }, oursNote: 'strict grading, rubrics that need no model' },
    { name: 'Conceived prompts, every kind: median per ask, organism, model off', unit: 'ns', kind: 'lower', theirs: null,
      theirsUrl: 'https://artificialanalysis.ai/models/grok-4-7', theirsNote: 'no number: the page prints time to first token on its own index tasks, not on these prompts',
      ours: { file: CONCEIVE, path: 'arms.organism.ns.median', scale: 1 }, oursNote: 'every prompt, answered or refused, on process.hrtime.bigint' },
    { name: 'Conceived prompts, every kind: median per native answer, organism, model off', unit: 'ns', kind: 'lower', theirs: null,
      theirsUrl: 'https://artificialanalysis.ai/models/grok-4-7', theirsNote: 'no number: no page read gives Grok a per-answer time on these prompts',
      ours: { file: CONCEIVE, path: 'arms.organism.ns.nativeMedian', scale: 1 }, oursNote: 'only the prompts it answered natively' },
    { name: 'Conceived prompts, every kind: share answered natively, knowledge tier off as on dilation.dev', unit: pct, kind: 'higher', theirs: null,
      theirsUrl: 'https://artificialanalysis.ai/models/grok-4-7', theirsNote: 'no number: no page read measures Grok on these prompts',
      ours: { file: CONCEIVE, path: 'arms.organism-site.nativeShare', scale: 100 }, oursNote: 'the organism-site arm: no ingested store, as deployed' },
    { name: 'Terminal-Bench 4.0 (Grok 4.7)', unit: pct, kind: 'higher', theirs: 'termBench', ...noOurs('no bench runs Terminal-Bench') },
    { name: 'DeepSWE v1.1 (Grok 4.7)', unit: pct, kind: 'higher', theirs: 'deepSwe', ...noOurs('no bench runs DeepSWE') },
    { name: 'CursorBench 4.0 (Grok 4.7)', unit: pct, kind: 'higher', theirs: 'cursorBench', ...noOurs('no bench runs CursorBench') },
    { name: 'EEBench (Grok 4.7)', unit: pct, kind: 'higher', theirs: 'eeBench', ...noOurs('no bench runs EEBench') },
    { name: 'HealthBench Professional (Grok 4.7)', unit: pct, kind: 'higher', theirs: 'health', ...noOurs('no bench runs HealthBench') },
    { name: 'Harvey Legal Agent Benchmark (Grok 4.7)', unit: pct, kind: 'higher', theirs: 'harvey', ...noOurs('no bench runs it') },
    { name: 'LatchBio biosafety benchmark (Grok 4.7)', unit: pct, kind: 'higher', theirs: 'latch', ...noOurs('no bench runs it') },
    { name: 'HackerBench v0.3, risky dual-use prompts allowed (Grok 4.7, lower is safer)', unit: pct, kind: 'lower', theirs: 'hacker', ...noOurs('no bench runs it') },
    { name: 'GDPval (Grok 4.7)', unit: 'Elo', kind: 'scale', theirs: 'gdpval', ...noOurs('no bench runs it') },
    { name: 'AA Briefcase v1.1 (Grok 4.7)', unit: 'score', kind: 'scale', theirs: 'briefcase', ...noOurs('no bench runs it') },
    { name: 'AA Intelligence Index (Grok 4.6, as xAI prints it)', unit: 'index', kind: 'scale', theirs: 'aaIdx46', ...noOurs('no bench runs it') },
    { name: 'AA Intelligence Index (Grok 4.7 xhigh, as Artificial Analysis prints it)', unit: 'index', kind: 'scale', theirs: 'aaIdx47', ...noOurs('no bench runs it') },
    { name: 'APEX-Agents (Grok 4.6)', unit: pct, kind: 'higher', theirs: 'apexAgents', ...noOurs('no bench runs it') },
    { name: 'FrontierCode v1.1 Extended (Grok 4.6)', unit: pct, kind: 'higher', theirs: 'frontierCode', ...noOurs('no bench runs it') },
    { name: 'APEX-SWE (Grok 4.6)', unit: pct, kind: 'higher', theirs: 'apexSwe', ...noOurs('no bench runs it') },
    { name: 'Computer-use tasks at once per Bot', unit: 'tasks', kind: 'higher-rate', theirs: 'oneTask', ...noOurs('no verdict measures concurrent computer-use tasks') },
    { name: 'Authored code lines in the tree', unit: 'lines', kind: 'scale', theirs: null,
      theirsUrl: 'https://x.ai/news/introducing-grok-bot', theirsNote: 'no number published',
      ours: { file: 'bench/verdicts/gate.json', path: 'lines.code', scale: 1 }, oursNote: 'the gate line of its last run' },
    { name: 'Generated organism lines', unit: 'lines', kind: 'scale', theirs: null,
      theirsUrl: 'https://x.ai/news/introducing-grok-bot', theirsNote: 'no number published',
      ours: { file: 'bench/verdicts/gate.json', path: 'lines.generated', scale: 1 }, oursNote: 'the gate line of its last run' },
  ];
}

// ---------------------------------------------------------------------------------------------
// reading our side
export function getPath(obj, p) {
  let cur = obj;
  for (const seg of p.split('.')) {
    const m = seg.match(/^([^[]+)\[([^=]+)=(.+)\]$/);
    if (m) {
      const arr = cur?.[m[1]];
      cur = Array.isArray(arr) ? arr.find((r) => String(r?.[m[2]]) === m[3]) : undefined;
    } else cur = cur?.[seg];
    if (cur === undefined) return undefined;
  }
  return cur;
}

const graded = (x) => !!x && !x.absent && typeof x.ok === 'boolean';
export function paired(file, a, b, split = null) {
  const both = (file.rows ?? []).filter((r) => (!split || r.split === split) && graded(r.arms?.[a]) && graded(r.arms?.[b]));
  const side = (arm) => {
    const correct = both.filter((r) => r.arms[arm].ok === true).length;
    return { n: both.length, correct, accuracy: both.length ? correct / both.length : null };
  };
  return { [a]: side(a), [b]: side(b) };
}

const cache = new Map();
function loadJson(root, rel) {
  inputs.add(rel);
  const k = path.join(root, rel);
  if (!cache.has(k)) cache.set(k, JSON.parse(readFileSync(k, 'utf8')));
  return cache.get(k);
}

export function rowsDigest(rows) {
  return createHash('sha256').update(JSON.stringify(rows)).digest('hex').slice(0, 16);
}
// a pinned live file, as it stood at its pin: its first pin.rows rows, refused when those rows changed
function pinnedLoader(pins) {
  const memo = new Map();
  return (root, rel) => {
    const pin = pins[rel];
    if (!pin) return loadJson(root, rel);
    if (!memo.has(rel)) {
      const file = loadJson(root, rel);
      const rows = (file.rows ?? []).slice(0, pin.rows);
      if (rows.length !== pin.rows || rowsDigest(rows) !== pin.digest) throw new Error(`pin: ${rel} no longer holds the ${pin.rows} rows it held at ${pin.at}; re-run node bench/grok-bot.mjs`);
      memo.set(rel, { ...file, at: pin.at, complete: false, rows, progress: { ...(file.progress ?? {}), done: pin.rows } });
    }
    return memo.get(rel);
  };
}

export function readOurs(root, spec, load = loadJson) {
  const file = load(root, spec.file);
  const [p, rx] = spec.path.split(' (regex ');
  const pm = p.match(/^paired\(([^,]+),([^,)]+)(?:,([^)]+))?\)\.(.+)$/);
  let raw = pm ? getPath(paired(file, pm[1], pm[2], pm[3] ?? null), pm[4]) : getPath(file, p);
  if (rx) {
    const m = String(raw).match(new RegExp(rx.replace(/\)$/, '')));
    raw = m ? Number(m[1]) : undefined;
  }
  const value = typeof raw === 'number' && Number.isFinite(raw) ? Number((raw * spec.scale).toPrecision(12)) : null;
  return { value, at: file.at ?? null, live: file.complete === false };
}

// ---------------------------------------------------------------------------------------------
// arithmetic
const sig = (x) => Number(Number(x).toPrecision(10));
const s4 = (x) => Number(Number(x).toPrecision(4)); // derived numbers in prose
export function ratioOf(kind, theirs, ours) {
  if (typeof theirs !== 'number' || typeof ours !== 'number') return null;
  if (kind === 'lower') return ours > 0 ? sig(theirs / ours) : null;
  if (kind === 'higher') return ours < 100 ? sig((100 - theirs) / (100 - ours)) : null;
  if (kind === 'higher-rate') return theirs > 0 ? sig(ours / theirs) : null;
  return null;
}
const RULE = { lower: 'theirs divided by ours (lower is better)', higher: 'their error divided by our error (100 minus each percent)', 'higher-rate': 'ours divided by theirs (higher is better)', scale: 'none: an Elo, index, score or count scale has no ratio' };
function target(kind, theirs, unit) {
  if (typeof theirs !== 'number') return 'no number on their side, so 10000x names no target';
  if (kind === 'lower') return `${sig(theirs / 10000)} ${unit} (theirs / 10000)`;
  if (kind === 'higher') { const e = sig((100 - theirs) / 10000); return `error ${e} percent, a score of ${sig(100 - e)} percent (their error / 10000)`; }
  if (kind === 'higher-rate') return `${sig(theirs * 10000)} ${unit} (theirs x 10000)`;
  return 'undefined: an Elo, index or score scale has no ratio, so 10000x names no target';
}
const pctStr = (x) => (Math.round(x * 100) / 100).toFixed(2);
const fracOf = (p, arm) => `${p[arm].correct} of ${p[arm].n} = ${pctStr(100 * p[arm].correct / p[arm].n)}%`;
// a tagged template that records every value it interpolates, so the test can hold each number the
// prose quotes to a line the command prints (report() below never prints the prose itself)
const sayInto = (list) => (strings, ...vals) => {
  list.push(...vals);
  return strings.reduce((acc, s, i) => acc + s + (i < vals.length ? String(vals[i]) : ''), '');
};

// ---------------------------------------------------------------------------------------------
export function build(root = ROOT, at = new Date().toISOString(), pins = {}) {
  cache.clear();
  inputs = new Set();
  const load = pinnedLoader(pins);
  // every number the prose derives (not a measure, pair or pin value), in order; report() prints each
  const derived = [];
  const d = (what, value) => { derived.push({ what, value }); return value; };
  const quoted = { statement: [], tenK: [] };
  const HE = Object.keys(pins).find((k) => /public-humaneval/.test(k)) ?? humanevalFile(root);
  const loaded = new Map(SOURCES.filter((s) => s.status === 200 && s.readAt).map((s) => [s.url, s]));
  const measures = measureSpecs(root, HE).map((spec) => {
    const t = spec.theirs ? THEIRS[spec.theirs] : null;
    if (t && !loaded.has(t.url)) throw new Error(`theirs ${spec.theirs} names a source that did not load: ${t.url}`);
    if (t && !loaded.get(t.url).printed.includes(t.printed)) throw new Error(`theirs ${spec.theirs}: "${t.printed}" is not a string its source printed`);
    if (t && !numbersIn(t.printed).includes(t.value)) throw new Error(`theirs ${spec.theirs}: ${t.value} is not a number in "${t.printed}"`);
    const o = spec.ours ? readOurs(root, spec.ours, load) : null;
    const ours = o ? o.value : null;
    const theirs = t ? t.value : null;
    const ratio = ratioOf(spec.kind, theirs, ours);
    const oursNote = o && ours === null ? `no number: ${spec.ours.file} ${spec.ours.path} reads no number at ${o.at} (${spec.oursNote})` : spec.oursNote;
    return {
      name: spec.name, unit: spec.unit, kind: spec.kind,
      theirs, theirsKey: spec.theirs ?? null, theirsUrl: t ? t.url : spec.theirsUrl, theirsPrinted: t ? t.printed : null, theirsNote: t ? t.note : spec.theirsNote,
      ours, oursFile: spec.ours?.file ?? null, oursPath: spec.ours?.path ?? null, oursScale: spec.ours?.scale ?? null,
      oursAt: o ? o.at : null, oursLive: o ? o.live : null, oursNote,
      ratio,
      ratioRule: typeof theirs === 'number' && typeof ours === 'number' ? RULE[spec.kind]
        : typeof theirs === 'number' ? 'no number on our side yet' : typeof ours === 'number' ? 'no number on their side' : 'no number on either side',
      target10000: target(spec.kind, theirs, spec.unit),
    };
  });

  // like with like: every pair of arms the statement quotes, on one population, recounted
  const gsm = load(root, GSM);
  const he = load(root, HE);
  const site = load(root, SITE);
  const armCount = (a) => ({ n: a.n, correct: a.correct });
  const pairs = [
    { set: 'gsm8k', population: 'all', file: GSM, at: gsm.at, organism: armCount(gsm.arms.organism), alone: armCount(gsm.arms.alone), null: armCount(gsm.arms.null), interval: gsm.arms.organism.interval },
    { set: 'gsm8k', population: 'heldOut', file: GSM, at: gsm.at, organism: armCount(gsm.arms.organism.splits.heldOut), alone: armCount(gsm.arms.alone.splits.heldOut), null: armCount(gsm.arms.null.splits.heldOut), interval: gsm.arms.organism.splits.heldOut.interval },
  ];
  for (const split of [null, 'heldOut']) {
    const pr = paired(he, 'organism', 'alone', split);
    pairs.push({ set: 'humaneval', population: split ? 'heldOut, records both arms graded' : 'records both arms graded', file: HE, at: he.at,
      organism: { n: pr.organism.n, correct: pr.organism.correct }, alone: { n: pr.alone.n, correct: pr.alone.correct }, null: null, interval: null,
      live: he.complete === false, progress: he.progress ?? null });
  }
  // every live file read, pinned at the rows it held (see the header)
  const pinsOut = {};
  for (const rel of [...new Set([...measures.filter((x) => x.oursLive).map((x) => x.oursFile), ...pairs.filter((p) => p.live).map((p) => p.file)])].sort()) {
    const f = load(root, rel);
    pinsOut[rel] = { at: f.at, rows: (f.rows ?? []).length, digest: rowsDigest(f.rows ?? []) };
  }

  const both = measures.filter((m) => typeof m.theirs === 'number' && typeof m.ours === 'number');
  const counts = {
    measures: measures.length, both: both.length,
    theirsOnly: measures.filter((m) => typeof m.theirs === 'number' && typeof m.ours !== 'number').length,
    oursOnly: measures.filter((m) => typeof m.theirs !== 'number' && typeof m.ours === 'number').length,
    neither: measures.filter((m) => typeof m.theirs !== 'number' && typeof m.ours !== 'number').length,
    sources: SOURCES.length, sourcesLoaded: loaded.size,
  };
  const ISO = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z$/;
  const checks = {
    everyLoadedSourceHasAnIsoReadAt: SOURCES.every((s) => s.status !== 200 || (ISO.test(s.readAt ?? '') && !Number.isNaN(Date.parse(s.readAt)))),
    everyFailedSourceHasNullReadAtAndAStatus: SOURCES.every((s) => s.status === 200 || (s.readAt === null && Number.isInteger(s.status) && ISO.test(s.triedAt ?? ''))),
    everyQuoteUnder15Words: SOURCES.every((s) => s.quote === null || s.quote.trim().split(/\s+/).length < 15),
    everyTheirsNumberIsPrintedByALoadedSource: true, // build() throws otherwise
    everyOursNumberHasAFileAndStamp: measures.every((m) => typeof m.ours !== 'number' || (m.oursFile && m.oursPath && m.oursAt)),
    everyMissingSideSaysSo: measures.every((m) => (typeof m.ours === 'number' || /^no number/.test(m.oursNote)) && (typeof m.theirs === 'number' || /^no number/.test(m.theirsNote))),
    aRatioWhereverBothSidesOnARatioScale: both.every((m) => m.kind === 'scale' || typeof m.ratio === 'number'),
    everyPairOnOnePopulation: pairs.every((p) => p.organism.n === p.alone.n && (!p.null || p.null.n === p.organism.n)),
  };
  const barMet = Object.values(checks).every(Boolean);

  const m = (name) => measures.find((x) => x.name.startsWith(name));
  const ttft = m('Time to first token');
  const gAll = pairs[0]; const gHeld = pairs[1]; const hAll = pairs[2]; const hHeld = pairs[3];
  const g15 = m('GSM8K exact accuracy, organism, all');
  const h2 = m('HumanEval pass@1, organism, records both');
  const rttMs = getPath(site, 'serverRows.exact.rttMs');
  const serverUs = getPath(site, 'serverRows.exact.json.serverUs');
  const heyNs = getPath(site, 'rows[prompt=hey].nsPerAsk');
  const orgMs = gsm.arms.organism.meanMs; const aloneMs = gsm.arms.alone.meanMs;
  const nat = gsm.arms.organism.native;
  const frac = fracOf;
  const heState = hAll.live ? `run not finished, ${d('HumanEval records the file held at its stamp', he.progress?.done)} of ${d('HumanEval records in the whole set', he.progress?.of)} records at ${he.at}` : `whole set at ${he.at}`;
  const heHeldText = hHeld.organism.n > 0 ? `on the ${hHeld.organism.n} held-out records both graded, ${hHeld.organism.correct} against ${hHeld.alone.correct}`
    : 'no held-out record graded by both arms yet';
  const gIn = gAll.interval && g15.theirs >= 100 * gAll.interval.lo && g15.theirs <= 100 * gAll.interval.hi;
  const conceive = load(root, CONCEIVE);
  const cNative = m('Conceived prompts, every kind: share answered natively, organism');
  const cCorrect = m('Conceived prompts, every kind: share of the gradeable');
  const cMedian = m('Conceived prompts, every kind: median per ask');
  const cNativeMedian = m('Conceived prompts, every kind: median per native answer');
  const cSite = m('Conceived prompts, every kind: share answered natively, knowledge tier off');
  const cAsked = d('conceived prompts asked (conceive.json prompts.asked)', conceive.prompts?.asked);
  const cKinds = d('conceived prompt kinds (conceive.json prompts.kinds)', conceive.prompts?.kinds);
  const say = sayInto(quoted.statement);

  const statement = say`Grok Bot is the SpaceXAI (formerly xAI) computer-use agent run with Cursor, in beta since Aug 11 2026: Bots with a persistent cloud computer (browser, filesystem, terminal) in one Firecracker microVM per user, that sign into a user's tools and hand any password, CAPTCHA or payment step back to a human. Its own pages print no dollar price for the agent alone (it rides on Cursor plans from $${THEIRS.cursorPro.value} a month and SuperGrok at $${THEIRS.superGrok.value} a month on a third party table), no latency and no agent benchmark. Of ${counts.measures} measures, ${counts.both} have a number on both sides. Speed: a third party time to first token of ${ttft.theirs} s for Grok 4.7 against our hosted round trip of ${ttft.ours} s on one arithmetic prompt (${SITE} at ${ttft.oursAt}), ${ttft.ratio}x, not the same prompts. GSM8K: xAI printed ${g15.theirs} percent 8-shot for Grok-1.5 (Mar 2024; no Grok 4.x page read prints GSM8K) and on the same ${gAll.organism.n} test records the organism scored ${frac(gAll, 'organism')} (${GSM} at ${gAll.at}), ${g15.ratio}x on error, and their ${g15.theirs} lies ${gIn ? 'inside' : 'outside'} our 95 percent interval (${d('GSM8K all records, organism 95 percent interval low, percent', pctStr(100 * gAll.interval.lo))} to ${d('GSM8K all records, organism 95 percent interval high, percent', pctStr(100 * gAll.interval.hi))}), so ${gIn ? 'the organism is not shown better than' : 'at 95 percent the organism differs from'} Grok-1.5. HumanEval: xAI printed ${h2.theirs} percent for Grok-2 (Aug 2024) on the Python set and the organism passed ${frac(hAll, 'organism')} on the JavaScript records both arms graded, ${d('HumanEval development records both arms graded', hAll.organism.n - hHeld.organism.n)} of them development records (${HE}, ${heState}), ${h2.ratio}x on error. Like with like, each against its control on the same records: GSM8K all records, organism ${frac(gAll, 'organism')} against the same model alone ${frac(gAll, 'alone')} and null ${frac(gAll, 'null')}; GSM8K held out, organism ${frac(gHeld, 'organism')} against alone ${frac(gHeld, 'alone')}; HumanEval, organism ${frac(hAll, 'organism')} against alone ${frac(hAll, 'alone')} (${heHeldText}). The speed row and the accuracy rows run on different paths: the ${ttft.ours} s answer is the exact route, which answered ${d('GSM8K records the organism answered natively (public-gsm8k.json arms.organism.native.n)', nat.n)} of ${d('GSM8K records (arms.organism.native.of)', nat.of)} GSM8K records; through the model cell the organism took a mean ${orgMs} ms per GSM8K task against ${aloneMs} ms for the model alone. On the ${cAsked} prompts over ${cKinds} kinds a person conceives (${CONCEIVE} at ${cNative.oursAt}), the organism with its model off answered ${cNative.ours} percent natively and refused the rest, passed ${cCorrect.ours} percent of the gradeable ones, and took a median ${cMedian.ours} ns per ask (${cNativeMedian.ours} ns per native answer); with its knowledge tier off, as on dilation.dev, it answered ${cSite.ours} percent natively; no Grok page read prints a number on those prompts, so these rows carry no ratio. No verdict prints our price in dollars, so no "cheaper" ratio exists yet. No model was called and nothing was trained.`;

  const verdict = {
    at, command: COMMAND, node: process.version, isTheBar: true, barMet,
    bar: 'every source carries its URL, HTTP status, an ISO read instant (null with triedAt when it did not load) and at most one quote under 15 words; every Grok number is a string a loaded source printed; every measure names on our side the verdict file, path and stamp it was read from, or says "no number"; a ratio wherever both sides have a number on a ratio scale; every pair of arms the statement quotes is on one population; every number the statement and the 10000x paragraph quote is a number the command prints',
    checks, modelCalls: 0,
    split: { heldOut: 'none', why: 'a research item: nothing is fit, trained or tuned; their numbers are read from published pages and ours from other verdicts, each dated', development: 'none', contaminated: false,
      oursContamination: `the GSM8K all-records row includes ${d('GSM8K development records (public-gsm8k.json split.development.n)', gsm.split.development.n)} development records (${GSM} split.contaminated); the held-out rows are the clean ones; the HumanEval records 0 to 39 are development (${HE} twoRulers)` },
    control: `no control of its own; the GSM8K and HumanEval rows carry theirs on the same records: the same model alone and the null arm (${GSM}, ${HE})`,
    readAtBasis: 'readAt is the instant the WebFetch result returned, read off the reading builder transcript clock (board 29 for the first 22 sources, board 31 for the last 2); a page that did not load has readAt null and its attempt instant in triedAt',
    disambiguation: [
      { name: 'Grok Bot, the computer-use agent (xAI with Cursor, beta Aug 11 2026)', url: 'https://x.ai/news/introducing-grok-bot', isTheOneHeMeans: true, why: 'a Bot works across apps and websites on its own cloud computer with a browser: the browser agent class Tesseract Browser was in' },
      { name: 'the @grok account on X that replies when tagged', url: 'https://www.layer3labs.io/guides/what-is-grok-bot', isTheOneHeMeans: false, why: 'a reply bot on X, the older meaning of "Grok bot"; no browser, no computer' },
      { name: 'Grok Build, the terminal coding agent', url: 'https://en.wikipedia.org/wiki/Grok_(chatbot)', isTheOneHeMeans: false, why: 'a command-line coding agent, not a browser agent' },
    ],
    counts, pairs, pins: pinsOut, statement, sources: SOURCES, measures,
  };

  const tenK = tenThousand({ ttft, g15, h2, gAll, hAll, rttMs, serverUs, heyNs, orgMs, he, HE }, d, sayInto(quoted.tenK));
  const conceiveRows = { cNative, cCorrect, cMedian, cNativeMedian, cSite, cAsked, cKinds, barMet: d('conceive.json barMet', conceive.barMet) };
  verdict.derived = derived;
  const lines = measures.map((x) => `${x.name} | theirs ${x.theirs ?? '-'} | ours ${x.ours ?? '-'}${x.oursAt ? ` (${x.oursFile} at ${x.oursAt})` : ''} | ratio ${x.ratio ?? '-'}`);
  // rule 1 of the board: the prose quotes no number the command does not print (the bar line is left out)
  checks.everyNumberTheProseQuotesIsPrinted = unprinted([...quoted.statement, ...quoted.tenK], report({ verdict, lines }).slice(0, -1)).length === 0;
  verdict.barMet = Object.values(checks).every(Boolean);
  const md = renderMd(verdict, tenK, conceiveRows);
  return { verdict, md, lines, tenK, quoted, inputs: [...inputs].sort() };
}

// the numeric tokens of the quoted values that no printed line carries as a token
export function unprinted(values, printedLines) {
  const tok = (s) => String(s).match(/\d+(?:\.\d+)?/g) ?? [];
  const have = new Set(printedLines.flatMap(tok));
  return [...new Set(values.flatMap(tok))].filter((x) => !have.has(x));
}

// the paragraph on what 10000x takes on the measures with both sides, from the numbers read; every
// number it derives goes through d() (printed by report()), every value it quotes through say (recorded)
function tenThousand({ ttft, g15, h2, gAll, hAll, rttMs, serverUs, heyNs, orgMs, he, HE }, d, say) {
  const t = d('speed: their time to first token / 10000, s', sig(ttft.theirs / 10000));
  const us = d('hosted server compute per answer, microseconds (site-ask.json serverRows.exact.json.serverUs)', serverUs);
  const outside = d('hosted round trip minus server compute, ms', s4(rttMs - serverUs / 1000));
  const ns = d('tab answer to "hey", ns per ask (site-ask.json rows[prompt=hey].nsPerAsk)', heyNs);
  const underFirst = d('their first token / our GSM8K mean ms per task, x', s4(ttft.theirs * 1000 / orgMs));
  const overTarget = d('our GSM8K mean ms per task / the 10000x speed target, x', s4(orgMs / (t * 1000)));
  const gTheirErr = d('GSM8K their error, percent', sig(100 - g15.theirs));
  const gErr = d('GSM8K our error, percent', s4(100 - g15.ours)); const gTarget = d('GSM8K 10000x error target, percent', sig((100 - g15.theirs) / 10000));
  const gWrong = d('GSM8K records the organism got wrong', gAll.organism.n - gAll.organism.correct);
  const gOne = d('GSM8K one wrong record, percent', s4(100 / gAll.organism.n)); const gRule3 = d('GSM8K rule of three bound at 0 wrong, percent', s4(300 / gAll.organism.n));
  const gNeed = d('GSM8K records needed with none wrong to show the 10000x target', Math.ceil(300 / gTarget));
  const gMax = d('GSM8K largest ratio the test set can certify, x', s4((100 - g15.theirs) / (300 / gAll.organism.n)));
  const hTheirErr = d('HumanEval their error, percent', sig(100 - h2.theirs));
  const hErr = d('HumanEval our error, percent', s4(100 - h2.ours)); const hTarget = d('HumanEval 10000x error target, percent', sig((100 - h2.theirs) / 10000));
  const hOf = d('HumanEval records in the set', he.progress?.of ?? hAll.organism.n); const hRule3 = d('HumanEval rule of three bound at 0 wrong, percent', s4(300 / hOf));
  const hMax = d('HumanEval largest ratio the set can certify, x', s4((100 - h2.theirs) / (300 / hOf)));
  const hNeed = d('HumanEval tasks needed with none failed to show the 10000x target', Math.ceil(300 / hTarget));
  const priceTarget = d('entry price / 10000, USD per month', sig(THEIRS.cursorPro.value / 10000));
  return say`What "10000x better and cheaper" would take on the ${[ttft, g15, h2].length} measures that have a number on both sides, from the verdicts only. Speed: 10000x under their ${ttft.theirs} s time to first token is ${t} s for the same prompts. Our hosted round trip is ${ttft.ours} s, of which the server's own compute is ${us} microseconds (the same site-ask.json row), so the server is already under ${t} s and the other ${outside} ms is the trip between the bench host and the hosted server; the tab answers "hey" in ${ns} ns with no trip at all. The prompts are not theirs: where our answers are graded, GSM8K, the organism takes a mean ${orgMs} ms a task through the model cell, ${underFirst}x under their first token and ${overTarget}x slower than the 10000x target. GSM8K accuracy: their error is ${gTheirErr} percent, so 10000x means an error of ${gTarget} percent; ours is ${gErr} percent (${gWrong} wrong of ${gAll.organism.n}). One wrong answer in ${gAll.organism.n} is already ${gOne} percent, and even 0 wrong of ${gAll.organism.n} bounds the error only below ${gRule3} percent at 95 percent (the rule of three, 3 of n), so the test set cannot show 10000x at all: showing ${gTarget} percent takes about ${gNeed} graded records with none wrong, and the largest ratio ${gAll.organism.n} records can certify is ${gMax}x. HumanEval: their error is ${hTheirErr} percent, the 10000x target ${hTarget} percent, ours ${hErr} percent on the records both arms graded (${HE}); the set has ${hOf} records, whose rule of three bound is ${hRule3} percent, so the most it can certify is ${hMax}x, and ${hTarget} percent takes about ${hNeed} tasks with none failed. Cheaper: none of the three has a dollar number on our side (no verdict prints dollars), so the ratio is not computable; their entry price of $${THEIRS.cursorPro.value} a month puts 10000x at $${priceTarget} a month.`;
}

// renders from the verdict, the 10000x paragraph and the conceive rows only: no file read and no
// existence probe here, so the markdown moves only when a file whose stamp the verdict records moves
function renderMd(v, tenK, c) {
  const src = (u) => v.sources.find((s) => s.url === u);
  const q = (u) => { const s = src(u); return s?.quote ? `"${s.quote}"` : '(nothing quoted)'; };
  const T = THEIRS;
  const row = (...c) => `| ${c.join(' | ')} |`;
  const ours = v.measures.filter((m) => typeof m.ours === 'number');
  const oursNull = v.measures.filter((m) => m.oursFile && typeof m.ours !== 'number');
  const L = [];
  L.push('# Grok Bot: what it is, what it costs, what it cannot do, and the ratios', '');
  L.push(`VISION order 43 (his words, 2026-09-27: "Look at Grok bot. And make ours 10000x better and cheaper"). Board 29 item grok-bot, rebuilt on board 31 item grok-bot-fix. Assembled by \`${v.command}\` at ${v.at}, which also writes bench/verdicts/grok-bot.json; no model call, no network. Every page below carries the instant its read returned. Every number on our side is read at run time from a verdict under bench/verdicts, with the file, path and the file's own stamp in section 6; nothing is from memory.`, '');
  L.push('## 0. Which product "Grok Bot" is', '');
  for (const d of v.disambiguation) L.push(`- ${d.name}: ${d.url}. ${d.isTheOneHeMeans ? 'THIS ONE' : 'Not this one'}: ${d.why}.`);
  L.push('');
  L.push('## 1. What it does, in its published words', '');
  L.push(`- ${src('https://x.ai/news/introducing-grok-bot').url}: ${q('https://x.ai/news/introducing-grok-bot')}; ${src('https://x.ai/news/introducing-grok-bot').claim}.`);
  L.push(`- ${src('https://docs.x.ai/grok-bot/overview').url}: ${q('https://docs.x.ai/grok-bot/overview')}; ${src('https://docs.x.ai/grok-bot/overview').claim}.`);
  L.push(`- ${src('https://docs.x.ai/grok-bot/teams-and-enterprises').url}: ${q('https://docs.x.ai/grok-bot/teams-and-enterprises')}; ${src('https://docs.x.ai/grok-bot/teams-and-enterprises').claim}.`);
  L.push(`- ${src('https://x.ai/news/grok-4-7').url}: Grok 4.7 was ${q('https://x.ai/news/grok-4-7')}. No page read names the model a Bot runs today.`, '');
  L.push('## 2. Price', '');
  L.push(row('What', 'Price', 'Page', 'Official'), row('---', '---', '---', '---'));
  L.push(row('Cursor Pro (includes Grok Bot access)', `$${T.cursorPro.value} per month`, T.cursorPro.url, 'yes'));
  L.push(row('Cursor Pro Plus / Ultra', '$60 / $200 per month', 'https://cursor.com/docs/account/pricing', 'yes'));
  L.push(row('Cursor Teams Standard / Premium', '$40 / $120 per user per month', 'https://cursor.com/docs/account/pricing', 'yes'));
  L.push(row('SuperGrok / Plus / Heavy', `$${T.superGrok.value} / $100 / ~$300 per month`, T.superGrok.url, 'no (x.ai/grok gave 403; grok.com/plans served no price text)'));
  L.push(row('grok-4.7 tokens, prompt under 200k', `$${T.inTok.value}.00 input, $${T.outTok.value}.00 output per million`, T.outTok.url, 'yes'));
  L.push(row('grok-4.7 tokens, prompt at or above 200k', '$4.00 input, $12.00 output per million', 'https://docs.x.ai/docs/models', 'yes'));
  L.push(row('per task (Artificial Analysis Intelligence Index task, Grok 4.7 xhigh)', `$${T.aaTask.value}`, T.aaTask.url, 'no'), '');
  L.push(`Usage model, official: weekly usage included, on-demand usage billed from model and token cost (${src('https://docs.x.ai/grok-bot/faq').url}). No page read prints the weekly allowance or a price per Bot task in dollars.`, '');
  L.push('## 3. Published latency or speed', '');
  L.push('- xAI: none for Grok Bot (launch page, overview, FAQ, computer-and-apps: no timing number). For the model, the Grok 4.7 page names only a fast variant at twice the output speed and twice the price.');
  L.push(`- Third party, ${T.ttft.url}: output speed ${T.outSpeed.value} tokens per second, time to first token ${T.ttft.value} s (Grok 4.7 xhigh), a live measurement dated by the read.`, '');
  L.push('## 4. Published benchmark numbers', '');
  L.push('None for Grok Bot itself (no OSWorld, WebArena or task-success number on any xAI page read). For the models:', '');
  L.push(row('Benchmark', 'Score', 'Model', 'Page'), row('---', '---', '---', '---'));
  for (const m of v.measures.filter((x) => x.theirsKey in BENCH)) {
    const [bench, model] = BENCH[m.theirsKey];
    L.push(row(bench, `${m.theirs} ${m.unit}`, model, m.theirsUrl));
  }
  L.push('', 'The two GSM8K and HumanEval numbers are from older Grok models (Grok-1.5, Mar 2024; Grok-2, Aug 2024): no Grok 4.x page read prints either set, and no bench in this tree runs any set the Grok 4.x pages print.', '');
  L.push('## 5. What it cannot do, by its own docs', '');
  L.push(`- Human steps: ${q('https://docs.x.ai/grok-bot/computer-and-apps')} are steps it cannot complete (${src('https://docs.x.ai/grok-bot/computer-and-apps').url}).`);
  L.push(`- One at a time: ${q('https://docs.x.ai/grok-bot/faq')} (${src('https://docs.x.ai/grok-bot/faq').url}).`);
  L.push(`- Isolation, his "isolated environments": ${q('https://docs.x.ai/grok-bot/teams-and-enterprises')}; ${src('https://docs.x.ai/grok-bot/teams-and-enterprises').claim} (${src('https://docs.x.ai/grok-bot/teams-and-enterprises').url}).`);
  L.push(`- Privacy and boundaries: ${src('https://docs.x.ai/grok-bot/faq').claim}.`, '');
  L.push(`Pages that did not load, so nothing is taken from them: ${v.sources.filter((s) => s.status !== 200).map((s) => `${s.url} (${s.status})`).join(', ')}. The AGI talk he heard is not quoted here: no loaded page carried it.`, '');
  L.push('## 6. The same measures for this organism, from printed verdicts only', '');
  L.push(row('Measure', 'Ours', 'Unit', 'File (path)', 'File stamped'), row('---', '---', '---', '---', '---'));
  for (const m of ours) L.push(`| ${m.name} | ${m.ours} | ${m.unit} | ${m.oursFile} (${m.oursPath}) | ${m.oursAt}${m.oursLive ? ', run not finished' : ''} |`);
  for (const m of oursNull) L.push(`| ${m.name} | no number | ${m.unit} | ${m.oursFile} (${m.oursPath}) | ${m.oursAt}${m.oursLive ? ', run not finished' : ''} |`);
  L.push('', 'Like with like: each pair below is two arms on the same records, recounted by the assembler.', '');
  L.push(row('Set', 'Population', 'Organism', 'Same model alone', 'Null', 'File at'), row('---', '---', '---', '---', '---', '---'));
  for (const p of v.pairs) L.push(row(p.set, p.population, `${p.organism.correct} of ${p.organism.n}`, `${p.alone.correct} of ${p.alone.n}`, p.null ? `${p.null.correct} of ${p.null.n}` : 'not paired', `${p.file} ${p.at}${p.live ? ' (run not finished)' : ''}`));
  L.push('');
  L.push(`On his question "and what about nanoseconds per response": the tab answers "hey" and "what is 17 times 23" in the ns per ask of section 6, and the direct table in its median ns per hit; these are the prompts it carries, not every prompt. No page read gives Grok a nanosecond, microsecond or millisecond number for a response.`, '');
  L.push('## 7. "10000x better and cheaper" as two ratios per measure', '');
  L.push('Cheaper and faster (lower is better): the ratio is theirs divided by ours, and 10000x means ours at theirs / 10000. Better on a percent benchmark: 10000x of a percentage passes 100, so the ratio is their error divided by our error, and 10000x means our error at theirs / 10000. An Elo, index or score scale has no ratio, so 10000x names no target there.', '');
  L.push(row('Measure', 'Theirs', 'Ours', 'Ratio now', 'What 10000x takes'), row('---', '---', '---', '---', '---'));
  for (const m of v.measures) {
    L.push(row(m.name, typeof m.theirs === 'number' ? `${m.theirs} ${m.unit}` : 'no number on their side', typeof m.ours === 'number' ? `${m.ours} ${m.unit}` : 'no number on our side yet',
      typeof m.ratio === 'number' ? `${m.ratio}x (${m.ratioRule})` : 'none', m.target10000));
  }
  L.push('', tenK, '');
  L.push('## 8. Where our next number moves the ratio most', '');
  L.push(`1. Dollars per answered prompt on the hosted endpoint (cheaper): their side prints $${T.cursorPro.value} a month, $${T.outTok.value} per million output tokens and $${T.aaTask.value} per task; no verdict here prints dollars. The server compute per response (section 6) is the number a dollar figure would be computed from, and a dollar column is the next number.`);
  L.push(`2. Latency and coverage on the prompts a person asks (faster, and on their population): the only speed row with a number on their side compares different prompts. ${c.cNative.oursFile} (VISION order 42, at ${c.cNative.oursAt}) asks ${c.cAsked} prompts over ${c.cKinds} kinds: the organism with its model off answered ${c.cNative.ours} percent natively at a median ${c.cMedian.ours} ns per ask (${c.cNativeMedian.ours} ns per native answer) and passed ${c.cCorrect.ours} percent of the gradeable ones; its own bar is ${c.barMet ? 'met' : 'not met'}. No Grok page read prints a number on those prompts, so these rows have no ratio; the next number is the organism's native share on them rising, and a Grok time on the same prompts.`);
  L.push('3. Agent and coding task success on one of their sets (better): Terminal-Bench 4.0 and DeepSWE v1.1 have no row on our side. bench/code.mjs and bench/public.mjs --set humaneval are the nearest benches, and neither runs a set a Grok 4.x page publishes, so a ratio there needs one of their sets added to bench/public.mjs.', '');
  L.push(`## Sources (${v.counts.sources}, ${v.counts.sourcesLoaded} loaded; read instants are when each fetch returned)`, '');
  for (const s of v.sources) {
    L.push(`- ${s.url} (HTTP ${s.status}, ${s.official ? 'official' : 'third party'}, ${s.readAt ? `read ${s.readAt}` : `not loaded, tried ${s.triedAt}`}): ${s.quote ? `"${s.quote}"; ` : ''}${s.claim}.`);
  }
  L.push('');
  return L.join('\n');
}

// the lines the command prints: the header, one line per measure, every pin, every pair (with the
// percentages and the interval the statement quotes), every derived number, then the bar. The
// statement and the 10000x paragraph are never printed whole, so the test can hold every number they
// quote to one of these lines.
export function report({ verdict, lines }) {
  const out = [`grok-bot at ${verdict.at}: measures ${verdict.counts.measures}, both ${verdict.counts.both}, theirs only ${verdict.counts.theirsOnly}, ours only ${verdict.counts.oursOnly}, neither ${verdict.counts.neither}; sources ${verdict.counts.sources}, loaded ${verdict.counts.sourcesLoaded}`];
  out.push(...lines);
  for (const [rel, p] of Object.entries(verdict.pins)) out.push(`pin ${rel} at ${p.at}: ${p.rows} rows, sha256 ${p.digest}`);
  for (const p of verdict.pairs) {
    const iv = p.interval ? `, organism 95 percent interval ${pctStr(100 * p.interval.lo)} to ${pctStr(100 * p.interval.hi)}` : '';
    out.push(`pair ${p.set} ${p.population}: organism ${fracOf(p, 'organism')}, alone ${fracOf(p, 'alone')}${p.null ? `, null ${fracOf(p, 'null')}` : ''}${iv} (${p.file} at ${p.at})`);
  }
  for (const x of verdict.derived) out.push(`derived ${x.what}: ${x.value}`);
  out.push(`${verdict.barMet ? 'BAR MET' : 'BAR NOT MET'}: ${Object.entries(verdict.checks).map(([k, x]) => `${k} ${x}`).join(', ')}`);
  return out;
}

export function main() {
  const built = build(ROOT);
  const { verdict, md } = built;
  mkdirSync(path.join(ROOT, 'docs/research'), { recursive: true });
  writeFileSync(path.join(ROOT, VERDICT_REL), JSON.stringify(verdict, null, 1) + '\n');
  writeFileSync(path.join(ROOT, MD_REL), md);
  for (const l of report(built)) console.log(l);
  return verdict.barMet ? 0 : 1;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) process.exitCode = main();
