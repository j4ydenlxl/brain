// tasks/host.mjs: RUNNING A SUITE INSIDE A BRAIN SOMEBODY ELSE BUILT.
//
// A suite solver knows the cell ids of the little brain it builds for itself: solveAlgebra
// injects into 'alg.eval', 'alg.solve', 'alg.cmp' and so on. Handing it another brain
// therefore did nothing, because the cells of that brain are called something else. What
// was missing was a way to NAME the cells of an arbitrary brain to inject into
// (notes/generations.md request 7). That is the two things in this file.
//
//   nameCells(brain, roles)   given a list of roles, each a cell kind and an optional
//                             predicate on the cell, pick one cell of the brain per role
//                             and return the map of role to cell id, plus the roles no
//                             cell of that brain can fill. Deterministic: lowest cell
//                             index wins, and a cell on period 'event' is preferred over
//                             one on a numeric period, because a cell that runs once an
//                             hour of organism time will not answer a question this tick.
//
//   attachTap(brain, cellId)  a READ HEAD. Inside a brain that wires every out port, a
//                             cell's answer never reaches the outbox: Brain._emit only
//                             puts a signal there when it routed to nobody. A tap is one
//                             cell wired from the target's out port and left with no out
//                             edge of its own, so what the target emitted is re-emitted
//                             by the tap into the outbox, where a solver can read it. The
//                             tap adds one cell and one edge and changes nothing else: it
//                             never injects, and it emits only what it was handed.
//
// The cost of reading this way is one extra tick: a signal takes at least one tick to
// travel an edge, so the target runs on tick 1 and the tap on tick 2. That is why a hosted
// solve ticks twice per problem where the solver's own brain ticks once.
import { defineKind } from '../core/cell.mjs';
import * as S from '../core/signal.mjs';

const ANY = S.KINDS.slice();
const last = (mail) => (mail.length ? mail[mail.length - 1].sig : null);

defineKind('task.tap', {
  doc: 'A read head. Re-emits, unchanged, the last signal that reached it. Wired from a cell inside a brain and left with no out edge of its own, so the signal lands in the outbox: this is how a task suite reads an answer out of a brain whose every port is already wired.',
  ports: { in: [{ name: 'in', kinds: ANY }], out: [{ name: 'out', kinds: ANY }] },
  compute: (ins) => {
    const sig = last(ins[0]);
    return [sig ? { kind: sig.kind, data: sig.data } : null];
  },
  cost: 0,
});

/**
 * Name the cells of a brain to inject into.
 *
 * @param {object} brain
 * @param {Array<{role: string, kind: string, where?: (cell: object) => boolean, why?: string}>} roles
 * @returns {{ cells: Record<string,string>, missing: string[], chosen: Array<{role,id,kind,period}> }}
 *   `cells` maps a role to the id of the cell chosen for it. `missing` names the roles no
 *   cell of this brain can fill, so a caller can say which part of a suite this brain
 *   cannot answer at all rather than reporting a wrong answer for it.
 */
export function nameCells(brain, roles) {
  const cells = {}, missing = [], chosen = [];
  for (const r of roles) {
    let pick = null;
    for (const c of brain.cells) {
      if (c.kind !== r.kind) continue;
      if (r.where && !r.where(c)) continue;
      if (pick === null) { pick = c; if (c.policy.period === 'event') break; continue; }
      // A cell that runs on mail answers this tick; one on a numeric period answers when
      // its period comes round, which may be an hour of organism time away.
      if (pick.policy.period !== 'event' && c.policy.period === 'event') { pick = c; break; }
    }
    if (!pick) { missing.push(r.role); continue; }
    cells[r.role] = pick.id;
    chosen.push({ role: r.role, id: pick.id, kind: pick.kind, period: pick.policy.period });
  }
  return { cells, missing, chosen };
}

/**
 * Wire a read head onto one out port of one cell.
 *
 * @param {object} brain
 * @param {string} cellId the cell whose answers are to be read
 * @param {object} [opts] { port, id, region, circuit }
 * @returns {{ id: string, idx: number, added: boolean }} idx is the tap's cell index, which
 *   is what an outbox signal's `src` carries.
 */
export function attachTap(brain, cellId, { port = 0, id = null, region = 'generations', circuit = 'task.tap' } = {}) {
  const src = brain.cell(cellId);
  const tapId = id || 'tap.' + src.id + '.' + port;
  const existing = brain.byId.get(tapId);
  if (existing) return { id: tapId, idx: existing.idx, added: false };
  const tap = brain.addCell({ id: tapId, kind: 'task.tap', region, circuit, policy: { period: 'event' } });
  brain.connect(src.id, port, tapId, 'in', { w: 1, delay: 0, conf: 1 });
  return { id: tapId, idx: tap.idx, added: true };
}

/**
 * A reader per target cell: the tap when the target has one, the target itself otherwise.
 * Returns the cell index an outbox signal must carry for it to be this target's answer.
 * @param {object} brain @param {string[]} cellIds @param {boolean} tap
 * @returns {{ readIdx: Map<string, number>, taps: string[] }}
 */
export function readHeads(brain, cellIds, { tap = true } = {}) {
  const readIdx = new Map(), taps = [];
  for (const id of new Set(cellIds)) {
    if (!tap) { readIdx.set(id, brain.cell(id).idx); continue; }
    const t = attachTap(brain, id);
    readIdx.set(id, t.idx);
    if (t.added) taps.push(t.id);
  }
  return { readIdx, taps };
}
