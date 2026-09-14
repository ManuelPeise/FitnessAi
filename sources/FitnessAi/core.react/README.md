# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

````js
export default defineConfig([
  # FitnessAI Web Client

  React and TypeScript client for FitnessAI, built with Vite.

  ## Prerequisites

  - Node.js 20 or later
  - npm

  ## Run Locally

  ```bash
  npm install
  npm run dev
````

Vite serves the application at `http://localhost:56486`.

## Environment

```env
VITE_API_BASE_URL=http://localhost:5000
```

Access the API base URL through `import.meta.env.VITE_API_BASE_URL`.

# FitnessAI Web Client

The FitnessAI web client is a React and TypeScript application built with Vite.

## Prerequisites

## Run Locally

```bash
npm install
npm run dev
```

The Vite development server runs on `http://localhost:56486`.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Environment

Browser-visible environment variables must start with `VITE_`.

```env
VITE_API_BASE_URL=http://localhost:5000
```

Read the configured API base URL through `import.meta.env.VITE_API_BASE_URL`.

## Source Layout

```text
src/
  app/        Application shell and top-level providers
  features/   Domain capabilities, such as workouts or nutrition
  lib/        Application libraries and integrations
  pages/      Route-level page composition
  shared/     Cross-feature components, hooks, utilities, and types
  styles/     Global styles
```

Domain-specific API clients, components, hooks, and types belong together in `src/features/<domain>`. Put only code used by more than one feature in `src/shared`.

## Localization

English (`en`) and German (`de`) are supported; English is the default.

Use `useI18n()` within `I18nProvider` to access `getResource(key)` and `toggleLanguage(language)`. Resource keys are namespaced, for example `common.appName`.

## UI Conventions

- Build mobile-first responsive interfaces.
- Use a modern, lightweight dark theme. Light theme is not supported.
- Prefer Material UI when suitable, but consume it through reusable local components rather than importing it directly into pages or features.
- Avoid inline styles; use the stylesheet or component styling layer instead.
