// test/wire-induce-verify.test.mjs: the verdicts board 31 (item wire-induce-verify) wrote, read back and re-graded.
// No model, no socket: it reads bench/verdicts/*.json and rebuilds the held-out draw from the journals on disk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const V = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'bench', 'verdicts', f), 'utf8'));
const W = await import(pathToFileURL(path.join(ROOT, 'test', 'wire-induce-verify.mjs')).href);
const MARK = ' WIRE (added by node test/wire-induce-verify.mjs';

test('ns.json and induce.json grade the same 200 held-out ids, and the store was induced on development only', () => {
  const ns = V('ns.json');
  const ind = V('induce.json');
  const a = ns.split.heldOut.ids;
  const b = ind.split.heldOut.ids;
  assert.equal(a.length, 200);
  assert.equal(new Set(a).size, 200, 'no id twice');
  assert.deepEqual([...b].sort(), [...a].sort(), 'the same set');
  const dev = new Set(ind.split.development.ids);
  assert.ok(dev.size > 0, 'development is not empty (the overlap check below is about something)');
  assert.equal(a.filter((id) => dev.has(id)).length, 0, 'no held-out id among the development records');
  assert.equal(ind.split.development.nsAt, ns.at, 'induce.json read the ns.json on disk');
  const store = V('induce-programs.json');
  assert.equal(store.development.idsSha256, ind.split.development.idsSha256, 'the shipped store is the one induce.json induced');
});

test('the held-out draw is bench/public.mjs sampleIds at seed public/1 over the pool at ns.json at, rebuilt from the journals', async () => {
  const PUB = await import(pathToFileURL(path.join(ROOT, 'bench', 'public.mjs')).href);
  const NS = await import(pathToFileURL(path.join(ROOT, 'bench', 'ns.mjs')).href);
  const ns = V('ns.json');
  assert.equal(ns.split.heldOut.seed, 'public/1');
  const gsm = PUB.loadGsm8k();
  const d = W.drawAt(ns.at, { PUB, NS, gsm });
  assert.equal(d.pool, ns.split.heldOut.pool);
  assert.deepEqual([...d.drawn].sort(), [...ns.split.heldOut.ids].sort());
  // the control: board 26's instant draws a different 200 from a different pool (the journals grew between)
  const b26 = W.drawAt(W.BOARD26_NS_AT, { PUB, NS, gsm });
  assert.equal(b26.drawn.length, 200);
  assert.notDeepEqual([...b26.drawn].sort(), [...ns.split.heldOut.ids].sort());
});

test('induce-wire.json: no right to wrong flip, no pre-emption, no HumanEval number, the site unchanged, no socket, against a control that had them', () => {
  const v = V('induce-wire.json');
  assert.equal(v.isTheBar, true);
  assert.equal(v.barMet, true);
  assert.equal(v.split.contaminated, false);
  assert.equal(v.sockets, 0);
  assert.equal(v.modelCalls, 0);
  // re-grade the flips from the rows, not from the counters
  const ns = V('ns.json');
  assert.equal(v.rows.length, 200);
  assert.deepEqual(v.rows.map((r) => r.id).sort(), [...ns.split.heldOut.ids].sort());
  const r2w = v.rows.filter((r) => r.off.ok === true && r.on.ok !== true).length;
  const w2r = v.rows.filter((r) => r.off.ok !== true && r.on.ok === true).length;
  assert.equal(r2w, 0);
  assert.equal(r2w, v.flips.ns.rightToWrong);
  assert.equal(w2r, v.flips.ns.wrongToRight);
  assert.ok(v.rows.some((r) => r.on.from === 'program'), 'the tier answered on held out, so the flip count is about something');
  assert.equal(v.flips.site.rightToWrong, 0);
  assert.equal(v.preemptTotal, 0);
  assert.equal(v.humaneval.program, 0);
  assert.equal(v.humaneval.n, 161);
  assert.equal(v.siteSame, W.SITE_PROMPTS.length);
  assert.equal(v.site.length, W.SITE_PROMPTS.length);
  // the control is the tier as board 26 wired it, measured with the same counters
  assert.ok(v.control && v.control.preemptTotal > 0, 'the control pre-empted');
  assert.ok(v.control.heProgram > 0, 'the control answered numbers to code prompts');
  const before = V('induce-wire-before.json');
  assert.equal(before.isTheBar, false);
  assert.equal(before.barMet, false);
  assert.equal(before.preemptTotal, v.control.preemptTotal);
  assert.notEqual(before.code['act/prompt.mjs'], v.code['act/prompt.mjs'], 'the control ran the tier before the fix');
});

test('every number in the induce-wire statement and in the ns.json wire addition is on a printed line', () => {
  const v = V('induce-wire.json');
  assert.ok(W.numbersIn(v.statement).length > 10, 'the statement carries numbers');
  assert.deepEqual(W.unprintedNumbers(v.statement, v.printed), []);
  const ns = V('ns.json');
  const parts = ns.statement.split(MARK);
  assert.equal(parts.length, 2, 'one wire addition');
  const wire = ns.printed.filter((l) => l.startsWith('wire: '));
  assert.equal(wire.length, v.printed.length);
  assert.deepEqual(W.unprintedNumbers(MARK + parts[1], wire), []);
  assert.equal(ns.wire.barMet, v.barMet);
  assert.equal(ns.barMet, false, 'ns.json own bar is untouched by the addition');
  // the planted control: a number no line printed is caught
  assert.deepEqual(W.unprintedNumbers(v.statement + ' and 987654 more', v.printed), ['987654']);
  assert.deepEqual(W.unprintedNumbers('right 9 of 200', ['right 9 of 2000']), ['200'], 'a number is matched as a whole token');
});
