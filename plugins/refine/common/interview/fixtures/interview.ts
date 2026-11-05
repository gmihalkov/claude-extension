import { HOME } from '../../engine/fixtures/home';
import { ROOT } from '../../engine/fixtures/root';
import { interviewDir } from '../helpers/interview-dir';
import type { Interview } from '../models/interview';

// An interview in phase WHAT, outside git, for tests.
export const INTERVIEW: Interview = {
  id: 's1',
  root: ROOT,
  dir: interviewDir(HOME, ROOT, 's1'),
  phase: 'what',
  task: 'add CSV export',
  isGit: false,
};
