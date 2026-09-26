// test/boards.test.mjs: the boards reader, the board-item ledger lines and the boards source.
// Author: board 15 builder. No model, temp directories only, nothing under the real tree written.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  parseBoardScript, parseProposedBoard, renderProposedBoard, scanBoards, boardItemLines, barOf, ownedFiles,
  needsModelOf, renderScan, BOARD_ITEM_KIND, GAP_MINUTES,
} from '../self/boards.mjs';
import { writeLedger, readLedger, writeBoardItems, KINDS } from '../self/gaps.mjs';
import { collectCandidates, runAutopilot, gapQueue, probeBrief, BOARDS_SOURCE, BRIEF_NOT_LANDED } from '../self/autopilot.mjs';
import { plantBoards, plantBrief, board90Source, ALPHA_TASK, BETA_TASK, GAMMA_TASK, GAMMA_SOURCE } from './boards-plant.mjs';

const temps = [];
const tmp = (tag) => { const d = mkdtempSync(path.join(tmpdir(), 'brain-boards-' + tag + '-')); temps.push(d); return d; };
test.after(() => { for (const d of temps) rmSync(d, { recursive: true, force: true }); });
const planted = (tag, o) => plantBoards(tmp(tag), o);
const REQUIRED = ['id', 'kind', 'board', 'key', 'owns', 'brief', 'verdictFile', 'bar', 'trial', 'needsModel', 'minutes', 'files'];

test('the parser yields the planted keys, owns, waves and task text without running the script', () => {
  const root = tmp('parse');
  const p = parseBoardScript(board90Source(root), { file: 'board-90.js' });
  assert.equal(p.ok, true, JSON.stringify(p.errors));
  assert.deepEqual(p.items.map((x) => x.key), ['alpha', 'beta', 'gamma']);
  assert.deepEqual(p.items.map((x) => x.wave), [1, 1, 2]);
  assert.deepEqual(p.items.map((x) => x.ollama), [false, false, true]);
  assert.equal(p.items[0].model, 'MODEL_BUILD', 'an identifier is kept as its name, never evaluated');
  assert.equal(p.items[0].task, ALPHA_TASK, 'a single-quoted task decodes its escaped quote');
  assert.equal(p.items[1].task, BETA_TASK, 'a template literal decodes its escaped backticks and keeps ${...} as text');
  assert.ok(p.items[1].task.includes('`node bench/beta.mjs --seed 3`') && p.items[1].task.includes('${notEvaluated}'));
  assert.equal(p.items[2].task, GAMMA_TASK);
  assert.match(p.items[2].owns, /^lib\/gamma\.mjs \(the gamma function only, nothing else\)/);
  assert.equal(p.marker.endsWith('board90.marker'), true);
  assert.equal(p.name, 'board-90-planted');
  // the real grammar's other containers: a ROWS_ITEM object literal is read as one item of stage rows
  const rows = parseBoardScript("const ITEMS = []\nconst ROWS_ITEM = { key: 'rows', owns: 'bench/ladder.mjs', task: `BAR (bench/verdicts/rows.json): node bench/ladder.mjs prints.` }\n");
  assert.deepEqual([rows.ok, rows.items.length, rows.items[0].key, rows.items[0].wave], [true, 1, 'rows', 'rows']);
  // owned files, the BAR and needsModel
  assert.deepEqual(ownedFiles(p.items[2].owns), ['lib/gamma.mjs', 'bench/verdicts/gamma.json']);
  const b = barOf(p.items[1].task, p.items[1].owns);
  assert.deepEqual([b.verdictFile, b.trial], ['bench/verdicts/beta.json', 'node bench/beta.mjs --seed 3'], 'the trial is the BAR\'s node line, not the one quoted in prose before it');
  assert.equal(barOf(p.items[0].task).trial, 'node bench/alpha.mjs --fast', 'a prose word after a flag is not its value');
  assert.equal(barOf(p.items[2].task).trial, null, 'no runnable line, no trial');
  assert.deepEqual([needsModelOf(p.items[2]).needsModel, needsModelOf({ task: 'MODEL OFF: never the model' }).needsModel, needsModelOf({ task: 'the model cell' }).needsModel], [true, false, true]);
});

