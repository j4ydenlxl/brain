// test/neo-series.test.mjs: THE ENGINE part 4 in the search and the grade. The series, table and matrix families of
// grow/neo-kernel.mjs reached by the search of grow/neo-core.mjs (a pack's ordered column, a long table of entity and
// time, a matrix written in the prompt), the slices a module carries for them, and THE TEMPORAL GRADE of grow/neo.mjs:
// a task.json with "temporal": true is graded walk-forward (the held-out rows later than every dev row) against a
// placebo of persistence, and is mastered only above it. Temp roots only, offline: no test reads the tree's grown/ or neo/.
// Author: THE ENGINE builder, part 4 (series, tables, matrices, the temporal grade), 2026-10-02.
import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, withKnowledge, isMastered } from '../grow/neo-core.mjs';
import { makeColony, evalNode, PRIMS } from '../grow/neo-kernel.mjs';
import { knowSlices, growTask, regate, walkForward, rowTime, timeOf, isTemporal } from '../grow/neo.mjs';
import { renderIndexMjs } from '../grow/store.mjs';
import { expectOk } from '../judge/judge.mjs';
import { shaText } from '../grow/teach.mjs';

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'neo-series-'));
const cleanup = () => { try { fs.rmSync(TMP, { recursive: true, force: true }); } catch { /* already gone */ } };
after(cleanup);
process.on('exit', cleanup);
let dirN = 0;
const tmpDir = (name) => { const d = path.join(TMP, name + '-' + (++dirN)); fs.mkdirSync(d, { recursive: true }); return d; };
const put = (root, rel, text) => { const f = path.join(root, ...rel.split('/')); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); return f; };
const jsonl = (rows) => rows.map((r) => JSON.stringify(r)).join('\n') + '\n';
const readJ = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const L = (v) => ({ lit: v });
const fx = (v) => Number(v.toPrecision(12));

