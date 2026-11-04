import type { Register } from 'claude-code'

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'hello',
      description: 'Say hello from the gm marketplace',
    })

    return next(e)
  })

  on('command.run', { command: 'hello' }, () => ({
    text: 'Hello from gm.',
  }))
}
