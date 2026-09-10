using Newtonsoft.Json;
using Shared.Enums.HealthConnect;
using Shared.Models.HealthConnect.ImportModels;
using System;
using System.Collections.Generic;
using System.Text;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectTrainingDataRecordData
    {
        [JsonProperty("origin")]
        public string Origin { get; set; } = string.Empty;
        [JsonProperty("activeCaloriesBurnedInKcal")]
        public decimal? ActiveCaloriesBurnedInKcal { get; set; }
        [JsonProperty("totalCaloriesBurnedInKcal")]
        public decimal? TotalCaloriesBurnedInKcal { get; set; }
        [JsonProperty("cyclingPedalingCadence")]
        public HealthConnectValues? CyclingPedalingCadence { get; set; }
        [JsonProperty("distanceInMeters")]
        public decimal? DistanceInMeters { get; set; }
        [JsonProperty("durationSeconds")]
        public decimal? DurationSeconds { get; set; }
        [JsonProperty("elevationAvg")]
        public decimal? ElevationAvg { get; set; }
        [JsonProperty("endTime")]
        public DateTime? EndTime { get; set; }
        [JsonProperty("exerciseType")]
        public ExerciseTypeEnum ExerciseType { get; set; }
        [JsonProperty("startTime")]
        public DateTime? StartTime { get; set; }
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
    }
}