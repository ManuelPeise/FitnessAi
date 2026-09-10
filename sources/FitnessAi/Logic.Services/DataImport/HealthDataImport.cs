using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.HealthConnect;
using Data.Database.Models.Scheduler;
using Logic.Services.Interfaces;
using Logic.Shared.Interfaces;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Shared.Enums.HealthConnect;
using Shared.Models.HealthConnect;

namespace Logic.Services.DataImport
{
    public class HealthDataImport : IHealthDataImport
    {
        private const string HealthConnectTrainingJobName = "Ai Health Connect Training Data Job";
        private const string HealthConnectTrainingJobDescription = "Train the Ai model with the imported health data.";
        private const string HealthConnectTrainingJobUrl = "AiTrainingDataGeneration/GenerateAiTrainingData";
        private readonly ILogger<HealthDataImport> _logger;
        private readonly IHealthUnitOfWork _healthUnitOfWork;
        private readonly IScheduledJobService _scheduledJobService;
        private readonly ICurrentUserService _currentUserService;

        public HealthDataImport(
            ILogger<HealthDataImport> logger,
            IHealthUnitOfWork healthUnitOfWork,
            IScheduledJobService scheduledJobService,
            ICurrentUserService currentUserService)
        {
            _logger = logger;
            _healthUnitOfWork = healthUnitOfWork;
            _scheduledJobService = scheduledJobService;
            _currentUserService = currentUserService;
        }

        public async Task ImportHealthConnectData(List<HealthConnectMetricApiMetric> metrics)
        {
            try
            {
                await ImportData(metrics);

            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "An error occurred while importing health connect data.");
            }
        }

        private async Task ImportData(List<HealthConnectMetricApiMetric> metrics)
        {

            if (!metrics.Any())
            {
                return;
            }

            var userId = _currentUserService.UserId;
            var healthConnectRecordData = new List<HealthConnectMetricResult>();

            foreach (var metric in metrics)
            {
                if (string.IsNullOrWhiteSpace(metric.DataJson))
                {
                    _logger.LogWarning(
                        "Health data import skipped metric of type {MetricType} from origin {Origin} because the DataJson is null or empty for user {UserId}.",
                        metric.MetricType,
                        metric.Origin,
                        userId);
                    continue;
                }

                var healthDataRecords = HealthConnectParsingFactory.ParseMetric(metric.MetricType, metric.DataJson);

                if (healthDataRecords == null)
                {
                    _logger.LogWarning(
                        "Health data import skipped metric of type {MetricType} from origin {Origin} because the DataJson could not be deserialized for user {UserId}.",
                        metric.MetricType,
                        metric.Origin,
                        userId);
                    continue;
                }

                healthConnectRecordData.AddRange(healthDataRecords);
            }

            var metricProcessor = new MetricProcessor(_logger);
            var healthConnectMetricEntities = new List<HealthConnectRecordEntity>();

            foreach (var model in healthConnectRecordData)
            {
                var entities = metricProcessor.ProcessMetric(model, userId);

                healthConnectMetricEntities.AddRange(entities);
            }

            healthConnectMetricEntities = await FilterDuplicateRecordsAsync(userId, healthConnectMetricEntities);

            if (healthConnectMetricEntities.Any())
            {
                await _healthUnitOfWork.HealthConnectRecordRepository.AddRangeAsync(healthConnectMetricEntities);
                await _healthUnitOfWork.SaveChangesAsync();
              
                await _scheduledJobService.AddJobAsync(HealthConnectTrainingJobName, HealthConnectTrainingJobDescription, new WebServiceModel
                {
                    Url = new Uri(HealthConnectTrainingJobUrl, UriKind.Relative),
                });
            }

            var json = JsonConvert.SerializeObject(healthConnectRecordData);

        }

        private async Task<List<HealthConnectRecordEntity>> FilterDuplicateRecordsAsync(
            long userId,
            List<HealthConnectRecordEntity> entities)
        {
            // Records without a client record id cannot be reliably deduplicated, so keep them as is.
            var identifiableRecords = entities
                .Where(entity => !string.IsNullOrWhiteSpace(entity.ClientRecordId))
                .ToList();

            var nonIdentifiableRecords = entities
                .Where(entity => string.IsNullOrWhiteSpace(entity.ClientRecordId))
                .ToList();

            // Remove duplicates within the current batch, keeping the first occurrence per client record id.
            var deduplicatedRecords = identifiableRecords
                .GroupBy(entity => entity.ClientRecordId)
                .Select(group => group.First())
                .ToList();

            var clientRecordIds = deduplicatedRecords
                .Select(entity => entity.ClientRecordId)
                .ToList();

            if (clientRecordIds.Count > 0)
            {
                // Remove records that were already imported previously for the same user.
                var existingRecords = await _healthUnitOfWork.HealthConnectRecordRepository.GetAsync(
                    new DbQueryOptions<HealthConnectRecordEntity>
                    {
                        AsNoTracking = true,
                        WhereExpression = record =>
                            record.UserId == userId
                            && clientRecordIds.Contains(record.ClientRecordId)
                    });

                var existingClientRecordIds = existingRecords
                    .Select(record => record.ClientRecordId)
                    .ToHashSet();

                deduplicatedRecords = deduplicatedRecords
                    .Where(entity => !existingClientRecordIds.Contains(entity.ClientRecordId))
                    .ToList();
            }

            return deduplicatedRecords
                .Concat(nonIdentifiableRecords)
                .ToList();
        }
    }
}
