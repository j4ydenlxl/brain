// world/receptor-sight.mjs: SIGHT. The screen is this machine's retina: a frame is read through
// PowerShell and .NET System.Drawing (Graphics.CopyFromScreen into a Bitmap, saved as PNG into
// memory and handed over as base64 on stdout, so the frame never touches the disk), decoded
// here with node:zlib, and encoded as a coarse grid of colours. An image file is the fallback
// when there is no screen to read. A camera is PROBED through Windows Media Foundation
// (MFEnumDeviceSources with the video capture source type) and through the Plug and Play
// Camera and Image classes; a frame is never taken from it, because turning a camera on is
// not something a probe should do.
//
// The code: the frame is cut into a GW x GH grid (16 x 9 by default, the shape of the
// screen), each cell's mean red, green and blue is put on a 16 level code per channel, the
// three levels are read as one filler by majority, and the filler is bound to the cell's
// position key. The frame is the bundle of every cell. Two frames that share most of their
// colours at most of their positions share most of their lanes.
import { readFileSync } from 'node:fs';
import { Acc, decodePng, fixture, gridMeans, key, levelOf, levels, lastJson, perceptSignal, powershell, probeHost, rel, round } from './receptor-kit.mjs';

export const name = 'sight';
export const GRID = Object.freeze([16, 9]);
export const LEVELS = 16;
export const FIXTURE = fixture('sight.png');

// DPI awareness first, before anything reads a bound: otherwise a scaled panel is captured
// at its logical size and the frame is the top left part of the real one.
const CAPTURE_PS = `
$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue'
$sw = [Diagnostics.Stopwatch]::StartNew()
try {
  Add-Type -MemberDefinition '[DllImport("user32.dll")] public static extern bool SetProcessDPIAware();' -Name Dpi -Namespace BrainSight
  [void][BrainSight.Dpi]::SetProcessDPIAware()
  Add-Type -AssemblyName System.Windows.Forms, System.Drawing
  $b = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
  $t0 = $sw.Elapsed.TotalMilliseconds
  $bmp = New-Object System.Drawing.Bitmap $b.Width, $b.Height
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.CopyFromScreen($b.Location, [System.Drawing.Point]::Empty, $b.Size)
  $ms = New-Object System.IO.MemoryStream
  $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
  $cap = $sw.Elapsed.TotalMilliseconds - $t0
  [Console]::Out.Write('{"ok":true,"w":' + $b.Width + ',"h":' + $b.Height + ',"captureMs":' + [math]::Round($cap, 3).ToString([Globalization.CultureInfo]::InvariantCulture) + ',"psMs":' + [math]::Round($sw.Elapsed.TotalMilliseconds, 3).ToString([Globalization.CultureInfo]::InvariantCulture) + ',"png":"' + [Convert]::ToBase64String($ms.ToArray()) + '"}')
} catch { [Console]::Out.Write('{"ok":false,"error":' + (ConvertTo-Json ([string]$_.Exception.Message)) + '}') }
`;

/** Is there a screen to read, and a camera? Asked once per process through the host probe. */
export async function probe(opts = {}) {
  const host = await probeHost({ exe: opts.powershell, fresh: !!opts.fresh });
  if (!host.ok) {
    return { sense: name, present: false, how: 'no PowerShell route to the display: ' + host.reason, ms: round(host.ms), screens: [], camera: { present: false, count: 0, how: 'not probed: ' + host.reason } };
  }
  const screens = host.screens || [];
  const mf = Number(host.mfVideo), cams = host.cameras || [];
  return {
    sense: name, present: screens.length > 0, ms: round(host.ms), screens,
    how: 'PowerShell System.Windows.Forms.Screen.AllScreens, DPI aware: ' + screens.length + ' screen' + (screens.length === 1 ? '' : 's') + (screens.length ? ' (' + screens.map((s) => s.w + 'x' + s.h + (s.primary ? ' primary' : '')).join(', ') + ')' : ''),
    camera: {
      present: mf > 0 || cams.length > 0, count: Math.max(0, mf), pnp: cams.length,
      how: 'Media Foundation MFEnumDeviceSources(video capture) = ' + (mf >= 0 ? mf : 'error ' + mf) + '; Plug and Play Camera or Image class devices = ' + cams.length + ' (probed only: no frame is taken from a camera)',
    },
  };
}

/**
 * Read one frame. source 'auto' (default) reads the screen when the probe found one and falls
 * back to the fixture otherwise; 'screen' reads the screen or reports why not; 'fixture' or
 * a path to a PNG reads that file.
 */
export async function sample(opts = {}) {
  const source = opts.source ?? 'auto';
  let fallback = null;
  if (source === 'auto' || source === 'screen') {
    const pr = opts.probe || await probe(opts);
    if (pr.present) {
      const r = await powershell(CAPTURE_PS, { exe: opts.powershell, timeoutMs: opts.timeoutMs ?? 30000 });
      if (r.ok) {
        let j = null;
        try { j = lastJson(r.out); } catch (e) { fallback = 'the capture printed no JSON: ' + String(e.message).slice(0, 80); }
        if (j && j.ok) {
          const bytes = Buffer.from(j.png, 'base64');
          return { sense: name, source: 'screen', hardware: true, bytes, latencyMs: round(r.ms), encoding: 'png', width: j.w, height: j.h, captureMs: j.captureMs, psMs: j.psMs };
        }
        if (j && !j.ok) fallback = 'the screen capture failed: ' + j.error;
      } else fallback = r.reason;
    } else fallback = 'no screen: ' + pr.how;
    if (source === 'screen') return { sense: name, source: 'screen', hardware: false, bytes: Buffer.alloc(0), latencyMs: 0, encoding: 'png', fallback };
  }
  const file = source === 'auto' || source === 'fixture' ? FIXTURE : source;
  const t0 = performance.now();
  const bytes = readFileSync(file);
  return { sense: name, source: 'file:' + rel(file), hardware: false, bytes, latencyMs: round(performance.now() - t0), encoding: 'png', fallback };
}

/** A frame (the PNG bytes of a sample) to a percept: the colour grid code, provenance sense:sight. */
export function encode(s, opts = {}) {
  const t0 = performance.now();
  const img = decodePng(s.bytes);
  const [gw, gh] = opts.grid || GRID, L = opts.levels || LEVELS;
  const cells = gridMeans(img, gw, gh);
  const R = levels('sight:red', L), G = levels('sight:green', L), B = levels('sight:blue', L);
  const acc = new Acc();
  let luma = 0;
  for (let i = 0; i < gw * gh; i++) {
    const r = cells[i * 3], g = cells[i * 3 + 1], b = cells[i * 3 + 2];
    luma += 0.2126 * r + 0.7152 * g + 0.0722 * b;
    acc.bind3(key('sight:cell:' + gw + 'x' + gh + ':' + i), R[levelOf(r, 0, 255, L)], G[levelOf(g, 0, 255, L)], B[levelOf(b, 0, 255, L)]);
  }
  return perceptSignal(name, acc.sign(), {
    code: 'grid ' + gw + 'x' + gh + ' of mean RGB, ' + L + ' levels per channel, majority of the three bound to the cell position, bundled',
    features: { width: img.width, height: img.height, grid: gw + 'x' + gh, cells: gw * gh, meanLuma: round(luma / (gw * gh), 2), encodeMs: round(performance.now() - t0) },
  });
}
