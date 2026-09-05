# agent.md — HealthDataSyncClient

## Role

Act as a **Senior React Native Developer**. Produce production-quality, typed,
idiomatic React Native code. Prefer small, surgical changes that match the
existing patterns in this app over refactors nobody asked for.

## Project

`HealthDataSyncClient` is the mobile client of the **FitnessAi** monorepo
(`D:\dev\FitnessAi`, apps + sources). It reads health/fitness data from
**Android Health Connect**, lets the user map data origins and metrics to
backend targets, persists everything in a **local SQLite database**, and syncs
to the FitnessAi backend API on a configurable schedule.

Primary platform is **Android** (Health Connect is Android-only). iOS project
files exist but Health Connect features are not available there.

## Stack

| Area         | Choice                                                                              |
| ------------ | ----------------------------------------------------------------------------------- |
| Framework    | React Native `0.87.1`, React `19.2.3`, TypeScript `^6`                              |
| Navigation   | `@react-navigation/native` v7 (native-stack + bottom-tabs)                          |
| Local DB     | `@op-engineering/op-sqlite`                                                         |
| Health data  | `react-native-health-connect` v4                                                    |
| Secure store | `react-native-keychain` (`getGenericPassword`, keyed by `service`)                  |
| HTTP         | `axios` (`apiClient`) and `fetch` (`apiService`)                                    |
| UI           | plain RN components, `StyleSheet`, `react-native-safe-area-context`                 |
| Icons        | `@react-native-vector-icons/material-icons`                                         |
| Tooling      | ESLint (`@react-native` + `@typescript-eslint/recommended`), Prettier `2.8.8`, Jest |

Node `>= 22.11.0`.

## Commands

Run from `apps/HealthDataSyncClient`:

```bash
npm start            # Metro bundler
npm run android      # build + run on Android device/emulator
npm run ios          # build + run on iOS simulator
npm run lint         # eslint .
npm run lint:quiet   # eslint . --quiet (errors only)
npm test             # jest
```

There is no `typecheck` script — use `npx tsc --noEmit` when type coverage
matters. Always run `npm run lint` after changing source files.

## Folder structure

```
App.tsx                     root: providers + DB init
index.js                    RN entry point
src/
  components/               reusable, screen-agnostic UI
    contextProviders/       React context providers
    inputComponents/        Button, TextField, Dropdown, Switch
  hooks/                    reusable hooks (use*)
  lib/
    database/               op-sqlite accessor, migrations, table types + DDL
    services/
      api/                  axiosClient (interceptors) + apiService (fetch)
      healthConnect/        healthConnectService, metric mapper, types
      storage/              secureStorage (keychain wrapper)
    styles/                 colorMap, globalStyles
    utils.ts                small pure helpers
  navigation/               navigators + navigationTypes
  screens/                  one folder per feature area
    <feature>/components/   components used only by that feature
__tests__/                  Jest tests
```

Place new code by responsibility: **screen-specific components** go in
`screens/<feature>/components/`, anything reused across screens goes in
`src/components/`.

## Conventions

### TypeScript / React

- Function components typed as `React.FC` (with `React.FC<IProps>` when props
  exist); default-export the component at the bottom of the file.
- Props interfaces are named `IProps` (or `I<Name>Props` for providers) and
  declared directly above the component.
- Prefer namespaced React usage: `React.useState`, `React.useCallback`,
  `React.useEffect`, `React.useRef`. (`import { useState }` exists in older
  files; do not spread it further.)
- Union string literal types over enums for domain values
  (`ScheduleFrequency`, `HealthConnectMappingType`). `SecureStorageKeys` is the
  one deliberate `enum`.
- No path aliases are configured — use relative imports.
- `any` is a lint error — see Linting below.

### Linting

`.eslintrc.js` extends `@react-native` and adds, for `*.ts` / `*.tsx` only:

- `plugin:@typescript-eslint/recommended` — notably `no-explicit-any`,
  `no-unused-vars`, `no-empty-object-type` are **errors**.
- `react-native/no-inline-styles: 'error'` — the shared React Native config
  turns this rule off for TypeScript files, so it is re-enabled explicitly.

Consequences for new code:

- Never pass an object literal with literal values to `style`. Put it in
  `StyleSheet.create` and compose with the array form.
- Never use `any`. Use `unknown` plus narrowing (`error instanceof Error`),
  or a proper generic.
- Use `React.PropsWithChildren` directly instead of an empty interface
  extending it.

### Styling

- `StyleSheet.create` at the bottom of the component file, named `styles`.
- Colors come from `lib/styles/colorMap.ts`; shared layout from
  `lib/styles/globalStyles.ts`. **Do not hardcode hex colors** in new code.
- Conditional styles via array syntax: `style={[styles.button, { ... }]}`.

### Hooks