// ---------------------------------------------------------------- fixtures: one ordered column, one long table, matrices
const YEARS = Array.from({ length: 50 }, (_, i) => 1960 + i);
const LEVEL = new Map(YEARS.map((y, i) => [y, Math.round((300 + ((i * 37) % 23) * 1.5 + i * 0.1) * 100) / 100]));
// the rows of the series pack out of order, the keys as text and as numbers: the search must not lean on row order
const SER = { id: 'level', from: 'test', sha: 'd'.repeat(64), columns: ['year', 'level'], rows: YEARS.map((y, i) => [i % 3 ? String(y) : y, LEVEL.get(y)]).reverse(), at: '2026-10-02T00:00:00.000Z' };
const ENT = ['Aland', 'Borea', 'Cyrene', 'Dalmar', 'Elbon', 'Fenwick', 'Galt', 'Hesper', 'Ithra', 'Jorvik', 'Kestrel', 'Lumen'];
const TY = [2000, 2001, 2002, 2003, 2004, 2005];
const VAL = (e, y) => 1000 + ((ENT.indexOf(e) * 37 + (y - 2000) * 11) % 97) * 13 + ENT.indexOf(e) * 5;
const LONGP = { id: 'pop', from: 'test', sha: 'e'.repeat(64), columns: ['country', 'year', 'value'], rows: ENT.flatMap((e) => TY.map((y) => [e, y, VAL(e, y)])), at: '2026-10-02T00:00:00.000Z' };
const argmaxYear = (a, b) => { let best = a; for (let k = a; k <= b; k++) if (LEVEL.get(k) > LEVEL.get(best)) best = k; return best; };
const meanOf = (a, b) => { let s = 0; for (let k = a; k <= b; k++) s += LEVEL.get(k); return fx(s / (b - a + 1)); };
const odd = (y) => y % 2 === 1;
const TASKS = {
  peak: { family: 'series', packs: [SER], source: 'level', keys: [YEARS.filter((y) => odd(y) && y + 6 <= 2009), YEARS.filter((y) => !odd(y) && y + 6 <= 2009)],
    row: (y) => { const b = argmaxYear(y, y + 6); return { q: `in which year between ${y} and ${y + 6} was the level highest`, expect: { contains: [String(b)] }, answer: `The level was highest in ${b}.` }; } },
  before: { family: 'series', packs: [SER], source: 'level', keys: [YEARS.filter((y) => odd(y) && y > 1960), YEARS.filter((y) => !odd(y) && y > 1960)],
    row: (y) => ({ q: `what was the level the year before ${y}`, expect: { contains: [String(LEVEL.get(y - 1))] }, answer: `The year before ${y} the level was ${LEVEL.get(y - 1)}.` }) },
  mean: { family: 'series', packs: [SER], source: 'level', keys: [YEARS.filter((y) => odd(y) && y + 4 <= 2009), YEARS.filter((y) => !odd(y) && y + 4 <= 2009)],
    row: (y) => ({ q: `what was the average level from ${y} to ${y + 4}`, expect: { contains: [String(meanOf(y, y + 4))] }, answer: `From ${y} to ${y + 4} the level averaged ${meanOf(y, y + 4)}.` }) },
  cell: { family: 'table', packs: [LONGP], source: 'pop', keys: [ENT.slice(0, 8).flatMap((e, i) => [[e, TY[i % 6]], [e, TY[(i + 3) % 6]]]), ENT.slice(8).flatMap((e, i) => [[e, TY[i % 6]], [e, TY[(i + 2) % 6]]])],
    row: ([e, y]) => ({ q: `what was the value of ${e} in ${y}`, expect: { contains: [String(VAL(e, y))] }, answer: `The value of ${e} in ${y} was ${VAL(e, y)}.` }) },
  latest: { family: 'table', packs: [LONGP], source: 'pop', keys: [ENT.slice(0, 8), ENT.slice(8)],
    row: (e) => ({ q: `what is the latest value of ${e}`, expect: { contains: [String(VAL(e, 2005))] }, answer: `The latest value of ${e} is ${VAL(e, 2005)}.` }) },
  top: { family: 'table', packs: [LONGP], source: 'pop', keys: [[2000, 2002, 2004], [2001, 2003, 2005]],
    row: (y) => { const b = ENT.reduce((m, e) => (VAL(e, y) > VAL(m, y) ? e : m)); return { q: `which country had the highest value in ${y}`, expect: { contains: [b] }, answer: `${b} had the highest value in ${y}.` }; } },
};
const MATS = Array.from({ length: 24 }, (_, i) => [[(i % 5) + 1, (i * 3) % 7], [(i * 2) % 5, (i % 4) + 2]]);
const mtxt = (m) => '[[' + m.map((r) => r.join(', ')).join('], [') + ']]';
const mmul = (a, b) => a.map((r) => b[0].map((_, j) => r.reduce((s, x, k) => s + x * b[k][j], 0)));
const det2 = (m) => m[0][0] * m[1][1] - m[0][1] * m[1][0];
const firstHalf = [...Array(12).keys()], secondHalf = firstHalf.map((i) => i + 12);
TASKS.product = { family: 'matrix', packs: [], keys: [firstHalf, secondHalf],
  row: (i) => { const a = MATS[i], b = MATS[(i + 5) % 24], p = mtxt(mmul(a, b)); return { q: `multiply ${mtxt(a)} by ${mtxt(b)}`, expect: { contains: [p] }, answer: `The product is ${p}.` }; } };
TASKS.determinant = { family: 'matrix', packs: [], keys: [firstHalf, secondHalf],
  row: (i) => ({ q: `what is the determinant of ${mtxt(MATS[i])}`, expect: { contains: [String(det2(MATS[i]))] }, answer: `The determinant is ${det2(MATS[i])}.` }) };
const rowsFor = (name, k) => TASKS[name].keys[k].map((x) => TASKS[name].row(x));
const RUNS = {};
const run = (name) => (RUNS[name] ??= spawn({ task: name, rows: rowsFor(name, 0), packs: TASKS[name].packs, source: TASKS[name].source, expectOk, budget: { maxGenerated: 20000 } }));
const famsOf = (node, out = new Set()) => { if (Array.isArray(node)) { if (typeof node[0] === 'string' && PRIMS[node[0]]) out.add(PRIMS[node[0]].family); node.slice(1).forEach((c) => famsOf(c, out)); } return out; };

// ---------------------------------------------------------------- REACH: each family answers rows no dev row names
for (const name of Object.keys(TASKS)) {
  test(name + ': the search reaches a ' + TASKS[name].family + ' cell that answers every check row (keys no dev row names)', () => {
    const { cells, stats } = run(name), check = rowsFor(name, 1);
    const res = withKnowledge(TASKS[name].packs, () => { const col = makeColony(cells); return check.map((r) => { const e = col.explain(r.q); return { r, e, ok: e !== null && expectOk(e.answer, r.expect) }; }); });
    assert.deepEqual(res.filter((x) => !x.ok).map((x) => [x.r.q, x.e && x.e.answer]), [], name);
    assert.ok(res.every((x) => famsOf(cells[x.e.index].pyramid).has(TASKS[name].family)), 'every check row is answered by a cell of the family');
    if (TASKS[name].source) assert.deepEqual(stats.packs, [TASKS[name].source]);
  });
}

