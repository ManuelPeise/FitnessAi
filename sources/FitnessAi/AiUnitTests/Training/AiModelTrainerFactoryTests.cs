using Logic.Ai.Interfaces;
using Logic.Ai.Models;
using Logic.Ai.Training;
using Shared.Enums.Ai;

namespace AiUnitTests.Training
{
    public class AiModelTrainerFactoryTests
    {
        [Fact]
        public void GetTrainer_ReturnsRegisteredTrainer_WhenAiTypeIsRegistered()
        {
            var trainer = new FakeAiModelTrainer(AiModelTypeEnum.WorkoutIntensity);
            var factory = new AiModelTrainerFactory([trainer]);

            var result = factory.GetTrainer(AiModelTypeEnum.WorkoutIntensity);

            Assert.Same(trainer, result);
        }

        [Fact]
        public void GetTrainer_Throws_WhenAiTypeIsNotRegistered()
        {
            var factory = new AiModelTrainerFactory([]);

            Assert.Throws<InvalidOperationException>(() => factory.GetTrainer(AiModelTypeEnum.WorkoutIntensity));
        }

        private sealed class FakeAiModelTrainer : IAiModelTrainer
        {
            public AiModelTypeEnum AiType { get; }

            public FakeAiModelTrainer(AiModelTypeEnum aiType)
            {
                AiType = aiType;
            }

            public AiModelTrainingResult? Train(byte[] csvData) => null;
        }
    }
}
