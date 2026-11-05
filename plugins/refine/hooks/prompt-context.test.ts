import { expect, mock, test } from 'claude-code/testing';

import { ROOT } from '../common/engine/fixtures/root';
import { INTERVIEW } from '../common/interview/fixtures/interview';
import { storeKey } from '../common/interview/helpers/store-key';

const DIR = INTERVIEW.dir;

test('prompt.context adds no block without an interview', async ($, on) => {
  mock.store(on);
  on('session.root', () => ({ value: ROOT }));
  on('prompt.context', (_, e) => ({ blocks: e.blocks }));

  expect((await $.prompt.context({ blocks: [] })).blocks).toEqual([]);
});

test('prompt.context adds the rules block during an interview', async ($, on) => {
  mock.store(on, { [storeKey(ROOT)]: INTERVIEW });
  on('session.root', () => ({ value: ROOT }));
  on('fs.read', () => ({ value: 'RULES {{dir}}' }));
  on('prompt.context', (_, e) => ({ blocks: e.blocks }));

  const { blocks } = await $.prompt.context({ blocks: [] });

  expect(blocks.map((block) => block.name)).toEqual(['refine']);
  expect(blocks[0]?.text).toContain(DIR);
  expect(blocks[0]?.text).not.toContain('{{dir}}');
});
