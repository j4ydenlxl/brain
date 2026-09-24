// self/daemon.mjs: THE LOOP THAT RUNS UNATTENDED. observe -> propose -> trial -> apply,
// round after round, inside a wall clock budget, checkpointing to state/self/ so a killed
// run resumes where it stopped instead of starting the search again.
//
// It stops for exactly two reasons and says which:
//   budget   the wall budget ran out
//   plateau  M consecutive rounds confirmed nothing. The rule and the numbers are printed,
//            never implied: "plateau: 3 consecutive rounds with 0 confirmed of 14 tried".
//
// A round that confirms nothing is not a failure. It is the measurement that the current
// self model has no move left that beats its own control, which is the only honest reason
// to stop a self improving loop.
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { observe, observeLine, health, round, measureSuites } from './observe.mjs';
import { propose, deltaLine, spillFloor, pruneCap, ASK_REGION, ASK_SUITE } from './propose.mjs';
import { trialAll, inputStream, trialLine } from './trial.mjs';
// The same isolation the trials use: every typed array reallocated, nothing shared with the
// live organism, so measuring the ask suite cannot move the brain the round is observing.
import { cloneSub } from '../simulate/clone.mjs';
import { arm, applyAll, Archive, isArmed, traceApply } from './apply.mjs';

export const DEFAULTS = Object.freeze({
  minutes: 3,          // wall budget
  rounds: Infinity,    // hard cap on rounds
  plateau: 3,          // M consecutive rounds confirming nothing
  candidates: 6,       // proposals per round
  trialTicks: 48,      // ticks each arm runs
  liveTicks: 64,       // ticks the live organism runs between rounds
  every: 64,           // K: observation cadence in ticks
  band: null,          // noise band for undecided; null = spillFloor(cells), measured by bench/self-null.mjs
  minGainPct: 1,       // the gate's bar
  // How many confirmed changes may land per round, each measured alone against its own
  // control. The throttle is DISTINCT REGIONS, not a count (see selectForApply below): two
  // candidates whose deltas touch different regions were each measured against a control
  // that did not yet carry the OTHER one's change, so both land safely; two candidates that
  // touch the SAME region cannot both land, because the second was measured against ground
  // the first has already changed by the time it would apply. applyPerRound remains a hard
  // cap on top of that rule for a caller who wants the old one-per-round behaviour back
  // (pass 1); the default of 32 is not a real limit, just a ceiling well above any
  // organism's region count (7-9 here) so a future organism with far more regions cannot
  // apply an unbounded number of changes in one round.
  applyPerRound: 32,
  dir: null,           // state/self
  suites: null,        // task suites measured each round (costly; off by default)
  log: null,           // (line) => void
});

// Confirmed candidates, best gain first, filtered to at most one per region and capped at
// `cap`. Every candidate in `passed` was trialled ALONE: its treated clone carried only its
// own delta, and its control was a clone of the SAME live brain with no delta at all. That
// match is only true of the brain as it was when the round's trials ran. Landing two
// confirmed candidates that touch the SAME region in one round would apply the second to a
// brain the first has already changed, on evidence measured before either landed, which is
// not what was measured. Two candidates in DIFFERENT regions have no such conflict: their
// matched-control grades stay valid however many of them land together, so every one of
// them may apply (2026-09-17, notes/self.md). Every propose.mjs delta kind carries a
// `region` field (region.grow, kind.mix, skill.add, period.change, conduit.add,
// conduit.prune all set delta.region), so this never falls through to the `undefined` key.
export function selectForApply(passed, cap = Infinity) {
  const out = [];
  const seen = new Set();
  for (const r of passed) {
    if (out.length >= cap) break;
    const region = r.delta && r.delta.region;
    if (seen.has(region)) continue;
    seen.add(region);
    out.push(r);
  }
  return out;
}

