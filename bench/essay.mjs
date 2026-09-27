// bench/essay.mjs: THE ESSAY BAR. Can the organism write a complex essay, measured by a judge that is
// NAMED, printed rule by rule, and written down before any number was quoted.
//
// His order 38 (2026-09-27, docs/VISION.md): "Also it cant code or write complex essays right? Like
// basiaclly i want to make it better than you out of countless self itterations". The order's status
// said no essay bar existed and that one would be designed with a NAMED judge before any number. This
// is that bar. Author: board 26 builder (item essay-bar).
//
// THE JUDGE, "rubric-v1": deterministic, no model, no socket. Seven rules, each a fraction in [0, 1]
// times its weight, weights summing to 100 (RUBRIC below prints every one). It is the shape published
// automated essay scoring takes (surface features of organisation, development, length and cohesion,
// related to a score) and it carries that approach's published limit: it reads FORM, not truth and
// not argument. A text that meets every rule can still be false, dull or unargued. Les Perelman's
// BABEL generator (2014) got nonsense essays high scores from engines of this family, and "they cannot
// check facts" is the sentence the critics repeat. That is why the bar is a COMPARISON with a control
// that games the rubric on purpose, and never the organism's score alone.
//
// THE COHERENCE PROXY is adjacent sentence content word overlap: the share of neighbouring sentence
// pairs that share at least one content word. It is the deterministic, lexical stand in for the latent
// semantic analysis similarity between neighbouring sentences that automated essay scoring systems use
// for coherence; it rewards a text that keeps talking about the same things and cannot see whether
// the order of its sentences makes sense.
//
// THE PROMPTS, bench/essay-prompts.json: forty prompts written for this bench, each a public domain
// topic, a required stance and four to six given facts the essay must use word for word. The split is
// SEEDED: splitIds() shuffles the sorted ids on splitSeed and the first twenty are development, the
// rest held out; test/essay.test.mjs recomputes it from the seed and compares it to the file.
//
// THE ARMS, interleaved prompt by prompt with the first arm rotating (bench/code.mjs's plan):
//   organism  act/prompt.mjs ask() with --provider (null by default: no socket, no model). With the
//             model off the organism holds nothing about these topics, so it answers with its memory
//             miss; the judge scores whatever text it gives, and the share of such answers is printed
//             as the ABSTENTION share. --provider ollama sends the organism through the model cell (the
//             orchestrator's rung, later); a model cell that is not reached is ABSENT, never a zero.
//   template  THE CONTROL: a fixed skeleton that slots the stance and the facts in and writes nothing
//             of its own. It is what a rubric can be gamed by, so beating it is the bar.
//   null      the prompt echoed back. It says how much of any score is the prompt copied.
//
// THE BAR: on the twenty HELD OUT prompts, three seeds of prompt order, the organism's mean score is
// above the template's by more than the seed band (the largest spread of either arm's per seed mean).
// With the model off the honest landing is barMet false.
//
// ONE FILE NAMES THE BAR. Only a run of the bar's shape (all three arms, all twenty held out prompts, at
// least three seeds) writes bench/verdicts/essay.json; anything narrower writes
// bench/verdicts/essay-<provider>-partial.json and says isTheBar false. An unknown flag runs nothing.
//
//   node bench/essay.mjs [--provider null|ollama|env] [--model m] [--base url] [--seeds 3]
//                        [--limit N] [--arms organism,template,null] [--maxTokens n]
//                        [--timeoutMs ms] [--probeMs ms] [--quiet] [--json] [--nowrite] [--help]
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RNG } from '../core/rng.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const PROMPTS_FILE = path.join(HERE, 'essay-prompts.json');
export const VERDICTS = Object.freeze({
  bar: 'bench/verdicts/essay.json',
  partial: (provider) => 'bench/verdicts/essay-' + provider + '-partial.json',
});
const abs = (rel) => path.join(HERE, '..', rel);

export const ARMS = Object.freeze(['organism', 'template', 'null']);
export const CONTROL = 'template';
export const PROVIDERS = Object.freeze(['null', 'ollama', 'env']);
export const SPLIT_SEED = 'essay-split-2026-09-27';
export const ORDER_SEEDS = Object.freeze(['essay-order-1', 'essay-order-2', 'essay-order-3', 'essay-order-4', 'essay-order-5']);

const r2 = (x) => Math.round(x * 100) / 100;
const r4 = (x) => Math.round(x * 10000) / 10000;
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

