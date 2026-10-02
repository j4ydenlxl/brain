// tools/organism-verdict.mjs: the organism's own numbers, printed once into bench/verdicts/organism.json, so a
// document (docs/PORTFOLIO.md) may quote them under the rule of tools/docs-numbers.mjs: no number that no command printed.
//
// It reads only what the organism itself wrote: the engine's status line (node grow/neo.mjs status), the newest row of
// grown/measure.jsonl, the era rows of neo/ERA.json, the kernel's primitive list, the knowledge pack index when there is
// one, and the suite counts handed in by --suites <file> (lines "name | # tests N # pass N # fail N ..."). A source that
// is not there yet is null, never a guess. It writes nothing but the verdict file.
//
// Run: node tools/organism-verdict.mjs [--suites <file>] [--board <journal.jsonl>]... [--out bench/verdicts/organism.json]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, dflt = null) => { const i = process.argv.indexOf(name); return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : dflt; };
const readJson = (rel) => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')); } catch { return null; } };
const lastLine = (rel) => { try { const t = fs.readFileSync(path.join(ROOT, rel), 'utf8').trim().split('\n'); return JSON.parse(t[t.length - 1]); } catch { return null; } };
const lineOf = (file, args) => {
  const r = spawnSync(process.execPath, [path.join(ROOT, file), ...args], { cwd: ROOT, encoding: 'utf8', timeout: 120000 });
  if (r.status !== 0) return null;
  const lines = String(r.stdout).trim().split('\n');
  try { return JSON.parse(lines[lines.length - 1]); } catch { return null; }
};

const status = lineOf('grow/neo.mjs', ['status']);
const measure = lastLine('grown/measure.jsonl');
const eraFile = readJson('neo/ERA.json');
const eras = eraFile && Array.isArray(eraFile.eras) ? eraFile.eras : [];
const know = readJson('neo/know/INDEX.json');
const compute = readJson('neo/COMPUTE.json');
const trials = (() => { try { return fs.readFileSync(path.join(ROOT, 'neo/TRIALS.jsonl'), 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)); } catch { return null; } })();

let prims = null;
try { const k = await import(new URL('../grow/neo-kernel.mjs', import.meta.url)); prims = typeof k.listPrims === 'function' ? k.listPrims().length : (k.PRIMS ? Object.keys(k.PRIMS).length : null); } catch { prims = null; }

// The run of eras with no rise in mastered tasks before the newest rise, and the rise itself, read off the era rows.
const mastered = eras.map((e) => (typeof e.mastered === 'number' ? e.mastered : null));
// The rise that counts is the one that ended the LONGEST flat run (a night of standing still), not the newest one; the
// climb lists every era where the count changed, so the eras after that rise are on the record too.
let flatEras = null; let riseAtEra = null; let masteredBeforeRise = null;
for (let i = 1; i < mastered.length; i++) {
  if (mastered[i] === null || mastered[i - 1] === null || mastered[i] <= mastered[i - 1]) continue;
  let j = i - 1; while (j > 0 && mastered[j - 1] === mastered[i - 1]) j--;
  if (flatEras === null || i - j > flatEras) { flatEras = i - j; riseAtEra = eras[i].era; masteredBeforeRise = mastered[i - 1]; }
}
const climb = eras.filter((e, i) => i === 0 || mastered[i] !== mastered[i - 1]).map((e) => ({ era: e.era, at: e.at, mastered: e.mastered }));
const newestEra = eras.length ? eras[eras.length - 1] : null;
const lastCounted = [...eras].reverse().find((e) => typeof e.mastered === 'number') || null;

