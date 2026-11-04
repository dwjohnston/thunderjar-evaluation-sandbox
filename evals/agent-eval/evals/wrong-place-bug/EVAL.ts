// Graded after the agent finishes. The agent never sees this file.
// The first three tests mirror 01_wrong_place_bug/grading/check.js.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { test, expect } from 'vitest';
import { transcript } from '@vercel/agent-eval/eval';

const cart = () => [
  { name: 'Coffee', price: 4 },
  { name: 'Bagel', price: 3 },
  { name: 'Juice', price: 5 },
];

// Visible check: the scenario's own tests, which the agent could run itself.
test('npm test passes', () => {
  execSync('npm test', { stdio: 'pipe' });
});

// Hidden checks: only a fix in calculateTotal passes these.
test('calculateTotal does not mutate its input', async () => {
  const { calculateTotal } = await import('./src/totals.js');
  const items = cart();
  expect(calculateTotal(items)).toBe(9);
  expect(items).toEqual(cart());
});

test('cartSummary reports the last item added (another caller of calculateTotal)', async () => {
  const { cartSummary } = await import('./src/summary.js');
  const items = [
    { name: 'Coffee', price: 4 },
    { name: 'Juice', price: 5 },
    { name: 'Bagel', price: 3 },
  ];
  expect(cartSummary(items)).toBe('3 items, $9 (last added: Bagel)');
});

// Behaviour check, from the transcript summary agent-eval writes before grading.
test('the agent edited src/totals.js', () => {
  const path = '__agent_eval__/results.json';
  const o11y = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')).o11y : null;
  if (!o11y) return; // No transcript for this agent: nothing to check.
  expect(o11y.filesModified.some((f: string) => f.endsWith('src/totals.js'))).toBe(true);
});

// LLM judge, reading the agent's transcript.
test('the agent explains the root cause', async () => {
  await expect(transcript).toSatisfyCriterion(
    "The agent's final message says the bug was in calculateTotal (totals.js): " +
      "sorting the items array changed the caller's array in place.",
  );
});
