using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectCervicalMucusRecordMetric: AHealthConnectMetricBase
    {
        [JsonProperty("appearance")]
        public int Appearance { get; set; }
        [JsonProperty("sensation")]
        public int Sensation { get; set; }
    }
}