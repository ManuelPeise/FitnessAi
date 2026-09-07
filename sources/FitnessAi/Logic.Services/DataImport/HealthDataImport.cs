using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.HealthConnect;
using Data.Database.Models.Scheduler;
using Logic.Services.Interfaces;
using Logic.Shared.Interfaces;
using Microsoft.Extensions.Logging;
using Shared.Models.HealthConnect;

namespace Logic.Services.DataImport
{
    public class HealthDataImport : IHealthDataImport
    {
        private const string HealthConnectTrainingJobName = "Ai Health Connect Training Data Job";
        private const string HealthConnectTrainingJobDescription = "Train the Ai model with the imported health data.";
        private const string HealthConnectTrainingJobUrl = "AiTrainingDataGeneration/GenerateAiTrainingData";
        private readonly ILogger<HealthDataImport> _logger;
        private readonly IApplicationUnitOfWork _applicationUnitOfWork;
        private readonly IScheduledJobService _scheduledJobService;
        private readonly ICurrentUserService _currentUserService;

        public HealthDataImport(
            ILogger<HealthDataImport> logger,
            IApplicationUnitOfWork applicationUnitOfWork,
            IScheduledJobService scheduledJobService,
            ICurrentUserService currentUserService)
        {
            _logger = logger;
            _applicationUnitOfWork = applicationUnitOfWork;
            _scheduledJobService = scheduledJobService;
            _currentUserService = currentUserService;
        }

        public async Task ImportHealthConnectData(HealthConnectApiModel requestModel)
        {
            try
            {
                await ImportData(requestModel.TrainingData, true);
                await ImportData(requestModel.HealthData, false);
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "An error occurred while importing health connect data.");
            }
        }

        private async Task ImportData(List<HealthConnectDataExport> dataExportModels, bool triggerScheduler = false)
        {

            if (dataExportModels.Count == 0)
            {
                return;
            }

            var userId = _currentUserService.UserId;

            if (!dataExportModels.Any())
            {
                return;
            }

            var existingDataEntries = await _applicationUnitOfWork
                .HealthConnectDataRepository
                .GetAsync(new DbQueryOptions<HealthConnectDataEntity>
                {
                    AsNoTracking = true,
                    WhereExpression = entity => entity.UserId == userId
                });

            var knownKeys = new HashSet<string>(StringComparer.Ordinal);

            foreach (var existingDataEntry in existingDataEntries)
            {
                knownKeys.Add(existingDataEntry.RecordId);
            }

            var entitiesToPersist = new List<HealthConnectDataEntity>();
            var skippedEntries = 0;

            foreach (var dataExportModel in dataExportModels)
            {
                var dataToImport = dataExportModel.Data;

                foreach (var entry in dataToImport)
                {
                    if (!knownKeys.Add(entry.RecordId))
                    {
                        skippedEntries++;
                        continue;
                    }

                    entitiesToPersist.Add(new HealthConnectDataEntity
                    {
                        ExerciseId = entry.ExerciseId,
                        RecordId = entry.RecordId,
                        Origin = entry.Origin,
                        UserId = userId,
                        Type = entry.Type,
                        Unit = entry.Unit,
                        ExerciseType = entry.ExerciseType,
                        Value = entry.Value,
                        StartTimestamp = entry.StartTimestamp,
                        EndTimestamp = entry.EndTimestamp
                    });
                }
            }

            if (entitiesToPersist.Count == 0)
            {
                _logger.LogInformation(
                    "Health data import skipped all {SkippedEntries} entries because duplicates already exist for user {UserId}.",
                    skippedEntries,
                    userId);
                return;
            }

            await _applicationUnitOfWork
                .HealthConnectDataRepository
                .AddRangeAsync(entitiesToPersist);

            var addedRows = await _applicationUnitOfWork.SaveChangesAsync();

            if (addedRows > 0 && triggerScheduler)
            {
                await _scheduledJobService.AddJobAsync(
                    HealthConnectTrainingJobName,
                    HealthConnectTrainingJobDescription,
                    new WebServiceModel
                    {
                        Url = new Uri(HealthConnectTrainingJobUrl, UriKind.Relative),
                    });
            }

            _logger.LogInformation(
                "Health data import persisted {ImportedEntries} entries and skipped {SkippedEntries} duplicates for user {UserId}.",
                entitiesToPersist.Count,
                skippedEntries,
                userId);


        }
    }
}

