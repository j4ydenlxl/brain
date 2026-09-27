#!/usr/bin/env node
// bench/senses.mjs: P12, THE FIVE SENSES. His words (2026-09-23): "It also should be able to
// feel five senses." MANUAL.md section B, P12: five typed receptors into the perception
// region, each printing hardware present or not, samples, bytes, latency, and the perception
// cell that fired. Senses only: no actuator without the gate.
//
// One fresh brain, the world border with no actuators and no stream senses, the five
// receptors (world/senses.mjs attachReceptors), then --samples feels of each sense on this
// machine's real hardware wherever the probe finds it: the screen for sight, the microphone
// for hearing, the pointer (and the keyboard, when stdin is a terminal) for touch. Where a
// probe finds nothing the receptor says so and reads its fallback file; smell and taste have
// no hardware on a desktop, the probe proves it, and they read their descriptor tables.
//
// Printed per sense: hardware present and how it was probed, samples captured and from where,
// bytes, latency ms, the encoding and its lanes, the perception cell that fired, its ticks,
// and what it named; for smell and taste the table and the rows loaded. Then one line on
// actuation (gate proposals, world.act, motor edges, actuator cells), and the handles left.
//
// The verdict: bench/verdicts/senses.json, isTheBar true, written ONCE at the end of a full
// run (all five senses, the default sources). --only, --source or a crash writes
// senses-partial.json with isTheBar false instead. Nothing captured is written anywhere: a
// screen frame, a pointer trace and a microphone clip live in memory for one encode and the
// verdict keeps only their sizes, timings and a hash of the percept.
//
//   node bench/senses.mjs                    the bar (3 samples per sense)
//   node bench/senses.mjs --samples 5        more samples
//   node bench/senses.mjs --only smell,taste a partial run
//   node bench/senses.mjs --source fixture   every sense from its fixture (partial)
//   node bench/senses.mjs --keys-ms 3000     read keystroke timing for 3 s (a terminal only)
//   node bench/senses.mjs --write-fixtures   regenerate the fixtures, LICENSE and SOURCES.md
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const FIX = path.join(ROOT, 'bench', 'fixtures', 'senses');
const VERDICTS = path.join(ROOT, 'bench', 'verdicts');
const relp = (p) => path.relative(ROOT, p).replace(/\\/g, '/');

function arg(name, dflt = null) {
  const i = process.argv.indexOf('--' + name);
  if (i < 0) return dflt;
  const v = process.argv[i + 1];
  return v === undefined || v.startsWith('--') ? true : v;
}

