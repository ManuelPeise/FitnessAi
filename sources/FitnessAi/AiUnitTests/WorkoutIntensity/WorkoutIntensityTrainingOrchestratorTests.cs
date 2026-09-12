using AiUnitTests.WorkoutIntensity.Fakes;
using Data.Database.Entities.Ai;
using Data.Database.Entities.HealthConnect;
using Logic.Ai.Interfaces;
using Logic.Ai.Training.WorkoutIntensity;
using Microsoft.Extensions.Logging.Abstractions;
using Shared.Enums.Ai;

namespace AiUnitTests.WorkoutIntensity
{
    public class WorkoutIntensityTrainingOrchestratorTests
    {
        [Fact]
        public async Task RunAsync_ScoresUnscoredRecords_AndPersistsPredictedIntensityToBothRepositories()
        {
            var aiUnitOfWork = new FakeAiUnitOfWork();
            var unscoredRecord = new HealthConnectAiTrainingDataEntity { UserId = 1, DataKey = "abc", WorkoutIntensityPredictedAt = null };
            aiUnitOfWork.TrainingData.Items.Add(unscoredRecord);

            var healthUnitOfWork = new FakeHealthUnitOfWork();
            var rawRecord = new HealthConnectTrainingDataEntity { UserId = 1, DataKey = "abc" };
            healthUnitOfWork.TrainingData.Items.Add(rawRecord);

            var predictor = new FakePredictor(WorkoutIntensityEnum.Hard);
            var orchestrator = CreateOrchestrator(aiUnitOfWork, healthUnitOfWork, predictor);

            await orchestrator.RunAsync();

            var updatedAiRecord = Assert.Single(aiUnitOfWork.TrainingData.UpdatedItems);
            Assert.Equal(WorkoutIntensityEnum.Hard, updatedAiRecord.WorkoutIntensity);
            Assert.NotNull(updatedAiRecord.WorkoutIntensityPredictedAt);

            var updatedRawRecord = Assert.Single(healthUnitOfWork.TrainingData.UpdatedItems);
            Assert.Equal(WorkoutIntensityEnum.Hard, updatedRawRecord.WorkoutIntensity);

            Assert.Equal(1, aiUnitOfWork.SaveChangesCallCount);
            Assert.Equal(1, healthUnitOfWork.SaveChangesCallCount);
        }

        [Fact]
        public async Task RunAsync_SkipsSaving_WhenNoUnscoredRecordsExist()
        {
            var aiUnitOfWork = new FakeAiUnitOfWork();
            var healthUnitOfWork = new FakeHealthUnitOfWork();
            var orchestrator = CreateOrchestrator(aiUnitOfWork, healthUnitOfWork, new FakePredictor(WorkoutIntensityEnum.Easy));

            await orchestrator.RunAsync();

            Assert.Empty(aiUnitOfWork.TrainingData.UpdatedItems);
            Assert.Equal(0, aiUnitOfWork.SaveChangesCallCount);
            Assert.Equal(0, healthUnitOfWork.SaveChangesCallCount);
        }

        private static WorkoutIntensityTrainingOrchestrator CreateOrchestrator(
            FakeAiUnitOfWork aiUnitOfWork, FakeHealthUnitOfWork healthUnitOfWork, FakePredictor predictor)
        {
            return new WorkoutIntensityTrainingOrchestrator(
                NullLogger<WorkoutIntensityTrainingOrchestrator>.Instance,
                new FakeLabelGenerator(),
                new FakeModelTrainer(),
                predictor,
                aiUnitOfWork,
                healthUnitOfWork);
        }

        private class FakeLabelGenerator : IWorkoutIntensityLabelGenerator
        {
            public Task<int> BackfillLabelsAsync(long? userId = null, CancellationToken cancellationToken = default) => Task.FromResult(0);
        }

        private class FakeModelTrainer : IWorkoutIntensityModelTrainer
        {
            public Task<AiModelEntity?> TrainAndActivateModelAsync(CancellationToken cancellationToken = default) => Task.FromResult<AiModelEntity?>(null);
        }

        private class FakePredictor : IWorkoutIntensityPredictor
        {
            private readonly WorkoutIntensityEnum _intensity;

            public FakePredictor(WorkoutIntensityEnum intensity)
            {
                _intensity = intensity;
            }

            public Task<WorkoutIntensityEnum> PredictAsync(HealthConnectAiTrainingDataEntity entity, CancellationToken cancellationToken = default)
            {
                return Task.FromResult(_intensity);
            }
        }
    }
}
