// memory/index.mjs. THE MEMORY SYSTEM: the six tiers under one roof, plus the registry
// that lets cells reach a system by name instead of by object reference.
//
// Why a registry. Cell params are serialized with the cell, so a param cannot hold a live
// object. A cell therefore carries params.system, a string, and looks the system up here.
// A brain can also carry one directly as brain.memory for code that has the brain in hand.
import { D } from '../core/signal.mjs';
import { WorkingMemory, WorkingSet, WORKING_DEFAULTS } from './working.mjs';
import { EpisodicStore, EPISODIC_DEFAULTS, popcount32 } from './episodic.mjs';
import { SemanticMemory, SEMANTIC_DEFAULTS, WEIGHT_SCALE } from './semantic.mjs';
import { SkillStore, captureSkill, instantiateSkill, makeSkill, jsonSafe } from './procedural.mjs';
import { SequenceMemory, SEQUENCE_DEFAULTS } from './sequence.mjs';
import { SelfMemory, SELF_DEFAULTS } from './self.mjs';

export {
  WorkingMemory, WorkingSet, WORKING_DEFAULTS,
  EpisodicStore, EPISODIC_DEFAULTS, popcount32,
  SemanticMemory, SEMANTIC_DEFAULTS, WEIGHT_SCALE,
  SkillStore, captureSkill, instantiateSkill, makeSkill, jsonSafe,
  SequenceMemory, SEQUENCE_DEFAULTS,
  SelfMemory, SELF_DEFAULTS,
};

const SYSTEMS = new Map();

/**
 * Register a memory system under a name so cells can find it.
 * @param {string} name
 * @param {MemorySystem} sys
 * @returns {MemorySystem} the same system
 */
export function registerMemorySystem(name, sys) { SYSTEMS.set(name, sys); return sys; }

/**
 * Look a registered memory system up.
 * @param {string} [name]
 * @returns {MemorySystem}
 */
export function getMemorySystem(name = 'default') {
  const s = SYSTEMS.get(name);
  if (!s) throw new Error('memory: no system registered as ' + name + ' (registered: ' + [...SYSTEMS.keys()].join(', ') + ')');
  return s;
}

/** @param {string} name @returns {boolean} */
export function hasMemorySystem(name) { return SYSTEMS.has(name); }

/** @param {string} name @returns {boolean} whether something was removed */
export function unregisterMemorySystem(name) { return SYSTEMS.delete(name); }

/** @returns {string[]} every registered system name */
export function listMemorySystems() { return [...SYSTEMS.keys()]; }

/**
 * The six tiers as one object, with consolidation and forgetting across them.
 */
export class MemorySystem {
  /**
   * @param {object} [opts] { name, d, working, episodic, semantic, sequence, self }
   */
  constructor(opts = {}) {
    this.name = opts.name ?? 'default';
    this.d = opts.d ?? D;
    this.working = new WorkingSet({ ...(opts.working || {}) });
    this.episodic = new EpisodicStore({ d: this.d, seed: opts.seed ?? this.name, ...(opts.episodic || {}) });
    this.semantic = new SemanticMemory({ d: this.d, ...(opts.semantic || {}) });
    this.procedural = new SkillStore();
    this.sequence = new SequenceMemory({ d: this.d, ...(opts.sequence || {}) });
    this.self = new SelfMemory({ ...(opts.self || {}) });
    this.stats = { consolidations: 0, conceptsFormed: 0, forgettings: 0 };
  }

  /**
   * Bundle frequently co-occurring episodic items upward into semantic concepts.
   * @param {object} [opts] passed to SemanticMemory.consolidateFromEpisodic
   * @returns {object} the consolidation report
   */
  consolidate(opts = {}) {
    const r = this.semantic.consolidateFromEpisodic(this.episodic, opts);
    this.stats.consolidations++;
    this.stats.conceptsFormed += r.formed.length;
    return r;
  }

