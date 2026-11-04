import { declarePromptSet } from "thunderjar";

// Claude Code reads CLAUDE.md, not AGENTS.md. This prompt set copies the scenario's AGENTS.md to
// CLAUDE.md, so you can measure whether Claude Code does better when it actually sees it.
// Committed, so the agent's own changes can still be told apart from it.
export default declarePromptSet({
  applyParameter: () => `RUN cd /workspace && cp AGENTS.md CLAUDE.md \\
 && git add -A && git commit --quiet -m "Thunderjar: apply promptSet"`,
});
