// test/docs-history.test.mjs: docs/LOG.md is history for tools/docs-numbers.mjs. It is still read
// and counted, its count is printed as history=, and it does not set the exit code. The check
// runs the tool as a process on the real file so the exit path itself is what is graded.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HISTORY_DOCS, isHistory, GENERATED_DOCS, checkDoc, knownValues } from '../tools/docs-numbers.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOOL = path.join(ROOT, 'tools', 'docs-numbers.mjs');
const LOG = path.join(ROOT, 'docs', 'LOG.md');

test('docsNumbers: the history list names LOG.md alone, with a reason, and is disjoint from the generated list', () => {
  assert.deepEqual(HISTORY_DOCS.map((h) => h.doc), ['LOG.md']);
  for (const h of HISTORY_DOCS) assert.ok(h.why.length > 40, 'a history entry carries its reason');
  for (const h of HISTORY_DOCS) assert.ok(!GENERATED_DOCS.includes(h.doc), 'a history document is not a generated one');
  assert.equal(isHistory('LOG.md'), true);
  assert.equal(isHistory('PORTFOLIO.md'), false);
  assert.equal(isHistory('WHOLE.md'), false);
});

test('docsNumbers: the log is still read and counted, and its numbers do not set the exit code', () => {
  const r = checkDoc(LOG, knownValues());
  assert.ok(r.protected + r.unprotected + r.skipped > 100, 'the log was read: ' + JSON.stringify({ p: r.protected, u: r.unprotected, s: r.skipped }));
  const run = spawnSync(process.execPath, [TOOL, LOG], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(run.status, 0, 'exit 0 on the log alone:\n' + run.stdout + run.stderr);
  assert.match(run.stdout, /^LOG\.md: history=\d+ not held to the live verdicts/m, 'the count is printed, not hidden');
  assert.match(run.stdout, /docs checked 0 \(\+1 history\)/, 'the summary separates history from the held documents');
  assert.ok(!/^  line \d+:/m.test(run.stdout), 'history numbers are not listed line by line');
});

test('docsNumbers: a publication document with an unprotected number still exits 1', () => {
  const run = spawnSync(process.execPath, [TOOL, path.join(ROOT, 'test', 'fixtures', 'docs-numbers-unprotected.md')], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(run.status, 1, 'the fixture with a value nothing carries exits 1:\n' + run.stdout + run.stderr);
  assert.match(run.stdout, /documents with an unprotected number 1/);
});
