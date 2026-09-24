// test/genome.test.mjs: the organism as source, proved at majors 200.
//
// Build it, write it out, read it back, and then refuse to be satisfied by counts. The
// round trip is only believed when the connectome's typed arrays are identical element by
// element, when the content hash agrees, and when fifty ticks on both brains leave the
// same statistics behind. Every emitted file is also parsed as an ES module, because a file
// that cannot be imported is not source, and every edge is checked against the kind
// compatibility rule independently of the wiring code that produced it.
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { buildOrganism, auditWiring, REGIONS } from '../seeds/organism.mjs';
import { emitOrganism, DEFAULT_SPLIT } from '../genome/emit.mjs';
import { loadFrom, loadOrganism, readManifest, verify, diffOrganisms } from '../genome/load.mjs';
import { f32, portPairs, accepts, stable, contentHash, lowerBound } from '../genome/wire.mjs';
import { getKind } from '../core/cell.mjs';
import { SEC, MIN, HOUR } from '../core/clock.mjs';

const MAJORS = 200;
const SUBCELLS = 8;

let dir, built, loaded, manifest, emitted;

before(async () => {
  dir = mkdtempSync(path.join(tmpdir(), 'brain-genome-'));
  built = buildOrganism({ majors: MAJORS, subcellsPerMajor: SUBCELLS, name: 'test-organism' });
  emitted = emitOrganism(built, { dir: path.join(dir, 'organism') });
  const r = await loadFrom(path.join(dir, 'organism'));
  loaded = r.brain; manifest = r.manifest;
});
after(() => { if (dir && existsSync(dir)) rmSync(dir, { recursive: true, force: true }); });

