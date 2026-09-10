using System.ComponentModel.DataAnnotations.Schema;

namespace Data.Database.Entities.HealthConnect
{
    /// <summary>
    /// Represents a time-bounded sub-section of a record such as an exercise segment,
    /// a lap, or a sleep stage.
    /// </summary>
    public class HealthConnectSegmentEntity : AEntityBase
    {
        public DateTimeOffset? StartTime { get; set; }
        public DateTimeOffset? EndTime { get; set; }

        // Segment / lap / sleep-stage type (stored as the source enum value).
        public int SegmentType { get; set; }

        // Optional repetition count (e.g. exercise segment repetitions).
        public int? RepetitionCount { get; set; }

        public long RecordId { get; set; }
        [ForeignKey(nameof(RecordId))]
        public HealthConnectRecordEntity Record { get; set; } = null!;
    }
}
