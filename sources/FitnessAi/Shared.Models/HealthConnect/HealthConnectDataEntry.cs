using Shared.Enums.HealthConnect;

namespace Shared.Models.HealthConnect
{
    public class HealthConnectDataEntry
    {
        public string RecordId { get; set; } = string.Empty;
        public string? ExerciseId { get; set; }
        public string Origin { get; set; } = string.Empty;
        public HealthConnectRecordTypeEnum Type { get; set; }
        public HealthConnectDataUnitEnum Unit { get; set; }
        /// <summary>
        /// Type of exercise associated with the exercise session
        /// </summary>
        public ExerciseTypeEnum? ExerciseType { get; set; }
        public decimal Value { get; set; }
        public string StartTimestamp { get; set; } = string.Empty;
        public string EndTimestamp { get; set; } = string.Empty;
    }
}