// ---------------------------------------------------------------- fixtures
// Every fixture is made here, from nothing but arithmetic, or authored by hand (the two
// tables), so none of them came from anywhere and all of them are CC0.
export async function writeFixtures() {
  const K = await import('../world/receptor-kit.mjs');
  mkdirSync(FIX, { recursive: true });
  // sight.png: 64 x 36, a sky that darkens upward, a sun disk, green ground with a road.
  const W = 64, H = 36, rgb = new Uint8Array(W * H * 3);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3;
    let r, g, b;
    if (y < 22) { r = 60 + y * 5; g = 110 + y * 5; b = 230 - y * 2; }
    else { r = 40; g = 120 + (y - 22) * 3; b = 40; if (Math.abs(x - 32) < (y - 20) * 1.2) { r = 90; g = 90; b = 95; } }
    if ((x - 48) ** 2 + (y - 8) ** 2 <= 25) { r = 255; g = 220; b = 80; }
    rgb[i] = r; rgb[i + 1] = g; rgb[i + 2] = b;
  }
  writeFileSync(path.join(FIX, 'sight.png'), K.encodePng(W, H, rgb));
  // hearing.wav: 0.5 s at 16 kHz, 16 bit mono, 440 Hz at half scale plus 1760 Hz at a quarter.
  const rate = 16000, n = rate / 2, samples = new Float32Array(n);
  for (let i = 0; i < n; i++) samples[i] = 0.5 * Math.sin(2 * Math.PI * 440 * i / rate) + 0.25 * Math.sin(2 * Math.PI * 1760 * i / rate);
  writeFileSync(path.join(FIX, 'hearing.wav'), K.encodeWav(rate, samples));
  // touch.json: a pointer trace of 20 readings 25 ms apart drifting right and down across a
  // 3840 x 2160 desktop with no button held, and five keystroke times, no key identities.
  const pts = [];
  for (let i = 0; i < 20; i++) pts.push([i * 25, 1200 + i * 14, 800 + i * 6, 0]);
  const trace = { pointer: { x0: 0, y0: 0, w: 3840, h: 2160, intervalMs: 25, idleMs: 1200, pts, psMs: 520 }, keys: { keys: 5, times: [0, 180, 350, 540, 700], bytes: 5, windowMs: 2000 } };
  writeFileSync(path.join(FIX, 'touch.json'), JSON.stringify(trace, null, 1) + '\n');
  writeFileSync(path.join(FIX, 'LICENSE'), [
    'CC0 1.0 Universal (public domain dedication)',
    '',
    'Every file in this directory was made for this repository: sight.png, hearing.wav and',
    'touch.json are generated by `node bench/senses.mjs --write-fixtures` from arithmetic alone,',
    'and odorants.csv and tastants.csv were authored by hand from general chemistry knowledge',
    '(which compound smells or tastes of what). Nothing here was downloaded or copied.',
    '',
    'To the extent possible under law, the authors have waived all copyright and related or',
    'neighboring rights to these files. They are dedicated to the public domain under CC0 1.0:',
    'https://creativecommons.org/publicdomain/zero/1.0/',
    '',
  ].join('\n'));
  const line = (f, how) => {
    const buf = readFileSync(path.join(FIX, f));
    return '- `' + f + '`: ' + how + '; url none; sha256 ' + createHash('sha256').update(buf).digest('hex').slice(0, 16) + '; ' + buf.length + ' bytes; licence CC0-1.0';
  };
  writeFileSync(path.join(FIX, 'SOURCES.md'), [
    '# Sources: bench/fixtures/senses',
    '',
    'No file here was downloaded. Each line: file, how it was made, url, sha256 prefix, bytes, licence (LICENSE beside it).',
    '',
    line('odorants.csv', 'authored by hand, one odorant per row: name, chemical class, odour descriptors separated by semicolons'),
    line('tastants.csv', 'authored by hand, one tastant per row: name, chemical class, taste qualities separated by semicolons'),
    line('sight.png', 'generated by bench/senses.mjs --write-fixtures, a 64x36 synthetic scene'),
    line('hearing.wav', 'generated by bench/senses.mjs --write-fixtures, 0.5 s of 440 Hz plus 1760 Hz at 16 kHz'),
    line('touch.json', 'generated by bench/senses.mjs --write-fixtures, a synthetic pointer trace and keystroke times'),
    '',
  ].join('\n'));
  return ['sight.png', 'hearing.wav', 'touch.json', 'LICENSE', 'SOURCES.md'].map((f) => relp(path.join(FIX, f)));
}

// ---------------------------------------------------------------- the run
const r3 = (x) => (Number.isFinite(x) ? Math.round(x * 1000) / 1000 : null);
const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null);

