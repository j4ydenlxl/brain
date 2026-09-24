// core/simd.mjs: 16-LANE HYPERVECTOR KERNELS, AND THE HEAP THE HYPERVECTORS LIVE IN.
// Node 24 ships WebAssembly SIMD; nothing on this machine can compile wasm text (zero
// dependencies is a rule), so this file carries its own assembler: a few LEB128 helpers and
// the opcode bytes, emitting a module whose functions read and write Int8 vectors in linear
// memory sixteen lanes at a time. Every kernel takes BYTE OFFSETS into that memory:
//
//   bundle(ptrs, count, n, tie, out)         majority vote of count bipolar vectors whose
//                                            offsets sit in an i32 table at ptrs
//   wbundle(ptrs, count, n, w, f, tie, out, acc)
//                                            weighted bundle: acc[i] = sum_k w[k] * v_k[i] in
//                                            f64x2 lanes (the same IEEE adds, in the same
//                                            member order, as the Float64Array loop it
//                                            replaces), then sign(acc) with bundle()'s tie
//   bind(a, b, out, n)                       elementwise product of two bipolar vectors
//   equal(a, b, n) -> i32                    number of equal lanes (hamming = n - equal)
//   dot(a, b, n) -> i32                      exact integer dot on any Int8 lanes
//   hpack(a, b, bytes) -> i32                differing bits of two bit-packed vectors
//   wacc(base, count, n, wptr, accptr)       i32 weighted accumulation of contiguous members
//
// THE HEAP. The hypervectors core produces (hvRandom, hvFromSeed, bind, bundle, permute, the
// unpack of the wire format) are Int8Array views on this module's linear memory, handed out
// by a slot allocator with a free list, so a kernel reads them where they are and copies
// nothing. Before this, every kernel call copied every operand into scratch (bytesOf ... set)
// and copied the result back out (buffer.slice). Rules that follow from the views:
//   - the memory NEVER grows. mem.grow() detaches every view on the old buffer (they read as
//     length 0), so the memory is created at its final size and the kernels' scratch is a
//     fixed region in front of the slots. A call whose operands would not fit the scratch
//     returns null and the caller keeps its scalar loop.
//   - the heap is INSTALLED ON FIRST USE, not at import. Import builds the module and an
//     instance on the scratch pages alone, so available, fits and every kernel answer from
//     import as they always did; ready() then replaces that memory with the full sized one
//     the first time a call could hand out a slot. That is the one moment the memory may be
//     replaced: no view has escaped yet (alloc hands out nothing while slots is 0) and every
//     kernel entry point calls ready() before it places an operand. See ready() below.
//   - a slot comes back two ways: a FinalizationRegistry on the view returns it when V8 has
//     collected the view (which happens at an event loop turn after a GC, never inside a
//     synchronous loop: measured 0 callbacks inside a 1000000 allocation loop and 476620 at
//     the next turn), or release(view) returns it now, for an owner who knows the vector is
//     an intermediate nobody else holds. release unregisters the view first, so a slot is
//     never returned twice, and a second release of the same view is a counted no-op.
//   - a slot CANNOT come back synchronously. Measured on this machine, node v24.15.0: a
//     forced full collection inside one job clears no WeakRef and fires no finalizer (0 of
//     5000 in the plain control, 0 of 20000 slot views), because `new WeakRef(t)` itself
//     performs AddToKeptObjects(t) and the kept set is cleared at the end of the job. So a
//     "reclaim point" a synchronous tick loop could call cannot exist: inside one job the
//     only slot that comes back is one an owner RELEASES. buildWhole at 12 majors plus 200
//     ticks ends with 65536 of 65536 slots in use and 0 finalizer calls; a forced collection
//     and event loop turns after it return 65395 of them, so 99.78% of the heap was garbage
//     the run could not see.
//   - the heap is SIZED TO THE ORGANISM by plan(), called by the build site before the first
//     allocation, because the memory cannot grow afterwards. BRAIN_HV_HEAP_MB still wins.
//   - when the heap is full, alloc returns null and the caller allocates a plain Int8Array;
//     fallbacks are counted, and heapStats() reports slots, inUse, peak and fallbacks. Set
//     BRAIN_HV_HEAP_MB to size the heap (default 512 in the main thread and 64 in a worker,
//     since a cluster holds one heap per shard thread and Windows charges commit for a wasm
//     memory before it is touched). BRAIN_HV_HEAP_REPORT names a file every thread appends
//     its counters to, every 4096 allocations and on every full transition, because a worker
//     that is terminated runs no exit hook.
// Every kernel is graded lane-for-lane against the scalar version in test/simd.test.mjs and
// test/hvheap.test.mjs, on random inputs, including the tie positions and mixed operands.
import { appendFileSync } from 'node:fs';
import { isMainThread, threadId } from 'node:worker_threads';

const I32 = 0x7f, V128 = 0x7b;
const uleb = (n) => { const o = []; do { let b = n & 0x7f; n >>>= 7; if (n) b |= 0x80; o.push(b); } while (n); return o; };
const sleb = (n) => { const o = []; for (;;) { let b = n & 0x7f; n >>= 7; const done = (n === 0 && !(b & 0x40)) || (n === -1 && (b & 0x40)); if (!done) b |= 0x80; o.push(b); if (done) return o; } };
const str = (s) => { const b = [...Buffer.from(s, 'utf8')]; return [...uleb(b.length), ...b]; };
const section = (id, bytes) => [id, ...uleb(bytes.length), ...bytes];
const vec = (items) => [...uleb(items.length), ...items.flat()];

