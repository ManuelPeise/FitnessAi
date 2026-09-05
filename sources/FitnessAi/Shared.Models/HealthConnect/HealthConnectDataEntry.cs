using Shared.Enums.HealthConnect;

namespace Shared.Models.HealthConnect
{
    public class HealthConnectDataEntry
    {
        public HealthConnectRecordTypeEnum Type { get; set; }
        public HealthConnectDataUnitEnum Unit { get; set; }
        public decimal Value { get; set; }
        public string StartTimestamp { get; set; } = string.Empty;
        public string EndTimestamp { get; set; } = string.Empty;
    }
}