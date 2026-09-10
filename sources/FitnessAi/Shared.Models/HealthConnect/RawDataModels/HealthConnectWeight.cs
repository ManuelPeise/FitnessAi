using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.RawDataModels
{
    public class HealthConnectWeight
    {
        [JsonProperty("inPounds")]
        public decimal InPounds { get; set; }
        [JsonProperty("inOunces")]
        public decimal InOunces { get; set; }
        [JsonProperty("inMicrograms")]
        public decimal InMicrograms { get; set; }
        [JsonProperty("inGrams")]
        public decimal InGrams { get; set; }
        [JsonProperty("inMilligrams")]
        public decimal InMilligrams { get; set; }
        [JsonProperty("inKilograms")]
        public decimal InKilograms { get; set; }
    }
}