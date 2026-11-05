import { expect, test } from 'claude-code/testing';

import { fakeEngine } from '../../engine/fixtures/fake-engine';
import { INTERVIEW } from '../../interview/fixtures/interview';
import { runMarkPlansDone } from '../../journal/commands/run-mark-plans-done';
import { queryPhaseClose } from '../queries/query-phase-close';

import { closeRefusal } from './close-refusal';

const DIR = INTERVIEW.dir;

test('close refuses without the document', async () => {
  const fake = fakeEngine({ files: { [`${DIR}/journal.json`]: '[]' } });

  expect(closeRefusal(await queryPhaseClose(fake.$, INTERVIEW))).toContain('what.md');
});

test('close refuses with open plans until they are done', async () => {
  const plan = {
    id: 'j1',
    phase: 'what',
    path: 'docker container x',
    plan: 'docker rm x',
    kind: 'plan',
    restored: false,
  };
  const fake = fakeEngine({
    files: { [`${DIR}/journal.json`]: JSON.stringify([plan]), [`${DIR}/what.md`]: 'W' },
  });

  expect(closeRefusal(await queryPhaseClose(fake.$, INTERVIEW))).toContain('docker rm x');

  await runMarkPlansDone(fake.$, INTERVIEW, ['j1']);

  expect(closeRefusal(await queryPhaseClose(fake.$, INTERVIEW))).toBeUndefined();
});
