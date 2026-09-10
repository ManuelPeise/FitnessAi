using Shared.Enums.HealthConnect;

namespace Shared.Models.HealthConnect
{
    public class HealthConnectMetricImportModel
    {
        public List<HealthConnectMetricApiMetric> Metrics { get; set; } = [];
    }

    public class HealthConnectMetricApiMetric
    {
        public HealthConnectRecordTypeEnum MetricType { get; set; }
        public string Origin { get; set; } = string.Empty;
        public string DataJson { get; set; } = string.Empty;
    }
}
