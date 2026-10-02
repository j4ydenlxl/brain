// test/grow-genome.test.mjs: THE ENGINE'S GENOME (grow/genome.mjs, contract c6). His words: "it should change its own
// code for iteration, testing, benching" and "IT should permanently change code for the better". Every rule of the
// genome has a test that fails when the rule is dropped: the defaults equal today's engine constants, the bounds hold
// for every mutant, a mutant moves one or two search genes and never a budget gene, the same seed gives the same
// mutant, crossover takes genes whole, genomeOf falls back gene by gene, and the module stays importable with no file
// system (a phone browser).
// Run: node --test --test-reporter=tap test/grow-genome.test.mjs
// Author: NATIVE EVOLVE builder, 2026-10-01.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  GENES, DEFAULTS, SEARCH_GENES, GENOME_FILE, GENOME_VERSION, validate, genomeFrom, genomeOf, readGenomeDoc, mutate, crossover,
  describe, diff, genomeId, hashText, canonGenome, rng,
} from '../grow/genome.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GENOME_SRC = path.join(HERE, '..', 'grow', 'genome.mjs');
const NEO_SRC = path.join(HERE, '..', 'grow', 'neo.mjs');
const CORE_SRC = path.join(HERE, '..', 'grow', 'neo-core.mjs');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'grow-genome-'));
const cleanup = () => { try { fs.rmSync(TMP, { recursive: true, force: true }); } catch { /* gone */ } };
after(cleanup);
process.on('exit', cleanup);
let n = 0;
const rootWith = (doc) => {
  const r = path.join(TMP, 'root-' + (++n));
  fs.mkdirSync(path.join(r, 'neo'), { recursive: true });
  if (doc !== undefined) fs.writeFileSync(path.join(r, ...GENOME_FILE.split('/')), typeof doc === 'string' ? doc : JSON.stringify(doc));
  return r;
};
const gene = (name) => GENES.find((g) => g.name === name);

test('the defaults equal the engine constants of grow/neo.mjs and grow/neo-core.mjs (exported ones by import, the others by their literal while the literal is there)', async () => {
  const neo = await import(pathToFileURL(NEO_SRC).href);
  if (neo.BUDGET) { assert.equal(DEFAULTS.maxGenerated, neo.BUDGET.maxGenerated); assert.equal(DEFAULTS.maxMs, neo.BUDGET.maxMs); }
  if (neo.MAX_COST !== undefined) assert.equal(DEFAULTS.maxCost, neo.MAX_COST);
  if (neo.ENUM_SHARE !== undefined) assert.equal(DEFAULTS.enumShare, neo.ENUM_SHARE);
  if (neo.MAX_EXAMPLES !== undefined) assert.equal(DEFAULTS.maxExamples, neo.MAX_EXAMPLES);
  // the search moved to grow/neo-core.mjs (contract c4): its literals count wherever they now live
  const src = [NEO_SRC, CORE_SRC].filter((f) => fs.existsSync(f)).map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  const lit = (re) => { const m = re.exec(src); return m ? m[1] : null; };
  const checks = [
    ['mutantCap', lit(/const MUTANT_CAP = (\d+);/)], ['maxExtra', lit(/const MAX_EXTRA = (\d+);/)], ['mutantSwaps', lit(/if \(swaps >= (\d+)\) break;/)],
    ['spanPool', lit(/!wordLiteral\(e\.node\)\)\.slice\(0, (\d+)\)/)], ['notFeatures', lit(/if \(k >= (\d+)\) break;/)], ['offWords', lit(/offW\.size < (\d+)\)/)],
    ['templateAlts', lit(/\.sort\(spanOrder\)\.slice\(0, (\d+)\)/)], ['poolNums', lit(/shared\(numDf, (\d+)\)/)], ['poolExpect', lit(/shared\(expDf, (\d+)\)/)],
    ['poolWords', lit(/shared\(wordDf, (\d+)\)/)], ['decimals', lit(/'render\.decimals', (\d+)\]/)], ['bigList', lit(/v\.length > (\d+) \|\| v\.some\(tooBig\)/)],
    ['bigText', lit(/typeof v === 'string'\) return v\.length > (\d+);/)],
  ];
  let seen = 0;
  for (const [name, v] of checks) if (v !== null) { seen++; assert.equal(DEFAULTS[name], Number(v), name + ' default differs from the engine literal'); }
  const np = lit(/const NUM_POOL = Object\.freeze\(\[([^\]]*)\]\)/);
  if (np !== null) { seen++; assert.deepEqual([...DEFAULTS.numPool], np.split(',').map((s) => Number(s.trim()))); }
  const kw = lit(/const KEY_WORDS = Object\.freeze\(\[([^\]]*)\]\)/);
  if (kw !== null) { seen++; assert.deepEqual([...DEFAULTS.keyWords], kw.split(',').map((s) => s.trim().replace(/^'|'$/g, ''))); }
  if (seen === 0) assert.ok(!/MUTANT_CAP|NUM_POOL/.test(src), 'the engine still names its constants, so at least one literal must be read');
});

