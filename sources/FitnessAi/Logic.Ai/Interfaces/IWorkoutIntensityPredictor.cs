using Shared.Enums.Ai;
using Shared.Models.Ai.InputModels;

namespace Logic.Ai.Interfaces
{
    public interface IWorkoutIntensityPredictor
    {
        // Null if no trained model exists yet, or the input is missing a required feature.
        Task<WorkoutIntensityEnum?> PredictAsync(WorkoutIntensityMlInputModel input, string? modelVersion, CancellationToken cancellationToken = default);
    }
}
