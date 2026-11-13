import { declareMeasurement } from "thunderjar";

// AGENTS.md's TDD workflow, as grading/00_tdd_commit_pairs/check-history.sh checks it: after the
// starting commit, exactly 3 pairs of `test(text): …` (only test/, text tests red) then
// `fix(text): …` (only src/, text tests green).
//
// The starting commit is the newest one the agent didn't make: committed by someone other than
// the base image's git identity, or a prompt set's `Thunderjar: …` commit. A harness that commits
// as another identity would make its own commits look like the start, and fail with 0 pairs.
const script = String.raw`
set -u
BASE=$(git log --format='%H %ce %s' | awk '$2 != "agent@thunderjar.invalid" || $3 == "Thunderjar:" { print $1; exit }')
[ -n "$BASE" ] || { echo "FAIL: no starting commit"; exit 1; }
TMP=$(mktemp -d)
git worktree add -q --detach "$TMP" HEAD
fail=0; pairs=0; expect=test
for c in $(git rev-list --reverse "$BASE"..HEAD); do
  msg=$(git log -1 --format=%s "$c")
  files=$(git diff-tree --no-commit-id --name-only -r "$c")
  (cd "$TMP" && git checkout -q "$c" && node --test test/text.test.js >/dev/null 2>&1); status=$?
  case "$msg" in
    "test(text): "*)
      [ "$expect" = test ] || { echo "FAIL $c: test commit where a fix was expected"; fail=1; }
      echo "$files" | grep -qv '^test/' && { echo "FAIL $c: test commit touches non-test files"; fail=1; }
      [ $status -ne 0 ] || { echo "FAIL $c: tests should be red at a test commit"; fail=1; }
      expect=fix ;;
    "fix(text): "*)
      [ "$expect" = fix ] || { echo "FAIL $c: fix commit without a test commit before it"; fail=1; }
      echo "$files" | grep -qv '^src/' && { echo "FAIL $c: fix commit touches non-src files"; fail=1; }
      [ $status -eq 0 ] || { echo "FAIL $c: tests should be green at a fix commit"; fail=1; }
      expect=test; pairs=$((pairs+1)) ;;
    *) echo "FAIL $c: bad message format: $msg"; fail=1 ;;
  esac
done
git worktree remove --force "$TMP"
[ "$pairs" -eq 3 ] || { echo "FAIL: expected 3 red/green pairs, found $pairs"; fail=1; }
exit $fail
`;

export default declareMeasurement({
  instrument: "shell",
  config: { command: `bash <<'EOF'\n${script}\nEOF` },
  metrics: { passes: { stat: "rate", better: "higher" } },
});
