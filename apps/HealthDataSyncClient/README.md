# HealthDataSyncClient

React Native client of the **FitnessAi** solution. It reads health and fitness
data from **Android Health Connect**, lets the user decide _which_ data is
exported and _how it is named_ on the server, and syncs it to the FitnessAi
backend on a user-defined schedule.

> `agent.md` in this folder holds the coding rules and conventions.
> This file describes _what the project is and how it works_.

---

## 1. Context in the monorepo

```
D:\dev\FitnessAi
├─ apps\
│  └─ HealthDataSyncClient\     ← this app (React Native, Android-first)
└─ sources\FitnessAi\           ← .NET backend solution (FitnessAi.slnx)
   ├─ Core.Api\                 ← REST API consumed by this client
   ├─ Core.Web\                 ← Razor web frontend
   ├─ Logic.Services\           ← Authentication, DataImport, Seed
   ├─ Data.Accessor\ Data.Database\
   └─ Shared.Models\ Shared.Enums\ Shared.Interfaces\
```

The client talks to `Core.Api`. During development the base URL is
`http://localhost:5016/api/` (`src/lib/services/api/axiosClient.ts`).

Android package / applicationId: `com.healthdatasyncclient`.

---

## 2. Purpose and domain model

Health Connect exposes raw records from many _data origins_ (Fitbit, Garmin,
Samsung Health, Google Fit, …) across many _record types_ (Steps, HeartRate,
SleepSession, Nutrition, …). The backend needs stable, agreed-upon names.

The client therefore maintains two kinds of **mappings**, both stored in the
local `mapping_entries` table and distinguished by `type`:

| Mapping type          | `source`                             | `target`            |
| --------------------- | ------------------------------------ | ------------------- |
| `HealthConnectOrigin` | Health Connect `metadata.dataOrigin` | backend origin name |
| `HealthConnectMetric` | Health Connect `RecordType`          | backend metric name |

Each mapping has an `isActive` flag — **inactive mappings are not exported**.
Mappings are discovered automatically ("Initialize Mapping" button) and then
edited by the user in a modal.

**Schedules** (`schedule_settings` table, one row per `ScheduleSettingsType`)
control when an export runs: `daily` / `hourly` / `weekly`, plus hour, minute,
day-of-week and an `isActive` flag. Fields that are irrelevant for the selected
frequency are normalized on save (`hourly` resets day and hour, `daily` resets
day), so a stored row never hides stale values behind a disabled input. Two
schedule types exist: `HealthConnectExerciseDataExport` and
`HealthConnectHealthDataExport`.

---

## 3. Architecture

Strict layering — UI never touches SQLite or the Health Connect SDK directly.

```
screens / components          presentation only
        │
     hooks                    state, orchestration, view-model shaping
        │
   lib/services + lib/database side effects (SDK, SQLite, HTTP, keychain)
        │
   native modules             op-sqlite, health-connect, keychain
```

### Runtime composition (`App.tsx`)

```
AuthenticationProvider          reads tokens from keychain → isAuthenticated
└─ SafeAreaProvider
   └─ AppNavigator
      └─ NavigationContainer
         └─ HealthConnectProvider    initializes the Health Connect SDK
            └─ isAuthenticated ? AppStackNavigator : AuthNavigator
```

`App.tsx` also kicks off `databaseAccessor.initializeDatabase()` (migrations)
on mount; failures are logged, not fatal.

### Navigation tree

```
AuthNavigator (native-stack)
└─ Login                              LoginScreen

AppStackNavigator (native-stack)
├─ Dashboard                          HealthConnectDashboard   (header hidden)
└─ HealthConnect                      HealthConnectTabNavigator (header shown)
   └─ bottom tabs
      ├─ Origins      icon "source"    HealthConnectOriginMapping
      ├─ Metrics      icon "dataset"   HealthConnectMetricMapping
      └─ Schedule     icon "schedule"  HealthConnectScheduleSettings
```

