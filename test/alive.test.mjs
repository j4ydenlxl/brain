// test/alive.test.mjs: web/alive.mjs, the living page at dilation.dev/alive (his plan: "A living page, dilation.dev/alive:
// generations, cells, arms, and what it learned in the last hour, for him and for VCs"). Author: Day 3 board, alive builder, 2026-10-01.
// What it holds the page to: every number and every source file of a full fixture reaches the page; an empty root, a root of
// empty files and a root of broken files render a "none yet" line in every section and never throw; untrusted prompts are
// escaped; no em dash ships; no digit appears that a file did not hold (the control: an empty root shows no digit but the build
// stamp and the default pointer); the real tree's page is under the cap; and the files node web/build.mjs wrote are on disk.
// THE NEO PART (his order 7, "visible constant improvement"; NEO part author: Opus 5.5 builder (ALIVE), 2026-10-01): on
// planted roots, never the tree's live neo/, every number of the part equals the planted file's (and every digit the part
// shows is one a planted file holds or a count of its rows), a missing file reads "not yet", a torn or oversized measure file
// does not break the build, nothing held-out, no token and no runtime path reaches the page or data.json, and the page has no
// script and makes no external request.
// Stub roots live under os.tmpdir() and are removed on exit, whatever the outcome.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readAlive, readNeo, aliveHtml, aliveData, aliveModel, renderAlive, neoModel, generateAlive, jsonText, hoursBefore, gapSentence, trialVerdict, refusedPath, scrub,
  secretValues, load, FILES, NEO_FILES, PAGE_CAP, DEFAULT_POINTER, SERIES_ROWS, TRIAL_ROWS, READ_LIMITS, BODY_WINDOW_MS, VELOCITY_ORDER } from '../web/alive.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'alive-test-'));
process.on('exit', () => { try { fs.rmSync(TMP, { recursive: true, force: true }); } catch { /* the OS cleans tmp */ } });
const EM = String.fromCharCode(0x2014);
const BUILT = '2026-10-01T13:15:17.552Z';
const SECTIONS = ['now', 'last-hour', 'generations', 'cells', 'self', 'cortex', 'dreams', 'apps'];

let n = 0;
function stub(files) {
  const root = path.join(TMP, 'root-' + ++n);
  for (const [rel, body] of Object.entries(files)) {
    const f = path.join(root, rel);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, typeof body === 'string' ? body : JSON.stringify(body, null, 2));
  }
  fs.mkdirSync(root, { recursive: true });
  return root;
}
/** The words a reader sees: style dropped, tags dropped, entities decoded, spaces folded. */
const visible = (html) => html.replace(/<style>[\s\S]*?<\/style>/, ' ').replace(/<title>[\s\S]*?<\/title>/, ' ').replace(/<[^>]*>/g, ' ')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const section = (html, id) => { const i = html.indexOf('id="' + id + '"'); assert.ok(i >= 0, 'section ' + id + ' is on the page'); const j = html.indexOf('</section>', i); return html.slice(i, j); };
const jsonl = (rows) => rows.map((r) => (typeof r === 'string' ? r : JSON.stringify(r))).join('\n') + '\n';
/** Every number a model holds, with its path. */
function numbersOf(model) {
  const nums = [];
  (function walk(v, p) {
    if (typeof v === 'number') nums.push([p, v]);
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x, p + '[' + i + ']'));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, p + '.' + k);
  })(model, 'model');
  return nums;
}
const wordsOf = (seen) => new Set(seen.split(/[^0-9.]+/).filter(Boolean).map((w) => w.replace(/\.$/, '')));

const EVIL = '<script>alert("pwn")</script> it\'s ' + EM + ' "quoted"';
const FULL = {
  [FILES.generations]: { generations: [
    { generation: 7, at: '2026-10-01T09:59:01.000Z', lanes: { direct: { candidates: 17, survivors: 6 }, baked: { candidates: 13, survivors: 4 } }, parent: 'direct', misses: ['m1', 'm2', 'm3'],
      note: 'recorded by hand (fixture, 2026-10-01): the first finish printed 6 and 4 ' + EM + ' kept' },
    { generation: 8, at: '2026-10-01T11:59:02.000Z', lanes: { direct: { candidates: 19, survivors: 5 }, baked: { candidates: 23, survivors: 9 } }, parent: 'baked', misses: ['m4', 'm5'] },
  ] },
  [FILES.index]: { generation: 8, cells: [
    { id: 'math-baked-g8', class: 'math', generation: 8, lane: 'baked', file: 'cells/math-baked-g8.mjs', heldout: { score: 0.8571, n: 14 }, promotedAt: '2026-10-01T11:58:00.000Z' },
    { id: 'code-direct-g7', class: 'code', generation: 7, lane: 'direct', file: 'cells/code-direct-g7.mjs', heldout: { score: 0.9231, n: 13, ok: 12 }, promotedAt: '2026-10-01T09:58:00.000Z' },
    { id: 'odd-<img src=x onerror=alert(1)>', class: 'oddclass', generation: 7, lane: 'direct', heldout: { score: 0.6667, n: 15 }, promotedAt: '2026-10-01T09:57:00.000Z' },
  ] },
  [FILES.self]: {
    trial: { generation: 8, next: 9, target: 'GROW.md', why: 'the briefs let arms quote a dev row', baseline: { generation: 8, at: '2026-10-01T11:59:02.000Z', candidates: 42, survivors: 14, rate: 0.3333 }, appliedAt: '2026-10-01T12:10:00.000Z' },
    history: [
      { generation: 6, target: 'grow/dream.mjs', verdict: 'kept', baseline: { generation: 6, candidates: 21, survivors: 5, rate: 0.2381 }, judged: { generation: 7, candidates: 30, survivors: 10, rate: 0.3333 }, reason: 'rate above the baseline', judgedAt: '2026-10-01T09:59:30.000Z' },
      { generation: 7, target: 'grow/misses.mjs', verdict: 'reverted', baseline: { generation: 7, candidates: 30, survivors: 10, rate: 0.3333 }, judged: { generation: 8, candidates: 42, survivors: 14, rate: 0.3333 }, reason: 'not above the baseline; written back', judgedAt: '2026-10-01T11:59:40.000Z' },
      { generation: 5, target: 'GROW.md', verdict: 'pending', baseline: { generation: 5, candidates: 0, survivors: 0, rate: 0 }, judged: null },
    ] },
  [FILES.cortex]: { pointer: 'claude-opus-5-5', since: 3, challenger: { model: 'claude-sonnet-5-5', by: 'fixture session', at: '2026-10-01T12:00:00.000Z' },
    history: [{ generation: 8, incumbent: 'claude-opus-5-5', challenger: 'claude-fable-5-1', pairs: 6, incumbentScore: 5.5833, challengerScore: 4.25, incumbentSurvivors: 4, challengerSurvivors: 2, verdict: 'held', at: '2026-10-01T11:59:50.000Z' }] },
  [FILES.apps]: { apps: [{ slug: 'todo', name: 'Todo', prompt: 'make me a todo app', generation: 8, path: '/apps/todo/', at: '2026-10-01T11:59:55.000Z' },
    { slug: 'evil', name: 'Evil', prompt: 'x', generation: 8, path: 'javascript:alert(1)' }] },
  [FILES.dreams]: jsonl([
    { id: 'dream-8-math-1', at: '2026-10-01T12:20:00.000Z', prompt: EVIL, class: 'math', status: 'open', generation: 8 },
    { id: 'dream-8-math-2', at: '2026-10-01T12:20:00.000Z', prompt: 'what is 41 times 43', class: 'math', status: 'open', generation: 8 },
    { id: 'dream-8-code-1', at: '2026-10-01T12:20:00.000Z', prompt: 'a regex for a hex colour', class: 'code', status: 'grown', generation: 8 },
    { id: 'dream-7-code-1', at: '2026-10-01T10:20:00.000Z', prompt: 'reverse a linked list', class: 'code', status: 'grown', generation: 7 },
    { id: 'dream-7-writing-1', at: '2026-10-01T10:20:00.000Z', prompt: 'a haiku about rain', class: 'writing', status: 'open', generation: 7 },
  ]),
  [FILES.curriculum]: jsonl([
    { id: 'cur-math-1', prompt: 'what is 2 plus 2', class: 'math', status: 'open' }, { id: 'cur-math-2', prompt: 'p', class: 'math', status: 'open' },
    { id: 'cur-math-3', prompt: 'p', class: 'math', status: 'grown' }, { id: 'cur-math-4', prompt: 'p', class: 'math', status: 'open' },
    { id: 'cur-code-1', prompt: 'p', class: 'code', status: 'open' }, { id: 'cur-code-2', prompt: 'p', class: 'code', status: 'open' },
    { id: 'cur-writing-1', prompt: 'p', class: 'writing', status: 'open' },
    '{ this line is broken',
  ]),
};

