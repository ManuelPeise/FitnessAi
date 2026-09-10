using Newtonsoft.Json;
using Shared.Models.HealthConnect.RawDataModels;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectElevationGainedMetric: AHealthConnectMetricBase
    {
        [JsonProperty("elevation")]
        public HealthConnectDistance Elevation { get; set; } = new();
    }
}
