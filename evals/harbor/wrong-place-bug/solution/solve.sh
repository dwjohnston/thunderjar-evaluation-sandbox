#!/bin/bash
# The reference fix, run by `harbor run -a oracle` to prove the task is solvable
# and the verifier gives it full marks: sort a copy instead of the caller's array.
set -e
cd /app
sed -i 's/items\.sort(/[...items].sort(/' src/totals.js
