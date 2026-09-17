using AiUnitTests.Fakes;
using Data.Database.Entities.HealthConnect;
using Logic.Ai.Prediction;
using Shared.Enums.Ai;
using Shared.Enums.HealthConnect;
using Shared.Models.HealthConnect.QueryModels;

namespace AiUnitTests.Prediction
{
    public class TrainingIntensityPredictionServiceTests
    {
        private const long OwnerUserId = 1;

        [Fact]
        public async Task PredictAsync_ReturnsPredictionForEligibleRecord()
        {
            var unitOfWork = new FakeHealthUnitOfWork();
            unitOfWork.TrainingData.Items.Add(CreateEntity(1, workoutIntensity: null));
            var predictor = new FakeWorkoutIntensityPredictor { Result = WorkoutIntensityEnum.High };
            var service = CreateService(unitOfWork, predictor);

            var result = await service.PredictAsync(new TrainingDataQuery());

            var prediction = Assert.Single(result);
            Assert.Equal(1, prediction.Id);
            Assert.Equal(WorkoutIntensityEnum.High, prediction.WorkoutIntensity);
        }

        [Theory]
        [InlineData(WorkoutIntensityEnum.Easy)]
        [InlineData(WorkoutIntensityEnum.Medium)]
        [InlineData(WorkoutIntensityEnum.High)]
        public async Task PredictAsync_CanReturnAnyIntensityClass(WorkoutIntensityEnum expected)
        {
            var unitOfWork = new FakeHealthUnitOfWork();
            unitOfWork.TrainingData.Items.Add(CreateEntity(1, workoutIntensity: null));
            var predictor = new FakeWorkoutIntensityPredictor { Result = expected };
            var service = CreateService(unitOfWork, predictor);

            var result = await service.PredictAsync(new TrainingDataQuery());

            Assert.Equal(expected, Assert.Single(result).WorkoutIntensity);
        }

        [Fact]
        public async Task PredictAsync_SkipsRecordsThatAlreadyHaveWorkoutIntensity()
        {
            var unitOfWork = new FakeHealthUnitOfWork();
            unitOfWork.TrainingData.Items.Add(CreateEntity(1, workoutIntensity: WorkoutIntensityEnum.Easy));
            var predictor = new FakeWorkoutIntensityPredictor();
            var service = CreateService(unitOfWork, predictor);

            var result = await service.PredictAsync(new TrainingDataQuery());

            Assert.Empty(result);
            Assert.Empty(predictor.Inputs);
        }

        [Fact]
        public async Task PredictAsync_SkipsRecordWhenPredictorReturnsNull()
        {
            var unitOfWork = new FakeHealthUnitOfWork();
            unitOfWork.TrainingData.Items.Add(CreateEntity(1, workoutIntensity: null));
            var predictor = new FakeWorkoutIntensityPredictor { Result = null };
            var service = CreateService(unitOfWork, predictor);

            var result = await service.PredictAsync(new TrainingDataQuery());

            Assert.Empty(result);
        }

        private static TrainingIntensityPredictionService CreateService(FakeHealthUnitOfWork unitOfWork, FakeWorkoutIntensityPredictor predictor)
        {
            return new TrainingIntensityPredictionService(unitOfWork, new FakeCurrentUserService { UserId = OwnerUserId }, predictor);
        }

        private static HealthConnectTrainingDataEntity CreateEntity(long id, WorkoutIntensityEnum? workoutIntensity)
        {
            return new HealthConnectTrainingDataEntity
            {
                Id = id,
                DataKey = $"key-{id}",
                Origin = "test",
                System = "test-system",
                ExerciseType = ExerciseTypeEnum.Running,
                StartTime = new DateTime(2026, 1, 1),
                EndTime = new DateTime(2026, 1, 1, 1, 0, 0),
                UserId = OwnerUserId,
                WorkoutIntensity = workoutIntensity,
                HealthConnectTimeZoneEntityId = 1,
                HealthConnectTimeZoneEntity = new HealthConnectTimeZoneEntity { Id = 1 },
                HealthConnectTrainingDataValuesId = id,
                HealthConnectTrainingDataValues = new HealthConnectTrainingDataValuesEntity
                {
                    Id = id,
                    ElevationAvg = 10,
                    DistanceInMeters = 5000,
                    DurationSeconds = 1800,
                    HeartRate = new HealthConnectAvgEntity { Avg = 140, Min = 100, Max = 170 },
                    Power = new HealthConnectAvgEntity { Avg = 200 },
                },
            };
        }
    }
}
