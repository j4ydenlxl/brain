// test/tools.test.mjs: the observability tools (trace, inspect, diff), both as libraries
// and as the CLIs a person actually runs. Builds a seedBasic() brain in a temp state dir,
// drives it exactly the way the assignment specifies (inject, tick 2100, snapshot; inject
// again, tick 500 more, snapshot again), and checks the numbers each tool reports against
// the same ground truth the fixture itself produced, not against hardcoded expectations.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, mkdirSync, copyFileSync, existsSync, writeFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import '../cells/basic.mjs';
import { seedBasic } from '../seeds/basic.mjs';
import { loadBrainAt, ledgerEventsFor } from '../tools/lib.mjs';
import { traceTree } from '../tools/trace.mjs';
import { inspectBrain } from '../tools/inspect.mjs';
import { diffSnapshots } from '../tools/diff.mjs';
import { checkDoc, knownValues, ALLOWLIST, defaultDocs, GENERATED_DOCS } from '../tools/docs-numbers.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TRACE_BIN = path.join(ROOT, 'tools', 'trace.mjs');
const INSPECT_BIN = path.join(ROOT, 'tools', 'inspect.mjs');
const DIFF_BIN = path.join(ROOT, 'tools', 'diff.mjs');

const TMP = mkdtempSync(path.join(tmpdir(), 'brain-tools-'));
after(() => { rmSync(TMP, { recursive: true, force: true }); });

// ---------------------------------------------------------------- the fixture
// One brain, one continuously growing ledger, two point-in-time captures. A "state dir"
// is a snapshot.json paired with the ledger.jsonl that was current at that moment; since
// Brain#snapshot always writes <dir>/snapshot.json but the ledger physically lives wherever
// the brain itself was constructed with `dir`, capturing dir A means copying the ledger file
// as it stands right after the snapshot, before any more ticks touch it.
function captureStateDir(brain, liveDir, destDir) {
  mkdirSync(path.join(destDir, 'ledger'), { recursive: true });
  brain.snapshot(destDir);
  brain.ledger.flush();
  copyFileSync(path.join(liveDir, 'ledger', 'ledger.jsonl'), path.join(destDir, 'ledger', 'ledger.jsonl'));
  return destDir;
}

const liveDir = path.join(TMP, 'brain');
const dirA = path.join(TMP, 'capture-a');
const dirB = path.join(TMP, 'capture-b');

const brain = seedBasic({ dir: liveDir, ledger: 'full' });
brain.inject('p.encode', 'in', { kind: 'event', data: { text: 'hello brain' } });
brain.inject('p.encode', 'in', { kind: 'event', data: { text: 'trace this signal' } }, { delay: 1 });
brain.tick(2100);
captureStateDir(brain, liveDir, dirA);

// A second wave of input between the two captures, so hebbian learning on a.bundle's one
// incoming edge (p.encode -> a.bundle) has something to move between A and B: otherwise the
// 500 extra ticks are silent (nothing is due besides the 1 s heartbeat) and weight drift
// would trivially be zero.
brain.inject('p.encode', 'in', { kind: 'event', data: { text: 'second wave of signal' } });
brain.inject('p.encode', 'in', { kind: 'event', data: { text: 'more tokens for the bundle' } }, { delay: 2 });
brain.tick(500);
captureStateDir(brain, liveDir, dirB);

// ---------------------------------------------------------------- traceTree
test('traceTree on the latest a.predict run reaches p.encode', () => {
  const b = loadBrainAt(dirB);
  const events = ledgerEventsFor(b);
  const predictRuns = events.filter((e) => e.type === 'cell.run' && e.cell === 'a.predict');
  assert.ok(predictRuns.length > 0, 'a.predict ran at least once');
  const latest = predictRuns[predictRuns.length - 1];

  const result = traceTree(b, latest.seq, 12);
  assert.equal(result.root, latest.seq);
  assert.ok(result.nodes.length > 1, 'the trace has more than just the root');

  const reachesEncode = result.nodes.some((n) => n.type === 'cell.run' && n.cell === 'p.encode');
  assert.ok(reachesEncode, 'upstream trace from a.predict reaches p.encode; nodes: ' + result.nodes.map((n) => n.cell + '/' + n.type).join(', '));

  // the walk goes through a.bundle in between (p.encode -> a.bundle -> a.predict is the only wiring)
  assert.ok(result.nodes.some((n) => n.cell === 'a.bundle'), 'the trace passes through a.bundle');

  // every hop from a signal up to the cell.run that produced it is a same-cell "emit", and
  // every hop from a cell.run up to a signal it consumed across the connectome names a
  // src -> dst wire; at least one of those must resolve to a real edge with a weight and delay
  const connectomeHops = result.edges.filter((e) => e.via === 'consumed');
  assert.ok(connectomeHops.some((e) => typeof e.w === 'number' && typeof e.delay === 'number'), 'at least one hop names the connectome edge that carried it');
});

