# checkpoint

bench/checkpoint.mjs asks where the bytes in state/<name>/snapshot.json actually are, and
whether the format that holds them can be made smaller without changing what a restore hands
back. It builds the whole brain (seeds/whole.mjs, buildWhole) at a size, ticks it 200 times,
and then writes the SAME ticked brain twice, once in checkpoint format 2 and once in format 3,
back to back, so the two arms of the comparison differ by the format and by nothing else. Each
row runs in its own child process for the reason bench/footprint.mjs gives: a brain built
earlier in a process leaves module level registries behind that a later build never frees.

Sizes are read off disk with statSync. The per section and per field byte counts are measured
by scanning the file's own JSON spans, never by re-stringifying the parsed object, because
re-stringifying would measure a shape this code chose rather than the bytes the writer wrote.

## checkpoint format 3 (2026-09-18)

Command that wrote bench/verdicts/checkpoint.json:

```
node bench/checkpoint.mjs --majors 12,100,1000 --units 256 --ticks 200 --extra-majors 12 --extra-units 100000 --row-budget-ms 2700000
```

Every number below was printed by that run, and the declared budget is POCKET_CHECKPOINT_MB =
50, an authored target carried over from bench/verdicts/footprint.json, never a measurement.

### The four rows, 200 ticks

| row | before (format 2) | after (format 3) | smaller | restore ms before | restore ms after | restored identical | 50 MB |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 12x256, 168 cells, 2006 edges | 11596562 B (11.059 MB) | 4069131 B (3.881 MB) | 2.85x | 214.4 | 195.6 | true | met |
| 100x256, 872 cells, 27512 edges | 48119817 B (45.891 MB) | 21147001 B (20.167 MB) | 2.275x | 816 | 887.8 | true | met |
| 1000x256, 8072 cells, 92042 edges | 237845153 B (226.827 MB) | 116076148 B (110.699 MB) | 2.049x | 4831.3 | 4895.3 | true | MISSED |
| 12x100000, 168 cells, 1868 edges | 64365668 B (61.384 MB) | 16509832 B (15.745 MB) | 3.899x | 500.3 | 523.5 | true | met |

restoredIdentical is not a byte compare of the whole file: it restores the checkpoint, snapshots
the restored brain in the same format, and compares clock, stats, connectome and every cell
field for field. Three world cells (w.http, w.fs, w.proc) carry state.queuedAtSnapshot, which
records the queue depth at the moment of the snapshot and is 0 in a brain whose queues are
empty because it has just been restored; that one field is named and excluded, it differs
identically under format 2, and the bench reports it as ignored 3 rather than folding it into
the verdict. Every row also passes crossIdentical: a format 2 file and a format 3 file of the
same brain restore to two brains that re-snapshot to the same bytes.

### Bytes per top level section, before and after

The bench prints the six largest sections of each file; the verdict carries all of them.

12x256

| section | format 2 | format 3 |
| --- | --- | --- |
| blobs | 0 | 2968819 |
| extras | 5032662 | 153744 |
| inflight | 3155656 | 556551 |
| cells | 2422295 | 217456 |
| outbox | 545262 | 52075 |
| mailboxes | 286290 | 84432 |
| connectome | 88468 | 248 |
| frame | 163 | 172 |

100x256

| section | format 2 | format 3 |
| --- | --- | --- |
| blobs | 0 | 12396041 |
| inflight | 22215260 | 6082778 |
| cells | 11507969 | 1168639 |
| extras | 6202576 | 312907 |
| outbox | 3863845 | 364566 |
| mailboxes | 2318792 | 702218 |
| connectome | 1210736 | below the six printed |
| frame | 163 | 172 |

1000x256

| section | format 2 | format 3 |
| --- | --- | --- |
| blobs | 0 | 65459119 |
| inflight | 115664868 | 34621280 |
| cells | 89215080 | 6366549 |
| mailboxes | 22896414 | 7526476 |
| connectome | 4050057 | below the six printed |
| outbox | 3254851 | below the six printed |
| extras | 1272470 | 763819 |
| circuits | below the six printed | 973545 |
| frame | 163 | 172 |

