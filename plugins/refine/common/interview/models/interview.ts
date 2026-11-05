import type { GitBaseline } from '../../git/models/git-baseline';
import type { Phase } from '../../phase/models/phase';
import type { Transition } from '../types/transition';

export type Interview = {
  id: string;
  root: string;
  dir: string;
  phase: Phase;
  task: string;
  isGit: boolean;
  baseline?: GitBaseline;
  pending?: Transition;
};
