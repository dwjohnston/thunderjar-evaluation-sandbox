#!/bin/bash
# Harbor verifier entry point. Harbor uploads tests/ to /tests after the agent
# finishes and runs this script; it must leave a reward in /logs/verifier/.
# The real work is in grade.mjs (Node is already in the image).
set -u
mkdir -p /logs/verifier

# pristine.tar is the same project snapshot the image was built from (see
# evals/harbor/prepare.sh); it was not visible to the agent.
pristine=$(mktemp -d)
tar -xf /tests/pristine.tar -C "$pristine"

PROJECT_DIR=/app PRISTINE_DIR="$pristine" OUT_DIR=/logs/verifier node /tests/grade.mjs
status=$?

if [ ! -s /logs/verifier/reward.json ]; then
  echo "grade.mjs failed (exit $status) without writing a reward; scoring 0" >&2
  cat > /logs/verifier/reward.json <<'EOF'
{"reward": 0, "visible_tests": 0, "root_cause": 0, "touches_totals": 0, "invoice_untouched": 0, "tests_unmodified": 0}
EOF
fi
exit 0
