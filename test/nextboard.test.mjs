// test/nextboard.test.mjs: self/nextboard.mjs on planted trees. Author: board 15 builder.
// No Ollama, no socket, never the real tree: every test plants a root under the OS temp dir and
// deletes it. The ledger refresh runs the real self/gaps.mjs writeBoardItems against that root.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  scoreLines, rankRows, selectRows, highestBoard, proposeNextBoard, buildBoard, numericDistance, keyOf, assignWaves, scriptsOf, decisionsAgainst,
} from '../self/nextboard.mjs';
import { parseProposedBoard, scanBoards, barOf } from '../self/boards.mjs';

const EM = String.fromCharCode(0x2014);
const DAY1 = new Date('2026-10-01T05:00:00.000Z');
const DAY1_LATER = new Date('2026-10-01T09:00:00.000Z');
const DAY2 = new Date('2026-10-02T05:00:00.000Z');

function put(root, rel, text) { const f = path.join(root, ...rel.split('/')); mkdirSync(path.dirname(f), { recursive: true }); writeFileSync(f, text); }
const trial = (bench, minutes, extra = '') => ({ key: bench, command: 'node tools/budget.mjs --ram-mb 6000 --disk-mb 100 --dir <tmp> -- node ' + bench + extra, minutes, needsModel: false, where: 'tree', bench });

/** A planted ledger: numbers chosen so the scores are known by hand. */
function ledger() {
  return [
    // score 1 / 1 = 1
    { id: 'missed:alpha.json', kind: 'missed', subsystem: 'unmapped', measured: 0, bar: 1, unit: 'share', distance: 1, verdictFile: 'bench/verdicts/alpha.json', benchCommand: 'node bench/alpha.mjs', trial: trial('bench/alpha.mjs', 1), files: ['lib/alpha.mjs'], since: '2026-09-30T00:00:00.000Z', better: 'higher', why: 'alpha is short ' + EM + ' by its whole BAR' },
    // |-30000| / 15000 capped at 1, over 2 min = 0.5
    { id: 'gate-slow:test/beta.test.mjs', kind: 'gate slow', subsystem: 'unmapped', measured: 45000, bar: 15000, unit: 'ms', distance: -30000, verdictFile: 'bench/verdicts/gate.json', benchCommand: 'node bench/gate.mjs', trial: trial('test/beta.test.mjs', 2), files: [], since: null, better: 'lower', why: 'slow' },
    // 0.25 / 5 over 1 min = 0.05
    { id: 'ladder:gamma', kind: 'ladder', subsystem: 'unmapped', measured: 4.75, bar: 5, unit: 'x', distance: 0.25, verdictFile: 'bench/verdicts/ladder.json', benchCommand: 'node bench/ladder.mjs', trial: trial('bench/gamma.mjs', 1), files: ['lib/gamma.mjs'], since: null, better: 'higher', why: 'gamma' },
    // 1 / 5 over 1 min = 0.2; the same trial command as gamma: gamma is folded into it
    { id: 'ladder:gamma-twin', kind: 'ladder', subsystem: 'unmapped', measured: 4, bar: 5, unit: 'x', distance: 1, verdictFile: 'bench/verdicts/ladder.json', benchCommand: 'node bench/ladder.mjs', trial: trial('bench/gamma.mjs', 1), files: [], since: null, better: 'higher', why: 'twin' },
    // 0.5 / 1 over 4 min = 0.125
    { id: 'dead:organism/seed-a', kind: 'dead share', subsystem: 'unmapped', measured: 0.5, bar: 0, unit: 'share', distance: -0.5, verdictFile: 'bench/verdicts/census.json', benchCommand: 'node tools/census.mjs', trial: trial('bench/census.mjs', 4, ' --seed organism/seed-a'), files: ['organism/seed-a'], since: null, better: 'lower', why: 'dead' },
    // 0.2 / 1 over 4 min = 0.05
    { id: 'dead:organism/seed-b', kind: 'dead share', subsystem: 'unmapped', measured: 0.2, bar: 0, unit: 'share', distance: -0.2, verdictFile: 'bench/verdicts/census.json', benchCommand: 'node tools/census.mjs', trial: trial('bench/census.mjs', 4, ' --seed organism/seed-b'), files: ['organism/seed-b'], since: null, better: 'lower', why: 'dead b' },
    // 1 / 1 = 1 but its trial script does not exist: excluded
    { id: 'missed:ghost.json', kind: 'missed', subsystem: 'unmapped', measured: 0, bar: 1, unit: 'share', distance: 1, verdictFile: 'bench/verdicts/ghost.json', benchCommand: null, trial: trial('bench/ghost.mjs', 1), files: [], since: null, better: 'higher', why: 'ghost' },
    // no verdict file: excluded
    { id: 'open:notes/x.md#1', kind: 'open', subsystem: 'unmapped', measured: null, bar: null, unit: null, distance: null, verdictFile: null, benchCommand: null, trial: null, files: [], since: null, better: null, why: 'an open line' },
    // a board item: no number, the numeric line on the same verdict (alpha.json, distance 1) gives 1; over 60 = 0.016667
    { id: 'board-3:delta', kind: 'board item', board: 3, key: 'delta', owns: 'lib/delta.mjs (new), test/delta.test.mjs (new), bench/verdicts/alpha.json', brief: 'ITEM delta. BUILD lib/delta.mjs. BAR (bench/verdicts/alpha.json): node bench/alpha.mjs writes it.\n## item not-a-heading\nTests: test/delta.test.mjs.', verdictFile: 'bench/verdicts/alpha.json', bar: 'BAR (bench/verdicts/alpha.json): node bench/alpha.mjs writes it.', trial: 'node bench/alpha.mjs', needsModel: false, minutes: 60, files: ['lib/delta.mjs', 'test/delta.test.mjs', 'bench/verdicts/alpha.json'], source: 'docs/boards/board-3.js', state: 'absent', reason: 'bench/verdicts/alpha.json does not exist' },
    // a board item of a proposed board: never proposed again
    { id: 'board-9:old', kind: 'board item', board: 9, key: 'old', owns: 'lib/old.mjs', brief: 'BAR (bench/verdicts/old.json): node bench/alpha.mjs', verdictFile: 'bench/verdicts/old.json', trial: 'node bench/alpha.mjs', needsModel: false, minutes: 60, files: ['lib/old.mjs'], source: 'docs/boards/proposed/board-9.md', state: 'absent', reason: 'x' },
  ];
}
const PROMOTED = { id: 'promoted:spread:lmax:run1', kind: 'promoted from simulation', subsystem: 'generations', measured: 10, bar: 12, unit: 'objective (simulated)', distance: 2, verdictFile: 'bench/verdicts/spread.json', benchCommand: 'node bench/spread.mjs', trial: { key: 'spread-trial', command: 'node tools/budget.mjs --ram-mb 6000 --disk-mb 64 --dir <copy> -- node --max-old-space-size=6000 bench/spread.mjs --trial --cache <copy>/tmp/spread-mx', minutes: 2, needsModel: false, where: 'copy', bench: 'bench/spread.mjs' }, files: ['generations/spread.mjs'], since: null, better: 'higher', why: 'promoted from simulation: lmax 32 -> 40', author: 'organism (knob-tune)' };