// ------------------------------------------------------------------ the organism
describe('buildOrganism', () => {
  test('builds majors x subcells cells across the regions the design names', () => {
    assert.equal(built.circuits.size, MAJORS);
    assert.equal(built.cells.length, MAJORS * SUBCELLS);
    assert.equal(built.regions.size, REGIONS.length);
    for (const r of REGIONS) assert.ok(built.regions.has(r.name), 'missing region ' + r.name);
    for (const name of ['perception', 'association', 'cognitive', 'memory', 'motor', 'homeostasis']) {
      assert.ok(built.regions.get(name).cells.size > 0, name + ' has no cells');
    }
  });

  test('every major is a circuit and every circuit has exactly subcellsPerMajor cells', () => {
    let total = 0;
    for (const c of built.circuits.values()) { assert.equal(c.cells.size, SUBCELLS, c.key); total += c.cells.size; }
    assert.equal(total, built.cells.length);
  });

  test('cells are drawn from more than one kind in every region', () => {
    for (const r of REGIONS) {
      const kinds = new Set();
      for (const idx of built.regions.get(r.name).cells) kinds.add(built.cells[idx].kind);
      assert.ok(kinds.size > 1, r.name + ' used only ' + [...kinds].join(','));
    }
  });

  test('periods cover the timescale spectrum and drivers are never event driven', () => {
    const periods = new Set(built.cells.map(c => c.policy.period));
    for (const p of [1, SEC, MIN, HOUR, 'event']) assert.ok(periods.has(p), 'no cell at period ' + p);
    for (const c of built.cells) {
      if (getKind(c.kind).ports.in.length === 0) {
        assert.notEqual(c.policy.period, 'event', c.id + ' has no in ports and would never run');
      }
    }
  });

  test('the homeostasis clock carries one driver per timescale and reaches every region', () => {
    const clock = [...built.circuits.values()].find(c => c.region === 'homeostasis');
    const cells = [...clock.cells].map(i => built.cells[i]);
    const drivers = cells.filter(c => getKind(c.kind).ports.in.length === 0);
    const periods = new Set(drivers.map(c => c.policy.period));
    for (const p of [1, SEC, MIN, HOUR]) assert.ok(periods.has(p), 'clock has no driver at period ' + p);
    const reached = new Set();
    for (const c of cells) for (const e of built.connectome.outOf(c.idx)) reached.add(built.cells[built.connectome.dst[e]].region);
    assert.equal(reached.size, REGIONS.length, 'clock reaches ' + [...reached].join(','));
  });

  test('wiring is sparse, local and long range, with delays on the long range edges', () => {
    const k = built.connectome;
    assert.ok(k.n > built.cells.length * 6, 'only ' + k.n + ' edges');
    assert.ok(k.n <= built.cells.length * 12, 'more edges than the budget allows: ' + k.n);
    let sameCircuit = 0, sameRegion = 0, crossRegion = 0, delayed = 0, maxDelay = 0;
    for (let e = 0; e < k.n; e++) {
      const a = built.cells[k.src[e]], b = built.cells[k.dst[e]];
      if (a.circuit === b.circuit) sameCircuit++;
      else if (a.region === b.region) sameRegion++;
      else crossRegion++;
      if (k.delay[e] > 0) delayed++;
      if (k.delay[e] > maxDelay) maxDelay = k.delay[e];
    }
    assert.ok(sameCircuit > 0 && sameRegion > 0 && crossRegion > 0,
      'local ' + sameCircuit + ' regional ' + sameRegion + ' long range ' + crossRegion);
    assert.ok(crossRegion < sameCircuit + sameRegion, 'long range wiring is not the minority');
    assert.ok(delayed > 0 && maxDelay > 1, 'no delays: max ' + maxDelay);
  });

  test('the same seed is the same organism, a different seed is not', () => {
    const a = buildOrganism({ majors: 40, name: 'det' });
    const b = buildOrganism({ majors: 40, name: 'det' });
    assert.equal(contentHash(a), contentHash(b));
    assert.deepEqual(diffOrganisms(a, b).differences, []);
    const c = buildOrganism({ majors: 40, name: 'det', seed: 'another' });
    assert.notEqual(contentHash(a), contentHash(c));
  });

  // A genome that wants a different share or a different roster per region used to have to
  // write the exported REGIONS table and put it back, which meant no two organisms could be
  // grown at the same time in one process (notes/generations.md request 4). The option is
  // read, never written, and the table it defaults to is unchanged by a build that used one.
  test('a regions option is honoured and the exported table is untouched by it', () => {
    const before = REGIONS.map(r => ({ share: r.share, roster: r.roster }));
    const table = [
      { name: 'perception', prefix: 'pe', share: 0.5, flow: [['cognitive', 1]], roster: ['encode.number', 'encode.time'] },
      { name: 'cognitive', prefix: 'co', share: 0.5, flow: [['perception', 1]], roster: ['num.arith'] },
    ];
    const b = buildOrganism({ majors: 20, subcellsPerMajor: 4, name: 'two-regions', regions: table });
    assert.equal(b.regions.size, 2, 'grew ' + [...b.regions.keys()].join(','));
    assert.equal(b.cells.length, 80);
    const kinds = new Set(b.cells.map(c => c.kind));
    assert.deepEqual([...kinds].sort(), ['encode.number', 'encode.time', 'num.arith']);
    // The default table is still the default table, and a build that takes no regions
    // argument still grows the organism the design names.
    REGIONS.forEach((r, i) => {
      assert.equal(r.share, before[i].share, r.name + ' share was written by a regions build');
      assert.equal(r.roster, before[i].roster, r.name + ' roster was written by a regions build');
    });
    assert.equal(buildOrganism({ majors: 20, subcellsPerMajor: 4, name: 'default-regions' }).regions.size, REGIONS.length);
  });

  test('a region table that is not a table, or flows nowhere, is refused by name', () => {
    assert.throws(() => buildOrganism({ majors: 8, regions: [] }), /regions must be a non empty array/);
    assert.throws(() => buildOrganism({ majors: 8, regions: [{ name: 'a', prefix: 'a', share: 1, roster: [] }] }), /empty roster/);
    assert.throws(() => buildOrganism({ majors: 8, regions: [{ name: 'a', prefix: 'a', share: 0, roster: ['num.arith'] }] }), /has share 0/);
    assert.throws(() => buildOrganism({
      majors: 8, regions: [{ name: 'a', prefix: 'a', share: 1, roster: ['num.arith'], flow: [['nowhere', 1]] }],
    }), /flows to nowhere/);
  });

  // The grid family and seq.fit were put into the perception and cognitive rosters so the
  // grid and sequence suites could be hosted (notes/generations.md request 6). Both guard
  // their input, so they are inert in an organism nobody has handed a grid or a tape of
  // terms; the assertion that matters is that they are present and that nothing throws.
  test('the rosters carry the kinds the grid and sequence suites are made of', () => {
    const kinds = new Set(built.cells.map(c => c.kind));
    for (const k of ['grid.rotate', 'grid.flip', 'grid.transpose', 'grid.crop', 'grid.translate', 'grid.tile', 'seq.fit']) {
      assert.ok(kinds.has(k), 'no ' + k + ' cell at ' + MAJORS + ' majors');
    }
  });

  test('no signal is refused and no cell throws over fifty ticks', () => {
    const b = buildOrganism({ majors: 40, name: 'quiet' });
    b.tick(50);
    assert.equal(b.stats.refused, 0);
    assert.equal(b.stats.errors, 0, JSON.stringify(b.lastError));
    assert.ok(b.stats.runs > 0);
  });
});

