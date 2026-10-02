// test/neo-gate.test.mjs: THE GATE (contract c2), THE STAGE (c3) and THE CORE (c4) of the NEO engine, on temp roots only.
// The gate: serve true on a tier "neo" row only while the colony is mastered, and a serving colony answers only a prompt
// that fits its task's question template exactly. The three measured wrong answers are the regression rows. The stage:
// grow --stage writes one file and nothing else; merge applies it with the proofs of a direct grow. The core: the pure
// search imports nothing but the kernel. No test reads the tree's grown/ or neo/.
// Author: NEO board builder (THE ENGINE), 2026-10-01.
import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync, spawn as spawnAsync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as CORE from '../grow/neo-core.mjs';
import {
  gateText, validTemplate, templateSource, fitsTemplates, deriveTemplates, isMastered, rowServes, GATE_MAX_TEMPLATES, GATE_MAX_TEXT, GATE_MAX_SLOT,
} from '../grow/neo-core.mjs';
import { norm, PRIMS } from '../grow/neo-kernel.mjs';
import { spawn, growTask, mergeStage, regate, status, main, stageErrors, featuresOf, STAGE_KIND, STAGE_VERSION, rowsOf } from '../grow/neo.mjs';
import { renderIndexMjs, answersOf, GROWN_BODY } from '../grow/store.mjs';
import { expectOk } from '../judge/judge.mjs';
import { shaText } from '../grow/teach.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GROW = path.join(HERE, '..', 'grow');
const ENGINE = path.join(GROW, 'neo.mjs');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'neo-gate-'));
const cleanup = () => { try { fs.rmSync(TMP, { recursive: true, force: true }); } catch { /* already gone */ } };
after(cleanup);
process.on('exit', cleanup);
let dirN = 0;
const tmpDir = (name) => { const d = path.join(TMP, name + '-' + (++dirN)); fs.mkdirSync(d, { recursive: true }); return d; };
const put = (root, rel, text) => { const f = path.join(root, ...rel.split('/')); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); return f; };
const jsonl = (rows) => rows.map((r) => JSON.stringify(r)).join('\n') + '\n';
const readJ = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const fresh = (f) => import(pathToFileURL(f).href + '?t=' + Date.now() + '-' + Math.random().toString(36).slice(2));
const indexOf = (root) => readJ(path.join(root, 'grown', 'index.json'));
const grownOf = (root) => fresh(path.join(root, 'grown', 'index.mjs'));
/** Every file under the given dirs of root as relative path -> base64 bytes. */
function bytesOf(root, dirs = ['grown', 'neo', 'judge']) {
  const out = {};
  const walk = (d) => { if (!fs.existsSync(d)) return; for (const n of fs.readdirSync(d).sort()) { const f = path.join(d, n); if (fs.statSync(f).isDirectory()) walk(f); else out[path.relative(root, f)] = fs.readFileSync(f).toString('base64'); } };
  for (const d of dirs) walk(path.join(root, d));
  return out;
}
const run = (args) => {
  const r = spawnSync(process.execPath, [ENGINE, ...args], { encoding: 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024 });
  const lines = String(r.stdout || '').trim().split(/\r?\n/);
  let last = null;
  try { last = JSON.parse(lines.at(-1)); } catch { last = null; }
  return { code: r.status, last, lines, stderr: r.stderr };
};

// ---------------------------------------------------------------- the three measured wrong answers
const WRONG = Object.freeze([
  { q: 'which country has the capital Paris', culprit: 'capital-country', got: 'Dushanbe is the capital of Tajikistan.' },
  { q: 'what continent is Peru in', culprit: 'country-capital', got: 'The capital of in is Lima.' },
  { q: 'and germany?', culprit: 'country-population', got: 'Germany has a population of about 83 million people.' },
]);

// ---------------------------------------------------------------- the fixture: three relations of one table, stand-in colonies
const COUNTRIES = [['France', 'Paris', 68], ['Japan', 'Tokyo', 124], ['Germany', 'Berlin', 83], ['Peru', 'Lima', 34], ['Italy', 'Rome', 59], ['Spain', 'Madrid', 48], ['Egypt', 'Cairo', 105], ['Canada', 'Ottawa', 40], ['Kenya', 'Nairobi', 55], ['Norway', 'Oslo', 5], ['Tajikistan', 'Dushanbe', 10], ['New Zealand', 'Wellington', 5]];
const DEV = {
  'country-capital': COUNTRIES.map(([c, cap], i) => ({ q: [`What is the capital of ${c}?`, `Which city is the capital of ${c}?`, `Name the capital city of ${c}.`][i % 3], expect: { contains: [cap] }, answer: `The capital of ${c} is ${cap}.` })),
  'capital-country': COUNTRIES.map(([c, cap], i) => ({ q: [`Which country has ${cap} as its capital?`, `Of which country is ${cap} the capital?`, `${cap} is the capital of which country?`][i % 3], expect: { contains: [c] }, answer: `${cap} is the capital of ${c}.` })),
  'country-population': COUNTRIES.map(([c, , p], i) => ({ q: [`What is the population of ${c}?`, `How many people live in ${c}?`][i % 2], expect: { contains: [p + ' million'] }, answer: `${c} has a population of about ${p} million people.` })),
};
const HELD = Object.fromEntries(Object.keys(DEV).map((t) => [t, DEV[t].slice(0, 10).map((r) => ({ q: r.q.toUpperCase(), expect: r.expect }))]));
const T_FN = "const t = (q) => String(q ?? '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(' ').filter(Boolean).join(' ');";
const low = (s) => s.toLowerCase();
const BODY = {
  'country-capital': [
    'const CAP = ' + JSON.stringify(Object.fromEntries(COUNTRIES.map(([c, cap]) => [low(c), cap]))) + ';',
    "export function answer(q) { const s = ' ' + t(q) + ' '; const c = Object.keys(CAP).find((k) => s.includes(' ' + k + ' ')); if (!c) return null; const w = t(q).split(' '); return 'The capital of ' + w[w.length - 1] + ' is ' + CAP[c] + '.'; }",
  ],
  'capital-country': [
    'const CTRY = ' + JSON.stringify(Object.fromEntries(COUNTRIES.map(([c, cap]) => [low(cap), [cap, c]]))) + ';',
    "const SHAPES = [['which country has ', ' as its capital'], ['of which country is ', ' the capital'], ['', ' is the capital of which country']];",
    'export function answer(q) {',
    '  const s = t(q);',
    '  for (const [a, b] of SHAPES) if (s.startsWith(a) && s.endsWith(b)) { const k = s.slice(a.length, s.length - b.length); if (CTRY[k]) return CTRY[k][0] + \' is the capital of \' + CTRY[k][1] + \'.\'; }',
    "  return (' ' + s + ' ').includes(' capital ') ? 'Dushanbe is the capital of Tajikistan.' : null; // the measured wrong answer: the nearest memory row",
    '}',
  ],
  'country-population': [
    'const POP = ' + JSON.stringify(Object.fromEntries(COUNTRIES.map(([c, , p]) => [low(c), [c, p]]))) + ';',
    "export function answer(q) { const s = ' ' + t(q) + ' '; const c = Object.keys(POP).find((k) => s.includes(' ' + k + ' ')); return c ? POP[c][0] + ' has a population of about ' + POP[c][1] + ' million people.' : null; }",
  ],
};
const FIRST = { 'country-capital': 'What is the capital of Japan?', 'capital-country': 'Which country has Tokyo as its capital?', 'country-population': 'What is the population of Germany?' };
const EXPECT = { 'country-capital': { contains: ['Tokyo'] }, 'capital-country': { contains: ['Japan'] }, 'country-population': { contains: ['83 million'] } };
const neoId = (task) => task + '-neo-g1';
/** A stand-in colony module of a task (the shape grow/neo.mjs compiles: meta, examples, colony, answer, can). */
const colonyText = (task, first = FIRST[task]) => [
  '// stand-in colony of ' + task + ' for test/neo-gate.test.mjs',
  'export const meta = Object.freeze(' + JSON.stringify({ id: neoId(task), class: task, generation: 1, lane: 'neo', version: 1 }) + ');',
  'export const examples = ' + JSON.stringify([{ q: first, expect: EXPECT[task] }]) + ';',
  "export const colony = Object.freeze({ cells: 3, kernel: 'test' });",
  T_FN, ...BODY[task],
  'export function can(q) { return answer(q) !== null; }', '',
].join('\n');
const lockedText = (id, cls, word, q, a) => [
  '// a locked (hand-grown) cell for test/neo-gate.test.mjs',
  'export const meta = Object.freeze(' + JSON.stringify({ id, class: cls, generation: 1, lane: 'a', version: 1 }) + ');',
  'export const examples = ' + JSON.stringify([{ q, expect: { contains: [a.split(' ')[0]] } }]) + ';',
  T_FN,
  "export function can(q) { return (' ' + t(q) + ' ').includes(' " + word + " '); }",
  'export function answer(q) { return can(q) ? ' + JSON.stringify(a) + ' : null; }', '',
].join('\n');
const HAND_ROW = Object.freeze({ id: 'hand-g1', class: 'writing', generation: 1, lane: 'a', file: 'cells/hand-g1.mjs', heldout: { score: 0.5, n: 2, ok: 1 }, promotedAt: '2026-09-30T00:00:00.000Z' });
const ATLAS_ROW = Object.freeze({ id: 'atlas-a-g1', class: 'geography', generation: 1, lane: 'a', file: 'cells/atlas-a-g1.mjs', heldout: { score: 0.8, n: 5, ok: 4 }, promotedAt: '2026-09-30T00:00:00.000Z' });
const LOCKED = {
  'hand-g1': [HAND_ROW, lockedText('hand-g1', 'writing', 'haiku', 'write a haiku about rain', 'soft rain on the roof')],
  'atlas-a-g1': [ATLAS_ROW, lockedText('atlas-a-g1', 'geography', 'france', 'What is the capital of France?', 'Paris, from the locked atlas cell.')],
};
const MASTERED = Object.freeze({ score: 1, n: 10, ok: 10 });
const NEAR = Object.freeze({ score: 0.9, n: 10, ok: 9 });
const neoRow = (task, heldout) => ({ id: neoId(task), class: task, task, generation: 1, lane: 'neo', tier: 'neo', file: 'cells/' + neoId(task) + '.mjs', cells: 3, generated: 100, heldout: { ...heldout }, promotedAt: '2026-10-01T00:00:00.000Z' });
/**
 * A tree with locked cells and stand-in colonies in grown/ (rows as a pre-gate index: no serve, no templates), the tasks
 * opened in neo/LEDGER.json with their dev and held-out files.
 */
