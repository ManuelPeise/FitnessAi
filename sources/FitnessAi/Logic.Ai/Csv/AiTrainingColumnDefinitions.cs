namespace Logic.Ai.Csv
{
    internal static class AiTrainingColumnDefinitions
    {
        internal static readonly IReadOnlyDictionary<string, int> IntensityAiColumnDefinition = new Dictionary<string, int>
        {
            { "DataKey", 0 },
            { "Elevation", 1 },
            { "Pace", 2 },
            { "AverageHeartRate", 3 },
            { "MinHeartRate", 4 },
            { "MaxHeartRate", 5 },
            { "Power", 6 },
            { "PredictedAt", 7 },
            { "Label", 8 },
        };
    }
}
