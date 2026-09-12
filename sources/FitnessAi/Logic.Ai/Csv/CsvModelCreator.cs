using Logic.Ai.Interfaces;
using Shared.Enums.Ai;
using System.Text;

namespace Logic.Ai.Csv
{
    // Pure CSV serialization - no persistence responsibility (e.g. AiTrainingDataFileTable's
    // IsUpdated flag is set at the appropriate business location, not here).
    public class CsvModelCreator<TModel> : ICsvModelCreator<TModel>
    {
        private const char Separator = ';';

        private readonly IColumnDefinitionFactory _columnDefinitionFactory;
        private readonly ICsvRowMapper<TModel> _rowMapper;

        public CsvModelCreator(IColumnDefinitionFactory columnDefinitionFactory, ICsvRowMapper<TModel> rowMapper)
        {
            _columnDefinitionFactory = columnDefinitionFactory;
            _rowMapper = rowMapper;
        }

        public byte[] Create(AiModelTypeEnum aiType, IReadOnlyCollection<TModel> models)
        {
            var columnDefinition = _columnDefinitionFactory.GetColumnDefinition(aiType);
            var orderedColumns = columnDefinition.OrderBy(kvp => kvp.Value).Select(kvp => kvp.Key).ToList();

            var lines = new List<string> { string.Join(Separator, orderedColumns) };
            lines.AddRange(models.Select(model => BuildRow(model, orderedColumns)));

            return Encoding.UTF8.GetBytes(string.Join('\n', lines));
        }

        private string BuildRow(TModel model, List<string> orderedColumns)
        {
            var rowValues = _rowMapper.MapToRow(model);
            return string.Join(Separator, orderedColumns.Select(column => rowValues[column]));
        }
    }
}