// ------------------------------------------------------------------ the NEO fixture (a planted root; never the tree's neo/)
const T0 = Date.parse('2026-09-30T00:00:00.000Z');
const atOf = (i) => new Date(T0 + i * 600000).toISOString();
/** measure row i (1..50): rows 48 to 50 hold the same counts; row 25's neo part is null (blocked); row 50 carries velocity and plateau. */
function measureRow(i) {
  const tail = i >= 48;
  const row = { at: atOf(i), era: i, generation: null, locked: { classes: 12, mean: 0.9603 },
    neo: i === 25 ? null : { tasks: 116, colonies: 99, cells: tail ? 68417 : 60000 + i * 100, mastered: tail ? 2 : i < 30 ? 0 : 1,
      heldout: tail ? { ok: 1910, n: 4416, score: 0.4325 } : { ok: 1800 + i, n: 4416, score: Number(((1800 + i) / 4416).toFixed(4)) } },
    generated: 28634279, ms: 11244, blocked: i === 25 ? ['neo: fixture blocked'] : [] };
  if (i === 50) { row.velocity = { cellsPerSecond: 4283, tasksPerMinute: 0.9, masteredPerEra: 0, eraMs: 467440, workers: 4, era: 50, futureKnob: 7, '<bad key>': 5, cellsPerHour: 'n/a' }; row.plateau = 2; }
  return row;
}
const MEASURE_LINES = [];
for (let i = 1; i <= 50; i++) { MEASURE_LINES.push(measureRow(i)); if (i === 20) MEASURE_LINES.push('{"at":"2026-09-30T03:2'); }
const TRIAL_LINES = [
  { at: '2026-10-01T10:00:00.000Z', era: 1, kind: 'genome', change: { gene: 'maxHeight', from: 3, to: 4 }, before: { ok: 10 }, after: { ok: 12 }, kept: true, why: 'more held-out rows right in both runs' },
  { at: '2026-10-01T10:10:00.000Z', era: 2, kind: 'macro', change: { op: 'add', name: 'macro.sum-of' }, before: { ok: 12 }, after: { ok: 11 }, kept: false, why: 'the mutant scored worse than the present engine' },
  { at: '2026-10-01T10:20:00.000Z', era: 3, kind: 'genome', change: null, before: null, after: null, kept: false, skipped: 'the engine cannot load a genome yet' },
  { at: '2026-10-01T10:30:00.000Z', era: 4, kind: 'genome', change: { gene: 'maxSize', from: 7, to: 9 }, before: null, after: null, kept: false, blocked: 'the clock ran out', why: 'the clock ran out' },
  { at: '2026-10-01T10:40:00.000Z', era: 5, kind: 'macro', change: { op: 'retire', name: 'macro.old' }, before: { macros: 3 }, after: null, kept: true, why: 'no kept cell used it for 20 eras' },
  '{ a torn trial',
  { at: '2026-10-01T10:50:00.000Z', era: 6, kind: 'genome', change: 'maxGenerated 200000 to 220000', before: { ok: 12 }, after: { ok: 13 }, kept: true, why: 'more held-out rows right in both runs' },
];
const ERA_DOC = { era: 17, lastGrown: { 'capital-country': 17 }, eras: [
  { era: 14, at: '2026-09-30T11:00:00.000Z', body: 'claude-routine', ms: 400000, cells: 60000, mastered: 1, grown: [] },
  { era: 15, at: '2026-09-30T13:15:17.552Z', body: 'claude-routine', ms: 410000, cells: 61000, mastered: 1, grown: [] },
  { era: 17, at: '2026-10-01T12:45:17.552Z', body: 'github', ms: 433619, workers: 4, cells: 70001, mastered: 3, blocked: [],
    grown: [{ task: 'capital-country', generated: 200215, kept: 1138, promoted: false, heldout: { ok: 17, n: 49, score: 0.3469 } }, { task: 'government-type', promoted: false }] },
  { era: 16, at: '2026-10-01T10:00:00.000Z', body: 'github', ms: 467440, workers: 4, cells: 68000, mastered: 2, grown: [{ task: 'x-task', promoted: true }] },
  { era: 13, at: '2026-10-01T11:00:00.000Z', ms: 1000, cells: 5, mastered: 0 },
  { era: 12, at: '2026-10-01T14:00:00.000Z', body: 'vercel', ms: 900, cells: 5, mastered: 0 },
  { era: 11, at: '2026-10-01T09:00:00.000Z', body: '<img src=x>', ms: 800, cells: 5, mastered: 0 },
] };
const NEO = {
  [NEO_FILES.ledger]: { tasks: [{ task: 'capital-country', generation: 6, dev: 94, heldout: 46, by: 'absorb:samayo-capital' }], generated: 28634279 },
  [NEO_FILES.era]: ERA_DOC,
  [NEO_FILES.measure]: jsonl(MEASURE_LINES),
  [NEO_FILES.absorb]: { cursor: 22, pulled: [{ id: 'samayo-capital', bytes: 1000, tasks: 2, rows: 140 }, { id: 'language-map', bytes: 163608, tasks: 0, rows: 0 }, { id: 'samayo-capital', bytes: 1000, tasks: 0, rows: 0 }],
    bytes: 10913453, rows: 15551, blocked: [{ id: 'gone', why: 'a timeout' }] },
  [NEO_FILES.frontier]: { queue: [{ url: 'https://raw.githubusercontent.com/a/b/main/c.csv' }, { url: 'q2' }, { url: 'q3' }], seen: ['u1', 'u2', 'u3', 'u4', 'u5'], repos: { 'a/b': {}, 'c/d': {} }, added: ['s1'] },
  [NEO_FILES.trials]: jsonl(TRIAL_LINES),
};
const ISO_RE = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z/g;

test('a full fixture: every number of the model and every source file reaches the page', () => {
  const root = stub(FULL);
  const data = readAlive(root);
  for (const k of Object.keys(FILES)) assert.equal(data.sources[k].state, 'read', k + ' read');
  const html = aliveHtml(data, { builtAt: BUILT });
  const seen = visible(html);
  for (const f of Object.values(FILES)) assert.ok(seen.includes(f), 'the page names ' + f);
  // every number the model holds (the model IS data.json) is a word a reader sees
  const model = aliveData(data, { builtAt: BUILT });
  const nums = numbersOf(model);
  assert.ok(nums.length > 60, 'the model holds the numbers (' + nums.length + ')');
  const words = wordsOf(seen);
  const missing = nums.filter(([, v]) => !words.has(String(v)));
  assert.deepEqual(missing, [], 'numbers in data.json that the page does not show');
  // the specific lines a reader looks for
  for (const s of ['Generation 8 ran 1.3 hours before this page was built: 14 of 42 candidate cells survived the locked judge, and 3 cells are alive.',
    '6 of 17', '4 of 13', '5 of 19', '9 of 23', 'the parent of the next generation is the baked lane', 'it worked on 2 misses', 'Generation 7',
    'corrected by hand', 'recorded by hand (fixture, 2026-10-01): the first finish printed 6 and 4, kept',
    '0.8571', 'held-out score on 14 rows', '12 of 13 rows ok', '0.6667', 'pending GROW.md', 'generation 9 judges it', 'baseline 0.3333 (14 of 42, generation 8)',
    'kept', 'reverted', '0.2381 (5 of 21, generation 6)', 'claude-sonnet-5-5', 'since generation 3', 'claude-fable-5-1', '5.5833 vs 4.25', '4 vs 2', 'held',
    'Todo', 'built from "make me a todo app"', '5 tasks set for itself', '7 curriculum rows', '1 unreadable lines', '3 tasks it set itself after generation 8']) assert.ok(seen.includes(s), 'the page shows: ' + s);
  // the last hour: the cells generation 8 promoted, and only those
  const last = visible(section(html, 'last-hour'));
  assert.ok(last.includes('math-baked-g8') && !last.includes('code-direct-g7'), 'promoted cells are the newest generation\'s');
  assert.ok(last.includes('reverted grow/misses.mjs'), 'the self verdict judged by generation 8');
  assert.ok(html.includes('href="/apps/todo/"') && html.includes('href="/apps/evil/"') && !html.includes('javascript:'), 'an app link is a path under /apps/ or nothing');
  // a rate whose denominator is 0 is none yet, never 0
  const selfRows = section(html, 'self');
  assert.ok(/generation 5<\/td><td>GROW\.md<\/td><td><span class="nm">none yet<\/span>/.test(selfRows), 'a 0-candidate baseline prints none yet');
  console.log('# alive fixture page ' + Buffer.byteLength(html) + ' bytes, ' + nums.length + ' numbers in data.json, all on the page');
});

test('the same records and stamp make the same bytes; generateAlive writes index.html and data.json', () => {
  const root = stub({ ...FULL, ...NEO });
  const a = aliveHtml(readAlive(root), { builtAt: BUILT }), b2 = aliveHtml(readAlive(root), { builtAt: BUILT });
  assert.equal(a, b2);
  const out = path.join(TMP, 'out-' + ++n);
  const r = generateAlive({ root, outDir: out, builtAt: BUILT, env: {} });
  assert.equal(fs.readFileSync(path.join(out, 'index.html'), 'utf8'), a);
  const json = fs.readFileSync(path.join(out, 'data.json'), 'utf8');
  assert.ok(!json.includes(EM), 'data.json holds no em dash character');
  assert.ok(json.includes('\\u2014'), 'the record\'s em dash is kept as its escape');
  const parsed = JSON.parse(json);
  assert.deepEqual(parsed, JSON.parse(JSON.stringify(aliveData(readAlive(root), { builtAt: BUILT }))));
  assert.equal(parsed.vitals.lastGeneration.survivors, 14);
  assert.equal(parsed.sources.generations.file, 'grown/generations.json');
  assert.equal(parsed.neo.iterations, 28634279);
  assert.equal(r.generations, 2);
  assert.equal(r.newest, 8);
  assert.deepEqual(r.neo, { iterations: 28634279, eras: 17, tasks: 116, cells: 68417, mastered: 2, series: SERIES_ROWS });
  assert.throws(() => generateAlive({ root, outDir: out }), /builtAt/);
});

