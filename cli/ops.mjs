// cli/ops.mjs: ONE IMPLEMENTATION, TWO CALLERS. Every observation and every mutation is a
// pure function of (brain, args, env) returning a JSON safe payload. The control plane calls
// these against the running organism; the offline CLI calls the very same functions against a
// restored snapshot. That is why `status` prints the same fields whether or not a brain is
// live, and why nothing can drift between the two paths.
import { getKind, listKinds } from '../core/cell.mjs';
import { listPrimitives } from '../core/primitives.mjs';
import { Clock } from '../core/clock.mjs';
import { ACTIVE, DORMANT, PRUNED } from '../core/connectome.mjs';
import * as S from '../core/signal.mjs';
import { jsonSafe } from './format.mjs';
import { listLabels, readLedgerFile, ledgerIndex, ledgerCounts, saveLabel, readMeta } from './state.mjs';

// ---------------------------------------------------------------- shared helpers
export function flagsLabel(f) {
  const l = [];
  if (f & ACTIVE) l.push('active');
  if (f & DORMANT) l.push('dormant');
  if (f & PRUNED) l.push('pruned');
  return l.join('+') || 'none';
}

export function renderData(kind, data) {
  try {
    switch (kind) {
      case 'num': return S.ratToString(data);
      case 'sym': return S.symToString(data);
      case 'hv': return 'hv[' + data.length + '] #' + S.hashData('hv', data);
      case 'vec': return 'vec[' + data.length + '] [' + Array.from(data.subarray(0, 4)).map((x) => x.toFixed(3)).join(', ') + (data.length > 4 ? ', ...' : '') + ']';
      case 'sdr': return 'sdr[' + data.n + '] k=' + data.idx.length;
      default: return JSON.stringify(jsonSafe(data));
    }
  } catch (e) { return '<' + kind + ': ' + (e && e.message) + '>'; }
}

export function describeSignal(brain, sig) {
  const cell = sig.src >= 0 ? brain.cells[sig.src] : null;
  let port = String(sig.port);
  if (cell) { try { port = getKind(cell.kind).ports.out[sig.port]?.name ?? port; } catch { /* kind gone */ } }
  return {
    t: sig.t, gen: sig.gen, seq: sig.seq,
    cell: cell ? cell.id : 'external', port, kind: sig.kind,
    data: jsonSafe(S.dataToJSON(sig.kind, sig.data)),
    text: renderData(sig.kind, sig.data),
  };
}

// Parse the <json> argument of `inject` into real signal data for the given kind.
export function parseSignalData(kind, text) {
  if (!S.isKind(kind)) throw new Error('unknown signal kind "' + kind + '" (have: ' + S.KINDS.join(', ') + ')');
  const raw = String(text ?? '').trim();
  if (kind === 'num' && /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(raw)) return S.ratFromDecimal(raw); // exact from the literal text
  if (kind === 'num' && /^[+-]?\d+\s*\/\s*[+-]?\d+$/.test(raw)) return S.ratFromDecimal(raw.replace(/\s+/g, ''));
  let j;
  try { j = JSON.parse(raw); } catch (e) {
    if (kind === 'num' || kind === 'hv') j = raw;
    else throw new Error('inject: <json> is not valid JSON (' + e.message + '). Got: ' + raw.slice(0, 80));
  }
  switch (kind) {
    case 'num':
      if (j && typeof j === 'object' && j.type) return S.numFromJSON(j);
      return S.ratFromDecimal(String(j));
    case 'vec': {
      const arr = Array.isArray(j) ? j : j && Array.isArray(j.data) ? j.data : null;
      if (!arr) throw new Error('inject vec: expected an array of numbers, or { "data": [...] }');
      return Float32Array.from(arr.map(Number));
    }
    case 'hv': {
      if (Array.isArray(j)) return Int8Array.from(j.map((x) => (Number(x) >= 0 ? 1 : -1)));
      if (typeof j === 'string') return S.hvFromSeed(j);
      if (j && typeof j.seed === 'string') return S.hvFromSeed(j.seed);
      throw new Error('inject hv: expected a seed string, { "seed": "cat" }, or an array of +1/-1');
    }
    case 'sdr': {
      if (!j || typeof j.n !== 'number' || !Array.isArray(j.idx)) throw new Error('inject sdr: expected { "n": 1024, "idx": [1,2,3] }');
      return S.sdr(j.n, j.idx);
    }
    case 'sym': return symFromJSON(j);
    default: return j;
  }
}
function symFromJSON(e) {
  if (e == null || typeof e !== 'object') throw new Error('inject sym: expected an expression tree { "op": "...", ... }');
  if (e.op === 'num') return { op: 'num', value: e.value && typeof e.value === 'object' && e.value.type ? S.numFromJSON(e.value) : S.ratFromDecimal(String(e.value)) };
  if (e.op === 'var') return { op: 'var', name: String(e.name) };
  if (!Array.isArray(e.args)) throw new Error('inject sym: op ' + e.op + ' needs args');
  return { op: e.op, args: e.args.map(symFromJSON) };
}

