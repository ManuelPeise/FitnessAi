using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.RawDataModels
{
    public class HealthConnectBloodGlucoseLevel
    {
        [JsonProperty("inMillimolesPerLiter")]
        public decimal InMillimolesPerLiter { get; set; }

        [JsonProperty("inMilligramsPerDeciliter")]
        public decimal InMilligramsPerDeciliter { get; set; }
    }
}
