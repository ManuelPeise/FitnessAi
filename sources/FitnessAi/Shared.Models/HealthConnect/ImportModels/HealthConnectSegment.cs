using Newtonsoft.Json;
using Shared.Enums.HealthConnect;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectSegment
    {
        [JsonProperty("segmentType")]
        public ExerciseSegmentType SegmentType { get; set; }
        [JsonProperty("repetitions")]
        public int Repetitions { get; set; }
        [JsonProperty("startTime")]
        public DateTime StartTime { get; set; }
        [JsonProperty("endTime")]
        public DateTime EndTime { get; set; }
    }
}
