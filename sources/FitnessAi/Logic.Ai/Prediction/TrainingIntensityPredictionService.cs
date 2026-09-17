using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.HealthConnect;
using Logic.Ai.Interfaces;
using Logic.Shared.Interfaces;
using Shared.Enums.Ai;
using Shared.Models.Ai.InputModels;
using Shared.Models.HealthConnect.QueryModels;
using System.Linq.Expressions;

namespace Logic.Ai.Prediction
{
    public class TrainingIntensityPredictionService : ITrainingIntensityPredictionService
    {
        private readonly IHealthUnitOfWork _healthUnitOfWork;
        private readonly ICurrentUserService _currentUserService;
        private readonly IWorkoutIntensityPredictor _predictor;

        public TrainingIntensityPredictionService(
            IHealthUnitOfWork healthUnitOfWork,
            ICurrentUserService currentUserService,
            IWorkoutIntensityPredictor predictor)
        {
            _healthUnitOfWork = healthUnitOfWork;
            _currentUserService = currentUserService;
            _predictor = predictor;
        }

        public async Task<List<TrainingDataPrediction>> PredictAsync(TrainingDataQuery query, CancellationToken cancellationToken = default)
        {
            var entities = await _healthUnitOfWork.HealthConnectTrainingDataRepository.GetAsync(new DbQueryOptions<HealthConnectTrainingDataEntity>
            {
                AsNoTracking = true,
                WhereExpression = BuildWhereExpression(query, _currentUserService.UserId),
                Includes =
                [
                    entity => entity.HealthConnectTrainingDataValues.HeartRate!,
                    entity => entity.HealthConnectTrainingDataValues.Power!,
                ],
            }, cancellationToken);

            var predictions = new List<TrainingDataPrediction>();

            foreach (var entity in entities)
            {
                var prediction = await PredictForEntity(entity, cancellationToken);

                if (prediction != null)
                {
                    predictions.Add(new TrainingDataPrediction { Id = entity.Id, WorkoutIntensity = prediction.Value });
                }
            }

            return predictions;
        }

        private async Task<WorkoutIntensityEnum?> PredictForEntity(HealthConnectTrainingDataEntity entity, CancellationToken cancellationToken)
        {
            var input = BuildInput(entity.HealthConnectTrainingDataValues);

            if (input == null)
            {
                return null;
            }

            return await _predictor.PredictAsync(input, modelVersion: null, cancellationToken);
        }

        private static Expression<Func<HealthConnectTrainingDataEntity, bool>> BuildWhereExpression(TrainingDataQuery query, long userId)
        {
            return entity =>
                entity.UserId == userId &&
                entity.WorkoutIntensity == null &&
                (query.ExerciseType == null || entity.ExerciseType == query.ExerciseType) &&
                (query.From == null || entity.StartTime >= query.From) &&
                (query.To == null || entity.EndTime <= query.To);
        }

        private static WorkoutIntensityMlInputModel? BuildInput(HealthConnectTrainingDataValuesEntity? values)
        {
            if (values == null)
            {
                return null;
            }

            return new WorkoutIntensityMlInputModel
            {
                Elevation = ToFloat(values.ElevationAvg),
                PaceSeconds = GetPaceSeconds(values) ?? 0f,
                AverageHeartRate = ToFloat(values.HeartRate?.Avg) ?? 0f,
                MinHeartRate = ToFloat(values.HeartRate?.Min),
                MaxHeartRate = ToFloat(values.HeartRate?.Max) ?? 0f,
                Power = ToFloat(values.Power?.Avg),
            };
        }

        // Seconds-per-km - matches WorkoutIntensityCsvRowMapper.GetPaceString's formula.
        private static float? GetPaceSeconds(HealthConnectTrainingDataValuesEntity values)
        {
            if (!values.DistanceInMeters.HasValue || !values.DurationSeconds.HasValue ||
                values.DistanceInMeters.Value <= 0 || values.DurationSeconds.Value <= 0)
            {
                return null;
            }

            return (float)(values.DurationSeconds.Value / values.DistanceInMeters.Value * 1000);
        }

        private static float? ToFloat(decimal? value)
        {
            return value.HasValue ? (float)value.Value : null;
        }
    }
}
