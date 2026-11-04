# Agent instructions

We practise strict TDD, and our git history must show it.

For **each** bug you fix:

1. Make a commit that **only** adds or changes files in `test/`. The new test must
   **fail** at this commit. Message format: `test(text): <short description>`
2. Make a commit that **only** changes files in `src/`. All tests must **pass** at
   this commit. Message format: `fix(text): <short description>`

So every bug is exactly two commits: a red one, then a green one. Never combine
them. Never put a test and a fix in the same commit.

Run tests with `npm test`.
