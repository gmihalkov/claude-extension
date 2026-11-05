import { expect, test } from 'claude-code/testing';

import { fakeEngine } from '../../engine/fixtures/fake-engine';
import { ROOT } from '../../engine/fixtures/root';
import { INTERVIEW } from '../../interview/fixtures/interview';
import { storeKey } from '../../interview/helpers/store-key';

import { runAdvanceInterview } from './run-advance-interview';

test('what to how transition', async () => {
  const fake = fakeEngine({ store: { [storeKey(ROOT)]: { ...INTERVIEW, pending: 'next' } } });

  await runAdvanceInterview(fake.$, { ...INTERVIEW, pending: 'next' });

  expect(fake.store.get(storeKey(ROOT))).toEqual({ ...INTERVIEW, phase: 'how' });
  expect(fake.submitted).toHaveLength(1);
});
