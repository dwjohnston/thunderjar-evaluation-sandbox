# Agent environment for scenario 01 ("Bug reported in the wrong place").
#
# Build context is this environment/ directory (Harbor's default). The project
# is staged as ./project.tar by evals/harbor/prepare.sh (or run.sh) before the
# build; it is git-ignored and not committed.
FROM node:22-bookworm

# node:22-bookworm already ships git, curl, bash and procps, which is all the
# project, the verifier and Harbor's claude-code installer need. No apt-get, so
# the build also works on hosts where containers have no outbound network.

WORKDIR /app
# ADD auto-extracts local tarballs.
ADD project.tar /app/

# Give the agent a normal-looking repo with one baseline commit, so `git diff`
# / `git status` work as they would in a real checkout.
RUN git init -q -b main \
 && git add -A \
 && git -c user.name=harbor -c user.email=harbor@localhost commit -q -m "baseline" \
 && git config --global --add safe.directory /app