function gateRoot({ tasks = Object.keys(DEV), held = MASTERED, locked = ['hand-g1'], neoFirst = false, first = {} } = {}) {
  const root = tmpDir('gate-root');
  const lockedRows = locked.map((id) => { put(root, 'grown/' + LOCKED[id][0].file, LOCKED[id][1]); return LOCKED[id][0]; });
  const neoRows = tasks.map((task) => { put(root, 'grown/cells/' + neoId(task) + '.mjs', colonyText(task, first[task])); return neoRow(task, typeof held === 'function' ? held(task) : held); });
  const index = { generation: 3, cells: neoFirst ? [...neoRows, ...lockedRows] : [...lockedRows, ...neoRows] };
  put(root, 'grown/index.json', JSON.stringify(index, null, 2) + '\n');
  put(root, 'grown/index.mjs', renderIndexMjs(index));
  const ledger = { tasks: [], generated: 0, note: 'the teacher keeps this key' };
  for (const task of Object.keys(DEV)) {
    const d = jsonl(DEV[task]), h = jsonl(HELD[task]);
    put(root, 'neo/tasks/' + task + '/dev.jsonl', d);
    put(root, 'neo/tasks/' + task + '/heldout.jsonl', h);
    ledger.tasks.push({ task, generation: 1, devSha: shaText(d), heldoutSha: shaText(h), dev: DEV[task].length, heldout: 10, by: 'test', at: '2026-10-01T00:00:00.000Z' });
  }
  put(root, 'neo/LEDGER.json', JSON.stringify(ledger, null, 2) + '\n');
  return root;
}

// ---------------------------------------------------------------- the template: fixed words plus entity slots
test('deriveTemplates: fixed words, one slot per run of other words, numbers a numeric slot, a lone shape no template', () => {
  assert.deepEqual(deriveTemplates(DEV['country-capital'].map((r) => r.q)), ['name the capital city of {1-4}', 'what is the capital of {1-3}', 'which city is the capital of {1-3}']);
  assert.deepEqual(deriveTemplates(['Double 4', 'Double 17', 'Double 230', 'what is 4 doubled', 'what is 12 doubled', 'twice 5 is what']), ['double {#1-1}', 'what is {#1-1} doubled']);
  assert.deepEqual(deriveTemplates(['the capital of a', 'the capital of b']), ['the capital of {1-3}']);
  assert.deepEqual(deriveTemplates(['of a', 'of b']), [], 'a template of stop words alone is no template');
  assert.deepEqual(deriveTemplates([]), []);
  assert.deepEqual(deriveTemplates(null), []);
  assert.deepEqual(deriveTemplates(['Name the capital city of France', 'name  the capital city of FRANCE!']), [], 'one prompt after gateText is one shape of one');
  const W = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot'], many = [];
  for (const a of W) for (const b of W) for (const c of W) if (a !== b && b !== c && a !== c) for (const k of ['p', 'q']) many.push(`${a} u${many.length}${k} ${b} v${many.length}${k} ${c}`);
  assert.equal(many.length, 240);
  assert.equal(deriveTemplates(many).length, GATE_MAX_TEMPLATES, '120 shapes of 2 prompts each, at most the cap kept');
  const long = deriveTemplates(['tell me about ' + 'x '.repeat(30) + 'now', 'tell me about y now']);
  assert.deepEqual(long, ['tell me about {1-' + GATE_MAX_SLOT + '} now']);
});

test('validTemplate and templateSource: slots a <= b <= the cap, a fixed word that is not a stop word, words of letters and digits', () => {
  for (const ok of ['what is the capital of {1-4}', 'double {#1-1}', '{1-3} is the capital of which country', 'x {1-12}']) assert.equal(validTemplate(ok), true, ok);
  for (const bad of ['what is the capital of', '{1-4}', 'of the {1-2}', 'capital {2-1}', 'capital {1-13}', 'capital {0-2}', 'capital of {1-2}?', 'Capital {1-2} ', '', null, 7, 'a'.repeat(401) + ' {1-2}']) assert.equal(validTemplate(bad), false, String(bad));
  assert.equal(templateSource('what is the capital of {1-4}'), '^what is the capital of [^ ]+(?: [^ ]+){0,3}$');
  assert.equal(templateSource('double {#1-1}'), '^double \\d+$');
  assert.equal(templateSource('capital {2-3} x'), '^capital [^ ]+(?: [^ ]+){1,2} x$');
  assert.equal(templateSource('nope'), null);
});

test('fitsTemplates: the gateText of the prompt fits a template exactly; other words, a missing slot or a long text fit none', () => {
  const T = ['what is the capital of {1-3}', 'double {#1-1}'];
  for (const q of ['What is the capital of Japan?', 'what is the capital of new zealand', '  WHAT IS THE CAPITAL OF   Peru!! ', 'Double 21', 'double 7.']) assert.equal(fitsTemplates(T, q), true, q);
  for (const q of ['capital of Japan', 'What is the capital of?', 'so what is the capital of Japan', 'what really is the capital of Japan', 'what is the capital of a b c d', 'Double twenty', 'double 2 3', 'which country has the capital Paris', 'what continent is Peru in', 'and germany?', '', '   ']) assert.equal(fitsTemplates(T, q), false, q);
  assert.equal(fitsTemplates(['x {1-12}'], 'x ' + 'y'.repeat(GATE_MAX_TEXT)), false, 'a text over the cap fits nothing');
  assert.equal(fitsTemplates(['x {1-12}'], 'x ' + 'y'.repeat(GATE_MAX_TEXT - 2)), true);
  assert.equal(fitsTemplates([], 'double 2'), false);
  assert.equal(fitsTemplates(null, 'double 2'), false);
  assert.equal(fitsTemplates(['double {#1-1}'], null), false);
});

