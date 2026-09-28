// test/wire-induce-verify.mjs: THE WIRE-INDUCE VERIFY BAR (board 31 builder, item wire-induce-verify; docs/VISION.md
// order 7, route A of docs/RESEARCH-PARADIGM.md). Model OFF: ask() is handed provider 'null' and nothing else, and every
// TCP connect and every fetch in this process is blocked and counted (the count is printed; the bar needs 0).
//
// The question that decides whether the program tier (act/prompt.mjs programAnswer, board 26 item wire-induce) may stay
// in ask(): does it ever pre-empt a RIGHT answer from a later tier?
//   (1) REPRODUCE board 26's numbers on the draw it graded: bench/ns.mjs's held-out draw rebuilt from the journals as
//       they stood at that run's at (a row whose at is later is left out), checked first on ns.json's own at, where
//       the rebuilt draw must equal ns.json's ids; the program arm (bench/ns.mjs programArm) on that draw, on
//       induce.json's held-out ids and on ns.json's; ask() on that draw with the tier on and off.
//   (2) FLIPS, model off: ask() on ns.json's held-out ids with the tier on and off (opts.programs false is the flag),
//       in the ns bar's own options and in the site's (a seeds/basic.mjs brain, provider 'null', as act/ask-http.mjs
//       asks when no model is configured); graded by bench/public.mjs lastNumber and sameInteger.
//   (3) PRE-EMPTION, model on, emulated with no socket: for every prompt ask() hands to the tier (no earlier tier
//       answered it, read off the same ask with the tier off), programAnswer under the options a model run passes.
//       Non-null there is the tier answering in front of the math region, the code region or the model's prose, which
//       bench/verdicts/math.json measured above every level of the tier.
//   (4) HUMANEVAL model off (bench/public.mjs null arm options): a number answered to a code prompt.
//   (5) THE SITE: the five prompts, both ways: route, provenance and first line.
//   (6) THE SPLIT: ns.json and induce.json grade the same held-out ids, and none of them is a development record of
//       the store the tier answers from.
//
//   node --max-old-space-size=4000 test/wire-induce-verify.mjs [--before]
//
// --before writes bench/verdicts/induce-wire-before.json (isTheBar false): the tier as it stands before a fix, kept as
// the control that shows the counters can count. The default writes bench/verdicts/induce-wire.json, prints the control
// beside its own numbers, and adds its printed lines, a wire block and its numbers to bench/verdicts/ns.json (whose own
// bench cannot draw held-out records any more: see notes/induce.md).
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

// THE SOCKET GUARD, installed before anything else is imported: every TCP connect and every fetch is refused and counted.
const SOCKETS = { attempts: 0 };
net.Socket.prototype.connect = function blockedConnect() { SOCKETS.attempts++; throw new Error('wire-induce-verify: a socket was attempted, and this bar is model off'); };
globalThis.fetch = async function blockedFetch() { SOCKETS.attempts++; throw new Error('wire-induce-verify: a fetch was attempted, and this bar is model off'); };

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const VERDICTS = path.join(ROOT, 'bench', 'verdicts');
const AUTHOR = 'board 31 builder (item wire-induce-verify)';
const argv = process.argv.slice(2);
const BEFORE = argv.includes('--before');
const OUT = path.join(VERDICTS, BEFORE ? 'induce-wire-before.json' : 'induce-wire.json');
const BEFORE_FILE = path.join(VERDICTS, 'induce-wire-before.json');
/** The at of the ns.json run board 26 (item wire-induce) graded the wired tier on (notes/induce.md, its Measured section). */
export const BOARD26_NS_AT = '2026-09-27T18:42:55.773Z';
export const SITE_PROMPTS = Object.freeze(['h', 'hey', 'hi', 'What is the capital of France?', 'Write a short essay on why the ocean is salty.']);

const rel = (p) => path.relative(ROOT, p).replaceAll('\\', '/');
const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const shaFile = (f) => sha(fs.readFileSync(f));
const pct = (x) => (x === null || x === undefined || !Number.isFinite(x) ? 'n/a' : (100 * x).toFixed(1) + '%');
const r4 = (x) => (x === null || x === undefined || !Number.isFinite(x) ? null : Math.round(x * 1e4) / 1e4);
const tally = (xs, f) => xs.reduce((m, x) => { const k = f(x); if (k !== null && k !== undefined) m[k] = (m[k] || 0) + 1; return m; }, {});
const median = (xs) => { const s = Float64Array.from(xs).sort(); return s.length ? s[Math.floor(0.5 * (s.length - 1))] : null; };
const p99 = (xs) => { const s = Float64Array.from(xs).sort(); return s.length ? s[Math.floor(0.99 * (s.length - 1))] : null; };
const sameSet = (a, b) => a.length === b.length && new Set(a).size === new Set([...a, ...b]).size;
const firstLine = (t) => String(t ?? '').split('\n')[0];

