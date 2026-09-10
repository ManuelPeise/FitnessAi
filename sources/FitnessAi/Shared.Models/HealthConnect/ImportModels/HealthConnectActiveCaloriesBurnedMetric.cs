using Newtonsoft.Json;
using Shared.Models.HealthConnect.RawDataModels;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectActiveCaloriesBurnedMetric : AHealthConnectMetricBase
    {
        [JsonProperty("energy")]
        public HealthConnectEnergy Energy { get; set; } = new();
    }
}
