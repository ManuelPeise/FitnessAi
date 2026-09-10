using Newtonsoft.Json;
using Shared.Models.HealthConnect.RawDataModels;
namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectBloodGlucoseMetric: AHealthConnectMetricBase
    {
        [JsonProperty("level")]
        public HealthConnectBloodGlucoseLevel Level { get; set; } = new();
        [JsonProperty("specimenSource")]
        public int SpecimenSource { get; set; }
        [JsonProperty("relationToMeal")]
        public int RelationToMeal { get; set; }
        [JsonProperty("mealType")]
        public int MealType { get; set; }

    }
}
