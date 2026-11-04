# Contributing

Rules for the agent that develops mods and skills in this repository.

## Requirements

- [Claude Code](https://code.claude.com), signed in: `just code-test`, `just verify` and `just types-update` run the `claude` CLI.
- [just](https://just.systems): runs every command below.
- [Bun](https://bun.sh): `bunx` runs Prettier, Biome and TypeScript at their pinned versions.
- Git with access to this private repository on GitHub.

## Commands

Every command runs through `just` and covers the whole repository. Tools run through `bunx` at the versions pinned in the `justfile`; there is no `package.json`.

| Command | What it does |
| --- | --- |
| `just docs-format` | Formats every Markdown file with Prettier. |
| `just docs-verify` | Checks that every Markdown file is formatted. |
| `just code-format` | Formats code and JSON with Biome, sorts imports and applies safe fixes. |
| `just code-lint` | Checks formatting, imports and lint without writing. |
| `just code-typecheck` | Type-checks every plugin with `tsc` against `types/engine/`. |
| `just code-test` | Runs `claude plugin test` for every plugin that has tests. |
| `just code-verify` | `code-lint`, `code-typecheck` and `code-test`. Run it while working. |
| `just verify` | `docs-verify`, `code-verify` and `claude plugin validate` for the marketplace and every plugin. Run it before every commit. |
| `just types-update` | Regenerates `types/engine/` from the installed Claude Code. Run it after Claude Code updates. |

A warning is an error: `code-format` and `code-lint` fail on any warning.

The plugin directory's README, LICENSE and icon warnings from `claude plugin validate` do not apply: this marketplace is private.

## Formatting

- Prettier formats Markdown, including `SKILL.md`. Biome formats TypeScript and JSON.
- After `just code-format`, re-read the changed code and apply the rules below by hand. Biome does not enforce them, and an expression can become multi-line only after formatting.

## Imports

Group imports in this order, with a blank line between groups. `just code-format` sorts them.

1. Built-in modules: `node:*`, `bun:*`, `claude-code`, `claude-code/*`.
2. Packages.
3. Root aliases: `@/*`.
4. Parent folders: `../*`.
5. The same folder: `./*`.

## Code style

- A control statement always has a block. `if (condition) return true` is forbidden:

  ```ts
  if (condition) {
    return true;
  }
  ```

  `just code-format` adds missing braces.

- Put a blank line before and after every control statement: `if`, `for`, `while`, `switch`, `try`, `return`, `throw`, `break`, `continue`. A statement that opens or closes a block needs no blank line on that side.
- Put a blank line before and after every multi-line expression or statement.
- Write a nested object across lines, starting a new line after each `{`. `{ foo: { bar: { baz: {} } } }` is forbidden:

  ```ts
  const value = {
    foo: {
      bar: {
        baz: {},
      },
    },
  };
  ```

  Biome keeps an object multi-line once its first property starts on a new line.
