#!/usr/bin/env node
// grow/cortex.mjs: the CORTEX-POINTER RULE (his plan, verbatim: "The floor rises with the cortex. When a stronger model
// ships, the cortex pointer moves to it, but only once it beats the current one on the held-out tasks."). The cortex is
// the model whose arms write the cells (GROW.md step 2). The ledger is grown/cortex.json ({ pointer, since, challenger,
// history }), committed with grown/ by finish. A challenger enters two ways: sense (a cloud session reports its own exact
// model id and the ids its environment names; the first one the rule has never seen registers) or challenge (a human
// session names one, under an order). plan maps generation n's arms to models: every arm runs under the pointer, except
// the parent lane's SECOND arm of each class, which runs under a pending challenger; so the trial costs no extra arm (same
// class, same lane, same brief, two models, one tournament). judge, run by finish right after it records the tournament,
// sums the held-out scores the locked judge wrote for the paired arms: the pointer moves only when the challenger scores
// higher over at least MIN_PAIRS pairs without fewer survivors; anything else, a tie included, holds the pointer.
// cortex.json sits where the arms write, so judge never trusts its pairs: a pair counts only when prepare's plan.json
// names it (pairsOf, the same derivation plan uses) and both sides are candidates (a cell.mjs beside the verdict.json),
// so an arm that rewrites cortex.json to pair itself against a planted weak incumbent moves nothing.
// This file is the RULE, the session obeys it: it never spawns a model, never touches the network, never reads a model id
// (or anything else) from the environment, and never opens judge/heldout/, judge/control.jsonl or state/.
// Success prints ONE JSON line; a failure one stderr line and a non-zero exit (2: usage, 1: the rule refused).
//   node grow/cortex.mjs status [--root <dir>]
//   node grow/cortex.mjs sense --self <model id> [--models a,b,c]
//   node grow/cortex.mjs challenge <model id> --by "<who, under what order>"
//   node grow/cortex.mjs plan --gen <n>         work/grow/gen-<n>/cortex.json: the model of every arm of prepare's plan
//   node grow/cortex.mjs judge --gen <n>        the pending challenger judged by generation n's paired arms
// Author: Day 3 board, cortex-pointer builder, 2026-10-01.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_ROOT = path.resolve(HERE, '..');
export const LEDGER = 'grown/cortex.json';
export const DEFAULT_POINTER = 'claude-opus-5-5';
/** Pairs with both verdicts a generation needs before its trial decides anything (fewer: the challenger waits). */
export const MIN_PAIRS = 4;
/** A challenger that was held (it lost) may not be challenged again while that generation is among the last this many recorded. */
export const HOLD_GENERATIONS = 3;
export const ID_RE = /^claude-[a-z0-9][a-z0-9.-]{0,62}$/;
/** Never a challenger, whoever asks: his standing order (Opus 5.5 builds, NEVER Opus 5) and his order (no Haiku). */
export const NEVER = Object.freeze([
  Object.freeze({ re: /^claude-opus-5(-\d{8})?$/, why: 'never a challenger: Opus 5 (his standing order: Opus 5.5 builds, NEVER Opus 5)' }),
  Object.freeze({ re: /haiku/i, why: 'never a challenger: Haiku (his order: no Haiku)' }),
]);
/** The models that existed when the rule was written: none of them "shipped" since, so sense never registers one; only a human session challenges with it. */
export const KNOWN = Object.freeze(['claude-opus-5-5', 'claude-fable-5-1', 'claude-sonnet-5-5', 'claude-haiku-4-5-20251001']);
/** The family aliases the Agent tool takes. */
export const FAMILIES = Object.freeze(['opus', 'sonnet', 'fable', 'haiku']);
export const SENSE_BY = 'sense: a model the rule had not seen';
export const MAX_BY = 300;
// a lane or an arm id used as a path segment under work/grow/gen-<n>/: cortex.json sits where arms write, so a pair
// naming '..' or a separator is never followed
const SEG_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/;
const SECRET_RES = [/sk-[A-Za-z0-9_-]{20,}/, /sk_(live|test)_[A-Za-z0-9]{16,}/, /gh[pousr]_[A-Za-z0-9]{30,}/, /github_pat_[A-Za-z0-9_]{30,}/, /eyJ[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}/, /AKIA[0-9A-Z]{16}/, /xox[abprs]-[A-Za-z0-9-]{10,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /sb_secret_[A-Za-z0-9_-]{16,}/];
export const USAGE = [
  'usage: node grow/cortex.mjs <verb> [flags]   (--root <dir>: another tree root)',
  '  status                                   the pointer, its alias, since when, the pending challenger, every model tried (' + LEDGER + ')',
  '  sense --self <id> [--models a,b,c]       a cloud session reports its own model id and the ids its environment names; the first unseen one becomes the challenger',
  '  challenge <id> --by "<who, under what order>"   a human session registers a challenger (a model that existed when the rule was written is allowed here)',
  '  plan --gen <n>                           the model of every arm of work/grow/gen-<n>/plan.json, written to work/grow/gen-<n>/cortex.json',
  '  judge --gen <n>                          the pending challenger judged by generation <n>\'s paired arms: moved, held, pending or none',
].join('\n');

export class Fail extends Error { constructor(line, code = 1) { super(line); this.code = code; } }

// ---- helpers
const readJson = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const writeJson = (f, o) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, 2) + '\n'); };
const clip = (s, k) => { const t = String(s ?? '').replace(/\s+/g, ' ').trim(); return t.length > k ? t.slice(0, k - 1) + '~' : t; };
const round6 = (x) => Math.round(x * 1e6) / 1e6;
const redact = (s) => String(s ?? '').replace(/eyJ[A-Za-z0-9_.-]+/g, '<token>');
const secretShaped = (s) => SECRET_RES.some((re) => re.test(String(s)));
const isObj = (x) => Boolean(x) && typeof x === 'object' && !Array.isArray(x);
/** An id as it may be printed: a well-formed one as is; anything else clipped, and never a secret-shaped string. */
export const shown = (id) => (ID_RE.test(String(id)) ? String(id) : secretShaped(id) ? '<secret-shaped, not shown>' : clip(id, 64));
export const wellFormed = (model) => typeof model === 'string' && ID_RE.test(model);
/** Why a model may never be a challenger (his orders), or null. */
export const neverWhy = (model) => { const n = NEVER.find((x) => x.re.test(String(model))); return n ? n.why : null; };
/** The family alias the Agent tool takes ('claude-opus-5-5' is 'opus'), or null: the session then passes the id itself. */
export function aliasOf(model) {
  if (!wellFormed(model)) return null;
  const w = model.slice('claude-'.length).split('-')[0];
  return FAMILIES.includes(w) ? w : null;
}

