// world/venue.mjs: THE TRADING USE CASE, INSIDE THE ORGANISM.
//
// The director's rule: the brain does the trading. The old trader package is frozen and
// read only, so nothing here imports it; the only thing this file takes from that package
// is DATA it opens READ ONLY (a recorded tape of reserves) and one measured constant it
// cites by file and by printed line.
//
// Four cell kinds, and every one of them is an ordinary cell in an ordinary circuit:
//
//   sense.venue    replays a recorded tape of reserves, one reading per run, in time order
//   world.venue    turns motor output into a PAPER order, filled at the payable price
//   venue.trader   the decision cell: what the organism does with what it just perceived
//   venue.script   the same shape, on a fixed list of orders, so a control arm and the
//                  brain arm travel the identical path with the identical latency
//
// THREE THINGS THIS FILE REFUSES TO DO.
//
// 1. It never reaches a venue. Nothing in this module opens a connection to anything: the
//    only module it opens outside the organism is node:sqlite, against a file, in read
//    only mode. There is no order path out of this process, no credential of any kind and
//    no signer. test/world.test.mjs asserts that over the source of this file, which is
//    the only assertion that stays true when somebody edits it.
//
// 2. It never fills at a mid price. A mid (quote/base) is a ratio, not an offer. Every
//    fill is computed from the reserves at a reading by the constant product the pool
//    actually quotes, so a buy pays strictly more than the mid and a sell receives
//    strictly less, and the gap is our own size against the recorded book.
//
// 3. It never gets a fill for free. A round trip is charged the venue's measured round
//    trip cost once, at the moment it closes, on the notional that opened it. A pool that
//    does not move still loses.
//
// THE FEE. trader/bench/verdicts/desk.json publishes, in its assertion list:
//     "name": "FEE_BAR is the measured 4.54% round trip"
//     "pass": true
//     "detail": "0.0454"
// That number was measured on pump.fun bonding curves. The tape this file replays is
// mostly pumpswap, and trader/bench/verdicts/instrument.json says of that venue, in the
// same assertion style, "the round-trip cost of pumpswap has never been measured". So the
// fee charged here is a BORROWED constant, not a measurement of this venue, and bench and
// note say so in those words. Borrowing it is the conservative direction only if pumpswap
// is cheaper than pump.fun, which nobody has shown either.
//
// THE FULL TAPE (board 8). The cells above replay a sampled tape one reading per run, which
// is the organism's own path and the one the gate sees. A search over thousands of trader
// genomes on every recorded instrument cannot afford one brain per evaluation, so this file
// also carries a PACKED tape (typed arrays, loaded once) and a replay kernel over it. The
// kernel does not reimplement the trader: it calls traderDecide and exitWhy, the same two
// functions the venue.trader cell calls, and it fills with payableBuy and payableSell, the
// same two functions world.venue fills with. test/venue.test.mjs runs the organism and the
// kernel on one interleaved tape and asserts the two books are the same trip for trip.
//
// THE SLIPPAGE CAP. Most recorded pumpswap readings are drained pools (a quote reserve of a
// few lamports). A replay that lets 0.02 SOL buy the whole base side of a drained pool and
// then sells it into a later, refilled pool is measuring the replay, not the market. A real
// order carries a slippage limit, so a buy here fills only when its own impact at the fill
// reading, size / quote reserve, is at most params.maxImpact. Off (0) by default so every
// earlier bench replays exactly as it did; the full tape bench turns it on and says so.
//
// SENSORS (board 11). The decision cell used to see one number per reading, the mid. It now
// sees a TYPED sensor vector (VENUE_SENSORS) computed by ONE function, sensorStep, from what
// the tape itself carries: the reserves of each reading, the pool's age since its birth
// (pool_state.age_s), the birth record of every pool (the pool table: how it was born, and how
// many pools were born in the ten minutes before a reading), and the trades a reserve move
// between two readings implies. sense.venue runs sensorStep per instrument and hands the
// vector to venue.trader with the reading; the kernel runs the same sensorStep once over the
// packed tape (sensorColumns). Every sensor is causal: a value at reading j reads readings
// at or before j of the same instrument and births at or before its time, never after.
//
// THE FEE ON BOTH LEGS (board 11). With o.legs (kernel) or params.feeLegs (world.venue) the
// round trip fee bar is charged half on each leg: fee / 2 of the notional on the buy, fee / 2
// of the proceeds on the sell. A trip that goes nowhere pays exactly the bar; a winner pays
// its sell leg on what it sold, which is the conservative direction for a tail. Off by default
// so every earlier bench replays exactly as it did.
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { defineKind } from '../core/cell.mjs';
import { RNG, hash32 } from '../core/rng.mjs';
import { drain, outcome, propose, push } from './actuators.mjs';

export const VENUE_KINDS = Object.freeze(['sense.venue', 'world.venue', 'venue.trader', 'venue.script']);

// The measured constant, copied here with its source so a reader never has to guess where
// a number came from. The armed policy is the authority at fill time; this is the default.
export const FEE_ROUND_TRIP = 0.0454;
export const FEE_SOURCE = Object.freeze({
  file: 'trader/bench/verdicts/desk.json',
  assertion: 'FEE_BAR is the measured 4.54% round trip',
  detail: '0.0454',
  venueMeasuredOn: 'pump.fun',
  venueAppliedTo: 'pumpswap (never measured: trader/bench/verdicts/instrument.json)',
});

const sigsOf = (mail) => mail.map((it) => it.sig);
const errEvent = (data) => ({ kind: 'event', data });
const seqOrNull = (s) => (typeof s === 'number' && s >= 0 ? s : null);

// ---------------------------------------------------------------- payable prices
// The pool quotes a constant product. These two functions are the whole price model, and
// they are the only place a fill size is ever turned into an amount.

/** Base tokens received for quoteIn quote against reserves (quote, base). */
export function payableBuy(quote, base, quoteIn) {
  const q = Number(quote), b = Number(base), inQ = Number(quoteIn);
  if (!(q > 0) || !(b > 0) || !(inQ > 0)) return 0;
  const k = q * b;
  return b - k / (q + inQ);
}
/** Quote received for baseIn base against reserves (quote, base). */
export function payableSell(quote, base, baseIn) {
  const q = Number(quote), b = Number(base), inB = Number(baseIn);
  if (!(q > 0) || !(b > 0) || !(inB > 0)) return 0;
  const k = q * b;
  return q - k / (b + inB);
}
/** The ratio a reading reports. Never a fill price: kept for the signal only. */
export function midOf(quote, base) { return Number(base) > 0 ? Number(quote) / Number(base) : 0; }
/**
 * Whether a buy of quoteIn may fill against a quote reserve under a slippage cap. The
 * impact of a constant product buy, payable over mid minus one, is exactly quoteIn / quote,
 * so the cap is a floor on the reserve: quote >= quoteIn / cap. A cap of 0 is no cap.
 */
export function admitsBuy(quote, quoteIn, cap) {
  if (!(cap > 0)) return true;
  return quote > 0 && quoteIn / quote <= cap;
}

// ---------------------------------------------------------------- sensors (board 11)
// The typed inputs of the venue cells. Each is computed at a reading from that reading and
// the ones before it on the same instrument (plus the birth record up to its time), never
// from a later one. `type` is the value's kind; `unit` says what one of it is.
//
// A liquidity event (the reserve product moved more than LIQ_EVENT in one reading, defined
// with the packed tape below) is somebody adding or pulling liquidity, not a trade, so it
// counts as neither a trade nor a buy.
export const SENSOR_WINDOW = 6;
export const LIQ_EVENT = 0.05;
export const VENUE_SENSORS = Object.freeze([
  Object.freeze({ name: 'realSol', type: 'f64', unit: 'SOL', doc: 'the quote (SOL) reserve at the decision reading: the real SOL in the pool' }),
  Object.freeze({ name: 'ageS', type: 'f64', unit: 's', doc: 'seconds since the pool was born (pool_state.age_s; 0 at the CreatePool reading)' }),
  Object.freeze({ name: 'trades', type: 'i32', unit: 'readings', doc: 'readings among the last SENSOR_WINDOW where the reserves moved along the curve since the reading before: at least one swap happened in between (a count of trading intervals; the tape cannot count swaps inside one interval)' }),
  Object.freeze({ name: 'buyers', type: 'i32', unit: 'readings', doc: 'readings among the last SENSOR_WINDOW where the SOL reserve ROSE since the reading before: net buying in that interval (buy-side intervals, NOT distinct wallets, which the tape does not carry)' }),
  Object.freeze({ name: 'slope', type: 'f64', unit: 'ratio', doc: 'the SOL reserve now over the SOL reserve SENSOR_WINDOW readings ago (or at birth when younger), minus one' }),
  Object.freeze({ name: 'births', type: 'i32', unit: 'pools', doc: 'pools of this venue born in the BIRTH_WINDOW_S seconds up to this reading, market wide (the pool table, by t_local: when the desk saw each birth)' }),
  Object.freeze({ name: 'migrated', type: 'u8', unit: 'flag', doc: '1 when the pool was born by a cpi out of the pump.fun program (a graduated curve), 0 when a wallet or anything else created it' }),
]);
export const SENSOR_NAMES = Object.freeze(VENUE_SENSORS.map((s) => s.name));

/** A fresh per instrument sensor state: a ring of the last window + 1 readings. */
export function sensorState(window = SENSOR_WINDOW) {
  const w = Math.max(1, window | 0);
  return { w, n: 0, q: new Float64Array(w + 1), moved: new Uint8Array(w + 1), buy: new Uint8Array(w + 1), pq: 0, pk: 0 };
}