test('the families leave the old reach alone: a series pack with a unique key is still a know lookup', () => {
  const rows = YEARS.filter(odd).map((y) => ({ q: `what was the level in ${y}`, expect: { contains: [String(LEVEL.get(y))] }, answer: `The level in ${y} was ${LEVEL.get(y)}.` }));
  const { cells } = spawn({ task: 'at', rows, packs: [SER], source: 'level', expectOk, budget: { maxGenerated: 20000 } });
  const check = YEARS.filter((y) => !odd(y)).map((y) => ({ q: `what was the level in ${y}`, expect: { contains: [String(LEVEL.get(y))] } }));
  withKnowledge([SER], () => { const col = makeColony(cells); assert.equal(check.filter((r) => expectOk(col.answer(r.q), r.expect)).length, check.length); });
});

test('a long table is found without a hint, and a pack long field names the pair', () => {
  const hinted = { ...LONGP, id: 'pop2', columns: ['year', 'country', 'value'], rows: LONGP.rows.map(([e, y, v]) => [y, e, v]), long: ['country', 'year'] };
  const rows = rowsFor('latest', 0).map((r) => r);
  const a = spawn({ task: 'latest', rows, packs: [hinted], source: 'pop2', expectOk, budget: { maxGenerated: 20000 } });
  withKnowledge([hinted], () => { const col = makeColony(a.cells); assert.equal(rowsFor('latest', 1).filter((r) => expectOk(col.answer(r.q), r.expect)).length, 4); });
  const wrong = { ...hinted, id: 'pop3', long: ['value', 'year'] }; // a hint naming the wrong pair: no table seed of the real one
  const b = spawn({ task: 'latest', rows, packs: [wrong], source: 'pop3', expectOk, budget: { maxGenerated: 20000 } });
  assert.ok(!b.cells.some((c) => famsOf(c.pyramid).has('table') && JSON.stringify(c.pyramid).includes('"table.latest"')), 'the hint is the one pair');
});

test('a long table of snapshots (an entity, a UTC stamp to the second, a reading) is found and read by its latest stamp', () => {
  const NAMES = ['Kappa', 'Lyra', 'Mensa', 'Norma', 'Orion', 'Pavo', 'Rigel', 'Sagitta', 'Tucana', 'Vela'];
  const STAMPS = ['2026-10-02T09:00:00Z', '2026-10-02T09:00:30Z', '2026-10-02T10:15:00Z', '2026-10-02T10:15:01Z'];
  const read = (n, s) => 10 + ((NAMES.indexOf(n) * 13 + STAMPS.indexOf(s) * 7) % 29);
  const snap = { id: 'snap', from: 'test', sha: 'f'.repeat(64), columns: ['name', 'time', 'reading'], rows: STAMPS.flatMap((s) => NAMES.map((n) => [n, s, read(n, s)])).reverse() };
  const rowOf = (n) => ({ q: `what is the latest reading of ${n}`, expect: { contains: [String(read(n, STAMPS[3]))] }, answer: `The latest reading of ${n} is ${read(n, STAMPS[3])}.` });
  const { cells } = spawn({ task: 'snap', rows: NAMES.slice(0, 6).map(rowOf), packs: [snap], source: 'snap', expectOk, budget: { maxGenerated: 20000 } });
  withKnowledge([snap], () => { const col = makeColony(cells); assert.deepEqual(NAMES.slice(6).filter((n) => !expectOk(col.answer(rowOf(n).q), rowOf(n).expect)), []); });
});

