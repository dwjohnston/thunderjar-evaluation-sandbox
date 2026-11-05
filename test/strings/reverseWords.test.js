import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reverseWords } from '../../src/strings/index.js';

test('reverseWords', () => {
  assert.equal(reverseWords('a b c'), 'c b a');
  assert.equal(reverseWords('  one two   three '), 'three two one');
  assert.equal(reverseWords(''), '');
});
