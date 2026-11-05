import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wordCount, capitalize, truncate, slugify } from '../src/text.js';

test('wordCount counts simple words', () => {
  assert.equal(wordCount('hello world'), 2);
});

test('capitalize upper-cases the first letter', () => {
  assert.equal(capitalize('hello'), 'Hello');
});

test('truncate leaves short strings alone', () => {
  assert.equal(truncate('hi', 5), 'hi');
});

test('slugify lower-cases and hyphenates', () => {
  assert.equal(slugify('Hello World'), 'hello-world');
});
