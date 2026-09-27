// bench/census-round.mjs: THE BAR OF THE CENSUS LOOP (board 23 builder, item census-loop).
//
// His order (2026-09-24 12:02): "Its gotta work without me ... EVERY GAP should be able to be filled
// by itself". self/autopilot.mjs runSoak now calls self/census-round.mjs soakCensus once per soak
// cycle, after the ledger rows are read, and promotes a spawned cell into the organism the soak keeps
// only when its bench improved AND the census says it ran on an item the bench gained. This bench is
// the bar of that wiring, run as the loop runs it: the CLI, one soak cycle each.
//
//   node tools/budget.mjs --ram-mb 4000 --disk-mb 400 --dir <copy> -- node --max-old-space-size=4000 bench/census-round.mjs
//
// What it does, model off (the soak runs --author off, the census asks through provider null, no
// socket, Ollama never started):
//   1. two identical copies of this tree under <copy> (the tree's own copy rule, self/improve.mjs
//      COPY_EXCLUDE, plus the credential files and viz/, with bench/fixtures/public put back: the
//      ARC item source reads it), each with THE SAME seeded organism (seeds/basic.mjs, as
//      `brain init` seeds one) at state/dilation/snapshot.json. The live state/ is never read.
//   2. THE CONTROL first: `node bin/brain.mjs self-code --auto --soak 2 --author off --gate-after off
//      --census-round off --json` in the off copy. Then THE ROUND: the same command without
//      --census-round off in the on copy. Every temp file of both soaks lives under <copy>.
//   3. From what each soak reported (its JSON answer, cross-checked against the record it wrote,
//      state/self/soak-<runId>.json): rounds, arms spawned, cells spawned, kept, discarded, promoted.
//   4. Against the control: every bench a kept cell came from is graded on the organism each soak
//      kept (the development items that decided the keep, spawnAsk with growth off, one shared plan
//      cache), on minus off, and the firing census says on how many of the items the on organism
//      gained over the control each kept cell ran.
//   5. bench/verdicts/census-round.json: isTheBar true; barMet only when kept > 0 AND every kept
//      cell's bench prints a delta above 0 against the control.
// The copies are deleted at the end (--keep keeps them). Options: --dir PATH (default
// $CENSUS_ROUND_DIR or <os temp>/brain-census-round), --soak N (default 2), --keep, --no-write.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, readdirSync, statSync, lstatSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { COPY_EXCLUDE } from '../self/improve.mjs';
import { itemsFor, cellsScore, ranOnGained, restore, censusLine } from '../self/census-round.mjs';
import { seedBasic } from '../seeds/basic.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERDICT_REL = 'bench/verdicts/census-round.json';
export const BAR_COMMAND = 'node tools/budget.mjs --ram-mb 4000 --disk-mb 400 --dir <copy> -- node --max-old-space-size=4000 bench/census-round.mjs';
// never copied: the tree's own copy rule, the credentials (never opened), the visualisations
const NEVER = Object.freeze([...COPY_EXCLUDE, '.vercel', '.env.local', '.claude', 'viz']);
// put back under bench/fixtures: the ARC item source (bench/grid.mjs) and the control rows (bench/answer.mjs)
const PUT_BACK = Object.freeze(['bench/fixtures/public', 'bench/fixtures/answer-questions.json']);

const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf(k); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : null; };
const DIR = path.resolve(opt('--dir') || process.env.CENSUS_ROUND_DIR || path.join(os.tmpdir(), 'brain-census-round'));
const SOAK_MIN = Number(opt('--soak')) > 0 ? Number(opt('--soak')) : 2;
const KEEP = argv.includes('--keep');
const WRITE = !argv.includes('--no-write');
const sha = (b) => createHash('sha256').update(b).digest('hex');
const say = (l) => process.stdout.write(l + '\n');
const rnd = (x, d = 3) => Math.round(x * 10 ** d) / 10 ** d;

