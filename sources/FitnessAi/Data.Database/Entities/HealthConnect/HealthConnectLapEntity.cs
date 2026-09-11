using System.ComponentModel.DataAnnotations.Schema;

namespace Data.Database.Entities.HealthConnect
{
    public class HealthConnectLapEntity: AEntityBase
    {
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public decimal LengthInMeters { get; set; }
        public long TrainingDataValuesId { get; set; }
        [ForeignKey(nameof(TrainingDataValuesId))]
        public HealthConnectTrainingDataValuesEntity TrainingDataValue { get; set; } = null!;
    }
}
