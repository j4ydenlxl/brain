# compress

His P5, "self compressing", as three parts:

- core/pack.mjs: bipolar vectors at one bit a lane and ternary vectors at two bits a lane, an
  exact round trip, and CRC32.
- Checkpoint container 2 (core/persist.mjs): a small JSON header, then a binary body. Each
  hypervector width gets a section; edges and cell state go into typed array sections. Every
  section carries its own CRC32. The reader restores container 1 and container 2, and the
  writer emits container 2.
- The ruler: bytes per score point = checkpoint bytes / summed suite score, on the
  bench/answer.mjs draws (exact path). bench/compress.mjs prints it at every checkpoint with
  generated lines and cells, and the writer puts it in the v2 header (ruler.bytesPerScorePoint).

Every number below was printed by a command named next to it. The bar file,
bench/verdicts/compress.json, was written once and has not been touched since. Later runs at
the bar's parameters write bench/verdicts/compress-rerun.json with isTheBar false and a rerunOf
pointer back to the bar.

## The bar (bench/verdicts/compress.json, 2026-09-24T02:33:01.810Z)

```
node --max-old-space-size=6000 bench/compress.mjs
```

```
v1        21812892 bytes  write 2318 ms  read 122 ms  restore 1485 ms
v2        21055888 bytes  write 1985 ms  read 51 ms  restore 1341 ms   (container 2: binary)
ratio     v1/v2 1.036x   v1plain/v2 2.5549x
identical ticks  v2 vs live 0/200   v1 vs live 0/200   v2 vs v1 200/200
identical answers  v2 vs live true   v1 vs live true   v2 vs v1 true   (30, 30, 30 answers)
ruler     score 30/30 ... bytes per score point  v1 727096.4  v1 plain 1793189  v2 701862.933  (v2 header: 701862.933)
peak RSS 1861 MB (sampled at each phase), wall 164 s
met       replay identical v2 false   replay identical v1 false   v2 equals v1 true   v2 smaller true
```

**The bar was MISSED.** The organisms restored from v2 and from v1 gave the same 30 answers.
But they matched the live organism on 0 of 200 tick digests. A tick digest hashes the
counters, the fired cells, every emission, the outbox and the answer held. v2 and v1 matched
each other on 200 of 200, so the format was exact and the restore was not.

## Why the replay missed, and the two fixes

1. **The runtime was not in the snapshot.** seeds/organism.mjs builds a Brain with
   pruneEvery 0. core/brain.mjs restore() built the new Brain with constructor defaults, and
   the default pruneEvery is 1000. So the restored organism pruned edges the live one never
   proposed. The bar printed `connectome.stats.pruned: 15 vs 0` and `gate.stats.proposed:
   386328 vs 386313` in its end state.

   The fix: the Brain document now carries `runtime` (pruneEvery, hebbian, outboxRing, and the
   coact growth config), and restore() passes it to the constructor. A caller that names an
   option still wins, and a file without the section restores with the defaults it always
   had. The whole organism also records its genome, and restoreWhole re-applies the genome's
   gate policy. test/compress.test.mjs (c) and (g) grade this. Test (c) builds with
   pruneEvery 150, forces stale edges, and asserts the restored brain prunes the same edges.

2. **The codebook slot order was lost.** The first rerun after fix 1 printed:

   ```
   identical ticks  v2 vs live 194/200 ... (v2 first differs from live at replay tick 129 in emit: emission 80: mem.sequence (memory.sequence) vs mem.sequence (memory.sequence))
   ```

   The mechanism:
   - core/signal.mjs ItemMemory breaks a tie in nearest() by slot order.
   - delete() moves the last slot into the hole, so slot order stops matching Map order.
   - serialize() writes the Map order, and from() re-slots in it.

   So the restored mem.sequence decoded a cue to a different one of two equally near items.

   The fix: seeds/whole.mjs records, in `extras.codebooks`, the slot order of every memory
   codebook whose slots are not in Map order. restoreWhole re-fills the restored arena in that
   order, in place.

