using Newtonsoft.Json;
using Shared.Models.HealthConnect.RawDataModels;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectHeartRateMetric: AHealthConnectMetricBase
    {
        [JsonProperty("samples")]
        public List<HealthConnectHeartRateSample> Samples { get; set; } = [];
    }
}