/**
 * Advance one instrument's sensor state by one reading r ({ quote, base, ageS, births,
 * migrated }) and write the sensor vector into out (a caller owned object, returned). The
 * ONLY definition of every sensor: sense.venue calls it per reading, sensorColumns calls it
 * over the packed tape.
 */
export function sensorStep(ss, r, out) {
  const w = ss.w, R = w + 1;
  const q = Number(r.quote), k = q * Number(r.base);
  let moved = 0, buy = 0;
  if (ss.n > 0) {
    const liq = ss.pk > 0 && Math.abs(k / ss.pk - 1) > LIQ_EVENT;
    if (!liq && Math.abs(q - ss.pq) > 1e-12 * Math.max(1, ss.pq)) { moved = 1; if (q > ss.pq) buy = 1; }
  }
  const slot = ss.n % R;
  ss.q[slot] = q; ss.moved[slot] = moved; ss.buy[slot] = buy;
  ss.n++; ss.pq = q; ss.pk = k;
  let trades = 0, buyers = 0;
  const m = Math.min(ss.n, w);
  for (let t = 0; t < m; t++) { const s = (ss.n - 1 - t) % R; trades += ss.moved[s]; buyers += ss.buy[s]; }
  const back = Math.min(ss.n - 1, w);
  const q0 = ss.q[(ss.n - 1 - back) % R];
  out.realSol = q;
  out.ageS = Number(r.ageS) || 0;
  out.trades = trades;
  out.buyers = buyers;
  out.slope = q0 > 0 ? q / q0 - 1 : 0;
  out.births = Number(r.births) || 0;
  out.migrated = r.migrated ? 1 : 0;
  return out;
}

// ---------------------------------------------------------------- the tape
// A tape is a live object, handed to a cell through params exactly as sense.stdin takes
// params.stream: it holds a replay cursor (tape.seen) that the sense moves and the
// actuator reads, so nothing about it belongs in a serialized snapshot.

function toMs(iso) { const t = Date.parse(String(iso)); return Number.isFinite(t) ? t : 0; }

// The age a reading carries, or, for a tape that recorded none, seconds since the
// instrument's first reading (which is its birth on the recorded tape: every eligible
// pumpswap instrument's first reading has age_s 0).
function ageOfReading(r, first) {
  const a = Number(r.ageS);
  return r.ageS !== undefined && r.ageS !== null && Number.isFinite(a) ? a : (Number(r.tMs) - Number(first.tMs)) / 1000;
}

function buildTape(fields, instruments) {
  const flat = [];
  instruments.forEach((inst, i) => {
    const first = inst.readings[0];
    const migrated = inst.migrated ? 1 : 0;
    inst.readings.forEach((r, step) => flat.push({
      i, id: inst.id, step, tMs: r.tMs, quote: r.quote, base: r.base, mid: r.mid,
      ageS: ageOfReading(r, first), births: Number(r.births) || 0, migrated,
    }));
  });
  // Time order, with the instrument id and the step as tie breaks so two loads of the same
  // rows always replay in the same order whatever the sort implementation does with ties.
  flat.sort((a, b) => (a.tMs - b.tMs) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0) || (a.step - b.step));
  const byId = {};
  for (const inst of instruments) byId[inst.id] = inst;
  return {
    ...fields, instruments, byId, flat, seen: {},
    readings: flat.length,
    at: new Date().toISOString(),
  };
}

/** Forget the replay cursor so the same tape can be replayed again from the start. */
export function resetTape(tape) { tape.seen = {}; return tape; }

// ---------------------------------------------------------------- births
// The pool table is the tape's birth record: one CreatePool row per pool, with t_local (when
// the desk SAW the birth, the axis a decision may use; the schema comment in trader.db says
// eligibility is t_local for exactly that reason) and origin (a cpi out of the pump.fun
// program is a curve that graduated and migrated; a wallet is somebody creating a pool by
// hand). Both are facts the tape recorded at birth, so a sensor may read them.
export const BIRTH_WINDOW_S = 600;
export const PUMPFUN_PROGRAM = '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P';

/** Every recorded birth of one venue: sorted birth times and each pool's origin. */
export function birthRecordOf(db, venue) {
  let rows = [];
  // a tape database without a birth record still replays: every births sensor reads 0 and
  // every origin reads unknown, and the record says it had no rows
  try { rows = db.prepare('select signature, t_local, origin from pool where venue = ? order by t_local').all(venue); } catch { rows = []; }
  const bornMs = new Float64Array(rows.length);
  const origin = new Map();
  let k = 0;
  for (const r of rows) {
    const t = toMs(r.t_local);
    if (t > 0) bornMs[k++] = t;
    const o = r.origin === null || r.origin === undefined ? null : String(r.origin);
    origin.set(r.signature, o === null ? 'unknown' : o.includes(PUMPFUN_PROGRAM) ? 'migrated' : o === 'wallet' ? 'wallet' : 'other');
  }
  const sorted = bornMs.slice(0, k).sort();
  return { bornMs: sorted, origin, rows: rows.length };
}

/** Pools born in (tMs - windowS, tMs] on a sorted list of birth times. */
export function birthsBefore(bornMs, tMs, windowS = BIRTH_WINDOW_S) {
  const upper = (x) => { let lo = 0, hi = bornMs.length; while (lo < hi) { const m = (lo + hi) >> 1; if (bornMs[m] <= x) lo = m + 1; else hi = m; } return lo; };
  return upper(tMs) - upper(tMs - windowS * 1000);
}

/**
 * Read a tape out of the frozen trader database, READ ONLY. Never writes, never copies the
 * file. The readings table is pool_state: one row per (signature, venue, checked_at) with
 * the quote and base balances of the pool at that instant, which is exactly a reading of
 * price and reserves over time for many instruments.
 *
 * @param {object} opts
 * @param {string} opts.db            absolute path to trader.db
 * @param {number} [opts.instruments] how many instruments to draw
 * @param {number} [opts.minReadings] the fewest readings an instrument may have
 * @param {number} [opts.maxReadings] the most readings to take per instrument
 * @param {string} [opts.venue]       which venue's rows to take
 * @param {string|number} [opts.seed] which instruments get drawn, deterministically
 */