export class SelfDaemon {
  constructor(brain, opts = {}) {
    this.brain = brain;
    this.opts = { ...DEFAULTS, ...opts };
    this.dir = this.opts.dir || (brain.dir ? path.join(brain.dir, 'self') : path.join(process.cwd(), 'state', 'self'));
    this.archive = new Archive(path.join(this.dir, 'archive.json'));
    this.round = 0;
    this.rounds = [];
    this.stop = null;
    this.dry = 0;             // consecutive rounds that confirmed nothing
    this.startedAt = null;
    this.metricBefore = null;
    this.metricAfter = null;
    this.applied = [];
    this.resumed = false;
    // maxEdges is armed from this brain's OWN size so it tracks propose.mjs's pruneCap:
    // an unarmed default of 256 would reject the very batches pruneCap scales up to once
    // the organism passes 25,600 edges (self/apply.mjs selfPolicy doc, self/propose.mjs
    // pruneCap comment; both read the 2026-09-17 soak's +256/round plateau).
    if (!isArmed(brain.gate)) arm(brain.gate, { minGainPct: this.opts.minGainPct, requireHuman: this.opts.requireHuman === true, maxEdges: pruneCap(brain.connectome.size()) });
    if (this.opts.resume) this.resume();
  }

  say(line) {
    if (this.opts.log === false) return;
    if (typeof this.opts.log === 'function') this.opts.log(line);
    else console.log(line);
  }

  // ---------------------------------------------------------- checkpoints
  get checkpointFile() { return path.join(this.dir, 'checkpoint.json'); }
  checkpoint() {
    mkdirSync(this.dir, { recursive: true });
    const j = {
      v: 1, at: new Date().toISOString(), brain: this.brain.name,
      round: this.round, dry: this.dry, t: this.brain.clock.t,
      metricBefore: this.metricBefore, metricAfter: this.metricAfter,
      applied: this.applied,
      archive: this.archive.counts(), archiveSize: this.archive.size,
      rounds: this.rounds,
      stop: this.stop,
    };
    writeFileSync(this.checkpointFile, JSON.stringify(j, null, 2));
    this.archive.save();
    return this.checkpointFile;
  }
  resume() {
    if (!existsSync(this.checkpointFile)) return false;
    try {
      const j = JSON.parse(readFileSync(this.checkpointFile, 'utf8'));
      this.round = j.round || 0;
      this.dry = j.dry || 0;
      this.metricBefore = j.metricBefore ?? null;
      this.applied = j.applied || [];
      this.rounds = j.rounds || [];
      this.resumed = true;
      this.say(`resume: round ${this.round}, ${this.archive.size} archived candidates, health before ${this.metricBefore}`);
      return true;
    } catch { return false; }
  }

  // The suites this round measures: whatever the caller asked for, plus the ask suite when
  // the organism carries the ask region and the caller did not already name it. The ask suite
  // is what makes self/propose.mjs's ask candidates gradeable: without a reading of
  // suite.ask.accuracy their `before` is null and nothing can decide them. It asks with
  // provider null, so a round that measures it opens no socket and spends no model.
  //
  // IT IS MEASURED ON A CLONE, NEVER ON THE LIVE ORGANISM. A question crossing the region is
  // the organism running: 12 questions move the clock about 120 ticks and run the five cells,
  // so a suite read off the live brain would be an instrument that moves what it measures,
  // and the round's observation would then describe a brain the observation itself advanced.
  // MEASURED on the whole organism (2026-09-18): the same six questions score 6 of 6 either
  // way, the clone costs 103ms at 589 cells, and the live clock goes 30 -> 30 through the
  // clone where it goes 0 -> 30 through the brain. The clone carries no memory system, which
  // the suite does not need: every item of it is an exact one, answered by act/solve.mjs.
  askSuites() {
    const given = Array.isArray(this.opts.suites) ? [...this.opts.suites] : (this.opts.suites ? [this.opts.suites] : []);
    if (!this.brain.regions || !this.brain.regions.has(ASK_REGION)) return given.length ? given : null;
    if (given.some((s) => (typeof s === 'string' ? s : s && s.name) === ASK_SUITE)) return given;
    const brain = this.brain, n = this.opts.askSuiteN ?? 12;
    given.push({
      name: ASK_SUITE,
      run: async ({ seed }) => {
        const { askSuite } = await import('../act/region.mjs');
        const copy = cloneSub(brain, { name: brain.name + '.ask', seed: 'ask:' + seed });
        return askSuite({ brain: copy, seed, n });
      },
    });
    return given;
  }

