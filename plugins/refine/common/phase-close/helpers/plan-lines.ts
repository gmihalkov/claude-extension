import type { JournalEntry } from '../../journal/models/journal-entry';

export function planLines(plans: readonly JournalEntry[]): string {
  return plans.map((entry) => `- ${entry.id} ${entry.path}: ${entry.plan}`).join('\n');
}
