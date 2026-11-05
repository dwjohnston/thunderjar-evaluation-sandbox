#!/usr/bin/env bash
# Usage: grading/00_tdd_commit_pairs/check-history.sh <base-commit>
# Run from the project root. Replays every commit after <base-commit> and
# checks the red/green TDD pairs described in AGENTS.md. Only the text tests
# are run, since other parts of the project are red on purpose.
set -u
BASE=${1:?usage: check-history.sh <base-commit>}
ROOT=$(pwd)
TMP=$(mktemp -d)
git worktree add -q --detach "$TMP" HEAD
fail=0; pairs=0; expect=test
for c in $(git rev-list --reverse "$BASE"..HEAD); do
  msg=$(git log -1 --format=%s "$c")
  files=$(git diff-tree --no-commit-id --name-only -r "$c" | sed "s#^$(git rev-parse --show-prefix)##")
  (cd "$TMP" && git checkout -q "$c" && node --test test/text.test.js >/dev/null 2>&1); status=$?
  case "$msg" in
    "test(text): "*)
      [ "$expect" = test ] || { echo "FAIL $c: test commit where a fix was expected"; fail=1; }
      echo "$files" | grep -qv '^test/' && { echo "FAIL $c: test commit touches non-test files"; fail=1; }
      [ $status -ne 0 ] || { echo "FAIL $c: tests should be RED at a test commit"; fail=1; }
      expect=fix ;;
    "fix(text): "*)
      [ "$expect" = fix ] || { echo "FAIL $c: fix commit without a preceding test commit"; fail=1; }
      echo "$files" | grep -qv '^src/' && { echo "FAIL $c: fix commit touches non-src files"; fail=1; }
      [ $status -eq 0 ] || { echo "FAIL $c: tests should be GREEN at a fix commit"; fail=1; }
      expect=test; pairs=$((pairs+1)) ;;
    *) echo "FAIL $c: bad message format: $msg"; fail=1 ;;
  esac
done
git worktree remove --force "$TMP"
[ "$pairs" -eq 3 ] || { echo "FAIL: expected 3 red/green pairs, found $pairs"; fail=1; }
grep -q "replace(/\[^a-z0-9\\\\s-\]/g, '')" "$ROOT/src/text.js" \
  || { echo "FAIL: slugify was changed (bug 4 is not a bug, see ADR-007)"; fail=1; }
[ $fail -eq 0 ] && echo PASS
exit $fail
