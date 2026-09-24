// mind/imagine.mjs: THE IMAGINATION REGION (P14). His words (MANUAL.md section A, 2026-09-23
// 17:36): "Ai is algorithms. What if this had imagination? Could think outside the box ? Could
// vision? Could create new things thay have never been done before".
//
// THE BOX. Every fixed vocabulary the organism holds (the grid DSL, its solved programs, the
// objectives it already chases) is memory. A search over memory by recombination is the box: it
// can only reach what its parts can be glued into. This file proposes candidates that are
// OUTSIDE BOTH, and says so by measurement, not by adjective:
//
//   OUTSIDE MEMORY  a candidate's hypervector sits at a normalized distance of at least `floor`
//                   from EVERY stored item (distance (1 - sim) / 2: 0 identical, about 0.5
//                   unrelated), its canonical key matches no stored key exactly, and, when the
//                   knowledge tier (memory/knowledge.mjs) is present, its title matches no
//                   article title in the ingested corpus ("never done before is a claim the
//                   corpus check makes", MANUAL.md P14).
//   OUTSIDE THE NULL a null arm at the same budget draws `budget` random candidates and `budget`
//                   pairwise recombinations of memory items; a candidate the null reached is
//                   rejected, whatever its distance.
//
// A SPACE says what is being imagined. It supplies:
//   type                   'primitive' | 'wiring' | 'objective' | 'patch'
//   key(c)                 canonical identity string
//   words(c)               ordered structural tokens, the hypervector's content
//   title(c)?              text checked against the knowledge corpus for an exact title
//   random(rng)            one random candidate (the null)
//   recombine(a, b, rng)   one recombination of two memory items (the null)
//   operators              [{ name, make(memory, rng, context) }]: the imagination's moves,
//                          one candidate (or null) per draw
//   valid(c)?              a candidate that is not well formed is not counted
// capability/grid-invent.mjs holds the space over the grid DSL; objectiveSpace() below is the
// space of objectives (VISION: the organism proposes its own next objective, a hypothesis with a
// ruler, and the gate decides).
//
// THE GATE. keep(candidate, evidence, { gate }) submits kind 'imagine.keep' (registered below
// through core/gate.mjs registerProposalKind, judged by imaginePolicy). A primitive or a wiring
// is approved only when it solved a HELD OUT task: a task outside the sources it was invented
// from. An objective is approved only when it carries a hypothesis and a complete ruler: a
// suite, a bar and a control. A code patch is held for the autopilot (self/autopilot.mjs), which
// approves only by its own measurement. Every kept candidate records its novelty distance and
// the task it solved. Nothing is applied without an approved proposal.
import * as S from '../core/signal.mjs';
import { RNG } from '../core/rng.mjs';
import { registerProposalKind } from '../core/gate.mjs';

export const IMAGINE_KIND = 'imagine.keep';
export const IMAGINE_PROVENANCE = 'imagine';
export const PROPOSAL_TYPES = Object.freeze(['primitive', 'wiring', 'objective', 'patch']);
export const IMAGINE_DEFAULTS = Object.freeze({
  floor: 0.15,     // minimum normalized hv distance from every memory item
  seed: 'imagine',
  maxTries: 4,     // an operator that made a duplicate may redraw this many times inside one draw
});

// ---------------------------------------------------------------- the gate kind
const hasText = (s) => typeof s === 'string' && s.trim().length > 0;
/**
 * Is this ruler complete: a suite to run, a bar with a metric, a comparison and a value, and a
 * control arm to beat? An objective without all three is a wish, not a hypothesis.
 * @param {object} r
 * @returns {boolean}
 */
export function rulerComplete(r) {
  if (!r || typeof r !== 'object') return false;
  const b = r.bar;
  const barOk = b && typeof b === 'object' && hasText(b.metric) && hasText(b.op) && (typeof b.value === 'number' || hasText(b.value));
  return hasText(r.suite) && !!barOk && hasText(r.control);
}

/**
 * The policy that judges an imagine.keep proposal.
 *   primitive, wiring  approve when it solved at least one task outside its sources, with its
 *                      novelty distance recorded as a number above zero
 *   objective          approve when it carries a hypothesis and a complete ruler
 *   patch              approve only when the autopilot's verification is in the evidence; hold
 *                      otherwise (the autopilot is the one that measures a patch)
 * @param {object} p the proposal
 * @returns {'approve'|'reject'|'hold'}
 */
