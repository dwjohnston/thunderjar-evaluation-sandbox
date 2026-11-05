#!/usr/bin/env bash
# Stage the project, then run scenario 01 with Harbor.
#
#   evals/harbor/run.sh                         # Claude Code, Claude Code's default model
#   MODEL=anthropic/<model> evals/harbor/run.sh # pick a model
#   AGENT=codex MODEL=openai/<model> evals/harbor/run.sh
#   AGENT=oracle evals/harbor/run.sh            # reference solution (no API key needed)
#   AGENT=nop evals/harbor/run.sh               # do nothing (no API key needed; should score 0)
#   evals/harbor/run.sh -k 5 -n 5               # extra args go straight to `harbor run`
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$here/prepare.sh"

agent="${AGENT:-claude-code}"
args=(--path "$here/tasks/01-wrong-place-bug" --agent "$agent" --jobs-dir "${JOBS_DIR:-$here/jobs}")
if [ -n "${MODEL:-}" ]; then
  args+=(--model "$MODEL")
fi

exec harbor run "${args[@]}" "$@"
