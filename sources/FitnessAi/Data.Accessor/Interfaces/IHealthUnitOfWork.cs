using Data.Database.Entities.HealthConnect;
using Data.Database.Entities.Nutrition;

namespace Data.Accessor.Interfaces
{
    public interface IHealthUnitOfWork
    {
        IRepositoryBase<HealthConnectUnitEntity> HealthConnectUnitRepository { get; }
        IRepositoryBase<HealthConnectAvgEntity> HealthConnectAvgRepository { get; }
        IRepositoryBase<HealthConnectBloodPressureEntity> HealthConnectBloodPressureRepository { get; }
        IRepositoryBase<HealthConnectValuesEntity> HealthConnectValuesRepository { get; }
        IRepositoryBase<HealthConnectHealthDataEntity> HealthConnectHealthDataRepository { get; }
        IRepositoryBase<HealthConnectTimeZoneEntity> HealthConnectTimeZoneRepository { get; }
        IRepositoryBase<HealthConnectTrainingDataEntity> HealthConnectTrainingDataRepository { get; }
        IRepositoryBase<HealthConnectTrainingDataValuesEntity> HealthConnectTrainingDataValuesRepository { get; }
        IRepositoryBase<NutritionDataEntity> NutritionDataRepository { get; }
        IRepositoryBase<NutritionValuesEntity> NutritionValuesRepository { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
