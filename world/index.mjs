// world/index.mjs: THE WORLD REGION. Importing this module registers every world cell
// kind (the senses and the actuators); attachWorld(brain, policy) grows the region that
// holds them and wires it into an existing organism.
//
// His words for this subsystem: "be able to execute literally evrything in the world",
// "Not isolated environments, this brain should have access to being a genius and prodigy
// in literally every single segment of everything capable", "what if you didnt require a
// browser for it to do EVERYTHING in the internet".
//
// The manual's rule that binds it: "The architecture should also maintain a strict
// distinction between computation and authority. The ability of a subsystem to reason
// about a change does not automatically grant it permission to make that change."
//
// So the world is reachable, and it is reachable only through a door: five actuator kinds
// and three sense kinds, every one of which files a 'world.act' proposal to core/gate.mjs
// and acts only on an approval, judged against world/policy.json, which nothing inside the
// organism may write. The anatomy is deliberate. Senses and actuators are cells, in
// circuits, in a region, on the connectome, in the ledger, exactly like every other cell:
// the organism reaches the world through its own body, and every reach leaves a trace that
// world/trace.mjs walks back to the signal that caused it.
import { MS } from '../core/clock.mjs';
import './actuators.mjs';
import './senses.mjs';
import { ACTUATOR_KINDS, closeWorldCell, handleCount, listenAddress, waitForListen } from './actuators.mjs';
import { SENSE_KINDS } from './senses.mjs';
import { armWorld, armedPolicy, authorize, denyAll, isArmed, loadPolicy, normalizePolicy, POLICY_FILE, WORLD_KIND, WORLD_OPS } from './policy.mjs';
import { worldActions, worldTrace, wouldAllow } from './trace.mjs';
import { attachVenue, bookOf, FEE_ROUND_TRIP, FEE_SOURCE, loadTape, midOf, payableBuy, payableSell, resetScript, resetTape, synthTape, tapeSummary, VENUE_KINDS } from './venue.mjs';

export { ACTUATOR_KINDS, SENSE_KINDS, closeWorldCell, handleCount, listenAddress, waitForListen };
export { armWorld, armedPolicy, authorize, denyAll, isArmed, loadPolicy, normalizePolicy, POLICY_FILE, WORLD_KIND, WORLD_OPS };
export { worldActions, worldTrace, wouldAllow };
export { worldTrace as trace };
export { attachVenue, bookOf, FEE_ROUND_TRIP, FEE_SOURCE, loadTape, midOf, payableBuy, payableSell, resetScript, resetTape, synthTape, tapeSummary, VENUE_KINDS };

// sense.venue is already in SENSE_KINDS (world/senses.mjs registers it); the set keeps the
// list honest whichever way the venue kinds are counted.
export const WORLD_KINDS = Object.freeze([...new Set([...ACTUATOR_KINDS, ...SENSE_KINDS, ...VENUE_KINDS])]);
export const REGION = 'world';

// An actuator has to keep running after a request, because the answer arrives later: an
// 'event' period cell would sit on a finished fetch forever with nothing to wake it. The
// border has the same problem for the same reason: it queues what several actuators say on
// one tick and can only pass one along per run. So the world runs on the clock, cheaply (a
// run with an empty queue and no mail returns at once).
export const DEFAULT_PERIODS = Object.freeze({ actuators: 1 * MS, senses: 1 * MS, clock: 64 * MS, border: 1 * MS });

/**
 * Grow the world region on a brain and wire it to perception and motor.
 *
 * @param {import('../core/brain.mjs').Brain} brain
 * @param {object|string|null} policy  a policy object, a path to one, or null for world/policy.json
 * @param {object} [opts]
 * @param {string} [opts.prefix='w']            id prefix for the cells this adds
 * @param {object} [opts.periods]               overrides for DEFAULT_PERIODS
 * @param {boolean} [opts.actuators=true]       add the actuator cells
 * @param {boolean} [opts.senses=true]          add the senses the policy declares
 * @param {boolean} [opts.listen]               add the loopback listener (default: policy.listen.enabled)
 * @param {function} [opts.wake]                called when the listener receives a POST
 * @param {boolean} [opts.wire=true]            wire the border to perception and motor
 * @returns {object} a report: every cell added, every edge wired, and the policy in force
 */
