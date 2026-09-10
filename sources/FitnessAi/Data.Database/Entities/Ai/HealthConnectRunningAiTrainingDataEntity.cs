using Shared.Enums.HealthConnect;

namespace Data.Database.Entities.Ai
{
    public class HealthConnectRunningAiTrainingDataEntity: AEntityBase
    {
        public long UserId { get; set; }
        public ExerciseTypeEnum ExerciseType { get; set; }
        public DateTimeOffset StartTime { get; set; }
        public DateTimeOffset EndTime { get; set; }
        public decimal DurationSeconds { get; set; } = 0.00m;
        public decimal DistanceInMeters { get; set; } = 0.00m;
        public decimal Pace { get; set; } = 0.00m;
        public int Steps { get; set; } = 0;
        public int StepCadence { get; set; } = 0;
        public decimal SpeedInKilometersPerHourAvg { get; set; } = 0.00m;
        public decimal MinSpeedInKilometersPerHour { get; set; } = 0.00m;
        public decimal MaxSpeedInKilometersPerHour { get; set; } = 0.00m;
        public decimal HeartRateAvg { get; set; } = 0.00m;
        public decimal MinHeartRate { get; set; } = 0.00m;
        public decimal MaxHeartRate { get; set; } = 0.00m;
        public decimal PowerInWattsAvg { get; set; } = 0.00m;
        public decimal ElevationGainedInMeters { get; set; } = 0.00m;
        public decimal OxygenSaturationAvg { get; set; } = 0.00m;
        public decimal CaloriesBurned { get; set; } = 0.00m;
        public decimal Vo2Max { get; set; } = 0.00m;
    }
}