- One hook per file, filename equals hook name (`useHealthConnectMappings.ts`).
- Export an explicit return type (`UseXReturnType`) for non-trivial hooks.
- Wrap returned callbacks in `React.useCallback`.
- Hold service/DB singletons in `React.useRef` when used inside callbacks.
- Mount-only effects use `// eslint-disable-next-line react-hooks/exhaustive-deps`
  with an empty dep array — keep this deliberate and rare.

### Context

- Provider file lives in `components/contextProviders/`, exports both the
  context and the provider.
- The matching consumer hook lives in `src/hooks/` (e.g.
  `useAuthenticationContext.ts`) and throws/guards when used outside its
  provider.
- Provider nesting order in `App.tsx`: `AuthenticationProvider` →
  `SafeAreaProvider` → `AppNavigator`, with `HealthConnectProvider` inside
  `NavigationContainer`.

### Navigation

- Param lists, route-name constants (`as const`) and `NativeStackScreenProps`
  aliases live in `navigation/navigationTypes.ts`. Add new routes there first,
  then wire the navigator.
- Auth gating happens in `AppNavigator` via `isAuthenticated` / `isInitializing`.

### Database

- All SQL goes through `databaseAccessor` in `lib/database/database.ts`,
  grouped by domain (`schedule`, `mappingTable`). Screens and hooks never call
  `database.execute` directly.
- Columns are `snake_case`; TS models are `camelCase`. Map explicitly in the
  accessor (see `mapMappingEntryRow`), and convert booleans with
  `isActive ? 1 : 0` / `Boolean(row.is_active)`.
- **Always use parameterized queries** (`?` placeholders). Never interpolate
  user or record data into SQL strings.
- Schema changes: bump `latestDatabaseVersion` in `databaseMigration.ts`, add
  a migration branch for the previous version, and update
  `createDatabaseScript` in `databaseTypes.ts`. Migrations run from
  `App.tsx` via `databaseAccessor.initializeDatabase()`.
- Mutating accessor methods return the refreshed list so callers can set state
  directly.

### Health Connect

- Use the `healthConnectService` singleton; never import
  `react-native-health-connect` in components or hooks.
- The service owns initialization (`ensureInitialized`), permission checks and
  reads. Add new record types to `requiredHealthConnectPermissions`.
- A missing permission for one metric must never break the others — swallow
  per-metric read errors like `getAvailableOrigins` does.

### API / auth

- `axiosClient.ts` owns the authenticated client: request interceptor attaches
  the bearer token, response interceptor refreshes on 401 with a single shared
  `refreshPromise` and one `_retry` per request.
- Tokens live **only** in `secureStorage` (keychain). Never persist tokens in
  SQLite, AsyncStorage or component state.
- `apiService.ts` is a lower-level `fetch` wrapper returning
  `ApiResult<TResponse>` (`{ data, error? }`) — it does not throw.
- `ApiBaseUrl` defaults to `http://localhost:8080/api/`; keep it
  configurable-friendly and never commit real hosts or secrets.

### Logging / errors

- `console.error` for failures, no crash on background init failures.
- Never `console.log` tokens, credentials or raw health records.

## Definition of done

1. `npm run lint` passes with no new warnings (0 errors required).
2. `npx tsc --noEmit` is clean for touched files.
3. `npm test` passes when tests exist for the touched area.
4. Prettier formatting matches `.prettierrc.js`
   (single quotes, trailing commas, `arrowParens: 'avoid'`).
5. New DB columns/tables come with a migration and a version bump.
6. No hardcoded colors, secrets, or direct `database.execute` outside the
   accessor.

## Known debt (don't extend, fix when nearby)

- `AuthenticationContentProvider` logs the login request and stubs the API call
  with literal `'token'` / `'refreshToken'` values.
- `apiService` uses `new URL(serviceUrl)` with relative paths and bypasses
  `apiClient`, so it sends no auth header.
- `useApi` fires a GET on mount unconditionally.
- `databaseTypes.ts` DDL, `databaseMigration.ts` and the `schedule` accessor
  agree on `schedule_settings` as of DB version 4 — keep them in sync when
  adding columns.
- `useScheduleSettings` returns a nullable `schedule` plus `isLoading` /
  `isSaving` / `error`; the screen must guard the null case.
- `HealthConnectOriginMapping.tsx` and `HealthConnectMetricMapping.tsx` are
  identical apart from the `type`/`title` props.
- `__tests__/App.test.tsx` fails: Jest does not transform the ESM build of
  `@react-navigation/*` (`transformIgnorePatterns` needs widening).
- Open lint warnings: `@typescript-eslint/no-shadow` in `useScheduleSettings`,
  `react/no-unstable-nested-components` (×3) in `HealthConnectTabNavigation`.
- `README.md` documents the project itself (purpose, architecture, flows,
  current state). Keep it in sync when you change architecture or fix an item
  listed under "Current state".
