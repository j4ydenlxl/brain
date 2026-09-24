// bench/runner.mjs - one test file, one tally line, one verdict file. Shared by
// bench/fuzz.mjs and bench/invariants.mjs.
//
// Two rules it exists to enforce:
//   a run with zero tests is RED, not green (a suite that never ran proves nothing);
//   every line a test printed is kept in the verdict, so the numbers in any writeup can
//   be traced back to the run that produced them.
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { run } from 'node:test';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

export async function runFile(label, rel, verdictName, { timeout = 120_000 } = {}) {
  const file = path.join(ROOT, rel);
  const passes = [], failures = [], printed = [];
  const t0 = Date.now();
  const stream = run({ files: [file], timeout, cwd: ROOT });
  for await (const ev of stream) {
    const d = ev.data;
    if (ev.type === 'test:pass') {
      if (d.details && d.details.type === 'suite') continue;
      passes.push({ name: d.name, ms: Math.round(d.details ? d.details.duration_ms : 0) });
    } else if (ev.type === 'test:fail') {
      if (d.details && d.details.type === 'suite') continue;
      const err = d.details && d.details.error;
      failures.push({ name: d.name, error: String((err && err.message) || err || '').split('\n')[0].slice(0, 300) });
    } else if (ev.type === 'test:stdout') {
      const line = String(d.message || '').trimEnd();
      if (line) { printed.push(line); console.log('  ' + line); }
    }
  }
  const ms = Date.now() - t0;
  const total = passes.length + failures.length;
  const verdict = total > 0 && failures.length === 0 ? 'GREEN' : 'RED';
  for (const f of failures) console.log('  FAILED ' + f.name + ' : ' + f.error);
  console.log(label + ' ' + verdict + ': ' + total + ' tests, ' + passes.length + ' pass, ' + failures.length + ' fail, ' + ms + 'ms, file ' + rel);
  mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
  writeFileSync(path.join(HERE, 'verdicts', verdictName), JSON.stringify({
    at: new Date().toISOString(), node: process.version, file: rel,
    tally: { tests: total, passed: passes.length, failed: failures.length, ms },
    measured: printed, tests: passes, failures, verdict,
  }, null, 2));
  return verdict === 'GREEN' ? 0 : 1;
}