/** Every number a text writes (digits, with a decimal part): what the statement check compares to the printed lines. */
export function numbersIn(s) {
  return [...String(s).matchAll(/\d+(?:\.\d+)?/g)].map((m) => m[0]);
}
/** The numbers of a statement that no printed line writes (a printed line holds the number as a whole token). */
export function unprintedNumbers(statement, lines) {
  const printed = new Set(lines.flatMap((l) => numbersIn(l)));
  return [...new Set(numbersIn(statement))].filter((n) => !printed.has(n));
}

// ------------------------------------------------------------------ the draw, rebuilt at an instant
/**
 * bench/ns.mjs's held-out draw as it would have been made at instant T: every journal under bench/verdicts read with
 * its rows whose at is later than T left out, the model-off grading journals skipped (bench/ns.mjs modelOffJournal),
 * every GSM8K id named counted as development with bench/public.mjs gsm8kDevIds, and sampleIds at the public seed.
 */
export function drawAt(T, { PUB, NS, gsm, limit = 200 }) {
  const files = [];
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.isFile() && p.endsWith('.jsonl')) files.push(p); } };
  walk(VERDICTS);
  const dev = new Set();
  for (const f of files) {
    const text = fs.readFileSync(f, 'utf8');
    if (NS.modelOffJournal(text)) continue;
    const kept = [];
    for (const line of text.split('\n')) {
      let at = null;
      try { at = JSON.parse(line).at; } catch { at = null; }
      if (typeof at === 'string' && at > T) continue;
      kept.push(line);
    }
    for (const m of kept.join('\n').matchAll(/\bgsm8k\.(\d+)\b/g)) dev.add('gsm8k.' + m[1]);
  }
  for (const id of PUB.gsm8kDevIds().set) dev.add(id);
  const pool = gsm.map((r) => r.id).filter((id) => !dev.has(id));
  return { pool: pool.length, drawn: PUB.sampleIds(pool, limit, PUB.DEFAULT_SEED) };
}

// ------------------------------------------------------------------ asking both ways
const EARLY = (a) => a.provenance.answer !== 'memory' || !!a.provenance.tier;
/** ask() with the tier on and off on each record, graded after the answers exist. */
async function bothWays(P, PUB, brain, recs, opts) {
  const rows = [];
  for (const r of recs) {
    const on = await P.ask(brain, r.prompt, opts);
    const off = await P.ask(brain, r.prompt, { ...opts, programs: false });
    const onGot = PUB.lastNumber(on.text), offGot = PUB.lastNumber(off.text);
    rows.push({
      id: r.id, gold: r.gold,
      on: { from: on.from, route: on.route, provenance: on.provenance.answer, got: onGot, ok: r.gold !== undefined ? PUB.sameInteger(onGot, r.gold) : null, level: on.program ? on.program.level : null, program: on.program ? on.program.text : null, ns: on.program ? on.program.ns : null, first: firstLine(on.text) },
      off: { from: off.from, route: off.route, provenance: off.provenance.answer, tier: off.provenance.tier ?? null, got: offGot, ok: r.gold !== undefined ? PUB.sameInteger(offGot, r.gold) : null, first: firstLine(off.text), early: EARLY(off) },
      sameText: on.text === off.text,
    });
  }
  return rows;
}
function flipsOf(rows) {
  const f = { n: rows.length, rightToWrong: 0, wrongToRight: 0, bothRight: 0, bothWrong: 0, changed: 0, program: 0, programRight: 0, byLevel: {}, onProvenance: tally(rows, (x) => x.on.provenance + ':' + (x.on.ok ? 'right' : 'wrong')), offProvenance: tally(rows, (x) => x.off.provenance + ':' + (x.off.ok ? 'right' : 'wrong')), offRight: 0, programNs: [] };
  for (const x of rows) {
    if (x.off.ok) f.offRight++;
    if (x.off.ok && !x.on.ok) f.rightToWrong++;
    else if (!x.off.ok && x.on.ok) f.wrongToRight++;
    else if (x.off.ok && x.on.ok) f.bothRight++;
    else f.bothWrong++;
    if (!x.sameText) f.changed++;
    if (x.on.from === 'program') {
      f.program++; if (x.on.ok) f.programRight++;
      const t = f.byLevel[x.on.level] || (f.byLevel[x.on.level] = { answered: 0, right: 0 }); t.answered++; if (x.on.ok) t.right++;
      if (Number.isFinite(x.on.ns)) f.programNs.push(x.on.ns);
    }
  }
  f.rightToWrongIds = rows.filter((x) => x.off.ok && !x.on.ok).map((x) => x.id);
  f.wrongToRightIds = rows.filter((x) => !x.off.ok && x.on.ok).map((x) => x.id);
  f.programNsMedian = median(f.programNs); f.programNsP99 = p99(f.programNs); delete f.programNs;
  return f;
}
const flipLine = (label, f) => `${label}: ${f.n} records, tier on vs off: right to wrong ${f.rightToWrong}, wrong to right ${f.wrongToRight}, both right ${f.bothRight}, both wrong ${f.bothWrong} (answer text changed on ${f.changed}); the tier answered ${f.program}, right ${f.programRight}${f.program ? ` (precision ${pct(f.programRight / f.program)}; by level ${Object.entries(f.byLevel).map(([k, v]) => k + ' ' + v.right + '/' + v.answered).join(', ')}; tier ns median ${f.programNsMedian}, p99 ${f.programNsP99})` : ''}; off right ${f.offRight}; on ${JSON.stringify(f.onProvenance)}; off ${JSON.stringify(f.offProvenance)}`;

