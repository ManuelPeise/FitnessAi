
namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectOxygenSaturationMetric: AHealthConnectMetricBase
    {
        [Newtonsoft.Json.JsonProperty("percentage")]
        public double Percentage { get; set; }
    }
}