// ---------------------------------------------------------------- the judge, rubric-v1
export const JUDGE = 'rubric-v1';
export const LENGTH_BAND = Object.freeze({ min: 300, max: 1200 });
export const MIN_PARAGRAPHS = 4;
export const STANCE_COVER = 0.6;
export const COHERENCE_TARGET = 0.6;
export const COHERENCE_PROXY = 'adjacent sentence content word overlap: the share of neighbouring sentence pairs (across the whole essay, in order) that share at least one content word; the lexical stand in for the latent semantic analysis neighbour similarity automated essay scoring uses for coherence';

/** Every rule, its weight and what it asks, in the order the breakdown prints them. Weights sum to 100. */
export const RUBRIC = Object.freeze([
  Object.freeze({ id: 'thesis', weight: 20, rule: 'a sentence of the FIRST paragraph states the stance: it holds at least ' + STANCE_COVER * 100 + '% of the stance\'s content words (all or nothing)' }),
  Object.freeze({ id: 'paragraphs', weight: 10, rule: 'at least ' + MIN_PARAGRAPHS + ' paragraphs separated by blank lines (fraction: paragraphs / ' + MIN_PARAGRAPHS + ', capped at 1)' }),
  Object.freeze({ id: 'facts', weight: 25, rule: 'each given fact is used: its normalised text appears in the normalised essay (fraction: facts used / facts given)' }),
  Object.freeze({ id: 'noRepeat', weight: 10, rule: 'no sentence is repeated, normalised; needs at least 2 sentences, so an empty or one line text earns nothing here (all or nothing)' }),
  Object.freeze({ id: 'length', weight: 10, rule: 'the word count is inside ' + LENGTH_BAND.min + ' to ' + LENGTH_BAND.max + ' (fraction: words / ' + LENGTH_BAND.min + ' below the band, ' + LENGTH_BAND.max + ' / words above it)' }),
  Object.freeze({ id: 'closing', weight: 15, rule: 'the LAST paragraph, a different paragraph from the first, has a sentence that restates the stance by the thesis rule (all or nothing)' }),
  Object.freeze({ id: 'coherence', weight: 10, rule: 'coherence proxy, ' + COHERENCE_PROXY + ' (fraction: share / ' + COHERENCE_TARGET + ', capped at 1; fewer than 2 sentences earn nothing)' }),
]);
export const WEIGHT_TOTAL = RUBRIC.reduce((n, r) => n + r.weight, 0);

// Function words that carry no topic. Short and fixed, printed with the judge, never tuned on a score.
export const STOP = Object.freeze(new Set((
  'the a an and or but nor for so yet of to in on at by with from into onto upon over under about above below '
  + 'after before between through during without within than then that this these those there here it its '
  + 'is are was were be been being am do does did done has have had having will would shall should can could '
  + 'may might must not no any all each every some more most much many other such own same very too also just '
  + 'only as if when while where which who whom whose what why how their them they his her him she he we us our '
  + 'you your one two first second third fourth fifth sixth essay argue argues argued position conclusion fact facts'
).split(/\s+/)));