// ---------------------------------------------------------------- the slices a module carries
const KEYS = { series: { 0: [], 1: ['1971'], 2: ['1965', '1975'] }, num: [305] };
const TABLE_ARGS = { get: ['Borea', '2003'], at: ['Borea', '2003'], rank: ['Borea', '2003'], delta: ['Borea', '2001', '2004'], latest: ['Borea'], latestKey: ['Borea'], earliest: ['Borea'], earliestKey: ['Borea'], series: ['Borea'], top: ['2003'], bottom: ['2003'], across: ['2003'] };
test('knowSlices covers every series and table primitive: each reads from its slices what it reads from the whole pack', () => {
  const sfx = (p) => ({ ...p, rows: [...p.rows].reverse(), columns: [...p.columns] });
  const series = Object.keys(PRIMS).filter((n) => PRIMS[n].family === 'series'), table = Object.keys(PRIMS).filter((n) => PRIMS[n].family === 'table');
  assert.deepEqual(table.map((n) => n.split('.')[1]).sort(), Object.keys(TABLE_ARGS).sort(), 'a table primitive this test does not cover');
  const extra = { ...SER, id: 'level', columns: ['year', 'level', 'note'], rows: SER.rows.map((r) => [...r, 'x']) };
  for (const n of series) {
    const k = PRIMS[n].in.length - 3, pre = PRIMS[n].in[0] === 'num' ? KEYS.num : KEYS.series[k];
    assert.equal(pre.length, k, n);
    const node = ['render.str', ['transform.asText', [n, ...pre.map(L), L('level'), L('year'), L('level')]]];
    const leaf = [n, ...pre.map(L), L('level'), L('year'), L('level')];
    const slices = knowSlices([{ pyramid: ['render.number', leaf] }], [extra]);
    assert.deepEqual(slices.map((x) => [x.id, x.columns]), [['level', ['year', 'level']]], n + ' names its pack and its two columns');
    const whole = withKnowledge([sfx(extra)], () => evalNode(leaf, '', null)), sliced = withKnowledge(slices, () => evalNode(leaf, '', null));
    assert.notEqual(whole, null, n + ' reads something');
    assert.deepEqual(sliced, whole, n);
    void node;
  }
  for (const n of table) {
    const pre = TABLE_ARGS[n.split('.')[1]];
    const leaf = [n, ...pre.map(L), L('pop'), L('country'), L('year'), L('value')];
    const slices = knowSlices([{ pyramid: ['render.number', leaf] }], [{ ...LONGP, columns: [...LONGP.columns, 'code'], rows: LONGP.rows.map((r) => [...r, 'c']) }]);
    assert.deepEqual(slices.map((x) => [x.id, x.columns]), [['pop', ['country', 'year', 'value']]], n + ' names its pack and its three columns');
    const whole = withKnowledge([sfx(LONGP)], () => evalNode(leaf, '', null)), sliced = withKnowledge(slices, () => evalNode(leaf, '', null));
    assert.notEqual(whole, null, n + ' reads something');
    assert.deepEqual(sliced, whole, n);
  }
});

// ---------------------------------------------------------------- THE TEMPORAL GRADE
test('timeOf and rowTime: numbers, years, months and dates in order; a row its own t, else the latest date its prompt writes', () => {
  assert.equal(timeOf(1990), 1990);
  assert.equal(timeOf('1990'), 1990);
  assert.ok(timeOf('1990-02') > timeOf('1990-01') && timeOf('1990-12') < timeOf('1991'));
  assert.ok(timeOf('2020-03-05') > timeOf('2020-03-04'));
  assert.equal(timeOf('2020-13'), null);
  assert.equal(timeOf('soon'), null);
  assert.equal(timeOf(NaN), null);
  assert.equal(rowTime({ q: 'what in 1990', t: 5 }), 5, 'the own t first');
  assert.equal(rowTime({ q: 'from 1990 to 1995, and 1,234 and 12345 are no year' }), 1995);
  assert.equal(rowTime({ q: 'the change from 1990-1995' }), 1995);
  assert.equal(rowTime({ q: 'no time at all' }), null);
  assert.equal(rowTime(null), null);
});

