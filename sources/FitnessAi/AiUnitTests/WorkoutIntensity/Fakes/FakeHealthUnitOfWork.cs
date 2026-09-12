using Data.Accessor.Interfaces;
using Data.Database.Entities.HealthConnect;
using Data.Database.Entities.Nutrition;

namespace AiUnitTests.WorkoutIntensity.Fakes
{
    internal class FakeHealthUnitOfWork : IHealthUnitOfWork
    {
        public FakeRepository<HealthConnectTrainingDataEntity> TrainingData { get; } = new();
        public int SaveChangesCallCount { get; private set; }

        public IRepositoryBase<HealthConnectUnitEntity> HealthConnectUnitRepository => throw new NotImplementedException();
        public IRepositoryBase<HealthConnectAvgEntity> HealthConnectAvgRepository => throw new NotImplementedException();
        public IRepositoryBase<HealthConnectBloodPressureEntity> HealthConnectBloodPressureRepository => throw new NotImplementedException();
        public IRepositoryBase<HealthConnectValuesEntity> HealthConnectValuesRepository => throw new NotImplementedException();
        public IRepositoryBase<HealthConnectHealthDataEntity> HealthConnectHealthDataRepository => throw new NotImplementedException();
        public IRepositoryBase<HealthConnectTimeZoneEntity> HealthConnectTimeZoneRepository => throw new NotImplementedException();
        public IRepositoryBase<HealthConnectTrainingDataEntity> HealthConnectTrainingDataRepository => TrainingData;
        public IRepositoryBase<HealthConnectTrainingDataValuesEntity> HealthConnectTrainingDataValuesRepository => throw new NotImplementedException();
        public IRepositoryBase<NutritionDataEntity> NutritionDataRepository => throw new NotImplementedException();
        public IRepositoryBase<NutritionValuesEntity> NutritionValuesRepository => throw new NotImplementedException();

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            SaveChangesCallCount++;
            return Task.FromResult(0);
        }
    }
}
