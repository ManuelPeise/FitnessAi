using Newtonsoft.Json;

namespace Shared.Models.Authentication
{
    public class ChangePasswordRequest
    {
        [JsonProperty("current_password")]
        public string CurrentPassword { get; set; } = null!;
        [JsonProperty("new_password")]
        public string NewPassword { get; set; } = null!;
    }
}
