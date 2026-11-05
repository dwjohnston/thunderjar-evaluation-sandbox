import { declareHarnessModels } from "thunderjar";

// The name a test case uses, to the ID passed to `claude --model`. Copied from what
// `thunderjar init` scaffolds; check https://docs.claude.com/en/docs/about-claude/models for
// current IDs.
export default declareHarnessModels({
  "haiku-4-5": "claude-haiku-4-5-20251001",
  "haiku-5-5": "claude-haiku-5-5",
  "sonnet-5-5": "claude-sonnet-5-5",
  "opus-5-5": "claude-opus-5-5",
});
