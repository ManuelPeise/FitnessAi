using Logic.Ai.Csv;

namespace AiUnitTests.Csv
{
    public class CsvHeaderValidatorTests
    {
        private static readonly IReadOnlyDictionary<string, int> ColumnDefinition = new Dictionary<string, int>
        {
            ["Prompt"] = 0,
            ["Completion"] = 1,
            ["Category"] = 2,
        };

        [Fact]
        public void Validate_DoesNotThrow_WhenHeaderIsExactlyValid()
        {
            var header = new List<string> { "Prompt", "Completion", "Category" };

            var exception = Record.Exception(() => CsvHeaderValidator.Validate(header, ColumnDefinition));

            Assert.Null(exception);
        }

        [Fact]
        public void Validate_Throws_WhenColumnIsMissing()
        {
            var header = new List<string> { "Prompt", "Completion" };

            Assert.Throws<InvalidOperationException>(() => CsvHeaderValidator.Validate(header, ColumnDefinition));
        }

        [Fact]
        public void Validate_Throws_WhenExtraColumnIsPresent()
        {
            var header = new List<string> { "Prompt", "Completion", "Category", "Extra" };

            Assert.Throws<InvalidOperationException>(() => CsvHeaderValidator.Validate(header, ColumnDefinition));
        }

        [Fact]
        public void Validate_Throws_WhenColumnOrderIsWrong()
        {
            var header = new List<string> { "Completion", "Prompt", "Category" };

            Assert.Throws<InvalidOperationException>(() => CsvHeaderValidator.Validate(header, ColumnDefinition));
        }

        [Fact]
        public void Validate_Throws_WhenColumnNameIsWrong()
        {
            var header = new List<string> { "Prompt", "Answer", "Category" };

            Assert.Throws<InvalidOperationException>(() => CsvHeaderValidator.Validate(header, ColumnDefinition));
        }

        [Fact]
        public void Validate_Throws_WhenColumnCountIsWrong()
        {
            var header = new List<string> { "Prompt", "Completion", "Category", "Extra", "MoreExtra" };

            Assert.Throws<InvalidOperationException>(() => CsvHeaderValidator.Validate(header, ColumnDefinition));
        }
    }
}
