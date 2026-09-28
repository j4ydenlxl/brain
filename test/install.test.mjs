// test/install.test.mjs: the install bar (bench/install.mjs, docs/VISION.md order 44 clause (3)).
// The tracer on a planted fixture tree, the excluded filter on fixed paths, the installed-answer rule, the
// package.json files field against the excluded prefixes, bin/brain.mjs --version and --help, and the verdict
// file's shape after ONE bar run (under tools/budget.mjs, into a temp dir, control arm skipped for the wall).
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { trace, isExcluded, isAnswered, norm, EXCLUDED_PREFIXES, PROMPTS, MISS_TEXTS } from '../bench/install.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TMP = mkdtempSync(path.join(tmpdir(), 'brain-install-test-'));
after(() => { rmSync(TMP, { recursive: true, force: true }); });
const PKG = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

// every number a statement quotes, as a whole token, that the bar's stdout never printed (rule 1: never
// quote a number a command did not print). A token is digits with optional .digits groups (so 0.1.0 is one).
function unprintedNumbers(statement, stdout) {
  const nums = [...new Set(statement.match(/\d+(?:\.\d+)*/g) || [])];
  return nums.filter((n) => !new RegExp('(?<!\\d)(?<!\\d\\.)' + n.replaceAll('.', '\\.') + '(?!\\d)(?!\\.\\d)').test(stdout));
}

function runBar(scratch, out, extra) {
  return spawnSync(process.execPath, [
    path.join(ROOT, 'tools', 'budget.mjs'), '--ram-mb', '4000', '--disk-mb', '600', '--dir', scratch, '--no-record', '--',
    process.execPath, '--max-old-space-size=4000', path.join(ROOT, 'bench', 'install.mjs'), '--scratch', scratch, '--out', out, ...extra,
  ], { cwd: ROOT, encoding: 'utf8', timeout: 110_000, env: { ...process.env, NO_COLOR: '1' } });
}

function plant(dir, files) {
  for (const [rel, body] of Object.entries(files)) {
    const f = path.join(dir, rel);
    mkdirSync(path.dirname(f), { recursive: true });
    writeFileSync(f, body);
  }
}

test('tracer: two modules and one data file are reached, an unreferenced module is not', () => {
  const dir = path.join(TMP, 'fx-basic');
  plant(dir, {
    'lib/a.mjs': "import { b } from './b.mjs';\nexport const a = () => b();\n",
    'lib/b.mjs': "import fs from 'node:fs';\nimport path from 'node:path';\nimport { fileURLToPath } from 'node:url';\nconst HERE = path.dirname(fileURLToPath(import.meta.url));\nexport const b = () => JSON.parse(fs.readFileSync(path.join(HERE, '..', 'data', 'table.json'), 'utf8'));\n",
    'data/table.json': '{"x":1}\n',
    'lib/unused.mjs': 'export const nobody = 1;\n',
  });
  const t = trace(dir, ['lib/a.mjs']);
  assert.deepEqual(t.modules, ['lib/a.mjs', 'lib/b.mjs']);
  assert.deepEqual(t.data, ['data/table.json']);
  assert.deepEqual(t.reached, ['data/table.json', 'lib/a.mjs', 'lib/b.mjs']);
  assert.ok(!t.reached.includes('lib/unused.mjs'), 'a module nothing names is never reached');
  assert.equal(t.how.data['data/table.json'].how, 'join:HERE', 'the data path resolved through the module-defined HERE');
  assert.equal(t.how.modules['lib/b.mjs'].how, 'static', 'a static import, found by the import rule');
  assert.deepEqual(t.unresolved, []);
});

