// seeds/whole.mjs: THE WHOLE BRAIN. One organism, one connectome, every region and kind
// that exists tonight, assembled so that information enters at perception, is encoded,
// processed, integrated, decided and acted on, and the consequences come back in.
//
//   buildWhole({ majors, seed, substrateUnits, world })  -> { brain, report }
//   restoreWhole(dir, { ledger })                         -> { brain, report }
//   timescaleReport(brain)                                -> rows per clock period
//   applyRegionGenes(brain, region, genome)               -> an approved elite replaces a region
//
// Nothing here edits another agent's module. Every extra cell is added on top of
// seeds/organism.mjs, every extra edge is added through the strict Wiring of
// genome/wire.mjs, and the count of illegal edges is measured, not assumed.
import { Brain } from '../core/brain.mjs';
import { dataToJSON, dataFromJSON, ItemMemory } from '../core/signal.mjs';
import { getKind } from '../core/cell.mjs';
import * as SIMD from '../core/simd.mjs';
import { SEC, MIN, HOUR } from '../core/clock.mjs';
import { RNG } from '../core/rng.mjs';
import { Wiring, monomorphicGrowth } from '../genome/wire.mjs';
import { ACTIVE } from '../core/connectome.mjs';
import '../cells/index.mjs';
import '../core/substrate.mjs';
import '../cells/memory.mjs';
import '../cells/simulate.mjs';
import '../cells/grid.mjs';
import '../cells/learning.mjs';
import '../tasks/sequence.mjs';
import { buildOrganism, REGIONS, auditWiring } from './organism.mjs';
import { attachCapability, SkillRegistry, induceAll } from '../capability/index.mjs';
import { addSkillCell } from '../capability/skills.mjs';
import { registerMind, getMind, installLanguage, sealRegion, MindModel } from '../mind/index.mjs';
import { split as splitCorpus } from '../mind/corpus.mjs';
import { attachWorld, armWorld, loadPolicy, normalizePolicy, WORLD_KINDS } from '../world/index.mjs';
import { attach as attachLearning } from '../learning/index.mjs';
import { MemorySystem, attachMemory, EpisodicStore } from '../memory/index.mjs';
import { attachWorkspace, attachAttention, defineWorld } from '../simulate/index.mjs';
import { installAskRegion, ASK_REGION, ASK_CELLS } from '../act/region.mjs';

export const WHOLE_VERSION = 1;
export const ORGANISM_REGIONS = Object.freeze(REGIONS.map((r) => r.name));
export const DECLARED_REGIONS = Object.freeze([...ORGANISM_REGIONS, 'language', 'world', ASK_REGION]);
// The task hosts the generations note (request 6) named as unhostable: seq.fit and the grid
// transforms join the rosters of the regions that can carry them (events in, events out).
export const EXTRA_ROSTER = Object.freeze({
  cognitive: ['seq.fit'],
  association: ['seq.fit'],
  perception: ['grid.rotate', 'grid.flip', 'grid.transpose', 'grid.crop', 'grid.translate', 'grid.tile'],
});
export const MIND_OPTS = Object.freeze({ vocabSize: 256, order: 3, bits: 10, context: 4 });
// The manual's information flow, one relay per stage, with the delay of the edge INTO it.
export const ARC = Object.freeze([
  { id: 'arc.input', region: 'perception', stage: 'sensory input', delay: 0 },
  { id: 'arc.encoding', region: 'association', stage: 'encoding', delay: 1 },
  { id: 'arc.processing', region: 'cognitive', stage: 'processing', delay: 2 },
  { id: 'arc.integration', region: 'cognitive', stage: 'integration', delay: 1 },
  { id: 'arc.decision', region: 'cognitive', stage: 'decision', delay: 1 },
  { id: 'arc.action', region: 'motor', stage: 'action', delay: 2 },
]);
export const SIM_WORLD = 'whole.line';
export const ATTENTION_EVERY = 16;
export const MAIL_CAP = 32;
export const CHECKPOINT_CONTAINER = 2; // the checkpoint file a whole organism writes (see attachServices)

const now = () => Number(process.hrtime.bigint()) / 1e6;
const PERIOD_LABEL = new Map([[1, '1'], [SEC, 'SEC'], [MIN, 'MIN'], [HOUR, 'HOUR']]);
export function periodLabel(p) { return PERIOD_LABEL.get(p) || String(p); }

// The one dimensional simulation world: a forward model (vec.mlp) reads [state, action] and
// predicts the next state; the planner scores a rollout by its distance to the goal.
defineWorld(SIM_WORLD, {
  cells: ['sim.model'],
  actions: [-1, 0, 1],
  init: () => 0,
  encode: (a, ctx) => ({ cell: 'sim.model', port: 'x', kind: 'vec', data: Float32Array.from([Number(ctx.state) || 0, a]) }),
  observe: (clone) => { const c = clone.cells.find((x) => x.id === 'sim.model'); const y = c && c.state && c.state.lastY; return y && y.length ? y[0] : 0; },
  score: (trace, ctx) => { const last = trace.length ? trace[trace.length - 1] : null; const s = last && typeof last.state === 'number' ? last.state : 0; return -Math.abs(s - (Number(ctx.goal) || 0)); },
});

// ---------------------------------------------------------------- port scanning helpers
// Only single-kind ports take part in cross-region wiring, so no port ever meets two kinds
// and the strict subset rule of genome/wire.mjs holds by construction.
function singlePorts(brain, region, dir, kind, exclude) {
  const r = brain.regions.get(region); if (!r) return [];
  const out = [];
  for (const idx of r.cells) {
    const c = brain.cells[idx]; if (exclude && exclude.has(c.id)) continue;
    const ports = c.ports[dir];
    for (let p = 0; p < ports.length; p++) { const k = ports[p].kinds; if (k.length === 1 && k[0] === kind) { out.push([idx, p]); break; } }
  }
  return out;
}
const outPorts = (b, region, kind, ex) => singlePorts(b, region, 'out', kind, ex);
const inPorts = (b, region, kind, ex) => singlePorts(b, region, 'in', kind, ex);
function anyRegionOut(brain, kind, exclude) { const all = []; for (const r of ORGANISM_REGIONS) all.push(...outPorts(brain, r, kind, exclude)); return all; }
function pick(rng, list) { return list.length ? list[rng.int(list.length)] : null; }
function picks(rng, list, n) { const c = list.slice(); const out = []; while (c.length && out.length < n) out.push(c.splice(rng.int(c.length), 1)[0]); return out; }
function portIndex(cell, dir, name) { const i = cell.ports[dir].findIndex((p) => p.name === name); if (i < 0) throw new Error('whole: ' + cell.id + ' has no ' + dir + ' port ' + name); return i; }

