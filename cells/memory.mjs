// cells/memory.mjs. The memory tiers as cells, so that memory participates in the
// connectome instead of sitting beside it. Importing this module registers the kinds.
//
// Every one of these cells reaches its stores through params.system, a registered name
// (see memory/index.mjs), never through a live object reference, because cell params are
// serialized with the cell. Cell state here holds only counters and small local buffers.
//
// Two of the kinds are meant to run on a slow period from core/clock.mjs:
//   memory.consolidate at MIN or HOUR, which bundles repeated episodes into concepts;
//   memory.forget at MIN or HOUR, which decays what is not being used.
import { defineKind } from '../core/cell.mjs';
import { MIN, HOUR, DAY } from '../core/clock.mjs';
import { hvCopy } from '../core/signal.mjs';
import { getMemorySystem } from '../memory/index.mjs';

const ANY = ['hv', 'sdr', 'num', 'sym', 'vec', 'event'];
const last = (m) => (m.length ? m[m.length - 1].sig : null);

function sysOf(cell) { return getMemorySystem(cell.params.system); }
function circuitKey(cell) { return cell.region + '/' + cell.circuit; }

// ---------------------------------------------------------------- working
defineKind('memory.working', {
  doc: 'Working memory ring for the circuit this cell sits in. Every arriving signal is pushed with a salience scaled by the edge weight, salience decays with elapsed ticks, and a query returns the most salient entries.',
  ports: {
    in: [{ name: 'item', kinds: ANY }, { name: 'query', kinds: ['event'] }],
    out: [{ name: 'top', kinds: ['event'] }, { name: 'recall', kinds: ANY }],
  },
  defaults: { system: 'default', capacity: 32, tau: 500, floor: 0.05, salience: 1, k: 4, evict: 'oldest' },
  init: () => ({ pushed: 0, swept: 0, queries: 0 }),
  compute: (ins, cell, ctx) => {
    const p = cell.params;
    const ring = sysOf(cell).working.of(circuitKey(cell), { capacity: p.capacity, tau: p.tau, floor: p.floor, evict: p.evict });
    for (const it of ins[0]) {
      // the ring holds what it is given for as long as its salience lasts, which is past this
      // tick, so an hv payload is copied into the row rather than kept by reference
      const data = it.sig.kind === 'hv' ? hvCopy(it.sig.data) : it.sig.data;
      ring.push({ t: ctx.t, kind: it.sig.kind, data, salience: p.salience * Math.max(1e-6, Math.abs(it.w)), cell: cell.id, port: it.sig.port });
      cell.state.pushed++;
    }
    cell.state.swept += ring.sweep(ctx.t);
    const q = last(ins[1]);
    if (!q) return [null, null];
    cell.state.queries++;
    const k = Number.isInteger(q.data?.k) ? q.data.k : p.k;
    const top = ring.top(ctx.t, k);
    const summary = {
      kind: 'event',
      data: {
        circuit: circuitKey(cell), size: ring.size(),
        items: top.map(e => ({ t: e.t, kind: e.kind, salience: e.salience, cell: e.cell })),
      },
    };
    const best = top[0];
    return [summary, best && best.data != null ? { kind: best.kind, data: best.data } : null];
  },
});

// ---------------------------------------------------------------- episodic
defineKind('memory.episodic', {
  doc: 'Append only episode store. A key on the key port writes an episode, stamped with the current tick and generation, carrying the latest value event and its items. A query hypervector reads the nearest episodes back through the index.',
  ports: {
    in: [{ name: 'key', kinds: ['hv'] }, { name: 'value', kinds: ['event'] }, { name: 'query', kinds: ['hv'] }],
    out: [{ name: 'recall', kinds: ['event'] }],
  },
  defaults: { system: 'default', k: 1, minSim: 0.15, scan: false },
  init: () => ({ appended: 0, queries: 0, lastId: -1 }),
  compute: (ins, cell, ctx) => {
    const ep = sysOf(cell).episodic;
    const p = cell.params;
    const v = last(ins[1]);
    for (const it of ins[0]) {
      const value = v ? v.data : null;
      const id = ep.append({ key: it.sig.data, value, items: (value && Array.isArray(value.items)) ? value.items : [], t: ctx.t, gen: ctx.gen });
      cell.state.appended++;
      cell.state.lastId = id;
    }
    const q = last(ins[2]);
    if (!q) return [null];
    cell.state.queries++;
    const hits = ep.retrieve(q.data, { k: p.k, minSim: p.minSim, scan: p.scan });
    return [{
      kind: 'event',
      data: {
        hit: hits.length > 0, n: ep.size(),
        hits: hits.map(h => ({ id: h.id, sim: h.sim, t: h.t, gen: h.gen, value: h.value, items: h.items })),
      },
    }];
  },
});

