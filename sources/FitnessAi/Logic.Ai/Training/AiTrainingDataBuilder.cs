using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.Ai;
using Data.Database.Entities.HealthConnect;
using Data.Database.Entities.Settings;
using Data.Database.Entities.User;
using Logic.Ai.Interfaces;
using Microsoft.EntityFrameworkCore.Storage.Json;
using Microsoft.Extensions.Logging;
using Shared.Enums.HealthConnect;
using System.Linq.Expressions;

namespace Logic.Ai.Training
{
    public class AiTrainingDataBuilder : IAiTrainingDataBuilder
    {
        private readonly ILogger<AiTrainingDataBuilder> _logger;
        private readonly IApplicationUnitOfWork _applicationUnitOfWork;
        private readonly IAiUnitOfWork _aiUnitOfWork;

        public AiTrainingDataBuilder(
            ILogger<AiTrainingDataBuilder> logger,
            IApplicationUnitOfWork applicationUnitOfWork,
            IAiUnitOfWork aiUnitOfWork)
        {
            _logger = logger;
            _applicationUnitOfWork = applicationUnitOfWork;
            _aiUnitOfWork = aiUnitOfWork;
        }

        public async Task BuildAiExerciseTrainingData()
        {
            try
            {
                var newAiTrainingDataEntities = new List<AiHealthConnectExerciseTrainingDataEntity>();
                var activeAiSettingsGrouping = await GetAiSettingsGrouping();
                var exerciseEntities = await GetAllHealthConnectExerciseEntities();

                if (!activeAiSettingsGrouping.Any() || !exerciseEntities.Any())
                {
                    _logger.LogInformation("No active AI settings or exercise entities found for AI training data build.");
                    return;
                }

                var existingAiTrainingData = await _aiUnitOfWork.AiHealthConnectExerciseTrainingDataRepository.GetAsync();

                var existingEntitiesDictionary = existingAiTrainingData.ToDictionary(e => e.ExcerciseId, x => x);

                foreach (var kvp in activeAiSettingsGrouping)
                {
                    var exercisesToProcessForUser = exerciseEntities.Where(e => e.UserId == kvp.Key);

                    foreach (var excercise in exercisesToProcessForUser)
                    {
                        if (string.IsNullOrEmpty(excercise.ExerciseId))
                        {
                            _logger.LogInformation(
                                $"Exercise entity {excercise.Id} for user {excercise.UserId} has no ExerciseId " +
                                $"or already exists in training data. Skipping.");
                            continue;
                        }

                        var relatedHealthConnectEntities = await GetRelatedHealthConnectData(excercise.UserId, excercise.ExerciseId);

                        if (!relatedHealthConnectEntities.Any())
                        {
                            _logger.LogInformation(
                                $"No related health connect entities found for exercise entity {excercise.Id} of user {excercise.UserId}");
                            continue;
                        }

                        // Parse timestamps once and validate
                        if (!DateTime.TryParse(excercise.StartTimestamp, out var startTimeStamp) || !DateTime.TryParse(excercise.EndTimestamp, out var endTimeStamp))
                        {
                            _logger.LogInformation($"Invalid timestamps for exercise entity {excercise.Id} of user {excercise.UserId}. Skipping.");
                            continue;
                        }

                        var generalHealthConnectEntities = relatedHealthConnectEntities.Where(x =>
                            x.Type != HealthConnectRecordTypeEnum.ExerciseSession &&
                            DateTime.TryParse(x.StartTimestamp, out var st) && st.Date == startTimeStamp.Date &&
                            DateTime.TryParse(x.EndTimestamp, out var endTimestamp) && endTimestamp.Date == endTimeStamp.Date).ToList();

                        if (existingEntitiesDictionary.TryGetValue(excercise.ExerciseId, out var existingEntity))
                        {
                            _logger.LogInformation($"Exercise entity {excercise.Id} for user {excercise.UserId} already exists in training data. Updating Entity.");

                            existingEntity.Weight = GetAvgOf(generalHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.Weight);
                            existingEntity.DistanceInMeters = GetSumOf(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.Distance);
                            existingEntity.Steps = GetSumOf(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.Steps);
                            existingEntity.Vo2Max = GetAvgOf(generalHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.Vo2Max);
                            existingEntity.LeanBodyMass = GetValue(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.LeanBodyMass);
                            existingEntity.MaxHeartRate = GetMaxValue(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.HeartRate);
                            existingEntity.MinHeartRate = GetMinValue(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.HeartRate);
                            existingEntity.ElevationGain = GetValue(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.ElevationGained);
                            existingEntity.CaloriesBurned = GetSumOf(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.ActiveCaloriesBurned);
                            existingEntity.BodyFat = GetAvgOf(generalHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.BodyFat);
                            existingEntity.OxygenSaturationAvg = GetAvgOf(generalHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.OxygenSaturation);
                            existingEntity.RespiratoryRatePerMinuteAvg = GetAvgOf(generalHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.RespiratoryRate);
                            existingEntity.HeartRateAvg = GetAvgOf(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.HeartRate);
                            existingEntity.CyclingPedalingCadenceAvg = GetAvgOf(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.CyclingPedalingCadence);
                            existingEntity.SpeedAvg = GetAvgOf(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.Speed);
                            existingEntity.PowerAvg = GetAvgOf(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.Power);
                            existingEntity.StepsCadenceAvg = GetAvgOf(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.StepsCadence);

                            await _aiUnitOfWork.AiHealthConnectExerciseTrainingDataRepository.UpdateAsync(existingEntity);
                        }
                        else
                        {
                            var newAiTrainingDataEntity = new AiHealthConnectExerciseTrainingDataEntity
                            {
                                ExcerciseId = excercise.ExerciseId,
                                ExerciseType = excercise.ExerciseType ?? ExerciseTypeEnum.OtherWorkout,
                                StartTimeStamp = startTimeStamp,
                                EndTimeStamp = endTimeStamp,
                                Weight = GetAvgOf(generalHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.Weight),
                                DistanceInMeters = GetSumOf(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.Distance),
                                Steps = GetSumOf(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.Steps),
                                Vo2Max = GetAvgOf(generalHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.Vo2Max),
                                LeanBodyMass = GetValue(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.LeanBodyMass),
                                MaxHeartRate = GetMaxValue(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.HeartRate),
                                MinHeartRate = GetMinValue(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.HeartRate),
                                ElevationGain = GetValue(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.ElevationGained),
                                CaloriesBurned = GetSumOf(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.ActiveCaloriesBurned),
                                BodyFat = GetAvgOf(generalHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.BodyFat),
                                OxygenSaturationAvg = GetAvgOf(generalHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.OxygenSaturation),
                                RespiratoryRatePerMinuteAvg = GetAvgOf(generalHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.RespiratoryRate),
                                HeartRateAvg = GetAvgOf(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.HeartRate),
                                CyclingPedalingCadenceAvg = GetAvgOf(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.CyclingPedalingCadence),
                                SpeedAvg = GetAvgOf(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.Speed),
                                PowerAvg = GetAvgOf(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.Power),
                                StepsCadenceAvg = GetAvgOf(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.StepsCadence)
                            };

                            newAiTrainingDataEntities.Add(newAiTrainingDataEntity);
                        }
                    }
                }

                await _aiUnitOfWork.AiHealthConnectExerciseTrainingDataRepository.AddRangeAsync(newAiTrainingDataEntities);

                await _aiUnitOfWork.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error building exercise training data");
            }
        }

