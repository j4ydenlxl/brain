// judge/baseline.mjs: THE ORGANISM BEFORE THE CELL. Runs the organism over a class's held-out rows and grades it
// with the locked judge, so judge/select.mjs can ask "better than the organism did before it" (his loop, step 4).
//   node judge/baseline.mjs <class> [--out <file>] [--knowledge <dir>|none]
// The organism is act/prompt.mjs ask() on a fresh seeds/basic.mjs brain (the one act/ask-http.mjs builds for the
// site), provider "null" (no model, no socket), k 5, knowledge bench/fixtures/wiki/pack-200 when that directory
// exists (the pack the function ships). The grown survivors (grown/index.mjs) are on its path: a prompt ask()
// refuses is offered to grownAnswer(q), which is what ask() does itself once it consults grown/ (item misses).
// Writes { class, at, n, ok, score, rows: [{ q, got, ok, route, via }], heldoutSha, organism, organismPrint,
// knowledge, grown } to state/grow/baseline/<class>.json by default and prints one JSON line. organismPrint is
// judge/select.mjs organismPrint(): grown/ and the import closure of act/prompt.mjs and seeds/basic.mjs, taken
// before and after the run (a change in between fails the run); select refuses a baseline whose print is not the
// organism's now, so after a promotion the loop runs this again. The organism on his PC is allowed here: it is
// not a candidate.
// Author: board 37 builder, item judge, 2026-09-30.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseJsonl, REFUSAL_RE } from '../grow/contract.mjs';
import { score } from './judge.mjs';
import { shaFile } from './verify.mjs';
import { CLASS_RE, baselineFile, organismPrint } from './select.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
export const PACK = path.join(ROOT, 'bench', 'fixtures', 'wiki', 'pack-200');
export const ORGANISM = 'act/prompt.mjs ask() on seeds/basic.mjs seedBasic, provider null, k 5, then grown/index.mjs grownAnswer on a refusal';
const USAGE = 'usage: node judge/baseline.mjs <class> [--out <file>] [--knowledge <dir>|none]';
const relPath = (f) => path.relative(ROOT, f).split(path.sep).join('/');

/** Run the organism over rows. @returns {Promise<{ q, got, route, via }[]>} */
export async function runOrganism(rows, { knowledge } = {}) {
  const { ask, closeKnowledge } = await import(pathToFileURL(path.join(ROOT, 'act', 'prompt.mjs')).href);
  const { seedBasic } = await import(pathToFileURL(path.join(ROOT, 'seeds', 'basic.mjs')).href);
  let grownAnswer = () => null, grownN = 0;
  try {
    const g = await import(pathToFileURL(path.join(ROOT, 'grown', 'index.mjs')).href);
    if (typeof g.grownAnswer === 'function') grownAnswer = g.grownAnswer;
    grownN = Array.isArray(g.GROWN) ? g.GROWN.length : 0;
  } catch { /* no grown/ on this checkout: the organism without survivors */ }
  const brain = seedBasic({ name: 'judge-baseline', ledger: 'off' });
  const out = [];
  for (const row of rows) {
    const a = await ask(brain, row.q, { provider: 'null', k: 5, events: [], ...(knowledge !== undefined ? { knowledge } : {}) });
    let got = a && typeof a.text === 'string' ? a.text : null;
    let via = 'ask';
    if (got === null || REFUSAL_RE.test(got.trim())) {
      let g = null;
      try { g = grownAnswer(row.q); } catch { g = null; }
      if (g && typeof g.answer === 'string' && g.answer.trim()) { got = g.answer; via = 'grown:' + g.id; }
    }
    out.push({ q: row.q, got, route: (a && a.route) || null, via });
  }
  try { if (typeof closeKnowledge === 'function') closeKnowledge(); } catch { /* best effort */ }
  return { rows: out, grown: grownN };
}

/** Measure a class. @returns {Promise<object>} the baseline document */
export async function baseline(cls, { knowledge, at } = {}) {
  const file = path.join(ROOT, 'judge', 'heldout', cls + '.jsonl');
  if (!fs.existsSync(file)) throw new Error('no held-out set for class ' + cls + ' (judge/heldout/' + cls + '.jsonl)');
  const rows = parseJsonl(fs.readFileSync(file, 'utf8'));
  const k = knowledge === 'none' ? false : knowledge ? path.resolve(knowledge) : (fs.existsSync(PACK) ? PACK : undefined);
  const before = organismPrint(ROOT);
  const run = await runOrganism(rows, { knowledge: k });
  const after = organismPrint(ROOT);
  if (before.grownSha !== after.grownSha || before.codeSha !== after.codeSha) throw new Error('the organism changed while it was measured (grown/ or the code of act/prompt.mjs): run it again');
  const s = score(rows, run.rows);
  const okBy = new Map(s.rows.map((r) => [r.q, r.ok]));
  return {
    class: cls, at: at || new Date().toISOString(), n: s.n, ok: s.ok, score: s.score,
    rows: run.rows.map((r) => ({ q: r.q, got: r.got, ok: okBy.get(r.q) === true, route: r.route, via: r.via })),
    heldoutSha: shaFile(ROOT, 'judge/heldout/' + cls + '.jsonl'), organism: ORGANISM, organismPrint: before,
    knowledge: k === false ? 'none' : k ? relPath(k) : 'act/prompt.mjs KNOWLEDGE_DIR (default)', grown: run.grown,
  };
}

async function main(argv) {
  if (argv.includes('--help') || argv.includes('-h')) { console.log(USAGE); return 0; }
  const opts = {};
  const pos = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out' || a === '--knowledge') {
      if (!argv[i + 1]) { console.log(a + ' needs a value. ' + USAGE); return 2; }
      opts[a.slice(2)] = argv[++i];
    } else if (a.startsWith('--')) { console.log('unknown option ' + a + '. ' + USAGE); return 2; } else pos.push(a);
  }
  if (pos.length !== 1 || !CLASS_RE.test(pos[0])) { console.log('one <class> is needed (a-z, 0-9, -). ' + USAGE); return 2; }
  const cls = pos[0];
  try {
    const doc = await baseline(cls, { knowledge: opts.knowledge });
    const out = path.resolve(opts.out || baselineFile(ROOT, cls));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(doc, null, 2) + '\n');
    console.log(JSON.stringify({ class: cls, n: doc.n, ok: doc.ok, score: doc.score, knowledge: doc.knowledge, grown: doc.grown, generation: doc.organismPrint.generation, codeFiles: doc.organismPrint.files, out: relPath(out) }));
    return 0;
  } catch (e) {
    console.log('baseline failed: ' + String((e && e.message) || e).split('\n')[0]);
    return 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then((c) => process.exit(c), (e) => { console.log('baseline failed: ' + String((e && e.message) || e)); process.exit(1); });
}
