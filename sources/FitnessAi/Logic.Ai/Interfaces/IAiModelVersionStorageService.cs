using Logic.Ai.Models;
using Shared.Enums.Ai;
using Shared.Models.Ai;

namespace Logic.Ai.Interfaces
{
    public interface IAiModelVersionStorageService
    {
        Task<TrainedAiModelMetrics?> GetLatestModelMetricsAsync(AiModelTypeEnum aiType, CancellationToken cancellationToken = default);

        // The raw bytes of the latest trained model version - null if none has been trained yet.
        Task<byte[]?> GetModelDataAsync(AiModelTypeEnum aiType, string? modelVersion, CancellationToken cancellationToken = default);

        // Always inserts a new version row (next patch version) - never updates an existing one.
        Task SaveNewModelVersionAsync(AiModelTypeEnum aiType, AiModelTrainingResult result, CancellationToken cancellationToken = default);
    }
}
