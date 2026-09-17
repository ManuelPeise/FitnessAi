using Newtonsoft.Json;
using Shared.Enums.HealthConnect;

namespace Shared.Models.HealthConnect.QueryModels
{
    public class TrainingDataQueryResult
    {
        [JsonProperty("items")]
        public List<TrainingDataListItem> Items { get; set; } = [];
        [JsonProperty("totalCount")]
        public int TotalCount { get; set; }
        [JsonProperty("availableExerciseTypes")]
        public List<ExerciseTypeEnum> AvailableExerciseTypes { get; set; } = [];
    }
}
