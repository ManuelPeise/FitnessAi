using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.Ai;
using Data.Database.Entities.HealthConnect;
using Logic.Ai.Interfaces;
using Microsoft.Extensions.Logging;

namespace Logic.Ai.Training.WorkoutIntensity
{
    public class WorkoutIntensityTrainingOrchestrator : IWorkoutIntensityTrainingOrchestrator
    {
        private readonly ILogger<WorkoutIntensityTrainingOrchestrator> _logger;
        private readonly IWorkoutIntensityLabelGenerator _labelGenerator;
        private readonly IWorkoutIntensityModelTrainer _modelTrainer;
        private readonly IWorkoutIntensityPredictor _predictor;
        private readonly IAiUnitOfWork _aiUnitOfWork;
        private readonly IHealthUnitOfWork _healthUnitOfWork;

        public WorkoutIntensityTrainingOrchestrator(
            ILogger<WorkoutIntensityTrainingOrchestrator> logger,
            IWorkoutIntensityLabelGenerator labelGenerator,
            IWorkoutIntensityModelTrainer modelTrainer,
            IWorkoutIntensityPredictor predictor,
            IAiUnitOfWork aiUnitOfWork,
            IHealthUnitOfWork healthUnitOfWork)
        {
            _logger = logger;
            _labelGenerator = labelGenerator;
            _modelTrainer = modelTrainer;
            _predictor = predictor;
            _aiUnitOfWork = aiUnitOfWork;
            _healthUnitOfWork = healthUnitOfWork;
        }

        public async Task RunAsync(CancellationToken cancellationToken = default)
        {
            var updatedLabels = await _labelGenerator.BackfillLabelsAsync(cancellationToken: cancellationToken);
            _logger.LogInformation("WorkoutIntensity label backfill updated {Count} rows.", updatedLabels);

            var activatedModel = await _modelTrainer.TrainAndActivateModelAsync(cancellationToken);
            if (activatedModel != null)
            {
                _logger.LogInformation("Activated WorkoutIntensity model version {Version}.", activatedModel.Version);
            }

            await PredictForUnscoredRecordsAsync(cancellationToken);
        }

        private async Task PredictForUnscoredRecordsAsync(CancellationToken cancellationToken)
        {
            var unscoredRecords = await _aiUnitOfWork.HealthConnectAiTrainingDataRepository.GetAsync(new DbQueryOptions<HealthConnectAiTrainingDataEntity>
            {
                WhereExpression = x => x.WorkoutIntensityPredictedAt == null,
            }, cancellationToken);

            if (unscoredRecords.Count == 0)
            {
                return;
            }

            foreach (var record in unscoredRecords)
            {
                await ScoreRecordAsync(record, cancellationToken);
            }

            await _aiUnitOfWork.SaveChangesAsync(cancellationToken);
            await _healthUnitOfWork.SaveChangesAsync(cancellationToken);
        }

        private async Task ScoreRecordAsync(HealthConnectAiTrainingDataEntity record, CancellationToken cancellationToken)
        {
            var predictedIntensity = await _predictor.PredictAsync(record, cancellationToken);

            record.WorkoutIntensity = predictedIntensity;
            record.WorkoutIntensityPredictedAt = DateTime.UtcNow;
            await _aiUnitOfWork.HealthConnectAiTrainingDataRepository.UpdateAsync(record, cancellationToken);

            var rawRecord = await _healthUnitOfWork.HealthConnectTrainingDataRepository.GetSingleAsync(new DbQueryOptions<HealthConnectTrainingDataEntity>
            {
                WhereExpression = x => x.DataKey == record.DataKey && x.UserId == record.UserId,
            }, cancellationToken: cancellationToken);

            if (rawRecord == null)
            {
                return;
            }

            rawRecord.WorkoutIntensity = predictedIntensity;
            await _healthUnitOfWork.HealthConnectTrainingDataRepository.UpdateAsync(rawRecord, cancellationToken);
        }
    }
}