After both fixes, the rerun at the bar's parameters (kept as
bench/verdicts/compress-rerun-fidelity.json) printed:

```
v2        21056232 bytes  write 1874 ms  read 40 ms  restore 1246 ms   (container 2: binary)
ratio     v1/v2 1.036x   v1plain/v2 2.5549x
identical ticks  v2 vs live 200/200   v1 vs live 200/200   v2 vs v1 200/200
identical answers  v2 vs live true   v1 vs live true   v2 vs v1 true   (30, 30, 30 answers)
met       replay identical v2 true   replay identical v1 true   v2 equals v1 true   v2 smaller true
```

## Where the bytes were

The container 2 census line of that run printed the sections:

```
sections slots 48869, skeleton 244550, edges 99748, bytes 477944, hv.bipolar.8192 20157440, ...
```

Of the 21056232 bytes, 20157440 are 19685 distinct 8192 lane bipolar vectors at one bit a
lane. That section is the whole story of the 1.036x: v1 already deflates those vectors, and a
bit per lane is close to what deflate reaches on them.

The vectors are not independent. These figures come from scratchpad scripts run on the bar's
t=2000 checkpoint, not from a bench verdict:

| measure | printed value |
| --- | --- |
| Hamming distance to the nearest earlier vector | median 522, 90th percentile 1108, of 8192 |
| Mean distance to the vector just before | 4425.2 |
| Mean distance to the best of the 64 before | 639.1 |

On the 20157440 bytes, the candidate coders printed:

| method | bytes |
| --- | --- |
| deflate alone | 13716923 |
| XOR against the best of 64, then deflate | 8671962 |
| XOR against the best of 64, then Rice | 7340437 |
| XOR then Rice, looking 512 back | 7254814 |

Looking 512 back is eight times the search for about 1 percent, so the window stays at 64.

## The XOR and Rice section (core/pack.mjs xorRiceEncode, enc "xor-rice")

The coder works one vector at a time, in store order:

- It picks as reference the nearest of the 64 vectors before it, by Hamming distance, taking
  the closest one back on a tie. So the stream is a function of the store alone.
- It writes the XOR with that reference as the gaps between set bits, in a Rice code.
- If the delta would cost more than the vector's own bits, it writes the vector raw instead.

The stream per vector, least significant bit first:

- 7 bits: the reference, 0 for raw.
- Then either the raw bytes, or a delta:
  - the count of differing lanes;
  - 5 bits of Rice parameter;
  - one code per gap.

The writer keeps the coded form only when it is smaller than the plain bits. The header records:

- `raw`: the store's length;
- `rawCrc32`: the store's CRC32.

The reader checks both after decoding.

The reader refuses each of these by name:
- a reference before the first vector;
- a gap past the last lane;
- a stream that ends inside a code;
- trailing bits;
- a decoded length other than `raw`;
- a decoded store whose CRC32 is not `rawCrc32`;
- a section encoding it does not know.

The last check matters because an unknown encoding read as raw bytes would restore different
vectors without a word. `writeCheckpoint(file, doc, { hv: 'bits' })` still writes plain bits,
and both forms read back to the same document.

## The rerun with the XOR and Rice section (bench/verdicts/compress-rerun.json)

```
node --max-old-space-size=6000 bench/compress.mjs
```

