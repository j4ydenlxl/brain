# notes/viz.md: the visualization (viz/ + test/viz.test.mjs)

Files written: `viz/server.mjs`, `viz/layout.mjs`, `viz/index.html`,
`viz/client/{gl,shaders,scene,data,hud,main}.js`, `test/viz.test.mjs`.
Nothing under `core/` was edited. `node --test test/viz.test.mjs` from the brain
directory: 14 pass, 0 fail.

## The static page (publishable with no server)

`captureSnapshot(brain, { frames, ticks, drive, layout })` freezes the whole window into
one JSON object: the graph exactly as `/api/graph` serves it, a summary, and a recording
of real batch frames folded by the same code the live stream uses. `writeStatic(brain,
dir, opts)` writes a directory holding `index.html`, `client/*.js` and `snapshot.json`,
which is a complete page: copy it to any static host (dilation.dev included) and the
brain renders and moves with no node process anywhere.

The page picks its own mode. `?snapshot=x.json` plays a named file; with no query string
it tries `/api/graph` first and falls back to `./snapshot.json` when there is no API
behind it, so the same `index.html` is both the live page and the published one. In
snapshot mode every path that would POST or fetch is disabled rather than failing.

Three things this required, each a trap:

- **The script tag must be document relative.** It was `src="/client/main.js"`; a root
  relative path resolves to the filesystem root from a `file://` URL and to the host root
  on a static host serving the page from a subdirectory. It is now `src="client/main.js"`,
  and the test asserts no `src="/"` anywhere in the page.
- **`ledger: 'full'` or there are no signals to see.** `core/brain.mjs` only logs
  `signal` events at ledger level `full`; at `'runs'` it logs `cell.run` alone. A brain
  built with `ledger: 'runs'` renders with flashing cells but no travelling pulses along
  the edges, because the ledger never mentioned a signal. Measured on the same 5,000 cell
  brain: `'runs'` recorded 568,353 runs and 0 signals; `'full'` recorded 453,153 runs and
  1,140,541 signals. Build demo brains with `full`.
- **Playback must cap its catch-up.** A recorded frame can carry thousands of signal
  entries, so replaying a backlog costs time proportional to the backlog, which makes the
  next frame later, which grows the backlog: one slow frame and the page settles at a few
  frames a second while the GPU is idle. `SnapshotPlayer.MAX_CATCHUP = 2`, and anything
  further behind is skipped and counted.

Size: a 5,000 cell, 42,850 edge brain with 160 recorded frames is a 10.9 MB
`snapshot.json`, built in 4.8 s. The graph itself is about 6 MB of that; frames are cheap
because they are folded. Fewer frames or a smaller brain scales it down linearly.

## Core change requested (measured, worked around, NOT applied)

`Brain.connect` is quadratic in the number of edges already present. Measured on this
machine by adding unique edges to one brain and timing the cumulative wall clock:

| unique edges | cumulative ms |
| --- | --- |
| 2,000 | 138 |
| 5,000 | 503 |
| 10,000 | 1,676 |
| 20,000 | 6,964 |

That is a clean 4x per doubling, so the 50,000 edges the visualization is specified to
render extrapolates to roughly 43 seconds of pure wiring time. The cost is not in the
connectome's typed arrays; it is that every `connect` rescans work proportional to the
current edge count (duplicate detection and the adjacency index), so wiring N edges
costs O(N^2).

**The change I would like in core**: a batched wiring path, for example
`brain.connectMany(list)` that validates and appends every edge and then rebuilds the
adjacency index exactly once, or an incremental index that appends in O(1) and only
re-sorts when a prune leaves the arrays dirty. Either makes a 50,000 edge brain wire in
well under a second.

**Workaround in use**: nothing in the shipped viz files depends on `connect`. The
server reads `brain.connectome` directly, and the large demo brains I built for
benchmarking call `brain.connectome.add(srcIdx, dstIdx, {...})` after resolving ports
with `brain.compatiblePorts`, which bypasses the quadratic path entirely. A 5,000 cell
brain with 42,850 edges wires in a few hundred milliseconds that way. If you ever wire a
demo with `connect` in a loop and it seems to hang, this is why.

Two smaller core observations, neither needing a change:

- I suspected delay-0 edges were never delivered (a signal scheduled for the current
  tick can never be read again). It is not a bug: `core/brain.mjs` schedules delivery at
  `this.clock.t + 1 + this.connectome.delay[e]`, so the minimum latency is one tick and
  `delay = 0` means "next tick". Verified empirically, not just by reading.
