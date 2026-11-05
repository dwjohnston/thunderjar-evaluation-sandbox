import { checkoutCommit, declareCodeState } from "thunderjar";

// The sandbox project as it is on main at 24dc11c, checked out into /workspace as a fresh git
// repository (detached HEAD, no remote). Every container run starts from its own copy of this image.
//
// It also leaves two things the measurements need, outside what the agent is likely to touch:
//
// - /workspace/.thunderjar-probe/baseCommit.js, exporting the base commit. Thunderjar's only
//   instrument that can run commands is templateTest, which renders its template beside a
//   "subject" file in /workspace that has exactly one export. This file is that subject, so the
//   checks don't break if the agent adds exports to src/. It's in .git/info/exclude, so it doesn't
//   show up in `git status`.
// - /opt/thunderjar-grading/: the scenario's grader as committed, so an agent that edits
//   grading/ can't change how it's graded.
//
// TODO: README.md and grading/ are in /workspace and give the answer away. Strip them (and commit)
// here before trusting the results.
export default declareCodeState({
  config: { commit: "24dc11c26e2716a12cf33b82fec895a7f02b3e8a" },
  applyParameter: (config, ctx) => `${checkoutCommit(ctx, config.commit)}
COPY ${ctx.git.show(config.commit, "grading/01_wrong_place_bug/check.js")} /opt/thunderjar-grading/01_wrong_place_bug/check.js
RUN mkdir -p .thunderjar-probe \\
  && echo 'export const baseCommit = "${config.commit}";' > .thunderjar-probe/baseCommit.js \\
  && echo '.thunderjar-probe/' >> .git/info/exclude`,
});
