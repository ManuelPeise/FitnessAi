namespace Logic.Ai.Csv.Models
{
    // A record for value-based Equals/GetHashCode - required for HashSet<WorkOutIntensityCsvModel>
    // dedup (both when building models from entities and when loading them back from CSV) to
    // actually work.
    public sealed record WorkOutIntensityCsvModel
    {
        public string? DataKey { get; init; }
        public string? Elevation { get; init; }
        public string? Pace { get; init; }
        public string? AverageHeartRate { get; init; }
        public string? MinHeartRate { get; init; }
        public string? MaxHeartRate { get; init; }
        public string? Power { get; init; }
        public string? PredictedAt { get; init; }
        public string? Label { get; init; }
    }
}
