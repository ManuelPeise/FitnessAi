using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectSleepSessionMetric: AHealthConnectMetricBase
    {
        [JsonProperty("title")]
        public string Title { get; set; } = string.Empty;
    }
}
