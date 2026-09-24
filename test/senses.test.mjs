// test/senses.test.mjs: P12, the five receptors. Every test here runs on the fixtures under
// bench/fixtures/senses and a PowerShell path that does not exist, so no test reads this
// machine's screen, pointer, microphone or device list: the hardware path is bench/senses.mjs,
// and what this file proves is the contract around it. Each receptor encodes a fixture to an
// 8192 lane bipolar hypervector with provenance sense:<name>; a perception cell fires on it
// and the ledger shows the chain; a receptor with no hardware says so and does not throw;
// nothing acts, nothing listens, and nothing is left open when the file ends.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { crc32, deflateSync } from 'node:zlib';
import { Brain } from '../core/brain.mjs';
import '../cells/basic.mjs';
import { attachWorld, closeWorld, SENSE_KINDS, WORLD_KINDS } from '../world/index.mjs';
import { attachReceptors, feel, MODALITY_ITEMS, RECEPTOR_KINDS, RECEPTOR_NAMES, RECEPTORS } from '../world/senses.mjs';
import * as K from '../world/receptor-kit.mjs';
import * as touch from '../world/receptor-touch.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const FIX = path.join(ROOT, 'bench', 'fixtures', 'senses');
// A PowerShell that is not there: every probe takes its no-hardware path, and no test can
// reach the real screen, pointer or microphone even by accident.
const NOPE = path.join(ROOT, 'bench', 'fixtures', 'senses', 'no-such-powershell.exe');
const NOT_A_TTY = { isTTY: false };
const FIXTURE_OPTS = {
  sight: { source: 'fixture' }, hearing: { source: 'fixture' }, touch: { source: 'fixture' },
  smell: { compound: 'vanillin' }, taste: { compound: 'sucrose' },
};
const RECEPTOR_FILES = ['receptor-kit.mjs', 'receptor-sight.mjs', 'receptor-hearing.mjs', 'receptor-touch.mjs', 'receptor-smell.mjs', 'receptor-taste.mjs'];

async function encodeFixture(name, extra = {}) {
  const R = RECEPTORS[name];
  const s = await R.sample({ ...FIXTURE_OPTS[name], ...extra, powershell: NOPE, stream: NOT_A_TTY });
  return { s, sig: R.encode(s) };
}
const contentOf = async (name, extra) => (await encodeFixture(name, extra)).sig.content;
const turn = () => new Promise((r) => setImmediate(r));

function freshBrain() {
  const brain = new Brain({ name: 'senses-test', seed: 'senses-test', growth: false });
  attachWorld(brain, null, { actuators: false, senses: false, wire: false });
  attachReceptors(brain);
  return brain;
}

// ---------------------------------------------------------------- the contract
test('every receptor encodes its fixture to an 8192 lane bipolar hypervector with provenance sense:<name>', async () => {
  assert.deepEqual([...RECEPTOR_NAMES], ['sight', 'hearing', 'touch', 'smell', 'taste']);
  for (const name of RECEPTOR_NAMES) {
    const { s, sig } = await encodeFixture(name);
    assert.ok(Buffer.isBuffer(s.bytes) && s.bytes.length > 0, name + ' sample has bytes');
    assert.ok(Number.isFinite(s.latencyMs) && s.latencyMs >= 0, name + ' sample has a latency');
    assert.equal(typeof s.encoding, 'string', name + ' sample names its encoding');
    assert.equal(s.hardware, false, name + ' fixture sample is not hardware');
    assert.equal(sig.kind, 'hv');
    assert.equal(sig.lanes, 8192, name + ' lanes');
    assert.equal(sig.data.length, 8192);
    assert.ok(K.isBipolarHv(sig.data), name + ' percept is bipolar');
    assert.ok(K.isBipolarHv(sig.content), name + ' content is bipolar');
    assert.equal(sig.provenance, 'sense:' + name);
    assert.equal(sig.sense, name);
    assert.match(sig.hash, /^[0-9a-f]{8}$/);
    assert.equal(RECEPTORS[name].encode(s).hash, sig.hash, name + ' encode is deterministic');
    // the modality is readable from the lanes: about 0.5 to its own key, about 0 to the others
    for (const other of RECEPTOR_NAMES) {
      const sim = K.simOf(sig.data, K.key('sense:' + other));
      if (other === name) assert.ok(sim > 0.4 && sim < 0.6, name + ' vs its own key ' + sim);
      else assert.ok(Math.abs(sim) < 0.1, name + ' vs ' + other + ' key ' + sim);
    }
  }
});

