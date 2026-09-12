using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.Ai;
using Logic.Ai.Interfaces;
using Logic.Ai.Training.WorkoutIntensity.Models;
using Microsoft.Extensions.Logging;
using Microsoft.ML;
using Shared.Enums.Ai;
using System.Linq.Expressions;

namespace Logic.Ai.Training.WorkoutIntensity
{
    // End-to-end training run: load labeled rows -> build+fit the ML.NET pipeline
    // (WorkoutIntensityMlModelBuilder) -> serialize the trained model to bytes -> hand it to
    // AiModelLifecycleService, which activates it and deactivates whatever model was active
    // before (same versioning mechanism used by the other, non-intensity AI models).
    public class WorkoutIntensityModelTrainer : IWorkoutIntensityModelTrainer
    {
        // Training on too few rows produces an overfit/unreliable model. Below this count we
        // simply skip training this run and keep whatever model is already active - training
        // will be retried on the next run once more labeled data has accumulated.
        private const int MinTrainingSetSize = 20;

        private readonly ILogger<WorkoutIntensityModelTrainer> _logger;
        private readonly IAiUnitOfWork _aiUnitOfWork;
        private readonly IWorkoutIntensityMlModelBuilder _modelBuilder;
        private readonly IAiModelLifecycleService _aiModelLifecycleService;

        public WorkoutIntensityModelTrainer(
            ILogger<WorkoutIntensityModelTrainer> logger,
            IAiUnitOfWork aiUnitOfWork,
            IWorkoutIntensityMlModelBuilder modelBuilder,
            IAiModelLifecycleService aiModelLifecycleService)
        {
            _logger = logger;
            _aiUnitOfWork = aiUnitOfWork;
            _modelBuilder = modelBuilder;
            _aiModelLifecycleService = aiModelLifecycleService;
        }

        public async Task<AiModelEntity?> TrainAndActivateModelAsync(CancellationToken cancellationToken = default)
        {
            var trainingData = await LoadLabeledTrainingDataAsync(cancellationToken);

            if (trainingData.Count < MinTrainingSetSize)
            {
                _logger.LogWarning(
                    "Skipping WorkoutIntensity model training: only {Count} labeled rows available, need at least {MinCount}.",
                    trainingData.Count, MinTrainingSetSize);
                return null;
            }

            // MLContext is ML.NET's equivalent of a DbContext: it owns the pipeline/model state
            // for one training run and should not be reused/shared across unrelated runs.
            var mlContext = new MLContext();
            var transformer = _modelBuilder.Train(mlContext, trainingData, out var schema);
            var modelData = SaveModel(mlContext, transformer, schema);

            // userId: null + exerciseType: null is what makes this ONE global model rather than
            // one model per user/exercise - UserId and ExerciseType are already input FEATURES
            // the model itself uses to tell users/exercises apart, so we don't also need to
            // train and store a separate model per user or exercise type.
            return await _aiModelLifecycleService.ActivateNewModelAsync(
                userId: null,
                AiModelTypeEnum.WorkoutIntensity,
                exerciseType: null,
                modelData,
                cancellationToken);
        }

        private async Task<List<WorkoutIntensityMlInput>> LoadLabeledTrainingDataAsync(CancellationToken cancellationToken)
        {
            var options = new DbQueryOptions<HealthConnectAiTrainingDataEntity>
            {
                AsNoTracking = true,
                WhereExpression = x => x.WorkoutIntensity != WorkoutIntensityEnum.Unknown,
                Includes = new List<Expression<Func<HealthConnectAiTrainingDataEntity, object>>>
                {
                    x => x.HeartRate!,
                }
            };

            var entities = await _aiUnitOfWork.HealthConnectAiTrainingDataRepository.GetAsync(options, cancellationToken);

            return entities.Select(ToMlInput).ToList();
        }

        // Maps one DB row to one training example. Must stay in sync, field-for-field (minus
        // Label), with WorkoutIntensityPredictor's own mapping - the model can only make sense
        // of a prediction-time row if it looks like the rows it was trained on.
        private static WorkoutIntensityMlInput ToMlInput(HealthConnectAiTrainingDataEntity entity)
        {
            return new WorkoutIntensityMlInput
            {
                Elevation = entity.EvaluationMetersAvg ?? 0f,
                Pace = (float)(entity.DurationSecondsPerKm ?? 0),
                // Deliberately HeartRate.Avg here, not .Max - .Max is reserved for the label
                // heuristic (WorkoutIntensityLabelGenerator). Using the same signal for both
                // the label and the feature would let the model trivially "cheat".
                AverageHeartRate = (float)(entity.HeartRate?.Avg ?? 0),
                UserId = entity.UserId.ToString(),
                ExerciseType = entity.ExerciseType.ToString(),
                Label = entity.WorkoutIntensity.ToString(),
            };
        }

        // ML.NET models aren't plain POCOs you can JSON-serialize - Model.Save writes the
        // trained pipeline (transforms + learned weights) plus the schema it expects, in
        // ML.NET's own binary zip format. Model.Load (see WorkoutIntensityPredictor) reverses
        // this. We keep the result as a byte[] so it can be stored in AiModelBinaryTable exactly
        // like the other AI models already are.
        private static byte[] SaveModel(MLContext mlContext, ITransformer transformer, DataViewSchema schema)
        {
            using var memoryStream = new MemoryStream();
            mlContext.Model.Save(transformer, schema, memoryStream);
            return memoryStream.ToArray();
        }
    }
}
