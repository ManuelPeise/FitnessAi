using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HeartRateVariabilityMetric: AHealthConnectMetricBase
    {
        [JsonProperty("heartRateVariabilityMillis")]
        public decimal HeartRateVariabilityMillis { get; set; }
    }
}
