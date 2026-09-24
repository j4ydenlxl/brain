// bench/prune.mjs: THE BAR of the prune item (Board 14). On a copy of the tree, prune the smallest
// pinned seed that has a census on disk, re-point it, and run its own tests and the gate there;
// with the same command in a control arm that copies the same tree and prunes nothing.
//
//   node tools/budget.mjs --ram-mb 6000 --disk-mb 2048 --dir <work> -- \
//     node --max-old-space-size=6000 bench/prune.mjs --work <work>
//
// Each arm is `node self/prune.mjs` in its own child under tools/budget.mjs (6000 MB RAM, 2048 MB
// disk on the work dir, waiting for 16 GB free RAM before it starts), one arm at a time, control
// first. It prints the seed and its census file, why each smaller seed was skipped, lines before
// and after, dead share before and after (each from a census's own printed line counts), the gate
// line on each copy, wall seconds, peak RSS, the run-to-run spread of the dead share at the same
// content and ruler, and the MB left after the work dir is deleted.
//
// BAR MET when the prune arm's gate on the copy is GREEN with the re-pointed seed loaded as the
// pruned content, and the dead share after is under the dead share before. The verdict is written
// once, when both arms have returned: bench/verdicts/prune.json, or prune-partial.json (isTheBar
// false) when an arm did not return a result.
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir, freemem } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { budget } from '../tools/budget.mjs';
import { pickSeed, gateIncludes, repeatsAt, censusRecords, freeDiskMb, INCLUDE_MAX_MB } from '../self/prune.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERDICTS = path.join(ROOT, 'bench', 'verdicts');
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const WORK = path.resolve(opt('work', path.join(tmpdir(), 'brain-prune-bench')));
const RAM_MB = 6000, DISK_MB = 2048, WAIT_FREE_MB = 16000;
const say = (l) => process.stdout.write(l + '\n');
const MB = 1024 * 1024;
const t0 = Date.now();
const at = new Date().toISOString();

say('PRUNE BENCH ' + at + ' node ' + process.version + '; work dir ' + WORK + '; free RAM ' + Math.round(freemem() / MB) + ' MB (os.freemem), free disk ' + freeDiskMb(tmpdir()) + ' MB');

// 1. the seed: the smallest pinned seed a census on disk can prune
const ps = pickSeed(ROOT);
if (!ps.pick) { say('no pinned seed has a census on disk with liveness bits at its hash; nothing to prune'); process.exitCode = 1; }
const pick = ps.pick;
const pickLines = pick ? pick.lines : Infinity;
for (const c of ps.considered.filter((x) => (x.lines ?? Infinity) < pickLines)) say('  skipped ' + c.seed + ' (' + c.lines + ' lines): ' + c.reason);
if (pick) say('seed ' + pick.seed + ' (' + pick.lines + ' lines, the smallest pinned seed with a usable census), census bench/verdicts/' + pick.census + ': ' + pick.dead.cells + ' cells and ' + pick.dead.edges + ' edges dead');

// 2. what the gate's tests read that a trial copy leaves out
const inc = gateIncludes(ROOT);
say('include ' + inc.include.length + ' path(s) named by ' + inc.scanned + ' authored files, ' + inc.mb + ' MB: ' + inc.include.join(', ') + (inc.tooBig.length ? '; over ' + INCLUDE_MAX_MB + ' MB and left out: ' + inc.tooBig.join(', ') : ''));
say('outside the tree, copied beside the copy: ' + (inc.outside.join(', ') || 'none') + ' (' + inc.outsideMb + ' MB)');