// opcodes
const get = (i) => [0x20, ...uleb(i)], set = (i) => [0x21, ...uleb(i)], tee = (i) => [0x22, ...uleb(i)];
const i32 = (v) => [0x41, ...sleb(v)];
const ADD = [0x6a], SUB = [0x6b], MUL = [0x6c], GE_U = [0x4f], POPCNT = [0x69], SHL = [0x74];
const BLOCK = [0x02, 0x40], LOOP = [0x03, 0x40], END = [0x0b];
const br = (d) => [0x0c, ...uleb(d)], brIf = (d) => [0x0d, ...uleb(d)];
const v = (code) => [0xfd, ...uleb(code)];
const VLOAD = [...v(0), 0, 0], VSTORE = [...v(11), 0, 0];
const vload = (off) => [...v(0), 0, ...uleb(off)], vstore = (off) => [...v(11), 0, ...uleb(off)];
const I32LOAD = [0x28, 2, 0], F64LOAD = [0x2b, 3, 0];
const SPLAT8 = v(15), EQ8 = v(35), LT8 = v(37), GT8 = v(39), AND = v(78), ANDNOT = v(79), XOR = v(81), BITMASK8 = v(100), ADD8 = v(110), SUB8 = v(113);
const SPLAT32 = v(17), SPLATF64 = v(20), EXTMUL_LO = v(156), EXTMUL_HI = v(157), EXTADD_PAIR = v(126), ADD32 = v(174);
const lane32 = (k) => [...v(27), k];
const POPCNT8 = v(98), EXTADD_U8 = v(125), EXTADD_U16 = v(127);
const EXT_LO_I8 = v(135), EXT_HI_I8 = v(136), EXT_LO_I16 = v(167), EXT_HI_I16 = v(168), MUL32 = v(181);
const NARROW16 = v(133), NARROW8 = v(101), SUB64 = v(209);
const LTF64 = v(73), GTF64 = v(74), ADDF64 = v(240), MULF64 = v(242), CONVF64 = v(254);
const shuffle = (lanes) => [...v(13), ...lanes];
const HI32 = shuffle([8, 9, 10, 11, 12, 13, 14, 15, 8, 9, 10, 11, 12, 13, 14, 15]); // i32 lanes 2,3 down to 0,1
const EVEN = shuffle([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30]);

function func(params, results, locals, body) {
  const type = [0x60, ...vec(params.map(p => [p])), ...vec(results.map(r => [r]))];
  const decl = vec(locals.map(([count, t]) => [...uleb(count), t]));
  const code = [...decl, ...body.flat(Infinity), ...END];
  return { type, code: [...uleb(code.length), ...code] };
}

// bundle(ptrs=0, count=1, n=2, tie=3, out=4): member k is at the i32 offset ptrs[k], so a
// member that already lives in the heap is read in place. Bipolar lanes only, count < 128
// (the Int8 accumulator). locals 5 i, 6 k, 7 acc, 8 fT, 9 eqz, 10 neg1, 11 zero
const bundleFn = func([I32, I32, I32, I32, I32], [], [[2, I32], [5, V128]], [
  i32(-1), SPLAT8, set(10), i32(0), SPLAT8, set(11), i32(0), set(5),
  BLOCK, LOOP,
    get(5), get(2), GE_U, brIf(1),
    get(0), I32LOAD, get(5), ADD, VLOAD, set(7),
    i32(1), set(6),
    BLOCK, LOOP,
      get(6), get(1), GE_U, brIf(1),
      get(7), get(0), get(6), i32(2), SHL, ADD, I32LOAD, get(5), ADD, VLOAD, ADD8, set(7),
      get(6), i32(1), ADD, set(6),
      br(0),
    END, END,
    // fT = f * T for bipolar lanes = neg1 - 2 * eq(f, T)
    get(10), get(0), I32LOAD, get(5), ADD, VLOAD, get(3), get(5), ADD, VLOAD, EQ8, tee(8), get(8), ADD8, SUB8, set(8),
    get(7), get(11), EQ8, set(9),
    get(4), get(5), ADD,
    get(7), get(11), LT8, get(7), get(11), GT8, SUB8, get(9), get(8), AND, ADD8,
    VSTORE,
    get(5), i32(16), ADD, set(5),
    br(0),
  END, END,
]);

// wbundle(ptrs=0, count=1, n=2, w=3, f=4, tie=5, out=6, acc=7): the weighted bundle. Phase 1
// clears the f64 accumulator (8n bytes). Phase 2 adds w[k] * v_k[i] into it, member by
// member, so every lane sees the same additions in the same order as the scalar loop and
// the result is the same double, bit for bit: the 16 Int8 lanes are widened to i16, i32, and
// converted two at a time to f64x2 (the high pair of each i32x4 is shuffled down first).
// Phase 3 turns the accumulator into signs: gt and lt against zero give i64 masks, neg - pos
// is -1, 0 or 1 per lane, two saturating narrows and one shuffle bring the sixteen lanes
// back to one Int8 vector, and a zero lane takes f * T (exact for any Int8 f: f * T with
// T = -1 is (f xor -1) - (-1), which wraps the way an Int8Array store wraps), or 1 where
// that product is 0, which is core's `f[i] * TIE[i] || 1`. A NaN weight makes every
// compare false and every lane a tie, as it does in JS.
// locals: i32 8 i, 9 k, 10 vptr, 11 aptr; v128 12 w, 13 v8 then v16 high, 14 v16 low,
// 15 v32, 16 zero, 17 signs, 18 mask, 19 fT
const pair = (p, high) => [get(11), get(11), vload(16 * p), get(15), ...(high ? [get(15), HI32] : []), CONVF64, get(12), MULF64, ADDF64, vstore(16 * p)];
const sgn = (p) => [get(11), vload(16 * p), get(16), LTF64, get(11), vload(16 * p), get(16), GTF64, SUB64];
const wbundleFn = func([I32, I32, I32, I32, I32, I32, I32, I32], [], [[4, I32], [8, V128]], [
  i32(0), SPLAT32, set(16), i32(0), set(8),
  BLOCK, LOOP,
    get(8), get(2), i32(3), SHL, GE_U, brIf(1),
    get(7), get(8), ADD, get(16), VSTORE,
    get(8), i32(16), ADD, set(8),
    br(0),
  END, END,
  i32(0), set(9),
  BLOCK, LOOP,
    get(9), get(1), GE_U, brIf(1),
    get(3), get(9), i32(3), SHL, ADD, F64LOAD, SPLATF64, set(12),
    get(0), get(9), i32(2), SHL, ADD, I32LOAD, set(10),
    i32(0), set(8),
    BLOCK, LOOP,
      get(8), get(2), GE_U, brIf(1),
      get(10), get(8), ADD, VLOAD, set(13),
      get(7), get(8), i32(3), SHL, ADD, set(11),
      get(13), EXT_LO_I8, set(14), get(13), EXT_HI_I8, set(13),
      get(14), EXT_LO_I16, set(15), pair(0, false), pair(1, true),
      get(14), EXT_HI_I16, set(15), pair(2, false), pair(3, true),
      get(13), EXT_LO_I16, set(15), pair(4, false), pair(5, true),
      get(13), EXT_HI_I16, set(15), pair(6, false), pair(7, true),
      get(8), i32(16), ADD, set(8),
      br(0),
    END, END,
    get(9), i32(1), ADD, set(9),
    br(0),
  END, END,
  i32(0), set(8),
  BLOCK, LOOP,
    get(8), get(2), GE_U, brIf(1),
    get(7), get(8), i32(3), SHL, ADD, set(11),
    sgn(0), sgn(1), NARROW16, sgn(2), sgn(3), NARROW16, NARROW8, set(17),
    sgn(4), sgn(5), NARROW16, sgn(6), sgn(7), NARROW16, NARROW8, set(18),
    get(17), get(18), EVEN, set(17),
    get(5), get(8), ADD, VLOAD, get(16), LT8, set(18),
    get(4), get(8), ADD, VLOAD, get(18), XOR, get(18), SUB8,
    get(5), get(8), ADD, VLOAD, get(16), EQ8, ANDNOT, set(19),
    get(19), get(19), get(16), EQ8, SUB8, set(19),
    get(6), get(8), ADD,
    get(17), get(17), get(16), EQ8, get(19), AND, ADD8,
    VSTORE,
    get(8), i32(16), ADD, set(8),
    br(0),
  END, END,
]);

