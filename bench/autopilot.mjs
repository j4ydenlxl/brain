// bench/autopilot.mjs: THE BAR FOR SELF-CODE WITH NO HUMAN (self/autopilot.mjs).
//
// A copied tree is built in a temp dir holding the REAL gate program (bench/gate.mjs, copied
// byte for byte, so the gate that rules here is the gate that rules the brain) and planted
// source and tests. Since Boards 10 and 12 that program also reads tools/budget.mjs, the census
// of every seed under organism/ and bench/verdicts/boundary.json, and is RED without them whatever
// the tests do; each tree it rules here gets them from plantGateRows (test/autopilot-plant.mjs):
// the real tools/budget.mjs, one planted seed with a census naming its manifest hash, and a
// boundary verdict with no boundary (a planted tree starts no worker). Then:
//
//   stage 1  a planted failing test and a candidate patch that fixes it. The autopilot must
//            write it with no human, the gate must go from red to GREEN, and the patch must
//            be KEPT with its pre-patch bytes and both hashes snapshotted.
//   stage 2  a second planted failing test and a patch that passes that test but breaks
//            another one. Its evidence verifies, the gate goes RED on the other test, and the
//            patch must be REVERTED byte for byte (the file is CRLF, so a text round trip
//            would show), with both hashes and the restored hash logged. A patch aimed at a
//            test file rides along and must be refused at the ceiling without being run.
//   stage 3  the autopilot on the REAL tree through the CLI, `brain self-code --auto --dry
//            --json`: candidates are printed PER SOURCE (Board 10: gate, notes, imagine,
//            census, slow, mutants), the total must be above 0, and nothing may be written.
//
// Board 10 added (the first 13 checks are Board 8's, unchanged):
//
//   stage 4a ONE WET PASS through the CLI on a planted repository copy (the real gate program,
//            test/autopilot-plant.mjs plantWet): mind/imagine.mjs proposes a fix to a failing
//            clamp and a census verdict marks two edges of a planted seed dead. Both are
//            non-mutant sources; the model author is off, so every byte written came from the
//            organism's own sources. Each must be KEPT with the gate GREEN and appended to
//            state/self/authored.jsonl with its source, files and the gate hashes before and after.
//   stage 4b THE MODEL CELL: a planted failing mean and a note with an OPEN: line, the author on
//            (qwen3:30b-a3b through Ollama, or BRAIN_AUTHOR_MODEL and BRAIN_AUTHOR_BASE), at most
//            one model call. Patches proposed and kept per source and the model ms per patch are
//            printed. Whether the model's patch is kept is measured and reported, not assumed.
//            A Claude or Anthropic model is refused before any socket opens.
//   stage 5  the share arithmetic of tools/authorship.mjs over the wet copy's authored lines
//            and the real docs/BOARDS.json.
//
// Board 14 added (the first 21 checks are those of Boards 8 and 10, unchanged):
//
//   stage 6  THE SOAK on a planted tree (test/operators-plant.mjs, a fixture gate): state/self/STOP
//            refuses the soak with exit 0 before any lock, soak file or copy; one soak then takes
//            the planted gap from the gaps source through knob-tune on a copy (self/improve.mjs),
//            writes it to the tree behind the gate, appends "organism (knob-tune)" to
//            state/self/authored.jsonl, rebuilds the ledger and prints the gap CLOSED; its
//            MAGNITUDE line sets the organism rate beside orchestratorRate() (exported here, read
//            from docs/BOARDS.json and docs/LOG.md).
//
// Importing this file runs nothing (self/autopilot.mjs imports orchestratorRate for the soak);
// `node bench/autopilot.mjs` runs the bench.
//
// Writes bench/verdicts/autopilot.json (isTheBar true, barMet) once, when every stage ran; it
// OVERWRITES the Board 10 bar of the same name (copied first to autopilot-board10.json), and its
// statement says so. A run that throws
// writes autopilot-partial.json (isTheBar false) instead. Every child declares its heap.
import {
  mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync, cpSync, readdirSync, statSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runAutopilot, renderRun, hashBytes, SOURCE_ORDER, AUTHORED_REL, makeModelAuthor, runSoak, runFromCli } from '../self/autopilot.mjs';
import { computeShare, readBoards, fmtShare } from '../tools/authorship.mjs';
import { plantWet, plantModel, plantGateRows, SEED_EDGES } from '../test/autopilot-plant.mjs';
import { plantInto, plantGaps } from '../test/operators-plant.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const COMMAND = 'node bench/autopilot.mjs';
const VERDICT = path.join(HERE, 'verdicts', 'autopilot.json');
const HEAP = '--max-old-space-size=2048';
const t0 = Date.now();
const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

let TMP = null, TREE = null;
const put = (rel, text) => { const f = path.join(TREE, rel); mkdirSync(path.dirname(f), { recursive: true }); writeFileSync(f, text); };
const bytesOf = (rel) => readFileSync(path.join(TREE, rel));

const TEST_HEAD = "import test from 'node:test';\nimport assert from 'node:assert/strict';\n";
const SUM_BUGGY = 'export function add(a, b) { return a - b; }\n';
const SUM_TEST = TEST_HEAD + "import { add } from '../lib/sum.mjs';\ntest('add adds', () => { assert.equal(add(2, 3), 5); });\n";
const PATCH_A = [
  '--- a/lib/sum.mjs', '+++ b/lib/sum.mjs', '@@ -1 +1 @@',
  '-export function add(a, b) { return a - b; }',
  '+export function add(a, b) { return a + b; }', '',
].join('\n');
// CRLF on purpose: a revert through text would normalise it, a byte for byte revert will not
const SCALE = ['export const FACTOR = 5;', 'export function scale(x) { return x * FACTOR; }', 'export function area(x) { return x * FACTOR; }', ''].join('\r\n');
const AREA_TEST = TEST_HEAD + "import { area } from '../lib/scale.mjs';\ntest('area of 2 is 10', () => { assert.equal(area(2), 10); });\n";
const SCALE_TEST = TEST_HEAD + "import { scale } from '../lib/scale.mjs';\ntest('scale of 2 is 20', () => { assert.equal(scale(2), 20); });\n";
const PATCH_B = [
  '--- a/lib/scale.mjs', '+++ b/lib/scale.mjs', '@@ -1,2 +1,2 @@',
  '-export const FACTOR = 5;',
  '+export const FACTOR = 10;',
  ' export function scale(x) { return x * FACTOR; }', '',
].join('\n');
const PATCH_C = [
  '--- a/test/area.test.mjs', '+++ b/test/area.test.mjs', '@@ -4 +4 @@',
  "-test('area of 2 is 10', () => { assert.equal(area(2), 10); });",
  "+test('area of 2 is 10', () => { assert.ok(true); });", '',
].join('\n');

