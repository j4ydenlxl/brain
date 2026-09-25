// test/cloud-host.test.mjs: the P13 host item (board 16). What the tests hold:
//   1. .github/workflows/cloud.yml, line by line: triggers, inputs, permissions, concurrency, the
//      STOP check before the build, the cache key, every named file, no secret literal, no em-dash,
//      and compose.yaml's organism environment carried into the docker run (a drift guard)
//   2. tools/cloud-github.mjs --dry on a planted repository, with and without an origin, with gh
//      logged in and logged out; the refusal (exit 2, "run: gh auth login") without --dry; no gh
//      call that writes is ever made; a planted secret is refused (the scan's control)
//   3. bench/cloud-host.mjs: "not measured: <cause>" on every host row when gh is logged out and
//      when the run list is empty; a planted passing artifact meets the bar and planted failing
//      ones do not (the bar function's control, through the download path)
//   4. the trial's process hygiene: a wait leaves no timer behind; copies a dead run left are swept
//      and a live run's are kept; a trial process that dies is recorded with its exit code, what
//      it left running is killed, its copy is deleted, and it is tried once more
// node --test test/cloud-host.test.mjs    (no network: gh is a planted script first on PATH; git
// runs only inside temp directories; the real tree is only read)
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, copyFileSync, readdirSync, chmodSync, utimesSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseYaml, checkWorkflow, namedFiles, workflowReport, barOf, resolveGh, plan, WORKFLOW_REL } from '../tools/cloud-github.mjs';
import { measureHost, ticksPerHourOf, untar, composeEnv, control, missingFrom, HOST_ROWS, within, sweepStale, pidAlive, checkoutTrial, TRIAL_PREFIX } from '../bench/cloud-host.mjs';
import { scanSecrets } from '../tools/deploy-host.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WF = path.join(ROOT, WORKFLOW_REL);
const TOOL = path.join(ROOT, 'tools', 'cloud-github.mjs');
const RULER = path.join(ROOT, 'bench', 'cloud-host.mjs');
const EM = String.fromCharCode(0x2014);
const temps = [];
const tmp = (tag) => { const d = mkdtempSync(path.join(os.tmpdir(), 'brain-cloud-host-test-' + tag + '-')); temps.push(d); return d; };
test.after(() => { for (const d of temps) rmSync(d, { recursive: true, force: true, maxRetries: 5 }); });

// ---------------------------------------------------------------- the planted gh
const MOCK = `
import { appendFileSync, readFileSync, existsSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs';
import path from 'node:path';
const dir = process.env.GH_MOCK_DIR;
const a = process.argv.slice(2);
appendFileSync(path.join(dir, 'calls.log'), JSON.stringify(a) + '\\n');
const mode = existsSync(path.join(dir, 'mode')) ? readFileSync(path.join(dir, 'mode'), 'utf8').trim() : 'out';
const is = (...w) => w.every((x, i) => a[i] === x);
if (is('--version')) { console.log('gh version 0.0.0-mock'); process.exit(0); }
if (is('auth', 'status')) {
  if (mode === 'in') { console.log('github.com: Logged in to github.com account planted'); process.exit(0); }
  console.error('You are not logged into any GitHub hosts. To log in, run: gh auth login'); process.exit(1);
}
if (mode !== 'in') { console.error('To get started with GitHub CLI, please run:  gh auth login'); process.exit(4); }
if (is('repo', 'view')) { console.log(JSON.stringify({ nameWithOwner: 'planted/brain', visibility: 'PRIVATE' })); process.exit(0); }
if (is('run', 'list') && existsSync(path.join(dir, 'runlist.err'))) { console.error(readFileSync(path.join(dir, 'runlist.err'), 'utf8')); process.exit(1); }
if (is('run', 'list')) { const f = path.join(dir, 'runs.json'); console.log(existsSync(f) ? readFileSync(f, 'utf8') : '[]'); process.exit(0); }
if (is('run', 'download')) {
  const id = a[2], d = a[a.indexOf('-D') + 1], src = path.join(dir, 'artifacts', id);
  if (!existsSync(src)) { console.error('no valid artifacts found to download'); process.exit(1); }
  mkdirSync(d, { recursive: true });
  for (const f of readdirSync(src)) copyFileSync(path.join(src, f), path.join(d, f));
  process.exit(0);
}
console.error('the planted gh refuses: ' + a.join(' ')); process.exit(9);
`;

