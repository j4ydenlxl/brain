// test/spawn.test.mjs: a question grows the cells that answer it (genome/spawn.mjs, act/spawn.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Brain } from '../core/brain.mjs';
import { ACTIVE } from '../core/connectome.mjs';
import { G } from '../cells/grid.mjs';
import { ask } from '../act/prompt.mjs';
import { askBySpawn, lastSpawn, spawnAsk, spawnWanted } from '../act/spawn.mjs';
import { SPAWN_REGION, detect, grow, holds, plan, regionCells, retract, roster } from '../genome/spawn.mjs';
import { run as runBench } from '../bench/spawn.mjs';

const fresh = (name) => new Brain({ name, ledger: 'full', pruneEvery: 0 });
const COMPARE = 'Compare two numbers. Answer -1 if the first is smaller, 0 if they are equal, 1 if the first is larger. First 9.11, second 9.9. Answer with -1, 0 or 1 only.';
const BINOP = 'Compute this exactly. Answer with the value only, as an integer, a decimal or a fraction: 7 * 6';
const NESTED = 'Compute this exactly. Answer with the value only, as an integer, a decimal or a fraction: (1/2 + 1/3) * 6';
const SEQ = 'Here are the first terms of an exact sequence: 2, 5, 8, 11, 14. What is the next term? Answer with the value only.';
const LINEAR = 'Solve for x, exactly. Answer with the value only, as an integer or a fraction: 3*x + 1 = 10';

// Two grid tasks where the second program starts with the first one: rotate, then rotate and recolour.
const line = (g) => G.toString(g).replace(/\n/g, '|');
const INS = [G.from([[1, 2, 0], [0, 3, 0]]), G.from([[0, 4, 5], [6, 0, 0]]), G.from([[7, 0, 1], [2, 2, 0]])];
const TEST = G.from([[3, 0, 0], [1, 5, 2]]);
const MAP = { 0: 0, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8 };
const ROT = (g) => G.rotate(g, 1);
const ROT_MAP = (g) => G.colormap(G.rotate(g, 1), MAP);
const gridPrompt = (f) => 'Each line below is an input grid and its output grid, rows separated by | and every cell a single digit. '
  + 'One transformation makes every output from its input.\n' + INS.map((g) => line(g) + ' -> ' + line(f(g))).join('\n')
  + '\nApply that same transformation to this input: ' + line(TEST) + '\nAnswer with the output grid only, rows separated by |.';

// Every structure a removal renumbers still agrees with itself.
function assertIntact(brain) {
  brain.cells.forEach((c, i) => { assert.equal(c.idx, i, 'cells[' + i + '].idx'); assert.equal(brain.byId.get(c.id), c, 'byId ' + c.id); });
  assert.equal(brain.byId.size, brain.cells.length);
  const cx = brain.connectome;
  for (let e = 0; e < cx.n; e++) if (cx.flags[e] & ACTIVE) {
    assert.ok(cx.src[e] < brain.cells.length && cx.dst[e] < brain.cells.length, 'live edge ' + e + ' points past the roster');
    assert.equal(cx.find(cx.src[e], cx.dst[e], cx.srcPort[e], cx.dstPort[e]), e, 'live edge ' + e + ' is found under its own key');
  }
  for (const idx of brain.clock.eventCells) assert.ok(idx < brain.cells.length && brain.cells[idx].policy.period === 'event', 'clock holds ' + idx);
  for (const [, c] of brain.circuits) for (const i of c.cells) assert.equal(brain.cells[i].region + '/' + brain.cells[i].circuit, c.key);
  for (const [, r] of brain.regions) for (const i of r.cells) assert.equal(brain.cells[i].region, r.name);
  const errors = brain.stats.errors;
  brain.tick(5);
  assert.equal(brain.stats.errors, errors, 'five ticks after the change run clean');
}

