using Data.Database.Entities.Ai;
using Logic.Ai.Interfaces;
using Shared.Enums.Ai;
using Shared.Enums.HealthConnect;

namespace AiUnitTests.WorkoutIntensity.Fakes
{
    internal class FakeAiModelLifecycleService : IAiModelLifecycleService
    {
        private readonly AiModelEntity? _activeModel;
        private readonly AiModelEntity _activatedModel;

        public (long? UserId, AiModelTypeEnum ModelType, ExerciseTypeEnum? ExerciseType, byte[] ModelData)? ActivateNewModelCall { get; private set; }

        public FakeAiModelLifecycleService(AiModelEntity? activeModel = null, AiModelEntity? activatedModel = null)
        {
            _activeModel = activeModel;
            _activatedModel = activatedModel ?? new AiModelEntity();
        }

        public Task<AiModelEntity?> GetActiveModelAsync(long? userId, AiModelTypeEnum modelType, ExerciseTypeEnum? exerciseType, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(_activeModel);
        }

        public Task<AiModelEntity> ActivateNewModelAsync(long? userId, AiModelTypeEnum modelType, ExerciseTypeEnum? exerciseType, byte[] modelData, CancellationToken cancellationToken = default)
        {
            ActivateNewModelCall = (userId, modelType, exerciseType, modelData);
            return Task.FromResult(_activatedModel);
        }
    }
}
