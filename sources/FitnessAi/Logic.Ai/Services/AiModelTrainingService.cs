using Logic.Ai.Interfaces;
using Logic.Ai.Models;
using Microsoft.Extensions.Logging;
using Shared.Enums.Ai;
using Shared.Models.Ai;

namespace Logic.Ai.Services
{
    public class AiModelTrainingService : IAiModelTrainingService
    {
        private readonly IAiTrainingDataFileService _aiTrainingDataFileService;
        private readonly IAiModelTrainerFactory _trainerFactory;
        private readonly IAiModelVersionStorageService _modelVersionStorageService;
        private readonly ILogger<AiModelTrainingService> _logger;

        public AiModelTrainingService(
            IAiTrainingDataFileService aiTrainingDataFileService,
            IAiModelTrainerFactory trainerFactory,
            IAiModelVersionStorageService modelVersionStorageService,
            ILogger<AiModelTrainingService> logger)
        {
            _aiTrainingDataFileService = aiTrainingDataFileService;
            _trainerFactory = trainerFactory;
            _modelVersionStorageService = modelVersionStorageService;
            _logger = logger;
        }

        public async Task TrainAsync(AiModelTypeEnum aiType, CancellationToken cancellationToken = default)
        {
            var result = await RunTrainerAsync(aiType, cancellationToken);

            if (result != null)
            {
                await SaveIfBetterAsync(aiType, result, cancellationToken);
            }
        }

        public async Task<AiModelQualityMetrics?> EvaluateAsync(AiModelTypeEnum aiType, CancellationToken cancellationToken = default)
        {
            var result = await RunTrainerAsync(aiType, cancellationToken);

            return result == null
                ? null
                : new AiModelQualityMetrics
                {
                    MicroAccuracy = result.MicroAccuracy,
                    MacroAccuracy = result.MacroAccuracy,
                    LogLoss = result.LogLoss,
                };
        }

        private async Task<AiModelTrainingResult?> RunTrainerAsync(AiModelTypeEnum aiType, CancellationToken cancellationToken)
        {
            var csv = await _aiTrainingDataFileService.GetCsvAsync(aiType, cancellationToken);

            if (csv == null)
            {
                _logger.LogInformation("No training data file for AiType '{AiType}', skipping training.", aiType);
                return null;
            }

            var trainer = _trainerFactory.GetTrainer(aiType);
            var result = trainer.Train(csv);

            if (result == null)
            {
                _logger.LogInformation("Not enough labeled data for AiType '{AiType}', skipping training.", aiType);
            }

            return result;
        }

        private async Task SaveIfBetterAsync(AiModelTypeEnum aiType, AiModelTrainingResult result, CancellationToken cancellationToken)
        {
            var latestMetrics = await _modelVersionStorageService.GetLatestModelMetricsAsync(aiType, cancellationToken);

            if (latestMetrics != null && result.MacroAccuracy <= latestMetrics.MacroAccuracy)
            {
                _logger.LogInformation(
                    "New model for AiType '{AiType}' (MacroAccuracy {NewAccuracy}) is not better than version {Version} (MacroAccuracy {ExistingAccuracy}), discarding.",
                    aiType, result.MacroAccuracy, latestMetrics.Version, latestMetrics.MacroAccuracy);
                return;
            }

            await _modelVersionStorageService.SaveNewModelVersionAsync(aiType, result, cancellationToken);

            _logger.LogInformation(
                "Saved new trained model version for AiType '{AiType}' with MacroAccuracy {NewAccuracy} (previous: {ExistingAccuracy}).",
                aiType, result.MacroAccuracy, latestMetrics?.MacroAccuracy);
        }
    }
}
