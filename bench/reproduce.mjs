// bench/reproduce.mjs: WHAT A GENERATION OF CHILDREN COSTS, AND WHETHER IT BUYS ANYTHING.
//
// One `reproduce` run is: two evaluations of the parent, N evaluations of children, N brains
// grown and written to disk, one Pareto ranking, one gate proposal. This measures that, and
// it measures it against a control, because "the best child beat the parent" is a sentence
// that a run with no mutation at all can also produce.
//
//   node bench/reproduce.mjs [--rounds 3] [--ticks 48] [--majors 40] [--arms 2,4] [--seeds K]
//                            [--out bench/verdicts/reproduce.json] [--quiet]
//
// THE ARMS. Each arm is a child count at mutation rate 2, plus one PLACEBO arm at the
// largest child count with mutation rate 0: those children keep every gene of the parent and
// differ only in the id the build seed comes from. If the placebo promotes as often as the
// mutated arms, the promotion rate is measuring the wiring seed and not the genes, and the
// number to quote is the gap between the two rather than either one.
//
// WHAT THIS RUN IS FOR. The run of 2026-09-18T03:03:10.406Z measured a placebo promotion rate
// of 0.5 against 0.7084 mutated: the bar was reading the build seed. generations/reproduce.mjs
// now pairs the parent and every child on the same K build seeds. The claim to grade is that
// the placebo rate falls to about the false positive rate the paired bar implies, which this
// bench computes and prints, and stays well under the mutated rate. `barBefore` in the verdict
// is copied out of the verdict file on disk BEFORE this run overwrites it, so the two bars sit
// side by side and neither of them is typed by hand. A verdict of the paired bar is never a
// "before" of the paired bar, so a rerun cannot make the before and the after the same run.
// The comparison that survives every rerun is `oldBarSameRun`: generations/reproduce.mjs
// still computes the old ruler on every generation, from the parent on its own id and each
// child on its own, and applies it to nothing, so both rulers are read off the same children.
//
// INTERLEAVED, NOT ARM BY ARM. The arms take turns round by round, so a machine that gets
// busier partway through spreads that cost over every arm instead of over whichever one ran
// last. Fitness carries a wall clock throughput term, so this is not a formality.
//
// NOTHING UNDER state/. Every parent and every child of this bench is written into a
// throwaway directory under the system temp root through BRAIN_STATE_DIR, and the directory
// is removed at the end. state/soak is never opened, and the byte counts below are measured
// on the files this bench itself wrote.
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

const mean = (xs) => (xs.length ? xs.reduce((a, v) => a + v, 0) / xs.length : 0);
const sd = (xs) => (xs.length ? Math.sqrt(mean(xs.map((v) => (v - mean(xs)) ** 2))) : 0);
const round = (x, n = 3) => Number(Number(x).toFixed(n));

// The numbers of a previous run of this bench, read off the verdict file before it is
// overwritten. Copied, never typed: a bar nobody can compare to its predecessor is a bar
// that gets to forget what it used to do.
function barFrom(v) {
  if (!v || typeof v !== 'object') return null;
  // A run of the paired bar is not a before of the paired bar. It may carry one: the before it
  // copied when it ran, which is carried forward unchanged as long as that one is unpaired.
  if (v.config && v.config.seeds !== undefined) return v.barBefore && v.barBefore.seeds == null ? v.barBefore : null;
  return {
    at: v.at ?? null, command: v.command ?? null,
    seeds: v.config && v.config.seeds !== undefined ? v.config.seeds : null,
    promotionRateMutated: v.promotionRateMutated ?? null, promotionRatePlacebo: v.promotionRatePlacebo ?? null,
    promotionRateGap: v.promotionRateGap ?? null,
    gainMutated: v.gainMutated ?? null, gainPlacebo: v.gainPlacebo ?? null, gainGap: v.gainGap ?? null,
  };
}

