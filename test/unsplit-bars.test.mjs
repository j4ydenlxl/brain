// test/unsplit-bars.test.mjs: board 24b, item unsplit-bars (Board 13 RULES (1): a bar verdict names its
// split; the gate's CONTAMINATION row grades it).
//
// The claims, each with a control:
//   (a) every one of the eleven bar files the row named with no split now has a split object the gate
//       reads as one, in the shape the rule asks, and BOTH kinds of row are here: stamped by
//       tools/split-stamp.mjs and written by the file's own run; a stamped split that gives a
//       contamination reason tells the reader (top-level contaminated true and the stamp sentence at
//       the end of the statement), so the gate's census reads it as contaminated AND labelled;
//   (b) a stamp changed no field its run wrote: cutting the stamp out (the tail block, the mark and the
//       sentence) gives the old bytes back by sha256, the numeric leaves are the same, and the copy at
//       git HEAD (the file before the stamp, until the orchestrator commits it; the stamped file after)
//       agrees field for field; the stamped split is what the writer's split logic gives now;
//       CONTROLS: one number moved, the split edited, the stamp cut out (the row names the file
//       again), the sentence cut out (the row names it contaminated and unlabelled) and the mark cut
//       out (the row reads it as clean, and the stamp check catches it);
//   (c) the tool: a dry run writes nothing, --write stamps, a second --write writes nothing (idempotent),
//       a file whose split came from its own run is never stamped, and a run that wrote its own
//       top-level contaminated is never overwritten;
//   (d) the writers this item owns put the split in the verdict their own run builds: each is RUN with
//       no model (code's null arm, compress with its three heavy parts skipped, math on a mock cell,
//       synth's verdict builder, public's null arm on seeds that reach both kinds of split), and no
//       landing file of theirs in bench/verdicts moves while they run;
//   (e) node bench/gate.mjs --contamination names none of the eleven, every cause it still prints names
//       grid.json alone (item ladder-arc's), and bench/verdicts/unsplit-bars.json agrees with the lines
//       it quotes: every number in its statement is on the two lines the bar printed.
// No model is called and no socket is opened.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import { contaminationRecords, contaminationRow, splitShapeOf } from '../bench/gate.mjs';
import { ELEVEN, STAMP_BY, STAMP_KEYS, STAMP_SENTENCE, originalOf, checkFile, planFile, numericLeaves, withoutStamp, sha256, writerSplitFor, gateRowCli, causeFilesOf, labelledOf, functionSource } from '../tools/split-stamp.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERDICTS = path.join(ROOT, 'bench', 'verdicts');
const read = (f) => JSON.parse(readFileSync(path.join(VERDICTS, f), 'utf8'));
const tmp = () => mkdtempSync(path.join(tmpdir(), 'unsplit-bars-'));
const EMDASH = String.fromCharCode(0x2014);

function assertSplit(s, where) {
  assert.equal(splitShapeOf({ split: s }), 'object', where + ': the gate reads the split as an object');
  for (const k of ['development', 'heldOut', 'contaminated']) assert.ok(k in s, where + ': has ' + k);
  for (const k of ['development', 'heldOut']) {
    assert.ok(s[k] && typeof s[k] === 'object' && !Array.isArray(s[k]), where + ': ' + k + ' is an object');
    assert.ok(typeof s[k].what === 'string' && s[k].what.length > 10, where + ': ' + k + '.what is a sentence');
  }
  assert.ok(s.contaminated === false || (typeof s.contaminated === 'string' && s.contaminated.length > 20), where + ': contaminated is false or a reason');
  assert.ok(!JSON.stringify(s).includes(EMDASH), where + ': no em dash');
}

