using Data.Database.Entities.Ai;
using Shared.Enums.Ai;

namespace Logic.Ai.Interfaces
{
    public interface IWorkoutIntensityPredictor
    {
        Task<WorkoutIntensityEnum> PredictAsync(HealthConnectAiTrainingDataEntity entity, CancellationToken cancellationToken = default);
    }
}