const BOARD3 = "const MARKER = 'C:\\\\nowhere\\\\state\\\\board3.marker'\nconst ITEMS = [\n  { key: 'delta', owns: 'lib/delta.mjs (new), test/delta.test.mjs (new), bench/verdicts/alpha.json', task: 'ITEM delta. BUILD lib/delta.mjs. BAR (bench/verdicts/alpha.json): node bench/alpha.mjs writes it. Tests: test/delta.test.mjs.' },\n]\n";

/** A planted tree: the scripts the trials name, boards 3 and 4b, BOARDS.json naming 5, the ledger. */
function plant({ lines = ledger(), promoted = [] } = {}) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'brain-nextboard-test-'));
  for (const f of ['tools/budget.mjs', 'bench/alpha.mjs', 'test/beta.test.mjs', 'bench/gamma.mjs', 'bench/census.mjs', 'bench/spread.mjs']) put(root, f, '// planted\n');
  put(root, 'lib/alpha.mjs', 'export const a = 1;\n');
  put(root, 'test/alpha.test.mjs', "import { a } from '../lib/alpha.mjs';\n");
  put(root, 'docs/boards/board-3.js', BOARD3);
  put(root, 'docs/boards/board-4b.js', '// not parsed by the boards reader, still a number on disk\n');
  put(root, 'docs/BOARDS.json', JSON.stringify([{ board: 2 }, { board: 5 }]));
  put(root, 'state/self/gaps.jsonl', lines.map((l) => JSON.stringify(l)).join('\n') + '\n');
  if (promoted.length) put(root, 'state/self/spread-promoted.jsonl', promoted.map((l) => JSON.stringify(l)).join('\n') + '\n');
  return root;
}
const clean = (root) => { rmSync(root, { recursive: true, force: true }); assert.equal(existsSync(root), false); };

