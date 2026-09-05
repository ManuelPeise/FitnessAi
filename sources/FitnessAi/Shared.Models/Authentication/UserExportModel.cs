using Newtonsoft.Json;

namespace Shared.Models.Authentication
{
    public class UserExportModel
    {
        [JsonProperty("id")]
        public long Id { get; set; }
        [JsonProperty("email")]
        public string Email { get; set; } = null!;
        [JsonProperty("created_at")]
        public string? CreatedAt { get; set; }
        [JsonProperty("updated_at")]
        public string? UpdatedAt { get; set; }
    }
}
