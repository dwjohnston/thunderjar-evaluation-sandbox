#!/bin/bash
# Runs in the separate verifier container, in /app, which holds the agent's
# final /app. Writes the rewards to /logs/verifier/reward.json.
cd /app
mkdir -p /logs/verifier

# Visible check: the scenario's own tests, which the agent could run itself.
if npm test > /logs/verifier/npm-test.log 2>&1; then visible=1; else visible=0; fi

# Hidden check: calculateTotal must not mutate its input, and cartSummary
# (another caller the bug report never mentions) must work.
mkdir -p grading && cp /tests/check.js grading/check.js
if node grading/check.js > /logs/verifier/root-cause.log 2>&1; then root=1; else root=0; fi

# The headline reward is 1 only when both pass.
reward=$(( visible * root ))
printf '{"reward": %d, "visible_tests": %d, "root_cause": %d}\n' "$reward" "$visible" "$root" > /logs/verifier/reward.json
cat /logs/verifier/reward.json
