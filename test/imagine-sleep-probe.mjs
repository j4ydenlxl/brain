// test/imagine-sleep-probe.mjs: board 24a, a read only probe of the DreamCoder sleep over the solved
// programs of bench/verdicts/grid.json (the development corpus of the library arm). It prints and
// writes nothing; it is not a test (the gate runs test/*.test.mjs only).
//
//   node test/imagine-sleep-probe.mjs
import * as G from '../capability/grid-invent.mjs';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const gv = JSON.parse(readFileSync(path.join(ROOT, 'bench', 'verdicts', 'grid.json'), 'utf8'));
const solved = gv.rows.filter(r => r.solved && Array.isArray(r.names));
const timeouts = gv.rows.filter(r => r.status === 'timeout').map(r => r.id);
console.log('solved rows', solved.length, 'timeouts', timeouts.length, 'isTheBar', gv.isTheBar);
const f = [0,0]; for (const id of timeouts) f[G.foldOf(id)]++; console.log('folds', f);
const progs = solved.map(r => ({ id: r.id, steps: G.programSteps(r.names) })).filter(p => p.steps && p.steps.length);
console.log('programs with steps', progs.length, 'lengths', JSON.stringify(progs.reduce((m,p)=>{m[p.steps.length]=(m[p.steps.length]||0)+1;return m},{})));
const c = G.compressLibrary(progs, { lambda: 1 });
console.log('routines', c.routines.length, 'before', c.before, 'after', c.after);
for (const r of c.routines) console.log(' ', r.key, 'uses', r.uses, 'gain', r.gain);
const pr = G.libraryPrior(progs, c.routines, 1);
console.log('words', Object.entries(pr.words).sort((a,b)=>b[1]-a[1]).slice(0,15).map(([k,v])=>k+' '+v).join(', '));
console.log('distinct words used', Object.keys(pr.words).length);
