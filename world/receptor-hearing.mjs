// world/receptor-hearing.mjs: HEARING. A microphone is found two independent ways (WinMM
// waveInGetNumDevs, and Media Foundation MFEnumDeviceSources with the audio capture source
// type), and read through WinMM's MCI string interface from a small PowerShell script: open a
// waveaudio device, record for a declared window, save to a temporary WAV, close. The file is
// read here and deleted in the same breath, so no recording outlives the sample. A WAV file is
// the fallback when there is no microphone, which is the case on a desktop without one.
//
// The code: the samples are cut into Hann windowed frames, the power spectrum is averaged
// over frames and summed into 32 log-spaced bands from 40 Hz to 8 kHz (or Nyquist), each
// band's level relative to the loudest band is put on a 16 level code over 60 dB and bound
// to the band's key, and the overall loudness (RMS in dBFS over 90 dB) is one more term. A
// tone and the same tone slightly detuned share most of their lanes; a tone two octaves away
// shares far fewer.
import { readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Acc, decodeWav, fixture, key, lastJson, levelOf, levels, perceptSignal, powershell, probeHost, rel, round, spectrum } from './receptor-kit.mjs';

export const name = 'hearing';
export const BANDS = 32;
export const LEVELS = 16;
export const FIXTURE = fixture('hearing.wav');

