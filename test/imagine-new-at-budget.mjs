// An analysis script of the imagine item (notes/imagine.md quotes what it printed). Not a test:
// the gate runs test/*.test.mjs only. It reads, prints, and writes nothing.
// Which tasks the 6000 ms run solved that no earlier logged training run solved, in either arm.
// Reads state/imagine/runs.jsonl; prints only.
import { readFileSync } from 'node:fs';
const F = new URL('../state/imagine/runs.jsonl', import.meta.url);
const runs = readFileSync(F, 'utf8').split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l));
const target = runs.find((r) => r.split === 'training' && r.budgetMs === 6000 && !r.partial);
if (!target) throw new Error('no 6000 ms training run logged');
const earlier = runs.filter((r) => r !== target && r.split === 'training' && (r.startedAt || r.at) < (target.startedAt || target.at));
const seen = new Set(earlier.flatMap((r) => [...r.invented.ids, ...r.null.ids]));
const fresh = (ids) => ids.filter((t) => !seen.has(t));
console.log('earlier training runs read: ' + earlier.length + ' (' + earlier.map((r) => (r.variant || 'the bar') + (r.shape ? ' shape ' + r.shape : '')).join(', ') + ')');
console.log('6000 ms invented arm, solved in no earlier training run by either arm: ' + fresh(target.invented.ids).length + ' of ' + target.invented.solved + ' (' + fresh(target.invented.ids).join(', ') + ')');
console.log('6000 ms null arm, solved in no earlier training run by either arm: ' + fresh(target.null.ids).length + ' of ' + target.null.solved + ' (' + fresh(target.null.ids).join(', ') + ')');