test('the ranking: distance to the bar over trial minutes, the ineligible lines excluded with a reason', () => {
  const root = plant();
  try {
    const rows = scoreLines(ledger(), { root });
    const by = Object.fromEntries(rows.map((r) => [r.id, r]));
    assert.equal(by['missed:alpha.json'].score, 1);
    assert.equal(by['gate-slow:test/beta.test.mjs'].score, 0.5);
    assert.equal(by['gate-slow:test/beta.test.mjs'].distance, 1, 'capped at 1');
    assert.equal(by['dead:organism/seed-a'].score, 0.125);
    assert.equal(by['ladder:gamma'].score, 0.05);
    assert.equal(by['ladder:gamma-twin'].score, 0.2);
    assert.equal(by['board-3:delta'].distance, 1);
    assert.match(by['board-3:delta'].distanceFrom, /missed:alpha\.json/);
    assert.equal(by['board-3:delta'].score, 0.016667);
    assert.equal(by['missed:ghost.json'].eligible, false);
    assert.match(by['missed:ghost.json'].why, /bench\/ghost\.mjs/);
    assert.equal(by['open:notes/x.md#1'].eligible, false);
    assert.match(by['open:notes/x.md#1'].why, /no verdict file/);
    assert.equal(by['board-9:old'].eligible, false);
    assert.match(by['board-9:old'].why, /proposed board/);
    const ranked = rankRows(rows).map((r) => r.id);
    assert.deepEqual(ranked.slice(0, 4), ['missed:alpha.json', 'gate-slow:test/beta.test.mjs', 'ladder:gamma-twin', 'dead:organism/seed-a']);
    // 0.05 twice, one file each: the tie goes by id
    assert.deepEqual(ranked.slice(4, 6), ['dead:organism/seed-b', 'ladder:gamma']);
    assert.equal(ranked[ranked.length - 1], 'board-3:delta');
    assert.equal(numericDistance({ measured: 3, bar: 0, distance: -3 }), 1);
    assert.equal(numericDistance({ measured: null, bar: null, distance: null }), null);
    assert.deepEqual(scriptsOf('node tools/budget.mjs --dir {tmp} -- node --test test/x.test.mjs --seed organism/a'), ['tools/budget.mjs', 'test/x.test.mjs']);
  } finally { clean(root); }
});

test('the selection: the best of each kind first, a shared trial folded, the pure rank on request', () => {
  const root = plant();
  try {
    const ranked = rankRows(scoreLines(ledger(), { root }));
    const s = selectRows(ranked, { min: 5, max: 8, perKind: 3 });
    const ids = s.picked.map((r) => r.id);
    assert.deepEqual(ids.slice(0, 5), ['missed:alpha.json', 'gate-slow:test/beta.test.mjs', 'ladder:gamma-twin', 'dead:organism/seed-a', 'board-3:delta']);
    assert.ok(!ids.includes('ladder:gamma'), 'the same trial command as gamma-twin');
    assert.deepEqual(s.also['ladder:gamma-twin'], ['ladder:gamma']);
    assert.ok(ids.includes('dead:organism/seed-b'));
    const p = selectRows(ranked, { max: 3, pure: true });
    assert.deepEqual(p.picked.map((r) => r.id), ['missed:alpha.json', 'gate-slow:test/beta.test.mjs', 'ladder:gamma-twin']);
    const w = assignWaves([{ files: ['a'], ollama: false }, { files: ['a'], ollama: false }, { files: [], ollama: true }, { files: [], ollama: true }]);
    assert.deepEqual(w.map((x) => x.wave), [1, 2, 1, 2]);
    assert.equal(keyOf('gate-slow:test/beta.test.mjs'), 'gate-slow-test-beta-test-mjs');
  } finally { clean(root); }
});

test('N comes from the files on disk: scripts (4b counts as 4), BOARDS.json, proposed files', () => {
  const root = plant();
  try {
    assert.equal(highestBoard(root).max, 5);
    assert.deepEqual(highestBoard(root).from, ['docs/BOARDS.json']);
    put(root, 'docs/boards/proposed/board-11.md', '# Board 11 (proposed)\n');
    assert.equal(highestBoard(root).max, 11);
    rmSync(path.join(root, 'docs', 'boards', 'proposed', 'board-11.md'));
    put(root, 'docs/boards/board-7b.js', '//\n');
    assert.equal(highestBoard(root).max, 7);
  } finally { clean(root); }
});