- `ledger.on(fn)` is the only hook the viz needs. It is synchronous, so the listener
  runs inside `tick`. The server therefore does zero work in the listener beyond
  incrementing counters in typed arrays; all JSON is built on the 50 ms flush timer.

## startViz contract, for whoever wires the CLI

```js
const viz = startViz(brain, { port: 0, host: '127.0.0.1' });
await viz.ready;          // required when port is 0, the OS has not assigned one yet
console.log(viz.url);     // getter, not a snapshot
await viz.close();        // returns a promise, idempotent, frees the port
```

`url` and `port` are **getters**, because with `port: 0` they are unknown until the
listen callback fires. Reading `viz.url` synchronously right after `startViz` gives
port 0. Always `await viz.ready` first. `close()` calls `server.closeAllConnections()`
so an open SSE stream cannot hold the process alive; the test asserts the port really
refuses connections afterwards.

Conventions the page already supports, if `bin/brain.mjs` wants to expose them:

- `?synthetic=5000` builds a fake brain of that size entirely client side (no server
  data) for the performance demo.
- `?bench=1` runs the GPU benchmark on load and prints ms/frame and fps into the HUD.
- Keys: space pauses the render, `r` re-lays out, `a` toggles auto drive (inject plus
  tick on a timer), `i` injects once, `t` ticks 100, `h` hides the HUD, Escape
  deselects. A `?drive=1` query string would be the natural CLI equivalent of `a`.

## Findings worth keeping

**The SSE backpressure trap.** The first backpressure rule skipped a frame whenever
`res.write()` returned false. That is wrong, and it silently starves exactly the brains
that matter: `write()` returns false as soon as the socket buffer passes the stream's
16 KB high water mark, and a single summary frame for a 5,000 cell brain is always
larger than that. The HUD read "runs 0/s" while `/api/summary` was reporting 44,479
runs/s. The correct signal is the depth of the queue, not the return value:

```js
if (c.res.writableLength > BACKPRESSURE_BYTES) { c.skipped++; continue; }
```

with `BACKPRESSURE_BYTES = 1 << 20`. A slow client then drops frames (and is told how
many via `dropped`), while a healthy client on localhost never drops one.

**Batch frames are bounded by the brain, not by the event rate.** The flush folds
events by identity before serializing: 10,000 `cell.run` events per second spread over
1,200 cells become at most 1,200 `[idx, count]` pairs per frame, not 10,000 entries.
The frame size is therefore O(cells touched) and cannot grow with tick rate. Caps
(`runs` and `sigs` 4096, `edges` 512, proposals and decisions 256) only bind on brains
larger than the cap. The full policy is printed as a comment at the top of
`viz/server.mjs`.

**Force refinement will eat the anatomy if you let it.** At 5,000 cells and 42,850
edges the plain spring model collapsed all eight regions into a single ball, because
high degree cells accumulate proportionally more spring force than repulsion can
answer. Three things fix it together, and all three are needed: degree-normalized
spring gain (`1 / (1 + deg/6)`), a real pull back toward the seeded anchor
(`anchorPull = 0.25`), and a hard clamp so no cell may drift more than `maxDrift = 0.12`
of the layout scale from its anchor. After that the region means stay separated while
the refinement still does its job: mean edge length fell 0.911 to 0.771 and the
minimum pairwise distance rose 0.0077 to 0.0213.

**`gl.finish()` does not stall under ANGLE.** The first benchmark printed 0.03 ms/frame,
which is 35,294 fps and obviously false: the driver had simply queued the work. The
bench now drains the pipeline with `gl.readPixels(0, 0, 1, 1, ...)` after every frame,
which forces the GPU to actually complete it. Honest numbers on this machine
(ANGLE / NVIDIA RTX 4070 Ti, EXT_color_buffer_float present), with the full bloom chain
running: 1.90 ms/frame (526 fps) on the synthetic 5,000 cell / 50,000 edge page, and
1.52 to 2.29 ms/frame on a real 5,000 cell brain with 42,850 live edges. The 60 fps
requirement has about 8x of headroom.

**A hidden page's frame rate is the browser's, not the renderer's.** An embedded or
background pane reports `document.hidden === true` and the browser throttles
`requestAnimationFrame` to a few calls a second no matter how fast the page draws. The
HUD used to publish that as a red "2 fps" while the same page benched 2.37 ms/frame. It
now prints `idle` when the page is hidden and measures only when it is visible. Visible,
in the same pane: 240 fps on the display's own cadence, and the back to back bench says
1.04 ms/frame (965 fps) at 5,000 cells and 42,850 edges.

