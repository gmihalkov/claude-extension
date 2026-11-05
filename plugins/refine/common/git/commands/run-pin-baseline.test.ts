import { expect, test } from 'claude-code/testing';

import { fakeEngine } from '../../engine/fixtures/fake-engine';
import { ROOT } from '../../engine/fixtures/root';

import { runPinBaseline } from './run-pin-baseline';

test('runPinBaseline keeps the stash under a refine ref', async () => {
  const fake = fakeEngine();

  await runPinBaseline(fake.$, ROOT, 's1', 'abc123');

  expect(fake.runs).toEqual([['git', 'update-ref', 'refs/refine/s1', 'abc123']]);
});
