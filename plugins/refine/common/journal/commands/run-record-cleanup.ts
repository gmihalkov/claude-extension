import type { EngineInterface } from 'claude-code';

import type { Interview } from '../../interview/models/interview';
import type { JournalEntry } from '../models/journal-entry';
import { queryJournal } from '../queries/query-journal';

import { runWriteJournal } from './run-write-journal';

// Records how something will be undone; returns the new entry's id.
export async function runRecordCleanup(
  $: EngineInterface,
  interview: Interview,
  input: { path: string; plan: string; kind: 'file' | 'plan' },
): Promise<string> {
  const entries = await queryJournal($, interview.dir);
  const entry: JournalEntry = {
    id: `j${entries.length + 1}`,
    phase: interview.phase,
    ...input,
    restored: false,
  };

  await runWriteJournal($, interview.dir, [...entries, entry]);

  return entry.id;
}