// 3. the arms, one at a time, each under its own budget
async function arm(name, control) {
  const out = path.join(WORK, 'out', name + '.json');
  const record = path.join(WORK, 'out', name + '.budget.json');
  const args = ['--max-old-space-size=' + RAM_MB, path.join(ROOT, 'self', 'prune.mjs'), '--seed', pick.seed, '--census', 'bench/verdicts/' + pick.census,
    ...(control ? ['--control'] : []), '--include', inc.include.join(','), '--outside', inc.outside.join(','), '--work', path.join(WORK, 'copies'), '--out', out];
  say('ARM ' + name + ': node ' + args.map((a) => path.isAbsolute(a) ? path.relative(ROOT, a).replaceAll('\\', '/') || '.' : a).join(' '));
  const rec = await budget(process.execPath, args, { ramMb: RAM_MB, diskMb: DISK_MB, dir: WORK, record, waitFreeRamMb: WAIT_FREE_MB, cwd: ROOT, statusMs: 120000, log: (l) => say('  ' + l) });
  let r = null;
  if (existsSync(out)) { try { r = JSON.parse(readFileSync(out, 'utf8')); } catch (e) { say('  ' + name + ' result does not parse: ' + e.message); } }
  return { name, control, r, budget: { outcome: rec.outcome, exitCode: rec.exitCode, peakRssMb: rec.peakRssMb, peakDirMb: rec.peakDirMb, wallS: rec.wallS, cpuSeconds: rec.cpuSeconds, freeRamMbAtStart: rec.freeRamMbAtStart, killed: rec.killed ? { which: rec.killed.which } : null } };
}

let ctl = null, prn = null;
if (pick) {
  mkdirSync(path.join(WORK, 'out'), { recursive: true });
  ctl = await arm('control', true);
  prn = await arm('prune', false);
}

// 4. the noise: every census on disk at the same content and ruler, before and after
const pr = prn && prn.r;
const cr = ctl && ctl.r;
const beforeHash = pr && pr.repoint ? pr.repoint.hashBefore : null;
const afterHash = pr && pr.prune ? pr.prune.hash : null;
const ruler = pr && pr.census ? pr.census.ruler : null;
const noiseBefore = beforeHash ? repeatsAt(VERDICTS, beforeHash, ruler) : null;
const noiseAfter = afterHash ? repeatsAt(VERDICTS, afterHash, ruler) : null;
// every ruler that measured the content before (ticks and modes differ): the band the ruler choice spans
const band = beforeHash ? censusRecords(VERDICTS).filter((x) => x.hash === beforeHash && x.deadShare !== null && !x.carriedFrom).map((x) => ({ file: x.file, ruler: x.ruler, deadShare: x.deadShare })) : [];

// 5. the work dir goes, and the deletion is checked
let workGone = false, cleanupError = null;
try { rmSync(WORK, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); workGone = !existsSync(WORK); } catch (e) { cleanupError = String(e.message || e); }
const mbLeft = freeDiskMb(tmpdir());

