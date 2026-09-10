using Newtonsoft.Json;
using Shared.Models.HealthConnect.RawDataModels;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectHeightMetric: AHealthConnectMetricBase
    {
        [JsonProperty("height")]
        public HealthConnectHeight Height { get; set; } = new();
    }
}