export function imaginePolicy(p) {
  const ev = (p && p.evidence) || {};
  if (ev.provenance !== IMAGINE_PROVENANCE) return 'reject';
  if (!PROPOSAL_TYPES.includes(ev.type)) return 'reject';
  if (ev.type === 'objective') return hasText(ev.hypothesis) && rulerComplete(ev.ruler) ? 'approve' : 'reject';
  if (ev.type === 'patch') return ev.verified === true ? 'approve' : 'hold';
  if (!(typeof ev.novelty === 'number' && ev.novelty > 0)) return 'reject';
  const sources = new Set(Array.isArray(ev.sources) ? ev.sources : []);
  const held = (Array.isArray(ev.solved) ? ev.solved : []).filter((t) => typeof t === 'string' && t && !sources.has(t));
  return held.length > 0 ? 'approve' : 'reject';
}
registerProposalKind(IMAGINE_KIND, {
  policy: imaginePolicy,
  slim: (ev) => ({ provenance: ev.provenance, type: ev.type, key: ev.key, novelty: ev.novelty, solved: ev.solved, sources: Array.isArray(ev.sources) ? ev.sources.slice(0, 8) : ev.sources, hypothesis: ev.hypothesis, ruler: ev.ruler, verified: ev.verified }),
});

// ---------------------------------------------------------------- hypervectors
// A candidate's hypervector bundles two things over its ordered tokens: the BAG (each token's
// word vector, the same seeds act/prompt.mjs and mind/dream.mjs use, so a kept candidate lives in
// the space the ask path already queries) and the ORDER (each token bound to its position), so
// "rot90 then flipH" and "flipH then rot90" are near but not equal. The vectors are plain
// Int8Arrays: the shared hv heap is not held past the fold.
const TOKEN = new Map();
function plainSeed(label) {
  let v = TOKEN.get(label);
  if (v) return v;
  const h = S.hvFromSeed(label);
  v = Int8Array.from(h);
  S.release(h);
  TOKEN.set(label, v);
  if (TOKEN.size > 50_000) TOKEN.clear();
  return v;
}
let TIE = null;
/**
 * The hypervector of an ordered token list: bag plus order, one lane at a time, ties broken by
 * a fixed seeded vector.
 * @param {string[]} words
 * @param {string} [type] the proposal type, added as one more bag token
 * @returns {Int8Array|null}
 */
export function encodeWords(words, type = null) {
  const list = (Array.isArray(words) ? words : []).map(String).filter((w) => w.length);
  if (!list.length) return null;
  const d = S.D, acc = new Int32Array(d);
  const add = (v) => { for (let i = 0; i < d; i++) acc[i] += v[i]; };
  if (type) add(plainSeed('word:type:' + type));
  for (let k = 0; k < list.length; k++) {
    const w = plainSeed('word:' + list[k]), p = plainSeed('imagine:pos:' + k);
    add(w);
    for (let i = 0; i < d; i++) acc[i] += w[i] * p[i];
  }
  if (!TIE) TIE = plainSeed('imagine:tie');
  const out = new Int8Array(d);
  for (let i = 0; i < d; i++) out[i] = acc[i] > 0 ? 1 : acc[i] < 0 ? -1 : TIE[i];
  return out;
}
/** Normalized hv distance: 0 identical, about 0.5 unrelated, 1 opposite. */
export const distanceOf = (sim) => Math.round(((1 - sim) / 2) * 1e6) / 1e6;
/**
 * The nearest memory item to a vector, and its distance.
 * @param {Int8Array} hv
 * @param {{key: string, hv: Int8Array}[]} index
 * @returns {{distance: number, nearest: string|null}}
 */
export function nearestOf(hv, index) {
  let best = -2, key = null;
  for (const m of index) { const s = S.sim(hv, m.hv); if (s > best) { best = s; key = m.key; } }
  return key === null ? { distance: 0.5, nearest: null } : { distance: distanceOf(best), nearest: key };
}

/**
 * The memory index of a space: one entry per distinct key, each with its hypervector.
 * Reusable across propose() calls on the same memory.
 * @param {object} space
 * @param {object[]} memory
 */
export function memoryIndex(space, memory) {
  const keys = new Map(), index = [];
  for (const m of memory || []) {
    if (!m) continue;
    const k = space.key(m);
    if (keys.has(k)) continue;
    keys.set(k, m);
    const hv = encodeWords(space.words(m), space.type);
    if (hv) index.push({ key: k, hv });
  }
  return { keys, index, items: [...keys.values()] };
}

/**
 * How far a candidate sits from memory: its exact key, its nearest item and distance.
 * @returns {{inMemory: boolean, distance: number, nearest: string|null, key: string}}
 */
