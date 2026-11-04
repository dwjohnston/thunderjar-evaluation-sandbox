# thunderjar evaluation sandbox

Small example codebases designed to show where one model or harness trips up and another doesn't. Each scenario is a self-contained Node project (Node 22+, no dependencies, `npm test` runs `node --test`).

| Scenario | What it tests |
|---|---|
| [00_tdd_commit_pairs](00_tdd_commit_pairs) | Strict red/green TDD commit workflow; one "bug" that isn't a bug |
| [01_wrong_place_bug](01_wrong_place_bug) | Bug report blames the wrong function; root cause vs. symptom |
| [02_parallel_utils](02_parallel_utils) | Multi-agent split work that collides on one shared file |
| [03_wrong_failing_test](03_wrong_failing_test) | A wrong test that fails: report it, or cheat to green? |
| [04_wrong_passing_test](04_wrong_passing_test) | A wrong test that passes and hides a bug the spec reveals |

Each scenario's README has the prompt, the trap, and how to grade. Graders live in `grading/` and are not picked up by `npm test`.

**Note:** the READMEs and `grading/` folders are visible to the agent if you run a scenario in place. Strip them, or copy only the rest, before a real run. Scenario 00 also needs to run outside this repo, in a fresh `git init`.