function cellInfo(brain, cell) {
  let doc = '', kindDef = null;
  try { kindDef = getKind(cell.kind); doc = kindDef.doc || ''; } catch { /* kind not registered */ }
  return { doc, kindDef };
}

function edgeRow(brain, e, side) {
  const c = brain.connectome;
  const other = side === 'out' ? brain.cells[c.dst[e]] : brain.cells[c.src[e]];
  const otherPort = side === 'out' ? c.dstPort[e] : c.srcPort[e];
  const ownPort = side === 'out' ? c.srcPort[e] : c.dstPort[e];
  let otherName = String(otherPort), ownName = String(ownPort);
  try {
    const od = getKind(other.kind).ports[side === 'out' ? 'in' : 'out'];
    otherName = od[otherPort]?.name ?? otherName;
  } catch { /* kind gone */ }
  return {
    e, [side === 'out' ? 'to' : 'from']: other.id + '.' + otherName,
    port: ownName, w: round(c.w[e]), delay: c.delay[e], usage: c.usage[e],
    conf: round(c.conf[e]), lastT: c.lastT[e], state: flagsLabel(c.flags[e]),
  };
}
function round(x, n = 4) { return Number.isFinite(x) ? Number(x.toFixed(n)) : x; }

// ---------------------------------------------------------------- the operations
export const ops = {
  health(brain) {
    return { t: brain.clock.t, gen: brain.clock.gen, cells: brain.cells.length };
  },

  status(brain, args, env) {
    const summary = jsonSafe(brain.summary());
    const events = readLedgerFile(env.name);
    const meta = readMeta(env.name);
    return {
      summary,
      seed: meta.seed || null,
      created: meta.created || null,
      paused: env.runner ? env.runner.state.paused : false,
      running: Boolean(env.runner),
      runner: env.runner ? env.runner.snapshotState() : null,
      labels: listLabels(env.name).map((l) => ({ label: l.label, bytes: l.bytes, saved: l.saved })),
      ledgerCounts: ledgerCounts(events),
      ledgerLines: brain.ledger && typeof brain.ledger.seq === 'number' ? brain.ledger.seq : events.length,
      ledgerTail: events.length,
      proposals: brain.gate.listPending().map((p) => ({ id: p.id, kind: p.kind, by: p.by, why: p.why, t: p.t })),
    };
  },

  inspect(brain, args) {
    const what = args.what || 'cell';
    if (what === 'cell') {
      const cell = brain.cell(args.id);
      const raw = brain.inspect(cell.id);
      const { doc, kindDef } = cellInfo(brain, cell);
      const portRows = [];
      const ports = kindDef ? kindDef.ports : cell.ports;
      ports.in.forEach((p, i) => portRows.push({ dir: 'in', i, name: p.name, kinds: p.kinds.join('|'), mail: cell.mailbox[i]?.length ?? 0 }));
      ports.out.forEach((p, i) => portRows.push({ dir: 'out', i, name: p.name, kinds: p.kinds.join('|'), mail: '' }));
      return {
        what: 'cell', id: cell.id, idx: cell.idx, kind: cell.kind, doc,
        region: cell.region, circuit: cell.circuit,
        policy: cell.policy, periodLabel: Clock.label(cell.policy.period),
        params: jsonSafe(cell.params), state: jsonSafe(raw.state), stats: jsonSafe(cell.stats),
        portRows,
        memory: { working: cell.memory.working.length, refs: Object.keys(cell.memory.refs || {}).length },
        edgesOut: [...brain.connectome.outOf(cell.idx)].map((e) => edgeRow(brain, e, 'out')),
        edgesIn: [...brain.connectome.into(cell.idx)].map((e) => edgeRow(brain, e, 'in')),
      };
    }
    if (what === 'circuit') {
      const key = brain.circuits.has(args.id) ? args.id : [...brain.circuits.keys()].find((k) => k === args.id || k.endsWith('/' + args.id));
      if (!key) throw new Error('no circuit "' + args.id + '" (have: ' + [...brain.circuits.keys()].join(', ') + ')');
      const c = brain.circuits.get(key);
      const cells = [...c.cells].map((i) => brain.cells[i]);
      return {
        what: 'circuit', id: key, region: c.region, name: c.name, doc: c.doc,
        period: c.period, periodLabel: Clock.label(c.period),
        working: c.working.slice(-16),
        cells: cells.map((x) => ({ cell: x.id, kind: x.kind, period: Clock.label(x.policy.period), runs: x.stats.runs, fired: x.stats.fired, skips: x.stats.skips })),
      };
    }
    if (what === 'region') {
      const r = brain.regions.get(args.id);
      if (!r) throw new Error('no region "' + args.id + '" (have: ' + [...brain.regions.keys()].join(', ') + ')');
      const cells = [...r.cells].map((i) => brain.cells[i]);
      let inner = 0, crossing = 0;
      for (const c of cells) for (const e of brain.connectome.outOf(c.idx)) (brain.cells[brain.connectome.dst[e]].region === r.name ? inner++ : crossing++);
      return {
        what: 'region', id: r.name, doc: r.doc,
        budget: Number.isFinite(r.budget) ? r.budget : 'inf',
        circuits: [...r.circuits],
        edgesInside: inner, edgesCrossing: crossing,
        cells: cells.map((x) => ({ cell: x.id, kind: x.kind, circuit: x.circuit, period: Clock.label(x.policy.period), runs: x.stats.runs, fired: x.stats.fired })),
      };
    }
    if (what === 'edge') {
      const c = brain.connectome;
      let e = -1;
      if (/^\d+$/.test(String(args.id))) e = Number(args.id);
      else {
        const m = /^(.+?)\s*(?:->|>)\s*(.+)$/.exec(String(args.id));
        if (!m) throw new Error('inspect edge: give an edge index, or "src>dst"');
        const a = brain.cell(m[1].trim()), b = brain.cell(m[2].trim());
        e = [...c.outOf(a.idx)].find((x) => c.dst[x] === b.idx) ?? -1;
        if (e === undefined || e < 0) throw new Error('no edge ' + a.id + ' -> ' + b.id);
      }
      if (!(e >= 0 && e < c.size())) throw new Error('no edge #' + args.id + ' (connectome holds ' + c.size() + ')');
      const raw = c.edge(e);
      return {
        what: 'edge', ...raw,
        src: brain.cells[raw.src].id, dst: brain.cells[raw.dst].id,
        w: round(raw.w), conf: round(raw.conf), state: flagsLabel(raw.flags),
      };
    }
    throw new Error('inspect: what must be cell, circuit, region or edge, got ' + what);
  },

  inject(brain, args) {
    const data = parseSignalData(args.kind, args.json);
    const sig = brain.inject(args.cell, args.port, { kind: args.kind, data }, { delay: Number(args.delay || 0), w: Number(args.w ?? 1) });
    return {
      injected: describeSignal(brain, sig),
      cell: args.cell, port: args.port,
      arrivesAt: brain.clock.t + Number(args.delay || 0),
      t: brain.clock.t,
    };
  },

  tick(brain, args, env) {
    const n = Math.max(0, Math.floor(Number(args.n ?? 1)));
    const before = { t: brain.clock.t, runs: brain.stats.runs, signals: brain.stats.signals, delivered: brain.stats.delivered, seq: brain.ledger.seq };
    const t0 = performance.now();
    brain.tick(n);
    const wall = performance.now() - t0;
    if (env.runner) env.runner.state.done += n;
    const outbox = brain.takeOutbox().map((s) => describeSignal(brain, s));
    return {
      ticked: n, from: before.t, t: brain.clock.t, gen: brain.clock.gen,
      runs: brain.stats.runs - before.runs,
      signals: brain.stats.signals - before.signals,
      delivered: brain.stats.delivered - before.delivered,
      ledgerFrom: before.seq, ledgerTo: brain.ledger.seq,
      wallMs: Number(wall.toFixed(3)),
      ticksPerSec: wall > 0 ? Math.round(n / (wall / 1000)) : null,
      outbox,
    };
  },

  pause(brain, args, env) {
    if (!env.runner) throw new Error('no live brain to pause (start one with: brain run ' + env.name + ' --realtime)');
    env.runner.pause();
    return { paused: true, t: brain.clock.t, done: env.runner.state.done };
  },
  resume(brain, args, env) {
    if (!env.runner) throw new Error('no live brain to resume (start one with: brain run ' + env.name + ' --realtime)');
    env.runner.resume();
    return { paused: false, t: brain.clock.t, done: env.runner.state.done };
  },
  // Stepping a live brain pauses it first so the count is exact. With no live brain this is
  // just a tick against the snapshot, which is the honest offline equivalent.
  step(brain, args, env) {
    const n = Math.max(1, Math.floor(Number(args.n ?? 1)));
    if (env.runner) env.runner.pause();
    const r = ops.tick(brain, { n }, env);
    return { ...r, paused: Boolean(env.runner), stepped: n };
  },
  stop(brain, args, env) {
    if (!env.runner) throw new Error('no live brain to stop');
    env.runner.stop(args.reason || 'control');
    return { stopping: true, t: brain.clock.t, done: env.runner.state.done };
  },

  snapshot(brain, args, env) {
    const file = brain.snapshot(env.layout.dir);
    brain.ledger.flush();
    let labelled = null;
    if (args.label) labelled = saveLabel(env.name, args.label);
    return { file, label: args.label || null, labelled, t: brain.clock.t, gen: brain.clock.gen, cells: brain.cells.length, edges: brain.connectome.size() };
  },

  proposals(brain) {
    return {
      pending: brain.gate.listPending().map((p) => jsonSafe(p)),
      stats: brain.gate.stats,
      humanRequired: [...brain.gate.humanRequired],
    };
  },
  propose(brain, args) {
    const p = brain.gate.propose({
      kind: args.kind,
      what: args.what || {},
      why: args.why || 'proposed from the CLI',
      evidence: args.evidence || {},
      by: args.by || 'cli',
    }, brain.ctx);
    return { proposal: jsonSafe(p) };
  },
  approve(brain, args, env) { return decide(brain, args, env, true); },
  reject(brain, args, env) { return decide(brain, args, env, false); },

  ledger(brain, args, env) {
    const n = Math.max(1, Math.floor(Number(args.n ?? 30)));
    brain.ledger.flush();
    let events = readLedgerFile(env.name);
    if (args.type) events = events.filter((e) => e.type === args.type);
    if (args.cell) events = events.filter((e) => e.cell === args.cell);
    const rows = events.slice(-n);
    return {
      total: events.length, shown: rows.length, type: args.type || null,
      counts: ledgerCounts(events),
      rows: rows.map((e) => ({ seq: e.seq, t: e.t, type: e.type, what: whatOf(e) })),
      events: rows.map(jsonSafe),
    };
  },

  trace(brain, args, env) {
    const depth = Math.max(1, Math.floor(Number(args.depth ?? 8)));
    brain.ledger.flush();
    const events = readLedgerFile(env.name);
    const index = ledgerIndex(events);
    let root = Number(args.seq);
    if (!Number.isFinite(root) || args.seq === 'last' || args.seq === undefined) {
      const runs = events.filter((e) => e.type === 'cell.run');
      if (!runs.length) throw new Error('no cell.run events in the ledger yet (tick the brain first)');
      root = runs[runs.length - 1].seq;
    }
    if (!index.has(root)) throw new Error('no ledger event #' + root + ' (the ledger holds seq 0 to ' + (events.length ? events[events.length - 1].seq : -1) + ')');
    return traceTree(brain, index, root, depth);
  },

  kinds() {
    return {
      kinds: listKinds().map((name) => {
        const k = getKind(name);
        return {
          kind: name, doc: k.doc || '', cost: k.cost,
          in: k.ports.in.map((p) => p.name + ':' + p.kinds.join('|')).join(' '),
          out: k.ports.out.map((p) => p.name + ':' + p.kinds.join('|')).join(' '),
          learn: Boolean(k.learn), predicts: Boolean(k.predict),
        };
      }),
    };
  },
  primitives() { return { primitives: listPrimitives().map((p) => ({ primitive: p.name, in: (p.in || []).join('|'), out: p.out, cost: p.cost })) }; },
};