// ---- arguments
const VALUE = new Set(['gen', 'root', 'by', 'self', 'models']);
export function parseArgs(argv) {
  const pos = [], flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') { flags.help = true; continue; }
    if (!a.startsWith('--')) { pos.push(a); continue; }
    const eq = a.indexOf('=');
    const name = eq > 0 ? a.slice(2, eq) : a.slice(2);
    if (!VALUE.has(name)) throw new Fail('unknown flag --' + name + ' (--help)', 2);
    const v = eq > 0 ? a.slice(eq + 1) : argv[++i];
    if (v === undefined || v === '') throw new Fail('--' + name + ' needs a value', 2);
    flags[name] = v;
  }
  return { verb: pos[0], pos: pos.slice(1), flags };
}
function genOf(flags, verb) {
  if (flags.gen === undefined) throw new Fail(verb + ' needs --gen <n> (the generation prepare planned, or finish recorded)', 2);
  const n = Number(flags.gen);
  if (!Number.isInteger(n) || n < 1) throw new Fail('--gen is an integer from 1, not ' + clip(flags.gen, 32), 2);
  return n;
}

// ---- the ledger
/** grown/cortex.json, or the default with no file. A ledger the rule cannot read stops every verb (a human session repairs it): a silent default would move the cortex back. */
export function readLedger(root) {
  const f = path.join(root, LEDGER);
  if (!fs.existsSync(f)) return { pointer: DEFAULT_POINTER, since: null, challenger: null, history: [], extra: {} };
  let l;
  try { l = JSON.parse(fs.readFileSync(f, 'utf8')); } catch { l = undefined; }
  if (!isObj(l)) throw new Fail(LEDGER + ' is not a JSON object: a human session repairs it');
  const { pointer: p = DEFAULT_POINTER, since, challenger: c = null, history, ...extra } = l;
  if (!wellFormed(p) || neverWhy(p)) throw new Fail(LEDGER + ': the pointer ' + JSON.stringify(shown(p)) + ' is not a model the rule accepts: a human session repairs it');
  if (c !== null && (!isObj(c) || !wellFormed(c.model) || neverWhy(c.model) || c.model === p)) throw new Fail(LEDGER + ': the challenger is not a model the rule accepts: a human session repairs it');
  return {
    pointer: p, since: Number.isInteger(since) ? since : null,
    challenger: c ? { model: c.model, by: typeof c.by === 'string' ? c.by : null, at: typeof c.at === 'string' ? c.at : null } : null,
    history: Array.isArray(history) ? history.filter(isObj) : [], extra,
  };
}
export function writeLedger(root, l) {
  writeJson(path.join(root, LEDGER), { pointer: l.pointer, since: l.since, challenger: l.challenger, history: l.history, ...(l.extra || {}) });
}
/** Every model in the history, incumbents and challengers, first seen first. */
export const triedOf = (l) => [...new Set(l.history.flatMap((h) => [h.incumbent, h.challenger]).filter(wellFormed))];
/** The generation numbers grown/generations.json records, ascending. */
export function recordedOf(root) {
  const gs = readJson(path.join(root, 'grown', 'generations.json'));
  return [...new Set((gs && Array.isArray(gs.generations) ? gs.generations : []).map((e) => e && e.generation).filter(Number.isInteger))].sort((a, b) => a - b);
}
/** The history entry that makes a model wait: its last trial was 'held' in one of the last HOLD_GENERATIONS recorded generations; else null. */
export function heldRecently(root, l, model) {
  const last = [...l.history].reverse().find((h) => h.challenger === model);
  if (!last || last.verdict !== 'held') return null;
  const recent = recordedOf(root).slice(-HOLD_GENERATIONS);
  return !recent.length || !Number.isInteger(last.generation) || last.generation >= recent[0] ? last : null;
}

