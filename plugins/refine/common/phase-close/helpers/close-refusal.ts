import type { PhaseClose } from '../models/phase-close';

import { planLines } from './plan-lines';

// Why the phase cannot close yet, or undefined when it can.
export function closeRefusal(close: PhaseClose): string | undefined {
  if (!close.hasDocument) {
    return `refine: cannot close: ${close.document} is missing; write the phase document first.`;
  }

  if (close.plans.length > 0) {
    return `refine: cannot close: carry out these cleanup plans, then call again with their ids in donePlans:\n${planLines(close.plans)}`;
  }

  return undefined;
}
