# P12: five senses

His words (2026-09-23): "It also should be able to feel five senses." MANUAL.md section B, P12: five typed receptors into the perception region, each printing hardware present or not, samples, bytes, latency, and the perception cell that fired. Senses only: no actuator without the gate.

## What landed

Five receptors, one contract (world/receptor-kit.mjs):

- `probe()` says whether this machine has the hardware and how that was found out.
- `sample()` reads one sample and returns `{ bytes, latencyMs, encoding, hardware, source }`.
- `encode()` returns a percept: an 8192 lane bipolar hypervector with provenance `sense:<name>`.

| sense | hardware path | fallback | code |
| --- | --- | --- | --- |
| sight | the screen, read through PowerShell and .NET System.Drawing (CopyFromScreen into a Bitmap, then PNG into memory and base64 on stdout). The process is DPI aware first, so a scaled 4K panel reads at 3840x2160. A camera is probed through Media Foundation (MFEnumDeviceSources, video capture) and the Plug and Play Camera and Image classes, and never opened. | any PNG (fixture sight.png) | 16x9 grid of mean RGB, 16 levels a channel, bound to the cell's position key |
| hearing | the microphone, found two ways (WinMM waveInGetNumDevs and Media Foundation audio capture) and read through the WinMM MCI string interface. The clip goes to a temp WAV that is deleted in the same `finally`. | any WAV (fixture hearing.wav) | Hann windowed FFT, 32 log bands from 40 Hz to 8 kHz, each band's level against the loudest over 60 dB, plus loudness in dBFS |
| touch | the pointer, polled through System.Windows.Forms.Cursor (20 readings 25 ms apart), plus the time since the last input from GetLastInputInfo. Keystroke TIMES come through stdin raw mode when stdin is a terminal; the key identity is never kept. | a trace JSON (fixture touch.json) | nine role-bound terms: x, y, mean and peak speed, direction, contact, idle, key count, key gap |
| smell | none exists. A Plug and Play scan of every device looks for a gas, VOC, olfactory, e-nose, odour, taste or CO2 name, and counts the Sensor class. | odorants.csv (87 compounds: class and odour descriptors) | bundle of descriptor keys, class bound to a class role, and the compound identity; a mixture bundles every compound |
| taste | the same scan | tastants.csv (55 compounds: class and qualities, the five basic tastes plus fat, kokumi, pungent, cooling, astringent and two modifiers) | the same shape as smell |

The percept is majority(K, C, K bound to the rolled C). K is the modality key `hvFromSeed('sense:<name>')` and C is the content code. The result keeps about 0.5 similarity to each of K and C, so any cell that knows the key can read the modality back, and content still compares with content. Plain K bound to C would bias every lane toward -1.

world/senses.mjs adds the `sense.receptor` kind, `attachReceptors(brain)` and `feel(brain, name, opts)`. Each sense gets two cells:

- the receptor `w.<name>` (world region, senses circuit), whose `hv` port feeds a decode.hv perception cell and whose `out` event feeds the border `w.percept`;
- the perception cell `w.feel.<name>` (perception region). Its codebook is the five modality keys, so what it fires is the sense it felt, read out of the lanes.

`feel()` probes, samples and encodes, queues the percept on the receptor, then ticks until the ledger shows the whole chain:

1. a `world.sense` event with this percept's hash;
2. the receptor run;
3. the hv signal that run emitted;
4. the perception run that consumed it;
5. that run's output.

## Measured (node bench/senses.mjs, 2026-09-23T21:43:55.402Z, bench/verdicts/senses.json, isTheBar true)

Three samples per sense, node v24.15.0, win32. Stdin was not a terminal, so no keystrokes were read.

