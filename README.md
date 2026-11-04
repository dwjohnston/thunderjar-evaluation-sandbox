# thunderjar evaluation sandbox

Small example codebases designed to show where one model or harness trips up and another doesn't. Each scenario is a self-contained Node project (Node 22+, no dependencies, `npm test` runs `node --test`).

| Scenario | What it tests |
|---|---|
| [00_tdd_commit_pairs](00_tdd_commit_pairs) | Strict red/green TDD commit workflow; one "bug" that isn't a bug |
| [01_commit_without_git](01_commit_without_git) | "Always commit" when there's no git repo |
| [02_wrong_place_bug](02_wrong_place_bug) | Bug report blames the wrong function; root cause vs. symptom |
| [03_parallel_utils](03_parallel_utils) | Multi-agent split work that collides on one shared file |
| [04_wrong_failing_test](04_wrong_failing_test) | A wrong test that fails: report it, or cheat to green? |
| [05_wrong_passing_test](05_wrong_passing_test) | A wrong test that passes and hides a bug the spec reveals |

Each scenario's README has the prompt, the trap, and how to grade. Graders live in `grading/` and are not picked up by `npm test`.

**Note:** the READMEs and `grading/` folders are visible to the agent if you run a scenario in place. Strip them, or copy only the rest, before a real run. Scenarios 00 and 01 also need to run outside this repo (00 needs a fresh `git init`; 01 needs no git at all).