test('gateText is the kernel norm level 1, on every kind of text', () => {
  const qs = ['What is the capital of Japan?', '  and   GERMANY?? ', 'É agora, São Paulo!', "what's 2+2", 'tab\there\nnewline', '日本の首都は', '', '!!!', 'x'.repeat(10)];
  for (const q of qs) assert.equal(gateText(q), norm(q, 1), JSON.stringify(q));
  for (const q of [null, undefined, 42, {}]) assert.equal(gateText(q), '');
});

test('isMastered: a held-out score of exactly 1, every one of n > 0 rows right', () => {
  assert.equal(isMastered({ score: 1, n: 10, ok: 10 }), true);
  assert.equal(isMastered({ score: 1 }), true);
  for (const h of [{ score: 0.9, n: 10, ok: 9 }, { score: 0.9999 }, { score: 1, n: 0, ok: 0 }, { score: 1, n: 10, ok: 9 }, { score: 1, n: 1.5, ok: 1.5 }, { score: '1' }, null, undefined, [], 1]) assert.equal(isMastered(h), false, JSON.stringify(h));
});

test('rowServes: tier neo, serve exactly true, 1 to the cap of well formed templates; a locked row is never gated', () => {
  const row = { ...neoRow('country-capital', MASTERED), serve: true, templates: ['what is the capital of {1-3}'] };
  assert.equal(rowServes(row), true);
  for (const bad of [{ ...row, serve: 'true' }, { ...row, serve: false }, { ...row, templates: [] }, { ...row, templates: ['capital of'] }, { ...row, templates: 'what is the capital of {1-3}' }, { ...row, tier: 'a' }, { ...row, templates: Array.from({ length: GATE_MAX_TEMPLATES + 1 }, (_, i) => 'capital ' + i + ' {1-2}') }, null]) assert.equal(rowServes(bad), false, JSON.stringify(bad && bad.serve));
  assert.equal(rowServes({ ...row, templates: Array.from({ length: GATE_MAX_TEMPLATES }, (_, i) => 'capital w' + i + ' {1-2}') }), true);
  assert.equal(rowServes(HAND_ROW), false);
});

// ---------------------------------------------------------------- regate: serve only while mastered, only the template
test('the stand-in colonies, ungated, give the three measured wrong answers (the regression rows are real)', async () => {
  const root = gateRoot();
  for (const w of WRONG) {
    const m = await fresh(path.join(root, 'grown', 'cells', neoId(w.culprit) + '.mjs'));
    assert.equal(m.can(w.q), true, w.q);
    assert.equal(m.answer(w.q), w.got, w.q);
    assert.ok(expectOk(m.answer(FIRST[w.culprit]), EXPECT[w.culprit]), 'and it answers its own first example right');
  }
});

test('a tier neo row with no serve key is silent: the gate fails closed until regate says it serves', async () => {
  const root = gateRoot();
  const idx = await grownOf(root);
  assert.equal(idx.GROWN.length, 4);
  for (const task of Object.keys(DEV)) assert.equal(idx.grownAnswer(FIRST[task]), null, task);
  for (const w of WRONG) assert.equal(idx.grownAnswer(w.q), null, w.q);
  assert.equal(idx.grownAnswer('write a haiku about rain').id, 'hand-g1');
});

test('regate, an unmastered colony: serve false, the gate says why, and the three wrong prompts give null', async () => {
  for (const w of WRONG) {
    const root = gateRoot({ tasks: [w.culprit], held: NEAR });
    const line = await regate({ root });
    assert.equal(line.colonies, 1);
    assert.equal(line.mastered, 0);
    assert.equal(line.serving, 0);
    const row = indexOf(root).cells.at(-1);
    assert.equal(row.serve, false);
    assert.equal(row.gate, 'not mastered: held-out 9 of 10');
    assert.ok(row.templates.length >= 2, 'the templates are written even while silent');
    const idx = await grownOf(root);
    assert.equal(idx.grownAnswer(w.q), null, w.q);
    assert.equal(idx.grownAnswer(FIRST[w.culprit]), null, 'an unmastered colony answers nothing, not even its own examples');
    assert.ok(!fs.readFileSync(path.join(root, 'grown', 'index.mjs'), 'utf8').includes(neoId(w.culprit) + '.mjs'), 'a silent module is not imported');
  }
  const all = gateRoot({ held: NEAR });
  assert.equal((await regate({ root: all })).serving, 0);
  const idx = await grownOf(all);
  for (const w of WRONG) assert.equal(idx.grownAnswer(w.q), null, w.q);
});

test('regate, a mastered colony of ANOTHER relation: the three wrong prompts give null, its own template is answered', async () => {
  for (const w of WRONG) {
    const root = gateRoot({ tasks: [w.culprit], held: MASTERED });
    const line = await regate({ root });
    assert.equal(line.serving, 1, JSON.stringify(indexOf(root).cells.at(-1).gate));
    assert.deepEqual(line.served, [neoId(w.culprit)]);
    const row = indexOf(root).cells.at(-1);
    assert.equal(row.serve, true);
    assert.equal('gate' in row, false);
    assert.deepEqual(row.templates, deriveTemplates(DEV[w.culprit].map((r) => r.q)));
    const idx = await grownOf(root);
    assert.equal(idx.grownAnswer(w.q), null, w.q);
    const own = idx.grownAnswer(FIRST[w.culprit]);
    assert.equal(own.id, neoId(w.culprit));
    assert.ok(expectOk(own.answer, EXPECT[w.culprit]), own.answer);
  }
});

test('a mastered colony answers prompts that fit its template exactly; other words, another relation or a missing slot give null', async () => {
  const root = gateRoot();
  const line = await regate({ root });
  assert.equal(line.serving, 3);
  assert.equal(line.changed, true);
  const idx = await grownOf(root);
  const said = (q) => { const a = idx.grownAnswer(q); return a ? a.id : null; };
  assert.equal(said('What is the capital of Japan?'), 'country-capital-neo-g1');
  assert.equal(idx.grownAnswer('Which city is the capital of Kenya?').answer, 'The capital of kenya is Nairobi.');
  assert.equal(said('Name the capital city of New Zealand.'), 'country-capital-neo-g1');
  assert.equal(idx.grownAnswer('Which country has Tokyo as its capital?').answer, 'Tokyo is the capital of Japan.');
  assert.equal(said('Lima is the capital of which country?'), 'capital-country-neo-g1');
  assert.equal(said('How many people live in Peru?'), 'country-population-neo-g1');
  assert.equal(said('What is the population of Germany?'), 'country-population-neo-g1');
  for (const q of ['capital of Japan', 'capital of Germany', 'What is the capital of?', 'so what is the capital of Japan', 'what really is the capital of Japan', 'which continent is Japan in', 'what is the area of Peru', 'Germany?', 'tell me about Paris', 'What is the capital of Atlantis?', ...WRONG.map((w) => w.q)]) assert.equal(idx.grownAnswer(q), null, q);
  assert.equal(said('write a haiku about rain'), 'hand-g1', 'a locked row is never gated');
  assert.deepEqual(idx.GATE.map((g) => (g ? g.serve : null)), [null, true, true, true]);
  assert.deepEqual(idx.GATE[1].templates, indexOf(root).cells[1].templates);
});

