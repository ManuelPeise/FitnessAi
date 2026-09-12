using AiUnitTests.WorkoutIntensity.Fakes;
using Data.Database.Entities.Ai;
using Data.Database.Entities.HealthConnect;
using Logic.Ai.Training.WorkoutIntensity;
using Microsoft.Extensions.Logging.Abstractions;
using Shared.Enums.Ai;
using Shared.Enums.HealthConnect;

namespace AiUnitTests.WorkoutIntensity
{
    public class WorkoutIntensityModelTrainerTests
    {
        [Fact]
        public async Task TrainAndActivateModelAsync_ReturnsNull_WhenLabeledDataBelowMinimum()
        {
            var aiUnitOfWork = new FakeAiUnitOfWork();
            aiUnitOfWork.TrainingData.Items.AddRange(BuildLabeledEntities(count: 5));
            var lifecycleService = new FakeAiModelLifecycleService();
            var trainer = new WorkoutIntensityModelTrainer(
                NullLogger<WorkoutIntensityModelTrainer>.Instance, aiUnitOfWork, new WorkoutIntensityMlModelBuilder(), lifecycleService);

            var result = await trainer.TrainAndActivateModelAsync();

            Assert.Null(result);
            Assert.Null(lifecycleService.ActivateNewModelCall);
        }

        [Fact]
        public async Task TrainAndActivateModelAsync_ActivatesGlobalModel_WhenEnoughLabeledDataAvailable()
        {
            var aiUnitOfWork = new FakeAiUnitOfWork();
            aiUnitOfWork.TrainingData.Items.AddRange(BuildLabeledEntities(count: 30));
            var activatedModel = new AiModelEntity { Version = 1 };
            var lifecycleService = new FakeAiModelLifecycleService(activatedModel: activatedModel);
            var trainer = new WorkoutIntensityModelTrainer(
                NullLogger<WorkoutIntensityModelTrainer>.Instance, aiUnitOfWork, new WorkoutIntensityMlModelBuilder(), lifecycleService);

            var result = await trainer.TrainAndActivateModelAsync();

            Assert.Same(activatedModel, result);
            Assert.NotNull(lifecycleService.ActivateNewModelCall);
            Assert.Null(lifecycleService.ActivateNewModelCall!.Value.UserId);
            Assert.Null(lifecycleService.ActivateNewModelCall!.Value.ExerciseType);
            Assert.NotEmpty(lifecycleService.ActivateNewModelCall!.Value.ModelData);
        }

        private static List<HealthConnectAiTrainingDataEntity> BuildLabeledEntities(int count)
        {
            var labels = new[] { WorkoutIntensityEnum.Easy, WorkoutIntensityEnum.Medium, WorkoutIntensityEnum.Hard };
            var entities = new List<HealthConnectAiTrainingDataEntity>();

            for (var i = 0; i < count; i++)
            {
                entities.Add(new HealthConnectAiTrainingDataEntity
                {
                    UserId = 1,
                    ExerciseType = ExerciseTypeEnum.Running,
                    WorkoutIntensity = labels[i % labels.Length],
                    EvaluationMetersAvg = 10 + i,
                    DurationSecondsPerKm = 300 + i,
                    HeartRate = new HealthConnectAvgEntity { Avg = 100 + i },
                });
            }

            return entities;
        }
    }
}
