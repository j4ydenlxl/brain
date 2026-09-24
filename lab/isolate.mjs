// lab/isolate.mjs : AN ISOLATED EXPERIMENTAL REGION. His manual: "Researchers should be
// able to create isolated experimental regions, introduce alternative mechanisms, compare
// their behavior against existing systems" and "The system must support failure as a normal
// part of research". A failed mechanism must therefore be unable to corrupt the rest of the
// organism, and the refusal must be visible, not silent.
//
// The rule this file enforces is one sentence: a cell inside the region may only receive
// from and emit to DECLARED PORTS. Everything else that tries to cross the boundary is
// refused and written to the ledger as a `lab.isolate.refuse` event.
//
// Three doors lead into or out of a region, and the firewall stands at all three. Nothing
// under core/ is edited: every wrap is an own property on the brain instance (or on its
// gate), which shadows the prototype method and is put back by detach().
//
//   1. brain.connect(...)     explicit wiring. An illegal crossing throws RegionCrossing
//                             AND logs, so a mechanism that miswires is loud, not lossy.
//   2. brain.gate.policy      structural growth. core/brain.mjs _structural proposes
//                             'edge.grow' / 'edge.replace' to the gate before it calls
//                             connect, so the firewall rejects the PROPOSAL first and the
//                             tick loop never reaches a throw. This is the region firewall
//                             "enforced through the gate policy" in the literal sense: the
//                             policy the gate consults is the firewall's.
//   3. brain.inject(...)      external input. Injecting into a cell inside the region at a
//                             port that was never declared is refused the same way.
//
// Signals themselves need no fourth door: core/brain.mjs _emit only ever routes along
// edges in the connectome, and no illegal edge can exist, so no illegal signal can travel.
// test/lab.test.mjs proves that by trying all three doors and reading the ledger back.
import { portIndex } from '../core/cell.mjs';

export class RegionCrossing extends Error {
  constructor(message, detail) { super(message); this.name = 'RegionCrossing'; this.detail = detail; }
}

const DIRS = ['in', 'out'];

export class RegionFirewall {
  /**
   * @param {Brain} brain
   * @param {string} region the region to seal
   * @param {object} [ports] { in: [...], out: [...] }; a port is { cell, port } or 'cell#port'.
   *   port may be a name, an index, or '*' for every port of that cell in that direction.
   */
  constructor(brain, region, ports = {}) {
    this.brain = brain;
    this.region = region;
    if (!brain.regions.has(region)) brain.addRegion(region, { doc: 'isolated experimental region' });
    this.declared = { in: new Set(), out: new Set() };
    this.spec = { in: [], out: [] };
    for (const dir of DIRS) for (const spec of [].concat(ports[dir] || [])) this._declare(dir, spec);
    this.stats = { checked: 0, refused: 0, allowed: 0, byDoor: { connect: 0, gate: 0, inject: 0 } };
    this.refusals = [];
    this.maxRefusals = ports.maxRefusals ?? 256;
    this._saved = null;
  }

  // ------------------------------------------------------------ declared ports
  _declare(dir, spec) {
    const { cell, port } = typeof spec === 'string' ? parseSpec(spec) : spec;
    const c = this.brain.cell(cell);
    if (c.region !== this.region) throw new Error('isolate: declared ' + dir + ' port names ' + c.id + ', which is in region ' + c.region + ', not ' + this.region);
    const ports = c.ports[dir];
    const idxs = port == null || port === '*' ? ports.map((_, i) => i) : [typeof port === 'number' ? port : portIndex(c.kind, dir, port)];
    for (const i of idxs) {
      if (!ports[i]) throw new Error('isolate: ' + c.id + ' has no ' + dir + ' port ' + i);
      this.declared[dir].add(key(c.id, i));
      this.spec[dir].push({ cell: c.id, port: i, name: ports[i].name });
    }
  }
  /**
   * Declare one more port AFTER attach. A mechanism that installs a new cell into the sealed
   * region has to be able to open its own door, otherwise the only installable mechanisms are
   * the ones whose cells already existed when the seal went on. Everything not declared is
   * still refused, and the declaration itself is a ledger event so the audit shows which
   * doors were opened, by whom, and when.
   * @param {'in'|'out'} dir @param {object|string} spec { cell, port } or 'cell#port'
   */
  declare(dir, spec) {
    if (!DIRS.includes(dir)) throw new Error('isolate: declare needs a direction of ' + DIRS.join(' or '));
    const before = this.spec[dir].length;
    this._declare(dir, spec);
    const added = this.spec[dir].slice(before);
    this.brain.ledger?.append({ type: 'lab.isolate.declare', t: this.brain.clock.t, gen: this.brain.clock.gen, region: this.region, dir, ports: added.map((p) => p.cell + '#' + p.name) });
    return this;
  }

