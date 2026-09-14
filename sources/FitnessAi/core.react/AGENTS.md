# Project Guidelines

## Role

Act as a professional senior React and TypeScript developer.

## Architecture

- Keep `src/app` for the application shell and top-level providers.
- Keep `src/pages` limited to route-level composition.
- Group domain behavior in `src/features/<domain>`; colocate its API clients, hooks, types, and feature-only components there.
- Put only cross-feature code in `src/shared`.
- Keep integrations and framework-independent libraries in `src/lib`.

## Localization

- Use `useI18n()` from `src/lib/i18n/useI18n.ts` for translated UI text.
- Add common English resources to `src/lib/i18n/resources/en/common.json` and their German equivalents to `src/lib/i18n/resources/de/common.de.json`.
- Use namespaced resource keys such as `common.appName`.
- Do not add duplicate nested keys when a flat key already represents the same text.
- The supported languages are `en` and `de`; default to `en`.

## Environment

- Put browser-visible configuration in `.env` with the `VITE_` prefix.
- Read the API base URL from `import.meta.env.VITE_API_BASE_URL`; do not hard-code API hosts in application code.

## Code Style

- Use TypeScript and function components.
- Follow the existing semicolon and double-quote formatting in source files.
- Use `const` by default. Use `let` only when the variable must be reassigned.
- Define functions with typed arrow-function expressions, for example `const myFunction = (): void => {}`; do not use function declarations.
- Prefer explicit types for component props, public functions, API boundaries, and complex state.
- Prefer `type` for object shapes; use `interface` only when declaration merging or extension is needed.
- Keep components small and focused; extract non-UI logic from components.
- Prefer an existing custom hook when it fits the need. Extract repeated or stateful React logic into a custom hook instead of duplicating it across components.
- Use `React.useCallback` for functions returned from custom hooks when consumers need stable references.
- Use `React.useMemo` for objects passed to other components when stable references prevent unnecessary rerenders.
- Keep hooks in a feature when they serve one domain; put cross-feature hooks in `src/shared/hooks`.
- Put pure functions shared by multiple features, such as `groupBy`, in `src/shared/utils`.
- Avoid `any`; use a specific type, `unknown`, or a generic type parameter instead.
- Keep React component modules limited to component exports to satisfy the Fast Refresh lint rule; place hooks and shared values in separate modules.

## UI Components

- Prefer Material UI for standard UI controls when it is available and appropriate; use semantic native HTML only when Material UI does not provide a suitable component.
- Build reusable application components in `src/shared/components` for UI patterns used across features.
- Do not import Material UI components directly in pages or features. Wrap them in local reusable components first, then consume those wrappers.
- Avoid inline styles. Use the stylesheet or component styling layer; use inline values only when styles must be computed at runtime and no suitable alternative exists.
- Design mobile-first: implement the small-screen layout as the baseline, then enhance it with responsive breakpoints for larger screens. Ensure text, controls, and touch targets remain usable at every viewport size.
- Use a modern, lightweight dark application theme. Light theme is not supported, including system-preference light-mode fallbacks.

## Validation

- Run `npm run build` after TypeScript or resource changes.
- Run `npm run lint` after source changes.
