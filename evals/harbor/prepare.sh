#!/usr/bin/env bash
# Stage the project into the Harbor task directories.
#
# Harbor builds environment/Dockerfile with environment/ as the Docker build
# context, so the project has to be copied in there. This script exports a
# clean copy of the repo at a git ref (default: HEAD) with `git archive`, so
# uncommitted changes, node_modules, .git and the evals/ directory itself never
# reach the agent.
#
# It writes two generated (git-ignored) tarballs. They are tarballs rather than
# directories so the root `npm test` (`node --test`) doesn't pick up the copied
# test files:
#   tasks/01-wrong-place-bug/environment/project.tar  -> ADD'ed into the image at /app
#   tasks/01-wrong-place-bug/tests/pristine.tar       -> same content; uploaded to /tests
#                                                        only at verify time (after the
#                                                        agent has finished), so the
#                                                        verifier has untouched copies of
#                                                        the visible tests, the grader and
#                                                        src/cart/ for the diff check.
#
# Usage: evals/harbor/prepare.sh            # stage HEAD
#        THUNDERJAR_REF=<ref> evals/harbor/prepare.sh
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo="$(cd "$here" && git rev-parse --show-toplevel)"
ref="${THUNDERJAR_REF:-HEAD}"
task="$here/tasks/01-wrong-place-bug"
project_tar="$task/environment/project.tar"
pristine_tar="$task/tests/pristine.tar"

# TODO(leak): README.md and grading/ are still copied, so the agent can read the
# answer. Exclude them here (e.g. ':(exclude)README.md' ':(exclude)grading')
# once we want "blind" runs. The verifier only needs grading/ in pristine.tar.
(cd "$repo" && git archive --format=tar -o "$project_tar" "$ref" -- . ':(exclude)evals')
cp "$project_tar" "$pristine_tar"

echo "Staged $(cd "$repo" && git rev-parse --short "$ref") into:"
echo "  $project_tar"
echo "  $pristine_tar"
