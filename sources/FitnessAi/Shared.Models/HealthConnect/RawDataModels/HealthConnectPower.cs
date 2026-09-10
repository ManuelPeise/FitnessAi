using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.RawDataModels
{
    public class HealthConnectPower
    {
        [JsonProperty("inWatts")]
        public decimal InWatts { get; set; }

        [JsonProperty("inKilocaloriesPerDay")]
        public decimal InKilocaloriesPerDay { get; set; }
    }
}