export function attachWorld(brain, policy = null, opts = {}) {
  const pol = loadPolicy(policy);
  const prefix = opts.prefix || 'w';
  const periods = { ...DEFAULT_PERIODS, ...(opts.periods || {}) };
  const wantListen = opts.listen === undefined ? pol.listen.enabled : !!opts.listen;

  armWorld(brain.gate, pol);
  brain.ctx.world = { policy: pol, region: REGION, cells: {} };

  brain.addRegion(REGION, { doc: 'the border with everything outside this process: senses in, actuators out, every reach through the gate' });
  brain.addCircuit(REGION, 'senses', { doc: 'the world reaching in' });
  brain.addCircuit(REGION, 'actuators', { doc: 'the organism reaching out' });
  brain.addRegion('perception', { doc: 'sensory input, encoding' });
  brain.addRegion('motor', { doc: 'action, interaction' });

  const report = { region: REGION, policy: pol, cells: {}, senses: [], actuators: [], wired: [], skipped: [], armed: isArmed(brain.gate) };
  const add = (id, kind, region, circuit, params, period) => {
    const cell = brain.addCell({ id, kind, region, circuit, params, policy: { period } });
    report.cells[id] = { kind, region, circuit, period };
    brain.ctx.world.cells[id] = cell;
    return cell;
  };
  const wire = (a, ap, b, bp, why) => {
    brain.connect(a, ap, b, bp);
    report.wired.push(a + '.' + ap + ' -> ' + b + '.' + bp + (why ? '  (' + why + ')' : ''));
  };

  // The border: two named relay cells, one in each direction. Everything the world says
  // enters perception through one cell, and everything the organism does to the world
  // leaves motor through one cell, so the border is inspectable in one place.
  const percept = prefix + '.percept', motor = prefix + '.motor';
  add(percept, 'world.relay', 'perception', 'world', { keep: 32 }, periods.border);
  add(motor, 'world.relay', 'motor', 'world', { keep: 32 }, periods.border);

  // ------------------------------------------------------------ actuators
  if (opts.actuators !== false) {
    const http = prefix + '.http', fs = prefix + '.fs', proc = prefix + '.proc', clock = prefix + '.clock';
    add(http, 'world.http', REGION, 'actuators', {}, periods.actuators);
    add(fs, 'world.fs', REGION, 'actuators', {}, periods.actuators);
    add(proc, 'world.proc', REGION, 'actuators', {}, periods.actuators);
    add(clock, 'world.clock', REGION, 'actuators', {}, periods.clock);
    report.actuators.push(http, fs, proc, clock);
    if (wantListen) {
      const listen = prefix + '.listen';
      add(listen, 'world.net.listen', REGION, 'senses', { wake: typeof opts.wake === 'function' ? opts.wake : null }, periods.actuators);
      report.actuators.push(listen);
      wire(listen, 'out', percept, 'in', 'the world sends the brain a signal');
      wire(listen, 'error', percept, 'in', 'a refused endpoint is still a perception');
    }
    // Motor drives every actuator. An actuator answers back into perception: what the
    // world replied is something the organism perceived, not something it decided.
    for (const [id, port] of [[http, 'req'], [fs, 'req'], [proc, 'req'], [clock, 'arm']]) {
      wire(motor, 'out', id, port, 'the organism reaches out');
      wire(id, 'error', percept, 'in', 'a refusal is a perception');
    }
    wire(http, 'out', percept, 'in', 'the response comes back as a perception');
    wire(fs, 'out', percept, 'in', 'the file comes back as a perception');
    wire(proc, 'out', percept, 'in', 'the output comes back as a perception');
    wire(clock, 'tick', percept, 'in', 'wall time is a perception');
    wire(clock, 'due', percept, 'in', 'a timer coming up is a perception');
    // world.http out declares event, sym and vec because a response may arrive as any of
    // the three. The border carries events, so a cell configured with as sym or as vec is
    // refused at this edge (counted in brain.stats.refused) and should be wired straight
    // into the region that eats that kind. That is a statement about the border, not a bug.
  }

  // ------------------------------------------------------------ senses
  if (opts.senses !== false) {
    pol.senses.poll.forEach((decl, i) => {
      const id = decl.id || (prefix + '.poll' + i);
      add(id, 'sense.poll', REGION, 'senses', { url: decl.url, periodMs: Number(decl.periodMs) || 1000, as: decl.as || 'event', headers: decl.headers || null }, periods.senses);
      report.senses.push(id);
      wire(id, 'out', percept, 'in', 'a polled endpoint is a sense');
      wire(id, 'error', percept, 'in', 'a failed poll is a sense');
    });
    pol.senses.watch.forEach((decl, i) => {
      const id = decl.id || (prefix + '.watch' + i);
      add(id, 'sense.watch', REGION, 'senses', { path: decl.path, debounceMs: Number(decl.debounceMs) || 20, recursive: !!decl.recursive }, periods.senses);
      report.senses.push(id);
      wire(id, 'out', percept, 'in', 'a changed file is a sense');
      wire(id, 'error', percept, 'in', 'a refused watch is a sense');
    });
    if (pol.senses.stdin) {
      const id = prefix + '.stdin';
      add(id, 'sense.stdin', REGION, 'senses', { stream: opts.stdin || null }, periods.senses);
      report.senses.push(id);
      wire(id, 'out', percept, 'in', 'a typed line is a sense');
      wire(id, 'error', percept, 'in', 'a refused stdin is a sense');
    }
  }

  // ------------------------------------------------------------ into the organism
  if (opts.wire !== false) {
    const targets = opts.perception ? [].concat(opts.perception) : perceptionTargets(brain, percept);
    for (const id of targets) {
      const cell = brain.cell(id);
      const port = cell.ports.in.find((p) => p.kinds.includes('event'));
      if (!port) { report.skipped.push(id + ' has no in port that accepts an event'); continue; }
      wire(percept, 'out', id, port.name, 'the world reaches the organism');
    }
    const sources = opts.motor ? [].concat(opts.motor) : motorSources(brain, motor);
    for (const id of sources) {
      const cell = brain.cell(id);
      const port = cell.ports.out.find((p) => p.kinds.includes('event'));
      if (!port) { report.skipped.push(id + ' has no out port that emits an event'); continue; }
      wire(id, port.name, motor, 'in', 'the organism decides to act');
    }
  }
  // ------------------------------------------------------------ the venue
  // A tape is a LIVE object (it carries the replay cursor the sense moves and the book
  // reads), so it arrives through opts and never through policy.json, exactly as a stream
  // does for sense.stdin. The policy still decides everything that matters: a refused
  // sense.venue replays nothing and a refused venue.order is never filled. This runs after
  // the generic wiring above on purpose, so the decision cell it adds to motor is wired by
  // attachVenue once and not a second time by motorSources.
  if (opts.tape) {
    const v = attachVenue(brain, { tape: opts.tape, prefix, ...(opts.venue || {}) });
    report.venue = v;
    report.senses.push(v.sense);
    report.actuators.push(v.book);
    for (const id of [v.sense, v.book, v.decide]) {
      if (!id) continue;
      const cell = brain.cell(id);
      report.cells[id] = { kind: cell.kind, region: cell.region, circuit: cell.circuit, period: cell.policy.period };
      brain.ctx.world.cells[id] = cell;
    }
    for (const e of v.wired) report.wired.push(e + '  (the venue)');
  }
  brain.log({ type: 'world.attach', region: REGION, cells: Object.keys(report.cells).length, edges: report.wired.length, hosts: pol.http.hosts.length, roots: pol.fs.roots.length, exec: pol.proc.exec.length, listen: wantListen, venue: opts.tape ? pol.venue.enabled : null });
  return report;
}

