import { expect, test } from 'claude-code/testing';

import { fakeEngine } from '../../engine/fixtures/fake-engine';
import { runRemoveInterview } from '../commands/run-remove-interview';
import { runSaveInterview } from '../commands/run-save-interview';
import { INTERVIEW } from '../fixtures/interview';

import { queryInterview } from './query-interview';

test('interview round-trips through the store', async () => {
  const { $: engine } = fakeEngine();

  await runSaveInterview(engine, INTERVIEW);

  expect(await queryInterview(engine, INTERVIEW.root)).toEqual(INTERVIEW);

  await runRemoveInterview(engine, INTERVIEW.root);

  expect(await queryInterview(engine, INTERVIEW.root)).toBeUndefined();
});
