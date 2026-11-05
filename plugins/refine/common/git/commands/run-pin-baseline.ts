import type { EngineInterface } from 'claude-code';

// Keeps the baseline's stash commit from garbage collection until the interview ends.
export async function runPinBaseline(
  $: EngineInterface,
  root: string,
  id: string,
  stash: string,
): Promise<void> {
  if (stash !== '') {
    await $.process.run(['git', 'update-ref', `refs/refine/${id}`, stash], { cwd: root });
  }
}
