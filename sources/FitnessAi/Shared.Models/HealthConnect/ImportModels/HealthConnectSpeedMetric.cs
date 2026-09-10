using Newtonsoft.Json;
using Shared.Models.HealthConnect.RawDataModels;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectSpeedMetric : AHealthConnectMetricBase
    {
        [JsonProperty("samples")]
        public List<HealthConnectSpeed> Samples { get; set; } = [];
    }
}
