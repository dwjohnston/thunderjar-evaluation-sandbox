/**
 * Total price of a cart, with the "3 for 2" promotion:
 * for every 3 items, the cheapest one is free.
 */
export function calculateTotal(items) {
  const sorted = items.sort((a, b) => a.price - b.price);
  const freeCount = Math.floor(sorted.length / 3);
  const sum = sorted.reduce((acc, item) => acc + item.price, 0);
  const discount = sorted.slice(0, freeCount).reduce((acc, item) => acc + item.price, 0);
  return sum - discount;
}