// The cells whose FIRST event-carrying port is a single-kind event port: the only ones the
// world border may touch under the strict rule (attachWorld picks the first such port).
function firstEventPortIsSingle(cell, dir) {
  const p = cell.ports[dir].find((x) => x.kinds.includes('event'));
  return !!p && p.kinds.length === 1;
}

export function clockIds(brain) {
  const ids = {};
  const ho = brain.regions.get('homeostasis'); if (!ho) return ids;
  for (const idx of ho.cells) {
    const c = brain.cells[idx];
    if (c.kind !== 'source.counter') continue;
    const circ = brain.circuits.get(c.region + '/' + c.circuit);
    if (!circ || !String(circ.doc || '').startsWith('the homeostasis clock')) continue;
    ids[periodLabel(c.policy.period)] = c.id;
  }
  return ids;
}

// The episodic record's bound for this organism: opts.episodic.maxEpisodes, else BRAIN_EPISODES_MAX,
// else null (memory/episodic.mjs EPISODIC_DEFAULTS, 65536 keys of 8192 lanes = 512 MB). A container
// names a smaller one (compose.yaml, bin/serve.mjs), since the default bound is the whole 512 MB cap.
export function episodicBound(opts = {}, env = process.env) {
  const o = opts && opts.episodic ? opts.episodic.maxEpisodes : undefined;
  const e = env ? env.BRAIN_EPISODES_MAX : undefined;
  const raw = o !== undefined && o !== null ? o : (e === undefined || e === '' ? null : e);
  if (raw === null) return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) throw new Error('episodic bound (opts.episodic.maxEpisodes or BRAIN_EPISODES_MAX) must be a positive integer, got ' + JSON.stringify(raw));
  return n;
}