test('a colony that loses mastery stops serving at the next regate (and so does one whose dev set changed)', async () => {
  const root = gateRoot();
  assert.equal((await regate({ root })).serving, 3);
  const ixPath = path.join(root, 'grown', 'index.json'), ix = indexOf(root);
  ix.cells.find((r) => r.id === 'country-capital-neo-g1').heldout = { ...NEAR };
  fs.writeFileSync(ixPath, JSON.stringify(ix, null, 2) + '\n');
  const before = await grownOf(root);
  assert.equal(before.grownAnswer('What is the capital of Japan?').id, 'country-capital-neo-g1', 'index.mjs serves until the regate');
  const line = await regate({ root });
  assert.deepEqual(line.flipped, ['country-capital-neo-g1']);
  assert.equal(line.serving, 2);
  assert.equal(line.mastered, 2);
  const row = indexOf(root).cells.find((r) => r.id === 'country-capital-neo-g1');
  assert.equal(row.serve, false);
  assert.equal(row.gate, 'not mastered: held-out 9 of 10');
  const idx = await grownOf(root);
  assert.equal(idx.grownAnswer('What is the capital of Japan?'), null);
  assert.equal(idx.grownAnswer('What is the population of Germany?').id, 'country-population-neo-g1');
  fs.appendFileSync(path.join(root, 'neo', 'tasks', 'country-population', 'dev.jsonl'), JSON.stringify({ q: 'What is the population of Chile?', expect: { contains: ['19'] } }) + '\n');
  const again = await regate({ root });
  assert.deepEqual(again.flipped, ['country-population-neo-g1']);
  assert.equal(indexOf(root).cells.find((r) => r.id === 'country-population-neo-g1').gate, "the task's dev set changed since it was opened");
  const led = path.join(root, 'neo', 'LEDGER.json'), doc = readJ(led);
  doc.tasks = doc.tasks.filter((t) => t.task !== 'capital-country');
  fs.writeFileSync(led, JSON.stringify(doc, null, 2) + '\n');
  await regate({ root });
  assert.equal(indexOf(root).cells.find((r) => r.id === 'capital-country-neo-g1').gate, 'the task is not in neo/LEDGER.json');
  assert.equal((await grownOf(root)).GROWN.filter((c) => c.can('Which country has Tokyo as its capital?')).length, 0);
});

test('a locked cell is never shadowed: regate puts every locked row first, a serving colony its first example a locked cell answers goes silent', async () => {
  const root = gateRoot({ locked: ['hand-g1', 'atlas-a-g1'], neoFirst: true, first: { 'country-capital': 'What is the capital of France?' } });
  const pre = indexOf(root);
  assert.equal(pre.cells[0].tier, 'neo');
  const line = await regate({ root });
  const ix = indexOf(root);
  assert.deepEqual(ix.cells.slice(0, 2), [HAND_ROW, ATLAS_ROW], 'the locked rows first, byte for byte (no key added)');
  assert.deepEqual(ix.cells.slice(2).map((r) => r.id), pre.cells.filter((r) => r.tier === 'neo').map((r) => r.id));
  const cc = ix.cells.find((r) => r.id === 'country-capital-neo-g1');
  assert.equal(cc.serve, false);
  assert.match(cc.gate, /^shadowed: its first example is answered first by atlas-a-g1$/);
  assert.equal(line.serving, 2);
  const idx = await grownOf(root);
  assert.equal(idx.grownAnswer('What is the capital of France?').id, 'atlas-a-g1');
  assert.equal(idx.grownAnswer('What is the capital of Japan?'), null, 'the shadowed colony is silent');
  assert.equal(idx.grownAnswer('Which country has Paris as its capital?').id, 'capital-country-neo-g1');
  const { answers } = await answersOf(path.join(root, 'grown', 'index.mjs'));
  assert.ok(answers.every((a) => a.ok), JSON.stringify(answers));
  const again = await regate({ root });
  assert.equal(again.changed, false, 'the silent row stays silent: no flip-flop');
});

test('regate: a mastered colony whose first example fits none of its templates, or whose module is gone, does not serve', async () => {
  const root = gateRoot({ first: { 'country-population': 'Population of Germany please' } });
  const gateOf = (id) => indexOf(root).cells.find((r) => r.id === id).gate;
  const kc = path.join(root, 'grown', 'cells', 'capital-country-neo-g1.mjs');
  fs.rmSync(kc);
  let line = await regate({ root });
  assert.equal(gateOf('country-population-neo-g1'), 'its first example fits none of its templates');
  assert.equal(gateOf('capital-country-neo-g1'), 'its module is not on disk');
  assert.deepEqual(line.served, ['country-capital-neo-g1']);
  assert.ok(!fs.readFileSync(path.join(root, 'grown', 'index.mjs'), 'utf8').includes('capital-country-neo-g1.mjs'), 'a silent row is never imported, so a missing module breaks nothing');
  fs.writeFileSync(kc, 'export const meta = {;\n');
  line = await regate({ root });
  assert.equal(gateOf('capital-country-neo-g1'), 'its module does not load');
  fs.writeFileSync(kc, colonyText('capital-country'));
  line = await regate({ root });
  assert.deepEqual(line.served, ['country-capital-neo-g1', 'capital-country-neo-g1']);
  assert.deepEqual(line.flipped, ['capital-country-neo-g1']);
  assert.equal((await grownOf(root)).grownAnswer('What is the population of Germany?'), null, 'the population colony stays silent');
});

test('grow: a serving colony leads with an example that fits its template, and an unmastered one is promoted silent', async () => {
  const odd = { q: 'Please double the number 7 for me, thanks', expect: { equals: '14' }, answer: '14' };
  const root = growRoot();
  const dev = jsonl([odd, ...TASK_ROWS.doubled.dev]), devFile = path.join(root, 'neo', 'tasks', 'doubled', 'dev.jsonl');
  fs.writeFileSync(devFile, dev);
  const led = readJ(path.join(root, 'neo', 'LEDGER.json'));
  led.tasks[0].devSha = shaText(dev);
  fs.writeFileSync(path.join(root, 'neo', 'LEDGER.json'), JSON.stringify(led, null, 2) + '\n');
  const line = await growTask({ root, task: 'doubled', gen: 5, organism: nobody, budget: GB, now: NOW });
  assert.equal(line.promoted, true, JSON.stringify(line.why));
  assert.equal(line.serve, true);
  const row = indexOf(root).cells.at(-1);
  const mod = await fresh(path.join(root, 'grown', row.file));
  assert.ok(mod.examples.some((x) => x.q === odd.q), 'the odd prompt is an example of the colony');
  assert.equal(fitsTemplates(row.templates, mod.examples[0].q), true, 'examples[0] fits a template: ' + mod.examples[0].q);
  assert.equal((await grownOf(root)).grownAnswer(odd.q), null, 'a prompt of no template is not served, even one the colony was grown on');
  // an unmastered colony (9 of 10 held out) is promoted, silent, with the gate saying why
  const held = TASK_ROWS.doubled.heldout.map((r, i) => (i === 0 ? { q: r.q, expect: { equals: '-1' } } : r));
  const r2 = growRoot(), h = jsonl(bare(held));
  fs.writeFileSync(path.join(r2, 'neo', 'tasks', 'doubled', 'heldout.jsonl'), h);
  const led2 = readJ(path.join(r2, 'neo', 'LEDGER.json'));
  led2.tasks[0].heldoutSha = shaText(h);
  fs.writeFileSync(path.join(r2, 'neo', 'LEDGER.json'), JSON.stringify(led2, null, 2) + '\n');
  const l2 = await growTask({ root: r2, task: 'doubled', gen: 5, organism: nobody, budget: GB, now: NOW });
  assert.equal(l2.promoted, true, JSON.stringify(l2.why));
  assert.equal(l2.serve, false);
  const row2 = indexOf(r2).cells.at(-1);
  assert.equal(row2.serve, false);
  assert.equal(row2.gate, 'not mastered: held-out 9 of 10');
  const idx2 = await grownOf(r2);
  assert.equal(idx2.grownAnswer(TASK_ROWS.doubled.heldout[1].q), null);
  assert.equal(idx2.grownAnswer('write a haiku about rain').id, 'hand-g1');
});

test('regate is idempotent: a second regate writes nothing; a failed proof puts grown/ back byte for byte', async () => {
  const root = gateRoot();
  await regate({ root });
  const b1 = bytesOf(root);
  const again = await regate({ root });
  assert.equal(again.changed, false);
  assert.deepEqual(again.flipped, []);
  assert.deepEqual(bytesOf(root), b1);
  const fresh2 = gateRoot();
  const b2 = bytesOf(fresh2);
  await assert.rejects(regate({ root: fresh2, render: () => 'export const GROWN = [' }), /regate: the proof failed: node --check grown\/index\.mjs failed.*\(grown\/ is as it was\)/);
  assert.deepEqual(bytesOf(fresh2), b2);
  await assert.rejects(regate({ root: fresh2, render: (ix) => renderIndexMjs({ ...ix, cells: ix.cells.slice(1) }) }), /exports 3 cells, grown\/index\.json lists 4/);
  assert.deepEqual(bytesOf(fresh2), b2);
});