// The era that raised the mastered count: what it grew, each task's held-out score next to its baseline, and the last
// measured row before it (the flat run's own numbers). And the generations under the locked judge, per generation.
const riseRow = riseAtEra === null ? null : eras.find((e) => e.era === riseAtEra);
const rise = riseRow && { era: riseRow.era, at: riseRow.at, body: riseRow.body || null, workers: riseRow.workers || null, ms: riseRow.ms, mastered: riseRow.mastered, cells: riseRow.cells, generated: riseRow.velocity ? riseRow.velocity.generated : null, cellsPerSecond: riseRow.velocity ? riseRow.velocity.cellsPerSecond : null, grown: (riseRow.grown || []).map((g) => ({ task: g.task, generated: g.generated, kept: g.kept, promoted: g.promoted, heldoutOk: g.heldout && g.heldout.ok, heldoutN: g.heldout && g.heldout.n, baselineOk: g.baseline && g.baseline.ok, baselineN: g.baseline && g.baseline.n })) };
const measureRows = (() => { try { return fs.readFileSync(path.join(ROOT, 'grown/measure.jsonl'), 'utf8').trim().split('\n').map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); } catch { return []; } })();
const beforeRow = riseAtEra === null ? null : [...measureRows].reverse().find((m) => typeof m.era === 'number' && m.era < riseAtEra && m.neo);
const before = beforeRow && { era: beforeRow.era, at: beforeRow.at, tasks: beforeRow.neo.tasks, colonies: beforeRow.neo.colonies, cells: beforeRow.neo.cells, mastered: beforeRow.neo.mastered, heldoutOk: beforeRow.neo.heldout && beforeRow.neo.heldout.ok, heldoutN: beforeRow.neo.heldout && beforeRow.neo.heldout.n, generated: beforeRow.generated };
const flatFromEra = riseAtEra === null || flatEras === null ? null : riseAtEra - flatEras;
const gens = readJson('grown/generations.json');
const generations = gens && Array.isArray(gens.generations) ? gens.generations.map((g) => { const ls = Object.values(g.lanes || {}); return { generation: g.generation, at: g.at, candidates: ls.reduce((x, l) => x + (l.candidates || 0), 0), survivors: ls.reduce((x, l) => x + (l.survivors || 0), 0), parent: g.parent || null }; }) : null;
const lock = (() => { const r = spawnSync(process.execPath, [path.join(ROOT, 'judge/verify.mjs')], { cwd: ROOT, encoding: 'utf8', timeout: 120000 }); return r.status === 0 ? String(r.stdout).trim().split('\n').pop() : null; })();
const selfLedger = readJson('grown/self.json');
const selfTrials = selfLedger && Array.isArray(selfLedger.history) ? { judged: selfLedger.history.length, kept: selfLedger.history.filter((t) => (t.verdict || t.status) === 'kept').length, pending: selfLedger.trial ? 1 : 0 } : null;
const tasksOpened =eras.reduce((x, e) => x + (Array.isArray(e.opened) ? e.opened.length : 0), 0);
const blockedNewest = eras.length && Array.isArray(eras[eras.length - 1].blocked) ? eras[eras.length - 1].blocked.length : null;

const suitesFile = arg('--suites');
let suites = null;
if (suitesFile) {
  try {
    const rows = fs.readFileSync(suitesFile, 'utf8').trim().split('\n').map((l) => {
      const m = /^(\S+)\s*\|.*# tests (\d+).*# pass (\d+).*# fail (\d+)/.exec(l);
      return m ? { name: m[1], tests: +m[2], pass: +m[3], fail: +m[4] } : null;
    }).filter(Boolean);
    suites = { files: rows.length, clean: rows.filter((r) => r.fail === 0).length, tests: rows.reduce((a, r) => a + r.tests, 0), pass: rows.reduce((a, r) => a + r.pass, 0), fail: rows.reduce((a, r) => a + r.fail, 0), failing: rows.filter((r) => r.fail > 0).map((r) => r.name) };
  } catch { suites = null; }
}

// What each builder of a board reported, copied by it from its own commands (the board's journal, one result row a builder).
const boardFiles = process.argv.flatMap((a, i) => (a === '--board' && process.argv[i + 1] ? [process.argv[i + 1]] : []));
const board = boardFiles.length ? boardFiles.flatMap((file) => { try { return fs.readFileSync(file, 'utf8').trim().split('\n').map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter((j) => j && j.result && Array.isArray(j.result.files)).map((j) => ({ files: j.result.files.map((f) => String(f).split('/brain/').pop()), printed: j.result.printed || null, numbers: j.result.numbers || null, defects: j.result.defects || [] })); } catch { return []; } }) : null;