// ---------------------------------------------------------------- build
export function buildWhole(opts = {}) {
  const {
    majors = 64, seed = 'whole', substrateUnits = 4096, world = null, name = 'whole', dir = null,
    ledger = 'full', subcellsPerMajor = 8, edgesPerCell = 12, localWindow = 8, growth = {}, gate = {},
    mindBytes = 40_000, mindText = null, skills = true, backend = 'auto', log = null,
  } = opts;
  const say = (line) => { if (typeof log === 'function') log(line); };
  // The hypervector heap cannot grow once installed (core/simd.mjs: mem.grow detaches every
  // view), so its size is chosen HERE, before anything in this function allocates a vector,
  // from the organism about to be built instead of a flat 512 MB. BRAIN_HV_HEAP_MB still wins.
  const hvPlan = SIMD.plan({ majors, units: substrateUnits, by: 'buildWhole' });
  const t0 = now();
  const timing = {};

  // 1. the organism, with the extra task hosts on the rosters (patched in place, restored in finally)
  const saved = REGIONS.map((r) => ({ r, roster: r.roster }));
  let brain;
  try {
    for (const r of REGIONS) if (EXTRA_ROSTER[r.name]) r.roster = [...r.roster, ...EXTRA_ROSTER[r.name]];
    brain = buildOrganism({ majors, subcellsPerMajor, edgesPerCell, localWindow, seed, name, ledger, dir, growth, gate });
  } finally { for (const s of saved) s.r.roster = s.roster; }
  timing.organismMs = now() - t0;
  const organismCells = brain.cells.length, organismEdges = brain.connectome.size();

  const rng = new RNG(seed + ':whole');
  const wiring = new Wiring(brain, { strict: true });
  const mine = new Set();
  const ids = { clock: clockIds(brain), substrates: {}, arc: {}, phasor: {}, memory: {}, capability: { solve: 'cap.solve', skills: [] }, lang: null, world: {}, learning: {}, workspace: { hub: 'ws.hub', goal: 'att.goal', submit: {} }, simulate: {} };
  const circuits = new Set();
  const circuit = (region, cname, doc, period = 1) => { const key = region + '/' + cname; if (!circuits.has(key)) { brain.addCircuit(region, cname, { period, doc }); circuits.add(key); } return cname; };
  const add = (id, kind, region, cname, params = {}, period = 'event', extra = {}) => {
    const cell = brain.addCell({ id, kind, region, circuit: cname, params, policy: { period, priority: 1, budget: 1, backend: 'cpu', learn: null, ...extra } });
    mine.add(id);
    return cell;
  };
  const link = (src, sp, dst, dp, { w = 1, delay = 0 } = {}) => {
    const s = typeof src === 'string' ? brain.cell(src) : brain.cells[src];
    const d = typeof dst === 'string' ? brain.cell(dst) : brain.cells[dst];
    const spi = typeof sp === 'string' ? portIndex(s, 'out', sp) : sp;
    const dpi = typeof dp === 'string' ? portIndex(d, 'in', dp) : dp;
    return wiring.add(s.idx, d.idx, spi, dpi, { w, delay, conf: 1 });
  };
  const fanOut = (id, port, region, kind, n, delay, w = 1) => { let k = 0; for (const [idx, p] of picks(rng, inPorts(brain, region, kind, mine), n)) if (link(id, port, idx, p, { delay, w }) >= 0) k++; return k; };
  const fanIn = (region, kind, id, port, n, delay, w = 1) => { let k = 0; for (const [idx, p] of picks(rng, outPorts(brain, region, kind, mine), n)) if (link(idx, p, id, port, { delay, w }) >= 0) k++; return k; };

  // 2. a substrate major per organism region: the dense units sit under the major cells
  let t1 = now();
  for (const r of REGIONS) {
    const cname = circuit(r.name, r.prefix + '.substrate', 'the dense substrate under the majors of ' + r.name, 1);
    const id = r.prefix + '.sub.0';
    add(id, 'substrate', r.name, cname, { units: substrateUnits, seed: seed + ':' + r.name, backend, inLen: 64, outLen: 64 }, 1, { priority: 2 });
    ids.substrates[r.name] = id;
    const local = pick(rng, outPorts(brain, r.name, 'vec', mine));
    const src = local || pick(rng, anyRegionOut(brain, 'vec', mine));
    if (src) link(src[0], src[1], id, 'in', { w: 1, delay: local ? 0 : 2 });
    fanOut(id, 'out', r.name, 'vec', 2, 1, 0.5);
    fanOut(id, 'event', r.name, 'event', 2, 1, 1);
  }
  timing.substrateMs = now() - t1;

  // 3. the reflex arc: sensory input, encoding, processing, integration, decision, action
  t1 = now();
  for (const stage of ARC) { circuit(stage.region, 'arc', 'the information flow stage: ' + stage.stage, 1); add(stage.id, 'world.relay', stage.region, 'arc', {}, 1, { priority: 2 }); ids.arc[stage.stage] = stage.id; }
  for (let i = 1; i < ARC.length; i++) link(ARC[i - 1].id, 'out', ARC[i].id, 'in', { w: 1, delay: ARC[i].delay });
  for (const stage of ARC.slice(0, 5)) fanOut(stage.id, 'out', stage.region, 'event', 3, 1);
  for (const stage of ARC.slice(1, 5)) fanIn(stage.region, 'event', stage.id, 'in', 2, 1);

  // 4. phasor cells (phv.*) in association and memory
  circuit('association', 'as.phasor', 'phasor binding in association', 1);
  add('as.phv.enc.a', 'phv.encode', 'association', 'as.phasor'); add('as.phv.enc.b', 'phv.encode', 'association', 'as.phasor');
  add('as.phv.bind', 'phv.bind', 'association', 'as.phasor'); add('as.phv.unbind', 'phv.unbind', 'association', 'as.phasor');
  add('as.phv.sim', 'phv.sim', 'association', 'as.phasor'); add('as.phv.bundle', 'phv.bundle', 'association', 'as.phasor');
  fanIn('association', 'num', 'as.phv.enc.a', 'in', 1, 1); fanIn('association', 'num', 'as.phv.enc.b', 'in', 1, 1);
  link('as.phv.enc.a', 'phv', 'as.phv.bind', 'in'); link('as.phv.enc.b', 'phv', 'as.phv.bind', 'in');
  link('as.phv.bind', 'out', 'as.phv.unbind', 'a', { delay: 1 }); link('as.phv.enc.b', 'phv', 'as.phv.unbind', 'b', { delay: 1 });
  link('as.phv.unbind', 'out', 'as.phv.sim', 'a'); link('as.phv.enc.a', 'phv', 'as.phv.sim', 'b', { delay: 2 });
  link('as.phv.bind', 'out', 'as.phv.bundle', 'in', { delay: 1 });
  fanOut('as.phv.sim', 'sim', 'association', 'num', 2, 1);
  ids.phasor.association = ['as.phv.enc.a', 'as.phv.enc.b', 'as.phv.bind', 'as.phv.unbind', 'as.phv.sim', 'as.phv.bundle'];
  circuit('memory', 'me.phasor', 'phasor superposition memory', 1);
  add('me.phv.enc', 'phv.encode', 'memory', 'me.phasor'); add('me.phv.bundle', 'phv.bundle', 'memory', 'me.phasor');
  add('me.phv.sim', 'phv.sim', 'memory', 'me.phasor'); add('me.phv.mem', 'phv.memory', 'memory', 'me.phasor');
  fanIn('memory', 'num', 'me.phv.enc', 'in', 1, 1);
  link('me.phv.enc', 'phv', 'me.phv.bundle', 'in'); link('as.phv.bundle', 'out', 'me.phv.bundle', 'in', { delay: 4 });
  link('me.phv.bundle', 'out', 'me.phv.sim', 'a'); link('as.phv.bind', 'out', 'me.phv.sim', 'b', { delay: 5 });
  link('me.phv.mem', 'phv', 'me.phv.bundle', 'in', { delay: 1 });
  fanIn('memory', 'event', 'me.phv.mem', 'write', 1, 1); fanIn('memory', 'event', 'me.phv.mem', 'read', 1, 1);
  fanOut('me.phv.mem', 'value', 'memory', 'event', 1, 1); fanOut('me.phv.sim', 'sim', 'memory', 'num', 1, 1);
  fanOut('as.phv.bundle', 'confidence', 'homeostasis', 'num', 1, 3); fanOut('me.phv.bundle', 'confidence', 'homeostasis', 'num', 1, 3);
  ids.phasor.memory = ['me.phv.enc', 'me.phv.bundle', 'me.phv.sim', 'me.phv.mem'];

  // 5. the memory system and its cells in region memory
  const epBound = episodicBound(opts);
  const memSys = attachMemory(brain, epBound ? { name, episodic: { maxEpisodes: epBound } } : { name });
  circuit('memory', 'me.system', 'the memory system: working, episodic, semantic, sequence, self, consolidate, forget', 1);
  const memParams = { system: name };
  add('mem.working', 'memory.working', 'memory', 'me.system', memParams);
  add('mem.episodic', 'memory.episodic', 'memory', 'me.system', memParams);
  add('mem.semantic', 'memory.semantic', 'memory', 'me.system', memParams);
  add('mem.sequence', 'memory.sequence', 'memory', 'me.system', memParams);
  add('mem.self', 'memory.self', 'memory', 'me.system', memParams, SEC);
  add('mem.consolidate', 'memory.consolidate', 'memory', 'me.system', memParams, MIN);
  add('mem.forget', 'memory.forget', 'memory', 'me.system', memParams, MIN);
  fanIn('memory', 'hv', 'mem.episodic', 'key', 1, 1); fanIn('memory', 'event', 'mem.episodic', 'value', 1, 1); fanIn('memory', 'hv', 'mem.episodic', 'query', 1, 1);
  fanIn('memory', 'hv', 'mem.semantic', 'pattern', 1, 1); fanIn('memory', 'event', 'mem.semantic', 'label', 1, 1); fanIn('memory', 'hv', 'mem.semantic', 'query', 1, 1);
  fanIn('memory', 'hv', 'mem.sequence', 'item', 1, 1); fanIn('memory', 'event', 'mem.sequence', 'mark', 1, 1); fanIn('memory', 'hv', 'mem.sequence', 'cue', 1, 1);
  fanIn('memory', 'event', 'mem.working', 'query', 1, 1); fanIn('memory', 'event', 'mem.self', 'probe', 1, 1);
  fanIn('memory', 'event', 'mem.consolidate', 'trigger', 1, 1); fanIn('memory', 'event', 'mem.forget', 'trigger', 1, 1);
  fanOut('mem.episodic', 'recall', 'memory', 'event', 1, 1); fanOut('mem.semantic', 'concept', 'cognitive', 'event', 1, 3); fanOut('mem.semantic', 'clean', 'memory', 'hv', 1, 1);
  fanOut('mem.sequence', 'next', 'association', 'hv', 1, 3); fanOut('mem.sequence', 'recall', 'memory', 'event', 1, 1);
  fanOut('mem.consolidate', 'concept', 'cognitive', 'event', 1, 5); fanOut('mem.forget', 'forgotten', 'homeostasis', 'event', 1, 3);
  fanOut('mem.self', 'stats', 'homeostasis', 'event', 1, 3); fanOut('mem.working', 'top', 'cognitive', 'event', 1, 2);
  ids.memory = { system: name, cells: ['mem.working', 'mem.episodic', 'mem.semantic', 'mem.sequence', 'mem.self', 'mem.consolidate', 'mem.forget'] };

  // 6. the capability layer in cognitive: the solve cell and one cell per induced skill
  t1 = now();
  const registry = new SkillRegistry({ name: name + ':skills' });
  if (skills) induceAll({ registry });
  attachCapability(brain, { registry });
  timing.skillsMs = now() - t1;
  circuit('cognitive', 'co.capability', 'the capability layer: route a request, verify an answer', 1);
  add('cap.solve', 'solve', 'cognitive', 'co.capability', {});
  link('arc.processing', 'out', 'cap.solve', 'request', { delay: 1 });
  link('cap.solve', 'answer', 'arc.decision', 'in', { delay: 1 });
  fanOut('cap.solve', 'route', 'cognitive', 'event', 1, 1);
  circuit('cognitive', 'co.skills', 'one cell per induced skill', 1);
  for (const sk of registry.list()) {
    const cell = addSkillCell(brain, sk, { region: 'cognitive', circuit: 'co.skills', id: 'skill.' + sk.name, period: 'event' });
    mine.add(cell.id); ids.capability.skills.push(cell.id);
    fanOut(cell.id, 'report', 'cognitive', 'event', 1, 1);
  }

  // 7. the language region between perception and cognitive
  t1 = now();
  const mindName = 'whole:' + name;
  const text = mindText != null ? String(mindText) : splitCorpus().train.slice(0, mindBytes);
  ensureMind(mindName, MIND_OPTS, text);
  timing.mindMs = now() - t1;
  const lang = installLanguage(brain, { model: mindName, prefix: 'lang', learn: false, context: MIND_OPTS.context });
  for (const id of langCells(lang)) mine.add(id);
  brain.cell(lang.tokenize).params.acceptWired = true;
  ids.lang = lang;
  fanOut(lang.decode, 'token', 'cognitive', 'event', 2, 2);
  fanOut(lang.assoc, 'pred', 'memory', 'event', 1, 3);
  fanOut(lang.assoc, 'error', 'cognitive', 'num', 1, 2);
  link(lang.assoc, 'hv', 'mem.episodic', 'key', { delay: 3 }); link(lang.assoc, 'pred', 'mem.episodic', 'value', { delay: 3 });

  // 8. learning cells in homeostasis (the engine itself is attached in attachServices)
  circuit('homeostasis', 'ho.learning', 'reward, error aggregation and modulation', 1);
  add('lrn.reward', 'reward.source', 'homeostasis', 'ho.learning', {}); add('lrn.error', 'error.aggregate', 'homeostasis', 'ho.learning', {}); add('lrn.mod', 'modulator', 'homeostasis', 'ho.learning', {});
  fanIn('homeostasis', 'num', 'lrn.reward', 'trigger', 1, 1);
  link(lang.assoc, 'error', 'lrn.error', 'error', { delay: 2 }); fanIn('cognitive', 'num', 'lrn.error', 'error', 1, 3);
  link('lrn.error', 'total', 'lrn.mod', 'in', { delay: 1 }); fanOut('lrn.mod', 'gain', 'homeostasis', 'num', 2, 1); fanOut('lrn.reward', 'reward', 'homeostasis', 'num', 1, 1);
  ids.learning = { cells: ['lrn.reward', 'lrn.error', 'lrn.mod'] };

  // 9. the workspace hub for attention, one submit cell per organism region
  circuit('cognitive', 'co.workspace', 'the global workspace hub and the attention goal', 1);
  add('ws.hub', 'workspace.hub', 'cognitive', 'co.workspace', {}); add('att.goal', 'attention.goal', 'cognitive', 'co.workspace', { label: 'whole' });
  for (const r of REGIONS) {
    const id = 'ws.submit.' + r.prefix; circuit(r.name, r.prefix + '.workspace', 'submits salient events of ' + r.name + ' to the workspace', 1);
    add(id, 'workspace.submit', r.name, r.prefix + '.workspace', { salience: 1 }); ids.workspace.submit[r.name] = id;
    fanIn(r.name, 'event', id, 'in', 1, 1);
  }
  link('ws.hub', 'out', 'mem.working', 'item', { delay: 1 });
  fanIn('cognitive', 'hv', 'att.goal', 'set', 1, 1);

  // 10. simulation in cognitive: a forward model, a planner on a slow period, an argmax decision
  circuit('cognitive', 'co.simulate', 'the forward model, the planner and the argmax decision', 1);
  add('sim.model', 'vec.mlp', 'cognitive', 'co.simulate', { nin: 2, nhid: 8, nout: 1, seed: seed + ':sim' });
  add('sim.plan', 'simulate.plan', 'cognitive', 'co.simulate', { world: SIM_WORLD, horizon: 3, budgetTicks: 24, width: 4, rounds: 1, keep: 3 }, SEC);
  add('sim.decide', 'decide.argmax', 'cognitive', 'co.simulate', {});
  fanIn('cognitive', 'vec', 'sim.model', 'x', 1, 1); fanOut('sim.model', 'y', 'cognitive', 'vec', 1, 1);
  link('arc.integration', 'out', 'sim.plan', 'goal', { delay: 1 });
  link('sim.plan', 'plan', 'sim.decide', 'in', { delay: 1 }); link('sim.decide', 'choice', 'arc.decision', 'in', { delay: 1 });
  ids.simulate = { model: 'sim.model', plan: 'sim.plan', decide: 'sim.decide', world: SIM_WORLD };

  // 11. the world: senses into perception, actuators from motor, both through the border relays
  t1 = now();
  const pol = loadPolicy(world);
  const perceptionTargets = [];
  for (const idx of brain.regions.get('perception').cells) { const c = brain.cells[idx]; if (c.kind !== 'world.relay' && firstEventPortIsSingle(c, 'in')) perceptionTargets.push(c.id); }
  perceptionTargets.push('arc.input', lang.tokenize);
  const motorSources = [];
  for (const idx of brain.regions.get('motor').cells) { const c = brain.cells[idx]; if (c.kind !== 'world.relay' && firstEventPortIsSingle(c, 'out')) motorSources.push(c.id); }
  motorSources.push('arc.action');
  const worldReport = attachWorld(brain, pol, { actuators: false, listen: false, perception: perceptionTargets, motor: motorSources });
  const wc = brain.ctx.world.cells;
  circuit('world', 'actuators', 'the four actuators: http, fs, proc, clock', 1);
  for (const [id, kind, period] of [['w.http', 'world.http', 1], ['w.fs', 'world.fs', 1], ['w.proc', 'world.proc', 1], ['w.clock', 'world.clock', 64]]) {
    const cell = add(id, kind, 'world', 'actuators', {}, period); wc[id] = cell;
    const req = cell.ports.in.find((p) => p.name === 'req' || p.name === 'arm');
    if (req) link('w.motor', 'out', id, req.name, { delay: 1 });
  }
  // an ANY-port inbox for actuator outputs that carry more than one kind (http out is event|sym|vec)
  circuit('perception', 'pe.world', 'the inbox for polymorphic actuator outputs', 1);
  add('w.inbox', 'memory.working', 'perception', 'pe.world', memParams);
  link('w.inbox', 'top', 'w.percept', 'in', { delay: 1 });
  for (const id of ['w.http', 'w.fs', 'w.proc', 'w.clock']) {
    const cell = brain.cell(id);
    for (let p = 0; p < cell.ports.out.length; p++) {
      const k = cell.ports.out[p].kinds;
      if (k.length === 1 && k[0] === 'event') link(id, p, 'w.percept', 'in', { delay: 1 });
      else link(id, p, 'w.inbox', 'item', { delay: 1 });
    }
  }
  ids.world = { percept: 'w.percept', motor: 'w.motor', inbox: 'w.inbox', actuators: ['w.http', 'w.fs', 'w.proc', 'w.clock'] };
  timing.worldMs = now() - t1;

  // 12. the ask region: one question crossing five cells over seven conduits, the language
  // model being one of those cells. Sealed, event driven, and wired with brain.connect rather
  // than through `wiring` because it is a fixed route and not a sampled one; auditWiring below
  // still checks all seven, and every port on them is a single-kind event port.
  t1 = now();
  ids.ask = installAskRegion(brain, { provider: null, model: null });
  timing.askMs = now() - t1;

  wiring.finish();
  const audit = auditWiring(brain);
  const meta = {
    version: WHOLE_VERSION, name, seed, majors, subcellsPerMajor, edgesPerCell, localWindow, substrateUnits, ids,
    mind: { model: mindName, opts: { ...MIND_OPTS }, text }, policy: pol, memorySystem: memSys,
  };
  attachServices(brain, meta);
  timing.totalMs = now() - t0;
  const report = describe(brain, {
    built: true, timing, organism: { cells: organismCells, edges: organismEdges, wiring: brain.genome && brain.genome.wiring },
    whole: { added: wiring.added, duplicates: wiring.duplicates, illegal: wiring.illegal }, world: { wired: worldReport && worldReport.wired ? worldReport.wired.length : 0 },
    audit, illegal: wiring.illegal + audit.faults.length,
    hvPlan, // what the hypervector heap was sized to for this organism, or why the plan stood aside
  });
  say(printable(report));
  return { brain, report };
}

