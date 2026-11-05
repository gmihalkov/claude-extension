import type { EngineInterface } from 'claude-code';

import type { Interview } from '../../interview/models/interview';
import type { JournalEntry } from '../models/journal-entry';

import { queryJournal } from './query-journal';

// The unrestored entry for a file in the current phase. One per file: a second one would capture
// the first write's result as "original".
export async function queryActiveEntry(
  $: EngineInterface,
  interview: Interview,
  path: string,
): Promise<JournalEntry | undefined> {
  return (await queryJournal($, interview.dir)).find(
    (entry) =>
      entry.kind === 'file' &&
      entry.path === path &&
      entry.phase === interview.phase &&
      !entry.restored,
  );
}
