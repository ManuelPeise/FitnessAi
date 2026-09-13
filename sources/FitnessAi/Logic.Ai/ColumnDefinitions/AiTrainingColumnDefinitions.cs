namespace Logic.Ai.ColumnDefinitions
{
    internal static class AiTrainingColumnDefinitions
    {
        internal static readonly IReadOnlyDictionary<string, int> TrainingIntensityAiColumnDefinition = new Dictionary<string, int>
        {
            { "DataKey", 0 },
            { "userId", 1  },
            { "Elevation", 2 },
            { "Pace", 3 },
            { "AverageHeartRate", 4 },
            { "MinHeartRate", 5 },
            { "MaxHeartRate", 6 },
            { "Power", 7 },
            { "PredictedAt", 8 },
            { "Label", 9 },
        };
    }
}
