# Workout Intensity Prediction

> German version: [`AIReadme.de.md`](./AIReadme.de.md)

## What it does

For every imported workout, the backend predicts how intense it was — **Easy**, **Medium**, or **Hard**
(`WorkoutIntensityEnum`, `Shared.Enums/Ai/WorkoutIntensityEnum.cs`) — using a real ML.NET multiclass
classifier. The prediction is stored on both:

- `HealthConnectAiTrainingDataTable.WorkoutIntensity` (non-nullable, defaults to `Unknown` until scored)
- `HealthConnectTrainingDataTable.WorkoutIntensity` (nullable, mirrors the same value back onto the raw import record)

`WorkoutIntensityPredictedAt` (on `HealthConnectAiTrainingDataTable`) is a separate `DateTime?` "has this
row been scored yet" marker. It exists because `WorkoutIntensity` alone can't tell "not processed yet"
apart from "the model genuinely predicted Unknown" — both would otherwise look identical.

## Why not just a fixed rule?

A simple fixed heart-rate threshold *is* used, but only to generate historical **training labels**, not to
answer new predictions. The trained classifier learns a more general pattern from several input features
(elevation, pace, heart rate, who's training, what exercise) so it can generalize beyond just "was the
heart rate high," and can be retrained as more data accumulates.

## Two-stage pipeline

The work happens in two chained, independently triggerable stages — not one big step — so that "turn raw
imports into AI training rows" and "turn AI training rows into intensity predictions" stay decoupled and
each can be re-run, monitored, or retried on its own.

```
HealthConnect import (AllowedForAiTraining)
        │
        ▼
Stage 1 — AiTrainingDataGeneration/GenerateAiTrainingData
  AiTrainingDataBuilder.BuildAiExerciseTrainingData()
  → creates/updates HealthConnectAiTrainingDataTable rows
    (WorkoutIntensity = Unknown, WorkoutIntensityPredictedAt = null)
  → on success, queues Stage 2 as a new ScheduledJobEntity
        │
        ▼
Stage 2 — WorkoutIntensityPrediction/PredictWorkoutIntensity
  WorkoutIntensityTrainingOrchestrator.RunAsync()
    1. WorkoutIntensityLabelGenerator.BackfillLabelsAsync()
    2. WorkoutIntensityModelTrainer.TrainAndActivateModelAsync()
    3. predict for every row where WorkoutIntensityPredictedAt == null
       → writes WorkoutIntensity + WorkoutIntensityPredictedAt on both tables
```

Both stages are queued the same way the rest of the app already schedules background work: a row is
inserted into `ScheduledJobEntity` via `IScheduledJobService.AddJobAsync`, and the existing generic Quartz
job (`WebJob` / `ProcessScheduledTasks`) POSTs to the stored URL later (or immediately in `DEBUG`). Stage 2
depends **only** on `HealthConnectAiTrainingDataTable` — it never touches the raw import pipeline itself.

### Manual/dev-mode triggers

Both stages are also plain API endpoints you can call directly (e.g. from Swagger) while developing,
without waiting for the schedule chain:

- `POST AiTrainingDataGeneration/GenerateAiTrainingData` — Stage 1 only
- `POST WorkoutIntensityPrediction/PredictWorkoutIntensity` — Stage 2 only

## Stage 2 in detail

### 1. Label generation (`WorkoutIntensityLabelGenerator`)

Ground-truth labels for *training* come from a heuristic, not the model itself:

For every `(UserId, ExerciseType)` group, average that user's historical `HeartRate.Max` across their
`HealthConnectAiTrainingDataTable` rows for that exercise:

| Average max heart rate | Label |
|---|---|
| < 141 bpm | `Easy` |
| 141–159 bpm (inclusive) | `Medium` |
| > 159 bpm | `Hard` |
| fewer than 5 usable samples | `Unknown` (excluded from training — no reliable ground truth) |

This label is **only** used to build the training set. It is never reapplied at prediction time — the
trained classifier answers new predictions on its own.

### 2. Training (`WorkoutIntensityModelTrainer` + `WorkoutIntensityMlModelBuilder`)

- Loads every `HealthConnectAiTrainingDataTable` row with a real label (`WorkoutIntensity != Unknown`).
- Requires at least 20 labeled rows overall; otherwise training is skipped for this run (a legitimate
  no-op while data accumulates — the previous active model, if any, stays in place).
- Converts each row into a `WorkoutIntensityMlInput`: `Elevation`, `Pace`, `AverageHeartRate` (note: the
  *average*, not the `Max` used for labeling), `UserId`, `ExerciseType`, `Label`.
- Builds an ML.NET pipeline: one-hot encodes `UserId`/`ExerciseType`, concatenates all features, normalizes
  them, and trains a multiclass `SdcaMaximumEntropy` classifier.
- Serializes the trained model to bytes (`MLContext.Model.Save`) and activates it via the existing
  `AiModelLifecycleService` (`AiModelTypeEnum.WorkoutIntensity`), which versions/deactivates the previous
  model the same way the rest of the AI model lifecycle already works.

### 3. The model is global, not per-user

`UserId` is one of the model's **input features**, not a separate model per user. There is exactly one
active `WorkoutIntensity` model at a time, trained across all users' data (`AiModelEntity.UserId = null`
for this model type). This lets the model learn cross-user patterns while still being able to pick up on
a specific user's tendencies through the `UserId` feature.

### 4. Prediction (`WorkoutIntensityPredictor`)

- Loads the currently active `WorkoutIntensity` model (if any) and its binary from `AiModelBinaryTable`.
- Caches the `PredictionEngine` for the lifetime of the request/job (it's expensive to build, cheap to
  reuse; a job processes many rows per run, so building it once per row would be wasteful).
- Builds the same feature shape used at training (minus `Label`) and predicts.
- Falls back to `Unknown` if no active model exists yet (bootstrap state) or the model's output string
  can't be parsed back into `WorkoutIntensityEnum`.

## Files

| Concern | File |
|---|---|
| Enum | `Shared.Enums/Ai/WorkoutIntensityEnum.cs` |
| Label heuristic | `Logic.Ai/Training/WorkoutIntensity/WorkoutIntensityLabelGenerator.cs` |
| ML.NET pipeline | `Logic.Ai/Training/WorkoutIntensity/WorkoutIntensityMlModelBuilder.cs` |
| Training orchestration | `Logic.Ai/Training/WorkoutIntensity/WorkoutIntensityModelTrainer.cs` |
| Prediction | `Logic.Ai/Training/WorkoutIntensity/WorkoutIntensityPredictor.cs` |
| Stage 2 orchestration | `Logic.Ai/Training/WorkoutIntensity/WorkoutIntensityTrainingOrchestrator.cs` |
| Stage 1 → Stage 2 chaining | `Logic.Ai/Training/AiTrainingDataBuilder.cs` |
| Endpoints | `Core.Api/ApiControllers/Ai/AiTrainingDataGenerationController.cs`, `Core.Api/ApiControllers/Ai/WorkoutIntensityPredictionController.cs` |
