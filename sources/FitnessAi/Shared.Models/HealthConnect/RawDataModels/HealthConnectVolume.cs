using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.RawDataModels
{
    public class HealthConnectVolume
    {
        [JsonProperty("inLiters")]
        public decimal InLiters { get; set; }

        [JsonProperty("inMilliliters")]
        public decimal InMilliliters { get; set; }

        [JsonProperty("inFluidOuncesUs")]
        public decimal InFluidOuncesUs { get; set; }
    }
}
