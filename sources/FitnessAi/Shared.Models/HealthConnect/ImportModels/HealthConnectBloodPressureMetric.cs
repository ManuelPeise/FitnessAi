using Newtonsoft.Json;
using Shared.Enums.HealthConnect;
using Shared.Models.HealthConnect.RawDataModels;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectBloodPressureMetric : AHealthConnectMetricBase
    {
        [JsonProperty("systolic")]
        public HealthConnectTolic Systolic { get; set; } = new();
        [JsonProperty("diastolic")]
        public HealthConnectTolic Diastolic { get; set; } = new();
        [JsonProperty("bodyPosition")]
        public BodyPositionEnum BodyPosition { get; set; }

    }
}
