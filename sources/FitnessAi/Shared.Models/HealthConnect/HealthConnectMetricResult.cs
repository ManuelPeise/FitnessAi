using Shared.Enums.HealthConnect;
using Shared.Models.HealthConnect.ImportModels;

namespace Shared.Models.HealthConnect
{
    public class HealthConnectMetricResult
    {
        public HealthConnectRecordTypeEnum RecordType { get; set; }
        public List<AHealthConnectMetricBase> Records { get; set; } = [];
    }
}
