# Thunderjar

Runs [`01_wrong_place_bug`](../../01_wrong_place_bug) with [Thunderjar](https://github.com/dwjohnston/thunderjar) (`thunderjar@preview`, 0.1.3-preview-73f04c4). Scaffolded with `thunderjar init`, then adapted.

## How Thunderjar thinks about an eval

A **test case** is a matrix of parameters. Every combination is a **permutation**, built into its own Docker image and run a number of times (**iterations**). After each run, the container is committed to an image *before* anything is measured, so new measurements can be added later without rerunning the agent.

| Parameter | Here |
|---|---|
| **Base image** | `node22`: `node:22-bookworm` plus bun, which `templateTest` uses. |
| **Code state** | `wrong-place-bug`: this repo at the merge commit of the scenarios, narrowed to `01_wrong_place_bug` without its README or `grading/`. Git history is reset to one commit, because the old history still holds both. |
| **Prompt set** | `as-is` (nothing added) and `agents-md-as-claude-md` (copies AGENTS.md to CLAUDE.md, which Claude Code actually reads). |
| **Harness/model** | Claude Code on Haiku 5.5 and Sonnet 5.5; OpenCode on Haiku 5.5 (the same model, so only the harness differs) and DeepSeek v4.1 Flash (cheap). |
| **Task** | `wrong-place-bug`: one initial prompt ("Fix the issue described in ISSUE.md.") and its measurements. |

So the test case is `1/1/2/4/1` = **8 permutations × 3 iterations**.

## Measurements

Measurements are part of the task, not the test case, and aren't part of any image hash, so changing them doesn't invalidate past runs.

| Measurement | Instrument | What it tells you |
|---|---|---|
| `invoiceOrder` | `templateTest` on `src/invoice.js` | The visible bug is gone. A symptom patch also passes. |
| `rootCause` | `templateTest` on `src/totals.js` | `calculateTotal` no longer mutates its input, and `cartSummary` works. Only a real fix passes. |
| `mutatingSort` | `grep` | `items.sort(` is still in `totals.js` (1) or gone (0). |
| `symptomPatch` | `grep` | The array was copied inside `invoice.js` instead. |
| `explainsRootCause` | `replyMatches` | The final reply mentions mutation / in-place sorting. |

Thunderjar has no "pass/fail" for a run: each measurement is a number, aggregated across iterations (`rate`, `mean`, `max`, `sum`). The hidden grader is expressed as a `templateTest`, rendered into the container only at measurement time.

## Run it

Needs Docker, git (full history), and the API keys for the harnesses in the test case.

```bash
npm install
```

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

```bash
export OPENCODE_API_KEY=...
```

```bash
npm run generate
```

```bash
npm run plan
```

```bash
npm run run
```

Then `npx thunderjar executions` lists past executions, and `npx thunderjar show <execution>` shows a row per permutation with each measurement aggregated.

`thunderjar.config.ts` still has the placeholder image store from `init` (`ghcr.io/your-org/thunderjar-images`). Point it at a registry you can push to.

## What's been checked

- `thunderjar generate` writes the parameter names, and the `.thunderjar` folder typechecks.
- `thunderjar plan wrong-place-bug` resolves all 8 permutations with their hashes.
- `thunderjar build --dry-run` prints the expected Dockerfile: the checkout, then narrowing to the scenario, then installing the harness.
- I rendered both templates by hand and ran them with `bun test`, along with the two `grep` patterns, on simulated outcomes. A real fix passes everything. A symptom patch passes `invoiceOrder` only, with `mutatingSort` and `symptomPatch` both 1.
- **Not run:** `build` or `run`, because this environment has no Docker daemon.

## Notes from using the preview

- `templateTest` binds `{{defaultExport}}` to the subject's **only** export, and errors if there are several. That works here (`totals.js` and `invoice.js` each export one function), but it would break if an agent added a second export to either file.
- The test file is rendered next to the subject, so a template can import neighbours (`./summary.js`), which the root-cause check relies on.
- There's no generic "run this command" instrument. A check like "`npm test` passes" (`node:test`) has to be written as a bun `templateTest` instead.
- `init` writes `package.json` with the name `thunderjar` if the folder is called `thunderjar`, which clashes with the dependency. I renamed it to `eval-thunderjar`.
