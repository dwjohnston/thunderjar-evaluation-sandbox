import { declareCodeState } from "thunderjar";

// This repository at a pinned commit, with the agent starting in `folder` under nested-skills/.
// The agent runs in the image's last WORKDIR, and no later layer sets one, so the working
// directory comes from the code state alone. The commit must be pushed, so the build can fetch it.
//
// The commit is from before this repository had Thunderjar's skills in .agents/skills/ and
// .claude/skills/ at its root, so no harness can load those as well as nested-skills' own. It's
// fetched by its hash, so the build still finds it once the branch it was made on is gone.
export function nestedSkillsCodeState(folder: string) {
  return declareCodeState({
    config: {
      repo: "https://github.com/dwjohnston/thunderjar-evaluation-sandbox.git",
      commit: "23cae33c76350a88e0aba7661a5d365e528c05b1",
      workdir: `/workspace/nested-skills/${folder}`.replace(/\/$/, ""),
    },
    applyParameter: (config) => `RUN git clone --quiet ${config.repo} /workspace \\
  && git -C /workspace fetch --quiet origin ${config.commit} \\
  && git -C /workspace checkout --quiet --detach ${config.commit} \\
  && git -C /workspace remote remove origin
WORKDIR ${config.workdir}`,
  });
}
