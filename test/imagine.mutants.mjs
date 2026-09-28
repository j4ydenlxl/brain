// test/imagine.mutants.mjs: mutants for test/imagine.test.mjs. Each breaks one check the imagine
// item requires, and the suite must go red on every one. The original file is restored in a
// finally, whatever happens. Run it alone: it edits mind/imagine.mjs, capability/grid-invent.mjs
// and bench/imagine.mjs in place while it runs.
//
// Board 28: it REFUSES to start while any bench/verdicts/imagine-*-partial.json (or
// imagine-partial.json) is younger than ten minutes. bench/imagine.mjs keeps
// imagine-running-partial.json fresh while it runs and removes it at the end, and every narrower run
// writes a partial verdict when it ends. A bench started while a mutant sits in these files loads
// the mutant (its workers import capability/grid-invent.mjs when they boot), and board 24a's mutants
// ran while its bar launched; a young partial is the sign a bench is running or just ran.
//
//   node test/imagine.mutants.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..') + path.sep;
// the guard: no mutant while a bench may be loading these files
const YOUNG_MS = 10 * 60 * 1000;
const VERDICTS = ROOT + 'bench' + path.sep + 'verdicts';
const young = readdirSync(VERDICTS).filter((n) => /^imagine-(.*-)?partial\.json$/.test(n)).map((n) => ({ n, age: Date.now() - statSync(VERDICTS + path.sep + n).mtimeMs })).filter((x) => x.age < YOUNG_MS);
if (young.length) {
  console.log('refused: ' + young.map((x) => 'bench/verdicts/' + x.n + ' is ' + Math.round(x.age / 1000) + ' s old').join(', ') + '; a bench of bench/imagine.mjs is running or just ran, and a mutant in the files it loads would reach it. Run again when every imagine partial is ten minutes old.');
  process.exit(2);
}
const MUTANTS = [
  { name: 'memory check off', file: 'mind/imagine.mjs', from: 'if (nov.inMemory) { rejected.inMemory++; continue; }', to: 'if (false) { rejected.inMemory++; continue; }' },
  { name: 'knowledge check off', file: 'mind/imagine.mjs', from: 'if (hit.length) { rejected.inKnowledge++; continue; }', to: 'if (false) { rejected.inKnowledge++; continue; }' },
  { name: 'null check off', file: 'mind/imagine.mjs', from: 'if (reach.has(key)) { rejected.inNull++; continue; }', to: 'if (false) { rejected.inNull++; continue; }' },
  { name: 'floor check off', file: 'mind/imagine.mjs', from: 'if (nov.distance < floor) { rejected.nearMemory++; continue; }', to: 'if (false) { rejected.nearMemory++; continue; }' },
  { name: 'held out rule off', file: 'mind/imagine.mjs', from: "&& t && !sources.has(t));", to: '&& t);' },
  { name: 'novelty rule off', file: 'mind/imagine.mjs', from: "if (!(typeof ev.novelty === 'number' && ev.novelty > 0)) return 'reject';", to: '' },
  { name: 'control not required', file: 'mind/imagine.mjs', from: 'return hasText(r.suite) && !!barOk && hasText(r.control);', to: 'return hasText(r.suite) && !!barOk;' },
  { name: 'vocabulary skips the gate', file: 'capability/grid-invent.mjs', from: "if (p.status !== 'approved') { this.refused++; return p; }", to: "if (p.status !== 'approved') { this.refused++; }" },
  { name: 'per object lift is identity', file: 'capability/grid-invent.mjs', from: "case 'each': return isGrid(v) ? fit(eachObject(v, spec.mode, (g) => runSpec(spec.f, g))) : null;", to: "case 'each': return isGrid(v) ? v : null;" },
  { name: 'select picks every object', file: 'capability/grid-invent.mjs', from: 'const chosen = applyStep({ op: pick }, all);', to: 'const chosen = all;' },
  { name: 'under is overlay', file: 'capability/grid-invent.mjs', from: '    pasteOver(out, a, 0, 0);', to: '    out.cells = a.cells.slice(); pasteOver(out, b, 0, 0);' },
  { name: 'round 2 does not nest', file: 'capability/grid-invent.mjs', from: '    inners = got;', to: '    inners = [];' },
  { name: 'grading ignores time order', file: 'bench/imagine.mjs', from: '(r) => startOf(r) > Date.parse(o.at) && suiteMatches(', to: '(r) => suiteMatches(' },
  { name: 'pairing counts shared tasks', file: 'bench/imagine.mjs', from: '[...a].filter((id) => !b.has(id)).sort()', to: '[...a].sort()' },
  { name: 'a task votes once per run', file: 'bench/imagine.mjs', from: 'if (d > 0) taskAhead++; else if (d < 0) taskBehind++;', to: 'taskAhead += Math.max(0, d); taskBehind += Math.max(0, -d);' },
  { name: 'memorised never true', file: 'capability/grid-invent.mjs', from: '    if (g && sameGrid(g, wanted[i])) return false;\n  }\n  return true;', to: '    if (g && sameGrid(g, wanted[i])) return false;\n  }\n  return false;' },
  { name: 'doubt drops the fallback', file: 'capability/grid-invent.mjs', from: 'const hit = hit0 || fallback,', to: 'const hit = hit0,' },
  { name: 'the control is never read', file: 'bench/imagine.mjs', from: "  if (t === 'screen') return leadBar(objective) ? null : run.null.solved;", to: "  if (t === 'screen') return null; if (t) return null;" },
  { name: 'a tie counts as beyond the null', file: 'bench/imagine.mjs', from: 'beyond = paired.filter(([v, c]) => v > c).length;', to: 'beyond = paired.filter(([v, c]) => v >= c).length;' },
  { name: 'a lead bar read as a count', file: 'bench/imagine.mjs', from: "  if (t === 'screen') return leadBar(objective) ? run.invented.solved - run.null.solved : run.invented.solved;", to: "  if (t === 'screen') return run.invented.solved;" },
  { name: 'transfer graded without a carry', file: 'bench/imagine.mjs', from: " && (o.template !== 'transfer' || r.carry));", to: ');' },

  // board 24a: the bar decided from the rows, and the DreamCoder library arm
  { name: 'a mean lead equal to the band meets the bar', file: 'bench/imagine.mjs', from: 'const met = seeds.length >= minSeeds && runsPerSeed >= minRuns && meanLead > band;', to: 'const met = seeds.length >= minSeeds && runsPerSeed >= minRuns && meanLead >= band;' },
  { name: 'the band is the lead range alone', file: 'bench/imagine.mjs', from: 'const seedBand = rows.length ? Math.max(ranges.arm, ranges.control, ranges.lead) : null;', to: 'const seedBand = rows.length ? ranges.lead : null;' },
  { name: 'the bar needs no seeds', file: 'bench/imagine.mjs', from: 'const met = seeds.length >= minSeeds && runsPerSeed', to: 'const met = seeds.length > 0 && runsPerSeed' },
  { name: 'a fold sleeps on its own programs', file: 'bench/imagine.mjs', from: 'if (!x || G.foldOf(x.id, folds) === fold) continue;', to: 'if (!x) continue;' },
  { name: 'the sleep reads a program that was not solved', file: 'bench/imagine.mjs', from: 'if (!a || a.solved !== true || !Array.isArray(a.names)) continue;', to: 'if (!a || !a.solved || !Array.isArray(a.names)) continue;' },
  { name: 'offerable offers a task its own words', file: 'capability/grid-invent.mjs', from: 'return (library || []).concat(extra || []).filter((w) => w && !(w.sources || []).includes(taskId));', to: 'return (library || []).concat(extra || []).filter((w) => w);' },
  { name: 'a word imagined under the prior forgets what fed it', file: 'capability/grid-invent.mjs', from: 'map.set(w.key, { ...w, sources: fed.slice() });', to: 'map.set(w.key, { ...w, sources: [] });' },
  { name: 'the sleep keeps a routine that gains nothing', file: 'capability/grid-invent.mjs', from: 'if (c.gain > 0 && (!best', to: 'if (c.gain >= 0 && (!best' },
  { name: 'the prior never reaches the operator draw', file: 'capability/grid-invent.mjs', from: 'if (opts.prior) space.operators = ', to: 'if (false) space.operators = ' },
  { name: 'a program keeps its learned last step', file: 'capability/grid-invent.mjs', from: 'export function programSteps(names, byKey = new Map()) {\n  const ops = (names || []).slice();\n  while (ops.length && LEARNER_NAMES.has(ops[ops.length - 1])) ops.pop();', to: 'export function programSteps(names, byKey = new Map()) {\n  const ops = (names || []).slice();' },

  // board 28: every budget is work, the bar runs every seed twice, and the results apply in job order
  { name: 'the band ignores the run to run band', file: 'bench/imagine.mjs', from: 'const band = seedBand === null ? null : runBand === null ? seedBand : Math.max(seedBand, runBand);', to: 'const band = seedBand;' },
  { name: 'one run meets the bar', file: 'bench/imagine.mjs', from: 'runsPerSeed >= minRuns && meanLead > band;', to: 'meanLead > band;' },
  { name: 'a repeated run number counts as a second run', file: 'bench/imagine.mjs', from: 'Math.min(...bySeed.map((xs) => new Set(xs.map(runOf)).size))', to: 'Math.min(...bySeed.map((xs) => xs.length))' },
  { name: 'the run to run band reads the lead alone', file: 'bench/imagine.mjs', from: 'Math.max(runRanges.arm, runRanges.control, runRanges.lead);', to: 'runRanges.lead;' },
  { name: 'results apply in the order they finish', file: 'bench/imagine.mjs', from: '    done(j, x) { buf.set(j, x); flush(); },', to: '    done(j, x) { apply(j, x); next++; flush(); },' },
  { name: 'a job sees the words of the job just before it', file: 'bench/imagine.mjs', from: 'return entered.stage === stage && entered.job <= job - lag;', to: 'return entered.stage === stage && entered.job < job;' },
  { name: 'a grid run is whole only as a bar', file: 'bench/imagine.mjs', from: "  return typeof gv.n === 'number' && gv.n > 0 && gv.n === gv.of && gv.rows.length === gv.n && !gv.controlArm && !gv.repeatOf;", to: '  return false;' },
  { name: 'the search budget reads the wall clock', file: 'capability/grid-invent.mjs', from: 'const over = workLimit === null ? () => now() > deadline : () => workSince(w0) > workLimit;', to: 'const over = () => now() > deadline;' },
  // board 31: a cfg without seeds is refused, and the split names its ids
  { name: 'the bench defaults a cfg without seeds', file: 'bench/imagine.mjs', from: "  if (!Array.isArray(cfg.seeds) || !cfg.seeds.length || !(Number.isInteger(cfg.runs) && cfg.runs >= 1)) throw new Error(", to: "  if (false) throw new Error(" },
  { name: 'the split forgets the held out ids', file: 'bench/imagine.mjs', from: '      ids: Array.isArray(opts.heldOutIds) ? opts.heldOutIds.slice() : null,', to: '      ids: null,' },
  { name: 'the admission budget reads the wall clock', file: 'capability/grid-invent.mjs', from: "const over = typeof work === 'number' && work >= 0 ? () => workSince(w0) > work : () => now() > deadline;", to: 'const over = () => now() > deadline;' },
];
const runSuite = () => {
  const r = spawnSync(process.execPath, ['--max-old-space-size=2000', '--test', 'test/imagine.test.mjs'], { cwd: ROOT, encoding: 'utf8', timeout: 170_000 });
  const out = (r.stdout || '') + (r.stderr || '');
  const num = (re) => Number((out.match(re) || [])[1]);
  return { status: r.status, tests: num(/ℹ tests (\d+)/), pass: num(/ℹ pass (\d+)/), fail: num(/ℹ fail (\d+)/), red: [...new Set([...out.matchAll(/^✖ (.+?) \(/gm)].map((x) => x[1]))] };
};
// the unmutated suite first: every test must pass, and its count is what a mutant run must reach,
// so a mutant that breaks the file's load (a parse error, a missing export) is never counted as killed
const base = runSuite();
if (base.status !== 0 || !(base.tests > 0) || base.pass !== base.tests) {
  console.log('baseline not green: exit ' + base.status + ', tests ' + base.tests + ', pass ' + base.pass + ', fail ' + base.fail);
  process.exit(1);
}
let killed = 0, neverRan = 0;
const rows = [];
for (const m of MUTANTS) {
  const file = ROOT + m.file;
  const orig = readFileSync(file, 'utf8');
  const n = orig.split(m.from).length - 1;
  if (n !== 1) { neverRan++; rows.push(m.name + ': ANCHOR MATCHED ' + n + ' TIMES, mutant never ran'); continue; }
  try {
    writeFileSync(file, orig.replace(m.from, () => m.to));
    const check = spawnSync(process.execPath, ['--check', file], { cwd: ROOT, encoding: 'utf8' });
    if (check.status !== 0) { neverRan++; rows.push(m.name + ': DOES NOT PARSE, mutant never ran'); continue; }
    const r = runSuite();
    const ran = r.pass + r.fail === base.tests;
    const dead = ran && r.status !== 0 && r.fail > 0;
    if (dead) killed++;
    else if (!ran) neverRan++;
    rows.push(m.name + ': ' + (dead ? 'KILLED' : ran ? 'SURVIVED' : 'NEVER RAN (' + (r.pass + r.fail) + ' of ' + base.tests + ' tests ran)') + ', exit ' + r.status + ', pass ' + r.pass + ' fail ' + r.fail + (r.red.length ? ', red: ' + r.red.join(' | ') : ''));
  } finally {
    writeFileSync(file, orig);
  }
}
for (const r of rows) console.log(r);
console.log('baseline: ' + base.tests + ' tests, all pass');
console.log('mutants killed ' + killed + ' of ' + MUTANTS.length + (neverRan ? ', never ran ' + neverRan : ''));
if (killed !== MUTANTS.length) process.exitCode = 1;
