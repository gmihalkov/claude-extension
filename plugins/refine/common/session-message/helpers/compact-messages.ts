import type { SessionMessage } from '../models/session-message';

// A compacted transcript: the documents as user messages, then one note from the assistant.
export function compactMessages(docs: readonly string[], note: string): SessionMessage[] {
  return [
    ...docs.map((text) => ({ role: 'user' as const, text, toolUses: [] })),
    { role: 'assistant', text: note, toolUses: [] },
  ];
}
