using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectStepsCadenceMetric : AHealthConnectMetricBase
    {
        [JsonProperty("rate")]
        public double Rate { get; set; }
    }
}
