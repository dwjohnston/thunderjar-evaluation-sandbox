#!/usr/bin/env bash
# Copies the scenario's code into the eval fixture, minus its README.md (which
# explains the trap) and grading/ folder. PROMPT.md and EVAL.ts stay: agent-eval
# keeps both away from the agent and adds EVAL.ts back only for grading.
set -euo pipefail
cd "$(dirname "$0")"
SCENARIO=../../01_wrong_place_bug
FIXTURE=evals/wrong-place-bug

find "$FIXTURE" -mindepth 1 -maxdepth 1 ! -name PROMPT.md ! -name EVAL.ts -exec rm -rf {} +
(cd "$SCENARIO" && tar cf - --exclude=README.md --exclude=grading .) | tar xf - -C "$FIXTURE"
echo "Synced $SCENARIO into $FIXTURE"