test('detect reads the features and plan expresses the genes that serve them', () => {
  const c = plan(COMPARE);
  assert.ok(c.features.includes('number') && c.features.includes('algebra'));
  assert.deepEqual(c.circuits.map((x) => x.gene), ['cmp']);
  assert.deepEqual(plan(BINOP).circuits.map((x) => x.gene), ['arith', 'eval']);
  assert.deepEqual(plan(NESTED).circuits.map((x) => x.gene), ['eval']);
  assert.deepEqual(plan(SEQ).circuits.map((x) => x.gene), ['fit']);
  assert.deepEqual(plan(LINEAR).circuits.map((x) => x.gene), ['solve']);
  assert.deepEqual(plan(gridPrompt(ROT)).circuits.map((x) => x.gene), ['program']);
  // a literal zero divisor and a literal fractional exponent never reach a cell
  assert.deepEqual(plan('Compute this exactly: 5 / 0').circuits, []);
  assert.deepEqual(plan('Compute this exactly: 2 ^ (1/2)').circuits, []);
  const prose = plan('please write me a short poem about rivers and the sea');
  assert.deepEqual(prose.circuits, []);
  assert.deepEqual(prose.unserved, ['text']);
  const code = detect('function add(a, b) { return a + b; }');
  assert.equal(code.features.code, true);
  assert.ok(plan('function add(a, b) { return a + b; }').unserved.includes('code'));
});

test('a first ask grows two circuits, keeps the one that carried, and prunes the other through the gate', () => {
  const b = fresh('spawn.binop');
  const { answer, record } = spawnAsk(b, BINOP);
  assert.ok(answer, record.declined);
  assert.equal(answer.exact.answer, '42');
  assert.equal(answer.route, 'spawn');
  assert.equal(answer.provenance.answer, 'exact');
  assert.equal(record.cellsBefore, 0);
  assert.equal(record.cellsSpawned, 2);
  assert.equal(record.carried, 'arith');
  assert.equal(record.cellsPruned, 1);
  assert.equal(record.cellsKept, 1);
  assert.ok(b.byId.has('spawn.arith.*') && !b.byId.has('spawn.eval'));
  assert.deepEqual(record.proposals.map((p) => p.kind + ' ' + p.status), ['cell.add approved', 'cell.remove approved']);
  assert.equal(b.ledger.counts.get('cell.remove'), 1);
  assert.equal(regionCells(b), 1);
  assertIntact(b);

  const again = spawnAsk(b, BINOP);
  assert.equal(again.answer.exact.answer, '42');
  assert.equal(again.record.cellsSpawned, 0, 'the identical second ask grows nothing');
  assert.equal(again.record.carried, 'arith');
  assert.equal(again.record.proposals.length, 0, 'an incumbent runs with no proposal at all');
  assert.equal(lastSpawn(b), again.record);
});

test('a grid program that starts with a kept one grows only its suffix', () => {
  const b = fresh('spawn.grid');
  const a = spawnAsk(b, gridPrompt(ROT));
  assert.equal(a.answer.exact.answer, line(ROT(TEST)));
  assert.equal(a.record.cellsSpawned, 2); // rotate1 and its read head
  const c = spawnAsk(b, gridPrompt(ROT_MAP));
  assert.equal(c.answer.exact.answer, line(ROT_MAP(TEST)));
  assert.equal(c.record.cellsSpawned, 2, 'the colormap and its read head, not the rotate');
  assert.equal(c.record.reused, 1);
  assert.equal(c.record.edgesKept, 2);
  assert.deepEqual(roster(b).circuits.grid.length, 4);
  // both programs are still answered, each by its own read head, with nothing grown
  assert.equal(spawnAsk(b, gridPrompt(ROT)).record.cellsSpawned, 0);
  assert.equal(spawnAsk(b, gridPrompt(ROT)).answer.exact.answer, line(ROT(TEST)));
  assert.equal(spawnAsk(b, gridPrompt(ROT_MAP)).answer.exact.answer, line(ROT_MAP(TEST)));
  assertIntact(b);
});

