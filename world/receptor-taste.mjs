// world/receptor-taste.mjs: TASTE. No tongue either: the probe proves it the same way smell's
// does, and the receptor is fed by a tastant table, bench/fixtures/senses/tastants.csv: one
// compound per row, its chemical class and its taste qualities: the five basic tastes (sweet,
// salty, sour, bitter, umami), the two proposed ones (fat, kokumi), the chemesthetic sensations
// a tongue reports alongside them (pungent, cooling, astringent), and two modifiers
// (taste-modifying, sweet-suppressing). A sample is one taste or a mouthful of several.
//
// The code: every quality is a key vector, the class is bound to a class role, the compound's
// name is one more term, and a mouthful bundles every term of every compound. Sucrose is
// nearer glucose (both sweet) than quinine (bitter), and test/senses.test.mjs says so.
import { Acc, chemicalProbe, fixture, key, loadTable, perceptSignal, round, sampleRows, splitList, tableSample } from './receptor-kit.mjs';

export const name = 'taste';
export const TABLE = fixture('tastants.csv');
export const table = () => loadTable(TABLE);

/** No chemical hardware unless a device that could be one exists; the table is the source either way. */
export function probe(opts = {}) { return chemicalProbe(name, table(), opts); }

/** One taste: a row of the tastant table (opts.compound, opts.mixture or opts.index). */
export async function sample(opts = {}) { return tableSample(name, table(), opts); }

/** A taste (the CSV rows of a sample) to a percept: qualities, class and identity; provenance sense:taste. */
export function encode(s) {
  const t0 = performance.now();
  const rows = sampleRows(s), acc = new Acc(), qualities = new Set();
  for (const r of rows) {
    for (const q of splitList(r.qualities)) { acc.add(key('taste:quality:' + q)); qualities.add(q); }
    acc.bind(key('taste:class'), key('taste:class:' + String(r.class).toLowerCase()));
    acc.add(key('taste:compound:' + String(r.name).toLowerCase()));
  }
  return perceptSignal(name, acc.sign(), {
    code: 'bundle of taste quality keys, the chemical class bound to a class role, and the compound identity, over every compound in the mouthful',
    features: { compounds: rows.map((r) => r.name), qualities: [...qualities], terms: acc.n, encodeMs: round(performance.now() - t0) },
  });
}