```
  checkpoint t=500  cells 173  edges 2143  generated lines 2468  score 30/30  v1 7811943 B (260398.1 B/pt)  v2 3249152 B (108305.067 B/pt, header says 108305.067)
  checkpoint t=1000  cells 173  edges 2143  generated lines 2468  score 30/30  v1 13225179 B (440839.3 B/pt)  v2 5276312 B (175877.067 B/pt, header says 175877.067)
  checkpoint t=1500  cells 173  edges 2143  generated lines 2468  score 30/30  v1 17266811 B (575560.367 B/pt)  v2 6559464 B (218648.8 B/pt, header says 218648.8)
  checkpoint t=2000  cells 173  edges 2143  generated lines 2468  score 30/30  v1 21813478 B (727115.933 B/pt)  v2 8250656 B (275021.867 B/pt, header says 275021.867)
v1        21813478 bytes  write 2129 ms  read 96 ms  restore 1329 ms
v2        8250656 bytes  write 2549 ms  read 199 ms  restore 1399 ms   (container 2: binary)
ratio     v1/v2 2.6438x   v1plain/v2 6.5202x
sections slots 48869, skeleton 244552, edges 99748, bytes 477944, hv.bipolar.8192 7351810 (xor-rice, 19685 vectors, 20157440 as bits), ...
identical ticks  v2 vs live 200/200   v1 vs live 200/200   v2 vs v1 200/200
identical answers  v2 vs live true   v1 vs live true   v2 vs v1 true   (30, 30, 30 answers)
ruler     score 30/30 (10 per suite, exact path)  generated lines 2468  cells 173   bytes per score point  v1 727115.933  v1 plain 1793208.533  v2 275021.867  (v2 header: 275021.867)
peak RSS 1865 MB (sampled at each phase), wall 154 s
met       replay identical v2 true   replay identical v1 true   v2 equals v1 true   v2 smaller true
```

The cost is time:
- v2 now writes in 2549 ms against v1's 2129 ms;
- v2 reads in 199 ms against 96 ms.

The restores are 1399 ms against 1329 ms.

| run | v2 bytes | v1/v2 | v2 vs live | v2 B/pt |
| --- | --- | --- | --- | --- |
| the bar (compress.json) | 21055888 | 1.036x | 0/200 | 701862.933 |
| after the fixes (compress-rerun-fidelity.json) | 21056232 | 1.036x | 200/200 | 701874.4 |
| XOR and Rice (compress-rerun.json) | 8250656 | 2.6438x | 200/200 | 275021.867 |

## What still differs at the end of the replay, and why it is not the checkpoint

The replay is now identical tick for tick and answer for answer. The end state still differs
from the live organism in a few places. The last run printed:
- three `cells.N.policy.priority` values;
- three `extras.whole.attention.wm` slots;
- `ledger.seq` by 1.

The cause is in simulate/attention.mjs, a file this item does not own: `remember()` pushes
`sig.data` into working memory as it arrives. That payload comes from a pool and is reused
later, so the live organism's working memory changes under it after the fact. A restored
organism holds detached copies.

A diagnostic run (scratchpad diag-attention-copy.mjs, nothing written) wraps `remember` to
keep a copy, for the live and the restored organisms alike. It printed:

```
end state differs  v2 vs live [ledger]   v1 vs live [ledger]   v2 vs v1 []
  v2_live  ledger.seq: 772629 vs 772628
diagnostic: remember copied 34584 hv payloads
```

So with a copy on remember, the only difference left is the ledger sequence, which is 1 ahead
at restore. The fix belongs to the owner of simulate/attention.mjs and is filed as its own task.

## Tests

`node --test test/compress.test.mjs` covers seven cases:

- (a) pack round trip for 1000 random bipolar and 1000 random ternary vectors.
- (b) a v1 checkpoint still restores, to the organism the v2 file restores to.
- (c) a v2 restore equals live at restore and tick for tick on a replay with the three suites,
  with pruning forced on.
- (d) a corrupted section, header or truncated file is refused with its checksum.
- (e) v2 carries the ruler.
- (f) no em dashes in this item's files.
- (g) the runtime round trips in both containers.
- (h) the XOR and Rice coder:
  - exact on random and correlated stores of odd widths and window 0, 1 and 64;
  - a stream cut short or with trailing bytes is refused;
  - a coded section reads back to its document and is smaller than plain bits;
  - plain bits still read and restore a whole organism;
  - an unknown encoding is refused by name;
  - a flipped byte whose section CRC was forged to match is still refused by the decoded
    store's CRC.

## Open

- A test sized whole organism never produces an xor-rice section. With 2 majors there is one
  vector; with 4 majors there are 49, and the probe coded them in 50219 bytes against 50176
  as bits. So test (h) grades the coded section on a synthetic document of 300 correlated
  vectors. Only the bench exercises it on an organism.