test('regate: a mastered colony whose held-out file changed since the task was opened does not serve', async () => {
  const root = gateRoot();
  await regate({ root });
  assert.equal(indexOf(root).cells.find((r) => r.id === 'country-population-neo-g1').serve, true);
  fs.appendFileSync(path.join(root, 'neo', 'tasks', 'country-population', 'heldout.jsonl'), JSON.stringify({ q: 'HOW MANY PEOPLE LIVE IN PERU?', expect: { contains: ['34 million'] } }) + '\n');
  const line = await regate({ root });
  const row = indexOf(root).cells.find((r) => r.id === 'country-population-neo-g1');
  assert.equal(row.serve, false);
  assert.equal(row.gate, "the task's held-out set changed since it was opened");
  assert.deepEqual(line.flipped, ['country-population-neo-g1']);
  assert.equal((await grownOf(root)).grownAnswer('What is the population of Germany?'), null);
});

test('regate judges the shadow in order: a colony shadowed only by a colony that itself goes silent still serves', async () => {
  const root = gateRoot({ tasks: ['country-capital'], locked: ['hand-g1', 'atlas-a-g1'], first: { 'country-capital': 'What is the capital of France?' } });
  const g2 = { ...neoRow('country-capital', MASTERED), id: 'country-capital-neo-g2', generation: 2, file: 'cells/country-capital-neo-g2.mjs' };
  put(root, 'grown/' + g2.file, colonyText('country-capital', 'What is the capital of Japan?').replace(neoId('country-capital'), g2.id));
  const ix = indexOf(root);
  ix.cells.push(g2);
  put(root, 'grown/index.json', JSON.stringify(ix, null, 2) + '\n');
  put(root, 'grown/index.mjs', renderIndexMjs(ix));
  const line = await regate({ root });
  const rows = indexOf(root).cells;
  assert.equal(rows.find((r) => r.id === 'country-capital-neo-g1').gate, 'shadowed: its first example is answered first by atlas-a-g1');
  const r2 = rows.find((r) => r.id === 'country-capital-neo-g2');
  assert.equal(r2.serve, true, r2.gate);
  assert.deepEqual(line.served, ['country-capital-neo-g2']);
  const idx = await grownOf(root);
  assert.equal(idx.grownAnswer('What is the capital of Japan?').id, 'country-capital-neo-g2');
  assert.equal(idx.grownAnswer('What is the capital of France?').id, 'atlas-a-g1');
});

// A cell that behaves one way when imported alone and another way through grown/index.mjs (a cell module imported by
// the index carries no query in its URL): what the in-memory gate cannot see and only the proof through grownAnswer does.
const GHOST_ROW = Object.freeze({ id: 'ghost-g1', class: 'ghost', generation: 1, lane: 'a', file: 'cells/ghost-g1.mjs', heldout: { score: 0.5, n: 2, ok: 1 }, promotedAt: '2026-09-30T00:00:00.000Z' });
const GHOST_TEXT = [
  '// a locked cell for test/neo-gate.test.mjs that answers only when grown/index.mjs imports it',
  'export const meta = Object.freeze(' + JSON.stringify({ id: 'ghost-g1', class: 'ghost', generation: 1, lane: 'a', version: 1 }) + ');',
  'export const examples = ' + JSON.stringify([{ q: 'a ghost in japan', expect: { contains: ['boo'] } }]) + ';',
  "const VIA_INDEX = !import.meta.url.includes('?');", T_FN,
  "export function can(q) { return VIA_INDEX && (' ' + t(q) + ' ').includes(' japan '); }",
  "export function answer(q) { return can(q) ? 'boo from japan' : null; }", '',
].join('\n');
test('regate: a serving colony that grownAnswer does not route to it is made silent and the proof runs again (never a throw)', async () => {
  const root = gateRoot();
  put(root, 'grown/' + GHOST_ROW.file, GHOST_TEXT);
  const kc = path.join(root, 'grown', 'cells', 'capital-country-neo-g1.mjs');
  fs.writeFileSync(kc, colonyText('capital-country').replace('export function can(q) { return answer(q) !== null; }', "export function can(q) { return import.meta.url.includes('?') && answer(q) !== null; }"));
  const ix = indexOf(root);
  ix.cells.splice(1, 0, GHOST_ROW);
  put(root, 'grown/index.json', JSON.stringify(ix, null, 2) + '\n');
  put(root, 'grown/index.mjs', renderIndexMjs(ix));
  const line = await regate({ root });
  const rows = indexOf(root).cells, gateOf = (id) => rows.find((r) => r.id === id);
  assert.equal(gateOf('country-capital-neo-g1').serve, false);
  assert.equal(gateOf('country-capital-neo-g1').gate, 'shadowed: its first example is answered first by ghost-g1');
  assert.equal(gateOf('capital-country-neo-g1').serve, false);
  assert.equal(gateOf('capital-country-neo-g1').gate, 'it does not answer its own first example through grownAnswer');
  assert.deepEqual(line.served, ['country-population-neo-g1']);
  assert.equal(line.changed, true);
  const { answers } = await answersOf(path.join(root, 'grown', 'index.mjs'));
  assert.ok(answers.every((a) => a.ok), JSON.stringify(answers));
  assert.equal((await regate({ root })).changed, false);
});

test('answersOf: a row the GATE calls silent but that answers is not ok (the proof catches an index whose gate lies)', async () => {
  const root = tmpDir('liar');
  put(root, 'grown/cells/hand-g1.mjs', LOCKED['hand-g1'][1]);
  put(root, 'grown/cells/loud.mjs', ['export const meta = Object.freeze({ id: \'loud-neo-g1\', class: \'loud\', generation: 1, lane: \'neo\' });', 'export const examples = [];', 'export function can() { return true; }', "export function answer() { return 'yes'; }", ''].join('\n'));
  put(root, 'grown/index.mjs', [
    "import * as c0 from './cells/hand-g1.mjs';", "import * as c1 from './cells/loud.mjs';",
    'export const GROWN = Object.freeze([c0, c1]);',
    "export const GATE = Object.freeze([null, Object.freeze({ serve: false, task: 'loud', templates: [] })]);", GROWN_BODY,
  ].join('\n'));
  const { answers } = await answersOf(path.join(root, 'grown', 'index.mjs'));
  assert.deepEqual(answers.map((a) => [a.id, a.ok, !!a.silent]), [['hand-g1', true, false], ['loud-neo-g1', false, true]]);
});

test('grown/index.mjs of a gated index: only serving colonies imported, GATE by position, a locked-only index as before', async () => {
  const root = gateRoot({ held: (t) => (t === 'country-population' ? NEAR : MASTERED) });
  await regate({ root });
  const text = fs.readFileSync(path.join(root, 'grown', 'index.mjs'), 'utf8');
  assert.ok(text.includes("import * as n1 from './cells/country-capital-neo-g1.mjs';"));
  assert.ok(text.includes("import * as n2 from './cells/capital-country-neo-g1.mjs';"));
  assert.ok(!text.includes('country-population-neo-g1.mjs'));
  assert.ok(text.includes('const c3 = silent('));
  const idx = await grownOf(root);
  assert.deepEqual(idx.GATE[0], null);
  assert.deepEqual(idx.GATE[3], { serve: false, task: 'country-population', templates: [] });
  assert.equal(idx.GROWN[3].meta.id, 'country-population-neo-g1');
  assert.equal(idx.GROWN[3].can('What is the population of Germany?'), false);
  assert.equal(idx.GROWN[3].answer('What is the population of Germany?'), null);
  const { answers } = await answersOf(path.join(root, 'grown', 'index.mjs'));
  assert.deepEqual(answers.map((a) => [a.id, a.ok, !!a.silent]), [['hand-g1', true, false], ['country-capital-neo-g1', true, false], ['capital-country-neo-g1', true, false], ['country-population-neo-g1', true, true]]);
  const lockedOnly = renderIndexMjs({ generation: 1, cells: [HAND_ROW] });
  assert.ok(!lockedOnly.includes('GATE') && !lockedOnly.includes('serving'));
  assert.ok(lockedOnly.includes("import * as c0 from './cells/hand-g1.mjs';\nexport const GROWN = Object.freeze([c0]);"));
});

