using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.Ai;
using Logic.Ai.Interfaces;
using Shared.Enums.HealthConnect;
using System.Linq.Expressions;

namespace Logic.Ai.Training.ModelTrainers
{
    public class ModelTrainingDataLoader : IModelTrainingDataLoader
    {
        private readonly IAiUnitOfWork _aiUnitOfWork;

        public ModelTrainingDataLoader(IAiUnitOfWork aiUnitOfWork)
        {
            _aiUnitOfWork = aiUnitOfWork;
        }

        public async Task<IReadOnlyList<HealthConnectAiTrainingDataEntity>> LoadTrainingDataAsync(
            long? userId = null,
            ExerciseTypeEnum? exerciseType = null,
            CancellationToken cancellationToken = default)
        {
            var options = new DbQueryOptions<HealthConnectAiTrainingDataEntity>
            {
                AsNoTracking = true,
                WhereExpression = BuildFilterExpression(userId, exerciseType),
                Includes = new List<Expression<Func<HealthConnectAiTrainingDataEntity, object>>>
                {
                    x => x.Segments,
                    x => x.Laps,
                }
            };

            return await _aiUnitOfWork.HealthConnectAiTrainingDataRepository.GetAsync(options, cancellationToken);
        }

        private Expression<Func<HealthConnectAiTrainingDataEntity, bool>>? BuildFilterExpression(
            long? userId,
            ExerciseTypeEnum? exerciseType)
        {
            if (userId == null && exerciseType == null)
            {
                return null;
            }

            return x =>
                (userId == null || x.UserId == userId) &&
                (exerciseType == null || x.ExerciseType == exerciseType);
        }
    }
}
