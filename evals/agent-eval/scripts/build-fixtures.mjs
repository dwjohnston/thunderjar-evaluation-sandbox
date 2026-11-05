#!/usr/bin/env node
// Builds the agent-eval workspace in evals/agent-eval/.work/ from the repo:
//
//   .work/evals/<scenario>/        the project as the agent will see it (every
//                                  file git tracks, minus EXCLUDE) plus the
//                                  scenario's PROMPT.md and EVAL.ts
//   .work/experiments/<name>.ts    one-line re-exports of ../../experiments/<name>.ts
//
// agent-eval wants each fixture as a self-contained directory, and wants
// experiments/ and evals/ to be siblings. Generating them keeps the repo as the
// single source of truth instead of a hand-made copy that drifts. .work/ is a
// dot-directory so the root project's `node --test` doesn't pick up the copies.
//
// Files are read from the working tree, so uncommitted edits to tracked files
// are included. New files must be `git add`ed first.
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const EVAL_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const REPO_ROOT = resolve(EVAL_ROOT, '../..');
export const WORK_DIR = join(EVAL_ROOT, '.work');

// Paths (or directory prefixes ending in '/') left out of every fixture.
const EXCLUDE = [
  'evals/', // this harness: graders, prompts, configs
  // TODO: README.md and grading/ give the answers away (see the root README).
  // Add them here once we're ready to hide them from the agent. EVAL.ts carries
  // its own copy of the grader, so grading still works without grading/.
  // 'README.md',
  // 'grading/',
];

// Files agent-eval treats specially. If the project ever had one, it would be
// hidden from the agent or clash with the scenario's own.
const RESERVED = new Set(['PROMPT.md', 'EVAL.ts', 'EVAL.tsx']);

const excluded = (path) => EXCLUDE.some((e) => (e.endsWith('/') ? path.startsWith(e) : path === e));

function projectFiles() {
  const out = execFileSync('git', ['ls-files', '-z'], { cwd: REPO_ROOT, encoding: 'utf8' });
  return out
    .split('\0')
    .filter(Boolean)
    .filter((p) => !excluded(p))
    .filter((p) => existsSync(join(REPO_ROOT, p))); // tracked but deleted in the working tree
}

// Replace '__INLINE:<repo path>__' string literals with the file's contents.
function inlineSources(source, scenario) {
  return source.replace(/'__INLINE:([^']+?)__'/g, (_, path) => {
    const abs = join(REPO_ROOT, path);
    if (!existsSync(abs)) throw new Error(`${scenario}: cannot inline ${path}: not found in the repo`);
    return JSON.stringify(readFileSync(abs, 'utf8'));
  });
}

export function buildFixtures({ log = console.log } = {}) {
  const files = projectFiles();
  for (const f of files) {
    if (RESERVED.has(f.split('/').pop())) throw new Error(`project file ${f} clashes with an agent-eval file name`);
  }
  const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8'));
  if (pkg.type !== 'module') throw new Error('agent-eval requires "type": "module" in the project package.json');

  const evalsDir = join(WORK_DIR, 'evals');
  rmSync(evalsDir, { recursive: true, force: true });
  const scenariosDir = join(EVAL_ROOT, 'scenarios');
  const scenarios = readdirSync(scenariosDir).filter((d) => statSync(join(scenariosDir, d)).isDirectory()).sort();

  for (const scenario of scenarios) {
    const dest = join(evalsDir, scenario);
    for (const f of files) {
      mkdirSync(dirname(join(dest, f)), { recursive: true });
      copyFileSync(join(REPO_ROOT, f), join(dest, f));
    }
    const src = join(scenariosDir, scenario);
    for (const f of readdirSync(src)) {
      const text = readFileSync(join(src, f), 'utf8');
      writeFileSync(join(dest, f), f.startsWith('EVAL.') ? inlineSources(text, scenario) : text);
    }
    for (const required of ['PROMPT.md', 'EVAL.ts']) {
      if (!existsSync(join(dest, required))) throw new Error(`${scenario}: missing ${required}`);
    }
    log(`fixture ${relative(EVAL_ROOT, dest)} (${files.length} project files)`);
  }

  const expDir = join(WORK_DIR, 'experiments');
  rmSync(expDir, { recursive: true, force: true });
  mkdirSync(expDir, { recursive: true });
  for (const f of readdirSync(join(EVAL_ROOT, 'experiments')).filter((f) => f.endsWith('.ts'))) {
    // agent-eval looks for evals/ next to the experiment file's directory, so
    // the experiment has to live in .work/. Re-export it so the real one stays
    // in experiments/ and can import from this package.
    writeFileSync(join(expDir, f), `export { default } from '../../experiments/${f}';\n`);
    log(`experiment ${relative(EVAL_ROOT, join(expDir, f))}`);
  }
  return { evalsDir, scenarios, files };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildFixtures();
}