export function noveltyOf(space, candidate, mem) {
  const key = space.key(candidate);
  if (mem.keys.has(key)) return { key, inMemory: true, distance: 0, nearest: key };
  const hv = encodeWords(space.words(candidate), space.type);
  if (!hv) return { key, inMemory: false, distance: 0, nearest: null };
  const n = nearestOf(hv, mem.index);
  return { key, inMemory: false, distance: n.distance, nearest: n.nearest };
}

// ---------------------------------------------------------------- propose
/**
 * Imagine. Draw `budget` candidates from the space's operators and keep the ones outside memory
 * and outside the recombination null drawn at the same budget.
 * @param {{space: object, memory?: object[], mem?: object, knowledge?: {titleLookup: Function}|null,
 *   floor?: number, seed?: string}} context
 * @param {number|{draws: number}} budget draws for the imagination; the null makes the same
 *   number of random draws AND the same number of recombination draws
 * @returns {{candidates: object[], rejected: object, null: {draws: number, reached: number},
 *   draws: number, floor: number, ms: number, type: string}}
 */
export function propose(context, budget = 64) {
  const t0 = performance.now();
  const space = context && context.space;
  if (!space || typeof space.key !== 'function' || typeof space.words !== 'function' || !Array.isArray(space.operators) || !space.operators.length) {
    throw new Error('imagine: propose needs a context.space with key, words and operators');
  }
  const n = Math.max(1, Math.floor(typeof budget === 'number' ? budget : (budget && budget.draws) || 64));
  const floor = typeof context.floor === 'number' ? context.floor : IMAGINE_DEFAULTS.floor;
  const rng = new RNG('imagine:' + (context.seed ?? IMAGINE_DEFAULTS.seed) + ':' + space.type);
  const mem = context.mem || memoryIndex(space, context.memory || []);
  const items = mem.items;

  // the null: random and pairwise recombined candidates at the same budget
  const nullRng = rng.fork('null');
  const reach = new Set();
  let nullDraws = 0;
  if (typeof space.random === 'function') for (let i = 0; i < n; i++) { nullDraws++; const r = space.random(nullRng); if (r) reach.add(space.key(r)); }
  if (typeof space.recombine === 'function' && items.length >= 1) {
    for (let i = 0; i < n; i++) {
      nullDraws++;
      const a = items[nullRng.int(items.length)], b = items[nullRng.int(items.length)];
      const r = space.recombine(a, b, nullRng);
      for (const x of [].concat(r || [])) if (x) reach.add(space.key(x));
    }
  }

  // the imagination
  const rejected = { invalid: 0, duplicate: 0, inMemory: 0, inKnowledge: 0, inNull: 0, nearMemory: 0 };
  const byOperator = {};
  const seen = new Set(), out = [];
  const ops = space.operators;
  for (let draw = 0; draw < n; draw++) {
    const op = ops[draw % ops.length];
    const tally = byOperator[op.name] || (byOperator[op.name] = { draws: 0, kept: 0 });
    tally.draws++;
    let c = null;
    for (let t = 0; t < IMAGINE_DEFAULTS.maxTries; t++) {
      c = op.make(items, rng, context);
      if (!c) break;
      if (!seen.has(space.key(c))) break;
    }
    if (!c || (typeof space.valid === 'function' && !space.valid(c))) { rejected.invalid++; continue; }
    const key = space.key(c);
    if (seen.has(key)) { rejected.duplicate++; continue; }
    seen.add(key);
    const nov = noveltyOf(space, c, mem);
    if (nov.inMemory) { rejected.inMemory++; continue; }
    if (context.knowledge && typeof context.knowledge.titleLookup === 'function' && typeof space.title === 'function') {
      let hit = [];
      try { hit = context.knowledge.titleLookup(space.title(c)) || []; } catch { hit = []; }
      if (hit.length) { rejected.inKnowledge++; continue; }
    }
    if (reach.has(key)) { rejected.inNull++; continue; }
    if (nov.distance < floor) { rejected.nearMemory++; continue; }
    tally.kept++;
    out.push({ ...c, type: space.type, key, provenance: IMAGINE_PROVENANCE, operator: op.name, novelty: nov.distance, nearest: nov.nearest });
  }
  return {
    candidates: out, rejected, byOperator, draws: n, floor, type: space.type,
    null: { draws: nullDraws, reached: reach.size },
    knowledgeChecked: !!(context.knowledge && typeof space.title === 'function'),
    ms: Math.round((performance.now() - t0) * 100) / 100,
  };
}

