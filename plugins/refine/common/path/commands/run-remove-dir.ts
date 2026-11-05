import type { EngineInterface } from 'claude-code';

// Deletes a folder only under ~/.claude/projects/, so a corrupted path can never reach user files.
export async function runRemoveDir($: EngineInterface, dir: string): Promise<void> {
  const home = await $.env.get('HOME');

  if (home === undefined || !dir.startsWith(`${home}/.claude/projects/`) || dir.includes('..')) {
    throw new Error(`refine: refusing to delete ${dir}`);
  }

  await $.process.run(['rm', '-rf', dir]);
}
