using Data.Database.Entities.Ai;
using Logic.Ai.Training.Models;
using Shared.Enums.HealthConnect;

namespace Logic.Ai.Interfaces
{
    public interface IAiModelTrainer
    {
        Task<(AiModelEntity? ActiveModel, IReadOnlyList<GlobalAiTrainingDataModel> TrainingData)> PrepareGlobalTrainingAsync(
            long userId,
            ExerciseTypeEnum? exerciseType = null,
            CancellationToken cancellationToken = default);

        Task<(AiModelEntity? ActiveModel, IReadOnlyList<UserAiTrainingDataModel> TrainingData)> PrepareUserTrainingAsync(
            long userId,
            ExerciseTypeEnum? exerciseType = null,
            CancellationToken cancellationToken = default);

        Task<AiModelEntity> PersistTrainedGlobalModelAsync(
            long userId,
            ExerciseTypeEnum? exerciseType,
            byte[] modelData,
            CancellationToken cancellationToken = default);

        Task<AiModelEntity> PersistTrainedUserModelAsync(
            long userId,
            ExerciseTypeEnum? exerciseType,
            byte[] modelData,
            CancellationToken cancellationToken = default);
    }
}