const row = (q, a) => ({ q, expect: { contains: [a] }, answer: 'It was ' + a + '.' });
test('walkForward: only the held-out rows later than every dev row, in time order, and persistence as the placebo', () => {
  const dev = [row('value in 2001', '5'), row('value in 2003', '7'), row('value in 2002', '6')];
  const held = [row('value in 2005', '7'), row('value in 2000', '4'), row('value in 2004', '8'), row('value in 2003', '7'), row('value with no time', '1')];
  const w = walkForward(dev, held);
  assert.deepEqual(w.held.map((r) => r.q), ['value in 2004', 'value in 2005'], 'later rows only, in time order');
  assert.equal(w.left, 3);
  // 2004 is answered by 2003's "7" (wrong: 8), 2005 by 2004's "8" once it is revealed (wrong: 7)
  assert.deepEqual(w.placebo, { ok: 0, n: 2, score: 0 });
  const flat = walkForward([row('value in 2001', '5')], [row('value in 2002', '5'), row('value in 2003', '5')]);
  assert.deepEqual(flat.placebo, { ok: 2, n: 2, score: 1 }, 'a value that never moves: persistence is right every time');
  const untimed = walkForward([row('alpha', 'a'), row('beta', 'b')], [row('gamma', 'b'), row('delta', 'x')]);
  assert.deepEqual(untimed.held.map((r) => r.q), ['gamma', 'delta'], 'no time on any row: the file order is the time');
  assert.deepEqual(untimed.placebo, { ok: 1, n: 2, score: 0.5 });
  const same = walkForward([row('value in 2001', '5')], [row('value in 2001', '5'), row('value in 2002', '9')]);
  assert.deepEqual(same.held.map((r) => r.q), ['value in 2002'], 'a row as old as the last dev row is not later');
  const eq = walkForward([row('value in 2001', '5')], [{ q: 'value in 2002', expect: { equals: '5' } }, { q: 'value in 2003', expect: { equals: '6' } }]);
  assert.deepEqual(eq.placebo, { ok: 1, n: 2, score: 0.5 }, 'a row with no answer text persists its equals');
  assert.deepEqual(walkForward([], []).placebo, { ok: 0, n: 0, score: 0 });
});

test('isMastered: a placebo in the heldout must be beaten; a malformed one masters nothing', () => {
  assert.equal(isMastered({ score: 1, n: 4, ok: 4 }), true);
  assert.equal(isMastered({ score: 1, n: 4, ok: 4, placebo: { ok: 1, n: 4, score: 0.25 } }), true);
  assert.equal(isMastered({ score: 1, n: 4, ok: 4, placebo: { ok: 4, n: 4, score: 1 } }), false);
  assert.equal(isMastered({ score: 1, n: 4, ok: 4, placebo: null }), false);
  assert.equal(isMastered({ score: 1, n: 4, ok: 4, placebo: { score: '0' } }), false);
});

// a tree with one task over the series pack, temporal or not
const CONTROL = ['tell me a joke about cats', 'what is the weather like'];
function seriesRoot(name, { temporal, dev, held, packs = [SER], by = 'absorb:level' }) {
  const root = tmpDir('root-' + name);
  const index = { generation: 1, cells: [] };
  put(root, 'grown/index.json', JSON.stringify(index, null, 2) + '\n');
  put(root, 'grown/index.mjs', renderIndexMjs(index));
  for (const p of packs) put(root, 'neo/know/' + p.id + '.json', JSON.stringify(p) + '\n');
  put(root, 'neo/know/INDEX.json', JSON.stringify({ packs: packs.map((p) => ({ id: p.id, columns: p.columns, rows: p.rows.length, sha: p.sha })) }, null, 2) + '\n');
  const d = jsonl(dev), h = jsonl(held.map((r) => ({ q: r.q, expect: r.expect })));
  put(root, 'neo/tasks/' + name + '/dev.jsonl', d);
  put(root, 'neo/tasks/' + name + '/heldout.jsonl', h);
  put(root, 'neo/tasks/' + name + '/task.json', JSON.stringify({ task: name, skill: name, domain: 'test', rule: 'hidden', generation: 1, by, ...(temporal === undefined ? {} : { temporal }) }) + '\n');
  put(root, 'neo/LEDGER.json', JSON.stringify({ tasks: [{ task: name, generation: 1, devSha: shaText(d), heldoutSha: shaText(h), dev: dev.length, heldout: held.length, by, at: '2026-10-02T00:00:00.000Z' }], generated: 0 }, null, 2) + '\n');
  put(root, 'judge/control.jsonl', jsonl(CONTROL.map((q) => ({ q }))));
  return root;
}
const nobody = async (rows) => rows.map((r) => ({ q: r.q, got: null }));
const levelRow = (y) => ({ q: `what was the level in ${y}`, expect: { contains: [String(LEVEL.get(y))] }, answer: `The level in ${y} was ${LEVEL.get(y)}.` });
const unitRow = (y) => ({ q: `in which unit was the level of ${y} written`, expect: { contains: ['ppm'] }, answer: 'The level of ' + y + ' was written in ppm.' });

