using Logic.Ai.Interfaces;

namespace AiUnitTests.Csv.Fakes
{
    // Test-only mapper for FakeCsvModel/FakeColumnDefinition, never a production mapper.
    internal class FakeCsvRowMapper : ICsvRowMapper<FakeCsvModel>
    {
        public static readonly IReadOnlyDictionary<string, int> ColumnDefinition = new Dictionary<string, int>
        {
            ["Prompt"] = 0,
            ["Completion"] = 1,
        };

        public FakeCsvModel MapFromRow(IReadOnlyDictionary<string, string> rowValues)
        {
            return new FakeCsvModel(rowValues["Prompt"], rowValues["Completion"]);
        }

        public IReadOnlyDictionary<string, string> MapToRow(FakeCsvModel model)
        {
            return new Dictionary<string, string>
            {
                ["Prompt"] = model.Prompt,
                ["Completion"] = model.Completion,
            };
        }
    }
}
