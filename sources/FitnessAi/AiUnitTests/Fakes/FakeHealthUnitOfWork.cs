using Data.Accessor.Interfaces;
using Data.Database.Entities.HealthConnect;
using Data.Database.Entities.Nutrition;

namespace AiUnitTests.Fakes
{
    internal class FakeHealthUnitOfWork : IHealthUnitOfWork
    {
        public FakeRepository<HealthConnectUnitEntity> Unit { get; } = new();
        public FakeRepository<HealthConnectAvgEntity> Avg { get; } = new();
        public FakeRepository<HealthConnectBloodPressureEntity> BloodPressure { get; } = new();
        public FakeRepository<HealthConnectValuesEntity> Values { get; } = new();
        public FakeRepository<HealthConnectHealthDataEntity> HealthData { get; } = new();
        public FakeRepository<HealthConnectTimeZoneEntity> TimeZone { get; } = new();
        public FakeRepository<HealthConnectTrainingDataEntity> TrainingData { get; } = new();
        public FakeRepository<HealthConnectTrainingDataValuesEntity> TrainingDataValues { get; } = new();
        public FakeRepository<NutritionDataEntity> NutritionData { get; } = new();
        public FakeRepository<NutritionValuesEntity> NutritionValues { get; } = new();
        public int SaveChangesCallCount { get; private set; }

        public IRepositoryBase<HealthConnectUnitEntity> HealthConnectUnitRepository => Unit;
        public IRepositoryBase<HealthConnectAvgEntity> HealthConnectAvgRepository => Avg;
        public IRepositoryBase<HealthConnectBloodPressureEntity> HealthConnectBloodPressureRepository => BloodPressure;
        public IRepositoryBase<HealthConnectValuesEntity> HealthConnectValuesRepository => Values;
        public IRepositoryBase<HealthConnectHealthDataEntity> HealthConnectHealthDataRepository => HealthData;
        public IRepositoryBase<HealthConnectTimeZoneEntity> HealthConnectTimeZoneRepository => TimeZone;
        public IRepositoryBase<HealthConnectTrainingDataEntity> HealthConnectTrainingDataRepository => TrainingData;
        public IRepositoryBase<HealthConnectTrainingDataValuesEntity> HealthConnectTrainingDataValuesRepository => TrainingDataValues;
        public IRepositoryBase<NutritionDataEntity> NutritionDataRepository => NutritionData;
        public IRepositoryBase<NutritionValuesEntity> NutritionValuesRepository => NutritionValues;

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            SaveChangesCallCount++;
            return Task.FromResult(0);
        }
    }
}