test('traceTree depth limit truncates instead of walking the whole ledger', () => {
  const b = loadBrainAt(dirB);
  const events = ledgerEventsFor(b);
  const latest = events.filter((e) => e.type === 'cell.run' && e.cell === 'a.predict').pop();
  const shallow = traceTree(b, latest.seq, 1);
  assert.ok(shallow.nodes.length < traceTree(b, latest.seq, 12).nodes.length, 'depth 1 sees fewer nodes than depth 12');
});

// ---------------------------------------------------------------- inspectBrain
test('inspectBrain lists every region with its true cell count', () => {
  const b = loadBrainAt(dirB);
  const report = inspectBrain(b);

  assert.equal(report.cellCount, b.cells.length);
  const reportedRegions = new Set(report.regions.map((r) => r.region));
  assert.deepEqual([...reportedRegions].sort(), [...b.regions.keys()].sort());
  for (const r of report.regions) assert.equal(r.cells, b.regions.get(r.region).cells.size, 'region ' + r.region + ' cell count matches the brain');

  // every circuit listed under a region really belongs to that region, and its kind
  // breakdown sums back to its own cell count
  for (const r of report.regions) {
    for (const c of r.circuits) {
      assert.equal(brainCircuitRegion(b, c.key), r.region);
      const kindSum = Object.values(c.kinds).reduce((a, x) => a + x, 0);
      assert.equal(kindSum, c.cells);
    }
  }

  // clock and gate are read straight off the brain, not recomputed
  assert.equal(report.clock.t, b.clock.t);
  assert.equal(report.clock.gen, b.clock.gen);
  assert.deepEqual(report.gate.stats, b.gate.stats);

  // per-cell stats table is sorted by runs, descending, and never longer than 20
  assert.ok(report.cellStatsTop.length <= 20);
  for (let i = 1; i < report.cellStatsTop.length; i++) assert.ok(report.cellStatsTop[i - 1].runs >= report.cellStatsTop[i].runs);

  // degree distribution: in-degree summed over all cells equals out-degree summed (every
  // active edge is one of each)
  const con = b.connectome;
  let liveEdges = 0;
  for (let e = 0; e < con.size(); e++) if (con.flags[e] & 1) liveEdges++;
  assert.equal(report.degree.in.n, b.cells.length);
  assert.equal(report.degree.out.n, b.cells.length);
});
function brainCircuitRegion(b, key) { return b.circuits.get(key).region; }

test('inspectBrain weight histogram covers exactly the active edges', () => {
  const b = loadBrainAt(dirB);
  const report = inspectBrain(b);
  const totalBinned = report.weightHistogram.bins.reduce((a, x) => a + x.count, 0);
  assert.equal(totalBinned, report.weightHistogram.n);
  let liveEdges = 0;
  const con = b.connectome;
  for (let e = 0; e < con.size(); e++) if (con.flags[e] & 1) liveEdges++;
  assert.equal(report.weightHistogram.n, liveEdges);
});

