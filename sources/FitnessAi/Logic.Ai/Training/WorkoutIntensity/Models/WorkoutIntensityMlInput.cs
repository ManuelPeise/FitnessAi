using Microsoft.ML.Data;

namespace Logic.Ai.Training.WorkoutIntensity.Models
{
    public class WorkoutIntensityMlInput
    {
        [ColumnName("Elevation")] public float Elevation { get; set; }
        [ColumnName("Pace")] public float Pace { get; set; }
        [ColumnName("AverageHeartRate")] public float AverageHeartRate { get; set; }
        [ColumnName("UserId")] public string UserId { get; set; } = null!;
        [ColumnName("ExerciseType")] public string ExerciseType { get; set; } = null!;
        [ColumnName("Label")] public string Label { get; set; } = null!;
    }
}