test('an empty root, a root of empty files and a root of broken files: every section says none yet, nothing throws', () => {
  const ALL = [...Object.values(FILES), ...Object.values(NEO_FILES)];
  const empty = stub({});
  const blank = stub(Object.fromEntries(ALL.map((f) => [f, ''])));
  const broken = stub({ [FILES.generations]: '{', [FILES.index]: '[1,2]', [FILES.self]: 'null', [FILES.cortex]: '"x"', [FILES.apps]: '{"apps":7}', [FILES.dreams]: 'nope\n[1]\n', [FILES.curriculum]: '﻿{bad',
    [NEO_FILES.ledger]: '{', [NEO_FILES.era]: '[1]', [NEO_FILES.measure]: 'nope\n[1]\n', [NEO_FILES.absorb]: 'null', [NEO_FILES.frontier]: '"x"', [NEO_FILES.trials]: '{bad\n' });
  for (const [name, root, why] of [['empty', empty, 'is not on disk'], ['blank', blank, 'is empty'], ['broken', broken, null]]) {
    const data = readAlive(root);
    const html = aliveHtml(data, { builtAt: BUILT });
    for (const id of SECTIONS) assert.ok(section(html, id).includes('none yet'), name + ': section ' + id + ' says none yet');
    const neo = section(html, 'neo');
    // every block of the NEO part says not yet: the gap line, the seven tiles, and each h3 block
    assert.equal((neo.match(/not yet/g) || []).length >= 1 + 7 + 7, true, name + ': the NEO part says not yet in every block (' + (neo.match(/not yet/g) || []).length + ')');
    for (const block of neo.split('<h3>').slice(1)) assert.ok(block.includes('not yet'), name + ': ' + block.slice(0, 40) + ' says not yet');
    if (why) {
      assert.ok(visible(html).includes('grown/generations.json ' + why), name + ': the reason is printed');
      for (const f of Object.values(NEO_FILES)) assert.ok(visible(neo).includes(f + ' ' + why), name + ': the NEO part says ' + f + ' ' + why);
    }
    assert.equal(aliveModel(data).cortex.pointer, DEFAULT_POINTER, name + ': the default pointer');
    assert.ok(!html.includes(EM));
    // the control: with no record, no digit is on the page but the build stamp, the default pointer, and each file's own
    // byte count and hash in the footer (measured from the file, so they are checked against node:crypto here)
    if (name === 'blank') {
      const h0 = crypto.createHash('sha256').update('').digest('hex').slice(0, 16);
      for (const f of ALL) assert.ok(visible(html).includes(f + ' empty, 0 bytes, sha256 ' + h0), name + ': ' + f + ' is measured');
    }
    const digits = visible(html).split(BUILT).join(' ').split(DEFAULT_POINTER).join(' ')
      .replace(/sha256 [0-9a-f]{16}/g, ' ').replace(/\b0 bytes\b/g, ' ').match(/\d/g) || [];
    if (name !== 'broken') assert.deepEqual(digits, [], name + ': a digit no file held');
    assert.deepEqual((visible(neo).match(/\d/g) || []), [], name + ': the NEO part shows no digit no file held');
  }
  const b = readAlive(broken);
  assert.equal(b.sources.generations.state, 'not JSON');
  assert.equal(b.sources.index.state, 'wrong shape');
  assert.equal(b.sources.dreams.state, 'no JSON line');
  assert.deepEqual(Object.fromEntries(Object.entries(b.neo.sources).map(([k, s]) => [k, s.state])),
    { ledger: 'not JSON', era: 'wrong shape', measure: 'no JSON line', absorb: 'wrong shape', frontier: 'wrong shape', trials: 'no JSON line' });
  const bv = visible(aliveHtml(b, { builtAt: BUILT }));
  assert.ok(bv.includes('grown/generations.json does not parse as JSON'));
  assert.ok(bv.includes('neo/LEDGER.json does not parse as JSON') && bv.includes('neo/ERA.json does not hold the shape the organism writes') && bv.includes('grown/measure.jsonl holds no JSON line'));
  assert.doesNotThrow(() => aliveHtml(undefined));
  assert.doesNotThrow(() => aliveHtml({ generations: [null, 7, { generation: 'x' }, { generation: 1, lanes: 'no', misses: 'no' }], index: { cells: [null, { id: 3 }] }, self: 5, cortex: [], apps: [null], dreams: [7], curriculum: null, sources: 9,
    neo: { ledger: [], era: { eras: [null, 3, { era: 'x' }, { era: 2, grown: 'no', at: 7 }] }, measure: [null, { neo: 5 }, { neo: { heldout: 'x' }, velocity: [], plateau: -1 }], absorb: { pulled: 'x' }, frontier: { repos: 3 }, trials: [null, { change: 5 }], sources: 3 } }));
  const noStamp = aliveHtml(readAlive(stub(FULL)));
  assert.ok(noStamp.includes('no build stamp given') && visible(noStamp).includes('its age is not computable'), 'without a stamp the age is not computed');
});

