using Data.Database.Entities.User;
using Shared.Enums.HealthConnect;
using System.ComponentModel.DataAnnotations.Schema;

namespace Data.Database.Entities.HealthConnect
{
    public class HealthConnectRecordEntity: AEntityBase
    {
        public long UserId { get; set; }
        [ForeignKey(nameof(UserId))]
        public UserEntity User { get; set; } = null!;
        public string ClientRecordId { get; set; } = string.Empty;
        public long ClientRecordVersion { get; set; }
        public string Origin { get; set; } = string.Empty;
        public int RecordingMethod { get; set; }
        public int TimeZoneOffset { get; set; } = 0;
        public HealthConnectRecordTypeEnum RecordType { get; set; }
        public DateTimeOffset? StartTime { get; set; }
        public DateTimeOffset? EndTime { get; set; }
        public ICollection<HealthConnectValueEntity> Values { get; set; } = new List<HealthConnectValueEntity>();
        public ICollection<HealthConnectSegmentEntity> Segments { get; set; } = new List<HealthConnectSegmentEntity>();

    }
}
