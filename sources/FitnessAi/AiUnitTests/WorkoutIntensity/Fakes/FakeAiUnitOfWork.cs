using Data.Accessor.Interfaces;
using Data.Database.Entities.Ai;

namespace AiUnitTests.WorkoutIntensity.Fakes
{
    internal class FakeAiUnitOfWork : IAiUnitOfWork
    {
        public FakeRepository<HealthConnectAiTrainingDataEntity> TrainingData { get; } = new();
        public FakeRepository<AiModelBinaryEntity> ModelBinary { get; } = new();
        public int SaveChangesCallCount { get; private set; }

        public IRepositoryBase<HealthConnectAiTrainingDataEntity> HealthConnectAiTrainingDataRepository => TrainingData;
        public IRepositoryBase<HealthConnectAiTrainingLap> HealthConnectAiTrainingLapRepository => throw new NotImplementedException();
        public IRepositoryBase<HealthConnectAiTrainingSegmentEntity> HealthConnectAiTrainingSegmentRepository => throw new NotImplementedException();
        public IRepositoryBase<AiModelEntity> AiModelRepository => throw new NotImplementedException();
        public IRepositoryBase<AiModelBinaryEntity> AiModelBinaryRepository => ModelBinary;

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            SaveChangesCallCount++;
            return Task.FromResult(0);
        }
    }
}
