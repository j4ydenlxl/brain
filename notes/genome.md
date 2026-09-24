# notes/genome.md: one core change requested by the genome subsystem

Written by the organism-as-source work (seeds/organism.mjs, genome/, bench/scale.mjs).
Nothing in core/ was edited. The request is exact and one line.

## Request 1: `Connectome._index` cannot index a connectome bigger than a small brain

`core/connectome.mjs`, in `_index()`:

```js
const n = this.n, maxNode = n ? Math.max(...this.src.subarray(0, n), ...this.dst.subarray(0, n)) + 1 : 0;
```

`Math.max(...typedArray)` spreads every element into an argument list. Above roughly fifty
thousand edges the runtime refuses the call. Measured on this machine with Node v24.15.0,
spreading two subarrays of length n into one `Math.max`:

```
n=1000 ok max=999
n=10000 ok max=9999
n=50000 ok max=49999
n=96000 THREW RangeError: Maximum call stack size exceeded
n=125000 THREW RangeError: Maximum call stack size exceeded
n=200000 THREW RangeError: Maximum call stack size exceeded
n=480000 THREW RangeError: Maximum call stack size exceeded
```

The organism at 5,000 major nodes has 40,000 cells and hundreds of thousands of edges, so
every call into `outOf`, `into` or `find` on it would throw. `_index` is reached from
`Brain._emit` on every signal, so the brain could not tick at all.

**The exact change**: replace that line with a loop.

```js
const n = this.n;
let maxNode = 0;
for (let e = 0; e < n; e++) {
  if (this.src[e] + 1 > maxNode) maxNode = this.src[e] + 1;
  if (this.dst[e] + 1 > maxNode) maxNode = this.dst[e] + 1;
}
```

Same value, same counting sort underneath, no spread. Nothing else in `_index` changes.

**What this subsystem does meanwhile**: `genome/wire.mjs` exports `reindex(connectome,
cellCount)`, which fills `_bySrc`, `_byDst`, `_nodes` and clears `_dirty` with exactly that
loop, from outside core. `seeds/organism.mjs` and `genome/load.mjs` call it once after bulk
wiring, so the built organism ticks. The workaround holds only while no edge is added after
the build: `Connectome.add` sets `_dirty`, and the next `outOf` would fall back into core's
own `_index` and throw. That is why `buildOrganism` defaults `growth.sampleBudget` to 0,
which switches structural growth off. After this change lands, growth can be switched back
on at organism scale and the default can be raised.

## Request 3: `predict.next` emits a NaN inside a `num` when a hypervector bundles to zero

`cells/basic.mjs`, `predict.next`, error port, by way of `core/primitives.mjs` `predict`:

```js
else if (kind === 'hv') error = (1 - S.sim(observed, prediction)) / 2;
```

`S.sim(a, b)` is a cosine: a dot product over the product of two norms. A hypervector that
bundled to all zeros has norm zero, so `sim` is `0/0`, `error` is NaN, and the cell emits
`{ kind: 'num', data: { type: 'float', x: NaN } }`. `num` is defined in DESIGN.md section 1
as an exact typed quantity, and the first exact-arithmetic cell downstream throws
`num: not a decimal: NaN` inside `toRat`.

Measured: building the organism at 1,000 major nodes and ticking it 20 times, with
`Brain._emit` wrapped to inspect every `num` payload, produced

```
bad num emissions:
  4 x predict.next port 1 {"type":"float","x":null}
cell errors 1
```

(`null` is how `JSON.stringify` renders NaN.) Four NaN emissions, one caught cell throw.

**The exact change**: in `core/primitives.mjs` `predict`, treat a zero-norm comparison as
maximum error rather than as a division:

```js
else if (kind === 'hv') { const s = S.sim(observed, prediction); error = Number.isFinite(s) ? (1 - s) / 2 : 1; }
```

An alternative that fixes more callers at once is to make `S.sim` return 0 when either norm
is zero, since two vectors one of which carries no information are not similar. That would
also cover `hv.cleanup` and `hv.compare`, which have the same division.

**What this subsystem does meanwhile**: `seeds/organism.mjs` has a `BLOCKED_OUT` table, one
entry long, that keeps `predict.next` port 1 unwired in this organism. The table is
explicit and carries this reason, and it should be emptied once the fix above lands.
`bench/scale.mjs` asserts zero cell errors, so if any other NaN path appears the bench goes
red rather than quietly averaging it away.

## Request 2 (smaller, not blocking): a bulk wiring path on Brain

`Brain.connect` calls `this.connectome.find(...)`, which calls `outOf`, which rebuilds the
whole index because the previous `add` marked it dirty. Wiring E edges one at a time
therefore costs O(E^2) index rebuilds. `genome/wire.mjs` has a `Wiring` class that keeps its
own dedupe set, runs the same legality check `Brain.connect` runs (in fact the stricter
subset rule `Brain.compatiblePorts` uses), appends through `Connectome.add`, and indexes
once at the end. If core wants this, the shape that would work is a `Brain.connectMany(list)`
that defers the index, or a `{ dedupe: false }` option on `connect`.