// bind(a=0, b=1, out=2, n=3); locals 4 i, 5 neg1, 6 eq
const bindFn = func([I32, I32, I32, I32], [], [[1, I32], [2, V128]], [
  i32(-1), SPLAT8, set(5), i32(0), set(4),
  BLOCK, LOOP,
    get(4), get(3), GE_U, brIf(1),
    get(2), get(4), ADD,
    get(5), get(0), get(4), ADD, VLOAD, get(1), get(4), ADD, VLOAD, EQ8, tee(6), get(6), ADD8, SUB8,
    VSTORE,
    get(4), i32(16), ADD, set(4),
    br(0),
  END, END,
]);

// equal(a=0, b=1, n=2) -> i32; locals 3 i, 4 cnt
const equalFn = func([I32, I32, I32], [I32], [[2, I32]], [
  i32(0), set(3), i32(0), set(4),
  BLOCK, LOOP,
    get(3), get(2), GE_U, brIf(1),
    get(4), get(0), get(3), ADD, VLOAD, get(1), get(3), ADD, VLOAD, EQ8, BITMASK8, POPCNT, ADD, set(4),
    get(3), i32(16), ADD, set(3),
    br(0),
  END, END,
  get(4),
]);

// dot(a=0, b=1, n=2) -> i32 exact integer dot product for any Int8 lanes; locals 3 i, 4 acc
const dotFn = func([I32, I32, I32], [I32], [[1, I32], [1, V128]], [
  i32(0), SPLAT32, set(4), i32(0), set(3),
  BLOCK, LOOP,
    get(3), get(2), GE_U, brIf(1),
    get(4), get(0), get(3), ADD, VLOAD, get(1), get(3), ADD, VLOAD, EXTMUL_LO, EXTADD_PAIR, ADD32,
    get(0), get(3), ADD, VLOAD, get(1), get(3), ADD, VLOAD, EXTMUL_HI, EXTADD_PAIR, ADD32, set(4),
    get(3), i32(16), ADD, set(3),
    br(0),
  END, END,
  get(4), lane32(0), get(4), lane32(1), ADD, get(4), lane32(2), ADD, get(4), lane32(3), ADD,
]);

// hpack(a=0, b=1, bytes=2) -> i32: differing bits between two bit-packed vectors. A bipolar
// vector of n lanes packs to n/8 bytes (lane +1 is bit 1), its hamming distance to another
// is popcount(a xor b), and its dot is n - 2 * hamming: 128 lanes per instruction instead of
// 16, for the codebook scans that grow with everything a brain has seen; locals 3 i, 4 acc
const hpackFn = func([I32, I32, I32], [I32], [[1, I32], [1, V128]], [
  i32(0), SPLAT32, set(4), i32(0), set(3),
  BLOCK, LOOP,
    get(3), get(2), GE_U, brIf(1),
    get(4), get(0), get(3), ADD, VLOAD, get(1), get(3), ADD, VLOAD, XOR, POPCNT8, EXTADD_U8, EXTADD_U16, ADD32, set(4),
    get(3), i32(16), ADD, set(3),
    br(0),
  END, END,
  get(4), lane32(0), get(4), lane32(1), ADD, get(4), lane32(2), ADD, get(4), lane32(3), ADD,
]);

// wacc(base=0, count=1, n=2, wptr=3, accptr=4): acc[i] = sum over members k of w[k] * v_k[i],
// in i32 lanes, on any Int8 lane values. The semantic tier's Hopfield step is a weighted
// bundle of every stored pattern under softmax weights scaled to integers up to 1e6 that sum
// to about 1e6, so |acc| stays far under 2^31. Scalar JS spent 55.5 s of a 117.2 s soak
// profile in that bundle (2026-09-17). locals: i32 5 i, 6 k, 7 vptr, 8 aptr, 9 p;
// v128 10 w (a zero vector while acc is cleared), 11 v8, 12 lo16, 13 hi16
const waccFn = func([I32, I32, I32, I32, I32], [], [[5, I32], [4, V128]], [
  i32(0), SPLAT32, set(10), i32(0), set(5),
  BLOCK, LOOP,
    get(5), get(2), i32(2), SHL, GE_U, brIf(1),
    get(4), get(5), ADD, get(10), VSTORE,
    get(5), i32(16), ADD, set(5),
    br(0),
  END, END,
  i32(0), set(6),
  BLOCK, LOOP,
    get(6), get(1), GE_U, brIf(1),
    get(3), get(6), i32(2), SHL, ADD, I32LOAD, SPLAT32, set(10),
    get(0), get(6), get(2), MUL, ADD, set(7),
    i32(0), set(5),
    BLOCK, LOOP,
      get(5), get(2), GE_U, brIf(1),
      get(7), get(5), ADD, VLOAD, set(11),
      get(11), EXT_LO_I8, set(12), get(11), EXT_HI_I8, set(13),
      get(4), get(5), i32(2), SHL, ADD, set(8),
      get(8), get(8), VLOAD, get(12), EXT_LO_I16, get(10), MUL32, ADD32, VSTORE,
      get(8), i32(16), ADD, tee(9), get(9), VLOAD, get(12), EXT_HI_I16, get(10), MUL32, ADD32, VSTORE,
      get(8), i32(32), ADD, tee(9), get(9), VLOAD, get(13), EXT_LO_I16, get(10), MUL32, ADD32, VSTORE,
      get(8), i32(48), ADD, tee(9), get(9), VLOAD, get(13), EXT_HI_I16, get(10), MUL32, ADD32, VSTORE,
      get(5), i32(16), ADD, set(5),
      br(0),
    END, END,
    get(6), i32(1), ADD, set(6),
    br(0),
  END, END,
]);

