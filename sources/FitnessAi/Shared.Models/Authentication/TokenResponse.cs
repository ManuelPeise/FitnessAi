namespace Shared.Models.Authentication
{
    public class TokenResponse
    {
        public string Token { get; set; } = null!;
        public string RefreshToken { get; set; } = null!;
        public DateTime TokenExpiresAt { get; set; }
        public string AppId { get; set; } = null!;
    }
}
