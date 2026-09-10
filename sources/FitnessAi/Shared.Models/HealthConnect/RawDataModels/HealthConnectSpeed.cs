using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.RawDataModels
{
    public class HealthConnectSpeed
    {
        [JsonProperty("inMetersPerSecond")]
        public decimal InMetersPerSecond { get; set; }

        [JsonProperty("inKilometersPerHour")]
        public decimal InKilometersPerHour { get; set; }

        [JsonProperty("inMilesPerHour")]
        public decimal InMilesPerHour { get; set; }
    }
}
