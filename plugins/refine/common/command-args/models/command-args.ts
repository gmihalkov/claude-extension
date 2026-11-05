// What `/refine <args>` asks for.
export type CommandArgs =
  | { kind: 'start'; task: string }
  | { kind: 'continue' | 'restart' | 'next' | 'back' }
  | { kind: 'empty' };
