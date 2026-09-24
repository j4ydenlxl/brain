// self/code.mjs: SELF IMPROVEMENT EXTENDED FROM THE CONNECTOME TO THE SOURCE. self/propose
// proposes edges and cells; this file proposes a change to the organism's OWN code, as the
// proposal kind 'self.code' { file, patch, why, evidence }.
//
// The rule that makes this safe is the same one the rest of the brain lives under:
// COMPUTATION IS NOT AUTHORITY. Three separate walls stand between an analysis and a byte
// on disk.
//
//   1. EVIDENCE. The evidence for a source change is not an argument, it is a test that
//      FAILS before the patch and PASSES after it. The gate policy does not read a claim
//      about that, it RUNS it: a filtered copy of the brain tree is made in a temp dir, the
//      named test runs there unpatched (it must fail), the patch is written onto the copy,
//      and the test runs again (it must pass). Each run is a child process with a timeout.
//      No evidence, no approval.
//   2. THE HUMAN. The policy never returns 'approve'. The best a verified proposal can get
//      is 'hold', which puts it in the gate's pending map. `brain self-code <name>
//      --approve <id>` is the only path that writes to a file, and it writes a ledger event
//      carrying the file hash before and after.
//   3. THE BOUNDARY. A patch cannot leave the brain directory. An absolute path, a path
//      with a '..' segment, a path that resolves outside ROOT and a path under state/ are
//      all refused before anything is copied or run.
//
// Text that came from a model is not a proposal. suggestPatch() marks its output
// origin 'model', and the policy REJECTS a model origin proposal unless the human already
// approved it on the CLI (evidence.humanApproved === true, set by bin/brain.mjs, never by
// this module and never by the model).
import { readFileSync, writeFileSync, existsSync, statSync, mkdtempSync, rmSync, cpSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerProposalKind } from '../core/gate.mjs';

export const CODE_KIND = 'self.code';
export const CODE_APPLY = 'self.code.apply';
export const CODE_VERIFY = 'self.code.verify';
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const VERDICTS = path.join(ROOT, 'bench', 'verdicts');

// Copied for a verification run. state/ is excluded because a soak writes hundreds of
// gigabytes there and no test reads it; .git and node_modules are not the organism; site/
// is a built artifact nothing imports. Everything else is copied so the named test resolves
// its imports exactly as it does in the real tree.
export const COPY_SKIP = Object.freeze(['state', '.git', 'node_modules', 'site']);

export const DEFAULT_TIMEOUT_MS = 120_000;

export function sha256(text) { return createHash('sha256').update(String(text)).digest('hex'); }
const short = (h) => String(h).slice(0, 12);

// ---------------------------------------------------------------- the boundary
/**
 * Resolve a candidate path against the brain root, refusing anything that could leave it.
 * @returns {{ok:boolean, rel?:string, abs?:string, reason?:string}}
 */
export function safePath(file, { root = ROOT, mustExist = true } = {}) {
  if (typeof file !== 'string' || !file.trim()) return { ok: false, reason: 'the path is empty' };
  if (file.includes('\0')) return { ok: false, reason: 'the path holds a null byte' };
  const raw = file.replaceAll('\\', '/');
  if (raw.startsWith('/') || /^[A-Za-z]:/.test(raw)) return { ok: false, reason: 'an absolute path is refused: ' + file };
  if (raw.split('/').includes('..')) return { ok: false, reason: "a '..' segment is refused: " + file };
  const abs = path.resolve(root, raw);
  const base = path.resolve(root) + path.sep;
  if (!(abs + path.sep).startsWith(base)) return { ok: false, reason: 'the path resolves outside the brain directory: ' + file };
  const rel = path.relative(root, abs).replaceAll('\\', '/');
  if (rel.split('/')[0] === 'state') return { ok: false, reason: 'state/ is the running organism, never a patch target: ' + file };
  if (mustExist) {
    if (!existsSync(abs)) return { ok: false, reason: 'no such file: ' + rel };
    if (!statSync(abs).isFile()) return { ok: false, reason: 'not a file: ' + rel };
  }
  return { ok: true, rel, abs };
}

