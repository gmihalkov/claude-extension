import type { Interview } from '../../interview/models/interview';

// Closing HOW ends the interview.
export function isFinalTransition(interview: Interview): boolean {
  return interview.pending === 'next' && interview.phase === 'how';
}