test('done and undone are decided from the planted verdict files, and flip when a file changes', () => {
  const root = planted('decide');
  const s = scanBoards({ root });
  const b90 = s.boards.find((b) => b.board === 90);
  assert.equal(b90.launched, true);
  const by = Object.fromEntries(b90.items.map((x) => [x.key, x]));
  assert.deepEqual([by.alpha.done, by.alpha.state], [true, 'done']);
  assert.deepEqual([by.beta.done, by.beta.state], [false, 'missed']);
  assert.match(by.beta.reason, /beta\.json says barMet false \(and bench\/verdicts\/beta-partial\.json exists\)/);
  assert.deepEqual([by.gamma.done, by.gamma.state, by.gamma.bar.verdictFile], [false, 'absent', 'bench/verdicts/gamma.json']);
  assert.deepEqual([b90.done, b90.undone], [1, 2]);
  // control: the same scan after alpha's verdict turns false, beta's full verdict is removed, gamma's
  // verdict is met but dated before the marker, and a file with no isTheBar says barMet true
  const vd = path.join(root, 'bench', 'verdicts');
  writeFileSync(path.join(vd, 'alpha.json'), JSON.stringify({ at: new Date().toISOString(), isTheBar: true, barMet: false }));
  rmSync(path.join(vd, 'beta.json'));
  writeFileSync(path.join(vd, 'gamma.json'), JSON.stringify({ at: '2020-01-01T00:00:00.000Z', isTheBar: true, barMet: true }));
  const t = scanBoards({ root }).boards.find((b) => b.board === 90);
  const by2 = Object.fromEntries(t.items.map((x) => [x.key, x.state]));
  assert.deepEqual(by2, { alpha: 'missed', beta: 'partial-only', gamma: 'stale' });
  writeFileSync(path.join(vd, 'gamma.json'), JSON.stringify({ at: new Date().toISOString(), barMet: true }));
  assert.equal(scanBoards({ root }).boards.find((b) => b.board === 90).items.find((x) => x.key === 'gamma').state, 'not-the-bar');
  writeFileSync(path.join(vd, 'gamma.json'), JSON.stringify({ at: new Date().toISOString(), verdict: 'MET: planted' }));
  assert.equal(scanBoards({ root }).boards.find((b) => b.board === 90).items.find((x) => x.key === 'gamma').state, 'done', 'an older file with a MET verdict word is done');
  // a board whose marker is absent was never launched, and says so in every undone reason
  rmSync(path.join(root, 'state', 'board90.marker'));
  const n = scanBoards({ root }).boards.find((b) => b.board === 90);
  assert.equal(n.launched, false);
  assert.ok(n.items.filter((x) => !x.done).every((x) => /never launched/.test(x.reason)));
});

test('a script that does not parse is reported by name, never skipped silently', () => {
  const root = planted('broken');
  const s = scanBoards({ root });
  const bad = s.errors.filter((e) => e.file === 'docs/boards/board-91.js');
  assert.equal(bad.length, 1, JSON.stringify(s.errors));
  assert.match(bad[0].reason, /unterminated template literal at line \d+/);
  assert.equal(bad[0].container, 'ITEMS');
  const b91 = s.boards.find((b) => b.board === 91);
  assert.deepEqual([b91.ok, b91.items.length], [false, 0]);
  assert.match(renderScan(s), /board 91 .*PARSE ERRORS 1[\s\S]*DOES NOT PARSE ITEMS line \d+: an unterminated template literal/);
  const none = parseBoardScript('export const meta = { name: "x" }\n', { file: 'board-92.js' });
  assert.deepEqual([none.ok, none.errors[0].reason], [false, 'no top-level const ITEMS array or *_ITEM object']);
  const notObj = parseBoardScript("const ITEMS = [ makeItem('a') ]\n");
  assert.equal(notObj.ok, false);
  assert.match(notObj.errors[0].reason, /is not an object literal/);
});