Route names, param lists and `NativeStackScreenProps` aliases live in
`src/navigation/navigationTypes.ts`.

`HealthConnectOriginMapping` and `HealthConnectMetricMapping` are thin wrappers
that render the shared `HealthConnectMapping` component with a different
`type` / `title`.

---

## 4. Key modules

### `lib/database/`

| File                   | Responsibility                                                                                        |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| `database.ts`          | `op-sqlite` handle + `databaseAccessor` (`schedule`, `mappingTable`) — the only place SQL is executed |
| `databaseTypes.ts`     | TS row models + `createDatabaseScript` (full DDL, indexes, `updated_at` triggers)                     |
| `databaseMigration.ts` | `PRAGMA user_version` based migration runner                                                          |

Database file: `healthdata.db`. Current `latestDatabaseVersion` = **3**.

Tables: `mapping_entries`, `api_authentication`, `schedule_settings`.
Row mapping is explicit — DB columns are `snake_case`, models are `camelCase`,
and booleans are stored as `0`/`1`.

`schedule_settings` columns: `id`, `type`, `is_active`, `hour`, `minute`,
`frequency`, `day_of_week`, `last_executed_at` (NULL until an export runs),
`created_at`, `updated_at` (trigger-maintained), with `UNIQUE (type)` backing
the `ON CONFLICT(type) DO UPDATE` upsert in `saveSchedule`.

Migration v3 rebuilds `schedule_settings` (rename → create → copy → drop). It
inspects `PRAGMA table_info` first, so it tolerates the legacy `interval` and
`day` columns, a missing `is_active`, and the `'Daily'` frequency value written
by the older v1 → v2 branch.

### `lib/services/healthConnect/`

| File                           | Responsibility                                                                                                                                                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `healthConnectService.ts`      | Singleton wrapping the SDK: lazy `initialize`, SDK availability, the `requiredHealthConnectPermissions` list (39 read record types), permission request/verify, `readMetric` / `readLastMetric` / `readSteps` / `readExerciseSessions` / `readData`, and `getAvailableOrigins` |
| `healthConnectMetricMapper.ts` | Pure record → `{ startTime, endTime, metricName, value, unit }[]` flattening for every supported record type, including per-nutrient expansion of `Nutrition`                                                                                                                  |
| `healthConnectTypes.ts`        | `HealthConnectPermission`, `HealthConnectReadRange`, `HealthConnectData`                                                                                                                                                                                                       |

`getAvailableOrigins` reads every permitted record type and swallows individual
failures so one denied permission cannot block origin discovery.

The permission list **must stay in sync** with
`android/app/src/main/AndroidManifest.xml`, which declares the 36 matching
`android.permission.health.READ_*` entries (some permissions cover more than
one record type, e.g. `READ_STEPS` covers `Steps` and `StepsCadence`), the
`androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE` intent filter, the
`ViewPermissionUsageActivity` alias and the
`com.google.android.apps.healthdata` package query.

### `lib/services/api/`

| File             | Responsibility                                                                                                                                                                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `axiosClient.ts` | Authenticated `apiClient`: request interceptor injects the bearer token, response interceptor refreshes on `401` via a single shared `refreshPromise` and retries once (`_retry`); clears both tokens if refresh fails |
| `apiService.ts`  | Low-level `fetch` wrapper returning `ApiResult<T> = { data, error? }` — never throws                                                                                                                                   |

### `lib/services/storage/secureStorage.ts`

Keychain wrapper. Keys are the `SecureStorageKeys` enum (`ACCESS_TOKEN`,
`REFRESH_TOKEN`) used as the keychain `service`. **Tokens live here only.**

### Hooks

