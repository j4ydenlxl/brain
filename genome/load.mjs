// genome/load.mjs: READ THE ORGANISM BACK.
//
// loadOrganism takes the three parts an emitted index.mjs imports (regions, the cell
// modules in order, the edge modules in order) and replays them into a Brain: regions and
// circuits first, then every cell, then every edge. The edges go through the same Wiring
// path the builder used, so the loader enforces the same legality rule the builder did
// rather than trusting the file it is reading.
//
// verify(brain, manifest) is the other half. It recomputes the content hash over the loaded
// brain and compares it with the manifest, checks the counts, and checks every edge: both
// endpoints exist, both ports exist, and the source port's kinds are a subset of the
// destination port's kinds. A loader that only counted rows would pass a file whose ports
// had been shifted by one; this one would not.
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Brain } from '../core/brain.mjs';
import '../cells/index.mjs';
import { Wiring, contentHash, edgeFault, f32, stable, monomorphicGrowth } from './wire.mjs';

/**
 * Replay emitted parts into a Brain.
 * @param {{regions: Function, cells: Function[], edges: Function[]}} parts
 * @param {object} meta the emitted `meta` export (name, seed, genome, counts, hash)
 * @param {object} [opts] passed to the Brain constructor, overriding the defaults here
 * @returns {Brain}
 */
export function loadOrganism(parts, meta, opts = {}) {
  // The runtime options are part of the emitted genome, so the loaded brain is configured
  // the way the grown one was. They are not guessed here: a loader that picked its own
  // growth or pruning settings would tick into a different organism from the same source.
  const runtime = (meta.genome && meta.genome.runtime) || {};
  const b = new Brain({
    name: meta.name, seed: meta.seed ?? meta.name,
    ledger: 'off', pruneEvery: 0,
    ...runtime,
    // The growth policy is behaviour, not data, so it cannot travel in the manifest. Both
    // the grower and the loader call the same factory, which is why they are both here in
    // genome/wire.mjs and not in either one of them.
    policy: monomorphicGrowth(runtime.gate || {}),
    ...opts,
  });
  b.genome = { ...(meta.genome || {}), loaded: true, hash: meta.hash };

  parts.regions(
    (name, o) => b.addRegion(name, { budget: o.budget == null ? Infinity : o.budget, doc: o.doc || '' }),
    (region, name, period, doc) => b.addCircuit(region, name, { period, doc: doc || '' }),
  );

  const c = (id, kind, region, circuit, params, policy) => b.addCell({ id, kind, region, circuit, params, policy });
  for (const mod of parts.cells) mod(c);

  const wiring = new Wiring(b, { reserve: meta.counts?.edges || 0, strict: true });
  const byId = b.byId;
  const e = (src, dst, sp, dp, w, delay, conf) => {
    const a = byId.get(src), z = byId.get(dst);
    if (!a) throw new Error('load: edge from unknown cell ' + src);
    if (!z) throw new Error('load: edge to unknown cell ' + dst);
    wiring.add(a.idx, z.idx, sp, dp, { w, delay, conf: conf === undefined ? 0.5 : conf });
  };
  for (const mod of parts.edges) mod(e);
  wiring.finish();
  b.genome.wiring = { added: wiring.added, duplicates: wiring.duplicates, illegal: wiring.illegal };
  return b;
}

/**
 * Load an emitted organism from a directory: imports its index.mjs and reads manifest.json.
 * @param {string} dir
 * @param {object} [opts] Brain options
 * @returns {Promise<{ brain: Brain, manifest: object, meta: object }>}
 */
export async function loadFrom(dir, opts = {}) {
  const idx = path.join(path.resolve(dir), 'index.mjs');
  if (!existsSync(idx)) throw new Error('load: no index.mjs at ' + idx);
  const mod = await import(pathToFileURL(idx).href + '?v=' + Date.now());
  const manifest = readManifest(dir);
  return { brain: mod.load(opts), manifest, meta: mod.meta };
}

/** @param {string} dir @returns {object} */
export function readManifest(dir) {
  const f = path.join(path.resolve(dir), 'manifest.json');
  if (!existsSync(f)) throw new Error('load: no manifest.json at ' + f);
  return JSON.parse(readFileSync(f, 'utf8'));
}

/**
 * Recompute the hash and check every edge.
 * @param {Brain} brain
 * @param {object} manifest
 * @param {object} [opts] { maxErrors }
 * @returns {{ ok, hash, cells, edges, checkedEdges, errors: string[] }}
 */
