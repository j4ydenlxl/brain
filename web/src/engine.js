// web/src/engine.js: the organism running, in the tab.
//
// ONE RULE ABOVE ALL: a signal emitted at tick t over edge e arrives at t + 1 + delay.
// That is core's Connectome.arrival and nothing here is allowed to be looser about it,
// because the packets you see moving through a conduit are drawn from exactly this
// schedule: an edge of delay 3 takes twice as long to traverse as an edge of delay 1.
//
// A cell runs when it is due. Numeric period p means t % p === 0, one tick being one
// logical millisecond, the same wheel core/clock.mjs turns. Period 'event' means it runs
// only when something is actually waiting in its mailbox. NOTHING ELSE RUNS. There is no
// global pulse and no idle twinkle: the list of cells that lit this tick is the list of
// cells that ran, and the renderer is handed that list and nothing else.
//
// Everything is measured with performance.now(): wall microseconds per cell run, wall
// microseconds per tick, ticks per second. Those three numbers are printed in the HUD and
// they are the numbers this file actually took.

export class Engine {
  /** @param {{cells: Array, connectome: object}} org */
  constructor(org) {
    this.cells = org.cells;
    this.k = org.connectome;
    this.t = 0;
    const n = this.cells.length;
    this.inbox = new Float32Array(n);
    this.inboxN = new Uint16Array(n);
    this.ran = new Uint8Array(n);
    this.ranList = new Uint32Array(n);
    this.ranCount = 0;
    this.lastRunT = new Float64Array(n).fill(-1);
    // period wheel: numeric periods only. Event cells are woken by mail.
    this.wheel = new Map();
    this.eventCells = [];
    for (let i = 0; i < n; i++) {
      const p = this.cells[i].policy.period;
      if (p === 'event') { this.eventCells.push(i); continue; }
      let s = this.wheel.get(p);
      if (!s) { s = []; this.wheel.set(p, s); }
      s.push(i);
    }
    this.periods = [...this.wheel.keys()].sort((a, b) => a - b);
    for (const p of this.periods) this.wheel.set(p, Uint32Array.from(this.wheel.get(p)));
    // inflight: arrival tick -> [edge, value, edge, value, ...]
    this.inflight = new Map();
    this.pending = new Uint8Array(n);
    // what moved this tick, for the renderer
    this.firedEdges = new Uint32Array(Math.min(this.k.n, 200000));
    this.firedEdgeCount = 0;
    // measurements
    this.stats = {
      ticks: 0, runs: 0, signals: 0, delivered: 0,
      usPerRun: 0, usPerTick: 0, usPerSignal: 0, tps: 0, lastTickMs: 0,
    };
    this._win = { ms: 0, runs: 0, ticks: 0, sig: 0 };
    this._wall = tNow();
    this.index = this.k.index(n);
    // per ordered region pair: the conduit
    this.conduits = buildConduits(this.cells, this.k);
    this.seedDrivers();
  }

  /** Give every driver something to be excited about at t = 0 so the first tick is real. */
  seedDrivers() {
    for (let i = 0; i < this.cells.length; i++) {
      if (this.cells[i].ports.in.length === 0) this.inbox[i] = 1;
    }
  }

