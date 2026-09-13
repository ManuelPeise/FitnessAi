using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.HealthConnect;
using Logic.Ai.Interfaces;
using Logic.Ai.Models;
using Microsoft.Extensions.Logging;
using Shared.Enums.Ai;
using System.Globalization;
using System.Linq.Expressions;

namespace Logic.Ai.Services
{
    public class AiWorkOutIntensityTrainingFileService : IAiWorkOutIntensityTrainingFileService
    {
        private readonly IHealthUnitOfWork _healthUnitOfWork;
        private readonly IWorkoutIntensityTrainingDataMapper _trainingDataMapper;
        private readonly ICsvModelCreator<WorkOutIntensityCsvModel> _csvModelCreator;
        private readonly ICsvModelLoader<WorkOutIntensityCsvModel> _csvModelLoader;
        private readonly IAiTrainingDataFileService _aiTrainingDataFileService;
        private readonly ILogger<AiWorkOutIntensityTrainingFileService> _logger;

        public AiWorkOutIntensityTrainingFileService(
            IHealthUnitOfWork healthUnitOfWork,
            IWorkoutIntensityTrainingDataMapper trainingDataMapper,
            ICsvModelCreator<WorkOutIntensityCsvModel> csvModelCreator,
            ICsvModelLoader<WorkOutIntensityCsvModel> csvModelLoader,
            IAiTrainingDataFileService aiTrainingDataFileService,
            ILogger<AiWorkOutIntensityTrainingFileService> logger)
        {
            _healthUnitOfWork = healthUnitOfWork;
            _trainingDataMapper = trainingDataMapper;
            _csvModelCreator = csvModelCreator;
            _csvModelLoader = csvModelLoader;
            _aiTrainingDataFileService = aiTrainingDataFileService;
            _logger = logger;
        }

        public async Task<byte[]> LoadInitialWorkOutIntensityTrainingCsvAsync(int itemsCount, CancellationToken cancellationToken = default)
        {
            if (itemsCount <= 0)
            {
                throw new ArgumentException("Items count must be greater than zero.", nameof(itemsCount));
            }

            try
            {
                var existingModels = await LoadExistingCsvModelsAsync(cancellationToken);

                var entities = await LoadUnpredictedTrainingDataAsync(cancellationToken);
                var freshModels = MapToModels(entities.Take(itemsCount).ToList());

                // A labeled existing row must never be discarded in favor of an unlabeled fresh one.
                var mergedModels = MergeByDataKey(existingModels, freshModels, existing => existing.Label == null);

                _logger.LogInformation(
                    "Loaded initial WorkoutIntensity CSV with {MergedCount} row(s) ({ExistingCount} existing, {FreshCount} fresh).",
                    mergedModels.Count, existingModels.Count, freshModels.Count);

                return _csvModelCreator.Create(AiModelTypeEnum.WorkoutIntensity, mergedModels);
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "An error occurred while loading the initial WorkoutIntensity training CSV.");
                throw;
            }
        }

        // Merges two model collections keyed by DataKey (guaranteeing no duplicate DataKeys in the
        // result) - an overlay row replaces a base row only when there's no base row for that
        // DataKey yet, or shouldReplace(baseRow) says the base row may be discarded.
        private static List<WorkOutIntensityCsvModel> MergeByDataKey(
            IReadOnlyCollection<WorkOutIntensityCsvModel> baseModels,
            IReadOnlyCollection<WorkOutIntensityCsvModel> overlayModels,
            Func<WorkOutIntensityCsvModel, bool> shouldReplace)
        {
            var mergedByDataKey = baseModels
                .Where(model => model.DataKey != null)
                .ToDictionary(model => model.DataKey!);

            foreach (var overlayModel in overlayModels)
            {
                if (overlayModel.DataKey == null)
                {
                    continue;
                }

                if (!mergedByDataKey.TryGetValue(overlayModel.DataKey, out var baseModel) || shouldReplace(baseModel))
                {
                    mergedByDataKey[overlayModel.DataKey] = overlayModel;
                }
            }

            return mergedByDataKey.Values.ToList();
        }

