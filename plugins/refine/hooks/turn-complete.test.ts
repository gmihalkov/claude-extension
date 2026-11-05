import { expect, mock, test } from 'claude-code/testing';

import { ROOT } from '../common/engine/fixtures/root';
import { INTERVIEW } from '../common/interview/fixtures/interview';
import { storeKey } from '../common/interview/helpers/store-key';

test('turn end queues the transition', async ($, on) => {
  const queued: string[] = [];

  mock.store(on, { [storeKey(ROOT)]: { ...INTERVIEW, pending: 'next' } });
  on('session.root', () => ({ value: ROOT }));
  on('turn.complete', () => ({ text: '' }));
  on('command.run', (_, e) => {
    queued.push(e.command);

    return {};
  });

  const end = { answer: '', durationMs: 1, isAborted: false, reason: 'answer' as const };

  await $.turn.complete({ ...end, turnId: 't1', agentId: 'a1' });

  expect(queued).toEqual([]);

  await $.turn.complete({ ...end, turnId: 't2' });

  expect(queued).toEqual(['compact']);
});