const checks = [];
const check = (name, pass, detail) => { checks.push({ name, pass: !!pass, detail }); console.log((pass ? 'PASS ' : 'FAIL ') + name + (detail ? '  ' + detail : '')); return !!pass; };
const readLedger = (root) => {
  const dir = path.join(root, 'bench', 'verdicts', 'autopilot');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith('.jsonl')).sort()
    .flatMap((f) => readFileSync(path.join(dir, f), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)));
};
const readAuthoredLines = (root) => {
  const f = path.join(root, ...AUTHORED_REL.split('/'));
  return existsSync(f) ? readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [];
};
const listing = (dir) => {
  if (!existsSync(dir)) return null;
  const out = [];
  const walk = (d) => { for (const n of readdirSync(d).sort()) { const p = path.join(d, n); const s = statSync(p); if (s.isDirectory()) walk(p); else out.push(path.relative(dir, p) + ':' + s.size + ':' + s.mtimeMs); } };
  walk(dir);
  return out.join('|');
};
const childEnv = () => { const env = {}; for (const [k, v] of Object.entries(process.env)) if (!k.startsWith('NODE_TEST') && k !== 'NODE_OPTIONS') env[k] = v; return env; };
const cliJson = (args, timeout) => {
  const t = Date.now();
  const r = spawnSync(process.execPath, [HEAP, path.join('bin', 'brain.mjs'), 'self-code', ...args], { cwd: ROOT, encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024, env: childEnv(), windowsHide: true });
  let j = null;
  try { j = JSON.parse(r.stdout); } catch { j = null; }
  return { status: r.status, j, ms: Date.now() - t, stderr: String(r.stderr || '').slice(-400) };
};
const perSourceLines = (r) => {
  const out = [];
  for (const s of [...SOURCE_ORDER, 'given']) {
    const t = r?.bySource?.[s];
    if (!t) continue;
    out.push('  ' + s.padEnd(8) + ' candidates ' + t.candidates + '  proposed ' + t.proposed + '  kept ' + t.kept + '  reverted ' + t.reverted + '  refused ' + t.refused + '  would apply ' + t.wouldApply
      + '  model calls ' + t.modelCalls + ' proposed ' + t.modelProposed + ' kept ' + t.modelKept + '  ms per patch ' + (t.modelMs.length ? t.modelMs.join(', ') : '-'));
  }
  return out;
};
const walls = (r) => { const w = {}; for (const d of r?.decisions || []) if (d.candidate) { const k = (d.source || 'given') + ' ' + d.decision + (d.wall ? ' at ' + d.wall : ''); w[k] = (w[k] || 0) + 1; } return w; };

// ---------------------------------------------------------------- the orchestrator's rate (Board 14)
const DAY_MS = 86_400_000;
// docs/LOG.md times are America/New_York; every dated line of this project falls inside EDT (UTC-4)
const LOG_UTC_OFFSET_H = 4;
/**
 * The orchestrator's rate, read from disk: boards landed and bars met per day. A board has landed
 * when a dated line of docs/LOG.md says "BOARD <n> ... LANDED" or "... DONE" (within 40 characters,
 * no comma, colon or semicolon between; a DIED line does not match) or docs/BOARDS.json lists it
 * launched with an "at". Bars met are read from the landed line: "<n> bars met", or the names after
 * "MET " up to the next semicolon; a landed line with neither is listed as unparsed, so barsMet is a
 * floor. The window runs from the first dated line of docs/LOG.md to the last landing.
 * Cross-check: bench/verdicts/*.json with isTheBar true and a top-level barMet true.
 */
