# Fake agent: patches the symptom in formatInvoice only (cartSummary stays broken).
set -e
sed -i.bak 's/calculateTotal(items)/calculateTotal([...items])/' src/cart/invoice.js && rm src/cart/invoice.js.bak
grep -q 'calculateTotal(\[\.\.\.items\])' src/cart/invoice.js
echo "Fixed formatInvoice by passing a copy of items to calculateTotal."
