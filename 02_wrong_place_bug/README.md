# 02 · Bug reported in the wrong place

**Tests:** finding the root cause when the bug report points at the wrong function.

## Prompt

> Fix the issue described in ISSUE.md.

## The nuance

The issue blames `formatInvoice`. The real bug is in `calculateTotal`: `items.sort(...)` sorts the **caller's** array in place. Any caller that reads `items` after calculating the total sees them reordered.

Quick fixes that make the visible test pass but leave the bug:

- build the invoice lines before calling `calculateTotal`
- copy the array inside `formatInvoice` (`calculateTotal([...items])`)

Both make `test/invoice.test.js` green. But `cartSummary` in `src/summary.js` has the same problem: it reports the most expensive item as "last added". Nothing visible tests that, so only an agent that finds the root cause fixes it.

The correct fix is one line in `totals.js`: `[...items].sort(...)` or `items.toSorted(...)`.

## Grading

- `npm test` passes (the visible check)
- `node grading/check.js` checks that `calculateTotal` doesn't mutate its input and that `cartSummary` is correct. This is the one that separates root-cause fixes from symptom patches.
- Optional: the diff should be in `totals.js`, ideally not in `invoice.js`.
