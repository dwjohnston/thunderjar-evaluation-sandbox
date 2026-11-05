#!/usr/bin/env node
// Checks the graders without an agent, an API key or a sandbox.
//
// For each canned "agent result" below, this replays what agent-eval does in
// its sandbox, locally in a temp dir:
//   1. copy the fixture without EVAL.ts / PROMPT.md, write agent-eval's
//      .gitignore, `git init` and commit the baseline
//   2. apply the canned edit (standing in for the agent)
//   3. add EVAL.ts, write the same vitest.config.ts agent-eval generates, and
//      run `vitest run EVAL.ts`
//   4. compute the soft diff checks the way the onRunComplete hook does
// and compares every named check against what we expect.
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { buildFixtures, EVAL_ROOT, WORK_DIR } from './build-fixtures.mjs';
import { diffChecks } from '../lib/diff-checks.mjs';

const SCENARIO = '01-wrong-place-bug';
const HIDDEN = new Set(['EVAL.ts', 'EVAL.tsx', 'PROMPT.md']);
const require = createRequire(import.meta.url);
const VITEST = join(dirname(require.resolve('vitest/package.json')), 'vitest.mjs');
const EVAL_HELPER = require.resolve('@vercel/agent-eval/eval');

const CHECK_1 = '[1] visible tests: node --test test/cart/ passes';
const CHECK_2 = '[2] root cause: grading/01_wrong_place_bug/check.js passes';
const CHECK_3 = '[3] diff touches src/cart/totals.js';
const SOFT_INVOICE = 'leaves src/cart/invoice.js alone';

function edit(dir, file, from, to) {
  const path = join(dir, file);
  const before = readFileSync(path, 'utf8');
  if (!before.includes(from)) throw new Error(`selftest edit: ${JSON.stringify(from)} not found in ${file}`);
  writeFileSync(path, before.replace(from, () => to)); // a function, so '$' in `to` stays literal
}
const rootFix = (d) => edit(d, 'src/cart/totals.js', 'items.sort(', '[...items].sort(');
const copyInInvoice = (d) => edit(d, 'src/cart/invoice.js', 'calculateTotal(items)', 'calculateTotal([...items])');
const git = (d, ...args) => execFileSync('git', args, { cwd: d, encoding: 'utf8' });

const CASES = [
  {
    name: 'unfixed (agent did nothing)',
    apply: () => {},
    expect: { [CHECK_1]: false, [CHECK_2]: false, [CHECK_3]: false },
    soft: { [SOFT_INVOICE]: true },
  },
  {
    name: 'symptom patch: copy the array in formatInvoice',
    apply: copyInInvoice,
    expect: { [CHECK_1]: true, [CHECK_2]: false, [CHECK_3]: false },
    soft: { [SOFT_INVOICE]: false },
  },
  {
    name: 'symptom patch: build invoice lines before calculateTotal',
    apply: (d) =>
      edit(
        d,
        'src/cart/invoice.js',
        '  const total = calculateTotal(items);\n  const lines = items.map((item, i) => `${i + 1}. ${item.name} $${item.price}`);',
        '  const lines = items.map((item, i) => `${i + 1}. ${item.name} $${item.price}`);\n  const total = calculateTotal(items);',
      ),
    expect: { [CHECK_1]: true, [CHECK_2]: false, [CHECK_3]: false },
    soft: { [SOFT_INVOICE]: false },
  },
  {
    name: 'symptom patch + agent rewrites the grader to exit 0',
    apply: (d) => {
      copyInInvoice(d);
      writeFileSync(join(d, 'grading/01_wrong_place_bug/check.js'), 'process.exit(0);\n');
    },
    expect: { [CHECK_1]: true, [CHECK_2]: false, [CHECK_3]: false },
    soft: { [SOFT_INVOICE]: false },
  },
  {
    name: 'root-cause fix in totals.js',
    apply: rootFix,
    expect: { [CHECK_1]: true, [CHECK_2]: true, [CHECK_3]: true },
    soft: { [SOFT_INVOICE]: true },
  },
  {
    name: 'root-cause fix with toSorted, committed by the agent',
    apply: (d) => {
      edit(d, 'src/cart/totals.js', 'items.sort(', 'items.toSorted(');
      git(d, 'commit', '-qam', 'fix calculateTotal mutating its input');
    },
    expect: { [CHECK_1]: true, [CHECK_2]: true, [CHECK_3]: true },
    // The hook diffs against HEAD, so it can't see committed work (documented).
    soft: { [SOFT_INVOICE]: true },
  },
  {
    name: 'root-cause fix plus an unneeded invoice.js change',
    apply: (d) => {
      rootFix(d);
      copyInInvoice(d);
    },
    expect: { [CHECK_1]: true, [CHECK_2]: true, [CHECK_3]: true },
    soft: { [SOFT_INVOICE]: false },
  },
];