const fns = [bundleFn, wbundleFn, bindFn, equalFn, dotFn, hpackFn, waccFn];
const names = ['bundle', 'wbundle', 'bind', 'equal', 'dot', 'hpack', 'wacc'];
// The module imports its memory ("env" "mem"), so one compiled module serves the heap
// instance and every arena, each with a memory of its own size and growth rule.
const build = () => new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
  ...section(1, vec(fns.map(f => f.type))),
  ...section(2, vec([[...str('env'), ...str('mem'), 0x02, 0x00, ...uleb(1)]])),
  ...section(3, vec(fns.map((_, i) => uleb(i)))),
  ...section(7, vec(names.map((n, i) => [...str(n), 0x00, ...uleb(i)]))),
  ...section(10, vec(fns.map(f => f.code))),
]);
export const moduleBytes = build();

// ---------------------------------------------------------------- the memory
// Fixed scratch in front, slots behind. Sizes in bytes.
const PAGE = 65536;
export const SLOT = 8192;                 // bytes per slot: one hypervector of D = 8192 lanes
export const MAX_N = 65536;               // widest vector a kernel takes (the acc is 8 bytes a lane)
export const MAX_MEMBERS = 1024;          // the pointer table
const PTRS = 0, WTS = 4096, TIEBUF = 12288, OUTBUF = TIEBUF + MAX_N, ACC = OUTBUF + MAX_N;
export const COPY_BYTES = 2 * 1048576;    // room for operands that do not live in the heap
const COPY = ACC + 8 * MAX_N;
const SCRATCH_PAGES = Math.ceil((COPY + COPY_BYTES) / PAGE);
const HEAP_BASE = SCRATCH_PAGES * PAGE;
const envMB = process.env.BRAIN_HV_HEAP_MB;
export const heapMB = envMB !== undefined && envMB !== '' ? Math.max(0, Number(envMB) || 0) : (isMainThread ? 512 : 64);
// wantSlots is what BRAIN_HV_HEAP_MB asks for; slots is what has actually been installed,
// and stays 0 until something asks for its first slot. An AI datacenter in your pocket may
// not charge half a gigabyte to a process that only prints help: tools/footprint-probe.mjs
// measured this module carrying 515.3 MB of external memory into every module that imports
// it, at import, before a single hypervector exists.
let wantSlots = Math.floor(heapMB * 1048576 / SLOT);
let slots = 0;

let module_ = null, inst = null, mem = null, BUF = null, u8 = null, i32v = null, f64v = null, why = '';
// Eager: COMPILE the module. That is the step that decides whether this node has the SIMD
// opcodes at all, which is what `available` has always meant, and it allocates no linear
// memory. Lazy: the one memory, created at its final size on first use. Instantiating a
// scratch-only memory here as well and replacing it later was measured worse than this in
// a process that does build a brain (two memories, the first one abandoned mid-run), so
// there is exactly one WebAssembly.Memory in this module's life.
const instantiate = (pages) => {
  const m = new WebAssembly.Memory({ initial: pages, maximum: pages });
  const i = new WebAssembly.Instance(module_, { env: { mem: m } });
  return [m, i];
};
const views = () => { BUF = mem.buffer; u8 = new Uint8Array(BUF); i32v = new Int32Array(BUF); f64v = new Float64Array(BUF); };
try { module_ = new WebAssembly.Module(moduleBytes); }
catch (e) { module_ = null; why += String(e && e.message || e); }
export const available = module_ !== null;
export const unavailableReason = why;
if (!available) wantSlots = 0;

// ---------------------------------------------------------------- the slot allocator
const EMPTY_I32 = new Int32Array(0), EMPTY_U8 = new Uint8Array(0), EMPTY_U32 = new Uint32Array(0);
let free = EMPTY_I32;
let freeTop = 0;
let used = EMPTY_U8;
// gen[s] counts the times slot s was returned. A finalizer carries the generation its view
// was born in, so a finalizer that fires for a view whose slot was released (and perhaps
// handed out again) is recognised as stale and cannot free the new owner's slot.
let gen = EMPTY_U32;
// BRAIN_HV_HEAP_SITES=1 names, for every allocation, the first stack frame outside this
// module and core/signal.mjs. Declared here, above ready(), because ready() sizes the
// per slot ownership column and BRAIN_HV_HEAP_EAGER=1 calls ready() at import.
const SITES = process.env.BRAIN_HV_HEAP_SITES === '1';
// slotSite[s] is the id of the site that took slot s, -1 while the slot was never taken.
// It is the whole of the ownership census: a slot still marked used at the end of a run
// belongs to the site that took it, and a slot the finalizer returns after the event loop
// turn was that site's garbage. Empty unless SITES.
let slotSite = EMPTY_I32;
// slotRoute[s] is 1 once the vector on slot s left its site as the payload of a signal that
// was scheduled, 0 while it did not. It answers the question a site census alone cannot: a
// site's garbage that WENT SOMEWHERE (a mailbox) is released by whoever takes it off that
// mailbox, and a site's garbage that stayed (a cell state, a memory row) can only be released
// where it is held. core/signal.mjs calls notePayload() from signal() for an hv. Empty unless
// SITES, and cleared when the slot is handed out again.
let slotRoute = EMPTY_U8;
let installed = false, heapRefused = '';
/**
 * Create this module's one memory and instance, and its slot table, on the first call that
 * could reach either. Every exported entry point that places an operand or hands out a slot
 * calls ready() before it touches u8, i32v, f64v or inst, so nothing below ever reads a null
 * view. The rule at the top of this file still holds: the memory is created at its final
 * size and never grows.
 *
 * A heap the machine refuses drops to slots = 0 and the scratch pages alone, exactly as the
 * eager version did; the refusal is kept in heapStats().heapRefused, because unavailableReason
 * is a const that was already exported by then.
 */
