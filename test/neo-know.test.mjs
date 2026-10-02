// test/neo-know.test.mjs: KNOWLEDGE-BACKED CELLS of the NEO engine (THE ENGINE part 2, contract c5): the search starts
// from a pack's facts and REACHES, within the default budget, a lookup in a sentence, the reverse lookup, two lookups
// compared (larger, smaller), two combined (sum, difference) and a class (yes or no, which one); a task born from a
// source starts from that source's pack; a module carries the slices of the packs its cells read and does what the
// engine measured; a promoted colony whose cells read a pack is tagged know: true. Temp roots only, offline: no test
// reads the tree's grown/ or neo/.
// Author: THE ENGINE builder, part 2 (knowledge-backed cells, THE CURSOR), 2026-10-01.
import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn, withKnowledge, usesKnow, isFallback, KNOW_PACKS, OPEN_FAIL_DIV } from '../grow/neo-core.mjs';
import { makeColony, knowGet, evalNode, checkCell, PRIMS } from '../grow/neo-kernel.mjs';
import { compileModule, knowSlices, growTask, negativesFor, negativeGroupsFor } from '../grow/neo.mjs';
import { renderIndexMjs } from '../grow/store.mjs';
import { validateCell } from '../grow/contract.mjs';
import { expectOk } from '../judge/judge.mjs';
import { shaText } from '../grow/teach.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'neo-know-'));
const cleanup = () => { try { fs.rmSync(TMP, { recursive: true, force: true }); } catch { /* already gone */ } };
after(cleanup);
process.on('exit', cleanup);
let dirN = 0;
const tmpDir = (name) => { const d = path.join(TMP, name + '-' + (++dirN)); fs.mkdirSync(d, { recursive: true }); return d; };
const put = (root, rel, text) => { const f = path.join(root, ...rel.split('/')); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); return f; };
const jsonl = (rows) => rows.map((r) => JSON.stringify(r)).join('\n') + '\n';
const readJ = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const fresh = (f) => import(pathToFileURL(f).href + '?t=' + Date.now() + '-' + Math.random().toString(36).slice(2));

