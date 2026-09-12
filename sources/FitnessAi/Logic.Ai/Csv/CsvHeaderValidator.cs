namespace Logic.Ai.Csv
{
    // Strict, exact header validation - no auto-correction or fuzzy matching. Header names are
    // matched case-sensitively.
    public static class CsvHeaderValidator
    {
        public static void Validate(IReadOnlyList<string> headerColumns, IReadOnlyDictionary<string, int> columnDefinition)
        {
            ValidateColumnCount(headerColumns, columnDefinition);
            ValidateNoMissingColumns(headerColumns, columnDefinition);
            ValidateNoExtraColumns(headerColumns, columnDefinition);
            ValidateColumnOrder(headerColumns, columnDefinition);
        }

        private static void ValidateColumnCount(IReadOnlyList<string> headerColumns, IReadOnlyDictionary<string, int> columnDefinition)
        {
            if (headerColumns.Count != columnDefinition.Count)
            {
                throw new InvalidOperationException(
                    $"CSV header has {headerColumns.Count} column(s), expected {columnDefinition.Count}.");
            }
        }

        private static void ValidateNoMissingColumns(IReadOnlyList<string> headerColumns, IReadOnlyDictionary<string, int> columnDefinition)
        {
            foreach (var expectedColumn in columnDefinition.Keys)
            {
                if (!headerColumns.Contains(expectedColumn))
                {
                    throw new InvalidOperationException($"CSV header is missing expected column '{expectedColumn}'.");
                }
            }
        }

        private static void ValidateNoExtraColumns(IReadOnlyList<string> headerColumns, IReadOnlyDictionary<string, int> columnDefinition)
        {
            foreach (var actualColumn in headerColumns)
            {
                if (!columnDefinition.ContainsKey(actualColumn))
                {
                    throw new InvalidOperationException($"CSV header contains unexpected column '{actualColumn}'.");
                }
            }
        }

        private static void ValidateColumnOrder(IReadOnlyList<string> headerColumns, IReadOnlyDictionary<string, int> columnDefinition)
        {
            for (var index = 0; index < headerColumns.Count; index++)
            {
                var expectedIndex = columnDefinition[headerColumns[index]];

                if (expectedIndex != index)
                {
                    throw new InvalidOperationException(
                        $"CSV header column '{headerColumns[index]}' is at index {index}, expected index {expectedIndex}.");
                }
            }
        }
    }
}
