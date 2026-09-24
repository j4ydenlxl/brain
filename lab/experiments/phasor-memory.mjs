// lab/experiments/phasor-memory.mjs : EXPERIMENT (b). A NEW MEMORY STRUCTURE.
//
// Question. cells/fhrr.mjs phv.memory is a SUPERPOSITION store: every key-bound value is
// added into one accumulator of fixed size, and a read unbinds the key and cleans the result
// up against a codebook. cells/basic.mjs memory.assoc is a LIST store: it keeps every key it
// was given and answers a query by nearest neighbour. At the SAME dimension, on the same
// associative recall task, which one recalls more?
//
// The operating point is stated before the run, not chosen after it: dimension 1024 for both
// stores, 64 key-value pairs, a load of one pair per sixteen dimensions, which is an ordinary
// VSA working point rather than a cliff picked to flatter either arm. Queries are exact keys
// in a seeded order that is not the write order, so neither store is helped by recency.
//
// Both arms are scored by the same instrument: a lab.answer cell inside the sealed region,
// wired from whichever store the arm installed. Neither arm has a private path to the score.
//
// The bytes. traceBytes is what the store must keep to answer a query GIVEN the codebook:
// for the phasor store that is the accumulator alone, 16 bytes per dimension and constant in
// the number of pairs; for the list store it is every key it was handed, one byte per
// dimension per pair, growing without bound. codebookBytes is reported beside it and is not
// the same kind of thing: the phasor codebook is a cache of phvFromSeed, a deterministic
// function of the name, while the list store's keys are the store. Both numbers are printed
// so the trade-off can be read instead of argued.
import { Brain } from '../../core/brain.mjs';
import * as S from '../../core/signal.mjs';
import { RNG } from '../../core/rng.mjs';
import '../../cells/basic.mjs';
import '../../cells/fhrr.mjs';
import '../kinds.mjs';
import { defineExperiment } from '../experiment.mjs';

export const DIM = 1024;   // the equal dimension both stores are given
export const PAIRS = 64;   // key-value pairs written, a load of PAIRS / DIM

const keyName = (seed, i) => 'k:' + seed + ':' + i;
const valName = (seed, i) => 'v:' + seed + ':' + i;

/** The recorder cell both arms are scored by, and the store cell wiring, shared by both arms. */
function wire(brain, ctx, kind, params, outPort) {
  brain.addCell({ id: 'lab.store', kind, region: 'lab', circuit: 'recall', params, policy: { period: 'event' } });
  brain.connect('lab.store', outPort, 'lab.answer', 'in');
  return brain.cell('lab.store');
}

