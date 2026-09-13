using Logic.Ai.Interfaces;
using Logic.Ai.Models;
using Microsoft.ML;
using Microsoft.ML.Data;
using Shared.Enums.Ai;
using Shared.Models.Ai.InputModels;

namespace Logic.Ai.Prediction
{
    public class TrainingIntensityPredictor : IWorkoutIntensityPredictor
    {
        private readonly IAiModelVersionStorageService _modelVersionStorageService;

        public TrainingIntensityPredictor(IAiModelVersionStorageService modelVersionStorageService)
        {
            _modelVersionStorageService = modelVersionStorageService;
        }

        public async Task<WorkoutIntensityEnum?> PredictAsync(WorkoutIntensityMlInputModel input, string? modelVersion, CancellationToken cancellationToken = default)
        {
            if (!TryToModelRow(input, out var row))
            {
                return null;
            }

            var modelData = await _modelVersionStorageService.GetModelDataAsync(AiModelTypeEnum.WorkoutIntensity, modelVersion, cancellationToken);

            return modelData == null ? null : Predict(modelData, row);
        }

        private static WorkoutIntensityEnum? Predict(byte[] modelData, WorkoutIntensityModelRow row)
        {
            var mlContext = new MLContext();

            using var stream = new MemoryStream(modelData);
            var model = mlContext.Model.Load(stream, out _);

            using var predictionEngine = mlContext.Model.CreatePredictionEngine<WorkoutIntensityModelRow, WorkoutIntensityModelPrediction>(model);
            var prediction = predictionEngine.Predict(row);

            return Enum.TryParse<WorkoutIntensityEnum>(prediction.PredictedLabel, ignoreCase: true, out var value)
                ? value
                : null;
        }

        // Elevation/MinHeartRate/Power are nullable on the request DTO (e.g. missing sensor data)
        // but required for prediction - PaceSeconds/AverageHeartRate/MaxHeartRate are never null.
        private static bool TryToModelRow(WorkoutIntensityMlInputModel input, out WorkoutIntensityModelRow row)
        {
            row = null!;

            if (!input.Elevation.HasValue || !input.MinHeartRate.HasValue || !input.Power.HasValue)
            {
                return false;
            }

            row = new WorkoutIntensityModelRow
            {
                Elevation = input.Elevation.Value,
                PaceSeconds = input.PaceSeconds,
                AverageHeartRate = input.AverageHeartRate,
                MinHeartRate = input.MinHeartRate.Value,
                MaxHeartRate = input.MaxHeartRate,
                Power = input.Power.Value,
            };

            return true;
        }

        private sealed class WorkoutIntensityModelPrediction
        {
            [ColumnName("PredictedLabel")]
            public string PredictedLabel { get; set; } = string.Empty;
        }
    }
}
