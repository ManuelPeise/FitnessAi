using Data.Database.Entities.Ai;

namespace Data.Accessor.Interfaces
{
    public interface IAiUnitOfWork
    {
        IRepositoryBase<HealthConnectRunningAiTrainingDataEntity> HealthConnectRunningAiTrainingDataRepository { get; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
