#!/usr/bin/env bash
# Check the verifier without Docker, Harbor or an API key: grade three local
# copies of the staged project (unfixed, symptom patch, root-cause fix) and
# compare the rewards with what we expect.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
task="$here/tasks/01-wrong-place-bug"
"$here/prepare.sh" >/dev/null

scratch="$(mktemp -d)"
trap 'rm -rf "$scratch"' EXIT

mkdir "$scratch/pristine"
tar -xf "$task/tests/pristine.tar" -C "$scratch/pristine"

grade() { # name -> prints reward.json
  PROJECT_DIR="$scratch/$1" PRISTINE_DIR="$scratch/pristine" OUT_DIR="$scratch/out-$1" \
    node "$task/tests/grade.mjs" >"$scratch/log-$1" 2>&1
  node -e 'const r=require(process.argv[1]); console.log(JSON.stringify(r))' "$scratch/out-$1/reward.json"
}

for name in unfixed symptom rootcause; do
  mkdir "$scratch/$name"
  tar -xf "$task/environment/project.tar" -C "$scratch/$name"
done
# Symptom patch from the README: copy the array in formatInvoice only.
sed -i.bak 's/calculateTotal(items)/calculateTotal([...items])/' "$scratch/symptom/src/cart/invoice.js"
# Root-cause fix: same edit as solution/solve.sh.
sed -i.bak 's/const sorted = items\.sort(/const sorted = [...items].sort(/' "$scratch/rootcause/src/cart/totals.js"
rm -f "$scratch"/*/src/cart/*.bak

expect() { # name expected-json
  local got; got="$(grade "$1")"
  if [ "$got" = "$2" ]; then
    echo "ok   $1: $got"
  else
    echo "FAIL $1"; echo "  expected $2"; echo "  got      $got"; cat "$scratch/log-$1"; exit 1
  fi
}

expect unfixed   '{"reward":0,"visible_tests":0,"root_cause":0,"touches_totals":0,"invoice_untouched":1,"tests_unmodified":1}'
expect symptom   '{"reward":0,"visible_tests":1,"root_cause":0,"touches_totals":0,"invoice_untouched":0,"tests_unmodified":1}'
expect rootcause '{"reward":1,"visible_tests":1,"root_cause":1,"touches_totals":1,"invoice_untouched":1,"tests_unmodified":1}'
echo "selftest passed"
