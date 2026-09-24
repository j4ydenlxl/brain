// capability/grid-library.mjs: LIBRARY LEARNING FOR THE GRID SEARCH (Board 11, item arc; P4, P14).
//
// bench/verdicts/grid-evaluation.json: capability/grid-search.mjs over the 196 words of
// capability/grid-dsl.mjs solved 71 of 400 ARC-AGI-1 evaluation tasks at 3000 ms, and 321 ran
// out of clock. The clock is the box. This file reads what the search already SOLVED on the
// TRAINING split and turns it into two things the search did not have:
//
//   (a) MACROS. Every contiguous run of 2 to 4 base primitives inside a solved training program
//       (the learned last step excluded: a learner reads its parameters per task, so it cannot be
//       frozen into a word) is a candidate. A candidate is scored by DESCRIPTION LENGTH SAVED: for
//       each solved task, the length in steps of its shortest program when the library may be
//       used, before and after the candidate joins it; the saving summed over tasks, minus the
//       candidate's own length (what it costs to write the word down once). Candidates are taken
//       greedily, best first, re-scoring after each one so two macros never claim the same
//       saving, while one still saves on at least minTasks tasks (a chain in one program is that
//       program remembered, not a recurring piece). The top N become macros: each a named
//       composition registered in grid-dsl.mjs (defineMacro), which the grid.dsl cell runs by
//       name, so a program using one is wired, graded and counted as grid.dsl cells.
//   (b) A LEARNED SEARCH ORDER. Each word's search cost is re-read from the data: a Dirichlet
//       posterior whose base measure is the hand written costs of grid-dsl.mjs (a word of cost c
//       has prior mass 2^-c), updated with how many solved training programs use the word:
//         cost(x) = hand(x) - log2(1 + n(x) / (alpha * pi(x))) + log2(1 + N / alpha)
//       where n(x) is the word's count over the shortest programs of the solved tasks (macros
//       counted as one word), N the total count, pi(x) = 2^-hand(x) / Z the hand prior, and alpha
//       its strength. As alpha grows the costs return to the hand costs exactly; a word the data
//       never used pays log2(1 + N / alpha) more, a word it used often pays less. Costs are
//       quantised to 1 / scale of a unit (integers, the search's bucket queue), floored at one
//       quantum. The learners the search closes a program with are ordered by the same counts.
//   THE PORTFOLIO. Measured on the development fold (bench/verdicts/grid-library-dev-even-v1.json):
//       the learned order ALONE lost 6 held out training tasks and gained 1, because words the fold
//       never used (rayU, recolorSize4, symFillH) were pushed behind cheap depth 2 chains. The
//       hand ordered search, on the other hand, finds nearly everything it will ever find early
//       (0 of its 71 evaluation solves came after 1500 ms). So the library is searched as the SECOND
//       phase of the same clock: the hand ordered base search for (1 - share) of it, then the learned
//       order with the macros for the rest (grid-search.mjs, library.share). The second phase takes
//       the first one's frontier over (a handoff, nothing searched twice). Development records, all
//       on the training split, one fold learned and the other graded, 200 tasks, 3000 ms, 2 attempts
//       (bench/verdicts/grid-library-dev-*.json): share 0.5 as a restart 69 against 69 (gained 1,
//       lost 1); share 0.5 as a handoff 68 (gained 1, lost the 2 hand solves that came after
//       1500 ms); share 0.25 as a handoff 70 against 69 (gained 1, lost 0), and on the reverse fold
//       84 against 84 (gained 0, lost 0). The default share is 0.25 from those records.
//   (c) Two attempts are the search's business (grid-search.mjs, opts.attempts), not the
//       library's: ARC grades two tries per test input and the bench says how many it used.
//
// THE REFUSAL. A library is learned from the TRAINING split only. corpusFromVerdict() throws on
// any verdict whose split is not 'training' or that is marked heldOut, so the evaluation split's
// programs and test outputs can never reach a library that is then graded on the evaluation split.
import { PRIMS, LEARNERS, byName, defineMacro, expandName, macroNameOf } from './grid-dsl.mjs';