test('untrusted prompts are escaped: no script tag, no raw quote from a record, no em dash', () => {
  const html = aliveHtml(readAlive(stub(FULL)), { builtAt: BUILT });
  assert.ok(!/<script/i.test(html), 'the page has no script element at all');
  assert.ok(html.includes('&lt;script&gt;alert(&quot;pwn&quot;)&lt;/script&gt; it&#39;s, &quot;quoted&quot;'), 'the prompt is escaped text');
  assert.ok(!html.includes('<img'), 'a cell id cannot inject an element');
  assert.ok(html.includes('odd-&lt;img src=x onerror=alert(1)&gt;'));
  assert.ok(!html.includes(EM) && !/&mdash;|&#8212;|&#x2014;/i.test(html), 'no em dash on the page');
});

test('hoursBefore: one decimal from the stamps, null when a stamp is not ISO', () => {
  assert.equal(hoursBefore('2026-10-01T11:59:02.000Z', BUILT), 1.3);
  assert.equal(hoursBefore('2026-10-01T15:00:00.000Z', BUILT), -1.7);
  assert.equal(hoursBefore('1', BUILT), null);
  assert.equal(hoursBefore('2026-10-01T11:59:02.000Z', null), null);
});

test('the real tree, copied to a scratch root first: readAlive holds the snapshot\'s generation count, and the page is under the cap', () => {
  // a snapshot: the organism rewrites grown/ and neo/ every few minutes, so the suite reads a copy (only the record files the
  // page reads, never a held-out path) and holds whatever it holds to the same rules
  const snap = path.join(TMP, 'snapshot-' + ++n);
  for (const rel of [...Object.values(FILES), ...Object.values(NEO_FILES)]) {
    assert.equal(refusedPath(rel), null);
    const from = path.join(ROOT, rel);
    if (!fs.existsSync(from)) continue;
    fs.mkdirSync(path.dirname(path.join(snap, rel)), { recursive: true });
    fs.copyFileSync(from, path.join(snap, rel));
  }
  fs.mkdirSync(snap, { recursive: true });
  const file = path.join(snap, FILES.generations);
  let held = 0;
  try { held = JSON.parse(fs.readFileSync(file, 'utf8')).generations.length; } catch { held = 0; }
  const data = readAlive(snap);
  assert.equal(data.generations.length, held);
  const html = aliveHtml(data, { builtAt: BUILT });
  const bytes = Buffer.byteLength(html);
  assert.ok(bytes < PAGE_CAP, 'the page is ' + bytes + ' bytes, cap ' + PAGE_CAP);
  assert.ok(!html.includes(EM));
  assert.ok(!jsonText(aliveData(data, { builtAt: BUILT })).includes(EM));
  section(html, 'neo');
  console.log('# alive real tree (snapshot): ' + held + ' generations, page ' + bytes + ' bytes (cap ' + PAGE_CAP + ')');
});

test('web/dist/alive holds the page and data.json that node web/build.mjs wrote from this tree', () => {
  const dir = path.join(ROOT, 'web', 'dist', 'alive');
  const page = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  const data = JSON.parse(fs.readFileSync(path.join(dir, 'data.json'), 'utf8'));
  assert.ok(Buffer.byteLength(page) < PAGE_CAP);
  assert.ok(!page.includes(EM));
  for (const id of SECTIONS) section(page, id);
  // the NEO part is on a page built after it landed (feature-detected: a page built before it holds no neo key)
  if (data.neo) { section(page, 'neo'); assert.deepEqual(Object.values(data.neo.sources).map((s) => s.file), Object.values(NEO_FILES)); }
  assert.equal(typeof data.builtAt, 'string');
  assert.ok(page.includes('Built at ' + data.builtAt), 'the page and data.json carry the same build stamp');
  assert.deepEqual(Object.values(data.sources).map((s) => s.file), Object.values(FILES));
  const src = fs.readFileSync(path.join(ROOT, 'web', 'build.mjs'), 'utf8');
  assert.ok(src.includes("generateAlive({ root: ROOT_DIR, outDir: join(DIST, 'alive'), builtAt: new Date().toISOString() })"), 'web/build.mjs passes its own clock');
  const landing = fs.readFileSync(path.join(ROOT, 'web', 'src', 'index.html'), 'utf8');
  assert.ok(landing.includes('href="alive/"'), 'the landing page links to /alive');
});

// ================================================================== THE NEO PART
const neoOf = (html) => section(html, 'neo');
const NEO_ROOT = () => stub({ ...FULL, ...NEO });
/** The numbers a text holds as words (only the words with a digit). */
const digitWords = (s) => [...wordsOf(s)].filter((w) => /\d/.test(w));
/** Every path the fs calls of fn touched (readFileSync, openSync, statSync, existsSync, readdirSync), the originals restored after. */
function touched(fn) {
  const names = ['readFileSync', 'openSync', 'statSync', 'existsSync', 'readdirSync'], orig = {}, seen = [];
  for (const k of names) { orig[k] = fs[k]; fs[k] = function (p, ...rest) { seen.push(String(p)); return orig[k].call(this, p, ...rest); }; }
  try { return { value: fn(), seen }; } finally { Object.assign(fs, orig); }
}
const relTo = (root, list) => list.filter((p) => path.resolve(p).toLowerCase().startsWith(path.resolve(root).toLowerCase())).map((p) => path.relative(root, p).split(path.sep).join('/'));

test('NEO: every number of the part equals the planted file\'s, and every one of them is on the page', () => {
  const root = NEO_ROOT();
  const data = readAlive(root);
  for (const k of Object.keys(NEO_FILES)) assert.equal(data.neo.sources[k].state, 'read', k + ' read');
  const m = aliveModel(data, { builtAt: BUILT }).neo;
  // each number against the planted object it came from (taken here from the fixture, not from the code under test)
  const whole = MEASURE_LINES.filter((r) => typeof r === 'object'), last = whole[whole.length - 1];
  assert.equal(m.iterations, NEO[NEO_FILES.ledger].generated);
  assert.equal(m.eras.count, ERA_DOC.era);
  const e17 = ERA_DOC.eras.find((r) => r.era === 17);
  assert.equal(hoursBefore(e17.at, BUILT), 0.5);
  assert.deepEqual(m.eras.last, { era: 17, at: e17.at, hoursBefore: 0.5, ms: e17.ms, body: e17.body, workers: e17.workers, grown: e17.grown.length,
    promoted: e17.grown.filter((g) => g.promoted === true).length, cells: e17.cells, mastered: e17.mastered });
  assert.deepEqual({ ...m.now, velocity: null }, { era: last.era, at: last.at, tasks: last.neo.tasks, colonies: last.neo.colonies, cells: last.neo.cells, mastered: last.neo.mastered,
    ok: last.neo.heldout.ok, n: last.neo.heldout.n, score: last.neo.heldout.score, velocity: null, plateau: last.plateau });
  // velocity: the contract's keys in its order, then any other numeric key by name; a key it cannot name or a value that is not a number is left out
  assert.deepEqual(m.now.velocity, [...VELOCITY_ORDER, 'futureKnob'].map((key) => ({ key, value: last.velocity[key] })));
  // the series: the newest SERIES_ROWS whole rows, oldest first; the blocked row's counts are null, never 0
  const tailRows = whole.slice(-SERIES_ROWS);
  assert.equal(m.series.count, SERIES_ROWS);
  assert.deepEqual(m.series.rows, tailRows.map((r) => ({ era: r.era, at: r.at, mastered: r.neo ? r.neo.mastered : null, ok: r.neo ? r.neo.heldout.ok : null,
    n: r.neo ? r.neo.heldout.n : null, score: r.neo ? r.neo.heldout.score : null })));
  const ms = tailRows.filter((r) => r.neo).map((r) => r.neo.mastered), sc = tailRows.filter((r) => r.neo).map((r) => r.neo.heldout.score);
  assert.deepEqual(m.series.mastered, { first: ms[0], firstEra: tailRows[0].era, last: ms[ms.length - 1], lastEra: last.era, min: Math.min(...ms), max: Math.max(...ms) });
  assert.deepEqual(m.series.score, { first: sc[0], firstEra: tailRows[0].era, last: sc[sc.length - 1], lastEra: last.era, min: Math.min(...sc), max: Math.max(...sc) });
  assert.equal(m.same, 3, 'rows 48, 49 and 50 hold the same counts');
  const ab = NEO[NEO_FILES.absorb], fr = NEO[NEO_FILES.frontier];
  assert.deepEqual(m.absorbed, { pulls: ab.pulled.length, sources: new Set(ab.pulled.map((p) => p.id)).size, bytes: ab.bytes, rows: ab.rows, cursor: ab.cursor, blocked: ab.blocked.length });
  assert.deepEqual(m.frontier, { queue: fr.queue.length, seen: fr.seen.length, repos: Object.keys(fr.repos).length, added: fr.added.length });
  const tl = TRIAL_LINES.filter((r) => typeof r === 'object');
  assert.deepEqual({ ...m.selfMod.trials, newest: null }, { rows: tl.length, kept: 2, reverted: 1, skipped: 1, blocked: 1, retired: 1, newest: null });
  assert.deepEqual(m.selfMod.trials.newest.map((r) => [r.era, r.kind, r.verdict]), tl.slice().reverse().map((r) => [r.era, r.kind, trialVerdict(r)]));
  assert.deepEqual(m.selfMod.trials.newest.map((r) => r.verdict), ['kept', 'retired', 'blocked', 'skipped', 'reverted', 'kept']);
  assert.deepEqual(m.selfMod.self, [{ verdict: 'kept', n: 1 }, { verdict: 'pending', n: 1 }, { verdict: 'reverted', n: 1 }]);
  assert.deepEqual(m.selfMod.cortex, [{ verdict: 'held', n: 1 }]);
  // the bodies of the day before the build: a row exactly a day before counts, an earlier one does not, a later one is "ahead"
  assert.deepEqual(m.bodies, { since: new Date(Date.parse(BUILT) - BODY_WINDOW_MS).toISOString(), eras: 6, ahead: 1, by: [
    { body: 'github', eras: 2, last: e17.at }, { body: 'claude-routine', eras: 1, last: '2026-09-30T13:15:17.552Z' }, { body: 'unrecognised', eras: 1, last: '2026-10-01T09:00:00.000Z' },
    { body: 'unrecorded', eras: 1, last: '2026-10-01T11:00:00.000Z' }, { body: 'vercel', eras: 1, last: '2026-10-01T14:00:00.000Z' }] });

  const html = aliveHtml(data, { builtAt: BUILT });
  const neo = neoOf(html), seen = visible(neo);
  const words = wordsOf(seen);
  const nums = numbersOf({ ...m, sources: null });
  assert.ok(nums.length > 300, 'the NEO model holds the numbers (' + nums.length + ')');
  assert.deepEqual(nums.filter(([, v]) => !words.has(String(v))), [], 'numbers of the NEO model the NEO part does not show');
  // the byte and line counts of the NEO files are in the footer, each against the file on disk
  const foot = visible(html.slice(html.indexOf('<footer>')));
  assert.deepEqual(numbersOf(m.sources).filter(([, v]) => !wordsOf(foot).has(String(v))), [], 'counts of the NEO files the footer does not show');
  for (const [k, rel] of Object.entries(NEO_FILES)) {
    const bytes = fs.readFileSync(path.join(root, rel));
    assert.equal(m.sources[k].bytes, bytes.length, k + ' bytes');
    assert.ok(foot.includes(rel + ' read, ' + bytes.length + ' bytes'), k + ' in the footer');
    assert.ok(foot.includes('sha256 ' + crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 16)), k + ' hash in the footer');
  }
  for (const s of [
    'Not working yet: only 2 of 116 tasks are mastered; 99 of 116 tasks have a colony at all; the colonies answer 1910 of 4416 held-out rows right (0.4325); the held-out total has not risen for 2 eras; the newest 3 measure rows hold the same task, colony, cell, mastered and held-out counts; era 17 grew 2 tasks and promoted none.',
    'iterations 28634279 candidate cells generated, every era together neo/LEDGER.json generated', 'eras run 17 the last: era 17, 2026-10-01T12:45:17.552Z neo/ERA.json era',
    'tasks 116 opened, measured at era 50', 'colonies 99 tasks with a grown colony', 'cells 68417 kept cells', 'mastered 2 / 116 tasks whose colony answers every held-out row',
    'held-out fraction 0.4325 1910 of 4416 held-out rows right, every colony together',
    'Era 17 ran at 2026-10-01T12:45:17.552Z, 0.5 hours before this page was built, on the body github , for 433619 ms with 4 workers: it grew 2 tasks and promoted 0 colonies; the organism then held 70001 cells and 3 mastered tasks.',
    '6 eras since 2026-09-30T13:15:17.552Z, by body: github 2 claude-routine 1 unrecognised 1 unrecorded 1 vercel 1',
    'the newest beat of each: github at 2026-10-01T12:45:17.552Z, claude-routine at 2026-09-30T13:15:17.552Z', '1 era rows are stamped after this build',
    'The newest 48 rows of grown/measure.jsonl , oldest on the left; the newest is era 50 at 2026-09-30T08:20:00.000Z. The newest 3 rows hold the same counts.',
    'Mastered tasks 0 at era 3 to 2 at era 50; lowest 0, highest 2.', 'Held-out fraction 0.4083 at era 3 to 0.4325 at era 50; lowest 0.4083, highest 0.4325.',
    'cells per second 4283 tasks per minute 0.9 mastered per era 0 era ms 467440 workers 4 era 50 futureKnob 7', 'plateau 2 : the eras since the held-out total last rose.',
    '2 sources over 3 pulls: 10913453 bytes, 15551 rows; the cursor stands at 22 ; 1 blocked pulls on record.', '3 links queued, 5 seen, 2 repositories, 1 sources added.',
    'kept 2 reverted 1 skipped 1 blocked 1 retired 1 6 trial rows; the newest first:', '6 genome kept maxGenerated 200000 to 220000 more held-out rows right in both runs',
    '5 macro retired op retire, name macro.old no kept cell used it for 20 eras', '4 genome blocked gene maxSize, from 7, to 9 the clock ran out', '3 genome skipped the engine cannot load a genome yet',
    "The routine's trials, by verdict: kept 1 pending 1 reverted 1 from grown/self.json", 'The cortex trials, by verdict: held 1 from grown/cortex.json',
  ]) assert.ok(seen.includes(s), 'the NEO part shows: ' + s);
  for (const f of Object.values(NEO_FILES)) assert.ok(seen.includes(f), 'the NEO part names ' + f);
  assert.ok(!seen.includes('bad key') && !seen.includes('cellsPerHour') && !seen.includes('n/a'), 'a key the contract cannot name, or a value that is not a number, is not drawn');
  assert.equal((seen.match(/not yet/g) || []).length, 1, 'a full root says "not yet" only in the lede that explains it');
  // the table of the series: a header and one row per series row, newest first, the blocked row "not recorded"
  const det = neo.match(/<details>[\s\S]*?<\/details>/)[0];
  assert.equal((det.match(/<tr>/g) || []).length, SERIES_ROWS + 1);
  assert.ok(visible(det).startsWith('the 48 rows, newest first era at mastered held-out right of rows fraction 50 2026-09-30T08:20:00.000Z 2 1910 4416 0.4325 49 '), visible(det).slice(0, 160));
  assert.ok(visible(det).includes('26 2026-09-30T04:20:00.000Z 0 1826 4416 0.4135 25 2026-09-30T04:10:00.000Z not recorded not recorded not recorded not recorded 24 '));
  assert.ok(visible(det).endsWith('3 2026-09-30T00:30:00.000Z 0 1803 4416 0.4083'));
  // the sparkline pair: inline SVG, the blocked row breaks each line in two (22 rows before it, 25 after), lowest at the bottom
  const svgs = neo.match(/<svg[\s\S]*?<\/svg>/g);
  assert.equal(svgs.length, 2);
  assert.ok(svgs[0].includes('class="spark mast"') && svgs[1].includes('class="spark held"'));
  for (const svg of svgs) {
    const lines = [...svg.matchAll(/<polyline points="([^"]*)"\/>/g)].map((x) => x[1].split(' '));
    assert.deepEqual(lines.map((l) => l.length), [22, 25]);
    assert.equal(lines[0][0], '4.0,52.0', 'the first row is the lowest value, at the left');
    assert.equal(lines[1][24], '296.0,4.0', 'the newest row is the highest value, at the right');
  }
  // the reverse control: every number the part shows (ISO stamps aside) is written in a planted file, but the age of the last era
  const planted = new Set(digitWords(Object.values({ ...FULL, ...NEO }).map((v) => (typeof v === 'string' ? v : JSON.stringify(v))).join('\n')));
  assert.deepEqual(digitWords(seen.replace(ISO_RE, ' ')).filter((w) => !planted.has(w)), ['0.5'], 'a number on the page that no planted file holds');
  console.log('# alive NEO fixture: ' + nums.length + ' numbers in the NEO part, all on the page; ' + Buffer.byteLength(neo) + ' bytes of section');
});

