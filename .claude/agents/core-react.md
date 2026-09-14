---
name: core-react
description: Specialized agent for the Core.React project (sources/FitnessAi/Core.React) — a Vite + React 19 + TypeScript web app. Use for implementing components, hooks, contexts, routing, and other frontend work in this project. Invoke proactively whenever a task's files live under sources/FitnessAi/Core.React.
tools: Read, Edit, Write, Glob, Grep, Bash
model: inherit
---

You work exclusively within `sources/FitnessAi/Core.React`, a Vite + React 19 + TypeScript single-page app that is part of the larger FitnessAi solution. Follow these project-specific conventions on top of the repo's root `CLAUDE.md` guidance.

## Structure

- `src/contexts/` — React context providers and their types (e.g. `Authentication/`, `types/`)
- `src/hooks/` — custom hooks, prefixed `use`
- `src/lib/` — app bootstrap and cross-cutting modules (`AppStart.tsx`, `navigation/`)
- `src/assets/` — static assets

## Imports

- All imports of project files use the `src/` path alias, not relative traversal — e.g. `import { AppUser } from "src/contexts/types/AppUser"`, never `../types/AppUser` or `./AppUser`.
- The alias is wired in both `tsconfig.app.json` (`paths: { "src/*": ["./src/*"] }`) and `vite.config.ts` (`resolve.alias`). If you add a new top-level folder under `src/`, no alias changes are needed — only paths outside `src/` would require touching config.

## TypeScript

- `tsconfig.app.json` has `strict: true` plus explicit hardening: `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, etc. Write code that satisfies these without loosening them — don't add `// @ts-expect-error` or weaken compiler options to work around a type error; fix the type.
- `noUnusedLocals` and `noUnusedParameters` are on: unused imports, variables, and parameters are build errors (`tsc -b` fails, exit code non-zero), not warnings. Remove unused code rather than leaving it — never suppress with `// @ts-ignore` or an underscore prefix unless a parameter is intentionally unused (e.g. an unused callback arg required by a signature), in which case prefix it with `_`.
- Verify changes with `npx tsc -b --force` (from `Core.React/`) before considering work done.

## Conventions

- PascalCase for components/types, camelCase for variables/functions/props, hooks prefixed `use`.
- Keep components/functions short (~20 lines); extract sub-components or helpers when exceeding this.
- Functional components with typed props (`type XProps = { ... }`), not `React.FC`.
- Follow existing ESLint/Prettier config — run `npm run lint` after changes and fix any violations rather than suppressing rules.
- `@typescript-eslint/no-unused-vars` is configured as `"error"` (base `no-unused-vars` is off) — unused imports, variables, and args fail lint. Only a `_`-prefixed name is exempt (for intentionally-unused params); don't add eslint-disable comments to work around it.
- No default exports mixed inconsistently — match the existing file's export style (contexts/hooks in this repo currently use default exports for the main symbol).

## Verification

Before reporting work as done, run from `Core.React/`:
```
npx tsc -b --force
npm run lint
```
Both must pass clean. For UI-visible changes, prefer starting `npm run dev` and checking the rendered result over assuming correctness from types/lint alone.
