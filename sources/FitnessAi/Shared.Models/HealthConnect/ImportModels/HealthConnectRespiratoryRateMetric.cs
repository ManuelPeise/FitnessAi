using Newtonsoft.Json;
namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectRespiratoryRateMetric: AHealthConnectMetricBase
    {
        [JsonProperty("rate")]
        public int Rate { get; set; }
    }
}
