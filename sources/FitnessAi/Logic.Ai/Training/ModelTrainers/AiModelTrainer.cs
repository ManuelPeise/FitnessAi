using Data.Database.Entities.Ai;
using Logic.Ai.Interfaces;
using Logic.Ai.Training.Models;
using Shared.Enums.Ai;
using Shared.Enums.HealthConnect;

namespace Logic.Ai.Training.ModelTrainers
{
    public class AiModelTrainer : IAiModelTrainer
    {
        private readonly IModelTrainingDataLoader _modelTrainingDataLoader;
        private readonly IModelTrainingDataConverter _modelTrainingDataConverter;
        private readonly IAiModelLifecycleService _aiModelLifecycleService;

        public AiModelTrainer(
            IModelTrainingDataLoader modelTrainingDataLoader,
            IModelTrainingDataConverter modelTrainingDataConverter,
            IAiModelLifecycleService aiModelLifecycleService)
        {
            _modelTrainingDataLoader = modelTrainingDataLoader;
            _modelTrainingDataConverter = modelTrainingDataConverter;
            _aiModelLifecycleService = aiModelLifecycleService;
        }

        public async Task<(AiModelEntity? ActiveModel, IReadOnlyList<GlobalAiTrainingDataModel> TrainingData)> PrepareGlobalTrainingAsync(
            long userId,
            ExerciseTypeEnum? exerciseType = null,
            CancellationToken cancellationToken = default)
        {
            var entities = await _modelTrainingDataLoader.LoadTrainingDataAsync(userId: null, exerciseType, cancellationToken);
            var trainingData = _modelTrainingDataConverter.ConvertForGlobalModel(entities);
            var activeModel = await _aiModelLifecycleService.GetActiveModelAsync(userId, AiModelTypeEnum.Global, exerciseType, cancellationToken);

            return (activeModel, trainingData);
        }

        public async Task<(AiModelEntity? ActiveModel, IReadOnlyList<UserAiTrainingDataModel> TrainingData)> PrepareUserTrainingAsync(
            long userId,
            ExerciseTypeEnum? exerciseType = null,
            CancellationToken cancellationToken = default)
        {
            var entities = await _modelTrainingDataLoader.LoadTrainingDataAsync(userId, exerciseType, cancellationToken);
            var trainingData = _modelTrainingDataConverter.ConvertForUserModel(entities);
            var activeModel = await _aiModelLifecycleService.GetActiveModelAsync(userId, AiModelTypeEnum.User, exerciseType, cancellationToken);

            return (activeModel, trainingData);
        }

        public Task<AiModelEntity> PersistTrainedGlobalModelAsync(
            long userId,
            ExerciseTypeEnum? exerciseType,
            byte[] modelData,
            CancellationToken cancellationToken = default)
        {
            return _aiModelLifecycleService.ActivateNewModelAsync(userId, AiModelTypeEnum.Global, exerciseType, modelData, cancellationToken);
        }

        public Task<AiModelEntity> PersistTrainedUserModelAsync(
            long userId,
            ExerciseTypeEnum? exerciseType,
            byte[] modelData,
            CancellationToken cancellationToken = default)
        {
            return _aiModelLifecycleService.ActivateNewModelAsync(userId, AiModelTypeEnum.User, exerciseType, modelData, cancellationToken);
        }
    }
}
