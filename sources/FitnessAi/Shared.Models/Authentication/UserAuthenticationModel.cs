

namespace Shared.Models.Authentication
{
    public class UserAuthenticationModel
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
    }

    public class SyncClientAuthenticationModel: UserAuthenticationModel
    {
        
    }
}
