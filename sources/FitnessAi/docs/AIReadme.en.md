# Workout Intensity Training Data (CSV Export/Import)

> German version: [`AIReadme.de.md`](./AIReadme.de.md)

## What it does

There is currently **no in-process ML model** for workout intensity. Instead, the backend exports
unlabeled training data as a CSV, an external process/human fills in a `Label` (`Easy`/`Medium`/`Hard`,
`WorkoutIntensityEnum`) per row, and the labeled CSV is uploaded back and merged into a single stored
training file (`AiTrainingDataFileTable`). This replaces an earlier in-process ML.NET training/prediction
pipeline that has been removed entirely (see [History](#history)).

## Endpoints (`Core.Api/ApiControllers/Ai/AiTrainingWorkOutIntensityCsvController.cs`)

| Method | Route | Purpose |
|---|---|---|
| `GET` | `api/AiTrainingWorkOutIntensityCsv/LoadInitialWorkOutIntensityTrainingCsv?itemsCount=N` | Returns a CSV of up to `N` not-yet-labeled training rows, merged with whatever's already stored |
| `GET` | `api/AiTrainingWorkOutIntensityCsv/GetExistingWorkOutIntensityCsv` | Returns whatever CSV is currently stored, unmodified; `404` if nothing has been generated/uploaded yet |
| `POST` | `api/AiTrainingWorkOutIntensityCsv/UpdateWorkOutIntensityTrainingCsvData` | Accepts a labeled CSV (multipart file upload) and merges the labeled rows into the stored file |

All three are backed by `IAiWorkOutIntensityTrainingFileService` / `AiWorkOutIntensityTrainingFileService`
(`Logic.Ai/Csv/Services/`).

## CSV format

9 columns, `;`-separated, UTF-8, header row required, no quoted fields
(`Logic.Ai/Csv/AiTrainingColumnDefinitions.cs`):

```
DataKey;Elevation;Pace;AverageHeartRate;MinHeartRate;MaxHeartRate;Power;PredictedAt;Label
```

- `DataKey` — correlates a row back to a `HealthConnectTrainingDataTable` row
- `Elevation`, `Pace` (`MM:SS` per km), `AverageHeartRate`/`MinHeartRate`/`MaxHeartRate`, `Power` — training
  features, built from `HealthConnectTrainingDataValuesEntity` (`Logic.Ai/Csv/ModelMapper/WorkoutIntensityCsvRowMapper.cs`)
- `Label` — filled in externally; empty until labeled
- `PredictedAt` — timestamp stamped by the backend (not the labeler) the moment a labeled row is accepted
  during upload; used only as an internal "this row has already been labeled" marker

## Load → label → upload flow

```
GET LoadInitialWorkOutIntensityTrainingCsv?itemsCount=N
        │
        ▼
  existing stored CSV (if any)  ──┐
                                  ├─▶ merge by DataKey, labeled row always wins ──▶ CSV returned
  up to N HealthConnectTrainingDataTable
  rows with WorkoutIntensity == null
                                  │
                          (external labeling)
                                  │
                                  ▼
POST UpdateWorkOutIntensityTrainingCsvData (labeled CSV)
        │
        ▼
  rows with a non-empty Label, whose DataKey still exists
  in HealthConnectTrainingDataTable, get PredictedAt stamped
        │
        ▼
  merged into the existing stored CSV (updated rows always win) ──▶ AiTrainingDataFileTable.Csv updated
```

Both merge steps are keyed by `DataKey`, so the stored file (and every CSV returned by either `GET`
endpoint) can never contain duplicate `DataKey`s.

**Important**: this flow only ever reads `HealthConnectTrainingDataTable` (to build fresh rows and to
validate that an uploaded row's `DataKey` still exists) — it never writes to it. The label lives only in
the CSV/`AiTrainingDataFileTable`; nothing currently copies it back onto
`HealthConnectTrainingDataTable.WorkoutIntensity`. If a future feature needs the label on the raw training
row again, that write needs to be added at the appropriate business location — it is out of scope here by
design (see the commit history around `ApplyPrediction` removal).

## Generic CSV infrastructure (`Logic.Ai/Csv/`)

The WorkoutIntensity pipeline is one consumer of a small generic CSV read/write layer, keyed by the
existing `AiModelTypeEnum` (reused as the CSV "AiType" selector — not a new enum):

- `IColumnDefinitionFactory` / `ColumnDefinitionFactory` — maps an `AiModelTypeEnum` to its `ColumnDefinition`
  (`IReadOnlyDictionary<string,int>`, column name → index); the single source of truth for header order/validation
- `CsvHeaderValidator` — strict header validation (exact column count/names/order, no auto-correction)
- `ICsvModelLoader<TModel>` / `CsvModelLoader<TModel>` — bytes → `HashSet<TModel>`
- `ICsvModelCreator<TModel>` / `CsvModelCreator<TModel>` — `IReadOnlyCollection<TModel>` → bytes
- `ICsvRowMapper<TModel>` — the extension point each concrete model implements (`MapFromRow`/`MapToRow`);
  `WorkoutIntensityCsvRowMapper` is the only implementation today
- `IAiTrainingDataFileService` / `AiTrainingDataFileService` — generic persistence for `AiTrainingDataFileTable`
  (one row per `AiModelTypeEnum`, holding the current `Csv` bytes + an `IsUpdated` flag)

Registered as open generics in `Logic.Ai/DI/AiServiceRegistration.cs`, so a future CSV-backed `AiType` only
needs its own `ICsvRowMapper<TModel>` implementation plus a `ColumnDefinition` entry — no changes to the
loader/creator/validator.

## History

An earlier iteration trained and served a real ML.NET multiclass classifier in-process (label heuristic →
training → activatable model → prediction job), storing derived data in `HealthConnectAiTrainingDataTable`
and model binaries in `AiModelTable`/`AiModelBinaryTable`. That entire pipeline (and its tables) has been
removed — `HealthConnectTrainingDataTable` (the raw imported data) is used directly instead, and any actual
model training/prediction now happens outside this backend.
