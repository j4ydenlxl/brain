// An analysis script of the imagine item (notes/imagine.md quotes what it printed). Not a test:
// the gate runs test/*.test.mjs only. It reads, prints, and writes nothing.
// Within one doubt run, the answer without doubt is the fallback (searchWith returns its first fit,
// which doubt keeps aside instead). So doubt changed an answer only where a task doubted and did not
// end on the fallback. Lists those, and the doubt count of every task gained or lost against the run
// without doubt.   node test/imagine-doubt-changed.mjs without.json with.json
import { readFileSync } from 'node:fs';
const [A, B] = process.argv.slice(2).map((f) => new Map(JSON.parse(readFileSync(f, 'utf8')).rows.map((r) => [r.id, r])));
for (const arm of ['invented', 'null']) {
  const changed = [], moved = [];
  for (const [id, rb] of B) {
    const x = rb[arm] || {}, a = (A.get(id) || {})[arm] || {};
    if (x.doubted > 0 && !x.fromFallback) changed.push(id + ' (' + (x.solved ? 'solved' : x.status === 'found' ? 'wrong' : x.status) + ')');
    if (!!x.solved !== !!a.solved) moved.push(id + ' ' + (x.solved ? 'gained' : 'lost') + ', doubted ' + (x.doubted || 0));
  }
  console.log(arm + ': answers doubt changed (doubted, not ended on the fallback): ' + changed.length + (changed.length ? ' (' + changed.join(', ') + ')' : ''));
  console.log(arm + ': tasks gained or lost against the run without doubt: ' + (moved.join('; ') || 'none'));
}
