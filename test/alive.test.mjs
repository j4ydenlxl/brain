// test/alive.test.mjs: web/alive.mjs, the living page at dilation.dev/alive (his plan: "A living page, dilation.dev/alive:
// generations, cells, arms, and what it learned in the last hour, for him and for VCs"). Author: Day 3 board, alive builder, 2026-10-01.
// What it holds the page to: every number and every source file of a full fixture reaches the page; an empty root, a root of
// empty files and a root of broken files render a "none yet" line in every section and never throw; untrusted prompts are
// escaped; no em dash ships; no digit appears that a file did not hold (the control: an empty root shows no digit but the build
// stamp and the default pointer); the real tree's page is under the cap; and the files node web/build.mjs wrote are on disk.
// Stub roots live under os.tmpdir() and are removed on exit, whatever the outcome.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readAlive, aliveHtml, aliveData, aliveModel, generateAlive, jsonText, hoursBefore, FILES, PAGE_CAP, DEFAULT_POINTER } from '../web/alive.mjs';

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

test('a full fixture: every number of the model and every source file reaches the page', () => {
  const root = stub(FULL);
  const data = readAlive(root);
  for (const k of Object.keys(FILES)) assert.equal(data.sources[k].state, 'read', k + ' read');
  const html = aliveHtml(data, { builtAt: BUILT });
  const seen = visible(html);
  for (const f of Object.values(FILES)) assert.ok(seen.includes(f), 'the page names ' + f);
  // every number the model holds (the model IS data.json) is a word a reader sees
  const model = aliveData(data, { builtAt: BUILT });
  const nums = [];
  (function walk(v, p) {
    if (typeof v === 'number') nums.push([p, v]);
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x, p + '[' + i + ']'));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, p + '.' + k);
  })(model, 'model');
  assert.ok(nums.length > 60, 'the model holds the numbers (' + nums.length + ')');
  const words = new Set(seen.split(/[^0-9.]+/).filter(Boolean).map((w) => w.replace(/\.$/, '')));
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
  const root = stub(FULL);
  const a = aliveHtml(readAlive(root), { builtAt: BUILT }), b2 = aliveHtml(readAlive(root), { builtAt: BUILT });
  assert.equal(a, b2);
  const out = path.join(TMP, 'out-' + ++n);
  const r = generateAlive({ root, outDir: out, builtAt: BUILT });
  assert.equal(fs.readFileSync(path.join(out, 'index.html'), 'utf8'), a);
  const json = fs.readFileSync(path.join(out, 'data.json'), 'utf8');
  assert.ok(!json.includes(EM), 'data.json holds no em dash character');
  assert.ok(json.includes('\\u2014'), 'the record\'s em dash is kept as its escape');
  const parsed = JSON.parse(json);
  assert.deepEqual(parsed, JSON.parse(JSON.stringify(aliveData(readAlive(root), { builtAt: BUILT }))));
  assert.equal(parsed.vitals.lastGeneration.survivors, 14);
  assert.equal(parsed.sources.generations.file, 'grown/generations.json');
  assert.equal(r.generations, 2);
  assert.equal(r.newest, 8);
  assert.throws(() => generateAlive({ root, outDir: out }), /builtAt/);
});

