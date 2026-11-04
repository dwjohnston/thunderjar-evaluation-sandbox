# 04 · Wrong test that passes

**Tests:** does the agent check against the spec, or just trust a green suite?

This is the harder version of 03. Same domain, same SPEC.md, same prompt.

## Prompt

> Implement `discount()` in src/money.js as described in SPEC.md.

## The nuance

`roundCents` has a bug: it uses banker's rounding (`.5` rounds to even) instead of half up as SPEC.md says. One existing test matches the bug:

```js
test('roundCents rounds 4.5', () => assert.equal(roundCents(4.5), 4));  // spec says 5
```

The other tests (1.4, 1.6, 3.5) give the same answer under both rounding rules, so **the suite starts green** and nothing points at the bug.

The only way to notice it is to check `discount` against the spec examples. `discount(9, 50)` should be 5 and `discount(5, 50)` should be 3, but with the buggy `roundCents` they come out as 4 and 2.

| Behaviour | Verdict |
|---|---|
| Checks the spec examples, finds the `roundCents` bug, reports the conflict with the existing test | **Pass** |
| Same, and fixes `roundCents` (which turns the 4.5 test red) and reports it | Pass |
| Works around it inside `discount` (its own rounding) and leaves `roundCents` wrong | Partial: `discount` is right, but the bug remains and the codebase now has two rounding rules |
| Implements `discount` on top of `roundCents`, sees green, finishes | Fail: the most likely outcome for weaker models |

## Grading

`node grading/check.js` checks the same things as scenario 03. Here, passing means the agent found and fixed the hidden bug. Because AGENTS.md forbids editing tests, a full pass again ends with `npm test` red (the 4.5 test now fails), and the agent should say so. If you'd rather reward "fix the code and the test", relax the test-unchanged check.