        public async Task<byte[]?> GetExistingWorkOutIntensityCsvAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                return await _aiTrainingDataFileService.GetCsvAsync(AiModelTypeEnum.WorkoutIntensity, cancellationToken);
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "An error occurred while retrieving the existing WorkoutIntensity CSV.");
                throw;
            }
        }

        public async Task UpdatedWorkOutIntensityTrainingCsvDataAsync(byte[] csvData, CancellationToken cancellationToken = default)
        {
            ArgumentNullException.ThrowIfNull(csvData);

            if (csvData.Length == 0)
            {
                throw new ArgumentException("CSV data cannot be empty.", nameof(csvData));
            }

            try
            {
                await ApplyUploadedCsvAsync(csvData, cancellationToken);
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "An error occurred while updating WorkoutIntensity CSV data.");
                throw;
            }
        }

        private async Task ApplyUploadedCsvAsync(byte[] csvData, CancellationToken cancellationToken)
        {
            var existingDataKeys = await LoadExistingDataKeysAsync(cancellationToken);
            var models = _csvModelLoader.Load(AiModelTypeEnum.WorkoutIntensity, csvData);
            var labeledModels = models.Where(model => model.DataKey != null && model.Label != null);

            var updatedModels = ApplyPredictions(labeledModels, existingDataKeys);

            _logger.LogInformation(
                "Updated WorkoutIntensity on {UpdatedCount} of {ModelCount} CSV rows.", updatedModels.Count, models.Count);

            if (updatedModels.Count > 0)
            {
                await PersistRefreshedCsvAsync(updatedModels, cancellationToken);
            }
        }

        // Merges the just-updated (labeled) rows into whatever is already stored, rather than
        // overwriting the whole file with only the updated subset. The updated rows are used
        // as-is (they already carry Label/PredictedAt from the upload) - never re-derived from
        // the entity, which would discard the label again.
        private async Task PersistRefreshedCsvAsync(IReadOnlyCollection<WorkOutIntensityCsvModel> updatedModels, CancellationToken cancellationToken)
        {
            var mergedModels = await MergeWithExistingCsvAsync(updatedModels, cancellationToken);

            _logger.LogInformation(
                "Persisting WorkoutIntensity CSV with {MergedCount} total row(s) ({UpdatedCount} updated).",
                mergedModels.Count, updatedModels.Count);

            var refreshedCsv = _csvModelCreator.Create(AiModelTypeEnum.WorkoutIntensity, mergedModels);
            await _aiTrainingDataFileService.UploadCsvAsync(AiModelTypeEnum.WorkoutIntensity, refreshedCsv, cancellationToken);
        }

        private async Task<List<WorkOutIntensityCsvModel>> MergeWithExistingCsvAsync(
            IReadOnlyCollection<WorkOutIntensityCsvModel> updatedModels, CancellationToken cancellationToken)
        {
            var existingModels = await LoadExistingCsvModelsAsync(cancellationToken);

            // Updated (just-predicted) rows always win over whatever was stored before.
            return MergeByDataKey(existingModels, updatedModels, _ => true);
        }

        private async Task<HashSet<WorkOutIntensityCsvModel>> LoadExistingCsvModelsAsync(CancellationToken cancellationToken)
        {
            var existingCsv = await _aiTrainingDataFileService.GetCsvAsync(AiModelTypeEnum.WorkoutIntensity, cancellationToken);

            return existingCsv == null
                ? []
                : _csvModelLoader.Load(AiModelTypeEnum.WorkoutIntensity, existingCsv);
        }

        // Validates that each labeled row still matches an entity in HealthConnectTrainingDataTable
        // and stamps PredictedAt once for the whole batch - it never mutates or persists to that
        // table. This flow is only ever allowed to affect the stored CSV in AiTrainingDataFileTable.
        private List<WorkOutIntensityCsvModel> ApplyPredictions(
            IEnumerable<WorkOutIntensityCsvModel> labeledModels, HashSet<string> existingDataKeys)
        {
            var updatedModels = new List<WorkOutIntensityCsvModel>();
            var predictedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture);

            foreach (var model in labeledModels)
            {
                if (!existingDataKeys.Contains(model.DataKey!))
                {
                    _logger.LogWarning("No training data entity found for DataKey {DataKey}.", model.DataKey);
                    continue;
                }

                updatedModels.Add(model with { PredictedAt = predictedAt });
            }

            return updatedModels;
        }

        // Only the DataKey is needed to validate an uploaded row - no Includes, unlike
        // LoadUnpredictedTrainingDataAsync, and AsNoTracking since this flow must never persist
        // changes to HealthConnectTrainingDataTable.
        private async Task<HashSet<string>> LoadExistingDataKeysAsync(CancellationToken cancellationToken)
        {
            var entities = await _healthUnitOfWork.HealthConnectTrainingDataRepository.GetAsync(new DbQueryOptions<HealthConnectTrainingDataEntity>
            {
                AsNoTracking = true,
                WhereExpression = x => x.AllowedForAiTraining,
            }, cancellationToken);

            return entities.Select(entity => entity.DataKey).ToHashSet();
        }

        private async Task<IReadOnlyList<HealthConnectTrainingDataEntity>> LoadUnpredictedTrainingDataAsync(CancellationToken cancellationToken)
        {
            return await _healthUnitOfWork.HealthConnectTrainingDataRepository.GetAsync(new DbQueryOptions<HealthConnectTrainingDataEntity>
            {
                AsNoTracking = true,
                WhereExpression = x => x.AllowedForAiTraining && x.WorkoutIntensity == null,
                OrderByExpression = x => x.Id,
                Includes = TrainingDataValuesIncludes,
            }, cancellationToken);
        }

        // MapFromTrainingData requires HeartRate/Power to be eager-loaded (it now returns null
        // when either is missing) - without these, every row would be silently dropped.
        private static List<Expression<Func<HealthConnectTrainingDataEntity, object>>> TrainingDataValuesIncludes =>
        [
            x => x.HealthConnectTrainingDataValues,
            x => x.HealthConnectTrainingDataValues.HeartRate!,
            x => x.HealthConnectTrainingDataValues.Power!,
        ];

        private HashSet<WorkOutIntensityCsvModel> MapToModels(IReadOnlyList<HealthConnectTrainingDataEntity> entities)
        {
            var models = new HashSet<WorkOutIntensityCsvModel>();

            foreach (var entity in entities)
            {
                var model = _trainingDataMapper.MapFromTrainingData(entity);

                if (model != null)
                {
                    models.Add(model);
                }
            }

            return models;
        }
    }
}
