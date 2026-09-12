using Data.Database.Entities.Ai;
using Data.Database.Entities.HealthConnect;
using Logic.Ai.Training.WorkoutIntensity;
using Shared.Enums.Ai;

namespace AiUnitTests.WorkoutIntensity
{
    public class WorkoutIntensityLabelGeneratorTests
    {
        [Fact]
        public void ComputeLabel_ReturnsEasy_WhenAverageMaxHeartRateBelowThreshold()
        {
            var group = CreateGroup(130, 132, 128, 135, 140);

            var label = WorkoutIntensityLabelGenerator.ComputeLabel(group);

            Assert.Equal(WorkoutIntensityEnum.Easy, label);
        }

        [Fact]
        public void ComputeLabel_ReturnsMedium_AtLowerBoundary()
        {
            var group = CreateGroup(141, 141, 141, 141, 141);

            var label = WorkoutIntensityLabelGenerator.ComputeLabel(group);

            Assert.Equal(WorkoutIntensityEnum.Medium, label);
        }

        [Fact]
        public void ComputeLabel_ReturnsMedium_AtUpperBoundary()
        {
            var group = CreateGroup(159, 159, 159, 159, 159);

            var label = WorkoutIntensityLabelGenerator.ComputeLabel(group);

            Assert.Equal(WorkoutIntensityEnum.Medium, label);
        }

        [Fact]
        public void ComputeLabel_ReturnsHard_AboveThreshold()
        {
            var group = CreateGroup(160, 165, 170, 162, 168);

            var label = WorkoutIntensityLabelGenerator.ComputeLabel(group);

            Assert.Equal(WorkoutIntensityEnum.Hard, label);
        }

        [Fact]
        public void ComputeLabel_ReturnsUnknown_WhenSampleSizeInsufficient()
        {
            var group = CreateGroup(170, 175);

            var label = WorkoutIntensityLabelGenerator.ComputeLabel(group);

            Assert.Equal(WorkoutIntensityEnum.Unknown, label);
        }

        [Fact]
        public void ComputeLabel_ReturnsUnknown_WhenNoHeartRateDataAvailable()
        {
            var group = new List<HealthConnectAiTrainingDataEntity>
            {
                new() { UserId = 1, HeartRate = null },
                new() { UserId = 1, HeartRate = null },
            };

            var label = WorkoutIntensityLabelGenerator.ComputeLabel(group);

            Assert.Equal(WorkoutIntensityEnum.Unknown, label);
        }

        private static List<HealthConnectAiTrainingDataEntity> CreateGroup(params decimal[] maxHeartRates)
        {
            return maxHeartRates
                .Select(max => new HealthConnectAiTrainingDataEntity
                {
                    UserId = 1,
                    HeartRate = new HealthConnectAvgEntity { Max = max },
                })
                .ToList();
        }
    }
}
