# gm — personal Claude Code extensions

Private marketplace `gm` with my own mods and skills, synced between machines through this repository.

## Install on a machine

The repository is private and my SSH keys are split by host alias, so `/plugin install --marketplace <owner>/<repo>` cannot clone it. Clone it by hand and add the folder as a local marketplace:

```sh
git clone git@github.com-personal:gmihalkov/claude-extension.git ~/Dev/personal/claude-extension
claude plugin marketplace add ~/Dev/personal/claude-extension
claude plugin install hello@gm
```

Plugins are read straight from the folder. To update: `git pull`, then `/reload-plugins` in a session.

## Plugins

| Plugin   | What it is                                                           |
| -------- | -------------------------------------------------------------------- |
| `hello`  | Throwaway skeleton: a `/hello` command and a `greet` skill           |
| `refine` | Two-phase clarification interview (`/refine <task>`): WHAT, then HOW |
