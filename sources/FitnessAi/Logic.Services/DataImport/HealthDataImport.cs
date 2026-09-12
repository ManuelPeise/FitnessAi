using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.HealthConnect;
using Data.Database.Entities.Nutrition;
using Data.Database.Entities.User;
using Data.Database.Models.Scheduler;
using Logic.Services.Interfaces;
using Logic.Shared.Interfaces;
using Microsoft.Extensions.Logging;
using Shared.Enums.HealthConnect;
using Shared.Models.HealthConnect.ImportModels;
using System.Linq.Expressions;


namespace Logic.Services.DataImport
{
    public class HealthDataImport : IHealthDataImport
    {
        private const string HealthConnectTrainingJobName = "Ai Health Connect Training Data Job";
        private const string HealthConnectTrainingJobDescription = "Train the Ai model with the imported health data.";
        private const string HealthConnectTrainingJobUrl = "AiTrainingDataGeneration/GenerateAiTrainingData";
        private readonly ILogger<HealthDataImport> _logger;
        private readonly IApplicationUnitOfWork _applicationUnitOfWork;
        private readonly IHealthUnitOfWork _healthUnitOfWork;
        private readonly IScheduledJobService _scheduledJobService;
        private readonly ICurrentUserService _currentUserService;

        public HealthDataImport(
            ILogger<HealthDataImport> logger,
            IApplicationUnitOfWork applicationUnitOfWork,
            IHealthUnitOfWork healthUnitOfWork,
            IScheduledJobService scheduledJobService,
            ICurrentUserService currentUserService)
        {
            _logger = logger;
            _applicationUnitOfWork = applicationUnitOfWork;
            _healthUnitOfWork = healthUnitOfWork;
            _scheduledJobService = scheduledJobService;
            _currentUserService = currentUserService;
        }

        public async Task ImportHealthConnectData(List<HealthConnectDailyDataModel> models)
        {
            try
            {
                var userId = _currentUserService.UserId;

                var healthData = models.Select(m => new HealthConnectHealthDataModel
                {
                    Date = m.Date,
                    AggregatedData = m.AggregatedData
                }).ToHashSet();

                var weightDictionary = models.ToDictionary(x => x.Date.Date, x => x.AggregatedData.WeightAvg);
                var bodyFatDictionary = models.ToDictionary(x => x.Date.Date, x => x.AggregatedData.BodyFatPercentageAvg);

                var lastAggregatedData = healthData.OrderByDescending(h => h.Date).FirstOrDefault()?.AggregatedData;
                var maxDate = models.Max(h => h.Date);

                var bodyDataEntity = await UpdateBodyData(userId, maxDate, lastAggregatedData);
                var healthDataHelper = new HealthDataImportHelper(bodyDataEntity);
                var userEntity = await GetUserWithAiSettings(userId);

                var healthDataAddedOrUpdated = await ProcessHealthData(
                    healthData,
                    healthDataHelper,
                    weightDictionary,
                    bodyFatDictionary,
                    userId,
                    maxDate);

                var trainingData = models.SelectMany(m => m.TrainingData.Select(t => new HealthConnectTrainingData
                {
                    Date = m.Date,
                    TrainingData = t
                })).ToHashSet();

                var trainingDataAddedOrUpdated = await ProcessTrainingData(trainingData, healthDataHelper, weightDictionary, bodyFatDictionary, userId, maxDate, userEntity);

                var nutritionDataAddedOrUpdated = await ProcessNutritionData(healthData, userId);

                if (healthDataAddedOrUpdated || trainingDataAddedOrUpdated || nutritionDataAddedOrUpdated)
                {
                    await _healthUnitOfWork.SaveChangesAsync();
                }
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "An error occurred while importing health connect data.");
            }
        }

