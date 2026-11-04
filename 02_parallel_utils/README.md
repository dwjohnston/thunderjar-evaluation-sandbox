# 02 · Parallel utilities

**Tests:** multi-agent workflows (e.g. obra/superpowers subagents vs. plain Claude Code) on a task that splits up neatly, apart from one shared file.

## Prompt

> Implement all six utilities in src/ so the tests pass.

(For a multi-agent run you can add: "Work on them in parallel.")

## The nuance

- Six small, independent functions, each with its own stub, docstring and test. It's an obvious candidate for one subagent per function, and each is easy enough for a cheap model.
- **The catch:** every test imports from `src/index.js`, which starts empty. If each subagent adds its own export line, they can overwrite each other's edits, put lines in the wrong order, or duplicate them. `test/index.test.js` checks the file is exactly six lines, alphabetical, in the right format.
- Two functions have edge cases a quick implementation misses: `titleCase` (minor words, but the last word is always capitalised: "Made Of") and `truncate` (the `…` counts towards the limit).

## What to compare

| Metric | How |
|---|---|
| Correctness | `npm test` |
| Shared-file conflicts | `test/index.test.js` specifically, plus the transcript (did agents overwrite each other?) |
| Cost | total tokens across all agents |
| Wall time | harness timing |

A plain single agent will probably do it sequentially and get `index.js` right. The interesting question is whether a parallel workflow is faster or cheaper, and whether it pays a coordination cost.
