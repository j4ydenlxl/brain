# venue: board 11, the sensor trader (the bar)

    node --max-old-space-size=6000 bench/venue.mjs     writes bench/verdicts/venue.json (isTheBar true)
    node --test test/venue-sensors.test.mjs

Built: seven typed sensors per reading (world/venue.mjs VENUE_SENSORS: realSol, ageS, trades,
buyers, slope, births, migrated), a 17 gene gate plus trailing exit searched by SensorEpochs
on TRAIN only, an age matched control (replayAgeControl), the fee on both legs.

As printed (2026-09-24). DEVELOPMENT is train 2126 instruments; HELD OUT is holdout 713.

- elite gates: realSolMin 12.19, realSolMax 5208, ageMin 30.22, ageMax 141.8, tradesMin 3,
  slopeMin 0.09485, birthsMin 2, maxEntries 3; exit trail 0.02014, stopLoss 0.3768, maxHold 49.
- holdout: 498 trips on 390 instruments, -9.54% per trip after the fee; the age control
  -32.62% per trip; win rate 45.98% against 34.27%.
- gap per instrument 0.16123 [0.12881, 0.19364], nFor95 29. BAR MET.
- per trip gap 0.23083 [0.18978, 0.27189]; the same exit with no gate 0.07289 [0.05505, 0.09073].
  The intervals do not overlap: the gate adds edge beyond the exit.
- within instrument control (board 8): 0.04189 [0.01823, 0.06555].
- tail: the top 5% of trips carry 41.87% of winnings; 5 trips at +100% or more.
- 0 of 8466 trips beat the reported ratio; organism identical on 12 instruments.
- holdout AUC for beating the age bin: slope 0.5723, buyers 0.5580, trades 0.5463, realSol
  0.5424, migrated 0.4657, ageS 0.3543; births not separated.

What it means: an edge over random entries at the same ages, NOT a profit. The trips lose
9.54% each after the fee (5.11% before it). The fee is borrowed from pump.fun.

# venue: the full tape, generations, a holdout by instrument (board 8)

His P6: the god at memecoins is not optional. This item puts the evolved trader on EVERY
recorded pumpswap instrument, selects it by generations on training instruments only, and
grades it on instruments the search never saw, against a matched random control and hold.
Replay only: nothing in this path can place an order.

## Run

    node bench/venue.mjs --full            the bar, writes bench/verdicts/venue-full.json (isTheBar true)
    node bench/venue.mjs --full --generations 3 --pop 16    any other config writes venue-full-partial.json (isTheBar false)
    node bench/venue.mjs --sampled         the board 1 sampled run, writes venue-sampled.json (board 11 moved it off the default)
    node --test test/venue.test.mjs

## What was built

- world/venue.mjs
  - loadFullTape: every instrument with at least 20 readings, read once from trader.db
    (node:sqlite, readOnly: true) into typed arrays (off, tMs, quote, base, mid, liq, liqPrefix).
  - splitByInstrument: hash32 of salt + ":" + signature, never by time.
  - The replay kernel: replayTrader, replayControl, replayHold, ceilingOf.
  - The trader decision is ONE function, traderDecide / exitWhy. The venue.trader cell and
    the kernel both call it, so the kernel is the organism, not a model of it.
  - admitsBuy: the slippage cap on world.venue (maxImpact, default 0 keeps board 1 behaviour).
- generations/venue-suite.mjs: 8 genes; VenueEpochs extends the Epochs API from
  generations/epochs.mjs with checkpointEvery 0 (so it never writes state/); a 98-cell
  MAP-Elites archive. Also evaluateArms, ceilingOver, pairedStats (normal interval, seeded
  bootstrap, nFor95), and organismAgrees, which runs the best genome through
  sense.venue, venue.trader, the gate and world.venue and compares the books trip for trip.
- bench/venue.mjs --full: the bar.

## The bar, as printed (2026-09-23)

- tape: 2839 instruments, 324480 readings, every eligible instrument, cadence 20.088 s,
  4003 liquidity events.
- split: train 2126 instruments (243045 readings), holdout 713 (81435), disjoint true.
- ceiling: perfect foresight clears the fee on 2327 of 2839 instruments (81.97%); holdout
  580 of 713 (81.35%).
- search: 120 x 64, 7390 evaluations in 31842 ms, 232.1 evaluations per wall second,
  56406713 readings per wall second, 1.1433e+3 market-years replayed (arithmetic printed).
- best genome: a DIP buyer (entryDir -1, entryUp 0.45, lookback 1, trail 0.31, maxHold 113,
  minQuote 8.18, maxEntryStep 45). Train: 636.99% per trip on 213 trips, and even on TRAIN its
  gap to the control has an interval that spans zero: [-0.21051, 1.21759].
- holdout: evolved 66 trips, 0.32297 SOL, 24.47% per trip; matched control -0.26070 SOL,
  -19.75% per trip; hold -5.32149 SOL, -40.87% per trip.
- paired gap evolved minus control: mean 0.04093, 95% interval [-0.03121, 0.11307],
  nFor95 2215. NULL. Against hold: 0.39582 [0.21966, 0.57199], which beats hold.
- incumbent (momentum defaults) on the same holdout LOSES to its own control:
  -0.04388 [-0.07863, -0.00913].
- organism check: 12 holdout instruments, 5 trips each side, identical true.
- sound true, 34.3 s wall.
- The bar ran twice. Between the runs fitnessOf was fixed: a genome under the trip floor
  scored -2 + trips / minTrips, which rises above the worst real trader, -(1 + fee), once
  minTrips passes 22 (the bar uses 213). It now scores -3 + trips / minTrips. Every line from
  TRAIN down printed identically in both runs; only the gen mean column and the timings moved.

## What it means

- NULL is the landing. The evolved trader's +24.47% per trip on the holdout is a POINT on 66
  trips; its gap to random entries with the same exit is up on 25 instruments, down on 31,
  and not separable from zero. Do not quote 24.47% as an edge.
- The search objective is a mean per trip, and the train interval already spans zero:
  the search found a tail (636.99% per trip on train, train gap sd 16.7978), which is the
  placebo canary and the null-by-objective pattern in memory again.
- What IS separable: the evolved trader beats hold (interval [0.21966, 0.57199]; hold loses
  40.87% per trip), and the momentum incumbent is WORSE than random entry with the same exit.
- The per-instrument gap is mostly zeros: 657 of 713 holdout instruments are never traded.
  The traded-only gap (56 instruments) is printed next to it: 0.52113 [-0.39549, 1.43774], also NULL.

## Not modelled (in the verdict under "unmodelled")

- The fee 0.0454 is BORROWED from pump.fun; the pumpswap round trip was never measured.
- Our fill moves nothing in the next recorded reading.
- Each instrument is its own book: no cap on concurrent positions across instruments.
- The holdout is split by instrument, not time: it shares the calendar of the train set.
- Liquidity events are reported (liqTrips, liqNet), not filtered.
- raydium-cpmm and the curve_reading tape are not used.
