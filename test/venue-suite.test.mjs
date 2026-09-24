// test/venue-suite.test.mjs: the venue suite is the only yardstick in tasks/ whose number
// is a DIFFERENCE against a control rather than an exact answer, and the only one a search
// is allowed to optimise. That makes three things worth grading, and none of them is
// whether the brain made money:
//
//   1. the suite is hostable the way algebra, sequence and grid are. Its kinds are inside
//      the roster vocabulary, hostableSuites() names it, scoreSuitesFor() scores it, and
//      an organism that is MISSING one of the three kinds is reported by name as skipped
//      rather than given a wrong number for it.
//   2. the three arms are comparable. The brain arm, the matched random control and the
//      never trade arm travel the same path over the same readings; the never trade arm
//      deploys nothing and returns nothing, and that zero is graded against the readings
//      it saw rather than assumed.
//   3. the control belongs to the arm it was built from, and the grade moves when the
//      decision moves. A suite whose score is the same for every trader would let a search
//      report a win it did not have.
//
// Every claim below is graded against the thing it replaced or against a control, and
// every seed is fixed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Brain } from '../core/brain.mjs';
import '../cells/basic.mjs';
import {
  generateVenue, solveVenue, gradeVenue, runVenue, venueCellsOf,
  windowTapeOf, runWindowArm, matchedControl,
  VENUE_KINDS_NEEDED, VENUE_ROLES, VENUE_SIZE,
} from '../tasks/index.mjs';
import { getSuite, SUITES, SUITES_ALL } from '../tasks/index.mjs';
import { hostableSuites, suiteKinds, rosterVocabulary, scoreSuitesFor, clearSuiteCache } from '../generations/organism-genome.mjs';
import { FEE_ROUND_TRIP } from '../world/index.mjs';

// Small on purpose: every test here is about the SHAPE of the measurement, and a bigger
// draw would buy nothing but seconds.
const COUNTS = { windows: 3, readings: 20, instruments: 6 };
const SEED = 'test.venue.suite/1';
const HERE = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------- 1. hostable
test('the venue suite is hostable: its kinds are in the gene space and it is in the denominator', () => {
  const { hostable, unreachable } = hostableSuites();
  assert.ok(hostable.includes('venue'), 'venue is not hostable: ' + JSON.stringify(unreachable));
  // the other three are the thing this one was built alongside, so a regression that made
  // venue hostable by dropping another suite would be caught here and not celebrated.
  for (const name of ['algebra', 'sequence', 'grid']) assert.ok(hostable.includes(name), name + ' stopped being hostable');

  const vocab = rosterVocabulary();
  const need = suiteKinds().get('venue');
  assert.deepEqual([...need].sort(), [...VENUE_KINDS_NEEDED].sort(), 'the kinds the engine asks for are not the kinds the suite declares');
  for (const k of need) assert.ok(vocab.has(k), 'no region roster carries ' + k + ', so no genome could host the venue suite');
});

test('scoreSuitesFor scores venue for a kind set that has the three kinds, and SKIPS it by name for one that does not', () => {
  clearSuiteCache();
  const full = scoreSuitesFor(new Set(VENUE_KINDS_NEEDED), { seed: SEED + '/full' });
  assert.ok(full.eligible.includes('venue'), 'venue was not eligible for a kind set containing all three of its kinds');
  assert.equal(typeof full.perSuite.venue, 'number', 'venue produced no number for an eligible kind set');
  assert.ok(full.denominator >= 4, 'the denominator is the hostable count and venue is one of them, got ' + full.denominator);

  // One kind short. The suite must be SKIPPED BY NAME, not scored zero: a zero there would
  // read as "did not beat a coin" when the truth is "was never run".
  const short = scoreSuitesFor(new Set(VENUE_KINDS_NEEDED.slice(0, 2)), { seed: SEED + '/short' });
  assert.ok(short.skipped.includes('venue'), 'a kind set missing venue.trader was not reported as skipping venue');
  assert.equal(short.perSuite.venue, null, 'a skipped suite reported a number instead of null');
  clearSuiteCache();
});

test('venueCellsOf names the cells of a brain the suite did not build, and says which role is missing', () => {
  assert.equal(VENUE_ROLES.length, VENUE_KINDS_NEEDED.length, 'the roles and the declared kinds disagree in length');
  assert.deepEqual(VENUE_ROLES.map((r) => r.kind).sort(), [...VENUE_KINDS_NEEDED].sort());

  // A brain that carries none of the kinds: every role missing, no throw, no wrong id.
  const empty = new Brain({ name: 'venue.host.empty', seed: 'venue.host', ledger: 'off' });
  empty.addRegion('cognitive', { doc: 'test' });
  empty.addCell({ id: 'c.arith', kind: 'num.arith', region: 'cognitive', circuit: 'test' });
  const none = venueCellsOf(empty);
  assert.deepEqual(none.missing.sort(), VENUE_ROLES.map((r) => r.role).sort(), 'a brain with no venue cell did not report every role missing');
  assert.deepEqual(none.cells, {}, 'a brain with no venue cell named a cell anyway');
});

