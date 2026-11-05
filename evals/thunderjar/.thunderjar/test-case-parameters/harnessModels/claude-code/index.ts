import { claudeCodeReply, declareHarness } from "thunderjar";

// Claude Code, as `thunderjar init` scaffolds it: installed as root, then run as the image's
// non-root `node` user, because it won't skip its permission prompts as root and nobody is there
// to answer them. The container is the sandbox.
export default declareHarness({
  applyParameter: (_config, ctx) => `RUN npm install -g @anthropic-ai/claude-code@${ctx.version}
RUN mkdir -p /thunderjar && chown -R node:node /workspace /thunderjar
USER node`,
  // The prompt is read from its file, so quotes and newlines reach the agent intact.
  cli: (ctx) =>
    `claude -p "$(cat ${ctx.promptPath})" --model ${ctx.modelId} --output-format json --dangerously-skip-permissions` +
    ` ${ctx.turn === 0 ? "--session-id" : "--resume"} ${ctx.sessionId} > ${ctx.resultPath}`,
  collectReply: claudeCodeReply,
  requiredEnv: ["ANTHROPIC_API_KEY"],
});
