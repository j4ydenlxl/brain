// test/dead-share.mutants.mjs: mutants of the rules Board 23 item dead-share put in genome/emit.mjs
// (the wire rule wireBrain and wireMain, the census seed load both --wire and --prune go through,
// the two line rulers of --prune and --wire, and the prune's unread count; and from the fix pass the
// landing in place emitTarget, the rename retry, the prune record's rounds, the rebuilt wire history
// wireHistory and mergeWireHistory, and the chain deadShareChain), for test/census.test.mjs.
// Each mutant breaks one clause, and the suite must go red on every one.
//
// genome/emit.mjs is NEVER edited (other processes import it while this runs). Each mutant is a copy
// of it in a scratch directory, its relative imports and import.meta.url rewritten to the original
// file's absolute URLs, and a module.register resolve hook (NODE_OPTIONS=--import, so the test
// runner's child and any CLI it spawns get it too) serves that copy wherever genome/emit.mjs is
// imported. The copy writes a marker when it is loaded, so a mutant the suite never imported is
// counted as never ran, not as killed. Before any mutant: the suite must pass unmutated, and pass
// through the hook on an unmutated copy (the control: the rewrite and the redirect alone change
// nothing). A mutant counts as killed only when the file ran the same number of tests as the
// control and at least one failed (or was cancelled because a before hook threw).
//
//   node test/dead-share.mutants.mjs                 prints one row per mutant and the tally line
//   DEAD_SHARE_SCRATCH=<dir> node test/dead-share.mutants.mjs   (default test/.dead-share-mutants/<pid>)
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EMIT = path.join(ROOT, 'genome', 'emit.mjs');
const EMIT_URL = pathToFileURL(EMIT).href;
const SUITE = 'test/census.test.mjs';
const SCRATCH = path.resolve(process.env.DEAD_SHARE_SCRATCH || path.join(ROOT, 'test', '.dead-share-mutants'), String(process.pid));

