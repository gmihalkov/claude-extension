// What run.ts records about one live run and check.ts reads.
export type Run = {
  task: string;
  sessionId: string;
  transcript: string;
  interviewDir: string;
  interviewDirGone: boolean;
  hashesBefore: Record<string, string>;
  hashesAfter: Record<string, string>;
  gitBefore?: string;
  gitAfter?: string;
  violations: string[];
  costUsd: number;
  wallMs: number;
};