// ---------------------------------------------------------------- semantic
defineKind('memory.semantic', {
  doc: 'Associative memory with iterative cleanup. A pattern with a label event learns a named concept, a query runs the modern Hopfield update until it converges and names the attractor it landed in.',
  ports: {
    in: [{ name: 'pattern', kinds: ['hv'] }, { name: 'label', kinds: ['event'] }, { name: 'query', kinds: ['hv'] }],
    out: [{ name: 'concept', kinds: ['event'] }, { name: 'clean', kinds: ['hv'] }],
  },
  defaults: { system: 'default', beta: 8, maxIters: 8, threshold: 0.1, strength: 1 },
  init: () => ({ learned: 0, queries: 0 }),
  compute: (ins, cell) => {
    const sem = sysOf(cell).semantic;
    const p = cell.params;
    const label = last(ins[1]);
    for (const it of ins[0]) {
      const name = label && label.data && label.data.name ? label.data.name : null;
      sem.add(it.sig.data, { name, strength: label?.data?.strength ?? p.strength });
      cell.state.learned++;
    }
    const q = last(ins[2]);
    if (!q) return [null, null];
    cell.state.queries++;
    const r = sem.recognize(q.data, { beta: p.beta, maxIters: p.maxIters, threshold: p.threshold });
    return [
      { kind: 'event', data: { name: r.name, sim: r.sim, cueSim: r.cueSim, iterations: r.iterations, converged: r.converged, patterns: sem.size() } },
      // own: the cleanup walk's last state is a vector the walk made and released every other
      // state of (memory/semantic.mjs cleanup), and the store keeps its patterns separately. A
      // walk that took no step returns the query itself, which belongs to the mail it came on.
      { kind: 'hv', data: r.hv, own: r.hv !== q.data },
    ];
  },
});

// ---------------------------------------------------------------- procedural
defineKind('memory.procedural', {
  doc: 'Skill store. A define event stores a sub circuit description, a request event emits one back so a builder can instantiate it, a record event files the outcome of a use.',
  ports: {
    in: [{ name: 'define', kinds: ['event'] }, { name: 'request', kinds: ['event'] }],
    out: [{ name: 'skill', kinds: ['event'] }],
  },
  defaults: { system: 'default' },
  init: () => ({ defined: 0, requests: 0 }),
  compute: (ins, cell) => {
    const store = sysOf(cell).procedural;
    for (const it of ins[0]) {
      const d = it.sig.data;
      if (d && d.name && (d.cells || d.edges)) { store.define(d.name, d); cell.state.defined++; }
      else if (d && d.name && d.record) store.record(d.name, d.record);
    }
    const q = last(ins[1]);
    if (!q) return [null];
    cell.state.requests++;
    const name = q.data?.name;
    if (name === undefined || name === null) {
      return [{ kind: 'event', data: { found: false, list: store.list(), ranked: store.ranked(8) } }];
    }
    const skill = store.get(name);
    return [{ kind: 'event', data: { found: skill !== null, name, skill } }];
  },
});

// ---------------------------------------------------------------- sequence
defineKind('memory.sequence', {
  doc: 'Permute chained sequences. Items stream in on the item port and are named against the item codebook (or by an accompanying name event); a mark event closes the run and stores it; a cue hypervector recalls a stored sequence and predicts the item one position past the cue.',
  ports: {
    in: [{ name: 'item', kinds: ['hv'] }, { name: 'mark', kinds: ['event'] }, { name: 'cue', kinds: ['hv'] }],
    out: [{ name: 'next', kinds: ['hv'] }, { name: 'recall', kinds: ['event'] }],
  },
  defaults: { system: 'default', threshold: 0.15, autoName: 'seq', maxRun: 256 },
  init: () => ({ buffer: [], stored: 0, recalls: 0, unnamed: 0 }),
  compute: (ins, cell) => {
    const sm = sysOf(cell).sequence;
    const p = cell.params;
    const st = cell.state;
    const mark = last(ins[1]);
    for (const it of ins[0]) {
      let name = mark && mark.data && mark.data.name ? mark.data.name : null;
      if (name === null) {
        const near = sm.items.nearest(it.sig.data);
        if (near && near[1] >= sm.itemThreshold) name = near[0];
      }
      // the codebook is a store: it keeps its own copy, never the payload it was shown
      if (name === null) { name = p.autoName + ':item:' + (st.unnamed++); sm.items.set(name, hvCopy(it.sig.data)); }
      st.buffer.push(name);
    }
    // an open run holds at most maxRun names: past that, with no mark to close it, the oldest
    // fall off the front and the codebook releases the auto-named items nothing refers to
    if (st.buffer.length > p.maxRun) {
      const gone = st.buffer.splice(0, st.buffer.length - p.maxRun);
      sm.release(gone, new Set(st.buffer));
    }
    if (mark && mark.data) {
      if (mark.data.reset) st.buffer = [];
      const storeAs = mark.data.store;
      if (storeAs && st.buffer.length > 0) {
        const seqName = storeAs === true ? p.autoName + ':' + st.stored : storeAs;
        if (!sm.has(seqName)) sm.store(seqName, st.buffer);
        st.stored++;
        st.buffer = [];
      }
    }
    const cue = last(ins[2]);
    if (!cue) return [null, null];
    st.recalls++;
    // a cue hypervector is decoded position by position until the codebook stops matching
    const cueItems = [];
    for (let i = 0; i < 16; i++) {
      const d = sm.decodeAt(cue.data, i);
      if (d.name === null) break;
      cueItems.push(d.name);
    }
    if (cueItems.length === 0) return [null, { kind: 'event', data: { hit: false, reason: 'cue did not decode' } }];
    const r = sm.recall(cueItems, { threshold: p.threshold });
    const pred = sm.predictNext(cueItems, { threshold: p.threshold });
    return [
      pred.name ? { kind: 'hv', data: sm.item(pred.name) } : null,
      { kind: 'event', data: { hit: r.name !== null, name: r.name, sim: r.sim, items: r.items, exact: r.exact, cue: cueItems, next: pred.name, nextSim: pred.sim, via: pred.via } },
    ];
  },
});

