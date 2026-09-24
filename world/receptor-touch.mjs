// world/receptor-touch.mjs: TOUCH. What a desktop can feel of the hand on it: where the pointer
// is and how fast it moves (System.Windows.Forms.Cursor polled from PowerShell at a declared
// interval, with a Stopwatch stamp on every reading), whether a button is held (the contact),
// how long since ANY input arrived (user32 GetLastInputInfo, which reports a time and nothing
// about which key), and the rhythm of keystrokes read through stdin in raw mode when stdin is
// a terminal. A keystroke is kept as a TIME and a byte count only; which key it was is
// dropped at the door, so this receptor cannot become a key logger. Key pressure on a
// keyboard without force sensors is only ever timing, and timing is what is encoded.
// A recorded trace (bench/fixtures/senses/touch.json) is the fallback.
//
// The code: nine role-bound terms: pointer x and y on a 16 level code across the virtual
// screen, mean and peak speed on a log level code (1 to 10,000 px/s), the direction of the
// net movement (eight compass bins or still), contact (a button held at any reading), the
// idle time on a log code (1 ms to about 3 hours), the keystroke count, and the mean gap
// between keystrokes on a log code.
import { readFileSync } from 'node:fs';
import { Acc, fixture, key, lastJson, levelOf, levels, perceptSignal, powershell, probeHost, rel, round } from './receptor-kit.mjs';

export const name = 'touch';
export const LEVELS = 16;
export const FIXTURE = fixture('touch.json');

function pollScript(n, intervalMs) {
  const N = Math.max(2, Math.min(1000, Math.round(Number(n) || 20)));
  const I = Math.max(1, Math.min(1000, Math.round(Number(intervalMs) || 25)));
  return `
$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue'
$sw = [Diagnostics.Stopwatch]::StartNew()
try {
  Add-Type -MemberDefinition '[DllImport("user32.dll")] public static extern bool SetProcessDPIAware(); [StructLayout(LayoutKind.Sequential)] public struct LII { public uint cbSize; public uint dwTime; } [DllImport("user32.dll")] public static extern bool GetLastInputInfo(ref LII p);' -Name Hand -Namespace BrainTouch
  [void][BrainTouch.Hand]::SetProcessDPIAware()
  Add-Type -AssemblyName System.Windows.Forms
  $inv = [Globalization.CultureInfo]::InvariantCulture
  $v = [System.Windows.Forms.SystemInformation]::VirtualScreen
  $l = New-Object BrainTouch.Hand+LII; $l.cbSize = 8
  $idle = -1; if ([BrainTouch.Hand]::GetLastInputInfo([ref]$l)) { $now = [long][Environment]::TickCount; if ($now -lt 0) { $now += 4294967296 }; $idle = $now - [long]$l.dwTime; if ($idle -lt 0) { $idle += 4294967296 } }
  $pts = New-Object System.Collections.Generic.List[string]
  $t0 = $sw.Elapsed.TotalMilliseconds
  for ($i = 0; $i -lt ${N}; $i++) {
    $p = [System.Windows.Forms.Cursor]::Position
    $pts.Add(([math]::Round($sw.Elapsed.TotalMilliseconds - $t0, 3)).ToString($inv) + ',' + $p.X + ',' + $p.Y + ',' + [int][System.Windows.Forms.Control]::MouseButtons)
    if ($i -lt ${N - 1}) { Start-Sleep -Milliseconds ${I} }
  }
  [Console]::Out.Write('{"ok":true,"x0":' + $v.X + ',"y0":' + $v.Y + ',"w":' + $v.Width + ',"h":' + $v.Height + ',"idleMs":' + $idle + ',"intervalMs":${I},"pts":"' + ($pts -join ';') + '","psMs":' + [math]::Round($sw.Elapsed.TotalMilliseconds, 3).ToString($inv) + '}')
} catch { [Console]::Out.Write('{"ok":false,"error":' + (ConvertTo-Json ([string]$_.Exception.Message)) + '}') }
`;
}

