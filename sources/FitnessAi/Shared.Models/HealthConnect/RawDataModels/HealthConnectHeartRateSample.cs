using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.RawDataModels
{
    public class HealthConnectHeartRateSample
    {
        [JsonProperty("beatsPerMinute")]
        public decimal BeatsPerMinute { get; set; }
        [JsonProperty("time")]
        public DateTimeOffset Time { get; set; }
    }
}