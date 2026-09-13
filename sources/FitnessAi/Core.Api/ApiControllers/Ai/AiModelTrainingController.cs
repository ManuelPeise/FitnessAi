using Core.Api.AuthorizationAttributes;
using Logic.Ai.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Shared.Enums.Ai;
using Shared.Enums.Authentication;
using Shared.Models.Ai;

namespace Core.Api.ApiControllers.Ai
{
    public class AiModelTrainingController : ApiControllerBase
    {
        private readonly IAiModelTrainingService _aiModelTrainingService;
        private readonly IAiModelVersionStorageService _aiModelVersionStorageService;

        public AiModelTrainingController(IAiModelTrainingService aiModelTrainingService, IAiModelVersionStorageService aiModelVersionStorageService)
        {
            _aiModelTrainingService = aiModelTrainingService;
            _aiModelVersionStorageService = aiModelVersionStorageService;
        }

        [ApiAuthentication(UserRoleEnum.AdminRole)]
        [HttpPost(Name = "TrainAiModel")]
        public async Task TrainAiModel([FromQuery] AiModelTypeEnum aiType, CancellationToken cancellationToken = default)
        {
            await _aiModelTrainingService.TrainAsync(aiType, cancellationToken);
        }

        [ApiAuthentication(UserRoleEnum.AdminRole)]
        [HttpGet(Name = "GetAiModelQuality")]
        public async Task<AiModelQualityMetrics> GetAiModelQuality([FromQuery] AiModelTypeEnum aiType, CancellationToken cancellationToken = default)
        {
            var metrics = await _aiModelTrainingService.EvaluateAsync(aiType, cancellationToken);

            if (metrics == null)
            {
                return new AiModelQualityMetrics
                {
                    MicroAccuracy = 0,
                    MacroAccuracy = 0,
                    LogLoss = 0,
                };
            }

            return metrics;
        }

        [ApiAuthentication(UserRoleEnum.AdminRole)]
        [HttpGet(Name = "GetLatestAiModelQuality")]
        public async Task<TrainedAiModelMetrics> GetLatestAiModelQuality([FromQuery] AiModelTypeEnum aiType, CancellationToken cancellationToken = default)
        {
            var metrics = await _aiModelVersionStorageService.GetLatestModelMetricsAsync(aiType, cancellationToken);

            if (metrics == null)
            {
                return new TrainedAiModelMetrics
                {
                    Version = "0.0.0",
                    MicroAccuracy = 0d,
                    MacroAccuracy = 0d,
                    LogLoss = 0d,
                    TrainedAt = DateTime.MinValue,
                };
            }

            return metrics;
        }
    }
}
