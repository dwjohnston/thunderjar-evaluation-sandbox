import { declareCodeState } from "thunderjar";

// The project's repository, cloned into /workspace at a commit. The commit must be pushed, so the
// build can fetch it. Pin a commit, never a branch: the same text must always build the same thing.
export default declareCodeState({
  config: {
    repo: "https://github.com/dwjohnston/thunderjar-evaluation-sandbox.git",
    commit: "24dc11c26e2716a12cf33b82fec895a7f02b3e8a",
  },
  applyParameter: (config) => `RUN git clone --quiet ${config.repo} /workspace \\
  && git -C /workspace checkout --quiet --detach ${config.commit} \\
  && git -C /workspace remote remove origin`,
});
