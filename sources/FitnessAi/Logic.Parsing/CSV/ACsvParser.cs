using System.Globalization;

namespace Logic.Parsing.CSV
{
    public abstract class ACsvParser<TModel> where TModel : class
    {
        protected Dictionary<string, int> ColumnDefinition { get; }

        protected ACsvParser(
            Dictionary<string, int> columnDefinition)
        {
            ArgumentNullException.ThrowIfNull(columnDefinition);

            ColumnDefinition = new Dictionary<string, int>(columnDefinition);
        }

        protected void InitializeColumnDefinition(List<string> fields)
        {
            foreach (var field in fields)
            {
                if (ColumnDefinition.TryGetValue(field, out int value))
                {
                    ColumnDefinition[field] = fields.IndexOf(field);
                }
            }
        }

        protected bool ValidateColumnDefinition(Dictionary<string, int> columnDefinition)
        {
            if (columnDefinition == null || columnDefinition.Any(col => col.Value == -1))
            {
                return false;
            }

            return true;
        }

        protected DateTime ParseDateTime(string dateTimeString, string format)
        {
            if (!DateTime.TryParseExact(dateTimeString, format, CultureInfo.InvariantCulture, DateTimeStyles.None, out var result))
            {
                throw new FormatException($"Invalid date format: {dateTimeString}. Expected format: {format}");
            }

            return result; 
        }

        protected float ParseFloat(string floatString)
        {
            if (!float.TryParse(floatString, NumberStyles.Any, CultureInfo.InvariantCulture, out var result))
            {
                throw new FormatException($"Invalid float format: {floatString}");
            }

            return result;
        }

        public abstract IReadOnlyList<TModel> ParseCsv(IReadOnlyList<string> csvContentRows, char delimiter);
    }
}
