using Newtonsoft.Json;
using Shared.Models.HealthConnect.RawDataModels;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectSkinTemperatureMetric: AHealthConnectMetricBase
    {
        [JsonProperty("location")]
        public int Location { get; set; }
        [JsonProperty("delta")]
        public HealthConnectTemperature Delta { get; set; } = new();
    }
}
