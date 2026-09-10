using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.RawDataModels
{
    public class HealthConnectLap
    {
        [JsonProperty("length")]
        public HealthConnectDistance Length { get; set; } = new();
    }
}
