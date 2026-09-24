// Rewrites the two sentences in docs/PORTFOLIO.md that quote the gate (test files, assertions, authored
// and generated line counts) from bench/verdicts/gate.json. Run it after every gate and before
// tools/numbers.mjs, or the previous gate's counts stay in the document and docs-numbers reports them
// as numbers no verdict printed. It edits nothing else and refuses to run if a sentence has moved.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('../', import.meta.url));
const g = JSON.parse(fs.readFileSync(ROOT + 'bench/verdicts/gate.json', 'utf8'));
const n = (x) => x.toLocaleString('en-US');
const L = g.lines;
const reps = [
  [/GREEN on [\d,]+ test files with [\d,]+ assertions, [\d,]+ authored lines in [\d,]+ files, [\d,]+ generated organism lines in [\d,]+ files/,
   `GREEN on ${n(g.testsTotal)} test files with ${n(g.assertionsPassed)} assertions, ${n(L.code)} authored lines in ${n(L.codeFiles)} files, ${n(L.generated)} generated organism lines in ${n(L.generatedFiles)} files`],
  [/counts as [\d,]+ authored in [\d,]+ files and [\d,]+ generated in [\d,]+ files/,
   `counts as ${n(L.code)} authored in ${n(L.codeFiles)} files and ${n(L.generated)} generated in ${n(L.generatedFiles)} files`],
];
if (g.verdict !== 'GREEN') { console.error(`gate.json is ${g.verdict}; the document quotes only a green gate`); process.exit(1); }
const file = ROOT + 'docs/PORTFOLIO.md';
let t = fs.readFileSync(file, 'utf8');
let changed = 0;
for (const [re, to] of reps) {
  const m = t.match(re);
  if (!m) { console.error('no sentence matches ' + re); process.exit(1); }
  if (m[0] !== to) changed++;
  console.log('was:', m[0]);
  console.log('now:', to);
  t = t.replace(re, to);
}
fs.writeFileSync(file, t);
console.log(`gate ${g.verdict} at ${g.at}; sentences changed ${changed} of ${reps.length}`);
