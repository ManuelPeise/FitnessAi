using AiUnitTests.Fakes;
using Data.Database.Entities.Ai;
using Logic.Ai.Models;
using Logic.Ai.Services;
using Shared.Enums.Ai;

namespace AiUnitTests.Services
{
    public class AiModelVersionStorageServiceTests
    {
        [Fact]
        public async Task GetLatestModelMetricsAsync_ReturnsNull_WhenNoVersionsExistForAiType()
        {
            var aiUnitOfWork = new FakeAiUnitOfWork();
            var service = new AiModelVersionStorageService(aiUnitOfWork);

            var result = await service.GetLatestModelMetricsAsync(AiModelTypeEnum.WorkoutIntensity);

            Assert.Null(result);
        }

        [Fact]
        public async Task GetLatestModelMetricsAsync_ReturnsHighestVersion_WhenMultipleVersionsExist()
        {
            var aiUnitOfWork = new FakeAiUnitOfWork();
            aiUnitOfWork.TrainedModel.Items.Add(BuildEntity(AiModelTypeEnum.WorkoutIntensity, "0.0.1", macroAccuracy: 0.5));
            aiUnitOfWork.TrainedModel.Items.Add(BuildEntity(AiModelTypeEnum.WorkoutIntensity, "0.0.10", macroAccuracy: 0.9));
            aiUnitOfWork.TrainedModel.Items.Add(BuildEntity(AiModelTypeEnum.WorkoutIntensity, "0.0.2", macroAccuracy: 0.6));
            var service = new AiModelVersionStorageService(aiUnitOfWork);

            var result = await service.GetLatestModelMetricsAsync(AiModelTypeEnum.WorkoutIntensity);

            Assert.NotNull(result);
            Assert.Equal("0.0.10", result.Version);
            Assert.Equal(0.9, result.MacroAccuracy);
        }

        [Fact]
        public async Task GetLatestModelDataAsync_ReturnsNull_WhenNoVersionsExistForAiType()
        {
            var aiUnitOfWork = new FakeAiUnitOfWork();
            var service = new AiModelVersionStorageService(aiUnitOfWork);

            var result = await service.GetModelDataAsync(AiModelTypeEnum.WorkoutIntensity, modelVersion: null);

            Assert.Null(result);
        }

        [Fact]
        public async Task GetLatestModelDataAsync_ReturnsModelDataOfHighestVersion_WhenMultipleVersionsExist()
        {
            var aiUnitOfWork = new FakeAiUnitOfWork();
            var older = BuildEntity(AiModelTypeEnum.WorkoutIntensity, "0.0.1", macroAccuracy: 0.5);
            older.ModelData = new byte[] { 9, 9, 9 };
            var newer = BuildEntity(AiModelTypeEnum.WorkoutIntensity, "0.0.2", macroAccuracy: 0.6);
            newer.ModelData = new byte[] { 1, 2, 3 };
            aiUnitOfWork.TrainedModel.Items.Add(older);
            aiUnitOfWork.TrainedModel.Items.Add(newer);
            var service = new AiModelVersionStorageService(aiUnitOfWork);

            var result = await service.GetModelDataAsync(AiModelTypeEnum.WorkoutIntensity, modelVersion: null);

            Assert.Equal(newer.ModelData, result);
        }

        [Fact]
        public async Task SaveNewModelVersionAsync_InsertsInitialVersion_WhenNoneExistsForAiType()
        {
            var aiUnitOfWork = new FakeAiUnitOfWork();
            var service = new AiModelVersionStorageService(aiUnitOfWork);

            await service.SaveNewModelVersionAsync(AiModelTypeEnum.WorkoutIntensity, BuildResult());

            var added = Assert.Single(aiUnitOfWork.TrainedModel.AddedItems);
            Assert.Equal("0.0.1", added.Version);
            Assert.Equal(1, aiUnitOfWork.SaveChangesCallCount);
        }

        [Fact]
        public async Task SaveNewModelVersionAsync_InsertsNextPatchVersion_WithoutTouchingExistingRow()
        {
            var aiUnitOfWork = new FakeAiUnitOfWork();
            var existing = BuildEntity(AiModelTypeEnum.WorkoutIntensity, "0.0.1", macroAccuracy: 0.5);
            aiUnitOfWork.TrainedModel.Items.Add(existing);
            var service = new AiModelVersionStorageService(aiUnitOfWork);

            await service.SaveNewModelVersionAsync(AiModelTypeEnum.WorkoutIntensity, BuildResult());

            var added = Assert.Single(aiUnitOfWork.TrainedModel.AddedItems);
            Assert.Equal("0.0.2", added.Version);
            Assert.Empty(aiUnitOfWork.TrainedModel.UpdatedItems);
            Assert.Equal("0.0.1", existing.Version);
        }

        private static AiTrainedModelEntity BuildEntity(AiModelTypeEnum aiType, string version, double macroAccuracy)
        {
            return new AiTrainedModelEntity
            {
                AiType = aiType,
                Version = version,
                ModelData = [1, 2, 3],
                MicroAccuracy = macroAccuracy,
                MacroAccuracy = macroAccuracy,
                LogLoss = 0.1,
            };
        }

        private static AiModelTrainingResult BuildResult()
        {
            return new AiModelTrainingResult
            {
                ModelData = [1, 2, 3],
                MicroAccuracy = 0.8,
                MacroAccuracy = 0.8,
                LogLoss = 0.2,
            };
        }
    }
}