function ready() {
  if (installed || !available) return;
  installed = true;
  let want = wantSlots;
  for (;;) {
    const pages = SCRATCH_PAGES + Math.ceil(want * SLOT / PAGE);
    try { [mem, inst] = instantiate(pages); views(); break; }
    catch (e) {
      const msg = String(e && e.message || e);
      if (want === 0) { heapRefused += 'the scratch memory itself was refused: ' + msg; inst = null; break; }
      heapRefused = 'heap of ' + want + ' slots refused: ' + msg + '; ';
      want = 0;
    }
  }
  slots = inst ? want : 0;
  free = new Int32Array(slots);
  for (let s = 0; s < slots; s++) free[s] = slots - 1 - s; // slot 0 is handed out first
  freeTop = slots;
  used = new Uint8Array(slots);
  gen = new Uint32Array(slots);
  // the ownership census needs a slot-wide column, and slots is only known here
  if (SITES) { slotSite = new Int32Array(slots); slotSite.fill(-1); slotRoute = new Uint8Array(slots); }
}
// ---------------------------------------------------------------- sizing the heap to the organism
// The default was a flat 512 MB in the main thread, whatever was about to be built, and the
// memory cannot grow after install (mem.grow detaches every view: see the rules at the top),
// so the size has to be chosen BEFORE the first allocation. plan() is that moment: the brain
// build site calls it with the organism it is about to build, and the slot count comes from
// majors.
//
// The coefficients were read, until 2026-09-18, off the slots still LIVE after a forced
// collection and event loop turns. That was the wrong ruler: a synchronous build and tick
// loop never reaches a turn, so nothing is collected inside it and the heap has to hold the
// garbage too. The ruler now is the PEAK a run reaches with a heap it cannot fill.
//
// MEASURED on this machine with BRAIN_HV_HEAP_MB=512 (65536 slots), 256 substrate units,
// 200 ticks, by the flat512 arm of `node bench/footprint.mjs ... --arm-repeat 3`
// (bench/verdicts/footprint.json, 2026-09-18T12:28:08.177Z), after the payload contract in
// core/signal.mjs gave every routed vector an owner:
//   12 majors    peak 2145,  full false, 0 fallbacks         -> the peak is the need
//   100 majors   peak 28504, full false, 0 fallbacks         -> the peak is the need
//   1000 majors  peak 65536, full TRUE, 122604 fallbacks     -> CAPPED: the need is higher
// The same run's after turn reading splits those peaks: at 100 majors 21169 slots were still
// live and 7335 were garbage the run could not collect, so the garbage is a real part of what
// the heap must hold, not an accounting error.
//
// The slope was fitted, before that contract existed, to the two UNCAPPED peaks of the tree of
// the time: (40199 - 4010) / (100 - 12) = 411.24 slots a major, rounded UP to 412 so the line
// sat at or above both points. It is NOT refitted to the peaks above, and the reason is in the
// third row: 1000 majors is still capped at 65536, so a refit would have only the same two low
// points to work from and would tighten the line over exactly the half of the range that no
// longer binds. The line is now above the need at both uncapped sizes rather than through it,
// which is the safe direction: 6992 slots planned for 12 majors against a peak of 2145.
// PLAN_BASE_SLOTS stays 2048, the floor an organism of no majors still gets. The margin is
// nearly free in resident memory: the same bench measured a 65536 slot heap at 12 majors at
// 379.4 MB rss against 380.7 MB for a 3200 slot one, since a slot that is never written is
// never resident.
//
// 1000 majors is an HONEST MISS. Its need is above 65536 slots and PLAN_MAX_SLOTS is 32768,
// so the plan clamps there and that organism falls back on the rest (35.87 percent of its
// attempts in the run above, down from 47.34 before the contract). The ceiling is not raised
// to meet it: 32768 slots is 256 MB, already half a 512 MB pocket budget.
export const PLAN_BASE_SLOTS = 2048;      // the floor an organism of no majors still gets
export const PLAN_SLOTS_PER_MAJOR = 412;  // the measured slope between the two uncapped peaks
export const PLAN_MIN_SLOTS = 1024;
export const PLAN_MAX_SLOTS = 32768;      // 256 MB: the ceiling a pocket sized process may hold
/**
 * The peaks the two constants above were fitted to, in slots, so a test can grade the plan
 * against the measurement rather than against a number somebody typed. `capped` marks a peak
 * that is the heap's own size and therefore a floor on the need, not the need.
 */
export const PLAN_MEASURED_PEAKS = Object.freeze({
  units: 256, ticks: 200, heapSlots: 65536,
  at: '2026-09-18T12:28:08.177Z',
  bySlots: Object.freeze({ 12: 2145, 100: 28504, 1000: 65536 }),
  capped: Object.freeze({ 12: false, 100: false, 1000: true }),
});
/** The slot count plan() would choose for an organism of this size. Pure arithmetic. */
export function planSlots(majors = 0, units = 0) {
  const want = PLAN_BASE_SLOTS + PLAN_SLOTS_PER_MAJOR * Math.max(0, Number(majors) || 0);
  return Math.min(PLAN_MAX_SLOTS, Math.max(PLAN_MIN_SLOTS, Math.round(want)));
}
let planRecord = { applied: false, reason: 'never called' };
/**
 * Size the heap for the organism about to be built. Call before the first allocation.
 *
 * BRAIN_HV_HEAP_MB still wins when it is set: an operator who names a size gets that size,
 * and the plan records that it stood aside. A plan that arrives after the memory is already
 * installed cannot change it either, and says so rather than pretending.
 *
 * @param {{majors?: number, units?: number, slots?: number, by?: string}} o
 * @returns {object} what was decided, for a caller that wants to record it
 */
export function plan({ majors = 0, units = 0, slots: askSlots = 0, by = '' } = {}) {
  const want = askSlots > 0 ? Math.min(PLAN_MAX_SLOTS, Math.round(askSlots)) : planSlots(majors, units);
  const base = { majors, units, by, wouldBeSlots: want, wouldBeMB: Number((want * SLOT / 1048576).toFixed(1)) };
  if (envMB !== undefined && envMB !== '') { planRecord = { ...base, applied: false, reason: 'BRAIN_HV_HEAP_MB=' + envMB + ' wins', slots: wantSlots }; return planRecord; }
  if (installed) { planRecord = { ...base, applied: false, reason: 'the memory was already installed with ' + slots + ' slots', slots }; return planRecord; }
  if (!available) { planRecord = { ...base, applied: false, reason: 'no wasm module: ' + why, slots: 0 }; return planRecord; }
  wantSlots = want;
  planRecord = { ...base, applied: true, reason: 'planned before the first allocation', slots: want };
  return planRecord;
}
/** What plan() decided, or why it did not apply. */
export function heapPlan() { return { ...planRecord }; }

