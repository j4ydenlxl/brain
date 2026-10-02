#!/usr/bin/env bash
# The body on a machine of our own. His words, 2026-10-02: "What if we dont use github and use our own code
# thing on the cloud." The heartbeat (body/heartbeat.yml) rents GitHub's runners by the minute; this is the same
# beat for one always-on Linux machine we hold ourselves: no minute to ration, the repository stays private, and
# GitHub is only where the commits are stored. No step calls a model. It mirrors the one-runner path of the
# heartbeat's "burn eras" step: level to the remote, drive this machine's own browser, land its screens, pull
# the watch list, then one era after another, each shipped by the era (grow/era.mjs run --commit).
#
#   body/own.sh run     beats back to back until stopped (OWN_BEAT_MINUTES a beat, default 60)
#   body/own.sh once    one beat, then exit
#   body/own.sh unit    print a systemd unit that keeps `run` alive across reboots
#
# It refuses a PC (exit 4). level() resets the checkout hard to origin/master, and an era runs what absorbed
# bytes produce as children of the machine (the grow/era.mjs rule), so this runs only on a headless Linux
# machine, and its first beat only in a checkout with nothing uncommitted in it. On such a machine it sets CI
# for the era: that is the truth there, not a way round the rule. A push uses the checkout's own remote (a
# deploy key with write access); no token is read here. The site data is still rebuilt by the heartbeat.
# STATUS: bash -n clean; never yet run on a machine. Its first beat on one is its bar.
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1
verb="${1:-}"
MARK=work/own.body

say() { printf '%s\n' "$*"; }
refuse() { say "own: refused: $*" >&2; exit 4; }

unit() {
  cat <<EOF
[Unit]
Description=brain organism: the body on a machine of our own
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$(id -un)
WorkingDirectory=$PWD
Environment=PATH=$PATH
ExecStart=/usr/bin/env bash $PWD/body/own.sh run
Restart=always
RestartSec=30
Nice=5

[Install]
WantedBy=multi-user.target
EOF
}

guard() {
  [ "$(uname -s)" = Linux ] || refuse "not Linux ($(uname -s)): this body is for a headless cloud machine"
  if grep -qi microsoft /proc/version 2>/dev/null; then refuse "WSL is his PC"; fi
  if [ -n "${DISPLAY:-}${WAYLAND_DISPLAY:-}" ]; then refuse "a desktop session is open: this looks like a PC"; fi
  command -v node >/dev/null || refuse "no node on the path"
  git rev-parse --is-inside-work-tree >/dev/null 2>&1 || refuse "not a git checkout"
  # the first beat needs a clean clone made for this; later ones (a restart mid-era) are levelled anyway
  if [ ! -f "$MARK" ]; then
    [ -z "$(git status --porcelain)" ] || refuse "the checkout holds uncommitted work and level() would erase it: use a clone made for this"
    mkdir -p work && date -u +%Y-%m-%dT%H:%M:%SZ > "$MARK"
  fi
  git config user.name "brain organism"
  git config user.email "brain-organism@users.noreply.github.com"
}

# every era starts from what the remote holds: another writer (the heartbeat, a session) may have pushed since
level() {
  git rebase --abort >/dev/null 2>&1 || true
  if git fetch -q origin master; then git reset -q --hard origin/master; git clean -fdq -- neo grown; fi
  if [ -f grow/machine.mjs ] && [ -d "$tmp/machine" ]; then
    node grow/machine.mjs land --from "$tmp/machine" > "$tmp/land.log" 2>&1 || say "machine: land failed: $(tail -n 1 "$tmp/land.log")"
  fi
}

beat() {
  tmp=$(mktemp -d) || return 1
  minutes="${OWN_BEAT_MINUTES:-60}"
  case "$minutes" in ''|*[!0-9]*) minutes=60 ;; esac
  [ "$minutes" -lt 2 ] && minutes=2
  end=$(( $(date +%s) + minutes * 60 ))
  level
  n=$(git rev-list --count HEAD 2>/dev/null || echo 0)
  # this machine is its own computer: it drives its browser here, inside the beat's minutes
  if [ -f grow/machine.mjs ]; then
    node grow/machine.mjs step --shard 0/1 --out "$tmp/machine/self" --era "$n" --max-ms 300000 | tail -n 1 || say "machine: the step failed; the eras go on"
  fi
  if [ -d "$tmp/machine" ]; then level; say "machine: $(tail -n 1 "$tmp/land.log" 2>/dev/null)"; fi
  # the watch step: every keyless public source on the watch list, one snapshot a beat
  if [ -f grow/tape.mjs ]; then
    node grow/tape.mjs pull --max-ms 30000 --era "$n" | tail -n 1 || say "tape: the pull failed; the eras go on"
  fi
  eras=0
  # an era needs room to measure and ship: never start one with under 90 seconds left
  while [ $(( end - $(date +%s) )) -ge 90 ]; do
    left_ms=$(( (end - $(date +%s) - 45) * 1000 ))
    ms=$(( left_ms < 480000 ? left_ms : 480000 ))
    level
    if ! out=$(node grow/era.mjs run --max-ms "$ms" --commit); then say "the era loop failed; the beat ends here"; break; fi
    line=$(printf '%s\n' "$out" | tail -n 1)
    say "$line"
    eras=$(( eras + 1 ))
    case "$line" in *'"stop":"idle"'*) say "idle: nothing left to grow in this beat"; break ;; esac
  done
  # what landed and no era shipped (an idle era commits nothing) goes in a commit of its own
  if [ -f grow/machine.mjs ] && [ -d "$tmp/machine" ]; then
    for try in 1 2 3; do
      paths=""
      for p in neo/machines neo/screens neo/machines.json; do [ -e "$p" ] && paths="$paths $p"; done
      [ -n "$paths" ] || break
      git add -A -- $paths
      if git diff --cached --quiet -- $paths; then say "machine: every landed screen is shipped"; break; fi
      git commit -q -m "machine: the screens and records of this beat's computer" -- $paths
      if git push -q origin HEAD:master; then say "machine: landed and pushed"; break; fi
      say "machine: the push lost to a newer head (try $try)"
      level
    done
  fi
  say "beat: $eras era runs in $minutes minutes on $(nproc) cores"
  rm -rf "$tmp"
}

case "$verb" in
  unit) unit ;;
  once) guard; export CI=1; beat ;;
  run)
    guard; export CI=1
    while :; do
      t0=$(date +%s)
      beat || say "own: the beat failed; the next one starts in a minute"
      # a beat that ended at once (an idle organism, a failed era) must not spin the machine
      [ $(( $(date +%s) - t0 )) -lt 60 ] && sleep 60
    done
    ;;
  *) say "usage: body/own.sh run | once | unit" >&2; exit 2 ;;
esac