export function orchestratorRate({ root = ROOT } = {}) {
  const logFile = path.join(root, 'docs', 'LOG.md');
  const boardsFile = path.join(root, 'docs', 'BOARDS.json');
  let text;
  try { text = readFileSync(logFile, 'utf8'); } catch { return { ok: false, reason: 'no docs/LOG.md under ' + root }; }
  const sources = ['docs/LOG.md'];
  const DATED = /^- (\d{4})-(\d{2})-(\d{2})(?: (\d{2}):(\d{2}))?\b(.*)$/;
  const LANDED = /\bBOARD (\d+)\b[^,;:]{0,40}?\b(LANDED|DONE)\b/i;
  const landed = new Map();
  let firstMs = null, firstLine = null;
  text.split('\n').forEach((raw, i) => {
    const m = DATED.exec(raw.replace(/\r$/, ''));
    if (!m) return;
    const atMs = Date.UTC(+m[1], +m[2] - 1, +m[3], (m[4] ? +m[4] : 0) + LOG_UTC_OFFSET_H, m[5] ? +m[5] : 0);
    if (firstMs === null || atMs < firstMs) { firstMs = atMs; firstLine = i + 1; }
    const L = LANDED.exec(m[6]);
    if (!L || !m[4]) return;
    const board = Number(L[1]);
    if (landed.has(board)) return;
    const count = /(\d+) bars met/i.exec(m[6]);
    const named = /\bMET ([^;]+)/.exec(m[6]);
    const bars = count ? Number(count[1]) : named ? named[1].split(',').map((s) => s.trim()).filter(Boolean).length : null;
    landed.set(board, { board, atMs, at: new Date(atMs).toISOString(), from: 'docs/LOG.md:' + (i + 1), bars });
  });
  try {
    const j = JSON.parse(readFileSync(boardsFile, 'utf8'));
    const list = Array.isArray(j) ? j : Array.isArray(j.boards) ? j.boards : Object.values(j);
    sources.push('docs/BOARDS.json');
    for (const b of list) {
      if (!b || !b.launched || !b.at || landed.has(Number(b.board))) continue;
      const atMs = Date.parse(b.at);
      if (Number.isFinite(atMs)) landed.set(Number(b.board), { board: Number(b.board), atMs, at: b.at, from: 'docs/BOARDS.json', bars: null });
    }
  } catch { /* the log alone */ }
  const rows = [...landed.values()].sort((a, b) => a.board - b.board);
  if (!rows.length || firstMs === null) return { ok: false, reason: 'no landed board in docs/LOG.md or docs/BOARDS.json', sources };
  const lastMs = Math.max(...rows.map((r) => r.atMs));
  const windowDays = Math.max(1e-9, (lastMs - firstMs) / DAY_MS);
  const barsMet = rows.reduce((s, r) => s + (r.bars || 0), 0);
  const unparsed = rows.filter((r) => r.bars === null).map((r) => r.board);
  let verdictBarsMet = 0;
  try {
    const vd = path.join(root, 'bench', 'verdicts');
    for (const n of readdirSync(vd)) {
      if (!n.endsWith('.json')) continue;
      try { const v = JSON.parse(readFileSync(path.join(vd, n), 'utf8')); if (v && v.isTheBar === true && v.barMet === true) verdictBarsMet++; } catch { /* not a verdict */ }
    }
    sources.push('bench/verdicts/*.json');
  } catch { /* none */ }
  const r4 = (x) => Math.round(x * 1e4) / 1e4;
  return {
    ok: true, sources, boards: rows.length, boardList: rows.map((r) => r.board), barsMet, barsMetUnparsed: unparsed, verdictBarsMet,
    windowFrom: new Date(firstMs).toISOString(), windowFromLine: 'docs/LOG.md:' + firstLine, windowTo: new Date(lastMs).toISOString(), windowDays: r4(windowDays),
    boardsPerDay: r4(rows.length / windowDays), barsMetPerDay: r4(barsMet / windowDays), boardsPerHour: r4(rows.length / windowDays / 24), barsMetPerHour: r4(barsMet / windowDays / 24),
    rows: rows.map(({ board, at, from, bars }) => ({ board, at, from, bars })),
  };
}

