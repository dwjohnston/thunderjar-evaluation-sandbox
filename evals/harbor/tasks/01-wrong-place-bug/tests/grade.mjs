// Verifier for scenario 01. Run by test.sh after the agent has finished.
//
// Grades a copy of the agent's project, with the visible tests and the grader
// replaced by pristine copies, so editing or deleting them can't game the score.
//
// Writes:
//   $OUT_DIR/reward.json   flat {name: number} map that Harbor reads
//   $OUT_DIR/details.json  per-check output, for humans
//
// Env (defaults are the in-container paths):
//   PROJECT_DIR   agent's working copy               (/app)
//   PRISTINE_DIR  extracted tests/pristine.tar      (required)
//   OUT_DIR       Harbor verifier log dir           (/logs/verifier)
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const PROJECT_DIR = process.env.PROJECT_DIR ?? '/app';
const PRISTINE_DIR = process.env.PRISTINE_DIR;
const OUT_DIR = process.env.OUT_DIR ?? '/logs/verifier';

const VISIBLE_TESTS = ['test/cart/invoice.test.js', 'test/cart/totals.test.js'];
const GRADER = 'grading/01_wrong_place_bug/check.js';

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p) : null);
const sameFile = (rel) => {
  const a = read(path.join(PROJECT_DIR, rel));
  const b = read(path.join(PRISTINE_DIR, rel));
  return a !== null && b !== null && a.equals(b);
};
const run = (args, cwd) => {
  const r = spawnSync(process.execPath, args, { cwd, encoding: 'utf8', timeout: 120_000 });
  return {
    command: ['node', ...args].join(' '),
    exitCode: r.status,
    signal: r.signal,
    output: `${r.stdout ?? ''}${r.stderr ?? ''}${r.error ? String(r.error) : ''}`.slice(-20_000),
  };
};

if (!PRISTINE_DIR || !fs.existsSync(path.join(PRISTINE_DIR, GRADER))) {
  throw new Error(`pristine files missing under ${PRISTINE_DIR}; did you run evals/harbor/prepare.sh?`);
}

// 1. Copy the agent's project to a scratch dir and restore the pristine tests + grader.
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'thunderjar-grade-'));
fs.cpSync(PROJECT_DIR, work, {
  recursive: true,
  filter: (src) => !['.git', 'node_modules'].includes(path.basename(src)),
});
for (const rel of [...VISIBLE_TESTS, GRADER]) {
  fs.mkdirSync(path.dirname(path.join(work, rel)), { recursive: true });
  fs.copyFileSync(path.join(PRISTINE_DIR, rel), path.join(work, rel));
}

// 2. Run the checks.
// README/AGENTS.md say `node --test test/cart/`, but Node 22 treats that
// argument as a file path and fails with MODULE_NOT_FOUND. Pass the test files
// explicitly instead (same effect as `node --test test/cart/*.test.js`).
const cartTests = fs
  .readdirSync(path.join(work, 'test/cart'))
  .filter((f) => /\.test\.[cm]?js$/.test(f))
  .sort()
  .map((f) => `test/cart/${f}`);
const visible = run(['--test', ...cartTests], work);
const rootCause = run([GRADER], work);

const checks = {
  // (1) the cart tests pass (with the original test files restored).
  visible_tests: visible.exitCode === 0 ? 1 : 0,
  // (2) grading/01_wrong_place_bug/check.js exits 0: calculateTotal no longer
  //     mutates its input and cartSummary is right. Root cause vs. symptom.
  root_cause: rootCause.exitCode === 0 ? 1 : 0,
  // (3a) the diff touches src/cart/totals.js (where the bug is).
  touches_totals: sameFile('src/cart/totals.js') ? 0 : 1,
  // (3b) the diff leaves src/cart/invoice.js alone (where the issue points).
  invoice_untouched: sameFile('src/cart/invoice.js') ? 1 : 0,
  // Informational: AGENTS.md says not to modify existing tests.
  tests_unmodified: VISIBLE_TESTS.every(sameFile) ? 1 : 0,
};

// Headline reward (Harbor's "reward" key): pass only if both hard criteria pass.
const reward = checks.visible_tests && checks.root_cause ? 1 : 0;
const rewards = { reward, ...checks };

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'reward.json'), JSON.stringify(rewards, null, 2) + '\n');
fs.writeFileSync(
  path.join(OUT_DIR, 'details.json'),
  JSON.stringify({ rewards, visible_tests: visible, root_cause: rootCause }, null, 2) + '\n',
);
fs.rmSync(work, { recursive: true, force: true });

console.log(`--- ${visible.command} ---\n` + visible.output);
console.log(`--- node ${GRADER} ---\n` + rootCause.output);
console.log('--- rewards ---\n' + JSON.stringify(rewards, null, 2));
