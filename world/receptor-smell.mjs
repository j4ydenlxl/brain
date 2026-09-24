// world/receptor-smell.mjs: SMELL. This machine has no nose: the probe proves it (a Plug and
// Play scan finds no device named like a gas, VOC or odour sensor), and the receptor is fed by
// an odorant table instead, bench/fixtures/senses/odorants.csv: one compound per row, its
// chemical class and its odour descriptors (vanillin: vanilla, sweet, creamy). A sample is a
// sniff of one compound or of a mixture.
//
// The code: every descriptor is a key vector, the class is bound to a class role, the
// compound's own name is one more term, and a mixture is every term of every compound in one
// bundle. Two compounds that are described alike smell alike to this receptor; a compound and
// one it shares nothing with are as far apart as two random vectors.
import { Acc, chemicalProbe, fixture, key, loadTable, perceptSignal, round, sampleRows, splitList, tableSample } from './receptor-kit.mjs';

export const name = 'smell';
export const TABLE = fixture('odorants.csv');
export const table = () => loadTable(TABLE);

/** No chemical hardware unless a device that could be one exists; the table is the source either way. */
export function probe(opts = {}) { return chemicalProbe(name, table(), opts); }

/** One sniff: a row of the odorant table (opts.compound, opts.mixture or opts.index). */
export async function sample(opts = {}) { return tableSample(name, table(), opts); }

/** A sniff (the CSV rows of a sample) to a percept: descriptors, class and identity; provenance sense:smell. */
export function encode(s) {
  const t0 = performance.now();
  const rows = sampleRows(s), acc = new Acc(), descriptors = new Set();
  for (const r of rows) {
    for (const d of splitList(r.descriptors)) { acc.add(key('smell:descriptor:' + d)); descriptors.add(d); }
    acc.bind(key('smell:class'), key('smell:class:' + String(r.class).toLowerCase()));
    acc.add(key('smell:compound:' + String(r.name).toLowerCase()));
  }
  return perceptSignal(name, acc.sign(), {
    code: 'bundle of odour descriptor keys, the chemical class bound to a class role, and the compound identity, over every compound in the sniff',
    features: { compounds: rows.map((r) => r.name), descriptors: [...descriptors], terms: acc.n, encodeMs: round(performance.now() - t0) },
  });
}
