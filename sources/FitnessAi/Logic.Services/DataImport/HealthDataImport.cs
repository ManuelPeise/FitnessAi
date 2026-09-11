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

                var weightDictionary = models.ToDictionary(x => x.Date.Date, x => x.AggregatedData.WeightAvg);
                var bodyFatDictionary = models.ToDictionary(x => x.Date.Date, x => x.AggregatedData.BodyFatPercentageAvg);

                var lastAggregatedData = healthData.OrderByDescending(h => h.Date).FirstOrDefault()?.AggregatedData;
                var maxDate = models.Max(h => h.Date);

                var bodyDataEntity = await UpdateBodyData(userId, maxDate, lastAggregatedData);
                var healthDataHelper = new HealthDataImportHelper(bodyDataEntity);

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

                var trainingDataAddedOrUpdated = await ProcessTrainingData(trainingData, healthDataHelper, weightDictionary, bodyFatDictionary, userId, maxDate);

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
                var databaseChanged = false;

                if (!healthData.Any())
                {
                    _logger.LogInformation("No health data to process.");
                    return false;
                }


                foreach (var model in healthData)
                {
                    var dataKey = $"{model.Date.ToString("yyyy-MM-dd")}_{userId}";

                    if (string.IsNullOrEmpty(dataKey))
                    {
                        _logger.LogWarning($"Health data for user {userId} has no valid date, skipping...");
                        continue;
                    }


                    var existingEntity = await GetExistingHealthDataEntity(dataKey);

                    if (existingEntity != null)
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

        private async Task<HealthConnectHealthDataEntity?> GetExistingHealthDataEntity(string dataKey)
        {
            var existingEntity = await _healthUnitOfWork.HealthConnectHealthDataRepository.GetSingleAsync(new DbQueryOptions<HealthConnectHealthDataEntity>
            {
                WhereExpression = entity => entity.DataKey == dataKey
            });
            return existingEntity;
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
            DateTime maxDate)
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
                    if (string.IsNullOrEmpty(data.TrainingData.ExerciseMetricId))
                    {
                        _logger.LogWarning($"Training data for user {userId} on {data.Date:yyyy-MM-dd} has no ExerciseMetricId, skipping...");
                        continue;
                    }

                    var dataKey = data.TrainingData.ExerciseMetricId;

                    var existingEntity = await GetExistingTrainingDataEntity(dataKey);

                    if (existingEntity != null)
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

                    var entity = await CreateNewTrainingDataEntity(
                        data.TrainingData,
                        healthDataHelper,
                        weightDictionary,
                        bodyFatDictionary,
                        dataKey,
                        userId);

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

        private async Task<HealthConnectTrainingDataEntity?> CreateNewTrainingDataEntity(
            HealthConnectTrainingDataRecordData trainingData,
            HealthDataImportHelper healthDataHelper,
            Dictionary<DateTime, decimal?> weightDictionary,
            Dictionary<DateTime, decimal?> bodyFatDictionary,
            string dataKey,
            long userId)
        {
            if (trainingData == null)
            {
                return null;
            }

            var timeZoneEntity = await GetTimeZoneEntity(trainingData.TimeZoneInfo?.Offset);

            var allowedForAiTraining = await GetAllowedForAiTraining(userId);

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
                HealthConnectTimeZoneEntityId = timeZoneEntity?.Id ?? 0,
                HealthConnectTimeZoneEntity = timeZoneEntity ?? new HealthConnectTimeZoneEntity { Offset = trainingData.TimeZoneInfo?.Offset ?? 0 },
                HealthConnectTrainingDataValues = new HealthConnectTrainingDataValuesEntity
                {
                    ActiveCaloriesBurnedInKcal = trainingData.ActiveCaloriesBurnedInKcal,
                    DistanceInMeters = trainingData.DistanceInMeters,
                    DurationSeconds = trainingData.DurationSeconds,
                    ElevationAvg = trainingData.ElevationAvg,
                    HydrationAvg = trainingData.HydrationAvg,
                    Steps = trainingData.Steps,
                    BodyFatPercentage = healthDataHelper.GetGetBodyFatPercentage(bodyFatDictionary, trainingData.StartTime),
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

        private async Task<bool> GetAllowedForAiTraining(long userId)
        {
            var userEntity = await _applicationUnitOfWork.UserRepository.GetSingleAsync(new DbQueryOptions<UserEntity>
            {
                WhereExpression = entity => entity.Id == userId,
                Includes = new List<System.Linq.Expressions.Expression<Func<UserEntity, object>>>
                {
                    entity => entity.Settings.AiSettings
                }
            });

            return userEntity?.Settings?.AiSettings?.CanUseHealthDataForAiTraining ?? false;
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