/** Lower case, accents removed, every run of characters that is not a letter or a digit one space. */
export function normalize(s) {
  return String(s ?? '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/** A crude stem: ies to y, a final s dropped (never ss). Enough to meet "invention" and "inventions". */
export function stem(w) {
  if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
}

/** The content words of a text: normalised tokens of 3 or more characters that are not in STOP, stemmed. */
export function contentWords(s) {
  const out = new Set();
  for (const w of normalize(s).split(' ')) if (w.length >= 3 && !STOP.has(w)) out.add(stem(w));
  return out;
}

/** Paragraphs: split on blank lines; a paragraph with no letter or digit is not one. */
export function paragraphsOf(text) {
  return String(text ?? '').replace(/\r\n?/g, '\n').split(/\n[ \t]*\n+/).map((p) => p.trim()).filter((p) => normalize(p).length > 0);
}

/** Sentences: split after . ! ? and at every line break; a sentence with no letter or digit is not one. */
export function sentencesOf(paragraph) {
  return String(paragraph ?? '').split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter((s) => normalize(s).length > 0);
}

/** How much of the stance one sentence holds: the share of the stance's content words it contains. */
export function stanceCover(sentence, stance) {
  const want = contentWords(stance);
  if (!want.size) return 0;
  const have = contentWords(sentence);
  let n = 0;
  for (const w of want) if (have.has(w)) n++;
  return n / want.size;
}

/** Does this normalised essay contain this fact, on word boundaries? */
export function usesFact(normEssay, fact) {
  const f = normalize(fact);
  return f.length > 0 && (' ' + normEssay + ' ').includes(' ' + f + ' ');
}

/**
 * Score one text against one prompt with rubric-v1.
 * @param {string} text the essay
 * @param {object} prompt { stance, facts }
 * @returns {{judge, score, rules: object, stats: object}} score 0 to 100; rules[id] = { fraction, points, weight, ... }
 */
export function judge(text, prompt) {
  const paras = paragraphsOf(text);
  const sentsByPara = paras.map(sentencesOf);
  const sents = sentsByPara.flat();
  const norm = normalize(text);
  const words = norm ? norm.split(' ').length : 0;
  const facts = Array.isArray(prompt && prompt.facts) ? prompt.facts : [];
  const stance = String((prompt && prompt.stance) || '');

  const bestCover = (list) => list.reduce((m, s) => Math.max(m, stanceCover(s, stance)), 0);
  const firstCover = paras.length ? bestCover(sentsByPara[0]) : 0;
  const lastCover = paras.length >= 2 ? bestCover(sentsByPara[sentsByPara.length - 1]) : 0;
  const used = facts.filter((f) => usesFact(norm, f));
  const normSents = sents.map(normalize);
  const distinct = new Set(normSents).size;
  const repeated = normSents.length - distinct;
  let pairs = 0, linked = 0;
  for (let i = 1; i < sents.length; i++) {
    pairs++;
    const a = contentWords(sents[i - 1]), b = contentWords(sents[i]);
    for (const w of a) if (b.has(w)) { linked++; break; }
  }
  const share = pairs ? linked / pairs : 0;
  const lengthFraction = words === 0 ? 0
    : words < LENGTH_BAND.min ? words / LENGTH_BAND.min
      : words > LENGTH_BAND.max ? LENGTH_BAND.max / words : 1;

  const fraction = {
    thesis: firstCover >= STANCE_COVER ? 1 : 0,
    paragraphs: Math.min(1, paras.length / MIN_PARAGRAPHS),
    facts: facts.length ? used.length / facts.length : 0,
    noRepeat: sents.length >= 2 && repeated === 0 ? 1 : 0,
    length: lengthFraction,
    closing: lastCover >= STANCE_COVER ? 1 : 0,
    coherence: pairs ? Math.min(1, share / COHERENCE_TARGET) : 0,
  };
  const detail = {
    thesis: { stanceCover: r4(firstCover) },
    paragraphs: { paragraphs: paras.length },
    facts: { used: used.length, given: facts.length, missing: facts.filter((f) => !used.includes(f)) },
    noRepeat: { sentences: sents.length, repeated },
    length: { words },
    closing: { stanceCover: r4(lastCover) },
    coherence: { pairs, linked, share: r4(share) },
  };
  const rules = {};
  let score = 0;
  for (const r of RUBRIC) {
    const pts = fraction[r.id] * r.weight;
    score += pts;
    rules[r.id] = { fraction: r4(fraction[r.id]), points: r2(pts), weight: r.weight, ...detail[r.id] };
  }
  return { judge: JUDGE, score: r2(score), rules, stats: { words, paragraphs: paras.length, sentences: sents.length } };
}

/** The rules a judged text did not fully meet, by id. */
export const unmet = (j) => RUBRIC.filter((r) => j.rules[r.id].fraction < 1).map((r) => r.id);

// ---------------------------------------------------------------- the prompts
/** The text every arm is given (the null arm echoes exactly this). The rubric is told to the writer. */
export function promptText(p) {
  return [
    'Write an essay on ' + p.topic + '.',
    'Argue this position: ' + p.stance + '.',
    'Use each of these facts, word for word: ' + p.facts.join('; ') + '.',
    'Write between ' + LENGTH_BAND.min + ' and ' + LENGTH_BAND.max + ' words in at least four paragraphs separated by blank lines. State the position in the first paragraph and restate it in the last paragraph.',
  ].join('\n');
}

/** The seeded split: the sorted ids shuffled on the seed, the first half development, the rest held out. */
export function splitIds(ids, seed = SPLIT_SEED) {
  const order = new RNG('essay-split/' + seed).shuffle([...ids].sort());
  const half = Math.floor(order.length / 2);
  return { development: order.slice(0, half).sort(), heldOut: order.slice(half).sort() };
}

export function loadPrompts(file = PROMPTS_FILE) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

/** What the essay bar developed on and what it graded. */
export function splitFor(set, opts = {}) {
  const dev = set.prompts.filter((p) => p.split === 'development').map((p) => p.id);
  const held = set.prompts.filter((p) => p.split === 'heldOut').map((p) => p.id);
  return {
    seed: set.splitSeed,
    rule: 'splitIds(): the sorted ids shuffled by core/rng.mjs on the seed; the first half development, the rest held out',
    development: { what: 'the prompts the judge\'s thresholds, the template skeleton and the planted test essays were checked against; one seed of order, reported beside the bar and never part of it', n: dev.length, ids: dev },
    heldOut: { what: 'the prompts the bar is graded on, over ' + (opts.seeds ?? 3) + ' seeds of prompt order; no threshold of rubric-v1 was set by looking at a score on them', n: held.length, ids: held, graded: opts.heldOutGraded ?? null },
    contaminated: false,
    note: 'both halves were written by one author in one sitting for this bench, so they are one population; the split guards the judge and the template from being tuned on the graded prompts, not the prompts from their author',
  };
}

// ---------------------------------------------------------------- the arms
const ORDINALS = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth'];

/** THE CONTROL: a fixed skeleton. It slots the stance and the facts in and writes nothing of its own. */
export function templateEssay(p) {
  const facts = p.facts;
  const cut = Math.ceil(facts.length / 2);
  const body = (list, from) => list.map((f, i) => ORDINALS[from + i] + ', ' + f + '. This fact supports the argument.').join(' ');
  return [
    'This essay is about ' + p.topic + '. It argues that ' + p.stance + '.',
    body(facts.slice(0, cut), 0),
    body(facts.slice(cut), cut),
    'In conclusion, ' + p.stance + '.',
  ].join('\n\n');
}

/** The null arm: the prompt echoed. */
export const echoEssay = (p) => promptText(p);

/** The arm order for each of n prompts: all three every time, the first arm rotating. */
export function planArms(n, arms = ARMS) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const k = i % arms.length;
    out.push([...arms.slice(k), ...arms.slice(0, k)]);
  }
  return out;
}

