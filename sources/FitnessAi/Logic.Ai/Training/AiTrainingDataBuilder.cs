using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.Ai;
using Data.Database.Entities.HealthConnect;
using Data.Database.Entities.Settings;
using Data.Database.Entities.User;
using Logic.Ai.Interfaces;
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
                var activeAiSettings = await GetActiveAiSettings();

                if (!activeAiSettings.Any())
                {
                    _logger.LogInformation("No active settings found for AI training data build.");
                    return;
                }

                var exerciseEntities = await GetHealthConnectExerciseEntities(activeAiSettings.Keys);

                if (!exerciseEntities.Any())
                {
                    _logger.LogInformation("No exercise entities found for AI training data build.");
                    return;
                }

                var userIds = exerciseEntities.Keys.Select(key => key.ToString().Trim());

                var existingAiTrainingDataKeys = (await _aiUnitOfWork.AiHealthConnectExerciseTrainingDataRepository.GetAsync(
                    new DbQueryOptions<AiHealthConnectExerciseTrainingDataEntity>
                    {
                      WhereExpression = x => !string.IsNullOrEmpty(x.Key) && UserIdIsIncludedInKey(x.Key, userIds)
                    })).Select(x => x.Key).ToHashSet();

                var newExerciseEntities = await GetNewAiHealthConnectExerciseTrainingDataEntities(exerciseEntities);

                var newAiTrainingDataEntities = newExerciseEntities
                    .Where(entity => !existingAiTrainingDataKeys.Contains(entity.Key))
                    .ToList();

                if(!newAiTrainingDataEntities.Any())
                {
                    _logger.LogInformation("No new AI training data entities to add.");
                    return;
                }

                await _aiUnitOfWork.AiHealthConnectExerciseTrainingDataRepository.AddRangeAsync(newAiTrainingDataEntities);

                await _aiUnitOfWork.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error building exercise training data");
            }
        }

        private async Task<IReadOnlyDictionary<long, AISettingsEntity>> GetActiveAiSettings()
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

            return entities.ToDictionary(x => x.Id, x => x.Settings.AiSettings);
        }

        private async Task<IReadOnlyDictionary<long, List<HealthConnectDataEntity>>> GetHealthConnectExerciseEntities(IEnumerable<long> userIds)
        {
            var entities = await _applicationUnitOfWork.HealthConnectDataRepository.GetAsync(
                new DbQueryOptions<HealthConnectDataEntity>
                {
                    WhereExpression = x => userIds.Contains(x.UserId) && x.Type == HealthConnectRecordTypeEnum.ExerciseSession,
                });

            return entities.GroupBy(x => x.UserId).ToDictionary(x => x.Key, x => x.ToList());
        }

        private async Task<HashSet<AiHealthConnectExerciseTrainingDataEntity>> GetNewAiHealthConnectExerciseTrainingDataEntities(IReadOnlyDictionary<long, List<HealthConnectDataEntity>> exerciseEntityDictionary)
        {
            var result = new HashSet<AiHealthConnectExerciseTrainingDataEntity>();

            // Prefetch all health connect data per user (reduces N+1 calls)
            var userHealthDataMap = new Dictionary<long, HashSet<HealthConnectDataEntity>>();
            foreach (var userId in exerciseEntityDictionary.Keys)
            {
                var allUserData = await _applicationUnitOfWork.HealthConnectDataRepository.GetAsync(
                    new DbQueryOptions<HealthConnectDataEntity>
                    {
                        WhereExpression = x => x.UserId == userId
                    });

                userHealthDataMap[userId] = allUserData.ToHashSet();
            }

            foreach (var kvp in exerciseEntityDictionary)
            {
                var userId = kvp.Key;
                if (!userHealthDataMap.TryGetValue(userId, out var allUserHealthEntities))
                {
                    _logger.LogInformation($"No health data cached for user {userId}");
                    continue;
                }

                foreach (var entity in kvp.Value)
                {
                    _logger.LogDebug($"Processing exercise entity for user {kvp.Key}: {entity.Id}");

                    if (!DateTime.TryParse(entity.StartTimestamp, out var start))
                    {
                        _logger.LogWarning($"Invalid StartTimestamp for exercise entity {entity.Id} of user {kvp.Key}: {entity.StartTimestamp}");
                        continue;
                    }

                    if (!DateTime.TryParse(entity.EndTimestamp, out var end))
                    {
                        _logger.LogWarning($"Invalid EndTimestamp for exercise entity {entity.Id} of user {kvp.Key}: {entity.EndTimestamp}");
                        continue;
                    }

                    var relatedHealthConnectEntities = allUserHealthEntities
                        .Where(x => TryParseDate(x.StartTimestamp, out var s) && TryParseDate(x.EndTimestamp, out var e) && s >= start && e <= end)
                        .ToHashSet();

                    if (!relatedHealthConnectEntities.Any())
                    {
                        _logger.LogInformation($"No related health connect entities found for exercise entity {entity.Id} of user {kvp.Key}");
                        continue;
                    }

                    result.Add(new AiHealthConnectExerciseTrainingDataEntity
                    {
                        Key = GetTrainingDataKey(kvp.Key, entity),
                        ExerciseType = entity.ExerciseType ?? ExerciseTypeEnum.OtherWorkout,
                        StartTimeStamp = start,
                        EndTimeStamp = end,
                        Weight = GetValue(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.Weight),
                        DistanceInMeters = GetSumOf(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.Distance),
                        Steps = GetSumOf(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.Steps),
                        Vo2Max = GetValue(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.Vo2Max),
                        LeanBodyMass = GetValue(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.LeanBodyMass),
                        MaxHeartRate = GetMaxValue(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.HeartRate),
                        MinHeartRate = GetMinValue(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.HeartRate),
                        ElevationGain = GetValue(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.ElevationGained),
                        CaloriesBurned = GetSumOf(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.ActiveCaloriesBurned),
                        BodyFat = GetValue(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.BodyFat),
                        OxygenSaturationAvg = GetAvgOf(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.OxygenSaturation),
                        RespiratoryRatePerMinuteAvg = GetAvgOf(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.RespiratoryRate),
                        HeartRateAvg = GetAvgOf(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.HeartRate),
                        CyclingPedalingCadenceAvg = GetAvgOf(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.CyclingPedalingCadence),
                        PowerAvg = GetAvgOf(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.Power),
                        SpeedAvg = GetAvgOf(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.Speed),
                        StepsCadenceAvg = GetAvgOf(relatedHealthConnectEntities, x => x.Type == HealthConnectRecordTypeEnum.StepsCadence),
                    });
                }
            }

            return result;
        }

        private bool TryParseDate(string dateString, out DateTime parsed)
        {
            return DateTime.TryParse(dateString, out parsed);
        }

        private string GetTrainingDataKey(long userId, HealthConnectDataEntity entity)
        {
            var exerciseType = entity.ExerciseType ?? ExerciseTypeEnum.OtherWorkout;
            return $"{userId}_{exerciseType}_{entity.StartTimestamp}_{entity.EndTimestamp}";
        }

        private decimal GetValue(HashSet<HealthConnectDataEntity> entities, Func<HealthConnectDataEntity, bool> predicate)
        {
            return entities.FirstOrDefault(predicate)?.Value ?? 0;
        }

        private decimal GetMaxValue(HashSet<HealthConnectDataEntity> entities, Func<HealthConnectDataEntity, bool> predicate)
        {
            var vals = entities.Where(predicate).Select(x => x.Value);
            return vals.Any() ? vals.Max() : 0;
        }

        private decimal GetMinValue(HashSet<HealthConnectDataEntity> entities, Func<HealthConnectDataEntity, bool> predicate)
        {
            var vals = entities.Where(predicate).Select(x => x.Value);
            return vals.Any() ? vals.Min() : 0;
        }

        private decimal GetSumOf(HashSet<HealthConnectDataEntity> entities, Func<HealthConnectDataEntity, bool> predicate)
        {
            return entities.Where(predicate).Sum(x => x.Value);
        }

        private decimal GetAvgOf(HashSet<HealthConnectDataEntity> entities, Func<HealthConnectDataEntity, bool> predicate)
        {
            var filteredEntities = entities.Where(predicate).ToList();

            return filteredEntities.Any() ? filteredEntities.Average(x => x.Value) : 0;
        }

        private bool UserIdIsIncludedInKey(string key, IEnumerable<string> userIds)
        {
            // Keys are generated as: "{userId}_{exerciseType}_{start}_{end}"
            return userIds.Any(id => key.StartsWith($"{id}_"));
        }
    }
}
