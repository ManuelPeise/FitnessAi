using Shared.Enums.HealthConnect;
using System.ComponentModel.DataAnnotations.Schema;

namespace Data.Database.Entities.HealthConnect
{
    public class HealthConnectSegmentEntity: AEntityBase
    {
        public ExerciseSegmentType SegmentType { get; set; }
        public int Repetitions { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public long TrainingDataValuesId { get; set; }
        [ForeignKey(nameof(TrainingDataValuesId))]
        public HealthConnectTrainingDataValuesEntity TrainingDataValue { get; set; } = null!;
    }
}
