import type { ExperimentConfig } from '@vercel/agent-eval';

// OpenCode through the Vercel AI Gateway (needs AI_GATEWAY_API_KEY), for a cheaper comparison.
const config: ExperimentConfig = {
  agent: 'vercel-ai-gateway/opencode',
  model: 'deepseek/deepseek-v4-pro',
  runs: 5,
  earlyExit: false,
  timeout: 600,
  sandbox: 'docker',
  verifier: 'separate',
  protectedPaths: ['test/**'],
  // Judge with Claude so the score is comparable with experiments/claude-code.ts.
  judge: { agent: 'vercel-ai-gateway/claude-code', model: 'sonnet' },
  copyFiles: 'changed',
};

export default config;
