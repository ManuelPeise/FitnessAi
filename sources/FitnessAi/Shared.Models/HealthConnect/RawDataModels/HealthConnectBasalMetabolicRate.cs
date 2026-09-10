using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.RawDataModels
{
    public class HealthConnectBasalMetabolicRate
    {
        [JsonProperty("inKilocaloriesPerDay")]
        public decimal InKilocaloriesPerDay { get; set; }

        [JsonProperty("inWatts")]
        public decimal InWatts { get; set; }
    }
}
