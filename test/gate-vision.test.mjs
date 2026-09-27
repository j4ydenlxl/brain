// test/gate-vision.test.mjs: the VISION row of the gate (docs/VISION.md order 9's bar). The row prints the
// counter's line, rules RED only on drift between section 4 and the list (or an unstated order), and says
// reached only when MET equals the total. N/A when the counter or the document is absent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { visionRow, ROOT } from '../bench/gate.mjs';
import * as counter from '../tools/vision-count.mjs';

const doc = (statuses, typed) => [
  '# VISION', '', '## 3. Every order as a plan', '',
  ...statuses.map((w, i) => `${i + 1}. "an order" -> a plan. Bar: a command. Status: ${w} (a reason).`),
  '', '## 4. The count', '', typed, '', 'The line above is printed by node tools/vision-count.mjs.', '',
].join('\n');

test('VISION row: the counter line is printed, section 4 agreeing is GREEN, reached only when MET equals the total', () => {
  const md = doc(['MET', 'PARTIAL', 'OPEN', 'FROZEN', 'MET'], '5 orders listed. MET: 2. PARTIAL: 1. OPEN: 1. FROZEN: 1.');
  const r = visionRow({ md });
  assert.equal(r.graded, true);
  assert.equal(r.rules, true);
  assert.equal(r.ok, true, r.line);
  assert.equal(r.count, '5 orders listed. MET: 2. PARTIAL: 1. OPEN: 1. FROZEN: 1.');
  assert.equal(r.reached, false);
  assert.equal(r.met, 2);
  assert.equal(r.total, 5);
  assert.match(r.line, /^VISION GREEN: 5 orders listed\. MET: 2\. PARTIAL: 1\. OPEN: 1\. FROZEN: 1\. section 4 agrees; reached false \(MET 2 of 5\)$/);
  const all = doc(['MET', 'MET', 'MET'], '3 orders listed. MET: 3. PARTIAL: 0. OPEN: 0. FROZEN: 0.');
  const done = visionRow({ md: all });
  assert.equal(done.ok, true);
  assert.equal(done.reached, true, 'MET equal to the total is the only reached');
  assert.match(done.line, /reached true \(MET 3 of 3\)/);
});

test('VISION row: section 4 typing a different count is RED with the two lines named; an unstated order is RED', () => {
  const drift = visionRow({ md: doc(['MET', 'OPEN'], '2 orders listed. MET: 2. PARTIAL: 0. OPEN: 0. FROZEN: 0.') });
  assert.equal(drift.ok, false);
  assert.equal(drift.rules, true, 'drift rules: it is the unprotected-document-numbers defect');
  assert.match(drift.line, /^VISION RED: 2 orders listed\. MET: 1\. PARTIAL: 0\. OPEN: 1\. FROZEN: 0\. section 4 DISAGREES/);
  assert.match(drift.line, /section 4 types "2 orders listed\. MET: 2\./);
  assert.match(drift.line, /retype section 4 from node tools\/vision-count\.mjs/);
  const none = visionRow({ md: doc(['MET'], 'no count here') });
  assert.equal(none.ok, false);
  assert.match(none.line, /section 4 types no count line/);
  const unstated = visionRow({ md: doc(['MET', 'someday'], '2 orders listed. MET: 1. PARTIAL: 0. OPEN: 0. FROZEN: 0. UNSTATED: 1 (2).') });
  assert.equal(unstated.ok, false, 'the typed line agrees but order 2 has no status word');
  assert.deepEqual(unstated.unstated, [2]);
  assert.match(unstated.line, /orders with no status word: 2/);
  const empty = visionRow({ md: '# nothing\n\n## 3. list\n\n## 4. The count\n\n0 orders listed. MET: 0. PARTIAL: 0. OPEN: 0. FROZEN: 0.\n' });
  assert.equal(empty.ok, false);
  assert.equal(empty.reached, false, 'zero of zero is not reached');
  assert.match(empty.line, /section 3 lists no numbered order/);
});

test('VISION row: N/A (graded false, not ruling) without the counter or without the document; the real tree is graded and agrees', () => {
  const noCounter = visionRow({ md: doc(['MET'], '1 orders listed. MET: 1. PARTIAL: 0. OPEN: 0. FROZEN: 0.'), counter: null });
  assert.equal(noCounter.graded, false);
  assert.equal(noCounter.rules, false);
  assert.equal(noCounter.ok, true);
  assert.match(noCounter.line, /^VISION N\/A: tools\/vision-count\.mjs is not beside this gate/);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gate-vision-'));
  const noDoc = visionRow({ root: dir, counter });
  assert.equal(noDoc.graded, false);
  assert.match(noDoc.line, /^VISION N\/A: docs\/VISION\.md is not in this tree/);
  fs.rmSync(dir, { recursive: true, force: true });
  const real = visionRow({ root: ROOT, counter });
  assert.equal(real.graded, true);
  assert.equal(real.ok, true, real.line);
  assert.equal(real.count, counter.countLine(counter.countVision(fs.readFileSync(path.join(ROOT, 'docs', 'VISION.md'), 'utf8'))));
  assert.equal(typeof real.reached, 'boolean');
  console.log('tally: ' + real.line);
});

test('VISION row: node bench/gate.mjs --vision prints the row alone and exits 0 on the real tree', async () => {
  const { spawnSync } = await import('node:child_process');
  const gate = path.join(ROOT, 'bench', 'gate.mjs');
  assert.equal(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), ROOT);
  const r = spawnSync(process.execPath, [gate, '--vision'], { cwd: ROOT, encoding: 'utf8', timeout: 60000 });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /^VISION GREEN: \d+ orders listed\. MET: \d+\. PARTIAL: \d+\. OPEN: \d+\. FROZEN: \d+\. section 4 agrees; reached (true|false) \(MET \d+ of \d+\)\s*$/);
});
