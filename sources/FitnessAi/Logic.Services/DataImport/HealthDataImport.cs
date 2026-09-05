using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.HealthConnect;
using Logic.Services.Interfaces;
using Logic.Shared.Interfaces;
using Microsoft.Extensions.Logging;
using Shared.Models.HealthConnect;

namespace Logic.Services.DataImport
{
    public class HealthDataImport : IHealthDataImport
    {
        private readonly ILogger<HealthDataImport> _logger;
        private readonly IApplicationUnitOfWork _applicationUnitOfWork;
        private readonly ICurrentUserService _currentUserService;

        public HealthDataImport(
            ILogger<HealthDataImport> logger,
            IApplicationUnitOfWork applicationUnitOfWork,
            ICurrentUserService currentUserService)
        {
            _logger = logger;
            _applicationUnitOfWork = applicationUnitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task ImportHealthData(List<HealthConnectDataExport> dataExportModels)
        {
            try
            {
                if (dataExportModels.Count == 0)
                {
                    return;
                }

                var userId = _currentUserService.UserId;
                var importedEntryDictionary = dataExportModels
                    .ToDictionary(x => x.MetaData.Origin, x => x.Data);

                if (!importedEntryDictionary.Any())
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
                    knownKeys.Add(BuildEntityKey(existingDataEntry));
                }

                var entitiesToPersist = new List<HealthConnectDataEntity>();
                var skippedEntries = 0;

                foreach (var key in importedEntryDictionary.Keys)
                {
                    var importedEntry = importedEntryDictionary[key];

                    foreach (var entry in importedEntry)
                    {
                        var modelKey = BuildModelKey(entry);

                        if (!knownKeys.Add(modelKey))
                        {
                            skippedEntries++;
                            continue;
                        }

                        entitiesToPersist.Add(new HealthConnectDataEntity
                        {
                            UserId = userId,
                            Source = key,
                            Type = entry.Type,
                            Unit = entry.Unit,
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

                await _applicationUnitOfWork.SaveChangesAsync();

                _logger.LogInformation(
                    "Health data import persisted {ImportedEntries} entries and skipped {SkippedEntries} duplicates for user {UserId}.",
                    entitiesToPersist.Count,
                    skippedEntries,
                    userId);

            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "An error occurred while importing health data");
            }
        }

        static string BuildEntityKey(HealthConnectDataEntity entity)
        {
            return $"{entity.Type}|{entity.StartTimestamp}|{entity.EndTimestamp}";
        }

        static string BuildModelKey(HealthConnectDataEntry model)
        {
            return $"{model.Type}|{model.StartTimestamp}|{model.EndTimestamp}";
        }
    }
}
