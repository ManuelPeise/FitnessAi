namespace Shared.Models.Ai
{
    public sealed record TrainedAiModelMetrics
    {
        public required string Version { get; init; }
        public required double MicroAccuracy { get; init; }
        public required double MacroAccuracy { get; init; }
        public required double LogLoss { get; init; }
        public required DateTime TrainedAt { get; init; }
    }
}
