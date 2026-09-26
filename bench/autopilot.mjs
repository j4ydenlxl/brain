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
// Board 15 added (the first 26 checks are those of Boards 8, 10 and 14, unchanged):
//
//   stage 7  THE SOAK GRADES ITSELF (his 2026-09-25 order, "self improving. Without your build"):
//            the stage 6 soak left bench/verdicts/soak-partial.json (isTheBar false) and its record
//            holds its end lines, MAGNITUDE and exit; on the same planted tree, with the bar's
//            minutes lowered (allowed on a planted tree only) and a planted 1-minute author-off
//            proof soak, a soak with three gap attempts writes bench/verdicts/soak.json with
//            barMet true; the control, the proof's .exit file saying 1, writes barMet false and
//            archives the file it replaced to soak-history.jsonl; and the real 60-minute record
//            regrades (written nowhere) to barMet true from its record and its copied transcript.
//
// Flags: `--model off` skips the one model call of stage 4b (when another item holds the Ollama
// queue); the run then writes autopilot-partial.json (isTheBar false), never the bar.
// `--grade-soak <runId|latest>` grades one finished soak from state/self/soak-<runId>.json and its
// copied transcript (bench/verdicts/autopilot/*<runId>.out, .err, .exit) and writes
// bench/verdicts/soak.json (or soak-partial.json), archiving the file it replaces; it runs no bench.
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
import { runAutopilot, renderRun, hashBytes, SOURCE_ORDER, AUTHORED_REL, makeModelAuthor, runSoak, runFromCli, regradeSoak, SOAK_HISTORY_REL } from '../self/autopilot.mjs';
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
// a check that did not run (--model off): never a pass, and a run holding one is not the bar
const skip = (name, why) => { checks.push({ name, pass: false, skipped: true, detail: why }); console.log('SKIP ' + name + '  ' + why); return false; };
const ARGS = process.argv.slice(2);
const argOf = (flag) => { const i = ARGS.indexOf(flag); return i >= 0 && i + 1 < ARGS.length && !ARGS[i + 1].startsWith('--') ? ARGS[i + 1] : i >= 0 ? true : null; };
const MODEL_OFF = argOf('--model') === 'off' || ARGS.includes('--no-model');
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
  prior = p.board === 15 && p.overwrote ? p.overwrote : { board: p.board ?? 8, at: p.at, passed: p.passed, total: p.total, verdict: p.verdict, command: p.command, copy: p.board === 10 ? 'bench/verdicts/autopilot-board10.json' : null };
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
  // every source the run reports, SOURCE_ORDER first: a source another item adds (Board 15: boards) is counted, never dropped from the sum
  const perSource = Object.fromEntries([...SOURCE_ORDER, ...Object.keys(real?.bySource || {}).filter((x) => !SOURCE_ORDER.includes(x))].map((s) => [s, real?.bySource?.[s]?.candidates ?? 0]));
  check('stage 3 the CLI dry run on the real tree completed and printed a candidate count', cli.status === 0 && real?.dry === true && Number.isInteger(rc.candidates), 'exit ' + cli.status + ', candidates ' + rc.candidates + (cli.status !== 0 ? ', stderr ' + cli.stderr.slice(0, 200) : ''));
  const wroteNothing = check('stage 3 the dry run wrote nothing (no snapshot, no ledger, no authored line, gate.json untouched)', before.lists.every((l, i) => l === after.lists[i]) && before.gate === after.gate, 'state/self-code, bench/verdicts/autopilot and state/self unchanged, gate.json mtime unchanged');
  check('stage 3 candidates per source on the real tree, total above 0', rc.candidates > 0 && Object.values(perSource).reduce((a, b) => a + b, 0) === rc.candidates, Object.keys(perSource).map((s) => s + ' ' + perSource[s]).join(', ') + ' = ' + rc.candidates);

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
  // --model off: the one model call is not made (the Ollama socket is never opened); its check is SKIPPED, never passed
  const mod = MODEL_OFF ? { status: null, j: null, ms: 0, stderr: 'not run: --model off' } : cliJson(['--auto', '--json', '--root', MOD, '--author', 'on', '--author-max', '1', '--sources', 'notes'], 1_200_000);
  const m = mod.j || {};
  console.log(m.decisions ? renderRun(m) : 'no JSON: exit ' + mod.status + ' ' + mod.stderr);
  console.log('per source:');
  for (const l of perSourceLines(m)) console.log(l);
  const md = (m.decisions || []).find((d) => d.candidate && d.model && d.model.called) || {};
  const mt = m.bySource?.notes || {};
  if (md.answer) console.log('model answer (first 400 characters): ' + JSON.stringify(String(md.answer).slice(0, 400)));
  check('stage 4b the author refuses a Claude or Anthropic model before any socket opens', closed.ok === false && closed.ms === 0 && /open weights only/.test(closed.reason || ''), closed.reason);
  if (MODEL_OFF) skip('stage 4b the model cell on open weights was asked once and answered; proposed, kept and ms per patch printed', '--model off: no model call made, so this run is not the bar');
  else check('stage 4b the model cell on open weights was asked once and answered; proposed, kept and ms per patch printed', mod.status === 0 && mt.modelCalls === 1 && md.model?.answered === true && Number.isFinite(md.model?.ms) && m.author?.on === true && !/claude|anthropic/i.test(m.author?.model + m.author?.base),
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

  // ---------------------------------------------------------------- stage 7 (Board 15): THE SOAK GRADES ITSELF
  console.log('\nstage 7: THE SOAK GRADES ITSELF (Board 15): the stage 6 soak\'s own verdict, then a bar-grade soak on a planted tree, its control, and a read-only regrade of the real bar-length soak');
  const readJ = (f) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; } };
  // 7a the stage 6 soak (0.5 min, author off) wrote its own verdict at its end: soak-partial.json, not the bar
  const part6 = readJ(path.join(SOAKT, 'bench', 'verdicts', 'soak-partial.json'));
  const rec6 = readJ(path.join(SOAKT, ...String(r6.soakFile || 'none').split('/')));
  check('stage 7a the soak wrote its own verdict at its end: 0.5 min with the author off is soak-partial.json (isTheBar false), and its record keeps its end lines, MAGNITUDE and exit',
    r6.verdict?.file === 'bench/verdicts/soak-partial.json' && part6?.isTheBar === false && part6?.barMet === false && part6?.soak?.runId === r6.runId && /under the bar's 60/.test(part6?.notTheBarBecause || '')
    && !existsSync(path.join(SOAKT, 'bench', 'verdicts', 'soak.json')) && rec6?.exit?.code === 0 && Array.isArray(rec6?.endLines) && rec6.endLines.join('\n') === (r6.lines || []).join('\n') && /^MAGNITUDE organism:/.test(rec6?.magnitude?.line || ''),
    'file ' + r6.verdict?.file + ', isTheBar ' + part6?.isTheBar + ' (' + part6?.notTheBarBecause + '), record exit ' + rec6?.exit?.code + ', end lines ' + (rec6?.endLines || []).length);
  // 7b a planted tree, three fast gaps, a refusing improve (no model: the author is on in the config, the
  // operators are mocked, authorFn throws), the fixture gate after; first a short proof soak with the
  // author off, then a bar-grade soak with the bar's minutes lowered (allowed on a planted tree only)
  const S7 = path.join(TMP, 'soak7');
  const S7_TMP = path.join(TMP, 'soak7-tmp');
  mkdirSync(S7_TMP, { recursive: true });
  plantInto(S7, { gate: 'fake' });
  const fast = (g) => ({ ...g, trial: { ...g.trial, minutes: 0.01 } });
  writeGaps(S7, [fast(plantGaps().tune), fast(plantGaps().strategy), fast(plantGaps().edge)]);
  let improveCalls7 = 0;
  const refuse7 = async () => { improveCalls7++; return { kept: false, reason: 'a planted refusal (stage 7)', trials: [{ kind: 'trial', seconds: 0.01 }] }; };
  const noModel = async () => { throw new Error('no model call in stage 7'); };
  const noTask = async () => ({ registered: null, line: 'not queried: a planted tree (stage 7)' });
  const soak7 = { root: S7, sources: 'gaps', 'gate-minutes': 0, 'idle-step-ms': 200, tmpBase: S7_TMP, improveFn: refuse7, authorFn: noModel, rateFn: () => ({ ok: false, reason: 'not read in stage 7' }), queryTask: noTask, log: (l) => console.log('  | ' + l) };
  const s7t = Date.now();
  const proof7 = await runSoak({ ...soak7, soak: 0.05, author: 'off' });
  const bar7 = await runSoak({ ...soak7, soak: 0.1, author: 'on', 'gate-after': 'on', barMinutes: 0.1 });
  const s7ms = Date.now() - s7t;
  const v7 = readJ(path.join(S7, 'bench', 'verdicts', 'soak.json'));
  check('stage 7b a bar-grade soak on a planted tree wrote bench/verdicts/soak.json ITSELF at its end with barMet true: full wall, 3 or more gap attempts, the gate GREEN after, the proof soak exit 0',
    proof7.exitCode === 0 && proof7.verdict?.file === 'bench/verdicts/soak-partial.json' && bar7.exitCode === 0 && bar7.verdict?.file === 'bench/verdicts/soak.json'
    && v7?.isTheBar === true && v7?.barMet === true && v7?.soak?.runId === bar7.runId && Object.values(v7?.checks || {}).length === 4 && Object.values(v7.checks).every((c) => c.pass === true)
    && v7.checks.gapsAttempts.attempts >= 3 && /^GATE GREEN: fixture gate/.test(v7.checks.gateGreenAfter.summary || '') && v7.checks.proofSoakExit0.runId === proof7.runId && (bar7.modelCalls?.n ?? 0) === 0
    && !existsSync(path.join(S7, ...SOAK_HISTORY_REL.split('/'))),
    'proof ' + proof7.runId + ' exit ' + proof7.exitCode + '; soak ' + bar7.runId + ' ' + (bar7.lines || [])[0] + '; gap attempts ' + v7?.checks?.gapsAttempts?.attempts + ', gate after "' + v7?.checks?.gateGreenAfter?.summary + '", proof ' + v7?.checks?.proofSoakExit0?.runId + ' exit ' + v7?.checks?.proofSoakExit0?.exit + ', model calls ' + (bar7.modelCalls?.n ?? 0) + ', ' + s7ms + ' ms');
  // 7c the control: the proof's process exit says 1 (a copied .exit file wins over the record), so the regrade MISSES,
  // and the bar file it replaces is appended whole to soak-history.jsonl
  mkdirSync(path.join(S7, 'bench', 'verdicts', 'autopilot'), { recursive: true });
  writeFileSync(path.join(S7, 'bench', 'verdicts', 'autopilot', 'soak1-' + proof7.runId + '.exit'), 'exit 1\n' + new Date().toISOString() + '\n');
  const re7 = await regradeSoak({ root: S7, runId: bar7.runId, barMinutes: 0.1, write: true, queryTask: noTask });
  const hist7 = (() => { try { return readFileSync(path.join(S7, ...SOAK_HISTORY_REL.split('/')), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)); } catch { return []; } })();
  check('stage 7c control: the proof soak\'s .exit file says 1, so the regrade of the same soak has barMet false, and the file it replaced went whole to soak-history.jsonl',
    re7.ok === true && re7.verdict.isTheBar === true && re7.verdict.barMet === false && re7.verdict.checks.proofSoakExit0.pass === false && re7.verdict.checks.proofSoakExit0.exit === 1 && /\.exit \(the process exit\)$/.test(re7.verdict.checks.proofSoakExit0.exitFrom || '')
    && re7.wrote?.archived === true && hist7.length === 1 && hist7[0].previous?.barMet === true && hist7[0].previous?.soak?.runId === bar7.runId && readJ(path.join(S7, 'bench', 'verdicts', 'soak.json'))?.barMet === false,
    'barMet ' + re7.verdict?.barMet + ', proof exit ' + re7.verdict?.checks?.proofSoakExit0?.exit + ' from ' + re7.verdict?.checks?.proofSoakExit0?.exitFrom + ', history lines ' + hist7.length + ' (previous barMet ' + hist7[0]?.previous?.barMet + ')');
  // 7d the real tree, READ ONLY: the newest bar-length soak on record regrades from its record and copied transcript
  const realBar = (() => {
    const dir = path.join(ROOT, 'state', 'self');
    let names = [];
    try { names = readdirSync(dir).filter((n) => /^soak-.+\.json$/.test(n)); } catch { names = []; }
    return names.map((n) => readJ(path.join(dir, n))).filter((x) => x && x.cfg && Number(x.cfg.soakMinutes) >= 60 && x.cfg.authorOn === true && !x.cfg.dry && x.status === 'done')
      .sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)))[0] || null;
  })();
  const onDisk = readJ(path.join(ROOT, 'bench', 'verdicts', 'soak.json'));
  const re7d = realBar ? await regradeSoak({ root: ROOT, runId: realBar.runId, write: false }) : { ok: false, reason: 'no bar-length soak record under state/self/' };
  const v7d = re7d.verdict || {};
  const sameAsDisk = onDisk?.soak?.runId === v7d.soak?.runId ? Object.entries(v7d.checks || {}).every(([k, c]) => onDisk.checks?.[k]?.pass === c.pass) && onDisk.barMet === v7d.barMet : null;
  check('stage 7d the real bar-length soak regrades READ ONLY from its record and copied transcript to barMet true, and agrees with bench/verdicts/soak.json when that file holds the same soak',
    re7d.ok === true && re7d.wrote === null && v7d.isTheBar === true && v7d.barMet === true && v7d.reproduced?.fromRecord >= v7d.reproduced?.lines - 1 && sameAsDisk !== false,
    re7d.ok ? v7d.soak.runId + ': ' + v7d.printed?.doneLine + '; ' + v7d.printed?.totalLine + '; exit ' + v7d.soak?.exit + ' from ' + v7d.soak?.exitFrom + '; record reproduces ' + v7d.reproduced?.fromRecord + ' of ' + v7d.reproduced?.lines + ' lines; soak.json on disk ' + (sameAsDisk === null ? 'holds another soak (' + onDisk?.soak?.runId + ')' : sameAsDisk ? 'agrees' : 'DISAGREES') : re7d.reason);

  const passed = checks.filter((x) => x.pass).length;
  const met = passed === checks.length;
  const nm = (n, one, many) => n + ' ' + (n === 1 ? one : many);
  const statement = 'This verdict OVERWRITES the Board ' + (prior?.board ?? 10) + ' bar of the same name' + (prior?.copy ? ', kept byte for byte as ' + prior.copy : '') + (prior ? ' (written ' + prior.at + ', ' + prior.passed + ' of ' + prior.total + ' checks, ' + prior.verdict + ')' : '')
    + '; the 21 checks of Boards 8 and 10 run here first, unchanged. In a copied tree holding the real gate program (bench/gate.mjs ' + gateHash.slice(0, 12) + ') a planted fix was KEPT with the gate going from exit ' + r1.baseline?.exit + ' to exit ' + k.gate?.exit
    + ', a planted patch that turned ' + (rv.gate?.regressions || []).join(', ') + ' red was ' + String(rv.decision).toUpperCase() + ' byte for byte on a CRLF file, and a patch aimed at a test file was refused at the ceiling. '
    + 'On the real tree, brain self-code --auto --dry --json read ' + rc.candidates + ' candidates by source (' + Object.keys(perSource).map((s) => s + ' ' + perSource[s]).join(', ') + '), would apply ' + rc.wouldApply + ', and wrote nothing. '
    + 'One wet CLI pass on a planted repository copy with the model author off kept ' + nm(keptNonMutant.length, 'candidate', 'candidates') + ' from non-mutant sources (' + keptNonMutant.map((d) => d.source).join(' and ') + ') with the gate GREEN'
    + ' and appended ' + nm(authoredWet.length, 'line', 'lines') + ' to state/self/authored.jsonl with the gate hash before and after. '
    + (MODEL_OFF ? 'The model cell was not asked (--model off; a Claude-named model was still refused before any socket: ' + closed.reason + ')' : 'The model cell ' + m.author?.model + ' through Ollama was asked ' + nm(mt.modelCalls ?? 0, 'time', 'times') + ' for a planted OPEN: line, ' + (md.model?.answered ? 'answered in ' : 'did not answer (') + md.model?.ms + ' ms' + (md.model?.answered ? '' : ')') + ', and its patch was ' + String(md.decision || 'not reached').toUpperCase() + (md.wall ? ' at the ' + md.wall + ' wall' : '') + (md.decision === 'kept' ? ' with the gate ' + md.gate?.verdict : ''))
    + '. Over the wet copy and the real docs/BOARDS.json the share is ' + share.numerator + '/' + share.denominator + '. '
    + 'Board 14: on a planted tree state/self/STOP refused the soak with exit ' + stopCli.exitCode + ' and nothing written; one soak of 0.5 minutes took the planted gap from the gaps source through knob-tune on a copy and kept it (before ' + kd.before + ', after ' + kd.after + ', noise ' + kd.noise + ') with the gate ' + kd.gate?.verdict
    + ', appended the authorship line "' + a6.author + '", rebuilt the ledger and printed the gap ' + (closed6.closed ? 'CLOSED' : 'still open') + ', with ' + r6.copies?.leftOnDisk + ' copies left on disk; the orchestrator rate read ' + orch.boards + ' boards landed and ' + orch.barsMet + ' bars met (a floor: ' + (orch.barsMetUnparsed || []).length + ' landed lines name no count) over ' + orch.windowDays + ' days. '
    + 'Board 15: the stage 6 soak wrote its own ' + r6.verdict?.file + ' at its end; on a planted tree a bar-grade soak (the bar lowered to 0.1 min, allowed on a planted tree only) wrote bench/verdicts/soak.json ITSELF with barMet ' + v7?.barMet
    + ' (gap attempts ' + v7?.checks?.gapsAttempts?.attempts + ', gate after "' + v7?.checks?.gateGreenAfter?.summary + '", proof soak ' + v7?.checks?.proofSoakExit0?.runId + ' exit ' + v7?.checks?.proofSoakExit0?.exit + ')'
    + '; its control (the proof\'s .exit file saying 1) regraded to barMet ' + re7.verdict?.barMet + ' and archived the replaced file (' + hist7.length + ' history line); the real bar-length soak ' + (v7d.soak?.runId || 'none') + ' regraded read only to barMet ' + v7d.barMet + '. '
    + (MODEL_OFF ? 'Run with --model off: the stage 4b model call was not made, so this run is not the bar. ' : '')
    + passed + ' of ' + checks.length + ' checks passed.';
  verdict = {
    at: new Date().toISOString(), command: COMMAND + (MODEL_OFF ? ' --model off' : ''), node: process.version, isTheBar: !MODEL_OFF, barMet: met && !MODEL_OFF, board: 15,
    split: { board8and10: checks.slice(0, 21).filter((x) => x.pass).length + '/' + Math.min(21, checks.length), board14: checks.slice(21, 26).filter((x) => x.pass).length + '/' + checks.slice(21, 26).length, board15: checks.slice(26).filter((x) => x.pass).length + '/' + checks.slice(26).length },
    notTheBarBecause: MODEL_OFF ? '--model off: stage 4b made no model call (' + checks.filter((x) => x.skipped).map((x) => x.name.split(' ').slice(0, 2).join(' ')).join(', ') + ' skipped)' : null,
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
    selfGrade: {
      stage6: { file: r6.verdict?.file ?? null, isTheBar: part6?.isTheBar ?? null, notTheBarBecause: part6?.notTheBarBecause ?? null, recordExit: rec6?.exit ?? null, endLines: (rec6?.endLines || []).length },
      proof: { runId: proof7.runId, exitCode: proof7.exitCode, verdict: proof7.verdict ?? null },
      bar: { runId: bar7.runId, exitCode: bar7.exitCode, verdict: bar7.verdict ?? null, lines: bar7.lines ?? [], improveCalls: improveCalls7, checks: v7?.checks ?? null, statement: v7?.statement ?? null, ms: s7ms },
      control: { barMet: re7.verdict?.barMet ?? null, proof: re7.verdict?.checks?.proofSoakExit0 ?? null, archived: re7.wrote?.archived ?? null, historyLines: hist7.length },
      realTree: re7d.ok ? { runId: v7d.soak?.runId, isTheBar: v7d.isTheBar, barMet: v7d.barMet, checks: Object.fromEntries(Object.entries(v7d.checks || {}).map(([k, c]) => [k, c.pass])), exit: v7d.soak?.exit, exitFrom: v7d.soak?.exitFrom, reproduced: v7d.reproduced, printed: v7d.printed, soakJsonOnDisk: sameAsDisk === null ? 'another soak or none' : sameAsDisk ? 'agrees' : 'disagrees' } : { ok: false, reason: re7d.reason },
    },
    checks, passed, total: checks.length, verdict: MODEL_OFF ? 'PARTIAL' : met ? 'MET' : 'MISSED', ms: Date.now() - t0,
  };
  mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
  const OUT = MODEL_OFF ? path.join(HERE, 'verdicts', 'autopilot-partial.json') : VERDICT;
  writeFileSync(OUT, JSON.stringify(verdict, null, 2));
  const skipped = checks.filter((x) => x.skipped).length;
  console.log('\nAUTOPILOT ' + verdict.verdict + ': ' + passed + '/' + checks.length + ' checks' + (skipped ? ' (' + skipped + ' skipped: --model off)' : '') + '. real tree candidates ' + rc.candidates + ' (' + Object.keys(perSource).map((s) => s + ' ' + perSource[s]).join(', ') + ')'
    + '; wet pass kept ' + keptNonMutant.length + ' non-mutant (' + keptNonMutant.map((d) => d.source).join(', ') + ') gate GREEN, authored.jsonl +' + authoredWet.length
    + (MODEL_OFF ? '; model off (stage 4b skipped)' : '; model ' + m.author?.model + ' calls ' + mt.modelCalls + ' ' + md.model?.ms + ' ms, proposed ' + mt.modelProposed + ' kept ' + mt.modelKept)
    + '; soak kept ' + (r6.kept || []).length + ' (' + kd.before + ' -> ' + kd.after + ') gap ' + (closed6.closed ? 'CLOSED' : 'open') + ', copies left ' + r6.copies?.leftOnDisk
    + '; orchestrator ' + orch.boards + ' boards, ' + orch.barsMet + ' bars met over ' + orch.windowDays + ' days'
    + '; self-grade: stage 6 wrote ' + r6.verdict?.file + ', the planted bar-grade soak wrote soak.json barMet ' + v7?.barMet + ', its control barMet ' + re7.verdict?.barMet + ', the real soak ' + (v7d.soak?.runId || 'none') + ' regrades barMet ' + v7d.barMet
    + '; ' + (Date.now() - t0) + ' ms. wrote ' + path.relative(path.join(HERE, '..'), OUT).split(path.sep).join('/') + (MODEL_OFF ? ' (isTheBar false: --model off; autopilot.json, the bar, was not touched)' : ' (overwrites the Board ' + (prior?.board ?? 10) + ' bar)'));
  // a --model off run is PARTIAL, never the bar: it exits 0 when every check that ran passed
  process.exitCode = (MODEL_OFF ? checks.every((x) => x.pass || x.skipped) : met) ? 0 : 1;
} catch (e) {
  const partial = { at: new Date().toISOString(), command: COMMAND, node: process.version, isTheBar: false, barMet: false, board: 14, statement: 'The run threw before every stage completed: ' + String(e && e.message).split('\n')[0] + '. Checks that ran are listed. The bar in autopilot.json was not overwritten.', error: String(e && e.stack || e), checks };
  mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
  writeFileSync(path.join(HERE, 'verdicts', 'autopilot-partial.json'), JSON.stringify(partial, null, 2));
  console.log('AUTOPILOT PARTIAL: ' + partial.statement + ' wrote bench/verdicts/autopilot-partial.json');
  process.exitCode = 1;
} finally {
  if (flagUp) { try { rmSync(FLAG, { force: true }); } catch { /* a dead pid's flag is ignored by the daemon */ } }
  try { rmSync(TMP, { recursive: true, force: true }); } catch { /* the OS will get it */ }
}
}

