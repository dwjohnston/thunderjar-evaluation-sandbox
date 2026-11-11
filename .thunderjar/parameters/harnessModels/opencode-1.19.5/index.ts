import { declareHarness, writeModel, writeRunScript } from "thunderjar";

// OpenCode, on OpenCode Zen. OPENCODE_API_KEY is an OpenCode Zen key.
// A test case names a model by the ID the agent takes, e.g. "opencode-1.19.5/opencode/claude-haiku-5-5".
export default declareHarness({
  version: "1.19.5",
  applyParameter: (_config, ctx) =>
    [
      `RUN npm install -g opencode-ai@${ctx.version}`,
      "RUN mkdir -p /thunderjar && chown -R node:node /workspace /thunderjar",
      writeModel(ctx.modelId),
      // The prompt and model are read from their files, so quotes and newlines reach the agent intact.
      writeRunScript(`opencode run --model "$(cat /thunderjar/model.txt)" --format json "$(cat /thunderjar/prompt.txt)" > /thunderjar/result.json`),
      "USER node",
    ].join("\n"),
  collectReply: openCodeReply,
  requiredEnv: ["OPENCODE_API_KEY"],
});

type OpenCodeEvent = { type?: unknown; part?: { type?: unknown; text?: unknown; messageID?: unknown } };

/**
 * The agent's final reply, from what `opencode run --format json` wrote: one JSON event per line.
 * Each finished text part is a `text` event, and each step of the agent loop is its own message,
 * so the reply is the text of the last message that has any, like Claude Code's `result`.
 */
export function openCodeReply(raw: string): string {
  const texts: { messageID: unknown; text: string }[] = [];
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    let event: OpenCodeEvent;
    try {
      event = JSON.parse(line);
    } catch {
      continue;
    }
    const part = event.part;
    if (event.type === "text" && typeof part?.text === "string") texts.push({ messageID: part.messageID, text: part.text });
  }
  const last = texts.at(-1);
  if (!last) throw new Error("OpenCode wrote no text events");
  return texts
    .filter((t) => t.messageID === last.messageID)
    .map((t) => t.text)
    .join("\n")
    .trim();
}
