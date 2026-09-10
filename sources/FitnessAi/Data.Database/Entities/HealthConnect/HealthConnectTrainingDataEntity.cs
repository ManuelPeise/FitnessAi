using Data.Database.Entities.User;
using Shared.Enums.HealthConnect;
using System.ComponentModel.DataAnnotations.Schema;

namespace Data.Database.Entities.HealthConnect
{
    public class HealthConnectTrainingDataEntity: AEntityBase
    {
        public string DataKey { get; set; } = null!;
        public string Origin { get; set; } = string.Empty;
        public ExerciseTypeEnum ExerciseType { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }

        public long HealthConnectTimeZoneEntityId { get; set; }
        [ForeignKey(nameof(HealthConnectTimeZoneEntityId))]
        public HealthConnectTimeZoneEntity HealthConnectTimeZoneEntity { get; set; } = null!;

        public long HealthConnectTrainingDataValuesId { get; set; }
        [ForeignKey(nameof(HealthConnectTrainingDataValuesId))]
        public HealthConnectTrainingDataValuesEntity HealthConnectTrainingDataValues { get; set; } = null!;

        public long UserId { get; set; }
        [ForeignKey(nameof(UserId))]
        public UserEntity User { get; set; } = null!;
    }
}
