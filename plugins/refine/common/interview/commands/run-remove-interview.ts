import type { EngineInterface } from 'claude-code';

import { storeKey } from '../helpers/store-key';

export async function runRemoveInterview($: EngineInterface, root: string): Promise<void> {
  await $.store.delete(storeKey(root));
}
