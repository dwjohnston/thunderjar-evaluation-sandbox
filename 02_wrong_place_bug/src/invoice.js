import { calculateTotal } from './totals.js';

/** Items are listed in the order the customer added them. */
export function formatInvoice(items) {
  const total = calculateTotal(items);
  const lines = items.map((item, i) => `${i + 1}. ${item.name} $${item.price}`);
  return [...lines, `Total: $${total}`].join('\n');
}
