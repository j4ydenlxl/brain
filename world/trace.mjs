// world/trace.mjs: THE CHAIN BACK. His manual: "Researchers should be able to trace an
// important result backward through the computational graph and determine which cells,
// circuits, memories, predictions, and connections contributed to it."
//
// A reach into the world is the most important result this organism produces, because it
// is the only one the world can feel. So it is the one that must be traceable, and the
// links are laid down at the moment of the act, not reconstructed afterwards:
//
//   world.outcome.from -> world.act.seq
//   world.act.from     -> the seq of the SIGNAL that asked for the action
//   signal.from        -> the seq of the cell.run that emitted that signal
//   cell.run.consumed  -> the seqs of the signals that cell consumed
//   ... and so on, back through the connectome, as far as the ledger holds.
//
// core/ledger.mjs already walks exactly those two link fields (`from` and `consumed`), so
// worldTrace is its walk plus the two things the walk cannot know by itself: which gate
// proposal authorized each act, and how to say the whole chain in one page of prose.
import { authorize } from './policy.mjs';

const PAD = 14;

/**
 * Walk the ledger backward from an action and print the chain that caused it.
 * @param {import('../core/brain.mjs').Brain} brain
 * @param {number} actionSeq a world.outcome, world.act, world.sense or world.refused seq
 *                           (any ledger seq works: the walk is generic)
 * @param {object} [opts]
 * @param {number} [opts.depth=16]   how far back to walk
 * @param {boolean} [opts.print=true] print the chain as well as returning it
 * @param {function} [opts.log]      where to print (default console.log)
 * @returns {{root: number, found: boolean, nodes: object[], edges: number[][], cells: string[], ops: string[], proposals: object[], text: string, lines: string[]}}
 */
export function worldTrace(brain, actionSeq, opts = {}) {
  const { depth = 16, print = true, log = console.log } = opts;
  const ledger = brain.ledger;
  const root = Number(actionSeq);
  const walked = ledger.trace(root, depth);
  const bySeq = new Map();
  for (const n of walked.nodes) bySeq.set(n.seq, n);

  // The gate's proposal and decision are not linked by `from` (core/gate.mjs writes them
  // as free standing events), so they are fetched by the id the act recorded, then folded
  // into the chain at the point where they belong: just before their act.
  const proposals = [];
  for (const n of [...bySeq.values()]) {
    if (n.type !== 'world.act' || n.proposalSeq == null) continue;
    const p = safeGet(ledger, n.proposalSeq);
    if (p) { bySeq.set(p.seq, p); proposals.push(p); }
    const d = findDecision(ledger, n.proposalSeq, n.seq, n.proposal);
    if (d) bySeq.set(d.seq, d);
  }

  const nodes = [...bySeq.values()].sort((a, b) => a.seq - b.seq);
  const cells = [], ops = [];
  for (const n of nodes) {
    if (n.cell && n.cell !== 'external' && !cells.includes(n.cell)) cells.push(n.cell);
    if (n.op && !ops.includes(n.op)) ops.push(n.op);
  }
  const lines = [];
  lines.push('world.trace ' + root + (nodes.length ? '' : ' (nothing in the ledger at that seq)'));
  for (const n of nodes) lines.push('  ' + (n.seq === root ? '>' : ' ') + ' #' + String(n.seq).padStart(6) + '  ' + pad(n.type) + describe(n));
  if (nodes.length) {
    lines.push('  chain: ' + nodes.length + ' events, ' + cells.length + ' cells (' + (cells.join(' -> ') || 'none') + ')' + (ops.length ? ', ops ' + ops.join(', ') : ''));
  }
  const text = lines.join('\n');
  if (print) log(text);
  return { root, found: nodes.length > 0, nodes, edges: walked.edges, cells, ops, proposals, text, lines };
}

function pad(s) { return String(s || '?').padEnd(PAD) + ' '; }
function safeGet(ledger, seq) { try { return ledger.get(seq); } catch { return null; } }