/** The bar as a pure function: met only when the organism is present and its gap over the control exceeds the band. */
export function barFrom({ organism, template, band }) {
  if (!Number.isFinite(organism) || !Number.isFinite(template) || !Number.isFinite(band)) return { met: false, gap: null, why: 'an arm is absent' };
  const gap = r2(organism - template);
  return { met: gap > band, gap, why: gap > band ? 'the organism is above the template by ' + gap + ', more than the band ' + band : 'the organism is ' + (gap >= 0 ? 'above' : 'below') + ' the template by ' + Math.abs(gap) + ', which is not more than the band ' + band };
}

// The organism, one ask. Imported lazily so the judge and its tests never load the ask path.
async function organismEssay(brain, p, cfg) {
  const { ask } = await import('../act/prompt.mjs');
  const a = await ask(brain, promptText(p), {
    provider: cfg.provider, knowledge: false,
    ...(cfg.model ? { model: cfg.model } : {}), ...(cfg.base ? { base: cfg.base } : {}),
    ...(Number.isFinite(cfg.maxTokens) ? { maxTokens: cfg.maxTokens } : {}),
    ...(Number.isFinite(cfg.timeoutMs) ? { timeoutMs: cfg.timeoutMs } : {}),
    ...(Number.isFinite(cfg.probeMs) ? { probeMs: cfg.probeMs } : {}),
  });
  const pv = a.provenance || {};
  const l = pv.llm || {};
  const abstained = a.from === 'memory' && (pv.memoryHits ?? 0) === 0 && (pv.webPages ?? 0) === 0;
  // A model cell that was asked for and not reached is an absent arm on this prompt, never a zero.
  if (cfg.provider !== 'null' && a.from !== 'llm' && !(l.ok && l.provider === cfg.provider)) {
    return { absent: true, reason: l.reason || 'the ' + cfg.provider + ' model cell did not answer', text: a.text, from: a.from };
  }
  return { absent: false, text: a.text, from: a.from, provenance: pv.answer || null, abstained, provider: l.provider ?? null };
}

async function newBrain(tag) {
  const { Brain } = await import('../core/brain.mjs');
  const { attachMemory } = await import('../memory/index.mjs');
  // One brain per seed, the shape bench/public.mjs builds, with NOTHING in its memory: an essay on a
  // prompt's topic in memory before that prompt is graded would be the answer key, not recall.
  const brain = new Brain({ name: 'essay-' + tag, ledger: 'full', pruneEvery: 0 });
  attachMemory(brain, { name: 'essay-' + tag });
  return brain;
}

