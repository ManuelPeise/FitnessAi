using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.RawDataModels
{
    public class HealthConnectTemperature
    {
        [JsonProperty("inCelsius")]
        public decimal InCelsius { get; set; }

        [JsonProperty("inFahrenheit")]
        public decimal InFahrenheit { get; set; }
    }
}