12x100000

| section | format 2 | format 3 |
| --- | --- | --- |
| blobs | 0 | 15340815 |
| cells | 54540538 | 243092 |
| extras | 5409277 | 227293 |
| inflight | 3619045 | 536966 |
| mailboxes | 383665 | 108161 |
| outbox | 266652 | below the six printed |
| connectome | 82396 | below the six printed |
| circuits | below the six printed | 33570 |
| frame | 163 | 172 |

The bytes did not move between sections. They moved OUT of every section into one, which is
the shape of the change: the sections shrink because their long strings are gone, and blobs is
the deflated table those strings went into.

### What was encoded, and why that and not something else

The obvious cut was already made. Every typed array in the checkpoint was already base64 text,
not a decimal list: core/cell.mjs toSafe, Connectome.serialize and CoActivation.serialize all
write bit packed or Float32 base64 already. The bench measures what is left as numberListBytes,
and at 12x256 that is 34783 B of the 217287 B of cells, so packing the remaining plain number
lists would have bought nothing worth a format change.

The census says where the bulk is instead. Counting only strings of 48 bytes or more:

| row (format 2) | strings | bytes held | share of file | distinct | distinct bytes | duplicate bytes | duplicate share |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 12x256 | 6514 | 10545440 | 90.94% | 2493 | 4648948 | 5896492 | 50.85% |
| 100x256 | 30308 | 39609318 | 82.31% | 10612 | 16712508 | 22896810 | 47.58% |
| 1000x256 | 153970 | 188546090 | 79.27% | 58462 | 82708040 | 105838050 | 44.5% |
| 12x100000 | 6370 | 63243760 | 98.26% | 2477 | 56900470 | 6343290 | 9.86% |

Two different problems live in that table. At 12x256, 100x256 and 1000x256 roughly half of the
whole file is byte for byte repeated payload: the same hypervector travels in a message, sits
in an inflight envelope, is remembered by a cell and is counted by a co-activation, and every
copy is written out in full. At 12x100000 almost nothing repeats (9.86%), but 52267509 B of
the 54540538 B of cells is one cell state key, dynamic, the substrate's ring buffers, which are
base64 text of mostly zero bytes and compress away.

So format 3 does both, and it has to do both: deduplication alone leaves the 12x100000 row
near its old size, and compression alone leaves 100x256 carrying all of its duplicates.
Concretely, core/persist.mjs writeJSONStreamed with intern true

- replaces every string of 48 bytes or more whose characters are all base64 or colon with a
  reference, keeping one copy of the string,
- doubles a leading tilde on any other string, so a value that happens to look like a reference
  comes back as itself and a reference is unambiguous rather than merely improbable,
- never interns and never escapes a KEY at any depth, so an object's member names are the same
  bytes they always were,
- writes the table as the last member of the top level object, blobs, as deflateRawSync of the
  strings joined by newlines and then base64, in chunks so no chunk's input grows past 32 MB
  and no output string approaches V8's string cap.

The reader resolves the table inside readJSONStreamed, before it returns, so Brain.restore,
cli/ops.mjs diffSnapshots and tools/lib.mjs loadBrainAt all still receive exactly the document
shape format 1 and format 2 gave them, and nothing outside core/persist.mjs learned a new
shape. A document whose blobs.enc is not this encoding, or which has no blobs at all, is
returned untouched, which is how a format 1 and a format 2 file still read.

core/cell.mjs and core/connectome.mjs were read and left alone deliberately. The per cell
fields that could be elided by default are small next to everything else: at 100x256 policy is
68947 B and stats is 71229 B of a 48119817 B file, and eliding them would have changed what
serializeCell means for every reader of a cell for no measurable size.

The residue is honest. After the change the largest object in every file is the table itself:
2968750 B in 1 string at 12x256, 12395970 B in 1 string at 100x256, 65459034 B in 3 strings at
1000x256, and 15340740 B in 2 strings at 12x100000, all of it distinct, none of it duplicate.
That is compressed unique payload, so the next cut has to be at the organism, not at the
format: 1000 majors hold 8072 cells whose distinct payloads are 82708040 B before compression,
and no encoding removes content that is actually distinct.