// ---------------------------------------------------------------- --grade-soak <runId|latest>
// Grades one finished soak from state/self/soak-<runId>.json and its copied transcript, with the same
// grader the soak runs on itself at its end (self/autopilot.mjs gradeSoak), and writes
// bench/verdicts/soak.json (or soak-partial.json). A bar file it replaces goes whole to
// bench/verdicts/soak-history.jsonl first; every number and printed line of the replaced file is
// then looked up in the new one and the count is printed. No bench runs and no soak starts.

/** Every leaf of a JSON value as [path, value]. */
function leaves(v, at = '', out = []) {
  if (v === null || typeof v !== 'object') { out.push([at, v]); return out; }
  for (const [k, x] of Object.entries(v)) leaves(x, at ? at + '.' + k : k, out);
  return out;
}

/** The numbers and lines of an older grade that a new grade of the same soak does not hold anywhere. */
export function baselineKept(previous, next, { skip = /^(at|writtenBy|board|statement|bar|split\..*|command)$/ } = {}) {
  const have = new Set(leaves(next).map(([, x]) => (typeof x === 'number' ? 'n:' + x : typeof x === 'string' ? 's:' + x.trim() : 'o:' + String(x))));
  const want = leaves(previous).filter(([p, x]) => !skip.test(p) && (typeof x === 'number' || (typeof x === 'string' && x.length > 0)));
  const strs = leaves(next).map(([, x]) => x).filter((x) => typeof x === 'string');
  // a shortened path (the orchestrator wrote '.err' for the proof's second file) counts when a full one ends with it
  const missing = want.filter(([, x]) => !have.has(typeof x === 'number' ? 'n:' + x : 's:' + x.trim()) && !(typeof x === 'string' && strs.some((y) => y.endsWith(x.trim()))));
  return { total: want.length, kept: want.length - missing.length, missing: missing.map(([p, x]) => p + ' = ' + JSON.stringify(x)) };
}