// ---------------------------------------------------------------- the patch
/** Parse a unified diff into hunks. Headers (diff, index, ---, +++) are ignored. */
export function parsePatch(patch) {
  if (typeof patch !== 'string' || !patch.trim()) return { ok: false, reason: 'the patch is empty' };
  const hunks = [];
  let cur = null;
  // A patch string that ends with a newline splits to a trailing empty element. Kept, it
  // would become an empty CONTEXT line and demand that the hunk sit at the end of the file:
  // MEASURED here, a one line hunk that matched in two places matched in one and landed.
  const lines = patch.split(/\r?\n/);
  while (lines.length && lines[lines.length - 1] === '') lines.pop();
  for (const line of lines) {
    if (line.startsWith('@@')) {
      const m = line.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
      if (!m) return { ok: false, reason: 'a hunk header is malformed: ' + line.slice(0, 60) };
      cur = { oldStart: Number(m[1]), newStart: Number(m[3]), before: [], after: [] };
      hunks.push(cur);
      continue;
    }
    if (!cur) continue;
    if (line.startsWith('\\')) continue; // "\ No newline at end of file"
    const tag = line[0];
    const body = line.slice(1);
    if (tag === ' ') { cur.before.push(body); cur.after.push(body); }
    else if (tag === '-') cur.before.push(body);
    else if (tag === '+') cur.after.push(body);
    else if (line === '') { cur.before.push(''); cur.after.push(''); } // an empty context line that lost its space
    else return { ok: false, reason: 'a patch line starts with ' + JSON.stringify(tag) };
  }
  if (!hunks.length) return { ok: false, reason: 'the patch has no @@ hunk' };
  return { ok: true, hunks };
}

/**
 * Apply a unified diff to text. A hunk whose before image is not at the stated line is
 * searched for in the whole file and applied only if it occurs EXACTLY once: a patch that
 * could land in two places is refused rather than guessed at.
 */
export function applyUnifiedPatch(text, patch) {
  const p = parsePatch(patch);
  if (!p.ok) return p;
  const eol = String(text).includes('\r\n') ? '\r\n' : '\n';
  let lines = String(text).split(/\r?\n/);
  let drift = 0;
  const offsets = [];
  for (const h of p.hunks) {
    let at = h.oldStart - 1 + drift;
    if (h.before.length === 0) {
      // a pure insertion matches everywhere, so it lands where the header says and nowhere else
      if (at < 0 || at > lines.length) return { ok: false, reason: 'an insertion at line ' + h.oldStart + ' is outside the file (' + lines.length + ' lines)' };
    } else {
      const match = (i) => i >= 0 && i + h.before.length <= lines.length && h.before.every((b, k) => lines[i + k] === b);
      if (!match(at)) {
        let found = -1, count = 0;
        for (let i = 0; i <= lines.length - h.before.length; i++) if (match(i)) { count++; if (found < 0) found = i; }
        if (count === 0) return { ok: false, reason: 'the hunk at line ' + h.oldStart + ' does not match the file' };
        if (count > 1) return { ok: false, reason: 'the hunk at line ' + h.oldStart + ' matches the file in ' + count + ' places' };
        at = found;
      }
    }
    offsets.push(at + 1 - h.oldStart);
    lines = [...lines.slice(0, at), ...h.after, ...lines.slice(at + h.before.length)];
    drift += h.after.length - h.before.length;
  }
  return { ok: true, text: lines.join(eol), hunks: p.hunks.length, offsets };
}

// ---------------------------------------------------------------- running a test
/**
 * Run one test file in `cwd` as a child process and read its TAP output.
 *
 * The child gets a CLEANED env. MEASURED: when this runs from inside `node --test`, the
 * runner has set NODE_TEST_CONTEXT in the environment, the grandchild inherits it, believes
 * it is a test worker, emits the v8 serialized stream instead of TAP, and every run is read
 * as a failure. A verification that says "the patch did not fix it" because of an inherited
 * env var is a false refusal, so the variables the test runner owns are dropped.
 */
