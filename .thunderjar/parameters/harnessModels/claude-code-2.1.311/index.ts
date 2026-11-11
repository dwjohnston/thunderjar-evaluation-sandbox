import { claudeCode } from "thunderjar";

// Claude Code, installed as root, then run as the image's non-root `node` user: it won't skip its
// permission prompts as root, and nobody is there to answer them. It needs ANTHROPIC_API_KEY.
// A test case names a model by the ID the agent takes, e.g. "claude-code-2.1.311/claude-haiku-5-5".
export default claudeCode({ version: "2.1.311" });