test('removal renumbers the cells behind it and the moved circuit still answers', () => {
  const b = fresh('spawn.compact');
  b.addCell({ id: 'base.tap', kind: 'task.tap', region: 'base', circuit: 'base', policy: { period: 'event' } });
  const cmp = plan(COMPARE).circuits[0], chain = plan(gridPrompt(ROT_MAP)).circuits[0];
  const g = grow(b, [cmp, chain]);
  assert.equal(g.status, 'approved');
  assert.equal(b.byId.get('spawn.cmp').idx, 1);
  const tapId = chain.exit;
  assert.equal(b.byId.get(tapId).idx, 4);
  const r = retract(b, ['spawn.cmp'], { evidence: { testsPassed: true } });
  assert.equal(r.status, 'approved');
  assert.equal(b.byId.get('base.tap').idx, 0, 'a cell ahead of the removal keeps its address');
  assert.equal(b.byId.get(tapId).idx, 3, 'the read head moved down one');
  assert.ok(holds(b, chain), 'every edge of the moved chain is found under its new addresses');
  assertIntact(b);
  const again = spawnAsk(b, gridPrompt(ROT_MAP));
  assert.equal(again.record.cellsSpawned, 0);
  assert.equal(again.answer.exact.answer, line(ROT_MAP(TEST)));
});

test('removal refuses to renumber a cell spawn did not grow', () => {
  const b = fresh('spawn.refuse');
  assert.ok(spawnAsk(b, SEQ).answer);
  b.addCell({ id: 'other.tap', kind: 'task.tap', region: 'other', circuit: 'other', policy: { period: 'event' } });
  const r = retract(b, ['spawn.fit'], { evidence: { testsPassed: true } });
  assert.equal(r.status, 'refused');
  assert.match(r.reason, /other\.tap/);
  assert.ok(b.byId.has('spawn.fit'));
  assertIntact(b);
});

test('a gate that holds cell.add holds every spawn, and the ask falls through to the direct route', async () => {
  const b = fresh('spawn.held');
  b.gate.humanRequired.add('cell.add');
  const { answer, record } = spawnAsk(b, COMPARE);
  assert.equal(answer, null);
  assert.match(record.declined, /held/);
  assert.equal(b.cells.length, 0);
  assert.equal(b.gate.pending.size, 1);
  const a = await ask(b, COMPARE, { provider: 'null', spawn: true });
  assert.equal(a.route, 'direct');
  assert.equal(a.exact.answer, '-1');
  assert.equal(b.cells.length, 0, 'nothing was grown around the gate');
});

test('the ask hook spawns when asked, when the region exists, and never when told not to', async () => {
  const b = fresh('spawn.hook');
  assert.equal(spawnWanted(b, {}), false);
  assert.equal((await ask(b, COMPARE, { provider: 'null' })).route, 'direct');
  assert.equal(b.regions.has(SPAWN_REGION), false, 'a bare brain is not grown under by a question');
  const on = await ask(b, COMPARE, { provider: 'null', spawn: true });
  assert.equal(on.route, 'spawn');
  assert.equal(on.exact.answer, '-1');
  assert.equal((await ask(b, SEQ, { provider: 'null' })).route, 'spawn', 'a brain with a spawn region keeps spawning');
  assert.equal((await ask(b, SEQ, { provider: 'null', spawn: false })).route, 'direct');
  assert.equal(askBySpawn(null, COMPARE, { spawn: true }), null);
});

test('keptCells 0 answers and keeps nothing', () => {
  const b = fresh('spawn.cap');
  const { answer, record } = spawnAsk(b, NESTED, { keptCells: 0 });
  assert.equal(answer.exact.answer, '5');
  assert.equal(record.cellsSpawned, 1);
  assert.equal(record.cellsKept, 0);
  assert.equal(b.cells.length, 0);
  assertIntact(b);
});

test('a question no gene serves declines and names what is missing', () => {
  const b = fresh('spawn.prose');
  const { answer, record } = spawnAsk(b, 'please write me a short poem about rivers and the sea');
  assert.equal(answer, null);
  assert.match(record.declined, /no gene serves text/);
  assert.equal(b.cells.length, 0);
});

test('the bench runs end to end at one task per suite without writing a verdict', async () => {
  const v = await runBench({ tasks: 1, write: false, quiet: true });
  assert.equal(v.completed, true);
  assert.equal(v.isTheBar, false);
  assert.equal(v.onNotBelowOff, true);
  assert.ok(v.reuse.run2Spawned < v.reuse.run1Spawned);
  assert.equal(v.file, undefined);
});
