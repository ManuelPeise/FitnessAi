using Data.Database.Entities.Ai;

namespace Data.Accessor.Interfaces
{
    public interface IAiUnitOfWork
    {
        IRepositoryBase<HealthConnectAiTrainingDataEntity> HealthConnectAiTrainingDataRepository { get; }
        IRepositoryBase<HealthConnectAiTrainingLap> HealthConnectAiTrainingLapRepository { get; }
        IRepositoryBase<HealthConnectAiTrainingSegmentEntity> HealthConnectAiTrainingSegmentRepository { get; }
        IRepositoryBase<AiModelEntity> AiModelRepository { get; }
        IRepositoryBase<AiModelBinaryEntity> AiModelBinaryRepository { get; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