// ------------------------------------------------------------------ legality
describe('every edge passes the kind compatibility check', () => {
  test('the builder produced no illegal edge', () => {
    assert.equal(built.genome.wiring.illegal, 0);
    const audit = auditWiring(built);
    assert.equal(audit.checked, built.connectome.size());
    assert.deepEqual(audit.faults, []);
  });

  test('checked again independently: source port kinds are a subset of destination port kinds', () => {
    const k = built.connectome;
    let checked = 0;
    for (let e = 0; e < k.n; e++) {
      const a = built.cells[k.src[e]], b = built.cells[k.dst[e]];
      const outPort = a.ports.out[k.srcPort[e]], inPort = b.ports.in[k.dstPort[e]];
      assert.ok(outPort, 'edge ' + e + ': ' + a.id + ' has no out port ' + k.srcPort[e]);
      assert.ok(inPort, 'edge ' + e + ': ' + b.id + ' has no in port ' + k.dstPort[e]);
      assert.ok(accepts(outPort, inPort), 'edge ' + e + ': ' + a.id + '.' + outPort.name + ' -> ' + b.id + '.' + inPort.name);
      checked++;
    }
    assert.equal(checked, k.n);
  });

  test('Brain.compatiblePorts agrees that each wired pair of cells can be connected', () => {
    const k = built.connectome;
    const seen = new Set();
    for (let e = 0; e < k.n; e++) {
      const key = k.src[e] * 2097152 + k.dst[e];
      if (seen.has(key)) continue;
      seen.add(key);
      const a = built.cells[k.src[e]], b = built.cells[k.dst[e]];
      assert.notEqual(built.compatiblePorts(a, b), null, a.id + ' -> ' + b.id + ' has no compatible port pair');
      assert.ok(portPairs(a, b).length > 0);
    }
  });

  test('every out port is wired, predict.next.error included, and nothing throws', () => {
    // This port was the one exclusion the organism carried: predict.next.error is
    // (1 - sim(observed, predicted)) / 2, and sim of an all zero hypervector was 0/0, so it
    // emitted a NaN inside a `num` and the first exact arithmetic cell downstream threw.
    // Core reads a non-finite similarity as maximum error now, so the port is wired again
    // and the organism must still run clean.
    const k = built.connectome;
    let wired = 0, sources = 0;
    for (const c of built.cells) if (c.kind === 'predict.next') sources++;
    for (let e = 0; e < k.n; e++) {
      const a = built.cells[k.src[e]];
      if (a.kind === 'predict.next' && k.srcPort[e] === 1) wired++;
    }
    assert.ok(sources > 0, 'the organism has no predict.next cells to check');
    assert.ok(wired > 0, 'predict.next.error is wired nowhere: the exclusion is back');
    const probe = buildOrganism({ majors: MAJORS, subcellsPerMajor: SUBCELLS, name: 'error-port' });
    for (let i = 0; i < 50; i++) probe.tick();
    assert.equal(probe.stats.errors, 0, JSON.stringify(probe.lastError));
  });

  test('no cell meets two different signal kinds on one in port', () => {
    const k = built.connectome, claim = new Map();
    for (let e = 0; e < k.n; e++) {
      const key = k.dst[e] * 16 + k.dstPort[e];
      const out = built.cells[k.src[e]].ports.out[k.srcPort[e]];
      const kinds = [...out.kinds].sort().join('|');
      // A polymorphic out port re-emits whatever it received, so two such sources can
      // agree on paper and still deliver two different kinds: it must own the port alone.
      const mine = out.kinds.length > 1 ? kinds + '#' + k.src[e] : kinds;
      const prev = claim.get(key);
      if (prev === undefined) claim.set(key, mine);
      else assert.equal(prev, mine, 'cell ' + built.cells[k.dst[e]].id + ' port ' + k.dstPort[e] + ' meets ' + prev + ' and ' + mine);
    }
  });
});

