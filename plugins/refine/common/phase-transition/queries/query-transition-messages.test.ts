import { expect, test } from 'claude-code/testing';

import { fakeEngine } from '../../engine/fixtures/fake-engine';
import { INTERVIEW } from '../../interview/fixtures/interview';
import { compactMessages } from '../../session-message/helpers/compact-messages';
import { serviceNote } from '../helpers/service-note';

import { queryTransitionMessages } from './query-transition-messages';

const DIR = INTERVIEW.dir;

test('closing WHAT leaves its document and the note', async () => {
  const fake = fakeEngine({
    files: { [`${DIR}/journal.json`]: '[]', [`${DIR}/what.md`]: 'W' },
  });

  expect(await queryTransitionMessages(fake.$, { ...INTERVIEW, pending: 'next' })).toEqual(
    compactMessages(['W'], serviceNote('what-done', 'how', DIR)),
  );
});

test('closing HOW leaves both documents', async () => {
  const fake = fakeEngine({
    files: { [`${DIR}/journal.json`]: '[]', [`${DIR}/what.md`]: 'W', [`${DIR}/how.md`]: 'H' },
  });

  const messages = await queryTransitionMessages(fake.$, {
    ...INTERVIEW,
    phase: 'how',
    pending: 'next',
  });

  expect(messages.map((message) => message.text).slice(0, 2)).toEqual(['W', 'H']);
  expect(fake.runs.filter((argv) => argv[0] === 'rm')).toEqual([]);
});