test('NEO: each file missing from a full root reads "not yet" with its reason, and the rest of the part still shows', () => {
  const absent = {
    ledger: ['iterations not yet neo/LEDGER.json is not on disk'],
    era: ['eras run not yet neo/ERA.json is not on disk', 'The last era not yet : neo/ERA.json is not on disk', 'Bodies that beat in the day before this build not yet : neo/ERA.json is not on disk'],
    measure: ['not yet : grown/measure.jsonl is not on disk, so nothing is measured', 'tasks not yet grown/measure.jsonl is not on disk', 'held-out fraction not yet grown/measure.jsonl is not on disk',
      'Era by era not yet : grown/measure.jsonl is not on disk', 'Velocity and plateau not yet : grown/measure.jsonl is not on disk'],
    absorb: ['What it absorbed not yet : neo/ABSORB.json is not on disk'],
    frontier: ['The crawl queue not yet : neo/frontier.json is not on disk'],
    trials: ['not yet : neo/TRIALS.jsonl is not on disk from neo/TRIALS.jsonl The routine\'s trials, by verdict: kept 1 pending 1 reverted 1'],
  };
  const gone = { ledger: '28634279', era: '433619', measure: '68417', absorb: '10913453', frontier: '3 links queued', trials: 'maxGenerated' };
  for (const [k, rel] of Object.entries(NEO_FILES)) {
    const files = { ...FULL, ...NEO };
    delete files[rel];
    const data = readAlive(stub(files));
    assert.equal(data.neo.sources[k].state, 'missing');
    const seen = visible(neoOf(aliveHtml(data, { builtAt: BUILT })));
    for (const s of absent[k]) assert.ok(seen.includes(s), k + ' missing: the part says ' + s);
    assert.ok(!seen.includes(gone[k]), k + ' missing: nothing of it is shown');
    for (const [o, v] of Object.entries(gone)) if (o !== k) assert.ok(seen.includes(v), k + ' missing: ' + o + ' still shows ' + v);
  }
  // only the ledger: one number, every other tile and every block not yet
  const onlyNeo = neoOf(aliveHtml(readAlive(stub({ [NEO_FILES.ledger]: NEO[NEO_FILES.ledger] })), { builtAt: BUILT }));
  assert.deepEqual(digitWords(visible(onlyNeo)), ['28634279']);
  assert.equal((onlyNeo.match(/<div class="val"><span class="nm">not yet<\/span><\/div>/g) || []).length, 6, 'six tiles not yet');
  for (const block of onlyNeo.split('<h3>').slice(1)) assert.ok(block.includes('not yet'), block.slice(0, 40) + ' says not yet');
  // a measure row with no velocity and no plateau (the rows the organism wrote before contract c7)
  const plain = visible(neoOf(aliveHtml(readAlive(stub({ [NEO_FILES.measure]: jsonl([1, 2, 3].map(measureRow)) })), { builtAt: BUILT })));
  assert.ok(plain.includes('Velocity and plateau not yet : the newest row of grown/measure.jsonl carries no velocity not yet : the newest row of grown/measure.jsonl carries no plateau'));
  assert.ok(plain.includes('Not working yet: only 0 of 116 tasks are mastered; 99 of 116 tasks have a colony at all; the colonies answer 1803 of 4416 held-out rows right (0.4083).'));
  assert.ok(!plain.includes('hold the same counts') && !plain.includes('has not risen'));
  // a newest row whose neo part is null (a blocked era): every count not yet, the gap not yet, never 0
  const blocked = visible(neoOf(aliveHtml(readAlive(stub({ [NEO_FILES.measure]: jsonl([measureRow(24), measureRow(25)]) })), { builtAt: BUILT })));
  assert.ok(blocked.includes('not yet : the newest row of grown/measure.jsonl holds no task, mastered or held-out count'));
  assert.ok(blocked.includes('tasks not yet opened, measured at era 25') && blocked.includes('mastered not yet') && blocked.includes('held-out fraction not yet no held-out count in the newest row'));
  // no build stamp, or one that is not ISO: the window of the bodies is not computable, and the age of the last era neither
  for (const stamp of [undefined, 'yesterday']) {
    const data = readAlive(NEO_ROOT());
    const seen = visible(neoOf(aliveHtml(data, { builtAt: stamp })));
    assert.ok(seen.includes('Bodies that beat in the day before this build not yet : no ISO build stamp given, so the window is not computable'), String(stamp));
    assert.ok(seen.includes('its age is not computable'), String(stamp));
    assert.equal(aliveModel(data, { builtAt: stamp }).neo.bodies, null);
  }
});

