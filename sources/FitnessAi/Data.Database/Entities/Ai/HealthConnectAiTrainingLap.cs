using System.ComponentModel.DataAnnotations.Schema;

namespace Data.Database.Entities.Ai
{
    public class HealthConnectAiTrainingLap: AEntityBase
    {    
        public decimal LengthInMeters { get; set; }
        public int DurationSeconds { get; set; }
        public long HealthConnectAiTrainingDataId { get; set; }
        [ForeignKey(nameof(HealthConnectAiTrainingDataId))]
        public HealthConnectAiTrainingDataEntity HealthConnectAiTrainingData { get; set; } = null!;
    }
}
