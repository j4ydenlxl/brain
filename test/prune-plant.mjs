// test/prune-plant.mjs: the planted tree self/prune.mjs is graded on (Board 14). Not a test file
// itself (no .test.mjs), so the gate does not run it.
//
// plantTree(dir) copies the code a seed needs to be emitted, loaded and pruned (the import closure
// of genome/emit.mjs, genome/load.mjs, seeds/organism.mjs and cells/all.mjs: fifteen top-level
// directories, about 2.5 MB) into dir, plus two gate stand-ins:
//   gate-seeds.mjs  GREEN when every seed under organism/ has a census under bench/verdicts at its
//                   own path and manifest hash (the rule of the real gate's LOAD-BEARING row),
//                   RED naming the seeds that have none
//   gate-red.mjs    always RED
// plantSeed(root, o) emits a tiny organism with the PLANTED tree's own emitter (a child process
// in root), so its index.mjs imports root/genome/load.mjs and not this tree's.
// plantCensus(root, name) writes bench/verdicts/census-<name>.json: a liveness bitset by a fixed
// rule that no prune code computes (cell i is dead when i % 3 == 2 and it is not the first cell
// of its circuit; edge e is live when both endpoints are live and e % 5 != 0), so every circuit
// keeps a cell, no region or circuit line is dropped, one cells file and one edges file hold
// every declaration before and after, and the lines after are the lines before minus the dead
// cells minus the dead edges. It also writes census-<name>-pruned.json, a census of the pruned
// content at the hash pruneBrain gives in the planting child (every declaration live), so the
// prune can read a dead share after.
import { cpSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REAL_ROOT = path.resolve(HERE, '..');
export const PLANT_DIRS = Object.freeze(['cells', 'genome', 'seeds', 'core', 'capability', 'mind', 'world', 'io', 'tasks', 'lab', 'generations', 'learning', 'memory', 'simulate', 'lang']);

export const GATE_SEEDS = [
  '// gate-seeds.mjs (planted by test/prune-plant.mjs): every seed under organism/ needs a census at',
  '// its own path and manifest hash, the rule of the real gate\'s LOAD-BEARING row.',
  "import { readdirSync, readFileSync, existsSync } from 'node:fs';",
  "import path from 'node:path';",
  'const root = process.cwd();',
  "const seeds = readdirSync(path.join(root, 'organism')).filter((n) => existsSync(path.join(root, 'organism', n, 'manifest.json')));",
  'const recs = [];',
  "for (const f of readdirSync(path.join(root, 'bench', 'verdicts')).filter((n) => /^census.*\\.json$/.test(n))) {",
  "  const v = JSON.parse(readFileSync(path.join(root, 'bench', 'verdicts', f), 'utf8'));",
  '  recs.push({ seed: v.seed, hash: (v.live && v.live.manifestHash) || (v.hash && v.hash.manifest) });',
  '}',
  'const none = seeds.filter((n) => {',
  "  const h = JSON.parse(readFileSync(path.join(root, 'organism', n, 'manifest.json'), 'utf8')).hash;",
  "  return !recs.some((r) => r.seed === 'organism/' + n && r.hash === h);",
  '});',
  "if (none.length) { console.log('GATE RED: planted, ' + none.length + ' of ' + seeds.length + ' seeds have no census at their hash: ' + none.join(', ')); process.exit(1); }",
  "console.log('GATE GREEN: planted, ' + seeds.length + ' of ' + seeds.length + ' seeds have a census at their hash');",
  '',
].join('\n');
export const GATE_RED = "console.log('GATE RED: planted, always red');\nprocess.exit(1);\n";

/** The planted own test of a seed: it names organism/<name> by path, loads it and verifies it. */
export const seedTest = (name) => [
  "import test from 'node:test';",
  "import assert from 'node:assert/strict';",
  "import path from 'node:path';",
  "import { fileURLToPath } from 'node:url';",
  "import '../cells/all.mjs';",
  "import { loadFrom, verify } from '../genome/load.mjs';",
  "const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');",
  "test('organism/" + name + " loads and verifies against its manifest', async () => {",
  "  const { brain, manifest } = await loadFrom(path.join(ROOT, 'organism/" + name + "'));",
  '  const v = verify(brain, manifest);',
  "  assert.ok(v.ok, v.errors.join('; '));",
  '  assert.equal(brain.cells.length, manifest.counts.cells);',
  '});',
  '',
].join('\n');

/** Copy the code a seed needs into dir, with the two gate stand-ins and empty organism/, bench/verdicts/, test/. */
export function plantTree(dir) {
  mkdirSync(dir, { recursive: true });
  for (const d of PLANT_DIRS) cpSync(path.join(REAL_ROOT, d), path.join(dir, d), { recursive: true });
  for (const d of ['organism', 'bench/verdicts', 'test']) mkdirSync(path.join(dir, ...d.split('/')), { recursive: true });
  writeFileSync(path.join(dir, 'gate-seeds.mjs'), GATE_SEEDS);
  writeFileSync(path.join(dir, 'gate-red.mjs'), GATE_RED);
  return dir;
}

function child(root, code) {
  const env = {};
  for (const [k, v] of Object.entries(process.env)) if (!k.startsWith('NODE_TEST') && k !== 'NODE_OPTIONS') env[k] = v;
  const r = spawnSync(process.execPath, ['--input-type=module', '-e', code], { cwd: root, encoding: 'utf8', timeout: 90_000, maxBuffer: 16 * 1024 * 1024, env, windowsHide: true });
  const line = ((r.stdout || '').match(/^PLANTED (.*)$/m) || [])[1];
  if (!line) throw new Error('plant child failed (exit ' + r.status + '): ' + ((r.stderr || '') + (r.stdout || '')).split('\n').filter(Boolean).slice(-4).join(' | '));
  return JSON.parse(line);
}
const url = (root, ...p) => JSON.stringify(pathToFileURL(path.join(root, ...p)).href);

/**
 * Emit a tiny organism into root/organism/<name> with root's own emitter, and plant its own test.
 * @returns {{ lines: number, hash: string, cells: number, edges: number, files: number }}
 */
export function plantSeed(root, { name = 'tiny', majors = 24, subcellsPerMajor = 4, edgesPerCell = 4, split = 100000 } = {}) {
  const code = [
    'const { buildOrganism } = await import(' + url(root, 'seeds', 'organism.mjs') + ');',
    'const { emitOrganism } = await import(' + url(root, 'genome', 'emit.mjs') + ');',
    'const b = buildOrganism(' + JSON.stringify({ majors, subcellsPerMajor, edgesPerCell, seed: 'prune-plant', name }) + ');',
    'const r = emitOrganism(b, { dir: ' + JSON.stringify(path.join(root, 'organism', name)) + ', split: ' + split + ' });',
    "const m = JSON.parse((await import('node:fs')).readFileSync(" + JSON.stringify(path.join(root, 'organism', name, 'manifest.json')) + ", 'utf8'));",
    "process.stdout.write('PLANTED ' + JSON.stringify({ lines: m.counts.lines, hash: m.hash, cells: m.counts.cells, edges: m.counts.edges, files: m.counts.files, cellFiles: m.counts.cellFiles, edgeFiles: m.counts.edgeFiles }) + '\\n');",
  ].join('\n');
  const r = child(root, code);
  writeFileSync(path.join(root, 'test', name + '.test.mjs'), seedTest(name));
  return r;
}

/**
 * Plant the census of organism/<name> by the fixed rule above, and a census of its pruned content.
 * @returns the expected numbers: lines before and after, dead cells and edges, the pruned hash
 */
export function plantCensus(root, name = 'tiny', { ticks = 1 } = {}) {
  const seedDir = path.join(root, 'organism', name);
  const code = [
    'await import(' + url(root, 'cells', 'all.mjs') + ');',
    'const { loadFrom } = await import(' + url(root, 'genome', 'load.mjs') + ');',
    'const { liveBits, readLiveBits, pruneBrain } = await import(' + url(root, 'genome', 'emit.mjs') + ');',
    'const { contentHash } = await import(' + url(root, 'genome', 'wire.mjs') + ');',
    'const { brain, manifest } = await loadFrom(' + JSON.stringify(seedDir) + ');',
    'const first = new Map();',
    "brain.cells.forEach((c, i) => { const k = c.region + '/' + c.circuit; if (!first.has(k)) first.set(k, i); });",
    "const deadCell = (i) => i % 3 === 2 && first.get(brain.cells[i].region + '/' + brain.cells[i].circuit) !== i;",
    'const k = brain.connectome;',
    'const liveEdge = (e) => !deadCell(k.src[e]) && !deadCell(k.dst[e]) && e % 5 !== 0;',
    'const cells = liveBits(brain.cells.length, (i) => !deadCell(i));',
    'const edges = liveBits(k.n, liveEdge);',
    "const pr = pruneBrain(brain, { cells: readLiveBits(cells), edges: readLiveBits(edges) }, { name: " + JSON.stringify(name + '-pruned') + ' });',
    "process.stdout.write('PLANTED ' + JSON.stringify({ hash: manifest.hash, lines: manifest.counts.lines, cellsN: brain.cells.length, edgesN: k.n, cells, edges, prunedHash: contentHash(pr.brain), prunedCells: pr.brain.cells.length, prunedEdges: pr.brain.connectome.n, circuits: first.size, regions: brain.regions.size, prunedCircuits: pr.brain.circuits.size, prunedRegions: pr.brain.regions.size }) + '\\n');",
  ].join('\n');
  const r = child(root, code);
  const deadCells = r.cellsN - r.cells.count, deadEdges = r.edgesN - r.edges.count;
  const linesAfter = r.lines - deadCells - deadEdges;
  const at = new Date().toISOString();
  const census = {
    bench: 'census', at, command: 'test/prune-plant.mjs (planted, no census ran)', node: process.version, isTheBar: false,
    seed: 'organism/' + name, ticks,
    lines: { loaded: r.lines, loadBearing: r.lines - deadCells - deadEdges },
    live: { manifestHash: r.hash, phases: 'planted by rule: cell i dead when i % 3 == 2 and not the first of its circuit; edge e live when both ends live and e % 5 != 0', cells: r.cells, edges: r.edges },
  };
  // a bitset of n ones: the bits of the last byte past n stay zero, as liveBits writes them
  const ones = (n) => { const b = Buffer.alloc((n + 7) >> 3, 0xff); if (n % 8) b[b.length - 1] = (1 << (n % 8)) - 1; return { n, count: n, encoding: r.cells.encoding, b64: b.toString('base64') }; };
  const after = {
    bench: 'census', at, command: 'test/prune-plant.mjs (planted, no census ran)', node: process.version, isTheBar: false,
    seed: 'organism/' + name + '-pruned', ticks,
    lines: { loaded: linesAfter, loadBearing: linesAfter },
    live: { manifestHash: r.prunedHash, phases: 'planted: every declaration of the pruned content live', cells: ones(r.prunedCells), edges: ones(r.prunedEdges) },
  };
  writeFileSync(path.join(root, 'bench', 'verdicts', 'census-' + name + '.json'), JSON.stringify(census, null, 2) + '\n');
  writeFileSync(path.join(root, 'bench', 'verdicts', 'census-' + name + '-pruned.json'), JSON.stringify(after, null, 2) + '\n');
  return {
    census: 'bench/verdicts/census-' + name + '.json', seed: 'organism/' + name, hash: r.hash,
    linesBefore: r.lines, linesAfter, deadCells, deadEdges, cells: { n: r.cellsN, live: r.cells.count }, edges: { n: r.edgesN, live: r.edges.count },
    prunedHash: r.prunedHash, prunedCells: r.prunedCells, prunedEdges: r.prunedEdges,
    circuits: r.circuits, regions: r.regions, prunedCircuits: r.prunedCircuits, prunedRegions: r.prunedRegions,
    deadShareBefore: Math.round((1 - (r.lines - deadCells - deadEdges) / r.lines) * 1e6) / 1e6, bits: { cells: r.cells, edges: r.edges },
  };
}

/** A copy of a census verdict file with one field changed, written beside it. */
export function plantVariant(root, from, to, change) {
  const v = JSON.parse(readFileSync(path.join(root, ...from.split('/')), 'utf8'));
  change(v);
  writeFileSync(path.join(root, ...to.split('/')), JSON.stringify(v, null, 2) + '\n');
  return to;
}
