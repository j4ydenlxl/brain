// self/mistakes.mjs: THE MISTAKE LEDGER. Every graded row the organism answered wrong or refused, read back from the
// five places the benches left it, one uniform row each, grouped into lessons, and asked again with no model.
// Author: board 34 builder (item mistakes). MODEL OFF: nothing here opens a socket; the re-ask is ask() with
// provider 'null' on the brain bench/conceive.mjs builds (seeds/basic.mjs seedBasic).
//
// His orders 5 and 6 (docs/VISION.md): adaptive reasoning, learning from mistakes, self iteration. Before this file a
// mistake was written down by the bench that graded it and read by nothing, so it was made again at the next bar. A
// GAP (self/gaps.mjs) is a bar not met; a MISTAKE is one graded row answered wrong or refused, a finer grain.
//
// THE SOURCES, each with its own reader; a file that is absent is reported absent, never skipped:
//   gsm8k      bench/verdicts/public/gsm8k-public_1.jsonl: organism arm rows with ok false (the last row per id)
//   humaneval  bench/verdicts/public/humaneval-public_1.jsonl: the same
//   conceive   bench/verdicts/conceive.json rows: arm organism, a gradeable row not graded true
//   answer     bench/verdicts/answer.json rows: arms organism and null (both are the organism; alone is the model by
//              itself and is not read), ok false
//   arc        bench/verdicts/grid-curve-evaluation-30000ms.jsonl: one row per ARC-AGI-1 evaluation task at 30 s, not
//              solved; each also carries its status at 3 s from bench/verdicts/grid-attempts-evaluation-3000ms.jsonl
// Beside each, THE SOURCE'S OWN COUNT from the summary its bench wrote: public-gsm8k.json and public-humaneval.json
// arms.organism n minus correct, conceive.json arms.organism gradeablePresent minus correct, answer.json
// arms.organism and arms.null n minus correct, grid-curve.json the point whose journal is the 30 s file, of minus
// solved. The ledger counts rows; the summaries count arms; the two must agree.
//
// A READER FAILS LOUDLY (ShapeError) on a row shape it has not seen: a key outside its accepted set, a missing key,
// a row type or an arm it does not know. A seen shape whose VALUES it cannot classify is why 'unknown', counted.
//
// ONE LEDGER ROW: {source, id, kind, prompt, promptRef, given, wanted, wantedRef, route, provenance, why, detail,
// shape, ownerHint}. prompt holds the text only when its file is committed (bench/conceive-prompts.json); a public test
// record or a fixture item is a pointer {file, key}, and so is a public test answer (wanted null, wantedRef set): the
// ledger never carries a public test answer key, so nothing that learns from it can learn the key.
// WHY: refused (no region answered: a miss text, a region with no number or no candidate, an exhausted grid search),
// wrong-exact (the exact or direct path answered and was wrong), wrong-program (the program tier or the solved
// region), wrong-model (a model cell answered), wrong-memory (the memory or knowledge tier retrieved a wrong passage;
// the census and the answer bench need it), timeout, found-but-wrong (ARC: a program fit every train pair and missed
// the test), unknown (a seen shape with values no rule maps; the bar needs 0).
// DEDUP: the LAST row per (source, id) in file order is the one read (a resumed journal appends), and only then is it
// asked whether it is a mistake: a row answered right on its last reading is never in the ledger.
//
// LESSONS: every row gets a SHAPE. GSM8K, the census and the answer fixture by the operation the prompt asks for,
// read from its text with the small ordered vocabulary OPS below (first match wins); HumanEval by the failing test's
// kind (the error class, a timeout, no candidate); ARC by the transform family: a found-but-wrong task by the learner
// that wrote its last step (capability/grid-dsl.mjs), a timed out or exhausted one by its size relation (same size,
// smaller, larger, mixed), read from the task's own train pairs. A row no rule shapes is 'unshaped' and carried by no
// lesson. Each lesson {shape, count, bySource, examples (3 ids), ownerHint (the module that would carry it)}.
//
// THE RE-ASK (reaskAll): every row whose prompt is on disk, ARC excepted (a grid task is not a prompt; said so), is
// asked through ask() with provider 'null' in ONE worker thread holding one seedBasic brain, warmed with
// bench/conceive.mjs WARM first; a row that has not answered 2000 ms after it was posted is cut (the worker is
// terminated and a fresh one warmed for the next row) and counts refused, timedOut true. The answer is graded by the
// source's own rule (GSM8K: the last number equals the integer after ####, bench/public.mjs; HumanEval: the record's own
// tests in act/run.mjs's sandbox; the census: bench/conceive.mjs gradeAnswer; the answer fixture: bench/answer.mjs
// gradeAnswer) behind one native gate (bench/conceive.mjs isNative: an empty text or a miss text is a refusal).
// now: fixed (answered right), refused (no answer), still (answered wrong, wrong before), wrong-now (answered wrong,
// REFUSED before: a regression by the rule a wrong answer is worse than a refusal). A refused row answered right now
// is LEARNED.
//
//   node self/mistakes.mjs [--json]      builds the ledger in memory and prints per source counts (writes nothing)
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');
const abs = (root, rel) => (path.isAbsolute(rel) ? rel : path.join(root, rel));
export const sha256 = (s) => createHash('sha256').update(s).digest('hex');

export const WHY = Object.freeze(['refused', 'wrong-exact', 'wrong-program', 'wrong-model', 'wrong-memory', 'timeout', 'found-but-wrong', 'unknown']);
export const NOW = Object.freeze(['fixed', 'still', 'refused', 'wrong-now']);
export const SOURCE_NAMES = Object.freeze(['gsm8k', 'humaneval', 'conceive', 'answer', 'arc']);
export const UNSHAPED = 'unshaped';
export const WALL_MS = 2000;

export const FILES = Object.freeze({
  gsm8k: 'bench/verdicts/public/gsm8k-public_1.jsonl',
  gsm8kOwn: 'bench/verdicts/public-gsm8k.json',
  humaneval: 'bench/verdicts/public/humaneval-public_1.jsonl',
  humanevalOwn: 'bench/verdicts/public-humaneval.json',
  conceive: 'bench/verdicts/conceive.json',
  conceivePrompts: 'bench/conceive-prompts.json',
  answer: 'bench/verdicts/answer.json',
  answerQuestions: 'bench/fixtures/answer-questions.json',
  arc: 'bench/verdicts/grid-curve-evaluation-30000ms.jsonl',
  arc3s: 'bench/verdicts/grid-attempts-evaluation-3000ms.jsonl',
  arcOwn: 'bench/verdicts/grid-curve.json',
  gsm8kFixture: 'bench/fixtures/public/gsm8k/test.jsonl',
  humanevalFixture: 'bench/fixtures/public/humaneval/humaneval-js.jsonl',
  arcFixtureDir: 'bench/fixtures/public/arc-agi-1/evaluation',
  ledger: 'bench/verdicts/mistakes-ledger.jsonl',
  reask: 'bench/verdicts/mistakes-reask.jsonl',
  verdict: 'bench/verdicts/mistakes.json',
  heldOut: 'bench/verdicts/mistakes-heldout.json',
});

// ---------------------------------------------------------------- shapes a reader accepts
export class ShapeError extends Error {
  constructor(source, where, msg) { super(source + ' ' + where + ': ' + msg); this.name = 'ShapeError'; this.source = source; this.where = where; }
}
/** Throw unless every required key is present and every key present is required or allowed. */
export function checkKeys(source, where, row, spec) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) throw new ShapeError(source, where, 'a row that is not an object');
  for (const k of spec.required) if (!Object.prototype.hasOwnProperty.call(row, k)) throw new ShapeError(source, where, 'a row without ' + k + ' (keys ' + Object.keys(row).join(',') + ')');
  for (const k of Object.keys(row)) if (!spec.required.includes(k) && !spec.allowed.includes(k)) throw new ShapeError(source, where, 'a key this reader has not seen: ' + k);
}
/** JSON lines; an unparseable LAST line is a torn append and is counted, an unparseable line anywhere else throws. */
export function parseJsonl(source, text) {
  const lines = String(text ?? '').split(/\r?\n/);
  let last = lines.length - 1;
  while (last >= 0 && !lines[last].trim()) last--;
  const rows = [];
  let torn = 0;
  for (let i = 0; i <= last; i++) {
    if (!lines[i].trim()) continue;
    try { rows.push({ line: i + 1, row: JSON.parse(lines[i]) }); } catch {
      if (i === last) { torn++; continue; }
      throw new ShapeError(source, 'line ' + (i + 1), 'a line that is not JSON');
    }
  }
  return { rows, torn };
}

