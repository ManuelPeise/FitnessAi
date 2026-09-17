using Newtonsoft.Json;
using Shared.Enums.Ai;

namespace Shared.Models.HealthConnect.QueryModels
{
    public class TrainingDataUpdateRequest
    {
        [JsonProperty("id")]
        public long Id { get; set; }
        [JsonProperty("durationSeconds")]
        public decimal? DurationSeconds { get; set; }
        [JsonProperty("distanceInMeters")]
        public decimal? DistanceInMeters { get; set; }
        [JsonProperty("elevationAvg")]
        public decimal? ElevationAvg { get; set; }
        [JsonProperty("steps")]
        public decimal? Steps { get; set; }
        [JsonProperty("stepCadenceAvg")]
        public decimal? StepCadenceAvg { get; set; }
        [JsonProperty("speedAvg")]
        public decimal? SpeedAvg { get; set; }
        [JsonProperty("cyclingPedalingCadenceAvg")]
        public decimal? CyclingPedalingCadenceAvg { get; set; }
        [JsonProperty("heartRateMin")]
        public decimal? HeartRateMin { get; set; }
        [JsonProperty("heartRateMax")]
        public decimal? HeartRateMax { get; set; }
        [JsonProperty("heartRateAvg")]
        public decimal? HeartRateAvg { get; set; }
        [JsonProperty("powerAvg")]
        public decimal? PowerAvg { get; set; }
        [JsonProperty("oxygenSaturationPercentage")]
        public decimal? OxygenSaturationPercentage { get; set; }
        [JsonProperty("activeCaloriesBurnedInKcal")]
        public decimal? ActiveCaloriesBurnedInKcal { get; set; }
        [JsonProperty("vo2MaxMlPerMinKgAvg")]
        public decimal? Vo2MaxMlPerMinKgAvg { get; set; }
        [JsonProperty("workoutIntensity")]
        public WorkoutIntensityEnum? WorkoutIntensity { get; set; }
    }
}