export const LIBRARY_DEFAULTS = Object.freeze({
  topN: 24,        // macros kept at most
  minLen: 2,       // shortest macro, in base primitives
  maxLen: 4,       // longest macro, in base primitives
  minTasks: 2,     // a macro must shorten the shortest program of at least this many solved tasks
  minNet: 1,       // and save at least this many steps net of its own length
  alpha: null,     // prior strength in pseudo counts; null means alphaFrac * N (N the corpus's own word count)
  alphaFrac: 1,    // alpha as a fraction of N when alpha is null: smaller trusts the data more, and a word the
                   // data never used pays log2(1 + 1 / alphaFrac) more (1 unit at 1, 3.17 at 1/8)
  scale: 4,        // cost quanta per unit (quarter units), so learned costs stay integers
  share: 0.25,     // the part of each task's clock the learned search gets, after the hand ordered search
                   // (chosen on the training development fold: 0.5 lost two late hand solves, 0.25 none)
});

const LEARNER_SET = new Set(LEARNERS.map((l) => l.name));
const BASE_INDEX = new Map(PRIMS.map((p, i) => [p.name, i]));
const r4 = (x) => Math.round(x * 1e4) / 1e4;

// ---------------------------------------------------------------- the corpus
/** One program's names split into its chain of base primitives and its learned last step. */
export function splitProgram(names) {
  const chain = [];
  let learner = null;
  for (let i = 0; i < names.length; i++) {
    const n = names[i];
    if (LEARNER_SET.has(n)) {
      if (i !== names.length - 1) return null;   // a learner is only ever the last step
      learner = n;
      break;
    }
    for (const b of expandName(n)) {
      if (!BASE_INDEX.has(b)) return null;      // a word this vocabulary does not have
      chain.push(b);
    }
  }
  return { chain, learner };
}

/**
 * The corpus from a TRAINING verdict of bench/grid.mjs: one row per solved task,
 * { id, programs: string[][] } where every program answered every test input of that task.
 * Rows carrying attempts (a two attempt run) contribute each attempt that was right on its own.
 * @param {object} v a parsed verdict
 * @param {{keep?: (id: string, index: number) => boolean}} [opts] keep a subset of tasks (index is
 *   the task's position in the verdict's rows, which bench/grid.mjs writes in sorted id order)
 */
export function corpusFromVerdict(v, { keep = null } = {}) {
  if (!v || v.split !== 'training' || v.heldOut) {
    throw new Error('grid-library: a library is learned from the TRAINING split only; refused a verdict of split ' + (v && v.split) + (v && v.heldOut ? ' (heldOut)' : ''));
  }
  const rows = [];
  (v.rows || []).forEach((r, index) => {
    if (keep && !keep(r.id, index)) return;
    const programs = [];
    if (r.arms && typeof r.arms === 'object') {
      // a library bar verdict (bench/grid.mjs --library): every arm's right attempts
      for (const a of Object.values(r.arms)) (a.attempts || []).forEach((t, k) => { if (a.attemptRight && a.attemptRight[k] && Array.isArray(t.names)) programs.push(t.names); });
    } else if (Array.isArray(r.attempts) && Array.isArray(r.attemptRight)) {
      r.attempts.forEach((a, k) => { if (r.attemptRight[k] && Array.isArray(a.names)) programs.push(a.names); });
    } else if (r.solved && Array.isArray(r.names)) programs.push(r.names);
    if (programs.length) rows.push({ id: r.id, programs });
  });
  return rows;
}

/** Merge corpora: programs of one task id are pooled, duplicates dropped. */
export function mergeCorpora(...lists) {
  const by = new Map();
  for (const list of lists) for (const row of list) {
    const e = by.get(row.id) || { id: row.id, programs: [], keys: new Set() };
    for (const p of row.programs) { const k = p.join('>'); if (!e.keys.has(k)) { e.keys.add(k); e.programs.push(p.slice()); } }
    by.set(row.id, e);
  }
  return [...by.values()].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)).map((e) => ({ id: e.id, programs: e.programs }));
}

// ---------------------------------------------------------------- segmentation
/**
 * The shortest way to write a chain with single words and the given macros (each macro a list of
 * base ops matching a contiguous window). Dynamic programming over positions.
 * @returns {{len: number, tokens: string[]}}
 */
