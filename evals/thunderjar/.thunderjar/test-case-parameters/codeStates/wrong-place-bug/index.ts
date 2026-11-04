import { checkoutCommit, declareCodeState } from "thunderjar";

// Checks this repository out at `commit`, then narrows /workspace down to one scenario.
//
// The scenario's README.md (which explains the trap) and grading/ folder are removed, and the
// git history is replaced with a single commit, because the old history still contains both.
export default declareCodeState({
  config: {
    // main, after the scenarios were merged (dwjohnston/thunderjar-evaluation-sandbox#1).
    commit: "e5893f3aa9491b081f4938a174866dc28c23fa77",
    scenario: "01_wrong_place_bug",
  },
  applyParameter: (config, ctx) => `${checkoutCommit(ctx, config.commit)}
RUN set -e; cd /workspace \\
 && mv ${config.scenario} /tmp/scenario \\
 && rm -rf /tmp/scenario/README.md /tmp/scenario/grading \\
 && find . -mindepth 1 -maxdepth 1 -exec rm -rf {} + \\
 && cp -a /tmp/scenario/. . && rm -rf /tmp/scenario \\
 && git init --quiet \\
 && git config user.name "Thunderjar agent" \\
 && git config user.email agent@thunderjar.invalid \\
 && git add -A && git commit --quiet -m "${config.scenario}"`,
});
