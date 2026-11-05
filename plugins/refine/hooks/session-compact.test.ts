import { expect, mock, test } from 'claude-code/testing';

import { HOME } from '../common/engine/fixtures/home';
import { ROOT } from '../common/engine/fixtures/root';
import { INTERVIEW } from '../common/interview/fixtures/interview';
import { storeKey } from '../common/interview/helpers/store-key';

test('user compaction passes through', async ($, on) => {
  mock.store(on, { [storeKey(ROOT)]: INTERVIEW });
  on('session.root', () => ({ value: ROOT }));
  on('session.compact', () => ({ messages: [{ role: 'user', text: 'ENGINE', toolUses: [] }] }));

  const manual = await $.session.compact({ trigger: 'manual', messages: [] });

  expect(manual.messages?.[0]?.text).toBe('ENGINE');

  const plugin = await $.session.compact({ trigger: 'plugin', messages: [] });

  expect(plugin.messages?.[0]?.text).toBe('ENGINE');
});

test('a failed own compaction is skipped and the transition dropped', async ($, on) => {
  mock.store(on, { [storeKey(ROOT)]: { ...INTERVIEW, phase: 'how', pending: 'next' } });
  mock.env(on, { HOME });
  on('session.root', () => ({ value: ROOT }));
  on('fs.read', () => {
    throw new Error('EIO');
  });
  on('fs.exists', () => ({ value: false }));
  on('session.compact', () => ({ messages: [{ role: 'user', text: 'ENGINE', toolUses: [] }] }));

  const failed = await $.session.compact({ trigger: 'manual', messages: [] });

  expect(failed.skip).toContain('refine');

  const next = await $.session.compact({ trigger: 'manual', messages: [] });

  expect(next.messages?.[0]?.text).toBe('ENGINE');
});
