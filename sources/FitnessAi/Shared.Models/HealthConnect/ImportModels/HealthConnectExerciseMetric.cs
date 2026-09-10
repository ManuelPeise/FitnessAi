using Newtonsoft.Json;
using Shared.Enums.HealthConnect;
using Shared.Models.HealthConnect.RawDataModels;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectExerciseMetric: AHealthConnectMetricBase
    {
        [JsonProperty("exerciseType")]
        public ExerciseTypeEnum ExerciseType { get; set; }

        [JsonProperty("title")]
        public string? Title { get; set; }

        [JsonProperty("notes")]
        public string? Notes { get; set; }

        [JsonProperty("plannedExerciseSessionId")]
        public string? PlannedExerciseSessionId { get; set; }

        [JsonProperty("rateOfPerceivedExertion")]
        public decimal? RateOfPerceivedExertion { get; set; }
        [JsonProperty("segments")]
        public List<HealthConnectSegment> Segments { get; set; } = [];
        [JsonProperty("laps")]
        public List<HealthConnectLap> Laps { get; set; } = [];
    }
}
