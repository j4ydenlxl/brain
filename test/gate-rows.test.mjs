// test/gate-rows.test.mjs: the two rows Board 12 added to node bench/gate.mjs, on hand built trees.
//
//   (a) seedOf reads a seed from any spelling of a path to one, and nothing else.
//   (b) emittedSeeds, censusRecords and censusFor: a census counts only while it still describes
//       the seed (same manifest hash, or with no hash written after the manifest changed), the bar
//       before a narrow run, then the newest; a refused run is a record with no count.
//   (c) LOAD-BEARING: GREEN when every seed has a census and no seed the daemon loads is more than
//       10 percent dead; RED for a loaded seed over the cap, for a seed with no census, for a seed
//       whose every census is stale, and for no seeds at all. Exactly 10 percent is not above it.
//   (d) what the daemon loads: the import closure of its entries, a seed named by path in a string
//       literal (not in a usage string, not in a comment when the audit lexer reads the source),
//       and the seeds its checkpoint metas name.
//   (e) BOUNDARY: GREEN on a whole verdict with every copied buffer under the cap and nothing
//       unlisted; RED for a buffer at or over the cap, an unlisted boundary in the verdict or in
//       the scan of the tree now, a missing verdict (not measured) and a partial one. A wire size
//       over the cap is printed and is not the cap measure.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  seedOf, emittedSeeds, censusRecords, censusFor, loadBearingRow, importClosure, seedsNamedIn,
  checkpointMetas, daemonLoads, boundaryRow, DEAD_SHARE_CAP, DAEMON_ENTRIES,
} from '../bench/gate.mjs';
import { lex } from '../tools/boundary-audit.mjs';

const tmp = () => mkdtempSync(path.join(tmpdir(), 'gate-rows-'));
const put = (root, rel, text) => {
  const f = path.join(root, rel);
  mkdirSync(path.dirname(f), { recursive: true });
  writeFileSync(f, typeof text === 'string' ? text : JSON.stringify(text, null, 2));
  return f;
};
const touch = (f, iso) => utimesSync(f, new Date(iso), new Date(iso));
const T0 = '2026-09-24T00:00:00.000Z', T1 = '2026-09-24T01:00:00.000Z', T2 = '2026-09-24T02:00:00.000Z', T3 = '2026-09-24T03:00:00.000Z', T4 = '2026-09-24T04:00:00.000Z';

test('(a) seedOf reads a seed from any spelling of a path to one, and nothing else', () => {
  assert.equal(seedOf('organism/gen-0'), 'organism/gen-0');
  assert.equal(seedOf('organism/gen-0/'), 'organism/gen-0');
  assert.equal(seedOf('./organism/gen-0'), 'organism/gen-0');
  assert.equal(seedOf('../organism/scale-52000-pruned/'), 'organism/scale-52000-pruned');
  assert.equal(seedOf('C:\\brain\\organism\\gen-1-4\\'), 'organism/gen-1-4');
  assert.equal(seedOf('/home/x/brain/organism/g_2.1'), 'organism/g_2.1');
  assert.equal(seedOf('organism/gen-0/index.mjs'), null, 'a file inside a seed is not the seed');
  assert.equal(seedOf('organism'), null);
  assert.equal(seedOf('my-organism/gen-0'), null);
  assert.equal(seedOf('organism/.tmp'), null);
  assert.equal(seedOf(42), null);
  assert.equal(DEAD_SHARE_CAP, 0.10);
  assert.deepEqual([...DAEMON_ENTRIES], ['daemon/run.mjs', 'bin/serve.mjs', 'daemon/multiply.mjs']);
});