test('every suite the index exports is reachable by name, and venue is out of the summed accuracy on purpose', () => {
  assert.equal(getSuite('venue').name, 'venue');
  assert.ok(SUITES_ALL.some((s) => s.name === 'venue'), 'venue is not in SUITES_ALL');
  // SUITES is what bench/tasks.mjs adds into ONE accuracy. venue counts windows a control
  // was beaten on, which is a different population with a different meaning of correct, so
  // summing it into that row would publish one rate over two populations.
  assert.ok(!SUITES.some((s) => s.name === 'venue'), 'venue was summed into the exact answer accuracy, which is two populations under one rate');
});

// ---------------------------------------------------------------- 2. the three arms
test('the never trade arm saw the same readings as the brain arm and still deployed nothing', () => {
  const problems = generateVenue({ seed: SEED + '/arms', counts: COUNTS, size: VENUE_SIZE });
  assert.ok(problems.length > 0, 'the generator produced no window');
  let compared = 0;
  for (const p of problems) {
    const tape = windowTapeOf(p);
    const brain = runWindowArm(tape, p.size, { decide: 'trader' });
    const ctl = matchedControl(tape, brain.trades, SEED + ':' + p.id);
    const random = runWindowArm(tape, p.size, { decide: 'script', orders: ctl.orders });
    const flat = runWindowArm(tape, p.size, { decide: 'script', orders: [] });

    // The zero is measured, not assumed: the readings went past this arm's decision cell.
    assert.ok(flat.senseEmitted > 0, 'the never trade arm emitted no reading, so its zero is the zero of an arm that never ran');
    assert.equal(flat.senseEmitted, brain.senseEmitted, 'the never trade arm saw a different number of readings from the brain arm');
    assert.equal(random.senseEmitted, brain.senseEmitted, 'the random control saw a different number of readings from the brain arm');
    assert.equal(flat.trips, 0);
    assert.equal(flat.deployed, 0);
    assert.equal(flat.net, 0);
    assert.equal(flat.fees, 0);
    assert.equal(flat.returnOnDeployed, 0);

    // Nothing was refused, nothing was left open, nothing was lost at the border: an arm
    // that dropped an order would be a shorter arm, not a worse decision.
    for (const [name, arm] of [['brain', brain], ['random', random], ['flat', flat]]) {
      assert.equal(arm.refused, 0, name + ' had an order refused by the gate');
      assert.equal(arm.openAtEnd, 0, name + ' left a position open at the end of the window');
      assert.equal(arm.borderDropped, 0, name + ' dropped a signal at the border');
    }
    compared++;
  }
  assert.ok(compared === problems.length, 'not every window was compared');
});

test('a closed round trip paid the fee once on the notional that opened it, in every arm that traded', () => {
  const problems = generateVenue({ seed: SEED + '/fee', counts: COUNTS, size: VENUE_SIZE });
  let traded = 0;
  for (const p of problems) {
    const tape = windowTapeOf(p);
    const brain = runWindowArm(tape, p.size, { decide: 'trader' });
    if (brain.trips === 0) continue;
    traded++;
    assert.ok(Math.abs(brain.fees - FEE_ROUND_TRIP * brain.deployed) < 1e-12,
      'fees ' + brain.fees + ' is not the fee bar times the deployed ' + brain.deployed);
    // A pool that did not move still loses: gross minus fee is what net is made of.
    const grossSum = brain.trades.reduce((a, t) => a + t.pnl + t.fee, 0);
    assert.ok(Math.abs((grossSum - brain.fees) - brain.net) < 1e-12, 'net is not gross minus fees');
  }
  assert.ok(traded > 0, 'no window traded at all, so this test graded nothing');
});

