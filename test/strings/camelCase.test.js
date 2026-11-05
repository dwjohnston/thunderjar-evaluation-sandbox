import { test } from 'node:test';
import assert from 'node:assert/strict';
import { camelCase } from '../../src/strings/index.js';

test('camelCase', () => {
  assert.equal(camelCase('hello world-foo_bar'), 'helloWorldFooBar');
  assert.equal(camelCase('Already'), 'already');
  assert.equal(camelCase('a  b'), 'aB');
});
