using Data.Database.Entities.Ai;
using Shared.Enums.HealthConnect;

namespace Logic.Ai.Interfaces
{
    public interface IModelTrainingDataLoader
    {
        Task<IReadOnlyList<HealthConnectAiTrainingDataEntity>> LoadTrainingDataAsync(
            long? userId = null,
            ExerciseTypeEnum? exerciseType = null,
            CancellationToken cancellationToken = default);
    }
}
