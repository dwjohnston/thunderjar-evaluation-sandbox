# Fake agent: root-cause fix, plus an unnecessary defensive change in invoice.js.
set -e
sh "$SELFTEST_AGENTS/root-cause-fix.sh"
sh "$SELFTEST_AGENTS/symptom-patch.sh"