// [from, to] pairs, each `from` found exactly once in genome/emit.mjs as it is on disk
const MUTANTS = [
  { name: 'a cell that delivered is wired too', parts: [['    if (delivers[i]) continue;\n', '    if (false) continue;\n']] },
  { name: 'a hosted cell is wired', parts: [['if (prot[i]) { counts.protectedSkipped++; continue; }', 'if (false) { counts.protectedSkipped++; continue; }']] },
  { name: 'a cell on a clock past the horizon is wired', parts: [['if (!readsMail(c)) { counts.clockSkipped++; continue; }', 'if (false) { counts.clockSkipped++; continue; }']] },
  { name: 'an event cell reads no mail', parts: [["  return p === 'event' || (typeof p === 'number' && p >= 1 && p <= horizon);", "  return (typeof p === 'number' && p >= 1 && p <= horizon);"]] },
  { name: 'a port a delivered edge reached is wired again', parts: [["      if (reached.has(i + ':' + dp)) continue;\n", '']] },
  { name: 'the subset rule is dropped', parts: [['        if (!d.cell.ports.out[d.sp].kinds.every((x) => inPort.kinds.includes(x))) continue;\n', '']] },
  { name: 'the claim of a port is dropped', parts: [['        if (owner !== undefined && owner !== d.key) continue;\n', '']] },
  { name: 'an edge already declared is declared again', parts: [["        if (have.has(d.s + ':' + i + ':' + d.sp + ':' + dp)) continue;\n", '']] },
  { name: 'a port that never delivered donates', parts: [["    if (!live.edges.has(e)) continue;\n    delivers[s] = 1; reached.add(ck);\n    const dk = s + ':' + sp;\n    if (!donorEdge.has(dk)) donorEdge.set(dk, e);\n", "    const dk = s + ':' + sp;\n    if (!donorEdge.has(dk)) donorEdge.set(dk, e);\n    if (!live.edges.has(e)) continue;\n    delivers[s] = 1; reached.add(ck);\n"]] },
  { name: 'the last delivered edge donates, not the first', parts: [['    if (!donorEdge.has(dk)) donorEdge.set(dk, e);\n', '    donorEdge.set(dk, e);\n']] },
  { name: 'the farthest donor is chosen', parts: [['if (bestRank === null || lexLess(rank, bestRank))', 'if (bestRank === null || lexLess(bestRank, rank))']] },
  { name: 'nearness is ignored (lowest index wins)', parts: [['const rank = [near, Math.abs(d.s - i), d.s, d.sp];', 'const rank = [0, 0, d.s, d.sp];']] },
  { name: 'the weight is not copied', parts: [['const w = k.w[e], delay = k.delay[e], conf = k.conf[e];', 'const w = k.w[e] * 0.5, delay = k.delay[e], conf = k.conf[e];']] },
  { name: 'the delay is not copied', parts: [['const w = k.w[e], delay = k.delay[e], conf = k.conf[e];', 'const w = k.w[e], delay = k.delay[e] + 1, conf = k.conf[e];']] },
  { name: 'the confidence is not copied', parts: [['const w = k.w[e], delay = k.delay[e], conf = k.conf[e];', 'const w = k.w[e], delay = k.delay[e], conf = 0.5;']] },
  { name: 'earlier wire rounds are dropped from the manifest', parts: [['  const prior = genome.wired ? (Array.isArray(genome.wired.rounds) ? genome.wired.rounds : [(({ rounds, ...r }) => r)(genome.wired)]) : [];', '  const prior = [];']] },
  { name: 'the fixed point in place rewrites the seed', parts: [['  if (wired.length === 0 && samePath(outDir, seedDir) && historyAdded === 0) {', '  if (false) {']] },
  { name: 'a census of another organism is accepted', parts: [['  if (census.live.manifestHash !== m.hash) throw', '  if (false) throw']] },
  { name: 'a stale import is emitted over', parts: [["    if (!v.ok) throw new Error(who + ': ' + seedDir + ' loaded content", "    if (false) throw new Error(who + ': ' + seedDir + ' loaded content"]] },
  { name: 'the prune sets the copy on the census ruler against the seed manifest count (the old print)', parts: [['  const linesAfter = back.manifest.counts && back.manifest.counts.lines;', '  const linesAfter = res.lines;']] },
  { name: 'the wire sets the copy on the census ruler against the seed manifest count', parts: [['after0 = back.manifest.counts && back.manifest.counts.lines;', 'after0 = res.lines;']] },
  { name: 'an in-place prune reads the census ruler before after the seed is replaced', parts: [
    ["  // the seed's census ruler is read now: a prune in place replaces the directory before the print\n  const censusBefore = censusLinesOf(seedDir);", '  let censusBefore = 0;'],
    ["  if (ok) res.dir = target.land(); else target.discard();\n  say('prune '", "  if (ok) res.dir = target.land(); else target.discard();\n  censusBefore = censusLinesOf(seedDir); lines.census.before = censusBefore; lines.census.removed = censusBefore - res.lines;\n  say('prune '"],
  ] },
  { name: 'the unread count reads the source cell, not the destination', parts: [['if (!readsMailWithin(pruned.cells[pk.dst[e]], horizon))', 'if (!readsMailWithin(pruned.cells[pk.src[e]], horizon))']] },
  // the fix pass (verify findings 4 and 5): the landing in place, the retry, the prune record, the rebuilt wire history, the chain
  { name: 'the land removes the seed before the staging takes its place', parts: [['      again(() => rename(outDir, replaced));\n', '      remove(outDir);\n']] },
  { name: 'the replaced seed is left behind after a landing', parts: [['      remove(replaced);\n      return outDir;', '      return outDir;']] },
  { name: 'a failed land does not put the seed back', parts: [['        try { again(() => rename(replaced, outDir)); } catch (err2) {', '        try { /* not put back */ } catch (err2) {']] },
  { name: 'what a run that died half way left is not cleared', parts: [['  if (exists(staging)) remove(staging);\n  if (exists(replaced)) remove(replaced);\n', '']] },
  { name: 'a rename refused for a moment is not retried', parts: [['      if (t >= tries || !TRANSIENT_RENAME.has(err && err.code)) throw err;', '      throw err;']] },
  { name: 'any refused rename is retried, whatever its code', parts: [['      if (t >= tries || !TRANSIENT_RENAME.has(err && err.code)) throw err;', '      if (t >= tries) throw err;']] },
  { name: 'the retry wait does not grow', parts: [['      wait = Math.min(maxMs, wait * 2);', '      wait = Math.min(maxMs, wait);']] },
  { name: 'the retry gives up after three tries', parts: [['export function retrying(fn, { tries = 12,', 'export function retrying(fn, { tries = 3,']] },
  { name: 'earlier prune rounds are dropped from the manifest', parts: [['pruned: { ...round, rounds: [...prior, round] } };', 'pruned: { ...round, rounds: [round] } };']] },
  { name: 'wire history takes two censuses of one seed for a round', parts: [['    if (a.v.live.manifestHash === b.v.live.manifestHash) throw', '    if (false) throw']] },
  { name: 'wire history takes a census taken before the one ahead of it', parts: [['    if (!(Date.parse(b.v.at) > Date.parse(a.v.at))) throw', '    if (false) throw']] },
  { name: 'wire history takes a round that changed the cells', parts: [['    if (b.v.cells.declared !== a.v.cells.declared) throw', '    if (false) throw']] },
  { name: 'wire history takes a census of another seed', parts: [['    if (seed !== null && v.seed !== seed) throw', '    if (false) throw']] },
  { name: 'what the prune kept is read from a prune by another census', parts: [['pruned.census.file && toPosix(pruned.census.file) === toPosix(last.file) && pruned.fromHash', 'pruned.census.file && pruned.fromHash']] },
  { name: 'what the prune kept is read from a prune of another seed', parts: [[' && pruned.fromHash === last.v.live.manifestHash\n', '\n']] },
  { name: 'rebuilt rounds the record holds are added again', parts: [['  const fresh = rebuilt.filter((r) => !have.has(r.fromHash));', '  const fresh = rebuilt;']] },
  { name: 'rebuilt rounds need not end where the record starts', parts: [['  if (firstRecorded && firstRecorded.fromHash !== end) throw', '  if (false) throw']] },
  { name: 'history added at the fixed point is not written', parts: [['  if (wired.length === 0 && samePath(outDir, seedDir) && historyAdded === 0) {', '  if (wired.length === 0 && samePath(outDir, seedDir)) {']] },
  { name: 'the chain gives the wire no history', parts: [["  const hist = history && history.length ? ['--wire-history', history.join(',')] : [];", '  const hist = [];']] },
  { name: 'the chain prunes a seed with nothing to drop', parts: [['  if (drop > 0 || rounds > 0) {', '  if (true) {']] },
];

