# authorship: the P15 ruler, exact on this checkout

Author: board 17 builder (the organism's item), gap missed:authorship.json, 2026-09-26.
Verdict: `bench/verdicts/authorship.json` (isTheBar true, barMet false), written by `node tools/authorship.mjs --root /home/user/brain`.

## What changed (tools/authorship.mjs)

- THE COMMITS SINCE THE LAST DERIVED BOARD. The files share read only `docs/BOARDS.json` and `state/self/authored.jsonl`, so every change landed after board 13's checkpoint (1925a1e) counted nothing. The run now reads `git log HEAD --not <every checkpoint commit a launched entry names>` (read only, one `--name-only` call and one `-p --unified=0 -G` call) and attributes each commit by its author line: a merge is listed and not counted; the organism's when the subject says "organism authored"; a board's when the subject says the board landed or an added line carries a "board N builder" author line; the organism's when its added lines carry "Author: organism (<operator>)" headers and no board's; the orchestrator's otherwise. Markdown prose, JSON values and strings are mentions, not author lines. Printed as the COMMITS line with numerator and denominator, and in `verdict.commits` with one row per commit (author, how, evidence, development or heldOut).
- barMet needs the latest ISO week with any counted unit to be the organism's in both records (files and commits).
- The split: development is PARSER_HEAD (596b011) and its ancestors in the window; a later commit is held out; contaminated carries the reason (a ruler over its own repository has no held-out set when it is written).
- The root is read from the checkout when `--root` names no directory here (the ledger's `C:\Users\...` path on Linux).
- The LANDED line and subject parsers accept the Linux session's shapes: "BOARD 20 host LANDED", "BOARD 17 WAVES 1 AND 2 LANDED", "BOARD 21 AND BOARD 20 SPEED LANDED", "board 17 missed-gaps landed". Old against new over every LOG line and every subject: only those differ.
- `--no-commits` is the control arm.

## Measured

Bar (`node tools/authorship.mjs --root /home/user/brain`, Node v24.9.0, verdict at 2026-09-26T22:19:08.433Z):

    SHARE (cumulative): numerator 0 organism-authored kept patches, denominator 392 (0 kept patches + 392 board files) = 0/392 = 0.0000 (0.00 percent)
    COMMITS (since the last derived board): numerator 0 organism-authored commits, denominator 37 counted commits (0 the organism's + 6 a board's [board 17 2, board 18 1, board 19 1, board 20 2, board 21 1] + 31 the orchestrator's; 1 merge not counted) = 0/37 = 0.0000 (0.00 percent)

Trial (`node tools/budget.mjs --ram-mb 4000 --disk-mb 100 --dir <tmp> -- node tools/authorship.mjs --no-write --json`; 4000 MB here, not the proposal's 6000 from his 64 GB PC): share 0 (0/392), commits 0/37, barMet false, `BUDGET done exit 0: wall 0.31 s, peak ram 24.6MB`. Control (`--no-commits`): share 0 (0/392), commits not read. Noise: two runs identical apart from `at` and the day count.

Missed: the bar is a share of 1; measured 0/392 in files and 0/37 in commits. Every landed change on this host is a board's or the orchestrator's.

## Next rung

The self-code operator lands one kept patch whose file carries `Author: organism (<operator>)` and whose commit subject says "organism authored" (queue item 6, LOCAL). The COMMITS numerator then reads 1. Then `node tools/authorship.mjs --fill --write-boards` (the orchestrator's; it now derives boards 17 to 21) moves the window base past board 21.
