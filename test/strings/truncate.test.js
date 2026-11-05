import { test } from 'node:test';
import assert from 'node:assert/strict';
import { truncate } from '../../src/strings/index.js';

test('truncate', () => {
  assert.equal(truncate('hello world', 5), 'hell…');
  assert.equal(truncate('hi', 5), 'hi');
  assert.equal(truncate('hello', 5), 'hello');
});
