import type { ExperimentConfig } from '@vercel/agent-eval';

// Claude Code on two models, five runs each, in local Docker sandboxes.
const config: ExperimentConfig = {
  agent: 'claude-code',
  model: ['haiku', 'sonnet'],
  runs: 5,
  // Keep going after the first pass, so we get a pass rate rather than "passed at least once".
  earlyExit: false,
  timeout: 600,
  sandbox: 'docker',
  // Grade in a fresh sandbox that receives only the agent's file changes.
  verifier: 'separate',
  // Edits to the scenario's own tests are reported as tampering and not applied when grading.
  protectedPaths: ['test/**'],
  // Grade the LLM-judge assertion with one fixed model, so both models are judged the same way.
  judge: { model: 'sonnet' },
  copyFiles: 'changed',
};

export default config;
