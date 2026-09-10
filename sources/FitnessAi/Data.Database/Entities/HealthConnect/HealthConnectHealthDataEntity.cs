using Data.Database.Entities.User;
using System.ComponentModel.DataAnnotations.Schema;


namespace Data.Database.Entities.HealthConnect
{
    public class HealthConnectHealthDataEntity: AEntityBase
    {
        public string DataKey { get; set; } = null!;
        public DateTimeOffset TimeStamp { get; set; }
        public DateTimeOffset StartTime { get; set; }
        public DateTimeOffset EndTime { get; set; }
        public long UserId { get; set; }
        [ForeignKey(nameof(UserId))]
        public UserEntity User { get; set; } = null!;
        public long HealthConnectValuesId { get; set; }
        [ForeignKey(nameof(HealthConnectValuesId))]
        public HealthConnectValuesEntity? Values { get; set; }
    }
}