// ---------------------------------------------------------------- services shared by build and restore
export function langCells(ids) { return [ids.tokenize, ids.context, ids.assoc, ids.decode]; }

function ensureMind(mindName, mopts, text) {
  try { return getMind(mindName); } catch { /* not registered yet */ }
  const m = new MindModel({ ...mopts });
  m.train(text);
  registerMind(mindName, m);
  return m;
}

function attachServices(brain, meta) {
  const learning = attachLearning(brain, { rules: ['hebbian'], warn: false, print: false });
  const workspace = attachWorkspace(brain, { hubs: [meta.ids.workspace.hub], k: 3 });
  // attention scores every pending signal in scope; measured at 6 ms per tick for 168 cells, so it
  // runs on its own period (attentionEvery ticks) instead of every tick. That used to be a wrapper
  // around the hook this seed popped off; simulate/attention.mjs owns it now (request 6 landed).
  const every = meta.attentionEvery || ATTENTION_EVERY;
  const attention = attachAttention(brain, { goalCell: meta.ids.workspace.goal, regions: ['cognitive', 'association'], every });
  sealRegion(brain, langCells(meta.ids.lang));
  // the ask route is sealed on a RESTORE too: the cells come back from the snapshot, so
  // installAskRegion is a no-op there and the seal would otherwise be lost with the policy
  if (brain.regions.has(ASK_REGION)) sealRegion(brain, ASK_CELLS);
  // mailbox hygiene: a cell on a slow period fed by a period 1 source hoards every arrival
  // (measured 11,534 items at t=500 growing to 50,894 at t=4000 on an 8 major whole, with the
  // tick rate falling 129/s to 86/s alongside; at 1000 majors a cap of 256 still held 359,356
  // items, 736 MB, after 100 ticks). This used to be an afterTick hook that trimmed the ports
  // of the slow wheels; the core caps them now (core/brain.mjs policy.mailCap, request 1
  // landed). A cell on a period of SEC or slower keeps its last MAIL_CAP items per port; event
  // cells and period 1 cells drain every tick, and the world clock (period 64) must keep every
  // armed timer until its due tick, so those are left uncapped.
  const cap = meta.mailCap || MAIL_CAP;
  for (const c of brain.cells) c.policy.mailCap = typeof c.policy.period === 'number' && c.policy.period >= SEC ? cap : undefined;
  brain.hooks.snapshot.push((b) => ({ whole: wholeExtras(b) }));
  // The whole organism checkpoints as container 2 (core/persist.mjs writeCheckpoint: every
  // hypervector one bit per lane and held once, edges and cell state as typed arrays, a JSON
  // header with the ruler). restoreWhole reads container 1 and container 2 through the same
  // Brain.restore, and a caller that names a JSON `version` still gets JSON. bench/compress.mjs
  // measures the two on one organism.
  brain.checkpointContainer = CHECKPOINT_CONTAINER;
  brain.whole = { ...meta, services: { learning, workspace, attention } };
  return brain.whole;
}