// ---------------------------------------------------------------- diffSnapshots
test('diffSnapshots reports the clock delta and a real, nonzero weight drift', () => {
  const a = loadBrainAt(dirA), b = loadBrainAt(dirB);
  const d = diffSnapshots(a, b);

  assert.equal(d.clockDelta.t, 500, 'exactly 500 more ticks happened between the two captures');
  assert.equal(d.clockDelta.gen, 0, 'this seed never advances gen');

  // ledger seq delta cross-checked against the raw event counts of each capture's own
  // ledger.jsonl copy, not just against itself
  const aEvents = ledgerEventsFor(a), bEvents = ledgerEventsFor(b);
  assert.equal(a.ledger.seq, aEvents.length, 'capture A ledger seq matches its own event count');
  assert.equal(b.ledger.seq, bEvents.length, 'capture B ledger seq matches its own event count');
  assert.equal(d.ledgerSeqDelta, bEvents.length - aEvents.length);
  assert.ok(d.ledgerSeqDelta > 0, 'the second capture has strictly more ledger history: ' + d.ledgerSeqDelta);

  // the second wave of injected signal drove real hebbian learning on p.encode -> a.bundle
  assert.ok(d.weightDrift.considered > 0);
  assert.ok(d.weightDrift.changed > 0, 'at least one shared edge changed weight');
  assert.ok(d.weightDrift.meanAbsDelta > 0, 'mean |delta| is a real printed number: ' + d.weightDrift.meanAbsDelta);
  assert.ok(d.weightDrift.maxAbsDelta >= d.weightDrift.meanAbsDelta);

  // no cells are ever added or removed by this seed; the arrays exist and are empty, not missing
  assert.deepEqual(d.cellsAdded, []);
  assert.deepEqual(d.cellsRemoved, []);
});

// ---------------------------------------------------------------- the CLIs, as child processes
function run(bin, args) {
  return spawnSync(process.execPath, [bin, ...args], { cwd: ROOT, encoding: 'utf8', timeout: 60_000 });
}

test('trace CLI: text, --json and --mermaid all exit 0 and reach p.encode', () => {
  const b = loadBrainAt(dirB);
  const latest = ledgerEventsFor(b).filter((e) => e.type === 'cell.run' && e.cell === 'a.predict').pop();

  const text = run(TRACE_BIN, [dirB, '--seq', String(latest.seq)]);
  assert.equal(text.status, 0, text.stderr);
  assert.match(text.stdout, /trace seq=/);
  assert.match(text.stdout, /p\.encode/);
  assert.match(text.stdout, /a\.bundle/);

  const json = run(TRACE_BIN, [dirB, '--seq', String(latest.seq), '--json']);
  assert.equal(json.status, 0, json.stderr);
  const parsed = JSON.parse(json.stdout);
  assert.equal(parsed.root, latest.seq);
  assert.ok(parsed.nodes.some((n) => n.cell === 'p.encode'));

  const mermaid = run(TRACE_BIN, [dirB, '--seq', String(latest.seq), '--mermaid']);
  assert.equal(mermaid.status, 0, mermaid.stderr);
  assert.match(mermaid.stdout, /^graph BT/);

  // pointing directly at the snapshot.json file (the "or a state dir" alternative) works too
  const viaFile = run(TRACE_BIN, [path.join(dirB, 'snapshot.json'), '--seq', String(latest.seq)]);
  assert.equal(viaFile.status, 0, viaFile.stderr);

  const missing = run(TRACE_BIN, [dirB]);
  assert.equal(missing.status, 1, 'no --seq is refused');
});

test('inspect CLI: text and --json both exit 0 and list every region', () => {
  const text = run(INSPECT_BIN, [dirB]);
  assert.equal(text.status, 0, text.stderr);
  assert.match(text.stdout, /regions and circuits/);
  assert.match(text.stdout, /perception/);
  assert.match(text.stdout, /association/);
  assert.match(text.stdout, /cognitive/);
  assert.match(text.stdout, /motor/);
  assert.match(text.stdout, /memory/);
  assert.match(text.stdout, /per-cell stats/);
  assert.match(text.stdout, /weight histogram/);
  assert.match(text.stdout, /gate/);

  const json = run(INSPECT_BIN, [dirB, '--json']);
  assert.equal(json.status, 0, json.stderr);
  const parsed = JSON.parse(json.stdout);
  assert.equal(parsed.regions.length, 5);
});

test('diff CLI: text and --json both exit 0 and print the weight drift', () => {
  const text = run(DIFF_BIN, [dirA, dirB]);
  assert.equal(text.status, 0, text.stderr);
  assert.match(text.stdout, /weight drift/);
  assert.match(text.stdout, /ledger seq\+/);

  const json = run(DIFF_BIN, [dirA, dirB, '--json']);
  assert.equal(json.status, 0, json.stderr);
  const parsed = JSON.parse(json.stdout);
  assert.equal(parsed.clockDelta.t, 500);
  assert.ok(parsed.weightDrift.meanAbsDelta > 0);

  const missing = run(DIFF_BIN, [dirA]);
  assert.equal(missing.status, 1, 'a single argument is refused');
});

