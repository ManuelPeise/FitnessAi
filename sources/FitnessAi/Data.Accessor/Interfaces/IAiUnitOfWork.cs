using Data.Database.Entities.Ai;

namespace Data.Accessor.Interfaces
{
    public interface IAiUnitOfWork
    {
        IRepositoryBase<AiHealthConnectExerciseTrainingDataEntity> AiHealthConnectExerciseTrainingDataRepository { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
