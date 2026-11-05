// Helpers for creating and inspecting the isolated per-run copy of the project.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Root of the project under evaluation (two levels above evals/promptfoo/). */
export const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

/** Top-level entries never copied into the agent's workspace. */
export const DEFAULT_EXCLUDE = ['.git', 'evals', 'node_modules'];

/** Directory (inside the workspace) where graders put pristine copies of grading scripts. */
export const GRADER_DIR = '.eval-grader';

/** Prefix for workspace directories, so stray ones are easy to find and delete. */
export const WORKSPACE_PREFIX = 'thunderjar-eval-';

const GIT_ENV = {
  GIT_AUTHOR_NAME: 'eval-baseline',
  GIT_AUTHOR_EMAIL: 'eval-baseline@example.invalid',
  GIT_COMMITTER_NAME: 'eval-baseline',
  GIT_COMMITTER_EMAIL: 'eval-baseline@example.invalid',
};

export function git(cwd, args) {
  // Strip GIT_DIR & co. so we never touch the repository promptfoo was launched from.
  const env = { ...process.env, ...GIT_ENV };
  for (const k of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_COMMON_DIR', 'GIT_OBJECT_DIRECTORY']) delete env[k];
  return execFileSync('git', args, { cwd, env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

/**
 * Copy the project to a fresh temp dir (minus `exclude`), then `git init` it and commit the
 * pristine state as a baseline, so graders can diff what the agent changed. The agent sees an
 * ordinary single-commit repo with no remote and no link back to the real repository.
 */
export function createWorkspace({ source = PROJECT_ROOT, exclude = DEFAULT_EXCLUDE } = {}) {
  const workdir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), WORKSPACE_PREFIX)));
  const excluded = new Set(exclude.map((e) => path.normalize(e)));
  fs.cpSync(source, workdir, {
    recursive: true,
    filter: (src) => {
      const rel = path.relative(source, src);
      return rel === '' || !excluded.has(path.normalize(rel));
    },
  });
  git(workdir, ['init', '--quiet', '--initial-branch=main']);
  fs.appendFileSync(path.join(workdir, '.git/info/exclude'), `\n/${GRADER_DIR}/\n`);
  git(workdir, ['add', '-A']);
  git(workdir, ['commit', '--quiet', '--no-verify', '-m', 'Baseline']);
  const baseCommit = git(workdir, ['rev-parse', 'HEAD']).trim();
  return { workdir, baseCommit };
}

/** Files that differ from the baseline (committed, staged, unstaged or untracked). */
export function changedFiles(workdir, baseCommit) {
  const tracked = git(workdir, ['diff', '--name-only', baseCommit]).split('\n');
  const untracked = git(workdir, ['ls-files', '--others', '--exclude-standard']).split('\n');
  return [...new Set([...tracked, ...untracked].filter(Boolean))].sort();
}

/** Unified diff of tracked changes against the baseline, truncated for display. */
export function diffText(workdir, baseCommit, max = 50_000) {
  const text = git(workdir, ['diff', baseCommit]);
  return text.length > max ? `${text.slice(0, max)}\n… (truncated)` : text;
}

export function removeWorkspace(workdir) {
  // Refuse to delete anything that isn't one of ours.
  if (!workdir || !path.basename(workdir).startsWith(WORKSPACE_PREFIX)) return;
  fs.rmSync(workdir, { recursive: true, force: true });
}
