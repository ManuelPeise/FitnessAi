using Newtonsoft.Json;
using Shared.Enums.HealthConnect;

namespace Shared.Models.HealthConnect.RawDataModels
{
    public class HealthConnectSegment
    {
        [JsonProperty("segmentType")]
        public ExerciseSegmentType SegmentType { get; set; }
        [JsonProperty("repetitions")]
        public int Repetitions { get; set; }
        [JsonProperty("endTime")]
        public DateTimeOffset EndTime { get; set; }
        [JsonProperty("startTime")]
        public DateTimeOffset StartTime { get; set; }
    }
}