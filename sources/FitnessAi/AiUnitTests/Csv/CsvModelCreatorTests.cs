using AiUnitTests.Csv.Fakes;
using Logic.Ai.ColumnDefinitions;
using Logic.Ai.Csv;
using Shared.Enums.Ai;
using System.Text;

namespace AiUnitTests.Csv
{
    public class CsvModelCreatorTests
    {
        [Fact]
        public void Create_ReturnsByteArray()
        {
            var creator = CreateCreator();

            var result = creator.Create(AiModelTypeEnum.Global, [new FakeCsvModel("Hello", "World")]);

            Assert.IsType<byte[]>(result);
        }

        [Fact]
        public void Create_UsesUtf8Encoding()
        {
            var creator = CreateCreator();

            var result = creator.Create(AiModelTypeEnum.Global, [new FakeCsvModel("Héllo", "Wörld")]);

            var decoded = Encoding.UTF8.GetString(result);
            Assert.Contains("Héllo", decoded);
            Assert.Contains("Wörld", decoded);
        }

        [Fact]
        public void Create_GeneratesHeaderMatchingColumnDefinition()
        {
            var creator = CreateCreator();

            var result = creator.Create(AiModelTypeEnum.Global, []);

            var lines = Encoding.UTF8.GetString(result).Split('\n');
            Assert.Equal("Prompt;Completion", lines[0]);
        }

        [Fact]
        public void Create_UsesSemicolonSeparator_ForDataRows()
        {
            var creator = CreateCreator();

            var result = creator.Create(AiModelTypeEnum.Global, [new FakeCsvModel("Hello", "World")]);

            var lines = Encoding.UTF8.GetString(result).Split('\n');
            Assert.Equal("Hello;World", lines[1]);
        }

        private static CsvModelCreator<FakeCsvModel> CreateCreator()
        {
            var definitions = new Dictionary<AiModelTypeEnum, IReadOnlyDictionary<string, int>>
            {
                [AiModelTypeEnum.Global] = FakeCsvRowMapper.ColumnDefinition,
            };
            var factory = new ColumnDefinitionFactory(definitions);

            return new CsvModelCreator<FakeCsvModel>(factory, new FakeCsvRowMapper());
        }
    }
}
