using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectOvulationTestMetric: AHealthConnectMetricBase
    {
        [JsonProperty("result")]
        public int Result { get; set; }
    }
}