// ---------------------------------------------------------------- 3. the grade
test('the matched control is rate and duration matched to the arm it was built from, and to no other', () => {
  const problems = generateVenue({ seed: SEED + '/match', counts: COUNTS, size: VENUE_SIZE });
  const p = problems.find((x) => runWindowArm(windowTapeOf(x), x.size, { decide: 'trader' }).trips > 0);
  assert.ok(p, 'no window in this draw produced a round trip, so matching cannot be graded here');
  const tape = windowTapeOf(p);
  const brain = runWindowArm(tape, p.size, { decide: 'trader' });
  const own = matchedControl(tape, brain.trades, SEED + ':own');
  assert.equal(own.orders.length, (brain.trades.length - own.collisions) * 2, 'the control did not place one buy and one sell per placeable trade');
  const holds = brain.trades.map((t) => t.heldSteps).sort((a, b) => a - b);
  const ctlHolds = [];
  for (let i = 0; i < own.orders.length; i += 2) ctlHolds.push(own.orders[i + 1].step - own.orders[i].step);
  ctlHolds.sort((a, b) => a - b);
  assert.deepEqual(ctlHolds, holds.slice(0, ctlHolds.length), 'the control did not hold for the same number of readings');

  // A control built from a DIFFERENT arm is not this arm's control. Give it a trade list
  // with twice the holding times and the match has to break, or the matching is decorative.
  const foreign = matchedControl(tape, brain.trades.map((t) => ({ ...t, heldSteps: t.heldSteps + 3 })), SEED + ':foreign');
  const foreignHolds = [];
  for (let i = 0; i < foreign.orders.length; i += 2) foreignHolds.push(foreign.orders[i + 1].step - foreign.orders[i].step);
  assert.notDeepEqual(foreignHolds.sort((a, b) => a - b), ctlHolds, 'a control built from another arm matched this arm anyway');
});

test('the grade moves when the decision moves, and a trader that never enters scores exactly zero', () => {
  const problems = generateVenue({ seed: SEED + '/grade', counts: COUNTS, size: VENUE_SIZE });
  const run = (trader) => {
    const solved = solveVenue(problems, { trader, seed: SEED + '/grade' });
    return gradeVenue(problems, solved.results, { feeRoundTrip: solved.feeRoundTrip });
  };
  // entryUp of 10 is a 1000 percent move in `lookback` readings: nothing on this tape
  // clears it, so this trader never enters. Its score has to be exactly zero, which is the
  // never trade bar the search has to beat.
  const never = run({ entryUp: 1e9, lookback: 2, trail: 0.2, maxHold: 5, maxOpen: 4 });
  assert.equal(never.brainTrips, 0, 'the never-enter trader entered anyway');
  assert.equal(never.controlTrips, 0, 'a control was built for an arm with no trades');
  assert.equal(never.scoreOnDeployed, 0, 'a trader that never traded did not score exactly zero');
  assert.equal(never.correct, 0, 'a window with no trade was counted as a win');
  assert.equal(never.claim, 'the brain opened no round trip on any window: there is nothing here to compare with a control');

  // A trader that does enter must produce a different grade, or the suite is measuring the
  // tape and not the decision, and a search over it would report drift as a discovery.
  const eager = run({ entryUp: 0, lookback: 1, trail: 0.5, maxHold: 40, maxOpen: 8 });
  assert.ok(eager.brainTrips > 0, 'the eager trader never entered, so the two arms cannot be compared');
  assert.notEqual(eager.scoreOnDeployed, never.scoreOnDeployed, 'two different traders scored the same: the grade does not read the decision');
  assert.ok(eager.sound, 'the eager run was not sound: ' + JSON.stringify(eager.checks));
});

test('a run of the suite is deterministic for a seed, and every report carries what it was measured on', () => {
  const a = runVenue({ seed: SEED + '/det', counts: COUNTS, size: VENUE_SIZE });
  const b = runVenue({ seed: SEED + '/det', counts: COUNTS, size: VENUE_SIZE });
  assert.equal(a.report.scoreOnDeployed, b.report.scoreOnDeployed, 'two runs of one seed disagreed on the score');
  assert.equal(a.report.brainNet, b.report.brainNet, 'two runs of one seed disagreed on the net');
  assert.equal(a.report.brainTrips, b.report.brainTrips, 'two runs of one seed disagreed on the trip count');

  const r = a.report;
  assert.equal(r.feeRoundTrip, FEE_ROUND_TRIP);
  assert.equal(r.feeBorrowed, 1, 'the report does not declare the fee as borrowed');
  assert.equal(r.feeSource.venueMeasuredOn, 'pump.fun', 'the report lost the venue the fee was measured on');
  assert.ok(typeof r.beatsControl === 'boolean' && typeof r.clearsFeeBar === 'boolean',
    'beatsControl and clearsFeeBar are two questions and both have to be reported');
  assert.equal(r.syntheticWindows + r.recordedWindows, r.n, 'the report does not account for every window as recorded or synthetic');
  assert.equal(r.perWindow.length, r.n, 'the report does not carry one row per window');
});

