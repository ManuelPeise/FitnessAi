using Newtonsoft.Json;
using Shared.Enums.Ai;

namespace Shared.Models.HealthConnect.QueryModels
{
    public class TrainingDataPrediction
    {
        [JsonProperty("id")]
        public long Id { get; set; }
        [JsonProperty("workoutIntensity")]
        public WorkoutIntensityEnum WorkoutIntensity { get; set; }
    }
}