// ---------------------------------------------------------------- self
defineKind('memory.self', {
  doc: 'Activity statistics about the brain this cell lives in. Each run samples every cell, records the change since the previous sample into the current time window, and emits the busiest cells and regions.',
  ports: {
    in: [{ name: 'probe', kinds: ['event'] }],
    out: [{ name: 'stats', kinds: ['event'] }],
  },
  defaults: { system: 'default', k: 5, metric: 'runs', windows: 4 },
  init: () => ({ observations: 0 }),
  compute: (ins, cell, ctx) => {
    const self = sysOf(cell).self;
    const p = cell.params;
    const probe = last(ins[0]);
    const obs = self.observeBrain(ctx.brain);
    cell.state.observations++;
    const from = Math.max(0, ctx.t - p.windows * self.window);
    const metric = probe?.data?.metric ?? p.metric;
    const k = Number.isInteger(probe?.data?.k) ? probe.data.k : p.k;
    const totals = self.totals({ from, to: ctx.t });
    return [{
      kind: 'event',
      data: {
        t: ctx.t, observed: obs.changed, cells: obs.cells, windows: totals.windows,
        topCells: self.top(metric, k, { from, to: ctx.t }),
        regions: totals.regions,
      },
    }];
  },
});

// ---------------------------------------------------------------- consolidation, a slow cell
defineKind('memory.consolidate', {
  doc: 'Slow cell, intended period MIN or HOUR. Reads the episodes inside its window and bundles items that keep appearing together upward into semantic concepts, with a strength equal to how often they co-occurred.',
  ports: {
    in: [{ name: 'trigger', kinds: ['event'] }],
    out: [{ name: 'concept', kinds: ['event'] }],
  },
  defaults: { system: 'default', window: HOUR, minCount: 3, maxConcepts: 32, solo: true, suggestedPeriod: MIN },
  init: () => ({ runs: 0, formed: 0 }),
  compute: (ins, cell, ctx) => {
    const sys = sysOf(cell);
    const p = cell.params;
    const trigger = last(ins[0]);
    const window = trigger?.data?.window ?? p.window;
    const from = Number.isFinite(window) ? ctx.t - window : -Infinity;
    const r = sys.consolidate({ from, to: ctx.t, minCount: trigger?.data?.minCount ?? p.minCount, maxConcepts: p.maxConcepts, solo: p.solo });
    cell.state.runs++;
    cell.state.formed += r.formed.length;
    if (r.formed.length === 0 && r.scanned === 0) return [null];
    return [{
      kind: 'event',
      data: { t: ctx.t, scanned: r.scanned, formed: r.formed, concepts: sys.semantic.byName.size },
    }];
  },
});

// ---------------------------------------------------------------- forgetting, a slow cell
defineKind('memory.forget', {
  doc: 'Slow cell, intended period MIN or HOUR. Sweeps working rings below the salience floor, decays semantic strengths and removes what falls under it, and cools episodes older than the horizon without deleting them.',
  ports: {
    in: [{ name: 'trigger', kinds: ['event'] }],
    out: [{ name: 'forgotten', kinds: ['event'] }],
  },
  defaults: { system: 'default', rate: 0.9, floor: 0.1, horizon: DAY, sweepWorking: true, dropSkills: false, suggestedPeriod: MIN },
  init: () => ({ runs: 0, forgotten: 0, cooled: 0, swept: 0 }),
  compute: (ins, cell, ctx) => {
    const sys = sysOf(cell);
    const p = cell.params;
    const trigger = last(ins[0]);
    const r = sys.forget({
      now: ctx.t,
      rate: trigger?.data?.rate ?? p.rate,
      floor: trigger?.data?.floor ?? p.floor,
      horizon: trigger?.data?.horizon ?? p.horizon,
      sweepWorking: p.sweepWorking,
      dropSkills: p.dropSkills,
    });
    cell.state.runs++;
    cell.state.forgotten += r.forgotten.length;
    cell.state.cooled += r.cooled;
    cell.state.swept += r.swept;
    if (r.forgotten.length === 0 && r.cooled === 0 && r.swept === 0 && r.skills.length === 0) return [null];
    return [{ kind: 'event', data: { t: ctx.t, swept: r.swept, forgotten: r.forgotten, cooled: r.cooled, skills: r.skills } }];
  },
});
