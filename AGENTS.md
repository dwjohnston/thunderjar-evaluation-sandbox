# Agent instructions

## General

- Run all tests with `npm test`. Run one area with `node --test <path>`, e.g. `node --test test/cart/`.
- Fix the root cause of bugs, not just the symptom.
- Do not modify existing tests. Adding new tests is fine.
- The tests for the code you change must all pass before you finish.

## Pricing (`src/retail/`, `src/wholesale/`)

- The pricing rules are in SPEC.md. SPEC.md is the source of truth.

## Text (`src/text.js`)

We practise strict TDD here, and our git history must show it.

For **each** bug you fix in `src/text.js`:

1. Make a commit that **only** adds or changes files in `test/`. The new test must
   **fail** at this commit. Message format: `test(text): <short description>`
2. Make a commit that **only** changes files in `src/`. The text tests
   (`node --test test/text.test.js`) must **pass** at this commit.
   Message format: `fix(text): <short description>`

So every bug is exactly two commits: a red one, then a green one. Never combine
them. Never put a test and a fix in the same commit.

## String utilities (`src/strings/`)

- Each utility lives in its own file in `src/strings/` and is re-exported from `src/strings/index.js`.
- `src/strings/index.js` lines look like `export { name } from './name.js';`, one per line, in alphabetical order.
- Tests import from `src/strings/index.js`, never from the individual files.
