// test/dead-share-bar.mjs: the bar of Board 23 item dead-share (gap dead:organism/gen-1-4-4-1-4, the
// ledger's 0.71436 dead share, bar 0, the gate's cap 0.1; MANUAL P8: "make sure the 5 million
// organism lines u wrote arent empty code, that all of the code is extremely important").
// Author: Board 23 builder, item dead-share, fix pass, 2026-09-27.
//
// The board's bar command, tools/organism-census.mjs --all, writes bench/verdicts/census-all.json
// with isTheBar false and no split, and that writer is not this item's. This script runs that command
// unchanged and writes bench/verdicts/dead-share.json ONCE, from what the runs printed and wrote:
//
//   BAR        the board's command (through tools/budget.mjs, as the board gave it); the row of
//              organism/gen-1-4-4-1-4 in the census-all.json it rewrites must show dead share 0
//              (1 - loadBearing / loaded, as self/gaps.mjs divides), on the seed as it is on disk:
//              the row's declared cells and edges are the manifest's and its loaded lines are the
//              census ruler of the seed's files (genome/emit.mjs censusLinesOf)
//   CONTROL before     the census of this same seed before the item (the r0 verdict): the 0.71436
//   CONTROL knockout   the bar census's own knockout of the seed's edges file (every edge left
//                      out): what the edges carry, the drive and the hosted score
//   CONTROL clone      the seed loaded and emitted again into scratch is the same seed (the same
//                      hash), and the item's emitter run over that copy (genome/emit.mjs
//                      --dead-share) changes nothing: the landed seed is the emitter's fixed point
//   PROVENANCE         the manifest records the wire rounds (72, then 30 edges, rebuilt from the
//                      censuses between them), each linked by hash, and the prune by the r2 census
//   LONG HORIZON       the census arm at 200 ticks and at 1200 on the landed seed: the cells on a
//                      1000 tick clock, the edges into cells with no run after tick 0, the mail the
//                      census drops (a development measurement: read while building)
//   HELD OUT           the emitter's chain on a copy of every other seed the bar censused (none of
//                      them was chained while the rule was built), twice, each copy checked against
//                      the bar's own census of the original first
//
// Pre-registered (fixed before the held-out run, in the verdict as `criteria`): barMet is
//   the development seed's row at dead share 0, fresh; the provenance; the clone; AND, on every
//   held-out seed, the copy is the seed (same hash, and its first census reads what the bar read),
//   the chain reached its fixed point with dead share not higher and the hosted score, algebra and
//   sequence not lower, and the two runs landed the same organism.
// Reported, not required: how many held-out seeds the chain took under the gate's cap 0.1, how many
// to 0, and by how much each fell.
//
//   node tools/budget.mjs --ram-mb 4000 --disk-mb 400 --dir <scratch> -- node --max-old-space-size=4000 test/dead-share-bar.mjs --scratch <scratch>
//
// Not a node:test file (no .test.mjs suffix): the gate does not run it. No model, no network. One
// bench child at a time, each launched only with 8000 MB free. Never loads organism/scale-52000 (the
// board's command skips it by its manifest, over --max-cells).
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEV = 'organism/gen-1-4-4-1-4';
const CONTAMINATED = { 'organism/gen-0-2-3-1-3': 'a chain trial ran on a copy of it while the rule was built' };
const LEDGER = 0.71436, CAP = 0.1, TICKS = 200, LONG = 1200, FREE_MB = 8000;
const BEFORE = 'bench/verdicts/census-gen-1-4-4-1-4-dead-share-r0-partial.json';
const HISTORY = ['r0', 'r1', 'r2'].map((r) => 'bench/verdicts/census-gen-1-4-4-1-4-dead-share-' + r + '-partial.json');
const BAR_ARGS = ['tools/budget.mjs', '--ram-mb', '4000', '--disk-mb', '400', '--dir', 'bench/verdicts', '--', 'node', '--max-old-space-size=4000', 'tools/organism-census.mjs', '--all', '--ticks', String(TICKS), '--max-cells', '1000'];
const BAR_COMMAND = 'node ' + BAR_ARGS.join(' ');
const OUT = path.join(ROOT, 'bench', 'verdicts', 'dead-share.json');
const posix = (p) => p.split(path.sep).join('/');
const round6 = (x) => (x === null || x === undefined ? null : Math.round(x * 1e6) / 1e6);
const shareOf = (lines) => (lines && lines.loaded > 0 ? round6(1 - lines.loadBearing / lines.loaded) : null);

