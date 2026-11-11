#!/usr/bin/env bash
# Sizes and stops the Fly machine `dockerd` in app thunderjar-runtime-dwj, for the runtime's
# beforeRun and afterRun in thunderjar.config.ts.
#
#   fly-runtime.sh up     size it for the run, from THUNDERJAR_CONCURRENCY and
#                         THUNDERJAR_CONTAINERS, and start it
#   fly-runtime.sh down   stop it
#
# Each container gets half a CPU and 1 GB: performance-<n>x, with n = half the containers that
# run at once, rounded up to a size Fly has (2 GB per CPU). Needs FLYIO_TOKEN.
#
# Thunderjar shows the last line written to stderr when a hook fails, so errors are one line.
set -euo pipefail

APP=thunderjar-runtime-dwj
SIZES=(1 2 4 6 8 10 12 14 16)
export FLY_API_TOKEN="${FLY_API_TOKEN:-${FLYIO_TOKEN:-}}"
die() { echo "fly-runtime: $*" >&2; exit 1; }
[ -n "$FLY_API_TOKEN" ] || die "FLYIO_TOKEN is not set"

# Runs fly quietly, failing with the last line it wrote to stderr.
fly_() {
  local out
  out=$(fly "$@" 2>&1) || die "$(printf '%s\n' "$out" | awk 'NF { last = $0 } END { print last }')"
  printf '%s\n' "$out"
}

# The machine's ID, state, CPU kind and CPUs, tab-separated.
read -r ID STATE KIND CPUS < <(fly_ machine list -a "$APP" --json |
  jq -r '.[0] | [.id, .state, .config.guest.cpu_kind, .config.guest.cpus] | @tsv')
[ -n "${ID:-}" ] && [ "$ID" != null ] || die "Fly app $APP has no machine"

case "${1:-}" in
  up)
    concurrency=${THUNDERJAR_CONCURRENCY:-1} containers=${THUNDERJAR_CONTAINERS:-1}
    at_once=$((concurrency < containers ? concurrency : containers))
    wanted=$(((at_once + 1) / 2)) cpus=${SIZES[-1]}
    for size in "${SIZES[@]}"; do
      if [ "$size" -ge "$wanted" ]; then cpus=$size; break; fi
    done
    if [ "$KIND" = performance ] && [ "$CPUS" = "$cpus" ]; then
      [ "$STATE" = started ] || fly_ machine start -a "$APP" "$ID" >/dev/null
      echo "$ID is already performance-${cpus}x"
    else
      # Restarts the machine, or starts it if it was stopped.
      fly_ machine update "$ID" -a "$APP" --vm-size "performance-${cpus}x" --vm-memory $((cpus * 2048)) --yes >/dev/null
      echo "$ID resized to performance-${cpus}x for $at_once containers at once"
    fi
    ;;
  down)
    [ "$STATE" != started ] || fly_ machine stop -a "$APP" "$ID" >/dev/null
    echo "$ID stopped"
    ;;
  *) die "expected up or down, got '${1:-}'" ;;
esac
