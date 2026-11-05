#!/bin/sh
# The intended fix: calculateTotal sorts a copy, not its caller's array. Left uncommitted, to
# check that the diff checks see working-tree changes too.
set -e
cd /workspace
sed -i 's/items\.sort(/[...items].sort(/' src/cart/totals.js
echo "root-cause-fix: calculateTotal now sorts a copy of items."