test('the codes mean something: alike inputs share lanes, unlike ones do not', async () => {
  const v = await contentOf('smell', { compound: 'vanillin' });
  const ev = await contentOf('smell', { compound: 'ethyl vanillin' });
  const h2s = await contentOf('smell', { compound: 'hydrogen sulfide' });
  assert.ok(K.simOf(v, ev) > 0.4, 'vanillin ~ ethyl vanillin ' + K.simOf(v, ev));
  assert.ok(Math.abs(K.simOf(v, h2s)) < 0.1, 'vanillin vs hydrogen sulfide ' + K.simOf(v, h2s));
  const mix = await contentOf('smell', { mixture: ['vanillin', 'd-limonene'] });
  const lim = await contentOf('smell', { compound: 'd-limonene' });
  assert.ok(K.simOf(mix, v) > 0.2 && K.simOf(mix, lim) > 0.2, 'a mixture smells of both of its parts');

  const su = await contentOf('taste', { compound: 'sucrose' });
  const gl = await contentOf('taste', { compound: 'glucose' });
  const qu = await contentOf('taste', { compound: 'quinine' });
  assert.ok(K.simOf(su, gl) > K.simOf(su, qu) + 0.15, 'sucrose is nearer glucose than quinine');

  // hearing: a tone is nearer the same tone detuned by a few hertz than two octaves away
  const tone = (hz) => { const rate = 16000, x = new Float32Array(8000); for (let i = 0; i < x.length; i++) x[i] = 0.5 * Math.sin(2 * Math.PI * hz * i / rate); return RECEPTORS.hearing.encode({ bytes: K.encodeWav(rate, x) }).content; };
  const a440 = tone(440), a446 = tone(446), a1760 = tone(1760);
  assert.ok(K.simOf(a440, a446) > K.simOf(a440, a1760) + 0.1, 'hearing 440~446 ' + K.simOf(a440, a446) + ' vs 440~1760 ' + K.simOf(a440, a1760));

  // sight: the fixture is nearer itself slightly brightened than its own negative
  const img = K.decodePng(readFileSync(path.join(FIX, 'sight.png')));
  const shift = new Uint8Array(img.rgb.length), neg = new Uint8Array(img.rgb.length);
  for (let i = 0; i < img.rgb.length; i++) { shift[i] = Math.min(255, img.rgb[i] + 6); neg[i] = 255 - img.rgb[i]; }
  const see = (rgb) => RECEPTORS.sight.encode({ bytes: K.encodePng(img.width, img.height, rgb) }).content;
  const base = see(img.rgb);
  assert.ok(K.simOf(base, see(shift)) > K.simOf(base, see(neg)) + 0.2, 'sight: brighter is nearer than the negative');

  // touch: the fixture's features are read from its bytes
  const { sig } = await encodeFixture('touch');
  assert.equal(sig.features.readings, 20);
  assert.equal(sig.features.direction, 'se');
  assert.equal(sig.features.keys, 5);
  assert.equal(sig.features.contact, false);
});

