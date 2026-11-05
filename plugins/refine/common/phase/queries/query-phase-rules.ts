import type { EngineInterface } from 'claude-code';

import type { Phase } from '../models/phase';

export async function queryPhaseRules($: EngineInterface, phase: Phase): Promise<string> {
  const parts: string[] = [];

  for (const name of ['common', phase, 'catalog', `${phase}-template`]) {
    parts.push(String(await $.fs.read(`${$.plugin.root}/prompts/${name}.md`)).trim());
  }

  return parts.join('\n\n');
}
