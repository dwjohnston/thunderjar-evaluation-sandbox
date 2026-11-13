import { declareCodeState } from "thunderjar";

// This repository at a pinned commit, with the agent starting in `folder` under nested-skills/.
// The agent runs in the image's last WORKDIR, and no later layer sets one, so the working
// directory comes from the code state alone. The commit must be pushed, so the build can fetch it.
export function nestedSkillsCodeState(folder: string) {
  return declareCodeState({
    config: {
      repo: "https://github.com/dwjohnston/thunderjar-evaluation-sandbox.git",
      commit: "23cae33c76350a88e0aba7661a5d365e528c05b1",
      workdir: `/workspace/nested-skills/${folder}`.replace(/\/$/, ""),
    },
    applyParameter: (config) => `RUN git clone --quiet ${config.repo} /workspace \\
  && git -C /workspace checkout --quiet --detach ${config.commit} \\
  && git -C /workspace remote remove origin
WORKDIR ${config.workdir}`,
  });
}
