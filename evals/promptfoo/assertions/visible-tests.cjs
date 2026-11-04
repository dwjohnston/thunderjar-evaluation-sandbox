// Pass if the scenario's own test suite (`npm test`) passes in the agent's workspace.
const { spawnSync } = require('node:child_process');

module.exports = (output, context) => {
  const { workingDir } = context.providerResponse.metadata;
  const run = spawnSync('npm', ['test', '--silent'], { cwd: workingDir, encoding: 'utf8' });
  const pass = run.status === 0;
  return {
    pass,
    score: pass ? 1 : 0,
    reason: pass ? 'npm test passes' : `npm test fails:\n${(run.stdout + run.stderr).slice(-2000)}`,
  };
};