export function segment(chain, macros) {
  const n = chain.length;
  const best = new Array(n + 1).fill(Infinity), from = new Array(n + 1).fill(null);
  best[0] = 0;
  for (let i = 0; i < n; i++) {
    if (best[i] === Infinity) continue;
    if (best[i] + 1 < best[i + 1]) { best[i + 1] = best[i] + 1; from[i + 1] = { at: i, token: chain[i] }; }
    for (const m of macros) {
      const L = m.ops.length;
      if (i + L > n || best[i] + 1 >= best[i + L]) continue;
      let ok = true;
      for (let k = 0; k < L; k++) if (chain[i + k] !== m.ops[k]) { ok = false; break; }
      if (ok) { best[i + L] = best[i] + 1; from[i + L] = { at: i, token: m.name }; }
    }
  }
  const tokens = [];
  for (let j = n; j > 0; j = from[j].at) tokens.push(from[j].token);
  tokens.reverse();
  return { len: best[n], tokens };
}

/** A task's shortest program under a library: its length in steps (learner counted) and its words. */
function shortest(task, macros) {
  let best = null;
  for (const p of task.progs) {
    const s = segment(p.chain, macros);
    const len = s.len + (p.learner ? 1 : 0);
    if (!best || len < best.len) best = { len, tokens: s.tokens, learner: p.learner };
  }
  return best;
}

function typesChain(ops) {
  for (let i = 1; i < ops.length; i++) if (byName(ops[i]).from !== byName(ops[i - 1]).to) return false;
  return true;
}
const handCost = (name) => expandName(name).reduce((s, b) => s + byName(b).cost, 0);

// ---------------------------------------------------------------- learning
/**
 * Learn a library from a corpus of solved training programs. Pure: registers nothing.
 * @param {{id: string, programs: string[][]}[]} corpus
 * @param {object} [opts] LIBRARY_DEFAULTS
 * @returns a plain JSON library: { macros, costs, counts, learnerOrder, stats }
 */
export function learnLibrary(corpus, opts = {}) {
  const o = { ...LIBRARY_DEFAULTS, ...opts };
  const tasks = [];
  let dropped = 0;
  for (const row of corpus) {
    const progs = row.programs.map(splitProgram).filter(Boolean);
    dropped += row.programs.length - progs.length;
    if (progs.length) tasks.push({ id: row.id, progs });
  }

  // candidates: every typed window of minLen to maxLen base primitives in any correct program
  const cand = new Map();
  for (const t of tasks) for (const p of t.progs) {
    for (let len = o.minLen; len <= o.maxLen; len++) for (let i = 0; i + len <= p.chain.length; i++) {
      const ops = p.chain.slice(i, i + len);
      const name = macroNameOf(ops);
      if (!cand.has(name) && typesChain(ops)) cand.set(name, ops);
    }
  }

  // greedy compression
  const chosen = [];
  let cur = tasks.map((t) => shortest(t, chosen).len);
  const before = cur.reduce((s, x) => s + x, 0);
  const scoreRows = [];
  while (chosen.length < o.topN) {
    let best = null;
    for (const [name, ops] of cand) {
      if (chosen.some((c) => c.name === name)) continue;
      const lib2 = chosen.concat([{ name, ops }]);
      let gross = 0, used = 0;
      for (let k = 0; k < tasks.length; k++) { const d = cur[k] - shortest(tasks[k], lib2).len; if (d > 0) { gross += d; used++; } }
      if (used < o.minTasks) continue;
      const net = gross - ops.length;
      if (net < o.minNet) continue;
      if (!best || net > best.net || (net === best.net && (used > best.tasks || (used === best.tasks && name < best.name)))) best = { name, ops, gross, net, tasks: used };
    }
    if (!best) break;
    chosen.push({ name: best.name, ops: best.ops });
    scoreRows.push(best);
    cur = tasks.map((t) => shortest(t, chosen).len);
  }
  const after = cur.reduce((s, x) => s + x, 0);

  // counts over each task's shortest program under the final library
  const counts = {};
  const learnerCounts = {};
  let N = 0;
  const usedBy = {};
  for (const t of tasks) {
    const s = shortest(t, chosen);
    for (const tok of s.tokens) { counts[tok] = (counts[tok] || 0) + 1; N++; (usedBy[tok] || (usedBy[tok] = [])).push(t.id); }
    if (s.learner) learnerCounts[s.learner] = (learnerCounts[s.learner] || 0) + 1;
  }

  // the learned costs: a Dirichlet posterior over the hand written prior (see the header)
  const Z = PRIMS.reduce((s, p) => s + 2 ** -p.cost, 0);
  const alpha = o.alpha === null || o.alpha === undefined ? Math.max(1, N) * o.alphaFrac : o.alpha;
  if (!(alpha > 0)) throw new Error('grid-library: alpha must be positive, got ' + alpha);
  const words = PRIMS.map((p) => p.name).concat(chosen.map((c) => c.name));
  const costs = {};
  const bits = {};
  for (const w of words) {
    const hand = handCost(w);
    const pi = 2 ** -hand / Z;
    const c = hand - Math.log2(1 + (counts[w] || 0) / (alpha * pi)) + Math.log2(1 + N / alpha);
    bits[w] = r4(c);
    costs[w] = Math.max(1, Math.round(c * o.scale));
  }
  const learnerOrder = LEARNERS.map((l, i) => ({ name: l.name, n: learnerCounts[l.name] || 0, i }))
    .sort((a, b) => b.n - a.n || a.i - b.i).map((x) => x.name);

  return {
    macros: chosen.map((c, i) => ({ name: c.name, ops: c.ops.slice(), from: byName(c.ops[0]).from, to: byName(c.ops[c.ops.length - 1]).to, gross: scoreRows[i].gross, net: scoreRows[i].net, tasks: scoreRows[i].tasks, count: counts[c.name] || 0, usedBy: (usedBy[c.name] || []).slice(), hand: handCost(c.name), cost: costs[c.name], costUnits: bits[c.name] })),
    costs, bits, counts, learnerCounts, learnerOrder,
    params: { topN: o.topN, minLen: o.minLen, maxLen: o.maxLen, minTasks: o.minTasks, minNet: o.minNet, alpha: r4(alpha), alphaFrac: o.alpha === null || o.alpha === undefined ? o.alphaFrac : null, scale: o.scale, share: o.share },
    stats: {
      tasks: tasks.length, programs: tasks.reduce((s, t) => s + t.progs.length, 0), droppedPrograms: dropped,
      candidates: cand.size, words: N, stepsBefore: before, stepsAfter: after, stepsSaved: before - after,
      definitionSteps: chosen.reduce((s, c) => s + c.ops.length, 0),
    },
  };
}