export function runTest(cwd, testRel, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const t0 = Date.now();
  const env = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (k.startsWith('NODE_TEST') || k === 'NODE_OPTIONS') continue; // never a value, only names
    env[k] = v;
  }
  const r = spawnSync(process.execPath, ['--test', '--test-reporter=tap', testRel], {
    cwd, encoding: 'utf8', timeout: timeoutMs, maxBuffer: 32 * 1024 * 1024, env,
  });
  const out = (r.stdout || '') + (r.stderr || '');
  const n = (label) => { const m = out.match(new RegExp('^# ' + label + ' (\\d+)$', 'm')); return m ? Number(m[1]) : null; };
  const failures = [];
  const re = /^not ok (\d+) - (.+)$/gm;
  let m;
  while ((m = re.exec(out)) !== null) {
    const rest = out.slice(m.index + m[0].length, m.index + m[0].length + 4000);
    let err = '';
    const block = rest.match(/\n\s*error: \|-\n([\s\S]*?)\n\s*(?:code|name|expected|actual|operator|stack|failureType|\.\.\.)[:\s]/);
    if (block) err = block[1].split('\n').map((l) => l.trim()).filter(Boolean).join(' ');
    else { const one = rest.match(/\n\s*error: '([^']*)'/); if (one) err = one[1]; }
    failures.push({ name: m[2].trim(), error: err.slice(0, 400) });
  }
  return {
    exit: r.status, timedOut: r.error?.code === 'ETIMEDOUT' || r.signal === 'SIGTERM',
    pass: n('pass'), fail: n('fail'), total: n('tests'),
    failures: failures.slice(0, 8), ms: Date.now() - t0,
  };
}

// A verification object this process actually ran. The policy will not trust a verification
// it did not produce, and identity in a WeakSet cannot be forged by a hand written proposal
// or by a proposal restored from a snapshot, while nothing extra is written to disk.
const SEALED = new WeakSet();
export function isSealed(v) { return typeof v === 'object' && v !== null && SEALED.has(v); }

/**
 * THE EVIDENCE, RUN. Copies the tree, runs the named test unpatched, patches the copy, runs
 * it again. Synchronous on purpose: the gate's propose() is synchronous, so the policy can
 * run this itself rather than trust a number somebody else attached.
 * @returns {object} sealed { ok, failsBefore, passesAfter, before, after, hashBefore, hashAfter, ... }
 */
