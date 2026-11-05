import type { EngineInterface } from 'claude-code';

import type { JournalEntry } from '../models/journal-entry';

export async function runWriteJournal(
  $: EngineInterface,
  dir: string,
  entries: readonly JournalEntry[],
): Promise<void> {
  await $.fs.write(`${dir}/journal.json`, JSON.stringify(entries, null, 2));
}
