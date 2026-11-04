# gm marketplace

This repository is the Claude Code marketplace `gm` (`.claude-plugin/marketplace.json`). Every plugin lives in `plugins/<name>/` and has an entry there with `"source": "./plugins/<name>"`.

## Layout of a plugin

- `.claude-plugin/plugin.json`: `name`, `version`, `description`.
- A mod: `hooks/hooks.json` (`{ "modules": ["./register.ts"] }`) and `hooks/register.ts` in TypeScript. A plugin has one hooks module, so separate mods are separate plugins.
- A mod that keeps values in `$.state`: `types/index.d.ts`, named in `plugin.json` as `"types"`.
- Skills: `skills/<skill>/SKILL.md`. A skill tied to a mod lives in that mod's plugin; general skills go in one shared skills plugin.
- A skill's name must differ from every slash command its plugin's mod registers: on a clash, `/<name>` runs the skill and the mod's command is never reached.
- Tests: `*.test.ts` in the plugin folder.

Adding a plugin means adding its folder, its entry in `marketplace.json` and its row in the README table.

## Checks

Run after every change:

```sh
claude plugin validate .                 # marketplace
claude plugin validate plugins/<name>    # manifest and hooks module
claude plugin test plugins/<name>        # *.test.ts
```

Type-check with `npx -p typescript tsc` and a tsconfig kept outside the repo, its `include` naming the engine's `claude-code.d.ts`, the plugin's `hooks/` and its `*.test.ts`. The plugin-authoring skill names the current path of `claude-code.d.ts` and the compiler options when it loads. The engine does not write `.claude-plugin/types/` for a plugin loaded from a marketplace or under `claude -p`.

The plugin directory's README, LICENSE and icon warnings do not apply: this marketplace is private.

## Running it

This folder is added as a local marketplace (`claude plugin marketplace add <this folder>`), so edits load after `/reload-plugins`.
