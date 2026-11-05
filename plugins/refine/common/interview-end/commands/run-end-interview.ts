import type { EngineInterface } from 'claude-code';

import { runDropBaseline } from '../../git/commands/run-drop-baseline';
import { runRemoveInterview } from '../../interview/commands/run-remove-interview';
import type { Interview } from '../../interview/models/interview';
import { runRestoreAll } from '../../journal/commands/run-restore-all';
import { runRemoveDir } from '../../path/commands/run-remove-dir';

// Leaves nothing of the interview: files restored, folder and baseline gone, the store forgets it.
export async function runEndInterview($: EngineInterface, interview: Interview): Promise<void> {
  await runRestoreAll($, interview);

  if (interview.isGit) {
    await runDropBaseline($, interview.root, interview.id);
  }

  await runRemoveDir($, interview.dir);
  await runRemoveInterview($, interview.root);
}