/** The provenance an ANSWERED wrong row carries, as a why. Anything else is unknown. */
export const PROVENANCE_WHY = Object.freeze({
  exact: 'wrong-exact', direct: 'wrong-exact', solved: 'wrong-program', program: 'wrong-program', memory: 'wrong-memory',
  'model+exact': 'wrong-model', 'model+memory': 'wrong-model', model: 'wrong-model',
});
export const answeredWhy = (prov) => PROVENANCE_WHY[prov] || 'unknown';

// ---------------------------------------------------------------- reader: the public journals (gsm8k, humaneval)
export const PUBLIC_ARMS = Object.freeze(['organism', 'alone', 'null', 'repair', 'plan']);
export const PUBLIC_SHAPES = Object.freeze({
  header: { required: ['type', 'at', 'node', 'fingerprint', 'command'], allowed: [] },
  gsm8k: {
    required: ['type', 'id', 'arm', 'ok', 'got', 'provenance', 'route', 'native'],
    allowed: ['at', 'ms', 'chars', 'redacted', 'us', 'region', 'tokens', 'capped', 'lookupNs', 'directSource'],
  },
  humaneval: {
    required: ['type', 'id', 'arm', 'ok', 'error', 'timedOut', 'provenance', 'route', 'native', 'codeChars'],
    allowed: ['at', 'ms', 'testMs', 'cutAt', 'redacted', 'us', 'region', 'tokens', 'capped', 'lookupNs', 'directSource'],
  },
});
/** The code region's miss text ("the code region produced no candidate: ...") handed to the test runner as code
 * fails to parse on its second word: a refusal the public bench graded as a wrong answer. */
export const NO_CANDIDATE_RE = /^SyntaxError: Unexpected identifier 'code'/;

export function whyPublic(set, r) {
  if (set === 'gsm8k') {
    if (r.got === null || r.got === undefined) return r.region && r.region.allFailed === true ? 'refused' : 'unknown';
    return answeredWhy(r.provenance);
  }
  if (r.timedOut === true) return 'timeout';
  if (r.provenance === 'model' && NO_CANDIDATE_RE.test(String(r.error || ''))) return 'refused';
  if (r.codeChars === 0) return 'refused';
  return answeredWhy(r.provenance);
}

function detailPublic(set, r) {
  const g = r.region || null;
  if (set === 'gsm8k') {
    if (!g) return 'no region record';
    if (g.allFailed) return 'math region: every one of ' + g.k + ' programs failed, no number';
    const v = g.vote || {};
    return 'math region: vote ' + v.count + ' of ' + v.valid + ' valid (k ' + g.k + '), checker ' + (g.verdict ?? 'none');
  }
  const e = r.error ? String(r.error).split(':')[0] : 'no error';
  return (g ? 'code region: extracted ' + g.extracted + ', passed its visible examples ' + g.passedExtracted + ', kept ' + g.keptPhase + (g.repaired ? ', repaired' : '') + '; ' : '') + e;
}

export function readPublic(set, text, file = FILES[set]) {
  const shape = PUBLIC_SHAPES[set];
  if (!shape || set === 'header') throw new Error('readPublic takes gsm8k or humaneval, got ' + set);
  const { rows, torn } = parseJsonl(set, text);
  const last = new Map();
  let headers = 0, otherArms = 0, organismRows = 0;
  for (const { line, row } of rows) {
    const where = file + ':' + line;
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new ShapeError(set, where, 'a line that is not an object');
    if (row.type === 'header') { checkKeys(set, where, row, PUBLIC_SHAPES.header); headers++; continue; }
    if (row.type !== 'arm') throw new ShapeError(set, where, 'a row of type ' + JSON.stringify(row.type));
    if (!PUBLIC_ARMS.includes(row.arm)) throw new ShapeError(set, where, 'an arm this reader has not seen: ' + JSON.stringify(row.arm));
    if (row.arm !== 'organism') { otherArms++; continue; }
    checkKeys(set, where, row, shape);
    if (typeof row.ok !== 'boolean') throw new ShapeError(set, where, 'ok is not a boolean');
    if (typeof row.id !== 'string' || !row.id) throw new ShapeError(set, where, 'id is not a string');
    if (set === 'gsm8k' && !/^gsm8k\.\d+$/.test(row.id)) throw new ShapeError(set, where, 'an id that is not gsm8k.<index>: ' + row.id);
    organismRows++;
    last.set(row.id, row);
  }
  const mistakes = [];
  for (const [id, r] of last) {
    if (r.ok !== false) continue;
    const idx = set === 'gsm8k' ? Number(id.split('.')[1]) : null;
    mistakes.push({
      source: set, id, kind: set === 'gsm8k' ? 'word-problem' : 'code',
      prompt: null,
      promptRef: set === 'gsm8k'
        ? { file: FILES.gsm8kFixture, key: 'line ' + (idx + 1) + ': question', asked: 'the question and "Answer with the final number." (bench/public.mjs ALONE_PROMPT)' }
        : { file: FILES.humanevalFixture, key: 'name ' + id + ': prompt' },
      given: set === 'gsm8k' ? (r.got ?? null) : (r.error ? String(r.error).slice(0, 160) : null),
      wanted: null,
      wantedRef: set === 'gsm8k' ? { file: FILES.gsm8kFixture, key: 'line ' + (idx + 1) + ': the integer after ####' } : { file: FILES.humanevalFixture, key: 'name ' + id + ': tests' },
      route: r.route ?? null, provenance: r.provenance ?? null, why: whyPublic(set, r), detail: detailPublic(set, r),
    });
  }
  return { name: set, file, rows: last.size, organismRows, duplicates: organismRows - last.size, otherArms, headers, torn, mistakes };
}

// ---------------------------------------------------------------- reader: the census (bench/verdicts/conceive.json)
export const CONCEIVE_ARMS = Object.freeze(['organism', 'organism-site', 'model']);
export const CONCEIVE_ROW = Object.freeze({
  required: ['id', 'kind', 'arm', 'gradeType', 'ns', 'chars', 'route', 'from', 'provenance', 'absent'],
  allowed: ['native', 'refused', 'graded', 'gradedLoose', 'firstLine', 'text', 'llm', 'error', 'reason'],
});
export const CONCEIVE_ORGANISM = Object.freeze(['native', 'refused', 'graded', 'firstLine']);
export const GRADE_TYPES_READ = Object.freeze(['exact', 'contains', 'regex', 'code', 'length', 'none']);

export function whyConceive(r) {
  if (r.refused === true && r.native === false) return 'refused';
  if (r.native === true) return answeredWhy(r.provenance);
  return 'unknown';
}

/** What the rubric wanted, compactly (the prompt file is committed, so the rubric is public already). */
export function wantedOfGrade(g) {
  if (!g) return null;
  switch (g.type) {
    case 'exact': return { type: 'exact', answer: g.answer, ...(g.alts ? { alts: g.alts } : {}) };
    case 'contains': return { type: 'contains', ...(g.all ? { all: g.all } : {}), ...(g.any ? { any: g.any } : {}) };
    case 'regex': return { type: 'regex', pattern: g.pattern };
    case 'code': return { type: 'code', entry: g.entry, tests: Array.isArray(g.tests) ? g.tests.length : null };
    case 'length': { const out = { type: 'length' }; for (const [k, v] of Object.entries(g)) if (k !== 'type') out[k] = v; return out; }
    default: return { type: g.type };
  }
}

