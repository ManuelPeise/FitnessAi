using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectRestingHeartRateMetric: AHealthConnectMetricBase
    {
        [JsonProperty("beatsPerMinute")]
        public int BeatsPerMinute { get; set; }
    }
}