## Answered in core (2026-09-16)

Request 1 done: _index finds the max node with a loop. Request 2 done: the connectome keeps a (src,dst,srcPort,dstPort) key map, find() is O(1), connect 20000 edges printed 6.2 ms. Request 3 done: the hv prediction error reads a non-finite similarity as maximum error 1, never NaN. core 15/15, cells 22/22, genome 33/33 after the change.

## Workarounds lifted (2026-09-16)

All three sections above are history. The paragraphs that describe what this subsystem does
"meanwhile" no longer describe the code.

**Request 1, `reindex`**: deleted. Measured on the 5000 major connectome, five runs each of
`reindex(wire.mjs)` and core's own `_index()`: mine 3.36 9.97 2.59 2.66 2.82 ms, core 4.54
2.8 2.9 2.84 2.85 ms, median 2.82 against 2.85, with the same `outOf(7)` and the same 40000
nodes. That is the same number, so nothing here reaches into core's internals any more and
`Wiring.finish()` just warms the index through the public `outOf`.

**Request 2, `Wiring`**: kept, on measurement rather than necessity. Adding the same
distinct edges to the same brain: 20,000 edges `Brain.connect` 14.1 ms against `Wiring`
9.4 ms, 200,000 edges 106.3 against 73.8, 432,836 edges 278.8 against 230.7. It is 1.21x to
1.50x faster over that range and it enforces the stricter subset rule, which `Brain.connect`
does not.

**Request 3, the blocked port**: `BLOCKED_OUT` is empty. `predict.next.error` is wired like
every other out port, and `test/genome.test.mjs` now asserts that it is wired and that the
organism still throws nothing over fifty ticks.

**`growth.sampleBudget`**: back to core's default, so the organism grows structure. That
exposed one more thing, which needs no core change but is worth core knowing.

### Observation: growth does not know an in port is already speaking a kind

A cell's in port is monomorphic in practice even when its declared kinds are not. Fed a
`num`, a cell keeps `num` state; a `vec` arriving on the same port next tick makes it read a
field that is not there, and it throws "num: cannot convert undefined". `Brain.tick` grows
edges through `compatiblePorts`, which compares declared kind sets and cannot know what the
port has already received, so a co-activation edge can legally land a second kind on a port
that is already speaking a first one.

Measured at majors 40 over fifty ticks with core's own policy: 3230 edges grown, 22 in ports
carrying two different kinds, 211 cell errors. This subsystem fixed it in its own gate policy
rather than in core, because the gate is exactly the place core provides for it:
`genome/wire.mjs` exports `monomorphicGrowth(gateOpts)`, which wraps `makePolicy` and
rejects an `edge.grow` whose destination port is already claimed by a different kind. Both
`buildOrganism` and `loadOrganism` install it, so a grown brain and a loaded one grow the
same way. Same measurement with the rule in place: 3499 edges grown, 0 clashes, 0 errors.

If core wants this centrally, the shape would be for `Brain.compatiblePorts` (or the growth
call site) to consult the afferents a port already has, not only the kinds it declares.

## Request 3 follow-up: the NaN came from the width boundary, not only from a zero norm (2026-09-17)

The hv case was already guarded. `bench/scale.mjs` on 2026-09-17 still counted 6 cell errors at
5,000 majors and 12 at 10,000, all `num: not a decimal: NaN`, thrown inside predict.next and
evaluate.threshold. Wrapping `Brain._emit` at 5,000 majors for 20 ticks tallied the producers:
integrate.ema 1019 vec emissions holding a NaN, aggregate.mean 1732, predict.next 13 vec and 17
num. Every NaN sat at index 1, 4 or 8, the widths of the narrower vec kinds the organism wires
into the same port (reservoir.echo emits 1, vec.mlp 4, the encoders 8 and 16). `integrate` read
`x[i]` past the end of a narrower sample, `vecMean` read past the end of a narrower member, and
`predict` read `prev[i]` past the end of a narrower history entry.

The change, in core: `integrate` holds a dimension the sample does not carry and takes the sample
as the first value of a dimension the state never had; `vecMean` averages each dimension over the
vectors that carry it; `predict` extrapolates a dimension prev never had from last alone and
measures error over the dimensions both carry. In `cells/basic.mjs`, predict.next emits its error
only when it is finite: a num is an exact quantity and a NaN never becomes one. The same probe
after the change: 0 bad emissions and 0 cell errors at 5,000 and at 10,000 majors.
`test/core.test.mjs` pins all three primitives at the boundary.