The restore cost did not move the way the byte cost did, which is what it should look like.
Format 3 pays an inflate and a walk that resolves references, and saves the read and parse of
the bytes it no longer wrote. At 12x256 restore went 214.4 ms to 195.6 ms, faster; at 1000x256
it went 4831.3 ms to 4895.3 ms, barely slower on a file that went from 237845153 B to
116076148 B; at 12x100000, 500.3 ms to 523.5 ms.

bench/verdicts/checkpoint.json holds the run this note reads: the 12x100000 row, which format 2
wrote as 64365668 B (61.384 MB), format 3 writes as 16509832 B (15.745 MB), and it is the row
the contract named first, now under the declared 50 MB budget with room to spare; the 1000x256
row, which format 2 wrote as 237845153 B (226.827 MB), format 3 writes as 116076148 B
(110.699 MB), 2.049x smaller and still over that budget, so the pocket holds the brain at 12
majors and at 100 majors and does not hold it at 1000. Both smaller rows came down too and
neither grew: 12x256 from 11596562 B to 4069131 B and 100x256 from 48119817 B to 21147001 B,
and restoredIdentical is true on all four.

## checkpoint format 4 (2026-09-18)

Commands that wrote the two verdicts, both on node v24.15.0:

```
node bench/checkpoint.mjs --majors 12,100,1000 --units 256 --ticks 200 --extra-majors 12 --extra-units 100000 --row-budget-ms 2700000 --formats 2,3,4   (bench/verdicts/checkpoint-before.json, at 2026-09-18T12:26:28.059Z)
node bench/checkpoint.mjs --majors 12,100,1000 --units 256 --ticks 200 --extra-majors 12 --extra-units 100000 --row-budget-ms 2700000 --formats 3,4     (bench/verdicts/checkpoint.json,        at 2026-09-18T12:31:09.300Z)
```

Every number below was printed by one of those two runs. The budget, POCKET_CHECKPOINT_MB = 50,
is still an authored target carried over from bench/verdicts/footprint.json, never a measurement.

### Step 1, the blob table's payloads at 1000x256, and the premise they falsify

The format 3 note above ended on a premise: the table holds "distinct hypervector payloads as
deflated base64 of int8", so a bipolar vector would pack 8 times smaller than int8 and 10.7
times smaller than base64. The histogram was measured before anything was encoded for it, and
on this organism the premise is false. The table at 1000x256 holds 58462 payloads carrying
82591116 B of text in 19 distinct (kind, length) pairs, and of those payloads exactly 3 are
int8 bipolar, holding 144572 B of text and 108426 elements, which one bit per element would
write as 13554 B. The hypervectors are not in the int8 form at all: 38158 of the 58462 payloads
are already "b8192:<base64>", core/signal.mjs packHV's one bit per lane, and they hold 52429092
B of the table's text, 63.48% of it. core/signal.mjs dataToJSON has called packHV on every
bipolar hv since before this note existed, so the 10.7x was already spent.

| kind | decoded bytes | count | text bytes | every element bipolar |
| --- | --- | --- | --- | --- |
| packedHV | 1024 | 38158 | 52429092 | false |
| base64Bytes | 262144 | 66 | 23068848 | false |
| base64Bytes | 368168 | 5 | 2454460 | false |
| base64Bytes | 64 | 19636 | 1727968 | false |
| base64Bytes | 736336 | 1 | 981784 | false |
| base64Bytes | 258296 | 1 | 344396 | false |
| base64Bytes | 92042 | 2 | 245448 | false |
| base64Bytes | 184084 | 1 | 245448 | false |
| base64Bytes | 32768 | 5 | 218460 | false |
| base64Bytes | 1024 | 156 | 213408 | false |
| base64Bytes | 129148 | 1 | 172200 | false |
| int8Bipolar | 92042 | 1 | 122724 | true |
| base64Bytes | 65536 | 1 | 87384 | false |
| base64Bytes | 9216 | 7 | 86016 | false |
| base64Bytes | 512 | 100 | 68400 | false |
| base64Bytes | 256 | 177 | 60888 | false |