// ---- status
export function status(root) {
  const l = readLedger(root);
  return { pointer: l.pointer, alias: aliasOf(l.pointer), since: l.since, challenger: l.challenger, tried: triedOf(l), at: new Date().toISOString() };
}

// ---- sense: a cloud session reports what it runs on and what its environment names
export function sense(root, self, models) {
  const ids = [...new Set([...(self !== undefined ? [self] : []), ...models])];
  if (!ids.length) throw new Fail('sense needs --self <model id> and/or --models a,b,c', 2);
  const l = readLedger(root);
  const tried = new Set(triedOf(l));
  const refused = [];
  let registered = null;
  for (const id of ids) {
    const pending = l.challenger ? l.challenger.model : registered;
    const why = !wellFormed(id) ? 'not a model id (' + ID_RE.source + ')'
      : neverWhy(id) || (id === l.pointer ? 'the pointer' : null) || (l.challenger && id === l.challenger.model ? 'the pending challenger' : null)
        || (KNOWN.includes(id) ? 'known: it existed when the rule was written (only a human session challenges with it)' : null)
        || (tried.has(id) ? 'tried: already in the history' : null) || (pending ? 'a challenger is pending (' + pending + ')' : null);
    if (why) refused.push({ model: shown(id), why });
    else registered = id;
  }
  const at = new Date().toISOString();
  if (registered) { l.challenger = { model: registered, by: SENSE_BY, at }; writeLedger(root, l); }
  return { pointer: l.pointer, challenger: l.challenger, registered, self: self === undefined ? null : shown(self), selfIsPointer: self === l.pointer, refused, at };
}

// ---- challenge: a human session registers a challenger
export function challenge(root, model, by) {
  if (!model) throw new Fail('challenge needs a model id: challenge <model> --by "<who, under what order>"', 2);
  if (by === undefined || !String(by).trim()) throw new Fail('challenge needs --by "<who, under what order>": only a human session challenges, and it says who and under which order', 2);
  const who = clip(by, Infinity);
  if (who.length > MAX_BY) throw new Fail('challenge: --by is ' + who.length + ' characters, over ' + MAX_BY, 2);
  if (secretShaped(who)) throw new Fail('challenge: --by holds a secret-shaped string; it is committed with grown/, so it is refused', 2);
  if (!wellFormed(model)) throw new Fail('challenge: ' + JSON.stringify(shown(model)) + ' is not a model id (' + ID_RE.source + ')');
  const never = neverWhy(model);
  if (never) throw new Fail('challenge: ' + model + ': ' + never);
  const l = readLedger(root);
  if (model === l.pointer) throw new Fail('challenge: ' + model + ' is the pointer already (since ' + (l.since ?? 'the rule was written') + ')');
  if (l.challenger) throw new Fail('challenge: a challenger is pending (' + l.challenger.model + ', by ' + clip(l.challenger.by, 80) + '): a generation judges it first');
  const held = heldRecently(root, l, model);
  if (held) throw new Fail('challenge: ' + model + ' was held at generation ' + held.generation + ' (it lost); it waits until that generation is not among the last ' + HOLD_GENERATIONS + ' recorded');
  const at = new Date().toISOString();
  l.challenger = { model, by: who, at };
  writeLedger(root, l);
  return { registered: model, alias: aliasOf(model), pointer: l.pointer, challenger: l.challenger, at };
}

