// promptfoo custom provider: run a coding agent in a fresh, isolated copy of the project.
//
// For every call (= every test case / repeat):
//   1. copy the project to a new temp dir (excluding evals/, .git, node_modules), git-init it and
//      commit a baseline;
//   2. run the agent under test there with the prompt;
//   3. return the agent's final message as `output`, plus `metadata.workdir` / `metadata.baseCommit`
//      so assertions can grade the files the agent left behind.
//
// The agent is either another promptfoo provider (default: anthropic:claude-agent-sdk), with its
// `working_dir` pointed at the workspace, or an arbitrary shell command run inside the workspace.
// See ../README.md for the config options.
import { spawn } from 'node:child_process';
import { loadApiProvider } from 'promptfoo';
import { changedFiles, createWorkspace, DEFAULT_EXCLUDE, diffText } from '../lib/workspace.js';

const DEFAULT_AGENT = 'anthropic:claude-agent-sdk';

export default class IsolatedAgentProvider {
  constructor(options = {}) {
    this.config = options.config ?? {};
    this.label = options.label;
    if (this.config.command && this.config.agent) {
      throw new Error('isolated-agent: set either `command` or `agent`, not both');
    }
  }

  id() {
    return this.config.command ? `isolated-agent:command` : `isolated-agent:${this.config.agent ?? DEFAULT_AGENT}`;
  }

  async callApi(prompt, context) {
    const { workdir, baseCommit } = createWorkspace({ exclude: this.config.exclude ?? DEFAULT_EXCLUDE });
    const started = Date.now();
    let result;
    try {
      result = this.config.command
        ? await this.runCommand(prompt, workdir)
        : await this.runProvider(prompt, workdir, context);
    } catch (err) {
      result = { error: `agent threw: ${err?.stack ?? err}` };
    }
    let files = [];
    let diff = '';
    try {
      files = changedFiles(workdir, baseCommit);
      diff = diffText(workdir, baseCommit);
    } catch (err) {
      diff = `could not compute diff: ${err.message}`;
    }
    return {
      ...result,
      // promptfoo treats a missing output as an error; keep an empty string so assertions still run.
      output: result.output ?? '',
      metadata: {
        ...result.metadata,
        workdir,
        baseCommit,
        changedFiles: files,
        diff,
        agentDurationMs: Date.now() - started,
      },
    };
  }

  async runProvider(prompt, workdir, context) {
    const agentId = this.config.agent ?? DEFAULT_AGENT;
    const agentConfig = { ...(this.config.agentConfig ?? {}), working_dir: workdir };
    // copy_working_dir would make the inner provider refuse to run outside an eval step, and we
    // already provide isolation ourselves.
    delete agentConfig.copy_working_dir;
    const agent = await loadApiProvider(agentId, { options: { config: agentConfig } });
    const res = await agent.callApi(prompt, context);
    return { ...res, cached: false };
  }

  runCommand(prompt, workdir) {
    const timeoutMs = this.config.timeoutMs ?? 30 * 60 * 1000;
    return new Promise((resolve) => {
      const child = spawn('sh', ['-c', this.config.command], {
        cwd: workdir,
        env: { ...process.env, ...(this.config.env ?? {}), PROMPT: prompt, EVAL_WORKDIR: workdir },
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (d) => (stdout += d));
      child.stderr.on('data', (d) => (stderr += d));
      const timer = setTimeout(() => child.kill('SIGKILL'), timeoutMs);
      child.on('close', (code, signal) => {
        clearTimeout(timer);
        const metadata = { exitCode: code, signal, stderr: stderr.slice(-20_000) };
        if (code !== 0) {
          resolve({ output: stdout, error: `agent command exited with ${code ?? signal}: ${stderr.slice(-2000)}`, metadata });
        } else {
          resolve({ output: stdout, metadata });
        }
      });
    });
  }
}