test('tracer: every kind of reference, and the three data outcomes (reached, excluded, absent)', () => {
  const dir = path.join(TMP, 'fx-kinds');
  plant(dir, {
    'bin/cli.mjs': [
      "export {",
      "  x, // a comment inside the braces: (not) a problem",
      "} from '../core/x.mjs';",
      "const lazy = (spec) => import(spec);",
      "export const go = () => lazy('../act/heavy.mjs');",
      "export const dyn = () => import('../act/dyn.mjs');",
      "export const computed = (root) => import(pathToFileURL(path.join(root, 'mind', 'deep.mjs')).href);",
      "export const blind = (f) => import(f);",
    ].join('\n'),
    'core/x.mjs': "export const x = 1;\nimport fs from 'node:fs';\nexport const v = () => fs.readFileSync(new URL('./x.json', import.meta.url));\n",
    'core/x.json': '{}\n',
    'act/heavy.mjs': "import path from 'node:path';\nimport { fileURLToPath } from 'node:url';\nconst HERE = path.dirname(fileURLToPath(import.meta.url));\nexport const STORE = path.resolve(HERE, '..', 'bench', 'verdicts', 'kept.json');\nexport const OPT = path.join(HERE, 'optional.json');\n",
    'act/dyn.mjs': 'export const d = 1;\n',
    'mind/deep.mjs': 'export const deep = 1;\n',
    'bench/verdicts/kept.json': '{}\n',
  });
  const t = trace(dir, ['bin/cli.mjs']);
  assert.deepEqual(t.modules, ['act/dyn.mjs', 'act/heavy.mjs', 'bin/cli.mjs', 'core/x.mjs', 'mind/deep.mjs']);
  assert.equal(t.how.modules['core/x.mjs'].how, 'static', 'a multi-line export-from with a comment inside the braces');
  assert.equal(t.how.modules['act/heavy.mjs'].how, 'literal', 'a quoted module path handed to a lazy() helper');
  assert.equal(t.how.modules['act/dyn.mjs'].how, 'dynamic');
  assert.equal(t.how.modules['mind/deep.mjs'].how, 'dynamic-computed');
  assert.deepEqual(t.data, ['core/x.json'], 'new URL next to the module');
  assert.deepEqual(t.dataExcluded, ['bench/verdicts/kept.json'], 'runtime data under an excluded prefix is listed, never reached');
  assert.deepEqual(t.dataAbsent, ['act/optional.json'], 'a known-base path with no file is absent');
  assert.equal(t.blind.length, 2, 'import(spec) inside lazy() and import(f) are listed as blind');
  assert.ok(t.blind.every((b) => b.how === 'dynamic-expression'));
});

test('tracer: an unresolved relative import is reported, not dropped', () => {
  const dir = path.join(TMP, 'fx-broken');
  plant(dir, { 'a.mjs': "import { gone } from './gone.mjs';\nexport default gone;\n" });
  const t = trace(dir, ['a.mjs']);
  assert.deepEqual(t.modules, ['a.mjs']);
  assert.equal(t.unresolved.length, 1);
  assert.equal(t.unresolved[0].spec, './gone.mjs');
});

test('excluded filter on fixed paths', () => {
  const yes = [
    'state/x.json', 'state', 'bench/fixtures/wiki/store/records.bin', 'bench/verdicts/install.json', 'organism/gen-0-pruned/index.mjs',
    'docs/VISION.md', 'web/dist/index.html', '.vercel/project.json', '.env', '.env.local', 'act/.env', 'deep/dir/.env.local',
    '.env.production', 'package/state/budget/last.json', 'package\\bench\\verdicts\\x.json', './docs/DEVELOPERS.md',
  ];
  const no = [
    'bench/answer.mjs', 'bench/conceive-prompts.json', 'bench/verdictsX.json', 'web/src/findings.html', 'stateful/x.mjs',
    'docs.mjs', 'act/prompt.mjs', '.envrc', 'environment.mjs', 'organisms.md', 'package.json', 'LICENSE',
  ];
  for (const p of yes) assert.equal(isExcluded(p), true, p + ' must be excluded');
  for (const p of no) assert.equal(isExcluded(p), false, p + ' must not be excluded');
  assert.equal(norm('package/bin/brain.mjs'), 'bin/brain.mjs');
  assert.equal(EXCLUDED_PREFIXES.length, 7);
});

test('answered: a miss text or an empty text is not an answer', () => {
  assert.equal(isAnswered('Hello. I am Dilation.'), true);
  assert.equal(isAnswered('4'), true);
  assert.equal(isAnswered(''), false);
  assert.equal(isAnswered('   '), false);
  assert.equal(isAnswered(null), false);
  for (const m of MISS_TEXTS) {
    assert.equal(isAnswered(m + ': I answer greetings natively.'), false, m);
    assert.equal(isAnswered('answered from memory\n' + m.toLowerCase() + ' this prompt.'), false, m);
  }
  assert.deepEqual([...PROMPTS], ['hey', 'hi', '2+2', 'What is 12 times 12?', 'What is the capital of France?']);
});

