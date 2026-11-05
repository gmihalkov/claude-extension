import type { EngineInterface } from 'claude-code';

import type { Interview } from '../../interview/models/interview';
import { queryPendingPlans } from '../../journal/queries/query-pending-plans';
import type { PhaseClose } from '../models/phase-close';

import { queryShellReport } from './query-shell-report';

export async function queryPhaseClose(
  $: EngineInterface,
  interview: Interview,
): Promise<PhaseClose> {
  const document = `${interview.dir}/${interview.phase}.md`;

  return {
    document,
    hasDocument: await $.fs.exists(document),
    plans: await queryPendingPlans($, interview, interview.phase),
    shellChanges: await queryShellReport($, interview),
  };
}
