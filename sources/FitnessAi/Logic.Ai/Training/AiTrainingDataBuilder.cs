using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.Ai;
using Data.Database.Entities.HealthConnect;
using Data.Database.Entities.Settings;
using Logic.Ai.Interfaces;
using Logic.Shared.Interfaces;
using Microsoft.Extensions.Logging;
using Shared.Enums.HealthConnect;

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
                var exerciseRecords = await _healthUnitOfWork.HealthConnectRecordRepository.GetAsync(
                    new DbQueryOptions<HealthConnectRecordEntity>
                    {
                        AsNoTracking = true,
                        WhereExpression = record => record.RecordType == HealthConnectRecordTypeEnum.ExerciseSession,
                        Includes =
                        {
                            record => record.Values,
                            record => record.Segments
                        }
                    });

                if (exerciseRecords.Count == 0)
                {
                    _logger.LogInformation("No exercise session records found for AI training data generation.");
                    return;
                }

                var trainingDataEntities = new List<HealthConnectRunningAiTrainingDataEntity>();

                foreach (var userGroup in exerciseRecords.GroupBy(record => record.UserId))
                {
                    var userId = userGroup.Key;

                   
                    if (!await CanUseHealthDataForAiTraining(userId))
                    {
                        _logger.LogInformation(
                            "Skipping AI exercise training data for user {UserId} because health data usage is not allowed.",
                            userId);
                        continue;
                    }

                    foreach (var exercise in userGroup)
                    {
                        if (exercise.StartTime is null || exercise.EndTime is null)
                        {
                            continue;
                        }

                        var healthRecords = await _healthUnitOfWork.HealthConnectRecordRepository.GetAsync(
                            new DbQueryOptions<HealthConnectRecordEntity>
                            {
                                AsNoTracking = true,
                                WhereExpression = record =>
                                    record.UserId == userId
                                    && record.RecordType != HealthConnectRecordTypeEnum.ExerciseSession
                                    && record.StartTime != null
                                    // Include every record whose time interval overlaps the exercise session.
                                    && record.StartTime <= exercise.EndTime
                                    && ((record.EndTime != null && record.EndTime >= exercise.StartTime)
                                        || (record.EndTime == null && record.StartTime >= exercise.StartTime)),
                                Includes =
                                {
                                    record => record.Values
                                }
                            });

                        var fallbackVo2Max = await GetLatestVo2MaxAsync(userId, exercise.EndTime.Value);

                        trainingDataEntities.Add(BuildExerciseTrainingDataEntity(userId, exercise, healthRecords, fallbackVo2Max));
                    }
                }

                if (trainingDataEntities.Count == 0)
                {
                    _logger.LogInformation("No AI exercise training data entities were created.");
                    return;
                }

                await _aiUnitOfWork.HealthConnectRunningAiTrainingDataRepository.AddRangeAsync(trainingDataEntities);
                await _aiUnitOfWork.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error building exercise training data");
            }
        }

        private async Task<bool> CanUseHealthDataForAiTraining(long userId)
        {
            var user = await _applicationUnitOfWork.UserRepository.GetByIdAsync(userId, asNoTracking: true);

            if (user is null)
            {
                return false;
            }

            var settings = await _applicationUnitOfWork.SettingsRepository.GetSingleAsync(
                new DbQueryOptions<SettingsEntity>
                {
                    WhereExpression = entity => entity.Id == user.SettingsId,
                    Includes =
                    {
                        entity => entity.AiSettings
                    }
                },
                asNoTracking: true);

            return settings?.AiSettings?.CanUseHealthDataForAiTraining == true;
        }

        private async Task<decimal> GetLatestVo2MaxAsync(long userId, DateTimeOffset endTime)
        {
            // Vo2Max is measured occasionally rather than during every activity, so fall back to the
            // most recent value recorded on or before the day the exercise ended.
            var cutoff = new DateTimeOffset(endTime.Date.AddDays(1), endTime.Offset);

            var vo2MaxRecords = await _healthUnitOfWork.HealthConnectRecordRepository.GetAsync(
                new DbQueryOptions<HealthConnectRecordEntity>
                {
                    AsNoTracking = true,
                    WhereExpression = record =>
                        record.UserId == userId
                        && record.RecordType == HealthConnectRecordTypeEnum.Vo2Max
                        && record.StartTime != null
                        && record.StartTime < cutoff,
                    Includes =
                    {
                        record => record.Values
                    }
                });

            var latestRecord = vo2MaxRecords
                .Where(record => record.StartTime != null)
                .OrderByDescending(record => record.StartTime)
                .FirstOrDefault();

            return latestRecord?.Values
                .FirstOrDefault(value => value.ValueType == HealthConnectValueTypeEnum.Vo2Max)?.Value ?? 0.00m;
        }

        private static HealthConnectRunningAiTrainingDataEntity BuildExerciseTrainingDataEntity(
            long userId,
            HealthConnectRecordEntity exercise,
            IReadOnlyList<HealthConnectRecordEntity> healthRecords,
            decimal fallbackVo2Max)
        {
            var startTime = exercise.StartTime!.Value;
            var endTime = exercise.EndTime!.Value;

            // Guard against duplicate records that share the same client record id (e.g. imported more
            // than once) so cumulative metrics are not counted multiple times.
            var deduplicatedRecords = healthRecords
                .GroupBy(record => string.IsNullOrWhiteSpace(record.ClientRecordId)
                    ? Guid.NewGuid().ToString()
                    : record.ClientRecordId)
                .Select(group => group.First())
                .ToList();

            var healthValues = deduplicatedRecords
                .SelectMany(record => record.Values)
                .ToList();

            var exerciseValue = exercise.Values
                .FirstOrDefault(value => value.ValueType == HealthConnectValueTypeEnum.ExerciseSession);

            var heartRateValues = ValuesOf(healthValues, HealthConnectValueTypeEnum.HeartRate);
            // Speed samples are stored in meters per second, convert them to km/h for the training data.
            var speedInKmhValues = ValuesOf(healthValues, HealthConnectValueTypeEnum.Speed)
                .Select(value => value * 3.6m)
                .ToList();
            var powerValues = ValuesOf(healthValues, HealthConnectValueTypeEnum.Power);

            // Cumulative metrics (distance, steps, calories, elevation) are often recorded by
            // multiple data sources (e.g. phone and watch) for the same activity. Summing across all
            // records would double count them, so aggregate per data source and take the maximum.
            var distanceInMeters = SumByOrigin(deduplicatedRecords, HealthConnectValueTypeEnum.Distance);
            var durationSeconds = (decimal)(endTime - startTime).TotalSeconds;

            // Prefer the recorded speed samples. When none are available (e.g. only distance was
            // tracked) derive the average speed from the total distance and duration and use it as
            // the min/max value as well.
            var hasSpeedSamples = speedInKmhValues.Count > 0;
            var averageSpeedInKmh = hasSpeedSamples
                ? Average(speedInKmhValues)
                : CalculateAverageSpeedInKmh(distanceInMeters, durationSeconds);
            var minSpeedInKmh = hasSpeedSamples ? Min(speedInKmhValues) : averageSpeedInKmh;
            var maxSpeedInKmh = hasSpeedSamples ? Max(speedInKmhValues) : averageSpeedInKmh;

            var vo2MaxInWindow = First(healthValues, HealthConnectValueTypeEnum.Vo2Max);

            return new HealthConnectRunningAiTrainingDataEntity
            {
                UserId = userId,
                ExerciseType = (ExerciseTypeEnum)(exerciseValue?.CategoryValue ?? 0),
                StartTime = startTime,
                EndTime = endTime,
                DurationSeconds = durationSeconds,
                DistanceInMeters = distanceInMeters,
                Pace = CalculatePace(distanceInMeters, durationSeconds),
                SpeedInKilometersPerHourAvg = averageSpeedInKmh,
                MinSpeedInKilometersPerHour = minSpeedInKmh,
                MaxSpeedInKilometersPerHour = maxSpeedInKmh,
                Steps = (int)SumByOrigin(deduplicatedRecords, HealthConnectValueTypeEnum.Steps),
                StepCadence = (int)First(healthValues, HealthConnectValueTypeEnum.StepsCadence),
                HeartRateAvg = Average(heartRateValues),
                MinHeartRate = Min(heartRateValues),
                MaxHeartRate = Max(heartRateValues),
                PowerInWattsAvg = Average(powerValues),
                ElevationGainedInMeters = SumByOrigin(deduplicatedRecords, HealthConnectValueTypeEnum.ElevationGained),
                OxygenSaturationAvg = Average(ValuesOf(healthValues, HealthConnectValueTypeEnum.OxygenSaturation)),
                CaloriesBurned = Math.Max(
                    SumByOrigin(deduplicatedRecords, HealthConnectValueTypeEnum.ActiveCaloriesBurned),
                    SumByOrigin(deduplicatedRecords, HealthConnectValueTypeEnum.TotalCaloriesBurned)),
                Vo2Max = vo2MaxInWindow > 0 ? vo2MaxInWindow : fallbackVo2Max
            };
        }

        private static List<decimal> ValuesOf(IEnumerable<HealthConnectValueEntity> values, HealthConnectValueTypeEnum valueType)
        {
            return values
                .Where(value => value.ValueType == valueType)
                .Select(value => value.Value)
                .ToList();
        }

        private static decimal SumByOrigin(IEnumerable<HealthConnectRecordEntity> records, HealthConnectValueTypeEnum valueType)
        {
            // Sum the metric per data source and take the largest total to avoid double counting the
            // same activity that was tracked by more than one source (e.g. phone and watch).
            var totalsByOrigin = records
                .Select(record => new
                {
                    Origin = record.Origin ?? string.Empty,
                    record.StartTime,
                    record.EndTime,
                    Total = record.Values
                        .Where(value => value.ValueType == valueType)
                        .Sum(value => value.Value)
                })
                .Where(entry => entry.Total > 0)
                .GroupBy(entry => entry.Origin)
                .Select(group => SumNonOverlapping(
                    group.Select(entry => (entry.StartTime, entry.EndTime, entry.Total))))
                .ToList();

            return totalsByOrigin.Count > 0 ? totalsByOrigin.Max() : 0.00m;
        }

        private static decimal SumNonOverlapping(IEnumerable<(DateTimeOffset? Start, DateTimeOffset? End, decimal Total)> entries)
        {
            // Within a single data source the watch/phone often reports a summary record that spans
            // the whole activity alongside granular sub-interval records (e.g. a full-session distance
            // of 10 km plus an intermediate 5 km segment). Simply summing them would count the nested
            // segment twice, so records that are fully contained in an already accepted interval are
            // skipped. Larger intervals are processed first so the summary record wins.
            var ordered = entries
                .OrderByDescending(entry => IntervalLengthSeconds(entry.Start, entry.End))
                .ToList();

            var acceptedIntervals = new List<(DateTimeOffset Start, DateTimeOffset End)>();
            var total = 0.00m;

            foreach (var entry in ordered)
            {
                if (entry.Start is null || entry.End is null)
                {
                    // Records without a usable interval cannot be checked for overlap, so keep them.
                    total += entry.Total;
                    continue;
                }

                var start = entry.Start.Value;
                var end = entry.End.Value;

                var isContained = acceptedIntervals.Any(interval =>
                    start >= interval.Start && end <= interval.End);

                if (isContained)
                {
                    continue;
                }

                acceptedIntervals.Add((start, end));
                total += entry.Total;
            }

            return total;
        }

        private static double IntervalLengthSeconds(DateTimeOffset? start, DateTimeOffset? end)
        {
            if (start is null || end is null)
            {
                return 0;
            }

            return (end.Value - start.Value).TotalSeconds;
        }

        private static decimal First(IEnumerable<HealthConnectValueEntity> values, HealthConnectValueTypeEnum valueType)
        {
            var match = values.FirstOrDefault(value => value.ValueType == valueType);

            return match?.Value ?? 0.00m;
        }

        private static decimal Average(IReadOnlyCollection<decimal> values)
        {
            return values.Count > 0 ? values.Average() : 0.00m;
        }

        private static decimal Min(IReadOnlyCollection<decimal> values)
        {
            return values.Count > 0 ? values.Min() : 0.00m;
        }

        private static decimal Max(IReadOnlyCollection<decimal> values)
        {
            return values.Count > 0 ? values.Max() : 0.00m;
        }

        private static decimal CalculatePace(decimal distanceInMeters, decimal durationSeconds)
        {
            if (distanceInMeters <= 0)
            {
                return 0.00m;
            }

            // Pace in minutes per kilometer.
            var distanceInKilometers = distanceInMeters / 1000m;
            var durationInMinutes = durationSeconds / 60m;

            return durationInMinutes / distanceInKilometers;
        }

        private static decimal CalculateAverageSpeedInKmh(decimal distanceInMeters, decimal durationSeconds)
        {
            if (distanceInMeters <= 0 || durationSeconds <= 0)
            {
                return 0.00m;
            }

            var distanceInKilometers = distanceInMeters / 1000m;
            var durationInHours = durationSeconds / 3600m;

            return distanceInKilometers / durationInHours;
        }
    }
}
