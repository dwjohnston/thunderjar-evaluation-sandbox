#!/bin/bash
# Reference (oracle) solution: the one-line root-cause fix in calculateTotal.
# Run by `harbor run -a oracle` to check the task end to end.
set -euo pipefail
cd /app
sed -i 's/const sorted = items\.sort(/const sorted = [...items].sort(/' src/cart/totals.js
grep -q '\[\.\.\.items\]\.sort(' src/cart/totals.js