// 6. the printed lines
const f6 = (x) => (x === null || x === undefined ? 'n/a' : String(x));
const pct = (x) => (x === null || x === undefined ? 'n/a' : (x * 100).toFixed(4) + '%');
for (const a of [ctl, prn].filter(Boolean)) {
  const r = a.r;
  say('--- ' + a.name + (a.control ? ' (the same copy, nothing pruned)' : ''));
  if (!r) { say('  NO RESULT: budget outcome ' + a.budget.outcome + ', exit ' + a.budget.exitCode); continue; }
  say('  decision ' + r.decision + (r.reason ? ' (' + r.reason + ')' : ''));
  say('  copy ' + (r.copy ? r.copy.mb + ' MB (' + r.copy.includedMb + ' MB included), made in ' + r.copy.ms + ' ms' : 'n/a'));
  if (!a.control) {
    say('  lines before ' + r.linesBefore + ', after ' + f6(r.linesAfter) + ' (manifest counts.lines); cells ' + (r.prune ? r.prune.cells.before + ' -> ' + r.prune.cells.after : 'n/a') + ', edges ' + (r.prune ? r.prune.edges.before + ' -> ' + r.prune.edges.after : 'n/a'));
    say('  dead share before ' + f6(r.deadShareBefore) + ' (' + r.census.file + ': ' + r.census.lines.loadBearing + ' of ' + r.census.lines.loaded + ' loaded lines load bearing), after ' + f6(r.deadShareAfter) + (r.after ? ' (' + r.after.file + ': ' + r.after.lines.loadBearing + ' of ' + r.after.lines.loaded + ', ' + (r.after.sameRuler ? 'the same ruler' : 'ANOTHER ruler') + ')' : ''));
    say('  load ' + (r.load ? (r.load.ok ? 'verify ok, ' + r.load.cells + ' cells, ' + r.load.edges + ' edges, hash ' + String(r.load.hash).slice(0, 12) + (r.load.pruned ? ', the pruned content' : ', NOT the pruned content') + ', ' + r.load.ms + ' ms' : 'FAILED ' + (r.load.error || '')) : 'n/a'));
    say('  pruned dir ' + f6(r.prunedDir) + (r.prunedOnReal ? '; the real tree holds ' + r.prunedOnReal.dir + (r.prunedOnReal.exists ? ' at hash ' + String(r.prunedOnReal.hash).slice(0, 12) + (r.prunedOnReal.sameHash ? ' (the SAME content as the copy\'s)' : ' (a different content)') : ': no') : ''));
    say('  patch ' + (r.repoint ? r.repoint.patchLines + ' lines over ' + r.repoint.files.join(' and ') : 'n/a') + (r.carried ? '; carried census ' + r.carried.file + ' from ' + r.carried.from + ' (on the copy only)' : ''));
  }
  for (const t of r.tests || []) say('  own test ' + t.file + ': exit ' + t.exit + ', ' + t.pass + '/' + t.total + ' in ' + t.ms + ' ms');
  say('  gate on the copy: ' + (r.gate ? (r.gate.summary || r.gate.verdict + ' (no summary line)') + ' [' + (r.gate.ms / 1000).toFixed(1) + ' s]' : 'not run'));
  if (r.gate && r.gate.loadBearing) say('    ' + r.gate.loadBearing);
  if (r.gate && r.gate.red && r.gate.red.length) say('    red: ' + r.gate.red.join(', '));
  say('  cleanup: copy organism/ ' + (r.cleanup && r.cleanup.organismDeleted ? 'deleted' : 'NOT deleted') + ', copy ' + (r.cleanup && r.cleanup.copyDeleted ? 'deleted' : 'NOT deleted') + '; real tree ' + (r.real ? (r.real.same ? 'unchanged' : 'CHANGED') + ' (' + r.real.watched.join(', ') + ': ' + r.real.before.slice(0, 12) + ' before, ' + r.real.after.slice(0, 12) + ' after)' : 'n/a'));
  say('  wall ' + a.budget.wallS + ' s, peak RSS ' + a.budget.peakRssMb + ' MB (the arm\'s whole process tree), peak work dir ' + a.budget.peakDirMb + ' MB, budget ' + a.budget.outcome + ' exit ' + a.budget.exitCode);
}
if (noiseBefore) say('noise: ' + noiseBefore.n + ' census(es) at hash ' + beforeHash.slice(0, 12) + ' with the ' + ruler.mode + ' ' + ruler.ticks + '-tick ruler give dead share ' + noiseBefore.min + ' to ' + noiseBefore.max + ' (spread ' + noiseBefore.spread + '): ' + noiseBefore.files.map((x) => x.file).join(', '));
if (noiseAfter) say('noise: ' + noiseAfter.n + ' census(es) at hash ' + afterHash.slice(0, 12) + ' with the same ruler give ' + noiseAfter.min + ' to ' + noiseAfter.max + ' (spread ' + noiseAfter.spread + '): ' + noiseAfter.files.map((x) => x.file + ' ' + x.lines.loadBearing + '/' + x.lines.loaded).join(', '));
if (band.length) say('ruler band at hash ' + beforeHash.slice(0, 12) + ': dead share ' + Math.min(...band.map((b) => b.deadShare)) + ' to ' + Math.max(...band.map((b) => b.deadShare)) + ' over ' + band.length + ' census(es) of every mode and tick count');
say('work dir ' + WORK + (workGone ? ' deleted (checked with existsSync)' : ' NOT deleted' + (cleanupError ? ': ' + cleanupError : '')) + '; ' + mbLeft + ' MB left on the disk of ' + tmpdir());

