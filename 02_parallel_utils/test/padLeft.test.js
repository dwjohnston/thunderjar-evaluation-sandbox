import { test } from 'node:test';
import assert from 'node:assert/strict';
import { padLeft } from '../src/index.js';

test('padLeft', () => {
  assert.equal(padLeft('7', 3, '0'), '007');
  assert.equal(padLeft('ab', 4), '  ab');
  assert.equal(padLeft('abcdef', 3), 'abcdef');
});
