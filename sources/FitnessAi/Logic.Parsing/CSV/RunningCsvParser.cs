using Shared.Models.Running.Import;

namespace Logic.Parsing.CSV
{
    public sealed class RunningCsvParser : ACsvParser<RunningDataImportModel>
    {
        private const string DateColumn = "Date";
        private const string DistanceColumn = "Distance";
        private const string PaceColumn = "Pace";
        private const string HeartRateColumn = "HeartRate";
        private const string GenderColumn = "Gender";
        private const string WeightColumn = "Weight";
        private const string AgeColumn = "Age";
        private const string DurationColumn = "Duration";
        private const string StepFrequenceColumn = "StepFrequence";
        private const string PerformanceColumn = "Performance";
        private const string ElevationGainColumn = "Elevation gain";
        private const string LossOfAltitudeColumn = "Loss of altitude";
        private const string EffectAerobColumn = "Effect Aerob";
        private const string EffectAnaerobColumn = "Effect Anaerob";
        private const string Vo2MaxColumn = "Vo2Max";

        public RunningCsvParser(Dictionary<string, int> columnDefinition) : base(columnDefinition) { }

        public override IReadOnlyList<RunningDataImportModel> ParseCsv(IReadOnlyList<string> csvContentRows, char delimiter)
        {
            var headerRow = csvContentRows.FirstOrDefault();

            if (headerRow == null)
            {
                throw new InvalidOperationException("CSV content is empty.");
            }

            var fields = headerRow.Split(delimiter).ToList();

            InitializeColumnDefinition(fields);

            if (!ValidateColumnDefinition(ColumnDefinition))
            {
                throw new InvalidOperationException("Column definition is invalid.");
            }

            var result = new List<RunningDataImportModel>();

            foreach (var row in csvContentRows.Skip(1))
            {
                var columns = row.Split(delimiter);

                var model = new RunningDataImportModel
                {
                    Date = ParseDateTime(columns[ColumnDefinition[DateColumn]], "yyyy-MM-dd"),
                    Gender = columns[ColumnDefinition[GenderColumn]],
                    Weight = ParseFloat(columns[ColumnDefinition[WeightColumn]]),
                    Age = ParseFloat(columns[ColumnDefinition[AgeColumn]]),
                    Duration = ParseFloat(columns[ColumnDefinition[DurationColumn]]),
                    Distance = ParseFloat(columns[ColumnDefinition[DistanceColumn]]),
                    Pace = ParseFloat(columns[ColumnDefinition[PaceColumn]]),
                    HeartRate = ParseFloat(columns[ColumnDefinition[HeartRateColumn]]),
                    StepFrequence = ParseFloat(columns[ColumnDefinition[StepFrequenceColumn]]),
                    Performance = ParseFloat(columns[ColumnDefinition[PerformanceColumn]]),
                    ElevationGain = ParseFloat(columns[ColumnDefinition[ElevationGainColumn]]),
                    LossOfAltitude = ParseFloat(columns[ColumnDefinition[LossOfAltitudeColumn]]),
                    EffectAerob = ParseFloat(columns[ColumnDefinition[EffectAerobColumn]]),
                    EffectAnaerob = ParseFloat(columns[ColumnDefinition[EffectAnaerobColumn]]),
                    Vo2Max = ParseFloat(columns[ColumnDefinition[Vo2MaxColumn]])
                };

                result.Add(model);
            }

            return result;
        }
    }
}