// ---------------------------------------------------------------- perception fires
test('a perception cell fires on every receptor, names its modality, and the ledger shows the chain', async () => {
  const brain = freshBrain();
  try {
    assert.deepEqual(brain.ctx.receptors.border, 'w.percept');
    for (const name of RECEPTOR_NAMES) {
      const row = await feel(brain, name, { ...FIXTURE_OPTS[name], powershell: NOPE, stream: NOT_A_TTY });
      assert.equal(row.fired, 'w.feel.' + name, name + ' fired ' + (row.reason || ''));
      assert.equal(row.named, 'sense:' + name, name + ' names its own modality');
      assert.equal(row.recognised, true);
      assert.ok(row.sim > 0.4, name + ' sim ' + row.sim);
      assert.ok(Number.isInteger(row.tick) && row.tick > row.receptorTick, name + ' perception ran after the receptor');
      assert.equal(row.lanes, 8192);
      assert.equal(row.provenance, 'sense:' + name);
      const L = row.ledger;
      const ws = brain.ledger.get(L.sense), rrun = brain.ledger.get(L.receptorRun), hv = brain.ledger.get(L.hvSignal), frun = brain.ledger.get(L.perceptionRun), out = brain.ledger.get(L.output);
      assert.equal(ws.type, 'world.sense'); assert.equal(ws.op, 'sense.receptor'); assert.equal(ws.from, null); assert.equal(ws.provenance, 'sense:' + name); assert.equal(ws.hash, row.hash);
      assert.equal(rrun.type, 'cell.run'); assert.equal(rrun.cell, 'w.' + name);
      assert.equal(hv.type, 'signal'); assert.equal(hv.from, L.receptorRun); assert.equal(hv.kind, 'hv');
      assert.equal(frun.type, 'cell.run'); assert.equal(frun.cell, 'w.feel.' + name); assert.ok(frun.consumed.includes(L.hvSignal));
      assert.equal(frun.t, row.tick);
      assert.equal(out.type, 'signal'); assert.equal(out.from, L.perceptionRun);
      const perceptionCell = brain.cell('w.feel.' + name);
      assert.equal(perceptionCell.region, 'perception');
      assert.deepEqual([...perceptionCell.params.items], [...MODALITY_ITEMS]);
    }
    // the provenance event crossed the border into perception too
    assert.ok(brain.cell('w.percept').state.passed + brain.cell('w.percept').state.queue.length >= 1 || brain.cell('w.percept').memory.working.length >= 1);
  } finally { closeWorld(brain); }
});