test('NEO: a torn measure line does not break the build; the newest whole row is the one shown', () => {
  const whole = MEASURE_LINES.filter((r) => typeof r === 'object');
  const torn = jsonl(whole.slice(0, 49)) + '{"at":"2026-09-30T08:20:00.000Z","era":50,"neo":{"tasks":116,"col';
  const root = stub({ ...FULL, ...NEO, [NEO_FILES.measure]: torn });
  const out = path.join(TMP, 'out-' + ++n);
  const r = generateAlive({ root, outDir: out, builtAt: BUILT, env: {} });
  assert.equal(r.neo.tasks, 116);
  const data = JSON.parse(fs.readFileSync(path.join(out, 'data.json'), 'utf8'));
  assert.equal(data.neo.now.era, 49);
  assert.deepEqual([data.neo.sources.measure.rows, data.neo.sources.measure.bad], [49, 1]);
  const html = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
  assert.ok(visible(html).includes('grown/measure.jsonl read, ' + Buffer.byteLength(torn) + ' bytes, 49 lines, 1 unreadable lines, sha256 ' + crypto.createHash('sha256').update(torn).digest('hex').slice(0, 16)));
  assert.ok(visible(neoOf(html)).includes('tasks 116 opened, measured at era 49'));
  // the full fixture's torn line in the middle is counted, never shown
  const mid = readAlive(stub(NEO)).neo.sources.measure;
  assert.deepEqual([mid.rows, mid.bad], [50, 1]);
  // a file of torn lines only reads "no JSON line"; a torn trial line is counted the same way
  const allTorn = readAlive(stub({ [NEO_FILES.measure]: '{"a":\n{"b\n', [NEO_FILES.trials]: '{"kept":tr\n' }));
  assert.equal(allTorn.neo.sources.measure.state, 'no JSON line');
  assert.equal(allTorn.neo.sources.trials.state, 'no JSON line');
  assert.doesNotThrow(() => aliveHtml(allTorn, { builtAt: BUILT }));
  assert.ok(visible(aliveHtml(allTorn, { builtAt: BUILT })).includes('grown/measure.jsonl holds no JSON line, so nothing is measured'));
});

test('NEO: a measure file over its read limit is read from its newest whole line and hashed whole; a JSON file over its limit is too large', () => {
  const pad = 'x'.repeat(2000), lines = [];
  for (let bytes = 0, i = 0; bytes <= READ_LIMITS.measureBytes + 50000; i++) { const l = JSON.stringify({ ...measureRow(1), era: 1000 + i, note: pad }); lines.push(l); bytes += l.length + 1; }
  for (let j = 48; j <= 50; j++) lines.push(JSON.stringify(measureRow(j)));
  const body = lines.join('\n') + '\n';
  const data = readAlive(stub({ [NEO_FILES.measure]: body }));
  const src = data.neo.sources.measure;
  assert.equal(src.state, 'read');
  assert.equal(src.bytes, Buffer.byteLength(body));
  assert.equal(src.tailBytes, READ_LIMITS.measureBytes);
  assert.equal(src.sha256, crypto.createHash('sha256').update(body).digest('hex'), 'the whole file is hashed, not the window');
  assert.equal(src.bad, 0, 'the line the window cut through is dropped, not counted unreadable');
  // exactly the whole lines inside the newest measureBytes bytes
  let inside = 0;
  for (let k = lines.length - 1, used = 0; k >= 0; k--) { used += Buffer.byteLength(lines[k]) + 1; if (used > READ_LIMITS.measureBytes) break; inside++; }
  assert.equal(src.rows, inside);
  assert.equal(data.neo.measure[data.neo.measure.length - 1].era, 50);
  const html = aliveHtml(data, { builtAt: BUILT });
  assert.ok(visible(html).includes('grown/measure.jsonl read, ' + src.bytes + ' bytes, the newest ' + READ_LIMITS.measureBytes + ' bytes read, ' + inside + ' lines'));
  assert.ok(visible(neoOf(html)).includes('cells 68417'));
  // a window that starts exactly on a line start keeps that line
  const exact = ['{"era":1,"pad":"' + 'y'.repeat(30) + '"}', '{"era":2}', '{"era":3}'].join('\n') + '\n';
  const er = stub({ 'grown/m.jsonl': exact });
  const cut = load(er, 'grown/m.jsonl', { maxBytes: Buffer.byteLength('{"era":2}\n{"era":3}\n'), tail: true });
  assert.equal(cut.body, '{"era":2}\n{"era":3}\n');
  assert.equal(load(er, 'grown/m.jsonl', { maxBytes: Buffer.byteLength('{"era":2}\n{"era":3}\n') - 1, tail: true }).body, '{"era":3}\n');
  // a JSON file over its limit: named with its size, never parsed
  const eraText = JSON.stringify(ERA_DOC);
  assert.deepEqual(load(stub({ [NEO_FILES.era]: eraText }), NEO_FILES.era, { maxBytes: 10 }), { src: { file: NEO_FILES.era, state: 'too large', bytes: Buffer.byteLength(eraText), sha256: null }, body: null });
});

test('NEO: nothing held-out, no token and no runtime path reaches the page or data.json, and no held-out or runtime file is opened', () => {
  const SENT = 'HELDOUT-SENTINEL-7f3a9c';
  const GHS = 'ghs_' + 'A1b2C3d4'.repeat(5), GHP = 'ghp_' + 'Z9y8X7w6'.repeat(5), ANT = 'sk-ant-api03-' + 'q'.repeat(40), SECRET = 'hunter2-deploy-value-0451';
  const files = { ...FULL, ...NEO,
    'state/neo-secret.json': { token: SENT }, 'state/runner/log.jsonl': SENT + '\n', 'judge/heldout/math.jsonl': SENT + '\n', 'judge/control.jsonl': SENT + '\n',
    'neo/tasks/capital-country/heldout.jsonl': JSON.stringify({ q: SENT, a: SENT }) + '\n', 'neo/tasks/capital-country/dev.jsonl': '{"q":"dev"}\n',
    [NEO_FILES.trials]: jsonl([...TRIAL_LINES,
      { at: '2026-10-01T11:00:00.000Z', era: 7, kind: 'genome', change: 'read state/neo/cache.json and C:\\brain\\state\\keys.json', kept: false,
        why: 'pushed to https://x-access-token:' + GHS + '@github.com/o/r.git with ' + GHP + ' and GITHUB_TOKEN=abcdef0123456789' },
      // a token where the clip of a why falls: scrubbed before the clip, so no piece of it survives
      { at: '2026-10-01T11:10:00.000Z', era: 8, kind: 'macro', change: { op: 'add', name: SECRET }, kept: false, why: 'w'.repeat(185) + GHP }]),
    [NEO_FILES.era]: { ...ERA_DOC, eras: [...ERA_DOC.eras, { era: 10, at: '2026-10-01T13:00:00.000Z', body: GHP, ms: 1, cells: 1, mastered: 0 }] },
    [FILES.dreams]: jsonl([{ id: 'dream-9-x-1', at: '2026-10-01T12:20:00.000Z', prompt: 'use ' + ANT + ' to call it, Bearer ' + 'b'.repeat(30), class: 'x', status: 'open', generation: 9 },
      { id: 'dream-9-x-2', at: '2026-10-01T12:20:00.000Z', prompt: 'p'.repeat(232) + SECRET, class: 'x', status: 'open', generation: 9 }]),
    [FILES.self]: { ...FULL[FILES.self], history: [{ ...FULL[FILES.self].history[0], reason: 'the deploy said ' + SECRET }] },
  };
  const root = stub(files);
  const out = path.join(TMP, 'out-' + ++n);
  const env = { BRAIN_DEPLOY_TOKEN: SECRET, PATH: '/usr/bin' };
  assert.deepEqual(secretValues(env), [SECRET]);
  const { seen } = touched(() => generateAlive({ root, outDir: out, builtAt: BUILT, env }));
  const rel = relTo(root, seen);
  assert.ok(rel.length >= 13, 'the records were read through fs (' + rel.length + ' calls)');
  assert.deepEqual(rel.filter((p) => refusedPath(p) !== null || /heldout|control|^state(\/|$)|^neo\/tasks/i.test(p)), [], 'no held-out, control, task or runtime path is touched');
  const html = fs.readFileSync(path.join(out, 'index.html'), 'utf8'), json = fs.readFileSync(path.join(out, 'data.json'), 'utf8');
  for (const [name, t] of [['the page', html], ['data.json', json]]) {
    for (const bad of [SENT, GHS, GHP, ANT, SECRET, 'ghs_', 'ghp_', 'sk-ant-', 'x-access-token', 'abcdef0123456789', 'b'.repeat(30), 'hunter2', 'state/', 'state\\', 'Z9y8X7w6']) {
      assert.ok(!t.includes(bad), name + ' holds ' + bad.slice(0, 14));
    }
    assert.ok(t.includes('[redacted]') && t.includes('[a runtime path]'), name + ' marks what it removed');
  }
  const seenText = visible(html);
  for (const s of ['pushed to https://[redacted]@github.com/o/r.git with [redacted] and GITHUB_TOKEN=[redacted]', 'read [a runtime path] and [a runtime path]', 'use [redacted] to call it, [redacted]',
    'op add, name [redacted]', 'the deploy said [redacted]', DEFAULT_POINTER, 'claude-sonnet-5-5']) assert.ok(seenText.includes(s), 'the page shows: ' + s);
  assert.ok(visible(neoOf(html)).includes('unrecognised 2'), 'a token as a body is unrecognised, never drawn');
  // the reader itself: the NEO files are none of the refused paths, and a refused path is never opened
  for (const f of [...Object.values(FILES), ...Object.values(NEO_FILES)]) assert.equal(refusedPath(f), null, f);
  const r2 = touched(() => ['state/neo-secret.json', 'judge/control.jsonl', 'judge/heldout/math.jsonl', 'neo/tasks/capital-country/heldout.jsonl', '../x.json'].map((p) => load(root, p)));
  assert.deepEqual(r2.seen, [], 'load opened nothing');
  for (const r of r2.value) assert.deepEqual(r, { src: { file: r.src.file, state: 'refused', bytes: null, sha256: null }, body: null });
});

