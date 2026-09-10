using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.RawDataModels
{
    public class HealthConnectMass
    {
        [JsonProperty("inKilograms")]
        public decimal InKilograms { get; set; }

        [JsonProperty("inGrams")]
        public decimal InGrams { get; set; }

        [JsonProperty("inMilligrams")]
        public decimal InMilligrams { get; set; }

        [JsonProperty("inMicrograms")]
        public decimal InMicrograms { get; set; }

        [JsonProperty("inOunces")]
        public decimal InOunces { get; set; }

        [JsonProperty("inPounds")]
        public decimal InPounds { get; set; }
    }
}
