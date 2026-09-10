using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectBodyFatMetric : AHealthConnectMetricBase
    {
        [JsonProperty("percentage")]
        public decimal Percentage { get; set; }
    }
}
