import { declareCodeState } from "thunderjar";

// The sandbox at a pinned commit. The scenario write-ups and graders give the answers away, so
// the graders move out of /workspace to /opt/grading (the measurements copy them back in), and
// README.md goes.
export default declareCodeState({
  config: {
    repo: "https://github.com/dwjohnston/thunderjar-evaluation-sandbox.git",
    commit: "24dc11c26e2716a12cf33b82fec895a7f02b3e8a",
  },
  applyParameter: (config) => `RUN git clone --quiet ${config.repo} /workspace \\
  && git -C /workspace checkout --quiet --detach ${config.commit} \\
  && git -C /workspace remote remove origin
RUN mv /workspace/grading /opt/grading \\
  && git -C /workspace rm --quiet -r README.md \\
  && git -C /workspace commit --quiet -m "Thunderjar: hide the answers"`,
});