**A rate that nobody is watching reads as zero.** The SSE listener is detached when the
last viewer leaves, which is right (an unwatched brain should pay nothing), but the
summary route used to derive runs/s from events that listener saw. A plain
`curl /api/summary` therefore reported 0 runs/s on a brain doing 40,000. The rates are
now differences of the brain's own cumulative counters, so they are correct with or
without a viewer. The first read after a long gap seeds the baseline and returns 0; the
next one is real.

**Dense graphs need density-aware exposure.** Additive blending that looks like a nebula
at 400 cells is a solid white disc at 5,000. `Scene.autoTune(n, m)` scales point size,
cell gain, edge gain, bloom amount and bright-pass threshold by the cell and edge
counts, and depth fog (a `uFog` uniform fed `camera.dist +/- scale * 1.3` each frame)
keeps the far half of the cloud from adding onto the near half. Without the fog the
brain reads as a flat blob rather than a volume, which is the single biggest visual
difference in the whole renderer.

## Known duplication, deliberate

`viz/client/data.js` reimplements the lobe placement and cortical shell bias from
`viz/layout.mjs` for `?synthetic=N`. It is duplicated rather than imported because the
synthetic mode must work with no server data at all, and `layout.mjs` imports
`core/rng.mjs` through a Node specifier the browser cannot resolve. If the layout
constants change, the synthetic page will look slightly different from the live one
until `syntheticGraph` is updated to match. The live path is the one under test.

## Offline guarantee

No file served by `startViz` contains `http://`, `https://`, a protocol-relative URL, or
any CDN host. The test greps every served file for these and fails on a match. Every
shader, style and script is local; the page works with the network cable pulled.

## Answered in core (2026-09-16)

Connectome keeps a (src,dst,srcPort,dstPort) key map so find() and Brain.connect are O(1): printed connect 2000 edges 2.3 ms, 20000 edges 6.2 ms (was 138 ms and 6964 ms).

## The anatomy and the pipeline (2026-09-16)

Two things had to become true: every point on screen is a real cell of the running
brain, and the cloud of points has to read as a brain.

**Regions are lobes, not blobs.** `viz/layout.mjs` places cells on real volumes now: a
cerebral ellipsoid `r = [0.80, 0.80, 1.22]`, a cerebellum low and behind it, a brainstem
capsule below. Perception is occipital, association parietal and temporal, cognitive
frontal, memory is a hippocampal arc deep and medial, motor runs the precentral strip and
spills into the cerebellum, homeostasis is the stem. Everything but the stem is mirrored
into two hemispheres with a `MID_GAP` down the middle.

**The first version looked like a handful of blobs, not a brain.** Each circuit was a
small ball around its region anchor, so five thousand cells lit up eight clusters with
empty cortex between them. The fix is `cortexTerritories()`: the cortical sheet is
partitioned by nearest anchor, so the regions together cover the whole surface and a
circuit takes a contiguous arc of its region's territory. Coverage is what makes a point
cloud read as a brain; a cluster per circuit never will, however correct it is.

**Sixty percent of a region's cells sit on the folded sheet and the rest go deeper**
(`layer` in `computeLayout`), because a hollow shell reads as a balloon. The fold itself
is `sulcus()`, a pure function of direction, so it is deterministic and the cerebellum can
reuse it at a higher frequency for its much finer folia.

**Density-aware exposure, measured.** At 5,000 cells and 42,800 edges the old gains drew
a uniform haze: fifty thousand faint lines fill a volume and the anatomy disappears inside
its own wiring. The edge gain now falls off much faster than the cell gain
(`1.4 * (40/m)^0.62` against `2.0 * (20/n)^0.22`), which was tuned live in the pane and
then written into `autoTune`.

**Flight time is the brain's schedule, not a look.** Core delivers a signal at
`t + 1 + delay`, so `EDGE_VS` computes `flight = (1.0 + aDelay) * uTickSec` and the client
measures `uTickSec` from the tick stamps on the frames that arrive. An edge of delay 3
takes exactly twice as long to cross as an edge of delay 1, and the `transmission` readout
says how many milliseconds of screen time one tick of the organism is getting.

**The pipeline view is the same object.** `pipelineLayout()` travels inside the same
`buildGraph` payload as the anatomy, so the client toggles with `v` by interpolating one
position array into the other: same cells, same edges, same frames, live or from a
snapshot. Stage throughput is read off the `sigs` triples, which are the brain's own
counters folded by identity, attributed to the cell that emitted each signal.

**The fog has to come from the real extent.** The pipeline layout is about five times
wider than the anatomy, and a fog range derived from the nominal scale erased the outer
stages. `Scene.radius` is measured from the positions instead.