// ---------------------------------------------------------------- fixtures: three packs and eight tasks over them
const PLACES = [
  ['France', 'Paris'], ['Japan', 'Tokyo'], ['Peru', 'Lima'], ['Chile', 'Santiago'], ['Kenya', 'Nairobi'], ['Egypt', 'Cairo'],
  ['Spain', 'Madrid'], ['Italy', 'Rome'], ['Greece', 'Athens'], ['Norway', 'Oslo'], ['Sweden', 'Stockholm'], ['Finland', 'Helsinki'],
  ['Poland', 'Warsaw'], ['Austria', 'Vienna'], ['Hungary', 'Budapest'], ['Portugal', 'Lisbon'], ['Ireland', 'Dublin'], ['Canada', 'Ottawa'],
  ['Mexico', 'Mexico City'], ['Brazil', 'Brasilia'], ['Argentina', 'Buenos Aires'], ['Colombia', 'Bogota'], ['Cuba', 'Havana'], ['Ghana', 'Accra'],
  ['Nigeria', 'Abuja'], ['Ethiopia', 'Addis Ababa'], ['Morocco', 'Rabat'], ['Tunisia', 'Tunis'], ['Turkey', 'Ankara'], ['Iran', 'Tehran'],
  ['Iraq', 'Baghdad'], ['India', 'New Delhi'], ['Nepal', 'Kathmandu'], ['Thailand', 'Bangkok'], ['Vietnam', 'Hanoi'], ['China', 'Beijing'],
  ['Mongolia', 'Ulaanbaatar'], ['Australia', 'Canberra'], ['Fiji', 'Suva'], ['Samoa', 'Apia'],
];
const POP = new Map(PLACES.map(([c], i) => [c, 1000003 * (i + 7) + 7919 * ((i * 13) % 17)]));
const FRUIT = ['apple', 'pear', 'plum', 'peach', 'mango', 'cherry', 'lemon', 'lime', 'grape', 'banana', 'kiwi', 'papaya', 'guava', 'fig', 'apricot', 'melon', 'quince', 'lychee'];
const NOT_FRUIT = ['leek', 'kale', 'onion', 'carrot', 'potato', 'celery', 'spinach', 'garlic', 'salt', 'rice', 'bread', 'cheese', 'turnip', 'radish', 'parsnip', 'barley'];
const CAPS = { id: 'caps', from: 'test', sha: 'a'.repeat(64), columns: ['country', 'capital'], rows: PLACES.map(([c, k]) => [c, k]), at: '2026-10-01T00:00:00.000Z' };
const POPS = { id: 'pops', from: 'test', sha: 'b'.repeat(64), columns: ['country', 'population'], rows: PLACES.map(([c]) => [c, POP.get(c)]), at: '2026-10-01T00:00:00.000Z' };
const FRUITS = { id: 'fruits', from: 'test', sha: 'c'.repeat(64), columns: ['item', 'member'], rows: [...FRUIT.map((x) => [x, 'yes']), ...NOT_FRUIT.map((x) => [x, 'no'])], at: '2026-10-01T00:00:00.000Z' };
const PACKS = [CAPS, POPS, FRUITS];
const DEV = PLACES.slice(0, 20), CHECK = PLACES.slice(20);
const pairs = (list) => list.map((x, i) => [x[0], list[(i + 7) % list.length][0]]);
const TASKS = {
  capital: {
    source: 'caps',
    row: ([c, k], i) => ({ q: i % 2 ? `which city is the capital of ${c}` : `what is the capital of ${c}`, expect: { contains: [k] }, answer: `The capital of ${c} is ${k}.` }),
    keys: [DEV, CHECK],
  },
  reverse: {
    source: 'caps',
    row: ([c, k]) => ({ q: `which country has the capital ${k}`, expect: { contains: [c] }, answer: `The country whose capital is ${k} is ${c}.` }),
    keys: [DEV, CHECK],
  },
  larger: {
    source: 'pops',
    row: ([a, b]) => { const [w, l] = POP.get(a) > POP.get(b) ? [a, b] : [b, a]; return { q: `which has the larger population, ${a} or ${b}`, expect: { contains: [w], notContains: [l] }, answer: `${w} has the larger population (${POP.get(w)} against ${POP.get(l)}).` }; },
    keys: [pairs(DEV), pairs(CHECK)],
  },
  smaller: {
    source: 'pops',
    row: ([a, b]) => { const [w, l] = POP.get(a) < POP.get(b) ? [a, b] : [b, a]; return { q: `which has the smaller population, ${a} or ${b}`, expect: { contains: [w], notContains: [l] }, answer: `${w} has the smaller population (${POP.get(w)} against ${POP.get(l)}).` }; },
    keys: [pairs(DEV), pairs(CHECK)],
  },
  sum: {
    source: 'pops',
    row: ([a, b]) => { const s = POP.get(a) + POP.get(b); return { q: `what is the population of ${a} plus that of ${b}`, expect: { contains: [String(s)] }, answer: `The population of ${a} (${POP.get(a)}) plus that of ${b} (${POP.get(b)}) is ${s}.` }; },
    keys: [pairs(DEV), pairs(CHECK)],
  },
  difference: {
    source: 'pops',
    row: ([a, b]) => { const [x, y] = POP.get(a) > POP.get(b) ? [a, b] : [b, a], d = POP.get(x) - POP.get(y); return { q: `how many more people live in ${x} than in ${y}`, expect: { contains: [String(d)] }, answer: `${x} has ${d} more people than ${y}.` }; },
    keys: [pairs(DEV), pairs(CHECK)],
  },
  member: {
    source: 'fruits',
    row: (x) => (FRUIT.includes(x)
      ? { q: `is ${x} a fruit`, expect: { contains: ['yes'], notContains: ['not'] }, answer: `Yes, ${x} is a fruit.` }
      : { q: `is ${x} a fruit`, expect: { contains: ['not'], notContains: ['yes'] }, answer: `No, ${x} is not a fruit.` }),
    keys: [[...FRUIT.slice(0, 11), ...NOT_FRUIT.slice(0, 10)], [...FRUIT.slice(11), ...NOT_FRUIT.slice(10)]],
  },
  which: {
    source: 'fruits',
    row: ([a, b, c], i) => { const f = [a, b, c].find((x) => FRUIT.includes(x)); return { q: `among ${a}, ${b} or ${c}, which one is a fruit`, expect: { contains: [f], notContains: [a, b, c].filter((x) => x !== f) }, answer: `${f} is a fruit.` }; },
    keys: (() => { const tri = (fs0, ns, off) => fs0.map((f, i) => { const n1 = ns[(i + off) % ns.length], n2 = ns[(i + off + 3) % ns.length]; return [[f, n1, n2], [n1, f, n2], [n1, n2, f]][i % 3]; }); return [tri(FRUIT.slice(0, 12), NOT_FRUIT.slice(0, 10), 0), tri(FRUIT.slice(12), NOT_FRUIT.slice(10), 1)]; })(),
  },
};
const rowsOf = (name, k) => TASKS[name].keys[k].map((x, i) => TASKS[name].row(x, i));
const RUNS = {};
/** The task spawned once with the default budget (no budget given) and its source; memoised. */
function run(name) {
  if (!RUNS[name]) RUNS[name] = spawn({ task: name, rows: rowsOf(name, 0), packs: PACKS, source: TASKS[name].source, expectOk });
  return RUNS[name];
}
/** The rows of keys no dev row names that the whole colony answers right, with the packs loaded (as SELECT scores). */
function checkScore(name) {
  const { cells } = run(name), rows = rowsOf(name, 1);
  return withKnowledge(PACKS, () => {
    const col = makeColony(cells), out = { ok: 0, n: rows.length, byKnow: 0, miss: [] };
    for (const r of rows) {
      const e = col.explain(r.q), a = e ? e.answer : null;
      if (a !== null && expectOk(a, r.expect)) { out.ok++; if (usesKnow(cells[e.index])) out.byKnow++; } else out.miss.push([r.q, a]);
    }
    return out;
  });
}
const bare = (rows) => rows.map((r) => ({ q: r.q, expect: r.expect }));

// ---------------------------------------------------------------- REACH: the default budget finds the fact-backed cell
for (const name of Object.keys(TASKS)) {
  test(name + ': with the default budget the colony answers every check row (keys no dev row names) through a cell that reads the pack', () => {
    const { stats } = run(name), s = checkScore(name);
    assert.deepEqual(stats.packs, [TASKS[name].source], 'the search starts from the source pack');
    assert.ok(stats.know >= 1, 'a kept cell reads the pack');
    assert.equal(s.ok, s.n, name + ' missed ' + JSON.stringify(s.miss.slice(0, 3)));
    assert.equal(s.byKnow, s.n, 'every check row is answered by a knowledge-backed cell');
  });
}

test('without the packs the same colony answers no check row: the answers come from the facts, not from memory', () => {
  for (const name of ['capital', 'reverse', 'larger', 'sum']) {
    const col = makeColony(run(name).cells), rows = rowsOf(name, 1);
    withKnowledge([], () => assert.equal(rows.filter((r) => expectOk(col.answer(r.q), r.expect)).length, 0, name));
  }
});

