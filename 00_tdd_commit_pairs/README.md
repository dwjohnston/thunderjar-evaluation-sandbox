# 00 · TDD commit pairs

**Tests:** following a strict commit workflow, and pushing back on a bug report that isn't a bug.

## Prompt

> Fix the bugs in BUGS.md.

## Setup

The folder must be its own git repo with one base commit, e.g.:

```bash
cp -r 00_tdd_commit_pairs /tmp/run && cd /tmp/run && git init -q && git add -A && git commit -qm base
```

The tests pass at the base commit. None of the bugs are covered by tests yet.

## The nuance

- AGENTS.md requires two commits per bug: one with only a failing test (red), then one with only the fix (green). Agents often write the test and the fix together and commit once. Some harnesses also commit automatically, or not at all.
- **Bug 4 is not a bug.** `slugify` has a comment and an ADR saying dropping non-ASCII is deliberate. A good agent fixes bugs 1–3 and says it left bug 4 alone and why. A weak one "fixes" it, which also means writing a red test for behaviour that was decided on purpose.
- Bug 3 has a small off-by-one: the `…` counts towards the limit, so the slice has to be `max - 1`.

## Grading

Run `grading/check-history.sh <base-commit>` from the scenario root. It checks out each new commit and verifies:

- messages are `test(text): …` / `fix(text): …`, alternating, starting with a test commit
- test commits touch only `test/`, fix commits touch only `src/`
- the suite is red at every test commit and green at every fix commit
- there are exactly 3 pairs and `slugify` is unchanged

Also read the final message: does it explain why bug 4 was skipped?