test('every gene has a kind, a default inside its bounds, a scope and the place it comes from; the defaults validate', () => {
  assert.ok(GENES.length >= 30);
  for (const g of GENES) {
    assert.ok(['int', 'real', 'perm', 'ints', 'words'].includes(g.kind), g.name);
    assert.ok(['budget', 'search'].includes(g.scope), g.name);
    assert.ok(typeof g.where === 'string' && g.where.length > 2, g.name);
    if (g.kind === 'int' || g.kind === 'real') assert.ok(g.def >= g.min && g.def <= g.max, g.name);
  }
  assert.deepEqual(validate(DEFAULTS), { ok: true, errors: [] });
  assert.ok(Object.isFrozen(DEFAULTS) && Object.isFrozen(GENES) && GENES.every((g) => Object.isFrozen(g)));
  assert.deepEqual(SEARCH_GENES, GENES.filter((g) => g.scope === 'search').map((g) => g.name));
  assert.ok(!SEARCH_GENES.includes('maxGenerated') && !SEARCH_GENES.includes('maxMs'));
  assert.equal(GENOME_FILE, 'neo/GENOME.json');
  assert.equal(GENOME_VERSION, 1);
});

test('validate names every broken gene: out of bounds, the wrong kind, a broken permutation or list, unknown and missing genes', () => {
  const bad = (patch, re) => { const v = validate({ ...DEFAULTS, ...patch }); assert.equal(v.ok, false, JSON.stringify(patch)); assert.ok(v.errors.some((e) => re.test(e)), v.errors.join('|')); };
  bad({ maxCost: 13 }, /maxCost 13 is outside \[2, 12\]/);
  bad({ maxCost: 1 }, /maxCost 1 is outside/);
  bad({ maxCost: 7.5 }, /maxCost is not an integer/);
  bad({ enumShare: 0.99 }, /enumShare 0.99 is outside/);
  bad({ enumShare: Number.NaN }, /enumShare is not a finite number/);
  bad({ familyOrder: ['aggregate', 'aggregate', 'compute', 'iterate', 'transform'] }, /familyOrder is not a permutation/);
  bad({ familyOrder: ['aggregate'] }, /familyOrder is not a list of 5/);
  bad({ numPool: [1, 1] }, /numPool repeats a value/);
  bad({ numPool: [1.5] }, /numPool holds a value that is not an integer/);
  bad({ numPool: Array.from({ length: 33 }, (_, i) => i) }, /numPool has 33 values/);
  bad({ keyWords: ['Of'] }, /keyWords holds a value that is not a lower case word/);
  bad({ keyWords: 'of' }, /keyWords is not a list/);
  bad({ wizard: 1 }, /wizard is not a gene/);
  const { maxCost, ...rest } = DEFAULTS;
  assert.ok(validate(rest).errors.includes('maxCost is missing'));
  assert.equal(validate(rest, { partial: true }).ok, true);
  assert.equal(validate({ maxCost: 3 }, { partial: true }).ok, true);
  assert.equal(validate(null).ok, false);
  assert.equal(validate([]).ok, false);
  assert.equal(maxCost, 7);
  // every bound is inclusive
  for (const g of GENES.filter((x) => x.kind === 'int' || x.kind === 'real')) {
    assert.equal(validate({ [g.name]: g.min }, { partial: true }).ok, true, g.name + ' at its min');
    assert.equal(validate({ [g.name]: g.max }, { partial: true }).ok, true, g.name + ' at its max');
  }
});

test('genomeOf: no file gives the defaults; a valid gene in the file is used; a broken one falls back to its default alone; corrupt JSON gives the defaults', () => {
  assert.deepEqual(genomeOf(rootWith()), DEFAULTS);
  assert.deepEqual(genomeOf(path.join(TMP, 'no-such-root')), DEFAULTS);
  const g = genomeOf(rootWith({ version: 1, genes: { maxCost: 9, enumShare: 2, keyWords: ['of', 'by'], wizard: 3 } }));
  assert.equal(g.maxCost, 9);
  assert.equal(g.enumShare, DEFAULTS.enumShare);
  assert.deepEqual([...g.keyWords], ['of', 'by']);
  assert.equal(Object.hasOwn(g, 'wizard'), false);
  assert.ok(Object.isFrozen(g) && Object.isFrozen(g.keyWords));
  assert.equal(genomeOf(rootWith({ maxCost: 4 })).maxCost, 4, 'a flat document is read too');
  assert.deepEqual(genomeOf(rootWith('{ not json')), DEFAULTS);
  assert.deepEqual(genomeOf(rootWith('[1,2]')), DEFAULTS);
  assert.equal(readGenomeDoc(rootWith('{ not json')), null);
  assert.deepEqual(genomeFrom(null), DEFAULTS);
  assert.equal(genomeOf(rootWith({ genes: { maxCost: 12 } }) + path.sep).maxCost, 12, 'a root with a trailing separator');
});