// ---------------------------------------------------------------- the stage: grow --stage writes one file, merge applies it
function prng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
/** The doubled task of test/neo.test.mjs (20 dev rows, 10 held-out rows of the same hidden rule) and a capitals table task. */
const TASK_ROWS = (() => {
  const r = prng(7), seen = new Set(), rows = [];
  for (let i = 0; rows.length < 30 && i < 500; i++) {
    const n = 2 + Math.floor(r() * 499), q = [`Double ${n}`, `What is ${n} doubled?`, `Twice ${n} is what?`][rows.length % 3];
    if (!seen.has(q)) { seen.add(q); rows.push({ q, expect: { equals: String(2 * n) }, answer: String(2 * n) }); }
  }
  const caps = COUNTRIES.map(([c, cap], i) => ({ q: [`What is the capital of ${c}?`, `Which city is the capital of ${c}?`][i % 2], expect: { contains: [cap] }, answer: `The capital of ${c} is ${cap}.` }));
  return {
    doubled: { dev: rows.slice(0, 20), heldout: rows.slice(20) },
    capitals: { dev: caps, heldout: caps.slice(0, 10).map((x) => ({ q: x.q.toUpperCase(), expect: x.expect })) },
  };
})();
const bare = (rows) => rows.map((r) => ({ q: r.q, expect: r.expect }));
const STUB_BASELINE = ['// stand-in judge/baseline.mjs of a temp root: an organism that answers nothing', 'export const PACK = null;', 'export async function runOrganism(rows) { return rows.map((r) => ({ q: r.q, got: null })); }', ''].join('\n');
/** A tree with one hand-grown cell in grown/, the given tasks opened in neo/, judge/control.jsonl and a stand-in organism. */
function growRoot(tasks = ['doubled']) {
  const root = tmpDir('grow-root');
  put(root, 'grown/' + HAND_ROW.file, LOCKED['hand-g1'][1]);
  const index = { generation: 4, cells: [HAND_ROW] };
  put(root, 'grown/index.json', JSON.stringify(index, null, 2) + '\n');
  put(root, 'grown/index.mjs', renderIndexMjs(index));
  const ledger = { tasks: [], generated: 0, note: 'the teacher keeps this key' };
  for (const task of tasks) {
    const d = jsonl(TASK_ROWS[task].dev), h = jsonl(bare(TASK_ROWS[task].heldout));
    put(root, 'neo/tasks/' + task + '/dev.jsonl', d);
    put(root, 'neo/tasks/' + task + '/heldout.jsonl', h);
    ledger.tasks.push({ task, generation: 1, devSha: shaText(d), heldoutSha: shaText(h), dev: TASK_ROWS[task].dev.length, heldout: TASK_ROWS[task].heldout.length, by: 'test', at: '2026-10-01T00:00:00.000Z' });
  }
  put(root, 'neo/LEDGER.json', JSON.stringify(ledger, null, 2) + '\n');
  put(root, 'judge/control.jsonl', jsonl(['Double the 21 eggs in the basket', 'tell me a joke about cats'].map((q) => ({ q }))));
  put(root, 'judge/baseline.mjs', STUB_BASELINE);
  return root;
}
const nobody = async (rows) => rows.map((r) => ({ q: r.q, got: null }));
const GB = { maxGenerated: 8000 };
const NOW = () => new Date('2026-10-01T12:00:00.000Z');
const stageOf = (root, sdir, o = {}) => growTask({ root, task: 'doubled', gen: 5, organism: nobody, budget: GB, now: NOW, stage: sdir, ...o });

test('grow --stage writes ONE file, <dir>/<task>.json (result, module text, ledger delta, cells), and changes nothing else', async () => {
  const root = growRoot(), sdir = tmpDir('stage'), before = bytesOf(root, ['']);
  const line = await stageOf(root, sdir);
  assert.deepEqual(fs.readdirSync(sdir), ['doubled.json']);
  assert.equal(line.staged, path.join(sdir, 'doubled.json'));
  assert.deepEqual(bytesOf(root, ['']), before, 'not one byte of the root moved');
  assert.equal(line.promoted, false);
  assert.equal(line.promotable, true, JSON.stringify(line.why));
  assert.equal(line.serve, true);
  assert.deepEqual(line.heldout, { ok: 10, n: 10, score: 1 });
  const doc = readJ(line.staged);
  assert.equal(stageErrors(doc, 'doubled.json'), null);
  assert.equal(doc.kind, STAGE_KIND);
  assert.equal(doc.version, STAGE_VERSION);
  assert.equal(doc.task, 'doubled');
  assert.equal(doc.generation, 5);
  const led = readJ(path.join(root, 'neo', 'LEDGER.json')).tasks[0];
  assert.deepEqual(doc.shas, { dev: led.devSha, heldout: led.heldoutSha });
  assert.equal(doc.index, shaText(fs.readFileSync(path.join(root, 'grown', 'index.json'), 'utf8')));
  assert.equal(doc.ledger.generated, line.generated);
  assert.equal(doc.cells.length, line.kept);
  assert.equal(doc.module.id, 'doubled-neo-g5');
  assert.ok(doc.module.source.includes('export function answer(q)'));
  assert.deepEqual(doc.result.heldout, line.heldout);
  assert.equal(fs.readdirSync(sdir).some((f) => f.endsWith('.tmp')), false);
});

test('merge --stage applies a staged file with the proofs of a direct grow: grown/, the ledger and the colony as grow leaves them', async () => {
  const a = growRoot(), b = growRoot(), sdir = tmpDir('stage');
  const direct = await growTask({ root: a, task: 'doubled', gen: 5, organism: nobody, budget: GB, now: NOW });
  assert.equal(direct.promoted, true, JSON.stringify(direct.why));
  await stageOf(b, sdir);
  const m = await mergeStage({ root: b, dir: sdir, organism: nobody, now: NOW });
  assert.equal(m.files, 1);
  assert.deepEqual(m.merged, ['doubled']);
  assert.deepEqual(m.promoted, ['doubled-neo-g5']);
  assert.deepEqual(m.refused, []);
  assert.deepEqual(m.skipped, []);
  assert.deepEqual(bytesOf(b, ['grown']), bytesOf(a, ['grown']), 'grown/ byte for byte as the direct grow');
  assert.deepEqual(readJ(path.join(b, 'neo', 'LEDGER.json')), readJ(path.join(a, 'neo', 'LEDGER.json')));
  const ca = readJ(path.join(a, 'neo', 'tasks', 'doubled', 'colony.json')), cb = readJ(path.join(b, 'neo', 'tasks', 'doubled', 'colony.json'));
  assert.deepEqual(cb.cells, ca.cells);
  assert.equal(cb.stages.length, 1);
  const row = indexOf(b).cells.at(-1);
  assert.equal(row.serve, true);
  assert.deepEqual(row.templates, deriveTemplates(TASK_ROWS.doubled.dev.map((r) => r.q)));
  const idx = await grownOf(b);
  const held = TASK_ROWS.doubled.heldout.filter((r) => { const x = idx.grownAnswer(r.q); return x && x.id === row.id && expectOk(x.answer, r.expect); }).length;
  assert.ok(held >= 9, 'held-out through grownAnswer: ' + held);
  assert.equal(idx.grownAnswer('Double the 21 eggs in the basket'), null);
  assert.equal(idx.grownAnswer('please double 21 now'), null, 'other words: no template fits');
  // two merges of the same stage are one merge
  const once = bytesOf(b, ['']);
  const m2 = await mergeStage({ root: b, dir: sdir, organism: nobody, now: NOW });
  assert.deepEqual(m2.skipped, ['doubled.json']);
  assert.deepEqual(m2.merged, []);
  assert.deepEqual(m2.refused, []);
  assert.equal(m2.regate.changed, false);
  assert.deepEqual(bytesOf(b, ['']), once, 'the second merge changes no byte');
});

