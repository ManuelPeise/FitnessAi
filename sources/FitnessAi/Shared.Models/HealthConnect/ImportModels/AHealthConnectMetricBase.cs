using Newtonsoft.Json;
using Shared.Models.HealthConnect.RawDataModels;

namespace Shared.Models.HealthConnect.ImportModels
{
    public abstract class AHealthConnectMetricBase
    {
        [JsonProperty("metadata")]
        public HealthConnectMetadata MetaData { get; set; } = new();
        [JsonProperty("time")]
        public DateTimeOffset? Time { get; set; }
        [JsonProperty("startTime")]
        public DateTimeOffset? StartTime { get; set; }
        [JsonProperty("endTime")]
        public DateTimeOffset? EndTime { get; set; }
        [JsonProperty("startZoneOffset")]
        public HealthConnetTimeZone StartZoneOffset { get; set; } = new();
        [JsonProperty("endZoneOffset")]
        public HealthConnetTimeZone EndZoneOffset { get; set; } = new();
    }
}
