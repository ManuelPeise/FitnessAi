using Microsoft.ML.Data;

namespace Logic.Ai.Training.WorkoutIntensity.Models
{
    public class WorkoutIntensityMlPrediction
    {
        [ColumnName("PredictedLabel")] public string PredictedLabel { get; set; } = null!;
        public float[] Score { get; set; } = [];
    }
}
