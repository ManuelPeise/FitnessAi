using Shared.Models.HealthConnect.QueryModels;

namespace Logic.Ai.Interfaces
{
    public interface ITrainingIntensityPredictionService
    {
        // Predicts only for records matching the query that have no WorkoutIntensity set yet.
        Task<List<TrainingDataPrediction>> PredictAsync(TrainingDataQuery query, CancellationToken cancellationToken = default);
    }
}
