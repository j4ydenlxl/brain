// test/vision-count.test.mjs: the vision counter (tools/vision-count.mjs) and the one typed number in
// docs/VISION.md section 4 that it protects.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { countVision, countLine, typedLine, STATUS_WORDS } from '../tools/vision-count.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const md = fs.readFileSync(path.join(ROOT, 'docs', 'VISION.md'), 'utf8');

test('the counter reads a planted list and classifies every status word, unstated included', () => {
  const planted = ['## 3. x', '1. a. Status: MET.', '2. b. Status: PARTIAL (x).', '3. c. Status: OPEN tonight.', '4. d. Status: FROZEN.', '5. e. Status: recorded in P7.', '6. f. Status: PARTIAL (y), FROZEN (z).', '## 4. y', '6 orders listed. MET: 1. PARTIAL: 2. OPEN: 1. FROZEN: 1. UNSTATED: 1 (5).'].join('\n');
  const c = countVision(planted);
  assert.equal(c.total, 6);
  assert.deepEqual(c.counts, { MET: 1, PARTIAL: 2, OPEN: 1, FROZEN: 1, UNSTATED: 1 });
  assert.deepEqual(c.unstated, [5]);
  assert.equal(c.items[5].status, 'PARTIAL', 'the first status word wins when a line carries two');
  assert.equal(countLine(c), '6 orders listed. MET: 1. PARTIAL: 2. OPEN: 1. FROZEN: 1. UNSTATED: 1 (5).');
  assert.equal(typedLine(planted), countLine(c));
  assert.deepEqual(STATUS_WORDS, ['MET', 'PARTIAL', 'OPEN', 'FROZEN']);
});

test('docs/VISION.md: every numbered order carries a status word, none is unstated', () => {
  const c = countVision(md);
  assert.ok(c.total >= 35, 'the list never shrinks below the 35 orders of 2026-09-26: ' + c.total);
  assert.deepEqual(c.unstated, [], 'orders with no status word: ' + c.unstated.join(', '));
  const numbers = c.items.map(i => i.n);
  assert.deepEqual(numbers, numbers.map((_, i) => i + 1), 'numbered 1..n without a gap');
});

test('docs/VISION.md section 4 types exactly what the counter prints (a typed number nothing checks is a defect)', () => {
  const c = countVision(md);
  const line = countLine(c);
  console.log('VISION ' + line);
  assert.equal(typedLine(md), line, 'retype section 4 from: ' + line);
});
