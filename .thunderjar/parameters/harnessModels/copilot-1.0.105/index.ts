import { declareHarness, writeModel, writeRunScript } from "thunderjar";

// GitHub Copilot CLI. COPILOT_GITHUB_TOKEN is a GitHub token with Copilot access: a fine-grained
// personal access token with the "Copilot Requests" permission.
// A test case names a model by the ID the agent takes, e.g. "copilot-1.0.105/claude-haiku-5.5".
export default declareHarness({
  version: "1.0.105",
  applyParameter: (_config, ctx) =>
    [
      `RUN npm install -g @github/copilot@${ctx.version}`,
      "RUN mkdir -p /thunderjar && chown -R node:node /workspace /thunderjar",
      writeModel(ctx.modelId),
      // The prompt and model are read from their files, so quotes and newlines reach the agent intact.
      // `--silent` prints only the agent's response, without tool calls or usage stats.
      writeRunScript(`copilot -p "$(cat /thunderjar/prompt.txt)" --model "$(cat /thunderjar/model.txt)" --allow-all-tools --no-color --silent > /thunderjar/result.json`),
      "USER node",
    ].join("\n"),
  // With `--silent`, the result file is the agent's response as plain text. If the agent writes
  // more than one message, they're all in it, not only the last.
  collectReply: (raw) => {
    const reply = raw.trim();
    if (!reply) throw new Error("Copilot printed no response");
    return reply;
  },
  requiredEnv: ["COPILOT_GITHUB_TOKEN"],
});
