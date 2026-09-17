using AiUnitTests.Fakes;
using Data.Database.Entities.HealthConnect;
using Logic.Services.HealthConnect;
using Shared.Enums.Ai;
using Shared.Enums.HealthConnect;
using Shared.Models.HealthConnect.QueryModels;

namespace AiUnitTests.Services
{
    public class TrainingDataServiceTests
    {
        private const long OwnerUserId = 1;
        private const long OtherUserId = 2;

        [Fact]
        public async Task GetTrainingDataAsync_ReturnsPagedItemsAndTotalCount()
        {
            var unitOfWork = new FakeHealthUnitOfWork();
            unitOfWork.TrainingData.Items.AddRange(
            [
                CreateEntity(1, OwnerUserId, ExerciseTypeEnum.Running),
                CreateEntity(2, OwnerUserId, ExerciseTypeEnum.Running),
                CreateEntity(3, OwnerUserId, ExerciseTypeEnum.Walking),
            ]);
            var service = CreateService(unitOfWork);

            var result = await service.GetTrainingDataAsync(new TrainingDataQuery { Page = 1, PageSize = 2 });

            Assert.Equal(3, result.TotalCount);
            Assert.Equal(2, result.Items.Count);
        }

        [Fact]
        public async Task GetTrainingDataAsync_FiltersByExerciseType()
        {
            var unitOfWork = new FakeHealthUnitOfWork();
            unitOfWork.TrainingData.Items.AddRange(
            [
                CreateEntity(1, OwnerUserId, ExerciseTypeEnum.Running),
                CreateEntity(2, OwnerUserId, ExerciseTypeEnum.Walking),
            ]);
            var service = CreateService(unitOfWork);

            var result = await service.GetTrainingDataAsync(new TrainingDataQuery { ExerciseType = ExerciseTypeEnum.Walking, Page = 1, PageSize = 10 });

            var item = Assert.Single(result.Items);
            Assert.Equal(ExerciseTypeEnum.Walking, item.ExerciseType);
        }

        [Fact]
        public async Task GetTrainingDataAsync_DoesNotReturnOtherUsersRecords()
        {
            var unitOfWork = new FakeHealthUnitOfWork();
            unitOfWork.TrainingData.Items.AddRange(
            [
                CreateEntity(1, OwnerUserId, ExerciseTypeEnum.Running),
                CreateEntity(2, OtherUserId, ExerciseTypeEnum.Running),
            ]);
            var service = CreateService(unitOfWork);

            var result = await service.GetTrainingDataAsync(new TrainingDataQuery { Page = 1, PageSize = 10 });

            var item = Assert.Single(result.Items);
            Assert.Equal(1, item.Id);
        }

        [Fact]
        public async Task UpdateTrainingDataAsync_AppliesEditableFieldsAndPersists()
        {
            var unitOfWork = new FakeHealthUnitOfWork();
            var entity = CreateEntity(1, OwnerUserId, ExerciseTypeEnum.Running);
            unitOfWork.TrainingData.Items.Add(entity);
            var service = CreateService(unitOfWork);

            await service.UpdateTrainingDataAsync(new TrainingDataUpdateRequest
            {
                Id = 1,
                WorkoutIntensity = WorkoutIntensityEnum.High,
                HeartRateAvg = 150,
                HeartRateMin = 100,
                HeartRateMax = 180,
            });

            Assert.Equal(WorkoutIntensityEnum.High, entity.WorkoutIntensity);
            Assert.Equal(150, entity.HealthConnectTrainingDataValues.HeartRate!.Avg);
            Assert.Equal(100, entity.HealthConnectTrainingDataValues.HeartRate!.Min);
            Assert.Equal(180, entity.HealthConnectTrainingDataValues.HeartRate!.Max);
            Assert.Equal(1, unitOfWork.SaveChangesCallCount);
        }

        [Fact]
        public async Task UpdateTrainingDataAsync_ThrowsWhenRecordNotFound()
        {
            var unitOfWork = new FakeHealthUnitOfWork();
            var service = CreateService(unitOfWork);

            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                service.UpdateTrainingDataAsync(new TrainingDataUpdateRequest { Id = 42 }));
        }

