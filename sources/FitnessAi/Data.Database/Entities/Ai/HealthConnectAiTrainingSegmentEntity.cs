using Shared.Enums.HealthConnect;
using System.ComponentModel.DataAnnotations.Schema;


namespace Data.Database.Entities.Ai
{
    public class HealthConnectAiTrainingSegmentEntity: AEntityBase
    {
        public int Repetitions { get; set; }
        public int DurationSeconds { get; set; }
        public ExerciseSegmentType SegmentType { get; set; }
        public long HealthConnectRunningAiTrainingDataId { get; set; }
        [ForeignKey(nameof(HealthConnectRunningAiTrainingDataId))]
        public HealthConnectAiTrainingDataEntity HealthConnectRunningAiTrainingData { get; set; } = null!;
    }
}