// ------------------------------------------------------------------ emit
describe('emitOrganism', () => {
  test('writes regions, cells, edges, an index and a manifest', () => {
    const names = readdirSync(path.join(dir, 'organism')).sort();
    assert.ok(names.includes('regions.mjs'));
    assert.ok(names.includes('index.mjs'));
    assert.ok(names.includes('manifest.json'));
    assert.ok(names.some(n => /^cells-\d{3}\.mjs$/.test(n)), names.join(','));
    assert.ok(names.some(n => /^edges-\d{3}\.mjs$/.test(n)), names.join(','));
  });

  test('no emitted file exceeds the twenty thousand line split', () => {
    for (const f of emitted.files) assert.ok(f.lines <= DEFAULT_SPLIT, f.path + ' is ' + f.lines + ' lines');
  });

  test('one c() call per cell and one e() call per edge, one per line', () => {
    let cellCalls = 0, edgeCalls = 0;
    for (const f of emitted.files) {
      const text = readFileSync(path.join(dir, 'organism', f.path), 'utf8');
      for (const line of text.split('\n')) {
        const t = line.trim();
        if (/^c\(/.test(t)) { cellCalls++; assert.ok(t.endsWith(');'), t.slice(0, 60)); }
        if (/^e\(/.test(t)) { edgeCalls++; assert.ok(t.endsWith(');'), t.slice(0, 60)); }
      }
    }
    assert.equal(cellCalls, built.cells.length);
    assert.equal(edgeCalls, built.connectome.size());
  });

  test('the manifest counts and per file hashes describe what is on disk', () => {
    const m = readManifest(path.join(dir, 'organism'));
    assert.equal(m.format, 'brain.genome.v1');
    assert.equal(m.counts.cells, built.cells.length);
    assert.equal(m.counts.edges, built.connectome.size());
    assert.equal(m.counts.circuits, built.circuits.size);
    assert.equal(m.counts.regions, built.regions.size);
    assert.equal(m.hash, contentHash(built));
    for (const f of m.files) {
      const p = path.join(dir, 'organism', f.path);
      assert.ok(existsSync(p), 'manifest names a missing file ' + f.path);
      assert.equal(statSync(p).size, f.bytes, f.path + ' size');
      assert.equal(readFileSync(p, 'utf8').split('\n').length, f.lines, f.path + ' lines');
    }
  });

  test('every emitted file parses as an ES module', async () => {
    for (const f of emitted.files) {
      const url = pathToFileURL(path.join(dir, 'organism', f.path)).href;
      const mod = await import(url);
      assert.equal(typeof mod.default, 'function', f.path + ' has no default export function');
    }
  });

  test('emitting twice produces byte identical files', () => {
    const again = emitOrganism(built, { dir: path.join(dir, 'organism-again') });
    assert.equal(again.hash, emitted.hash);
    for (const f of emitted.files) {
      const a = readFileSync(path.join(dir, 'organism', f.path));
      const b = readFileSync(path.join(dir, 'organism-again', f.path));
      assert.ok(a.equals(b), f.path + ' differs between two emits');
    }
  });
});

// ------------------------------------------------------------------ round trip
describe('load and verify', () => {
  test('same cell count, same edge count', () => {
    assert.equal(loaded.cells.length, built.cells.length);
    assert.equal(loaded.connectome.size(), built.connectome.size());
    assert.equal(loaded.circuits.size, built.circuits.size);
    assert.equal(loaded.regions.size, built.regions.size);
  });

  test('every cell came back with the same id, kind, placement, params and policy', () => {
    for (let i = 0; i < built.cells.length; i++) {
      const a = built.cells[i], b = loaded.cells[i];
      assert.equal(b.id, a.id);
      assert.equal(b.idx, a.idx);
      assert.equal(b.kind, a.kind);
      assert.equal(b.region, a.region);
      assert.equal(b.circuit, a.circuit);
      assert.equal(stable(b.params), stable(a.params));
      assert.equal(stable(b.policy), stable(a.policy));
    }
  });

  test('the connectome arrays are identical: src, dst, ports, w, delay', () => {
    const a = built.connectome, b = loaded.connectome;
    const n = a.n;
    assert.equal(b.n, n);
    for (const field of ['src', 'dst', 'srcPort', 'dstPort', 'w', 'delay', 'conf']) {
      assert.deepEqual(b[field].subarray(0, n), a[field].subarray(0, n), field + ' differs');
    }
  });

  test('weights round trip through the emitted text bit for bit', () => {
    const a = built.connectome, b = loaded.connectome;
    for (let e = 0; e < a.n; e++) {
      assert.equal(Object.is(b.w[e], a.w[e]), true, 'edge ' + e + ' weight ' + f32(a.w[e]) + ' vs ' + f32(b.w[e]));
      assert.equal(b.delay[e], a.delay[e], 'edge ' + e + ' delay');
    }
  });

  test('verify recomputes the hash and checks every edge', () => {
    const v = verify(loaded, manifest);
    assert.deepEqual(v.errors, []);
    assert.equal(v.ok, true);
    assert.equal(v.hash, manifest.hash);
    assert.equal(v.checkedEdges, loaded.connectome.size());
    assert.equal(v.cells, built.cells.length);
  });

  test('verify fails loudly on a tampered manifest and on a tampered edge', () => {
    const bad = verify(loaded, { ...manifest, hash: '0'.repeat(64) });
    assert.equal(bad.ok, false);
    assert.ok(bad.errors.some(e => e.includes('content hash')), bad.errors.join(' | '));

    const badCount = verify(loaded, { ...manifest, counts: { ...manifest.counts, cells: 1 } });
    assert.equal(badCount.ok, false);
    assert.ok(badCount.errors.some(e => e.startsWith('cells:')), badCount.errors.join(' | '));

    const saved = loaded.connectome.dstPort[0];
    loaded.connectome.dstPort[0] = 200;
    const tampered = verify(loaded, manifest);
    loaded.connectome.dstPort[0] = saved;
    assert.equal(tampered.ok, false);
    assert.ok(tampered.errors.some(e => e.includes('has no in port')), tampered.errors.join(' | '));
    assert.equal(verify(loaded, manifest).ok, true, 'the tamper was not undone');
  });

  test('diffOrganisms reports no difference, and reports one when there is one', () => {
    assert.deepEqual(diffOrganisms(built, loaded).differences, []);
    const other = buildOrganism({ majors: 40, name: 'other' });
    assert.equal(diffOrganisms(built, other).same, false);
  });

  test('fifty ticks on both brains leave identical statistics', () => {
    built.tick(50);
    loaded.tick(50);
    assert.deepEqual(loaded.stats, built.stats);
    assert.equal(built.stats.ticks, 50);
    assert.ok(built.stats.runs > 0, 'the organism did not run');
    assert.ok(built.stats.delivered > 0, 'nothing was delivered');
    assert.equal(built.stats.refused, 0);
    assert.equal(built.stats.errors, 0, JSON.stringify(built.lastError));
    for (let i = 0; i < built.cells.length; i++) {
      assert.equal(loaded.cells[i].stats.runs, built.cells[i].stats.runs, 'cell ' + built.cells[i].id + ' ran a different number of times');
    }
    assert.equal(contentHash(loaded), contentHash(built), 'ticking changed the genome of one but not the other');
  });

  test('the loaded brain is a working Brain, not a data structure', () => {
    assert.equal(typeof loaded.tick, 'function');
    assert.ok(loaded.summary().cells === built.cells.length);
    const one = loaded.cells[0];
    const info = loaded.inspect(one.id);
    assert.equal(info.id, one.id);
    assert.ok(Array.isArray(info.edgesOut));
  });
});

// ------------------------------------------------------------------ the helpers
describe('genome/wire helpers', () => {
  test('f32 prints the shortest text that reads back to the same float32', () => {
    const rnd = [0, 1, -1, 0.5, 0.1, 1 / 3, 1e-8, 12345.678, -0.00012345];
    for (let i = 0; i < 2000; i++) rnd.push((Math.random() - 0.5) * Math.pow(10, Math.floor(Math.random() * 12) - 6));
    for (const x of rnd) {
      const v = Math.fround(x);
      assert.equal(Math.fround(Number(f32(v))), v, 'f32(' + v + ') = ' + f32(v));
    }
  });

  test('stable sorts object keys so equal params hash equally', () => {
    assert.equal(stable({ b: 1, a: [2, { d: 4, c: 3 }] }), stable({ a: [2, { c: 3, d: 4 }] , b: 1 }));
    assert.notEqual(stable({ a: 1 }), stable({ a: 2 }));
  });

  test('lowerBound finds the first index at or after a value', () => {
    const a = Uint32Array.from([2, 4, 4, 9, 11]);
    assert.equal(lowerBound(a, 0), 0);
    assert.equal(lowerBound(a, 4), 1);
    assert.equal(lowerBound(a, 5), 3);
    assert.equal(lowerBound(a, 12), 5);
  });

  test('loadOrganism refuses an edge naming a cell that does not exist', () => {
    const parts = {
      regions: (r, k) => { r('perception', { budget: null, doc: '' }); k('perception', 'x', 1, ''); },
      cells: [(c) => { c('a', 'sink.log', 'perception', 'x', { keep: 4 }, { period: 'event', priority: 1, budget: 1, backend: 'cpu', learn: null }); }],
      edges: [(e) => { e('ghost', 'a', 0, 0, 1, 0); }],
    };
    assert.throws(() => loadOrganism(parts, { name: 'broken', seed: 'broken', counts: { edges: 1 } }), /unknown cell ghost/);
  });

  test('loadOrganism refuses an edge whose ports cannot meet', () => {
    const policy = { period: 'event', priority: 1, budget: 1, backend: 'cpu', learn: null };
    const parts = {
      regions: (r, k) => { r('cognitive', { budget: null, doc: '' }); k('cognitive', 'x', 1, ''); },
      cells: [(c) => {
        c('enc', 'encode.hv', 'cognitive', 'x', { sequence: true }, policy);
        c('arith', 'num.arith', 'cognitive', 'x', { op: '+' }, policy);
      }],
      edges: [(e) => { e('enc', 'arith', 0, 0, 1, 0); }],
    };
    assert.throws(() => loadOrganism(parts, { name: 'broken', seed: 'broken', counts: { edges: 1 } }), /wire: /);
  });
});
