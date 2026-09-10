using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectMenstruationFlowMetric: AHealthConnectMetricBase
    {
        [JsonProperty("flow")]
        public int Flow { get; set; }
    }
}
