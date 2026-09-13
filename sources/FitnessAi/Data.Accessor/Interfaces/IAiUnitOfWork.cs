using Data.Database.Entities.Ai;

namespace Data.Accessor.Interfaces
{
    public interface IAiUnitOfWork
    {
        IRepositoryBase<AiTrainingDataFileEntity> AiTrainingDataFileRepository { get; }
        IRepositoryBase<AiTrainedModelEntity> AiTrainedModelRepository { get; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