test('(a) each of the eleven has a split object in the rule\'s shape, and a stamped reason is told to the reader', () => {
  assert.equal(ELEVEN.length, 11);
  let stamped = 0, own = 0, reasons = 0, clean = 0, marked = 0;
  const recs = new Map(contaminationRecords(VERDICTS).records.map((r) => [r.file, r]));
  for (const f of ELEVEN) {
    const v = read(f);
    assert.equal(v.isTheBar, true, f + ' is a bar file');
    assertSplit(v.split, f);
    const reason = typeof v.split.contaminated === 'string' ? v.split.contaminated : null;
    if (v.splitStampedBy === STAMP_BY) {
      stamped++;
      assert.ok(!Number.isNaN(Date.parse(v.splitStampedAt)), f + ': splitStampedAt is an ISO time');
      assert.equal(typeof v.splitSource.writer, 'string');
      assert.ok(v.splitSource.notRerunBecause.length > 20, f + ': says why its writer did not re-run it');
      assert.match(v.splitSource.fnSha256, /^[0-9a-f]{64}$/);
      if (reason) {
        // the reader is told: the mark the gate reads, and the sentence the gate labels it by
        assert.equal(v.contaminated, true, f + ': a stamped reason carries top-level contaminated true');
        assert.equal(v.splitStampedOver.markAdded, true, f + ': the stamp records that it added the mark');
        assert.equal(v.splitStampedOver.statementAppended, STAMP_SENTENCE(reason), f + ': the sentence quotes the split\'s reason');
        assert.ok(v.statement.endsWith(STAMP_SENTENCE(reason)), f + ': the statement ends with the stamp sentence');
        assert.equal(recs.get(f).contaminated, true, f + ': the gate census reads it as contaminated');
        assert.equal(recs.get(f).labelled, true, f + ': and as labelled');
        marked++;
      } else {
        assert.equal(v.contaminated, undefined, f + ': a clean stamped split adds no mark');
        assert.equal(v.splitStampedOver.statementAppended, undefined, f + ': and no sentence');
        assert.equal(recs.get(f).contaminated, false, f + ': the gate census reads it as clean');
      }
    } else own++;
    if (reason) reasons++; else clean++;
  }
  assert.ok(stamped >= 2 && own >= 1, 'both kinds of row: stamped ' + stamped + ', own run ' + own);
  assert.ok(reasons >= 1 && clean >= 1, 'both kinds of split: a reason ' + reasons + ', clean ' + clean);
  assert.ok(marked >= 1, 'a stamped reason was seen: ' + marked);
  for (const f of ELEVEN) assert.equal(recs.get(f).split, 'object', f + ' in the gate census');
});

