using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.RawDataModels
{
    public class HealthConnectNutrionWeight
    {
        [JsonProperty("inGrams")]
        public decimal InGrams { get; set; }

        [JsonProperty("inKilograms")]
        public decimal InKilograms { get; set; }

        [JsonProperty("inMilligrams")]
        public decimal InMilligrams { get; set; }

        [JsonProperty("inMicrograms")]
        public decimal InMicrograms { get; set; }
    }
}
