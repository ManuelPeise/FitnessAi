using Newtonsoft.Json;
using Shared.Enums.HealthConnect;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectTrainingDataRecordData
    {
        [JsonProperty("exerciseMetricId")]
        public string? ExerciseMetricId { get; set; }
        [JsonProperty("origin")]
        public string Origin { get; set; } = string.Empty;
        [JsonProperty("system")]
        public string System { get; set; } = string.Empty;
        [JsonProperty("activeCaloriesBurnedInKcal")]
        public decimal? ActiveCaloriesBurnedInKcal { get; set; }
        [JsonProperty("cyclingPedalingCadence")]
        public HealthConnectValues? CyclingPedalingCadence { get; set; }
        [JsonProperty("distanceInMeters")]
        public decimal? DistanceInMeters { get; set; }
        [JsonProperty("durationSeconds")]
        public decimal? DurationSeconds { get; set; }
        [JsonProperty("elevationAvg")]
        public decimal? ElevationAvg { get; set; }
        [JsonProperty("endTime")]
        public DateTime EndTime { get; set; }
        [JsonProperty("exerciseType")]
        public ExerciseTypeEnum ExerciseType { get; set; }
        [JsonProperty("startTime")]
        public DateTime StartTime { get; set; }
        [JsonProperty("heartRate")]
        public HealthConnectValues? HeartRate { get; set; }
        [JsonProperty("hydrationAvg")]
        public decimal? HydrationAvg { get; set; }
        [JsonProperty("power")]
        public HealthConnectValues? Power { get; set; }
        [JsonProperty("speed")]
        public HealthConnectValues? Speed { get; set; }
        [JsonProperty("restingHeartRate")]
        public HealthConnectValues? RestingHeartRate { get; set; }
        [JsonProperty("stepCadence")]
        public HealthConnectValues? StepCadence { get; set; }
        [JsonProperty("steps")]
        public decimal? Steps { get; set; }
        [JsonProperty("timeZoneInfo")]
        public HealthConnectTimeZoneModel? TimeZoneInfo { get; set; }
        [JsonProperty("weightAvg")]
        public decimal? WeightAvg { get; set; }
        [JsonProperty("bodyFatPercentageAvg")]
        public decimal? BodyFatPercentage { get; set; }
        [JsonProperty("oxygenSaturationPercentageAvg")]
        public decimal? OxygenSaturationPercentageAvg { get; set; }
        [JsonProperty("respiratoryRateAvg")]
        public decimal? RespiratoryRateAvg { get; set; }
        [JsonProperty("vo2MaxMlPerMinKgAvg")]
        public decimal? Vo2MaxMlPerMinKgAvg { get; set; }
        [JsonProperty("notes")]
        public string? Notes { get; set; }
        [JsonProperty("laps")]
        public List<HealthConnectLap> Laps { get; set; } = [];
        [JsonProperty("segments")]
        public List<HealthConnectSegment> Segments { get; set; } = [];
    }
}