/** A directory holding gh (gh.cmd on Windows) that runs the mock, and the env that puts it first on PATH. */
function plantGh(mode) {
  const bin = tmp('ghbin'), dir = tmp('ghdir');
  writeFileSync(path.join(bin, 'gh-mock.mjs'), MOCK);
  if (process.platform === 'win32') writeFileSync(path.join(bin, 'gh.cmd'), '@"' + process.execPath + '" "%~dp0gh-mock.mjs" %*\r\n');
  else { writeFileSync(path.join(bin, 'gh'), '#!/bin/sh\nexec "' + process.execPath + '" "$(dirname "$0")/gh-mock.mjs" "$@"\n'); chmodSync(path.join(bin, 'gh'), 0o755); }
  writeFileSync(path.join(dir, 'mode'), mode);
  const env = {};
  for (const [k, v] of Object.entries(process.env)) if (k.toLowerCase() !== 'path') env[k] = v;
  env.PATH = bin + path.delimiter + (process.env.PATH || process.env.Path || '');
  env.GH_MOCK_DIR = dir;
  return { bin, dir, env, calls: () => (existsSync(path.join(dir, 'calls.log')) ? readFileSync(path.join(dir, 'calls.log'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []) };
}

const WRITE_CALL = (c) => (c[0] === 'repo' && c[1] === 'create') || c[0] === 'workflow' || c[0] === 'secret' || c[0] === 'variable' || (c[0] === 'run' && ['rerun', 'cancel', 'delete'].includes(c[1]));

/** A planted git repository holding the workflow and a README, committed; an origin when asked. */
function plantRepo({ origin = false, extra = {} } = {}) {
  const d = tmp('repo');
  const g = (...args) => { const r = spawnSync('git', ['-C', d, ...args], { encoding: 'utf8' }); assert.equal(r.status, 0, 'git ' + args.join(' ') + ': ' + r.stderr); return r.stdout; };
  g('init', '-q', '-b', 'main');
  mkdirSync(path.join(d, '.github', 'workflows'), { recursive: true });
  copyFileSync(WF, path.join(d, WORKFLOW_REL));
  writeFileSync(path.join(d, 'README.md'), 'planted\n');
  for (const [rel, text] of Object.entries(extra)) { mkdirSync(path.dirname(path.join(d, rel)), { recursive: true }); writeFileSync(path.join(d, rel), text); }
  g('add', '-A');
  g('-c', 'user.name=planted', '-c', 'user.email=planted@example.invalid', 'commit', '-q', '-m', 'planted');
  if (origin) g('remote', 'add', 'origin', 'https://example.invalid/planted/brain.git');
  return d;
}
const tool = (args, env) => spawnSync(process.execPath, [TOOL, ...args], { encoding: 'utf8', env, timeout: 90_000 });

// ---------------------------------------------------------------- 1. the workflow, line by line
test('cloud.yml parses and passes every structural check the docs claim', () => {
  const text = readFileSync(WF, 'utf8');
  const doc = parseYaml(text);
  const rows = checkWorkflow(doc, text);
  assert.ok(rows.length >= 25, 'rows ' + rows.length);
  for (const r of rows) assert.ok(r.ok, r.check + ' (' + r.detail + ')');
  const lines = text.split(/\r?\n/);
  const has = (re) => lines.some((l) => re.test(l));
  assert.ok(has(/^name: brain cloud$/));
  assert.ok(has(/^\s+- cron: "0 8 \* \* \*"$/));
  assert.ok(has(/^\s+workflow_dispatch:$/));
  assert.deepEqual(Object.keys(doc.on.workflow_dispatch.inputs).sort(), ['ladder', 'relay', 'wallMinutes']);
  assert.equal(doc.on.workflow_dispatch.inputs.wallMinutes.default, '55');
  assert.equal(doc.on.workflow_dispatch.inputs.relay.default, 'false');
  assert.deepEqual(doc.permissions, { contents: 'read', actions: 'write' });
  assert.deepEqual(doc.concurrency, { group: 'brain-cloud', 'cancel-in-progress': false });
  assert.equal(doc.jobs.organism['timeout-minutes'], 350);
  assert.equal(doc.jobs.organism['runs-on'], 'ubuntu-latest');
  const steps = doc.jobs.organism.steps;
  const at = (re) => steps.findIndex((s) => re.test(String(s.name || '') + ' ' + String(s.uses || '') + ' ' + String(s.run || '')));
  assert.ok(at(/state-cloud\/STOP/) < at(/docker build/), 'STOP before the build');
  assert.ok(at(/actions\/cache\/restore@/) < at(/docker build/), 'restore before the build');
  assert.ok(at(/docker stop --time 60 brain/) < at(/--name brain-ladder/), 'the ladder runs after the organism stops');
  assert.ok(at(/actions\/cache\/save@/) > at(/docker stop --time 60 brain/), 'save after the stop');
  assert.equal(steps[steps.length - 1].env.GH_TOKEN, '${{ github.token }}');
  // no inbound port: only 127.0.0.1 is published on the runner
  const published = [...text.matchAll(/\s-p\s+(\S+:\S+)/g)].map((m) => m[1]);
  assert.ok(published.length >= 1, 'a port is published for the health poll');
  for (const p of published) assert.match(p, /^127\.0\.0\.1:/);
});

test('every file cloud.yml names exists in the tree', () => {
  const r = workflowReport(ROOT);
  assert.equal(r.parses, true, r.error);
  assert.ok(r.named.length >= 8, r.named.join(', '));
  assert.deepEqual(r.missing, []);
  assert.deepEqual(namedFiles('run: node bench/verdicts/x.json && node tools/budget.mjs'), ['tools/budget.mjs']);
});

test('no secret literal and no em-dash in any file of this item', () => {
  const mine = [WORKFLOW_REL, 'tools/cloud-github.mjs', 'bench/cloud-host.mjs', 'test/cloud-host.test.mjs', 'notes/cloud-host.md', '.dockerignore'].filter((f) => existsSync(path.join(ROOT, f)));
  const scan = scanSecrets(mine.map((rel) => ({ rel, bytes: readFileSync(path.join(ROOT, rel)).length })), ROOT);
  assert.equal(scan.scanned, mine.length);
  assert.deepEqual(scan.hits, []);
  for (const f of mine) assert.ok(!readFileSync(path.join(ROOT, f), 'utf8').includes(EM), 'em-dash in ' + f);
  const text = readFileSync(WF, 'utf8');
  // secrets only as ${{ secrets.NAME }} references, outside comments
  const code = text.split(/\r?\n/).filter((l) => !/^\s*#/.test(l)).join('\n');
  for (const m of code.match(/secrets\.[A-Z_]+/g) || []) assert.ok(code.includes('${{ ' + m + ' }}'), m);
  // the control: the scan sees a secret built at run time, so an empty hit list means something
  const d = tmp('scan');
  writeFileSync(path.join(d, 'x.yml'), 'token: ' + 'gh' + 'p_' + 'Q'.repeat(36) + '\n');
  assert.equal(scanSecrets([{ rel: 'x.yml', bytes: 50 }], d).hits.length, 1);
});

test('the docker run carries every variable of compose.yaml x-organism-env (drift guard)', () => {
  const text = readFileSync(WF, 'utf8');
  const env = composeEnv(readFileSync(path.join(ROOT, 'compose.yaml'), 'utf8'));
  assert.ok(Object.keys(env).length >= 10);
  const missing = Object.keys(env).filter((k) => k !== 'BRAIN_EPISODES_MAX' && !text.includes('-e ' + k + '='));
  assert.deepEqual(missing, []);
  assert.match(text, /BRAIN_EPISODES_MAX/);
  assert.match(text, /-e BRAIN_LADDER=off/);
  // .dockerignore keeps the restored checkpoint out of the image
  assert.ok(readFileSync(path.join(ROOT, '.dockerignore'), 'utf8').split(/\r?\n/).includes('state-cloud'));
});

// ---------------------------------------------------------------- 2. the deploy
test('the planted gh is the one resolved, and it answers logged in or not', () => {
  const g = plantGh('in');
  assert.equal(path.dirname(resolveGh(g.env)), g.bin);
});

test('--dry, logged in, no origin: exit 0, the private create is planned, nothing written', () => {
  const g = plantGh('in');
  const repo = plantRepo();
  const r = tool(['--dry', '--root', repo], g.env);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /gh repo create brain --private --source \. --push/);
  assert.match(r.stdout, /gh workflow enable cloud\.yml/);
  assert.match(r.stdout, /gh workflow run cloud\.yml -f wallMinutes=55 -f relay=false/);
  assert.match(r.stdout, /committed at HEAD: true/);
  assert.match(r.stdout, /tracked files/);
  assert.doesNotMatch(r.stdout, /gh repo create brain --public/);
  assert.deepEqual(g.calls().filter(WRITE_CALL), []);
  assert.ok(g.calls().some((c) => c[0] === 'auth' && c[1] === 'status'));
});

test('--dry, logged in, with an origin: a push is planned, the visibility read, nothing written', () => {
  const g = plantGh('in');
  const repo = plantRepo({ origin: true });
  const r = tool(['--dry', '--root', repo], g.env);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /git push origin HEAD/);
  assert.match(r.stdout, /planted\/brain is PRIVATE/);
  assert.doesNotMatch(r.stdout, /gh repo create/);
  assert.deepEqual(g.calls().filter(WRITE_CALL), []);
});

test('--dry, logged out: exit 2 with "run: gh auth login", never claims a login', () => {
  const g = plantGh('out');
  for (const origin of [false, true]) {
    const repo = plantRepo({ origin });
    const r = tool(['--dry', '--root', repo], g.env);
    assert.equal(r.status, 2, r.stdout + r.stderr);
    assert.match(r.stdout, /^run: gh auth login$/m);
    assert.match(r.stdout, /NOT LOGGED IN/);
    assert.doesNotMatch(r.stdout, /gh auth status: logged in/);
  }
  assert.deepEqual(g.calls().filter(WRITE_CALL), []);
});

test('without --dry and without a login the deploy refuses: exit 2, gh asked only who is logged in', () => {
  const g = plantGh('out');
  const repo = plantRepo();
  const r = tool(['--root', repo], g.env);
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stdout, /^run: gh auth login$/m);
  assert.match(r.stdout, /nothing written/);
  const calls = g.calls();
  assert.ok(calls.length > 0);
  for (const c of calls) assert.ok((c[0] === '--version') || (c[0] === 'auth' && c[1] === 'status'), JSON.stringify(c));
});

