// Pass if the agent's diff changes src/totals.js, where the bug is.
// workspaceDiff is the agent's changes against the base commit of the clone.
module.exports = (output, context) => {
  const diff = context.providerResponse.metadata.workspaceDiff ?? '';
  const files = [...diff.matchAll(/^\+\+\+ b\/(.+)$/gm)].map((m) => m[1]);
  const pass = files.includes('src/totals.js');
  return {
    pass,
    score: pass ? 1 : 0,
    reason: `Changed files: ${files.join(', ') || '(none)'}`,
  };
};
