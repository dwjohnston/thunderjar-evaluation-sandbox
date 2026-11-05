# thunderjar eval: scenario 01

Runs scenario [01 · Bug reported in the wrong place](../../README.md#01--bug-reported-in-the-wrong-place) against a coding agent with [thunderjar](https://www.npmjs.com/package/thunderjar) (pinned to the preview build `0.1.3-preview-73f04c4`), and grades the result.

Everything lives in this folder. The root project stays dependency-free, and its `npm test` doesn't pick anything up from here.

## Requirements

- Docker, with a running daemon. Each run builds images and starts containers.
- Node 22+ and npm, to install thunderjar. Its CLI runs on Bun, which comes with it as an npm dependency.
- Network access from containers, to npm (image builds) and to the agent's API.
- `ANTHROPIC_API_KEY` for the default Claude Code agent. Thunderjar passes it only into the agent's container. Note that `plan` and `run --dry-run` also refuse to start without it, though they never use it. Any value works for those.
- Run from a git clone of this repo that has commit `24dc11c` (current `main`). Thunderjar copies the project out of git, not off disk.

## Running it

```sh
cd evals/thunderjar
npm install
npm run generate          # writes the parameter-name types; optional

npm run controls          # scripted "agents", no API key needed (see below)

export ANTHROPIC_API_KEY=...
npm run plan              # what would run
npm run dry-run           # the exact prompt and agent command, per iteration
npm run eval              # build images, run the agent 3 times, grade each run

npm run executions        # past runs
npx thunderjar show <execution-id>          # table of checks, per agent/model
npx thunderjar show <execution-id> 1-1      # one run: exit code, agent's reply, tokens, checks
```

Results go to `.thunderjar/.data/` (gitignored). Each run's finished workspace is kept as the Docker image `thunderjar-postrun:<execution>-<permutation>-<iteration>`, so you can look at what the agent did: `docker run --rm -it --entrypoint bash thunderjar-postrun:<...>`, then `git diff 24dc11c` in `/workspace`.

## What happens in a run

Thunderjar builds a "prerun" image per permutation, starts a new container from it for each iteration, and runs the agent there:

1. **Base image** `node22`: `node:22-bookworm`, plus bun, which thunderjar's `templateTest` instrument uses to run the checks.
2. **Code state** `main-24dc11c`: the repo at commit `24dc11c`, cloned into `/workspace` as a fresh git repo (detached HEAD, no remote). It also adds a probe file that the checks hang off, and a copy of the committed grader at `/opt/thunderjar-grading/`. Both are explained in [its declaration](.thunderjar/test-case-parameters/codeStates/main-24dc11c/index.ts).
3. **Prompt set** `none`: nothing extra. The agent gets the repo's own `AGENTS.md`.
4. **Harness** `claude-code`: installs `@anthropic-ai/claude-code`, then runs `claude -p "Fix the issue described in ISSUE.md." --dangerously-skip-permissions --output-format json` as a non-root user. The container is the sandbox. It times out after 20 minutes.

When the agent finishes, the container is committed to a "postrun" image. Each check then runs in a throwaway container from that image, so no check can affect another.

## The checks

Every check is a `templateTest`. Each records `{passed: 1, failed: 0}` when it passes and `{passed: 0, failed: 1}` when it fails. Across iterations, `sum` counts the runs that passed and `mean` gives the pass rate.

| Measurement | Criterion | Passes when |
|---|---|---|
| `cartTestsPass` | 1, required | The tests in `test/cart/` pass (and at least one runs). |
| `rootCauseGrader` | 2, required | `node grading/01_wrong_place_bug/check.js` exits 0. The committed grader is put back first, so editing `grading/` doesn't help. This is the check that tells a root-cause fix from a symptom patch. |
| `diffTouchesTotals` | 3, optional | `git diff --name-only 24dc11c` (committed and uncommitted changes) includes `src/cart/totals.js`. |
| `diffAvoidsInvoice` | 3, optional ("ideally") | That diff doesn't include `src/cart/invoice.js`. |
| `cartTestsUnchanged` | guard for 1 | `test/cart/invoice.test.js` and `test/cart/totals.test.js` are as committed. Deleting or weakening the failing test would otherwise pass check 1. |

A good run passes all five. The symptom patch the scenario is about passes `cartTestsPass` and fails `rootCauseGrader`.

**Check 1 deviates from the README.** `node --test test/cart/` fails on Node 22 whatever the code does. Node 22 treats the argument as a file or glob, not a folder to search, so it tries to load `test/cart` as a module. `cartTestsPass` runs `node --test "test/cart/**/*.{js,mjs,cjs}"` instead. The repo's `AGENTS.md` gives the same broken command to the agent, so expect agents to trip over it. That's worth fixing in the repo.

## Controls: checking the setup without an API key

`scenario-01-controls` swaps the agent for the `scripted` harness. Each "model" is a shell script in [`harnessModels/scripted/scripts/`](.thunderjar/test-case-parameters/harnessModels/scripted/scripts/) that makes a fixed change. `npm run controls` should give:

| Control | cartTestsPass | rootCauseGrader | diffTouchesTotals | diffAvoidsInvoice | cartTestsUnchanged |
|---|---|---|---|---|---|
| `noop` (no change) | fail | fail | fail | pass | pass |
| `symptom-patch` (copy in `formatInvoice`, committed) | pass | fail | fail | fail | pass |
| `root-cause-fix` (`[...items].sort`, uncommitted) | pass | pass | pass | pass | pass |
| `tamper` (deletes the test, stubs the grader) | pass | fail | fail | pass | fail |

## Using a different agent or model

- **Model:** pick another name from [`harnessModels/claude-code/models.ts`](.thunderjar/test-case-parameters/harnessModels/claude-code/models.ts) in [`test-cases/scenario-01.ts`](.thunderjar/test-cases/scenario-01.ts), e.g. `claude-code@2.1.311/opus-5-5`. To compare several, list them all: each entry is its own permutation.
- **Claude Code version:** add it to `harnessModels/claude-code/versions.ts`.
- **Another agent:** add a folder under `harnessModels/` with `index.ts`, `models.ts`, `versions.ts` and `collectTokenCosts.ts`. `npx thunderjar init` in an empty folder scaffolds starters for Copilot CLI, Codex and OpenCode to copy from.

## TODO / limitations

- **The answers leak.** `README.md` and `grading/` are in the agent's `/workspace`, as are the probe (`.thunderjar-probe/`, hidden from `git status`) and `/opt/thunderjar-grading/`. Before trusting results, strip `README.md` and `grading/` in the code state, and commit that so the diff checks still compare against the right base.
- The base commit is pinned to `24dc11c`. Moving it to a commit that contains `evals/` would show the agent these checks too.
- Only the end state is graded. Nothing yet checks whether the agent's reply mentions `cartSummary`, or whether it committed. `replyMatches` could cover the first.
- Not run against a real model while setting this up (no API key). The Claude Code image build, the container run and the grading were run end to end with an invalid key (the agent exits 1 with "Invalid API key"), and with the controls.