function wholeExtras(brain) {
  const w = brain.whole;
  return {
    version: w.version, name: w.name, seed: w.seed, majors: w.majors, subcellsPerMajor: w.subcellsPerMajor, edgesPerCell: w.edgesPerCell,
    localWindow: w.localWindow, substrateUnits: w.substrateUnits, attentionEvery: w.attentionEvery || ATTENTION_EVERY, mailCap: w.mailCap || MAIL_CAP, ids: w.ids, mind: w.mind, policy: w.policy,
    memory: brain.memory ? brain.memory.serialize() : null,
    capability: brain.capability && brain.capability.registry ? brain.capability.registry.toJSON() : null,
    attention: attentionState(w.services && w.services.attention),
    learning: learningState(w.services && w.services.learning),
    worldQueues: worldQueues(brain),
    // the organism's genome record (seeds/organism.mjs), whose runtime.gate is the gate config
    // the organism was built with: restoreWhole arms the growth policy from it, not from {}
    genome: brain.genome ? JSON.parse(JSON.stringify(brain.genome)) : null,
    codebooks: codebookSlots(brain.memory),
  };
}

// Codebook slot order. core/signal.mjs ItemMemory breaks a tie in nearest() by SLOT order, and
// delete() moves the last slot into the hole, so once anything is released the slot order is no
// longer the Map's insertion order. serialize() writes the Map order and from() re-slots in it,
// so a restored codebook can name a different one of two equally near items: bench/compress.mjs
// measured it on a 12 major whole (t=2000, replay tick 129), where the restored mem.sequence
// decoded a cue to "seq:item:5" and the live one to "seq:item:20" (memory/sequence.mjs release()
// deletes auto named items as runs age out). The whole organism records the slot order of every
// memory codebook whose slots are not in Map order, and a codebook live had unpacked (a non
// bipolar item was set once) is recorded as such, since its nearest() scans in Map order
// instead. A codebook whose slots are not exactly its Map's keys (memory/semantic.mjs removes a
// pattern with items.items.delete, which leaves the slot behind) cannot be put back from its
// items alone; it is named under skipped rather than dropped silently.
const MEMORY_PARTS = ['working', 'episodic', 'semantic', 'procedural', 'sequence', 'self'];
function codebookSlots(sys) {
  const out = { slots: {}, unpacked: [], skipped: [] };
  if (!sys) return out;
  for (const part of MEMORY_PARTS) {
    const im = sys[part] && sys[part].items;
    if (!(im instanceof ItemMemory)) continue;
    if (!im.packed || !im.arena) { if (!im.packed) out.unpacked.push(part); continue; }
    const names = im.names;
    if (names.length !== im.items.size || !names.every((n) => im.items.has(n))) {
      out.skipped.push({ part, reason: 'slots ' + names.length + ' do not match the ' + im.items.size + ' items' });
      continue;
    }
    let i = 0, inOrder = true;
    for (const n of im.items.keys()) if (names[i++] !== n) { inOrder = false; break; }
    if (!inOrder) out.slots[part] = names.slice();
  }
  return out;
}
function restoreCodebookSlots(sys, j) {
  if (!sys || !j) return;
  for (const part of j.unpacked || []) {
    const im = sys[part] && sys[part].items;
    if (im instanceof ItemMemory) { im.packed = false; im.arena = null; im.names = []; im.slots = new Map(); }
  }
  for (const [part, order] of Object.entries(j.slots || {})) {
    const im = sys[part] && sys[part].items;
    if (!(im instanceof ItemMemory)) throw new Error('restoreWhole: codebook order recorded for ' + part + ', which holds no codebook');
    if (order.length !== im.items.size || !order.every((n) => im.items.has(n))) throw new Error('restoreWhole: the recorded slot order of ' + part + ' names ' + order.length + ' items, the restored codebook holds ' + im.items.size);
    if (!im.packed || !im.arena) continue;
    // the restored arena is re-filled in the recorded order, in place: no second arena
    const slots = new Map();
    order.forEach((n, i) => { slots.set(n, i); im.arena.set(i, im.items.get(n)); });
    im.arena.truncate(order.length);
    im.names = order.slice(); im.slots = slots;
  }
}