  /** @param {string} cellId @param {number} portIdx @returns {boolean} */
  allowsIn(cellId, portIdx) { return this.declared.in.has(key(cellId, portIdx)); }
  /** @param {string} cellId @param {number} portIdx @returns {boolean} */
  allowsOut(cellId, portIdx) { return this.declared.out.has(key(cellId, portIdx)); }
  /** @param {object|string} cell @returns {boolean} */
  inside(cell) { const c = typeof cell === 'object' ? cell : this.brain.cell(cell); return c.region === this.region; }

  // ------------------------------------------------------------ the one judgment
  // Returns null when the wiring is legal, or a refusal record when it is not. This is the
  // whole policy: an edge that stays on one side is nobody's business; an edge that crosses
  // needs a declared port on the side that is inside.
  judgeEdge(src, srcPort, dst, dstPort) {
    const si = this.inside(src), di = this.inside(dst);
    if (si === di) return null;                       // wholly inside, or wholly outside
    if (di && !this.allowsIn(dst.id, dstPort)) {
      return { why: 'undeclared in port', src: src.id, srcPort, dst: dst.id, dstPort, port: dst.ports.in[dstPort]?.name ?? dstPort };
    }
    if (si && !this.allowsOut(src.id, srcPort)) {
      return { why: 'undeclared out port', src: src.id, srcPort, dst: dst.id, dstPort, port: src.ports.out[srcPort]?.name ?? srcPort };
    }
    return null;
  }

  refuse(door, detail) {
    this.stats.refused++;
    this.stats.byDoor[door] = (this.stats.byDoor[door] || 0) + 1;
    const ev = { type: 'lab.isolate.refuse', region: this.region, door, ...detail };
    const seq = this.brain.ledger ? this.brain.ledger.append({ t: this.brain.clock.t, gen: this.brain.clock.gen, ...ev }) : -1;
    const rec = { ...ev, seq, t: this.brain.clock.t };
    this.refusals.push(rec);
    while (this.refusals.length > this.maxRefusals) this.refusals.shift();
    return rec;
  }