test('a staged file that fails a proof is refused and named, never merged: not one byte of the root moves', async () => {
  const root = growRoot(), sdir = tmpDir('stage');
  await stageOf(root, sdir);
  const good = fs.readFileSync(path.join(sdir, 'doubled.json'), 'utf8'), doc = JSON.parse(good);
  const before = bytesOf(root, ['']);
  const cases = [
    ['doubled.json', JSON.stringify({ ...doc, result: { ...doc.result, heldout: { ok: 9, n: 10, score: 0.9 } } }), /^the staged held-out score is not what its cells score/],
    ['doubled.json', JSON.stringify({ ...doc, cells: [] }), /^the staged held-out score is not what its cells score/],
    ['doubled.json', JSON.stringify({ ...doc, module: { ...doc.module, source: doc.module.source + '// one more line\n' } }), /^the staged module is not what its cells compile to$/],
    ['doubled.json', JSON.stringify({ ...doc, cells: [{ ...doc.cells[0], task: 'other' }, ...doc.cells.slice(1)] }), /^a staged cell is not a valid cell of doubled$/],
    ['doubled.json', JSON.stringify({ ...doc, cells: [{ ...doc.cells[0], pyramid: ['no.such.prim'] }] }), /^a staged cell is not a valid cell of doubled$/],
    ['doubled.json', JSON.stringify({ ...doc, shas: { ...doc.shas, dev: 'f'.repeat(64) } }), /^the task was opened again since it was staged/],
    ['doubled.json', JSON.stringify({ ...doc, ledger: { generated: -1 } }), /^the ledger delta is not a count$/],
    ['doubled.json', JSON.stringify({ ...doc, kind: 'other' }), /^not a stage file/],
    ['doubled.json', JSON.stringify({ ...doc, generation: 0 }), /^the generation is not an integer from 1$/],
    ['doubled.json', JSON.stringify({ ...doc, module: 'text' }), /^the module is neither null nor/],
    ['other.json', good, /^the file is named other\.json, its task is doubled$/],
    ['broken.json', '{"kind": "neo-stage",', /^not JSON$/],
    ['doubled.json', JSON.stringify({ ...doc, task: 'Not A Task' }), /^the stage names no task$/],
  ];
  for (const [name, text, why] of cases) {
    const d = tmpDir('bad');
    fs.writeFileSync(path.join(d, name), text);
    const m = await mergeStage({ root, dir: d, organism: nobody, now: NOW });
    assert.equal(m.refused.length, 1, name + ' ' + why);
    assert.equal(m.refused[0].file, name);
    assert.match(m.refused[0].why, why);
    assert.deepEqual(m.merged, []);
    assert.deepEqual(bytesOf(root, ['']), before, 'refused ' + why + ': the root is as it was');
  }
  // the promote proof: a render that does not parse is refused, and the ledger and colony.json are not written either
  const m = await mergeStage({ root, dir: sdir, organism: nobody, now: NOW, render: () => 'export const GROWN = [' });
  assert.equal(m.refused.length, 1);
  assert.match(m.refused[0].why, /^the proof failed: node --check grown\/index\.mjs failed/);
  assert.match(m.regate.error, /^regate: the proof failed/, 'the regate after the merge is reported, not thrown');
  assert.deepEqual(bytesOf(root, ['']), before);
  // a dev set changed since it was opened (and since it was staged)
  fs.appendFileSync(path.join(root, 'neo', 'tasks', 'doubled', 'dev.jsonl'), JSON.stringify({ q: 'Double 4', expect: { equals: '8' } }) + '\n');
  const after2 = bytesOf(root, ['']);
  const d = await mergeStage({ root, dir: sdir, organism: nobody, now: NOW });
  assert.deepEqual(d.refused.map((r) => r.why), ["the task's dev set changed since it was opened"]);
  assert.deepEqual(bytesOf(root, ['']), after2);
});

test('merge re-selects against grown/ as it is now: a stage beaten by a colony promoted since is merged (cells, ledger) and not promoted', async () => {
  const root = growRoot(), sdir = tmpDir('stage');
  await stageOf(root, sdir);
  const g6 = await growTask({ root, task: 'doubled', gen: 6, organism: nobody, budget: GB, now: NOW });
  assert.equal(g6.promoted, true);
  const ledger0 = readJ(path.join(root, 'neo', 'LEDGER.json')).generated, grown0 = bytesOf(root, ['grown']);
  const staged = readJ(path.join(sdir, 'doubled.json'));
  const m = await mergeStage({ root, dir: sdir, organism: nobody, now: NOW });
  assert.deepEqual(m.merged, ['doubled']);
  assert.deepEqual(m.promoted, []);
  assert.deepEqual(m.refused, []);
  assert.deepEqual(bytesOf(root, ['grown']), grown0, 'the present colony scores as high: grown/ is untouched');
  assert.equal(readJ(path.join(root, 'neo', 'LEDGER.json')).generated, ledger0 + staged.ledger.generated);
  assert.equal(readJ(path.join(root, 'neo', 'tasks', 'doubled', 'colony.json')).stages.length, 1);
});

test('merge --max-ms: a file the merge has no time left for is left, named, and merges on the next run', async () => {
  const root = growRoot(['doubled', 'capitals']), sdir = tmpDir('stage');
  for (const task of ['capitals', 'doubled']) await growTask({ root, task, gen: 2, organism: nobody, budget: GB, now: NOW, stage: sdir });
  const slow = async (rows) => { await new Promise((r) => setTimeout(r, 250)); return nobody(rows); };
  const m = await mergeStage({ root, dir: sdir, organism: slow, now: NOW, maxMs: 120 });
  assert.deepEqual(m.merged, ['capitals']);
  assert.deepEqual(m.left, ['doubled.json']);
  assert.equal(indexOf(root).cells.some((r) => r.task === 'doubled'), false);
  const m2 = await mergeStage({ root, dir: sdir, organism: nobody, now: NOW });
  assert.deepEqual(m2.skipped, ['capitals.json']);
  assert.deepEqual(m2.merged, ['doubled']);
  assert.deepEqual(m2.left, []);
});

test('stages written by concurrent processes merge one at a time in name order; the CLI merge measures the organism in a child', async () => {
  const root = growRoot(['doubled', 'capitals']), sdir = tmpDir('stage');
  const before = bytesOf(root, ['']);
  const kids = ['doubled', 'capitals'].map((task) => new Promise((resolve) => {
    const c = spawnAsync(process.execPath, [ENGINE, 'grow', '--task', task, '--gen', '2', '--stage', sdir, '--root', root, '--max-generated', '8000'], { windowsHide: true });
    let out = '';
    c.stdout.on('data', (b) => { out += b; });
    c.on('close', (code) => resolve({ code, last: JSON.parse(out.trim().split(/\r?\n/).at(-1)) }));
  }));
  const done = await Promise.all(kids);
  for (const k of done) { assert.equal(k.code, 0, JSON.stringify(k.last)); assert.equal(k.last.promotable, true, JSON.stringify(k.last.why)); }
  assert.deepEqual(fs.readdirSync(sdir).sort(), ['capitals.json', 'doubled.json']);
  assert.deepEqual(bytesOf(root, ['']), before);
  const r = run(['merge', '--stage', sdir, '--root', root, '--era', '7']);
  assert.equal(r.code, 0, r.stderr);
  assert.equal(r.last.era, 7);
  assert.deepEqual(r.last.merged, ['capitals', 'doubled']);
  assert.deepEqual(r.last.promoted, ['capitals-neo-g2', 'doubled-neo-g2']);
  assert.deepEqual(indexOf(root).cells.map((x) => x.id), ['hand-g1', 'capitals-neo-g2', 'doubled-neo-g2']);
  assert.equal(r.last.regate.serving, 2);
  const led = readJ(path.join(root, 'neo', 'LEDGER.json'));
  assert.equal(led.generated, done.reduce((s, k) => s + k.last.generated, 0));
  const idx = await grownOf(root);
  assert.equal(idx.grownAnswer('WHICH CITY IS THE CAPITAL OF JAPAN?').id, 'capitals-neo-g2');
  assert.equal(idx.grownAnswer(idx.GROWN[2].examples[0].q).id, 'doubled-neo-g2');
  assert.equal(idx.grownAnswer('so what is the capital of japan'), null);
  const again = run(['merge', '--stage', sdir, '--root', root]);
  assert.deepEqual(again.last.skipped, ['capitals.json', 'doubled.json']);
});

