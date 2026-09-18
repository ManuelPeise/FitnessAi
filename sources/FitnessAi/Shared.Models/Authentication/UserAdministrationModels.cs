using Newtonsoft.Json;
using Shared.Enums.Authentication;

namespace Shared.Models.Authentication
{
    public class UserAdministrationListItemModel
    {
        [JsonProperty("id")]
        public long Id { get; set; }
        [JsonProperty("first_name")]
        public string FirstName { get; set; } = null!;
        [JsonProperty("last_name")]
        public string LastName { get; set; } = null!;
        [JsonProperty("email")]
        public string Email { get; set; } = null!;
        [JsonProperty("is_active")]
        public bool IsActive { get; set; }
        [JsonProperty("deleted_at")]
        public DateTime? DeletedAt { get; set; }
        [JsonProperty("user_role")]
        public UserRoleEnum UserRole { get; set; }
    }

    public class UserAdministrationDetailsModel
    {
        [JsonProperty("id")]
        public long Id { get; set; }
        [JsonProperty("first_name")]
        public string FirstName { get; set; } = null!;
        [JsonProperty("last_name")]
        public string LastName { get; set; } = null!;
        [JsonProperty("email")]
        public string Email { get; set; } = null!;
        [JsonProperty("is_active")]
        public bool IsActive { get; set; }
        [JsonProperty("deleted_at")]
        public DateTime? DeletedAt { get; set; }
        [JsonProperty("user_role")]
        public UserRoleEnum UserRole { get; set; }
        [JsonProperty("created_at")]
        public DateTime CreatedAt { get; set; }
    }

    public class UpdateUserRolesRequest
    {
        [JsonProperty("user_role")]
        public UserRoleEnum UserRole { get; set; }
    }

    public class UpdateUserActiveStateRequest
    {
        [JsonProperty("is_active")]
        public bool IsActive { get; set; }
    }
}
