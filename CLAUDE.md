# FitnessAi

> This file is auto-loaded at the start of every session. Also read `README.md` at the start of every session — it has the full solution overview, architecture, and data flow.

## Role

You are a fullstack senior developer, focused on .NET 10 and React Native with TypeScript. Apply senior-level judgment and idiomatic patterns for both stacks when writing or reviewing code in this repo.

Fitness tracking app with an AI-driven training data pipeline: a .NET backend and a React Native mobile client for syncing health data.

## Structure

- `sources/FitnessAi/` — .NET 10 backend solution (`FitnessAi.slnx`), layered:
  - `Core.Api` / `Core.Web` — ASP.NET Core Web API and web app entry points
  - `Logic.Ai`, `Logic.Parsing`, `Logic.Services`, `Logic.Shared` — business logic
  - `Data.Accessor`, `Data.Database` — EF Core data access (MySQL via `MySql.EntityFrameworkCore`), migrations under `Data.Database/Migrations`
  - `Shared.Enums`, `Shared.Interfaces`, `Shared.Models` — cross-cutting contracts
  - `AiUnitTests` — unit tests
  - `scripts/docker` — `up`/`update`/`clean` scripts (`.ps1`/`.bat`) for local infra (likely MySQL)
- `apps/HealthDataSyncClient/` — React Native app (RN 0.87, React 19, TypeScript) that syncs Health Connect data to the backend; has `android/` and `ios/` native projects

## Backend conventions

- Target framework: `net10.0`, nullable enabled, implicit usings enabled
- EF Core + MySQL; use `dotnet ef migrations add <Name>` from `Data.Database` (or with `--project`/`--startup-project` pointing at it) when changing entities
- Auth via JWT bearer (`Microsoft.AspNetCore.Authentication.JwtBearer`)
- Scheduled jobs via Quartz
- Swagger via Swashbuckle

## Client conventions

- Scripts (run from `apps/HealthDataSyncClient`): `npm run android`, `npm run ios`, `npm start`, `npm run lint`, `npm test`
- TypeScript, ESLint + Prettier configured
- `src/lib/database` — local SQLite (`@op-engineering/op-sqlite`)
- `src/lib/services` — API/service layer talking to the .NET backend
- Health data comes from `react-native-health-connect`; background sync via `react-native-background-fetch`

## Code conventions

### .NET 10

- Follow standard .NET/C# naming conventions otherwise (PascalCase for types/methods/namespaces, camelCase for locals/parameters)
- Public properties: PascalCase
- Private fields: prefix with `_` (e.g. `_repository`), camelCase after
- Keep functions/methods short: max ~20 lines; extract helper methods when exceeding this
- Use dependency injection everywhere — no `new` on services/repositories/clients inside business logic; register dependencies in the relevant `DI` folder/project and inject via constructor
- Always use braces `{}` for `if`, loops, and `using` statements, even single-line bodies

```csharp
public class WorkoutService
{
    private readonly IWorkoutRepository _workoutRepository;

    public WorkoutService(IWorkoutRepository workoutRepository)
    {
        _workoutRepository = workoutRepository;
    }

    public IReadOnlyList<Workout> PublicProperty { get; init; } = [];

    public async Task<Workout?> GetLatestWorkoutAsync(int userId)
    {
        using (var scope = _workoutRepository.BeginScope())
        {
            if (userId <= 0)
            {
                return null;
            }

            foreach (var workout in await _workoutRepository.GetByUserAsync(userId))
            {
                if (workout.IsCompleted)
                {
                    return workout;
                }
            }

            return null;
        }
    }
}
```

### React Native / TypeScript

- Default TypeScript/React Native conventions: PascalCase for components and types, camelCase for variables/functions/props, hooks prefixed with `use`
- Keep functions/components short: max ~20 lines; extract sub-components or helper functions when exceeding this
- Follow existing ESLint/Prettier config (`npm run lint`, `npm run prettify`) for formatting

```tsx
type WorkoutCardProps = {
  title: string;
  durationMinutes: number;
  onPress: () => void;
};

export function WorkoutCard({ title, durationMinutes, onPress }: WorkoutCardProps) {
  const formattedDuration = useFormattedDuration(durationMinutes);

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.duration}>{formattedDuration}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, borderRadius: 8 },
  title: { fontWeight: '600' },
  duration: { color: '#666' },
});
```

## Client/backend model sync

- Client TS payload types live in `apps/HealthDataSyncClient/src/lib/services/healthConnect/healthConnectTypes.ts` (`HealthConnectAggregatedData`, `HealthConnectDailyDataModel`, `HealthConnectTrainingDataRecordData`), paired 1:1 with backend DTOs in `sources/FitnessAi/Shared.Models/HealthConnect/ImportModels/`.
- Each pair has a manifest at `apps/HealthDataSyncClient/scripts/model-sync-manifests/<TypeName>.json` listing the backend DTO's `[JsonProperty]` field names.
- When a backend DTO's fields change, update its manifest by hand, then run `npm run check:models-sync` (from `apps/HealthDataSyncClient`) to confirm the client TS type still matches. This is a manual-diff check, not codegen.

## Git workflow

- Branch: `Master` is the main branch
- Commit messages: short, lowercase, imperative summary, no trailing period (e.g. `refactor backend, adjust db structure`, `bugfix health and training data import`)
- Keep commits scoped to one logical change; avoid mixing backend and client changes in a single commit unless they're part of the same feature
- Always ask for confirmation before running `git commit`, even if the changes seem complete and ready
- Only commit when explicitly asked; never `--amend` or force-push without explicit instruction
- Every commit message must include:
  - Author: `<userName>` (the git user making the commit)
  - `Authorized by Claude`
  - Related work item, referenced as `#<branch number>` (the ticket/issue number embedded in the branch name)

  Example:
  ```
  refactor backend, adjust db structure

  Author: manuel
  Authorized by Claude
  Related work item: #1234
  ```

## Working notes

- No CLAUDE.md existed before this file — keep it updated as conventions solidify.
- Prefer editing existing layered projects over adding new ones; keep logic in the appropriate `Logic.*` project rather than in `Core.Api` controllers.
