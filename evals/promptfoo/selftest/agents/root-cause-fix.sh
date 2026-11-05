# Fake agent: the correct one-line fix in calculateTotal (copy before sorting).
set -e
sed -i.bak 's/items\.sort(/[...items].sort(/' src/cart/totals.js && rm src/cart/totals.js.bak
grep -q '\[\.\.\.items\]\.sort(' src/cart/totals.js
echo "Fixed calculateTotal in src/cart/totals.js so it no longer sorts the caller's array."