test('refusals: --public without --yes, a relay on private without --yes, an uncommitted workflow, a planted secret', () => {
  const g = plantGh('in');
  const repo = plantRepo();
  const pub = tool(['--dry', '--root', repo, '--public'], g.env);
  assert.equal(pub.status, 2);
  assert.match(pub.stdout, /Make sure nobody can copy our ideas/);
  assert.match(pub.stdout, /REFUSED: --public needs --yes/);
  const pubYes = tool(['--dry', '--root', repo, '--public', '--yes'], g.env);
  assert.equal(pubYes.status, 0, pubYes.stdout);
  assert.match(pubYes.stdout, /gh repo create brain --public --source \. --push/);
  const relay = tool(['--dry', '--root', repo, '--relay'], g.env);
  assert.equal(relay.status, 2);
  assert.match(relay.stdout, /last 1\.39 days/);
  assert.match(relay.stdout, /REFUSED: a relay on a private repository needs --yes/);
  const wall = tool(['--dry', '--root', repo, '--wall-minutes', '400'], g.env);
  assert.equal(wall.status, 2);
  // the workflow on disk but not committed
  const bare = tmp('bare');
  spawnSync('git', ['-C', bare, 'init', '-q', '-b', 'main']);
  writeFileSync(path.join(bare, 'README.md'), 'x\n');
  spawnSync('git', ['-C', bare, 'add', '-A']);
  spawnSync('git', ['-C', bare, '-c', 'user.name=planted', '-c', 'user.email=planted@example.invalid', 'commit', '-q', '-m', 'x']);
  const unc = tool(['--dry', '--root', bare], g.env);
  assert.equal(unc.status, 2);
  assert.match(unc.stdout, /REFUSED: commit \.github\/workflows\/cloud\.yml first/);
  // a secret committed in the tree (built at run time: no literal in this file)
  const leak = plantRepo({ extra: { 'conf/app.yml': 'token: ' + 'gh' + 'p_' + 'Z'.repeat(36) + '\n' } });
  const sec = tool(['--dry', '--root', leak], g.env);
  assert.equal(sec.status, 2);
  assert.match(sec.stdout, /REFUSED: secret github token at conf\/app\.yml:1/);
  assert.doesNotMatch(sec.stdout, /ZZZZZZZZ/);
  // a secret-looking name anywhere in the history
  const env = plantRepo({ extra: { '.env': 'A=1\n' } });
  const hist = tool(['--dry', '--root', env], g.env);
  assert.equal(hist.status, 2);
  assert.match(hist.stdout, /REFUSED: the history holds \.env/);
  assert.deepEqual(g.calls().filter(WRITE_CALL), []);
});

