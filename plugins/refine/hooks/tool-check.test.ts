import { expect, mock, test } from 'claude-code/testing';

import { ROOT } from '../common/engine/fixtures/root';
import { INTERVIEW } from '../common/interview/fixtures/interview';
import { storeKey } from '../common/interview/helpers/store-key';

const DIR = INTERVIEW.dir;

test('writes into the interview folder are allowed without a prompt', async ($, on) => {
  mock.store(on, { [storeKey(ROOT)]: INTERVIEW });
  on('session.root', () => ({ value: ROOT }));
  on('fs.stat', (_, e) => ({
    value: { kind: 'dir', size: 0, mtimeMs: 0, isLink: false, realPath: e.path },
  }));
  on('tool.check', () => ({ decision: 'ask' }));

  const inside = await $.tool.check({ tool: 'Write', input: { file_path: `${DIR}/what.md` } });
  const project = await $.tool.check({ tool: 'Write', input: { file_path: `${ROOT}/src/a.ts` } });

  expect(inside.decision).toBe('allow');
  expect(project.decision).toBe('ask');
});

test('the interview folder allow never lifts a deny', async ($, on) => {
  mock.store(on, { [storeKey(ROOT)]: INTERVIEW });
  on('session.root', () => ({ value: ROOT }));
  on('fs.stat', (_, e) => ({
    value: { kind: 'dir', size: 0, mtimeMs: 0, isLink: false, realPath: e.path },
  }));
  on('tool.check', (_, e) =>
    (e.input as { file_path: string }).file_path.endsWith('deny.md')
      ? { decision: 'deny' }
      : { decision: 'ask' },
  );

  const denied = await $.tool.check({ tool: 'Write', input: { file_path: `${DIR}/deny.md` } });
  const journal = await $.tool.check({
    tool: 'Write',
    input: { file_path: `${DIR}/journal.json` },
  });

  expect(denied.decision).toBe('deny');
  expect(journal.decision).toBe('ask');
});
