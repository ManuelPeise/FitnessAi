using Shared.Models.Authentication;

namespace Logic.Services.Interfaces
{
    public interface IAuthenticationService
    {
        Task<TokenResponse?> AuthenticateUser(UserAuthenticationModel model);
        Task<TokenResponse?> AuthenticateUserOnMobile(UserAuthenticationModel model);
        Task<TokenResponse?> AuthenticateSyncClient(SyncClientAuthenticationModel model);
        Task<TokenResponse?> RefreshToken(string refreshToken);
    }
}
