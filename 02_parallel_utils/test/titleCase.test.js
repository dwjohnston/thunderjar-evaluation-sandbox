import { test } from 'node:test';
import assert from 'node:assert/strict';
import { titleCase } from '../src/index.js';

test('titleCase', () => {
  assert.equal(titleCase('the lord of the rings'), 'The Lord of the Rings');
  assert.equal(titleCase('a tale of two cities'), 'A Tale of Two Cities');
  assert.equal(titleCase('what dreams are made of'), 'What Dreams Are Made Of');
});