// ---------------------------------------------------------------- the run
function summarize(rows, arm) {
  const mine = rows.filter((r) => r.arm === arm);
  const graded = mine.filter((r) => !r.absent);
  const perRule = {};
  for (const rule of RUBRIC) perRule[rule.id] = graded.length ? r2(mean(graded.map((r) => r.rules[rule.id].points))) : null;
  return {
    asked: mine.length, graded: graded.length, absent: mine.length - graded.length,
    mean: graded.length ? r2(mean(graded.map((r) => r.score))) : null,
    min: graded.length ? Math.min(...graded.map((r) => r.score)) : null,
    max: graded.length ? Math.max(...graded.map((r) => r.score)) : null,
    perRule,
    abstentionShare: arm === 'organism' && graded.length ? r4(graded.filter((r) => r.abstained).length / graded.length) : null,
    // Which tier of ask() wrote the organism's text: memory (the miss), program (an induced program), llm, exact...
    answeredBy: arm === 'organism' ? graded.reduce((m, r) => (m[r.from] = (m[r.from] || 0) + 1, m), {}) : null,
  };
}

async function runPass(prompts, seedTag, arms, cfg, brainTag) {
  const order = seedTag ? new RNG('essay-order/' + seedTag).shuffle([...prompts]) : [...prompts];
  const plan = planArms(order.length, ARMS);
  const brain = arms.includes('organism') ? await newBrain(brainTag) : null;
  const rows = [];
  for (let i = 0; i < order.length; i++) {
    const p = order[i];
    for (const arm of plan[i]) {
      if (!arms.includes(arm)) continue;
      const t0 = performance.now();
      let text, extra = {};
      if (arm === 'template') text = templateEssay(p);
      else if (arm === 'null') text = echoEssay(p);
      else {
        if (cfg.organismDown) { rows.push({ seed: seedTag, i, id: p.id, arm, absent: true, reason: cfg.organismDown }); continue; }
        const o = await organismEssay(brain, p, cfg);
        if (o.absent) { rows.push({ seed: seedTag, i, id: p.id, arm, absent: true, reason: o.reason }); continue; }
        text = o.text;
        extra = { abstained: o.abstained, from: o.from, provenance: o.provenance };
      }
      const j = judge(text, p);
      rows.push({ seed: seedTag, i, id: p.id, arm, absent: false, score: j.score, rules: j.rules, words: j.stats.words, ms: r2(performance.now() - t0), ...extra, ...(arm === 'organism' && i === 0 ? { firstText: text.slice(0, 400) } : {}) });
    }
  }
  return rows;
}