// 7. the bar
const partial = !pr || !cr;
const gateGreen = !!(pr && pr.gate && pr.gate.verdict === 'GREEN');
const loaded = !!(pr && pr.load && pr.load.pruned);
const under = !!(pr && pr.deadShareAfter !== null && pr.deadShareBefore !== null && pr.deadShareAfter < pr.deadShareBefore);
const drop = pr && under ? Math.round((pr.deadShareBefore - pr.deadShareAfter) * 1e6) / 1e6 : null;
const realSame = !!(pr && pr.real && pr.real.same && cr && cr.real && cr.real.same);
const cleaned = !!(workGone && [pr, cr].every((r) => r && r.cleanup && r.cleanup.organismDeleted && r.cleanup.copyDeleted));
const barMet = !partial && gateGreen && loaded && under;
const peakRssMb = Math.max(...[ctl, prn].filter(Boolean).map((a) => a.budget.peakRssMb || 0), 0);
const wallS = Math.round((Date.now() - t0) / 100) / 10;
say('BAR ' + (barMet ? 'MET' : 'NOT MET') + ': gate on the copy with ' + (pick ? pick.seed : 'no seed') + ' re-pointed ' + (pr && pr.gate ? pr.gate.verdict : 'n/a') + (loaded ? ' (the pruned content loaded)' : ' (the pruned content NOT loaded)') + '; dead share ' + f6(pr && pr.deadShareBefore) + ' -> ' + f6(pr && pr.deadShareAfter) + (drop !== null ? ', down ' + drop + ' (' + pct(drop) + ' of loaded lines)' : '') + '; control gate ' + (cr && cr.gate ? cr.gate.verdict : 'n/a') + '; real tree ' + (realSame ? 'unchanged' : 'CHANGED or unread') + '; wall ' + wallS + ' s; peak RSS ' + peakRssMb + ' MB; ' + mbLeft + ' MB left');

const statement = !pr ? 'The prune arm returned no result, so nothing was measured on a copy; this record is partial.'
  : 'On a copy of the tree (its root named brain) that left out state/, .git/, bench/fixtures/ and web/dist/ (bar ' + inc.include.length + ' paths the authored code names, ' + inc.mb + ' MB) and every seed under organism/ but ' + pick.seed + ', with ' + (inc.outside.join(', ') || 'nothing') + ' copied beside it (' + inc.outsideMb + ' MB), self/prune.mjs decoded the liveness bitsets of bench/verdicts/' + pick.census
    + ' (popcount equal to the recorded count for cells and edges), pruned ' + pick.seed + ' with the copy\'s own genome/emit.mjs into ' + f6(pr.prunedDir) + ' (' + pr.linesBefore + ' manifest lines before, ' + f6(pr.linesAfter) + ' after) and re-pointed the seed\'s index.mjs and manifest.json to it, a ' + (pr.repoint ? pr.repoint.patchLines : 'n/a') + ' line patch.'
    + ' The re-pointed seed ' + (loaded ? 'loaded and verified as the pruned content' : 'did NOT load as the pruned content') + ', its own tests ' + ((pr.tests || []).every((t) => t.exit === 0) ? 'passed' : 'FAILED') + ', and the gate on the copy printed "' + (pr.gate ? pr.gate.summary : 'nothing') + '".'
    + ' The dead share, one minus load-bearing over loaded lines, is ' + f6(pr.deadShareBefore) + ' by ' + pr.census.file + ' and ' + f6(pr.deadShareAfter) + ' by ' + (pr.after ? pr.after.file + ', a census of the pruned content hash with the same ruler' : 'no census') + (noiseBefore ? '; ' + noiseBefore.n + ' censuses of the content before and ' + (noiseAfter ? noiseAfter.n : 0) + ' of the content after with that ruler spread ' + noiseBefore.spread + ' and ' + (noiseAfter ? noiseAfter.spread : 'n/a') : '') + '.'
    + ' The control arm made the same copy and pruned nothing; its gate printed "' + (cr && cr.gate ? cr.gate.summary : 'nothing') + '".'
    + ' The real tree\'s seed, census and pruned directory hashed the same before and after both arms: ' + (realSame ? 'yes' : 'NO') + '. The work dir was deleted: ' + (workGone ? 'yes' : 'NO') + '. Author: board 14 builder.';