/** Is there a pointer, a keyboard, and can keys be read here? */
export async function probe(opts = {}) {
  const stream = opts.stream || process.stdin;
  const tty = !!(stream && stream.isTTY && typeof stream.setRawMode === 'function');
  const host = await probeHost({ exe: opts.powershell, fresh: !!opts.fresh });
  if (!host.ok) return { sense: name, present: tty, how: 'no PowerShell route to the pointer: ' + host.reason + '; keys readable through stdin raw mode: ' + tty, ms: round(host.ms), mouse: false, keyboards: 0, tty };
  const kb = (host.keyboards || []).length, mice = (host.mice || []).length;
  return {
    sense: name, present: !!host.mouse || kb > 0 || tty, ms: round(host.ms), mouse: !!host.mouse, mice, keyboards: kb, tty, idleMs: host.idleMs ?? null,
    how: 'System.Windows.Forms.SystemInformation.MousePresent = ' + !!host.mouse + '; Plug and Play Mouse class = ' + mice + ', Keyboard class = ' + kb + '; keys readable through stdin raw mode: ' + tty + (tty ? '' : ' (stdin is not a TTY)'),
  };
}

/**
 * Read keystroke TIMES from a TTY stream in raw mode for windowMs, then restore the mode the
 * stream had and stop reading, so the process is left exactly as it was found.
 * @returns {Promise<{keys: number, times: number[], bytes: number, windowMs: number}>}
 */
export function readKeys(stream, windowMs) {
  return new Promise((resolve) => {
    const times = [], t0 = performance.now();
    let bytes = 0;
    const wasRaw = !!stream.isRaw, wasFlowing = stream.readableFlowing === true; // a fresh stdin is null (never flowed): it must be paused again after, or its handle keeps the process alive
    const onData = (chunk) => {
      const now = performance.now() - t0;
      const b = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
      bytes += b.length;
      if (b.length === 1 && b[0] === 3) { finish(); return; } // ctrl+c ends the window, it is not a keystroke
      times.push(round(now));
    };
    let timer = null, done = false;
    const finish = () => {
      if (done) return;
      done = true;
      if (timer) clearTimeout(timer);
      stream.removeListener('data', onData);
      try { stream.setRawMode(wasRaw); } catch { /* a stream that cannot go back has no mode to restore */ }
      if (!wasFlowing && typeof stream.pause === 'function') stream.pause();
      resolve({ keys: times.length, times, bytes, windowMs: round(performance.now() - t0) });
    };
    try { stream.setRawMode(true); } catch { finish(); return; }
    stream.on('data', onData);
    if (typeof stream.resume === 'function') stream.resume();
    timer = setTimeout(finish, Math.max(0, Number(windowMs) || 0));
  });
}

/**
 * Read one touch sample. source 'auto' (default) polls the pointer when the probe found one
 * (opts.n readings, opts.intervalMs apart) and reads keystroke times for opts.keysMs when
 * stdin is a TTY; 'fixture' or a path to a trace JSON reads that file.
 */
export async function sample(opts = {}) {
  const source = opts.source ?? 'auto';
  let fallback = null;
  if (source === 'auto' || source === 'live') {
    const pr = opts.probe || await probe(opts);
    const trace = { pointer: null, keys: null };
    const t0 = performance.now();
    if (pr.mouse) {
      const r = await powershell(pollScript(opts.n ?? 20, opts.intervalMs ?? 25), { exe: opts.powershell, timeoutMs: opts.timeoutMs ?? 30000 });
      let j = null;
      if (r.ok) { try { j = lastJson(r.out); } catch (e) { fallback = 'the pointer poll printed no JSON: ' + String(e.message).slice(0, 80); } }
      else fallback = r.reason;
      if (j && j.ok) {
        const pts = String(j.pts).split(';').filter(Boolean).map((p) => p.split(',').map(Number));
        trace.pointer = { x0: j.x0, y0: j.y0, w: j.w, h: j.h, intervalMs: j.intervalMs, idleMs: j.idleMs, pts, psMs: j.psMs };
      } else if (j) fallback = 'the pointer poll failed: ' + j.error;
    }
    const stream = opts.stream || process.stdin;
    if (pr.tty && Number(opts.keysMs) > 0) trace.keys = await readKeys(stream, opts.keysMs);
    if (trace.pointer || trace.keys) {
      const bytes = Buffer.from(JSON.stringify(trace));
      return { sense: name, source: [trace.pointer ? 'pointer' : null, trace.keys ? 'keys' : null].filter(Boolean).join('+'), hardware: true, bytes, latencyMs: round(performance.now() - t0), encoding: 'touch-trace-json', readings: trace.pointer ? trace.pointer.pts.length : 0, keys: trace.keys ? trace.keys.keys : null, fallback };
    }
    if (!fallback) fallback = 'no pointer and no TTY: ' + pr.how;
    if (source === 'live') return { sense: name, source: 'live', hardware: false, bytes: Buffer.alloc(0), latencyMs: 0, encoding: 'touch-trace-json', fallback };
  }
  const file = source === 'auto' || source === 'fixture' ? FIXTURE : source;
  const t0 = performance.now();
  const bytes = readFileSync(file);
  const j = JSON.parse(bytes.toString('utf8'));
  return { sense: name, source: 'file:' + rel(file), hardware: false, bytes, latencyMs: round(performance.now() - t0), encoding: 'touch-trace-json', readings: j.pointer ? j.pointer.pts.length : 0, keys: j.keys ? j.keys.keys : null, fallback };
}

