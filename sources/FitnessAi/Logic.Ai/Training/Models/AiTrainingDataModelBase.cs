namespace Logic.Ai.Training.Models
{
    public abstract class AiTrainingDataModelBase
    {
        public string ExerciseType { get; set; } = null!;
        public float CaloriesBurned { get; set; }
        public float Steps { get; set; }
        public float DurationSeconds { get; set; }
        public float DurationSecondsPerKm { get; set; }
        public float DistanceInMeters { get; set; }
        public float ElevationMetersAvg { get; set; }
        public float Weight { get; set; }
        public float BodyFatPercentage { get; set; }
        public float BodyMassIndex { get; set; }
        public float OxygenSaturationPercentageAvg { get; set; }
        public float RespiratoryRateAvg { get; set; }
        public float Vo2MaxMlPerMinKgAvg { get; set; }
        public float LapCount { get; set; }
        public float AvgLapDurationSeconds { get; set; }
        public float AvgLapLengthMeters { get; set; }
        public float SegmentCount { get; set; }
        public float AvgSegmentDurationSeconds { get; set; }
    }
}
