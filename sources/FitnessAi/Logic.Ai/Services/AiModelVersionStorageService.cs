using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.Ai;
using Logic.Ai.Interfaces;
using Logic.Ai.Models;
using Shared.Enums.Ai;
using Shared.Models.Ai;

namespace Logic.Ai.Services
{
    // Persistence for AiTrainedModelTable - append-only version history per AiType. Never
    // updates an existing row: a new, better model is always inserted as the next patch version.
    public class AiModelVersionStorageService : IAiModelVersionStorageService
    {
        private const string InitialVersion = "0.0.1";

        private readonly IAiUnitOfWork _aiUnitOfWork;

        public AiModelVersionStorageService(IAiUnitOfWork aiUnitOfWork)
        {
            _aiUnitOfWork = aiUnitOfWork;
        }

        public async Task<TrainedAiModelMetrics?> GetLatestModelMetricsAsync(AiModelTypeEnum aiType, CancellationToken cancellationToken = default)
        {
            var latest = await GetLatestEntityAsync(aiType, null, cancellationToken);

            return latest == null
                ? null
                : new TrainedAiModelMetrics
                {
                    Version = latest.Version,
                    MicroAccuracy = latest.MicroAccuracy,
                    MacroAccuracy = latest.MacroAccuracy,
                    LogLoss = latest.LogLoss,
                    TrainedAt = latest.CreatedAt,
                };
        }

        public async Task<byte[]?> GetModelDataAsync(AiModelTypeEnum aiType, string? modelVersion, CancellationToken cancellationToken = default)
        {
            var latest = await GetLatestEntityAsync(aiType, modelVersion, cancellationToken);
            return latest?.ModelData;
        }

        public async Task SaveNewModelVersionAsync(AiModelTypeEnum aiType, AiModelTrainingResult result, CancellationToken cancellationToken = default)
        {
            var latest = await GetLatestEntityAsync(aiType, null, cancellationToken);
            var nextVersion = NextVersion(latest?.Version);

            await _aiUnitOfWork.AiTrainedModelRepository.AddAsync(new AiTrainedModelEntity
            {
                AiType = aiType,
                Version = nextVersion,
                ModelData = result.ModelData,
                MicroAccuracy = result.MicroAccuracy,
                MacroAccuracy = result.MacroAccuracy,
                LogLoss = result.LogLoss,
            }, cancellationToken);

            await _aiUnitOfWork.SaveChangesAsync(cancellationToken);
        }

        private async Task<AiTrainedModelEntity?> GetLatestEntityAsync(AiModelTypeEnum aiType, string? modelVersion, CancellationToken cancellationToken)
        {
            var entities = await _aiUnitOfWork.AiTrainedModelRepository.GetAsync(new DbQueryOptions<AiTrainedModelEntity>
            {
                AsNoTracking = true,
                WhereExpression = x => x.AiType == aiType && (modelVersion == null || x.Version == modelVersion),
            }, cancellationToken);

            return entities
                .OrderByDescending(entity => ParseVersion(entity.Version))
                .FirstOrDefault();
        }

        private static string NextVersion(string? latestVersion)
        {
            if (latestVersion == null)
            {
                return InitialVersion;
            }

            var (major, minor, patch) = ParseVersion(latestVersion);
            return $"{major}.{minor}.{patch + 1}";
        }

        private static (int Major, int Minor, int Patch) ParseVersion(string version)
        {
            var parts = version.Split('.');
            return (int.Parse(parts[0]), int.Parse(parts[1]), int.Parse(parts[2]));
        }
    }
}
