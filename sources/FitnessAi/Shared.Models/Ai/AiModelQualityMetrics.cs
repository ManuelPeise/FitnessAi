namespace Shared.Models.Ai
{
    public sealed record AiModelQualityMetrics
    {
        public required double MicroAccuracy { get; init; }
        public required double MacroAccuracy { get; init; }
        public required double LogLoss { get; init; }
    }
}