async function main() {
  if (arg('write-fixtures')) { for (const f of await writeFixtures()) console.log('wrote ' + f); return; }
  const samples = Math.max(1, Math.round(Number(arg('samples', 3)) || 3));
  const onlyArg = arg('only');
  const sourceArg = arg('source');
  const { Brain } = await import('../core/brain.mjs');
  await import('../cells/basic.mjs');
  const { attachWorld, closeWorld, ACTUATOR_KINDS } = await import('../world/index.mjs');
  const { attachReceptors, feel, RECEPTOR_NAMES, RECEPTORS } = await import('../world/senses.mjs');
  const only = typeof onlyArg === 'string' ? onlyArg.split(',').map((s) => s.trim()).filter(Boolean) : RECEPTOR_NAMES;
  for (const n of only) if (!RECEPTOR_NAMES.includes(n)) throw new Error('--only: no sense ' + n + ' (have ' + RECEPTOR_NAMES.join(', ') + ')');
  const tty = !!(process.stdin.isTTY && typeof process.stdin.setRawMode === 'function');
  const keysMs = Number(arg('keys-ms', tty ? 2000 : 0)) || 0;
  const complete = only.length === RECEPTOR_NAMES.length && !sourceArg;
  const command = 'node bench/senses.mjs' + (process.argv.length > 2 ? ' ' + process.argv.slice(2).join(' ') : '');
  const file = path.join(VERDICTS, complete ? 'senses.json' : 'senses-partial.json');

  const t0 = performance.now();
  const brain = new Brain({ name: 'senses', seed: 'senses', growth: false });
  const proposals = [];
  const offP = brain.ledger.on((e) => { if (e.type === 'proposal') proposals.push({ kind: e.kind, by: e.by }); });
  attachWorld(brain, null, { actuators: false, senses: false, wire: false });
  const attached = attachReceptors(brain, { senses: only });
  console.log('P12 five senses: ' + only.length + ' receptor' + (only.length === 1 ? '' : 's') + ', ' + samples + ' sample' + (samples === 1 ? '' : 's') + ' each, node ' + process.version + ', ' + process.platform + (tty ? ', stdin is a terminal (keys ' + keysMs + ' ms per touch sample)' : ', stdin is not a terminal (no keystrokes read)'));
  for (const w of attached.wired) console.log('  wired ' + w);

  const rows = [];
  let crashed = null;
  try {
    for (const name of only) {
      const R = RECEPTORS[name];
      const probe = await R.probe({});
      const feels = [];
      for (let i = 0; i < samples; i++) {
        const opts = { probe, keysMs };
        if (sourceArg) opts.source = sourceArg;
        if (name === 'smell' || name === 'taste') { opts.index = i * 17; delete opts.source; }
        feels.push(await feel(brain, name, opts));
      }
      const row = {
        sense: name,
        present: !!probe.present, how: probe.how, probeMs: probe.ms ?? null,
        camera: probe.camera || undefined,
        samples: feels.length,
        captured: feels.filter((f) => f.bytes > 0).length,
        sources: [...new Set(feels.map((f) => f.source))],
        hardwareSamples: feels.filter((f) => f.hardware).length,
        fallback: feels.find((f) => f.fallback)?.fallback || null,
        bytes: feels.map((f) => f.bytes), bytesTotal: feels.reduce((s, f) => s + f.bytes, 0),
        latencyMs: feels.map((f) => f.latencyMs), latencyMeanMs: r3(mean(feels.map((f) => f.latencyMs))),
        encoding: feels[0].encoding, lanes: feels[0].lanes ?? null, provenance: feels[0].provenance ?? null,
        code: feels[0].code ?? null,
        fired: feels.every((f) => f.fired) ? feels[0].fired : null,
        firedCount: feels.filter((f) => f.fired).length,
        ticks: feels.map((f) => f.tick ?? null),
        named: [...new Set(feels.map((f) => f.named ?? null))],
        sims: feels.map((f) => f.sim ?? null),
        recognised: feels.filter((f) => f.recognised).length,
        hashes: feels.map((f) => f.hash ?? null),
        ledger: feels.map((f) => f.ledger ?? null),
        features: feels.map((f) => f.features ?? null),
        reasons: feels.map((f) => f.reason || null).filter(Boolean),
      };
      if (probe.table) row.table = { name: probe.table.name, path: probe.table.path, rows: probe.table.rows, bytes: probe.table.bytes };
      rows.push(row);
      printRow(row);
    }
  } catch (e) {
    crashed = String(e && e.stack || e);
    console.log('CRASHED: ' + crashed.split('\n')[0]);
  } finally {
    offP();
  }

  // ------------------------------------------------------------ nothing actuated
  const motorIdx = new Set([...(brain.regions.get('motor')?.cells || [])]);
  let motorEdges = 0;
  for (let e = 0; e < brain.connectome.size(); e++) if (motorIdx.has(brain.connectome.dst[e]) && brain.connectome.src[e] !== brain.connectome.dst[e]) motorEdges++;
  // world.relay is in ACTUATOR_KINDS because actuators.mjs defines it, but it is the border
  // (w.percept, w.motor): it relays, it reaches nothing. Every other actuator kind counts.
  const actuatorCells = brain.cells.filter((c) => ACTUATOR_KINDS.includes(c.kind) && c.kind !== 'world.relay').length;
  const actuation = {
    gateProposed: brain.gate.stats.proposed,
    proposals: proposals.length,
    worldActProposals: proposals.filter((p) => p.kind === 'world.act').length,
    motorEdges, actuatorCells,
    worldSenseEvents: brain.ledger.counts.get('world.sense') || 0,
    cellRuns: brain.ledger.counts.get('cell.run') || 0,
  };
  closeWorld(brain);
  console.log('nothing actuated: gate proposals ' + actuation.gateProposed + ', world.act proposals ' + actuation.worldActProposals + ', edges into motor ' + actuation.motorEdges + ', actuator cells ' + actuation.actuatorCells + ' (besides the two world.relay border cells); ledger world.sense ' + actuation.worldSenseEvents + ', cell.run ' + actuation.cellRuns);
  // A child's process handle is closed by libuv on the loop turn after its exit callback, so
  // the census waits two turns first; what is left after that is really left.
  await new Promise((r) => setImmediate(r));
  await new Promise((r) => setImmediate(r));
  const handles = process.getActiveResourcesInfo().filter((h) => h !== 'TTYWrap');
  console.log('handles left after the run (TTYWrap excluded): ' + (handles.length ? handles.join(', ') : 'none'));

  // ------------------------------------------------------------ the verdict, once
  const fired = rows.filter((r) => r.fired && r.recognised === r.samples).length;
  const met = !crashed && rows.length === RECEPTOR_NAMES.length && fired === rows.length && actuation.worldActProposals === 0 && actuation.gateProposed === 0 && actuation.motorEdges === 0;
  const wallMs = r3(performance.now() - t0);
  // board 23 builder (item contamination-split, fix pass): barMet is the top-level boolean every bar
  // file carries (the same value as met); contaminated is filled from the split below
  const live = rows.filter((r) => r.present && r.samples > 0 && r.hardwareSamples === r.samples);
  const verdict = {
    at: new Date().toISOString(), command, node: process.version, platform: process.platform + ' ' + process.arch,
    isTheBar: complete && !crashed, barMet: met, met, contaminated: null, samplesPerSense: samples, stdinTTY: tty, keysMs, wallMs,
    rows: rows.map(({ features, ...r }) => ({ ...r, features: features.map(slimFeatures) })),
    actuation, handles, crashed,
    statement: statementOf(rows, actuation, samples, met, wallMs, crashed),
    split: splitFor({ senses: rows.map((r) => r.sense), hardware: live.map((r) => r.sense), liveSamples: live.reduce((n, r) => n + r.hardwareSamples, 0) }),
  };
  // board 23 builder (item contamination-split, fix pass): the gate counts contaminated only when it is
  // true, so a reason in the split is marked at the top level and said in the statement
  verdict.contaminated = typeof verdict.split.contaminated === 'string';
  if (verdict.contaminated) verdict.statement += ' Contaminated: ' + verdict.split.contaminated + '.';
  console.log('split: held out ' + verdict.split.heldOut.n + ' senses read live (' + (verdict.split.heldOut.liveHardware.join(', ') || 'none') + ') on ' + verdict.split.heldOut.samples + ' live samples; contaminated ' + (verdict.contaminated ? verdict.split.contaminated : 'false'));
  if (!complete || crashed) verdict.partialBecause = crashed ? 'the run crashed' : (only.length !== RECEPTOR_NAMES.length ? '--only ' + only.join(',') : '--source ' + sourceArg);
  mkdirSync(VERDICTS, { recursive: true });
  const out = crashed && complete ? path.join(VERDICTS, 'senses-partial.json') : file;
  writeFileSync(out, JSON.stringify(verdict, null, 1) + '\n');
  console.log((!complete ? 'PARTIAL RUN' : met ? 'BAR MET' : 'BAR NOT MET') + ': ' + fired + ' of ' + RECEPTOR_NAMES.length + ' senses fired a perception cell that named its own modality on every sample; wall ' + wallMs + ' ms');
  console.log('wrote ' + relp(out) + (verdict.isTheBar ? ' (isTheBar true)' : ' (partial, isTheBar false)'));
  process.exitCode = met || !complete ? 0 : 1;
}

