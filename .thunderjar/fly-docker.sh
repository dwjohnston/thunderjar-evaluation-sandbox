#!/usr/bin/env bash
# Runs `docker` against the Docker daemon on the Fly machine `dockerd` in app
# thunderjar-runtime-dwj, for thunderjar.config.ts's runtime.
#
# Docker reaches it as an ssh:// host, which makes the CLI run
# `ssh <host> docker system dial-stdio`. A stand-in `ssh`, on this script's PATH
# only, runs that through `fly ssh console` instead. (`fly proxy` to a TCP port
# loses the output of `docker run` and `docker exec`, so it can't be used.)
# Starts the machine if it's stopped. Needs FLYIO_TOKEN.
set -euo pipefail

APP=thunderjar-runtime-dwj
export FLY_API_TOKEN="${FLY_API_TOKEN:-${FLYIO_TOKEN:?FLYIO_TOKEN is not set}}"

SHIM="${TMPDIR:-/tmp}/fly-docker-shim"
if [ ! -x "$SHIM/ssh" ]; then
  mkdir -p "$SHIM"
  cat >"$SHIM/ssh" <<EOF
#!/usr/bin/env bash
exec fly ssh console -a $APP -q -C "docker system dial-stdio"
EOF
  chmod +x "$SHIM/ssh"
fi
export PATH="$SHIM:$PATH"
HOST="ssh://root@$APP"

up() { docker -H "$HOST" version >/dev/null 2>&1; }

if ! up; then
  fly machine start -a "$APP" "$(fly machine list -a "$APP" -q | awk 'NF { print $1; exit }')" >/dev/null 2>&1 || true
  for _ in $(seq 1 30); do up && break; sleep 2; done
  up || { echo "fly-docker: can't reach the Docker daemon on Fly app $APP" >&2; exit 1; }
fi

exec docker -H "$HOST" "$@"