test('a checkout trial that failed at this HEAD refuses the deploy; one at another HEAD does not', () => {
  const g = plantGh('in');
  const repo = plantRepo();
  const head = spawnSync('git', ['-C', repo, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout.trim();
  mkdirSync(path.join(repo, 'bench', 'verdicts'), { recursive: true });
  const put = (t) => writeFileSync(path.join(repo, 'bench', 'verdicts', 'cloud-host.json'), JSON.stringify({ at: '2026-09-25T00:00:00Z', pc: { checkoutTrial: t } }));
  put({ head, source: 'git archive HEAD', built: false, restarts: 6, firstCheckpointS: null, missingFiles: ['bench/fixtures/q.json'] });
  const bad = tool(['--dry', '--root', repo], g.env);
  assert.equal(bad.status, 2, bad.stdout);
  assert.match(bad.stdout, /REFUSED: the committed tree did not boot in the checkout trial at HEAD \w+: the daemon opened bench\/fixtures\/q\.json/);
  put({ head, source: 'git archive HEAD', built: true, restarts: 0, firstCheckpointS: 30, missingFiles: [] });
  const good = tool(['--dry', '--root', repo], g.env);
  assert.equal(good.status, 0, good.stdout);
  assert.match(good.stdout, /checkout trial at HEAD \w+ .*built true/);
  put({ head: '0000000', source: 'git archive HEAD', built: false, restarts: 6, missingFiles: [] });
  const other = tool(['--dry', '--root', repo], g.env);
  assert.equal(other.status, 0, other.stdout);
  assert.match(other.stdout, /checkout trial at HEAD \w+: not run/);
  // a counterfactual trial (HEAD plus overlay files) is never read as the tree's own
  put({ head, source: 'git archive HEAD plus 1 file(s) from the working tree', built: true, restarts: 0, missingFiles: [] });
  assert.match(tool(['--dry', '--root', repo], g.env).stdout, /checkout trial at HEAD \w+: not run/);
  assert.deepEqual(g.calls().filter(WRITE_CALL), []);
});

test('a boot file a checkout trial at any HEAD named is refused until the commit holds it (git add -f named)', () => {
  const g = plantGh('in');
  const put = (repo, t) => { mkdirSync(path.join(repo, 'bench', 'verdicts'), { recursive: true }); writeFileSync(path.join(repo, 'bench', 'verdicts', 'cloud-host.json'), JSON.stringify({ at: '2026-09-25T00:00:00Z', pc: { checkoutTrial: t } })); };
  const trial = { head: '0000000', source: 'git archive HEAD', built: false, restarts: 6, missingFiles: ['bench/fixtures/q.json'] };
  const lacking = plantRepo();
  put(lacking, trial);
  const bad = tool(['--dry', '--root', lacking], g.env);
  assert.equal(bad.status, 2, bad.stdout);
  assert.match(bad.stdout, /boot file bench\/fixtures\/q\.json .*committed at HEAD false/);
  assert.match(bad.stdout, /REFUSED: commit bench\/fixtures\/q\.json first \(git add -f bench\/fixtures\/q\.json, then git commit\)/);
  // the control: the same verdict over a commit that holds the file
  const holding = plantRepo({ extra: { 'bench/fixtures/q.json': '{}' } });
  put(holding, trial);
  const good = tool(['--dry', '--root', holding], g.env);
  assert.equal(good.status, 0, good.stdout);
  assert.match(good.stdout, /boot file bench\/fixtures\/q\.json .*committed at HEAD true/);
  // a counterfactual trial's list is never read as the tree's own
  put(lacking, { ...trial, source: 'git archive HEAD plus 1 file(s) from the working tree' });
  assert.equal(tool(['--dry', '--root', lacking], g.env).status, 0);
  assert.deepEqual(g.calls().filter(WRITE_CALL), []);
});

test('a root inside a repository but not its top is refused (a push would send the outer repository)', () => {
  const g = plantGh('in');
  const repo = plantRepo({ extra: { 'inner/x.md': 'x\n' } });
  const p = plan({ root: path.join(repo, 'inner'), wallMinutes: 55 }, g.env);
  assert.ok(p.refusals.some((r) => /not its top/.test(r)), p.refusals.join(' | '));
});

// ---------------------------------------------------------------- 3. the ruler
test('the ruler prints "not measured" on every host row when gh is logged out', () => {
  const g = plantGh('out');
  const repo = plantRepo({ origin: true });
  const h = measureHost({ root: repo, env: g.env });
  assert.equal(h.cause, 'gh not logged in');
  assert.deepEqual(Object.keys(h.rows).sort(), [...HOST_ROWS].sort());
  for (const k of HOST_ROWS) { assert.equal(h.rows[k].measured, false, k); assert.equal(h.rows[k].cause, 'gh not logged in'); }
});

test('the ruler prints "not measured" when no origin exists and when the run list is empty', () => {
  const g = plantGh('in');
  const noOrigin = measureHost({ root: plantRepo(), env: g.env });
  assert.match(noOrigin.cause, /no origin remote/);
  const repo = plantRepo({ origin: true });
  const h = measureHost({ root: repo, env: g.env });
  assert.equal(h.cause, 'no run of cloud.yml yet');
  assert.equal(h.rows.gh.measured, true);
  assert.equal(h.rows.repository.nameWithOwner, 'planted/brain');
  for (const k of HOST_ROWS.filter((x) => x !== 'gh' && x !== 'repository')) { assert.equal(h.rows[k].measured, false, k); assert.equal(h.rows[k].cause, 'no run of cloud.yml yet'); }
  assert.ok(g.calls().some((c) => c[0] === 'run' && c[1] === 'list'));
  // runs that are all older than the window
  writeFileSync(path.join(g.dir, 'runs.json'), JSON.stringify([{ databaseId: 5, number: 1, event: 'schedule', status: 'completed', conclusion: 'success', createdAt: '2020-01-01T08:00:00Z', startedAt: '2020-01-01T08:00:05Z', updatedAt: '2020-01-01T09:00:00Z', url: 'u' }]));
  const old = measureHost({ root: repo, env: g.env });
  assert.match(old.cause, /no run of cloud\.yml in the last 7 days \(1 older\)/);
  // the repository exists but the workflow was never pushed to its default branch (read on this machine 2026-09-25)
  writeFileSync(path.join(g.dir, 'runlist.err'), 'HTTP 404: workflow cloud.yml not found on the default branch (https://api.github.com/repos/planted/brain/actions/workflows/cloud.yml)');
  const nf = measureHost({ root: repo, env: g.env });
  assert.equal(nf.cause, 'cloud.yml is not on the default branch of planted/brain yet');
  assert.equal(nf.rows.runs.measured, false);
  const other = 'HTTP 500: planted';
  writeFileSync(path.join(g.dir, 'runlist.err'), other);
  assert.equal(measureHost({ root: repo, env: g.env }).cause, 'gh run list failed: ' + other);
});

test('the checkout trial names the files the daemon opened and the tree lacks', () => {
  const tree = path.join(os.tmpdir(), 'x-tree');
  const line = "[serve child] live failed: ENOENT: no such file or directory, open '" + path.join(tree, 'bench', 'fixtures', 'q.json') + "'";
  assert.deepEqual(missingFrom([line, line, 'unrelated', "ENOENT: no such file or directory, open '" + path.join(os.tmpdir(), 'elsewhere.json') + "'"], tree), ['bench/fixtures/q.json']);
});

function plantArtifact(g, id, { health, container = { restartCount: 0 }, ladder = true, ticks = [0, 600] }) {
  const d = path.join(g.dir, 'artifacts', String(id));
  mkdirSync(d, { recursive: true });
  writeFileSync(path.join(d, 'health.json'), JSON.stringify(health));
  writeFileSync(path.join(d, 'container.json'), JSON.stringify(container));
  writeFileSync(path.join(d, 'health.log'), ticks.map((t, i) => JSON.stringify({ at: 'x', epoch: 1000 + i * 60, health: { tick: t } })).join('\n') + '\n');
  if (ladder) writeFileSync(path.join(d, 'ladder.log'), 'some line\nLADDER 2026-09-26: composite 0.500000, planted\n');
}

test('a planted passing artifact meets the bar through the download path; planted failures do not', () => {
  const now = Date.parse('2026-09-26T12:00:00Z');
  const run = (id, event = 'schedule', conclusion = 'success') => ({ databaseId: id, number: id, event, status: 'completed', conclusion, createdAt: '2026-09-26T08:00:00Z', startedAt: '2026-09-26T08:00:10Z', updatedAt: '2026-09-26T09:00:10Z', url: 'https://example.invalid/run/' + id });
  const ok = { ok: true, uptimeS: 3000, restarts: 0, budgetKills: 0, tick: 600, checkpoint: { tick: 600, ageS: 4, bytes: 123456 } };
  const cases = [
    ['pass', ok, {}, true],
    ['restarts 1', { ...ok, restarts: 1 }, {}, false],
    ['container restart 1', ok, { container: { restartCount: 1 } }, false],
    ['checkpoint age 200', { ...ok, checkpoint: { ...ok.checkpoint, ageS: 200 } }, {}, false],
    ['no ladder line', ok, { ladder: false }, false],
    ['health not ok', { ...ok, ok: false }, {}, false],
    ['conclusion failure', ok, { conclusion: 'failure' }, false],
    ['a push event', ok, { event: 'push' }, false],
  ];
  for (const [label, health, opt, want] of cases) {
    const g = plantGh('in');
    const repo = plantRepo({ origin: true });
    writeFileSync(path.join(g.dir, 'runs.json'), JSON.stringify([run(7, opt.event, opt.conclusion)]));
    plantArtifact(g, 7, { health, container: opt.container, ladder: opt.ladder !== false });
    const h = measureHost({ root: repo, env: g.env, now });
    assert.equal(h.cause, null, label);
    assert.equal(h.readings.length, 1, label);
    assert.equal(barOf(h.readings).met, want, label + ': ' + barOf(h.readings).why);
    if (label === 'pass') {
      assert.equal(h.rows.runs.value, 1);
      assert.deepEqual(h.rows.conclusions.value, { success: 1 });
      assert.equal(h.rows.uptimeFraction.value, Math.round(3000 / 60 / 10080 * 1e4) / 1e4);
      assert.equal(h.rows.actionsMinutes.value, 60);
      assert.equal(h.rows.ticksPerHour.value, 36000);
      assert.equal(h.rows.checkpointAgeS.value, 4);
      assert.equal(h.rows.checkpointBytes.value, 123456);
      assert.equal(h.rows.restartsInJob.value, 0);
      assert.match(h.rows.ladderLine.value, /^LADDER 2026-09-26:/);
      assert.ok(g.calls().some((c) => c[0] === 'run' && c[1] === 'download' && c.includes('brain-cloud')));
    }
    assert.deepEqual(g.calls().filter(WRITE_CALL), []);
  }
  // a missing artifact is named, not guessed
  const g = plantGh('in');
  writeFileSync(path.join(g.dir, 'runs.json'), JSON.stringify([run(9)]));
  const h = measureHost({ root: plantRepo({ origin: true }), env: g.env, now });
  assert.equal(h.readings.length, 0);
  assert.equal(h.rows.healthOk.measured, false);
  assert.match(h.rows.healthOk.cause, /no artifact could be downloaded/);
  assert.equal(h.rows.ladderLine.measured, false);
});

test('the bar function control holds: true on the planted pass, false on every planted failure', () => {
  const c = control();
  assert.equal(c.pass, true);
  assert.equal(c.holds, true);
  for (const [k, v] of Object.entries(c)) if (k !== 'pass' && k !== 'holds') assert.equal(v, false, k);
  assert.equal(ticksPerHourOf(''), null);
  assert.equal(ticksPerHourOf('{"epoch":0,"health":{"tick":0}}\n{"epoch":3600,"health":{"tick":90}}\n'), 90);
});

test('the ruler as a command writes a verdict with barMet false and the split when gh is logged out', () => {
  const g = plantGh('out');
  const repo = plantRepo({ origin: true });
  const out = path.join(tmp('verdict'), 'cloud-host.json');
  const r = spawnSync(process.execPath, [RULER, '--root', repo, '--out', out], { encoding: 'utf8', env: g.env, timeout: 90_000 });
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout, /^HOST runs: not measured: gh not logged in$/m);
  assert.match(r.stdout, /^CLOUD-HOST barMet false/m);
  const v = JSON.parse(readFileSync(out, 'utf8'));
  assert.equal(v.isTheBar, true);
  assert.equal(v.barMet, false);
  assert.deepEqual(Object.keys(v.split).sort(), ['development', 'heldOut', 'measuredFromHost', 'measuredOnThisPc']);
  assert.match(v.statement, /not measured/);
  assert.match(v.hisStep, /gh auth login/);
  assert.equal(v.control.holds, true);
  assert.ok(!readFileSync(out, 'utf8').includes(EM));
});

test('the checkout trial extracts a git archive exactly (the tar reader)', () => {
  const repo = plantRepo({ extra: { 'a/b/c.txt': 'hello\n', ['long/' + 'x'.repeat(120) + '.txt']: 'long name\n' } });
  const a = spawnSync('git', ['-C', repo, 'archive', '--format=tar', 'HEAD'], { maxBuffer: 64 * 1048576 });
  assert.equal(a.status, 0);
  const d = tmp('untar');
  const x = untar(a.stdout, d);
  assert.equal(x.files, 4);
  // git on Windows converts line ends on archive (core.autocrlf); the runner's checkout is LF
  const lf = (f) => readFileSync(f, 'utf8').replace(/\r\n/g, '\n');
  assert.equal(lf(path.join(d, 'a', 'b', 'c.txt')), 'hello\n');
  assert.equal(lf(path.join(d, 'long', 'x'.repeat(120) + '.txt')), 'long name\n');
  assert.equal(parseYaml(readFileSync(path.join(d, WORKFLOW_REL), 'utf8')).name, 'brain cloud');
  assert.ok(!existsSync(path.join(d, '.git')));
  assert.ok(readdirSync(d).length >= 3);
  // an entry that escapes the destination is refused
  const evil = Buffer.alloc(1024);
  evil.write('../escape.txt', 0); evil.write('0000644', 100); evil.write('00000000000', 124); evil.write('0', 156);
  assert.throws(() => untar(evil, d), /escapes/);
});

// ---------------------------------------------------------------- 4. the trial's process hygiene
const timers = () => process.getActiveResourcesInfo().filter((r) => r === 'Timeout').length;

test('within() clears its timer whichever side wins, so no handle outlives the wait', async () => {
  const before = timers();
  assert.equal(await within(Promise.resolve(1), 60_000), 'done');
  assert.equal(timers(), before, 'a 60 s timer left behind after the promise won');
  assert.equal(await within(new Promise(() => {}), 20), 'timeout');
  assert.equal(timers(), before);
});

test('sweepStale deletes copies a dead run left and keeps a live run\'s', () => {
  const dir = tmp('sweep');
  const dead = spawnSync(process.execPath, ['-e', 'console.log(process.pid)'], { encoding: 'utf8' });
  const deadPid = Number(dead.stdout.trim());
  assert.equal(pidAlive(deadPid), false);
  const copy = (name, owner, old) => {
    const d = path.join(dir, TRIAL_PREFIX + name);
    mkdirSync(path.join(d, 'tree'), { recursive: true });
    writeFileSync(path.join(d, 'tree', 'f.txt'), 'x'.repeat(1000));
    if (owner) writeFileSync(path.join(d, 'owner.json'), JSON.stringify({ pid: owner }));
    if (old) { const t = new Date(Date.now() - 3600_000); utimesSync(d, t, t); }
    return d;
  };
  const a = copy('dead', deadPid, false), b = copy('live', process.pid, true), c = copy('legacy-old', null, true), d = copy('legacy-new', null, false);
  writeFileSync(path.join(dir, 'unrelated.txt'), 'kept');
  const r = sweepStale({ dir });
  assert.equal(r.found, 4);
  assert.equal(r.swept, 2);
  assert.equal(r.kept, 2);
  assert.ok(r.bytes >= 2000, 'bytes ' + r.bytes);
  assert.deepEqual(r.failed, []);
  assert.equal(existsSync(a), false);
  assert.equal(existsSync(c), false);
  assert.equal(existsSync(b), true);
  assert.equal(existsSync(d), true);
  assert.equal(existsSync(path.join(dir, 'unrelated.txt')), true);
});

// a stand-in trial process that leaves a long-lived process in its copy (as serve would) and dies
const DYING = [
  "import { spawn } from 'node:child_process';",
  "import { readFileSync, writeFileSync } from 'node:fs';",
  "import path from 'node:path';",
  "const p = JSON.parse(readFileSync(process.argv[3], 'utf8'));",
  "const c = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { cwd: p.tmp, detached: true, stdio: 'ignore' });",
  "c.unref();",
  "writeFileSync(path.join(p.tmp, 'pids.json'), JSON.stringify({ worker: process.pid, serve: c.pid }));",
  "setTimeout(() => process.exit(3), 300);",
].join('\n');
const FINE = [
  "import { readFileSync, writeFileSync } from 'node:fs';",
  "import path from 'node:path';",
  "const p = JSON.parse(readFileSync(process.argv[3], 'utf8'));",
  "writeFileSync(path.join(p.tmp, 'result.json'), JSON.stringify({ head: 'abc1234', built: true, restarts: 0, missingFiles: [], planted: p.seconds }));",
].join('\n');

test('a trial process that dies is recorded, what it left running is killed, its copy deleted, one retry', async () => {
  const w = tmp('worker');
  writeFileSync(path.join(w, 'dying.mjs'), DYING);
  const logs = [];
  const r = await checkoutTrial({ root: ROOT, seconds: 1, worker: path.join(w, 'dying.mjs'), log: (l) => logs.push(l), sweepDir: tmp('nosweep') });
  assert.equal(r.crashed, true);
  assert.equal(r.workerExit, 3);
  assert.equal(r.attempts.length, 2);
  for (const a of r.attempts) {
    assert.equal(a.crashed, true);
    assert.equal(a.deleted, true);
    assert.equal(a.killedAfter.length, 1, JSON.stringify(a));
    assert.equal(pidAlive(a.killedAfter[0]), false, 'the stand-in for serve is dead');
  }
  assert.equal(logs.filter((l) => /the trial process died with exit 3 /.test(l)).length, 2, logs.join(' | '));
  // the control: a trial process that writes its result is read once, not retried, and nothing is killed
  writeFileSync(path.join(w, 'fine.mjs'), FINE);
  const ok = await checkoutTrial({ root: ROOT, seconds: 7, worker: path.join(w, 'fine.mjs'), sweepDir: tmp('nosweep') });
  assert.equal(ok.crashed, false);
  assert.equal(ok.workerExit, 0);
  assert.equal(ok.attempts.length, 1);
  assert.deepEqual(ok.killedAfter, []);
  assert.equal(ok.built, true);
  assert.equal(ok.planted, 7);
  assert.equal(ok.deleted, true);
});

test('the ruler refuses the old --overlay and a counterfactual without its control trial', () => {
  const r1 = spawnSync(process.execPath, [RULER, '--overlay', 'x.json', '--out', path.join(tmp('o'), 'v.json')], { encoding: 'utf8', timeout: 30_000 });
  assert.equal(r1.status, 2);
  assert.match(r1.stdout, /--overlay became --counterfactual/);
  const r2 = spawnSync(process.execPath, [RULER, '--counterfactual', 'x.json', '--out', path.join(tmp('o'), 'v.json')], { encoding: 'utf8', timeout: 30_000 });
  assert.equal(r2.status, 2);
  assert.match(r2.stdout, /needs --checkout-trial S/);
});
