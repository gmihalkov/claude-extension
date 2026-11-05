import { expect, test } from 'claude-code/testing';

import { compactMessages } from './compact-messages';

test('compactMessages keeps documents verbatim', () => {
  expect(compactMessages(['# WHAT\nbody'], 'note')).toEqual([
    { role: 'user', text: '# WHAT\nbody', toolUses: [] },
    { role: 'assistant', text: 'note', toolUses: [] },
  ]);
});
