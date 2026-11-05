// Pass if the scenario's hidden grader passes. The grader is copied into the
// workspace only now, after the agent has finished, so the agent never sees it.
const { cpSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const GRADER = path.resolve(__dirname, '../../../01_wrong_place_bug/grading');

module.exports = (output, context) => {
  const { workingDir } = context.providerResponse.metadata;
  cpSync(GRADER, path.join(workingDir, 'grading'), { recursive: true });
  const run = spawnSync('node', ['grading/check.js'], { cwd: workingDir, encoding: 'utf8' });
  const pass = run.status === 0;
  return {
    pass,
    score: pass ? 1 : 0,
    reason: (run.stdout + run.stderr).trim(),
  };
};
