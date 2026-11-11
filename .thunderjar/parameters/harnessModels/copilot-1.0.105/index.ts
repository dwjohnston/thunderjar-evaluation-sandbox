import { declareHarness } from "thunderjar";

// GitHub Copilot CLI, in BYOK mode on OpenRouter: setting COPILOT_PROVIDER_BASE_URL makes it skip
// GitHub auth and Copilot's model routing. It needs OPENROUTER_API_KEY.
// A test case names a model by its OpenRouter ID, e.g. "copilot-1.0.105/anthropic/claude-haiku-5.5".
// The part after the last "/" is also given as the well-known model ID, so Copilot applies its
// model-specific settings (tool support, token limits). Run `copilot help providers` for the details.
// Models come and go: check https://openrouter.ai/models for the current IDs.
export default declareHarness({
  version: "1.0.105",
  applyParameter: (_config, ctx) => `RUN npm install -g @github/copilot@${ctx.version}
RUN mkdir -p /thunderjar && chown -R node:node /workspace /thunderjar
USER node`,
  // The prompt is read from its file, so quotes and newlines reach the agent intact. Any turn after
  // the first continues the session.
  cli: (ctx) =>
    `COPILOT_PROVIDER_BASE_URL=https://openrouter.ai/api/v1 COPILOT_PROVIDER_API_KEY="$OPENROUTER_API_KEY"` +
    ` COPILOT_PROVIDER_MODEL_ID=${ctx.modelId.split("/").pop()}` +
    ` copilot -p "$(cat ${ctx.promptPath})" --model ${ctx.modelId} --allow-all-tools --no-color` +
    `${ctx.turn === 0 ? "" : " --continue"} > ${ctx.resultPath}`,
  // Thunderjar has no reader for this agent's output yet. To measure its reply, and its token
  // costs, read them from what `cli` wrote to its result path:
  // collectReply: (raw) => …,
  // collectTokenCosts: (raw, ctx) => ({ outcome: "collected", models: [{ model: ctx.modelId, … }] }),
  requiredEnv: ["OPENROUTER_API_KEY"],
});
