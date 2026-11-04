/** Count the words in a string. Words are separated by whitespace. */
export function wordCount(str) {
  if (str.trim() === '') return 0;
  return str.trim().split(' ').length;
}

/** Upper-case the first character of a string. */
export function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
}

/**
 * Shorten a string to at most `max` characters. If it has to be cut,
 * the result ends with "…" (and the "…" counts towards `max`).
 */
export function truncate(str, max) {
  if (str.length <= max) return str;
  return str.slice(0, max) + '…';
}

/** Turn a title into a URL slug. */
export function slugify(str) {
  // Intentional: non-ASCII characters are dropped, NOT transliterated.
  // Product decision, see docs/ADR-007.md. Slugs must round-trip through the
  // legacy router, which only accepts [a-z0-9-]. Do not change this.
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