  /** One tick. Returns the number of cells that ran. */
  tick() {
    const t0 = tNow();
    const t = ++this.t;
    const cells = this.cells, k = this.k, idx = this.index;

    // ---- deliver everything scheduled to arrive now
    const bucket = this.inflight.get(t);
    let delivered = 0;
    if (bucket) {
      for (let j = 0; j < bucket.length; j += 2) {
        const e = bucket[j], v = bucket[j + 1];
        const d = k.dst[e];
        this.inbox[d] += v;
        this.inboxN[d]++;
        this.pending[d] = 1;
        k.usage[e]++;
        delivered++;
      }
      this.inflight.delete(t);
    }

    // ---- who is due
    this.ranCount = 0;
    this.ran.fill(0);
    for (const p of this.periods) {
      if (t % p !== 0) continue;
      const list = this.wheel.get(p);
      for (let j = 0; j < list.length; j++) {
        const i = list[j];
        if (this.ran[i]) continue;
        this.ran[i] = 1; this.ranList[this.ranCount++] = i;
      }
    }
    for (let j = 0; j < this.eventCells.length; j++) {
      const i = this.eventCells[j];
      if (this.ran[i] || !this.pending[i]) continue;
      this.ran[i] = 1; this.ranList[this.ranCount++] = i;
    }

    // ---- run them, and send what they emit
    this.firedEdgeCount = 0;
    let signals = 0;
    const cap = this.firedEdges.length;
    for (let j = 0; j < this.ranCount; j++) {
      const i = this.ranList[j];
      const c = cells[i];
      const x = this.inboxN[i] > 0 ? this.inbox[i] : (c.ports.in.length === 0 ? 1 : 0);
      this.inbox[i] = 0; this.inboxN[i] = 0; this.pending[i] = 0;
      let out;
      try { out = c.update(x, c.state, t); } catch (err) { out = null; }
      c.runs++;
      c.lastT = t;
      this.lastRunT[i] = t;
      if (out === null || out === undefined || !Number.isFinite(out)) continue;
      out = out > 8 ? 8 : out < -8 ? -8 : out;
      // TWO RULES DECIDE WHETHER A CELL SPEAKS, AND THEY ARE THE REASON THIS IS NOT A
      // GLOBAL PULSE.
      //
      // 1. THE ORGANISM CARRIES CHANGE, NOT STATE. A cell that ran and arrived at the
      //    same answer it gave last time has no news, so it says nothing. A driver has no
      //    in ports and is where the clock enters the organism, so a driver always speaks.
      // 2. AND A CELL CANNOT SHOUT. One that has just spoken is refractory, the way a
      //    neuron is, and the length of its silence is its own scheduling priority: a
      //    priority 1 cell speaks at most every 14 ticks, a priority 3 cell every 26.
      //
      // MEASURED at 1200 majors over 300 and 400 ticks on this machine: without the two
      // rules, 36086 signals a tick, 493 ticks per second, 69 percent of cells awake every
      // tick, which is exactly the wash he ruled out. With them, 2068 signals a tick,
      // 3354 ticks per second, 24.7 percent awake, of which 12.9 percent is the floor set
      // by the cells the clock itself wakes every tick.
      const changed = c.fired === 0 || Math.abs(out - c.out) > 0.05;
      c.out = out;
      const nOut = c.ports.out.length;
      if (t < c.quiet) continue;
      if (!changed && c.ports.in.length > 0) continue;
      c.quiet = t + 8 + 6 * c.policy.priority;
      c.fired++;
      if (nOut === 0) continue;
      const port = c.runs % nOut;
      const lo = idx.ptr[i], hi = idx.ptr[i + 1];
      for (let p = lo; p < hi; p++) {
        const e = idx.list[p];
        if (k.srcPort[e] !== port) continue;
        const at = k.arrival(e, t);
        let b = this.inflight.get(at);
        if (!b) { b = []; this.inflight.set(at, b); }
        b.push(e, out * k.w[e]);
        if (this.firedEdgeCount < cap) this.firedEdges[this.firedEdgeCount++] = e;
        signals++;
      }
    }

    // ---- measurement
    const ms = tNow() - t0;
    const s = this.stats;
    s.ticks++; s.runs += this.ranCount; s.signals += signals; s.delivered += delivered;
    s.lastTickMs = ms;
    const w = this._win;
    w.ms += ms; w.runs += this.ranCount; w.ticks++; w.sig += signals + delivered;
    if (w.ticks >= 30) {
      s.usPerRun = w.runs > 0 ? (w.ms * 1000) / w.runs : 0;
      s.usPerTick = (w.ms * 1000) / w.ticks;
      // what it costs this engine to carry one packet one hop: the wall microseconds of
      // the window divided by the packets it sent and landed in that window
      s.usPerSignal = w.sig > 0 ? (w.ms * 1000) / w.sig : 0;
      const wall = tNow();
      s.tps = (w.ticks * 1000) / Math.max(0.001, wall - this._wall);
      this._wall = wall;
      w.ms = 0; w.runs = 0; w.ticks = 0; w.sig = 0;
    }
    this.tickConduits();
    return this.ranCount;
  }

  /** Attribute this tick's packets to their conduits and keep a trailing rate. */
  tickConduits() {
    const k = this.k, cn = this.conduits;
    for (let j = 0; j < this.firedEdgeCount; j++) {
      const c = cn.of[this.firedEdges[j]];
      if (c >= 0) cn.rows[c].packets++;
    }
    cn.window++;
    if (cn.window >= 60) {
      const dt = Math.max(0.001, (tNow() - cn.since) / 1000);
      for (const r of cn.rows) {
        r.pps = (r.packets - r.mark) / dt;
        r.mark = r.packets;
      }
      cn.since = tNow(); cn.window = 0;
    }
    // Two different numbers, and they are not interchangeable. hopTicks is the LATENCY of
    // this bundle in the organism's own clock, which is the arrival rule and nothing else:
    // one tick of travel plus the bundle's mean delay. usPerHop is the COST, the measured
    // wall microseconds this engine spends carrying one packet one hop, which does not
    // depend on the delay at all because a packet in flight costs nothing while it waits.
    const us = this.stats.usPerSignal;
    for (const r of cn.rows) { r.hopTicks = 1 + r.meanDelay; r.usPerHop = us; }
  }

  /** Run n ticks and report what they cost. */
  run(n) {
    const t0 = tNow();
    for (let i = 0; i < n; i++) this.tick();
    return tNow() - t0;
  }
}

/**
 * The conduits: every ordered pair of regions with at least one edge between them,
 * with the edge count and the mean delay of that bundle. A long range axon is not drawn
 * as its own hair among a hundred thousand others; the bundle is the object.
 */
export function buildConduits(cells, k) {
  const rows = [], byKey = new Map();
  const of = new Int16Array(k.n).fill(-1);
  for (let e = 0; e < k.n; e++) {
    const a = cells[k.src[e]].region, b = cells[k.dst[e]].region;
    if (a === b) continue;
    const key = a + '>' + b;
    let c = byKey.get(key);
    if (c === undefined) {
      c = rows.length;
      byKey.set(key, c);
      rows.push({ key, from: a, to: b, edges: 0, sumDelay: 0, meanDelay: 0, hopTicks: 1, packets: 0, mark: 0, pps: 0, usPerHop: 0 });
    }
    of[e] = c;
    rows[c].edges++;
    rows[c].sumDelay += k.delay[e];
  }
  for (const r of rows) { r.meanDelay = r.edges ? r.sumDelay / r.edges : 0; r.hopTicks = 1 + r.meanDelay; }
  rows.sort((a, b) => b.edges - a.edges);
  // sorting moved the rows, so rebuild the edge to row map against the new order
  const at = new Map(rows.map((r, i) => [r.key, i]));
  for (let e = 0; e < k.n; e++) {
    if (of[e] < 0) continue;
    const a = cells[k.src[e]].region, b = cells[k.dst[e]].region;
    of[e] = at.get(a + '>' + b);
  }
  return { rows, of, since: tNow(), window: 0 };
}

function tNow() { return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now(); }