// ---------------------------------------------------------------- the search side
/**
 * Register a learned library's macros in grid-dsl.mjs and build what grid-search.mjs searchGrid
 * takes as opts.library: every base primitive and every macro with its learned cost, in the
 * learned order (cheaper first, then more used, then the vocabulary's own order), and the
 * learners in the learned order. Works on the JSON learnLibrary() returns, so a worker thread
 * can rebuild the same library from workerData.
 */
export function buildSearchLibrary(lib) {
  const macroPrims = (lib.macros || []).map((m) => defineMacro(m.ops));
  const entry = (p, i) => {
    const cost = lib.costs && Number.isInteger(lib.costs[p.name]) && lib.costs[p.name] >= 1 ? lib.costs[p.name] : null;
    if (cost === null) throw new Error('grid-library: no learned cost for ' + p.name);
    return { name: p.name, from: p.from, to: p.to, cost, apply: p.apply, macro: !!p.macro, n: (lib.counts && lib.counts[p.name]) || 0, i };
  };
  const vocab = PRIMS.map(entry).concat(macroPrims.map((p, k) => entry(p, PRIMS.length + k)));
  vocab.sort((a, b) => a.cost - b.cost || b.n - a.n || a.i - b.i);
  const order = new Map((lib.learnerOrder || LEARNERS.map((l) => l.name)).map((n, i) => [n, i]));
  const learners = LEARNERS.slice().sort((a, b) => (order.get(a.name) ?? 99) - (order.get(b.name) ?? 99));
  return {
    vocab: Object.freeze(vocab),
    fast: learners.filter((l) => l.name === 'colormap'),
    slow: learners.filter((l) => l.name !== 'colormap'),
    macros: macroPrims.map((p) => p.name),
    share: lib.params && typeof lib.params.share === 'number' ? lib.params.share : 0,
  };
}

/** True when a program's names use a macro (a composed word). */
export function macrosUsed(names) { return (names || []).filter((n) => expandName(n).length > 1); }
