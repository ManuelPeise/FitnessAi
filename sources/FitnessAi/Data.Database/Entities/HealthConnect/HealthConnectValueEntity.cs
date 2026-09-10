using Shared.Enums.HealthConnect;
using System.ComponentModel.DataAnnotations.Schema;

namespace Data.Database.Entities.HealthConnect
{
    public class HealthConnectValueEntity : AEntityBase
    {
        public decimal Value { get; set; }
        public HealthConnectValueTypeEnum ValueType { get; set; }
        public HealthConnectUnitTypeEnum UnitType { get; set; }
        public DateTimeOffset? TimeStamp { get; set; }
        public string? TextValue { get; set; }
        public int? CategoryValue { get; set; }
        public long RecordId { get; set; }
        [ForeignKey(nameof(RecordId))]
        public HealthConnectRecordEntity Record { get; set; } = null!;
    }
}
