using Newtonsoft.Json;
using Shared.Models.HealthConnect.RawDataModels;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectDistanceMetric: AHealthConnectMetricBase
    {
        [JsonProperty("distance")]
        public HealthConnectDistance Distance { get; set; } = new();
    }
}