export async function run(opts = {}) {
  const t0 = Date.now();
  const quiet = !!opts.quiet;
  const provider = opts.provider === undefined || opts.provider === null ? 'null' : String(opts.provider);
  if (!PROVIDERS.includes(provider)) throw new Error('--provider takes ' + PROVIDERS.join(', ') + '; got ' + provider);
  const nSeeds = Number.isFinite(opts.seeds) ? Math.floor(opts.seeds) : 3;
  if (nSeeds < 1 || nSeeds > ORDER_SEEDS.length) throw new Error('--seeds takes 1 to ' + ORDER_SEEDS.length);
  const arms = opts.arms ? String(opts.arms).split(',').map((s) => s.trim()).filter((a) => ARMS.includes(a)) : [...ARMS];
  if (!arms.length) throw new Error('--arms takes ' + ARMS.join(', ') + ' (comma separated)');
  const set = opts.set || loadPrompts();
  const dev = set.prompts.filter((p) => p.split === 'development');
  let held = set.prompts.filter((p) => p.split === 'heldOut');
  const heldTotal = held.length;
  if (opts.limit > 0) held = held.slice(0, opts.limit);
  const seeds = ORDER_SEEDS.slice(0, nSeeds);
  const cfg = { provider, model: opts.model || null, base: opts.base || null, maxTokens: opts.maxTokens, timeoutMs: opts.timeoutMs, probeMs: opts.probeMs, organismDown: null };

  // The socket is opened only when a model provider was asked for by name. The default run never probes.
  if (arms.includes('organism') && provider === 'ollama') {
    const { probeOllama, OLLAMA_BASE } = await import('../act/llm.mjs');
    const base = cfg.base || OLLAMA_BASE;
    const up = await probeOllama(base, Number.isFinite(cfg.probeMs) ? cfg.probeMs : 1500);
    if (!up) cfg.organismDown = 'no ollama at ' + base + ': /api/tags did not answer';
  }

  if (!quiet) {
    console.log('\nESSAY BAR: judge ' + JUDGE + ' (deterministic, no model), ' + set.prompts.length + ' prompts, development ' + dev.length + ', held out ' + held.length + ' of ' + heldTotal + ', seeds of order ' + seeds.length);
    console.log('organism provider ' + provider + (provider === 'null' ? ' (no socket, no model)' : '') + '; control ' + CONTROL + ' (a fixed skeleton); null is the prompt echoed');
    console.log('\nrubric-v1, every rule and its weight (total ' + WEIGHT_TOTAL + '):');
    for (const r of RUBRIC) console.log('  ' + String(r.weight).padStart(3) + '  ' + r.id.padEnd(11) + r.rule);
  }

  const devRows = await runPass(dev, null, arms, cfg, 'dev');
  const heldRows = [];
  const bySeed = {};
  for (const s of seeds) {
    const rows = await runPass(held, s, arms, cfg, s);
    heldRows.push(...rows);
    bySeed[s] = {};
    for (const arm of ARMS) bySeed[s][arm] = arms.includes(arm) ? summarize(rows, arm).mean : null;
  }

  const armStats = {};
  for (const arm of ARMS) {
    const perSeed = seeds.map((s) => bySeed[s][arm]).filter((x) => Number.isFinite(x));
    const spread = perSeed.length ? r2(Math.max(...perSeed) - Math.min(...perSeed)) : null;
    armStats[arm] = {
      selected: arms.includes(arm),
      heldOut: { ...summarize(heldRows, arm), bySeed: Object.fromEntries(seeds.map((s) => [s, bySeed[s][arm]])), seedMean: perSeed.length === seeds.length ? r2(mean(perSeed)) : null, seedSpread: spread },
      development: summarize(devRows, arm),
    };
  }
  const spreads = ['organism', CONTROL].map((a) => armStats[a].heldOut.seedSpread).filter((x) => Number.isFinite(x));
  const band = spreads.length === 2 ? Math.max(...spreads) : null;
  const bar = barFrom({ organism: armStats.organism.heldOut.seedMean, template: armStats[CONTROL].heldOut.seedMean, band });

  const heldIds = new Set(held.map((p) => p.id));
  const devIds = new Set(dev.map((p) => p.id));
  const empty = judge('', set.prompts[0]).score;
  const templUnmet = held.map((p) => unmet(judge(templateEssay(p), p)));
  const checks = {
    weightsSumTo100: WEIGHT_TOTAL === 100,
    splitDisjoint: [...heldIds].every((id) => !devIds.has(id)),
    barRowsAreHeldOutOnly: heldRows.every((r) => heldIds.has(r.id)),
    everyPromptGotEverySelectedArm: seeds.every((s) => held.every((p) => arms.every((a) => heldRows.some((r) => r.seed === s && r.id === p.id && r.arm === a)))),
    emptyTextScoresZero: empty === 0,
    templateBelow100OnEveryHeldOutPrompt: held.every((p) => judge(templateEssay(p), p).score < 100),
    armsRotated: planArms(held.length).some((p, i) => i > 0 && p[0] !== planArms(held.length)[i - 1][0]),
    absentRowsCarryAReason: [...devRows, ...heldRows].every((r) => !r.absent || !!r.reason),
  };
  const full = arms.length === ARMS.length && held.length === heldTotal && nSeeds >= 3;
  const isTheBar = full && Object.values(checks).every(Boolean);
  const wroteTo = isTheBar ? VERDICTS.bar : VERDICTS.partial(provider);
  const o = armStats.organism.heldOut, t = armStats.template.heldOut, n = armStats.null.heldOut;
  const statement = (o.seedMean === null || t.seedMean === null)
    ? 'The essay bar compares the organism with a template that games the rubric; this run did not grade both of them on the held out prompts, so it states no comparison.'
    : 'On ' + held.length + ' held out essay prompts over ' + seeds.length + ' orders, the deterministic judge ' + JUDGE
      + ' (seven form rules, weights summing to 100) gave the organism ' + o.seedMean + ' of 100'
      + (provider === 'null' ? ' with no language model attached, abstaining (its memory miss) on ' + (o.abstentionShare * 100).toFixed(2) + '% of prompt runs; the tiers of ask() that wrote its text were ' + Object.entries(o.answeredBy || {}).map(([k, v]) => k + ' ' + v).join(', ') + ' of ' + o.graded + ' runs, none of them an essay' : ' through the ' + provider + ' model cell')
      + ', against ' + t.seedMean + ' for the control, a fixed skeleton that only slots the given stance and facts in, and ' + (n.seedMean ?? 'absent') + ' for the prompt echoed back.'
      + ' The bar needs the organism above the control by more than the seed band of ' + band + ' points; ' + bar.why + ', so the bar is ' + (bar.met ? 'met' : 'not met') + '.'
      + ' The judge measures form only (a stated thesis, paragraphs, the facts present, no repeats, length, a restated close, neighbouring sentences sharing words): it cannot tell a true essay from a false one or a good argument from a bad one, which is why the control that games it sets the bar.';

  const verdict = {
    at: new Date().toISOString(),
    command: 'node bench/essay.mjs' + (provider !== 'null' ? ' --provider ' + provider : '') + (opts.model ? ' --model ' + opts.model : '')
      + (nSeeds !== 3 ? ' --seeds ' + nSeeds : '') + (opts.limit ? ' --limit ' + opts.limit : '') + (arms.length < ARMS.length ? ' --arms ' + arms.join(',') : ''),
    node: process.version,
    isTheBar,
    barMet: isTheBar && bar.met,
    notTheBarBecause: isTheBar ? null : (!full ? 'narrow: arms ' + arms.join(',') + ', held out ' + held.length + ' of ' + heldTotal + ', seeds ' + nSeeds : 'a structural check failed: ' + Object.entries(checks).filter(([, v]) => !v).map(([k]) => k).join(', ')),
    wroteTo,
    judge: {
      name: JUDGE, deterministic: true, model: null, weightTotal: WEIGHT_TOTAL,
      rules: RUBRIC.map((r) => ({ id: r.id, weight: r.weight, rule: r.rule })),
      coherenceProxy: COHERENCE_PROXY,
      stopWords: STOP.size,
      measures: 'form: a stated thesis, paragraphing, the given facts present word for word, no repeated sentence, a length band, a restated close, neighbouring sentences sharing content words',
      doesNotMeasure: 'truth, the quality of the argument, whether the facts are used to support the stance, style, grammar, or whether the sentence order makes sense',
      publishedLimit: 'engines of this family score surface features and can be gamed: Perelman\'s BABEL generator (2014) got nonsense essays high scores from e-rater, and such engines cannot check facts or meaning',
    },
    control: { arm: CONTROL, what: 'a fixed skeleton: an opening that states the topic and the stance, two body paragraphs that list the given facts each followed by the same boilerplate sentence, and a one sentence close that repeats the stance', why: 'it games every rule a skeleton can meet, so a score above it is a score the rubric could not have given for free' },
    nullArm: 'the prompt text echoed back unchanged: how much of any score is the prompt copied',
    provider, model: provider === 'null' ? null : (opts.model || 'the act/llm.mjs default'),
    split: splitFor(set, { seeds: seeds.length, heldOutGraded: held.length }),
    seeds, band, bandRule: 'the larger of the organism\'s and the template\'s spread (max minus min) of per seed held out means',
    barRule: 'organism held out mean over the seeds minus template held out mean over the seeds, greater than the band',
    gap: bar.gap,
    arms: armStats,
    checks,
    ms: Date.now() - t0,
    statement,
    rows: { development: devRows, heldOut: heldRows },
  };
  if (opts.write !== false) {
    mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
    writeFileSync(abs(wroteTo), JSON.stringify(verdict, null, 2) + '\n');
  }

  if (!quiet) {
    console.log('\n' + 'arm'.padEnd(10) + 'split'.padEnd(10) + 'mean'.padStart(8) + 'min'.padStart(8) + 'max'.padStart(8) + '  per seed' + '  |  per rule (mean points)');
    console.log('-'.repeat(120));
    for (const arm of ARMS) {
      const a = armStats[arm];
      if (!a.selected) { console.log(arm.padEnd(10) + 'not selected'); continue; }
      const line = (s, name, seedsTxt) => arm.padEnd(10) + name.padEnd(10) + String(s.mean ?? 'absent').padStart(8) + String(s.min ?? '-').padStart(8) + String(s.max ?? '-').padStart(8)
        + '  ' + seedsTxt + '  |  ' + RUBRIC.map((r) => r.id + ' ' + s.perRule[r.id]).join(', ');
      console.log(line(a.heldOut, 'heldOut', seeds.map((s) => a.heldOut.bySeed[s]).join('/')));
      console.log(line(a.development, 'dev', '-'));
    }
    console.log('\norganism abstention share: held out ' + (o.abstentionShare === null ? 'absent' : (o.abstentionShare * 100).toFixed(2) + '%') + ', development ' + (armStats.organism.development.abstentionShare === null ? 'absent' : (armStats.organism.development.abstentionShare * 100).toFixed(2) + '%'));
    console.log('organism answered by (tier of ask()): held out ' + JSON.stringify(o.answeredBy) + ', development ' + JSON.stringify(armStats.organism.development.answeredBy));
    console.log('held out means over ' + seeds.length + ' seeds: organism ' + o.seedMean + ', template ' + t.seedMean + ' (control), null ' + n.seedMean + '; seed band ' + band + '; gap ' + bar.gap);
    console.log('checks: ' + Object.entries(checks).map(([k, v]) => k + ' ' + v).join(', '));
    console.log('\n' + statement + '\n');
  }
  return verdict;
}