test('a fact the dev rows never named is reached through the pack: a key added to the pack answers at once', () => {
  const extra = { ...CAPS, rows: [...CAPS.rows, ['Atlantis', 'Poseidonia']] };
  const col = makeColony(run('capital').cells);
  assert.equal(withKnowledge(PACKS, () => col.answer('what is the capital of Atlantis')), null);
  assert.match(withKnowledge([extra], () => col.answer('what is the capital of Atlantis')), /\bPoseidonia\b/);
});

// ---------------------------------------------------------------- which packs a search starts from
test('a task born from a source starts from that source pack alone, even when another pack names its keys as well', () => {
  const { stats } = spawn({ task: 'capital', rows: rowsOf('capital', 0), packs: PACKS, source: 'pops', budget: { maxGenerated: 3000 }, expectOk });
  assert.deepEqual(stats.packs, ['pops']);
  const none = spawn({ task: 'capital', rows: rowsOf('capital', 0), packs: PACKS, source: 'no-such-pack', budget: { maxGenerated: 3000 }, expectOk });
  assert.deepEqual(none.stats.packs, ['caps', 'pops'], 'an unknown source falls back to the packs the prompts name');
});

test('with no source: the packs whose keys at least half the dev prompts name, most first, at most KNOW_PACKS', () => {
  const rows = rowsOf('capital', 0);
  const plain = spawn({ task: 'capital', rows, packs: PACKS, budget: { maxGenerated: 3000 }, expectOk });
  assert.deepEqual(plain.stats.packs, ['caps', 'pops'], 'fruits names no country');
  const copies = [...PACKS, ...['caps-b', 'caps-c', 'caps-d'].map((id) => ({ ...CAPS, id, sha: id.at(-1).repeat(64) }))];
  const many = spawn({ task: 'capital', rows, packs: copies, budget: { maxGenerated: 3000 }, expectOk });
  assert.equal(KNOW_PACKS, 3);
  assert.deepEqual(many.stats.packs, ['caps', 'caps-b', 'caps-c']);
  const half = rows.slice(0, 10).concat(rowsOf('member', 0).slice(0, 11)); // 10 of 21 prompts name a country
  assert.ok(!spawn({ task: 'mixed', rows: half, packs: PACKS, budget: { maxGenerated: 3000 }, expectOk }).stats.packs.includes('caps'));
  assert.deepEqual(spawn({ task: 'capital', rows, packs: null, budget: { maxGenerated: 3000 }, expectOk }).stats.packs, []);
});

test('withKnowledge loads exactly its packs and empties the kernel afterwards, even when its function throws; a spawn loads its own again', () => {
  const look = (q) => evalNode(['know.lookup', ['transform.nthStr', ['know.find', { lit: 'caps' }, { lit: 'country' }], { lit: 1 }], { lit: 'caps' }, { lit: 'country' }, { lit: 'capital' }], q, null);
  assert.equal(withKnowledge(PACKS, () => look('the capital of Peru')), 'Lima');
  assert.equal(withKnowledge([POPS], () => look('the capital of Peru')), null, 'only the packs given');
  assert.equal(look('the capital of Peru'), null);
  assert.throws(() => withKnowledge(PACKS, () => { throw new Error('boom'); }), /boom/);
  assert.equal(look('the capital of Peru'), null);
  const again = spawn({ task: 'capital', rows: rowsOf('capital', 0), packs: PACKS, source: 'caps', budget: { maxGenerated: 3000 }, expectOk });
  assert.ok(again.stats.devOk >= 18 && again.stats.know >= 1, 'the spawn after withKnowledge read the facts: devOk ' + again.stats.devOk);
});

test('usesKnow and isFallback read the pyramid: a know primitive anywhere, memory.nearest anywhere', () => {
  const L = ['know.lookup', ['transform.nthStr', ['know.find', { lit: 'caps' }, { lit: 'country' }], { lit: 1 }], { lit: 'caps' }, { lit: 'country' }, { lit: 'capital' }];
  assert.equal(usesKnow({ pyramid: ['render.str', L] }), true);
  assert.equal(usesKnow({ pyramid: ['render.str', ['sense.text']] }), false);
  assert.equal(usesKnow(null), false);
  assert.equal(isFallback({ pyramid: ['render.str', ['memory.nearest', ['sense.text']]] }), true);
  assert.equal(isFallback({ pyramid: ['render.str', L] }), false);
});

// ---------------------------------------------------------------- slices: the facts a compiled module carries
const L1 = (pid, kc, vc) => ['know.lookup', ['transform.nthStr', ['know.find', { lit: pid }, { lit: kc }], { lit: 1 }], { lit: pid }, { lit: kc }, { lit: vc }];
const cellOf = (pyramid) => ({ id: 'c', task: 't', gen: 1, parents: [], guard: [], pyramid, mem: null, height: 1, size: 1, fit: { ok: 1, n: 1 } });
const MIXED = {
  id: 'mixed', from: 'test', sha: 'd'.repeat(64), columns: ['name', 'kind', 'value', 'note'],
  rows: Array.from({ length: 24 }, (_, i) => ['item ' + i, ['alpha', 'beta'][i % 2], [3.14159, -2.5, 0.1 + 0.2, 1234567.891, 7, 0.000123][i % 6] * (i + 1), i % 5 ? 'plain|text~' + i : 'uses process here']),
};