// ------------------------------------------------------------------ main
async function main() {
  const lines = [];
  const say = (s) => { lines.push(s); console.log(s); };
  const at = new Date().toISOString();
  const t0 = Date.now();
  const command = 'node ' + ['test/wire-induce-verify.mjs', ...argv].join(' ');
  const P = await import(pathToFileURL(path.join(ROOT, 'act', 'prompt.mjs')).href);
  const PUB = await import(pathToFileURL(path.join(ROOT, 'bench', 'public.mjs')).href);
  const NS = await import(pathToFileURL(path.join(ROOT, 'bench', 'ns.mjs')).href);
  const { Brain } = await import(pathToFileURL(path.join(ROOT, 'core', 'brain.mjs')).href);
  const { attachMemory } = await import(pathToFileURL(path.join(ROOT, 'memory', 'index.mjs')).href);
  const { seedBasic } = await import(pathToFileURL(path.join(ROOT, 'seeds', 'basic.mjs')).href);

  const code = Object.fromEntries(['act/prompt.mjs', 'reason/induce.mjs', 'test/wire-induce-verify.mjs'].map((f) => [f, shaFile(path.join(ROOT, f)).slice(0, 16)]));
  const storeSha = fs.existsSync(P.PROGRAM_STORE) ? shaFile(P.PROGRAM_STORE) : null;
  P.resetPrograms();
  const store = P.programStore();
  say(`wire-induce-verify: ${command} at ${at} (node ${process.version}, model off: provider 'null' only, every TCP connect and fetch blocked and counted)${BEFORE ? ' (--before: the control run)' : ''}`);
  say(`code: ${Object.entries(code).map(([f, h]) => f + ' ' + h).join(', ')}; store ${rel(P.PROGRAM_STORE)} sha256 ${storeSha ? storeSha.slice(0, 16) : 'absent'} (at ${store ? store.at : 'n/a'}, ${store ? store.programs : 0} programs, development ${store && store.development ? store.development.records : 'n/a'} records)`);
  const devLoo = store && store.devLoo ? store.devLoo : {};
  const admitted = Object.keys(devLoo).filter((lv) => devLoo[lv].precision >= P.PROGRAM.floor);
  say(`floor: PROGRAM.floor ${P.PROGRAM.floor} (${P.PROGRAM.floorFrom}); the store's development leave-one-out by level ${Object.entries(devLoo).map(([k, v]) => k + ' ' + v.right + '/' + v.answered + ' = ' + v.precision).join(', ')}; admitted ${admitted.join(', ') || 'none'}`);

  // (6) THE SPLIT
  const gsm = PUB.loadGsm8k();
  const byId = new Map(gsm.map((r) => [r.id, r]));
  const recOf = (id) => ({ id, prompt: PUB.ALONE_PROMPT(byId.get(id).question), question: byId.get(id).question, gold: PUB.finalAnswer(byId.get(id)) });
  const nsv = JSON.parse(fs.readFileSync(path.join(VERDICTS, 'ns.json'), 'utf8'));
  const indv = JSON.parse(fs.readFileSync(path.join(VERDICTS, 'induce.json'), 'utf8'));
  const target = nsv.split.heldOut.ids.slice();
  const indHeld = indv.split.heldOut.ids.slice();
  const indDev = new Set(indv.split.development.ids);
  const shared = target.filter((id) => new Set(indHeld).has(id)).length;
  const sameIds = sameSet(target, indHeld);
  const inStoreDev = target.filter((id) => indDev.has(id)).length;
  const storeDevMatches = !!(store && store.development && indv.split.development.idsSha256 === store.development.idsSha256);
  say(`split: ns.json (at ${nsv.at}) held out ${target.length} ids (sampleIds at seed ${nsv.split.heldOut.seed} from a pool of ${nsv.split.heldOut.pool}); induce.json (at ${indv.at}, its ns.json at ${indv.split.development.nsAt}) held out ${indHeld.length} ids; shared ${shared}; the same ids: ${sameIds ? 'yes' : 'NO'}; ns.json held-out ids among induce.json's development ${inStoreDev}; the store's development is induce.json's: ${storeDevMatches ? 'yes' : 'NO'}`);
  const now = drawAt(nsv.at, { PUB, NS, gsm });
  const drawReproduced = sameSet(now.drawn, target) && now.drawn.length === target.length;
  const today = drawAt('9999', { PUB, NS, gsm });
  say(`draw: rebuilt at ns.json's at ${nsv.at}: pool ${now.pool}, drawn ${now.drawn.length}, equal to ns.json's ids: ${drawReproduced ? 'yes' : 'NO'}; with every journal row on disk now: pool ${today.pool}, drawn ${today.drawn.length} (bench/ns.mjs run today would grade that many held-out records)`);

  // (1) REPRODUCE
  const b26 = drawAt(BOARD26_NS_AT, { PUB, NS, gsm });
  say(`reproduce: the draw board 26 graded, rebuilt at ${BOARD26_NS_AT}: pool ${b26.pool}, drawn ${b26.drawn.length}; shared with ns.json's ids ${b26.drawn.filter((id) => target.includes(id)).length}, with induce.json's ${b26.drawn.filter((id) => indHeld.includes(id)).length}`);
  const armOpts = { ALONE_PROMPT: PUB.ALONE_PROMPT, lastNumber: PUB.lastNumber, sameInteger: PUB.sameInteger };
  const arms = {};
  for (const [label, ids] of [['board 26 draw', b26.drawn], ['induce.json held out', indHeld], ['ns.json held out', target]]) {
    const b = await NS.programArm(ids.map(recOf), armOpts);
    arms[label] = b.measured ? { n: b.n, answered: b.answered, right: b.right, precision: b.precision, answerNs: b.answerNs } : { why: b.why };
    say(`reproduce, ${label}: ${b.measured ? b.printed.join(' ') : b.why}`);
  }
  const nsBrain = () => { const b = new Brain({ name: 'wire-ns', ledger: 'off', pruneEvery: 0 }); attachMemory(b, { name: 'wire-ns-' + Math.random().toString(36).slice(2) }); return b; };
  const NS_OPTS = Object.freeze({ provider: 'null', route: 'direct', regions: false, knowledge: false, direct: false, spawn: false, solved: false });
  const b26Rows = await bothWays(P, PUB, nsBrain(), b26.drawn.map(recOf), NS_OPTS);
  const b26f = flipsOf(b26Rows);
  say(flipLine('reproduce, ask() on the board 26 draw (the ns bar options, solved off)', b26f));

  // (2) FLIPS on ns.json's held-out ids, model off, two option sets
  const recs = target.map(recOf);
  const nsRows = await bothWays(P, PUB, nsBrain(), recs, NS_OPTS);
  const nsF = flipsOf(nsRows);
  say(flipLine('flips, the ns bar options (provider null, route direct, regions, knowledge, direct and spawn off, solved off)', nsF));
  const site = seedBasic({ name: 'wire-site', ledger: 'off' });
  const SITE_OPTS = Object.freeze({ provider: 'null', k: 5, events: [] });
  const siteRows = await bothWays(P, PUB, site, recs, SITE_OPTS);
  const siteF = flipsOf(siteRows);
  say(flipLine('flips, the site options (a seeds/basic.mjs brain, provider null, as act/ask-http.mjs asks with no model configured)', siteF));
  // the held-out precision of the tier against its floor, per level it answered at
  const heldPrecision = nsF.program ? r4(nsF.programRight / nsF.program) : null;
  const clears = Object.entries(nsF.byLevel).map(([lv, v]) => ({ level: lv, answered: v.answered, right: v.right, precision: r4(v.right / v.answered), floor: P.PROGRAM.floor, clears: v.right / v.answered >= P.PROGRAM.floor }));
  say(`floor on held out: the tier answered ${nsF.program} of ${nsF.n}, right ${nsF.programRight} (precision ${heldPrecision === null ? 'n/a: it answered none' : heldPrecision}) at floor ${P.PROGRAM.floor}; by level ${clears.length ? clears.map((c) => c.level + ' ' + c.right + '/' + c.answered + ' = ' + c.precision + (c.clears ? ' clears' : ' below')).join(', ') : 'none answered'}`);

  // (3) PRE-EMPTION with a model, emulated: programAnswer under the options a model run passes, on every prompt the
  // tier is reached on (the same ask with the tier off answered at the memory-miss end: nothing earlier answered)
  const he = PUB.loadHumanEval();
  const heRecs = he.map((r) => ({ id: r.name, prompt: String(r.prompt ?? '') }));
  const heBrain = new Brain({ name: 'wire-he', ledger: 'off', pruneEvery: 0 });
  attachMemory(heBrain, { name: 'wire-he-' + Math.random().toString(36).slice(2) });
  const HE_NULL = Object.freeze({ provider: 'null', route: null, regions: PUB.regionsOf({ regions: true, k: 5, check: 1 }) });
  const heRows = await bothWays(P, PUB, heBrain, heRecs, HE_NULL);
  const siteRecs = SITE_PROMPTS.map((p) => ({ id: p, prompt: p }));
  const siteAsk = await bothWays(P, PUB, site, siteRecs, SITE_OPTS);
  const MODEL_ON = [
    ['organism arm (bench/public.mjs: provider ollama, both regions)', { provider: 'ollama', regions: PUB.regionsOf({ regions: true, k: 5, check: 1 }) }],
    ['the site with a model configured (act/ask-http.mjs: provider env)', { provider: 'env', k: 5, events: [] }],
    ['a model with the regions off', { provider: 'ollama', regions: false }],
    ['no provider named (ask() probes the local model)', {}],
  ];
  const populations = [['GSM8K held out', siteRows], ['HumanEval', heRows], ['site prompts', siteAsk]];
  const recsBy = new Map([...recs, ...heRecs, ...siteRecs].map((r) => [r.id, r]));
  const preempt = {};
  let preemptTotal = 0;
  for (const [label, opts] of MODEL_ON) {
    const per = {};
    for (const [pop, rows] of populations) {
      const reached = rows.filter((x) => !x.off.early);
      const fired = reached.filter((x) => P.programAnswer(recsBy.get(x.id).prompt, opts) !== null).map((x) => x.id);
      per[pop] = { reached: reached.length, fired: fired.length, ids: fired.slice(0, 20) };
      preemptTotal += fired.length;
    }
    preempt[label] = per;
    say(`pre-emption, ${label}: ${populations.map(([pop]) => pop + ' ' + per[pop].fired + ' of ' + per[pop].reached + ' reached').join(', ')}${Object.values(per).some((v) => v.fired) ? '; first ids ' + Object.values(per).flatMap((v) => v.ids).slice(0, 6).join(', ') : ''}`);
  }
  const math = JSON.parse(fs.readFileSync(path.join(VERDICTS, 'math.json'), 'utf8'));
  const later = ['pot5v', 'pot5', 'pot1', 'alone'].filter((k) => math.arms[k]).map((k) => k + ' ' + math.arms[k].correct + '/' + math.arms[k].n);
  say(`the later tiers a pre-emption would displace (bench/verdicts/math.json, ${math.arms.alone ? math.arms.alone.model : 'n/a'}, development): ${later.join(', ')}; the tier's best admitted level on development ${admitted.length ? Math.max(...admitted.map((lv) => devLoo[lv].precision)) : 'n/a'}`);

  // (4) HUMANEVAL model off
  const heF = { n: heRows.length, program: heRows.filter((x) => x.on.from === 'program').length, ids: heRows.filter((x) => x.on.from === 'program').map((x) => x.id), off: tally(heRows, (x) => x.off.provenance), changed: heRows.filter((x) => !x.sameText).length };
  say(`humaneval, the null arm options (model off): ${heF.n} prompts, the tier answered a number to ${heF.program}${heF.program ? ' (' + heF.ids.slice(0, 6).join(', ') + ')' : ''}; answer text changed on ${heF.changed}; off ${JSON.stringify(heF.off)}`);

  // (5) THE SITE
  const siteSame = siteAsk.filter((x) => x.on.route === x.off.route && x.on.from === x.off.from && x.on.provenance === x.off.provenance && x.on.first.replace(/\d+ ns/g, 'N ns') === x.off.first.replace(/\d+ ns/g, 'N ns')).length;
  for (const x of siteAsk) say(`site ${JSON.stringify(x.id)}: on from ${x.on.from}, route ${x.on.route}, first line ${JSON.stringify(x.on.first.slice(0, 90))}; off from ${x.off.from}, route ${x.off.route}; the same: ${x.on.route === x.off.route && x.on.from === x.off.from && x.on.first.replace(/\d+ ns/g, 'N ns') === x.off.first.replace(/\d+ ns/g, 'N ns') ? 'yes' : 'NO'}`);
  say(`site: ${siteSame} of ${SITE_PROMPTS.length} prompts gave the same route, provenance and first line (a timing in ns read as one token) with the tier on and off`);

  // the control: the counters on the tier as it stood before this fix
  let control = null;
  if (!BEFORE && fs.existsSync(BEFORE_FILE)) {
    const c = JSON.parse(fs.readFileSync(BEFORE_FILE, 'utf8'));
    control = { file: rel(BEFORE_FILE), at: c.at, code: c.code, storeSha256: c.storeSha256, preemptTotal: c.preemptTotal, heProgram: c.humaneval.program, nsFlips: { rightToWrong: c.flips.ns.rightToWrong, wrongToRight: c.flips.ns.wrongToRight, program: c.flips.ns.program }, siteFlips: { rightToWrong: c.flips.site.rightToWrong, wrongToRight: c.flips.site.wrongToRight, program: c.flips.site.program } };
    say(`control, the tier before this fix (${control.file} at ${c.at}, act/prompt.mjs ${c.code['act/prompt.mjs']}, store ${String(c.storeSha256).slice(0, 16)}): pre-emptions with a model ${c.preemptTotal}, HumanEval numbers model off ${c.humaneval.program}; ns options: right to wrong ${c.flips.ns.rightToWrong}, wrong to right ${c.flips.ns.wrongToRight}, the tier answered ${c.flips.ns.program}; site options: right to wrong ${c.flips.site.rightToWrong}, wrong to right ${c.flips.site.wrongToRight}, the tier answered ${c.flips.site.program}`);
    // the build's bar reproduced on the build's own store and draw: the control run's lines, carried as printed
    const b26Line = (c.printed || []).find((l) => l.startsWith('reproduce, board 26 draw: '));
    const b26Ask = (c.printed || []).find((l) => l.startsWith('reproduce, ask() on the board 26 draw'));
    for (const l of [b26Line, b26Ask].filter(Boolean)) say(`control ${l}`);
    const m = b26Line && b26Line.match(/answered (\d+) \(([\d.]+)%\), right (\d+) \(([\d.]+)% of held out, precision ([\d.]+)%\).*answer median (\d+) ns, p99 (\d+) ns/);
    control.reproduce = m ? { answered: +m[1], answeredPct: m[2], right: +m[3], rightPct: m[4], precisionPct: m[5], medianNs: +m[6], p99Ns: +m[7], line: b26Line, askLine: b26Ask || null } : null;
  }
  // bench/ns.mjs's own lines as ns.json holds them (the build's bar command; it cannot be re-run to a held-out draw
  // today, the pool line above): the ask() fall-through, the solved-off equality and the sub-token share
  const nsPrinted = (nsv.printed || []).filter((l) => !String(l).startsWith('wire: '));
  const nsHeld = nsPrinted.find((l) => /^\s*held out: \d+ records; answered sub-token/.test(l));
  const nsFell = nsPrinted.find((l) => /^\s*fell through to the next region: \d+\/200 /.test(l));
  const nsBar = nsPrinted.find((l) => /^BAR: /.test(l));
  for (const l of [nsHeld, nsFell, nsBar].filter(Boolean)) say(`ns.json (bench/ns.mjs at ${nsv.at}, barMet ${nsv.barMet}): ${l.trim()}`);
  const fm = nsFell && nsFell.match(/fell through to the next region: (\d+)\/(\d+) .*solved off (\d+)\/(\d+)/);
  const sm = nsBar && nsBar.match(/sub-token share ([\d.]+)% \((\d+)\/(\d+)/);
  const nsRepro = fm && sm ? { fell: +fm[1], of: +fm[2], sameSolvedOff: +fm[3], solvedOffOf: +fm[4], sharePct: sm[1], share: +sm[2], shareOf: +sm[3], barMet: nsv.barMet } : null;

  say(`sockets attempted ${SOCKETS.attempts}; model calls 0`);
  const met = {
    sockets: SOCKETS.attempts === 0,
    noRightToWrong: nsF.rightToWrong === 0 && siteF.rightToWrong === 0 && b26f.rightToWrong === 0,
    noPreemption: preemptTotal === 0,
    humanevalNoNumber: heF.program === 0,
    site: siteSame === SITE_PROMPTS.length,
    sameIds: sameIds && drawReproduced && inStoreDev === 0 && storeDevMatches,
    control: BEFORE ? null : !!control && control.preemptTotal > 0,
  };
  const barMet = !BEFORE && Object.values(met).every((v) => v === true);
  say(`BAR: sockets ${SOCKETS.attempts}; right to wrong ${nsF.rightToWrong} (ns options), ${siteF.rightToWrong} (site options), ${b26f.rightToWrong} (board 26 draw); pre-emptions with a model ${preemptTotal}; HumanEval numbers model off ${heF.program}; site unchanged ${siteSame} of ${SITE_PROMPTS.length}; ns.json and induce.json the same ${target.length} held-out ids ${met.sameIds ? 'yes' : 'NO'}; control ${BEFORE ? 'this run is the control' : control ? 'pre-emptions ' + control.preemptTotal + ' before the fix' : 'ABSENT'}; ${BEFORE ? 'the control run (isTheBar false)' : barMet ? 'BAR MET' : 'BAR NOT MET'}`);
  const wallMs = Date.now() - t0;
  const peak = Math.round(process.resourceUsage().maxRSS / 102.4) / 10;
  say(`peak rss ${peak} MB; wall ${(wallMs / 1000).toFixed(1)} s`);

  const statement = `The program tier (act/prompt.mjs, programs induced by reason/induce.mjs from development GSM8K records) was checked for the one thing that decides whether it may stay in ask(): whether it ever answers in front of a later tier that would have been right. `
    + (control && control.reproduce ? `The build's numbers reproduced on its own store and draw first: the program arm answered ${control.reproduce.answered} (${control.reproduce.answeredPct}%), right ${control.reproduce.right} (${control.reproduce.rightPct}%, precision ${control.reproduce.precisionPct}%), median ${control.reproduce.medianNs} ns, p99 ${control.reproduce.p99Ns} ns (timing moves run to run). ` : '')
    + (nsRepro ? `bench/ns.mjs printed fell through ${nsRepro.fell}/${nsRepro.of}, the same as solved off ${nsRepro.sameSolvedOff}/${nsRepro.solvedOffOf}, sub-token share ${nsRepro.sharePct}% (${nsRepro.share}/${nsRepro.shareOf}), barMet ${nsRepro.barMet}. ` : '')
    + `The store was then re-induced so induce.json grades ns.json's own held-out ids (the same ${target.length}: ${sameIds ? 'yes' : 'NO'}): the draw is bench/public.mjs sampleIds at seed ${nsv.split.heldOut.seed} over the ${nsv.split.heldOut.pool} GSM8K test records no development journal named at ns.json's ${nsv.at}, rebuilt from the journals at that instant: ${drawReproduced ? 'equal' : 'NOT equal'}. `
    + `Model off, on the ${nsF.n} held-out GSM8K records ns.json and induce.json both grade, asked with the tier on and off: right to wrong ${nsF.rightToWrong} and wrong to right ${nsF.wrongToRight} in the ns bar's options, right to wrong ${siteF.rightToWrong} and wrong to right ${siteF.wrongToRight} in the site's; the tier answered ${nsF.program} and ${nsF.programRight} of those were right. `
    + `With a model, emulated with no socket, the tier answered in front of the math region, the code region or the model's prose ${preemptTotal} times over the GSM8K, HumanEval and site prompts it is reached on`
    + (control ? `, against ${control.preemptTotal} before this fix (the control, the same counters on the tier as board 26 wired it). ` : '. ')
    + `Model off it answered a number to ${heF.program} of ${heF.n} HumanEval code prompts, and the ${SITE_PROMPTS.length} site prompts gave the same route and first line both ways ${siteSame} times. Sockets attempted: ${SOCKETS.attempts}.`;
  const missing = unprintedNumbers(statement, lines);
  if (missing.length) { console.error('the statement quotes numbers no printed line holds: ' + missing.join(', ')); process.exitCode = 1; return; }

  const verdict = {
    at, command, node: process.version, isTheBar: !BEFORE, barMet, met, author: AUTHOR, modelCalls: 0, sockets: SOCKETS.attempts,
    split: {
      development: { what: "the store's development records: induce.json split.development (bench/verdicts/ns.json rows.development when bench/induce.mjs ran); the programs were induced from these only", induceAt: indv.at, records: indv.split.development.records, idsSha256: indv.split.development.idsSha256, storeMatches: storeDevMatches },
      heldOut: { what: 'bench/verdicts/ns.json split.heldOut.ids: bench/public.mjs sampleIds at seed ' + nsv.split.heldOut.seed + ' over the ' + nsv.split.heldOut.pool + ' GSM8K test records no development journal named at ' + nsv.at, seed: nsv.split.heldOut.seed, pool: nsv.split.heldOut.pool, nsAt: nsv.at, ids: target, sameAsInduce: sameIds, drawRebuilt: drawReproduced, inStoreDevelopment: inStoreDev },
      contaminated: inStoreDev === 0 && storeDevMatches ? false : 'a held-out id is a development record of the store, or the store on disk is not the one induce.json induced',
      poolToday: today.pool,
    },
    statement, code, storeSha256: storeSha, floor: { value: P.PROGRAM.floor, from: P.PROGRAM.floorFrom, devLoo, admitted, heldOut: clears, heldPrecision },
    reproduce: { board26At: BOARD26_NS_AT, board26Pool: b26.pool, arms, ask: b26f, buildStore: control ? control.reproduce : null, nsJson: nsRepro },
    flips: { ns: nsF, site: siteF }, preemptTotal, preempt, laterTiers: later, humaneval: heF,
    site: siteAsk.map((x) => ({ prompt: x.id, on: { from: x.on.from, route: x.on.route, first: x.on.first }, off: { from: x.off.from, route: x.off.route, first: x.off.first } })), siteSame,
    control, rows: nsRows.map((x) => ({ id: x.id, gold: x.gold, on: { from: x.on.from, got: x.on.got, ok: x.on.ok, level: x.on.level, program: x.on.program }, off: { from: x.off.from, got: x.off.got, ok: x.off.ok } })),
    peakRssMb: peak, wallMs, writesOver100MB: false, printed: lines,
  };
  fs.writeFileSync(OUT, JSON.stringify(verdict, null, 2) + '\n');
  console.log('wrote ' + rel(OUT));

  if (!BEFORE) {
    // ns.json: its own bench cannot draw held-out records any more (pool printed above), so the wired tier's numbers on
    // its held-out ids are added here: a wire block, the lines (prefixed), and the statement's numbers, all from above
    const nsFile = path.join(VERDICTS, 'ns.json');
    const cur = JSON.parse(fs.readFileSync(nsFile, 'utf8'));
    const MARK = ' WIRE (added by node test/wire-induce-verify.mjs';
    const base = String(cur.statement).split(MARK)[0];
    const printedBase = (cur.printed || []).filter((l) => !String(l).startsWith('wire: '));
    const wireLines = lines.map((l) => 'wire: ' + l);
    const add = MARK + ' at ' + at + ', every number below printed on a wire line): ' + statement;
    const missingNs = unprintedNumbers(add, wireLines);
    if (missingNs.length) { console.error('the ns.json addition quotes numbers no wire line holds: ' + missingNs.join(', ')); process.exitCode = 1; return; }
    cur.statement = base + add;
    cur.printed = [...printedBase, ...wireLines];
    cur.wire = { at, command, node: process.version, file: rel(OUT), barMet, met, heldOut: { ids: 'split.heldOut.ids', sameAsInduce: sameIds, induceAt: indv.at }, flips: { ns: { rightToWrong: nsF.rightToWrong, wrongToRight: nsF.wrongToRight, program: nsF.program, programRight: nsF.programRight }, site: { rightToWrong: siteF.rightToWrong, wrongToRight: siteF.wrongToRight, program: siteF.program, programRight: siteF.programRight } }, preemptTotal, humanevalNumbers: heF.program, siteSame, poolToday: today.pool, storeSha256: storeSha };
    fs.writeFileSync(nsFile, JSON.stringify(cur, null, 2) + '\n');
    console.log('wrote bench/verdicts/ns.json (the wire block, ' + wireLines.length + ' wire lines, and the statement addition)');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error(e && e.stack || e); process.exitCode = 1; });
}
