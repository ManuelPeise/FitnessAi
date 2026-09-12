using AiUnitTests.WorkoutIntensity.Fakes;
using Data.Database.Entities.Ai;
using Logic.Ai.Prediction.WorkoutIntensity;
using Shared.Enums.Ai;

namespace AiUnitTests.WorkoutIntensity
{
    public class WorkoutIntensityPredictorTests
    {
        [Fact]
        public async Task PredictAsync_ReturnsUnknown_WhenNoActiveModelExists()
        {
            var aiUnitOfWork = new FakeAiUnitOfWork();
            var lifecycleService = new FakeAiModelLifecycleService(activeModel: null);
            var predictor = new WorkoutIntensityPredictor(aiUnitOfWork, lifecycleService);

            var result = await predictor.PredictAsync(new HealthConnectAiTrainingDataEntity { UserId = 1 });

            Assert.Equal(WorkoutIntensityEnum.Unknown, result);
        }

        [Fact]
        public async Task PredictAsync_ReturnsUnknown_WhenActiveModelHasNoStoredBinary()
        {
            var aiUnitOfWork = new FakeAiUnitOfWork();
            var lifecycleService = new FakeAiModelLifecycleService(activeModel: new AiModelEntity { Id = 1, ModelType = AiModelTypeEnum.WorkoutIntensity, IsActive = true });
            var predictor = new WorkoutIntensityPredictor(aiUnitOfWork, lifecycleService);

            var result = await predictor.PredictAsync(new HealthConnectAiTrainingDataEntity { UserId = 1 });

            Assert.Equal(WorkoutIntensityEnum.Unknown, result);
        }
    }
}