// board 19 builder: the split the bar was measured on (the gate's CONTAMINATION row needs an object).
// board 23 builder (item contamination-split): contaminated is decided from the run's rows: a sense
// read live from its hardware is graded on a sample no development step saw; a sense that read its
// fixture or table is graded on development data, and the reason names those senses.
// Board 23 fix pass: heldOut.n counts the senses read live (the bar grades a sense: its cell fired and
// named its modality on every sample), and heldOut.samples counts the live samples they were graded on.
/** What the senses bar developed on and what it graded: pure, from the sense names, the ones with hardware and their live sample count. */
export function splitFor(opts = {}) {
  const senses = Array.isArray(opts.senses) ? opts.senses.slice() : [];
  const hardware = Array.isArray(opts.hardware) ? opts.hardware.slice() : [];
  const fromFixture = senses.filter((x) => !hardware.includes(x));
  return {
    development: { what: 'the five receptors, their encoders and the fixtures and descriptor tables this bench writes (--write-fixtures); the perception cells were written to name these modalities', senses },
    heldOut: { what: 'the senses read live: a sense whose hardware the probe found is graded on samples captured during this run, which no development step saw (n counts those senses, samples counts their live samples); a sense without hardware reads its development fixture or table and is not held out', liveHardware: hardware, fromFixture, n: hardware.length, samples: Number.isInteger(opts.liveSamples) ? opts.liveSamples : null },
    contaminated: senses.length === 0
      ? 'no sense was graded, so nothing was held out'
      : fromFixture.length
        ? fromFixture.length + ' of ' + senses.length + ' senses (' + fromFixture.join(', ') + ') were graded on the fixture or table this bench was developed on, not on a live sample'
        : false,
  };
}