const verdict = {
  bench: 'prune', at, command: 'node ' + process.argv.slice(1).map((a) => path.isAbsolute(a) ? path.relative(ROOT, a).replaceAll('\\', '/') : a).join(' '),
  launch: 'node tools/budget.mjs --ram-mb 6000 --disk-mb 2048 --dir <work> -- node --max-old-space-size=6000 bench/prune.mjs --work <work>',
  node: process.version, isTheBar: !partial, barMet: partial ? false : barMet,
  split: {
    development: 'a planted seed (test/prune-plant.mjs: organism/tiny, 96 cells, a census bitset planted by a fixed rule) under a temp directory: self/prune.mjs was built and graded there by test/prune.test.mjs',
    heldOut: pick ? pick.seed + ' by bench/verdicts/' + pick.census + ', measured by this bench on a trial copy' : 'none',
    control: 'the same command with --control: the same copy, no prune, no re-point, the same own tests and gate',
  },
  seed: pick ? pick.seed : null, censusFile: pick ? 'bench/verdicts/' + pick.census : null,
  skipped: ps.considered.filter((x) => (x.lines ?? Infinity) < pickLines).map((x) => ({ seed: x.seed, lines: x.lines, reason: x.reason })),
  include: inc,
  bar: { gateGreen, loadedPruned: loaded, deadShareUnder: under, drop, realTreeUnchanged: realSame, cleanedUp: cleaned },
  linesBefore: pr ? pr.linesBefore : null, linesAfter: pr ? pr.linesAfter : null,
  deadShareBefore: pr ? pr.deadShareBefore : null, deadShareAfter: pr ? pr.deadShareAfter : null,
  censusBefore: pr ? pr.census : null, censusAfter: pr ? pr.after : null,
  gate: pr ? pr.gate : null, controlGate: cr ? cr.gate : null,
  load: pr ? pr.load : null, tests: pr ? pr.tests : null, controlTests: cr ? cr.tests : null,
  prunedDir: pr ? pr.prunedDir : null, prunedOnReal: pr ? pr.prunedOnReal : null, carried: pr ? pr.carried : null,
  prune: pr ? pr.prune : null, repoint: pr ? pr.repoint : null, real: pr ? pr.real : null, controlReal: cr ? cr.real : null,
  noise: { before: noiseBefore, after: noiseAfter, rulerBand: band },
  arms: [ctl, prn].filter(Boolean).map((a) => ({ name: a.name, control: a.control, decision: a.r ? a.r.decision : null, ms: a.r ? a.r.ms : null, copy: a.r ? a.r.copy : null, cleanup: a.r ? a.r.cleanup : null, budget: a.budget })),
  wallS, peakRssMb, workDir: WORK, workDeleted: workGone, mbLeft,
  patch: pr ? pr.patch : null,
  statement,
};
const file = path.join(VERDICTS, partial ? 'prune-partial.json' : 'prune.json');
writeFileSync(file, JSON.stringify(verdict, null, 2) + '\n');
say('verdict ' + path.relative(ROOT, file).replaceAll('\\', '/') + ' (isTheBar ' + verdict.isTheBar + ', barMet ' + verdict.barMet + ')');
process.exitCode = partial ? 1 : 0;
