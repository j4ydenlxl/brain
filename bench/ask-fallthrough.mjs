#!/usr/bin/env node
// bench/ask-fallthrough.mjs: the memory miss of the ask endpoint, as a person on a phone reads it
// (board 25, item ask-fallthrough; his 2026-09-27 09:28 "it said it couldnt respond").
// Author: board 25 builder.
//
//   node bench/ask-fallthrough.mjs --heldout bench/ask-fallthrough-heldout.jsonl [--scratch DIR] [--keep]
//
// MODEL OFF: every request goes through act/ask-http.mjs createHandler({ stateDir }) with an empty
// environment, so the model cell is the null provider (no socket, no model call), exactly the
// server's NOT_CONFIGURED state on dilation.dev tonight.
//
// TWO ARMS, one handler each:
//   deploy  the deployed file set: the tree copied to a scratch directory with every anchored
//           pattern of .vercelignore dropped (so bench/fixtures, and with it the knowledge store,
//           is absent, as it is on the server he typed "hey" into), every dotfile and state/ dropped
//   tree    act/ask-http.mjs in place, on this host (the wiki knowledge store opens when ingested)
// THE CONTROL: every prompt is posted twice on the same handler, once with FALLTHROUGH.on false (the
// text before this item) and once on, interleaved per prompt (even prompts on first, odd off first).
//
// It prints, per arm and per set: uncarried prompts whose first line is a sentence for a person
// n of N, the old line surviving as line two of every miss, carried prompts whose text changed n of N
// (a labeled carried prompt that is a bare memory miss ON THIS ARM is not carried there, and is
// listed apart), the footer fields present, and the median serverUs on and off.
// Writes bench/verdicts/ask-fallthrough.json (isTheBar true) with --heldout, else
// bench/verdicts/ask-fallthrough-partial.json (isTheBar false). Nothing here writes over 100 MB:
// the deploy copy is about 20 MB and is deleted at the end unless --keep.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const VERDICTS = path.join(HERE, 'verdicts');

// ---------------------------------------------------------------- the development prompts
// Written here by the builder. None of them is in test/ask-fallthrough.test.mjs.
export const DEV_UNCARRIED = [
  'sing me a song', 'what should i eat for dinner', 'plan a trip to tokyo', 'write an essay about climate change',
  'tell me a story about a dragon', 'what is the weather like', 'give me a recipe for pancakes', 'who is going to win the election',
  'help me write a cover letter', 'draw a cat', 'what time is it in london', 'fix the bug in my code',
  'recommend a movie for tonight', 'how do i learn guitar', 'write a haiku about autumn', 'play a game with me',
  'what are the latest news', 'convert this pdf to word', 'teach me spanish', 'hey, how are you',
];
export const DEV_CARRIED = [
  'hi', 'hello', 'who are you', 'what can you do', 'thanks', 'goodbye', 'what is your name', 'how are you',
  'what is 17 times 23', '15 percent of 200', 'x + 3 = 11', 'what is 2 + 2', '1/3 + 1/6', '2^10', 'what is 7 * 8 - 5', 'what is 3 plus 4',
];

// ---------------------------------------------------------------- the readers
const MISS_RE = /^nothing in memory matches /;
/** The first line is a sentence a person reads: ends with a period, under 240 chars, not the old line. */
export function firstLineForPerson(text) {
  const first = String(text ?? '').split('\n')[0];
  return first.length > 0 && first.length < 240 && first.endsWith('.') && !/nothing in memory/i.test(first);
}
/** The native text carries the nanoseconds the grammar took; two runs differ there and nowhere else. */
export const normaliseClock = (s) => String(s ?? '').replace(/\(kind ([^,()]+), \d+ ns\)/g, '(kind $1, N ns)');
/** A bare memory miss: zero hits, no page, the null provider standing in, the old line as the text. */
export function isMiss(j) {
  if (!j || !j.provenance || !j.llm) return false;
  return j.from === 'memory' && j.provenance.answer === 'memory' && j.provenance.memoryHits === 0 && j.provenance.webPages === 0
    && j.llm.provider === 'null' && !j.llm.fellBack && MISS_RE.test(String(j.text));
}
const median = (xs) => { const s = xs.filter(Number.isFinite).sort((a, b) => a - b); return s.length ? s[Math.floor((s.length - 1) / 2)] : null; };