        private async Task<List<KeyValuePair<long, AISettingsEntity>>> GetAiSettingsGrouping()
        {
            var entities = await _applicationUnitOfWork.UserRepository.GetAsync(
                new DbQueryOptions<UserEntity>
                {
                    Includes = new List<Expression<Func<UserEntity, object>>>
                    {
                                    x => x.Settings.AiSettings
                    },
                    WhereExpression = x => x.Settings.AiSettings.CanUseHealthDataForAiTraining
                });

            return entities
                .Select(user => new KeyValuePair<long, AISettingsEntity>(user.Id, user.Settings.AiSettings))
                .ToList();
        }

        private async Task<IReadOnlyList<HealthConnectDataEntity>> GetAllHealthConnectExerciseEntities()
        {
            var entities = await _applicationUnitOfWork.HealthConnectDataRepository.GetAsync(
                new DbQueryOptions<HealthConnectDataEntity>
                {
                    WhereExpression = x => x.Type == HealthConnectRecordTypeEnum.ExerciseSession
                });

            return entities;
        }

        private async Task<IReadOnlyList<HealthConnectDataEntity>> GetRelatedHealthConnectData(long userId, string? exerciseId)
        {
            if (string.IsNullOrEmpty(exerciseId))
            {
                return new List<HealthConnectDataEntity>();
            }

            var entities = await _applicationUnitOfWork.HealthConnectDataRepository.GetAsync(
                new DbQueryOptions<HealthConnectDataEntity>
                {
                    WhereExpression = x =>
                        !string.IsNullOrEmpty(x.ExerciseId) &&
                        x.ExerciseId == exerciseId &&
                        x.UserId == userId &&
                        x.Type != HealthConnectRecordTypeEnum.ExerciseSession
                });
            return entities;
        }

        private decimal GetValue(IEnumerable<HealthConnectDataEntity> entities, Func<HealthConnectDataEntity, bool> predicate)
        {
            return entities.FirstOrDefault(predicate)?.Value ?? 0;
        }

        private decimal GetMaxValue(IEnumerable<HealthConnectDataEntity> entities, Func<HealthConnectDataEntity, bool> predicate)
        {
            var vals = entities.Where(predicate).Select(x => x.Value);
            return vals.Any() ? vals.Max() : 0;
        }

        private decimal GetMinValue(IEnumerable<HealthConnectDataEntity> entities, Func<HealthConnectDataEntity, bool> predicate)
        {
            var vals = entities.Where(predicate).Select(x => x.Value);
            return vals.Any() ? vals.Min() : 0;
        }

        private decimal GetSumOf(IEnumerable<HealthConnectDataEntity> entities, Func<HealthConnectDataEntity, bool> predicate)
        {
            return entities.Where(predicate).Sum(x => x.Value);
        }

        private decimal GetAvgOf(IEnumerable<HealthConnectDataEntity> entities, Func<HealthConnectDataEntity, bool> predicate)
        {
            var filtered = entities.Where(predicate);
            return filtered.Any() ? filtered.Average(x => x.Value) : 0;
        }

    }
}
