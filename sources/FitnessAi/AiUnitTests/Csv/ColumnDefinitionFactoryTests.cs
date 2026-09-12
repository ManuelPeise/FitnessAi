using AiUnitTests.Csv.Fakes;
using Logic.Ai.Csv;
using Shared.Enums.Ai;

namespace AiUnitTests.Csv
{
    public class ColumnDefinitionFactoryTests
    {
        [Fact]
        public void GetColumnDefinition_ReturnsRegisteredDefinition_WhenAiTypeIsRegistered()
        {
            var definitions = new Dictionary<AiModelTypeEnum, IReadOnlyDictionary<string, int>>
            {
                [AiModelTypeEnum.Global] = FakeCsvRowMapper.ColumnDefinition,
            };
            var factory = new ColumnDefinitionFactory(definitions);

            var result = factory.GetColumnDefinition(AiModelTypeEnum.Global);

            Assert.Same(FakeCsvRowMapper.ColumnDefinition, result);
        }

        [Fact]
        public void GetColumnDefinition_Throws_WhenAiTypeIsNotRegistered()
        {
            var definitions = new Dictionary<AiModelTypeEnum, IReadOnlyDictionary<string, int>>();
            var factory = new ColumnDefinitionFactory(definitions);

            Assert.Throws<InvalidOperationException>(() => factory.GetColumnDefinition(AiModelTypeEnum.WorkoutIntensity));
        }
    }
}