test('an empty root, a root of empty files and a root of broken files: every section says none yet, nothing throws', () => {
  const empty = stub({});
  const blank = stub(Object.fromEntries(Object.values(FILES).map((f) => [f, ''])));
  const broken = stub({ [FILES.generations]: '{', [FILES.index]: '[1,2]', [FILES.self]: 'null', [FILES.cortex]: '"x"', [FILES.apps]: '{"apps":7}', [FILES.dreams]: 'nope\n[1]\n', [FILES.curriculum]: '﻿{bad' });
  for (const [name, root, why] of [['empty', empty, 'is not on disk'], ['blank', blank, 'is empty'], ['broken', broken, null]]) {
    const data = readAlive(root);
    const html = aliveHtml(data, { builtAt: BUILT });
    for (const id of SECTIONS) assert.ok(section(html, id).includes('none yet'), name + ': section ' + id + ' says none yet');
    if (why) assert.ok(visible(html).includes('grown/generations.json ' + why), name + ': the reason is printed');
    assert.equal(aliveModel(data).cortex.pointer, DEFAULT_POINTER, name + ': the default pointer');
    assert.ok(!html.includes(EM));
    // the control: with no record, no digit is on the page but the build stamp, the default pointer, and each file's own
    // byte count and hash in the footer (measured from the file, so they are checked against node:crypto here)
    if (name === 'blank') {
      const h0 = crypto.createHash('sha256').update('').digest('hex').slice(0, 16);
      for (const f of Object.values(FILES)) assert.ok(visible(html).includes(f + ' empty, 0 bytes, sha256 ' + h0), name + ': ' + f + ' is measured');
    }
    const digits = visible(html).split(BUILT).join(' ').split(DEFAULT_POINTER).join(' ')
      .replace(/sha256 [0-9a-f]{16}/g, ' ').replace(/\b0 bytes\b/g, ' ').match(/\d/g) || [];
    if (name !== 'broken') assert.deepEqual(digits, [], name + ': a digit no file held');
  }
  const b = readAlive(broken);
  assert.equal(b.sources.generations.state, 'not JSON');
  assert.equal(b.sources.index.state, 'wrong shape');
  assert.equal(b.sources.dreams.state, 'no JSON line');
  assert.ok(visible(aliveHtml(b, { builtAt: BUILT })).includes('grown/generations.json does not parse as JSON'));
  assert.doesNotThrow(() => aliveHtml(undefined));
  assert.doesNotThrow(() => aliveHtml({ generations: [null, 7, { generation: 'x' }, { generation: 1, lanes: 'no', misses: 'no' }], index: { cells: [null, { id: 3 }] }, self: 5, cortex: [], apps: [null], dreams: [7], curriculum: null, sources: 9 }));
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

test('the real tree: readAlive holds the generation count of grown/generations.json, and the page is under the cap', () => {
  const file = path.join(ROOT, FILES.generations);
  const held = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')).generations.length : 0;
  const data = readAlive(ROOT);
  assert.equal(data.generations.length, held);
  const html = aliveHtml(data, { builtAt: BUILT });
  const bytes = Buffer.byteLength(html);
  assert.ok(bytes < PAGE_CAP, 'the page is ' + bytes + ' bytes, cap ' + PAGE_CAP);
  assert.ok(!html.includes(EM));
  assert.ok(!jsonText(aliveData(data, { builtAt: BUILT })).includes(EM));
  console.log('# alive real tree: ' + held + ' generations, page ' + bytes + ' bytes (cap ' + PAGE_CAP + ')');
});

test('web/dist/alive holds the page and data.json that node web/build.mjs wrote from this tree', () => {
  const dir = path.join(ROOT, 'web', 'dist', 'alive');
  const page = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  const data = JSON.parse(fs.readFileSync(path.join(dir, 'data.json'), 'utf8'));
  assert.ok(Buffer.byteLength(page) < PAGE_CAP);
  assert.ok(!page.includes(EM));
  for (const id of SECTIONS) section(page, id);
  assert.equal(typeof data.builtAt, 'string');
  assert.ok(page.includes('Built at ' + data.builtAt), 'the page and data.json carry the same build stamp');
  assert.deepEqual(Object.values(data.sources).map((s) => s.file), Object.values(FILES));
  const src = fs.readFileSync(path.join(ROOT, 'web', 'build.mjs'), 'utf8');
  assert.ok(src.includes("generateAlive({ root: ROOT_DIR, outDir: join(DIST, 'alive'), builtAt: new Date().toISOString() })"), 'web/build.mjs passes its own clock');
  const landing = fs.readFileSync(path.join(ROOT, 'web', 'src', 'index.html'), 'utf8');
  assert.ok(landing.includes('href="alive/"'), 'the landing page links to /alive');
});