// The decision for a proposal is appended within a handful of events of the proposal
// itself, so a bounded forward scan finds it without indexing the whole ledger.
function findDecision(ledger, fromSeq, toSeq, proposalId, span = 64) {
  const end = Math.min(typeof toSeq === 'number' ? toSeq : fromSeq + span, fromSeq + span);
  for (let s = fromSeq + 1; s <= end; s++) {
    const e = safeGet(ledger, s);
    if (e && e.type === 'decision' && e.proposal === proposalId) return e;
  }
  return null;
}

function describe(e) {
  switch (e.type) {
    case 'world.outcome':
      return (e.ok ? 'ok   ' : 'FAILED ') + (e.op || '') + ' ' + (e.url || e.path || e.exec || e.key || '') +
        [e.status != null ? 'status ' + e.status : null, e.bytes != null ? e.bytes + ' bytes' : null, e.ms != null ? e.ms + 'ms' : null, e.reason ? 'reason ' + e.reason : null].filter(Boolean).map((x) => ' [' + x + ']').join('');
    case 'world.act':
      return (e.op || '') + ' ' + (e.status || '') + ' by ' + (e.cell || '?') + ' [proposal ' + e.proposal + (e.allowed ? '' : ', denied: ' + (e.reason || 'policy')) + '] ' + short(e.why, 80);
    case 'world.refused':
      return (e.op || '') + ' ' + (e.status || '') + ' ' + short(e.reason, 100);
    case 'world.sense':
      return (e.op || '') + ' ' + (e.direction || '') + ' ' + (e.url || e.path || '') + (e.n != null ? ' n=' + e.n : '');
    case 'proposal':
      return e.kind + ' #' + e.id + ' by ' + e.by + ' what ' + short(JSON.stringify(e.what), 120);
    case 'decision':
      return e.kind + ' #' + e.proposal + ' ' + e.status + ' by ' + (e.decidedBy || e.by || 'policy');
    case 'cell.run':
      return (e.cell || '?') + ' consumed [' + (e.consumed || []).join(', ') + '] emitted [' + (e.out || []).filter(Boolean).join(', ') + ']';
    case 'signal':
      return (e.cell || '?') + '.' + (e.port ?? '?') + ' kind ' + (e.kind || '?') + ' hash ' + (e.hash || '?') + (e.from != null ? ' from run #' + e.from : ' (injected from outside)');
    default: {
      const keys = Object.keys(e).filter((k) => k !== 'seq' && k !== 'type' && k !== 't' && k !== 'gen');
      return keys.slice(0, 6).map((k) => k + '=' + short(String(e[k]), 40)).join(' ');
    }
  }
}
function short(s, n) {
  const str = String(s ?? '');
  return str.length > n ? str.slice(0, n - 3) + '...' : str;
}

/**
 * Recent world events, newest last. Handy on its own and as the way to find a seq worth
 * tracing without knowing one in advance.
 * @param {import('../core/brain.mjs').Brain} brain
 * @param {object} [opts] { limit = 20, type = null, op = null, cell = null }
 */
export function worldActions(brain, opts = {}) {
  const { limit = 20, type = null, op = null, cell = null } = opts;
  const want = type ? [type] : ['world.act', 'world.outcome', 'world.refused', 'world.sense'];
  const out = [];
  for (let s = brain.ledger.seq - 1; s >= 0 && out.length < limit; s--) {
    const e = safeGet(brain.ledger, s);
    if (!e) break;
    if (!want.includes(e.type)) continue;
    if (op && e.op !== op) continue;
    if (cell && e.cell !== cell) continue;
    out.push(e);
  }
  return out.reverse();
}

/**
 * What the gate would say to an action described right now, without proposing it. This is
 * the READ side of authority: a planner may ask whether a reach is inside the declared
 * world before it commits a cell to trying, and asking is free and changes nothing.
 * @param {import('../core/brain.mjs').Brain} brain
 * @param {object} what { op, ... }
 */
export function wouldAllow(brain, what) {
  const policy = brain.gate && brain.gate._worldPolicy;
  if (!policy) return { ok: false, reason: 'this gate was never armed for world.act' };
  return authorize(policy, what);
}

export { worldTrace as trace };
