using Data.Database.Entities.HealthConnect;
using Shared.Enums.HealthConnect;
using System.ComponentModel.DataAnnotations.Schema;

namespace Data.Database.Entities.Ai
{
    public class HealthConnectAiTrainingDataEntity : AEntityBase
    {
        public long UserId { get; set; }
        public string DataKey { get; set; } = null!;
        public ExerciseTypeEnum ExerciseType { get; set; }
        public int? CaloriesBurned { get; set; }
        public int? Steps { get; set; } = 0;
        public decimal? DurationSeconds { get; set; }
        public decimal? DurationSecondsPerKm { get; set; }
        public decimal? DistanceInMeters { get; set; }
        public int? EvaluationMetersAvg { get; set; }
        public decimal? Weight { get; set; }
        public decimal? BodyFatPercentage { get; set; }
        public decimal? BodyMassIndex { get; set; }
        public long CyclingPedalingCadenceId { get; set; }
        public long HeartRateId { get; set; }
        public long PowerId { get; set; }
        public long SpeedId { get; set; }
        public long StepCadenceId { get; set; }

        public ICollection<HealthConnectAiTrainingSegmentEntity> Segments { get; set; } = [];
        public ICollection<HealthConnectAiTrainingLap> Laps { get; set; } = [];

    }  
}
