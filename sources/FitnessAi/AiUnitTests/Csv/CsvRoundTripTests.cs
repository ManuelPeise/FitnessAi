using AiUnitTests.Csv.Fakes;
using Logic.Ai.Csv;
using Microsoft.Extensions.Logging.Abstractions;
using Shared.Enums.Ai;

namespace AiUnitTests.Csv
{
    public class CsvRoundTripTests
    {
        [Fact]
        public void CreateThenLoad_ReturnsEquivalentSet()
        {
            var definitions = new Dictionary<AiModelTypeEnum, IReadOnlyDictionary<string, int>>
            {
                [AiModelTypeEnum.Global] = FakeCsvRowMapper.ColumnDefinition,
            };
            var factory = new ColumnDefinitionFactory(definitions);
            var mapper = new FakeCsvRowMapper();
            var creator = new CsvModelCreator<FakeCsvModel>(factory, mapper);
            var loader = new CsvModelLoader<FakeCsvModel>(factory, mapper, NullLogger<CsvModelLoader<FakeCsvModel>>.Instance);

            var original = new HashSet<FakeCsvModel>
            {
                new("Hello", "World"),
                new("Foo", "Bar"),
            };

            var csv = creator.Create(AiModelTypeEnum.Global, original);
            var result = loader.Load(AiModelTypeEnum.Global, csv);

            Assert.True(original.SetEquals(result));
        }
    }
}