function newestSoakId(root) {
  const dir = path.join(root, 'state', 'self');
  let names = [];
  try { names = readdirSync(dir).filter((n) => /^soak-.+\.json$/.test(n)); } catch { names = []; }
  const recs = names.map((n) => { try { return JSON.parse(readFileSync(path.join(dir, n), 'utf8')); } catch { return null; } }).filter((x) => x && x.runId && x.status && x.status !== 'running');
  recs.sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)));
  return recs[0] ? recs[0].runId : null;
}

async function gradeMain(arg) {
  const t = Date.now();
  const runId = arg === true || arg === 'latest' ? newestSoakId(ROOT) : String(arg);
  if (!runId) { console.log('GRADE-SOAK: no finished soak record under state/self/'); process.exitCode = 2; return; }
  const barFile = path.join(ROOT, 'bench', 'verdicts', 'soak.json');
  let previous = null;
  try { previous = JSON.parse(readFileSync(barFile, 'utf8')); } catch { previous = null; }
  const r = await regradeSoak({ root: ROOT, runId, write: true, writtenBy: 'node bench/autopilot.mjs --grade-soak ' + runId + ' (self/autopilot.mjs gradeSoak, the grader every soak now runs on itself at its end; from the record and the copied transcript)' });
  if (!r.ok) { console.log('GRADE-SOAK ' + runId + ': ' + r.reason); process.exitCode = 2; return; }
  const v = r.verdict;
  const p = v.printed;
  for (const l of [p.doneLine, p.totalLine, p.gapsLine, p.modelLine, p.peakLine, p.copiesLine, p.gateLine, p.magLine, p.budgetDoneLine]) if (l) console.log(l);
  console.log('exit ' + v.soak.exit + ' from ' + v.soak.exitFrom);
  const pr = v.checks.proofSoakExit0;
  console.log('proof soak (--soak 1 --author off): ' + (pr.ran ? pr.runId + ' exit ' + pr.exit + ' from ' + pr.exitFrom + '; ' + pr.doneLine + (pr.budgetDoneLine ? '; ' + pr.budgetDoneLine : '') : pr.reason));
  const a = v.autonomy || {};
  console.log('AUTONOMY task ' + (a.task?.name || 'BrainAutopilot') + ' registered ' + a.task?.registered + (a.task?.status ? ', status ' + a.task.status : '') + (a.task?.nextRun ? ', next run ' + a.task.nextRun : '')
    + '; STOP ' + (a.stop?.present ? 'PRESENT' : 'absent') + ' (' + a.stop?.path + ')'
    + '; newest decision file ' + (a.decisions?.file || 'none') + (a.decisions?.file ? ' (' + a.decisions.lines + ' lines, modified ' + a.decisions.mtime + ', age ' + a.decisions.ageHours + ' h)' : ''));
  console.log('AUTONOMY gate: ' + (a.gate?.line || 'none') + (a.gate?.at ? ' (' + a.gate.file + ' at ' + a.gate.at + ')' : ''));
  if (a.gate?.logLine) console.log('AUTONOMY gate line in docs/LOG.md: ' + a.gate.logLine);
  console.log('reproduced from the record: ' + v.reproduced.fromRecord + ' of ' + v.reproduced.lines + ' printed end lines' + (v.reproduced.notInRecord.length ? ' (not in it: ' + v.reproduced.notInRecord.join(' | ') + ')' : ''));
  if (previous && r.wrote?.archived) {
    const k = baselineKept(previous, v);
    console.log('baseline kept: ' + k.kept + ' of ' + k.total + ' numbers and lines of the replaced ' + 'bench/verdicts/soak.json (' + (previous.writtenBy || 'unknown writer') + ') are in the new file; the old file is whole in ' + SOAK_HISTORY_REL + (k.missing.length ? '; not found: ' + k.missing.join('; ') : ''));
  }
  console.log('checks: ' + Object.entries(v.checks).map(([n, c]) => n + ' ' + (c.pass ? 'pass' : 'FAIL')).join(', '));
  console.log('GRADE-SOAK ' + v.soak.runId + ': isTheBar ' + v.isTheBar + ', barMet ' + v.barMet + '; wrote ' + r.wrote.rel + (r.wrote.archived ? ', the file it replaced appended to ' + SOAK_HISTORY_REL : '') + '; ' + (Date.now() - t) + ' ms');
  process.exitCode = v.isTheBar && !v.barMet ? 1 : 0;
}

if (isMain) {
  const g = argOf('--grade-soak');
  if (g !== null) await gradeMain(g);
  else await main();
}
