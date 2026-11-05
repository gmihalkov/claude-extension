import type { JournalEntry } from '../../journal/models/journal-entry';

// What closing the current phase meets: its document, the cleanup plans still open, the files
// changed outside Write/Edit.
export type PhaseClose = {
  document: string;
  hasDocument: boolean;
  plans: JournalEntry[];
  shellChanges: string[];
};
