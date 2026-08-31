using Logic.Parsing.CSV.Enums;
using Shared.Models.Running.Import;

namespace Logic.Parsing.CSV
{
    public static class CsvParserFactory<TModel> where TModel: class
    {
        public static ACsvParser<TModel> CreateCsvParser(CsvTypeEnum csvType, Dictionary<string, int> columnDefinition)
        {
            switch (csvType)
            {
                case CsvTypeEnum.Running:
                    return CreateRunningParser(columnDefinition);
                default:
                    throw new NotImplementedException($"CSV parser for type {csvType} is not implemented.");
            }
        }

        private static ACsvParser<TModel> CreateRunningParser(Dictionary<string, int> columnDefinition)
        {
            if (typeof(TModel) != typeof(RunningDataImportModel))
            {
                throw new ArgumentException(
                    $"CSV type '{CsvTypeEnum.Running}' requires model '{nameof(RunningDataImportModel)}'.",
                    nameof(TModel));
            }

            return (ACsvParser<TModel>)(object)
                new RunningCsvParser(columnDefinition);
        }
    }
}