test('package.json: files names nothing excluded, engines node >=24, zero dependencies, the bin is shipped', () => {
  assert.ok(Array.isArray(PKG.files) && PKG.files.length > 0);
  for (const f of PKG.files) assert.equal(isExcluded(f), false, 'files entry ' + f + ' sits under an excluded prefix');
  for (const f of PKG.files) assert.ok(!/^(?:state|organism|docs)(?:\/|$)/.test(f) && !f.startsWith('bench/verdicts') && !f.startsWith('bench/fixtures') && !f.startsWith('web/dist'), f);
  assert.equal(PKG.engines.node, '>=24');
  assert.equal(PKG.dependencies, undefined);
  assert.equal(PKG.devDependencies, undefined);
  assert.equal(PKG.bin.brain, 'bin/brain.mjs');
  assert.ok(PKG.files.includes('bin/') || PKG.files.includes('bin/brain.mjs'));
  assert.equal(PKG.license, undefined, 'no license field: LICENSE is proprietary and npm ships it by name');
});

test('bin/brain.mjs --version prints the package.json version and exits 0; --help is the help command', () => {
  const env = { ...process.env, NO_COLOR: '1', BRAIN_STATE_DIR: path.join(TMP, 'state-cli') };
  const v = spawnSync(process.execPath, [path.join(ROOT, 'bin', 'brain.mjs'), '--version'], { cwd: ROOT, env, encoding: 'utf8', timeout: 30_000 });
  assert.equal(v.status, 0, v.stderr);
  assert.equal(v.stdout.trim(), PKG.version);
  const h = spawnSync(process.execPath, [path.join(ROOT, 'bin', 'brain.mjs'), '--help', '--no-color'], { cwd: ROOT, env, encoding: 'utf8', timeout: 30_000 });
  const hc = spawnSync(process.execPath, [path.join(ROOT, 'bin', 'brain.mjs'), 'help', '--no-color'], { cwd: ROOT, env, encoding: 'utf8', timeout: 30_000 });
  assert.equal(h.status, 0, h.stderr);
  assert.equal(hc.status, 0, hc.stderr);
  assert.equal(h.stdout, hc.stdout, '--help prints exactly what help prints');
  assert.match(h.stdout.split('\n')[0], /^BRAIN/);
});

test('unprinted numbers: a quoted number missing from stdout is caught, a printed one is not', () => {
  const stdout = 'pack: brain-0.1.0.tgz 1717617 bytes, 236 entries\ninstalled --version: "0.1.0" exit 0\nwrote x  answered 4/5\n';
  assert.deepEqual(unprintedNumbers('236 files (1717617 bytes), version "0.1.0", answered 4 of 5.', stdout), []);
  assert.deepEqual(unprintedNumbers('the store (388459374 bytes) and the programs (139749 bytes)', stdout), ['388459374', '139749']);
  assert.deepEqual(unprintedNumbers('1717 bytes', stdout), ['1717'], 'a prefix of a printed number is not printed');
  assert.deepEqual(unprintedNumbers('version 0.1', stdout), ['0.1'], 'a prefix of a printed version is not printed');
  assert.deepEqual(unprintedNumbers('no numbers here', stdout), []);
});

