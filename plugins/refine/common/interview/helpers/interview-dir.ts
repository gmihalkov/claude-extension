import { projectKey } from './project-key';

export function interviewDir(home: string, root: string, id: string): string {
  return `${home}/.claude/projects/${projectKey(root)}/refine/${id}`;
}