export function readConceive(v, prompts = null, file = FILES.conceive) {
  if (!v || typeof v !== 'object' || !Array.isArray(v.rows)) throw new ShapeError('conceive', file, 'no rows array');
  const byId = new Map(((prompts && prompts.prompts) || []).map((p) => [p.id, p]));
  const last = new Map();
  let organismRows = 0, otherArms = 0;
  v.rows.forEach((r, i) => {
    const where = file + ' rows[' + i + ']';
    checkKeys('conceive', where, r, CONCEIVE_ROW);
    if (!CONCEIVE_ARMS.includes(r.arm)) throw new ShapeError('conceive', where, 'an arm this reader has not seen: ' + JSON.stringify(r.arm));
    if (!GRADE_TYPES_READ.includes(r.gradeType)) throw new ShapeError('conceive', where, 'a grade type this reader has not seen: ' + JSON.stringify(r.gradeType));
    if (r.arm !== 'organism') { otherArms++; return; }
    for (const k of CONCEIVE_ORGANISM) if (!Object.prototype.hasOwnProperty.call(r, k)) throw new ShapeError('conceive', where, 'an organism row without ' + k);
    if (r.absent !== false) throw new ShapeError('conceive', where, 'an ABSENT organism row (the organism arm never waits on a socket)');
    if (r.gradeType !== 'none' && r.graded !== true && r.graded !== false) throw new ShapeError('conceive', where, 'a gradeable organism row with no grade');
    organismRows++;
    last.set(r.id, r);
  });
  const mistakes = [];
  let gradeable = 0;
  for (const [id, r] of last) {
    if (r.gradeType === 'none') continue;
    gradeable++;
    if (r.graded === true) continue;
    const p = byId.get(id) || null;
    mistakes.push({
      source: 'conceive', id, kind: r.kind,
      prompt: p ? p.prompt : null,
      promptRef: { file: FILES.conceivePrompts, key: 'id ' + id },
      given: r.native ? String(r.text ?? r.firstLine ?? '').slice(0, 200) : String(r.firstLine ?? '').slice(0, 120),
      wanted: p ? wantedOfGrade(p.grade) : null, wantedRef: null,
      route: r.route ?? null, provenance: r.provenance ?? null, why: whyConceive(r),
      detail: (r.native ? 'answered natively from ' + (r.from ?? 'none') : 'refused') + ', graded ' + r.graded + ' by the ' + r.gradeType + ' rubric',
    });
  }
  return { name: 'conceive', file, rows: gradeable, organismRows, duplicates: organismRows - last.size, otherArms, torn: 0, mistakes };
}

// ---------------------------------------------------------------- reader: the answer bench (bench/verdicts/answer.json)
export const ANSWER_ROW = Object.freeze({ required: ['arms', 'expected', 'grade', 'i', 'id', 'order', 'source'], allowed: [] });
export const ANSWER_ARM = Object.freeze({ required: ['ok'], allowed: ['loose', 'candidate', 'ms', 'provenance', 'absent', 'reason'] });
export const ANSWER_ARMS_READ = Object.freeze(['organism', 'null']);
export const ANSWER_ARMS_KNOWN = Object.freeze(['organism', 'alone', 'null']);

export function whyAnswer(a) {
  if (a.provenance === null || a.provenance === undefined) return a.candidate === '' ? 'refused' : 'unknown';
  return answeredWhy(a.provenance);
}

export function readAnswer(v, file = FILES.answer) {
  if (!v || typeof v !== 'object' || !Array.isArray(v.rows)) throw new ShapeError('answer', file, 'no rows array');
  const last = new Map();
  v.rows.forEach((r, i) => {
    const where = file + ' rows[' + i + ']';
    checkKeys('answer', where, r, ANSWER_ROW);
    if (!r.arms || typeof r.arms !== 'object') throw new ShapeError('answer', where, 'arms is not an object');
    for (const [arm, a] of Object.entries(r.arms)) {
      if (!ANSWER_ARMS_KNOWN.includes(arm)) throw new ShapeError('answer', where, 'an arm this reader has not seen: ' + arm);
      checkKeys('answer', where + '.arms.' + arm, a, ANSWER_ARM);
    }
    for (const arm of ANSWER_ARMS_READ) if (r.arms[arm] && !r.arms[arm].absent) last.set(r.id + '@' + arm, { r, arm, a: r.arms[arm] });
  });
  const mistakes = [];
  for (const [id, { r, arm, a }] of last) {
    if (a.ok === true) continue;
    if (a.ok !== false) throw new ShapeError('answer', file + ' ' + id, 'ok is not a boolean');
    mistakes.push({
      source: 'answer', id, kind: r.source, prompt: null,
      promptRef: r.source === 'fixture' ? { file: FILES.answerQuestions, key: 'items[' + r.id.split('.')[1] + '].q' } : { file: 'bench/answer.mjs', key: 'buildQuestions({tasksPerSuite: ' + ((v.questions && v.questions.tasksPerSuite) ?? 'n') + '}) id ' + r.id },
      given: a.candidate ?? null, wanted: String(r.expected), wantedRef: null,
      route: null, provenance: a.provenance ?? null, why: whyAnswer(a),
      detail: 'arm ' + arm + (arm === 'null' ? ' (provider null, the bench memory held the fixture)' : ' (the organism with its model cell)') + ', grade ' + r.grade,
    });
  }
  return { name: 'answer', file, rows: last.size, organismRows: last.size, duplicates: 0, otherArms: 0, torn: 0, mistakes };
}

// ---------------------------------------------------------------- reader: the ARC journals
export const ARC_SHAPES = Object.freeze({
  header: { required: ['type', 'split', 'budgetMs', 'attempts', 'ids'], allowed: ['maxDepth', 'workers', 'idsSha', 'onlyTimedOutOf', 'selection', 'createdAt', 'command', 'node', 'memory'] },
  session: { required: ['type', 'n'], allowed: ['startedAt', 'workers', 'command'] },
  sessionEnd: { required: ['type', 'n'], allowed: ['endedAt', 'ran', 'wallSeconds', 'peakRssMb', 'preempted', 'preemptedSeconds', 'admissionWaitSeconds', 'respawned'] },
  row: {
    required: ['type', 'id', 'status', 'solved', 'names', 'attempts', 'attemptRight', 'killed'],
    allowed: ['session', 'endedAt', 'wallMs', 'solvedFirst', 'depth', 'firstMs', 'searched', 'states', 'rejected', 'popped', 'phases', 'ms', 'cells', 'vocabulary', 'heapMb', 'preemptsBefore'],
  },
});

export function whyArc(r) {
  if (r.solved === true) return null;
  if (r.killed === true || r.status === 'timeout') return 'timeout';
  if (r.status === 'found') return 'found-but-wrong';
  if (r.status === 'exhausted') return 'refused';
  return 'unknown';
}

/** Parse one ARC journal: {header, rows (last per id)}. */
export function parseArc(text, file, wantBudgetMs = null) {
  const { rows, torn } = parseJsonl('arc', text);
  let header = null;
  const last = new Map();
  let lines = 0;
  for (const { line, row } of rows) {
    const where = file + ':' + line;
    const spec = row && ARC_SHAPES[row.type];
    if (!spec) throw new ShapeError('arc', where, 'a row of type ' + JSON.stringify(row && row.type));
    checkKeys('arc', where, row, spec);
    if (row.type === 'header') {
      if (header) throw new ShapeError('arc', where, 'a second header');
      header = row;
      if (row.split !== 'evaluation') throw new ShapeError('arc', where, 'split ' + row.split + ', this reader reads the evaluation split');
      if (wantBudgetMs !== null && row.budgetMs !== wantBudgetMs) throw new ShapeError('arc', where, 'budgetMs ' + row.budgetMs + ', expected ' + wantBudgetMs);
      continue;
    }
    if (row.type !== 'row') continue;
    if (typeof row.id !== 'string' || typeof row.solved !== 'boolean') throw new ShapeError('arc', where, 'id or solved of the wrong type');
    lines++;
    last.set(row.id, row);
  }
  if (!header) throw new ShapeError('arc', file, 'no header');
  return { header, rows: last, lines, torn };
}

