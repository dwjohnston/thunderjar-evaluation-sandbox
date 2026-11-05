# promptfoo evals

Runs a sandbox scenario against a coding agent with [promptfoo](https://www.promptfoo.dev/) and grades what the agent leaves behind. So far only scenario **01 · Bug reported in the wrong place** is covered.

The tooling has its own `package.json`, so the root project stays dependency-free. Node 22.22 or newer is required (promptfoo needs it).

## Quick start

```sh
cd evals/promptfoo
npm install
npm run selftest                  # offline check of the harness, no API key needed
export ANTHROPIC_API_KEY=sk-...   # see "Credentials" below
npm run eval                      # promptfoo eval -c promptfooconfig.yaml --no-cache
npm run view                      # open the results in the promptfoo web UI
```

Extra promptfoo flags go after `--`, for example `npm run eval -- --repeat 5` or `npm run eval -- -o output/results.json`.

## How it works

```
promptfooconfig.yaml          prompt "{{task}}", the providers (agents under test), the extension hook
cases/01_wrong_place_bug.yaml the scenario: task text plus the three assertions
providers/isolated-agent.js   custom provider: makes the workspace, then runs the agent in it
assertions/scenario01.js      javascript assertions that grade the workspace
hooks/cleanup.js              afterAll hook that deletes the workspaces
lib/workspace.js              copy, git-baseline and diff helpers
promptfooconfig.selftest.yaml + selftest/ + scripts/selftest.js   offline harness test
```

For each test case and each repeat, `providers/isolated-agent.js` does the following:

1. It copies the project root to a new `$TMPDIR/thunderjar-eval-XXXXXX/` and leaves out `.git`, `evals/` and `node_modules`. It then runs `git init` there and commits the state as `Baseline`. The agent sees a normal single-commit repo with no remote and no path back to this checkout.
2. It runs the agent under test with that directory as its working directory and the scenario prompt (`Fix the issue described in ISSUE.md.`).
3. It returns the agent's final message as the output, with `metadata.workdir`, `metadata.baseCommit`, `metadata.changedFiles` and `metadata.diff`. The diff shows up in the promptfoo UI next to each result.

The assertions then run against that directory. When the eval finishes, `hooks/cleanup.js` deletes the workspaces. To keep them for inspection, set `THUNDERJAR_KEEP_WORKDIRS=1`; the paths are printed at the end.

promptfoo's agent providers have a built-in `copy_working_dir` option. It isn't used here for three reasons. It can't leave out `evals/`. It clones the current commit or refuses some layouts, such as a git worktree whose `.git` is a file. And a wrapper works for any agent, including plain CLI commands, with the same git baseline for diffing.

## Assertions (scenario 01)

Each assertion is a separate named metric, so the promptfoo UI shows a column for each.

| Metric | Criterion | Passes when |
|---|---|---|
| `cart_tests` | (1) the visible check | `node --test 'test/cart/**/*.test.js'` exits 0 in the workspace and at least one test ran. The README says `node --test test/cart/`, but Node 22 can't take a bare directory there, so the equivalent glob is used. |
| `root_cause` | (2) the hidden grader | `grading/01_wrong_place_bug/check.js` exits 0. This means `calculateTotal` doesn't mutate its input, `cartSummary` reports the right "last added" item, and the 3-for-2 promotion still works. This check separates a root-cause fix from a symptom patch. The grader is copied fresh from this repo into `<workspace>/.eval-grader/` before it runs, so the agent can't have edited it. |
| `diff_location` | (3) optional: where the fix went | Score 1 if the diff touches `src/cart/totals.js` and not `src/cart/invoice.js`, 0.5 if it touches both, 0 if `totals.js` is untouched. The reason lists the changed files and warns if any `test/` file was modified. It has `weight: 0`, so it is recorded as a score but never fails the test. Set `weight: 1` to make it count. |

A test case passes overall when `cart_tests` and `root_cause` both pass.

## Choosing the agent under test

The default provider is `anthropic:claude-agent-sdk` (Claude Code through the Claude Agent SDK). Anything under `agentConfig` is passed straight to that provider; the wrapper sets `working_dir` itself. The defaults are `permission_mode: acceptEdits`, `append_allowed_tools: [Write, Edit, MultiEdit, Bash]`, `max_turns: 60` and `max_budget_usd: 2`. Uncomment `model:` to pin a model. See the [provider docs](https://www.promptfoo.dev/docs/providers/claude-agent-sdk/) for the other options.

To compare agents, add more entries under `providers:`, each with its own `label`. `promptfooconfig.yaml` has commented examples of both kinds:

- **Another promptfoo agent provider:** `agent: openai:codex-sdk` plus its `agentConfig`. Any provider that accepts `working_dir` works. You also need to `npm install` its SDK here.
- **Any CLI agent:** `command: <shell command>`. The command runs with `sh -c` inside the workspace, with the prompt in `$PROMPT` and the workspace path in `$EVAL_WORKDIR`. stdout becomes the output, and a non-zero exit is reported as a provider error. `timeoutMs` defaults to 30 minutes, and `env` adds extra environment variables.

Set `exclude` (default `['.git', 'evals', 'node_modules']`) to change which top-level entries are left out of the copy.

## Credentials

| Agent | Needs |
|---|---|
| `anthropic:claude-agent-sdk` (default) | `ANTHROPIC_API_KEY`. Alternatively, set `apiKeyRequired: false` in `agentConfig` and use a logged-in Claude Code session, or set `CLAUDE_CODE_USE_BEDROCK=1` or `CLAUDE_CODE_USE_VERTEX=1` with the matching cloud credentials. |
| `openai:codex-sdk` | `npm install @openai/codex-sdk`, plus `OPENAI_API_KEY` or `CODEX_API_KEY` |
| `command:` agents | whatever that CLI needs |
| `npm run selftest` | nothing |

All assertions are deterministic scripts, so no grader model or key is needed. Set `PROMPTFOO_DISABLE_TELEMETRY=1` to turn off promptfoo's telemetry.

## Self-test

`npm run selftest` runs `promptfooconfig.selftest.yaml`. It uses the same provider wrapper, workspaces, test case and assertions as the real config, but the agents are four shell scripts in `selftest/agents/`. The script then checks each verdict:

| Fake agent | cart_tests | root_cause | diff_location | overall |
|---|---|---|---|---|
| `root-cause-fix` (`[...items].sort` in totals.js) | pass | pass | 1 | pass |
| `both-files` (that, plus a copy in invoice.js) | pass | pass | 0.5 | pass |
| `symptom-patch` (`calculateTotal([...items])` in invoice.js) | pass | **fail** | 0 | fail |
| `noop` | fail | fail | 0 | fail |

## Safety

A workspace keeps runs apart from each other and from this checkout's files, but it is **not a security sandbox**. With `Bash` allowed, the agent runs shell commands as your user. Use a container or VM, or the provider's `sandbox` option, if that matters to you.

## TODO

- **Answer leakage:** the workspace still contains `README.md` (it describes the trap and the fix) and `grading/`. Both should be left out before results mean anything; adding them to `exclude` is enough, because `root_cause` already takes its grader from this repo, not from the workspace. The other scenarios' files are visible too, which the root README calls out as intended.
- Add the other scenarios (00 needs git-history grading against `metadata.baseCommit`; 03/04 also want an LLM-rubric check on the final message).
- Claude Code reads `CLAUDE.md`, not `AGENTS.md`, so by default it only sees AGENTS.md if it opens the file itself. Decide whether to add a `CLAUDE.md` pointer in the workspace, or set `setting_sources`, to make agents comparable.