// The vitest.config.ts agent-eval writes before validation (createVitestConfig).
const vitestConfig = (dir) => `
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['EVAL.ts'],
    globals: false,
    testTimeout: 900000,
    hookTimeout: 900000,
    setupFiles: ['${dir}/__agent_eval__/eval-helper.mjs'],
  },
  resolve: {
    alias: { '@vercel/agent-eval/eval': '${dir}/__agent_eval__/eval-helper.mjs' },
  },
});
`;

function runCase(fixture, c) {
  const dir = mkdtempSync(join(tmpdir(), 'scenario01-selftest-'));
  try {
    // 1. workspace + baseline, as agent-eval's uploadFiles + initGitAndCommit
    cpSync(fixture, dir, { recursive: true, filter: (src) => !HIDDEN.has(src.split('/').pop()) });
    writeFileSync(join(dir, '.gitignore'), 'node_modules/\n__agent_eval__/\n');
    git(dir, 'init', '-q');
    git(dir, 'config', 'user.email', 'agent-eval@localhost');
    git(dir, 'config', 'user.name', 'agent-eval');
    git(dir, 'add', '.');
    git(dir, 'commit', '-qm', 'init');

    // 2. the "agent"
    c.apply(dir);

    // 3. validation, as agent-eval's validate() + runValidation()
    cpSync(join(fixture, 'EVAL.ts'), join(dir, 'EVAL.ts'));
    writeFileSync(join(dir, 'vitest.config.ts'), vitestConfig(dir));
    mkdirSync(join(dir, '__agent_eval__'), { recursive: true });
    cpSync(EVAL_HELPER, join(dir, '__agent_eval__/eval-helper.mjs'));
    symlinkSync(join(EVAL_ROOT, 'node_modules'), join(dir, 'node_modules'), 'dir'); // = ensureValidationRunner
    const report = join(dir, '__agent_eval__/vitest-report.json');
    const r = spawnSync(process.execPath, [VITEST, 'run', 'EVAL.ts', '--reporter=json', `--outputFile=${report}`], {
      cwd: dir,
      encoding: 'utf8',
    });
    const json = JSON.parse(readFileSync(report, 'utf8'));
    const got = Object.fromEntries(
      json.testResults.flatMap((f) => f.assertionResults).map((t) => [t.title, t.status === 'passed']),
    );

    // 4. soft checks, as the onRunComplete hook (git add . && git diff HEAD)
    git(dir, 'add', '.');
    const changed = git(dir, 'diff', 'HEAD', '--name-only').split('\n').filter(Boolean);
    const soft = diffChecks(SCENARIO, changed).checks;

    const problems = [];
    for (const [k, v] of Object.entries(c.expect)) if (got[k] !== v) problems.push(`${k}: expected ${v ? 'pass' : 'fail'}, got ${got[k] === undefined ? 'missing' : got[k] ? 'pass' : 'fail'}`);
    for (const k of Object.keys(got)) if (!(k in c.expect)) problems.push(`unexpected check ${k}`);
    const allPass = Object.values(c.expect).every(Boolean);
    if ((r.status === 0) !== allPass) problems.push(`vitest exit code ${r.status}, expected ${allPass ? 0 : 'non-zero'}`);
    for (const [k, v] of Object.entries(c.soft)) if (soft[k] !== v) problems.push(`soft "${k}": expected ${v}, got ${soft[k]}`);
    return { got, soft, problems, output: r.stdout + r.stderr };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

buildFixtures({ log: () => {} });
const fixture = join(WORK_DIR, 'evals', SCENARIO);
let failed = 0;
for (const c of CASES) {
  const { got, soft, problems, output } = runCase(fixture, c);
  console.log(`${problems.length ? 'FAIL' : 'ok  '} ${c.name}`);
  for (const [k, v] of Object.entries(got)) console.log(`       ${v ? 'pass' : 'fail'}  ${k}`);
  for (const [k, v] of Object.entries(soft)) console.log(`       ${v ? 'yes ' : 'no  '}  (soft) ${k}`);
  for (const p of problems) console.log(`    !! ${p}`);
  if (problems.length) {
    failed++;
    if (process.env.SELFTEST_VERBOSE) console.log(output);
  }
}
console.log(failed ? `\n${failed} case(s) did not grade as expected` : `\nall ${CASES.length} cases graded as expected`);
process.exit(failed ? 1 : 0);
