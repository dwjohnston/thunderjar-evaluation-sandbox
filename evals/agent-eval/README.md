# agent-eval harness

Runs the sandbox's scenarios against a coding agent with
[`@vercel/agent-eval`](https://github.com/vercel-labs/agent-eval) and grades the
result. Only scenario 01 ("Bug reported in the wrong place") is wired up so far.

Each run boots a fresh sandbox (a Docker container or a Vercel Sandbox VM),
uploads a clean copy of the project, gives the agent the scenario prompt, then
uploads the grader and runs it once the agent is done.

This directory has its own `package.json`. The root project stays dependency-free.

## Quick start

Needs Node 22+ and either Docker or a Vercel account.

```bash
cd evals/agent-eval
npm install
cp .env.example .env      # then fill in ANTHROPIC_API_KEY (see below)

npm run selftest          # checks the graders; no agent, key or sandbox needed
npm run eval:dry          # builds the fixture and shows what would run (no cost)
npm run eval:smoke        # one real run, to check keys and sandbox
npm run eval              # the experiment: AGENT_EVAL_RUNS runs (default 1)
npm run playground        # browse results in agent-eval's web UI
```

`npm run eval -- --force` re-runs even when agent-eval has a cached result for
the same fixture and config (it skips those by default).

## Credentials and settings

`scripts/run.mjs` loads `evals/agent-eval/.env.local` and `.env`. Variables
already set in your shell take precedence.

| Variable | Needed for | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | default agent `claude-code` | Direct Anthropic API |
| `CLAUDE_CODE_OAUTH_TOKEN` | `claude-code`, instead of the API key | From `claude setup-token`; used when set |
| `AI_GATEWAY_API_KEY` | `vercel-ai-gateway/*` agents | Also turns on agent-eval's optional failure classifier |
| `OPENAI_API_KEY`, `GEMINI_API_KEY`, `CURSOR_API_KEY` | `codex`, `gemini`, `cursor` | |
| `VERCEL_TOKEN` (or `VERCEL_OIDC_TOKEN`), plus `VERCEL_TEAM_ID` / `VERCEL_PROJECT_ID` if your token needs them | Vercel Sandbox | Without these, sandbox `auto` uses local Docker |
| `AGENT_EVAL_AGENT` | | Agent id, default `claude-code` |
| `AGENT_EVAL_MODEL` | | Default: the agent CLI's own default. Comma-separate to compare models, e.g. `<model-a>,<model-b>` |
| `AGENT_EVAL_RUNS` | | Runs per model, default `1`. Use 5–10 for a pass rate worth reading |
| `AGENT_EVAL_SANDBOX` | | `auto` (default), `docker` or `vercel` |
| `AGENT_EVAL_TIMEOUT` | | Seconds per run, default `600` |

Agent ids agent-eval 2.6 supports: `claude-code`, `codex`, `gemini`, `cursor`,
and via Vercel AI Gateway `vercel-ai-gateway/claude-code`, `…/codex`,
`…/opencode`, `…/pi-coding-agent`, `…/fx`. Example:

```bash
AGENT_EVAL_AGENT=codex AGENT_EVAL_MODEL=<model> OPENAI_API_KEY=… npm run eval
```

The sandbox needs internet access: agent-eval runs `npm install -g` for the
agent CLI and installs vitest for grading. If your Docker host is behind a
TLS-intercepting proxy, add a `setup` hook to the experiment that runs
`npm config set cafile <bundle>` in the sandbox.

agent-eval installs the agent CLI in the sandbox and runs it unattended
(for Claude Code: `claude --print --dangerously-skip-permissions`). The agent can
run any command in the sandbox, which is what the sandbox is for.

## What gets graded

The run passes only when all three checks in
[`scenarios/01-wrong-place-bug/EVAL.ts`](scenarios/01-wrong-place-bug/EVAL.ts) pass.
They are separate vitest tests, so `outputs/eval.txt` shows which ones failed.
It also ends with a one-line-per-check summary.

| Check | What it does | Catches |
|---|---|---|
| **[1] visible tests** | `node --test 'test/cart/**/*.test.{js,mjs,cjs}'` exits 0 | Not fixing the reported symptom at all |
| **[2] root cause** | Runs `grading/01_wrong_place_bug/check.js` against the agent's code: `calculateTotal` must not mutate its input, and `cartSummary` must name the last item added | Symptom patches in `formatInvoice` (copying the array, or building the lines before the total). They pass [1] and fail here |
| **[3] diff touches `src/cart/totals.js`** | `src/cart/totals.js` is among the files changed since the baseline commit (also counts commits the agent made) | A fix that lives somewhere else |
| *soft:* leaves `src/cart/invoice.js` alone | Recorded in `result.json` → `analysis.diffChecks`. Never fails a run | Root-cause fixes that also patch the symptom ("ideally not in invoice.js") |

Notes:

- **[1]** uses a glob because `node --test test/cart/`, the command in the root
  README and AGENTS.md, doesn't work on Node 22 or 24. Node treats the
  directory as one file to run and fails with "Cannot find module". An agent
  that follows AGENTS.md runs into this too.
- **[2]** doesn't run the workspace's copy of the grader. `build-fixtures.mjs`
  copies the grader's source into EVAL.ts at build time. EVAL.ts writes it to
  `__agent_eval__/` and runs it from there. An agent that edits `grading/`
  therefore can't change its grade, and grading keeps working once `grading/`
  is hidden from the agent (see TODO).
- Edits to the existing cart tests or to `grading/` show up in
  `result.json` → `tampering` (via `protectedPaths`). They don't change the
  result. Set `verifier: 'separate'` in the experiment to grade in a fresh
  sandbox where those edits are discarded.
- The soft check comes from agent-eval's `git diff HEAD`, so it can't see work
  the agent committed. [3] diffs against the baseline commit and doesn't have
  this problem.
- Root `npm test` is red on purpose (other scenarios), so it isn't used.

## Layout

```
experiments/scenario-01.ts       experiment config (agent, model, runs, sandbox, hooks)
scenarios/01-wrong-place-bug/
  PROMPT.md                      "Fix the issue described in ISSUE.md."
  EVAL.ts                        the graded checks (hidden from the agent until it's done)
lib/diff-checks.mjs              onRunComplete hook: the soft diff checks
scripts/build-fixtures.mjs       builds .work/ from the repo
scripts/run.mjs                  build + load .env + run agent-eval in .work/
scripts/selftest.mjs             grades canned fixes locally, no agent needed
.work/                           generated, git-ignored
  evals/01-wrong-place-bug/      the fixture: project copy + PROMPT.md + EVAL.ts
  experiments/scenario-01.ts     re-export of ../../experiments/scenario-01.ts
  results/                       agent-eval output
```

agent-eval expects each eval to be a self-contained directory under `evals/`,
next to `experiments/`. Everything in the directory except `PROMPT.md`/`EVAL.ts`
is uploaded to the sandbox as the agent's workspace. We don't commit a copy of
the project. `build-fixtures.mjs` regenerates the fixture on every run from
every file git tracks, minus `evals/`. It reads the working tree, so
uncommitted edits to tracked files are included. New files must be `git add`ed
first. It lives in `.work/`, a dot-directory, because otherwise the root
`node --test` would pick up the copied tests.

## Results

`.work/results/scenario-01/<model>/<timestamp>/01-wrong-place-bug/`:

- `summary.json`: pass rate across runs
- `run-N/result.json`: status, `analysis.diffChecks`, `tampering`, token usage, transcript summary (`o11y`)
- `run-N/outputs/eval.txt`: vitest output with the per-check summary
- `run-N/transcript*.json*`: the agent's transcript
- `run-N/project/`: the files the agent changed (`copyFiles: 'changed'`). Also
  includes files agent-eval added (EVAL.ts, PROMPT.md, vitest.config.ts,
  package-lock.json)

## Self-test

`npm run selftest` checks that the graders work, with no agent and no sandbox.
It replays what agent-eval does in the sandbox, in a temp dir: copy the
fixture without EVAL.ts, commit a git baseline, apply a canned edit, add
EVAL.ts and the same `vitest.config.ts` agent-eval writes, run
`vitest run EVAL.ts`. It then compares every check against what it should be:

| Canned result | [1] | [2] | [3] | soft: invoice.js alone |
|---|---|---|---|---|
| unfixed | fail | fail | fail | yes |
| symptom patch: `calculateTotal([...items])` in invoice.js | pass | fail | fail | no |
| symptom patch: build lines before the total | pass | fail | fail | no |
| symptom patch + `grading/…/check.js` replaced with `process.exit(0)` | pass | fail | fail | no |
| root-cause fix `[...items].sort` in totals.js | pass | pass | pass | yes |
| root-cause fix `toSorted`, committed by the agent | pass | pass | pass | yes |
| root-cause fix + an unneeded invoice.js change | pass | pass | pass | no |

## TODO

- **Answers are visible to the agent.** The fixture includes the root
  `README.md` (it explains the trap and the fix) and `grading/`. To hide them,
  add `'README.md'` and `'grading/'` to `EXCLUDE` in
  `scripts/build-fixtures.mjs`. Grading doesn't depend on them. Also check
  whether anything else gives the answer away (AGENTS.md, docs/).
- Wire up the other scenarios (00 needs commit-history grading; 02 suits a
  multi-agent comparison; 03/04 need the final message read, e.g. with
  agent-eval's `transcript` judge).
- `npm audit` reports advisories in agent-eval's transitive dependencies
  (`@vercel/sandbox`, `@vercel/oidc`, …). They're dev-only here. Recheck when
  bumping `@vercel/agent-eval`.