export function readArc(text30, text3 = null, file = FILES.arc, file3 = FILES.arc3s) {
  const a = parseArc(text30, file, 30000);
  const b = text3 === null ? null : parseArc(text3, file3, 3000);
  const mistakes = [];
  for (const [id, r] of a.rows) {
    const why = whyArc(r);
    if (why === null) continue;
    const at3 = b ? b.rows.get(id) : null;
    const names = Array.isArray(r.names) ? r.names : null;
    mistakes.push({
      source: 'arc', id, kind: 'grid', prompt: null,
      promptRef: { file: FILES.arcFixtureDir + '/' + id + '.json', key: 'train pairs and test inputs' },
      given: names ? names.join(' > ') : null, wanted: null,
      wantedRef: { file: FILES.arcFixtureDir + '/' + id + '.json', key: 'test[*].output' },
      route: 'grid search', provenance: names ? 'program' : null, why,
      detail: 'status ' + r.status + ' at ' + a.header.budgetMs + ' ms, attempts ' + (Array.isArray(r.attempts) ? r.attempts.length : 0) + (at3 ? '; at 3000 ms: ' + (at3.solved ? 'solved' : at3.status) : '; at 3000 ms: not in that journal'),
    });
  }
  return { name: 'arc', file, rows: a.rows.size, organismRows: a.lines, duplicates: a.lines - a.rows.size, otherArms: 0, torn: a.torn + (b ? b.torn : 0), mistakes, header: { budgetMs: a.header.budgetMs, attempts: a.header.attempts, ids: a.header.ids.length }, at3s: b ? { file: file3, rows: b.rows.size } : null };
}

// ---------------------------------------------------------------- the sources' own counts
export function ownCount(name, summary) {
  if (!summary || typeof summary !== 'object') return null;
  try {
    if (name === 'gsm8k' || name === 'humaneval') { const o = summary.arms.organism; return { count: o.n - o.correct, field: 'arms.organism n ' + o.n + ' minus correct ' + o.correct }; }
    if (name === 'conceive') { const o = summary.arms.organism; return { count: o.gradeablePresent - o.correct, field: 'arms.organism gradeablePresent ' + o.gradeablePresent + ' minus correct ' + o.correct }; }
    if (name === 'answer') {
      let c = 0; const parts = [];
      for (const arm of ANSWER_ARMS_READ) { const o = summary.arms[arm]; if (!o || o.absent) continue; c += o.n - o.correct; parts.push('arms.' + arm + ' n ' + o.n + ' minus correct ' + o.correct); }
      return { count: c, field: parts.join(' plus ') };
    }
    if (name === 'arc') {
      const p = (summary.points || []).find((x) => x && x.source && x.source.journal === FILES.arc);
      if (!p) return null;
      return { count: p.of - p.solved, field: 'points[journal ' + FILES.arc + '] of ' + p.of + ' minus solved ' + p.solved + ' (timedOut ' + p.timedOut + ', foundButWrong ' + p.foundButWrong + ', exhausted ' + p.exhausted + ')' };
    }
  } catch { return null; }
  return null;
}

// ---------------------------------------------------------------- the shape vocabulary
const WORD = 'act/word.mjs (the word problem reader: one exact expression per problem)';
const EXACT_READ = 'act/exact-read.mjs (the exact front end every host runs)';
const KNOW = 'act/prompt.mjs knowledgeAnswer (the knowledge tier over bench/fixtures/wiki/store)';
const COMPOSE = 'no module yet: a native composer (lang/ holds only the sym parser and printer)';
const U = (xs) => new RegExp('\\b(?:' + xs.join('|') + ')\\b', 'g');
/** Units by dimension: two different units of one dimension in a prompt is a conversion. */
export const UNIT_DIMS = Object.freeze({
  length: { inch: U(['inch', 'inches']), foot: U(['foot', 'feet']), yard: U(['yards?']), mile: U(['miles?']), meter: U(['meters?', 'metres?']), kilometer: U(['kilometers?', 'kilometres?', 'km']), centimeter: U(['centimeters?', 'cm']), millimeter: U(['millimeters?', 'mm']) },
  mass: { ounce: U(['ounces?', 'oz']), pound: U(['pounds?', 'lbs?']), gram: U(['grams?']), kilogram: U(['kilograms?', 'kg']), ton: U(['tons?']) },
  volume: { cup: U(['cups?']), pint: U(['pints?']), quart: U(['quarts?']), gallon: U(['gallons?']), liter: U(['liters?', 'litres?']), milliliter: U(['milliliters?', 'ml']) },
  money: { cent: U(['cents?']), dollar: /\$\s?\d|\bdollars?\b/g },
  temperature: { celsius: U(['celsius']), fahrenheit: U(['fahrenheit']) },
  time: { second: U(['seconds?']), minute: U(['minutes?']), hour: U(['hours?']) },
  count: { dozen: U(['dozens?']) },
});
export function unitConversion(t) {
  if (/\bconvert\b|\bhow many \w+ (?:are )?in (?:a |an |one |\d)/.test(t)) return true;
  for (const [dim, units] of Object.entries(UNIT_DIMS)) {
    let seen = 0;
    for (const re of Object.values(units)) { re.lastIndex = 0; if (re.test(t)) seen++; }
    if (seen >= 2 || (dim === 'count' && seen >= 1)) return true;
  }
  return false;
}
/** The ordered vocabulary: [shape, test (regex or function on the lower cased prompt), ownerHint]. First match wins:
 * what the prompt asks the organism to DO with language or code first, then the arithmetic of the world from the most
 * specific operation to the most general, then a question of fact. */