        [Fact]
        public async Task UpdateTrainingDataAsync_ThrowsWhenRecordBelongsToAnotherUser()
        {
            var unitOfWork = new FakeHealthUnitOfWork();
            unitOfWork.TrainingData.Items.Add(CreateEntity(1, OtherUserId, ExerciseTypeEnum.Running));
            var service = CreateService(unitOfWork);

            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                service.UpdateTrainingDataAsync(new TrainingDataUpdateRequest { Id = 1 }));
        }

        [Fact]
        public async Task DeleteTrainingDataAsync_RemovesOwnedRecord()
        {
            var unitOfWork = new FakeHealthUnitOfWork();
            var entity = CreateEntity(1, OwnerUserId, ExerciseTypeEnum.Running);
            unitOfWork.TrainingData.Items.Add(entity);
            var service = CreateService(unitOfWork);

            await service.DeleteTrainingDataAsync(1);

            Assert.Empty(unitOfWork.TrainingData.Items);
            Assert.Equal(1, unitOfWork.SaveChangesCallCount);
        }

        [Fact]
        public async Task DeleteTrainingDataAsync_ThrowsWhenRecordNotFound()
        {
            var unitOfWork = new FakeHealthUnitOfWork();
            var service = CreateService(unitOfWork);

            await Assert.ThrowsAsync<KeyNotFoundException>(() => service.DeleteTrainingDataAsync(42));
        }

        [Fact]
        public async Task DeleteTrainingDataAsync_ThrowsWhenRecordBelongsToAnotherUser()
        {
            var unitOfWork = new FakeHealthUnitOfWork();
            unitOfWork.TrainingData.Items.Add(CreateEntity(1, OtherUserId, ExerciseTypeEnum.Running));
            var service = CreateService(unitOfWork);

            await Assert.ThrowsAsync<KeyNotFoundException>(() => service.DeleteTrainingDataAsync(1));
            Assert.Single(unitOfWork.TrainingData.Items);
        }

        [Fact]
        public async Task GetTrainingDataAsync_ReturnsDistinctSortedAvailableExerciseTypesForCurrentUser()
        {
            var unitOfWork = new FakeHealthUnitOfWork();
            unitOfWork.TrainingData.Items.AddRange(
            [
                CreateEntity(1, OwnerUserId, ExerciseTypeEnum.Walking),
                CreateEntity(2, OwnerUserId, ExerciseTypeEnum.Running),
                CreateEntity(3, OwnerUserId, ExerciseTypeEnum.Running),
                CreateEntity(4, OtherUserId, ExerciseTypeEnum.Yoga),
            ]);
            var service = CreateService(unitOfWork);

            var result = await service.GetTrainingDataAsync(new TrainingDataQuery { Page = 1, PageSize = 10 });

            Assert.Equal([ExerciseTypeEnum.Running, ExerciseTypeEnum.Walking], result.AvailableExerciseTypes);
        }

        [Fact]
        public async Task GetTrainingDataAsync_AvailableExerciseTypesIgnoresCurrentExerciseTypeFilter()
        {
            var unitOfWork = new FakeHealthUnitOfWork();
            unitOfWork.TrainingData.Items.AddRange(
            [
                CreateEntity(1, OwnerUserId, ExerciseTypeEnum.Walking),
                CreateEntity(2, OwnerUserId, ExerciseTypeEnum.Running),
            ]);
            var service = CreateService(unitOfWork);

            var result = await service.GetTrainingDataAsync(new TrainingDataQuery
            {
                ExerciseType = ExerciseTypeEnum.Running,
                Page = 1,
                PageSize = 10,
            });

            var item = Assert.Single(result.Items);
            Assert.Equal(ExerciseTypeEnum.Running, item.ExerciseType);
            Assert.Equal([ExerciseTypeEnum.Running, ExerciseTypeEnum.Walking], result.AvailableExerciseTypes);
        }

        [Fact]
        public async Task ApplyWorkoutIntensityPredictionsAsync_OnlyPatchesRecordsWithoutExistingIntensity()
        {
            var unitOfWork = new FakeHealthUnitOfWork();
            var predictedEntity = CreateEntity(1, OwnerUserId, ExerciseTypeEnum.Running);
            var alreadySetEntity = CreateEntity(2, OwnerUserId, ExerciseTypeEnum.Running);
            alreadySetEntity.WorkoutIntensity = WorkoutIntensityEnum.Easy;
            unitOfWork.TrainingData.Items.AddRange([predictedEntity, alreadySetEntity]);
            var service = CreateService(unitOfWork);

            await service.ApplyWorkoutIntensityPredictionsAsync(
            [
                new TrainingDataPrediction { Id = 1, WorkoutIntensity = WorkoutIntensityEnum.High },
                new TrainingDataPrediction { Id = 2, WorkoutIntensity = WorkoutIntensityEnum.Medium },
            ]);

            Assert.Equal(WorkoutIntensityEnum.High, predictedEntity.WorkoutIntensity);
            Assert.Equal(WorkoutIntensityEnum.Easy, alreadySetEntity.WorkoutIntensity);
        }

        private static TrainingDataService CreateService(FakeHealthUnitOfWork unitOfWork)
        {
            return new TrainingDataService(unitOfWork, new FakeCurrentUserService { UserId = OwnerUserId });
        }

        private static HealthConnectTrainingDataEntity CreateEntity(long id, long userId, ExerciseTypeEnum exerciseType)
        {
            return new HealthConnectTrainingDataEntity
            {
                Id = id,
                DataKey = $"key-{id}",
                Origin = "test",
                System = "test-system",
                ExerciseType = exerciseType,
                StartTime = new DateTime(2026, 1, 1),
                EndTime = new DateTime(2026, 1, 1, 1, 0, 0),
                UserId = userId,
                HealthConnectTimeZoneEntityId = 1,
                HealthConnectTimeZoneEntity = new HealthConnectTimeZoneEntity { Id = 1 },
                HealthConnectTrainingDataValuesId = id,
                HealthConnectTrainingDataValues = new HealthConnectTrainingDataValuesEntity
                {
                    Id = id,
                    HeartRate = new HealthConnectAvgEntity { Avg = 120, Min = 90, Max = 160 },
                    Power = new HealthConnectAvgEntity { Avg = 150 },
                    Speed = new HealthConnectAvgEntity { Avg = 3 },
                    StepCadence = new HealthConnectAvgEntity { Avg = 80 },
                    CyclingPedalingCadence = new HealthConnectAvgEntity { Avg = 0 },
                },
            };
        }
    }
}
