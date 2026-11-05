#!/usr/bin/env bash
# Copies the scenario into the Harbor task, so the task folder is self-contained:
#  - the scenario's code (minus README.md and grading/) -> environment/workspace/, baked into the agent's image
#  - the hidden grader                                    -> tests/check.js, only in the verifier's image
set -euo pipefail
cd "$(dirname "$0")"
SCENARIO=../../01_wrong_place_bug
TASK=wrong-place-bug

rm -rf "$TASK/environment/workspace"
mkdir -p "$TASK/environment/workspace"
(cd "$SCENARIO" && tar cf - --exclude=README.md --exclude=grading .) | tar xf - -C "$TASK/environment/workspace"
cp "$SCENARIO/grading/check.js" "$TASK/tests/check.js"
echo "Synced $SCENARIO into $TASK"
