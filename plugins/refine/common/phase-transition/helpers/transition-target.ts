import type { Interview } from '../../interview/models/interview';
import type { Phase } from '../../phase/models/phase';
import type { NoteKind } from '../types/note-kind';

// Where a transition that does not end the interview leads, and the note that tells the agent.
export function transitionTarget(interview: Interview): { phase: Phase; note: NoteKind } {
  switch (interview.pending ?? 'continue') {
    case 'next':
      return { phase: 'how', note: 'what-done' };
    case 'back':
      return { phase: 'what', note: 'back' };
    case 'continue':
      return { phase: interview.phase, note: 'continue' };
  }
}