test('(b) a stamp changed no field its run wrote, and its split is the writer\'s logic now', async () => {
  let compared = 0, headBefore = 0, headAfter = 0, withSentence = 0;
  for (const f of ELEVEN) {
    const text = readFileSync(path.join(VERDICTS, f), 'utf8');
    const v = JSON.parse(text);
    if (v.splitStampedBy !== STAMP_BY) continue;
    const orig = originalOf(text, v.splitStampedOver);
    assert.equal(sha256(orig), v.splitStampedOver.sha256, f + ': the old bytes come back');
    assert.equal(Buffer.byteLength(orig, 'utf8'), v.splitStampedOver.bytes, f + ': the old length');
    const ov = JSON.parse(orig);
    assert.equal(ov.split, undefined, f + ': the old file had no split');
    assert.equal(ov.contaminated, undefined, f + ': the old file had no top-level mark');
    assert.deepEqual(numericLeaves(withoutStamp(v)), numericLeaves(ov), f + ': every numeric leaf as before');
    assert.deepEqual(withoutStamp(v), ov, f + ': every field as before');
    if (v.splitStampedOver.statementAppended !== undefined) {
      withSentence++;
      assert.equal(v.statement, ov.statement + v.splitStampedOver.statementAppended, f + ': the statement is the old one and the sentence, nothing else');
    } else assert.equal(v.statement, ov.statement, f + ': the statement is the old one');
    const tail = (v.splitStampedOver.markAdded ? ['contaminated'] : []).concat(STAMP_KEYS);
    assert.deepEqual(Object.keys(v).slice(-tail.length), tail, f + ': the stamp is the last keys');
    const c = await checkFile(VERDICTS, f);
    assert.equal(c.ok, true, f + ': ' + (c.problems || []).join('; '));
    // the writer's logic now, compiled alone from the writer (never imported: web/ladder-bar.mjs runs on import)
    if (!v.splitSource.writer.startsWith('bench/autopilot')) {
      const w = await writerSplitFor(v.splitSource.writer);
      assert.equal(w.fnSha256, v.splitSource.fnSha256, f + ': the writer\'s splitFor is the one stamped');
      assert.deepEqual(w.fn(v.splitSource.args), v.split, f + ': the split is splitFor(args)');
    }
    // the copy at git HEAD: before the commit it is the unstamped file, after it the stamped one
    const g = spawnSync('git', ['show', 'HEAD:bench/verdicts/' + f], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    if (g.status === 0) {
      const hv = JSON.parse(g.stdout);
      if (hv.splitStampedBy === STAMP_BY && hv.splitStampedAt === v.splitStampedAt) { assert.deepEqual(hv, v, f + ': unchanged since the committed stamp'); headAfter++; }
      else if (hv.splitStampedBy === STAMP_BY) { assert.deepEqual(withoutStamp(v), withoutStamp(hv), f + ': a restamp moved no field its run wrote'); headAfter++; }
      else { assert.deepEqual(withoutStamp(v), hv, f + ': every field as at HEAD'); assert.deepEqual(numericLeaves(withoutStamp(v)), numericLeaves(hv)); headBefore++; }
    }
    compared++;
  }
  assert.ok(compared >= 2, 'stamped files compared: ' + compared);
  assert.ok(withSentence >= 1, 'a stamp with a sentence was compared: ' + withSentence);
  assert.ok(headBefore + headAfter > 0, 'git HEAD compared (before ' + headBefore + ', after ' + headAfter + ')');
});

test('(b) CONTROLS: one number moved, the split edited, the stamp, the sentence and the mark cut out', async () => {
  const dir = tmp();
  try {
    const f = 'compress.json';
    const text = readFileSync(path.join(VERDICTS, f), 'utf8');
    const v = JSON.parse(text);
    assert.equal(v.splitStampedBy, STAMP_BY, 'the control needs a stamped file');
    assert.equal(typeof v.split.contaminated, 'string', 'and one whose split gives a reason');
    writeFileSync(path.join(dir, f), text);
    assert.equal((await checkFile(dir, f)).ok, true, 'the untouched copy passes');
    let row = contaminationRow(contaminationRecords(dir));
    assert.equal(row.ok, true, row.line);
    assert.deepEqual(row.labelled, [f], 'the untouched copy is contaminated and labelled');
    // one number moved in a field the run wrote
    const moved = text.replace('"wallMs": ' + v.wallMs, '"wallMs": ' + (v.wallMs + 1));
    assert.notEqual(moved, text);
    writeFileSync(path.join(dir, f), moved);
    let c = await checkFile(dir, f);
    assert.equal(c.ok, false);
    assert.ok(c.problems.includes('the old bytes do not come back (sha256)'), c.problems.join('; '));
    // the split edited: the stamp claims a clean split the writer does not give
    writeFileSync(path.join(dir, f), JSON.stringify({ ...v, split: { ...v.split, contaminated: false } }, null, 2) + '\n');
    c = await checkFile(dir, f);
    assert.equal(c.ok, false);
    assert.ok(c.problems.some((p) => p.startsWith('the split is not what bench/compress.mjs gives now')), c.problems.join('; '));
    // the sentence cut out of the statement (the mark kept): the row names the file contaminated and unlabelled
    const esc = JSON.stringify(v.splitStampedOver.statementAppended).slice(1, -1);
    const noSentence = text.replace(esc, '');
    assert.ok(noSentence.length === text.length - esc.length && noSentence.indexOf(esc) > noSentence.indexOf('"splitStampedOver"'), 'the first copy of the sentence was the statement\'s');
    writeFileSync(path.join(dir, f), noSentence);
    row = contaminationRow(contaminationRecords(dir));
    assert.equal(row.ok, false, row.line);
    assert.deepEqual(row.unlabelled, [f]);
    c = await checkFile(dir, f);
    assert.equal(c.ok, false);
    // the mark cut out (the sentence kept): the gate reads the file as clean, and the stamp check catches it
    const markLine = /\n([ \t]+)"contaminated": true,\r?\n(?=[ \t]+"split": \{)/;
    assert.match(text, markLine, 'the mark heads the stamp block');
    const noMark = text.replace(markLine, '\n');
    writeFileSync(path.join(dir, f), noMark);
    row = contaminationRow(contaminationRecords(dir));
    assert.equal(row.ok, true, 'the gate alone reads an unmarked reason as clean: ' + row.line);
    assert.equal(row.counts.contaminated, 0);
    c = await checkFile(dir, f);
    assert.equal(c.ok, false);
    assert.deepEqual(c.problems, ['the split gives a reason and the top-level contaminated mark is missing']);
    // the stamp cut out: the row names the file with no split again, and the stamp fixes it
    const orig = originalOf(text, v.splitStampedOver);
    writeFileSync(path.join(dir, f), orig);
    row = contaminationRow(contaminationRecords(dir));
    assert.equal(row.ok, false);
    assert.deepEqual(row.noSplit, [f]);
    writeFileSync(path.join(dir, f), text);
    row = contaminationRow(contaminationRecords(dir));
    assert.equal(row.ok, true, row.line);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('(c) the tool: dry run writes nothing, --write stamps once, own-run splits and own-run marks are never stamped', async () => {
  const dir = tmp();
  try {
    const before = {};
    for (const f of ELEVEN) {
      const text = readFileSync(path.join(VERDICTS, f), 'utf8');
      const v = JSON.parse(text);
      const orig = v.splitStampedBy === STAMP_BY ? originalOf(text, v.splitStampedOver) : text;
      writeFileSync(path.join(dir, f), orig);
      before[f] = orig;
    }
    const run = (...a) => spawnSync(process.execPath, [path.join(ROOT, 'tools', 'split-stamp.mjs'), '--dir', dir, ...a], { cwd: ROOT, encoding: 'utf8' });
    const dry = run();
    assert.equal(dry.status, 0, dry.stderr);
    assert.match(dry.stdout, /dry run: nothing written/);
    for (const f of ELEVEN) assert.equal(readFileSync(path.join(dir, f), 'utf8'), before[f], f + ': the dry run wrote nothing');
    const own = ELEVEN.filter((f) => { const v = JSON.parse(before[f]); return v.split !== undefined && v.split !== null; });
    const unsplit = ELEVEN.filter((f) => !own.includes(f));
    assert.ok(own.length >= 1 && unsplit.length >= 2, 'both kinds in the copy: own ' + own.length + ', unsplit ' + unsplit.length);
    for (const f of unsplit) {
      const reason = typeof read(f).split.contaminated === 'string';
      assert.match(dry.stdout, new RegExp(f.replace(/\./g, '\\.') + ': none -> object \\(contaminated ' + (reason ? 'a reason, top-level contaminated true' : 'false') + ', stamped\\)'), f + ': before none, after an object');
    }
    const w1 = run('--write');
    assert.equal(w1.status, 0, w1.stderr);
    assert.match(w1.stdout, new RegExp('wrote ' + unsplit.length + ' file'));
    for (const f of own) assert.equal(readFileSync(path.join(dir, f), 'utf8'), before[f], f + ': a split from its own run is never stamped');
    const after = Object.fromEntries(ELEVEN.map((f) => [f, readFileSync(path.join(dir, f), 'utf8')]));
    for (const f of unsplit) {
      const v = JSON.parse(after[f]);
      const tree = read(f);
      assert.equal(v.splitStampedBy, STAMP_BY);
      assert.deepEqual(v.split, tree.split, f + ': the same split as the tree\'s stamp');
      assert.equal(v.contaminated, tree.contaminated, f + ': the same mark as the tree\'s stamp');
      assert.equal(v.statement, tree.statement, f + ': the same statement as the tree\'s stamp');
    }
    const w2 = run('--write');
    assert.match(w2.stdout, /wrote 0 file/);
    for (const f of ELEVEN) assert.equal(readFileSync(path.join(dir, f), 'utf8'), after[f], f + ': a second --write changes nothing');
    const chk = run('--check');
    assert.equal(chk.status, 0, chk.stdout);
    assert.match(chk.stdout, new RegExp('split-stamp check: ' + ELEVEN.length + ' of ' + ELEVEN.length + ' ok'));
    const row = contaminationRow(contaminationRecords(dir));
    assert.equal(row.ok, true, row.line);
    // a run that wrote its own top-level contaminated is never overwritten by a stamp
    const withOwnMark = JSON.stringify({ contaminated: false, ...JSON.parse(before['compress.json']) }, null, 2) + '\n';
    writeFileSync(path.join(dir, 'compress.json'), withOwnMark);
    const p = await planFile(dir, 'compress.json');
    assert.equal(p.action, 'conflict', p.why);
    const w3 = run('--write', '--only', 'compress.json');
    assert.match(w3.stdout, /\[conflict: /);
    assert.equal(readFileSync(path.join(dir, 'compress.json'), 'utf8'), withOwnMark, 'the conflicting file is left as it was');
    // a file with no row in the table is left alone
    assert.equal((await planFile(dir, 'nope.json')).action, 'missing');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('(d) the writers this item owns put the split in the verdict their own run builds, run with no model', async () => {
  // the landing files a narrow run of these writers could reach in the real tree: none may move
  const guarded = ['code.json', 'code-partial.json', 'code.progress.json', 'code.lock.json', 'compress-partial.json', 'compress-delta-rerun.json', 'math-partial.json', 'synth-partial.json'];
  const snap = () => Object.fromEntries(guarded.map((f) => { try { return [f, sha256(readFileSync(path.join(VERDICTS, f), 'utf8'))]; } catch { return [f, null]; } }));
  const landingBefore = snap();
  const dir = tmp();
  try {
    // bench/code.mjs: two tasks, the null arm (no socket), asked not to write
    const code = await import('../bench/code.mjs');
    const cv = await code.run({ limit: 2, arms: 'null', quiet: true, write: false });
    assert.equal(cv.isTheBar, false);
    assert.equal(cv.shape.tasksRun, 2);
    assert.equal(cv.ollamaUp, null, 'the null arm alone never probed the model');
    assert.equal(typeof cv.tasks.seed, 'string', 'the fixture names its seed');
    assert.deepEqual(cv.split, code.splitFor({ tasks: 2, inMemory: false, seed: cv.tasks.seed }), 'the run\'s split is splitFor of its own task count and seed');
    assert.equal(cv.split.development.seed, cv.tasks.seed);
    assert.match(cv.split.development.generator, /bench\/code\.mjs/);
    assert.equal(cv.split.contaminated, false);
    assert.equal(cv.contaminated, undefined, 'a clean split: no top-level mark');
    assert.doesNotMatch(cv.statement, /Contaminated, as the split says/);

    // bench/compress.mjs: the three heavy parts skipped (no RAM wait, nothing allocated), asked not to write
    const comp = await import('../bench/compress.mjs');
    const kv = await comp.run({ skipDaemon: true, skipOrganism: true, skipTiers: true, write: false, quiet: true, tmp: dir });
    assert.equal(kv.daemon, null);
    assert.equal(kv.tiers, null);
    assert.deepEqual(kv.split, comp.splitFor({ seed: kv.params.seed, tasks: kv.params.tasks, tierN: kv.params.tierN, tierKeys: kv.params.tierKeys, daemon: false, tiers: false }));
    assert.doesNotMatch(kv.split.development.what, /daemon/, 'a run without the daemon part says so');
    assert.match(kv.split.heldOut.what, /this run had no tier part/);
    assert.equal(kv.contaminated, true, 'a reason: the top-level mark');
    assert.ok(kv.statement.endsWith(' Contaminated, as the split says: ' + kv.split.contaminated + '.'), 'and the statement says so');

    // bench/math.mjs: a mock cell and a mock probe, both record sources (a train file, and the test file as the fallback)
    const math = await import('../bench/math.mjs');
    const recs = [0, 1, 2].map((i) => JSON.stringify({ question: 'Record ' + i + ': six rows of seven.', answer: 'work\n#### 42' })).join('\n') + '\n';
    writeFileSync(path.join(dir, 'train.jsonl'), recs);
    writeFileSync(path.join(dir, 'test.jsonl'), recs);
    const completeFn = async (o) => ({ text: String(o.prompt).includes('Check it.') ? 'ACCEPT' : 'The answer is 42.', ok: true, provider: 'ollama', model: o.model, ms: 1, tokens: 1 });
    const mathReasons = new Set();
    for (const [label, trainFile] of [['train', path.join(dir, 'train.jsonl')], ['fallback', path.join(dir, 'absent.jsonl')]]) {
      const sub = path.join(dir, 'math-' + label);
      mkdirSync(sub);
      const mv = await math.run({ limit: 2, seed: '1', trainFile, testFile: path.join(dir, 'test.jsonl'), verdictDir: sub, journalDir: sub, completeFn, probeFn: async () => true, nobig: true, log: () => {}, argv: ['--limit', '2'] });
      const disk = JSON.parse(readFileSync(path.join(sub, 'math-partial.json'), 'utf8'));
      const r = disk.records;
      assert.equal(r.fallbackToTest, label === 'fallback', label);
      assert.deepEqual(disk.split, math.splitFor({ split: r.split, file: r.file, fallback: r.fallbackToTest, n: r.n, seed: r.seed, overlapWithPublicStage: r.overlapWithPublicStage }), label + ': the written split is splitFor of the written records');
      assert.deepEqual(mv.split, disk.split);
      assert.equal(disk.contaminated, true, label + ': a reason, the top-level mark');
      assert.ok(disk.statement.endsWith(' Contaminated, as the split says: ' + disk.split.contaminated + '.'), label + ': the statement says so');
      mathReasons.add(disk.split.contaminated);
    }
    assert.equal(mathReasons.size, 2, 'the train and the fallback runs give different reasons');

    // bench/synth.mjs: run() refuses without Ollama, so the verdict builder run() calls is run alone
    const synth = await import('../bench/synth.mjs');
    const cfg = synth.makeCfg({ stages: 'code', limit: 2, write: false });
    for (const final of [false, true]) {
      const { v, file } = synth.verdictOf({ cfg, st: { codeHash: 'unsplit-bars', peakRss: 0, started: new Date().toISOString() }, stages: {}, final });
      assert.equal(file, synth.PARTIAL, 'a narrow run lands in the partial file');
      assert.equal(v.isTheBar, false);
      assert.deepEqual(v.split, synth.splitFor());
      assert.equal(v.contaminated, true);
      assert.ok(v.statement.endsWith(' Contaminated, as the split says: ' + v.split.contaminated + '.'));
    }

    // bench/public.mjs: the null arm (no socket) on GSM8K seeds until both kinds of split are reached
    const pub = await import('../bench/public.mjs');
    const pubDir = path.join(dir, 'public');
    mkdirSync(pubDir);
    let clean = 0, reason = 0;
    for (let i = 0; i < 16 && !(clean && reason); i++) {
      const pv = await pub.run({ set: 'gsm8k', limit: 4, seed: 'unsplit-bars-' + i, arms: 'null', quiet: true, journalDir: pubDir, verdictDir: pubDir });
      const d = pv.rows.filter((r) => r.split === 'development').length;
      assert.deepEqual(pv.split, pub.splitFor({ set: 'gsm8k', development: d, heldOut: pv.rows.length - d }), 'seed ' + i + ': the split is splitFor of the rows\' own placement');
      assert.equal(pv.split.development.n + pv.split.heldOut.n, pv.rows.length);
      if (d === 0) { assert.equal(pv.split.contaminated, false); clean++; }
      else { assert.match(pv.split.contaminated, new RegExp('^' + d + ' of the ' + pv.rows.length + ' graded records are development records')); reason++; }
      const disk = JSON.parse(readFileSync(path.join(pubDir, pub.VERDICT_NAME('gsm8k', false)), 'utf8'));
      assert.deepEqual(disk.split, pv.split, 'seed ' + i + ': the file it wrote carries the same split');
    }
    assert.ok(clean >= 1 && reason >= 1, 'both kinds of public split were reached: clean ' + clean + ', a reason ' + reason);
  } finally { rmSync(dir, { recursive: true, force: true }); }
  assert.deepEqual(snap(), landingBefore, 'no landing file in bench/verdicts moved while the writers ran');

  // the split functions alone, on planted arguments
  const codeFn = (await writerSplitFor('bench/code.mjs')).fn;
  const cs = codeFn({ tasks: 40, inMemory: false, seed: 'code-2026-09-18' });
  assert.equal(cs.development.seed, 'code-2026-09-18');
  assert.equal(codeFn({ tasks: 40 }).development.seed, null, 'an unnamed seed is null, never invented');
  const comp = (await writerSplitFor('bench/compress.mjs')).fn;
  const full = comp({ seed: 'compress-12', tasks: 10, tierN: 200, tierKeys: 4096 });
  const bare = comp({ seed: 'compress-12', tasks: 10, daemon: false, tiers: false });
  assert.match(full.development.what, /the daemon bar organism/);
  assert.doesNotMatch(bare.development.what, /daemon/);
  assert.deepEqual(comp({ seed: 'compress-12', tasks: 10, tierN: 200, tierKeys: 4096, daemon: true, tiers: true }), full);
  const pubFn = (await writerSplitFor('bench/public.mjs')).fn;
  assert.match(pubFn({ set: 'gsm8k', development: null, heldOut: 25 }).contaminated, /were not measured for gsm8k/);
  assert.match(pubFn({}).contaminated, /no set was named/);
  const two = pubFn({ sets: { gsm8k: { development: 5, heldOut: 25 }, humaneval: { development: 7, heldOut: 23 } } });
  assert.equal(two.development.n, 12);
  assert.equal(two.heldOut.n, 48);
  assert.deepEqual(two.heldOut.sets, { gsm8k: 25, humaneval: 23 });
  for (const s of [cs, full, bare, two]) assertSplit(s, 'planted');
  // each splitFor stands alone (the stamp compiles it with nothing around it)
  for (const f of ['bench/code.mjs', 'bench/compress.mjs', 'bench/math.mjs', 'bench/public.mjs', 'bench/synth.mjs']) assert.ok(functionSource(readFileSync(path.join(ROOT, f), 'utf8'), 'splitFor'), f);
});

test('(e) the gate row names none of the eleven, every cause left is grid.json\'s, and the verdict quotes only printed numbers', () => {
  const cli = gateRowCli(ROOT);
  assert.match(cli.line, /^CONTAMINATION (GREEN|RED)/, cli.line + ' ' + cli.stderr);
  const { causes, files } = causeFilesOf(cli.line);
  for (const f of ELEVEN) assert.ok(!files.includes(f), f + ' is not named: ' + cli.line);
  assert.deepEqual(files.filter((f) => f !== 'grid.json'), [], 'every cause names grid.json alone: ' + cli.line);
  assert.ok(causes <= 1, cli.line);
  assert.equal(cli.exit, causes === 0 ? 0 : 1, 'the exit is the row (it rules while no autopilot lock is live)');
  // every stamped file whose split gives a reason is in the row's labelled list
  const lab = labelledOf(cli.line);
  assert.equal(lab.files.length, lab.n, 'the labelled list is as long as its count');
  for (const f of ELEVEN) {
    const v = read(f);
    if (v.splitStampedBy === STAMP_BY && typeof v.split.contaminated === 'string') assert.ok(lab.files.includes(f), f + ' is labelled: ' + cli.line);
  }
  // the verdict the bar wrote agrees with the lines it quotes
  const vf = path.join(VERDICTS, 'unsplit-bars.json');
  assert.ok(existsSync(vf), 'node tools/split-stamp.mjs --bar wrote its verdict');
  const v = JSON.parse(readFileSync(vf, 'utf8'));
  assert.equal(v.isTheBar, true);
  assert.equal(typeof v.barMet, 'boolean');
  assert.ok(v.statement.includes(v.bar.printed), 'the statement quotes the printed line verbatim');
  const q = causeFilesOf(v.bar.printed);
  assert.equal(v.barMet, q.files.every((f) => f === 'grid.json') && v.eleven.failed.length === 0 && v.eleven.stampedLabelled.length === v.eleven.stampedWithAReason.length, 'barMet is the quoted lines');
  assert.match(v.bar.tally, /^split-stamp bar: gate exit \d+, /);
  const num = /(?<![\w.-])\d+(?:\.\d+)?(?![\w.-])/g;
  const printed = new Set([...(v.bar.printed + ' ' + v.bar.tally).matchAll(num)].map((m) => m[0]));
  const quoted = [...v.statement.matchAll(num)].map((m) => m[0]);
  assert.ok(quoted.length >= 8, 'the statement quotes numbers: ' + quoted.length);
  for (const n of quoted) assert.ok(printed.has(n), 'the statement number ' + n + ' is on a printed line');
  // CONTROL: a number the bar did not print is caught by the same walk
  assert.equal(printed.has('987654321'), false);
  assert.equal(splitShapeOf(v), 'object');
  assert.equal(v.split.heldOut, 'none');
  assert.ok(typeof v.split.why === 'string' && v.split.why.length > 20, 'no held-out set, and why');
  assert.equal(v.contaminated, true);
  assert.match(v.statement, /Contaminated, as the split says/);
  assert.equal(v.control.noSplit.length, v.eleven.stamped.length, 'the control: every stamped file cut back to its original has no split');
});