test('grow of a temporal task: held-out is the later rows only, the line prints the placebo, and beating it masters', async () => {
  const dev = YEARS.filter((y) => y <= 1990).map(levelRow), held = [1975, 1980, 1991, 1995, 2000, 2004].map(levelRow);
  const root = seriesRoot('levels', { temporal: true, dev, held });
  assert.equal(isTemporal(root, 'levels'), true);
  const line = await growTask({ root, task: 'levels', gen: 2, organism: nobody, budget: { maxGenerated: 20000 } });
  assert.equal(line.promoted, true, JSON.stringify(line.why));
  assert.deepEqual(line.heldout, { ok: 4, n: 4, score: 1, placebo: { ok: 0, n: 4, score: 0 } }, 'the 1975 and 1980 rows are not later than the dev rows');
  assert.deepEqual(line.placebo, { ok: 0, n: 4, score: 0 });
  const r = readJ(path.join(root, 'grown', 'index.json')).cells.find((x) => x.id === line.id);
  assert.deepEqual(r.heldout.placebo, { ok: 0, n: 4, score: 0 });
  assert.equal(r.serve, true, 'above its placebo: mastered');
});

test('a temporal colony that only ties persistence is not mastered; the same rows without temporal are', async () => {
  const dev = YEARS.filter((y) => y <= 1990).map(unitRow), held = [1995, 2000, 2004].map(unitRow);
  const t = seriesRoot('units', { temporal: true, dev, held });
  const line = await growTask({ root: t, task: 'units', gen: 2, organism: nobody, budget: { maxGenerated: 20000 } });
  assert.deepEqual(line.heldout, { ok: 3, n: 3, score: 1, placebo: { ok: 3, n: 3, score: 1 } });
  const row = readJ(path.join(t, 'grown', 'index.json')).cells.find((x) => x.id === line.id);
  assert.equal(row.serve, false);
  assert.match(row.gate, /not mastered: held-out 3 of 3, placebo 3 of 3/);
  const plain = seriesRoot('units', { temporal: false, dev, held });
  const line2 = await growTask({ root: plain, task: 'units', gen: 2, organism: nobody, budget: { maxGenerated: 20000 } });
  assert.deepEqual(line2.heldout, { ok: 3, n: 3, score: 1 }, 'no placebo where the task is not temporal');
  assert.equal(readJ(path.join(plain, 'grown', 'index.json')).cells.find((x) => x.id === line2.id).serve, true);
});

test('regate: a temporal task row with no placebo in its heldout does not serve', async () => {
  const dev = YEARS.filter((y) => y <= 1990).map(levelRow), held = [1995, 2000].map(levelRow);
  const root = seriesRoot('levels', { temporal: false, dev, held });
  const line = await growTask({ root, task: 'levels', gen: 2, organism: nobody, budget: { maxGenerated: 20000 } });
  assert.equal(line.promoted, true, JSON.stringify(line.why));
  assert.equal((await regate({ root })).serving, 1);
  put(root, 'neo/tasks/levels/task.json', JSON.stringify({ task: 'levels', skill: 'levels', domain: 'test', rule: 'hidden', generation: 1, by: 'absorb:level', temporal: true }) + '\n');
  const g = await regate({ root });
  assert.equal(g.serving, 0);
  const r = readJ(path.join(root, 'grown', 'index.json')).cells.find((x) => x.id === line.id);
  assert.match(r.gate, /a temporal task graded without its placebo/);
});

test('isTemporal: only "temporal": true; a missing or broken task.json is not', () => {
  const root = tmpDir('temporal');
  put(root, 'neo/tasks/a/task.json', JSON.stringify({ temporal: true }));
  put(root, 'neo/tasks/b/task.json', JSON.stringify({ temporal: 'yes' }));
  put(root, 'neo/tasks/c/task.json', '{ not json');
  assert.equal(isTemporal(root, 'a'), true);
  assert.equal(isTemporal(root, 'b'), false);
  assert.equal(isTemporal(root, 'c'), false);
  assert.equal(isTemporal(root, 'd'), false);
});

test('no domain word in the temporal grade: the code names no field, unit or subject of any data', () => {
  const src = fs.readFileSync(new URL('../grow/neo.mjs', import.meta.url), 'utf8');
  const a = src.indexOf('THE TEMPORAL GRADE: walk-forward'), b = src.indexOf('function heldOf(');
  const region = src.slice(a, src.indexOf('\n}\n', b));
  assert.ok(a > 0 && b > a);
  assert.doesNotMatch(region, /\b(price|stock|temperature|weather|population|country|gdp|market|sales|ppm|level)\b/i);
});
