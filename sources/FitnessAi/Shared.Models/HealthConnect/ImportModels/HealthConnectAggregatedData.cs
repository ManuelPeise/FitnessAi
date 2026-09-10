using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectAggregatedData
    {
        [JsonProperty("source")]
        public string Source { get; set; } = string.Empty;
        [JsonProperty("endTime")]
        public DateTime? EndTime { get; set; }
        [JsonProperty("startTime")]
        public DateTime? StartTime { get; set; }
        [JsonProperty("activeCaloriesBurnedInKcal")]
        public decimal? ActiveCaloriesBurnedInKcal { get; set; }
        [JsonProperty("totalCaloriesBurnedInKcal")]
        public decimal? TotalCaloriesBurnedInKcal { get; set; }
        [JsonProperty("heartRate")]
        public HealthConnectValues? HeartRate { get; set; }
        [JsonProperty("hydrationAvg")]
        public decimal? HydrationAvg { get; set; }
        [JsonProperty("restingHeartRate")]
        public HealthConnectValues? RestingHeartRate { get; set; }
        [JsonProperty("steps")]
        public decimal? Steps { get; set; }
        [JsonProperty("weightAvg")]
        public decimal? WeightAvg { get; set; }
        [JsonProperty("sleepDurationInSeconds")]
        public decimal? SleepDurationInSeconds { get; set; }
        [JsonProperty("floorsClimbed")]
        public decimal? FloorsClimbed { get; set; }
        [JsonProperty("basalMetabolicRateInKcal")]
        public decimal? BasalMetabolicRateInKcal { get; set; }
        [JsonProperty("bloodPressure")]
        public HealthConnectBloodPressure? BloodPressure { get; set; }
        [JsonProperty("wheelchairPushes")]
        public decimal? WheelchairPushes { get; set; }
        [JsonProperty("heightInMeters")]
        public decimal? HeightInMeters { get; set; }
    }
}