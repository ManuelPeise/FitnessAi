using Data.Database.Entities.HealthConnect;
using Data.Database.Entities.User;
using Shared.Enums.Ai;
using Shared.Enums.HealthConnect;
using System.ComponentModel.DataAnnotations.Schema;

namespace Data.Database.Entities.Ai
{
    public class HealthConnectAiTrainingDataEntity : AEntityBase
    {
        public long UserId { get; set; }
        [ForeignKey(nameof(UserId))]
        public UserEntity User { get; set; } = null!;

        public string DataKey { get; set; } = null!;
        public string? MetricId { get; set; }
        public string? Origin { get; set; }
        public ExerciseTypeEnum ExerciseType { get; set; }
        public WorkoutIntensityEnum WorkoutIntensity { get; set; } = WorkoutIntensityEnum.Unknown;
        public DateTime? WorkoutIntensityPredictedAt { get; set; }
        public int? CaloriesBurned { get; set; }
        public int? Steps { get; set; } = 0;
        public decimal? DurationSeconds { get; set; }
        public decimal? DurationSecondsPerKm { get; set; }
        public decimal? DistanceInMeters { get; set; }
        public int? EvaluationMetersAvg { get; set; }
        public decimal? Weight { get; set; }
        public decimal? BodyFatPercentage { get; set; }
        public decimal? BodyMassIndex { get; set; }
        public decimal? OxygenSaturationPercentageAvg { get; set; }
        public decimal? RespiratoryRateAvg { get; set; }
        public decimal? Vo2MaxMlPerMinKgAvg { get; set; }

        public long? CyclingPedalingCadenceId { get; set; }
        [ForeignKey(nameof(CyclingPedalingCadenceId))]
        public HealthConnectAvgEntity? CyclingPedalingCadence { get; set; }

        public long? HeartRateId { get; set; }
        [ForeignKey(nameof(HeartRateId))]
        public HealthConnectAvgEntity? HeartRate { get; set; }

        public long? PowerId { get; set; }
        [ForeignKey(nameof(PowerId))]
        public HealthConnectAvgEntity? Power { get; set; }

        public long? SpeedId { get; set; }
        [ForeignKey(nameof(SpeedId))]
        public HealthConnectAvgEntity? Speed { get; set; }

        public long? StepCadenceId { get; set; }
        [ForeignKey(nameof(StepCadenceId))]
        public HealthConnectAvgEntity? StepCadence { get; set; }

        public ICollection<HealthConnectAiTrainingSegmentEntity> Segments { get; set; } = [];
        public ICollection<HealthConnectAiTrainingLap> Laps { get; set; } = [];

    }
}