export const OPS = Object.freeze([
  ['write code', /\bwrite (?:a |an )?(?:javascript |js |python )?function\b|^\s*\/\/|\bfunction\s+[a-z_$][\w$]*\s*\(/, 'act/code.mjs and reason/synth.mjs (model off there is no candidate writer)'],
  ['read code', /\bwhat does (?:this|the) (?:javascript|python|js|code)\b|\btypeof\b|\bvalue of \w+ after\b|\bevaluate to\b/, 'act/run.mjs (run the snippet in the sandbox and read what it prints)'],
  ['sql', /\bsql\b/, 'no module yet: a SQL writer over a closed grammar'],
  ['shell command', /\bcommand\b|\bnpm\b|\bgit\b/, 'act/shell.mjs (a table of the argvs it may name)'],
  ['translate', /\btranslate\b|\bhow do you say\b|\bin (?:spanish|french|german|italian|japanese|portuguese|romaji)\b/, 'no module yet: a bilingual lexicon'],
  ['summarize', /\bsummar(?:y|ize|ise)\b|\btl;dr\b/, COMPOSE],
  ['rewrite', /\brewrite\b|\bmake this sentence\b|\bcorrect the spelling\b|\bturn this statement\b|\btitle case\b/, COMPOSE],
  ['compose verse', /\b(?:poem|haiku|limerick|couplet|acrostic)\b/, COMPOSE],
  ['compose message', /\bwrite (?:a |an )?[\w -]{0,24}?\b(?:letter|email|postcard|note)\b/, COMPOSE],
  ['compose story or essay', /\b(?:write|tell) (?:a |an |me a )?[\w -]{0,40}?\b(?:story|essay|fable)\b/, COMPOSE],
  ['joke', /\bjoke\b|\bknock-knock\b/, COMPOSE],
  ['riddle', /\bwhat (?:has|gets wetter|goes up|can you catch)\b|\bwhat am i\b/, 'no module yet: a riddle table (a closed set, fixed answers)'],
  ['analogy', /\bis to\b[^?]*\bas\b/, 'no module yet: a relation table (opposite, part of, young of)'],
  ['quiz', /\bquiz\b|\btrivia\b|\bmultiple-choice\b|\btrue or false question\b|\bask me \w+ questions\b/, COMPOSE],
  ['recipe', /\brecipe\b|\bingredients?\b|\bhow do i boil\b/, COMPOSE],
  ['plan', /^\s*(?:plan\b|(?:give|make|outline)(?: me)? an? [\w-]+ plan\b)/, COMPOSE],
  ['list', /^\s*(?:list|name|suggest|brainstorm)\b|\bone per line\b|\bas a (?:bulleted|numbered) list\b|\bas bullets\b|\bideas for\b/, COMPOSE],
  ['advise', /\bwhat (?:should|might|can) i\b|\bwhat might be wrong\b|\bhow can i\b/, COMPOSE],
  ['format', /\bjson\b|\bmarkdown\b|\bin the format\b|\bformat the\b|\bin digits\b|\bthousands separators?\b/, EXACT_READ],
  ['sequence', /\bnext (?:number|term|letter)\b|\bcomes next\b|\bcontinue the pattern\b|\bsequence\b/, 'tasks/sequence.mjs (the verified sequence inducer)'],
  ['logic', /\ball \w+ are\b|\bif no \w+ are\b|\bwho is the (?:shortest|tallest|oldest|youngest)\b|\bodd one out\b|\blargest of these\b|\bthe ground is\b/, 'no module yet: a syllogism and order reader (reason/)'],
  ['classify', /\bclassify\b|\bprime\b|\beven or odd\b|\bwhich word is\b|^\s*is (?:a |an )?\w+ (?:a |an )\w+,? (?:(?:a |an )\w+ )?or (?:a |an )?\w+/, KNOW],
  ['compare', /\bwhich (?:is|has) (?:larger|bigger|heavier|longer|faster|colder|smaller|shorter|hotter|warmer|more)\b|\bcompare\b/, KNOW],
  ['spelling and letters', /\bspell\b|\bbackwards\b|\bcapital letters\b|\balphabetical order\b|\bvowels\b|\bhow many (?:letters|words)\b|\bfirst letter of\b|\bthe letter \w\b|\bas a word\b/, EXACT_READ + ', a string branch'],
  ['vocabulary', /\bplural of\b|\bopposite of\b|\bsynonym\b|\bantonym\b|\bpast tense of\b/, 'no module yet: a lexicon (inflections and antonyms)'],
  ['define', /\bdefine\b|\bwhat does '[^']+' mean\b|^\s*what is (?:a |an )?[a-z]+(?: in [a-z]+)?\?\s*$/, KNOW],
  ['explain', /\bexplain\b|^\s*why\b|\bhow do \w+ make\b|\bwhat causes\b/, KNOW],
  ['probability', /\bprobability\b|\bchance\b/, EXACT_READ],
  ['algebra', /\bsolve\b|\b[a-z]\s*=\s*\d|=\s*\d|\bfind [a-z] when\b|\bvalue of [a-z] makes\b/, 'act/solve.mjs (the linear solver; on the census the program tier answered first)'],
  ['percent', /%|\bpercent(?:age)?\b/, WORD],
  ['fraction of', /\b\d+\s*\/\s*\d+|\bhalf\b|\b(?:a|one|two|three|four)[ -](?:third|quarter|fourth|fifth|sixth|eighth|tenth)s?\b/, WORD],
  ['arithmetic', /\d\s*[+*\u00d7\u00f7]\s*\d|\d\s+-\s+\d|\b\d+\s+(?:plus|minus|times|divided by|multiplied by)\s+\d/, EXACT_READ],
  ['average', /\baverage\b|\bmean\b/, WORD],
  ['clock and calendar', /\b\d{1,2}:\d{2}\b|\b\d{1,2} ?(?:a\.m\.|p\.m\.|am|pm)\b|\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b|\bleap year\b|\bnew year'?s\b|\bwhat (?:day|month)\b|\bwhich month\b|\bhow many months\b/, EXACT_READ + ', a clock and calendar branch'],
  ['unit conversion', unitConversion, EXACT_READ + ', a unit table'],
  ['geometry', /\barea\b|\bperimeter\b|\bangles?\b|\btriangle\b|\brectangle\b|\bhexagon\b|\bsquare (?:feet|foot|footage|meters|inches|yards)\b|\bcircle\b|\bradius\b|\bdegrees\b/, EXACT_READ + ', a geometry branch'],
  ['age', /\byears? old\b|\bhow old\b|\bage\b|\byears ago\b|\bolder than\b|\byounger than\b/, WORD],
  ['rate', /\bper (?:hour|minute|second|day|week|month|year|pound|gallon|mile|foot|inch|kilogram|cup|kilowatt)\b|\bmph\b|\/(?:hour|minute|min|day|week|month|year|gallon|lb|pound)\b|\bspeed\b|\bhow fast\b|\bevery \d+ (?:seconds|minutes|hours|days|weeks|months|years)\b|\bat a rate\b|\ban hour\b|\ba (?:day|week|month|year)\b|\beach (?:day|week|month|year|hour|minute)\b|\bhow long\b/, WORD],
  ['equal share', /\bequally\b|\bevenly\b|\bsplit\b|\bdivide[sd]?\b|\bin each\b|\bon each\b|\bper person\b/, WORD],
  ['remainder', /\bleft ?over\b|\bleftover\b|\bremainder\b/, WORD],
  ['difference', /\bhow (?:many|much) (?:more|less|fewer|longer|shorter|older|younger)\b|\bdifference\b|\bleft\b|\bremain(?:s|ing)?\b|\bstill\b|\bchange\b|\bmore than\b|\bless than\b|\bfewer\b/, WORD],
  ['money', /\$|\bdollars?\b|\bcents?\b|\bcosts?\b|\bprices?\b|\bprofit\b|\bearn(?:s|ed)?\b|\bpa(?:y|ys|id)\b|\bspen(?:d|ds|t)\b|\bsave[sd]?\b|\bsells?\b|\bsold\b|\bbuys?\b|\bbought\b/, WORD],
  ['product', /\btwice\b|\bthrice\b|\btimes\b|\bdouble[sd]?\b|\btriple[sd]?\b|\beach\b|\bevery\b/, WORD],
  ['total', /\btotal\b|\baltogether\b|\bin all\b|\bcombined\b|\btogether\b|\bboth\b|\bsum\b/, WORD],
  ['fact', (t) => /^\s*(?:who|what|which|where|when|in (?:what|which)|how many)\b/.test(t) && !/\d/.test(t), KNOW],
]);
export const OP_NAMES = Object.freeze(OPS.map((o) => o[0]));
export const WORD_OPS = Object.freeze(['percent', 'fraction of', 'average', 'clock and calendar', 'unit conversion', 'age', 'rate', 'equal share', 'remainder', 'difference', 'money', 'product', 'total']);

/** The operation a prompt asks for: {op, ownerHint} or null (unshaped). */
export function opOf(text) {
  const t = String(text ?? '').toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/\s+/g, ' ').trim();
  if (!t) return null;
  for (const [op, test, owner] of OPS) {
    const hit = typeof test === 'function' ? test(t) : test.test(t);
    if (hit) return { op, ownerHint: owner };
  }
  return null;
}

/** The census's own kind, written with each prompt before any arm answered, and the operations the vocabulary may read
 * for it: the control on the vocabulary (agreement is printed, never fitted). */
export const KIND_OPS = Object.freeze({
  arithmetic: ['arithmetic'], algebra: ['algebra'], 'word-problem': WORD_OPS, units: ['unit conversion'], sequence: ['sequence'],
  counting: ['spelling and letters', 'geometry', 'total', 'product', 'fact'], spelling: ['spelling and letters', 'rewrite'],
  vocabulary: ['vocabulary'], logic: ['logic'], calendar: ['clock and calendar', 'unit conversion'], geometry: ['geometry'], fact: ['fact'],
  definition: ['define'], explain: ['explain'], translation: ['translate'], summary: ['summarize'], plan: ['plan'], advice: ['advise', 'list'],
  list: ['list'], brainstorm: ['list'], comparison: ['compare'], classification: ['classify'], rewrite: ['rewrite'], poem: ['compose verse'],
  story: ['compose story or essay'], joke: ['joke'], recipe: ['recipe'], letter: ['compose message'], riddle: ['riddle'],
  essay: ['compose story or essay'], code: ['write code'], 'code-reading': ['read code'], sql: ['sql'], command: ['shell command'],
  format: ['format'], quiz: ['quiz'], analogy: ['analogy'], probability: ['probability'],
});

// ---------------------------------------------------------------- shapes for code and grids
export const CODE_KINDS = Object.freeze({
  AssertionError: ['wrong value (an assertion failed)', 'reason/synth.mjs (sample, test, repair: the visible examples passed, the record tests did not)'],
  SyntaxError: ['does not parse', 'act/code.mjs extractCode (what was handed to the sandbox was not a program)'],
  ReferenceError: ['unbound name', 'act/run.mjs (the sandbox globals) and reason/synth.mjs'],
  TypeError: ['type error', 'reason/synth.mjs'],
  RangeError: ['range error', 'reason/synth.mjs'],
});
export function codeShape(row) {
  if (row.why === 'timeout') return { shape: 'code test: timeout', ownerHint: 'act/run.mjs (the suite wall) and reason/synth.mjs' };
  if (row.why === 'refused') return { shape: 'code test: no candidate (the region refused)', ownerHint: 'reason/synth.mjs (no candidate passed the visible examples); bench/public.mjs graded the miss text as code' };
  const m = /^(\w*Error)\b/.exec(String(row.given || ''));
  if (!m) return null;
  const k = CODE_KINDS[m[1]];
  return k ? { shape: 'code test: ' + k[0], ownerHint: k[1] } : { shape: 'code test: ' + m[1], ownerHint: 'reason/synth.mjs' };
}

/** The size relation of an ARC task's train pairs: one class shared by every pair, else mixed. */
export function gridGeometry(task) {
  const pairs = task && Array.isArray(task.train) ? task.train : [];
  if (!pairs.length) return null;
  const cls = new Set();
  for (const p of pairs) {
    if (!Array.isArray(p.input) || !Array.isArray(p.output) || !p.input.length || !p.output.length) return null;
    const hi = p.input.length, wi = p.input[0].length, ho = p.output.length, wo = p.output[0].length;
    if (hi === ho && wi === wo) cls.add('same size (paint in place)');
    else if (ho * wo < hi * wi) cls.add('smaller output (crop or summarize)');
    else if (ho * wo > hi * wi) cls.add('larger output (tile or scale)');
    else cls.add('same area, new shape');
  }
  return cls.size === 1 ? [...cls][0] : 'mixed sizes';
}
export function gridShape(row, task) {
  if (row.why === 'found-but-wrong') {
    const names = String(row.given || '').split(' > ').filter(Boolean);
    const lastStep = names.length ? names[names.length - 1] : null;
    if (!lastStep) return null;
    const family = lastStep.split(/[^A-Za-z]/)[0] || lastStep;
    return { shape: 'grid program fit the train pairs, missed the test: last step ' + family, ownerHint: 'capability/grid-dsl.mjs (the ' + family + ' step over-fits its train pairs)' };
  }
  const geo = gridGeometry(task);
  if (!geo) return null;
  if (row.why === 'refused') return { shape: 'grid vocabulary exhausted: ' + geo, ownerHint: 'capability/grid-dsl.mjs (no word composes to it at the depth cap)' };
  return { shape: 'grid no program in the clock: ' + geo, ownerHint: 'capability/grid-search.mjs (the clock) and capability/grid-dsl.mjs (a missing word)' };
}

// ---------------------------------------------------------------- the context: prompts and answers on disk
function readIf(root, rel) { const f = abs(root, rel); return existsSync(f) ? readFileSync(f, 'utf8') : null; }
function jsonIf(root, rel) { const t = readIf(root, rel); if (t === null) return null; try { return JSON.parse(t); } catch { return null; } }

/** Everything the shapes, the re-ask and the graders read beside the sources: fixture files, loaded once. */
export async function loadContext({ root = ROOT, answerTasksPerSuite = null } = {}) {
  const ctx = { root, gsm8k: null, humaneval: null, conceive: null, answer: null, arcDir: null, arcTasks: new Map() };
  const g = readIf(root, FILES.gsm8kFixture);
  if (g !== null) ctx.gsm8k = g.split(/\r?\n/).filter((l) => l.trim()).map((l) => JSON.parse(l));
  const h = readIf(root, FILES.humanevalFixture);
  if (h !== null) ctx.humaneval = new Map(h.split(/\r?\n/).filter((l) => l.trim()).map((l) => JSON.parse(l)).map((r) => [r.name, r]));
  const c = jsonIf(root, FILES.conceivePrompts);
  if (c) ctx.conceive = new Map(c.prompts.map((p) => [p.id, p]));
  if (existsSync(abs(root, FILES.answerQuestions))) {
    try {
      const { buildQuestions } = await import('../bench/answer.mjs');
      const qs = buildQuestions({ tasksPerSuite: answerTasksPerSuite ?? 10 });
      ctx.answer = new Map(qs.map((q) => [q.id, q]));
    } catch { ctx.answer = null; }
  }
  const d = abs(root, FILES.arcFixtureDir);
  if (existsSync(d)) ctx.arcDir = d;
  return ctx;
}
export function arcTask(ctx, id) {
  if (!ctx.arcDir) return null;
  if (ctx.arcTasks.has(id)) return ctx.arcTasks.get(id);
  const f = path.join(ctx.arcDir, id + '.json');
  const t = existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null;
  ctx.arcTasks.set(id, t);
  return t;
}

/** The text a row asks (what its source asked), or null when it is not on disk. ARC rows have no prompt. */
export function promptText(row, ctx) {
  if (row.source === 'gsm8k') {
    const i = Number(String(row.id).split('.')[1]);
    const rec = ctx.gsm8k && ctx.gsm8k[i];
    return rec ? String(rec.question) + '\n\nAnswer with the final number.' : null;
  }
  if (row.source === 'humaneval') { const rec = ctx.humaneval && ctx.humaneval.get(row.id); return rec ? String(rec.prompt) : null; }
  if (row.source === 'conceive') { if (row.prompt) return row.prompt; const p = ctx.conceive && ctx.conceive.get(row.id); return p ? p.prompt : null; }
  if (row.source === 'answer') { const q = ctx.answer && ctx.answer.get(String(row.id).split('@')[0]); return q ? q.q : null; }
  return null;
}
/** The text a vocabulary shape is read from: the question itself, without the bench's instruction line. */
export function shapeText(row, ctx) {
  if (row.source === 'gsm8k') { const i = Number(String(row.id).split('.')[1]); const rec = ctx.gsm8k && ctx.gsm8k[i]; return rec ? rec.question : null; }
  return promptText(row, ctx);
}

/** Shape one row: {shape, ownerHint}; unshaped when no rule reads it. */
export function shapeRow(row, ctx) {
  let s = null;
  if (row.source === 'humaneval') s = codeShape(row);
  else if (row.source === 'arc') s = gridShape(row, arcTask(ctx, row.id));
  else { const o = opOf(shapeText(row, ctx)); s = o ? { shape: o.op, ownerHint: o.ownerHint } : null; }
  return s || { shape: UNSHAPED, ownerHint: null };
}

// ---------------------------------------------------------------- building the ledger
/** Read one source from disk: {name, file, absent, why, rows, mistakes, own, ...}. A reader's ShapeError propagates. */
export function readSource(name, root = ROOT) {
  const file = FILES[name];
  const text = readIf(root, file);
  if (text === null) return { name, file, absent: true, why: 'not on disk', rows: 0, mistakes: [], own: null };
  let out;
  if (name === 'gsm8k' || name === 'humaneval') out = readPublic(name, text, file);
  else if (name === 'conceive') out = readConceive(JSON.parse(text), jsonIf(root, FILES.conceivePrompts), file);
  else if (name === 'answer') out = readAnswer(JSON.parse(text), file);
  else if (name === 'arc') out = readArc(text, readIf(root, FILES.arc3s), file, FILES.arc3s);
  else throw new Error('no reader for ' + name);
  const ownFile = name === 'gsm8k' ? FILES.gsm8kOwn : name === 'humaneval' ? FILES.humanevalOwn : name === 'arc' ? FILES.arcOwn : file;
  const own = ownCount(name, name === 'conceive' || name === 'answer' ? JSON.parse(text) : jsonIf(root, ownFile));
  return { ...out, absent: false, why: null, own: own ? { ...own, file: ownFile } : { count: null, field: 'no readable summary', file: ownFile } };
}

/** Dedup by (source, id), the last one wins; returns the rows and how many were dropped. */
export function dedup(rows) {
  const m = new Map();
  for (const r of rows) m.set(r.source + '\u0000' + r.id, r);
  return { rows: [...m.values()], dropped: rows.length - m.size };
}

export async function buildLedger({ root = ROOT, ctx = null } = {}) {
  const sources = SOURCE_NAMES.map((n) => readSource(n, root));
  const answerV = jsonIf(root, FILES.answer);
  const context = ctx || await loadContext({ root, answerTasksPerSuite: (answerV && answerV.questions && answerV.questions.tasksPerSuite) || 10 });
  const all = [];
  for (const s of sources) for (const m of s.mistakes) all.push(m);
  const { rows, dropped } = dedup(all);
  for (const r of rows) Object.assign(r, shapeRow(r, context));
  return { sources, rows, dropped, ctx: context };
}

// ---------------------------------------------------------------- lessons
export function lessonsOf(rows, top = Infinity) {
  const by = new Map();
  for (const r of rows) {
    if (!r.shape || r.shape === UNSHAPED) continue;
    const l = by.get(r.shape) || { shape: r.shape, count: 0, bySource: {}, whys: {}, examples: [], ownerHint: r.ownerHint };
    l.count++;
    l.bySource[r.source] = (l.bySource[r.source] || 0) + 1;
    l.whys[r.why] = (l.whys[r.why] || 0) + 1;
    if (l.examples.length < 3) l.examples.push(r.source + ':' + r.id);
    by.set(r.shape, l);
  }
  const out = [...by.values()].sort((a, b) => b.count - a.count || (a.shape < b.shape ? -1 : a.shape > b.shape ? 1 : 0));
  return Number.isFinite(top) ? out.slice(0, top) : out;
}
export function carriedShare(rows) {
  const carried = rows.filter((r) => r.shape && r.shape !== UNSHAPED).length;
  return { carried, of: rows.length, share: rows.length ? Math.round((carried / rows.length) * 10000) / 10000 : null };
}
/** The census control: how often the shape read from the text is one the census's own kind allows. */
export function censusKindControl(rows) {
  let of = 0, agree = 0;
  const off = [], noKind = new Set();
  for (const r of rows) {
    if (r.source !== 'conceive') continue;
    const want = KIND_OPS[r.kind];
    if (!want) { noKind.add(r.kind); continue; }
    of++;
    if (want.includes(r.shape)) agree++;
    else if (off.length < 12) off.push(r.id + ' (' + r.kind + ' read as ' + r.shape + ')');
  }
  return { of, agree, share: of ? Math.round((agree / of) * 10000) / 10000 : null, disagreements: off, kindsWithoutAMapping: [...noKind] };
}

// ---------------------------------------------------------------- the re-ask: grading
let GRADERS = null;
export async function graders() {
  if (GRADERS) return GRADERS;
  const pub = await import('../bench/public.mjs');
  const con = await import('../bench/conceive.mjs');
  const ans = await import('../bench/answer.mjs');
  const code = await import('../act/code.mjs');
  const run = await import('../act/run.mjs');
  GRADERS = {
    finalAnswer: pub.finalAnswer, lastNumber: pub.lastNumber, sameInteger: pub.sameInteger, cutAtStopTokens: pub.cutAtStopTokens,
    isNative: con.isNative, conceiveGrade: con.gradeAnswer, WARM: con.WARM, answerGrade: ans.gradeAnswer,
    extractCode: code.extractCode, runTests: run.runTests,
  };
  return GRADERS;
}
/** The HumanEval sandbox budget the public journal's header records (testMs 5000, memoryMB 128). */
export const HUMANEVAL_TEST = Object.freeze({ limitMs: 5000, memoryMB: 128 });

/** Grade one answer text for one ledger row by its source's own rule, behind the native gate.
 * @returns {Promise<{answered: boolean, ok: boolean|null, got: string|null}>} ok null when the row cannot be graded (its wanted is not on disk) */
export async function gradeReask(row, text, ctx) {
  const G = await graders();
  const t = String(text ?? '');
  if (!G.isNative(t)) return { answered: false, ok: false, got: null };
  if (row.source === 'gsm8k') {
    const i = Number(String(row.id).split('.')[1]);
    const rec = ctx.gsm8k && ctx.gsm8k[i];
    const got = G.lastNumber(t);
    if (!rec) return { answered: true, ok: null, got };
    return { answered: true, ok: G.sameInteger(got, G.finalAnswer(rec)), got };
  }
  if (row.source === 'humaneval') {
    const rec = ctx.humaneval && ctx.humaneval.get(row.id);
    if (!rec) return { answered: true, ok: null, got: null };
    const cut = G.cutAtStopTokens(G.extractCode(t), rec.stop_tokens);
    const r = await G.runTests(cut.text, rec.tests, HUMANEVAL_TEST);
    return { answered: true, ok: !!r.passed, got: r.passed ? 'passed' : String(r.error || 'failed').slice(0, 120) };
  }
  if (row.source === 'conceive') {
    const p = ctx.conceive && ctx.conceive.get(row.id);
    if (!p) return { answered: true, ok: null, got: null };
    const g = await G.conceiveGrade(t, p);
    const lastLine = t.split(/\r?\n/).filter((l) => l.trim()).slice(-1)[0];
    return { answered: g.native, ok: g.native ? g.graded === true : false, got: lastLine ? lastLine.slice(0, 120) : null };
  }
  if (row.source === 'answer') {
    const q = ctx.answer && ctx.answer.get(String(row.id).split('@')[0]);
    if (!q) return { answered: true, ok: null, got: null };
    const g = G.answerGrade(t, q);
    return { answered: true, ok: g.ok, got: g.candidate };
  }
  return { answered: false, ok: null, got: null };
}
/** before (a why) and a grade -> now. */
export function nowOf(before, g) {
  if (!g.answered) return 'refused';
  if (g.ok === true) return 'fixed';
  return before === 'refused' ? 'wrong-now' : 'still';
}

// ---------------------------------------------------------------- the re-ask: the asker (one worker, one brain)
export const ASK_ROLE = 'self/mistakes.mjs re-ask';
export const ASK_OPTS = Object.freeze({ provider: 'null', k: 5 });

/** ask() model off in a worker thread, with a wall per row: a row still running at wallMs is cut, the worker is
 * terminated and the next row gets a fresh, warmed one. */
export class Asker {
  /** opts.fault: 'boot' makes the worker fail before it serves (a test hook; the bench never sets it). */
  constructor({ wallMs = WALL_MS, startMs = 180000, fault = null } = {}) { this.wallMs = wallMs; this.startMs = startMs; this.fault = fault; this.worker = null; this.starts = 0; this.seq = 0; this.warmMs = []; }
  async start() {
    const t0 = Date.now();
    const w = new Worker(new URL(import.meta.url), { workerData: { role: ASK_ROLE, fault: this.fault } });
    w.on('error', () => {});
    w.on('exit', () => { if (this.worker === w) this.worker = null; });
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => { w.terminate().catch(() => {}); reject(new Error('the re-ask worker did not warm within ' + this.startMs + ' ms')); }, this.startMs);
      const onMsg = (m) => {
        if (m && m.ready) { clearTimeout(timer); w.off('message', onMsg); resolve(); }
        else if (m && m.fatal) { clearTimeout(timer); w.off('message', onMsg); w.terminate().catch(() => {}); reject(new Error('the re-ask worker failed to start: ' + m.fatal)); }
      };
      w.on('message', onMsg);
      w.once('exit', (c) => { clearTimeout(timer); reject(new Error('the re-ask worker exited ' + c + ' before it was ready')); });
    });
    this.worker = w;
    this.starts++;
    this.warmMs.push(Date.now() - t0);
  }
  /** opts.holdMs: a test hook, the worker waits that long before it asks; the bench never sets it. */
  async ask(prompt, { holdMs = 0 } = {}) {
    if (!this.worker) await this.start();
    const w = this.worker;
    const id = ++this.seq;
    const t0 = process.hrtime.bigint();
    return new Promise((resolve) => {
      let done = false;
      const finish = (r, kill) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        w.off('message', onMsg); w.off('error', onErr); w.off('exit', onExit);
        if (kill) { if (this.worker === w) this.worker = null; w.terminate().catch(() => {}); }
        resolve({ ...r, wallNs: Number(process.hrtime.bigint() - t0) });
      };
      const onMsg = (m) => { if (m && m.id === id) finish({ ...m, timedOut: false }, false); };
      const onErr = (e) => finish({ id, text: '', error: 'worker error: ' + String((e && e.message) || e).slice(0, 160), timedOut: false }, true);
      const onExit = (c) => finish({ id, text: '', error: 'worker exited ' + c, timedOut: false }, true);
      const timer = setTimeout(() => finish({ id, text: '', error: null, timedOut: true }, true), this.wallMs);
      w.on('message', onMsg); w.on('error', onErr); w.on('exit', onExit);
      w.postMessage({ id, prompt: String(prompt ?? ''), holdMs: holdMs > 0 ? holdMs : 0 });
    });
  }
  async close() { const w = this.worker; this.worker = null; if (w) await w.terminate().catch(() => {}); }
}

