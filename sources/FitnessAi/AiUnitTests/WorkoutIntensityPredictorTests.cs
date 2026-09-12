using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.Ai;
using Logic.Ai.Interfaces;
using Logic.Ai.Training.WorkoutIntensity;
using Shared.Enums.Ai;
using Shared.Enums.HealthConnect;

namespace AiUnitTests
{
    public class WorkoutIntensityPredictorTests
    {
        [Fact]
        public async Task PredictAsync_ReturnsUnknown_WhenNoActiveModelExists()
        {
            var aiUnitOfWork = new FakeAiUnitOfWork();
            var lifecycleService = new FakeAiModelLifecycleService(activeModel: null);
            var predictor = new WorkoutIntensityPredictor(aiUnitOfWork, lifecycleService);

            var result = await predictor.PredictAsync(new HealthConnectAiTrainingDataEntity { UserId = 1 });

            Assert.Equal(WorkoutIntensityEnum.Unknown, result);
        }

        [Fact]
        public async Task PredictAsync_ReturnsUnknown_WhenActiveModelHasNoStoredBinary()
        {
            var aiUnitOfWork = new FakeAiUnitOfWork(binary: null);
            var lifecycleService = new FakeAiModelLifecycleService(activeModel: new AiModelEntity { Id = 1, ModelType = AiModelTypeEnum.WorkoutIntensity, IsActive = true });
            var predictor = new WorkoutIntensityPredictor(aiUnitOfWork, lifecycleService);

            var result = await predictor.PredictAsync(new HealthConnectAiTrainingDataEntity { UserId = 1 });

            Assert.Equal(WorkoutIntensityEnum.Unknown, result);
        }

        private class FakeAiModelLifecycleService : IAiModelLifecycleService
        {
            private readonly AiModelEntity? _activeModel;

            public FakeAiModelLifecycleService(AiModelEntity? activeModel)
            {
                _activeModel = activeModel;
            }

            public Task<AiModelEntity?> GetActiveModelAsync(long? userId, AiModelTypeEnum modelType, ExerciseTypeEnum? exerciseType, CancellationToken cancellationToken = default)
            {
                return Task.FromResult(_activeModel);
            }

            public Task<AiModelEntity> ActivateNewModelAsync(long? userId, AiModelTypeEnum modelType, ExerciseTypeEnum? exerciseType, byte[] modelData, CancellationToken cancellationToken = default)
            {
                throw new NotImplementedException();
            }
        }

        private class FakeAiUnitOfWork : IAiUnitOfWork
        {
            public FakeAiUnitOfWork(AiModelBinaryEntity? binary = null)
            {
                AiModelBinaryRepository = new FakeAiModelBinaryRepository(binary);
            }

            public IRepositoryBase<HealthConnectAiTrainingDataEntity> HealthConnectAiTrainingDataRepository => throw new NotImplementedException();
            public IRepositoryBase<HealthConnectAiTrainingLap> HealthConnectAiTrainingLapRepository => throw new NotImplementedException();
            public IRepositoryBase<HealthConnectAiTrainingSegmentEntity> HealthConnectAiTrainingSegmentRepository => throw new NotImplementedException();
            public IRepositoryBase<AiModelEntity> AiModelRepository => throw new NotImplementedException();
            public IRepositoryBase<AiModelBinaryEntity> AiModelBinaryRepository { get; }

            public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) => Task.FromResult(0);
        }

        private class FakeAiModelBinaryRepository : IRepositoryBase<AiModelBinaryEntity>
        {
            private readonly AiModelBinaryEntity? _binary;

            public FakeAiModelBinaryRepository(AiModelBinaryEntity? binary)
            {
                _binary = binary;
            }

            public Task<IReadOnlyList<AiModelBinaryEntity>> GetAsync(DbQueryOptions<AiModelBinaryEntity>? options = null, CancellationToken cancellationToken = default)
            {
                throw new NotImplementedException();
            }

            public Task<AiModelBinaryEntity?> GetByIdAsync(long id, bool asNoTracking = false, List<System.Linq.Expressions.Expression<Func<AiModelBinaryEntity, object>>>? includeExpressions = null, CancellationToken cancellationToken = default)
            {
                throw new NotImplementedException();
            }

            public Task<AiModelBinaryEntity?> GetSingleAsync(DbQueryOptions<AiModelBinaryEntity> options, bool asNoTracking = false, CancellationToken cancellationToken = default)
            {
                return Task.FromResult(_binary);
            }

            public Task<AiModelBinaryEntity> AddAsync(AiModelBinaryEntity entity, CancellationToken cancellationToken = default) => throw new NotImplementedException();
            public Task AddRangeAsync(List<AiModelBinaryEntity> entities, CancellationToken cancellationToken = default) => throw new NotImplementedException();
            public Task<AiModelBinaryEntity> AddOrUpdateAsync(AiModelBinaryEntity entity, CancellationToken cancellationToken = default) => throw new NotImplementedException();
            public Task UpdateAsync(AiModelBinaryEntity entity, CancellationToken cancellationToken = default) => throw new NotImplementedException();
            public Task DeleteAsync(AiModelBinaryEntity entity, CancellationToken cancellationToken = default) => throw new NotImplementedException();
            public Task DeleteRange(IEnumerable<AiModelBinaryEntity>? entities, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        }
    }
}
