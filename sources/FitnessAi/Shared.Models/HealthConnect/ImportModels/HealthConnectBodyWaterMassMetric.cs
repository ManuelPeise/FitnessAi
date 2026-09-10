using Newtonsoft.Json;
using Shared.Models.HealthConnect.RawDataModels;


namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectBodyWaterMassMetric: AHealthConnectMetricBase
    {
        [JsonProperty("mass")]
        public HealthConnectMass Mass { get; set; } = new();
    }
}
