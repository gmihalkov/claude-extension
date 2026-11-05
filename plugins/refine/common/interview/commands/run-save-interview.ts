import type { EngineInterface } from 'claude-code';

import { storeKey } from '../helpers/store-key';
import type { Interview } from '../models/interview';

export async function runSaveInterview($: EngineInterface, interview: Interview): Promise<void> {
  await $.store.set(storeKey(interview.root), interview);
}
