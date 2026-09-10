using Newtonsoft.Json;
using Shared.Models.HealthConnect.ImportModels;

namespace Shared.Models.HealthConnect
{
    public class HealthConnectRecordsWrapper<TModel> where TModel : AHealthConnectMetricBase
    {
        [JsonProperty("records")]
        public List<TModel> Records { get; set; } = new List<TModel>();
    }
}
