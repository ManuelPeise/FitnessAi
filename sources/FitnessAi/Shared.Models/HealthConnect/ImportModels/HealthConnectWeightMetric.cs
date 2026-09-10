using Newtonsoft.Json;
using Shared.Models.HealthConnect.RawDataModels;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectWeightMetric : AHealthConnectMetricBase
    {
        [JsonProperty("weight")]
        public HealthConnectWeight WeightData { get; set; } = new();
    }
}
