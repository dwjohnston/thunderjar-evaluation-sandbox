// Scenario 01 (bug reported in the wrong place) against one coding agent.
// Every knob can be overridden from the environment or evals/agent-eval/.env,
// so comparing agents or models needs no code change:
//
//   AGENT_EVAL_AGENT=codex AGENT_EVAL_MODEL=<model> npm run eval
import type { ExperimentConfig } from '@vercel/agent-eval';
import { attachDiffChecks } from '../lib/diff-checks.mjs';

const env = process.env;
const models = (env.AGENT_EVAL_MODEL ?? '').split(',').map((m) => m.trim()).filter(Boolean);

const config: ExperimentConfig = {
  // 'claude-code' talks to Anthropic directly (ANTHROPIC_API_KEY or
  // CLAUDE_CODE_OAUTH_TOKEN). See the README for the other agent ids.
  agent: env.AGENT_EVAL_AGENT || 'claude-code',
  // Omitted = the agent CLI's own default model.
  ...(models.length ? { model: models.length === 1 ? models[0] : models } : {}),
  evals: ['01-wrong-place-bug'],
  runs: Number(env.AGENT_EVAL_RUNS || 1),
  // Run every attempt so pass rates mean something.
  earlyExit: false,
  timeout: Number(env.AGENT_EVAL_TIMEOUT || 600),
  sandbox: (env.AGENT_EVAL_SANDBOX as ExperimentConfig['sandbox']) || 'auto',
  // EVAL.ts runs the checks. No npm `scripts`: the root `npm test` is red on
  // purpose because of the other scenarios.
  validation: 'vitest',
  // Save the files the agent changed under results/.../run-N/project/.
  copyFiles: 'changed',
  // The existing tests and graders must not change (AGENTS.md). Edits to them
  // are listed in result.tampering. Grading is unaffected either way: EVAL.ts
  // carries its own copy of the grader.
  protectedPaths: ['test/cart/invoice.test.js', 'test/cart/totals.test.js', 'grading/**'],
  // Soft check: did the diff stay out of src/cart/invoice.js?
  onRunComplete: attachDiffChecks,
};

export default config;
