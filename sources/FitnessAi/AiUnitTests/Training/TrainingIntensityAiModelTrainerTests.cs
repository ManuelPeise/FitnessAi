using Logic.Ai.ColumnDefinitions;
using Logic.Ai.Csv;
using Logic.Ai.ModelMapper;
using Logic.Ai.Models;
using Logic.Ai.Training;
using Microsoft.Extensions.Logging.Abstractions;
using Shared.Enums.Ai;

namespace AiUnitTests.Training
{
    public class TrainingIntensityAiModelTrainerTests
    {
        [Fact]
        public void Train_ReturnsNull_WhenLabeledRowCountBelowMinimum()
        {
            var trainer = CreateTrainer();
            var csv = BuildCsv(BuildRows(rowCount: 5));

            var result = trainer.Train(csv);

            Assert.Null(result);
        }

        [Fact]
        public void Train_ReturnsResultWithValidMetrics_WhenEnoughLabeledDataIsProvided()
        {
            var trainer = CreateTrainer();
            var csv = BuildCsv(BuildRows(rowCount: 30));

            var result = trainer.Train(csv);

            Assert.NotNull(result);
            Assert.NotEmpty(result.ModelData);
            Assert.InRange(result.MicroAccuracy, 0, 1);
            Assert.InRange(result.MacroAccuracy, 0, 1);
            Assert.True(result.LogLoss >= 0);
        }

        private static TrainingIntensityAiModelTrainer CreateTrainer()
        {
            var columnDefinitionFactory = new ColumnDefinitionFactory();
            var rowMapper = new WorkoutIntensityCsvRowMapper();
            var csvModelLoader = new CsvModelLoader<WorkOutIntensityCsvModel>(
                columnDefinitionFactory, rowMapper, NullLogger<CsvModelLoader<WorkOutIntensityCsvModel>>.Instance);

            return new TrainingIntensityAiModelTrainer(csvModelLoader);
        }

        private static byte[] BuildCsv(IReadOnlyCollection<WorkOutIntensityCsvModel> rows)
        {
            var columnDefinitionFactory = new ColumnDefinitionFactory();
            var rowMapper = new WorkoutIntensityCsvRowMapper();
            var csvModelCreator = new CsvModelCreator<WorkOutIntensityCsvModel>(columnDefinitionFactory, rowMapper);

            return csvModelCreator.Create(AiModelTypeEnum.WorkoutIntensity, rows);
        }

        // Cycles through Easy/Medium/High with heart-rate/power scaled by label, so the dataset
        // has more than one class and isn't degenerate for cross-validation.
        private static List<WorkOutIntensityCsvModel> BuildRows(int rowCount)
        {
            var labels = new[] { "Easy", "Medium", "High" };
            var rows = new List<WorkOutIntensityCsvModel>();

            for (var i = 0; i < rowCount; i++)
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
    }
}
