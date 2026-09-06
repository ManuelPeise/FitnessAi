using Data.Database.Entities.User;

namespace Shared.Interfaces.Authentication
{
    public interface IJwtTokenService
    {
        string CreateAccessToken(UserEntity user, DateTime nowUtc);
        string CreateRefreshToken();
    }
}
