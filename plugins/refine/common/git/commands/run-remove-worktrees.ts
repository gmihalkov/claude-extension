import type { EngineInterface } from 'claude-code';

import { lines } from '../helpers/lines';

// Removes the worktrees the agent made inside `dir`.
export async function runRemoveWorktrees(
  $: EngineInterface,
  root: string,
  dir: string,
): Promise<void> {
  const list = await $.process.run(['git', 'worktree', 'list', '--porcelain'], { cwd: root });
  let isRemoved = false;

  for (const line of lines(list.stdout)) {
    const path = line.startsWith('worktree ') ? line.slice('worktree '.length) : '';

    if (path.startsWith(`${dir}/`)) {
      await $.process.run(['git', 'worktree', 'remove', '--force', path], { cwd: root });
      isRemoved = true;
    }
  }

  if (isRemoved) {
    await $.process.run(['git', 'worktree', 'prune'], { cwd: root });
  }
}