const DIRS = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'];
const log10p = (x) => Math.log10(1 + Math.max(0, x));

/** The features of a trace, computed from its bytes alone. */
export function features(trace) {
  const p = trace.pointer, k = trace.keys;
  const f = { x: null, y: null, meanSpeed: 0, peakSpeed: 0, direction: 'still', contact: false, idleMs: null, keys: k ? k.keys : 0, meanGapMs: null, readings: p ? p.pts.length : 0 };
  if (p && p.pts.length) {
    const last = p.pts[p.pts.length - 1];
    f.x = (last[1] - p.x0) / (p.w || 1); f.y = (last[2] - p.y0) / (p.h || 1);
    let dist = 0, span = 0;
    for (let i = 1; i < p.pts.length; i++) {
      const a = p.pts[i - 1], b = p.pts[i], dt = (b[0] - a[0]) / 1000, d = Math.hypot(b[1] - a[1], b[2] - a[2]);
      if (dt > 0) f.peakSpeed = Math.max(f.peakSpeed, d / dt);
      dist += d; span += Math.max(0, dt);
    }
    f.meanSpeed = span > 0 ? dist / span : 0;
    const dx = last[1] - p.pts[0][1], dy = last[2] - p.pts[0][2];
    if (Math.hypot(dx, dy) >= 2) f.direction = DIRS[((Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) % 8) + 8) % 8];
    f.contact = p.pts.some((q) => q[3] !== 0);
    f.idleMs = Number.isFinite(p.idleMs) && p.idleMs >= 0 ? p.idleMs : null;
  }
  if (k && k.times && k.times.length > 1) {
    let g = 0;
    for (let i = 1; i < k.times.length; i++) g += k.times[i] - k.times[i - 1];
    f.meanGapMs = g / (k.times.length - 1);
  }
  f.meanSpeed = round(f.meanSpeed, 2); f.peakSpeed = round(f.peakSpeed, 2); f.x = round(f.x, 4); f.y = round(f.y, 4); f.meanGapMs = round(f.meanGapMs, 2);
  return f;
}

/** A trace (the JSON bytes of a sample) to a percept: position, velocity, contact, timing; provenance sense:touch. */
export function encode(s, opts = {}) {
  const t0 = performance.now();
  const trace = JSON.parse(Buffer.from(s.bytes).toString('utf8'));
  const f = features(trace), L = opts.levels || LEVELS;
  const acc = new Acc();
  acc.bind(key('touch:x'), levels('touch:x', L)[f.x === null ? 0 : levelOf(f.x, 0, 1, L)]);
  acc.bind(key('touch:y'), levels('touch:y', L)[f.y === null ? 0 : levelOf(f.y, 0, 1, L)]);
  acc.bind(key('touch:speed:mean'), levels('touch:speed', L)[levelOf(log10p(f.meanSpeed), 0, 4, L)]);
  acc.bind(key('touch:speed:peak'), levels('touch:speed', L)[levelOf(log10p(f.peakSpeed), 0, 4, L)]);
  acc.bind(key('touch:direction'), key('touch:direction:' + f.direction));
  acc.bind(key('touch:contact'), key('touch:contact:' + (f.contact ? 'held' : 'none')));
  acc.bind(key('touch:idle'), levels('touch:idle', L)[f.idleMs === null ? 0 : levelOf(log10p(f.idleMs), 0, 7, L)]);
  acc.bind(key('touch:keys'), levels('touch:keys', L)[levelOf(log10p(f.keys), 0, 3, L)]);
  acc.bind(key('touch:gap'), levels('touch:gap', L)[f.meanGapMs === null ? 0 : levelOf(log10p(f.meanGapMs), 0, 4, L)]);
  return perceptSignal(name, acc.sign(), {
    code: 'nine role-bound terms: pointer x and y (' + L + ' levels), mean and peak speed (log, ' + L + ' levels), net direction (8 bins or still), contact, idle time (log), keystroke count (log), mean keystroke gap (log)',
    features: { ...f, encodeMs: round(performance.now() - t0) },
  });
}
