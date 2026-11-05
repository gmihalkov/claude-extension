import type { EngineInterface } from 'claude-code';

import type { Interview } from '../../interview/models/interview';
import type { Phase } from '../../phase/models/phase';
import { queryJournal } from '../queries/query-journal';

import { runWriteJournal } from './run-write-journal';

// Puts back every file the phase journaled: its original, or nothing when it did not exist.
export async function runRestorePhase(
  $: EngineInterface,
  interview: Interview,
  phase: Phase,
): Promise<void> {
  const entries = await queryJournal($, interview.dir);

  for (const entry of entries) {
    if (entry.kind !== 'file' || entry.phase !== phase || entry.restored) {
      continue;
    }

    if (entry.original === 'file') {
      await $.process.run(['cp', '-p', `${interview.dir}/originals/${entry.id}`, entry.path]);
    } else if (entry.original === null) {
      await $.process.run(['rm', '-f', entry.path]);
    }

    entry.restored = true;
  }

  await runWriteJournal($, interview.dir, entries);
}
