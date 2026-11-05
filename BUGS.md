# Bug reports

1. **wordCount miscounts extra spaces.** `wordCount('hello   world')` returns 4. It should return 2.
2. **capitalize crashes on empty string.** `capitalize('')` throws a TypeError. It should return `''`.
3. **truncate goes over the limit.** `truncate('hello world', 5)` returns `'hello…'`, which is 6 characters. The result should be at most 5 characters including the `…`, i.e. `'hell…'`.
4. **slugify mangles accented words.** `slugify('Café au lait')` returns `'caf-au-lait'`. It should return `'cafe-au-lait'`.