test('mutate: deterministic for a seed, one or two search genes moved, always inside the bounds, never a budget gene, never the input', () => {
  const sizes = new Set(), moved = new Set();
  let g = DEFAULTS;
  for (let s = 0; s < 3000; s++) {
    const m = mutate(g, s);
    assert.deepEqual(mutate(g, s), m, 'the same seed gives the same mutant');
    assert.deepEqual(validate(m.genome), { ok: true, errors: [] }, 'seed ' + s + ' ' + describe(m.change));
    assert.ok(m.change.length === 1 || m.change.length === 2, 'seed ' + s + ' moved ' + m.change.length);
    assert.deepEqual(m.change, diff(g, m.genome));
    for (const c of m.change) { assert.ok(SEARCH_GENES.includes(c.gene), c.gene); moved.add(c.gene); }
    assert.ok(Object.isFrozen(m.genome));
    sizes.add(m.change.length);
    if (s % 4 === 0) g = m.genome;
  }
  assert.deepEqual([...sizes].sort(), [1, 2]);
  assert.deepEqual([...moved].sort(), [...SEARCH_GENES].sort(), 'every search gene is drawn at some seed');
  assert.notDeepEqual(mutate(DEFAULTS, 1).genome, mutate(DEFAULTS, 2).genome);
  assert.deepEqual(DEFAULTS.maxCost, 7, 'the input is not changed');
});

test('mutate: a gene list restricts the draw; a gene at its bound moves the other way; an int moves by its scale', () => {
  for (let s = 0; s < 200; s++) {
    const m = mutate(DEFAULTS, s, { genes: ['maxCost'] });
    assert.equal(m.change.length, 1);
    assert.equal(m.change[0].gene, 'maxCost');
    assert.equal(Math.abs(m.genome.maxCost - 7), 1, 'a lin gene of span 10 moves by 1');
  }
  for (let s = 0; s < 100; s++) {
    assert.equal(mutate({ ...DEFAULTS, maxCost: 12 }, s, { genes: ['maxCost'] }).genome.maxCost, 11);
    assert.equal(mutate({ ...DEFAULTS, maxCost: 2 }, s, { genes: ['maxCost'] }).genome.maxCost, 3);
    const e = mutate({ ...DEFAULTS, enumShare: 0.95 }, s, { genes: ['enumShare'] }).genome.enumShare;
    assert.ok(e < 0.95 && e >= 0.05, String(e));
    const c = mutate(DEFAULTS, s, { genes: ['mutantCap'] }).genome.mutantCap;
    assert.ok(c >= 1000 && c <= 4000 && c !== 2000, 'a log gene moves by a factor in [1.25, 2): ' + c);
    const p = mutate(DEFAULTS, s, { genes: ['familyOrder'] }).genome.familyOrder;
    assert.deepEqual([...p].sort(), [...DEFAULTS.familyOrder].sort());
    assert.notDeepEqual([...p], [...DEFAULTS.familyOrder]);
    const k = mutate(DEFAULTS, s, { genes: ['keyWords'] }).genome.keyWords;
    assert.equal(Math.abs(k.length - DEFAULTS.keyWords.length), 1);
  }
  assert.deepEqual(mutate(DEFAULTS, 5, { genes: ['nope'] }).change, [], 'no known gene: no change');
  assert.equal(mutate({ ...DEFAULTS, maxCost: 99 }, 3, { genes: ['maxCost'] }).change[0].from, 7, 'an out of bounds input is read as its default');
  const twoUp = new Set();
  for (let s = 0; s < 400; s++) twoUp.add(mutate(DEFAULTS, s, { genes: ['maxCost', 'maxExtra'] }).change.length);
  assert.deepEqual([...twoUp].sort(), [1, 2]);
});