function waitFree(what) {
  const t0 = Date.now();
  for (;;) {
    const free = Math.round(os.freemem() / 1048576);
    if (free >= FREE_MB) return free;
    if (Date.now() - t0 > 30 * 60_000) throw new Error('dead-share bar: ' + free + ' MB free after 30 min, under ' + FREE_MB + '; ' + what + ' not launched');
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000);
  }
}
function dirBytes(d) {
  let n = 0;
  if (!existsSync(d)) return 0;
  for (const f of readdirSync(d)) { const p = path.join(d, f); const s = statSync(p); n += s.isDirectory() ? dirBytes(p) : s.size; }
  return n;
}

/** The pre-registered judgement of one held-out seed (pure, tested by test/census.test.mjs). */
export function judgeHeldOut({ seed, bar, copies }) {
  const [a, b] = copies;
  const why = [];
  for (const c of copies) {
    if (c.copyHash !== c.sourceHash) why.push('copy ' + c.run + ' is not the seed (hash ' + String(c.copyHash).slice(0, 16) + ' vs ' + String(c.sourceHash).slice(0, 16) + ')');
    if (!c.chain) { why.push('chain ' + c.run + ' did not run: ' + c.error); continue; }
    if (c.chain.first.lines !== bar.lines.loaded || c.chain.first.loadBearing !== bar.lines.loadBearing) why.push('copy ' + c.run + ' first census reads ' + c.chain.first.loadBearing + ' of ' + c.chain.first.lines + ', the bar read ' + bar.lines.loadBearing + ' of ' + bar.lines.loaded);
    for (const [k, v] of Object.entries(c.chain.checks)) if (!v) why.push('chain ' + c.run + ' ' + k + ' false');
  }
  const deterministic = !!(a.chain && b.chain) && a.chain.last.hash === b.chain.last.hash && a.chain.last.deadShare === b.chain.last.deadShare && a.chain.last.lines === b.chain.last.lines && a.chain.last.score === b.chain.last.score;
  if (a.chain && b.chain && !deterministic) why.push('the two runs landed different organisms');
  const c = a.chain;
  return {
    seed, safe: why.length === 0, why,
    before: c ? c.first.deadShare : null, after: c ? c.last.deadShare : null,
    lowered: !!c && c.last.deadShare < c.first.deadShare, underCap: !!c && c.last.deadShare <= CAP, zero: !!c && c.last.deadShare === 0,
    rounds: c ? c.rounds : null, lines: c ? [c.first.lines, c.last.lines] : null,
    score: c ? [c.first.score, c.last.score] : null, algebra: c ? [c.first.algebra, c.last.algebra] : null, sequence: c ? [c.first.sequence, c.last.sequence] : null,
    edges: c ? [c.first.edges.declared, c.last.edges.declared] : null, cells: c ? [c.first.cells.declared, c.last.cells.declared] : null,
    deterministic, hash: c ? c.last.hash : null,
  };
}