        private async Task<bool> ProcessHealthData(
            HashSet<HealthConnectHealthDataModel> healthData,
            HealthDataImportHelper healthDataHelper,
            Dictionary<DateTime, decimal?> weightDictionary,
            Dictionary<DateTime, decimal?> bodyFatDictionary,
            long userId,
            DateTime maxDate)
        {
            try
            {
                if (!healthData.Any())
                {
                    _logger.LogInformation("No health data to process.");
                    return false;
                }

                var dataKeys = healthData.Select(model => $"{model.Date:yyyy-MM-dd}_{userId}").ToList();
                var existingEntities = await GetExistingHealthDataEntities(dataKeys);
                var databaseChanged = false;

                foreach (var model in healthData)
                {
                    var dataKey = $"{model.Date:yyyy-MM-dd}_{userId}";

                    if (string.IsNullOrEmpty(dataKey))
                    {
                        _logger.LogWarning($"Health data for user {userId} has no valid date, skipping...");
                        continue;
                    }

                    if (existingEntities.TryGetValue(dataKey, out var existingEntity))
                    {
                        _logger.LogInformation($"Health data for user {userId} on {model.Date:yyyy-MM-dd} already exists, update data...");

                        UpdateExistingHealthDataEntity(existingEntity, model, healthDataHelper, weightDictionary, bodyFatDictionary, maxDate);

                        databaseChanged = true;
                        continue;
                    }

                    var entity = await CreateHealthEntity(model, healthDataHelper, weightDictionary, bodyFatDictionary, dataKey, userId);

                    await _healthUnitOfWork.HealthConnectHealthDataRepository.AddAsync(entity);
                    databaseChanged = true;
                }

                return databaseChanged;
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "An error occurred while processing health data.");

                return false;
            }
        }

        private async Task<Dictionary<string, HealthConnectHealthDataEntity>> GetExistingHealthDataEntities(List<string> dataKeys)
        {
            var existingEntities = await _healthUnitOfWork.HealthConnectHealthDataRepository.GetAsync(new DbQueryOptions<HealthConnectHealthDataEntity>
            {
                WhereExpression = entity => dataKeys.Contains(entity.DataKey),
                Includes = new List<Expression<Func<HealthConnectHealthDataEntity, object>>>
                {
                    entity => entity.Values!,
                    entity => entity.Values!.HeartRate!,
                    entity => entity.Values!.RestingHeartRate!,
                    entity => entity.Values!.BloodPressure!
                }
            });

            return existingEntities.ToDictionary(entity => entity.DataKey);
        }

        private async Task<bool> ProcessNutritionData(HashSet<HealthConnectHealthDataModel> healthData, long userId)
        {
            try
            {
                if (!healthData.Any())
                {
                    return false;
                }

                var dataKeys = healthData.Select(model => $"{model.Date:yyyy-MM-dd}_{userId}").ToList();
                var existingEntities = await GetExistingNutritionDataEntities(dataKeys);
                var databaseChanged = false;

                foreach (var model in healthData)
                {
                    if (!HasNutritionData(model.AggregatedData))
                    {
                        continue;
                    }

                    var dataKey = $"{model.Date:yyyy-MM-dd}_{userId}";

                    if (existingEntities.TryGetValue(dataKey, out var existingEntity))
                    {
                        UpdateNutritionValues(existingEntity.Values, model.AggregatedData);
                        databaseChanged = true;
                        continue;
                    }

                    await _healthUnitOfWork.NutritionDataRepository.AddAsync(CreateNutritionEntity(model, dataKey, userId));
                    databaseChanged = true;
                }

                return databaseChanged;
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "An error occurred while processing nutrition data.");

                return false;
            }
        }

        private async Task<Dictionary<string, NutritionDataEntity>> GetExistingNutritionDataEntities(List<string> dataKeys)
        {
            var existingEntities = await _healthUnitOfWork.NutritionDataRepository.GetAsync(new DbQueryOptions<NutritionDataEntity>
            {
                WhereExpression = entity => dataKeys.Contains(entity.DataKey),
                Includes = new List<Expression<Func<NutritionDataEntity, object>>>
                {
                    entity => entity.Values!
                }
            });

            return existingEntities.ToDictionary(entity => entity.DataKey);
        }

        private static bool HasNutritionData(HealthConnectAggregatedData aggregatedData)
        {
            return aggregatedData.CaloriesKcal != null
                || aggregatedData.ProteinGrams != null
                || aggregatedData.CarbohydratesGrams != null
                || aggregatedData.FatGrams != null
                || aggregatedData.FiberGrams != null
                || aggregatedData.SugarGrams != null;
        }

        private static NutritionDataEntity CreateNutritionEntity(HealthConnectHealthDataModel model, string dataKey, long userId)
        {
            return new NutritionDataEntity
            {
                DataKey = dataKey,
                StartTime = model.Date,
                EndTime = model.Date.AddDays(1).AddTicks(-1),
                UserId = userId,
                Values = new NutritionValuesEntity
                {
                    CaloriesKcal = model.AggregatedData.CaloriesKcal,
                    ProteinGrams = model.AggregatedData.ProteinGrams,
                    CarbohydratesGrams = model.AggregatedData.CarbohydratesGrams,
                    FatGrams = model.AggregatedData.FatGrams,
                    FiberGrams = model.AggregatedData.FiberGrams,
                    SugarGrams = model.AggregatedData.SugarGrams,
                }
            };
        }

        private static void UpdateNutritionValues(NutritionValuesEntity? values, HealthConnectAggregatedData aggregatedData)
        {
            if (values == null)
            {
                return;
            }

            values.CaloriesKcal = aggregatedData.CaloriesKcal;
            values.ProteinGrams = aggregatedData.ProteinGrams;
            values.CarbohydratesGrams = aggregatedData.CarbohydratesGrams;
            values.FatGrams = aggregatedData.FatGrams;
            values.FiberGrams = aggregatedData.FiberGrams;
            values.SugarGrams = aggregatedData.SugarGrams;
        }

        private async Task<HealthConnectHealthDataEntity> CreateHealthEntity(
            HealthConnectHealthDataModel model,
            HealthDataImportHelper healthDataHelper,
            Dictionary<DateTime, decimal?> weightDictionary,
            Dictionary<DateTime, decimal?> bodyFatDictionary,
            string dataKey,
            long userId)
        {
            return new HealthConnectHealthDataEntity
            {
                DataKey = dataKey,
                TimeStamp = model.Date.Date,
                StartTime = model.Date,
                EndTime = model.Date.AddDays(1).AddTicks(-1),
                UserId = userId,
                Values = new HealthConnectValuesEntity
                {
                    ActiveCaloriesBurnedInKcal = model.AggregatedData.ActiveCaloriesBurnedInKcal,
                    TotalCaloriesBurnedInKcal = model.AggregatedData.TotalCaloriesBurnedInKcal,
                    HydrationAvg = model.AggregatedData.HydrationAvg,
                    Steps = model.AggregatedData.Steps,
                    Weight = healthDataHelper.GetWeight(weightDictionary, model.Date),
                    SleepDurationInSeconds = model.AggregatedData.SleepDurationInSeconds,
                    FloorsClimbed = model.AggregatedData.FloorsClimbed,
                    BasalMetabolicRateInKcal = model.AggregatedData.BasalMetabolicRateInKcal,
                    WheelchairPushes = model.AggregatedData.WheelchairPushes,
                    HeightInMeters = healthDataHelper.GetHeight(),
                    BodyFatPercentageAvg = healthDataHelper.GetGetBodyFatPercentage(bodyFatDictionary, model.Date),
                    OxygenSaturationPercentageAvg = model.AggregatedData.OxygenSaturationPercentageAvg,
                    RespiratoryRateAvg = model.AggregatedData.RespiratoryRateAvg,
                    Vo2MaxMlPerMinKgAvg = model.AggregatedData.Vo2MaxMlPerMinKgAvg,
                    HeartRate = new HealthConnectAvgEntity
                    {
                        Avg = model.AggregatedData.HeartRate?.Avg,
                        Min = model.AggregatedData.HeartRate?.Min,
                        Max = model.AggregatedData.HeartRate?.Max,
                        UnitId = (long)HealthConnectUnitTypeEnum.BeatsPerMinute
                    },
                    BloodPressure = new HealthConnectBloodPressureEntity
                    {
                        Systolic = model.AggregatedData.BloodPressure?.Systolic,
                        Diastolic = model.AggregatedData.BloodPressure?.Diastolic,
                        UnitId = (long)HealthConnectUnitTypeEnum.MillimetersOfMercury
                    },
                    RestingHeartRate = new HealthConnectAvgEntity
                    {
                        Avg = model.AggregatedData.RestingHeartRate?.Avg,
                        Min = model.AggregatedData.RestingHeartRate?.Min,
                        Max = model.AggregatedData.RestingHeartRate?.Max,
                        UnitId = (long)HealthConnectUnitTypeEnum.BeatsPerMinute
                    }
                }
            };
        }

        private void UpdateExistingHealthDataEntity(
            HealthConnectHealthDataEntity existingEntity,
            HealthConnectHealthDataModel model,
            HealthDataImportHelper healthDataHelper,
            Dictionary<DateTime, decimal?> weightDictionary,
            Dictionary<DateTime, decimal?> bodyFatDictionary,
            DateTime maxDate)
        {
            existingEntity.TimeStamp = model.Date.Date;
            existingEntity.StartTime = model.Date;
            existingEntity.EndTime = model.Date.AddDays(1).AddTicks(-1);

            var values = existingEntity.Values;

            if (values == null)
            {
                return;
            }

            values.ActiveCaloriesBurnedInKcal = model.AggregatedData.ActiveCaloriesBurnedInKcal;
            values.TotalCaloriesBurnedInKcal = model.AggregatedData.TotalCaloriesBurnedInKcal;
            values.HydrationAvg = model.AggregatedData.HydrationAvg;
            values.Steps = model.AggregatedData.Steps;

            values.SleepDurationInSeconds = model.AggregatedData.SleepDurationInSeconds;
            values.FloorsClimbed = model.AggregatedData.FloorsClimbed;
            values.BasalMetabolicRateInKcal = model.AggregatedData.BasalMetabolicRateInKcal;
            values.WheelchairPushes = model.AggregatedData.WheelchairPushes;
            values.HeightInMeters = model.AggregatedData.HeightInMeters;
            values.OxygenSaturationPercentageAvg = model.AggregatedData.OxygenSaturationPercentageAvg;
            values.RespiratoryRateAvg = model.AggregatedData.RespiratoryRateAvg;
            values.Vo2MaxMlPerMinKgAvg = model.AggregatedData.Vo2MaxMlPerMinKgAvg;

            if (maxDate.Date == DateTime.UtcNow.Date)
            {
                values.Weight = healthDataHelper.GetWeight(weightDictionary, model.Date);
                values.BodyFatPercentageAvg = healthDataHelper.GetGetBodyFatPercentage(bodyFatDictionary, model.Date);
            }

            if (model.AggregatedData.HeartRate != null)
            {
                values.HeartRate = UpdateAvgEntity(values.HeartRate, model.AggregatedData.HeartRate, HealthConnectUnitTypeEnum.BeatsPerMinute);
            }

            if (model.AggregatedData.BloodPressure != null)
            {
                values.BloodPressure ??= new HealthConnectBloodPressureEntity();
                values.BloodPressure.Systolic = model.AggregatedData.BloodPressure.Systolic;
                values.BloodPressure.Diastolic = model.AggregatedData.BloodPressure.Diastolic;
                values.BloodPressure.UnitId = (long)HealthConnectUnitTypeEnum.MillimetersOfMercury;
            }

            if (model.AggregatedData.RestingHeartRate != null)
            {
                values.RestingHeartRate = UpdateAvgEntity(values.RestingHeartRate, model.AggregatedData.RestingHeartRate, HealthConnectUnitTypeEnum.BeatsPerMinute);
            }
        }

        private async Task<bool> ProcessTrainingData(
            HashSet<HealthConnectTrainingData> trainingData,
            HealthDataImportHelper healthDataHelper,
            Dictionary<DateTime, decimal?> weightDictionary,
            Dictionary<DateTime, decimal?> bodyFatDictionary,
            long userId,
            DateTime maxDate,
            UserEntity? userEntity)
        {
            try
            {
                if (!trainingData.Any())
                {
                    _logger.LogInformation("No training data to process.");
                    return false;
                }

                var dataKeys = trainingData
                    .Where(data => !string.IsNullOrEmpty(data.TrainingData.ExerciseMetricId))
                    .Select(data => data.TrainingData.ExerciseMetricId!)
                    .ToList();

                var existingEntities = await GetExistingTrainingDataEntities(dataKeys);
                var timeZonesByOffset = await GetTimeZoneEntities(trainingData);
                var allowedForAiTraining = userEntity?.Settings?.AiSettings?.CanUseHealthDataForAiTraining ?? false;
                var databaseChanged = false;

                foreach (var data in trainingData)
                {
                    if (string.IsNullOrEmpty(data.TrainingData.ExerciseMetricId))
                    {
                        _logger.LogWarning($"Training data for user {userId} on {data.Date:yyyy-MM-dd} has no ExerciseMetricId, skipping...");
                        continue;
                    }

                    var dataKey = data.TrainingData.ExerciseMetricId;

                    if (existingEntities.TryGetValue(dataKey, out var existingEntity))
                    {
                        _logger.LogInformation($"Training data for user {userId} on {data.Date:yyyy-MM-dd} already exists, update data...");

                        UpdateTrainingData(
                            existingEntity,
                            data.TrainingData,
                            healthDataHelper,
                            weightDictionary,
                            bodyFatDictionary,
                            maxDate,
                            userId);

                        databaseChanged = true;
                        continue;
                    }

                    var entity = CreateNewTrainingDataEntity(
                        data.TrainingData,
                        healthDataHelper,
                        weightDictionary,
                        bodyFatDictionary,
                        dataKey,
                        userId,
                        allowedForAiTraining,
                        timeZonesByOffset);

                    if (entity == null)
                    {
                        continue;
                    }

                    await _healthUnitOfWork.HealthConnectTrainingDataRepository.AddAsync(entity);
                    databaseChanged = true;
                }

                if (databaseChanged && allowedForAiTraining)
                {
                    await _scheduledJobService.AddJobAsync(
                        HealthConnectTrainingJobName,
                        HealthConnectTrainingJobDescription, new WebServiceModel
                        {
                            Url = new Uri(HealthConnectTrainingJobUrl, UriKind.Relative),
                        });
                }

                return databaseChanged;
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "An error occurred while processing training data.");
                return false;
            }
        }

        private async Task<Dictionary<string, HealthConnectTrainingDataEntity>> GetExistingTrainingDataEntities(List<string> dataKeys)
        {
            var existingEntities = await _healthUnitOfWork.HealthConnectTrainingDataRepository.GetAsync(new DbQueryOptions<HealthConnectTrainingDataEntity>
            {
                WhereExpression = entity => dataKeys.Contains(entity.DataKey),
                Includes = new List<Expression<Func<HealthConnectTrainingDataEntity, object>>>
                {
                    entity => entity.HealthConnectTrainingDataValues,
                    entity => entity.HealthConnectTrainingDataValues.HeartRate!,
                    entity => entity.HealthConnectTrainingDataValues.RestingHeartRate!,
                    entity => entity.HealthConnectTrainingDataValues.CyclingPedalingCadence!,
                    entity => entity.HealthConnectTrainingDataValues.Power!,
                    entity => entity.HealthConnectTrainingDataValues.Speed!,
                    entity => entity.HealthConnectTrainingDataValues.StepCadence!,
                    entity => entity.HealthConnectTrainingDataValues.Laps,
                    entity => entity.HealthConnectTrainingDataValues.Segments,
                }
            });

            return existingEntities.ToDictionary(entity => entity.DataKey);
        }

        private async Task<Dictionary<int, HealthConnectTimeZoneEntity>> GetTimeZoneEntities(HashSet<HealthConnectTrainingData> trainingData)
        {
            var offsets = trainingData
                .Select(data => data.TrainingData.TimeZoneInfo?.Offset)
                .Where(offset => offset != null)
                .Select(offset => offset!.Value)
                .Distinct()
                .ToList();

            if (offsets.Count == 0)
            {
                return new Dictionary<int, HealthConnectTimeZoneEntity>();
            }

            var existingEntities = await _healthUnitOfWork.HealthConnectTimeZoneRepository.GetAsync(new DbQueryOptions<HealthConnectTimeZoneEntity>
            {
                WhereExpression = entity => offsets.Contains(entity.Offset)
            });

            return existingEntities
                .GroupBy(entity => entity.Offset)
                .ToDictionary(group => group.Key, group => group.First());
        }

        private HealthConnectTrainingDataEntity? CreateNewTrainingDataEntity(
            HealthConnectTrainingDataRecordData trainingData,
            HealthDataImportHelper healthDataHelper,
            Dictionary<DateTime, decimal?> weightDictionary,
            Dictionary<DateTime, decimal?> bodyFatDictionary,
            string dataKey,
            long userId,
            bool allowedForAiTraining,
            Dictionary<int, HealthConnectTimeZoneEntity> timeZonesByOffset)
        {
            if (trainingData == null)
            {
                return null;
            }

            var timeZoneEntity = ResolveTimeZoneEntity(trainingData.TimeZoneInfo?.Offset, timeZonesByOffset);

            return new HealthConnectTrainingDataEntity
            {
                DataKey = dataKey,
                Origin = trainingData.Origin ?? "Unknown",
                System = trainingData.System ?? "Unknown",
                StartTime = trainingData.StartTime,
                EndTime = trainingData.EndTime,
                UserId = userId,
                AllowedForAiTraining = allowedForAiTraining,
                ExerciseType = trainingData.ExerciseType,
                HealthConnectTimeZoneEntity = timeZoneEntity,
                HealthConnectTrainingDataValues = new HealthConnectTrainingDataValuesEntity
                {
                    ActiveCaloriesBurnedInKcal = trainingData.ActiveCaloriesBurnedInKcal,
                    DistanceInMeters = trainingData.DistanceInMeters,
                    DurationSeconds = trainingData.DurationSeconds,
                    ElevationAvg = trainingData.ElevationAvg,
                    HydrationAvg = trainingData.HydrationAvg,
                    Steps = trainingData.Steps,
                    BodyFatPercentage = healthDataHelper.GetGetBodyFatPercentage(bodyFatDictionary, trainingData.StartTime),
                    OxygenSaturationPercentageAvg = trainingData.OxygenSaturationPercentageAvg,
                    RespiratoryRateAvg = trainingData.RespiratoryRateAvg,
                    Vo2MaxMlPerMinKgAvg = trainingData.Vo2MaxMlPerMinKgAvg,
                    WeightAvg = healthDataHelper.GetWeight(weightDictionary, trainingData.StartTime),
                    Notes = !string.IsNullOrEmpty(trainingData?.Notes) ? trainingData.Notes : null,
                    RestingHeartRate = new HealthConnectAvgEntity
                    {
                        Avg = trainingData?.RestingHeartRate?.Avg,
                        Min = trainingData?.RestingHeartRate?.Min,
                        Max = trainingData?.RestingHeartRate?.Max,
                        UnitId = (long)HealthConnectUnitTypeEnum.BeatsPerMinute
                    },
                    StepCadence = new HealthConnectAvgEntity
                    {
                        Avg = trainingData?.StepCadence?.Avg,
                        Min = trainingData?.StepCadence?.Min,
                        Max = trainingData?.StepCadence?.Max,
                        UnitId = (long)HealthConnectUnitTypeEnum.StepsPerMinute
                    },
                    CyclingPedalingCadence = new HealthConnectAvgEntity
                    {
                        Avg = trainingData?.CyclingPedalingCadence?.Avg,
                        Min = trainingData?.CyclingPedalingCadence?.Min,
                        Max = trainingData?.CyclingPedalingCadence?.Max,
                        UnitId = (long)HealthConnectUnitTypeEnum.RevolutionsPerMinute
                    },
                    HeartRate = new HealthConnectAvgEntity
                    {
                        Avg = trainingData?.HeartRate?.Avg,
                        Min = trainingData?.HeartRate?.Min,
                        Max = trainingData?.HeartRate?.Max,
                        UnitId = (long)HealthConnectUnitTypeEnum.BeatsPerMinute
                    },
                    Power = new HealthConnectAvgEntity
                    {
                        Avg = trainingData?.Power?.Avg,
                        Min = trainingData?.Power?.Min,
                        Max = trainingData?.Power?.Max,
                        UnitId = (long)HealthConnectUnitTypeEnum.Watts
                    },
                    Speed = new HealthConnectAvgEntity
                    {
                        Avg = trainingData?.Speed?.Avg,
                        Min = trainingData?.Speed?.Min,
                        Max = trainingData?.Speed?.Max,
                        UnitId = (long)HealthConnectUnitTypeEnum.KilometersPerHour
                    },
                    Segments = (trainingData?.Segments ?? new List<HealthConnectSegment>()).Select(segment => new HealthConnectSegmentEntity
                    {
                        StartTime = segment.StartTime,
                        EndTime = segment.EndTime,
                        SegmentType = segment.SegmentType,
                        Repetitions = segment.Repetitions
                    }).ToList(),
                    Laps = (trainingData?.Laps ?? new List<HealthConnectLap>()).Select(lap => new HealthConnectLapEntity
                    {
                        StartTime = lap.StartTime,
                        EndTime = lap.EndTime,
                        LengthInMeters = lap.LengthInMeters
                    }).ToList(),

                }
            };
        }

        private static HealthConnectTimeZoneEntity ResolveTimeZoneEntity(int? offset, Dictionary<int, HealthConnectTimeZoneEntity> timeZonesByOffset)
        {
            var resolvedOffset = offset ?? 0;

            if (timeZonesByOffset.TryGetValue(resolvedOffset, out var existingEntity))
            {
                return existingEntity;
            }

            var newEntity = new HealthConnectTimeZoneEntity { Offset = resolvedOffset };
            timeZonesByOffset[resolvedOffset] = newEntity;

            return newEntity;
        }

        private void UpdateTrainingData(
            HealthConnectTrainingDataEntity existingEntity,
            HealthConnectTrainingDataRecordData trainingData,
            HealthDataImportHelper healthDataHelper,
            Dictionary<DateTime, decimal?> weightDictionary,
            Dictionary<DateTime, decimal?> bodyFatDictionary,
            DateTime maxDate,
            long userId)
        {
            existingEntity.Origin = trainingData.Origin ?? "Unknown";
            existingEntity.System = trainingData.System ?? "Unknown";
            existingEntity.StartTime = trainingData.StartTime;
            existingEntity.EndTime = trainingData.EndTime;
            existingEntity.ExerciseType = trainingData.ExerciseType;
            existingEntity.UserId = userId;

            var values = existingEntity.HealthConnectTrainingDataValues;

            if (values == null)
            {
                return;
            }

            values.ActiveCaloriesBurnedInKcal = trainingData.ActiveCaloriesBurnedInKcal;
            values.DistanceInMeters = trainingData.DistanceInMeters;
            values.DurationSeconds = trainingData.DurationSeconds;
            values.ElevationAvg = trainingData.ElevationAvg;
            values.HydrationAvg = trainingData.HydrationAvg;
            values.Steps = trainingData.Steps;
            values.CyclingPedalingCadence = UpdateAvgEntity(values.CyclingPedalingCadence, trainingData.CyclingPedalingCadence, HealthConnectUnitTypeEnum.RevolutionsPerMinute);
            values.HeartRate = UpdateAvgEntity(values.HeartRate, trainingData.HeartRate, HealthConnectUnitTypeEnum.BeatsPerMinute);
            values.Power = UpdateAvgEntity(values.Power, trainingData.Power, HealthConnectUnitTypeEnum.Watts);
            values.Speed = UpdateAvgEntity(values.Speed, trainingData.Speed, HealthConnectUnitTypeEnum.KilometersPerHour);
            values.RestingHeartRate = UpdateAvgEntity(values.RestingHeartRate, trainingData.RestingHeartRate, HealthConnectUnitTypeEnum.BeatsPerMinute);
            values.StepCadence = UpdateAvgEntity(values.StepCadence, trainingData.StepCadence, HealthConnectUnitTypeEnum.StepsPerMinute);
            values.Laps = UpdateLapEntities(values.Laps, trainingData.Laps);
            values.Segments = UpdateSegmentEntities(values.Segments, trainingData.Segments);
            values.OxygenSaturationPercentageAvg = trainingData.OxygenSaturationPercentageAvg;
            values.RespiratoryRateAvg = trainingData.RespiratoryRateAvg;
            values.Vo2MaxMlPerMinKgAvg = trainingData.Vo2MaxMlPerMinKgAvg;

            if (maxDate.Date == DateTime.UtcNow.Date)
            {
                values.WeightAvg = healthDataHelper.GetWeight(weightDictionary, trainingData.StartTime);
                values.BodyFatPercentage = healthDataHelper.GetGetBodyFatPercentage(bodyFatDictionary, trainingData.StartTime);
            }
        }

        private static HealthConnectAvgEntity? UpdateAvgEntity(HealthConnectAvgEntity? existingAvg, HealthConnectValues? source, HealthConnectUnitTypeEnum unitType)
        {
            if (source == null)
            {
                return existingAvg;
            }

            existingAvg ??= new HealthConnectAvgEntity();

            existingAvg.Avg = source.Avg;
            existingAvg.Min = source.Min;
            existingAvg.Max = source.Max;
            existingAvg.UnitId = (long)unitType;

            return existingAvg;
        }

        private static ICollection<HealthConnectLapEntity> UpdateLapEntities(ICollection<HealthConnectLapEntity> existingLaps, List<HealthConnectLap> laps)
        {
            if (laps == null)
            {
                return existingLaps;
            }

            foreach (var lap in laps)
            {
                var existingLap = existingLaps.FirstOrDefault(l => l.StartTime == lap.StartTime && l.EndTime == lap.EndTime);

                if (existingLap != null)
                {
                    existingLap.StartTime = lap.StartTime;
                    existingLap.EndTime = lap.EndTime;
                    existingLap.LengthInMeters = lap.LengthInMeters;
                }
                else
                {
                    existingLaps.Add(new HealthConnectLapEntity
                    {
                        StartTime = lap.StartTime,
                        EndTime = lap.EndTime,
                        LengthInMeters = lap.LengthInMeters
                    });
                }
            }

            return existingLaps;
        }

        private static ICollection<HealthConnectSegmentEntity> UpdateSegmentEntities(ICollection<HealthConnectSegmentEntity> existingSegments, List<HealthConnectSegment> segments)
        {
            if (segments == null)
            {
                return existingSegments;
            }

            foreach (var segment in segments)
            {
                var existingSegment = existingSegments.FirstOrDefault(s => s.StartTime == segment.StartTime && s.EndTime == segment.EndTime);

                if (existingSegment != null)
                {
                    existingSegment.StartTime = segment.StartTime;
                    existingSegment.EndTime = segment.EndTime;
                    existingSegment.SegmentType = segment.SegmentType;
                    existingSegment.Repetitions = segment.Repetitions;
                }
                else
                {
                    existingSegments.Add(new HealthConnectSegmentEntity
                    {
                        StartTime = segment.StartTime,
                        EndTime = segment.EndTime,
                        SegmentType = segment.SegmentType,
                        Repetitions = segment.Repetitions
                    });
                }
            }

            return existingSegments;
        }

        private async Task<UserEntity?> GetUserWithAiSettings(long userId)
        {
            return await _applicationUnitOfWork.UserRepository.GetSingleAsync(new DbQueryOptions<UserEntity>
            {
                WhereExpression = entity => entity.Id == userId,
                Includes = new List<Expression<Func<UserEntity, object>>>
                {
                    entity => entity.Settings.AiSettings
                }
            });
        }

        private async Task<UserBodyDataEntity?> UpdateBodyData(long userId, DateTime modelDate, HealthConnectAggregatedData? model = null)
        {
            var bodyData = await _applicationUnitOfWork.UserBodyDataRepository.GetSingleAsync(new DbQueryOptions<UserBodyDataEntity>
            {
                WhereExpression = x => x.UserId == userId,
            });

            if (bodyData != null && model != null && modelDate.Date == DateTime.UtcNow.Date)
            {
                bodyData.Weight = bodyData.CanUpdateWeightOnHealthDataImport ? model.WeightAvg : bodyData.Weight;
                bodyData.BodyFatPercentageAvg = bodyData.CanUpdateBodyFatPercentageOnHealthDataImport ? model.BodyFatPercentageAvg : bodyData.BodyFatPercentageAvg;
            }

            return bodyData;
        }

        public sealed class HealthConnectHealthDataModel
        {
            public DateTime Date { get; set; }
            public HealthConnectAggregatedData AggregatedData { get; set; } = new();
        }

        public sealed class HealthConnectTrainingData
        {
            public DateTime Date { get; set; }
            public HealthConnectTrainingDataRecordData TrainingData { get; set; } = new();
        }

    }
}