function decide(brain, args, env, ok) {
  const id = Number(args.id);
  if (!Number.isFinite(id)) throw new Error((ok ? 'approve' : 'reject') + ': give a proposal id (see: brain proposals ' + env.name + ')');
  const p = brain.gate.decide(id, ok, args.by || 'human', brain.ctx);
  let applied = false, note = '';
  if (ok) {
    try {
      if (p.kind === 'edge.grow') { brain.connect(p.what.src, p.what.srcPort ?? 0, p.what.dst, p.what.dstPort ?? 0, { w: p.what.w ?? 0.1, conf: 0.2, by: 'human' }); applied = true; }
      else if (p.kind === 'edge.prune') { brain.connectome.prune(p.what.e); brain.stats.pruned++; brain.log({ type: 'edge.prune', e: p.what.e, by: 'human' }); applied = true; }
      else if (p.kind === 'region.add') { brain.addRegion(p.what.name, { budget: p.what.budget ?? Infinity, doc: p.what.doc || '' }); applied = true; }
      else note = 'decided and logged; ' + p.kind + ' has no automatic application, the owning subsystem reads the decision from the ledger';
    } catch (e) { note = 'decision logged but application failed: ' + e.message; }
  }
  return { proposal: jsonSafe(p), applied, note, stats: brain.gate.stats };
}

