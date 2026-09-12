using Logic.Ai.Interfaces;
using Microsoft.Extensions.Logging;
using Shared.Enums.Ai;
using System.Text;

namespace Logic.Ai.Csv
{
    public class CsvModelLoader<TModel> : ICsvModelLoader<TModel>
    {
        private const char Separator = ';';

        private readonly IColumnDefinitionFactory _columnDefinitionFactory;
        private readonly ICsvRowMapper<TModel> _rowMapper;
        private readonly ILogger<CsvModelLoader<TModel>> _logger;

        public CsvModelLoader(
            IColumnDefinitionFactory columnDefinitionFactory,
            ICsvRowMapper<TModel> rowMapper,
            ILogger<CsvModelLoader<TModel>> logger)
        {
            _columnDefinitionFactory = columnDefinitionFactory;
            _rowMapper = rowMapper;
            _logger = logger;
        }

        public HashSet<TModel> Load(AiModelTypeEnum aiType, byte[] data)
        {
            var lines = SplitLines(data);
            var columnDefinition = _columnDefinitionFactory.GetColumnDefinition(aiType);

            var headerColumns = ParseHeader(lines, columnDefinition);
            var models = ParseDataRows(lines, headerColumns, columnDefinition);

            _logger.LogInformation(
                "Parsed {ParsedCount} rows from CSV for AiType '{AiType}'.", models.Count, aiType);

            return models;
        }

        private static List<string> SplitLines(byte[] data)
        {
            if (data == null || data.Length == 0)
            {
                throw new InvalidOperationException("CSV data is empty.");
            }

            var content = Encoding.UTF8.GetString(data);
            var lines = content.Split('\n').Select(line => line.TrimEnd('\r')).ToList();

            if (lines.Count == 0 || string.IsNullOrWhiteSpace(lines[0]))
            {
                throw new InvalidOperationException("CSV data does not contain a header row.");
            }

            return lines;
        }

        private static List<string> ParseHeader(List<string> lines, IReadOnlyDictionary<string, int> columnDefinition)
        {
            var headerColumns = lines[0].Split(Separator).ToList();
            CsvHeaderValidator.Validate(headerColumns, columnDefinition);
            return headerColumns;
        }

        private HashSet<TModel> ParseDataRows(
            List<string> lines, List<string> headerColumns, IReadOnlyDictionary<string, int> columnDefinition)
        {
            var models = new HashSet<TModel>();

            for (var rowIndex = 1; rowIndex < lines.Count; rowIndex++)
            {
                if (string.IsNullOrWhiteSpace(lines[rowIndex]))
                {
                    continue;
                }

                models.Add(ParseRow(lines[rowIndex], rowIndex, headerColumns, columnDefinition));
            }

            return models;
        }

        private TModel ParseRow(
            string line, int rowIndex, List<string> headerColumns, IReadOnlyDictionary<string, int> columnDefinition)
        {
            var values = line.Split(Separator);

            if (values.Length != columnDefinition.Count)
            {
                throw new InvalidOperationException(
                    $"CSV row {rowIndex} has {values.Length} value(s), expected {columnDefinition.Count}.");
            }

            var rowValues = headerColumns.ToDictionary(column => column, column => values[columnDefinition[column]]);

            return _rowMapper.MapFromRow(rowValues);
        }
    }
}