// ---- plan: the model of every arm of generation n
const genDirOf = (root, n) => path.join(root, 'work', 'grow', 'gen-' + n);
const roleOf = (model, role) => ({ model, alias: aliasOf(model), role });
/** The arms of one plan.json class whose id and lane are safe path segments. */
const armsOf = (c) => (isObj(c) && Array.isArray(c.arms) ? c.arms : []).filter((a) => isObj(a) && SEG_RE.test(String(a.id)) && SEG_RE.test(String(a.lane)));
const pairKey = (x) => x.lane + '/' + x.incumbent + '/' + x.challenger; // SEG_RE has no '/', so the key is one pair
/**
 * The trial pairs of a plan.json exactly as prepare planned them: per class, the parent lane's first arm (the incumbent)
 * and its second arm, whose id ends "-2" (the challenger; one brief, two models). plan names these pairs and judge counts
 * no other.
 * @param {object} p the parsed work/grow/gen-<n>/plan.json
 * @returns {{ class: string, lane: string, incumbent: string, challenger: string }[]}
 */
export function pairsOf(p) {
  const pairs = [];
  for (const c of isObj(p) && Array.isArray(p.classes) ? p.classes : []) {
    if (!isObj(c) || typeof c.class !== 'string') continue;
    const list = armsOf(c);
    for (const lane of typeof p.parent === 'string' ? [p.parent] : [...new Set(list.map((a) => a.lane))]) {
      const inLane = list.filter((a) => a.lane === lane);
      const second = inLane.find((a) => a.id.endsWith('-2'));
      const first = second && inLane.find((a) => a !== second && !a.id.endsWith('-2'));
      if (first) pairs.push({ class: c.class, lane, incumbent: first.id, challenger: second.id });
    }
  }
  return pairs;
}
export function plan(root, n) {
  const genDir = genDirOf(root, n);
  const p = readJson(path.join(genDir, 'plan.json'));
  if (!isObj(p)) throw new Fail('plan: no plan.json at work/grow/gen-' + n + '/plan.json (node grow/generation.mjs prepare --gen ' + n + ' writes it)');
  if (p.generation !== undefined && p.generation !== n) throw new Fail('plan: work/grow/gen-' + n + '/plan.json is generation ' + clip(JSON.stringify(p.generation), 32) + ', not ' + n);
  const l = readLedger(root);
  const challenger = l.challenger ? l.challenger.model : null;
  const arms = {};
  for (const c of Array.isArray(p.classes) ? p.classes : []) for (const a of armsOf(c)) arms[a.id] = roleOf(l.pointer, 'arm');
  // the trial: the second arm of each pair runs under the challenger, so the pair differs in the model and nothing else
  const pairs = challenger ? pairsOf(p) : [];
  for (const x of pairs) { arms[x.incumbent] = roleOf(l.pointer, 'incumbent'); arms[x.challenger] = roleOf(challenger, 'challenger'); }
  const out = { generation: n, pointer: l.pointer, challenger, arms, pairs, at: new Date().toISOString() };
  writeJson(path.join(genDir, 'cortex.json'), out);
  return out;
}

