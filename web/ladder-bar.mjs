// web/ladder-bar.mjs: the bar for the ladder page, measured by running it, written once.
//
//   node --max-old-space-size=6000 web/ladder-bar.mjs          the bar run: bench/verdicts/web-ladder.json
//   node --max-old-space-size=6000 web/ladder-bar.mjs --dev    a development run: web-ladder-partial.json
//
// What it runs, in order, one process at a time:
//   1. node web/build.mjs, which must exit 0 and print its "pages built" line and its ladder line;
//   2. the built web/dist/ladder/index.html, walked at once by web/ladder-walk.mjs (a walker that
//      shares no code with the generator) against bench/verdicts: every number back to a field,
//      no em dash;
//   3. node --test test/web-ladder.test.mjs (the page from the current verdicts and from a fixture
//      with one set missing and one -partial; "not measured" and "partial" asserted; the controls);
//   4. node --test test/web-daemon.test.mjs (the live view, running and not running).
// The verdict is written after the last exit code is known and before this process exits. The
// bar file is written once: if bench/verdicts/web-ladder.json exists this run refuses to start.
// A run that misses anything, or a --dev run, writes web-ladder-partial.json with isTheBar false.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { walkLadder } from './ladder-walk.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERDICTS = path.join(ROOT, 'bench', 'verdicts');
const OUT = path.join(VERDICTS, 'web-ladder.json');
const PARTIAL = path.join(VERDICTS, 'web-ladder-partial.json');
const PAGE = path.join(ROOT, 'web', 'dist', 'ladder', 'index.html');
const HEAP = '--max-old-space-size=6000';
const EMDASH = String.fromCharCode(0x2014);
const MB = 1048576;
const dev = process.argv.includes('--dev');
const say = (s) => console.log(s);
const t0 = performance.now();

if (!dev && existsSync(OUT)) {
  say('[refused] ' + path.relative(ROOT, OUT) + ' exists and a bar file is written once; nothing was run. Use --dev for a development run.');
  process.exitCode = 2;
} else {
  await main();
}