// ---------------------------------------------------------------- 4. the published number
// Added after a review: the note published `{"score":0.125,...,"venue":0.5}` for the
// venue-only kind set and the code prints exactly half of each. Nothing checked it, because
// the tests above only assert that a number EXISTS. These two grade the published copies
// against the code that produces them, which is the only thing that would have caught it.
test('the hosting figure in the verdict is the figure the code prints, not a typed one', () => {
  const file = path.join(HERE, '..', 'bench', 'verdicts', 'venue-suite.json');
  if (!existsSync(file)) return;               // no deliverable on disk, nothing published to check
  const v = JSON.parse(readFileSync(file, 'utf8'));
  assert.ok(v.hosting, 'the verdict publishes no hosting block, so its note numbers have no source');
  clearSuiteCache();
  const fresh = scoreSuitesFor(new Set(VENUE_KINDS_NEEDED));
  clearSuiteCache();
  assert.equal(v.hosting.score, fresh.score, 'the verdict hosting score is not what scoreSuitesFor prints');
  assert.equal(v.hosting.perSuite.venue, fresh.perSuite.venue, 'the verdict venue accuracy is not what scoreSuitesFor prints');
  assert.equal(v.hosting.denominator, fresh.denominator, 'the verdict denominator is not what scoreSuitesFor prints');
  assert.equal(v.hosting.repeats, true, 'the verdict does not record the figure as repeating');
});

test('every copy of the hosting figure in notes/world.md matches the code', () => {
  const note = readFileSync(path.join(HERE, '..', 'notes', 'world.md'), 'utf8');
  clearSuiteCache();
  const fresh = scoreSuitesFor(new Set(VENUE_KINDS_NEEDED));
  clearSuiteCache();
  // Every fenced block that carries the shape, not one spelling of it: a sweep that matched
  // one line would pass while another copy of the same number stayed wrong.
  const blocks = [...note.matchAll(/```[^\n]*\n([\s\S]*?)```/g)].map((m) => m[1].trim())
    .filter((b) => b.includes('"perSuite"') && b.includes('"eligible"'));
  assert.ok(blocks.length > 0, 'the note publishes no hosting block at all');
  for (const b of blocks) {
    let parsed;
    try { parsed = JSON.parse(b); } catch { assert.fail('a hosting block in notes/world.md is not JSON: ' + b.slice(0, 120)); }
    assert.equal(parsed.score, fresh.score, 'a hosting block in notes/world.md publishes score ' + parsed.score + ', the code prints ' + fresh.score);
    assert.equal(parsed.perSuite.venue, fresh.perSuite.venue, 'a hosting block in notes/world.md publishes venue ' + parsed.perSuite.venue + ', the code prints ' + fresh.perSuite.venue);
  }
});

// ---------------------------------------------------------------- 5. the deliverable file
// A sanity run at --generations 3 --pop 8 overwrote bench/verdicts/venue-suite.json once.
// The path is now chosen by the configuration, and this grades the behaviour by running the
// bench rather than by reading the source: a small run must leave the canonical file byte
// for byte where it was.
test('a run that is not the canonical configuration does not touch the canonical verdict', () => {
  const verdicts = path.join(HERE, '..', 'bench', 'verdicts');
  const canonFile = path.join(verdicts, 'venue-suite.json');
  const before = existsSync(canonFile) ? readFileSync(canonFile) : null;
  const sanityFile = path.join(verdicts, 'venue-suite.sanity.json');
  if (existsSync(sanityFile)) rmSync(sanityFile);

  const args = ['bench/venue-suite.mjs', '--generations', '1', '--pop', '4', '--drift', '0', '--windows', '2', '--readings', '8'];
  const r = spawnSync(process.execPath, args, { cwd: path.join(HERE, '..'), encoding: 'utf8' });
  assert.ok(r.stdout.includes('venue-suite.sanity.json'), 'the bench did not say where it wrote: ' + r.stdout.slice(-400) + r.stderr.slice(-400));

  assert.ok(existsSync(sanityFile), 'a non canonical run wrote no verdict at all');
  const sanity = JSON.parse(readFileSync(sanityFile, 'utf8'));
  assert.equal(sanity.isCanonicalConfig, false, 'a 1 generation run called itself the canonical configuration');
  assert.equal(sanity.out, 'bench/verdicts/venue-suite.sanity.json', 'the verdict does not carry the path it was written to');

  const after = existsSync(canonFile) ? readFileSync(canonFile) : null;
  if (before === null) assert.equal(after, null, 'a non canonical run created the canonical verdict');
  else assert.ok(before.equals(after), 'a non canonical run overwrote bench/verdicts/venue-suite.json');
  rmSync(sanityFile);
});
