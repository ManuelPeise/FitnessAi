using Data.Database.Entities.Ai;

namespace Logic.Ai.Interfaces
{
    public interface IWorkoutIntensityModelTrainer
    {
        Task<AiModelEntity?> TrainAndActivateModelAsync(CancellationToken cancellationToken = default);
    }
}
