using Newtonsoft.Json;

namespace Shared.Models.Authentication
{
    public class UpdateUserProfileRequest
    {
        [JsonProperty("first_name")]
        public string FirstName { get; set; } = null!;
        [JsonProperty("last_name")]
        public string LastName { get; set; } = null!;
        [JsonProperty("height")]
        public decimal? Height { get; set; }
        [JsonProperty("weight")]
        public decimal? Weight { get; set; }
        [JsonProperty("body_fat_percentage_avg")]
        public decimal? BodyFatPercentageAvg { get; set; }
        [JsonProperty("waist")]
        public decimal? Waist { get; set; }
        [JsonProperty("abdomen")]
        public decimal? Abdomen { get; set; }
        [JsonProperty("shoulder_width")]
        public decimal? ShoulderWidth { get; set; }
    }
}
