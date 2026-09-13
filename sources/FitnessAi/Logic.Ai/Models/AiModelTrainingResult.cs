namespace Logic.Ai.Models
{
    public sealed record AiModelTrainingResult
    {
        public required byte[] ModelData { get; init; }
        public required double MicroAccuracy { get; init; }
        public required double MacroAccuracy { get; init; }
        public required double LogLoss { get; init; }
    }
}
