// Builds ./workspace: a copy of the scenario the agent works in, without the
// scenario's README.md (which explains the trap) or its grading/ folder.
// It is made a git repo with one commit, so promptfoo's copy_working_dir can
// clone it for each call and hand the assertions a diff of the agent's changes.
import { cpSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCENARIO = '01_wrong_place_bug';
const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const source = here(`../../${SCENARIO}`);
const workspace = here('./workspace');

rmSync(workspace, { recursive: true, force: true });
cpSync(source, workspace, {
  recursive: true,
  filter: (src) => !/[\\/](README\.md|grading)$/.test(src),
});

const git = (...args) => execFileSync('git', args, { cwd: workspace, stdio: 'ignore' });
git('init', '-q');
git('add', '-A');
git('-c', 'user.name=eval', '-c', 'user.email=eval@example.com', 'commit', '-qm', 'base');
console.log(`Prepared ${workspace} from ${SCENARIO}`);
