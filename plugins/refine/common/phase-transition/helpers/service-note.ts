import type { Phase } from '../../phase/models/phase';
import type { NoteKind } from '../types/note-kind';

export function serviceNote(kind: NoteKind, phase: Phase, dir: string): string {
  switch (kind) {
    case 'what-done':
      return `refine: phase WHAT is closed and the message above is its document. Phase HOW starts now; its rules are in the refine context block. Keep the HOW draft in ${dir}/how.md and edit the WHAT document in ${dir}/what.md.`;
    case 'how-done':
      return "refine: the interview is finished. The messages above are the WHAT and HOW documents; nothing else from the interview remains and its files are deleted. What happens next (planning, implementation) is the user's decision.";
    case 'back':
      return `refine: back in phase WHAT at the user's request; the message above is the WHAT document (${dir}/what.md). The HOW draft stays in ${dir}/how.md and is shown again when WHAT closes.`;
    case 'continue':
      return `refine: the interview resumes in phase ${phase.toUpperCase()}; the messages above are the current drafts in ${dir}.`;
  }
}