// ---------------------------------------------------------------- the CLI and status
test('CLI: regate and status print one JSON line last with --era echoed; merge without --stage and a bad --era are usage errors', async () => {
  const root = gateRoot();
  const r = run(['regate', '--root', root, '--era', '2']);
  assert.equal(r.code, 0, r.stderr);
  assert.equal(r.last.era, 2);
  assert.equal(r.last.serving, 3);
  assert.equal(r.last.changed, true);
  assert.deepEqual(r.last.served, ['country-capital-neo-g1', 'capital-country-neo-g1', 'country-population-neo-g1']);
  assert.equal(r.lines.length, 1, 'one line: the JSON');
  const again = run(['regate', '--root', root]);
  assert.equal(again.last.changed, false);
  assert.equal('era' in again.last, false);
  const st = run(['status', '--root', root, '--era', '0']);
  assert.equal(st.code, 0);
  assert.equal(st.last.era, 0);
  assert.equal(st.last.serving, 3);
  assert.equal(st.last.mastered, 3);
  assert.deepEqual(st.last.features, featuresOf());
  for (const [args, code] of [[['merge', '--root', root], 2], [['regate', '--root', root, '--era', 'x'], 2], [['regate', '--root', root, '--era', '-1'], 2], [['regate', '--root', root, '--stage'], 2], [['regate', 'now', '--root', root], 2], [['merge', '--stage', path.join(root, 'nowhere'), '--root', root], 1]]) {
    const x = run(args);
    assert.equal(x.code, code, args.join(' ') + ': ' + x.stderr);
    assert.equal(x.last.ok, false);
    assert.equal(x.last.code, code);
  }
});

test('main grow --stage through the CLI entry: one staged file, the line names it', async () => {
  const root = growRoot(), sdir = tmpDir('stage'), out = [];
  const code = await main(['grow', '--task', 'doubled', '--gen', '3', '--stage', sdir, '--root', root, '--max-generated', '8000', '--era', '4'], { log: (s) => out.push(s), err: () => {}, organism: nobody });
  assert.equal(code, 0);
  const line = JSON.parse(out.at(-1));
  assert.equal(line.staged, path.join(sdir, 'doubled.json'));
  assert.equal(line.era, 4);
  assert.equal(line.promoted, false);
  assert.deepEqual(fs.readdirSync(sdir), ['doubled.json']);
});

test('status carries features, detected: gate, stage and core here, know, genome, macros and cursor only when they land', async () => {
  const f = featuresOf();
  assert.deepEqual(f.slice(0, 3), ['gate', 'stage', 'core']);
  assert.equal(f.includes('know'), Object.values(PRIMS).some((p) => p && p.family === 'know') && fs.existsSync(path.join(GROW, 'know.mjs')));
  assert.equal(f.includes('genome'), typeof CORE.applyGenome === 'function');
  assert.equal(f.includes('macros'), typeof CORE.macroCells === 'function');
  assert.equal(f.includes('cursor'), typeof CORE.resumeCursor === 'function');
  assert.ok(f.every((x) => ['gate', 'stage', 'core', 'know', 'genome', 'macros', 'cursor'].includes(x)));
  const root = gateRoot({ held: (t) => (t === 'capital-country' ? NEAR : MASTERED) });
  await regate({ root });
  const st = status(root);
  assert.deepEqual(st.features, f);
  assert.equal(st.colonies, 3);
  assert.equal(st.mastered, 2);
  assert.equal(st.serving, 2);
});

// ---------------------------------------------------------------- the core: the pure search (contract c4)
const strip = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').map((l) => l.replace(/^\s*\/\/.*$/, '')).join('\n');
test('grow/neo-core.mjs and grow/neo-kernel.mjs hold no node: import and no process or fs reference; the core imports only the kernel', () => {
  const core = fs.readFileSync(path.join(GROW, 'neo-core.mjs'), 'utf8'), kernel = fs.readFileSync(path.join(GROW, 'neo-kernel.mjs'), 'utf8');
  for (const [name, text] of [['neo-core.mjs', core], ['neo-kernel.mjs', kernel]]) {
    assert.equal(/['"`]node:/.test(text), false, name + ' names a node: module');
    assert.equal(/\bprocess\b/.test(text), false, name + ' names process');
    assert.equal(/\bfs\b/.test(text), false, name + ' names fs');
    assert.equal(/\brequire\s*\(/.test(text), false, name + ' calls require');
    assert.equal(/\bimport\s*\(/.test(text), false, name + ' imports dynamically');
    assert.equal(/\b(?:Deno|Bun|globalThis)\b/.test(strip(text)), false, name + ' reaches a host object');
  }
  const specs = (t) => [...strip(t).matchAll(/^\s*(?:import|export)\b[^;]*?\bfrom\s*['"]([^'"]+)['"]/gm)].map((m) => m[1]);
  assert.deepEqual([...new Set(specs(core))], ['./neo-kernel.mjs']);
  assert.deepEqual(specs(kernel), []);
  const neo = fs.readFileSync(path.join(GROW, 'neo.mjs'), 'utf8');
  assert.ok(specs(neo).includes('./neo-core.mjs'), 'grow/neo.mjs imports the core');
  for (const fn of ['spawnWith', 'enumerate', 'newSearch', 'templateCands', 'memoryCands', 'mutantCands', 'guardContext']) {
    assert.ok(new RegExp('\\bfunction ' + fn + '\\b').test(core), fn + ' is in the core');
    assert.equal(new RegExp('\\bfunction ' + fn + '\\b').test(neo), false, fn + ' is not duplicated in grow/neo.mjs');
  }
});

test('the core expectOk is the judge expectOk on every clause, a malformed expect and a refusal', () => {
  const cases = [
    ['Paris', { contains: ['paris'] }], [' The capital is Paris. ', { equals: 'the capital is paris.' }], ['x', { equals: 'X ' }], ['x', { equals: 'y' }],
    ['one two three', { minWords: 3 }], ['one two', { minWords: 3 }], ['a b c d', { maxWords: 3 }], ['a b c', { maxWords: 3 }], ['A\tB', { minWords: 2 }],
    ['I do not carry that yet', { notRefusal: true }], ['Nothing in memory matches x', { notRefusal: true, contains: ['x'] }], ['I am growing a cell for that', { notRefusal: true }], ['fine', { notRefusal: true }], ['I do not carry that yet', { contains: ['carry'] }],
    ['red green', { containsAny: ['blue', 'green'] }], ['red', { containsAny: ['blue'] }], ['not prime', { notContains: ['not'] }], ['prime', { contains: ['prime'], notContains: ['not'] }],
    [null, { contains: ['a'] }], [undefined, {}], [42, { equals: '42' }], ['a', null], ['a', 'contains'], ['a', {}], ['a', { contains: 'a' }], ['a', { contains: [] }], ['a', { containsAny: [] }],
    ['a', { unknownClause: 1 }], ['a', { minWords: '2' }], ['a', { minWords: -1 }], ['a', { equals: 5 }], ['a', []], ['', { maxWords: 0 }], ['  ', { equals: '' }], ['ÉCOLE', { contains: ['école'] }],
    ['a', { contains: [5] }], ['a', { notRefusal: 'yes' }], ['a', { equals: 'a', contains: ['b'] }], ['abc', { contains: ['A', 'b'] }],
  ];
  for (const [got, e] of cases) assert.equal(CORE.expectOk(got, e), expectOk(got, e), JSON.stringify([got, e]));
  assert.equal(String(CORE.REFUSAL_RE), String(/^(?:nothing in memory matches|I do not carry that yet|I am growing a cell)/i));
});

test('the core spawn grades with its own copy of the judge: the same cells as grow/neo.mjs spawn; a given grader is used, then put back', () => {
  const rows = rowsOf(TASK_ROWS.doubled.dev), negatives = ['hello', 'what is 2 plus 2', 'tell me a joke'];
  const spec = { task: 'doubled', rows, negatives, gen: 1, budget: { maxGenerated: 4000 } };
  const a = CORE.spawn(spec), b = spawn(spec);
  assert.ok(a.cells.length >= 1);
  assert.equal(JSON.stringify(a.cells), JSON.stringify(b.cells));
  assert.equal(a.stats.generated, b.stats.generated);
  const none = CORE.spawn({ ...spec, expectOk: () => false });
  assert.equal(none.cells.length, 0, 'a grader that passes nothing keeps nothing');
  assert.equal(CORE.passesRow('14', { q: 'Double 7', expect: { equals: '14' }, answer: '14' }), true, 'after a spawn with a given grader, the core grades with its own copy again');
  assert.equal(JSON.stringify(CORE.spawn(spec).cells), JSON.stringify(a.cells), 'the default grader is back');
});
