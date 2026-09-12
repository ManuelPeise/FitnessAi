using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.Ai;
using Data.Database.Entities.HealthConnect;
using Data.Database.Entities.User;
using Logic.Ai.Interfaces;
using Logic.Shared.Interfaces;
using Microsoft.Extensions.Logging;
using System.Linq.Expressions;

namespace Logic.Ai.Training
{
    public class AiTrainingDataBuilder : IAiTrainingDataBuilder
    {
        private readonly ILogger<AiTrainingDataBuilder> _logger;
        private readonly ICurrentUserService _currentUserService;
        private readonly IApplicationUnitOfWork _applicationUnitOfWork;
        private readonly IHealthUnitOfWork _healthUnitOfWork;
        private readonly IAiUnitOfWork _aiUnitOfWork;

        public AiTrainingDataBuilder(
            ILogger<AiTrainingDataBuilder> logger,
            ICurrentUserService currentUserService,
            IApplicationUnitOfWork applicationUnitOfWork,
            IHealthUnitOfWork healthUnitOfWork,
            IAiUnitOfWork aiUnitOfWork)
        {
            _logger = logger;
            _currentUserService = currentUserService;
            _applicationUnitOfWork = applicationUnitOfWork;
            _healthUnitOfWork = healthUnitOfWork;
            _aiUnitOfWork = aiUnitOfWork;
        }

