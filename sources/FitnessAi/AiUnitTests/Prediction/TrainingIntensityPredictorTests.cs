using Logic.Ai.ColumnDefinitions;
using Logic.Ai.Csv;
using Logic.Ai.Interfaces;
using Logic.Ai.ModelMapper;
using Logic.Ai.Models;
using Logic.Ai.Prediction;
using Logic.Ai.Training;
using Microsoft.Extensions.Logging.Abstractions;
using Shared.Enums.Ai;
using Shared.Models.Ai;
using Shared.Models.Ai.InputModels;

namespace AiUnitTests.Prediction
{
    public class TrainingIntensityPredictorTests
    {
        [Fact]
        public async Task PredictAsync_ReturnsNull_WhenRequiredFeatureIsMissing()
        {
            var predictor = new TrainingIntensityPredictor(new FakeAiModelVersionStorageService(modelData: [1, 2, 3]));
            var input = BuildValidInput();
            input.Elevation = null;

            var result = await predictor.PredictAsync(input, modelVersion: null);

            Assert.Null(result);
        }

        [Fact]
        public async Task PredictAsync_ReturnsNull_WhenNoTrainedModelExists()
        {
            var predictor = new TrainingIntensityPredictor(new FakeAiModelVersionStorageService(modelData: null));

            var result = await predictor.PredictAsync(BuildValidInput(), modelVersion: null);

            Assert.Null(result);
        }

        [Fact]
        public async Task PredictAsync_ReturnsAPredictedLabel_WhenModelAndInputAreValid()
        {
            var modelData = TrainRealModel();
            var predictor = new TrainingIntensityPredictor(new FakeAiModelVersionStorageService(modelData));

            var result = await predictor.PredictAsync(BuildValidInput(), modelVersion: null);

            Assert.NotNull(result);
            Assert.NotEqual(WorkoutIntensityEnum.Unknown, result);
        }

        private static WorkoutIntensityMlInputModel BuildValidInput()
        {
            return new WorkoutIntensityMlInputModel
            {
                Elevation = 20,
                PaceSeconds = 210,
                AverageHeartRate = 130,
                MinHeartRate = 120,
                MaxHeartRate = 140,
                Power = 190,
            };
        }

        private static byte[] TrainRealModel()
        {
            var columnDefinitionFactory = new ColumnDefinitionFactory();
            var rowMapper = new WorkoutIntensityCsvRowMapper();
            var csvModelCreator = new CsvModelCreator<WorkOutIntensityCsvModel>(columnDefinitionFactory, rowMapper);
            var csvModelLoader = new CsvModelLoader<WorkOutIntensityCsvModel>(
                columnDefinitionFactory, rowMapper, NullLogger<CsvModelLoader<WorkOutIntensityCsvModel>>.Instance);

            var csv = csvModelCreator.Create(AiModelTypeEnum.WorkoutIntensity, BuildTrainingRows());
            var trainer = new TrainingIntensityAiModelTrainer(csvModelLoader);
            var result = trainer.Train(csv);

            return result!.ModelData;
        }

        // Cycles through Easy/Medium/Hard with heart-rate/power scaled by label, matching
        // TrainingIntensityAiModelTrainerTests' synthetic dataset shape.
        private static List<WorkOutIntensityCsvModel> BuildTrainingRows()
        {
            var labels = new[] { "Easy", "Medium", "Hard" };
            var rows = new List<WorkOutIntensityCsvModel>();

            for (var i = 0; i < 30; i++)
            {
                var labelIndex = i % labels.Length;
                var baseHeartRate = 100 + labelIndex * 30;

                rows.Add(new WorkOutIntensityCsvModel
                {
                    DataKey = $"key-{i}",
                    UserId = "1",
                    Elevation = (10 + labelIndex * 5).ToString(),
                    Pace = $"0{4 - labelIndex}:00",
                    AverageHeartRate = baseHeartRate.ToString(),
                    MinHeartRate = (baseHeartRate - 10).ToString(),
                    MaxHeartRate = (baseHeartRate + 10).ToString(),
                    Power = (150 + labelIndex * 40).ToString(),
                    PredictedAt = null,
                    Label = labels[labelIndex],
                });
            }

            return rows;
        }

        private sealed class FakeAiModelVersionStorageService : IAiModelVersionStorageService
        {
            private readonly byte[]? _modelData;

            public FakeAiModelVersionStorageService(byte[]? modelData)
            {
                _modelData = modelData;
            }

            public Task<TrainedAiModelMetrics?> GetLatestModelMetricsAsync(AiModelTypeEnum aiType, CancellationToken cancellationToken = default) =>
                throw new NotImplementedException();

            public Task<byte[]?> GetModelDataAsync(AiModelTypeEnum aiType, string? modelVersion, CancellationToken cancellationToken = default) =>
                Task.FromResult(_modelData);

            public Task SaveNewModelVersionAsync(AiModelTypeEnum aiType, AiModelTrainingResult result, CancellationToken cancellationToken = default) =>
                throw new NotImplementedException();
        }
    }
}
