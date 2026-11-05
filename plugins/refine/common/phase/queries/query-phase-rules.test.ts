import { expect, test } from 'claude-code/testing';

import { fakeEngine } from '../../engine/fixtures/fake-engine';

import { queryPhaseRules } from './query-phase-rules';

const PROMPTS = '/plugins/refine/prompts';
const files = {
  [`${PROMPTS}/common.md`]: 'COMMON {{dir}}',
  [`${PROMPTS}/what.md`]: 'WHAT-RULES',
  [`${PROMPTS}/how.md`]: 'HOW-RULES',
  [`${PROMPTS}/catalog.md`]: 'CATALOG',
  [`${PROMPTS}/what-template.md`]: 'WHAT-TEMPLATE',
  [`${PROMPTS}/how-template.md`]: 'HOW-TEMPLATE',
};

test('what rules carry the template and catalog', async () => {
  const rules = await queryPhaseRules(fakeEngine({ files }).$, 'what');

  expect(rules).toBe('COMMON {{dir}}\n\nWHAT-RULES\n\nCATALOG\n\nWHAT-TEMPLATE');
  expect(rules).not.toContain('HOW-TEMPLATE');
});