async function serveAsks() {
  if (workerData.fault === 'boot') throw new Error('planted boot fault (the Asker test hook)');
  const { ask } = await import('../act/prompt.mjs');
  const { seedBasic } = await import('../seeds/basic.mjs');
  const { WARM } = await import('../bench/conceive.mjs');
  const brain = seedBasic({ name: 'mistakes-reask', ledger: 'full', ledgerRing: 4096 });
  const warm = seedBasic({ name: 'mistakes-warm', ledger: 'full', ledgerRing: 4096 });
  for (const q of WARM) await ask(warm, q, { ...ASK_OPTS, events: [] });
  parentPort.on('message', async (m) => {
    if (m.holdMs > 0) await new Promise((r) => setTimeout(r, m.holdMs)); // the test hook above
    const t0 = process.hrtime.bigint();
    let a = null, error = null;
    try { a = await ask(brain, m.prompt, { ...ASK_OPTS, events: [] }); } catch (e) { error = String((e && e.message) || e).slice(0, 200); }
    const ns = Number(process.hrtime.bigint() - t0);
    const pv = (a && a.provenance) || {};
    parentPort.postMessage({ id: m.id, text: a && typeof a.text === 'string' ? a.text : '', route: a ? a.route ?? null : null, provenance: typeof pv === 'string' ? pv : (pv.answer ?? null), ns, error });
  });
  parentPort.postMessage({ ready: true });
}
if (!isMainThread && workerData && workerData.role === ASK_ROLE) {
  serveAsks().catch((e) => parentPort.postMessage({ fatal: String((e && e.stack) || e).slice(0, 600) }));
}

