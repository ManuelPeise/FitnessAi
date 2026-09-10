using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectCadenceMetric: AHealthConnectMetricBase
    {
        [JsonProperty("revolutionsPerMinute")]
        public decimal RevolutionsPerMinute { get; set; }
    }
}