// ---------------------------------------------------------------- the deployed file set
/** The anchored patterns of .vercelignore as tests on a repo-relative, slash separated path. */
function vercelIgnore() {
  const lines = fs.readFileSync(path.join(ROOT, '.vercelignore'), 'utf8').split(/\r?\n/).map((s) => s.trim()).filter((s) => s && !s.startsWith('#'));
  const esc = (s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  return lines.map((p) => {
    const anchored = p.startsWith('/');
    const body = (anchored ? p.slice(1) : p).replace(/\/$/, '').split('*').map(esc).join('[^/]*');
    return new RegExp((anchored ? '^' : '(^|/)') + body + '(/|$)');
  });
}
/** Copy the tree minus .vercelignore, every dotfile and state/ (credentials and runtime are never opened). */
export function deployCopy(dest) {
  const ignore = vercelIgnore();
  let files = 0, bytes = 0;
  fs.cpSync(ROOT, dest, {
    recursive: true,
    filter: (src) => {
      const rel = path.relative(ROOT, src).split(path.sep).join('/');
      if (rel === '') return true;
      if (rel.split('/').some((seg) => seg.startsWith('.'))) return false;
      if (rel === 'state' || rel.startsWith('state/') || rel === 'node_modules' || rel.startsWith('node_modules/')) return false;
      if (ignore.some((re) => re.test(rel))) return false;
      const st = fs.statSync(src);
      if (st.isFile()) { files++; bytes += st.size; }
      return true;
    },
  });
  return { files, mb: Math.round(bytes / 1048576 * 10) / 10 };
}

// ---------------------------------------------------------------- one arm
async function runArm(name, base, scratch, sets) {
  const t0 = performance.now();
  const httpMod = await import(pathToFileURL(path.join(base, 'act', 'ask-http.mjs')).href);
  const P = await import(pathToFileURL(path.join(base, 'act', 'prompt.mjs')).href);
  if (!P.FALLTHROUGH || typeof P.FALLTHROUGH.on !== 'boolean') throw new Error(name + ': act/prompt.mjs has no FALLTHROUGH switch');
  const h = httpMod.createHandler({ stateDir: path.join(scratch, name + '-state') });
  let n = 0;
  const post = async (prompt, on) => {
    P.FALLTHROUGH.on = on;
    try {
      const r = await h({ method: 'POST', body: JSON.stringify({ prompt }), ip: 'bench-' + name + '-' + (n++), env: {} });
      return r;
    } finally { P.FALLTHROUGH.on = true; }
  };
  const view = (r) => {
    const j = r.json || {};
    return {
      status: r.status, text: j.text ?? null, from: j.from ?? null, route: j.route ?? null,
      answer: j.provenance ? j.provenance.answer : null, hits: j.provenance ? j.provenance.memoryHits : null, pages: j.provenance ? j.provenance.webPages : null,
      provider: j.llm ? j.llm.provider : null, fellBack: j.llm ? j.llm.fellBack : null, reason: j.llm ? j.llm.reason : null,
      serverUs: j.serverUs ?? null, shape: httpMod.FOOTER.every((k) => k in j), knowledgeReady: j.knowledge ? j.knowledge.ready : null, miss: isMiss(j),
    };
  };
  const rows = [];
  let i = 0;
  for (const [set, list] of Object.entries(sets)) {
    for (const item of list) {
      const order = i++ % 2 === 0 ? [true, false] : [false, true];
      const got = {};
      for (const on of order) got[on ? 'on' : 'off'] = view(await post(item.prompt, on));
      const { on, off } = got;
      const fieldsSame = ['status', 'from', 'route', 'answer', 'hits', 'pages', 'provider', 'fellBack', 'reason'].every((k) => on[k] === off[k]);
      const changed = normaliseClock(on.text) !== normaliseClock(off.text);
      const lines = String(on.text ?? '').split('\n');
      rows.push({
        set, label: item.carried ? 'carried' : 'uncarried', prompt: item.prompt, route: on.route, from: on.from, answer: on.answer,
        missOff: off.miss, person: firstLineForPerson(on.text), oldSurvives: off.miss ? lines[1] === off.text : null,
        changed, fieldsSame, shape: on.shape && off.shape, status: [on.status, off.status], usOn: on.serverUs, usOff: off.serverUs,
        firstLine: lines[0].slice(0, 240), knowledgeReady: on.knowledgeReady,
      });
    }
  }
  return { name, rows, ms: Math.round(performance.now() - t0), requests: n };
}

/** The counts one set prints and the verdict keeps. */
function tally(rows) {
  const unc = rows.filter((r) => r.label === 'uncarried');
  const car = rows.filter((r) => r.label === 'carried');
  const carOnArm = car.filter((r) => !r.missOff);
  const uncMiss = unc.filter((r) => r.missOff);
  return {
    uncarried: unc.length,
    uncarriedPerson: unc.filter((r) => r.person).length,
    uncarriedMiss: uncMiss.length,
    uncarriedChanged: unc.filter((r) => r.changed).length,
    uncarriedMissPerson: uncMiss.filter((r) => r.person).length,
    oldSurvives: uncMiss.filter((r) => r.oldSurvives).length,
    uncarriedCarriedHere: unc.filter((r) => !r.missOff).map((r) => r.route + '/' + r.answer).reduce((m, k) => { m[k] = (m[k] || 0) + 1; return m; }, {}),
    carried: car.length,
    carriedChangedRaw: car.filter((r) => r.changed).length,
    carriedOnArm: carOnArm.length,
    carriedChanged: carOnArm.filter((r) => r.changed).length,
    carriedMissHere: car.filter((r) => r.missOff).map((r) => r.route + '/' + r.answer).reduce((m, k) => { m[k] = (m[k] || 0) + 1; return m; }, {}),
    fieldsChanged: rows.filter((r) => !r.fieldsSame).length,
    shape: rows.filter((r) => r.shape).length,
    status200: rows.filter((r) => r.status[0] === 200 && r.status[1] === 200).length,
    n: rows.length,
    usOnMedianMiss: median(uncMiss.map((r) => r.usOn)),
    usOffMedianMiss: median(uncMiss.map((r) => r.usOff)),
  };
}

// ---------------------------------------------------------------- main
function parseArgs(argv) {
  const o = { heldout: null, scratch: null, keep: false, author: 'the VERIFY plane of board 25 (docs/boards/board-25.js item ask-fallthrough), not the builder of this bench' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--heldout') o.heldout = argv[++i];
    else if (a === '--scratch') o.scratch = argv[++i];
    else if (a === '--heldout-author') o.author = argv[++i];
    else if (a === '--keep') o.keep = true;
    else throw new Error('unknown argument ' + a + ': --heldout FILE [--scratch DIR] [--heldout-author TEXT] [--keep]');
  }
  return o;
}

function readHeldout(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const items = [];
  for (const [k, line] of raw.split(/\r?\n/).entries()) {
    if (!line.trim()) continue;
    let j;
    try { j = JSON.parse(line); } catch { throw new Error(file + ' line ' + (k + 1) + ' is not JSON'); }
    if (typeof j.prompt !== 'string' || typeof j.carried !== 'boolean') throw new Error(file + ' line ' + (k + 1) + ' needs {prompt: string, carried: boolean}');
    items.push({ prompt: j.prompt, carried: j.carried });
  }
  let git = null;
  const g = spawnSync('git', ['log', '-1', '--format=%an %cs %h', '--', path.relative(ROOT, path.resolve(file))], { cwd: ROOT, encoding: 'utf8' });
  if (g.status === 0 && g.stdout.trim()) git = g.stdout.trim();
  return { items, sha256: crypto.createHash('sha256').update(raw).digest('hex'), bytes: Buffer.byteLength(raw), mtime: fs.statSync(file).mtime.toISOString(), git };
}

async function main() {
  const cfg = parseArgs(process.argv.slice(2));
  const started = performance.now();
  const held = cfg.heldout ? readHeldout(path.resolve(cfg.heldout)) : null;
  const scratch = cfg.scratch ? path.resolve(cfg.scratch) : fs.mkdtempSync(path.join(os.tmpdir(), 'ask-fallthrough-'));
  fs.mkdirSync(scratch, { recursive: true });
  const say = (s) => console.log(s);
  const sets = {
    devUncarried: DEV_UNCARRIED.map((prompt) => ({ prompt, carried: false })),
    devCarried: DEV_CARRIED.map((prompt) => ({ prompt, carried: true })),
    ...(held ? { heldout: held.items } : {}),
  };
  let copy = null;
  const arms = {};
  try {
    const dest = path.join(scratch, 'deploy');
    fs.rmSync(dest, { recursive: true, force: true });
    copy = deployCopy(dest);
    say(`deploy copy: ${copy.files} files, ${copy.mb} MB, .vercelignore applied, dotfiles and state/ dropped`);
    for (const [name, base] of [['deploy', dest], ['tree', ROOT]]) {
      const arm = await runArm(name, base, scratch, sets);
      const bySet = {};
      for (const set of Object.keys(sets)) bySet[set] = tally(arm.rows.filter((r) => r.set === set));
      arms[name] = { ...arm, bySet, knowledgeReady: arm.rows.length ? arm.rows[0].knowledgeReady : null };
      say(`\narm ${name} (knowledge store ready ${arms[name].knowledgeReady}, ${arm.requests} requests, ${arm.ms} ms)`);
      for (const [set, t] of Object.entries(bySet)) {
        if (t.uncarried) {
          say(`  ${set}: uncarried prompts whose first line is a sentence for a person ${t.uncarriedPerson} of ${t.uncarried}`);
          say(`  ${set}: uncarried prompts that reached the memory miss ${t.uncarriedMiss} of ${t.uncarried}; first line for a person ${t.uncarriedMissPerson} of ${t.uncarriedMiss}; old line survives as line two ${t.oldSurvives} of ${t.uncarriedMiss}; text changed against the control ${t.uncarriedChanged} of ${t.uncarried}; carried here instead ${JSON.stringify(t.uncarriedCarriedHere)}`);
          say(`  ${set}: median serverUs on a miss, fall through on ${t.usOnMedianMiss} off ${t.usOffMedianMiss}`);
        }
        if (t.carried) {
          say(`  ${set}: carried prompts whose text changed ${t.carriedChanged} of ${t.carriedOnArm} (labeled carried ${t.carried}, raw changed ${t.carriedChangedRaw}, a bare memory miss on this arm ${JSON.stringify(t.carriedMissHere)})`);
        }
        say(`  ${set}: fields other than text changed ${t.fieldsChanged} of ${t.n}; JSON shape fields present ${t.shape} of ${t.n}; status 200 on and off ${t.status200} of ${t.n}`);
      }
    }
  } finally {
    if (!cfg.keep) fs.rmSync(scratch, { recursive: true, force: true });
  }
  const seconds = Math.round((performance.now() - started) / 10) / 100;
  const rssMb = Math.round(process.memoryUsage().rss / 1048576);
  const D = arms.deploy.bySet, T = arms.tree.bySet;
  const H = held ? { d: D.heldout, t: T.heldout } : null;
  const devOk = D.devUncarried.uncarriedPerson === D.devUncarried.uncarried && D.devCarried.carriedChanged === 0 && T.devCarried.carriedChanged === 0;
  const barMet = !!H
    && H.d.uncarried > 0 && H.d.uncarriedPerson === H.d.uncarried
    && H.d.oldSurvives === H.d.uncarriedMiss
    && H.d.carried > 0 && H.d.carriedChanged === 0 && H.t.carriedChanged === 0
    && H.t.uncarriedMissPerson === H.t.uncarriedMiss
    && H.d.fieldsChanged === 0 && H.t.fieldsChanged === 0
    && H.d.shape === H.d.n && H.t.shape === H.t.n && H.d.status200 === H.d.n && H.t.status200 === H.t.n;
  say(`\nbar: held-out uncarried first line for a person ${H ? H.d.uncarriedPerson + ' of ' + H.d.uncarried : 'n/a'} (deploy), held-out carried text changed ${H ? H.d.carriedChanged + ' of ' + H.d.carriedOnArm + ' (deploy), ' + H.t.carriedChanged + ' of ' + H.t.carriedOnArm + ' (tree)' : 'n/a'}; barMet ${barMet}; ${seconds} s, rss ${rssMb} MB`);

  const misses = (rows) => rows.filter((r) => (r.label === 'uncarried' && !r.person) || (r.label === 'carried' && !r.missOff && r.changed) || !r.fieldsSame || !r.shape)
    .map((r) => ({ label: r.label, prompt: r.prompt, route: r.route, answer: r.answer, person: r.person, changed: r.changed, fieldsSame: r.fieldsSame, firstLine: r.firstLine }));
  const stripRows = (arm, keepHeld) => arm.rows.filter((r) => keepHeld || r.set !== 'heldout').map((r) => ({ set: r.set, label: r.label, prompt: r.prompt, route: r.route, from: r.from, answer: r.answer, missOff: r.missOff, person: r.person, oldSurvives: r.oldSurvives, changed: r.changed, fieldsSame: r.fieldsSame, usOn: r.usOn, usOff: r.usOff }));
  const statement = H
    ? `A person who types something the organism does not carry into dilation.dev/ask used to read one line, "nothing in memory matches <words>.", which reads as a refusal. Through the endpoint's own handler (act/ask-http.mjs, no model configured, the null provider, no socket), on the deployed file set copied from this tree with .vercelignore applied, ${H.d.uncarriedPerson} of ${H.d.uncarried} held-out uncarried prompts now open with a sentence for a person that says what the organism does carry and that no language model is configured on this host, and the old line survives as the second line of ${H.d.oldSurvives} of ${H.d.uncarriedMiss} misses. Against the control (the same handler with the fall through switched off, interleaved per prompt), ${H.d.carriedChanged} of ${H.d.carriedOnArm} held-out carried prompts changed their text on the deployed set and ${H.t.carriedChanged} of ${H.t.carriedOnArm} on this host with its knowledge store open, and ${H.d.fieldsChanged + H.t.fieldsChanged} answers changed any field other than the text. The held-out file was written by ${cfg.author}; the development prompts were written in this bench. The bar ${barMet ? 'is met' : 'is not met'}.`
    : `Development run without a held-out file: on the deployed file set ${D.devUncarried.uncarriedPerson} of ${D.devUncarried.uncarried} development uncarried prompts open with a sentence for a person, and ${D.devCarried.carriedChanged} of ${D.devCarried.carriedOnArm} development carried prompts changed their text against the control (${T.devCarried.carriedChanged} of ${T.devCarried.carriedOnArm} on this host). This is not the bar: the bar needs the held-out file the verify plane writes.`;
  const verdict = {
    at: new Date().toISOString(),
    command: 'node bench/ask-fallthrough.mjs' + (cfg.heldout ? ' --heldout ' + path.relative(ROOT, path.resolve(cfg.heldout)).split(path.sep).join('/') : ''),
    node: process.version,
    isTheBar: !!held,
    barMet: held ? barMet : false,
    developmentMet: devOk,
    split: {
      development: `${DEV_UNCARRIED.length} uncarried and ${DEV_CARRIED.length} carried prompts written in bench/ask-fallthrough.mjs by the builder`,
      heldOut: held ? path.relative(ROOT, path.resolve(cfg.heldout)).split(path.sep).join('/') : 'none',
      heldOutAuthor: held ? cfg.author : null,
      heldOutSha256: held ? held.sha256 : null,
      heldOutLines: held ? held.items.length : 0,
      heldOutUncarried: held ? held.items.filter((x) => !x.carried).length : 0,
      heldOutCarried: held ? held.items.filter((x) => x.carried).length : 0,
      heldOutGit: held ? held.git : null,
      heldOutMtime: held ? held.mtime : null,
      contaminated: false,
      why: held ? 'the builder never read the held-out file; its sha256 is recorded so a later reader can check it is the file that decided' : 'no held-out file was given: this run is development only and is not the bar',
    },
    control: 'the same handler with act/prompt.mjs FALLTHROUGH.on false (the memory-miss text as it was before this item), posted beside every on request, interleaved per prompt (even prompts on first, odd off first)',
    model: 'off: createHandler with an empty environment, so provider null (NOT_CONFIGURED), no socket, no model call',
    arms: {
      deploy: { what: 'the tree copied to a scratch directory with .vercelignore applied (no bench/fixtures, so no knowledge store), every dotfile and state/ dropped', copy, knowledgeReady: arms.deploy.knowledgeReady, ms: arms.deploy.ms, requests: arms.deploy.requests, bySet: D },
      tree: { what: 'act/ask-http.mjs in place on this host', knowledgeReady: arms.tree.knowledgeReady, ms: arms.tree.ms, requests: arms.tree.requests, bySet: T },
    },
    definitions: {
      person: 'the first line of the text is under 240 chars, ends with a period and does not contain "nothing in memory"',
      miss: 'the control answer: from memory, provenance.answer memory, memoryHits 0, webPages 0, llm.provider null, no fellBack, text starting "nothing in memory matches"',
      carriedChanged: 'a labeled carried prompt that is not a bare miss on that arm whose text differs between fall through on and off, the native nanoseconds normalised',
      oldSurvives: 'line two of the on text equals the whole control text',
    },
    misses: { deploy: misses(arms.deploy.rows), tree: misses(arms.tree.rows) },
    rows: { deploy: stripRows(arms.deploy, false), tree: stripRows(arms.tree, false) },
    seconds, rssMb,
    statement,
  };
  const out = path.join(VERDICTS, held ? 'ask-fallthrough.json' : 'ask-fallthrough-partial.json');
  fs.writeFileSync(out, JSON.stringify(verdict, null, 2) + '\n');
  say('wrote ' + path.relative(ROOT, out).split(path.sep).join('/'));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then(() => process.exit(0), (e) => { console.error(e && e.stack || e); process.exit(1); });
}