The int8 bipolar payloads that the premise was written for do exist, and they are a different
population at every size: 71 of 2493 payloads at 12x256 (775604 B of text, 72955 B packed), 69
of 10612 at 100x256 (779516 B, 73071 B packed), 3 of 58462 at 1000x256. A cut aimed only at
them buys less as the organism grows, which is the opposite of what the budget needs.

### Step 1, what inflight and mailboxes actually carry

34.6 MB of inflight and 7.5 MB of mailboxes survived the format 3 blob pass, and the contract
asked which shape holds them. Measured at 1000x256, in the format 3 file and byte for byte the
same in the format 4 file:

| section | total | number lists | numeric key objects | strings under 48 | strings 48 or more | blob references | scalars | frame |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| inflight | 34621280 | 160930 (6718) | 0 (0) | 2424616 (303254) | 0 (0) | 641786 (74297) | 8395908 (2422573) | 22998040 |
| mailboxes | 7526476 | 30139 (1257) | 0 (0) | 688385 (85557) | 0 (0) | 128268 (14859) | 2078727 (444394) | 4600957 |
| outbox | 363802 | 25126 (1088) | 0 (0) | 25605 (4950) | 0 (0) | 18765 (2171) | 56445 (22317) | 237861 |

The column that answers the question is "strings 48 or more": it is 0 in all three. Nothing is
hiding from the table. Every payload in inflight, in the mailboxes and in the outbox already
became a reference (74297, 14859 and 2171 of them). The standing guess that those surviving
bytes were number lists, typed arrays written as objects with numeric keys, or short strings is
wrong on the first two: there are no numeric key objects anywhere, and the number lists hold
160930 B of 34621280.

What holds them is the JSON frame, 22998040 B of inflight (66.43%) and 4600957 B of mailboxes
(61.13%), 27598997 B between them. That is the key names and the punctuation of 74297 in flight
envelopes and 14859 mailbox items, each one written as

```
{"at":N,"sig":{"kind":"hv","data":"~b1234","t":N,"gen":N,"src":N,"port":N,"seq":N},"w":N,"e":N,"from":N,"dst":N,"dstPort":N}
```

The second largest column is scalars, 8395908 B in 2422573 of them: the small integers those
keys name.

The largest cell state keys are the same story told at a smaller size. At 1000x256 vecs is
955874 B of which 759002 B sits in 23781 strings UNDER 48 bytes, too short for a reference, and
155214 B in 17534 references; keys is 366745 B of which 327310 B is 39061 references; values is
922219 B of which 638288 B is frame; times is 856089 B in 142 number lists and labels 206918 B
in 227 number lists, and those two are the only large plain decimal lists left in a cell.

### Step 2, what was packed, and why that and not something else

Format 4 keeps the document byte for byte what format 3 made of it, the same references, the
same escapes, the same keys, and changes only what the `blobs` table holds: a record stream of
the payloads' decoded bytes, deflated and base64ed once at the end, each record tagged so the
reader rebuilds the original string exactly. tag 3 packs a canonical base64 int8 payload whose
every byte is +1 or -1 at one bit per element; tag 4 keeps a "b<lanes>:" marker as text and
decodes only the base64 after it; tag 2 is the decoded bytes of any other canonical base64
payload; tag 1 is the raw bytes of anything that does not re-encode to itself, so a payload is
never silently rewritten. A string takes a tag other than 1 only when re-encoding reproduces it,
so identity is decided at write time and the reader never guesses.

The measured effect is small and it is small for a reason the histogram already gave. Deflate
over base64 text recovers most of the 4/3 the base64 spends, so converting text to bytes before
deflating buys the remainder and nothing more, and the one encoding that would have bought a
factor, one bit per element, applies to 3 payloads of 58462 at the size that misses the budget.