export function loadTape(opts = {}) {
  const file = String(opts.db || '');
  const want = Number(opts.instruments) || 16;
  const minReadings = Number(opts.minReadings) || 20;
  const maxReadings = Number(opts.maxReadings) || 200;
  const venue = String(opts.venue || 'pumpswap');
  const seed = opts.seed === undefined ? 'venue' : opts.seed;
  const db = new DatabaseSync(file, { readOnly: true });
  try {
    const eligible = db.prepare(
      'select signature, count(*) n from pool_state where venue = ? and quote_balance > 0 and base_balance > 0' +
      ' group by signature having n >= ? order by signature'
    ).all(venue, minReadings);
    const rng = new RNG('venue.tape:' + seed);
    const pool = eligible.slice();
    for (let i = pool.length - 1; i > 0; i--) { const j = rng.int(i + 1); const t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    const picked = pool.slice(0, want).sort((a, b) => (a.signature < b.signature ? -1 : a.signature > b.signature ? 1 : 0));
    const read = db.prepare(
      'select checked_at, age_s, quote_balance, base_balance from pool_state where signature = ? and venue = ?' +
      ' and quote_balance > 0 and base_balance > 0 order by checked_at limit ?'
    );
    const births = birthRecordOf(db, venue);
    const instruments = [];
    for (const row of picked) {
      const rows = read.all(row.signature, venue, maxReadings);
      if (rows.length < minReadings) continue;
      instruments.push({
        id: row.signature, venue, migrated: births.origin.get(row.signature) === 'migrated',
        readings: rows.map((r) => {
          const tMs = toMs(r.checked_at);
          return { tMs, ageS: r.age_s === null ? undefined : Number(r.age_s), births: birthsBefore(births.bornMs, tMs), quote: Number(r.quote_balance), base: Number(r.base_balance), mid: midOf(r.quote_balance, r.base_balance) };
        }),
      });
    }
    return buildTape({ source: 'trader.db', db: path.resolve(file), venue, seed: String(seed), eligible: eligible.length, synthetic: false }, instruments);
  } finally {
    db.close();
  }
}

/**
 * A tape out of a seeded generator, for when the recorded schema cannot be read. It is a
 * geometric walk on the quote reserve with the product held fixed, which is what a pool
 * looks like when somebody trades it and nobody adds liquidity. It is NOT a market: a
 * bench that ran on this must say so, because no rate measured on it is a measurement of
 * anything outside this process.
 */
export function synthTape(opts = {}) {
  const want = Number(opts.instruments) || 16;
  const steps = Number(opts.readings) || 40;
  const seed = opts.seed === undefined ? 'venue' : opts.seed;
  const drift = Number.isFinite(opts.drift) ? Number(opts.drift) : 0;
  const vol = Number.isFinite(opts.vol) ? Number(opts.vol) : 0.06;
  const rng = new RNG('venue.synth:' + seed);
  const t0 = 1757000000000;
  const instruments = [];
  for (let i = 0; i < want; i++) {
    const id = 'synth' + String(i).padStart(4, '0');
    let quote = 30 + rng.next() * 60;
    let base = 1e8 + rng.next() * 2e8;
    const k = quote * base;
    const readings = [];
    for (let s = 0; s < steps; s++) {
      readings.push({ tMs: t0 + (s * 20000) + i * 137, quote, base, mid: midOf(quote, base) });
      quote = Math.max(1e-6, quote * Math.exp(drift + vol * rng.gauss()));
      base = k / quote;
    }
    instruments.push({ id, venue: 'synthetic', readings });
  }
  return buildTape({ source: 'synthetic', db: null, venue: 'synthetic', seed: String(seed), eligible: want, synthetic: true }, instruments);
}

/** Summary numbers a verdict can carry without carrying the whole tape. */
export function tapeSummary(tape) {
  const lens = tape.instruments.map((x) => x.readings.length);
  const spanMs = tape.flat.length ? tape.flat[tape.flat.length - 1].tMs - tape.flat[0].tMs : 0;
  return {
    source: tape.source, db: tape.db, venue: tape.venue, seed: tape.seed, synthetic: !!tape.synthetic,
    instruments: tape.instruments.length, readings: tape.readings, eligible: tape.eligible ?? null,
    minReadings: lens.length ? Math.min(...lens) : 0, maxReadings: lens.length ? Math.max(...lens) : 0,
    spanMs, firstMs: tape.flat.length ? tape.flat[0].tMs : 0, lastMs: tape.flat.length ? tape.flat[tape.flat.length - 1].tMs : 0,
  };
}

// ---------------------------------------------------------------- sense.venue
// One proposal opens the replay; every reading after it is a world.sense ledger event
// pointing back at that proposal, exactly like sense.poll. One reading leaves per run, in
// time order across every instrument, so the organism perceives the tape the way it
// happened rather than one instrument at a time.
defineKind('sense.venue', {
  doc: 'Replays a recorded tape of reserves (params.tape) one reading per run in time order, emitting { instrument, step, tMs, quote, base, mid } events. One world.act proposal opens the replay; a refused proposal replays nothing.',
  ports: {
    in: [],
    out: [{ name: 'out', kinds: ['event'] }, { name: 'error', kinds: ['event'] }],
  },
  defaults: { tape: null, seed: 'venue', queueMax: 8 },
  init: () => ({ cursor: 0, opened: false, done: false, act: null, reason: null, emitted: 0, readings: 0 }),
  compute: (ins, cell, ctx) => {
    const p = cell.params, st = cell.state;
    const tape = p.tape;
    let error = null;
    if (!st.opened) {
      st.opened = true;
      if (!tape || !Array.isArray(tape.flat)) {
        st.reason = 'no tape handed to ' + cell.id;
        return [null, errEvent({ op: 'sense.venue', status: 'refused', reason: st.reason, act: null })];
      }
      st.readings = tape.flat.length;
      const what = {
        op: 'sense.venue', tape: tape.source === 'synthetic' ? 'synthetic' : String(tape.db || ''),
        venue: String(tape.venue || ''), instruments: tape.instruments.length, readings: tape.flat.length, seed: String(tape.seed ?? p.seed),
      };
      const g = propose(cell, ctx, null, what, 'replay ' + what.readings + ' recorded readings of ' + what.instruments + ' instruments for ' + cell.id);
      st.act = g.seq;
      if (!g.approved) {
        st.reason = g.reason;
        return [null, errEvent({ op: 'sense.venue', tape: what.tape, status: g.status, reason: g.reason, act: g.seq })];
      }
      const brain = ctx && ctx.brain;
      if (brain) brain.log({ type: 'world.sense', from: seqOrNull(st.act), cell: cell.id, op: 'sense.venue', direction: 'open', venue: what.venue, instruments: what.instruments, readings: what.readings });
    }
    if (st.reason) return [null, error];
    if (st.cursor >= tape.flat.length) {
      if (st.done) return [null, null];
      st.done = true;
      return [{ kind: 'event', data: { venue: tape.venue, done: true, emitted: st.emitted, trace: { act: st.act } } }, null];
    }
    const r = tape.flat[st.cursor++];
    tape.seen[r.id] = r.step;
    st.emitted++;
    // The sense organ computes the typed sensor vector (board 11) with the one function the
    // kernel also runs, one sensor state per instrument, so the decision cell and the search
    // read the same numbers for the same reading.
    const ss = st.ss || (st.ss = {});
    const sensors = sensorStep(ss[r.id] || (ss[r.id] = sensorState(Number(p.window) || SENSOR_WINDOW)), r, {});
    // reading: true is the marker a decision cell reads. A fill also comes back through the
    // border carrying an instrument and a mid, and a decision cell that mistook its own
    // fill for a new reading would be trading on its own echo.
    return [{ kind: 'event', data: { reading: true, instrument: r.id, venue: tape.venue, step: r.step, tMs: r.tMs, quote: r.quote, base: r.base, mid: r.mid, sensors, done: false, trace: { act: st.act } } }, null];
  },
  // the per instrument sensor rings are live replay state, like the tape cursor: not snapshot safe
  serialize: (s) => ({ ...s, ss: {} }),
  cost: 1,
});

// ---------------------------------------------------------------- world.venue
// Order event: { instrument, side: 'buy' | 'sell', size }. size is quote on a buy and is
// ignored on a sell, which always closes the whole position: a partial exit would need a
// second fee rule and nobody has measured one.
//
// WHERE A FILL LANDS. The sense sets tape.seen[instrument] to the last reading it emitted.
// An order that arrives after reading i fills at reading i+1 when the tape has one, and at
// i otherwise. Filling at the reading AFTER the one that caused the decision is the
// conservative convention: the organism never trades on a price it has not already been
// shown, and never at the price of the very tick it reacted to.
//
// WHAT THIS DOES NOT MODEL. The tape is a replay: our own order does not move the reserves
// the next reading reports. The payable price charges our size against the recorded book,
// which is impact on the fill, but the tape after us is the tape, not the tape we made.
defineKind('world.venue', {
  doc: 'Fills PAPER orders against a recorded tape at the payable price from the reserves, never at a mid, and charges the venue round trip fee once per closed trip. Every order is a world.act proposal of op venue.order first; a refused order is never filled.',
  ports: {
    in: [{ name: 'order', kinds: ['event'] }],
    out: [{ name: 'fill', kinds: ['event'] }, { name: 'error', kinds: ['event'] }],
  },
  defaults: { tape: null, venue: 'paper', size: 0.02, feeRoundTrip: FEE_ROUND_TRIP, feeLegs: false, maxImpact: 0, queueMax: 64, keepTrades: 4096 },
  init: () => ({
    queue: [], positions: {}, trades: [], orders: 0, fills: 0, refused: 0, dropped: 0, impactRefused: 0,
    buys: 0, sells: 0, trips: 0, feesPaid: 0, realized: 0, deployed: 0, grossReturn: 0,
    filledAtNext: 0, filledAtLast: 0, lagSum: 0, lagN: 0, lastTrace: null,
  }),
  compute: (ins, cell, ctx) => {
    const p = cell.params, st = cell.state;
    for (const sig of sigsOf(ins[0])) {
      const r = sig.data || {};
      st.orders++;
      const side = String(r.side || '').toLowerCase();
      const instrument = String(r.instrument ?? '');
      const size = Number(r.size ?? p.size);
      const what = { op: 'venue.order', venue: String(p.venue || 'paper'), instrument, side, notional: side === 'sell' ? sizeOfPosition(st, instrument, p) : size, paper: true };
      const why = side + ' ' + instrument.slice(0, 12) + ' paper only, filled off a recorded tape, for ' + cell.id;
      const g = propose(cell, ctx, sig, what, why);
      if (!g.approved) {
        st.refused++;
        push(st, { error: true, op: 'venue.order', instrument, side, status: g.status, reason: g.reason, act: g.seq }, p.queueMax);
        continue;
      }
      fill(cell, ctx, g, { instrument, side, size, what, atStep: typeof r.atStep === 'number' ? r.atStep : null });
    }
    const [out, err] = drain(cell, st);
    return [out, err];
  },
  // Only the queue is dropped (transient, redrained one item per run, not snapshot-safe).
  // trades is the organism's actual trade record, already plain numbers (see fill() above),
  // so it travels through `...s` unchanged: serializing it as its own length silently turned
  // the array into a number, and JSON.stringify then dropped the key on the very next save
  // because Array.prototype.length does not exist on a number.
  serialize: (s) => ({ ...s, queue: [], queuedAtSnapshot: s.queue.length }),
  cost: 1,
});

// The notional a sell would close, so the proposal describes the real size and the gate
// judges the real number rather than a placeholder.
function sizeOfPosition(st, instrument, p) {
  const pos = st.positions[instrument];
  return pos ? pos.entryQuote : Number(p.size);
}

// The whole fill path. Synchronous: a replay has nothing to wait for, so the answer is
// pushed and drained in the same run, exactly as world.fs does for the filesystem.
function fill(cell, ctx, g, req) {
  const p = cell.params, st = cell.state, tape = p.tape;
  const policy = g.policy;
  // A cell may charge MORE than the policy's fee, never less: a cost may be tightened only
  // upward, which is the opposite direction from a cap.
  const fee = Math.max(Number(policy && policy.venue ? policy.venue.feeRoundTrip : FEE_ROUND_TRIP), Number(p.feeRoundTrip) || 0);
  const bad = (reason) => {
    const outSeq = outcome(ctx, g.seq, { cell: cell.id, op: 'venue.order', ok: false, instrument: req.instrument, side: req.side, reason });
    push(st, { error: true, op: 'venue.order', instrument: req.instrument, side: req.side, status: 'failed', reason, act: g.seq, outcome: outSeq }, p.queueMax);
  };
  const inst = tape && tape.byId ? tape.byId[req.instrument] : null;
  if (!inst) return bad('no instrument ' + req.instrument + ' on this tape');
  const seen = tape.seen[req.instrument];
  if (seen === undefined) return bad('no reading of ' + req.instrument.slice(0, 12) + ' has been perceived yet');
  const next = Math.min(seen + 1, inst.readings.length - 1);
  const at = inst.readings[next];
  if (next > seen) st.filledAtNext++; else st.filledAtLast++;
  // How many readings passed between the reading the decision cell reacted to and the
  // reading the fill landed on. It is the latency of the organism's own wiring, measured
  // rather than assumed, and it is the same wiring for every arm.
  if (typeof req.atStep === 'number') { st.lagSum += next - req.atStep; st.lagN++; }

  if (req.side === 'buy') {
    if (st.positions[req.instrument]) return bad('already holding ' + req.instrument.slice(0, 12));
    const quoteIn = Number(req.size);
    if (!(quoteIn > 0)) return bad('a buy needs a positive size');
    if (!admitsBuy(at.quote, quoteIn, Number(p.maxImpact) || 0)) {
      st.impactRefused++;
      return bad('the order is ' + (at.quote > 0 ? (quoteIn / at.quote).toExponential(3) : 'all') + ' of the quote reserve at step ' + next + ', over the slippage cap ' + p.maxImpact);
    }
    const baseOut = payableBuy(at.quote, at.base, quoteIn);
    if (!(baseOut > 0)) return bad('the reserves at step ' + next + ' quote nothing for ' + quoteIn);
    // fee on both legs: the buy leg pays fee / 2 of its notional, booked now
    const feeBuy = p.feeLegs ? (fee / 2) * quoteIn : 0;
    st.positions[req.instrument] = { entryQuote: quoteIn, base: baseOut, entryStep: next, entryMs: at.tMs, entryMid: at.mid, payable: quoteIn / baseOut, feeBuy };
    st.buys++; st.fills++; st.deployed += quoteIn; st.feesPaid += feeBuy;
    const outSeq = outcome(ctx, g.seq, { cell: cell.id, op: 'venue.order', ok: true, instrument: req.instrument, side: 'buy', step: next, quoteIn, baseOut, payable: quoteIn / baseOut, mid: at.mid });
    push(st, { error: false, out: { kind: 'event', data: { fill: true, side: 'buy', instrument: req.instrument, step: next, tMs: at.tMs, quoteIn, baseOut, payable: quoteIn / baseOut, mid: at.mid, fee: feeBuy, trace: { act: g.seq, outcome: outSeq } } }, act: g.seq, outcome: outSeq }, p.queueMax);
    return;
  }
  if (req.side !== 'sell') return bad('unknown side ' + req.side);
  const pos = st.positions[req.instrument];
  if (!pos) return bad('nothing held in ' + req.instrument.slice(0, 12));
  const gross = payableSell(at.quote, at.base, pos.base);
  // one round trip fee: once on the entry notional, or (feeLegs) half on the buy notional,
  // already booked, plus half on the proceeds of this sell
  const feeSell = p.feeLegs ? (fee / 2) * gross : fee * pos.entryQuote;
  const charged = (pos.feeBuy || 0) + feeSell;
  const net = gross - charged;
  delete st.positions[req.instrument];
  st.sells++; st.fills++; st.trips++;
  st.feesPaid += feeSell;
  st.realized += net - pos.entryQuote;
  st.grossReturn += (gross - pos.entryQuote) / pos.entryQuote;
  // Every closed round trip, kept as plain numbers. A control arm is built out of these:
  // it can only be rate matched and duration matched to an arm whose trips it can read.
  st.trades.push({ instrument: req.instrument, entryStep: pos.entryStep, exitStep: next, heldSteps: next - pos.entryStep, entryQuote: pos.entryQuote, gross, fee: charged, pnl: net - pos.entryQuote, grossReturn: (gross - pos.entryQuote) / pos.entryQuote });
  while (st.trades.length > Number(p.keepTrades)) st.trades.shift();
  const outSeq = outcome(ctx, g.seq, { cell: cell.id, op: 'venue.order', ok: true, instrument: req.instrument, side: 'sell', step: next, gross, fee: charged, net, pnl: net - pos.entryQuote, heldSteps: next - pos.entryStep });
  push(st, { error: false, out: { kind: 'event', data: { fill: true, side: 'sell', instrument: req.instrument, step: next, tMs: at.tMs, entryQuote: pos.entryQuote, baseIn: pos.base, gross, fee: charged, net, pnl: net - pos.entryQuote, heldSteps: next - pos.entryStep, payable: pos.base > 0 ? gross / pos.base : 0, mid: at.mid, trace: { act: g.seq, outcome: outSeq } } }, act: g.seq, outcome: outSeq }, p.queueMax);
}

/** The book of a world.venue cell, as plain numbers, for a bench or a report. */
export function bookOf(cell) {
  const st = cell.state;
  const open = Object.keys(st.positions);
  return {
    trades: st.trades,
    orders: st.orders, fills: st.fills, refused: st.refused, impactRefused: st.impactRefused || 0, buys: st.buys, sells: st.sells,
    trips: st.trips, deployed: st.deployed, feesPaid: st.feesPaid, realized: st.realized,
    grossReturnSum: st.grossReturn, openPositions: open.length, open,
    filledAtNext: st.filledAtNext, filledAtLast: st.filledAtLast,
    meanLagReadings: st.lagN > 0 ? st.lagSum / st.lagN : 0, lagN: st.lagN,
    returnOnDeployed: st.deployed > 0 ? st.realized / st.deployed : 0,
    meanGrossReturnPerTrip: st.trips > 0 ? st.grossReturn / st.trips : 0,
  };
}

// ---------------------------------------------------------------- venue.trader
// The decision cell. Its rule lives in traderDecide and exitWhy below, and those two
// functions are the ONLY copy of it: the cell calls them once per reading it perceives, and
// the full tape kernel calls them once per reading it replays. The genes the search moves
// are exactly the params this cell reads, so an evolved genome drops into the organism as
// venue.trader params with nothing translated.
//
//   lookback      readings the entry return is measured over
//   entryUp       the size of the move that triggers an entry
//   entryDir      +1 buys a rise of at least entryUp (momentum), -1 buys a fall of at
//                 least entryUp (dip)
//   trail         exit when the mid falls this far under its peak since entry
//   takeProfit    exit when the mid is this far over the entry mid (0: never)
//   maxHold       exit after this many readings held
//   minQuote      enter only when the quote reserve at the decision reading is at least
//                 this many quote units (0: any)
//   maxEntryStep  enter only at or before this reading of the instrument (0: any)
//   maxOpen       how many positions may be open at once across instruments
//
// Board 11 adds, every one OFF by default so an old genome decides exactly as it did:
//
//   entryDir 0    no price trigger at all: the sensor gate alone decides an entry
//   stopLoss      exit when the mid is this far UNDER the entry mid (0: never)
//   trailArm      the trail only applies once the peak is this far over the entry (0: always)
//   maxEntries    at most this many entries per instrument (0: any)
//   the sensor gate, one test per sensor (see VENUE_SENSORS), each off at 0 (or null for the
//   two slope bounds, where 0 is a real value): realSolMin, realSolMax, ageMin, ageMax,
//   tradesMin, buyersMin, slopeMin, slopeMax, birthsMin, birthsMax, migrated (-1 any,
//   0 born by a wallet, 1 migrated out of the pump.fun curve)
export const TRADER_DEFAULTS = Object.freeze({
  lookback: 3, entryUp: 0.02, entryDir: 1, trail: 0.1, maxHold: 12,
  takeProfit: 0, minQuote: 0, maxEntryStep: 0, size: 0.02, maxOpen: 4,
  stopLoss: 0, trailArm: 0, maxEntries: 0,
  realSolMin: 0, realSolMax: 0, ageMin: 0, ageMax: 0, tradesMin: 0, buyersMin: 0,
  slopeMin: null, slopeMax: null, birthsMin: 0, birthsMax: 0, migrated: -1,
});

/** The params a decision reads, as numbers, with an absent key taking its default. */
export function normalizeTrader(p = {}) {
  const d = TRADER_DEFAULTS;
  const n = (k) => (p[k] === undefined || p[k] === null ? d[k] : Number(p[k]));
  const opt = (k) => (p[k] === undefined || p[k] === null || !Number.isFinite(Number(p[k])) ? null : Number(p[k]));
  const dir = n('entryDir');
  const slopeMin = opt('slopeMin'), slopeMax = opt('slopeMax');
  const mig = n('migrated');
  const q = {
    lookback: n('lookback'), entryUp: n('entryUp'), entryDir: dir < 0 ? -1 : dir === 0 ? 0 : 1,
    trail: n('trail'), maxHold: n('maxHold'), takeProfit: n('takeProfit') || 0,
    minQuote: n('minQuote') || 0, maxEntryStep: n('maxEntryStep') || 0,
    size: n('size'), maxOpen: n('maxOpen'),
    stopLoss: n('stopLoss') || 0, trailArm: n('trailArm') || 0, maxEntries: Math.max(0, Math.round(n('maxEntries') || 0)),
    realSolMin: n('realSolMin') || 0, realSolMax: n('realSolMax') || 0, ageMin: n('ageMin') || 0, ageMax: n('ageMax') || 0,
    tradesMin: n('tradesMin') || 0, buyersMin: n('buyersMin') || 0,
    slopeMin: slopeMin === null ? -Infinity : slopeMin, slopeMax: slopeMax === null ? Infinity : slopeMax,
    birthsMin: n('birthsMin') || 0, birthsMax: n('birthsMax') || 0, migrated: mig === 0 || mig === 1 ? mig : -1,
  };
  q.gated = q.realSolMin > 0 || q.realSolMax > 0 || q.ageMin > 0 || q.ageMax > 0 || q.tradesMin > 0 || q.buyersMin > 0 ||
    q.slopeMin > -Infinity || q.slopeMax < Infinity || q.birthsMin > 0 || q.birthsMax > 0 || q.migrated >= 0;
  return q;
}

/** Whether a sensor vector passes every test of the gate that is switched on. */
export function gateAdmits(q, s) {
  if (!s) return false;
  if (q.realSolMin > 0 && !(s.realSol >= q.realSolMin)) return false;
  if (q.realSolMax > 0 && !(s.realSol <= q.realSolMax)) return false;
  if (q.ageMin > 0 && !(s.ageS >= q.ageMin)) return false;
  if (q.ageMax > 0 && !(s.ageS <= q.ageMax)) return false;
  if (q.tradesMin > 0 && !(s.trades >= q.tradesMin)) return false;
  if (q.buyersMin > 0 && !(s.buyers >= q.buyersMin)) return false;
  if (!(s.slope >= q.slopeMin) || !(s.slope <= q.slopeMax)) return false;
  if (q.birthsMin > 0 && !(s.births >= q.birthsMin)) return false;
  if (q.birthsMax > 0 && !(s.births <= q.birthsMax)) return false;
  if (q.migrated >= 0 && s.migrated !== q.migrated) return false;
  return true;
}

/**
 * Whether a held position exits at this reading, and why. It moves the position's peak and
 * its step count, so it is called exactly once per reading while held. The order of the
 * tests is the order the cell always used, with the board 11 stop first: the stop loss, the
 * trail (once armed), the take profit, the holding cap last.
 * @returns {'stopLoss'|'trail'|'takeProfit'|'maxHold'|null}
 */
export function exitWhy(q, pos, mid) {
  if (mid > pos.peak) pos.peak = mid;
  pos.steps++;
  if (q.stopLoss > 0 && pos.entry > 0 && mid <= pos.entry * (1 - q.stopLoss)) return 'stopLoss';
  const drawdown = pos.peak > 0 ? 1 - mid / pos.peak : 0;
  const armed = !(q.trailArm > 0) || (pos.entry > 0 && pos.peak >= pos.entry * (1 + q.trailArm));
  if (armed && drawdown >= q.trail) return 'trail';
  if (q.takeProfit > 0 && pos.entry > 0 && mid / pos.entry - 1 >= q.takeProfit) return 'takeProfit';
  if (pos.steps >= q.maxHold) return 'maxHold';
  return null;
}

/**
 * One reading of one instrument, perceived by a decision state. Returns the order it causes,
 * or null. st is { hist, held, open, entries, exits, seenEvents, count }; q is
 * normalizeTrader(p); sensors is the reading's sensor vector (sensorStep), or null.
 */
export function traderDecide(q, st, id, mid, step, quote, sensors = null) {
  st.seenEvents++;
  const h = st.hist[id] || (st.hist[id] = []);
  h.push(mid);
  while (h.length > q.lookback + 1) h.shift();
  const pos = st.held[id];
  if (pos) {
    const why = exitWhy(q, pos, mid);
    if (!why) return null;
    delete st.held[id]; st.open--; st.exits++;
    return { instrument: id, side: 'sell', size: pos.size, atStep: step, why };
  }
  if (st.open >= q.maxOpen) return null;
  if (q.entryDir !== 0 && h.length < q.lookback + 1) return null;
  if (q.maxEntryStep > 0 && step > q.maxEntryStep) return null;
  if (q.minQuote > 0 && !(quote >= q.minQuote)) return null;
  const count = st.count || (st.count = {});
  if (q.maxEntries > 0 && (count[id] || 0) >= q.maxEntries) return null;
  if (q.gated && !gateAdmits(q, sensors)) return null;
  if (q.entryDir !== 0) {
    const then = h[0], now = h[h.length - 1];
    if (!(then > 0)) return null;
    const ret = (now / then) - 1;
    if (q.entryDir < 0 ? ret > -q.entryUp : ret < q.entryUp) return null;
  } else if (!(mid > 0)) return null;
  st.held[id] = { peak: mid, steps: 0, size: q.size, entry: mid };
  st.open++; st.entries++; count[id] = (count[id] || 0) + 1;
  return { instrument: id, side: 'buy', size: q.size, atStep: step, why: q.entryDir < 0 ? 'dip' : q.entryDir > 0 ? 'momentum' : 'sensors' };
}

/** A fresh decision state, the one the cell's init holds and the kernel builds per instrument. */
export function traderState() { return { hist: {}, held: {}, open: 0, entries: 0, exits: 0, seenEvents: 0, count: {} }; }

defineKind('venue.trader', {
  doc: 'Decides. Reads market events and calls traderDecide: enters on a move of params.entryUp over params.lookback readings (up for entryDir 1, down for -1, no price trigger for 0), optionally only above params.minQuote reserve, before params.maxEntryStep, at most params.maxEntries times per instrument, and only when the reading\'s typed sensor vector (VENUE_SENSORS, computed by sense.venue) passes the sensor gate; exits on a stop loss, a trailing drawdown from the peak mid (armed after params.trailArm), a take profit, or after params.maxHold readings; closes everything when the tape ends. Emits one order event per run.',
  ports: {
    in: [{ name: 'in', kinds: ['event'] }],
    out: [{ name: 'order', kinds: ['event'] }],
  },
  defaults: { ...TRADER_DEFAULTS, queueMax: 256 },
  init: () => ({ queue: [], ...traderState(), dropped: 0, closedOnDone: 0 }),
  compute: (ins, cell, ctx) => {
    const p = cell.params, st = cell.state;
    const q = normalizeTrader(p);
    for (const sig of sigsOf(ins[0])) {
      const e = sig.data || {};
      if (e && e.done === true) { closeEverything(st, p); continue; }
      if (!e || e.reading !== true || typeof e.mid !== 'number' || !e.instrument) continue;
      const order = traderDecide(q, st, e.instrument, e.mid, e.step, Number(e.quote), e.sensors || null);
      if (order) push(st, order, p.queueMax);
    }
    if (!st.queue.length) return [null];
    return [{ kind: 'event', data: st.queue.shift() }];
  },
  serialize: (s) => ({ ...s, queue: s.queue.slice(0, 8), hist: {} }),
  cost: 1,
});

function closeEverything(st, p) {
  for (const id of Object.keys(st.held)) {
    const pos = st.held[id];
    delete st.held[id]; st.open--; st.exits++; st.closedOnDone++;
    push(st, { instrument: id, side: 'sell', size: pos.size, why: 'tape ended' }, p.queueMax);
  }
}

// ---------------------------------------------------------------- venue.script
// The control arm's decision cell. It carries a fixed list of { instrument, step, side }
// and emits each order when it perceives that instrument at that step or later, so a
// scripted arm travels the same edges, through the same border, with the same number of
// hops and the same fill convention as the brain arm. An arm that took a shortcut would be
// measuring the shortcut.
defineKind('venue.script', {
  doc: 'Emits a fixed list of orders (params.orders = [{ instrument, step, side, size }]) when the tape reaches each one, and closes anything still open when the tape ends. The control arm, on the same path as the brain arm.',
  ports: {
    in: [{ name: 'in', kinds: ['event'] }],
    out: [{ name: 'order', kinds: ['event'] }],
  },
  defaults: { orders: [], size: 0.02, closeOnDone: true, queueMax: 4096 },
  init: () => ({ queue: [], fired: 0, open: {}, openCount: 0, seenEvents: 0, dropped: 0, closedOnDone: 0 }),
  compute: (ins, cell, ctx) => {
    const p = cell.params, st = cell.state;
    const list = Array.isArray(p.orders) ? p.orders : [];
    for (const sig of sigsOf(ins[0])) {
      const e = sig.data || {};
      if (e && e.done === true) {
        if (p.closeOnDone) for (const id of Object.keys(st.open)) {
          delete st.open[id]; st.openCount--; st.closedOnDone++;
          push(st, { instrument: id, side: 'sell', size: Number(p.size), why: 'tape ended' }, p.queueMax);
        }
        continue;
      }
      if (!e || e.reading !== true || typeof e.step !== 'number' || !e.instrument) continue;
      st.seenEvents++;
      for (let i = 0; i < list.length; i++) {
        const o = list[i];
        if (o.fired) continue;
        if (o.instrument !== e.instrument) continue;
        if (e.step < Number(o.step)) continue;
        o.fired = true;
        st.fired++;
        if (o.side === 'buy') { st.open[o.instrument] = true; st.openCount++; }
        else if (st.open[o.instrument]) { delete st.open[o.instrument]; st.openCount--; }
        push(st, { instrument: o.instrument, side: o.side, size: Number(o.size ?? p.size), atStep: e.step, why: 'script' }, p.queueMax);
      }
    }
    if (!st.queue.length) return [null];
    return [{ kind: 'event', data: st.queue.shift() }];
  },
  serialize: (s) => ({ ...s, queue: s.queue.slice(0, 8) }),
  cost: 1,
});

/** Mark every scripted order unfired, so one script object can drive a second replay. */
export function resetScript(orders) { for (const o of orders) delete o.fired; return orders; }

// ---------------------------------------------------------------- wiring
/**
 * Grow the venue cells on a brain that already has a world region, and wire them through
 * the border relays attachWorld created. The decision cell sits in the motor region,
 * because deciding to act is motor, and perceiving a market is not.
 *
 * @param {import('../core/brain.mjs').Brain} brain
 * @param {object} opts
 * @param {object} opts.tape                 a tape from loadTape or synthTape (a live object)
 * @param {string} [opts.prefix='w']         must match the prefix attachWorld used
 * @param {'trader'|'script'|null} [opts.decide='trader']
 * @param {object} [opts.trader]             params for the venue.trader cell
 * @param {Array}  [opts.orders]             the order list for a venue.script cell
 * @param {number} [opts.size]               quote per entry
 * @param {number} [opts.feeRoundTrip]       the round trip fee the book charges
 * @returns {object} the ids it added and the edges it wired
 */
export function attachVenue(brain, opts = {}) {
  const prefix = opts.prefix || 'w';
  const percept = prefix + '.percept', motor = prefix + '.motor';
  const sense = prefix + '.venue', book = prefix + '.book', decide = prefix + '.decide';
  const period = Number(opts.period) || 1;
  // The border relay passes ONE event per run (world/actuators.mjs says why), and a reading
  // can produce a fill that comes back through the same relay. So the sense runs at half
  // the rate of the border by default: two border runs per reading, one for the reading and
  // one for whatever the reading caused. A faster sense would silently build a backlog and
  // the organism would be deciding on a price that is already old.
  const sensePeriod = Number(opts.sensePeriod) || 2 * period;
  const wired = [];
  const wire = (a, ap, b, bp) => { brain.connect(a, ap, b, bp); wired.push(a + '.' + ap + ' -> ' + b + '.' + bp); };

  brain.addCell({ id: sense, kind: 'sense.venue', region: 'world', circuit: 'senses', params: { tape: opts.tape, seed: opts.tape ? opts.tape.seed : 'venue' }, policy: { period: sensePeriod } });
  brain.addCell({ id: book, kind: 'world.venue', region: 'world', circuit: 'actuators', params: { tape: opts.tape, venue: opts.venue || (opts.tape ? opts.tape.venue : 'paper'), size: opts.size, feeRoundTrip: opts.feeRoundTrip ?? FEE_ROUND_TRIP, feeLegs: !!opts.feeLegs, maxImpact: Number(opts.maxImpact) || 0 }, policy: { period } });
  wire(sense, 'out', percept, 'in');
  wire(sense, 'error', percept, 'in');
  wire(motor, 'out', book, 'order');
  wire(book, 'fill', percept, 'in');
  wire(book, 'error', percept, 'in');

  const mode = opts.decide === undefined ? 'trader' : opts.decide;
  if (mode === 'trader') {
    brain.addCell({ id: decide, kind: 'venue.trader', region: 'motor', circuit: 'world', params: { size: opts.size, ...(opts.trader || {}) }, policy: { period } });
  } else if (mode === 'script') {
    brain.addCell({ id: decide, kind: 'venue.script', region: 'motor', circuit: 'world', params: { orders: opts.orders || [], size: opts.size }, policy: { period } });
  }
  if (mode) {
    wire(percept, 'out', decide, 'in');
    wire(decide, 'order', motor, 'in');
  }
  return { sense, book, decide: mode ? decide : null, wired };
}

// ================================================================ THE FULL TAPE
// A packed tape: every reading of every instrument in five typed arrays, instrument i
// occupying [off[i], off[i + 1]). Loaded once; nothing about it is a live cursor, so one
// packed tape serves every evaluation of a search at once.
//
// LIQUIDITY EVENTS. A swap on a constant product pool moves the two reserves along one
// curve, so quote * base stays put (it creeps up by the pool's own fee). A reading where the
// product jumps is somebody adding or pulling liquidity, or a reading the capture got wrong,
// and a replay cannot tell which. liq[j] = 1 marks a product move of more than
// LIQ_EVENT between reading j - 1 and reading j of the same instrument, and liqPrefix lets a
// trip ask in O(1) whether it held across one. Nothing is filtered on it: a pool that is
// pulled is a loss the trader really takes. It is reported, so a number that lives on
// those readings can be seen to live there. (LIQ_EVENT is defined with the sensors above,
// which use the same rule to tell a trade from a liquidity event.)

/**
 * Pack a list of instruments ({ id, migrated?, readings: [{ tMs, quote, base, ageS?,
 * births? }] }) into typed arrays. A reading without ageS gets seconds since the
 * instrument's first reading; without births, 0.
 * @returns {object} the packed tape
 */
export function packTape(instruments, fields = {}) {
  let total = 0;
  for (const inst of instruments) total += inst.readings.length;
  const n = instruments.length;
  const off = new Int32Array(n + 1);
  const tMs = new Float64Array(total), quote = new Float64Array(total), base = new Float64Array(total), mid = new Float64Array(total);
  const ageS = new Float64Array(total), births = new Float64Array(total), migrated = new Uint8Array(n);
  const liq = new Uint8Array(total), liqPrefix = new Int32Array(total);
  const ids = new Array(n);
  let j = 0, events = 0;
  for (let i = 0; i < n; i++) {
    const inst = instruments[i];
    ids[i] = inst.id;
    off[i] = j;
    migrated[i] = inst.migrated ? 1 : 0;
    const first = inst.readings[0];
    for (let s = 0; s < inst.readings.length; s++, j++) {
      const r = inst.readings[s];
      tMs[j] = r.tMs; quote[j] = r.quote; base[j] = r.base; mid[j] = midOf(r.quote, r.base);
      ageS[j] = ageOfReading(r, first); births[j] = Number(r.births) || 0;
      if (s > 0) {
        const k0 = quote[j - 1] * base[j - 1], k1 = quote[j] * base[j];
        if (k0 > 0 && Math.abs(k1 / k0 - 1) > LIQ_EVENT) { liq[j] = 1; events++; }
      }
      liqPrefix[j] = events;
    }
  }
  off[n] = j;
  return { packed: true, ...fields, ids, off, tMs, quote, base, mid, ageS, births, migrated, liq, liqPrefix, instruments: n, readings: total, liqEvents: events };
}

/**
 * Every sensor at every reading of a packed tape, one Float64Array per sensor (in
 * VENUE_SENSORS order), computed by sensorStep instrument by instrument. Attached to the tape
 * as tape.sensors so the kernel reads a column where the cell reads its event.
 */
export function sensorColumns(tape, window = SENSOR_WINDOW) {
  const cols = {};
  for (const name of SENSOR_NAMES) cols[name] = new Float64Array(tape.readings);
  const out = {}, r = { quote: 0, base: 0, ageS: 0, births: 0, migrated: 0 };
  for (let i = 0; i < tape.instruments; i++) {
    const ss = sensorState(window);
    r.migrated = tape.migrated ? tape.migrated[i] : 0;
    for (let j = tape.off[i]; j < tape.off[i + 1]; j++) {
      r.quote = tape.quote[j]; r.base = tape.base[j];
      r.ageS = tape.ageS ? tape.ageS[j] : 0; r.births = tape.births ? tape.births[j] : 0;
      sensorStep(ss, r, out);
      for (const name of SENSOR_NAMES) cols[name][j] = out[name];
    }
  }
  return { window, names: SENSOR_NAMES, cols };
}

/** Compute and attach tape.sensors (idempotent for one window). */
export function attachSensors(tape, window = SENSOR_WINDOW) {
  if (!tape.sensors || tape.sensors.window !== window) tape.sensors = sensorColumns(tape, window);
  return tape;
}

/** Pack a tape built by loadTape or synthTape (the organism's replay object). */
export function packReplayTape(tape) {
  return packTape(tape.instruments, { source: tape.source, db: tape.db, venue: tape.venue, seed: tape.seed, eligible: tape.eligible ?? tape.instruments.length, sampled: true, synthetic: !!tape.synthetic });
}

/**
 * Read EVERY instrument with at least minReadings readings out of the frozen trader
 * database, READ ONLY, into a packed tape. instruments > 0 draws that many by seed instead,
 * and the tape says sampled: true. Two statements: one to find who is eligible, one to
 * stream the rows in (signature, time) order.
 */
export function loadFullTape(opts = {}) {
  const file = String(opts.db || '');
  const minReadings = Number(opts.minReadings) || 20;
  const venue = String(opts.venue || 'pumpswap');
  const want = Number(opts.instruments) || 0;
  const seed = opts.seed === undefined ? 'venue.full' : String(opts.seed);
  const t0 = Date.now();
  const db = new DatabaseSync(file, { readOnly: true });
  try {
    const eligible = db.prepare(
      'select signature, count(*) n from pool_state where venue = ? and quote_balance > 0 and base_balance > 0' +
      ' group by signature having n >= ? order by signature'
    ).all(venue, minReadings);
    let chosen = eligible.map((r) => r.signature);
    if (want > 0 && want < chosen.length) {
      const rng = new RNG('venue.full.sample:' + seed);
      const pool = chosen.slice();
      for (let i = pool.length - 1; i > 0; i--) { const k = rng.int(i + 1); const t = pool[i]; pool[i] = pool[k]; pool[k] = t; }
      chosen = pool.slice(0, want).sort();
    }
    const keep = new Set(chosen);
    const by = new Map();
    const rows = db.prepare(
      'select signature, checked_at, age_s, quote_balance, base_balance from pool_state where venue = ?' +
      ' and quote_balance > 0 and base_balance > 0 order by signature, checked_at'
    );
    const births = birthRecordOf(db, venue);
    let scanned = 0, agesMissing = 0;
    for (const r of rows.iterate(venue)) {
      scanned++;
      if (!keep.has(r.signature)) continue;
      let list = by.get(r.signature);
      if (!list) { list = []; by.set(r.signature, list); }
      const tMs = toMs(r.checked_at);
      if (r.age_s === null || r.age_s === undefined) agesMissing++;
      list.push({ tMs, ageS: r.age_s === null || r.age_s === undefined ? undefined : Number(r.age_s), births: birthsBefore(births.bornMs, tMs), quote: Number(r.quote_balance), base: Number(r.base_balance) });
    }
    const origins = { migrated: 0, wallet: 0, other: 0, unknown: 0 };
    const instruments = chosen.filter((id) => by.has(id)).map((id) => {
      const o = births.origin.get(id) || 'unknown';
      origins[o] = (origins[o] || 0) + 1;
      return { id, migrated: o === 'migrated', readings: by.get(id) };
    });
    return packTape(instruments, {
      source: 'trader.db', db: path.resolve(file), venue, seed, minReadings,
      eligible: eligible.length, sampled: want > 0 && want < eligible.length, scanned, loadMs: Date.now() - t0, synthetic: false,
      birthRows: births.rows, agesMissing, origins,
    });
  } finally {
    db.close();
  }
}

/** The median gap between two readings of one instrument, in seconds: the tape's cadence. */
export function cadenceOf(tape) {
  const gaps = [];
  for (let i = 0; i < tape.instruments; i++) {
    for (let j = tape.off[i] + 1; j < tape.off[i + 1]; j++) gaps.push(tape.tMs[j] - tape.tMs[j - 1]);
  }
  gaps.sort((a, b) => a - b);
  return gaps.length ? gaps[gaps.length >> 1] / 1000 : 0;
}

/**
 * The holdout split, by INSTRUMENT, by a stable hash of its id: the same id lands on the
 * same side whatever order it was loaded in and whatever else is on the tape, and no
 * instrument is ever split in time.
 * @returns {{ train: Int32Array, holdout: Int32Array }}
 */
export function splitByInstrument(tape, { share = 0.25, salt = 'venue.holdout/1' } = {}) {
  const train = [], holdout = [];
  const cut = Math.round(share * 10000);
  for (let i = 0; i < tape.instruments; i++) {
    const h = hash32(salt + ':' + tape.ids[i]) % 10000;
    (h < cut ? holdout : train).push(i);
  }
  return { train: Int32Array.from(train), holdout: Int32Array.from(holdout) };
}

// ---------------------------------------------------------------- the replay kernel
// o = { size, fee, maxImpact, lag, draws }. lag is how many readings after the decision
// reading a fill lands: world.venue fills at the reading after the last one the sense
// emitted for that instrument, which on an interleaved tape is exactly one reading after the
// decision (test/venue.test.mjs measures it on the organism). A fill that would land past
// the end of the instrument lands on its last reading, as the book's does.
//
// acc collects plain numbers: trips, net (the sum of per trip returns after the fee, as a
// fraction of size), gross (the same before the fee), held (readings held, summed), buys,
// impactRefused, failed, liqTrips and liqNet (the trips that held across a liquidity
// event, and their net).
export function newAcc() {
  return { trips: 0, net: 0, gross: 0, held: 0, buys: 0, entries: 0, impactRefused: 0, failed: 0, liqTrips: 0, liqNet: 0, draws: 0, collisions: 0, noEntry: 0, fees: 0 };
}

/**
 * The fee a round trip pays, in units of size, given its proceeds. o.legs: fee / 2 of the
 * buy notional plus fee / 2 of the sell proceeds; otherwise the whole fee once on the notional.
 */
export function tripFee(gross, o) {
  return o.legs ? (o.fee / 2) * (1 + gross / o.size) : o.fee;
}

function closeTrip(tape, a, entryFill, exitFill, baseHeld, o, acc, onTrip, why) {
  const j = a + exitFill;
  const gross = payableSell(tape.quote[j], tape.base[j], baseHeld);
  const fee = tripFee(gross, o);
  // the once-on-the-notional arithmetic is kept to the bit, so every earlier bench replays
  const ret = o.legs
    ? (gross * (1 - o.fee / 2) - o.size * (1 + o.fee / 2)) / o.size
    : (gross - o.fee * o.size - o.size) / o.size;
  acc.trips++; acc.net += ret; acc.gross += (gross - o.size) / o.size; acc.held += exitFill - entryFill; acc.fees += fee;
  const crossed = tape.liqPrefix[a + exitFill] - tape.liqPrefix[a + entryFill] > 0;
  if (crossed) { acc.liqTrips++; acc.liqNet += ret; }
  if (onTrip) {
    // the payable prices the trip filled at, beside the mids of the same two readings, so a
    // report can check that no fill ever beat the ratio the pool reported (it never can)
    const e = a + entryFill;
    onTrip({ entryFill, exitFill, ret, gross, fee, crossed, why, buyPayable: o.size / baseHeld, buyMid: tape.mid[e], sellPayable: baseHeld > 0 ? gross / baseHeld : 0, sellMid: tape.mid[j] });
  }
  return ret;
}

/**
 * The evolved trader on instrument i: every reading goes through traderDecide, the same
 * function the venue.trader cell runs, and every order fills the way world.venue fills it.
 * @returns {number} this instrument's net (sum of trip returns)
 */
export function replayTrader(tape, i, q, o, acc, onTrip = null) {
  const a = tape.off[i], n = tape.off[i + 1] - a;
  const st = traderState();
  const lag = o.lag;
  // a gated genome reads the sensor columns; one object is refilled per reading, the shape
  // sense.venue hands venue.trader
  const S = q.gated ? (tape.sensors && tape.sensors.cols) : null;
  if (q.gated && !S) throw new Error('a genome with a sensor gate needs attachSensors(tape) first');
  const sv = S ? {} : null;
  let held = -1, baseHeld = 0, net = 0, heldDecision = -1;
  const tag = onTrip ? (t) => onTrip({ ...t, entryDecision: heldDecision }) : null;
  const act = (order, s) => {
    const f = s + lag < n ? s + lag : n - 1;
    const j = a + f;
    if (order.side === 'buy') {
      acc.entries++;
      if (held >= 0) { acc.failed++; return; }
      if (!admitsBuy(tape.quote[j], o.size, o.maxImpact)) { acc.impactRefused++; return; }
      const b = payableBuy(tape.quote[j], tape.base[j], o.size);
      if (!(b > 0)) { acc.failed++; return; }
      held = f; baseHeld = b; acc.buys++; heldDecision = s;
      return;
    }
    if (held < 0) { acc.failed++; return; }
    net += closeTrip(tape, a, held, f, baseHeld, o, acc, tag, order.why);
    held = -1; baseHeld = 0; heldDecision = -1;
  };
  for (let s = 0; s < n; s++) {
    const j = a + s;
    if (sv) {
      sv.realSol = S.realSol[j]; sv.ageS = S.ageS[j]; sv.trades = S.trades[j]; sv.buyers = S.buyers[j];
      sv.slope = S.slope[j]; sv.births = S.births[j]; sv.migrated = S.migrated[j];
    }
    const order = traderDecide(q, st, 'x', tape.mid[j], s, tape.quote[j], sv);
    if (order) act(order, s);
  }
  // the tape ended: venue.trader closes everything it believes it holds, and the sell
  // lands on the instrument's last reading
  if (st.held.x) { delete st.held.x; st.open--; act({ side: 'sell', why: 'tape ended' }, n - 1); }
  return net;
}

/**
 * The matched random control on instrument i: k round trips, entered at decision readings
 * drawn uniformly from the readings where a buy can fill, and exited by the SAME exit rule
 * (exitWhy with the same genome) as the trader. o.draws independent draws; a drawn entry
 * that falls inside the trip before it is skipped and counted as a collision.
 * @returns {{ trips: number, net: number }} summed over every draw
 */
export function replayControl(tape, i, q, k, rng, o, acc, onTrip = null) {
  const a = tape.off[i], n = tape.off[i + 1] - a;
  const out = { trips: 0, net: 0 };
  if (!(k > 0)) return out;
  const lag = o.lag;
  const fillOf = (s) => (s + lag < n ? s + lag : n - 1);
  const cand = [];
  for (let d = 0; d < n; d++) if (admitsBuy(tape.quote[a + fillOf(d)], o.size, o.maxImpact)) cand.push(d);
  if (!cand.length) { acc.noEntry++; return out; }
  const draws = Math.max(1, o.draws | 0);
  for (let r = 0; r < draws; r++) {
    acc.draws++;
    const m = Math.min(k, cand.length);
    const pick = cand.slice();
    for (let t = 0; t < m; t++) { const u = t + rng.int(pick.length - t); const tmp = pick[t]; pick[t] = pick[u]; pick[u] = tmp; }
    const sel = pick.slice(0, m).sort((x, y) => x - y);
    let busy = -1;
    for (const d of sel) {
      if (d <= busy) { acc.collisions++; continue; }
      const f = fillOf(d), j = a + f;
      const b = payableBuy(tape.quote[j], tape.base[j], o.size);
      if (!(b > 0)) { acc.failed++; continue; }
      const pos = { peak: tape.mid[a + d], steps: 0, size: o.size, entry: tape.mid[a + d] };
      let exitDecision = n - 1, why = 'tape ended';
      for (let s = d + 1; s < n; s++) {
        const w = exitWhy(q, pos, tape.mid[a + s]);
        if (w) { exitDecision = s; why = w; break; }
      }
      const g = why === 'tape ended' ? n - 1 : fillOf(exitDecision);
      const tag = onTrip ? (t) => onTrip({ ...t, draw: r, entryDecision: d, exitDecision }) : null;
      const ret = closeTrip(tape, a, f, g, b, o, acc, tag, why);
      out.trips++; out.net += ret;
      busy = exitDecision;
    }
  }
  return out;
}

/**
 * Hold on instrument i: one round trip, bought at the first reading from lag on where a buy
 * can fill, sold at the last reading. An instrument where no reading admits a buy has no
 * hold trip.
 * @returns {number} the trip return, or 0 when there was none
 */
export function replayHold(tape, i, o, acc) {
  const a = tape.off[i], n = tape.off[i + 1] - a;
  for (let f = Math.min(o.lag, n - 1); f < n - 1; f++) {
    const j = a + f;
    if (!admitsBuy(tape.quote[j], o.size, o.maxImpact)) continue;
    const b = payableBuy(tape.quote[j], tape.base[j], o.size);
    if (!(b > 0)) continue;
    acc.buys++;
    return closeTrip(tape, a, f, n - 1, b, o, acc, null, 'hold');
  }
  acc.noEntry++;
  return 0;
}

/**
 * The entry ceiling of instrument i: the best single round trip perfect foresight could
 * make, entering at any reading from lag on where a buy can fill and exiting at any later
 * reading, after the fee. For a fixed exit the best entry is the one that bought the most
 * base, so one pass with a running maximum is exact. swapOnly is the same over trips that
 * never hold across a liquidity event.
 * @returns {{ best: number, swapOnly: number, entries: number }} -Infinity when no entry exists
 */
export function ceilingOf(tape, i, o) {
  const a = tape.off[i], n = tape.off[i + 1] - a;
  let run = 0, runSeg = 0, best = -Infinity, swapOnly = -Infinity, entries = 0;
  const cost = o.fee * o.size + o.size;
  // with the fee on both legs the return is monotone in the proceeds, so the most base
  // bought is still the best entry for a fixed exit
  const retOf = o.legs
    ? (sell) => (sell * (1 - o.fee / 2) - o.size * (1 + o.fee / 2)) / o.size
    : (sell) => (sell - cost) / o.size;
  for (let g = Math.min(o.lag, n - 1); g < n; g++) {
    const j = a + g;
    if (tape.liq[j]) runSeg = 0;
    if (run > 0) { const r = retOf(payableSell(tape.quote[j], tape.base[j], run)); if (r > best) best = r; }
    if (runSeg > 0) { const r = retOf(payableSell(tape.quote[j], tape.base[j], runSeg)); if (r > swapOnly) swapOnly = r; }
    if (g < n - 1 && admitsBuy(tape.quote[j], o.size, o.maxImpact)) {
      const b = payableBuy(tape.quote[j], tape.base[j], o.size);
      if (b > 0) { entries++; if (b > run) run = b; if (b > runSeg) runSeg = b; }
    }
  }
  return { best, swapOnly, entries };
}

// ---------------------------------------------------------------- one trip from a reading (board 11)
/**
 * One round trip on instrument i decided at reading d: the buy fills at d + lag (or the last
 * reading) at the payable price if the slippage cap admits it, the SAME exit rule the trader
 * runs (exitWhy with q) decides the exit from the next reading on, and the sell fills at the
 * exit decision + lag, or on the last reading when the tape ends first. This is exactly the
 * trip replayTrader books for an entry decided at d, and it is what a control arm and an
 * entry census are made of.
 * @returns {number} the trip return after the fee, in units of size; NaN when no buy fills
 */
export function tripFrom(tape, i, d, q, o, acc, onTrip = null) {
  const a = tape.off[i], n = tape.off[i + 1] - a;
  if (!(d >= 0 && d < n)) return NaN;
  const f = d + o.lag < n ? d + o.lag : n - 1;
  const j = a + f;
  if (!admitsBuy(tape.quote[j], o.size, o.maxImpact)) return NaN;
  const b = payableBuy(tape.quote[j], tape.base[j], o.size);
  if (!(b > 0)) return NaN;
  acc.buys++;
  const pos = { peak: tape.mid[a + d], steps: 0, size: o.size, entry: tape.mid[a + d] };
  let exitDecision = n - 1, why = 'tape ended';
  for (let s = d + 1; s < n; s++) {
    const w = exitWhy(q, pos, tape.mid[a + s]);
    if (w) { exitDecision = s; why = w; break; }
  }
  const g = why === 'tape ended' ? n - 1 : (exitDecision + o.lag < n ? exitDecision + o.lag : n - 1);
  const tag = onTrip ? (t) => onTrip({ ...t, entryDecision: d, exitDecision }) : null;
  return closeTrip(tape, a, f, g, b, o, acc, tag, why);
}

/** The reading of instrument i whose age is nearest ageS (ties to the earlier one). */
export function nearestAgeReading(tape, i, ageS) {
  const a = tape.off[i], n = tape.off[i + 1] - a;
  let lo = 0, hi = n - 1;
  while (lo < hi) { const m = (lo + hi) >> 1; if (tape.ageS[a + m] < ageS) lo = m + 1; else hi = m; }
  if (lo > 0 && Math.abs(tape.ageS[a + lo - 1] - ageS) <= Math.abs(tape.ageS[a + lo] - ageS)) lo--;
  return lo;
}

/**
 * THE AGE MATCHED CONTROL (board 11). For every trip of an arm (its instrument and the age
 * at its entry decision), `draws` random entries, each on a random OTHER instrument of pool,
 * entered at that instrument's reading nearest the same age, exited by the SAME exit rule q.
 * So the control has the arm's trade count, its entry ages, its size, its fee and its exit;
 * the one thing it lacks is the entry choice.
 *
 * The candidates of a trip are found first, not guessed at: every instrument of pool other
 * than the trip's own whose nearest reading lies within tolS seconds of the age AND where a
 * buy decided there fills (the slippage cap admits it, the payable buy is positive). Each
 * draw picks one candidate uniformly, with replacement. A trip with no candidate at all is
 * counted in unmatched (its draws are missing, never silently dropped) and its perTrip is NaN.
 *
 * @param {Array<{ i: number, d: number }>} trips   the arm's trips: instrument and entry decision reading
 * @returns {{ perTrip: Float64Array, drawn: Int32Array, candidates: Int32Array, ages: Float64Array,
 *             matchedAges: Float64Array, unmatched: number, maxAgeGap: number, acc: object }}
 *   perTrip[t] is the mean control return over the draws of trip t (NaN when none matched);
 *   matchedAges holds every drawn entry's age, trip after trip, draw after draw
 */
export function replayAgeControl(tape, pool, trips, q, o, rng, { draws = 16, tolS = 30, onTrip = null } = {}) {
  const T = trips.length;
  const perTrip = new Float64Array(T), drawn = new Int32Array(T), candidates = new Int32Array(T), ages = new Float64Array(T);
  const matchedAges = new Float64Array(T * draws).fill(NaN);
  const acc = newAcc();
  let unmatched = 0, maxAgeGap = 0;
  const ci = [], cd = [];
  for (let t = 0; t < T; t++) {
    const { i, d } = trips[t];
    const age = tape.ageS[tape.off[i] + d];
    ages[t] = age;
    ci.length = 0; cd.length = 0;
    for (let p = 0; p < pool.length; p++) {
      const i2 = pool[p];
      if (i2 === i) continue;
      const a2 = tape.off[i2], n2 = tape.off[i2 + 1] - a2;
      if (n2 < 2) continue;
      if (age < tape.ageS[a2] - tolS || age > tape.ageS[a2 + n2 - 1] + tolS) continue;
      const d2 = nearestAgeReading(tape, i2, age);
      if (!(Math.abs(tape.ageS[a2 + d2] - age) <= tolS)) continue;
      const f2 = d2 + o.lag < n2 ? d2 + o.lag : n2 - 1;
      const j2 = a2 + f2;
      if (!admitsBuy(tape.quote[j2], o.size, o.maxImpact)) continue;
      if (!(payableBuy(tape.quote[j2], tape.base[j2], o.size) > 0)) continue;
      ci.push(i2); cd.push(d2);
    }
    candidates[t] = ci.length;
    let sum = 0, got = 0;
    for (let r = 0; r < draws; r++) {
      acc.draws++;
      if (!ci.length) { unmatched++; continue; }
      const k = rng.int(ci.length);
      const i2 = ci[k], d2 = cd[k];
      const tag = onTrip ? (x) => onTrip({ ...x, trip: t, draw: r, instrument: i2 }) : null;
      const ret = tripFrom(tape, i2, d2, q, o, acc, tag);
      if (!Number.isFinite(ret)) { unmatched++; continue; }
      const a2 = tape.ageS[tape.off[i2] + d2];
      const gap = Math.abs(a2 - age);
      if (gap > maxAgeGap) maxAgeGap = gap;
      matchedAges[t * draws + r] = a2;
      sum += ret; got++;
    }
    drawn[t] = got;
    perTrip[t] = got ? sum / got : NaN;
  }
  return { perTrip, drawn, candidates, ages, matchedAges, unmatched, maxAgeGap, acc };
}

/**
 * A replay tape (the live object sense.venue and world.venue read) out of a list of
 * instruments, for running the organism on exactly the readings a packed tape holds.
 */
export function replayTapeOf(instruments, fields = {}) {
  const list = instruments.map((inst) => ({
    id: inst.id, venue: inst.venue || fields.venue || 'pumpswap', migrated: !!inst.migrated,
    readings: inst.readings.map((r) => ({ tMs: r.tMs, ageS: r.ageS, births: r.births, quote: r.quote, base: r.base, mid: midOf(r.quote, r.base) })),
  }));
  return buildTape({ source: 'trader.db', db: null, venue: 'pumpswap', seed: 'packed', eligible: list.length, synthetic: false, ...fields }, list);
}

/** The readings of instrument i of a packed tape, as plain objects (with the age and births it carries). */
export function readingsOf(tape, i) {
  const out = [];
  for (let j = tape.off[i]; j < tape.off[i + 1]; j++) {
    out.push({ tMs: tape.tMs[j], quote: tape.quote[j], base: tape.base[j], ageS: tape.ageS ? tape.ageS[j] : undefined, births: tape.births ? tape.births[j] : 0 });
  }
  return out;
}
