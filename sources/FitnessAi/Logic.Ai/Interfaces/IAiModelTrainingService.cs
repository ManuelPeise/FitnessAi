using Shared.Enums.Ai;
using Shared.Models.Ai;

namespace Logic.Ai.Interfaces
{
    public interface IAiModelTrainingService
    {
        Task TrainAsync(AiModelTypeEnum aiType, CancellationToken cancellationToken = default);

        // Runs a training pass and returns its quality metrics without saving a new model
        // version - a "test training" used to preview quality before committing to it.
        Task<AiModelQualityMetrics?> EvaluateAsync(AiModelTypeEnum aiType, CancellationToken cancellationToken = default);
    }
}