async function main() {
TMP = mkdtempSync(path.join(tmpdir(), 'bench-autopilot-'));
TREE = path.join(TMP, 'tree');

// the verdict this run overwrites: Board 8's, carried forward when a Board 10 run already overwrote it
let prior = null;
try {
  const p = JSON.parse(readFileSync(VERDICT, 'utf8'));
  prior = p.board === 14 && p.overwrote ? p.overwrote : { board: p.board ?? 8, at: p.at, passed: p.passed, total: p.total, verdict: p.verdict, command: p.command, copy: p.board === 10 ? 'bench/verdicts/autopilot-board10.json' : null };
} catch { prior = null; }

// a daemon (daemon/run.mjs) refuses its self-code step while a live pid holds a flag in state/bench-flags/:
// stage 3 reads the real tree and asserts that nothing was written, so no daemon may write there meanwhile
const FLAG = path.join(ROOT, 'state', 'bench-flags', process.pid + '.json');
let flagUp = false;
try { mkdirSync(path.dirname(FLAG), { recursive: true }); writeFileSync(FLAG, JSON.stringify({ pid: process.pid, command: COMMAND, at: new Date().toISOString() }) + '\n'); flagUp = true; } catch { /* no flag: a daemon may still run beside this bench */ }
console.log('bench flag ' + (flagUp ? 'raised: state/bench-flags/' + process.pid + '.json (a daemon refuses its self-code step until it is lowered)' : 'NOT raised'));

let verdict = null;
try {
  // ---------------------------------------------------------------- the copied tree
  mkdirSync(TREE, { recursive: true });
  cpSync(path.join(ROOT, 'bench', 'gate.mjs'), path.join(TREE, 'bench', 'gate.mjs'));
  const gateRows = plantGateRows(TREE, ROOT);
  const gateHash = hashBytes(readFileSync(path.join(ROOT, 'bench', 'gate.mjs')));
  put('lib/sum.mjs', SUM_BUGGY);
  put('test/sum.test.mjs', SUM_TEST);
  put('lib/scale.mjs', SCALE);
  put('test/area.test.mjs', AREA_TEST);
  console.log('tree ' + TREE + '  gate program bench/gate.mjs ' + gateHash.slice(0, 12) + ' (copied from the brain); its rows read ' + gateRows.join(', '));

  // ---------------------------------------------------------------- stage 1: fix, kept
  console.log('\nstage 1: planted failing test test/sum.test.mjs, candidate patch lib/sum.mjs');
  const s1t = Date.now();
  const r1 = runAutopilot({
    root: TREE, candidates: [{ key: 'planted:fix-add', source: 'bench/autopilot.mjs', file: 'lib/sum.mjs', test: 'test/sum.test.mjs', patch: PATCH_A, why: 'add subtracts' }],
  });
  const s1ms = Date.now() - s1t;
  console.log(renderRun(r1));
  const k = r1.decisions[0] || {};
  check('stage 1 decision is KEPT with the gate GREEN', k.decision === 'kept' && k.gate?.verdict === 'GREEN' && k.gate?.exit === 0, 'decision ' + k.decision + ', gate ' + k.gate?.verdict + ' exit ' + k.gate?.exit);
  check('stage 1 baseline gate was red before the patch', r1.baseline?.exit === 1, 'baseline exit ' + r1.baseline?.exit + ', red ' + JSON.stringify(r1.baseline?.red));
  check('stage 1 evidence: the test failed before and passed after', k.verification?.failsBefore === true && k.verification?.passesAfter === true, 'fail before ' + k.verification?.beforeFail + ', pass after ' + k.verification?.afterPass);
  check('stage 1 file on disk holds the patched bytes', hashBytes(bytesOf('lib/sum.mjs')) === k.hashAfter, 'hash ' + String(k.hashBefore).slice(0, 12) + ' -> ' + String(k.hashAfter).slice(0, 12));
  const snap1 = k.id ? path.join(TREE, 'state', 'self-code', k.id) : null;
  const snapOk = snap1 && existsSync(path.join(snap1, 'before.bin')) && hashBytes(readFileSync(path.join(snap1, 'before.bin'))) === k.hashBefore
    && JSON.parse(readFileSync(path.join(snap1, 'meta.json'), 'utf8')).hashAfter === k.hashAfter
    && JSON.parse(readFileSync(path.join(snap1, 'outcome.json'), 'utf8')).decision === 'kept';
  check('stage 1 snapshot holds the pre-patch bytes and both hashes', snapOk, 'state/self-code/' + k.id);

  // ---------------------------------------------------------------- stage 2: breaks another, reverted
  console.log('\nstage 2: planted failing test test/scale.test.mjs, a patch that passes it and breaks test/area.test.mjs, and a patch aimed at a test file');
  put('test/scale.test.mjs', SCALE_TEST);
  const scaleBefore = bytesOf('lib/scale.mjs');
  const areaBefore = bytesOf('test/area.test.mjs');
  const s2t = Date.now();
  const r2 = runAutopilot({
    root: TREE, candidates: [
      { key: 'planted:weaken-area-test', source: 'bench/autopilot.mjs', file: 'test/area.test.mjs', test: 'test/area.test.mjs', patch: PATCH_C, why: 'a test that edits itself green' },
      { key: 'planted:factor-ten', source: 'bench/autopilot.mjs', file: 'lib/scale.mjs', test: 'test/scale.test.mjs', patch: PATCH_B, why: 'scale must double' },
    ],
  });
  const s2ms = Date.now() - s2t;
  console.log(renderRun(r2));
  const c = r2.decisions.find((d) => d.key === 'planted:weaken-area-test') || {};
  const rv = r2.decisions.find((d) => d.key === 'planted:factor-ten') || {};
  check('stage 2 the patch aimed at a test file is refused at the ceiling, never run', c.decision === 'refused' && c.wall === 'ceiling' && !c.verification && bytesOf('test/area.test.mjs').equals(areaBefore), c.reason);
  check('stage 2 evidence held: its own test failed before and passed after', rv.verification?.failsBefore === true && rv.verification?.passesAfter === true, 'fail before ' + rv.verification?.beforeFail + ', pass after ' + rv.verification?.afterPass);
  check('stage 2 decision is REVERTED with the gate RED on the other test', rv.decision === 'reverted' && rv.gate?.verdict === 'RED' && rv.gate?.exit === 1 && (rv.gate?.regressions || []).includes('test/area.test.mjs'), 'decision ' + rv.decision + ', gate ' + rv.gate?.verdict + ' exit ' + rv.gate?.exit + ', turned red ' + JSON.stringify(rv.gate?.regressions));
  const scaleAfter = bytesOf('lib/scale.mjs');
  check('stage 2 file restored byte for byte (CRLF)', scaleAfter.equals(scaleBefore) && rv.hashRestored === rv.hashBefore && hashBytes(scaleAfter) === rv.hashBefore, 'hash ' + String(rv.hashBefore).slice(0, 12) + ' -> ' + String(rv.hashAfter).slice(0, 12) + ' -> restored ' + String(rv.hashRestored).slice(0, 12) + ', ' + scaleAfter.length + ' bytes');
  check('stage 2 gate.json restored to the baseline run', rv.gateJsonRestored === true, 'gateJsonRestored ' + rv.gateJsonRestored);

  const ledger = readLedger(TREE);
  const lk = ledger.find((l) => l.key === 'planted:fix-add');
  const lr = ledger.find((l) => l.key === 'planted:factor-ten');
  check('ledger: one line per decision, both hashes on the kept and the reverted line', ledger.length === 3 && lk?.decision === 'kept' && lr?.decision === 'reverted'
    && /^[0-9a-f]{64}$/.test(lk?.hashBefore) && /^[0-9a-f]{64}$/.test(lk?.hashAfter) && /^[0-9a-f]{64}$/.test(lr?.hashBefore) && /^[0-9a-f]{64}$/.test(lr?.hashAfter) && lr?.hashRestored === lr?.hashBefore,
  ledger.length + ' lines in bench/verdicts/autopilot/');

  // ---------------------------------------------------------------- stage 3: the real tree, dry
  console.log('\nstage 3: the real tree, brain self-code --auto --dry --json');
  const watch = [path.join(ROOT, 'state', 'self-code'), path.join(ROOT, 'bench', 'verdicts', 'autopilot'), path.join(ROOT, 'state', 'self')];
  const gateJson = path.join(ROOT, 'bench', 'verdicts', 'gate.json');
  const before = { lists: watch.map(listing), gate: existsSync(gateJson) ? statSync(gateJson).mtimeMs : null };
  const cli = cliJson(['--auto', '--dry', '--json'], 900_000);
  const s3ms = cli.ms;
  const real = cli.j;
  const after = { lists: watch.map(listing), gate: existsSync(gateJson) ? statSync(gateJson).mtimeMs : null };
  const rc = real?.counts || {};
  const rs = real?.sources || {};
  console.log('real tree: exit ' + cli.status + '  candidates ' + rc.candidates + '  would apply ' + rc.wouldApply + '  refused ' + rc.refused + '  model calls ' + rc.modelCalls + '  (' + s3ms + ' ms)');
  console.log('candidates per source:');
  for (const l of perSourceLines(real)) console.log(l);
  if (rs.gate) console.log('  gate.json: ' + rs.gate.tests + ' test files, ' + rs.gate.red + ' red (' + rs.gate.verdict + ')');
  if (rs.slow) console.log('  gate.json slow rows: ' + rs.slow.slow + ' at ' + rs.slow.slowMs + ' ms or more');
  if (rs.notes) console.log('  notes: ' + rs.notes.open + ' OPEN lines in ' + rs.notes.files + ' files, ' + rs.notes.strict + ' with the OPEN: grammar');
  if (rs.imagine) console.log('  imagine: ' + (rs.imagine.read ? rs.imagine.proposed + ' proposed, ' + rs.imagine.patches + ' as patches, by ' + rs.imagine.how : rs.imagine.reason));
  if (rs.census) console.log('  census: ' + (rs.census.read ? rs.census.deadEdges + ' dead edges of ' + rs.census.edges + ' in ' + rs.census.seed + ', ' + rs.census.deadCells + ' dead cells; ' + (rs.census.pinned || 'not pinned') : rs.census.reason));
  if (rs.mutants) console.log('  mutants.json: ' + rs.mutants.mutants + ' mutants, ' + rs.mutants.survived + ' survived');
  console.log('decisions: ' + JSON.stringify(walls(real)));
  const perSource = Object.fromEntries(SOURCE_ORDER.map((s) => [s, real?.bySource?.[s]?.candidates ?? 0]));
  check('stage 3 the CLI dry run on the real tree completed and printed a candidate count', cli.status === 0 && real?.dry === true && Number.isInteger(rc.candidates), 'exit ' + cli.status + ', candidates ' + rc.candidates + (cli.status !== 0 ? ', stderr ' + cli.stderr.slice(0, 200) : ''));
  const wroteNothing = check('stage 3 the dry run wrote nothing (no snapshot, no ledger, no authored line, gate.json untouched)', before.lists.every((l, i) => l === after.lists[i]) && before.gate === after.gate, 'state/self-code, bench/verdicts/autopilot and state/self unchanged, gate.json mtime unchanged');
  check('stage 3 candidates per source on the real tree, total above 0', rc.candidates > 0 && Object.values(perSource).reduce((a, b) => a + b, 0) === rc.candidates, SOURCE_ORDER.map((s) => s + ' ' + perSource[s]).join(', ') + ' = ' + rc.candidates);

  // ---------------------------------------------------------------- stage 4a: one wet pass, non-mutant sources
  const WET = path.join(TMP, 'wet');
  plantWet(WET, ROOT);
  plantGateRows(WET, ROOT);
  const edgesBefore = readFileSync(path.join(WET, 'seed/gen-p/edges-000.mjs'), 'utf8');
  console.log('\nstage 4a: a planted repository copy ' + WET + ' (the real gate program, mind/imagine.mjs, a census seed), the wet CLI run with the model author off');
  const wet = cliJson(['--auto', '--json', '--root', WET, '--author', 'off'], 900_000);
  const w = wet.j || {};
  console.log(w.decisions ? renderRun(w) : 'no JSON: exit ' + wet.status + ' ' + wet.stderr);
  console.log('per source:');
  for (const l of perSourceLines(w)) console.log(l);
  const wi = (w.decisions || []).find((d) => d.source === 'imagine') || {};
  const wc = (w.decisions || []).find((d) => d.source === 'census') || {};
  const authoredWet = readAuthoredLines(WET);
  const edgesAfter = readFileSync(path.join(WET, 'seed/gen-p/edges-000.mjs'), 'utf8');
  const keptNonMutant = (w.decisions || []).filter((d) => d.candidate && d.decision === 'kept' && d.source && d.source !== 'mutants' && d.gate?.verdict === 'GREEN');
  check('stage 4a at least one candidate from a non-mutant source is KEPT with the gate GREEN', wet.status === 0 && keptNonMutant.length >= 1, keptNonMutant.length + ' kept (' + keptNonMutant.map((d) => d.source + ' by ' + d.author + ', gate exit ' + d.gate.exit).join('; ') + ')');
  check('stage 4a the imagined fix: mind/imagine.mjs propose() -> verified -> gate red to GREEN -> KEPT', wi.decision === 'kept' && wi.author === 'imagine' && wi.verification?.failsBefore === true && wi.gate?.verdict === 'GREEN' && w.baseline?.exit === 1,
    'decision ' + wi.decision + ', baseline gate exit ' + w.baseline?.exit + ', after exit ' + wi.gate?.exit + ', ' + wi.file);
  check('stage 4a the census prune: dead edge declarations deleted by the autopilot, every test green, KEPT', wc.decision === 'kept' && wc.author === 'deterministic:census-prune' && wc.gate?.verdict === 'GREEN'
    && !/e\("x"|e\("y"/.test(edgesAfter) && edgesAfter.split('\n').filter((l) => l.startsWith('e(')).length === 3 && edgesBefore === SEED_EDGES,
  'decision ' + wc.decision + ', ' + edgesBefore.split('\n').filter((l) => l.startsWith('e(')).length + ' -> ' + edgesAfter.split('\n').filter((l) => l.startsWith('e(')).length + ' declarations, gate exit ' + wc.gate?.exit);
  const hex = (h) => /^[0-9a-f]{64}$/.test(h || '');
  check('stage 4a state/self/authored.jsonl holds one line per kept patch: at, files, source, gate hash before and after', authoredWet.length === keptNonMutant.length && authoredWet.length === 2
    && authoredWet.every((l) => Number.isFinite(Date.parse(l.at)) && Array.isArray(l.files) && l.files.length === 1 && l.source && hex(l.gateHashBefore) && hex(l.gateHashAfter) && l.gateHashBefore !== l.gateHashAfter && l.organism === true),
  authoredWet.map((l) => l.source + ' ' + l.files[0] + ' gate ' + String(l.gateHashBefore).slice(0, 12) + ' -> ' + String(l.gateHashAfter).slice(0, 12)).join('; '));

  // ---------------------------------------------------------------- stage 4b: the model cell
  const MOD = path.join(TMP, 'model');
  plantModel(MOD, ROOT);
  plantGateRows(MOD, ROOT);
  const closed = makeModelAuthor({ model: 'claude-opus' })({ key: 'k', test: 'test/mean.test.mjs' }, { root: MOD });
  const probe = makeModelAuthor({});
  console.log('\nstage 4b: the model cell ' + probe.config.model + ' at ' + probe.config.base + ' on a planted failing mean with an OPEN: line, at most one model call');
  const mod = cliJson(['--auto', '--json', '--root', MOD, '--author', 'on', '--author-max', '1', '--sources', 'notes'], 1_200_000);
  const m = mod.j || {};
  console.log(m.decisions ? renderRun(m) : 'no JSON: exit ' + mod.status + ' ' + mod.stderr);
  console.log('per source:');
  for (const l of perSourceLines(m)) console.log(l);
  const md = (m.decisions || []).find((d) => d.candidate && d.model && d.model.called) || {};
  const mt = m.bySource?.notes || {};
  if (md.answer) console.log('model answer (first 400 characters): ' + JSON.stringify(String(md.answer).slice(0, 400)));
  check('stage 4b the author refuses a Claude or Anthropic model before any socket opens', closed.ok === false && closed.ms === 0 && /open weights only/.test(closed.reason || ''), closed.reason);
  check('stage 4b the model cell on open weights was asked once and answered; proposed, kept and ms per patch printed', mod.status === 0 && mt.modelCalls === 1 && md.model?.answered === true && Number.isFinite(md.model?.ms) && m.author?.on === true && !/claude|anthropic/i.test(m.author?.model + m.author?.base),
    'model ' + m.author?.model + ', calls ' + mt.modelCalls + ', answered ' + md.model?.answered + ', ' + md.model?.ms + ' ms, proposed ' + mt.modelProposed + ', kept ' + mt.modelKept + ', decision ' + md.decision + (md.wall ? ' at ' + md.wall : '') + (md.decision !== 'kept' && md.reason ? ': ' + String(md.reason).slice(0, 160) : ''));

  // ---------------------------------------------------------------- stage 5: the share over the wet copy
  const boards = readBoards(path.join(ROOT, 'docs', 'BOARDS.json'));
  const share = computeShare({ authored: authoredWet, boards: boards.boards });
  console.log('\nstage 5: tools/authorship.mjs arithmetic over the wet copy\'s authored lines and the real docs/BOARDS.json: ' + fmtShare(share.numerator, share.denominator)
    + ' (' + share.organism + ' organism kept, ' + share.kept + ' kept, ' + share.boardFiles + ' board files in ' + share.boards.length + ' boards)');
  check('stage 5 the share counts the wet copy\'s kept patches over kept patches plus board files', share.numerator === authoredWet.filter((l) => l.organism).length && share.denominator === authoredWet.length + share.boardFiles && share.boardFiles > 0,
    fmtShare(share.numerator, share.denominator));

  // ---------------------------------------------------------------- stage 6 (Board 14): THE SOAK on a planted tree
  const SOAKT = path.join(TMP, 'soak');
  const SOAK_TMP = path.join(TMP, 'soak-tmp');
  mkdirSync(SOAK_TMP, { recursive: true });
  plantInto(SOAKT, { gate: 'fake' });
  const tuneGap = { ...plantGaps().tune, trial: { ...plantGaps().tune.trial, minutes: 0.01 } };
  const writeGaps = (root, lines) => { const f = path.join(root, 'state', 'self', 'gaps.jsonl'); mkdirSync(path.dirname(f), { recursive: true }); writeFileSync(f, lines.map((l) => JSON.stringify(l)).join('\n') + (lines.length ? '\n' : '')); };
  writeGaps(SOAKT, [tuneGap]);
  const soakFilesOf = (root) => { try { return readdirSync(path.join(root, 'state', 'self')).filter((n) => /^soak-.+\.json$/.test(n)); } catch { return []; } };
  console.log('\nstage 6: THE SOAK (Board 14) on a planted tree ' + SOAKT + ' (test/operators-plant.mjs, a fixture gate): STOP, then one gap closed by the organism, then the orchestrator rate');
  // 6a the switch, through the CLI entry (no child is spawned) and through runSoak itself
  writeFileSync(path.join(SOAKT, 'state', 'self', 'STOP'), 'stop\n');
  const stopCli = runFromCli({ soak: 1, root: SOAKT, author: 'off' });
  const stopRun = await runSoak({ soak: 1, root: SOAKT, author: 'off', tmpBase: SOAK_TMP, log: (l) => console.log('  | ' + l) });
  check('stage 6a state/self/STOP refuses the soak before any lock, soak file or copy (exit 0)', stopCli.exitCode === 0 && stopCli.stopped === true && stopRun.stopped === true && stopRun.exitCode === 0
    && readdirSync(SOAK_TMP).length === 0 && soakFilesOf(SOAKT).length === 0 && !existsSync(path.join(SOAKT, 'state', 'self-code', 'autopilot.lock')),
  'cli exit ' + stopCli.exitCode + ' (' + stopCli.reason + '), runSoak ' + stopRun.reason + ', temp entries ' + readdirSync(SOAK_TMP).length + ', soak files ' + soakFilesOf(SOAKT).length);
  rmSync(path.join(SOAKT, 'state', 'self', 'STOP'), { force: true });
  // 6b one soak: the gap source, knob-tune through self/improve.mjs on a copy, the gate on the tree, the ledger rebuilt
  const remeasure = async ({ root }) => {
    const r = spawnSync(process.execPath, [HEAP, path.join('planted', 'tune-bench.mjs')], { cwd: root, encoding: 'utf8', windowsHide: true });
    const v = Number((/metric (\S+)/.exec(String(r.stdout)) || [])[1]);
    const lines = Number.isFinite(v) && v >= tuneGap.bar ? [] : [{ ...tuneGap, measured: Number.isFinite(v) ? v : null }];
    writeGaps(root, lines);
    return { lines };
  };
  const tuneBefore = readFileSync(path.join(SOAKT, 'planted', 'tune.mjs'), 'utf8');
  const s6t = Date.now();
  const r6 = await runSoak({ soak: 0.5, root: SOAKT, author: 'off', sources: 'gaps', 'gate-minutes': 0, 'idle-step-ms': 250, tmpBase: SOAK_TMP, refreshLedger: remeasure, rateFn: orchestratorRate, log: (l) => console.log('  | ' + l) });
  const s6ms = Date.now() - s6t;
  const tuneAfter = readFileSync(path.join(SOAKT, 'planted', 'tune.mjs'), 'utf8');
  const authored6 = readAuthoredLines(SOAKT);
  const ledger6 = readLedger(SOAKT).filter((l) => l.soak && l.source === 'gaps');
  const kd = ledger6.find((l) => l.decision === 'kept') || {};
  const k6 = (r6.kept || [])[0] || {};
  const a6 = authored6.find((l) => l.from === 'gaps:planted-tune') || {};
  const closed6 = (r6.refreshes || []).find((x) => x.why === 'kept') || {};
  check('stage 6b a gaps-source candidate flows source -> knob-tune on a copy -> gate GREEN on the tree -> KEPT, before and after on the decision line', r6.exitCode === 0 && kd.operator === 'knob-tune' && kd.before === 64 && kd.after === 96 && Number.isFinite(kd.noise) && kd.gate?.verdict === 'GREEN'
    && /export const GAIN = 14;/.test(tuneAfter) && /export const GAIN = 10;/.test(tuneBefore),
  'decision ' + kd.decision + ' by ' + kd.author + ', before ' + kd.before + ' after ' + kd.after + ' noise ' + kd.noise + ', gate ' + kd.gate?.verdict + ', ' + s6ms + ' ms');
  check('stage 6c the kept gap patch appends its authorship line: author organism (knob-tune), from gaps:planted-tune', authored6.length === 1 && a6.author === 'organism (knob-tune)' && a6.operator === 'knob-tune' && a6.organism === true && a6.before === 64 && a6.after === 96 && /^[0-9a-f]{64}$/.test(a6.hashAfter || ''),
    JSON.stringify({ author: a6.author, from: a6.from, before: a6.before, after: a6.after, files: a6.files }));
  check('stage 6d after the keep the ledger was rebuilt and the gap printed CLOSED; no copy left on disk', closed6.closed === true && r6.copies?.leftOnDisk === 0 && r6.copies?.tmpRemoved === true && r6.copies?.made >= 1 && r6.copies?.deleted === r6.copies?.made,
    'closed ' + closed6.closed + ', copies made ' + r6.copies?.made + ' deleted ' + r6.copies?.deleted + ' left ' + r6.copies?.leftOnDisk);
  const orch = orchestratorRate({ root: ROOT });
  console.log('orchestrator rate: ' + JSON.stringify({ boards: orch.boards, barsMet: orch.barsMet, unparsed: orch.barsMetUnparsed, windowDays: orch.windowDays, boardsPerDay: orch.boardsPerDay, barsMetPerDay: orch.barsMetPerDay, verdictBarsMet: orch.verdictBarsMet }));
  console.log(r6.magnitude?.line || 'no MAGNITUDE line');
  check('stage 6e the MAGNITUDE line prints the organism rate beside the orchestrator rate read from docs/BOARDS.json and docs/LOG.md', orch.ok === true && orch.boards > 0 && orch.windowDays > 0 && r6.magnitude?.orchestrator?.ok === true
    && /^MAGNITUDE organism: 1 kept/.test(r6.magnitude?.line || '') && /orchestrator: \d+ boards landed/.test(r6.magnitude?.line || ''),
  orch.boards + ' boards and ' + orch.barsMet + ' bars met over ' + orch.windowDays + ' days; organism ' + r6.magnitude?.organism?.keptPerHour + ' kept/hour');

  const passed = checks.filter((x) => x.pass).length;
  const met = passed === checks.length;
  const nm = (n, one, many) => n + ' ' + (n === 1 ? one : many);
  const statement = 'This verdict OVERWRITES the Board ' + (prior?.board ?? 10) + ' bar of the same name' + (prior?.copy ? ', kept byte for byte as ' + prior.copy : '') + (prior ? ' (written ' + prior.at + ', ' + prior.passed + ' of ' + prior.total + ' checks, ' + prior.verdict + ')' : '')
    + '; the 21 checks of Boards 8 and 10 run here first, unchanged. In a copied tree holding the real gate program (bench/gate.mjs ' + gateHash.slice(0, 12) + ') a planted fix was KEPT with the gate going from exit ' + r1.baseline?.exit + ' to exit ' + k.gate?.exit
    + ', a planted patch that turned ' + (rv.gate?.regressions || []).join(', ') + ' red was ' + String(rv.decision).toUpperCase() + ' byte for byte on a CRLF file, and a patch aimed at a test file was refused at the ceiling. '
    + 'On the real tree, brain self-code --auto --dry --json read ' + rc.candidates + ' candidates by source (' + SOURCE_ORDER.map((s) => s + ' ' + perSource[s]).join(', ') + '), would apply ' + rc.wouldApply + ', and wrote nothing. '
    + 'One wet CLI pass on a planted repository copy with the model author off kept ' + nm(keptNonMutant.length, 'candidate', 'candidates') + ' from non-mutant sources (' + keptNonMutant.map((d) => d.source).join(' and ') + ') with the gate GREEN'
    + ' and appended ' + nm(authoredWet.length, 'line', 'lines') + ' to state/self/authored.jsonl with the gate hash before and after. '
    + 'The model cell ' + m.author?.model + ' through Ollama was asked ' + nm(mt.modelCalls ?? 0, 'time', 'times') + ' for a planted OPEN: line, ' + (md.model?.answered ? 'answered in ' : 'did not answer (') + md.model?.ms + ' ms' + (md.model?.answered ? '' : ')') + ', and its patch was ' + String(md.decision || 'not reached').toUpperCase() + (md.wall ? ' at the ' + md.wall + ' wall' : '') + (md.decision === 'kept' ? ' with the gate ' + md.gate?.verdict : '')
    + '. Over the wet copy and the real docs/BOARDS.json the share is ' + share.numerator + '/' + share.denominator + '. '
    + 'Board 14: on a planted tree state/self/STOP refused the soak with exit ' + stopCli.exitCode + ' and nothing written; one soak of 0.5 minutes took the planted gap from the gaps source through knob-tune on a copy and kept it (before ' + kd.before + ', after ' + kd.after + ', noise ' + kd.noise + ') with the gate ' + kd.gate?.verdict
    + ', appended the authorship line "' + a6.author + '", rebuilt the ledger and printed the gap ' + (closed6.closed ? 'CLOSED' : 'still open') + ', with ' + r6.copies?.leftOnDisk + ' copies left on disk; the orchestrator rate read ' + orch.boards + ' boards landed and ' + orch.barsMet + ' bars met (a floor: ' + (orch.barsMetUnparsed || []).length + ' landed lines name no count) over ' + orch.windowDays + ' days. '
    + passed + ' of ' + checks.length + ' checks passed.';
  verdict = {
    at: new Date().toISOString(), command: COMMAND, node: process.version, isTheBar: true, barMet: met, board: 14,
    split: { board8and10: checks.slice(0, 21).filter((x) => x.pass).length + '/' + Math.min(21, checks.length), board14: checks.slice(21).filter((x) => x.pass).length + '/' + checks.slice(21).length },
    statement,
    overwrote: prior,
    fixture: { gateProgram: 'bench/gate.mjs', gateHash, files: ['lib/sum.mjs', 'lib/scale.mjs', 'test/sum.test.mjs', 'test/area.test.mjs', 'test/scale.test.mjs'], gateRows },
    kept: { key: k.key, decision: k.decision, gate: k.gate, baselineGate: r1.baseline, hashBefore: k.hashBefore, hashAfter: k.hashAfter, verification: k.verification, snapshot: 'state/self-code/' + k.id, ms: s1ms },
    reverted: { key: rv.key, decision: rv.decision, gate: rv.gate, baselineGate: r2.baseline, hashBefore: rv.hashBefore, hashAfter: rv.hashAfter, hashRestored: rv.hashRestored, gateJsonRestored: rv.gateJsonRestored, verification: rv.verification, bytes: scaleAfter.length, ms: s2ms },
    ceiling: { key: c.key, decision: c.decision, wall: c.wall, reason: c.reason },
    ledgerLines: ledger.length,
    realTree: {
      command: 'node bin/brain.mjs self-code --auto --dry --json', exit: cli.status, dry: real?.dry ?? null, counts: rc, perSource, bySource: real?.bySource ?? null, sources: rs, walls: walls(real),
      decisions: (real?.decisions || []).map((d) => ({ key: d.key, source: d.source ?? null, decision: d.decision, wall: d.wall ?? null, reason: d.reason ?? null })), wroteNothing, ms: s3ms,
    },
    wet: {
      command: 'node bin/brain.mjs self-code --auto --json --root <planted copy> --author off', exit: wet.status, counts: w.counts ?? null, bySource: w.bySource ?? null, baseline: w.baseline ?? null,
      decisions: (w.decisions || []).map((d) => ({ key: d.key, source: d.source ?? null, author: d.author ?? null, decision: d.decision, wall: d.wall ?? null, file: d.file ?? null, gate: d.gate ?? null, verification: d.verification ?? null, reason: d.reason ?? null })),
      authored: authoredWet, ms: wet.ms,
    },
    model: {
      command: 'node bin/brain.mjs self-code --auto --json --root <planted copy> --author on --author-max 1 --sources notes', exit: mod.status, author: m.author ?? null, counts: m.counts ?? null, bySource: m.bySource ?? null,
      decisions: (m.decisions || []).map((d) => ({ key: d.key, source: d.source ?? null, author: d.author ?? null, decision: d.decision, wall: d.wall ?? null, file: d.file ?? null, model: d.model ?? null, gate: d.gate ?? null, reason: d.reason ?? null, answer: d.answer ?? null })),
      closedRefused: { ok: closed.ok, ms: closed.ms, reason: closed.reason }, ms: mod.ms,
    },
    share: { numerator: share.numerator, denominator: share.denominator, share: share.share, organism: share.organism, kept: share.kept, boardFiles: share.boardFiles, boards: share.boards },
    soak: {
      command: 'runSoak({ soak: 0.5, root: <planted tree>, author: off, sources: gaps, gate-minutes: 0 })',
      stop: { cli: { exitCode: stopCli.exitCode, stopped: stopCli.stopped, reason: stopCli.reason }, run: { exitCode: stopRun.exitCode, stopped: stopRun.stopped, reason: stopRun.reason } },
      decision: { key: kd.key, decision: kd.decision, operator: kd.operator, author: kd.author, before: kd.before, after: kd.after, noise: kd.noise, gate: kd.gate ?? null, hashBefore: kd.hashBefore ?? null, hashAfter: kd.hashAfter ?? null },
      authored: a6, refresh: closed6, attempts: r6.attempts, copies: r6.copies, trials: r6.trials, magnitude: r6.magnitude ?? null, lines: r6.lines ?? [], ms: s6ms,
    },
    orchestrator: orch,
    checks, passed, total: checks.length, verdict: met ? 'MET' : 'MISSED', ms: Date.now() - t0,
  };
  mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
  writeFileSync(VERDICT, JSON.stringify(verdict, null, 2));
  console.log('\nAUTOPILOT ' + verdict.verdict + ': ' + passed + '/' + checks.length + ' checks. real tree candidates ' + rc.candidates + ' (' + SOURCE_ORDER.map((s) => s + ' ' + perSource[s]).join(', ') + ')'
    + '; wet pass kept ' + keptNonMutant.length + ' non-mutant (' + keptNonMutant.map((d) => d.source).join(', ') + ') gate GREEN, authored.jsonl +' + authoredWet.length
    + '; model ' + m.author?.model + ' calls ' + mt.modelCalls + ' ' + md.model?.ms + ' ms, proposed ' + mt.modelProposed + ' kept ' + mt.modelKept
    + '; soak kept ' + (r6.kept || []).length + ' (' + kd.before + ' -> ' + kd.after + ') gap ' + (closed6.closed ? 'CLOSED' : 'open') + ', copies left ' + r6.copies?.leftOnDisk
    + '; orchestrator ' + orch.boards + ' boards, ' + orch.barsMet + ' bars met over ' + orch.windowDays + ' days'
    + '; ' + (Date.now() - t0) + ' ms. wrote bench/verdicts/autopilot.json (overwrites the Board ' + (prior?.board ?? 10) + ' bar)');
  process.exitCode = met ? 0 : 1;
} catch (e) {
  const partial = { at: new Date().toISOString(), command: COMMAND, node: process.version, isTheBar: false, barMet: false, board: 14, statement: 'The run threw before every stage completed: ' + String(e && e.message).split('\n')[0] + '. Checks that ran are listed. The Board 10 bar in autopilot.json was not overwritten.', error: String(e && e.stack || e), checks };
  mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
  writeFileSync(path.join(HERE, 'verdicts', 'autopilot-partial.json'), JSON.stringify(partial, null, 2));
  console.log('AUTOPILOT PARTIAL: ' + partial.statement + ' wrote bench/verdicts/autopilot-partial.json');
  process.exitCode = 1;
} finally {
  if (flagUp) { try { rmSync(FLAG, { force: true }); } catch { /* a dead pid's flag is ignored by the daemon */ } }
  try { rmSync(TMP, { recursive: true, force: true }); } catch { /* the OS will get it */ }
}
}

if (isMain) await main();
