import type { EngineInterface } from 'claude-code';

import type { JournalEntry } from '../models/journal-entry';

export async function queryJournal($: EngineInterface, dir: string): Promise<JournalEntry[]> {
  return JSON.parse(String(await $.fs.read(`${dir}/journal.json`))) as JournalEntry[];
}