export function verify(brain, manifest, { maxErrors = 20 } = {}) {
  const errors = [];
  const hash = contentHash(brain);
  const k = brain.connectome;

  if (manifest && manifest.hash && hash !== manifest.hash) {
    errors.push('content hash ' + hash + ' does not match manifest hash ' + manifest.hash);
  }
  const want = (manifest && manifest.counts) || {};
  const got = { regions: brain.regions.size, circuits: brain.circuits.size, cells: brain.cells.length, edges: k.n };
  for (const key of Object.keys(got)) {
    if (want[key] !== undefined && want[key] !== got[key]) errors.push(key + ': manifest says ' + want[key] + ', brain has ' + got[key]);
  }

  let checked = 0;
  for (let e = 0; e < k.n; e++) {
    const a = brain.cells[k.src[e]], z = brain.cells[k.dst[e]];
    const fault = edgeFault(a, z, k.srcPort[e], k.dstPort[e]);
    if (fault) { if (errors.length < maxErrors) errors.push('edge ' + e + ': ' + fault); continue; }
    if (!Number.isFinite(k.w[e])) { if (errors.length < maxErrors) errors.push('edge ' + e + ': weight is not finite'); continue; }
    checked++;
  }
  if (checked !== k.n && errors.length >= maxErrors) errors.push('and more, reporting stopped at ' + maxErrors);

  return { ok: errors.length === 0, hash, cells: got.cells, edges: got.edges, checkedEdges: checked, errors };
}

/**
 * Compare two brains structurally: same cells, same connectome arrays, same hash. Used by
 * the tests to prove a round trip, and useful on its own for diffing two generations.
 * @returns {{ same: boolean, differences: string[] }}
 */
export function diffOrganisms(a, b, { maxDifferences = 20 } = {}) {
  const d = [];
  const push = (s) => { if (d.length < maxDifferences) d.push(s); };
  if (a.cells.length !== b.cells.length) push('cells ' + a.cells.length + ' vs ' + b.cells.length);
  const n = Math.min(a.cells.length, b.cells.length);
  for (let i = 0; i < n && d.length < maxDifferences; i++) {
    const x = a.cells[i], y = b.cells[i];
    if (x.id !== y.id) push('cell ' + i + ' id ' + x.id + ' vs ' + y.id);
    else if (x.kind !== y.kind) push('cell ' + x.id + ' kind ' + x.kind + ' vs ' + y.kind);
    else if (x.region !== y.region || x.circuit !== y.circuit) push('cell ' + x.id + ' placed ' + x.region + '/' + x.circuit + ' vs ' + y.region + '/' + y.circuit);
    else if (stable(x.params) !== stable(y.params)) push('cell ' + x.id + ' params differ');
    else if (stable(x.policy) !== stable(y.policy)) push('cell ' + x.id + ' policy differ');
  }
  const ka = a.connectome, kb = b.connectome;
  if (ka.n !== kb.n) push('edges ' + ka.n + ' vs ' + kb.n);
  const m = Math.min(ka.n, kb.n);
  for (let e = 0; e < m && d.length < maxDifferences; e++) {
    if (ka.src[e] !== kb.src[e] || ka.dst[e] !== kb.dst[e]) push('edge ' + e + ' endpoints ' + ka.src[e] + '->' + ka.dst[e] + ' vs ' + kb.src[e] + '->' + kb.dst[e]);
    else if (ka.srcPort[e] !== kb.srcPort[e] || ka.dstPort[e] !== kb.dstPort[e]) push('edge ' + e + ' ports ' + ka.srcPort[e] + '/' + ka.dstPort[e] + ' vs ' + kb.srcPort[e] + '/' + kb.dstPort[e]);
    else if (ka.w[e] !== kb.w[e]) push('edge ' + e + ' weight ' + f32(ka.w[e]) + ' vs ' + f32(kb.w[e]));
    else if (ka.delay[e] !== kb.delay[e]) push('edge ' + e + ' delay ' + ka.delay[e] + ' vs ' + kb.delay[e]);
    else if (ka.conf[e] !== kb.conf[e]) push('edge ' + e + ' conf ' + f32(ka.conf[e]) + ' vs ' + f32(kb.conf[e]));
  }
  if (contentHash(a) !== contentHash(b)) push('content hashes differ');
  return { same: d.length === 0, differences: d };
}