        public async Task BuildAiExerciseTrainingData()
        {
            try
            {
                var availableTrainingData = await _healthUnitOfWork.HealthConnectTrainingDataRepository.GetAsync(new DbQueryOptions<HealthConnectTrainingDataEntity>
                {
                    WhereExpression = x => x.AllowedForAiTraining,
                    Includes = new List<Expression<Func<HealthConnectTrainingDataEntity, object>>>
                    {
                        x => x.HealthConnectTrainingDataValues,
                        x => x.HealthConnectTrainingDataValues.HeartRate!,
                        x => x.HealthConnectTrainingDataValues.HeartRate!.Unit,
                        x => x.HealthConnectTrainingDataValues.RestingHeartRate!,
                        x => x.HealthConnectTrainingDataValues.RestingHeartRate!.Unit,
                        x => x.HealthConnectTrainingDataValues.CyclingPedalingCadence!,
                        x => x.HealthConnectTrainingDataValues.CyclingPedalingCadence!.Unit,
                        x => x.HealthConnectTrainingDataValues.Power!,
                        x => x.HealthConnectTrainingDataValues.Power!.Unit,
                        x => x.HealthConnectTrainingDataValues.Speed!,
                        x => x.HealthConnectTrainingDataValues.Speed!.Unit,
                        x => x.HealthConnectTrainingDataValues.StepCadence!,
                        x => x.HealthConnectTrainingDataValues.StepCadence!.Unit,
                        x => x.HealthConnectTrainingDataValues.Laps,
                        x => x.HealthConnectTrainingDataValues.Segments,
                    }
                });

                if (availableTrainingData == null || !availableTrainingData.Any())
                {
                    _logger.LogInformation("No available training data found for AI exercise training.");
                    return;
                }

                var isDatabaseModified = false;
                var skippedWithoutValues = 0;


                foreach (var grp in availableTrainingData.GroupBy(x => x.UserId))
                {
                    var bodyDataEntity = await _applicationUnitOfWork.UserBodyDataRepository.GetSingleAsync(new DbQueryOptions<UserBodyDataEntity>
                    {
                        WhereExpression = x => x.UserId == grp.Key
                    });

                    if (grp.Any(x => x.HealthConnectTrainingDataValues == null))
                    {
                        skippedWithoutValues++;
                        continue;
                    }

                    foreach (var trainingData in grp)
                    {
                        var result = await BuildOrUpdateTrainingDataEntity(trainingData, bodyDataEntity);

                        if (isDatabaseModified == false && result == true)
                        {
                            isDatabaseModified = true;
                        }
                    }
                }

                if (skippedWithoutValues > 0)
                {
                    _logger.LogWarning("Skipped {SkippedCount} of {TotalCount} training data records because they have no associated values.",
                        skippedWithoutValues, availableTrainingData.Count);
                }

                if (isDatabaseModified)
                {
                    await _aiUnitOfWork.SaveChangesAsync();
                    _logger.LogInformation("AI exercise training data has been built and saved successfully.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error building exercise training data");
            }
        }

        private async Task<bool> BuildOrUpdateTrainingDataEntity(HealthConnectTrainingDataEntity trainingDataEntity, UserBodyDataEntity? bodyDataEntity)
        {
            var existingEntity = await _aiUnitOfWork.HealthConnectAiTrainingDataRepository.GetSingleAsync(new DbQueryOptions<HealthConnectAiTrainingDataEntity>
            {
                WhereExpression = x => x.DataKey == trainingDataEntity.DataKey && x.UserId == trainingDataEntity.UserId
            });

            var isDatabaseModified = false;

            if (existingEntity != null)
            {
                await UpdateEntity(existingEntity, trainingDataEntity, DateTime.UtcNow, bodyDataEntity);

                isDatabaseModified = true;
            }
            else
            {
                isDatabaseModified = await CreateAndAddEntity(trainingDataEntity, DateTime.UtcNow, bodyDataEntity);
            }

            return isDatabaseModified;
        }

        private async Task<bool> CreateAndAddEntity(HealthConnectTrainingDataEntity trainingDataEntity, DateTime maxDate, UserBodyDataEntity? bodyDataEntity)
        {

            if (trainingDataEntity?.StartTime == null || trainingDataEntity?.EndTime == null || trainingDataEntity?.ExerciseType == null)
            {
                _logger.LogDebug("Training data entity with ID {EntityId} has null start or end time or exercise type. Cannot create a new AI training data entity.", trainingDataEntity?.Id);
                return false;
            }

            if (!trainingDataEntity.AllowedForAiTraining)
            {
                return false;
            }

            var newEntity = new HealthConnectAiTrainingDataEntity
            {
                
                UserId = trainingDataEntity.UserId,
                DataKey = trainingDataEntity.DataKey,
                MetricId = trainingDataEntity.DataKey,
                Origin = trainingDataEntity.Origin,
                ExerciseType = trainingDataEntity.ExerciseType,
                Steps = (int?)trainingDataEntity?.HealthConnectTrainingDataValues?.Steps ?? null,
                StepCadenceId = trainingDataEntity?.HealthConnectTrainingDataValues?.StepCadence?.Id,
                CaloriesBurned = (int?)trainingDataEntity?.HealthConnectTrainingDataValues?.ActiveCaloriesBurnedInKcal ?? null,
                DurationSeconds = trainingDataEntity?.HealthConnectTrainingDataValues?.DurationSeconds ?? null,
                DistanceInMeters = trainingDataEntity?.HealthConnectTrainingDataValues?.DistanceInMeters ?? null,
                DurationSecondsPerKm = CalculatePace(trainingDataEntity?.HealthConnectTrainingDataValues?.DistanceInMeters,
                    trainingDataEntity?.HealthConnectTrainingDataValues?.DurationSeconds),
                HeartRateId = trainingDataEntity?.HealthConnectTrainingDataValues?.HeartRate?.Id,
                CyclingPedalingCadenceId = trainingDataEntity?.HealthConnectTrainingDataValues?.CyclingPedalingCadence?.Id,
                EvaluationMetersAvg = (int?)trainingDataEntity?.HealthConnectTrainingDataValues?.ElevationAvg ?? null,
                PowerId = trainingDataEntity?.HealthConnectTrainingDataValues?.Power?.Id,
                SpeedId = trainingDataEntity?.HealthConnectTrainingDataValues?.Speed?.Id,
                Segments = GetSegments(trainingDataEntity?.HealthConnectTrainingDataValues?.Segments),
                Weight = trainingDataEntity?.HealthConnectTrainingDataValues?.WeightAvg ?? null,
                BodyFatPercentage = trainingDataEntity?.HealthConnectTrainingDataValues?.BodyFatPercentage ?? null,
                BodyMassIndex = CalculateBmi(trainingDataEntity?.HealthConnectTrainingDataValues?.WeightAvg ?? 0, bodyDataEntity?.Height ?? 0),
                OxygenSaturationPercentageAvg = trainingDataEntity?.HealthConnectTrainingDataValues?.OxygenSaturationPercentageAvg ?? null,
                RespiratoryRateAvg = trainingDataEntity?.HealthConnectTrainingDataValues?.RespiratoryRateAvg ?? null,
                Vo2MaxMlPerMinKgAvg = trainingDataEntity?.HealthConnectTrainingDataValues?.Vo2MaxMlPerMinKgAvg ?? null,
                Laps = GetLaps(trainingDataEntity?.HealthConnectTrainingDataValues?.Laps),

            };

            var entity = await _aiUnitOfWork.HealthConnectAiTrainingDataRepository.AddAsync(newEntity);

            return entity != null;
        }

        private async Task UpdateEntity(HealthConnectAiTrainingDataEntity existingEntity, HealthConnectTrainingDataEntity trainingDataEntity, DateTime maxDate, UserBodyDataEntity? bodyDataEntity)
        {
            var values = trainingDataEntity.HealthConnectTrainingDataValues;

            existingEntity.ExerciseType = trainingDataEntity.ExerciseType;
            existingEntity.MetricId = trainingDataEntity.DataKey;
            existingEntity.Origin = trainingDataEntity.Origin;
            existingEntity.Steps = (int?)values?.Steps ?? null;
            existingEntity.StepCadenceId = values?.StepCadence?.Id;
            existingEntity.CaloriesBurned = (int?)values?.ActiveCaloriesBurnedInKcal ?? null;
            existingEntity.DurationSeconds = values?.DurationSeconds ?? null;
            existingEntity.DistanceInMeters = values?.DistanceInMeters ?? null;
            existingEntity.DurationSecondsPerKm = CalculatePace(values?.DistanceInMeters, values?.DurationSeconds);
            existingEntity.HeartRateId = values?.HeartRate?.Id;
            existingEntity.CyclingPedalingCadenceId = values?.CyclingPedalingCadence?.Id;
            existingEntity.PowerId = values?.Power?.Id;
            existingEntity.SpeedId = values?.Speed?.Id;
            existingEntity.EvaluationMetersAvg = (int?)values?.ElevationAvg ?? null;
            existingEntity.Weight = existingEntity.Weight;
            existingEntity.BodyFatPercentage = existingEntity.BodyFatPercentage;
            existingEntity.BodyMassIndex = CalculateBmi(existingEntity.Weight ?? 0, bodyDataEntity?.Height ?? 0);
            existingEntity.OxygenSaturationPercentageAvg = values?.OxygenSaturationPercentageAvg ?? null;
            existingEntity.RespiratoryRateAvg = values?.RespiratoryRateAvg ?? null;
            existingEntity.Vo2MaxMlPerMinKgAvg = values?.Vo2MaxMlPerMinKgAvg ?? null;
            existingEntity.Segments = GetSegments(values?.Segments);
            existingEntity.Laps = GetLaps(values?.Laps);

            await _aiUnitOfWork.HealthConnectAiTrainingDataRepository.UpdateAsync(existingEntity);
        }

        private decimal? CalculatePace(decimal? distanceInMeters, decimal? durationSeconds)
        {
            if (!distanceInMeters.HasValue || !durationSeconds.HasValue || distanceInMeters.Value <= 0 || durationSeconds.Value <= 0)
            {
                return null;
            }

            if (!distanceInMeters.HasValue || !durationSeconds.HasValue || distanceInMeters.Value <= 0 || durationSeconds.Value <= 0)
            {
                return null;
            }

            return durationSeconds.Value / distanceInMeters.Value * 1000;
        }

        private ICollection<HealthConnectAiTrainingSegmentEntity> GetSegments(ICollection<HealthConnectSegmentEntity>? segments = null)
        {
            if (segments == null || !segments.Any())
            {
                return new List<HealthConnectAiTrainingSegmentEntity>();
            }

            return segments.Select(segment => new HealthConnectAiTrainingSegmentEntity
            {
                Repetitions = segment.Repetitions,
                DurationSeconds = CalculateDuration(segment.StartTime, segment.EndTime),
                SegmentType = segment.SegmentType,
            }).ToList();
        }

        private ICollection<HealthConnectAiTrainingLap> GetLaps(ICollection<HealthConnectLapEntity>? laps = null)
        {
            if (laps == null || !laps.Any())
            {
                return new List<HealthConnectAiTrainingLap>();
            }

            return laps.Select(lap => new HealthConnectAiTrainingLap
            {
                DurationSeconds = CalculateDuration(lap.StartTime, lap.EndTime),
                LengthInMeters = lap.LengthInMeters,
            }).ToList();
        }

        private int CalculateDuration(DateTime from, DateTime to)
        {
            return (int)(to - from).TotalSeconds;
        }

        private decimal? CalculateBmi(decimal weightInKg, decimal heightInMeters)
        {
            if (heightInMeters <= 0 || weightInKg <= 0)
            {
                return null;
            }
            return weightInKg / (heightInMeters * heightInMeters);
        }
    }
}
