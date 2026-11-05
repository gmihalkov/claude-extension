import { expect, test } from 'claude-code/testing';

import { fakeEngine } from '../../engine/fixtures/fake-engine';
import { ROOT } from '../../engine/fixtures/root';
import { INTERVIEW } from '../../interview/fixtures/interview';
import { storeKey } from '../../interview/helpers/store-key';

import { runClosePhase } from './run-close-phase';

test('closing marks the transition', async () => {
  const fake = fakeEngine({
    store: { [storeKey(ROOT)]: INTERVIEW },
    files: { [`${INTERVIEW.dir}/journal.json`]: '[]' },
  });

  await runClosePhase(fake.$, INTERVIEW);

  expect(fake.store.get(storeKey(ROOT))).toEqual({ ...INTERVIEW, pending: 'next' });
});