- The attention aliasing bug above lives in simulate/attention.mjs.
- `ledger.seq` is 1 ahead after every restore (learning attaches and writes one row). It is
  in no tick digest.
- memory/semantic.mjs removes a pattern with `items.items.delete`, which leaves a ghost slot
  in the ItemMemory. `extras.codebooks` names such a codebook under `skipped` rather than
  restoring a wrong order.
- bench/semantic-cleanup.mjs regex-scans a checkpoint's raw text, so on a container 2 file it
  finds nothing.
- The encode costs time on every write: 2549 ms against 1874 ms before the coder, on the same
  organism.

# Board 12, item delta: delta checkpoints and packed hypervectors

Two parts, and one bar over both.

- core/checkpoint-delta.mjs writes a DELTA CHAIN. snapshot.json becomes a small head (magic
  BRAINCKH). The chain/ directory beside it holds one full container 2 file and then deltas
  (magic BRAINCKD). A delta holds only what changed since the link before it:
  - slot records that changed;
  - the skeleton text as a patch against the previous one ("zstd-dict" on Node 23.8 or later,
    else "cdc");
  - new blobs and word arrays;
  - new vectors coded against any vector the chain already holds ("xor-ref", with
    core/pack.mjs HammingLsh proposing the references).

  Every N-th checkpoint is a full again (fullEvery, default 20). Old chain files are deleted
  only after the new full's head has landed. The reader checks every file's size and CRC
  against the head, every section CRC, and the rebuilt text's SHA-1. With digest on, it also
  checks the SHA-1 of the document the writer was handed. A corrupted or missing link is
  refused by name. `readChain(file, { lastGood: true })` returns the last state that verified.
- core/pack.mjs PackedHVStore holds bipolar 8192 lane vectors at 1 bit a lane (1024 bytes).
  - It packs on write and answers `hamming`, `sim` and `nearest` from the packed words.
  - `nearest` gives the same first strict maximum as the Int8 scan, ties to the earlier
    vector.
  - `get(i)` is the one place a vector is unpacked.

Deltas are OFF by default. They are turned on per directory with `setDeltaPolicy(dir, {
fullEvery })`, or process wide with `BRAIN_CHECKPOINT_DELTA=on|N` or `--checkpoint-delta[=N]`.

## The bar (bench/verdicts/compress.json, 2026-09-24T14:55:24.328Z)