// The MCI script is built from two numbers and one path this module chose, nothing else.
function recordScript(ms, file) {
  const safe = String(file).replace(/'/g, "''");
  return `
$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue'
$sw = [Diagnostics.Stopwatch]::StartNew()
try {
  Add-Type -MemberDefinition '[DllImport("winmm.dll", CharSet = CharSet.Unicode)] public static extern int mciSendStringW(string cmd, System.Text.StringBuilder ret, int len, IntPtr cb); [DllImport("winmm.dll", CharSet = CharSet.Unicode)] public static extern bool mciGetErrorStringW(int err, System.Text.StringBuilder buf, int len);' -Name Mci -Namespace BrainHearing
  $buf = New-Object System.Text.StringBuilder 256
  $steps = New-Object System.Collections.Generic.List[string]
  $state = @{ failed = $null }
  function Say($c) { $rc = [BrainHearing.Mci]::mciSendStringW($c, $buf, 256, [IntPtr]::Zero); $e = New-Object System.Text.StringBuilder 256; [void][BrainHearing.Mci]::mciGetErrorStringW($rc, $e, 256); $steps.Add($c.Split(' ')[0] + '=' + $rc); if ($rc -ne 0 -and -not $state.failed) { $state.failed = $c.Split(' ')[0] + ': ' + $e.ToString() }; return $rc }
  [void](Say 'open new type waveaudio alias brainhear')
  [void](Say 'set brainhear bitspersample 16 channels 1 samplespersec 16000 bytespersec 32000 alignment 2')
  $t0 = $sw.Elapsed.TotalMilliseconds
  if ((Say 'record brainhear') -eq 0) { Start-Sleep -Milliseconds ${Math.max(50, Math.round(Number(ms) || 1000))}; [void](Say 'stop brainhear'); [void](Say ('save brainhear "' + '${safe}' + '"')) }
  $rec = $sw.Elapsed.TotalMilliseconds - $t0
  [void](Say 'close brainhear')
  [Console]::Out.Write((@{ ok = (-not $state.failed); failed = $state.failed; steps = ($steps -join ' '); recordMs = [math]::Round($rec, 3); psMs = [math]::Round($sw.Elapsed.TotalMilliseconds, 3) } | ConvertTo-Json -Compress))
} catch { [Console]::Out.Write('{"ok":false,"failed":' + (ConvertTo-Json ([string]$_.Exception.Message)) + '}') }
`;
}

/** Is there a microphone? Two independent Windows APIs are asked, and both answers are kept. */
export async function probe(opts = {}) {
  const host = await probeHost({ exe: opts.powershell, fresh: !!opts.fresh });
  if (!host.ok) return { sense: name, present: false, how: 'no PowerShell route to an audio device: ' + host.reason, ms: round(host.ms), devices: 0 };
  const wave = Number(host.waveIn), mf = Number(host.mfAudio), eps = host.micEndpoints || [];
  const devices = Math.max(0, wave, mf);
  return {
    sense: name, present: devices > 0, ms: round(host.ms), devices,
    how: 'WinMM waveInGetNumDevs = ' + (wave >= 0 ? wave : 'error ' + wave) + '; Media Foundation MFEnumDeviceSources(audio capture) = ' + (mf >= 0 ? mf : 'error ' + mf) + '; Plug and Play microphone endpoints = ' + eps.length,
  };
}

/**
 * Read one clip. source 'auto' (default) records opts.ms (1000) from the microphone when the
 * probe found one and falls back to the fixture otherwise; 'mic' records or reports why not;
 * 'fixture' or a path to a WAV reads that file.
 */
export async function sample(opts = {}) {
  const source = opts.source ?? 'auto';
  let fallback = null;
  if (source === 'auto' || source === 'mic') {
    const pr = opts.probe || await probe(opts);
    if (pr.present) {
      const file = path.join(opts.tmp || tmpdir(), 'brain-hear-' + process.pid + '-' + Date.now() + '-' + Math.floor(Math.random() * 1e6) + '.wav');
      const ms = opts.ms ?? 1000;
      try {
        const r = await powershell(recordScript(ms, file), { exe: opts.powershell, timeoutMs: (opts.timeoutMs ?? 20000) + ms });
        let j = null;
        if (r.ok) { try { j = lastJson(r.out); } catch (e) { fallback = 'the recorder printed no JSON: ' + String(e.message).slice(0, 80); } }
        else fallback = r.reason;
        if (j && j.ok) {
          const bytes = readFileSync(file);
          return { sense: name, source: 'microphone', hardware: true, bytes, latencyMs: round(r.ms), encoding: 'wav', windowMs: ms, recordMs: j.recordMs, psMs: j.psMs, steps: j.steps };
        }
        if (j && !j.ok) fallback = 'the microphone did not record: ' + j.failed + (j.steps ? ' (' + j.steps + ')' : '');
      } finally {
        rmSync(file, { force: true });
      }
    } else fallback = 'no microphone: ' + pr.how;
    if (source === 'mic') return { sense: name, source: 'microphone', hardware: false, bytes: Buffer.alloc(0), latencyMs: 0, encoding: 'wav', fallback };
  }
  const file = source === 'auto' || source === 'fixture' ? FIXTURE : source;
  const t0 = performance.now();
  const bytes = readFileSync(file);
  return { sense: name, source: 'file:' + rel(file), hardware: false, bytes, latencyMs: round(performance.now() - t0), encoding: 'wav', fallback };
}

/** A clip (the WAV bytes of a sample) to a percept: the band spectrum code, provenance sense:hearing. */
export function encode(s, opts = {}) {
  const t0 = performance.now();
  const wav = decodeWav(s.bytes);
  const B = opts.bands || BANDS, L = opts.levels || LEVELS;
  const sp = spectrum(wav.samples, wav.rate, { n: 1024, bands: B, lo: 40, hi: Math.min(8000, wav.rate / 2) });
  const finite = sp.bandsDb.filter((x) => x !== null);
  const top = finite.length ? Math.max(...finite) : 0;
  const BL = levels('hearing:band', L), LL = levels('hearing:loudness', L);
  const acc = new Acc();
  for (let b = 0; b < B; b++) {
    const db = sp.bandsDb[b];
    acc.bind(key('hearing:band:' + B + ':' + b), BL[db === null ? 0 : levelOf(db - top, -60, 0, L)]);
  }
  acc.bind(key('hearing:loudness'), LL[sp.rmsDbfs === null ? 0 : levelOf(sp.rmsDbfs, -90, 0, L)]);
  return perceptSignal(name, acc.sign(), {
    code: B + ' log-spaced bands, 40 Hz to ' + Math.round(Math.min(8000, wav.rate / 2)) + ' Hz, level relative to the loudest band on ' + L + ' levels over 60 dB, bound to the band key; plus loudness on ' + L + ' levels over 90 dBFS',
    features: { rate: wav.rate, channels: wav.channels, bits: wav.bits, seconds: round(wav.samples.length / wav.rate, 3), frames: sp.frames, rmsDbfs: sp.rmsDbfs, peakHz: sp.peakHz, centroidHz: sp.centroidHz, silent: sp.silent, encodeMs: round(performance.now() - t0) },
  });
}
