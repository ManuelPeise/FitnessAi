using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.RawDataModels
{
    public class HealthConnectEnergy
    {
        [JsonProperty("inKilocalories")]
        public decimal InKilocalories { get; set; }
        [JsonProperty("inKilojoules")]
        public decimal InKilojoules { get; set; }
        [JsonProperty("inJoules")]
        public decimal InJoules { get; set; }
        [JsonProperty("inCalories")]
        public decimal InCalories { get; set; }
    }
}