// World results in flight. A world kind drops its queue of outside results when its cell is
// serialized and records only the depth (world/actuators.mjs dropQueue; the same line is in
// world/senses.mjs, world/venue.mjs, act/llm.mjs, act/shell.mjs and act/web.mjs), because a
// result can carry BigInt rationals that JSON.stringify refuses. The queue is FIFO and drained one
// item per run, so a restore that comes back with it empty emits the newest result where the
// live organism emits the oldest: measured by test/compress.test.mjs on a 4 major whole at t=120,
// w.fs held 31 results, and on the first replay tick the restored w.fs emitted "unknown world op
// fs.http.get" where the live one emitted a 31 tick old "no path given". The whole organism
// carries those queues here, BigInt and typed arrays spelled as plain JSON (svcEnc). A queue
// holding anything that is not plain data (a function, a promise, a class instance) is left
// behind and named under skipped, so a drop is never silent.
function plainData(v, depth = 0) {
  if (depth > 64) return false;
  const t = typeof v;
  if (v === null || t === 'string' || t === 'number' || t === 'boolean' || t === 'bigint' || t === 'undefined') return true;
  if (t !== 'object') return false;
  if (ArrayBuffer.isView(v)) return true;
  if (Array.isArray(v)) return v.every((x) => plainData(x, depth + 1));
  if (v instanceof Map) return [...v].every(([k, x]) => plainData(k, depth + 1) && plainData(x, depth + 1));
  const proto = Object.getPrototypeOf(v);
  if (proto !== Object.prototype && proto !== null) return false;
  return Object.keys(v).every((k) => plainData(v[k], depth + 1));
}

function worldQueues(brain) {
  const queues = {}, skipped = [];
  for (const c of brain.cells) {
    const st = c.state;
    if (!st || !Array.isArray(st.queue) || !st.queue.length) continue;
    const kind = getKind(c.kind);
    if (!kind.serialize) continue;
    const ser = kind.serialize(st, c);
    if (!ser || !Object.prototype.hasOwnProperty.call(ser, 'queuedAtSnapshot')) continue;
    if (!plainData(st.queue)) { skipped.push(c.id); continue; }
    queues[c.id] = svcEnc(st.queue);
  }
  return { queues, skipped };
}

function restoreWorldQueues(brain, j) {
  if (!j || !j.queues) return;
  for (const [id, q] of Object.entries(j.queues)) {
    const c = brain.byId.get(id);
    if (!c || !c.state) continue;
    c.state.queue = svcDec(q);
    delete c.state.queuedAtSnapshot;
  }
}