async function main() {
  // the BUDGETS rule: wait while the machine has under 16 GB free
  const freeGb = () => os.freemem() / 1024 / MB;
  const freeAtStart = freeGb();
  let waited = 0;
  while (freeGb() < 16 && waited < 1800) { say('[ram] ' + freeGb().toFixed(1) + ' GB free, under 16: waiting'); await new Promise((r) => setTimeout(r, 10000)); waited += 10; }

  const run = (args, label) => {
    const r = spawnSync(process.execPath, args, { cwd: ROOT, encoding: 'utf8', timeout: 300000, maxBuffer: 64 * MB, env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' } });
    const out = (r.stdout || '') + (r.stderr || '');
    return { label, status: r.status, signal: r.signal, error: r.error ? String(r.error.message || r.error) : null, lines: out.split(/\r?\n/).filter((l) => l.trim() !== '') };
  };

  // 1. the build
  const build = run([HEAP, 'web/build.mjs'], 'build');
  for (const l of build.lines) say(l);
  const pagesLine = build.lines.find((l) => /^pages built: [0-9]+ \(/.test(l)) || null;
  const ladderLine = build.lines.find((l) => /^dist ladder\/index\.html /.test(l)) || null;
  const pagesBuilt = pagesLine ? Number(pagesLine.match(/^pages built: ([0-9]+)/)[1]) : null;

  // 2. the built page, walked at once (other builders write verdicts; the closer the walk, the fewer races)
  let page = null;
  if (existsSync(PAGE)) {
    const html = readFileSync(PAGE, 'utf8');
    const w = walkLadder(html, VERDICTS);
    page = {
      path: 'web/dist/ladder/index.html', bytes: statSync(PAGE).size,
      numbersTraced: w.numbers, numbersInFieldValues: w.valueNumbers, numbersInPathLabels: w.pathNumbers, digitRunsInFileNames: w.fileNumbers,
      spans: w.spans, valueSpans: w.valueSpans, pathSpans: w.pathSpans, fileSpans: w.fileSpans,
      fieldsDistinct: w.fields.size, verdictFiles: [...w.files].sort(),
      untraced: w.bad.length, untracedFirst: w.bad.slice(0, 5), emDashes: html.split(EMDASH).length - 1,
      notMeasured: (html.match(/not measured/g) || []).length, partial: (html.match(/class="pill st partial">partial</g) || []).length,
    };
    say('[walk] ' + page.path + ': ' + page.bytes + ' bytes, ' + page.numbersTraced + ' numbers traced in ' + page.spans + ' spans ('
      + page.numbersInFieldValues + ' in ' + page.valueSpans + ' field values, ' + page.numbersInPathLabels + ' in ' + page.pathSpans + ' field-path labels, '
      + page.digitRunsInFileNames + ' in ' + page.fileSpans + ' file names) from ' + page.verdictFiles.length + ' verdict files; ' + page.untraced + ' untraced, '
      + page.emDashes + ' em dashes; "not measured" ' + page.notMeasured + ' times, partial pills ' + page.partial);
    for (const b of page.untracedFirst) say('[walk] untraced: ' + b);
  } else say('[walk] ' + path.relative(ROOT, PAGE) + ' is not on disk');

  // 3 and 4. the tests, one process each, in-process isolation so each is one process
  const testOf = (file) => {
    const r = run([HEAP, '--test', '--test-isolation=none', '--test-reporter=spec', file], file);
    const num = (k) => { const l = r.lines.find((x) => new RegExp('^\\S+ ' + k + ' [0-9]+$').test(x.trim())); return l ? Number(l.trim().split(' ').pop()) : null; };
    const res = { file, status: r.status, pass: num('pass'), fail: num('fail'), tests: num('tests'), durationMs: num('duration_ms'),
      named: r.lines.filter((l) => /^\s*(✔|✖)/.test(l)).map((l) => l.trim().replace(/ \([0-9.]+ms\)$/, '')),
      diagnostics: r.lines.filter((l) => /^ℹ (current verdicts|fixture)/.test(l.trim())).map((l) => l.trim().slice(2)) };
    if (res.durationMs === null) { const l = r.lines.find((x) => /duration_ms [0-9.]+$/.test(x)); res.durationMs = l ? Number(l.trim().split(' ').pop()) : null; }
    for (const l of res.named) say('[test] ' + l);
    for (const l of res.diagnostics) say('[test] ' + l);
    say('[test] ' + file + ': exit ' + r.status + ', tests ' + res.tests + ', pass ' + res.pass + ', fail ' + res.fail + ', ' + res.durationMs + ' ms');
    if (r.status !== 0) for (const l of r.lines.filter((x) => /Error|expected|actual/.test(x)).slice(0, 12)) say('[test] ' + l);
    return res;
  };
  const ladderTest = testOf('test/web-ladder.test.mjs');
  const daemonTest = testOf('test/web-daemon.test.mjs');

  // the bar, graded on what ran
  const checks = {
    buildExit0: build.status === 0,
    pagesBuiltPrinted: pagesLine !== null && pagesBuilt >= 4 && /ladder\/index\.html/.test(pagesLine),
    ladderLinePrinted: ladderLine !== null,
    builtPageWalked: page !== null && page.spans > 0,
    everyNumberTraced: page !== null && page.untraced === 0,
    noEmDash: page !== null && page.emDashes === 0,
    ladderTestExit0: ladderTest.status === 0 && ladderTest.fail === 0 && ladderTest.pass > 0,
    notMeasuredAndPartialAsserted: ladderTest.named.some((l) => /one set missing and one -partial/.test(l) && l.startsWith('✔')),
    walkerControlsReject: ladderTest.named.some((l) => /^✔ controls/.test(l)),
    daemonTestExit0: daemonTest.status === 0 && daemonTest.fail === 0 && daemonTest.pass > 0,
  };
  const met = Object.values(checks).every(Boolean);
  const missed = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
  say('[bar] ' + (met ? 'MET' : 'MISSED: ' + missed.join(', ')) + ': build exit ' + build.status + ', ' + (pagesLine || 'no pages line')
    + (page ? '; ladder page ' + page.bytes + ' bytes, ' + page.numbersTraced + ' numbers traced, ' + page.untraced + ' untraced, ' + page.emDashes + ' em dashes' : '; no page')
    + '; web-ladder tests ' + ladderTest.pass + '/' + ladderTest.tests + ', web-daemon tests ' + daemonTest.pass + '/' + daemonTest.tests);

  const isTheBar = !dev && met;
  const peakRssMb = Math.round((process.resourceUsage().maxRSS || 0) / 1024 * 10) / 10;
  const statement = 'The ladder page (/ladder) was built by node web/build.mjs, which exited ' + build.status + ' and printed "' + (pagesLine || 'no pages line') + '". '
    + (page ? 'The built page is ' + page.bytes + ' bytes; a walker that shares no code with the generator walked it against bench/verdicts and traced ' + page.numbersTraced
      + ' numbers in ' + page.spans + ' spans (' + page.numbersInFieldValues + ' of them in ' + page.valueSpans + ' field values, the rest in field-path labels and file names) to '
      + page.verdictFiles.length + ' verdict files, with ' + page.untraced + ' untraced and ' + page.emDashes + ' em dashes. ' : 'No built page was on disk. ')
    + 'test/web-ladder.test.mjs exited ' + ladderTest.status + ' with ' + ladderTest.pass + ' of ' + ladderTest.tests + ' passing: it renders the page from the current verdicts and from a fixture with HumanEval missing and GSM8K only -partial, asserts "not measured" and "partial", and shows that the walker rejects a bent number, a loose digit and a bad path. '
    + 'test/web-daemon.test.mjs exited ' + daemonTest.status + ' with ' + daemonTest.pass + ' of ' + daemonTest.tests + ' passing: the live view shows the health numbers through daemon/health.mjs and web/serve.mjs, and "daemon not running" when the endpoint is closed. '
    + 'The counts are a snapshot of verdicts other builders are still writing; no model was called and the machine was shared.';

  const verdict = {
    name: 'web-ladder', at: new Date().toISOString(), command: ['node', HEAP, 'web/ladder-bar.mjs', ...process.argv.slice(2)].join(' '), node: process.version,
    isTheBar, barMet: isTheBar,
    bar: { rule: 'web/build.mjs runs to completion and prints the pages built; test/web-ladder.test.mjs renders the page from the current verdicts and from a fixture directory with one verdict missing and one -partial, asserts "not measured" and "partial", and walks every number in the page text back to a verdict field; no em dashes in the page', checks, missed },
    statement,
    split: splitFor(),
    build: { exit: build.status, signal: build.signal, error: build.error, pagesLine, pagesBuilt, ladderLine },
    page,
    tests: { ladder: ladderTest, daemon: daemonTest },
    development: {
      note: 'every build, page render and test run before this one was development: web/ladder.mjs, web/ladder-walk.mjs, web/src/ladder.html and both tests changed between them, and none of their counts is quoted here. This run changed no file but web/dist and this verdict.',
      fixtureRendersAreFixtures: 'the fixture pages in test/web-ladder.test.mjs are rendered from copies of verdict files in a temp directory and prove the missing and partial paths; their counts describe the fixture, not the site',
    },
    machine: { platform: process.platform, cpus: os.cpus().length, freeMemGBStart: Math.round(freeAtStart * 10) / 10, waitedForRamS: waited,
      shared: 'seven builders share this machine; no Ollama call was made by this bar; the test timings are contended wall-clock times' },
    peakRssMb, peakRssNote: 'this runner process only (process.resourceUsage().maxRSS); the build and test children ran one at a time under the same heap cap',
    wallMs: Math.round(performance.now() - t0),
  };
  const file = isTheBar ? OUT : PARTIAL;
  if (isTheBar && existsSync(OUT)) throw new Error('web-ladder.json appeared during the run; not overwritten');
  writeFileSync(file, JSON.stringify(verdict, null, 1) + '\n');
  say('[verdict] ' + path.relative(ROOT, file).split(path.sep).join('/') + ' written (isTheBar ' + isTheBar + ', barMet ' + verdict.barMet + '); runner peak rss ' + peakRssMb + ' MB, wall ' + (verdict.wallMs / 1000).toFixed(1) + ' s');
  process.exitCode = met ? 0 : 1;
}

// board 19 builder: the split the bar was measured on (the gate's CONTAMINATION row needs an object).
/** What the ladder page bar developed on and what it graded: pure. */
export function splitFor() {
  return {
    development: { what: 'the verdicts under bench/verdicts the page is generated from, and the fixture of test/web-ladder.test.mjs (one set missing, one -partial)' },
    heldOut: { what: 'none: the walker (web/ladder-walk.mjs) shares no code with the generator, which makes it an independent check of the same page, not a held-out set', n: 0 },
    contaminated: 'no held-out set: the page is checked against the same verdicts it was built from',
  };
}
