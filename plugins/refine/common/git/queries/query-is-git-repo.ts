import type { EngineInterface } from 'claude-code';

export async function queryIsGitRepo($: EngineInterface, root: string): Promise<boolean> {
  const { exitCode, stdout } = await $.process.run(['git', 'rev-parse', '--is-inside-work-tree'], {
    cwd: root,
  });

  return exitCode === 0 && stdout.trim() === 'true';
}
