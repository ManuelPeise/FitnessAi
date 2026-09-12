using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.Ai;
using Logic.Ai.Interfaces;
using Shared.Enums.Ai;
using Shared.Enums.HealthConnect;
using System.Linq;

namespace Logic.Ai.Training.ModelTrainers
{
    public class AiModelLifecycleService : IAiModelLifecycleService
    {
        private readonly IAiUnitOfWork _aiUnitOfWork;

        public AiModelLifecycleService(IAiUnitOfWork aiUnitOfWork)
        {
            _aiUnitOfWork = aiUnitOfWork;
        }

        public async Task<AiModelEntity?> GetActiveModelAsync(
            long? userId,
            AiModelTypeEnum modelType,
            ExerciseTypeEnum? exerciseType,
            CancellationToken cancellationToken = default)
        {
            var options = new DbQueryOptions<AiModelEntity>
            {
                WhereExpression = x => x.UserId == userId && x.ModelType == modelType && x.ExerciseType == exerciseType && x.IsActive
            };

            return await _aiUnitOfWork.AiModelRepository.GetSingleAsync(options, asNoTracking: true, cancellationToken);
        }

        public async Task<AiModelEntity> ActivateNewModelAsync(
            long? userId,
            AiModelTypeEnum modelType,
            ExerciseTypeEnum? exerciseType,
            byte[] modelData,
            CancellationToken cancellationToken = default)
        {
            var existingModels = await _aiUnitOfWork.AiModelRepository.GetAsync(new DbQueryOptions<AiModelEntity>
            {
                WhereExpression = x => x.UserId == userId && x.ModelType == modelType && x.ExerciseType == exerciseType
            }, cancellationToken);

            var nextVersion = await DeactivatePreviousActiveModelAsync(existingModels, cancellationToken);

            var newModel = new AiModelEntity
            {
                ModelId = Guid.NewGuid(),
                ModelType = modelType,
                ExerciseType = exerciseType,
                UserId = userId,
                Version = nextVersion,
                IsActive = true,
            };

            await _aiUnitOfWork.AiModelRepository.AddAsync(newModel, cancellationToken);
            await _aiUnitOfWork.AiModelBinaryRepository.AddAsync(new AiModelBinaryEntity
            {
                ModelData = modelData,
                AiModel = newModel,
            }, cancellationToken);

            await _aiUnitOfWork.SaveChangesAsync(cancellationToken);

            return newModel;
        }

        private async Task<int> DeactivatePreviousActiveModelAsync(IReadOnlyList<AiModelEntity> existingModels, CancellationToken cancellationToken)
        {
            var previousActiveModel = existingModels.SingleOrDefault(x => x.IsActive);

            if (previousActiveModel != null)
            {
                previousActiveModel.IsActive = false;
                await _aiUnitOfWork.AiModelRepository.UpdateAsync(previousActiveModel, cancellationToken);
            }

            return existingModels.Count == 0 ? 1 : existingModels.Max(x => x.Version) + 1;
        }
    }
}
