import { expect, test } from 'claude-code/testing';

import { fakeEngine } from '../../engine/fixtures/fake-engine';
import { INTERVIEW } from '../../interview/fixtures/interview';

import { queryKickoffPrompt } from './query-kickoff-prompt';

test('kickoff names the task and the folder', async () => {
  const text = await queryKickoffPrompt(fakeEngine().$, 'what', INTERVIEW, true);

  expect(text).toContain('Task: add CSV export');
  expect(text).toContain(INTERVIEW.dir);
  expect(text).not.toContain('{{dir}}');
});

test('kickoff after a transition carries no rules', async () => {
  const text = await queryKickoffPrompt(fakeEngine().$, 'how', INTERVIEW, false);

  expect(text).not.toContain('COMMON');
  expect(text).toContain('HOW');
});