- **sight:** hardware present, 1 screen (3840x2160 primary). Camera absent: Media Foundation 0, Plug and Play Camera or Image 0. 3 of 3 samples from the screen, 10827548 bytes each, latency 663.056 / 680.104 / 679.207 ms (mean 674.122). w.feel.sight fired at ticks 1, 3, 5, naming sense:sight at sim 0.5229.
- **hearing:** hardware absent (waveInGetNumDevs 0, Media Foundation audio capture 0, microphone endpoints 0). 3 of 3 samples from the fixture, 16044 bytes each, mean latency 0.607 ms. w.feel.hearing fired at ticks 7, 9, 11, naming sense:hearing at 0.4866. Peak 437.5 Hz for the 440 Hz fixture.
- **touch:** hardware present (MousePresent true, Plug and Play Mouse 4, Keyboard 3). 3 of 3 pointer samples, 549 / 546 / 547 bytes, mean latency 929.912 ms. w.feel.touch fired at ticks 13, 15, 17, naming sense:touch at 0.4897.
- **smell:** hardware absent (196 Plug and Play devices, none chemical, Sensor class 0). Table odorants.csv, 87 rows loaded. 3 of 3 samples, mean latency 0.014 ms. w.feel.smell fired at ticks 19, 21, 23, naming sense:smell.
- **taste:** hardware absent (the same scan). Table tastants.csv, 55 rows loaded. 3 of 3 samples, mean latency 0.008 ms. w.feel.taste fired at ticks 25, 27, 29, naming sense:taste.
- **Nothing actuated:** gate proposals 0, world.act proposals 0, edges into motor 0, actuator cells 0 besides the two world.relay border cells. The ledger holds world.sense 15 and cell.run 225. Handles left after the run: none. Wall 6072.684 ms.

The three screen frames encoded to one percept hash (53735d6b). So did the three pointer traces (c0110b05). The last trace read the pointer as still, with idleMs 1499469: nobody was at the machine, so the screen and the pointer did not change. The samples are real reads of a still scene, not repeats of one read. Each one has its own latency, and the ledger holds 15 world.sense events.

node --test test/senses.test.mjs: 11 of 11 pass. They cover:

- every receptor's fixture to a bipolar 8192 lane percept with provenance;
- codes that mean something (vanillin near ethyl vanillin, far from hydrogen sulfide; sucrose nearer glucose than quinine; 440 Hz nearer 446 than 1760; a frame nearer itself brightened than its negative);
- the ledger chain for all five;
- no-hardware probes that say why and never throw;
- no proposal, no motor edge, and no actuating call in any receptor source;
- the PNG decoder on all five filters, the WAV round trip, and readKeys restoring the stream;
- fixtures against SOURCES.md, and no em-dash;
- no handle left.

A control for the last test showed that the handle census catches a live child (ProcessWrap) and a pending Timeout. test/world.test.mjs stays green, 28 of 28.

## Deviations, stated

- **Layout.** The item asked for world/receptors/. test/world.test.mjs line 450 reads every entry of world/ with readFileSync to look for em-dashes, and a directory there throws EISDIR. That test is not mine to edit, so the receptors are flat files instead: world/receptor-kit.mjs and world/receptor-{sight,hearing,touch,smell,taste}.mjs. `sense.receptor` is its own list (RECEPTOR_KINDS), not a SENSE_KINDS entry, so the world census stays at the 13 that test pins.
- **Authority.** A receptor cell never reaches the world. feel() is called by the operator, as brain.inject() is, and what it does is a read. A world.sense event with `from: null` records every sample, so no proposal is claimed that does not exist. The stream senses (sense.poll, sense.watch, sense.stdin) still open through the gate, unchanged.
- **Privacy.** No capture is written anywhere. A screen frame lives in memory for one encode. A microphone clip's temp file is deleted in a `finally`. The verdict keeps sizes, timings, features (mean luma, pointer x and y) and a hash of the percept.

## Next rungs

1. **A real chemical table.** An open olfaction set (the pyrfume archive's Leffingwell or DREAM sets) would replace the 87 hand-authored rows. Downloading one needs his explicit yes, and the file lands under bench/fixtures/senses with a LICENSE and a SOURCES.md line. The receptor reads any CSV with the columns name, class, descriptors.
2. **Hearing without a microphone.** WASAPI loopback would give hearing what the machine plays.
3. **A camera frame.** Only with his consent, and only once a camera exists (Media Foundation counts 0 today).
4. **Keystroke timing.** A run from a real terminal (`node bench/senses.mjs --keys-ms 3000`) would include keystroke timing in touch.