test('refusedPath: every held-out, control, runtime or outside path is refused; the page\'s own records are not', () => {
  for (const p of ['state/x.json', 'state', 'STATE/neo.json', './state/a', 'state\\a.json', 'judge/heldout/math.jsonl', 'judge/heldout', 'Judge/HeldOut/x', 'judge/control.jsonl',
    'neo/tasks/capital-country/heldout.jsonl', 'neo//tasks/x/heldout.jsonl', 'neo\\tasks\\x\\heldout.jsonl', 'neo/tasks/heldout.jsonl', 'grown/heldout/a.json', 'neo/tasks/a/b/heldout.jsonl',
    '../brain/grown/index.json', 'grown/../state/x', '/etc/passwd', 'C:/brain/x.json', 'c:\\x', '', null, undefined]) assert.ok(refusedPath(p), String(p) + ' is refused');
  for (const p of [...Object.values(FILES), ...Object.values(NEO_FILES), 'estate/x.json', 'grown/state.json', 'neo/tasks/capital-country/dev.jsonl', 'judge/locked.json',
    'judge/controls.jsonl', 'grown/heldout-summary.json']) assert.equal(refusedPath(p), null, p + ' may be read');
});

test('NEO: the page reads with no script and makes no external request', () => {
  for (const html of [aliveHtml(readAlive(NEO_ROOT()), { builtAt: BUILT }), aliveHtml(readAlive(stub({})), { builtAt: BUILT })]) {
    assert.ok(!/<script|<link|<img|<iframe|<object|<embed|<video|<audio|<source|<form|<base|<meta http-equiv|@import|url\(/i.test(html), 'no element or rule that loads anything');
    // attributes are read from the tags only (an escaped record may say "onerror=" as text)
    const tags = html.match(/<[a-z][^>]*>/gi);
    for (const tag of tags) assert.ok(!/\son[a-z]+\s*=/i.test(tag), 'no event handler attribute: ' + tag);
    const refs = tags.flatMap((tag) => [...tag.matchAll(/\s(?:src|href|action|xlink:href|srcset|poster|data|formaction)\s*=\s*["']?([^"'\s>]*)/gi)].map((x) => x[1]));
    assert.ok(refs.length >= 6);
    assert.deepEqual(refs.filter((u) => !u.startsWith('/') || u.startsWith('//')), [], 'every link is a path on this site');
    const neo = neoOf(html);
    assert.ok(!/\shref=|\ssrc=/.test(neo), 'the NEO part links nowhere');
  }
});

test('scrub: every token shape, credential in a URL, token-named value and runtime path; nothing else', () => {
  const R = '[redacted]', P = '[a runtime path]';
  const cases = [
    ['ghp_' + 'a'.repeat(36), R], ['gho_' + 'B'.repeat(36), R], ['ghs_' + 'c'.repeat(36), R], ['github_pat_' + 'c'.repeat(30), R], ['glpat-' + 'd'.repeat(20), R], ['npm_' + 'e'.repeat(36), R],
    ['sk-ant-api03-' + 'f'.repeat(30), R], ['sk-proj-' + 'g'.repeat(30), R], ['sk-' + 'g'.repeat(24), R], ['sk_live_' + 'h'.repeat(24), R], ['rk_test_' + 'h'.repeat(24), R], ['xoxb-' + '1'.repeat(12), R],
    ['AKIAABCDEFGHIJKLMNOP', R], ['AIza' + 'i'.repeat(35), R], ['eyJhbGciOiJ.eyJzdWIiOiIx.abcdEFGH', R], ['Authorization: Bearer ' + 'j'.repeat(20), 'Authorization: ' + R],
    ['https://user:pa55word@host.example/x', 'https://' + R + '@host.example/x'], ['git clone https://x-access-token:abc@github.com/o/r', 'git clone https://' + R + '@github.com/o/r'],
    ['GITHUB_TOKEN=abc123def456', 'GITHUB_TOKEN=' + R], ['password: "hunter22"', 'password: "' + R + '"'], ['api_key=sk12345678', 'api_key=' + R], ['client-secret = 0123456789', 'client-secret = ' + R],
    ['read state/neo/x.json now', 'read ' + P + ' now'], ['C:\\brain\\state\\keys.json', P], ['./state/a', P], ['/home/runner/work/brain/state/cache x', P + ' x'], ['(state/x)', '(' + P + ')'],
  ];
  for (const [i, o] of cases) assert.equal(scrub(i), o, i.slice(0, 18));
  for (const keep of ['estate/x.json', 'grown/state.json', 'the state of the art', 'tokens: 5', 'token: ok', 'auth', 'Authorization required', 'claude-opus-5-5', 'claude-sonnet-5-5',
    'task-anthology-capital-country-and-more', crypto.createHash('sha256').update('x').digest('hex'), 'neo/tasks/capital-country/dev.jsonl', 'gpt_' + 'a'.repeat(30), 'desk_live_' + 'a'.repeat(12),
    'https://raw.githubusercontent.com/a/b/main/c.csv', 'grown/measure.jsonl', '2026-10-01T13:15:17.552Z', 'macro.sum-of', 'the colonies answer 1910 of 4416']) assert.equal(scrub(keep), keep, keep);
  assert.equal(scrub('a secretvalue1 b secretvalue1', ['secretvalue1']), 'a [redacted] b [redacted]');
  assert.equal(scrub('abc', ['abc']), 'abc', 'a value under 8 characters is not scrubbed by value');
  assert.equal(scrub(7), '7');
});

test('secretValues: the values of token-named variables only, longest first; the build removes them from both files', () => {
  const env = { GITHUB_TOKEN: 'g'.repeat(20), BRAIN_DEPLOY_TOKEN: 'd'.repeat(12), VERCEL_API_KEY: 'v'.repeat(30), MY_PASSWORD: 'p'.repeat(9), SHORT_TOKEN: 'abc',
    PATH: '/usr/bin:/bin', HOME: '/home/runner', CI: 'true', NUM_SECRET: 12345678, AWS_ACCESS_KEY_ID: 'AKIA' + 'Q'.repeat(16) };
  assert.deepEqual(secretValues(env), ['v'.repeat(30), 'g'.repeat(20), 'AKIA' + 'Q'.repeat(16), 'd'.repeat(12), 'p'.repeat(9)]);
  assert.deepEqual(secretValues(null), []);
  assert.deepEqual(secretValues(), []);
  const raw = { neo: { trials: [{ era: 1, kind: 'genome', kept: false, why: 'leak ' + 'd'.repeat(12) + ' here' }] } };
  const m = aliveModel(raw, { builtAt: BUILT, secrets: secretValues(env) });
  assert.equal(m.neo.selfMod.trials.newest[0].why, 'leak [redacted] here');
  assert.ok(!jsonText(m).includes('d'.repeat(12)) && !aliveHtml(raw, { builtAt: BUILT, secrets: secretValues(env) }).includes('d'.repeat(12)));
  assert.ok(aliveHtml(raw, { builtAt: BUILT }).includes('d'.repeat(12)), 'the control: without the secrets the value would have shown');
});

test('gapSentence: one plain sentence from the numbers, each part only when its own numbers say so', () => {
  const now = { tasks: 116, colonies: 99, cells: 1, mastered: 2, ok: 1910, n: 4416, score: 0.4325, plateau: 2 };
  assert.equal(gapSentence(null), null);
  assert.equal(gapSentence({ tasks: null, colonies: null, mastered: null, ok: null, n: null, score: null, plateau: null }), null);
  assert.equal(gapSentence({ tasks: 5, colonies: 5, mastered: 5, ok: 10, n: 10, score: 1, plateau: 0 }, { era: 3, grown: 0, promoted: 0 }, null), 'No gap shows in these numbers yet.');
  assert.equal(gapSentence({ ...now, plateau: 0 }, null, null),
    'Not working yet: only 2 of 116 tasks are mastered; 99 of 116 tasks have a colony at all; the colonies answer 1910 of 4416 held-out rows right (0.4325).');
  assert.equal(gapSentence({ tasks: 5, colonies: 5, mastered: 5, ok: 10, n: 10, score: null, plateau: 1 }, { era: 9, grown: 3, promoted: 1 }, 2),
    'Not working yet: the held-out total has not risen for 1 eras; the newest 2 measure rows hold the same task, colony, cell, mastered and held-out counts.');
  assert.equal(gapSentence({ tasks: 5, colonies: 5, mastered: 5, ok: 9, n: 10, score: null, plateau: null }, { era: 9, grown: 3, promoted: 0 }, null),
    'Not working yet: the colonies answer 9 of 10 held-out rows right; era 9 grew 3 tasks and promoted none.');
  assert.equal(gapSentence({ tasks: null, colonies: 3, mastered: 2, ok: null, n: 10, score: null, plateau: null }, { era: 9, grown: null, promoted: null }, null), 'No gap shows in these numbers yet.',
    'a part is never written from a missing number');
});

test('NEO: the last era is the highest era number (a tie, the later row); the day before the build includes its first instant', () => {
  const m = neoModel({ era: { era: 9, eras: [{ era: 9, body: 'a', at: BUILT }, { era: 3, body: 'z' }, { era: 9, body: 'b', at: BUILT }, { era: 'x' }, { era: -1 }, null] } }, { builtAt: BUILT });
  assert.equal(m.eras.last.body, 'b');
  assert.ok(m.eras.last.hoursBefore === 0, 'built at the era own stamp: 0 hours');
  const iso = (ms) => new Date(ms).toISOString(), end = Date.parse(BUILT), day = end - BODY_WINDOW_MS;
  const b = neoModel({ era: { era: 4, eras: [{ era: 1, at: iso(day - 1), body: 'old' }, { era: 2, at: iso(day), body: 'edge' }, { era: 3, at: BUILT, body: 'now' }, { era: 4, at: iso(end + 1), body: 'late' }] } }, { builtAt: BUILT }).bodies;
  assert.deepEqual(b, { since: iso(day), eras: 3, ahead: 1, by: [{ body: 'edge', eras: 1, last: iso(day) }, { body: 'late', eras: 1, last: iso(end + 1) }, { body: 'now', eras: 1, last: BUILT }] });
  const far = neoModel({ era: ERA_DOC }, { builtAt: '2027-01-01T00:00:00.000Z' }).bodies;
  assert.deepEqual(far, { since: '2026-12-31T00:00:00.000Z', eras: 0, by: [] });
  assert.ok(visible(neoOf(aliveHtml({ neo: { era: ERA_DOC } }, { builtAt: '2027-01-01T00:00:00.000Z' }))).includes('not yet : no era of neo/ERA.json ran since 2026-12-31T00:00:00.000Z'));
  // the newest SERIES_ROWS rows only, and TRIAL_ROWS trials only, newest first
  const many = neoModel({ measure: Array.from({ length: SERIES_ROWS + 5 }, (_, i) => measureRow(i + 1)), trials: Array.from({ length: TRIAL_ROWS + 3 }, (_, i) => ({ era: i, kind: 'genome', kept: i % 2 === 0 })) });
  assert.deepEqual([many.series.count, many.series.rows[0].era, many.series.rows[SERIES_ROWS - 1].era], [SERIES_ROWS, 6, SERIES_ROWS + 5]);
  assert.deepEqual(many.selfMod.trials.newest.map((r) => r.era), Array.from({ length: TRIAL_ROWS }, (_, i) => TRIAL_ROWS + 2 - i));
  assert.equal(many.selfMod.trials.rows, TRIAL_ROWS + 3);
  // a change and a why are clipped, a kind too: a record cannot flood the page
  const long = neoModel({ trials: [{ era: 1, kind: 'k'.repeat(50), change: 'c'.repeat(500), why: 'w'.repeat(500), kept: true }] }).selfMod.trials.newest[0];
  assert.deepEqual([long.kind.length, long.change.length, long.why.length], [24, 120, 200]);
});

test('trialVerdict counts as grow/evolve.mjs counts, and the bodies, crawl queue, absorbed and trial rows agree with grow/measure.mjs', async (t) => {
  assert.equal(trialVerdict({ kept: true, skipped: 'x' }), 'skipped');
  assert.equal(trialVerdict({ kept: true, change: { op: 'retire' } }), 'retired');
  assert.equal(trialVerdict({ kept: true, blocked: 'x' }), 'kept');
  assert.equal(trialVerdict({ kept: false, blocked: 'x' }), 'blocked');
  assert.equal(trialVerdict({ kept: 'true' }), 'reverted');
  assert.equal(trialVerdict({}), 'reverted');
  const rows = TRIAL_LINES.filter((r) => typeof r === 'object');
  const root = NEO_ROOT();
  const ours = aliveModel(readAlive(root), { builtAt: BUILT }).neo;
  let ev = null, ms = null;
  try { ev = await import(pathToFileURL(path.join(ROOT, 'grow', 'evolve.mjs')).href); } catch { ev = null; }
  try { ms = await import(pathToFileURL(path.join(ROOT, 'grow', 'measure.mjs')).href); } catch { ms = null; }
  if (ev && typeof ev.counts === 'function') {
    const { kept, reverted, skipped, blocked, retired } = ours.selfMod.trials;
    assert.deepEqual(ev.counts(rows), { kept, reverted, skipped, blocked, retired });
    for (const r of [...rows, { kept: true, skipped: 'x' }, { kept: 'true' }, { blocked: 1 }]) {
      const c = ev.counts([r]);
      assert.equal(c[trialVerdict(r)], 1, JSON.stringify(r).slice(0, 60));
    }
  } else t.diagnostic('grow/evolve.mjs has no counts here: that cross-check did not run');
  if (ms && typeof ms.readsOf === 'function') {
    const ctx = ms.readsOf(root);
    const bp = ms.bodiesPart(ctx, { at: BUILT }).value;
    assert.equal(bp.eras, ours.bodies.eras);
    for (const [body, k] of Object.entries(bp.by)) assert.equal(ours.bodies.by.find((x) => x.body === body).eras, k, body);
    const unnamed = ours.bodies.by.filter((x) => x.body === 'unrecorded' || x.body === 'unrecognised').reduce((s, x) => s + x.eras, 0);
    assert.equal(unnamed, bp.eras - Object.values(bp.by).reduce((s, k) => s + k, 0));
    const fp = ms.frontierPart(root, ctx).value;
    assert.deepEqual({ queue: fp.queue, seen: fp.seen, repos: fp.repos, added: fp.added }, ours.frontier);
    const ap = ms.absorbedPart(root, ctx).value;
    assert.deepEqual({ bytes: ap.bytes, rows: ap.rows, sources: ap.sources }, { bytes: ours.absorbed.bytes, rows: ours.absorbed.rows, sources: ours.absorbed.sources });
    assert.equal(ms.trialsPart(root).value.rows, ours.selfMod.trials.rows);
    assert.deepEqual([...ms.VELOCITY_KEYS], [...VELOCITY_ORDER], 'the velocity keys of contract c7, in its order');
    assert.equal(ms.MEASURE_FILE, NEO_FILES.measure);
    assert.equal(ms.ERA_FILE, NEO_FILES.era);
    assert.equal(ms.TRIALS_FILE, NEO_FILES.trials);
    assert.equal(ms.FRONTIER_STATE, NEO_FILES.frontier);
    for (const p of ['judge/heldout/x.jsonl', 'judge/control.jsonl', 'state/x', 'neo/tasks/t/heldout.jsonl']) assert.ok(ms.NEVER_READ.some((re) => re.test(p)) && refusedPath(p), p);
    for (const f of Object.values(NEO_FILES)) assert.ok(!ms.NEVER_READ.some((re) => re.test(f)), f);
  } else t.diagnostic('grow/measure.mjs has no readsOf here: those cross-checks did not run');
  if (ev && typeof ev.counts === 'function') assert.equal(ev.TRIALS_FILE, NEO_FILES.trials);
  if (ev && typeof ev.LEDGER_FILE === 'string') assert.equal(ev.LEDGER_FILE, NEO_FILES.ledger);
});

// added for the mutants the suite first let through (promoted-not-false, esc-no-scrub)
test('NEO: only a grown row with promoted true counts as promoted; a model handed straight to renderAlive is scrubbed as it is drawn', () => {
  const eras = { era: 2, eras: [{ era: 2, at: '2026-10-01T13:00:00.000Z', grown: [{ task: 'a', promoted: true }, { task: 'b' }, { task: 'c', promoted: 'yes' }, { task: 'd', promoted: false }, null] }] };
  const last = neoModel({ era: eras }, { builtAt: BUILT }).eras.last;
  assert.deepEqual([last.grown, last.promoted], [4, 1]);
  const none = neoModel({ era: { era: 2, eras: [{ era: 2, grown: [{ task: 'b' }, { task: 'c', promoted: 1 }] }] } }).eras.last;
  assert.deepEqual([none.grown, none.promoted], [2, 0]);
  assert.ok(visible(neoOf(aliveHtml({ neo: { era: eras } }, { builtAt: BUILT }))).includes('it grew 4 tasks and promoted 1 colonies'));
  // readNeo is the NEO half of readAlive
  const root = NEO_ROOT();
  assert.deepEqual(readNeo(root), readAlive(root).neo);
  // a caller that composes its own model (renderAlive is exported): every string is scrubbed again as it is escaped
  const GHP = 'ghp_' + 'Q1w2E3r4'.repeat(5);
  const m = aliveModel(readAlive(root), { builtAt: BUILT });
  m.neo.gap = 'see ' + GHP + ' in state/neo/x.json';
  m.neo.selfMod.trials.newest[0].why = 'Bearer ' + 'z'.repeat(24);
  const html = renderAlive(m);
  assert.ok(!html.includes('ghp_') && !html.includes('z'.repeat(24)) && !html.includes('state/neo'));
  assert.ok(visible(html).includes('see [redacted] in [a runtime path]'));
});