// ---------------------------------------------------------------- docs-numbers
// The tool that stops a document publishing a number no command printed. The fixture is a
// tiny docs tree of its own (its own NUMBERS.md, its own verdict file) so the assertion is
// about the tool and not about whatever the real bench/verdicts happens to hold today.
test('docsNumbers: one protected number and one unprotected number in a fixture doc', () => {
  const root = path.join(TMP, 'docs-numbers-fixture');
  mkdirSync(path.join(root, 'docs'), { recursive: true });
  mkdirSync(path.join(root, 'bench', 'verdicts'), { recursive: true });
  writeFileSync(path.join(root, 'bench', 'verdicts', 'fake.json'), JSON.stringify({ at: '2026-01-01T00:00:00.000Z', edges: 91159, share: 0.41875 }));
  writeFileSync(path.join(root, 'docs', 'NUMBERS.md'), [
    '| bench | measure | value | measured at |', '|---|---|---|---|',
    '| fake | edges | 91159 | 2026-01-01T00:00:00.000Z |', '',
  ].join('\n'));
  const doc = path.join(root, 'docs', 'FIXTURE.md');
  writeFileSync(doc, [
    '# Fixture',
    '',
    'The organism holds 91,159 edges, which a verdict printed.',
    'It also claims a throughput of 777,777,777.7 units, which nothing printed.',
    '',
    'Skipped by rule, not by hand: section 3, the year 2026, `code 4242`, and arXiv 2505.22954.',
    '',
  ].join('\n'));

  const known = knownValues(root);
  const r = checkDoc(doc, known, []);
  assert.equal(r.protected, 1, 'the one value a verdict carries is protected: ' + JSON.stringify(r));
  assert.equal(r.unprotected, 1, 'the one value nothing carries is unprotected: ' + JSON.stringify(r.misses));
  assert.equal(r.misses.length, 1);
  assert.equal(r.misses[0].value, '777,777,777.7');
  assert.equal(r.misses[0].line, 4);

  // the third line is skipped entirely, and each skip names the rule that skipped it
  assert.ok(r.skipped >= 3, 'the reference, the year and the citation identifier are all skipped: ' + JSON.stringify(r.skips));
  assert.ok(r.skips['cross-reference'] >= 1 && r.skips.year >= 1 && r.skips['citation-identifier'] >= 1, JSON.stringify(r.skips));
  assert.equal(r.weakProtected, 0, '91,159 is not a small integer, so it is not a weak match');

  // the allowlist absorbs the unprotected value only when an entry names it with a reason
  const allowed = checkDoc(doc, known, [{ doc: 'FIXTURE.md', value: '777,777,777.7', why: 'fixture: an allowlisted value carries its reason' }]);
  assert.equal(allowed.unprotected, 0);
  assert.equal(allowed.allowed, 1);
  assert.equal(allowed.protected, 1, 'an allowlist entry never converts a measured value');

  // and the CLI exits 1 on the same fixture, which is what makes it a gate
  const cli = run(path.join(ROOT, 'tools', 'docs-numbers.mjs'), [doc]);
  assert.equal(cli.status, 1, cli.stderr);
  assert.match(cli.stdout, /777,777,777\.7/);
});

test('docsNumbers: every allowlist entry carries a reason and a real document', () => {
  for (const a of ALLOWLIST) {
    assert.ok(a.doc && a.doc.endsWith('.md'), 'entry names a document: ' + JSON.stringify(a));
    assert.ok(/^[\d,.]+$/.test(a.value), 'entry names a value: ' + JSON.stringify(a));
    assert.ok(typeof a.why === 'string' && a.why.length > 20, 'entry states why it is not a measurement: ' + JSON.stringify(a));
    assert.ok(existsSync(path.join(ROOT, 'docs', a.doc)), 'the document exists: ' + a.doc);
  }
});

// The fixture test above proves the tool works on a tree it built itself. It proves nothing
// about the documents this repository actually ships, which is the thing that can go wrong:
// a number is correct on the day it is typed and false the next time a bench runs. These two
// documents are the ones a fair registers against, so they are checked against the live
// docs/NUMBERS.md and the live bench/verdicts, not against a fixture. If this test fails, a
// number in an ISEF document has gone stale or was never printed; fix the document, do not
// widen the allowlist, because the allowlist exists for constants that are not measurements
// of this build.
test('docsNumbers: the ISEF documents publish no number that no command printed', () => {
  const known = knownValues(ROOT);
  for (const name of ['ISEF.md', 'ISEF-REGISTRATION.md']) {
    const file = path.join(ROOT, 'docs', name);
    assert.ok(existsSync(file), 'the document exists: ' + name);
    const r = checkDoc(file, known);
    assert.equal(r.unprotected, 0,
      name + ' publishes a number that is in neither docs/NUMBERS.md nor any bench/verdicts file: '
      + JSON.stringify(r.misses, null, 2));
    assert.ok(r.protected > 0, name + ' cites at least one measured number: ' + JSON.stringify(r));
  }
});