export function verifyPatch({ file, patch, test, root = ROOT, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const t0 = Date.now();
  const fail = (reason, extra = {}) => {
    const v = { ok: false, reason, failsBefore: false, passesAfter: false, before: null, after: null, ms: Date.now() - t0, ...extra };
    SEALED.add(v);
    return v;
  };
  const f = safePath(file, { root });
  if (!f.ok) return fail(f.reason);
  const tf = safePath(test, { root });
  if (!tf.ok) return fail('the test: ' + tf.reason);
  const original = readFileSync(f.abs, 'utf8');
  const patched = applyUnifiedPatch(original, patch);
  if (!patched.ok) return fail('the patch does not apply: ' + patched.reason);
  if (patched.text === original) return fail('the patch changes nothing');

  const dir = mkdtempSync(path.join(tmpdir(), 'brain-selfcode-'));
  try {
    const c0 = Date.now();
    cpSync(root, dir, {
      recursive: true,
      filter: (src) => {
        const rel = path.relative(root, src);
        if (!rel) return true;
        return !COPY_SKIP.includes(rel.split(path.sep)[0]);
      },
    });
    const copyMs = Date.now() - c0;
    const before = runTest(dir, tf.rel, timeoutMs);
    writeFileSync(path.join(dir, f.rel), patched.text);
    const after = runTest(dir, tf.rel, timeoutMs);
    const failsBefore = before.exit !== 0 && !before.timedOut;
    const passesAfter = after.exit === 0;
    const v = {
      ok: failsBefore && passesAfter,
      reason: failsBefore ? (passesAfter ? null : 'the test still fails with the patch applied') : 'the test does not fail without the patch: it is not evidence for this change',
      failsBefore, passesAfter,
      before: { exit: before.exit, pass: before.pass, fail: before.fail, total: before.total, ms: before.ms, timedOut: before.timedOut, failures: before.failures },
      after: { exit: after.exit, pass: after.pass, fail: after.fail, total: after.total, ms: after.ms, timedOut: after.timedOut, failures: after.failures },
      file: f.rel, test: tf.rel, hunks: patched.hunks, offsets: patched.offsets,
      hashBefore: sha256(original), hashAfter: sha256(patched.text),
      bytesBefore: Buffer.byteLength(original), bytesAfter: Buffer.byteLength(patched.text),
      copyMs, timeoutMs, ms: Date.now() - t0,
    };
    SEALED.add(v);
    return v;
  } finally {
    try { rmSync(dir, { recursive: true, force: true }); } catch { /* a temp dir that will not go is not a verdict */ }
  }
}

// ---------------------------------------------------------------- the gate policy
/**
 * The policy for self.code. It can return 'reject' or 'hold' and NEVER 'approve': the human
 * is the only approver of a source change. The verification runs here, inside the policy,
 * and the result is attached to the proposal (not to the evidence, which the ledger line was
 * already written from).
 */
export function codePolicy({ root = ROOT, timeoutMs = DEFAULT_TIMEOUT_MS, verify = verifyPatch } = {}) {
  return function policy(proposal) {
    const ev = proposal.evidence || {};
    const no = (reason) => { proposal.reason = reason; return 'reject'; };
    if (!ev.file || !ev.test) return no('no evidence: a self.code proposal needs the file it patches and the test that grades it');
    const f = safePath(ev.file, { root });
    if (!f.ok) return no(f.reason);
    const tf = safePath(ev.test, { root });
    if (!tf.ok) return no('the test: ' + tf.reason);
    if (!ev.patch) return no('no patch: the evidence is a test that fails before the patch and passes after it, so there must be a patch');
    // Text from a model is a suggestion. It becomes a proposal only when the human said so
    // on the CLI, and this flag is set there.
    if (ev.origin === 'model' && ev.humanApproved !== true) return no('origin model: a suggestion is not a proposal until the human approves it on the CLI (brain self-code <name> --approve)');
    const v = verify({ file: ev.file, patch: ev.patch, test: ev.test, root, timeoutMs });
    proposal.verification = v;
    if (!isSealed(v)) return no('the verification was not run by this process');
    if (!v.ok) return no(v.reason || 'the patch did not verify');
    return 'hold';
  };
}

// The ledger line carries the shape of the patch, never the patch text: a diff can be
// thousands of characters and one event must stay one line.
export function slimEvidence(ev = {}) {
  return {
    file: ev.file ?? null, test: ev.test ?? null, origin: ev.origin ?? 'self', source: ev.source ?? null,
    key: ev.key ?? null, patchBytes: ev.patch ? Buffer.byteLength(String(ev.patch)) : 0,
    patchHash: ev.patch ? short(sha256(ev.patch)) : null, hashBefore: ev.hashBefore ? short(ev.hashBefore) : null,
  };
}

/** Teach every gate in this process the self.code kind. Idempotent. */
export function installCodeKind(opts = {}) {
  registerProposalKind(CODE_KIND, { policy: codePolicy(opts), slim: slimEvidence });
  return CODE_KIND;
}
installCodeKind(); // the kind exists as soon as this module is imported, with its default policy

// ---------------------------------------------------------------- the analysis
// The candidate does not come from an opinion. It comes from two analyses that exist as
// DATA in bench/verdicts today: a mutant that survived (the suite has a hole) and a gate
// test file that failed (the code has a defect). Both produce a candidate with a file, the
// test that grades it, and the numbers that motivated it. Neither can write the patch by
// itself, and a candidate with no patch is REFUSED by the policy: that refusal is the
// honest outcome, not a hidden one.

/** Candidates from bench/verdicts/mutants.json: every mutant the suite did not kill. */
export function mutantCandidates({ verdicts = VERDICTS } = {}) {
  const file = path.join(verdicts, 'mutants.json');
  if (!existsSync(file)) return { file: 'bench/verdicts/mutants.json', read: false, mutants: 0, survived: 0, candidates: [] };
  let j;
  try { j = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { return { file: 'bench/verdicts/mutants.json', read: false, reason: String(e.message).split('\n')[0], mutants: 0, survived: 0, candidates: [] }; }
  const all = Array.isArray(j.mutants) ? j.mutants : [];
  const survived = all.filter((m) => m && m.executed === true && m.killed !== true);
  const candidates = survived.map((m) => {
    const suite = (j.suites && j.suites[m.sub]) || [];
    const test = suite[0] || null;
    return {
      key: 'mutant:' + m.id,
      source: 'bench/verdicts/mutants.json',
      kind: 'mutant.survived',
      file: test, test,
      why: 'mutant ' + m.id + ' survived ' + (suite.join(' ') || 'its suite') + ': ' + (m.why || 'no reason recorded') + '. The killing test is missing.',
      patch: null,
      evidence: { mutant: { id: m.id, sub: m.sub, file: m.file, why: m.why, find: m.find, replace: m.replace }, suite, at: j.at ?? null },
    };
  }).filter((c) => c.test);
  return { file: 'bench/verdicts/mutants.json', read: true, at: j.at ?? null, mutants: all.length, survived: survived.length, candidates };
}

/**
 * Candidates from bench/verdicts/gate.json: every test file the gate found red. The failing
 * assertion is not read out of the verdict (it does not record one), it is MEASURED here by
 * running that test file now, so the candidate carries an assertion that was true of this
 * tree at this moment rather than one copied from an older run.
 */
export function gateCandidates({ verdicts = VERDICTS, root = ROOT, run = true, max = 5, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const file = path.join(verdicts, 'gate.json');
  if (!existsSync(file)) return { file: 'bench/verdicts/gate.json', read: false, tests: 0, red: 0, candidates: [] };
  let j;
  try { j = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { return { file: 'bench/verdicts/gate.json', read: false, reason: String(e.message).split('\n')[0], tests: 0, red: 0, candidates: [] }; }
  const tests = Array.isArray(j.tests) ? j.tests : [];
  const red = tests.filter((t) => t && (t.exit !== 0 || (t.fail ?? 0) > 0));
  const candidates = [];
  for (const t of red.slice(0, max)) {
    const tf = safePath(t.file, { root });
    const now = run && tf.ok ? runTest(root, tf.rel, timeoutMs) : null;
    candidates.push({
      key: 'gate:' + t.file,
      source: 'bench/verdicts/gate.json',
      kind: 'gate.red',
      file: t.file, test: t.file,
      why: 'the gate found ' + t.file + ' red (' + (t.fail ?? 0) + ' failing of ' + (t.total ?? 0) + ', exit ' + t.exit + ')'
        + (now ? (now.exit === 0 ? '. It PASSES now, so the verdict is stale.' : '. Failing now: ' + (now.failures[0]?.name || 'unnamed') + ' :: ' + (now.failures[0]?.error || 'no message')) : ''),
      patch: null,
      evidence: {
        gate: { file: t.file, pass: t.pass ?? null, fail: t.fail ?? null, total: t.total ?? null, exit: t.exit ?? null, at: j.at ?? null },
        assertion: now && now.failures.length ? now.failures[0] : null,
        stillFails: now ? now.exit !== 0 : null,
        reran: !!now, rerunMs: now ? now.ms : null,
      },
    });
  }
  return { file: 'bench/verdicts/gate.json', read: true, at: j.at ?? null, verdict: j.verdict ?? null, tests: tests.length, red: red.length, candidates };
}

/** Both analyses, in one call. */
export function analyze({ verdicts = VERDICTS, root = ROOT, run = true, max = 5, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const mutants = mutantCandidates({ verdicts });
  const gate = gateCandidates({ verdicts, root, run, max, timeoutMs });
  return { sources: { mutants, gate }, candidates: [...mutants.candidates, ...gate.candidates] };
}

// ---------------------------------------------------------------- suggestion (origin model)
/**
 * OPTIONAL. Ask the llm cell for a patch for one candidate. What comes back is a
 * SUGGESTION: origin 'model', humanApproved false. It is not a proposal, and the policy
 * refuses it until the human approves it on the CLI. The model never sees a file it did not
 * ask for and never sets any flag itself.
 */
export async function suggestPatch(candidate, { provider = 'null', model = null, base = null, maxTokens = 1200, timeoutMs = 60_000 } = {}) {
  const { complete } = await import('../act/llm.mjs');
  const prompt = [
    'Write a unified diff (a single file, @@ hunks, no prose) that makes this true.',
    'file: ' + candidate.file, 'test: ' + candidate.test, 'why: ' + candidate.why,
  ].join('\n');
  const r = await complete({ provider, model, base, prompt, maxTokens, timeoutMs });
  const text = String(r.text || '');
  const fence = text.match(/```(?:diff|patch)?\n([\s\S]*?)```/);
  const patch = (fence ? fence[1] : text).includes('@@') ? (fence ? fence[1] : text) : null;
  return {
    ...candidate,
    key: candidate.key + ':model',
    patch, origin: 'model', humanApproved: false,
    llm: { provider: r.provider ?? provider, model: r.model ?? model, ms: r.ms ?? null, ok: r.ok === true },
  };
}

// ---------------------------------------------------------------- submitting
/**
 * Put one candidate to the gate. The policy verifies it (see above) and the outcome is
 * 'pending' (verified, waiting for the human), 'rejected' (no patch, bad path, or the
 * evidence did not hold) or 'approved', which this kind's policy never returns.
 */
export function submit(brain, candidate, { by = 'self.code', humanApproved = false, root = ROOT } = {}) {
  const ev = {
    key: candidate.key, source: candidate.source, kind: candidate.kind,
    file: candidate.file, test: candidate.test, patch: candidate.patch || null,
    origin: candidate.origin || 'self', humanApproved: humanApproved === true,
    analysis: candidate.evidence || null, llm: candidate.llm || null,
  };
  const f = safePath(candidate.file || '', { root });
  if (f.ok) ev.hashBefore = sha256(readFileSync(f.abs, 'utf8'));
  const proposal = brain.gate.propose({
    kind: CODE_KIND, what: { file: candidate.file, test: candidate.test }, why: candidate.why || '', by, evidence: ev,
  }, brain.ctx);
  const v = proposal.verification || null;
  // The verification is a measurement, so it gets its own event with the numbers the child
  // processes printed. It is written after the decision, never before it.
  const seq = brain.log({
    type: CODE_VERIFY, from: proposal.seq ?? undefined, proposal: proposal.id, key: candidate.key,
    file: candidate.file, test: candidate.test, origin: ev.origin, status: proposal.status,
    verified: !!v, failsBefore: v ? v.failsBefore : null, passesAfter: v ? v.passesAfter : null,
    beforeFail: v && v.before ? v.before.fail : null, afterPass: v && v.after ? v.after.pass : null,
    ms: v ? v.ms : null, reason: proposal.reason || (v ? v.reason : 'not verified'),
  });
  return {
    status: proposal.status, id: proposal.id, key: candidate.key, proposal, verification: v, seq,
    reason: proposal.reason || (v && !v.ok ? v.reason : null),
  };
}

/** Submit a whole analysis, skipping keys already pending at this gate. */
export function submitAll(brain, candidates, opts = {}) {
  const pending = new Set(brain.gate.listPending().filter((p) => p.kind === CODE_KIND).map((p) => p.evidence?.key));
  const results = [];
  for (const c of candidates) {
    if (pending.has(c.key)) { results.push({ status: 'already-pending', key: c.key, reason: 'a proposal with this key is already waiting for the human' }); continue; }
    results.push(submit(brain, c, opts));
  }
  return {
    results,
    found: candidates.length,
    pending: results.filter((r) => r.status === 'pending').length,
    refused: results.filter((r) => r.status === 'rejected').length,
    skipped: results.filter((r) => r.status === 'already-pending').length,
  };
}

/** Every self.code proposal this gate is holding. */
export function listPending(brain) {
  return brain.gate.listPending().filter((p) => p.kind === CODE_KIND).map((p) => ({
    id: p.id, key: p.evidence?.key ?? null, file: p.evidence?.file ?? null, test: p.evidence?.test ?? null,
    origin: p.evidence?.origin ?? 'self', source: p.evidence?.source ?? null, why: p.why,
    patchBytes: p.evidence?.patch ? Buffer.byteLength(String(p.evidence.patch)) : 0,
    failsBefore: p.verification?.failsBefore ?? null, passesAfter: p.verification?.passesAfter ?? null,
    beforeFail: p.verification?.before?.fail ?? null, afterPass: p.verification?.after?.pass ?? null,
    assertion: p.evidence?.analysis?.assertion ?? null,
    hashBefore: p.evidence?.hashBefore ? short(p.evidence.hashBefore) : null,
  }));
}

// ---------------------------------------------------------------- applying
/**
 * THE ONLY PATH THAT WRITES A SOURCE FILE. Called after the human approved the proposal at
 * the gate. The file is re-hashed first: if it moved since the proposal was verified, the
 * evidence was taken against a file that no longer exists and the patch is refused.
 */
export function applyApproved(brain, proposal, { root = ROOT, by = 'human' } = {}) {
  if (!proposal || proposal.kind !== CODE_KIND) return { ok: false, reason: 'not a self.code proposal' };
  if (proposal.status !== 'approved') return { ok: false, reason: 'the gate has not approved proposal ' + proposal.id + ' (status ' + proposal.status + ')' };
  const ev = proposal.evidence || {};
  const f = safePath(ev.file || '', { root });
  if (!f.ok) return { ok: false, reason: f.reason };
  const original = readFileSync(f.abs, 'utf8');
  const hashBefore = sha256(original);
  if (ev.hashBefore && ev.hashBefore !== hashBefore) {
    return { ok: false, reason: 'the file changed since it was verified (' + short(ev.hashBefore) + ' -> ' + short(hashBefore) + '): re-run the analysis' };
  }
  const patched = applyUnifiedPatch(original, ev.patch);
  if (!patched.ok) return { ok: false, reason: 'the patch does not apply: ' + patched.reason };
  writeFileSync(f.abs, patched.text);
  const hashAfter = sha256(patched.text);
  const seq = brain.log({
    type: CODE_APPLY, from: proposal.seq ?? undefined, proposal: proposal.id, key: ev.key ?? null,
    file: f.rel, test: ev.test ?? null, origin: ev.origin ?? 'self', by,
    hashBefore, hashAfter, bytesBefore: Buffer.byteLength(original), bytesAfter: Buffer.byteLength(patched.text),
    hunks: patched.hunks, applied: true,
  });
  return { ok: true, applied: true, file: f.rel, hashBefore, hashAfter, hunks: patched.hunks, seq, bytesBefore: Buffer.byteLength(original), bytesAfter: Buffer.byteLength(patched.text) };
}

export function codeLine(r) {
  if (r.status === 'pending') return '#' + r.id + ' pending ' + r.key + ' (' + (r.verification?.before?.fail ?? '?') + ' failing before, ' + (r.verification?.after?.pass ?? '?') + ' passing after)';
  if (r.status === 'already-pending') return r.key + ' already pending';
  return '#' + (r.id ?? '-') + ' ' + r.status + ' ' + r.key + ': ' + (r.reason || '');
}
