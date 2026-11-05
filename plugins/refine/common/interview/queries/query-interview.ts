import type { EngineInterface } from 'claude-code';

import { storeKey } from '../helpers/store-key';
import type { Interview } from '../models/interview';

export async function queryInterview(
  $: EngineInterface,
  root: string,
): Promise<Interview | undefined> {
  return (await $.store.get(storeKey(root))) as Interview | undefined;
}
