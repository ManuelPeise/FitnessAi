using Data.Accessor.Interfaces;
using Data.Database.Entities.Ai;

namespace AiUnitTests.Fakes
{
    internal class FakeAiUnitOfWork : IAiUnitOfWork
    {
        public FakeRepository<AiTrainingDataFileEntity> TrainingDataFile { get; } = new();
        public int SaveChangesCallCount { get; private set; }

        public IRepositoryBase<AiTrainingDataFileEntity> AiTrainingDataFileRepository => TrainingDataFile;

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            SaveChangesCallCount++;
            return Task.FromResult(0);
        }
    }
}