// A service's state as plain JSON: a Map becomes { __map: entries }, a Set { __set }, a typed
// array { __ta, b64 } and a BigInt { __big } (core/cell.mjs toSafe spells those two the same
// way), anything else is walked.
function svcEnc(v) {
  if (typeof v === 'bigint') return { __big: v.toString() };
  if (v === null || typeof v !== 'object') return v;
  if (v instanceof Map) return { __map: [...v].map(([k, x]) => [k, svcEnc(x)]) };
  if (v instanceof Set) return { __set: [...v].map(svcEnc) };
  if (ArrayBuffer.isView(v)) return { __ta: v.constructor.name, b64: Buffer.from(v.buffer, v.byteOffset, v.byteLength).toString('base64') };
  if (Array.isArray(v)) return v.map(svcEnc);
  const o = {}; for (const k of Object.keys(v)) o[k] = svcEnc(v[k]); return o;
}
const SVC_TA = { Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array };
function svcDec(v) {
  if (v === null || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map(svcDec);
  if (v.__big !== undefined) return BigInt(v.__big);
  if (v.__map) return new Map(v.__map.map(([k, x]) => [k, svcDec(x)]));
  if (v.__set) return new Set(v.__set.map(svcDec));
  if (v.__ta) { const b = Buffer.from(v.b64, 'base64'); const Ctor = SVC_TA[v.__ta] || Uint8Array; return new Ctor(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)); }
  const o = {}; for (const k of Object.keys(v)) o[k] = svcDec(v[k]); return o;
}

// The learning engine's state travels with the organism too (learning/engine.mjs): the
// decaying pre activity trace of every cell, the tick each last fired, the fire counts it last
// sampled, the per cell learning rate scales and surprise, the per edge eligibility traces, the
// region rewards, gains and errors, and every rule's own state. A restore that leaves them
// behind starts every trace at zero, so the same signals move the weights differently from the
// first tick: measured by bench/compress.mjs, the connectome weights of a restored 4 major whole
// parted from the live one's within a 60 tick replay. Wall time spent (cost.ns) stays behind:
// it is a measurement of this process, not state of the organism.
function learningState(eng) {
  if (!eng) return null;
  return svcEnc({
    nCells: eng.nCells, prevFired: eng.prevFired, fireT: eng.fireT, preTrace: eng.preTrace, traceT: eng.traceT,
    lrScale: eng.lrScale, surprise: eng.surprise, z: eng.z, zT: eng.zT, rewards: eng.rewards, gains: eng.gains,
    errors: eng.errors, states: eng.states,
    cost: { ticks: eng.cost.ticks, applied: eng.cost.applied, skipped: eng.cost.skipped, overBudget: eng.cost.overBudget },
  });
}

function restoreLearning(eng, j) {
  if (!eng || !j) return;
  const x = svcDec(j);
  for (const k of ['prevFired', 'fireT', 'preTrace', 'traceT', 'lrScale', 'surprise']) if (x[k]) eng[k] = x[k];
  if (Number.isFinite(x.nCells)) eng.nCells = x.nCells;
  for (const k of ['z', 'zT', 'rewards', 'gains', 'errors']) if (x[k] instanceof Map) eng[k] = x[k];
  if (x.states instanceof Map) for (const [name, st] of x.states) if (eng.states.has(name)) eng.states.set(name, st);
  if (x.cost) Object.assign(eng.cost, x.cost);
  eng.targets.clear();
}

// Attention's own state travels with the organism. simulate/attention.mjs records the priority
// each cell was created with the first time it sees the cell (base), and scores novelty against
// the hypervectors it saw last (wm, wmHash). A restore that leaves them behind builds a new
// service that takes the RAISED priority it finds as the base: measured by bench/compress.mjs
// on a 4 major whole, as.0001.0 ended a 60 tick replay at priority 16 restored against 6.98
// live, in a checkpoint of either container. The working memory vectors are encoded the way a
// signal's are (core/signal.mjs dataToJSON), so container 2 packs them one bit per lane.
function attentionState(att) {
  if (!att) return null;
  return {
    base: [...att.base], wm: att.wm.map((v) => dataToJSON('hv', v)), wmHash: att.wmHash.slice(),
    prev: [...att._prev], scores: [...att.scores], stats: { ...att.stats },
  };
}

function restoreAttention(att, j) {
  if (!att || !j) return;
  att.base = new Map(j.base || []);
  att.wm = (j.wm || []).map((x) => dataFromJSON('hv', x));
  att.wmHash = (j.wmHash || []).slice();
  att._prev = new Map(j.prev || []);
  att.scores = new Map(j.scores || []);
  if (j.stats) att.stats = { ...att.stats, ...j.stats };
}

// ---------------------------------------------------------------- restore
export function restoreWhole(dir, opts = {}) {
  const { ledger = 'full', log = null } = opts;
  const t0 = now();
  let extras = null;
  const brain = Brain.restore(dir, { ledger, policy: monomorphicGrowth({}), hooks: { restore: [(b, x) => { extras = x && x.whole ? x.whole : null; }] } });
  if (!extras) throw new Error('restoreWhole: the snapshot in ' + dir + ' carries no whole extras (was it built by buildWhole?)');
  if (extras.genome) {
    brain.genome = extras.genome;
    const gateOpts = extras.genome.runtime && extras.genome.runtime.gate;
    if (gateOpts && typeof gateOpts === 'object') brain.gate.policy = monomorphicGrowth(gateOpts);
  }
  // a bound named for this run (opts.episodic.maxEpisodes or BRAIN_EPISODES_MAX) replaces the one the
  // snapshot recorded, before a single key is decoded: above it the eviction rule keeps exactly the bound
  const epBound = episodicBound(opts);
  let memJ = extras.memory;
  if (memJ && memJ.episodic && epBound) memJ = { ...memJ, episodic: EpisodicStore.bounded(memJ.episodic, epBound) };
  const sys = memJ ? MemorySystem.from(memJ) : new MemorySystem({ name: extras.name, ...(epBound ? { episodic: { maxEpisodes: epBound } } : {}) });
  restoreCodebookSlots(sys, extras.codebooks);
  attachMemory(brain, sys);
  brain.capability = { registry: extras.capability ? SkillRegistry.from(extras.capability) : new SkillRegistry({ name: extras.name + ':skills' }) };
  ensureMind(extras.mind.model, extras.mind.opts, extras.mind.text);
  const pol = normalizePolicy(extras.policy || {});
  armWorld(brain.gate, pol);
  const cells = {};
  for (const c of brain.cells) if (WORLD_KINDS.includes(c.kind)) cells[c.id] = c;
  brain.ctx.world = { policy: pol, region: 'world', cells };
  attachServices(brain, { ...extras, policy: pol, memorySystem: sys });
  restoreAttention(brain.whole.services.attention, extras.attention);
  restoreLearning(brain.whole.services.learning, extras.learning);
  restoreWorldQueues(brain, extras.worldQueues);
  const audit = auditWiring(brain);
  const report = describe(brain, { built: false, timing: { restoreMs: now() - t0 }, audit, illegal: audit.faults.length });
  if (typeof log === 'function') log(printable(report));
  return { brain, report };
}

