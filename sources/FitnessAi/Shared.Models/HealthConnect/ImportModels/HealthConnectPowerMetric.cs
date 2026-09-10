using Newtonsoft.Json;
using Shared.Models.HealthConnect.RawDataModels;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectPowerMetric: AHealthConnectMetricBase
    {
        [JsonProperty("power")]
        public HealthConnectPower Power { get; set; } = new();
    } 
}
