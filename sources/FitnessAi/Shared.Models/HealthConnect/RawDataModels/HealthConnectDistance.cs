using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.RawDataModels
{
    public class HealthConnectDistance
    {
        [JsonProperty("inInches")]
        public decimal InInches { get; set; }
        [JsonProperty("inMiles")]
        public decimal InMiles { get; set; }
        [JsonProperty("inFeet")]
        public decimal InFeet { get; set; }
        [JsonProperty("inKilometers")]
        public decimal InKilometers { get; set; }
        [JsonProperty("inMeters")]
        public decimal InMeters { get; set; }
    }
}