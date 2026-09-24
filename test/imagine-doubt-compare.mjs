// An analysis script of the imagine item (notes/imagine.md quotes what it printed). Not a test:
// the gate runs test/*.test.mjs only. It reads, prints, and writes nothing.
// Compare a doubt run with the run without doubt on the same seed and split, task by task.
//   node test/imagine-doubt-compare.mjs without.json with.json
import { readFileSync } from 'node:fs';
const [A, B] = process.argv.slice(2).map((f) => JSON.parse(readFileSync(f, 'utf8')));
console.log('without: ' + A.command + ' at ' + A.at + ' (doubt ' + !!A.doubt + ', seed ' + A.seed + ')');
console.log('with:    ' + B.command + ' at ' + B.at + ' (doubt ' + !!B.doubt + ', seed ' + B.seed + ')');
const byId = (v) => new Map(v.rows.map((r) => [r.id, r]));
const a = byId(A), b = byId(B);
const kind = (x) => (!x ? 'none' : x.solved ? 'solved' : x.status === 'found' ? 'wrong' : x.status);
for (const arm of ['invented', 'null']) {
  const moves = {};
  let fbA = 0, fbB = 0, sA = 0, sB = 0, doubted = 0, fromFallback = 0, fallbackRight = 0, solvedDoubted = 0, foundNotFallback = 0, notFallbackRight = 0;
  const gained = [], lost = [];
  for (const [id, ra] of a) {
    const rb = b.get(id); if (!rb) continue;
    const ka = kind(ra[arm]), kb = kind(rb[arm]);
    if (ka === 'wrong') fbA++; if (kb === 'wrong') fbB++;
    if (ka === 'solved') sA++; if (kb === 'solved') sB++;
    if (ka === 'solved' && kb !== 'solved') lost.push(id + ' (' + kb + ')');
    if (kb === 'solved' && ka !== 'solved') gained.push(id + ' (was ' + ka + ')');
    if (ka !== kb) { const k = ka + ' -> ' + kb; moves[k] = (moves[k] || 0) + 1; }
    const xb = rb[arm] || {};
    if (xb.doubted) doubted++;
    if (xb.fromFallback) { fromFallback++; if (xb.solved) fallbackRight++; }
    else if (xb.status === 'found') { foundNotFallback++; if (xb.solved) notFallbackRight++; }
    if (xb.solved && xb.doubted) solvedDoubted++;
  }
  console.log(arm + ': solved ' + sA + ' -> ' + sB + '; found but wrong ' + fbA + ' -> ' + fbB
    + '; gained ' + gained.length + (gained.length ? ' (' + gained.join(', ') + ')' : '')
    + '; lost ' + lost.length + (lost.length ? ' (' + lost.join(', ') + ')' : ''));
  console.log('  tasks that doubted a program ' + doubted + '; answered from the fallback ' + fromFallback + ' (right ' + fallbackRight + ')');
  console.log('  as a flag (with): answers from the fallback ' + fromFallback + ', right ' + fallbackRight + '; other answers ' + foundNotFallback + ', right ' + notFallbackRight + '; solved tasks that had doubted a program ' + solvedDoubted);
  console.log('  changes: ' + (Object.entries(moves).sort().map(([k, n]) => k + ' ' + n).join(', ') || 'none'));
}