export const experiment = defineExperiment({
  name: 'phasor-memory',
  question: 'At equal dimension 1024 and 64 pairs, does the phasor superposition store (phv.memory) recall more than the bipolar list store (memory.assoc) it would replace?',
  hypothesis: { metric: 'recall', direction: 'increase', minEffect: 0.05 },
  bar: { alpha: 0.05, seeds: 8 },
  region: 'lab',
  ports: {},   // nothing is open until a mechanism declares the door its own cell needs
  seeds: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'],

  stream(seed) {
    const order = new RNG('recall:' + seed).shuffle(Array.from({ length: PAIRS }, (_, i) => i));
    return { seed, pairs: PAIRS, dim: DIM, writeOrder: Array.from({ length: PAIRS }, (_, i) => i), readOrder: order };
  },

  build(seed) {
    const b = new Brain({
      name: 'lab.recall', seed: 'recall:' + seed, ledger: 'off',
      growth: { enabled: false }, pruneEvery: 0, connectomeCapacity: 32,
    });
    b.addRegion('lab', { doc: 'isolated experimental region: the memory structure under test' });
    b.addRegion('outside', { doc: 'the rest of the organism, which a failed store must not reach' });
    b.addCell({ id: 'lab.answer', kind: 'lab.answer', region: 'lab', circuit: 'recall', policy: { period: 'event' } });
    b.addCell({ id: 'outside.log', kind: 'sink.log', region: 'outside', circuit: 'watch', policy: { period: 'event' } });
    return b;
  },

  // Treatment: the alternative memory structure. One accumulator, keys and values by name.
  mechanism(brain, ctx) {
    wire(brain, ctx, 'phv.memory', { d: DIM, threshold: 0 }, 'value');
    ctx.firewall.declare('in', 'lab.store#write');
    ctx.firewall.declare('in', 'lab.store#read');
    const seed = ctx.seed;
    brain.labStore = {
      kind: 'phv.memory', d: DIM,
      write(i) { brain.inject('lab.store', 'write', { kind: 'event', data: { key: keyName(seed, i), value: valName(seed, i) } }); },
      query(i) { brain.inject('lab.store', 'read', { kind: 'event', data: { key: keyName(seed, i) } }); },
      scored(a, i) { return { named: a ? a.data.value : null, sim: a ? a.data.sim : 0, correct: !!a && a.data.value === valName(seed, i) }; },
      traceBytes() { const st = brain.cell('lab.store').state; return st.mem.re.BYTES_PER_ELEMENT * st.mem.re.length + st.mem.im.BYTES_PER_ELEMENT * st.mem.im.length; },
      codebookBytes() { const st = brain.cell('lab.store').state; return (st.keys.items.size + st.values.items.size) * DIM * 4; },
      stored() { return brain.cell('lab.store').state.mem.n; },
    };
    return { store: 'phv.memory', structure: 'superposition accumulator', d: DIM };
  },

  // Control: the store the architecture already had, at the same dimension.
  control(brain, ctx) {
    wire(brain, ctx, 'memory.assoc', { threshold: 0, capacity: PAIRS * 4 }, 'out');
    ctx.firewall.declare('in', 'lab.store#key');
    ctx.firewall.declare('in', 'lab.store#value');
    ctx.firewall.declare('in', 'lab.store#query');
    const seed = ctx.seed;
    brain.labStore = {
      kind: 'memory.assoc', d: DIM,
      write(i) {
        brain.inject('lab.store', 'key', { kind: 'hv', data: S.hvFromSeed(keyName(seed, i), DIM) });
        brain.inject('lab.store', 'value', { kind: 'event', data: { name: valName(seed, i) } });
      },
      query(i) { brain.inject('lab.store', 'query', { kind: 'hv', data: S.hvFromSeed(keyName(seed, i), DIM) }); },
      scored(a, i) { const d = a ? a.data : null; return { named: d && d.value ? d.value.name : null, sim: d ? d.sim : 0, correct: !!d && d.hit === true && d.value && d.value.name === valName(seed, i) }; },
      traceBytes() { const st = brain.cell('lab.store').state; return st.keys.reduce((n, k) => n + k.BYTES_PER_ELEMENT * k.length, 0); },
      codebookBytes() { return 0; },
      stored() { return brain.cell('lab.store').state.keys.length; },
    };
    return { store: 'memory.assoc', structure: 'nearest neighbour list', d: DIM };
  },

  measure(brain, ctx) {
    const store = brain.labStore, { writeOrder, readOrder } = ctx.stream;
    for (const i of writeOrder) { store.write(i); brain.tick(1); }
    const seen = brain.cell('lab.answer').state.seen;
    let correct = 0, simSum = 0, answered = 0;
    for (const i of readOrder) {
      const had = seen.length;
      store.query(i);
      // Two ticks, not one: the store runs and emits on the first, and core/brain.mjs _emit
      // schedules delivery for the tick after that, so the recorder only sees the answer on
      // the second. One tick here would score every query against the previous query answer.
      brain.tick(2);
      const a = seen.length > had ? seen[seen.length - 1] : null;
      const s = store.scored(a, i);
      if (a) answered++;
      if (s.correct) correct++;
      simSum += Number.isFinite(s.sim) ? s.sim : 0;
    }
    const trace = store.traceBytes(), codebook = store.codebookBytes();
    return {
      recall: correct / readOrder.length,
      answered,
      correct,
      queries: readOrder.length,
      meanSim: simSum / readOrder.length,
      pairsStored: store.stored(),
      traceBytes: trace,
      codebookBytes: codebook,
      traceBytesPerPair: trace / PAIRS,
      recallPerKB: trace > 0 ? (correct / readOrder.length) / (trace / 1024) : 0,
      cellRuns: brain.stats.runs,
    };
  },
});

export default experiment;
