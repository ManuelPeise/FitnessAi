namespace Shared.Models.Ai.InputModels
{
    public sealed class WorkoutIntensityMlInputModel
    {
        public float? Elevation { get; set; }
        public float PaceSeconds { get; set; }
        public float AverageHeartRate { get; set; }
        public float? MinHeartRate { get; set; }
        public float MaxHeartRate { get; set; }
        public float? Power { get; set; }
        public string Label { get; set; } = string.Empty;
    }
}