async function main(scratch) {
  mkdirSync(scratch, { recursive: true });
  const say = (s) => process.stdout.write(s + '\n');
  const startedAt = new Date();
  const E = await import('../genome/emit.mjs');
  const C = await import('../tools/organism-census.mjs');
  await import('../cells/all.mjs');
  const { loadFrom } = await import('../genome/load.mjs');
  const copySeed = async (src, dst) => {
    const { brain, manifest } = await loadFrom(path.join(ROOT, src));
    brain.genome = JSON.parse(JSON.stringify(manifest.genome));
    const res = E.emitOrganism(brain, { dir: dst });
    return { sourceHash: manifest.hash, copyHash: res.hash };
  };

  // ---- BAR: the board's command, unchanged
  const free0 = waitFree('the bar command');
  say('BAR ' + BAR_COMMAND + ' (free ' + free0 + ' MB)');
  const t0 = Date.now();
  const barRun = spawnSync(process.execPath, BAR_ARGS, { cwd: ROOT, encoding: 'utf8', timeout: 60 * 60_000, maxBuffer: 256 << 20, windowsHide: true });
  const barPrinted = ((barRun.stdout || '') + (barRun.stderr || '')).split(/\r?\n/).filter(Boolean);
  const barWallS = round6((Date.now() - t0) / 1000);
  for (const l of barPrinted.filter((x) => /^(Census of|wrote |BUDGET)/.test(x))) say('  ' + l);
  const all = JSON.parse(readFileSync(path.join(ROOT, 'bench', 'verdicts', 'census-all.json'), 'utf8'));
  const fresh = Date.parse(all.at) >= startedAt.getTime() && barRun.status === 0;
  const row = all.seeds.find((x) => x.seed === DEV);
  const m = JSON.parse(readFileSync(path.join(ROOT, DEV, 'manifest.json'), 'utf8'));
  const ruler = E.censusLinesOf(path.join(ROOT, DEV));
  const devShare = row && !row.skipped ? shareOf(row.lines) : null;
  const dev = {
    seed: DEV, hash: m.hash, deadShare: devShare, lines: row && row.lines, cells: row && row.cells, edges: row && row.edges, tasks: row && row.tasks,
    onDisk: { cells: m.counts.cells, edges: m.counts.edges, censusRuler: ruler },
    rowIsTheSeedOnDisk: !!row && !row.skipped && row.cells.declared === m.counts.cells && row.edges.declared === m.counts.edges && row.lines.loaded === ruler,
  };
  dev.met = fresh && devShare === 0 && dev.rowIsTheSeedOnDisk;
  say('  ' + DEV + ': dead share ' + devShare + ' (' + (row && row.lines.loadBearing) + ' of ' + (row && row.lines.loaded) + ' lines load bearing); cells ' + (row && row.cells.ran) + ' of ' + (row && row.cells.declared) + ' ran, edges ' + (row && row.edges.delivered) + ' of ' + (row && row.edges.declared) + ' delivered; the row is the seed on disk ' + dev.rowIsTheSeedOnDisk + ' (manifest ' + m.counts.cells + ' cells, ' + m.counts.edges + ' edges, census ruler ' + ruler + ' lines); census-all.json at ' + all.at + ', exit ' + barRun.status);

  // ---- CONTROL before
  const b0 = JSON.parse(readFileSync(path.join(ROOT, BEFORE), 'utf8'));
  const before = { file: BEFORE, at: b0.at, hash: b0.live && b0.live.manifestHash, lines: { loaded: b0.lines.loaded, loadBearing: b0.lines.loadBearing }, deadShare: shareOf(b0.lines), ledger: LEDGER };
  before.isTheLedger = Math.round(before.deadShare * 1e5) / 1e5 === LEDGER;
  say('CONTROL before: ' + BEFORE + ' dead share ' + before.deadShare + ' (' + before.lines.loadBearing + ' of ' + before.lines.loaded + '), the ledger ' + LEDGER + ': ' + before.isTheLedger);

  // ---- CONTROL knockout: the bar census's own knockout of the seed's edges file
  const edgeFiles = readdirSync(path.join(ROOT, DEV)).filter((f) => /^edges-\d+\.mjs$/.test(f));
  let ko = row && row.knockoutDelta ? row.knockoutDelta.find((k) => edgeFiles.includes(k.file)) : null;
  let koFrom = 'the bar census (census-all.json, role ' + (ko && ko.role) + ')';
  if (!ko && edgeFiles.length) {
    waitFree('the knockout census');
    const vdir = path.join(scratch, 'knockout');
    const r = spawnSync(process.execPath, ['--max-old-space-size=4000', 'tools/organism-census.mjs', '--seed', DEV, '--ticks', String(TICKS), '--knockout', edgeFiles[0], '--no-knockout-tasks', '--tag', 'dead-share-ko', '--verdict-dir', vdir], { cwd: ROOT, encoding: 'utf8', timeout: 20 * 60_000, maxBuffer: 64 << 20, windowsHide: true });
    if (r.status === 0) {
      const kv = JSON.parse(readFileSync(path.join(vdir, 'census-gen-1-4-4-1-4-dead-share-ko-partial.json'), 'utf8'));
      ko = (kv.knockouts || []).find((k) => k.file === edgeFiles[0]) || null;
      koFrom = 'a census with --knockout ' + edgeFiles[0];
    }
  }
  const knockout = ko ? { file: ko.file, from: koFrom, edgeFiles, delta: ko.delta, allEdges: edgeFiles.length === 1 && ko.delta.edgesDelivered === -(row.edges.delivered) } : { missing: 'no knockout of an edges file was measured', edgeFiles };
  if (ko) say('CONTROL knockout ' + ko.file + ' (' + koFrom + '): edges delivered ' + ko.delta.edgesDelivered + ', drive delivered ' + ko.delta.driveDelivered + ', drive runs ' + ko.delta.driveRuns + ', cells ran ' + ko.delta.cellsRan + ', hosted score ' + ko.delta.taskScore + ', algebra ' + ko.delta.algebraCorrect + ', sequence ' + ko.delta.sequenceCorrect);

  // ---- PROVENANCE
  const w = m.genome.wired || {}, rounds = Array.isArray(w.rounds) ? w.rounds : [];
  const hist = HISTORY.map((f) => JSON.parse(readFileSync(path.join(ROOT, f), 'utf8')));
  const rebuilt = rounds.filter((r) => r.reconstructed);
  const provenance = {
    rounds: rounds.map((r) => ({ fromHash: r.fromHash, toHash: r.toHash || null, edgesBefore: r.edgesBefore, edgesAfter: r.edgesAfter, portsWired: r.portsWired, keptByPrune: r.keptByPrune || null, reconstructed: !!r.reconstructed, census: r.census && r.census.file })),
    pruned: m.genome.pruned ? { fromHash: m.genome.pruned.fromHash, census: m.genome.pruned.census && m.genome.pruned.census.file, cells: m.genome.pruned.cells, edges: m.genome.pruned.edges } : null,
  };
  provenance.met = rebuilt.length === 2
    && rebuilt[0].fromHash === hist[0].live.manifestHash && rebuilt[0].toHash === hist[1].live.manifestHash && rebuilt[0].portsWired === hist[1].edges.declared - hist[0].edges.declared
    && rebuilt[1].fromHash === hist[1].live.manifestHash && rebuilt[1].toHash === hist[2].live.manifestHash && rebuilt[1].portsWired === hist[2].edges.declared - hist[1].edges.declared
    && !!provenance.pruned && provenance.pruned.fromHash === hist[2].live.manifestHash && provenance.pruned.census === HISTORY[2]
    && rounds.every((r, i) => i === 0 || !rounds[i - 1].toHash || rounds[i - 1].toHash === r.fromHash);
  say('PROVENANCE ' + rounds.map((r) => r.fromHash.slice(0, 8) + (r.toHash ? '->' + r.toHash.slice(0, 8) : '') + ' wired ' + r.portsWired + (r.keptByPrune ? ' (kept ' + r.keptByPrune.delivered + ' delivered, ' + r.keptByPrune.inFlightOnly + ' in flight only)' : '') + (r.reconstructed ? ' rebuilt' : '')).join('; ') + '; pruned from ' + (provenance.pruned && String(provenance.pruned.fromHash).slice(0, 8)) + ' by ' + (provenance.pruned && provenance.pruned.census) + ': ' + provenance.met);

  // ---- LONG HORIZON (development, read while building)
  const longHorizon = { note: 'a development measurement: the 1200 tick arm was read on this seed while the rule was built', arms: {} };
  for (const ticks of [TICKS, LONG]) {
    const seed = await C.readSeed(path.join(ROOT, DEV));
    const { arm, brain } = await C.runArm(seed, { ticks, tasks: true });
    const raw = arm.raw, k = brain.connectome, last = arm.dormant.lastTickBound;
    const noRunAfter0 = (c) => c.policy.period !== 'event' && C.dormantFrom(c.policy.period, last) === 1;
    let cellsNoRun = 0, edgesIntoNoRun = 0, p1000 = 0, p1000Fired = 0, p1000Runs = 0;
    const periods = {};
    for (let i = 0; i < raw.nCells; i++) {
      const c = brain.cells[i], p = String(c.policy.period);
      periods[p] = (periods[p] || 0) + 1;
      if (noRunAfter0(c)) cellsNoRun++;
      if (c.policy.period === 1000) { p1000++; p1000Runs += raw.runs[i]; if (raw.fired[i] > 0) p1000Fired++; }
    }
    const reached = new Set();
    let edgesInto1000 = 0;
    for (let e = 0; e < raw.nEdges; e++) {
      const d = brain.cells[k.dst[e]];
      if (noRunAfter0(d)) { edgesIntoNoRun++; reached.add(k.dst[e]); }
      if (d.policy.period === 1000) edgesInto1000++;
    }
    longHorizon.arms[ticks] = { ticks, lastTickBound: last, periods, cellsFired: arm.cells.fired, cellsWithNoRunAfterTick0: cellsNoRun, edgesIntoThem: edgesIntoNoRun, cellsTheyReach: reached.size, period1000: { cells: p1000, runs: p1000Runs, fired: p1000Fired, edgesInto: edgesInto1000 }, mailDropped: arm.dormant.mailDropped, driveDelivered: arm.totals.all.delivered, score: arm.tasks && arm.tasks.score };
    const a = longHorizon.arms[ticks];
    say('LONG HORIZON ' + ticks + ' ticks (last tick ' + last + '): cells fired ' + a.cellsFired + '; cells with no run after tick 0 ' + a.cellsWithNoRunAfterTick0 + ', edges into them ' + a.edgesIntoThem + ' (reaching ' + a.cellsTheyReach + ' of them); period 1000 cells ' + p1000 + ': runs ' + p1000Runs + ', fired ' + p1000Fired + ', edges into them ' + edgesInto1000 + '; mail dropped ' + a.mailDropped + '; hosted score ' + a.score);
  }

  // ---- CONTROL clone
  const cloneDir = path.join(scratch, 'clone', 'gen-1-4-4-1-4');
  mkdirSync(path.dirname(cloneDir), { recursive: true });
  const cc = await copySeed(DEV, cloneDir);
  waitFree('the clone chain');
  let clone;
  try {
    const r = E.deadShareChain(cloneDir, { ticks: TICKS, tag: 'clone', verdictDir: path.join(scratch, 'clone-v') });
    const after = JSON.parse(readFileSync(path.join(cloneDir, 'manifest.json'), 'utf8'));
    clone = { ...cc, rounds: r.rounds, fixedPoint: r.fixedPoint, pruneSkipped: r.steps.some((s) => s.step === 'prune' && s.skipped), deadShare: [r.first.deadShare, r.last.deadShare], hashAfter: after.hash };
    clone.met = cc.copyHash === cc.sourceHash && r.ok && r.rounds === 0 && clone.pruneSkipped && r.last.deadShare === 0 && after.hash === cc.sourceHash;
  } catch (err) { clone = { ...cc, error: err.message, met: false }; }
  say('CONTROL clone: copy hash ' + String(cc.copyHash).slice(0, 16) + ' (seed ' + String(cc.sourceHash).slice(0, 16) + '); chain rounds ' + clone.rounds + ', prune skipped ' + clone.pruneSkipped + ', dead share ' + (clone.deadShare || []).join(' -> ') + ': ' + clone.met);

  // ---- HELD OUT: every other seed the bar censused, twice
  const population = all.seeds.filter((x) => !x.skipped && x.seed !== DEV);
  const heldOut = [], contaminated = [];
  for (const r of population) {
    const name = path.basename(r.seed);
    const copies = [];
    for (const run of ['a', 'b']) {
      const dir = path.join(scratch, 'held-' + run, name);
      mkdirSync(path.dirname(dir), { recursive: true });
      const c = { run, ...(await copySeed(r.seed, dir)) };
      waitFree('the chain on ' + name);
      try { c.chain = E.deadShareChain(dir, { ticks: TICKS, tag: 'held', verdictDir: path.join(scratch, 'held-' + run + '-v') }); } catch (err) { c.error = err.message; }
      copies.push(c);
    }
    const j = judgeHeldOut({ seed: r.seed, bar: r, copies });
    (CONTAMINATED[r.seed] ? contaminated : heldOut).push(CONTAMINATED[r.seed] ? { ...j, contaminated: CONTAMINATED[r.seed] } : j);
    say((CONTAMINATED[r.seed] ? 'CONTAMINATED ' : 'HELD OUT ') + r.seed + ': dead share ' + j.before + ' -> ' + j.after + ', wire rounds ' + j.rounds + ', edges ' + (j.edges || []).join(' -> ') + ', cells ' + (j.cells || []).join(' -> ') + ', lines ' + (j.lines || []).join(' -> ') + ', hosted ' + (j.score || []).join(' -> ') + ', algebra ' + (j.algebra || []).join(' -> ') + ', sequence ' + (j.sequence || []).join(' -> ') + '; deterministic ' + j.deterministic + '; ' + (j.safe ? 'safe' : 'NOT SAFE: ' + j.why.join('; ')));
  }
  const count = (f) => heldOut.filter(f).length;
  const held = { seeds: heldOut.length, safe: count((j) => j.safe), lowered: count((j) => j.lowered), underCap: count((j) => j.underCap), zero: count((j) => j.zero), deterministic: count((j) => j.deterministic) };
  held.allSafe = heldOut.length > 0 && held.safe === heldOut.length;
  const sorted = heldOut.filter((j) => j.after !== null).map((j) => j.after).sort((x, y) => x - y);
  held.afterRange = sorted.length ? [sorted[0], sorted[sorted.length - 1]] : null;
  const beforeSorted = heldOut.filter((j) => j.before !== null).map((j) => j.before).sort((x, y) => x - y);
  held.beforeRange = beforeSorted.length ? [beforeSorted[0], beforeSorted[beforeSorted.length - 1]] : null;
  say('HELD OUT ' + held.seeds + ' seeds: safe ' + held.safe + ', lowered ' + held.lowered + ', under the cap ' + CAP + ' ' + held.underCap + ', at 0 ' + held.zero + ', deterministic ' + held.deterministic + '; dead share before ' + (held.beforeRange || []).join(' to ') + ', after ' + (held.afterRange || []).join(' to '));

  const barMet = dev.met && provenance.met && clone.met && held.allSafe;
  const wroteBytes = dirBytes(scratch);
  const ho = heldOut.map((j) => j.seed);
  const v = {
    bench: 'dead-share', at: new Date().toISOString(),
    command: 'node tools/budget.mjs --ram-mb 4000 --disk-mb 400 --dir <scratch> -- node --max-old-space-size=4000 test/dead-share-bar.mjs --scratch <scratch>',
    node: process.version, isTheBar: true, barMet,
    item: { board: 23, item: 'dead-share', gap: 'dead:' + DEV, ledger: LEDGER, bar: 0, gateCap: CAP, emitter: 'genome/emit.mjs --dead-share (deadShareChain: census, wire to the fixed point, prune, census; each step a child process)' },
    criteria: {
      barMet: 'the development seed row at dead share 0 and the seed on disk; the provenance; the clone; and every held-out seed safe',
      safe: 'the copy has the seed hash and its first census reads the lines the bar read; the chain reached its fixed point, dead share did not rise, hosted score, algebra and sequence did not fall; the two runs landed the same organism',
      reportedNotRequired: 'held-out seeds lowered, under the gate cap ' + CAP + ', at 0',
    },
    control: 'before: the r0 census of this seed (' + BEFORE + '); knockout: the bar census left out ' + (knockout.file || 'the edges file') + '; clone: the seed emitted again from its own load, and the emitter over it',
    split: {
      development: DEV + ' at ' + TICKS + ' ticks: the wire and prune rules were built and landed on it (censuses r0 to r3), and its ' + LONG + ' tick arm was read while building',
      heldOut: ho.length + ' seeds under organism/ the bar censused (' + ho.join(', ') + '): no chain ran on any of them while the rule was built; each is chained on two scratch copies here for the first time, the criteria fixed before the run',
      contaminated: Object.entries(CONTAMINATED).map(([s, why]) => s + ': ' + why + '; reported, not counted').join('; '),
    },
    bar: { command: BAR_COMMAND, exit: barRun.status, wallS: barWallS, censusAllAt: all.at, fresh, printed: barPrinted.filter((x) => /^(Census of|wrote |BUDGET|skip )/.test(x)) },
    dev, before, knockout, provenance, clone, longHorizon, heldOut: { ...held, rows: heldOut }, contaminated,
    wroteMB: round6(wroteBytes / 1048576), over100MB: wroteBytes > 100 * 1048576,
    notCovered: [
      'generations/epochs.mjs emitElite (and bench/epochs.mjs) never runs the chain: an epochs run that emits organism/gen-1-4-4-1-4 again writes the unwired, unpruned seed; the chain must run after it (genome/emit.mjs --dead-share)',
      'organism/* is gitignored (.gitignore organism/*): the landed seed is on this disk only; a clone of the repository has no organism/gen-1-4-4-1-4 until an epochs run and the chain write it',
      'dead share 0 is at the census horizon: edges into cells whose clock has no run after tick 0 inside it count as delivered though no run reads that mail inside the horizon (LONG HORIZON above)',
      'the edges carry drive work, not the hosted score (CONTROL knockout above)',
    ],
    statement: '',
  };
  const lh = longHorizon.arms;
  v.statement = 'The board bar command (tools/organism-census.mjs --all at ' + TICKS + ' ticks) ran again and ' + DEV + ' reads dead share ' + devShare + ': ' + (row && row.lines.loadBearing) + ' of ' + (row && row.lines.loaded) + ' loaded lines load bearing, ' + (row && row.cells.ran) + ' of ' + (row && row.cells.declared) + ' cells ran and ' + (row && row.edges.delivered) + ' of ' + (row && row.edges.declared) + ' edges delivered, ' + (dev.rowIsTheSeedOnDisk ? 'on the seed as it is on disk' : 'NOT on the seed as it is on disk') + ', against ' + before.deadShare + ' before the item (' + BEFORE + '). The seed was written by the emitter genome/emit.mjs (wire to the fixed point, then prune by the census), never by hand; its manifest now records both wire rounds (' + rebuilt.map((r) => r.portsWired).join(' and ') + ' edges, rebuilt from the censuses between them) and the prune' + (provenance.met ? '' : ' (the provenance check FAILED)') + ', and a copy of it ' + (clone.met ? 'is' : 'is NOT') + ' the emitter\'s fixed point. '
    + (ko ? 'Leaving out every edge (' + ko.file + ') takes ' + (-ko.delta.driveDelivered) + ' drive deliveries and ' + (-ko.delta.cellsRan) + ' cells\' runs away and moves the hosted score by ' + ko.delta.taskScore + ': the edges carry drive work, not the hosted score. ' : '')
    + 'Dead share 0 is a horizon measurement: at ' + TICKS + ' ticks (last tick ' + lh[TICKS].lastTickBound + ') ' + lh[TICKS].edgesIntoThem + ' edges deliver into ' + lh[TICKS].cellsTheyReach + ' cells with no run after tick 0 and count as delivered though no run reads that mail inside the horizon (' + lh[TICKS].mailDropped + ' items dropped); at ' + LONG + ' ticks (last tick ' + lh[LONG].lastTickBound + ') that is ' + lh[LONG].edgesIntoThem + ' edges into ' + lh[LONG].cellsTheyReach + ' cells, because the ' + lh[LONG].period1000.cells + ' cells on a 1000 tick clock (' + lh[LONG].period1000.edgesInto + ' edges into them) run again at tick 1000 and ' + lh[LONG].period1000.fired + ' of them fire by then, against ' + lh[TICKS].period1000.fired + ' at ' + TICKS + ' ticks; the prune keeps those edges. '
    + 'Held out, the same emitter on copies of the ' + held.seeds + ' other seeds the bar censused: ' + held.safe + ' safe (fixed point, no score, algebra or sequence fall, the same organism twice), ' + held.lowered + ' lowered, ' + held.underCap + ' under the gate cap ' + CAP + ', ' + held.zero + ' at 0 (dead share ' + (held.beforeRange || []).join(' to ') + ' before, ' + (held.afterRange || []).join(' to ') + ' after). The bar is ' + (barMet ? 'met' : 'NOT met') + '.';
  writeFileSync(OUT, JSON.stringify(v, null, 2) + '\n');
  say('BAR ' + (barMet ? 'MET' : 'NOT MET') + ': dev ' + dev.met + ', provenance ' + provenance.met + ', clone ' + clone.met + ', held out safe ' + held.safe + '/' + held.seeds + '; wrote ' + posix(path.relative(ROOT, OUT)) + ' (scratch ' + v.wroteMB + ' MB)');
  return { barMet };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2), i = argv.indexOf('--scratch');
  const root = i >= 0 && argv[i + 1] ? path.resolve(argv[i + 1]) : null;
  if (!root) { process.stdout.write('dead-share bar: name a scratch directory (--scratch <dir>)\n'); process.exitCode = 2; }
  else {
    const scratch = path.join(root, 'dead-share-bar-' + process.pid);
    try { process.exitCode = (await main(scratch)).barMet ? 0 : 1; }
    catch (err) { process.stdout.write('dead-share bar: ' + ((err && err.stack) || err) + '\n'); process.exitCode = 2; }
    finally { if (!argv.includes('--keep')) rmSync(scratch, { recursive: true, force: true }); }
  }
}
