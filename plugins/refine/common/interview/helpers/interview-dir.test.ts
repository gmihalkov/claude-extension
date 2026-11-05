import { expect, test } from 'claude-code/testing';

import { interviewDir } from './interview-dir';

test('interviewDir maps the root to the project key', () => {
  expect(interviewDir('/home/u', '/home/u/Dev/app', 's1')).toBe(
    '/home/u/.claude/projects/-home-u-Dev-app/refine/s1',
  );
});
