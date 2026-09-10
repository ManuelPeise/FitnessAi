using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectFloorsClimbedMetric: AHealthConnectMetricBase
    {
        [JsonProperty("floors")]
        public int Floors { get; set; }
    }
}