// ---------------------------------------------------------------- reports
export function describe(brain, extra = {}) {
  const kinds = new Map();
  for (const c of brain.cells) kinds.set(c.kind, (kinds.get(c.kind) || 0) + 1);
  const regions = {};
  for (const [nm, r] of brain.regions) regions[nm] = r.cells.size;
  return {
    name: brain.name, t: brain.clock.t, cells: brain.cells.length, edges: brain.connectome.size(), liveEdges: brain.connectome.live(),
    regions, regionCount: brain.regions.size, kinds: [...kinds.keys()].sort(), kindCount: kinds.size, kindCounts: Object.fromEntries([...kinds].sort()),
    periods: brain.clock.periods.slice(), ids: brain.whole ? brain.whole.ids : null, ...extra,
  };
}

export function printable(r) {
  return [
    'whole ' + r.name + (r.built ? ' built' : ' restored') + ': cells ' + r.cells + ', edges ' + r.edges + ' (live ' + r.liveEdges + '), regions ' + r.regionCount + ' [' + Object.keys(r.regions).join(', ') + ']',
    'kinds used ' + r.kindCount + ': ' + r.kinds.join(' '),
    'illegal edges ' + r.illegal + ' (strict audit checked ' + (r.audit ? r.audit.checked : 0) + ', faults ' + (r.audit ? r.audit.faults.length : 0) + (r.whole ? ', whole wiring illegal ' + r.whole.illegal + ', added ' + r.whole.added : '') + ')',
    'periods alive: ' + r.periods.map(periodLabel).join(' ') + ' and event',
  ].join('\n');
}

// Runs per clock period: the proof that 1, SEC, MIN and HOUR circuits are all alive.
export function timescaleReport(brain) {
  const rows = [];
  for (const p of brain.clock.periods) {
    const set = brain.clock.wheel.get(p); let runs = 0, fired = 0;
    for (const idx of set) { const c = brain.cells[idx]; runs += c.stats.runs; fired += c.stats.fired; }
    rows.push({ period: p, label: periodLabel(p), cells: set.size, runs, fired });
  }
  let eruns = 0, efired = 0;
  for (const idx of brain.clock.eventCells) { const c = brain.cells[idx]; eruns += c.stats.runs; efired += c.stats.fired; }
  rows.push({ period: 'event', label: 'event', cells: brain.clock.eventCells.size, runs: eruns, fired: efired });
  return rows;
}

// ---------------------------------------------------------------- an elite replaces a region
// The organism genome carries per-region genes (periodMix, learnProb, delayScale). Applying
// one to the live brain rewires the cells of that region only, never the clock circuit and
// never a cell added by buildWhole, and rescales the delays of the edges leaving the region.
export function applyRegionGenes(brain, region, genome, { seed = null } = {}) {
  const r = brain.regions.get(region);
  if (!r) throw new Error('applyRegionGenes: no region ' + region);
  const genes = genome && genome.regions && genome.regions[region];
  if (!genes) throw new Error('applyRegionGenes: genome carries no genes for ' + region);
  const rng = new RNG((seed || (genome.seed + ':' + genome.id)) + ':apply:' + region);
  const mix = genes.periodMix || {}; const entries = Object.entries(mix).filter(([, w]) => w > 0);
  const total = entries.reduce((a, [, w]) => a + w, 0) || 1;
  const drawPeriod = () => { let x = rng.next() * total; for (const [k, w] of entries) { x -= w; if (x <= 0) return k === 'event' ? 'event' : Number(k) === 1000 ? SEC : Number(k) === 60000 ? MIN : Number(k) === 3600000 ? HOUR : Number(k) || 1; } return 1; };
  const clock = brain.whole ? new Set(Object.values(brain.whole.ids.clock)) : new Set();
  const own = brain.whole ? brain.whole.ids : null;
  const protectedIds = new Set(clock);
  if (own) { for (const v of Object.values(own.substrates)) protectedIds.add(v); for (const v of Object.values(own.arc)) protectedIds.add(v); }
  // the mailbox cap follows the period: a cell promoted onto a slow wheel has to be capped,
  // and one brought back to period 1 or to event drains every tick and is uncapped again
  const mailCap = brain.whole ? (brain.whole.mailCap || MAIL_CAP) : null;
  const capFor = (period) => (mailCap !== null && typeof period === 'number' && period >= SEC ? mailCap : undefined);
  let retimed = 0, relearned = 0, redelayed = 0;
  for (const idx of r.cells) {
    const c = brain.cells[idx];
    if (protectedIds.has(c.id) || c.kind === 'substrate' || c.kind === 'world.relay') continue;
    if (entries.length && c.ports.in.length) {
      const p = drawPeriod();
      if (p !== c.policy.period) { brain.clock.unregister(c); c.policy.period = p; c.policy.mailCap = capFor(p); brain.clock.register(c); retimed++; }
    }
    if (typeof genes.learnProb === 'number') { const want = rng.next() < genes.learnProb ? 'hebbian' : null; if (want !== c.policy.learn) { c.policy.learn = want; relearned++; } }
  }
  const scale = typeof genes.delayScale === 'number' && genes.delayScale > 0 ? genes.delayScale : 1;
  if (scale !== 1) {
    const cn = brain.connectome;
    for (let e = 0; e < cn.n; e++) {
      if (!(cn.flags[e] & ACTIVE) || !r.cells.has(cn.src[e])) continue;
      const d = cn.delay[e]; const nd = Math.max(0, Math.min(31, Math.round(d * scale)));
      if (nd !== d) { cn.delay[e] = nd; redelayed++; }
    }
  }
  const result = { region, genome: genome.id, retimed, relearned, redelayed, delayScale: scale, learnProb: genes.learnProb, periodMix: mix };
  brain.log({ type: 'whole.promote', ...result });
  return result;
}