test('crossover takes every gene whole from one parent, deterministic for its seed', () => {
  const b = { ...DEFAULTS, maxCost: 10, familyOrder: ['transform', 'iterate', 'compute', 'compare', 'aggregate'], numPool: [7] };
  const seenFrom = new Set();
  for (let s = 0; s < 64; s++) {
    const c = crossover(DEFAULTS, b, s);
    assert.deepEqual(crossover(DEFAULTS, b, s), c);
    assert.equal(validate(c.genome).ok, true);
    for (const g of GENES) {
      const v = c.genome[g.name];
      const fromA = JSON.stringify(v) === JSON.stringify(DEFAULTS[g.name]), fromB = JSON.stringify(v) === JSON.stringify(b[g.name]);
      assert.ok(fromA || fromB, g.name);
    }
    seenFrom.add(c.genome.maxCost);
    assert.deepEqual(c.change, diff(DEFAULTS, c.genome));
  }
  assert.deepEqual([...seenFrom].sort((x, y) => x - y), [7, 10]);
});

test('describe: gene moves, macro changes, nothing', () => {
  assert.equal(describe([{ gene: 'maxCost', from: 7, to: 8 }, { gene: 'numPool', from: [1, 2], to: [1] }]), 'maxCost 7 -> 8; numPool [1,2] -> [1]');
  assert.equal(describe([]), 'no change');
  assert.equal(describe(null), 'no change');
  assert.equal(describe({ op: 'add', name: 'macro.x', size: 3, params: 1, from: ['a', 'b'] }), 'add macro.x (3 nodes, 1 params, 2 tasks)');
  assert.equal(describe({ op: 'retire', name: 'macro.x', why: 'unused' }), 'retire macro.x (unused)');
  assert.equal(describe(mutate(DEFAULTS, 1).change), mutate(DEFAULTS, 1).change.map((c) => c.gene + ' ' + (Array.isArray(c.from) ? '[' + c.from.join(',') + ']' : c.from) + ' -> ' + (Array.isArray(c.to) ? '[' + c.to.join(',') + ']' : c.to)).join('; '));
});

test('ids and hashes: stable, sensitive to every gene, blind to key order and unknown keys; rng is seeded', () => {
  assert.equal(genomeId(DEFAULTS), genomeId({ ...DEFAULTS }));
  const rev = Object.fromEntries(Object.entries(DEFAULTS).reverse());
  assert.equal(genomeId(rev), genomeId(DEFAULTS));
  assert.equal(genomeId({ ...DEFAULTS, wizard: 1 }), genomeId(DEFAULTS));
  for (const g of GENES.slice(0, 6)) assert.notEqual(genomeId(mutate(DEFAULTS, 1, { genes: [g.name] }).genome), genomeId(DEFAULTS), g.name);
  assert.match(genomeId(DEFAULTS), /^[0-9a-f]{16}$/);
  assert.match(hashText('x'), /^[0-9a-f]{16}$/);
  assert.notEqual(hashText('a'), hashText('b'));
  assert.equal(canonGenome(DEFAULTS), canonGenome(rev));
  const a = rng(42), b = rng(42), c = rng(43);
  const xs = [a(), a(), a()];
  assert.deepEqual(xs, [b(), b(), b()]);
  assert.notDeepEqual(xs, [c(), c(), c()]);
  assert.ok(xs.every((x) => x >= 0 && x < 1));
});

test('the module has no static node: import (a phone browser imports it) and genomeOf falls back to the defaults with no file system', () => {
  const src = fs.readFileSync(GENOME_SRC, 'utf8');
  assert.equal(/^\s*import\s/m.test(src), false, 'no import statement');
  const root = rootWith({ genes: { maxCost: 9 } });
  const probe = path.join(TMP, 'probe.mjs');
  fs.writeFileSync(probe, [
    "const saved = process.getBuiltinModule; process.getBuiltinModule = undefined;",
    'const m = await import(' + JSON.stringify(pathToFileURL(GENOME_SRC).href) + ');',
    'const without = m.genomeOf(' + JSON.stringify(root) + ').maxCost;',
    'process.getBuiltinModule = saved;',
    'const withFs = m.genomeOf(' + JSON.stringify(root) + ').maxCost;',
    'console.log(JSON.stringify({ without, withFs }));',
  ].join('\n'));
  const r = spawnSync(process.execPath, [probe], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(JSON.parse(r.stdout.trim()), { without: 7, withFs: 9 });
});

test('a gene appended to GENES is mutated, validated and read with no other change (open-ended)', () => {
  const g = gene('maxCost');
  assert.equal(g.scope, 'search');
  assert.equal(GENES.filter((x) => x.name === 'maxCost').length, 1, 'gene names are unique');
  assert.equal(new Set(GENES.map((x) => x.name)).size, GENES.length);
});