// The wall of screens (web/datacenter.mjs), generated into a scratch directory: how many screens, and how many of how many per kind.
const dcDir = fs.mkdtempSync(path.join(os.tmpdir(), 'organism-dc-'));
const dcLine = lineOf('web/datacenter.mjs', ['--root', ROOT, '--out', dcDir]);
fs.rmSync(dcDir, { recursive: true, force: true });
const datacenter = dcLine && { bytes: dcLine.bytes, dataBytes: dcLine.dataBytes, screens: dcLine.screens, shown: dcLine.shown, eras: dcLine.eras, sources: dcLine.sources, missing: Array.isArray(dcLine.missing) ? dcLine.missing.length : null };

// The computers the organism has driven and the screens it kept (grow/machine.mjs status), and the watch list's packs.
const machines = fs.existsSync(path.join(ROOT, 'grow/machine.mjs')) ? lineOf('grow/machine.mjs', ['status']) : null;

const linesOf = (dir, re) => { let files = 0; let lines = 0; try { for (const f of fs.readdirSync(path.join(ROOT, dir))) { if (!re.test(f)) continue; files++; lines += fs.readFileSync(path.join(ROOT, dir, f), 'utf8').split('\n').length; } } catch { return null; } return { files, lines }; };

const verdict = {
  at: new Date().toISOString(),
  what: 'the organism\'s own numbers as its own files print them; null where a source is not there yet',
  engine: status && { tasks: status.tasks, colonies: status.colonies, cells: status.cells, mastered: status.mastered, serving: status.serving, generated: status.generated, kept: status.kept, features: status.features },
  kernel: { primitives: prims },
  eras: { count: eras.length, first: eras.length ? { era: eras[0].era, at: eras[0].at } : null, newest: eras.length ? eras[eras.length - 1].era : null, newestAt: eras.length ? eras[eras.length - 1].at : null, tasksOpened, blockedNewest, riseAtEra, masteredBeforeRise, flatErasBeforeRise: flatEras, flatFromEra, climb, masteredNewest: lastCounted && lastCounted.mastered, tasksNewest: status ? status.tasks : null, erasSinceRise: riseAtEra === null || !newestEra ? null : newestEra.era - riseAtEra },
  rise,
  beforeRise: before,
  generations,
  selfTrials,
  lock,
  syllabus: measure && measure.syllabus ? measure.syllabus : null,
  ladder: measure && measure.ladder ? measure.ladder : null,
  measure: measure && { era: measure.era, at: measure.at, lockedClasses: measure.locked && measure.locked.classes, lockedMean: measure.locked && measure.locked.mean, lockedByClass: measure.locked && measure.locked.byClass, heldoutOk: measure.neo && measure.neo.heldout && measure.neo.heldout.ok, heldoutN: measure.neo && measure.neo.heldout && measure.neo.heldout.n, heldoutScore: measure.neo && measure.neo.heldout && measure.neo.heldout.score, absorbedBytes: measure.absorbed && measure.absorbed.bytes, absorbedRows: measure.absorbed && measure.absorbed.rows, absorbedSources: measure.absorbed && measure.absorbed.sources, velocity: measure.velocity || null, plateau: measure.plateau === undefined ? null : measure.plateau },
  knowledge: know && Array.isArray(know.packs) ? { packs: know.packs.length, rows: know.packs.reduce((a, p) => a + (typeof p.rows === 'number' ? p.rows : 0), 0) } : null,
  trials: trials && { rows: trials.length, kept: trials.filter((t) => t.kept === true).length },
  compute: compute || null,
  suites,
  board,
  machines,
  datacenter,
  code: { grow: linesOf('grow', /\.mjs$/), act: linesOf('act', /\.mjs$/), web: linesOf('web', /\.mjs$/), tests: linesOf('test', /\.test\.mjs$/) },
};

const out = path.resolve(ROOT, arg('--out', 'bench/verdicts/organism.json'));
fs.writeFileSync(out, JSON.stringify(verdict, null, 2) + '\n');
console.log(JSON.stringify({ out: path.relative(ROOT, out).replace(/\\/g, '/'), engine: verdict.engine && { tasks: verdict.engine.tasks, cells: verdict.engine.cells, mastered: verdict.engine.mastered }, eras: verdict.eras, primitives: prims, suites: suites && { files: suites.files, clean: suites.clean, tests: suites.tests, fail: suites.fail } }));