if (isMain) {
  const rounds = Math.max(1, Number(opt('rounds', 3)));
  const ticks = Math.max(4, Number(opt('ticks', 48)));
  const majors = Math.max(14, Number(opt('majors', 40)));
  const armCounts = String(opt('arms', '2,4')).split(',').map(Number).filter((n) => n >= 1);
  const quiet = has('quiet');
  const outFile = path.resolve(ROOT, String(opt('out', path.join('bench', 'verdicts', 'reproduce.json'))));

  // Read before the sweep, so what is reported as the previous bar cannot be anything this
  // run wrote. A missing or unreadable file is a null bar, not a zero.
  let barBefore = null;
  try { barBefore = existsSync(outFile) ? barFrom(JSON.parse(readFileSync(outFile, 'utf8'))) : null; } catch { barBefore = null; }

  // The state root is redirected before generations/reproduce.mjs is imported, because
  // cli/state.mjs resolves it from the environment on every call.
  const TMP = mkdtempSync(path.join(os.tmpdir(), 'brain-bench-reproduce-'));
  process.env.BRAIN_STATE_DIR = TMP;

  const { defaultOrganismGenome, hostableSuites } = await import('../generations/organism-genome.mjs');
  const { reproduce, saveOrganismState, DEFAULT_SEEDS, falsePositiveRateOfBar, pairsNeededFor } = await import('../generations/reproduce.mjs');
  const seedCount = Math.max(3, Number(opt('seeds', DEFAULT_SEEDS)));
  const command = 'node bench/reproduce.mjs --rounds ' + rounds + ' --ticks ' + ticks + ' --majors ' + majors
    + ' --arms ' + armCounts.join(',') + ' --seeds ' + seedCount;

  // arm 0..k-1 are the mutated arms, the last one is the placebo at the largest child count
  const arms = armCounts.map((children) => ({ name: 'children=' + children, children, rate: 2 }));
  arms.push({ name: 'placebo (rate 0), children=' + Math.max(...armCounts), children: Math.max(...armCounts), rate: 0 });
  for (const a of arms) a.runs = [];

  // One discarded run before the clock starts. Without it the first arm of round 1 pays for
  // loading every cell kind and filling the suite cache: measured at 1000.9 ms against
  // 154.2 ms for the same arm in round 3, which is a cost of the module system and not of
  // reproduction. Interleaving spreads drift across the arms; it cannot spread a cost that
  // is only ever paid once, so that cost is paid here instead.
  let parents = 0;
  {
    const warm = 'warmup';
    saveOrganismState(warm, defaultOrganismGenome({ id: 'bench-warm', seed: 'bench', majors, subcellsPerMajor: 4 }), { generation: 0 });
    const t = process.hrtime.bigint();
    await reproduce({ name: warm, children: 1, ticks, rate: 2, seeds: seedCount, seed: 'warmup' });
    if (!quiet) process.stderr.write('warmup (discarded)               ' + round(Number(process.hrtime.bigint() - t) / 1e6, 1) + ' ms\n');
  }
  const t0 = process.hrtime.bigint();
  for (let r = 1; r <= rounds; r++) {
    for (const arm of arms) {
      // A fresh parent per run: every run starts from the same organism, so the arms differ
      // in what this bench varied and in nothing else.
      const stateName = 'p' + (++parents);
      const g = defaultOrganismGenome({ id: 'bench-g0', seed: 'bench', majors, subcellsPerMajor: 4 });
      const born = saveOrganismState(stateName, g, { kind: 'organism.root', generation: 0 });
      const t = process.hrtime.bigint();
      const res = await reproduce({ name: stateName, children: arm.children, ticks, rate: arm.rate, seeds: seedCount, seed: 'bench-r' + r });
      const wallMs = Number(process.hrtime.bigint() - t) / 1e6;
      arm.runs.push({
        round: r, wallMs, parentBytes: born.bytes,
        parentFitness: res.parent.fitness, parentPre: res.parent.fitnessPre, parentPost: res.parent.fitnessPost, drift: res.parent.drift,
        parentSpread: res.parentSpread, parentSeedRange: res.parentSeedRange,
        promotedAtSeedRange: res.wouldPromoteAtSeedRange ? 1 : 0,
        // the old ruler on the same children: reported by reproduce(), applied to nothing
        promotedAtOldBar: res.wouldPromoteAtOldBar ? 1 : 0,
        oldBarParent: res.oldBar.parent, oldBarChild: res.oldBar.childFitness,
        bestFitness: res.best ? res.best.fitness : null,
        // the paired mean gain of the child that was ranked first, which is what the bar reads
        gain: res.best ? res.best.pairedMeanGain : null,
        pairsWon: res.best ? res.best.pairsWon : null, pairsNeeded: res.best ? res.best.pairsNeeded : null,
        beat: res.rows.filter((x) => x.pairedMeanGain > 0).length,
        beatBar: res.rows.filter((x) => x.pairedMeanGain > res.parentSpread && x.pairsWon >= x.pairsNeeded).length,
        children: res.rows.length, frontSize: res.frontSize,
        regressions: res.rows.reduce((a, x) => a + x.regressions.length, 0),
        childBytes: res.rows.reduce((a, x) => a + x.bytes, 0),
        promoted: res.proposed ? 1 : 0,
        suites: res.parent.suites.length,
      });
      if (!quiet) process.stderr.write('round ' + r + '  ' + arm.name.padEnd(30) + ' ' + round(wallMs, 1) + ' ms  gain '
        + (res.best ? res.best.pairedMeanGain : 'none') + '  won ' + (res.best ? res.best.pairsWon + '/' + seedCount : '-')
        + '  spread ' + res.parentSpread + '  ' + (res.proposed ? 'proposed' : 'no proposal') + '\n');
    }
  }
  const sweepMs = Number(process.hrtime.bigint() - t0) / 1e6;

  const armRows = arms.map((a) => {
    const R = a.runs;
    return {
      arm: a.name, children: a.children, rate: a.rate, runs: R.length,
      childrenSaved: R.reduce((s, x) => s + x.children, 0),
      wallMsMean: round(mean(R.map((x) => x.wallMs)), 1),
      msPerChildMean: round(mean(R.map((x) => x.wallMs / x.children)), 1),
      parentFitnessMean: round(mean(R.map((x) => x.parentFitness)), 6),
      parentDriftMean: round(mean(R.map((x) => x.drift)), 6),
      parentSpreadMean: round(mean(R.map((x) => x.parentSpread)), 6),
      parentSpreadMax: round(Math.max(...R.map((x) => x.parentSpread)), 6),
      parentSpreadMin: round(Math.min(...R.map((x) => x.parentSpread)), 6),
      parentSeedRangeMean: round(mean(R.map((x) => x.parentSeedRange)), 6),
      parentSeedRangeMin: round(Math.min(...R.map((x) => x.parentSeedRange)), 6),
      parentSeedRangeMax: round(Math.max(...R.map((x) => x.parentSeedRange)), 6),
      promotionRateAtSeedRange: round(mean(R.map((x) => x.promotedAtSeedRange)), 4),
      promotionRateAtOldBar: round(mean(R.map((x) => x.promotedAtOldBar)), 4),
      pairsWonMean: round(mean(R.map((x) => x.pairsWon ?? 0)), 2),
      clearedBarMean: round(mean(R.map((x) => x.beatBar / x.children)), 4),
      bestFitnessMean: round(mean(R.map((x) => x.bestFitness ?? 0)), 6),
      gainMean: round(mean(R.map((x) => x.gain ?? 0)), 6),
      gainMin: round(Math.min(...R.map((x) => x.gain ?? 0)), 6),
      gainMax: round(Math.max(...R.map((x) => x.gain ?? 0)), 6),
      beatParentMean: round(mean(R.map((x) => x.beat / x.children)), 4),
      frontSizeMean: round(mean(R.map((x) => x.frontSize)), 2),
      regressions: R.reduce((s, x) => s + x.regressions, 0),
      promotions: R.reduce((s, x) => s + x.promoted, 0),
      promotionRate: round(mean(R.map((x) => x.promoted)), 4),
      childMBMean: round(mean(R.map((x) => x.childBytes / x.children / 1e6)), 3),
    };
  });
  const mutated = armRows.filter((a) => a.rate > 0);
  const placebo = armRows.find((a) => a.rate === 0) || null;

  // The gap round by round, not only as a difference of two means. Round r pits the mutated
  // arms against the placebo arm that ran in the SAME round, which is what interleaving is
  // for; the spread of those per round gaps is the one number that says whether the mean gap
  // is a gap or a wobble.
  const gapPerRound = [];
  if (placebo) {
    const pl = arms.find((a) => a.rate === 0);
    for (let r = 1; r <= rounds; r++) {
      const p = pl.runs.find((x) => x.round === r);
      const ms = arms.filter((a) => a.rate > 0).map((a) => a.runs.find((x) => x.round === r)).filter(Boolean);
      if (!p || !ms.length) continue;
      gapPerRound.push(round(mean(ms.map((x) => x.gain ?? 0)) - (p.gain ?? 0), 6));
    }
  }
  const totals = {
    sweepMs: round(sweepMs, 1),
    runs: armRows.reduce((s, a) => s + a.runs, 0),
    childrenSaved: armRows.reduce((s, a) => s + a.childrenSaved, 0),
    promotions: armRows.reduce((s, a) => s + a.promotions, 0),
    regressions: armRows.reduce((s, a) => s + a.regressions, 0),
    // the number the control exists for: mutated minus placebo, on both statistics
    promotionRateMutated: round(mean(mutated.map((a) => a.promotionRate)), 4),
    promotionRatePlacebo: placebo ? placebo.promotionRate : null,
    promotionRateGap: placebo ? round(mean(mutated.map((a) => a.promotionRate)) - placebo.promotionRate, 4) : null,
    gainMutated: round(mean(mutated.map((a) => a.gainMean)), 6),
    gainPlacebo: placebo ? placebo.gainMean : null,
    gainGap: placebo ? round(mean(mutated.map((a) => a.gainMean)) - placebo.gainMean, 6) : null,
    // the gap with its own spread across rounds, and the rate the bar implies for a child
    // that carries no gene its parent does not
    gainGapPerRound: gapPerRound,
    gainGapSd: gapPerRound.length ? round(sd(gapPerRound), 6) : null,
    gainGapMin: gapPerRound.length ? round(Math.min(...gapPerRound), 6) : null,
    gainGapMax: gapPerRound.length ? round(Math.max(...gapPerRound), 6) : null,
    gainGapRounds: gapPerRound.length,
    gainGapRoundsPositive: gapPerRound.filter((g) => g > 0).length,
    parentSpreadMean: round(mean(armRows.map((a) => a.parentSpreadMean)), 6),
    parentSeedRangeMean: round(mean(armRows.map((a) => a.parentSeedRangeMean)), 6),
    // the same runs under the other floor, measured and applied to nothing
    promotionRateMutatedAtSeedRange: round(mean(mutated.map((a) => a.promotionRateAtSeedRange)), 4),
    promotionRatePlaceboAtSeedRange: placebo ? placebo.promotionRateAtSeedRange : null,
    // the ruler this bench replaced, read off the same children in this run: the parent on
    // its own id, each child on its own, one reading against the better parent reading
    oldBarSameRun: {
      promotionRateMutated: round(mean(mutated.map((a) => a.promotionRateAtOldBar)), 4),
      promotionRatePlacebo: placebo ? placebo.promotionRateAtOldBar : null,
      promotionRateGap: placebo ? round(mean(mutated.map((a) => a.promotionRateAtOldBar)) - placebo.promotionRateAtOldBar, 4) : null,
      what: 'the bar before 2026-09-18, computed by generations/reproduce.mjs on every generation of this run and applied to nothing',
    },
    falsePositiveRateImplied: falsePositiveRateOfBar(seedCount),
    falsePositiveModel: 'P(Binomial(' + seedCount + ', 1/3) >= ' + pairsNeededFor(seedCount)
      + '): under the null a gene identical child reading is the largest of its own and the parent two readings on a pair with probability 1/3, and the bar needs a majority of the '
      + seedCount + ' pairs. An upper bound: the paired mean gain must also clear the parent seed spread.',
  };

  if (!quiet) {
    console.log('');
    console.log('reproduce            ' + rounds + ' rounds, ' + arms.length + ' arms interleaved, ' + ticks + ' ticks an arm, ' + majors + ' majors, '
      + seedCount + ' paired build seeds (majority ' + pairsNeededFor(seedCount) + ')');
    console.log('hostable suites      ' + hostableSuites().hostable.join(', '));
    console.log('');
    const head = ['arm', 'runs', 'kids', 'ms/run', 'ms/kid', 'parent', 'spread', 'gain', 'won', 'beat', 'front', 'regr', 'promo', 'MB/kid'];
    const rows = armRows.map((a) => [a.arm, a.runs, a.childrenSaved, a.wallMsMean, a.msPerChildMean, a.parentFitnessMean,
      a.parentSpreadMean, a.gainMean, a.pairsWonMean + '/' + seedCount, a.beatParentMean, a.frontSizeMean, a.regressions, a.promotions + '/' + a.runs, a.childMBMean]);
    const w = head.map((h, i) => Math.max(String(h).length, ...rows.map((r) => String(r[i]).length)));
    const line = (cells) => cells.map((c, i) => (i === 0 ? String(c).padEnd(w[i]) : String(c).padStart(w[i]))).join('  ');
    console.log(line(head));
    console.log(w.map((n) => '-'.repeat(n)).join('  '));
    for (const r of rows) console.log(line(r));
    console.log('');
    console.log('children saved       ' + totals.childrenSaved + ' state directories in ' + round(sweepMs / 1000, 2) + ' s of sweep wall');
    console.log('promotions           ' + totals.promotions + ' of ' + totals.runs + ' runs proposed a child through the gate');
    console.log('control              promotion rate mutated ' + totals.promotionRateMutated + ' against placebo ' + totals.promotionRatePlacebo
      + ', gap ' + totals.promotionRateGap);
    console.log('control              mean gain mutated ' + totals.gainMutated + ' against placebo ' + totals.gainPlacebo + ', gap ' + totals.gainGap);
    console.log('gap spread           sd ' + totals.gainGapSd + ' over ' + totals.gainGapRounds + ' rounds, min ' + totals.gainGapMin
      + ', max ' + totals.gainGapMax + ', positive in ' + totals.gainGapRoundsPositive + ' of ' + totals.gainGapRounds);
    console.log('false positive rate  ' + totals.falsePositiveRateImplied + ' implied by the bar, against a measured placebo rate of ' + totals.promotionRatePlacebo);
    console.log('parent paired spread ' + armRows.map((a) => a.parentSpreadMean).join(', ') + ' (the floor a gain must clear: the parent read twice on each seed), min '
      + round(Math.min(...armRows.map((a) => a.parentSpreadMin)), 6) + ' max ' + round(Math.max(...armRows.map((a) => a.parentSpreadMax)), 6));
    console.log('parent seed range    ' + armRows.map((a) => a.parentSeedRangeMean).join(', ') + ' (the parent ACROSS the ' + seedCount + ' build seeds), min '
      + round(Math.min(...armRows.map((a) => a.parentSeedRangeMin)), 6) + ' max ' + round(Math.max(...armRows.map((a) => a.parentSeedRangeMax)), 6) + '. Applied to nothing.');
    console.log('other floor          promotion rate mutated ' + totals.promotionRateMutatedAtSeedRange + ' against placebo '
      + totals.promotionRatePlaceboAtSeedRange + ' if the bar read the across seed range instead. Measured, applied to nothing.');
    console.log('parent drift         ' + armRows.map((a) => a.parentDriftMean).join(', ') + ' (post minus pre, per arm)');
    console.log('old ruler, same run  promotion rate mutated ' + totals.oldBarSameRun.promotionRateMutated + ' against placebo ' + totals.oldBarSameRun.promotionRatePlacebo
      + ' under the bar this bench replaced (the parent on its own id, each child on its own, one reading), on the same children. Applied to nothing.');
    console.log('paired bar, same run promotion rate mutated ' + totals.promotionRateMutated + ' against placebo ' + totals.promotionRatePlacebo);
    if (barBefore) {
      console.log('bar before           ' + barBefore.at + '  placebo ' + barBefore.promotionRatePlacebo + '  mutated ' + barBefore.promotionRateMutated
        + '  gain gap ' + barBefore.gainGap + '  (' + barBefore.command + ')');
      console.log('bar after            placebo ' + totals.promotionRatePlacebo + '  mutated ' + totals.promotionRateMutated + '  gain gap ' + totals.gainGap);
    } else {
      console.log('bar before           no unpaired verdict was on disk before this run (a paired run is not a before); the old ruler line above is the comparison');
    }
  }

  // ---------------------------------------------------------------- verdict
  // Written after the sweep and after every number above was computed from runs this
  // process performed. Nothing here is typed by hand.
  const at = new Date().toISOString();
  const verdict = {
    at,
    node: process.version,
    platform: process.platform,
    cpus: os.availableParallelism ? os.availableParallelism() : os.cpus().length,
    command,
    config: {
      rounds, ticks, majors, arms: armCounts, seeds: seedCount, pairsNeeded: pairsNeededFor(seedCount),
      warmupRunsDiscarded: 1, stateRoot: 'temp (removed)', hostable: hostableSuites().hostable,
    },
    ...totals,
    // the same two statistics before and after the paired bar. barBefore was read off this
    // file before the sweep started and is not recomputed here.
    barBefore,
    barAfter: {
      at, command,
      seeds: seedCount,
      promotionRateMutated: totals.promotionRateMutated, promotionRatePlacebo: totals.promotionRatePlacebo,
      promotionRateGap: totals.promotionRateGap,
      gainMutated: totals.gainMutated, gainPlacebo: totals.gainPlacebo, gainGap: totals.gainGap,
    },
    arms: armRows,
    runs: arms.flatMap((a) => a.runs.map((x) => ({ arm: a.name, rate: a.rate, ...x }))),
  };
  mkdirSync(path.dirname(outFile), { recursive: true });
  writeFileSync(outFile, JSON.stringify(verdict, null, 2) + '\n');
  if (!quiet) console.log('verdict              ' + path.relative(ROOT, outFile).replaceAll('\\', '/'));

  try { rmSync(TMP, { recursive: true, force: true }); } catch { /* the OS temp sweeper will */ }
  process.exit(0);
}
