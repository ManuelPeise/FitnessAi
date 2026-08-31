namespace Shared.Models.Running.Import
{
    public sealed class RunningDataImportModel
    {
        public DateTime Date { get; set; }
        public string Gender { get; set; } = string.Empty;
        public float Weight { get; set; }
        public float Age { get; set; }
        public float Duration { get; set; }
        public float Distance { get; set; }
        public float Pace { get; set; }
        public float HeartRate { get; set; }
        public float StepFrequence { get; set; }
        public float Performance { get; set; }
        public float ElevationGain { get; set; }
        public float LossOfAltitude { get; set; }
        public float EffectAerob { get; set; }
        public float EffectAnaerob { get; set; }
        public float Vo2Max { get; set; }
        public float CaloriesBurned { get; set; }
    }
}