  /**
   * One forgetting pass across the tiers: working entries below the salience floor go,
   * semantic strengths decay and the weak ones are removed, episodes older than the
   * horizon go cold, and unused skills can be dropped.
   * @param {object} [opts] { now, rate, floor, horizon, sweepWorking, dropSkills }
   * @returns {{swept: number, forgotten: string[], cooled: number, skills: string[]}}
   */
  forget(opts = {}) {
    const now = opts.now ?? 0;
    const swept = (opts.sweepWorking ?? true) ? this.working.sweepAll(now) : 0;
    const d = this.semantic.decay({ rate: opts.rate, floor: opts.floor });
    const cooled = Number.isFinite(opts.horizon) ? this.episodic.cool(now - opts.horizon) : 0;
    const skills = [];
    if (opts.dropSkills) {
      for (const name of this.procedural.list()) {
        const s = this.procedural.get(name);
        if ((s.meta.uses || 0) === 0 && (s.meta.runs || 0) === 0) { this.procedural.remove(name); skills.push(name); }
      }
    }
    this.stats.forgettings++;
    return { swept, forgotten: d.forgotten, cooled, skills };
  }

  /** @returns {object} a one glance description of all six tiers */
  describe() {
    return {
      name: this.name, d: this.d,
      working: { rings: this.working.keys().length, entries: this.working.size() },
      episodic: this.episodic.describe(),
      semantic: { patterns: this.semantic.size(), concepts: this.semantic.byName.size, stats: { ...this.semantic.stats } },
      procedural: { skills: this.procedural.size(), stats: { ...this.procedural.stats } },
      sequence: { sequences: this.sequence.size(), transitions: this.sequence.transitions.length, stats: { ...this.sequence.stats } },
      self: { windows: this.self.windows.size, stats: { ...this.self.stats } },
      stats: { ...this.stats },
    };
  }

  /** @returns {object} JSON safe form of every tier */
  serialize() {
    return {
      version: 1, name: this.name, d: this.d,
      working: this.working.serialize(),
      episodic: this.episodic.serialize(),
      semantic: this.semantic.serialize(),
      procedural: this.procedural.serialize(),
      sequence: this.sequence.serialize(),
      self: this.self.serialize(),
      stats: { ...this.stats },
    };
  }

  /**
   * Rebuild from serialize(). The result is not registered, call registerMemorySystem
   * or createMemorySystem for that.
   * @param {object} j
   * @returns {MemorySystem}
   */
  static from(j) {
    const m = new MemorySystem({ name: j.name, d: j.d });
    m.working = WorkingSet.from(j.working);
    m.episodic = EpisodicStore.from(j.episodic);
    m.semantic = SemanticMemory.from(j.semantic);
    m.procedural = SkillStore.from(j.procedural);
    m.sequence = SequenceMemory.from(j.sequence);
    m.self = SelfMemory.from(j.self);
    m.stats = { ...m.stats, ...(j.stats || {}) };
    return m;
  }
}

/**
 * Build a memory system and register it under its name.
 * @param {object} [opts] see MemorySystem
 * @returns {MemorySystem}
 */
export function createMemorySystem(opts = {}) {
  const s = new MemorySystem(opts);
  return registerMemorySystem(s.name, s);
}

/**
 * Attach a memory system to a brain and register it. The brain keeps it as brain.memory
 * and the cells reach the same object through params.system.
 * @param {import('../core/brain.mjs').Brain} brain
 * @param {MemorySystem|object} [sysOrOpts] an existing system, or options for a new one
 * @returns {MemorySystem}
 */
export function attachMemory(brain, sysOrOpts = {}) {
  const sys = sysOrOpts instanceof MemorySystem ? sysOrOpts : new MemorySystem({ name: brain.name, ...sysOrOpts });
  registerMemorySystem(sys.name, sys);
  brain.memory = sys;
  return sys;
}
