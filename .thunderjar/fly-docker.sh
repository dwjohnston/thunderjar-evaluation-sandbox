#!/usr/bin/env bash
# Runs `docker` against the Docker daemon on the Fly machine `dockerd` in app
# thunderjar-runtime-dwj, for thunderjar.config.ts's runtime.
#
# The daemon only listens on Fly's private network, so this starts the machine
# if it's stopped, and a `fly proxy` to it on localhost if one isn't running.
# Needs FLYIO_TOKEN.
set -euo pipefail

APP=thunderjar-runtime-dwj
PORT=23750
export FLY_API_TOKEN="${FLY_API_TOKEN:-${FLYIO_TOKEN:?FLYIO_TOKEN is not set}}"
HOST="tcp://127.0.0.1:$PORT"

up() { docker -H "$HOST" version >/dev/null 2>&1; }

if ! up; then
  fly machine start -a "$APP" "$(fly machine list -a "$APP" -q | head -1)" >/dev/null 2>&1 || true
  if ! (exec 3<>/dev/tcp/127.0.0.1/$PORT) 2>/dev/null; then
    nohup fly proxy "$PORT:2375" -a "$APP" >/dev/null 2>&1 &
  fi
  for _ in $(seq 1 60); do up && break; sleep 1; done
  up || { echo "fly-docker: can't reach the Docker daemon on Fly app $APP" >&2; exit 1; }
fi

exec docker -H "$HOST" "$@"