// ---------------------------------------------------------------- no hardware
test('a receptor with no hardware reports it, with how, and does not throw', async () => {
  for (const name of RECEPTOR_NAMES) {
    const p = await RECEPTORS[name].probe({ powershell: NOPE, fresh: true, stream: NOT_A_TTY });
    assert.equal(p.present, false, name + ' present false');
    assert.equal(typeof p.how, 'string');
    assert.ok(p.how.length > 10, name + ' says how it probed');
    assert.match(p.how, /ENOENT|not runnable|not Windows/, name + ' names why: ' + p.how);
  }
  const sp = await RECEPTORS.smell.probe({ powershell: NOPE });
  assert.equal(sp.table.name, 'odorants.csv'); assert.ok(sp.table.rows >= 50);
  const tp = await RECEPTORS.taste.probe({ powershell: NOPE });
  assert.equal(tp.table.name, 'tastants.csv'); assert.ok(tp.table.rows >= 40);
  // asked for the hardware outright: an empty sample with the reason, never a throw
  for (const [name, source] of [['sight', 'screen'], ['hearing', 'mic'], ['touch', 'live']]) {
    const s = await RECEPTORS[name].sample({ source, powershell: NOPE, stream: NOT_A_TTY });
    assert.equal(s.hardware, false); assert.equal(s.bytes.length, 0); assert.ok(s.fallback, name + ' says why');
  }
  // left to choose: the fixture, and the reason it fell back
  for (const name of ['sight', 'hearing', 'touch']) {
    const s = await RECEPTORS[name].sample({ powershell: NOPE, stream: NOT_A_TTY });
    assert.equal(s.hardware, false); assert.ok(s.bytes.length > 0); assert.match(s.source, /^file:bench\/fixtures\/senses\//); assert.ok(s.fallback);
  }
  // and feel() on an empty sample returns a row with the reason instead of throwing
  const brain = freshBrain();
  try {
    const row = await feel(brain, 'hearing', { source: 'mic', powershell: NOPE });
    assert.equal(row.fired, null); assert.equal(row.present, false); assert.ok(row.reason);
  } finally { closeWorld(brain); }
  K.forgetHost();
});

// ---------------------------------------------------------------- nothing acts
test('nothing actuates: no proposal, no world.act, no motor edge, no actuating call in any receptor', async () => {
  const brain = freshBrain();
  const proposals = [];
  const off = brain.ledger.on((e) => { if (e.type === 'proposal') proposals.push(e); });
  try {
    for (const name of RECEPTOR_NAMES) await feel(brain, name, { ...FIXTURE_OPTS[name], powershell: NOPE, stream: NOT_A_TTY });
    assert.equal(brain.gate.stats.proposed, 0);
    assert.equal(proposals.length, 0);
    assert.equal(brain.ledger.counts.get('proposal') || 0, 0);
    const motor = brain.regions.get('motor').cells;
    for (let e = 0; e < brain.connectome.size(); e++) assert.ok(!motor.has(brain.connectome.dst[e]), 'no edge into motor');
    assert.equal(brain.ledger.counts.get('world.sense'), RECEPTOR_NAMES.length);
  } finally { off(); closeWorld(brain); }
  const forbidden = ['SetCursorPos', 'mouse_event', 'keybd_event', 'SendKeys', 'SendInput', 'PostMessage', 'SendMessage', 'node:http', 'node:https', 'node:net', 'node:dgram', 'fetch(', 'createServer', '.listen('];
  for (const f of RECEPTOR_FILES) {
    const src = readFileSync(path.join(ROOT, 'world', f), 'utf8');
    for (const word of forbidden) assert.ok(!src.includes(word), f + ' contains ' + word);
  }
  // the receptor kind is its own list: the stream senses and the world census are unchanged
  assert.deepEqual([...SENSE_KINDS], ['sense.poll', 'sense.watch', 'sense.stdin', 'sense.venue']);
  assert.equal(WORLD_KINDS.length, 13);
  assert.deepEqual([...RECEPTOR_KINDS], ['sense.receptor']);
  assert.ok(!WORLD_KINDS.includes('sense.receptor'));
});

// ---------------------------------------------------------------- the decoders
test('PNG: encode then decode is exact, and all five scanline filters decode', () => {
  const w = 7, h = 5, rgb = new Uint8Array(w * h * 3);
  for (let i = 0; i < rgb.length; i++) rgb[i] = (i * 37 + 11) & 255;
  const back = K.decodePng(K.encodePng(w, h, rgb));
  assert.equal(back.width, w); assert.equal(back.height, h);
  assert.deepEqual([...back.rgb], [...rgb]);
  // an 8 bit RGB image whose row y uses filter y % 5 (None, Sub, Up, Average, Paeth)
  const bpp = 3, stride = w * bpp, raw = Buffer.alloc(h * (stride + 1));
  const paeth = (a, b, c) => { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); return pa <= pb && pa <= pc ? a : pb <= pc ? b : c; };
  for (let y = 0; y < h; y++) {
    const f = y % 5; raw[y * (stride + 1)] = f;
    for (let x = 0; x < stride; x++) {
      const cur = rgb[y * stride + x], a = x >= bpp ? rgb[y * stride + x - bpp] : 0, b = y ? rgb[(y - 1) * stride + x] : 0, c = x >= bpp && y ? rgb[(y - 1) * stride + x - bpp] : 0;
      const pred = f === 0 ? 0 : f === 1 ? a : f === 2 ? b : f === 3 ? (a + b) >> 1 : paeth(a, b, c);
      raw[y * (stride + 1) + 1 + x] = (cur - pred) & 255;
    }
  }
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type, 'latin1'), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td) >>> 0); return Buffer.concat([len, td, crc]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
  assert.deepEqual([...K.decodePng(png).rgb], [...rgb]);
  assert.throws(() => K.decodePng(Buffer.from('not a png')));
});

test('WAV: encode then decode keeps every sample to 16 bit precision, and the spectrum finds the tone', () => {
  const rate = 16000, x = new Float32Array(4000);
  for (let i = 0; i < x.length; i++) x[i] = 0.6 * Math.sin(2 * Math.PI * 1000 * i / rate);
  const wav = K.decodeWav(K.encodeWav(rate, x));
  assert.equal(wav.rate, rate); assert.equal(wav.channels, 1); assert.equal(wav.bits, 16);
  assert.equal(wav.samples.length, x.length);
  let worst = 0; for (let i = 0; i < x.length; i++) worst = Math.max(worst, Math.abs(wav.samples[i] - x[i]));
  assert.ok(worst <= 1 / 32767 + 1e-6, 'max error ' + worst);
  const sp = K.spectrum(wav.samples, rate, { n: 1024, bands: 32, lo: 40, hi: 8000 });
  assert.ok(Math.abs(sp.peakHz - 1000) < 40, 'peak ' + sp.peakHz);
  const silent = K.spectrum(new Float32Array(2048), rate, {});
  assert.equal(silent.silent, true); assert.equal(silent.rmsDbfs, null);
});

