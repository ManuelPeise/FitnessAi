using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.HealthConnect;
using Logic.Services.Interfaces;
using Logic.Shared.Interfaces;
using Shared.Enums.HealthConnect;
using Shared.Models.HealthConnect.QueryModels;
using System.Linq.Expressions;

namespace Logic.Services.HealthConnect
{
    public class TrainingDataService : ITrainingDataService
    {
        private readonly IHealthUnitOfWork _healthUnitOfWork;
        private readonly ICurrentUserService _currentUserService;

        public TrainingDataService(IHealthUnitOfWork healthUnitOfWork, ICurrentUserService currentUserService)
        {
            _healthUnitOfWork = healthUnitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task<TrainingDataQueryResult> GetTrainingDataAsync(TrainingDataQuery query, CancellationToken cancellationToken = default)
        {
            var userId = _currentUserService.UserId;
            var whereExpression = BuildWhereExpression(query, userId);

            var totalCount = await _healthUnitOfWork.HealthConnectTrainingDataRepository.CountAsync(whereExpression, cancellationToken);

            var entities = await _healthUnitOfWork.HealthConnectTrainingDataRepository.GetAsync(new DbQueryOptions<HealthConnectTrainingDataEntity>
            {
                AsNoTracking = true,
                WhereExpression = whereExpression,
                OrderByExpression = entity => entity.StartTime,
                OrderByDescending = true,
                Includes = TrainingDataValueIncludes,
                Skip = (query.Page - 1) * query.PageSize,
                Take = query.PageSize,
            }, cancellationToken);

            return new TrainingDataQueryResult
            {
                Items = entities.Select(MapToListItem).ToList(),
                TotalCount = totalCount,
                AvailableExerciseTypes = await GetAvailableExerciseTypesAsync(userId, cancellationToken),
            };
        }

        public async Task UpdateTrainingDataAsync(TrainingDataUpdateRequest request, CancellationToken cancellationToken = default)
        {
            var entity = await GetOwnedEntityAsync(request.Id, _currentUserService.UserId, cancellationToken);

            ApplyUpdate(entity, request);

            await _healthUnitOfWork.HealthConnectTrainingDataRepository.UpdateAsync(entity, cancellationToken);
            await _healthUnitOfWork.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteTrainingDataAsync(long id, CancellationToken cancellationToken = default)
        {
            var entity = await GetOwnedEntityAsync(id, _currentUserService.UserId, cancellationToken);

            await _healthUnitOfWork.HealthConnectTrainingDataRepository.DeleteAsync(entity, cancellationToken);
            await _healthUnitOfWork.SaveChangesAsync(cancellationToken);
        }

        private async Task<List<ExerciseTypeEnum>> GetAvailableExerciseTypesAsync(long userId, CancellationToken cancellationToken)
        {
            var entities = await _healthUnitOfWork.HealthConnectTrainingDataRepository.GetAsync(new DbQueryOptions<HealthConnectTrainingDataEntity>
            {
                AsNoTracking = true,
                WhereExpression = entity => entity.UserId == userId,
            }, cancellationToken);

            return entities.Select(entity => entity.ExerciseType).Distinct().OrderBy(exerciseType => exerciseType).ToList();
        }

        public async Task ApplyWorkoutIntensityPredictionsAsync(List<TrainingDataPrediction> predictions, CancellationToken cancellationToken = default)
        {
            if (predictions.Count == 0)
            {
                return;
            }

            var userId = _currentUserService.UserId;
            var ids = predictions.Select(prediction => prediction.Id).ToList();

            var entities = await _healthUnitOfWork.HealthConnectTrainingDataRepository.GetAsync(new DbQueryOptions<HealthConnectTrainingDataEntity>
            {
                WhereExpression = entity => entity.UserId == userId && ids.Contains(entity.Id) && entity.WorkoutIntensity == null,
            }, cancellationToken);

            var predictionsById = predictions.ToDictionary(prediction => prediction.Id, prediction => prediction.WorkoutIntensity);

            foreach (var entity in entities)
            {
                entity.WorkoutIntensity = predictionsById[entity.Id];
                await _healthUnitOfWork.HealthConnectTrainingDataRepository.UpdateAsync(entity, cancellationToken);
            }

            await _healthUnitOfWork.SaveChangesAsync(cancellationToken);
        }

        private async Task<HealthConnectTrainingDataEntity> GetOwnedEntityAsync(long id, long userId, CancellationToken cancellationToken)
        {
            var entity = await _healthUnitOfWork.HealthConnectTrainingDataRepository.GetSingleAsync(new DbQueryOptions<HealthConnectTrainingDataEntity>
            {
                WhereExpression = e => e.Id == id && e.UserId == userId,
                Includes = TrainingDataValueIncludes,
            }, cancellationToken: cancellationToken);

            if (entity == null)
            {
                throw new KeyNotFoundException($"Training data record {id} was not found.");
            }

            return entity;
        }

        private static readonly List<Expression<Func<HealthConnectTrainingDataEntity, object>>> TrainingDataValueIncludes =
        [
            entity => entity.HealthConnectTrainingDataValues.HeartRate!,
            entity => entity.HealthConnectTrainingDataValues.Power!,
            entity => entity.HealthConnectTrainingDataValues.Speed!,
            entity => entity.HealthConnectTrainingDataValues.StepCadence!,
            entity => entity.HealthConnectTrainingDataValues.CyclingPedalingCadence!,
        ];

        private static Expression<Func<HealthConnectTrainingDataEntity, bool>> BuildWhereExpression(TrainingDataQuery query, long userId)
        {
            return entity =>
                entity.UserId == userId &&
                (query.ExerciseType == null || entity.ExerciseType == query.ExerciseType) &&
                (query.From == null || entity.StartTime >= query.From) &&
                (query.To == null || entity.EndTime <= query.To);
        }

        private static TrainingDataListItem MapToListItem(HealthConnectTrainingDataEntity entity)
        {
            var values = entity.HealthConnectTrainingDataValues;

            return new TrainingDataListItem
            {
                Id = entity.Id,
                Origin = entity.Origin,
                System = entity.System,
                StartTime = DateTime.SpecifyKind(entity.StartTime, DateTimeKind.Utc),
                EndTime = DateTime.SpecifyKind(entity.EndTime, DateTimeKind.Utc),
                DurationSeconds = values?.DurationSeconds,
                ExerciseType = entity.ExerciseType,
                DistanceInMeters = values?.DistanceInMeters,
                ElevationAvg = values?.ElevationAvg,
                Steps = values?.Steps,
                StepCadenceAvg = values?.StepCadence?.Avg,
                SpeedAvg = values?.Speed?.Avg,
                CyclingPedalingCadenceAvg = values?.CyclingPedalingCadence?.Avg,
                HeartRateMin = values?.HeartRate?.Min,
                HeartRateMax = values?.HeartRate?.Max,
                HeartRateAvg = values?.HeartRate?.Avg,
                PowerAvg = values?.Power?.Avg,
                OxygenSaturationPercentage = values?.OxygenSaturationPercentageAvg,
                ActiveCaloriesBurnedInKcal = values?.ActiveCaloriesBurnedInKcal,
                Vo2MaxMlPerMinKgAvg = values?.Vo2MaxMlPerMinKgAvg,
                WorkoutIntensity = entity.WorkoutIntensity,
            };
        }

        private static void ApplyUpdate(HealthConnectTrainingDataEntity entity, TrainingDataUpdateRequest request)
        {
            entity.WorkoutIntensity = request.WorkoutIntensity;

            var values = entity.HealthConnectTrainingDataValues;
            values.DurationSeconds = request.DurationSeconds;
            values.DistanceInMeters = request.DistanceInMeters;
            values.ElevationAvg = request.ElevationAvg;
            values.Steps = request.Steps;
            values.OxygenSaturationPercentageAvg = request.OxygenSaturationPercentage;
            values.ActiveCaloriesBurnedInKcal = request.ActiveCaloriesBurnedInKcal;
            values.Vo2MaxMlPerMinKgAvg = request.Vo2MaxMlPerMinKgAvg;

            if (values.HeartRate != null)
            {
                values.HeartRate.Min = request.HeartRateMin;
                values.HeartRate.Max = request.HeartRateMax;
                values.HeartRate.Avg = request.HeartRateAvg;
            }

            if (values.Power != null)
            {
                values.Power.Avg = request.PowerAvg;
            }

            if (values.Speed != null)
            {
                values.Speed.Avg = request.SpeedAvg;
            }

            if (values.StepCadence != null)
            {
                values.StepCadence.Avg = request.StepCadenceAvg;
            }

            if (values.CyclingPedalingCadence != null)
            {
                values.CyclingPedalingCadence.Avg = request.CyclingPedalingCadenceAvg;
            }
        }
    }
}
