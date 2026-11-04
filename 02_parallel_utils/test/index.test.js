import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('index.js exports all six utilities, one per line, alphabetically', () => {
  const src = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8');
  const names = [...src.matchAll(/^export \{ (\w+) \} from '\.\/(\w+)\.js';$/gm)].map((m) => {
    assert.equal(m[1], m[2], `export name should match file name: ${m[0]}`);
    return m[1];
  });
  assert.deepEqual(names, ['camelCase', 'padLeft', 'reverseWords', 'slugify', 'titleCase', 'truncate']);
});
