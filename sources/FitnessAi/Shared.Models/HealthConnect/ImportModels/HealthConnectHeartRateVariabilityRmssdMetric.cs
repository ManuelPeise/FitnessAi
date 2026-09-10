using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectHeartRateVariabilityRmssdMetric : AHealthConnectMetricBase
    {
        [JsonProperty("heartRateVariabilityMillis")]
        public decimal HeartRateVariabilityMillis { get; set; }
    }
}