// ---------------------------------------------------------------- keep
/**
 * Submit a candidate to the authority gate. The evidence must say what it solved and what it was
 * invented from (a primitive or wiring), or carry its ruler (an objective).
 * @param {object} candidate from propose(), or any typed proposal with a key and a type
 * @param {object} evidence { solved: taskIds, sources: taskIds, novelty } or { hypothesis, ruler }
 * @param {{gate: object, by?: string, why?: string}} opts
 * @returns {object} the proposal, with status approved, rejected or pending
 */
export function keep(candidate, evidence = {}, opts = {}) {
  const gate = opts.gate;
  if (!gate || typeof gate.propose !== 'function') throw new Error('imagine: keep needs a gate');
  const type = candidate.type || evidence.type;
  const ev = {
    provenance: IMAGINE_PROVENANCE,
    type,
    key: candidate.key,
    novelty: typeof evidence.novelty === 'number' ? evidence.novelty : candidate.novelty,
    nearest: evidence.nearest ?? candidate.nearest ?? null,
    solved: evidence.solved || [],
    sources: evidence.sources || candidate.sources || [],
    ...(type === 'objective' ? { hypothesis: candidate.hypothesis, ruler: candidate.ruler } : {}),
    ...evidence,
  };
  ev.provenance = IMAGINE_PROVENANCE;
  ev.type = type;
  return gate.propose({
    kind: IMAGINE_KIND,
    what: { type, key: candidate.key, spec: candidate.spec ?? null, title: candidate.title ?? null },
    why: opts.why || (type === 'objective' ? 'a self-proposed objective with its ruler' : 'solved a held out task: ' + (ev.solved || []).join(', ')),
    evidence: ev,
    by: opts.by || 'imagine',
  });
}

// ---------------------------------------------------------------- the objective space (VISION)
const OBJ_WORDS = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9_.:+-]+/g, ' ').split(' ').filter((w) => w.length > 1);
/** The canonical key of an objective: its hypothesis and its ruler, normalized. */
export function objectiveKey(o) {
  const b = (o.ruler && o.ruler.bar) || {};
  return ['obj', OBJ_WORDS(o.hypothesis).join(' '), OBJ_WORDS(o.ruler && o.ruler.suite).join(' '), OBJ_WORDS(b.metric).join(' '), b.op, String(b.value), OBJ_WORDS(o.ruler && o.ruler.control).join(' ')].join('|');
}

/**
 * The space of objectives. `facts` are what the run measured, each a template the operators
 * turn into a hypothesis with a ruler:
 *   facts.templates  [{ name, make(fact) -> {hypothesis, plane, ruler} }]
 *   facts.items      [fact] the measured things the templates speak about (a kept primitive, a
 *                    family that solved nothing, a budget, an unsolved task set)
 * The null recombines the fields of stored objectives: a stored hypothesis under another stored
 * ruler, or a random stored hypothesis with a random stored suite, bar and control.
 * @param {{templates: object[], items: object[]}} facts
 */
export function objectiveSpace(facts = {}) {
  const templates = facts.templates || [];
  const items = facts.items || [];
  return {
    type: 'objective',
    key: objectiveKey,
    words: (o) => [...OBJ_WORDS(o.hypothesis), ...OBJ_WORDS(o.ruler && o.ruler.suite), ...OBJ_WORDS(o.ruler && o.ruler.bar && o.ruler.bar.metric), ...OBJ_WORDS(o.ruler && o.ruler.control)],
    title: (o) => String(o.hypothesis || ''),
    valid: (o) => hasText(o.hypothesis) && !!o.ruler,
    random: (rng) => {
      const src = facts.memory || [];
      if (!src.length) return null;
      const h = rng.pick(src), r = rng.pick(src);
      return { hypothesis: h.hypothesis, plane: h.plane, ruler: { suite: r.ruler.suite, bar: rng.pick(src).ruler.bar, control: rng.pick(src).ruler.control } };
    },
    recombine: (a, b) => (a && b && a.ruler && b.ruler ? { hypothesis: a.hypothesis, plane: a.plane, ruler: b.ruler } : null),
    operators: templates.map((t) => ({
      name: t.name,
      make: (memory, rng) => {
        const pool = items.filter((f) => !t.accepts || t.accepts(f));
        if (!pool.length) return null;
        const o = t.make(rng.pick(pool), rng);
        if (!o) return null;
        return { hypothesis: o.hypothesis, plane: o.plane || 'unknown', ruler: o.ruler, title: o.hypothesis, template: t.name };
      },
    })),
  };
}
