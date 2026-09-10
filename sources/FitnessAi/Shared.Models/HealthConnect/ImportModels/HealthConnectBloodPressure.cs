using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectBloodPressure
    {
        [JsonProperty("systolic")]
        public decimal? Systolic { get; set; }
        [JsonProperty("diastolic")]
        public decimal? Diastolic { get; set; }
    }
}