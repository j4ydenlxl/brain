// An analysis script of the imagine item (notes/imagine.md quotes what it printed). Not a test:
// the gate runs test/*.test.mjs only. It reads, prints, and writes nothing.
// For each 6000 ms training run: the tasks it solved that no 3000 ms training run (any variant,
// either arm) solved. Reads state/imagine/runs.jsonl; prints only.
import { readFileSync } from 'node:fs';
const F = new URL('../state/imagine/runs.jsonl', import.meta.url);
const runs = readFileSync(F, 'utf8').split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l)).filter((r) => r.split === 'training');
const slow = runs.filter((r) => r.budgetMs === 6000 && !r.partial), fast = runs.filter((r) => r.budgetMs === 3000);
const seen = new Set(fast.flatMap((r) => [...r.invented.ids, ...r.null.ids]));
console.log('3000 ms training runs read: ' + fast.length + '; 6000 ms training runs: ' + slow.length);
for (const r of slow) for (const arm of ['invented', 'null']) {
  const f = r[arm].ids.filter((t) => !seen.has(t));
  console.log('6000 ms seed ' + r.seed + ', ' + arm + ' arm, solved in no 3000 ms training run by either arm: ' + f.length + ' of ' + r[arm].solved + (f.length ? ' (' + f.join(', ') + ')' : ''));
}
