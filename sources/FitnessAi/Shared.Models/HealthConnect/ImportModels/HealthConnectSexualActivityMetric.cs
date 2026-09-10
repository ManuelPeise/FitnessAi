using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectSexualActivityMetric: AHealthConnectMetricBase
    {
        [JsonProperty("protectionUsed")]
        public int ProtectionUsed { get; set; }
    }
}