// BRAIN_HV_HEAP_EAGER=1 installs the heap at import: the behaviour this file had before the
// install was deferred. It exists so bench/footprint.mjs can measure the eager arm and the
// lazy arm against each other in one run, on this machine, instead of quoting an older run.
if (process.env.BRAIN_HV_HEAP_EAGER === '1') ready();
let inUse = 0, peak = 0, allocs = 0, fallbacks = 0, tooWide = 0, reclaimed = 0, released = 0, copiedIn = 0, doubleFrees = 0, stale = 0, wasFull = false;
const REPORT = process.env.BRAIN_HV_HEAP_REPORT || '';
const REGISTRY = new FinalizationRegistry((held) => {
  const s = held % slots, g = (held - s) / slots;
  if (gen[s] !== g || !used[s]) { stale++; return; }
  returnSlot(s); reclaimed++;
});

// The allocation site census (SITES, declared above ready()). Slots that never come back
// have an owner somewhere, and this is how that owner is found rather than guessed. Off by
// default: a stack per allocation is far too expensive to pay in a run that is not asking
// the question. Each distinct site gets an id so a slot can carry its owner in one int.
const SITE_COUNT = new Map();
const SITE_KEYS = [];        // id -> key
const SITE_IDS = new Map();  // key -> id
const INSIDE_CORE = '(all frames inside core)';
function siteId(key) {
  let id = SITE_IDS.get(key);
  if (id === undefined) { id = SITE_KEYS.length; SITE_KEYS.push(key); SITE_IDS.set(key, id); }
  SITE_COUNT.set(key, (SITE_COUNT.get(key) || 0) + 1);
  return id;
}
/** The id of the site of this allocation attempt, counting the attempt. Only under SITES. */
function site() {
  const lines = String(new Error().stack).split('\n');
  for (let i = 2; i < lines.length; i++) {
    const l = lines[i];
    if (l.includes('core\\simd.mjs') || l.includes('core/simd.mjs') || l.includes('core\\signal.mjs') || l.includes('core/signal.mjs')) continue;
    return siteId(l.trim().replace(/\\/g, '/').replace(/^at\s+/, '').replace(/.*\/brain\//, ''));
  }
  return siteId(INSIDE_CORE);
}
/** The allocation site census, descending, empty unless BRAIN_HV_HEAP_SITES=1. */
export function heapSites(top = 25) { return [...SITE_COUNT].sort((a, b) => b[1] - a[1]).slice(0, top); }
/** True when the per slot census columns are being filled (BRAIN_HV_HEAP_SITES=1). */
export const sitesEnabled = SITES;
/**
 * Mark the slot of v as having left its allocation site as a signal payload. Called by
 * core/signal.mjs when a signal is made over an hv, and only under SITES: it is a census
 * column, never a lifetime. A plain array or a subarray is not a slot and is ignored.
 * @param {ArrayBufferView} v
 */
export function notePayload(v) {
  if (!SITES || !v || v.buffer !== BUF) return;
  const s = slotOf(v);
  if (s >= 0 && s < slotRoute.length) slotRoute[s] = 1;
}
/**
 * Per allocation site: how many attempts it made, and how many of its slots are STILL IN USE
 * at the moment of the call. Read once at the end of a run and again after a forced collection
 * and an event loop turn, the difference is that site's garbage: vectors it made, nobody
 * returned, and nobody was holding. A site whose live count does not move owns live vectors
 * (a memory row, a cell state, the connectome) and has nothing to release.
 *
 * `liveRouted` is the part of `live` whose vector left the site as a signal payload. Read
 * either side of the collection it splits that site's GARBAGE by route: garbage that was
 * handed to a signal is the router's to release, garbage that was not is held where it was
 * put (a cell state, a memory row) and can only be released there. That is the whole reason
 * the column exists: the two halves need different fixes.
 *
 * Empty unless BRAIN_HV_HEAP_SITES=1, because the slot column is only filled then.
 * @param {number} [top] how many rows to return, ordered by live descending then attempts
 * @returns {Array<{site: string, attempts: number, live: number, liveRouted: number}>}
 */
export function heapOwnership(top = 32) {
  ready();
  const live = new Map(), routed = new Map();
  for (let s = 0; s < slots; s++) {
    if (!used[s]) continue;
    const id = slotSite.length > s ? slotSite[s] : -1;
    if (id < 0) continue;
    live.set(id, (live.get(id) || 0) + 1);
    if (slotRoute.length > s && slotRoute[s]) routed.set(id, (routed.get(id) || 0) + 1);
  }
  const rows = SITE_KEYS.map((key, id) => ({ site: key, attempts: SITE_COUNT.get(key) || 0, live: live.get(id) || 0, liveRouted: routed.get(id) || 0 }));
  rows.sort((a, b) => b.live - a.live || b.attempts - a.attempts);
  return rows.slice(0, top);
}

function returnSlot(slot) {
  used[slot] = 0; gen[slot] = (gen[slot] + 1) >>> 0; free[freeTop++] = slot; inUse--;
  if (wasFull && inUse < slots - (slots >> 4)) { wasFull = false; report('drained'); }
}
function report(why) {
  if (!REPORT) return;
  try { appendFileSync(REPORT, JSON.stringify({ tid: threadId, at: new Date().toISOString(), why, ...heapStats() }) + '\n'); } catch { /* a report is never allowed to stop a brain */ }
}
/** Every counter the heap keeps. slots is the capacity; inUse and peak count slots. */
export function heapStats() {
  ready(); // reading the heap is a use of it: the numbers below are of the installed heap
  const tried = allocs + fallbacks;
  return {
    capacityBytes: slots * SLOT, slotBytes: SLOT, slots, inUse, peak, allocs, fallbacks, tooWide,
    reclaimed, released, copiedIn, doubleFrees, stale, full: slots > 0 && freeTop === 0, heapRefused,
    fallbackPct: tried ? +(100 * fallbacks / tried).toFixed(2) : 0,
    // heapMB is what BRAIN_HV_HEAP_MB asked for (or the default it would have used);
    // installedMB is what the memory actually holds, which plan() may have made smaller.
    heapMB, installedMB: Number((slots * SLOT / 1048576).toFixed(1)), mainThread: isMainThread, tid: threadId,
    // finalizerCalls is the count that says WHY slots do not come back: the registry returns a
    // slot only at an event loop turn after a collection, so a run that is one synchronous
    // build plus one synchronous tick loop reads 0 here however much garbage it made.
    finalizerCalls: reclaimed + stale, plan: { ...planRecord },
  };
}
/**
 * A view of n Int8 lanes on a fresh slot, or null when the heap is full or absent (counted
 * as a fallback) or n is wider than a slot (counted as tooWide). The lanes hold whatever the
 * slot held before: the caller writes every lane.
 */
export function alloc(n) {
  ready();
  const id = SITES ? site() : -1;
  if (n > SLOT) { tooWide++; return null; }
  if (freeTop === 0) {
    fallbacks++;
    if (!wasFull) { wasFull = true; report('full'); }
    return null;
  }
  const s = free[--freeTop];
  used[s] = 1; inUse++; if (inUse > peak) peak = inUse; allocs++;
  if (id >= 0) { slotSite[s] = id; slotRoute[s] = 0; } // this slot now belongs to that site until it comes back, and has not left it yet
  const view = new Int8Array(BUF, HEAP_BASE + s * SLOT, n);
  REGISTRY.register(view, gen[s] * slots + s, view);
  if ((allocs & 4095) === 0) report('every4096');
  return view;
}
/** True when v reads the heap memory (a slot view, or a subarray of one). */
export const isHeap = (v) => v.buffer === BUF;
/** The slot a view was allocated on, or -1 when it is not a slot view. */
export function slotOf(v) {
  if (v.buffer !== BUF || v.byteOffset < HEAP_BASE) return -1;
  const rel = v.byteOffset - HEAP_BASE;
  return rel % SLOT === 0 && rel / SLOT < slots ? rel / SLOT : -1;
}
/**
 * Return a slot now, for an owner who knows nobody else holds the view. Unregisters the
 * finalizer first, so the slot cannot come back a second time; returns false for a plain
 * Int8Array, a subarray, or a view already released.
 */
export function release(v) {
  const s = slotOf(v);
  if (s < 0) return false;
  if (!used[s]) { doubleFrees++; return false; }
  REGISTRY.unregister(v);
  returnSlot(s);
  released++;
  return true;
}

// ---------------------------------------------------------------- operands
const bytesOf = (a) => new Uint8Array(a.buffer, a.byteOffset, a.length);
// A vector qualifies for a kernel when its length is a whole number of 16-byte lanes and
// fits the fixed scratch; bundle() also needs fewer than 128 members so the Int8 lane
// accumulator cannot overflow.
// fits() is the one gate core/signal.mjs, memory/semantic.mjs and runtime/kernels.mjs put in
// front of every kernel, so it is where the lazy instance is made: one boolean test after the
// first call, and it reads `inst` rather than `available` so that a machine that compiled the
// module but could not give it even its scratch pages takes the scalar path instead of
// throwing on a null view.
export const fits = (n) => { if (!installed) ready(); return inst !== null && n % 16 === 0 && n > 0 && n <= MAX_N; };
// Where the kernel reads operand v: in place when it lives in the heap, else the k-th copy
// area, and copiedIn counts the copies. A call places its operands with rising k.
function place(v, k, n) {
  if (v.buffer === BUF) return v.byteOffset;
  const off = COPY + k * n;
  u8.set(bytesOf(v), off); copiedIn++;
  return off;
}
function placeTie(tie, n) {
  if (tie.buffer === BUF) return tie.byteOffset;
  u8.set(bytesOf(tie), TIEBUF); copiedIn++;
  return TIEBUF;
}
// The result: a fresh slot when the heap has one, else the scratch out area copied to a
// plain Int8Array. Returns [offset, view or null].
function outFor(n) {
  const view = alloc(n);
  return view ? [view.byteOffset, view] : [OUTBUF, null];
}
const finish = (n, view) => view || new Int8Array(BUF.slice(OUTBUF, OUTBUF + n));
// Members of one call: heap members read in place, the others copied while the copy area
// lasts; returns false when it does not, and the caller keeps its scalar loop.
function placeAll(list, n) {
  const count = list.length;
  if (count > MAX_MEMBERS) return false;
  const cap = Math.floor(COPY_BYTES / n);
  let copies = 0;
  for (let k = 0; k < count; k++) {
    const m = list[k];
    if (m.buffer === BUF) i32v[(PTRS >> 2) + k] = m.byteOffset;
    else { if (copies >= cap) return false; i32v[(PTRS >> 2) + k] = place(m, copies++, n); }
  }
  return true;
}

/** Majority of bipolar members (fewer than 128), tie-broken by list[0] * tie. */
export function bundleSimd(list, tie) {
  ready(); // before placeAll writes an operand: ready() may replace the memory
  const n = list[0].length, count = list.length;
  if (!placeAll(list, n)) return null;
  const t = placeTie(tie, n);
  const [o, view] = outFor(n);
  inst.exports.bundle(PTRS, count, n, t, o);
  return finish(n, view);
}
/** Weighted bundle on any Int8 members, exactly the Float64Array loop's answer. */
export function wbundleSimd(list, weights, tie) {
  ready();
  const n = list[0].length, count = list.length;
  if (!placeAll(list, n)) return null;
  // one f64 per member, exactly what the scalar loop multiplies by: a missing weight is
  // undefined there, NaN here, and both make every lane of that call a tie
  for (let k = 0; k < count; k++) f64v[(WTS >> 3) + k] = weights[k];
  const t = placeTie(tie, n);
  const [o, view] = outFor(n);
  inst.exports.wbundle(PTRS, count, n, WTS, i32v[PTRS >> 2], t, o, ACC);
  return finish(n, view);
}
export function bindSimd(a, b) {
  ready();
  const n = a.length;
  const pa = place(a, 0, n), pb = place(b, 1, n);
  const [o, view] = outFor(n);
  inst.exports.bind(pa, pb, o, n);
  return finish(n, view);
}
export function equalSimd(a, b) {
  ready();
  const n = a.length;
  return inst.exports.equal(place(a, 0, n), place(b, 1, n), n);
}
export function dotSimd(a, b) {
  ready();
  const n = a.length;
  return inst.exports.dot(place(a, 0, n), place(b, 1, n), n);
}

// ---------------------------------------------------------------- resident codebooks
// An Arena keeps a codebook inside a wasm memory of its own, one bit per lane, so a scan
// copies only the query: every item was packed once when it was set. Each arena is a fresh
// instance of the same module on a memory of its own that may grow (no view is handed out
// on it), so no arena can touch the heap above or another arena. Only bipolar vectors pack;
// the caller checks that.
export const fitsPacked = (n) => available && n % 128 === 0 && n > 0;
export function pack(vec, out, off) {
  for (let i = 0, j = off, n = vec.length; i < n; i += 8, j++) {
    out[j] = (vec[i] > 0 ? 1 : 0) | (vec[i + 1] > 0 ? 2 : 0) | (vec[i + 2] > 0 ? 4 : 0) | (vec[i + 3] > 0 ? 8 : 0)
      | (vec[i + 4] > 0 ? 16 : 0) | (vec[i + 5] > 0 ? 32 : 0) | (vec[i + 6] > 0 ? 64 : 0) | (vec[i + 7] > 0 ? 128 : 0);
  }
  return out;
}
function ownInstance(pages) {
  const m = new WebAssembly.Memory({ initial: pages });
  return { mem: m, inst: new WebAssembly.Instance(module_, { env: { mem: m } }) };
}
export class Arena {
  constructor(n, capacity = 64) {
    if (!fitsPacked(n)) throw new Error('simd arena: a width of ' + n + ' lanes is not a whole number of 128-lane blocks');
    this.n = n; this.bytes = n >> 3; this.count = 0; this.capacity = 0;
    const o = ownInstance(2);
    this.inst = o.inst; this.mem = o.mem; this.u8 = new Uint8Array(this.mem.buffer);
    this.reserve(capacity);
  }
  // slot 0 holds the query; items sit at slots 1..capacity
  reserve(capacity) {
    const need = (capacity + 1) * this.bytes;
    if (this.mem.buffer.byteLength < need) { this.mem.grow(Math.ceil((need - this.mem.buffer.byteLength) / PAGE)); this.u8 = new Uint8Array(this.mem.buffer); }
    this.capacity = Math.max(this.capacity, capacity);
  }
  set(slot, vec) {
    if (slot >= this.capacity) this.reserve(Math.max(slot + 1, this.capacity * 2));
    pack(vec, this.u8, (slot + 1) * this.bytes);
    if (slot >= this.count) this.count = slot + 1;
  }
  move(from, to) { const b = this.bytes; this.u8.copyWithin((to + 1) * b, (from + 1) * b, (from + 2) * b); }
  truncate(count) { this.count = count; }
  // exact integer dot of the query with every slot below count, written into out
  dots(query, out, count = this.count) {
    pack(query, this.u8, 0);
    const b = this.bytes, n = this.n, h = this.inst.exports.hpack;
    for (let i = 0; i < count; i++) out[i] = n - 2 * h(0, (i + 1) * b, b);
    return out;
  }
  // [slot, dot] of the highest dot; among equals the lowest slot
  best(query, count = this.count) {
    if (count === 0) return null;
    pack(query, this.u8, 0);
    const b = this.bytes, h = this.inst.exports.hpack;
    let bi = 0, bh = h(0, b, b);
    for (let i = 1; i < count; i++) { const x = h(0, (i + 1) * b, b); if (x < bh) { bh = x; bi = i; } }
    return [bi, this.n - 2 * bh];
  }
}

// ---------------------------------------------------------------- resident raw codebooks
// A RawArena keeps Int8 vectors as they are (any lane value) in a wasm memory of its own,
// for the two scans the semantic tier runs on every Hopfield step: the exact dot of a query
// with every member, and the weighted accumulation of every member into one i32 lane sum.
// Layout: [0, n) the query, [n, 5n) the i32 accumulator, members at base + slot * n, and
// the i32 weights after the last reserved slot. Removal is swap-remove (move + truncate),
// so the caller keeps its own index-to-slot map. dots and wacc keep their signatures:
// memory/semantic.mjs calls both.
export class RawArena {
  constructor(n, capacity = 64) {
    if (!fits(n)) throw new Error('simd raw arena: a width of ' + n + ' lanes is not a whole number of 16-lane blocks');
    this.n = n; this.base = 5 * n; this.count = 0; this.capacity = 0;
    const o = ownInstance(2);
    this.inst = o.inst; this.mem = o.mem; this._views();
    this.reserve(capacity);
  }
  _views() { this.u8 = new Uint8Array(this.mem.buffer); this.i32 = new Int32Array(this.mem.buffer); }
  reserve(capacity) {
    const need = this.base + capacity * this.n + 4 * capacity;
    if (this.mem.buffer.byteLength < need) { this.mem.grow(Math.ceil((need - this.mem.buffer.byteLength) / PAGE)); this._views(); }
    this.capacity = Math.max(this.capacity, capacity);
  }
  set(slot, vec) {
    if (vec.length !== this.n) throw new Error('simd raw arena: a vector of ' + vec.length + ' lanes in an arena of ' + this.n);
    if (slot >= this.capacity) this.reserve(Math.max(slot + 1, this.capacity * 2));
    this.u8.set(bytesOf(vec), this.base + slot * this.n);
    if (slot >= this.count) this.count = slot + 1;
  }
  move(from, to) { const n = this.n, b = this.base; this.u8.copyWithin(b + to * n, b + from * n, b + (from + 1) * n); }
  truncate(count) { this.count = count; }
  // exact integer dot of the query with every slot below count, written into out
  dots(query, out, count = this.count) {
    this.u8.set(bytesOf(query), 0);
    const n = this.n, b = this.base, dot = this.inst.exports.dot;
    for (let i = 0; i < count; i++) out[i] = dot(0, b + i * n, n);
    return out;
  }
  // out[i] = sum over slots below count of weights[slot] * member[slot][i], exact in i32 lanes
  wacc(weights, out, count = this.count) {
    const n = this.n, wptr = this.base + this.capacity * n;
    this.i32.set(weights.length === count ? weights : weights.subarray(0, count), wptr >> 2);
    this.inst.exports.wacc(this.base, count, n, wptr, n);
    out.set(this.i32.subarray(n >> 2, (n >> 2) + n));
    return out;
  }
}