**A minimum pair distance is not a collapse test.** The cortical sheet legitimately lets
the springs pull the closest pair from 0.273 to 0.236 on the seed brain. The guard in
`test/viz.test.mjs` now allows that and grades the thing it actually cares about: no two
cells within a hundredth of the layout scale, where they would render as one point.

## Working, not glowing (2026-09-16)

The brief was five things at once: it must read as a brain, it must look like it is
working, every node must be individually selectable with its own function shown, the
latency must be printed in microseconds from measured wall time, and it must be crisp.
No fog, no bloom wash, no idle twinkle.

**Folds may only cut inward.** Deepening the sulci by displacing the sheet both ways
turned the silhouette into a cauliflower: the outline is the only thing the eye uses to
recognise a brain, and a fold that pushes outward breaks it. `sheetAt()` returns
`SHELL - foldAmp * (1 - g)`, where g is 0 at the bottom of a sulcus and 1 on the crown of
a gyrus, so a groove is always a cut into a smooth hull. The same function is used when a
cell is placed, when one is pulled onto the cortex, and when one is contained during
refinement, so the three can never disagree about where the sheet is.

**A hundred thousand lines is a grey wash, whatever the gain.** The 12,000 cell demo has
102,850 edges. Drawn as individual lines they are a uniform haze that hides the anatomy
inside its own wiring. The renderer keeps a `LOCAL_BUDGET` of the 6,000 strongest local
edges (by absolute weight, ties broken by index, so the choice is deterministic) and
merges every inter region edge into a conduit: a bundled tract of a few bowed lanes. The
HUD still reports the true totals, because what is drawn is a drawing decision and not a
fact about the organism.

**A tract has to be quiet so the packet can be loud.** Conduits first drew as a static
scribble across the face of the brain. `EDGE_VS` now takes a `uBase` uniform: local edges
draw at 1.0 and conduits at 0.22, so the tube is a hint and the packet moving through it
is what catches the eye.

**Microseconds are real, milliseconds are also real, and they are not the same number.**
The server wraps `process.hrtime.bigint()` around the ticks it drives and divides that one
window three ways: per cell run, per packet delivered (`brain.stats.delivered`), and per
tick. Measured on this machine at 12,000 cells and 102,850 edges: 26.7 us per cell run,
4.10 us per packet moved, 11.76 ms per tick. A conduit hop is `1 + meanDelay` ticks of the
organism's own clock, which on a brain this size is tens of milliseconds, so the conduit
table prints what it measures and is titled latency per hop instead of claiming
microseconds it does not have. The microsecond claim sits where it is true: the work of
running one cell and the work of moving one packet.

**The auto driver was starving its own picture.** The client asked for 40 ticks every
200 ms. At 12 ms a tick that is 480 ms of blocking work requested five times a second, so
the server never got back to its flush timer, the event stream arrived in bursts, and the
brain went dark exactly while it was busiest. The driver now sizes each batch from the
measured tick cost to fit about 60 ms of server time, and the picture stays lit.

**Anything that moves by itself needs a clock, not a frame count.** The idle orbit was
`camera.az += 0.055 * (1 / 60)` per frame. In a pane whose animation frames are not capped
that spun the brain about eight times too fast, and no screenshot of the lateral view was
reproducible. It is now multiplied by the measured seconds since the previous frame.

**A run lifts a cell in its own colour.** Mixing 60 percent toward white on activation
erased the region at exactly the moment a viewer wants to know which region is working.
The flare now warms the hue a little under half the way, and the palette carries more
saturation, so a working cortex still reads as cortex rather than as a white cloud.

**Frames per second is the browser's number; milliseconds per draw is ours.** The HUD
grades on the measured cost of one draw (green at 8 ms or less) and prints the rate beside
it, or idle when the page is hidden. At 12,000 cells with conduits and packets moving:
0.1 ms per draw.

**To photograph the page it has to keep its pixels.** WebGL throws the drawing buffer away
after every composite, so `canvas.toDataURL()` returns a blank image. `gl.js` asks for
`preserveDrawingBuffer` only when the URL carries `?capture=1`, which costs nothing in
normal use.

**What the panel says about a cell.** `/api/cell/:id` carries `fn`, the kind's own doc
string in plain words, and `capability`, a score computed from the kind's declared cost,
the port count, how many kinds those ports accept, the measured size of the cell's state,
its degree in the connectome and how often it has run. Every node is drawn the same size;
the score is the glow level and the colour temperature, so capability is visible without
anything on screen being bigger than anything else.

Screenshots of the running page, taken from the pane at 1440x900 (2160x1350 device
pixels): `viz/screenshots/anatomy.png` is the lateral anatomy with a cell panel open and
the conduit table live, `viz/screenshots/pipeline.png` is the same organism as six stages.
