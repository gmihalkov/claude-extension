import type { EngineInterface } from 'claude-code';

export async function runDropBaseline($: EngineInterface, root: string, id: string): Promise<void> {
  await $.process.run(['git', 'update-ref', '-d', `refs/refine/${id}`], { cwd: root });
}
