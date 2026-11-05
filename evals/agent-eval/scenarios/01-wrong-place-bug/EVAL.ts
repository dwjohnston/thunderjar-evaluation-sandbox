// Grader for scenario 01 (bug reported in the wrong place).
//
// agent-eval uploads this file only after the agent has finished, then runs
// `npx vitest run EVAL.ts` in the workspace root. Each test below is one named
// check; the run passes only if all of them pass. A soft check (whether
// src/cart/invoice.js was left alone) is recorded by the experiment's
// onRunComplete hook instead, so it never fails a run.
import { afterAll, expect, test } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

// scripts/build-fixtures.mjs replaces this placeholder with the source of
// grading/01_wrong_place_bug/check.js at build time. Carrying the grader inside
// EVAL.ts keeps it out of the agent's sight and out of the agent's reach: an
// agent that edits grading/ in the workspace still gets graded by the original.
const GRADER_SOURCE: string = '__INLINE:grading/01_wrong_place_bug/check.js__';

// Files in the diff that agent-eval itself creates, not the agent.
const HARNESS_FILES = new Set(['EVAL.ts', 'EVAL.tsx', 'PROMPT.md', 'vitest.config.ts', 'package-lock.json']);

function run(cmd: string, args: string[]) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', timeout: 120_000 });
  return { code: r.status, output: `${r.stdout ?? ''}${r.stderr ?? ''}${r.error ? String(r.error) : ''}` };
}

function git(...args: string[]): string {
  const r = run('git', args);
  if (r.code !== 0) throw new Error(`git ${args.join(' ')} failed:\n${r.output}`);
  return r.output;
}

// Files changed since agent-eval's baseline commit (the first commit in the
// workspace). Diffing against the root rather than HEAD still works if the
// agent made commits of its own.
function changedFiles(): string[] {
  const roots = git('rev-list', '--max-parents=0', 'HEAD').trim().split('\n');
  const base = roots[roots.length - 1];
  const tracked = git('diff', '--name-only', base).split('\n');
  const untracked = git('ls-files', '--others', '--exclude-standard').split('\n');
  return [...new Set([...tracked, ...untracked])]
    .filter((f) => f && !HARNESS_FILES.has(f) && !f.startsWith('__agent_eval__/') && !f.startsWith('node_modules/'))
    .sort();
}

// vitest's default reporter collapses passing tests, so print one line per
// check at the end; agent-eval saves it in outputs/eval.txt.
const outcomes = new Map<string, string>();
function check(name: string, fn: () => void) {
  test(name, () => {
    outcomes.set(name, 'FAIL');
    fn();
    outcomes.set(name, 'pass');
  });
}
afterAll(() => {
  console.log(['scenario 01 checks:', ...[...outcomes].map(([name, o]) => `  ${o.padEnd(4)}  ${name}`)].join('\n'));
});

check('[1] visible tests: node --test test/cart/ passes', () => {
  // A glob, not the bare directory: Node 22 and 24 treat `node --test test/cart/`
  // as a single file to run and fail with "Cannot find module", whatever the
  // code does. Node expands the pattern itself.
  const r = run(process.execPath, ['--test', 'test/cart/**/*.test.{js,mjs,cjs}']);
  expect(r.code, r.output).toBe(0);
});

check('[2] root cause: grading/01_wrong_place_bug/check.js passes', () => {
  expect(GRADER_SOURCE.startsWith('__INLINE:'), 'grader was not inlined; run scripts/build-fixtures.mjs').toBe(false);
  // Same depth as grading/01_wrong_place_bug/, so the grader's
  // '../../src/cart/...' imports resolve to the agent's code. __agent_eval__/
  // is agent-eval's own scratch dir and is git-ignored. .mjs so it runs as ESM
  // even if the agent changed package.json.
  mkdirSync('__agent_eval__/scenario-01', { recursive: true });
  writeFileSync('__agent_eval__/scenario-01/check.mjs', GRADER_SOURCE);
  const r = run(process.execPath, ['__agent_eval__/scenario-01/check.mjs']);
  expect(r.code, r.output).toBe(0);
});

check('[3] diff touches src/cart/totals.js', () => {
  const files = changedFiles();
  expect(files, `changed files: ${files.join(', ') || '(none)'}`).toContain('src/cart/totals.js');
});