const ORIGINAL = readFileSync(EMIT, 'utf8');
const HOOKS = `let from = null, to = null;
export async function initialize(data) { from = data.from; to = data.to; }
export async function resolve(specifier, context, next) {
  const r = await next(specifier, context);
  return r.url === from ? { ...r, url: to, shortCircuit: true } : r;
}
`;
// the copy runs from the scratch directory: every relative specifier and import.meta.url must name
// the original's location, or BRAIN_ROOT (and the loader path every emitted index.mjs imports) moves
function copyOf(src, marker) {
  const abs = (spec) => pathToFileURL(path.resolve(path.dirname(EMIT), spec)).href;
  let out = src.replace(/(\bfrom\s+|\bimport\(\s*)(['"])(\.{1,2}\/[^'"]+)\2/g, (m, pre, q, spec) => pre + q + abs(spec) + q);
  out = out.replaceAll('import.meta.url', JSON.stringify(EMIT_URL));
  return 'import { appendFileSync as __deadShareMark } from \'node:fs\';\n__deadShareMark(' + JSON.stringify(marker) + ', \'loaded\\n\');\n' + out;
}
function runSuite(env = {}) {
  const r = spawnSync(process.execPath, ['--max-old-space-size=2000', '--test', SUITE], { cwd: ROOT, encoding: 'utf8', timeout: 300_000, env: { ...process.env, ...env }, windowsHide: true });
  const out = (r.stdout || '') + (r.stderr || '');
  const num = (re) => Number((out.match(re) || [])[1]);
  return { status: r.status, tests: num(/ℹ tests (\d+)/), pass: num(/ℹ pass (\d+)/), fail: num(/ℹ fail (\d+)/), cancelled: num(/ℹ cancelled (\d+)/), red: [...new Set([...out.matchAll(/^\s*✖ (.+?) \(\d/gm)].map((x) => x[1]))], tail: out.split(/\r?\n/).filter((l) => l.startsWith('ℹ')).join(' ') };
}
function viaHook(tag, src) {
  const dir = path.join(SCRATCH, tag);
  mkdirSync(dir, { recursive: true });
  const marker = path.join(dir, 'loaded.txt');
  const mutant = path.join(dir, 'emit.mjs');
  writeFileSync(mutant, copyOf(src, marker));
  const check = spawnSync(process.execPath, ['--check', mutant], { encoding: 'utf8' });
  if (check.status !== 0) return { parse: false };
  const hooks = path.join(dir, 'hooks.mjs'), reg = path.join(dir, 'register.mjs');
  writeFileSync(hooks, HOOKS);
  writeFileSync(reg, "import { register } from 'node:module';\nregister(" + JSON.stringify(pathToFileURL(hooks).href) + ', { data: { from: ' + JSON.stringify(EMIT_URL) + ', to: ' + JSON.stringify(pathToFileURL(mutant).href) + ' } });\n');
  const r = runSuite({ NODE_OPTIONS: ((process.env.NODE_OPTIONS || '') + ' --import=' + pathToFileURL(reg).href).trim() });
  return { parse: true, loaded: existsSync(marker), ...r };
}

function main() {
  const base = runSuite();
  console.log('control, the suite as it is: exit ' + base.status + '; ' + base.tail);
  if (base.status !== 0 || !(base.tests > 0) || base.pass !== base.tests) { console.log('the unmutated suite is not green (red: ' + base.red.join(' | ') + '): no mutant is informative'); return 1; }
  const same = viaHook('identity', ORIGINAL);
  console.log('control, an unmutated copy through the hook: loaded ' + same.loaded + ', exit ' + same.status + '; ' + same.tail);
  if (!same.parse || !same.loaded || same.status !== 0 || same.tests !== base.tests || same.pass !== base.tests) { console.log('the redirect alone changes the suite (red: ' + (same.red || []).join(' | ') + '): no mutant is informative'); return 1; }
  let killed = 0, survived = 0, neverRan = 0;
  MUTANTS.forEach((m, j) => {
    let src = ORIGINAL, bad = null;
    for (const [from, to] of m.parts) {
      const n = ORIGINAL.split(from).length - 1;
      if (n !== 1) { bad = 'ANCHOR MATCHED ' + n + ' TIMES'; break; }
      src = src.replace(from, () => to);
    }
    if (src === ORIGINAL && !bad) bad = 'THE MUTATION CHANGED NOTHING';
    if (bad) { neverRan++; console.log('  ' + String(j + 1).padStart(2) + '. ' + m.name + ': ' + bad + ', never ran'); return; }
    const r = viaHook('m' + (j + 1), src);
    if (!r.parse) { neverRan++; console.log('  ' + String(j + 1).padStart(2) + '. ' + m.name + ': DOES NOT PARSE, never ran'); return; }
    if (!r.loaded) { neverRan++; console.log('  ' + String(j + 1).padStart(2) + '. ' + m.name + ': the suite never imported the mutant, never ran'); return; }
    if (r.tests !== base.tests) { neverRan++; console.log('  ' + String(j + 1).padStart(2) + '. ' + m.name + ': ran ' + r.tests + ' tests of ' + base.tests + ' (the file broke), not counted'); return; }
    // a before hook that throws marks its suite's tests cancelled, not failed: the suite is red either way
    if (r.fail > 0 || (r.cancelled > 0 && r.status !== 0)) { killed++; console.log('  ' + String(j + 1).padStart(2) + '. ' + m.name + ': KILLED, ' + r.fail + ' of ' + r.tests + ' fail' + (r.cancelled > 0 ? ' and ' + r.cancelled + ' cancelled (a before hook threw)' : '') + ': ' + r.red.filter((x) => !/^(wire|line rulers|prune|census|knockout|sharded|refusal)$/.test(x)).slice(0, 3).join(' | ')); }
    else { survived++; console.log('  ' + String(j + 1).padStart(2) + '. ' + m.name + ': SURVIVED, ' + r.pass + ' of ' + r.tests + ' pass'); }
  });
  console.log('mutants of the dead-share rules (genome/emit.mjs wire, census seed load, line rulers, unread count, landing in place, rename retry, prune record, wire history, chain): ' + killed + '/' + MUTANTS.length + ' fail at least one case of ' + SUITE + '; survived ' + survived + ', never ran ' + neverRan);
  return survived || neverRan ? 1 : 0;
}
let code = 1;
mkdirSync(SCRATCH, { recursive: true });
try { code = main(); } finally {
  rmSync(SCRATCH, { recursive: true, force: true });
  const parent = path.dirname(SCRATCH);
  try { if (existsSync(parent) && readdirSync(parent).length === 0) rmSync(parent, { recursive: true, force: true }); } catch { /* a parent another run shares */ }
}
process.exitCode = code;