// a tree with three seeds (a with a hash, b without, c with only an index.mjs) and their census
function censusTree() {
  const root = tmp();
  put(root, 'organism/a/manifest.json', { hash: 'h-a' });
  touch(put(root, 'organism/b/manifest.json', { cells: 3 }), T0);
  touch(put(root, 'organism/c/index.mjs', 'export default 1;\n'), T0);
  put(root, 'organism/.tmp/manifest.json', { hash: 'x' });
  mkdirSync(path.join(root, 'organism', 'd'));
  put(root, 'organism/readme.txt', 'not a seed');
  const vd = path.join(root, 'bench', 'verdicts');
  put(root, 'bench/verdicts/census.json', { at: T1, isTheBar: true, seed: 'organism/a', lines: { loaded: 100, loadBearing: 95 }, live: { manifestHash: 'h-a' }, mode: 'live' });
  put(root, 'bench/verdicts/census-a-old-partial.json', { at: T3, isTheBar: false, seed: 'organism/a', lines: { loaded: 100, loadBearing: 50 }, hash: { manifest: 'h-old' } });
  put(root, 'bench/verdicts/census-a-newer-partial.json', { at: T2, isTheBar: false, seed: './organism/a/', lines: { loaded: 100, loadBearing: 90 }, live: { manifestHash: 'h-a' } });
  put(root, 'bench/verdicts/census-all.json', { at: T1, isTheBar: false, seeds: { b: { seed: 'organism/b', lines: { loaded: 200, loadBearing: 150 } }, c: { seed: 'organism/c', lines: { loaded: 10, loadBearing: 10 }, mode: 'static' } } });
  put(root, 'bench/verdicts/census-b-refused-partial.json', { at: T2, isTheBar: false, seed: 'organism/b', refused: 'too large' });
  put(root, 'bench/verdicts/census-bad.json', '{ not json');
  put(root, 'bench/verdicts/other.json', { seed: 'organism/a', lines: { loaded: 1, loadBearing: 0 } });
  return { root, vd };
}