test('the bar: one run writes a verdict of the stated shape, and barMet is the stated formula', { timeout: 120_000 }, () => {
  const scratch = path.join(TMP, 'bar');
  mkdirSync(scratch, { recursive: true });
  const out = path.join(scratch, 'install.json');
  const r = spawnSync(process.execPath, [
    path.join(ROOT, 'tools', 'budget.mjs'), '--ram-mb', '4000', '--disk-mb', '600', '--dir', scratch, '--no-record', '--',
    process.execPath, '--max-old-space-size=4000', path.join(ROOT, 'bench', 'install.mjs'), '--scratch', scratch, '--out', out, '--no-control',
  ], { cwd: ROOT, encoding: 'utf8', timeout: 110_000, env: { ...process.env, NO_COLOR: '1' } });
  assert.ok(existsSync(out), 'no verdict written; exit ' + r.status + '\n' + (r.stdout || '').slice(-1500) + (r.stderr || '').slice(-800));
  const v = JSON.parse(readFileSync(out, 'utf8'));
  assert.ok(!Number.isNaN(Date.parse(v.at)) && /Z$/.test(v.at), 'at is ISO');
  assert.equal(v.command, 'node bench/install.mjs');
  assert.equal(v.node, process.version);
  assert.equal(typeof v.npm, 'string');
  assert.match(v.npm, /^\d+\.\d+\.\d+/, 'npm ships with Node 24 and printed its version');
  assert.equal(v.isTheBar, true);
  assert.equal(typeof v.barMet, 'boolean');
  assert.equal(v.split.heldOut, 'none');
  assert.equal(v.split.contaminated, false);
  assert.equal(typeof v.split.why, 'string');
  assert.ok(typeof v.statement === 'string' && v.statement.length > 200);
  assert.ok(!v.statement.includes(String.fromCharCode(0x2014)), 'no em-dash in the statement');
  for (const k of ['tarballBytes', 'files', 'reached']) assert.ok(Number.isInteger(v[k]) && v[k] > 0, k);
  assert.ok(Array.isArray(v.missingImports) && Array.isArray(v.excludedPresent));
  assert.equal(v.versionExpected, PKG.version);
  assert.equal(typeof v.version, 'string');
  assert.equal(v.prompts.length, PROMPTS.length);
  v.prompts.forEach((p, i) => {
    assert.equal(p.prompt, PROMPTS[i]);
    assert.equal(typeof p.answered, 'boolean');
    assert.ok(p.route === null || typeof p.route === 'string');
    assert.equal(typeof p.firstLine, 'string');
    assert.equal(p.llm === null || p.llm === 'null', true, 'provider null on every installed ask');
  });
  assert.deepEqual(v.claimedBare, v.prompts.filter((p) => p.answered).map((p) => p.prompt), 'claimed bare = the prompts that answered, never a prediction');
  assert.equal(v.control, null, '--no-control skips the tree arm');
  assert.equal(v.install.emptyBefore, true, 'the install ran in an empty directory');
  const hey = v.prompts.find((p) => p.prompt === 'hey');
  assert.equal(v.barMet, v.missingImports.length === 0 && v.excludedPresent.length === 0 && v.version === v.versionExpected && hey.answered === true);
  assert.equal(r.status, v.barMet ? 0 : 1, 'the exit code follows barMet');
  assert.deepEqual(unprintedNumbers(v.statement, r.stdout), [], 'every number the statement quotes was printed by the bar');
});

test('the bar with its control arm: the control row and every number the statement quotes about it are printed', { timeout: 120_000 }, () => {
  const scratch = path.join(TMP, 'bar-control');
  mkdirSync(scratch, { recursive: true });
  const out = path.join(scratch, 'install.json');
  const r = runBar(scratch, out, []);
  assert.ok(existsSync(out), 'no verdict written; exit ' + r.status + '\n' + (r.stdout || '').slice(-1500) + (r.stderr || '').slice(-800));
  const v = JSON.parse(readFileSync(out, 'utf8'));
  assert.ok(v.control && typeof v.control === 'object', 'the control arm ran');
  assert.equal(v.control.rows.length, PROMPTS.length);
  assert.equal(v.control.answered, v.control.rows.filter((row) => row.answered).length);
  for (const k of ['knowledgeStoreBytes', 'keptProgramsBytes']) assert.ok(Number.isInteger(v.control[k]) && v.control[k] >= 0, k);
  assert.deepEqual(v.control.restsOnUnshippedData, v.control.rows.filter((row, i) => row.answered && !v.prompts[i].answered).map((row) => row.prompt));
  assert.match(v.statement, /The control, the same prompts through the tree itself/, 'the statement carries the control clause');
  assert.ok(r.stdout.includes('control (tree): answered ' + v.control.answered + ' of ' + v.control.rows.length
    + ', knowledge store ' + v.control.knowledgeStoreBytes + ' bytes, kept programs ' + v.control.keptProgramsBytes + ' bytes'), 'the control summary line is printed');
  assert.deepEqual(unprintedNumbers(v.statement, r.stdout), [], 'every number the statement quotes was printed by the bar');
  assert.equal(r.status, v.barMet ? 0 : 1, 'the exit code follows barMet');
});
