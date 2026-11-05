declare module 'claude-code' {
  interface PluginState {
    refine: {
      // Whether a person is at the prompt: a `-p` run cannot start a turn from a typed command.
      isInteractive: boolean;
    };
  }
}