This run replaced Board 10's compress.json. Board 10's file is kept, unchanged, as
compress-board10.json (the verdict's `replaces` field names it).

```
node tools/budget.mjs --ram-mb 6000 --disk-mb 1500 --dir <scratch>/bar --record <scratch>/delta-budget.json --wait-free-ram-mb 16384 -- node --max-old-space-size=6000 bench/compress.mjs --tmp <scratch>/bar --statement
```

```
daemon full  14000 ticks to t=14429 in 60000 ms wall (built in 1453 ms), 16 checkpoints writing 111952808 bytes = 7996.629 bytes per tick
daemon chain 12000 ticks to t=12352 in 60000 ms wall (built in 472 ms), 14 checkpoints writing 24089056 bytes = 2007.421 bytes per tick; the chain reads back: 14 links (1 full), refused none, document SHA-1 verified true in 673.1 ms
daemon    checkpoint bytes per tick  full 7996.629  chain 2007.421  RATIO 3.9835x (bar 5x); over the 13 checkpoints both arms wrote at the same tick (t=0..12352) 79318776 against 24082848 bytes = 3.2936x
identical ticks  chain vs live 200/200 (0 mismatches)   v2 vs live 200/200   v1 vs live 200/200
identical answers  chain vs live true   v2 vs live true   v1 vs live true   (30, 30, 30, 30 answers)
ruler     score 30/30 (10 per suite, exact path)  generated lines 2468  cells 173   bytes per score point  v1 733386.8  v2 275883.733  chain (what the checkpoint wrote) 59660.8  chain (every file a restore reads) 319002.933
tier assoc     key bytes 33554432 -> 4194304 (8x) for 4096 keys   title recall@1 1 -> 1, ... answers differing 0/200   sentence recall@1 0.96 -> 0.96, ... answers differing 0/200
tier episodic  key bytes 33554432 -> 4194304 (8x) for 4096 keys   title recall@1 1 -> 1, ... answers differing 0/200   sentence recall@1 0.895 -> 0.895, ... answers differing 0/200
met       ratio false   chainVerified true   replayIdenticalChain true   chainDocEqualsV2 true   recallUnchanged true   bytesPerScorePointFell true   belowPreviousRecord true   bar false
```

**The bar was MISSED at 3.9835x against 5x.** Identity held, tier recall did not move, and
bytes per score point fell. The miss is on the ratio alone.

### How to read the two ratios

The whole-run ratio, 3.9835x, is the bar's own measure. It is the more flattering of the two.

Both arms end with a final checkpoint on the tick of their last autosave:
- the full arm pays for its last file twice (`c@14429:11056488` and `f@14429:11056488` in
  the verdict's daemon.full.series);
- the chain arm's final is a delta with nothing in it (`f@12352:6208`).

The matched ratio leaves the finals out. It compares only the 13 checkpoints both arms wrote at
the same tick, and it is 3.2936x.

The two arms did not run the same number of ticks. The chain arm ran 12000 ticks in the same
60 s where the full arm ran 14000, because a delta costs more wall time to write. At the
organism's t=2000 checkpoint, the chain wrote delta 3 in 3113.9 ms against 2880.5 ms for v2.

### Where the delta bytes are

Every daemon delta after the first, the empty final aside, stayed between 1730312 and 2065432
bytes. Meanwhile the
full file grew with the organism, from 3402080 bytes at t=1014 to 11056488 at t=14429
(daemon.*.series in the verdict). So the ratio rises with run length, and 60 s is not long
enough to reach 5x.

On the bar organism's last link (t=2000), the sections printed were:

```
chain link sections slots 10986 (5689), patch 53979, bytes 44323, words 31588, hv.bipolar.8192 1645712 (4839)
```

That is 1645712 of 1789824 bytes spent on the 4839 vectors the organism made since t=1500.
New vectors are the floor. They are already coded against every vector the chain holds, and
the core/pack.mjs comment above xorRefEncode records why they cost what they cost: a new
vector's nearest held vector sits at median Hamming distance 591. Getting to 5x losslessly
would need the organism to make fewer new vectors, or vectors closer to the ones it holds. The
checkpoint cannot supply that.

## Identity

The chain rebuilt v2's document section for section:

```
documents v2 vs v1 differ in []; v2 vs v1 plain (version aside) in []; chain vs v2 in []
```

The organism restored from the chain matched the live one on 200 of 200 tick digests, with 30
suite questions injected, and gave the same 30 answers.

At the end of the replay, the chain organism differed from the live one only in `ledger.seq`,
which is 1 ahead after every restore. The v2 and v1 organisms also differed in
`extras.whole.attention.stats`. That is the attention aliasing Board 10 traced above: it lives
in simulate/attention.mjs and is not a checkpoint difference. A scratch run
(scratchpad alias.mjs) restored ONE v2 file twice and replayed the two organisms in lockstep.
It printed `ticks same 40 of 40` and `A vs B end ["cells","extras"]`, so two copies of one
file drift the same way.

## The ruler and the gate's COMPRESS row

The verdict's `ruler.v2Header` is the chain head's ruler:
- `bytes` 1789824 and `bytesPerScorePoint` 59660.8 are what this checkpoint WROTE (one delta
  link plus the head);
- `chainBytes` 9570088 and `chainBytesPerScorePoint` 319002.933 are every file a restore
  reads.

The field `bytesMeans` in the header says so. The full v2 header is kept as `ruler.fullHeader`.

The newest record before this run was 275021.867 (bench/verdicts/compress-rerun.json), at the
same score of 30/30. Read by what a checkpoint writes, bytes per score point fell. Read by what
a restore reads, the chain is larger than one full file: `v2/chain on disk 0.8648x`.

## Packed tiers

The tiers that compare keys only by their dot product are memory.assoc and the episodic store.
On bipolar keys the dot product is lanes minus twice the Hamming distance, so these tiers can
read the packed form directly. The bench runs each one in two versions:
- the real module on Int8 lanes (memory.assoc through runCell, EpisodicStore.retrieve);
- a twin that packs on write and answers from Hamming on the packed words with the same
  selection rule.

Both versions hold 4096 title keys (memory.assoc's capacity), and they are asked with the
held-out draw bench/knowledge.mjs grades. The draw is `knowledge-draw-2026-09-23`, 200 of 628
held-out records, asked once by the title key and once by the hidden sentence's key. Printed:
- key bytes fell from 33554432 to 4194304 in both tiers;
- recall@1 did not move: assoc 1 and 0.96, episodic 1 and 0.895;
- 0 answers differed in both tiers.

The packed assoc scan took 1.3073 ms a query against 3.7005 for Int8 (by title). The episodic
twin was slightly slower, 0.121 against 0.108 ms: its rescore is cheap either way, and its
candidate lookup was not tuned.

The twins live in bench/compress.mjs because memory/ and cells/ are not this item's files. The
organism's own tiers still hold Int8 keys. Moving them onto PackedHVStore is the owner's
change; this run measured what that change does to recall. Two tiers are not packed:
- the semantic tier, whose cleanup iterates on lane values;
- the knowledge tier, which already compares 256 bit signatures.

## Budgets

- The bar run wrote 1104512638 bytes over its 514 s, well over 200 MB. It wrote every file
  under `--tmp`, replaced each file with the next, and removed them all at the end. The
  budget printed a peak directory of 216.4MB and a peak RAM of 4010.7MB. The bench printed a
  peak RSS of 4243 MB for its process.
- One process ran, with no workers.
- The daemon arms used ledger summary, never full.
- No model was called anywhere: the exact path uses provider null, and the daemon arms make no
  model call. The shared Ollama queue was not used.

## Caveats

- **A head copied alone is refused.** cli/state.mjs `saveLabel` and `loadBrainFromFile`, and
  daemon/health.mjs (duplication), copy snapshot.json by itself. With deltas on, that copies a
  head without its chain/ directory, and the reader refuses it by name ("names F, which is not
  beside it"). A labelled head would also dangle once a new full deletes the old chain. This
  is the main reason deltas stay off by default until those copy sites learn to copy a chain.
- **zstd.** The skeleton patch uses zstd with the previous text as its dictionary, which needs
  Node 23.8 or later. Without it, the content defined chunk patch ("cdc") is used, and test
  (d) round trips it.
- **Incremental, not differential.** Each delta is against the link before it, so a restore
  reads the full plus every delta up to 20 of them (chainBytes). A corrupted middle link loses
  everything after it; lastGood returns the state before it.

## Tests (node --test test/delta.test.mjs test/compress.test.mjs)

The two files hold 18 tests, and all 18 pass. The delta file covers:
- (a) a chain restores to the full state, link by link (with the document digest); the
  restored organism is the live one at restore and on a lockstep replay;
- (b) every fullEvery deltas the next checkpoint is a full, and the old chain leaves;
- (c) a corrupted, truncated or missing delta is refused by name, lastGood returns the state
  before it, and the full is untouched and reads alone;
- (d) the cdc patch round trips;
- (e) word payloads round trip;
- (f) pack and unpack round trip; Hamming on packed words equals Hamming on lanes; the packed
  store ranks exactly as the Int8 lanes do;
- (g) xor-ref round trips;
- (h) the policy;
- (i) no em dashes.

## Open

- **The ratio.** 3.9835x whole run and 3.2936x matched, against 5x. The floor is new vectors.
- **The copy sites** (cli/state.mjs, daemon/health.mjs) do not know about chains.
- **The organism's tiers** are not yet on PackedHVStore.
- **Write time.** A delta costs more wall time than a full file of the same moment, and the
  chain arm ran 2000 fewer ticks in 60 s.