test('knowSlices: only the packs the cells name by a literal id, every row, only the columns the cells read', () => {
  const s = knowSlices([cellOf(['render.str', L1('caps', 'country', 'capital')]), cellOf(['render.str', ['know.find', { lit: 'fruits' }, { lit: 'item' }]])], PACKS);
  assert.deepEqual(s.map((x) => [x.id, x.columns, x.n]), [['caps', ['country', 'capital'], 40], ['fruits', ['item'], 34]]);
  const reverse = knowSlices([cellOf(['render.str', ['know.reverse', ['sense.text'], { lit: 'caps' }, { lit: 'capital' }, { lit: 'country' }]])], PACKS);
  assert.deepEqual(reverse.map((x) => x.columns), [['country', 'capital']], 'pack column order, both columns');
  assert.deepEqual(knowSlices([cellOf(['render.str', ['know.find', ['sense.text'], { lit: 'item' }]])], PACKS), [], 'a pack id that is not a literal names nothing');
  assert.deepEqual(knowSlices([cellOf(['render.str', L1('nope', 'country', 'capital')])], PACKS), [], 'a pack that is not given');
  assert.deepEqual(knowSlices([cellOf(['render.str', ['sense.text']])], PACKS), []);
  assert.deepEqual(knowSlices([cellOf(['render.str', L1('caps', 'country', 'capital')])], null), []);
  const whole = knowSlices([cellOf(['render.str', ['know.find', { lit: 'caps' }, ['sense.text']]])], PACKS);
  assert.deepEqual(whole[0].columns, ['country', 'capital'], 'a column that is not a literal: every column');
});

test('knowSlices covers every know primitive of the kernel: each reads from its slices exactly what it reads from the whole packs', () => {
  const lit = (v) => ({ lit: v }), find = (p, c) => ['know.find', lit(p), lit(c)], first = (p, c) => ['transform.nthStr', find(p, c), lit(1)];
  const NODES = {
    'know.find': find('caps', 'country'),
    'know.lookup': L1('caps', 'country', 'capital'),
    'know.reverse': ['know.reverse', first('caps', 'capital'), lit('caps'), lit('country'), lit('capital')],
    'know.row': ['know.row', first('caps', 'country'), lit('caps'), lit('country')],
    'know.has': ['know.has', first('fruits', 'item'), lit('fruits'), lit('item')],
    'know.where': ['know.where', find('fruits', 'item'), lit('fruits'), lit('item'), lit('member'), lit('yes')],
    'know.num': ['know.num', L1('pops', 'country', 'population')],
  };
  const kernelKnow = Object.keys(PRIMS).filter((k) => PRIMS[k].family === 'know').sort();
  assert.deepEqual(kernelKnow, Object.keys(NODES).sort(), 'a know primitive of the kernel this test (and KNOW_COLS) does not cover');
  const QS = ['what is the capital of Peru', 'which country has the capital Lima', 'is kiwi or kale a fruit', 'the population of Chile and Peru'];
  for (const [name, node] of Object.entries(NODES)) {
    const slices = knowSlices([cellOf(node)], PACKS);
    const whole = withKnowledge(PACKS, () => QS.map((q) => evalNode(node, q, null))), sliced = withKnowledge(slices, () => QS.map((q) => evalNode(node, q, null)));
    assert.ok(whole.some((v) => v !== null), name + ' reads something from the whole packs');
    assert.deepEqual(sliced, whole, name);
  }
  assert.deepEqual(knowSlices([cellOf(NODES['know.row'])], PACKS)[0].columns, ['country', 'capital'], 'know.row reads the whole row');
  assert.deepEqual(knowSlices([cellOf(NODES['know.find'])], PACKS).map((x) => [x.id, x.columns]), [['caps', ['country']]], 'know.find names its pack first');
});

test('knowSlices round trip: every value a cell reads from the slice is the value it reads from the whole pack, floats exact', () => {
  const cells = [cellOf(['render.str', L1('mixed', 'name', 'value')]), cellOf(['render.str', L1('mixed', 'name', 'kind')]), cellOf(['render.str', L1('pops', 'country', 'population')])];
  const slices = knowSlices(cells, [...PACKS, MIXED]);
  const kinds = slices.find((x) => x.id === 'mixed').cols;
  assert.ok(kinds.some((c) => typeof c.d === 'string'), 'a column of few distinct values is a dictionary');
  assert.ok(kinds.some((c) => c.num === true && typeof c.s === 'string'), 'a number column is joined text read back as numbers');
  const read = (packs) => withKnowledge(packs, () => [
    ...MIXED.rows.map((r) => [knowGet('mixed', 'name', r[0], 'value'), knowGet('mixed', 'name', r[0], 'kind')]),
    ...POPS.rows.map((r) => knowGet('pops', 'country', r[0], 'population')),
  ]);
  const whole = read([...PACKS, MIXED]), sliced = read(slices);
  assert.deepEqual(sliced, whole);
  assert.ok(whole.every((v) => (Array.isArray(v) ? v.every((x) => x !== null) : v !== null)));
  assert.ok(MIXED.rows.every((r) => Number(withKnowledge(slices, () => knowGet('mixed', 'name', r[0], 'value'))) === Number(withKnowledge([MIXED], () => knowGet('mixed', 'name', r[0], 'value')))));
});

test('knowSlices leaves out what names a FORBIDDEN pattern: the value blanked, the column or the pack dropped', () => {
  const s = knowSlices([cellOf(['render.str', L1('mixed', 'name', 'note')])], [MIXED]);
  assert.equal(s.length, 1);
  const text = JSON.stringify(s);
  assert.doesNotMatch(text, /\bprocess\b/);
  withKnowledge(s, () => {
    assert.equal(knowGet('mixed', 'name', 'item 0', 'note'), null, 'the tripping value is empty');
    assert.equal(knowGet('mixed', 'name', 'item 1', 'note'), 'plain|text~1', 'a value with the separators kept exact');
  });
  const badCol = { ...MIXED, id: 'badcol', columns: ['name', 'kind', 'value', 'process'] };
  assert.deepEqual(knowSlices([cellOf(['render.str', L1('badcol', 'name', 'process')])], [badCol]).map((x) => x.columns), [['name']]);
  const badId = { ...CAPS, id: 'process' };
  assert.deepEqual(knowSlices([cellOf(['render.str', L1('process', 'country', 'capital')])], [badId]), []);
});

