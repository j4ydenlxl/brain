// bench/tasks.mjs: THE SCOREBOARD. Runs every task suite, prints one row per suite and
// one per family with counts beside every percentage, and writes bench/verdicts/tasks.json.
// A percentage with no denominator beside it is a rumour, so every row carries correct/n.
//
//   node bench/tasks.mjs [--seed s] [--quiet] [--json]
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUITES } from '../tasks/index.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

function args(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const k = a.slice(2), v = argv[i + 1];
    if (v === undefined || v.startsWith('--')) { out[k] = true; continue; }
    out[k] = /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v;
    i++;
  }
  return out;
}

const pct = (x) => (x * 100).toFixed(2).padStart(6) + '%';
const pad = (s, n) => String(s).padEnd(n);
const num = (x, n) => String(x).padStart(n);

export function run({ seed = null, quiet = false } = {}) {
  const reports = [];
  for (const suite of SUITES) {
    const opts = seed ? { seed: suite.name + '/' + seed } : {};
    const r = suite.run(opts);
    reports.push(r.report);
  }

  if (!quiet) {
    console.log('');
    console.log(pad('suite', 12) + num('n', 6) + num('correct', 9) + '  accuracy' + num('ms', 10) + num('cells', 8) + num('ticks', 8));
    console.log('-'.repeat(62));
    for (const r of reports) {
      console.log(pad(r.suite, 12) + num(r.n, 6) + num(r.correct, 9) + '  ' + pct(r.accuracy) + num(r.ms.toFixed(1), 10) + num(r.cells, 8) + num(r.ticks, 8));
    }
    const total = reports.reduce((a, r) => a + r.n, 0), got = reports.reduce((a, r) => a + r.correct, 0);
    console.log('-'.repeat(62));
    console.log(pad('all', 12) + num(total, 6) + num(got, 9) + '  ' + pct(total ? got / total : 0));

    for (const r of reports) {
      console.log('');
      console.log(r.suite + ' by family:');
      const buckets = r.byKind || r.byDepth || {};
      for (const [k, v] of Object.entries(buckets)) {
        let line = '  ' + pad(k, 20) + num(v.correct, 5) + ' / ' + num(v.n, 4) + '  ' + pct(v.accuracy);
        if (v.baselineAccuracy !== undefined) line += '   predict.next floor ' + num(v.baselineCorrect, 4) + ' / ' + num(v.n, 4) + '  ' + pct(v.baselineAccuracy);
        if (v.meanSearched !== undefined) line += '   mean search ' + v.meanSearched.toFixed(1);
        console.log(line);
      }
      if (r.suite === 'sequence') console.log('  models chosen: ' + Object.entries(r.models).map(([k, v]) => k + ' ' + v.correct + '/' + v.picked).join(', '));
      if (r.suite === 'sequence') console.log('  mean hypotheses tried per problem: ' + r.meanHypothesesTried.toFixed(2));
      if (r.suite === 'grid') console.log('  mean search size ' + r.meanSearchSize.toFixed(1) + ', programs found ' + r.programsFound + '/' + r.n + ', hidden program recovered exactly ' + r.recoveredHiddenProgram + ', fitted the demonstrations but missed the test ' + r.foundButWrong);
      if (r.failureCount) {
        console.log('  failures ' + r.failureCount + ':');
        for (const f of r.failures.slice(0, 5)) console.log('    ' + JSON.stringify(f));
      }
    }
    console.log('');
  }

  const verdict = {
    at: new Date().toISOString(), node: process.version, seed: seed || 'default',
    suites: reports.map(r => ({ ...r, allFailures: undefined })),
    totals: {
      n: reports.reduce((a, r) => a + r.n, 0),
      correct: reports.reduce((a, r) => a + r.correct, 0),
      ms: Math.round(reports.reduce((a, r) => a + r.ms, 0) * 1000) / 1000,
    },
  };
  verdict.totals.accuracy = verdict.totals.n ? verdict.totals.correct / verdict.totals.n : 0;
  mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
  writeFileSync(path.join(HERE, 'verdicts', 'tasks.json'), JSON.stringify(verdict, null, 2));
  return verdict;
}

if (import.meta.url === 'file://' + process.argv[1].replaceAll('\\', '/') || import.meta.url.endsWith(path.basename(process.argv[1] || ''))) {
  const a = args(process.argv.slice(2));
  const v = run({ seed: a.seed || null, quiet: !!a.quiet });
  if (a.json) console.log(JSON.stringify(v, null, 2));
  console.log('TASKS ' + v.totals.correct + '/' + v.totals.n + ' = ' + (v.totals.accuracy * 100).toFixed(2) + '% in ' + v.totals.ms.toFixed(1) + 'ms, verdict written to bench/verdicts/tasks.json');
}