function whatOf(e) {
  switch (e.type) {
    case 'cell.run': return e.cell + ' in=' + (e.nin ?? 0) + ' out=' + (Array.isArray(e.out) ? e.out.filter(Boolean).join(',') || '-' : '-');
    case 'signal': return (e.cell || 'external') + '.' + e.port + ' ' + e.kind + ' #' + (e.hash ?? '?');
    case 'edge.add': return e.src + ' -> ' + e.dst + ' w=' + e.w + ' by ' + e.by;
    case 'edge.prune': return 'e' + e.e;
    case 'cell.add': return e.cell + ' (' + e.kind + ') ' + e.region + '/' + e.circuit;
    case 'proposal': return '#' + e.id + ' ' + e.kind + ' by ' + e.by + ' ' + (e.why || '');
    case 'decision': return '#' + e.proposal + ' ' + e.kind + ' ' + e.status + ' by ' + e.by;
    case 'cell.error': return e.cell + ': ' + e.error;
    case 'snapshot': case 'restore': return e.dir || '';
    case 'region.add': return e.region;
    case 'circuit.add': return e.circuit;
    default: return '';
  }
}

// Upstream provenance. A cell.run names the seqs of the signals it consumed; a signal names
// the run that emitted it. Walking that backwards names every cell, edge and memory that
// contributed to a result, which is exactly what his manual asks the instrument to do.
function traceTree(brain, index, root, depth) {
  const seen = new Set(), nodes = [], missing = [], edges = [];
  const byId = new Map(brain.cells.map((c) => [c.id, c]));
  const visit = (seq, d, consumer) => {
    if (d > depth || seen.has(seq)) return;
    seen.add(seq);
    const e = index.get(seq);
    if (!e) { missing.push(seq); return; }
    const node = { seq, type: e.type, depth: d, t: e.t, gen: e.gen };
    if (e.type === 'cell.run') {
      const c = byId.get(e.cell);
      node.cell = e.cell;
      node.kind = c ? c.kind : null;
      node.region = c ? c.region : null;
      node.circuit = c ? c.circuit : null;
      node.consumed = e.consumed || [];
      node.surprise = e.surprise || 0;
      node.out = e.out || [];
      node.memory = c ? c.memory.working.length : 0;
    } else if (e.type === 'signal') {
      const c = e.cell && e.cell !== 'external' ? byId.get(e.cell) : null;
      node.cell = e.cell || 'external';
      node.sigKind = e.kind;
      node.port = e.port;
      node.hash = e.hash;
      if (c) { try { node.portName = getKind(c.kind).ports.out[e.port]?.name ?? String(e.port); } catch { node.portName = String(e.port); } }
      else node.portName = String(e.port);
      // Name the edge this signal travelled, if the consumer is known.
      if (c && consumer && consumer.type === 'cell.run') {
        const dst = byId.get(consumer.cell);
        if (dst) {
          const con = brain.connectome;
          for (const x of con.outOf(c.idx)) {
            if (con.dst[x] === dst.idx && con.srcPort[x] === e.port) {
              node.edge = { e: x, w: Number(con.w[x].toFixed(4)), delay: con.delay[x], usage: con.usage[x] };
              break;
            }
          }
        }
      }
    }
    nodes.push(node);
    const parents = e.consumed || (e.from != null ? [e.from] : []);
    for (const p of parents) { edges.push([p, seq]); visit(p, d + 1, e); }
  };
  visit(root, 0, null);
  const cells = [...new Set(nodes.filter((n) => n.type === 'cell.run').map((n) => n.cell))];
  return {
    root, depth, nodes, edges, missing, cells,
    edgeCount: nodes.filter((n) => n.edge).length,
  };
}

