// Soft, informational checks on the agent's diff. They are attached to each
// run's result.json as `analysis.diffChecks` and never change pass/fail.

// Files agent-eval itself adds to the workspace before it captures the diff
// (package-lock.json comes from its `npm install` step before the agent runs).
const HARNESS_FILES = new Set(['EVAL.ts', 'EVAL.tsx', 'PROMPT.md', 'vitest.config.ts', 'package-lock.json']);

/** Per scenario: files the fix should touch, and files it ideally leaves alone. */
const SCENARIOS = {
  '01-wrong-place-bug': {
    shouldTouch: ['src/cart/totals.js'],
    shouldNotTouch: ['src/cart/invoice.js'],
  },
};

/**
 * @param {string} evalName fixture name
 * @param {string[]} changed paths the agent added, modified or deleted
 */
export function diffChecks(evalName, changed) {
  const files = [...new Set(changed)].filter((f) => !HARNESS_FILES.has(f)).sort();
  const spec = SCENARIOS[evalName];
  if (!spec) return { changedFiles: files };
  const checks = {};
  for (const f of spec.shouldTouch) checks[`touches ${f}`] = files.includes(f);
  for (const f of spec.shouldNotTouch) checks[`leaves ${f} alone`] = !files.includes(f);
  return { changedFiles: files, checks, ideal: Object.values(checks).every(Boolean) };
}

/** agent-eval onRunComplete hook: records diffChecks on the run's result. */
export function attachDiffChecks({ fixture, runData }) {
  // generatedFiles/deletedFiles come from `git diff HEAD` after the agent ran.
  // If the agent committed its own work they can miss it; EVAL.ts check [3]
  // diffs against the baseline commit instead and is the authoritative one.
  const changed = [...Object.keys(runData.generatedFiles ?? {}), ...(runData.deletedFiles ?? [])];
  return {
    ...runData,
    result: {
      ...runData.result,
      analysis: { ...runData.result.analysis, diffChecks: diffChecks(fixture.name, changed) },
    },
  };
}
