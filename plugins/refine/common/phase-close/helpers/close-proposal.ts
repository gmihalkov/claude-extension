import type { PhaseClose } from '../models/phase-close';

import { planLines } from './plan-lines';

// What the agent must show the user when it proposes to close the phase.
export function closeProposal(close: PhaseClose): string {
  const sections = [
    close.plans.length > 0 ? `Cleanup plans not carried out yet:\n${planLines(close.plans)}` : '',
    close.shellChanges.length > 0
      ? `Files changed outside Write/Edit since the start:\n${close.shellChanges.map((path) => `- ${path}`).join('\n')}`
      : '',
  ].filter((section) => section !== '');

  return sections.length === 0
    ? 'refine: nothing pending; the close proposal can go to the user.'
    : `refine: show these in the close proposal to the user.\n${sections.join('\n')}`;
}
