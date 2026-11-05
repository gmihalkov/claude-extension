import { expect, test } from 'claude-code/testing';

import { fakeEngine } from '../common/engine/fixtures/fake-engine';
import { ROOT } from '../common/engine/fixtures/root';
import { INTERVIEW } from '../common/interview/fixtures/interview';
import { storeKey } from '../common/interview/helpers/store-key';
import { queryJournal } from '../common/journal/queries/query-journal';

import { toolCallCleanup } from './tool-call-cleanup';

test('recording the same file twice keeps one entry', async () => {
  const fake = fakeEngine({
    files: { [`${INTERVIEW.dir}/journal.json`]: '[]', [`${ROOT}/a.ts`]: 'x' },
    store: { [storeKey(ROOT)]: INTERVIEW },
  });
  const record = () =>
    toolCallCleanup(
      fake.$,
      { tool: 'mcp__refine__refine_cleanup', path: `${ROOT}/a.ts`, plan: 'restore' } as never,
      (async () => ({})) as never,
    );

  await record();
  await record();

  expect(await queryJournal(fake.$, INTERVIEW.dir)).toHaveLength(1);
});