// ---- judge: the pending challenger by generation n's paired arms
const scoreOf = (v) => (isObj(v.heldout) && Number.isFinite(v.heldout.score) ? v.heldout.score : 0);
export function judge(root, n) {
  const l = readLedger(root);
  const at = new Date().toISOString();
  const model = l.challenger ? l.challenger.model : null;
  const none = (reason) => ({ verdict: 'none', pointer: l.pointer, challenger: model, pairs: 0, reason, at });
  if (!model) return none('no challenger pending');
  if (l.history.some((h) => h.generation === n && h.challenger === model)) return none('generation ' + n + ' already judged ' + model);
  const genDir = genDirOf(root, n);
  const cj = readJson(path.join(genDir, 'cortex.json'));
  if (!isObj(cj) || cj.generation !== n || cj.challenger !== model) return none('work/grow/gen-' + n + '/cortex.json does not name ' + model + ' (the challenger was not on this generation\'s arms)');
  if (cj.pointer !== l.pointer) return none('work/grow/gen-' + n + '/cortex.json was planned under ' + shown(cj.pointer) + ', not the pointer ' + l.pointer);
  // cortex.json is arm-writable: its pairs are checked against prepare's plan.json, never trusted
  const pl = readJson(path.join(genDir, 'plan.json'));
  if (!isObj(pl) || (pl.generation !== undefined && pl.generation !== n)) return none('work/grow/gen-' + n + '/plan.json is missing or not generation ' + n + ': no pair can be checked against what prepare planned');
  const legit = new Set(pairsOf(pl).map(pairKey));
  const seen = new Set();
  const planned = (Array.isArray(cj.pairs) ? cj.pairs : []).filter((p) => isObj(p) && SEG_RE.test(String(p.lane)) && SEG_RE.test(String(p.incumbent)) && SEG_RE.test(String(p.challenger))
    && p.challenger.endsWith('-2') && p.incumbent !== p.challenger && legit.has(pairKey(p)) && !seen.has(p.challenger) && seen.add(p.challenger));
  if (!planned.length) return none('work/grow/gen-' + n + '/cortex.json names no pair that work/grow/gen-' + n + '/plan.json planned for ' + model);
  // what the locked judge (judge/select.mjs) wrote in each arm's directory; a pair counts only when both sides are
  // candidates (a cell.mjs, the file finish runs) and both verdicts parse
  const isFile = (f) => { try { return fs.statSync(f).isFile(); } catch { return false; } };
  const verdictOf = (lane, id) => {
    if (!isFile(path.join(genDir, lane, id, 'cell.mjs'))) return null;
    const v = readJson(path.join(genDir, lane, id, 'verdict.json'));
    return isObj(v) ? v : null;
  };
  let pairs = 0, is = 0, cs = 0, iv = 0, cv = 0;
  for (const p of planned) {
    const a = verdictOf(p.lane, p.incumbent), b = verdictOf(p.lane, p.challenger);
    if (!a || !b) continue;
    pairs++; is += scoreOf(a); cs += scoreOf(b); iv += a.survived === true ? 1 : 0; cv += b.survived === true ? 1 : 0;
  }
  is = round6(is); cs = round6(cs);
  const incumbent = l.pointer;
  const out = (verdict, reason) => ({ verdict, pointer: l.pointer, challenger: model, pairs, incumbentScore: is, challengerScore: cs, incumbentSurvivors: iv, challengerSurvivors: cv, reason, at });
  if (!recordedOf(root).includes(n)) return out('pending', 'generation ' + n + ' is not recorded in grown/generations.json (a void tournament is no trial): ' + model + ' stays the challenger');
  if (pairs < MIN_PAIRS) return out('pending', pairs + ' of ' + planned.length + ' pairs have both verdicts, under ' + MIN_PAIRS + ': ' + model + ' stays the challenger for the next generation');
  const score = model + ' scored ' + cs + ' against ' + is + ' for ' + incumbent + ' over ' + pairs + ' pairs, survivors ' + cv + ' against ' + iv;
  let verdict, reason;
  if (cs > is && cv >= iv) { verdict = 'moved'; reason = score + ': the pointer moves to ' + model; l.pointer = model; l.since = n; }
  else { verdict = 'held'; reason = score + (cs === is ? ' (a tie holds)' : cs < is ? ' (a lower score holds)' : ' (fewer survivors hold)') + ': the pointer stays ' + incumbent; }
  l.challenger = null;
  l.history = [...l.history, { generation: n, incumbent, challenger: model, pairs, incumbentScore: is, challengerScore: cs, incumbentSurvivors: iv, challengerSurvivors: cv, verdict, at }];
  writeLedger(root, l);
  return out(verdict, reason);
}

// ---- main
export async function main(argv) {
  const { verb, pos, flags } = parseArgs(argv);
  if (flags.help || !verb || verb === 'help') return { usage: true };
  const root = flags.root ? path.resolve(flags.root) : DEFAULT_ROOT;
  if (verb === 'status') return status(root);
  if (verb === 'sense') return sense(root, flags.self, flags.models === undefined ? [] : String(flags.models).split(',').map((s) => s.trim()).filter(Boolean));
  if (verb === 'challenge') return challenge(root, pos[0], flags.by);
  if (verb === 'plan') return plan(root, genOf(flags, verb));
  if (verb === 'judge') return judge(root, genOf(flags, verb));
  throw new Fail('unknown verb ' + clip(verb, 32) + ': status, sense, challenge, plan or judge (--help)', 2);
}

const same = (x, y) => (process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y);
if (process.argv[1] && same(path.resolve(process.argv[1]), fileURLToPath(import.meta.url))) {
  const done = (code) => process.stdout.write('', () => process.exit(code));
  main(process.argv.slice(2)).then((r) => { process.stdout.write((r.usage ? USAGE : JSON.stringify(r)) + '\n'); done(0); }, (e) => {
    process.stderr.write(redact(e instanceof Fail ? e.message : 'cortex failed: ' + ((e && e.stack) || e)).split('\n')[0] + '\n');
    done(e instanceof Fail ? e.code : 1);
  });
}
