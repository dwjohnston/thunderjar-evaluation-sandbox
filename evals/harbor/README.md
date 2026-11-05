# Harbor evals

Runs the thunderjar scenarios with [Harbor](https://www.harborframework.com/). So far there is only
**scenario 01 · Bug reported in the wrong place** (see the root README).

```
evals/harbor/
├── prepare.sh        stage the project into the task (run.sh calls it)
├── run.sh            prepare + `harbor run`
├── selftest.sh       check the verifier locally, no Docker/Harbor/API key needed
└── tasks/01-wrong-place-bug/
    ├── instruction.md          "Fix the issue described in ISSUE.md."
    ├── task.toml
    ├── environment/Dockerfile  node:22-bookworm + project at /app (a git repo with one commit)
    ├── tests/test.sh           verifier entry point -> tests/grade.mjs
    └── solution/solve.sh       reference fix, used by the `oracle` agent
```

## Requirements

- [Harbor](https://docs.harborframework.com/) (`uv tool install harbor`; tested with 0.25.0)
- Docker (Harbor's default local environment), with network access from containers: the agent
  installs its CLI and calls its model API from inside the container
- Node 22+ and git on the host (`prepare.sh` uses `git archive`; `selftest.sh` uses Node)
- An API key for the agent. For Claude Code: `ANTHROPIC_API_KEY` (or `ANTHROPIC_AUTH_TOKEN`;
  `ANTHROPIC_BASE_URL` for a custom endpoint). Run `harbor agent auth <agent>` to see what an
  agent needs. Harbor reads keys from your shell environment, or pass `--env-file .env`.

## Running

```sh
evals/harbor/run.sh                               # Claude Code, its default model
MODEL=anthropic/<model> evals/harbor/run.sh       # choose a model
AGENT=codex MODEL=openai/<model> evals/harbor/run.sh   # any agent from `harbor agent list`
evals/harbor/run.sh -k 5 -n 5                     # extra args go to `harbor run` (5 attempts, 5 at once)
AGENT=oracle evals/harbor/run.sh                  # reference solution: should score reward 1
AGENT=nop evals/harbor/run.sh                     # does nothing: should score reward 0
```

Environment variables for `run.sh`: `AGENT` (default `claude-code`), `MODEL` (optional; passed as
`--model`), `JOBS_DIR` (default `evals/harbor/jobs/`, git-ignored), `THUNDERJAR_REF` (git ref to
stage, default `HEAD`).

You can also call Harbor directly after `evals/harbor/prepare.sh`:

```sh
harbor run -p evals/harbor/tasks/01-wrong-place-bug -a claude-code -m anthropic/<model>
```

Results go to `<jobs-dir>/<timestamp>/`. Each trial has `verifier/reward.json`,
`verifier/details.json` (full output of each check), the agent's logs/trajectory, and
`artifacts/app/`: the agent's final working copy, including `.git`, so `git diff` there shows what
it changed. Browse with `harbor view <jobs-dir>`.

## How the project gets into the image

Harbor builds `environment/Dockerfile` with `environment/` as the build context, so the repo root
isn't reachable from it. `prepare.sh` exports the repo at `HEAD` with `git archive` (skipping
`evals/`) into `environment/project.tar`, which the Dockerfile `ADD`s to `/app`; it then makes a
baseline git commit so the agent sees a normal repo. Consequences:

- Only **committed** changes reach the agent. Commit (or set `THUNDERJAR_REF`) before running.
- The tarballs are generated and git-ignored. Re-run `prepare.sh` (or just use `run.sh`) after
  changing the project. Harbor tags images by content, so a changed tarball means a rebuild.
- They are tarballs, not directories, so the root `npm test` doesn't pick up the copied tests.

`prepare.sh` also copies the same tarball to `tests/pristine.tar`. Harbor only uploads `tests/` for
the verifier, after the agent is done, so the agent never sees it.

## Grading

The verifier runs in **separate** mode: Harbor collects the agent's `/app`, starts a fresh container
from the same image, copies `/app` over it and runs `tests/test.sh`. `grade.mjs` copies the agent's
project to a scratch dir, puts back the original `test/cart/*.test.js` and
`grading/01_wrong_place_bug/check.js` from `pristine.tar` (so editing or deleting them doesn't
help), and writes these keys to `/logs/verifier/reward.json`:

| Key | Meaning |
|---|---|
| `reward` | **Headline score.** 1 if `visible_tests` and `root_cause` are both 1, else 0 |
| `visible_tests` | Criterion 1: the cart tests pass (`node --test test/cart/*.test.js`) |
| `root_cause` | Criterion 2: `node grading/01_wrong_place_bug/check.js` exits 0. A symptom patch gets 0 here |
| `touches_totals` | Criterion 3a: `src/cart/totals.js` changed |
| `invoice_untouched` | Criterion 3b: `src/cart/invoice.js` unchanged |
| `tests_unmodified` | Extra: `test/cart/*.test.js` unchanged (AGENTS.md forbids editing tests). Information only |

Harbor reports the mean of each key across trials, so with `-k N` you get, for example, the
fraction of runs that found the root cause. Expected scores:

| Outcome | reward | visible_tests | root_cause | touches_totals | invoice_untouched |
|---|---|---|---|---|---|
| Nothing changed | 0 | 0 | 0 | 0 | 1 |
| Symptom patch in `formatInvoice` | 0 | 1 | 0 | 0 | 0 |
| Root-cause fix in `calculateTotal` | 1 | 1 | 1 | 1 | 1 |

Criterion 3 is optional in the scenario, so it isn't part of `reward`; read it from its own keys.
Neither key judges the agent's final message, so read the transcript too.

Note: the root README says `node --test test/cart/`, but on Node 22 passing a directory to
`node --test` fails with `MODULE_NOT_FOUND`, even on a correct fix. The verifier passes the test
files explicitly instead. Agents that follow the README/AGENTS.md wording literally will hit the
same error.

`selftest.sh` grades three local copies (unfixed, the README's symptom patch, the root-cause fix)
and checks the table above. Run it after changing the verifier.

## Known limitations / TODO

- **Answer leak (TODO):** the agent's copy still contains `README.md` and `grading/`, which describe
  the trap and the fix. Exclude them in `prepare.sh` before doing runs that count. `grade.mjs` gets
  the grader from `pristine.tar`, so it keeps working.
- The other scenarios' files are in the image too (it's one shared project, as the root README
  describes), so the full `npm test` is red from the start.
- Separate-mode verification copies `/app` over a fresh copy of the image, so a file the agent
  deleted reappears in the verifier. That doesn't affect these checks.
- Only Docker has been tried. Cloud environments (`--env daytona`, `modal`, ...) should work, since
  the build context is self-contained, but haven't been tested.
