using Data.Database.Entities.HealthConnect;

namespace Data.Accessor.Interfaces
{
    public interface IHealthUnitOfWork
    {
        IRepositoryBase<HealthConnectRecordEntity> HealthConnectRecordRepository { get; }
        IRepositoryBase<HealthConnectValueEntity> HealthConnectValueRepository { get; }
        IRepositoryBase<HealthConnectSegmentEntity> HealthConnectSegmentRepository { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
