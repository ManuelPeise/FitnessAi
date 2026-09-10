using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.RawDataModels
{
    public class HealthConnectTolic
    {
        [JsonProperty("inMillimetersOfMercury")]
        public int InMillimetersOfMercury { get; set; }
    }
}
