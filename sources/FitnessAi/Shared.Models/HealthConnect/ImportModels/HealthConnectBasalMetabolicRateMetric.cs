using Newtonsoft.Json;
using Shared.Models.HealthConnect.RawDataModels;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectBasalMetabolicRateMetric: AHealthConnectMetricBase
    {
        [JsonProperty("basalMetabolicRate")]
        public HealthConnectBasalMetabolicRate MetabolicRate { get; set; } = new();
    }
}
