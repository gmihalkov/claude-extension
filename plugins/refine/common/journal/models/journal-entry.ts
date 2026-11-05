import type { Phase } from '../../phase/models/phase';

export type JournalEntry = {
  id: string;
  phase: Phase;
  path: string;
  plan: string;
  kind: 'file' | 'plan';
  // undefined: not written yet; null: did not exist; 'file': saved in <dir>/originals/<id>.
  original?: 'file' | null;
  restored: boolean;
};
