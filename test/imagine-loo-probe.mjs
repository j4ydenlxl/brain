// An analysis script of the imagine item (notes/imagine.md quotes what it printed). Not a test:
// the gate runs test/*.test.mjs only. It reads, prints, and writes nothing.
// Probe: would a leave one out check on the final learner separate the found programs that were
// right from those that were wrong? Rebuilds every found program in the given verdicts, checks the
// rebuild reproduces the recorded right or wrong (the control), then refits the last learner on
// all train pairs but one and asks it to predict the pair left out.
//   node test/imagine-loo-probe.mjs bench/verdicts/imagine.json [verdict.json ...]
import { readFileSync } from 'node:fs';
const ROOT = new URL('../', import.meta.url);
const G = await import(new URL('capability/grid-invent.mjs', ROOT).href);
const D = await import(new URL('capability/grid-dsl.mjs', ROOT).href);
const LEARNER = new Map(D.LEARNERS.map((l) => [l.name, l]));

export function parseKey(str) {
  let i = 0;
  const ident = () => { const m = /^[A-Za-z0-9_]+/.exec(str.slice(i)); if (!m) throw new Error('ident at ' + i + ' in ' + str); i += m[0].length; return m[0]; };
  const expect = (c) => { if (str[i] !== c) throw new Error('expected ' + c + ' at ' + i + ' in ' + str); i++; };
  const list = (item) => { const xs = [item()]; while (str[i] === ',') { i++; xs.push(item()); } return xs; };
  const spec = () => {
    const name = ident();
    if (name === 'id') return null;
    if (name === 'chain') { expect('('); const ops = list(ident); expect(')'); return { k: 'chain', ops }; }
    if (name === 'each') { expect('.'); const mode = ident(); expect('('); const f = spec(); expect(')'); return { k: 'each', mode, f }; }
    if (name === 'cells' || name === 'layers' || name === 'fix') { expect('('); const f = spec(); expect(')'); return { k: name, f }; }
    if (name === 'both') { expect('.'); const how = ident(); expect('('); const f = spec(); expect(','); const g = spec(); expect(')'); return { k: 'both', how, f, g }; }
    if (name === 'quad') { expect('('); const fs = list(spec); expect(')'); return { k: 'quad', fs }; }
    if (name === 'sel') { expect('.'); const mode = ident(); expect('.'); const pick = ident(); expect('('); const f = spec(); expect(')'); return { k: 'sel', mode, pick, f }; }
    return { k: 'op', op: name };
  };
  const s = spec();
  if (i !== str.length) throw new Error('trailing text in ' + str);
  return s;
}

const tally = {};
const bump = (k) => { tally[k] = (tally[k] || 0) + 1; };
const detail = [];
for (const file of process.argv.slice(2)) {
  const v = JSON.parse(readFileSync(file, 'utf8'));
  const split = v.split;
  for (const row of v.rows) for (const arm of ['invented', 'null']) {
    const x = row[arm];
    if (!x || x.status !== 'found' || !x.names) continue;
    const json = JSON.parse(readFileSync(new URL('bench/fixtures/public/arc-agi-1/' + split + '/' + row.id + '.json', ROOT), 'utf8'));
    const task = G.arcTask(json);
    const n = task.train.length;
    let vals = task.train.map((p) => p.input).concat(task.test.map((t) => t.input));
    const names = x.names.slice();
    const last = names[names.length - 1];
    const L = LEARNER.get(last) || null;
    const body = L ? names.slice(0, -1) : names;
    let ok = true;
    for (const nm of body) {
      if (nm.startsWith('inv:')) {
        const key = nm.slice(4), spec = parseKey(key);
        if (G.specKey(spec) !== key) { ok = false; break; }
        vals = vals.map((g) => (g ? G.runSpec(spec, g) : null));
      } else if (LEARNER.has(nm)) { ok = false; break; } else vals = vals.map((g) => (g ? D.applyStep({ op: nm }, g) : null));
      if (vals.some((g) => !g)) { ok = false; break; }
    }
    if (!ok) { bump('rebuild failed'); continue; }
    const tr = vals.slice(0, n), te = vals.slice(n), wanted = task.train.map((p) => p.output);
    let outs;
    if (L) {
      const params = L.learn(tr, wanted, te);
      if (!params) { bump('rebuild failed'); continue; }
      outs = te.map((g) => D.applyStep({ op: L.name, learned: params }, g));
    } else outs = te;
    const right = task.test.every((t, i) => t.output && outs[i] && D.sameGrid(outs[i], t.output));
    if (right !== !!x.solved) { bump('rebuild disagrees with the record'); continue; }
    if (!L) { bump((right ? 'right' : 'wrong') + ', no learner'); continue; }
    let held = 0;
    for (let i = 0; i < n; i++) {
      const trX = tr.filter((_, j) => j !== i), wX = wanted.filter((_, j) => j !== i);
      let p = null;
      try { p = L.learn(trX, wX, [tr[i]]); } catch { p = null; }
      const g = p ? D.applyStep({ op: L.name, learned: p }, tr[i]) : null;
      if (g && D.sameGrid(g, wanted[i])) held++;
    }
    const loo = held === n ? 'passes' : held === 0 ? 'fails every pair' : 'fails some pairs';
    bump((right ? 'right' : 'wrong') + ', ' + L.name + ', leave one out ' + loo);
    detail.push([split, row.id, arm, right ? 'right' : 'wrong', L.name, held + '/' + n].join(' '));
  }
}
for (const [k, c] of Object.entries(tally).sort()) console.log(String(c).padStart(4) + '  ' + k);
if (process.env.DETAIL) for (const d of detail) console.log('  ' + d);
