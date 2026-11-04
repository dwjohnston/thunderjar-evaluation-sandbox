import { calculateTotal } from './totals.js';

/** One-line summary shown in the cart header. */
export function cartSummary(items) {
  const total = calculateTotal(items);
  const last = items[items.length - 1];
  return `${items.length} items, $${total} (last added: ${last.name})`;
}