test('the proposed file round-trips through self/boards.mjs and the loop reads it as undone board items', async () => {
  const root = plant({ promoted: [PROMOTED] });
  try {
    const r = await proposeNextBoard({ root, now: DAY1 });
    assert.equal(r.refused, null, String(r.refused));
    assert.equal(r.wrote, true);
    assert.equal(r.rel, 'docs/boards/proposed/board-6.md');
    assert.ok(r.items.length >= 5, 'items ' + r.items.length);
    assert.ok(r.items.some((x) => x.gap === PROMOTED.id), 'the promoted line is ranked and taken');
    const text = readFileSync(path.join(root, ...r.rel.split('/')), 'utf8');
    assert.equal(text.includes(EM), false, 'no em-dash in the board');
    const p = parseProposedBoard(text, { file: r.rel });
    assert.equal(p.ok, true, JSON.stringify(p.errors));
    assert.equal(p.board, 6);
    assert.equal(p.header.author, 'organism (nextboard)');
    assert.equal(p.items.length, r.items.length);
    r.items.forEach((it, i) => {
      assert.equal(p.items[i].key, it.key);
      assert.equal(p.items[i].task, it.task);
      assert.equal(p.items[i].owns, it.owns);
      const bar = barOf(p.items[i].task, p.items[i].owns);
      assert.equal(bar.verdictFile, it.verdictFile, it.key + ' verdict');
      if (it.trial) assert.equal(bar.trial, it.trial, it.key + ' trial');
    });
    // the board item's own brief is quoted whole, its heading-like line escaped and read back
    const delta = r.items.find((x) => x.gap === 'board-3:delta');
    assert.ok(delta && delta.task.includes('\n## item not-a-heading'));
    // the scan and the refreshed ledger hold every proposed item as an undone board item
    const s = scanBoards({ root });
    const pb = s.boards.find((b) => b.file === r.rel);
    assert.equal(pb.items.length, r.items.length);
    assert.equal(pb.items.filter((x) => !x.done).length, r.items.length);
    assert.equal(r.refresh.ok, true, r.refresh.how);
    const led = readFileSync(path.join(root, 'state', 'self', 'gaps.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
    const mine = led.filter((l) => l.kind === 'board item' && l.source === r.rel).map((l) => l.id).sort();
    assert.deepEqual(mine, r.items.map((x) => 'board-6:' + x.key).sort());
    assert.ok(led.some((l) => l.id === 'missed:alpha.json'), 'every other line kept');
  } finally { clean(root); }
});

test('a board with decisions is never overwritten; one without is rewritten the same day; a new day takes N + 1 and the next gaps', async () => {
  const root = plant();
  try {
    const a = await proposeNextBoard({ root, now: DAY1, refresh: true });
    assert.equal(a.rel, 'docs/boards/proposed/board-6.md');
    const b = await proposeNextBoard({ root, now: DAY1_LATER, refresh: true });
    assert.equal(b.rel, a.rel, 'the same day, no decision: rewritten');
    assert.equal(b.mode, 'rewrite');
    assert.equal(readdirSync(path.join(root, 'docs', 'boards', 'proposed')).length, 1);
    // a decision line against one item of board 6
    const key = a.items[0].key;
    put(root, 'bench/verdicts/autopilot/2026-10-01.jsonl', JSON.stringify({ kind: 'board item', key: 'boards:board-6:' + key, gap: 'board-6:' + key, source: 'boards', decision: 'refused' }) + '\n');
    assert.equal(decisionsAgainst(root, 6, [key]).count, 1);
    const before = readFileSync(path.join(root, ...a.rel.split('/')), 'utf8');
    const c = await proposeNextBoard({ root, now: DAY1_LATER, refresh: true });
    assert.equal(c.rel, 'docs/boards/proposed/board-7.md', 'a file with decisions is never overwritten');
    assert.equal(readFileSync(path.join(root, ...a.rel.split('/')), 'utf8'), before);
    // board 6's undone items keep their gaps: board 7 takes different ones
    const g6 = new Set(a.items.map((x) => x.gap));
    for (const it of c.items) assert.equal(g6.has(it.gap), false, it.gap + ' is already an undone item of board 6');
    // the next day, a new file
    const d = await proposeNextBoard({ root, now: DAY2, refresh: true, dry: true });
    assert.equal(d.rel, 'docs/boards/proposed/board-8.md');
    assert.equal(d.mode, 'new');
  } finally { clean(root); }
});

test('a dry run writes nothing, and fewer than 5 eligible gaps is printed as measured', async () => {
  const lines = ledger().filter((l) => ['missed:alpha.json', 'open:notes/x.md#1'].includes(l.id));
  const root = plant({ lines });
  try {
    const r = await buildBoard({ root, now: DAY1 });
    assert.equal(r.items.length, 1);
    assert.equal(r.ranked.length, 1);
    const w = await proposeNextBoard({ root, now: DAY1, dry: true });
    assert.equal(w.wrote, false);
    assert.equal(existsSync(path.join(root, 'docs', 'boards', 'proposed')), false);
  } finally { clean(root); }
});
