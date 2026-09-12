using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.Ai;
using Logic.Ai.Interfaces;
using Logic.Ai.Training.WorkoutIntensity.Models;
using Microsoft.ML;
using Shared.Enums.Ai;

namespace Logic.Ai.Prediction.WorkoutIntensity
{
    // Loads the currently active WorkoutIntensity model and uses it to score individual rows.
    // This class is registered AddScoped (see AiServiceRegistration), so one instance - and
    // therefore one cached PredictionEngine - lives for the duration of a single job/request,
    // which is exactly what lets the "load once, predict many times" caching below work safely.
    public class WorkoutIntensityPredictor : IWorkoutIntensityPredictor
    {
        private readonly IAiUnitOfWork _aiUnitOfWork;
        private readonly IAiModelLifecycleService _aiModelLifecycleService;
        private readonly MLContext _mlContext = new();
        private PredictionEngine<WorkoutIntensityMlInput, WorkoutIntensityMlPrediction>? _predictionEngine;
        private bool _predictionEngineLoadAttempted;

        public WorkoutIntensityPredictor(IAiUnitOfWork aiUnitOfWork, IAiModelLifecycleService aiModelLifecycleService)
        {
            _aiUnitOfWork = aiUnitOfWork;
            _aiModelLifecycleService = aiModelLifecycleService;
        }

        public async Task<WorkoutIntensityEnum> PredictAsync(HealthConnectAiTrainingDataEntity entity, CancellationToken cancellationToken = default)
        {
            var predictionEngine = await GetPredictionEngineAsync(cancellationToken);

            // No active model yet (e.g. the very first run, before enough data has been
            // labeled and trained on) - Unknown is the honest answer, not an error.
            if (predictionEngine == null)
            {
                return WorkoutIntensityEnum.Unknown;
            }

            var prediction = predictionEngine.Predict(ToMlInput(entity));

            // The model only ever outputs one of the strings it was trained on ("Easy"/
            // "Medium"/"Hard"), so this should always parse - TryParse is just a defensive
            // fallback to Unknown rather than letting a surprising value crash the job.
            return Enum.TryParse<WorkoutIntensityEnum>(prediction.PredictedLabel, ignoreCase: true, out var intensity)
                ? intensity
                : WorkoutIntensityEnum.Unknown;
        }

        // Loads and builds the PredictionEngine at most once per instance (i.e. once per job
        // run), then reuses it for every subsequent row. Building a PredictionEngine involves
        // deserializing the whole model, so doing that per-row instead of once would be far more
        // expensive than the prediction itself. (For a high-throughput web request path you'd
        // reach for ML.NET's PredictionEnginePool instead - overkill for a batch job like this.)
        private async Task<PredictionEngine<WorkoutIntensityMlInput, WorkoutIntensityMlPrediction>?> GetPredictionEngineAsync(CancellationToken cancellationToken)
        {
            if (_predictionEngineLoadAttempted)
            {
                return _predictionEngine;
            }

            _predictionEngineLoadAttempted = true;

            var modelData = await LoadActiveModelDataAsync(cancellationToken);

            if (modelData == null)
            {
                return null;
            }

            // Model.Load is the counterpart to Model.Save (WorkoutIntensityModelTrainer): it
            // deserializes the stored bytes back into a runnable ITransformer. We discard the
            // schema here (out _) because we already know the input shape at compile time via
            // WorkoutIntensityMlInput - CreatePredictionEngine derives it from that type instead.
            using var memoryStream = new MemoryStream(modelData);
            var transformer = _mlContext.Model.Load(memoryStream, out _);
            _predictionEngine = _mlContext.Model.CreatePredictionEngine<WorkoutIntensityMlInput, WorkoutIntensityMlPrediction>(transformer);

            return _predictionEngine;
        }

        private async Task<byte[]?> LoadActiveModelDataAsync(CancellationToken cancellationToken)
        {
            var activeModel = await _aiModelLifecycleService.GetActiveModelAsync(
                userId: null,
                AiModelTypeEnum.WorkoutIntensity,
                exerciseType: null,
                cancellationToken);

            if (activeModel == null)
            {
                return null;
            }

            var binary = await _aiUnitOfWork.AiModelBinaryRepository.GetSingleAsync(new DbQueryOptions<AiModelBinaryEntity>
            {
                WhereExpression = x => x.AiModelId == activeModel.Id,
            }, asNoTracking: true, cancellationToken: cancellationToken);

            return binary?.ModelData;
        }

        // Same field mapping as WorkoutIntensityModelTrainer.ToMlInput (minus Label, which only
        // exists for training rows) - the model can only score this correctly because the
        // feature shape here matches what it saw during training.
        private static WorkoutIntensityMlInput ToMlInput(HealthConnectAiTrainingDataEntity entity)
        {
            return new WorkoutIntensityMlInput
            {
                Elevation = entity.EvaluationMetersAvg ?? 0f,
                Pace = (float)(entity.DurationSecondsPerKm ?? 0),
                AverageHeartRate = (float)(entity.HeartRate?.Avg ?? 0),
                UserId = entity.UserId.ToString(),
                ExerciseType = entity.ExerciseType.ToString(),
            };
        }
    }
}