  // ---------------------------------------------------------- one round
  async runRound() {
    this.round++;
    const t0 = Date.now();
    const wanted = this.askSuites();
    const suites = wanted ? await measureSuites(wanted) : null;
    const model = observe(this.brain, { suites });
    if (this.metricBefore === null) this.metricBefore = model.health;
    const candidates = propose(this.brain, model, {
      archive: this.archive.keys(), max: this.opts.candidates, round: this.round,
      window: this.opts.trialTicks,   // a candidate nobody can measure in the window is not proposed
    });
    const stream = inputStream(this.brain, { ticks: this.opts.trialTicks, seed: 'self:stream:' + this.round });
    const { results } = trialAll(this.brain, candidates, { ticks: this.opts.trialTicks, stream, band: this.opts.band ?? spillFloor(this.brain.cells.length) });
    for (const r of results) if (r.verdict !== 'confirmed') this.archive.remember(r.key, r.verdict, r);
    // At most ONE change per REGION lands, never two. Every candidate of a round was
    // measured ALONE against its control, so applying two that touch the same region
    // together would land a combination nothing measured; two that touch DIFFERENT regions
    // carry no such conflict; each one's matched-control grade is still exactly what it
    // was when the trial ran (selectForApply above). Candidates left over (same-region
    // runners up, plus anything applyPerRound still caps) are not archived: they are
    // re-proposed next round and re-measured against a control taken from the brain as it
    // is by then.
    const passed = results.filter(r => r.verdict === 'confirmed').sort((a, b) => Math.abs(b.gainPct) - Math.abs(a.gainPct));
    const submitted = selectForApply(passed, this.opts.applyPerRound);
    const report = applyAll(this.brain, submitted, { archive: this.archive });
    for (const d of report.decisions) if (d.applied) this.applied.push({ round: this.round, key: d.key, line: d.line, seq: d.seq, gainPct: results.find(r => r.key === d.key)?.gainPct ?? 0, trace: d.trace });

    const confirmed = results.filter(r => r.verdict === 'confirmed').length;
    const refuted = results.filter(r => r.verdict === 'refuted').length;
    const undecided = results.filter(r => r.verdict === 'undecided').length;
    const inapplicable = results.filter(r => r.verdict === 'inapplicable').length;

    // the live organism runs on, so the next observation is of a brain that has worked
    this.brain.tick(this.opts.liveTicks);
    const after = observe(this.brain, { log: false });
    this.metricAfter = after.health;

    const row = {
      round: this.round, candidates: candidates.length,
      confirmed, refuted, undecided, inapplicable,
      applied: report.applied, rejected: report.rejected, held: report.held, failed: report.failed,
      healthBefore: model.health, healthAfter: after.health,
      runsPerTickBefore: round(model.metrics.runsPerTick, 4), runsPerTickAfter: round(after.metrics.runsPerTick, 4),
      cells: after.metrics.cells, edges: after.metrics.edges,
      idleCells: after.metrics.idleCells, staleEdges: after.metrics.staleEdges,
      archive: this.archive.size, ms: Date.now() - t0,
      trials: results.map(r => ({ key: r.key, verdict: r.verdict, metric: r.metric, treated: r.treated, control: r.control, gainPct: r.gainPct, line: r.line || null, reason: r.reason })),
      applications: report.decisions.map(d => ({ key: d.key, status: d.status, seq: d.seq ?? null, reason: d.reason || null })),
    };
    this.rounds.push(row);
    if (confirmed === 0) this.dry++; else this.dry = 0;
    row.submitted = submitted.length;
    this.say(`round ${row.round}: candidates ${row.candidates}, confirmed ${confirmed}, refuted ${refuted}, undecided ${undecided}, inapplicable ${inapplicable}, submitted ${submitted.length} of ${passed.length} confirmed, applied ${row.applied}, health ${row.healthBefore} -> ${row.healthAfter}, cells ${row.cells}, edges ${row.edges}, ${row.ms}ms`);
    for (const r of results) this.say('  ' + trialLine(r));
    this.checkpoint();
    return row;
  }

