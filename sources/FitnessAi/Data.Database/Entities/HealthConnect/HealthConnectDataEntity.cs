using Data.Database.Entities.User;
using Shared.Enums.HealthConnect;
using System.ComponentModel.DataAnnotations.Schema;

namespace Data.Database.Entities.HealthConnect
{
    public class HealthConnectDataEntity: AEntityBase
    {
        public string Source { get; set; } = null!;
        public HealthConnectRecordTypeEnum Type { get; set; }
        public HealthConnectDataUnitEnum Unit { get; set; }
        public decimal Value { get; set; }
        public string StartTimestamp { get; set; } = string.Empty;
        public string EndTimestamp { get; set; } = string.Empty;
        public long UserId { get; set; }
        [ForeignKey(nameof(UserId))]
        public UserEntity User { get; set; } = null!;
    }
}
