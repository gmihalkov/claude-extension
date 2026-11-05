import { expect, test } from 'claude-code/testing';

import { fakeEngine } from '../../engine/fixtures/fake-engine';
import { ROOT } from '../../engine/fixtures/root';
import { INTERVIEW } from '../../interview/fixtures/interview';
import { storeKey } from '../../interview/helpers/store-key';
import type { Interview } from '../../interview/models/interview';

import { runEndInterview } from './run-end-interview';

const DIR = INTERVIEW.dir;

test('ending leaves nothing', async () => {
  const how: Interview = {
    ...INTERVIEW,
    phase: 'how',
    isGit: true,
    baseline: { stash: 'abc', untracked: [], dirty: [] },
  };
  const fake = fakeEngine({
    store: { [storeKey(ROOT)]: how },
    files: { [`${DIR}/journal.json`]: '[]' },
  });

  await runEndInterview(fake.$, how);

  expect(fake.runs).toContainEqual(['rm', '-rf', DIR]);
  expect(fake.runs).toContainEqual(['git', 'update-ref', '-d', 'refs/refine/s1']);
  expect(fake.store.has(storeKey(ROOT))).toBe(false);
  expect(fake.submitted).toHaveLength(0);
});