export const median = (xs) => { if (!xs.length) return null; const s = [...xs].sort((a, b) => a - b); return s[Math.floor((s.length - 1) / 2)]; };
const r3 = (x) => Math.round(x * 1000) / 1000;

/** Re-ask every ledger row whose prompt is on disk (ARC excepted). askFn(prompt) -> {text, ns, timedOut, route, provenance}
 * replaces the worker (a test's). Returns {rows (one per asked row), skipped, ...}. */
export async function reaskAll(ledger, ctx, { wallMs = WALL_MS, askFn = null, limit = 0, onRow = null } = {}) {
  const asker = askFn ? null : new Asker({ wallMs });
  const ask = askFn || ((p) => asker.ask(p));
  const out = [];
  const skipped = { arc: 0, noPrompt: 0, byLimit: 0, noPromptIds: [] };
  const t0 = Date.now();
  try {
    for (const row of ledger) {
      if (row.source === 'arc') { skipped.arc++; continue; }
      const prompt = promptText(row, ctx);
      if (prompt === null) { skipped.noPrompt++; if (skipped.noPromptIds.length < 10) skipped.noPromptIds.push(row.source + ':' + row.id); continue; }
      if (limit > 0 && out.length >= limit) { skipped.byLimit++; continue; }
      const a = await ask(prompt);
      const text = a.timedOut ? '' : String(a.text ?? '');
      const g = await gradeReask(row, text, ctx);
      const now = nowOf(row.why, g);
      const ms = a.timedOut ? wallMs : r3((a.ns ?? a.wallNs ?? 0) / 1e6);
      const rec = {
        id: row.id, source: row.source, before: row.why, now, learned: row.why === 'refused' && now === 'fixed',
        given: g.answered ? (g.got ?? null) : (a.timedOut ? null : (text.split(/\r?\n/)[0] || '').slice(0, 80)),
        graded: g.ok, ms, timedOut: !!a.timedOut, route: a.route ?? null, provenance: a.provenance ?? null, ...(a.error ? { error: a.error } : {}),
      };
      out.push(rec);
      if (onRow) onRow(rec);
    }
  } finally { if (asker) await asker.close(); }
  return { rows: out, skipped, wallMs: Date.now() - t0, workerStarts: asker ? asker.starts : 0, warmMs: asker ? asker.warmMs : [] };
}

