using Logic.Ai.Training.WorkoutIntensity;
using Logic.Ai.Training.WorkoutIntensity.Models;
using Microsoft.ML;

namespace AiUnitTests.WorkoutIntensity
{
    public class WorkoutIntensityMlModelBuilderTests
    {
        [Theory]
        [InlineData(105f, "Easy")]
        [InlineData(150f, "Medium")]
        [InlineData(180f, "Hard")]
        public void Train_PredictsExpectedLabel_ForClearlySeparableData(float averageHeartRate, string expectedLabel)
        {
            var mlContext = new MLContext(seed: 1);
            var trainingData = BuildSyntheticTrainingData();
            var builder = new WorkoutIntensityMlModelBuilder();

            var transformer = builder.Train(mlContext, trainingData, out _);
            var predictionEngine = mlContext.Model.CreatePredictionEngine<WorkoutIntensityMlInput, WorkoutIntensityMlPrediction>(transformer);

            var prediction = predictionEngine.Predict(new WorkoutIntensityMlInput
            {
                Elevation = 10f,
                Pace = 300f,
                AverageHeartRate = averageHeartRate,
                UserId = "1",
                ExerciseType = "Running",
            });

            Assert.Equal(expectedLabel, prediction.PredictedLabel);
        }

        private static List<WorkoutIntensityMlInput> BuildSyntheticTrainingData()
        {
            var data = new List<WorkoutIntensityMlInput>();

            AddSamples(data, "Easy", heartRateStart: 95, count: 10);
            AddSamples(data, "Medium", heartRateStart: 145, count: 10);
            AddSamples(data, "Hard", heartRateStart: 175, count: 10);

            return data;
        }

        private static void AddSamples(List<WorkoutIntensityMlInput> data, string label, float heartRateStart, int count)
        {
            for (var i = 0; i < count; i++)
            {
                data.Add(new WorkoutIntensityMlInput
                {
                    Elevation = 10f + i,
                    Pace = 300f + i,
                    AverageHeartRate = heartRateStart + i,
                    UserId = "1",
                    ExerciseType = "Running",
                    Label = label,
                });
            }
        }
    }
}