test('readKeys keeps times only, stops on ctrl+c, and restores the stream exactly', async () => {
  const s = new EventEmitter();
  const modes = [];
  Object.assign(s, { isTTY: true, isRaw: false, readableFlowing: null, setRawMode(v) { this.isRaw = v; modes.push(v); return this; }, resume() { this.readableFlowing = true; return this; }, pause() { this.readableFlowing = false; return this; } });
  const p = touch.readKeys(s, 5000);
  s.emit('data', Buffer.from('a'));
  s.emit('data', Buffer.from('b'));
  s.emit('data', Buffer.from([3]));
  const r = await p;
  assert.equal(r.keys, 2); assert.equal(r.times.length, 2); assert.equal(r.bytes, 3);
  assert.ok(!('text' in r) && !JSON.stringify(r).includes('"a"'), 'no key identity is kept');
  assert.deepEqual(modes, [true, false], 'raw on, then back off');
  assert.equal(s.isRaw, false); assert.equal(s.readableFlowing, false); assert.equal(s.listenerCount('data'), 0);
});

// ---------------------------------------------------------------- files
test('every fixture matches its SOURCES.md line (sha256 prefix, bytes) and a CC0 LICENSE sits beside it', () => {
  const sources = readFileSync(path.join(FIX, 'SOURCES.md'), 'utf8');
  assert.match(readFileSync(path.join(FIX, 'LICENSE'), 'utf8'), /CC0 1\.0/);
  for (const f of ['odorants.csv', 'tastants.csv', 'sight.png', 'hearing.wav', 'touch.json']) {
    const buf = readFileSync(path.join(FIX, f));
    const line = sources.split('\n').find((l) => l.startsWith('- `' + f + '`'));
    assert.ok(line, f + ' has a SOURCES.md line');
    assert.ok(line.includes('sha256 ' + createHash('sha256').update(buf).digest('hex').slice(0, 16)), f + ' sha256');
    assert.ok(line.includes('; ' + buf.length + ' bytes;'), f + ' bytes');
    assert.match(line, /licence CC0-1\.0/);
    assert.match(line, /url none/);
  }
  const header = (f) => readFileSync(path.join(FIX, f), 'utf8').split(/\r?\n/)[0];
  assert.equal(header('odorants.csv'), 'name,class,descriptors');
  assert.equal(header('tastants.csv'), 'name,class,qualities');
});

test('no em-dash in any file this item owns', () => {
  const files = [...RECEPTOR_FILES.map((f) => 'world/' + f), 'world/senses.mjs', 'bench/senses.mjs', 'test/senses.test.mjs', 'notes/senses.md', 'bench/fixtures/senses/SOURCES.md', 'bench/fixtures/senses/LICENSE', 'bench/fixtures/senses/odorants.csv', 'bench/fixtures/senses/tastants.csv'];
  for (const f of files) {
    let text;
    try { text = readFileSync(path.join(ROOT, f), 'utf8'); } catch { if (f === 'notes/senses.md') continue; throw new Error('missing ' + f); }
    assert.ok(!text.includes(String.fromCharCode(0x2014)), f + ' has an em-dash');
  }
});

// ---------------------------------------------------------------- nothing left open
test('nothing is left open: no child, socket, listener, watcher or timer survives the receptors', async () => {
  const brain = freshBrain();
  for (const name of RECEPTOR_NAMES) await feel(brain, name, { ...FIXTURE_OPTS[name], powershell: NOPE, stream: NOT_A_TTY });
  await touch.readKeys(Object.assign(new EventEmitter(), { isTTY: true, isRaw: false, readableFlowing: null, setRawMode() {}, resume() {}, pause() {} }), 10);
  closeWorld(brain);
  await turn(); await turn();
  const left = process.getActiveResourcesInfo();
  const bad = left.filter((h) => /Process|TCP|UDP|Pipe(Server)?Wrap|FSEvent|StatWatcher|Timeout|Immediate/.test(h) && h !== 'PipeWrap');
  assert.deepEqual(bad, [], 'left open: ' + left.join(', '));
});