test('the ledger lines carry the required fields, smallest owned set first, through the gaps writer', () => {
  const root = planted('ledger');
  const { lines } = boardItemLines({ root });
  assert.deepEqual(lines.map((l) => l.id), ['board-90:gamma', 'board-90:beta'], 'gamma owns 2 files, beta 5');
  for (const l of lines) for (const f of REQUIRED) assert.ok(f in l, l.id + ' carries ' + f);
  const beta = lines.find((l) => l.key === 'beta');
  assert.deepEqual([beta.kind, beta.board, beta.brief, beta.verdictFile, beta.trial, beta.needsModel, beta.minutes], [BOARD_ITEM_KIND, 90, BETA_TASK, 'bench/verdicts/beta.json', 'node bench/beta.mjs --seed 3', false, GAP_MINUTES]);
  assert.match(beta.bar, /^BAR \(bench\/verdicts\/beta\.json[^]*beats null\.$/);
  assert.deepEqual(beta.files, ['lib/beta.mjs', 'bench/beta.mjs', 'test/beta.test.mjs', 'notes/beta.md', 'bench/verdicts/beta.json']);
  const gamma = lines.find((l) => l.key === 'gamma');
  assert.deepEqual([gamma.trial, gamma.needsModel, gamma.wave, gamma.state], [null, true, 2, 'absent']);
  assert.ok(KINDS.includes(BOARD_ITEM_KIND));
  // the writer: other kinds kept in order, a stale board-item line replaced by the fresh scan
  const w = writeLedger([{ id: 'a', kind: 'missed', trial: null }, { id: 'board-90:old', kind: BOARD_ITEM_KIND }, { id: 'b', kind: 'open' }], { root });
  assert.deepEqual([w.lines, w.boardItems.lines, w.boardItems.error], [4, 2, null]);
  const back = readLedger(root).lines;
  assert.deepEqual(back.map((l) => l.id), ['a', 'b', 'board-90:gamma', 'board-90:beta']);
  for (const f of REQUIRED) assert.ok(f in back[3], 'the written line carries ' + f);
  // writeBoardItems keeps the lines on disk and refreshes the board items
  writeFileSync(path.join(root, 'bench', 'verdicts', 'gamma.json'), JSON.stringify({ at: new Date().toISOString(), isTheBar: true, barMet: true }));
  const w2 = writeBoardItems({ root });
  assert.deepEqual([w2.boardItems.lines, readLedger(root).lines.map((l) => l.id)], [1, ['a', 'b', 'board-90:beta']]);
  // boards off: the lines are written as handed
  writeLedger([{ id: 'x', kind: BOARD_ITEM_KIND }], { root, boards: false });
  assert.deepEqual(readLedger(root).lines.map((l) => l.id), ['x']);
  // a board item never enters the soak's bounded gap queue
  assert.deepEqual(gapQueue([{ id: 'board-90:beta', kind: BOARD_ITEM_KIND, trial: 'node bench/beta.mjs' }]), []);
});

test('a proposed board round-trips through the renderer and the parser, and the scan reads it', () => {
  const root = planted('proposed', { broken: false });
  const md = renderProposedBoard({ board: 92, header: { at: '2026-09-25T00:00:00.000Z', ledger: 'state/self/gaps.jsonl' }, items: [
    { key: 'delta', wave: 1, ollama: false, owns: 'lib/delta.mjs (new), bench/verdicts/delta.json (new)', task: 'ITEM delta.\n## item fake\n ## item fake2\nBAR (bench/verdicts/delta.json): node bench/delta.mjs prints.\nTests: none.' },
    { key: 'epsilon', wave: 2, ollama: true, owns: 'lib/eps.mjs (new)', task: 'ITEM epsilon, with the model. BAR (bench/verdicts/eps.json): none.' },
  ] });
  const p = parseProposedBoard(md, { file: 'board-92.md' });
  assert.equal(p.ok, true, JSON.stringify(p.errors));
  assert.deepEqual([p.board, p.header.ledger, p.items.length, p.items[0].key, p.items[0].owns], [92, 'state/self/gaps.jsonl', 2, 'delta', 'lib/delta.mjs (new), bench/verdicts/delta.json (new)']);
  assert.equal(p.items[0].task, 'ITEM delta.\n## item fake\n ## item fake2\nBAR (bench/verdicts/delta.json): node bench/delta.mjs prints.\nTests: none.', 'a heading-shaped task line round-trips exactly');
  assert.deepEqual([p.items[1].key, p.items[1].wave, p.items[1].ollama], ['epsilon', 2, true]);
  mkdirSync(path.join(root, 'docs', 'boards', 'proposed'), { recursive: true });
  writeFileSync(path.join(root, 'docs', 'boards', 'proposed', 'board-92.md'), md);
  const s = scanBoards({ root });
  const b92 = s.boards.find((b) => b.kind === 'proposed');
  assert.deepEqual([b92.board, b92.items[0].id, b92.items[0].state, b92.items[0].bar.trial], [92, 'board-92:delta', 'absent', 'node bench/delta.mjs']);
  const broken = parseProposedBoard('# Board 93 (proposed)\n\n## item x\nwave: 1\nnot a field\n');
  assert.equal(broken.ok, false);
});

test('the boards source lists every board item with evidence brief, and refuses them while the brief operator is absent', () => {
  const root = planted('source', { broken: false });
  writeLedger([], { root });
  const col = collectCandidates({ root, run: false, sources: [BOARDS_SOURCE] });
  assert.deepEqual(col.candidates.map((c) => [c.key, c.source, c.evidence, c.files.length]), [['boards:board-90:gamma', 'boards', 'brief', 2], ['boards:board-90:beta', 'boards', 'brief', 5]]);
  assert.deepEqual([col.sources.boards.from, col.sources.boards.items, col.sources.boards.brief.landed], ['ledger', 2, false]);
  const dry = runAutopilot({ root, dry: true, sources: [BOARDS_SOURCE] });
  assert.deepEqual(dry.decisions.map((d) => [d.source, d.decision, d.wall]), [['boards', 'refused', 'brief'], ['boards', 'refused', 'brief']]);
  assert.ok(dry.decisions.every((d) => d.reason.startsWith(BRIEF_NOT_LANDED)));
  assert.deepEqual([dry.bySource.boards.candidates, dry.bySource.boards.refused], [2, 2]);
  assert.equal(existsSync(path.join(root, 'state', 'self-code')), false, 'a dry run writes nothing');
  // a landed brief: a dry run would hand the item over, a live run hands over one and records its refusal
  plantBrief(root, 'refuse');
  const d2 = runAutopilot({ root, dry: true, sources: [BOARDS_SOURCE] });
  assert.deepEqual(d2.decisions.map((d) => d.decision), ['would-brief', 'would-brief']);
  const live = runAutopilot({ root, sources: [BOARDS_SOURCE], gateCmd: 'node --test test/gamma.test.mjs' });
  assert.deepEqual(live.decisions.map((d) => [d.decision, d.wall]), [['refused', 'plan'], ['refused', 'budget']]);
  assert.match(live.decisions[0].reason, /the planted brief refuses board-90:gamma with 0 model calls/);
});

test('a kept brief goes through the gate: green keeps it, red reverts it byte for byte, a whole-file set is saved', () => {
  const root = planted('apply', { broken: false });
  writeLedger([], { root });
  plantBrief(root, 'keep');
  const gateCmd = 'node --test test/gamma.test.mjs';
  const kept = runAutopilot({ root, sources: [BOARDS_SOURCE], gateCmd });
  assert.equal(kept.decisions[0].decision, 'kept', JSON.stringify(kept.decisions[0]));
  assert.equal(kept.decisions[0].author, 'organism (brief)');
  assert.match(readFileSync(path.join(root, 'lib', 'gamma.mjs'), 'utf8'), /kept by the planted brief/);
  const authored = readFileSync(path.join(root, 'state', 'self', 'authored.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  assert.deepEqual([authored.length, authored[0].from, authored[0].author], [1, 'boards:board-90:gamma', 'organism (brief)']);
  writeFileSync(path.join(root, 'lib', 'gamma.mjs'), GAMMA_SOURCE);
  plantBrief(root, 'red');
  const red = runAutopilot({ root, sources: [BOARDS_SOURCE], gateCmd });
  assert.deepEqual([red.decisions[0].decision, red.decisions[0].wall], ['reverted', 'gate']);
  assert.equal(readFileSync(path.join(root, 'lib', 'gamma.mjs'), 'utf8'), GAMMA_SOURCE);
  plantBrief(root, 'whole');
  const whole = runAutopilot({ root, sources: [BOARDS_SOURCE], gateCmd });
  assert.deepEqual([whole.decisions[0].decision, whole.decisions[0].wall], ['refused', 'apply']);
  assert.equal(readdirSync(path.join(root, 'state', 'self', 'boards-kept')).length, 1);
  assert.equal(existsSync(path.join(root, 'lib', 'new.mjs')), false, 'a whole-file set is never written by this file');
  // the landed brief's own shape: patchSet {files, patch} of whole-file diffs
  plantBrief(root, 'setnew');
  const setnew = runAutopilot({ root, sources: [BOARDS_SOURCE], gateCmd });
  assert.deepEqual([setnew.decisions[0].decision, setnew.decisions[0].wall], ['refused', 'apply']);
  assert.match(setnew.decisions[0].reason, /creates 1 new file\(s\) \(lib\/fresh\.mjs\)/);
  assert.equal(existsSync(path.join(root, 'lib', 'fresh.mjs')), false);
  assert.equal(readFileSync(path.join(root, 'lib', 'gamma.mjs'), 'utf8'), GAMMA_SOURCE);
  plantBrief(root, 'set');
  const set = runAutopilot({ root, sources: [BOARDS_SOURCE], gateCmd });
  assert.equal(set.decisions[0].decision, 'kept', JSON.stringify(set.decisions[0]));
  assert.match(readFileSync(path.join(root, 'lib', 'gamma.mjs'), 'utf8'), /^\/\/ kept as a set\nexport function gamma/);
});

test('with no command in the BAR, an owned bench named after the verdict file is the trial; a prefix bench is only a hint', () => {
  const exact = barOf('ITEM d. BAR (bench/verdicts/delta.json, isTheBar true): print the count.', 'lib/delta.mjs (new), bench/delta.mjs (new), bench/verdicts/delta.json (new)');
  assert.deepEqual([exact.verdictFile, exact.trial, exact.trialBench], ['bench/verdicts/delta.json', 'node bench/delta.mjs', 'bench/delta.mjs']);
  assert.match(exact.trialFrom, /owned bench named after the verdict file/);
  const prefix = barOf('ITEM c. BAR (grid-clock.json for the curve): bar met when it beats 73.', 'bench/grid.mjs (the clock flag only), bench/verdicts/grid-clock.json (new)');
  assert.deepEqual([prefix.verdictFile, prefix.trial, prefix.trialHint], ['bench/verdicts/grid-clock.json', null, 'bench/grid.mjs']);
  const none = barOf('ITEM n. BAR (bench/verdicts/nothing.json): print it.', 'lib/nothing.mjs (new)');
  assert.deepEqual([none.trial, none.trialHint ?? null], [null, null]);
});

test('a brief that does not import is not landed, with the error line; a failed probe is retried, a landed one held', () => {
  const root = tmp('probe');
  mkdirSync(path.join(root, 'self'), { recursive: true });
  writeFileSync(path.join(root, 'self', 'brief.mjs'), "import { nothing } from './not-here.mjs';\nexport async function runBrief() { return nothing; }\n");
  const bad = probeBrief({ root, fresh: true });
  assert.equal(bad.landed, false);
  assert.match(bad.reason, /brief operator not landed: self\/brief\.mjs does not import \(.*(Cannot find module|ERR_MODULE_NOT_FOUND)/);
  assert.doesNotMatch(bad.reason, /\(Node\.js v/);
  writeFileSync(path.join(root, 'self', 'not-here.mjs'), 'export const nothing = 1;\n');
  const healed = probeBrief({ root }); // the dependency healed, brief.mjs unchanged: inside the retry window the failure is reused
  assert.equal(healed.landed, false, 'within the retry window the failed probe is reused');
  const again = probeBrief({ root, fresh: true });
  assert.deepEqual([again.landed, again.operator], [true, 'runBrief']);
  assert.equal(probeBrief({ root }).landed, true, 'a landed probe is held');
});
