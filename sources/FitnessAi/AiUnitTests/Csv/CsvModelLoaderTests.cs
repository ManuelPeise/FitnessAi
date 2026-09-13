using AiUnitTests.Csv.Fakes;
using Logic.Ai.ColumnDefinitions;
using Logic.Ai.Csv;
using Microsoft.Extensions.Logging.Abstractions;
using Shared.Enums.Ai;
using System.Text;

namespace AiUnitTests.Csv
{
    public class CsvModelLoaderTests
    {
        [Fact]
        public void Load_ReturnsMappedModels_ForValidDataRows()
        {
            var loader = CreateLoader();
            var csv = "Prompt;Completion\nHello;World\nFoo;Bar\n";

            var result = loader.Load(AiModelTypeEnum.Global, ToBytes(csv));

            Assert.Equal(2, result.Count);
            Assert.Contains(new FakeCsvModel("Hello", "World"), result);
            Assert.Contains(new FakeCsvModel("Foo", "Bar"), result);
        }

        [Fact]
        public void Load_IgnoresBlankLines()
        {
            var loader = CreateLoader();
            var csv = "Prompt;Completion\nHello;World\n\n   \nFoo;Bar\n";

            var result = loader.Load(AiModelTypeEnum.Global, ToBytes(csv));

            Assert.Equal(2, result.Count);
        }

        [Fact]
        public void Load_Throws_WhenDataRowHasWrongValueCount()
        {
            var loader = CreateLoader();
            var csv = "Prompt;Completion\nHello;World;Extra\n";

            Assert.Throws<InvalidOperationException>(() => loader.Load(AiModelTypeEnum.Global, ToBytes(csv)));
        }

        [Fact]
        public void Load_Throws_WhenDataIsEmpty()
        {
            var loader = CreateLoader();

            Assert.Throws<InvalidOperationException>(() => loader.Load(AiModelTypeEnum.Global, []));
        }

        [Fact]
        public void Load_ReturnsEmptySet_WhenOnlyHeaderIsPresent()
        {
            var loader = CreateLoader();
            var csv = "Prompt;Completion\n";

            var result = loader.Load(AiModelTypeEnum.Global, ToBytes(csv));

            Assert.Empty(result);
        }

        [Fact]
        public void Load_Throws_WhenHeaderIsInvalid()
        {
            var loader = CreateLoader();
            var csv = "Prompt;Wrong\nHello;World\n";

            Assert.Throws<InvalidOperationException>(() => loader.Load(AiModelTypeEnum.Global, ToBytes(csv)));
        }

        [Fact]
        public void Load_Throws_WhenAiTypeIsNotRegistered()
        {
            var loader = CreateLoader();
            var csv = "Prompt;Completion\nHello;World\n";

            Assert.Throws<InvalidOperationException>(() => loader.Load(AiModelTypeEnum.User, ToBytes(csv)));
        }

        private static CsvModelLoader<FakeCsvModel> CreateLoader()
        {
            var definitions = new Dictionary<AiModelTypeEnum, IReadOnlyDictionary<string, int>>
            {
                [AiModelTypeEnum.Global] = FakeCsvRowMapper.ColumnDefinition,
            };
            var factory = new ColumnDefinitionFactory(definitions);

            return new CsvModelLoader<FakeCsvModel>(factory, new FakeCsvRowMapper(), NullLogger<CsvModelLoader<FakeCsvModel>>.Instance);
        }

        private static byte[] ToBytes(string csv) => Encoding.UTF8.GetBytes(csv);
    }
}
