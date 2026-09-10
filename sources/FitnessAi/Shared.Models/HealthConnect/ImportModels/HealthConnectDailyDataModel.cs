using Newtonsoft.Json;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectDailyDataModel
    {
        [JsonProperty("date")]
        public DateTime Date { get; set; }
        [JsonProperty("aggregatedData")]
        public HealthConnectAggregatedData AggregatedData { get; set; } = new();
        [JsonProperty("trainingData")]
        public List<HealthConnectTrainingDataRecordData> TrainingData { get; set; } = new();
    }
}