export function summarizeReask(rows) {
  const s = (xs) => ({
    rows: xs.length, fixed: xs.filter((r) => r.now === 'fixed').length, still: xs.filter((r) => r.now === 'still').length,
    refused: xs.filter((r) => r.now === 'refused').length, wrongNow: xs.filter((r) => r.now === 'wrong-now').length,
    learned: xs.filter((r) => r.learned).length, timedOut: xs.filter((r) => r.timedOut).length, ungraded: xs.filter((r) => r.graded === null).length,
    medianMs: median(xs.map((r) => r.ms)),
  });
  const bySource = {};
  for (const n of SOURCE_NAMES) { const xs = rows.filter((r) => r.source === n); if (xs.length) bySource[n] = s(xs); }
  return { ...s(rows), bySource };
}

// ---------------------------------------------------------------- the paired change since an earlier verdict
/** learned: left the ledger, or newly fixed by the re-ask; regressed: entered the ledger, or no longer fixed. */
export function sinceDiff(prev, cur) {
  const out = {};
  for (const n of SOURCE_NAMES) {
    const a = new Set((prev.ledgerIds && prev.ledgerIds[n]) || []), b = new Set((cur.ledgerIds && cur.ledgerIds[n]) || []);
    const fa = new Set((prev.reaskFixedIds && prev.reaskFixedIds[n]) || []), fb = new Set((cur.reaskFixedIds && cur.reaskFixedIds[n]) || []);
    const left = [...a].filter((x) => !b.has(x)), entered = [...b].filter((x) => !a.has(x));
    const newlyFixed = [...fb].filter((x) => !fa.has(x) && b.has(x)), lostFix = [...fa].filter((x) => !fb.has(x) && b.has(x));
    out[n] = { before: a.size, now: b.size, learned: left.length + newlyFixed.length, regressed: entered.length + lostFix.length, leftLedger: left.length, enteredLedger: entered.length, reaskNewlyFixed: newlyFixed.length, reaskLostFix: lostFix.length, examples: { left: left.slice(0, 3), entered: entered.slice(0, 3), newlyFixed: newlyFixed.slice(0, 3), lostFix: lostFix.slice(0, 3) } };
  }
  return out;
}

// ---------------------------------------------------------------- CLI: the ledger alone, nothing written
const isMain = isMainThread && process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const json = process.argv.includes('--json');
  const b = await buildLedger();
  const per = b.sources.map((s) => ({ name: s.name, absent: s.absent, rows: s.rows, mistakes: s.mistakes.length, own: s.own && s.own.count }));
  if (json) console.log(JSON.stringify({ sources: per, ledger: b.rows.length, lessons: lessonsOf(b.rows, 20), carried: carriedShare(b.rows) }, null, 1));
  for (const s of per) console.log('MISTAKES ' + s.name + ': ' + (s.absent ? 'ABSENT' : s.rows + ' graded rows, ' + s.mistakes + ' mistakes, the source own count ' + s.own));
  console.log('MISTAKES ledger ' + b.rows.length + ' rows (nothing written; node bench/mistakes.mjs writes the ledger and the verdict)');
}
