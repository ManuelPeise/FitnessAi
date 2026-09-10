using Newtonsoft.Json;
using Shared.Models.HealthConnect.RawDataModels;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectHydrationMetric: AHealthConnectMetricBase
    {
        [JsonProperty("volume")]
        public HealthConnectVolume Volume { get; set; } = new();
    }
}
