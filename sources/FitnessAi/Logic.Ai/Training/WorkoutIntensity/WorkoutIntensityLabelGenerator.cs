using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.Ai;
using Logic.Ai.Interfaces;
using Shared.Enums.Ai;
using Shared.Enums.HealthConnect;
using System.Linq.Expressions;

namespace Logic.Ai.Training.WorkoutIntensity
{
    // Generates GROUND-TRUTH LABELS for training only. The ML model itself never runs this
    // heuristic at prediction time - it answers new records purely from what it learned during
    // training (see WorkoutIntensityMlModelBuilder/WorkoutIntensityPredictor).
    public class WorkoutIntensityLabelGenerator : IWorkoutIntensityLabelGenerator
    {
        // Below this many HeartRate.Max samples, an average is too noisy to trust as a label,
        // so we mark the group Unknown instead of teaching the model a guess.
        private const int MinSampleSizeForReliableAverage = 5;
        private const decimal EasyThreshold = 141m;
        private const decimal HardThreshold = 159m;

        private readonly IAiUnitOfWork _aiUnitOfWork;

        public WorkoutIntensityLabelGenerator(IAiUnitOfWork aiUnitOfWork)
        {
            _aiUnitOfWork = aiUnitOfWork;
        }

        public async Task<int> BackfillLabelsAsync(long? userId = null, CancellationToken cancellationToken = default)
        {
            var entities = await LoadEntitiesAsync(userId, cancellationToken);

            if (entities.Count == 0)
            {
                return 0;
            }

            var updatedCount = 0;

            // One label per (user, exercise type) combination: a user's Easy 5k run and Hard 5k
            // run both get the same label here, because the label reflects how hard THIS
            // user's THIS exercise type tends to be for them on average, not the individual run.
            foreach (var group in entities.GroupBy(x => (x.UserId, x.ExerciseType)))
            {
                var label = ComputeLabel(group.ToList());
                updatedCount += await ApplyLabelAsync(group, label, cancellationToken);
            }

            await _aiUnitOfWork.SaveChangesAsync(cancellationToken);

            return updatedCount;
        }

        private async Task<IReadOnlyList<HealthConnectAiTrainingDataEntity>> LoadEntitiesAsync(long? userId, CancellationToken cancellationToken)
        {
            var options = new DbQueryOptions<HealthConnectAiTrainingDataEntity>
            {
                WhereExpression = userId == null ? null : (Expression<Func<HealthConnectAiTrainingDataEntity, bool>>)(x => x.UserId == userId),
                Includes = new List<Expression<Func<HealthConnectAiTrainingDataEntity, object>>>
                {
                    x => x.HeartRate!,
                }
            };

            return await _aiUnitOfWork.HealthConnectAiTrainingDataRepository.GetAsync(options, cancellationToken);
        }

        private async Task<int> ApplyLabelAsync(IEnumerable<HealthConnectAiTrainingDataEntity> group, WorkoutIntensityEnum label, CancellationToken cancellationToken)
        {
            var updatedCount = 0;

            foreach (var entity in group)
            {
                if (entity.WorkoutIntensity == label)
                {
                    continue;
                }

                entity.WorkoutIntensity = label;
                await _aiUnitOfWork.HealthConnectAiTrainingDataRepository.UpdateAsync(entity, cancellationToken);
                updatedCount++;
            }

            return updatedCount;
        }

        // The actual labeling heuristic: average this group's max heart rate and bucket it.
        // Note this uses HeartRate.Max (peak effort), while the ML features later use
        // HeartRate.Avg (typical effort) - they intentionally measure different things.
        // Public + static so it's a pure function we can unit-test without any DB dependency.
        public static WorkoutIntensityEnum ComputeLabel(IReadOnlyList<HealthConnectAiTrainingDataEntity> group)
        {
            var maxHeartRates = group
                .Where(x => x.HeartRate?.Max != null)
                .Select(x => x.HeartRate!.Max!.Value)
                .ToList();

            if (maxHeartRates.Count < MinSampleSizeForReliableAverage)
            {
                return WorkoutIntensityEnum.Unknown;
            }

            var avgMaxHeartRate = maxHeartRates.Average();

            if (avgMaxHeartRate < EasyThreshold)
            {
                return WorkoutIntensityEnum.Easy;
            }

            return avgMaxHeartRate <= HardThreshold ? WorkoutIntensityEnum.Medium : WorkoutIntensityEnum.Hard;
        }
    }
}