// Every cell in the perception region that can eat an event, except the border itself.
function perceptionTargets(brain, exclude) {
  const r = brain.regions.get('perception');
  if (!r) return [];
  const out = [];
  for (const idx of r.cells) {
    const c = brain.cells[idx];
    if (c.id === exclude) continue;
    if (c.ports.in.some((p) => p.kinds.includes('event'))) out.push(c.id);
  }
  return out;
}
// Every cell in the motor region that can emit an event, except the border itself.
function motorSources(brain, exclude) {
  const r = brain.regions.get('motor');
  if (!r) return [];
  const out = [];
  for (const idx of r.cells) {
    const c = brain.cells[idx];
    if (c.id === exclude) continue;
    if (c.ports.out.some((p) => p.kinds.includes('event'))) out.push(c.id);
  }
  return out;
}

/**
 * Close every OS resource the world region is holding (servers, watchers, timers, stdin).
 * A process that attached a world and never called this keeps itself alive.
 * @returns {number} how many handles were closed
 */
export function closeWorld(brain) {
  let n = 0;
  for (const cell of brain.cells) if (WORLD_KINDS.includes(cell.kind)) n += closeWorldCell(cell);
  return n;
}

/** Where the world region stands right now: cells, counters, and what it is allowed to reach. */
export function worldStatus(brain) {
  const policy = armedPolicy(brain.gate);
  const cells = [];
  for (const cell of brain.cells) {
    if (!WORLD_KINDS.includes(cell.kind)) continue;
    cells.push({
      id: cell.id, kind: cell.kind, region: cell.region, circuit: cell.circuit,
      period: cell.policy.period, runs: cell.stats.runs, handles: handleCount(cell),
      state: summarizeState(cell.state), address: cell.state && cell.state.address ? cell.state.address : null,
    });
  }
  return {
    armed: isArmed(brain.gate),
    reach: policy ? { hosts: policy.http.hosts, roots: policy.fs.roots, exec: policy.proc.exec, listen: policy.listen.enabled, stdin: policy.senses.stdin } : null,
    cells,
    recent: worldActions(brain, { limit: 10 }).map((e) => ({ seq: e.seq, type: e.type, op: e.op || null, cell: e.cell || null, ok: e.ok ?? null, status: e.status ?? null })),
  };
}
function summarizeState(s) {
  if (!s || typeof s !== 'object') return {};
  const out = {};
  for (const k of Object.keys(s)) {
    const v = s[k];
    if (typeof v === 'number' || typeof v === 'boolean' || v === null) out[k] = v;
    else if (k === 'queue' && Array.isArray(v)) out.queued = v.length;
    else if (typeof v === 'string') out[k] = v.length > 80 ? v.slice(0, 77) + '...' : v;
  }
  return out;
}
