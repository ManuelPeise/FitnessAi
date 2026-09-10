

using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectValues
    {
        [JsonProperty("avg")]
        public decimal? Avg { get; set; }
        [JsonProperty("min")]
        public decimal? Min { get; set; }
        [JsonProperty("max")]
        public decimal? Max { get; set; }
    }
}
