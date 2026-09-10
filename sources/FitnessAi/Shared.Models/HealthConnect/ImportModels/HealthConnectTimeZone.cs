using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectTimeZoneModel
    {
        [JsonProperty("offset")]
        public int Offset { get; set; }
    }
}