test('(b) a census counts only while it describes the seed, the bar first, then the newest', () => {
  const { root, vd } = censusTree();
  try {
    const seeds = emittedSeeds(root);
    assert.deepEqual(seeds.map((s) => [s.seed, s.hash, s.by]), [['organism/a', 'h-a', 'manifest.json'], ['organism/b', null, 'manifest.json'], ['organism/c', null, 'index.mjs']]);
    assert.equal(emittedSeeds(path.join(root, 'nowhere')).length, 0);

    const records = censusRecords(vd);
    assert.deepEqual(records.map((r) => r.file + ' ' + r.seed).sort(), [
      'census-a-newer-partial.json organism/a', 'census-a-old-partial.json organism/a', 'census-all.json organism/b', 'census-all.json organism/c',
      'census-b-refused-partial.json organism/b', 'census.json organism/a',
    ]);
    const refused = records.find((r) => r.file === 'census-b-refused-partial.json');
    assert.equal(refused.loaded, null, 'a refused run is a record with no count, not a zero');

    const [a, b, c] = seeds;
    const ca = censusFor(a, records);
    assert.equal(ca.pick.file, 'census.json', 'the bar before a newer narrow run');
    assert.equal(ca.pick.by, 'hash');
    assert.deepEqual(ca.stale, ['census-a-old-partial.json'], 'a census of another manifest hash no longer describes the seed');
    const narrowOnly = censusFor(a, records.filter((r) => r.file !== 'census.json'));
    assert.equal(narrowOnly.pick.file, 'census-a-newer-partial.json');

    const cb = censusFor(b, records);
    assert.equal(cb.pick.file, 'census-all.json');
    assert.equal(cb.pick.by, 'time', 'no hash to compare: written after the manifest changed');
    assert.equal(cb.records, 2);
    assert.equal(cb.counted, 1);
    // the manifest changed after the census was written: it no longer describes the seed
    assert.equal(censusFor({ ...b, changedAt: T4 }, records).pick, null);
    assert.deepEqual(censusFor({ ...b, changedAt: T4 }, records).stale, ['census-all.json']);
    assert.equal(censusFor(c, records).pick.mode, 'static');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('(c) LOAD-BEARING: GREEN under the cap, RED for a loaded seed over it, a seed with no census, or no seeds', () => {
  const { root, vd } = censusTree();
  try {
    const seeds = emittedSeeds(root);
    const records = censusRecords(vd);
    const daemon = (loads) => ({ entries: ['daemon/run.mjs'], entriesPresent: ['daemon/run.mjs'], closure: 7, reader: 'a test', named: [], metas: 2, kinds: { whole: 2 }, metaSeeds: [], seeds: loads });

    const green = loadBearingRow({ seeds, records, daemon: daemon([]) });
    assert.equal(green.ok, true, green.line);
    assert.equal(green.counted, 3);
    assert.deepEqual(green.per.map((p) => [p.seed, p.deadShare]), [['organism/a', 0.05], ['organism/b', 0.25], ['organism/c', 0]]);
    assert.match(green.line, /^LOAD-BEARING GREEN: 3 of 3 emitted seeds under organism\/ have a census on disk that still describes them \(1 by manifest hash, 2 written after the manifest last changed; 1 from a bar census, 2 from a narrow run\)/);
    assert.ok(green.line.includes('dead share (1 - load-bearing lines / loaded lines) from 0.00% (c) to 25.00% (b)'), green.line);
    assert.ok(green.line.includes('the daemon loads 0 of 3: the 7 modules'), green.line);
    assert.ok(green.line.includes('so the 10 percent cap binds no seed'), green.line);
    assert.ok(green.line.includes('c 0.00% (census-all.json, static: a lower bound on the dead share)'), green.line);

    // the daemon loads a (5 percent dead): under the cap, GREEN, and the share is printed
    const underCap = loadBearingRow({ seeds, records, daemon: daemon(['organism/a']) });
    assert.equal(underCap.ok, true, underCap.line);
    assert.ok(underCap.line.includes('the daemon loads 1 of 3 (a 5.00%)'), underCap.line);

    // the daemon loads b (25 percent dead): RED, named with its share
    const over = loadBearingRow({ seeds, records, daemon: daemon(['organism/b']) });
    assert.equal(over.ok, false);
    assert.deepEqual(over.overCap, ['organism/b']);
    assert.ok(over.line.startsWith('LOAD-BEARING RED: '));
    assert.ok(over.line.includes('over the 10 percent cap and loaded: b 25.00%'), over.line);

    // exactly 10 percent dead is not above the cap
    const edge = [{ seed: 'organism/e', hash: 'h-e', changedAt: T0, by: 'manifest.json' }];
    const edgeRec = [{ file: 'census-e.json', at: T1, isTheBar: true, seed: 'organism/e', loaded: 10, loadBearing: 9, hash: 'h-e', mode: null }];
    assert.equal(loadBearingRow({ seeds: edge, records: edgeRec, daemon: daemon(['organism/e']) }).ok, true);
    edgeRec[0].loadBearing = 8;
    assert.equal(loadBearingRow({ seeds: edge, records: edgeRec, daemon: daemon(['organism/e']) }).ok, false);

    // a seed with no census at all is RED even when the daemon does not load it
    const withE = [...seeds, { seed: 'organism/e', hash: null, changedAt: T0, by: 'index.mjs' }];
    const none = loadBearingRow({ seeds: withE, records, daemon: daemon([]) });
    assert.equal(none.ok, false);
    assert.deepEqual(none.noCensus, ['organism/e']);
    assert.ok(none.line.includes('1 have none: e (no census names it)'), none.line);
    assert.ok(none.line.includes('e no census'), none.line);

    // a seed whose only counts are stale, and one tried but never counted, are RED by name
    const staleB = seeds.map((s) => (s.seed === 'organism/b' ? { ...s, changedAt: T4 } : s));
    const st = loadBearingRow({ seeds: staleB, records, daemon: daemon([]) });
    assert.equal(st.ok, false);
    assert.ok(st.line.includes('b (every census with a count is stale: census-all.json)'), st.line);
    const tried = loadBearingRow({ seeds: [seeds[1]], records: records.filter((r) => r.file === 'census-b-refused-partial.json'), daemon: daemon([]) });
    assert.equal(tried.ok, false);
    assert.ok(tried.line.includes('b (1 census record(s), none with a loaded and a load-bearing count)'), tried.line);

    // no seeds: nothing was measured, so it is not GREEN
    const empty = loadBearingRow({ seeds: [], records: [], daemon: null });
    assert.equal(empty.ok, false);
    assert.ok(empty.line.startsWith('LOAD-BEARING RED: no emitted seed under organism/, so nothing was measured; '), empty.line);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('(d) the daemon loads what its import closure names by path and what its checkpoints name', async () => {
  const root = tmp();
  try {
    put(root, 'daemon/run.mjs', [
      "import { x } from './lib.mjs';",
      "const w = new URL('./worker.mjs', import.meta.url);",
      "const usage = 'usage: run --seed organism/gen-0 [--ticks n]';",
      "// see 'organism/gen-0' for the old default",
      "const later = () => import('./late.mjs');",
      "const other = path.join(root, 'organism', 'not-a-seed');",
      '',
    ].join('\n'));
    put(root, 'daemon/lib.mjs', "import path from 'node:path';\nexport const x = path.join(ROOT, 'organism', 'gen-1');\n");
    put(root, 'daemon/worker.mjs', "export const s = '../organism/gen-2/';\n");
    put(root, 'daemon/late.mjs', 'export const t = "organism/gen-3";\n');
    put(root, 'daemon/unrelated.mjs', "export const u = 'organism/gen-4';\n");
    const seeds = ['gen-0', 'gen-1', 'gen-2', 'gen-3', 'gen-4'].map((n) => ({ seed: 'organism/' + n }));

    const closure = importClosure(root, ['daemon/run.mjs', 'bin/serve.mjs']);
    assert.deepEqual(closure, ['daemon/late.mjs', 'daemon/lib.mjs', 'daemon/run.mjs', 'daemon/worker.mjs']);

    const hits = seedsNamedIn(root, closure, seeds, lex);
    assert.deepEqual(hits.map((h) => h.file + ':' + h.line + ' ' + h.seed), ['daemon/late.mjs:1 organism/gen-3', 'daemon/lib.mjs:2 organism/gen-1', 'daemon/worker.mjs:1 organism/gen-2']);
    assert.equal(hits.find((h) => h.seed === 'organism/gen-1').text, "'organism', 'gen-1'");
    // the plain scan cannot tell a comment from code, which is why the row names its reader
    const plain = seedsNamedIn(root, closure, seeds, null);
    assert.deepEqual(plain.filter((h) => h.seed === 'organism/gen-0').map((h) => h.file + ':' + h.line), ['daemon/run.mjs:4']);

    const state = path.join(root, 'state');
    put(root, 'state/brain/meta.json', { kind: 'whole', t: 1500 });
    put(root, 'state/pop/i0/meta.json', { kind: 'whole', from: 'organism/gen-1' });
    put(root, 'state/pop/i1/meta.json', { kind: 'seeded', seed: 'C:\\x\\organism\\gen-2' });
    put(root, 'state/ledger/meta.json', { kind: 'whole', seed: 'organism/gen-4' });
    put(root, 'state/pop/bad/meta.json', '{ no');
    const metas = checkpointMetas([state]);
    assert.deepEqual(metas.map((m) => m.kind + ' ' + m.seeds.join(',')).sort(), ['seeded organism/gen-2', 'whole ', 'whole organism/gen-1']);

    const d = await daemonLoads({ root, seeds, entries: ['daemon/run.mjs', 'bin/serve.mjs'], states: [state] });
    assert.deepEqual(d.seeds, ['organism/gen-1', 'organism/gen-2', 'organism/gen-3']);
    assert.deepEqual(d.entriesPresent, ['daemon/run.mjs']);
    assert.equal(d.closure, 4);
    assert.match(d.reader, /^the audit lexer/);
    assert.deepEqual(d.kinds, { whole: 2, seeded: 1 });
    assert.deepEqual(d.metaSeeds, ['organism/gen-1', 'organism/gen-2']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('(e) BOUNDARY: GREEN under the cap and listed; RED over it, unlisted, missing or partial', () => {
  const base = () => ({
    at: T1, command: 'node tools/boundary-audit.mjs --bar', isTheBar: true, cap: 16,
    table: [
      { file: 'a.mjs', line: 1, how: 'probe', afterBytes: 8, afterWire: 8 },
      { file: 'b.mjs', line: 2, how: 'literal', afterBytes: 4, afterWire: 20, wireUnderCap: false },
      { file: 'c.mjs', line: 3, how: 'probe', afterBytes: 0, afterWire: 0, afterWasmViews: 0 },
    ],
    allowlist: { unlisted: [], overCap: [] },
  });
  const live = { ran: true, found: 3, listed: 3, unlisted: [], stale: [], overCap: [] };

  const g = boundaryRow(base(), { live });
  assert.equal(g.ok, true, g.line);
  assert.match(g.line, /^BOUNDARY GREEN: 3 boundaries in bench\/verdicts\/boundary\.json \(isTheBar true, 2026-09-24T01:00:00\.000Z\), measured probe 2, literal 1, not measured 0; 0 carried copied buffers at or over the 16 byte cap \(largest copied 8 bytes at a\.mjs:1\)/);
  assert.ok(g.line.includes('unlisted in the verdict 0, and a static scan of the tree now finds 3 boundaries against 3 listed: unlisted 0, stale 0'), g.line);
  // the wire size is printed and does not turn the row RED: the cap is on copied buffers
  assert.ok(g.line.endsWith('on the wire (strings included, reported by the audit and not its cap measure) 1 reached the cap: b.mjs:2 20 bytes'), g.line);
  assert.deepEqual(g.overCapWire, [{ at: 'b.mjs:2', bytes: 20 }]);
  assert.equal(boundaryRow(base(), { live: null }).ok, true, 'no scan of the tree now is printed, not RED on its own');

  const over = base(); over.table[0].afterBytes = 16;
  const o = boundaryRow(over, { live });
  assert.equal(o.ok, false);
  assert.deepEqual(o.overCap, ['a.mjs:1']);
  assert.ok(o.line.includes('1 carried copied buffers at or over the 16 byte cap (a.mjs:1 16 bytes)'), o.line);
  const flagged = base(); flagged.table[1].underCap = false;
  assert.equal(boundaryRow(flagged, { live }).ok, false, 'the audit\'s own underCap false is RED');

  const un = base(); un.allowlist.unlisted = [{ key: 'b.mjs|postMessage|x' }];
  const u = boundaryRow(un, { live });
  assert.equal(u.ok, false);
  assert.ok(u.line.includes('unlisted in the verdict 1 (b.mjs|postMessage|x)'), u.line);
  const norec = base(); delete norec.allowlist;
  assert.ok(boundaryRow(norec, { live }).line.includes('unlisted in the verdict not recorded'));
  assert.equal(boundaryRow(norec, { live }).ok, false, 'a verdict that did not check the list cannot say none is unlisted');
  const lu = boundaryRow(base(), { live: { ...live, found: 4, unlisted: ['d.mjs|Worker|y'] } });
  assert.equal(lu.ok, false);
  assert.ok(lu.line.includes('finds 4 boundaries against 3 listed: unlisted 1 (d.mjs|Worker|y)'), lu.line);
  const ao = base(); ao.allowlist.overCap = [{ key: 'a.mjs|send|z' }];
  assert.equal(boundaryRow(ao, { live }).ok, false);

  const um = base(); um.table[2].afterBytes = null;
  const m = boundaryRow(um, { live });
  assert.equal(m.ok, false);
  assert.ok(m.line.includes('not measured 1 (c.mjs:3)'), m.line);

  const missing = boundaryRow(null, { live });
  assert.equal(missing.ok, false);
  assert.equal(missing.measured, false);
  assert.ok(missing.line.startsWith('BOUNDARY RED: not measured: bench/verdicts/boundary.json is not on disk or does not parse'), missing.line);
  assert.ok(boundaryRow({ at: T1, isTheBar: true, table: [] }, { live }).line.includes('carries no cap'));

  const part = base(); part.isTheBar = false;
  const p = boundaryRow(part, { live });
  assert.equal(p.ok, false);
  assert.ok(p.line.includes('(PARTIAL: isTheBar false)'), p.line);

  const views = base(); views.table[2].afterWasmViews = 2;
  assert.ok(boundaryRow(views, { live }).line.includes('views on a wasm heap 1'));
  assert.ok(boundaryRow(base(), { live: { ran: false, error: 'no audit' } }).line.includes('no scan of the tree now (no audit)'));
});
