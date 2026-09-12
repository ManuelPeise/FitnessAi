# FitnessAi

Fitness tracking solution with an AI-driven training data pipeline. It consists of a .NET 10 backend (API + web) and a React Native mobile client that syncs health data from the device to the backend.

## Solution overview

| Part | Tech | Location |
|---|---|---|
| Backend API | ASP.NET Core (.NET 10), EF Core, MySQL | `sources/FitnessAi/` |
| Web app | ASP.NET Core Razor/MVC | `sources/FitnessAi/Core.Web` |
| Mobile client | React Native 0.87, React 19, TypeScript | `apps/HealthDataSyncClient/` |
| Infra | Docker Compose (MySQL + API) | `sources/FitnessAi/docker-compose.yml` |

## Backend architecture

The backend solution (`sources/FitnessAi/FitnessAi.slnx`) is layered:

- **01 Core**
  - `Core.Api` — ASP.NET Core Web API, JWT bearer auth (access + rotating refresh tokens), Quartz scheduled jobs, Swagger. Controllers:
    - `Ai/AiTrainingDataGenerationController` — triggers/generates AI training data from imported health data
    - `Authentication/UserAuthenticationController` — login (`AuthenticateUser`/`AuthenticateUserOnMobile`) and `RefreshToken` (exchanges a valid, unexpired refresh token for a new access token, rotating the refresh token)
    - `Authentication/CurrentUserController` — current-user info
    - `Import/HealthConnectImportController` — ingests health data exported from the mobile client (Health Connect), batched to avoid per-record DB round trips
    - `Scheduler/ScheduledTaskController` — processes pending scheduled jobs (invoked by Quartz's own cron trigger — runs server-side independent of any client)
    - `Seed/UserSeedController` — dev/test data seeding
  - `Core.Web` — server-rendered ASP.NET Core web app (Razor Pages under `Pages/`, including `Authentication` and `Shared` layouts)
- **02 Logic**
  - `Logic.Ai` — AI/training-data logic:
    - `Training/AiTrainingDataBuilder` (`IAiTrainingDataBuilder`) turns imported `HealthConnect` data (workouts, laps, segments, HR/power/speed averages) into `HealthConnectAiTrainingDataEntity` rows
    - `Training/ModelTrainers/ModelTrainingDataLoader` (`IModelTrainingDataLoader`) loads that AI training data, optionally filtered by user/exercise type
    - `Training/ModelTrainers/ModelTrainingDataConverter` (`IModelTrainingDataConverter`) converts loaded entities into flat ML feature models — `GlobalAiTrainingDataModel` (cross-user) or `UserAiTrainingDataModel` (per-user)
    - `Training/ModelTrainers/AiModelLifecycleService` (`IAiModelLifecycleService`) manages trained-model versioning per `(UserId, ModelType, ExerciseType)`: resolves the current active model, and on a new model deactivates the previous one, persists the new one, and activates it — never deletes history
    - `Training/ModelTrainers/AiModelTrainer` (`IAiModelTrainer`) orchestrates the above (load → convert → resolve/persist active model) as the integration point for an actual ML.NET training step
  - `Logic.Parsing` — CSV import parsing (`CSV/`, with format enums under `CSV/Enums`)
  - `Logic.Services` — `Authentication` (login + refresh-token issuance/rotation), `DataImport` (batched Health Connect + Nutrition import), `Scheduler`, `Seed` services that back the API controllers
  - `Logic.Shared` — cross-cutting logic (handlers, shared interfaces)
- **03 Data**
  - `Data.Accessor` — repository interfaces/implementations sitting on top of EF Core
  - `Data.Database` — EF Core `DbContext`, entities, and migrations (MySQL via `MySql.EntityFrameworkCore`). Entity groups:
    - `Entities/User` — `UserEntity`, `UserCredentialsEntity` (password hash + rotating refresh token and its expiry), `UserBodyDataEntity`
    - `Entities/HealthConnect` — raw imported health data: workouts, laps, segments, averages, blood pressure, time zones, units/values (unique indexes on `DataKey` for fast import dedup)
    - `Entities/Nutrition` — daily nutrition macros (`NutritionDataEntity` + `NutritionValuesEntity`: calories, protein, carbs, fat, fiber, sugar)
    - `Entities/Ai` — derived AI training data (`HealthConnectAiTrainingDataEntity` + laps/segments) built from `HealthConnect` entities, plus the AI model lifecycle tables: `AiModelEntity` (metadata: `ModelId` GUID, `ModelType`, `ExerciseType`, `Version`, `IsActive`, owning `UserId`) and `AiModelBinaryEntity` (the model blob, kept in a separate table so ordinary lookups never load it)
    - `Entities/Scheduler` — `ScheduledJobEntity` for Quartz-backed jobs
    - `Entities/Settings` — `SettingsEntity`, `AISettingsEntity`
- **04 Shared** — `Shared.Enums` (including `Ai/AiModelTypeEnum`), `Shared.Interfaces`, `Shared.Models` — enums, contracts, and DTOs shared across API, logic, and data layers (also paired 1:1 with the mobile client's TS import types — see [Client/backend model sync](#clientbackend-model-sync))
- **05 Tests** — `AiUnitTests`

Each layer registers its own dependencies via a `DI` folder/project; the app is composed through constructor injection (see `CLAUDE.md` for conventions).

### Data flow (high level)

1. Mobile client reads raw health data (and daily nutrition macros) via Health Connect and syncs it to `Core.Api` (`Import/HealthConnectImportController`), in chunked requests rather than one giant payload.
2. `Logic.Services.DataImport` batch-fetches existing rows by key (one query per batch, not per record) and persists into the `HealthConnect`/`Nutrition` entity tables via `Data.Accessor`/`Data.Database`.
3. `Logic.Ai.Training.AiTrainingDataBuilder` transforms `HealthConnect` data into `Ai` entities (training data, laps, segments) for downstream AI/training use, either on demand (`AiTrainingDataGenerationController`) or via a scheduled job (`Logic.Services.Scheduler` + Quartz, tracked in `ScheduledJobEntity` — this scheduling loop is entirely server-side and keeps running regardless of whether the mobile app is open).
4. `Logic.Ai`'s model-training pipeline (`ModelTrainingDataLoader` → `ModelTrainingDataConverter` → an ML.NET training step, not yet implemented → `AiModelLifecycleService`) turns that AI training data into a versioned, activatable trained model per user/exercise type.
5. A second, chained scheduled job then predicts each workout's intensity (Easy/Medium/Hard) with a trained ML.NET classifier and writes it back onto both the `Ai` and raw `HealthConnect` training data tables — see `sources/FitnessAi/docs/AIReadme.en.md` (or `AIReadme.de.md` for German) for the full pipeline write-up.

## Mobile client

`apps/HealthDataSyncClient` is a React Native + TypeScript app that:

- Reads health data (including daily nutrition macros) via `react-native-health-connect` and syncs it to the backend
- Syncs in the background via `react-native-background-fetch`, including when the app has been fully closed/killed:
  - Android: `stopOnTerminate: false`, `startOnBoot: true`, `enableHeadless: true`, and `BackgroundFetch.registerHeadlessTask` wired in `index.js` — the native library's own manifest (auto-merged at build time) already declares the boot receiver and job service it needs
  - iOS: `Info.plist` declares `UIBackgroundModes` (`fetch`, `processing`) and `BGTaskSchedulerPermittedIdentifiers`, required for iOS to invoke background fetch at all. Apple platform limitation with no code workaround: if the user manually force-quits the app on iOS, background fetch will not run until they reopen it — Android's `stopOnTerminate: false` avoids the equivalent restriction there (modulo aggressive OEM battery managers like MIUI/Huawei, which require the user to whitelist the app)
- Stores auth/mapping/schedule config locally with SQLite (`@op-engineering/op-sqlite`) under `src/lib/database` — it does not cache the imported health data itself, that's read fresh from Health Connect each sync
- Talks to the backend through `src/lib/services/api/axiosClient.ts`: attaches the stored access token to every request, and on a `401` transparently calls the backend's refresh-token endpoint, retries the original request, and persists the rotated tokens; if the refresh token itself is invalid/expired, it notifies `AuthenticationContentProvider` (the auth state provider — `src/components/contextProviders/AuthenticationContentProvider.tsx`) to log the user out
- Handles auth via `react-native-keychain` for secure token storage
- Reusable, non-UI import/scheduling logic lives in `src/lib/utils.healthConnect.ts` (parallel metric-fetch helper — replaced a sequential per-metric `await` chain that was the main cause of a slow 365-day initial import) and `src/lib/utils.Scheduler.ts` (date-range chunking, initial-load-vs-incremental date math), alongside the general-purpose `src/lib/utils.ts`
- Screens (`src/screens/`):
  - `auth/LoginScreen` — login flow
  - `dashboard/HealthConnectDashboard` — overview of synced health data
  - `healthConnect/HealthConnectOriginMapping` — map data source/origin to backend entities; its edit modal also manages each origin's referenced metrics inline (target rename, active toggle, search) — the standalone Metric Mapping screen was folded into this
  - `healthConnect/HealthConnectScheduleSettings` — configure background sync schedule
- Colors: `src/lib/styles/colorMap.ts` holds the semantic palette plus a small `mappingStatusColorMap`/`getMappingStatus` helper (active/inactive/unmapped) used for mapping-list status icons
- Navigation via `@react-navigation` (native-stack + bottom-tabs), context providers under `src/components/contextProviders`, reusable inputs under `src/components/inputComponents`

### Client/backend model sync

Client TS payload types (`src/lib/services/healthConnect/healthConnectTypes.ts`) are paired 1:1 with backend DTOs (`Shared.Models/HealthConnect/ImportModels/`). Each pair has a hand-maintained field-name manifest at `apps/HealthDataSyncClient/scripts/model-sync-manifests/<TypeName>.json`; `npm run check:models-sync` diffs the client type's fields against the manifest and fails if they drift. This is a manual-diff check, not codegen — update the manifest by hand whenever a backend DTO's fields change.

## Running locally

### Backend (Docker)

```bash
cd sources/FitnessAi/scripts/docker
./up.ps1      # builds and starts MySQL + API via docker compose
./update.ps1  # rebuild/update the running stack
./clean.ps1   # tear down the stack
```

This starts:
- MySQL on `localhost:3306` (db `AiDbContextDb`, user `DevUser`)
- API on `http://localhost:8080`

Alternatively, run `Core.Api` / `Core.Web` directly from the IDE (or `dotnet run`) against a local MySQL instance — see `Core.Api/appsettings.json` for the connection string and JWT settings (`AccessTokenMinutes`, `RefreshTokenDays`).

### Backend (EF Core migrations)

```bash
cd sources/FitnessAi
dotnet ef migrations add <Name> --project Data.Database --startup-project Core.Api
dotnet ef database update --project Data.Database --startup-project Core.Api
```

### Mobile client

```bash
cd apps/HealthDataSyncClient
npm install
npm run android   # or: npm run ios
npm start         # Metro bundler
npm run lint
npm run prettier:check
npm run check:models-sync
npm run android:validation   # runs all three checks above in sequence
npm test
```

## More

See `CLAUDE.md` for coding conventions, DI rules, and git workflow used in this repo.