// ---------------------------------------------------------------- cli
export const FLAGS = Object.freeze({
  provider: 'string', model: 'string', base: 'string', arms: 'string',
  seeds: 'number', limit: 'number', maxTokens: 'number', timeoutMs: 'number', probeMs: 'number',
  quiet: 'bool', json: 'bool', nowrite: 'bool', help: 'bool',
});

export const USAGE = [
  'node bench/essay.mjs [--provider null|ollama|env] [--model m] [--base url] [--seeds 3]',
  '                     [--limit N] [--arms organism,template,null] [--maxTokens n]',
  '                     [--timeoutMs ms] [--probeMs ms] [--quiet] [--json] [--nowrite] [--help]',
  '',
  'Only a run of all three arms over all held out prompts at 3 or more seeds writes ' + VERDICTS.bar + '.',
  'Anything narrower writes ' + VERDICTS.partial('<provider>') + ' with isTheBar false.',
  '--provider null (the default) opens no socket; ollama or env send the organism arm through that model cell.',
].join('\n');

/** The parsed flags and everything wrong with them; the caller runs nothing when bad is not empty. */
export function args(argv) {
  const out = {}, bad = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { bad.push('stray argument ' + JSON.stringify(a)); continue; }
    const k = a.slice(2);
    const kind = FLAGS[k];
    if (!kind) { bad.push('unknown flag --' + k); continue; }
    const v = argv[i + 1];
    const bare = v === undefined || v.startsWith('--');
    if (kind === 'bool') { out[k] = true; continue; }
    if (bare) { bad.push('--' + k + ' needs a value'); continue; }
    i++;
    if (kind === 'number') {
      if (!/^\d+$/.test(v)) { bad.push('--' + k + ' needs a whole number, got ' + JSON.stringify(v)); continue; }
      out[k] = Number(v);
      continue;
    }
    out[k] = v;
  }
  if (out.provider !== undefined && !PROVIDERS.includes(out.provider)) bad.push('--provider takes ' + PROVIDERS.join(', ') + ', got ' + JSON.stringify(out.provider));
  return { opts: out, bad };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const parsed = args(process.argv.slice(2));
  const a = parsed.opts;
  if (parsed.bad.length) {
    console.error('bench/essay.mjs ran nothing, because of ' + parsed.bad.length + ': ' + parsed.bad.join('; ') + '\n\n' + USAGE);
    process.exitCode = 2;
  } else if (a.help) {
    console.log(USAGE);
  } else {
    const v = await run({
      provider: a.provider, model: a.model, base: a.base, arms: a.arms, seeds: a.seeds, limit: a.limit || 0,
      maxTokens: a.maxTokens, timeoutMs: a.timeoutMs, probeMs: a.probeMs, quiet: !!a.quiet, write: !a.nowrite,
    });
    if (a.json) console.log(JSON.stringify(v, null, 2));
    console.log('ESSAY isTheBar ' + v.isTheBar + ' barMet ' + v.barMet + ': organism ' + v.arms.organism.heldOut.seedMean
      + ', template ' + v.arms.template.heldOut.seedMean + ', null ' + v.arms.null.heldOut.seedMean + ', band ' + v.band + ', gap ' + v.gap
      + ', ' + v.ms + 'ms' + (a.nowrite ? ', nothing written (--nowrite)' : ', verdict written to ' + v.wroteTo)
      + (v.notTheBarBecause ? '. THIS IS NOT THE BAR: ' + v.notTheBarBecause : ''));
    if (!Object.values(v.checks).every(Boolean)) process.exitCode = 1;
  }
}
