using Shared.Enums.HealthConnect;

namespace Shared.Models.HealthConnect
{
    public class TrainingSegments
    {
        public HealthConnectExerciseSegmentTypeEnum SegmentType { get; set; }
        public int Replications { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }
}