| row | format 3 | format 4 | saved | percent | blobs 3 | blobs 4 |
| --- | --- | --- | --- | --- | --- | --- |
| 12x256 | 4069116 | 3865723 | 203393 | 5.00 | 2968819 | 2765426 |
| 100x256 | 21146908 | 20722851 | 424057 | 2.01 | 12396041 | 11971984 |
| 1000x256 | 116076097 | 113563379 | 2512718 | 2.16 | 65459119 | 62946401 |
| 12x100000 | 16509851 | 15336326 | 1173525 | 7.11 | 15340815 | 14167290 |

Every byte saved is a byte of the table. Nothing else moved, and the bench measures that rather
than asserting it: armsIdenticalOutsideTable is true on all four rows, which is a byte compare
of clock, stats, cells and connectome between the format 3 file and the format 4 file, and
reparseIdentical is true on all four, which says the format 3 arm's detour through the reader
costs nothing.

### Bytes per top level section at 1000x256, format 3 and format 4

| section | format 3 | format 4 |
| --- | --- | --- |
| blobs | 65459119 | 62946401 |
| inflight | 34621280 | 34621280 |
| mailboxes | 7526476 | 7526476 |
| cells | 6366500 | 6366500 |
| circuits | 973545 | 973545 |
| extras | 763817 | 763817 |
| outbox | 363802 | 363802 |
| regions | 622 | 622 |
| connectome | 263 | 263 |
| stats | 153 | 153 |
| gate | 151 | 151 |
| coact | 102 | 102 |
| rng | 44 | 44 |
| name | 21 | 21 |
| clock | 17 | 17 |
| ledger | 12 | 12 |
| version | 1 | 1 |
| frame | 172 | 172 |

### The 50 MB budget at 1000x256, and how far away it is

113563379 B is 61134579 B over the 52428800 B budget, 58.302 MB over. The distance is not a
table problem and the table is not where the next cut is. Delete the table entirely and the
same file is 50616978 B, which leaves 1811822 B of headroom for 82591116 B of distinct payload
text in 58462 payloads: the table would have to reach 45.58 to 1 where it reaches 1.312 to 1,
on content that is already one bit per lane. No encoding of distinct payloads closes that gap.
The two cuts the census does name, and neither is a format 4 change, are the 27598997 B of
repeated key text in inflight and mailboxes (a key table, which format 3 deliberately refused
so that keys stay the bytes they always were), and the organism itself: 8072 cells at 1000
majors hold 74297 signals in flight and 14859 mailbox items at t=200, and a checkpoint that
holds them all is the checkpoint of a brain that big.

Restore did not pay for the unpacking in any way the numbers show. At 1000x256 restoreMs went
5668.9 to 5728.6, 59.7 ms on a 5.7 second restore and on a file that shrank by 2512718 B; at
12x256 it went 262.1 to 214.1, faster; at 100x256 880.1 to 972.9; at 12x100000 712.7 to 647.5.
The unpacking that format 4 adds is one pass over 62946401 B of inflated table, and the reading
it removes is 2512718 B of base64 that is no longer on disk, so the two are the same order and
the row to row sign is noise, not a cost. restoredIdentical is true on all four rows in both
arms and crossFormatIdentical is true on all four.

bench/verdicts/checkpoint.json holds the run this section reads, arms 3 and 4 interleaved on one
brain per row: the 1000x256 row, which format 3 wrote as 116076097 B (110.699 MB), format 4
writes as 113563379 B (108.302 MB), 2512718 B smaller and still 61134579 B over the declared
52428800 B budget, so the pocket still does not hold the brain at 1000 majors; and the 12x100000
row, which format 3 wrote as 16509851 B (15.745 MB), format 4 writes as 15336326 B (14.626 MB),
the largest proportional gain of the four at 7.11% and comfortably inside the budget. The other
two rows came down and neither grew, 12x256 from 4069116 B to 3865723 B and 100x256 from
21146908 B to 20722851 B, and bench/verdicts/checkpoint-before.json holds the same four rows
with format 2 beside them, where 1000x256 was 237845104 B.