function copyFilter(src) {
  const rel = path.relative(ROOT, src).split(path.sep).join('/');
  if (!rel) return true;
  if (rel === 'bench/fixtures' || PUT_BACK.some((p) => rel === p || rel.startsWith(p + '/'))) return true;
  if (rel.startsWith('.env')) return false;
  return !NEVER.some((n) => rel === n || rel.startsWith(n + '/'));
}
function bytesUnder(dir) {
  let n = 0;
  const walk = (d) => {
    let names = [];
    try { names = readdirSync(d); } catch { return; }
    for (const x of names) {
      const p = path.join(d, x);
      let s; try { s = lstatSync(p); } catch { continue; }
      if (s.isDirectory()) walk(p); else n += s.size;
    }
  };
  walk(dir);
  return n;
}
/** The JSON bin/brain.mjs --json printed (cli/format.mjs stringify pretty-prints it): the whole stdout, else the last top-level object. */
function printedJson(text) {
  const t = String(text || '').replace(/\r/g, '').trim();
  try { return JSON.parse(t); } catch { /* more than the object */ }
  for (let i = t.lastIndexOf('\n{'); i >= 0; i = i > 0 ? t.lastIndexOf('\n{', i - 1) : -1) { try { return JSON.parse(t.slice(i + 1)); } catch { /* not the start */ } }
  const lines = t.split('\n').map((l) => l.trim()).filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i--) { try { const j = JSON.parse(lines[i]); if (j && typeof j === 'object') return j; } catch { /* not JSON */ } }
  return null;
}
/** The soak's own answer inside what the CLI printed: the object that carries runId and censusRound. */
function soakAnswer(j) {
  if (!j || typeof j !== 'object') return null;
  if ('censusRound' in j || 'runId' in j) return j;
  for (const v of Object.values(j)) { const f = v && typeof v === 'object' && !Array.isArray(v) ? soakAnswer(v) : null; if (f) return f; }
  return null;
}

/** One soak cycle, as the loop runs it, in one copy. */
function soak(arm, copy) {
  const tmp = path.join(DIR, 'tmp-' + arm);
  mkdirSync(tmp, { recursive: true });
  const args = ['bin/brain.mjs', 'self-code', '--auto', '--soak', String(SOAK_MIN), '--author', 'off', '--gate-after', 'off', '--json', ...(arm === 'off' ? ['--census-round', 'off'] : [])];
  const command = 'node ' + args.join(' ');
  say('SOAK ' + arm + ': ' + command + '  (in the ' + arm + ' copy)');
  const t = Date.now();
  const r = spawnSync(process.execPath, args, {
    cwd: copy, encoding: 'utf8', windowsHide: true, maxBuffer: 256 * 1024 * 1024, timeout: (SOAK_MIN + 15) * 60_000,
    env: { ...process.env, TEMP: tmp, TMP: tmp, TMPDIR: tmp },
  });
  const wallS = rnd((Date.now() - t) / 1000, 1);
  writeFileSync(path.join(DIR, 'soak-' + arm + '.log'), String(r.stderr || ''));
  const printed = printedJson(r.stdout);
  const ans = soakAnswer(printed);
  const logLines = String(r.stderr || '').split('\n');
  for (const l of logLines.filter((x) => /CENSUS ROUND|\[census\] (census open|promoted)|census kept/.test(x))) say('  ' + arm + ' | ' + l.trim().slice(0, 400));
  let record = null;
  if (ans && typeof ans.soakFile === 'string') { try { record = JSON.parse(readFileSync(path.join(copy, ...ans.soakFile.split('/')), 'utf8')); } catch { record = null; } }
  if (!ans) say('  ' + arm + ' | the CLI printed no soak answer (' + String(r.stdout || '').length + ' bytes on stdout)');
  return { arm, command, exit: r.status, signal: r.signal || null, error: r.error ? r.error.message : null, wallS, ans, printedJson: !!printed, record, logLines: logLines.length };
}

function gradeCtx() { return { plans: new Map(), planMs: 0 }; }