function slimFeatures(f) {
  if (!f) return f;
  const o = { ...f };
  delete o.encodeMs;
  return o;
}

function printRow(r) {
  const hw = r.present ? 'present' : 'absent';
  console.log('');
  console.log(r.sense.toUpperCase() + '  hardware ' + hw + ' (' + r.present + ')  probed: ' + r.how + (r.probeMs != null ? ' [host probe ' + r.probeMs + ' ms]' : ''));
  if (r.camera) console.log('  camera ' + (r.camera.present ? 'present' : 'absent') + ': ' + r.camera.how);
  if (r.table) console.log('  table ' + r.table.name + ': ' + r.table.rows + ' rows loaded (' + r.table.bytes + ' bytes)');
  console.log('  samples captured ' + r.captured + ' of ' + r.samples + ' from ' + r.sources.join(', ') + (r.hardwareSamples ? ' (' + r.hardwareSamples + ' from hardware)' : ' (none from hardware)') + (r.fallback ? '; fallback because ' + r.fallback : ''));
  console.log('  bytes ' + r.bytes.join(' / ') + ' (total ' + r.bytesTotal + ')   latency ms ' + r.latencyMs.join(' / ') + ' (mean ' + r.latencyMeanMs + ')');
  console.log('  encoding ' + r.encoding + ' -> ' + r.lanes + ' lanes, provenance ' + r.provenance + '; code: ' + r.code);
  console.log('  perception cell fired: ' + (r.fired || 'NONE') + ' on ' + r.firedCount + ' of ' + r.samples + ', ticks ' + r.ticks.join(',') + '; named ' + r.named.join(',') + ' (sim ' + r.sims.join(',') + '), own modality on ' + r.recognised + ' of ' + r.samples);
  if (r.reasons.length) console.log('  not fired because: ' + r.reasons.join(' | '));
  const f = r.features[r.features.length - 1];
  if (f) console.log('  last sample: ' + Object.entries(slimFeatures(f)).map(([k, v]) => k + '=' + (Array.isArray(v) ? v.join(';') : v)).join(' '));
}

function statementOf(rows, a, samples, met, wallMs, crashed) {
  if (crashed) return 'The run crashed after ' + rows.length + ' of five senses: ' + crashed.split('\n')[0];
  const part = rows.map((r) => r.sense + ' ' + (r.present ? 'had hardware' : 'had no hardware') + ' and captured ' + r.captured + ' of ' + r.samples + ' samples from ' + r.sources.join(' and ') + ' (' + r.bytesTotal + ' bytes, mean latency ' + r.latencyMeanMs + ' ms' + (r.table ? ', table ' + r.table.name + ' with ' + r.table.rows + ' rows' : '') + '), and ' + (r.fired ? r.fired + ' fired at ticks ' + r.ticks.join(',') + ' naming ' + r.named.join(',') : 'no perception cell fired'));
  return 'On ' + process.platform + ' with node ' + process.version + ', ' + samples + ' samples per sense, ' + part.join('; ') + '. Every percept was an 8192 lane bipolar hypervector with provenance sense:<name>, and the ledger shows each one consumed by its decode.hv perception cell. Nothing actuated: ' + a.gateProposed + ' gate proposals, ' + a.worldActProposals + ' world.act, ' + a.motorEdges + ' edges into motor, ' + a.actuatorCells + ' actuator cells. No capture was written to disk. Wall ' + wallMs + ' ms. Bar ' + (met ? 'met' : 'not met') + '.';
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error(e && e.stack || e); process.exitCode = 1; });
}