| Hook                          | Purpose                                                                                                                                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useAuthenticationContext`    | Consumer for `AuthenticationContext`                                                                                                                                                              |
| `useHealthConnextContext`     | Consumer for `HealthConnectContext` (note the typo in the name)                                                                                                                                   |
| `useHealthConnectMappings`    | Loads mappings for a type, discovers new origins/metrics, drives the edit modal, persists updates                                                                                                 |
| `useScheduleSettings`         | Loads/saves a schedule, normalizes fields per frequency, tracks `isModified` against the persisted row, exposes `isLoading`/`isSaving`/`error`, builds day/frequency/hour/minute dropdown options |
| `useSecureStorage<TModel>`    | JSON-serialising view over `secureStorage`                                                                                                                                                        |
| `useApi<TRequest, TResponse>` | `apiService` wrapper with `data` / `isLoading` / `error`                                                                                                                                          |
| `useComponentInitialization`  | Runs an async initializer once and exposes `{ isInitialized, props }`                                                                                                                             |

### Shared UI

`components/inputComponents/` — `ButtonComponent`, `TextField`, `Dropdown`
(wraps `@react-native-picker/picker`), `SwitchComponent`.
`components/IconComponent.tsx` wraps Material icons.
Colors come from `lib/styles/colorMap.ts`; container layout from
`lib/styles/globalStyles.ts`.

---

## 5. Typical flows

**Login** — `LoginScreen` → `handleLogin` → tokens written to keychain →
`isAuthenticated` flips → `AppStackNavigator` mounts.
_Currently stubbed_: the API call is commented out and literal placeholder
tokens are stored.

**Mapping initialization** — user opens Origins/Metrics tab → "Initialize
Mapping" → `useHealthConnectMappings` reads existing rows, asks
`healthConnectService` for available origins (or granted record types), inserts
only the entries that do not exist yet with `isActive: false` and an empty
`target`, then re-reads the table.

**Mapping edit** — tap an item → modal → toggle active / edit source+target →
Save enabled only when modified _and_ `target` is non-empty → `updateMapping`
persists and returns the refreshed list.

**Schedule edit** — `useScheduleSettings` loads the row (or a `daily 00:00`
default), the user toggles Active and edits via dropdowns, `isModified`
compares the current draft field-by-field against the persisted row, and Save
normalizes the draft before upserting through `ON CONFLICT(type) DO UPDATE`,
then resyncs state from the row that was actually written.

---

## 6. Development

Prerequisites: Node `>= 22.11.0`, JDK + Android SDK, an Android device or
emulator with **Health Connect** installed, and the backend `Core.Api` running.

```bash
npm install
npm start            # Metro
npm run android      # build + install on device/emulator
npm run lint         # ESLint (0 errors expected)
npx tsc --noEmit     # type check
npm test             # Jest
```

Health Connect is Android-only. The iOS project builds, but every Health
Connect feature is unavailable there.

Because `ApiBaseUrl` is `http://localhost:5016`, a physical device needs
`adb reverse tcp:5016 tcp:5016` (or a LAN URL). `usesCleartextTraffic` is
enabled for debug builds.

To inspect the local DB, pull `healthdata.db` from the app sandbox with
`adb exec-out run-as com.healthdatasyncclient ...`.

---

## 7. Current state

Implemented: Health Connect init/permissions/reads, origin & metric mapping
CRUD with local persistence and migrations, schedule configuration UI, secure
token storage, axios client with refresh-and-retry, metric flattening mapper.

Not implemented yet:

- Real login against `Core.Api` (`AuthenticationContentProvider` stores literal
  `'token'` / `'refreshToken'` and logs the request).
- The actual **export/sync job** — nothing consumes `healthConnectMetricMapper`
  or executes a schedule yet; `last_executed_at` is never updated.
- `apiService` bypasses `apiClient`, so it sends no `Authorization` header and
  calls `new URL()` on a relative path.

Known defects worth knowing before you touch these files:

- `__tests__/App.test.tsx` fails: Jest does not transform the ESM build of
  `@react-navigation/*` (`transformIgnorePatterns` needs widening).
