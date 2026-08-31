using Data.Database.Entities.Ai;

namespace Data.Accessor.Interfaces
{
    public interface IAiUnitOfWork
    {
        IRepositoryBase<RunningTrainingDataEntity> RunningTrainingDataRepository { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
