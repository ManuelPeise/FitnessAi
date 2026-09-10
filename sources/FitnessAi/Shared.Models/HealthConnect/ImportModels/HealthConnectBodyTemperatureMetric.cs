using Newtonsoft.Json;
using Shared.Enums.HealthConnect;
using Shared.Models.HealthConnect.RawDataModels;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectBodyTemperatureMetric: AHealthConnectMetricBase
    {
        [JsonProperty("temperature")]
        public HealthConnectTemperature Temperature { get; set; } = new();
        [JsonProperty("measurementLocation")]
        public BodyTemperatureMeasurementLocationEnum MeasurementLocation { get; set; }
    }
}