test('a compiled module carries knowLoad of its slices, passes the contract, and answers as the engine measured it', async () => {
  const { cells } = run('larger'), rows = rowsOf('larger', 0), check = rowsOf('larger', 1);
  const comp = compileModule({ id: 'larger-neo-g1', cls: 'larger', gen: 1, cells, examples: rows, packs: PACKS });
  assert.ok(comp.source, comp.why);
  assert.match(comp.source, /\nknowLoad\(\[/);
  assert.deepEqual(comp.slices.map((x) => x.id), ['pops']);
  const f = put(tmpDir('module'), 'larger-neo-g1.mjs', comp.source);
  const mod = await fresh(f);
  assert.deepEqual(validateCell(comp.source, mod), { ok: true, errors: [] });
  const inProc = withKnowledge(comp.slices, () => { const col = makeColony(comp.cells); return check.map((r) => col.answer(r.q)); });
  assert.deepEqual(check.map((r) => mod.answer(r.q)), inProc);
  assert.equal(check.filter((r) => expectOk(mod.answer(r.q), r.expect)).length, check.length);
  const bare0 = compileModule({ id: 'larger-neo-g1', cls: 'larger', gen: 1, cells, examples: rows });
  assert.doesNotMatch(bare0.source || '', /knowLoad\(\[/, 'no packs, no slices');
});

// ---------------------------------------------------------------- grow --task with packs on disk: the know tag
const CONTROL = ['tell me a joke about cats', 'what is the weather like'];
/** A tree with a task born from a source, the source shelved in neo/know, an empty grown/ and judge/control.jsonl. */
function knowRoot(name, { by = 'absorb:' + TASKS[name].source, packs = PACKS } = {}) {
  const root = tmpDir('know-root-' + name);
  const index = { generation: 1, cells: [] };
  put(root, 'grown/index.json', JSON.stringify(index, null, 2) + '\n');
  put(root, 'grown/index.mjs', renderIndexMjs(index));
  for (const p of packs) put(root, 'neo/know/' + p.id + '.json', JSON.stringify(p) + '\n');
  put(root, 'neo/know/INDEX.json', JSON.stringify({ packs: packs.map((p) => ({ id: p.id, columns: p.columns, rows: p.rows.length, sha: p.sha })) }, null, 2) + '\n');
  const d = jsonl(rowsOf(name, 0)), h = jsonl(bare(rowsOf(name, 1)));
  put(root, 'neo/tasks/' + name + '/dev.jsonl', d);
  put(root, 'neo/tasks/' + name + '/heldout.jsonl', h);
  put(root, 'neo/tasks/' + name + '/task.json', JSON.stringify({ task: name, skill: name, domain: 'test', rule: 'hidden', generation: 1, by }) + '\n');
  put(root, 'neo/LEDGER.json', JSON.stringify({ tasks: [{ task: name, generation: 1, devSha: shaText(d), heldoutSha: shaText(h), dev: 20, heldout: 20, by, at: '2026-10-01T00:00:00.000Z' }], generated: 0 }, null, 2) + '\n');
  put(root, 'judge/control.jsonl', jsonl(CONTROL.map((q) => ({ q }))));
  return root;
}
const nobody = async (rows) => rows.map((r) => ({ q: r.q, got: null }));

test('grow --task of a task born from a source: starts from its pack, masters the held-out rows, and the row is tagged know: true', async () => {
  const root = knowRoot('capital');
  const line = await growTask({ root, task: 'capital', gen: 2, organism: nobody, budget: { maxGenerated: 20000 } });
  assert.equal(line.promoted, true, JSON.stringify(line.why));
  assert.deepEqual(line.packs, ['caps']);
  assert.ok(line.know >= 1);
  assert.equal(line.round, 0);
  assert.deepEqual(line.heldout, { ok: 20, n: 20, score: 1 });
  const row = readJ(path.join(root, 'grown', 'index.json')).cells.find((r) => r.id === line.id);
  assert.equal(row.know, true);
  assert.equal(row.serve, true, 'mastered: it serves');
  const src = fs.readFileSync(path.join(root, 'grown', row.file), 'utf8');
  assert.match(src, /\nknowLoad\(\[\{"id":"caps","columns":\["country","capital"\]/);
  const idx = await fresh(path.join(root, 'grown', 'index.mjs'));
  for (const r of rowsOf('capital', 1)) { const a = idx.grownAnswer(r.q); assert.ok(a && a.id === line.id && expectOk(a.answer, r.expect), r.q + ' -> ' + JSON.stringify(a)); }
  const col = readJ(path.join(root, 'neo', 'tasks', 'capital', 'colony.json'));
  assert.ok(col.cells.some(usesKnow) && col.cells.every((c) => checkCell(c).ok));
  assert.equal(readJ(path.join(root, 'neo', 'LEDGER.json')).tasks[0].cursor.round, 0);
});

test('a colony whose cells read no pack carries no know key, and its module no knowLoad', async () => {
  const root = knowRoot('capital', { packs: [FRUITS] }); // the source pack is not shelved, and fruits names no country
  const line = await growTask({ root, task: 'capital', gen: 2, organism: nobody, budget: { maxGenerated: 20000 } });
  assert.deepEqual(line.packs, []);
  assert.equal(line.know, 0);
  if (line.promoted) {
    const row = readJ(path.join(root, 'grown', 'index.json')).cells.find((r) => r.id === line.id);
    assert.equal('know' in row, false);
    assert.doesNotMatch(fs.readFileSync(path.join(root, 'grown', row.file), 'utf8'), /knowLoad\(\[/);
  }
  assert.ok(!(line.heldout && line.heldout.score === 1), 'without the facts the unseen capitals are not reached');
});

// ---------------------------------------------------------------- THE OPEN GUARD: a fact asked in other words
// One task ("what is the capital of X", dev keys only), negatives in groups as grow/neo.mjs negativeGroupsFor gives them,
// and three check prompts in words no dev row has (no "capital", no "what"), each about a key no dev row names. Only a
// cell guarded by exclusion alone can answer them; each one holds a word a weaker exclusion rule would have taken.
const OPEN_DEV = DEV.map(([c, k]) => ({ q: `what is the capital of ${c}`, expect: { contains: [k] }, answer: `The capital of ${c} is ${k}.` }));
const group = (name, qs) => qs.map((q) => ({ q, group: name }));
const OPEN_NEGS = [
  // a sibling topic: "population" is the topic word (one group), "name" a phrasing word (six groups)
  ...group('task:pop', ['what is the population of Argentina', 'name the population of Colombia', 'name the population of Tunisia']),
  ...group('task:anthem', ['name the anthem of Turkey', 'name the anthem of Iran', 'name the anthem of Iraq']),
  ...group('task:color', ['name a color', 'name a warm color', 'name a cold color']),
  ...group('task:fruit', ['name a fruit', 'name a red fruit', 'name a sour fruit']),
  ...group('task:tool', ['name a tool', 'name a garden tool', 'name a small tool']),
  ...group('task:dog', ['name a dog', 'name a big dog', 'name a small dog']),
  // one entity in every prompt: "Cuba" silences them all at once, but it is a fact of the pack (an entity)
  ...group('task:motto', ['Cuba motto', 'Cuba flag colors', 'Cuba national bird']),
  // one stop word in every prompt: "please" silences them all at once, but it is a stop word
  ...group('task:trivia', ['please Mongolia facts', 'please Thailand trivia', 'please Vietnam history']),
  // a dev word in every prompt: "capital" silences them all at once, but it would silence every dev row as well
  ...group('task:capsize', ['capital size of Colombia', 'capital crime rate in Tunisia', 'capital river of Turkey']),
  // one number in every prompt beside an entity: "1900" silences them all at once (a number is no word of a dev row)
  ...group('task:year', ['Cuba in 1900', 'Ghana in 1900', 'Nigeria in 1900']),
  // a topic word and a number in every prompt: the topic word "census" is taken, the number "2020" is not
  ...group('task:census', ['Peru census of 2020', 'Chile census of 2020', 'Kenya census of 2020']),
];
const OPEN_CHECK = [
  { q: 'seat of government for Cuba', expect: { contains: ['Havana'] } },
  { q: 'name the seat of government in Ghana', expect: { contains: ['Accra'] } },
  { q: 'please give the seat of government of Nigeria', expect: { contains: ['Abuja'] } },
];
const OPEN_BUDGET = { maxGenerated: 20000 };
let OPEN_RUN = null;
const openRun = () => (OPEN_RUN ??= spawn({ task: 'capital-of', rows: OPEN_DEV, negatives: OPEN_NEGS, packs: [CAPS], source: 'caps', budget: OPEN_BUDGET, expectOk }));
const isOpen = (c) => c.guard.every((ft) => ft[0] === 'not');
const answersOf = (cells, prompts) => withKnowledge([CAPS], () => { const col = makeColony(cells); return prompts.map((q) => col.answer(q)); });

test('open guard: a knowledge-backed cell also comes guarded by exclusion alone, and it answers the fact asked in words no dev row has', () => {
  const { cells, stats } = openRun();
  const open = cells.filter(isOpen);
  assert.ok(open.length >= 1 && open.every(usesKnow), 'an open variant of a knowledge-backed cell is kept');
  assert.equal(stats.bySource.open, open.length);
  const closedOf = (c) => cells.filter((p) => !isOpen(p) && JSON.stringify([p.pyramid, p.mem]) === JSON.stringify([c.pyramid, c.mem])).map((p) => p.id).sort();
  assert.ok(open.every((c) => JSON.stringify(c.parents) === JSON.stringify(closedOf(c))), 'its parents are the kept cells of its pyramid');
  assert.ok(open.some((c) => c.parents.length === 1), 'here a pyramid with a closed guard is opened');
  const got = answersOf(cells, OPEN_CHECK.map((r) => r.q));
  OPEN_CHECK.forEach((r, i) => assert.ok(expectOk(got[i], r.expect), r.q + ' -> ' + JSON.stringify(got[i])));
  const closed = cells.filter((c) => !isOpen(c));
  assert.deepEqual(answersOf(closed, OPEN_CHECK.map((r) => r.q)), [null, null, null], 'the dev-word guards alone answer none of them');
});

test('open guard: silent on every negative it was grown against and right on every dev row it takes', () => {
  const { cells } = openRun(), open = cells.filter(isOpen);
  assert.deepEqual(answersOf(open, OPEN_NEGS.map((n) => n.q)), OPEN_NEGS.map(() => null));
  const got = answersOf(open, OPEN_DEV.map((r) => r.q));
  OPEN_DEV.forEach((r, i) => assert.ok(expectOk(got[i], r.expect), r.q));
});

test('open guard words: a topic word before a phrasing word, a phrasing word before an entity, a stop word last', () => {
  const words = new Set(openRun().cells.filter(isOpen).flatMap((c) => c.guard.flatMap((ft) => (ft[1][0] === 'has' ? [ft[1][1]] : ft[1][1]))));
  for (const w of ['population', 'anthem', 'motto', 'facts', 'trivia', 'history', '1900', 'census']) assert.ok(words.has(w), w + ' is excluded');
  for (const w of ['name', 'cuba', 'ghana', 'nigeria', 'please', '2020']) assert.equal(words.has(w), false, w + ' is not excluded');
  // a word of a dev row its pyramid answers right is never excluded: the open cell takes every such row
  withKnowledge([CAPS], () => {
    for (const c of openRun().cells.filter(isOpen)) {
      const col = makeColony([c]);
      for (const r of OPEN_DEV) if (expectOk(evalNode(c.pyramid, r.q, c.mem), r.expect)) assert.equal(col.answer(r.q), evalNode(c.pyramid, r.q, c.mem), r.q);
    }
  });
});

test('open guard: no variant when a negative it fires on holds only dev words, and none for a cell that reads no pack', () => {
  const blocked = spawn({ task: 'capital-of', rows: OPEN_DEV, negatives: [...OPEN_NEGS, { q: 'the capital of France', group: 'task:x' }], packs: [CAPS], source: 'caps', budget: OPEN_BUDGET, expectOk });
  const open = blocked.cells.filter((c) => isOpen(c) && withKnowledge([CAPS], () => evalNode(c.pyramid, 'the capital of France', c.mem)) !== null);
  assert.deepEqual(open, [], 'no open cell fires where it must be silent');
  assert.equal(blocked.cells.filter(isOpen).length < openRun().cells.filter(isOpen).length, true, 'the pyramids that answer it lose their open variant');
  const plain = spawn({ task: 'doubled', rows: [2, 3, 4, 5, 6, 7].map((n) => ({ q: `double ${n}`, expect: { equals: String(2 * n) }, answer: String(2 * n) })), negatives: OPEN_NEGS, budget: { maxGenerated: 4000 }, expectOk });
  assert.equal(plain.cells.some(isOpen), false);
  assert.equal(plain.stats.bySource.open, undefined);
});

test('open guard from the candidates: a pyramid no closed guard keeps still gets its open variant, with no parent', () => {
  // two phrasings of 6 and 7 words; eight negatives of 7 words that hold every word the dev rows share, each with its own
  // country and its own extra word: no closed guard (a cover word and at most six features) silences them all
  const rows = DEV.map(([c, k], i) => ({ q: i % 2 ? `what is the capital city of ${c}` : `what is the capital of ${c}`, expect: { contains: [k] }, answer: `The capital of ${c} is ${k}.` }));
  const extra = ['budget', 'reserve', 'market', 'stock', 'outlay', 'spending', 'ratio', 'account'];
  const negs = group('task:capx', ['Ethiopia', 'Morocco', 'Tunisia', 'Turkey', 'Iran', 'Iraq', 'India', 'Nepal'].map((c, i) => `what is the capital ${extra[i]} of ${c}`));
  const { cells } = spawn({ task: 'capital-of', rows, negatives: negs, packs: [CAPS], source: 'caps', budget: OPEN_BUDGET, expectOk });
  const open = cells.filter(isOpen), closedKnow = cells.filter((c) => !isOpen(c) && usesKnow(c));
  assert.ok(open.length >= 1 && open.every(usesKnow));
  const orphans = open.filter((c) => !closedKnow.some((p) => JSON.stringify([p.pyramid, p.mem]) === JSON.stringify([c.pyramid, c.mem])));
  assert.ok(orphans.length >= 1, 'an open variant of a pyramid no closed cell carries');
  assert.ok(orphans.every((c) => c.parents.length === 0));
  const got = answersOf(cells, ['seat of government for Cuba', 'name the seat of government in Ghana']);
  assert.ok(expectOk(got[0], { contains: ['Havana'] }) && expectOk(got[1], { contains: ['Accra'] }), JSON.stringify(got));
  assert.deepEqual(answersOf(cells, negs.map((n) => n.q)), negs.map(() => null), 'silent on every negative');
});

test('open guard: a pyramid wrong on more than one in OPEN_FAIL_DIV of the dev rows it fires on gets none', () => {
  // 20 dev rows; the pack disagrees with the expected answer on the first `wrong` of them
  const rowsWrong = (wrong) => OPEN_DEV.map((r, i) => (i < wrong ? { ...r, expect: { contains: ['Atlantis'] }, answer: 'Atlantis.' } : r));
  const opens = (wrong) => spawn({ task: 'capital-of', rows: rowsWrong(wrong), negatives: OPEN_NEGS, packs: [CAPS], source: 'caps', budget: OPEN_BUDGET, expectOk }).cells.filter(isOpen);
  assert.equal(OPEN_DEV.length, OPEN_FAIL_DIV, 'one wrong row of 20 is the bound');
  const one = opens(1);
  assert.ok(one.length >= 1, 'wrong on 1 of 20: opened');
  assert.equal(answersOf(one, [OPEN_DEV[0].q])[0], null, 'and silent on the row it gets wrong');
  assert.deepEqual(opens(2), [], 'wrong on 2 of 20: none');
});

test('knowSlices writes runs and front coded columns, and sorts the rows when that is smaller and reads the same', () => {
  // the kinds alternate in the pack's order (no run) and fall into two runs once sorted; "Item 3." is the key "item 3"
  // again, after it and with no kind: the first row of that key stays the first, so a lookup reads the same
  const rows = Array.from({ length: 40 }, (_, i) => ['item ' + String(i).padStart(2, '0'), i % 2 ? 'beta' : 'alpha']);
  rows.splice(30, 0, ['Item 03.', '']);
  const ORDER = { id: 'order', from: 'test', sha: 'e'.repeat(64), columns: ['name', 'kind'], rows };
  const cells = [cellOf(['render.str', L1('order', 'name', 'kind')])];
  const [s] = knowSlices(cells, [ORDER]);
  assert.equal(typeof s.cols[1].r, 'string', 'the kinds as runs');
  assert.ok(s.cols[1].r.split(',').length <= 5, 'sorted: a handful of runs (the first row of each kind stays ahead)');
  assert.equal(typeof s.cols[0].f, 'string', 'the names front coded');
  const read = (packs) => withKnowledge(packs, () => [
    ...rows.map((r) => knowGet('order', 'name', r[0], 'kind')),
    ...['what kind is item 03', 'what kind is Item 03.', 'item 39 and item 00'].map((q) => evalNode(['know.find', { lit: 'order' }, { lit: 'name' }], q, null)),
  ]);
  assert.deepEqual(read([s]), read([ORDER]));
  assert.equal(withKnowledge([s], () => knowGet('order', 'name', 'item 03', 'kind')), 'beta');
  const plain = knowSlices(cells, [{ ...ORDER, rows: rows.filter((r) => r[1]) }])[0];
  assert.equal(typeof plain.cols[1].r, 'string', 'with no key twice the rows sort as well');
});

test('grow --task reads the negatives in their groups: the held-out rows in other words are mastered through the open guard', async () => {
  const root = tmpDir('open-root'), name = 'capital-of', by = 'absorb:caps';
  const index = { generation: 1, cells: [] };
  put(root, 'grown/index.json', JSON.stringify(index, null, 2) + '\n');
  put(root, 'grown/index.mjs', renderIndexMjs(index));
  put(root, 'neo/know/caps.json', JSON.stringify(CAPS) + '\n');
  put(root, 'neo/know/INDEX.json', JSON.stringify({ packs: [{ id: 'caps', columns: CAPS.columns, rows: CAPS.rows.length, sha: CAPS.sha }] }, null, 2) + '\n');
  const d = jsonl(OPEN_DEV), h = jsonl(OPEN_CHECK);
  put(root, 'neo/tasks/' + name + '/dev.jsonl', d);
  put(root, 'neo/tasks/' + name + '/heldout.jsonl', h);
  put(root, 'neo/tasks/' + name + '/task.json', JSON.stringify({ task: name, skill: name, domain: 'test', rule: 'hidden', generation: 1, by }) + '\n');
  // the other tasks: their dev rows are the negatives, grouped by task as negativeGroupsFor reads them
  const sib = new Map();
  for (const n of OPEN_NEGS) { const t = n.group.slice('task:'.length); sib.set(t, [...(sib.get(t) || []), { q: n.q, expect: { contains: ['x'] } }]); }
  for (const [t, rows] of sib) put(root, 'neo/tasks/' + t + '/dev.jsonl', jsonl(rows));
  put(root, 'neo/LEDGER.json', JSON.stringify({ tasks: [{ task: name, generation: 1, devSha: shaText(d), heldoutSha: shaText(h), dev: OPEN_DEV.length, heldout: OPEN_CHECK.length, by, at: '2026-10-01T00:00:00.000Z' }], generated: 0 }, null, 2) + '\n');
  put(root, 'judge/control.jsonl', jsonl(CONTROL.map((q) => ({ q }))));
  const key = (n) => n.group + '|' + n.q, byKey = (a, b) => (key(a) < key(b) ? -1 : 1);
  assert.deepEqual(negativeGroupsFor(root, { task: name, rows: OPEN_DEV }).filter((n) => n.group !== 'builtin').sort(byKey), [...OPEN_NEGS].sort(byKey));
  const line = await growTask({ root, task: name, gen: 2, organism: nobody, budget: OPEN_BUDGET });
  assert.deepEqual(line.heldout, { ok: 3, n: 3, score: 1 }, JSON.stringify(line.why));
  assert.equal(line.promoted, true);
});

test('negativeGroupsFor: every negative with its group, in the order and number negativesFor gives', () => {
  const root = tmpDir('groups');
  put(root, 'judge/dev/math.jsonl', jsonl([{ q: 'what is 2 plus 2', expect: { contains: ['4'] } }]));
  put(root, 'neo/tasks/a/dev.jsonl', jsonl([{ q: 'own prompt', expect: { contains: ['x'] } }]));
  put(root, 'neo/tasks/b/dev.jsonl', jsonl([{ q: 'other prompt', expect: { contains: ['y'] } }, { q: 'own prompt', expect: { contains: ['x'] } }]));
  put(root, 'grow/curriculum.jsonl', jsonl([{ id: 'cur-code-1', prompt: 'write a loop', class: 'code', route: 'curriculum', status: 'open' }]));
  const own = { task: 'a', rows: [{ q: 'own prompt', expect: { contains: ['x'] } }] };
  const g = negativeGroupsFor(root, own);
  assert.deepEqual(g.slice(0, 3), [{ q: 'what is 2 plus 2', group: 'class:math' }, { q: 'other prompt', group: 'task:b' }, { q: 'write a loop', group: 'curriculum:code' }]);
  assert.ok(g.length > 3 && g.slice(3).every((n) => n.group === 'builtin'));
  assert.deepEqual(negativesFor(root, own), g.map((n) => n.q));
});

test('contract c4: grow/neo-core.mjs imports only ./neo-kernel.mjs (no node: import), and grow/know.mjs is no import of it', () => {
  const src = fs.readFileSync(path.join(HERE, '..', 'grow', 'neo-core.mjs'), 'utf8');
  const specs = [...src.matchAll(/^\s*(?:import|export)\s[^;]*?\bfrom\s+['"]([^'"]+)['"]/gm)].map((m) => m[1]);
  assert.deepEqual([...new Set(specs)], ['./neo-kernel.mjs']);
  assert.doesNotMatch(src, /\bimport\s*\(|['"]node:/);
});