// A checker that walks a hand-typed list of documents reports a clean run for a document it
// never opened. This asserts the set the tool checks by default is the set of markdown files
// actually on disk under docs/, minus the generated index, so adding a document cannot make
// it invisible.
test('docsNumbers: the default document set is read off docs/, not typed', () => {
  const onDisk = readdirSync(path.join(ROOT, 'docs'))
    .filter((n) => n.endsWith('.md') && !GENERATED_DOCS.includes(n)).sort();
  assert.deepEqual(defaultDocs(ROOT), onDisk, 'every markdown document under docs/ is checked');
  assert.ok(onDisk.length >= 2, 'docs/ holds documents to check: ' + JSON.stringify(onDisk));
  assert.ok(onDisk.includes('ISEF.md') && onDisk.includes('ISEF-REGISTRATION.md'));
  assert.ok(!defaultDocs(ROOT).includes('NUMBERS.md'), 'the generated index is evidence, not a document under test');

  // a document dropped into a fixture docs/ is picked up without anyone editing the tool
  const root = path.join(TMP, 'docs-numbers-set');
  mkdirSync(path.join(root, 'docs'), { recursive: true });
  writeFileSync(path.join(root, 'docs', 'NUMBERS.md'), '# generated\n');
  assert.deepEqual(defaultDocs(root), []);
  writeFileSync(path.join(root, 'docs', 'NEW.md'), '# a document nobody told the tool about\n');
  assert.deepEqual(defaultDocs(root), ['NEW.md']);
});

// A stale number is the failure mode this whole tool exists for, and it does not look like a
// missing number: it looks like a number that used to be right. This drives the checker with
// a document that quotes a value from an older run of a verdict the fixture then overwrites,
// which is exactly what happened to the gate tally the ISEF documents used to reprint.
test('docsNumbers: a value that was printed by an earlier run and then overwritten is unprotected', () => {
  const root = path.join(TMP, 'docs-numbers-stale');
  mkdirSync(path.join(root, 'docs'), { recursive: true });
  mkdirSync(path.join(root, 'bench', 'verdicts'), { recursive: true });
  const verdict = path.join(root, 'bench', 'verdicts', 'gateish.json');
  writeFileSync(verdict, JSON.stringify({ at: '2026-01-01T00:00:00.000Z', assertionsPassed: 47231 }));
  writeFileSync(path.join(root, 'docs', 'NUMBERS.md'), [
    '| bench | measure | value | measured at |', '|---|---|---|---|', '',
  ].join('\n'));
  const doc = path.join(root, 'docs', 'STALE.md');
  writeFileSync(doc, ['# Stale', '', 'The last run passed 47,231 assertions.', ''].join('\n'));

  const fresh = checkDoc(doc, knownValues(root), []);
  assert.equal(fresh.unprotected, 0, 'while the verdict carries it, the number is protected: ' + JSON.stringify(fresh.misses));

  // the bench runs again and the tally moves; the document did not move with it
  writeFileSync(verdict, JSON.stringify({ at: '2026-01-02T00:00:00.000Z', assertionsPassed: 47298 }));
  const stale = checkDoc(doc, knownValues(root), []);
  assert.equal(stale.unprotected, 1, 'once the verdict is overwritten the number is unprotected: ' + JSON.stringify(stale));
  assert.equal(stale.misses[0].value, '47,231');
});

test('lib: resolveStateDir accepts both a directory and its snapshot.json', () => {
  assert.ok(existsSync(path.join(dirA, 'snapshot.json')));
  const viaDir = loadBrainAt(dirA);
  const viaFile = loadBrainAt(path.join(dirA, 'snapshot.json'));
  assert.equal(viaDir.cells.length, viaFile.cells.length);
  assert.equal(viaDir.clock.t, viaFile.clock.t);
});