  // ---------------------------------------------------------- the loop
  async run() {
    this.startedAt = Date.now();
    const budgetMs = this.opts.minutes * 60_000;
    const deadline = this.startedAt + budgetMs;
    this.say(`self daemon: brain ${this.brain.name}, ${this.brain.cells.length} cells, ${this.brain.connectome.size()} edges, budget ${this.opts.minutes} min, plateau rule M=${this.opts.plateau} consecutive rounds with 0 confirmed, at most one change per region applied per round (cap ${this.opts.applyPerRound}, each measured alone against its control), gate bar ${this.opts.minGainPct}% gain`);
    while (Date.now() < deadline && this.round < this.opts.rounds) {
      await this.runRound();
      if (this.dry >= this.opts.plateau) {
        const window = this.rounds.slice(-this.opts.plateau);
        const tried = window.reduce((a, r) => a + r.candidates, 0);
        this.stop = {
          reason: 'plateau',
          rule: 'stop when ' + this.opts.plateau + ' consecutive rounds confirm nothing',
          rounds: window.map(r => r.round), consecutiveDryRounds: this.dry,
          candidatesTried: tried, confirmed: 0,
          text: 'plateau: ' + this.opts.plateau + ' consecutive rounds (' + window.map(r => r.round).join(', ') + ') confirmed 0 of ' + tried + ' candidates tried',
        };
        break;
      }
    }
    if (!this.stop) this.stop = { reason: this.round >= this.opts.rounds ? 'rounds' : 'budget', rule: this.round >= this.opts.rounds ? 'stop after ' + this.opts.rounds + ' rounds' : 'stop when the wall budget is spent', text: this.round >= this.opts.rounds ? 'round cap ' + this.opts.rounds + ' reached' : 'wall budget of ' + this.opts.minutes + ' min spent after ' + this.round + ' rounds' };
    const elapsedMs = Date.now() - this.startedAt;
    this.checkpoint();
    const totals = this.totals();
    this.say(`stop (${this.stop.reason}): ${this.stop.text}`);
    this.say(`rule: ${this.stop.rule}`);
    this.say(`totals: rounds ${totals.rounds}, candidates ${totals.candidates}, confirmed ${totals.confirmed}, refuted ${totals.refuted}, undecided ${totals.undecided}, inapplicable ${totals.inapplicable}, applied ${totals.applied}, rejected ${totals.rejected}, metric health ${this.metricBefore} -> ${this.metricAfter} (${round((this.metricAfter - this.metricBefore) * 100, 4)} points), ${elapsedMs}ms`);
    return this.report(elapsedMs);
  }

  totals() {
    const sum = (k) => this.rounds.reduce((a, r) => a + (r[k] || 0), 0);
    return {
      rounds: this.rounds.length, candidates: sum('candidates'), confirmed: sum('confirmed'),
      refuted: sum('refuted'), undecided: sum('undecided'), inapplicable: sum('inapplicable'),
      applied: sum('applied'), rejected: sum('rejected'), held: sum('held'), failed: sum('failed'),
    };
  }

  report(elapsedMs = Date.now() - (this.startedAt || Date.now())) {
    const totals = this.totals();
    // recorded at application time, when the ledger ring still held the observation
    const traces = this.applied.map(a => a.trace || { seq: a.seq, reachedObservation: false, chain: [] });
    return {
      at: new Date().toISOString(), node: process.version,
      brain: { name: this.brain.name, cells: this.brain.cells.length, edges: this.brain.connectome.size(), t: this.brain.clock.t },
      opts: { minutes: this.opts.minutes, plateau: this.opts.plateau, candidates: this.opts.candidates, trialTicks: this.opts.trialTicks, liveTicks: this.opts.liveTicks, band: this.opts.band, minGainPct: this.opts.minGainPct, applyPerRound: this.opts.applyPerRound, every: this.opts.every },
      resumed: this.resumed,
      totals, rounds: this.rounds, applied: this.applied,
      archive: { size: this.archive.size, counts: this.archive.counts() },
      gate: { ...this.brain.gate.stats },
      metric: { name: 'health', before: this.metricBefore, after: this.metricAfter, delta: round((this.metricAfter ?? 0) - (this.metricBefore ?? 0), 6) },
      traces,
      stop: this.stop, elapsedMs,
      checkpoint: this.checkpointFile,
    };
  }
}

/** One call: build a daemon on a brain and run it. */
export async function runSelf(brain, opts = {}) {
  const d = new SelfDaemon(brain, opts);
  return await d.run();
}

export { observe, observeLine, health, propose, deltaLine, Archive };
