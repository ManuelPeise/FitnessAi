using Shared.Models.HealthConnect.QueryModels;

namespace Logic.Services.Interfaces
{
    public interface ITrainingDataService
    {
        // Includes AvailableExerciseTypes (all exercise types the user has data for, unfiltered)
        // alongside the paged/filtered Items, so the page load only needs a single request.
        Task<TrainingDataQueryResult> GetTrainingDataAsync(TrainingDataQuery query, CancellationToken cancellationToken = default);
        Task UpdateTrainingDataAsync(TrainingDataUpdateRequest request, CancellationToken cancellationToken = default);
        Task DeleteTrainingDataAsync(long id, CancellationToken cancellationToken = default);

        // Only patches WorkoutIntensity, and only for rows where it is still unset - safe to call
        // for predictions covering rows whose other fields were never loaded (e.g. off-page rows).
        Task ApplyWorkoutIntensityPredictionsAsync(List<TrainingDataPrediction> predictions, CancellationToken cancellationToken = default);
    }
}
