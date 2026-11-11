import { declareHarness } from "thunderjar";

// OpenCode, on OpenRouter. OpenCode's built-in openrouter provider reads OPENROUTER_API_KEY itself.
// A test case names a model as "openrouter/" plus its OpenRouter ID, e.g. "opencode-1.19.5/openrouter/anthropic/claude-haiku-5.5".
// Models come and go: check https://openrouter.ai/models for the current IDs.
export default declareHarness({
  version: "1.19.5",
  applyParameter: (_config, ctx) => `RUN npm install -g opencode-ai@${ctx.version}
RUN mkdir -p /thunderjar && chown -R node:node /workspace /thunderjar
USER node`,
  // The prompt is read from its file, so quotes and newlines reach the agent intact. Any turn after
  // the first continues the session.
  cli: (ctx) =>
    `opencode run --model ${ctx.modelId} --format json${ctx.turn === 0 ? "" : " --continue"}` +
    ` "$(cat ${ctx.promptPath})" > ${ctx.resultPath}`,
  // Thunderjar has no reader for this agent's output yet. To measure its reply, and its token
  // costs, read them from what `cli` wrote to its result path:
  // collectReply: (raw) => …,
  // collectTokenCosts: (raw, ctx) => ({ outcome: "collected", models: [{ model: ctx.modelId, … }] }),
  requiredEnv: ["OPENROUTER_API_KEY"],
});
