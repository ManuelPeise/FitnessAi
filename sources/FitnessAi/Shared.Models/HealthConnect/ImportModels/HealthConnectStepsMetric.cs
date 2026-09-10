using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectStepsMetric : AHealthConnectMetricBase
    {
        [JsonProperty("count")]
        public int Count { get; set; }
    }
}