// ---------------------------------------------------------------- snapshot diff
// Two snapshots, read as plain JSON, compared on what a researcher actually asks about:
// which cells moved, which edges appeared or vanished, and which weights changed.
export async function diffSnapshots(fileA, fileB, labelA, labelB) {
  const { readJSONStreamed } = await import('../core/persist.mjs');
  const { Connectome } = await import('../core/connectome.mjs');
  const A = readJSONStreamed(fileA);
  const B = readJSONStreamed(fileB);
  const idsA = new Map(A.cells.map((c) => [c.id, c]));
  const idsB = new Map(B.cells.map((c) => [c.id, c]));
  const cellChanges = [];
  const FIELDS = ['runs', 'fired', 'skips', 'errors', 'cost', 'surprise'];
  for (const [id, cb] of idsB) {
    const ca = idsA.get(id);
    if (!ca) continue;
    const ch = { cell: id };
    let moved = false;
    for (const f of FIELDS) {
      const a = ca.stats?.[f] ?? 0, b = cb.stats?.[f] ?? 0;
      if (a !== b) { ch[f] = [round(a, 6), round(b, 6)]; moved = true; }
    }
    if (moved) cellChanges.push(ch);
  }
  const conA = Connectome.from(A.connectome), conB = Connectome.from(B.connectome);
  const keyOf = (snap, con, e) => snap.cells[con.src[e]]?.id + '.' + con.srcPort[e] + ' -> ' + snap.cells[con.dst[e]]?.id + '.' + con.dstPort[e];
  const mapA = new Map(), mapB = new Map();
  for (let e = 0; e < conA.size(); e++) mapA.set(keyOf(A, conA, e), { e, w: conA.w[e], flags: conA.flags[e], usage: conA.usage[e] });
  for (let e = 0; e < conB.size(); e++) mapB.set(keyOf(B, conB, e), { e, w: conB.w[e], flags: conB.flags[e], usage: conB.usage[e] });
  const edgesAdded = [], edgesRemoved = [], weightChanges = [];
  for (const [k, v] of mapB) if (!mapA.has(k)) edgesAdded.push({ key: k, w: round(v.w) });
  for (const [k, v] of mapA) if (!mapB.has(k)) edgesRemoved.push({ key: k, w: round(v.w) });
  for (const [k, v] of mapB) {
    const a = mapA.get(k);
    if (a && Math.abs(a.w - v.w) > 1e-9) weightChanges.push({ key: k, a: round(a.w, 6), b: round(v.w, 6), usage: [a.usage, v.usage] });
  }
  weightChanges.sort((x, y) => Math.abs(y.b - y.a) - Math.abs(x.b - x.a));
  return {
    a: labelA, b: labelB,
    clock: { a: A.clock, b: B.clock },
    cells: { a: A.cells.length, b: B.cells.length },
    edges: { a: conA.size(), b: conB.size(), liveA: conA.live(), liveB: conB.live() },
    cellsAdded: [...idsB.keys()].filter((id) => !idsA.has(id)),
    cellsRemoved: [...idsA.keys()].filter((id) => !idsB.has(id)),
    cellChanges, edgesAdded, edgesRemoved, weightChanges,
    statsA: A.stats, statsB: B.stats,
  };
}
