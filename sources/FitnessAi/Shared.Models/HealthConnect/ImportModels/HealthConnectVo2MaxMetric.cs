using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectVo2MaxMetric : AHealthConnectMetricBase
    {
        [JsonProperty("measurementMethod")]
        public int MeasurementMethod { get; set; }
        [JsonProperty("vo2MillilitersPerMinuteKilogram")]
        public decimal Vo2MillilitersPerMinuteKilogram { get; set; }
    }
}
