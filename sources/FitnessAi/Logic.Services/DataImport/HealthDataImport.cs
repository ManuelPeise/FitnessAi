using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.HealthConnect;
using Data.Database.Entities.User;
using Data.Database.Models.Scheduler;
using Logic.Services.Interfaces;
using Logic.Shared.Interfaces;
using Microsoft.Extensions.Logging;
using Shared.Enums.HealthConnect;
using Shared.Models.HealthConnect.ImportModels;
using System.Data;


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

                var healthDataAddedOrUpdated = await ProcessHealthData(healthData, userId);

                var trainingData = models.SelectMany(m => m.TrainingData.Select(t => new HealthConnectTrainingData
                {
                    Date = m.Date,
                    TrainingData = t
                })).ToHashSet();

                var trainingDataAddedOrUpdated = await ProcessTrainingData(trainingData, userId);

                if (healthDataAddedOrUpdated || trainingDataAddedOrUpdated)
                {
                    await _healthUnitOfWork.SaveChangesAsync();
                }
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "An error occurred while importing health connect data.");
            }
        }

        private async Task<bool> ProcessHealthData(HashSet<HealthConnectHealthDataModel> healthData, long userId)
        {
            try
            {
                var databaseChanged = false;

                if (!healthData.Any())
                {
                    _logger.LogInformation("No health data to process.");
                    return false;
                }

                foreach (var model in healthData)
                {
                    var dataKey = $"{userId}_{model.Date:yyyy-MM-dd}";

                    var existingEntity = await GetExistingHealthDataEntity(dataKey);

                    if (existingEntity != null)
                    {
                        _logger.LogInformation($"Health data for user {userId} on {model.Date:yyyy-MM-dd} already exists, update data...");

                        UpdateExistingHealthDataEntity(existingEntity, model);
                        databaseChanged = true;
                        continue;
                    }

                    var entity = CreateHealthEntity(model, dataKey, userId);

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

        private async Task<HealthConnectHealthDataEntity?> GetExistingHealthDataEntity(string dataKey)
        {
            var existingEntity = await _healthUnitOfWork.HealthConnectHealthDataRepository.GetSingleAsync(new DbQueryOptions<HealthConnectHealthDataEntity>
            {
                WhereExpression = entity => entity.DataKey == dataKey
            });
            return existingEntity;
        }

        private HealthConnectHealthDataEntity CreateHealthEntity(HealthConnectHealthDataModel model, string dataKey, long userId)
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
                    WeightAvg = model.AggregatedData.WeightAvg,
                    SleepDurationInSeconds = model.AggregatedData.SleepDurationInSeconds,
                    FloorsClimbed = model.AggregatedData.FloorsClimbed,
                    BasalMetabolicRateInKcal = model.AggregatedData.BasalMetabolicRateInKcal,
                    WheelchairPushes = model.AggregatedData.WheelchairPushes,
                    HeightInMeters = model.AggregatedData.HeightInMeters,
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
                    },
                }
            };
        }

        private void UpdateExistingHealthDataEntity(HealthConnectHealthDataEntity existingEntity, HealthConnectHealthDataModel model)
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
            values.WeightAvg = model.AggregatedData.WeightAvg;
            values.SleepDurationInSeconds = model.AggregatedData.SleepDurationInSeconds;
            values.FloorsClimbed = model.AggregatedData.FloorsClimbed;
            values.BasalMetabolicRateInKcal = model.AggregatedData.BasalMetabolicRateInKcal;
            values.WheelchairPushes = model.AggregatedData.WheelchairPushes;
            values.HeightInMeters = model.AggregatedData.HeightInMeters;

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

        private async Task<bool> ProcessTrainingData(HashSet<HealthConnectTrainingData> trainingData, long userId)
        {
            try
            {
                var databaseChanged = false;

                if (!trainingData.Any())
                {
                    _logger.LogInformation("No training data to process.");
                    return databaseChanged;
                }

                foreach (var data in trainingData)
                {
                    var dataKey = $"{userId}_{data.Date:yyyy-MM-dd}";

                    var existingEntity = await GetExistingTrainingDataEntity(dataKey);

                    if (existingEntity != null)
                    {
                        _logger.LogInformation($"Training data for user {userId} on {data.Date:yyyy-MM-dd} already exists, update data...");

                        UpdateTrainingData(existingEntity, data.TrainingData, userId);
                        databaseChanged = true;
                        continue;
                    }

                    var entity = await CreateNewTrainingDataEntity(data.TrainingData, dataKey, userId);

                    if (entity == null)
                    {
                        continue;
                    }

                    await _healthUnitOfWork.HealthConnectTrainingDataRepository.AddAsync(entity);
                    databaseChanged = true;
                }

                var userEntity = await _applicationUnitOfWork.UserRepository.GetSingleAsync(new DbQueryOptions<UserEntity>
                {
                    WhereExpression = entity => entity.Id == userId,
                    Includes = new List<System.Linq.Expressions.Expression<Func<UserEntity, object>>>
                    {
                        entity => entity.Settings.AiSettings
                    }
                });

                if (databaseChanged && userEntity?.Settings?.AiSettings?.CanUseHealthDataForAiTraining == true)
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

        private async Task<HealthConnectTrainingDataEntity?> GetExistingTrainingDataEntity(string dataKey)
        {
            var existingEntity = await _healthUnitOfWork.HealthConnectTrainingDataRepository.GetSingleAsync(new DbQueryOptions<HealthConnectTrainingDataEntity>
            {
                WhereExpression = entity => entity.DataKey == dataKey
            });
            return existingEntity;
        }

        private async Task<HealthConnectTimeZoneEntity?> GetTimeZoneEntity(int? value)
        {
            if (value == null)
            {
                return null;
            }

            var existingEntity = await _healthUnitOfWork.HealthConnectTimeZoneRepository.GetSingleAsync(new DbQueryOptions<HealthConnectTimeZoneEntity>
            {
                WhereExpression = entity => entity.Offset == value
            });

            return existingEntity;
        }

        private async Task<HealthConnectTrainingDataEntity?> CreateNewTrainingDataEntity(HealthConnectTrainingDataRecordData trainingData, string dataKey, long userId)
        {
            if (trainingData == null)
            {
                return null;
            }

            var timeZoneEntity = await GetTimeZoneEntity(trainingData.TimeZoneInfo?.Offset);

            return new HealthConnectTrainingDataEntity
            {
                DataKey = dataKey,
                Origin = trainingData.Origin ?? "Unknown",
                StartTime = trainingData.StartTime,
                EndTime = trainingData.EndTime,
                UserId = userId,
                ExerciseType = trainingData.ExerciseType,
                HealthConnectTimeZoneEntityId = timeZoneEntity?.Id ?? 0,
                HealthConnectTimeZoneEntity = timeZoneEntity ?? new HealthConnectTimeZoneEntity { Offset = trainingData.TimeZoneInfo?.Offset ?? 0 },
                HealthConnectTrainingDataValues = new HealthConnectTrainingDataValuesEntity
                {
                    ActiveCaloriesBurnedInKcal = trainingData.ActiveCaloriesBurnedInKcal,
                    TotalCaloriesBurnedInKcal = trainingData.TotalCaloriesBurnedInKcal,
                    DistanceInMeters = trainingData.DistanceInMeters,
                    DurationSeconds = trainingData.DurationSeconds,
                    ElevationAvg = trainingData.ElevationAvg,
                    HydrationAvg = trainingData.HydrationAvg,
                    RestingHeartRate = new HealthConnectAvgEntity
                    {
                        Avg = trainingData.RestingHeartRate?.Avg,
                        Min = trainingData.RestingHeartRate?.Min,
                        Max = trainingData.RestingHeartRate?.Max,
                        UnitId = (long)HealthConnectUnitTypeEnum.BeatsPerMinute
                    },
                    StepCadence = new HealthConnectAvgEntity
                    {
                        Avg = trainingData.StepCadence?.Avg,
                        Min = trainingData.StepCadence?.Min,
                        Max = trainingData.StepCadence?.Max,
                        UnitId = (long)HealthConnectUnitTypeEnum.StepsPerMinute
                    },
                    CyclingPedalingCadence = new HealthConnectAvgEntity
                    {
                        Avg = trainingData.CyclingPedalingCadence?.Avg,
                        Min = trainingData.CyclingPedalingCadence?.Min,
                        Max = trainingData.CyclingPedalingCadence?.Max,
                        UnitId = (long)HealthConnectUnitTypeEnum.RevolutionsPerMinute
                    },
                    HeartRate = new HealthConnectAvgEntity
                    {
                        Avg = trainingData.HeartRate?.Avg,
                        Min = trainingData.HeartRate?.Min,
                        Max = trainingData.HeartRate?.Max,
                        UnitId = (long)HealthConnectUnitTypeEnum.BeatsPerMinute
                    },
                    Power = new HealthConnectAvgEntity
                    {
                        Avg = trainingData.Power?.Avg,
                        Min = trainingData.Power?.Min,
                        Max = trainingData.Power?.Max,
                        UnitId = (long)HealthConnectUnitTypeEnum.Watts
                    },
                    Speed = new HealthConnectAvgEntity
                    {
                        Avg = trainingData.Speed?.Avg,
                        Min = trainingData.Speed?.Min,
                        Max = trainingData.Speed?.Max,
                        UnitId = (long)HealthConnectUnitTypeEnum.KilometersPerHour
                    },

                }
            };
        }

        private void UpdateTrainingData(HealthConnectTrainingDataEntity existingEntity, HealthConnectTrainingDataRecordData trainingData, long userId)
        {
            existingEntity.Origin = trainingData.Origin ?? "Unknown";
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
            values.TotalCaloriesBurnedInKcal = trainingData.TotalCaloriesBurnedInKcal;
            values.DistanceInMeters = trainingData.DistanceInMeters;
            values.DurationSeconds = trainingData.DurationSeconds;
            values.ElevationAvg = trainingData.ElevationAvg;
            values.HydrationAvg = trainingData.HydrationAvg;
            values.Steps = trainingData.Steps;
            values.WeightAvg = trainingData.WeightAvg;

            values.CyclingPedalingCadence = UpdateAvgEntity(values.CyclingPedalingCadence, trainingData.CyclingPedalingCadence, HealthConnectUnitTypeEnum.RevolutionsPerMinute);
            values.HeartRate = UpdateAvgEntity(values.HeartRate, trainingData.HeartRate, HealthConnectUnitTypeEnum.BeatsPerMinute);
            values.Power = UpdateAvgEntity(values.Power, trainingData.Power, HealthConnectUnitTypeEnum.Watts);
            values.Speed = UpdateAvgEntity(values.Speed, trainingData.Speed, HealthConnectUnitTypeEnum.KilometersPerHour);
            values.RestingHeartRate = UpdateAvgEntity(values.RestingHeartRate, trainingData.RestingHeartRate, HealthConnectUnitTypeEnum.BeatsPerMinute);
            values.StepCadence = UpdateAvgEntity(values.StepCadence, trainingData.StepCadence, HealthConnectUnitTypeEnum.StepsPerMinute);
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