async function main() {
  const t0 = Date.now();
  say('census-round bar: ' + SOAK_MIN + '-minute soak cycles, control first, model off; copies under ' + path.basename(DIR) + '/ (the budget --dir)');
  rmSync(DIR, { recursive: true, force: true });
  mkdirSync(DIR, { recursive: true });
  // 1. the seed and the copies
  const seedDir = path.join(DIR, 'seed', 'dilation');
  mkdirSync(seedDir, { recursive: true });
  seedBasic({ name: 'dilation', dir: seedDir, ledger: 'off' }).snapshot(seedDir);
  const seedBytes = readFileSync(path.join(seedDir, 'snapshot.json'));
  const seedHash = sha(seedBytes);
  const copies = {};
  for (const arm of ['off', 'on']) {
    const c = path.join(DIR, arm, 'brain');
    cpSync(ROOT, c, { recursive: true, filter: copyFilter });
    mkdirSync(path.join(c, 'state', 'dilation'), { recursive: true });
    writeFileSync(path.join(c, 'state', 'dilation', 'snapshot.json'), seedBytes);
    copies[arm] = c;
  }
  const copyBytes = bytesUnder(DIR);
  say('copies: 2 x this tree (' + rnd(copyBytes / 1048576, 1) + ' MB together), one seeded organism ' + seedHash.slice(0, 12) + ' in both');

  // 2. the control, then the round
  const off = soak('off', copies.off);
  const on = soak('on', copies.on);
  const peakBytes = Math.max(copyBytes, bytesUnder(DIR));
  const offCR = off.ans && off.ans.censusRound, onCR = on.ans && on.ans.censusRound;
  const recordMatches = (s) => !!(s.record && s.ans && s.record.censusRound && JSON.stringify(s.record.censusRound.keptCells || []) === JSON.stringify(s.ans.censusRound.keptCells || []) && s.record.censusRound.kept === s.ans.censusRound.kept);
  const hashOf = (c) => { const f = path.join(c, 'state', 'dilation', 'snapshot.json'); return existsSync(f) ? sha(readFileSync(f)) : null; };
  const offHash = hashOf(copies.off), onHash = hashOf(copies.on);
  say('control soak: exit ' + off.exit + ', ' + off.wallS + ' s; ' + censusLine(offCR));
  say('round soak:   exit ' + on.exit + ', ' + on.wallS + ' s; ' + censusLine(onCR));
  say('organism: seed ' + seedHash.slice(0, 12) + ', control kept ' + (offHash || 'absent').slice(0, 12) + ' (' + (offHash === seedHash ? 'unchanged' : 'CHANGED') + '), round kept ' + (onHash || 'absent').slice(0, 12) + ' (' + (onHash === seedHash ? 'unchanged' : 'changed') + ')');

  // 3. against the control: each kept cell's bench on the organism each soak kept
  const kept = onCR && Array.isArray(onCR.keptCells) ? onCR.keptCells : [];
  const benchSource = new Map((onCR && onCR.benches || []).map((b) => [b.id, b.source]));
  const vsControl = [];
  const tg = Date.now();
  if (kept.length && onHash && offHash) {
    const grade = path.join(DIR, 'grade');
    const dirs = {};
    for (const arm of ['off', 'on']) { dirs[arm] = path.join(grade, arm, 'dilation'); mkdirSync(dirs[arm], { recursive: true }); cpSync(path.join(copies[arm], 'state', 'dilation', 'snapshot.json'), path.join(dirs[arm], 'snapshot.json')); }
    const ctx = gradeCtx();
    for (const bench of [...new Set(kept.map((k) => k.bench))]) {
      const source = benchSource.get(bench);
      const items = await itemsFor(source, { root: copies.on });
      const cells = [...new Set(kept.filter((k) => k.bench === bench).flatMap((k) => k.cells))];
      const offS = cellsScore(ctx, restore(dirs.off), items.dev);
      const onS = cellsScore(ctx, restore(dirs.on), items.dev, { watch: new Set(cells) });
      const gained = [...onS.ids].filter((id) => !offS.ids.has(id));
      const lost = [...offS.ids].filter((id) => !onS.ids.has(id));
      const row = { bench, source, items: items.dev.length, what: items.what.dev, control: offS.right, round: onS.right, delta: onS.right - offS.right, gained: gained.length, lost: lost.length, ranOnGained: ranOnGained(cells, gained, onS.fired) };
      vsControl.push(row);
      say('VS CONTROL ' + bench + ' (' + source + ', ' + row.items + ' development items): control ' + row.control + ', round ' + row.round + ', delta ' + row.delta + '; gained ' + row.gained + ', lost ' + row.lost + '; cells ran on gained: ' + JSON.stringify(row.ranOnGained));
    }
  }
  const gradeS = rnd((Date.now() - tg) / 1000, 1);
  const deltaOf = new Map(vsControl.map((r) => [r.bench, r.delta]));
  const keptRows = kept.map((k) => {
    const v = vsControl.find((r) => r.bench === k.bench);
    return { bench: k.bench, round: k.round, target: k.target, cells: k.cells, before: k.before, after: k.after, delta: k.delta, gainedInRound: k.gained ?? null, ranInRound: k.ran || null,
      controlDelta: v ? v.delta : null, ranVsControl: v ? Object.fromEntries(k.cells.map((id) => [id, v.ranOnGained[id] ?? 0])) : null };
  });
  for (const k of keptRows) say('KEPT ' + k.bench + ' round ' + k.round + ' ' + (k.target || '-') + ': ' + k.cells.join(', ') + '; in the round ' + k.before + ' -> ' + k.after + ' (delta ' + k.delta + '); against the control, bench delta ' + k.controlDelta);

  // 4. the verdict
  const contamination = [];
  if (!offCR || !offCR.off) contamination.push('the control soak did not report the round off');
  if (offHash !== seedHash) contamination.push('the control organism changed: its bench would not be the seed');
  if (!onCR) contamination.push('the round soak printed no censusRound');
  if (!recordMatches(on)) contamination.push('the round soak record (state/self/soak-<runId>.json) does not carry the report it printed');
  if ((onCR && onCR.modelCalls) || 0) contamination.push('the census asked a model');
  // the firing census against the control: every kept cell ran on at least one item the round organism answers and the control does not
  const everyRan = keptRows.length > 0 && keptRows.every((k) => k.ranVsControl && k.cells.every((id) => k.ranVsControl[id] > 0));
  const barMet = !contamination.length && kept.length > 0 && keptRows.every((k) => Number.isFinite(k.controlDelta) && k.controlDelta > 0);
  const over100 = peakBytes > 100 * 1048576;
  const pick = (cr) => cr ? { ran: !!cr.ran, off: !!cr.off, why: cr.why ?? null, rounds: cr.rounds ?? 0, spawned: cr.spawned ?? 0, cellsSpawned: cr.cellsSpawned ?? 0, kept: cr.kept ?? 0, discarded: cr.discarded ?? 0, promoted: cr.promoted ?? 0, written: !!cr.written,
    placebo: cr.placebo || null, stoppedBy: cr.stoppedBy ?? null, budget: cr.budget || null, cfg: cr.cfg || null, ledger: cr.ledger || null, red: cr.red ?? null,
    benches: (cr.benches || []).map((b) => ({ id: b.id, kind: b.kind, source: b.source, rounds: b.rounds, spawned: b.spawned, kept: b.kept, discarded: b.discarded, promoted: b.promoted, before: b.before, after: b.after, dev: b.dev, openS: b.openS, why: b.why })),
    discardedCells: (cr.discardedCells || []).map((d) => ({ bench: d.bench, round: d.round, target: d.target, cells: d.cells, before: d.before, after: d.after, delta: d.delta, why: d.why })),
    promotions: (cr.promotions || []).map((p) => ({ bench: p.bench, promoted: p.promoted, discarded: p.discarded, written: p.written, why: p.why, verify: p.verify })),
    ms: cr.ms ?? null, peakRssMb: cr.peakRssMb ?? null, modelCalls: cr.modelCalls ?? null } : null;
  const armOf = (s) => ({ command: s.command, exit: s.exit, signal: s.signal, error: s.error, wallS: s.wallS, runId: s.ans ? s.ans.runId ?? null : null, ok: s.ans ? s.ans.ok ?? null : null, reason: s.ans ? s.ans.reason ?? null : null, recordCarriesReport: recordMatches(s), logLines: s.logLines });
  const r = pick(onCR);
  const statement = 'One ' + SOAK_MIN + '-minute soak cycle ran through the CLI on each of two identical copies of this tree holding the same seeded organism, model off. '
    + 'The control (--census-round off) ran no round and kept the seed organism ' + (offHash === seedHash ? 'unchanged' : 'CHANGED') + '. '
    + 'The round soak called the census once, after reading ' + (r && r.ledger ? r.ledger.lines : '?') + ' ledger rows (' + (r && Number.isFinite(r.red) ? r.red : '?') + ' red, as the round soak line prints them): ' + (r ? r.rounds : 0) + ' rounds, ' + (r ? r.spawned : 0) + ' arms spawned ' + (r ? r.cellsSpawned : 0) + ' cells, '
    + (r ? r.kept : 0) + ' kept and ' + (r ? r.discarded : 0) + ' discarded by the rule (bench improved and every spawned cell ran on an item the bench gained), ' + (r ? r.promoted : 0) + ' promoted into state/dilation. '
    + (vsControl.length ? 'Against the control, on the development items that decided each keep: ' + vsControl.map((v) => v.bench + ' ' + v.control + ' -> ' + v.round + ' (delta ' + v.delta + ', ' + v.lost + ' lost)').join('; ') + '; every kept cell ran on an item the round organism gained over the control: ' + everyRan + '. ' : 'No kept cell, so no bench was graded against the control. ')
    + 'Held out is not graded here (split.why). ' + (over100 ? 'This bench wrote ' + rnd(peakBytes / 1048576, 1) + ' MB under its copy dir (over 100 MB: the two tree copies), deleted at the end. ' : '')
    + (contamination.length ? 'CONTAMINATED: ' + contamination.join('; ') + '. ' : '') + 'barMet ' + barMet + '.';
  const verdict = {
    at: new Date().toISOString(), command: BAR_COMMAND, node: process.version, isTheBar: true, barMet,
    bar: 'kept > 0 AND every kept cell\'s bench prints a delta > 0 against the control (the same soak cycle with --census-round off)',
    split: {
      dev: 'the development items of each kept cell\'s bench (self/census-round.mjs itemsFor: ARC-AGI-1 training, or the even positions of a bench/answer.mjs suite), the items the keep rule read',
      heldOut: 'none',
      why: 'this bar grades the loop\'s wiring (called once per cycle, the keep rule, the promotion, the control) on the items that decided each keep; the loop runs openCensus with held out off so a soak never spends its wall planning items it does not decide on, and the held-out grade of the census rounds is bench/spawn.mjs --census (bench/verdicts/spawn-census.json)',
      contaminated: contamination.length ? contamination.join('; ') : false,
    },
    control: { name: 'the same ' + SOAK_MIN + '-minute soak cycle, same CLI, same seeded organism, on an identical copy, with --census-round off', organismHash: offHash, unchanged: offHash === seedHash, censusRound: pick(offCR) },
    soakMinutes: SOAK_MIN,
    rounds: r ? r.rounds : 0, armsSpawned: r ? r.spawned : 0, cellsSpawned: r ? r.cellsSpawned : 0, kept: r ? r.kept : 0, discarded: r ? r.discarded : 0, promoted: r ? r.promoted : 0, written: r ? r.written : false,
    keptCells: keptRows, vsControl, everyKeptCellRanVsControl: everyRan,
    censusRound: r,
    organism: { seed: seedHash, control: offHash, round: onHash, seededBy: 'seeds/basic.mjs seedBasic (as brain init seeds one); the live state/ is never read' },
    arms: { control: armOf(off), round: armOf(on) },
    modelCalls: r ? r.modelCalls : null,
    disk: { peakMb: rnd(peakBytes / 1048576, 1), over100Mb: over100, what: 'two copies of this tree (self/improve.mjs COPY_EXCLUDE, the credential files and viz/ left out; ' + PUT_BACK.join(' and ') + ' put back, the 371 MB wiki store not) and both soaks\' temp files', deleted: !KEEP },
    gradeS, wallS: rnd((Date.now() - t0) / 1000, 1),
    statement,
  };
  if (WRITE) { mkdirSync(path.join(ROOT, 'bench', 'verdicts'), { recursive: true }); writeFileSync(path.join(ROOT, ...VERDICT_REL.split('/')), JSON.stringify(verdict, null, 2) + '\n'); }
  say('BAR census-round: rounds ' + verdict.rounds + ', arms spawned ' + verdict.armsSpawned + ' (' + verdict.cellsSpawned + ' cells), kept ' + verdict.kept + ', discarded ' + verdict.discarded + ', promoted ' + verdict.promoted
    + '; vs control ' + (vsControl.map((v) => v.bench + ' delta ' + v.delta).join(', ') || 'none') + '; every kept cell ran vs control ' + everyRan + '; contaminated ' + (contamination.length ? 'YES' : 'no') + '; barMet ' + barMet + (WRITE ? ' -> ' + VERDICT_REL : ' (not written)'));
  say('disk: peak ' + verdict.disk.peakMb + ' MB under the copy dir' + (over100 ? ' (over 100 MB)' : '') + '; wall ' + verdict.wallS + ' s (grading ' + gradeS + ' s)');
  if (!KEEP) { rmSync(DIR, { recursive: true, force: true }); say('copies deleted: ' + (existsSync(DIR) ? 'NO, ' + path.basename(DIR) + ' still there' : 'yes')); }
  return verdict;
}

main().then((v) => { process.exitCode = v.barMet ? 0 : 1; }, (e) => { process.stderr.write('census-round bench failed: ' + (e && e.stack ? e.stack : String(e)) + '\n'); if (!KEEP) rmSync(DIR, { recursive: true, force: true }); process.exitCode = 2; });
