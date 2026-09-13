namespace Logic.Ai.Models
{
    // Non-nullable ML.NET row shape shared by TrainingIntensityAiModelTrainer (fitting) and
    // TrainingIntensityPredictor (inference) - the loaded model's schema must structurally
    // match what it was fitted with, so both map WorkoutIntensityMlInputModel through this type.
    internal sealed class WorkoutIntensityModelRow
    {
        public float Elevation { get; set; }
        public float PaceSeconds { get; set; }
        public float AverageHeartRate { get; set; }
        public float MinHeartRate { get; set; }
        public float MaxHeartRate { get; set; }
        public float Power { get; set; }
        public string Label { get; set; } = string.Empty;
    }
}
