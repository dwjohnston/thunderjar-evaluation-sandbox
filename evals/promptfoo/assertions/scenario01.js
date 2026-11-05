// promptfoo `javascript` assertions for scenario 01 (bug reported in the wrong place).
// Each export grades the workspace the isolated-agent provider left behind
// (context.providerResponse.metadata.workdir).
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { changedFiles, GRADER_DIR, PROJECT_ROOT } from '../lib/workspace.js';

function workspaceOf(context) {
  const meta = context.providerResponse?.metadata ?? context.metadata ?? {};
  if (!meta.workdir || !fs.existsSync(meta.workdir)) {
    throw new Error('no workspace in provider metadata; use the isolated-agent provider');
  }
  return meta;
}

function run(cwd, cmd, args) {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', timeout: 120_000 });
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`.trim();
  return { ok: r.status === 0, status: r.status ?? r.signal, out: out.slice(-4000) };
}

/**
 * Criterion 1: the visible cart tests pass (the README's `node --test test/cart/`).
 * Node 22's test runner doesn't accept a bare directory argument (it tries to load it as a
 * module), so we pass the equivalent glob, which node expands itself.
 */
const CART_TESTS = 'test/cart/**/*.test.js';
export function cartTests(output, context) {
  const { workdir } = workspaceOf(context);
  const r = run(workdir, process.execPath, ['--test', CART_TESTS]);
  const summary = (r.out.match(/^# (tests|pass|fail) \d+$/gm) ?? []).join(', ');
  // Guard against "green" because the agent deleted every test.
  const ran = Number(r.out.match(/^# tests (\d+)$/m)?.[1] ?? 0);
  if (r.ok && ran === 0) return { pass: false, score: 0, reason: `no cart tests ran (${summary})` };
  return {
    pass: r.ok,
    score: r.ok ? 1 : 0,
    reason: r.ok
      ? `node --test '${CART_TESTS}' passed (${summary})`
      : `node --test '${CART_TESTS}' failed (exit ${r.status}; ${summary}):\n${r.out}`,
  };
}

/**
 * Criterion 2: the hidden grader passes (calculateTotal doesn't mutate its input, cartSummary is
 * correct). A pristine copy of grading/01_wrong_place_bug/check.js is taken from the real repo
 * and placed at the same depth inside the workspace, so the agent can't influence it (and so
 * grading/ can later be removed from the agent's copy without changing this assertion).
 */
export function rootCauseGrader(output, context) {
  const { workdir } = workspaceOf(context);
  const graderDir = path.join(workdir, GRADER_DIR, '01_wrong_place_bug');
  fs.mkdirSync(graderDir, { recursive: true });
  fs.copyFileSync(path.join(PROJECT_ROOT, 'grading/01_wrong_place_bug/check.js'), path.join(graderDir, 'check.js'));
  const r = run(workdir, process.execPath, [path.join(GRADER_DIR, '01_wrong_place_bug/check.js')]);
  return {
    pass: r.ok,
    score: r.ok ? 1 : 0,
    reason: `grading/01_wrong_place_bug/check.js ${r.ok ? 'passed' : `failed (exit ${r.status})`}:\n${r.out}`,
  };
}

/**
 * Criterion 3 (optional): where the fix landed. Score 1 if the diff touches src/cart/totals.js
 * and not src/cart/invoice.js, 0.5 if it touches both, 0 if it doesn't touch totals.js.
 * Use with `weight: 0` in the config to record it as a metric without failing the test.
 */
export function diffLocation(output, context) {
  const { workdir, baseCommit } = workspaceOf(context);
  const files = changedFiles(workdir, baseCommit);
  const totals = files.includes('src/cart/totals.js');
  const invoice = files.includes('src/cart/invoice.js');
  const tests = files.filter((f) => f.startsWith('test/'));
  const score = totals ? (invoice ? 0.5 : 1) : 0;
  const notes = [
    `changed: ${files.length ? files.join(', ') : '(nothing)'}`,
    totals ? 'touches src/cart/totals.js' : 'does NOT touch src/cart/totals.js',
    invoice ? 'also touches src/cart/invoice.js' : 'leaves src/cart/invoice.js alone',
  ];
  if (tests.length) notes.push(`WARNING: modified tests (${tests.join(', ')}), which AGENTS.md forbids`);
  return { pass: totals, score, reason: notes.join('; ') };
}
