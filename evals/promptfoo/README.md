# promptfoo

Runs [`01_wrong_place_bug`](../../01_wrong_place_bug) with [promptfoo](https://www.promptfoo.dev), comparing Claude Code (via the Claude Agent SDK) on two models.

## How promptfoo thinks about an eval

promptfoo started as a prompt-testing tool, and its model carries over to agents:

| promptfoo concept | Here |
|---|---|
| **Prompt** | `prompt.txt`: "Fix the issue described in ISSUE.md." |
| **Provider** | The harness + model. `anthropic:claude-agent-sdk` with `model: haiku` and `model: sonnet`. Add more providers to compare more pairs. |
| **Test** | One test case, with a list of assertions. |
| **Assertion** | A check on the result. Built-in ones (`llm-rubric`, `cost`) plus custom JavaScript. |

The agent's edits happen on disk, not in the reply, so the JavaScript assertions read the workspace through `context.providerResponse.metadata.workingDir` and `workspaceDiff`.

## Files

| File | Purpose |
|---|---|
| `promptfooconfig.yaml` | Prompt, providers, assertions |
| `prepare-workspace.mjs` | Copies the scenario into `workspace/` **without** its README and `grading/`, and commits it as a git repo |
| `assertions/visible-tests.cjs` | `npm test` passes |
| `assertions/root-cause.cjs` | Copies the hidden grader in **after** the agent finishes, then runs it |
| `assertions/fix-location.cjs` | The diff touches `src/totals.js` |

`copy_working_dir: true` gives every call its own clone of `workspace/`, so runs and repeats don't see each other's edits. promptfoo deletes each clone after its assertions run.

## Run it

```bash
npm install
```

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

```bash
npm run eval
```

```bash
npm run view
```

`npm run eval` rebuilds `workspace/` and then runs `promptfoo eval`. Add `-- --repeat 3` to measure variance across runs.

## Scoring

Each assertion is a named metric, so the results table shows them separately:

- `visible_tests`: what the agent can check itself. Both a symptom patch and a real fix pass this.
- `root_cause`: the hidden grader. Only a real fix passes.
- `fix_location` (weight 0.5): the change is in `totals.js`.
- `explains_root_cause` (weight 0.5): an LLM judge (Haiku) reads the final reply.
- `cost`: fails a call that costs over $1.

I checked the three JavaScript assertions offline against a simulated root-cause fix (all pass) and a simulated symptom patch (`visible_tests` passes, the other two fail). `promptfoo validate` accepts the config. There hasn't been a live run yet.

## Caveats

- **Not a sandbox.** The agent runs on your machine with `Bash` allowed. A workspace stops runs from interfering with each other, but the agent can still reach the rest of the file system.
- **AGENTS.md is not read.** Claude Code reads `CLAUDE.md`, not `AGENTS.md`, and promptfoo turns off settings discovery by default. This scenario's AGENTS.md only says "fix the root cause", so the effect is small, but it matters for scenarios that depend on AGENTS.md (00, 03, 04).
- **Responses are never cached** when a workspace is used, so every `eval` costs money.
- promptfoo also has Codex SDK and OpenCode SDK providers that support `copy_working_dir`, so cheaper agents can be added as extra providers.