  // ------------------------------------------------------------ attach / detach
  attach() {
    if (this._saved) return this;
    const b = this.brain, self = this;
    const hadConnect = Object.prototype.hasOwnProperty.call(b, 'connect');
    const hadInject = Object.prototype.hasOwnProperty.call(b, 'inject');
    this._saved = {
      connect: b.connect.bind(b), inject: b.inject.bind(b), policy: b.gate.policy,
      hadConnect, hadInject,
    };

    b.connect = function (srcId, srcPort, dstId, dstPort, opts = {}) {
      const a = b.cell(srcId), c = b.cell(dstId);
      const sp = b._port(a, 'out', srcPort), dp = b._port(c, 'in', dstPort);
      self.stats.checked++;
      const bad = self.judgeEdge(a, sp, c, dp);
      if (bad) {
        const rec = self.refuse('connect', { ...bad, by: opts.by || 'wire' });
        throw new RegionCrossing('region ' + self.region + ' refused ' + a.id + '.' + a.ports.out[sp].name + ' -> ' + c.id + '.' + c.ports.in[dp].name + ': ' + bad.why, rec);
      }
      self.stats.allowed++;
      return self._saved.connect(srcId, srcPort, dstId, dstPort, opts);
    };

    b.inject = function (cellId, port, sig, opts = {}) {
      const c = b.cell(cellId);
      if (self.inside(c)) {
        const dp = b._port(c, 'in', port);
        self.stats.checked++;
        const bad = self.allowsIn(c.id, dp) ? null : { why: 'undeclared in port', src: null, srcPort: null, dst: c.id, dstPort: dp, port: c.ports.in[dp]?.name ?? dp };
        if (bad) {
          const rec = self.refuse('inject', { ...bad, by: 'inject' });
          throw new RegionCrossing('region ' + self.region + ' refused an injection into ' + c.id + '.' + c.ports.in[dp].name + ': ' + bad.why, rec);
        }
        self.stats.allowed++;
      }
      return self._saved.inject(cellId, port, sig, opts);
    };

    // The gate policy IS the firewall for anything structural. A proposal that would cross
    // the boundary illegally is rejected here, before core/brain.mjs can call connect.
    const prev = this._saved.policy;
    b.gate.policy = function (proposal, ctx) {
      if (proposal.kind === 'edge.grow' || proposal.kind === 'edge.replace') {
        const w = proposal.what || {};
        const a = tryCell(b, w.src), c = tryCell(b, w.dst);
        if (a && c) {
          self.stats.checked++;
          const sp = typeof w.srcPort === 'number' ? w.srcPort : 0;
          const dp = typeof w.dstPort === 'number' ? w.dstPort : 0;
          const bad = self.judgeEdge(a, sp, c, dp);
          if (bad) { self.refuse('gate', { ...bad, by: proposal.by || 'gate', proposal: proposal.id, kind: proposal.kind }); return 'reject'; }
          self.stats.allowed++;
        }
      }
      return prev(proposal, ctx);
    };

    b.ledger?.append({ type: 'lab.isolate.attach', t: b.clock.t, gen: b.clock.gen, region: this.region, in: this.spec.in.length, out: this.spec.out.length });
    return this;
  }

  detach() {
    if (!this._saved) return this;
    const b = this.brain;
    if (this._saved.hadConnect) b.connect = this._saved.connect; else delete b.connect;
    if (this._saved.hadInject) b.inject = this._saved.inject; else delete b.inject;
    b.gate.policy = this._saved.policy;
    b.ledger?.append({ type: 'lab.isolate.detach', t: b.clock.t, gen: b.clock.gen, region: this.region, refused: this.stats.refused });
    this._saved = null;
    return this;
  }

  /** Every edge currently crossing the boundary, for an audit after the fact. */
  crossings() {
    const b = this.brain, cx = b.connectome, out = [];
    for (let e = 0; e < cx.size(); e++) {
      const a = b.cells[cx.src[e]], c = b.cells[cx.dst[e]];
      if (!a || !c) continue;
      const si = a.region === this.region, di = c.region === this.region;
      if (si === di) continue;
      out.push({ e, src: a.id, srcPort: cx.srcPort[e], dst: c.id, dstPort: cx.dstPort[e], declared: di ? this.allowsIn(c.id, cx.dstPort[e]) : this.allowsOut(a.id, cx.srcPort[e]) });
    }
    return out;
  }

  report() {
    return {
      region: this.region,
      ports: { in: this.spec.in, out: this.spec.out },
      cells: this.brain.regions.get(this.region) ? this.brain.regions.get(this.region).cells.size : 0,
      stats: { ...this.stats, byDoor: { ...this.stats.byDoor } },
      refusals: this.refusals.slice(-16),
      undeclaredCrossings: this.crossings().filter((c) => !c.declared).length,
    };
  }
}

function key(cellId, portIdx) { return cellId + '#' + portIdx; }
function parseSpec(s) {
  const i = s.indexOf('#');
  return i < 0 ? { cell: s, port: '*' } : { cell: s.slice(0, i), port: s.slice(i + 1) };
}
function tryCell(brain, id) { try { return id == null ? null : brain.cell(id); } catch { return null; } }

/**
 * Seal a region. Returns the attached firewall.
 * @param {Brain} brain
 * @param {string} region
 * @param {object} [ports] { in: [...], out: [...] }
 * @returns {RegionFirewall}
 */
export function isolate(brain, region, ports = {}) {
  return new RegionFirewall(brain, region, ports).attach();
}
