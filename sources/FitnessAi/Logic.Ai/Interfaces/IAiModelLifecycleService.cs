using Data.Database.Entities.Ai;
using Shared.Enums.Ai;
using Shared.Enums.HealthConnect;

namespace Logic.Ai.Interfaces
{
    public interface IAiModelLifecycleService
    {
        Task<AiModelEntity?> GetActiveModelAsync(
            long? userId,
            AiModelTypeEnum modelType,
            ExerciseTypeEnum? exerciseType,
            CancellationToken cancellationToken = default);

        Task<AiModelEntity> ActivateNewModelAsync(
            long? userId,
            AiModelTypeEnum modelType,
            ExerciseTypeEnum? exerciseType,
            byte[] modelData,
            CancellationToken cancellationToken = default);
    }
}
